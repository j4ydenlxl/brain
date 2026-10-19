// weight-of-name-1f15-rev-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"weight-of-name-1f15-rev-neo-g10","class":"weight-of-name-1f15-rev","generation":10,"lane":"neo","grownFrom":["which name has the weight 149 lbs.","231 lbs. is the weight of which name","which name has the weight 390 lbs.","252 lbs. is the weight of which name","name the name whose weight is 266 lbs.","name the name whose weight is 430 lbs.","name the name whose weight is 228 lbs.","name the name whose weight is 188 lbs.","name the name whose weight is 286 lbs.","410 lbs. is the weight of which name","770 lbs. is the weight of which name","194 lbs. is the weight of which name","name the name whose weight is 335 lbs.","which name has the weight 330 lbs.","which name has the weight 232 lbs.","which name has the weight 226 lbs.","name the name whose weight is 198 lbs.","name the name whose weight is 186 lbs.","which name has the weight 219 lbs.","name the name whose weight is 214 lbs."],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-ufcstats-data-91a378","columns":["name","weight"],"n":4504,"cols":[{"f":"0Tom Aaron|0Darion Abbey|0Farida Abdueva|0Mansur Abdul-Malik|0Tahir Abdullayev|0Shamil Abdurakhimov|0Hiroyuki Abe|0Klidson Abreu|0Cyborg Abreu|0Daniel Acacio|0Scott Adams|0Zarrukh Adashev|0Kantharaj Agasa|0Mostapha Al-Turk|0Junior Albini|0Gilbert Aldana|0Royce Alger|0Andre Amado|0Bertrand Amoussou|0Matt Andersen|0Andy Anderson|0Lowell Anderson|0Alex Andrade|1zunna Anyanwu|0Josh Appelt|0Cyril Asker|0Steven Asplund|0Luciano Azevedo|0Scott Baker|0Chris Barnett|0Alan Baudot|0Eric Bedard|0Mike Bencic|0Karla Benitez|0Josh Bennett|0Dan Bobish|0Gregory Bouchelaghem|0Mike Bourke|0Lukasz Brzeski|0Josh Burns|0Donnie Chappell|0Marcos Conrado Jr.|0Abel Cullum|0Hugo Cunha|0Alexandre Dantas|0Sean Daugherty|0Mike Davis|0Josh Diekmann|1honata Diniz|1on Olav Einemo|2sh Epps|0Tom Erikson|0Eric Esch|0Katsuaki Furuki|0Marcelo Golm|0Joey Gomez|0Gabriel Gonzaga|1erard Gordeau|0Damian Grabowski|0Royler Gracie|0Cesar Gracie|0Steven Graham|0Maurice Greene|0Anthony Guarascio|0Tony Halme|0Gerry Harris|0Dhafir Harris|0Jon Hess|0Art Jimmerson|0Tony Johnson|0Jon Jones|0Arthur Lopes|1lexandru Lungu|2iev Makhmud|0John Matua|0Michael McDonald|0Tom Murphy|0Jan Nortje|0Stephen Palling|0Raphael Pessoa|0Keenan Raymond|0Nicdali Rivera-Calanoc|0Jean Silva|0Bruno Silva|0Victor Valenzuela|0AJ Cunningham|3Dobson|3Fletcher|4onseca|3Matthews|4cKee|3Siscoe|1alon Cruz|2ron Brink|6Ely|6Jeffery|6Lanfranco|6Miller|6Phillips|7ico|6Riley|7osa|6Simpson|6Tau|7rujillo|6Wetherspoon|7ilkinson|1bdellah Er-Ramy|3ul Azeem Badakhshi|6Hussein|6Rakhman Yakhyaev|8zak Alhassan|5-Kareem Al-Selwady|7erim Edilov|2el Trujillo|2ner Lloveras|2ongo Humphrey|2ram Torres|2u Azaitar|3bakar Nurmagomedov|9Vagaev|3s Magomedov|1cacio Dos Santos|2hilles Estremadura|3med Labasanov|1dam Antolin|5Bramhald|5Cella|5Fugitt|5Hunter|5Khaliev|5Livingston|6ynn|5Meredith|6ilstead|5Piccolotti|5Schindler|6mith|6teele|5Wieczorek|5Yandiev|2ilet Nurmatov|3n Duenas|2lan Amagov|3i Edwards|2rian Diaz|7Luna Martinetti|7Serrano|7Yanez|6o Martins|8Santos|4enna Jenkins|1gulali|1hejiang Ailinuer|2mad Hassanzada|1iemann Zahabi|2lin Perez|4ya Muratbek|2sling Daly|1ji Susilo|1kbarh Arreola|2ihiro Gono|5to Tanaka|3ra Corassani|6Kikuchi|6Shoji|3toshi Tamura|3yo Nishiura|1l Iaquinta|3Matavao|2ain Van der Merckt|3n Belcher|5Gomez|5Hiro|5Jouban|5Omer|5Patrick|3tengheili|3vutdin Gadjiev|2bert Cheng|7Duraev|7Morales|7Rios|7Tadevosyan|8umenov|6a Cerra Leon|6o Crane|8Mina|9ontes|8Uda|2den Coria|2ejandro Flores|aGarcia|aPerez|aVillalobos|3ksa Camur|6ndar Rakic|8er Emelianenko|8ra Albu|9e Topuria|5ei Kunchenko|8Oleinik|3n Amedovski|3ssandro Costa|5io Di Chirico|8Sakara|3x Caceres|6hambers|6rispin|5Da Silva|6unworth|5Enlund|5Garcia|6ilpin|6orgees|5Higley|6uddleston|7nter|5Karalexis|5Morono|5Nicholson|5Oliveira|5Pereira|9z|5Reyes|6icci|5Schoenauer|6erdyukov|6oto|6tiebling|5Torres|5White|5Zuniga|4a Grasso|5nder Crispim|aGustafsson|aHernandez|aMorgan|bunoz|aOtsuka|aPoppeck|aSarnavskiy|bhlemenko|boldatkin|aTrevino|aVolkanovski|eov|aYakovlev|7r Romanov|8e Barros|aFerreira|branca Nogueira|aPantoja|4ia Thainara|5s Davis|8ufresne|2fonso Alcarez|3red Khashakyan|2i AlQaisi|4Bagautinov|3askhab Khizriev|3bi Idiris|3ce Ardelean|6Pereira|3k Lorenz|3stair Overeem|2jamain Sterling|2lan Begosso|6Goes|6Nascimento|6Zuniga|3en Berube|6Crowder|6Frye Jr.|2onzo Martinez|8enifield|2ptekin Ozkilic|2ton Cunningham|2varo Herrera Mendoza|3in Cacdac|6Hines|6Robinson|1mador Ramirez|3nda Cooper|7Lemos|7Nunes|7Ribas|3r Suloev|3ury Bitetti|2ber Tackett|2ilcar Alves|3r Albazi|7iakbari|5Rahnavardi|5Sadollah|4an Gogoladze|1n Tuan Ho|2anias Mulumba|3toly Tokov|2derson Dos Santos|9Silva|3re Ewell|6Fialho|8li|6Galvao|7usmao|6Lima|6Muniz|8ssi|6Pederneiras|8troski|6Roberts|6Santos|7oukhamthath|6Walker|7inner|5a Lee|6s Gustafsson|8Michailidis|8Spang|9tahl|5i Arlovski|7Kopylov|7Semenov|5w Craig|7Holbrook|7Martinez|8ontanez|7Ramm|7Sanchez|7Todhunter|7Valladerez|6s Nakahara|5y Koreshkov|7Pulyaev|3y Enz|5Murad|5Ogle|6logun|5Uhrich|5Wang|7ters|2elya Toktogonova|2gad Bisht|3e Loosa|4l De Anda|6Pacheco|5a Hill|7Magana|5o Antonio|7Trevino|3ga|2istavio Medeiros|2na Elmose|2sar Chalangov|3hul Jubli|2te Delija|3hony Adams|9lves|9vila|8Birchak|8Christodoulou|8Do|9rilich|8Figueroa|8Hamilton|9ernandez|8Ivy|8Johnson|8Lapsley|9eone|8Macias|9orrison|8Njokuani|8Perosh|attis|8Rocco Martin|amero|9uiz|8Smith|8Taylor|9orres|3on Berzin|6Kuivanen|6Turkalj|6Zafir|5i Hardonk|6na Shevchenko|6o Arroyo|8Banuelos|9raga Neto|8Carlos Junior|bvalho|8Dos Santos|9uarte|8Jones|8McKee|9endes|9onteiro|8Rodrigo Nogueira|8Schembri|9ilva|8Trocoli|5y Rea|3wain Britt|2var Boynazarov|5bek Daniyalbekov|2ying Wang|1oriqileng|1riane Carnelossi|7da Silva|3el Beck|6Gandulla|3sa Matsuda|2jan Bhullar|2lene Blencowe|2man Ashimov|6Tsarukyan|5do Villarreal|3en Petrosyan|2nold Allen|2t Arciniega|4Santore|3em Frolov|6Lobov|6Vakhitov|4nus Young|3ur Minev|6Oumakhanov|1sbel Cancio|2he Bowman|3iek Ajim|3kan Mokhtarian|3lee Evans-Smith|5y Yoder|2jabharan|2kar Askar|bov|6Mozharov|2pen Ladd|2suerio Silva|2u Almabayev|1teba Gautier|2sushi Yamamoto|1ugusto Mendes|9ontano|8Sakai|2relijus Kerpe|2sten Lane|4in Arnett|7Bashi|7Hubbard|7Lingo|7Springer|7Tweedy|7Vanderford|1xel Sola|1zamat Bekoev|7Gashimov|7Murzakanov|7Nuftillaev|3t Maksum|2iz Khaydarov|0BJ Penn|1aergeng Jieleyisi|2hatebole Batebolati|2iley Schoenfelder|3sangur Susurkaev|2lajin|2o Quach|2rb Honchak|3t Palaszewski|4osz Fabinski|8Szewczyk|3u Harn|2s Rutten|3sil Hafez|2tgerel Danaa|2zigit Atajev|1ea Malecki|2c Rawlings|2kzat Almakhan|2lal Muhammad|2n Alloway|5skren|4Earwood|4Holscher|4Johnston|6nes|4Lagman|4Nguyen|4Reiter|5othwell|4Saunders|5osoli|4Wall|3ardo Sopaj|3dy Casimir|3eil Dariush|3ito Lopez|3jamin Bennett|4i Radach|3oit Saint Denis|3son Henderson|3tley Syler|2rnardo Magalhaes|2sam Yousef|2the Correia|2von Lewis|1harat Kandare|1ia Mesquita|2biano Fernandes|2ll Algeo|5Cooper|5Duvall|5Mahood|4y Brand|6Elekana|7vangelista|6Giovanella|6Miles|6Pasulatan|6Quarantillo|6Ray Goff|6Vaughan|1lagoy Ivanov|3ir Tugman|3ke Bilder|7owman|6Watkins|3s Avena|2ood Diamond|1o Cantrell|3Nickal|2Hyun Park|2b Cook|4Gilstrap|4Sapp|5chrijber|3by Cooper|6Escalante|6Flynn|6Hoffman|6Lashley|6McAndrews|7offett|6Nash|6Sanchez|7outhworth|7tack|6Voelker|2gdan Grad|8uskov|2jan Mihajlovic|6Velickovic|2laji Oki|2oker DeRousse|2ston Salmon|1rad Blackburn|5Gumm|5Imes|5Katona|6ohler|5Mitchell|6orris|5Pickett|5Riddell|6oyster|5Scott|5Tavares|4y Fink|6Hiestand|7uang|3hyam Zurcher|3nden Lee Hinkle|5o Pericic|6n Cash|8Davis|8Foxworth|8Gaines|9irtz|8Halsey|9ester|9olmes|8Jenkins|8Lewis|9owe|8Magana|9elendez|9ichaels|9oreno|8Polcare|8Royval|8Saling|ayles|9ene|9huey|8Thatch|8Vera|9isher|8Wolff|4ko Cikatic|3xton Smith|2endan Allen|8Loughnane|8O'Reilly|8Schaub|9eguin|5on Marotte|5son Ribeiro|4nan Ward|4t Primus|3t Bergmark|4t Albee|6Cooper|6Johns|6Rogers|6Tillis|2ian Bowles|6Camozzi|7obb|6Davidson|6Ebersole|6Foster|6Gassaway|7eraghty|6Houston|6Johnston|6Kelleher|6Lo-A-Njoe|6McLaughlin|7elancon|6Ortega|6Rogers|6Schwartz|7leeman|7tann|6Warren|5na Fortino|3stol Marunde|2ock Jardine|6Larson|7esnar|3die Farber|3gan Walker|3k Weaver|3nson Mohika|3oke Mayo|2una Brasil|4no Ferreira|4o Assis|6Carvalho|6Korea|6Lopes|6Oliveira|6Santos|7ilva|7ouza|2yan Baker|8rberena|8ttle|6Caraway|6Humes|6Pardoe|6Travers|6Vetell|5na Fissori|3ce Mejia|7itchell|3son Kamaka|1u-Kyung Jung|2bba Bush|6Jenkins|6Pugh|2ck Meredith|2ddy Roberts|1yron Bloodworth|0CB Dollaway|1J Fernandes|3Hamilton|3Keith|3Marsh|3Vergara|1M Punk|1ain Carrizosa|5Velasquez|3o Bittencourt|6orralho|5Machado|7galhaes|2l Worsham|3e Yarbrough|4n Born|3lan Potter|3vin Kattar|2m Rowston|4Teague|3eron Church|8Dollar|8Else|8Olson|8Saaiman|9motherman|8VanCamp|2naan Kawaihae|2ol Uno|4an Loughran|2rina Damm|3l Deaton|5Malenko|5Seumanutafa|5Toomey|4a Esparza|4i Judice|4o Pedersoli Jr.|7rater|5s Barreto|7Calderon|9ndelario|8ondit|7Eduardo Rocha|7Felipe|7Hernandez|8uachin|7Leal|7Mota|7Newton|7Prates|7Ulberg|7Vera|7Zevallos|4s John De Tomas|5ton Harris|4ton Jones|8Minus|3melo Marrero|3ol Foro|4s Fodor|3ter Williams|2sey Huffman|6Kenney|6O'Neill|7lson|6Ryan|2t Zingano|3hal Pendred|1edric Doumbe|2sar Almeida|7rzamendia|6Marscucci|2zar Ferreira|5y Oleksiejczuk|1had Anheliger|5Cook|7rvin|5George|6riggs|5Hanekom|5Johnson|5Laprise|6eonhardt|5Mendes|5Reiner|6obichaux|5Sutton|5Vance|5W. Saunders|3el Sonnen|3lid Arrab|3n Sung Jung|4-Mi Jeon|4ce Farrar|7Rencountre|4dler Cole|4gHo Lee|5Min Yoon|3ralampos Grigoriou|4lene Gellner|6s Bennett|9yrd|8Johnson|aurdain|8McCarthy|aTorry|8Oliveira|8Radtke|9osa|5ie Brenneman|8Campbell|8Kohler|8Ontiveros|8Valencia|8Ward|4on Spain|3s Skelly|4e Beebe|6Gibson|7ormley|6Hooper|6Sherman|6Waldon|5n Blair|3tt Lavender|2e Mills|3ick Kongo|3l Erwin-Davis|4sea Chandler|8Hackett|3pe Mariscal|3yanne Vlismas|4den Leialoha|2i Lewis-Parry|3bwikem Onyenegecha|3co Camus|3di Njokuani|2ris Amarante|7vila|6Barnhizer|7eal|7irchler|7ostick|7rennan|8own|6Camozzi|8riaso|7lements|7oggins|8ndo|8pe|7ulley|8rtis|6Daukaus|7empsey|7rumm|7uncan|6Ewert|6Fishgold|6Gruetzemacher|7uillen|8tierrez|6Haseman|8wk|7eatherly|8rrera|7ofmann|8ldsworth|8neycutt|8rodecki|6Indich|8man|6Jones|6Kelades|6Leben|7iguori|7ytle|6Manuel|7ickle|8erzwiak|6Padilla|7rice|6Sanford|8unders|7olomon|7pang|6Tickle|7uchscherer|6Wade|7eidman|7ilson|7right|6Yee|6de la Rocha|5tian Aguilera|aColombo|aEdwards|aLeroy Duncan|bohsen|aMorecraft|aOcon|aRodriguez|aUflacker|aWellisch|7en Savoie|7na Marks|6ophe Leninger|ar Alvidrez|cLopez|7s Giagos|2uck Grigsby|6Liddell|6O'Neil|3ngreng Koren|1indy Dandois|2ryl Gane|1laude Patrick|5ia Gadelha|8Leite|6o Mattos|8Puelles|8Ribeiro|8Silva|7nor Fontinelle|3y Collard|5French|5Guida|5Harvison|5Mitchell|4ton Carpenter|8MacFarlane|2eber Luciano|2ifford Starks|3nt Coronel|6Godfrey|6Hester|1odale Ford|3y Brundage|5Canterbury|7rrillo|6hovancek|5Donovan|6urden|5East|5Floyd|5Garbrandt|6ibson|5Haddon|5Law|5McKenzie|5Pfister|5Sons|6tamann|2lby Covington|6Thicknesse|3e Escovedo|5Miller|5Province|5Smith|5Williams|3in Fletcher|6Robinson|3leen Schneider|5y Bradford|4in Anglin|7Hart|8uckbody|3tin Cole|4on Smith|2nnor Matthews|3or Heun|6McGregor|3stantinos Philippou|2rey Anderson|6Hill|3inne Laframboise|3tavious Romious|4ez Coleman|4ney Casey|3y Devela|5Hendricks|5McKenna|5Peterson|5Sandhagen|5Walmsley|2ty Wheeler|2urt McGee|5ney Buck|9Turner|1rafton Wallace|3ig Jones|6Oxley|6White|6Zellner|2ezio de Souza|2istian Perez|9Quinonez|8e Justino|8o Marcello|6na Stanciu|2osley Gracie|1ub Swanson|2ng Le|2rt Warburton|4is Blaydes|7Millender|7Stout|1ynthia Calvillo|2rille Diabate|6o Padilha|0Da Woon Jung|2'Mon Blackshear|2Marques Johnson|2e Won Kim|3rmisi Zhawupasi|2giisuren Chagnaadorj|2ichi Abe|7Kamiya|3jiro Matsui|4u Takase|3ki Hata|3suke Nakamura|8Sugie|2kota Bush|7Cochrane|7Hope|2lcha Lungiambula|3e Hartt|2macio Page|3ian Pinas|7Stasiak|4en Brown|7Trites|4on Douglas|4r Hadzovic|6Ismagulov|6Mirenic|3on Jackson|6Wilson|5te Robinson|2n Argueta|4Barrera|4Charles|6ristison|5ramer|4Evensen|4Hardy|5enderson|5ooker|4Ige|4Lauzon|4Manasoiu|5iller|5olina|6ret|4O'Connor|4Severn|5tittgen|3iel Allen|7Barez|7Cormier|7Frunza|7Gallemore|8racie|7Jolly|7Kelly|7Lacerda|7Marcos|8cWilliams|7Omielanczuk|7Pereira|8ineda|8uder|7Roberts|9driguez|7Santos|9rafian|8chmitt|8pitz|9ohn|8traus|8wain|7Teymur|7Weichel|7Zellhuber|6le Taylor|4il Donchenko|4llo Villefort|5o Belluardo|7Marques|7Suzart|3ni McCormack|4y Abbadi|6Barlow|6Castillo|7havez|6Davis|7ownes|6Henry|6Martinez|7itchell|6Navarro|6Roberts|6Sabatello|7ilva|3te Rivera|3yelle Wolf|4lo Voievodkin|2ria Zhelezniakova|5n Weeks|3ko Stosic|3on Cruickshank|3rel Gholar|6l Horcher|8Montague|5n Elkins|7Stewart|7Till|7Uyenoyama|4ick Minner|5ll Schoonover|5on Caldwell|5us Flowers|4yl Cobb|2shawn Boatwright|4on Johnson|2ve Beneteau|7rry|5Cochran|7urchaine|5Dalgliesh|5Galera|5Herman|5Jansen|5Martin|6enne|5Phillips|5Rickels|5Strasser|5Terrel|5Zitanick|4y Grant|3i Bittencourt|5Ramos|4d Abbott|7vellan|6Baron|9rios|7ielkheden|7lanco|7ranch|6Dodd|8uglas|7vorak|6Gardner|7omez|6Heath|7ood|7ulett|6Kaplan|6Lee|8vicki|7oiseau|6Marshall|9tinez|7goyan|7ichaud|8tchell|6Onama|6Rasouri|7oberts|6Smith|6Terrell|8ymur|6Velasquez|6Zawada|2yana Silva|1eAnna Bennett|2Marco Villalona|2an Barry|5Hancock|5Lister|2iveson Figueiredo|4idas Taurosevicius|2l Hawkins|3son Heleno|2mba Seck|3etrious Johnson|7us Gioulacos|3ian Maia|2ni Daffa|4s Kang|6Sobolev|7tojnic|6Tiuliulin|5e Gomes|3nis Bermudez|8ryant|8uzukja|7Dombrow|7Hallman|7Olson|7Reed|7Siver|3ys Bondar|3zel Freeman|2quan Townsend|2rek Anderson|6Bohi|7runson|6Campos|6Downey|6Getzel|3on Winn|3rick Burnsed|8Krantz|8Lewis|8Mehmen|8Noble|2shaun Johnson|3mond Green|8Torres|2vin Clark|7ole|6Johnson|6Powell|6Smyth|3onte Smith|2wey Cooper|1hiego Lima|1iana Belbita|2ego Brandao|6Ferreira|6Henrique da Silva|6Lopes|6Nunes|6Rivas|6Sanchez|8raiva|3usel Berto|2leno Lopes|3lon Smith|2mitiri Wanderley|2n Thomas|3g Meng|3is Paiva Jr.|3o Pezao|2on Staring|4e Barbosa|2yar Nurgozhay|1jani Barbir|2orden Santos|1mitri Stepanov|6i Smoliakov|5y Poberezhets|7Sosnovskiy|1okonjonosuke Mishima|2m Mar Fan|3ingo Pilarte|5ic Brown|8Clark|8Waters|7k Cruz|9Reyes|6k Humburger|6que Steele|2n Carlo-Clauss|4Frye|4Madge|4Shainis|3'Tale Mayes|3ald Cerrone|7Sanchez|4von Frelow|8Hedrick|3g Huaxiang|6yun Kim|aMa|5Sik Yoon|4Hun Choi|5yun Seo|4i Yang|3nie Liles|4y Walker|3ovan Beard|3te Johnson|2oho Choi|2rian Price|7Ramos|2s Caras Jr.|2ug Evans|5Kay|5Marshall|4las Lima|8Silva de Andrade|1rakkar Klose|4o Rodriguez|2ew Brokenshire|5Dimanlig|6ober|5Fickett|5McFedries|5Pendleton|2icus Du Plessis|1uane Ludwig|2da Santana|2sko Todorovic|3tin Hazelett|7Jacoby|8oynson|7Kimura|7Moore|7Neace|7Ortiz|7Pague|8oirier|7Stoltzfus|7West|1wayne Cason|2ight Grant|7Joseph|1ylan Andrews|6Budka|6Lockard|6Mantello|6Potter|6Salvador|0Ebenezer Fontes Braga|1d Herman|3Ratcliff|2die Alvarez|6Gordon|6Mendez|6Ruiz|6Sanchez|6Wineland|6Yagin|3y Ellis|5Millis|2gar Cardenas|7hairez|6Garcia|2ilberto de Oliveira|3milson Souza|3van Santos|2men Shahbazyan|2naldo Oliveira|2son Barboza|7erto|6Drago|6Gomez|6Silva|2uarda Moura|6o Bustillos|8Chapolin|8Dantas|8Garagorri|8Neves|8Pamplona|8Torres Caut|2ward Faaloloto|3in Aguilar|6DeWees|6Figueroa|1frain Escudero|1gan Inoue|2idijus Valavicius|1iji Ishikawa|5Mitsuoka|1laina Maxwell|2dari Kurtanidze|3o Xavier Dias|2i Aronov|4Tamez|3as Garcia|6Silverio|6Theodorou|6Urbina|3ezer Kubanza|3jah Smith|3ot Marshall|3se Reed|4ha Ellison|7Helsper|3zabeth Phillips|4eu Zaleski dos Santos|2ves Brener|3is Mutapcic|6Sinosic|1manuel Newton|2il Meek|4iano Linares|9Sordi|5o Chavez|8uellar|4y Ducote|6Fernandez|6Kagan|6Whitmire|2manuel Sanchez|9Yarborough|2rah Sonmez|1nrique Barzola|8Marin|8Watson|2son Inoue|1oJin Park|1peraim Ginting|1ric Castile|5Galvan|5Irvin|5Jacob|5Lawson|5Magana|7rtin|6cConico|5Nolan|5Schafer|9mbari|8wartz|6helton|6mith|6picely|6teenberg|5Wisely|6ray|4k Gonzalez|6Montano|6Sanchez|7ilva|6Wanderlei|5a Almeida|3k Apple|5Koch|5Perez|5Silva|3n Blanchfield|3sson Ferreira|2nest Chavez|6a Kareckaite|3ie Juarez|6Verdicia|2os Baluyot|2rol Zimmerman|2yk Anders|1steban Ribovics|4fani Almeida|4van Payan|1thyn Ewing|1ugene Jackson|5io Tadeu|2n Soo Lee|1van Dunham|5Elder|6sguerra|5Tanner|4gelista Santos|2erett Cummings|8Sims|1werton Teixeira|0Fabian Gonzalez|6o Iha|8Scherner|4o Aguiar|6Cherant|6Gurgel|6Maldonado|7ello|6Nascimento|6Silva|5la Pidroni|3ricio Camoes|9Guerreiro|9Werdum|2laniko Vitale|2res Ziam|3id Basharat|3man Hasanov|2tima Kline|2zlo Mulabitinovic|1ederico Lopez|3or Emelianenko|6Nikolov|2lice Herrig|5ia Spencer|4pe Arantes|7Bunes|7Colares|7Franco|7Lima|7Olivieri|7Pena|8ortela|7Silva|7dos Santos|4x Klinkhammer|6Lee Mitchell|3lipe Andrew|2ng Pengchao|5Xiaocan|2rnando Bettega|aruno|9Gonzalez|9Padilla|4ie Garcia|1ilip Pejic|2ona Muxlow|1lavio Luiz Moura|2oyd Sword|1orrest Griffin|8Petz|1rancesco Maturi|czzeo|5imar Barroso|6s Carmont|8Marshall|8Ngannou|7co Bueno|aFigueiredo|brance|aPrado|aRivera|aTrevino|cinaldo|5ois Botha|4k Camacho|8racci|6Gomez|6Hamaker|6Lester|6Megallon|7ir|6Shamrock|7ilva|6Trigg|5ie Edgar|8Perez|8Saenz|2ed Ettish|4dy Vidal|4erick Brown|4son Paixao|4y Serrano|0Gabe Green|5Lemley|5Ruediger|3le Steveson|3riel Arges|8Benitez|9onfim|8Carrasco|9hecco|8Miglioli|aranda|8Salinas-Jones|antos|9ilva|7la Fernandes|8e Holloway|2dzhi Omargadzhiev|6murad Antigulov|2etano Pirrello|2lore Bofando|2n McGee|2reth Joseph|5t Whiteley|3reth McLellan|6t Armfield|8Gross|8Mueller|3y Frazier|5Goodridge|5Mangat|5Padilla|5Quan|5Tapusoa|2san Umalatov|3ton Bolanos|7Reyno|2uge Young|2vin Tucker|1eane Herrera|2gard Mousasi|2naro Valdez|3ki Sudo|3naro Strangis|2off Neal|3rge Allen|7Bush|7Hardwick|7Mangos|7Pacurariu|7Roop|7Sotiropoulos|8tork|8ullivan|7Zuniga|6s St-Pierre|5i Karakhanyan|2rald Harris|7Meerschaert|7Strebendt|6o de Freitas|3maine de Randamie|3onimo dos Santos|3ric Hayes|2sias Cavalcante|2za Kalman|1iacomo Lemos|3n Siqueira|5Villante|4ni Vazquez|2deon Ray|2ga Chikadze|3o Jara|2l Castillo|3bert Burns|8Jimenez|8Melendez|8Rael|8Smith|8Urbina|8Yvel|3les Arsene|4ian Robertson|2na Carano|5Mazany|2sele Moreira|1laico Franca Moreira|2eidson Cutis|4son Tibau|3ristone Santos|2oria de Paula|3ver Teixeira|1odofredo Pepey|2iti Yamauchi|2khan Saki|9ricam|2ldman Butler|2ran Reljic|1rant Dawson|3y Maynard|2eg Hardy|5McIntyre|5Nagy|5Rebello|5Scott|6oto|6tott|5Velasco|5Wilson|4or Gillespie|6y Rodrigues|2igory Popov|1uangyou Ning|2gun Gusman|2ido Cannetti|3lherme Costa|aPat|aUriel|aVasconcelos|biana|2nnar Nelson|2ram Kutateladze|2stavo Gabriel|8Lopez|2to Inocente|2y Mezger|1wanWoo Lim|0Hacran Dias|2iley Cowan|3sam Rida|2keem Dawodu|2mdy Abdelwahab|3id Amiri|2n Ten Yun|3Seul Kim|3nah Cifers|7Goldy|3s Nijman|5Stringer|2rold Howard|3ris Sarmiento|4y Hardwick|7unsucker|6Moskowitz|3vey Park|2shem Arkhagha|2tsu Hioki|2ven Torres|2yato Sakurai|3der Hassan|1e-Man Gipson|2ath Herring|5er Clark|2cher Sosa|3tor Aldana|7Lombard|7Ramirez|7Sandoval|7Urbina|2lena Crevar|3io Dipp|2nrique Da Silva Lopes|9Shiguemoto|9da Silva|4y Briones|6Cejudo|7orrales|6Martinez|7iller|2raldo Souza|3bert Burns|3dem Alacabek|3man Renting|7Terrado|4es Franca|3nani Perpetuo|3schel Walker|1idehiko Hasegawa|9Yoshida|4o Tokoro|4taka Monma|2larie Rose|2roko Yamanaka|4mitsu Kanehara|aMiura|4shi Izumi|4taka Yokoi|4yuki Takaya|2saki Kato|2tomi Akano|1o Bae Myeon|3Taek Oh|2lly Holm|2mer Moore|2ng Man Choi|2racio Gutierrez|2uston Alexander|8Dorr|1u Yaozong|2ang Feier|2gh Pulley|3o Duarte|5Govea|5Sandoval|5Viana|2mberto Bandenay|arown Morrison|9DeLeon|2nter Azure|7Worsham|2ssain Rasouli|1yder Amil|2eonjong Song|2un Gyu Lim|4Sung Park|0Ian Butler|4Entwistle|4Freeman|4Heinisch|4Loveland|4Machado Garry|5cCall|5urphy|4Rammel|2smin Lucindo|1bo Aslan|2ragim Magomedov|1caro Brito|2ho Larenas|1do Pariente|2ris Wasi|1gnacio Bahamondes|2or Araujo|5Borisov|5Cavalcanti|5Gracie|5Pokrajac|5Severino|5Vovchanchyn|5Zinoviev|1hor Potieria|1ke Villanueva|2ram Aliskerov|2uhisa Minowa|1ldemar Alcantara|2ia Topuria|4n Bouafia|4rde Santos|3ma Macfarlane|3r Latifi|2ya Kotau|1mani Lee|4ol Rodriguez|2pa Kasanganay|1n Su Hwang|1on Cherdivara|5utelaba|3y Razafiarison|2uri Kotchkine|1rene Aldana|2ina Alekseeva|2win Rivera|1saac Dulgarian|6Thomson|6Vallie-Flagg|3bela de Padua|3iah Hill|3o Kobayashi|2i Fitikefu|3s Verbeek|2lam Dulatov|6Makhachev|3em Masraf|2mael Bonfim|4il Naurdiev|2rael Adesanya|8lbuquerque|7Delgado|7Giron|2sa Isakov|4c DeJesus|3ei Tamura|2tela Nunes|1uri Alcantara|1van Cole|5Erslan|5Gnizditskiy|5Jorge|5Lopez|5Menjivar|5Salaverry|6erati|6htyrkov|5Valenzuela|4a Petrovic|1wo Baraniewski|1zabela Badurek|0J.T Taylor|1C Cottrell|1J Aldrich|4mbrose|3Okanovich|1P Buys|3Felty|1R Coughran|1W Wright|1acare Souza|3k Becker|5Cartwright|6ongdon|5Della Maddalena|6uffy|5Hermansson|5Jenkins|5Marshman|7y|6cGlaughlin|6orrison|5Nilson|5Shore|4ie Lee|4son McVey|3ob Kilburn|6Malkoun|6Noe|6Rosales|6Silva|6Volkmann|5e Smith|5i Jones|3queline Cavalcanti|2dson Costa|2e Suk Lim|3Hyun Park|2fel Filho|2i Herbert|3lton Almeida|3me Alvarez|6Jara|5lene Nievera|3r De Oliveira|5Farias|4zinho Rozenstruik|2ke Collier|5Ellenberger|5Hadley|6echt|5Lindsey|5Matthews|5O'Brien|5Rosholt|5Shields|3ob Lovstad|3ub Wiklacz|2lin Turner|2mahal Hill|4l Pogues|5l Emmers|3eel Massouh|4lle Jones|4s Barnes|7ochnovic|6Gabert|7iboo|7ray|6Hammortree|7ead|6Irvin|6Krause|6Lee|7lontop|6McSweeney|7oontasri|7ulheron|6Reese|6Te Huna|8rry|7hompson|7oney|6Vick|6Wade|8llace|7ilks|6Zikic|4y Simmons|5-Lyn Horth|3ie Colleen|6Houston|6Moyle|7ullarkey|6Pickett|6Siraj|6Varner|6Yager|2n Blachowicz|4Finney|3aina Silva|4y Harding|3sey Silva|2queline Amorim|2red Cannonier|7haffee|6Gooden|8rdon|6Hamman|6Papazian|6Rollins|8sholt|6Vanderaa|3jis Danho|3no Errens|3red Brooks|4od Kwitty|2smine Jasudavicius|3on Black|bford|7rilz|7utcher|6Day|7eLucia|8nt|6Fairn|7reeman|6Gilliam|7laza|7odsey|8nzalez|7uida|6High|6Ireland|6Jackson|6Knight|6Lambert|6MacDonald|7cLean|7edina|7iller|6Novelli|6Reinhardt|7iley|6Saggo|7harp|7uttie|6Tan|7hacker|6Von Flue|6Witt|6Young|2vi Alanis|4d Basharat|4er Reyes|7Vazquez|3y Ayala|2y Bogan|4Cucciniello|4Hieron|4Perrin|4Silva|1ean Francois Lenogue|5Matsumoto|5Silva|4-Paul Lebosnoyani|2ff Bedard|5Cox|6rotty|6urran|5Hougland|6ughes|5Joslin|5Molina|7nson|5Newton|5Terry|4erson Nascimento|2imeson Saudino|3sla Chaves|2ka Saragih|2nel Lausa|3na Castillo|4ifer Gonzalez|9Maia|3s Pulver|2ongYeong Lee|2remia Siregar|7h Billington|9Constant|9Labiano|9Metcalf|9O'Neal|9Riggs|9Wells|6e Holloway|5y Boczulak|7Freitag|7Hamilton|8orn|7Jackson|7Kennedy|8imball|7Lang|9rsen|7Malaterre|9y|7Stephens|7Tavares|7Umphries|7Wallace|3i Sitzes|3maine Andre|3ome LeBanner|7Rivera|3rel Venetiaan|4od Sanders|5n Peoples|4y Bohlander|2ss Bouscal|5Liaudin|4amyn Duke|4e Bongfeldt|7utler|6Finney|7orbes|7ujarczyk|6Gillespie|6Jones|7uarez|6Lennox|6Moreng|7urray|6Ronson|6Sanders|7trader|6Taylor|4ica Aguilar|9ndrade|8Eye|8Penne|8Rakoczy|7-Rose Clark|5n Ayari|3us Aguilar|6Pinedo|1honata Silva|4oven Pati|1i Yeon Kim|2anping Yang|2m Alers|4Miller|5ullen|4Wallhead|3i Manuwa|3mie Pace|7Rivera|4y Ambriz|6Crute|6Drago|6Flick|6Lawson|6Quinlan|3y Hettes|2n Aoi|4Bala|4Oh Kim|4Soo Son|3ensibieke Asikeerbai|3h Yu Frey|3iushiyue|3nosuke Kashimura|2ri Prochazka|1oachim Christensen|8Hansen|3nderson Brito|4na Jedrzejczyk|5e Wood|3o Elias|5Paulo Faria|6ierini|5Roque|5Zaiden|6eferino|3quim Silva|6n Buckley|2by Sanchez|2celyn Jones-Lybarger|2die Esquibel|2e Benoit|5rammer|4Camacho|6son|5harles|4Doerksen|5uarte|6ffy|4Ellenberger|4Giannetti|4Hernandez|5urley|4Jordan|4Lauzon|5owry|4Martin|5erritt|5oreira|4Neal|4Pardo|5earson|5roctor|5yfer|4Ray|5iggs|4Schilling|5lick|5olecki|6n|6to|5tevenson|4Taimanglo|4Vedepo|6res|4Warren|5ilk|3l Alvarez|5Sutton|5Thomas|3y Armstrong|5Beltran|5Gambino|6ilbert|6omez|5Hart|5Roberts|5Villasenor|2hil de Oliveira|3n Adajar|6lbert|7essio|7lan|5Campetella|7staneda|6holish|6larke|6ofer|5Dave Almanza|6evine|6ixson|6odson|7naldson|7wdy|7yle|5Elam|5Franchi|5Gunderson|8ther|5Halverson|7thaway|6osman|7ward|5Kelly|6olosci|6uhner|5Lewis|6ineker|6ober|5Maguire|7kdessi|7rsh|6oraga|5Paul Elias|6hillips|6olakowski|5Reedy|7nken|6ichard|5Salgado|8ter|5Teixeira|5Yannis|6oo|4ny Bedford|7Case|8isneros|7Eduardo|7Munoz|7Rees|8hodes|7Sampaio|7Walker|4y Hendricks|2ilton Lutterbach|2n Delos Reyes|4Fitch|4Kunneman|4Madsen|6nley|5urphy|4Tuck|3as Bilharinho|4tas Novaes|5han Brookins|9Contrestano|9Figueroa|9Goulet|9Martinez|aeunier|aicallef|bx|9Pearce|aiersma|9Rivera|9Santa Maria|9Wiezorek|blson|4vin Webb|3g Man Kim|5Wang Kim|6on Kim|3ny Carson|6Goh|6Parsons|2oSang Yoo|2rdan Bailey|7Dowdy|7Espinosa|7Goodwin|8riffin|7Johnson|7Leavitt|7Mein|7Parsons|7Radev|8inaldi|7Vucenic|7Williams|8right|3ge Gonzalez|7urgel|6Interiano|6Lopez|6Masvidal|6Oliveira|7rtiz|6Patino|6Rivera|6Santiago|6de Oliveira|5n Kruth|2se Alday|8o|6ugusto|5Barreto|5Canseco|5Daniel Medina|6elano|8gado|5Johnson|5Landi-Jons|5Maria|6ontanha|5Ochoa|5Palacios|6erez|5Quinonez|5Santibanez|6ouza|5Torres|4fine Knutsson|4lyne Edwards|4ph Benavidez|7Gigliotti|7Holmes|7Larcinese|7Morales|7Sandoval|3h Barnett|6ryant|6umgarner|5Clopton|6opeland|6ulibao|5Emmett|5Ferguson|6remd|5Grispi|5Haynes|6endricks|6okit|5Janousek|7rvis|5Koscheck|5LaBerge|5McDonald|5Neal|7er|5Paiva|7risian|6ulsifer|5Quinlan|5Rafferty|5Samman|8po|7n Diego|6hockley|aman|6mith|6tansbury|7uart|5Thomson|8rnburg|5Wick|4ua Burkman|7Van|7Wang-Kim|8eems|3iah Harrell|5ne Nunes|5s Musasa|2urney Newson|2van Leka|1uan Adams|6lcain|6ndres Luna|5Cabrera|5Diaz|5Espino|5Manuel Puig|6iranda|6ott|5Puerta|4camilo Ronderos|2les Bruchez|3ia Avila|6Budd|6Polastri|5n Erosa|7Marquez|7Sanchez|6a Lima|8Miller|6na Pena|4e Kedzie|5n Leblanc|5ta Martinez|4ja Stoliarenko|4o Arce|6Cesar Neves Jr.|6Paulino|4us Anglickas|7Walker|2mabieke Tuerxun|2nYong Park|5ung Hong|3gHyun Lee|3ie Browning|4or Assuncao|7Barata|7Dos Santos|7Tafa|3ya Kudo|4e Gao|2ssier Formiga|3tice Torres|5n Bruckmann|8uchholz|9rlinson|7Davis|8eMoney|7Edwards|8ilers|7Frazier|7Gaethje|8onzales|9vernale|8uthrie|7Haskins|9wes|7James|9ynes|8ones|7Lawrence|8edet|9vens|7Martin|8cCully|9Elfresh|7Patterson|8ennington|7Robbins|7Salas|8coggins|8mitley|8umter|7Tafa|7Wilcox|alis|8ren|6e Kish|2taro Nakao|0KB Bhullar|1J Noons|1aan Ofli|2i Asakura|4Kamaka III|6ra-France|4Yoshida|3k Brito|3lan Hill|4in Curran|3n Royer|3tlin Young|4o Oda|3wen|2jan Johnson|2leio Romero|4o Kwan|3i Robbins|4b Starnes|4ndra Faria|5e Medeiros|3oyan Kolev|2mal Shalorus|4ru Usman|3uela Kirk|2nako Murata|2ren Darabedyan|3ine Gevorgyan|7Silva|3l Amoussou|5Reed|6oberson|5Williams|as|4os Vemola|3o Parisyan|4l Rosa|5ina Kowalkiewicz|9Wojcik|2sey Tanner|3ib Murdoch|2thryn Paprocki|3lyn Cerminara|3suhiko Nagata|7sa Fujii|5nori Kikuno|5ya Inoue|6ori Shibata|2ue Fernandes|3shik Saikumar|2y Hansen|3la Harrison|3nan Kruschewsky|2zuhiro Hamanaka|9Nakamura|6sa Watanabe|4ki Okubo|7Tokudome|4la Vargas|4ma Maruyama|4nari Murakami|5ori Yokota|4o Misaki|4shi Sakuraba|4yuki Fujita|9Miyata|1eigo Kunihara|3ichiro Nakamura|aYamamiya|3suke Fujiwara|8Sasu|3ta Nakamura|4h Berish|9ry|6Hackney|6Jardine|6Mielke|6Rockel|6Wisniewski|2lly Dullanty|6Faszholz|6Kobold|6Velasco|3vin Gastelum|2mran Lachinov|2n Cross|4Kaneko|4Shamrock|5tone|3dall Grove|3go Ura|6Watanabe|3ichi Yamamoto|3ji Arai|6Osawa|3nedy Freeman|8Nzechukwu|5th Alexander|8Bergh|8Seegrist|4y Ento|6Florian|6Giddens|6Robertson|3to Imai|3yon Jackson|2rry Schall|6Vera|2stutis Smirnovas|2tlen Souza|7Vieira|2vin Aguilar|6Borjas|7urns|6Casey|7hristian|7room|6Engel|6Ferguson|6Gray|6Haley|7olland|6Jackson|7ordan|8usset|6Knabjian|6Lee|6Natividad|6Randleman|7oddy|8sier|6Syler|7zaflarski|6Vallejos|1habib Nurmagomedov|3dis Ibragimov|4zhi Bestaev|3lid Murtazaliev|7Taha|5l Rountree Jr.|3ma Worthy|4zat Chimaev|3os Williams|2omkrit Niimi|2usein Askhabov|1iefer Crosbie|3r Gooch|2ichi Kunimoto|2m Couture|4In Seok|3bert Alintozon|3o Leopoldo|2n Moy|3g Green|2ran Singh|3il Sidelnikov|3u Sahota|2t Cope|3t Campbell|2yoshi Tamura|1laudia Sygula|3yton Mai|2eydson Rodrigues|1ody Steele|2ichiro Matsumoto|2ji Kitao|5Oishi|2lton Englund|2nstantin Erokhin|2rey Kuppe|2tetsu Boku|2ya Kanda|3omi Matsushima|1ris McCray|6outinho|4haun Gilmore|4tian Rothaermel|5of Midoux|2on Gracie|2zysztof Jotko|aSoszynski|1ultar Gill|2niyoshi Hironaka|2rt Holobaugh|5Osiander|5Pellegrino|4is Campbell|2ya Ito|1wan Ho Kwak|2on Wonil|1yeungPyo Kim|2le Bochniak|7lt|6radley|5Daukaus|6ietz|6riscoll|5Jensen|5Kingsbury|6urtz|5Levinton|5Nelson|6oblitt|7ke|5Prepolec|5Reyes|5Stewart|7urgeon|5Watson|4r Phillips|2oji Horiguchi|3suke Sasaki|2ron Bowen|2uSung Kim|3ng Ho Kang|0LC Davis|1acey Schuckman|2nce Benoist|6Gibson|c Jr.|6Lawrence|3do Vannata|5n Quinones|7Showalter|2ra Procopio|3issa Pacheco|3ry Cureton|6Parker|2ureano Staropoli|5n Mueller|9rphy|2var Johnson|3erne Clark|2wrence Lui|2zar Stojadinovic|1eah Letson|3ndro Issa|8Silva|2e Brousseau|4Gibson|4Higgins|4Kwan Bum|4Murray|2igh Remedios|3ticia Pestova|2mont Davis|2n Bentley|2o Kuntz|4Sylvest|3n Aliu|5Edwards|5Shahbazyan|4ard Garcia|7o Damiani|9Guimaraes|9Mafra|aorales|9Santos|ailva de Oliveira|2rone Murphy|3ryan Douglas|2slie Hernandez|7Smith|2van Chokheli|6Makashvili|3i Alford|6vera|5Rodrigues Jr.|2wis Gonzalez|1i Jingliang|3Yunfeng|2am Anderson|5McGeary|3na Jojua|4g Na|2liya Shakirova|2na Kvokov|5Lansberg|3ton Vassell|2onel Lanham|2sa Ellis|5Kyriacou|3sette Neri|2udvik Sholinian|2vinha Souza|2z Carmouche|1loyd Van Dams|1odune Sincaid|2gan Clark|6Nail|6Urban|6Woods|2ik Radzhabov|2lohea Mahe|2ma Lookboonmee|2ne'er Kavanagh|2opy Godinez|2renz Larkin|6o Hood|2sene Keita|2uie Sutherland|4s Cosce|6Gaudinot|6Jauregui|7ourdain|6Lee Scott|6Smolka|6Taylor|1u Kai|3Zhengyong|2an Chagas|5Lacerda|4a Carolina|6Pinheiro|6Santos|2c Bondole|3as Alexander|8meida|6Brennan|6Caldas|8macho|6Fernando|6Gamaza|6Lopes|6Martins|6Rocha|6Stark|5z Sudolski|3iano Pereira|4e Pudilova|4o Linhares|3rezia Ria|2dovit Klein|2igi Fioravanti|6Vendramini|3s Felipe Dias|5Gomez|6urule|5Henrique|5Mendoza|5Pajuelo|6ena|5Ramos|5Saldana|7ntos|3z Azeredo|5Cane|5Dutra|5Firmino|2kasz Les|7Sajewski|3e Barnatt|5Caudillo|6ummo|5Fernandez|6lores|5Hartwig|5Jumeau|5Riley|6ockhold|5Sanders|6tewart|5Zachrich|2mumba Sayers|1v Zhenhong|1yle Beerbohm|2man Good|2oto Machida|0Mabelly Lima|2c Danzig|3hi Fukuda|3iej Jewtuszko|3k Brewer|4ens Semerzier|6zie Dern|4som Lee|3y Chiasson|2ds Burnell|2gno Almeida|6Dias|4us Cedenblad|3omed Ankalaev|8Bibulatov|8Gadzhiyasulov|8Mustafaev|8Sultanakhmedov|8Tuchalov|8Zaynukov|7rasul Gasanov|2hamed Aly|3eshate|2ia Stevenson|4ra Amanajas dos Santos|3ju Kujala|3maitituoheti Keremuaili|3quel Falcao|3rbek Taisumov|4on Santos|2ka Watson|3hmud Muradov|3i Pitolo|3oto Takimoto|3wan Amirkhani|2l Foki|3colm Gordon|8Wellmaker|3ik Lewis|3lory Martin|2na Martinez|3del Nallo|4o Gutierrez|4y Bohm|3el Kape|3ny Bermudez|6Tapia|6Vazquez|3oel Sousa|4lo Zecchini|4n Fiorot|3sher Khera|3tas Kondratavicius|3uel Exposito|7Gaxhja|7Rodriguez|7Torres|3vel Gamburyan|2rQuel Mederos|3a Romero Borella|3c Cofer|5Diakiese|5Stevens|4-Andre Barriault|4el Fortuna|6o Aguiar|8Brito|8Guimaraes|8Mello|8Rojo|4in Bandel|7Held|7Prachnio|7Tybura|7Wrzosek|5o Alexandre Junior|7Barbosa|7Cruz|7Navarro|4o Beltran|6Polo Reyes|6Ruas|6Tulio|5s Bonilla|8rigagao|7Galvao|7Mariano|7Rogerio de Lima|7Vinicius|7da Matta|4us Aurelio|7Bossett|8rimage|8uchecha|7Davis|7Hicks|7Jones|7Kowal|7LeVesseur|7McGhee|7Silveira|3ek Bujlo|3ia Oliveira|6Rios|6Silva|4lia Santos|4na Rodriguez|7Spasic|4o Bautista|6Mingaj|8randa|6Neto|6Piazzon|8nto|6Rivera|6Soto|8usa|7perry|5n Reneau|4us Enache|7Zaromskis|6z Ksiazkiewicz|4ya Agapova|3k Bocek|5Cherico|7oinski|6limaco|6oleman|5De La Rosa|6ickman|5Eddiva|5Godbeer|5Hall|6olst|7minick|6ughes|7nt|5Kerr|5Madsen|6unoz|5Robinson|5Scanlon|7hultz|6triegl|5Vologdin|7rgeas|5Weir|4o Damiani|4us Perez|3loes Coenen|5n Moraes|7Sims|7Vera|3nic Mann|3ques Daniels|3tin Bravo|8uday|9schkamp|7Day|7Kampmann|7Sano|8vensson|3vin Eastman|7Maldonado|7Vettori|3wan Rahiki|3yna Moroz|2saaki Satake|4katsu Funaki|aOkuda|6zu Imanari|4nori Kanehara|9Suda|9Tonooka|3hrabjon Ruzibaev|3io Fullen|3on Fowler|6Jones|3utatsu Yano|5o Kawana|2tej Penaz|4o Vogel|4us Mendonca|6z Gamrot|8Rebecki|3heus Camilo|8Nicolau|8Scheffel|3s Nilsson|3t Arroyo|5Bessette|6rown|5Dixon|6wyer|5Foki|6revola|5Grice|5Hamill|6elm|6obar|7rning|8wich|6ughes|5Kovacs|5Lee|6indland|6ucas|5Mitrione|5Pedro|5Ramirez|6icehouse|5Sayles|6chnell|6ecor|7rra|6kelton|5Van Buren|6each|5Wiman|4hew Lopez|8Riddle|8Semelsberger|5ieu Duclos|4y Iann|2urice Eazel|8Mitchell|8Smith|6io Alonso|9Rua|bffy|2x Gimenis|5riffin|4Holloway|4Martyniouk|5ustaki|4Rohskopf|3im Grishin|5o Blanco|2yana Kellem|3cee Barber|3ra Bueno Silva|1egan Anderson|3umi Fujii|2hdi Baghdad|2lchor Manibusan|3inda Fabian|4ssa Croden|8Gatto|8Martinez|9ullins|3quizael Costa|3sik Baghdasaryan|3ton Bowen|3vin Guillard|7Manhoef|2ng Bo|2rab Dvalishvili|3ritt Warren|1icah Miller|3hael Aswell Jr.|8Bisping|9ravo|9yrnes|8Chandler|aiesa|9ora|8Diaz|8Graves|8Imperato|8Johnson|8Knaap|9uiper|8Lerma|9ombardo|8Mangan|9cBride|aDonald|9orales|8Oliveira|8Page|att|8Trizano|5l Figlak|7Martinek|7Oleksiejczuk|4eal Gillmore|5l Batista|7Pereira|8razeres|7Quinones|6le Maher|aontague|9Waterson-Gomez|4ihiro Omigawa|5nori Tanaka|5yoshi Ohara|3k Parkin|4ael Lebout|4ey Gall|3ol Di Segni|2esha Tate|2guel Baeza|7Cosio|7Linares|7Torres|2ika Mehmet|2ke Aina|6ltman|5Breeden|7onzoulis|8wn|6udnik|5Campbell|6iesnolevicz|6ook|5Davis|6olce|5Easton|5French|5Glenn|6rundy|6uymon|5Hayes|5Jackson|6oy|5King|6yle|5Lullo|5Malott|7ssenzio|6inniger|6oreno|5Nickels|5Perry|6ierce|6olchlopek|6yle|5Rhodes|6icci|8hman|7o|6odriguez|6ussow|5Santiago|6eal|6tumpf|6wick|5Wessel|6hitehead|6ilkinson|5Zichelle|5de la Torre|5van Arsdale|4y Burnett|6Gonzalez|3hail Iloukhine|4eil Sazhiniani|3i Motono|2lana Dudieva|3co Voorn|3es Johns|6McDonald|3ton Vieira|2n Soo Kim|3Woo Kim|3oki Ichihara|4ru Toyonaga|2randa Granger|8Maverick|3ko Filipovic|3sad Bektic|2sha Cirkunov|2tch Clarke|6Gagnon|6Ramirez|8poso|6Whitesel|5ell Sipe|3suhiro Ishida|2zuki|4to Hirota|1o Miller|2destas Bukauskas|2hamed Ado|5mad Yahya|6ed Usman|2ise Rimbon|2lly McCann|2ntana De La Rosa|4el Jackson|4se Rendon|6rrat Conejo Ruiz|2rgan Charriere|2ti Horenstein|3oki Miyazawa|4nobu Tezuka|2unir Lazzez|2vsar Evloev|1ridul Saikia|1u Bae Choi|2hammad Mokaev|9Naimov|6ed Lawal|3sin Corbbrey|2in Gafurov|2rad Chunkaiev|3ilo Bustamante|7Rua|3taza Talha|7li Magomedov|2slim Salikhov|1ychal Clark|2ktybek Orolbai|2les Jury|0Nad Narimani|3ia Kassem|2h-Shon Burrell|3o Sugiyuma|2ir Melikyan|2m Phan|3srai Batbayar|2ndor Guelmino|2oki Inoue|6Matsushita|3ya Ogawa|4uki Kotani|2riman Abbasov|2srat Haqparast|4udin Nasrudinov|3sourdine Imavov|2talia Silva|4n Levy|3e Diaz|5James|5Landwehr|6oughran|5Maness|7rquardt|6ohr|7ore|5Quarry|5Schroeder|6mith|3han Coy|7Fletcher|7Jones|6iel Wood|2vajo Stirling|2yara Maia|2zareno Malegarie|3im Sadykhov|1eal Ewing|2emias Santana|2il Grove|5Magny|5Seery|5Wain|3man Gracie|1ghiem Van Y|1icco Montano|3holas Musoke|9Sergiacomi|3k Agallar|7uirre|5Barnes|6ustamante|5Catone|5Denis|6iaz|5Ertl|5Fiore|5Garcia|6ibbons|6onzalez|5Hein|5Klein|5Maximov|6eregali|5Newell|6olte|5Osipczak|5Pace|6enner|6ica|8cininni|7edmont|5Ring|6oehrick|7ssborough|5Sanzo|6erra|6perling|5Thompson|5Urso|3olae Negumereanu|6s Dalby|5le Caliari|2k Lentz|4Theotikos|3ita Krylov|3k Covert|3las Backstrom|7Stolze|3o Price|4la Joksovic|6jus Cilkinas|6s Motta|6y Veretennikov|2na Milosevic|5Nunes|2ssen Osterneck|1oad Lahat|3h Thomas|2buhiko Takada|6ro Obiya|2e Hernandez|2helin Hernandez|2lan Ticman|2ra Cornolle|3dine Taleb|3ifumi Yamamoto|3ma Dumont|5n Parke|1ursulton Ruziboev|3ullo Aliev|1yamjargal Tumendemberel|0OJ Dominguez|1ban Elliott|1de Osbourne|1laf Alfonso|2eg Taktarov|3ksandr Doskalchuk|2i Thompson|3ver Enkamp|4ier Aubin-Mercier|8Murad|2lie Schmid|2uwale Bamgbose|1mar Morales|4i Akhmedov|1nassis Parungao|1rion Cosce|2lando Wiet|2on Kahlon|1samu Tachihikari|2car Cota|2kar Piechota|1tari Tanzilovi|2gonbaatar Boldbaatar|2tman Azaitar|1umar Sy|1vince Saint Preux|1zzy Diaz|0Pablo Alfonso|6Garza|6Villaseca|2ddy Holohan|6McCorry|6Pimblett|2ige VanZant|2nnie Kianzad|2py Abedi|2rker Porter|2scal Krauss|2t Audinwood|4Barry|5enson|4Curran|4Healy|4Miletich|4Pytlik|4Sabatini|5chilling|3chy Mix|3ricia Alujas|7o Pitbull|6k Cote|9ummins|8Kaase|8Murphy|8Smith|9peight|8Walsh|9illiams|7y Freire|5k White|4yk Grabowski|2ul Bradley|6uentello|5Capaldo|6raig|7eighton|5Daley|5Felder|5Georgieff|5Herrera|5Jones|5Kelly|5Redmond|6odriguez|6uiz|5Sass|6ong|5Taylor|5Varelans|4a Luna|4ine Macias|4o Cesar Silva|7osta|6Filho|6Henrique|6Renato Junior|6Santos|6Thiago|2wan Maan|3el Nastula|6Pawlak|2yton Talbott|1earl Gonzalez|2dro Falcao|6Munhoz|6Nobre|6Otavio|6Rizzo|7ocha|2ggy Morgan|2r Eklund|2te Rodriguez|7gers Jr.|5Sabala|6ell|6pratt|5Williams|4r Barrett|6Danesoe|6Petties|6Sobotta|3r Yan|1hil Baroni|5Caracappa|8della|5Davis|5Harris|7wes|5Johns|5Rowe|4ip De Fries|7Perez|8reece|6e Lins|4lip Latu|8Miller|7e Nover|1iera Rodriguez|3tro Menga|2ngyuan Liu|2otr Hallmann|1oliana Botelho|3yana Viana|2ppies Martinez|1reston Parsons|2iscila Cachoeira|3ya Sharma|2o Escobedo|1uja Tomar|2nahele Soriano|0Qiu Lun|1uang Le|2emuel Ottoni|3ntin Pasley|2illan Salkilld|3nn Mulhern|4ton Jackson|0RJ Clifford|1abindra Dhant|2chael Ostovich|2dley Da Silva|2fa Garcia|4el Alves|7Carino|avalho|9valcante|8erqueira|7Del Real|8ias|8os Anjos|7Estevam|7Fiziev|8reitas|7Natal|7Pergentino|7Rebello|8ios|7Silva|7Tobias|6lo Oliveira|2heam Forest|2imond Magomedaliev|3nn Guerrero|4y Martinez|2ja Shippen|2lek Gracie|3ph Dillon|6Gracie|2ma Supandhi|4zan Emeev|8Kuramagomedov|8Temirov|3eau Thierry Sokoudjou|3i Hamed|4ro Hernandez|7Jimenez|4z Brahimaj|3on Taveras|5a Pascual|3sey Nijem|2na Rudra Pratap Singh|3da Markos|5ll Wallace|4y Brown|6Costa|8uture|3i Yahya|2oni Barcelos|3u Raou|2phael Assuncao|8Butler|8Uchegbu|2quel Pa'aluhi|8ennington|2shad Coulter|7Evans|5rd Lovelace|4id Magomedov|7Vagabov|2ul Castillo|5Rosas Jr.|5Sandoval|4ian Paiva|2vena Oliveira|2y Borg|4Perales|4Rodriguez|6uth|4Sefo|6raille|5loan|5teinbeiss|4Wizard|3anne dos Santos|3mond Daniels|2zak Al-Hassan|1eese Andy|2gezhen|3ina Tarin|6ldo Vieira|2i Tsuruya|3nier de Ridder|2mco Pardoel|3o Cardarelli|2n Ozaki|4Yawei|3an Barao|4to Moicano|7Sobral|7Verissimo|3e Kronvold|4e Forte|3zo Gracie|2uben Duran|2x Holman|4Richards|2yes Cortez Jr.|3naldo Trujillo|2za Arianto|5Madadi|5Nasri|1hadi Ferguson|2ys McKee|1icardo Abreu|9lmeida|9rona|8Barros|8Funch|8Lamas|8Morais|8Prasel|8Ramos|9omero|3co Rodriguez|3h Attonito|5Bouphanouvong|5Clementi|5Franklin|4ard Crunkilton|8Dalton|8Jacobi|8Odoms|8Walsh|7son Moreira|4ie Hightower|7Santiago|8mullen|7Vaculik|3k Davis|5Roufus|5Story|4son Gracie|8Zenidim|4y Calatayud|8mp|6Glenn|6Johnson|6Legere Jr.|6Palacios|6Rainey|6Simon|7teele|6Turcios|3o Altamirano|5DiSciullo|5Farrington|2ki Fukuda|2lley Dutro|2n Nakai|3at Fakhretdinov|3ya Nakamura|2o Tirto|2zvan Kuniev|1oan Carneiro|2b Broughton|4Emerson|4Font|4Kimmons|4MacDonald|5cCullough|4Sinclair|4Wilkinson|4Yundt|3bie Lawler|7Ring|3elis Despaigne|4rt Breslin|9yczek|7Densley|8rysdale|7Lucarelli|7McDaniel|7Peralta|7Ruchala|7Sanchez|7Valentin|7Whiteford|btaker|6a Rovel|6o Romero|8Traven|2cky Lee|7ong|2dney Faverus|7Wallace|3olfo Bellato|8Marques Diniz|8Rubio Perez|8Vieira|3rigo Damm|8Gracie|aipp de Sousa|8Lidio|8Nascimento|8Ruas|8Sezinando|8Vera|8de Lima|2ger Bowling|6Carroll|6Gracie|6Hollett|7uerta|6Narvaez|6Zapata|5io Bontorin|8Nogueira|2land Delorme|7Payne|6o Bedoya|8Delgado|9y|8Perez|3dan Sangcha'an|3les Gracie|2man Bogatov|7ravo-Young|6Dolidze|6Kopylov|6Mitichyan|6Salazar|6Zentsov|3ie Aram|2n Faircloth|5ields|4Henderson|4Keslar|4Sparks|5tallings|4Waterman|4van Clief|3al Siahaan|5d Carillo|7Jhun|6o Candido|8Rodriguez|3da Rousey|3gzhu|3nie Lawrence|4y Markes|3y Jason|5Sefo|4s Torres|2osevelt Roberts|2que Conceicao|6Martinez|2ry MacDonald|7rkham|5Singer|2se Conceicao|5Namajunas|3han Mainam|5un Jones|3i Sexton|3s Ebanez|5Pearson|6ointon|3tem Akman|2usimar Palhares|2xanne Modafferi|2y Boughton|4Jones|4Nelson|3bert Echeverria|3ce Gracie|3ston Wee|1uan Potts|2ben Villareal|5s Xavier|3in Williams|2dy Bears|4ard Moncayo|2el Panales|2i Imura|2lon Gardner|2slan Magomedov|3sell Doane|8Patrick|3tam Khabilov|1yan Bader|7stianelli|6enoit|5Couture|5Diaz|5Gandra|6racie|5Hall|7yes|6ealy|5Janes|6ensen|6immo|5Keenan|5LaFlare|7rson|6oder|5MacDonald|7digan|6cGillivray|9vern|5Parker|5Quinn|5Roberts|5Spann|6tonitsch|5Thomas|6obar|2o Chonan|4Kawamura|4Tajima|3ga Arimoto|2uho Miyaguchi|3ichi Murata|3ki Ueyama|3ta Sakurai|0Saad Awad|2bah Homasi|3ina Mazo|2eed Hosseini|2ge Northcutt|2i Wang|3d Nurmagomedov|4yokub Kakhramonov|3mon Oliveira|2ko Chivitchian|2lim Touahri|3vador Becerra|9Woods|2m Adkins|5lvey|4Fulton|4Greco|4Hoger|5ughes|4Liera|4Oropeza|4Patterson|4Sicilia|5pengler|5tout|4Watford|3andar Murodov|3my Morgan|3uel Sanches|8ilva|3y Schiavo|2nae Kikuta|3dra Lavado|3ford Alton Meeks|3gHoon Yoo|4Won Kim|4wook Kim|3tiago Luna|9Ponzinibbio|4o Curatolo|2parbeg Safarov|2ra McMann|4h Alpar|6D'alelio|6Frota|6Kaufman|6Moras|6Payant|2sha Palatnikov|2toru Kitaoka|4shi Honma|8Ishii|2ul Elizondo|2ygid Izagakhmaev|1cott Askham|6Bessac|7ills|6Carson|6Ettling|6Ferrozzo|7iedler|6Graham|6Harper|7oltzman|6Jorgensen|7unk|6Lighty|6McAfee|8Donald|7orris|6Norton|6Shaffer|7mith|6Ventimiglia|1ean Alvarez|5Bassett|6rady|5Gannon|7uci|5Holden|5Lally|6oeffler|5McCorkle|5O'Connell|7Haire|7Malley|5Pierson|5Salmon|7ntella|6haraf|7erk|6oriano|6pencer|6trickland|5Wilson|6oodson|2bastian Szalay|2driques Dumas|2ichi Ikemoto|2mmy Schilt|2o Hee Ham|3khyeon Ko|3ngChan Hong|2rgei Kharitonov|7Pavlovich|5y Ignatov|7Khandozhko|7Morozov|4hei Spivac|4io Gomez|7Moraes|7Pettis|3hiy Sidey|2th Baczynski|5Dikun|5Kleinbeck|5Petruzelli|2ungGuk Choi|5Woo Choi|1hah Kamali|4een Santana|3mar Bailey|4il Gamzatov|9ziev|3na Dobson|6Olsen|4e Burgos|6Campbell|8rwin|7ollins|6Howell|6Nelson|6Primm|6Roller|6Young|6del Rosario|5lle Dyer|4g Zhifa|4na Young|5on Clark|8Gugerty|8Ritch|9oss|3ra Magomedov|3un Etchell|5a Bannon|3vkat Rakhmonov|3wn Bunch|6Jordan|6Teed|3yilan Nuerdanbieke|4na Baszler|2eila Gaff|3ldon Westcott|4ton Graves|3m Rock|3rman Pendergarst|4rard Blackledge|5on Leggett|3ymon Moraes|2i Ming|3mon Smotritsky|3n Haraguchi|4go Kohara|4sho Anzai|4ya Aoki|2o Patrick Usami|3go Sato|3hei Nose|3ji Maruyama|3nie Carter|4te Barnes|2ungo Oyama|4ichi Shimizu|3ya Kamikubo|1iala Siliga|2dney Outlaw|7Silva|2jara Eubanks|2lvana Gomez Juarez|2m Kai Xiong|3eon Thoresen|3on Biyong|2one Latu|2rwan Kakai|2yar Bahadurzada|1lim Trabelsi|1o Yul Kim|2a Palelei|2diq Yusuff|2fia Montenegro|2ichi Nishida|2kun Koh|2lomon Hutcherson|8Renfro|2ng Kenan|5Yadong|2ra Rakhmonova|2vannahry Em|1pencer Fisher|8Hearns|2ike Carlyle|1tanislav Nedkov|2efan Klever|7Leko|7Sekulic|8truve|3phan Bonnar|7ie Egger|aFrausto|aLuciano|aWebber|5en Banaszak|ass|8Ledbetter|8Regman|8Thompson|3rling Ford|3ve Berger|7osse|7runo|7yrnes|6Cantwell|6Erceg|6Garcia|6Hadsel|6Jennum|7udson|6Kennedy|7ozola|6Lopez|6Mann|7ensing|7ontgomery|6Nelmark|6Ramirez|6Steinbeiss|6Vigneault|6White|5n Ciaccio|7Koslow|7Nguyen|7Peterson|7Siler|4ie Lynch|7Ray|3wart Nicoll|2ipe Miocic|2oney Hale|1uYoung You|2langrangbo|3tan Aliev|2man Mokhtarian|3it Kumar|3udaerji|2ng Bin Jo|1yuri Kondo|0TJ Brown|3Cook|3Dillashaw|3Grant|3Hepburn|3Laramie|3O'Brien|3Waldburger|1abatha Ricci|2dao Yasuda|2e Hyun Bang|9Lee|2fon Nchukwi|2gir Ulanbekov|2i Bowden|4Tuivasa|3ei Kin|3ga Iwasaki|3la Santos|3nara Lisboa|3yilake Nueraji|2kafumi Otsuka|4hiro Oba|4nori Gomi|4shi Sato|9ugiura|4ya Suzuki|5o Hashi|5uki Okada|3enori Sato|4ru Uchida|4shi Inoue|8Yamazaki|4ya Mizugaki|2lita Alencar|7Bernardo|7Nogueira|3lison Teixeira|2mdan McCrory|3ires Vidal|2neisha Tennant|3ner Boser|2rec Saffiedine|2teki Matsuda|3iana Suarez|3suro Taira|5ya Ando|8Iwasaki|8Kawajiri|8Mizuno|8Saika|2ylor Callens|7Johnson|7Lapilus|7Moore|7Roberts|1e Edwards|2baris Gordon|2cia Pennington|2dd Williams|4y Ash|2emu Packalen|2ila Tuli|2reza Bleda|3rance McKinney|9Saeteurn|4ell Brown|5nce Mitchell|4ion Ware|4y Etim|6Martin|3uto Ishihara|2tsuji Kato|5ya Seki|1haddeus Luster|3les Leites|3nh Le|2emba Gorimbo|3o Haig|5Rlayang|4dor Berggren|2iago Alves|7Moises|7Perpetuo|7Santos|8ilva|7Tavares|3bault Gouti|2omas Almeida|7Campbell|7Denny|8iagne|7Gifford|7Longacre|7Paull|8etersen|7Ramirez|1i Haitao|2ago dos Santos e Silva|2ffany Masters|2ki Ghosn|2m Boetsch|4Caron|6talfo|5redeur|4Elliott|4Gorman|4Hague|4Kennedy|4Lajcik|4McKenzie|5eans|4Roman|4Stout|5ylvia|4Williams|3my Cuamba|3o Feucht|4thy Johnson|3ur Valiev|2na Lahdemaki|2to Jones|5Ortiz|1obias Harila|3y Misech|2dd Brown|6utler|5Duffee|5Gouwenberg|5Lally|5Medina|6oore|2fiq Musayev|2ki Matsui|4mitsu Ishizawa|4taka Nakanishi|2m Aspinall|4Blackledge|5reese|4DeBlass|5uquesnoy|4Egan|4Gallicchio|4Lawlor|4Niinimaki|5olan|4Sauer|4Tuggle|4Watson|3asz Drwal|3my Cuozzi Jr.|6Gantt|6Hayden|6Lee|6McMillen|6Petersen|6Speer|3ohiko Hashimoto|4mi Iwama|4ya Miyashita|2ny Bonello|5DeSouza|5Ferguson|6ryklund|5Gravely|5Johnson|6uarez|5Kelley|5Petarra|5Sims|6ylvester|4a Evinger|2p Noi Kiwram|2r Troeng|3rance Taylor|4ez Finney|2shiomi Kazama|2wnsend Saunders|1ra Telligman|3cy Cortez|3vis Browne|7Calanoc|7Fulton|7Galbraith|7Johnson|7Lutter|7Wiuff|2e'ston Vines|3nell Young|4t Jenkins|6Miller|3sean Gore|4ton Thomison|3vin Giles|7Jones|4or Harris|7Peek|8rangley|7Smith|3y Houston|5Ogden|5Waters|2istan Arenal|8Connelly|2oy Mandaloniz|1suyoshi Kohsaka|aurihara|9Tamakairiki|1ucker Lutz|3o Tokkos|2lio Palhares|2rrell Galloway|1y Flores|3Miller|2ler Diamond|6Hill|6Stinson|6Toner|2ra Parker|3ell Fortune|3on Woodley|5e Roberts|2son Griffin|6Nam|6Pedro|0Ulysses Gomez|1mar Nurmagomedov|1ran Satybaldiev|2iah Hall|3jah Faber|2os Medic|0Vadym Kutsyi|2gner Rocha|2l Woodburn|3entijn Overeem|7na Shevchenko|4ri Ignatov|6e Letourneau|4sca Machado|3mir Lazaro|3ter Walker|2nessa Demopoulos|8Melo|3ilto Antunes|2ughan Lee|1ernon Ramos Ho|7White|3onica Hardy|2ta Arteaga|1iacheslav Borshchev|2cente Luque|3tor Altamirano|7Dias|7Henry|8ugo|7Jones|7Madrigal|9rtinez|7Reyna|8odriguez|7Valenzuela|aimaki|6ia Leonardo|2k Grujic|3tor Pesta|6iia Dudakova|2nc Pichel|4e Cachero|6Morales|7urdock|5nt Eazelle|3icius Cenci|9Magalhaes|aoreira|9Oliveira|9Queiroz|9Salvador|3ny Magalhaes|2rgil Zwicker|3na Jandiroba|2scardi Andrade|2taly Minakov|3or Belfort|6Costa|6Miranda|6Petrino|6Ribeiro|6Vianna|2viane Araujo|8Pereira|1ladimir Matyushenko|3sto Cepo|1olkan Oezdemir|0Waachiim Spiritwolf|2de Shipp|2gner Campos|7Prado|7Silva|7da Conceicao Martins|4ney Fabiano|2ldo Cortes Acosta|3el Watson|3len Del Rosario|4id Ismail|3t Harris|4er Smith-Cotito|2nderlei Silva|3g Cong|5Guan|2r Machine|3lley Alves|2taru Sakata|7Yamauchi|2ylon Kennell|7Lowe|3ne Cole|6Phillips|1ellington Turman|2ndell Oliveira Marques|2s Albritton|4Combs|4Schultz|5hivers|5ims|3ley Correira|7Little|3tin Wilson|1ill Brooks|5Campuzano|6hope|6urrie|5Kerr|5Ribeiro|5Santiago|4amy Freire|4iam Gomis|8Knight|8Macario|6n Colorado|5e Gates|7Parks|8eeters|3son Gouveia|7Reis|2ndri Patilima|1on Jin Eoh|4Sik Park|3Bin Ki|1u Yanan|2lijiburen|2ziazibieke Jiahefu|0Xavier Foupa-Pokam|8ranklin|7Siller|1iao Long|2e Bin|2ong Jingnan|1ue Do Won|0Yadier del Valle|2ir Rodriguez|2mato Nishikawa|2n Cabral|4Pellerin|4Qihui|4Xiaonan|3a Santos|4l Ashmouz|3cy Medeiros|3is Ghemmouri|2o Zhikui|3tzin Meza|2roslav Amosov|2suhiro Urushitani|6to Namekawa|2zan Hajeh|3min Jauregui|1eDam Seo|1iSak Lee|2bugele|2n Shuai|2zha|1oel Romero|2han Banks|6Lainesse|2islandy Izquierdo|2ji Anjo|2ko Takahashi|3thai Sithoar|2rgan De Castro|2sdenis Cedeno|3hiaki Yatsu|5hiro Akiyama|aNakao|aTakayama|7sa Yamamoto|5ki Takahashi|5nori Horie|5ro Maeda|5yuki Yoshida|3uke Nishijima|2umin Shin|3ng Hwang|6Sam Jung|5Jae Song|3sri Belgaroui|4sef Zalal|1udi Cahyadi|2ele Huang|2hi Sano|2i Chul Nam|3to Yanagawa|2ji Ephoevi-Ga|5Hisamatsu|5Nagata|2ki Ishikawa|5Kondo|5Sasaki|4o Sakaguchi|4ya Naito|2ma Horiuchi|2nSeong Jang|3eisy Duben|3osuke Minami|2ra Naito|3i Panferov|5Vaulin|6illefort|4j Kiseliov|2saku Kinoshita|7Nakamura|3hin Okami|3uke Imamura|7Kasuya|9waguchi|4p Saadulaev|2ta Sasaki|2ya Shirai|1ves Edwards|5Jabouin|0Zabit Magomedsharipov|2c Pauga|3h Light|5Makovsky|5Reese|6osol|5Skinner|5Underwood|5Zane|4ary Borrego|8Micklewright|8Scroggin|2k Bucia|4Cummings|4Ottow|2ne Frazier|2rah Fairn|1elg Galesic|3im Imadaev|1halgas Zhumagulov|3ng Lipeng|6Mingyang|6Qinghe|6Tiequan|6Weili|6Zhenyang|2ou Kun|2u Kangjie|1oila Frausto|1ubaira Tukhugov|1viad Lazishvili|1ygimantas Ramaska","sep":"|"},{"d":"155 lbs.|265 lbs.|115 lbs.|185 lbs.|170 lbs.|235 lbs.|145 lbs.|205 lbs.|NA|180 lbs.|225 lbs.|125 lbs.|135 lbs.|245 lbs.|264 lbs.|250 lbs.|199 lbs.|154 lbs.|190 lbs.|230 lbs.|240 lbs.|160 lbs.|200 lbs.|251 lbs.|255 lbs.|247 lbs.|260 lbs.|161 lbs.|210 lbs.|261 lbs.|243 lbs.|239 lbs.|215 lbs.|113 lbs.|259 lbs.|345 lbs.|183 lbs.|275 lbs.|236 lbs.|244 lbs.|178 lbs.|220 lbs.|139 lbs.|263 lbs.|238 lbs.|175 lbs.|246 lbs.|254 lbs.|253 lbs.|130 lbs.|280 lbs.|350 lbs.|168 lbs.|249 lbs.|242 lbs.|216 lbs.|241 lbs.|150 lbs.|181 lbs.|290 lbs.|258 lbs.|233 lbs.|300 lbs.|270 lbs.|257 lbs.|295 lbs.|196 lbs.|248 lbs.|234 lbs.|385 lbs.|195 lbs.|400 lbs.|227 lbs.|310 lbs.|143 lbs.|262 lbs.|165 lbs.|105 lbs.|226 lbs.|335 lbs.|149 lbs.|228 lbs.|194 lbs.|167 lbs.|217 lbs.|237 lbs.|219 lbs.|212 lbs.|770 lbs.|231 lbs.|330 lbs.|186 lbs.|214 lbs.|315 lbs.|192 lbs.|286 lbs.|232 lbs.|229 lbs.|266 lbs.|198 lbs.|221 lbs.|256 lbs.|285 lbs.|224 lbs.|207 lbs.|323 lbs.|252 lbs.|320 lbs.|430 lbs.|410 lbs.|193 lbs.|390 lbs.|188 lbs.|197 lbs.","i":"0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,10,11,12,13,14,15,16,17,18,19,8,1a,1b,1c,1d,1e,1f,1g,1h,c,1i,1j,1k,1l,1m,1n,1o,1p,1q,1r,1s,1t,1u,7,1v,1w,1x,1y,1z,7,20,21,22,23,24,25,l,b,0,c,3,4,6,3,6,c,6,7,c,3,0,6,c,6,0,7,4,b,b,4,0,3,6,c,7,3,0,7,0,0,7,4,3,4,4,3,7,0,w,b,c,4,4,3,4,0,0,4,7,0,0,8,4,f,3,0,6,4,6,6,c,4,c,0,8,6,b,6,0,c,c,0,2,0,0,4,8,6,0,1y,c,16,0,7,3,3,0,c,4,6,0,c,3,4,3,c,6,4,4,18,0,4,6,3,b,6,6,c,6,7,7,o,2,c,4,k,3,b,3,3,6,2,0,0,0,6,4,6,0,6,1b,26,0,4,3,4,7,b,0,0,3,4,c,7,6,0,6,b,6,7,0,6,0,7,7,0,3,f,4,6,f,0,23,4,7,6,b,2,c,c,6,c,c,b,3,b,2,c,7,1,6,c,7,b,0,0,d,1,0,7,b,7,0,b,1,0,c,2,2,c,2,10,3,2,4,b,f,7,4,4,b,6,3,c,3,6,4,6,1g,7,b,3,1i,0,3,z,4,c,7,0,b,4,4,3,4,k,1,3,4,0,w,3,l,3,3,c,3,4,3,3,3,6,h,4,0,4,2,b,4,a,c,2,2,7,4,6,6,2,4,0,v,3,8,6,c,0,b,b,c,q,3,3,7,4,c,3,6,0,7,0,4,0,7,7,6,4,7,0,7,4,d,b,3,c,3,3,6,3,c,3,0,7,6,k,7,e,3,7,7,6,3,4,c,2,b,b,7,2,d,6,b,0,c,3,6,6,3,3,6,7,7,0,h,a,0,c,b,c,2,c,6,b,7,c,1k,b,3,16,c,4,1,8,7,6,6,0,6,6,0,4,0,3,b,7,1w,b,0,0,6,4,1,3,6,6,b,6,4,7,1,7,4,c,j,c,b,c,4,4,4,4,0,3,3,3,b,3,1,4,1,0,c,6,0,c,4,3,0,4,b,0,4,c,3,c,c,16,6,0,3,m,c,7,0,b,4,b,6,4,0,f,c,6,4,3,4,4,5,3,2,4,m,1f,k,0,1d,4,d,o,8,6,4,0,7,0,4,6,7,7,4,0,7,c,4,4,1,c,15,6,7,c,0,c,4,3,10,c,c,6,5,d,o,c,6,3,0,3,7,3,0,c,0,4,0,3,b,b,b,4,1,7,0,4,j,c,4,w,1s,3,6,4,d,3,6,7,4,0,4,a,4,c,1,6,c,4,0,6,4,4,4,0,3,j,c,0,0,4,0,3,4,3,7,3,2,4,4,4,1,4,b,0,c,b,2,3,3,h,c,7,7,3,3,6,3,3,3,c,1,7,0,1,6,4,c,4,h,3,6,3,3,3,c,3,4,b,0,8,b,4,0,k,3,3,f,3,j,3,4,4,6,3,6,0,0,c,7,c,c,0,6,0,c,c,0,m,o,8,2,b,4,0,j,6,b,4,4,d,b,c,4,b,4,4,7,c,7,b,4,a,4,7,2,0,1,3,c,b,6,3,6,4,4,3,0,8,3,3,c,7,o,c,7,3,j,4,4,6,4,c,3,3,4,7,7,6,2,6,4,e,c,6,c,b,0,3,b,c,3,8,0,4,6,0,0,0,0,c,4,0,6,c,0,1,0,f,3,0,4,4,k,4,c,b,6,2,c,u,3,b,4,3,6,8,b,7,8,4,4,3,b,4,8,27,4,6,4,7,3,6,0,3,6,0,k,c,7,7,0,3,4,c,4,0,4,8,28,b,3,3,4,c,6,3,0,3,3,0,0,4,0,1o,0,3,4,8,3,f,4,1,7,3,0,q,c,6,4,1w,4,b,m,4,4,0,7,7,4,c,c,p,4,2,c,3,0,3,4,3,6,r,0,4,3,b,4,0,3,0,c,7,4,3,0,0,c,7,b,d,8,c,c,c,6,0,0,7,c,4,c,c,6,6,c,4,0,u,c,6,6,3,3,3,0,6,0,0,3,7,0,b,c,3,b,3,7,2,1z,c,7,c,4,c,4,3,7,0,4,7,4,0,c,6,0,2,i,6,3,0,1,4,3,2,7,0,7,c,4,9,c,6,4,0,m,4,16,h,l,0,0,0,3,0,c,3,c,0,24,4,0,0,3,0,6,0,c,4,29,1,4,f,4,3,0,6,0,8,3,1j,0,2,f,4,0,b,5,4,1,a,7,3,b,c,3,p,3,6,5,4,4,6,3,3,d,7,6,6,6,6,0,2,4,3,0,7,q,b,0,3,0,6,4,0,6,b,4,0,4,c,6,3,6,1,c,4,7,0,2a,0,b,6,7,3,b,6,15,c,0,3,7,6,f,8,0,4,7,c,1i,0,7,4,3,0,4,4,4,c,c,0,1,3,0,6,0,6,3,m,0,b,0,0,7,m,4,0,0,11,3,4,c,6,0,4,6,0,4,0,3,0,6,4,c,b,3,4,0,3,c,6,c,3,6,b,3,4,0,3,1j,d,3,2,0,7,6,6,0,4,7,6,b,1,7,0,q,3,0,3,0,3,0,4,q,7,4,2b,0,c,7,k,8,0,4,0,7,4,b,6,0,3,6,6,6,4,0,m,c,4,7,0,4,6,7,5,b,7,3,3,2c,1c,2d,k,0,0,c,i,0,4,c,7,3,4,4,2e,0,6,q,0,6,c,3,2,4,0,3,b,6,3,4,c,3,3,6,4,6,a,0,8,7,4,6,0,c,8,3,0,0,3,6,3,4,6,3,4,7,13,c,b,6,b,c,0,3,4,2f,3,c,3,3,6,0,a,0,g,7,0,0,3,3,0,j,c,6,4,3,6,b,4,4,6,1v,3,7,0,0,15,4,7,b,c,b,c,6,17,4,c,0,3,3,c,0,i,m,4,6,6,5,9,3,c,b,0,3,3,4,c,7,2,18,c,c,4,0,3,7,7,4,6,7,6,b,2,8,2,b,6,2g,6,6,4,3,s,6,c,6,0,0,0,3,8,8,3,4,3,3,7,b,8,3,0,6,4,0,4,6,4,7,2,4,4,c,6,b,b,6,b,6,g,b,3,3,0,b,6,c,3,l,w,0,0,6,3,4,7,q,1i,c,0,1s,3,7,7,7,0,3,7,2,0,6,2h,3,0,c,4,2,c,16,j,8,2,6,c,b,6,7,c,0,8,4,0,b,4,8,8,c,2,4,6,4,6,c,c,6,10,3,7,4,8,7,7,7,0,f,a,b,7,4,c,0,4,q,0,8,c,8,4,3,e,3,b,4,c,0,c,9,7,5,6,b,0,0,0,1h,4,0,4,c,3,4,6,d,6,c,b,6,4,7,c,4,1,7,0,3,c,0,c,d,1h,c,7,22,3,4,6,6,0,6,b,3,0,0,8,4,7,7,0,6,c,c,0,3,4,3,3,6,3,3,0,c,c,e,8,0,m,p,4,j,c,3,6,6,4,4,0,6,0,3,3,a,i,2,6,b,c,0,0,0,6,2,7,6,6,7,1,8,7,0,0,1,0,s,k,6,4,15,1,0,0,3,c,6,c,c,0,1,1,3,7,4,0,b,c,7,m,6,0,c,8,6,1,6,15,4,2,2,f,7,k,0,6,7,11,0,3,6,b,1g,4,8,f,2,c,4,3,7,b,4,8,3,k,3,7,c,c,6,0,1r,3,6,7,w,4,0,4,w,4,a,c,1g,2,c,m,4,7,7,16,3,c,1g,0,c,7,2i,6,7,s,3,2,0,k,8,c,c,6,6,c,6,3,c,6,c,4,b,0,c,a,3,6,4,b,3,3,2,7,f,6,5,0,2j,0,4,5,4,4,7,b,7,g,3,7,3,1m,3,0,3,b,b,j,4,8,b,4,3,7,7,6,5,c,c,c,6,6,0,b,0,6,7,2,4,4,7,0,3,3,3,0,0,0,6,c,2,c,c,7,7,0,c,6,3,7,7,3,b,7,2,8,0,b,4,0,c,4,6,1d,3,0,c,4,4,b,4,6,3,o,8,7,8,6,8,3,6,3,7,0,b,0,4,0,c,0,4,0,b,0,a,b,7,b,7,6,1i,j,4,c,4,0,4,7,3,4,7,c,0,7,7,6,6,7,c,7,14,4,c,3,4,7,4,7,0,j,4,u,0,3,4,1,15,0,7,0,4,7,c,b,2,3,2,0,3,c,0,3,7,c,2,c,3,2,3,0,4,0,3,c,4,1,1,1,6,b,3,b,0,8,7,3,3,i,0,j,a,4,j,j,0,2k,0,r,4,6,3,3,6,9,3,0,c,d,0,7,s,4,3,4,4,6,c,c,6,6,1,6,0,4,c,3,3,c,6,4,6,0,0,c,c,f,4,b,p,7,7,4,c,b,6,b,b,b,b,6,6,b,7,k,c,3,q,3,4,4,8,7,3,3,4,6,7,7,6,0,3,0,c,l,8,b,m,1,b,1y,c,4,g,0,4,c,3,c,4,3,a,3,4,4,4,6,7,0,4,c,4,2,2,b,2,2,c,0,b,0,b,3,b,6,6,0,w,4,7,3,c,2l,7,4,b,1,3,6,6,0,7,c,0,2,b,0,7,7,1l,6,2,b,b,0,0,0,7,4,0,4,c,2,2,4,0,0,7,q,3,0,0,0,0,8,0,0,0,0,4,4,1y,c,s,6,0,3,4,3,3,g,0,12,c,6,c,3,0,c,6,4,7,4,8,3,6,0,0,4,m,3,4,4,c,0,7,5,c,0,4,0,b,8,11,c,6,8,7,8,6,0,0,0,4,c,4,4,3,4,0,c,g,0,0,1,b,7,3,0,0,i,7,4,3,6,c,c,c,0,4,c,c,4,s,4,7,3,3,b,4,3,k,4,q,0,6,4,6,0,3,4,c,4,4,1g,6,4,0,b,f,7,4,16,k,16,0,0,4,6,6,4,b,0,6,7,6,4,6,3,6,0,3,7,7,0,7,4,4,7,3,4,3,4,0,7,c,c,n,3,k,3,6,6,b,4,b,1,b,6,8,c,0,4,b,2,c,b,3,3,b,b,c,f,3,4,6,1,6,6,b,3,6,4,5,5,3,8,4,6,3,3,4,b,1,6,4,4,3,b,c,0,5,0,7,l,0,4,0,4,b,c,c,4,c,c,c,y,1,8,b,3,c,o,6,0,i,b,b,7,c,6,2,6,3,1q,2,b,c,c,3,2,b,6,6,4,7,7,c,3,6,b,0,6,4,18,7,c,b,b,6,4,0,4,7,4,0,5,1,0,6,6,4,4,7,0,6,3,6,7,3,3,a,7,4,8,c,0,b,6,3,e,0,e,1,b,4,3,0,6,c,6,b,b,4,3,2,3,c,b,6,0,6,0,2,3,b,2,7,0,3,0,2,0,b,b,3,7,7,5,8,3,4,c,2,2,c,c,2,b,h,7,6,1g,1g,0,c,2,c,0,3,7,16,19,0,0,0,15,h,10,3,5,16,5,6,3,16,6,4,7,3,m,3,3,3,4,0,c,c,c,3,4,0,r,7,c,3,24,15,4,6,c,b,12,0,7,3,2m,6,0,4,b,3,1,c,m,2,c,0,b,4,3,7,c,4,5,b,7,4,g,d,4,4,4,c,7,6,11,0,q,6,0,7,3,3,c,7,0,3,4,b,6,4,0,4,c,6,c,5,c,0,2,j,b,4,4,3,c,b,c,0,6,1f,4,0,j,4,h,6,6,4,c,8,7,15,6,3,7,h,1g,0,3,0,6,c,c,c,0,6,3,0,3,c,6,4,7,4,8,0,u,4,0,6,4,a,0,c,b,10,3,b,c,c,b,4,3,0,6,0,0,3,b,c,k,7,3,b,b,k,4,c,6,6,c,0,7,0,0,2n,3,0,c,4,0,0,7,3,4,4,6,4,3,0,c,0,3,6,6,2,c,4,6,8,4,7,4,4,c,3,7,b,b,b,c,c,7,7,2,b,6,c,2,b,k,3,3,3,4,3,0,8,2,b,2,4,1,6,e,4,b,4,c,c,c,3,6,b,4,c,c,2,c,7,6,6,0,0,1,3,4,3,6,b,0,7,b,b,3,b,0,4,0,3,6,b,u,0,6,0,4,6,4,h,3,4,h,4,0,3,0,4,7,0,8,4,6,3,c,4,3,3,6,0,4,3,c,0,2,0,7,6,2,c,c,6,0,c,3,7,b,7,0,3,7,0,3,7,0,2,2,c,c,3,0,6,0,3,3,7,6,15,b,c,0,2,c,0,c,b,b,6,c,b,0,6,b,0,3,6,0,4,0,c,0,b,3,0,0,3,7,4,4,3,4,6,0,0,7,1h,0,3,6,2o,0,b,0,s,3,6,7,c,0,1c,b,6,0,w,c,o,4,0,1,c,0,c,1i,1,2,b,2,b,2,2,c,3,3,2p,1,1,4,6,3,7,c,0,4,3,b,0,6,0,b,7,c,6,6,k,i,0,6,7,1,2q,0,3,1,4,m,6,c,c,3,4,3,6,c,4,c,2,0,6,1,6,6,4,4,0,3,c,3,6,b,15,3,8,16,c,10,3,0,6,4,0,2r,6,3,6,b,0,0,0,b,7,4,4,6,4,4,4,15,0,6,7,0,c,b,3,4,13,0,3,7,1,8,b,0,0,b,4,4,1,7,0,0,c,4,4,3,c,c,6,2s,4,7,0,2t,4,0,0,0,0,7,6,c,b,c,6,x,0,h,b,c,b,2,c,6,6,a,0,3,2,c,0,6,6,3,0,0,0,4,4,q,4,c,0,15,3,8,4,0,0,c,4,4,4,7,6,0,j,3,4,q,3,4,0,6,c,2,6,c,7,1,0,4,2,c,4,7,8,c,7,0,3,0,0,6,6,0,5,7,0,3,c,6,7,6,4,j,4,0,3,7,6,4,3,8,3,7,4,4,2u,4,4,0,c,0,7,o,6,3,4,4,q,7,6,7,6,7,4,0,7,7,2,c,15,c,2,6,o,c,14,1y,2,b,j,6,7,0,c,0,b,3,d,h,2,0,c,7,4,6,v,7,2,b,c,c,2,6,j,1g,c,4,6,b,j,b,6,7,0,c,3,10,3,7,6,4,2v,4,6,6,b,4,25,0,c,b,j,b,0,o,0,0,0,7,3,b,0,4,3,6,3,b,3,0,4,3,j,b,4,c,z,6,7,b,0,0,3,3,1,4,b,1i,4,c,c,4,4,0,c,4,4,3,c,4,0,0,b,0,0,0,3,3,8,0,4,4,c,7,3,b,6,3,7,7,i,4,c,4,b,7,4,2,6,3,7,3,6,0,4,4,8,0,4,c,b,3,6,c,15,6,8,c,b,c,4,c,c,0,3,0,b,8,4,b,4,s,b,1i,4,0,6,6,3,0,3,m,4,4,c,1q,j,3,6,b,0,7,7,3,6,6,0,b,3,0,2,c,3,1,4,0,5,0,6,0,4,4,6,6,c,2,6,4,7,3,4,a,4,3,c,0,0,7,4,d,c,7,0,4,0,4,3,g,0,6,0,c,0,3,0,1q,b,2,1x,7,3,b,7,8,4,0,j,4,c,2,c,c,c,d,1k,8,c,0,4,6,c,4,4,5,6,c,6,4,c,4,c,0,7,b,3,4,4,f,0,7,7,7,3,6,2,b,c,0,b,2,6,4,c,2,7,2,4,b,c,0,7,0,0,7,l,c,b,6,0,0,d,3,7,7,a,6,4,c,0,7,3,7,c,1l,c,7,0,4,4,b,g,6,s,7,10,b,4,4,b,7,4,c,6,4,6,c,0,c,2,3,4,c,7,c,c,1y,c,t,c,c,c,7,7,0,0,b,3,c,1d,c,2,c,4,c,3,k,1a,7,4,8,2,3,7,7,6,c,c,b,3,q,c,c,0,6,0,7,4,4,0,3,c,7,1,c,0,0,0,7,7,4,3,4,7,7,4,6,1r,18,6,7,1,4,4,0,3,0,7,q,1,4,3,4,c,0,b,0,2w,4,3,b,b,c,4,6,4,6,4,c,c,6,4,c,4,3,b,c,4,c,b,k,4,1,0,c,3,7,0,0,3,3,4,6,1,0,3,0,7,d,3,6,6,b,3,6,7,6,6,20,6,6,w,7,7,c,6,3,0,10,7,0,1a,3,4,6,0,0,4,3,7,0,3,4,b,7,c,7,0,0,6,c,b,1i,0,7,3,3,4,c,j,4,7,m,b,3,1,4,1e,i,b,b,4,b,b,c,0,c,3,6,a,0,0,b,f,4,4,3,2,b,c,c,c,h,0,4,4,4,b,7,7,17,b,19,c,p,1,15,3,4,1y,b,c,1,1i,c,6,0,7,c,b,0,6,3,m,6,8,0,3,3,7,4,4,4,3,c,4,4,3,5,6,0,7,4,4,0,4,7,c,b,c,10,9,10,0,4,b,8,4,4,c,c,c,0,4,0,4,a,3,8,7,7,2,8,4,4,6,3,0,0,4,4,0,0,0,m,2,1,4,6,0,c,4,b,3,c,c,6,b,c,c,2,4,h,7,k,c,4,3,d,4,w,c,2x,5,3,3,0,c,1,7,0,8,s,4,6,3,3,5,0,4,1,b,4,4,3,1,7,1r,c,4,3,b,2y,0,6,4,3,6,6,6,3,1g,1,2,4,0,d,1s,s,4,c,q,0,4,b,c,4,c,3,7,b,6,1,0,0,7,1,b,6,6,0,1,6,b,0,7,0,6,f,2,b,b,b,0,i,b,3,b,2,4,c,q,1,6,c,c,4,o,0,5,0,0,6,2,4,6,c,4,h,0,4,c,16,4,3,3,c,c,1n,4,4,b,2,c,4,7,w,c,4,5,2,1,0,b,2z,7,3,4,4,c,b,c,0,3,6,7,3,w,4,1,7,c,2,2,c,6,6,6,3,4,0,4,7,4,4,3,b,6,4,w,j,4,0,0,4,3,3,k,b,3,3,19,4,b,6,6,6,4,0,b,k,8,c,c,4,6,b,b,6,2,6,7,c,0,0,6,0,4,2,21,0,1t,3,b,j,e,3,3,b,c,4,16,m,0,4,a,b,c,1n,4,b,6,16,c,2,c,6,1o,3,c,6,7,4,b,2,b,6,7,6,7,0,0,3,c,c,4,0,1,2,11,3,0,30,b,0,b,3,c,c,0,3,c,0,0,s,3,6,4,3,6,4,4,0,4,7,7,6,0,6,8,4,h,0,6,0,f,31,c,6,2,4,3,3,5,3,b,c,q,3,a,3,4,4,3,1,3,c,7,1,c,2,6,7,8,6,7,m,q,7,6,32,4,0,b,3,c,o,7,3,3,c,4,4,7,6,0,17,f,3,7,6,0,6,6,6,0,4,f,0,16,3,4,4,3,c,1,0,c,1u,0,a,c,b,3,0,3,c,4,1p,b,o,6,k,4,7,3,7,3,6,3,3,3,6,4,c,6,6,3,3,3,0,4,0,6,4,a,3,15,6,7,9,6,7,4,6,4,4,6,2,y,4,3,6,b,7,b,c,7,3,c,4,4,0,4,j,b,4,2,2,0,13,b,c,4,b,4,7,b,b,0,3,b,b,c,c,6,c,0,4,b,4,7,b,4,k,2,0,6,c,6,0,0,6,7,6,15,c,7,7,2,4,1h,3,3,3,a,h,7,b,2,7,3,7,4,d,6,7,4,33,6,q,c,b,7,f,c,7,b,6,4,3,1y,b,3,6,7,3,4,4,34,7,3,8,q,q,7,6,0,b,6,3,0,c,3,0,6,7,4,c,b,3,15,3,b,0,l,h,0,c,c,6,3,c,b,c,6,2,24,6,6,0,0,7,b,2,c,0,0,c,b,6,4,b,7,6,2,2,3,6,b,6,3,8,4,0,7,1l,22,f,0,24,4,15,1e,15,g,6,16,4,7,c,c,16,6,3,6,6,6,u,6,6,0,3,a,7,10,3,3,7,b,4,b,c,3,3,35,4,3,4,6,4,15,0,o,c,b,1g,0,c,6,7,4,b,3,u,6,3,6,3,0,4,4,7,4,f,c,3,4,b,0,7,c,0,2,0,b,6,c,0,c,6","sep":"|"}]}]);
const COLONY = [
{"id":"n-71926920","guard":[["hasAny",["element","item number","lbs","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-a894e792","guard":[],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-247c48b9","guard":[],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-3c70f46d","guard":[["hasAny",["element","invert case","item number","lbs","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-79e1ec4b","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","lbs","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-853f3fa5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","lbs","nth","position","title case"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-865c10cb","guard":[],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-8dc5112f","guard":[["hasAny",["element","item number","lbs","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-93eaf4c7","guard":[],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-c3490867","guard":[],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-6e3ffb34","guard":[["hasAny",["element","item number","lbs","nth","position"]]],"pyramid":["render.template",{"lit":["The name whose weight is ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-777d2472","guard":[],"pyramid":["render.template",{"lit":["The name whose weight is ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-42b3f564","guard":[["has","lbs"]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"149":"The name whose weight is 149 lbs. is Chris Jones.","167":"The name whose weight is 167 lbs. is Deshaun Johnson.","186":"The name whose weight is 186 lbs. is Idris Wasi.","188":"The name whose weight is 188 lbs. is Wes Albritton.","192":"The name whose weight is 192 lbs. is Kenny Ento.","193":"The name whose weight is 193 lbs. is Todd Medina.","194":"The name whose weight is 194 lbs. is Darrel Gholar.","197":"The name whose weight is 197 lbs. is Yuri Vaulin.","198":"The name whose weight is 198 lbs. is Masutatsu Yano.","207":"The name whose weight is 207 lbs. is Rick Roufus.","212":"The name whose weight is 212 lbs. is Dwayne Cason.","214":"The name whose weight is 214 lbs. is Jason Guida.","219":"The name whose weight is 219 lbs. is Don Frye.","221":"The name whose weight is 221 lbs. is Maurice Smith.","226":"The name whose weight is 226 lbs. is Alex Hunter.","228":"The name whose weight is 228 lbs. is Dan Charles.","231":"The name whose weight is 231 lbs. is Fabricio Werdum.","232":"The name whose weight is 232 lbs. is Marcio Cruz.","252":"The name whose weight is 252 lbs. is Sean Sharaf.","266":"The name whose weight is 266 lbs. is Mark Kerr.","286":"The name whose weight is 286 lbs. is Lee Kwan Bum.","315":"The name whose weight is 315 lbs. is Jimmy Ambriz.","323":"The name whose weight is 323 lbs. is Scott Ferrozzo.","330":"The name whose weight is 330 lbs. is Hong Man Choi.","335":"The name whose weight is 335 lbs. is Chris Condo.","390":"The name whose weight is 390 lbs. is Wagner da Conceicao Martins.","410":"The name whose weight is 410 lbs. is Thomas Ramirez.","430":"The name whose weight is 430 lbs. is Teila Tuli.","770":"The name whose weight is 770 lbs. is Emmanuel Yarborough."}}},
{"id":"n-43584cff","guard":[["has","lbs"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 149 lbs.":"The name whose weight is 149 lbs. is Chris Jones.","231 lbs. is the weight of which name":"The name whose weight is 231 lbs. is Fabricio Werdum.","which name has the weight 390 lbs.":"The name whose weight is 390 lbs. is Wagner da Conceicao Martins.","252 lbs. is the weight of which name":"The name whose weight is 252 lbs. is Sean Sharaf.","name the name whose weight is 266 lbs.":"The name whose weight is 266 lbs. is Mark Kerr.","name the name whose weight is 430 lbs.":"The name whose weight is 430 lbs. is Teila Tuli.","name the name whose weight is 228 lbs.":"The name whose weight is 228 lbs. is Dan Charles.","name the name whose weight is 188 lbs.":"The name whose weight is 188 lbs. is Wes Albritton.","name the name whose weight is 286 lbs.":"The name whose weight is 286 lbs. is Lee Kwan Bum.","410 lbs. is the weight of which name":"The name whose weight is 410 lbs. is Thomas Ramirez.","770 lbs. is the weight of which name":"The name whose weight is 770 lbs. is Emmanuel Yarborough.","194 lbs. is the weight of which name":"The name whose weight is 194 lbs. is Darrel Gholar.","name the name whose weight is 335 lbs.":"The name whose weight is 335 lbs. is Chris Condo.","which name has the weight 330 lbs.":"The name whose weight is 330 lbs. is Hong Man Choi.","which name has the weight 232 lbs.":"The name whose weight is 232 lbs. is Marcio Cruz.","which name has the weight 226 lbs.":"The name whose weight is 226 lbs. is Alex Hunter.","name the name whose weight is 198 lbs.":"The name whose weight is 198 lbs. is Masutatsu Yano.","name the name whose weight is 186 lbs.":"The name whose weight is 186 lbs. is Idris Wasi.","which name has the weight 219 lbs.":"The name whose weight is 219 lbs. is Don Frye.","name the name whose weight is 214 lbs.":"The name whose weight is 214 lbs. is Jason Guida.","193 lbs. is the weight of which name":"The name whose weight is 193 lbs. is Todd Medina.","which name has the weight 212 lbs.":"The name whose weight is 212 lbs. is Dwayne Cason.","315 lbs. is the weight of which name":"The name whose weight is 315 lbs. is Jimmy Ambriz.","name the name whose weight is 192 lbs.":"The name whose weight is 192 lbs. is Kenny Ento.","which name has the weight 197 lbs.":"The name whose weight is 197 lbs. is Yuri Vaulin.","221 lbs. is the weight of which name":"The name whose weight is 221 lbs. is Maurice Smith.","which name has the weight 323 lbs.":"The name whose weight is 323 lbs. is Scott Ferrozzo.","207 lbs. is the weight of which name":"The name whose weight is 207 lbs. is Rick Roufus.","which name has the weight 167 lbs.":"The name whose weight is 167 lbs. is Deshaun Johnson."}}},
{"id":"n-fb5395bd","guard":[["has","lbs"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"lbs"}]]],"mem":{"table":{"193":"The name whose weight is 193 lbs. is Todd Medina.","194":"The name whose weight is 194 lbs. is Darrel Gholar.","207":"The name whose weight is 207 lbs. is Rick Roufus.","221":"The name whose weight is 221 lbs. is Maurice Smith.","231":"The name whose weight is 231 lbs. is Fabricio Werdum.","252":"The name whose weight is 252 lbs. is Sean Sharaf.","315":"The name whose weight is 315 lbs. is Jimmy Ambriz.","410":"The name whose weight is 410 lbs. is Thomas Ramirez.","770":"The name whose weight is 770 lbs. is Emmanuel Yarborough.","which name has the weight 149":"The name whose weight is 149 lbs. is Chris Jones.","which name has the weight 390":"The name whose weight is 390 lbs. is Wagner da Conceicao Martins.","name the name whose weight is 266":"The name whose weight is 266 lbs. is Mark Kerr.","name the name whose weight is 430":"The name whose weight is 430 lbs. is Teila Tuli.","name the name whose weight is 228":"The name whose weight is 228 lbs. is Dan Charles.","name the name whose weight is 188":"The name whose weight is 188 lbs. is Wes Albritton.","name the name whose weight is 286":"The name whose weight is 286 lbs. is Lee Kwan Bum.","name the name whose weight is 335":"The name whose weight is 335 lbs. is Chris Condo.","which name has the weight 330":"The name whose weight is 330 lbs. is Hong Man Choi.","which name has the weight 232":"The name whose weight is 232 lbs. is Marcio Cruz.","which name has the weight 226":"The name whose weight is 226 lbs. is Alex Hunter.","name the name whose weight is 198":"The name whose weight is 198 lbs. is Masutatsu Yano.","name the name whose weight is 186":"The name whose weight is 186 lbs. is Idris Wasi.","which name has the weight 219":"The name whose weight is 219 lbs. is Don Frye.","name the name whose weight is 214":"The name whose weight is 214 lbs. is Jason Guida.","which name has the weight 212":"The name whose weight is 212 lbs. is Dwayne Cason.","name the name whose weight is 192":"The name whose weight is 192 lbs. is Kenny Ento.","which name has the weight 197":"The name whose weight is 197 lbs. is Yuri Vaulin.","which name has the weight 323":"The name whose weight is 323 lbs. is Scott Ferrozzo.","which name has the weight 167":"The name whose weight is 167 lbs. is Deshaun Johnson."}}},
{"id":"n-539d22fb","guard":[["not",["has","188"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-e82fee2a","guard":[["not",["has","188"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-ef1cfedb","guard":[["not",["has","188"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-f390d7bf","guard":[["not",["has","188"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-552786c2","guard":[["hasAny",["element","has","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.and",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-86abbb3b","guard":[["hasAny",["element","has","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-15326094","guard":[["hasAny",["all caps","capital letters","capitals","element","has","item number","nth","position","upper case","uppercase","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-1b276fac","guard":[["hasAny",["element","has","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-383f1731","guard":[["hasAny",["element","has","item number","lower case","lowercase","nth","position","small letters","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-41e36771","guard":[["hasAny",["element","first n","has","item number","nth","position","take","top","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-97ed149c","guard":[["hasAny",["element","has","invert case","item number","nth","position","swap case","toggle case","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-b6a4c21f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","has","item number","nth","position","title case","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-f64b8b30","guard":[["hasAny",["element","first n","has","item number","nth","position","take","top","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-0763409d","guard":[["hasAny",["element","has","invert case","item number","nth","position","swap case","toggle case","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-9cc0506f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","has","item number","nth","position","title case","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-e0fb8b39","guard":[["has","lbs"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"has the weight 149 lbs":"The name whose weight is 149 lbs. is Chris Jones.","has the weight 390 lbs":"The name whose weight is 390 lbs. is Wagner da Conceicao Martins.","the name whose weight is 266 lbs":"The name whose weight is 266 lbs. is Mark Kerr.","the name whose weight is 430 lbs":"The name whose weight is 430 lbs. is Teila Tuli.","the name whose weight is 228 lbs":"The name whose weight is 228 lbs. is Dan Charles.","the name whose weight is 188 lbs":"The name whose weight is 188 lbs. is Wes Albritton.","the name whose weight is 286 lbs":"The name whose weight is 286 lbs. is Lee Kwan Bum.","the name whose weight is 335 lbs":"The name whose weight is 335 lbs. is Chris Condo.","has the weight 330 lbs":"The name whose weight is 330 lbs. is Hong Man Choi.","has the weight 232 lbs":"The name whose weight is 232 lbs. is Marcio Cruz.","has the weight 226 lbs":"The name whose weight is 226 lbs. is Alex Hunter.","the name whose weight is 198 lbs":"The name whose weight is 198 lbs. is Masutatsu Yano.","the name whose weight is 186 lbs":"The name whose weight is 186 lbs. is Idris Wasi.","has the weight 219 lbs":"The name whose weight is 219 lbs. is Don Frye.","the name whose weight is 214 lbs":"The name whose weight is 214 lbs. is Jason Guida.","has the weight 212 lbs":"The name whose weight is 212 lbs. is Dwayne Cason.","the name whose weight is 192 lbs":"The name whose weight is 192 lbs. is Kenny Ento.","has the weight 197 lbs":"The name whose weight is 197 lbs. is Yuri Vaulin.","has the weight 323 lbs":"The name whose weight is 323 lbs. is Scott Ferrozzo.","has the weight 167 lbs":"The name whose weight is 167 lbs. is Deshaun Johnson."}}},
{"id":"n-2d4e817c","guard":[["hasAny",["element","has","item number","nth","position","separate by","split","split by","which"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-801b471b","guard":[["hasAny",["element","has","item number","nth","position","separate by","split","split by","which"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-d0505ec8","guard":[["hasAny",["element","has","item number","nth","position","separate by","split","split by","which"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-ff123a77","guard":[["hasAny",["delete","element","has","item number","nth","position","remove","strip out","which","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-191dfe58","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-8cb561c8","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-0cdd769a","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","position","upper camel case","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":1}]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-1a61c4c6","guard":[["hasAny",["element","invert case","item number","nth","position","swap case","toggle case","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":1}]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-40d038ab","guard":[["hasAny",["element","item number","nth","position","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-b3b58c08","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":2}]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-d3573781","guard":[["hasAny",["element","has","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-8f7a32b6","guard":[["hasAny",["element","first n","item number","nth","position","take","top","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.words"],["sense.howMany"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-9d9c6900","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-beab1f34","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-dcd4e4f7","guard":[["hasAny",["element","first n","item number","nth","position","take","top","whose"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.words"],["sense.howMany"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-868186d5","guard":[["hasAny",["element","item number","leading zeros","nth","of","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-a64ecfa6","guard":[["hasAny",["element","item number","leading zeros","nth","of","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-0124e248","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-daae5609","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.and",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-15139420","guard":[["hasAny",["element","invert case","item number","nth","of","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-1c4ded38","guard":[["hasAny",["element","item number","leading zeros","nth","of","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}]]],"mem":null},
{"id":"n-644a2552","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","of","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-68602535","guard":[["hasAny",["class name","element","item number","nth","of","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-86403c0a","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-d53188a7","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","nth","of","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-dd455014","guard":[["hasAny",["element","item number","lower case","lowercase","nth","of","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-f7174536","guard":[["hasAny",["element","invert case","item number","nth","of","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]]],"mem":null},
{"id":"n-0f5caa95","guard":[["hasAny",["delete","element","item number","nth","of","position","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.remove",["sense.lastWord"],["sense.unit"]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-344b29d0","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-95ff5387","guard":[["hasAny",["element","invert case","item number","nth","of","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-9ac283b1","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-adeda33b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","of","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-b4b67f28","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-74c1e9e3","guard":[["hasAny",["delete","element","item number","nth","of","position","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-879a5f0d","guard":[["hasAny",["element","item number","nth","of","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.split",["sense.lastWord"],["sense.unit"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-f45049c8","guard":[["hasAny",["element","item number","nth","of","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.split",["sense.lastWord"],["sense.unit"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-29a61734","guard":[["hasAny",["element","item number","nth","of","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-3f04c441","guard":[["hasAny",["element","item number","nth","of","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose weight is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"}],{"lit":1}],{"lit":"fr-tidytuesday-ufcstats-data-91a378"},{"lit":"weight"},{"lit":"name"}]],"mem":null},
{"id":"n-ded96f62","guard":[["has","lbs"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"of"}]]],"mem":{"table":{"231 lbs. is the weight":"The name whose weight is 231 lbs. is Fabricio Werdum.","252 lbs. is the weight":"The name whose weight is 252 lbs. is Sean Sharaf.","410 lbs. is the weight":"The name whose weight is 410 lbs. is Thomas Ramirez.","770 lbs. is the weight":"The name whose weight is 770 lbs. is Emmanuel Yarborough.","194 lbs. is the weight":"The name whose weight is 194 lbs. is Darrel Gholar.","193 lbs. is the weight":"The name whose weight is 193 lbs. is Todd Medina.","315 lbs. is the weight":"The name whose weight is 315 lbs. is Jimmy Ambriz.","221 lbs. is the weight":"The name whose weight is 221 lbs. is Maurice Smith.","207 lbs. is the weight":"The name whose weight is 207 lbs. is Rick Roufus."}}},
{"id":"n-0857490d","guard":[["hasAny",["has","lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 323 lbs.":"The name whose weight is 323 lbs. is Scott Ferrozzo."}}},
{"id":"n-0cbc121a","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"770 lbs. is the weight of which name":"The name whose weight is 770 lbs. is Emmanuel Yarborough."}}},
{"id":"n-112e5fca","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"194 lbs. is the weight of which name":"The name whose weight is 194 lbs. is Darrel Gholar."}}},
{"id":"n-384d5178","guard":[["hasAny",["has","lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 330 lbs.":"The name whose weight is 330 lbs. is Hong Man Choi."}}},
{"id":"n-48769b79","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose weight is 430 lbs.":"The name whose weight is 430 lbs. is Teila Tuli."}}},
{"id":"n-4b2551ad","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose weight is 188 lbs.":"The name whose weight is 188 lbs. is Wes Albritton."}}},
{"id":"n-505c5c1f","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose weight is 214 lbs.":"The name whose weight is 214 lbs. is Jason Guida."}}},
{"id":"n-54a4bf14","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"193 lbs. is the weight of which name":"The name whose weight is 193 lbs. is Todd Medina."}}},
{"id":"n-56455139","guard":[["hasAny",["has","lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 226 lbs.":"The name whose weight is 226 lbs. is Alex Hunter."}}},
{"id":"n-586e02f6","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose weight is 335 lbs.":"The name whose weight is 335 lbs. is Chris Condo."}}},
{"id":"n-630cadf6","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose weight is 186 lbs.":"The name whose weight is 186 lbs. is Idris Wasi."}}},
{"id":"n-779a3b21","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose weight is 266 lbs.":"The name whose weight is 266 lbs. is Mark Kerr."}}},
{"id":"n-7db27b39","guard":[["hasAny",["has","lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 197 lbs.":"The name whose weight is 197 lbs. is Yuri Vaulin."}}},
{"id":"n-817a6513","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"221 lbs. is the weight of which name":"The name whose weight is 221 lbs. is Maurice Smith."}}},
{"id":"n-88073d0f","guard":[["hasAny",["has","lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 232 lbs.":"The name whose weight is 232 lbs. is Marcio Cruz."}}},
{"id":"n-9459ffa0","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"252 lbs. is the weight of which name":"The name whose weight is 252 lbs. is Sean Sharaf."}}},
{"id":"n-97d1e475","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"410 lbs. is the weight of which name":"The name whose weight is 410 lbs. is Thomas Ramirez."}}},
{"id":"n-9eb6a8e1","guard":[["hasAny",["has","lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 212 lbs.":"The name whose weight is 212 lbs. is Dwayne Cason."}}},
{"id":"n-a31ffdf9","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose weight is 192 lbs.":"The name whose weight is 192 lbs. is Kenny Ento."}}},
{"id":"n-a6a5caf6","guard":[["hasAny",["has","lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 219 lbs.":"The name whose weight is 219 lbs. is Don Frye."}}},
{"id":"n-aca2e1d8","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose weight is 198 lbs.":"The name whose weight is 198 lbs. is Masutatsu Yano."}}},
{"id":"n-b6a1aa50","guard":[["hasAny",["has","lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 149 lbs.":"The name whose weight is 149 lbs. is Chris Jones."}}},
{"id":"n-b6ce5af9","guard":[["hasAny",["has","lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 390 lbs.":"The name whose weight is 390 lbs. is Wagner da Conceicao Martins."}}},
{"id":"n-bd298b21","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"207 lbs. is the weight of which name":"The name whose weight is 207 lbs. is Rick Roufus."}}},
{"id":"n-c37bfb3f","guard":[["hasAny",["has","lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the weight 167 lbs.":"The name whose weight is 167 lbs. is Deshaun Johnson."}}},
{"id":"n-d7f262d7","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose weight is 286 lbs.":"The name whose weight is 286 lbs. is Lee Kwan Bum."}}},
{"id":"n-d8971906","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose weight is 228 lbs.":"The name whose weight is 228 lbs. is Dan Charles."}}},
{"id":"n-d9f03a58","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"315 lbs. is the weight of which name":"The name whose weight is 315 lbs. is Jimmy Ambriz."}}},
{"id":"n-ef73794b","guard":[["hasAny",["lbs","name","weight"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"231 lbs. is the weight of which name":"The name whose weight is 231 lbs. is Fabricio Werdum."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which name has the weight 149 lbs.","expect":{"contains":["Chris Jones"],"notRefusal":true}},{"q":"231 lbs. is the weight of which name","expect":{"contains":["Fabricio Werdum"],"notRefusal":true}},{"q":"which name has the weight 390 lbs.","expect":{"contains":["Wagner da Conceicao Martins"],"notRefusal":true}},{"q":"252 lbs. is the weight of which name","expect":{"contains":["Sean Sharaf"],"notRefusal":true}},{"q":"name the name whose weight is 266 lbs.","expect":{"contains":["Mark Kerr"],"notRefusal":true}},{"q":"name the name whose weight is 430 lbs.","expect":{"contains":["Teila Tuli"],"notRefusal":true}},{"q":"name the name whose weight is 228 lbs.","expect":{"contains":["Dan Charles"],"notRefusal":true}},{"q":"name the name whose weight is 188 lbs.","expect":{"contains":["Wes Albritton"],"notRefusal":true}},{"q":"name the name whose weight is 286 lbs.","expect":{"contains":["Lee Kwan Bum"],"notRefusal":true}},{"q":"410 lbs. is the weight of which name","expect":{"contains":["Thomas Ramirez"],"notRefusal":true}},{"q":"770 lbs. is the weight of which name","expect":{"contains":["Emmanuel Yarborough"],"notRefusal":true}},{"q":"194 lbs. is the weight of which name","expect":{"contains":["Darrel Gholar"],"notRefusal":true}},{"q":"name the name whose weight is 335 lbs.","expect":{"contains":["Chris Condo"],"notRefusal":true}},{"q":"which name has the weight 330 lbs.","expect":{"contains":["Hong Man Choi"],"notRefusal":true}},{"q":"which name has the weight 232 lbs.","expect":{"contains":["Marcio Cruz"],"notRefusal":true}},{"q":"which name has the weight 226 lbs.","expect":{"contains":["Alex Hunter"],"notRefusal":true}},{"q":"name the name whose weight is 198 lbs.","expect":{"contains":["Masutatsu Yano"],"notRefusal":true}},{"q":"name the name whose weight is 186 lbs.","expect":{"contains":["Idris Wasi"],"notRefusal":true}},{"q":"which name has the weight 219 lbs.","expect":{"contains":["Don Frye"],"notRefusal":true}},{"q":"name the name whose weight is 214 lbs.","expect":{"contains":["Jason Guida"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
