// us-city-population-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"us-city-population-neo-g10","class":"us-city-population","generation":10,"lane":"neo","grownFrom":["tell me the population of Colorado Springs, Colorado","what is the population of Castle Rock, Colorado","give the population of Haltom City, Texas","tell me the population of Denver, Colorado","what is the population of Lake Charles, Louisiana","give the population of Rochester, Minnesota","what is the population of Redmond, Washington","tell me the population of Mountain View, California","tell me the population of Findlay, Ohio","give the population of Casa Grande, Arizona","what is the population of Mansfield, Texas","give the population of Glendale, California","tell me the population of Wilson, North Carolina","give the population of Stockton, California","what is the population of Fort Pierce, Florida","give the population of Pontiac, Michigan","what is the population of Pico Rivera, California","tell me the population of Duluth, Minnesota","what is the population of Florissant, Missouri","what is the population of Levittown, New York"],"version":1});

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
knowLoad([{"id":"corpora-us-city-population","columns":["city, state","population"],"n":1000,"cols":[{"f":"0Fayetteville, Arkansas|0San Ramon, California|0Waldorf, Maryland|0Palo Alto, California|0West New York, New Jersey|0Bell Gardens, California|0Rancho Palos Verdes, California|0Abilene, Texas|1kron, Ohio|1lafaya, Florida|3meda, California|2bany, Georgia|8New York|8Oregon|3uquerque, New Mexico|2exandria, Louisiana|cVirginia|2hambra, California|2iso Viejo, California|2len, Texas|5town, Pennsylvania|2oha, Oregon|2pharetta, Georgia|2tadena, California|4monte Springs, Florida|3oona, Pennsylvania|1marillo, Texas|2es, Iowa|1naheim, California|2chorage, Alaska|2derson, Indiana|2keny, Iowa|2n Arbor, Michigan|3andale, Virginia|2telope, California|3ioch, California|1pex, North Carolina|2opka, Florida|2ple Valley, California|eMinnesota|5ton, Wisconsin|1rcadia, California|2den-Arcade, California|2ecibo, Puerto Rico|2lington Heights, Illinois|9, Massachusetts|bTexas|bVirginia|2vada, Colorado|1shburn, Virginia|3eville, North Carolina|2pen Hill, Maryland|1tascocita, Texas|2hens-Clarke County, Georgia|2lanta, Georgia|2tleboro, Massachusetts|1uburn, Alabama|8Washington|2gusta-Richmond County, Georgia|2rora, Colorado|8Illinois|2stin, Texas|1vondale, Arizona|1zusa, California|0Bakersfield, California|2ldwin Park, California|3timore, Maryland|2rnstable Town, Massachusetts|3tlett, Illinois|aTennessee|2ton Rouge, Louisiana|3tle Creek, Michigan|2yamon, Puerto Rico|3onne, New Jersey|3town, Texas|1eaumont, California|aTexas|3vercreek, Ohio|6ton, Oregon|2dford, Texas|2l Air South, Maryland|3leville, Illinois|6ue, Nebraska|aWashington|4flower, California|4ingham, Washington|2nd, Oregon|3tonville, Arkansas|2rkeley, California|3wyn, Illinois|2thesda, Maryland|4lehem, Pennsylvania|1illings, Montana|3oxi, Mississippi|2nghamton, New York|2rmingham, Alabama|2smarck, North Dakota|1lacksburg, Virginia|3ine, Minnesota|2oomington, Illinois|endiana|dMinnesota|2ue Springs, Missouri|1oca Raton, Florida|2ise City, Idaho|2lingbrook, Illinois|2nita Springs, Florida|2ssier City, Louisiana|3ton, Massachusetts|2thell, Washington|2ulder, Colorado|3ntiful, Utah|2wie, Maryland|3ling Green, Kentucky|2ynton Beach, Florida|2zeman, Montana|1radenton, Florida|3ndon, Florida|2entwood, California|bNew York|2idgeport, Connecticut|3stol, Connecticut|2ockton, Massachusetts|3ken Arrow, Oklahoma|3okhaven, Georgia|5line, Massachusetts|6yn Park, Minnesota|4mfield, Colorado|3wnsville, Texas|2yan, Texas|1uckeye, Arizona|2ena Park, California|2ffalo Grove, Illinois|7, New York|2rbank, California|3ien, Washington|3ke, Virginia|3leson, Texas|4ington, North Carolina|cVermont|3nsville, Minnesota|0Caguas, Puerto Rico|2ldwell, Idaho|2marillo, California|3bridge, Massachusetts|3den, New Jersey|2nton, Ohio|2pe Coral, Florida|2rlsbad, California|3mel, Indiana|4ichael, California|3olina, Puerto Rico|3rollton, Texas|3son City, Nevada|6, California|3y, North Carolina|2sa Grande, Arizona|4s Adobes, Arizona|3per, Wyoming|3tle Rock, Colorado|4ro Valley, California|2talina Foothills, Arizona|3hedral City, California|3onsville, Maryland|1edar Hill, Texas|6Park, Texas|6Rapids, Iowa|2ntennial, Colorado|4reville, Virginia|2res, California|3ritos, California|1hampaign, Illinois|3ndler, Arizona|3pel Hill, North Carolina|3rleston, South Carolina|cWest Virginia|5otte, North Carolina|9sville, Virginia|3ttanooga, Tennessee|2eektowaga, New York|3sapeake, Virginia|4terfield, Missouri|3yenne, Wyoming|2icago, Illinois|4o, California|5pee, Massachusetts|3no Hills, California|5, California|2ula Vista, California|1icero, Illinois|2ncinnati, Ohio|2trus Heights, California|1larksville, Tennessee|2earwater, Florida|3veland Heights, Ohio|9, Ohio|bTennessee|2ifton, New Jersey|2ovis, California|1oachella, California|2conut Creek, Florida|2eur d'Alene, Idaho|2llege Station, Texas|4ierville, Tennessee|3orado Springs, Colorado|3ton, California|3umbia, Maryland|bissouri|aSouth Carolina|6us, Georgia|aIndiana|aOhio|2mmerce City, Colorado|3pton, California|2ncord, California|9New Hampshire|aorth Carolina|3roe, Texas|3way, Arkansas|2on Rapids, Minnesota|2ral Gables, Florida|6Springs, Florida|3ona, California|3pus Christi, Texas|3vallis, Oregon|2sta Mesa, California|2uncil Bluffs, Iowa|4try Club, Florida|2vina, California|1ranston, Rhode Island|1upertino, California|2tler Bay, Florida|2yahoga Falls, Ohio|1ypress, California|0Dale City, Virginia|3las, Texas|3y City, California|2nbury, Connecticut|3ville, California|aVirginia|2venport, Iowa|3ie, Florida|4s, California|2yton, Ohio|6a Beach, Florida|1eKalb, Illinois|2Soto, Texas|2arborn Heights, Michigan|8, Michigan|2catur, Alabama|9Illinois|2erfield Beach, Florida|2lano, California|3ray Beach, Florida|3tona, Florida|2nton, Texas|3ver, Colorado|2s Moines, Iowa|4Plaines, Illinois|2troit, Michigan|1iamond Bar, California|1oral, Florida|2than, Alabama|2wners Grove, Illinois|5y, California|1raper, Utah|1ublin, California|8Ohio|3uque, Iowa|2luth, Minnesota|2ndalk, Maryland|3woody, Georgia|2rham, North Carolina|0Eagan, Minnesota|2st Hartford, Connecticut|6onolulu, Hawaii|5Lansing, Michigan|6os Angeles, California|5Orange, New Jersey|5Providence, Rhode Island|4vale, California|2u Claire, Wisconsin|1den Prairie, Minnesota|2ina, Minnesota|4burg, Texas|2mond, Oklahoma|1l Cajon, California|4entro, California|3Dorado Hills, California|3Monte, California|3Paso, Texas|2gin, Illinois|2izabeth, New Jersey|2k Grove, California|3hart, Indiana|2licott City, Maryland|2mhurst, Illinois|2yria, Ohio|1ncinitas, California|2id, Oklahoma|2terprise, Nevada|1rie, Pennsylvania|1scondido, California|1uclid, Ohio|2gene, Oregon|2less, Texas|1vanston, Illinois|5ville, Indiana|2erett, Massachusetts|9Washington|0Fairfield, California|bOhio|2ll River, Massachusetts|2rgo, North Dakota|3mington Hills, Michigan|a, New Mexico|2yetteville, North Carolina|1ederal Way, Washington|1indlay, Ohio|2shers, Indiana|1lagstaff, Arizona|2int, Michigan|2orence-Graham, California|4in, California|5ssant, Missouri|3wer Mound, Texas|1olsom, California|2nd du Lac, Wisconsin|3tana, California|2rt Collins, Colorado|5Lauderdale, Florida|5Myers, Florida|5Pierce, Florida|5Smith, Arkansas|5Wayne, Indiana|6orth, Texas|2untain Valley, California|8ebleau, Florida|1ramingham, Massachusetts|3nklin, Tennessee|2ederick, Maryland|3eport, New York|3mont, California|3sno, California|2isco, Texas|1ullerton, California|0Gainesville, Florida|3thersburg, Maryland|2lveston, Texas|2rden Grove, California|6a, California|3land, Texas|3y, Indiana|2stonia, North Carolina|1eorgetown, Texas|2rmantown, Maryland|1ilbert, Arizona|3roy, California|1len Burnie, Maryland|4dale, Arizona|aCalifornia|5ora, California|4view, Illinois|1oodyear, Arizona|1rand Forks, North Dakota|6Island, Nebraska|6Junction, Colorado|6Prairie, Texas|6Rapids, Michigan|3pevine, Texas|2eat Falls, Montana|3eley, Colorado|4n Bay, Wisconsin|5sboro, North Carolina|5ville, North Carolina|cSouth Carolina|5wood, Indiana|3sham, Oregon|1uaynabo, Puerto Rico|2lfport, Mississippi|0Hacienda Heights, California|3kensack, New Jersey|2ltom City, Texas|2milton, Ohio|3mond, Indiana|3pton, Virginia|2nford, California|2rlingen, Texas|3risburg, Pennsylvania|6onburg, Virginia|3tford, Connecticut|2ttiesburg, Mississippi|2verhill, Massachusetts|2wthorne, California|2yward, California|1emet, California|3pstead, New York|2nderson, Nevada|9ville, Tennessee|2speria, California|1ialeah, Florida|2cksville, New York|2gh Point, North Carolina|4land, California|8s Ranch, Colorado|2llsboro, Oregon|3o, Hawaii|1oboken, New Jersey|2ffman Estates, Illinois|2llywood, Florida|2mestead, Florida|2nolulu, Hawaii|2over, Alabama|2uston, Texas|1untersville, North Carolina|4ington Beach, California|bPark, California|a, West Virginia|4sville, Alabama|2tchinson, Kansas|0Idaho Falls, Idaho|1ndependence, Missouri|3ianapolis, Indiana|4o, California|2glewood, California|1owa City, Iowa|1rondequoit, New York|2vine, California|5g, Texas|0Jackson, Mississippi|9Tennessee|7ville, Florida|eNorth Carolina|2nesville, Wisconsin|1efferson City, Missouri|9ville, Indiana|2rsey City, New Jersey|1ohns Creek, Georgia|5on City, Tennessee|2liet, Illinois|2nesboro, Arkansas|2plin, Missouri|1upiter, Florida|2rupa Valley, California|0Kalamazoo, Michigan|2nnapolis, North Carolina|3sas City, Kansas|dMissouri|1earny, New Jersey|2ller, Texas|2ndale Lakes, Florida|6l, Florida|3ner, Louisiana|5wick, Washington|3osha, Wisconsin|3t, Washington|4wood, Michigan|2ttering, Ohio|1illeen, Texas|2ngsport, Tennessee|2rkland, Washington|2ssimmee, Florida|1noxville, Tennessee|1okomo, Indiana|0La Crosse, Wisconsin|3Habra, California|3Mesa, California|4irada, California|2cey, Washington|2fayette, Indiana|bLouisiana|2guna Niguel, California|2ke Charles, Louisiana|5Elsinore, California|5Forest, California|5Havasu City, Arizona|5Ridge, Virginia|4land, Florida|4ville, Minnesota|4wood, California|bolorado|aNew Jersey|aOhio|aWashington|2ncaster, California|bPennsylvania|3sing, Michigan|2redo, Texas|3go, Florida|2s Cruces, New Mexico|4Vegas, Nevada|2uderhill, Florida|2wrence, Indiana|aKansas|aMassachusetts|3ton, Oklahoma|2yton, Utah|1eague City, Texas|2e's Summit, Missouri|3sburg, Virginia|2hi, Utah|4gh Acres, Florida|2nexa, Kansas|2vittown, New York|bPennsylvania|2wisville, Texas|2xington-Fayette, Kentucky|1incoln, California|9Nebraska|3den, New Jersey|2ttle Rock, Arkansas|6ton, Colorado|2vermore, California|3onia, Michigan|1odi, California|2gan, Utah|2mbard, Illinois|3poc, California|2ng Beach, California|4mont, Colorado|4view, Texas|2rain, Ohio|2s Angeles, California|2uisville/Jefferson County, Kentucky|2veland, Colorado|2well, Massachusetts|1ubbock, Texas|1ynchburg, Virginia|3n, Massachusetts|3wood, California|0Macon-Bibb County, Georgia|2dera, California|3ison, Alabama|9Wisconsin|2lden, Massachusetts|2nchester, New Hampshire|3hattan, Kansas|3sfield, Ohio|bTexas|3teca, California|2ple Grove, Minnesota|2rgate, Florida|3icopa, Arizona|4etta, Georgia|3ysville, Washington|2yaguez, Puerto Rico|1cAllen, Texas|2Kinney, Texas|2Lean, Virginia|1edford, Massachusetts|9Oregon|2lbourne, Florida|2mphis, Tennessee|2nifee, California|3tor, Ohio|2rced, California|3iden, Connecticut|5ian, Idaho|2sa, Arizona|3quite, Texas|2tairie, Louisiana|3huen Town, Massachusetts|1iami Beach, Florida|6Gardens, Florida|5, Florida|2ddletown, Connecticut|cOhio|3land, Michigan|9Texas|3west City, Oklahoma|2lford, Connecticut|3lcreek, Utah|3pitas, California|3waukee, Wisconsin|2nneapolis, Minnesota|5tonka, Minnesota|3ot, North Dakota|2ramar, Florida|2shawaka, Indiana|3sion Viejo, California|7, Texas|4oula, Montana|6ri City, Texas|1obile, Alabama|2desto, California|2line, Illinois|2nroe, Louisiana|3tebello, California|5rey Park, California|4gomery, Alabama|2ore, Oklahoma|2reno Valley, California|3gan Hill, California|2unt Pleasant, South Carolina|7rospect, Illinois|6Vernon, New York|5ain View, California|1uncie, Indiana|2rfreesboro, Tennessee|3ray, Utah|4ieta, California|0Nampa, Idaho|2pa, California|3erville, Illinois|2shua, New Hampshire|4ville-Davidson, Tennessee|2tional City, California|1ew Bedford, Massachusetts|5raunfels, Texas|6itain, Connecticut|6unswick, New Jersey|4Haven, Connecticut|4Orleans, Louisiana|4Rochelle, New York|4York, New York|3ark, California|8New Jersey|8Ohio|3port Beach, California|8News, Virginia|3ton, Massachusetts|1iagara Falls, New York|1oblesville, Indiana|2rfolk, Virginia|3mal, Illinois|5n, Oklahoma|3th Bethesda, Maryland|6Charleston, South Carolina|6Highlands, California|6Las Vegas, Nevada|8uderdale, Florida|7ittle Rock, Arkansas|6Miami Beach, Florida|b, Florida|6Port, Florida|6Richland Hills, Texas|3walk, California|aonnecticut|2vato, California|3i, Michigan|0O'Fallon, Missouri|1ak Lawn, Illinois|4Park, Illinois|3land Park, Florida|7, California|1cala, Florida|2eanside, California|1dessa, Texas|1gden, Utah|1klahoma City, Oklahoma|1lathe, Kansas|2ympia, Washington|1maha, Nebraska|1ntario, California|1range, California|2em, Utah|2land Park, Illinois|6o, Florida|2o Valley, Arizona|1shkosh, Wisconsin|1verland Park, Kansas|1wensboro, Kentucky|1xnard, California|0Palatine, Illinois|3m Bay, Florida|6each Gardens, Florida|5Coast, Florida|5Desert, California|5Harbor, Florida|5Springs, California|4dale, California|2radise, Nevada|4mount, California|3ker, Colorado|3ma, Ohio|2sadena, California|aTexas|3co, Washington|3saic, New Jersey|2terson, New Jersey|2wtucket, Rhode Island|1eabody, Massachusetts|3rl City, Hawaii|5and, Texas|2mbroke Pines, Florida|2nsacola, Florida|2oria, Arizona|8Illinois|2rris, California|3th Amboy, New Jersey|2taluma, California|1flugerville, Texas|1harr, Texas|2iladelphia, Pennsylvania|2oenix, Arizona|1ico Rivera, California|2ne Bluff, Arkansas|5Hills, Florida|4llas Park, Florida|2ttsburg, California|9h, Pennsylvania|5field, Massachusetts|1lacentia, California|3infield, Illinois|cNew Jersey|3no, Texas|4tation, Florida|2easanton, California|2ymouth, Minnesota|1ocatello, Idaho|2inciana, Florida|2mona, California|3pano Beach, Florida|2nce, Puerto Rico|3tiac, Michigan|2rt Arthur, Texas|5Charlotte, Florida|5Orange, Florida|5St. Lucie, Florida|4age, Michigan|4erville, California|4land, Maine|aOregon|4smouth, Virginia|2tomac, Maryland|2way, California|1rovidence, Rhode Island|4o, Utah|1ueblo, Colorado|0Quincy, Massachusetts|0Racine, Wisconsin|2leigh, North Carolina|2ncho Cordova, California|8ucamonga, California|7Santa Margarita, California|2pid City, South Dakota|1eading, Pennsylvania|2dding, California|3lands, California|3mond, Washington|3ondo Beach, California|3wood City, California|2no, Nevada|3ton, Washington|2ston, Virginia|2vere, Massachusetts|1ialto, California|2chardson, Texas|4land, Washington|4mond, California|aVirginia|2o Rancho, New Mexico|2verside, California|5ton, Utah|5view, Florida|1oanoke, Virginia|2chester Hills, Michigan|9, Minnesota|bNew York|3k Hill, South Carolina|4ford, Illinois|4lin, California|4ville, Maryland|4wall, Texas|4y Mount, North Carolina|2gers, Arkansas|2hnert Park, California|2semead, California|4ville, California|bMichigan|3well, Georgia|9New Mexico|2und Rock, Texas|2wland Heights, California|4ett, Texas|2yal Oak, Michigan|0Sacramento, California|2ginaw, Michigan|2lem, Massachusetts|7Oregon|3ina, Kansas|6s, California|3t Lake City, Utah|2mmamish, Washington|2n Angelo, Texas|6tonio, Texas|4Bernardino, California|5runo, California|5uenaventura (Ventura), California|4Clemente, California|4Diego, California|4Francisco, California|4Jacinto, California|5ose, California|5uan, Puerto Rico|4Leandro, California|5uis Obispo, California|4Marcos, California|cTexas|6teo, California|4Rafael, California|4Tan Valley, Arizona|3dy Springs, Georgia|5, Utah|3ford, Florida|3ta Ana, California|6Barbara, California|6Clara, California|aita, California|7ruz, California|6Fe, New Mexico|6Maria, California|7onica, California|6Rosa, California|4ee, California|2rasota, Florida|2vannah, Georgia|2yreville, New Jersey|1chaumburg, Illinois|3enectady, New York|2ottsdale, Arizona|2ranton, Pennsylvania|1eattle, Washington|2vern, Maryland|1hawnee, Kansas|2eboygan, Wisconsin|2oreline, Washington|2reveport, Louisiana|1ierra Vista, Arizona|2lver Spring, Maryland|2mi Valley, California|2oux City, Iowa|6Falls, South Dakota|1kokie, Illinois|1myrna, Georgia|8Tennessee|1omerville, Massachusetts|2uth Bend, Indiana|6Gate, California|6Hill, Washington|6Jordan, Utah|6San Francisco, California|6Valley, New Mexico|6Whittier, California|5aven, Mississippi|5field, Michigan|1parks, Nevada|2okane Valley, Washington|7, Washington|2ring Hill, Florida|7Valley, Nevada|6, Texas|6dale, Arkansas|6field, Illinois|dMassachusetts|eissouri|dOhio|eregon|1t. Charles, Missouri|5lair Shores, Michigan|6oud, Florida|bMinnesota|4George, Utah|4Joseph, Missouri|4Louis Park, Minnesota|9, Missouri|4Paul, Minnesota|5eters, Missouri|aburg, Florida|2amford, Connecticut|3te College, Pennsylvania|2erling Heights, Michigan|2illwater, Oklahoma|2ockton, California|2ratford, Connecticut|3ongsville, Ohio|1uffolk, Virginia|2gar Land, Texas|2mmerville, South Carolina|2nnyvale, California|3rise Manor, Nevada|7, Florida|2rprise, Arizona|1yracuse, New York|0Tacoma, Washington|2llahassee, Florida|2marac, Florida|3iami, Florida|3pa, Florida|2unton, Massachusetts|2ylor, Michigan|6sville, Utah|1emecula, California|3pe, Arizona|4le, Texas|2rre Haute, Indiana|2xas City, Texas|1he Hammocks, Florida|4Villages, Florida|4Woodlands, Texas|2ornton, Colorado|3usand Oaks, California|1igard, Oregon|2nley Park, Illinois|2tusville, Florida|1oledo, Ohio|2ms River, New Jersey|2nawanda, New York|2peka, Kansas|2rrance, California|2wn 'n' Country, Florida|3son, Maryland|1racy, California|2enton, New Jersey|2oy, Michigan|6New York|2ujillo Alto, Puerto Rico|1uckahoe, Virginia|3son, Arizona|2lare, California|3sa, Oklahoma|2rlock, California|2scaloosa, Alabama|3tin, California|1win Falls, Idaho|1yler, Texas|0Union City, California|cNew Jersey|3versity, Florida|1pland, California|1rbana, Illinois|5dale, Iowa|1tica, New York|0Vacaville, California|2ldosta, Georgia|3lejo, California|2ncouver, Washington|1ictoria, Texas|6ville, California|2neland, New Jersey|2rginia Beach, Virginia|2salia, California|3ta, California|0Waco, Texas|2ipahu, Hawaii|2lnut Creek, California|3tham, Massachusetts|2rner Robins, Georgia|3ren, Michigan|3wick, Rhode Island|2shington, District of Columbia|2terbury, Connecticut|5loo, Iowa|3sonville, California|2ukegan, Illinois|5sha, Wisconsin|3watosa, Wisconsin|1ellington, Florida|2sley Chapel, Florida|3t Allis, Wisconsin|5Babylon, New York|5Covina, California|5Des Moines, Iowa|5Hartford, Connecticut|7ven, Connecticut|5Jordan, Utah|5Lafayette, Indiana|5Palm Beach, Florida|5Sacramento, California|6eneca, New York|5Valley City, Utah|4field, Massachusetts|4land, Michigan|4minster, California|eolorado|4on, Florida|2ymouth Town, Massachusetts|1heaton, Illinois|9Maryland|2ite Plains, New York|4tier, California|1ichita Falls, Texas|7, Kansas|2lmington, Delaware|cNorth Carolina|3son, North Carolina|2nston-Salem, North Carolina|1oodbury, Minnesota|4land, California|2rcester, Massachusetts|1ylie, Texas|2oming, Michigan|0Yakima, Washington|1onkers, New York|2rba Linda, California|3k, Pennsylvania|2ungstown, Ohio|1uba City, California|2caipa, California|2ma, Arizona","sep":"|"},{"s":"80552|74366|72413|66649|52407|42805|42412|122612|198508|86868|77409|75657|98425|51919|556859|48044|151473|84866|50219|94710|119624|54908|63013|45001|42557|45209|197570|64073|346776|299321|55342|53413|118087|43158|48325|108675|43893|47023|71455|50602|73446|57755|96898|42412|75721|44408|383899|226092|113532|49692|87531|52028|72713|120813|456378|44121|60318|75607|196784|351131|200907|907779|80631|48498|367555|76511|621000|44498|41475|58318|228694|51763|173550|65772|75310|42191|117729|46086|94865|48864|47480|42729|52993|136718|77687|84462|84416|42499|118585|56414|62608|75110|109089|45271|46277|212424|68981|43973|61210|78368|83093|85080|53641|91702|218677|74320|49807|67152|658279|43153|105420|43428|57633|62824|72748|41761|52985|109784|56923|61438|147022|60437|94813|104869|51567|59180|78823|62449|182110|80552|59310|82771|41554|258989|104583|50187|42290|41962|52570|42556|61158|78225|50288|66630|108757|76005|72163|170063|112008|86940|63631|147806|129266|54412|92780|155822|51571|68695|59397|53789|62825|51329|53268|42027|47457|63551|129537|107862|73084|47231|49797|84672|242131|59005|129888|50210|808834|45538|175462|74673|233194|47717|62879|2714017|89377|56100|77266|83670|260598|83972|298011|85954|146281|111747|45160|389165|43276|85578|102148|43826|57731|47842|104684|48005|448759|53856|103439|117165|132537|200303|46474|837038|51731|97740|126938|42634|85753|74482|64184|62159|50533|127673|161614|320050|55766|112439|62326|49815|48539|80882|60297|44002|49353|48978|73384|1278433|105543|83890|43758|42360|102305|98717|66886|141143|64105|43269|51854|56329|95520|55419|74063|78642|52538|65044|87387|128421|663303|212859|58755|683443|56456|53426|68066|49555|113223|46399|54523|43874|58535|86164|62337|48128|251761|65874|50834|47957|48395|124191|64621|47260|58217|67654|63206|49976|84399|88342|102894|43699|43495|115665|678058|111919|128042|163634|52378|70780|45742|53928|62160|50891|129620|100157|149912|47863|161649|53675|75472|120156|44636|106580|110953|42640|88902|115950|81154|44067|203670|93986|41412|85887|69270|98918|63390|49486|52218|69966|74960|43018|205228|157251|175153|71051|43883|87712|260954|815930|56670|57357|70743|70625|68229|43217|227934|513807|145646|139491|128610|66104|49443|174676|59898|234810|77858|73877|59436|90494|226832|52576|69060|239943|197895|51285|46559|72629|55831|50895|60630|185631|193887|50538|59479|98975|104951|282177|89745|62776|54564|110042|71667|71265|54033|44271|43864|62259|78349|136789|54912|65634|49160|51979|124320|46846|62340|86938|154507|82748|55454|277872|55073|92664|235626|42856|108982|54490|106596|100462|45579|53136|51727|148114|65688|349597|84100|2240582|51701|198724|58921|48735|188973|41661|58933|117217|846674|85401|111012|72385|51135|246992|232013|172039|67162|856616|68404|63880|43143|46415|261666|82930|65415|147515|72638|51231|60597|100737|75885|45685|149755|471767|42029|44250|59217|74559|66954|77975|99865|125492|50761|55720|138745|52871|85812|66840|183927|58075|52140|61660|59125|49130|45644|71249|125808|64984|75044|60230|80658|53058|44685|102714|59786|81054|149793|54679|50866|59489|159651|59341|114773|251671|80678|101459|613295|70452|47415|92611|79337|96728|72413|94976|94257|49401|56314|112279|51206|51073|52407|102327|311529|45675|273018|41595|197640|45072|86493|94849|63842|49539|44025|43678|469793|90719|82184|63714|3918872|611573|73360|109871|244507|78755|92074|71233|153925|63398|46396|246034|60732|110231|55909|46902|63141|73570|66969|56245|45473|59714|64955|65396|138475|156821|48867|57180|78856|78911|655857|84978|46896|81461|60203|88247|470456|143771|144772|49043|91784|112514|432622|46933|48527|42063|128051|56930|52005|61191|73447|598672|404670|51651|47338|133741|48234|96178|82200|70117|71732|193717|208512|42805|49361|63416|61001|201717|59501|202061|41839|77907|54552|68217|78827|69583|122007|48834|108583|87896|79567|145789|87279|643771|60349|94988|67097|72876|56427|130405|382922|79299|8461961|44677|280139|48477|86813|181606|88317|49180|58719|245724|54534|118974|49971|106113|46841|230436|43087|66042|43722|62158|60871|67994|106360|87930|54790|58233|84018|56774|51989|43660|412040|57873|173829|114258|84900|620015|132787|49608|443072|169389|139919|93220|58612|263306|42379|66713|183775|58685|204752|69098|106573|51865|80948|51045|60236|46714|156823|229666|54941|48442|80088|140268|153286|68567|70536|146894|71389|52235|47241|106238|164753|53250|158677|115990|73718|52265|59757|55712|75172|1559938|1555324|63724|45404|69733|50946|67998|305305|43632|52168|41881|50578|279088|90878|77046|75105|54592|62145|151807|106004|123328|59920|54913|58001|58780|175652|47854|58472|66649|620589|96071|45882|49675|178851|115718|108385|93349|77931|441326|69482|173309|49038|72441|87899|91320|70442|59268|67664|82595|237121|98499|60070|53165|102418|108350|53227|108303|216773|92966|318678|41521|84590|99329|72987|111396|210291|70251|149597|60509|65171|41672|56175|61979|41928|54507|128276|47606|93968|48407|112767|50281|59203|58823|484530|49892|42804|161975|47676|155889|191446|62136|98694|1439358|214581|42736|109067|65082|1374812|850282|46375|1009363|350402|89039|46716|91479|57743|102224|58948|88507|102212|93141|57039|333605|90922|122725|180303|63310|82927|103642|92247|173165|56839|54425|144717|44260|74366|65554|234495|76380|668849|49017|64444|48813|55021|198571|44381|78038|126126|82666|167884|64873|54788|45369|79507|101037|95219|55194|62751|66587|41397|59313|51816|73055|94718|93322|212078|102929|190661|58608|76188|116745|153991|165138|59761|60611|68341|59916|44198|66770|78573|76901|47486|316030|297160|55820|253585|127410|42074|131674|48104|301443|52300|44622|87061|85681|47919|149596|192873|91177|127492|144350|205602|188466|63747|57796|361477|56504|61716|60448|108965|174708|71138|61021|46811|56105|69457|108373|130511|128623|50787|57125|44746|280854|88537|57844|127472|147307|82554|58189|86382|84559|82982|49881|46226|47997|527586|61664|399906|71166|96352|79396|46623|101946|73500|68965|43871|75851|41941|41578|61337|95607|56717|119644|169982|66139|121320|60876|449733|128738|98560|130659|41590|67568|62699|73265|135069|81881|659009|109211|68357|52915|88159|72016|47388|61371|51229|60543|43359|107634|61624|63187|54972|110928|44543|104978|51386|45197|134609|41486|82218|91635|111770|68893|55601|53568|49764|57925|86630|105013|388033|71502|113724|49558|238474|66699|57552|183677|45655|74692|93338|199725|67362|43848|65161|66147|52886|93704","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-d61e0428","guard":[["hasAny",["altadena","alto","austin","azusa","bell","belleville","bellevue","bethlehem","burbank","charlottesville","chesapeake","coconut","connecticut","corona","costa","denver","doral","element","elizabeth","factorise","factorize","falls","fort","frisco","hammond","hattiesburg","iowa","item number","kendall","kenosha","largo","lcm of all","least common multiple of the list","levittown","livermore","lynn","mansfield","marcos","miami","monterey","mountain","newark","novi","nth","petersburg","pleasanton","position","prime factorisation","prime factorization","prime factors","renton","reston","rialto","roseville","springfield","springs","stockton","suffolk","urbana","villages","worcester","yuba"]],["words<=",9],["has","the"],["not",["has","and"]],["has","population"],["not",["has","apex"]],["not",["has","buckeye"]]],"pyramid":["render.number",["compute.lcmAll",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-81a4447a","guard":[["hasAny",["allentown","altadena","alto","antioch","austin","azusa","bell","brookline","burbank","charles","charlottesville","clair","cleveland","coconut","colorado","connecticut","corona","doral","duluth","element","euless","falls","findlay","fort","frisco","greenwood","hattiesburg","item number","laguna","logan","luis","lynn","mansfield","mountain","novi","nth","ontario","park","parma","pensacola","pleasanton","position","racine","rialto","roseville","suffolk","tuckahoe","wilson","worcester","yuba"]],["words<=",9],["has","the"],["words>=",7],["not",["has","amboy"]],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-0f7e8cab","guard":[["hasAny",["allentown","altadena","alto","antioch","austin","azusa","bell","brookline","burbank","charles","charlottesville","clair","cleveland","coconut","colorado","connecticut","corona","doral","duluth","element","euless","falls","findlay","fort","frisco","greenwood","hattiesburg","item number","laguna","logan","lower case","lowercase","luis","lynn","mansfield","mountain","novi","nth","ontario","park","parma","pensacola","pleasanton","position","racine","rialto","roseville","small letters","suffolk","tuckahoe","wilson","worcester","yuba"]],["words<=",9],["has","the"],["words>=",7],["not",["has","amboy"]],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-6a5fcb71","guard":[["hasAny",["allentown","altadena","alto","antioch","austin","azusa","bell","brookline","burbank","charles","charlottesville","clair","cleveland","coconut","colorado","connecticut","corona","doral","duluth","element","euless","falls","findlay","fort","frisco","greenwood","hattiesburg","invert case","item number","laguna","logan","luis","lynn","mansfield","mountain","novi","nth","ontario","park","parma","pensacola","pleasanton","position","racine","rialto","roseville","suffolk","swap case","toggle case","tuckahoe","wilson","worcester","yuba"]],["words<=",9],["has","the"],["words>=",7],["not",["has","amboy"]],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-96bd135a","guard":[["hasAny",["all caps","allentown","altadena","alto","antioch","austin","azusa","bell","brookline","burbank","capital letters","capitals","charles","charlottesville","clair","cleveland","coconut","colorado","connecticut","corona","doral","duluth","element","euless","falls","findlay","fort","frisco","greenwood","hattiesburg","item number","laguna","logan","luis","lynn","mansfield","mountain","novi","nth","ontario","park","parma","pensacola","pleasanton","position","racine","rialto","roseville","suffolk","tuckahoe","upper case","uppercase","wilson","worcester","yuba"]],["words<=",9],["has","the"],["words>=",7],["not",["has","amboy"]],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-cba8f98e","guard":[["hasAny",["allentown","altadena","alto","antioch","austin","azusa","bell","brookline","burbank","capitalise","capitalize","capitalize each word","charles","charlottesville","clair","cleveland","coconut","colorado","connecticut","corona","doral","duluth","element","euless","falls","findlay","fort","frisco","greenwood","hattiesburg","item number","laguna","logan","luis","lynn","mansfield","mountain","novi","nth","ontario","park","parma","pensacola","pleasanton","position","racine","rialto","roseville","suffolk","title case","tuckahoe","wilson","worcester","yuba"]],["words<=",9],["has","the"],["words>=",7],["not",["has","amboy"]],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-4507c4fc","guard":[["hasAny",["allentown","altadena","alto","antioch","austin","azusa","bell","brookline","burbank","charles","charlottesville","clair","cleveland","coconut","colorado","connecticut","corona","doral","duluth","each word","element","euless","falls","findlay","fort","frisco","greenwood","hattiesburg","item number","laguna","logan","luis","lynn","mansfield","mountain","novi","nth","ontario","park","parma","pensacola","pleasanton","position","racine","rialto","roseville","split into words","suffolk","tuckahoe","wilson","worcester","words","yuba"]],["words<=",9],["has","the"],["words>=",7],["not",["has","amboy"]],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-d2d9c254","guard":[["hasAny",["allentown","altadena","alto","antioch","austin","azusa","bell","brookline","burbank","charles","charlottesville","clair","cleveland","coconut","colorado","connecticut","corona","doral","duluth","each word","element","euless","falls","findlay","fort","frisco","greenwood","hattiesburg","item number","laguna","logan","luis","lynn","mansfield","mountain","novi","nth","ontario","park","parma","pensacola","pleasanton","position","racine","rialto","roseville","split into words","suffolk","tuckahoe","wilson","worcester","words","yuba"]],["words<=",9],["has","the"],["words>=",7],["not",["has","amboy"]],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-d348eec6","guard":[["hasAny",["allentown","altadena","alto","antioch","austin","azusa","bell","brookline","burbank","charles","charlottesville","clair","cleveland","coconut","colorado","connecticut","corona","doral","duluth","element","euless","falls","findlay","fort","frisco","greenwood","hattiesburg","item number","laguna","logan","luis","lynn","mansfield","mountain","novi","nth","ontario","park","parma","pensacola","pleasanton","position","racine","rialto","roseville","suffolk","tuckahoe","wilson","worcester","yuba"]],["words<=",9],["has","the"],["words>=",7],["not",["has","amboy"]],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-d636f9d7","guard":[["hasAny",["allentown","altadena","alto","antioch","austin","azusa","bell","brookline","burbank","charles","charlottesville","clair","cleveland","coconut","colorado","connecticut","corona","doral","duluth","element","euless","falls","findlay","fort","frisco","greenwood","hattiesburg","item number","laguna","logan","luis","lynn","mansfield","mountain","novi","nth","ontario","park","parma","pensacola","pleasanton","position","racine","rialto","roseville","suffolk","tuckahoe","wilson","worcester","yuba"]],["words<=",9],["has","the"],["words>=",7],["not",["has","amboy"]],["not",["has","and"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-efb97da7","guard":[["has","population"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the population of Castle Rock, Colorado":"The population of Castle Rock, Colorado is 53789.","the population of Lake Charles, Louisiana":"The population of Lake Charles, Louisiana is 75044.","the population of Redmond, Washington":"The population of Redmond, Washington is 59268.","the population of Mansfield, Texas":"The population of Mansfield, Texas is 63141.","the population of Fort Pierce, Florida":"The population of Fort Pierce, Florida is 43883.","the population of Pico Rivera, California":"The population of Pico Rivera, California is 63724.","the population of Florissant, Missouri":"The population of Florissant, Missouri is 52218.","the population of Levittown, New York":"The population of Levittown, New York is 51073.","the population of Suffolk, Virginia":"The population of Suffolk, Virginia is 87061.","the population of Overland Park, Kansas":"The population of Overland Park, Kansas is 183775.","the population of Pensacola, Florida":"The population of Pensacola, Florida is 53250.","the population of Novi, Michigan":"The population of Novi, Michigan is 58233.","the population of Pleasanton, California":"The population of Pleasanton, California is 77046.","the population of Stamford, Connecticut":"The population of Stamford, Connecticut is 127410.","the population of Trujillo Alto, Puerto Rico":"The population of Trujillo Alto, Puerto Rico is 46226.","the population of St. Peters, Missouri":"The population of St. Peters, Missouri is 55820.","the population of Elizabeth, New Jersey":"The population of Elizabeth, New Jersey is 128042.","the population of Cleveland Heights, Ohio":"The population of Cleveland Heights, Ohio is 45160.","the population of Ontario, California":"The population of Ontario, California is 169389.","the population of Belleville, Illinois":"The population of Belleville, Illinois is 42729.","the population of Bell Gardens, California":"The population of Bell Gardens, California is 42805.","the population of Schaumburg, Illinois":"The population of Schaumburg, Illinois is 74366.","the population of Doral, Florida":"The population of Doral, Florida is 53426.","the population of Wheaton, Illinois":"The population of Wheaton, Illinois is 53568.","the population of Greenwood, Indiana":"The population of Greenwood, Indiana is 54564.","the population of Parma, Ohio":"The population of Parma, Ohio is 80088.","the population of St. Clair Shores, Michigan":"The population of St. Clair Shores, Michigan is 59916.","the population of Monterey Park, California":"The population of Monterey Park, California is 61001.","the population of Laguna Niguel, California":"The population of Laguna Niguel, California is 64984.","the population of Brookline, Massachusetts":"The population of Brookline, Massachusetts is 59180.","the population of Hattiesburg, Mississippi":"The population of Hattiesburg, Mississippi is 46846.","the population of Renton, Washington":"The population of Renton, Washington is 98499.","the population of Lynn, Massachusetts":"The population of Lynn, Massachusetts is 92074.","the population of Yuba City, California":"The population of Yuba City, California is 66147."}}},
{"id":"n-cf310a0a","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","costa","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","springfield","stockton","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-0096d444","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","costa","element","glendale","haltom","hammond","highlands","invert case","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","springfield","stockton","swap case","toggle case","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-0a4f4a0d","guard":[["hasAny",["alabama","all caps","angeles","arecibo","arizona","barbara","bay","bethlehem","capital letters","capitals","chesapeake","costa","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","springfield","stockton","upper case","uppercase","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.upper",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-0b13e3c4","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","class name","costa","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","pascal case","pascalcase","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","springfield","stockton","upper camel case","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-a7f5e145","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","capitalise","capitalize","capitalize each word","chesapeake","costa","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","springfield","stockton","title case","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.title",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-c89361d1","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","costa","element","glendale","haltom","hammond","highlands","invert case","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","springfield","stockton","swap case","toggle case","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-f94598ba","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","costa","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","lower case","lowercase","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","small letters","south","springfield","stockton","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.lower",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-179aeec7","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","costa","each word","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","split into words","springfield","stockton","villages","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-47c85bc4","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","costa","each word","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","split into words","springfield","stockton","villages","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-49f65ce4","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","costa","each word","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","split into words","springfield","stockton","villages","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-a350f327","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","costa","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","springfield","stockton","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-dacbb3e4","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","costa","each word","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","split into words","springfield","stockton","villages","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-ff5b2f83","guard":[["hasAny",["alabama","angeles","arecibo","arizona","barbara","bay","bethlehem","chesapeake","costa","element","glendale","haltom","hammond","highlands","iowa","item number","kendall","kenosha","largo","livermore","marcos","miami","newark","nth","petersburg","pflugerville","pontiac","position","reston","rochester","scranton","south","springfield","stockton","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-6ac92e99","guard":[["hasAny",["alabama","allentown","angeles","antioch","aurora","austin","bellevue","burbank","chesapeake","connecticut","corona","costa","denver","diagonal","element","elizabeth","frisco","hypotenuse","item number","kansas","nth","ontario","petersburg","position","pythagoras","pythagorean","rialto","rochester","springfield","springs","stockton","worcester"]],["words<=",8],["has","the"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-10daa972","guard":[["hasAny",["alabama","austin","charles","chesapeake","city","element","euless","falls","frisco","indiana","iowa","item number","kansas","logan","longest","longest one","longest word","mansfield","nth","position","puerto","reston","suffolk","tuckahoe","wisconsin"]],["words<=",9],["has","the"],["not",["has","and"]],["not",["has","amboy"]],["not",["has","apex"]],["not",["has","auburn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-0e9f9fd7","guard":[["hasAny",["alabama","austin","charles","chesapeake","city","element","euless","falls","frisco","indiana","iowa","item number","kansas","logan","longest","longest one","longest word","lower case","lowercase","mansfield","nth","position","puerto","reston","small letters","suffolk","tuckahoe","wisconsin"]],["words<=",9],["has","the"],["not",["has","and"]],["not",["has","amboy"]],["not",["has","apex"]],["not",["has","auburn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-bb0c27f7","guard":[["hasAny",["alabama","austin","charles","chesapeake","city","element","euless","falls","frisco","indiana","invert case","iowa","item number","kansas","logan","longest","longest one","longest word","mansfield","nth","position","puerto","reston","suffolk","swap case","toggle case","tuckahoe","wisconsin"]],["words<=",9],["has","the"],["not",["has","and"]],["not",["has","amboy"]],["not",["has","apex"]],["not",["has","auburn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-d037cb1a","guard":[["hasAny",["alabama","austin","capitalise","capitalize","capitalize each word","charles","chesapeake","city","element","euless","falls","frisco","indiana","iowa","item number","kansas","logan","longest","longest one","longest word","mansfield","nth","position","puerto","reston","suffolk","title case","tuckahoe","wisconsin"]],["words<=",9],["has","the"],["not",["has","and"]],["not",["has","amboy"]],["not",["has","apex"]],["not",["has","auburn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-ed7b7540","guard":[["hasAny",["alabama","all caps","austin","capital letters","capitals","charles","chesapeake","city","element","euless","falls","frisco","indiana","iowa","item number","kansas","logan","longest","longest one","longest word","mansfield","nth","position","puerto","reston","suffolk","tuckahoe","upper case","uppercase","wisconsin"]],["words<=",9],["has","the"],["not",["has","and"]],["not",["has","amboy"]],["not",["has","apex"]],["not",["has","auburn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-106cdc75","guard":[["hasAny",["alabama","austin","charles","chesapeake","city","element","euless","falls","frisco","indiana","iowa","item number","kansas","logan","longest","longest one","longest word","mansfield","nth","position","puerto","reston","suffolk","tuckahoe","wisconsin"]],["words<=",9],["has","the"],["not",["has","and"]],["not",["has","amboy"]],["not",["has","apex"]],["not",["has","auburn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-a876afa0","guard":[["hasAny",["alabama","austin","charles","chesapeake","city","each word","element","euless","falls","frisco","indiana","iowa","item number","kansas","logan","longest","longest one","longest word","mansfield","nth","position","puerto","reston","split into words","suffolk","tuckahoe","wisconsin","words"]],["words<=",9],["has","the"],["not",["has","and"]],["not",["has","amboy"]],["not",["has","apex"]],["not",["has","auburn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-ee5da066","guard":[["hasAny",["alabama","austin","charles","chesapeake","city","element","euless","falls","frisco","indiana","iowa","item number","kansas","logan","longest","longest one","longest word","mansfield","nth","position","puerto","reston","suffolk","tuckahoe","wisconsin"]],["words<=",9],["has","the"],["not",["has","and"]],["not",["has","amboy"]],["not",["has","apex"]],["not",["has","auburn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-f90cfed8","guard":[["hasAny",["alabama","austin","charles","chesapeake","city","each word","element","euless","falls","frisco","indiana","iowa","item number","kansas","logan","longest","longest one","longest word","mansfield","nth","position","puerto","reston","split into words","suffolk","tuckahoe","wisconsin","words"]],["words<=",9],["has","the"],["not",["has","and"]],["not",["has","amboy"]],["not",["has","apex"]],["not",["has","auburn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-6f2072ff","guard":[["hasAny",["allentown","angeles","arecibo","brookline","charles","clair","cleveland","element","findlay","greenwood","haltom","hoboken","item number","laguna","lcm","least common multiple","lowest common multiple","luis","nth","parma","peters","pflugerville","pontiac","position","redmond","scranton","wheaton"]],["words<=",9],["has","of"],["not",["has","cloud"]]],"pyramid":["render.number",["compute.lcm",{"lit":4},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-865b8ae9","guard":[["hasAny",["antioch","bell","bethlehem","brookline","cleveland","connecticut","element","euless","item number","kenosha","lcm","least common multiple","lowest common multiple","nth","overland","pensacola","peters","petersburg","pontiac","position","reston","scranton"]],["words<=",8],["has","the"]],"pyramid":["render.number",["compute.lcm",{"lit":5},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-9479989d","guard":[["hasAny",["antioch","aurora","bay","cleveland","element","findlay","hoboken","item number","laguna","lcm","least common multiple","logan","lowest common multiple","novi","nth","position","racine","rochester","scranton"]],["words<=",8],["has","the"]],"pyramid":["render.number",["compute.lcm",["sense.wordCount"],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-99905e5c","guard":[["hasAny",["clair","element","findlay","greenwood","hoboken","item number","lcm","least common multiple","lowest common multiple","luis","nth","parma","position","redmond","rochester","scranton","wheaton"]],["words<=",9],["has","the"]],"pyramid":["render.number",["compute.lcm",{"lit":12},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-5cbc0d90","guard":[["hasAny",["bethlehem","brookline","cleveland","connecticut","element","item number","lcm","least common multiple","lowest common multiple","nth","pensacola","peters","pontiac","position","reston","scranton"]],["words<=",8]],"pyramid":["render.number",["compute.lcm",{"lit":10},["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-e1710e01","guard":[["hasAny",["azusa","before","bethlehem","element","findlay","greenwood","item number","largo","nth","one less","peters","pflugerville","position","predecessor","previous","scranton","sum of divisors","sum of factors","sum of the divisors"]],["has","of"]],"pyramid":["render.number",["compute.divisorSum",["transform.prev",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-827e7be1","guard":[["hasAny",["alabama","angeles","chesapeake","element","glendale","item number","leading zeros","nth","pad","pad with","padded to","position","rochester","springfield","stockton","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-f5f8196f","guard":[["hasAny",["alabama","angeles","chesapeake","element","glendale","item number","leading zeros","nth","pad","pad with","padded to","position","rochester","springfield","stockton","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-d7b88f44","guard":[["hasAny",["alabama","angeles","chesapeake","element","glendale","item number","leading zeros","nth","pad","pad with","padded to","position","rochester","springfield","stockton","zero pad"]],["has","give"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}]]],"mem":null},
{"id":"n-6fda52ae","guard":[["hasAny",["beach","coconut","element","factorise","factorize","item number","monterey","nth","position","prime factorisation","prime factorization","prime factors","springfield","urbana","villages"]],["words<=",8]],"pyramid":["render.listNums",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-1cd55e42","guard":[["hasAny",["as text","as words","beach","coconut","element","factorise","factorize","item number","monterey","nth","position","prime factorisation","prime factorization","prime factors","springfield","urbana","villages","written out"]],["words<=",8]],"pyramid":["render.lines",["transform.asText",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-2850ceee","guard":[["hasAny",["beach","biggest","coconut","element","factorise","factorize","greatest","highest","item number","largest","max","maximum","monterey","nth","position","prime factorisation","prime factorization","prime factors","springfield","urbana","villages"]],["words<=",8]],"pyramid":["render.number",["aggregate.max",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-3026189a","guard":[["hasAny",["add up","altogether","beach","coconut","element","factorise","factorize","in all","item number","monterey","nth","position","prime factorisation","prime factorization","prime factors","springfield","total","urbana","villages"]],["words<=",8]],"pyramid":["render.number",["aggregate.sum",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-326512f7","guard":[["hasAny",["appears most often","beach","coconut","element","factorise","factorize","item number","mode","monterey","most common","most frequent","nth","position","prime factorisation","prime factorization","prime factors","springfield","urbana","villages"]],["words<=",8]],"pyramid":["render.number",["aggregate.mode",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-384eb18f","guard":[["hasAny",["as text","as words","beach","coconut","element","factorise","factorize","item number","monterey","nth","position","prime factorisation","prime factorization","prime factors","springfield","urbana","villages","written out"]],["words<=",8]],"pyramid":["render.and",["transform.asText",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-3dc8b6d6","guard":[["hasAny",["beach","coconut","element","factorise","factorize","item number","least","lowest","min","minimum","monterey","nth","position","prime factorisation","prime factorization","prime factors","smallest","springfield","urbana","villages"]],["words<=",8]],"pyramid":["render.number",["aggregate.min",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-5eef825c","guard":[["hasAny",["beach","coconut","element","factorise","factorize","item number","monterey","nth","position","prime factorisation","prime factorization","prime factors","springfield","urbana","villages"]],["words<=",8]],"pyramid":["render.listNums",["iterate.cumsum",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-74b52a5d","guard":[["hasAny",["arithmetic mean","average","avg","beach","coconut","element","factorise","factorize","item number","mean","monterey","nth","position","prime factorisation","prime factorization","prime factors","springfield","urbana","villages"]],["words<=",8]],"pyramid":["render.number",["aggregate.mean",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-79d48e42","guard":[["hasAny",["beach","coconut","element","factorise","factorize","gcd of all","greatest common divisor of the list","item number","monterey","nth","position","prime factorisation","prime factorization","prime factors","springfield","urbana","villages"]],["words<=",8]],"pyramid":["render.number",["compute.gcdAll",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-ce515e24","guard":[["hasAny",["beach","coconut","element","factorise","factorize","item number","monterey","nth","odd numbers","odds","position","prime factorisation","prime factorization","prime factors","springfield","the odd ones","urbana","villages"]],["words<=",8]],"pyramid":["render.listNums",["transform.odds",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-d6d2bce6","guard":[["hasAny",["all divisors","all factors","beach","coconut","divisors","element","factors","item number","monterey","multiplied together","multiply them all","nth","position","product","springfield","urbana","villages"]],["words<=",8]],"pyramid":["render.number",["aggregate.product",["compute.divisors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-dc8dd127","guard":[["hasAny",["beach","before","coconut","element","item number","monterey","nth","one less","position","predecessor","previous","springfield","sum of divisors","sum of factors","sum of the divisors","urbana","villages"]],["words<=",8]],"pyramid":["render.number",["transform.prev",["compute.divisorSum",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-f642c43b","guard":[["hasAny",["beach","coconut","element","factorise","factorize","item number","median","middle number","middle value","monterey","nth","position","prime factorisation","prime factorization","prime factors","springfield","urbana","villages"]],["words<=",8]],"pyramid":["render.number",["aggregate.median",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-f84cb032","guard":[["hasAny",["beach","before","coconut","element","item number","monterey","next prime","nth","one less","position","predecessor","previous","smallest prime greater than","springfield","the prime after","urbana","villages"]],["words<=",8]],"pyramid":["render.number",["compute.nextPrime",["transform.prev",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-4eb4d641","guard":[["hasAny",["as text","as words","beach","coconut","element","factorise","factorize","item number","monterey","nth","position","prime factorisation","prime factorization","prime factors","springfield","urbana","villages","written out"]],["words<=",8]],"pyramid":["render.and",["transform.asText",["iterate.cumsum",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]]],"mem":null},
{"id":"n-7d5af4ba","guard":[["hasAny",["as text","as words","beach","coconut","element","factorise","factorize","item number","monterey","nth","odd numbers","odds","position","prime factorisation","prime factorization","prime factors","springfield","the odd ones","urbana","villages","written out"]],["words<=",8]],"pyramid":["render.and",["transform.asText",["transform.odds",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]]],"mem":null},
{"id":"n-c8037f3d","guard":[["hasAny",["beach","coconut","element","factorise","factorize","item number","longest","longest one","longest word","monterey","nth","position","prime factorisation","prime factorization","prime factors","urbana","villages"]],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}],["render.listNums",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-10c922c4","guard":[["hasAny",["as text","as words","beach","coconut","element","factorise","factorize","item number","longest","longest one","longest word","monterey","nth","position","prime factorisation","prime factorization","prime factors","urbana","villages","written out"]],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}],["render.and",["transform.asText",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]]],"mem":null},
{"id":"n-a5c4eaab","guard":[["hasAny",["element","hattiesburg","item number","nth","pleasanton","position","shortest","shortest one","shortest word","springfield"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"population"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-423f8f61","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hattiesburg","item number","nth","pleasanton","position","shortest","shortest one","shortest word","springfield","title case"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-62a5ae91","guard":[["hasAny",["element","hattiesburg","item number","lower case","lowercase","nth","pleasanton","position","shortest","shortest one","shortest word","small letters","springfield"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-975d663f","guard":[["hasAny",["all caps","capital letters","capitals","element","hattiesburg","item number","nth","pleasanton","position","shortest","shortest one","shortest word","springfield","upper case","uppercase"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-bb93d4ce","guard":[["hasAny",["element","hattiesburg","invert case","item number","nth","pleasanton","position","shortest","shortest one","shortest word","springfield","swap case","toggle case"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.after",{"lit":"population"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-0bfc2263","guard":[["hasAny",["element","hattiesburg","item number","nth","pleasanton","position","shortest","shortest one","shortest word","springfield"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"population"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-88036598","guard":[["hasAny",["each word","element","hattiesburg","item number","nth","pleasanton","position","shortest","shortest one","shortest word","split into words","springfield","words"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"population"}],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-88d3f5e1","guard":[["hasAny",["element","hattiesburg","item number","nth","pleasanton","position","shortest","shortest one","shortest word","springfield"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"population"}],["render.number",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-d6c8c090","guard":[["hasAny",["each word","element","hattiesburg","item number","nth","pleasanton","position","shortest","shortest one","shortest word","split into words","springfield","words"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"population"}],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]],"mem":null},
{"id":"n-0145d990","guard":[["hasAny",["element","euless","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Euless, Texas is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-05e36416","guard":[["hasAny",["aurora","element","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Aurora, Illinois is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-0885eee1","guard":[["hasAny",["element","hoboken","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hoboken, New Jersey is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-0d1ef3b3","guard":[["hasAny",["element","item number","kendall","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Kendall, Florida is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-0f8863b3","guard":[["hasAny",["antioch","element","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Antioch, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-10555dba","guard":[["hasAny",["element","item number","longest","longest one","longest word","mansfield","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mansfield, Texas is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-1086cd14","guard":[["hasAny",["costa","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Costa Mesa, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-12aae69c","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","stockton"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Stockton, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-14810065","guard":[["hasAny",["element","haltom","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Haltom City, Texas is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-154441c7","guard":[["hasAny",["casa","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Casa Grande, Arizona is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-1888c5e2","guard":[["hasAny",["element","item number","longest","longest one","longest word","marcos","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of San Marcos, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-1c25af69","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","redmond"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Redmond, Washington is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-204ed9e3","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","parma","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Parma, Ohio is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-2271c444","guard":[["hasAny",["element","item number","longest","longest one","longest word","mountain","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mountain View, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-2afd654a","guard":[["hasAny",["azusa","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Azusa, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-2f3af5f2","guard":[["hasAny",["corona","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Corona, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-32e3fa77","guard":[["hasAny",["element","item number","longest","longest one","longest word","maricopa","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Maricopa, Arizona is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-3a6bb75b","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tuckahoe"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tuckahoe, Virginia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-3e040e05","guard":[["hasAny",["element","item number","livermore","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Livermore, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-3e186e73","guard":[["hasAny",["clair","element","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of St. Clair Shores, Michigan is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-3f2be31c","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","yuba"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Yuba City, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-3f64333f","guard":[["hasAny",["angeles","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Los Angeles, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-40e9a4d6","guard":[["hasAny",["element","highlands","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of North Highlands, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-444bb031","guard":[["hasAny",["element","item number","longest","longest one","longest word","monterey","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Monterey Park, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-46592406","guard":[["hasAny",["element","item number","longest","longest one","longest word","newark","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Newark, Ohio is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-4d97fc65","guard":[["hasAny",["bell","element","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bell Gardens, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-4efeb8cb","guard":[["hasAny",["element","item number","largo","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Largo, Florida is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-4fe8d652","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","pontiac","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Pontiac, Michigan is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-55cc8e54","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","urbana"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Urbana, Illinois is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-59183ea6","guard":[["hasAny",["element","iowa","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Waterloo, Iowa is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-5b7a27e7","guard":[["hasAny",["duluth","element","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Duluth, Minnesota is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-6115aa2b","guard":[["hasAny",["element","item number","laguna","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Laguna Niguel, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-6380b8d0","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","schaumburg"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Schaumburg, Illinois is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-65649ab0","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wilson"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Wilson, North Carolina is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-69b41bd1","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","reston"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Reston, Virginia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-6abe81b2","guard":[["hasAny",["element","florissant","item number","longest","longest one","longest word","nth","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Florissant, Missouri is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-6b4267a5","guard":[["hasAny",["element","idaho","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Idaho Falls, Idaho is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-70a03c81","guard":[["hasAny",["belleville","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Belleville, Illinois is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-71732cc0","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","springs"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Colorado Springs, Colorado is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-741a3a80","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","renton"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Renton, Washington is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-79cbe1c8","guard":[["hasAny",["beach","element","item number","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Newport Beach, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-7a23f16a","guard":[["hasAny",["element","findlay","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Findlay, Ohio is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-7ee6e819","guard":[["hasAny",["castle","element","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Castle Rock, Colorado is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-8129acbd","guard":[["hasAny",["element","hattiesburg","item number","nth","position","shortest","shortest one","shortest word"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hattiesburg, Mississippi is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-81618895","guard":[["hasAny",["cleveland","element","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Cleveland Heights, Ohio is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-823eda20","guard":[["hasAny",["bellevue","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bellevue, Washington is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-82e0f429","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","roseville"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Roseville, Michigan is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-86e22ec4","guard":[["hasAny",["alto","element","item number","longest","longest one","longest word","nth","position"]],["words<=",9]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Trujillo Alto, Puerto Rico is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-86e8a39c","guard":[["hasAny",["bay","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Cutler Bay, Florida is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-872f37e8","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","pico","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Pico Rivera, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-875ece83","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","rochester"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Rochester, Minnesota is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-8c3cd4ab","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","suffolk"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Suffolk, Virginia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-8edd980c","guard":[["hasAny",["element","item number","kenosha","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Kenosha, Wisconsin is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-96956e5f","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wheaton"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Wheaton, Illinois is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-9cb6fd69","guard":[["hasAny",["element","fort","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Fort Pierce, Florida is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-9ce3a9e2","guard":[["hasAny",["burbank","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Burbank, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-a1605960","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","rialto"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Rialto, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-a4ea2eef","guard":[["hasAny",["barbara","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Santa Barbara, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-a5a28023","guard":[["hasAny",["austin","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Austin, Texas is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-a88344cc","guard":[["hasAny",["element","glendale","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Glendale, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-a8e51c68","guard":[["hasAny",["element","item number","levittown","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Levittown, New York is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-ab0eaf04","guard":[["hasAny",["element","hammond","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hammond, Indiana is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-ac95de03","guard":[["hasAny",["element","item number","logan","longest","longest one","longest word","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Logan, Utah is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-ae170d33","guard":[["hasAny",["cuyahoga","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Cuyahoga Falls, Ohio is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-ae9782f0","guard":[["hasAny",["altadena","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Altadena, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-aee23aea","guard":[["hasAny",["alabama","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Montgomery, Alabama is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-af0fe285","guard":[["hasAny",["element","greenwood","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Greenwood, Indiana is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-afe557c4","guard":[["hasAny",["element","frisco","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Frisco, Texas is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-b2acf531","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Villages, Florida is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-cb604362","guard":[["hasAny",["element","item number","longest","longest one","longest word","luis","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of San Luis Obispo, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-cfa896f7","guard":[["hasAny",["element","item number","nth","pflugerville","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Pflugerville, Texas is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-d590a9b1","guard":[["hasAny",["bethlehem","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bethlehem, Pennsylvania is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-d718985b","guard":[["hasAny",["element","elizabeth","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Elizabeth, New Jersey is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-d84cc70d","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","petersburg","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of St. Petersburg, Florida is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-db3c267b","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","pensacola","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Pensacola, Florida is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-e096b045","guard":[["hasAny",["coconut","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Coconut Creek, Florida is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-e1bcb4f9","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","springfield"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Springfield, Massachusetts is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-e813b6f4","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","peters","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of St. Peters, Missouri is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-e8a1998d","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","ontario","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Ontario, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-ea2ed3f6","guard":[["hasAny",["element","item number","longest","longest one","longest word","novi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Novi, Michigan is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-ece693b7","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","overland","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Overland Park, Kansas is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-f19efe67","guard":[["hasAny",["arecibo","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Arecibo, Puerto Rico is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-f23743d4","guard":[["hasAny",["doral","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Doral, Florida is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-f87d0f50","guard":[["hasAny",["chesapeake","element","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Chesapeake, Virginia is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-fa19a3f6","guard":[["hasAny",["denver","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Denver, Colorado is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-fa387de6","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","pleasanton","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Pleasanton, California is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-fb0e9e92","guard":[["hasAny",["element","item number","nth","position","scranton"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Scranton, Pennsylvania is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-fcad25f8","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","racine"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Racine, Wisconsin is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-fd828451","guard":[["hasAny",["element","item number","nth","position","south"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Summerville, South Carolina is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-fea5f7e3","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","plainfield","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Plainfield, New Jersey is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-ffc28709","guard":[["hasAny",["charles","element","item number","longest","longest one","longest word","nth","position"]],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lake Charles, Louisiana is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-2d91e180","guard":[["hasAny",["element","item number","nth","position","worcester"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Worcester, Massachusetts is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-6490be89","guard":[["hasAny",["element","item number","lynn","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Lynn, Massachusetts is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-8846f181","guard":[["hasAny",["connecticut","element","item number","nth","position"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Stamford, Connecticut is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-943ab238","guard":[["hasAny",["allentown","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Allentown, Pennsylvania is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-c50ad0ee","guard":[["hasAny",["brookline","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Brookline, Massachusetts is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-f5fabab1","guard":[["hasAny",["charlottesville","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Charlottesville, Virginia is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]],"mem":null},
{"id":"n-e14393b6","guard":[["hasAny",["element","factorise","factorize","item number","nth","position","prime factorisation","prime factorization","prime factors","shortest","shortest one","shortest word","springfield"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"population"}],["render.listNums",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]],"mem":null},
{"id":"n-bf3ee8be","guard":[["hasAny",["as text","as words","element","factorise","factorize","item number","nth","position","prime factorisation","prime factorization","prime factors","shortest","shortest one","shortest word","springfield","written out"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"population"}],["render.and",["transform.asText",["compute.primeFactors",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"corpora-us-city-population"},{"lit":"city, state"}],{"lit":1}],{"lit":"corpora-us-city-population"},{"lit":"city, state"},{"lit":"population"}]]]]]],"mem":null},
{"id":"n-015fc86b","guard":[["hasAny",["massachusetts","population","worcester"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Worcester, Massachusetts":"The population of Worcester, Massachusetts is 183677."}}},
{"id":"n-033695cb","guard":[["hasAny",["cleveland","heights","ohio","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Cleveland Heights, Ohio":"The population of Cleveland Heights, Ohio is 45160."}}},
{"id":"n-05bd923c","guard":[["hasAny",["cuyahoga","falls","ohio","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Cuyahoga Falls, Ohio":"The population of Cuyahoga Falls, Ohio is 49353."}}},
{"id":"n-05f1b67b","guard":[["hasAny",["newark","ohio","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Newark, Ohio":"The population of Newark, Ohio is 48477."}}},
{"id":"n-09fbdc2c","guard":[["hasAny",["population","suffolk","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Suffolk, Virginia":"The population of Suffolk, Virginia is 87061."}}},
{"id":"n-0df40b6b","guard":[["hasAny",["missouri","peters","population","st"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of St. Peters, Missouri":"The population of St. Peters, Missouri is 55820."}}},
{"id":"n-0f726362","guard":[["hasAny",["population","redmond","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Redmond, Washington":"The population of Redmond, Washington is 59268."}}},
{"id":"n-1164b96a","guard":[["hasAny",["allentown","pennsylvania","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Allentown, Pennsylvania":"The population of Allentown, Pennsylvania is 119624."}}},
{"id":"n-1c9ccded","guard":[["hasAny",["hoboken","jersey","new","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Hoboken, New Jersey":"The population of Hoboken, New Jersey is 53136."}}},
{"id":"n-1cad35ba","guard":[["hasAny",["austin","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Austin, Texas":"The population of Austin, Texas is 907779."}}},
{"id":"n-1fa22bd7","guard":[["hasAny",["population","renton","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Renton, Washington":"The population of Renton, Washington is 98499."}}},
{"id":"n-215715b0","guard":[["hasAny",["california","city","population","yuba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Yuba City, California":"The population of Yuba City, California is 66147."}}},
{"id":"n-260e6049","guard":[["hasAny",["colorado","population","springs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Colorado Springs, Colorado":"The population of Colorado Springs, Colorado is 448759."}}},
{"id":"n-26cddcb3","guard":[["hasAny",["minnesota","population","rochester"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Rochester, Minnesota":"The population of Rochester, Minnesota is 111396."}}},
{"id":"n-2744610e","guard":[["hasAny",["california","costa","mesa","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Costa Mesa, California":"The population of Costa Mesa, California is 112439."}}},
{"id":"n-28381f1c","guard":[["hasAny",["greenwood","indiana","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Greenwood, Indiana":"The population of Greenwood, Indiana is 54564."}}},
{"id":"n-2add64bf","guard":[["hasAny",["michigan","novi","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Novi, Michigan":"The population of Novi, Michigan is 58233."}}},
{"id":"n-2b7fe04d","guard":[["hasAny",["frisco","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Frisco, Texas":"The population of Frisco, Texas is 145646."}}},
{"id":"n-2cdeb3dc","guard":[["hasAny",["hattiesburg","mississippi","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Hattiesburg, Mississippi":"The population of Hattiesburg, Mississippi is 46846."}}},
{"id":"n-2d09a35f","guard":[["hasAny",["florida","fort","pierce","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Fort Pierce, Florida":"The population of Fort Pierce, Florida is 43883."}}},
{"id":"n-3221036c","guard":[["hasAny",["lynn","massachusetts","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Lynn, Massachusetts":"The population of Lynn, Massachusetts is 92074."}}},
{"id":"n-33769d6c","guard":[["hasAny",["pennsylvania","population","scranton"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Scranton, Pennsylvania":"The population of Scranton, Pennsylvania is 76380."}}},
{"id":"n-34b4f48f","guard":[["hasAny",["michigan","pontiac","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Pontiac, Michigan":"The population of Pontiac, Michigan is 59920."}}},
{"id":"n-379e3077","guard":[["hasAny",["alabama","montgomery","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Montgomery, Alabama":"The population of Montgomery, Alabama is 201717."}}},
{"id":"n-3841891e","guard":[["hasAny",["bell","california","gardens","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Bell Gardens, California":"The population of Bell Gardens, California is 42805."}}},
{"id":"n-393f5f0d","guard":[["hasAny",["hammond","indiana","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Hammond, Indiana":"The population of Hammond, Indiana is 78349."}}},
{"id":"n-39e6e353","guard":[["hasAny",["ohio","parma","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Parma, Ohio":"The population of Parma, Ohio is 80088."}}},
{"id":"n-3a8c2521","guard":[["hasAny",["clair","michigan","population","shores","st"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of St. Clair Shores, Michigan":"The population of St. Clair Shores, Michigan is 59916."}}},
{"id":"n-3b05858a","guard":[["hasAny",["california","ontario","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Ontario, California":"The population of Ontario, California is 169389."}}},
{"id":"n-3bbe077d","guard":[["hasAny",["charles","lake","louisiana","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Lake Charles, Louisiana":"The population of Lake Charles, Louisiana is 75044."}}},
{"id":"n-3dd77c5b","guard":[["hasAny",["elizabeth","jersey","new","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Elizabeth, New Jersey":"The population of Elizabeth, New Jersey is 128042."}}},
{"id":"n-3e760ac3","guard":[["hasAny",["california","pleasanton","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Pleasanton, California":"The population of Pleasanton, California is 77046."}}},
{"id":"n-3ed92928","guard":[["hasAny",["california","corona","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Corona, California":"The population of Corona, California is 161614."}}},
{"id":"n-3f4cbf25","guard":[["hasAny",["arecibo","population","puerto","rico"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Arecibo, Puerto Rico":"The population of Arecibo, Puerto Rico is 42412."}}},
{"id":"n-4079ac60","guard":[["hasAny",["california","mountain","population","view"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Mountain View, California":"The population of Mountain View, California is 78827."}}},
{"id":"n-4a976427","guard":[["hasAny",["angeles","california","los","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Los Angeles, California":"The population of Los Angeles, California is 3918872."}}},
{"id":"n-51c44c76","guard":[["hasAny",["california","marcos","population","san"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of San Marcos, California":"The population of San Marcos, California is 91479."}}},
{"id":"n-52886ea3","guard":[["hasAny",["pflugerville","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Pflugerville, Texas":"The population of Pflugerville, Texas is 55712."}}},
{"id":"n-57fbfb06","guard":[["hasAny",["florida","population","villages"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of The Villages, Florida":"The population of The Villages, Florida is 69457."}}},
{"id":"n-5da2a463","guard":[["hasAny",["doral","florida","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Doral, Florida":"The population of Doral, Florida is 53426."}}},
{"id":"n-6a3f093a","guard":[["hasAny",["charlottesville","population","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Charlottesville, Virginia":"The population of Charlottesville, Virginia is 45538."}}},
{"id":"n-7174c3b8","guard":[["hasAny",["azusa","california","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Azusa, California":"The population of Azusa, California is 48498."}}},
{"id":"n-74303e01","guard":[["hasAny",["alto","population","puerto","rico","trujillo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Trujillo Alto, Puerto Rico":"The population of Trujillo Alto, Puerto Rico is 46226."}}},
{"id":"n-79714177","guard":[["hasAny",["mansfield","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Mansfield, Texas":"The population of Mansfield, Texas is 63141."}}},
{"id":"n-79840665","guard":[["hasAny",["falls","idaho","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Idaho Falls, Idaho":"The population of Idaho Falls, Idaho is 58933."}}},
{"id":"n-7a0f4dea","guard":[["hasAny",["colorado","denver","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Denver, Colorado":"The population of Denver, Colorado is 663303."}}},
{"id":"n-7a48d0bb","guard":[["hasAny",["arizona","maricopa","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Maricopa, Arizona":"The population of Maricopa, Arizona is 45473."}}},
{"id":"n-7bb1bb13","guard":[["hasAny",["kansas","overland","park","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Overland Park, Kansas":"The population of Overland Park, Kansas is 183775."}}},
{"id":"n-7dd361ad","guard":[["hasAny",["bellevue","population","washington"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Bellevue, Washington":"The population of Bellevue, Washington is 136718."}}},
{"id":"n-7e025664","guard":[["hasAny",["population","racine","wisconsin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Racine, Wisconsin":"The population of Racine, Wisconsin is 77931."}}},
{"id":"n-8458ade6","guard":[["hasAny",["findlay","ohio","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Findlay, Ohio":"The population of Findlay, Ohio is 41412."}}},
{"id":"n-851191d3","guard":[["hasAny",["castle","colorado","population","rock"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Castle Rock, Colorado":"The population of Castle Rock, Colorado is 53789."}}},
{"id":"n-868844b0","guard":[["hasAny",["illinois","population","schaumburg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Schaumburg, Illinois":"The population of Schaumburg, Illinois is 74366."}}},
{"id":"n-8f612b06","guard":[["hasAny",["florida","miami","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Miami, Florida":"The population of Miami, Florida is 432622."}}},
{"id":"n-8fa8208e","guard":[["hasAny",["iowa","population","waterloo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Waterloo, Iowa":"The population of Waterloo, Iowa is 68357."}}},
{"id":"n-8feef5c3","guard":[["hasAny",["california","luis","obispo","population","san"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of San Luis Obispo, California":"The population of San Luis Obispo, California is 46716."}}},
{"id":"n-908c7fe7","guard":[["hasAny",["aurora","illinois","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Aurora, Illinois":"The population of Aurora, Illinois is 200907."}}},
{"id":"n-91b5a3e7","guard":[["hasAny",["florida","kendall","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Kendall, Florida":"The population of Kendall, Florida is 74559."}}},
{"id":"n-995f457b","guard":[["hasAny",["california","highlands","north","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of North Highlands, California":"The population of North Highlands, California is 46841."}}},
{"id":"n-9f267a24","guard":[["hasAny",["duluth","minnesota","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Duluth, Minnesota":"The population of Duluth, Minnesota is 86164."}}},
{"id":"n-9f2f11e3","guard":[["hasAny",["california","livermore","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Livermore, California":"The population of Livermore, California is 86493."}}},
{"id":"n-a1d33163","guard":[["hasAny",["city","haltom","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Haltom City, Texas":"The population of Haltom City, Texas is 43864."}}},
{"id":"n-a2ea816d","guard":[["hasAny",["florida","petersburg","population","st"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of St. Petersburg, Florida":"The population of St. Petersburg, Florida is 253585."}}},
{"id":"n-a42788df","guard":[["hasAny",["euless","population","texas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Euless, Texas":"The population of Euless, Texas is 53675."}}},
{"id":"n-a50cd5a0","guard":[["hasAny",["antioch","california","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Antioch, California":"The population of Antioch, California is 108675."}}},
{"id":"n-a53dcc20","guard":[["hasAny",["california","glendale","population"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Glendale, California":"The population of Glendale, California is 197895."}}},
{"id":"n-a5bafe1f","guard":[["hasAny",["burbank","california","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Burbank, California":"The population of Burbank, California is 104583."}}},
{"id":"n-a6011e57","guard":[["hasAny",["arizona","casa","grande","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Casa Grande, Arizona":"The population of Casa Grande, Arizona is 51571."}}},
{"id":"n-a67d85dd","guard":[["hasAny",["california","population","rialto"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Rialto, California":"The population of Rialto, California is 102418."}}},
{"id":"n-a7e60f21","guard":[["hasAny",["florida","pensacola","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Pensacola, Florida":"The population of Pensacola, Florida is 53250."}}},
{"id":"n-a99ea2c0","guard":[["hasAny",["levittown","new","population","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Levittown, New York":"The population of Levittown, New York is 51073."}}},
{"id":"n-ab4ad0b9","guard":[["hasAny",["barbara","california","population","santa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Santa Barbara, California":"The population of Santa Barbara, California is 90922."}}},
{"id":"n-ac10400a","guard":[["hasAny",["brookline","massachusetts","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Brookline, Massachusetts":"The population of Brookline, Massachusetts is 59180."}}},
{"id":"n-b1c6c107","guard":[["hasAny",["carolina","population","south","summerville"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Summerville, South Carolina":"The population of Summerville, South Carolina is 47919."}}},
{"id":"n-b56a7b8d","guard":[["hasAny",["chesapeake","population","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Chesapeake, Virginia":"The population of Chesapeake, Virginia is 233194."}}},
{"id":"n-b8f6eaac","guard":[["hasAny",["kenosha","population","wisconsin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Kenosha, Wisconsin":"The population of Kenosha, Wisconsin is 99865."}}},
{"id":"n-bd6bd4e9","guard":[["hasAny",["altadena","california","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Altadena, California":"The population of Altadena, California is 45001."}}},
{"id":"n-bd9217ed","guard":[["hasAny",["massachusetts","population","springfield"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Springfield, Massachusetts":"The population of Springfield, Massachusetts is 153991."}}},
{"id":"n-bfdad4f9","guard":[["hasAny",["illinois","population","urbana"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Urbana, Illinois":"The population of Urbana, Illinois is 41941."}}},
{"id":"n-c01ce695","guard":[["hasAny",["florissant","missouri","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Florissant, Missouri":"The population of Florissant, Missouri is 52218."}}},
{"id":"n-c29bbc39","guard":[["hasAny",["california","population","stockton"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Stockton, California":"The population of Stockton, California is 301443."}}},
{"id":"n-c57120fd","guard":[["hasAny",["california","monterey","park","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Monterey Park, California":"The population of Monterey Park, California is 61001."}}},
{"id":"n-c9fe4822","guard":[["hasAny",["carolina","north","population","wilson"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Wilson, North Carolina":"The population of Wilson, North Carolina is 49558."}}},
{"id":"n-d01413d8","guard":[["hasAny",["bethlehem","pennsylvania","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Bethlehem, Pennsylvania":"The population of Bethlehem, Pennsylvania is 75110."}}},
{"id":"n-d16a04ec","guard":[["hasAny",["florida","largo","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Largo, Florida":"The population of Largo, Florida is 80678."}}},
{"id":"n-d49e1e47","guard":[["hasAny",["california","laguna","niguel","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Laguna Niguel, California":"The population of Laguna Niguel, California is 64984."}}},
{"id":"n-dc25a9a5","guard":[["hasAny",["coconut","creek","florida","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Coconut Creek, Florida":"The population of Coconut Creek, Florida is 57731."}}},
{"id":"n-dcbfc409","guard":[["hasAny",["florida","miami","north","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of North Miami, Florida":"The population of North Miami, Florida is 62158."}}},
{"id":"n-df53781d","guard":[["hasAny",["california","pico","population","rivera"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Pico Rivera, California":"The population of Pico Rivera, California is 63724."}}},
{"id":"n-dfeddb5d","guard":[["hasAny",["city","kansas","missouri","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Kansas City, Missouri":"The population of Kansas City, Missouri is 471767."}}},
{"id":"n-e22dd924","guard":[["hasAny",["connecticut","population","stamford"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Stamford, Connecticut":"The population of Stamford, Connecticut is 127410."}}},
{"id":"n-e4de78ed","guard":[["hasAny",["beach","california","newport","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Newport Beach, California":"The population of Newport Beach, California is 86813."}}},
{"id":"n-e4f626a7","guard":[["hasAny",["logan","population","utah"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Logan, Utah":"The population of Logan, Utah is 49539."}}},
{"id":"n-e8316a25","guard":[["hasAny",["bay","cutler","florida","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Cutler Bay, Florida":"The population of Cutler Bay, Florida is 44002."}}},
{"id":"n-eac3dc5c","guard":[["hasAny",["michigan","population","roseville"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Roseville, Michigan":"The population of Roseville, Michigan is 47606."}}},
{"id":"n-ee2cb29f","guard":[["hasAny",["belleville","illinois","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Belleville, Illinois":"The population of Belleville, Illinois is 42729."}}},
{"id":"n-eecae46f","guard":[["hasAny",["population","reston","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the population of Reston, Virginia":"The population of Reston, Virginia is 60070."}}},
{"id":"n-fa6a9d3a","guard":[["hasAny",["population","tuckahoe","virginia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Tuckahoe, Virginia":"The population of Tuckahoe, Virginia is 47997."}}},
{"id":"n-fabfa40e","guard":[["hasAny",["jersey","new","plainfield","population"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the population of Plainfield, New Jersey":"The population of Plainfield, New Jersey is 50578."}}},
{"id":"n-fd056517","guard":[["hasAny",["illinois","population","wheaton"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the population of Wheaton, Illinois":"The population of Wheaton, Illinois is 53568."}}},
{"id":"n-019aeba9","guard":[["has","florissant"],["has","is"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 52218."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-01fecb89","guard":[["hasAny",["livermore","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Livermore, California is 86493."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-034202b5","guard":[["has","charles"],["words<=",8]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 75044."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-06106541","guard":[["has","euless"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 53675."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0a0f7911","guard":[["hasAny",["greenwood","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Greenwood, Indiana is 54564."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-0c1b14da","guard":[["has","haltom"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 43864."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0c6c0730","guard":[["has","marcos"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 91479."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0de27030","guard":[["has","azusa"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 48498."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-10b67d27","guard":[["hasAny",["levittown","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Levittown, New York is 51073."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-12d48890","guard":[["has","arecibo"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 42412."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-156a9309","guard":[["has","aurora"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 200907."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1c934993","guard":[["has","frisco"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 145646."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1d248043","guard":[["hasAny",["longest","longest one","longest word","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Villages, Florida is 69457."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1dcb64ae","guard":[["has","parma"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 80088."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-211407fc","guard":[["has","pleasanton"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 77046."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-23d2a8c9","guard":[["has","redmond"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 59268."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-259dc80d","guard":[["has","yuba"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 66147."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-2d7abb9a","guard":[["has","altadena"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 45001."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-2e99f0c1","guard":[["has","maricopa"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 45473."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-2ebcfe9c","guard":[["has","ontario"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 169389."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-31b51db7","guard":[["hasAny",["longest","longest one","longest word","marcos"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of San Marcos, California is 91479."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-31b71bd3","guard":[["has","renton"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 98499."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-32acc043","guard":[["has","luis"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 46716."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-342287bc","guard":[["has","novi"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 58233."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-364914a5","guard":[["has","antioch"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 108675."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-37119eb3","guard":[["has","pontiac"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 59920."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-393ef058","guard":[["has","denver"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 663303."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3a9fe2c3","guard":[["has","wheaton"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 53568."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3db82a06","guard":[["has","mansfield"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 63141."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3fb8168b","guard":[["has","pensacola"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 53250."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-465544a3","guard":[["has","clair"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 59916."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-496a3668","guard":[["has","angeles"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 3918872."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4a444d94","guard":[["has","wilson"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 49558."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4a7ee214","guard":[["has","brookline"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 59180."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4ad5ce19","guard":[["has","peters"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 55820."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4bfec568","guard":[["has","scranton"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Scranton, Pennsylvania is 76380."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-4faff89f","guard":[["has","duluth"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 86164."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-51e9be5a","guard":[["has","springfield"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 153991."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-52fe96c6","guard":[["hasAny",["longest","longest one","longest word","peters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of St. Peters, Missouri is 55820."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-54b1e0e2","guard":[["has","rochester"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 111396."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-55544bce","guard":[["has","racine"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 77931."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-57e74064","guard":[["has","laguna"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 64984."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-58b3730f","guard":[["has","largo"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 80678."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-5d2e9877","guard":[["has","newark"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 48477."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-5e64d267","guard":[["hasAny",["hoboken","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hoboken, New Jersey is 53136."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-61c07f63","guard":[["has","mountain"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 78827."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-634d6fea","guard":[["hasAny",["cleveland","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Cleveland Heights, Ohio is 45160."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-666c7111","guard":[["has","idaho"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 58933."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-666f0b7d","guard":[["has","pflugerville"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 55712."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6c5dca1a","guard":[["hasAny",["frisco","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Frisco, Texas is 145646."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-6c6f5765","guard":[["has","chesapeake"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 233194."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6dcae9e7","guard":[["has","overland"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 183775."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6e2cc1fa","guard":[["has","castle"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 53789."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6e49f2d1","guard":[["has","bell"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 42805."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6f95b689","guard":[["hasAny",["longest","longest one","longest word","schaumburg"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Schaumburg, Illinois is 74366."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7005af1c","guard":[["has","plainfield"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 50578."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-721834ed","guard":[["hasAny",["longest","longest one","longest word","yuba"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Yuba City, California is 66147."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7377d0f7","guard":[["has","scranton"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 76380."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-74fa1764","guard":[["has","worcester"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 183677."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-75c40abf","guard":[["has","south"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 47919."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-75d106c4","guard":[["has","petersburg"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 253585."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7b6eafa3","guard":[["hasAny",["hammond","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hammond, Indiana is 78349."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7d77a979","guard":[["has","bellevue"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 136718."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7e248ece","guard":[["has","lynn"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 92074."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7eed80c4","guard":[["hasAny",["longest","longest one","longest word","springs"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Colorado Springs, Colorado is 448759."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-7efa56f6","guard":[["hasAny",["longest","longest one","longest word","reston"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Reston, Virginia is 60070."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-805be228","guard":[["has","monterey"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 61001."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8544fa4b","guard":[["has","hammond"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 78349."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-866f87fa","guard":[["has","bethlehem"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 75110."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-892a4af3","guard":[["has","reston"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 60070."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-89b687e7","guard":[["has","barbara"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 90922."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8cf0e8fc","guard":[["has","villages"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 69457."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8d134881","guard":[["has","connecticut"],["words<=",7]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 127410."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-93556c83","guard":[["has","glendale"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 197895."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-96018227","guard":[["hasAny",["hattiesburg","shortest","shortest one","shortest word"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hattiesburg, Mississippi is 46846."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-961eb5b4","guard":[["hasAny",["longest","longest one","longest word","pensacola"]],["has","population"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Pensacola, Florida is 53250."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9b6373aa","guard":[["has","kenosha"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 99865."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-9b7fd4c0","guard":[["has","charlottesville"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 45538."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-9d6cf604","guard":[["hasAny",["casa","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Casa Grande, Arizona is 51571."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-9db8965a","guard":[["has","stockton"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 301443."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-9fbe33b6","guard":[["has","burbank"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 104583."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-a0e53b2b","guard":[["has","bay"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 44002."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-a573bc32","guard":[["hasAny",["glendale","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Glendale, California is 197895."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-a653a6c5","guard":[["has","hoboken"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 53136."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-a977361b","guard":[["has","belleville"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 42729."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-aad2be5b","guard":[["has","logan"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 49539."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-ab6edbc6","guard":[["has","kendall"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 74559."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-ae4de6ec","guard":[["has","austin"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 907779."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b0a20b64","guard":[["has","corona"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 161614."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b3a7d978","guard":[["hasAny",["cuyahoga","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Cuyahoga Falls, Ohio is 49353."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-b6c52154","guard":[["has","iowa"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 68357."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-bbe5a056","guard":[["hasAny",["longest","longest one","longest word","racine"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Racine, Wisconsin is 77931."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-bc4617d1","guard":[["has","coconut"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 57731."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-be0d7b5a","guard":[["has","doral"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 53426."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c18c8a2c","guard":[["has","cleveland"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 45160."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c46c9736","guard":[["hasAny",["costa","longest","longest one","longest word"]],["has","population"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Costa Mesa, California is 112439."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c493376c","guard":[["hasAny",["bell","longest","longest one","longest word"]],["has","what"],["has","population"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bell Gardens, California is 42805."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-c52ad310","guard":[["has","costa"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 112439."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-cb989436","guard":[["has","fort"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 43883."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-cc2a852e","guard":[["has","tuckahoe"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 47997."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-d1c0b2a6","guard":[["hasAny",["longest","longest one","longest word","suffolk"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Suffolk, Virginia is 87061."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d3448ea0","guard":[["has","beach"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 86813."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-d350928c","guard":[["has","suffolk"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 87061."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-d4b27f36","guard":[["hasAny",["longest","longest one","longest word","newark"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Newark, Ohio is 48477."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-d7e334dd","guard":[["has","cuyahoga"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 49353."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-d8130852","guard":[["has","rialto"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 102418."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-dca413ee","guard":[["has","levittown"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 51073."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-dcdecefc","guard":[["has","schaumburg"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 74366."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-dd0dadb2","guard":[["has","hattiesburg"],["has","is"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 46846."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-dd52f2b3","guard":[["has","findlay"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 41412."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-df254eb2","guard":[["has","bethlehem"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bethlehem, Pennsylvania is 75110."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-df6643c6","guard":[["has","roseville"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 47606."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e20a7088","guard":[["has","livermore"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 86493."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e3c536e2","guard":[["has","alabama"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 201717."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e4023225","guard":[["has","south"],["has","summerville"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Summerville, South Carolina is 47919."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-e40d4164","guard":[["hasAny",["aurora","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Aurora, Illinois is 200907."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-e6f5e8dd","guard":[["has","elizabeth"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 128042."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-ecb45a38","guard":[["has","allentown"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 119624."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-ed092889","guard":[["has","highlands"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 46841."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f3b1a296","guard":[["has","pico"],["has","is"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 63724."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f50d6028","guard":[["has","urbana"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 41941."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f5ad6638","guard":[["has","greenwood"],["has","what"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 54564."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f6cb43a1","guard":[["hasAny",["longest","longest one","longest word","tuckahoe"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tuckahoe, Virginia is 47997."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f9192515","guard":[["has","springs"],["has","tell"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 448759."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-facfde46","guard":[["has","casa"],["has","give"]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 51571."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-fc23587e","guard":[["has","pflugerville"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Pflugerville, Texas is 55712."]},["sense.wordAt",{"lit":3}]],"mem":null},
{"id":"n-fd964bf1","guard":[["has","alto"],["words<=",9]],"pyramid":["render.template",{"lit":["The population ",{"slot":0}," is 46226."]},["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8e4aa9ad","guard":[["hasAny",["item number","nth","position","worcester"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Worcester, Massachusetts is 183677."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-f996fa1c","guard":[["hasAny",["allentown","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Allentown, Pennsylvania is 119624."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-01991489","guard":[["hasAny",["levittown","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51073."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-023096ee","guard":[["hasAny",["clair","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59916."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-05370f17","guard":[["has","pontiac"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59920."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-054d25d2","guard":[["hasAny",["largo","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80678."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0765c79c","guard":[["hasAny",["pleasanton","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77046."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-09adc7de","guard":[["has","alabama"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 201717."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0aaceceb","guard":[["hasAny",["longest","longest one","longest word","pensacola"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53250."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0fcde8b4","guard":[["hasAny",["longest","longest one","longest word","parma"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80088."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1231f8bd","guard":[["has","springfield"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 153991."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-157b0f8a","guard":[["hasAny",["longest","longest one","longest word","reston"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 60070."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-162688d3","guard":[["hasAny",["longest","longest one","longest word","schaumburg"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74366."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-17e0e709","guard":[["hasAny",["charles","longest","longest one","longest word"]],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75044."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1926d017","guard":[["hasAny",["longest","longest one","longest word","tuckahoe"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47997."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1a8fe5bd","guard":[["hasAny",["longest","longest one","longest word","plainfield"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 50578."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1b9a0749","guard":[["has","casa"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51571."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1cc39738","guard":[["hasAny",["longest","longest one","longest word","racine"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77931."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1d17eced","guard":[["has","south"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47919."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1e465248","guard":[["hasAny",["bell","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42805."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1e766d59","guard":[["hasAny",["longest","longest one","longest word","maricopa"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45473."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-22808438","guard":[["hasAny",["antioch","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 108675."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-239668bc","guard":[["hasAny",["iowa","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 68357."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-2552ce44","guard":[["hasAny",["alabama","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 201717."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-25b9d820","guard":[["hasAny",["longest","longest one","longest word","petersburg"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 253585."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-26ddb85c","guard":[["has","bethlehem"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75110."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-297ac506","guard":[["hasAny",["euless","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53675."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-29d59332","guard":[["hasAny",["longest","longest one","longest word","monterey"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 61001."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-2a65c2be","guard":[["hasAny",["longest","longest one","longest word","wheaton"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53568."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-2d26eee5","guard":[["hasAny",["duluth","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86164."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-2ffd2058","guard":[["hasAny",["longest","longest one","longest word","wilson"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49558."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-39c3a1d4","guard":[["hasAny",["bellevue","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 136718."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3a65cdc7","guard":[["hasAny",["logan","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49539."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3b14fe84","guard":[["hasAny",["hattiesburg","shortest","shortest one","shortest word"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46846."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3f8ff7d8","guard":[["hasAny",["longest","longest one","longest word","urbana"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41941."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4250c01d","guard":[["has","chesapeake"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 233194."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-43b0b591","guard":[["hasAny",["haltom","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43864."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-45a9d13a","guard":[["hasAny",["livermore","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86493."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-45c34b6b","guard":[["hasAny",["hammond","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78349."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4954b2ae","guard":[["has","kendall"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74559."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4a94cf18","guard":[["hasAny",["glendale","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 197895."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4b229fde","guard":[["has","rochester"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 111396."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4b4bcaa1","guard":[["hasAny",["bay","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 44002."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-52eb275f","guard":[["hasAny",["longest","longest one","longest word","stockton"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 301443."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-53973479","guard":[["has","hammond"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78349."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-5693c45b","guard":[["hasAny",["longest","longest one","longest word","pico"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63724."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-5ac4189a","guard":[["has","pflugerville"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55712."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-5f5811d3","guard":[["has","maricopa"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45473."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-600c31ed","guard":[["has","villages"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 69457."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-60dfd3e8","guard":[["hasAny",["longest","longest one","longest word","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 69457."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-61387877","guard":[["hasAny",["chesapeake","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 233194."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6287cb54","guard":[["has","glendale"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 197895."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6418e6cf","guard":[["hasAny",["findlay","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41412."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-647358b6","guard":[["has","iowa"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 68357."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-679cec67","guard":[["has","petersburg"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 253585."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6d3a7969","guard":[["hasAny",["longest","longest one","longest word","peters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55820."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-72966107","guard":[["hasAny",["altadena","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45001."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-754503ae","guard":[["hasAny",["barbara","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 90922."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-764e281f","guard":[["has","arecibo"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42412."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-769dbe9d","guard":[["hasAny",["corona","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 161614."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-781b8a96","guard":[["hasAny",["shortest","shortest one","shortest word","springfield"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 153991."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-799ef7ce","guard":[["hasAny",["cuyahoga","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49353."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7c96c108","guard":[["has","newark"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48477."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7df78663","guard":[["hasAny",["greenwood","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 54564."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7e218fa0","guard":[["hasAny",["longest","longest one","longest word","mountain"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78827."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8047d8d9","guard":[["has","marcos"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 91479."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8088330d","guard":[["hasAny",["frisco","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 145646."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-808ebd68","guard":[["hasAny",["alto","longest","longest one","longest word"]],["words<=",9]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46226."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-81781f77","guard":[["hasAny",["arecibo","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42412."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-81a1c964","guard":[["hasAny",["fort","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43883."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-853ed2e7","guard":[["hasAny",["longest","longest one","longest word","novi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58233."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-874a7e0b","guard":[["has","livermore"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86493."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-880bc321","guard":[["has","reston"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 60070."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8b6f6dbb","guard":[["hasAny",["longest","longest one","longest word","suffolk"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 87061."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8c0fc552","guard":[["hasAny",["austin","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 907779."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8cfba9b8","guard":[["hasAny",["hoboken","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53136."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8f7ae27b","guard":[["hasAny",["longest","longest one","longest word","redmond"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59268."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8f8c29cd","guard":[["hasAny",["longest","longest one","longest word","mansfield"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63141."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-909e9843","guard":[["has","scranton"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 76380."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-919c1dda","guard":[["hasAny",["longest","longest one","longest word","pleasanton"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77046."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-92650a18","guard":[["hasAny",["longest","longest one","longest word","newark"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48477."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-943e7a52","guard":[["hasAny",["longest","longest one","longest word","ontario"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 169389."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-95c656b1","guard":[["hasAny",["casa","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51571."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-98c564c2","guard":[["hasAny",["coconut","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 57731."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-9b54892b","guard":[["hasAny",["angeles","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3918872."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-9ea009bd","guard":[["has","haltom"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43864."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-a01eab65","guard":[["hasAny",["florissant","longest","longest one","longest word"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 52218."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-a4274294","guard":[["hasAny",["longest","longest one","longest word","rialto"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 102418."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-a99647ae","guard":[["hasAny",["longest","longest one","longest word","yuba"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 66147."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b51986dc","guard":[["has","kenosha"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 99865."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b76865b7","guard":[["hasAny",["denver","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 663303."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-bb6afbb0","guard":[["hasAny",["elizabeth","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 128042."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-bd381aec","guard":[["hasAny",["aurora","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 200907."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-bd3e177d","guard":[["has","barbara"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 90922."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-bef0d4d9","guard":[["hasAny",["longest","longest one","longest word","pontiac"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59920."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c019b622","guard":[["hasAny",["laguna","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 64984."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c0ab064f","guard":[["hasAny",["longest","longest one","longest word","overland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 183775."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c1c39531","guard":[["hasAny",["idaho","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58933."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c3b6d3f9","guard":[["hasAny",["highlands","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46841."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c48fea81","guard":[["hasAny",["longest","longest one","longest word","marcos"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 91479."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-cbac911d","guard":[["hasAny",["burbank","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 104583."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-cd17bd42","guard":[["hasAny",["beach","longest","longest one","longest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86813."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-cd4e995b","guard":[["hasAny",["azusa","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48498."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-d1a1575f","guard":[["hasAny",["cleveland","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45160."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-d40d287a","guard":[["hasAny",["longest","longest one","longest word","luis"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46716."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-da73be93","guard":[["hasAny",["longest","longest one","longest word","renton"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 98499."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-dc35de29","guard":[["hasAny",["kenosha","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 99865."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-de87c81c","guard":[["has","stockton"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 301443."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-df0b32a3","guard":[["hasAny",["costa","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 112439."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e148771f","guard":[["has","largo"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80678."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e1d381b7","guard":[["hasAny",["castle","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53789."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e481d7d9","guard":[["hasAny",["belleville","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42729."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e518be6c","guard":[["hasAny",["longest","longest one","longest word","rochester"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 111396."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e5229f38","guard":[["has","bay"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 44002."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e7fad4b0","guard":[["has","costa"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 112439."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e9821372","guard":[["has","highlands"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46841."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-efe1692a","guard":[["hasAny",["longest","longest one","longest word","roseville"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47606."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f0b8d86d","guard":[["hasAny",["longest","longest one","longest word","springs"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 448759."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f139202c","guard":[["hasAny",["doral","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53426."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f57500bf","guard":[["hasAny",["kendall","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74559."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f6e76aec","guard":[["has","angeles"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3918872."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-00235df1","guard":[["hasAny",["idaho","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58933."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-00ebf57f","guard":[["hasAny",["all caps","capital letters","capitals","denver","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 663303."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0118db74","guard":[["hasAny",["bellevue","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 136718."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-012501b4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","casa","longest","longest one","longest word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51571."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-025788c7","guard":[["hasAny",["element","item number","nth","pico","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63724."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-02ae02a5","guard":[["hasAny",["element","item number","laguna","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 64984."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0319065b","guard":[["hasAny",["all caps","capital letters","capitals","coconut","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 57731."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0328e103","guard":[["hasAny",["kenosha","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 99865."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-03cc4cd1","guard":[["hasAny",["all caps","capital letters","capitals","cuyahoga","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49353."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-05bba1ea","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","springs"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 448759."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-05e93bd9","guard":[["hasAny",["invert case","shortest","shortest one","shortest word","springfield","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 153991."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0601bd74","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","overland","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 183775."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-06122420","guard":[["hasAny",["all caps","beach","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86813."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-06125f8d","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","urbana"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41941."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-06c2fd37","guard":[["hasAny",["element","item number","nth","position","suffolk"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 87061."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-07a4e968","guard":[["hasAny",["azusa","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48498."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-07f8de9a","guard":[["hasAny",["all caps","capital letters","capitals","idaho","longest","longest one","longest word","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58933."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-08291ddf","guard":[["hasAny",["all caps","capital letters","capitals","kendall","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74559."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-08712e69","guard":[["hasAny",["all caps","barbara","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 90922."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-088c246d","guard":[["hasAny",["clair","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59916."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-090e920d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","rochester","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 111396."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-09356cec","guard":[["hasAny",["barbara","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 90922."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-09671b5b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","haltom","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43864."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0a6c2009","guard":[["hasAny",["element","item number","mountain","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78827."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0a88e007","guard":[["hasAny",["invert case","iowa","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 68357."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0ad373a8","guard":[["hasAny",["florissant","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 52218."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0b73e0b5","guard":[["hasAny",["burbank","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 104583."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0bdc29e6","guard":[["hasAny",["element","item number","nth","pleasanton","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77046."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0c3a728e","guard":[["hasAny",["invert case","longest","longest one","longest word","reston","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 60070."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0d69a86f","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","marcos","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 91479."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0e364010","guard":[["hasAny",["invert case","springfield","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 153991."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0e718243","guard":[["hasAny",["euless","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53675."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0f4d61e0","guard":[["hasAny",["all caps","antioch","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 108675."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0f82ba2e","guard":[["hasAny",["greenwood","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 54564."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-0ffbef10","guard":[["hasAny",["capitalise","capitalize","capitalize each word","frisco","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 145646."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-106aee73","guard":[["hasAny",["cleveland","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45160."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-10a527f7","guard":[["hasAny",["element","item number","nth","plainfield","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 50578."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-10c42598","guard":[["hasAny",["all caps","capital letters","capitals","clair","longest","longest one","longest word","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59916."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-11790353","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","pico","small letters"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63724."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-11d8f0a9","guard":[["hasAny",["invert case","longest","longest one","longest word","springs","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 448759."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-12073410","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","redmond","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59268."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-1264ca93","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","luis","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46716."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-13bab0ae","guard":[["hasAny",["bell","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42805."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-13e2dd7d","guard":[["hasAny",["invert case","kenosha","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 99865."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-13e7c648","guard":[["hasAny",["all caps","angeles","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3918872."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-145a9ec0","guard":[["hasAny",["hammond","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78349."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-14ababf9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","petersburg","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 253585."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-14c1fe7c","guard":[["hasAny",["altadena","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45001."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-14e8b861","guard":[["hasAny",["denver","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 663303."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1542ac25","guard":[["hasAny",["element","item number","nth","overland","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 183775."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-17397b38","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","pontiac","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59920."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-17408eca","guard":[["hasAny",["all caps","capital letters","capitals","fort","longest","longest one","longest word","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43883."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-1868a550","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","stockton","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 301443."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-190da751","guard":[["hasAny",["haltom","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43864."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-19539500","guard":[["hasAny",["capitalise","capitalize","capitalize each word","livermore","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86493."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-19f64a1a","guard":[["hasAny",["angeles","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3918872."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-19fd37a3","guard":[["hasAny",["duluth","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86164."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1b6e833e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fort","longest","longest one","longest word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43883."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-1bcf56b2","guard":[["hasAny",["element","item number","lynn","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 92074."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1bffd033","guard":[["hasAny",["largo","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80678."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-1cdf7b22","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","tuckahoe","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47997."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-1d8f53f1","guard":[["hasAny",["alabama","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 201717."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-1e416486","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","schaumburg","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74366."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-207ccd12","guard":[["hasAny",["element","greenwood","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 54564."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-20b7f2c7","guard":[["hasAny",["invert case","longest","longest one","longest word","overland","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 183775."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-20c4ce48","guard":[["hasAny",["chesapeake","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 233194."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-218b3244","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","suffolk","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 87061."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-220452fa","guard":[["hasAny",["all caps","belleville","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42729."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-22ac3a06","guard":[["hasAny",["invert case","livermore","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86493."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-22e283ba","guard":[["hasAny",["frisco","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 145646."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-24003bf2","guard":[["hasAny",["element","fort","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43883."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-2492ae11","guard":[["hasAny",["bethlehem","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75110."]},["sense.wordAt",{"lit":3}],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-24ab2b55","guard":[["hasAny",["alabama","invert case","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 201717."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-24eb91cd","guard":[["hasAny",["hammond","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78349."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-24fbaff2","guard":[["hasAny",["all caps","bay","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 44002."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-2706f299","guard":[["hasAny",["invert case","longest","longest one","longest word","pontiac","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59920."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-2708813e","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","petersburg","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 253585."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-279eee8e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kenosha","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 99865."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-2800bec6","guard":[["hasAny",["element","item number","nth","position","tuckahoe"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47997."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-2810718b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","stockton","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 301443."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-2d61bdb7","guard":[["hasAny",["invert case","longest","longest one","longest word","monterey","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 61001."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-2de89712","guard":[["hasAny",["arecibo","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42412."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-2e2c0485","guard":[["hasAny",["doral","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53426."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-2f57f1d5","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","newark","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48477."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-2f65afcb","guard":[["hasAny",["arecibo","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42412."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-2fa73ebf","guard":[["hasAny",["angeles","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3918872."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-2fdd077a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","coconut","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 57731."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-30ca7ddb","guard":[["hasAny",["all caps","burbank","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 104583."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3116e865","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","racine","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77931."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3132a0de","guard":[["hasAny",["bethlehem","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75110."]},["sense.wordAt",{"lit":3}],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-318ea349","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","ontario","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 169389."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-32af36d1","guard":[["hasAny",["highlands","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46841."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3311d2ee","guard":[["hasAny",["all caps","capital letters","capitals","greenwood","longest","longest one","longest word","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 54564."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-337857f0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cleveland","longest","longest one","longest word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45160."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3397f9a2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","greenwood","longest","longest one","longest word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 54564."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-35ca8474","guard":[["hasAny",["belleville","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42729."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3626303b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","stockton","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 301443."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-36b1e516","guard":[["hasAny",["invert case","longest","longest one","longest word","luis","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46716."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-37a8b21e","guard":[["hasAny",["hattiesburg","lower case","lowercase","shortest","shortest one","shortest word","small letters"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46846."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-38845567","guard":[["hasAny",["invert case","longest","longest one","longest word","plainfield","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 50578."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-39435c8a","guard":[["hasAny",["costa","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 112439."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-39490e39","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","monterey","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 61001."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3a367597","guard":[["hasAny",["altadena","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45001."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3aaf2a06","guard":[["hasAny",["all caps","capital letters","capitals","florissant","longest","longest one","longest word","upper case","uppercase"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 52218."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3b16ca27","guard":[["hasAny",["bell","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42805."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3bd07902","guard":[["hasAny",["castle","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53789."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3c5afe6c","guard":[["hasAny",["allentown","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 119624."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3c62002d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 69457."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3c71658e","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","pontiac","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59920."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3c9aa129","guard":[["hasAny",["all caps","bethlehem","capital letters","capitals","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75110."]},["sense.wordAt",{"lit":3}],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3da5b67f","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 69457."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3dc20fd1","guard":[["hasAny",["invert case","scranton","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 76380."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3e074b8e","guard":[["hasAny",["element","elizabeth","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 128042."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3eaef0e9","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","upper case","uppercase","wilson"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49558."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3f384363","guard":[["hasAny",["beach","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86813."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3f7c251b","guard":[["hasAny",["all caps","capital letters","capitals","hammond","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78349."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3fafaf00","guard":[["hasAny",["all caps","capital letters","capitals","scranton","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 76380."]},["sense.wordAt",{"lit":3}],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-40855d52","guard":[["hasAny",["capitalise","capitalize","capitalize each word","livermore","longest","longest one","longest word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86493."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4090078e","guard":[["hasAny",["invert case","marcos","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 91479."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-41f6afbf","guard":[["hasAny",["findlay","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41412."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4200005c","guard":[["hasAny",["belleville","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42729."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-420bcc44","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","renton","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 98499."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-42ca18d3","guard":[["hasAny",["bellevue","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 136718."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-432b31f0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","castle","longest","longest one","longest word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53789."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-432e61ec","guard":[["hasAny",["alto","invert case","longest","longest one","longest word","swap case","toggle case"]],["words<=",9]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46226."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-43d349ba","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","suffolk","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 87061."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-443ebc14","guard":[["hasAny",["capitalise","capitalize","capitalize each word","duluth","longest","longest one","longest word","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86164."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-44f5ed4e","guard":[["hasAny",["invert case","largo","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80678."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-45309249","guard":[["hasAny",["azusa","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48498."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-463d934a","guard":[["hasAny",["highlands","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46841."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4640485c","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","luis","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46716."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-46c0735d","guard":[["hasAny",["logan","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49539."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4709f7b8","guard":[["hasAny",["all caps","capital letters","capitals","logan","longest","longest one","longest word","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49539."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-487309c5","guard":[["hasAny",["hattiesburg","invert case","shortest","shortest one","shortest word","swap case","toggle case"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46846."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4912860b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iowa","longest","longest one","longest word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 68357."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4918cd25","guard":[["hasAny",["element","item number","nth","position","yuba"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 66147."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4941fc72","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","pensacola","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53250."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-49834e00","guard":[["hasAny",["all caps","capital letters","capitals","charles","longest","longest one","longest word","upper case","uppercase"]],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75044."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4a62c462","guard":[["hasAny",["element","item number","nth","position","redmond"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59268."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4b2c9c6e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pflugerville","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55712."]},["sense.wordAt",{"lit":3}],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4b49dae9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chesapeake","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 233194."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4b666cdf","guard":[["hasAny",["all caps","capital letters","capitals","costa","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 112439."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4ba5dcb3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","redmond","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59268."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4bf92bbb","guard":[["hasAny",["all caps","capital letters","capitals","duluth","longest","longest one","longest word","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86164."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4c514384","guard":[["hasAny",["invert case","pflugerville","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55712."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4c74eced","guard":[["hasAny",["fort","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43883."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4ca9bebd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","springs","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 448759."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4cae3659","guard":[["hasAny",["element","item number","nth","pensacola","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53250."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4df40205","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","roseville","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47606."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4e0122fb","guard":[["hasAny",["all caps","altadena","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45001."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4e582251","guard":[["hasAny",["element","item number","novi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58233."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4f907aea","guard":[["hasAny",["element","findlay","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41412."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4ffdcfea","guard":[["hasAny",["coconut","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 57731."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-50bad434","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","upper case","uppercase","urbana"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41941."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-51fc51f8","guard":[["hasAny",["elizabeth","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 128042."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5278280c","guard":[["hasAny",["altadena","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45001."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-52c90c74","guard":[["hasAny",["invert case","laguna","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 64984."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-535863c0","guard":[["hasAny",["castle","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53789."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-53a46e80","guard":[["hasAny",["all caps","bellevue","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 136718."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-543ca8f1","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","peters","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55820."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-54b2497b","guard":[["hasAny",["cuyahoga","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49353."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-54ce13b3","guard":[["hasAny",["laguna","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 64984."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-56483397","guard":[["hasAny",["capitalise","capitalize","capitalize each word","largo","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80678."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-56aeec30","guard":[["hasAny",["capitalise","capitalize","capitalize each word","corona","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 161614."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-56be868c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","denver","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 663303."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-56d5d7c0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","pico","title case"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63724."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-570a72e2","guard":[["hasAny",["barbara","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 90922."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-573e223b","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","rialto","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 102418."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5840b72f","guard":[["hasAny",["doral","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53426."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-58d219fe","guard":[["hasAny",["element","euless","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53675."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-58ef4a46","guard":[["hasAny",["all caps","arecibo","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42412."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5916fc2b","guard":[["hasAny",["invert case","kendall","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74559."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-59a703c2","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","monterey","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 61001."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-59f5f2ce","guard":[["hasAny",["iowa","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 68357."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5a15540a","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","mansfield","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63141."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5a2df01d","guard":[["hasAny",["connecticut","element","item number","nth","position"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 127410."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-5a48da03","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","parma","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80088."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5a66892e","guard":[["hasAny",["all caps","austin","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 907779."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5a7bb916","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","upper case","uppercase","yuba"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 66147."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5aa8e9b6","guard":[["hasAny",["all caps","capital letters","capitals","levittown","longest","longest one","longest word","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51073."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5c231e39","guard":[["hasAny",["levittown","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51073."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5c64427b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","glendale","longest","longest one","longest word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 197895."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5df2fa7e","guard":[["hasAny",["hammond","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78349."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5e161bfd","guard":[["hasAny",["altadena","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45001."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5e5b1601","guard":[["hasAny",["capitalise","capitalize","capitalize each word","findlay","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41412."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5e8e0a6f","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","reston","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 60070."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5f472d4f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","costa","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 112439."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-604997f7","guard":[["hasAny",["invert case","petersburg","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 253585."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-608493ac","guard":[["hasAny",["capitalise","capitalize","capitalize each word","logan","longest","longest one","longest word","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49539."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-60cd4a1b","guard":[["hasAny",["cleveland","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45160."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6103680b","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","ontario","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 169389."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-61103b9e","guard":[["hasAny",["alabama","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 201717."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-611a4191","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","wheaton"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53568."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-61bb0102","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","plainfield","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 50578."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-62d44ee7","guard":[["hasAny",["corona","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 161614."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6304acf4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iowa","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 68357."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-635a0552","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","novi","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58233."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-635a5bd3","guard":[["hasAny",["castle","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53789."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-64465ad1","guard":[["hasAny",["kendall","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74559."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6548e3dd","guard":[["hasAny",["invert case","newark","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48477."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-65595a33","guard":[["hasAny",["antioch","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 108675."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-65b5d8f0","guard":[["hasAny",["element","item number","nth","position","racine"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77931."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-67fa9263","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","tuckahoe"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47997."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-683a483a","guard":[["hasAny",["beach","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86813."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-68a0ffa0","guard":[["hasAny",["element","frisco","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 145646."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-68d69b0a","guard":[["hasAny",["all caps","capital letters","capitals","elizabeth","longest","longest one","longest word","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 128042."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-691d84db","guard":[["hasAny",["capitalise","capitalize","capitalize each word","highlands","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46841."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-69c2b730","guard":[["hasAny",["element","item number","levittown","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51073."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6a479ecf","guard":[["hasAny",["invert case","longest","longest one","longest word","swap case","toggle case","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 69457."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6b2eee65","guard":[["hasAny",["element","item number","nth","peters","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55820."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6b360058","guard":[["hasAny",["all caps","capital letters","capitals","hoboken","longest","longest one","longest word","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53136."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6b4809cc","guard":[["hasAny",["all caps","aurora","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 200907."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6b66b165","guard":[["hasAny",["idaho","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58933."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6b9274d1","guard":[["hasAny",["lower case","lowercase","shortest","shortest one","shortest word","small letters","springfield"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 153991."]},["aggregate.shortest",["sense.content"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6bc95ea4","guard":[["hasAny",["bay","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 44002."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6bdee62e","guard":[["hasAny",["austin","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 907779."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6beebc9d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 69457."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6bf0c0ca","guard":[["hasAny",["capitalise","capitalize","capitalize each word","costa","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 112439."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6db7927e","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","racine","small letters"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77931."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6f24d965","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cuyahoga","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49353."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6f45abf1","guard":[["hasAny",["arecibo","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42412."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6f5944ba","guard":[["hasAny",["invert case","stockton","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 301443."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6f6a09a2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","peters","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55820."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6f7d5081","guard":[["hasAny",["element","item number","nth","position","roseville"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47606."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6f827c72","guard":[["hasAny",["element","item number","nth","ontario","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 169389."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6f9846fe","guard":[["hasAny",["bethlehem","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75110."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6fef3591","guard":[["hasAny",["denver","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 663303."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-702f0712","guard":[["hasAny",["alto","longest","longest one","longest word","lower case","lowercase","small letters"]],["words<=",9]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46226."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-705e2b45","guard":[["hasAny",["invert case","kendall","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74559."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-70695b72","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","parma","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80088."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7111574e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pflugerville","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55712."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7119637d","guard":[["hasAny",["invert case","longest","longest one","longest word","peters","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55820."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7125b2fc","guard":[["hasAny",["doral","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53426."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-71928b3b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","marcos","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 91479."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-71abef8c","guard":[["hasAny",["invert case","longest","longest one","longest word","maricopa","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45473."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-71f8f168","guard":[["hasAny",["element","item number","nth","position","wilson"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49558."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-72132414","guard":[["hasAny",["element","hoboken","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53136."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7258ebbe","guard":[["hasAny",["charles","invert case","longest","longest one","longest word","swap case","toggle case"]],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75044."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-725fdf1d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","glendale","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 197895."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-726052e5","guard":[["hasAny",["bay","invert case","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 44002."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-72686ac9","guard":[["hasAny",["clair","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59916."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-728cdba9","guard":[["hasAny",["invert case","longest","longest one","longest word","suffolk","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 87061."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-735c7219","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","rialto","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 102418."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7377aace","guard":[["hasAny",["hoboken","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53136."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-73c2f133","guard":[["hasAny",["arecibo","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42412."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-744c8bbe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","marcos","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 91479."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-75be0261","guard":[["hasAny",["element","item number","mansfield","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63141."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7663ab21","guard":[["hasAny",["barbara","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 90922."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7774b597","guard":[["hasAny",["clair","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59916."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-778944a6","guard":[["hasAny",["antioch","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 108675."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7836ae0f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","novi","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58233."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7935870f","guard":[["hasAny",["all caps","capital letters","capitals","euless","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53675."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7941b08f","guard":[["hasAny",["haltom","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43864."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-79512375","guard":[["hasAny",["capitalise","capitalize","capitalize each word","springfield","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 153991."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-79b1eb63","guard":[["hasAny",["bellevue","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 136718."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-79b23f92","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","maricopa","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45473."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-79e1a37c","guard":[["hasAny",["invert case","levittown","longest","longest one","longest word","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51073."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7a747ccb","guard":[["hasAny",["invert case","rochester","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 111396."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7afc0446","guard":[["hasAny",["angeles","invert case","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3918872."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7b9b9d18","guard":[["hasAny",["invert case","longest","longest one","longest word","swap case","toggle case","yuba"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 66147."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7c2aa35c","guard":[["hasAny",["burbank","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 104583."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7c41becf","guard":[["hasAny",["bell","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42805."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7d87da8b","guard":[["hasAny",["invert case","logan","longest","longest one","longest word","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49539."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7d949c9f","guard":[["hasAny",["invert case","longest","longest one","longest word","ontario","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 169389."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7e00360d","guard":[["hasAny",["charles","element","item number","nth","position"]],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75044."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7e1d40dc","guard":[["hasAny",["duluth","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86164."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7e86c36b","guard":[["hasAny",["duluth","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86164."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7e922dbc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","haltom","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43864."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7f58a24b","guard":[["hasAny",["corona","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 161614."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7fb04716","guard":[["hasAny",["aurora","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 200907."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-80b21d46","guard":[["hasAny",["all caps","capital letters","capitals","haltom","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43864."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-80c51cce","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case","wheaton"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53568."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-80f4d313","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case","tuckahoe"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47997."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-80fa7dfa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","doral","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53426."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8177439c","guard":[["hasAny",["austin","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 907779."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-826c262b","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","upper case","uppercase","wheaton"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53568."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-83274a93","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hammond","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78349."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-83a95aaf","guard":[["hasAny",["all caps","alto","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]],["words<=",9]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46226."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-84337387","guard":[["hasAny",["chesapeake","invert case","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 233194."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-851fea98","guard":[["hasAny",["all caps","capital letters","capitals","pflugerville","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55712."]},["sense.wordAt",{"lit":3}],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-87df72be","guard":[["hasAny",["capitalise","capitalize","capitalize each word","scranton","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 76380."]},["sense.wordAt",{"lit":3}],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-87eacb79","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","springs","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 448759."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-88013cd1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","reston","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 60070."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-885acc66","guard":[["hasAny",["all caps","capital letters","capitals","hattiesburg","shortest","shortest one","shortest word","upper case","uppercase"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46846."]},["aggregate.shortest",["sense.content"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-88e9a007","guard":[["hasAny",["cuyahoga","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49353."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-892336f0","guard":[["hasAny",["invert case","longest","longest one","longest word","renton","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 98499."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-896b1a02","guard":[["hasAny",["chesapeake","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 233194."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-898e01dc","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","peters","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55820."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8af4ad68","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","pleasanton","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77046."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8b55496d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","idaho","longest","longest one","longest word","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58933."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8bd78a76","guard":[["hasAny",["element","item number","logan","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49539."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8d4c02f7","guard":[["hasAny",["aurora","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 200907."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8d583736","guard":[["hasAny",["aurora","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 200907."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8e45f0f9","guard":[["hasAny",["bell","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42805."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8e7b44c9","guard":[["hasAny",["glendale","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 197895."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8ead0a40","guard":[["hasAny",["bay","capitalise","capitalize","capitalize each word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 44002."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8edae663","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","maricopa","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45473."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8f39745d","guard":[["hasAny",["antioch","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 108675."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8f424fc1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","pontiac","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59920."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8fa31eda","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","newark","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48477."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8fa58813","guard":[["hasAny",["coconut","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 57731."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-909ebe1e","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","ontario","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 169389."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-90ac88b7","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","maricopa","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45473."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9154eea4","guard":[["hasAny",["all caps","capital letters","capitals","kenosha","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 99865."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-92960c82","guard":[["hasAny",["element","item number","nth","position","urbana"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41941."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-92e1f2cb","guard":[["hasAny",["charlottesville","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45538."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-934b3762","guard":[["hasAny",["all caps","bell","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42805."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-93520ec6","guard":[["hasAny",["invert case","longest","longest one","longest word","racine","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77931."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-93557a2b","guard":[["hasAny",["invert case","longest","longest one","longest word","stockton","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 301443."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-94271eb9","guard":[["hasAny",["all caps","capital letters","capitals","livermore","longest","longest one","longest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86493."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-94f4df8e","guard":[["hasAny",["findlay","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41412."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-95090795","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","roseville","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47606."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-95bab89c","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","marcos","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 91479."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9716db4e","guard":[["hasAny",["element","item number","nth","position","wheaton"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53568."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-97381a21","guard":[["hasAny",["lower case","lowercase","scranton","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 76380."]},["sense.wordAt",{"lit":3}],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9779745f","guard":[["hasAny",["invert case","longest","longest one","longest word","roseville","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47606."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-98f5e3e1","guard":[["hasAny",["casa","invert case","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51571."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-996fd870","guard":[["hasAny",["barbara","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 90922."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-99a2c173","guard":[["hasAny",["haltom","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43864."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9a096d51","guard":[["hasAny",["casa","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51571."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9a1d3d9f","guard":[["hasAny",["all caps","capital letters","capitals","chesapeake","longest","longest one","longest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 233194."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9afbd14f","guard":[["hasAny",["elizabeth","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 128042."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9b08f955","guard":[["hasAny",["bellevue","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 136718."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9b29fe5c","guard":[["hasAny",["invert case","longest","longest one","longest word","rochester","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 111396."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9b36eb77","guard":[["hasAny",["azusa","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48498."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-9b6e0c2c","guard":[["hasAny",["all caps","azusa","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48498."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9bda5703","guard":[["hasAny",["azusa","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48498."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9c0d3db1","guard":[["hasAny",["invert case","pontiac","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59920."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-9c5893de","guard":[["hasAny",["element","item number","monterey","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 61001."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-9c9c9139","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","pensacola","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53250."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9de9ef43","guard":[["hasAny",["invert case","longest","longest one","longest word","swap case","toggle case","wheaton"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53568."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9e2fb509","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","overland","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 183775."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9e4d02db","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","petersburg","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 253585."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-9e9124a4","guard":[["hasAny",["element","item number","nth","position","rialto"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 102418."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-9eccb044","guard":[["hasAny",["capitalise","capitalize","capitalize each word","levittown","longest","longest one","longest word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51073."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-a0e8cc9b","guard":[["hasAny",["invert case","iowa","longest","longest one","longest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 68357."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-a2145389","guard":[["hasAny",["element","florissant","item number","nth","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 52218."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-a31ec241","guard":[["hasAny",["glendale","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 197895."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-a542d5cd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case","urbana"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41941."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-a839bace","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","renton","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 98499."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-a874577a","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","schaumburg","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74366."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-a8cea24b","guard":[["hasAny",["all caps","capital letters","capitals","largo","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80678."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-a8f9aebf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","pleasanton","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77046."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-a93ecbda","guard":[["hasAny",["invert case","longest","longest one","longest word","rialto","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 102418."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-a979e622","guard":[["hasAny",["burbank","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 104583."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-aa092d98","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","parma","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80088."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-aaaab082","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","plainfield","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 50578."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-aae7bb7c","guard":[["hasAny",["angeles","capitalise","capitalize","capitalize each word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3918872."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-adbc5b3d","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","stockton"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 301443."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-aeabb1e1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hoboken","longest","longest one","longest word","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53136."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-af5f02f3","guard":[["hasAny",["austin","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 907779."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-aff4c95a","guard":[["hasAny",["all caps","capital letters","capitals","casa","longest","longest one","longest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51571."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b00d2488","guard":[["hasAny",["element","item number","luis","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46716."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b08d8d86","guard":[["hasAny",["all caps","capital letters","capitals","corona","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 161614."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b1277122","guard":[["hasAny",["element","item number","nth","position","schaumburg"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74366."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b3a13a6f","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","mountain","small letters"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78827."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b483f172","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","wilson"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49558."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b48a3ed7","guard":[["hasAny",["invert case","maricopa","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45473."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b4a46205","guard":[["hasAny",["invert case","longest","longest one","longest word","parma","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80088."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b4e75d99","guard":[["hasAny",["charles","longest","longest one","longest word","lower case","lowercase","small letters"]],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75044."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b53e58d8","guard":[["hasAny",["all caps","capital letters","capitals","cleveland","longest","longest one","longest word","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45160."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b564fdd4","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","reston","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 60070."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b5821ddf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","pensacola","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53250."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b5cae110","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pontiac","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59920."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b5d22325","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","plainfield","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 50578."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b63db8d2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kendall","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74559."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b6f4a179","guard":[["hasAny",["corona","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 161614."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b78148df","guard":[["hasAny",["capitalise","capitalize","capitalize each word","euless","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53675."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b8a309ee","guard":[["hasAny",["hoboken","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53136."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-b96d63d7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","reston","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 60070."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-bb0873e7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","elizabeth","longest","longest one","longest word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 128042."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-bb0afe82","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","schaumburg","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74366."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-bbd296c4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","casa","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51571."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-bc7fb78f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","scranton","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 76380."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-bcac7476","guard":[["hasAny",["costa","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 112439."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-be45d35c","guard":[["hasAny",["brookline","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59180."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-bf7eb303","guard":[["hasAny",["invert case","south","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47919."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-bfcdc8c6","guard":[["hasAny",["costa","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 112439."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c0671f5e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","florissant","longest","longest one","longest word","title case"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 52218."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c06c178f","guard":[["hasAny",["florissant","invert case","longest","longest one","longest word","swap case","toggle case"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 52218."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c102212a","guard":[["hasAny",["cleveland","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45160."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c117d702","guard":[["hasAny",["capitalise","capitalize","capitalize each word","chesapeake","longest","longest one","longest word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 233194."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c19a0f9e","guard":[["hasAny",["invert case","longest","longest one","longest word","novi","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58233."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c23d0cfa","guard":[["hasAny",["invert case","longest","longest one","longest word","newark","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48477."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c2687421","guard":[["hasAny",["invert case","longest","longest one","longest word","redmond","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59268."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c2969b0a","guard":[["hasAny",["lower case","lowercase","small letters","south"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47919."]},["sense.wordAt",{"lit":3}],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c2c340e4","guard":[["hasAny",["alto","element","item number","nth","position"]],["words<=",9]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46226."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c2f2bf72","guard":[["hasAny",["element","item number","nth","position","worcester"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 183677."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c4b4b7a9","guard":[["hasAny",["invert case","longest","longest one","longest word","marcos","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 91479."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c581f345","guard":[["hasAny",["cuyahoga","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49353."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c5c9f475","guard":[["hasAny",["all caps","capital letters","capitals","castle","longest","longest one","longest word","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53789."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c669b6f5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","newark","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48477."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c8b2bf95","guard":[["hasAny",["element","item number","nth","parma","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80088."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c8c85461","guard":[["hasAny",["invert case","longest","longest one","longest word","mansfield","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63141."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ca08b156","guard":[["hasAny",["alabama","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 201717."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ca0cc38d","guard":[["hasAny",["all caps","capital letters","capitals","findlay","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41412."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ca554be9","guard":[["hasAny",["all caps","capital letters","capitals","iowa","longest","longest one","longest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 68357."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ca6cc5ee","guard":[["hasAny",["barbara","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 90922."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-cb202a39","guard":[["hasAny",["all caps","capital letters","capitals","highlands","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46841."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-cb20afa6","guard":[["hasAny",["austin","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 907779."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-cb2f387b","guard":[["hasAny",["invert case","longest","longest one","longest word","pico","swap case","toggle case"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63724."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-cbeb1f87","guard":[["hasAny",["belleville","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42729."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-cc3f63cd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","racine","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77931."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-cccbc4ab","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","petersburg","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 253585."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-cccc38f9","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","rochester","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 111396."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-cdaec792","guard":[["hasAny",["bethlehem","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75110."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-cdf35278","guard":[["hasAny",["capitalise","capitalize","capitalize each word","south","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47919."]},["sense.wordAt",{"lit":3}],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-cf441859","guard":[["hasAny",["invert case","longest","longest one","longest word","swap case","toggle case","tuckahoe"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47997."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d16e9145","guard":[["hasAny",["invert case","largo","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80678."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d2133b65","guard":[["hasAny",["invert case","longest","longest one","longest word","mountain","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78827."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d2a98c93","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hammond","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78349."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-d2ac5478","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","luis","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46716."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d3b25544","guard":[["hasAny",["euless","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53675."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d4429ceb","guard":[["hasAny",["invert case","livermore","longest","longest one","longest word","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86493."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d448f991","guard":[["hasAny",["frisco","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 145646."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d5007b38","guard":[["hasAny",["greenwood","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 54564."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d75bf007","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","mansfield","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63141."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d89bdabe","guard":[["hasAny",["beach","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86813."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-d8bab3c5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","maricopa","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45473."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-d8d26f1a","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","rochester","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 111396."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d8d8e37b","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","upper case","uppercase","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 69457."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d97d6866","guard":[["hasAny",["all caps","capital letters","capitals","frisco","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 145646."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-d9def980","guard":[["hasAny",["all caps","capital letters","capitals","shortest","shortest one","shortest word","springfield","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 153991."]},["aggregate.shortest",["sense.content"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-da0398b2","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","pico","upper case","uppercase"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63724."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-da04a394","guard":[["hasAny",["highlands","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46841."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-da22cfbd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","highlands","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46841."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-dadef63b","guard":[["hasAny",["lower case","lowercase","pflugerville","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55712."]},["sense.wordAt",{"lit":3}],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-db085fe2","guard":[["hasAny",["invert case","longest","longest one","longest word","petersburg","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 253585."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-db21850b","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","mansfield","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 63141."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-db90571f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","laguna","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 64984."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-dc4281bb","guard":[["hasAny",["invert case","longest","longest one","longest word","schaumburg","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74366."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-dc701531","guard":[["hasAny",["capitalise","capitalize","capitalize each word","south","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47919."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-dcc20204","guard":[["hasAny",["all caps","capital letters","capitals","doral","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53426."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-dec0d25e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hattiesburg","shortest","shortest one","shortest word","title case"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46846."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-e0f0978d","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","novi","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58233."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-e2977264","guard":[["hasAny",["all caps","capital letters","capitals","laguna","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 64984."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-e31d7f2f","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","mountain","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78827."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-e392a6af","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","pleasanton","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77046."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-e463855b","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","renton","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 98499."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-e5f43174","guard":[["hasAny",["element","item number","nth","position","springs"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 448759."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e6bad76d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","charles","longest","longest one","longest word","title case"]],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75044."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-e7527f30","guard":[["hasAny",["livermore","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86493."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-e7d9bd69","guard":[["hasAny",["all caps","capital letters","capitals","glendale","longest","longest one","longest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 197895."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-e859f626","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kendall","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74559."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-e890721e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kenosha","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 99865."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e8c7bcb4","guard":[["hasAny",["invert case","swap case","toggle case","villages"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 69457."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e8dbc416","guard":[["hasAny",["invert case","pflugerville","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55712."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e8faa056","guard":[["hasAny",["aurora","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 200907."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-e9abd123","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","monterey","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 61001."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ea0f8b69","guard":[["hasAny",["beach","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86813."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-eb23016e","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","roseville","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47606."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ecd4a8a4","guard":[["hasAny",["burbank","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 104583."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ecf772ab","guard":[["hasAny",["capitalise","capitalize","capitalize each word","shortest","shortest one","shortest word","springfield","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 153991."]},["aggregate.shortest",["sense.content"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ed3fbf04","guard":[["hasAny",["casa","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51571."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ee4a1834","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","newark","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48477."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ee549427","guard":[["hasAny",["invert case","scranton","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 76380."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-eea5c5d9","guard":[["hasAny",["invert case","kenosha","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 99865."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-eec05994","guard":[["hasAny",["invert case","longest","longest one","longest word","pensacola","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 53250."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f01d4f36","guard":[["hasAny",["invert case","longest","longest one","longest word","swap case","toggle case","urbana"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 41941."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f0cc02ad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case","yuba"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 66147."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f143fb54","guard":[["hasAny",["invert case","longest","longest one","longest word","swap case","toggle case","wilson"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49558."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f152aa41","guard":[["hasAny",["invert case","longest","longest one","longest word","pleasanton","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 77046."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f15f7491","guard":[["hasAny",["alabama","capitalise","capitalize","capitalize each word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 201717."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f19108c2","guard":[["hasAny",["element","item number","nth","position","renton"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 98499."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f2736cef","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","mountain","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78827."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f27a4ff2","guard":[["hasAny",["coconut","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 57731."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f37813b2","guard":[["hasAny",["fort","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43883."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f3df0b7a","guard":[["hasAny",["angeles","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3918872."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f3fc5f04","guard":[["hasAny",["element","idaho","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 58933."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f50904a3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clair","longest","longest one","longest word","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59916."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f51cb026","guard":[["hasAny",["glendale","invert case","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 197895."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f6513b0d","guard":[["hasAny",["bay","longest","longest one","longest word","lower case","lowercase","small letters"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 44002."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f6919adf","guard":[["hasAny",["denver","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 663303."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f6d8356c","guard":[["hasAny",["all caps","capital letters","capitals","south","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47919."]},["sense.wordAt",{"lit":3}],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f7415e89","guard":[["hasAny",["alto","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]],["words<=",9]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46226."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f7e628e1","guard":[["hasAny",["belleville","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42729."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-f83adc7d","guard":[["hasAny",["invert case","south","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47919."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-f98717ff","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","yuba"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 66147."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-fa343b4b","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","small letters","suffolk"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 87061."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-fa424ce5","guard":[["hasAny",["alabama","all caps","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 201717."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-fb1f48c3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","largo","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80678."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-fb8cbc45","guard":[["hasAny",["bay","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 44002."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-fbdec231","guard":[["hasAny",["bethlehem","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75110."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-fc3fecf6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case","wilson"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 49558."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-fcadec94","guard":[["hasAny",["invert case","reston","swap case","toggle case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 60070."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-fce05407","guard":[["hasAny",["arecibo","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42412."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-fe0fb759","guard":[["hasAny",["longest","longest one","longest word","lower case","lowercase","redmond","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59268."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-fe36a4e4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rochester","title case"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 111396."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-fe7da1cb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","longest","longest one","longest word","rialto","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 102418."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ff26878b","guard":[["hasAny",["all caps","capital letters","capitals","longest","longest one","longest word","overland","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 183775."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-ff2fd71d","guard":[["hasAny",["antioch","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 108675."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-fffa0981","guard":[["hasAny",["element","hattiesburg","item number","nth","position"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46846."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-08efded3","guard":[["hasAny",["each word","haltom","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 43864."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0a99f530","guard":[["hasAny",["each word","marcos","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 91479."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-0b235524","guard":[["hasAny",["each word","split into words","springfield","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 153991."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-15e0e0f3","guard":[["hasAny",["brookline","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59180."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-176b14a9","guard":[["hasAny",["each word","newark","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 48477."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1a1285d1","guard":[["hasAny",["each word","hammond","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78349."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1dad727e","guard":[["hasAny",["each word","highlands","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 46841."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-1ee3e954","guard":[["hasAny",["arecibo","each word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42412."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-21c2639b","guard":[["hasAny",["bethlehem","each word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75110."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-24d53b32","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase","worcester"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 183677."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-25376cbc","guard":[["hasAny",["bay","each word","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 44002."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-253ed9ca","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","worcester"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 183677."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-25f871c1","guard":[["hasAny",["all caps","capital letters","capitals","connecticut","element","item number","nth","position","upper case","uppercase"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 127410."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-270915a8","guard":[["hasAny",["each word","kenosha","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 99865."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-2babcfd2","guard":[["hasAny",["each word","scranton","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 76380."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-34662269","guard":[["hasAny",["each word","petersburg","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 253585."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3532c109","guard":[["hasAny",["each word","glendale","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 197895."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-36b64758","guard":[["hasAny",["costa","each word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 112439."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3b6b714d","guard":[["hasAny",["chesapeake","each word","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 233194."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-3b7d8851","guard":[["hasAny",["element","invert case","item number","nth","position","swap case","toggle case","worcester"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 183677."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-3f2ef17b","guard":[["hasAny",["each word","kendall","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74559."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4376c239","guard":[["hasAny",["each word","largo","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80678."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4429ffb3","guard":[["hasAny",["element","item number","lower case","lowercase","lynn","nth","position","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 92074."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-4a2e79e5","guard":[["hasAny",["chesapeake","each word","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 233194."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4b767bcc","guard":[["hasAny",["each word","largo","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 80678."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4c7e2516","guard":[["hasAny",["each word","south","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47919."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4e5c8201","guard":[["hasAny",["barbara","each word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 90922."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-4f467c5b","guard":[["hasAny",["angeles","each word","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3918872."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-53f9300a","guard":[["hasAny",["alabama","each word","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 201717."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-5a7b1ce3","guard":[["hasAny",["each word","petersburg","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 253585."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-5cfb44e9","guard":[["hasAny",["charlottesville","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45538."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-5dd8ff70","guard":[["hasAny",["each word","iowa","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 68357."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-5f63936d","guard":[["hasAny",["barbara","each word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 90922."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6171549f","guard":[["hasAny",["each word","pflugerville","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55712."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-645a5670","guard":[["hasAny",["each word","scranton","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 76380."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-66d9f560","guard":[["hasAny",["all caps","allentown","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 119624."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-68372da5","guard":[["hasAny",["connecticut","element","invert case","item number","nth","position","swap case","toggle case"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 127410."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-693359a8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","connecticut","element","item number","nth","position","title case"]],["words<=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 127410."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-6c537884","guard":[["hasAny",["each word","south","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 47919."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-6e44dca9","guard":[["hasAny",["arecibo","each word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 42412."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-719fb07f","guard":[["hasAny",["each word","rochester","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 111396."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7439e025","guard":[["hasAny",["all caps","capital letters","capitals","charlottesville","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45538."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-77577801","guard":[["hasAny",["brookline","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59180."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-7c561c8a","guard":[["hasAny",["each word","rochester","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 111396."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7c904c0f","guard":[["hasAny",["each word","split into words","villages","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 69457."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7d0c37b1","guard":[["hasAny",["each word","livermore","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86493."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-7d3312d0","guard":[["hasAny",["bethlehem","each word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 75110."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8483d07f","guard":[["hasAny",["angeles","each word","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 3918872."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-8b21ba35","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","lynn","nth","position","upper case","uppercase"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 92074."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-8e276084","guard":[["hasAny",["brookline","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59180."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-93a9b5b8","guard":[["hasAny",["each word","pontiac","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59920."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-94530048","guard":[["hasAny",["each word","marcos","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 91479."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-a2d1726e","guard":[["hasAny",["costa","each word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 112439."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-a5407e7b","guard":[["hasAny",["alabama","each word","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 201717."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-a7d80990","guard":[["hasAny",["each word","hammond","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 78349."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b36cd00d","guard":[["hasAny",["each word","pflugerville","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 55712."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b41982e8","guard":[["hasAny",["bay","each word","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 44002."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b5948f3d","guard":[["hasAny",["casa","each word","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 51571."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b86a2da8","guard":[["hasAny",["each word","livermore","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 86493."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-b89f1d66","guard":[["hasAny",["each word","reston","split into words","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 60070."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-ba815693","guard":[["hasAny",["charlottesville","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45538."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-bc42181d","guard":[["hasAny",["each word","maricopa","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 45473."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-bcc045ba","guard":[["hasAny",["all caps","brookline","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59180."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-be91a6a6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","lynn","nth","position","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 92074."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c1eb1518","guard":[["hasAny",["allentown","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 119624."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["sense.after",{"lit":"population"}]]],"mem":null},
{"id":"n-c4d1e84e","guard":[["hasAny",["each word","kendall","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 74559."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c5a3869f","guard":[["hasAny",["each word","kenosha","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 99865."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c6e35ac8","guard":[["hasAny",["each word","pontiac","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 59920."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null},
{"id":"n-c75e4140","guard":[["hasAny",["each word","split into words","villages","words"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is 69457."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"population"}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"tell me the population of Colorado Springs, Colorado","expect":{"contains":["448759"],"notRefusal":true}},{"q":"what is the population of Castle Rock, Colorado","expect":{"contains":["53789"],"notRefusal":true}},{"q":"give the population of Haltom City, Texas","expect":{"contains":["43864"],"notRefusal":true}},{"q":"tell me the population of Denver, Colorado","expect":{"contains":["663303"],"notRefusal":true}},{"q":"what is the population of Lake Charles, Louisiana","expect":{"contains":["75044"],"notRefusal":true}},{"q":"give the population of Rochester, Minnesota","expect":{"contains":["111396"],"notRefusal":true}},{"q":"what is the population of Redmond, Washington","expect":{"contains":["59268"],"notRefusal":true}},{"q":"tell me the population of Mountain View, California","expect":{"contains":["78827"],"notRefusal":true}},{"q":"tell me the population of Findlay, Ohio","expect":{"contains":["41412"],"notRefusal":true}},{"q":"give the population of Casa Grande, Arizona","expect":{"contains":["51571"],"notRefusal":true}},{"q":"what is the population of Mansfield, Texas","expect":{"contains":["63141"],"notRefusal":true}},{"q":"give the population of Glendale, California","expect":{"contains":["197895"],"notRefusal":true}},{"q":"tell me the population of Wilson, North Carolina","expect":{"contains":["49558"],"notRefusal":true}},{"q":"give the population of Stockton, California","expect":{"contains":["301443"],"notRefusal":true}},{"q":"what is the population of Fort Pierce, Florida","expect":{"contains":["43883"],"notRefusal":true}},{"q":"give the population of Pontiac, Michigan","expect":{"contains":["59920"],"notRefusal":true}},{"q":"what is the population of Pico Rivera, California","expect":{"contains":["63724"],"notRefusal":true}},{"q":"tell me the population of Duluth, Minnesota","expect":{"contains":["86164"],"notRefusal":true}},{"q":"what is the population of Florissant, Missouri","expect":{"contains":["52218"],"notRefusal":true}},{"q":"what is the population of Levittown, New York","expect":{"contains":["51073"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
