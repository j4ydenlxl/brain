// alpha2-country-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"alpha2-country-neo-g10","class":"alpha2-country","generation":10,"lane":"neo","grownFrom":["the alpha-2 code BG stands for which country","which country has the two-letter code MC","the alpha-2 code AT stands for which country","which country has the two-letter code IQ","the alpha-2 code BM stands for which country","name the country with ISO alpha-2 code AQ","name the country with ISO alpha-2 code DZ","name the country with ISO alpha-2 code GT","name the country with ISO alpha-2 code SX","name the country with ISO alpha-2 code NE","name the country with ISO alpha-2 code UY","name the country with ISO alpha-2 code KW","the alpha-2 code TF stands for which country","which country has the two-letter code IE","which country has the two-letter code NG","name the country with ISO alpha-2 code NZ","the alpha-2 code TC stands for which country","name the country with ISO alpha-2 code MD","the alpha-2 code MV stands for which country","name the country with ISO alpha-2 code LU"],"version":1});

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
knowLoad([{"id":"lukes-iso3166","columns":["country","alpha-2 code"],"n":249,"cols":[{"f":"0Afghanistan|1lbania|2geria|1merican Samoa|1ndorra|2gola|3uilla|2tarctica|3igua and Barbuda|1rgentina|2menia|2uba|1ustralia|5ia|1zerbaijan|0Bahamas|3rain|2ngladesh|2rbados|1elarus|3gium|3ize|2nin|2rmuda|1hutan|1olivia, Plurinational State of|2naire, Sint Eustatius and Saba|2snia and Herzegovina|2tswana|2uvet Island|1razil|2itish Indian Ocean Territory|2unei Darussalam|1ulgaria|2rkina Faso|3undi|0Cabo Verde|2mbodia|3eroon|2nada|2yman Islands|1entral African Republic|1had|2ile|3na|2ristmas Island|1ocos (Keeling) Islands|2lombia|2moros|2ngo|5, Democratic Republic of the|2ok Islands|2sta Rica|1roatia|1uba|2raçao|1yprus|1zechia|1ôte d'Ivoire|0Denmark|1jibouti|1ominica|8n Republic|0Ecuador|1gypt|1l Salvador|1quatorial Guinea|1ritrea|1stonia|2watini|1thiopia|0Falkland Islands (Malvinas)|2roe Islands|1iji|2nland|1rance|2ench Guiana|7Polynesia|7Southern Territories|0Gabon|2mbia|1eorgia|2rmany|1hana|1ibraltar|1reece|4nland|3nada|1uadeloupe|3m|3temala|2ernsey|2inea|6-Bissau|2yana|0Haiti|1eard Island and McDonald Islands|1oly See|2nduras|3g Kong|1ungary|0Iceland|1ndia|3onesia|1ran, Islamic Republic of|3q|2eland|1sle of Man|2rael|1taly|0Jamaica|2pan|1ersey|1ordan|0Kazakhstan|1enya|1iribati|1orea, Democratic People's Republic of|7Republic of|1uwait|1yrgyzstan|0Lao People's Democratic Republic|2tvia|1ebanon|2sotho|1iberia|3ya|2echtenstein|2thuania|1uxembourg|0Macao|2dagascar|2lawi|4ysia|3dives|3i|3ta|2rshall Islands|3tinique|2uritania|6ius|2yotte|1exico|1icronesia, Federated States of|1oldova, Republic of|2naco|3golia|3tenegro|4serrat|2rocco|2zambique|1yanmar|0Namibia|2uru|1epal|2therlands, Kingdom of the|2w Caledonia|4Zealand|1icaragua|2ger|5ia|2ue|1orfolk Island|3th Macedonia|5ern Mariana Islands|3way|0Oman|0Pakistan|2lau|3estine, State of|2nama|2pua New Guinea|2raguay|1eru|1hilippines|1itcairn|1oland|2rtugal|1uerto Rico|0Qatar|0Romania|1ussian Federation|1wanda|1éunion|0Saint Barthélemy|6Helena, Ascension and Tristan da Cunha|6Kitts and Nevis|6Lucia|6Martin (French part)|6Pierre and Miquelon|6Vincent and the Grenadines|2moa|2n Marino|2o Tome and Principe|2udi Arabia|1enegal|2rbia|2ychelles|1ierra Leone|2ngapore|3t Maarten (Dutch part)|1lovakia|4enia|1olomon Islands|2malia|2uth Africa|6Georgia and the South Sandwich Islands|6Sudan|1pain|1ri Lanka|1udan|2riname|1valbard and Jan Mayen|1weden|2itzerland|1yrian Arab Republic|0Taiwan, Province of China|2jikistan|2nzania, United Republic of|1hailand|1imor-Leste|1ogo|2kelau|2nga|1rinidad and Tobago|1unisia|2rkmenistan|4s and Caicos Islands|2valu|1ürkiye|0Uganda|1kraine|1nited Arab Emirates|7Kingdom of Great Britain and Northern Ireland|7States Minor Outlying Islands|eof America|1ruguay|1zbekistan|0Vanuatu|1enezuela, Bolivarian Republic of|1iet Nam|2rgin Islands (British)|gU.S.)|0Wallis and Futuna|1estern Sahara|0Yemen|0Zambia|1imbabwe|0Åland Islands","sep":"|"},{"s":"AF|AL|DZ|AS|AD|AO|AI|AQ|AG|AR|AM|AW|AU|AT|AZ|BS|BH|BD|BB|BY|BE|BZ|BJ|BM|BT|BO|BQ|BA|BW|BV|BR|IO|BN|BG|BF|BI|CV|KH|CM|CA|KY|CF|TD|CL|CN|CX|CC|CO|KM|CG|CD|CK|CR|HR|CU|CW|CY|CZ|CI|DK|DJ|DM|DO|EC|EG|SV|GQ|ER|EE|SZ|ET|FK|FO|FJ|FI|FR|GF|PF|TF|GA|GM|GE|DE|GH|GI|GR|GL|GD|GP|GU|GT|GG|GN|GW|GY|HT|HM|VA|HN|HK|HU|IS|IN|ID|IR|IQ|IE|IM|IL|IT|JM|JP|JE|JO|KZ|KE|KI|KP|KR|KW|KG|LA|LV|LB|LS|LR|LY|LI|LT|LU|MO|MG|MW|MY|MV|ML|MT|MH|MQ|MR|MU|YT|MX|FM|MD|MC|MN|ME|MS|MA|MZ|MM|NA|NR|NP|NL|NC|NZ|NI|NE|NG|NU|NF|MK|MP|NO|OM|PK|PW|PS|PA|PG|PY|PE|PH|PN|PL|PT|PR|QA|RO|RU|RW|RE|BL|SH|KN|LC|MF|PM|VC|WS|SM|ST|SA|SN|RS|SC|SL|SG|SX|SK|SI|SB|SO|ZA|GS|SS|ES|LK|SD|SR|SJ|SE|CH|SY|TW|TJ|TZ|TH|TL|TG|TK|TO|TT|TN|TM|TC|TV|TR|UG|UA|AE|GB|UM|US|UY|UZ|VU|VE|VN|VG|VI|WF|EH|YE|ZM|ZW|AX","sep":"|"}]}]);
const COLONY = [
{"id":"n-eb3f5d3f","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code BG stands for which country":"The code BG stands for Bulgaria.","which country has the two-letter code MC":"The code MC stands for Monaco.","the alpha-2 code AT stands for which country":"The code AT stands for Austria.","which country has the two-letter code IQ":"The code IQ stands for Iraq.","the alpha-2 code BM stands for which country":"The code BM stands for Bermuda.","name the country with ISO alpha-2 code AQ":"The code AQ stands for Antarctica.","name the country with ISO alpha-2 code DZ":"The code DZ stands for Algeria.","name the country with ISO alpha-2 code GT":"The code GT stands for Guatemala.","name the country with ISO alpha-2 code SX":"The code SX stands for Sint Maarten (Dutch part).","name the country with ISO alpha-2 code NE":"The code NE stands for Niger.","name the country with ISO alpha-2 code UY":"The code UY stands for Uruguay.","name the country with ISO alpha-2 code KW":"The code KW stands for Kuwait.","the alpha-2 code TF stands for which country":"The code TF stands for French Southern Territories.","which country has the two-letter code IE":"The code IE stands for Ireland.","which country has the two-letter code NG":"The code NG stands for Nigeria.","name the country with ISO alpha-2 code NZ":"The code NZ stands for New Zealand.","the alpha-2 code TC stands for which country":"The code TC stands for Turks and Caicos Islands.","name the country with ISO alpha-2 code MD":"The code MD stands for Moldova, Republic of.","the alpha-2 code MV stands for which country":"The code MV stands for Maldives.","name the country with ISO alpha-2 code LU":"The code LU stands for Luxembourg.","which country has the two-letter code EG":"The code EG stands for Egypt.","which country has the two-letter code OM":"The code OM stands for Oman.","name the country with ISO alpha-2 code LY":"The code LY stands for Libya.","the alpha-2 code BZ stands for which country":"The code BZ stands for Belize.","name the country with ISO alpha-2 code LR":"The code LR stands for Liberia.","name the country with ISO alpha-2 code SJ":"The code SJ stands for Svalbard and Jan Mayen.","the alpha-2 code RW stands for which country":"The code RW stands for Rwanda.","the alpha-2 code HT stands for which country":"The code HT stands for Haiti.","name the country with ISO alpha-2 code TR":"The code TR stands for Türkiye.","name the country with ISO alpha-2 code TH":"The code TH stands for Thailand.","the alpha-2 code LV stands for which country":"The code LV stands for Latvia.","the alpha-2 code MY stands for which country":"The code MY stands for Malaysia.","which country has the two-letter code QA":"The code QA stands for Qatar.","the alpha-2 code TJ stands for which country":"The code TJ stands for Tajikistan.","which country has the two-letter code BJ":"The code BJ stands for Benin.","the alpha-2 code VG stands for which country":"The code VG stands for Virgin Islands (British).","name the country with ISO alpha-2 code NU":"The code NU stands for Niue.","the alpha-2 code JM stands for which country":"The code JM stands for Jamaica.","name the country with ISO alpha-2 code NC":"The code NC stands for New Caledonia.","name the country with ISO alpha-2 code ZA":"The code ZA stands for South Africa.","which country has the two-letter code GS":"The code GS stands for South Georgia and the South Sandwich Islands.","which country has the two-letter code AD":"The code AD stands for Andorra.","which country has the two-letter code CG":"The code CG stands for Congo.","which country has the two-letter code BH":"The code BH stands for Bahrain.","which country has the two-letter code PW":"The code PW stands for Palau.","the alpha-2 code GR stands for which country":"The code GR stands for Greece.","which country has the two-letter code KN":"The code KN stands for Saint Kitts and Nevis.","which country has the two-letter code LK":"The code LK stands for Sri Lanka.","the alpha-2 code VE stands for which country":"The code VE stands for Venezuela, Bolivarian Republic of.","which country has the two-letter code MA":"The code MA stands for Morocco.","name the country with ISO alpha-2 code GN":"The code GN stands for Guinea.","the alpha-2 code ET stands for which country":"The code ET stands for Ethiopia.","name the country with ISO alpha-2 code SN":"The code SN stands for Senegal.","the alpha-2 code BR stands for which country":"The code BR stands for Brazil.","name the country with ISO alpha-2 code SE":"The code SE stands for Sweden.","which country has the two-letter code EC":"The code EC stands for Ecuador.","the alpha-2 code SL stands for which country":"The code SL stands for Sierra Leone.","the alpha-2 code GF stands for which country":"The code GF stands for French Guiana.","which country has the two-letter code PA":"The code PA stands for Panama.","which country has the two-letter code AZ":"The code AZ stands for Azerbaijan.","the alpha-2 code GP stands for which country":"The code GP stands for Guadeloupe.","which country has the two-letter code MW":"The code MW stands for Malawi.","which country has the two-letter code BB":"The code BB stands for Barbados.","which country has the two-letter code TK":"The code TK stands for Tokelau.","which country has the two-letter code VN":"The code VN stands for Viet Nam.","the alpha-2 code MN stands for which country":"The code MN stands for Mongolia.","name the country with ISO alpha-2 code TV":"The code TV stands for Tuvalu.","which country has the two-letter code CV":"The code CV stands for Cabo Verde.","which country has the two-letter code SS":"The code SS stands for South Sudan.","name the country with ISO alpha-2 code ID":"The code ID stands for Indonesia.","name the country with ISO alpha-2 code NA":"The code NA stands for Namibia.","the alpha-2 code GE stands for which country":"The code GE stands for Georgia.","the alpha-2 code AE stands for which country":"The code AE stands for United Arab Emirates.","the alpha-2 code VI stands for which country":"The code VI stands for Virgin Islands (U.S.).","name the country with ISO alpha-2 code NR":"The code NR stands for Nauru.","name the country with ISO alpha-2 code PF":"The code PF stands for French Polynesia.","the alpha-2 code CZ stands for which country":"The code CZ stands for Czechia.","name the country with ISO alpha-2 code BQ":"The code BQ stands for Bonaire, Sint Eustatius and Saba.","which country has the two-letter code FM":"The code FM stands for Micronesia, Federated States of.","the alpha-2 code GI stands for which country":"The code GI stands for Gibraltar.","which country has the two-letter code MU":"The code MU stands for Mauritius.","which country has the two-letter code IS":"The code IS stands for Iceland.","which country has the two-letter code FR":"The code FR stands for France.","which country has the two-letter code GM":"The code GM stands for Gambia.","which country has the two-letter code HK":"The code HK stands for Hong Kong.","which country has the two-letter code CU":"The code CU stands for Cuba.","which country has the two-letter code MS":"The code MS stands for Montserrat.","the alpha-2 code GL stands for which country":"The code GL stands for Greenland.","name the country with ISO alpha-2 code CW":"The code CW stands for Curaçao.","which country has the two-letter code CH":"The code CH stands for Switzerland.","the alpha-2 code GA stands for which country":"The code GA stands for Gabon.","name the country with ISO alpha-2 code ZW":"The code ZW stands for Zimbabwe.","name the country with ISO alpha-2 code YT":"The code YT stands for Mayotte.","the alpha-2 code BN stands for which country":"The code BN stands for Brunei Darussalam.","the alpha-2 code GY stands for which country":"The code GY stands for Guyana.","name the country with ISO alpha-2 code EE":"The code EE stands for Estonia.","name the country with ISO alpha-2 code PM":"The code PM stands for Saint Pierre and Miquelon.","the alpha-2 code IT stands for which country":"The code IT stands for Italy.","name the country with ISO alpha-2 code SM":"The code SM stands for San Marino.","the alpha-2 code NO stands for which country":"The code NO stands for Norway."}}},
{"id":"n-7a8bbd54","guard":[["has","code"],["has","country"],["not",["has","me"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"code"}]]],"mem":{"table":{"BG stands for which country":"The code BG stands for Bulgaria.","MC":"The code MC stands for Monaco.","AT stands for which country":"The code AT stands for Austria.","IQ":"The code IQ stands for Iraq.","BM stands for which country":"The code BM stands for Bermuda.","AQ":"The code AQ stands for Antarctica.","DZ":"The code DZ stands for Algeria.","GT":"The code GT stands for Guatemala.","SX":"The code SX stands for Sint Maarten (Dutch part).","NE":"The code NE stands for Niger.","UY":"The code UY stands for Uruguay.","KW":"The code KW stands for Kuwait.","TF stands for which country":"The code TF stands for French Southern Territories.","IE":"The code IE stands for Ireland.","NG":"The code NG stands for Nigeria.","NZ":"The code NZ stands for New Zealand.","TC stands for which country":"The code TC stands for Turks and Caicos Islands.","MD":"The code MD stands for Moldova, Republic of.","MV stands for which country":"The code MV stands for Maldives.","LU":"The code LU stands for Luxembourg.","EG":"The code EG stands for Egypt.","OM":"The code OM stands for Oman.","LY":"The code LY stands for Libya.","BZ stands for which country":"The code BZ stands for Belize.","LR":"The code LR stands for Liberia.","SJ":"The code SJ stands for Svalbard and Jan Mayen.","RW stands for which country":"The code RW stands for Rwanda.","HT stands for which country":"The code HT stands for Haiti.","TR":"The code TR stands for Türkiye.","TH":"The code TH stands for Thailand.","LV stands for which country":"The code LV stands for Latvia.","MY stands for which country":"The code MY stands for Malaysia.","QA":"The code QA stands for Qatar.","TJ stands for which country":"The code TJ stands for Tajikistan.","BJ":"The code BJ stands for Benin.","VG stands for which country":"The code VG stands for Virgin Islands (British).","NU":"The code NU stands for Niue.","JM stands for which country":"The code JM stands for Jamaica.","NC":"The code NC stands for New Caledonia.","ZA":"The code ZA stands for South Africa.","GS":"The code GS stands for South Georgia and the South Sandwich Islands.","AD":"The code AD stands for Andorra.","CG":"The code CG stands for Congo.","BH":"The code BH stands for Bahrain.","PW":"The code PW stands for Palau.","GR stands for which country":"The code GR stands for Greece.","KN":"The code KN stands for Saint Kitts and Nevis.","LK":"The code LK stands for Sri Lanka.","VE stands for which country":"The code VE stands for Venezuela, Bolivarian Republic of.","MA":"The code MA stands for Morocco.","GN":"The code GN stands for Guinea.","ET stands for which country":"The code ET stands for Ethiopia.","SN":"The code SN stands for Senegal.","BR stands for which country":"The code BR stands for Brazil.","SE":"The code SE stands for Sweden.","EC":"The code EC stands for Ecuador.","SL stands for which country":"The code SL stands for Sierra Leone.","GF stands for which country":"The code GF stands for French Guiana.","PA":"The code PA stands for Panama.","AZ":"The code AZ stands for Azerbaijan.","GP stands for which country":"The code GP stands for Guadeloupe.","MW":"The code MW stands for Malawi.","BB":"The code BB stands for Barbados.","TK":"The code TK stands for Tokelau.","VN":"The code VN stands for Viet Nam.","MN stands for which country":"The code MN stands for Mongolia.","TV":"The code TV stands for Tuvalu.","CV":"The code CV stands for Cabo Verde.","SS":"The code SS stands for South Sudan.","ID":"The code ID stands for Indonesia.","NA":"The code NA stands for Namibia.","GE stands for which country":"The code GE stands for Georgia.","AE stands for which country":"The code AE stands for United Arab Emirates.","VI stands for which country":"The code VI stands for Virgin Islands (U.S.).","NR":"The code NR stands for Nauru.","PF":"The code PF stands for French Polynesia.","CZ stands for which country":"The code CZ stands for Czechia.","BQ":"The code BQ stands for Bonaire, Sint Eustatius and Saba.","FM":"The code FM stands for Micronesia, Federated States of.","GI stands for which country":"The code GI stands for Gibraltar.","MU":"The code MU stands for Mauritius.","IS":"The code IS stands for Iceland.","FR":"The code FR stands for France.","GM":"The code GM stands for Gambia.","HK":"The code HK stands for Hong Kong.","CU":"The code CU stands for Cuba.","MS":"The code MS stands for Montserrat.","GL stands for which country":"The code GL stands for Greenland.","CW":"The code CW stands for Curaçao.","CH":"The code CH stands for Switzerland.","GA stands for which country":"The code GA stands for Gabon.","ZW":"The code ZW stands for Zimbabwe.","YT":"The code YT stands for Mayotte.","BN stands for which country":"The code BN stands for Brunei Darussalam.","GY stands for which country":"The code GY stands for Guyana.","EE":"The code EE stands for Estonia.","PM":"The code PM stands for Saint Pierre and Miquelon.","IT stands for which country":"The code IT stands for Italy.","SM":"The code SM stands for San Marino.","NO stands for which country":"The code NO stands for Norway."}}},
{"id":"n-80cec721","guard":[["hasAny",["ad","ae","az","bb","bg","bj","bm","bn","bz","ch","cu","cv","cz","ec","eg","et","fm","fr","ga","ge","gf","gi","gl","gm","gp","gr","gs","gy","hk","ht","ie","iq","iso","item number","jm","kn","lk","lv","ma","mn","ms","mu","mv","mw","no","nth","om","pa","pw","qa","shortest","shortest one","shortest word","sl","ss","tc","tf","tj","tk","ve","vg","vi","vn"]],["has","country"],["has","code"],["words<=",8]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-dfae77a5","guard":[["hasAny",["ae","aq","at","bg","bm","bn","bz","cw","cz","dz","et","ga","ge","gf","gi","gl","gn","gp","gr","gy","has","ht","id","it","item number","jm","kw","lr","lv","ly","mn","mv","my","na","nc","no","normalise","normalize","nth","nu","nz","pf","pm","simplify the text","sj","sl","sm","tc","tf","th","tj","tr","tv","uy","yt","za"]],["has","code"],["has","country"],["words<=",8]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-fad25241","guard":[["hasAny",["ae","aq","at","bg","bm","bn","bz","cw","cz","dz","et","ga","ge","gf","gi","gl","gn","gp","gr","gy","has","ht","id","it","item number","jm","kw","lr","lv","ly","mn","mv","my","na","nc","no","normalise","normalize","nth","nu","nz","pf","pm","simplify the text","sj","sl","sm","tc","tf","th","tj","tr","tv","uy","yt","za"]],["has","code"],["has","country"],["words<=",8]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-2b68170e","guard":[["hasAny",["ad","ae","aq","at","az","bb","bg","bj","bm","bn","bz","ch","cu","cv","cw","cz","dz","ec","eg","et","fr","ga","ge","gf","gi","gl","gm","gn","gp","gr","gs","gy","hk","ht","id","ie","iq","it","item number","jm","kn","kw","lk","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","nc","no","normalise","normalize","nth","nu","nz","om","pa","pf","pm","pw","qa","simplify the text","sj","sl","sm","ss","tc","tf","th","tj","tk","tr","tv","uy","vn","yt","za"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],{"lit":1}]],"mem":null},
{"id":"n-336002de","guard":[["hasAny",["ad","ae","aq","at","az","bb","bg","bj","bm","bn","bz","ch","cu","cv","cw","cz","dz","ec","eg","et","fr","ga","ge","gf","gi","gl","gm","gn","gp","gr","gs","gy","hk","ht","id","ie","iq","it","item number","jm","kn","kw","lk","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","nc","no","normalise","normalize","nth","nu","nz","om","pa","pf","pm","pw","qa","simplify the text","sj","sl","sm","ss","tc","tf","th","tj","tk","tr","tv","uy","vn","yt","za"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],{"lit":1}]],"mem":null},
{"id":"n-67e2490f","guard":[["hasAny",["ad","ae","aq","at","az","bb","bg","bj","bm","bn","bz","ch","cu","cv","cw","cz","dz","ec","eg","et","fr","ga","ge","gf","gi","gl","gm","gn","gp","gr","gy","hk","ht","id","ie","iq","it","item number","jm","kw","lk","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","nc","no","normalise","normalize","nth","nu","nz","om","pa","pf","pw","qa","simplify the text","sl","sm","ss","tf","th","tj","tk","tr","tv","uy","vn","yt","za"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],{"lit":2}]],"mem":null},
{"id":"n-e1a9124b","guard":[["hasAny",["ad","ae","aq","at","az","bb","bg","bj","bm","bn","bz","ch","cu","cv","cw","cz","dz","ec","eg","et","fr","ga","ge","gf","gi","gl","gm","gn","gp","gr","gy","hk","ht","id","ie","iq","it","item number","jm","kw","lk","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","nc","no","normalise","normalize","nth","nu","nz","om","pa","pf","pw","qa","simplify the text","sl","sm","ss","tf","th","tj","tk","tr","tv","uy","vn","yt","za"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],{"lit":2}]],"mem":null},
{"id":"n-2ad651b5","guard":[["not",["hasAny",["aabd","abbreviation","absa","admiralty","aereas","afg","afgpakirn","ag","aia","airline","airlines","ajdovi","al","algeria","andorra","angola","antarctica","antigua","antsiranana","antwerp","areomn","asia","aut","autumn","autódromo","aviaci","ba","bahrain","banitsa","bean","beans","bethmale","bgrtur","blaenafon","borg","bouzid","brazilian","brea","burkina","bwa","caciotta","cameroon","canai","cape","capital","chad","cheddar","cheese","chelo","chile","china","christianshaab","ci","circuit","circuito","cisneros","city","ciudad","cl","cod","colon","conch","contributing","cordon","countrytotals","croatia","crosscountry","currency","cuw","cyclones","cz","dadiangas","dar","darussalam","de","dem","desert","di","diab","dish","doinyo","dollar","domain","drought","droughts","due","dumplings","dza","döner","east","eastern","egy","es","espfraita","est","eswatini","et","eustatius","expo","exposition","extreme","federated","fish","flooding","flushing","fraita","fuglafirdi","gab","gb","gedeh","gh","goreng","gorkiy","gronnedal","gtm","guatemala","guiana","guyana","habana","haiti","heatwave","home","honduras","hrv","hrvsrbbih","hrvsrbbihroubgr","hun","hurricane","idn","il","ind","independence","interair","international","ireland","irn","irqirn","islands","islas","isle","iso2","japan","jpn","judea","julianehaab","kardeljevo","kazakhstan","kensom","kenugatza","khaimah","khánh","kir","kp","kuibyshev","kuwait","ky","kz","lanka","lankan","latvia","lc","leningrad","leone","lesotho","lie","lies","lithuania","location","long","ls","lso","lux","lv","macao","madagascar","malawi","maldives","mali","mans","marino","mauritania","mayotte","mayseptember","mda","mexusa","mg","midland","mli","mlibfa","mn","moldova","monaco","mongolia","morocco","moz","mozambique","mozzwezmb","mp","mr","mrt","mwi","myanmar","nam","new","nigeria","nogada","norswefin","north","northeast","np","october","of","pakind","palau","palestine","pan","paraguay","pascua","penh","pew","pitcairn","pk","png","poland","portugal","pound","pri","principe","prt","pry","py","qahira","rainfall","re","redondo","region","republic","rica","rico","river","rs","rus","rw","rwacod","réserve","réunion","saint","salvador","sartori","sc","scandinavia","season","sh","shores","short","sibbo","sl","song","sounds","soyo","speedway","ssd","st","strait","suez","summer","suriname","swz","table","taupiniere","tgo","tha","thalao","title","tjk","tls","tola","transport","trinidad","tsachilas","turbgrrourusgeo","tzaethkensom","ukraine","united","ury","uz","vaarala","vanuatu","vct","vella","volcanic","volcano","watkins","westfalia","wildfires","worlds","xz","zone"]]]],"pyramid":["render.yesNo",["compare.contains",["sense.after",{"lit":"country"}],["sense.wordAt",{"lit":3}]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],["render.template",{"lit":["The code ",{"slot":0}," stands for ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-a821afe3","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"country"}]]],"mem":{"table":{"has the two-letter code MC":"The code MC stands for Monaco.","has the two-letter code IQ":"The code IQ stands for Iraq.","with ISO alpha-2 code AQ":"The code AQ stands for Antarctica.","with ISO alpha-2 code DZ":"The code DZ stands for Algeria.","with ISO alpha-2 code GT":"The code GT stands for Guatemala.","with ISO alpha-2 code SX":"The code SX stands for Sint Maarten (Dutch part).","with ISO alpha-2 code NE":"The code NE stands for Niger.","with ISO alpha-2 code UY":"The code UY stands for Uruguay.","with ISO alpha-2 code KW":"The code KW stands for Kuwait.","has the two-letter code IE":"The code IE stands for Ireland.","has the two-letter code NG":"The code NG stands for Nigeria.","with ISO alpha-2 code NZ":"The code NZ stands for New Zealand.","with ISO alpha-2 code MD":"The code MD stands for Moldova, Republic of.","with ISO alpha-2 code LU":"The code LU stands for Luxembourg.","has the two-letter code EG":"The code EG stands for Egypt.","has the two-letter code OM":"The code OM stands for Oman.","with ISO alpha-2 code LY":"The code LY stands for Libya.","with ISO alpha-2 code LR":"The code LR stands for Liberia.","with ISO alpha-2 code SJ":"The code SJ stands for Svalbard and Jan Mayen.","with ISO alpha-2 code TR":"The code TR stands for Türkiye.","with ISO alpha-2 code TH":"The code TH stands for Thailand.","has the two-letter code QA":"The code QA stands for Qatar.","has the two-letter code BJ":"The code BJ stands for Benin.","with ISO alpha-2 code NU":"The code NU stands for Niue.","with ISO alpha-2 code NC":"The code NC stands for New Caledonia.","with ISO alpha-2 code ZA":"The code ZA stands for South Africa.","has the two-letter code GS":"The code GS stands for South Georgia and the South Sandwich Islands.","has the two-letter code AD":"The code AD stands for Andorra.","has the two-letter code CG":"The code CG stands for Congo.","has the two-letter code BH":"The code BH stands for Bahrain.","has the two-letter code PW":"The code PW stands for Palau.","has the two-letter code KN":"The code KN stands for Saint Kitts and Nevis.","has the two-letter code LK":"The code LK stands for Sri Lanka.","has the two-letter code MA":"The code MA stands for Morocco.","with ISO alpha-2 code GN":"The code GN stands for Guinea.","with ISO alpha-2 code SN":"The code SN stands for Senegal.","with ISO alpha-2 code SE":"The code SE stands for Sweden.","has the two-letter code EC":"The code EC stands for Ecuador.","has the two-letter code PA":"The code PA stands for Panama.","has the two-letter code AZ":"The code AZ stands for Azerbaijan.","has the two-letter code MW":"The code MW stands for Malawi.","has the two-letter code BB":"The code BB stands for Barbados.","has the two-letter code TK":"The code TK stands for Tokelau.","has the two-letter code VN":"The code VN stands for Viet Nam.","with ISO alpha-2 code TV":"The code TV stands for Tuvalu.","has the two-letter code CV":"The code CV stands for Cabo Verde.","has the two-letter code SS":"The code SS stands for South Sudan.","with ISO alpha-2 code ID":"The code ID stands for Indonesia.","with ISO alpha-2 code NA":"The code NA stands for Namibia.","with ISO alpha-2 code NR":"The code NR stands for Nauru.","with ISO alpha-2 code PF":"The code PF stands for French Polynesia.","with ISO alpha-2 code BQ":"The code BQ stands for Bonaire, Sint Eustatius and Saba.","has the two-letter code FM":"The code FM stands for Micronesia, Federated States of.","has the two-letter code MU":"The code MU stands for Mauritius.","has the two-letter code IS":"The code IS stands for Iceland.","has the two-letter code FR":"The code FR stands for France.","has the two-letter code GM":"The code GM stands for Gambia.","has the two-letter code HK":"The code HK stands for Hong Kong.","has the two-letter code CU":"The code CU stands for Cuba.","has the two-letter code MS":"The code MS stands for Montserrat.","with ISO alpha-2 code CW":"The code CW stands for Curaçao.","has the two-letter code CH":"The code CH stands for Switzerland.","with ISO alpha-2 code ZW":"The code ZW stands for Zimbabwe.","with ISO alpha-2 code YT":"The code YT stands for Mayotte.","with ISO alpha-2 code EE":"The code EE stands for Estonia.","with ISO alpha-2 code PM":"The code PM stands for Saint Pierre and Miquelon.","with ISO alpha-2 code SM":"The code SM stands for San Marino."}}},
{"id":"n-237a5565","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bn","bz","ch","cu","cv","cw","cz","dz","ec","eg","et","fr","ga","ge","gf","gi","gl","gm","gn","gp","gr","gy","hk","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","normalise","normalize","nth","nu","nz","om","pa","pf","pw","qa","simplify the text","ss","tf","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],{"lit":3}]],"mem":null},
{"id":"n-2e73b9f5","guard":[["hasAny",["alpha2","copies","item number","nth","say it times"]],["has","country"]],"pyramid":["render.code",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-5cfb4071","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bn","bz","ch","cu","cv","cw","cz","dz","ec","eg","et","fr","ga","ge","gf","gi","gl","gm","gn","gp","gr","gy","hk","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","normalise","normalize","nth","nu","nz","om","pa","pf","pw","qa","simplify the text","ss","tf","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],{"lit":3}]],"mem":null},
{"id":"n-6d57346a","guard":[["hasAny",["alpha2","item number","nth","position"]],["has","country"]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-a8e170e6","guard":[["hasAny",["alpha2","delete","item number","nth","position","remove","strip out"]],["has","country"]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.numeral"]]],"mem":null},
{"id":"n-1a185038","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","snake case","snakecase","th","tj","tk","tr","tv","underscores","uy","variable name","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-43f889c8","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","each word","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","split into words","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-4c9fc73a","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","camel case","camelcase","ch","cu","cw","cz","dz","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lower camel case","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-5ebccb07","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","each word","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","split into words","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-5ef74f63","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","snake case","snakecase","th","tj","tk","tr","tv","underscores","uy","variable name","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.code",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-91b5c45d","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","camel case","camelcase","ch","cu","cw","cz","dz","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lower camel case","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.code",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-98680310","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","each word","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","split into words","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-a9c46d77","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dashes","dz","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","hyphens","id","ie","iq","it","item number","jm","kebab case","kebabcase","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-ad911f64","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","reverse the words","reverse word order","th","tj","tk","tr","tv","uy","words backwards","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-b67d4768","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dashes","dz","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","hyphens","id","ie","iq","it","item number","jm","kebab case","kebabcase","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.code",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-b78f04d7","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","reverse the words","reverse word order","th","tj","tk","tr","tv","uy","words backwards","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.code",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-be53d3a0","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","class name","cu","cw","cz","dz","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pascal case","pascalcase","pw","qa","th","tj","tk","tr","tv","upper camel case","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-f8c0304c","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","class name","cu","cw","cz","dz","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pascal case","pascalcase","pw","qa","th","tj","tk","tr","tv","upper camel case","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.code",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-159eba3c","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","each word","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","longest one","longest word","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","split into words","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-c3c49d7f","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","each word","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","longest one","longest word","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","split into words","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.code",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-eb6155f7","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","each word","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","shortest","shortest one","shortest word","split into words","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.code",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-f2705655","guard":[["hasAny",["ad","aq","at","az","bb","bg","bj","bm","bz","ch","cu","cw","cz","dz","each word","ec","eg","et","fr","ga","ge","gi","gl","gm","gn","gp","gr","gy","ht","id","ie","iq","it","item number","jm","kw","lr","lv","ly","ma","mn","ms","mu","mv","mw","my","na","no","nth","nu","om","pa","pw","qa","shortest","shortest one","shortest word","split into words","th","tj","tk","tr","tv","uy","yt"]],["has","country"],["has","code"],["words<=",8],["not",["has","all"]],["not",["has","and"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-6266a68e","guard":[["hasAny",["ae","aq","at","bg","bm","bn","br","bz","cw","cz","dz","ee","et","ga","ge","gf","gi","gl","gn","gp","gr","gt","gy","ht","id","it","item number","jm","kw","lr","lu","lv","ly","mn","mv","my","na","nc","ne","no","normalise","normalize","nr","nth","nu","nz","pf","position","rw","se","simplify the text","sl","sm","sn","tf","th","tj","tr","tv","uy","yt","za","zw"]],["has","alpha2"]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.first"]]],"mem":null},
{"id":"n-cb3ec23a","guard":[["hasAny",["ae","aq","at","bg","bm","bn","br","bz","cw","cz","dz","ee","et","ga","ge","gf","gi","gl","gn","gp","gr","gt","gy","ht","id","it","item number","jm","kw","lr","lu","lv","ly","mn","mv","my","na","nc","ne","no","normalise","normalize","nr","nth","nu","nz","pf","position","rw","se","simplify the text","sl","sm","sn","tf","th","tj","tr","tv","uy","yt","za","zw"]],["has","alpha2"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.first"]]],"mem":null},
{"id":"n-3d03f89d","guard":[["hasAny",["caesar cipher","has","item number","nth","rotate the letters","shift by","shift each letter"]],["has","twoletter"]],"pyramid":["render.code",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-b3b111fc","guard":[["hasAny",["caesar cipher","has","item number","nth","rotate the letters","shift by","shift each letter"]],["has","twoletter"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-b3fbee1e","guard":[["hasAny",["has","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-ad1cb1b2","guard":[["hasAny",["has","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-d8c893ba","guard":[["hasAny",["element","has","item number","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-097d8c67","guard":[["hasAny",["has","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-1171305d","guard":[["hasAny",["has","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-bbdc9a64","guard":[["hasAny",["has","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-e54358d2","guard":[["hasAny",["class name","has","item number","nth","pascal case","pascalcase","upper camel case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-e61b1939","guard":[["hasAny",["iso","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-224669ea","guard":[["hasAny",["iso","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-23163367","guard":[["hasAny",["element","iso","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-2c147e14","guard":[["hasAny",["ad","az","bb","bh","bj","cg","ch","cu","cv","ec","eg","fm","fr","gm","gs","hk","ie","iq","item number","kn","lk","ma","mc","ms","mu","mw","ng","nth","om","pa","pw","qa","shortest","shortest one","shortest word","ss","tk","vn"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-e8eaeea0","guard":[["hasAny",["iso","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-1aebc190","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iso","item number","nth","shortest","shortest one","shortest word","title case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-533206e6","guard":[["hasAny",["invert case","iso","item number","nth","shortest","shortest one","shortest word","swap case","toggle case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-651a9442","guard":[["hasAny",["ad","az","bb","bh","bj","capital letters","capitals","cg","ch","cu","cv","ec","eg","fm","fr","gm","gs","hk","ie","iq","item number","kn","lk","ma","mc","ms","mu","mw","ng","nth","om","pa","pw","qa","shortest","shortest one","shortest word","ss","tk","upper case","uppercase","vn"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-885d4371","guard":[["hasAny",["all caps","capital letters","capitals","iso","item number","nth","shortest","shortest one","shortest word","upper case","uppercase"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-9772e965","guard":[["hasAny",["ad","az","bb","bh","bj","capitalise","capitalize","capitalize each word","cg","ch","cu","cv","ec","eg","fm","fr","gm","gs","hk","ie","iq","item number","kn","lk","ma","mc","ms","mu","mw","ng","nth","om","pa","pw","qa","shortest","shortest one","shortest word","ss","title case","tk","vn"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-a451c634","guard":[["hasAny",["iso","item number","lower case","lowercase","nth","shortest","shortest one","shortest word","small letters"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-b9ed64ba","guard":[["hasAny",["ad","az","bb","bh","bj","cg","ch","cu","cv","ec","eg","fm","fr","gm","gs","hk","ie","invert case","iq","item number","kn","lk","ma","mc","ms","mu","mw","ng","nth","om","pa","pw","qa","shortest","shortest one","shortest word","ss","swap case","tk","toggle case","vn"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-ce29b68c","guard":[["hasAny",["ad","az","bb","bh","bj","cg","ch","cu","cv","ec","eg","fm","fr","gm","gs","hk","ie","iq","item number","kn","lk","lower case","lowercase","ma","mc","ms","mu","mw","ng","nth","om","pa","pw","qa","shortest","shortest one","shortest word","small letters","ss","tk","vn"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-933ff00b","guard":[["hasAny",["iso","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-9e15254c","guard":[["hasAny",["iso","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-ccdc657d","guard":[["hasAny",["iso","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-20a449fb","guard":[["hasAny",["class name","iso","item number","nth","pascal case","pascalcase","upper camel case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-2cd5c13f","guard":[["hasAny",["ad","az","bb","bh","bj","cg","ch","cu","cv","ec","eg","fm","fr","gm","gs","hk","ie","iq","item number","kn","lk","ma","mc","ms","mu","mw","ng","normalise","normalize","nth","om","pa","pw","qa","simplify the text","ss","tk","vn"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-bc84adc1","guard":[["hasAny",["iso","item number","normalise","normalize","nth","simplify the text"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-61c8f2a2","guard":[["has","alpha2"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"for"}]]],"mem":{"table":{"the alpha-2 code BG stands":"The code BG stands for Bulgaria.","the alpha-2 code AT stands":"The code AT stands for Austria.","the alpha-2 code BM stands":"The code BM stands for Bermuda.","the alpha-2 code TF stands":"The code TF stands for French Southern Territories.","the alpha-2 code TC stands":"The code TC stands for Turks and Caicos Islands.","the alpha-2 code MV stands":"The code MV stands for Maldives.","the alpha-2 code BZ stands":"The code BZ stands for Belize.","the alpha-2 code RW stands":"The code RW stands for Rwanda.","the alpha-2 code HT stands":"The code HT stands for Haiti.","the alpha-2 code LV stands":"The code LV stands for Latvia.","the alpha-2 code MY stands":"The code MY stands for Malaysia.","the alpha-2 code TJ stands":"The code TJ stands for Tajikistan.","the alpha-2 code VG stands":"The code VG stands for Virgin Islands (British).","the alpha-2 code JM stands":"The code JM stands for Jamaica.","the alpha-2 code GR stands":"The code GR stands for Greece.","the alpha-2 code VE stands":"The code VE stands for Venezuela, Bolivarian Republic of.","the alpha-2 code ET stands":"The code ET stands for Ethiopia.","the alpha-2 code BR stands":"The code BR stands for Brazil.","the alpha-2 code SL stands":"The code SL stands for Sierra Leone.","the alpha-2 code GF stands":"The code GF stands for French Guiana.","the alpha-2 code GP stands":"The code GP stands for Guadeloupe.","the alpha-2 code MN stands":"The code MN stands for Mongolia.","the alpha-2 code GE stands":"The code GE stands for Georgia.","the alpha-2 code AE stands":"The code AE stands for United Arab Emirates.","the alpha-2 code VI stands":"The code VI stands for Virgin Islands (U.S.).","the alpha-2 code CZ stands":"The code CZ stands for Czechia.","the alpha-2 code GI stands":"The code GI stands for Gibraltar.","the alpha-2 code GL stands":"The code GL stands for Greenland.","the alpha-2 code GA stands":"The code GA stands for Gabon.","the alpha-2 code BN stands":"The code BN stands for Brunei Darussalam.","the alpha-2 code GY stands":"The code GY stands for Guyana.","the alpha-2 code IT stands":"The code IT stands for Italy.","the alpha-2 code NO stands":"The code NO stands for Norway."}}},
{"id":"n-be03d37b","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-fe4a3522","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-1844f331","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-ba50458d","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","element","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","position","rw","shortest","shortest one","shortest word","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c16adbbb","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c3d8b021","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-00726ce2","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","invert case","item number","jm","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","sl","swap case","tc","tf","tj","toggle case","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-46380ab5","guard":[["hasAny",["ae","bg","bm","bn","br","bz","capitalise","capitalize","capitalize each word","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","sl","tc","tf","title case","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-c07ec885","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lower case","lowercase","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","sl","small letters","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-f77ee99d","guard":[["hasAny",["ae","bg","bm","bn","br","bz","capital letters","capitals","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","sl","tc","tf","tj","upper case","uppercase","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-53c92650","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","rw","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["render.and",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}]],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-e235a38a","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","rw","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["render.list",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}]],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-7b37ee07","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","rw","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-3873a8ec","guard":[["hasAny",["ae","bg","bm","bn","br","bz","class name","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","pascal case","pascalcase","rw","sl","tc","tf","tj","upper camel case","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-aa559d22","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","normalise","normalize","nth","rw","simplify the text","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-003aa5f6","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","element","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","position","rw","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],["sense.howMany"]]],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-a76fc1d3","guard":[["hasAny",["ae","bg","bm","bn","br","bz","cz","element","et","ga","ge","gf","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","position","rw","sl","tc","tf","tj","ve","vg","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],["sense.howMany"]]],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-7351f8b4","guard":[["hasAny",["ad","az","bb","bh","bj","cg","ch","cu","ec","eg","fr","gm","ie","iq","item number","ma","mc","ms","mu","mw","ng","nth","om","pa","pw","qa","reverse the words","reverse word order","shortest","shortest one","shortest word","tk","words backwards"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-817c866a","guard":[["hasAny",["ad","az","bb","bh","bj","cg","ch","cu","dashes","ec","eg","fr","gm","hyphens","ie","iq","item number","kebab case","kebabcase","ma","mc","ms","mu","mw","ng","nth","om","pa","pw","qa","shortest","shortest one","shortest word","tk"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-a74d0f5a","guard":[["hasAny",["ad","az","bb","bh","bj","camel case","camelcase","cg","ch","cu","ec","eg","fr","gm","ie","iq","item number","lower camel case","ma","mc","ms","mu","mw","ng","nth","om","pa","pw","qa","shortest","shortest one","shortest word","tk"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-c4e1f8b4","guard":[["hasAny",["ad","az","bb","bh","bj","cg","ch","class name","cu","ec","eg","fr","gm","ie","iq","item number","ma","mc","ms","mu","mw","ng","nth","om","pa","pascal case","pascalcase","pw","qa","shortest","shortest one","shortest word","tk","upper camel case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-9d560600","guard":[["hasAny",["aq","cw","dz","ee","gn","gt","id","item number","kw","lr","lu","ly","na","ne","nr","nth","nu","reverse the words","reverse word order","se","shortest","shortest one","shortest word","sn","th","tr","tv","uy","words backwards","yt","zw"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-a8594f12","guard":[["hasAny",["aq","cw","dashes","dz","ee","gn","gt","hyphens","id","item number","kebab case","kebabcase","kw","lr","lu","ly","na","ne","nr","nth","nu","se","shortest","shortest one","shortest word","sn","th","tr","tv","uy","yt","zw"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-b28ae5cd","guard":[["hasAny",["aq","camel case","camelcase","cw","dz","ee","gn","gt","id","item number","kw","lower camel case","lr","lu","ly","na","ne","nr","nth","nu","se","shortest","shortest one","shortest word","sn","th","tr","tv","uy","yt","zw"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-b2bfc2ce","guard":[["hasAny",["aq","class name","cw","dz","ee","gn","gt","id","item number","kw","lr","lu","ly","na","ne","nr","nth","nu","pascal case","pascalcase","se","shortest","shortest one","shortest word","sn","th","tr","tv","upper camel case","uy","yt","zw"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-1398852a","guard":[["hasAny",["bg","bm","bn","br","bz","cz","gf","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no vowels","nth","remove vowels","rw","sl","tc","tf","tj","vg","without vowels"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-1260261d","guard":[["hasAny",["bg","bm","br","bz","cz","dashes","et","ga","ge","gi","gl","gp","gr","gy","ht","hyphens","item number","jm","kebab case","kebabcase","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","tj"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-32d0bc4f","guard":[["hasAny",["bg","bm","br","bz","cz","et","ga","ge","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","reverse the words","reverse word order","rw","shortest","shortest one","shortest word","tj","words backwards"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-3d00f1f1","guard":[["hasAny",["bg","bm","br","bz","class name","cz","et","ga","ge","gi","gl","gp","gr","gy","ht","item number","jm","lv","mn","mv","no","nth","pascal case","pascalcase","rw","shortest","shortest one","shortest word","tj","upper camel case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-4d44b9f8","guard":[["hasAny",["bg","bm","br","bz","camel case","camelcase","cz","et","ga","ge","gi","gl","gp","gr","gy","ht","item number","jm","lower camel case","lv","mn","mv","no","nth","rw","shortest","shortest one","shortest word","tj"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-dac0768a","guard":[["hasAny",["is","item number","nth"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The code IS stands for ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-513db92b","guard":[["hasAny",["code","delete","item number","nth","position","remove","strip out","without"]],["has","has"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.unit"]]],"mem":null},
{"id":"n-a84fa3a2","guard":[["hasAny",["code","delete","item number","nth","position","remove","strip out","without"]],["has","has"]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}],["sense.unit"]]],"mem":null},
{"id":"n-81a7d67a","guard":[["hasAny",["it","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT stands for ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-9392f81d","guard":[["hasAny",["item number","my","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY stands for ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-98fa0f8b","guard":[["hasAny",["at","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT stands for ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-004d7b8f","guard":[["hasAny",["item number","ng","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NG stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-0b331435","guard":[["hasAny",["item number","na","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NA stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-0d2bab4b","guard":[["hasAny",["gn","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GN stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-1372e5ac","guard":[["hasAny",["item number","lk","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LK stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-13907017","guard":[["hasAny",["item number","nth","uy"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UY stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-153016c0","guard":[["hasAny",["ee","item number","nth"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EE stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-174de125","guard":[["hasAny",["item number","lu","nth"]],["has","iso"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LU stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-1ed0bd34","guard":[["hasAny",["item number","nth","qa"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," QA stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-29e0567e","guard":[["hasAny",["item number","nth","om"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OM stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-329622ac","guard":[["hasAny",["item number","ly","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LY stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-344ccc40","guard":[["hasAny",["item number","ne","nth"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NE stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-35567167","guard":[["hasAny",["item number","nth","zw"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ZW stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-3559581a","guard":[["hasAny",["item number","nth","sm"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SM stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-3c793245","guard":[["hasAny",["ec","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EC stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-4640921d","guard":[["hasAny",["ie","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IE stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-492d1a81","guard":[["hasAny",["it","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code IT ",{"slot":0}," for ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-4e95678c","guard":[["hasAny",["item number","mu","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MU stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-4f313220","guard":[["hasAny",["fm","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FM stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-530c3990","guard":[["hasAny",["fr","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FR stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-534aaee3","guard":[["hasAny",["item number","nth","pm"]],["has","iso"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PM stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-57c642d4","guard":[["hasAny",["cg","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CG stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-59701e1b","guard":[["hasAny",["dz","item number","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DZ stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-5d0e9245","guard":[["hasAny",["at","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code AT ",{"slot":0}," for ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-62d3f75b","guard":[["hasAny",["item number","nth","sj"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SJ stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-6505a70c","guard":[["hasAny",["item number","mw","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MW stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-65ade8a1","guard":[["hasAny",["cv","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CV stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-6911fb09","guard":[["hasAny",["ad","item number","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AD stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-69126e41","guard":[["hasAny",["item number","nth","sx"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SX stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-6bd4d143","guard":[["hasAny",["bh","item number","nth"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BH stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-6f35c50b","guard":[["hasAny",["item number","nth","nz"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NZ stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-74dca33a","guard":[["hasAny",["item number","nth","tk"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TK stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-74ffdbf4","guard":[["hasAny",["item number","nth","za"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ZA stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-75f82076","guard":[["hasAny",["item number","nth","th"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TH stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-7b0e4e62","guard":[["hasAny",["item number","nth","nu"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NU stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-7eef3421","guard":[["hasAny",["item number","lr","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LR stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-84fe3985","guard":[["hasAny",["item number","mc","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MC stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-855ae13e","guard":[["hasAny",["item number","nth","vn"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VN stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-8f153068","guard":[["hasAny",["item number","md","nth"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MD stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-8fe086cb","guard":[["hasAny",["cu","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CU stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-9499e98f","guard":[["hasAny",["bq","item number","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BQ stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-99a2e96e","guard":[["hasAny",["gt","item number","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GT stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-9bf5d4bc","guard":[["hasAny",["bb","item number","nth"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BB stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-a18684df","guard":[["hasAny",["bj","item number","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BJ stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-a2cb5cf7","guard":[["hasAny",["az","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AZ stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-a8ec57ce","guard":[["hasAny",["item number","nth","se"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SE stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-ae4b8432","guard":[["hasAny",["item number","nc","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NC stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-b1a01480","guard":[["hasAny",["gs","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-b620698b","guard":[["hasAny",["item number","nth","pw"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PW stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-b91227ba","guard":[["hasAny",["item number","ms","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c64aed11","guard":[["hasAny",["eg","item number","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EG stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c79a4e15","guard":[["hasAny",["item number","nth","yt"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," YT stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c8273b8a","guard":[["hasAny",["aq","item number","nth"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AQ stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c85c9bdf","guard":[["hasAny",["iq","item number","nth"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IQ stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c865c3a7","guard":[["hasAny",["id","item number","nth"]],["has","iso"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ID stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c8af3293","guard":[["hasAny",["item number","nth","ss"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c8c2e75b","guard":[["hasAny",["item number","kw","nth"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KW stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-cdf740f7","guard":[["hasAny",["item number","nr","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NR stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-d4e0628b","guard":[["hasAny",["hk","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HK stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-d7fc1ef7","guard":[["hasAny",["item number","ma","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MA stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-d8b187cd","guard":[["hasAny",["item number","nth","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TR stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-daafe545","guard":[["hasAny",["item number","nth","pf"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PF stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-daea8e10","guard":[["hasAny",["ch","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CH stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-df25f735","guard":[["hasAny",["item number","kn","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KN stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-ee074c86","guard":[["hasAny",["item number","nth","pa"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PA stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-f4bd747c","guard":[["hasAny",["item number","nth","tv"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TV stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-f5681f20","guard":[["hasAny",["cw","item number","nth"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CW stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-f788e288","guard":[["hasAny",["item number","nth","sn"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SN stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-f960f3ce","guard":[["hasAny",["is","item number","nth"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-fb1d8b73","guard":[["hasAny",["gm","item number","nth"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GM stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-fdd3b887","guard":[["hasAny",["item number","my","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code MY ",{"slot":0}," for ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-04a272cc","guard":[["hasAny",["camel case","camelcase","is","item number","lower camel case","nth"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-185701f2","guard":[["hasAny",["invert case","is","item number","nth","swap case","toggle case"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-409fa03e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","is","item number","nth","title case"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-7283b06f","guard":[["hasAny",["is","item number","nth","reverse the words","reverse word order","words backwards"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-8382d23b","guard":[["hasAny",["dashes","hyphens","is","item number","kebab case","kebabcase","nth"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-83b3ec46","guard":[["hasAny",["capital letters","capitals","is","item number","nth","upper case","uppercase"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-b28a052e","guard":[["hasAny",["is","item number","lower case","lowercase","nth","small letters"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-f6959b32","guard":[["hasAny",["class name","is","item number","nth","pascal case","pascalcase","upper camel case"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IS stands for ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-174c9085","guard":[["hasAny",["item number","my","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-638dae47","guard":[["hasAny",["at","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-6c1010f5","guard":[["hasAny",["it","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c0440142","guard":[["hasAny",["it","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-d0056f78","guard":[["hasAny",["item number","my","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-ed6908b9","guard":[["hasAny",["at","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-08ebdba1","guard":[["hasAny",["bn","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BN ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-0aea920f","guard":[["hasAny",["at","camel case","camelcase","item number","lower camel case","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-0c5df322","guard":[["hasAny",["item number","nth","rw"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RW ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-0ff27dac","guard":[["hasAny",["camel case","camelcase","item number","lower camel case","my","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-100426d4","guard":[["hasAny",["dashes","hyphens","item number","kebab case","kebabcase","my","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-10eb5ade","guard":[["hasAny",["camel case","camelcase","it","item number","lower camel case","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-1581eef4","guard":[["hasAny",["ht","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HT ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-27904dba","guard":[["hasAny",["at","item number","lower case","lowercase","nth","shortest","shortest one","shortest word","small letters"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-28f5d656","guard":[["hasAny",["br","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BR ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-2b570825","guard":[["hasAny",["at","capitalise","capitalize","capitalize each word","item number","nth","shortest","shortest one","shortest word","title case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-2c49f143","guard":[["hasAny",["item number","mn","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MN ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-3348f8e2","guard":[["hasAny",["invert case","it","item number","nth","shortest","shortest one","shortest word","swap case","toggle case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-36129c6a","guard":[["hasAny",["at","class name","item number","nth","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-38891ef0","guard":[["hasAny",["gf","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GF ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-3bb7131f","guard":[["hasAny",["item number","nth","tj"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TJ ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-43a92c17","guard":[["hasAny",["et","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ET ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-47e2e80e","guard":[["hasAny",["item number","my","nth","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-4e47c497","guard":[["hasAny",["at","dashes","hyphens","item number","kebab case","kebabcase","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-4f032fdb","guard":[["hasAny",["item number","no","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NO ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-5807b35c","guard":[["hasAny",["it","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-58db532a","guard":[["hasAny",["capital letters","capitals","item number","my","nth","shortest","shortest one","shortest word","upper case","uppercase"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-59ff1fdd","guard":[["hasAny",["item number","mv","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MV ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-5a1cc93a","guard":[["hasAny",["at","capital letters","capitals","item number","nth","shortest","shortest one","shortest word","upper case","uppercase"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-5cb1af02","guard":[["hasAny",["class name","item number","my","nth","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-5d70366d","guard":[["hasAny",["item number","nth","ve"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VE ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-5e087db3","guard":[["hasAny",["gr","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GR ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-61b64ca0","guard":[["hasAny",["at","item number","nth","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-6d005e79","guard":[["hasAny",["item number","my","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-70231015","guard":[["hasAny",["bz","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BZ ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-7236b8aa","guard":[["hasAny",["it","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.first"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-73384f77","guard":[["hasAny",["invert case","item number","my","nth","shortest","shortest one","shortest word","swap case","toggle case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-7bf8cd17","guard":[["hasAny",["gy","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GY ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-7ea0e8f2","guard":[["hasAny",["it","item number","nth","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-8a4a5b65","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","my","nth","shortest","shortest one","shortest word","title case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-8f5220b3","guard":[["hasAny",["ga","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GA ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-963f6578","guard":[["hasAny",["item number","jm","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JM ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-a508bdb0","guard":[["hasAny",["item number","my","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.first"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-ac42db01","guard":[["hasAny",["item number","lower case","lowercase","my","nth","shortest","shortest one","shortest word","small letters"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-ac9d2170","guard":[["hasAny",["item number","lv","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LV ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-b3df9312","guard":[["hasAny",["item number","nth","tf"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TF ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-b6384e57","guard":[["hasAny",["item number","nth","tc"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TC ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-b8e1400e","guard":[["hasAny",["item number","nth","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VI ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-b99a9c42","guard":[["hasAny",["item number","nth","vg"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VG ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-b9f31f42","guard":[["hasAny",["bm","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BM ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-bdac3d29","guard":[["hasAny",["at","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-c6914ff3","guard":[["hasAny",["capital letters","capitals","it","item number","nth","shortest","shortest one","shortest word","upper case","uppercase"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-cfebeaf8","guard":[["hasAny",["cz","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CZ ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-d1ca2b7e","guard":[["hasAny",["ge","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GE ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-d796aca2","guard":[["hasAny",["gi","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GI ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-da25bb60","guard":[["hasAny",["bg","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BG ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-dd5eb79e","guard":[["hasAny",["it","item number","lower case","lowercase","nth","shortest","shortest one","shortest word","small letters"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-df59a449","guard":[["hasAny",["capitalise","capitalize","capitalize each word","it","item number","nth","shortest","shortest one","shortest word","title case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-df8a132f","guard":[["hasAny",["gp","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GP ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-e3baddb4","guard":[["hasAny",["dashes","hyphens","it","item number","kebab case","kebabcase","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-e68ad2e5","guard":[["hasAny",["ae","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AE ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-eaa4e105","guard":[["hasAny",["at","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.first"]],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-f4eb5598","guard":[["hasAny",["gl","item number","nth"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GL ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-f98a58f8","guard":[["hasAny",["class name","it","item number","nth","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-fb102756","guard":[["hasAny",["at","invert case","item number","nth","shortest","shortest one","shortest word","swap case","toggle case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]]],"mem":null},
{"id":"n-ff40f1b1","guard":[["hasAny",["item number","nth","sl"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SL ",{"slot":1}," for ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"}],{"lit":1}],{"lit":"lukes-iso3166"},{"lit":"alpha-2 code"},{"lit":"country"}]],"mem":null},
{"id":"n-019a9a7f","guard":[["hasAny",["code","country","has","iq","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code IQ":"The code IQ stands for Iraq."}}},
{"id":"n-07352d89","guard":[["hasAny",["bj","code","country","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code BJ":"The code BJ stands for Benin."}}},
{"id":"n-08f8a4d1","guard":[["hasAny",["alpha2","bn","code","country","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code BN stands for which country":"The code BN stands for Brunei Darussalam."}}},
{"id":"n-099c598c","guard":[["hasAny",["ch","code","country","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code CH":"The code CH stands for Switzerland."}}},
{"id":"n-0dda17d1","guard":[["hasAny",["code","country","has","ie","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code IE":"The code IE stands for Ireland."}}},
{"id":"n-131fcd9e","guard":[["hasAny",["code","country","gm","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code GM":"The code GM stands for Gambia."}}},
{"id":"n-189cba2e","guard":[["hasAny",["alpha2","code","country","iso","lr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code LR":"The code LR stands for Liberia."}}},
{"id":"n-18f67fa9","guard":[["hasAny",["alpha2","code","country","gf","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code GF stands for which country":"The code GF stands for French Guiana."}}},
{"id":"n-19be81a0","guard":[["hasAny",["alpha2","bm","code","country","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code BM stands for which country":"The code BM stands for Bermuda."}}},
{"id":"n-1a08e8fb","guard":[["hasAny",["alpha2","code","country","cz","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code CZ stands for which country":"The code CZ stands for Czechia."}}},
{"id":"n-1d88a100","guard":[["hasAny",["alpha2","code","country","ge","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code GE stands for which country":"The code GE stands for Georgia."}}},
{"id":"n-1e75d7c5","guard":[["hasAny",["code","country","has","kn","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code KN":"The code KN stands for Saint Kitts and Nevis."}}},
{"id":"n-202b053e","guard":[["hasAny",["alpha2","code","country","et","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code ET stands for which country":"The code ET stands for Ethiopia."}}},
{"id":"n-256e3e35","guard":[["hasAny",["alpha2","code","country","iso","lu","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code LU":"The code LU stands for Luxembourg."}}},
{"id":"n-258ebae3","guard":[["hasAny",["alpha2","code","country","iso","name","yt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code YT":"The code YT stands for Mayotte."}}},
{"id":"n-2c899542","guard":[["hasAny",["alpha2","code","country","iso","na","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code NA":"The code NA stands for Namibia."}}},
{"id":"n-2db5a8d5","guard":[["hasAny",["alpha2","code","country","iso","name","pf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code PF":"The code PF stands for French Polynesia."}}},
{"id":"n-301efb49","guard":[["hasAny",["cg","code","country","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code CG":"The code CG stands for Congo."}}},
{"id":"n-346b5c74","guard":[["hasAny",["code","country","has","ss","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code SS":"The code SS stands for South Sudan."}}},
{"id":"n-34c256f3","guard":[["hasAny",["code","country","has","ma","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MA":"The code MA stands for Morocco."}}},
{"id":"n-383f600d","guard":[["hasAny",["alpha2","code","country","iso","kw","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code KW":"The code KW stands for Kuwait."}}},
{"id":"n-3a45bd2e","guard":[["hasAny",["alpha2","code","country","stands","ve"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code VE stands for which country":"The code VE stands for Venezuela, Bolivarian Republic of."}}},
{"id":"n-3f964a93","guard":[["hasAny",["alpha2","code","country","sl","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code SL stands for which country":"The code SL stands for Sierra Leone."}}},
{"id":"n-4001489f","guard":[["hasAny",["alpha2","code","country","iso","ly","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code LY":"The code LY stands for Libya."}}},
{"id":"n-403b6d38","guard":[["hasAny",["alpha2","code","country","iso","name","pm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code PM":"The code PM stands for Saint Pierre and Miquelon."}}},
{"id":"n-433fb0a2","guard":[["hasAny",["alpha2","bz","code","country","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code BZ stands for which country":"The code BZ stands for Belize."}}},
{"id":"n-43a85f7c","guard":[["hasAny",["alpha2","code","country","dz","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code DZ":"The code DZ stands for Algeria."}}},
{"id":"n-48d462a4","guard":[["hasAny",["alpha2","code","country","iso","name","zw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code ZW":"The code ZW stands for Zimbabwe."}}},
{"id":"n-4ae109d0","guard":[["hasAny",["alpha2","code","country","cw","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code CW":"The code CW stands for Curaçao."}}},
{"id":"n-4b4f71cb","guard":[["hasAny",["alpha2","code","country","mv","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code MV stands for which country":"The code MV stands for Maldives."}}},
{"id":"n-54ff18f2","guard":[["hasAny",["code","country","has","tk","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code TK":"The code TK stands for Tokelau."}}},
{"id":"n-55861992","guard":[["hasAny",["alpha2","code","country","iso","name","sx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code SX":"The code SX stands for Sint Maarten (Dutch part)."}}},
{"id":"n-56037afe","guard":[["hasAny",["alpha2","code","country","iso","name","sj"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code SJ":"The code SJ stands for Svalbard and Jan Mayen."}}},
{"id":"n-587a5632","guard":[["hasAny",["alpha2","code","country","ee","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code EE":"The code EE stands for Estonia."}}},
{"id":"n-5a9e3c95","guard":[["hasAny",["code","country","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code IS":"The code IS stands for Iceland."}}},
{"id":"n-5ba13268","guard":[["hasAny",["alpha2","code","country","iso","md","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code MD":"The code MD stands for Moldova, Republic of."}}},
{"id":"n-5dee7215","guard":[["hasAny",["alpha2","code","country","iso","name","sn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code SN":"The code SN stands for Senegal."}}},
{"id":"n-5e2fb10b","guard":[["hasAny",["alpha2","code","country","mn","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code MN stands for which country":"The code MN stands for Mongolia."}}},
{"id":"n-5ed514dc","guard":[["hasAny",["alpha2","code","country","stands","tc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code TC stands for which country":"The code TC stands for Turks and Caicos Islands."}}},
{"id":"n-632e3eaf","guard":[["hasAny",["alpha2","code","country","no","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code NO stands for which country":"The code NO stands for Norway."}}},
{"id":"n-6486d144","guard":[["hasAny",["alpha2","code","country","iso","name","nu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code NU":"The code NU stands for Niue."}}},
{"id":"n-6599fa04","guard":[["hasAny",["code","country","has","hk","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code HK":"The code HK stands for Hong Kong."}}},
{"id":"n-681e4c60","guard":[["hasAny",["alpha2","code","country","iso","name","nr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code NR":"The code NR stands for Nauru."}}},
{"id":"n-68a5e4de","guard":[["hasAny",["code","country","fr","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code FR":"The code FR stands for France."}}},
{"id":"n-694a30df","guard":[["hasAny",["code","country","has","qa","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code QA":"The code QA stands for Qatar."}}},
{"id":"n-6f2d4830","guard":[["hasAny",["code","country","has","pw","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code PW":"The code PW stands for Palau."}}},
{"id":"n-6f617c66","guard":[["hasAny",["alpha2","code","country","iso","name","sm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code SM":"The code SM stands for San Marino."}}},
{"id":"n-74a87dda","guard":[["hasAny",["bb","code","country","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code BB":"The code BB stands for Barbados."}}},
{"id":"n-758d65dd","guard":[["hasAny",["alpha2","bg","code","country","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code BG stands for which country":"The code BG stands for Bulgaria."}}},
{"id":"n-793e24e1","guard":[["hasAny",["alpha2","code","country","gy","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code GY stands for which country":"The code GY stands for Guyana."}}},
{"id":"n-8a3da98f","guard":[["hasAny",["alpha2","code","country","iso","name","uy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code UY":"The code UY stands for Uruguay."}}},
{"id":"n-8a9358e4","guard":[["hasAny",["alpha2","code","country","ga","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code GA stands for which country":"The code GA stands for Gabon."}}},
{"id":"n-8b14b65c","guard":[["hasAny",["alpha2","code","country","iso","name","th"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code TH":"The code TH stands for Thailand."}}},
{"id":"n-8b7d1446","guard":[["hasAny",["alpha2","code","country","iso","name","ne"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code NE":"The code NE stands for Niger."}}},
{"id":"n-90470cdf","guard":[["hasAny",["alpha2","code","country","gl","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code GL stands for which country":"The code GL stands for Greenland."}}},
{"id":"n-924b86a0","guard":[["hasAny",["alpha2","code","country","gn","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code GN":"The code GN stands for Guinea."}}},
{"id":"n-9842a0f4","guard":[["hasAny",["code","country","has","lk","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code LK":"The code LK stands for Sri Lanka."}}},
{"id":"n-a0acc9bb","guard":[["hasAny",["alpha2","code","country","iso","name","tr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code TR":"The code TR stands for Türkiye."}}},
{"id":"n-a2fe9d90","guard":[["hasAny",["alpha2","code","country","stands","vg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code VG stands for which country":"The code VG stands for Virgin Islands (British)."}}},
{"id":"n-a34e75e2","guard":[["hasAny",["alpha2","aq","code","country","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code AQ":"The code AQ stands for Antarctica."}}},
{"id":"n-a97fd08e","guard":[["hasAny",["ad","code","country","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code AD":"The code AD stands for Andorra."}}},
{"id":"n-a9d5d293","guard":[["hasAny",["alpha2","code","country","stands","vi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code VI stands for which country":"The code VI stands for Virgin Islands (U.S.)."}}},
{"id":"n-a9fa5b4e","guard":[["hasAny",["alpha2","code","country","jm","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code JM stands for which country":"The code JM stands for Jamaica."}}},
{"id":"n-b3856d88","guard":[["hasAny",["bh","code","country","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code BH":"The code BH stands for Bahrain."}}},
{"id":"n-b456fb8d","guard":[["hasAny",["code","country","has","pa","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code PA":"The code PA stands for Panama."}}},
{"id":"n-b7c3d1d8","guard":[["hasAny",["alpha2","code","country","gt","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code GT":"The code GT stands for Guatemala."}}},
{"id":"n-b7d4b683","guard":[["hasAny",["code","country","ec","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code EC":"The code EC stands for Ecuador."}}},
{"id":"n-bd3debe6","guard":[["hasAny",["alpha2","code","country","gi","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code GI stands for which country":"The code GI stands for Gibraltar."}}},
{"id":"n-bf132285","guard":[["hasAny",["alpha2","code","country","ht","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code HT stands for which country":"The code HT stands for Haiti."}}},
{"id":"n-c1d8f267","guard":[["hasAny",["alpha2","bq","code","country","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code BQ":"The code BQ stands for Bonaire, Sint Eustatius and Saba."}}},
{"id":"n-c8141757","guard":[["hasAny",["alpha2","code","country","iso","name","nz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code NZ":"The code NZ stands for New Zealand."}}},
{"id":"n-cec86d9f","guard":[["hasAny",["code","country","gs","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code GS":"The code GS stands for South Georgia and the South Sandwich Islands."}}},
{"id":"n-d007ee2f","guard":[["hasAny",["alpha2","code","country","iso","name","nc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code NC":"The code NC stands for New Caledonia."}}},
{"id":"n-d128a12b","guard":[["hasAny",["code","country","has","mu","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MU":"The code MU stands for Mauritius."}}},
{"id":"n-d17b48f1","guard":[["hasAny",["code","country","has","twoletter","vn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code VN":"The code VN stands for Viet Nam."}}},
{"id":"n-d1e64061","guard":[["hasAny",["code","country","cu","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code CU":"The code CU stands for Cuba."}}},
{"id":"n-d66e8cb2","guard":[["hasAny",["code","country","has","ms","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MS":"The code MS stands for Montserrat."}}},
{"id":"n-d7ef23a0","guard":[["hasAny",["az","code","country","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code AZ":"The code AZ stands for Azerbaijan."}}},
{"id":"n-d824a3d8","guard":[["hasAny",["code","country","has","mc","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MC":"The code MC stands for Monaco."}}},
{"id":"n-dab13907","guard":[["hasAny",["alpha2","code","country","lv","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code LV stands for which country":"The code LV stands for Latvia."}}},
{"id":"n-dfc0439a","guard":[["hasAny",["code","country","fm","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code FM":"The code FM stands for Micronesia, Federated States of."}}},
{"id":"n-dfcf1d7a","guard":[["hasAny",["code","country","eg","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code EG":"The code EG stands for Egypt."}}},
{"id":"n-e15a5b4b","guard":[["hasAny",["code","country","cv","has","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code CV":"The code CV stands for Cabo Verde."}}},
{"id":"n-e17e069d","guard":[["hasAny",["alpha2","br","code","country","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code BR stands for which country":"The code BR stands for Brazil."}}},
{"id":"n-e2e76293","guard":[["hasAny",["code","country","has","ng","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code NG":"The code NG stands for Nigeria."}}},
{"id":"n-e3ff844c","guard":[["hasAny",["alpha2","code","country","iso","name","se"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code SE":"The code SE stands for Sweden."}}},
{"id":"n-e65669e8","guard":[["hasAny",["alpha2","code","country","id","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code ID":"The code ID stands for Indonesia."}}},
{"id":"n-e6573a9c","guard":[["hasAny",["code","country","has","mw","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MW":"The code MW stands for Malawi."}}},
{"id":"n-e75340a0","guard":[["hasAny",["alpha2","code","country","iso","name","tv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code TV":"The code TV stands for Tuvalu."}}},
{"id":"n-eaaf9cce","guard":[["hasAny",["alpha2","code","country","stands","tf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code TF stands for which country":"The code TF stands for French Southern Territories."}}},
{"id":"n-eaf3e3cd","guard":[["hasAny",["alpha2","code","country","rw","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code RW stands for which country":"The code RW stands for Rwanda."}}},
{"id":"n-ebde71e1","guard":[["hasAny",["alpha2","code","country","iso","name","za"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the country with ISO alpha-2 code ZA":"The code ZA stands for South Africa."}}},
{"id":"n-ed9220ad","guard":[["hasAny",["ae","alpha2","code","country","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code AE stands for which country":"The code AE stands for United Arab Emirates."}}},
{"id":"n-f01c2859","guard":[["hasAny",["alpha2","code","country","gp","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code GP stands for which country":"The code GP stands for Guadeloupe."}}},
{"id":"n-f6ded735","guard":[["hasAny",["alpha2","code","country","stands","tj"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code TJ stands for which country":"The code TJ stands for Tajikistan."}}},
{"id":"n-f7475db1","guard":[["hasAny",["code","country","has","om","twoletter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which country has the two-letter code OM":"The code OM stands for Oman."}}},
{"id":"n-ff90c831","guard":[["hasAny",["alpha2","code","country","gr","stands"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"the alpha-2 code GR stands for which country":"The code GR stands for Greece."}}},
{"id":"n-1cf3ca03","guard":[["hasAny",["pw","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Palau."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2099aaa0","guard":[["hasAny",["copies","ge","say it times"]],["has","alpha2"]],"pyramid":["render.code",["transform.repeat",{"lit":"georgia"},["sense.howMany"]]],"mem":null},
{"id":"n-30bf33b1","guard":[["hasAny",["pa","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Panama."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-314358f6","guard":[["hasAny",["at","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT stands for Austria."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-389eab66","guard":[["hasAny",["ec","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Ecuador."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-55b2f442","guard":[["hasAny",["lk","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Sri Lanka."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5a43b2af","guard":[["hasAny",["gt","shortest","shortest one","shortest word"]],["has","with"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Guatemala."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-60bf6832","guard":[["hasAny",["bb","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Barbados."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6131e2be","guard":[["hasAny",["ge","normalise","normalize","simplify the text"]],["has","alpha2"]],"pyramid":["render.code",["transform.norm",{"lit":"georgia"},["sense.first"]]],"mem":null},
{"id":"n-6661ae03","guard":[["hasAny",["na","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Namibia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-69eedc5b","guard":[["hasAny",["az","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Azerbaijan."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-71005d23","guard":[["hasAny",["gs","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for South Georgia and the South Sandwich Islands."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-784fc396","guard":[["hasAny",["mc","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Monaco."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-86030248","guard":[["hasAny",["my","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY stands for Malaysia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8647526c","guard":[["hasAny",["mw","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Malawi."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8831c965","guard":[["hasAny",["shortest","shortest one","shortest word","tr"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Türkiye."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-909faef6","guard":[["hasAny",["fr","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for France."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a74205da","guard":[["hasAny",["kn","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Saint Kitts and Nevis."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c9c54ef7","guard":[["has","ge"],["has","alpha2"]],"pyramid":["render.list",["iterate.repeat",{"lit":"georgia"},["sense.howMany"]]],"mem":null},
{"id":"n-e6b56e5f","guard":[["hasAny",["shortest","shortest one","shortest word","yt"]],["has","with"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for Mayotte."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1bb247bc","guard":[["hasAny",["item number","ng","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NG stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-319c9ce1","guard":[["hasAny",["ee","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EE stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-34a66ed9","guard":[["hasAny",["item number","mc","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MC stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-46736eb7","guard":[["hasAny",["item number","nth","position","pw"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PW stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4a61628c","guard":[["hasAny",["gs","item number","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GS stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5863debb","guard":[["hasAny",["item number","lk","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LK stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-77aa598a","guard":[["hasAny",["fr","item number","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FR stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a6b9e9c8","guard":[["hasAny",["item number","nth","pa","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PA stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a6d67592","guard":[["hasAny",["bb","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BB stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-aac139f9","guard":[["hasAny",["ec","item number","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EC stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c2cb43a1","guard":[["hasAny",["item number","kn","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KN stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c7749b82","guard":[["hasAny",["item number","mw","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MW stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d763f0ea","guard":[["hasAny",["at","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code AT ",{"slot":0}," for Austria."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e258197c","guard":[["hasAny",["item number","my","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code MY ",{"slot":0}," for Malaysia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e4e563d2","guard":[["hasAny",["is","item number","nth"]],["has","has"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IS stands for Iceland."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e8ebc7c6","guard":[["hasAny",["az","item number","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AZ stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ea80a1fe","guard":[["hasAny",["item number","nth","position","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TR stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-060bf20d","guard":[["hasAny",["item number","lk","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-064b4c70","guard":[["hasAny",["item number","nth","pa","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-0deef19c","guard":[["hasAny",["gs","item number","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-51987c77","guard":[["hasAny",["item number","nth","position","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-59470bfb","guard":[["hasAny",["item number","ng","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-5a198ac3","guard":[["hasAny",["item number","mc","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-82b24920","guard":[["hasAny",["fr","item number","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-836b8b39","guard":[["hasAny",["ec","item number","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-937d50e9","guard":[["hasAny",["item number","nth","position","pw"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-a2706401","guard":[["hasAny",["item number","mw","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-a3593ab2","guard":[["hasAny",["ee","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-ba258675","guard":[["hasAny",["bb","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-c472556a","guard":[["hasAny",["az","item number","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-ec9c7ae5","guard":[["hasAny",["item number","kn","nth","position"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-00094e21","guard":[["hasAny",["invert case","item number","mw","nth","position","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-00b46406","guard":[["hasAny",["cz","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Czechia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-023293f2","guard":[["hasAny",["ee","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-02e3df67","guard":[["hasAny",["bq","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Bonaire, Sint Eustatius and Saba."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-0420f843","guard":[["hasAny",["dz","item number","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Algeria."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-05220589","guard":[["hasAny",["ee","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-05351bda","guard":[["hasAny",["item number","lu","nth","shortest","shortest one","shortest word"]],["has","iso"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Luxembourg."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-06022878","guard":[["hasAny",["item number","ng","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-06439d04","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vg"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Virgin Islands (British)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-070957fc","guard":[["hasAny",["ec","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-07417431","guard":[["hasAny",["element","item number","nth","position","th"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Thailand."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-07fd14bd","guard":[["hasAny",["element","item number","nth","position","zw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-08a25b55","guard":[["hasAny",["at","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for Austria."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-09ff4a17","guard":[["hasAny",["invert case","item number","kn","nth","position","swap case","toggle case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0a05847e","guard":[["hasAny",["element","gs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-0a89b6ea","guard":[["hasAny",["item number","na","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Namibia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0a9c0cbe","guard":[["hasAny",["item number","lk","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-0ae7713a","guard":[["hasAny",["aq","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Antarctica."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-0b798452","guard":[["hasAny",["gi","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Gibraltar."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0c30b6ce","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-0c3fb6d5","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tc"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Turks and Caicos Islands."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0d18ad7e","guard":[["hasAny",["element","item number","nth","position","tv"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Tuvalu."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-0d251805","guard":[["hasAny",["element","item number","nth","pa","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-0ffecd50","guard":[["hasAny",["item number","lower case","lowercase","mw","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1051d091","guard":[["hasAny",["element","item number","nr","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nauru."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-12b5e1a2","guard":[["hasAny",["bb","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-13945474","guard":[["hasAny",["az","item number","nth","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-13bfad24","guard":[["hasAny",["all caps","capital letters","capitals","item number","mw","nth","position","upper case","uppercase"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-16070c9b","guard":[["hasAny",["element","item number","nth","om","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Oman."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-16aef670","guard":[["hasAny",["bj","item number","nth","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Benin."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-16b22886","guard":[["hasAny",["element","iq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Iraq."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-1737a562","guard":[["hasAny",["bz","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Belize."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-17ea4d3c","guard":[["hasAny",["element","item number","mc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-18a015b2","guard":[["hasAny",["hk","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Hong Kong."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-19497634","guard":[["hasAny",["bh","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Bahrain."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-1b5d8911","guard":[["hasAny",["invert case","item number","nth","position","swap case","toggle case","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1cad7c27","guard":[["hasAny",["element","item number","nth","position","uy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Uruguay."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-1dc44855","guard":[["hasAny",["item number","lk","nth","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1fed1e1a","guard":[["hasAny",["all caps","capital letters","capitals","item number","ng","nth","position","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-20c6faac","guard":[["hasAny",["it","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for Italy."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-22a7ca86","guard":[["hasAny",["br","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Brazil."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-22f8d3e4","guard":[["hasAny",["ad","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Andorra."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-253f17d4","guard":[["hasAny",["item number","kn","lower case","lowercase","nth","position","small letters"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-25e88a99","guard":[["hasAny",["bn","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Brunei Darussalam."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2733ab1f","guard":[["hasAny",["element","item number","nth","position","se"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sweden."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-275861ca","guard":[["hasAny",["bh","item number","nth","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Bahrain."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-27a50ec4","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vg"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Virgin Islands (British)."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2aaf4734","guard":[["hasAny",["invert case","item number","ng","nth","position","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2c34470d","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2e8208ba","guard":[["hasAny",["item number","mn","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Mongolia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2f940118","guard":[["hasAny",["ge","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Georgia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2fb5fedf","guard":[["hasAny",["item number","nth","pa","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-30ffde0e","guard":[["hasAny",["fr","invert case","item number","nth","position","swap case","toggle case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-316b5fc6","guard":[["hasAny",["ad","item number","nth","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Andorra."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-319baa44","guard":[["hasAny",["invert case","item number","mc","nth","position","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-31a960d9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","lk","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-336465cc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gs","item number","nth","position","title case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-34172eab","guard":[["hasAny",["ec","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-34b5357a","guard":[["hasAny",["element","item number","nth","position","tk"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Tokelau."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-34cd97c1","guard":[["hasAny",["item number","kn","nth","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-35ff83e0","guard":[["hasAny",["item number","nth","se","shortest","shortest one","shortest word"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sweden."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-362a12fa","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","ss"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Sudan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-367dc2e1","guard":[["hasAny",["item number","mw","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-380fe1c4","guard":[["hasAny",["item number","nth","position","rw","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Rwanda."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-38130c61","guard":[["hasAny",["item number","mc","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-3a306979","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sn"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Senegal."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3a30e634","guard":[["hasAny",["item number","jm","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Jamaica."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3a66a05e","guard":[["hasAny",["gn","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Guinea."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3ac8a1b4","guard":[["hasAny",["item number","jm","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Jamaica."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3bd4da87","guard":[["hasAny",["fr","item number","nth","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3c0a78b1","guard":[["hasAny",["all caps","capital letters","capitals","ec","item number","nth","position","upper case","uppercase"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3c98fa20","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ee","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3ca736b5","guard":[["hasAny",["gi","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Gibraltar."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3d3793c1","guard":[["hasAny",["iq","item number","nth","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Iraq."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3dd15904","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","tr","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3f7e7fef","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","pw","upper case","uppercase"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-3fbc6962","guard":[["hasAny",["item number","nr","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nauru."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-40c0fb2a","guard":[["hasAny",["item number","ng","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-411e2bcb","guard":[["hasAny",["item number","ms","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Montserrat."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-414977b6","guard":[["hasAny",["element","item number","md","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Moldova, Republic of."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-416e5e7a","guard":[["hasAny",["cg","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Congo."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4341a0b0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","pw","title case"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4428e971","guard":[["hasAny",["element","item number","lr","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Liberia."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-462006a7","guard":[["hasAny",["invert case","item number","lk","nth","position","swap case","toggle case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4809b125","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","yt"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Mayotte."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-495c7df5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fr","item number","nth","position","title case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-497c9d5c","guard":[["hasAny",["ch","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Switzerland."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-49813eee","guard":[["hasAny",["invert case","item number","nth","position","pw","swap case","toggle case"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-49a123f9","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sm"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for San Marino."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4a5b04b0","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Virgin Islands (U.S.)."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4c8d89b7","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sx"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sint Maarten (Dutch part)."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4cad209d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mc","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4e94251d","guard":[["hasAny",["cv","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Cabo Verde."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4eadaaf4","guard":[["hasAny",["bq","item number","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Bonaire, Sint Eustatius and Saba."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-50db4c66","guard":[["hasAny",["cg","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Congo."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-51397013","guard":[["hasAny",["all caps","capital letters","capitals","gs","item number","nth","position","upper case","uppercase"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-51e98d31","guard":[["hasAny",["element","gm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Gambia."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-525f8102","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tc"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Turks and Caicos Islands."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5348c628","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mw","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-53e918f5","guard":[["hasAny",["ie","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ireland."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-56a7847e","guard":[["hasAny",["at","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for Austria."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-5756d6cd","guard":[["hasAny",["all caps","capital letters","capitals","ee","item number","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-5ab7aa42","guard":[["hasAny",["element","item number","nth","pm","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Pierre and Miquelon."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-5ac38a82","guard":[["hasAny",["element","item number","lk","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-5c6b4d77","guard":[["hasAny",["az","element","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-5ef6900c","guard":[["hasAny",["element","gn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Guinea."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-605892e2","guard":[["hasAny",["az","invert case","item number","nth","position","swap case","toggle case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-60da9fe6","guard":[["hasAny",["gy","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Guyana."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6327bba6","guard":[["hasAny",["item number","ly","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Libya."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-63389f29","guard":[["hasAny",["az","item number","lower case","lowercase","nth","position","small letters"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-653506e3","guard":[["hasAny",["cw","item number","nth","shortest","shortest one","shortest word"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Curaçao."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-654512a2","guard":[["hasAny",["az","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-65ee50c5","guard":[["hasAny",["cu","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Cuba."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-65f3155c","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","th"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Thailand."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-67f90702","guard":[["hasAny",["bb","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-68036481","guard":[["hasAny",["gs","item number","lower case","lowercase","nth","position","small letters"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-69aae5f2","guard":[["hasAny",["element","item number","nth","pf","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for French Polynesia."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-6a3bd080","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6a6ef0af","guard":[["hasAny",["gs","item number","nth","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-6da17652","guard":[["hasAny",["bb","item number","nth","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6df2ba06","guard":[["hasAny",["eg","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Egypt."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-7023ca4b","guard":[["hasAny",["item number","my","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for Malaysia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-71ef8d83","guard":[["hasAny",["element","item number","nth","position","sn"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Senegal."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-7227f4f0","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-727e1d8b","guard":[["hasAny",["ee","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-73243066","guard":[["hasAny",["item number","nth","om","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Oman."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-744039da","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","zw"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Zimbabwe."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7634a566","guard":[["hasAny",["bb","invert case","item number","nth","position","swap case","toggle case"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-766c3c8d","guard":[["hasAny",["ht","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Haiti."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-78b8ae30","guard":[["hasAny",["item number","nth","pa","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-790cb903","guard":[["hasAny",["item number","lower case","lowercase","nth","pa","position","small letters"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7a8f7fef","guard":[["hasAny",["item number","nth","position","pw","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7b05db50","guard":[["hasAny",["gs","item number","nth","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7ba8e388","guard":[["hasAny",["bb","item number","lower case","lowercase","nth","position","small letters"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7c1cbc8b","guard":[["hasAny",["element","item number","nth","position","pw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-7c545290","guard":[["hasAny",["item number","lk","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7c6dba2d","guard":[["hasAny",["item number","nth","nz","shortest","shortest one","shortest word"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for New Zealand."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7c8380d9","guard":[["hasAny",["item number","nth","nu","shortest","shortest one","shortest word"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Niue."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7cc7ceef","guard":[["hasAny",["item number","ng","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7d2b4214","guard":[["hasAny",["ge","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Georgia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7d78c476","guard":[["hasAny",["invert case","item number","nth","pa","position","swap case","toggle case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7dad0197","guard":[["hasAny",["element","item number","kw","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Kuwait."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-7ee5768d","guard":[["hasAny",["item number","kn","nth","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-7f2f1423","guard":[["hasAny",["element","item number","nth","position","ss"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Sudan."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-7fdb331f","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tv"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Tuvalu."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-84977641","guard":[["hasAny",["element","item number","nth","position","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-84f01b22","guard":[["hasAny",["item number","mc","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-86c4d8dc","guard":[["hasAny",["all caps","capital letters","capitals","fr","item number","nth","position","upper case","uppercase"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-8716bd41","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tk"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Tokelau."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-88c7a147","guard":[["hasAny",["fr","item number","nth","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-8993187e","guard":[["hasAny",["element","item number","mu","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Mauritius."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-89a78eb5","guard":[["hasAny",["cv","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Cabo Verde."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-89c94c21","guard":[["hasAny",["item number","nc","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for New Caledonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8a0c6714","guard":[["hasAny",["element","item number","ms","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Montserrat."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-8af5f3f6","guard":[["hasAny",["item number","kw","nth","shortest","shortest one","shortest word"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Kuwait."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8b548a68","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","ng","nth","position","title case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8b83e2f6","guard":[["hasAny",["item number","lk","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8bc18fd7","guard":[["hasAny",["item number","mn","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Mongolia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8e38bc8f","guard":[["hasAny",["fr","item number","lower case","lowercase","nth","position","small letters"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-90ddad48","guard":[["hasAny",["item number","lower case","lowercase","ng","nth","position","small letters"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-91052529","guard":[["hasAny",["element","ie","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ireland."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-913bd40d","guard":[["hasAny",["bn","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Brunei Darussalam."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-91948f5b","guard":[["hasAny",["et","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Ethiopia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-919bf96a","guard":[["hasAny",["element","item number","lu","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Luxembourg."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-9368170e","guard":[["hasAny",["bb","item number","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-965bc09b","guard":[["hasAny",["fr","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-977c5da4","guard":[["hasAny",["item number","my","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for Malaysia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-980e3999","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pa","position","title case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9ab71088","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ec","item number","nth","position","title case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9f0f25ba","guard":[["hasAny",["item number","no","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Norway."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a39bb3c2","guard":[["hasAny",["gt","item number","nth","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Guatemala."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a3ffeaef","guard":[["hasAny",["element","fm","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Micronesia, Federated States of."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-a412ffd2","guard":[["hasAny",["item number","nth","pw","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a57957f5","guard":[["hasAny",["az","item number","nth","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-a5ef4a1d","guard":[["hasAny",["element","item number","kn","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-a636fd9d","guard":[["hasAny",["ch","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Switzerland."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a69a2578","guard":[["hasAny",["item number","kn","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ab8a99be","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-ac547cce","guard":[["hasAny",["element","item number","nth","position","qa"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Qatar."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ac7e1f45","guard":[["hasAny",["all caps","capital letters","capitals","item number","mc","nth","position","upper case","uppercase"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ac89e0c8","guard":[["hasAny",["ec","invert case","item number","nth","position","swap case","toggle case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-aec21c28","guard":[["hasAny",["element","item number","ne","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Niger."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-afbeec76","guard":[["hasAny",["ht","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Haiti."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b015212d","guard":[["hasAny",["ee","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b2d883cc","guard":[["hasAny",["item number","nth","position","rw","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Rwanda."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b330aebc","guard":[["hasAny",["item number","lower case","lowercase","mc","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b5cb3490","guard":[["hasAny",["ee","item number","nth","shortest","shortest one","shortest word"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b60e3b0f","guard":[["hasAny",["cw","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Curaçao."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-b6a561a7","guard":[["hasAny",["gy","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Guyana."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b6f52830","guard":[["hasAny",["item number","my","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for Malaysia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b7b09bf4","guard":[["hasAny",["element","item number","ma","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Morocco."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-b9158d2e","guard":[["hasAny",["item number","mw","nth","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-b99a1f61","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","za"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Africa."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bb22aa63","guard":[["hasAny",["item number","lr","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Liberia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bd1a3700","guard":[["hasAny",["item number","nth","qa","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Qatar."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-be76cb22","guard":[["hasAny",["fm","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Micronesia, Federated States of."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bf0d9ec7","guard":[["hasAny",["element","item number","nth","position","sx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sint Maarten (Dutch part)."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-bf522886","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","pa","position","upper case","uppercase"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c0926fa7","guard":[["hasAny",["all caps","capital letters","capitals","item number","kn","nth","position","upper case","uppercase"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c147cab9","guard":[["hasAny",["item number","ne","nth","shortest","shortest one","shortest word"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Niger."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c18be06c","guard":[["hasAny",["item number","lower case","lowercase","nth","position","pw","small letters"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c23c1ffb","guard":[["hasAny",["item number","no","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Norway."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c24a445a","guard":[["hasAny",["element","gt","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Guatemala."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c2dc3a79","guard":[["hasAny",["element","item number","nth","position","sm"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for San Marino."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c5aa2a93","guard":[["hasAny",["eg","item number","nth","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Egypt."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c6788c58","guard":[["hasAny",["id","item number","nth","shortest","shortest one","shortest word"]],["has","iso"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Indonesia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c69696ca","guard":[["hasAny",["item number","nth","position","pw","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-c7350603","guard":[["hasAny",["bb","item number","nth","position","shortest","shortest one","shortest word"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c98a3b1c","guard":[["hasAny",["element","item number","nc","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for New Caledonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ca2b666e","guard":[["hasAny",["br","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Brazil."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cab52d0f","guard":[["hasAny",["gm","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Gambia."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cabd05f3","guard":[["hasAny",["element","item number","ng","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-cc7b4144","guard":[["hasAny",["item number","nth","pa","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cc89dea2","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","uy"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Uruguay."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ce2484fa","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ve"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Venezuela, Bolivarian Republic of."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ce8e53ee","guard":[["hasAny",["cz","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Czechia."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cf843843","guard":[["hasAny",["item number","md","nth","shortest","shortest one","shortest word"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Moldova, Republic of."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cfbfe918","guard":[["hasAny",["all caps","bb","capital letters","capitals","item number","nth","position","upper case","uppercase"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-d1d82193","guard":[["hasAny",["ec","item number","lower case","lowercase","nth","position","small letters"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d29b2dcb","guard":[["hasAny",["ec","item number","nth","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d2f4e993","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d55b4b54","guard":[["hasAny",["dz","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Algeria."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-d579df08","guard":[["hasAny",["item number","nth","pf","shortest","shortest one","shortest word"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for French Polynesia."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d72403b7","guard":[["hasAny",["item number","mc","nth","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d879b345","guard":[["hasAny",["ae","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for United Arab Emirates."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d9b418b6","guard":[["hasAny",["az","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-da4f17b4","guard":[["hasAny",["cu","element","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Cuba."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-db4c3516","guard":[["hasAny",["ae","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for United Arab Emirates."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dd20d385","guard":[["hasAny",["item number","ma","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Morocco."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dd3a195e","guard":[["hasAny",["item number","mv","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," ",{"slot":1}," for Maldives."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dd7f2933","guard":[["hasAny",["element","item number","nth","position","yt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Mayotte."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-de25b578","guard":[["hasAny",["element","id","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Indonesia."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-de41b4e8","guard":[["hasAny",["item number","nth","pm","shortest","shortest one","shortest word"]],["has","iso"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Pierre and Miquelon."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e1360532","guard":[["hasAny",["ee","invert case","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e1ad848b","guard":[["hasAny",["element","item number","nth","nu","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Niue."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e2228a4c","guard":[["hasAny",["element","item number","mw","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e52c5a31","guard":[["hasAny",["gs","invert case","item number","nth","position","swap case","toggle case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e58a923a","guard":[["hasAny",["item number","mv","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e5fb3146","guard":[["hasAny",["at","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for Austria."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e60a939f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","kn","nth","position","title case"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e7e001e7","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","vn"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Viet Nam."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-eadd2b0e","guard":[["hasAny",["element","item number","ly","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Libya."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-edf84af1","guard":[["hasAny",["bz","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Belize."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ef485533","guard":[["hasAny",["gs","item number","nth","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-eff190ab","guard":[["hasAny",["item number","mw","nth","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-effb2f53","guard":[["hasAny",["item number","mu","nth","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Mauritius."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f0b89ee8","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sj"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Svalbard and Jan Mayen."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f256dcdd","guard":[["hasAny",["et","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ethiopia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f44e6be2","guard":[["hasAny",["all caps","capital letters","capitals","item number","lk","nth","position","upper case","uppercase"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f6304d50","guard":[["hasAny",["aq","item number","nth","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Antarctica."]},["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fb0f61e3","guard":[["hasAny",["element","fr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-fb3cb298","guard":[["hasAny",["all caps","az","capital letters","capitals","item number","nth","position","upper case","uppercase"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-fcfc8602","guard":[["hasAny",["ec","item number","nth","position","shortest","shortest one","shortest word"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-fdc442c4","guard":[["hasAny",["element","item number","nth","position","sj"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Svalbard and Jan Mayen."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-06cce199","guard":[["hasAny",["bz","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BZ ",{"slot":1}," for Belize."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-10859fbe","guard":[["hasAny",["item number","my","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for Malaysia."]},["transform.nthStr",["sense.content"],["sense.first"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-21951021","guard":[["hasAny",["br","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BR ",{"slot":1}," for Brazil."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-22270979","guard":[["hasAny",["item number","nth","position","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VI ",{"slot":1}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-28c45fd5","guard":[["hasAny",["each word","fr","item number","nth","position","split into words"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for France."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2d725463","guard":[["hasAny",["item number","nth","position","tc"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TC ",{"slot":1}," for Turks and Caicos Islands."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2e3965d6","guard":[["hasAny",["ht","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HT ",{"slot":1}," for Haiti."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3ee830ae","guard":[["hasAny",["gi","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GI ",{"slot":1}," for Gibraltar."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-491bdd0c","guard":[["hasAny",["item number","mv","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MV ",{"slot":1}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4baa9039","guard":[["hasAny",["each word","ec","item number","nth","position","split into words"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Ecuador."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-54ec92e3","guard":[["hasAny",["each word","item number","ng","nth","position","split into words"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Nigeria."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-572f0101","guard":[["hasAny",["item number","nth","position","vg"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VG ",{"slot":1}," for Virgin Islands (British)."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5eb84d9f","guard":[["hasAny",["each word","item number","kn","nth","position","split into words"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Saint Kitts and Nevis."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6001019f","guard":[["hasAny",["cz","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CZ ",{"slot":1}," for Czechia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6788f53b","guard":[["hasAny",["ge","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GE ",{"slot":1}," for Georgia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6bc72095","guard":[["hasAny",["each word","ee","item number","nth","position","split into words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Estonia."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-729ada62","guard":[["hasAny",["et","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ET ",{"slot":1}," for Ethiopia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7959c94b","guard":[["hasAny",["item number","my","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MY ",{"slot":1}," for Malaysia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7a305c8b","guard":[["hasAny",["each word","item number","lk","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Sri Lanka."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7e906696","guard":[["hasAny",["each word","item number","mw","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Malawi."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-802d7a5c","guard":[["hasAny",["at","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for Austria."]},["transform.nthStr",["sense.content"],["sense.first"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-86f45613","guard":[["hasAny",["bn","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BN ",{"slot":1}," for Brunei Darussalam."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8eddc806","guard":[["hasAny",["item number","nth","position","rw"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RW ",{"slot":1}," for Rwanda."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-914b9974","guard":[["hasAny",["each word","item number","nth","position","split into words","tr"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Türkiye."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-946b9220","guard":[["hasAny",["gy","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GY ",{"slot":1}," for Guyana."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9f14dae9","guard":[["hasAny",["each word","gs","item number","nth","position","split into words"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for South Georgia and the South Sandwich Islands."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a4f08aa8","guard":[["hasAny",["item number","jm","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," JM ",{"slot":1}," for Jamaica."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a66ab94c","guard":[["hasAny",["bb","each word","item number","nth","position","split into words"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Barbados."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a736d66b","guard":[["hasAny",["az","each word","item number","nth","position","split into words"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Azerbaijan."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ab520d17","guard":[["hasAny",["it","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IT ",{"slot":1}," for Italy."]},["transform.nthStr",["sense.content"],["sense.first"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ac8e83b6","guard":[["hasAny",["ae","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AE ",{"slot":1}," for United Arab Emirates."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b7f0aac3","guard":[["hasAny",["item number","no","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NO ",{"slot":1}," for Norway."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bdf6becc","guard":[["hasAny",["item number","mn","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MN ",{"slot":1}," for Mongolia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dd0dcd48","guard":[["hasAny",["each word","item number","nth","pa","position","split into words"]],["has","twoletter"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Panama."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e2c9a2f2","guard":[["hasAny",["each word","item number","nth","position","pw","split into words"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Palau."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e6e83991","guard":[["hasAny",["at","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AT ",{"slot":1}," for Austria."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e6f21bd9","guard":[["hasAny",["each word","item number","mc","nth","position","split into words"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for Monaco."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7e6f7a61","guard":[["hasAny",["item number","mv","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["sense.roman"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8a17e5cb","guard":[["hasAny",["item number","nth","position","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["sense.roman"],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-00da6fbf","guard":[["hasAny",["item number","mn","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Mongolia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-052f988f","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","ve"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Venezuela, Bolivarian Republic of."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-05eb6412","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.title",["sense.roman"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0779a2e7","guard":[["hasAny",["gy","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Guyana."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-09956380","guard":[["hasAny",["bz","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Belize."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0b4f9e8f","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ve"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Venezuela, Bolivarian Republic of."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-0bf89890","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","vg"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (British)."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0dfd6a06","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tc"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Turks and Caicos Islands."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-119d7dbb","guard":[["hasAny",["gf","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for French Guiana."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-15736cc1","guard":[["hasAny",["cz","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Czechia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-1591332a","guard":[["hasAny",["gi","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Gibraltar."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-16e02205","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.lower",["sense.roman"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-17b5b58b","guard":[["hasAny",["ge","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Georgia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1a5a5189","guard":[["hasAny",["bz","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Belize."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1b023dec","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tj"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Tajikistan."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2078b193","guard":[["hasAny",["gy","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Guyana."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-22076a7a","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2265e2eb","guard":[["hasAny",["gi","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Gibraltar."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2666523d","guard":[["hasAny",["item number","nth","rw","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Rwanda."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2910cdd3","guard":[["hasAny",["item number","mn","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Mongolia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2a45bf17","guard":[["hasAny",["br","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brazil."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2a6252b7","guard":[["hasAny",["ae","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for United Arab Emirates."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2d94bd54","guard":[["hasAny",["item number","mn","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Mongolia."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2fc2da67","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-34f616ee","guard":[["hasAny",["item number","lv","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Latvia."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-388c5f4d","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sl"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Sierra Leone."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3991afe5","guard":[["hasAny",["item number","jm","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Jamaica."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-399e14fe","guard":[["hasAny",["item number","jm","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Jamaica."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3a6f246d","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3d3e7dd7","guard":[["hasAny",["bn","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brunei Darussalam."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-456cae23","guard":[["hasAny",["item number","no","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Norway."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-467d01e6","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tf"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for French Southern Territories."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-48659e48","guard":[["hasAny",["item number","mv","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4a26235b","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tc"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Turks and Caicos Islands."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4c7256d9","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-50b438a6","guard":[["hasAny",["ht","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Haiti."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-528f5d4c","guard":[["hasAny",["bg","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Bulgaria."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-52aa5b9a","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tc"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Turks and Caicos Islands."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-54cb6370","guard":[["hasAny",["ae","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for United Arab Emirates."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-551569bf","guard":[["hasAny",["br","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brazil."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-554b8dd8","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","sl"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Sierra Leone."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-57116123","guard":[["hasAny",["item number","nth","position","rw","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Rwanda."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-572c6020","guard":[["hasAny",["et","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Ethiopia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5954c105","guard":[["hasAny",["item number","lv","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Latvia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5ec9551f","guard":[["hasAny",["ga","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Gabon."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6045f337","guard":[["hasAny",["gr","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Greece."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-61bcfa2b","guard":[["hasAny",["ae","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for United Arab Emirates."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-627c53e5","guard":[["hasAny",["ht","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Haiti."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-642f9dbd","guard":[["hasAny",["gp","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Guadeloupe."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6c6b1620","guard":[["hasAny",["item number","nth","position","rw","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Rwanda."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6c967f89","guard":[["hasAny",["item number","jm","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Jamaica."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7186fe01","guard":[["hasAny",["item number","mn","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Mongolia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-72685866","guard":[["hasAny",["br","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brazil."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-75cecd3d","guard":[["hasAny",["gi","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Gibraltar."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-75e41866","guard":[["hasAny",["gy","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Guyana."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-75ec181b","guard":[["hasAny",["item number","no","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Norway."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7745ad9e","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vg"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (British)."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-79047ad4","guard":[["hasAny",["item number","mv","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7d7ca9ff","guard":[["hasAny",["ht","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Haiti."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7df5a01e","guard":[["hasAny",["bm","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Bermuda."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-840b6e85","guard":[["hasAny",["ht","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Haiti."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8baad387","guard":[["hasAny",["bz","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Belize."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8f15e29d","guard":[["hasAny",["bz","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Belize."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-912100c8","guard":[["hasAny",["cz","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Czechia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-91622118","guard":[["hasAny",["et","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Ethiopia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9162b2cc","guard":[["hasAny",["gy","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Guyana."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-92aceb11","guard":[["hasAny",["item number","mn","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Mongolia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-92ed1542","guard":[["hasAny",["ae","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for United Arab Emirates."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-934fc8b4","guard":[["hasAny",["ge","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Georgia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-96ebf397","guard":[["hasAny",["gi","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Gibraltar."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-972b0757","guard":[["hasAny",["item number","jm","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Jamaica."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9c1854cb","guard":[["hasAny",["cz","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Czechia."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9cef2e23","guard":[["hasAny",["br","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brazil."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9e6c07d9","guard":[["hasAny",["gl","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Greenland."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9ea515cc","guard":[["hasAny",["item number","nth","position","rw","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Rwanda."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a21a3c3f","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vg"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (British)."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a26893db","guard":[["hasAny",["item number","mv","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a390927f","guard":[["hasAny",["ht","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Haiti."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a43e0830","guard":[["hasAny",["item number","jm","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Jamaica."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a4d02066","guard":[["hasAny",["et","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Ethiopia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-aef8f0f8","guard":[["hasAny",["cz","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Czechia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b4ecd7e0","guard":[["hasAny",["ae","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for United Arab Emirates."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b65e5a0a","guard":[["hasAny",["et","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Ethiopia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b81dfcf0","guard":[["hasAny",["gi","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Gibraltar."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b84ffa0e","guard":[["hasAny",["bn","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brunei Darussalam."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c0b30d49","guard":[["hasAny",["item number","mv","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c77712de","guard":[["hasAny",["item number","no","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Norway."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c8ba2061","guard":[["hasAny",["ge","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Georgia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c951f0c5","guard":[["hasAny",["item number","lower case","lowercase","mv","nth","position","small letters"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.lower",["sense.roman"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c9d0610c","guard":[["hasAny",["br","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brazil."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c9e67033","guard":[["hasAny",["cz","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Czechia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d08d7480","guard":[["hasAny",["gf","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for French Guiana."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d0f3ff2a","guard":[["hasAny",["bz","item number","nth","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Belize."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d5072d79","guard":[["hasAny",["gy","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Guyana."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dae8682d","guard":[["hasAny",["bn","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brunei Darussalam."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-de2c1f23","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tc"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Turks and Caicos Islands."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e0dc1b30","guard":[["hasAny",["item number","no","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Norway."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e1e52da1","guard":[["hasAny",["ge","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Georgia."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e3cb062a","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","vg"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (British)."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-e439461c","guard":[["hasAny",["gr","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Greece."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e505a573","guard":[["hasAny",["item number","nth","position","rw","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Rwanda."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e6a3b8c8","guard":[["hasAny",["bn","item number","nth","position","shortest","shortest one","shortest word"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brunei Darussalam."]},["transform.nthStr",["sense.words"],{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ed8317c5","guard":[["hasAny",["bn","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brunei Darussalam."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ee4fe835","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","ve"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Venezuela, Bolivarian Republic of."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-efd410b3","guard":[["hasAny",["item number","nth","position","shortest","shortest one","shortest word","tj"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Tajikistan."]},["transform.nthStr",["sense.content"],["sense.first"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f86a7b36","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mv","nth","position","title case"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.title",["sense.roman"]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-02da5f8a","guard":[["hasAny",["cz","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Czechia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0e8bafb2","guard":[["hasAny",["ht","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Haiti."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-12c51ca3","guard":[["hasAny",["cz","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Czechia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1b7ea3a1","guard":[["hasAny",["ae","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for United Arab Emirates."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-22d678c8","guard":[["hasAny",["item number","mn","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Mongolia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2e963c02","guard":[["hasAny",["item number","jm","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Jamaica."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2fcaabed","guard":[["hasAny",["item number","nth","position","rw"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Rwanda."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-30535da2","guard":[["hasAny",["et","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Ethiopia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4090d1cb","guard":[["hasAny",["bn","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brunei Darussalam."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-422b0625","guard":[["hasAny",["item number","nth","position","rw"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Rwanda."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4331179f","guard":[["hasAny",["gy","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Guyana."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-525ce106","guard":[["hasAny",["ht","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Haiti."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5d7b864c","guard":[["hasAny",["bz","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Belize."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5e0089e0","guard":[["hasAny",["item number","nth","position","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5f22b8c0","guard":[["hasAny",["et","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Ethiopia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-65d7d842","guard":[["hasAny",["item number","nth","position","tc"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Turks and Caicos Islands."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-69cef1ba","guard":[["hasAny",["bn","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brunei Darussalam."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6d6db9b0","guard":[["hasAny",["item number","mv","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-744a0c84","guard":[["hasAny",["br","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brazil."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7cc78924","guard":[["hasAny",["item number","mv","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8dd2da7e","guard":[["hasAny",["item number","nth","position","tc"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Turks and Caicos Islands."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-932a2868","guard":[["hasAny",["ae","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for United Arab Emirates."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-943a9a2c","guard":[["hasAny",["each word","item number","nth","position","split into words","vi","words"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["render.list",["transform.words",["sense.roman"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9b56beb1","guard":[["hasAny",["ge","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Georgia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a0ab44cc","guard":[["hasAny",["item number","nth","position","vi"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a28334bb","guard":[["hasAny",["each word","item number","nth","position","split into words","vi","words"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (U.S.)."]},["transform.nthStr",["sense.words"],{"lit":3}],["render.and",["transform.words",["sense.roman"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a8cc0831","guard":[["hasAny",["bz","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Belize."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-abf1220b","guard":[["hasAny",["item number","nth","position","vg"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (British)."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ade1f22d","guard":[["hasAny",["each word","item number","mv","nth","position","split into words","words"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["render.and",["transform.words",["sense.roman"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b20bdb89","guard":[["hasAny",["item number","mn","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Mongolia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b392cc78","guard":[["hasAny",["item number","jm","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Jamaica."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c2fb75b4","guard":[["hasAny",["gi","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Gibraltar."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cd01286a","guard":[["hasAny",["item number","no","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Norway."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d3b1e92e","guard":[["hasAny",["item number","nth","position","vg"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Virgin Islands (British)."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-dca6fdb8","guard":[["hasAny",["gi","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Gibraltar."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e03681a0","guard":[["hasAny",["gy","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Guyana."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e6222026","guard":[["hasAny",["ge","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Georgia."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e727ff28","guard":[["hasAny",["br","item number","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Brazil."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fa5db464","guard":[["hasAny",["item number","no","nth","position"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Norway."]},["transform.nthStr",["sense.words"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fb7d7a71","guard":[["hasAny",["each word","item number","mv","nth","position","split into words","words"]],["has","alpha2"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," for Maldives."]},["transform.nthStr",["sense.words"],{"lit":3}],["render.list",["transform.words",["sense.roman"]]],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8a479aad","guard":[["has","code"],["has","twoletter"],["has","has"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MC":"The code MC stands for Monaco.","which country has the two-letter code IQ":"The code IQ stands for Iraq.","which country has the two-letter code IE":"The code IE stands for Ireland.","which country has the two-letter code NG":"The code NG stands for Nigeria.","which country has the two-letter code EG":"The code EG stands for Egypt.","which country has the two-letter code OM":"The code OM stands for Oman.","which country has the two-letter code QA":"The code QA stands for Qatar.","which country has the two-letter code BJ":"The code BJ stands for Benin.","which country has the two-letter code GS":"The code GS stands for South Georgia and the South Sandwich Islands.","which country has the two-letter code AD":"The code AD stands for Andorra.","which country has the two-letter code CG":"The code CG stands for Congo.","which country has the two-letter code BH":"The code BH stands for Bahrain.","which country has the two-letter code PW":"The code PW stands for Palau.","which country has the two-letter code KN":"The code KN stands for Saint Kitts and Nevis.","which country has the two-letter code LK":"The code LK stands for Sri Lanka.","which country has the two-letter code MA":"The code MA stands for Morocco.","which country has the two-letter code EC":"The code EC stands for Ecuador.","which country has the two-letter code PA":"The code PA stands for Panama.","which country has the two-letter code AZ":"The code AZ stands for Azerbaijan.","which country has the two-letter code MW":"The code MW stands for Malawi.","which country has the two-letter code BB":"The code BB stands for Barbados.","which country has the two-letter code TK":"The code TK stands for Tokelau.","which country has the two-letter code VN":"The code VN stands for Viet Nam.","which country has the two-letter code CV":"The code CV stands for Cabo Verde.","which country has the two-letter code SS":"The code SS stands for South Sudan.","which country has the two-letter code FM":"The code FM stands for Micronesia, Federated States of.","which country has the two-letter code MU":"The code MU stands for Mauritius.","which country has the two-letter code IS":"The code IS stands for Iceland.","which country has the two-letter code FR":"The code FR stands for France.","which country has the two-letter code GM":"The code GM stands for Gambia.","which country has the two-letter code HK":"The code HK stands for Hong Kong.","which country has the two-letter code CU":"The code CU stands for Cuba.","which country has the two-letter code MS":"The code MS stands for Montserrat.","which country has the two-letter code CH":"The code CH stands for Switzerland."}}},
{"id":"n-133b0667","guard":[["has","gm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code GM":"The code GM stands for Gambia."}}},
{"id":"n-1eaab4e9","guard":[["has","bb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code BB":"The code BB stands for Barbados."}}},
{"id":"n-2af63a2c","guard":[["has","lk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code LK":"The code LK stands for Sri Lanka."}}},
{"id":"n-38b51359","guard":[["has","ie"],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code IE":"The code IE stands for Ireland."}}},
{"id":"n-41d87d9f","guard":[["has","cg"],["has","twoletter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code CG":"The code CG stands for Congo."}}},
{"id":"n-4533d608","guard":[["has","ad"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code AD":"The code AD stands for Andorra."}}},
{"id":"n-50e55270","guard":[["has","ss"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code SS":"The code SS stands for South Sudan."}}},
{"id":"n-63a29f39","guard":[["has","vn"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code VN":"The code VN stands for Viet Nam."}}},
{"id":"n-71edbfd6","guard":[["has","az"],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code AZ":"The code AZ stands for Azerbaijan."}}},
{"id":"n-7f2c71e8","guard":[["has","cu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code CU":"The code CU stands for Cuba."}}},
{"id":"n-7fd27239","guard":[["has","ms"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MS":"The code MS stands for Montserrat."}}},
{"id":"n-82a44e4c","guard":[["has","mw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MW":"The code MW stands for Malawi."}}},
{"id":"n-8a3bdb39","guard":[["has","mc"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MC":"The code MC stands for Monaco."}}},
{"id":"n-8c62bf2e","guard":[["has","ng"],["has","twoletter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code NG":"The code NG stands for Nigeria."}}},
{"id":"n-8d5d86e1","guard":[["has","cv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code CV":"The code CV stands for Cabo Verde."}}},
{"id":"n-9b3455cb","guard":[["has","bj"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code BJ":"The code BJ stands for Benin."}}},
{"id":"n-9e5cb0e7","guard":[["has","pw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code PW":"The code PW stands for Palau."}}},
{"id":"n-aa1f5ff0","guard":[["has","kn"],["has","twoletter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code KN":"The code KN stands for Saint Kitts and Nevis."}}},
{"id":"n-bb44eb1c","guard":[["has","ch"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code CH":"The code CH stands for Switzerland."}}},
{"id":"n-c0bfef72","guard":[["has","iq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code IQ":"The code IQ stands for Iraq."}}},
{"id":"n-c93566e3","guard":[["has","gs"],["has","twoletter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code GS":"The code GS stands for South Georgia and the South Sandwich Islands."}}},
{"id":"n-cc7abe3b","guard":[["has","tk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code TK":"The code TK stands for Tokelau."}}},
{"id":"n-cc7bc209","guard":[["has","fr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code FR":"The code FR stands for France."}}},
{"id":"n-cf435497","guard":[["has","ma"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MA":"The code MA stands for Morocco."}}},
{"id":"n-d06f0463","guard":[["has","qa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code QA":"The code QA stands for Qatar."}}},
{"id":"n-d63da4e8","guard":[["has","fm"],["has","twoletter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code FM":"The code FM stands for Micronesia, Federated States of."}}},
{"id":"n-d8818ce9","guard":[["has","hk"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code HK":"The code HK stands for Hong Kong."}}},
{"id":"n-e6d43b86","guard":[["has","pa"],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code PA":"The code PA stands for Panama."}}},
{"id":"n-e7122d98","guard":[["has","om"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code OM":"The code OM stands for Oman."}}},
{"id":"n-eb4599f9","guard":[["has","eg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code EG":"The code EG stands for Egypt."}}},
{"id":"n-f68f234a","guard":[["has","ec"],["has","twoletter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code EC":"The code EC stands for Ecuador."}}},
{"id":"n-f764ea50","guard":[["has","mu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code MU":"The code MU stands for Mauritius."}}},
{"id":"n-f81b4e2b","guard":[["has","bh"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which country has the two-letter code BH":"The code BH stands for Bahrain."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"the alpha-2 code BG stands for which country","expect":{"contains":["Bulgaria"],"notRefusal":true}},{"q":"which country has the two-letter code MC","expect":{"contains":["Monaco"],"notRefusal":true}},{"q":"the alpha-2 code AT stands for which country","expect":{"contains":["Austria"],"notRefusal":true}},{"q":"which country has the two-letter code IQ","expect":{"contains":["Iraq"],"notRefusal":true}},{"q":"the alpha-2 code BM stands for which country","expect":{"contains":["Bermuda"],"notRefusal":true}},{"q":"name the country with ISO alpha-2 code AQ","expect":{"contains":["Antarctica"],"notRefusal":true}},{"q":"name the country with ISO alpha-2 code DZ","expect":{"contains":["Algeria"],"notRefusal":true}},{"q":"name the country with ISO alpha-2 code GT","expect":{"contains":["Guatemala"],"notRefusal":true}},{"q":"name the country with ISO alpha-2 code SX","expect":{"contains":["Sint Maarten (Dutch part)"],"notRefusal":true}},{"q":"name the country with ISO alpha-2 code NE","expect":{"contains":["Niger"],"notRefusal":true}},{"q":"name the country with ISO alpha-2 code UY","expect":{"contains":["Uruguay"],"notRefusal":true}},{"q":"name the country with ISO alpha-2 code KW","expect":{"contains":["Kuwait"],"notRefusal":true}},{"q":"the alpha-2 code TF stands for which country","expect":{"contains":["French Southern Territories"],"notRefusal":true}},{"q":"which country has the two-letter code IE","expect":{"contains":["Ireland"],"notRefusal":true}},{"q":"which country has the two-letter code NG","expect":{"contains":["Nigeria"],"notRefusal":true}},{"q":"name the country with ISO alpha-2 code NZ","expect":{"contains":["New Zealand"],"notRefusal":true}},{"q":"the alpha-2 code TC stands for which country","expect":{"contains":["Turks and Caicos Islands"],"notRefusal":true}},{"q":"name the country with ISO alpha-2 code MD","expect":{"contains":["Moldova, Republic of"],"notRefusal":true}},{"q":"the alpha-2 code MV stands for which country","expect":{"contains":["Maldives"],"notRefusal":true}},{"q":"name the country with ISO alpha-2 code LU","expect":{"contains":["Luxembourg"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
