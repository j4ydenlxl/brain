// region-name-of-country-na-6477-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"region-name-of-country-na-6477-neo-g10","class":"region-name-of-country-na-6477","generation":10,"lane":"neo","grownFrom":["what is the region name of Cabo Verde","tell me the region name of the country name Guadeloupe","give the region name for Burundi","tell me the region name of the country name Haiti","give the region name for Saint Helena","what is the region name of Timor-Leste","tell me the region name of the country name Austria","give the region name for Tonga","what is the region name of Indonesia","tell me the region name of the country name United States Virgin Islands","what is the region name of Côte d’Ivoire","what is the region name of Lesotho","tell me the region name of the country name Western Sahara","give the region name for Qatar","what is the region name of Trinidad and Tobago","give the region name for Zambia","tell me the region name of the country name Panama","tell me the region name of the country name Ecuador","tell me the region name of the country name Senegal","tell me the region name of the country name Dominica"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-country-regions-f74767","columns":["country name","region name","country iso2"],"n":248,"cols":[{"s":"Algeria|Egypt|Libya|Morocco|Sudan|Tunisia|Western Sahara|British Indian Ocean Territory|Burundi|Comoros|Djibouti|Eritrea|Ethiopia|French Southern Territories|Kenya|Madagascar|Malawi|Mauritius|Mayotte|Mozambique|Réunion|Rwanda|Seychelles|Somalia|South Sudan|Uganda|United Republic of Tanzania|Zambia|Zimbabwe|Angola|Cameroon|Central African Republic|Chad|Congo|Democratic Republic of the Congo|Equatorial Guinea|Gabon|Sao Tome and Principe|Botswana|Eswatini|Lesotho|Namibia|South Africa|Benin|Burkina Faso|Cabo Verde|Côte d’Ivoire|Gambia|Ghana|Guinea|Guinea-Bissau|Liberia|Mali|Mauritania|Niger|Nigeria|Saint Helena|Senegal|Sierra Leone|Togo|Anguilla|Antigua and Barbuda|Aruba|Bahamas|Barbados|Bonaire, Sint Eustatius and Saba|British Virgin Islands|Cayman Islands|Cuba|Curaçao|Dominica|Dominican Republic|Grenada|Guadeloupe|Haiti|Jamaica|Martinique|Montserrat|Puerto Rico|Saint Barthélemy|Saint Kitts and Nevis|Saint Lucia|Saint Martin (French Part)|Saint Vincent and the Grenadines|Sint Maarten (Dutch part)|Trinidad and Tobago|Turks and Caicos Islands|United States Virgin Islands|Belize|Costa Rica|El Salvador|Guatemala|Honduras|Mexico|Nicaragua|Panama|Argentina|Bolivia (Plurinational State of)|Bouvet Island|Brazil|Chile|Colombia|Ecuador|Falkland Islands (Malvinas)|French Guiana|Guyana|Paraguay|Peru|South Georgia and the South Sandwich Islands|Suriname|Uruguay|Venezuela (Bolivarian Republic of)|Bermuda|Canada|Greenland|Saint Pierre and Miquelon|United States of America|Kazakhstan|Kyrgyzstan|Tajikistan|Turkmenistan|Uzbekistan|China|China, Hong Kong Special Administrative Region|China, Macao Special Administrative Region|Democratic People's Republic of Korea|Japan|Mongolia|Republic of Korea|Taiwan|Brunei Darussalam|Cambodia|Indonesia|Lao People's Democratic Republic|Malaysia|Myanmar|Philippines|Singapore|Thailand|Timor-Leste|Viet Nam|Afghanistan|Bangladesh|Bhutan|India|Iran (Islamic Republic of)|Maldives|Nepal|Pakistan|Sri Lanka|Armenia|Azerbaijan|Bahrain|Cyprus|Georgia|Iraq|Israel|Jordan|Kuwait|Lebanon|Oman|Qatar|Saudi Arabia|State of Palestine|Syrian Arab Republic|Turkey|United Arab Emirates|Yemen|Belarus|Bulgaria|Czechia|Hungary|Poland|Republic of Moldova|Romania|Russian Federation|Slovakia|Ukraine|Åland Islands|Guernsey|Jersey|Denmark|Estonia|Faroe Islands|Finland|Iceland|Ireland|Isle of Man|Latvia|Lithuania|Norway|Svalbard and Jan Mayen Islands|Sweden|United Kingdom of Great Britain and Northern Ireland|Albania|Andorra|Bosnia and Herzegovina|Croatia|Gibraltar|Greece|Holy See|Italy|Malta|Montenegro|North Macedonia|Portugal|San Marino|Serbia|Slovenia|Spain|Austria|Belgium|France|Germany|Liechtenstein|Luxembourg|Monaco|Netherlands|Switzerland|Australia|Christmas Island|Cocos (Keeling) Islands|Heard Island and McDonald Islands|New Zealand|Norfolk Island|Fiji|New Caledonia|Papua New Guinea|Solomon Islands|Vanuatu|Guam|Kiribati|Marshall Islands|Micronesia (Federated States of)|Nauru|Northern Mariana Islands|Palau|United States Minor Outlying Islands|American Samoa|Cook Islands|French Polynesia|Niue|Pitcairn|Samoa|Tokelau|Tonga|Tuvalu|Wallis and Futuna Islands","sep":"|"},{"d":"Northern Africa|Eastern Africa|Middle Africa|Southern Africa|Western Africa|Caribbean|Central America|South America|Northern America|Central Asia|Eastern Asia|South-eastern Asia|Southern Asia|Western Asia|Eastern Europe|Northern Europe|Southern Europe|Western Europe|Australia and New Zealand|Western Pacific Islands","r":"0*7,1*m,2*9,3*5,4*h,5*s,6*8,7*g,8*5,9*5,a*8,b*b,c*9,d*i,e*a,f*g,g*g,h*9,i*6,j*n","sep":"|"},{"s":"DZ|EG|LY|MA|SD|TN|EH|IO|BI|KM|DJ|ER|ET|TF|KE|MG|MW|MU|YT|MZ|RE|RW|SC|SO|SS|UG|TZ|ZM|ZW|AO|CM|CF|TD|CG|CD|GQ|GA|ST|BW|SZ|LS||ZA|BJ|BF|CV|CI|GM|GH|GN|GW|LR|ML|MR|NE|NG|SH|SN|SL|TG|AI|AG|AW|BS|BB|BQ|VG|KY|CU|CW|DM|DO|GD|GP|HT|JM|MQ|MS|PR|BL|KN|LC|MF|VC|SX|TT|TC|VI|BZ|CR|SV|GT|HN|MX|NI|PA|AR|BO|BV|BR|CL|CO|EC|FK|GF|GY|PY|PE|GS|SR|UY|VE|BM|CA|GL|PM|US|KZ|KG|TJ|TM|UZ|CN|HK|MO|KP|JP|MN|KR|TW|BN|KH|ID|LA|MY|MM|PH|SG|TH|TL|VN|AF|BD|BT|IN|IR|MV|NP|PK|LK|AM|AZ|BH|CY|GE|IQ|IL|JO|KW|LB|OM|QA|SA|PS|SY|TR|AE|YE|BY|BG|CZ|HU|PL|MD|RO|RU|SK|UA|AX|GG|JE|DK|EE|FO|FI|IS|IE|IM|LV|LT|NO|SJ|SE|GB|AL|AD|BA|HR|GI|GR|VA|IT|MT|ME|MK|PT|SM|RS|SI|ES|AT|BE|FR|DE|LI|LU|MC|NL|CH|AU|CX|CC|HM|NZ|NF|FJ|NC|PG|SB|VU|GU|KI|MH|FM|NR|MP|PW|UM|AS|CK|PF|NU|PN|WS|TK|TO|TV|WF","sep":"|"}]}]);
const COLONY = [
{"id":"n-0f19a234","guard":[["has","name"],["has","region"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"of Cabo Verde":"The region name of Cabo Verde is Western Africa.","of the country name Guadeloupe":"The region name of Guadeloupe is Caribbean.","for Burundi":"The region name of Burundi is Eastern Africa.","of the country name Haiti":"The region name of Haiti is Caribbean.","for Saint Helena":"The region name of Saint Helena is Western Africa.","of Timor-Leste":"The region name of Timor-Leste is South-eastern Asia.","of the country name Austria":"The region name of Austria is Western Europe.","for Tonga":"The region name of Tonga is Western Pacific Islands.","of Indonesia":"The region name of Indonesia is South-eastern Asia.","of the country name United States Virgin Islands":"The region name of United States Virgin Islands is Caribbean.","of Côte d’Ivoire":"The region name of Côte d’Ivoire is Western Africa.","of Lesotho":"The region name of Lesotho is Southern Africa.","of the country name Western Sahara":"The region name of Western Sahara is Northern Africa.","for Qatar":"The region name of Qatar is Western Asia.","of Trinidad and Tobago":"The region name of Trinidad and Tobago is Caribbean.","for Zambia":"The region name of Zambia is Eastern Africa.","of the country name Panama":"The region name of Panama is Central America.","of the country name Ecuador":"The region name of Ecuador is South America.","of the country name Senegal":"The region name of Senegal is Western Africa.","of the country name Dominica":"The region name of Dominica is Caribbean.","of United Kingdom of Great Britain and Northern Ireland":"The region name of United Kingdom of Great Britain and Northern Ireland is Northern Europe.","for Martinique":"The region name of Martinique is Caribbean.","of Burkina Faso":"The region name of Burkina Faso is Western Africa.","of Guinea":"The region name of Guinea is Western Africa.","for Georgia":"The region name of Georgia is Western Asia.","for British Virgin Islands":"The region name of British Virgin Islands is Caribbean.","of the country name Tuvalu":"The region name of Tuvalu is Western Pacific Islands.","for Madagascar":"The region name of Madagascar is Eastern Africa.","of Benin":"The region name of Benin is Western Africa.","of Suriname":"The region name of Suriname is South America.","of Bahrain":"The region name of Bahrain is Western Asia.","for Greece":"The region name of Greece is Southern Europe.","of the country name Bermuda":"The region name of Bermuda is Northern America.","of Cameroon":"The region name of Cameroon is Middle Africa.","of the country name Tunisia":"The region name of Tunisia is Northern Africa.","for Mali":"The region name of Mali is Western Africa.","of Central African Republic":"The region name of Central African Republic is Middle Africa.","for Malawi":"The region name of Malawi is Eastern Africa.","for Armenia":"The region name of Armenia is Western Asia.","for Bhutan":"The region name of Bhutan is Southern Asia.","for Jamaica":"The region name of Jamaica is Caribbean.","for Russian Federation":"The region name of Russian Federation is Eastern Europe.","for United States of America":"The region name of United States of America is Northern America.","of the country name Hungary":"The region name of Hungary is Eastern Europe.","of the country name China, Macao Special Administrative Region":"The region name of China, Macao Special Administrative Region is Eastern Asia.","for Christmas Island":"The region name of Christmas Island is Australia and New Zealand.","for Eritrea":"The region name of Eritrea is Eastern Africa.","of the country name Micronesia (Federated States of)":"The region name of Micronesia (Federated States of) is Western Pacific Islands.","of the country name Mozambique":"The region name of Mozambique is Eastern Africa.","of the country name Germany":"The region name of Germany is Western Europe.","of the country name Eswatini":"The region name of Eswatini is Southern Africa.","of Namibia":"The region name of Namibia is Southern Africa.","of Peru":"The region name of Peru is South America.","of Viet Nam":"The region name of Viet Nam is South-eastern Asia.","of Isle of Man":"The region name of Isle of Man is Northern Europe.","for India":"The region name of India is Southern Asia.","of Democratic Republic of the Congo":"The region name of Democratic Republic of the Congo is Middle Africa.","of the country name Montserrat":"The region name of Montserrat is Caribbean.","of the country name Sint Maarten (Dutch part)":"The region name of Sint Maarten (Dutch part) is Caribbean.","of the country name Marshall Islands":"The region name of Marshall Islands is Western Pacific Islands.","of the country name Morocco":"The region name of Morocco is Northern Africa.","of the country name Switzerland":"The region name of Switzerland is Western Europe.","for Saudi Arabia":"The region name of Saudi Arabia is Western Asia.","of the country name Sri Lanka":"The region name of Sri Lanka is Southern Asia.","for Lebanon":"The region name of Lebanon is Western Asia.","for Kyrgyzstan":"The region name of Kyrgyzstan is Central Asia.","for Venezuela (Bolivarian Republic of)":"The region name of Venezuela (Bolivarian Republic of) is South America.","of Norway":"The region name of Norway is Northern Europe.","of Croatia":"The region name of Croatia is Southern Europe.","of Ukraine":"The region name of Ukraine is Eastern Europe.","of Malaysia":"The region name of Malaysia is South-eastern Asia.","for Gabon":"The region name of Gabon is Middle Africa.","of Chile":"The region name of Chile is South America.","of the country name Turks and Caicos Islands":"The region name of Turks and Caicos Islands is Caribbean.","of Holy See":"The region name of Holy See is Southern Europe.","of Northern Mariana Islands":"The region name of Northern Mariana Islands is Western Pacific Islands.","of Cook Islands":"The region name of Cook Islands is Western Pacific Islands.","of the country name Belize":"The region name of Belize is Central America.","of the country name Yemen":"The region name of Yemen is Western Asia.","for Uruguay":"The region name of Uruguay is South America.","of Costa Rica":"The region name of Costa Rica is Central America.","for Turkmenistan":"The region name of Turkmenistan is Central Asia.","of Bonaire, Sint Eustatius and Saba":"The region name of Bonaire, Sint Eustatius and Saba is Caribbean.","of the country name Cyprus":"The region name of Cyprus is Western Asia.","of Republic of Korea":"The region name of Republic of Korea is Eastern Asia.","of the country name Faroe Islands":"The region name of Faroe Islands is Northern Europe.","of the country name Guam":"The region name of Guam is Western Pacific Islands.","of the country name Poland":"The region name of Poland is Eastern Europe.","for Denmark":"The region name of Denmark is Northern Europe.","of the country name Singapore":"The region name of Singapore is South-eastern Asia.","for Australia":"The region name of Australia is Australia and New Zealand.","of Syrian Arab Republic":"The region name of Syrian Arab Republic is Western Asia.","of Malta":"The region name of Malta is Southern Europe.","for Barbados":"The region name of Barbados is Caribbean.","of the country name Mongolia":"The region name of Mongolia is Eastern Asia.","for Spain":"The region name of Spain is Southern Europe.","for Congo":"The region name of Congo is Middle Africa.","of Belgium":"The region name of Belgium is Western Europe.","of Chad":"The region name of Chad is Middle Africa.","for Iceland":"The region name of Iceland is Northern Europe."}}},
{"id":"n-b3ad5543","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"region"}]]],"mem":{"table":{"name of Cabo Verde":"The region name of Cabo Verde is Western Africa.","name of the country name Guadeloupe":"The region name of Guadeloupe is Caribbean.","name for Burundi":"The region name of Burundi is Eastern Africa.","name of the country name Haiti":"The region name of Haiti is Caribbean.","name for Saint Helena":"The region name of Saint Helena is Western Africa.","name of Timor-Leste":"The region name of Timor-Leste is South-eastern Asia.","name of the country name Austria":"The region name of Austria is Western Europe.","name for Tonga":"The region name of Tonga is Western Pacific Islands.","name of Indonesia":"The region name of Indonesia is South-eastern Asia.","name of the country name United States Virgin Islands":"The region name of United States Virgin Islands is Caribbean.","name of Côte d’Ivoire":"The region name of Côte d’Ivoire is Western Africa.","name of Lesotho":"The region name of Lesotho is Southern Africa.","name of the country name Western Sahara":"The region name of Western Sahara is Northern Africa.","name for Qatar":"The region name of Qatar is Western Asia.","name of Trinidad and Tobago":"The region name of Trinidad and Tobago is Caribbean.","name for Zambia":"The region name of Zambia is Eastern Africa.","name of the country name Panama":"The region name of Panama is Central America.","name of the country name Ecuador":"The region name of Ecuador is South America.","name of the country name Senegal":"The region name of Senegal is Western Africa.","name of the country name Dominica":"The region name of Dominica is Caribbean.","name of United Kingdom of Great Britain and Northern Ireland":"The region name of United Kingdom of Great Britain and Northern Ireland is Northern Europe.","name for Martinique":"The region name of Martinique is Caribbean.","name of Burkina Faso":"The region name of Burkina Faso is Western Africa.","name of Guinea":"The region name of Guinea is Western Africa.","name for Georgia":"The region name of Georgia is Western Asia.","name for British Virgin Islands":"The region name of British Virgin Islands is Caribbean.","name of the country name Tuvalu":"The region name of Tuvalu is Western Pacific Islands.","name for Madagascar":"The region name of Madagascar is Eastern Africa.","name of Benin":"The region name of Benin is Western Africa.","name of Suriname":"The region name of Suriname is South America.","name of Bahrain":"The region name of Bahrain is Western Asia.","name for Greece":"The region name of Greece is Southern Europe.","name of the country name Bermuda":"The region name of Bermuda is Northern America.","name of Cameroon":"The region name of Cameroon is Middle Africa.","name of the country name Tunisia":"The region name of Tunisia is Northern Africa.","name for Mali":"The region name of Mali is Western Africa.","name of Central African Republic":"The region name of Central African Republic is Middle Africa.","name for Malawi":"The region name of Malawi is Eastern Africa.","name for Armenia":"The region name of Armenia is Western Asia.","name for Bhutan":"The region name of Bhutan is Southern Asia.","name for Jamaica":"The region name of Jamaica is Caribbean.","name for Russian Federation":"The region name of Russian Federation is Eastern Europe.","name for United States of America":"The region name of United States of America is Northern America.","name of the country name Hungary":"The region name of Hungary is Eastern Europe.","name of the country name China, Macao Special Administrative Region":"The region name of China, Macao Special Administrative Region is Eastern Asia.","name for Christmas Island":"The region name of Christmas Island is Australia and New Zealand.","name for Eritrea":"The region name of Eritrea is Eastern Africa.","name of the country name Micronesia (Federated States of)":"The region name of Micronesia (Federated States of) is Western Pacific Islands.","name of the country name Mozambique":"The region name of Mozambique is Eastern Africa.","name of the country name Germany":"The region name of Germany is Western Europe.","name of the country name Eswatini":"The region name of Eswatini is Southern Africa.","name of Namibia":"The region name of Namibia is Southern Africa.","name of Peru":"The region name of Peru is South America.","name of Viet Nam":"The region name of Viet Nam is South-eastern Asia.","name of Isle of Man":"The region name of Isle of Man is Northern Europe.","name for India":"The region name of India is Southern Asia.","name of Democratic Republic of the Congo":"The region name of Democratic Republic of the Congo is Middle Africa.","name of the country name Montserrat":"The region name of Montserrat is Caribbean.","name of the country name Sint Maarten (Dutch part)":"The region name of Sint Maarten (Dutch part) is Caribbean.","name of the country name Marshall Islands":"The region name of Marshall Islands is Western Pacific Islands.","name of the country name Morocco":"The region name of Morocco is Northern Africa.","name of the country name Switzerland":"The region name of Switzerland is Western Europe.","name for Saudi Arabia":"The region name of Saudi Arabia is Western Asia.","name of the country name Sri Lanka":"The region name of Sri Lanka is Southern Asia.","name for Lebanon":"The region name of Lebanon is Western Asia.","name for Kyrgyzstan":"The region name of Kyrgyzstan is Central Asia.","name for Venezuela (Bolivarian Republic of)":"The region name of Venezuela (Bolivarian Republic of) is South America.","name of Norway":"The region name of Norway is Northern Europe.","name of Croatia":"The region name of Croatia is Southern Europe.","name of Ukraine":"The region name of Ukraine is Eastern Europe.","name of Malaysia":"The region name of Malaysia is South-eastern Asia.","name for Gabon":"The region name of Gabon is Middle Africa.","name of Chile":"The region name of Chile is South America.","name of the country name Turks and Caicos Islands":"The region name of Turks and Caicos Islands is Caribbean.","name of Holy See":"The region name of Holy See is Southern Europe.","name of Northern Mariana Islands":"The region name of Northern Mariana Islands is Western Pacific Islands.","name of Cook Islands":"The region name of Cook Islands is Western Pacific Islands.","name of the country name Belize":"The region name of Belize is Central America.","name of the country name Yemen":"The region name of Yemen is Western Asia.","name for Uruguay":"The region name of Uruguay is South America.","name of Costa Rica":"The region name of Costa Rica is Central America.","name for Turkmenistan":"The region name of Turkmenistan is Central Asia.","name of Bonaire, Sint Eustatius and Saba":"The region name of Bonaire, Sint Eustatius and Saba is Caribbean.","name of the country name Cyprus":"The region name of Cyprus is Western Asia.","name of Republic of Korea":"The region name of Republic of Korea is Eastern Asia.","name of the country name Faroe Islands":"The region name of Faroe Islands is Northern Europe.","name of the country name Guam":"The region name of Guam is Western Pacific Islands.","name of the country name Poland":"The region name of Poland is Eastern Europe.","name for Denmark":"The region name of Denmark is Northern Europe.","name of the country name Singapore":"The region name of Singapore is South-eastern Asia.","name for Australia":"The region name of Australia is Australia and New Zealand.","name of Syrian Arab Republic":"The region name of Syrian Arab Republic is Western Asia.","name of Malta":"The region name of Malta is Southern Europe.","name for Barbados":"The region name of Barbados is Caribbean.","name of the country name Mongolia":"The region name of Mongolia is Eastern Asia.","name for Spain":"The region name of Spain is Southern Europe.","name for Congo":"The region name of Congo is Middle Africa.","name of Belgium":"The region name of Belgium is Western Europe.","name of Chad":"The region name of Chad is Middle Africa.","name for Iceland":"The region name of Iceland is Northern Europe."}}},
{"id":"n-ecd9a12f","guard":[["hasAny",["administrative","arabia","armenia","austria","bahrain","barbados","belgium","belize","benin","bermuda","bhutan","britain","burkina","burundi","cabo","caicos","cameroon","chad","chile","christmas","congo","costa","croatia","cyprus","côte","denmark","dominica","ecuador","element","eritrea","eswatini","faroe","federation","gabon","georgia","germany","greece","guadeloupe","guam","guinea","haiti","helena","holy","hungary","iceland","india","indonesia","item number","jamaica","kyrgyzstan","lanka","lebanon","lesotho","madagascar","malawi","malaysia","mali","malta","martinique","mongolia","montserrat","morocco","mozambique","nam","namibia","norway","nth","panama","peru","poland","position","qatar","republic","sahara","senegal","separate by","singapore","sint","spain","split","split by","suriname","switzerland","timorleste","tobago","tonga","tunisia","turkmenistan","tuvalu","ukraine","uruguay","virgin","yemen","zambia"]],["has","region"],["has","name"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}],["sense.lastWord"]]],"mem":null},
{"id":"n-f9b9ffe2","guard":[["hasAny",["administrative","arabia","armenia","austria","bahrain","barbados","belgium","belize","benin","bermuda","bhutan","britain","burkina","burundi","cabo","caicos","cameroon","chad","chile","christmas","congo","costa","croatia","cyprus","côte","delete","denmark","dominica","ecuador","element","eritrea","eswatini","faroe","federation","gabon","georgia","germany","greece","guadeloupe","guam","guinea","haiti","helena","holy","hungary","iceland","india","indonesia","item number","jamaica","kyrgyzstan","lanka","lebanon","lesotho","madagascar","malawi","malaysia","mali","malta","martinique","mongolia","montserrat","morocco","mozambique","nam","namibia","norway","nth","panama","peru","poland","position","qatar","remove","republic","sahara","senegal","singapore","sint","spain","strip out","suriname","switzerland","timorleste","tobago","tonga","tunisia","turkmenistan","tuvalu","ukraine","uruguay","virgin","without","yemen","zambia"]],["has","region"],["has","name"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}],["sense.lastWord"]]],"mem":null},
{"id":"n-59cf9a24","guard":[["hasAny",["administrative","arabia","armenia","australia","austria","bahrain","barbados","belgium","belize","benin","bermuda","bhutan","burkina","burundi","cabo","cameroon","chad","chile","christmas","congo","costa","croatia","cyprus","côte","denmark","dominica","ecuador","element","eritrea","eswatini","federation","gabon","georgia","germany","greece","guadeloupe","guam","guinea","haiti","helena","hungary","iceland","india","indonesia","item number","jamaica","kyrgyzstan","lebanon","lesotho","madagascar","malawi","malaysia","mali","malta","martinique","mongolia","montserrat","morocco","mozambique","namibia","norway","nth","panama","peru","poland","position","qatar","republic","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","spain","suriname","switzerland","timorleste","tobago","tonga","tunisia","turkmenistan","tuvalu","ukraine","united","uruguay","yemen","zambia"]],["has","region"],["has","name"],["not",["has","cb"]]],"pyramid":["render.template",{"lit":["The region ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-8f259ad5","guard":[["hasAny",["administrative","arabia","armenia","australia","austria","bahrain","barbados","belgium","belize","benin","bermuda","bhutan","burkina","burundi","cabo","cameroon","chad","chile","christmas","congo","costa","croatia","cyprus","côte","denmark","dominica","ecuador","element","eritrea","eswatini","federation","gabon","georgia","germany","greece","guadeloupe","guam","guinea","haiti","helena","holy","hungary","iceland","india","item number","jamaica","kyrgyzstan","lanka","lebanon","lesotho","madagascar","malawi","mali","malta","martinique","mongolia","montserrat","morocco","mozambique","namibia","normalise","normalize","norway","nth","panama","peru","poland","position","qatar","republic","sahara","senegal","simplify the text","sint","spain","suriname","switzerland","tobago","tonga","tunisia","turkmenistan","tuvalu","ukraine","united","uruguay","yemen","zambia"]],["has","region"],["has","name"],["not",["has","cb"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}],{"lit":1}]],"mem":null},
{"id":"n-08d2ff1f","guard":[["hasAny",["administrative","arabia","armenia","austria","bahrain","barbados","belgium","belize","benin","bermuda","bhutan","burkina","burundi","cabo","cameroon","chad","chile","congo","costa","croatia","cyprus","côte","denmark","dominica","ecuador","element","eritrea","eswatini","federation","gabon","georgia","germany","greece","guadeloupe","guam","guinea","haiti","helena","holy","hungary","iceland","india","item number","jamaica","kyrgyzstan","lanka","lebanon","lesotho","madagascar","malawi","mali","malta","martinique","mongolia","montserrat","morocco","mozambique","namibia","normalise","normalize","norway","nth","panama","peru","poland","position","qatar","republic","sahara","senegal","simplify the text","sint","spain","suriname","switzerland","tobago","tonga","tunisia","turkmenistan","tuvalu","ukraine","united","uruguay","yemen","zambia"]],["has","region"],["has","name"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}],{"lit":2}]],"mem":null},
{"id":"n-62543560","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]],["has","region"],["not",["has","cb"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-d7446786","guard":[["hasAny",["element","item number","join","joined with","name","nth","position","separated by"]],["has","region"],["not",["has","cb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.join",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-37e6fe62","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","timorleste","tobago","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-79124c32","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","timorleste","tobago","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The region ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-4aa76393","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","timorleste","tobago","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-71e9f190","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","timorleste","tobago","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-1afa1dbb","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","timorleste","tobago","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-72eb706b","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","capitalise","capitalize","capitalize each word","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","timorleste","title case","tobago","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-85b73811","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","lower case","lowercase","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","small letters","suriname","timorleste","tobago","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-da192006","guard":[["hasAny",["african","all caps","arab","bahrain","belgium","benin","burkina","cabo","cameroon","capital letters","capitals","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","timorleste","tobago","ukraine","upper case","uppercase"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-ddaf0582","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","invert case","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","swap case","timorleste","tobago","toggle case","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-528e7785","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","capitalise","capitalize","capitalize each word","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","timorleste","title case","tobago","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-9c81a7d5","guard":[["hasAny",["african","all caps","arab","bahrain","belgium","benin","burkina","cabo","cameroon","capital letters","capitals","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","timorleste","tobago","ukraine","upper case","uppercase"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-a5d1ecd2","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","lower case","lowercase","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","small letters","suriname","timorleste","tobago","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-a63dba91","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","invert case","item number","korea","lesotho","malaysia","malta","nam","namibia","northern","norway","nth","peru","position","sint","suriname","swap case","timorleste","tobago","toggle case","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-b178b082","guard":[["hasAny",["african","arab","bahrain","belgium","benin","burkina","cabo","cameroon","chad","chile","cook","costa","country","croatia","côte","democratic","element","guinea","holy","indonesia","item number","korea","lesotho","malaysia","malta","nam","namibia","normalise","normalize","northern","norway","nth","peru","position","simplify the text","sint","suriname","timorleste","tobago","ukraine"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-256635b7","guard":[["hasAny",["administrative","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","cameroon","chad","chile","costa","croatia","cyprus","côte","dominica","ecuador","element","eswatini","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","islands","item number","join","joined with","lesotho","malaysia","malta","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","republic","sahara","senegal","separated by","shortest","shortest one","shortest word","singapore","sint","states","suriname","switzerland","timorleste","tobago","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.join",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-fdfa4fbb","guard":[["hasAny",["administrative","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","cameroon","chad","chile","costa","croatia","cyprus","côte","dominica","ecuador","element","eswatini","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","islands","item number","lesotho","malaysia","malta","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","republic","sahara","senegal","separate by","shortest","shortest one","shortest word","singapore","sint","split","split by","states","suriname","switzerland","timorleste","tobago","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-818f817e","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","korea","lesotho","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","suriname","switzerland","timorleste","tobago","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-d101be25","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","korea","lesotho","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","suriname","switzerland","timorleste","tobago","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-20b803b0","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","korea","lesotho","lower case","lowercase","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","small letters","suriname","switzerland","timorleste","tobago","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-622c7cd8","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","invert case","item number","korea","lesotho","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","suriname","swap case","switzerland","timorleste","tobago","toggle case","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-68418fb4","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","capitalise","capitalize","capitalize each word","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","korea","lesotho","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","suriname","switzerland","timorleste","title case","tobago","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-6d110e9c","guard":[["hasAny",["administrative","african","all caps","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","capital letters","capitals","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","korea","lesotho","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","suriname","switzerland","timorleste","tobago","tunisia","tuvalu","ukraine","upper case","uppercase","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-ce6dcfd9","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","korea","lesotho","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","suriname","switzerland","timorleste","tobago","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-02251cf7","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","capitalise","capitalize","capitalize each word","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","korea","lesotho","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","suriname","switzerland","timorleste","title case","tobago","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-3c5ea399","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","invert case","item number","korea","lesotho","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","suriname","swap case","switzerland","timorleste","tobago","toggle case","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-8c88400f","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","korea","lesotho","lower case","lowercase","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","small letters","suriname","switzerland","timorleste","tobago","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-9c2dac3c","guard":[["hasAny",["administrative","african","all caps","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","capital letters","capitals","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","korea","lesotho","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","singapore","sint","suriname","switzerland","timorleste","tobago","tunisia","tuvalu","ukraine","upper case","uppercase","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-7e722478","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","caicos","cameroon","chad","chile","cook","costa","croatia","cyprus","côte","democratic","dominica","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","korea","lesotho","malaysia","malta","marshall","mongolia","montserrat","morocco","mozambique","namibia","normalise","normalize","northern","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","simplify the text","singapore","sint","suriname","switzerland","timorleste","tobago","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-536b0878","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","cameroon","chad","chile","cook","costa","croatia","cyprus","côte","dominica","dutch","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","holy","hungary","indonesia","item number","lanka","lesotho","malaysia","malta","mariana","marshall","mongolia","montserrat","morocco","mozambique","nam","namibia","normalise","normalize","norway","nth","panama","peru","poland","position","sahara","senegal","simplify the text","singapore","suriname","switzerland","timorleste","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-9755986b","guard":[["hasAny",["administrative","african","arab","austria","bahrain","belgium","belize","benin","bermuda","burkina","cabo","cameroon","chad","chile","cook","costa","croatia","cyprus","côte","dominica","dutch","ecuador","element","eswatini","faroe","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","lesotho","malaysia","malta","mariana","marshall","mongolia","montserrat","morocco","mozambique","namibia","normalise","normalize","norway","nth","panama","peru","poland","position","sahara","senegal","shortest","shortest one","shortest word","simplify the text","singapore","suriname","switzerland","timorleste","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"],["words>=",7]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-12b3dbc1","guard":[["hasAny",["austria","bahrain","belgium","belize","benin","bermuda","cameroon","chad","chile","croatia","cyprus","dashes","dominica","ecuador","element","eswatini","germany","guadeloupe","guam","guinea","haiti","hungary","hyphens","indonesia","item number","kebab case","kebabcase","lesotho","malaysia","malta","mongolia","montserrat","morocco","mozambique","namibia","norway","nth","panama","peru","poland","position","senegal","shortest","shortest one","shortest word","singapore","slug","suriname","switzerland","timorleste","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-58717884","guard":[["hasAny",["austria","bahrain","belgium","belize","benin","bermuda","cameroon","chad","chile","croatia","cyprus","dominica","ecuador","element","eswatini","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","lesotho","malaysia","malta","mongolia","montserrat","morocco","mozambique","namibia","norway","nth","panama","peru","poland","position","reverse the words","reverse word order","senegal","shortest","shortest one","shortest word","singapore","suriname","switzerland","timorleste","tunisia","tuvalu","ukraine","words backwards","yemen"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-03c4f77c","guard":[["hasAny",["austria","bahrain","belgium","belize","benin","bermuda","cameroon","chad","chile","croatia","cyprus","dominica","ecuador","element","eswatini","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","lesotho","malaysia","malta","mongolia","montserrat","morocco","mozambique","namibia","norway","nth","panama","peru","poland","position","senegal","shortest","shortest one","shortest word","singapore","suriname","switzerland","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-fff30b1c","guard":[["hasAny",["austria","bahrain","belgium","belize","benin","bermuda","cameroon","chad","chile","croatia","cyprus","dominica","ecuador","element","eswatini","germany","guadeloupe","guam","guinea","haiti","hungary","indonesia","item number","lesotho","lower case","lowercase","malaysia","malta","mongolia","montserrat","morocco","mozambique","namibia","norway","nth","panama","peru","poland","position","senegal","shortest","shortest one","shortest word","singapore","small letters","suriname","switzerland","tunisia","tuvalu","ukraine","yemen"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-06302725","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the region name of Cabo Verde":"The region name of Cabo Verde is Western Africa.","the region name of Timor-Leste":"The region name of Timor-Leste is South-eastern Asia.","the region name of Indonesia":"The region name of Indonesia is South-eastern Asia.","the region name of Côte d’Ivoire":"The region name of Côte d’Ivoire is Western Africa.","the region name of Lesotho":"The region name of Lesotho is Southern Africa.","the region name of Trinidad and Tobago":"The region name of Trinidad and Tobago is Caribbean.","the region name of United Kingdom of Great Britain and Northern Ireland":"The region name of United Kingdom of Great Britain and Northern Ireland is Northern Europe.","the region name of Burkina Faso":"The region name of Burkina Faso is Western Africa.","the region name of Guinea":"The region name of Guinea is Western Africa.","the region name of Benin":"The region name of Benin is Western Africa.","the region name of Suriname":"The region name of Suriname is South America.","the region name of Bahrain":"The region name of Bahrain is Western Asia.","the region name of Cameroon":"The region name of Cameroon is Middle Africa.","the region name of Central African Republic":"The region name of Central African Republic is Middle Africa.","the region name of Namibia":"The region name of Namibia is Southern Africa.","the region name of Peru":"The region name of Peru is South America.","the region name of Viet Nam":"The region name of Viet Nam is South-eastern Asia.","the region name of Isle of Man":"The region name of Isle of Man is Northern Europe.","the region name of Democratic Republic of the Congo":"The region name of Democratic Republic of the Congo is Middle Africa.","the region name of Norway":"The region name of Norway is Northern Europe.","the region name of Croatia":"The region name of Croatia is Southern Europe.","the region name of Ukraine":"The region name of Ukraine is Eastern Europe.","the region name of Malaysia":"The region name of Malaysia is South-eastern Asia.","the region name of Chile":"The region name of Chile is South America.","the region name of Holy See":"The region name of Holy See is Southern Europe.","the region name of Northern Mariana Islands":"The region name of Northern Mariana Islands is Western Pacific Islands.","the region name of Cook Islands":"The region name of Cook Islands is Western Pacific Islands.","the region name of Costa Rica":"The region name of Costa Rica is Central America.","the region name of Bonaire, Sint Eustatius and Saba":"The region name of Bonaire, Sint Eustatius and Saba is Caribbean.","the region name of Republic of Korea":"The region name of Republic of Korea is Eastern Asia.","the region name of Syrian Arab Republic":"The region name of Syrian Arab Republic is Western Asia.","the region name of Malta":"The region name of Malta is Southern Europe.","the region name of Belgium":"The region name of Belgium is Western Europe.","the region name of Chad":"The region name of Chad is Middle Africa."}}},
{"id":"n-a3a444ab","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-c79fbbd0","guard":[["hasAny",["element","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-ee5d4f86","guard":[["hasAny",["element","item number","lower case","lowercase","name","nth","position","shortest","shortest one","shortest word","small letters"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-7eeac058","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-d3e3be21","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-285ba01c","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","capitalise","capitalize","capitalize each word","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","title case","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-4f181ae4","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","invert case","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","swap case","toggle case","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-56fb9084","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-5dfd807c","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","invert case","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","swap case","toggle case","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-7c9c7537","guard":[["hasAny",["all caps","america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","capital letters","capitals","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","tonga","turkmenistan","upper case","uppercase","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-c9dedeb2","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-cbf2e515","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","lower case","lowercase","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","small letters","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-f3f0df28","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","class name","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","pascal case","pascalcase","position","qatar","shortest","shortest one","shortest word","spain","tonga","turkmenistan","upper camel case","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-5263024c","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","lower case","lowercase","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","small letters","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-63956315","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","capitalise","capitalize","capitalize each word","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","title case","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-73b6e19b","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","each word","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","split into words","tonga","turkmenistan","uruguay","words","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-7c5e529d","guard":[["hasAny",["country","element","item number","nth","position"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-804b011f","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","invert case","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","swap case","toggle case","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-df3fa4a5","guard":[["hasAny",["all caps","america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","capital letters","capitals","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","tonga","turkmenistan","upper case","uppercase","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-ff03ac15","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","each word","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","split into words","tonga","turkmenistan","uruguay","words","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-2d2c962c","guard":[["hasAny",["america","arabia","armenia","australia","barbados","bhutan","bolivarian","british","burundi","christmas","denmark","element","eritrea","federation","for","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","normalise","normalize","nth","position","qatar","shortest","shortest one","shortest word","simplify the text","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","name"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-a0f0c8eb","guard":[["has","name"],["has","region"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"Burundi":"The region name of Burundi is Eastern Africa.","Saint Helena":"The region name of Saint Helena is Western Africa.","Tonga":"The region name of Tonga is Western Pacific Islands.","Qatar":"The region name of Qatar is Western Asia.","Zambia":"The region name of Zambia is Eastern Africa.","Martinique":"The region name of Martinique is Caribbean.","Georgia":"The region name of Georgia is Western Asia.","British Virgin Islands":"The region name of British Virgin Islands is Caribbean.","Madagascar":"The region name of Madagascar is Eastern Africa.","Greece":"The region name of Greece is Southern Europe.","Mali":"The region name of Mali is Western Africa.","Malawi":"The region name of Malawi is Eastern Africa.","Armenia":"The region name of Armenia is Western Asia.","Bhutan":"The region name of Bhutan is Southern Asia.","Jamaica":"The region name of Jamaica is Caribbean.","Russian Federation":"The region name of Russian Federation is Eastern Europe.","United States of America":"The region name of United States of America is Northern America.","Christmas Island":"The region name of Christmas Island is Australia and New Zealand.","Eritrea":"The region name of Eritrea is Eastern Africa.","India":"The region name of India is Southern Asia.","Saudi Arabia":"The region name of Saudi Arabia is Western Asia.","Lebanon":"The region name of Lebanon is Western Asia.","Kyrgyzstan":"The region name of Kyrgyzstan is Central Asia.","Venezuela (Bolivarian Republic of)":"The region name of Venezuela (Bolivarian Republic of) is South America.","Gabon":"The region name of Gabon is Middle Africa.","Uruguay":"The region name of Uruguay is South America.","Turkmenistan":"The region name of Turkmenistan is Central Asia.","Denmark":"The region name of Denmark is Northern Europe.","Australia":"The region name of Australia is Australia and New Zealand.","Barbados":"The region name of Barbados is Caribbean.","Spain":"The region name of Spain is Southern Europe.","Congo":"The region name of Congo is Middle Africa.","Iceland":"The region name of Iceland is Northern Europe."}}},
{"id":"n-23689ff0","guard":[["hasAny",["arabia","armenia","australia","barbados","bhutan","british","burundi","christmas","denmark","element","eritrea","federation","gabon","georgia","greece","helena","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","normalise","normalize","nth","position","qatar","shortest","shortest one","shortest word","simplify the text","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-b43442ae","guard":[["hasAny",["armenia","australia","barbados","bhutan","burundi","denmark","element","eritrea","gabon","georgia","greece","iceland","india","item number","jamaica","kyrgyzstan","lebanon","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-b003e860","guard":[["hasAny",["armenia","australia","barbados","bhutan","burundi","denmark","element","eritrea","gabon","georgia","greece","iceland","india","item number","jamaica","kyrgyzstan","lebanon","lower case","lowercase","madagascar","malawi","mali","martinique","nth","position","qatar","shortest","shortest one","shortest word","small letters","spain","tonga","turkmenistan","uruguay","zambia"]],["has","region"],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-5f1d54f1","guard":[["hasAny",["arabia","benin","bhutan","cabo","chad","chile","costa","element","gabon","greece","guinea","helena","holy","india","item number","longest","longest one","longest word","malawi","mali","malta","nam","norway","nth","peru","position","qatar","spain","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-4f1d063a","guard":[["hasAny",["arabia","benin","bhutan","cabo","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","spain","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-d467645d","guard":[["hasAny",["arabia","benin","bhutan","cabo","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","spain","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-10a6788d","guard":[["hasAny",["arabia","benin","bhutan","cabo","chad","chile","costa","element","gabon","greece","guinea","helena","india","invert case","item number","longest","longest one","longest word","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","spain","swap case","toggle case","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-3701667d","guard":[["hasAny",["arabia","benin","bhutan","cabo","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","spain","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-6bb20a54","guard":[["hasAny",["all caps","arabia","benin","bhutan","cabo","capital letters","capitals","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","spain","tonga","upper case","uppercase","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-a2501826","guard":[["hasAny",["arabia","benin","bhutan","cabo","capitalise","capitalize","capitalize each word","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","spain","title case","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-dfa59dc3","guard":[["hasAny",["arabia","benin","bhutan","cabo","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","lower case","lowercase","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","small letters","spain","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-03533c4e","guard":[["hasAny",["arabia","benin","bhutan","cabo","capitalise","capitalize","capitalize each word","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","spain","title case","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-223c84f2","guard":[["hasAny",["arabia","benin","bhutan","cabo","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","lower case","lowercase","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","small letters","spain","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-6fcc4b34","guard":[["hasAny",["all caps","arabia","benin","bhutan","cabo","capital letters","capitals","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","spain","tonga","upper case","uppercase","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-da852207","guard":[["hasAny",["arabia","benin","bhutan","cabo","chad","chile","costa","element","gabon","greece","guinea","helena","india","invert case","item number","longest","longest one","longest word","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","spain","swap case","toggle case","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-891867c3","guard":[["hasAny",["arabia","benin","bhutan","cabo","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","malawi","mali","malta","normalise","normalize","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","simplify the text","spain","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-97ecc3a9","guard":[["hasAny",["arabia","benin","bhutan","cabo","chad","chile","costa","element","gabon","greece","guinea","helena","india","item number","longest","longest one","longest word","malawi","mali","malta","normalise","normalize","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","simplify the text","spain","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-6221a435","guard":[["hasAny",["barbados","caicos","dominica","element","federation","guadeloupe","haiti","hungary","item number","jamaica","martinique","montserrat","normalise","normalize","nth","poland","position","simplify the text","sint","tobago","ukraine","virgin"]],["has","region"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}],{"lit":3}]],"mem":null},
{"id":"n-dd101216","guard":[["hasAny",["benin","bhutan","chad","chile","element","gabon","greece","guinea","india","item number","longest","longest one","longest word","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","spain","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-06e4bd46","guard":[["hasAny",["benin","bhutan","chad","chile","element","gabon","greece","guinea","india","item number","longest","longest one","longest word","lower case","lowercase","malawi","mali","malta","norway","nth","peru","position","qatar","shortest","shortest one","shortest word","small letters","spain","tonga","zambia"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.lower",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-0a7a4074","guard":[["hasAny",["barbados","caicos","dominica","element","guadeloupe","haiti","item number","jamaica","martinique","montserrat","nth","position","sint","snake case","snakecase","tobago","underscores","variable name","virgin"]],["has","region"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-3aaa33b5","guard":[["hasAny",["barbados","caicos","dominica","element","guadeloupe","haiti","item number","jamaica","martinique","montserrat","nth","position","reverse the words","reverse word order","sint","tobago","virgin","words backwards"]],["has","region"]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-3d1c0033","guard":[["hasAny",["barbados","caicos","dominica","each word","element","guadeloupe","haiti","item number","jamaica","martinique","montserrat","nth","position","sint","split into words","tobago","virgin","words"]],["has","region"]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-54f3aa4a","guard":[["hasAny",["barbados","caicos","dashes","dominica","element","guadeloupe","haiti","hyphens","item number","jamaica","kebab case","kebabcase","martinique","montserrat","nth","position","sint","slug","tobago","virgin"]],["has","region"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-6c4ec0be","guard":[["hasAny",["barbados","caicos","camel case","camelcase","dominica","element","guadeloupe","haiti","item number","jamaica","lower camel case","martinique","montserrat","nth","position","sint","tobago","virgin"]],["has","region"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-6f182374","guard":[["hasAny",["barbados","caicos","dominica","each word","element","guadeloupe","haiti","item number","jamaica","martinique","montserrat","nth","position","sint","split into words","tobago","virgin","words"]],["has","region"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-9d5e19d2","guard":[["hasAny",["barbados","caicos","class name","dominica","element","guadeloupe","haiti","item number","jamaica","martinique","montserrat","nth","pascal case","pascalcase","position","sint","tobago","upper camel case","virgin"]],["has","region"]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-9fd47a7d","guard":[["hasAny",["barbados","caicos","dominica","each word","element","guadeloupe","haiti","item number","jamaica","martinique","montserrat","nth","position","sint","split into words","tobago","virgin","words"]],["has","region"]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-1706fea7","guard":[["hasAny",["barbados","caicos","camel case","camelcase","dominica","element","guadeloupe","haiti","item number","jamaica","lower camel case","martinique","montserrat","nth","position","reverse the words","reverse word order","sint","tobago","virgin","words backwards"]],["has","region"]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]]],"mem":null},
{"id":"n-206601bb","guard":[["hasAny",["barbados","caicos","camel case","camelcase","dominica","element","guadeloupe","haiti","invert case","item number","jamaica","lower camel case","martinique","montserrat","nth","position","sint","swap case","tobago","toggle case","virgin"]],["has","region"]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]]],"mem":null},
{"id":"n-3c2495bb","guard":[["hasAny",["barbados","caicos","dashes","dominica","element","guadeloupe","haiti","hyphens","item number","jamaica","kebab case","kebabcase","martinique","montserrat","nth","position","reverse the words","reverse word order","sint","slug","tobago","virgin","words backwards"]],["has","region"]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]]],"mem":null},
{"id":"n-641f2c07","guard":[["hasAny",["barbados","caicos","dominica","each word","element","guadeloupe","haiti","item number","jamaica","longest","longest one","longest word","martinique","montserrat","nth","position","sint","split into words","tobago","virgin","words"]],["has","region"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]]],"mem":null},
{"id":"n-8b8c4f95","guard":[["hasAny",["barbados","caicos","dominica","element","guadeloupe","haiti","item number","jamaica","lower case","lowercase","martinique","montserrat","nth","position","reverse the words","reverse word order","sint","small letters","tobago","virgin","words backwards"]],["has","region"]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]]],"mem":null},
{"id":"n-ed67b01c","guard":[["hasAny",["barbados","caicos","camel case","camelcase","dominica","element","guadeloupe","haiti","item number","jamaica","lower camel case","lower case","lowercase","martinique","montserrat","nth","position","sint","small letters","tobago","virgin"]],["has","region"]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]]],"mem":null},
{"id":"n-f77a3518","guard":[["hasAny",["barbados","caicos","dominica","each word","element","guadeloupe","haiti","item number","jamaica","martinique","montserrat","nth","position","shortest","shortest one","shortest word","sint","split into words","tobago","virgin","words"]],["has","region"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]]],"mem":null},
{"id":"n-06c0d966","guard":[["hasAny",["benin","cabo","chad","chile","costa","element","guinea","holy","isle","item number","longest","longest one","longest word","malta","nam","norway","nth","peru","position"]],["has","region"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-0d09ab1f","guard":[["hasAny",["arabia","bhutan","element","gabon","greece","helena","india","item number","longest","longest one","longest word","malawi","mali","nth","position","qatar","spain","tonga","zambia"]],["has","region"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-5aedfe7d","guard":[["hasAny",["caicos","delete","dominica","guadeloupe","haiti","item number","montserrat","nth","sint","strip out","tobago","virgin"]],["has","region"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-f73ec7eb","guard":[["hasAny",["caicos","dominica","element","guadeloupe","haiti","item number","montserrat","nth","position","shortest","shortest one","shortest word","sint","tobago"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Caribbean."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-11609b56","guard":[["hasAny",["caicos","dashes","dominica","element","guadeloupe","haiti","hyphens","item number","kebab case","kebabcase","montserrat","nth","position","shortest","shortest one","shortest word","sint","slug","tobago"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-428f11ec","guard":[["hasAny",["caicos","camel case","camelcase","dominica","element","guadeloupe","haiti","item number","lower camel case","montserrat","nth","position","shortest","shortest one","shortest word","sint","tobago"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-91b15dc2","guard":[["hasAny",["caicos","dominica","element","guadeloupe","haiti","item number","montserrat","nth","position","reverse the words","reverse word order","shortest","shortest one","shortest word","sint","tobago","words backwards"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-e2738219","guard":[["hasAny",["caicos","class name","dominica","element","guadeloupe","haiti","item number","montserrat","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","sint","tobago","upper camel case"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-da9a382a","guard":[["hasAny",["benin","burkina","cabo","côte","delete","guinea","item number","nth","senegal","strip out"]],["has","region"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-e34a934c","guard":[["hasAny",["cook","delete","federated","guam","item number","mariana","marshall","nth","strip out","tuvalu"]],["has","region"],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Pacific Islands"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-74244048","guard":[["hasAny",["benin","burkina","cabo","côte","element","guinea","item number","nth","position","senegal","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Western Africa."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-18ae4f6f","guard":[["hasAny",["bolivarian","chile","ecuador","peru","separate by","split by","suriname","uruguay"]],["has","region"]],"pyramid":["render.list",["transform.split",{"lit":"South America"},["sense.lastWord"]]],"mem":null},
{"id":"n-73cc542a","guard":[["hasAny",["bolivarian","chile","delete","ecuador","peru","strip out","suriname","uruguay"]],["has","region"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.lastWord"]]],"mem":null},
{"id":"n-dca7d57a","guard":[["hasAny",["delete","indonesia","item number","malaysia","nam","nth","singapore","strip out","timorleste"]],["has","region"]],"pyramid":["render.str",["transform.remove",{"lit":"South-eastern Asia"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-88763c43","guard":[["hasAny",["arabia","armenia","georgia","lebanon","qatar","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Western Asia."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-9f00bffc","guard":[["hasAny",["benin","cabo","guinea","helena","longest","longest one","longest word","mali","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Western Africa."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-9fbd5a3d","guard":[["hasAny",["burundi","eritrea","madagascar","malawi","shortest","shortest one","shortest word","zambia"]],["has","region"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eastern Africa."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-445f24b1","guard":[["hasAny",["cook","element","guam","item number","mariana","marshall","nth","position","shortest","shortest one","shortest word","tuvalu"]],["has","region"],["words>=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Western Pacific Islands."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-289ed065","guard":[["hasAny",["element","indonesia","item number","malaysia","nam","nth","position","singapore","timorleste"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is South-eastern Asia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-0bedb942","guard":[["hasAny",["arab","bahrain","cyprus","delete","item number","nth","strip out","yemen"]],["has","region"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-b360e7da","guard":[["hasAny",["chile","delete","ecuador","item number","nth","peru","strip out","suriname"]],["has","region"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-effcdb65","guard":[["hasAny",["african","cameroon","chad","congo","delete","item number","nth","strip out"]],["has","region"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-f0002cb3","guard":[["hasAny",["britain","delete","faroe","isle","item number","norway","nth","strip out"]],["has","region"],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-32639615","guard":[["hasAny",["barbados","british","jamaica","martinique","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Caribbean."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-046e4e99","guard":[["hasAny",["austria","belgium","element","germany","item number","nth","position","shortest","shortest one","shortest word","switzerland"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Western Europe."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-1c530e09","guard":[["hasAny",["arab","bahrain","cyprus","element","item number","nth","position","shortest","shortest one","shortest word","yemen"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Western Asia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-3b45223e","guard":[["hasAny",["african","cameroon","chad","democratic","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Middle Africa."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-ecb79a75","guard":[["hasAny",["chile","ecuador","element","item number","nth","peru","position","shortest","shortest one","shortest word","suriname"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is South America."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-edd45be8","guard":[["hasAny",["element","indonesia","item number","malaysia","nth","position","shortest","shortest one","shortest word","singapore","timorleste"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is South-eastern Asia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-00e21fc3","guard":[["hasAny",["barbados","british","camel case","camelcase","element","item number","jamaica","lower camel case","martinique","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-4981860c","guard":[["hasAny",["barbados","british","dashes","element","hyphens","item number","jamaica","kebab case","kebabcase","martinique","nth","position","shortest","shortest one","shortest word","slug"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-50248b87","guard":[["hasAny",["barbados","british","class name","element","item number","jamaica","martinique","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-b2b9635f","guard":[["hasAny",["barbados","british","element","item number","jamaica","martinique","nth","position","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-30967d3c","guard":[["hasAny",["croatia","delete","holy","item number","malta","nth","strip out"]],["has","region"]],"pyramid":["render.str",["transform.remove",{"lit":"Southern Europe"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-705631fd","guard":[["hasAny",["greece","longest","longest one","longest word","malta","shortest","shortest one","shortest word","spain"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Southern Europe."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-bac0b432","guard":[["hasAny",["britain","isle","item number","norway","nth"]],["has","region"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]],"mem":null},
{"id":"n-1cf6a0c7","guard":[["hasAny",["britain","isle","item number","lower case","lowercase","norway","nth","small letters"]],["has","region"]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]]],"mem":null},
{"id":"n-497b18d7","guard":[["hasAny",["belize","costa","element","item number","nth","panama","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Central America."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-4a7065fb","guard":[["hasAny",["britain","element","faroe","item number","norway","nth","position","shortest","shortest one","shortest word"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Northern Europe."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-4b832adb","guard":[["hasAny",["element","hungary","item number","nth","poland","position","shortest","shortest one","shortest word","ukraine"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eastern Europe."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-55ee3fa5","guard":[["hasAny",["element","eswatini","item number","lesotho","namibia","nth","position","shortest","shortest one","shortest word"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Southern Africa."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-80af1f81","guard":[["hasAny",["britain","capital letters","capitals","isle","item number","norway","nth","upper case","uppercase"]],["has","region"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]]],"mem":null},
{"id":"n-ae4c5334","guard":[["hasAny",["administrative","element","item number","korea","mongolia","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eastern Asia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-b00c418c","guard":[["hasAny",["element","item number","morocco","nth","position","sahara","shortest","shortest one","shortest word","tunisia"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Northern Africa."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-e39df5b9","guard":[["hasAny",["britain","invert case","isle","item number","norway","nth","swap case","toggle case"]],["has","region"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]]],"mem":null},
{"id":"n-083558c1","guard":[["hasAny",["croatia","element","holy","item number","malta","nth","position"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Southern Europe."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-e4188e0f","guard":[["hasAny",["britain","element","faroe","item number","norway","nth","position"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Northern Europe."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-b21a4918","guard":[["hasAny",["britain","element","isle","item number","norway","nth","position"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]],"mem":null},
{"id":"n-99d5c7d1","guard":[["hasAny",["all caps","britain","capital letters","capitals","element","isle","item number","norway","nth","position","upper case","uppercase"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]]],"mem":null},
{"id":"n-a68ae324","guard":[["hasAny",["britain","element","isle","item number","lower case","lowercase","norway","nth","position","small letters"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]]],"mem":null},
{"id":"n-e80a12fb","guard":[["hasAny",["britain","element","invert case","isle","item number","norway","nth","position","swap case","toggle case"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]]],"mem":null},
{"id":"n-210004e7","guard":[["hasAny",["delete","guam","strip out","tonga","tuvalu"]],["has","region"],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Pacific Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-36834e95","guard":[["hasAny",["guam","separate by","split by","tonga","tuvalu"]],["has","region"],["has","name"]],"pyramid":["render.list",["transform.split",{"lit":"Western Pacific Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-9b0422cb","guard":[["hasAny",["guam","separate by","split by","tonga","tuvalu"]],["has","region"],["has","name"]],"pyramid":["render.and",["transform.split",{"lit":"Western Pacific Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-d02e7eec","guard":[["hasAny",["guam","separate by","split by","tonga","tuvalu"]],["has","region"],["has","name"]],"pyramid":["render.lines",["transform.split",{"lit":"Western Pacific Islands"},["sense.lastWord"]]],"mem":null},
{"id":"n-389a094b","guard":[["hasAny",["bolivarian","shortest","shortest one","shortest word","uruguay"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is South America."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-4c6e49bd","guard":[["hasAny",["chad","gabon","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Middle Africa."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-59c2143e","guard":[["hasAny",["australia","christmas","shortest","shortest one","shortest word"]],["has","region"],["not",["has","cb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Australia and New Zealand."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-7d7f8c4f","guard":[["hasAny",["kyrgyzstan","shortest","shortest one","shortest word","turkmenistan"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Central Asia."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-8ca41444","guard":[["hasAny",["longest","longest one","longest word","malawi","shortest","shortest one","shortest word","zambia"]],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eastern Africa."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-a11ac021","guard":[["hasAny",["arabia","longest","longest one","longest word","qatar","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Western Asia."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-b47df633","guard":[["hasAny",["denmark","iceland","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Northern Europe."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-d7e5ac8b","guard":[["hasAny",["bhutan","india","longest","longest one","longest word","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Southern Asia."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-36c761b4","guard":[["hasAny",["croatia","element","item number","malta","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Southern Europe."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-fb3a2cd6","guard":[["hasAny",["britain","element","item number","norway","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]],"mem":null},
{"id":"n-6cd01d9b","guard":[["hasAny",["all caps","britain","capital letters","capitals","element","item number","norway","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]]],"mem":null},
{"id":"n-746e3456","guard":[["hasAny",["britain","element","item number","lower case","lowercase","norway","nth","position","shortest","shortest one","shortest word","small letters"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]]],"mem":null},
{"id":"n-eaf13cc2","guard":[["hasAny",["britain","element","invert case","item number","norway","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"},{"lit":"region name"}]]],"mem":null},
{"id":"n-9df3fe4e","guard":[["hasAny",["delete","item number","mozambique","nth","strip out"]],["has","tell"],["has","region"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country iso2"}],{"lit":1}]]],"mem":null},
{"id":"n-0d83dee1","guard":[["hasAny",["america","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Northern America."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-9623ad85","guard":[["hasAny",["federation","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eastern Europe."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-e79f8eba","guard":[["hasAny",["longest","longest one","longest word","shortest","shortest one","shortest word","tonga"]],["has","region"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Western Pacific Islands."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-106aa750","guard":[["hasAny",["element","item number","mozambique","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Eastern Africa."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-d3914b42","guard":[["hasAny",["bermuda","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Northern America."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-54ba02b0","guard":[["hasAny",["element","item number","lanka","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Southern Asia."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]]],"mem":null},
{"id":"n-83c1a471","guard":[["hasAny",["append","bolivarian","combine","concatenate","element","item number","nth","position","put together"]],["has","give"]],"pyramid":["render.str",["transform.concat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-c042e0fe","guard":[["hasAny",["append","bolivarian","combine","concatenate","element","item number","nth","position","put together"]],["has","give"]],"pyramid":["render.str",["transform.concat",["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]]],"mem":null},
{"id":"n-07480c17","guard":[["hasAny",["element","item number","lebanon","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lebanon is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-08e6e2c7","guard":[["hasAny",["burundi","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Burundi is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-154b4e49","guard":[["hasAny",["element","iceland","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Iceland is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-176f470e","guard":[["hasAny",["barbados","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Barbados is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-32c3f729","guard":[["hasAny",["element","item number","martinique","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Martinique is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-42d94fa1","guard":[["hasAny",["element","item number","jamaica","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Jamaica is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-4838420d","guard":[["hasAny",["denmark","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Denmark is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-4be288b4","guard":[["hasAny",["bolivarian","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Venezuela (Bolivarian Republic of) is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-4d6a03f5","guard":[["hasAny",["bhutan","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Bhutan is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-54d31f75","guard":[["hasAny",["element","greece","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","region"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Greece is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-57aa5609","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","qatar","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Qatar is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-5a2f4157","guard":[["hasAny",["element","eritrea","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Eritrea is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-6618c19b","guard":[["hasAny",["element","item number","longest","longest one","longest word","mali","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mali is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-67158b38","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","uruguay"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Uruguay is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-67f44aa8","guard":[["hasAny",["element","helena","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Saint Helena is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-75483e14","guard":[["hasAny",["element","item number","kyrgyzstan","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Kyrgyzstan is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-79411d20","guard":[["hasAny",["australia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"],["not",["has","cb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Australia is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-7a2524ea","guard":[["hasAny",["element","georgia","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Georgia is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-8a31375e","guard":[["hasAny",["british","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of British Virgin Islands is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-949d58f7","guard":[["hasAny",["element","item number","longest","longest one","longest word","malawi","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Malawi is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-9647fd28","guard":[["hasAny",["element","india","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of India is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-969f7e02","guard":[["hasAny",["element","federation","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Russian Federation is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-9ab5ea8b","guard":[["hasAny",["element","gabon","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Gabon is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-c015acc0","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","turkmenistan"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Turkmenistan is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-c7ab267f","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","zambia"]],["has","for"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Zambia is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-df8f3f0f","guard":[["hasAny",["element","item number","madagascar","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Madagascar is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-e172784a","guard":[["hasAny",["armenia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Armenia is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-e2c98998","guard":[["hasAny",["christmas","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Christmas Island is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-e99c2f62","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","spain"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Spain is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-ef634c1a","guard":[["hasAny",["america","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of United States of America is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-f416dc77","guard":[["hasAny",["arabia","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Saudi Arabia is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-fc46c772","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","tonga"]],["has","region"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tonga is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-00f6cce6","guard":[["hasAny",["costa","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Costa Rica is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-012b9c16","guard":[["hasAny",["côte","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Côte d’Ivoire is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-0ba00699","guard":[["hasAny",["element","germany","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Germany is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-0d94a2c9","guard":[["hasAny",["element","item number","mongolia","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mongolia is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-0d9ec5c0","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","suriname"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Suriname is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-118da882","guard":[["hasAny",["democratic","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Democratic Republic of the Congo is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-15719ff0","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tunisia"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tunisia is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-29ee563b","guard":[["hasAny",["cameroon","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Cameroon is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-2b7f28e3","guard":[["hasAny",["element","guinea","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Guinea is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-32073df2","guard":[["hasAny",["element","item number","namibia","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Namibia is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-372a7890","guard":[["hasAny",["element","haiti","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Haiti is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-395a6e45","guard":[["hasAny",["administrative","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of China, Macao Special Administrative Region is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-3c086bdc","guard":[["hasAny",["element","item number","nth","position","sahara","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Western Sahara is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-3c72eab9","guard":[["hasAny",["caicos","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Turks and Caicos Islands is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-3d6d5269","guard":[["hasAny",["element","guadeloupe","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Guadeloupe is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-3fdfb50a","guard":[["hasAny",["element","hungary","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Hungary is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-42689095","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","timorleste"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Timor-Leste is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-43721862","guard":[["hasAny",["cyprus","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Cyprus is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-4644144e","guard":[["hasAny",["cook","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Cook Islands is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-4868903e","guard":[["hasAny",["belgium","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Belgium is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-4dfd6757","guard":[["hasAny",["element","faroe","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Faroe Islands is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-4f7ff4f2","guard":[["hasAny",["element","item number","mozambique","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Mozambique is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-501457ce","guard":[["hasAny",["chad","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Chad is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-5164960f","guard":[["hasAny",["chile","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Chile is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-5213550a","guard":[["hasAny",["element","item number","marshall","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Marshall Islands is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-67b2dc02","guard":[["hasAny",["african","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Central African Republic is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-67ef6107","guard":[["hasAny",["belize","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Belize is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-68a47f6b","guard":[["hasAny",["element","item number","nth","position","senegal","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Senegal is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-6b500347","guard":[["hasAny",["element","guam","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Guam is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-6ba21986","guard":[["hasAny",["element","item number","korea","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Republic of Korea is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-829476b1","guard":[["hasAny",["britain","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of United Kingdom of Great Britain and Northern Ireland is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-92ed0878","guard":[["hasAny",["element","eswatini","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Eswatini is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-93ca73ab","guard":[["hasAny",["benin","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Benin is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-9708d6ae","guard":[["hasAny",["arab","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Syrian Arab Republic is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-99a5660e","guard":[["hasAny",["ecuador","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ecuador is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-a05054b0","guard":[["hasAny",["element","item number","montserrat","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Montserrat is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-a0c1305c","guard":[["hasAny",["element","indonesia","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Indonesia is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-a23bad72","guard":[["hasAny",["burkina","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Burkina Faso is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-a5b17399","guard":[["hasAny",["element","item number","nth","peru","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Peru is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-a7a03325","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","singapore"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Singapore is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-b18c39e6","guard":[["hasAny",["element","item number","mariana","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Northern Mariana Islands is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-b3d11868","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","switzerland"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Switzerland is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-b969964b","guard":[["hasAny",["element","item number","lesotho","nth","position","shortest","shortest one","shortest word"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Lesotho is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-ba03021e","guard":[["hasAny",["element","item number","malaysia","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Malaysia is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-bf7329f9","guard":[["hasAny",["element","item number","nth","poland","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Poland is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-c16fe94a","guard":[["hasAny",["austria","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Austria is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-c242b89a","guard":[["hasAny",["element","item number","malta","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Malta is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-c36b9265","guard":[["hasAny",["bahrain","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Bahrain is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-c4b8ede6","guard":[["hasAny",["dutch","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sint Maarten (Dutch part) is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-ce209c47","guard":[["hasAny",["element","item number","morocco","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Morocco is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-d21d7bd3","guard":[["hasAny",["dominica","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Dominica is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-d38dc930","guard":[["hasAny",["element","item number","nth","panama","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Panama is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-dbfdfa7d","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tobago"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Trinidad and Tobago is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-df96894a","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","ukraine"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Ukraine is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-e087fba7","guard":[["hasAny",["croatia","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Croatia is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-e2fbef86","guard":[["hasAny",["bermuda","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Bermuda is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-e4ff1c83","guard":[["hasAny",["bonaire","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Bonaire, Sint Eustatius and Saba is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-e7617c2f","guard":[["hasAny",["element","federated","item number","nth","position","shortest","shortest one","shortest word"]],["has","tell"],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Micronesia (Federated States of) is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-f55f9e2c","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","yemen"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Yemen is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-fd0cd6cb","guard":[["hasAny",["cabo","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Cabo Verde is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-fdbd1eed","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","tuvalu"]],["has","region"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Tuvalu is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-fe4c736e","guard":[["hasAny",["element","item number","norway","nth","position","shortest","shortest one","shortest word"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Norway is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-4eabfd5f","guard":[["hasAny",["element","holy","item number","nth","position"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Holy See is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-995a44e2","guard":[["hasAny",["element","item number","nam","nth","position"]],["has","region"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Viet Nam is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-b5a08786","guard":[["hasAny",["element","isle","item number","nth","position"]],["has","region"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Isle of Man is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-cecd278c","guard":[["hasAny",["element","item number","lanka","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of Sri Lanka is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-9eab152b","guard":[["hasAny",["administrative","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-30f22fc9","guard":[["hasAny",["administrative","capitalise","capitalize","capitalize each word","element","item number","nth","position","shortest","shortest one","shortest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.title",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-620317e2","guard":[["hasAny",["administrative","camel case","camelcase","element","item number","lower camel case","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.camel",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-7547f157","guard":[["hasAny",["administrative","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.lower",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-cf22158f","guard":[["hasAny",["administrative","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-ec48423a","guard":[["hasAny",["administrative","all caps","capital letters","capitals","element","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.upper",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-997bdcd1","guard":[["hasAny",["administrative","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-f575038d","guard":[["hasAny",["administrative","each word","element","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"}],{"lit":1}],{"lit":"fr-tidytuesday-country-regions-f74767"},{"lit":"country name"},{"lit":"region name"}]],"mem":null},
{"id":"n-00a5c199","guard":[["hasAny",["name","region","tobago","trinidad"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Trinidad and Tobago":"The region name of Trinidad and Tobago is Caribbean."}}},
{"id":"n-0510bf12","guard":[["hasAny",["india","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for India":"The region name of India is Southern Asia."}}},
{"id":"n-0530a685","guard":[["hasAny",["country","name","region","senegal"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Senegal":"The region name of Senegal is Western Africa."}}},
{"id":"n-062db410","guard":[["hasAny",["country","eswatini","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Eswatini":"The region name of Eswatini is Southern Africa."}}},
{"id":"n-09f546e6","guard":[["hasAny",["country","haiti","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Haiti":"The region name of Haiti is Caribbean."}}},
{"id":"n-0ac5fca6","guard":[["hasAny",["malawi","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Malawi":"The region name of Malawi is Eastern Africa."}}},
{"id":"n-0d7cd084","guard":[["hasAny",["australia","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Australia":"The region name of Australia is Australia and New Zealand."}}},
{"id":"n-0ddec6e4","guard":[["hasAny",["country","name","poland","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Poland":"The region name of Poland is Eastern Europe."}}},
{"id":"n-0e948e62","guard":[["hasAny",["denmark","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Denmark":"The region name of Denmark is Northern Europe."}}},
{"id":"n-114ec0b0","guard":[["hasAny",["country","name","region","sahara","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Western Sahara":"The region name of Western Sahara is Northern Africa."}}},
{"id":"n-170a2deb","guard":[["hasAny",["name","region","suriname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Suriname":"The region name of Suriname is South America."}}},
{"id":"n-1847b334","guard":[["hasAny",["name","region","spain"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Spain":"The region name of Spain is Southern Europe."}}},
{"id":"n-1d1987be","guard":[["hasAny",["gabon","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Gabon":"The region name of Gabon is Middle Africa."}}},
{"id":"n-233f2fac","guard":[["hasAny",["iceland","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Iceland":"The region name of Iceland is Northern Europe."}}},
{"id":"n-248b4cfb","guard":[["hasAny",["country","faroe","islands","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Faroe Islands":"The region name of Faroe Islands is Northern Europe."}}},
{"id":"n-28e72c25","guard":[["hasAny",["country","name","region","switzerland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Switzerland":"The region name of Switzerland is Western Europe."}}},
{"id":"n-28ed5e55","guard":[["hasAny",["name","peru","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Peru":"The region name of Peru is South America."}}},
{"id":"n-2ffab5c1","guard":[["hasAny",["country","name","region","tuvalu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Tuvalu":"The region name of Tuvalu is Western Pacific Islands."}}},
{"id":"n-30795d55","guard":[["hasAny",["country","germany","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Germany":"The region name of Germany is Western Europe."}}},
{"id":"n-30a17594","guard":[["hasAny",["lesotho","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Lesotho":"The region name of Lesotho is Southern Africa."}}},
{"id":"n-33d9b614","guard":[["hasAny",["country","islands","marshall","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Marshall Islands":"The region name of Marshall Islands is Western Pacific Islands."}}},
{"id":"n-35cafd2f","guard":[["hasAny",["country","dutch","maarten","name","part","region","sint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Sint Maarten (Dutch part)":"The region name of Sint Maarten (Dutch part) is Caribbean."}}},
{"id":"n-3631cf23","guard":[["hasAny",["belgium","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Belgium":"The region name of Belgium is Western Europe."}}},
{"id":"n-36ba5a84","guard":[["hasAny",["congo","democratic","name","region","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Democratic Republic of the Congo":"The region name of Democratic Republic of the Congo is Middle Africa."}}},
{"id":"n-3c304317","guard":[["hasAny",["country","name","region","singapore"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Singapore":"The region name of Singapore is South-eastern Asia."}}},
{"id":"n-3f1ac590","guard":[["hasAny",["islands","mariana","name","northern","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Northern Mariana Islands":"The region name of Northern Mariana Islands is Western Pacific Islands."}}},
{"id":"n-408d5456","guard":[["hasAny",["malaysia","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Malaysia":"The region name of Malaysia is South-eastern Asia."}}},
{"id":"n-41004eec","guard":[["hasAny",["name","qatar","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Qatar":"The region name of Qatar is Western Asia."}}},
{"id":"n-43a7ad99","guard":[["hasAny",["côte","divoire","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Côte d’Ivoire":"The region name of Côte d’Ivoire is Western Africa."}}},
{"id":"n-4856935b","guard":[["hasAny",["croatia","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Croatia":"The region name of Croatia is Southern Europe."}}},
{"id":"n-4c057cf7","guard":[["hasAny",["country","federated","micronesia","name","region","states"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Micronesia (Federated States of)":"The region name of Micronesia (Federated States of) is Western Pacific Islands."}}},
{"id":"n-4f878eaf","guard":[["hasAny",["bahrain","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Bahrain":"The region name of Bahrain is Western Asia."}}},
{"id":"n-54ccec7d","guard":[["hasAny",["bermuda","country","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Bermuda":"The region name of Bermuda is Northern America."}}},
{"id":"n-59a66bc6","guard":[["hasAny",["name","region","turkmenistan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Turkmenistan":"The region name of Turkmenistan is Central Asia."}}},
{"id":"n-5b74940c","guard":[["hasAny",["benin","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Benin":"The region name of Benin is Western Africa."}}},
{"id":"n-5cd399cb","guard":[["hasAny",["country","islands","name","region","states","united","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name United States Virgin Islands":"The region name of United States Virgin Islands is Caribbean."}}},
{"id":"n-604a8b2d","guard":[["hasAny",["mali","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Mali":"The region name of Mali is Western Africa."}}},
{"id":"n-6074878b","guard":[["hasAny",["country","guadeloupe","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Guadeloupe":"The region name of Guadeloupe is Caribbean."}}},
{"id":"n-613177c1","guard":[["hasAny",["britain","great","ireland","kingdom","name","northern","region","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of United Kingdom of Great Britain and Northern Ireland":"The region name of United Kingdom of Great Britain and Northern Ireland is Northern Europe."}}},
{"id":"n-6278d1e8","guard":[["hasAny",["lebanon","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Lebanon":"The region name of Lebanon is Western Asia."}}},
{"id":"n-69a964e7","guard":[["hasAny",["name","region","tonga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Tonga":"The region name of Tonga is Western Pacific Islands."}}},
{"id":"n-6e71dfc9","guard":[["hasAny",["congo","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Congo":"The region name of Congo is Middle Africa."}}},
{"id":"n-6fbb5700","guard":[["hasAny",["country","montserrat","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Montserrat":"The region name of Montserrat is Caribbean."}}},
{"id":"n-707eed6f","guard":[["hasAny",["name","region","ukraine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Ukraine":"The region name of Ukraine is Eastern Europe."}}},
{"id":"n-71a3e03a","guard":[["hasAny",["martinique","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Martinique":"The region name of Martinique is Caribbean."}}},
{"id":"n-7287bb27","guard":[["hasAny",["country","mongolia","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Mongolia":"The region name of Mongolia is Eastern Asia."}}},
{"id":"n-7370c495","guard":[["hasAny",["name","region","zambia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Zambia":"The region name of Zambia is Eastern Africa."}}},
{"id":"n-788d6518","guard":[["hasAny",["jamaica","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Jamaica":"The region name of Jamaica is Caribbean."}}},
{"id":"n-78d36b30","guard":[["hasAny",["caicos","country","islands","name","region","turks"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Turks and Caicos Islands":"The region name of Turks and Caicos Islands is Caribbean."}}},
{"id":"n-79bf4d72","guard":[["hasAny",["cameroon","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Cameroon":"The region name of Cameroon is Middle Africa."}}},
{"id":"n-7d3645a1","guard":[["hasAny",["holy","name","region","see"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Holy See":"The region name of Holy See is Southern Europe."}}},
{"id":"n-7d9227d9","guard":[["hasAny",["country","guam","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Guam":"The region name of Guam is Western Pacific Islands."}}},
{"id":"n-7db8ad94","guard":[["hasAny",["eritrea","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Eritrea":"The region name of Eritrea is Eastern Africa."}}},
{"id":"n-7e6671e6","guard":[["hasAny",["christmas","island","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Christmas Island":"The region name of Christmas Island is Australia and New Zealand."}}},
{"id":"n-866480c1","guard":[["hasAny",["bonaire","eustatius","name","region","saba","sint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Bonaire, Sint Eustatius and Saba":"The region name of Bonaire, Sint Eustatius and Saba is Caribbean."}}},
{"id":"n-8713acfa","guard":[["hasAny",["country","hungary","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Hungary":"The region name of Hungary is Eastern Europe."}}},
{"id":"n-87ae24c3","guard":[["hasAny",["country","dominica","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Dominica":"The region name of Dominica is Caribbean."}}},
{"id":"n-8e65e298","guard":[["hasAny",["name","namibia","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Namibia":"The region name of Namibia is Southern Africa."}}},
{"id":"n-90515921","guard":[["hasAny",["kyrgyzstan","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Kyrgyzstan":"The region name of Kyrgyzstan is Central Asia."}}},
{"id":"n-9285ba7f","guard":[["hasAny",["arab","name","region","republic","syrian"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Syrian Arab Republic":"The region name of Syrian Arab Republic is Western Asia."}}},
{"id":"n-95927c24","guard":[["hasAny",["korea","name","region","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Republic of Korea":"The region name of Republic of Korea is Eastern Asia."}}},
{"id":"n-95f3f7cc","guard":[["hasAny",["cook","islands","name","region"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Cook Islands":"The region name of Cook Islands is Western Pacific Islands."}}},
{"id":"n-9630f7ea","guard":[["hasAny",["country","name","region","tunisia"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Tunisia":"The region name of Tunisia is Northern Africa."}}},
{"id":"n-99842367","guard":[["hasAny",["isle","man","name","region"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Isle of Man":"The region name of Isle of Man is Northern Europe."}}},
{"id":"n-999f4268","guard":[["hasAny",["helena","name","region","saint"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Saint Helena":"The region name of Saint Helena is Western Africa."}}},
{"id":"n-9bb59fe3","guard":[["hasAny",["country","cyprus","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Cyprus":"The region name of Cyprus is Western Asia."}}},
{"id":"n-9ea795b3","guard":[["hasAny",["country","name","region","yemen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Yemen":"The region name of Yemen is Western Asia."}}},
{"id":"n-a3995ee7","guard":[["hasAny",["austria","country","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Austria":"The region name of Austria is Western Europe."}}},
{"id":"n-a6d55b24","guard":[["hasAny",["chile","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Chile":"The region name of Chile is South America."}}},
{"id":"n-a869ae0a","guard":[["hasAny",["barbados","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Barbados":"The region name of Barbados is Caribbean."}}},
{"id":"n-a896bccb","guard":[["hasAny",["country","ecuador","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Ecuador":"The region name of Ecuador is South America."}}},
{"id":"n-a959d10d","guard":[["hasAny",["country","name","panama","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Panama":"The region name of Panama is Central America."}}},
{"id":"n-aa766e91","guard":[["hasAny",["burundi","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Burundi":"The region name of Burundi is Eastern Africa."}}},
{"id":"n-acdfc9a1","guard":[["hasAny",["madagascar","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Madagascar":"The region name of Madagascar is Eastern Africa."}}},
{"id":"n-b3e599c0","guard":[["hasAny",["name","norway","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Norway":"The region name of Norway is Northern Europe."}}},
{"id":"n-b645bae3","guard":[["hasAny",["indonesia","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Indonesia":"The region name of Indonesia is South-eastern Asia."}}},
{"id":"n-bd8dca9c","guard":[["hasAny",["malta","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Malta":"The region name of Malta is Southern Europe."}}},
{"id":"n-c0f0e646","guard":[["hasAny",["greece","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Greece":"The region name of Greece is Southern Europe."}}},
{"id":"n-c1111896","guard":[["hasAny",["name","region","uruguay"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Uruguay":"The region name of Uruguay is South America."}}},
{"id":"n-c32c3afd","guard":[["hasAny",["america","name","region","states","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for United States of America":"The region name of United States of America is Northern America."}}},
{"id":"n-c87770ab","guard":[["hasAny",["bhutan","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Bhutan":"The region name of Bhutan is Southern Asia."}}},
{"id":"n-cabb40ca","guard":[["hasAny",["arabia","name","region","saudi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Saudi Arabia":"The region name of Saudi Arabia is Western Asia."}}},
{"id":"n-cbd24f4c","guard":[["hasAny",["cabo","name","region","verde"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Cabo Verde":"The region name of Cabo Verde is Western Africa."}}},
{"id":"n-cc0e80d2","guard":[["hasAny",["chad","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Chad":"The region name of Chad is Middle Africa."}}},
{"id":"n-ccf7883c","guard":[["hasAny",["country","morocco","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Morocco":"The region name of Morocco is Northern Africa."}}},
{"id":"n-d22a019b","guard":[["hasAny",["armenia","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Armenia":"The region name of Armenia is Western Asia."}}},
{"id":"n-d65e5f6e","guard":[["hasAny",["federation","name","region","russian"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Russian Federation":"The region name of Russian Federation is Eastern Europe."}}},
{"id":"n-de7749e1","guard":[["hasAny",["british","islands","name","region","virgin"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for British Virgin Islands":"The region name of British Virgin Islands is Caribbean."}}},
{"id":"n-e5369f48","guard":[["hasAny",["african","central","name","region","republic"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Central African Republic":"The region name of Central African Republic is Middle Africa."}}},
{"id":"n-e6d795a6","guard":[["hasAny",["name","region","timorleste"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Timor-Leste":"The region name of Timor-Leste is South-eastern Asia."}}},
{"id":"n-e9900bfe","guard":[["hasAny",["costa","name","region","rica"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Costa Rica":"The region name of Costa Rica is Central America."}}},
{"id":"n-ea656efb","guard":[["hasAny",["bolivarian","name","region","republic","venezuela"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Venezuela (Bolivarian Republic of)":"The region name of Venezuela (Bolivarian Republic of) is South America."}}},
{"id":"n-ec1045c2","guard":[["hasAny",["burkina","faso","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Burkina Faso":"The region name of Burkina Faso is Western Africa."}}},
{"id":"n-ee47946e","guard":[["hasAny",["georgia","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the region name for Georgia":"The region name of Georgia is Western Asia."}}},
{"id":"n-f285a66b","guard":[["hasAny",["administrative","china","country","macao","name","region","special"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name China, Macao Special Administrative Region":"The region name of China, Macao Special Administrative Region is Eastern Asia."}}},
{"id":"n-f2e8bedc","guard":[["hasAny",["country","lanka","name","region","sri"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Sri Lanka":"The region name of Sri Lanka is Southern Asia."}}},
{"id":"n-f43c8326","guard":[["hasAny",["belize","country","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Belize":"The region name of Belize is Central America."}}},
{"id":"n-f490b361","guard":[["hasAny",["country","mozambique","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Mozambique":"The region name of Mozambique is Eastern Africa."}}},
{"id":"n-f74134e3","guard":[["hasAny",["nam","name","region","viet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Viet Nam":"The region name of Viet Nam is South-eastern Asia."}}},
{"id":"n-f9c0ec18","guard":[["hasAny",["guinea","name","region"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the region name of Guinea":"The region name of Guinea is Western Africa."}}},
{"id":"n-2b577245","guard":[["hasAny",["append","bolivarian","combine","concatenate","put together"]],["has","give"]],"pyramid":["render.str",["transform.concat",{"lit":"South America"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-b0b2866c","guard":[["hasAny",["append","bolivarian","combine","concatenate","put together"]],["has","give"]],"pyramid":["render.str",["transform.concat",["sense.after",{"lit":"of"}],{"lit":"South America"}]],"mem":null},
{"id":"n-02a13ecd","guard":[["has","dominica"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Dominica":"The region name of Dominica is Caribbean."}}},
{"id":"n-02b3cabf","guard":[["has","cameroon"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Cameroon":"The region name of Cameroon is Middle Africa."}}},
{"id":"n-036899d3","guard":[["hasAny",["burkina","faso","name","region"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Burkina Faso":"The region name of Burkina Faso is Western Africa."}}},
{"id":"n-0a7b1a12","guard":[["has","croatia"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Croatia":"The region name of Croatia is Southern Europe."}}},
{"id":"n-0b2f780b","guard":[["has","cook"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Cook Islands":"The region name of Cook Islands is Western Pacific Islands."}}},
{"id":"n-0dfd4b2d","guard":[["hasAny",["isle","man","name","region"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Isle of Man":"The region name of Isle of Man is Northern Europe."}}},
{"id":"n-0e25983e","guard":[["hasAny",["arabia","name","region","saudi"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Saudi Arabia":"The region name of Saudi Arabia is Western Asia."}}},
{"id":"n-0e8c4f14","guard":[["has","tonga"],["has","give"],["has","region"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Tonga":"The region name of Tonga is Western Pacific Islands."}}},
{"id":"n-10d4b57f","guard":[["has","turkmenistan"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Turkmenistan":"The region name of Turkmenistan is Central Asia."}}},
{"id":"n-15558129","guard":[["has","tunisia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Tunisia":"The region name of Tunisia is Northern Africa."}}},
{"id":"n-163e1f0f","guard":[["has","senegal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Senegal":"The region name of Senegal is Western Africa."}}},
{"id":"n-1897d893","guard":[["hasAny",["britain","great","ireland","kingdom","name","northern","region","united"]],["has","region"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of United Kingdom of Great Britain and Northern Ireland":"The region name of United Kingdom of Great Britain and Northern Ireland is Northern Europe."}}},
{"id":"n-1c7c383b","guard":[["has","bermuda"],["words>=",10]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Bermuda":"The region name of Bermuda is Northern America."}}},
{"id":"n-2138e78f","guard":[["has","democratic"],["has","region"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Democratic Republic of the Congo":"The region name of Democratic Republic of the Congo is Middle Africa."}}},
{"id":"n-23f1f5d5","guard":[["hasAny",["bolivarian","venezuela"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Venezuela (Bolivarian Republic of)":"The region name of Venezuela (Bolivarian Republic of) is South America."}}},
{"id":"n-266ccf72","guard":[["has","georgia"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Georgia":"The region name of Georgia is Western Asia."}}},
{"id":"n-2c660146","guard":[["has","cyprus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Cyprus":"The region name of Cyprus is Western Asia."}}},
{"id":"n-36adaf85","guard":[["has","australia"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Australia":"The region name of Australia is Australia and New Zealand."}}},
{"id":"n-373a4926","guard":[["hasAny",["arab","syrian"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Syrian Arab Republic":"The region name of Syrian Arab Republic is Western Asia."}}},
{"id":"n-38a69dd8","guard":[["has","korea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Republic of Korea":"The region name of Republic of Korea is Eastern Asia."}}},
{"id":"n-396db1f2","guard":[["has","poland"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Poland":"The region name of Poland is Eastern Europe."}}},
{"id":"n-3ad90907","guard":[["has","america"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for United States of America":"The region name of United States of America is Northern America."}}},
{"id":"n-3b7f0174","guard":[["has","timorleste"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Timor-Leste":"The region name of Timor-Leste is South-eastern Asia."}}},
{"id":"n-3cc31a10","guard":[["has","greece"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Greece":"The region name of Greece is Southern Europe."}}},
{"id":"n-3cd00345","guard":[["has","eritrea"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Eritrea":"The region name of Eritrea is Eastern Africa."}}},
{"id":"n-40e424af","guard":[["has","armenia"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Armenia":"The region name of Armenia is Western Asia."}}},
{"id":"n-44475973","guard":[["has","lesotho"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Lesotho":"The region name of Lesotho is Southern Africa."}}},
{"id":"n-4573d4ff","guard":[["has","lebanon"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Lebanon":"The region name of Lebanon is Western Asia."}}},
{"id":"n-46f8861f","guard":[["has","germany"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Germany":"The region name of Germany is Western Europe."}}},
{"id":"n-4d62366c","guard":[["has","malta"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Malta":"The region name of Malta is Southern Europe."}}},
{"id":"n-4f825ee1","guard":[["hasAny",["country","dutch","maarten","name","part","region","sint"]],["has","region"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Sint Maarten (Dutch part)":"The region name of Sint Maarten (Dutch part) is Caribbean."}}},
{"id":"n-5394f6c7","guard":[["has","jamaica"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Jamaica":"The region name of Jamaica is Caribbean."}}},
{"id":"n-5bad4ac1","guard":[["has","british"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for British Virgin Islands":"The region name of British Virgin Islands is Caribbean."}}},
{"id":"n-5d1627e0","guard":[["hasAny",["lanka","sri"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Sri Lanka":"The region name of Sri Lanka is Southern Asia."}}},
{"id":"n-646aef02","guard":[["hasAny",["cabo","name","region","verde"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Cabo Verde":"The region name of Cabo Verde is Western Africa."}}},
{"id":"n-65425651","guard":[["has","ukraine"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Ukraine":"The region name of Ukraine is Eastern Europe."}}},
{"id":"n-67708d0b","guard":[["has","spain"],["has","region"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Spain":"The region name of Spain is Southern Europe."}}},
{"id":"n-6effa1e5","guard":[["has","malaysia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Malaysia":"The region name of Malaysia is South-eastern Asia."}}},
{"id":"n-71a182ca","guard":[["hasAny",["nam","name","region","viet"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Viet Nam":"The region name of Viet Nam is South-eastern Asia."}}},
{"id":"n-724f0978","guard":[["hasAny",["helena","name","region","saint"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Saint Helena":"The region name of Saint Helena is Western Africa."}}},
{"id":"n-72ef7cb8","guard":[["has","montserrat"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Montserrat":"The region name of Montserrat is Caribbean."}}},
{"id":"n-73b51b2d","guard":[["has","bhutan"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Bhutan":"The region name of Bhutan is Southern Asia."}}},
{"id":"n-756d0585","guard":[["has","guadeloupe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Guadeloupe":"The region name of Guadeloupe is Caribbean."}}},
{"id":"n-7660f1fe","guard":[["has","haiti"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Haiti":"The region name of Haiti is Caribbean."}}},
{"id":"n-78d59fdd","guard":[["has","singapore"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Singapore":"The region name of Singapore is South-eastern Asia."}}},
{"id":"n-7c00502a","guard":[["has","barbados"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Barbados":"The region name of Barbados is Caribbean."}}},
{"id":"n-7f30fd51","guard":[["has","panama"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Panama":"The region name of Panama is Central America."}}},
{"id":"n-81896fcc","guard":[["has","kyrgyzstan"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Kyrgyzstan":"The region name of Kyrgyzstan is Central Asia."}}},
{"id":"n-81967579","guard":[["has","namibia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Namibia":"The region name of Namibia is Southern Africa."}}},
{"id":"n-81bc72a8","guard":[["hasAny",["côte","divoire","name","region"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Côte d’Ivoire":"The region name of Côte d’Ivoire is Western Africa."}}},
{"id":"n-850a96ff","guard":[["has","guinea"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Guinea":"The region name of Guinea is Western Africa."}}},
{"id":"n-8816055b","guard":[["has","malawi"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Malawi":"The region name of Malawi is Eastern Africa."}}},
{"id":"n-8ce7450c","guard":[["has","mongolia"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Mongolia":"The region name of Mongolia is Eastern Asia."}}},
{"id":"n-8fbd9dbe","guard":[["has","hungary"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Hungary":"The region name of Hungary is Eastern Europe."}}},
{"id":"n-9401973c","guard":[["hasAny",["administrative","china","country","macao","name","region","special"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name China, Macao Special Administrative Region":"The region name of China, Macao Special Administrative Region is Eastern Asia."}}},
{"id":"n-963330b6","guard":[["has","martinique"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Martinique":"The region name of Martinique is Caribbean."}}},
{"id":"n-967a3e12","guard":[["has","tuvalu"],["words>=",10]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Tuvalu":"The region name of Tuvalu is Western Pacific Islands."}}},
{"id":"n-973e74ca","guard":[["hasAny",["bonaire","eustatius","name","region","saba","sint"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Bonaire, Sint Eustatius and Saba":"The region name of Bonaire, Sint Eustatius and Saba is Caribbean."}}},
{"id":"n-9cb59ab6","guard":[["hasAny",["costa","name","region","rica"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Costa Rica":"The region name of Costa Rica is Central America."}}},
{"id":"n-a6a32c48","guard":[["hasAny",["federation","name","region","russian"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Russian Federation":"The region name of Russian Federation is Eastern Europe."}}},
{"id":"n-a907b97c","guard":[["has","indonesia"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Indonesia":"The region name of Indonesia is South-eastern Asia."}}},
{"id":"n-a9a2a89d","guard":[["hasAny",["mariana","northern"]],["has","region"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Northern Mariana Islands":"The region name of Northern Mariana Islands is Western Pacific Islands."}}},
{"id":"n-ac7d6920","guard":[["has","belize"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Belize":"The region name of Belize is Central America."}}},
{"id":"n-ae6614e3","guard":[["has","mozambique"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Mozambique":"The region name of Mozambique is Eastern Africa."}}},
{"id":"n-b2b5f55d","guard":[["has","iceland"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Iceland":"The region name of Iceland is Northern Europe."}}},
{"id":"n-b88e0707","guard":[["has","benin"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Benin":"The region name of Benin is Western Africa."}}},
{"id":"n-ba76f019","guard":[["has","ecuador"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Ecuador":"The region name of Ecuador is South America."}}},
{"id":"n-ba78ed9d","guard":[["has","guam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Guam":"The region name of Guam is Western Pacific Islands."}}},
{"id":"n-baa3bb3f","guard":[["has","austria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Austria":"The region name of Austria is Western Europe."}}},
{"id":"n-bbb2f5c9","guard":[["has","yemen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Yemen":"The region name of Yemen is Western Asia."}}},
{"id":"n-bd259681","guard":[["has","belgium"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Belgium":"The region name of Belgium is Western Europe."}}},
{"id":"n-c340e4c1","guard":[["has","bahrain"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Bahrain":"The region name of Bahrain is Western Asia."}}},
{"id":"n-c4a91929","guard":[["has","suriname"],["has","region"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Suriname":"The region name of Suriname is South America."}}},
{"id":"n-c5b25f03","guard":[["has","zambia"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Zambia":"The region name of Zambia is Eastern Africa."}}},
{"id":"n-c86d62e0","guard":[["has","denmark"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Denmark":"The region name of Denmark is Northern Europe."}}},
{"id":"n-c8db8c11","guard":[["has","norway"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Norway":"The region name of Norway is Northern Europe."}}},
{"id":"n-c8f2732f","guard":[["has","qatar"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Qatar":"The region name of Qatar is Western Asia."}}},
{"id":"n-c8fa261a","guard":[["has","burundi"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Burundi":"The region name of Burundi is Eastern Africa."}}},
{"id":"n-caf55519","guard":[["has","chad"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Chad":"The region name of Chad is Middle Africa."}}},
{"id":"n-cc8cb5dd","guard":[["has","marshall"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Marshall Islands":"The region name of Marshall Islands is Western Pacific Islands."}}},
{"id":"n-ccd1f2b8","guard":[["hasAny",["country","federated","micronesia","name","region","states"]],["words>=",13]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Micronesia (Federated States of)":"The region name of Micronesia (Federated States of) is Western Pacific Islands."}}},
{"id":"n-d271d4cc","guard":[["has","switzerland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Switzerland":"The region name of Switzerland is Western Europe."}}},
{"id":"n-d3cf7a4c","guard":[["has","gabon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Gabon":"The region name of Gabon is Middle Africa."}}},
{"id":"n-d48d1e9e","guard":[["hasAny",["caicos","turks"]],["has","region"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Turks and Caicos Islands":"The region name of Turks and Caicos Islands is Caribbean."}}},
{"id":"n-d6f27512","guard":[["has","chile"],["has","region"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Chile":"The region name of Chile is South America."}}},
{"id":"n-d82789bb","guard":[["hasAny",["name","region","tobago","trinidad"]],["has","region"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Trinidad and Tobago":"The region name of Trinidad and Tobago is Caribbean."}}},
{"id":"n-da299798","guard":[["hasAny",["holy","name","region","see"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Holy See":"The region name of Holy See is Southern Europe."}}},
{"id":"n-db98c61b","guard":[["has","eswatini"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Eswatini":"The region name of Eswatini is Southern Africa."}}},
{"id":"n-e2083459","guard":[["has","india"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for India":"The region name of India is Southern Asia."}}},
{"id":"n-ea530de6","guard":[["has","morocco"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Morocco":"The region name of Morocco is Northern Africa."}}},
{"id":"n-ee552310","guard":[["has","uruguay"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Uruguay":"The region name of Uruguay is South America."}}},
{"id":"n-f452e44c","guard":[["has","mali"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Mali":"The region name of Mali is Western Africa."}}},
{"id":"n-f9e9a691","guard":[["has","madagascar"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the region name for Madagascar":"The region name of Madagascar is Eastern Africa."}}},
{"id":"n-fac93668","guard":[["has","faroe"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the region name of the country name Faroe Islands":"The region name of Faroe Islands is Northern Europe."}}},
{"id":"n-ffd5088a","guard":[["has","peru"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the region name of Peru":"The region name of Peru is South America."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the region name of Cabo Verde","expect":{"contains":["Western Africa"],"notRefusal":true}},{"q":"tell me the region name of the country name Guadeloupe","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"give the region name for Burundi","expect":{"contains":["Eastern Africa"],"notRefusal":true}},{"q":"tell me the region name of the country name Haiti","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"give the region name for Saint Helena","expect":{"contains":["Western Africa"],"notRefusal":true}},{"q":"what is the region name of Timor-Leste","expect":{"contains":["South-eastern Asia"],"notRefusal":true}},{"q":"tell me the region name of the country name Austria","expect":{"contains":["Western Europe"],"notRefusal":true}},{"q":"give the region name for Tonga","expect":{"contains":["Western Pacific Islands"],"notRefusal":true}},{"q":"what is the region name of Indonesia","expect":{"contains":["South-eastern Asia"],"notRefusal":true}},{"q":"tell me the region name of the country name United States Virgin Islands","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"what is the region name of Côte d’Ivoire","expect":{"contains":["Western Africa"],"notRefusal":true}},{"q":"what is the region name of Lesotho","expect":{"contains":["Southern Africa"],"notRefusal":true}},{"q":"tell me the region name of the country name Western Sahara","expect":{"contains":["Northern Africa"],"notRefusal":true}},{"q":"give the region name for Qatar","expect":{"contains":["Western Asia"],"notRefusal":true}},{"q":"what is the region name of Trinidad and Tobago","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"give the region name for Zambia","expect":{"contains":["Eastern Africa"],"notRefusal":true}},{"q":"tell me the region name of the country name Panama","expect":{"contains":["Central America"],"notRefusal":true}},{"q":"tell me the region name of the country name Ecuador","expect":{"contains":["South America"],"notRefusal":true}},{"q":"tell me the region name of the country name Senegal","expect":{"contains":["Western Africa"],"notRefusal":true}},{"q":"tell me the region name of the country name Dominica","expect":{"contains":["Caribbean"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
