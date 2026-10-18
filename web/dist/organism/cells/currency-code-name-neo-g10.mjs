// currency-code-name-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"currency-code-name-neo-g10","class":"currency-code-name","generation":10,"lane":"neo","grownFrom":["which currency has the code AWG","what currency is SSP","what currency is GMD","which currency has the code TJS","what currency is LAK","what currency is AOA","which currency has the code DZD","name the currency with the ISO code PEN","which currency has the code ISK","which currency has the code MGA","name the currency with the ISO code TOP","what currency is WST","what currency is EUR","name the currency with the ISO code BYN","what currency is DJF","what currency is GYD","name the currency with the ISO code VES","which currency has the code RUB","name the currency with the ISO code HKD","which currency has the code GEL"],"version":1});

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
knowLoad([{"id":"datasets-currency-codes","columns":["currency code","currency"],"n":280,"cols":[{"f":"0EUR|0USD|0XCD|0|0AUD|0XOF|0INR|0NOK|0XAF|0NZD|0XCG|0DKK|0XPF|0GBP|0ZAR|0CHF|0MAD|0|0|0VES|0XUA|0AFN|0DZD|0XAD|0ARS|1MD|1WG|1UD|3|3|3|3|3|3|1ZN|0BSD|1HD|0THB|0PAB|0BBD|1YN|1ZD|1MD|1OB|0VED|0XBA|2B|2D|2C|0BRL|1ND|1IF|0XOF|3|3|3|3|3|3|1AF|3|3|3|3|1PF|3|0CVE|1AD|0XCG|0KYD|0CLP|0XTS|0COP|0KMF|0CDF|0BAM|0NIO|0CRC|1UP|1ZK|0GMD|0DKK|3|0MKD|0DJF|0STN|0DOP|0VND|0XCD|3|3|3|3|3|3|0EGP|0SVC|0ETB|1UR|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|0FKP|1JD|0HUF|0GHS|1IP|0XAU|0HTG|0PYG|0GNF|1YD|0HKD|0UAH|0ISK|1NR|1RR|1QD|0JMD|1OD|0KES|0PGK|0KWD|0AOA|0MMK|0LAK|0GEL|0LBP|0ALL|0HNL|0SLE|0LRD|1YD|0SZL|0LSL|0MGA|1WK|1YR|1UR|1XN|2V|1DL|1AD|1ZN|0BOV|0NGN|0ERN|0NAD|1PR|0ILS|0TWD|0NZD|3|3|3|0BTN|0KPW|0NOK|3|0MRU|0PKR|0XPD|0MOP|0TOP|0UYU|0PHP|0XPT|0GBP|3|3|0BWP|0QAR|0GTQ|0ZAR|3|0OMR|0KHR|0RON|0MVR|0IDR|0RUB|1WF|0XDR|0SHP|1AR|0RSD|0SCR|0XAG|0SGD|0PEN|0SBD|0KGS|0SOS|0TJS|0SSP|0LKR|0XSU|0SDG|1RD|1EK|0CHF|0SYP|0BDT|0WST|0TZS|0KZT|0XXX|0TTD|0MNT|0TND|1RY|1MT|0AED|0USD|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|2N|1GX|1YW|0CLF|1OU|0UYI|1ZS|0VUV|0CHE|2W|0KRW|0YER|0JPY|0CNY|0ZMW|1WG|0PLN","sep":"|"},{"f":"0Euro|0US Dollar|0East Caribbean Dollar|0No universal currency|0Australian Dollar|0CFA Franc BCEAO|0Indian Rupee|0Norwegian Krone|0CFA Franc BEAC|0New Zealand Dollar|0Caribbean Guilder|0Danish Krone|0CFP Franc|0Pound Sterling|0Rand|0Swiss Franc|0Moroccan Dirham|0No universal currency|l|0Bolívar Soberano|0ADB Unit of Account|1fghani|1lgerian Dinar|1rab Accounting Dinar|2gentine Peso|2menian Dram|2uban Florin|1ustralian Dollar|h|h|h|h|h|h|1zerbaijan Manat|0Bahamian Dollar|3raini Dinar|3t|2lboa|2rbados Dollar|1elarusian Ruble|3ize Dollar|2rmudian Dollar|1oliviano|3ívar Soberano|2nd Markets Unit European Composite Unit (EURCO)|rMonetary Unit (E.M.U.-6)|rUnit of Account 17 (E.U.A.-17)|zAccount 9 (E.U.A.-9)|1razilian Real|2unei Dollar|1urundi Franc|0CFA Franc BCEAO|f|f|f|f|f|f|bEAC|e|e|e|e|2P Franc|9|1abo Verde Escudo|2nadian Dollar|2ribbean Guilder|2yman Islands Dollar|1hilean Peso|1odes specifically reserved for testing purposes|2lombian Peso|2morian Franc|2ngolese Franc|3vertible Mark|2rdoba Oro|2sta Rican Colon|1uban Peso|1zech Koruna|0Dalasi|2nish Krone|c|1enar|1jibouti Franc|1obra|2minican Peso|2ng|0East Caribbean Dollar|l|l|l|l|l|l|1gyptian Pound|1l Salvador Colon|1thiopian Birr|1uro|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|4|0Falkland Islands Pound|1iji Dollar|1orint|0Ghana Cedi|1ibraltar Pound|1old|2urde|1uarani|2inean Franc|2yana Dollar|0Hong Kong Dollar|1ryvnia|0Iceland Krona|1ndian Rupee|1ranian Rial|3qi Dinar|0Jamaican Dollar|1ordanian Dinar|0Kenyan Shilling|1ina|1uwaiti Dinar|1wanza|1yat|0Lao Kip|2ri|1ebanese Pound|2k|2mpira|2one|1iberian Dollar|3yan Dinar|2langeni|1oti|0Malagasy Ariary|4wi Kwacha|4ysian Ringgit|2uritius Rupee|1exican Peso|8Unidad de Inversion (UDI)|1oldovan Leu|2roccan Dirham|2zambique Metical|1vdol|0Naira|2kfa|2mibia Dollar|1epalese Rupee|2w Israeli Sheqel|4Taiwan Dollar|4Zealand Dollar|i|i|i|1gultrum|1orth Korean Won|3wegian Krone|f|0Ouguiya|0Pakistan Rupee|2lladium|2taca|2’anga|1eso Uruguayo|1hilippine Peso|1latinum|1ound Sterling|e|e|1ula|0Qatari Rial|1uetzal|0Rand|4|1ial Omani|2el|1omanian Leu|1ufiyaa|2piah|2ssian Ruble|1wanda Franc|0SDR (Special Drawing Right)|1aint Helena Pound|2udi Riyal|1erbian Dinar|2ychelles Rupee|1ilver|2ngapore Dollar|1ol|3omon Islands Dollar|2m|3ali Shilling|3oni|2uth Sudanese Pound|1ri Lanka Rupee|1ucre|2danese Pound|2rinam Dollar|1wedish Krona|2iss Franc|1yrian Pound|0Taka|2la|2nzanian Shilling|1enge|1he codes assigned for transactions where no currency is involved|1rinidad and Tobago Dollar|1ugrik|2nisian Dinar|2rkish Lira|4menistan New Manat|0UAE Dirham|1S Dollar|9|9|9|9|9|9|9|9|9|9|9|9|9|9|9|9|9|9 (Next day)|1ganda Shilling|1nidad Previsional|7de Fomento|aValor Real|1ruguay Peso en Unidades Indexadas (UI)|1zbekistan Sum|0Vatu|0WIR Euro|4Franc|1on|0Yemeni Rial|2n|1uan Renminbi|0Zambian Kwacha|1imbabwe Gold|1loty","sep":"|"}]}]);
const COLONY = [
{"id":"n-3c62a912","guard":[["hasAny",["currency","item number","nth","position"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-9a389b25","guard":[["hasAny",["currency","item number","nth","position"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.code",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-e2182dbe","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.code",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-ea8dd7c4","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-11a53f54","guard":[["hasAny",["currency","invert case","item number","nth","position","swap case","toggle case"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-497c5ca2","guard":[["hasAny",["currency","invert case","item number","nth","position","swap case","toggle case"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.code",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-515259bc","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-579c2b15","guard":[["hasAny",["capitalise","capitalize","capitalize each word","currency","item number","nth","position","title case"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.code",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-827ef1e4","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-8b4e8efc","guard":[["hasAny",["currency","item number","lower case","lowercase","nth","position","small letters"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.code",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-8dc85408","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.code",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-9c59bfca","guard":[["hasAny",["currency","item number","lower case","lowercase","nth","position","small letters"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-a6d07683","guard":[["hasAny",["capitalise","capitalize","capitalize each word","currency","item number","nth","position","title case"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-b7d6bccb","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.code",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-c90305cf","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.code",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-ca8ae716","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.code",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-d345f543","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-e9d14ff2","guard":[["hasAny",["capital letters","capitals","currency","item number","nth","position","upper case","uppercase"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-f770bf0d","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-fe80ad46","guard":[["hasAny",["capital letters","capitals","currency","item number","nth","position","upper case","uppercase"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.code",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-8ab49078","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-ccf84e7a","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.code",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-ed096753","guard":[["hasAny",["capitalise","capitalize","capitalize each word","currency","invert case","item number","nth","position","swap case","title case","toggle case"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-f0e65174","guard":[["hasAny",["capitalise","capitalize","capitalize each word","currency","invert case","item number","nth","position","swap case","title case","toggle case"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.code",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-0db80e2c","guard":[["hasAny",["currency","item number","nth","position"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.and",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-33882824","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.and",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-ba88f243","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-e3417881","guard":[["hasAny",["currency","item number","nth","position"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-0a602671","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-31689412","guard":[["hasAny",["currency","item number","nth","position"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-83afb8cf","guard":[["hasAny",["currency","item number","lower case","lowercase","nth","position","small letters"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-b54d2206","guard":[["hasAny",["capital letters","capitals","currency","item number","nth","position","upper case","uppercase"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-b8ecf6b0","guard":[["hasAny",["currency","invert case","item number","nth","position","swap case","toggle case"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-db54627a","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-e0cde85f","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-e1159e50","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-e28f3e17","guard":[["hasAny",["capitalise","capitalize","capitalize each word","currency","item number","nth","position","title case"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-ea988d9b","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-51c527fa","guard":[["hasAny",["class name","currency","item number","nth","pascal case","pascalcase","position","upper camel case"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-5b50ba00","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-9e6f2695","guard":[["hasAny",["camel case","camelcase","currency","item number","lower camel case","nth","position"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-c1f7ae91","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","year","zmw"]]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-b14993da","guard":[["has","currency"],["not",["has","of"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code AWG":"The code AWG stands for the Aruban Florin.","what currency is SSP":"The code SSP stands for the South Sudanese Pound.","what currency is GMD":"The code GMD stands for the Dalasi.","which currency has the code TJS":"The code TJS stands for the Somoni.","what currency is LAK":"The code LAK stands for the Lao Kip.","what currency is AOA":"The code AOA stands for the Kwanza.","which currency has the code DZD":"The code DZD stands for the Algerian Dinar.","name the currency with the ISO code PEN":"The code PEN stands for the Sol.","which currency has the code ISK":"The code ISK stands for the Iceland Krona.","which currency has the code MGA":"The code MGA stands for the Malagasy Ariary.","name the currency with the ISO code TOP":"The code TOP stands for the Pa’anga.","what currency is WST":"The code WST stands for the Tala.","what currency is EUR":"The code EUR stands for the Euro.","name the currency with the ISO code BYN":"The code BYN stands for the Belarusian Ruble.","what currency is DJF":"The code DJF stands for the Djibouti Franc.","what currency is GYD":"The code GYD stands for the Guyana Dollar.","name the currency with the ISO code VES":"The code VES stands for the Bolívar Soberano.","which currency has the code RUB":"The code RUB stands for the Russian Ruble.","name the currency with the ISO code HKD":"The code HKD stands for the Hong Kong Dollar.","which currency has the code GEL":"The code GEL stands for the Lari.","name the currency with the ISO code RON":"The code RON stands for the Romanian Leu.","which currency has the code UGX":"The code UGX stands for the Uganda Shilling.","what currency is COU":"The code COU stands for the Unidad de Valor Real.","name the currency with the ISO code XBB":"The code XBB stands for the Bond Markets Unit European Monetary Unit (E.M.U.-6).","which currency has the code SDG":"The code SDG stands for the Sudanese Pound.","name the currency with the ISO code BDT":"The code BDT stands for the Taka.","which currency has the code XCD":"The code XCD stands for the East Caribbean Dollar.","name the currency with the ISO code GHS":"The code GHS stands for the Ghana Cedi.","what currency is BMD":"The code BMD stands for the Bermudian Dollar.","which currency has the code GBP":"The code GBP stands for the Pound Sterling.","which currency has the code UYI":"The code UYI stands for the Uruguay Peso en Unidades Indexadas (UI).","what currency is CUP":"The code CUP stands for the Cuban Peso.","name the currency with the ISO code XBD":"The code XBD stands for the Bond Markets Unit European Unit of Account 17 (E.U.A.-17).","name the currency with the ISO code EGP":"The code EGP stands for the Egyptian Pound.","which currency has the code NGN":"The code NGN stands for the Naira.","name the currency with the ISO code BRL":"The code BRL stands for the Brazilian Real.","what currency is SLE":"The code SLE stands for the Leone.","what currency is XDR":"The code XDR stands for the SDR (Special Drawing Right).","name the currency with the ISO code VED":"The code VED stands for the Bolívar Soberano.","which currency has the code CZK":"The code CZK stands for the Czech Koruna.","which currency has the code BTN":"The code BTN stands for the Ngultrum.","name the currency with the ISO code MMK":"The code MMK stands for the Kyat.","which currency has the code MVR":"The code MVR stands for the Rufiyaa.","name the currency with the ISO code MYR":"The code MYR stands for the Malaysian Ringgit.","what currency is XAF":"The code XAF stands for the CFA Franc BEAC.","which currency has the code NPR":"The code NPR stands for the Nepalese Rupee.","name the currency with the ISO code PYG":"The code PYG stands for the Guarani.","name the currency with the ISO code CHF":"The code CHF stands for the Swiss Franc.","name the currency with the ISO code CLF":"The code CLF stands for the Unidad de Fomento.","which currency has the code XAD":"The code XAD stands for the Arab Accounting Dinar.","what currency is PHP":"The code PHP stands for the Philippine Peso.","which currency has the code SRD":"The code SRD stands for the Surinam Dollar.","name the currency with the ISO code UYW":"The code UYW stands for the Unidad Previsional.","name the currency with the ISO code IRR":"The code IRR stands for the Iranian Rial.","what currency is HUF":"The code HUF stands for the Forint.","which currency has the code XBA":"The code XBA stands for the Bond Markets Unit European Composite Unit (EURCO).","which currency has the code PGK":"The code PGK stands for the Kina.","which currency has the code CNY":"The code CNY stands for the Yuan Renminbi.","what currency is XAG":"The code XAG stands for the Silver.","which currency has the code UYU":"The code UYU stands for the Peso Uruguayo.","name the currency with the ISO code CHW":"The code CHW stands for the WIR Franc.","what currency is RSD":"The code RSD stands for the Serbian Dinar.","what currency is XPF":"The code XPF stands for the CFP Franc.","which currency has the code XBC":"The code XBC stands for the Bond Markets Unit European Unit of Account 9 (E.U.A.-9).","which currency has the code KMF":"The code KMF stands for the Comorian Franc.","name the currency with the ISO code BIF":"The code BIF stands for the Burundi Franc.","name the currency with the ISO code OMR":"The code OMR stands for the Rial Omani.","name the currency with the ISO code STN":"The code STN stands for the Dobra.","what currency is KES":"The code KES stands for the Kenyan Shilling.","what currency is AMD":"The code AMD stands for the Armenian Dram.","what currency is USN":"The code USN stands for the US Dollar (Next day).","which currency has the code XPD":"The code XPD stands for the Palladium.","name the currency with the ISO code SZL":"The code SZL stands for the Lilangeni.","what currency is LSL":"The code LSL stands for the Loti.","what currency is SGD":"The code SGD stands for the Singapore Dollar.","name the currency with the ISO code TND":"The code TND stands for the Tunisian Dinar.","name the currency with the ISO code KGS":"The code KGS stands for the Som.","which currency has the code LBP":"The code LBP stands for the Lebanese Pound.","what currency is SVC":"The code SVC stands for the El Salvador Colon.","name the currency with the ISO code GNF":"The code GNF stands for the Guinean Franc.","name the currency with the ISO code SEK":"The code SEK stands for the Swedish Krona.","name the currency with the ISO code FKP":"The code FKP stands for the Falkland Islands Pound.","which currency has the code COP":"The code COP stands for the Colombian Peso.","name the currency with the ISO code TZS":"The code TZS stands for the Tanzanian Shilling.","which currency has the code MDL":"The code MDL stands for the Moldovan Leu.","which currency has the code NZD":"The code NZD stands for the New Zealand Dollar.","what currency is CLP":"The code CLP stands for the Chilean Peso.","what currency is MXN":"The code MXN stands for the Mexican Peso.","which currency has the code MOP":"The code MOP stands for the Pataca.","which currency has the code INR":"The code INR stands for the Indian Rupee.","which currency has the code KRW":"The code KRW stands for the Won.","which currency has the code PAB":"The code PAB stands for the Balboa.","what currency is SOS":"The code SOS stands for the Somali Shilling.","what currency is KWD":"The code KWD stands for the Kuwaiti Dinar.","what currency is ERN":"The code ERN stands for the Nakfa.","what currency is MNT":"The code MNT stands for the Tugrik.","name the currency with the ISO code XXX":"The code XXX stands for the The codes assigned for transactions where no currency is involved.","what currency is JPY":"The code JPY stands for the Yen.","name the currency with the ISO code TTD":"The code TTD stands for the Trinidad and Tobago Dollar.","what currency is PKR":"The code PKR stands for the Pakistan Rupee."}}},
{"id":"n-51b9913e","guard":[["has","currency"],["not",["has","of"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"currency"}]]],"mem":{"table":{"has the code AWG":"The code AWG stands for the Aruban Florin.","is SSP":"The code SSP stands for the South Sudanese Pound.","is GMD":"The code GMD stands for the Dalasi.","has the code TJS":"The code TJS stands for the Somoni.","is LAK":"The code LAK stands for the Lao Kip.","is AOA":"The code AOA stands for the Kwanza.","has the code DZD":"The code DZD stands for the Algerian Dinar.","with the ISO code PEN":"The code PEN stands for the Sol.","has the code ISK":"The code ISK stands for the Iceland Krona.","has the code MGA":"The code MGA stands for the Malagasy Ariary.","with the ISO code TOP":"The code TOP stands for the Pa’anga.","is WST":"The code WST stands for the Tala.","is EUR":"The code EUR stands for the Euro.","with the ISO code BYN":"The code BYN stands for the Belarusian Ruble.","is DJF":"The code DJF stands for the Djibouti Franc.","is GYD":"The code GYD stands for the Guyana Dollar.","with the ISO code VES":"The code VES stands for the Bolívar Soberano.","has the code RUB":"The code RUB stands for the Russian Ruble.","with the ISO code HKD":"The code HKD stands for the Hong Kong Dollar.","has the code GEL":"The code GEL stands for the Lari.","with the ISO code RON":"The code RON stands for the Romanian Leu.","has the code UGX":"The code UGX stands for the Uganda Shilling.","is COU":"The code COU stands for the Unidad de Valor Real.","with the ISO code XBB":"The code XBB stands for the Bond Markets Unit European Monetary Unit (E.M.U.-6).","has the code SDG":"The code SDG stands for the Sudanese Pound.","with the ISO code BDT":"The code BDT stands for the Taka.","has the code XCD":"The code XCD stands for the East Caribbean Dollar.","with the ISO code GHS":"The code GHS stands for the Ghana Cedi.","is BMD":"The code BMD stands for the Bermudian Dollar.","has the code GBP":"The code GBP stands for the Pound Sterling.","has the code UYI":"The code UYI stands for the Uruguay Peso en Unidades Indexadas (UI).","is CUP":"The code CUP stands for the Cuban Peso.","with the ISO code XBD":"The code XBD stands for the Bond Markets Unit European Unit of Account 17 (E.U.A.-17).","with the ISO code EGP":"The code EGP stands for the Egyptian Pound.","has the code NGN":"The code NGN stands for the Naira.","with the ISO code BRL":"The code BRL stands for the Brazilian Real.","is SLE":"The code SLE stands for the Leone.","is XDR":"The code XDR stands for the SDR (Special Drawing Right).","with the ISO code VED":"The code VED stands for the Bolívar Soberano.","has the code CZK":"The code CZK stands for the Czech Koruna.","has the code BTN":"The code BTN stands for the Ngultrum.","with the ISO code MMK":"The code MMK stands for the Kyat.","has the code MVR":"The code MVR stands for the Rufiyaa.","with the ISO code MYR":"The code MYR stands for the Malaysian Ringgit.","is XAF":"The code XAF stands for the CFA Franc BEAC.","has the code NPR":"The code NPR stands for the Nepalese Rupee.","with the ISO code PYG":"The code PYG stands for the Guarani.","with the ISO code CHF":"The code CHF stands for the Swiss Franc.","with the ISO code CLF":"The code CLF stands for the Unidad de Fomento.","has the code XAD":"The code XAD stands for the Arab Accounting Dinar.","is PHP":"The code PHP stands for the Philippine Peso.","has the code SRD":"The code SRD stands for the Surinam Dollar.","with the ISO code UYW":"The code UYW stands for the Unidad Previsional.","with the ISO code IRR":"The code IRR stands for the Iranian Rial.","is HUF":"The code HUF stands for the Forint.","has the code XBA":"The code XBA stands for the Bond Markets Unit European Composite Unit (EURCO).","has the code PGK":"The code PGK stands for the Kina.","has the code CNY":"The code CNY stands for the Yuan Renminbi.","is XAG":"The code XAG stands for the Silver.","has the code UYU":"The code UYU stands for the Peso Uruguayo.","with the ISO code CHW":"The code CHW stands for the WIR Franc.","is RSD":"The code RSD stands for the Serbian Dinar.","is XPF":"The code XPF stands for the CFP Franc.","has the code XBC":"The code XBC stands for the Bond Markets Unit European Unit of Account 9 (E.U.A.-9).","has the code KMF":"The code KMF stands for the Comorian Franc.","with the ISO code BIF":"The code BIF stands for the Burundi Franc.","with the ISO code OMR":"The code OMR stands for the Rial Omani.","with the ISO code STN":"The code STN stands for the Dobra.","is KES":"The code KES stands for the Kenyan Shilling.","is AMD":"The code AMD stands for the Armenian Dram.","is USN":"The code USN stands for the US Dollar (Next day).","has the code XPD":"The code XPD stands for the Palladium.","with the ISO code SZL":"The code SZL stands for the Lilangeni.","is LSL":"The code LSL stands for the Loti.","is SGD":"The code SGD stands for the Singapore Dollar.","with the ISO code TND":"The code TND stands for the Tunisian Dinar.","with the ISO code KGS":"The code KGS stands for the Som.","has the code LBP":"The code LBP stands for the Lebanese Pound.","is SVC":"The code SVC stands for the El Salvador Colon.","with the ISO code GNF":"The code GNF stands for the Guinean Franc.","with the ISO code SEK":"The code SEK stands for the Swedish Krona.","with the ISO code FKP":"The code FKP stands for the Falkland Islands Pound.","has the code COP":"The code COP stands for the Colombian Peso.","with the ISO code TZS":"The code TZS stands for the Tanzanian Shilling.","has the code MDL":"The code MDL stands for the Moldovan Leu.","has the code NZD":"The code NZD stands for the New Zealand Dollar.","is CLP":"The code CLP stands for the Chilean Peso.","is MXN":"The code MXN stands for the Mexican Peso.","has the code MOP":"The code MOP stands for the Pataca.","has the code INR":"The code INR stands for the Indian Rupee.","has the code KRW":"The code KRW stands for the Won.","has the code PAB":"The code PAB stands for the Balboa.","is SOS":"The code SOS stands for the Somali Shilling.","is KWD":"The code KWD stands for the Kuwaiti Dinar.","is ERN":"The code ERN stands for the Nakfa.","is MNT":"The code MNT stands for the Tugrik.","with the ISO code XXX":"The code XXX stands for the The codes assigned for transactions where no currency is involved.","is JPY":"The code JPY stands for the Yen.","with the ISO code TTD":"The code TTD stands for the Trinidad and Tobago Dollar.","is PKR":"The code PKR stands for the Pakistan Rupee."}}},
{"id":"n-67088af6","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","xxx","year","zmw"]]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":"code"}]],"mem":null},
{"id":"n-a938d93d","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","xxx","year","zmw"]]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":"code"}]],"mem":null},
{"id":"n-e0b406ff","guard":[["not",["hasAny",["act","aed","airline","airport","album","all","alpha","also","artist","asiago","author","bbd","bedlam","bob","bwp","bzd","caps","captions","character","characters","city","combined","company","consecutive","country","cryptocurrency","cve","date","dipiero","domain","emoji","english","episode","extension","featuring","gossip","htg","id","instrument","iso2","judge1","kyd","lang","language","long","mkd","mxv","n3","of","profile","publication","query","scene","security","selection","shortname","shp","slug","sort","state","subregion","subtype","suname","sutype","table","title","type","uah","unique","week","xxx","year","zmw"]]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":"code"}]],"mem":null},
{"id":"n-41ec310a","guard":[["hasAny",["currency","delete","item number","nth","position","strip out","without"]],["not",["has","country"]],["not",["has","of"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":"Bolívar Soberano"}]],"mem":null},
{"id":"n-69afafca","guard":[["hasAny",["amd","aoa","awg","bdt","bif","bmd","btn","byn","chf","clf","clp","cop","cou","cup","czk","egp","eur","fkp","gbp","gel","gmd","gnf","gyd","inr","irr","isk","item number","kes","kgs","krw","kwd","lak","lbp","mdl","mga","mmk","mnt","myr","ngn","normalise","normalize","nth","nzd","omr","pen","pgk","position","pyg","ron","rsd","sdg","sek","sgd","simplify the text","sle","srd","ssp","stn","svc","szl","tjs","tnd","ttd","tzs","ugx","uyu","uyw","ved","ves","xaf","xag","xcd","xpd","xpf","xxx"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1}]],"mem":null},
{"id":"n-cf25f26c","guard":[["hasAny",["amd","aoa","awg","bdt","bif","bmd","btn","byn","chf","clf","clp","cop","cou","cup","czk","egp","eur","fkp","gbp","gel","gmd","gnf","gyd","inr","irr","isk","item number","kes","kgs","krw","kwd","lak","lbp","mdl","mga","mmk","mnt","myr","ngn","normalise","normalize","nth","nzd","omr","pen","pgk","position","pyg","ron","rsd","sdg","sek","sgd","simplify the text","sle","srd","ssp","stn","svc","szl","tjs","tnd","ttd","tzs","ugx","uyu","uyw","ved","ves","xaf","xag","xcd","xpd","xpf","xxx"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1}]],"mem":null},
{"id":"n-34299857","guard":[["hasAny",["amd","aoa","awg","bdt","bif","bmd","btn","byn","chf","clf","clp","cop","cou","cup","czk","egp","eur","fkp","gbp","gel","gmd","gnf","gyd","inr","irr","isk","item number","kes","kgs","krw","kwd","lak","lbp","mdl","mga","mmk","mnt","myr","ngn","normalise","normalize","nth","nzd","omr","pen","pgk","position","pyg","ron","rsd","sdg","sek","sgd","simplify the text","sle","srd","ssp","stn","svc","szl","tjs","tnd","tzs","ugx","uyu","uyw","ved","ves","xaf","xag","xcd","xpd","xpf"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":2}]],"mem":null},
{"id":"n-b343fca2","guard":[["hasAny",["amd","aoa","awg","bdt","bif","bmd","btn","byn","chf","clf","clp","cop","cou","cup","czk","egp","eur","fkp","gbp","gel","gmd","gnf","gyd","inr","irr","isk","item number","kes","kgs","krw","kwd","lak","lbp","mdl","mga","mmk","mnt","myr","ngn","normalise","normalize","nth","nzd","omr","pen","pgk","position","pyg","ron","rsd","sdg","sek","sgd","simplify the text","sle","srd","ssp","stn","svc","szl","tjs","tnd","tzs","ugx","uyu","uyw","ved","ves","xaf","xag","xcd","xpd","xpf"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":2}]],"mem":null},
{"id":"n-088ba9dc","guard":[["hasAny",["code","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-e02e452b","guard":[["hasAny",["code","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-4d80c995","guard":[["hasAny",["amd","awg","bif","bmd","brl","byn","clf","clp","cny","cop","cou","czk","djf","dzd","egp","fkp","gbp","gnf","gyd","hkd","inr","irr","isk","item number","kes","kmf","kwd","lbp","leading zeros","mdl","mga","mxn","myr","npr","nth","nzd","pad","pad with","padded to","php","pkr","position","ron","rsd","rub","sdg","sek","sgd","sos","srd","ssp","svc","tnd","ttd","tzs","ugx","usn","uyi","uyu","uyw","ved","ves","xad","xaf","xba","xbb","xbc","xbd","xcd","xdr","xxx","zero pad"]],["not",["has","of"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-8777990c","guard":[["hasAny",["amd","awg","bif","bmd","brl","byn","clf","clp","cny","cop","cou","czk","djf","dzd","egp","fkp","gbp","gnf","gyd","hkd","inr","irr","isk","item number","kes","kmf","kwd","lbp","leading zeros","mdl","mga","mxn","myr","npr","nth","nzd","pad","pad with","padded to","php","pkr","position","ron","rsd","rub","sdg","sek","sgd","sos","srd","ssp","svc","tnd","ttd","tzs","ugx","usn","uyi","uyu","uyw","ved","ves","xad","xaf","xba","xbb","xbc","xbd","xcd","xdr","xxx","zero pad"]],["not",["has","of"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-403f25f7","guard":[["hasAny",["amd","awg","bif","bmd","brl","byn","clf","clp","cny","cop","cou","czk","djf","dzd","egp","fkp","gbp","gnf","gyd","hkd","inr","irr","isk","item number","kes","kmf","kwd","lbp","leading zeros","mdl","mga","mxn","myr","npr","nth","nzd","pad","pad with","padded to","php","pkr","position","ron","rsd","rub","sdg","sek","sgd","sos","srd","ssp","svc","tnd","ttd","tzs","ugx","usn","uyi","uyu","uyw","ved","ves","xad","xaf","xba","xbb","xbc","xbd","xcd","xdr","xxx","zero pad"]],["not",["has","of"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]]],"mem":null},
{"id":"n-f3d4cc2b","guard":[["hasAny",["amd","awg","bif","bmd","brl","byn","clf","clp","cny","cop","cou","czk","djf","dzd","egp","fkp","gbp","gnf","gyd","hkd","inr","irr","isk","item number","kes","kmf","kwd","lbp","leading zeros","mdl","mga","mxn","myr","npr","nth","nzd","pad","pad with","padded to","php","pkr","position","ron","rsd","rub","sdg","sek","sgd","sos","srd","ssp","svc","tnd","ttd","tzs","ugx","usn","uyi","uyu","uyw","ved","ves","xad","xaf","xba","xbb","xbc","xbd","xcd","xdr","xxx","zero pad"]],["not",["has","of"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]]],"mem":null},
{"id":"n-657935a6","guard":[["hasAny",["amd","aoa","awg","bif","bmd","btn","byn","chf","clf","clp","cop","cou","cup","czk","egp","eur","fkp","gbp","gmd","gnf","gyd","inr","irr","isk","item number","kes","kwd","lak","lbp","leading zeros","mdl","mga","mnt","myr","nth","nzd","omr","pad","pad with","padded to","position","ron","rsd","sdg","sek","sgd","sle","srd","ssp","svc","szl","tjs","tnd","ttd","tzs","ugx","usn","uyu","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-8adb7f13","guard":[["hasAny",["amd","aoa","awg","bif","bmd","btn","byn","chf","clf","clp","cop","cou","cup","czk","egp","eur","fkp","gbp","gmd","gnf","gyd","inr","irr","isk","item number","kes","kwd","lak","lbp","leading zeros","mdl","mga","mnt","myr","nth","nzd","omr","pad","pad with","padded to","position","ron","rsd","sdg","sek","sgd","sle","srd","ssp","svc","szl","tjs","tnd","ttd","tzs","ugx","usn","uyu","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-7b5f44e3","guard":[["hasAny",["amd","aoa","awg","bif","bmd","btn","byn","chf","clf","clp","cop","cou","cup","czk","egp","eur","fkp","gbp","gmd","gnf","gyd","inr","irr","isk","item number","kes","kwd","lak","lbp","leading zeros","mdl","mga","mnt","myr","nth","nzd","omr","pad","pad with","padded to","position","ron","rsd","sdg","sek","sgd","sle","srd","ssp","svc","szl","tjs","tnd","ttd","tzs","ugx","usn","uyu","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]]],"mem":null},
{"id":"n-e2432da1","guard":[["hasAny",["amd","aoa","awg","bif","bmd","btn","byn","chf","clf","clp","cop","cou","cup","czk","egp","eur","fkp","gbp","gmd","gnf","gyd","inr","irr","isk","item number","kes","kwd","lak","lbp","leading zeros","mdl","mga","mnt","myr","nth","nzd","omr","pad","pad with","padded to","position","ron","rsd","sdg","sek","sgd","sle","srd","ssp","svc","szl","tjs","tnd","ttd","tzs","ugx","usn","uyu","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]]],"mem":null},
{"id":"n-3651bd59","guard":[["hasAny",["bdt","bmd","brl","btn","byn","chf","chw","clf","clp","cny","czk","djf","dzd","fkp","gbp","ghs","gmd","gnf","gyd","hkd","item number","jpy","kgs","kmf","krw","kwd","lbp","lsl","mdl","mmk","mnt","mvr","mxn","myr","ngn","no vowels","npr","nth","nzd","pgk","php","pkr","position","pyg","remove vowels","rsd","sdg","sgd","srd","ssp","stn","svc","szl","tjs","tnd","ttd","tzs","without vowels","wst","xbb","xbc","xbd","xcd","xdr","xpd","xpf","xxx"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["transform.noVowels",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-770edfed","guard":[["hasAny",["amd","awg","bif","bmd","byn","chf","clf","clp","cop","cou","cup","czk","egp","fkp","gbp","gnf","gyd","inr","irr","isk","item number","kes","kwd","lbp","leading zeros","mdl","mga","myr","nth","nzd","omr","pad","pad with","padded to","position","ron","rsd","sdg","sek","sgd","srd","ssp","svc","tnd","ttd","tzs","ugx","usn","uyu","uyw","ved","ves","xaf","xba","xbd","xcd","xdr","xxx","zero pad"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-ef0bd17a","guard":[["hasAny",["amd","awg","bif","bmd","byn","chf","clf","clp","cop","cou","cup","czk","egp","fkp","gbp","gnf","gyd","inr","irr","isk","item number","kes","kwd","lbp","leading zeros","mdl","mga","myr","nth","nzd","omr","pad","pad with","padded to","position","ron","rsd","sdg","sek","sgd","srd","ssp","svc","tnd","ttd","tzs","ugx","usn","uyu","uyw","ved","ves","xaf","xba","xbd","xcd","xdr","xxx","zero pad"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-ee8a1e21","guard":[["hasAny",["amd","awg","bif","bmd","byn","chf","clf","clp","cop","cou","cup","czk","egp","fkp","gbp","gnf","gyd","inr","irr","isk","item number","kes","kwd","lbp","leading zeros","mdl","mga","myr","nth","nzd","omr","pad","pad with","padded to","position","ron","rsd","sdg","sek","sgd","srd","ssp","svc","tnd","ttd","tzs","ugx","usn","uyu","uyw","ved","ves","xaf","xba","xbd","xcd","xdr","xxx","zero pad"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]]],"mem":null},
{"id":"n-ef024ac7","guard":[["hasAny",["amd","awg","bif","bmd","byn","chf","clf","clp","cop","cou","cup","czk","egp","fkp","gbp","gnf","gyd","inr","irr","isk","item number","kes","kwd","lbp","leading zeros","mdl","mga","myr","nth","nzd","omr","pad","pad with","padded to","position","ron","rsd","sdg","sek","sgd","srd","ssp","svc","tnd","ttd","tzs","ugx","usn","uyu","uyw","ved","ves","xaf","xba","xbd","xcd","xdr","xxx","zero pad"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]]],"mem":null},
{"id":"n-27631be4","guard":[["hasAny",["amd","aoa","awg","bdt","bif","bmd","btn","byn","clp","cop","cup","czk","egp","eur","fkp","gbp","gel","gmd","inr","irr","isk","item number","kes","kgs","krw","lbp","mmk","mnt","myr","ngn","normalise","normalize","nth","pen","pgk","position","pyg","simplify the text","sle","stn","szl","tjs","uyu","ved","ves","xag","xpd","xpf"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":3}]],"mem":null},
{"id":"n-459a47d6","guard":[["hasAny",["amd","aoa","awg","bdt","bif","bmd","btn","byn","clp","cop","cup","czk","egp","eur","fkp","gbp","gel","gmd","inr","irr","isk","item number","kes","kgs","krw","lbp","mmk","mnt","myr","ngn","normalise","normalize","nth","pen","pgk","position","pyg","simplify the text","sle","stn","szl","tjs","uyu","ved","ves","xag","xpd","xpf"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":3}]],"mem":null},
{"id":"n-8dbed916","guard":[["hasAny",["element","has","item number","nth","position"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-5a9e37b2","guard":[["hasAny",["camel case","camelcase","element","has","item number","lower camel case","nth","position"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.camel",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-954ff0a8","guard":[["hasAny",["has","item number","nth","position"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-f1a61a25","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.pascal",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-1379b061","guard":[["hasAny",["has","item number","nth","position"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-18ae7b6c","guard":[["hasAny",["has","item number","nth","position"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-c5dcf770","guard":[["hasAny",["has","item number","nth","position"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-397c7ca7","guard":[["hasAny",["capital letters","capitals","has","item number","nth","position","upper case","uppercase"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-65288757","guard":[["hasAny",["has","invert case","item number","nth","position","swap case","toggle case"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-9951ccfa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","has","item number","nth","position","title case"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-99e1e25a","guard":[["hasAny",["has","item number","lower case","lowercase","nth","position","small letters"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-ba5a65d0","guard":[["hasAny",["has","item number","nth","position"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-d99374dd","guard":[["hasAny",["camel case","camelcase","has","item number","lower camel case","nth","position"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.camel",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-effa74da","guard":[["hasAny",["class name","has","item number","nth","pascal case","pascalcase","position","upper camel case"]],["words<=",6],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-46e7b165","guard":[["hasAny",["currency","item number","nth","position"]],["words<=",4]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["sense.after",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-7401efe0","guard":[["hasAny",["currency","delete","item number","nth","position","strip out","without"]],["words<=",4]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-9cc973fa","guard":[["hasAny",["currency","delete","item number","nth","position","strip out","without"]],["words<=",4]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-a7c77711","guard":[["hasAny",["amd","aoa","bmd","clp","cou","cup","djf","ern","eur","gmd","gyd","huf","item number","jpy","kes","kwd","lak","lsl","mnt","mxn","nth","php","pkr","position","rsd","sgd","shortest","shortest one","shortest word","sle","sos","ssp","svc","usn","wst","xaf","xag","xdr","xpf"]],["words<=",4]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-9b513530","guard":[["hasAny",["camel case","camelcase","currency","item number","lower camel case","nth","position"]],["words<=",4]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["transform.camel",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-cdc1c1a6","guard":[["hasAny",["amd","aoa","bmd","clp","cou","cup","djf","ern","eur","gmd","gyd","huf","item number","jpy","kes","kwd","lak","lsl","mnt","mxn","nth","php","pkr","position","rsd","sgd","sle","sos","ssp","svc","usn","wst","xaf","xag","xdr","xpf"]],["words<=",4]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-c3b73f1e","guard":[["hasAny",["element","iso","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-43bdd839","guard":[["hasAny",["class name","element","iso","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-ba897ffd","guard":[["hasAny",["camel case","camelcase","element","iso","item number","lower camel case","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.camel",["sense.after",{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-5bc9efd4","guard":[["hasAny",["iso","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-c0d049d0","guard":[["hasAny",["iso","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-f482e1f3","guard":[["hasAny",["each word","element","iso","item number","nth","position","split into words","words"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-213ebe65","guard":[["hasAny",["capital letters","capitals","iso","item number","nth","position","upper case","uppercase"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-686d4d51","guard":[["hasAny",["iso","item number","lower case","lowercase","nth","position","small letters"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-958a9384","guard":[["hasAny",["invert case","iso","item number","nth","position","swap case","toggle case"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-aa691a9d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iso","item number","nth","position","title case"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-bef8af8d","guard":[["hasAny",["iso","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-20d4280e","guard":[["hasAny",["class name","iso","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-45fe1253","guard":[["hasAny",["camel case","camelcase","iso","item number","lower camel case","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.camel",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-a1a9a752","guard":[["has","currency"],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"SSP":"The code SSP stands for the South Sudanese Pound.","GMD":"The code GMD stands for the Dalasi.","LAK":"The code LAK stands for the Lao Kip.","AOA":"The code AOA stands for the Kwanza.","WST":"The code WST stands for the Tala.","EUR":"The code EUR stands for the Euro.","DJF":"The code DJF stands for the Djibouti Franc.","GYD":"The code GYD stands for the Guyana Dollar.","COU":"The code COU stands for the Unidad de Valor Real.","BMD":"The code BMD stands for the Bermudian Dollar.","CUP":"The code CUP stands for the Cuban Peso.","SLE":"The code SLE stands for the Leone.","XDR":"The code XDR stands for the SDR (Special Drawing Right).","XAF":"The code XAF stands for the CFA Franc BEAC.","PHP":"The code PHP stands for the Philippine Peso.","HUF":"The code HUF stands for the Forint.","XAG":"The code XAG stands for the Silver.","RSD":"The code RSD stands for the Serbian Dinar.","XPF":"The code XPF stands for the CFP Franc.","KES":"The code KES stands for the Kenyan Shilling.","AMD":"The code AMD stands for the Armenian Dram.","USN":"The code USN stands for the US Dollar (Next day).","LSL":"The code LSL stands for the Loti.","SGD":"The code SGD stands for the Singapore Dollar.","SVC":"The code SVC stands for the El Salvador Colon.","CLP":"The code CLP stands for the Chilean Peso.","MXN":"The code MXN stands for the Mexican Peso.","SOS":"The code SOS stands for the Somali Shilling.","KWD":"The code KWD stands for the Kuwaiti Dinar.","ERN":"The code ERN stands for the Nakfa.","MNT":"The code MNT stands for the Tugrik.","JPY":"The code JPY stands for the Yen.","PKR":"The code PKR stands for the Pakistan Rupee."}}},
{"id":"n-146916d3","guard":[["hasAny",["aoa","bdt","btn","characters from","chf","clp","cup","czk","eur","gel","gmd","inr","irr","item number","kgs","krw","lak","letters from to","mdl","mmk","mnt","ngn","nth","omr","pen","pgk","position","pyg","ron","sle","slice of the text","stn","substring","szl","tjs","top","xag","xpd","xpf"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-9d204714","guard":[["hasAny",["aoa","bdt","btn","characters from","chf","clp","cup","czk","eur","gel","gmd","inr","irr","item number","kgs","krw","lak","letters from to","mdl","mmk","mnt","ngn","nth","omr","pen","pgk","position","pyg","ron","sle","slice of the text","stn","substring","szl","tjs","top","xag","xpd","xpf"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-6915f7e9","guard":[["hasAny",["amd","bif","bmd","btn","chf","clf","cou","czk","eur","gbp","isk","item number","kes","kwd","lbp","leading zeros","myr","nth","nzd","pad","pad with","padded to","position","svc","top","usn","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-896f477c","guard":[["hasAny",["amd","bif","bmd","btn","chf","clf","cou","czk","eur","gbp","isk","item number","kes","kwd","lbp","leading zeros","myr","nth","nzd","pad","pad with","padded to","position","svc","top","usn","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-862bff1b","guard":[["hasAny",["amd","bif","bmd","btn","chf","clf","cou","czk","eur","gbp","isk","item number","kes","kwd","lbp","leading zeros","myr","nth","nzd","pad","pad with","padded to","position","svc","top","usn","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":4},["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]]],"mem":null},
{"id":"n-c402d82f","guard":[["hasAny",["amd","bif","bmd","btn","chf","clf","cou","czk","eur","gbp","isk","item number","kes","kwd","lbp","leading zeros","myr","nth","nzd","pad","pad with","padded to","position","svc","top","usn","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":4},["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]]],"mem":null},
{"id":"n-324019f6","guard":[["hasAny",["amd","bif","bmd","btn","chf","clf","cou","czk","gbp","isk","item number","kes","kwd","lbp","leading zeros","myr","nth","nzd","pad","pad with","padded to","position","svc","top","usn","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-bca9a223","guard":[["hasAny",["amd","bif","bmd","btn","chf","clf","cou","czk","gbp","isk","item number","kes","kwd","lbp","leading zeros","myr","nth","nzd","pad","pad with","padded to","position","svc","top","usn","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-a485a8b8","guard":[["hasAny",["amd","bif","bmd","btn","chf","clf","cou","czk","gbp","isk","item number","kes","kwd","lbp","leading zeros","myr","nth","nzd","pad","pad with","padded to","position","svc","top","usn","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":5},["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]]],"mem":null},
{"id":"n-eb447e17","guard":[["hasAny",["amd","bif","bmd","btn","chf","clf","cou","czk","gbp","isk","item number","kes","kwd","lbp","leading zeros","myr","nth","nzd","pad","pad with","padded to","position","svc","top","usn","uyw","ved","ves","xaf","xag","xba","xbd","xcd","xdr","xpd","xpf","xxx","zero pad"]],["has","currency"]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":5},["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}]]],"mem":null},
{"id":"n-2f9c4f34","guard":[["hasAny",["aoa","bdt","btn","class name","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pascal case","pascalcase","pen","pgk","position","pyg","sle","stn","szl","tjs","upper camel case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-41b95c91","guard":[["hasAny",["aoa","bdt","btn","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","snake case","snakecase","stn","szl","tjs","underscores","variable name","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-66ef8b66","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-7a99f2a6","guard":[["hasAny",["aoa","bdt","btn","dashes","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-7c7691bf","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-951239ce","guard":[["hasAny",["aoa","bdt","btn","dashes","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-b3044a9a","guard":[["hasAny",["aoa","bdt","btn","class name","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pascal case","pascalcase","pen","pgk","position","pyg","sle","stn","szl","tjs","upper camel case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-c8bdf7c7","guard":[["hasAny",["aoa","bdt","btn","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","snake case","snakecase","stn","szl","tjs","underscores","variable name","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-09495095","guard":[["hasAny",["aoa","bdt","btn","ern","eur","gel","gmd","huf","invert case","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","snake case","snakecase","stn","swap case","szl","tjs","toggle case","underscores","variable name","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-129176aa","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","words backwards","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-1433a00c","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","invert case","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","swap case","szl","tjs","toggle case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-19877107","guard":[["hasAny",["aoa","bdt","btn","class name","ern","eur","gel","gmd","huf","invert case","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pascal case","pascalcase","pen","pgk","position","pyg","sle","stn","swap case","szl","tjs","toggle case","upper camel case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-1d20bbef","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lower case","lowercase","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","small letters","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-1dc05f66","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","words backwards","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-203b9b10","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","capital letters","capitals","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","upper case","uppercase","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-2273293e","guard":[["hasAny",["aoa","bdt","btn","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","reverse the words","reverse word order","sle","snake case","snakecase","stn","szl","tjs","underscores","variable name","words backwards","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-2325c052","guard":[["hasAny",["aoa","bdt","btn","capitalise","capitalize","capitalize each word","dashes","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","title case","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-236fbdbe","guard":[["hasAny",["aoa","bdt","btn","class name","ern","eur","gel","gmd","huf","invert case","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pascal case","pascalcase","pen","pgk","position","pyg","sle","stn","swap case","szl","tjs","toggle case","upper camel case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-347891b3","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","capital letters","capitals","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","upper case","uppercase","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-3815807d","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","capitalise","capitalize","capitalize each word","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","title case","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-39aec25f","guard":[["hasAny",["aoa","bdt","btn","class name","ern","eur","gel","gmd","huf","invert case","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pascal case","pascalcase","pen","pgk","position","pyg","sle","stn","swap case","szl","tjs","toggle case","upper camel case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-542434ab","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","invert case","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","swap case","szl","tjs","toggle case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-59faac5e","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","invert case","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","swap case","szl","tjs","toggle case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-67024464","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","capitalise","capitalize","capitalize each word","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","title case","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-6b677970","guard":[["hasAny",["aoa","bdt","btn","dashes","each word","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.lines",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-764b5f63","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","dashes","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.kebab",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-78614a5d","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","invert case","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","swap case","szl","tjs","toggle case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-7d27e6d6","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","snake case","snakecase","stn","szl","tjs","underscores","variable name","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.snake",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-7de7fd7a","guard":[["hasAny",["aoa","bdt","btn","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","reverse the words","reverse word order","sle","snake case","snakecase","stn","szl","tjs","underscores","variable name","words backwards","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-8a9f95b1","guard":[["hasAny",["aoa","bdt","btn","ern","eur","gel","gmd","huf","invert case","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","snake case","snakecase","stn","swap case","szl","tjs","toggle case","underscores","variable name","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-9351152b","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","dashes","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.kebab",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-950f9f3a","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lower case","lowercase","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","small letters","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-9de292a8","guard":[["hasAny",["aoa","bdt","btn","capitalise","capitalize","capitalize each word","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","snake case","snakecase","stn","szl","title case","tjs","underscores","variable name","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-af96a6fa","guard":[["hasAny",["aoa","bdt","btn","dashes","each word","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.list",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-bbe8f48d","guard":[["hasAny",["aoa","bdt","btn","class name","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pascal case","pascalcase","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","upper camel case","words backwards","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-c65c9413","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","class name","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pascal case","pascalcase","pen","pgk","position","pyg","sle","stn","szl","tjs","upper camel case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.pascal",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-c82aae40","guard":[["hasAny",["aoa","bdt","btn","class name","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pascal case","pascalcase","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","upper camel case","words backwards","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-d90dcacd","guard":[["hasAny",["aoa","bdt","btn","dashes","ern","eur","gel","gmd","huf","hyphens","invert case","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","swap case","szl","tjs","toggle case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-db2ff362","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.camel",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-deb93ef2","guard":[["hasAny",["aoa","bdt","btn","class name","ern","eur","gel","gmd","huf","invert case","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pascal case","pascalcase","pen","pgk","position","pyg","sle","stn","swap case","szl","tjs","toggle case","upper camel case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-ded401f9","guard":[["hasAny",["aoa","bdt","btn","dashes","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","words backwards","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-e15fd048","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","class name","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pascal case","pascalcase","pen","pgk","position","pyg","sle","stn","szl","tjs","upper camel case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.pascal",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-e6cbaf86","guard":[["hasAny",["aoa","bdt","btn","dashes","each word","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.and",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-eaf4a304","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","snake case","snakecase","stn","szl","tjs","underscores","variable name","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.snake",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-f1bbcb2e","guard":[["hasAny",["aoa","bdt","btn","dashes","ern","eur","gel","gmd","huf","hyphens","invert case","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","swap case","szl","tjs","toggle case","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-f86dcefc","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.camel",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-fd55675e","guard":[["hasAny",["aoa","bdt","btn","dashes","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","words backwards","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-fd90f6cc","guard":[["hasAny",["aoa","bdt","btn","capitalise","capitalize","capitalize each word","dashes","ern","eur","gel","gmd","huf","hyphens","item number","jpy","kebab case","kebabcase","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","title case","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-fdb264dc","guard":[["hasAny",["aoa","bdt","btn","capitalise","capitalize","capitalize each word","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","snake case","snakecase","stn","szl","title case","tjs","underscores","variable name","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-2cfdcdfd","guard":[["hasAny",["aoa","bdt","btn","camel case","camelcase","ern","eur","gel","gmd","huf","item number","jpy","kgs","krw","lower camel case","lsl","mmk","mnt","mop","mvr","ngn","nth","pab","pen","pgk","position","pyg","sle","stn","szl","tjs","wst","xag","xpd"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-546f5152","guard":[["hasAny",["aoa","bdt","btn","characters from","cup","eur","gel","gmd","item number","kgs","krw","lak","letters from to","mmk","mnt","ngn","nth","omr","pen","pgk","position","pyg","sle","slice of the text","stn","substring","szl","tjs","top","xag","xpd","xpf"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-b839b17a","guard":[["hasAny",["aoa","bdt","btn","characters from","cup","eur","gel","gmd","item number","kgs","krw","lak","letters from to","mmk","mnt","ngn","nth","omr","pen","pgk","position","pyg","sle","slice of the text","stn","substring","szl","tjs","top","xag","xpd","xpf"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-01477a65","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","eur","item number","kes","kgs","kwd","myr","nth","position","separate by","split","split by","svc","top","usn","uyw","ved","ves","xaf","xag","xbd","xdr","xpf"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":"code"}]],"mem":null},
{"id":"n-6a441283","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","eur","item number","kes","kgs","kwd","myr","nth","position","separate by","split","split by","svc","top","usn","uyw","ved","ves","xaf","xag","xbd","xdr","xpf"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":"code"}]],"mem":null},
{"id":"n-834cdfad","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","delete","eur","item number","kes","kgs","kwd","myr","nth","position","strip out","svc","top","usn","uyw","ved","ves","without","xaf","xag","xbd","xdr","xpf"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":"code"}]],"mem":null},
{"id":"n-c71f8f52","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","delete","eur","item number","kes","kgs","kwd","myr","nth","position","strip out","svc","top","usn","uyw","ved","ves","without","xaf","xag","xbd","xdr","xpf"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":"code"}]],"mem":null},
{"id":"n-cf657a7a","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","eur","item number","kes","kgs","kwd","myr","nth","position","separate by","split","split by","svc","top","usn","uyw","ved","ves","xaf","xag","xbd","xdr","xpf"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":"code"}]],"mem":null},
{"id":"n-38b9dbd9","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","delete","eur","item number","kes","kgs","kwd","myr","nth","position","strip out","svc","top","usn","uyw","ved","ves","without","xaf","xag","xbd","xdr","xpf"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-3d3fb9b6","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","delete","eur","item number","kes","kgs","kwd","myr","nth","position","strip out","svc","top","usn","uyw","ved","ves","without","xaf","xag","xbd","xdr","xpf"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7611608d","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","eur","item number","kes","kgs","kwd","myr","nth","position","separate by","split","split by","svc","top","usn","uyw","ved","ves","xaf","xag","xbd","xdr","xpf"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-8cfa6292","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","eur","item number","kes","kgs","kwd","myr","nth","position","separate by","split","split by","svc","top","usn","uyw","ved","ves","xaf","xag","xbd","xdr","xpf"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-9d5b22c8","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","eur","item number","kes","kgs","kwd","myr","nth","position","separate by","split","split by","svc","top","usn","uyw","ved","ves","xaf","xag","xbd","xdr","xpf"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-0be06a9d","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":4}]],"mem":null},
{"id":"n-1820fd1d","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":5}]],"mem":null},
{"id":"n-1ad885d2","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":5}]],"mem":null},
{"id":"n-28ec4f0b","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":10}]],"mem":null},
{"id":"n-2f79ac89","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":4}]],"mem":null},
{"id":"n-3819bf78","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-3d40dbdc","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":3}]],"mem":null},
{"id":"n-41d406f6","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":4}]],"mem":null},
{"id":"n-5703d5fc","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":2}]],"mem":null},
{"id":"n-71ddbff1","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":10}]],"mem":null},
{"id":"n-86dffd33","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":1}]],"mem":null},
{"id":"n-8c58463a","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":2}]],"mem":null},
{"id":"n-9d99b534","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":10}]],"mem":null},
{"id":"n-9ec6c425","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":5}]],"mem":null},
{"id":"n-b182f0c3","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":3}]],"mem":null},
{"id":"n-b5257f05","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-c89daff8","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":2}]],"mem":null},
{"id":"n-e70f6029","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],{"lit":3}]],"mem":null},
{"id":"n-efa84eed","guard":[["hasAny",["aoa","bdt","btn","each word","eur","first n","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","take","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-3f3b3a11","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-6ec038ec","guard":[["hasAny",["aoa","bdt","btn","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-9914a0d0","guard":[["hasAny",["aoa","bdt","btn","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-ca07c881","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-cb58b087","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-0980dbb4","guard":[["hasAny",["aoa","bdt","btn","eur","gel","gmd","item number","kgs","krw","lower case","lowercase","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","small letters","stn","szl","tjs","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-09f63814","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","split into words","stn","szl","tjs","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-1bf9ef9d","guard":[["hasAny",["aoa","backwards","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse","reverse order","reversed","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-1d9830ee","guard":[["hasAny",["aoa","bdt","btn","capital letters","capitals","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","top","upper case","uppercase","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-23a1e73d","guard":[["hasAny",["aoa","bdt","btn","eur","gel","gmd","item number","kgs","krw","lower case","lowercase","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","small letters","stn","szl","tjs","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-2ef62661","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","longest","longest one","longest word","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-2f34618a","guard":[["hasAny",["aoa","bdt","btn","eur","gel","gmd","invert case","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","swap case","szl","tjs","toggle case","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-2f797d82","guard":[["hasAny",["aoa","bdt","btn","capital letters","capitals","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","upper case","uppercase","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-366d672e","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","split into words","stn","szl","tjs","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-3c805a30","guard":[["hasAny",["aoa","bdt","btn","capitalise","capitalize","capitalize each word","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","title case","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-4a42a48c","guard":[["hasAny",["aoa","bdt","btn","distinct","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","remove duplicates","sle","split into words","stn","szl","tjs","top","without repeats","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-4d5c5cdc","guard":[["hasAny",["a to z","alphabetical","alphabetize","aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-50f2c98c","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","lower case","lowercase","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","small letters","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-68bc332e","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","longest","longest one","longest word","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-71dba7b4","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","shortest","shortest one","shortest word","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-72dbd0ee","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","lower case","lowercase","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","small letters","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-7530640c","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","invert case","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","swap case","szl","tjs","toggle case","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-76a15900","guard":[["hasAny",["amd","bif","bmd","chf","clf","cou","delete","eur","item number","kes","kgs","kwd","myr","nth","position","strip out","svc","top","usn","uyw","without","xaf","xag","xbd","xdr","xpf","xxx"]],["has","currency"],["not",["has","bam"]],["not",["has","bbd"]],["not",["has","bob"]],["not",["has","bsd"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":"Bolívar Soberano"}]],"mem":null},
{"id":"n-7f729dc4","guard":[["hasAny",["aoa","bdt","btn","distinct","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","remove duplicates","sle","split into words","stn","szl","tjs","top","without repeats","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-848ef74c","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","invert case","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","swap case","szl","tjs","toggle case","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-8ab1ad1c","guard":[["hasAny",["aoa","bdt","btn","distinct","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","remove duplicates","sle","split into words","stn","szl","tjs","top","without repeats","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-930068e6","guard":[["hasAny",["aoa","bdt","btn","capitalise","capitalize","capitalize each word","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","title case","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-9708232b","guard":[["hasAny",["aoa","bdt","btn","capital letters","capitals","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","top","upper case","uppercase","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-9d062a06","guard":[["hasAny",["aoa","bdt","btn","eur","gel","gmd","invert case","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","swap case","szl","tjs","toggle case","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-9e58f13d","guard":[["hasAny",["aoa","bdt","btn","capitalise","capitalize","capitalize each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","title case","tjs","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-abde2cbe","guard":[["hasAny",["aoa","bdt","btn","capitalise","capitalize","capitalize each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","title case","tjs","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-b914cd47","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","shortest","shortest one","shortest word","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-bb4869fc","guard":[["hasAny",["a to z","alphabetical","alphabetize","aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-c02577e8","guard":[["hasAny",["aoa","bdt","btn","capital letters","capitals","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","upper case","uppercase","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-c709cdc5","guard":[["hasAny",["a to z","alphabetical","alphabetize","aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-ce93bcee","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","split into words","stn","szl","tjs","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-ced0509b","guard":[["hasAny",["aoa","backwards","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse","reverse order","reversed","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-d1d67be4","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","lower case","lowercase","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","small letters","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-eb256301","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","invert case","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","swap case","szl","tjs","toggle case","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-eff9bc60","guard":[["hasAny",["aoa","bdt","btn","capitalise","capitalize","capitalize each word","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","title case","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.list",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-f4381588","guard":[["hasAny",["aoa","bdt","btn","capital letters","capitals","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","upper case","uppercase","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.and",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-fb91cadb","guard":[["hasAny",["aoa","backwards","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse","reverse order","reversed","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-e73a672b","guard":[["hasAny",["aoa","bdt","btn","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","reverse the words","reverse word order","sle","stn","szl","tjs","top","words backwards","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-e37d59d5","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-f76bc4df","guard":[["hasAny",["aoa","bdt","btn","each word","eur","gel","gmd","item number","kgs","krw","mmk","mnt","ngn","nth","pen","pgk","position","pyg","sle","split into words","stn","szl","tjs","top","xag","xpd"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the ",{"slot":1},"."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-48d2fb6d","guard":[["hasAny",["bdt","characters from","ern","eur","gel","item number","jpy","kgs","krw","letters from to","lsl","mmk","ngn","nth","pen","pgk","position","sle","slice of the text","stn","substring","wst"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-e56e508a","guard":[["hasAny",["bdt","characters from","ern","eur","gel","item number","jpy","kgs","krw","letters from to","lsl","mmk","ngn","nth","pen","pgk","position","sle","slice of the text","stn","substring","wst"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-62cea7d4","guard":[["hasAny",["bdt","characters from","eur","gel","item number","kgs","krw","letters from to","mmk","ngn","nth","pen","pgk","position","pyg","slice of the text","stn","substring","tjs","top"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-8df8c70a","guard":[["hasAny",["bdt","characters from","eur","gel","item number","kgs","krw","letters from to","mmk","ngn","nth","pen","pgk","position","pyg","slice of the text","stn","substring","tjs","top"]],["has","currency"],["not",["has","country"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-76759ff6","guard":[["hasAny",["bdt","characters from","eur","gel","item number","jpy","kgs","krw","letters from to","lsl","mmk","nth","pen","pgk","position","slice of the text","substring","wst"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},{"lit":4}]],"mem":null},
{"id":"n-b5c0a3e6","guard":[["hasAny",["bdt","characters from","eur","gel","item number","jpy","kgs","krw","letters from to","lsl","mmk","nth","pen","pgk","position","slice of the text","substring","wst"]],["not",["has","of"]],["not",["has","country"]],["has","currency"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},{"lit":4}]],"mem":null},
{"id":"n-70fe89e6","guard":[["hasAny",["btn","camel case","camelcase","gel","item number","krw","lower camel case","mop","mvr","ngn","nth","pab","pgk","position","tjs","xpd"]],["has","has"],["not",["has","country"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-b6dd2595","guard":[["hasAny",["btn","gel","item number","krw","mop","mvr","ngn","nth","pab","pgk","position","reverse the words","reverse word order","tjs","words backwards","xpd"]],["has","has"],["not",["has","country"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-7e9095d3","guard":[["hasAny",["btn","each word","gel","item number","krw","mop","mvr","ngn","nth","pab","pgk","position","split into words","tjs","xpd"]],["has","has"],["not",["has","country"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-838e5324","guard":[["hasAny",["btn","each word","gel","item number","krw","mop","mvr","ngn","nth","pab","pgk","position","split into words","tjs","xpd"]],["has","has"],["not",["has","country"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-75a2bf7f","guard":[["hasAny",["bdt","item number","kgs","mmk","nth","pen","position","pyg","reverse the words","reverse word order","stn","szl","top","words backwards"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-2191d1cf","guard":[["hasAny",["bdt","each word","item number","kgs","mmk","nth","pen","position","pyg","split into words","stn","szl","top"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-a5f72507","guard":[["hasAny",["bdt","each word","item number","kgs","mmk","nth","pen","position","pyg","split into words","stn","szl","top"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-d4c443b7","guard":[["hasAny",["bdt","camel case","camelcase","item number","kgs","lower camel case","mmk","nth","pen","position","pyg","stn","szl"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-733812a2","guard":[["hasAny",["characters from","item number","jpy","kgs","krw","letters from to","nth","pen","position","slice of the text","substring"]],["not",["has","of"]],["not",["has","country"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},{"lit":3}]],"mem":null},
{"id":"n-c7e13844","guard":[["hasAny",["characters from","item number","jpy","kgs","krw","letters from to","nth","pen","position","slice of the text","substring"]],["not",["has","of"]],["not",["has","country"]]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],{"lit":1},{"lit":3}]],"mem":null},
{"id":"n-f202cbeb","guard":[["hasAny",["item number","nth","position","ved","ves"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bolívar Soberano."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-3b605917","guard":[["hasAny",["code","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","country"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.roman"]]],"mem":null},
{"id":"n-9d242629","guard":[["hasAny",["code","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","country"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.roman"]]],"mem":null},
{"id":"n-62d4b3d2","guard":[["hasAny",["ved","ves"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bolívar Soberano."]},["sense.lastWord"]],"mem":null},
{"id":"n-1a5f7bb7","guard":[["hasAny",["delete","remove","strip out","ved","ves","without"]]],"pyramid":["render.code",["transform.remove",{"lit":"Bolívar Soberano"},["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-9fdff69b","guard":[["hasAny",["delete","remove","strip out","ved","ves","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Bolívar Soberano"},["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-a466fc3e","guard":[["hasAny",["element","item number","nth","position","ved","ves"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bolívar Soberano."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-148dbe61","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","position","title case","ved","ves"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bolívar Soberano."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-610d5649","guard":[["hasAny",["element","item number","lower case","lowercase","nth","position","small letters","ved","ves"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bolívar Soberano."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-5c8e7c4d","guard":[["hasAny",["each word","element","item number","nth","position","split into words","ved","ves","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bolívar Soberano."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-0148a5d5","guard":[["has","gmd"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Dalasi."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-09d0362b","guard":[["has","wst"],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Tala."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-0b0f7f71","guard":[["has","bmd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bermudian Dollar."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-107fbdce","guard":[["has","clp"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Chilean Peso."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-181dde90","guard":[["has","huf"],["not",["has","the"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Forint."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-228af247","guard":[["has","djf"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Djibouti Franc."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-2f225e04","guard":[["has","sos"],["not",["has","the"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Somali Shilling."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-2fe73296","guard":[["has","kes"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kenyan Shilling."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-30c5993a","guard":[["has","jpy"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Yen."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-4b3f342d","guard":[["has","ern"],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Nakfa."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-5fd8485a","guard":[["has","cup"],["words<=",4]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Cuban Peso."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-632d6aa1","guard":[["has","lak"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Lao Kip."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-743521dd","guard":[["has","xdr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the SDR (Special Drawing Right)."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-74930be5","guard":[["has","kwd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kuwaiti Dinar."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-77270daa","guard":[["has","mxn"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Mexican Peso."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-936a2e48","guard":[["has","ssp"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the South Sudanese Pound."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-96493d1c","guard":[["has","xag"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Silver."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-9d805f61","guard":[["has","mnt"],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Tugrik."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-a13c4851","guard":[["has","gyd"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guyana Dollar."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-a5ba079d","guard":[["has","xpf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFP Franc."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-a7530842","guard":[["has","sgd"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Singapore Dollar."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-a77ae8d3","guard":[["has","eur"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Euro."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-c419b8db","guard":[["has","usn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the US Dollar (Next day)."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-ca67af6b","guard":[["has","pkr"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Pakistan Rupee."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-d030c829","guard":[["has","amd"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Armenian Dram."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-d1315b62","guard":[["has","php"],["words<=",4]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Philippine Peso."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-d5f4e3ff","guard":[["has","svc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the El Salvador Colon."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-e30d8986","guard":[["has","rsd"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Serbian Dinar."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-e453093e","guard":[["has","lsl"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Loti."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-eaffa9cc","guard":[["has","cou"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad de Valor Real."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-eff584cf","guard":[["has","aoa"],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kwanza."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-f05e2878","guard":[["has","xaf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFA Franc BEAC."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-f0de94a1","guard":[["has","sle"],["not",["has","the"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Leone."]},["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-0487485e","guard":[["hasAny",["item number","nth","position","uyi"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Uruguay Peso en Unidades Indexadas (UI)."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-04a178b2","guard":[["hasAny",["gel","item number","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Lari."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-06b5dd7d","guard":[["hasAny",["item number","nth","pen","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sol."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-082a1145","guard":[["hasAny",["item number","nth","position","pyg"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Guarani."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-0f3f4611","guard":[["hasAny",["item number","nth","position","sdg"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sudanese Pound."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-13e54c98","guard":[["hasAny",["item number","nth","position","tnd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Tunisian Dinar."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-14e2a59c","guard":[["hasAny",["ghs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Ghana Cedi."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-14f4dc0f","guard":[["hasAny",["item number","nth","position","ugx"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Uganda Shilling."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-186b74a1","guard":[["hasAny",["item number","nth","position","top"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Pa’anga."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-1bfb024a","guard":[["hasAny",["item number","nth","position","stn"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Dobra."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-27138a4d","guard":[["hasAny",["isk","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iceland Krona."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-2ee09df3","guard":[["hasAny",["item number","kgs","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Som."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-3590e24e","guard":[["hasAny",["item number","kmf","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Comorian Franc."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-3b64f9f3","guard":[["hasAny",["item number","krw","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Won."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-3bd4b3fe","guard":[["hasAny",["item number","nth","nzd","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the New Zealand Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-3cab6db3","guard":[["hasAny",["fkp","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Falkland Islands Pound."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-3cb4995d","guard":[["hasAny",["item number","nth","position","xbb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bond Markets Unit European Monetary Unit (E.M.U.-6)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-3f8c1574","guard":[["hasAny",["item number","nth","omr","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Rial Omani."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-40fc24ce","guard":[["hasAny",["item number","nth","position","tjs"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Somoni."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-43a26dfc","guard":[["hasAny",["item number","nth","position","rub"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Russian Ruble."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-4591b114","guard":[["hasAny",["item number","nth","position","xxx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the The codes assigned for transactions where no currency is involved."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-4b6e8a78","guard":[["hasAny",["item number","nth","position","sek"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Swedish Krona."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-5226738d","guard":[["hasAny",["czk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Czech Koruna."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-5866fffe","guard":[["hasAny",["item number","nth","position","szl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Lilangeni."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-5afbedc9","guard":[["hasAny",["cop","item number","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Colombian Peso."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-66992875","guard":[["hasAny",["item number","mop","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Pataca."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-6911ea69","guard":[["hasAny",["item number","mga","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Malagasy Ariary."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-6e060041","guard":[["hasAny",["item number","nth","position","xad"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Arab Accounting Dinar."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-74996aa3","guard":[["hasAny",["item number","nth","position","srd"]],["has","currency"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Surinam Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-74efd8e5","guard":[["hasAny",["item number","nth","position","xbd"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bond Markets Unit European Unit of Account 17 (E.U.A.-17)."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-82415918","guard":[["hasAny",["item number","nth","position","tzs"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Tanzanian Shilling."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-861c2be4","guard":[["hasAny",["egp","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Egyptian Pound."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-8972fc5b","guard":[["hasAny",["irr","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iranian Rial."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-8daf4361","guard":[["hasAny",["inr","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Indian Rupee."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-8ee1359f","guard":[["hasAny",["gnf","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Guinean Franc."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-914f4715","guard":[["hasAny",["item number","nth","position","uyu"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Peso Uruguayo."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-9293ff7d","guard":[["hasAny",["chw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the WIR Franc."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-960823e6","guard":[["hasAny",["item number","nth","pab","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Balboa."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-99727499","guard":[["hasAny",["clf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Unidad de Fomento."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-a1388acc","guard":[["hasAny",["gbp","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Pound Sterling."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-a2cab903","guard":[["hasAny",["item number","myr","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Malaysian Ringgit."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-a3290770","guard":[["hasAny",["awg","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Aruban Florin."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-a4cebf23","guard":[["hasAny",["item number","ngn","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Naira."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-a85b3e94","guard":[["hasAny",["chf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Swiss Franc."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-aa5fbcfd","guard":[["hasAny",["brl","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Brazilian Real."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-aabe8f6a","guard":[["hasAny",["btn","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Ngultrum."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-b359b72d","guard":[["hasAny",["dzd","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Algerian Dinar."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-b3d0257f","guard":[["hasAny",["item number","mdl","nth","position"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Moldovan Leu."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-b63d1018","guard":[["hasAny",["item number","nth","pgk","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Kina."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-b72419d9","guard":[["hasAny",["bdt","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Taka."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-bbeaa7b0","guard":[["hasAny",["item number","nth","position","ron"]],["has","iso"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Romanian Leu."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-bdaafc91","guard":[["hasAny",["item number","mvr","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Rufiyaa."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-be391132","guard":[["hasAny",["cny","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Yuan Renminbi."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-c3645d47","guard":[["hasAny",["item number","nth","position","xbc"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bond Markets Unit European Unit of Account 9 (E.U.A.-9)."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-c760eb32","guard":[["hasAny",["item number","nth","position","xba"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bond Markets Unit European Composite Unit (EURCO)."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-c78bc8f7","guard":[["hasAny",["item number","lbp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Lebanese Pound."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-c7a3b2f4","guard":[["hasAny",["hkd","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Hong Kong Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-c9d97230","guard":[["hasAny",["item number","nth","position","xcd"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the East Caribbean Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-cb216db7","guard":[["hasAny",["item number","nth","position","uyw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Unidad Previsional."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-cc0432b8","guard":[["hasAny",["byn","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Belarusian Ruble."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-cd4f014e","guard":[["hasAny",["bif","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Burundi Franc."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-cf8117c4","guard":[["hasAny",["item number","mmk","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Kyat."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-eb05564d","guard":[["hasAny",["item number","nth","position","ttd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Trinidad and Tobago Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-eb110eda","guard":[["hasAny",["item number","nth","position","xpd"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Palladium."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-f9908442","guard":[["hasAny",["item number","npr","nth","position"]],["has","which"],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Nepalese Rupee."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}]]],"mem":null},
{"id":"n-0426472a","guard":[["hasAny",["gyd","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code GYD stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-0871986f","guard":[["hasAny",["item number","nth","position","xaf"]]],"pyramid":["render.template",{"lit":["The code XAF stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-11ea4805","guard":[["hasAny",["aoa","item number","nth","position"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The code AOA stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-13881cc9","guard":[["hasAny",["item number","mxn","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code MXN stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-1c6936b0","guard":[["hasAny",["item number","nth","position","xag"]]],"pyramid":["render.template",{"lit":["The code XAG stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-1ec910ca","guard":[["hasAny",["item number","kwd","nth","position"]]],"pyramid":["render.template",{"lit":["The code KWD stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-1ec99f63","guard":[["hasAny",["item number","nth","position","rsd"]],["has","what"]],"pyramid":["render.template",{"lit":["The code RSD stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-2cfa1b7e","guard":[["hasAny",["cou","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code COU stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-331e5556","guard":[["hasAny",["item number","nth","position","sle"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":["The code SLE stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-36f8a14f","guard":[["hasAny",["djf","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code DJF stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-3c31f95a","guard":[["hasAny",["eur","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code EUR stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-3fdf07fe","guard":[["hasAny",["item number","nth","position","sos"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":["The code SOS stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-4160f399","guard":[["hasAny",["item number","nth","pkr","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code PKR stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-5283342e","guard":[["hasAny",["item number","nth","position","wst"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code WST stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-53db7896","guard":[["hasAny",["item number","nth","position","xpf"]]],"pyramid":["render.template",{"lit":["The code XPF stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-58eb7084","guard":[["hasAny",["amd","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code AMD stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-60657333","guard":[["hasAny",["item number","nth","position","xdr"]]],"pyramid":["render.template",{"lit":["The code XDR stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-6791a34d","guard":[["hasAny",["gmd","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code GMD stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-6aca84d3","guard":[["hasAny",["item number","nth","php","position"]],["words<=",4]],"pyramid":["render.template",{"lit":["The code PHP stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-715b8395","guard":[["hasAny",["bmd","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The code BMD stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-74b8e210","guard":[["hasAny",["item number","nth","position","ssp"]],["has","what"]],"pyramid":["render.template",{"lit":["The code SSP stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-7f40dda1","guard":[["hasAny",["item number","nth","position","svc"]]],"pyramid":["render.template",{"lit":["The code SVC stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-7fc3b778","guard":[["hasAny",["item number","lak","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code LAK stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-97d6086e","guard":[["hasAny",["item number","jpy","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code JPY stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-a3ce6340","guard":[["hasAny",["item number","mnt","nth","position"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The code MNT stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-a6ca5e47","guard":[["hasAny",["huf","item number","nth","position"]],["not",["has","the"]]],"pyramid":["render.template",{"lit":["The code HUF stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-b3c3d137","guard":[["hasAny",["ern","item number","nth","position"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The code ERN stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-ba36ebaa","guard":[["hasAny",["item number","kes","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code KES stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-bff8e3f5","guard":[["hasAny",["item number","nth","position","usn"]]],"pyramid":["render.template",{"lit":["The code USN stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-c72095bd","guard":[["hasAny",["alphabetize the letters","item number","jpy","letters in order","nth","position","sort the letters"]],["has","what"]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-e25898b4","guard":[["hasAny",["alphabetize the letters","item number","jpy","letters in order","nth","position","sort the letters"]],["has","what"]],"pyramid":["render.code",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]],"mem":null},
{"id":"n-e74c8677","guard":[["hasAny",["item number","lsl","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code LSL stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-f441ea5a","guard":[["hasAny",["cup","item number","nth","position"]],["words<=",4]],"pyramid":["render.template",{"lit":["The code CUP stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-f7acb6ef","guard":[["hasAny",["item number","nth","position","sgd"]],["has","what"]],"pyramid":["render.template",{"lit":["The code SGD stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-f7d0e862","guard":[["hasAny",["clp","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The code CLP stands for the ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-003979d3","guard":[["hasAny",["code","delete","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.unit"]]],"mem":null},
{"id":"n-09c40073","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","item number","jpy","letters in order","nth","position","sort the letters","title case"]],["has","what"]],"pyramid":["render.str",["transform.sortLetters",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-0ca283fa","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","item number","jpy","letters in order","nth","position","sort the letters","title case"]],["has","what"]],"pyramid":["render.str",["transform.title",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-12d8a1bf","guard":[["hasAny",["alphabetize the letters","camel case","camelcase","item number","jpy","letters in order","lower camel case","nth","position","sort the letters"]],["has","what"]],"pyramid":["render.code",["transform.camel",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-1f52d193","guard":[["hasAny",["alphabetize the letters","item number","jpy","letters in order","nth","position","snake case","snakecase","sort the letters","underscores","variable name"]],["has","what"]],"pyramid":["render.code",["transform.snake",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-2d687bca","guard":[["hasAny",["alphabetize the letters","each word","item number","jpy","letters in order","nth","position","sort the letters","split into words"]],["has","what"]],"pyramid":["render.list",["transform.words",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-38d88548","guard":[["hasAny",["alphabetize the letters","item number","jpy","letters in order","nth","position","reverse the words","reverse word order","sort the letters","words backwards"]],["has","what"]],"pyramid":["render.code",["transform.reverseWords",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-3f397b71","guard":[["hasAny",["alphabetize the letters","capital letters","capitals","item number","jpy","letters in order","nth","position","sort the letters","upper case","uppercase"]],["has","what"]],"pyramid":["render.str",["transform.upper",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-4f310b29","guard":[["hasAny",["alphabetize the letters","class name","item number","jpy","letters in order","nth","pascal case","pascalcase","position","sort the letters","upper camel case"]],["has","what"]],"pyramid":["render.str",["transform.sortLetters",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-54ce32ad","guard":[["hasAny",["alphabetize the letters","invert case","item number","jpy","letters in order","nth","position","sort the letters","swap case","toggle case"]],["has","what"]],"pyramid":["render.code",["transform.swapCase",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-58868d24","guard":[["hasAny",["alphabetize the letters","invert case","item number","jpy","letters in order","nth","position","sort the letters","swap case","toggle case"]],["has","what"]],"pyramid":["render.str",["transform.swapCase",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-623fa0ad","guard":[["hasAny",["alphabetize the letters","class name","item number","jpy","letters in order","nth","pascal case","pascalcase","position","sort the letters","upper camel case"]],["has","what"]],"pyramid":["render.code",["transform.sortLetters",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-63d1a6c0","guard":[["hasAny",["alphabetize the letters","dashes","hyphens","item number","jpy","kebab case","kebabcase","letters in order","nth","position","sort the letters"]],["has","what"]],"pyramid":["render.str",["transform.kebab",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-68ea5790","guard":[["hasAny",["alphabetize the letters","capital letters","capitals","item number","jpy","letters in order","nth","position","sort the letters","upper case","uppercase"]],["has","what"]],"pyramid":["render.code",["transform.upper",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-71a30a00","guard":[["hasAny",["alphabetize the letters","camel case","camelcase","item number","jpy","letters in order","lower camel case","nth","position","sort the letters"]],["has","what"]],"pyramid":["render.str",["transform.camel",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-8e9552d1","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","item number","jpy","letters in order","nth","position","sort the letters","title case"]],["has","what"]],"pyramid":["render.code",["transform.sortLetters",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-9626ab22","guard":[["hasAny",["alphabetize the letters","item number","jpy","letters in order","nth","position","snake case","snakecase","sort the letters","underscores","variable name"]],["has","what"]],"pyramid":["render.str",["transform.snake",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-99550341","guard":[["hasAny",["alphabetize the letters","class name","item number","jpy","letters in order","nth","pascal case","pascalcase","position","sort the letters","upper camel case"]],["has","what"]],"pyramid":["render.str",["transform.pascal",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-aa879f01","guard":[["hasAny",["alphabetize the letters","item number","jpy","letters in order","nth","position","reverse the words","reverse word order","sort the letters","words backwards"]],["has","what"]],"pyramid":["render.str",["transform.reverseWords",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-acd77866","guard":[["hasAny",["alphabetize the letters","item number","jpy","letters in order","lower case","lowercase","nth","position","small letters","sort the letters"]],["has","what"]],"pyramid":["render.str",["transform.lower",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-bb7e6ecb","guard":[["hasAny",["alphabetize the letters","class name","item number","jpy","letters in order","nth","pascal case","pascalcase","position","sort the letters","upper camel case"]],["has","what"]],"pyramid":["render.code",["transform.pascal",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-d8df8f69","guard":[["hasAny",["code","delete","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}],["sense.unit"]]],"mem":null},
{"id":"n-ebd02e8f","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","item number","jpy","letters in order","nth","position","sort the letters","title case"]],["has","what"]],"pyramid":["render.code",["transform.title",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-f908455a","guard":[["hasAny",["alphabetize the letters","dashes","hyphens","item number","jpy","kebab case","kebabcase","letters in order","nth","position","sort the letters"]],["has","what"]],"pyramid":["render.code",["transform.kebab",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-fe4364ac","guard":[["hasAny",["alphabetize the letters","item number","jpy","letters in order","lower case","lowercase","nth","position","small letters","sort the letters"]],["has","what"]],"pyramid":["render.code",["transform.lower",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]]]],"mem":null},
{"id":"n-019596c0","guard":[["hasAny",["item number","nth","position","szl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SZL stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-0cf36aed","guard":[["hasAny",["item number","nth","position","sdg"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SDG stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-14132d6d","guard":[["hasAny",["gel","item number","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GEL stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-144112ee","guard":[["hasAny",["item number","mmk","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MMK stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-14cf3f9a","guard":[["hasAny",["item number","nth","position","ves"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VES stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-1bbf169b","guard":[["hasAny",["cny","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CNY stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-1be65f2a","guard":[["hasAny",["item number","lbp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," LBP stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-1c481fc6","guard":[["hasAny",["gbp","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GBP stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-1dbb11fb","guard":[["hasAny",["chf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CHF stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-1ec4a0cd","guard":[["hasAny",["item number","npr","nth","position"]],["has","which"],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NPR stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-208cc817","guard":[["hasAny",["awg","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AWG stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-228742b0","guard":[["hasAny",["item number","nth","position","xad"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XAD stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-23b747c8","guard":[["hasAny",["item number","nth","position","ugx"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UGX stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-2c499514","guard":[["hasAny",["item number","nth","nzd","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NZD stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-386498bd","guard":[["hasAny",["item number","nth","position","uyi"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UYI stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-3906f3f0","guard":[["hasAny",["irr","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IRR stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-3953f4d0","guard":[["hasAny",["item number","mdl","nth","position"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MDL stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-3baf68a6","guard":[["hasAny",["item number","nth","pen","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PEN stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-3c93aee0","guard":[["hasAny",["item number","nth","position","tjs"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TJS stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-3e765f09","guard":[["hasAny",["item number","nth","omr","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OMR stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-402e22f8","guard":[["hasAny",["czk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CZK stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-4c38499e","guard":[["hasAny",["item number","nth","position","ron"]],["has","iso"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RON stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-4daecd42","guard":[["hasAny",["brl","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BRL stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-5240a33c","guard":[["hasAny",["item number","nth","position","xcd"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XCD stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-5339e266","guard":[["hasAny",["item number","nth","position","stn"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," STN stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-56e4d8c4","guard":[["hasAny",["dzd","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DZD stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-5bed8fd5","guard":[["hasAny",["fkp","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FKP stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-5c3c8ea1","guard":[["hasAny",["item number","nth","position","xbc"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XBC stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-5f172f13","guard":[["hasAny",["item number","kmf","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KMF stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-609be0f5","guard":[["hasAny",["hkd","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HKD stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-60b92aa0","guard":[["hasAny",["item number","mop","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MOP stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-6d938ee4","guard":[["hasAny",["item number","ngn","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NGN stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-70e29096","guard":[["hasAny",["item number","nth","position","pyg"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PYG stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-70e41b0a","guard":[["hasAny",["item number","nth","pab","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PAB stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-7693a8fa","guard":[["hasAny",["item number","mvr","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MVR stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-81a2f743","guard":[["hasAny",["egp","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EGP stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-83089f41","guard":[["hasAny",["item number","nth","position","tzs"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TZS stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-862fae27","guard":[["hasAny",["item number","nth","position","rub"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," RUB stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-89c6e37a","guard":[["hasAny",["item number","nth","position","xba"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XBA stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-8d8b7caa","guard":[["hasAny",["gnf","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GNF stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-8e9024b1","guard":[["hasAny",["item number","nth","position","uyw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UYW stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-900b1c56","guard":[["hasAny",["bdt","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BDT stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-906eabb3","guard":[["hasAny",["item number","nth","position","xbb"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XBB stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-9427867d","guard":[["hasAny",["item number","mga","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MGA stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-96568ce4","guard":[["hasAny",["cop","item number","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," COP stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-99a30adf","guard":[["hasAny",["item number","nth","pgk","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PGK stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-a041b2df","guard":[["hasAny",["item number","nth","position","tnd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TND stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-a16c6410","guard":[["hasAny",["item number","nth","position","ved"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," VED stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-a1b692d4","guard":[["hasAny",["item number","myr","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MYR stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-a32d4889","guard":[["hasAny",["item number","nth","position","sek"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SEK stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-ac4b307f","guard":[["hasAny",["item number","nth","position","xxx"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XXX stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-adc2bbff","guard":[["hasAny",["byn","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BYN stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-bc137dbf","guard":[["hasAny",["btn","item number","nth","position"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BTN stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-bd6f2c38","guard":[["hasAny",["isk","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ISK stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-bea7eab5","guard":[["hasAny",["clf","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CLF stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-c116ba6b","guard":[["hasAny",["inr","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," INR stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-c451c1a8","guard":[["hasAny",["item number","nth","position","xbd"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XBD stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-c7e38d0b","guard":[["hasAny",["chw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CHW stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-c7f0f156","guard":[["hasAny",["item number","nth","position","uyu"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UYU stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-ccba0812","guard":[["hasAny",["item number","nth","position","top"]],["has","currency"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TOP stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-d6eb0d86","guard":[["hasAny",["ghs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GHS stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-e4a612b2","guard":[["hasAny",["item number","kgs","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KGS stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-ea290f47","guard":[["hasAny",["item number","nth","position","ttd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TTD stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-eac9b9b1","guard":[["hasAny",["item number","nth","position","xpd"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," XPD stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-eb754a65","guard":[["hasAny",["item number","krw","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KRW stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-fcad3b49","guard":[["hasAny",["item number","nth","position","srd"]],["has","currency"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SRD stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-fd9044ef","guard":[["hasAny",["bif","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BIF stands for the ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"datasets-currency-codes"},{"lit":"currency code"}],{"lit":1}],{"lit":"datasets-currency-codes"},{"lit":"currency code"},{"lit":"currency"}]],"mem":null},
{"id":"n-00dcbea0","guard":[["has","egp"],["has","with"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Egyptian Pound."]},["sense.lastWord"]],"mem":null},
{"id":"n-01a37b39","guard":[["hasAny",["code","currency","iso","name","uyw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code UYW":"The code UYW stands for the Unidad Previsional."}}},
{"id":"n-02d1711b","guard":[["has","brl"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Brazilian Real."]},["sense.lastWord"]],"mem":null},
{"id":"n-0496faec","guard":[["has","ttd"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Trinidad and Tobago Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-05f02c57","guard":[["hasAny",["code","currency","iso","kgs","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code KGS":"The code KGS stands for the Som."}}},
{"id":"n-06c12d6f","guard":[["hasAny",["code","currency","irr","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code IRR":"The code IRR stands for the Iranian Rial."}}},
{"id":"n-09d9e5fc","guard":[["hasAny",["currency","gmd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is GMD":"The code GMD stands for the Dalasi."}}},
{"id":"n-0dd35e03","guard":[["hasAny",["currency","jpy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is JPY":"The code JPY stands for the Yen."}}},
{"id":"n-10678589","guard":[["hasAny",["currency","wst"]],["not",["has","of"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is WST":"The code WST stands for the Tala."}}},
{"id":"n-10d411b4","guard":[["hasAny",["cny","code","currency","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code CNY":"The code CNY stands for the Yuan Renminbi."}}},
{"id":"n-11144d94","guard":[["hasAny",["code","currency","has","ugx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code UGX":"The code UGX stands for the Uganda Shilling."}}},
{"id":"n-11c12de5","guard":[["hasAny",["code","currency","iso","name","ves"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code VES":"The code VES stands for the Bolívar Soberano."}}},
{"id":"n-11dffe41","guard":[["hasAny",["currency","kes"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is KES":"The code KES stands for the Kenyan Shilling."}}},
{"id":"n-16f8d32e","guard":[["has","krw"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Won."]},["sense.lastWord"]],"mem":null},
{"id":"n-16fa164b","guard":[["hasAny",["currency","xpf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is XPF":"The code XPF stands for the CFP Franc."}}},
{"id":"n-190a1d9b","guard":[["has","dzd"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Algerian Dinar."]},["sense.lastWord"]],"mem":null},
{"id":"n-1b92eaba","guard":[["hasAny",["code","currency","gel","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code GEL":"The code GEL stands for the Lari."}}},
{"id":"n-1c61d492","guard":[["has","gyd"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guyana Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-1cc6b498","guard":[["hasAny",["bif","code","currency","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code BIF":"The code BIF stands for the Burundi Franc."}}},
{"id":"n-1f719d5b","guard":[["has","sgd"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Singapore Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-1fe4ae5e","guard":[["hasAny",["code","currency","ghs","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code GHS":"The code GHS stands for the Ghana Cedi."}}},
{"id":"n-21d58fc8","guard":[["has","byn"],["has","with"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Belarusian Ruble."]},["sense.lastWord"]],"mem":null},
{"id":"n-225c9077","guard":[["has","ugx"],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Uganda Shilling."]},["sense.lastWord"]],"mem":null},
{"id":"n-22e3181f","guard":[["hasAny",["currency","pkr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is PKR":"The code PKR stands for the Pakistan Rupee."}}},
{"id":"n-24172e16","guard":[["has","omr"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Rial Omani."]},["sense.lastWord"]],"mem":null},
{"id":"n-25297e46","guard":[["hasAny",["currency","mnt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is MNT":"The code MNT stands for the Tugrik."}}},
{"id":"n-26524b47","guard":[["has","lbp"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Lebanese Pound."]},["sense.lastWord"]],"mem":null},
{"id":"n-288e8608","guard":[["hasAny",["code","currency","has","isk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code ISK":"The code ISK stands for the Iceland Krona."}}},
{"id":"n-2be888e4","guard":[["has","mdl"],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Moldovan Leu."]},["sense.lastWord"]],"mem":null},
{"id":"n-2cf9db77","guard":[["hasAny",["code","currency","has","xbc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code XBC":"The code XBC stands for the Bond Markets Unit European Unit of Account 9 (E.U.A.-9)."}}},
{"id":"n-2f960327","guard":[["hasAny",["code","currency","has","nzd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code NZD":"The code NZD stands for the New Zealand Dollar."}}},
{"id":"n-3190678c","guard":[["has","xdr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the SDR (Special Drawing Right)."]},["sense.lastWord"]],"mem":null},
{"id":"n-33c4b5aa","guard":[["hasAny",["btn","code","currency","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code BTN":"The code BTN stands for the Ngultrum."}}},
{"id":"n-34997191","guard":[["has","clp"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Chilean Peso."]},["sense.lastWord"]],"mem":null},
{"id":"n-34b414bf","guard":[["hasAny",["code","currency","fkp","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code FKP":"The code FKP stands for the Falkland Islands Pound."}}},
{"id":"n-35ecbc67","guard":[["hasAny",["code","currency","has","xcd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code XCD":"The code XCD stands for the East Caribbean Dollar."}}},
{"id":"n-37e8e9b7","guard":[["has","xaf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFA Franc BEAC."]},["sense.lastWord"]],"mem":null},
{"id":"n-3ac17ee6","guard":[["has","clf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad de Fomento."]},["sense.lastWord"]],"mem":null},
{"id":"n-3bba2d75","guard":[["hasAny",["code","currency","iso","name","sek"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code SEK":"The code SEK stands for the Swedish Krona."}}},
{"id":"n-3cf0fef5","guard":[["hasAny",["currency","kwd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is KWD":"The code KWD stands for the Kuwaiti Dinar."}}},
{"id":"n-3feb6f70","guard":[["hasAny",["code","currency","has","pab"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code PAB":"The code PAB stands for the Balboa."}}},
{"id":"n-42bdc8ea","guard":[["hasAny",["code","currency","iso","name","szl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code SZL":"The code SZL stands for the Lilangeni."}}},
{"id":"n-4465a0a5","guard":[["hasAny",["code","currency","has","inr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code INR":"The code INR stands for the Indian Rupee."}}},
{"id":"n-48979e6c","guard":[["has","ngn"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Naira."]},["sense.lastWord"]],"mem":null},
{"id":"n-4ce8e242","guard":[["hasAny",["currency","ern"]],["not",["has","of"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is ERN":"The code ERN stands for the Nakfa."}}},
{"id":"n-4dc80eb1","guard":[["hasAny",["currency","usn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is USN":"The code USN stands for the US Dollar (Next day)."}}},
{"id":"n-504d7282","guard":[["has","fkp"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Falkland Islands Pound."]},["sense.lastWord"]],"mem":null},
{"id":"n-50e6199d","guard":[["hasAny",["code","currency","has","tjs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code TJS":"The code TJS stands for the Somoni."}}},
{"id":"n-5158c4eb","guard":[["has","svc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the El Salvador Colon."]},["sense.lastWord"]],"mem":null},
{"id":"n-52bca6ec","guard":[["hasAny",["currency","gyd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is GYD":"The code GYD stands for the Guyana Dollar."}}},
{"id":"n-53e81ca6","guard":[["has","ssp"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the South Sudanese Pound."]},["sense.lastWord"]],"mem":null},
{"id":"n-54f1e4a7","guard":[["has","irr"],["has","with"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Iranian Rial."]},["sense.lastWord"]],"mem":null},
{"id":"n-559f60f5","guard":[["hasAny",["code","currency","has","sdg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code SDG":"The code SDG stands for the Sudanese Pound."}}},
{"id":"n-58ed5cdf","guard":[["hasAny",["code","currency","has","mop"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code MOP":"The code MOP stands for the Pataca."}}},
{"id":"n-59e1c2fc","guard":[["has","isk"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Iceland Krona."]},["sense.lastWord"]],"mem":null},
{"id":"n-5aa6ce22","guard":[["hasAny",["code","currency","iso","name","ved"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code VED":"The code VED stands for the Bolívar Soberano."}}},
{"id":"n-5e1272ba","guard":[["has","uyu"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Peso Uruguayo."]},["sense.lastWord"]],"mem":null},
{"id":"n-60cb3280","guard":[["hasAny",["code","currency","iso","name","ttd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code TTD":"The code TTD stands for the Trinidad and Tobago Dollar."}}},
{"id":"n-62e5e41b","guard":[["hasAny",["currency","sos"]],["not",["has","of"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is SOS":"The code SOS stands for the Somali Shilling."}}},
{"id":"n-62ef7458","guard":[["hasAny",["currency","lsl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is LSL":"The code LSL stands for the Loti."}}},
{"id":"n-6463834b","guard":[["has","nzd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the New Zealand Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-64fb809d","guard":[["hasAny",["code","cop","currency","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code COP":"The code COP stands for the Colombian Peso."}}},
{"id":"n-65860219","guard":[["hasAny",["code","currency","has","npr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code NPR":"The code NPR stands for the Nepalese Rupee."}}},
{"id":"n-68309703","guard":[["has","gnf"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guinean Franc."]},["sense.lastWord"]],"mem":null},
{"id":"n-6cfb0693","guard":[["hasAny",["code","currency","gnf","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code GNF":"The code GNF stands for the Guinean Franc."}}},
{"id":"n-6d67afc1","guard":[["has","tzs"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Tanzanian Shilling."]},["sense.lastWord"]],"mem":null},
{"id":"n-6dc3f418","guard":[["hasAny",["amd","currency"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is AMD":"The code AMD stands for the Armenian Dram."}}},
{"id":"n-705c31e0","guard":[["hasAny",["currency","xdr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is XDR":"The code XDR stands for the SDR (Special Drawing Right)."}}},
{"id":"n-70670d3f","guard":[["hasAny",["code","currency","has","xpd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code XPD":"The code XPD stands for the Palladium."}}},
{"id":"n-73505799","guard":[["hasAny",["code","currency","has","mga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code MGA":"The code MGA stands for the Malagasy Ariary."}}},
{"id":"n-75a2fcea","guard":[["has","kwd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kuwaiti Dinar."]},["sense.lastWord"]],"mem":null},
{"id":"n-770dce45","guard":[["has","stn"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Dobra."]},["sense.lastWord"]],"mem":null},
{"id":"n-771e5f97","guard":[["has","mmk"],["has","with"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kyat."]},["sense.lastWord"]],"mem":null},
{"id":"n-778ccc56","guard":[["hasAny",["code","currency","hkd","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code HKD":"The code HKD stands for the Hong Kong Dollar."}}},
{"id":"n-7c3bb11e","guard":[["hasAny",["brl","code","currency","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code BRL":"The code BRL stands for the Brazilian Real."}}},
{"id":"n-7c7cceca","guard":[["hasAny",["code","currency","iso","name","stn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code STN":"The code STN stands for the Dobra."}}},
{"id":"n-7f801047","guard":[["has","lak"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Lao Kip."]},["sense.lastWord"]],"mem":null},
{"id":"n-7fc0dce3","guard":[["has","czk"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Czech Koruna."]},["sense.lastWord"]],"mem":null},
{"id":"n-801f6e93","guard":[["hasAny",["code","currency","czk","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code CZK":"The code CZK stands for the Czech Koruna."}}},
{"id":"n-8062e9c0","guard":[["hasAny",["bdt","code","currency","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code BDT":"The code BDT stands for the Taka."}}},
{"id":"n-8430918c","guard":[["has","awg"],["has","has"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Aruban Florin."]},["sense.lastWord"]],"mem":null},
{"id":"n-85f85844","guard":[["hasAny",["chf","code","currency","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code CHF":"The code CHF stands for the Swiss Franc."}}},
{"id":"n-8749a232","guard":[["has","mop"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Pataca."]},["sense.lastWord"]],"mem":null},
{"id":"n-881bfd83","guard":[["hasAny",["currency","sgd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is SGD":"The code SGD stands for the Singapore Dollar."}}},
{"id":"n-8ef9543b","guard":[["has","cny"],["has","has"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Yuan Renminbi."]},["sense.lastWord"]],"mem":null},
{"id":"n-8f43013c","guard":[["has","xbd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bond Markets Unit European Unit of Account 17 (E.U.A.-17)."]},["sense.lastWord"]],"mem":null},
{"id":"n-9048a824","guard":[["hasAny",["code","currency","has","ngn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code NGN":"The code NGN stands for the Naira."}}},
{"id":"n-90e56ec7","guard":[["has","gmd"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Dalasi."]},["sense.lastWord"]],"mem":null},
{"id":"n-9121f48a","guard":[["hasAny",["code","currency","iso","name","top"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code TOP":"The code TOP stands for the Pa’anga."}}},
{"id":"n-91255d46","guard":[["hasAny",["code","currency","has","xba"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code XBA":"The code XBA stands for the Bond Markets Unit European Composite Unit (EURCO)."}}},
{"id":"n-923016e3","guard":[["has","mga"],["has","has"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Malagasy Ariary."]},["sense.lastWord"]],"mem":null},
{"id":"n-941d8d1d","guard":[["hasAny",["code","currency","iso","name","omr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code OMR":"The code OMR stands for the Rial Omani."}}},
{"id":"n-9548b4b2","guard":[["hasAny",["code","currency","iso","name","tzs"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code TZS":"The code TZS stands for the Tanzanian Shilling."}}},
{"id":"n-95efc65c","guard":[["hasAny",["aoa","currency"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is AOA":"The code AOA stands for the Kwanza."}}},
{"id":"n-9776532f","guard":[["hasAny",["code","currency","iso","name","pen"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code PEN":"The code PEN stands for the Sol."}}},
{"id":"n-98b253c3","guard":[["has","inr"],["has","which"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Indian Rupee."]},["sense.lastWord"]],"mem":null},
{"id":"n-99e2adb5","guard":[["hasAny",["code","currency","has","uyi"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code UYI":"The code UYI stands for the Uruguay Peso en Unidades Indexadas (UI)."}}},
{"id":"n-9a86c04f","guard":[["hasAny",["code","currency","iso","name","xbb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code XBB":"The code XBB stands for the Bond Markets Unit European Monetary Unit (E.M.U.-6)."}}},
{"id":"n-9b805d23","guard":[["hasAny",["currency","ssp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is SSP":"The code SSP stands for the South Sudanese Pound."}}},
{"id":"n-9ecf3a8d","guard":[["hasAny",["code","currency","iso","myr","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code MYR":"The code MYR stands for the Malaysian Ringgit."}}},
{"id":"n-a19eb21e","guard":[["has","chf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Swiss Franc."]},["sense.lastWord"]],"mem":null},
{"id":"n-a337810d","guard":[["has","pyg"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guarani."]},["sense.lastWord"]],"mem":null},
{"id":"n-a3dc3c37","guard":[["hasAny",["code","currency","has","rub"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code RUB":"The code RUB stands for the Russian Ruble."}}},
{"id":"n-a5da7c7e","guard":[["has","rsd"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Serbian Dinar."]},["sense.lastWord"]],"mem":null},
{"id":"n-aa5880da","guard":[["hasAny",["code","currency","has","xad"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code XAD":"The code XAD stands for the Arab Accounting Dinar."}}},
{"id":"n-adc7f514","guard":[["has","xpf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFP Franc."]},["sense.lastWord"]],"mem":null},
{"id":"n-ae1344ed","guard":[["has","usn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the US Dollar (Next day)."]},["sense.lastWord"]],"mem":null},
{"id":"n-ae5524dd","guard":[["hasAny",["awg","code","currency","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code AWG":"The code AWG stands for the Aruban Florin."}}},
{"id":"n-b1ea18f1","guard":[["hasAny",["code","currency","has","krw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code KRW":"The code KRW stands for the Won."}}},
{"id":"n-b25cf20e","guard":[["hasAny",["code","currency","has","pgk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code PGK":"The code PGK stands for the Kina."}}},
{"id":"n-b6175582","guard":[["hasAny",["code","currency","dzd","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code DZD":"The code DZD stands for the Algerian Dinar."}}},
{"id":"n-b6b6ffd8","guard":[["has","xag"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Silver."]},["sense.lastWord"]],"mem":null},
{"id":"n-b734fa87","guard":[["hasAny",["code","currency","iso","mmk","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code MMK":"The code MMK stands for the Kyat."}}},
{"id":"n-b84d5a49","guard":[["has","eur"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Euro."]},["sense.lastWord"]],"mem":null},
{"id":"n-b8be9719","guard":[["hasAny",["currency","sle"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is SLE":"The code SLE stands for the Leone."}}},
{"id":"n-bae1ad7f","guard":[["hasAny",["cou","currency"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is COU":"The code COU stands for the Unidad de Valor Real."}}},
{"id":"n-bb0162ff","guard":[["has","bdt"],["has","with"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Taka."]},["sense.lastWord"]],"mem":null},
{"id":"n-bb5286ca","guard":[["hasAny",["currency","xag"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is XAG":"The code XAG stands for the Silver."}}},
{"id":"n-bbb27a97","guard":[["has","tnd"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Tunisian Dinar."]},["sense.lastWord"]],"mem":null},
{"id":"n-bcd5472e","guard":[["hasAny",["code","currency","iso","name","pyg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code PYG":"The code PYG stands for the Guarani."}}},
{"id":"n-bce76829","guard":[["hasAny",["code","currency","gbp","has"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code GBP":"The code GBP stands for the Pound Sterling."}}},
{"id":"n-bd0db891","guard":[["hasAny",["clf","code","currency","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code CLF":"The code CLF stands for the Unidad de Fomento."}}},
{"id":"n-bdccb7c9","guard":[["has","xcd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the East Caribbean Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-c0bccf11","guard":[["hasAny",["code","currency","has","uyu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code UYU":"The code UYU stands for the Peso Uruguayo."}}},
{"id":"n-c15e862c","guard":[["hasAny",["code","currency","has","srd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code SRD":"The code SRD stands for the Surinam Dollar."}}},
{"id":"n-c25600fa","guard":[["hasAny",["currency","djf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is DJF":"The code DJF stands for the Djibouti Franc."}}},
{"id":"n-c264c29c","guard":[["has","pgk"],["has","has"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kina."]},["sense.lastWord"]],"mem":null},
{"id":"n-c402bd8c","guard":[["has","uyw"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad Previsional."]},["sense.lastWord"]],"mem":null},
{"id":"n-c4559f36","guard":[["hasAny",["currency","xaf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is XAF":"The code XAF stands for the CFA Franc BEAC."}}},
{"id":"n-c479bdd7","guard":[["hasAny",["currency","php"]],["not",["has","of"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is PHP":"The code PHP stands for the Philippine Peso."}}},
{"id":"n-c9a8d33b","guard":[["hasAny",["currency","eur"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is EUR":"The code EUR stands for the Euro."}}},
{"id":"n-cb9c0eda","guard":[["hasAny",["code","currency","iso","name","ron"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code RON":"The code RON stands for the Romanian Leu."}}},
{"id":"n-cecd2c0d","guard":[["hasAny",["currency","mxn"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is MXN":"The code MXN stands for the Mexican Peso."}}},
{"id":"n-cfe83169","guard":[["has","sek"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Swedish Krona."]},["sense.lastWord"]],"mem":null},
{"id":"n-d09e2337","guard":[["has","lsl"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Loti."]},["sense.lastWord"]],"mem":null},
{"id":"n-d2991e85","guard":[["hasAny",["currency","svc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is SVC":"The code SVC stands for the El Salvador Colon."}}},
{"id":"n-d30a5637","guard":[["hasAny",["code","currency","iso","name","xbd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code XBD":"The code XBD stands for the Bond Markets Unit European Unit of Account 17 (E.U.A.-17)."}}},
{"id":"n-d71026b4","guard":[["has","xba"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bond Markets Unit European Composite Unit (EURCO)."]},["sense.lastWord"]],"mem":null},
{"id":"n-d757c79f","guard":[["hasAny",["code","currency","has","mvr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code MVR":"The code MVR stands for the Rufiyaa."}}},
{"id":"n-d98bf0f9","guard":[["hasAny",["code","currency","has","mdl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code MDL":"The code MDL stands for the Moldovan Leu."}}},
{"id":"n-da954f0e","guard":[["has","hkd"],["has","name"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Hong Kong Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-db2e1ff6","guard":[["hasAny",["currency","lak"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is LAK":"The code LAK stands for the Lao Kip."}}},
{"id":"n-dd83c6a9","guard":[["hasAny",["code","currency","has","lbp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code LBP":"The code LBP stands for the Lebanese Pound."}}},
{"id":"n-e0ccc3bb","guard":[["has","sdg"],["has","has"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Sudanese Pound."]},["sense.lastWord"]],"mem":null},
{"id":"n-e19942fa","guard":[["hasAny",["code","currency","has","kmf"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which currency has the code KMF":"The code KMF stands for the Comorian Franc."}}},
{"id":"n-e2b29095","guard":[["has","xpd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Palladium."]},["sense.lastWord"]],"mem":null},
{"id":"n-e59f83a2","guard":[["has","cou"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad de Valor Real."]},["sense.lastWord"]],"mem":null},
{"id":"n-e6212a38","guard":[["hasAny",["code","currency","iso","name","xxx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code XXX":"The code XXX stands for the The codes assigned for transactions where no currency is involved."}}},
{"id":"n-e6969450","guard":[["has","bmd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bermudian Dollar."]},["sense.lastWord"]],"mem":null},
{"id":"n-e7e82460","guard":[["hasAny",["code","currency","iso","name","tnd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code TND":"The code TND stands for the Tunisian Dinar."}}},
{"id":"n-ebd0bab4","guard":[["hasAny",["currency","rsd"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is RSD":"The code RSD stands for the Serbian Dinar."}}},
{"id":"n-ed1f221a","guard":[["hasAny",["clp","currency"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is CLP":"The code CLP stands for the Chilean Peso."}}},
{"id":"n-f12908de","guard":[["hasAny",["code","currency","egp","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code EGP":"The code EGP stands for the Egyptian Pound."}}},
{"id":"n-f5d636f6","guard":[["hasAny",["chw","code","currency","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code CHW":"The code CHW stands for the WIR Franc."}}},
{"id":"n-f9ca4dca","guard":[["hasAny",["cup","currency"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is CUP":"The code CUP stands for the Cuban Peso."}}},
{"id":"n-fa143602","guard":[["hasAny",["bmd","currency"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is BMD":"The code BMD stands for the Bermudian Dollar."}}},
{"id":"n-faa50a63","guard":[["hasAny",["currency","huf"]],["not",["has","of"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what currency is HUF":"The code HUF stands for the Forint."}}},
{"id":"n-fac42a63","guard":[["hasAny",["byn","code","currency","iso","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the currency with the ISO code BYN":"The code BYN stands for the Belarusian Ruble."}}},
{"id":"n-feb5f279","guard":[["has","pen"],["has","with"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Sol."]},["sense.lastWord"]],"mem":null},
{"id":"n-00b32f9f","guard":[["hasAny",["kwd","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kuwaiti Dinar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-07cb4561","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xag"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Silver."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-07ea1667","guard":[["hasAny",["lower case","lowercase","small letters","ssp"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the South Sudanese Pound."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0984894c","guard":[["hasAny",["rsd","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Serbian Dinar."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0c584113","guard":[["hasAny",["eur","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Euro."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0ded50a5","guard":[["hasAny",["lower case","lowercase","lsl","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Loti."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0ecf23a6","guard":[["hasAny",["no vowels","remove vowels","without vowels","xdr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the SDR (Special Drawing Right)."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-10cfbcd5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xpf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFP Franc."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1133cf6f","guard":[["hasAny",["clp","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Chilean Peso."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1282959d","guard":[["has","cou"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad de Valor Real."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-13be8848","guard":[["has","xaf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFA Franc BEAC."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-15074e3e","guard":[["hasAny",["lower case","lowercase","small letters","xag"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Silver."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1553d6bb","guard":[["hasAny",["lower case","lowercase","small letters","xpf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFP Franc."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-168b8913","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gyd","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guyana Dollar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-18748791","guard":[["hasAny",["capitalise","capitalize","capitalize each word","clp","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Chilean Peso."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1d3cd178","guard":[["hasAny",["shortest","shortest one","shortest word","svc"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the El Salvador Colon."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1f32ab4d","guard":[["has","eur"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Euro."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-20487fbd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rsd","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Serbian Dinar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2b7534cc","guard":[["has","bmd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bermudian Dollar."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-2d63aa9c","guard":[["hasAny",["lower case","lowercase","small letters","xaf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFA Franc BEAC."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2e1bd61c","guard":[["hasAny",["shortest","shortest one","shortest word","ssp"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the South Sudanese Pound."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2e3d7271","guard":[["hasAny",["no vowels","remove vowels","ssp","without vowels"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the South Sudanese Pound."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-37b715f5","guard":[["hasAny",["lak","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Lao Kip."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3afcc453","guard":[["hasAny",["lower case","lowercase","sgd","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Singapore Dollar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3c3dc81b","guard":[["hasAny",["bmd","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bermudian Dollar."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-3c732e0c","guard":[["hasAny",["bmd","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bermudian Dollar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-476a4f42","guard":[["hasAny",["lower case","lowercase","rsd","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Serbian Dinar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-49973a59","guard":[["hasAny",["shortest","shortest one","shortest word","xaf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFA Franc BEAC."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4a47c5db","guard":[["hasAny",["lower case","lowercase","small letters","xdr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the SDR (Special Drawing Right)."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4b0e8af6","guard":[["has","xdr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the SDR (Special Drawing Right)."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-4f3835aa","guard":[["hasAny",["cou","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad de Valor Real."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4f6394e3","guard":[["hasAny",["lak","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Lao Kip."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-536d5c7c","guard":[["has","usn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the US Dollar (Next day)."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-5c09c3fc","guard":[["hasAny",["no vowels","remove vowels","without vowels","xpf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFP Franc."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-5ff684af","guard":[["hasAny",["clp","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Chilean Peso."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6011f17e","guard":[["hasAny",["shortest","shortest one","shortest word","xag"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Silver."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-613054fe","guard":[["has","sgd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Singapore Dollar."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-680faefd","guard":[["hasAny",["lower case","lowercase","small letters","usn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the US Dollar (Next day)."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6b2d5da4","guard":[["hasAny",["kwd","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kuwaiti Dinar."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6b760fd0","guard":[["has","xpf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFP Franc."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-74614cc5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gmd","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Dalasi."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-76708b3b","guard":[["hasAny",["shortest","shortest one","shortest word","xpf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFP Franc."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-78a97dfd","guard":[["hasAny",["gmd","no vowels","remove vowels","without vowels"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Dalasi."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-7e0c9f7f","guard":[["hasAny",["bmd","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bermudian Dollar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7e254329","guard":[["has","xag"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Silver."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-7f852e4c","guard":[["has","lsl"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Loti."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-8002daf9","guard":[["has","kes"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kenyan Shilling."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-857ebc14","guard":[["hasAny",["gyd","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guyana Dollar."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-88514354","guard":[["has","lak"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Lao Kip."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-88f99a3b","guard":[["hasAny",["lsl","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Loti."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8f5fc2db","guard":[["has","pkr"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Pakistan Rupee."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-91e85e26","guard":[["hasAny",["no vowels","remove vowels","svc","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the El Salvador Colon."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-94237527","guard":[["hasAny",["clp","no vowels","remove vowels","without vowels"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Chilean Peso."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-9477ecbd","guard":[["has","rsd"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Serbian Dinar."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-992d771c","guard":[["has","gmd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Dalasi."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-9d18737d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cou","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad de Valor Real."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a26970f0","guard":[["has","gyd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guyana Dollar."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-a4048a4d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kwd","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kuwaiti Dinar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aa5d20db","guard":[["hasAny",["lower case","lowercase","small letters","svc"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the El Salvador Colon."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b02c00cb","guard":[["hasAny",["no vowels","remove vowels","rsd","without vowels"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Serbian Dinar."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b0abf7ff","guard":[["hasAny",["gmd","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Dalasi."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b6d0b0d0","guard":[["hasAny",["shortest","shortest one","shortest word","xdr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the SDR (Special Drawing Right)."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b6d8d464","guard":[["hasAny",["eur","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Euro."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b6fc09a9","guard":[["has","clp"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Chilean Peso."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-b8a79c5a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xaf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFA Franc BEAC."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bf4a05a2","guard":[["hasAny",["gmd","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Dalasi."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c05fcd67","guard":[["has","amd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Armenian Dram."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-c0cbcb66","guard":[["has","kwd"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kuwaiti Dinar."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-c19b9280","guard":[["hasAny",["lsl","no vowels","remove vowels","without vowels"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Loti."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-c50a2f4e","guard":[["hasAny",["sgd","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Singapore Dollar."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c56e8e95","guard":[["hasAny",["no vowels","remove vowels","sgd","without vowels"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Singapore Dollar."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-c7287b4b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ssp","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the South Sudanese Pound."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c877ba85","guard":[["hasAny",["capitalise","capitalize","capitalize each word","svc","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the El Salvador Colon."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c900236e","guard":[["hasAny",["cou","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad de Valor Real."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cca41241","guard":[["has","mxn"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Mexican Peso."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-cd5fc837","guard":[["has","djf"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Djibouti Franc."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-cda88871","guard":[["has","jpy"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Yen."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-cf1a4927","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lsl","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Loti."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cff9eea2","guard":[["hasAny",["bmd","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bermudian Dollar."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d280a545","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lak","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Lao Kip."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d2e58c21","guard":[["has","ssp"],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the South Sudanese Pound."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-dcc03b1e","guard":[["hasAny",["shortest","shortest one","shortest word","usn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the US Dollar (Next day)."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-df32a7b5","guard":[["has","svc"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the El Salvador Colon."]},["sense.after",{"lit":"is"}]],"mem":null},
{"id":"n-e051779c","guard":[["hasAny",["kwd","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kuwaiti Dinar."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-e6de43e2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","eur","title case"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Euro."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e780f788","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","usn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the US Dollar (Next day)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e935084a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sgd","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Singapore Dollar."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e99f5984","guard":[["hasAny",["gyd","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guyana Dollar."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ea6f84bc","guard":[["hasAny",["gyd","no vowels","remove vowels","without vowels"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guyana Dollar."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-fb3c2b1b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xdr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the SDR (Special Drawing Right)."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-005d1690","guard":[["hasAny",["item number","mga","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MGA stands for the Malagasy Ariary."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-06d404a6","guard":[["hasAny",["cou","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad de Valor Real."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-15204700","guard":[["hasAny",["irr","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," IRR stands for the Iranian Rial."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1783106a","guard":[["hasAny",["bmd","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bermudian Dollar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-18101d96","guard":[["hasAny",["item number","nth","position","sdg"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SDG stands for the Sudanese Pound."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-18599444","guard":[["hasAny",["item number","nth","position","tzs"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TZS stands for the Tanzanian Shilling."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1bf3b43f","guard":[["hasAny",["item number","mmk","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MMK stands for the Kyat."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1c15beab","guard":[["hasAny",["each word","split into words","xdr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the SDR (Special Drawing Right)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1dd1035a","guard":[["hasAny",["each word","gmd","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Dalasi."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1f68ffd3","guard":[["hasAny",["each word","split into words","xdr"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the SDR (Special Drawing Right)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2ac9c273","guard":[["hasAny",["item number","nth","position","szl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SZL stands for the Lilangeni."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2c256af6","guard":[["hasAny",["clp","each word","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Chilean Peso."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2cd2139f","guard":[["hasAny",["each word","split into words","xag"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Silver."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2f2dc2ed","guard":[["hasAny",["each word","split into words","ssp"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the South Sudanese Pound."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-32c7c252","guard":[["hasAny",["each word","split into words","svc"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the El Salvador Colon."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3a31d737","guard":[["hasAny",["cny","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," CNY stands for the Yuan Renminbi."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-419972f0","guard":[["hasAny",["each word","lak","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Lao Kip."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-430388b2","guard":[["hasAny",["amd","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Armenian Dram."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-449b003a","guard":[["hasAny",["item number","nth","position","stn"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," STN stands for the Dobra."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-45bada21","guard":[["hasAny",["item number","nth","pen","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PEN stands for the Sol."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-47e86eba","guard":[["hasAny",["gnf","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," GNF stands for the Guinean Franc."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-48cc36f1","guard":[["hasAny",["each word","eur","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Euro."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-533d2381","guard":[["hasAny",["each word","split into words","svc"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the El Salvador Colon."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-55f100c5","guard":[["hasAny",["item number","nth","position","tnd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TND stands for the Tunisian Dinar."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-58541800","guard":[["hasAny",["each word","split into words","xpf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFP Franc."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5ab92c83","guard":[["hasAny",["fkp","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," FKP stands for the Falkland Islands Pound."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5c71aa8e","guard":[["hasAny",["each word","lak","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Lao Kip."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5e73dc35","guard":[["hasAny",["isk","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ISK stands for the Iceland Krona."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-641424bd","guard":[["hasAny",["each word","split into words","usn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the US Dollar (Next day)."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6ca7d006","guard":[["hasAny",["brl","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BRL stands for the Brazilian Real."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-6d3a9094","guard":[["hasAny",["lak","lower case","lowercase","small letters"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Lao Kip."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-7777dfa3","guard":[["hasAny",["inr","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," INR stands for the Indian Rupee."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-7a338e7b","guard":[["hasAny",["item number","krw","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," KRW stands for the Won."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-817d2d48","guard":[["hasAny",["each word","split into words","usn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the US Dollar (Next day)."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-83d7e74c","guard":[["hasAny",["each word","sgd","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Singapore Dollar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-842ec14d","guard":[["hasAny",["each word","eur","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Euro."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-88b5bde6","guard":[["hasAny",["awg","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," AWG stands for the Aruban Florin."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8aaddca0","guard":[["hasAny",["lower case","lowercase","small letters","xag"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Silver."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-8b4b322e","guard":[["hasAny",["each word","kwd","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kuwaiti Dinar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8fc338b2","guard":[["hasAny",["egp","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," EGP stands for the Egyptian Pound."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-90999136","guard":[["hasAny",["item number","mop","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," MOP stands for the Pataca."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9257971c","guard":[["hasAny",["hkd","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," HKD stands for the Hong Kong Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-96b65ec8","guard":[["hasAny",["item number","nth","pgk","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PGK stands for the Kina."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-9a635d54","guard":[["hasAny",["each word","lsl","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Loti."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a200222e","guard":[["hasAny",["clp","each word","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Chilean Peso."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac7768b9","guard":[["hasAny",["lower case","lowercase","small letters","usn"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the US Dollar (Next day)."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ad0436a6","guard":[["hasAny",["cou","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad de Valor Real."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ad3cbe40","guard":[["hasAny",["item number","nth","position","sek"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," SEK stands for the Swedish Krona."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ad4175c1","guard":[["hasAny",["item number","nth","position","uyu"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," UYU stands for the Peso Uruguayo."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-b1e7ff1e","guard":[["hasAny",["item number","nth","position","pyg"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," PYG stands for the Guarani."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-b836b3f5","guard":[["hasAny",["item number","ngn","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," NGN stands for the Naira."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bbace334","guard":[["hasAny",["each word","sgd","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Singapore Dollar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bc4a6e6f","guard":[["hasAny",["byn","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BYN stands for the Belarusian Ruble."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bfde9bee","guard":[["hasAny",["each word","split into words","xag"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Silver."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c10ce417","guard":[["hasAny",["bmd","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Bermudian Dollar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c202db63","guard":[["hasAny",["lower case","lowercase","small letters","xaf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFA Franc BEAC."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-c2d2ccee","guard":[["hasAny",["each word","split into words","ssp"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the South Sudanese Pound."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c5138470","guard":[["hasAny",["each word","lsl","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Loti."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c5220ed1","guard":[["hasAny",["bdt","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," BDT stands for the Taka."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-ca6f7b4e","guard":[["hasAny",["each word","gmd","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Dalasi."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd450961","guard":[["hasAny",["each word","split into words","xaf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFA Franc BEAC."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d0c6d711","guard":[["hasAny",["item number","nth","omr","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," OMR stands for the Rial Omani."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d2d02f14","guard":[["hasAny",["kes","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kenyan Shilling."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d660d58a","guard":[["hasAny",["cou","each word","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Unidad de Valor Real."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dbdf87e6","guard":[["hasAny",["each word","kwd","split into words"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Kuwaiti Dinar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e004ad0b","guard":[["hasAny",["eur","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Euro."]},["transform.lower",["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e46c2209","guard":[["hasAny",["each word","split into words","xaf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFA Franc BEAC."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e60d54d5","guard":[["hasAny",["each word","gyd","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guyana Dollar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e70f02b8","guard":[["hasAny",["each word","split into words","xpf"]]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the CFP Franc."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e837a4de","guard":[["hasAny",["each word","gyd","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Guyana Dollar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e9a71b3c","guard":[["hasAny",["each word","rsd","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Serbian Dinar."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f256b7f5","guard":[["hasAny",["dzd","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," DZD stands for the Algerian Dinar."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f29e96fe","guard":[["hasAny",["each word","rsd","split into words"]],["has","what"]],"pyramid":["render.template",{"lit":["The code ",{"slot":0}," stands for the Serbian Dinar."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f7c2f311","guard":[["hasAny",["item number","nth","position","ttd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," TTD stands for the Trinidad and Tobago Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0838351c","guard":[["hasAny",["inr","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Indian Rupee."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-1bf29b55","guard":[["hasAny",["item number","ngn","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Naira."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-1d8df5d3","guard":[["hasAny",["hkd","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Hong Kong Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-1ede7961","guard":[["hasAny",["bdt","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Taka."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-219d7edc","guard":[["hasAny",["item number","nth","position","sek"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Swedish Krona."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-22dbab14","guard":[["hasAny",["dzd","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Algerian Dinar."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-254b0e0a","guard":[["hasAny",["awg","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Aruban Florin."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-278869c9","guard":[["hasAny",["item number","nth","position","stn"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Dobra."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-2e915be2","guard":[["hasAny",["item number","nth","position","tzs"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Tanzanian Shilling."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-2f5668aa","guard":[["hasAny",["item number","nth","position","tnd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Tunisian Dinar."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-3364baff","guard":[["hasAny",["item number","nth","pgk","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Kina."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-359bd88a","guard":[["hasAny",["item number","mmk","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Kyat."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-41c74338","guard":[["hasAny",["fkp","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Falkland Islands Pound."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-4398e606","guard":[["hasAny",["isk","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iceland Krona."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-440667e7","guard":[["hasAny",["item number","mop","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Pataca."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-47795d56","guard":[["hasAny",["egp","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Egyptian Pound."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-5312f880","guard":[["hasAny",["item number","nth","position","pyg"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Guarani."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-53564cf1","guard":[["hasAny",["item number","nth","position","uyu"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Peso Uruguayo."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-5bd7dda8","guard":[["hasAny",["item number","nth","pgk","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Kina."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-5e4bc93f","guard":[["hasAny",["item number","nth","position","sdg"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sudanese Pound."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-60b05535","guard":[["hasAny",["byn","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Belarusian Ruble."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-627481e8","guard":[["hasAny",["item number","nth","position","ttd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Trinidad and Tobago Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-7b34aefc","guard":[["hasAny",["irr","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iranian Rial."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-88dafd0d","guard":[["hasAny",["item number","krw","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Won."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-9532fce5","guard":[["hasAny",["cny","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Yuan Renminbi."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-a1706ac8","guard":[["hasAny",["inr","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Indian Rupee."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a1963fa7","guard":[["hasAny",["item number","ngn","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Naira."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a2171e6b","guard":[["hasAny",["item number","mop","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Pataca."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-a4ff0848","guard":[["hasAny",["item number","mga","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Malagasy Ariary."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a933094d","guard":[["hasAny",["item number","nth","position","uyu"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Peso Uruguayo."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-a951f03b","guard":[["hasAny",["item number","nth","position","sdg"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sudanese Pound."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-b73f6938","guard":[["hasAny",["dzd","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Algerian Dinar."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-b8e74f84","guard":[["hasAny",["brl","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Brazilian Real."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-b9f2d9fa","guard":[["hasAny",["item number","nth","position","szl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Lilangeni."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-bd0d3a7d","guard":[["hasAny",["cny","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Yuan Renminbi."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-c361030f","guard":[["hasAny",["item number","nth","omr","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Rial Omani."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-ce0d1830","guard":[["hasAny",["item number","nth","pen","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sol."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-da15ad2e","guard":[["hasAny",["item number","krw","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Won."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-e3faaa30","guard":[["hasAny",["gnf","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Guinean Franc."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-ea56a07d","guard":[["hasAny",["item number","mga","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Malagasy Ariary."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-ecb846e5","guard":[["hasAny",["awg","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Aruban Florin."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-faceb5f0","guard":[["hasAny",["isk","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iceland Krona."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.lastWord"]],"mem":null},
{"id":"n-00adb520","guard":[["hasAny",["element","item number","nth","position","sek"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Swedish Krona."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-02b3cfdb","guard":[["hasAny",["element","item number","nth","position","uyw"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Unidad Previsional."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-068f7f53","guard":[["hasAny",["bdt","element","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Taka."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-06b25bad","guard":[["hasAny",["dzd","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Algerian Dinar."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-06e7f6df","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sdg","title case"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sudanese Pound."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-071f4625","guard":[["hasAny",["byn","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Belarusian Ruble."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-11e09d5d","guard":[["hasAny",["item number","lower case","lowercase","mop","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Pataca."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-137bc8ea","guard":[["hasAny",["element","item number","nth","position","pyg"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Guarani."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-1421adb6","guard":[["hasAny",["element","item number","nth","position","xcd"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the East Caribbean Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-15b47c9f","guard":[["hasAny",["dzd","item number","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Algerian Dinar."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-16f11ce1","guard":[["hasAny",["chw","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the WIR Franc."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-1b2d0603","guard":[["hasAny",["chf","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Swiss Franc."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-1c447f0e","guard":[["hasAny",["inr","item number","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Indian Rupee."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1d435c22","guard":[["hasAny",["awg","item number","lower case","lowercase","nth","position","small letters"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Aruban Florin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1dc6fc0b","guard":[["hasAny",["item number","lower case","lowercase","nth","position","sdg","small letters"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sudanese Pound."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1e4109bd","guard":[["hasAny",["cny","item number","lower case","lowercase","nth","position","small letters"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Yuan Renminbi."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2016aaba","guard":[["hasAny",["element","item number","nth","position","rub"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Russian Ruble."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-210823b0","guard":[["hasAny",["element","item number","nth","position","srd"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Surinam Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-226c72a6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mga","nth","position","title case"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Malagasy Ariary."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-24bf5b0d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sek","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Swedish Krona."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-258d3c51","guard":[["hasAny",["element","item number","krw","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Won."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-26047d94","guard":[["hasAny",["element","item number","nth","position","ron"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Romanian Leu."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-2adb6c3c","guard":[["hasAny",["item number","lower case","lowercase","nth","pen","position","small letters"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sol."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2f740f64","guard":[["hasAny",["czk","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Czech Koruna."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-31ee7d4d","guard":[["hasAny",["element","item number","nth","position","ugx"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Uganda Shilling."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-32bf062f","guard":[["hasAny",["cny","element","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Yuan Renminbi."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-33044f7e","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","tzs"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Tanzanian Shilling."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-349116cb","guard":[["hasAny",["element","item number","nth","position","sdg"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sudanese Pound."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-38f09c3b","guard":[["hasAny",["bdt","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Taka."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3afcaa40","guard":[["hasAny",["element","item number","mmk","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Kyat."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-3bd72fb8","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cny","item number","nth","position","title case"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Yuan Renminbi."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3fc08eae","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mmk","nth","position","title case"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Kyat."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-414f1839","guard":[["hasAny",["hkd","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Hong Kong Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-41618e3f","guard":[["hasAny",["element","item number","nth","position","xba"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bond Markets Unit European Composite Unit (EURCO)."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-498c469b","guard":[["hasAny",["element","item number","kgs","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Som."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-4a6e2954","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","stn","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Dobra."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4e5ba234","guard":[["hasAny",["byn","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Belarusian Ruble."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-4f92cf22","guard":[["hasAny",["element","item number","mvr","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Rufiyaa."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-50218a88","guard":[["hasAny",["element","irr","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iranian Rial."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-56b680a2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fkp","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Falkland Islands Pound."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-56cd4ca3","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","szl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Lilangeni."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-56d39399","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","uyu"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Peso Uruguayo."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5b9b46f1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","isk","item number","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iceland Krona."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5e627457","guard":[["hasAny",["element","gbp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Pound Sterling."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-5fabcac1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hkd","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Hong Kong Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-607f5709","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","omr","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Rial Omani."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-60bf8b91","guard":[["hasAny",["egp","item number","lower case","lowercase","nth","position","small letters"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Egyptian Pound."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-614bd231","guard":[["hasAny",["element","item number","nth","position","top"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Pa’anga."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-640a38b2","guard":[["hasAny",["element","item number","npr","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Nepalese Rupee."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-69058ddc","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","ttd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Trinidad and Tobago Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-693ecde6","guard":[["hasAny",["element","item number","nth","position","xad"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Arab Accounting Dinar."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-6a215d5a","guard":[["hasAny",["awg","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Aruban Florin."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6ded37c3","guard":[["hasAny",["element","item number","nth","position","xpd"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Palladium."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-702f6216","guard":[["hasAny",["irr","item number","lower case","lowercase","nth","position","small letters"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iranian Rial."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-70655ecb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","inr","item number","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Indian Rupee."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7770281a","guard":[["hasAny",["item number","krw","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Won."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-77ea16e4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","ngn","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Naira."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-78664e8b","guard":[["hasAny",["item number","lower case","lowercase","nth","omr","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Rial Omani."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-787f3f59","guard":[["hasAny",["element","item number","kmf","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Comorian Franc."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-78c4ed18","guard":[["hasAny",["item number","lower case","lowercase","nth","pgk","position","small letters"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Kina."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7961afe6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pen","position","title case"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sol."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-797d2ff1","guard":[["hasAny",["element","item number","nth","position","uyi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Uruguay Peso en Unidades Indexadas (UI)."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-7a3d1e4b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","egp","item number","nth","position","title case"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Egyptian Pound."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7b30b4dc","guard":[["hasAny",["element","item number","nth","nzd","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the New Zealand Dollar."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-8164bb2a","guard":[["hasAny",["element","item number","ngn","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Naira."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-827d690d","guard":[["hasAny",["element","item number","nth","pab","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Balboa."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-87fc9e8d","guard":[["hasAny",["element","item number","nth","omr","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Rial Omani."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-885638dc","guard":[["hasAny",["item number","lower case","lowercase","nth","position","pyg","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Guarani."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-88dcbe85","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","uyu"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Peso Uruguayo."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8fafad6b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dzd","item number","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Algerian Dinar."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8fb05cea","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","pyg","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Guarani."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-90c19e7f","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","tnd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Tunisian Dinar."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9195dc33","guard":[["hasAny",["clf","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Unidad de Fomento."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-91a382c1","guard":[["hasAny",["element","item number","nth","position","xbd"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bond Markets Unit European Unit of Account 17 (E.U.A.-17)."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-92806e1e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","tnd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Tunisian Dinar."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-97e81570","guard":[["hasAny",["element","item number","nth","position","uyu"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Peso Uruguayo."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-98dd2c75","guard":[["hasAny",["element","gnf","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Guinean Franc."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-9bf20276","guard":[["hasAny",["element","item number","nth","pgk","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Kina."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-9cbdf779","guard":[["hasAny",["element","item number","myr","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Malaysian Ringgit."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-aa03d267","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","pgk","position","title case"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Kina."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-abc39b25","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","szl","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Lilangeni."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ad083229","guard":[["hasAny",["item number","lower case","lowercase","mga","nth","position","small letters"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Malagasy Ariary."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-af14513e","guard":[["hasAny",["element","isk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iceland Krona."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-af68b94e","guard":[["hasAny",["element","ghs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Ghana Cedi."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-b1002b5c","guard":[["hasAny",["byn","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Belarusian Ruble."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b33d32a5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","mop","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Pataca."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b3d4187b","guard":[["hasAny",["element","item number","nth","position","xbc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Bond Markets Unit European Unit of Account 9 (E.U.A.-9)."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-b48f70a8","guard":[["hasAny",["bdt","item number","lower case","lowercase","nth","position","small letters"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Taka."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b77a341f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","krw","nth","position","title case"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Won."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b7b2d2af","guard":[["hasAny",["element","item number","lbp","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Lebanese Pound."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-bb994ba1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","irr","item number","nth","position","title case"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iranian Rial."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bfe64a0b","guard":[["hasAny",["element","item number","nth","position","tjs"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Somoni."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-c2933ecc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gnf","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Guinean Franc."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c2d8c215","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","tzs"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Tanzanian Shilling."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c7dd3235","guard":[["hasAny",["element","item number","nth","position","stn"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Dobra."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-cb7eed8c","guard":[["hasAny",["cop","element","item number","nth","position"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Colombian Peso."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-ccdbd065","guard":[["hasAny",["element","item number","nth","position","szl"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Lilangeni."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-cec0f9b5","guard":[["hasAny",["brl","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Brazilian Real."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d13ae7e2","guard":[["hasAny",["element","item number","nth","position","tnd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Tunisian Dinar."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-d1e9e495","guard":[["hasAny",["element","item number","mop","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Pataca."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-d208d3f7","guard":[["hasAny",["element","item number","nth","pen","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Sol."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-d3f6bd8f","guard":[["hasAny",["item number","lower case","lowercase","ngn","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Naira."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d40dffa3","guard":[["hasAny",["element","item number","mga","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Malagasy Ariary."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-d4e1e2ce","guard":[["hasAny",["fkp","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Falkland Islands Pound."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d6a71cb9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","title case","ttd"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Trinidad and Tobago Dollar."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d6d87319","guard":[["hasAny",["bif","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Burundi Franc."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-d7e6fab3","guard":[["hasAny",["isk","item number","lower case","lowercase","nth","position","small letters"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Iceland Krona."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d8b55d7a","guard":[["hasAny",["element","fkp","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Falkland Islands Pound."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-dc8474aa","guard":[["hasAny",["awg","element","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Aruban Florin."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-dd58b6b7","guard":[["hasAny",["egp","element","item number","nth","position"]],["has","with"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Egyptian Pound."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-dec86a16","guard":[["hasAny",["element","gel","item number","nth","position"]],["not",["has","country"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Lari."]},["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"code"}]],"mem":null},
{"id":"n-e799c8eb","guard":[["hasAny",["brl","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," stands for the Brazilian Real."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which currency has the code AWG","expect":{"contains":["Aruban Florin"],"notRefusal":true}},{"q":"what currency is SSP","expect":{"contains":["South Sudanese Pound"],"notRefusal":true}},{"q":"what currency is GMD","expect":{"contains":["Dalasi"],"notRefusal":true}},{"q":"which currency has the code TJS","expect":{"contains":["Somoni"],"notRefusal":true}},{"q":"what currency is LAK","expect":{"contains":["Lao Kip"],"notRefusal":true}},{"q":"what currency is AOA","expect":{"contains":["Kwanza"],"notRefusal":true}},{"q":"which currency has the code DZD","expect":{"contains":["Algerian Dinar"],"notRefusal":true}},{"q":"name the currency with the ISO code PEN","expect":{"contains":["Sol"],"notRefusal":true}},{"q":"which currency has the code ISK","expect":{"contains":["Iceland Krona"],"notRefusal":true}},{"q":"which currency has the code MGA","expect":{"contains":["Malagasy Ariary"],"notRefusal":true}},{"q":"name the currency with the ISO code TOP","expect":{"contains":["Pa’anga"],"notRefusal":true}},{"q":"what currency is WST","expect":{"contains":["Tala"],"notRefusal":true}},{"q":"what currency is EUR","expect":{"contains":["Euro"],"notRefusal":true}},{"q":"name the currency with the ISO code BYN","expect":{"contains":["Belarusian Ruble"],"notRefusal":true}},{"q":"what currency is DJF","expect":{"contains":["Djibouti Franc"],"notRefusal":true}},{"q":"what currency is GYD","expect":{"contains":["Guyana Dollar"],"notRefusal":true}},{"q":"name the currency with the ISO code VES","expect":{"contains":["Bolívar Soberano"],"notRefusal":true}},{"q":"which currency has the code RUB","expect":{"contains":["Russian Ruble"],"notRefusal":true}},{"q":"name the currency with the ISO code HKD","expect":{"contains":["Hong Kong Dollar"],"notRefusal":true}},{"q":"which currency has the code GEL","expect":{"contains":["Lari"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
