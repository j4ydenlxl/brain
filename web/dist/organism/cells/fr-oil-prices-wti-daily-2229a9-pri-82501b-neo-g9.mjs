// fr-oil-prices-wti-daily-2229a9-pri-82501b-neo-g9.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"fr-oil-prices-wti-daily-2229a9-pri-82501b-neo-g9","class":"fr-oil-prices-wti-daily-2229a9-pri-82501b","generation":9,"lane":"neo","grownFrom":["what is the date of 13.25","tell me the date of 46.81","name the date of 45.6","what is the date of 18.98","tell me the date of 80.83","name the date of 47.03","what is the date of 62.7","tell me the date of 53.5","name the date of 74.95","what is the date of 40.84","tell me the date of 80.69","name the date of 88.14","what is the date of 49.31","tell me the date of 15.68","name the date of 47.32","what is the date of 13.15","tell me the date of 55.6","name the date of 29.37","what is the date of 78.75","tell me the date of 92.09"],"version":1});

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
knowLoad([{"id":"corpora-fruits","columns":["item"],"n":115,"cols":[{"f":"0apple|2ricot|1rtichoke|1sparagus|1vocado|0banana|1eet|2ll pepper|1ilberry|1lackberry|5currant|2ood orange|2ueberry|1oysenberry|1read|5fruit|2occoli|2ussels sprout|1utter|0cabbage|2nary melon|3taloupe|2rrot|2uliflower|1elery|1heese|3rimoya|4ry|2icken|3li pepper|1lementine|2oudberry|1oconut|1ranberry|1ucumber|2rrant|0damson|2te|1ragonfruit|1urian|0egg|3plant|1lderberry|0feijoa|1ig|0garlic|1inger|1oji berry|2oseberry|1rape|5fruit|1uava|0honey|5dew|1uckleberry|0jackfruit|2mbul|1ujube|0kale|1iwi fruit|1umquat|0leek|2mon|2ttuce|1ime|1oquat|1ychee|0mandarine|3go|1ilk|1ulberry|2shroom|0nectarine|1ut|0olive|1nion|1range|0papaya|2rsnip|2ssionfruit|3ta|1each|3r|2rsimmon|1hysalis|1ineapple|1lum|1omegranate|4lo|2tato|1urple mangosteen|0quince|0radish|2isin|2mbutan|2spberry|1edcurrant|1ock melon|0salal berry|3mon|3t|2tsuma|1pinach|1tar fruit|2rawberry|1ugar|1weet potato|0tamarillo|2ngerine|1ofu|2mato|1urnip|0ugli fruit|0watermelon|0yogurt","sep":"|"}]},{"id":"crypto-tickers","columns":["crypto ticker"],"n":11071,"cols":[{"f":"0A2A|14|2M|151|2T|1A|2A|2B|3L|2C|2G|2PX|2RT|2ST|2T|2VE|2Z|1BA|2BC|2C|3C|3D|2EL|3Y|2IC|2J|2L|2O|3ND|2R|2T|2X|2Y|3SS|1C|23|2A|3T|4O|2CEL|3N|2D|3C|2E|3N|3S|3T|4H|2H|3C|2ID|2K|2M|2N|2OIN|2P|3T|2Q|2RE|3IA|2S|2T|3A|3IN|3N|2U|2X|3T|2YC|1D|2A|3B|3I|3O|3PAD|3T|3X|2B|2C|3O|2D|3AMS|3Y|2EL|2F|2H|2I|2K|2L|2M|2N|3T|2O|3GE|3N|2P|2R|3X|2S|2T|2UX|2VT|2X|3X|2Z|1E|2C|2G|3GS|3IS|2LIN|2N|3S|3T|2ON|2R|3GO|3M|3O|2S|2T|3H|4C|2UR|2VO|3UM|1FB|2C|3T|2EN|2FC|2G|2IN|3T|2K|2NTY|2O|2P|2RO|4X|2TT|2X|2YON|1G|28|2A|3TA|2B|2ET|3UR|2F|2I|3V1|3X|2LA|3D|2M|2N|2O|3N|3V|2PC|2RO|3S|2S|2T|2V|3C|3E|2X|1HOO|2T|1I|2AI|3T|2B|3B|3K|2C|3O|4DE|4RE|2D|3I|3OC|4G|5E|3T|3US|2E|3N|2G|2I|2LINK|2M|3BOT|3EE|3S|3X|2N|3N|3U|2ON|4E|3T|3Z|2PAD|3E|4PE|3G|3IN|2R|3E|3I|3T|3X|2S|3HIB|2T|3ECH|4K|3K|3N|3RA|3T|2US|2X|1JNA|1K12|2A|2I|3TA|5X|2N|3C|2RO|2T|3IO|1LA|2BEDO|3T|2C|3E|3H|4E|3X|2D|3IN|2EPH|3X|2F|2G|3B|3O|2H|2I|3AS|3C|4E|3EN|3F|3NK|3S|3T|4A|3X|2KI|2LBI|3EY|3IN|2M|3E|2N|2OHA|3T|2P|3A|4CA|3H|4A|5C|4R|3INE|3S|2T|3A|3B|3COM|3D|3MAN|2U|3SD|3X|2V|3A|2WAYS|2X|2Y|1M|2A|3L|3PT|3TEN|2B|3ER|3T|2DC|3G|2E|2F|2G|2IO|3S|2KT|2LT|2M|3O|2N|2O|3GUS|3N|3S|2P|3L|2S|2T|2U|2V|2X|2Y|2ZE|1NA|3L|4OS|2B|2C|3P|3T|2D|3C|3X|3Y|2GEL|3L|4E|3O|2I|3M|4A|2J|3I|2K|3R|2ML|2N|2ON|2RX|2S|3R|2T|3C|3E|4X|3I|4S|3S|2US|2V|2W|2Y|1OG|2K|2P|2S|1P|2AD|2C|3G|2E|3D|3X|2FC|2H|2I|33|3NG|3S|3X|2L|2M|2N|2OD|3LLO|2P|3C|3LE|2RIL|3S|2S|2T|3OGE|2U|2W|2X|3P|3T|2Y|3S|2Z|1QT|3IS|2U|3A|4C|4P|4RI|1R|2A|3TA|3W|2B|3I|4T|3S|3T|3UZ|2C|3A|4DE|4NE|4S|3H|4A|4L|3O|4NA|3T|3X|2DR|3X|2E|3A|3N|4A|3PA|3S|2G|3O|4N|3US|2I|310|3A|420|3X|2K|3EN|4R|3I|3M|3N|2M|3A|3OR|3R|3S|2NA|3M|3O|3X|4M|2O|3N|3R|2PA|4C|2Q|2R|3O|3R|2SL|2T|3C|3E|4M|4ON|4Q|4X|3F|3G|3H|3I|4I|3L|3M|3P|3R|3T|3Y|2V|2W|2X|2Y|1S|2A|3FE2|3N|3P|2C|2D|3EX|2EED|2G|3C|2H|2IA|3MI|2K|3O|2M|2N|3T|2P|3C|3O|2QT|2R|2S|3A|4RA|3T|2T|3A|3O|4N|3R|4A|5L|4O|5C|3X|2UNA|2VA|2W|2Y|1T|2A|2B|2C|3C|2D|2ECH|3M|2F|3I|3S|2H|3E|2ID|2K|3N|2L|3AS|3X|2M|3A|3C|3I|3OS|2N|3T|2OLO|3M|3N|3R|3Z|2P|3AY|2R|3I|3NO|2S|2T|3R|2X|1U|2A|2C|3O|2DC|3F|3IO|3T|3X|2K|2N|3IT|2PC|2R|3A|3O|4RA|4S|3S|3UM|3Y|2SCM|3D|4C|2T|3O|4N|3UMN|1V|2A|3I|3L|4ON|3O|3T|4AR|4LY|3V|3X|2DO|2E|2G|2H|2I|3NOC|3VE|2L|2ME|2N|2O|2R|2S|2T|3M|2XL|3T|1WAX|2C|2M|2NEX|2O|3RK|2R|2S|2T|2X|1X|2C|2E|3L|2GT|2IAL|4V3|3OM|3S|4T|2L|3INU|2N|3T|2PR|2R|2S|3V1|2T|2YS|1YA|1Z|2A|3RT|2BI|2ERO|2IT|2R|2U|3KI|3M|2Y|0B1P|120|21|26|2G|2M|2X|13|191|1A|2AS|2BI|3L|3Y|4FB|4TK|4X|2C|3K|3OIN|4N|2D|3GER|2FC|2G|3S|2I|2JU|2K|3AC|3E|4D|3T|2L|3A|3D|3IN|3LZ|3PHA|3TO|2M|3A|3BOO|2N|3ANA|3C|4A|3D|4EX|3G|3K|3NER|3US|2O|3E|3S|2R|3A|3C|3K|3T|2S|3E|4AI|4D|3H|4C|4OS|3IC|4D|4S|3K|3T|2T|3H|3S|2X|3S|2Y|2ZED|1B|21|2ANK|2B|2C|3C|3G|3T|2DC|3T|2F|3T|2G|3C|2I|2K|2L|2N|2O|3S|2P|2R|2S|2T|3C|3F|1C|2A|3C|3P|3T|3U|2B|2COIN|2D|3N|3T|2EO|2F|2G|2H|3A|3C|3T|2I|3O|3TY|2L|2MC|41|2N|3A|3T|3X|2O|3IN|3Q|2P|3T|2R|3O|2S|2T|2UBE|3G|2V|3B|2X|2Y|2ZERO|1D|2AY|2B|2C|3C|2G|2ID|2L|2OG|3T|2P|3I|2R|2X|2Y|1EA|3CH|3I|3M|4MW|3N|4S|3ST|3T|2BE|2C|3H|3O|2D|2E|3P|3R|3T|4LE|4S|2FE|3I|3TM|3X|3Y|2G|2L|3A|3R|3T|2M|3D|2N|3D|4OG|3G|3JI|3T|3V1|3X|3ZI|2P|3E|3R|4O|2RN|3RY|2S|3A|3T|4C|2TA|3BOX|3F|3H|4ER|3R|3S|3T|3U|2X|2Y|3OND|2Z|3OGE|1F|2C|3H|2DT|2EX|2G|2HT|2I|3C|2LOKI|3Y|2T|3C|2X|1GB|3P|2C|2G|2LD|2ONE|2PT|2S|2VT|1HAO|3T|3X|2BD|2C|2IG|3RE|3VE|2O|2P|3C|1IAO|2B|3I|3L|3O|2C|3O|3S|2D|3AO|3COM|3EN|3I|3P|3R|3Z|2FI|4F|2G|3HAN|3SB|3UP|2H|3U|2IS|2KI|2LL|2M|2ND|3EM|3GO|3O|3S|3TEX|3U|2O|3B|3C|3FI|3P|3S|3T|2P|3C|3X|2R|3B|3D|2S|3KIT|3T|2T|316|3AIR|3B|3C|4AR|5T|4CA|4I|4M|4NY|3F|3G|3HER|3L|3M|3N|4EW|3O|4K|4RB|3RA|4UE|3S|4D|4Z|3T|4O|3USD|3X|3Z|2UT|2VE|2X|3B|3I|2ZA|3Z|1J|2K|1KBT|2C|2ING|2K|2N|2PT|2R|3W|2S|2T|2X|1LA|3CK|3DE|3NK|3S|4T|3ZE|5X|4R|2C|3T|2D|2ENDR|3RF|3S|2F|2HC|2I|3D|3N|4K|4U|3TZ|5P|2K|3C|3D|3S|2N|3M|2OB|3C|4K|5N|5S|4M|4X|3K|3ODY|4MT|3X|2P|2RY|2S|3T|2T|3C|3G|3V|2U|3E|4M|4S|3I|3R|4T|3T|2V|33|2WA|2X|3M|2Y|2Z|3D|3E|1M|2AGA|3RS|2BO|2C|2DA|2E|3X|2F|2G|2H|2I|3C|2K|2ON|2P|2T|2W|2X|3T|3X|1NA|3NA|2B|3CAT|4H|3DOG|3H|3P|3TC|3X|2C|2D|2F|2IX|2K|2N|2P|3L|2R|3TX|2S|3D|3OLD|3X|2T|3E|3N|3Y|2U|2X|1OA|3I|3RD|3T|2BA|4I|3C|3O|3S|3T|2C|2DA|4V2|3EN|3HI|3O|3YP|2E|2G|3EY|2JAK|3I|2K|3I|3U|2LD|3I|3T|4T|2MB|4C|4M|3E|42|4OW|4S|3K|2N|3A|3D|4LY|3E|4S|3IX|3K|4H|3O|3TE|3US|2O|3B|3FI|3K|3M|3NS|3P|3ST|5O|3T|2R|3A|3ED|3G|3ING|3K|3UTO|2S|3E|3ON|5C|3S|3T|3U|2T|3C|3S|3TO|3X|2U|3NCE|3TS|2W|3E|2X|3ETH|3T|3X|3Y|2YS|2ZO|1P|2AD|3Y|2D|2EPEF|3T|2INKY|2L|3C|2N|2RIVA|3O|2S|2T|3C|2X|1Q|2C|2QQ|2T|3X|1R|234P|2ACE|3IN|3NA|4D|3T|4T|3Z|2C|3P|3T|2D|3D|3G|2EE|4D|3PE|3TT|5A|3W|2G|3E|3X|2I|3A|3C|4K|5S|3DGE|3GHT|3K|3SE|3T|4TO|3UM|3X|2K|3L|2MV|2N|3K|3X|2O|3CK|3GG|3NZ|2RR|2T|3R|3X|2UNE|3SH|3V|2WL|2X|2Y|3LL|2Z|3E|3N|1S|2AFE|4U|2B|2C|3H|3M|3PAD|5Y|3S|3V|2E|3ND|2FM|2G|3G|3S|2HARE|3IB|2I|2KT|2L|2OL|3V|2P|3M|3T|2R|2SB|2T|3AR|3C|3K|3N|3S|3Y|2V|2W|3AP|2X|2Y|3S|1T|21|22|2A|3D|3F|3MA|2B|3L|3S|2C|32|3A|4S|4T|3B|4R|3C|3D|3E|4X|3F|3GO|3H|4D|3INU|4X|3K|3L|3M|4T|3N|3P|4AY|4X|3R|4ED|4Y|3S|4T|3T|3US|3V|4B|3Z|2D|3X|2E|3X|2F|3A|2G|2H|2K|2L|3C|2M|3G|3I|3K|2NT|4V2|3YX|2O|3P|2P|3L|2Q|2R|3FLY|3L|3M|3N|3S|4T|2S|3C|3E|3G|2T|3F|3OLD|3R|3Y|2U|2V|2W|2X|3C|2Y|3C|2Z|3C|3N|1U|2B|3O|3U|2C|3K|4S|2D|3DHA|3G|2FF|4ET|2GG|3S|2ILD|2K|2LL|4C|4S|5H|2MN|3P|2N|3DL|3I|3NY|2RGER|3N|4NY|4S|4Z|3P|3RRD|2SD|4C|3Y|2T|2X|2Y|3I|2ZZ|1V3A|2C|2M|2ND|2O|2T|1WB|2F|2J|2K|2N|2O|2S|2T|32|2X|1X|2A|2BT|2C|2F|2H|2K|2MI|2R|2T|3B|2X|2Y|1YC|2G|2TE|4S|3HER|3S|3Z|1Z|2ENIQ|2KY|2L|2NT|2R|3X|2X|2Z|3ONE|0C2|20|25|2H6|2X|13|198|1A|2AVE|2B|3O|3S|2CH|4E|3TUS|2DC|3INU|3N|3X|2F|2G|3A|2H|2I|3D|3R|3Z|2KE|4W|2L|3C|3I|3L|3O|2M|3C|3EL|3LY|3P|2N|3CER|3D|4Y|3N|3TI|4O|3YA|2PD|3O|3P|3S|3T|3V|3Y|2R|3AT|3BO|5N|3D|4S|3E|4S|3O|3PE|3R|4OT|3T|2S|3H|4T|3INU|4O|3PER|3T|4LE|2T|3AI|3BOY|3C|4EO|4H|3E|3HAT|3MAN|3O|3PAY|3S|3T|3WIF|3X|3Z|2U|2VA|4DA|3E|3O|2W|3CEO|1B|2ABY|3NK|3T|2C|2D|3C|3G|2E|3T|4H|2FT|2G|2IXP|2K|2M|2NT|2OT|2P|2RL|3T|2S|3L|3N|2T|2U|3CKS|3K|2X|2Y|1C|210|2A|3KE|3R|3SH|2C|3X|2D|2E|2GDS|2H|3G|2I|3N|2L|2N|2O|3IN|3MM|4P|3S|2P|2RB|2T|3N|2V2|2X|3C|3X|1DAI|2EX|2L|2N|2OGE|2PT|2RX|2T|2X|2Y|1EDEX|2EK|2FS|2JI|2L|3EB|3L|3O|3R|3T|2M|2N|3NZ|3T|4RA|3X|2RE|4S|2SC|2T|3H|3I|3US|2UR|2X|1F|2C|2D|2F|2G|2I|2L365|3ASH|3O|2T|3Y|2X|3Q|3T|1GA|2G|2L|3D|2O|2PT|2S|2T|2U|1HA|3D|4S|3IN|3L|3MP|5Z|3N|4CE|4GE|3O|3PZ|3RM|4S|4T|3SH|3T|2B|3R|2C|2D|2ECK|5R|3DDA|3EL|4MS|4SE|3Q|3R|4RY|3SS|3X|2FN|3T|3U|3X|2H|2I|3CA|4KS|3EF|3HUA|3I|3LD|4I|4L|3NU|3P|4S|3RP|2K|3N|2LT|2MB|3PZ|2N|3G|2O|3KE|3NK|5Y|3OF|3PPY|3W|3Y|2P|2R|3P|2S|3B|2T|2UB|3CHU|4K|2VF|2W|2X|2Y|2Z|1IC|2F|2M|2N|3D|3NI|3U|3X|2OTX|2PHC|2R|3C|4LE|4US|3US|2TI|3Y|2V|3IT|2X|3100|1J|2C|2R|2T|1KB|3TC|2C|2EK|3TH|2P|2T|2USD|1L|2A|3M|3SS|3Y|2B|3R|2CT|2D|3X|2EAR|3G|3O|3V|2FI|2H|2ICK|3FF|3MB|3N|4K|4T|3PS|3Q|3ST|2M|3RS|2N|3Y|2O|3AK|3RE|3UD|4T|2PX|2R|3TY|2S|2T|2U|3B|3D|2V|3A|3X|2X|2Y|1MA|2C|3C|3T|3X|2DX|2ERGE|2FI|2IT|2K|3R|2L|2M|2N|2OS|2P|3CO|2Q|2S|3N|2T|3C|2Z|1NAB|3ME|2B|3C|2C|3L|3T|2D|3L|2ETA|2F|3I|2G|2HT|2L|2MT|2N|3S|2O|2RG|2S|2T|3M|3R|2US|2X|2YD|3T|3X|1O|22|2AL|2B|3E|2C|3K|3O|2DAI|3EG|4O|4X|3I|3Y|2E|2FI|4X|2G|3E|4N|3I|3S|2I|3NBT|4G|4SL|4YE|2KE|2L|3A|3L|4AR|4E|4G|3R|3T|3X|2M|3B|4O|3E|3FI|3M|3P|4D|3T|2NE|3G|3I|3J|3K|3S|3V|3X|2OHA|3K|3L|3P|2PE|3I|4UM|3S|2Q|2R|3AL|3E|4G|4UM|3GI|5B|3N|3X|2S|3HI|3M|4IC|3P|3S|3T|3X|2T|3I|2U|3NOS|3P|2V|3A|4L|3ER|4X|3IR|3N|2W|3RIE|2X|2Y|2ZP|1P|2AD|3N|3Y|2C|3OIN|2D|2ET|3X|2H|2I|3GGY|2L|3O|2N|2O|3O|4L|3S|2R|3OP|3X|2S|2T|2U|2X|2Y|1QST|2T|1R|28|2A|3B|3CER|4K|3DLE|3FT|3IG|3MER|3VE|2B|3N|2C|2D|3C|3N|4C|3S|3T|4S|2E|38|3A|4L|4M|3D|4I|5T|4O|3ED|3MAT|3O|3P|4E|3S|3V|4A|2F|3I|2GO|2H|3T|2I3X|3ME|2L|2M|3S|2NCHY|3K|2O|3AT|3B|3CO|3GE|3ID|3N|4A|4K|3WD|4N|3X|2P|3S|3T|2S|3P|2T|3B|3M|3S|2U|3X|2V|3USD|3Y|2W|3D|3NY|2X|2YN|3P|4T|3STL|1S|2AC|3I|2C|2EN|2H|2IX|2M|3IC|2NO|3P|2OV|2P|3N|3R|2Q|2R|2S|2TC|3L|3R|2USHI|2WAP|2X|1T|2AG|3SK|2C|3N|2E|2F|2G|2I|3C|2K|3N|2L|3S|3X|2N|2O|2P|3L|3T|2R|3T|2S|3I|2T|2W|2X|3C|2Y|1UAN|2BE|4B|2CK|2DOS|2E|3X|2LO|3T|2MINU|2NI|2RA|3E|3I|4O|3RY|2SD|4C|4T|3T|2T|3E|2Z|1V|2A|3G|3ULT|2C|3C|3OIN|2G|2IP|2NC|3G|3T|2P|3T|2R|2S|3HOT|2T|3C|3X|2X|3CRV|3FXS|1W|2AR|2BTC|2D|2EB|3X|2IF|3S|2N|2R|2S|2T|2V|2X|3T|1X|2A|2C|3ELL|2G|2O|2P|3AD|2T|1YBA|3ER|5C|5D|3ONK|3R|2C|3E|3LE|4UB|3ON|2DER|2FI|2G|2L|2MT|2OP|2P|2RS|3US|2S|2T|1ZC|2F|2GOAT|2OL|2R|3X|2USD|2Z|0D11|12O|2T|13D|14RK|1AB|2C|3ASH|4T|3C|42|3H|3KIE|3S|3XI|2D|3A|3I|2F|3I|3T|2G|3O|3T|2I|3LY|5S|3MO|3N|3Q|3SY|2L|3I|2M|3EX|3O|2N|3A|3K|2O|31|3ACT|3B|3P|3SOL|3VC|3X|2PP|4SY|4T|4X|3S|2R|3A|3B|3C|3E|3ICO|4K|3K|4EN|3T|3X|2S|3C|3H|4D|4G|2T|3A|3P|3X|2V|3E|3IS|3P|2W|3G|4S|3N|2X|3X|2Y|3TA|1B|2A|2C|2D|2EAR|3T|2I|3C|3X|2L|2OE|3X|2R|2TC|3N|2UND|3Y|2X|2Y|2Z|1C|2A|3R|4D|3SH|3U|2B|2C|3T|2HF|2IP|2K|2LOUD|2N|3T|4R|2OIN|2R|3E|3N|2S|2T|3O|2X|2Y|1D|2AM|3O|2D|3D|2F|2IM|2K|2L|2N|2OS|2R|3ST|3T|2S|2X|1EA|3I|3L|2B|3ASE|3T|2C|3HAT|3I|3L|3ODE|2DE|2ED|3M|3P|4G|3R|3X|3Z|2FC|3I|45|4DO|4L|4T|3LA|4CT|4Y|3T|3X|3Y|2G|3A|3EN|5R|3O|4V|51|2HUB|2I|2K|2L|3FI|3OT|3TA|5C|2M|3IR|3OS|2NT|2OD|3R|2P|3O|3TH|2Q|2RC|3I|3O|3P|2S|3I|3O|3U|2TF|3H|2UR|3S|2V|3O|3T|3VE|3X|2X|3A|3E|3G|3IO|3M|3NET|3O|3T|4F|4V1|1F|2A|2B|3T|2C|2D|2G|3L|2H|2I|3AT|3O|3S|2L|2ND|4R|2P|2SG|2T|2X|2Y|3N|1G|2B|2C|3L|2D|3C|2H|2I|2LD|3N|2M|3E|3S|3T|3V|2N|3X|2OLD|3RE|2P|3T|2TX|2VC|2X|1HLT|2N|2P|2R|2S|2T|2V|2X|1IA|3BLO|3M|4ND|2BBLE|2C|3E|4M|2D|2E|3M|3SEL|2FI|3X|2G|3EX|3G|3I|4C|4F|3S|2KO|2LI|2M|3E|3O|2N|3ERO|3GER|4O|3O|3U|3W|2O|3NE|2P|3A|2S|3K|2T|2VA|3ER|3I|3O|3X|2W|2YAR|1JED|1K|2A|2C|2D|2EY|2KT|2S|2UMA|1LA|3NCE|2C|2ISK|2LR|2O|2PD|3T|2R|2T|3A|2X|3V|2Y|3COP|1MA|3IL|2C|3C|3H|2D|2G|2IND|2L|3G|2OD|3ON|2S|2T|3C|3R|2X|1N8|2A|2ET|2F|3LX|3T|2N|2O|3DE|3TES|2S|2T|3X|2VDA|2X|3C|2Y|1OBBY|3O|2C|3C|3K|3T|2D|3100|3I|3O|2E|2FI|2G|3A|4I|4LD|3B|3C|3E|420|4C|5O|4D|4GF|4P|4RA|4S|4TH|4X|4Y|3GY|3IRA|3MI|3O|3PAD|3RMY|3S|3Y|3Z|2JO|2KI|2LA|3LUR|3Z|2M|3E|3I|2N|3A|4LD|3G|3K|3S|3U|4T|2OH|3R|2PE|2R|3A|3K|4L|2S|3E|3HIB|2T|3C|3R|2UGH|2V|3I|2WS|1P|2AD|3Y|2DBC|2ET|3X|2I|3E|2LTR|2N|2P|2R|2S|2T|2X|2Y|1QQQ|1RA|3C|4E|4O|5O|3FTC|3GON|4Y|3M|3W|2B|2C|3T|2E|3AM|5S|3P|2F|2G|3N|2IFT|3NK|3P|3V|2KC|3T|2M|38|2OGGY|3NE|3P|4S|2P|3U|2S|2T|2XNE|2Z|1S|2B|2C|3P|3VR|2D|2FR|2G|2H|3ARE|3IB|2K|2LA|2R|3UN|2T|3R|2UN|2YNC|1T|21|2A|2B|2C|3T|2EM|3P|2G|2H|2N|2O|3P|3RO|2R|3C|2SLA|2X|1UA|3L|2B|3BZ|3I|2C|3ATO|3K|4D|4ER|2DE|2EL|3T|2G|3E|2KE|3O|2MMY|2N|3G|2O|3T|2SD|3K|3T|2X|2ZCE|1V|2C|2DX|2F|2G|2I|2P|3N|2RS|2S|2T|3C|2X|1WARS|2C|2EB|2T|2Z|1X|2A|2B|2C|3T|2D|2F|2G|3M|2H|2L|2N|2O|2R|2S|2T|1YC|2DX|2M|2N|3A|3EX|3MT|3O|2P|2ST|2T|1ZAR|2CC|2DD|2G|2I|2OO|0E21|2C|18|1A|2C|2G|3LE|3S|2I|2RN|3TH|2SYF|2T|2URIC|1B3|2A|3SE|2C|2EN|3T|2IT|2K|2OX|2S|3C|3T|2T|3C|2YT|2Z|1C|2A|3SH|2C|2D|2ELL|2G|2H|3O|3T|2LD|3IP|2O|3B|3C|4H|3FI|3IN|3M|3X|2P|2R|2S|2T|3E|2U|1DAT|2C|2DA|3IE|2E|3L|3N|3XA|2FI|2G|3E|4W|3T|2I|2LC|2N|3S|2OGE|2R|3C|2T|2U|3C|3M|3X|2X|1ER|2TH|1FBAI|2C|2FT|2I|3L|2K|2L|2X|1G|2AME|3S|3Z|2C|3C|2DC|2EM|2G|3C|3MAN|3P|3Y|2I|2LD|2O|3LD|2R|3N|2S|2T|2X|1HASH|2IVE|2RT|1IFI|2M|1JAC|2S|1KG|2N|2O|2S|2T|3A|1L|2A|3C|3D|3MA|3ND|2C|3ASH|2D|3A|2E|3C|3N|3S|3T|2F|3I|2G|2I|3C|3TE|3X|4IR|2K|2LA|3I|2M|3O|4N|3T|2ON|4GD|5T|2P|2S|2T|3C2|2U|2V|3N|2X|2Y|1M|2AID|3R|3X|2B|3ER|3R|2C|32|2D|2IGR|2L|2OJI|3N|3T|4I|2P|3C|3H|3IRE|3R|2RX|2T|2U|2V|2X|1NA|2C|3D|3N|3S|3X|2DCEX|2E|3DEX|2G|3T|2IGMA|2J|2K|2NO|2O|2Q|3AI|2RG|3X|2S|2T|3C|3ER|3R|4C|4P|4Y|3T|2U|2V|3ION|2X|1OC|2N|3C|2S|3C|3DAC|4T|3T|2TH|2X|1PAN|4US|2ETS|2IC|3K|4O|3X|2K|2S|2TT|2X|2Y|1Q|2C|2L|2M|2O|2PAY|2T|2U|3AD|4L|3I|4L|2X|2Z|1RA|37|2B|2C|320|2D|2E|3AL|2G|2IS|2K|2O|3N|2R|3OR|2SDL|2T|3H|4A|2W|2Y|2Z|1S|2AI|2BC|2CE|3ROW|2D|2G|3C|2H|3IB|2N|3C|2P|3R|2S|2T|3ATE|2W|2Z|1T|24|2ALON|2BS|3T|2C|2E|2FETH|2G|3M|3P|2H|32|3A|4X|3B|4N|3D|3ER|3F|4AI|4I|3I|4X|3M|3O|4S|3P|4AD|4LO|4OS|5W|4R|4Y|3S|3V|3W|3X|3Y|2I|2K|3N|2L|2M|2N|3A|2P|3OS|2R|3L|3NT|2S|3C|2T|2X|2Y|2Z|1UC|3OIN|3X|2L|2M|2NO|2RC|3E|3N|3OE|3S|3T|3U|3X|2SD|1V|2A|3N|3ULT|2C|3C|3OIN|2DC|2E|3AI|3D|3NC|4T|3R|4Y|2IL|2MOS|2N|2O|3AI|3L|3S|2R|3ICE|3T|3Y|2T|2U|2X|2Y|2Z|1WC|2IF|2ON|2T|3T|1XA|2B|2C|3C|3L|2D|2E|3N|2FI|2GO|2IP|3T|2LT|2M|3R|2N|3T|2O|3S|2P|3O|2RD|3N|2TN|3P|3RA|2Y|2ZO|1YE|3S|1Z|2C|2ETH|2I|2M|2T|2Y|0F16|2C|12C|2K|13|17|19|1AB|3A|3RIC|2CE|3T|4OM|4R|2DO|2G|2I|3R|4C|4G|2KE|4AI|3T|2ME|4C|3ILY|2N|3360|3C|3D|3G|3V|3X|3Z|2R|3A|3CA|3M|4A|4C|4S|2ST|2T|3HER|4OM|2V|3R|2YD|3RE|2ZZ|1B|2A|2B|2G|2N|3B|2URN|2X|1C|22|2C|2D|2F|2H|2K|2L|2N|2OIN|3N|2P|2Q|2S|2T|3C|1DC|2LS|2M|2O|2R|2T|2USD|2X|2Z|1EAR|2ED|2G|3V1|2I|2LIX|52|2N|3OMY|2R|3C|3MA|3T|3ZAN|2SS|2T|3CH|2VR|2X|2Y|1F|21|2A|2C|3T|2M|2N|2UEL|2YI|1GC|2D|2T|2Z|1HM|1I|2BO|3RE|2C|2D|3A|3LE|3O|2ELD|2F|3TY|2G|2H|2II|2L|3DA|3ES|3L|3M|3ST|2N|3A|4LE|3C|3D|3E|3GER|3K|3N|3OM|3S|3U|2O|2RA|3E|3O|3U|2S|3H|3T|2T|3C|3FI|3T|2U|2WA|2X00|1JB|2C|2T|1K|2GARY|2PEPE|2X|1L|2AG|3ME|3P|3S|4H|5C|2C|2D|3C|3T|2EPE|3TA|3X|2G|2IC|3GHT|3K|3NU|3P|3X|4X|2L|3W|2M|3C|2N|2O|3AT|3KI|5M|5X|3OF|4R|3RK|5Y|3T|3VM|3W|4P|3YX|2P|2R|3BRG|3S|2S|2T|2UID|3RRY|3T|3X|4B|4T|3Z|2VR|2X|2Y|2Z|1M|2B|2C|2E|3X|2G|2L|2T|1N|2B|2C|3T|3Y|2D|3Z|2F|2K|2L|2O|2P|2SA|2TB|2X|2Z|1O|2A|3M|2C|3V|2DL|2F|3O|2GE|2IN|2L|3D|3O|2MO|2N|3E|3S|3T|3Z|2OD|4C|3M|3X|2PA|2R|3A|3CE|5C|3E|4X|3K|3M|3S|3T|4H|5B|2TA|3O|2UR|2X|3AI|3D|3E|3F|3T|3V2|3Y|1P|2AD|2C|2FT|2IS|1R|2A|3C|3X|3Z|2C|2D|3X|2E|3C|4NX|3D|3E|4D|4LA|3L|3N|4S|2F|2GST|3X|2IC|3N|2K|3T|2LONG|2M|2N|3T|2OG|4E|5X|4GY|3NK|4T|3YO|3ZE|2P|2R|2SP|3T|2TC|3N|3S|2V|2WC|2XETH|2Z|3SS|1S|2BT|2C|3C|2HN|2M|2N|2T|3C|2W|1T|2B|2C|2G|2I|2K|2M|3O|2N|2O|2P|2R|3B|3C|2S|2T|2UM|2VT|2W|2X|3T|1UBAO|2CK|2D|2EL|2FU|2JIN|2KU|2L|2MO|2N|3C|4H|3D|4C|4P|4X|4Z|3K|2R|3U|3Y|4X|2S|3DC|3E|3ION|3O|2TC|3URE|2ZE|3N|3Z|1VT|1WATCH|2B|2C|2T|2W|1X|2B|2C|2DX|2F|2I|2P|2S|2T|2Y|1YD|2N|2P|2Z|3NFT|0G1X|13|150|1999|1AC|2D|2FA|3I|2GA|2I|3A|3N|4S|2J|2KH|2L|3A|4TA|4V1|4X|5Y|3EON|3I|3O|3T|2M|3B|4IT|4L|3E|4C|4FI|4IN|4R|4X|3I|3MA|2N|3A|2P|3C|2RD|3I|3K|3T|4S|3U|4DA|3WIF|3Y|2S|3DAO|3G|3P|3TRO|2T|3E|3SBY|2U|2ZE|1B|2A|2C|3R|2D|2E|3X|2G|2IT|2K|2L|2O|3T|3Y|2PT|3U|2RC|2T|3C|2URN|2X|3T|2YTE|1C|2AKE|2C|2ME|2N|2OIN|3TI|2R|2W|1DAO|2C|3C|2DY|2E|2L|2O|3GE|2R|3T|2S|3C|2T|2X|1E|2A|3R|2C|3KO|2EQ|2GE|2IST|2KKO|2LATO|3O|2M|3A|3G|3INI|3S|3Z|2N|3E|3I|4E|4X|3S|4LR|3X|2O|3D|4B|3J|3L|3N|2P|2R|3A|3O|2S|3E|2T|3A|3H|3X|2X|2ZY|1F|2AL|3RM2|2CE|3S|2I|2LY|2N|2T|2UN|2X|2Y|1G|2AVAX|2C|3M|2G|2H|2M|2OLD|2P|3T|2R|2S|2T|3K|4N|1HA|2C|3OLD|2D|2NY|2O|3ST|5M|3UL|2ST|3Y|2T|2UB|2X|1IAC|2B|2C|3T|2F|3T|2G|3A|3X|2M|3MER|2N|3GER|3OA|3UX|3ZA|2O|3T|2V|3E|2Z|1JC|1KF|2I|1LA|3X|2C|3H|2D|3R|3S|3X|3Y|2E|3EC|2F|3T|2I|3DE|3NK|4T|2M|3R|2N|2OBAL|4E|3S|2Q|2R|2S|2T|2X|2YPH|1M|2A|3C|3T|2B|3L|2C|3N|3OIN|2EE|3X|2FAM|2I|2L|2M|3T|2NG|3T|2PD|2R|3X|2S|2T|3O|3T|2USD|2X|1N|2BT|2C|2D|2FT|2G|2J|2NX|2O|3ME|2R|2S|2T|3O|2US|2X|2Y|1O|2A|3L|4S|3T|2B|2C|2D|3E|3L|3S|3Z|2ETH|2F|3F|3X|2G|3O|3U|2IN|2KU|2L|3C|3D|4EN|4X|4Y|3F|3OS|2M|32|3A|3D|3T|2NE|2O|3CH|3D|3GLY|3N|2PX|2RA|3EC|2S|3S|3T|2T|3EM|3G|3X|2V|3I|3T|2W39|2YOO|2Z|1P|2AWS|2BP|2CX|2KR|2L|3X|2N|2O|2PT|2S|2TG|2U|3INU|2X|1Q|1R|2ACY|3IL|4N|3PE|3V|3YLL|2BE|3T|2C|2E|3ARN|3EN|5T|3G|3LF|3XIT|3Y|2FT|2G|2ID|4Z|3MEX|3N|2L|3C|2M|3D|2N|3D|2O|3K|4KY|4X|3N|3W|4TH|2P|3L|2S|2T|2UM|4PY|2V|3E|2W|3I|2X|1S|21|2C|2E|2HIBA|2I|2KY|2M|2PI|2R|2TBSC|3C|3ETH|3S|4OL|3T|2WAP|3IFT|2X|2Y|3S|1T|2A6|3I|3VI|2BOT|2C|3OIN|2E|2F|3O|2H|2IB|2K|2N|2ON|2R|2SE|2X|1UAC|3P|3R|4D|2C|3CI|2E|3SS|2I|3LD|3SE|2LF|2M|2N|3S|2P|2SD|4T|2T|1VC|2E|2R|2T|1W|2D|2GW|2T|1X|2A|2C|2E|2T|1YEN|2M|3NET|3REW|2RO|2SR|1ZB|2E|2IL|2LR|2ONE|2T|2X|0H2O|3N|13O|1ABIBI|2C|3HI|2HA|2I|3R|2KA|3KA|3U|2L|3F|3LO|3O|2M|3I|3S|4TR|2N|3A|3D|4Y|3U|2O|2PI|2RAM|3D|3E|3RYP|3T|2SH|4AI|4T|3UI|2T|3AY|3CHY|3I|2US|2VOC|3Y|2WK|2Y|3YA|2Z|3E|1B|2AR|4X|2B|2C|2D|3C|2E|2IT|2N|2O|3T|2RS|2T|3C|2X|1C|2C|2T|2XP|1D|2AC|3O|2G|2N|2RN|2V|2X|1E|2AL|3RT|5R|3T|3VEN|2C|3T|4A|2DG|4E|2EL|2FI|2GG|3IC|2LIOS|3L|4O|3MET|3PS|2MAN|3ULE|2P|2R|3A|3B|3MES|3O|4ES|2T|3A|3H|2X|3C|2Z|1F|2I|3L|2T|1GET|2HG|2O|3LD|2PT|2S|2T|1H|2EM|2GTTG|1I|2BAKC|4YC|3IKI|3S|2D|3U|2ENS3|54|2FI|3LUF|2GH|2H|2KARI|2LL|2MAYC|3E|2NA|3T|3U|2OD|4BS|2PP|2RE|2T|3BTC|3OP|2VE|2X|1K|2B|2C|2DOGE|3X|2G|2N|1LC|2D|3Y|2M|2N|2P|3R|3T|2S|2T|2X|1MC|2D|2KR|2N|3D|3G|2P|2Q|2R|3N|2ST|2T|3T|2X|1NB|2C|3N|2S|3T|2T|3R|2X|2Y|2ZO|1O|2A|2BA|3BES|3O|2CAI|2D|3L|2GE|2ICHI|2KA|3K|2L|3A|3D|4EX|3Y|2ME|3I|2N|3EY|3K|3OR|2OF|3K|3P|2P|3PY|3R|2RD|3SE|3US|2S|3HI|3KY|3TAI|2T|3N|3T|2USE|2W|3L|1P|2AD|3Y|2B|2C|2L|2N|2O|2T|2X|2Y|1QR|2T|2X|1RB|3E|2CC|2D|3G|2M|2O|2TS|1SC|2F|2N|2P|2S|2T|2UI|4TE|1T|2A|2B|2C|2D|3F|2E|3R|2M|3L|3OON|2N|2O|2R|2T|2X|2Z|1UAHUA|2B|3II|2C|2DI|2GE|3O|2H|2M|3AI|3P|2ND|3NY|3T|2R|2S|3D|3H|3KY|3L|2T|1VC|3O|2E|32|2H|2I|2N|3T|2T|1WC|2L|2T|1XA|2C|2D|2RO|2T|2X|3H|1YBN|3RID|2C|2DRA|4O|5P|2GH|2N|2P|3E|4R|5D|5S|4S|3R|2S|2T|2VE|1Z|2D|2M|2N|2T|0I0C|17|19C|1AG|2I|2M|1B|2ANK|3T|2ETH|3UR|2FK|3N|3R|2G|2IT|2NB|2P|2S|2TC|1C|2A|3P|3SH|2B|2C|2E|2G|2H|3I|3N|3X|2LICK|2N|2OB|3M|3N|4S|3O|3S|2P|2SA|3T|2T|2X|1D|2AC|3P|2C|2EA|3FI|3X|2H|3UB|2IA|3CE|2K|2LE|2M|2NA|2O|3L|3RU|2RT|3X|2T|3T|2V|2X|3M|3S|2YP|1EC|2TH|1F|2C|2IT|2LT|2T|2UM|3ND|2X|1G1|2CH|2G|2I|2NIS|2TT|2U|3P|1HC|2F|2T|1IC|1JC|2Z|1LA|2C|3T|2K|2T|2V|1MBTC|2C|2E|2G|3NAI|3Z|2I|2L|2MO|2O|2P|3ACT|3CH|4N|3ER|3S|3T|2S|3T|2T|2U|2VR|2X|1N|2ARI|2B|2C|3AKE|3NT|3P|2D|3EX|3I|4A|3U|3Y|2E|3RY|3S|3T|3X|2F|3C|3I|4NI|3LR|3O|3RA|3T|4T|3X|2G|2J|2K|2N|3BC|3OU|2O|2P|2RT|2S|3ANE|3C|3N|3P|3R|3T|4AR|3UR|5C|2T|3D|3ER|5N|3L|3O|3R|3X|2U|3INU|3KO|3S|2V|3C|3I|4C|3OX|3X|2X|3M|3T|1O|2C|2EN|3X|2I|2N|3C|3X|3Z|2P|2SHIB|3T|2T|3W|3X|2U|3X|2V|3T|2WN|1P3|2AD|2C|2DN|2L|2MB|2OR|2SX|2T|2UX|2V|3OLD|2X|1Q|250|2C|2N|2Q|2T|1RA|2C|2ENA|2IS|2L|2ON|2T|2YDE|1SA|2DT|2G|2H|3I|3ND|2IKC|2KR|3Y|2L|3AMI|3M|2P|2R|2SP|2T|3EP|1TA|3M|2C|2EM|2F|2G|3R|2HEUM|2L|3R|2M|2OC|2R|2SB|2U|2X|2Z|1UNGO|2S|3D|2X|1VAR|2C|2I|3P|2N|2Y|2Z|1W|2T|1X|2C|2P|2S|2T|1YKYK|1ZA|2E|3R|2I|2X|2ZY|0J8T|19BC|1ACK|3S|3Y|2DE|4C|2IHO|2KE|2M|2N|3E|2R|3ED|3Y|2SMY|2WS|2Y|1BOT|2S|2X|1C|2B|2C|2G|2O|2R|2T|1DC|1ED|3ALS|2ET|2FE|3F|2LLY|2M|2N|2RRY|2SUS|2T|3TON|2UR|2W|3EL|2X|1FI|3N|3VE|1GLP|2N|1IAOZI|2B|2F|2M|2ND|2O|2ZZ|1K|2C|2L|1LP|1M|2C|2PT|2T|2Z|1NB|2GL|2S|2T|2X|2Y|1OB|3S|2E|3Y|2HM|2INT|2JO|2K|3ER|2LT|2NES|2OPS|2Y|3S|3T|1P|2AW|2D|2EG|2GC|2YC|3X|1RIT|2T|1SE|2M|2OL|2T|1T|2C|2O|2S|2T|2X|1UDGE|2GNI|2I|3CE|2L|3B|3D|2MBO|3P|2N|3O|2P|3I|2R|2SDC|4T|2V|1VL|2Y|1W|2L|0K21|2G|1AAS|2BOSU|3Y|2C|3Y|2G|2I|3KEN|3NET|2KA|3I|2L|3A|4M|3DI|3I|3LY|3M|2M|3PAY|2N|3G3N|4AL|2P|3U|2R|3ATE|3EN|3MA|5D|3T|2S|3TA|2T|3A|4NA|3Z|2U|2VA|2WA|2YI|1B3|2C|2D|2OND|3T|3X|2R|2T|3C|2X|1C|2AKE|3L|3SH|3T|2CM|3PAD|2H|2S|2T|1DA|3G|2C|2G|2IA|2OE|3GE|2X|1EANU|2C|2D|2EP|3S|2I|2K|3E|4C|2L|3PIE|2MA|2N|3NEL|3SHI|2P|2RMIT|2TAN|2X|2Y|3C|4AT|3FI|3T|1FC|2I|2R|2T|2X|1GC|2O|2T|1HM|1I|2AN|2BA|3SHI|2CK|4S|2F|2KO|2LLER|3T|2M|3BO|3CHI|2N|3D|3E|3G|493|4B|4F|4U|4Y|3T|3U|2RA|3BY|3O|2SC|3HU|2TA|3SU|3TI|4Y|2WI|2ZUNA|1KO|2T|1LAP|3Y|2C|2D|2EE|3VA|2IMA|3ST|2K|3S|2O|3N|2P|2T|2UB|2V|1MA|2C|2D|2L|2ON|2X|1NC|3L|2DC|3M|3X|2FT|2G|3N|2IGHT|3NE|2J|2OB|3T|3W|3X|2S|2T|3O|2W|1OBE|3O|2DA|2GE|2I|3N|4B|3P|2JI|2K|3O|2L|3ION|2M|3O|3P|2N|3G|3O|2RE|4C|3RA|2TO|2Y|2Z|1P3R|24R|2AD|3PA|2C|2HI|2L|2OP|1RAK|3TOS|2B|2C|2D|2EDS|3ST|2IDA|3PTO|2L|2M|2N|2O|3M|4E|3NE|2P|2RX|2T|2U|2X|1S2|2C|2H|3IB|2M|2N|2P|2S|2T|2WAP|2YS|1T|2C|2K|2N|2O|3N|2S|2T|2X|1UB|3E|3O|4S|2E|2JI|2KU|2MA|3U|2NCI|2R|3O|3T|2S|3A|3D|3H|2V|1VERSE|2I|2NT|2T|1WAI|3TT|2D|2ENTA|2H|2IK|2S|2T|1XA|2C|2USD|1YCC|2L|2OKO|2TE|2UB|2VE|1ZC|2EN|0L2|2DAO|13P|2USD|17|1A|2B|3RA|3S|3X|2CE|2DA|3YF|4S|2EEB|2I|3KA|2KE|2LA|2MB|4O|2NA|3C|3D|4B|4S|3E|2O|2R|3IX|3O|3RY|2S|2T|3TE|3X|2UNCH|2VA|4X|3E|3ITA|2W|2X|2YER|2Z|3IO|1BA|2C|2K|2L|3OCK|2R|2T|3C|2XC|1C|24|2ASH|2C|2D|2G|2K|2MG|3S|2P|2R|3O|2S|3N|2T|2WP|2X|1DC|2FI|2M|2N|2O|3GE|2X|3G|2Z|1EA|3D|3F|3G|3N|3SH|2D|3U|2E|3T|2G|3O|2IA|2LE|2MC|3D|3N|3O|4N|2N|3D|4A|4S|3FI|3IN|2O|3S|3X|2PA|3EN|2SS|4F|2T|2U|2V|3E|4LG|4R|5J|3L|2X|3I|2Z|3GI|1F|2C|2G|2I|2NTY|2T|2W|1GBT|4Q|2C|3Y|2D|2O|3LD|3T|2R|2X|1HB|2C|2D|2INU|2T|1IB|3ERA|5O|3FX|3RA|4E|2C|3K|3O|2D|3ER|2EN|2F|33|3E|3T|2GER|3HT|3MA|3O|2KE|4C|2LA|2ME|4X|3O|3X|2NA|3DA|3EA|3G|3K|4A|4C|4FI|3Q|3U|3X|2ON|2PC|3S|2Q|3D|3R|3UI|2R|2S|3A|2T|3E|3H|4O|3ION|3T|2V|3E|2XX|2Z|3A|4RD|3D|1K|27|2C|2D|2N|2SM|2T|2U|2Y|1LAND|2G|2ION|1M|2AO|2C|3H|2EOW|2R|2T|2WR|2XC|2Y|1N|2C|2D|3RY|3X|2K|3C|2L|2R|2T|2X|1OA|3N|2BS|2C|3C|3G|3I|3K|3O|3US|2DE|2F|3I|2G|2IS|2KA|3R|2L|3A|3C|2N|3G|4FU|2OK|4S|3M|3N|4G|3P|4Y|3T|4EX|2PES|2RD|4S|4Z|3Y|2ST|2T|3ES|4U|3TO|4Y|3US|2UD|2V|3E|4LY|2WB|2X|2YAL|1P|2C|2I|2K|2L|2NT|2OOL|2T|2V|2Y|1Q|28|2BTC|2D|3N|3R|3X|2R|2TY|1RC|2G|2N|1SC|2D|3OGE|2ETH|2HARE|2K|2P|2S|2T|3AR|2V|2WAP|1T|2A|2B|3C|3TC|3X|2C|3C|3D|3H|3P|3R|3U|3X|2D|2E|3X|2G|2H|3N|2K|2NM|2O|3V1|42|2PC|2R|3BT|2S|2T|2X|2Z|1UA|2C|3A|3HOW|3K|4Y|5B|3Y|2DO|2FC|3FY|5G|2IGI|3S|2LU|2M|3A|3I|2N|3A|4R|4T|3C|4H|3E|4S|3G|3R|2PIN|2S|3D|3H|2T|2X|3O|3Y|1VG|2IP|2L|2M|2N|2X|1WC|2F|1X|2C|2F|2T|3O|1YB|2C|2F|3E|2K|2L|2M|2N|3K|3X|2O|2QD|2RA|2TX|2UM|2VE|2X|3E|1Z|0M1|12O|187|1AC|2DANA|3C|3OG|2EP|2F|2G|3A|3E|3IC|5F|5K|5V|4K|3NET|2HA|2I|3A|3D|3L|2KE|3I|2LL|4Y|2MAI|2N|3A|3C|3DOX|3E|3GA|3NA|3TA|4LE|2P|3C|3E|3R|3S|2R3|3CO|3E|3I|4O|3K|3LEY|3MAJ|3O|3S|44|4C|4H|3T|4K|3U|3V|4IN|3X|3YJ|2S|3A|3K|3P|3Q|3S|3TER|3YA|2T|3A|3CH|3E|3H|3IC|5X|3PAD|2U|2V|3IA|2W|2X|3I|3R|3X|2Y|3P|2ZC|3I|3ZE|1B|28|2ASE|2CASH|3C|2E|3T|2F|2I|3T|2L|3C|3K|2M|2N|2ONK|3T|3X|2P|2RS|2S|2T|3C|3X|2X|1C|2ADE|3P|3R|3SH|3T20|3U|2B|2C|2D|2ELO|3UR|2F|2G|2H|3C|2I|3V|2LB|2N|2O|32|2P|3C|2RC|3N|3T|2S|2T|2U|3SD|2V|1DA|3I|3O|2B|2C|3L|2DN|2F|2H|2I|3CE|2M|2N|2R|2S|2T|3K|2U|3S|2X|3H|1E|2AN|2B|2C|3H|4A|3I|2D|3I|4A|4C|5O|4T|2E|3D|3R|3T|2F|3A|2GA|2L|3B|3D|3I|3LO|3O|4S|3T|2M|3E|4AI|4ME|4S|4T|2NGO|3LO|2OW|4G|4IF|2PAD|2R|3CE|4U|3I|3KLE|2SA|3G|3H|3SI|2T|3A|4C|5R|4F|4G|4L|4N|5O|4PK|4Q|4S|4T|4V|4X|3EOR|4R|3FI|3H|3I|4S|3M|3O|4LD|3RO|2U|2V|3R|2W|3TWO|2X|3C|3P|2ZZ|1F|21|2AM|2C|2ER|3T|2G|2I|2O|2PS|2S|2T|3U|2UND|2X|1G|2AMES|3R|2D|2G|3T|2KL|2LC|3D|2N|2O|3D|2P|3T|2T|2UL|2X|1HAM|2C|2LX|2P|2T|2UNT|1I|2A|2B|3O|3R|2C|3E|3KEY|3RO|2DAI|4S|3N|2E|2F|2G|3MIG|2KS|2L|3E|4I|3K|42|3LI|3O|2M|3I|4R|3O|2N|3A|3C|3D|4EX|4S|3E|4X|3I|4ON|3O|3S|3T|4ME|4YS|3U|4TE|3X|2O|3DIO|3TA|2R|3C|2S|3A|3HKA|3S|3T|2T|3C|3H|3X|2V|3A|3RS|2X|2Y|1JT|1KC|2EY|2ONG|2R|2T|2USD|1L|2A|2D|2GC|2ITE|2K|2N|3K|2OKY|2S|2T|3C|3PX|2XC|1M|2A|3I|3ON|3PS|2C|2ETA|2F|2G|2IT|2NXT|2O|2PRO|2S|3C|3S|2T|3M|2UI|2VG|2X|3IV|3VI|2Y|1N|2B|2C|2D|3CC|3E|2E|3T|2FT|4S|2G|3O|2I|2M|2R|3B|3CH|2S|3T|2TC|3G|3L|3O|3P|2V|3M|2W|2X|2Y|2Z|1O|2AC|3R|3T|2B|3I|4C|4E|4LE|3U|3X|3Y|2C|3HI|3O|2D|3A|4I|3C|3EL|4X|3UM|3X|2E|3TA|2F|3I|3OLD|2G|3U|3X|2H|2I|3N|2JO|2K|2L|3A|3K|2M|3A|2N|3A|4V|3ETA|4Y|3F|3G|420|3I|4E|3K|4E|5Y|4U|3O|3S|4T|5A|3T|4E|2O|3I|3LYA|3N|4C|4D|4ED|5R|5Y|4R|3O|3V|3X|2PS|2RA|3E|3OS|3PH|3RA|3SE|2S|2T|3A|3G|3I|3O|2UTAI|2V|3D|3E|4R|4Y|4Z|3ON|3R|2W|3A|2Z|1P|23|2AY|2C|2D|2G|2H|2I|2L|3US|3X|2M|2RO|2S|2T|2WR|2X|3T|1QL|2ST|1R|2BOB|2CH|3R|2F|3OX|2HB|2I|2K|2N|3A|2P|3EPE|2S|3A|2T|2UN|2V|2X|3B|2Y|1SA|2B|2C|3P|3T|2D|2G|3O|2HD|3IB|4P|2N|2OL|3T|2P|2Q|2R|2T|3O|2U|2WAP|1T|2A|2B|3C|2C|3MN|3N|2D|2EL|2G|2H|3D|3N|2IX|2K|2L|3M3|3X|2N|2O|2P|2R|3A|3C|3G|3M|3X|2S|3H|2T|2V|3T|2W|2X|3LT|2Y|2Z|1U|2BI|2DOL2|3RA|2E|2LTI|5V|2MU|2N|3CH|3ITY|2RA|2SD|3E|3IC|3K|3T|2T|3E|2U|2ZZ|1V|2C|2D|3G|2EDA|2G|2I|2L|2P|2RS|2U|2X|1W|2AR|3T|2C|3C|1X|2C|2M|2NT|2RP|2T|3C|2W|2X|2Z|1YB|2C|3E|2DFS|2ID|2L|3O|2NE|2O|3BU|2RA|3IA|3O|4O|2ST|2T|3H|3V|1ZC|2G|2K|2M|2R|2X|0N0031|11|13DR|17|18V|1ABOX|2C|2DA|2FT|2H|2KA|2LS|2M|3E|4C|3I|3O|2N|3A|4S|3J|3O|2O|3S|2P|2RCO|2S|32|3H|3SR|3TR|2T|3ION|2UT|2V|3C|3I|4A|4B|3X|3Y|2WA|2X|2ZAR|1BABSC|3I|3R|2C|2IT|2L|3U|2NG|2OT|3X|2P|2R|2S|2T|1C|2ASH|2C|2DT|2O|3P|3R|4AI|3V|2P|2R|2T|1D|2AU|2C|2LC|2N|2OGE|2R|2X|1EAL|3R|3T|2BL|3U|2C|2ER|3T|2F|2I|2KI|3O|4IN|4S|2MO|3S|2O|3G|3K|3M|3N|3S|3X|2PT|2RD|3F|3O|3VE|2SS|3T|2T|3C|3KO|3Z|41|2U|3ROS|3TR|5O|2VA|3ER|2W|3B|3G|3M|3O|4S|3S|3TON|2X|3A|3BOX|4T|3M|3O|3T|4EX|3XO|2ZHA|1FAI|2CR|2D|2E|2N|2P|2T|311|3ART|3B|4S|3D|3E|3I|3L|3N|3P|3S|3T|3X|4HI|3Y|4P|2UP|2XC|2Y|1GA|2C|2IN|2L|2M|3I|1HCT1|2T|1IBI|2C|3E|4C|2F|3T|4SY|2HAO|2I|3FI|2K|2M|3FA|2N|3JA|5Z|3KY|3O|3U|2OB|3X|2T|3O|3RO|5E|5G|2X|2ZA|1KA|2C|3LC|2N|2T|1LC|32|2G|2INK|2S|2X|1MB|3TC|2C|2D|2H|2K|3R|2R|2S|3P|2T|2X|1NB|2C|2I|2N|2T|1OA|3H|2BL|2DE|3IS|3L|2IA|3S|3Z|2KA|3U|2LA|2M|2NE|2O|3T|2R|3A|3D|3MIE|2S|3N|3O|2TE|2V|3A|2W|2X|3B|1PAS|2C|2ER|2ICK|2LC|2M|2T|2X|3S|1RB|2C|3H|2FB|2G|3Y|2K|2M|2N|2O|2P|2S|2V|3E|2X|1S2DRP|2BT|2D|3X|2FW|2H|2I|2K|2P|2R|2S|2TE|2UR|4E|1T|2B|3C|2C|3C|2D|2G|2K|2M|2O|2R|3N|2S|2VRK|2WK|2X|2Y|1U|2A|2B|3IS|2DE|4S|2KE|2LS|2M|3I|2R|2SA|3D|2T|3GV2|3S|2X|1VA|2C|2DX|2G|2IR|2L|2OY|2S|3T|2T|2X|2ZN|1WC|3N|2P|2S|1XC|2D|3T|2E|2M|3C|2N|2RA|2S|2T|3I|3T|4Y|1YAN|4TE|2BBLE|2C|3REC|2E|3X|2M|2N|2X|2ZO|1ZC|2DX|2E|2L|2O|0O3|14DX|1AK|2S|3C|3IS|2TH|2X|1BEMA|2I|3TS|2OT|2ROK|2S|3R|2T|3C|2X|1C|2AI|3VU|2B|2C|2D|2E|3AN|5T|2ICAT|2L|2N|2P|2T|3A|4X|3I|3O|4C|4IN|2W|2X|1DC|2DZ|2E|2GN|2IN|2MC|2N|3T|2S|2X|2YS|1F|2BC|2C|3R|2E|2N|1G|2CINU|2D|2GY|2N|2O|3D|2SM|3P|2T|2V|2Y|2Z|1H|2ANDY|2M|2O|1ICOIN|2L|3D|2N|2O|1JA|2X|1K|2B|2G|2LP|2OIN|2S|3E|2T|1LAND|3S|2DSF|2E|3A|2IVE|2OID|2T|2V|2XA|2Y|3MP|1M|2A|3X|2C|2D|2EGA|2G|3C|2I|3C|2MI|2NI|4A|4X|3OM|2T|2V1|2X|1N|2AM|2C|2DO|2E|3S|3X|2G|3AS|2I|3ON|3T|2L|3INE|3Y|2NO|2OT|2S|3TON|2T|2US|2X|1OE|2GI|2KI|3S|2RC|3T|2T|2W|1P|2A|3IG|2C|3T|2EN|4GO|4RI|4X|3PE|3S|3T|3X|2HX|2INU|3UM|2MND|2N|3N|2P|2S|3C|3EC|2T|3C|4M|3I|4G|4ON|2U|3L|2V|1RACLE|3I|4X|3O|3RE|2B|3IS|3K|3R|3S|3T|2C|3A|2D|3I|42|4FI|3S|2E|3O|3T|2GA|3T|2I|3GIN|3ON|2LY|2M|3E|2N|3J|2O|3C|3P|3X|2S|2T|2V|2YX|1S|276|2A|3K|2C|2EA|4N|3TH|2F|2HI|2K|2L|2MO|2QTH|2S|2T|2WAP|1T|2B|2HR|2K|2N|2O|2SEA|2X|1UCHI|2D|2R|2SD|4C|3E|2T|1VC|2N|2O|2R|1WC|2D|2L|2N|1X|2AI|2B|3T|2D|2EN|2M|2S|2T|2Y|32|3C|1YS|1ZG|2K|2MPC|2O|3NE|2P|0P202|2PS|13D|1404|1AAL|2BLO|2C|3E|3M|4AN|3OCA|3T|2D|2F|2GE|2I|3D|3NT|2K|2L|3AI|3ET|3G|3LA|3M|4Y|2M|3P|2N|3D|4A|5I|4O|5P|3GE|3IC|3O|2PA|3ER|3I|3PAY|2R|3A|4B|4L|5L|4S|4W|3ETO|3I|3LAY|3MA|3Q|3T|2S|3C|3G|3L|3S|2T|3EX|3H|2VIA|3O|2W|3S|3TH|2XEX|3G|3U|3W|2Y|3B|3CON|3N|3P|3S|3T|3U|3X|2ZZI|1BAR|3SE|2C|2ET|2IRB|2L|3K|2Q|2R|3V1|2T|2X|3V1|1C|2C|3M|2E|2H|3S|2I|2L|2M|2N|3T|2O|3IN|2R|2S|3P|2X|1D|2A|3TA|2C|2D|2EX|2F|2OG|4E|2T|2X|1EA|3CHY|3K|3R|4L|3S|2C|3L|2EL|3PA|4O|4S|2FI|2G|3S|2IPEI|2KC|3O|2L|2M|2NC|3DLE|3G|4YX|3IS|3TA|2OPLE|3S|2PC|3E|42|4AI|4D|4E|4F|4GA|4MO|4PI|4RA|4W|4X|3I|3PA|4ER|3S|2R|3A|3C|3I|3L|3P|3RY|3U|3X|2SA|2T|3F|3G|3H|3L|3N|3O|3S|3T|2USD|2X|1FI|3D|2L|2R|2T|2Y|1G|2ALA|2C|2EN|2F7T|2L|2N|2OLD|2ROK|2T|3S|2U|2X|1HA|3E|3LA|2B|3D|2C|3R|2I|3BA|2L|2M|2N|3X|2O|3NON|3ON|3RE|2R|2S|2T|3C|3R|2V|2X|1I|2AS|2B|2CA|3KLE|3O|2E|2F|2G|3E|4ON|3GY|3S|2KA|3O|2LOT|2N|3CHI|3E|3G|3K|4X|3MO|3O|3U|2O|2P|3A|3I|3L|3T|2RATE|3I|3L|2S|3T|2T|3CH|2VN|3X|2X|3EL|5V|2ZA|3ZA|1JM|1KB|2C|2D|2F|2G|2N|2OIN|2T|1LA|3AS|3C|4E|3I|3N|4ET|3T|4C|4O|3Y|4C|2B|3T|2C|3U|4C|2D|2E|3B|3O|3RF|3X|2F|2G|3R|2I|2M|3T|2NC|3X|2OT|2Q|2R|2S|3ARB|3B|3D|3PAD|3X|2T|3C|3X|4YZ|2U|3G|4CN|3RA|3S1|3TUS|2X|3Y|2Y|1MA|2E|3ER|2G|3T|2M|2NT|2ON|2PY|2TN|1NC|2D|3C|3R|2FT|2G|3N|2K|2L|2ODE|2T|2X|2Y|1OA|3I|2C|3C|3KET|3O|2D|3IUM|3O|2E|2G|3AI|2INTS|2K|3EM|4R|3O|3T|2L|3A|4R|3C|3I|4S|3K|4ER|3L|3NX|3S|3VEN|3X|3Y|4X|2M|2N|3D|3KE|3YO|3ZU|2O|3DL|3H|3L|4X|5T|4Z|3P|2P|3C|4AT|3E|3K|3O|2R|3A|3K|4E|3T|43|4AL|4O|4U|4X|2S|3EX|3I|3Q|3S|3T|4C|2T|3S|3TER|2U|2WELL|4R|3R|1P|2AD|3Y|2BLZ|2C|2I|3ZZA|2L|2M|2N|2OVR|2P|2R|2S|2T|2Y|1QT|1RA|3RE|2B|2C|3H|3L|3M|3Y|2DS|3X|2E|3D|3M|4E|4IA|3S|2FT|2G|2I|3A|3DE|3MAL|4E|3NT|5S|3SM|5A|3X|2L|2M|3X|2NT|2O|3B|3C|3D|3GE|3M|3OF|3P|4C|4S|3S|3T|4EO|4O|5N|3UD|3XI|2P|3S|3T|2Q|2S|2T|3C|3G|2V|3C|3S|2X|3Y|2Y|1S1|2B|2C|2D|2EUD|2F|2G|2I|3LOC|2K|2L|3IP|2M|2OL|2P|3S|2T|3AKE|3N|2UB|2WAP|2Y|3OP|1T|2A|3S|2C|2D|2ERIA|2F|2H|2I|2N|2O|3N|3Y|2P|2R|2T|2U|2X|1UFETH|3F|4IN|2GAI|3L|2LI|3SE|2MA|3BAA|3LX|3P|2N|3CH|3DIX|4U|3K|2PA|3S|2RA|3E|3R|3SE|2SD|3H|4I|3SY|2T|2X|1VFYBO|2P|2T|2U|1WAR|2H|2INGS|2ON|2R|2T|1X|2B|2C|2G|2I|2L|2P|2T|1YC|2E|2I|2LNT|3ON|2M|3E|2N|2P|2Q|2R|3AM|3K|3O|2T|3H|2USD|1ZM|2P|2T|0Q1S|12C|1A|2C|2NX|2RK|2SH|2U|1BAO|2C|2IT|2K|2T|2U|2X|2Z|1C|2H|2N|2O|2X|1DC|2ROP|2T|2X|1FI|1I|2E|2SWAP|1KC|2NTL|1LC|2INDO|1MALL|1NT|3R|3U|2X|1OBI|2M|2OB|2RA|3PO|1QBC|2Q|3F|1R|2DO|2K|2L|2P|2T|2X|1SLV|2P|2R|1TC|3ON|2F|2L|2O|2UM|2Z|1UA|3CK|3M|3NT|3RTZ|3SA|2B|3E|2ICK|3DD|3N|4T|3Z|2O|2ROZ|2SD|1VT|1WAN|3RK|2C|2LA|1XC|0R1|12R|134P|2FI|2T|14RE|1AB|3BIT|3I|2C|3A|3EFI|3ING|2D|3AR|3I|4O|3R|2FT|2GE|2I|3D|4ER|3F|3L|3N|4C|4I|3SE|3T|3ZER|2K|3E|3U|2M|3A|3EN|3P|2NKER|2P|3TOR|2RE|3I|2STA|2TING|4O|3S|2VE|4N|2WG|2Y|3S|2ZE|3OR|1B|2C|2D|3T|2IES|3F|3S|3T|2LS|3Z|2N|3B|2P|2R|2T|3C|2UNNY|2W|2X|3S|2Y|1C|220|2C|3C|2G|2H|2KT|2M|2N|2OIN|2T|2X|1D|2C|2D|2EX|2F|2GX|2N|3T|2O|2PX|2R|2S|2T|2X|1EA|3CH|3L|4M|5S|4Y|3P|4ER|3U|2BL|3US|2C|3OM|2D|3C|4O|3DIT|3FEG|3I|3LC|3N|3O|2E|3F|3LT|2F|3I|3UND|2GENT|2HAB|2I|3GN|2KT|42|2L|3AY|3I|3VT|2M|3CO|3E|3IT|2N|3A|3BTC|3C|3E|4C|3Q|3S|3T|4BE|2P|3O|3UX|2Q|2S|3T|2T|3A|4IL|3H|42|3IRE|2U|3NI|2V|33L|3A|3E|3O|4AI|4N|3U|3V|2W|2X|1F|2CTR|2D|3B|2G|2I|2KJ|2L|2OX|2R|2T|2UEL|2X|1GC|2EN|2OLD|2P|2T|1HEA|2INO|2OC|2P|1IA|2B|3BIT|2C|3E|3H|3K|2DE|4MY|2F|33|3I|2GEL|2K|2L|2M|3BIT|2N|3G|4X|3IA|3U|2O|2P|3AX|3O|3T|4O|2SE|4P|3ITA|2TE|3O|3Z|2YA|2ZE|1JV|1KC|2I|2N|2R|2T|1LB|2C|2M|2OOP|2T|2X|2Y|1MATIC|2C|2ESH|2OB|2PL|2RK|2S|2T|2V|1NB|3W|2C|2D|3R|3X|2S|2T|3B|2X|1OAD|3R|2B|3ET|3IN|2C|3K|42|4ET|4I|4Y|3O|2DAI|2E|2G|2I|2K|3O|2LS|2ME|2ND|3IN|2O|3BEE|3K|3M|3ST|3T|4S|2S|3E|3N|3X|2T|3TY|2UND|3P|3SH|3TE|2VI|2W|3AN|2X|2Y|3A|4L|1PB|2C|2D|2G|2ILL|2K|2L|2M|2S|2T|3R|2UT|2ZX|1RB|2C|2T|1SC|2ETH|2F|2IN|2PN|2R|3V|2S3|2T|3K|2UN|2V|2WETH|1T2|2B|2C|2E|2H|2M|2T|1UBIT|3X|3Y|4EX|2C|2FF|2G|3Z|2LER|2NE|3Y|2P|3X|2SD|3H|3T|2UF|2X|1VC|2F|2LNG|3T|2M|2N|2O|2P|2R|2ST|2T|2X|1WA|3S|2D|2E|2N|2S|1XCG|2D|2O|2T|1YC|3N|2IU|2O|3MA|3SHI|2Z|1ZR|0S2K|14F|18C|1ABAI|3LE|3R|2C1|2F|3E|4S|4T|4X|3LE|3TP|3UU|2I|3L|3TA|4O|2K|3AI|4TA|3E|2L|3D|3E|3LY|3MON|3T|2M|3A|3O|2N|3A|3D|4G|4Y|3I|3JI|3SHU|3TA|4OS|2O|2P|3E|3P|4C|2R|3CO|3OS|2S|2T|32|3A|3OX|4Z|3S|3T|3X|2UBER|3CE|3NA|2V3|3G|3M|1B|2A|3BE|2C|3C|2E|2F|2GO|2IO|2OX|2R|3T|2SC|2T|3C|1C|2A|3LE|3M|3NS|3P|4E|3R|4AB|3SH|3T|2C|3P|2DS|2FX|2H|3O|2IA|3X|2K|2L|3P|2M|2N|3R|3SOL|2O|3IN|3NE|3OBY|3R|4E|3T|4TY|2P|3T|2RAP|3EAM|3IBE|4V|3L|3M|3PT|3T|2S|3X|2T|3K|2Y|1D|2A|3I|3O|2C|3RV|2EX|2L|2N|2O|3G|4E|3PE|2P|2RN|2S|2T|2USD|2X|1EA|3L|4N|3M|3N|3T|2BA|2C|3O|4ND|3RT|3T|2ED|4S|4V|4X|3LE|3N|3R|2FA|2G|2I|3LOR|2KAI|2L|3F|3LC|2M|2N|3ATE|3C|3D|3NO|3SE|4I|4O|5R|3T|2ON|3R|3S|2PA|2Q|2R|3G|3O|3P|3SH|3V|4E|2SSIA|2TH|42|4ER|3S|2X|3Y|1FARM|2C|3P|2D|2F|2G|2I|3N|3T|2L|3OKI|2M|2P|2R|3C|2T|3MX|3Y|2U|3EL|3ND|2X|1G|2B|2DX|2E|2LY|2N|2O|3LD|2P|3T|2R|3OK|2T|1HA|3CK|3DE|3K|4E|3MAN|3N|4G|3RBI|4D|5S|4E|5S|4K|4PE|3UN|2B4|2D|3W|2E|3B|3ESH|3I|3LL|3N|3PE|3RA|3ZMU|2FL|3T|2G|2I|3A|3B|405|42|4AC|5I|5Y|4GF|4IC|4K|4L|4O|4TC|4U|3CO|3DO|3ELD|3FT|3H|3K|3L|4L|5D|3NA|4JA|4O|4T|3P|3T|3V|2K|2L|3D|2ND|2O|3E|3N|3P|4X|3RTY|3W|2PING|2R|3AP|3ED|4K|3OOM|2S|2UB|2VR|2X|1I|2B|3A|2C|2DE|3US|2ERRA|2FT|3U|2G|3N|4A|5T|3T|3U|2L|3K|4R|4T|3LY|3O|3V2|4A|4ER|2MP|4LE|2N|3E|3G|4LE|3S|4O|3X|2P|3HER|4ON|2R|2S|3A|3C|3HI|2U|3UU|2V|2X|2Z|3E|1JCX|1KB|2C|3S|2EB|3T|3Y|2I|3D|3LL|3N|4S|2L|3AY|2M|2PEPE|2R|3B|3IMP|3P|3T|3Y|2T|2U|3LL|2Y|3FT|3M|3RIM|3X|1LA|3M|2B|2C|3L|2EEP|3RF|52|3X|2G|2ICE|5C|3M|4E|3NG|4K|2M|2N|3D|3V2|2OKI|3RK|3TH|2P|3V1|2R|3R|3S|2S|3T|2T|2VX|2X|1MA|3C|3RS|4T|5B|5O|3T|2BR|2C|3W|2D|2ETA|2F|2G|2H|2I|3LE|5K|5Y|2L|3Y|2M|2OG|3KE|3L|4E|3N|3ON|2PF|3L|2R|3AT|3T|4R|2SR|2T|3F|3Y|2U|3DGE|1N|2ACK|3KES|3P|2B|2C|3T|2D|2E|3K|4E|3T|2FTS|2GLS|2IP|3TCH|2K|2L|2M|2N|2OB|3OP|5Y|3V|3W|2PC|3S|2RG|3K|2S|3T|3Y|2T|3R|3VT|2X|2Y|1O|2AI|3K|3R|2BA|3B|3ER|2C|3A|3C|4ER|3KS|3OLA|2DA|3O|2FI|2HOT|2IL|2J|2KU|2L|310|3A|4MA|5B|4PE|4R|5E|4V|3C|4EX|3E|4X|3ID|3KIT|3O|3PAD|3R|3S|4CC|3VE|3X|2M|3A|3M|2N|3AR|3G|3IC|5O|3NE|2ON|2P|2R|3A|2T|3A|2UL|4O|4S|3ND|3RCE|2V|3E|3I|2Y|1P|28DE|2A|3CE|3I|4N|3NK|3RKO|4TA|3T|3Y|2C|3IE|3T|2D|3R|3X|2E|3C|3EDY|3LL|3ND|5C|3PE|3X|2F|3C|2G|3BB|2H|3ERE|3R|4I|3TX|3YNX|2I|3CE|3DER|5Y|3KE|3N|3RIT|3Z|2K|3L|3TR|2LA|2M|2N|3D|2O|3K|3L|3NGE|3ODY|4L|3RE|4T|3TS|3X|2RING|3KL|3T|4S|4Z|2S|2T|2UME|3RDO|4S|2WN|2X|3C|2Y|3RO|1QAT|2G|2L|2R|2T|3S|2UA|4D|4WK|3ID|52|1RBP|2C|3OIN|3X|2EUR|2G|2K|2LTY|2M|2N|3T|2P|2T|2WD|2X|1S|2B|2C|2D|2E|2G|3T|2H|3IB|4P|2LX|2S|2T|3C|2U|2V|2WP|2X|1T|2A|3BLZ|3C|4K|5S|4S|3K|4E|3LIN|3MP|3PT|3R|4C|4K|4L|5Y|4P|4S|5H|4T|5A|3SH|3T|4E|5R|4S|3X|2BU|2C|3N|2D|3YDX|2EAK|3EM|5D|4P|3LLA|3MX|3N|3P|4G|4H|4R|4S|3TH|3WIE|3X|2F|3X|2G|2HR|2I|3C|3K|3MA|4E|3NG|4J|2JUNO|2K|3BNB|3K|2LE|2MAN|3X|2ND|3EAR|2O|3GE|3N|4E|4K|5S|3P|3R|4E|4J|4M|4Y|3S|4MO|3X|2P|3L|3T|2Q|2R|3AKS|4X|4Y|3D|4Y|3EAM|3I|4P|3K|3M|3NGR|3ONG|3P|3S|3X|2S|3OL|3R|3W|2T|2U|3ART|3D|3SDT|2V|2X|2YL|4E|2Z|3EN|3U|1U|2BAWU|3S|2CR|2DO|2GAR|2I|3A|3P|2KU|2M|3MER|3O|2N|3C|3DAE|3EX|3I|3NY|3OLD|3V1|2P|3E|4R|5C|2R|3E|3F|3V|2SD|4E|3HI|2TEKU|4R|2ZUME|1VD|2N|2PN|2S|2T|2X|2Y|1WA|3CH|3G|3MP|3P|4P|4Z|3RM|5M|3SH|3Y|2C|3H|2D|3AO|2EAT|3EP|4T|3TH|2FL|3TC|2G|2H|2IFT|3M|3N|4G|3RL|5X|3SE|3TCH|2M|2OLE|3P|3T|2P|3R|4S|2RV|2T|3H|3S|2U|2YFTT|1X|2C|2DT|2M|2P|2S|2UT|1YA|2BC|3L|3TC|2C|2L|3O|2M|2N|3C|4C|4O|3LEV|3R|3TH|3X|2POOL|2S|1ZCB|0T23|199|1AAS|2B|3OO|2C|2D|2F|2GR|2I|3L|3YO|2J|2K|3I|2LAO|3IS|3K|2MA|2N|3G|4O|3K|2O|3NU|2P|3C|3T|2RA|4L|3I|3OT|3P|2S|3H|3TE|2T|3A|3E|3SU|2U|3C|3M|3R|2VA|2X|1BAC|3NK|3R|2B|2C|3C|3X|2E|2IS|2L|2T|3C|2X|1CANDY|3P|3T|2C|2G2|3C|2H|3AIN|3B|3TRX|2NH|3X|2O|2P|2R|2S|2T|2X|2Y|1D|2E|2FB|3Y|2P|2ROP|2S|2X|1EA|3M|2C|3AR|3H|3RA|2D|3DY|2E|3R|2K|2L|3E|3L|4ER|3O|4S|2M|3CO|3P|2N|3D|4IE|3ET|3FI|3NET|3SHI|3T|2P|2R|3A|4R|3N|3RA|3Z|2S|3LA|5I|3T|4A|2T|3HER|4YS|3RA|3U|1FBX|2C|2I|2L|3OW|2S|2T|2UEL|1GAME|2C|3C|2PT|2T|1H|2ALES|2C|2E|39|3CA|3DAO|3MIS|3N|3O|4S|3TA|3X|2G|2ING|2L|2N|3X|2O|3L|3R|2P|2R|3T|3Y|2S|2T|2UG|2X|1I|2A|3NHE|2C|2DAL|3E|2E|2FI|2G|3ER|5C|3RES|2IM|2K|3I|2M|3E|3I|2N|3C|3KU|3U|3Y|2OX|2P|3INU|3S|4Y|2T|3A|4N|5O|5X|3C|3I|3TY|2USD|2X|1KA|2B|2C|2G|2ING|4U|2MN|2N|2O|2P|2R|2S|3T|2T|2X|2Y|1LC|2M|2N|2OS|2P|2W|1ME|3D|2N|3T|2ON|2RW|2T|3G|1N|2B|2C|2DC|2GBL|2S|3R|2T|1OA|3D|2B|2C|2DAY|2K|3A|4U|3C|3E|4N|3KI|3O|3U|2L|2M|3B|3I|3OE|3S|2N|3E|3I|4C|3NEL|3S|3UP|2OB|3LS|3N|4F|2PC|3G|3IA|3N|2R|3E|3G|3I|4I|3N|2S|3A|3C|3DIS|3HE|4I|2T|3EM|3M|3O|2WER|3N|2X|2YBOX|2Z|1P|2AD|3Y|2C|3ASH|2G|2T|2V|2Y|1QRT|1R3|2A|3C|4E|4N|3DE|5X|3ID|3K|3NQ|4S|3T|3VA|3XIA|4X|2B|3T|3V1|2C|3B|3L|3T|2DC|3L|3S|3T|2EAT|3E|4B|3MP|3T|2G|3I|2I|3A|4S|3BE|4L|3CK|3G|3NI|3O|3PAD|3VIA|3X|2K|2L|2MX|2NDZ|2OLL|3P|3SS|3VE|3Y|2P|2R|2SCT|3T|2TL|3T|2U|3CE|3E|3F|3MP|3ST|3TH|2V|3C|3L|2WP|2X|3C|3WIN|2YB|3C|3X|1SA|2C|3T|2D|2E|2F|2G|2HARE|3P|2L|2N|2R|2UGT|3KA|2X|1T|2C|2K|2M|2N|2T|2U|2V|1UBE|2CKER|2DA|2F|2LIP|2NA|3E|2P|2R|3BO|5S|3T|2S|3D|2T|2ZLA|1VK|2NT|2RS|1W|2C|2D|2EE|4TY|3LVE|3P|2IN|3ST|2LV|2OGE|2T|1X|220|2A|3G|3U|2BIT|2G|2L|2T|1YBG|4S|2C|3OON|2PE|2RANT|3ION|2T|1ZC|2KI|0U8D|1AEC|2T|1BA|2C|2DN|2EX|2I|3Q|2Q|2T|3C|2X|3N|3S|3T|1C|2A|3P|3SH|2G|2H|2JL|2N|2O|3IN|3N|3RE|2T|2X|1DO|3O|2T|1EC|2DC|2NC|2T|3L|1FARM|2C|2FYI|2I|2O|3C|2R|2T|1GAS|2C|2OLD|2T|1HP|1IM|2N|2P|2S|1JENNY|1KG|1LT|3C|3GG|3IMA|3RA|2X|1M|2A|3D|3MI|2B|3R|2C|2I|2K|2MA|2O|2T|2X|2Y|1NAT|2B|3NK|2C|3L|3X|2D|3B|3EAD|3G|3X|2F|3I|2I|3BOT|3C|4E|3DX|3FY|3M|3Q|4UE|3T|4ED|4S|4Y|3VRS|3X|2M|3D|2N|2O|3B|2P|2Q|3T|2R|3C|2S|2W|1OP|2S|1P|2C|3G|3O2|4IN|2DOG|2EUR|2I|2LOAD|2O|2P|2R|3O|2S|2TOS|2UNK|3SD|2X|1QC|1R|2AC|3LS|2FA|2O|2QA|2S|2US|2X|1SAT|2C|3C|3OIN|2DA|4P|3B|4C|3C|3D|3E|4BT|4X|3FL|3G|4LO|3H|3I|3J|3K|3M|3N|3O|3P|3Q|3R|3S|4B|3T|4V|4Z|3U|3V|3X|3Y|3Z|2E|2G|2HARK|3I|4BA|2K|2N|3BT|3OTA|2P|3LUS|2T|3C|3X|2V|2X|1T|2BAI|2C|2G|2H|2I|3L|2K|2NP|2T|2U|2X|1USD|2U|1VT|1W3S|2U|1X|2OS|2P|1ZX|0VAAVE|2B|2DA|3ER|2I|3OT|2L|3AS|3I|4D|3OR|3UE|2N|3A|3CAT|3RY|3T|3Y|2PE|3OR|2RA|3IUS|3K|2ULT|1BCH|2ETH|2G|2IT|2K|2NB|3T|2SC|3WAP|2T|3C|1C|2AKE|2F|2G|2HF|2K|2NT|2ORE|2X|1DG|2L|2O|3GE|3T|2R|2V|2X|2Z|1EC|32|2E|3D|3N|2G|3A|4S|3E|2IL|2KTOR|2LA|3O|4D|4X|2MP|2N|3A|3OM|3T|4I|3US|2O|2R|3A|3I|4C|3SA|4E|3TEX|3VE|2ST|2T|3H|3ME|3TER|2UR|2X|3T|1FIL|2OX|2T|1GO|2X|1HC|1I|2A|2B|3E|3LO|2C|3A|3EX|2D|3A|3T|3Y|4A|4X|3Z|2EW|2G|2K|3KY|2M|2N|3CI|3U|2OR|2P|3ER|3S|2RAL|3ES|2S|3IO|5N|3R|2T|3A|4E|4L|3E|3RA|3Y|2U|2VID|3O|2X|2Z|1KNF|1LC|2S|2T|3C|3X|3Y|2UNA|2X|3PAD|1MATIC|2C|2E|2INT|2PX|2S|2T|1NDC|3T|2ES|2LNK|2M|2N|2O|2T|3W|2X|3AU|3LU|2Y|1OCARE|3O|2DKA|2ISE|2L|3LAR|3R|3T|4A|4V1|52|4Z|2NE|2OT|2T|2W|2X|3EL|2Y|3A|1P|2AD|2K|2ND|2P|2R|3C|1R|2A|2C|2GW|2H|2L|2M|2N|2O|3OM|2P|2S|3C|3E|3W|2T|3X|3Y|2X|1SC|2D|2G|2HARE|2L|2O|2P|2TA|2UI|2X|2YS|1T|2C|2G|2HO|2L|2M|2N|2OS|2RO|3X|2S|2U|3SD|2X|2Y|1UC|2LC|2NI|2ZZ|1V|2I|2S|1X|2L|2RP|2T|2V|1YBE|2FI|2NC|1ZT|0W1|22|12E|13C|2M|2S|2W|18BIT|1AB|3I|2CO|2D|3A|2G|3E|3G|3MI|5T|3ON|2I|3F|4U|3T|2L|3K|3LET|4Y|3V|2M|3PL|2N|3A|3D|3NA|2R|3P|4ED|3S|2S|3ABI|3H|3SIE|3TR|2TER|2VES|2XE|3L|3P|2Y|1BB|3C|2CH|2ESC|3T|4H|2IND|2N|3B|2OND|4ES|2S|2T|3C|2X|1CA|3NTO|2C|3X|2ELL|4O|2FG|2G|2OIN|3RE|2S|3OV|2T|2USD|1DC|2OG|4E|3T|2R|2X|1E|2ALTH|3PON|3R|2B|33|34|35|3AI|3C|3D|2C|3O|2D|2ETH|2FI|2GEN|3LD|2LA|3D|3L|3T|3UPS|2MIX|2N|2OS|2ST|2T|3H|4V1|4W|2VE|2WE|2X|3O|1FAI|2IL|2LOW|2O|2T|2USE|2X|1GC|2HOST|2L|2O|2P|2R|3T|2T|1HALE|5S|2BAR|2EAT|3E|4L|3N|3X|2IRL|3TE|2L|2O|3REN|2T|2X|1IB|2C|3C|2F|3I|3S|4A|2GO|2KEN|3I|2LC|3D|4C|2N|3E|3G|4S|3K|3N|3R|4Y|3T|4ER|2OTX|2S|3C|3E|3H|3TA|2T|3CH|2X|1JEWEL|2XN|1KAVA|2C|2D|1LD|2F|2ITI|2K|3N|2O|2UNA|4C|2XT|1MATIC|2B|2C|2EMO|2F|2NT|2OXY|2T|2W|2X|3WOM|1NCG|2D|3R|2EAR|3ON|3T|2K|2RZ|2T|2XM|2YC|2Z|1OA|2D|2FM|2ID|2J|3AK|52|2KT|2L|3F|4OF|4Y|2M|3B|4AT|3E|4N|3I|2N|3DER|3E|2O|3D|3F|4Y|3L|3NK|3O|4OO|3P|2P|2R|3K|3LD|3M|3X|2W|3S|2ZX|1PC|2E|2I|2LS|2OKT|2P|2R|1QT|1RC|2K|2LD|2ONG|3SE|2T|2X|2Z|1SB|3ABY|3S|2CRT|2DOGE|2G|2HIB|2I|2M|2PP|2TETH|3OR|3R|2X|1T|2AO|2C|2F|3T|3UEL|2G|2K|2L|2N|2ON|2T|2WOOL|1UST|1WB|2D|3OGE|2EMIX|2F|2Y|1X|2DAI|2T|3Z|1YNN|2S|1ZEC|3NIQ|2M|2RD|0X2|2Y2|142|17C|2DAO|2R|18X|1ACT|2H|2I|2MP|2NK|2P|2R|2S|2T|2UC|3R|3T|2VA|2YA|1BASE|2B|2C|2E|2G|2I|2L|2N|2OND|3T|2P|2S|2T|3C|3S|2X|2Y|1C|2AD|3L|3SH|4TR|2E|3L|3PT|2F|3X|2G|2H|3F|2I|2LR|2M|2N|2O|3M|2P|3O|2R|3E|3X|2T|2UR|2V|2XT|1D|2AG|3I|3O|3TA|2B|2C|3E|2EF2|4I|3N|2G|2N|3A|2OGE|3T|2P|2Q|1EC|2D|2L|3S|2M|2N|3D|3IX|3O|2P|2RS|2S|2T|3A|3H|1FC|2I|3T|2LOKI|2T|3C|2UND|2YI|1G|2B|2C|2EM|2LI|2OLD|2PT|2R|2T|1HI|2T|2V|1I|2ASI|2D|3O|3R|2L|2N|3U|2O|3S|3T|2V|1JEWEL|2O|1KI|1LA|3B|2B|2C|2D|2M|2N|2Q|2R|2T|1MARK|3S|2C|3C|2ETA|2G|2N|2O|3N|2P|2R|3G|2S|2T|2V|2X|2Y|1NA|2B|2C|2FT|2G|2K|2L|2N|2O|2S|2T|2V|2X|1ODEX|2LO|2R|2T|2V|2X|1P|2A|3T|3Y|2B|2C|2D|2E|3T|2H|3X|2L|3A|3L|2M|2N|3D|3ET|2O|3KE|2R|3ESS|3O|4T|3T|2S|3T|2T|3P|3X|2X|2Y|1QC|2N|2R|2UOK|1RA|3I|3Y|2C|2D|2E|2ISE|2L|3M|2P|32|40|3C|3H|2T|2UN|4E|1SAUCE|2C|2D|2EED|2GD|2H|3IB|2I|2LR|2N|2P|3C|3EC|3T|2R|2T|3AR|3C|2USHI|1T|23|2AG|3L|2C|2K|2M|2O|2P|2R|3A|3EME|2TB20|2USD|2X|2Z|1UC|2I|2N|2P|3S|1VC|2E|2G|2P|2R|2S|1WC|2G|2IN|2P|2T|1X|2A|2X|1Y|2M|2O|2Z|0Y2K|1AC|3HT|2E|2G|2K|3S|3U|2M|3A|3V1|42|2OYAO|2P|2RL|2W|2XIS|2Y|1BC|2O|1CC|2E|2O|2T|1DF|2OGE|2R|1EC|2E|3D|2FI|2L|2ON|2S|3P|2TI|3U|1FARM|2BETA|3T|2DAI|2F|3C|3I|4I|2I|3E|3I|4I|3VE|2L|2O|2PRO|2TE|2V|2X|1GG|1IELD|5X|2KES|2N|3BI|1LC|2D|3Y|1MC|2S|1O|2BASE|2C|3O|2D|2LO|2OSHI|2P|2SHI|2TD|3O|2U|3C|3RAI|2VI|2YOW|1PIE|1SAFE|2EC|2R|1TA|2N|1U|2ANG|2CJ|3T|2DI|2GE|2KI|3KY|2M|3MI|4Y|2P|2RI|2SE|2ZU|1VS|1YAVAX|2E|2FI|0Z3|1ABAKU|2FI|2I|3F|2M|3ZAM|2NO|2P|2RP|3X|2SH|2T|1B|2C|2IT|2U|1CC|31|2G|2HN|2L|2N|2O|3N|3R|2R|2ULT|2X|1DEX|2R|1EC|3D|2D|3X|2E|2FI|3U|2IT|2L|3IX|2N|3C|3F|3I|4Q|4TH|2ON|2P|3H|2R|3O|4B|4EX|2S|3T|2T|32|3A|3RIX|2UM|3S|2XI|1F|2L|2M|1GD|2EM|1IG|2K|2L|2NC|3U|2P|3T|2RVE|2X|2ZY|1JLT|1K|2BOB|2DOGE|2F|2HIVE|2ID|2LAB|2ML|2P|3AD|3EPE|2S|3HIB|3P|2T|2Z|1LA|2DA|2K|2OT|2Q|2W|1MBE|2N|2T|1ND|2E|2N|2T|2X|2Y|2Z|1OA|2C|2DI|2E|2I|2NE|3O|3X|2O|3M|4ER|3N|3T|2RA|3O|3T|1P|2AE|3Y|2C|2R|3O|2T|3C|1RC|2O|2X|1SC|2E|1T|2C|2G|2X|1UC|2KI|2M|2NA|2R|3R|2SD|2T|2ZALU|3UAI|1VC|1WAP|1XC|2T|1YD|2N|2R|3O|2TARA|1Z|2C|2Z","sep":"|"}]},{"id":"fr-oil-prices-wti-daily-2229a9","columns":["date","price"],"n":9512,"cols":[{"f":"01986-01-02|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|62-03|94|95|96|97|811|92|93|94|98|99|820|91|94|95|96|97|98|63-03|95|96|97|810|91|92|93|94|97|99|820|91|94|95|96|97|831|64-01|92|93|94|97|98|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|96|99|820|91|92|93|97|98|99|66-02|93|94|95|96|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-02|93|97|98|99|810|94|95|96|97|98|821|92|93|94|95|98|99|831|68-01|94|95|96|97|811|92|93|95|98|99|820|91|95|96|97|98|99|69-02|93|94|95|99|810|91|95|96|97|98|99|822|93|94|99|830|510-01|92|93|96|97|98|99|810|94|95|96|97|820|92|93|94|97|98|830|91|61-03|94|95|97|810|91|92|93|94|98|99|820|91|94|95|96|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|830|37-01-02|95|96|97|98|99|812|93|94|95|96|99|820|91|92|96|97|98|99|830|62-02|93|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|63-03|94|95|99|810|91|92|93|96|97|98|99|820|93|95|96|97|830|91|64-01|92|93|96|97|98|99|810|93|94|95|96|820|91|92|93|94|98|99|830|65-01|94|95|96|97|98|811|92|93|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|98|99|810|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|93|96|97|98|99|810|93|95|96|97|820|91|92|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|97|830|62-01|92|94|97|98|99|814|95|96|97|98|821|92|94|98|99|830|91|38-01-04|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|63-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-04|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|66-01|92|93|96|97|98|99|810|94|95|96|97|820|91|92|93|94|98|99|830|67-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|39-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|99|813|94|95|96|97|820|91|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|91|64-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|65-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|69-01|94|95|96|98|811|92|93|94|98|99|821|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|98|99|290-01-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|93|94|95|96|99|810|91|92|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-03|94|95|96|97|810|91|92|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|97|98|831|31-01-02|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|97|820|91|92|93|94|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|821|94|95|96|97|98|67-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-02|93|94|95|96|99|810|91|93|96|97|98|99|820|93|94|96|97|830|91|32-01-02|96|98|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|810|94|95|96|820|91|92|93|94|98|99|830|65-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|93|96|97|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|33-01-04|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-02|94|95|98|99|810|91|92|96|97|98|99|822|93|94|96|63-01|92|93|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|92|95|96|97|98|812|93|94|95|96|99|820|91|92|93|96|97|830|65-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|67-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|69-01|92|93|97|98|99|810|93|94|95|96|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|62-01|92|93|96|97|99|810|93|94|96|821|92|93|97|98|99|830|34-01-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|98|831|62-01|92|97|98|99|810|91|94|95|96|97|98|822|94|98|63-01|93|94|97|98|99|810|91|94|96|97|98|821|92|94|95|99|64-04|95|97|812|93|820|91|92|95|96|98|65-03|95|96|810|91|92|93|97|98|99|820|93|94|95|96|97|66-01|96|97|98|99|810|93|94|95|96|97|820|91|93|94|97|98|99|830|67-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|69-01|92|96|97|98|99|812|94|95|96|99|821|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|93|94|97|99|821|94|95|96|98|831|61-01|92|93|94|97|98|99|810|91|95|96|97|98|821|92|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|821|92|97|98|830|35-01-03|94|95|810|92|96|97|98|820|93|94|95|96|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|97|98|63-01|93|96|97|99|810|93|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|97|810|91|93|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|811|95|96|97|98|99|823|94|95|96|66-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|95|96|97|810|91|92|94|97|98|99|820|94|95|96|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|821|92|93|94|95|98|99|830|91|69-01|96|97|98|811|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|95|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|61-01|92|93|96|97|98|99|810|93|95|96|97|820|91|92|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|97|98|99|36-01-02|93|94|95|98|99|810|91|95|96|97|98|99|822|93|95|96|99|830|62-01|92|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|99|63-04|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|64-02|93|94|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|95|97|98|67-01|92|93|95|99|810|91|92|95|96|97|98|99|822|94|95|68-01|92|95|97|99|813|94|95|99|822|93|96|97|98|99|69-04|95|96|99|812|93|97|98|99|820|93|94|95|97|830|510-01|92|93|97|810|94|96|97|823|95|98|61-01|95|96|811|92|93|94|99|820|92|95|96|97|62-02|93|95|811|92|93|97|98|99|820|93|96|830|91|37-01-03|96|97|98|99|810|93|94|95|96|97|821|92|93|94|98|830|91|62-03|94|95|97|810|91|98|99|824|95|96|98|63-03|94|95|96|97|810|91|92|93|94|98|820|94|95|96|97|831|64-01|92|93|94|98|810|91|94|95|96|821|92|93|94|95|98|99|830|65-02|96|97|99|812|93|94|96|99|820|91|93|830|66-03|95|96|810|91|93|96|97|98|99|820|93|94|95|96|97|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|93|94|95|98|99|830|68-01|95|96|97|98|811|92|93|94|95|98|821|92|95|96|97|98|99|69-02|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|510-03|96|97|98|99|813|94|96|97|820|91|92|93|94|97|99|830|61-03|94|95|810|91|93|94|97|98|820|91|94|95|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|38-01-06|97|98|99|812|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|93|97|98|99|823|94|95|96|97|63-02|93|94|95|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|97|98|811|92|93|94|95|99|820|91|92|96|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|95|96|97|820|91|92|93|94|97|830|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|98|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|95|96|99|810|91|92|93|96|97|820|93|94|95|830|62-01|92|94|97|99|810|91|94|95|96|97|98|821|92|94|98|99|831|39-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|810|91|92|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|94|64-05|96|97|98|99|815|96|99|821|93|96|97|98|99|830|65-05|96|810|92|93|94|99|824|96|66-01|93|97|98|99|810|91|94|95|96|97|98|823|830|67-02|813|96|821|92|99|830|68-02|93|94|95|812|93|97|98|99|823|94|95|69-01|815|97|820|91|92|93|99|830|510-01|98|811|94|95|99|821|96|99|61-02|94|95|98|99|810|92|95|96|97|98|99|822|93|94|96|99|830|62-01|92|93|96|97|98|99|810|93|95|96|97|820|92|97|98|99|830|02000-01-04|95|96|97|810|91|92|94|98|99|820|91|94|95|97|98|831|62-01|92|93|94|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|830|64-04|96|97|810|91|92|93|94|97|98|99|820|94|95|96|97|98|65-01|92|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|66-01|92|95|96|97|98|99|812|93|95|96|99|820|91|92|93|96|97|98|99|830|67-06|97|810|92|93|97|98|99|820|91|95|97|98|68-01|92|93|94|97|98|99|810|91|94|95|97|98|821|92|93|94|95|98|99|830|91|69-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|98|99|510-03|94|96|99|811|93|96|97|98|820|94|95|96|97|831|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|97|98|99|830|62-01|94|95|96|97|98|811|92|94|95|98|99|820|91|97|98|99|31-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-03|94|95|96|99|810|91|92|96|97|98|99|823|94|95|97|830|65-01|92|93|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-04|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|98|820|93|94|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|94|95|97|98|510-01|92|93|94|95|99|811|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|98|99|812|93|95|96|99|821|96|97|98|830|62-03|94|95|96|97|810|91|93|97|98|99|820|91|96|97|98|831|32-01-02|94|97|99|810|91|95|96|97|98|822|93|94|95|99|830|91|62-01|96|97|98|811|92|93|94|95|99|820|91|92|95|97|98|63-01|95|97|98|811|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|830|91|66-03|94|95|97|810|91|92|93|94|97|821|95|96|97|98|67-01|92|93|98|99|810|91|92|95|96|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|94|95|98|99|820|91|92|95|96|97|62-02|93|94|95|96|810|91|92|93|96|97|98|99|823|94|96|97|830|91|33-01-02|93|96|97|98|99|810|93|95|96|97|821|92|93|94|97|99|831|62-04|95|97|810|91|93|98|820|91|94|96|98|63-05|96|97|811|92|99|821|94|95|831|64-01|98|810|95|96|97|823|94|95|99|65-01|98|813|96|820|91|92|98|99|66-06|99|810|97|99|820|93|94|95|96|830|67-01|97|810|95|96|97|821|93|94|95|98|99|68-04|96|97|98|811|93|95|99|821|92|95|96|99|69-02|95|98|810|91|92|96|97|823|94|95|99|510-01|99|810|93|96|822|93|94|98|99|831|61-07|810|91|94|821|94|95|96|62-03|94|99|810|91|92|96|99|822|93|94|99|830|34-01-06|814|95|821|92|93|96|98|62-02|93|94|95|96|99|813|98|820|93|94|97|63-02|95|98|811|92|95|97|98|822|93|94|95|830|64-05|98|814|95|820|91|92|93|96|97|99|65-05|96|97|810|91|94|97|98|821|94|95|96|97|98|66-01|92|93|97|98|99|810|94|95|96|97|821|92|93|94|99|830|67-01|92|96|97|98|812|93|94|96|99|820|91|92|93|96|98|99|830|68-03|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|830|91|69-01|92|97|99|813|94|95|96|820|92|93|94|97|98|99|830|510-04|95|96|97|98|811|92|93|95|98|99|821|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|35-01-03|94|95|96|97|810|91|93|94|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|95|96|98|823|94|95|63-01|92|93|94|97|98|99|810|91|94|97|98|821|92|93|98|99|830|91|64-05|96|97|98|812|93|94|98|820|91|92|95|96|97|98|99|65-02|93|94|95|99|810|91|92|96|98|99|823|94|95|96|97|831|66-01|92|96|97|98|99|813|94|95|96|97|822|93|94|97|98|99|830|67-01|95|96|97|811|92|93|94|98|99|820|91|92|96|97|98|68-01|92|93|94|95|98|99|810|91|95|96|97|98|822|93|94|95|96|99|831|69-01|96|97|98|812|93|94|95|96|99|821|92|93|96|97|98|830|510-03|94|96|97|811|92|93|97|98|99|824|95|96|97|98|831|61-01|93|94|97|98|99|811|94|96|97|98|821|92|93|99|830|62-01|92|96|99|812|93|94|95|96|99|820|91|93|98|99|36-01-03|94|95|99|810|91|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|821|92|93|94|98|63-01|96|97|98|99|810|93|95|96|97|820|91|92|93|94|97|98|99|830|64-03|94|95|96|97|810|91|92|97|98|99|821|94|95|96|97|98|65-01|92|93|95|98|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|98|99|830|67-05|96|97|810|91|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|830|91|69-01|95|96|97|98|811|92|93|94|95|99|821|92|95|96|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|93|96|97|99|810|93|95|96|97|820|91|92|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|37-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|830|91|62-01|92|95|96|97|98|99|812|93|95|96|820|91|92|93|96|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|93|94|95|99|810|91|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|97|98|831|38-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|39-01-02|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|210-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|65-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|67-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|69-01|92|93|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|91|31-01-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|64-01|94|95|96|97|811|93|95|98|825|96|97|98|65-02|93|810|91|97|98|823|831|66-01|93|98|810|93|821|93|98|830|67-01|97|98|814|95|98|99|820|91|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|32-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|93|94|95|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|97|98|831|33-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|99|62-02|93|94|95|96|99|811|92|93|96|97|98|99|820|93|94|96|97|830|91|34-01-02|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|95|96|97|820|91|92|93|94|98|99|830|91|61-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|98|62-01|92|94|95|98|99|810|91|92|95|96|97|98|99|822|93|96|99|830|91|35-01-02|95|96|97|99|812|93|94|95|96|820|91|93|830|62-03|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|36-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|66-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|67-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|37-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|97|810|91|92|93|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-05|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|38-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|64-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|96|97|98|39-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|812|93|94|95|98|99|820|91|92|95|96|97|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|96|97|830|91|220-01-02|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|31-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|65-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|67-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|69-01|92|93|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|91|32-01-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|66-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|67-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|33-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|67-03|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|34-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|820|91|94|95|96|97|98|67-01|92|93|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|812|93|94|95|98|99|820|91|92|95|96|97|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|96|97|830|91|35-01-02|93|96|97|98|810|93|94|95|96|97|821|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|94|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|92|93|94|97|98|99|820|91|94|95|96|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|36-01-02|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99","sep":"|"},{"s":"25.56|26|26.53|25.85|25.87|26.03|25.65|25.08|24.97|25.18|23.98|23.63|21.33|20.61|20.25|19.93|19.45|20.87|19.45|19.61|19.58|17.42|15.58|16.28|16.6|17.7|16.28|15.74|16.43|16.03|14.7|15.08|14.13|13.63|14.68|14.68|14.62|14.05|13.23|11.98|12.03|13.13|12.24|12.94|13.23|14.05|12.6|12.55|13.28|13.25|12.75|13.95|12.2|12.43|12.03|11.35|10.25|11.13|11.35|11.7|12.75|14.39|12.83|13.45|13.63|12.94|12.72|11.5|11.75|11.88|12.48|13.13|13.7|13.65|14.23|13.34|13.63|13.38|13.8|14.65|14.32|14.43|15.13|15.7|15.83|15.75|15.65|15.53|16.08|17.13|16.18|15.53|16.04|16.95|15.1|14.65|14.5|13.8|13.35|13.15|13.21|12.73|12.38|13.52|13.69|13.83|13.65|13.65|13.62|13.73|14.44|14.05|13.98|13.23|13.14|13.38|12.8|12.04|11.7|11.18|11.19|11|11.13|11.23|11.85|12.68|12.3|12.8|13.07|10.88|10.83|10.95|10.83|11.09|11.63|11.23|11.56|14|14.35|14.8|15.18|14.92|15.5|15.28|15.83|15.58|14.98|15.23|15.23|15.48|15.78|15.83|15.83|15.93|16.43|16.03|16.18|15.63|15|14.9|15.05|14.31|13.8|14.03|14.55|14.47|13.94|14.3|14.55|14.93|14.7|15.23|15.38|14.86|14.83|15.6|15.35|15.05|14.98|14.55|14.83|14.53|14.85|15.17|14.85|14.88|14.93|14.4|14.18|15.08|15.25|14.7|15.05|14.93|15.15|15.3|15.39|15.33|15.55|15.68|15.65|15.52|15.1|15.13|14.98|15.05|15|15|15.29|15.22|15.13|15.2|15.14|15.01|14.93|15.12|15.49|16.13|16.38|16.11|15.83|16.28|16.55|16.95|16.93|17.26|17.73|18.13|17.98|18.21|18.28|18.63|18.78|19|18.86|19.13|19.09|19.13|18.7|18.73|18.6|18.76|18.63|18.48|18.56|18.68|18.73|18.59|18.38|18.56|18.44|18.37|18.43|18.03|18.05|17.83|17.78|17.44|17.48|17.83|17.15|16.75|16.43|16.98|16.45|17.4|17.4|18|18.13|18.27|18.33|18.42|18.39|18.61|18.94|18.75|18.61|18.7|18.6|18.48|18.63|18.65|18.67|18.82|18.78|18.9|18.68|18.71|18.69|18.68|18.64|18.26|18.07|18.09|18.46|18.58|18.66|18.97|19.03|19.03|19.01|18.73|18.66|18.76|18.84|18.93|19.18|19.22|19.08|19.28|19.43|19.37|19.39|19.84|19.91|19.97|19.75|19.95|19.68|19.35|19.38|19.28|19.36|19.55|19.7|19.87|19.75|19.94|19.84|19.83|19.93|20.07|20.27|20.41|20.5|20.65|20.49|19.95|20.13|20.15|20.34|20.38|20.22|20.47|20.61|20.92|20.76|20.94|21.32|21.34|21.38|22.23|22.44|22.44|22.23|21.75|21.73|20.58|20.5|21.35|21.49|21.47|21.43|22.21|21.82|21.37|21.17|21.01|20.7|21.07|20.96|20.76|20.53|19.85|19.84|19.71|19.47|19.2|19.18|19.3|19.49|19.69|19.44|19.76|19.61|19.62|19.48|19.34|19.34|18.99|19.43|19.72|19.42|19.64|19.66|19.71|19.58|19.58|19.77|19.35|19.66|19.61|19.47|19.48|19.58|19.62|19.62|19.88|19.81|19.33|19.68|19.77|19.67|19.67|19.66|19.79|19.77|20.23|19.79|19.79|19.93|20.19|20.18|20|20.15|20.1|19.93|19.64|19.39|19.09|19.02|18.73|18.66|18.98|18.92|18.93|18.89|18.69|18.28|18.62|18.55|18.87|19.31|18.73|18.63|18.63|18.52|18.44|18.59|18.68|18.3|18.06|18.53|17.47|16.75|15.97|15.97|15.57|15.12|16.6|16.54|16.46|16.95|16.97|16.74|17.77|17.89|17.73|17.3|17.33|16.63|16.76|16.56|17.1|16.92|17.28|17.3|17.2|17.21|16.99|17.11|16.96|16.64|16.94|16.97|16.83|16.92|17.12|17.17|17.34|17.7|17.38|17.12|17.17|16.84|16.84|16.8|16.62|16.5|16.73|16.64|16.8|16.58|15.86|15.77|15.98|15.57|15.69|15.35|15.63|15.58|15.52|16.04|16.2|15.57|15.81|16.03|16.39|16.61|16.52|16.02|16.58|16.73|17.07|17.05|17.08|17.06|17.09|16.99|16.72|16.8|17.05|16.87|17.87|18.06|18.12|18.4|18.32|18.5|17.92|17.93|18.34|18.13|18.36|18.54|18.32|17.91|18.1|17.12|17.3|17.23|17.41|17.63|17.56|17.5|17.48|17.49|17.53|17.7|17.72|17.39|17.43|17.41|17.01|17.04|17.39|17.54|17.45|17.45|17.54|17.6|17.67|17.51|17.28|17.32|17.35|17.09|16.7|16.85|16.56|16.62|16.43|16.02|15.82|16.03|15.86|16.03|16.01|15.37|15.2|14.92|15.11|15.44|15.83|15.42|14.56|14.61|14.35|14.84|14.85|15.84|15.16|15.76|16.28|16.27|16.09|15.99|16.18|16.08|16.37|16.07|15.57|15.2|15.12|15.31|15.84|15.56|15.65|15.75|15.54|15.59|15.51|15.46|15.59|15.77|15.75|15.71|15.55|15.33|15.35|15.24|15.39|15.19|15.05|14.79|14.79|14.25|14.29|14.51|14.14|14.48|14.55|15.38|14.86|14.5|14.72|15.08|15.19|15.25|14.26|14.16|14.22|14.07|13.91|13.33|13.03|13.03|12.58|12.62|12.99|13.59|13.63|14.02|14.26|14.9|15.16|14.63|15.33|14.44|14.22|12.94|13.36|13.45|13.67|13.79|13.54|13.52|13.78|13.89|14.08|13.7|13.88|13.99|13.99|14.25|14.03|13.68|13.3|13.47|13.73|14.78|14.11|14.11|15.43|14.93|15|15.42|15.63|15.69|15.36|15.51|15.8|15.48|15.9|16.08|15.93|16.33|16.39|16.81|16.24|17.68|17.27|17.36|16.63|16.98|17.03|16.81|17.12|17.38|16.99|17.45|17.56|17.74|17.8|18.16|18.11|18.49|19.03|19.2|19.28|18.85|17.66|17.96|18.23|17.68|17.74|17.32|17|17.5|17.72|17.51|17.38|17.55|17.42|17.61|17.6|18.23|18.35|18.6|18.6|18.64|18.5|18.49|18.06|18.16|18.21|18.3|18.68|18.67|18.73|18.12|18.57|18.53|18.53|19.05|19.47|19.84|19.86|20.34|19.53|20.08|20.21|20.16|20.55|19.93|20.2|21.03|20.27|20.03|20.59|20.07|19.85|20.03|20.65|20.56|20.66|20.26|20.68|21.23|21.74|22.66|24.62|23.38|20.64|21.32|21.2|20.83|20.38|19.73|20.13|20.57|20.08|19.41|19.54|19.56|20.13|20.12|20.53|20.58|20.15|20.25|20.58|20.92|21.77|19.68|19.46|19.55|19.55|19.96|19.93|19.83|20.18|20.5|20.38|19.7|19.94|19.87|19.3|19.5|20.37|20.56|19.98|20.88|19.88|19.74|19.53|19.71|20.28|20.38|20.04|20.27|20.29|20.55|20.29|20.98|20.35|20.78|20.38|20.75|20.2|20.42|20.36|20.49|20.21|19.83|19.92|19.86|18.76|18.52|18.32|18.15|17.96|18.33|17.91|18.18|18.05|17.91|18.06|18.23|18.58|18.46|18.6|18.78|18.99|18.67|18.82|19.1|19.01|19.15|19.02|18.53|18.69|18.59|18.85|18.88|18.88|19.08|19.41|19.77|19.77|19.68|19.87|19.73|19.87|19.68|19.69|19.21|19.49|19.62|19.61|19.99|20.15|19.99|20.15|20.17|19.95|19.89|20.04|20.21|20.18|20.49|20.91|20.64|20.68|20.58|20.37|20.04|19.67|19.7|19.6|19.48|19.79|19.74|19.88|20.09|20.23|20.06|19.97|19.97|19.62|19.62|19.58|19.69|19.88|19.93|20.13|20.52|19.8|19.8|19.84|19.65|19.33|19.87|20.26|20.24|20.22|20.46|20.45|20.41|20.69|20.8|20.75|20.67|21.13|22.2|22.17|21.58|21.53|21.31|21.91|21.6|21.84|22.88|23.81|23.41|23.07|21.64|22.25|22.9|23.15|23.17|22.36|22.61|22.11|22.78|23.7|22.57|22.34|23.43|24.48|22.56|22.79|22.29|22.69|22.71|23.04|22.44|22.36|22.4|22.11|21.82|22.02|21.88|22.12|22.86|22.46|22.46|22.2|21.87|21.4|21.13|21.81|21.62|21.55|21.19|21.36|21.62|21.3|20.93|20.8|20.42|20.26|20.15|20.07|20.38|20.09|19.6|19.34|19.59|19.85|20.28|20.48|20.36|20.09|20.03|20.34|20.51|20.23|19.78|19.48|19.15|18.32|17.56|18.19|17.76|17.87|17.37|16.95|17.93|17.9|18.6|17.85|17.49|18.5|18.57|18.5|18.76|18.63|17.98|17.98|18.3|18.26|19.01|19.03|18.96|19.73|19.52|19.05|18.89|18.78|18.26|17.51|16.25|16.12|18|17.88|17.47|17.51|17.09|16.41|16.91|16.65|16.78|16.82|17.39|17.6|17.11|16.64|15.92|15.55|15.43|16.09|16.5|16.15|17.12|16.7|17.18|17.05|16.94|16.73|16.73|16.5|16.49|16.63|17.05|17.45|18.69|18.37|18.67|18.23|18.57|19.07|19.61|19.88|19.84|19.33|20.33|20.07|20.24|20.57|21.59|23.71|23.79|28.73|29.6|26.19|25.69|26.38|27.07|26.7|26.54|27.4|28.65|28.63|28.46|30.52|31.67|31.1|27.36|27.73|26.15|26.96|27.45|27.45|29.3|30|31.51|30.09|30.83|30.29|30.85|31.79|33.73|33.48|33.18|34.44|36.21|39.05|38.33|39.12|39.77|39.53|37.08|34.43|37.04|36.76|37.87|38.88|40.73|39.3|41.07|39.42|38|39.34|36.03|37.03|33.82|28.46|29.95|30.8|34.35|33.03|35.28|34.93|35.31|35.3|33.95|32.05|32.41|35.48|35.61|33.91|32.08|33.3|31.18|31.05|29.91|31.45|29.5|30.08|30.08|32.35|33.28|33.05|33.28|32.93|29.08|29.4|29.05|27.18|26.35|26.61|27.08|26.5|25.3|26.45|26.6|27.1|27.85|28.26|27.5|27.08|26.95|27.35|26.95|27.58|28.48|26.53|25.61|24.88|27.25|27.5|28|27.55|27.43|30.13|30.35|32.25|21.48|20.05|21.63|24.91|24.08|25.63|24.15|21.03|21.73|21.08|21.9|21.33|21.23|20.7|21.48|21.33|21.78|22.44|22.78|22.38|22.25|20.73|20.73|20.08|20.18|18.48|17.43|17.43|18.48|19.03|19.28|19.43|20.33|20.5|19.78|19.33|19.34|19|20.06|20.48|20.05|19.88|19.78|20.68|20.4|20.78|19.88|19.47|19.78|19.45|19.63|19.28|19.38|19.48|19.98|20.03|20.28|20.58|21.08|20.98|21.54|21.85|21.6|21.73|21.08|21.16|21.68|21.03|21|20.95|21.28|21.3|20.99|21.28|21.17|21.43|21.73|21.72|21.83|21.92|21.25|20.89|20.73|21.04|21.19|21.39|20.95|20.85|20.95|21.04|21.04|21.3|21.16|21.16|20.9|20.45|20.38|20.28|19.84|19.85|20.08|19.71|19.7|19.97|20.11|19.99|20.1|19.92|20.03|20.12|20.41|20.56|20.78|20.92|20.69|20.69|20.91|21.29|21.35|21.43|21.32|21.74|21.5|21.7|22.2|21.97|22.16|21.74|21.25|21.41|21.11|21.48|21.38|21.55|21.7|21.33|21.35|21.5|21.39|21.38|21.6|21.64|21.71|21.52|21.3|21.39|21.29|22.5|22.3|21.44|21.93|21.78|21.98|21.86|21.77|22.02|22.28|22.28|21.76|21.75|21.56|21.36|21.44|21.66|21.51|21.71|21.84|21.73|21.87|21.79|22.02|22.2|22.24|22.11|22.23|22.42|22.25|22.1|22.34|22.7|22.64|22.99|23.02|23.18|23.01|23.19|23.48|23.89|23.67|23.96|24.12|24.03|23.47|23.14|23.47|23.18|23.24|23.09|23.11|23.29|23.85|23.82|23.78|23.44|23.29|23|22.66|22.58|22.28|22.55|22.79|22.38|21.88|22.17|21.93|21.85|22.15|21.04|21.38|21.38|21.48|21.1|20.61|20.75|20.42|19.87|19.39|19.24|19.54|20.09|19.78|19.45|19.39|19.12|18.28|18.58|18.68|18.63|18.82|18.63|19.15|19.43|19.24|17.95|18.26|18.77|18.4|18.83|18.94|19.11|18.92|18.5|18.73|18.38|18.75|19.35|19.09|18.92|18.95|18.93|18.97|19.26|19.5|19.48|19.91|19.69|19.36|19.29|19.7|19.42|19.42|18.14|18.42|18.52|18.6|18.37|18.3|18.44|18.77|18.69|18.36|18.67|18.62|18.58|18.53|18.65|18.62|18.5|18.86|19.16|19.15|19.27|19.05|19.27|18.78|18.91|19.06|19|19.31|19.19|19.25|19.49|19.85|19.79|20.25|20.44|20.29|20.64|20.33|20.45|19.81|19.93|20.25|20.26|20.17|19.92|19.91|20.05|20.29|20.77|20.88|20.88|20.78|20.79|20.73|20.85|21.02|20.98|20.75|20.56|20.7|20.54|20.12|20.2|20.79|20.79|21.8|22|21.97|22.13|22.07|22.2|22.45|22.53|22.65|22.43|22.23|22.49|22.33|22.28|22.38|22.23|22.3|22.23|22.16|22.47|22.74|23.03|22.73|22.42|22.27|21.84|21.9|22.08|22.08|21.87|21.51|21.38|21.25|21.38|21.42|21.73|21.8|21.56|21.78|21.91|21.99|22.11|21.95|22.09|22.03|21.98|21.82|21.83|21.6|21.23|21.18|21.41|21.27|21.12|21|21.13|21.35|21.31|21.47|21.54|21.33|21.4|21.19|21.85|21.6|21.24|21.14|21.3|21.46|21.72|21.65|21.69|21.77|21.77|21.98|22|21.93|22|22.35|22.13|22.39|22.23|21.96|21.91|21.78|21.57|21.51|21.78|21.66|21.83|21.83|21.93|21.76|21.85|21.89|21.99|21.99|22.28|22.12|22.16|22.37|22.31|22.18|21.88|21.49|21.22|21.11|21.14|21.03|21.17|20.71|20.68|20.77|20.6|20.33|20.62|20.26|20.63|20.54|20.46|20.19|20.04|20.37|20.32|20.21|20.5|20.37|20.01|20.06|20.29|20.29|19.91|19.56|19.38|19.08|18.95|19.17|18.69|18.86|19.26|19.09|19.06|18.94|19.42|19.68|19.81|19.92|19.79|19.97|19.97|19.77|19.62|19.63|19.49|19.03|19.13|19.03|18.92|18.9|18.78|18.21|18.51|18.71|18.89|18.94|18.4|18.35|18.71|18.64|19.51|19.67|19.66|20.38|20.27|20|20.29|20.27|20.07|20.12|20.2|20.29|19.96|19.59|19.3|19.44|19.69|20.08|20.49|20.28|20.53|20.62|20.48|20.46|20.85|20.63|20.71|20.42|20.12|20.38|20.18|20.04|20.14|20.29|20.05|19.52|19.98|19.97|20.12|20.42|20.27|20.27|20.44|20.54|20.67|20.59|20.33|20.35|20.22|20.43|20.28|20.38|20.21|20.09|19.99|20.05|19.99|19.79|19.93|19.83|20.21|20.54|20.58|20.4|20.46|20.49|20.43|20.42|20.38|20.19|19.8|19.51|19.51|19.32|19.15|19.56|19.6|19.43|19.75|19.92|20.05|20.04|20.2|20.05|19.77|19.79|19.6|19.65|19.66|19.27|18.99|18.9|18.6|18.87|18.7|18.71|18.63|18.35|18.44|18.83|18.89|18.99|18.82|18.44|17.93|18.29|18.06|17.79|17.92|18.12|18.05|17.43|17.73|17.29|17.68|17.2|17.6|17.57|17.67|18.11|18.5|18.25|18.12|17.9|17.81|17.82|17.54|17.3|17.58|17.58|17.87|18.16|18.14|17.84|17.95|17.68|17.64|18.09|18.42|18.38|18.45|18.4|18.82|18.63|18.24|17.92|17.97|17.72|17.14|17|16.97|16.74|16.98|16.94|16.85|16.85|17.68|18.12|17.53|17.52|17.52|17.52|18.07|18.73|18.72|18.63|18.4|18.43|18.43|18.49|18.53|18.76|18.7|18.65|18.5|18.24|18.13|18.04|18.25|18.28|17.92|17.36|17.55|17.66|17.3|16.97|17.5|17.03|17.47|17.38|17.09|16.69|16.71|16.54|16.91|16.72|16.78|16.69|17.08|16.67|16.55|16.67|16.39|15.73|15.53|15.3|15.36|15.45|14.93|15.03|14.57|14.53|14.65|15.04|14.5|14.47|14.21|14.32|14.61|14.48|14.09|14.11|14.45|14.19|14.52|14.66|15.3|15.36|15.33|14.65|14.95|14.36|14.56|14.81|15.15|14.92|15.25|14.95|14.85|15.09|15.26|15.5|15.37|15.24|15.91|16.06|15.31|15.12|14.64|14.59|14.71|14.15|14.13|13.89|14.26|14.21|14.28|14.82|14.5|14.78|14.74|14.57|14.14|14.17|14.23|14.19|14.47|14.52|15.03|14.83|14.88|15.37|15.04|15.21|15.19|14.41|15.67|15.67|15.59|15.74|15.96|16.65|17.56|17.84|17.66|16.82|16.57|16.93|17.28|17.74|17.62|17.84|18.27|18.2|17.61|18.02|18.49|18.93|18.69|18.4|17.83|17.76|18.02|18.29|18.1|17.78|18.28|18.67|18.48|18.82|18.94|19.75|19.83|20.72|20.68|20.08|19.38|19.28|18.96|19.14|18.82|19.37|19.52|19.62|19.3|19.15|19.48|20.17|20.4|20.14|20.18|19.89|19.38|19.49|19.15|19.32|19.59|19.42|19.26|19.46|19.87|20.3|20.65|20.22|20.06|20.14|19.37|19.41|19.29|18.96|18.67|18.05|18.24|17.64|18.08|17.73|17.56|16.87|17.09|17.54|17.49|17.14|17.4|17.6|17.47|17.52|17.62|17.84|17.62|17.53|17.39|16.72|16.72|16.84|17.21|17.06|17.65|17.76|17.68|17.48|17.69|17.96|18.36|18.16|17.97|18.01|18.24|18.27|17.95|17.74|17.03|16.98|17.11|17.43|17.31|17.5|17.71|18.01|18.25|18.16|18.66|18.9|18.97|18.76|18.38|18.46|18.16|18.18|18.07|17.58|17.38|17.63|17.47|17.43|17.7|17.97|18.06|17.77|17|16.88|16.93|16.86|17.14|17.12|16.92|16.98|16.96|16.6|16.84|16.91|17.07|17.15|17.63|17.74|17.77|17.45|17.56|17.76|17.42|17.72|17.89|18.47|18.72|18.46|18.16|18.53|18.82|18.23|18.2|18.48|18.48|18.54|18.78|18.58|18.43|18.36|18.28|18.47|18.29|18.44|18.46|18.63|18.94|18.86|18.84|18.59|18.64|18.52|18.31|18.63|18.56|18.59|17.98|17.92|18.19|18.12|18.18|18.27|18.58|18.44|18.91|18.85|18.68|19.08|18.95|19.21|19.17|19.18|19.05|19.11|19.57|19.74|19.67|19.61|19.84|19.16|19.8|20.14|20.4|20.52|20.46|20.13|20.31|20.18|20.48|20.36|20.53|20.18|19.88|20.3|20.33|20.32|19.67|19.4|19.91|20.01|19.94|19.99|20.06|19.81|19.34|19.12|18.7|18.89|19.14|19.16|19.08|18.94|18.83|18.87|18.93|19.05|18.9|18.8|18.23|18.01|17.59|17.76|17.81|17.67|17.95|17.98|17.59|17.38|17.33|17.21|17.42|17.14|17.35|17.31|17.49|17.32|17.28|17.33|17.33|17.03|17.17|17.45|17.47|17.43|17.62|17.59|17.95|17.72|17.74|17.65|17.86|17.77|17.91|17.86|17.48|17.4|17.59|17.65|18.26|18.54|18.79|19.6|19.91|17.84|17.87|17.74|17.89|18.08|18.27|18.27|18.44|18.49|18.53|18.87|18.94|18.92|19.01|18.53|17.89|17.27|17.38|17.47|17.64|17.72|17.54|17.67|17.56|16.86|17.36|17.29|17.28|17.08|17.38|17.6|17.59|17.57|17.34|17.44|17.48|17.61|17.58|17.61|17.54|17.67|17.74|17.94|17.93|17.68|17.62|17.82|17.83|17.83|17.78|17.92|18.16|18.56|18.14|17.89|17.93|18.37|18.28|18.27|18.27|18.43|18.61|18.66|18.76|18.69|18.97|18.62|18.8|19.01|19.14|19.51|19.71|19.05|18.87|18.83|19.12|19.49|19.47|19.54|19.83|19.9|19.96|20.26|20.5|19.86|19.66|18.87|18.42|18.12|18.58|19.12|18.94|18.49|18.58|18.06|17.68|17.33|17.65|17.63|17.83|17.74|17.71|17.79|17.83|18.01|18.96|18.86|19.02|19.16|21.07|21.63|22.14|20.97|19.45|19.65|19.59|19.24|19.87|19.66|19.92|20.42|20.49|21.18|21.99|23.23|24.56|22.74|22.44|22.85|23.23|22.38|21.64|21.45|21.43|22.68|22.22|22.75|23.01|23.23|24.08|25.15|24.29|25.13|24.48|24.67|23.47|23.96|23.94|24.39|24|22.33|22.07|20.95|20.81|20.78|21.19|21.06|21.07|21.13|20.65|21.01|21.23|21.35|21.28|20.79|20.64|22.28|21.95|23.02|22.35|21.58|21.1|20.65|19.95|19.77|19.86|20.28|19.73|20.06|20.28|20.18|20.13|20.13|20.03|20.28|21.43|21.53|20.73|20.68|20.38|20.13|20.98|20.92|21.48|21.08|21.38|21.65|21.52|21.56|21.96|21.9|22.43|22.28|21.65|21.68|20.95|21.05|20.97|21.05|20.95|21.35|21.25|21.35|21.6|22.35|22.1|21.95|23.1|22.48|22.23|21.55|21.35|21.75|22.2|23.25|23.45|23.85|23.75|24.95|24.5|23.4|23.85|23.45|23.6|23.83|24.55|24.6|24.6|24.2|24.35|24.05|24.85|25.25|24.3|25.5|25.1|25.4|24.78|24.8|24.75|23|22.65|22.75|23.35|23.4|24.25|24.35|24.5|23.75|24.15|25.75|23.7|23.7|24.7|24.8|25.6|23.4|23.75|24.45|25.7|26.05|26.55|26.1|26.4|25.1|25.35|25.9|25.55|26.25|26.25|26.55|26.3|26.15|25.2|25.1|25.95|25.45|25.4|24.8|24.4|23.85|23.85|23.9|24.8|24.15|24.2|24|23.9|22.3|22.45|22.35|22.5|22.65|21|20.95|21.1|20.3|20.25|20.75|20.5|21|21.35|20.5|20.15|20.6|20.65|21.3|22|22|21|20.95|20.65|20.7|20.35|20.3|19.55|19.45|19.15|19.35|19.55|19.5|19.9|19.6|19.35|20.35|19.6|19.65|19.85|19.8|19.85|20.4|20.2|19.6|19.7|19.6|20.45|21.4|21.1|21.35|22.1|21.5|21.2|21.6|21.25|21|20.35|19.8|19|18.85|18.75|18.95|19.1|19.3|18.9|18.75|18.6|18.9|18.71|19.12|18.84|19.42|20.11|20.39|19.48|19.53|19.67|19.4|19.22|19.39|18.92|19.81|19.57|19.92|19.22|19.25|19.68|19.71|19.71|19.67|20.08|20.43|20.27|20.79|20.46|20.09|19.58|19.73|19.91|20.19|20.02|20.08|19.94|19.83|19.7|19.29|19.31|19.65|19.59|19.66|19.73|19.46|19.61|19.43|19.5|19.5|19.41|19.37|19.3|19.67|19.44|19.41|19.37|19.61|19.71|20.03|20.87|21.29|21.13|22.86|21.97|21.88|22.19|22.01|21.34|20.75|20.98|21.41|20.69|20.68|21.44|21.18|20.99|21.03|20.82|21.26|20.91|20.64|20.44|20.46|20.54|20.76|21.01|20.29|20.01|19.17|19.76|19.41|19.35|18.76|18.67|18.81|18.49|18.72|18.86|18.79|18.15|18.18|18.21|18.18|18.19|18.22|18.51|18.46|18.29|18.39|18.36|18.19|17.64|17.6|17.65|16.64|16.91|17.01|16.65|16.53|16.35|16.48|16.43|16.05|15.93|15.65|16.96|17.06|17.35|17.93|17.21|17.07|16.43|16.42|16.63|16.72|16.59|16.48|16.17|16.03|15.64|16.24|16.12|15.23|15.14|15.28|15.41|15.44|15.32|15.28|15.33|15.34|14.58|14.54|14.3|14.4|14.19|13.41|13.67|14.36|14.43|14.31|16.14|15.52|16.69|16.92|16.84|16.32|15.75|15.69|16.04|16.08|15.48|15.39|15.71|15.61|15.35|15.18|15.64|15.97|15.49|15.52|15.57|15.07|13.09|13.23|15.43|15.9|15.43|15.56|16.25|15.98|15.48|15.26|15.21|15.26|15.21|15.01|15.15|14.51|13.01|13.36|14.21|14.81|14.9|14.88|15.21|14.99|14.81|14.94|15.24|15.13|14.49|13.76|13.54|12.67|12.66|11.69|12.38|12.55|11.8|11.8|13.54|14.65|14.54|13.9|14.21|14.29|14.3|14.47|14.58|13.87|13.83|14.01|14.01|13.96|14.06|14.9|14.54|14.02|13.44|13.83|14.29|13.97|13.93|14.37|14.25|13.93|13.69|13.8|13.87|13.85|13.11|12.87|12.76|13.44|13.4|13.26|13.13|13.21|13.62|13.44|13.78|13.9|13.67|13.35|13.54|13.29|13.62|13.72|14.7|14.34|14.71|14.39|14.46|14.72|14.6|15.07|15.53|15.58|15.73|15.8|15.99|15.8|15.74|16.01|16.19|15.52|15.71|15.24|15.6|15.03|14.57|14.64|14.47|14.27|14.09|14.08|14.16|13.39|13.45|14.14|14|14.06|14.39|14.19|14.35|14.31|14.48|14.45|14.24|13.93|13.93|13.39|13.54|13.63|14.04|13.57|12.81|12.46|12.2|12.51|11.48|10.86|11.37|11.27|11.31|11.2|11.61|11.2|10.82|10.86|11.3|11.64|12.55|11.05|10.95|10.86|10.99|11.03|11.59|11.82|12.14|12.42|12.04|12.84|12.99|13.06|13.43|12.91|12.33|12.23|12.21|12.13|11.82|12.45|12.62|12.41|12.16|12.4|12.52|12.81|12.36|12.21|12.42|11.94|11.85|11.65|11.88|11.94|11.9|11.38|11.49|11.97|11.79|11.97|12.44|12.49|12.61|12.31|12.28|12.66|12.92|13.32|13.33|13.63|13.78|14.74|14.3|14.51|14.48|14.6|15.11|15.11|15.26|15.39|15.18|16.94|16.79|16.02|15.92|16.59|16.85|17.34|17.82|18.05|17.96|17.67|17.82|18.43|18.53|18.69|18.89|18.23|18.57|17.44|18.11|18.04|16.77|16.77|17.32|16.31|16.81|17.91|17.66|17.98|17.82|18.45|18.24|18.61|17.92|18.25|18.01|18.42|19.33|19.7|20.33|20.66|19.54|19.84|21.09|20.52|20.46|20.21|20.49|20.67|21.42|21.67|21.7|21.54|21.86|21.61|21.36|20.66|21.79|24.1|24.72|24.32|24.48|24.26|24.76|24.69|24.54|24.51|20.81|21.58|22.46|22.81|22.36|22.74|23.17|21.79|22.49|23.17|22.93|23.28|24.21|24.37|24.91|25.31|26.04|26.57|25.71|26.61|28.03|26.91|27.22|27.22|25.84|24.87|25.01|25.88|25.71|26.67|26.36|26.69|26|25.21|25.37|26.28|26.74|26.76|26.55|25.51|26.36|26.81|26.41|25.76|25.56|24.65|24.79|24.79|24.71|25.69|26.3|28.01|28.98|29.11|29.67|29.71|29.25|30.28|27.22|27.27|27.65|28.28|27.52|28.26|28.67|28.05|28.71|29.49|29.51|30.3|30.17|30.01|29.37|29.51|29.63|30.19|30.23|30.34|30.11|30.57|31.71|31.51|31.46|32.19|33.9|31.22|31.61|31.76|32.11|31.93|30.47|31.1|30.86|29.33|28.01|27.28|27.47|27.86|27.59|26.67|25.46|25.51|24.97|23.91|24.17|25.49|25.29|25.48|26.06|25.92|27.38|27.29|27.41|26.41|24.69|25.53|25.71|25.84|26.86|27.08|27.37|28.05|28.46|28.1|29.25|29.64|29.95|29.76|29.38|30.28|30.02|28.62|28.61|29.89|30.43|29.76|30.36|29.03|30.19|30.34|29.87|29.78|29.29|29.78|30.22|31.76|32.73|32.7|32.35|31.57|33.07|33.64|34.72|34.76|31.56|32.01|31.86|32.73|32.44|30.19|30.26|29.51|30.34|31.41|30.71|31.94|31.1|30.94|28.56|27.89|28.21|28.22|27.85|28.27|28.92|29.94|28.93|29.26|30.38|31.09|31.02|31.92|31.43|31.88|31.97|32.42|31.24|31.23|33.41|34.01|32.92|32.73|33.25|33.09|33.42|33.92|34.97|35.18|33.62|35.14|34.25|33.87|34.37|35.87|36.75|36.96|37.22|33.84|32.66|31.78|30.26|30.87|31.86|30.91|30.86|31.98|33.2|34.96|33.18|33.36|33.51|34.31|34.53|33.62|33.75|32.78|32.7|33.14|32.59|32.62|33.02|33.44|32.92|33.87|34.05|34.3|34.72|35.54|34.84|35.62|35.98|35.54|36.06|36.24|34.02|34.58|33.61|32.06|31.28|29.25|30.24|29.36|28.31|29.75|29.81|28.06|28.86|29.52|29.34|25.83|26.06|26.55|25.82|26.72|27.29|27.93|27.95|28.02|27.44|27.72|29.42|29.42|30.07|30.19|29.77|30.42|32.12|32.21|31.66|31.46|31.61|29.12|28.62|29.88|31.27|30.55|30.27|31.27|31.57|30.93|30.52|30.12|29.55|28.96|29.22|28.6|28.64|28.52|28.83|28.27|28.26|27.35|27.78|27.89|28.61|28.4|28.95|28.31|27.97|27.91|27.45|26.49|26.56|26.68|26.17|25.99|26.43|26.19|27.31|27.4|27.62|26.43|26.47|26.37|26.65|27.16|27.24|27.07|27.45|28.47|28.42|28.75|28.81|27.89|27.83|27.92|26.97|25.24|25.93|28.35|28.48|28.37|27.89|28.66|27.35|28.39|28.5|28.59|28.83|28.9|28.77|29.02|29.9|29.96|29.75|28.85|27.97|28.08|28.76|28.71|28.39|28.14|27.56|27.91|28.43|28.94|29.13|28.81|29.12|28.52|27.55|27.49|26.52|26.85|27.02|27.11|26.97|25.67|25.75|26.37|26.02|26.28|27.07|28.1|27.63|27.22|27.07|26.85|26.57|26.02|24.65|25.67|25.88|26.18|26.74|26.98|26.6|26.7|26.83|27.86|27.51|27.7|28.17|27.62|27.72|28.12|27.85|28.1|27.51|27.47|26.65|27.2|27.93|27.17|25.63|28.34|26.69|27.16|27.07|26.65|26.65|26.94|27.03|27.54|27.99|27.66|27.65|27.64|28.58|29.59|28.84|27.81|26.73|26.6|21.46|21.63|22.8|23.44|23.12|22.7|22.17|22.7|22.32|22.55|23.49|22.49|22.37|22.01|21.89|21.33|21.99|21.78|21.28|22|21.75|22.07|22.1|21.83|21.2|20.47|20.24|20|19.93|21.21|22.23|21.26|21.56|17.5|18.09|17.74|18.38|18.69|19.57|19.37|19.46|20.27|19.71|19.62|18.69|19.08|18.32|18.04|18.2|19.28|19.38|19.37|18.67|19.3|21.32|21.07|20.42|19.96|21.13|21.47|21.42|20.32|20.48|19.67|18.99|18.96|18.2|18.02|18.36|19.1|19.57|19.8|19.3|19.11|19.71|20.4|19.77|19.75|20.25|21.29|20.76|21.19|21.19|21.47|20.77|20.31|20.81|20.92|20.24|21.4|21.78|22.37|23.18|23.62|23.87|24.36|24.14|24.48|24.47|25.03|25.02|24.92|25.74|25.56|25.69|25.75|25.79|26.21|26.82|27.75|27.55|26.64|26.21|26.16|25.45|26.15|24.93|23.51|24.53|24.92|25.94|25.86|26.43|26.28|26.28|26.28|26.36|27.12|27.32|26.58|26.31|26.75|26.11|26.79|27.76|27.78|27.92|28.62|29.17|28.17|28|28.19|28.24|27.35|27.01|26.6|26.69|25.08|24.78|25.37|25.1|25.32|25.02|24.72|24.24|24.21|24.79|25.54|25.9|25.98|25.51|26.06|26.67|26.77|26.79|26.79|26.83|26.82|26.14|26.16|26.73|27.01|27.48|27.23|27.68|27.5|27.83|26.61|26.61|26.78|26.67|26.55|26.54|27.43|27.02|26.51|26.87|26.55|27.18|26.58|26.67|26.87|27.84|28.35|28.19|28.99|29.24|29.86|30.12|30.37|30.11|29.99|29.23|28.84|28.31|28.83|28.97|27.76|28.28|29.06|29.51|29.8|29.62|29.77|28.95|29.83|29.14|29.08|29.57|29.49|29.65|30.85|30.79|30.69|30.31|30.53|30.59|30.71|30.59|29.73|29.65|29.65|29.56|29.31|28.96|29.36|30.06|29.73|29.28|29.61|29.56|28.31|27.93|28.19|27.87|27.09|27.25|26.81|26.85|27.18|27.04|26.89|26.06|25.72|25.36|25.83|26.02|26.19|25.4|25.5|26.71|26.41|27|27.07|27.73|27.01|26.6|26.87|27.27|27.34|26.8|27.27|27.03|27.73|27.49|28.2|28.39|30.15|30.04|30.41|30.57|32.09|32.13|32.61|32.68|31.41|31.21|31.97|33.26|32.29|31.2|30.66|31.95|31.59|32.08|33.23|33.58|33.88|34.62|34.32|33.9|34.98|32.43|33.54|33.51|33.61|33.91|35.05|34.46|35.43|36.63|36.88|36.45|36.76|37.29|37.96|36.76|36.86|37.21|37.76|36.81|37.87|30.01|27.18|29.51|33.42|31.14|29.48|27.97|27.2|29.46|29.16|30.1|28.04|27.52|25.92|25.32|26.05|26.94|28.51|29.07|29.29|29.51|29.09|28.46|29.15|31.26|31.36|31.72|31.08|29.86|30.63|30.22|30.05|31.65|28.97|30.15|30.41|30.08|31.04|31.6|31.2|31.44|31.67|30.13|30.72|30.31|29.98|30.21|31.8|31.77|32.41|32.23|31.91|30.85|31.01|30.76|31.78|31.64|31.43|32.01|31.76|29.57|28.93|28.85|29.41|28.86|28.26|27.6|27|27|28.19|28.29|28.35|29.43|30.97|32.01|31.91|31.51|30|30.31|29.99|29.57|28.95|29.24|30.73|31.01|31.21|32.31|32.26|29.99|30.02|30.33|30.61|31.24|31.72|31.92|32.01|33.06|32.94|32.81|31.71|32.03|32.99|32.51|33.01|33.54|34.62|33.61|35.53|35.12|34.94|34.41|33.63|34.02|34.2|33.06|33.26|32.49|32.91|34.51|35.42|35.8|35.75|35.85|36.08|36.6|37.31|36.53|36.95|36.21|37.44|38.21|37.81|37.12|37.81|37.06|35.67|36.15|34.29|37.14|36.62|37.74|37.61|36.61|37.7|37.22|37.02|37.49|37.5|39.69|39.41|39.98|38.9|40.3|41.42|41.53|40.32|39.83|42.03|41.45|40.6|39.25|39.9|42.33|39.96|39.29|38.72|37.18|37.6|38.45|37.58|37.18|37.33|38.51|37.69|38.11|37.56|37.81|35.6|36.92|38.56|38.37|39.56|39.18|40.27|39.3|39.55|40.98|41.1|41.55|40.86|40.63|41.51|41.82|41.45|42.81|42.69|43.72|44.13|44.39|43.95|44.86|44.51|44.72|45.52|46.61|46.02|46.75|47.36|48.66|47.6|46|45.68|43.83|43.06|42.32|42.23|43.89|44.04|43.18|44.53|43.86|44.62|43.83|44.03|46.33|48.41|48.37|48.86|49.56|49.76|49.53|49.56|49.85|51.08|51.98|52.56|53.4|53.65|53.49|53.86|54.89|53.59|53.28|54.51|55.52|56.37|52.52|50.95|51.78|50.1|49.6|50.9|48.8|49.65|49.1|47.4|48.7|47.5|47.3|46.1|46.85|46.3|48.9|48.48|48.74|49.14|49.71|49.16|45.56|43.31|42.56|42.96|41.51|41.96|42.41|40.71|41.06|41.76|44.21|44.16|46.31|45.57|45.76|44.05|42.19|41.26|41.78|43.69|43.36|42.16|43.96|43.41|45.51|45.32|45.31|45.66|48.11|48.41|48.46|47.61|47.01|48.31|48.61|49.43|48.8|48.8|47.15|48.25|47.1|46.65|46.4|46.45|45.35|45.4|45.45|47.05|47.15|47.3|48.35|48.45|51.73|52.05|52.2|51.67|53|53.6|53.7|53.9|54.55|54.75|53.52|54.4|54.9|56.4|56.8|56.7|55.95|49.43|54.06|54.26|53.96|55.31|55.83|55.88|54.16|53.46|51.54|50.21|51.11|50.52|52.45|52.49|54.16|53.16|54.33|51.37|51.92|49.2|50.94|49.6|50.22|51.12|52.04|51.76|50.39|48.83|48.64|46.99|47|48.68|49.14|50.37|50.89|51.65|52.08|54.4|53.46|54.46|53.84|52.51|54.36|55.47|55.03|55.53|56.48|58.4|58.27|59.23|59.63|59.78|58.32|57.23|56.63|59.11|59.71|61.24|60.76|59.23|60.49|60|57.83|57.12|57.61|56.73|57.31|57.75|59.05|59.12|59.91|61.51|61.87|60.76|61.6|62.44|63.92|63.13|64.8|65.67|66.21|66.11|63.29|63.47|65.46|65.81|67.1|67.29|66.05|67.41|68.63|69.5|65.83|64.38|64.8|63.29|63.18|65.2|64.64|62.91|67.21|66.96|67.07|64.67|65.98|64.94|66.36|66.21|65.36|63.74|61.81|61.81|63.84|64.13|63.05|64.26|62.94|62.11|60.63|62.83|60.85|61.03|61.3|59.8|59.85|61.7|60.6|59.4|59.7|59.65|57.45|57.6|57.85|56.2|56.3|57.75|58.3|58.35|56.46|57.33|58.46|59.31|59.96|59.41|61.36|61.36|60.86|60.01|58.01|57.31|57.81|58.56|58.08|59.81|60.26|63.11|63.41|62.81|63.56|63.41|63.91|63.86|66.36|65.76|66.86|68.16|68.06|66.83|65.6|65.8|67.81|68.36|67.86|66.61|64.71|65.41|65.11|63.01|62.51|62.66|62.01|61.26|59.61|57.61|58.61|61.21|59.03|58.03|61.46|61.37|62.01|62.46|61.51|60.06|60.51|59.91|61.81|62.11|63.46|62.81|60.31|60.41|60.03|62.13|63.9|63.75|65.65|66|66.7|66.07|65.75|66.76|67.22|67.02|68.29|69.03|68.53|70.3|71.28|72.07|73.73|70.19|67.43|71.71|70.76|71.8|73.75|74.62|72.26|70.09|69.75|72.15|73|71.87|69.25|69.4|68.65|69.63|68.44|69.23|70.78|69.47|70.92|71.35|71.85|71.42|70.11|72.73|72.5|72.43|70.9|70.25|71.62|70.28|68.48|69.12|69.78|69.75|69.21|69.3|70.07|70.62|70.5|71.63|72.15|73.5|73.94|75.2|75|73.76|73.5|74.05|75.7|73.87|72.79|74|73.52|74.29|73.46|73.82|74.5|73.3|74.56|74.93|76.16|75.59|74.78|77.05|76.29|76.28|74.17|74.38|73.33|72.95|71.64|70.12|70.93|72.45|72.55|71.45|72.02|72.13|70.47|70.2|70.38|69.24|68.7|67.75|67.37|66.3|65.42|63.81|64.09|63.27|63.3|61.77|61.62|59.79|60.74|60.63|62.46|62.9|60.96|58.64|59.53|60.02|59.68|59.93|58.5|57.56|58.23|58.69|59.91|58.91|57.66|58.55|57.35|56.74|57.55|59.09|60.27|60.75|58.41|58.72|58.64|59.13|60.11|58.94|61.18|59.66|58.59|58.79|56.23|55.9|56.42|58.01|57.28|60.3|60.97|62.45|62.97|63.43|62.39|62.4|62.2|62.54|62.06|61.26|61.06|61.34|62.48|63.4|62.19|62.87|63.08|62.05|61.81|61.07|60.31|60.39|60.85|60.77|58.31|55.65|56.29|56.08|55.65|53.95|51.91|52.96|51.23|52.3|50.51|51.98|51.11|53.61|54.24|53.49|55.38|57.03|58.17|57.35|59.01|58.69|58.91|57.75|59.76|59.86|57.76|58.98|57.92|59.38|58.32|59.4|60.28|60.28|61.41|61.78|61.97|61.58|60.05|60.66|61.85|61.63|60.06|58.94|58.03|58.15|57.52|57.06|56.65|56.41|56.98|60.21|61.07|61.77|62.98|64.11|66.1|65.94|66.03|64.59|64.4|64.26|61.51|61.92|61.98|63.63|63.63|63.14|63.14|61.81|63.56|65.33|64.1|65.33|65.08|66.45|65.78|64.43|63.78|63.23|61.89|61.48|62.26|61.54|61.85|62.35|62.55|63.16|62.57|64.83|64.93|66.25|64.91|65.1|63.62|64.59|63.19|63.47|64.02|65.09|66.17|65.63|65.97|66.93|64.78|65.93|65.36|66.17|67.62|68.04|69.06|69.15|68.5|68.35|68.85|68.83|67.78|68.98|69.61|70.47|71.11|71.41|71.81|72.8|72.14|72.8|72.58|72.55|73.89|74.11|74.03|75.03|75.9|75.53|74.65|73.38|75.74|74.96|77.03|76.82|78.2|76.49|76.84|75.41|72.03|72.25|72.23|71.62|71.49|71.6|72.4|73.36|70.99|71.9|71.12|69.49|69.3|69.86|71.17|71.98|71.79|73.52|73.37|73.98|75.07|75.74|76.34|76.7|77.53|78.16|79.85|80.05|79.14|80.55|81.51|81.99|83.85|83.38|82.51|81.2|80.31|82.86|81.64|80.31|80|79.97|81.48|81.2|78.97|80.23|81.3|83.05|83.73|86.19|87.58|87.19|89.48|88.58|87.6|86.45|88.3|92.09|91.73|93.45|90.33|94.16|93.53|95.81|94.06|96.65|96.46|95.51|96.36|94.4|91.18|94.02|93.37|94.81|95.75|99.16|98.57|98.24|97.66|94.39|90.71|90.98|88.6|89.29|88.31|87.45|90.25|88.23|87.72|90.12|94.41|92.35|91.31|90.69|89.93|91.11|90.88|93.19|94|95.89|96.63|96.03|95.95|99.64|99.17|97.9|95.08|96.43|95.64|93.92|92.74|94.23|91.87|90.8|90.11|90.55|89.64|87.65|89.98|90.37|90.99|91.66|92.34|91.67|89.03|90.07|88.32|87.16|88.07|91.77|93.56|92.82|93.28|95.42|95.57|99.99|100.86|98.57|99.03|99.4|100.83|99.59|102.6|101.78|102.42|99.72|104.45|105.51|105.12|107.9|108.73|109.86|110.21|110.03|105.74|109.57|103.25|102.57|101.7|101.78|105.83|107.56|105.59|101.54|100.92|104.83|103.92|106.09|108.91|108.54|110.89|110.07|110.14|111.71|113.77|114.8|114.8|116.56|117.48|119.17|119.28|117.1|119.64|118.78|115.67|113.7|112.6|116.36|119.94|121.82|123.56|123.77|125.94|124.02|125.83|124.21|124.25|126.5|127.15|128.93|132.99|130.04|131.58|128.81|131|126.7|127.35|127.75|124.33|122.3|127.93|138.51|134.44|131.38|136.43|136.91|134.84|134.52|133.99|136.54|131.88|134.78|135.98|136.49|133.92|138.91|139.69|139.96|141.06|143.74|145.31|141.38|136.06|135.88|141.47|144.96|145.16|138.68|134.63|129.43|128.94|131.43|127.25|123.73|124.62|122.59|124.72|122.21|126.74|124.17|125.03|121.45|118.71|118.57|119.84|115.42|114.44|113.1|115.96|115.05|113.46|112.92|114.39|115.48|121.23|114.48|114.85|116.31|118.17|115.58|115.55|109.63|109.38|107.99|106.47|106.35|103.23|102.66|100.95|101.19|95.52|91.49|97.39|97.5|104.05|122.61|107.85|106.84|111.54|106.77|96.29|100.7|98.23|93.84|93.91|88.15|90.18|88.94|86.5|77.44|81.17|78.69|74.38|69.81|71.9|74.08|71.29|66.92|67.17|63.34|61.92|62.8|67.45|65.79|68.1|63.93|70.41|65.41|60.72|61.06|62.19|59.38|55.95|58.31|57.18|55.14|54.42|53.64|48.86|49.22|53.63|50.02|54.2|55.21|49.34|47.05|46.79|43.8|41.01|43.69|42|43.1|47.77|46.27|44.61|43.84|40.17|36.73|33.17|31.1|30.28|32.94|37.58|39.89|38.95|44.6|46.17|48.61|48.56|42.75|41.68|40.69|37.65|37.77|37.43|35.41|35.38|38.57|42.56|42.33|45.12|46.5|41.67|42.04|41.58|41.73|41.35|40.87|40.27|41.15|40.24|39.58|37.54|35.93|34.03|37.63|34.96|34.67|39.6|39.35|37.66|38.86|41.64|43.18|40.07|41.57|45.28|43.54|45.43|47.01|45.68|42.46|46.91|46.22|47.33|48.97|48.12|51.46|51.55|53.05|53.36|52.24|53.87|52.41|48.49|49.64|48.46|52.61|52.52|51.1|49.13|49.37|52.24|50.22|49.51|49.26|49.97|50.36|45.82|46.65|47.41|48.46|50.65|49.29|49.01|50.19|50.35|52.18|54.45|53.81|56.29|56.67|58.58|57.79|58.81|58|58.58|56.52|58.99|59.52|61.45|60.49|61.15|62.48|63.41|65.09|66.31|68.59|68.58|66.14|68.8|68.43|68.05|70.02|71.38|72.69|72.13|70.54|70.47|71.07|71.42|69.6|67.09|68.81|68.14|69.7|69.16|71.47|69.82|69.32|66.68|64.06|62.88|60.15|60.36|59.93|59.69|59.62|61.49|62.07|63.56|63.93|64.58|66.1|66.96|68.34|67.24|63.42|66.9|69.26|71.59|71.4|71.97|71.96|70.97|70.59|69.46|70.08|70.57|67.51|66.72|69.22|72.54|72.4|73.12|73.68|71.6|71.38|72.49|72.72|69.97|68.11|68.03|67.9|67.95|71.08|71.27|71.95|69.34|68.86|70.81|72.5|72.48|71.95|69.74|71.5|68.74|65.74|65.91|66.69|66.56|70.46|70.67|69.8|70.26|70.71|69.6|71.69|71.75|73.24|74.1|75.2|77.55|78.54|79.47|78.87|81.03|80.82|80.11|78.61|79.45|77.39|79.84|77.04|78.08|79.58|80.3|79.64|77.4|79.44|79.01|79.16|77.25|76.34|78.91|79.08|79.55|77.47|76.83|76.49|74.88|77.25|75.95|77.19|78.39|76.62|76.42|75.41|73.89|72.59|70.67|70.54|69.86|69.48|70.62|72.64|72.58|73.3|72.71|73.48|76.03|76.83|78.67|78.87|79.35|79.39|81.52|81.74|83.12|82.6|82.74|82.54|80.79|79.66|79.35|77.96|78.98|77.42|75.84|74.25|74.9|74.67|73.64|73.62|72.85|74.41|77.21|76.96|73.13|71.15|71.87|73.71|74.48|75.23|74.11|76.98|77.27|78.97|79.77|80.04|78.61|79.75|77.99|79.72|78.71|79.62|80.91|80.21|81.5|81.85|81.5|82.07|82.1|81.26|79.79|81.75|82.93|82.16|80.58|81.26|81.68|80.29|80.25|79.75|81.92|82.14|83.45|84.53|86.36|86.54|85.64|85.17|84.6|84.07|83.8|85.62|85.25|82.97|81.52|82.98|82.78|82.89|84.34|84.2|82.43|83.22|85.17|86.07|86.19|82.73|80|77.18|75.1|76.89|76.37|75.65|74.38|71.61|70.08|69.38|69.91|68.28|68.03|68.23|64.78|71.52|74.56|74|72.7|72.88|74.62|71.43|71.55|71.88|74.38|75.48|73.89|74.99|76.84|77.67|76.82|77.18|77.84|77.15|75.9|75.96|78.45|78.26|75.93|75.59|72.95|72.06|71.96|74.05|75.46|76.08|74.93|77.16|77.02|76.67|75.96|76.53|77.32|76.27|79.01|78.68|78.93|77.46|77.06|78.3|78.85|81.25|82.52|82.49|82|80.67|81.46|80.24|78.09|75.68|75.39|75.17|75.76|75.39|74.45|73.45|72.71|71.24|72.07|73.36|75.17|74.69|71.93|73.97|74.99|74.52|73.98|74.65|74.25|76.4|77.17|76.78|75.92|74.58|73.63|74.81|72.96|72.98|73.4|74.63|76.51|76.15|77.85|79.95|81.57|81.43|82.83|83.21|81.34|82.66|82.18|81.67|83.03|82.71|81.23|83.06|79.57|81.93|80.03|81.15|82|82.6|81.9|82.2|81.45|82.94|83.91|84.45|86.49|86.85|87.07|87.04|87.77|87.77|84.89|84.88|82.33|80.43|81.88|81.65|81.24|80.79|83.21|83.87|85.73|84.12|86.75|87.98|89.18|89.33|88.69|88.3|88.35|87.81|88.62|88.33|88.66|87.71|88.02|88.68|89.3|89.83|90.84|90.99|91.48|91.13|89.85|91.38|91.59|89.39|90.3|88.37|88.07|89.24|91.11|91.85|91.39|91.53|91.38|90.85|88.56|88.22|86.74|85.08|86.15|84.45|88.15|90.99|89.54|89.78|89.42|87.87|86.3|85.85|85.59|85.44|84.39|83.66|83.13|83.8|85.05|85.03|92.65|96.04|95.83|96.52|97.1|99.63|102.27|101.92|104.34|105.37|105.06|104.39|102.73|101.14|101.2|97.23|97.99|101.47|101.06|102.36|104.53|105.21|105.04|104.89|104.34|103.8|106.19|107.55|108.14|107.82|108.38|109.82|109.5|106.6|109.17|106.7|111.68|111.72|112.31|112.38|113.03|110.6|103.39|97.88|96.4|99.52|97.06|102.7|100.3|100.28|100.77|99.3|97.2|93.7|90.7|92.9|95.3|94.81|98.7|96.2|95.75|97.24|95.94|97.49|98.11|98.96|98.97|99.61|97.4|97.48|95.68|94.98|93.78|91.87|86.75|86.89|81.27|79.32|83.05|85.48|85.19|87.88|86.65|87.58|82.38|82.33|84.42|85.35|84.99|85.15|85.37|87.27|88.9|88.81|88.93|86.45|85.99|89.34|89.05|87.24|88.19|90.21|88.91|89.4|87.96|85.7|86.92|85.77|80.29|79.58|79.97|84.18|80.94|81.87|78.93|77.34|75.4|79.41|82.32|82.7|85.14|85.54|85.3|83.96|86.8|86.38|88.34|86.11|86.07|87.19|91.12|92.98|90.2|93.96|93.32|93.19|92.19|92.51|94.07|94.26|95.52|96.8|95.74|97.78|98.99|98.14|99.37|102.59|98.82|97.67|96.73|97.76|96.16|96.91|98.21|99.79|100.36|100.2|100.97|100.94|101.25|100.45|98.35|99.4|97.77|100.24|94.92|93.84|93.55|93.86|97.16|98.54|99.42|99.72|101.29|99.44|99.68|98.83|102.96|103.22|101.81|101.56|101.31|102.24|100.89|99.03|98.69|100.7|100.61|100.32|98.15|99.47|98.84|99.23|99.76|99.47|98.75|98.46|97.63|96.36|97.8|96.89|98.55|98.8|99.88|98.68|100.39|100.82|101.82|102.33|103.27|105.88|105.99|107.44|109.39|108.49|106.59|107.08|108.76|106.68|106.7|104.71|106.16|106.65|107.4|106.34|106.7|105.49|105.19|107.03|108.09|105.68|106.87|104.98|106.43|107.07|107.32|105.4|102.79|103.03|105.25|104.02|101.53|103.29|102.45|101.12|102.66|103.69|102.84|102.92|104.23|102.65|102.38|103.58|102.68|103.1|103.72|104.56|104.86|104.89|106.17|105.25|102.56|98.49|97.86|97.13|96.8|97.1|96.03|94.75|93.97|92.78|92.53|91.51|92.57|91.44|89.4|90.36|90.64|90.75|87.79|86.52|83.17|83.95|84.31|85.05|84.78|84.08|82.58|83.35|82.56|83.83|84.03|83.26|83.99|81.06|77.91|79.33|78.76|79.34|80.27|77.72|85.04|83.72|87.74|87.11|84.37|85.93|83.92|85.88|86.02|87.15|88.41|89.07|89.88|92.78|91.56|87.77|88.28|88.8|89.4|90.13|89.8|88.08|88.99|87.22|91.4|92.3|93.68|93.39|93.39|92.94|92.76|93.4|94.35|95.66|96|96.03|96.55|96.89|95.87|95.78|95.54|96.3|95.5|94.61|96.47|95.34|95.37|95.58|96.41|96.52|97.03|97.02|98.3|98.94|96.51|95.25|91.97|92.14|92.64|91.68|91.07|89.92|91.89|92.18|92.44|91.88|88.19|91.69|89.87|89.43|92.42|91.24|92.19|91.83|91.84|92.07|92.04|92|90|88.3|86.65|85.39|85.59|85.84|85.52|85.65|86.23|87.05|84.9|85.64|88.62|84.5|85.07|86.08|85.56|85.38|86.32|85.45|86.62|89.05|86.46|87.08|87.01|87.28|86.81|86.1|87.64|88.54|88.69|88.04|87.36|85.47|85.45|85.14|85.36|86.35|85.39|86.32|86.71|87.46|89.09|89.76|88.2|88.29|90.71|90.91|90.66|91.83|93.14|92.97|93.12|93.2|93.21|93.08|93.81|93.6|94.27|93.26|94.28|95.49|95.61|96.09|95.06|95.35|95.15|95.95|97.62|97.98|97.65|97.46|96.21|96.68|96.44|95.84|95.71|97.01|97.48|97.03|97.3|95.95|96.69|94.92|92.79|93.12|92.74|92.63|92.84|92.03|90.71|90.13|90.88|90.47|91.53|92.01|92.07|92.44|92.47|93.03|93.49|93.71|92.44|93.21|92.46|93.41|94.55|95.99|96.53|97.24|97.1|97.23|95.02|93.26|92.76|93.36|94.18|94.59|93.44|91.23|88.75|88.73|86.65|87.83|88.04|88.81|89.21|91.07|93.27|92.63|94.09|93.22|90.74|93.7|95.25|95.8|96.24|96.09|95.81|94.76|93.96|93.95|94.85|95.72|96.29|95.55|93.98|94.12|93.84|94.65|93.13|93.57|91.93|93.41|93.36|93.66|94.71|96.11|95.82|95.5|95.98|96.66|97.83|97.86|98.46|98.24|94.89|93.81|95.07|95.25|95.47|97|96.36|97.94|99.65|101.92|103.09|103.03|103.46|106.41|104.77|105.85|106.2|105.88|106.39|107.94|108|106.61|107.13|105.41|105.47|104.76|104.61|103.14|105.1|107.93|106.94|106.61|105.32|104.41|103.45|106.04|106.19|106.78|106.89|107.43|107.58|107.14|104.9|103.93|104.93|106.48|105.88|109.11|110.17|108.51|107.98|108.67|107.29|108.5|110.62|109.62|107.48|107.65|108.72|108.31|106.54|105.36|108.23|106.26|104.7|103.62|103.22|102.68|103.1|102.86|102.36|102.09|104.15|103.29|103.83|103.07|103.54|101.63|103.08|102.17|102.46|101.15|102.34|100.72|100.87|99.28|97.63|96.9|96.65|97.4|98.74|98.29|96.81|96.29|94.56|94.58|93.4|94.74|94.25|94.56|95.13|93.12|93.91|93.76|93.8|93.03|93.35|93.34|95.35|94.53|93.86|93.41|92.05|92.55|93.61|95.83|96.97|97.14|97.48|97.1|97.25|97.21|96.27|97.18|96.99|97.59|98.4|99.11|98.62|98.87|99.18|99.94|98.9|98.17|95.14|93.66|93.12|93.31|91.9|91.36|92.39|91.45|92.15|93.78|93.54|93.96|94.51|96.35|97.23|96.66|95.82|97.49|97.34|98.25|97.55|96.44|97.24|97.4|97.84|99.98|100.12|99.96|100.38|100.27|100.31|102.54|103.46|103.2|102.53|103.17|102.2|102.93|102.68|102.88|105.34|103.64|101.75|101.82|102.82|101.39|100.29|98.29|98.57|99.23|98.43|100.08|100.71|99.68|99.97|100.05|99.66|100.61|101.25|101.73|101.57|99.69|99.6|100.29|101.16|100.43|102.57|103.55|103.37|103.68|104.05|103.7|103.71|104.33|104.35|101.69|101.47|102.2|100.85|101.13|101.56|100.07|99.69|100.09|99.74|99.81|101.06|100.52|100.32|100.89|102.01|102.63|101.74|102.31|102.95|102.8|104.31|104.03|105.01|104.78|103.37|104.26|103.4|103.07|103.34|103.27|103.17|103.32|105.09|105.02|105.04|107.2|107.49|107.52|106.95|106.64|107.08|107.95|106.83|106.64|107.04|106.49|106.46|106.07|106.06|105.18|104.76|104.19|104.06|102.93|103.61|101.48|101.73|100.56|101.88|103.84|103.83|105.34|104.59|103.81|102.76|105.23|105.68|104.91|104.29|98.23|97.86|98.26|97.34|96.93|97.34|97.61|98.09|97.36|97.57|95.54|97.3|96.44|94.35|96.4|93.97|93.61|95.39|95.78|95.82|96.44|97.86|92.92|95.5|94.51|93.32|92.64|92.73|91.71|92.89|92.18|92.86|94.91|94.33|93.07|92.43|91.46|91.55|93.6|93.59|95.55|94.53|91.17|90.74|91.02|89.76|90.33|88.89|87.29|85.76|85.87|85.73|81.82|82.33|82.8|82.76|83.25|80.52|82.81|81.27|81.36|82.25|81.06|80.53|78.77|77.15|78.71|77.87|78.71|77.43|77.85|77.16|74.13|75.91|75.64|74.55|74.55|75.63|76.52|75.74|74.04|73.7|65.94|68.98|66.99|66.73|65.89|63.13|63.74|60.99|60.01|57.81|55.96|55.97|56.43|54.18|56.91|55.25|56.78|54.59|53.46|54.14|53.45|52.72|50.05|47.98|48.69|48.35|46.06|45.92|48.49|46.37|48.49|46.79|47.85|45.26|47.79|53.04|50.48|51.66|52.99|50.06|48.8|51.17|52.66|53.56|52.13|51.12|49.95|49.56|48.48|50.25|47.65|49.84|49.59|50.43|51.53|50.76|49.61|49.95|48.42|48.06|47.12|44.88|43.93|43.39|44.63|44.02|46|47.4|47.03|48.75|51.41|48.83|48.66|47.72|50.12|49.13|52.08|53.95|50.44|50.79|51.63|51.95|53.3|56.25|56.69|55.71|56.37|55.58|56.17|56.59|55.98|55.56|57.05|58.55|59.62|59.1|58.92|60.38|60.93|58.99|59.41|59.23|60.72|60.5|59.89|59.73|59.44|57.3|58.96|60.18|58.88|57.29|57.51|57.69|60.25|60.24|61.3|59.67|58|59.11|58.15|60.15|61.36|60.74|59.96|59.53|60.01|59.89|60.41|59.62|60.01|61.05|60.01|59.59|59.41|58.34|59.48|56.94|56.93|52.48|52.33|51.61|52.76|52.74|52.19|53.05|51.4|50.9|50.88|50.11|50.59|49.27|48.11|47.98|47.17|47.97|48.77|48.53|47.11|45.25|45.75|45.13|44.69|43.87|44.94|43.11|43.22|42.27|42.45|41.93|42.58|40.75|41|40.45|38.22|39.15|38.5|42.47|45.29|49.2|45.38|46.3|46.75|46.02|45.92|44.13|45.85|44.75|44.07|44.58|47.12|46.93|44.71|46.67|46.17|44.53|44.94|45.55|44.4|45.24|45.06|44.75|45.54|46.28|48.53|47.86|49.46|49.67|47.09|46.7|46.63|46.38|47.3|45.91|45.84|45.22|44.9|43.91|43.19|43.21|45.93|46.02|46.6|46.12|47.88|46.32|45.27|44.32|43.87|44.23|42.95|41.74|40.69|41.68|40.73|40.75|40.55|39.39|39.27|40.89|41.22|40.57|40.43|40.58|39.93|41.08|40|37.64|37.46|37.16|36.76|35.65|36.31|37.32|35.55|34.98|34.72|34.55|36.12|36.76|37.62|36.36|37.88|36.59|37.13|36.81|35.97|33.97|33.29|33.2|31.42|30.42|30.42|31.22|29.45|28.47|26.68|29.55|32.07|30.31|29.54|32.32|33.21|33.66|31.62|29.9|32.29|31.63|30.86|29.71|27.96|27.54|26.19|29.32|29.05|30.68|30.77|29.59|31.37|31.84|30.35|31.4|31.65|32.74|34.39|34.57|34.56|35.91|37.9|36.67|37.62|37.77|38.51|37.2|36.32|38.43|40.17|39.47|39.91|41.45|38.28|38.14|37.99|36.91|36.91|36.94|35.36|34.3|34.52|37.74|37.3|39.74|40.46|42.12|41.7|41.45|40.4|39.74|40.88|42.72|43.18|42.76|41.67|42.52|45.29|46.03|45.98|44.75|43.65|43.77|44.33|44.58|43.45|44.68|46.21|46.64|46.22|47.72|48.29|48.12|48.16|47.67|48.12|48.04|49.1|49|49.36|49.1|49.07|49.14|48.69|49.71|50.37|51.23|50.52|49.09|48.89|48.49|47.92|46.14|48|49.4|48.95|49.16|49.34|46.7|45.8|47.93|49.85|48.27|49.02|46.73|47.37|45.22|45.37|44.73|46.82|44.87|45.64|45.93|45.23|44.64|44.96|43.96|43.41|42.4|42.16|41.9|41.13|41.54|40.05|39.5|40.8|41.92|41.83|43.06|42.78|41.75|43.51|44.47|45.72|46.57|46.81|48.2|48.48|46.8|47.54|46.29|46.97|47.64|46.97|46.32|44.68|43.17|44.39|44.85|45.47|47.63|45.88|46.28|44.91|43.62|43.85|43.04|43.34|43.85|45.33|46.1|44.36|45.6|44.65|47.07|47.72|47.72|48.8|48.67|49.75|50.44|49.76|49.76|50.72|50.14|50.47|50.35|49.97|50.3|51.59|50.31|50.61|50.18|49.45|48.75|49.71|48.72|46.83|46.66|45.32|44.66|44.07|44.88|44.96|45.2|44.62|43.39|43.29|45.86|45.56|45.37|45.69|47.48|48.07|46.72|46.72|45.66|45.29|49.41|51.08|51.7|51.72|50.95|49.85|50.84|51.51|52.74|52.99|51.01|50.9|51.93|52.13|52.22|51.44|51.98|52.01|52.82|54.01|53.8|53.75|52.36|53.26|53.77|53.98|51.95|50.82|52.19|53.01|52.36|52.45|51.12|51.39|52.33|52.77|52.38|52.14|53.24|53.18|52.63|52.75|53.9|53.55|53.81|53.01|52.19|52.37|52.99|53.84|52.96|53.21|53.11|53.41|53.41|54.02|53.61|54.48|53.99|54.04|54|53.82|52.63|53.33|53.19|52.68|49.83|48.75|48.05|47.95|47.24|48.34|48.3|48.34|47.79|47.02|47.29|47|47.3|47.02|48.36|49.47|50.3|50.54|50.25|50.99|51.14|51.69|52.25|53.06|53.38|53.12|53.19|52.62|52.46|50.49|50.26|49.64|48.9|49.22|49.22|48.96|49.31|48.83|47.65|47.79|45.55|46.23|46.46|45.84|47.28|47.81|47.83|48.86|48.64|49.04|49.36|50.32|50.81|51.12|50.99|48.57|49.58|49.63|48.29|48.32|47.68|47.4|48.13|45.8|45.68|45.82|46.1|46.41|44.79|44.47|44.73|44.24|43.34|42.48|42.53|42.86|43.24|44.25|44.74|44.88|46.02|45.11|45.52|44.25|44.4|45.06|45.48|46.06|46.53|46.02|46.4|47.1|46.73|45.78|46.21|47.77|48.58|49.05|49.72|50.21|49.19|49.6|49.03|49.57|49.37|49.07|49.59|48.54|48.81|47.59|47.57|46.8|47.07|48.59|47.39|47.65|48.45|47.24|47.65|46.4|46.46|45.96|47.26|47.32|48.63|49.13|49.1|47.44|48.06|48.21|49.3|49.86|49.9|49.88|49.54|50.29|50.58|50.33|51.85|51.59|52.14|51.62|51.67|50.59|50.44|50|50.79|49.34|49.58|50.93|51.3|50.61|51.43|51.86|51.87|52.05|51.29|51.63|51.91|52.32|51.97|52.41|53.92|54.11|54.36|54.32|54.55|55.63|57.34|57.19|56.82|57.16|56.75|56.77|55.67|55.28|55.14|56.21|56.21|56.84|57.88|58.94|58.1|57.96|57.25|57.4|58.35|57.48|57.66|55.79|56.5|57.15|57.84|57.12|56.59|57|57.29|57.17|57.49|58.09|58.34|58.25|59.55|59.67|59.84|60.46|60.37|61.61|61.98|61.49|61.73|62.92|63.6|63.81|64.22|63.82|63.92|63.96|63.38|63.66|64.45|65.69|65.62|66.27|65.71|64.64|64.82|65.92|65.5|64.18|63.48|61.91|61.3|59.2|59.41|59.33|60.7|61.48|61.89|61.91|61.73|62.72|63.52|63.81|62.94|61.43|60.98|61.19|62.49|62.54|61.09|60.13|62.02|61.35|60.69|60.89|61.16|62.29|62.01|63.37|65.1|64.25|65.8|65.49|65.21|64.3|64.87|63.05|63.41|63.35|63.53|62.03|63.4|65.48|66.81|67.07|67.35|66.23|66.5|68.44|68.3|68.26|67.61|67.66|68|68.18|68.11|68.56|67.28|67.91|68.45|69.71|70.74|68.83|71.16|71.36|70.69|71.01|71.34|71.43|71.47|71.23|72.26|72.09|71.85|70.77|67.92|66.8|68.24|66.98|65.81|64.76|65.51|64.75|65.96|65.77|66.1|66.38|66.63|66.91|65.01|65.91|65.09|65.92|65.68|69.02|69.91|75.23|77.41|73.45|74.13|73.89|74.19|73.05|73.78|73.93|74.11|70.47|70.28|71.03|68.22|68.03|68.78|69.42|70.31|67.9|70.77|71.13|71.59|68.66|71.19|69.88|68.8|68.95|68.49|69.01|69.17|66.92|66.81|67.61|67.25|67.04|65.07|65.44|65.93|66.5|67.32|67.85|69.13|69.71|69.97|68.54|69.68|70.25|69.84|69.82|68.69|67.81|67.73|67.55|69.29|70.37|68.6|68.98|68.86|69.87|71.08|70.77|70.8|73.23|73.4|72.22|72.18|73.16|75.37|75.16|76.4|74.44|74.26|74.27|74.95|73.18|70.97|71.41|71.84|71.93|69.63|68.63|69.16|69.25|66.49|66.56|67.25|67.58|67|66.18|65.31|63.67|63.12|63.12|62.16|61.69|60.71|60.19|59.85|55.63|56.16|56.45|56.49|57.16|53.39|54.41|51.46|51.31|50.06|51.46|50.78|52.98|53.21|52.64|51.54|52.76|51.07|51.65|51.04|52.69|51.26|49.8|46.12|47.96|45.64|45.38|46.04|44.48|45.15|46.31|46.92|47.76|48.27|49.58|52.19|52.42|51.44|50.31|51.8|52.08|51.83|53.6|52.59|52.44|52.94|53.53|51.79|53.07|54.18|53.84|55.29|54.57|53.69|53.94|52.68|52.75|52.43|53.14|53.84|54.4|55.58|56.12|56.9|56.95|57.01|55.32|55.4|56.92|57.21|55.76|56.6|56.55|56.22|56.6|55.77|56.79|56.89|58.27|58.59|58.51|59.09|59.12|60.12|59.98|58.87|58.71|59.87|59.39|59.29|60.19|61.59|62.53|62.46|62.12|63.1|64.37|64.05|64.62|63.61|63.86|63.43|64.01|63.74|64.02|65.66|66.24|65.96|65.23|63.29|63.39|63.83|63.55|61.75|61.98|62.3|61.41|62.13|61.58|61.65|60.97|61.82|62.03|62.93|62.77|63.12|63.02|61.42|57.65|58.4|58.91|58.84|56.47|53.49|53.25|53.5|51.57|52.59|53.95|53.33|53.3|51.13|52.38|52.47|51.94|53.86|53.74|56.88|57.35|57.73|57.63|59.17|59.18|58.2|58.91|56|57.06|57.35|57.57|60.28|59.93|59.99|59.3|57.44|56.5|55.08|55.42|55.87|56.58|55.9|55.88|56.04|56.85|58.04|58.53|53.64|55.67|54.63|53.6|51.14|52.6|54.41|54.98|57.05|55.16|54.51|54.83|56.24|56.18|55.65|55.33|54.08|53.54|54.99|55.76|56.67|55.07|53.91|56.22|56.33|56.45|57.88|57.37|55.66|55.13|54.76|63.1|59.26|58.19|58.19|57.92|58.69|57.22|56.38|56.24|55.95|54.09|53.6|52.67|52.41|52.84|52.76|52.64|52.63|53.57|54.76|53.57|52.81|53.42|53.89|53.75|53.28|54.21|55.9|56.11|56.52|55.6|55.34|54.85|54.02|56.04|56.33|57.04|56.15|56.91|57.02|56.67|56.88|56.57|57.54|56.82|54.93|56.71|58.36|57.68|57.79|58.25|58.12|58.12|55.97|56.15|58.46|58.42|59.2|58.99|59.22|58.74|59.18|60.11|60.21|60.88|60.93|61.3|60.43|60.51|61.17|61.72|61.76|61.66|61.14|61.17|63|63.27|62.7|59.65|59.56|59.02|58.17|58.34|57.86|58.52|58.55|58.25|56.76|55.51|54.09|53.09|53.33|53.29|52.19|51.58|50.06|49.59|50.87|50.94|50.34|49.59|50|51.13|51.41|52.03|52.1|53.31|53.77|53.36|51.36|49.78|48.67|47.17|44.83|46.78|47.27|46.78|45.9|41.14|31.05|34.47|33.13|31.56|31.72|28.96|26.96|20.48|25.09|19.48|23.33|21.03|20.75|16.6|15.48|14.1|20.51|20.28|25.18|28.36|26.21|23.54|24.97|22.9|22.36|20.15|19.96|19.82|18.31|-36.98|8.91|13.64|15.06|15.99|12.17|12.4|15.04|19.23|19.72|20.47|24.56|23.88|23.68|24.73|24.02|25.76|25.37|27.4|29.44|31.83|32.3|33.56|34.3|33.49|34.7|32.8|33.67|35.57|35.49|36.88|37.33|37.42|39.49|38.17|38.98|39.54|36.43|36.24|37.07|38.26|37.91|38.79|39.72|40.6|40.4|37.91|38.66|38.53|39.67|39.27|39.88|40.57|40.51|40.59|40.91|39.64|40.56|40.06|40.3|41.2|40.74|40.55|40.83|41.76|41.88|40.99|41.23|41.46|40.89|41.13|39.85|40.1|40.83|41.67|42.25|41.93|41.16|41.94|41.53|42.6|42.26|42.05|42.89|42.89|42.91|42.62|42.32|42.44|43.17|43.21|42.88|42.96|42.61|42.76|42.76|41.39|39.69|36.87|38.05|37.25|37.33|37.23|38.29|40.17|40.99|41.09|39.26|39.55|39.92|40.11|40.06|40.47|39.03|40.05|38.51|36.9|39.12|40.52|39.82|41.04|40.44|39.22|40.03|40.86|40.84|40.7|40.69|41.37|39.88|40.46|39.73|38.39|39.34|37.27|35.94|35.64|36.6|37.44|38.97|38.56|36.97|40.05|41.18|41.23|40.9|39.93|41.14|41.24|41.64|41.57|41.99|42.91|44.71|45.58|45.2|44.54|45.23|45.65|46.23|45.72|45.64|45.48|46.76|46.59|47.02|47.58|47.86|48.34|49.04|47.79|47.02|47.94|48.18|47.5|47.85|48.24|48.35|47.47|49.78|50.45|50.63|52.14|52.15|53.08|52.81|53.47|52.25|52.87|53.16|53|52.28|52.78|52.61|52.81|52.26|52.16|53.55|54.77|55.67|56.19|56.8|57.95|58.34|58.69|58.22|59.5|60.07|61.09|60.4|59.12|61.67|61.66|63.21|63.43|61.55|60.54|59.7|61.33|63.81|66.08|65.03|64.02|64.45|66.02|65.59|65.36|64.82|64.55|59.95|61.43|61.48|57.75|61.12|58.47|60.93|61.49|60.55|59.19|61.41|58.73|59.34|59.77|59.61|59.29|59.7|60.2|63.15|63.42|63.16|63.33|62.61|61.34|61.45|62.18|62.02|63.03|63.81|65|63.5|64.46|65.72|65.63|64.73|64.96|64.92|65.31|65.96|63.82|65.32|66.24|65.49|63.28|61.95|63.61|66.13|66.27|66.41|66.87|66.31|67.8|68.79|68.81|69.57|69.21|70.11|69.9|70.34|71|70.94|72.06|72.03|71.06|71.64|73.64|73.15|73.11|73.31|74.21|72.98|73.14|73.52|75.33|75.37|73.62|72.22|72.98|74.56|74.21|75.24|73.06|71.67|71.76|66.45|67.32|70.26|72.15|72.24|72.15|71.68|72.37|73.62|73.93|71.31|70.64|68.19|69.1|68.26|66.56|68.33|69.3|69.12|68.36|67.44|66.5|65.36|63.69|62.25|65.65|67.5|68.54|67.42|68.84|69.28|68.43|68.63|70.07|69.34|68.49|69.36|68.26|69.82|70.54|70.53|72.59|72.69|72.09|70.41|70.51|72.37|73.43|74.18|75.54|75.44|75.06|75.22|76.01|77.68|79.17|77.66|78.46|79.55|80.64|80.75|80.67|81.43|82.39|82.62|83.19|84.4|82.64|84.53|84.64|85.64|82.66|82.78|83.5|84.08|83.91|80.82|78.88|81.25|81.96|84.12|81.23|81.47|80.87|80.85|80.76|78.32|78.92|76.11|76.74|78.32|78.32|69.88|66.14|65.44|66.6|66.39|69.62|71.94|72.43|70.87|71.71|71.19|70.57|70.89|72.34|70.93|68.69|71.1|72.82|73.89|75.49|76.01|76.58|76.83|75.33|75.99|77|77.83|79.47|79|78.11|81.17|82.51|81.97|83.82|85.42|86.84|86.29|85.16|84.48|86.61|88.33|87.61|87.67|89.16|88.22|88.16|90.17|92.27|91.25|89.32|89.57|89.83|93.1|95.52|92.07|93.83|91.78|91.26|92.11|92.14|92.77|91.68|96.13|103.66|110.74|107.69|115.77|119.26|123.64|108.81|105.93|109.31|103.22|96.42|94.85|102.97|104.69|112.14|111.03|114.89|114.2|116.2|107.55|104.25|107.81|100.53|99.32|103.29|101.98|96.39|96.05|98.35|94.22|100.52|104.26|106.84|108.24|102.54|102.56|103.89|102.86|99.6|102.62|101.96|105.47|104.59|105.18|102.53|107.84|108.17|109.72|103.08|99.74|105.5|106.15|110.52|114.07|112.31|109.67|112.21|112.63|110.32|112.55|112.88|116.19|114.96|114.38|115.26|116.88|118.97|118.41|119.55|121.94|121.52|120.73|120.92|118.92|115.32|117.56|109.56|110.49|106.22|105.75|109.07|111.44|113.66|111.65|107.76|110.3|101.55|100.31|104.62|106.78|106.09|97.69|98.44|97.79|99.59|104.48|106.12|104.45|98.44|97.71|99.83|97.74|100.03|99.11|101.31|96.59|97.14|93.25|91.29|91.77|93.52|93.18|94.68|97.02|94.86|92.24|89.23|90.85|93.2|93.55|93.42|96.46|95.52|93.33|93.63|97.4|92.08|90.09|87.09|87.29|87.35|82.5|84.04|87.27|88.18|87.84|88.88|85.72|85.57|86.15|84.69|83.38|84.02|79.07|77.17|78.91|82.61|81.78|79.91|84.05|86.87|88.22|88.9|93.07|91.6|89.75|87.83|89.59|86.1|86|83.29|86|86.02|85.47|86.12|86.93|89.39|89.06|87.85|86.54|88.36|90.06|88.14|92.58|91.8|88.8|85.79|86.52|89.14|85.85|86.87|85.62|81.69|80.07|79.74|80.83|77.93|76.45|77.1|77.96|80.48|81.06|79.86|76.83|74.21|71.93|71.3|71.05|72.96|75.44|77.14|75.89|74.19|75.05|75.92|78.17|77.68|79.57|79.45|78.89|78.43|80.16|76.87|72.82|73.61|73.77|74.69|75.11|77.46|78.32|79.9|80.25|79.53|80.31|81.27|81.62|79.86|79.78|80.64|79.73|77.97|78.95|76.34|75.87|73.4|74.11|77.17|78.47|78.04|79.74|80.14|79.08|78.57|78.45|76.31|76.28|73.95|75.26|76.19|75.57|76.88|77.57|78.05|79.62|80.39|77.45|76.56|75.6|76.55|74.68|71.18|67.38|68.15|66.61|67.56|69.4|70.71|69.77|69.22|72.87|73.12|72.95|74.32|75.68|80.4|80.7|80.69|80.7|79.79|81.54|83.26|82.16|82.58|80.93|80.85|79.18|77.27|77.86|78.64|77.05|74.33|74.77|76.78|75.65|71.71|68.62|68.52|71.32|73.13|73.68|72.53|70.81|70.02|71.07|70.85|72.78|71.82|71.57|71.81|72.87|74.37|71.68|72.35|69.45|68.11|70.09|71.76|72.14|71.71|72.52|71.28|70.16|67.08|69.39|68.22|70.61|71.81|70.94|72.55|69.22|68.91|69.09|67.68|69.54|69.85|70.66|69.71|71.78|71.76|73.91|73.05|74.87|75.77|76.86|75.44|74.17|75.76|75.4|75.65|77.06|78.81|79.76|79.11|80.17|80.55|81.8|81.37|79.5|81.56|82.76|81.94|82.94|84.35|82.81|83.17|82.5|81.06|79.4|80.43|81.25|80.71|80.25|78.91|79.52|80.47|80.65|81.14|81.64|83.55|85.52|86.74|87.55|86.87|87.51|87.3|88.87|88.59|90.13|90.83|91.47|91.16|89.2|89.56|90|89.68|91.43|93.67|91.65|90.77|88.81|89.26|84.32|82.3|82.83|85.89|83.7|82.87|87.67|86.65|86.66|88.35|89.35|89.12|85.49|84.58|86.07|83.8|86.04|83.03|81.64|81.05|83.04|81.19|81.54|77.96|75.85|76.34|78.86|78.9|77.15|73.5|76.47|78.1|78.35|76.8|74.83|74.46|76.09|77.56|75.66|73.7|72.73|71.95|68.98|69|70.87|70.95|68.27|69.09|71.21|71.05|72.16|73.23|73.87|73.59|73.29|75.84|74.31|72.02|71.89|70.62|72.97|72.38|74|71.06|72.43|71.57|72.15|72.94|72.63|72.79|74.32|73.69|75.26|74.72|75.48|77.91|78.45|77.25|78.3|76.28|74.36|72.72|73.21|73.83|74.26|76.67|77.26|77.34|78.28|77.09|78.47|79.65|78.72|78.89|79.64|77.6|78.53|79.8|79.44|79.22|80.9|79.67|79.11|80.08|79.81|78.96|78.87|78.51|80.67|82.16|81.94|83.68|84.39|82.79|81.99|81.1|82.41|82.41|82.15|83.96|84.54|85.95|86.22|87.37|87.69|87.24|86.04|86.98|85.79|86.46|86.21|86.15|83.58|83.5|83.79|83.82|84.17|84.09|84.92|85.38|84.26|83.49|80.7|80.59|79.65|80.1|79.97|80.57|80.86|79.81|80.71|79.62|80.23|80.85|81.66|81.39|80.66|79.15|77.47|78.48|80.9|80.24|78.96|77.97|75.26|74.27|75.08|76.52|76.53|78.75|78.88|79.56|79.61|79.41|81.33|82.67|83.34|81.71|82.63|81.97|82.19|83.04|82.83|84.7|84.09|85.19|84.44|83.63|82.78|83.39|83.92|83.49|83.22|81.92|84.16|84.17|81.43|81.25|78.24|78.78|79.43|78.58|77.27|76.17|79.36|77.74|74.99|74.46|74.6|76.68|77.64|78.28|81.45|79.81|78.47|79.66|78.05|75.82|75.27|72.76|73.72|75.82|78.4|76.5|75.49|76.9|74.52|71.28|70.11|70.09|68.58|69.65|66.73|68.25|69.89|69.59|71.1|72.16|71.87|72.86|72.72|71.33|72.34|70.42|68.28|68.72|68.75|70.41|70.74|74.33|74.93|77.76|74.26|73.85|76.46|76.11|71.22|70.97|71.26|69.78|71.16|72.84|71.37|70.58|72.02|67.65|67.48|68.91|69.58|69.81|71.83|72.26|71.98|72.69|70.69|68.43|68.76|68.99|67.33|69.46|69.75|69.25|70.39|71.68|69.41|69.05|69.03|68.26|68.35|70.15|68.81|68.58|68.58|68.65|68.85|70.57|70.25|71.54|71.03|70.31|70.8|70.1|69.71|69.5|70.87|70.38|71.28|71.73|72.44|73.79|74.64|74.31|74.99|73.99|77.27|79.57|78.2|80.73|79.35|78.56|76.79|76.12|75.03|74.97|73.51|74.15|72.94|73.1|72.84|73.52|73.04|71.39|70.97|71.32|72.73|73.67|71.72|71.66|71.05|72.21|72.58|72.88|70.72|71.06|69.15|68.87|70.62|69.97|68.63|68.47|66.58|66.62|67.29|66.31|66.52|67.65|66.82|67.43|67.84|67.49|67.4|68.55|68.52|69.46|69.48|70.05|70.3|69.74|71.87|71.61|72.12|67.43|62.42|61.05|60.04|62.63|60.57|61.91|61.99|61.74|62.88|65.07|63.48|64.6|62.64|63.55|63.85|63.3|61.84|59.55|60.59|59.67|58.5|60.42|59.42|61.25|62.37|63.32|65.04|64.48|63.03|63.84|63.98|63.97|62.93|62.55|62.89|61.61|62.54|61.66|61.46|63.27|64.1|63.57|64.06|65.3|65.99|65.66|68.91|68.73|73.84|72.53|75.62|75.89|75.72|69.36|65.45|65.98|66.44|66.66|66.3|66.64|68.66|68.13|69.16|69.55|69.61|67.78|69.63|68.19|67.76|67.13|68.76|68.53|68.39|67.56|66.05|67.16|66.38|67.81|70.27|71.09|70.36|68.39|67.33|66.2|65.38|64.9|64.94|65.03|64.22|63.68|64.99|63.78|64.51|63.38|64.19|64.56|64.08|65.18|63.6|64.49|64.96|64.36|65.95|64.36|63.81|62.22|62.6|62.97|64.01|62.71|63.02|63.66|64.89|64.41|63.91|63.02|62.99|63.76|65.4|65.51|66.5|64.27|63.17|62.59|61.28|61.65|62.49|62.52|63.37|62.36|59.75|59.52|59.08|58.29|58.3|58.34|58.66|59.3|62.44|62.27|62.13|60.97|61.26|61.36|61.75|61.79|61.38|60.4|60.24|60.54|60.94|59.3|59.54|60.87|60.66|61.51|60.27|60.07|58.86|59.11|58.25|58.81|58.58|59.47|58.81|59.09|59.82|60.23|59.04|58.4|58.67|57.76|57.61|56.97|55.44|56.07|56.22|56.8|58.18|58.55|58.72|56.6|57.89|57.79|57.26|57.21|58.1|56.97|56.01|57.74|58.96|59.39|60.85|61.84|59.13|59.4|60.3|60.38|59.24|60.7|60.46|62.04|62.75|64.77|64.5|61.6|62.62|64.56|62.9|63.77|64.53|64.2|64.8|63.08|63.05|62.53|65.33|66.66|66.69|66.36|65.62|65.3|65.1|66.96|71.13|74.48|74.58|80.88|90.77|94.65|83.71|86.8|95.61|98.48|93.39|96.01|96.12|96.11|98.71|89.33|93.18|91.51|96.18|101.26|104.69|102.86|101.9|113.23|114.01|114.58|96.17|99.62|98.34|100.72|93.07|93.04|96.46|85.91|91.06|93.64|94.76|99.27|98.42|99.89|103.45|110.47|108.64|105.38|109.76|105.66|98.75|98.38|98.87|101.56|105.78|104.52|104.66|108.99|112.25|112.09|101.69|100.2|100.35|97.63|92.35|92.65|91.16|95.96|97.47|99.76|96.83|94.32|95|91.9|93.68|91.58|88.62|84.65|79.8|80.65|80.35|78.94|74.62|71.42|72.67|70.3|71.87|70.56|69.74|69.73|69.6|71.53|74.56|73.15|72.45|79.2|80.44|80.73|80.03|83.43|84.38|86.04|87.66|93.08|91.74|84.25|80.91|86.08|85.15|86.16|81.96|77.33|76.78|78.88|79.77|83.76|84.77|84.97|82.77|83.99|86.04|86.48|87.28|89.75|87.21|86.34|83.9|83.46|84.81|84.57|87.03|91.48|92.15|92.55|92.69|94.21|97.26|103.57|101.27|102.42|107.02|103.62|103.21|101.44|96.97|96.41|93.38|95.88|85.23|99.37|96.16","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-9d2e776b","guard":[["not",["hasAny",["068","10054","1025","10277","1034","10348","1054","10556","1066","1069","1073","1084","110842","111","1138","114","1147","1157","1179","1198","1213","1241","1245","1254","1272","1276","1306","1347","1348","1368","1529","161877","1668","1676","1688","1718","173","1794","22075","2269","2273","2453","249","2529","2536","2541","2574","2704","2748","2796","2808","2836","2864","2902","2903","2915","2948","2966","2983","2998","3038","3108","3118","31541","3159","3166","3169","3175","3195","3203","3207","3242","3261","3271","3384","3442","3454","3469","354","3562","357","3591","365","366","377","3826","38925","392","396","3965","397","4044","4066","41","41083","4137","4158","4196","4217","4227","4234","4242","4295","4324","4371","4404","4451","4472","4474","4512","46595","466","4667","468","469","4739","4804","48192","4942","4948","497","5012","522","5347","541","5412","5413","557","5596","5609","5655","5699","577","5773","57787823777911655","578","5804","5829","6004","6174","6212","6271","6283","6364","6368","6389","641","6473","6476","6516","6523","65294","6575","65942","66109","663","66551","66684","66705","66713","67206","673","6737","67564","67711","67948","6813","6817","68296","6957","696","6998","7131","7134","7163","71734","73529","73543","7441","753","75369","754","756","7603","7617","7631","7663","7666","768","769","77225","7758","7771","7784","7923","79467","7948","7952","7961","7992","8052","8105","8175","8249","8535","854","8587","8736","875","8763","8785","8796","892","8994","9102","9142","9169","92374","9243","92747","9356","9405","9413","94704","9472","9507","9516","9608","96548","96875","969","9694","97","9716","97175","9778","9798","9897","992","9966","9967","bulk","release","title","wreck"]]]],"pyramid":["render.template",{"lit":["The date ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"date"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"}],{"lit":1}],{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"},{"lit":"date"}]],"mem":null},
{"id":"n-5c9b394c","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the date of 13.25":"The date of 13.25 is 1986-03-19.","the date of 18.98":"The date of 18.98 is 1987-11-10.","the date of 62.7":"The date of 62.7 is 2020-01-07.","the date of 40.84":"The date of 40.84 is 2020-10-15.","the date of 49.31":"The date of 49.31 is 2017-04-28.","the date of 13.15":"The date of 13.15 is 1986-06-04.","the date of 78.75":"The date of 78.75 is 2024-06-10.","the date of 77.86":"The date of 77.86 is 2023-04-21.","the date of 104.83":"The date of 104.83 is 2008-04-02.","the date of 78.11":"The date of 78.11 is 2022-01-10.","the date of 94.09":"The date of 94.09 is 2013-04-29.","the date of 64.49":"The date of 64.49 is 2025-08-27.","the date of 24.1":"The date of 24.1 is 1999-09-15.","the date of 62.2":"The date of 62.2 is 2006-12-06."}}},
{"id":"n-e1a2cdc6","guard":[["not",["hasAny",["068","10556","110842","1157","1347","161877","1794","20200211","20201125","20201127","20201130","20201217","20211119","20211216","22075","2574","2808","2836","3038","3118","3159","3166","3169","3195","3203","3261","354","3826","4044","4066","4158","4217","4295","4371","5012","5347","541","5412","5413","5609","5655","57","5773","57787823777911655","5804","6004","641","6476","6516","6523","65294","6575","66713","6817","696","7134","7163","73543","75369","7617","768","769","7784","79","79467","7948","8105","8736","8796","892","8994","9169","9405","9507","9516","96548","969","9716","9778","9897","9967","add","affair","airdate","angeles","c","category","china","close","compare","confirmed","country","dividend","ep","explorer","firefox","gcd","gender","gmsl","hailer","lesbian","march","month","mortality","name","national","observations","phoenix","pm","price","rate","recovered","rivernorthdoubleline","sa","season","songs","sp500","sum","title","trend","year"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"}],{"lit":1}],{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"},{"lit":"date"}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-11496be7","guard":[["not",["hasAny",["068","10556","110842","1157","1347","161877","1794","22075","2574","2808","2836","3038","3118","3159","3166","3169","3195","3203","3261","354","3826","4044","4066","4158","4217","4295","4371","5012","5347","541","5412","5413","5609","5655","5773","57787823777911655","5804","6004","641","6476","6516","6523","65294","6575","66713","6817","696","7134","7163","73543","75369","7617","768","769","7784","79467","7948","8105","8736","8796","892","8994","9169","9405","9507","9516","96548","969","9716","9778","9897","9967","release"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.join",["know.find",{"lit":"corpora-fruits"},{"lit":"item"}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]],["sense.after",{"lit":"date"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"}],{"lit":1}],{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"},{"lit":"date"}]],"mem":null},
{"id":"n-585e4454","guard":[["not",["hasAny",["068","10556","110842","1157","1347","161877","1794","22075","2574","2808","2836","3038","3118","3159","3166","3169","3195","3203","3261","354","3826","4044","4066","4158","4217","4295","4371","5012","5347","541","5412","5413","5609","5655","5773","57787823777911655","5804","6004","641","6476","6516","6523","65294","6575","66713","6817","696","7134","7163","73543","75369","7617","768","769","7784","79467","7948","8105","8736","8796","892","8994","9169","9405","9507","9516","96548","969","9716","9778","9897","9967","release"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-fruits"},{"lit":"item"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],["sense.after",{"lit":"date"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"}],{"lit":1}],{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"},{"lit":"date"}]],"mem":null},
{"id":"n-90b5d423","guard":[["not",["hasAny",["068","10556","110842","1157","1347","161877","1794","22075","2574","2808","2836","3038","3118","3159","3166","3169","3195","3203","3261","354","3826","4044","4066","4158","4217","4295","4371","5012","5347","541","5412","5413","5609","5655","5773","57787823777911655","5804","6004","641","6476","6516","6523","65294","6575","66713","6817","696","7134","7163","73543","75369","7617","768","769","7784","79467","7948","8105","8736","8796","892","8994","9169","9405","9507","9516","96548","969","9716","9778","9897","9967","release"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"corpora-fruits"},{"lit":"item"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],["sense.after",{"lit":"date"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"}],{"lit":1}],{"lit":"fr-oil-prices-wti-daily-2229a9"},{"lit":"price"},{"lit":"date"}]],"mem":null},
{"id":"n-00cebe5d","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 104.62":"The date of 104.62 is 2022-07-07."}}},
{"id":"n-0d830e4a","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 24.1":"The date of 24.1 is 1999-09-15."}}},
{"id":"n-18579f77","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 53.5":"The date of 53.5 is 2019-06-04."}}},
{"id":"n-18596400","guard":[["has","date"],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 62.7":"The date of 62.7 is 2020-01-07."}}},
{"id":"n-24e9050c","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 49.31":"The date of 49.31 is 2017-04-28."}}},
{"id":"n-26e03d2f","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 70.27":"The date of 70.27 is 2025-07-29."}}},
{"id":"n-311100c2","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 88.14":"The date of 88.14 is 2022-11-03."}}},
{"id":"n-31301866","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 79.84":"The date of 79.84 is 2009-10-29."}}},
{"id":"n-3cc79183","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 92.09":"The date of 92.09 is 2007-10-25."}}},
{"id":"n-45b1a15d","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 15.68":"The date of 15.68 is 1986-11-14."}}},
{"id":"n-520f8fa1","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 22.21":"The date of 22.21 is 1987-08-03."}}},
{"id":"n-528f8ffe","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 118.71":"The date of 118.71 is 2008-08-05."}}},
{"id":"n-5a0e503e","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 62.2":"The date of 62.2 is 2006-12-06."}}},
{"id":"n-6d3f650b","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 80.83":"The date of 80.83 is 2022-11-22."}}},
{"id":"n-6e1a9bde","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 45.6":"The date of 45.6 is 2016-09-26."}}},
{"id":"n-7d2f80fb","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 77.86":"The date of 77.86 is 2023-04-21."}}},
{"id":"n-7f7f3621","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 29.37":"The date of 29.37 is 2000-02-17."}}},
{"id":"n-8770fd08","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 53.92":"The date of 53.92 is 2017-10-27."}}},
{"id":"n-8debd6ec","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 74.95":"The date of 74.95 is 2018-10-09."}}},
{"id":"n-90970096","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 36.43":"The date of 36.43 is 2020-06-11."}}},
{"id":"n-ab186cf8","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 18.98":"The date of 18.98 is 1987-11-10."}}},
{"id":"n-acdd88de","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 94.09":"The date of 94.09 is 2013-04-29."}}},
{"id":"n-aec589c5","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 104.83":"The date of 104.83 is 2008-04-02."}}},
{"id":"n-bc72d3b9","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 46.81":"The date of 46.81 is 2016-08-17."}}},
{"id":"n-bd5c6028","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 13.15":"The date of 13.15 is 1986-06-04."}}},
{"id":"n-bdbbae92","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 41.07":"The date of 41.07 is 1990-10-11."}}},
{"id":"n-c349a74a","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 56.08":"The date of 56.08 is 2007-01-08."}}},
{"id":"n-c7eb950a","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 78.75":"The date of 78.75 is 2024-06-10."}}},
{"id":"n-cab792c0","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 80.69":"The date of 80.69 is 2023-04-05."}}},
{"id":"n-ce17ac10","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 47.03":"The date of 47.03 is 2015-03-24."}}},
{"id":"n-d204cb63","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 13.25":"The date of 13.25 is 1986-03-19."}}},
{"id":"n-d24fc99c","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 64.49":"The date of 64.49 is 2025-08-27."}}},
{"id":"n-d71b402f","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 40.84":"The date of 40.84 is 2020-10-15."}}},
{"id":"n-da2770bf","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 89.34":"The date of 89.34 is 2011-09-07."}}},
{"id":"n-e2ccdf51","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 37.27":"The date of 37.27 is 2020-10-28."}}},
{"id":"n-e732bf93","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the date of 78.11":"The date of 78.11 is 2022-01-10."}}},
{"id":"n-e77b7d0d","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 93.59":"The date of 93.59 is 2014-09-25."}}},
{"id":"n-f157b821","guard":[["hasAny",["date","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the date of 47.32":"The date of 47.32 is 2017-09-01."}}},
{"id":"n-f327620d","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 40.1":"The date of 40.1 is 2020-07-31."}}},
{"id":"n-f4ef164b","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the date of 55.6":"The date of 55.6 is 2019-10-28."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the date of 13.25","expect":{"contains":["1986-03-19"],"notRefusal":true}},{"q":"tell me the date of 46.81","expect":{"contains":["2016-08-17"],"notRefusal":true}},{"q":"name the date of 45.6","expect":{"contains":["2016-09-26"],"notRefusal":true}},{"q":"what is the date of 18.98","expect":{"contains":["1987-11-10"],"notRefusal":true}},{"q":"tell me the date of 80.83","expect":{"contains":["2022-11-22"],"notRefusal":true}},{"q":"name the date of 47.03","expect":{"contains":["2015-03-24"],"notRefusal":true}},{"q":"what is the date of 62.7","expect":{"contains":["2020-01-07"],"notRefusal":true}},{"q":"tell me the date of 53.5","expect":{"contains":["2019-06-04"],"notRefusal":true}},{"q":"name the date of 74.95","expect":{"contains":["2018-10-09"],"notRefusal":true}},{"q":"what is the date of 40.84","expect":{"contains":["2020-10-15"],"notRefusal":true}},{"q":"tell me the date of 80.69","expect":{"contains":["2023-04-05"],"notRefusal":true}},{"q":"name the date of 88.14","expect":{"contains":["2022-11-03"],"notRefusal":true}},{"q":"what is the date of 49.31","expect":{"contains":["2017-04-28"],"notRefusal":true}},{"q":"tell me the date of 15.68","expect":{"contains":["1986-11-14"],"notRefusal":true}},{"q":"name the date of 47.32","expect":{"contains":["2017-09-01"],"notRefusal":true}},{"q":"what is the date of 13.15","expect":{"contains":["1986-06-04"],"notRefusal":true}},{"q":"tell me the date of 55.6","expect":{"contains":["2019-10-28"],"notRefusal":true}},{"q":"name the date of 29.37","expect":{"contains":["2000-02-17"],"notRefusal":true}},{"q":"what is the date of 78.75","expect":{"contains":["2024-06-10"],"notRefusal":true}},{"q":"tell me the date of 92.09","expect":{"contains":["2007-10-25"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
