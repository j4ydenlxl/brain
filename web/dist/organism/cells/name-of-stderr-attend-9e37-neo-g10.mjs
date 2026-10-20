// name-of-stderr-attend-9e37-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"name-of-stderr-attend-9e37-neo-g10","class":"name-of-stderr-attend-9e37","generation":10,"lane":"neo","grownFrom":["what is the name of 1.7303212e-4","give the name for 2.2198165e-4","tell me the name of the stderr attend 1.7635041e-4","give the name for 2.4199863e-4","give the name for 2.0201955e-4","what is the name of 5.2641459e-5","tell me the name of the stderr attend 2.9188505e-4","tell me the name of the stderr attend 6.3080144e-5","what is the name of 1.8878646e-4","give the name for 7.7458848e-5","give the name for 1.6549861e-4","tell me the name of the stderr attend 2.349378e-4","give the name for 1.6146914e-4","give the name for 2.6184341e-4","tell me the name of the stderr attend 1.84021e-4","give the name for 1.0397455e-4","give the name for 1.4205331e-4","tell me the name of the stderr attend 1.3332037e-4","what is the name of 1.60057e-4","give the name for 1.9091617e-4"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-college-admissions-92be5b","columns":["stderr attend","name"],"n":1946,"cols":[{"f":"01.2032317e-4|07.1696955e-4|01.8320329e-4|29618339e-4|07.8598947e-5|01.0271286e-4|02.7171153e-4|29441051e-4|03.0337556e-4|02.8273507e-4|24629023e-4|28213082e-4|00.0013310739|01.062372e-4|21893791e-4|00.0022966466|02.086553e-4|09.8496629e-4|02.6979542e-4|20144843e-4|06.2257153e-5|01.1104084e-4|09.2472081e-5|01.5638779e-4|07.4262491e-5|02.8892176e-4|01.5571016e-4|00.0016757515|06.1647806e-5|00.0011307073|5213684|01.7696738e-4|00.0010534567|05.9971062e-5|03.5717105e-4|01.7402784e-4|3268385e-4|05.7488127e-5|02.0597826e-4|05.5200537e-4|31056e-4|24562981e-5|02.161845e-4|00.0048990641|02.4528231e-4|06.7444547e-5|2891627e-4|05.2525891e-5|09.4827563e-5|02.1678722e-4|07.783949e-5|01.0423663e-4|21377357e-4|00.0030373433|02.1070248e-4|27219238e-4|06.6034886e-4|02.1317025e-4|03.8063587e-4|00.0012369637|01.5642474e-4|22546852e-4|02.6384549e-4|08.0440943e-5|03.8842397e-4|00.0026190195|01.4840963e-4|03.0986365e-4|25992364e-4|09.0275489e-4|02.3344652e-4|01.0951854e-4|09.54516e-5|01.2417331e-4|00.0022480239|01.6853875e-4|03.1931474e-4|05.1476737e-4|01.3708619e-4|02.0455325e-4|05.0407489e-5|04.7680103e-5|06.0754665e-4|01.6146914e-4|3757821e-4|00.0012842461|02.7889467e-4|26494841e-4|06.6381239e-4|01.5667611e-4|05.3778017e-4|03.1594204e-4|01.7004146e-4|00.0019577115|01.317843e-4|20672525e-4|03.2382761e-4|02.184474e-4|03.4802651e-5|01.8372631e-4|25578883e-4|27909553e-4|28255768e-4|06.2675175e-4|01.1310026e-4|04.0784962e-5|06.2247469e-5|08.5960535e-5|09.548261e-5|03.2363879e-4|06.9640104e-5|3444464e-4|01.8062153e-4|07.0463269e-5|00.0013778987|01.8084365e-4|07.4634881e-5|01.5726298e-4|02.389963e-4|01.4364686e-4|05.6665117e-4|03.8106175e-4|01.0233268e-4|04.3211816e-4|05.8184422e-5|07.4446271e-4|03.9134937e-4|01.742906e-4|289068e-4|21324072e-4|26780058e-4|07.1766961e-4|03.4095033e-4|04.1868514e-4|06.2966086e-5|08.6112379e-4|01.5460345e-4|00.0026798835|01.2421595e-4|00|1.00068989489000000005|589428935000000005|410025246|734464|766351|6119485|743877|6222035|734538|794673|6323271|78496|791374|6467175|777772|788125|798117|6504831|766036|660447|6710392|744072|797443|6914729|730352|792803|51140355|76805|6284417|6341295|773302|783013|85933|651041|6620622|742227|86454|6738429|972|746384|6836383|6902937|52035229|767169|6418666|720358|6630972|6736365|6895815|6922677|53038691|6242095|6320395|8846|6405309|799201|6663912|6745344|761425|786906|6941885|768515|54048072|781806|6294358|6308138|6419052|724347|656018|87223|783522|67876|89979|6881088|6910385|55127929|6364585|640594|6639163|761116|6781543|682698|56157806|6430573|6522391|750627|6816738|6900217|76841|5757942|6626028|738478|58014228|6350342|6477633|6509341|6983016|59248248|63147|760663|420181623|646495|51420666|773283|6604553|52375805|53338054|6784793|54268895|56097605|58957487|43056807|51348751|5421627|57901569|441053528|52649042|451798122|54024193|01.0010481e-4|54701e-4|425648e-4|432285e-4|45002e-4|484368e-4|498288e-4|3100511e-4|441166e-4|450039e-4|473972e-4|499213e-4|3210592e-4|433762e-4|3328637e-4|432798e-4|57669e-4|447857e-4|460017e-4|55735e-4|476239e-4|497455e-4|59011e-4|3406956e-4|411046e-4|54372e-4|57299e-4|426529e-4|436516e-4|453565e-4|462091e-4|492231e-4|3501519e-4|42373e-4|483611e-4|6767e-4|55545e-4|3660572e-4|475709e-4|58403e-4|48566e-4|3742763e-4|53029e-4|6684e-4|6793e-4|470472e-4|6885e-4|59149e-4|6546e-4|492883e-4|3805261e-4|429218e-4|462403e-4|55204e-4|473393e-4|390132e-4|410062e-4|457314e-4|461642e-4|54197e-4|21009345e-4|423416e-4|45076e-4|472693e-4|55213e-4|6569e-4|58545e-4|3110607e-4|433547e-4|45668e-4|478335e-4|3211792e-4|420528e-4|52521e-4|443929e-4|462731e-4|4724e-4|48057e-4|331002e-4|6578e-4|428782e-4|467835e-4|472592e-4|3415415e-4|451419e-4|486709e-4|490253e-4|3500277e-4|52871e-4|433386e-4|447758e-4|464969e-4|57356e-4|470694e-4|56797e-4|481795e-4|3603499e-4|41952e-4|466946e-4|3741111e-4|3831792e-4|52288e-4|54053e-4|455416e-4|465013e-4|478688e-4|494714e-4|58281e-4|3913633e-4|433893e-4|458045e-4|472928e-4|53378e-4|493352e-4|22003808e-4|54311e-4|446593e-4|452025e-4|46443e-4|59677e-4|490612e-4|54706e-4|311758e-4|427156e-4|440807e-4|451213e-4|481697e-4|320642e-4|422514e-4|448335e-4|455335e-4|479388e-4|483193e-4|3306805e-4|420517e-4|5572e-4|461839e-4|478686e-4|488662e-4|3414012e-4|432487e-4|458443e-4|484343e-4|351857e-4|42837e-4|448828e-4|466743e-4|3619299e-4|6677e-4|457382e-4|465446e-4|3710576e-4|420753e-4|453914e-4|461743e-4|48079e-4|57133e-4|381202e-4|462588e-4|56316e-4|470922e-4|488617e-4|3937523e-4|499834e-4|23000383e-4|6837e-4|438285e-4|441131e-4|5498e-4|56835e-4|452305e-4|53702e-4|57017e-4|461048e-4|52757e-4|54744e-4|474171e-4|485919e-4|3118582e-4|492841e-4|3204808e-4|413587e-4|430683e-4|45905e-4|470433e-4|51117e-4|485021e-4|3310705e-4|53557e-4|432037e-4|445375e-4|461247e-4|3435798e-4|444756e-4|56681e-4|465833e-4|59135e-4|475154e-4|492159e-4|3517689e-4|430198e-4|474741e-4|490553e-4|5187e-4|3620807e-4|433969e-4|448713e-4|458099e-4|470813e-4|496187e-4|3721327e-4|56014e-4|476201e-4|490387e-4|3817687e-4|433943e-4|54312e-4|440446e-4|3911806e-4|453816e-4|475444e-4|482027e-4|56563e-4|490561e-4|5359e-4|24002416e-4|424993e-4|470945e-4|481268e-4|313389e-4|5752e-4|448308e-4|497524e-4|3201386e-4|55331e-4|430379e-4|453244e-4|56264e-4|58333e-4|3303118e-4|56493e-4|433997e-4|482179e-4|54753e-4|58435e-4|59916e-4|3415676e-4|439755e-4|440427e-4|59263e-4|45021e-4|489e-4|3510001e-4|432389e-4|53743e-4|58405e-4|451991e-4|498043e-4|3624327e-4|56808e-4|465711e-4|479358e-4|3714025e-4|429163e-4|443472e-4|57391e-4|452299e-4|58189e-4|59871e-4|48152e-4|49335e-4|3846935e-4|465433e-4|492219e-4|3915233e-4|42076e-4|54786e-4|455737e-4|25033143e-4|55941e-4|459192e-4|495736e-4|3104437e-4|453627e-4|75e-4|462816e-4|53967e-4|472972e-4|495081e-4|3215033e-4|58684e-4|6883e-4|428291e-4|439586e-4|445182e-4|487116e-4|3309655e-4|411279e-4|58223e-4|423132e-4|45349e-4|462933e-4|56184e-4|3411999e-4|436564e-4|45515e-4|469627e-4|3507379e-4|42203e-4|442435e-4|453086e-4|55507e-4|462245e-4|496648e-4|3681059e-4|3708605e-4|430335e-4|5232e-4|472019e-4|6731e-4|55225e-4|56655e-4|58044e-4|3821707e-4|430113e-4|390366e-4|450941e-4|470058e-4|56957e-4|260057e-4|422217e-4|446672e-4|461713e-4|3113475e-4|59637e-4|435685e-4|447051e-4|456181e-4|474986e-4|482322e-4|54855e-4|3207572e-4|416983e-4|459526e-4|464468e-4|482464e-4|3305421e-4|6577e-4|428096e-4|467312e-4|3409896e-4|493548e-4|57394e-4|3542673e-4|59861e-4|452914e-4|496487e-4|3629221e-4|450466e-4|465441e-4|485428e-4|495053e-4|3758961e-4|46765e-4|493613e-4|3833725e-4|442771e-4|59131e-4|481495e-4|5287e-4|3901994e-4|59307e-4|427399e-4|442275e-4|465072e-4|472727e-4|57388e-4|59665e-4|27014125e-4|449527e-4|467691e-4|483694e-4|57049e-4|59416e-4|3109407e-4|431437e-4|55785e-4|489188e-4|491173e-4|58891e-4|3216659e-4|431457e-4|473623e-4|48269e-4|3303212e-4|418592e-4|460364e-4|487629e-4|3404715e-4|55761e-4|431752e-4|440862e-4|488963e-4|3522137e-4|3603584e-4|422416e-4|435041e-4|59014e-4|456859e-4|470321e-4|56239e-4|59502e-4|3729549e-4|437356e-4|443098e-4|452008e-4|476774e-4|3810575e-4|433977e-4|485817e-4|499614e-4|3902856e-4|431197e-4|487027e-4|28022864e-4|444403e-4|3121832e-4|59165e-4|442789e-4|451473e-4|490972e-4|3216984e-4|433157e-4|57383e-4|443276e-4|464748e-4|476472e-4|481331e-4|3312117e-4|425506e-4|448583e-4|467841e-4|473119e-4|57665e-4|492864e-4|34021e-4|438986e-4|457801e-4|477623e-4|3507404e-4|422017e-4|436528e-4|467055e-4|492953e-4|53027e-4|57672e-4|3627681e-4|433595e-4|469553e-4|470282e-4|55142e-4|6499e-4|59095e-4|483713e-4|496005e-4|6625e-4|380823e-4|437713e-4|478646e-4|487181e-4|3902427e-4|435373e-4|29004788e-4|57915e-4|46347e-4|485576e-4|491617e-4|3101897e-4|415026e-4|421123e-4|3210315e-4|51705e-4|443258e-4|3329712e-4|434326e-4|479053e-4|488697e-4|340933e-4|430665e-4|457408e-4|479408e-4|483066e-4|3537221e-4|455369e-4|59104e-4|473272e-4|48096e-4|3605934e-4|410403e-4|434604e-4|467289e-4|59994e-4|473842e-4|3727924e-4|483966e-4|3843837e-4|459873e-4|471838e-4|55185e-4|57963e-4|491399e-4|3918801e-4|4214e-4|430865e-4|447863e-4|465402e-4|482959e-4|53242e-4|02.0010999e-4|450234e-4|480278e-4|3110383e-4|451486e-4|482831e-4|3201955e-4|446353e-4|476003e-4|3306272e-4|420108e-4|435846e-4|448652e-4|3405483e-4|427999e-4|454834e-4|476768e-4|3510859e-4|423697e-4|440871e-4|52995e-4|492756e-4|3657606e-4|483366e-4|3706849e-4|438138e-4|464094e-4|59393e-4|489563e-4|3845761e-4|58621e-4|459437e-4|463552e-4|494151e-4|3910682e-4|52166e-4|453025e-4|464096e-4|480916e-4|498318e-4|21059746e-4|473174e-4|3161792e-4|479418e-4|485483e-4|3234325e-4|446147e-4|459223e-4|489467e-4|343626e-4|450243e-4|768e-4|59712e-4|3522863e-4|458837e-4|3649849e-4|462253e-4|57463e-4|499059e-4|3707748e-4|41379e-4|54262e-4|443626e-4|473887e-4|54363e-4|48896e-4|3811355e-4|427607e-4|44445e-4|59912e-4|453055e-4|480282e-4|51565e-4|49932e-4|3912115e-4|459982e-4|469227e-4|482221e-5|54401e-4|22015281e-4|6994e-4|421789e-4|57458e-4|432607e-4|472021e-4|490093e-4|3126324e-4|434534e-4|498165e-4|3215646e-4|432556e-4|454634e-4|463297e-4|3311651e-4|497193e-4|3410127e-4|486979e-4|59786e-4|3516695e-4|445655e-4|3628544e-4|474943e-4|494895e-4|3762353e-4|3805169e-4|481433e-4|3901827e-4|56487e-4|417283e-4|423904e-4|439515e-4|464238e-4|57756e-4|23021112e-4|3138976e-4|455195e-4|59344e-4|471573e-4|3201555e-4|472297e-4|3359315e-4|3420733e-4|432838e-4|49292e-4|5378e-4|3527595e-4|438707e-4|466127e-4|481584e-4|55027e-4|3638592e-4|451334e-4|370685e-4|41695e-4|435847e-4|449701e-4|459014e-4|477218e-4|495354e-4|3824545e-4|56944e-4|439371e-4|452201e-4|3943176e-4|471409e-4|58921e-4|491466e-4|24018758e-4|47531e-4|3116736e-4|466694e-4|482741e-4|493204e-4|59863e-4|3247609e-4|460594e-4|536e-4|491435e-4|57604e-4|3341563e-4|455622e-4|462603e-4|34177e-4|424397e-4|3506432e-4|429832e-4|440929e-4|461421e-4|485787e-4|3605796e-4|56608e-4|420289e-4|457176e-4|469638e-4|480546e-4|491536e-4|3770672e-4|3834863e-4|448469e-4|469104e-4|3900062e-4|5865e-4|42918e-4|46728e-4|59343e-4|491835e-4|25035805e-4|444868e-4|461428e-4|492324e-4|3130567e-4|447674e-4|462421e-4|476091e-4|495049e-4|3235556e-4|448088e-4|453074e-4|5858e-4|3324521e-4|47127e-4|3479228e-4|493873e-4|3529161e-4|463125e-4|57273e-4|3610637e-4|420099e-4|448728e-4|473033e-4|3745155e-4|484047e-4|3878521e-4|481999e-4|3901844e-4|4491e-4|451469e-4|490515e-4|26123531e-4|457763e-4|484341e-4|491291e-4|55066e-4|58768e-4|3240019e-4|3446494e-4|469669e-4|492708e-4|3519407e-4|360045e-4|438783e-4|3739753e-4|442343e-4|450303e-4|466369e-5|471441e-4|484683e-4|491511e-4|390157e-4|451011e-4|47279e-4|55115e-4|493774e-4|27083076e-4|54214e-4|3159913e-4|460547e-4|49734e-4|3274844e-4|494984e-4|3315979e-4|435141e-4|477991e-4|49887e-4|3406644e-5|414141e-4|446449e-4|456903e-4|3562366e-4|492445e-4|53586e-4|3604398e-4|462329e-4|487059e-4|3725229e-4|479082e-4|3823702e-5|481117e-4|3901927e-4|432768e-4|468912e-4|28020007e-4|492272e-4|3114804e-4|56236e-4|438782e-4|4432e-4|3230937e-4|4455e-4|462398e-4|55076e-4|3360172e-4|340113e-4|436285e-4|464673e-4|490194e-4|3515339e-4|471484e-4|3635308e-4|3849578e-5|4604e-4|472793e-4|53852e-4|3964205e-4|29038408e-4|455355e-4|466353e-4|3159227e-4|471671e-4|488505e-4|3204201e-4|472895e-4|5926e-4|482729e-4|57735e-4|3309225e-4|413233e-4|458809e-4|468966e-4|479112e-4|3413865e-4|461388e-4|470335e-4|480617e-4|3516063e-4|58106e-4|423588e-5|493607e-4|3688721e-4|3758425e-4|469406e-4|495902e-4|3825758e-5|448045e-4|456336e-4|03.0080078e-4|492799e-4|3170922e-4|53031e-5|6859e-4|3218795e-4|43039e-4|452023e-4|464945e-4|57955e-4|3300772e-4|472996e-4|3508763e-4|425468e-4|5667e-4|444057e-4|3612253e-4|432532e-4|58615e-4|3716762e-4|44487e-4|55927e-4|476573e-4|38455e-4|450118e-4|471853e-4|39077e-4|492183e-4|21005708e-4|413601e-4|56133e-4|430615e-4|441476e-4|469867e-4|310797e-4|427947e-4|456687e-5|46497e-4|482619e-5|3210933e-4|57869e-4|491798e-4|3323649e-4|438193e-4|468734e-4|3555156e-4|460051e-4|56736e-4|496681e-4|58166e-4|3651635e-4|3711554e-4|450047e-4|3808615e-4|434661e-5|462961e-4|3909259e-4|440412e-4|22016632e-4|440785e-4|58536e-4|460564e-4|488422e-4|3123295e-4|57704e-5|431185e-4|440501e-4|6961e-4|49627e-4|3224559e-4|57492e-4|442545e-4|53674e-4|455208e-4|56707e-4|58956e-4|334446e-4|468142e-4|3447951e-4|48436e-4|3543663e-5|56787e-4|58918e-4|3746498e-4|451408e-4|466146e-4|3815035e-4|436164e-4|454915e-4|23013342e-4|59387e-4|3110791e-5|436876e-4|3219028e-4|461068e-4|491653e-5|3467475e-4|3507284e-5|471015e-4|49761e-4|361743e-4|438612e-4|454537e-4|484776e-4|370863e-4|42633e-5|3835723e-4|492988e-4|3954767e-4|466757e-4|24094305e-4|3199405e-5|3288946e-4|3308195e-4|470253e-4|497886e-5|3423175e-4|3582481e-4|6696e-4|58508e-4|3698439e-4|3761259e-5|492183e-4|3974754e-4|25033602e-4|469216e-4|475302e-4|313206e-4|467942e-4|47218e-4|54712e-4|5812e-5|3221179e-4|495662e-4|3432758e-4|482075e-4|3504444e-4|421534e-4|457074e-5|481487e-4|3611851e-4|44122e-4|4773e-4|3706218e-4|3808346e-4|429205e-5|444621e-4|26002332e-4|497126e-4|3102507e-4|451442e-4|465124e-4|6391e-5|479478e-4|3224832e-5|3339705e-5|452786e-4|3504387e-4|470065e-5|3694654e-4|55818e-4|3712646e-4|452189e-4|3830985e-4|493736e-5|3915467e-4|453825e-5|46366e-4|484813e-4|2700456e-4|464718e-5|3182088e-4|3412563e-5|3528996e-4|437036e-5|484712e-5|3600246e-5|493782e-4|3720636e-4|544e-4|58559e-4|3812439e-5|396065e-4|486366e-4|28005435e-4|472505e-4|483858e-4|310098e-4|433972e-4|454304e-4|3475491e-4|3534103e-4|3742495e-4|465883e-4|3819431e-5|6516e-4|458462e-4|498425e-4|3977701e-4|29028385e-4|456584e-5|3158731e-5|3333315e-4|49409e-5|341778e-4|420661e-4|451907e-4|3509006e-4|3615939e-4|3738166e-5|493893e-5|3945942e-4|472805e-5|04.0061619e-5|3332652e-5|457935e-4|3415538e-4|436971e-5|477657e-4|483821e-4|3524077e-4|3616561e-4|482757e-5|3815311e-4|3907279e-4|435635e-4|450614e-4|21060848e-4|3105272e-4|490727e-4|3228379e-4|4311e-4|3327797e-4|3404783e-5|479991e-5|494973e-4|3571177e-5|3759486e-5|480109e-4|3867985e-4|477414e-5|3927019e-4|440689e-4|22155504e-4|462082e-4|493793e-4|3367828e-5|47809e-4|342608e-5|477192e-4|3862305e-4|53103e-5|3911133e-4|438525e-4|462458e-4|482763e-5|23023514e-4|454915e-4|486504e-5|3111501e-4|58856e-4|446138e-4|493366e-5|3215408e-5|3361008e-4|3424885e-4|432436e-5|3608522e-4|3850261e-5|3995553e-4|24035511e-5|479628e-5|3108275e-4|476581e-5|3254508e-4|470633e-5|3353158e-4|469034e-4|3464192e-4|3556713e-4|3638466e-5|472066e-4|497445e-4|3726214e-4|3965939e-4|25019158e-4|487003e-5|3135836e-4|465609e-4|3267043e-5|337623e-4|496117e-4|59019e-4|3417015e-5|3562812e-4|3679041e-4|3711169e-4|5673e-5|3949015e-5|485125e-5|26003563e-4|485197e-4|3294616e-4|3322276e-4|471043e-4|3703589e-4|3961486e-5|27009122e-5|444316e-4|468248e-4|47262e-4|3230007e-4|46176e-4|3375009e-4|481924e-4|3470796e-5|3602603e-4|428688e-5|3859401e-4|492821e-4|3921008e-4|28067098e-4|3133916e-5|46404e-4|480966e-5|320071e-4|435085e-4|3609346e-4|483112e-5|495973e-4|3880628e-4|3984268e-5|29059727e-5|469426e-5|3175322e-4|48786e-4|3224931e-5|3303413e-5|442628e-4|465871e-4|58822e-4|485428e-4|3498933e-4|3717777e-4|05.0053617e-4|55965e-5|3162675e-4|3351064e-4|3436263e-4|447695e-4|473227e-5|3519277e-5|3652365e-4|470252e-4|3717146e-5|420101e-4|469403e-4|471068e-4|3881517e-4|59148e-4|498461e-4|3916197e-4|21100968e-5|469711e-5|3463918e-5|3523733e-4|434891e-5|360732e-4|380958e-4|486623e-4|22035606e-4|444772e-5|3163705e-5|58009e-5|3202068e-4|56515e-4|486901e-5|335627e-5|3406576e-5|3561262e-4|3641459e-5|471032e-5|3707433e-5|443293e-5|3819285e-4|6512e-4|3921352e-4|23137878e-4|463676e-4|335501e-4|3478445e-5|368854e-4|3719526e-5|2403909e-4|3179294e-5|3225279e-4|479069e-4|3609518e-5|376865e-5|3808921e-4|427949e-5|462478e-4|3963317e-4|25017899e-5|481506e-5|3152562e-4|49595e-4|3213e-5|459425e-4|3326452e-4|3529235e-4|496646e-4|364146e-4|3984512e-4|26047383e-4|3245754e-4|3306213e-5|3487526e-5|3504336e-4|3603069e-5|54063e-4|44596e-5|3875218e-4|27037159e-5|464637e-4|47562e-5|493464e-5|3129637e-5|4528e-5|3625137e-5|472369e-5|3807058e-4|472174e-5|3977461e-5|28286404e-4|341543e-5|434489e-5|3538065e-4|465762e-5|493071e-4|3665109e-4|3701931e-4|437034e-5|29297054e-5|3392707e-5|3475994e-4|357706e-4|3600356e-5|421537e-4|380179e-5|3902098e-4|06.0003385e-5|452384e-4|3109538e-4|439789e-4|3284242e-4|3347622e-5|475826e-4|56828e-4|3783139e-5|3817989e-4|21044171e-5|555e-4|3154031e-5|330914e-5|424376e-5|43159e-4|3404402e-4|711e-5|55823e-4|361835e-4|3743736e-4|3825696e-5|494924e-4|3904488e-4|471936e-5|59874e-5|486088e-5|22124273e-5|3440413e-5|51785e-4|3558829e-4|3709165e-5|440291e-4|23080144e-5|3115265e-4|3423824e-4|3715263e-5|478809e-4|3974716e-5|24014003e-4|440905e-5|493278e-5|3505868e-5|59339e-4|447441e-4|6948e-4|3674088e-5|56115e-4|3728846e-4|3884173e-4|25085239e-4|3248285e-5|3403365e-5|3617205e-5|494004e-4|3701106e-4|3843837e-5|456038e-5|495106e-4|3929582e-4|26198892e-4|3220651e-5|472318e-5|3371431e-4|341816e-4|3560693e-5|3766789e-4|3925731e-4|431629e-5|27145796e-5|3242346e-4|3349756e-4|3595902e-5|3677647e-5|3710942e-5|471514e-5|486466e-5|3859306e-5|468772e-5|496784e-5|28109616e-4|427201e-4|3225061e-5|59361e-5|436334e-4|460246e-4|3395515e-5|3453628e-5|3524666e-4|3640953e-4|3776158e-4|499018e-5|38168e-5|476354e-5|3938808e-4|448383e-4|29011044e-4|493498e-5|3262984e-5|3358101e-4|3509508e-5|499831e-5|07.0082664e-4|3210932e-5|448748e-4|473585e-4|3361502e-4|48992e-5|3598023e-4|360034e-4|21038645e-5|3182665e-5|3214366e-4|3377894e-5|3406155e-4|3560433e-5|491826e-4|3637151e-5|447053e-5|455741e-5|48313e-4|3781961e-4|3860355e-4|3912399e-4|22056646e-5|3147523e-5|475651e-5|3297029e-5|3369236e-4|3494708e-4|3755007e-4|3864277e-5|23061892e-5|3105519e-5|422303e-4|47416e-4|3357485e-5|3526615e-5|440508e-4|487452e-4|3712028e-5|422721e-4|53379e-5|3800788e-5|429819e-5|449616e-5|467304e-5|3949326e-5|24070127e-4|3135394e-5|3326771e-4|3407941e-4|471296e-5|3721836e-5|3892247e-4|25124546e-5|482186e-5|3292698e-4|3473494e-5|3505443e-5|4246e-5|3994991e-4|26165068e-4|3385768e-5|3453209e-5|357332e-5|486928e-4|3633028e-4|449281e-5|3849385e-5|453343e-5|3978956e-4|2714855e-5|480087e-4|3267476e-5|3441626e-5|458848e-5|477111e-5|355791e-5|473064e-4|3817342e-5|28035155e-5|494432e-5|3115019e-4|420975e-5|3203401e-4|447563e-4|3321515e-5|3570258e-5|29180187e-5|3317804e-4|3475768e-4|499754e-5|3517456e-5|08.0059422e-4|3117962e-4|3509053e-4|435165e-4|3654206e-4|3734004e-5|487699e-4|21059529e-4|319148e-5|3212922e-5|3403553e-4|480161e-5|498106e-4|3582548e-5|493993e-5|3606915e-5|45482e-5|461616e-5|3751081e-5|3832251e-5|22029837e-5|318119e-4|335695e-5|3508472e-5|487467e-5|3611798e-5|6899e-5|489294e-5|23099981e-4|3220169e-5|3490653e-5|3674357e-5|57834e-5|3974237e-4|24045867e-4|3421197e-5|477093e-4|3600365e-4|484041e-5|499997e-5|3726867e-5|3814303e-5|448485e-5|3921648e-4|25162625e-5|59444e-4|476231e-5|3250642e-5|3452077e-5|491098e-5|3618958e-5|374425e-5|26069907e-5|3109911e-5|423386e-5|3200214e-4|416671e-5|3507207e-5|3619388e-5|498252e-5|376041e-5|27207081e-5|334524e-4|3554334e-5|3646826e-4|487827e-4|3768363e-5|490475e-5|28128704e-4|3353765e-5|56188e-5|3601082e-5|445305e-5|460262e-4|3777932e-5|3895072e-4|29022215e-5|59962e-4|3228922e-4|3388236e-4|3523336e-4|461414e-5|368031e-4|3758774e-5|3831054e-5|455061e-4|489763e-5|3925838e-5|436744e-4|09.0111775e-5|3237934e-4|447527e-4|3342306e-4|3549678e-5|3905589e-5|488103e-4|499843e-4|21027163e-5|313409e-5|3264345e-5|333391e-5|454348e-5|3690931e-4|3724134e-5|22005692e-5|59106e-4|429508e-4|3133752e-4|3238755e-5|457129e-4|3329911e-4|460569e-5|483234e-5|3602597e-4|3720344e-5|445693e-5|3809707e-5|411453e-5|2301558e-4|428109e-5|442479e-5|475279e-5|3219976e-5|454505e-4|3356015e-5|470717e-4|58483e-5|347446e-5|485852e-4|3529779e-5|3612541e-4|49101e-4|3813585e-5|45671e-5|3930379e-5|56629e-5|445382e-5|24077877e-5|48786e-5|3145676e-4|3328745e-5|3494055e-5|58944e-5|3535778e-4|3604606e-5|463024e-5|3859168e-4|25033691e-5|451524e-5|481472e-5|3292018e-4|383863e-5|3902046e-4|26007461e-5|418899e-5|466738e-5|476779e-4|318426e-5|3227843e-5|486129e-4|3426817e-4|431788e-5|35051e-4|3646196e-5|3723711e-4|474333e-5|3870775e-5|3931763e-5|454296e-5|55162e-5|27040967e-5|459266e-5|3142183e-5|450856e-5|3227377e-5|483169e-5|3359363e-5|3578508e-5|486446e-5|3669999e-4|3913151e-5|475123e-4|28099932e-5|3115148e-4|3257355e-5|3384582e-5|3534125e-5|3734607e-5|489588e-4|29198532e-4|3267124e-4|3326695e-5|483609e-4|496035e-5|3405518e-4|3525801e-5|3843566e-4|452134e-4|3968142e-4","sep":"|"},{"d":"American University|Amherst College|Auburn University|Barnard College|Bates College|Baylor University|Binghamton University|Boston College|Boston University|Bowdoin College|Brandeis University|Brigham Young University|Brown University|Bryn Mawr College|Bucknell University|California Institute Of Technology|Carleton College|Carnegie Mellon University|Case Western Reserve University|Claremont Mckenna College|Clark University|Clemson University|Colby College|Colgate University|College Of The Holy Cross|College Of William & Mary|Colorado School Of Mines|Columbia University In The City Of New York|Connecticut College|Cornell University|Dartmouth College|Davidson College|Duke University|Elon University|Emory University|Florida State University|Fordham University|Franklin & Marshall College|George Washington University|Georgetown University|Georgia Institute Of Technology|Gonzaga University|Hamilton College|Harvard University|Haverford College|Howard University|Johns Hopkins University|Kenyon College|Lafayette College|Lehigh University|Loyola Marymount University|Macalester College|Marquette University|Massachusetts Institute Of Technology|Michigan State University|Middlebury College|New York University|North Carolina State University|Northeastern University|Northwestern University|Oberlin College|Occidental College|Ohio State University|Pepperdine University|Pomona College|Princeton University|Purdue University|Reed College|Rensselaer Polytechnic Institute|Rice University|Rutgers, The State University Of New Jersey|Santa Clara University|Scripps College|Southern Methodist University|Stanford University|State University Of New York At Buffalo|State University Of New York At Stony Brook|Swarthmore College|Syracuse University|Texas A&M University|Texas Christian University|Trinity College of Hartford, CT|Tufts University|University Of Alabama|University Of Arkansas|University Of California, Berkeley|University Of California, Davis|University Of California, Irvine|University Of California, Los Angeles|University Of California, Riverside|University Of California, San Diego|University Of California, Santa Barbara|University Of California, Santa Cruz|University Of Chicago|University Of Connecticut|University Of Delaware|University Of Florida|University Of Georgia|University Of Idaho|University Of Iowa|University Of Kansas|University Of Kentucky|University Of Miami|University Of Michigan - Ann Arbor|University Of Mississippi|University Of Montana|University Of Nevada , Reno|University Of New Hampshire|University Of New Mexico|University Of North Carolina - Chapel Hill|University Of North Dakota|University Of Notre Dame|University Of Oklahoma|University Of Oregon|University Of Pennsylvania|University Of Pittsburgh System|University Of Rhode Island|University Of Richmond|University Of Rochester|University Of South Florida|University Of Southern California|University Of Texas At Austin|University Of Utah|University Of Virginia|University Of Wyoming|Vanderbilt University|Vassar College|Villanova University|Virginia Polytechnic Institute & State University|Wake Forest University|Washington And Lee University|Washington University In St. Louis|Wellesley College|Wesleyan University|Whitman College|Williams College|Worcester Polytechnic Institute|Yale University|Yeshiva University","i":"0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,10,11,12,13,14,15,16,17,18,19,1a,1b,1c,1d,1e,1f,1g,1h,1i,1j,1k,1l,1m,1n,1o,1p,1q,1r,1s,1t,1u,1v,1w,1x,1y,1z,20,21,22,23,24,25,26,27,28,29,2a,2b,2c,2d,2e,2f,2g,2h,2i,2j,2k,2l,2m,2n,2o,2p,2q,2r,2s,2t,2u,2v,2w,2x,2y,2z,30,31,32,33,34,35,36,37,38,39,3a,3b,3c,3d,3e,3f,3g,3h,3i,3j,3k,3l,3m,3n,3o,3p,3q,3r,3s,3t,3u,19,t,2l,2t,2d,2p,3j,1e,17,36,2r,3p,36,22,2l,27,34,2,26,17,36,3d,2u,2d,1a,n,x,22,1h,36,22,1j,22,1h,22,1t,3t,f,8,22,3l,1h,1h,f,h,22,f,22,f,21,28,1i,1h,2b,1t,1t,3t,3f,3r,3t,3t,3t,f,1t,1t,1t,2l,2w,b,3t,1h,2a,1t,f,r,17,f,3t,1h,1k,3t,7,3t,17,22,13,3c,1t,1h,1h,1t,17,t,f,17,17,17,33,17,3h,2l,17,3n,17,1h,1t,2v,1n,c,3t,w,r,u,36,1h,17,1t,22,3t,17,z,d,2m,1u,2,2q,3s,10,2q,3q,39,34,2q,j,6,2f,l,12,23,l,3i,2q,3j,2n,2h,3m,3g,1f,2q,q,2c,2b,18,2,a,1u,32,12,37,16,2x,20,24,z,2s,2t,d,39,21,2h,1u,34,4,2t,d,2m,16,3i,2x,26,y,1d,2u,z,3j,3j,1j,1g,1p,3s,16,3g,1o,2h,2p,i,3o,2h,m,1r,v,1p,1j,24,2,2j,2b,1o,8,2e,29,7,3s,2f,q,2m,2e,2b,n,3u,3b,3u,6,2h,q,9,3p,2j,29,2r,2r,n,2t,1i,12,2x,2m,1f,1u,24,3p,4,1l,27,3,1f,2f,1o,s,q,3g,1y,1v,2h,2k,3m,3a,o,1r,3k,37,z,2r,3,8,3g,1u,23,d,2k,1c,2n,2c,24,2b,37,1g,3j,i,3k,2t,1j,12,2h,2m,2s,2x,2c,37,j,2r,2s,27,1d,3k,2p,2o,1i,11,y,3q,6,23,3q,1p,27,2,2f,z,2i,24,6,a,3g,6,2k,g,2p,1,2x,3s,20,1p,a,1q,o,3o,20,3a,a,1f,3s,1p,2f,i,2x,3s,2u,6,q,1f,10,23,1b,j,1i,3s,11,1l,1y,z,1c,1f,1w,3u,7,37,1o,2,3c,37,3a,3m,2p,1p,3u,o,1o,4,1j,35,1b,1i,3s,1r,18,2e,16,8,2k,27,3j,1r,6,3g,1l,3s,3u,34,1y,15,3q,2r,1l,24,1w,g,2o,m,s,1,2e,39,3u,g,1p,3k,s,1f,3i,2f,2e,v,3q,39,1d,3p,12,1y,15,1e,i,35,23,2j,2p,9,2f,p,2i,3s,29,1y,3q,o,i,3k,2t,28,v,1f,1f,15,1q,2e,k,4,2o,1y,0,m,1b,1e,31,o,2j,i,20,n,1q,28,3d,2k,3a,35,1w,27,1c,0,1f,i,11,o,15,1k,4,a,0,8,2r,3,1q,1e,21,30,7,3o,y,7,23,2y,1i,35,m,a,3o,1e,a,1y,j,6,3q,a,3k,3,24,1v,3b,15,2i,11,1b,1v,3b,2k,3m,g,25,20,21,27,1l,1s,3l,3b,1c,20,3,39,8,3a,0,35,q,j,j,e,25,3b,q,3m,p,2f,1w,2e,2o,2p,2k,31,2z,1v,18,2i,9,18,j,1z,1w,2m,2y,1q,2y,1m,3a,15,1j,2y,3c,a,2z,2g,37,3b,1w,16,3l,q,j,3o,1w,16,0,x,1k,1v,35,1b,7,p,1v,b,3,2i,20,21,3s,1c,3b,1l,3d,a,p,3m,i,2y,30,39,1l,30,m,26,1,3a,y,2m,n,v,x,3i,3i,1v,2j,26,j,2a,0,b,1v,3f,3o,3a,3i,3o,3p,18,2o,3i,37,5,1s,6,6,3a,2y,3d,1b,3s,3a,38,g,1c,28,3c,1d,29,3o,5,3e,1z,38,1m,1y,38,30,3o,v,e,1w,1l,2f,16,2j,38,1d,9,6,2u,2h,2u,e,29,1v,32,9,2a,31,16,1y,2m,3e,1u,p,2g,32,2z,2z,3e,10,m,3g,38,i,2j,1z,18,13,3i,b,1m,3,3l,3o,1i,1e,2e,30,10,3e,1e,34,2e,18,32,1o,10,32,21,18,38,i,14,3i,32,n,1q,3i,1u,2i,m,1u,2m,y,2e,x,2u,18,1u,5,g,1j,1u,b,b,1u,30,3,3f,9,3p,1z,1k,p,10,12,1l,18,3d,1o,l,1d,3i,1o,37,3e,1m,6,3r,13,2z,3,18,1o,3d,2v,12,31,g,28,2j,26,g,3p,14,32,l,3j,v,l,d,8,34,1a,3e,i,25,7,2i,i,10,3r,6,2e,e,2z,3f,1l,1o,25,1d,1z,2w,1a,3l,9,2m,y,37,2j,2u,l,1y,1o,30,1w,3k,g,34,x,2o,1,9,3o,1z,26,12,v,b,1w,31,16,37,2g,5,y,3m,39,2j,g,10,1j,g,2i,2j,2m,l,1,p,2t,n,25,1m,25,29,24,l,1w,2i,3m,9,37,1l,3k,34,1g,1y,39,3j,2n,2t,2w,1j,1s,29,25,2t,1v,2a,1q,2t,3p,13,1w,16,2t,2q,2t,2i,9,3j,2c,2v,2n,3n,2o,3f,3c,2s,5,3h,2y,2n,3c,34,x,1l,1x,p,19,1j,1d,12,e,3h,2,2n,1g,2,3p,25,8,2g,1y,1,2,3k,2i,x,12,1g,1q,2s,14,8,1g,29,34,2b,5,y,1g,2x,2i,26,14,2u,8,2x,y,2n,2n,e,3f,2e,2o,2o,2w,31,1d,h,z,1j,3i,z,1m,2b,2s,1a,n,2a,1,25,z,3j,2p,3d,12,2,2v,21,s,33,1r,3p,26,2u,2o,2c,25,2v,25,2,p,1g,14,2c,21,2s,2q,1,2o,2g,2c,14,2o,1q,1,31,2x,n,3p,2b,1x,8,3k,1j,7,2c,y,2p,1k,3l,1q,2p,11,z,3n,1m,14,2a,2p,1w,1k,z,33,19,28,2,1m,k,2s,2q,z,3j,2p,1q,1j,3l,3p,2q,2c,1,1n,25,28,x,2g,p,2p,4,31,3n,y,h,2v,s,2g,3f,27,2b,27,1q,1s,3n,8,2x,3r,27,2g,25,1,t,29,2s,3j,31,3k,7,3d,29,3b,1f,7,p,27,1n,2q,2w,s,s,t,3k,28,1a,31,27,3d,3o,4,1s,k,8,1m,14,3g,27,28,3c,s,28,1e,3d,w,31,1s,1r,1s,p,q,3d,14,3d,1m,1k,2r,3d,3c,2k,35,2r,13,1s,3r,31,2x,19,2w,k,2r,13,3c,2r,2g,19,2q,2d,3u,11,29,1s,3a,11,33,w,h,h,1r,2b,2w,u,1s,33,2i,2r,1s,1a,7,o,x,1k,28,15,1k,2g,1e,u,1m,2a,2r,b,d,1k,1r,3n,37,3u,3c,2b,c,35,2g,c,35,3h,3c,h,1r,19,15,14,x,1a,4,3r,x,2x,b,s,2a,k,3c,14,b,2d,4,1m,1a,a,1k,3f,o,1a,2v,x,b,14,b,1e,7,i,3c,15,11,28,3f,1a,1i,1v,13,20,3g,1p,1k,3f,1p,1l,33,1a,t,2y,7,1c,3f,3r,13,b,21,3r,3g,1x,2a,3u,d,1i,2d,1b,2h,35,r,1i,3g,4,1i,2x,36,1y,r,1x,3h,11,1n,1a,h,36,1b,3g,13,1i,k,13,2m,3f,1i,2a,w,3r,3u,1e,3u,2a,15,2a,3h,3q,3s,20,1c,1b,1c,2g,2y,19,o,o,m,4,3u,15,c,2d,h,3r,3h,1k,15,13,38,2d,o,3r,3h,39,3l,2l,o,2l,38,2y,2w,3r,3f,d,1b,1x,h,j,2a,u,0,1,5,32,1u,3m,1x,1p,11,1c,1n,2y,3q,2w,o,35,1p,1s,28,1c,13,20,d,w,m,22,h,22,2w,30,32,3h,1a,j,4,35,f,2h,35,t,1x,2j,2y,3i,2c,1z,h,1c,3n,1e,11,0,w,t,1e,3h,1x,c,k,1x,2d,2z,2h,19,2k,1b,13,h,26,1x,3e,2o,t,3,32,21,t,30,39,38,2v,1r,1n,3g,33,1x,33,s,30,1z,5,33,33,e,3l,33,z,t,e,2w,3k,g,30,t,36,3b,1r,3h,2v,3l,15,38,21,5,1c,n,3u,l,2v,19,m,2v,3r,38,39,u,33,2v,x,20,a,18,14,c,3l,q,2l,38,3q,2d,21,10,2g,t,2z,h,33,k,32,p,3e,w,16,1n,v,23,3e,r,w,2d,3h,k,1b,2f,1f,u,2v,1n,j,26,10,16,u,30,32,3n,u,2z,3n,34,2u,3m,0,32,1z,w,3q,3h,1o,20,1p,3n,v,1f,2d,k,1g,2z,2z,29,q,1b,0,3n,w,3,2z,20,36,e,f,26,24,2k,1p,5,1q,21,1d,26,3t,3q,1n,3n,k,19,3m,u,36,1z,2n,v,1n,2d,1m,f,l,m,1h,3e,n,1n,19,u,3b,12,1g,3b,2h,16,3l,e,3t,0,1g,5,3a,2c,1r,w,v,23,s,2y,c,w,34,22,3n,23,2k,l,1o,10,c,2f,3,m,24,24,23,5,1z,3l,e,1g,r,q,k,26,2h,3b,a,1n,2s,c,c,2c,1u,f,4,1v,3e,l,f,10,w,3j,r,1g,5,3e,v,r,9,23,2d,m,1d,1n,19,r,31,r,2b,24,2l,c,2n,24,n,2k,1v,39,q,0,t,1d,1h,2j,1t,r,2u,v,9,d,n,2u,d,12,29,1r,3m,3a,3m,2w,1t,j,3e,1x,2c,u,36,d,y,2s,2e,k,0,s,2l,30,2q,2f,y,2n,23,36,3,10,2n,2s,2,2l,2q,11,3b,1s,9,2t,36,r,1z,u,3p,c,2w,3q,39,11,g,l,2f,23,19,2b,38,d,s,2m,1x,3o,2n,2s,c,2z,e,2k,18,1,e,2l,1d,r,34,2l,2u,1z,2l,u","sep":"|"}]}]);
const COLONY = [
{"id":"n-2fda4977","guard":[["not",["hasAny",["2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-0eb409c1","guard":[["not",["hasAny",["2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-5e4daf4d","guard":[["not",["hasAny",["2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-a3bfa2a3","guard":[["not",["hasAny",["2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-aa3d18ed","guard":[["not",["hasAny",["2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-28843bc3","guard":[["not",["hasAny",["2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.template",{"lit":["The name of ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-8a5dffab","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 1.7303212e-4":"The name of 1.7303212e-4 is University Of California, Santa Cruz.","give the name for 2.2198165e-4":"The name of 2.2198165e-4 is Southern Methodist University.","tell me the name of the stderr attend 1.7635041e-4":"The name of 1.7635041e-4 is Scripps College.","give the name for 2.4199863e-4":"The name of 2.4199863e-4 is Wesleyan University.","give the name for 2.0201955e-4":"The name of 2.0201955e-4 is University Of Texas At Austin.","what is the name of 5.2641459e-5":"The name of 5.2641459e-5 is Colby College.","tell me the name of the stderr attend 2.9188505e-4":"The name of 2.9188505e-4 is Wesleyan University.","tell me the name of the stderr attend 6.3080144e-5":"The name of 6.3080144e-5 is University Of Utah.","what is the name of 1.8878646e-4":"The name of 1.8878646e-4 is College Of William & Mary.","give the name for 7.7458848e-5":"The name of 7.7458848e-5 is University Of California, Santa Cruz.","give the name for 1.6549861e-4":"The name of 1.6549861e-4 is New York University.","tell me the name of the stderr attend 2.349378e-4":"The name of 2.349378e-4 is Fordham University.","give the name for 1.6146914e-4":"The name of 1.6146914e-4 is University Of Alabama.","give the name for 2.6184341e-4":"The name of 2.6184341e-4 is Fordham University.","tell me the name of the stderr attend 1.84021e-4":"The name of 1.84021e-4 is Middlebury College.","give the name for 1.0397455e-4":"The name of 1.0397455e-4 is University Of Idaho.","give the name for 1.4205331e-4":"The name of 1.4205331e-4 is Yeshiva University.","tell me the name of the stderr attend 1.3332037e-4":"The name of 1.3332037e-4 is University Of California, San Diego.","what is the name of 1.60057e-4":"The name of 1.60057e-4 is American University.","give the name for 1.9091617e-4":"The name of 1.9091617e-4 is Lafayette College.","what is the name of 1.6282464e-4":"The name of 1.6282464e-4 is Rensselaer Polytechnic Institute.","what is the name of 3.6830985e-4":"The name of 3.6830985e-4 is Wellesley College.","what is the name of 3.7693782e-4":"The name of 3.7693782e-4 is University Of Texas At Austin.","what is the name of 9.4145676e-4":"The name of 9.4145676e-4 is University Of Chicago.","give the name for 8.734524e-4":"The name of 8.734524e-4 is Northwestern University.","give the name for 0.0010992803":"The name of 0.0010992803 is Elon University.","tell me the name of the stderr attend 1.8457801e-4":"The name of 1.8457801e-4 is University Of Southern California.","what is the name of 3.2854915e-4":"The name of 3.2854915e-4 is New York University.","what is the name of 9.9525801e-5":"The name of 9.9525801e-5 is University Of Miami.","tell me the name of the stderr attend 6.1404411e-5":"The name of 6.1404411e-5 is Loyola Marymount University.","what is the name of 2.7160547e-4":"The name of 2.7160547e-4 is Rutgers, The State University Of New Jersey.","give the name for 6.0375826e-4":"The name of 6.0375826e-4 is Vassar College.","tell me the name of the stderr attend 4.5562812e-4":"The name of 4.5562812e-4 is Boston College.","give the name for 1.2140807e-4":"The name of 1.2140807e-4 is Barnard College.","tell me the name of the stderr attend 8.2689294e-5":"The name of 8.2689294e-5 is Pepperdine University.","tell me the name of the stderr attend 5.4609518e-5":"The name of 5.4609518e-5 is University Of Richmond.","give the name for 7.9499754e-5":"The name of 7.9499754e-5 is Santa Clara University.","what is the name of 8.6109911e-5":"The name of 8.6109911e-5 is Bucknell University.","what is the name of 2.8360172e-4":"The name of 2.8360172e-4 is University Of Nevada , Reno.","tell me the name of the stderr attend 2.143626e-4":"The name of 2.143626e-4 is Rutgers, The State University Of New Jersey.","give the name for 0.0012736365":"The name of 0.0012736365 is California Institute Of Technology.","what is the name of 3.2548918e-4":"The name of 3.2548918e-4 is Washington University In St. Louis.","what is the name of 3.8819431e-5":"The name of 3.8819431e-5 is University Of Oregon.","tell me the name of the stderr attend 1.1581795e-4":"The name of 1.1581795e-4 is University Of Connecticut.","tell me the name of the stderr attend 8.5491098e-5":"The name of 8.5491098e-5 is State University Of New York At Buffalo.","tell me the name of the stderr attend 0.0010488125":"The name of 0.0010488125 is University Of Oklahoma.","give the name for 3.8005435e-4":"The name of 3.8005435e-4 is Colorado School Of Mines.","what is the name of 2.1811355e-4":"The name of 2.1811355e-4 is Haverford College.","give the name for 3.5557074e-5":"The name of 3.5557074e-5 is Trinity College of Hartford, CT.","give the name for 3.1651635e-4":"The name of 3.1651635e-4 is Georgia Institute Of Technology.","tell me the name of the stderr attend 1.4752299e-4":"The name of 1.4752299e-4 is Worcester Polytechnic Institute.","tell me the name of the stderr attend 2.5061428e-4":"The name of 2.5061428e-4 is University Of Pittsburgh System.","what is the name of 9.385671e-5":"The name of 9.385671e-5 is Emory University.","give the name for 1.0436516e-4":"The name of 1.0436516e-4 is University Of Idaho.","tell me the name of the stderr attend 4.4176581e-5":"The name of 4.4176581e-5 is Connecticut College.","give the name for 1.7670321e-4":"The name of 1.7670321e-4 is Boston University.","what is the name of 1.6328096e-4":"The name of 1.6328096e-4 is American University.","what is the name of 7.2056646e-5":"The name of 7.2056646e-5 is Clark University.","tell me the name of the stderr attend 0.0010294673":"The name of 0.0010294673 is University Of Iowa.","what is the name of 3.0092799e-4":"The name of 3.0092799e-4 is University Of Miami.","tell me the name of the stderr attend 0.0011836383":"The name of 0.0011836383 is Massachusetts Institute Of Technology.","tell me the name of the stderr attend 2.2027458e-4":"The name of 2.2027458e-4 is University Of California, Davis.","what is the name of 6.7868772e-5":"The name of 6.7868772e-5 is Colgate University.","tell me the name of the stderr attend 2.0542995e-4":"The name of 2.0542995e-4 is Santa Clara University.","what is the name of 1.7440862e-4":"The name of 1.7440862e-4 is North Carolina State University.","give the name for 1.8592953e-4":"The name of 1.8592953e-4 is Rensselaer Polytechnic Institute.","give the name for 4.6371043e-4":"The name of 4.6371043e-4 is Georgetown University.","what is the name of 2.0010999e-4":"The name of 2.0010999e-4 is Baylor University.","what is the name of 2.3021112e-4":"The name of 2.3021112e-4 is Brigham Young University.","what is the name of 1.7776774e-4":"The name of 1.7776774e-4 is Bucknell University.","tell me the name of the stderr attend 2.3171573e-4":"The name of 2.3171573e-4 is Barnard College.","what is the name of 0.0012922677":"The name of 0.0012922677 is Texas Christian University.","give the name for 0":"The name of 0 is Howard University.","tell me the name of the stderr attend 0.0019248248":"The name of 0.0019248248 is Harvard University.","tell me the name of the stderr attend 2.0320108e-4":"The name of 2.0320108e-4 is University Of Rhode Island.","tell me the name of the stderr attend 4.5019158e-4":"The name of 4.5019158e-4 is University Of Virginia.","give the name for 8.165482e-5":"The name of 8.165482e-5 is University Of South Florida.","what is the name of 4.3995553e-4":"The name of 4.3995553e-4 is Williams College.","tell me the name of the stderr attend 1.4439755e-4":"The name of 1.4439755e-4 is Oberlin College.","give the name for 1.0873393e-4":"The name of 1.0873393e-4 is Bryn Mawr College.","tell me the name of the stderr attend 1.445021e-4":"The name of 1.445021e-4 is University Of Oregon.","give the name for 1.1502871e-4":"The name of 1.1502871e-4 is Boston University.","give the name for 4.2162082e-4":"The name of 4.2162082e-4 is University Of Iowa.","give the name for 1.5542435e-4":"The name of 1.5542435e-4 is University Of California, San Diego.","what is the name of 0.0024268895":"The name of 0.0024268895 is Yale University.","tell me the name of the stderr attend 1.115668e-4":"The name of 1.115668e-4 is Worcester Polytechnic Institute.","tell me the name of the stderr attend 5.2819512e-4":"The name of 5.2819512e-4 is University Of California, Berkeley.","what is the name of 9.2009106e-4":"The name of 9.2009106e-4 is Cornell University.","what is the name of 1.1570694e-4":"The name of 1.1570694e-4 is University Of California, Irvine.","tell me the name of the stderr attend 2.1649849e-4":"The name of 2.1649849e-4 is University Of North Dakota.","give the name for 1.5772731e-4":"The name of 1.5772731e-4 is Davidson College.","give the name for 1.3057017e-4":"The name of 1.3057017e-4 is Texas A&M University.","what is the name of 4.2862305e-4":"The name of 4.2862305e-4 is University Of Pittsburgh System.","give the name for 3.4588508e-4":"The name of 3.4588508e-4 is Carnegie Mellon University.","give the name for 6.0376828e-4":"The name of 6.0376828e-4 is University Of Arkansas.","what is the name of 7.0598023e-4":"The name of 7.0598023e-4 is Carnegie Mellon University.","what is the name of 4.0935635e-4":"The name of 4.0935635e-4 is Dartmouth College.","tell me the name of the stderr attend 1.3708619e-4":"The name of 1.3708619e-4 is Syracuse University.","what is the name of 2.9758425e-4":"The name of 2.9758425e-4 is Baylor University.","tell me the name of the stderr attend 1.7987027e-4":"The name of 1.7987027e-4 is Rensselaer Polytechnic Institute."}}},
{"id":"n-fb7b9846","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"of 1.7303212e-4":"The name of 1.7303212e-4 is University Of California, Santa Cruz.","for 2.2198165e-4":"The name of 2.2198165e-4 is Southern Methodist University.","of the stderr attend 1.7635041e-4":"The name of 1.7635041e-4 is Scripps College.","for 2.4199863e-4":"The name of 2.4199863e-4 is Wesleyan University.","for 2.0201955e-4":"The name of 2.0201955e-4 is University Of Texas At Austin.","of 5.2641459e-5":"The name of 5.2641459e-5 is Colby College.","of the stderr attend 2.9188505e-4":"The name of 2.9188505e-4 is Wesleyan University.","of the stderr attend 6.3080144e-5":"The name of 6.3080144e-5 is University Of Utah.","of 1.8878646e-4":"The name of 1.8878646e-4 is College Of William & Mary.","for 7.7458848e-5":"The name of 7.7458848e-5 is University Of California, Santa Cruz.","for 1.6549861e-4":"The name of 1.6549861e-4 is New York University.","of the stderr attend 2.349378e-4":"The name of 2.349378e-4 is Fordham University.","for 1.6146914e-4":"The name of 1.6146914e-4 is University Of Alabama.","for 2.6184341e-4":"The name of 2.6184341e-4 is Fordham University.","of the stderr attend 1.84021e-4":"The name of 1.84021e-4 is Middlebury College.","for 1.0397455e-4":"The name of 1.0397455e-4 is University Of Idaho.","for 1.4205331e-4":"The name of 1.4205331e-4 is Yeshiva University.","of the stderr attend 1.3332037e-4":"The name of 1.3332037e-4 is University Of California, San Diego.","of 1.60057e-4":"The name of 1.60057e-4 is American University.","for 1.9091617e-4":"The name of 1.9091617e-4 is Lafayette College.","of 1.6282464e-4":"The name of 1.6282464e-4 is Rensselaer Polytechnic Institute.","of 3.6830985e-4":"The name of 3.6830985e-4 is Wellesley College.","of 3.7693782e-4":"The name of 3.7693782e-4 is University Of Texas At Austin.","of 9.4145676e-4":"The name of 9.4145676e-4 is University Of Chicago.","for 8.734524e-4":"The name of 8.734524e-4 is Northwestern University.","for 0.0010992803":"The name of 0.0010992803 is Elon University.","of the stderr attend 1.8457801e-4":"The name of 1.8457801e-4 is University Of Southern California.","of 3.2854915e-4":"The name of 3.2854915e-4 is New York University.","of 9.9525801e-5":"The name of 9.9525801e-5 is University Of Miami.","of the stderr attend 6.1404411e-5":"The name of 6.1404411e-5 is Loyola Marymount University.","of 2.7160547e-4":"The name of 2.7160547e-4 is Rutgers, The State University Of New Jersey.","for 6.0375826e-4":"The name of 6.0375826e-4 is Vassar College.","of the stderr attend 4.5562812e-4":"The name of 4.5562812e-4 is Boston College.","for 1.2140807e-4":"The name of 1.2140807e-4 is Barnard College.","of the stderr attend 8.2689294e-5":"The name of 8.2689294e-5 is Pepperdine University.","of the stderr attend 5.4609518e-5":"The name of 5.4609518e-5 is University Of Richmond.","for 7.9499754e-5":"The name of 7.9499754e-5 is Santa Clara University.","of 8.6109911e-5":"The name of 8.6109911e-5 is Bucknell University.","of 2.8360172e-4":"The name of 2.8360172e-4 is University Of Nevada , Reno.","of the stderr attend 2.143626e-4":"The name of 2.143626e-4 is Rutgers, The State University Of New Jersey.","for 0.0012736365":"The name of 0.0012736365 is California Institute Of Technology.","of 3.2548918e-4":"The name of 3.2548918e-4 is Washington University In St. Louis.","of 3.8819431e-5":"The name of 3.8819431e-5 is University Of Oregon.","of the stderr attend 1.1581795e-4":"The name of 1.1581795e-4 is University Of Connecticut.","of the stderr attend 8.5491098e-5":"The name of 8.5491098e-5 is State University Of New York At Buffalo.","of the stderr attend 0.0010488125":"The name of 0.0010488125 is University Of Oklahoma.","for 3.8005435e-4":"The name of 3.8005435e-4 is Colorado School Of Mines.","of 2.1811355e-4":"The name of 2.1811355e-4 is Haverford College.","for 3.5557074e-5":"The name of 3.5557074e-5 is Trinity College of Hartford, CT.","for 3.1651635e-4":"The name of 3.1651635e-4 is Georgia Institute Of Technology.","of the stderr attend 1.4752299e-4":"The name of 1.4752299e-4 is Worcester Polytechnic Institute.","of the stderr attend 2.5061428e-4":"The name of 2.5061428e-4 is University Of Pittsburgh System.","of 9.385671e-5":"The name of 9.385671e-5 is Emory University.","for 1.0436516e-4":"The name of 1.0436516e-4 is University Of Idaho.","of the stderr attend 4.4176581e-5":"The name of 4.4176581e-5 is Connecticut College.","for 1.7670321e-4":"The name of 1.7670321e-4 is Boston University.","of 1.6328096e-4":"The name of 1.6328096e-4 is American University.","of 7.2056646e-5":"The name of 7.2056646e-5 is Clark University.","of the stderr attend 0.0010294673":"The name of 0.0010294673 is University Of Iowa.","of 3.0092799e-4":"The name of 3.0092799e-4 is University Of Miami.","of the stderr attend 0.0011836383":"The name of 0.0011836383 is Massachusetts Institute Of Technology.","of the stderr attend 2.2027458e-4":"The name of 2.2027458e-4 is University Of California, Davis.","of 6.7868772e-5":"The name of 6.7868772e-5 is Colgate University.","of the stderr attend 2.0542995e-4":"The name of 2.0542995e-4 is Santa Clara University.","of 1.7440862e-4":"The name of 1.7440862e-4 is North Carolina State University.","for 1.8592953e-4":"The name of 1.8592953e-4 is Rensselaer Polytechnic Institute.","for 4.6371043e-4":"The name of 4.6371043e-4 is Georgetown University.","of 2.0010999e-4":"The name of 2.0010999e-4 is Baylor University.","of 2.3021112e-4":"The name of 2.3021112e-4 is Brigham Young University.","of 1.7776774e-4":"The name of 1.7776774e-4 is Bucknell University.","of the stderr attend 2.3171573e-4":"The name of 2.3171573e-4 is Barnard College.","of 0.0012922677":"The name of 0.0012922677 is Texas Christian University.","for 0":"The name of 0 is Howard University.","of the stderr attend 0.0019248248":"The name of 0.0019248248 is Harvard University.","of the stderr attend 2.0320108e-4":"The name of 2.0320108e-4 is University Of Rhode Island.","of the stderr attend 4.5019158e-4":"The name of 4.5019158e-4 is University Of Virginia.","for 8.165482e-5":"The name of 8.165482e-5 is University Of South Florida.","of 4.3995553e-4":"The name of 4.3995553e-4 is Williams College.","of the stderr attend 1.4439755e-4":"The name of 1.4439755e-4 is Oberlin College.","for 1.0873393e-4":"The name of 1.0873393e-4 is Bryn Mawr College.","of the stderr attend 1.445021e-4":"The name of 1.445021e-4 is University Of Oregon.","for 1.1502871e-4":"The name of 1.1502871e-4 is Boston University.","for 4.2162082e-4":"The name of 4.2162082e-4 is University Of Iowa.","for 1.5542435e-4":"The name of 1.5542435e-4 is University Of California, San Diego.","of 0.0024268895":"The name of 0.0024268895 is Yale University.","of the stderr attend 1.115668e-4":"The name of 1.115668e-4 is Worcester Polytechnic Institute.","of the stderr attend 5.2819512e-4":"The name of 5.2819512e-4 is University Of California, Berkeley.","of 9.2009106e-4":"The name of 9.2009106e-4 is Cornell University.","of 1.1570694e-4":"The name of 1.1570694e-4 is University Of California, Irvine.","of the stderr attend 2.1649849e-4":"The name of 2.1649849e-4 is University Of North Dakota.","for 1.5772731e-4":"The name of 1.5772731e-4 is Davidson College.","for 1.3057017e-4":"The name of 1.3057017e-4 is Texas A&M University.","of 4.2862305e-4":"The name of 4.2862305e-4 is University Of Pittsburgh System.","for 3.4588508e-4":"The name of 3.4588508e-4 is Carnegie Mellon University.","for 6.0376828e-4":"The name of 6.0376828e-4 is University Of Arkansas.","of 7.0598023e-4":"The name of 7.0598023e-4 is Carnegie Mellon University.","of 4.0935635e-4":"The name of 4.0935635e-4 is Dartmouth College.","of the stderr attend 1.3708619e-4":"The name of 1.3708619e-4 is Syracuse University.","of 2.9758425e-4":"The name of 2.9758425e-4 is Baylor University.","of the stderr attend 1.7987027e-4":"The name of 1.7987027e-4 is Rensselaer Polytechnic Institute."}}},
{"id":"n-5b92ad7e","guard":[["not",["hasAny",["0","2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-9d765851","guard":[["not",["hasAny",["0","2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-32e8b13a","guard":[["not",["hasAny",["0","2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-57e8613c","guard":[["not",["hasAny",["0","2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-6ce5f085","guard":[["not",["hasAny",["0","2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-78deae77","guard":[["not",["hasAny",["0","2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-e3f0d01f","guard":[["not",["hasAny",["0","2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-4814a4ab","guard":[["not",["hasAny",["0","2xyolov5l6","adjusted","airdate","alma0","bound","capita","country","date","description","galaxy","hubble","j2000","largerthanmemory","latitude","legal","location","observations","smoothed","sp500","time","title","uncertainty","ver20","version","year"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-5e3afea9","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","11570694e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","160057e4","16146914e4","16282464e4","16328096e4","16549861e4","17303212e4","17440862e4","17670321e4","17776774e4","18592953e4","18878646e4","19091617e4","20010999e4","20201955e4","21811355e4","22198165e4","23021112e4","24199863e4","26184341e4","27160547e4","28360172e4","29758425e4","30092799e4","31651635e4","32548918e4","32854915e4","34588508e4","35557074e5","36830985e4","37693782e4","38005435e4","38819431e5","40935635e4","42162082e4","42862305e4","43995553e4","46371043e4","52641459e5","60375826e4","60376828e4","67868772e5","70598023e4","72056646e5","77458848e5","79499754e5","8165482e5","86109911e5","8734524e4","92009106e4","9385671e5","94145676e4","99525801e5","attend","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"],["not",["has","description"]],["not",["has","sp500"]],["not",["has","adjusted"]],["not",["has","bound"]],["not",["has","date"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-a1bc4fdd","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","11570694e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","160057e4","16146914e4","16282464e4","16328096e4","16549861e4","17303212e4","17440862e4","17670321e4","17776774e4","18592953e4","18878646e4","19091617e4","20010999e4","20201955e4","21811355e4","22198165e4","23021112e4","24199863e4","26184341e4","27160547e4","28360172e4","29758425e4","30092799e4","31651635e4","32548918e4","32854915e4","34588508e4","35557074e5","36830985e4","37693782e4","38005435e4","38819431e5","40935635e4","42162082e4","42862305e4","43995553e4","46371043e4","52641459e5","60375826e4","60376828e4","67868772e5","70598023e4","72056646e5","77458848e5","79499754e5","8165482e5","86109911e5","8734524e4","92009106e4","9385671e5","94145676e4","99525801e5","attend","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"],["not",["has","description"]],["not",["has","sp500"]],["not",["has","adjusted"]],["not",["has","bound"]],["not",["has","date"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-33723674","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","11570694e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","160057e4","16146914e4","16282464e4","16328096e4","16549861e4","17303212e4","17440862e4","17670321e4","17776774e4","18592953e4","18878646e4","19091617e4","20010999e4","20201955e4","21811355e4","22198165e4","23021112e4","24199863e4","26184341e4","27160547e4","28360172e4","29758425e4","30092799e4","31651635e4","32548918e4","32854915e4","34588508e4","35557074e5","36830985e4","37693782e4","38005435e4","38819431e5","40935635e4","42162082e4","42862305e4","43995553e4","46371043e4","52641459e5","60375826e4","60376828e4","67868772e5","70598023e4","72056646e5","77458848e5","79499754e5","8165482e5","86109911e5","8734524e4","92009106e4","9385671e5","94145676e4","99525801e5","attend","element","item number","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","name"],["not",["has","description"]],["not",["has","sp500"]],["not",["has","adjusted"]],["not",["has","bound"]],["not",["has","date"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-35eceece","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","11570694e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","160057e4","16146914e4","16282464e4","16328096e4","16549861e4","17303212e4","17440862e4","17670321e4","17776774e4","18592953e4","18878646e4","19091617e4","20010999e4","20201955e4","21811355e4","22198165e4","23021112e4","24199863e4","26184341e4","27160547e4","28360172e4","29758425e4","30092799e4","31651635e4","32548918e4","32854915e4","34588508e4","35557074e5","36830985e4","37693782e4","38005435e4","38819431e5","40935635e4","42162082e4","42862305e4","43995553e4","46371043e4","52641459e5","60375826e4","60376828e4","67868772e5","70598023e4","72056646e5","77458848e5","79499754e5","8165482e5","86109911e5","8734524e4","92009106e4","9385671e5","94145676e4","99525801e5","attend","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","name"],["not",["has","description"]],["not",["has","sp500"]],["not",["has","adjusted"]],["not",["has","bound"]],["not",["has","date"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-690b23a5","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","11570694e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","160057e4","16146914e4","16282464e4","16328096e4","16549861e4","17303212e4","17440862e4","17670321e4","17776774e4","18592953e4","18878646e4","19091617e4","20010999e4","20201955e4","21811355e4","22198165e4","23021112e4","24199863e4","26184341e4","27160547e4","28360172e4","29758425e4","30092799e4","31651635e4","32548918e4","32854915e4","34588508e4","35557074e5","36830985e4","37693782e4","38005435e4","38819431e5","40935635e4","42162082e4","42862305e4","43995553e4","46371043e4","52641459e5","60375826e4","60376828e4","67868772e5","70598023e4","72056646e5","77458848e5","79499754e5","8165482e5","86109911e5","8734524e4","92009106e4","9385671e5","94145676e4","99525801e5","attend","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"],["not",["has","description"]],["not",["has","sp500"]],["not",["has","adjusted"]],["not",["has","bound"]],["not",["has","date"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-93d587ec","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","11570694e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","160057e4","16146914e4","16282464e4","16328096e4","16549861e4","17303212e4","17440862e4","17670321e4","17776774e4","18592953e4","18878646e4","19091617e4","20010999e4","20201955e4","21811355e4","22198165e4","23021112e4","24199863e4","26184341e4","27160547e4","28360172e4","29758425e4","30092799e4","31651635e4","32548918e4","32854915e4","34588508e4","35557074e5","36830985e4","37693782e4","38005435e4","38819431e5","40935635e4","42162082e4","42862305e4","43995553e4","46371043e4","52641459e5","60375826e4","60376828e4","67868772e5","70598023e4","72056646e5","77458848e5","79499754e5","8165482e5","86109911e5","8734524e4","92009106e4","9385671e5","94145676e4","99525801e5","all caps","attend","capital letters","capitals","element","item number","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","name"],["not",["has","description"]],["not",["has","sp500"]],["not",["has","adjusted"]],["not",["has","bound"]],["not",["has","date"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-f105988e","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","11570694e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","160057e4","16146914e4","16282464e4","16328096e4","16549861e4","17303212e4","17440862e4","17670321e4","17776774e4","18592953e4","18878646e4","19091617e4","20010999e4","20201955e4","21811355e4","22198165e4","23021112e4","24199863e4","26184341e4","27160547e4","28360172e4","29758425e4","30092799e4","31651635e4","32548918e4","32854915e4","34588508e4","35557074e5","36830985e4","37693782e4","38005435e4","38819431e5","40935635e4","42162082e4","42862305e4","43995553e4","46371043e4","52641459e5","60375826e4","60376828e4","67868772e5","70598023e4","72056646e5","77458848e5","79499754e5","8165482e5","86109911e5","8734524e4","92009106e4","9385671e5","94145676e4","99525801e5","attend","capitalise","capitalize","capitalize each word","element","item number","nth","position","shortest","shortest one","shortest word","title case"]],["has","name"],["not",["has","description"]],["not",["has","sp500"]],["not",["has","adjusted"]],["not",["has","bound"]],["not",["has","date"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-7e4bacc2","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","11570694e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","160057e4","16146914e4","16282464e4","16328096e4","16549861e4","17303212e4","17440862e4","17670321e4","17776774e4","18592953e4","18878646e4","19091617e4","20010999e4","20201955e4","21811355e4","22198165e4","23021112e4","24199863e4","26184341e4","27160547e4","28360172e4","29758425e4","30092799e4","31651635e4","32548918e4","32854915e4","34588508e4","35557074e5","36830985e4","37693782e4","38005435e4","38819431e5","40935635e4","42162082e4","42862305e4","43995553e4","46371043e4","52641459e5","60375826e4","60376828e4","67868772e5","70598023e4","72056646e5","77458848e5","79499754e5","8165482e5","86109911e5","8734524e4","92009106e4","9385671e5","94145676e4","99525801e5","attend","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","name"],["not",["has","description"]],["not",["has","sp500"]],["not",["has","adjusted"]],["not",["has","bound"]],["not",["has","date"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-b396925b","guard":[["hasAny",["element","first n","item number","name","nth","position","shortest","shortest one","shortest word","take","top"]],["nums==",2],["not",["has","1200dev93g6886706f5"]],["not",["has","act"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],["sense.second"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-c3c3fbb3","guard":[["hasAny",["element","first n","item number","name","nth","position","shortest","shortest one","shortest word","take","top"]],["nums==",2],["not",["has","1200dev93g6886706f5"]],["not",["has","act"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],["sense.second"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-de72b4ab","guard":[["not",["hasAny",["1200dev93g6886706f5","airdate","corporat","galaxy","hubble","j2000"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.and",["transform.takeStrs",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],["sense.second"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-ecc6f652","guard":[["not",["hasAny",["1200dev93g6886706f5","airdate","corporat","galaxy","hubble","j2000"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["transform.takeStrs",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],["sense.second"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-ed8457b3","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","1115668e4","11502871e4","11581795e4","12140807e4","13708619e4","14205331e4","14439755e4","1445021e4","14752299e4","15772731e4","160057e4","16146914e4","16282464e4","16328096e4","16549861e4","17440862e4","17635041e4","17670321e4","17776774e4","17987027e4","184021e4","18457801e4","18592953e4","19091617e4","20010999e4","20201955e4","20320108e4","20542995e4","21649849e4","21811355e4","22198165e4","23021112e4","23171573e4","2349378e4","24199863e4","25061428e4","26184341e4","29188505e4","29758425e4","30092799e4","31651635e4","32854915e4","34588508e4","36830985e4","37693782e4","38005435e4","38819431e5","40935635e4","42162082e4","42862305e4","43995553e4","44176581e5","45019158e4","45562812e4","46371043e4","52641459e5","54609518e5","60375826e4","60376828e4","61404411e5","63080144e5","67868772e5","70598023e4","72056646e5","79499754e5","8165482e5","82689294e5","85491098e5","86109911e5","8734524e4","92009106e4","9385671e5","94145676e4","99525801e5","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}],{"lit":1}]],"mem":null},
{"id":"n-b036d225","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"1.7303212e-4":"The name of 1.7303212e-4 is University Of California, Santa Cruz.","the stderr attend 1.7635041e-4":"The name of 1.7635041e-4 is Scripps College.","5.2641459e-5":"The name of 5.2641459e-5 is Colby College.","the stderr attend 2.9188505e-4":"The name of 2.9188505e-4 is Wesleyan University.","the stderr attend 6.3080144e-5":"The name of 6.3080144e-5 is University Of Utah.","1.8878646e-4":"The name of 1.8878646e-4 is College Of William & Mary.","the stderr attend 2.349378e-4":"The name of 2.349378e-4 is Fordham University.","the stderr attend 1.84021e-4":"The name of 1.84021e-4 is Middlebury College.","the stderr attend 1.3332037e-4":"The name of 1.3332037e-4 is University Of California, San Diego.","1.60057e-4":"The name of 1.60057e-4 is American University.","1.6282464e-4":"The name of 1.6282464e-4 is Rensselaer Polytechnic Institute.","3.6830985e-4":"The name of 3.6830985e-4 is Wellesley College.","3.7693782e-4":"The name of 3.7693782e-4 is University Of Texas At Austin.","9.4145676e-4":"The name of 9.4145676e-4 is University Of Chicago.","the stderr attend 1.8457801e-4":"The name of 1.8457801e-4 is University Of Southern California.","3.2854915e-4":"The name of 3.2854915e-4 is New York University.","9.9525801e-5":"The name of 9.9525801e-5 is University Of Miami.","the stderr attend 6.1404411e-5":"The name of 6.1404411e-5 is Loyola Marymount University.","2.7160547e-4":"The name of 2.7160547e-4 is Rutgers, The State University Of New Jersey.","the stderr attend 4.5562812e-4":"The name of 4.5562812e-4 is Boston College.","the stderr attend 8.2689294e-5":"The name of 8.2689294e-5 is Pepperdine University.","the stderr attend 5.4609518e-5":"The name of 5.4609518e-5 is University Of Richmond.","8.6109911e-5":"The name of 8.6109911e-5 is Bucknell University.","2.8360172e-4":"The name of 2.8360172e-4 is University Of Nevada , Reno.","the stderr attend 2.143626e-4":"The name of 2.143626e-4 is Rutgers, The State University Of New Jersey.","3.2548918e-4":"The name of 3.2548918e-4 is Washington University In St. Louis.","3.8819431e-5":"The name of 3.8819431e-5 is University Of Oregon.","the stderr attend 1.1581795e-4":"The name of 1.1581795e-4 is University Of Connecticut.","the stderr attend 8.5491098e-5":"The name of 8.5491098e-5 is State University Of New York At Buffalo.","the stderr attend 0.0010488125":"The name of 0.0010488125 is University Of Oklahoma.","2.1811355e-4":"The name of 2.1811355e-4 is Haverford College.","the stderr attend 1.4752299e-4":"The name of 1.4752299e-4 is Worcester Polytechnic Institute.","the stderr attend 2.5061428e-4":"The name of 2.5061428e-4 is University Of Pittsburgh System.","9.385671e-5":"The name of 9.385671e-5 is Emory University.","the stderr attend 4.4176581e-5":"The name of 4.4176581e-5 is Connecticut College.","1.6328096e-4":"The name of 1.6328096e-4 is American University.","7.2056646e-5":"The name of 7.2056646e-5 is Clark University.","the stderr attend 0.0010294673":"The name of 0.0010294673 is University Of Iowa.","3.0092799e-4":"The name of 3.0092799e-4 is University Of Miami.","the stderr attend 0.0011836383":"The name of 0.0011836383 is Massachusetts Institute Of Technology.","the stderr attend 2.2027458e-4":"The name of 2.2027458e-4 is University Of California, Davis.","6.7868772e-5":"The name of 6.7868772e-5 is Colgate University.","the stderr attend 2.0542995e-4":"The name of 2.0542995e-4 is Santa Clara University.","1.7440862e-4":"The name of 1.7440862e-4 is North Carolina State University.","2.0010999e-4":"The name of 2.0010999e-4 is Baylor University.","2.3021112e-4":"The name of 2.3021112e-4 is Brigham Young University.","1.7776774e-4":"The name of 1.7776774e-4 is Bucknell University.","the stderr attend 2.3171573e-4":"The name of 2.3171573e-4 is Barnard College.","0.0012922677":"The name of 0.0012922677 is Texas Christian University.","the stderr attend 0.0019248248":"The name of 0.0019248248 is Harvard University.","the stderr attend 2.0320108e-4":"The name of 2.0320108e-4 is University Of Rhode Island.","the stderr attend 4.5019158e-4":"The name of 4.5019158e-4 is University Of Virginia.","4.3995553e-4":"The name of 4.3995553e-4 is Williams College.","the stderr attend 1.4439755e-4":"The name of 1.4439755e-4 is Oberlin College.","the stderr attend 1.445021e-4":"The name of 1.445021e-4 is University Of Oregon.","0.0024268895":"The name of 0.0024268895 is Yale University.","the stderr attend 1.115668e-4":"The name of 1.115668e-4 is Worcester Polytechnic Institute.","the stderr attend 5.2819512e-4":"The name of 5.2819512e-4 is University Of California, Berkeley.","9.2009106e-4":"The name of 9.2009106e-4 is Cornell University.","1.1570694e-4":"The name of 1.1570694e-4 is University Of California, Irvine.","the stderr attend 2.1649849e-4":"The name of 2.1649849e-4 is University Of North Dakota.","4.2862305e-4":"The name of 4.2862305e-4 is University Of Pittsburgh System.","7.0598023e-4":"The name of 7.0598023e-4 is Carnegie Mellon University.","4.0935635e-4":"The name of 4.0935635e-4 is Dartmouth College.","the stderr attend 1.3708619e-4":"The name of 1.3708619e-4 is Syracuse University.","2.9758425e-4":"The name of 2.9758425e-4 is Baylor University.","the stderr attend 1.7987027e-4":"The name of 1.7987027e-4 is Rensselaer Polytechnic Institute."}}},
{"id":"n-23e748ab","guard":[["hasAny",["11570694e4","160057e4","16282464e4","16328096e4","17303212e4","17440862e4","17776774e4","18878646e4","20010999e4","21811355e4","23021112e4","27160547e4","28360172e4","29758425e4","30092799e4","32548918e4","32854915e4","36830985e4","37693782e4","38819431e5","40935635e4","42862305e4","43995553e4","52641459e5","67868772e5","70598023e4","72056646e5","86109911e5","92009106e4","9385671e5","94145676e4","99525801e5","attend","element","item number","nth","position"]],["has","name"],["words>=",6],["not",["has","description"]],["not",["has","adjusted"]],["not",["has","bound"]],["not",["has","galaxy"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-7cb551f3","guard":[["hasAny",["10873393e4","1115668e4","11502871e4","12140807e4","13708619e4","14205331e4","14439755e4","14752299e4","15772731e4","160057e4","16282464e4","16328096e4","16549861e4","17440862e4","17635041e4","17670321e4","17776774e4","17987027e4","184021e4","18592953e4","19091617e4","20010999e4","20542995e4","21811355e4","22198165e4","23021112e4","23171573e4","2349378e4","24199863e4","26184341e4","29188505e4","29758425e4","32854915e4","34588508e4","36830985e4","40935635e4","43995553e4","44176581e5","45562812e4","46371043e4","52641459e5","60375826e4","61404411e5","67868772e5","70598023e4","72056646e5","79499754e5","82689294e5","86109911e5","8734524e4","92009106e4","9385671e5","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}],{"lit":2}]],"mem":null},
{"id":"n-e753ac38","guard":[["hasAny",["10873393e4","1115668e4","11502871e4","12140807e4","13708619e4","14205331e4","14439755e4","14752299e4","15772731e4","160057e4","16282464e4","16328096e4","16549861e4","17440862e4","17635041e4","17670321e4","17776774e4","17987027e4","184021e4","18592953e4","19091617e4","20010999e4","20542995e4","21811355e4","22198165e4","23021112e4","23171573e4","2349378e4","24199863e4","26184341e4","29188505e4","29758425e4","32854915e4","34588508e4","36830985e4","40935635e4","43995553e4","44176581e5","45562812e4","46371043e4","52641459e5","60375826e4","61404411e5","67868772e5","70598023e4","72056646e5","79499754e5","82689294e5","86109911e5","8734524e4","92009106e4","9385671e5","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}],["sense.howMany"]]],"mem":null},
{"id":"n-3384af25","guard":[["hasAny",["1115668e4","11570694e4","11581795e4","13332037e4","13708619e4","14439755e4","1445021e4","14752299e4","160057e4","16282464e4","16328096e4","17303212e4","17440862e4","17635041e4","17776774e4","17987027e4","184021e4","18457801e4","18878646e4","20010999e4","20320108e4","20542995e4","2143626e4","21649849e4","21811355e4","22027458e4","23021112e4","23171573e4","2349378e4","25061428e4","27160547e4","28360172e4","29188505e4","29758425e4","30092799e4","32548918e4","32854915e4","36830985e4","37693782e4","40935635e4","42862305e4","43995553e4","45019158e4","45562812e4","52819512e4","70598023e4","92009106e4","94145676e4","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],["sense.second"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-a416c4e6","guard":[["hasAny",["11570694e4","160057e4","16282464e4","16328096e4","17303212e4","17440862e4","17776774e4","18878646e4","20010999e4","21811355e4","23021112e4","27160547e4","28360172e4","29758425e4","30092799e4","32548918e4","32854915e4","36830985e4","37693782e4","38819431e5","40935635e4","42862305e4","43995553e4","52641459e5","67868772e5","70598023e4","72056646e5","86109911e5","92009106e4","9385671e5","94145676e4","99525801e5","element","is","item number","nth","position","shortest","shortest one","shortest word"]],["has","name"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-16401d5b","guard":[["hasAny",["11570694e4","160057e4","16282464e4","16328096e4","17303212e4","17440862e4","17776774e4","18878646e4","20010999e4","21811355e4","23021112e4","27160547e4","28360172e4","29758425e4","30092799e4","32548918e4","32854915e4","36830985e4","37693782e4","38819431e5","40935635e4","42862305e4","43995553e4","52641459e5","67868772e5","70598023e4","72056646e5","86109911e5","92009106e4","9385671e5","94145676e4","99525801e5","element","is","item number","nth","position","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","name"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.reverseWords",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-ef479960","guard":[["hasAny",["11570694e4","160057e4","16282464e4","16328096e4","17303212e4","17440862e4","17776774e4","18878646e4","20010999e4","21811355e4","23021112e4","27160547e4","28360172e4","29758425e4","30092799e4","32548918e4","32854915e4","36830985e4","37693782e4","38819431e5","40935635e4","42862305e4","43995553e4","52641459e5","67868772e5","70598023e4","72056646e5","86109911e5","92009106e4","9385671e5","94145676e4","99525801e5","element","invert case","is","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","name"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-9a9a8192","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the name of 1.7303212e-4":"The name of 1.7303212e-4 is University Of California, Santa Cruz.","the name of 5.2641459e-5":"The name of 5.2641459e-5 is Colby College.","the name of 1.8878646e-4":"The name of 1.8878646e-4 is College Of William & Mary.","the name of 1.60057e-4":"The name of 1.60057e-4 is American University.","the name of 1.6282464e-4":"The name of 1.6282464e-4 is Rensselaer Polytechnic Institute.","the name of 3.6830985e-4":"The name of 3.6830985e-4 is Wellesley College.","the name of 3.7693782e-4":"The name of 3.7693782e-4 is University Of Texas At Austin.","the name of 9.4145676e-4":"The name of 9.4145676e-4 is University Of Chicago.","the name of 3.2854915e-4":"The name of 3.2854915e-4 is New York University.","the name of 9.9525801e-5":"The name of 9.9525801e-5 is University Of Miami.","the name of 2.7160547e-4":"The name of 2.7160547e-4 is Rutgers, The State University Of New Jersey.","the name of 8.6109911e-5":"The name of 8.6109911e-5 is Bucknell University.","the name of 2.8360172e-4":"The name of 2.8360172e-4 is University Of Nevada , Reno.","the name of 3.2548918e-4":"The name of 3.2548918e-4 is Washington University In St. Louis.","the name of 3.8819431e-5":"The name of 3.8819431e-5 is University Of Oregon.","the name of 2.1811355e-4":"The name of 2.1811355e-4 is Haverford College.","the name of 9.385671e-5":"The name of 9.385671e-5 is Emory University.","the name of 1.6328096e-4":"The name of 1.6328096e-4 is American University.","the name of 7.2056646e-5":"The name of 7.2056646e-5 is Clark University.","the name of 3.0092799e-4":"The name of 3.0092799e-4 is University Of Miami.","the name of 6.7868772e-5":"The name of 6.7868772e-5 is Colgate University.","the name of 1.7440862e-4":"The name of 1.7440862e-4 is North Carolina State University.","the name of 2.0010999e-4":"The name of 2.0010999e-4 is Baylor University.","the name of 2.3021112e-4":"The name of 2.3021112e-4 is Brigham Young University.","the name of 1.7776774e-4":"The name of 1.7776774e-4 is Bucknell University.","the name of 0.0012922677":"The name of 0.0012922677 is Texas Christian University.","the name of 4.3995553e-4":"The name of 4.3995553e-4 is Williams College.","the name of 0.0024268895":"The name of 0.0024268895 is Yale University.","the name of 9.2009106e-4":"The name of 9.2009106e-4 is Cornell University.","the name of 1.1570694e-4":"The name of 1.1570694e-4 is University Of California, Irvine.","the name of 4.2862305e-4":"The name of 4.2862305e-4 is University Of Pittsburgh System.","the name of 7.0598023e-4":"The name of 7.0598023e-4 is Carnegie Mellon University.","the name of 4.0935635e-4":"The name of 4.0935635e-4 is Dartmouth College.","the name of 2.9758425e-4":"The name of 2.9758425e-4 is Baylor University."}}},
{"id":"n-7a695872","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","element","for","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-d7fe870a","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","element","for","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.and",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-139045db","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","element","for","invert case","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-244762e0","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","capitalise","capitalize","capitalize each word","element","for","item number","nth","position","title case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-a1b4b236","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","element","for","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-a459ca8f","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","all caps","capital letters","capitals","element","for","item number","nth","position","upper case","uppercase"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-bca0d414","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","class name","element","for","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-c5d592e3","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","element","for","item number","lower case","lowercase","nth","position","small letters"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]]],"mem":null},
{"id":"n-c755970d","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","element","for","invert case","item number","nth","position","swap case","toggle case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-277eceb9","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","each word","element","for","item number","nth","position","split into words","words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-bde197b5","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","each word","element","for","item number","nth","position","split into words","words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-f3b55491","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"0":"The name of 0 is Howard University.","2.2198165e-4":"The name of 2.2198165e-4 is Southern Methodist University.","2.4199863e-4":"The name of 2.4199863e-4 is Wesleyan University.","2.0201955e-4":"The name of 2.0201955e-4 is University Of Texas At Austin.","7.7458848e-5":"The name of 7.7458848e-5 is University Of California, Santa Cruz.","1.6549861e-4":"The name of 1.6549861e-4 is New York University.","1.6146914e-4":"The name of 1.6146914e-4 is University Of Alabama.","2.6184341e-4":"The name of 2.6184341e-4 is Fordham University.","1.0397455e-4":"The name of 1.0397455e-4 is University Of Idaho.","1.4205331e-4":"The name of 1.4205331e-4 is Yeshiva University.","1.9091617e-4":"The name of 1.9091617e-4 is Lafayette College.","8.734524e-4":"The name of 8.734524e-4 is Northwestern University.","0.0010992803":"The name of 0.0010992803 is Elon University.","6.0375826e-4":"The name of 6.0375826e-4 is Vassar College.","1.2140807e-4":"The name of 1.2140807e-4 is Barnard College.","7.9499754e-5":"The name of 7.9499754e-5 is Santa Clara University.","0.0012736365":"The name of 0.0012736365 is California Institute Of Technology.","3.8005435e-4":"The name of 3.8005435e-4 is Colorado School Of Mines.","3.5557074e-5":"The name of 3.5557074e-5 is Trinity College of Hartford, CT.","3.1651635e-4":"The name of 3.1651635e-4 is Georgia Institute Of Technology.","1.0436516e-4":"The name of 1.0436516e-4 is University Of Idaho.","1.7670321e-4":"The name of 1.7670321e-4 is Boston University.","1.8592953e-4":"The name of 1.8592953e-4 is Rensselaer Polytechnic Institute.","4.6371043e-4":"The name of 4.6371043e-4 is Georgetown University.","8.165482e-5":"The name of 8.165482e-5 is University Of South Florida.","1.0873393e-4":"The name of 1.0873393e-4 is Bryn Mawr College.","1.1502871e-4":"The name of 1.1502871e-4 is Boston University.","4.2162082e-4":"The name of 4.2162082e-4 is University Of Iowa.","1.5542435e-4":"The name of 1.5542435e-4 is University Of California, San Diego.","1.5772731e-4":"The name of 1.5772731e-4 is Davidson College.","1.3057017e-4":"The name of 1.3057017e-4 is Texas A&M University.","3.4588508e-4":"The name of 3.4588508e-4 is Carnegie Mellon University.","6.0376828e-4":"The name of 6.0376828e-4 is University Of Arkansas."}}},
{"id":"n-0ad738a0","guard":[["not",["hasAny",["0","2xyolov5l6","alma0","largerthanmemory","subcategory"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-d6b614d2","guard":[["not",["hasAny",["0","2xyolov5l6","alma0","largerthanmemory","subcategory"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-df466389","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-1829154c","guard":[["hasAny",["10397455e4","10436516e4","10873393e4","11502871e4","12140807e4","13057017e4","14205331e4","15542435e4","15772731e4","16146914e4","16549861e4","17670321e4","18592953e4","19091617e4","20201955e4","22198165e4","24199863e4","26184341e4","31651635e4","34588508e4","35557074e5","38005435e4","42162082e4","46371043e4","60375826e4","60376828e4","77458848e5","79499754e5","8165482e5","8734524e4","element","invert case","item number","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-781c50db","guard":[["hasAny",["11502871e4","12140807e4","13708619e4","160057e4","16328096e4","17670321e4","17776774e4","20010999e4","23171573e4","2349378e4","26184341e4","29758425e4","34588508e4","45562812e4","46371043e4","52641459e5","61404411e5","67868772e5","70598023e4","72056646e5","82689294e5","86109911e5","8734524e4","92009106e4","9385671e5","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}],{"lit":3}]],"mem":null},
{"id":"n-ef3e80b3","guard":[["hasAny",["16282464e4","17987027e4","18592953e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Rensselaer Polytechnic Institute."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-74d68139","guard":[["nums==",1],["has","give"],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.plain",["sense.last"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-00cddf27","guard":[["hasAny",["24199863e4","29188505e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Wesleyan University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-08aef3a7","guard":[["hasAny",["20010999e4","29758425e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Baylor University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-1387288b","guard":[["hasAny",["160057e4","16328096e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is American University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-19cd0443","guard":[["hasAny",["25061428e4","42862305e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Pittsburgh System."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-2cc56753","guard":[["hasAny",["17776774e4","86109911e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Bucknell University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-4223023b","guard":[["hasAny",["11502871e4","17670321e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Boston University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-53a3a9fa","guard":[["hasAny",["30092799e4","99525801e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Miami."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-8211a15c","guard":[["hasAny",["2349378e4","26184341e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Fordham University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-8f39c489","guard":[["hasAny",["17303212e4","77458848e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of California, Santa Cruz."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-8fd0ab68","guard":[["hasAny",["13332037e4","15542435e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of California, San Diego."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-95bd83d8","guard":[["hasAny",["34588508e4","70598023e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Carnegie Mellon University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-9d449884","guard":[["hasAny",["10397455e4","10436516e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Idaho."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-a36f571d","guard":[["hasAny",["2143626e4","27160547e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Rutgers, The State University Of New Jersey."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-ad78df88","guard":[["hasAny",["1115668e4","14752299e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Worcester Polytechnic Institute."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-c2ee3d99","guard":[["hasAny",["1445021e4","38819431e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Oregon."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-cabb4f8c","guard":[["hasAny",["16549861e4","32854915e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is New York University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-d4c0024f","guard":[["hasAny",["20201955e4","37693782e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Texas At Austin."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-df0cbb91","guard":[["hasAny",["12140807e4","23171573e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Barnard College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-f487d9cb","guard":[["hasAny",["20542995e4","79499754e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Santa Clara University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-068d6ca1","guard":[["hasAny",["46371043e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Georgetown University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-0f2873e8","guard":[["hasAny",["9385671e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Emory University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-1f14bb0d","guard":[["hasAny",["45562812e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Boston College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-241691d2","guard":[["hasAny",["94145676e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Chicago."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-263f36f2","guard":[["hasAny",["52819512e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of California, Berkeley."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-270452c2","guard":[["hasAny",["60376828e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Arkansas."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-29b8301a","guard":[["hasAny",["21649849e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of North Dakota."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-29b86d2b","guard":[["hasAny",["15772731e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Davidson College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-2dfa8627","guard":[["hasAny",["60375826e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Vassar College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-2fe29018","guard":[["hasAny",["72056646e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Clark University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-34582488","guard":[["hasAny",["18457801e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Southern California."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-35c5bba1","guard":[["hasAny",["61404411e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Loyola Marymount University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-3f7e31df","guard":[["hasAny",["14205331e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Yeshiva University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-3fc474cd","guard":[["hasAny",["45019158e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Virginia."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-47c334ae","guard":[["hasAny",["38005435e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Colorado School Of Mines."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-4a94de2a","guard":[["hasAny",["13057017e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Texas A&M University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-4daf9aa5","guard":[["hasAny",["16146914e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Alabama."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-588f60b1","guard":[["hasAny",["28360172e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Nevada , Reno."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-5a119705","guard":[["hasAny",["36830985e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Wellesley College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-5ad67f0b","guard":[["hasAny",["67868772e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Colgate University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-6962c7ad","guard":[["hasAny",["52641459e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Colby College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-6aa08f23","guard":[["hasAny",["21811355e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Haverford College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-6b1c3a60","guard":[["hasAny",["20320108e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Rhode Island."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-6d53acdd","guard":[["hasAny",["32548918e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Washington University In St. Louis."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-71ee5516","guard":[["hasAny",["18878646e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is College Of William & Mary."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-77a6e117","guard":[["hasAny",["8165482e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of South Florida."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-7a325d0e","guard":[["hasAny",["42162082e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Iowa."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-822be3e2","guard":[["hasAny",["11581795e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Connecticut."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-88523e99","guard":[["hasAny",["11570694e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of California, Irvine."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-8ee9700e","guard":[["hasAny",["13708619e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Syracuse University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-91cb772e","guard":[["hasAny",["22027458e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of California, Davis."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-9cb319ca","guard":[["hasAny",["44176581e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Connecticut College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-9f0aa5f8","guard":[["hasAny",["19091617e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Lafayette College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-a27934b3","guard":[["hasAny",["10873393e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Bryn Mawr College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-b345cd65","guard":[["hasAny",["40935635e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dartmouth College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-b448c809","guard":[["hasAny",["92009106e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Cornell University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-b7d19a2c","guard":[["hasAny",["54609518e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Richmond."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-bc04d250","guard":[["hasAny",["43995553e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Williams College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-c3899887","guard":[["hasAny",["63080144e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is University Of Utah."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-cd9fc4cf","guard":[["hasAny",["85491098e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is State University Of New York At Buffalo."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-ce2685c0","guard":[["hasAny",["17440862e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is North Carolina State University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-d1959e0d","guard":[["hasAny",["14439755e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Oberlin College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-d4bac6a8","guard":[["hasAny",["31651635e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Georgia Institute Of Technology."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-d525b1c1","guard":[["hasAny",["22198165e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Southern Methodist University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-d9c6151c","guard":[["hasAny",["17635041e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Scripps College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-ddc0fd91","guard":[["hasAny",["8734524e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Northwestern University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-e0a45ea0","guard":[["hasAny",["23021112e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brigham Young University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-e0db7464","guard":[["hasAny",["82689294e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Pepperdine University."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-f6a98653","guard":[["hasAny",["35557074e5","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Trinity College of Hartford, CT."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-f8792b7d","guard":[["hasAny",["184021e4","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Middlebury College."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}]]],"mem":null},
{"id":"n-43bd5433","guard":[["hasAny",["caesar cipher","element","item number","name","nth","position","rotate the letters","shift by","shift each letter"]],["has","give"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}],["sense.first"]]],"mem":null},
{"id":"n-8112c8a7","guard":[["hasAny",["element","item number","name","normalise","normalize","nth","position","simplify the text"]],["has","give"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}],["sense.first"]]],"mem":null},
{"id":"n-d5257422","guard":[["not",["hasAny",["2xyolov5l6","airdate","alma0","bound","galaxy","hubble","j2000","krl0","largerthanmemory","legal","time","version","year"]]]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}],["sense.first"]]],"mem":null},
{"id":"n-02b4092e","guard":[["hasAny",["40935635e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 4.0935635e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-09df9389","guard":[["hasAny",["63080144e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 6.3080144e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-09efdda2","guard":[["hasAny",["13332037e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.3332037e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-0a460b43","guard":[["hasAny",["10436516e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.0436516e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-0bb96353","guard":[["hasAny",["52819512e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 5.2819512e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-0fd75ff8","guard":[["hasAny",["21811355e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.1811355e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-0ff566c3","guard":[["hasAny",["82689294e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 8.2689294e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-104ac94a","guard":[["hasAny",["11581795e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.1581795e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-11278ca6","guard":[["hasAny",["14439755e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.4439755e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-1512e6f6","guard":[["hasAny",["52641459e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 5.2641459e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-1640a08c","guard":[["hasAny",["20542995e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.0542995e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-17631f5b","guard":[["hasAny",["67868772e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 6.7868772e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-1c8163db","guard":[["hasAny",["16282464e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.6282464e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-1db6ff3e","guard":[["hasAny",["13057017e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.3057017e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-1edf733f","guard":[["hasAny",["22198165e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.2198165e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-2500e065","guard":[["hasAny",["17670321e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.7670321e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-280f8b8e","guard":[["hasAny",["16549861e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.6549861e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-29fd9c40","guard":[["hasAny",["17440862e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.7440862e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-2b20e239","guard":[["hasAny",["15772731e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.5772731e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-2f14233c","guard":[["hasAny",["44176581e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 4.4176581e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-2f176ad8","guard":[["hasAny",["92009106e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 9.2009106e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-30bc43c8","guard":[["hasAny",["160057e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.60057e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-3342f497","guard":[["hasAny",["12140807e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.2140807e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-34e36399","guard":[["hasAny",["14205331e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.4205331e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-39727063","guard":[["hasAny",["45562812e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 4.5562812e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-3983bcab","guard":[["hasAny",["16146914e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.6146914e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-3ff23143","guard":[["hasAny",["99525801e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 9.9525801e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-457355e7","guard":[["hasAny",["13708619e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.3708619e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-46251989","guard":[["hasAny",["60376828e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 6.0376828e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-491fe4cc","guard":[["hasAny",["31651635e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 3.1651635e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-492271e1","guard":[["hasAny",["21649849e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.1649849e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-4d27dc65","guard":[["hasAny",["17303212e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.7303212e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-4e80f5bb","guard":[["hasAny",["8734524e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 8.734524e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-5298e1ba","guard":[["hasAny",["17987027e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.7987027e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-529ad528","guard":[["hasAny",["1445021e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.445021e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-54a4d309","guard":[["hasAny",["24199863e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.4199863e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-55bed9e9","guard":[["hasAny",["36830985e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 3.6830985e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-5618663f","guard":[["hasAny",["70598023e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 7.0598023e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-562c0f74","guard":[["hasAny",["35557074e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 3.5557074e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-605eb1c9","guard":[["hasAny",["10397455e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.0397455e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-629f92ff","guard":[["hasAny",["61404411e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 6.1404411e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-6fd0cac0","guard":[["hasAny",["77458848e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 7.7458848e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-76e3d26b","guard":[["hasAny",["45019158e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 4.5019158e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-77b3cb65","guard":[["hasAny",["43995553e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 4.3995553e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-7cb5d9df","guard":[["hasAny",["25061428e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.5061428e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-7cffff02","guard":[["hasAny",["38005435e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 3.8005435e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-81c826b4","guard":[["hasAny",["2349378e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.349378e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-836dc0be","guard":[["hasAny",["54609518e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 5.4609518e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-8384f243","guard":[["hasAny",["10873393e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.0873393e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-84b0c661","guard":[["hasAny",["29758425e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.9758425e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-86f133ee","guard":[["hasAny",["34588508e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 3.4588508e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-8afeddfb","guard":[["hasAny",["23021112e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.3021112e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-90e9c1c5","guard":[["hasAny",["17776774e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.7776774e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-91d156ae","guard":[["hasAny",["72056646e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 7.2056646e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-92bb0e71","guard":[["hasAny",["9385671e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 9.385671e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-94d23d4f","guard":[["hasAny",["11570694e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.1570694e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-975af2eb","guard":[["hasAny",["42862305e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 4.2862305e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-980ba441","guard":[["hasAny",["27160547e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.7160547e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-99181256","guard":[["hasAny",["28360172e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.8360172e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-9aa279e3","guard":[["hasAny",["8165482e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 8.165482e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-a467a295","guard":[["hasAny",["14752299e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.4752299e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-a4fe0024","guard":[["hasAny",["1115668e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.115668e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-a882f612","guard":[["hasAny",["11502871e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.1502871e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-ae3e78cc","guard":[["hasAny",["79499754e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 7.9499754e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-b821efe9","guard":[["hasAny",["2143626e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.143626e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-bc2983bf","guard":[["hasAny",["29188505e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.9188505e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-bc50e6d9","guard":[["hasAny",["15542435e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.5542435e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-ca2b7a20","guard":[["hasAny",["18592953e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.8592953e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-d140fafc","guard":[["hasAny",["30092799e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 3.0092799e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-d15c6d1c","guard":[["hasAny",["32548918e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 3.2548918e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-d4d58769","guard":[["hasAny",["85491098e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 8.5491098e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-d7dddf44","guard":[["hasAny",["20201955e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.0201955e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-dbc7dc96","guard":[["hasAny",["46371043e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 4.6371043e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-df10df0a","guard":[["hasAny",["22027458e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.2027458e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-dfbf3e8d","guard":[["hasAny",["184021e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.84021e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-e525518c","guard":[["hasAny",["94145676e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 9.4145676e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-e868f4c7","guard":[["hasAny",["86109911e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 8.6109911e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-e9ce31bd","guard":[["hasAny",["32854915e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 3.2854915e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-ea7342f6","guard":[["hasAny",["19091617e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.9091617e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-eb916406","guard":[["hasAny",["17635041e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.7635041e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-eccefea4","guard":[["hasAny",["18878646e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.8878646e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-ecfa2e4f","guard":[["hasAny",["20320108e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.0320108e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-f2583293","guard":[["hasAny",["37693782e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 3.7693782e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-f4118e76","guard":[["hasAny",["38819431e5","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 3.8819431e-5 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-f6a02de5","guard":[["hasAny",["23171573e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.3171573e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-f82f2007","guard":[["hasAny",["18457801e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.8457801e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-fc64756b","guard":[["hasAny",["26184341e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.6184341e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-fe3b7d50","guard":[["hasAny",["16328096e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 1.6328096e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-ff12d722","guard":[["hasAny",["42162082e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 4.2162082e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-ff80509a","guard":[["hasAny",["60375826e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 6.0375826e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-fff8c0b5","guard":[["hasAny",["20010999e4","element","item number","nth","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of 2.0010999e-4 is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"}],{"lit":1}],{"lit":"fr-tidytuesday-college-admissions-92be5b"},{"lit":"stderr attend"},{"lit":"name"}]],"mem":null},
{"id":"n-027822d3","guard":[["hasAny",["22027458e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 2.2027458e-4":"The name of 2.2027458e-4 is University Of California, Davis."}}},
{"id":"n-04f96867","guard":[["hasAny",["60376828e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 6.0376828e-4":"The name of 6.0376828e-4 is University Of Arkansas."}}},
{"id":"n-09677d73","guard":[["hasAny",["14752299e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.4752299e-4":"The name of 1.4752299e-4 is Worcester Polytechnic Institute."}}},
{"id":"n-12453767","guard":[["hasAny",["23021112e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 2.3021112e-4":"The name of 2.3021112e-4 is Brigham Young University."}}},
{"id":"n-15b0f9b9","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 0.0010992803":"The name of 0.0010992803 is Elon University."}}},
{"id":"n-18da18b9","guard":[["hasAny",["17776774e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 1.7776774e-4":"The name of 1.7776774e-4 is Bucknell University."}}},
{"id":"n-1bd97739","guard":[["hasAny",["21811355e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 2.1811355e-4":"The name of 2.1811355e-4 is Haverford College."}}},
{"id":"n-205b9da4","guard":[["hasAny",["60375826e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 6.0375826e-4":"The name of 6.0375826e-4 is Vassar College."}}},
{"id":"n-2121975c","guard":[["hasAny",["29188505e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 2.9188505e-4":"The name of 2.9188505e-4 is Wesleyan University."}}},
{"id":"n-256b88d0","guard":[["hasAny",["72056646e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 7.2056646e-5":"The name of 7.2056646e-5 is Clark University."}}},
{"id":"n-27ccd370","guard":[["hasAny",["45019158e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 4.5019158e-4":"The name of 4.5019158e-4 is University Of Virginia."}}},
{"id":"n-28c14e71","guard":[["hasAny",["42862305e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 4.2862305e-4":"The name of 4.2862305e-4 is University Of Pittsburgh System."}}},
{"id":"n-2a78f4d5","guard":[["hasAny",["9385671e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 9.385671e-5":"The name of 9.385671e-5 is Emory University."}}},
{"id":"n-2dadf02f","guard":[["hasAny",["15772731e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.5772731e-4":"The name of 1.5772731e-4 is Davidson College."}}},
{"id":"n-2ecc2206","guard":[["hasAny",["61404411e5","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 6.1404411e-5":"The name of 6.1404411e-5 is Loyola Marymount University."}}},
{"id":"n-3efae21c","guard":[["hasAny",["184021e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.84021e-4":"The name of 1.84021e-4 is Middlebury College."}}},
{"id":"n-4471f2a4","guard":[["hasAny",["31651635e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 3.1651635e-4":"The name of 3.1651635e-4 is Georgia Institute Of Technology."}}},
{"id":"n-46ae55d3","guard":[["hasAny",["99525801e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 9.9525801e-5":"The name of 9.9525801e-5 is University Of Miami."}}},
{"id":"n-4a2e91a8","guard":[["hasAny",["63080144e5","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 6.3080144e-5":"The name of 6.3080144e-5 is University Of Utah."}}},
{"id":"n-4ac51485","guard":[["hasAny",["attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 0.0010294673":"The name of 0.0010294673 is University Of Iowa."}}},
{"id":"n-4c71a8a3","guard":[["hasAny",["20320108e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 2.0320108e-4":"The name of 2.0320108e-4 is University Of Rhode Island."}}},
{"id":"n-4ed58925","guard":[["hasAny",["43995553e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 4.3995553e-4":"The name of 4.3995553e-4 is Williams College."}}},
{"id":"n-4f9ddef1","guard":[["hasAny",["11570694e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 1.1570694e-4":"The name of 1.1570694e-4 is University Of California, Irvine."}}},
{"id":"n-52cc638b","guard":[["hasAny",["12140807e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.2140807e-4":"The name of 1.2140807e-4 is Barnard College."}}},
{"id":"n-55d91307","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 0.0012922677":"The name of 0.0012922677 is Texas Christian University."}}},
{"id":"n-5a15d051","guard":[["hasAny",["attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 0.0019248248":"The name of 0.0019248248 is Harvard University."}}},
{"id":"n-5c9092e2","guard":[["hasAny",["77458848e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 7.7458848e-5":"The name of 7.7458848e-5 is University Of California, Santa Cruz."}}},
{"id":"n-5d7a7500","guard":[["hasAny",["8734524e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 8.734524e-4":"The name of 8.734524e-4 is Northwestern University."}}},
{"id":"n-61fbaaef","guard":[["hasAny",["16146914e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.6146914e-4":"The name of 1.6146914e-4 is University Of Alabama."}}},
{"id":"n-633aea59","guard":[["hasAny",["21649849e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 2.1649849e-4":"The name of 2.1649849e-4 is University Of North Dakota."}}},
{"id":"n-63f42eda","guard":[["hasAny",["11502871e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.1502871e-4":"The name of 1.1502871e-4 is Boston University."}}},
{"id":"n-6e13b58b","guard":[["hasAny",["38005435e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 3.8005435e-4":"The name of 3.8005435e-4 is Colorado School Of Mines."}}},
{"id":"n-6fa7ee20","guard":[["hasAny",["2349378e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 2.349378e-4":"The name of 2.349378e-4 is Fordham University."}}},
{"id":"n-70313deb","guard":[["hasAny",["17303212e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 1.7303212e-4":"The name of 1.7303212e-4 is University Of California, Santa Cruz."}}},
{"id":"n-7553fa26","guard":[["hasAny",["160057e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 1.60057e-4":"The name of 1.60057e-4 is American University."}}},
{"id":"n-756a30d7","guard":[["hasAny",["27160547e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 2.7160547e-4":"The name of 2.7160547e-4 is Rutgers, The State University Of New Jersey."}}},
{"id":"n-795c3e91","guard":[["hasAny",["10873393e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.0873393e-4":"The name of 1.0873393e-4 is Bryn Mawr College."}}},
{"id":"n-7fe08281","guard":[["hasAny",["18878646e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 1.8878646e-4":"The name of 1.8878646e-4 is College Of William & Mary."}}},
{"id":"n-80bcf2cb","guard":[["hasAny",["24199863e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 2.4199863e-4":"The name of 2.4199863e-4 is Wesleyan University."}}},
{"id":"n-8218de11","guard":[["hasAny",["20542995e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 2.0542995e-4":"The name of 2.0542995e-4 is Santa Clara University."}}},
{"id":"n-82d76a64","guard":[["hasAny",["29758425e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 2.9758425e-4":"The name of 2.9758425e-4 is Baylor University."}}},
{"id":"n-86faaa9e","guard":[["hasAny",["44176581e5","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 4.4176581e-5":"The name of 4.4176581e-5 is Connecticut College."}}},
{"id":"n-88765132","guard":[["hasAny",["85491098e5","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 8.5491098e-5":"The name of 8.5491098e-5 is State University Of New York At Buffalo."}}},
{"id":"n-8acf9325","guard":[["hasAny",["52819512e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 5.2819512e-4":"The name of 5.2819512e-4 is University Of California, Berkeley."}}},
{"id":"n-8b410155","guard":[["hasAny",["67868772e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 6.7868772e-5":"The name of 6.7868772e-5 is Colgate University."}}},
{"id":"n-91d931ea","guard":[["hasAny",["14205331e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.4205331e-4":"The name of 1.4205331e-4 is Yeshiva University."}}},
{"id":"n-9222ef6f","guard":[["hasAny",["36830985e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 3.6830985e-4":"The name of 3.6830985e-4 is Wellesley College."}}},
{"id":"n-962839a3","guard":[["hasAny",["45562812e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 4.5562812e-4":"The name of 4.5562812e-4 is Boston College."}}},
{"id":"n-96d17d00","guard":[["hasAny",["23171573e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 2.3171573e-4":"The name of 2.3171573e-4 is Barnard College."}}},
{"id":"n-9958058b","guard":[["hasAny",["30092799e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 3.0092799e-4":"The name of 3.0092799e-4 is University Of Miami."}}},
{"id":"n-9a2df690","guard":[["hasAny",["79499754e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 7.9499754e-5":"The name of 7.9499754e-5 is Santa Clara University."}}},
{"id":"n-9a36fad7","guard":[["hasAny",["2143626e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 2.143626e-4":"The name of 2.143626e-4 is Rutgers, The State University Of New Jersey."}}},
{"id":"n-9ab1bb98","guard":[["hasAny",["11581795e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.1581795e-4":"The name of 1.1581795e-4 is University Of Connecticut."}}},
{"id":"n-9d426d80","guard":[["hasAny",["37693782e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 3.7693782e-4":"The name of 3.7693782e-4 is University Of Texas At Austin."}}},
{"id":"n-9f7e314f","guard":[["hasAny",["13332037e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.3332037e-4":"The name of 1.3332037e-4 is University Of California, San Diego."}}},
{"id":"n-a0a3e7fa","guard":[["hasAny",["42162082e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 4.2162082e-4":"The name of 4.2162082e-4 is University Of Iowa."}}},
{"id":"n-a20dfee1","guard":[["hasAny",["16549861e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.6549861e-4":"The name of 1.6549861e-4 is New York University."}}},
{"id":"n-a24fdb5a","guard":[["hasAny",["32854915e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 3.2854915e-4":"The name of 3.2854915e-4 is New York University."}}},
{"id":"n-a9d6be10","guard":[["hasAny",["82689294e5","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 8.2689294e-5":"The name of 8.2689294e-5 is Pepperdine University."}}},
{"id":"n-abb40db6","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 0.0024268895":"The name of 0.0024268895 is Yale University."}}},
{"id":"n-abe12664","guard":[["hasAny",["26184341e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 2.6184341e-4":"The name of 2.6184341e-4 is Fordham University."}}},
{"id":"n-ad5f3c0b","guard":[["hasAny",["10436516e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.0436516e-4":"The name of 1.0436516e-4 is University Of Idaho."}}},
{"id":"n-adb44df4","guard":[["hasAny",["10397455e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.0397455e-4":"The name of 1.0397455e-4 is University Of Idaho."}}},
{"id":"n-ae04530b","guard":[["hasAny",["17635041e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.7635041e-4":"The name of 1.7635041e-4 is Scripps College."}}},
{"id":"n-ae1f078b","guard":[["hasAny",["1115668e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.115668e-4":"The name of 1.115668e-4 is Worcester Polytechnic Institute."}}},
{"id":"n-ae2d8ac7","guard":[["hasAny",["13708619e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.3708619e-4":"The name of 1.3708619e-4 is Syracuse University."}}},
{"id":"n-b1fbedaf","guard":[["hasAny",["54609518e5","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 5.4609518e-5":"The name of 5.4609518e-5 is University Of Richmond."}}},
{"id":"n-b2a754dc","guard":[["hasAny",["19091617e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.9091617e-4":"The name of 1.9091617e-4 is Lafayette College."}}},
{"id":"n-b2d62d40","guard":[["hasAny",["18457801e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.8457801e-4":"The name of 1.8457801e-4 is University Of Southern California."}}},
{"id":"n-b3273e7b","guard":[["hasAny",["34588508e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 3.4588508e-4":"The name of 3.4588508e-4 is Carnegie Mellon University."}}},
{"id":"n-b3ad3ca9","guard":[["hasAny",["16282464e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 1.6282464e-4":"The name of 1.6282464e-4 is Rensselaer Polytechnic Institute."}}},
{"id":"n-b4344116","guard":[["hasAny",["22198165e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 2.2198165e-4":"The name of 2.2198165e-4 is Southern Methodist University."}}},
{"id":"n-b43e5dcd","guard":[["hasAny",["52641459e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 5.2641459e-5":"The name of 5.2641459e-5 is Colby College."}}},
{"id":"n-b44d9cbf","guard":[["hasAny",["20201955e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 2.0201955e-4":"The name of 2.0201955e-4 is University Of Texas At Austin."}}},
{"id":"n-bd7e2bf2","guard":[["hasAny",["18592953e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.8592953e-4":"The name of 1.8592953e-4 is Rensselaer Polytechnic Institute."}}},
{"id":"n-c18f1104","guard":[["hasAny",["86109911e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 8.6109911e-5":"The name of 8.6109911e-5 is Bucknell University."}}},
{"id":"n-c3e53d43","guard":[["hasAny",["14439755e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.4439755e-4":"The name of 1.4439755e-4 is Oberlin College."}}},
{"id":"n-c6c176c1","guard":[["hasAny",["17440862e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 1.7440862e-4":"The name of 1.7440862e-4 is North Carolina State University."}}},
{"id":"n-c9100bfd","guard":[["hasAny",["15542435e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.5542435e-4":"The name of 1.5542435e-4 is University Of California, San Diego."}}},
{"id":"n-ce860263","guard":[["hasAny",["20010999e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 2.0010999e-4":"The name of 2.0010999e-4 is Baylor University."}}},
{"id":"n-cecc5541","guard":[["hasAny",["attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 0.0011836383":"The name of 0.0011836383 is Massachusetts Institute Of Technology."}}},
{"id":"n-d43840c2","guard":[["hasAny",["8165482e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 8.165482e-5":"The name of 8.165482e-5 is University Of South Florida."}}},
{"id":"n-d7ab0175","guard":[["hasAny",["35557074e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 3.5557074e-5":"The name of 3.5557074e-5 is Trinity College of Hartford, CT."}}},
{"id":"n-d96e861e","guard":[["hasAny",["1445021e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.445021e-4":"The name of 1.445021e-4 is University Of Oregon."}}},
{"id":"n-e0669e89","guard":[["hasAny",["40935635e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 4.0935635e-4":"The name of 4.0935635e-4 is Dartmouth College."}}},
{"id":"n-e48ba46b","guard":[["hasAny",["94145676e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 9.4145676e-4":"The name of 9.4145676e-4 is University Of Chicago."}}},
{"id":"n-e65284ca","guard":[["hasAny",["17670321e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.7670321e-4":"The name of 1.7670321e-4 is Boston University."}}},
{"id":"n-eab6ce49","guard":[["hasAny",["17987027e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 1.7987027e-4":"The name of 1.7987027e-4 is Rensselaer Polytechnic Institute."}}},
{"id":"n-edda289d","guard":[["hasAny",["38819431e5","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 3.8819431e-5":"The name of 3.8819431e-5 is University Of Oregon."}}},
{"id":"n-f2787392","guard":[["hasAny",["13057017e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 1.3057017e-4":"The name of 1.3057017e-4 is Texas A&M University."}}},
{"id":"n-f35a1860","guard":[["hasAny",["92009106e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 9.2009106e-4":"The name of 9.2009106e-4 is Cornell University."}}},
{"id":"n-f6056289","guard":[["hasAny",["16328096e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 1.6328096e-4":"The name of 1.6328096e-4 is American University."}}},
{"id":"n-f832505a","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 0":"The name of 0 is Howard University."}}},
{"id":"n-f83a48cc","guard":[["hasAny",["70598023e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 7.0598023e-4":"The name of 7.0598023e-4 is Carnegie Mellon University."}}},
{"id":"n-f941bffe","guard":[["hasAny",["32548918e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 3.2548918e-4":"The name of 3.2548918e-4 is Washington University In St. Louis."}}},
{"id":"n-f9652992","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 0.0012736365":"The name of 0.0012736365 is California Institute Of Technology."}}},
{"id":"n-f999e51c","guard":[["hasAny",["25061428e4","attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 2.5061428e-4":"The name of 2.5061428e-4 is University Of Pittsburgh System."}}},
{"id":"n-fa8f2c78","guard":[["hasAny",["46371043e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the name for 4.6371043e-4":"The name of 4.6371043e-4 is Georgetown University."}}},
{"id":"n-fde6f2fa","guard":[["hasAny",["attend","name","stderr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the name of the stderr attend 0.0010488125":"The name of 0.0010488125 is University Of Oklahoma."}}},
{"id":"n-ff6c3937","guard":[["hasAny",["28360172e4","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the name of 2.8360172e-4":"The name of 2.8360172e-4 is University Of Nevada , Reno."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the name of 1.7303212e-4","expect":{"contains":["University Of California, Santa Cruz"],"notRefusal":true}},{"q":"give the name for 2.2198165e-4","expect":{"contains":["Southern Methodist University"],"notRefusal":true}},{"q":"tell me the name of the stderr attend 1.7635041e-4","expect":{"contains":["Scripps College"],"notRefusal":true}},{"q":"give the name for 2.4199863e-4","expect":{"contains":["Wesleyan University"],"notRefusal":true}},{"q":"give the name for 2.0201955e-4","expect":{"contains":["University Of Texas At Austin"],"notRefusal":true}},{"q":"what is the name of 5.2641459e-5","expect":{"contains":["Colby College"],"notRefusal":true}},{"q":"tell me the name of the stderr attend 2.9188505e-4","expect":{"contains":["Wesleyan University"],"notRefusal":true}},{"q":"tell me the name of the stderr attend 6.3080144e-5","expect":{"contains":["University Of Utah"],"notRefusal":true}},{"q":"what is the name of 1.8878646e-4","expect":{"contains":["College Of William & Mary"],"notRefusal":true}},{"q":"give the name for 7.7458848e-5","expect":{"contains":["University Of California, Santa Cruz"],"notRefusal":true}},{"q":"give the name for 1.6549861e-4","expect":{"contains":["New York University"],"notRefusal":true}},{"q":"tell me the name of the stderr attend 2.349378e-4","expect":{"contains":["Fordham University"],"notRefusal":true}},{"q":"give the name for 1.6146914e-4","expect":{"contains":["University Of Alabama"],"notRefusal":true}},{"q":"give the name for 2.6184341e-4","expect":{"contains":["Fordham University"],"notRefusal":true}},{"q":"tell me the name of the stderr attend 1.84021e-4","expect":{"contains":["Middlebury College"],"notRefusal":true}},{"q":"give the name for 1.0397455e-4","expect":{"contains":["University Of Idaho"],"notRefusal":true}},{"q":"give the name for 1.4205331e-4","expect":{"contains":["Yeshiva University"],"notRefusal":true}},{"q":"tell me the name of the stderr attend 1.3332037e-4","expect":{"contains":["University Of California, San Diego"],"notRefusal":true}},{"q":"what is the name of 1.60057e-4","expect":{"contains":["American University"],"notRefusal":true}},{"q":"give the name for 1.9091617e-4","expect":{"contains":["Lafayette College"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
