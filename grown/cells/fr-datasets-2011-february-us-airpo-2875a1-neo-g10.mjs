// fr-datasets-2011-february-us-airpo-2875a1-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"fr-datasets-2011-february-us-airpo-2875a1-neo-g10","class":"fr-datasets-2011-february-us-airpo-2875a1","generation":10,"lane":"neo","grownFrom":["what is the state of Pasco","tell me the state of Oakland","name the state of Montrose","what is the state of Mosinee","tell me the state of Manhattan","name the state of Eagle","what is the state of Sarasota","tell me the state of Austin","name the state of Telluride","what is the state of Tallahassee","tell me the state of Kalispell","name the state of Gunnison","what is the state of Dallas","tell me the state of Dubuque","name the state of Bellingham","what is the state of Midland","tell me the state of Asheville","name the state of Columbia","what is the state of Des Moines","tell me the state of Dothan"],"version":1});

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
knowLoad([{"id":"crypto-tickers","columns":["crypto ticker"],"n":11071,"cols":[{"f":"0A2A|14|2M|151|2T|1A|2A|2B|3L|2C|2G|2PX|2RT|2ST|2T|2VE|2Z|1BA|2BC|2C|3C|3D|2EL|3Y|2IC|2J|2L|2O|3ND|2R|2T|2X|2Y|3SS|1C|23|2A|3T|4O|2CEL|3N|2D|3C|2E|3N|3S|3T|4H|2H|3C|2ID|2K|2M|2N|2OIN|2P|3T|2Q|2RE|3IA|2S|2T|3A|3IN|3N|2U|2X|3T|2YC|1D|2A|3B|3I|3O|3PAD|3T|3X|2B|2C|3O|2D|3AMS|3Y|2EL|2F|2H|2I|2K|2L|2M|2N|3T|2O|3GE|3N|2P|2R|3X|2S|2T|2UX|2VT|2X|3X|2Z|1E|2C|2G|3GS|3IS|2LIN|2N|3S|3T|2ON|2R|3GO|3M|3O|2S|2T|3H|4C|2UR|2VO|3UM|1FB|2C|3T|2EN|2FC|2G|2IN|3T|2K|2NTY|2O|2P|2RO|4X|2TT|2X|2YON|1G|28|2A|3TA|2B|2ET|3UR|2F|2I|3V1|3X|2LA|3D|2M|2N|2O|3N|3V|2PC|2RO|3S|2S|2T|2V|3C|3E|2X|1HOO|2T|1I|2AI|3T|2B|3B|3K|2C|3O|4DE|4RE|2D|3I|3OC|4G|5E|3T|3US|2E|3N|2G|2I|2LINK|2M|3BOT|3EE|3S|3X|2N|3N|3U|2ON|4E|3T|3Z|2PAD|3E|4PE|3G|3IN|2R|3E|3I|3T|3X|2S|3HIB|2T|3ECH|4K|3K|3N|3RA|3T|2US|2X|1JNA|1K12|2A|2I|3TA|5X|2N|3C|2RO|2T|3IO|1LA|2BEDO|3T|2C|3E|3H|4E|3X|2D|3IN|2EPH|3X|2F|2G|3B|3O|2H|2I|3AS|3C|4E|3EN|3F|3NK|3S|3T|4A|3X|2KI|2LBI|3EY|3IN|2M|3E|2N|2OHA|3T|2P|3A|4CA|3H|4A|5C|4R|3INE|3S|2T|3A|3B|3COM|3D|3MAN|2U|3SD|3X|2V|3A|2WAYS|2X|2Y|1M|2A|3L|3PT|3TEN|2B|3ER|3T|2DC|3G|2E|2F|2G|2IO|3S|2KT|2LT|2M|3O|2N|2O|3GUS|3N|3S|2P|3L|2S|2T|2U|2V|2X|2Y|2ZE|1NA|3L|4OS|2B|2C|3P|3T|2D|3C|3X|3Y|2GEL|3L|4E|3O|2I|3M|4A|2J|3I|2K|3R|2ML|2N|2ON|2RX|2S|3R|2T|3C|3E|4X|3I|4S|3S|2US|2V|2W|2Y|1OG|2K|2P|2S|1P|2AD|2C|3G|2E|3D|3X|2FC|2H|2I|33|3NG|3S|3X|2L|2M|2N|2OD|3LLO|2P|3C|3LE|2RIL|3S|2S|2T|3OGE|2U|2W|2X|3P|3T|2Y|3S|2Z|1QT|3IS|2U|3A|4C|4P|4RI|1R|2A|3TA|3W|2B|3I|4T|3S|3T|3UZ|2C|3A|4DE|4NE|4S|3H|4A|4L|3O|4NA|3T|3X|2DR|3X|2E|3A|3N|4A|3PA|3S|2G|3O|4N|3US|2I|310|3A|420|3X|2K|3EN|4R|3I|3M|3N|2M|3A|3OR|3R|3S|2NA|3M|3O|3X|4M|2O|3N|3R|2PA|4C|2Q|2R|3O|3R|2SL|2T|3C|3E|4M|4ON|4Q|4X|3F|3G|3H|3I|4I|3L|3M|3P|3R|3T|3Y|2V|2W|2X|2Y|1S|2A|3FE2|3N|3P|2C|2D|3EX|2EED|2G|3C|2H|2IA|3MI|2K|3O|2M|2N|3T|2P|3C|3O|2QT|2R|2S|3A|4RA|3T|2T|3A|3O|4N|3R|4A|5L|4O|5C|3X|2UNA|2VA|2W|2Y|1T|2A|2B|2C|3C|2D|2ECH|3M|2F|3I|3S|2H|3E|2ID|2K|3N|2L|3AS|3X|2M|3A|3C|3I|3OS|2N|3T|2OLO|3M|3N|3R|3Z|2P|3AY|2R|3I|3NO|2S|2T|3R|2X|1U|2A|2C|3O|2DC|3F|3IO|3T|3X|2K|2N|3IT|2PC|2R|3A|3O|4RA|4S|3S|3UM|3Y|2SCM|3D|4C|2T|3O|4N|3UMN|1V|2A|3I|3L|4ON|3O|3T|4AR|4LY|3V|3X|2DO|2E|2G|2H|2I|3NOC|3VE|2L|2ME|2N|2O|2R|2S|2T|3M|2XL|3T|1WAX|2C|2M|2NEX|2O|3RK|2R|2S|2T|2X|1X|2C|2E|3L|2GT|2IAL|4V3|3OM|3S|4T|2L|3INU|2N|3T|2PR|2R|2S|3V1|2T|2YS|1YA|1Z|2A|3RT|2BI|2ERO|2IT|2R|2U|3KI|3M|2Y|0B1P|120|21|26|2G|2M|2X|13|191|1A|2AS|2BI|3L|3Y|4FB|4TK|4X|2C|3K|3OIN|4N|2D|3GER|2FC|2G|3S|2I|2JU|2K|3AC|3E|4D|3T|2L|3A|3D|3IN|3LZ|3PHA|3TO|2M|3A|3BOO|2N|3ANA|3C|4A|3D|4EX|3G|3K|3NER|3US|2O|3E|3S|2R|3A|3C|3K|3T|2S|3E|4AI|4D|3H|4C|4OS|3IC|4D|4S|3K|3T|2T|3H|3S|2X|3S|2Y|2ZED|1B|21|2ANK|2B|2C|3C|3G|3T|2DC|3T|2F|3T|2G|3C|2I|2K|2L|2N|2O|3S|2P|2R|2S|2T|3C|3F|1C|2A|3C|3P|3T|3U|2B|2COIN|2D|3N|3T|2EO|2F|2G|2H|3A|3C|3T|2I|3O|3TY|2L|2MC|41|2N|3A|3T|3X|2O|3IN|3Q|2P|3T|2R|3O|2S|2T|2UBE|3G|2V|3B|2X|2Y|2ZERO|1D|2AY|2B|2C|3C|2G|2ID|2L|2OG|3T|2P|3I|2R|2X|2Y|1EA|3CH|3I|3M|4MW|3N|4S|3ST|3T|2BE|2C|3H|3O|2D|2E|3P|3R|3T|4LE|4S|2FE|3I|3TM|3X|3Y|2G|2L|3A|3R|3T|2M|3D|2N|3D|4OG|3G|3JI|3T|3V1|3X|3ZI|2P|3E|3R|4O|2RN|3RY|2S|3A|3T|4C|2TA|3BOX|3F|3H|4ER|3R|3S|3T|3U|2X|2Y|3OND|2Z|3OGE|1F|2C|3H|2DT|2EX|2G|2HT|2I|3C|2LOKI|3Y|2T|3C|2X|1GB|3P|2C|2G|2LD|2ONE|2PT|2S|2VT|1HAO|3T|3X|2BD|2C|2IG|3RE|3VE|2O|2P|3C|1IAO|2B|3I|3L|3O|2C|3O|3S|2D|3AO|3COM|3EN|3I|3P|3R|3Z|2FI|4F|2G|3HAN|3SB|3UP|2H|3U|2IS|2KI|2LL|2M|2ND|3EM|3GO|3O|3S|3TEX|3U|2O|3B|3C|3FI|3P|3S|3T|2P|3C|3X|2R|3B|3D|2S|3KIT|3T|2T|316|3AIR|3B|3C|4AR|5T|4CA|4I|4M|4NY|3F|3G|3HER|3L|3M|3N|4EW|3O|4K|4RB|3RA|4UE|3S|4D|4Z|3T|4O|3USD|3X|3Z|2UT|2VE|2X|3B|3I|2ZA|3Z|1J|2K|1KBT|2C|2ING|2K|2N|2PT|2R|3W|2S|2T|2X|1LA|3CK|3DE|3NK|3S|4T|3ZE|5X|4R|2C|3T|2D|2ENDR|3RF|3S|2F|2HC|2I|3D|3N|4K|4U|3TZ|5P|2K|3C|3D|3S|2N|3M|2OB|3C|4K|5N|5S|4M|4X|3K|3ODY|4MT|3X|2P|2RY|2S|3T|2T|3C|3G|3V|2U|3E|4M|4S|3I|3R|4T|3T|2V|33|2WA|2X|3M|2Y|2Z|3D|3E|1M|2AGA|3RS|2BO|2C|2DA|2E|3X|2F|2G|2H|2I|3C|2K|2ON|2P|2T|2W|2X|3T|3X|1NA|3NA|2B|3CAT|4H|3DOG|3H|3P|3TC|3X|2C|2D|2F|2IX|2K|2N|2P|3L|2R|3TX|2S|3D|3OLD|3X|2T|3E|3N|3Y|2U|2X|1OA|3I|3RD|3T|2BA|4I|3C|3O|3S|3T|2C|2DA|4V2|3EN|3HI|3O|3YP|2E|2G|3EY|2JAK|3I|2K|3I|3U|2LD|3I|3T|4T|2MB|4C|4M|3E|42|4OW|4S|3K|2N|3A|3D|4LY|3E|4S|3IX|3K|4H|3O|3TE|3US|2O|3B|3FI|3K|3M|3NS|3P|3ST|5O|3T|2R|3A|3ED|3G|3ING|3K|3UTO|2S|3E|3ON|5C|3S|3T|3U|2T|3C|3S|3TO|3X|2U|3NCE|3TS|2W|3E|2X|3ETH|3T|3X|3Y|2YS|2ZO|1P|2AD|3Y|2D|2EPEF|3T|2INKY|2L|3C|2N|2RIVA|3O|2S|2T|3C|2X|1Q|2C|2QQ|2T|3X|1R|234P|2ACE|3IN|3NA|4D|3T|4T|3Z|2C|3P|3T|2D|3D|3G|2EE|4D|3PE|3TT|5A|3W|2G|3E|3X|2I|3A|3C|4K|5S|3DGE|3GHT|3K|3SE|3T|4TO|3UM|3X|2K|3L|2MV|2N|3K|3X|2O|3CK|3GG|3NZ|2RR|2T|3R|3X|2UNE|3SH|3V|2WL|2X|2Y|3LL|2Z|3E|3N|1S|2AFE|4U|2B|2C|3H|3M|3PAD|5Y|3S|3V|2E|3ND|2FM|2G|3G|3S|2HARE|3IB|2I|2KT|2L|2OL|3V|2P|3M|3T|2R|2SB|2T|3AR|3C|3K|3N|3S|3Y|2V|2W|3AP|2X|2Y|3S|1T|21|22|2A|3D|3F|3MA|2B|3L|3S|2C|32|3A|4S|4T|3B|4R|3C|3D|3E|4X|3F|3GO|3H|4D|3INU|4X|3K|3L|3M|4T|3N|3P|4AY|4X|3R|4ED|4Y|3S|4T|3T|3US|3V|4B|3Z|2D|3X|2E|3X|2F|3A|2G|2H|2K|2L|3C|2M|3G|3I|3K|2NT|4V2|3YX|2O|3P|2P|3L|2Q|2R|3FLY|3L|3M|3N|3S|4T|2S|3C|3E|3G|2T|3F|3OLD|3R|3Y|2U|2V|2W|2X|3C|2Y|3C|2Z|3C|3N|1U|2B|3O|3U|2C|3K|4S|2D|3DHA|3G|2FF|4ET|2GG|3S|2ILD|2K|2LL|4C|4S|5H|2MN|3P|2N|3DL|3I|3NY|2RGER|3N|4NY|4S|4Z|3P|3RRD|2SD|4C|3Y|2T|2X|2Y|3I|2ZZ|1V3A|2C|2M|2ND|2O|2T|1WB|2F|2J|2K|2N|2O|2S|2T|32|2X|1X|2A|2BT|2C|2F|2H|2K|2MI|2R|2T|3B|2X|2Y|1YC|2G|2TE|4S|3HER|3S|3Z|1Z|2ENIQ|2KY|2L|2NT|2R|3X|2X|2Z|3ONE|0C2|20|25|2H6|2X|13|198|1A|2AVE|2B|3O|3S|2CH|4E|3TUS|2DC|3INU|3N|3X|2F|2G|3A|2H|2I|3D|3R|3Z|2KE|4W|2L|3C|3I|3L|3O|2M|3C|3EL|3LY|3P|2N|3CER|3D|4Y|3N|3TI|4O|3YA|2PD|3O|3P|3S|3T|3V|3Y|2R|3AT|3BO|5N|3D|4S|3E|4S|3O|3PE|3R|4OT|3T|2S|3H|4T|3INU|4O|3PER|3T|4LE|2T|3AI|3BOY|3C|4EO|4H|3E|3HAT|3MAN|3O|3PAY|3S|3T|3WIF|3X|3Z|2U|2VA|4DA|3E|3O|2W|3CEO|1B|2ABY|3NK|3T|2C|2D|3C|3G|2E|3T|4H|2FT|2G|2IXP|2K|2M|2NT|2OT|2P|2RL|3T|2S|3L|3N|2T|2U|3CKS|3K|2X|2Y|1C|210|2A|3KE|3R|3SH|2C|3X|2D|2E|2GDS|2H|3G|2I|3N|2L|2N|2O|3IN|3MM|4P|3S|2P|2RB|2T|3N|2V2|2X|3C|3X|1DAI|2EX|2L|2N|2OGE|2PT|2RX|2T|2X|2Y|1EDEX|2EK|2FS|2JI|2L|3EB|3L|3O|3R|3T|2M|2N|3NZ|3T|4RA|3X|2RE|4S|2SC|2T|3H|3I|3US|2UR|2X|1F|2C|2D|2F|2G|2I|2L365|3ASH|3O|2T|3Y|2X|3Q|3T|1GA|2G|2L|3D|2O|2PT|2S|2T|2U|1HA|3D|4S|3IN|3L|3MP|5Z|3N|4CE|4GE|3O|3PZ|3RM|4S|4T|3SH|3T|2B|3R|2C|2D|2ECK|5R|3DDA|3EL|4MS|4SE|3Q|3R|4RY|3SS|3X|2FN|3T|3U|3X|2H|2I|3CA|4KS|3EF|3HUA|3I|3LD|4I|4L|3NU|3P|4S|3RP|2K|3N|2LT|2MB|3PZ|2N|3G|2O|3KE|3NK|5Y|3OF|3PPY|3W|3Y|2P|2R|3P|2S|3B|2T|2UB|3CHU|4K|2VF|2W|2X|2Y|2Z|1IC|2F|2M|2N|3D|3NI|3U|3X|2OTX|2PHC|2R|3C|4LE|4US|3US|2TI|3Y|2V|3IT|2X|3100|1J|2C|2R|2T|1KB|3TC|2C|2EK|3TH|2P|2T|2USD|1L|2A|3M|3SS|3Y|2B|3R|2CT|2D|3X|2EAR|3G|3O|3V|2FI|2H|2ICK|3FF|3MB|3N|4K|4T|3PS|3Q|3ST|2M|3RS|2N|3Y|2O|3AK|3RE|3UD|4T|2PX|2R|3TY|2S|2T|2U|3B|3D|2V|3A|3X|2X|2Y|1MA|2C|3C|3T|3X|2DX|2ERGE|2FI|2IT|2K|3R|2L|2M|2N|2OS|2P|3CO|2Q|2S|3N|2T|3C|2Z|1NAB|3ME|2B|3C|2C|3L|3T|2D|3L|2ETA|2F|3I|2G|2HT|2L|2MT|2N|3S|2O|2RG|2S|2T|3M|3R|2US|2X|2YD|3T|3X|1O|22|2AL|2B|3E|2C|3K|3O|2DAI|3EG|4O|4X|3I|3Y|2E|2FI|4X|2G|3E|4N|3I|3S|2I|3NBT|4G|4SL|4YE|2KE|2L|3A|3L|4AR|4E|4G|3R|3T|3X|2M|3B|4O|3E|3FI|3M|3P|4D|3T|2NE|3G|3I|3J|3K|3S|3V|3X|2OHA|3K|3L|3P|2PE|3I|4UM|3S|2Q|2R|3AL|3E|4G|4UM|3GI|5B|3N|3X|2S|3HI|3M|4IC|3P|3S|3T|3X|2T|3I|2U|3NOS|3P|2V|3A|4L|3ER|4X|3IR|3N|2W|3RIE|2X|2Y|2ZP|1P|2AD|3N|3Y|2C|3OIN|2D|2ET|3X|2H|2I|3GGY|2L|3O|2N|2O|3O|4L|3S|2R|3OP|3X|2S|2T|2U|2X|2Y|1QST|2T|1R|28|2A|3B|3CER|4K|3DLE|3FT|3IG|3MER|3VE|2B|3N|2C|2D|3C|3N|4C|3S|3T|4S|2E|38|3A|4L|4M|3D|4I|5T|4O|3ED|3MAT|3O|3P|4E|3S|3V|4A|2F|3I|2GO|2H|3T|2I3X|3ME|2L|2M|3S|2NCHY|3K|2O|3AT|3B|3CO|3GE|3ID|3N|4A|4K|3WD|4N|3X|2P|3S|3T|2S|3P|2T|3B|3M|3S|2U|3X|2V|3USD|3Y|2W|3D|3NY|2X|2YN|3P|4T|3STL|1S|2AC|3I|2C|2EN|2H|2IX|2M|3IC|2NO|3P|2OV|2P|3N|3R|2Q|2R|2S|2TC|3L|3R|2USHI|2WAP|2X|1T|2AG|3SK|2C|3N|2E|2F|2G|2I|3C|2K|3N|2L|3S|3X|2N|2O|2P|3L|3T|2R|3T|2S|3I|2T|2W|2X|3C|2Y|1UAN|2BE|4B|2CK|2DOS|2E|3X|2LO|3T|2MINU|2NI|2RA|3E|3I|4O|3RY|2SD|4C|4T|3T|2T|3E|2Z|1V|2A|3G|3ULT|2C|3C|3OIN|2G|2IP|2NC|3G|3T|2P|3T|2R|2S|3HOT|2T|3C|3X|2X|3CRV|3FXS|1W|2AR|2BTC|2D|2EB|3X|2IF|3S|2N|2R|2S|2T|2V|2X|3T|1X|2A|2C|3ELL|2G|2O|2P|3AD|2T|1YBA|3ER|5C|5D|3ONK|3R|2C|3E|3LE|4UB|3ON|2DER|2FI|2G|2L|2MT|2OP|2P|2RS|3US|2S|2T|1ZC|2F|2GOAT|2OL|2R|3X|2USD|2Z|0D11|12O|2T|13D|14RK|1AB|2C|3ASH|4T|3C|42|3H|3KIE|3S|3XI|2D|3A|3I|2F|3I|3T|2G|3O|3T|2I|3LY|5S|3MO|3N|3Q|3SY|2L|3I|2M|3EX|3O|2N|3A|3K|2O|31|3ACT|3B|3P|3SOL|3VC|3X|2PP|4SY|4T|4X|3S|2R|3A|3B|3C|3E|3ICO|4K|3K|4EN|3T|3X|2S|3C|3H|4D|4G|2T|3A|3P|3X|2V|3E|3IS|3P|2W|3G|4S|3N|2X|3X|2Y|3TA|1B|2A|2C|2D|2EAR|3T|2I|3C|3X|2L|2OE|3X|2R|2TC|3N|2UND|3Y|2X|2Y|2Z|1C|2A|3R|4D|3SH|3U|2B|2C|3T|2HF|2IP|2K|2LOUD|2N|3T|4R|2OIN|2R|3E|3N|2S|2T|3O|2X|2Y|1D|2AM|3O|2D|3D|2F|2IM|2K|2L|2N|2OS|2R|3ST|3T|2S|2X|1EA|3I|3L|2B|3ASE|3T|2C|3HAT|3I|3L|3ODE|2DE|2ED|3M|3P|4G|3R|3X|3Z|2FC|3I|45|4DO|4L|4T|3LA|4CT|4Y|3T|3X|3Y|2G|3A|3EN|5R|3O|4V|51|2HUB|2I|2K|2L|3FI|3OT|3TA|5C|2M|3IR|3OS|2NT|2OD|3R|2P|3O|3TH|2Q|2RC|3I|3O|3P|2S|3I|3O|3U|2TF|3H|2UR|3S|2V|3O|3T|3VE|3X|2X|3A|3E|3G|3IO|3M|3NET|3O|3T|4F|4V1|1F|2A|2B|3T|2C|2D|2G|3L|2H|2I|3AT|3O|3S|2L|2ND|4R|2P|2SG|2T|2X|2Y|3N|1G|2B|2C|3L|2D|3C|2H|2I|2LD|3N|2M|3E|3S|3T|3V|2N|3X|2OLD|3RE|2P|3T|2TX|2VC|2X|1HLT|2N|2P|2R|2S|2T|2V|2X|1IA|3BLO|3M|4ND|2BBLE|2C|3E|4M|2D|2E|3M|3SEL|2FI|3X|2G|3EX|3G|3I|4C|4F|3S|2KO|2LI|2M|3E|3O|2N|3ERO|3GER|4O|3O|3U|3W|2O|3NE|2P|3A|2S|3K|2T|2VA|3ER|3I|3O|3X|2W|2YAR|1JED|1K|2A|2C|2D|2EY|2KT|2S|2UMA|1LA|3NCE|2C|2ISK|2LR|2O|2PD|3T|2R|2T|3A|2X|3V|2Y|3COP|1MA|3IL|2C|3C|3H|2D|2G|2IND|2L|3G|2OD|3ON|2S|2T|3C|3R|2X|1N8|2A|2ET|2F|3LX|3T|2N|2O|3DE|3TES|2S|2T|3X|2VDA|2X|3C|2Y|1OBBY|3O|2C|3C|3K|3T|2D|3100|3I|3O|2E|2FI|2G|3A|4I|4LD|3B|3C|3E|420|4C|5O|4D|4GF|4P|4RA|4S|4TH|4X|4Y|3GY|3IRA|3MI|3O|3PAD|3RMY|3S|3Y|3Z|2JO|2KI|2LA|3LUR|3Z|2M|3E|3I|2N|3A|4LD|3G|3K|3S|3U|4T|2OH|3R|2PE|2R|3A|3K|4L|2S|3E|3HIB|2T|3C|3R|2UGH|2V|3I|2WS|1P|2AD|3Y|2DBC|2ET|3X|2I|3E|2LTR|2N|2P|2R|2S|2T|2X|2Y|1QQQ|1RA|3C|4E|4O|5O|3FTC|3GON|4Y|3M|3W|2B|2C|3T|2E|3AM|5S|3P|2F|2G|3N|2IFT|3NK|3P|3V|2KC|3T|2M|38|2OGGY|3NE|3P|4S|2P|3U|2S|2T|2XNE|2Z|1S|2B|2C|3P|3VR|2D|2FR|2G|2H|3ARE|3IB|2K|2LA|2R|3UN|2T|3R|2UN|2YNC|1T|21|2A|2B|2C|3T|2EM|3P|2G|2H|2N|2O|3P|3RO|2R|3C|2SLA|2X|1UA|3L|2B|3BZ|3I|2C|3ATO|3K|4D|4ER|2DE|2EL|3T|2G|3E|2KE|3O|2MMY|2N|3G|2O|3T|2SD|3K|3T|2X|2ZCE|1V|2C|2DX|2F|2G|2I|2P|3N|2RS|2S|2T|3C|2X|1WARS|2C|2EB|2T|2Z|1X|2A|2B|2C|3T|2D|2F|2G|3M|2H|2L|2N|2O|2R|2S|2T|1YC|2DX|2M|2N|3A|3EX|3MT|3O|2P|2ST|2T|1ZAR|2CC|2DD|2G|2I|2OO|0E21|2C|18|1A|2C|2G|3LE|3S|2I|2RN|3TH|2SYF|2T|2URIC|1B3|2A|3SE|2C|2EN|3T|2IT|2K|2OX|2S|3C|3T|2T|3C|2YT|2Z|1C|2A|3SH|2C|2D|2ELL|2G|2H|3O|3T|2LD|3IP|2O|3B|3C|4H|3FI|3IN|3M|3X|2P|2R|2S|2T|3E|2U|1DAT|2C|2DA|3IE|2E|3L|3N|3XA|2FI|2G|3E|4W|3T|2I|2LC|2N|3S|2OGE|2R|3C|2T|2U|3C|3M|3X|2X|1ER|2TH|1FBAI|2C|2FT|2I|3L|2K|2L|2X|1G|2AME|3S|3Z|2C|3C|2DC|2EM|2G|3C|3MAN|3P|3Y|2I|2LD|2O|3LD|2R|3N|2S|2T|2X|1HASH|2IVE|2RT|1IFI|2M|1JAC|2S|1KG|2N|2O|2S|2T|3A|1L|2A|3C|3D|3MA|3ND|2C|3ASH|2D|3A|2E|3C|3N|3S|3T|2F|3I|2G|2I|3C|3TE|3X|4IR|2K|2LA|3I|2M|3O|4N|3T|2ON|4GD|5T|2P|2S|2T|3C2|2U|2V|3N|2X|2Y|1M|2AID|3R|3X|2B|3ER|3R|2C|32|2D|2IGR|2L|2OJI|3N|3T|4I|2P|3C|3H|3IRE|3R|2RX|2T|2U|2V|2X|1NA|2C|3D|3N|3S|3X|2DCEX|2E|3DEX|2G|3T|2IGMA|2J|2K|2NO|2O|2Q|3AI|2RG|3X|2S|2T|3C|3ER|3R|4C|4P|4Y|3T|2U|2V|3ION|2X|1OC|2N|3C|2S|3C|3DAC|4T|3T|2TH|2X|1PAN|4US|2ETS|2IC|3K|4O|3X|2K|2S|2TT|2X|2Y|1Q|2C|2L|2M|2O|2PAY|2T|2U|3AD|4L|3I|4L|2X|2Z|1RA|37|2B|2C|320|2D|2E|3AL|2G|2IS|2K|2O|3N|2R|3OR|2SDL|2T|3H|4A|2W|2Y|2Z|1S|2AI|2BC|2CE|3ROW|2D|2G|3C|2H|3IB|2N|3C|2P|3R|2S|2T|3ATE|2W|2Z|1T|24|2ALON|2BS|3T|2C|2E|2FETH|2G|3M|3P|2H|32|3A|4X|3B|4N|3D|3ER|3F|4AI|4I|3I|4X|3M|3O|4S|3P|4AD|4LO|4OS|5W|4R|4Y|3S|3V|3W|3X|3Y|2I|2K|3N|2L|2M|2N|3A|2P|3OS|2R|3L|3NT|2S|3C|2T|2X|2Y|2Z|1UC|3OIN|3X|2L|2M|2NO|2RC|3E|3N|3OE|3S|3T|3U|3X|2SD|1V|2A|3N|3ULT|2C|3C|3OIN|2DC|2E|3AI|3D|3NC|4T|3R|4Y|2IL|2MOS|2N|2O|3AI|3L|3S|2R|3ICE|3T|3Y|2T|2U|2X|2Y|2Z|1WC|2IF|2ON|2T|3T|1XA|2B|2C|3C|3L|2D|2E|3N|2FI|2GO|2IP|3T|2LT|2M|3R|2N|3T|2O|3S|2P|3O|2RD|3N|2TN|3P|3RA|2Y|2ZO|1YE|3S|1Z|2C|2ETH|2I|2M|2T|2Y|0F16|2C|12C|2K|13|17|19|1AB|3A|3RIC|2CE|3T|4OM|4R|2DO|2G|2I|3R|4C|4G|2KE|4AI|3T|2ME|4C|3ILY|2N|3360|3C|3D|3G|3V|3X|3Z|2R|3A|3CA|3M|4A|4C|4S|2ST|2T|3HER|4OM|2V|3R|2YD|3RE|2ZZ|1B|2A|2B|2G|2N|3B|2URN|2X|1C|22|2C|2D|2F|2H|2K|2L|2N|2OIN|3N|2P|2Q|2S|2T|3C|1DC|2LS|2M|2O|2R|2T|2USD|2X|2Z|1EAR|2ED|2G|3V1|2I|2LIX|52|2N|3OMY|2R|3C|3MA|3T|3ZAN|2SS|2T|3CH|2VR|2X|2Y|1F|21|2A|2C|3T|2M|2N|2UEL|2YI|1GC|2D|2T|2Z|1HM|1I|2BO|3RE|2C|2D|3A|3LE|3O|2ELD|2F|3TY|2G|2H|2II|2L|3DA|3ES|3L|3M|3ST|2N|3A|4LE|3C|3D|3E|3GER|3K|3N|3OM|3S|3U|2O|2RA|3E|3O|3U|2S|3H|3T|2T|3C|3FI|3T|2U|2WA|2X00|1JB|2C|2T|1K|2GARY|2PEPE|2X|1L|2AG|3ME|3P|3S|4H|5C|2C|2D|3C|3T|2EPE|3TA|3X|2G|2IC|3GHT|3K|3NU|3P|3X|4X|2L|3W|2M|3C|2N|2O|3AT|3KI|5M|5X|3OF|4R|3RK|5Y|3T|3VM|3W|4P|3YX|2P|2R|3BRG|3S|2S|2T|2UID|3RRY|3T|3X|4B|4T|3Z|2VR|2X|2Y|2Z|1M|2B|2C|2E|3X|2G|2L|2T|1N|2B|2C|3T|3Y|2D|3Z|2F|2K|2L|2O|2P|2SA|2TB|2X|2Z|1O|2A|3M|2C|3V|2DL|2F|3O|2GE|2IN|2L|3D|3O|2MO|2N|3E|3S|3T|3Z|2OD|4C|3M|3X|2PA|2R|3A|3CE|5C|3E|4X|3K|3M|3S|3T|4H|5B|2TA|3O|2UR|2X|3AI|3D|3E|3F|3T|3V2|3Y|1P|2AD|2C|2FT|2IS|1R|2A|3C|3X|3Z|2C|2D|3X|2E|3C|4NX|3D|3E|4D|4LA|3L|3N|4S|2F|2GST|3X|2IC|3N|2K|3T|2LONG|2M|2N|3T|2OG|4E|5X|4GY|3NK|4T|3YO|3ZE|2P|2R|2SP|3T|2TC|3N|3S|2V|2WC|2XETH|2Z|3SS|1S|2BT|2C|3C|2HN|2M|2N|2T|3C|2W|1T|2B|2C|2G|2I|2K|2M|3O|2N|2O|2P|2R|3B|3C|2S|2T|2UM|2VT|2W|2X|3T|1UBAO|2CK|2D|2EL|2FU|2JIN|2KU|2L|2MO|2N|3C|4H|3D|4C|4P|4X|4Z|3K|2R|3U|3Y|4X|2S|3DC|3E|3ION|3O|2TC|3URE|2ZE|3N|3Z|1VT|1WATCH|2B|2C|2T|2W|1X|2B|2C|2DX|2F|2I|2P|2S|2T|2Y|1YD|2N|2P|2Z|3NFT|0G1X|13|150|1999|1AC|2D|2FA|3I|2GA|2I|3A|3N|4S|2J|2KH|2L|3A|4TA|4V1|4X|5Y|3EON|3I|3O|3T|2M|3B|4IT|4L|3E|4C|4FI|4IN|4R|4X|3I|3MA|2N|3A|2P|3C|2RD|3I|3K|3T|4S|3U|4DA|3WIF|3Y|2S|3DAO|3G|3P|3TRO|2T|3E|3SBY|2U|2ZE|1B|2A|2C|3R|2D|2E|3X|2G|2IT|2K|2L|2O|3T|3Y|2PT|3U|2RC|2T|3C|2URN|2X|3T|2YTE|1C|2AKE|2C|2ME|2N|2OIN|3TI|2R|2W|1DAO|2C|3C|2DY|2E|2L|2O|3GE|2R|3T|2S|3C|2T|2X|1E|2A|3R|2C|3KO|2EQ|2GE|2IST|2KKO|2LATO|3O|2M|3A|3G|3INI|3S|3Z|2N|3E|3I|4E|4X|3S|4LR|3X|2O|3D|4B|3J|3L|3N|2P|2R|3A|3O|2S|3E|2T|3A|3H|3X|2X|2ZY|1F|2AL|3RM2|2CE|3S|2I|2LY|2N|2T|2UN|2X|2Y|1G|2AVAX|2C|3M|2G|2H|2M|2OLD|2P|3T|2R|2S|2T|3K|4N|1HA|2C|3OLD|2D|2NY|2O|3ST|5M|3UL|2ST|3Y|2T|2UB|2X|1IAC|2B|2C|3T|2F|3T|2G|3A|3X|2M|3MER|2N|3GER|3OA|3UX|3ZA|2O|3T|2V|3E|2Z|1JC|1KF|2I|1LA|3X|2C|3H|2D|3R|3S|3X|3Y|2E|3EC|2F|3T|2I|3DE|3NK|4T|2M|3R|2N|2OBAL|4E|3S|2Q|2R|2S|2T|2X|2YPH|1M|2A|3C|3T|2B|3L|2C|3N|3OIN|2EE|3X|2FAM|2I|2L|2M|3T|2NG|3T|2PD|2R|3X|2S|2T|3O|3T|2USD|2X|1N|2BT|2C|2D|2FT|2G|2J|2NX|2O|3ME|2R|2S|2T|3O|2US|2X|2Y|1O|2A|3L|4S|3T|2B|2C|2D|3E|3L|3S|3Z|2ETH|2F|3F|3X|2G|3O|3U|2IN|2KU|2L|3C|3D|4EN|4X|4Y|3F|3OS|2M|32|3A|3D|3T|2NE|2O|3CH|3D|3GLY|3N|2PX|2RA|3EC|2S|3S|3T|2T|3EM|3G|3X|2V|3I|3T|2W39|2YOO|2Z|1P|2AWS|2BP|2CX|2KR|2L|3X|2N|2O|2PT|2S|2TG|2U|3INU|2X|1Q|1R|2ACY|3IL|4N|3PE|3V|3YLL|2BE|3T|2C|2E|3ARN|3EN|5T|3G|3LF|3XIT|3Y|2FT|2G|2ID|4Z|3MEX|3N|2L|3C|2M|3D|2N|3D|2O|3K|4KY|4X|3N|3W|4TH|2P|3L|2S|2T|2UM|4PY|2V|3E|2W|3I|2X|1S|21|2C|2E|2HIBA|2I|2KY|2M|2PI|2R|2TBSC|3C|3ETH|3S|4OL|3T|2WAP|3IFT|2X|2Y|3S|1T|2A6|3I|3VI|2BOT|2C|3OIN|2E|2F|3O|2H|2IB|2K|2N|2ON|2R|2SE|2X|1UAC|3P|3R|4D|2C|3CI|2E|3SS|2I|3LD|3SE|2LF|2M|2N|3S|2P|2SD|4T|2T|1VC|2E|2R|2T|1W|2D|2GW|2T|1X|2A|2C|2E|2T|1YEN|2M|3NET|3REW|2RO|2SR|1ZB|2E|2IL|2LR|2ONE|2T|2X|0H2O|3N|13O|1ABIBI|2C|3HI|2HA|2I|3R|2KA|3KA|3U|2L|3F|3LO|3O|2M|3I|3S|4TR|2N|3A|3D|4Y|3U|2O|2PI|2RAM|3D|3E|3RYP|3T|2SH|4AI|4T|3UI|2T|3AY|3CHY|3I|2US|2VOC|3Y|2WK|2Y|3YA|2Z|3E|1B|2AR|4X|2B|2C|2D|3C|2E|2IT|2N|2O|3T|2RS|2T|3C|2X|1C|2C|2T|2XP|1D|2AC|3O|2G|2N|2RN|2V|2X|1E|2AL|3RT|5R|3T|3VEN|2C|3T|4A|2DG|4E|2EL|2FI|2GG|3IC|2LIOS|3L|4O|3MET|3PS|2MAN|3ULE|2P|2R|3A|3B|3MES|3O|4ES|2T|3A|3H|2X|3C|2Z|1F|2I|3L|2T|1GET|2HG|2O|3LD|2PT|2S|2T|1H|2EM|2GTTG|1I|2BAKC|4YC|3IKI|3S|2D|3U|2ENS3|54|2FI|3LUF|2GH|2H|2KARI|2LL|2MAYC|3E|2NA|3T|3U|2OD|4BS|2PP|2RE|2T|3BTC|3OP|2VE|2X|1K|2B|2C|2DOGE|3X|2G|2N|1LC|2D|3Y|2M|2N|2P|3R|3T|2S|2T|2X|1MC|2D|2KR|2N|3D|3G|2P|2Q|2R|3N|2ST|2T|3T|2X|1NB|2C|3N|2S|3T|2T|3R|2X|2Y|2ZO|1O|2A|2BA|3BES|3O|2CAI|2D|3L|2GE|2ICHI|2KA|3K|2L|3A|3D|4EX|3Y|2ME|3I|2N|3EY|3K|3OR|2OF|3K|3P|2P|3PY|3R|2RD|3SE|3US|2S|3HI|3KY|3TAI|2T|3N|3T|2USE|2W|3L|1P|2AD|3Y|2B|2C|2L|2N|2O|2T|2X|2Y|1QR|2T|2X|1RB|3E|2CC|2D|3G|2M|2O|2TS|1SC|2F|2N|2P|2S|2T|2UI|4TE|1T|2A|2B|2C|2D|3F|2E|3R|2M|3L|3OON|2N|2O|2R|2T|2X|2Z|1UAHUA|2B|3II|2C|2DI|2GE|3O|2H|2M|3AI|3P|2ND|3NY|3T|2R|2S|3D|3H|3KY|3L|2T|1VC|3O|2E|32|2H|2I|2N|3T|2T|1WC|2L|2T|1XA|2C|2D|2RO|2T|2X|3H|1YBN|3RID|2C|2DRA|4O|5P|2GH|2N|2P|3E|4R|5D|5S|4S|3R|2S|2T|2VE|1Z|2D|2M|2N|2T|0I0C|17|19C|1AG|2I|2M|1B|2ANK|3T|2ETH|3UR|2FK|3N|3R|2G|2IT|2NB|2P|2S|2TC|1C|2A|3P|3SH|2B|2C|2E|2G|2H|3I|3N|3X|2LICK|2N|2OB|3M|3N|4S|3O|3S|2P|2SA|3T|2T|2X|1D|2AC|3P|2C|2EA|3FI|3X|2H|3UB|2IA|3CE|2K|2LE|2M|2NA|2O|3L|3RU|2RT|3X|2T|3T|2V|2X|3M|3S|2YP|1EC|2TH|1F|2C|2IT|2LT|2T|2UM|3ND|2X|1G1|2CH|2G|2I|2NIS|2TT|2U|3P|1HC|2F|2T|1IC|1JC|2Z|1LA|2C|3T|2K|2T|2V|1MBTC|2C|2E|2G|3NAI|3Z|2I|2L|2MO|2O|2P|3ACT|3CH|4N|3ER|3S|3T|2S|3T|2T|2U|2VR|2X|1N|2ARI|2B|2C|3AKE|3NT|3P|2D|3EX|3I|4A|3U|3Y|2E|3RY|3S|3T|3X|2F|3C|3I|4NI|3LR|3O|3RA|3T|4T|3X|2G|2J|2K|2N|3BC|3OU|2O|2P|2RT|2S|3ANE|3C|3N|3P|3R|3T|4AR|3UR|5C|2T|3D|3ER|5N|3L|3O|3R|3X|2U|3INU|3KO|3S|2V|3C|3I|4C|3OX|3X|2X|3M|3T|1O|2C|2EN|3X|2I|2N|3C|3X|3Z|2P|2SHIB|3T|2T|3W|3X|2U|3X|2V|3T|2WN|1P3|2AD|2C|2DN|2L|2MB|2OR|2SX|2T|2UX|2V|3OLD|2X|1Q|250|2C|2N|2Q|2T|1RA|2C|2ENA|2IS|2L|2ON|2T|2YDE|1SA|2DT|2G|2H|3I|3ND|2IKC|2KR|3Y|2L|3AMI|3M|2P|2R|2SP|2T|3EP|1TA|3M|2C|2EM|2F|2G|3R|2HEUM|2L|3R|2M|2OC|2R|2SB|2U|2X|2Z|1UNGO|2S|3D|2X|1VAR|2C|2I|3P|2N|2Y|2Z|1W|2T|1X|2C|2P|2S|2T|1YKYK|1ZA|2E|3R|2I|2X|2ZY|0J8T|19BC|1ACK|3S|3Y|2DE|4C|2IHO|2KE|2M|2N|3E|2R|3ED|3Y|2SMY|2WS|2Y|1BOT|2S|2X|1C|2B|2C|2G|2O|2R|2T|1DC|1ED|3ALS|2ET|2FE|3F|2LLY|2M|2N|2RRY|2SUS|2T|3TON|2UR|2W|3EL|2X|1FI|3N|3VE|1GLP|2N|1IAOZI|2B|2F|2M|2ND|2O|2ZZ|1K|2C|2L|1LP|1M|2C|2PT|2T|2Z|1NB|2GL|2S|2T|2X|2Y|1OB|3S|2E|3Y|2HM|2INT|2JO|2K|3ER|2LT|2NES|2OPS|2Y|3S|3T|1P|2AW|2D|2EG|2GC|2YC|3X|1RIT|2T|1SE|2M|2OL|2T|1T|2C|2O|2S|2T|2X|1UDGE|2GNI|2I|3CE|2L|3B|3D|2MBO|3P|2N|3O|2P|3I|2R|2SDC|4T|2V|1VL|2Y|1W|2L|0K21|2G|1AAS|2BOSU|3Y|2C|3Y|2G|2I|3KEN|3NET|2KA|3I|2L|3A|4M|3DI|3I|3LY|3M|2M|3PAY|2N|3G3N|4AL|2P|3U|2R|3ATE|3EN|3MA|5D|3T|2S|3TA|2T|3A|4NA|3Z|2U|2VA|2WA|2YI|1B3|2C|2D|2OND|3T|3X|2R|2T|3C|2X|1C|2AKE|3L|3SH|3T|2CM|3PAD|2H|2S|2T|1DA|3G|2C|2G|2IA|2OE|3GE|2X|1EANU|2C|2D|2EP|3S|2I|2K|3E|4C|2L|3PIE|2MA|2N|3NEL|3SHI|2P|2RMIT|2TAN|2X|2Y|3C|4AT|3FI|3T|1FC|2I|2R|2T|2X|1GC|2O|2T|1HM|1I|2AN|2BA|3SHI|2CK|4S|2F|2KO|2LLER|3T|2M|3BO|3CHI|2N|3D|3E|3G|493|4B|4F|4U|4Y|3T|3U|2RA|3BY|3O|2SC|3HU|2TA|3SU|3TI|4Y|2WI|2ZUNA|1KO|2T|1LAP|3Y|2C|2D|2EE|3VA|2IMA|3ST|2K|3S|2O|3N|2P|2T|2UB|2V|1MA|2C|2D|2L|2ON|2X|1NC|3L|2DC|3M|3X|2FT|2G|3N|2IGHT|3NE|2J|2OB|3T|3W|3X|2S|2T|3O|2W|1OBE|3O|2DA|2GE|2I|3N|4B|3P|2JI|2K|3O|2L|3ION|2M|3O|3P|2N|3G|3O|2RE|4C|3RA|2TO|2Y|2Z|1P3R|24R|2AD|3PA|2C|2HI|2L|2OP|1RAK|3TOS|2B|2C|2D|2EDS|3ST|2IDA|3PTO|2L|2M|2N|2O|3M|4E|3NE|2P|2RX|2T|2U|2X|1S2|2C|2H|3IB|2M|2N|2P|2S|2T|2WAP|2YS|1T|2C|2K|2N|2O|3N|2S|2T|2X|1UB|3E|3O|4S|2E|2JI|2KU|2MA|3U|2NCI|2R|3O|3T|2S|3A|3D|3H|2V|1VERSE|2I|2NT|2T|1WAI|3TT|2D|2ENTA|2H|2IK|2S|2T|1XA|2C|2USD|1YCC|2L|2OKO|2TE|2UB|2VE|1ZC|2EN|0L2|2DAO|13P|2USD|17|1A|2B|3RA|3S|3X|2CE|2DA|3YF|4S|2EEB|2I|3KA|2KE|2LA|2MB|4O|2NA|3C|3D|4B|4S|3E|2O|2R|3IX|3O|3RY|2S|2T|3TE|3X|2UNCH|2VA|4X|3E|3ITA|2W|2X|2YER|2Z|3IO|1BA|2C|2K|2L|3OCK|2R|2T|3C|2XC|1C|24|2ASH|2C|2D|2G|2K|2MG|3S|2P|2R|3O|2S|3N|2T|2WP|2X|1DC|2FI|2M|2N|2O|3GE|2X|3G|2Z|1EA|3D|3F|3G|3N|3SH|2D|3U|2E|3T|2G|3O|2IA|2LE|2MC|3D|3N|3O|4N|2N|3D|4A|4S|3FI|3IN|2O|3S|3X|2PA|3EN|2SS|4F|2T|2U|2V|3E|4LG|4R|5J|3L|2X|3I|2Z|3GI|1F|2C|2G|2I|2NTY|2T|2W|1GBT|4Q|2C|3Y|2D|2O|3LD|3T|2R|2X|1HB|2C|2D|2INU|2T|1IB|3ERA|5O|3FX|3RA|4E|2C|3K|3O|2D|3ER|2EN|2F|33|3E|3T|2GER|3HT|3MA|3O|2KE|4C|2LA|2ME|4X|3O|3X|2NA|3DA|3EA|3G|3K|4A|4C|4FI|3Q|3U|3X|2ON|2PC|3S|2Q|3D|3R|3UI|2R|2S|3A|2T|3E|3H|4O|3ION|3T|2V|3E|2XX|2Z|3A|4RD|3D|1K|27|2C|2D|2N|2SM|2T|2U|2Y|1LAND|2G|2ION|1M|2AO|2C|3H|2EOW|2R|2T|2WR|2XC|2Y|1N|2C|2D|3RY|3X|2K|3C|2L|2R|2T|2X|1OA|3N|2BS|2C|3C|3G|3I|3K|3O|3US|2DE|2F|3I|2G|2IS|2KA|3R|2L|3A|3C|2N|3G|4FU|2OK|4S|3M|3N|4G|3P|4Y|3T|4EX|2PES|2RD|4S|4Z|3Y|2ST|2T|3ES|4U|3TO|4Y|3US|2UD|2V|3E|4LY|2WB|2X|2YAL|1P|2C|2I|2K|2L|2NT|2OOL|2T|2V|2Y|1Q|28|2BTC|2D|3N|3R|3X|2R|2TY|1RC|2G|2N|1SC|2D|3OGE|2ETH|2HARE|2K|2P|2S|2T|3AR|2V|2WAP|1T|2A|2B|3C|3TC|3X|2C|3C|3D|3H|3P|3R|3U|3X|2D|2E|3X|2G|2H|3N|2K|2NM|2O|3V1|42|2PC|2R|3BT|2S|2T|2X|2Z|1UA|2C|3A|3HOW|3K|4Y|5B|3Y|2DO|2FC|3FY|5G|2IGI|3S|2LU|2M|3A|3I|2N|3A|4R|4T|3C|4H|3E|4S|3G|3R|2PIN|2S|3D|3H|2T|2X|3O|3Y|1VG|2IP|2L|2M|2N|2X|1WC|2F|1X|2C|2F|2T|3O|1YB|2C|2F|3E|2K|2L|2M|2N|3K|3X|2O|2QD|2RA|2TX|2UM|2VE|2X|3E|1Z|0M1|12O|187|1AC|2DANA|3C|3OG|2EP|2F|2G|3A|3E|3IC|5F|5K|5V|4K|3NET|2HA|2I|3A|3D|3L|2KE|3I|2LL|4Y|2MAI|2N|3A|3C|3DOX|3E|3GA|3NA|3TA|4LE|2P|3C|3E|3R|3S|2R3|3CO|3E|3I|4O|3K|3LEY|3MAJ|3O|3S|44|4C|4H|3T|4K|3U|3V|4IN|3X|3YJ|2S|3A|3K|3P|3Q|3S|3TER|3YA|2T|3A|3CH|3E|3H|3IC|5X|3PAD|2U|2V|3IA|2W|2X|3I|3R|3X|2Y|3P|2ZC|3I|3ZE|1B|28|2ASE|2CASH|3C|2E|3T|2F|2I|3T|2L|3C|3K|2M|2N|2ONK|3T|3X|2P|2RS|2S|2T|3C|3X|2X|1C|2ADE|3P|3R|3SH|3T20|3U|2B|2C|2D|2ELO|3UR|2F|2G|2H|3C|2I|3V|2LB|2N|2O|32|2P|3C|2RC|3N|3T|2S|2T|2U|3SD|2V|1DA|3I|3O|2B|2C|3L|2DN|2F|2H|2I|3CE|2M|2N|2R|2S|2T|3K|2U|3S|2X|3H|1E|2AN|2B|2C|3H|4A|3I|2D|3I|4A|4C|5O|4T|2E|3D|3R|3T|2F|3A|2GA|2L|3B|3D|3I|3LO|3O|4S|3T|2M|3E|4AI|4ME|4S|4T|2NGO|3LO|2OW|4G|4IF|2PAD|2R|3CE|4U|3I|3KLE|2SA|3G|3H|3SI|2T|3A|4C|5R|4F|4G|4L|4N|5O|4PK|4Q|4S|4T|4V|4X|3EOR|4R|3FI|3H|3I|4S|3M|3O|4LD|3RO|2U|2V|3R|2W|3TWO|2X|3C|3P|2ZZ|1F|21|2AM|2C|2ER|3T|2G|2I|2O|2PS|2S|2T|3U|2UND|2X|1G|2AMES|3R|2D|2G|3T|2KL|2LC|3D|2N|2O|3D|2P|3T|2T|2UL|2X|1HAM|2C|2LX|2P|2T|2UNT|1I|2A|2B|3O|3R|2C|3E|3KEY|3RO|2DAI|4S|3N|2E|2F|2G|3MIG|2KS|2L|3E|4I|3K|42|3LI|3O|2M|3I|4R|3O|2N|3A|3C|3D|4EX|4S|3E|4X|3I|4ON|3O|3S|3T|4ME|4YS|3U|4TE|3X|2O|3DIO|3TA|2R|3C|2S|3A|3HKA|3S|3T|2T|3C|3H|3X|2V|3A|3RS|2X|2Y|1JT|1KC|2EY|2ONG|2R|2T|2USD|1L|2A|2D|2GC|2ITE|2K|2N|3K|2OKY|2S|2T|3C|3PX|2XC|1M|2A|3I|3ON|3PS|2C|2ETA|2F|2G|2IT|2NXT|2O|2PRO|2S|3C|3S|2T|3M|2UI|2VG|2X|3IV|3VI|2Y|1N|2B|2C|2D|3CC|3E|2E|3T|2FT|4S|2G|3O|2I|2M|2R|3B|3CH|2S|3T|2TC|3G|3L|3O|3P|2V|3M|2W|2X|2Y|2Z|1O|2AC|3R|3T|2B|3I|4C|4E|4LE|3U|3X|3Y|2C|3HI|3O|2D|3A|4I|3C|3EL|4X|3UM|3X|2E|3TA|2F|3I|3OLD|2G|3U|3X|2H|2I|3N|2JO|2K|2L|3A|3K|2M|3A|2N|3A|4V|3ETA|4Y|3F|3G|420|3I|4E|3K|4E|5Y|4U|3O|3S|4T|5A|3T|4E|2O|3I|3LYA|3N|4C|4D|4ED|5R|5Y|4R|3O|3V|3X|2PS|2RA|3E|3OS|3PH|3RA|3SE|2S|2T|3A|3G|3I|3O|2UTAI|2V|3D|3E|4R|4Y|4Z|3ON|3R|2W|3A|2Z|1P|23|2AY|2C|2D|2G|2H|2I|2L|3US|3X|2M|2RO|2S|2T|2WR|2X|3T|1QL|2ST|1R|2BOB|2CH|3R|2F|3OX|2HB|2I|2K|2N|3A|2P|3EPE|2S|3A|2T|2UN|2V|2X|3B|2Y|1SA|2B|2C|3P|3T|2D|2G|3O|2HD|3IB|4P|2N|2OL|3T|2P|2Q|2R|2T|3O|2U|2WAP|1T|2A|2B|3C|2C|3MN|3N|2D|2EL|2G|2H|3D|3N|2IX|2K|2L|3M3|3X|2N|2O|2P|2R|3A|3C|3G|3M|3X|2S|3H|2T|2V|3T|2W|2X|3LT|2Y|2Z|1U|2BI|2DOL2|3RA|2E|2LTI|5V|2MU|2N|3CH|3ITY|2RA|2SD|3E|3IC|3K|3T|2T|3E|2U|2ZZ|1V|2C|2D|3G|2EDA|2G|2I|2L|2P|2RS|2U|2X|1W|2AR|3T|2C|3C|1X|2C|2M|2NT|2RP|2T|3C|2W|2X|2Z|1YB|2C|3E|2DFS|2ID|2L|3O|2NE|2O|3BU|2RA|3IA|3O|4O|2ST|2T|3H|3V|1ZC|2G|2K|2M|2R|2X|0N0031|11|13DR|17|18V|1ABOX|2C|2DA|2FT|2H|2KA|2LS|2M|3E|4C|3I|3O|2N|3A|4S|3J|3O|2O|3S|2P|2RCO|2S|32|3H|3SR|3TR|2T|3ION|2UT|2V|3C|3I|4A|4B|3X|3Y|2WA|2X|2ZAR|1BABSC|3I|3R|2C|2IT|2L|3U|2NG|2OT|3X|2P|2R|2S|2T|1C|2ASH|2C|2DT|2O|3P|3R|4AI|3V|2P|2R|2T|1D|2AU|2C|2LC|2N|2OGE|2R|2X|1EAL|3R|3T|2BL|3U|2C|2ER|3T|2F|2I|2KI|3O|4IN|4S|2MO|3S|2O|3G|3K|3M|3N|3S|3X|2PT|2RD|3F|3O|3VE|2SS|3T|2T|3C|3KO|3Z|41|2U|3ROS|3TR|5O|2VA|3ER|2W|3B|3G|3M|3O|4S|3S|3TON|2X|3A|3BOX|4T|3M|3O|3T|4EX|3XO|2ZHA|1FAI|2CR|2D|2E|2N|2P|2T|311|3ART|3B|4S|3D|3E|3I|3L|3N|3P|3S|3T|3X|4HI|3Y|4P|2UP|2XC|2Y|1GA|2C|2IN|2L|2M|3I|1HCT1|2T|1IBI|2C|3E|4C|2F|3T|4SY|2HAO|2I|3FI|2K|2M|3FA|2N|3JA|5Z|3KY|3O|3U|2OB|3X|2T|3O|3RO|5E|5G|2X|2ZA|1KA|2C|3LC|2N|2T|1LC|32|2G|2INK|2S|2X|1MB|3TC|2C|2D|2H|2K|3R|2R|2S|3P|2T|2X|1NB|2C|2I|2N|2T|1OA|3H|2BL|2DE|3IS|3L|2IA|3S|3Z|2KA|3U|2LA|2M|2NE|2O|3T|2R|3A|3D|3MIE|2S|3N|3O|2TE|2V|3A|2W|2X|3B|1PAS|2C|2ER|2ICK|2LC|2M|2T|2X|3S|1RB|2C|3H|2FB|2G|3Y|2K|2M|2N|2O|2P|2S|2V|3E|2X|1S2DRP|2BT|2D|3X|2FW|2H|2I|2K|2P|2R|2S|2TE|2UR|4E|1T|2B|3C|2C|3C|2D|2G|2K|2M|2O|2R|3N|2S|2VRK|2WK|2X|2Y|1U|2A|2B|3IS|2DE|4S|2KE|2LS|2M|3I|2R|2SA|3D|2T|3GV2|3S|2X|1VA|2C|2DX|2G|2IR|2L|2OY|2S|3T|2T|2X|2ZN|1WC|3N|2P|2S|1XC|2D|3T|2E|2M|3C|2N|2RA|2S|2T|3I|3T|4Y|1YAN|4TE|2BBLE|2C|3REC|2E|3X|2M|2N|2X|2ZO|1ZC|2DX|2E|2L|2O|0O3|14DX|1AK|2S|3C|3IS|2TH|2X|1BEMA|2I|3TS|2OT|2ROK|2S|3R|2T|3C|2X|1C|2AI|3VU|2B|2C|2D|2E|3AN|5T|2ICAT|2L|2N|2P|2T|3A|4X|3I|3O|4C|4IN|2W|2X|1DC|2DZ|2E|2GN|2IN|2MC|2N|3T|2S|2X|2YS|1F|2BC|2C|3R|2E|2N|1G|2CINU|2D|2GY|2N|2O|3D|2SM|3P|2T|2V|2Y|2Z|1H|2ANDY|2M|2O|1ICOIN|2L|3D|2N|2O|1JA|2X|1K|2B|2G|2LP|2OIN|2S|3E|2T|1LAND|3S|2DSF|2E|3A|2IVE|2OID|2T|2V|2XA|2Y|3MP|1M|2A|3X|2C|2D|2EGA|2G|3C|2I|3C|2MI|2NI|4A|4X|3OM|2T|2V1|2X|1N|2AM|2C|2DO|2E|3S|3X|2G|3AS|2I|3ON|3T|2L|3INE|3Y|2NO|2OT|2S|3TON|2T|2US|2X|1OE|2GI|2KI|3S|2RC|3T|2T|2W|1P|2A|3IG|2C|3T|2EN|4GO|4RI|4X|3PE|3S|3T|3X|2HX|2INU|3UM|2MND|2N|3N|2P|2S|3C|3EC|2T|3C|4M|3I|4G|4ON|2U|3L|2V|1RACLE|3I|4X|3O|3RE|2B|3IS|3K|3R|3S|3T|2C|3A|2D|3I|42|4FI|3S|2E|3O|3T|2GA|3T|2I|3GIN|3ON|2LY|2M|3E|2N|3J|2O|3C|3P|3X|2S|2T|2V|2YX|1S|276|2A|3K|2C|2EA|4N|3TH|2F|2HI|2K|2L|2MO|2QTH|2S|2T|2WAP|1T|2B|2HR|2K|2N|2O|2SEA|2X|1UCHI|2D|2R|2SD|4C|3E|2T|1VC|2N|2O|2R|1WC|2D|2L|2N|1X|2AI|2B|3T|2D|2EN|2M|2S|2T|2Y|32|3C|1YS|1ZG|2K|2MPC|2O|3NE|2P|0P202|2PS|13D|1404|1AAL|2BLO|2C|3E|3M|4AN|3OCA|3T|2D|2F|2GE|2I|3D|3NT|2K|2L|3AI|3ET|3G|3LA|3M|4Y|2M|3P|2N|3D|4A|5I|4O|5P|3GE|3IC|3O|2PA|3ER|3I|3PAY|2R|3A|4B|4L|5L|4S|4W|3ETO|3I|3LAY|3MA|3Q|3T|2S|3C|3G|3L|3S|2T|3EX|3H|2VIA|3O|2W|3S|3TH|2XEX|3G|3U|3W|2Y|3B|3CON|3N|3P|3S|3T|3U|3X|2ZZI|1BAR|3SE|2C|2ET|2IRB|2L|3K|2Q|2R|3V1|2T|2X|3V1|1C|2C|3M|2E|2H|3S|2I|2L|2M|2N|3T|2O|3IN|2R|2S|3P|2X|1D|2A|3TA|2C|2D|2EX|2F|2OG|4E|2T|2X|1EA|3CHY|3K|3R|4L|3S|2C|3L|2EL|3PA|4O|4S|2FI|2G|3S|2IPEI|2KC|3O|2L|2M|2NC|3DLE|3G|4YX|3IS|3TA|2OPLE|3S|2PC|3E|42|4AI|4D|4E|4F|4GA|4MO|4PI|4RA|4W|4X|3I|3PA|4ER|3S|2R|3A|3C|3I|3L|3P|3RY|3U|3X|2SA|2T|3F|3G|3H|3L|3N|3O|3S|3T|2USD|2X|1FI|3D|2L|2R|2T|2Y|1G|2ALA|2C|2EN|2F7T|2L|2N|2OLD|2ROK|2T|3S|2U|2X|1HA|3E|3LA|2B|3D|2C|3R|2I|3BA|2L|2M|2N|3X|2O|3NON|3ON|3RE|2R|2S|2T|3C|3R|2V|2X|1I|2AS|2B|2CA|3KLE|3O|2E|2F|2G|3E|4ON|3GY|3S|2KA|3O|2LOT|2N|3CHI|3E|3G|3K|4X|3MO|3O|3U|2O|2P|3A|3I|3L|3T|2RATE|3I|3L|2S|3T|2T|3CH|2VN|3X|2X|3EL|5V|2ZA|3ZA|1JM|1KB|2C|2D|2F|2G|2N|2OIN|2T|1LA|3AS|3C|4E|3I|3N|4ET|3T|4C|4O|3Y|4C|2B|3T|2C|3U|4C|2D|2E|3B|3O|3RF|3X|2F|2G|3R|2I|2M|3T|2NC|3X|2OT|2Q|2R|2S|3ARB|3B|3D|3PAD|3X|2T|3C|3X|4YZ|2U|3G|4CN|3RA|3S1|3TUS|2X|3Y|2Y|1MA|2E|3ER|2G|3T|2M|2NT|2ON|2PY|2TN|1NC|2D|3C|3R|2FT|2G|3N|2K|2L|2ODE|2T|2X|2Y|1OA|3I|2C|3C|3KET|3O|2D|3IUM|3O|2E|2G|3AI|2INTS|2K|3EM|4R|3O|3T|2L|3A|4R|3C|3I|4S|3K|4ER|3L|3NX|3S|3VEN|3X|3Y|4X|2M|2N|3D|3KE|3YO|3ZU|2O|3DL|3H|3L|4X|5T|4Z|3P|2P|3C|4AT|3E|3K|3O|2R|3A|3K|4E|3T|43|4AL|4O|4U|4X|2S|3EX|3I|3Q|3S|3T|4C|2T|3S|3TER|2U|2WELL|4R|3R|1P|2AD|3Y|2BLZ|2C|2I|3ZZA|2L|2M|2N|2OVR|2P|2R|2S|2T|2Y|1QT|1RA|3RE|2B|2C|3H|3L|3M|3Y|2DS|3X|2E|3D|3M|4E|4IA|3S|2FT|2G|2I|3A|3DE|3MAL|4E|3NT|5S|3SM|5A|3X|2L|2M|3X|2NT|2O|3B|3C|3D|3GE|3M|3OF|3P|4C|4S|3S|3T|4EO|4O|5N|3UD|3XI|2P|3S|3T|2Q|2S|2T|3C|3G|2V|3C|3S|2X|3Y|2Y|1S1|2B|2C|2D|2EUD|2F|2G|2I|3LOC|2K|2L|3IP|2M|2OL|2P|3S|2T|3AKE|3N|2UB|2WAP|2Y|3OP|1T|2A|3S|2C|2D|2ERIA|2F|2H|2I|2N|2O|3N|3Y|2P|2R|2T|2U|2X|1UFETH|3F|4IN|2GAI|3L|2LI|3SE|2MA|3BAA|3LX|3P|2N|3CH|3DIX|4U|3K|2PA|3S|2RA|3E|3R|3SE|2SD|3H|4I|3SY|2T|2X|1VFYBO|2P|2T|2U|1WAR|2H|2INGS|2ON|2R|2T|1X|2B|2C|2G|2I|2L|2P|2T|1YC|2E|2I|2LNT|3ON|2M|3E|2N|2P|2Q|2R|3AM|3K|3O|2T|3H|2USD|1ZM|2P|2T|0Q1S|12C|1A|2C|2NX|2RK|2SH|2U|1BAO|2C|2IT|2K|2T|2U|2X|2Z|1C|2H|2N|2O|2X|1DC|2ROP|2T|2X|1FI|1I|2E|2SWAP|1KC|2NTL|1LC|2INDO|1MALL|1NT|3R|3U|2X|1OBI|2M|2OB|2RA|3PO|1QBC|2Q|3F|1R|2DO|2K|2L|2P|2T|2X|1SLV|2P|2R|1TC|3ON|2F|2L|2O|2UM|2Z|1UA|3CK|3M|3NT|3RTZ|3SA|2B|3E|2ICK|3DD|3N|4T|3Z|2O|2ROZ|2SD|1VT|1WAN|3RK|2C|2LA|1XC|0R1|12R|134P|2FI|2T|14RE|1AB|3BIT|3I|2C|3A|3EFI|3ING|2D|3AR|3I|4O|3R|2FT|2GE|2I|3D|4ER|3F|3L|3N|4C|4I|3SE|3T|3ZER|2K|3E|3U|2M|3A|3EN|3P|2NKER|2P|3TOR|2RE|3I|2STA|2TING|4O|3S|2VE|4N|2WG|2Y|3S|2ZE|3OR|1B|2C|2D|3T|2IES|3F|3S|3T|2LS|3Z|2N|3B|2P|2R|2T|3C|2UNNY|2W|2X|3S|2Y|1C|220|2C|3C|2G|2H|2KT|2M|2N|2OIN|2T|2X|1D|2C|2D|2EX|2F|2GX|2N|3T|2O|2PX|2R|2S|2T|2X|1EA|3CH|3L|4M|5S|4Y|3P|4ER|3U|2BL|3US|2C|3OM|2D|3C|4O|3DIT|3FEG|3I|3LC|3N|3O|2E|3F|3LT|2F|3I|3UND|2GENT|2HAB|2I|3GN|2KT|42|2L|3AY|3I|3VT|2M|3CO|3E|3IT|2N|3A|3BTC|3C|3E|4C|3Q|3S|3T|4BE|2P|3O|3UX|2Q|2S|3T|2T|3A|4IL|3H|42|3IRE|2U|3NI|2V|33L|3A|3E|3O|4AI|4N|3U|3V|2W|2X|1F|2CTR|2D|3B|2G|2I|2KJ|2L|2OX|2R|2T|2UEL|2X|1GC|2EN|2OLD|2P|2T|1HEA|2INO|2OC|2P|1IA|2B|3BIT|2C|3E|3H|3K|2DE|4MY|2F|33|3I|2GEL|2K|2L|2M|3BIT|2N|3G|4X|3IA|3U|2O|2P|3AX|3O|3T|4O|2SE|4P|3ITA|2TE|3O|3Z|2YA|2ZE|1JV|1KC|2I|2N|2R|2T|1LB|2C|2M|2OOP|2T|2X|2Y|1MATIC|2C|2ESH|2OB|2PL|2RK|2S|2T|2V|1NB|3W|2C|2D|3R|3X|2S|2T|3B|2X|1OAD|3R|2B|3ET|3IN|2C|3K|42|4ET|4I|4Y|3O|2DAI|2E|2G|2I|2K|3O|2LS|2ME|2ND|3IN|2O|3BEE|3K|3M|3ST|3T|4S|2S|3E|3N|3X|2T|3TY|2UND|3P|3SH|3TE|2VI|2W|3AN|2X|2Y|3A|4L|1PB|2C|2D|2G|2ILL|2K|2L|2M|2S|2T|3R|2UT|2ZX|1RB|2C|2T|1SC|2ETH|2F|2IN|2PN|2R|3V|2S3|2T|3K|2UN|2V|2WETH|1T2|2B|2C|2E|2H|2M|2T|1UBIT|3X|3Y|4EX|2C|2FF|2G|3Z|2LER|2NE|3Y|2P|3X|2SD|3H|3T|2UF|2X|1VC|2F|2LNG|3T|2M|2N|2O|2P|2R|2ST|2T|2X|1WA|3S|2D|2E|2N|2S|1XCG|2D|2O|2T|1YC|3N|2IU|2O|3MA|3SHI|2Z|1ZR|0S2K|14F|18C|1ABAI|3LE|3R|2C1|2F|3E|4S|4T|4X|3LE|3TP|3UU|2I|3L|3TA|4O|2K|3AI|4TA|3E|2L|3D|3E|3LY|3MON|3T|2M|3A|3O|2N|3A|3D|4G|4Y|3I|3JI|3SHU|3TA|4OS|2O|2P|3E|3P|4C|2R|3CO|3OS|2S|2T|32|3A|3OX|4Z|3S|3T|3X|2UBER|3CE|3NA|2V3|3G|3M|1B|2A|3BE|2C|3C|2E|2F|2GO|2IO|2OX|2R|3T|2SC|2T|3C|1C|2A|3LE|3M|3NS|3P|4E|3R|4AB|3SH|3T|2C|3P|2DS|2FX|2H|3O|2IA|3X|2K|2L|3P|2M|2N|3R|3SOL|2O|3IN|3NE|3OBY|3R|4E|3T|4TY|2P|3T|2RAP|3EAM|3IBE|4V|3L|3M|3PT|3T|2S|3X|2T|3K|2Y|1D|2A|3I|3O|2C|3RV|2EX|2L|2N|2O|3G|4E|3PE|2P|2RN|2S|2T|2USD|2X|1EA|3L|4N|3M|3N|3T|2BA|2C|3O|4ND|3RT|3T|2ED|4S|4V|4X|3LE|3N|3R|2FA|2G|2I|3LOR|2KAI|2L|3F|3LC|2M|2N|3ATE|3C|3D|3NO|3SE|4I|4O|5R|3T|2ON|3R|3S|2PA|2Q|2R|3G|3O|3P|3SH|3V|4E|2SSIA|2TH|42|4ER|3S|2X|3Y|1FARM|2C|3P|2D|2F|2G|2I|3N|3T|2L|3OKI|2M|2P|2R|3C|2T|3MX|3Y|2U|3EL|3ND|2X|1G|2B|2DX|2E|2LY|2N|2O|3LD|2P|3T|2R|3OK|2T|1HA|3CK|3DE|3K|4E|3MAN|3N|4G|3RBI|4D|5S|4E|5S|4K|4PE|3UN|2B4|2D|3W|2E|3B|3ESH|3I|3LL|3N|3PE|3RA|3ZMU|2FL|3T|2G|2I|3A|3B|405|42|4AC|5I|5Y|4GF|4IC|4K|4L|4O|4TC|4U|3CO|3DO|3ELD|3FT|3H|3K|3L|4L|5D|3NA|4JA|4O|4T|3P|3T|3V|2K|2L|3D|2ND|2O|3E|3N|3P|4X|3RTY|3W|2PING|2R|3AP|3ED|4K|3OOM|2S|2UB|2VR|2X|1I|2B|3A|2C|2DE|3US|2ERRA|2FT|3U|2G|3N|4A|5T|3T|3U|2L|3K|4R|4T|3LY|3O|3V2|4A|4ER|2MP|4LE|2N|3E|3G|4LE|3S|4O|3X|2P|3HER|4ON|2R|2S|3A|3C|3HI|2U|3UU|2V|2X|2Z|3E|1JCX|1KB|2C|3S|2EB|3T|3Y|2I|3D|3LL|3N|4S|2L|3AY|2M|2PEPE|2R|3B|3IMP|3P|3T|3Y|2T|2U|3LL|2Y|3FT|3M|3RIM|3X|1LA|3M|2B|2C|3L|2EEP|3RF|52|3X|2G|2ICE|5C|3M|4E|3NG|4K|2M|2N|3D|3V2|2OKI|3RK|3TH|2P|3V1|2R|3R|3S|2S|3T|2T|2VX|2X|1MA|3C|3RS|4T|5B|5O|3T|2BR|2C|3W|2D|2ETA|2F|2G|2H|2I|3LE|5K|5Y|2L|3Y|2M|2OG|3KE|3L|4E|3N|3ON|2PF|3L|2R|3AT|3T|4R|2SR|2T|3F|3Y|2U|3DGE|1N|2ACK|3KES|3P|2B|2C|3T|2D|2E|3K|4E|3T|2FTS|2GLS|2IP|3TCH|2K|2L|2M|2N|2OB|3OP|5Y|3V|3W|2PC|3S|2RG|3K|2S|3T|3Y|2T|3R|3VT|2X|2Y|1O|2AI|3K|3R|2BA|3B|3ER|2C|3A|3C|4ER|3KS|3OLA|2DA|3O|2FI|2HOT|2IL|2J|2KU|2L|310|3A|4MA|5B|4PE|4R|5E|4V|3C|4EX|3E|4X|3ID|3KIT|3O|3PAD|3R|3S|4CC|3VE|3X|2M|3A|3M|2N|3AR|3G|3IC|5O|3NE|2ON|2P|2R|3A|2T|3A|2UL|4O|4S|3ND|3RCE|2V|3E|3I|2Y|1P|28DE|2A|3CE|3I|4N|3NK|3RKO|4TA|3T|3Y|2C|3IE|3T|2D|3R|3X|2E|3C|3EDY|3LL|3ND|5C|3PE|3X|2F|3C|2G|3BB|2H|3ERE|3R|4I|3TX|3YNX|2I|3CE|3DER|5Y|3KE|3N|3RIT|3Z|2K|3L|3TR|2LA|2M|2N|3D|2O|3K|3L|3NGE|3ODY|4L|3RE|4T|3TS|3X|2RING|3KL|3T|4S|4Z|2S|2T|2UME|3RDO|4S|2WN|2X|3C|2Y|3RO|1QAT|2G|2L|2R|2T|3S|2UA|4D|4WK|3ID|52|1RBP|2C|3OIN|3X|2EUR|2G|2K|2LTY|2M|2N|3T|2P|2T|2WD|2X|1S|2B|2C|2D|2E|2G|3T|2H|3IB|4P|2LX|2S|2T|3C|2U|2V|2WP|2X|1T|2A|3BLZ|3C|4K|5S|4S|3K|4E|3LIN|3MP|3PT|3R|4C|4K|4L|5Y|4P|4S|5H|4T|5A|3SH|3T|4E|5R|4S|3X|2BU|2C|3N|2D|3YDX|2EAK|3EM|5D|4P|3LLA|3MX|3N|3P|4G|4H|4R|4S|3TH|3WIE|3X|2F|3X|2G|2HR|2I|3C|3K|3MA|4E|3NG|4J|2JUNO|2K|3BNB|3K|2LE|2MAN|3X|2ND|3EAR|2O|3GE|3N|4E|4K|5S|3P|3R|4E|4J|4M|4Y|3S|4MO|3X|2P|3L|3T|2Q|2R|3AKS|4X|4Y|3D|4Y|3EAM|3I|4P|3K|3M|3NGR|3ONG|3P|3S|3X|2S|3OL|3R|3W|2T|2U|3ART|3D|3SDT|2V|2X|2YL|4E|2Z|3EN|3U|1U|2BAWU|3S|2CR|2DO|2GAR|2I|3A|3P|2KU|2M|3MER|3O|2N|3C|3DAE|3EX|3I|3NY|3OLD|3V1|2P|3E|4R|5C|2R|3E|3F|3V|2SD|4E|3HI|2TEKU|4R|2ZUME|1VD|2N|2PN|2S|2T|2X|2Y|1WA|3CH|3G|3MP|3P|4P|4Z|3RM|5M|3SH|3Y|2C|3H|2D|3AO|2EAT|3EP|4T|3TH|2FL|3TC|2G|2H|2IFT|3M|3N|4G|3RL|5X|3SE|3TCH|2M|2OLE|3P|3T|2P|3R|4S|2RV|2T|3H|3S|2U|2YFTT|1X|2C|2DT|2M|2P|2S|2UT|1YA|2BC|3L|3TC|2C|2L|3O|2M|2N|3C|4C|4O|3LEV|3R|3TH|3X|2POOL|2S|1ZCB|0T23|199|1AAS|2B|3OO|2C|2D|2F|2GR|2I|3L|3YO|2J|2K|3I|2LAO|3IS|3K|2MA|2N|3G|4O|3K|2O|3NU|2P|3C|3T|2RA|4L|3I|3OT|3P|2S|3H|3TE|2T|3A|3E|3SU|2U|3C|3M|3R|2VA|2X|1BAC|3NK|3R|2B|2C|3C|3X|2E|2IS|2L|2T|3C|2X|1CANDY|3P|3T|2C|2G2|3C|2H|3AIN|3B|3TRX|2NH|3X|2O|2P|2R|2S|2T|2X|2Y|1D|2E|2FB|3Y|2P|2ROP|2S|2X|1EA|3M|2C|3AR|3H|3RA|2D|3DY|2E|3R|2K|2L|3E|3L|4ER|3O|4S|2M|3CO|3P|2N|3D|4IE|3ET|3FI|3NET|3SHI|3T|2P|2R|3A|4R|3N|3RA|3Z|2S|3LA|5I|3T|4A|2T|3HER|4YS|3RA|3U|1FBX|2C|2I|2L|3OW|2S|2T|2UEL|1GAME|2C|3C|2PT|2T|1H|2ALES|2C|2E|39|3CA|3DAO|3MIS|3N|3O|4S|3TA|3X|2G|2ING|2L|2N|3X|2O|3L|3R|2P|2R|3T|3Y|2S|2T|2UG|2X|1I|2A|3NHE|2C|2DAL|3E|2E|2FI|2G|3ER|5C|3RES|2IM|2K|3I|2M|3E|3I|2N|3C|3KU|3U|3Y|2OX|2P|3INU|3S|4Y|2T|3A|4N|5O|5X|3C|3I|3TY|2USD|2X|1KA|2B|2C|2G|2ING|4U|2MN|2N|2O|2P|2R|2S|3T|2T|2X|2Y|1LC|2M|2N|2OS|2P|2W|1ME|3D|2N|3T|2ON|2RW|2T|3G|1N|2B|2C|2DC|2GBL|2S|3R|2T|1OA|3D|2B|2C|2DAY|2K|3A|4U|3C|3E|4N|3KI|3O|3U|2L|2M|3B|3I|3OE|3S|2N|3E|3I|4C|3NEL|3S|3UP|2OB|3LS|3N|4F|2PC|3G|3IA|3N|2R|3E|3G|3I|4I|3N|2S|3A|3C|3DIS|3HE|4I|2T|3EM|3M|3O|2WER|3N|2X|2YBOX|2Z|1P|2AD|3Y|2C|3ASH|2G|2T|2V|2Y|1QRT|1R3|2A|3C|4E|4N|3DE|5X|3ID|3K|3NQ|4S|3T|3VA|3XIA|4X|2B|3T|3V1|2C|3B|3L|3T|2DC|3L|3S|3T|2EAT|3E|4B|3MP|3T|2G|3I|2I|3A|4S|3BE|4L|3CK|3G|3NI|3O|3PAD|3VIA|3X|2K|2L|2MX|2NDZ|2OLL|3P|3SS|3VE|3Y|2P|2R|2SCT|3T|2TL|3T|2U|3CE|3E|3F|3MP|3ST|3TH|2V|3C|3L|2WP|2X|3C|3WIN|2YB|3C|3X|1SA|2C|3T|2D|2E|2F|2G|2HARE|3P|2L|2N|2R|2UGT|3KA|2X|1T|2C|2K|2M|2N|2T|2U|2V|1UBE|2CKER|2DA|2F|2LIP|2NA|3E|2P|2R|3BO|5S|3T|2S|3D|2T|2ZLA|1VK|2NT|2RS|1W|2C|2D|2EE|4TY|3LVE|3P|2IN|3ST|2LV|2OGE|2T|1X|220|2A|3G|3U|2BIT|2G|2L|2T|1YBG|4S|2C|3OON|2PE|2RANT|3ION|2T|1ZC|2KI|0U8D|1AEC|2T|1BA|2C|2DN|2EX|2I|3Q|2Q|2T|3C|2X|3N|3S|3T|1C|2A|3P|3SH|2G|2H|2JL|2N|2O|3IN|3N|3RE|2T|2X|1DO|3O|2T|1EC|2DC|2NC|2T|3L|1FARM|2C|2FYI|2I|2O|3C|2R|2T|1GAS|2C|2OLD|2T|1HP|1IM|2N|2P|2S|1JENNY|1KG|1LT|3C|3GG|3IMA|3RA|2X|1M|2A|3D|3MI|2B|3R|2C|2I|2K|2MA|2O|2T|2X|2Y|1NAT|2B|3NK|2C|3L|3X|2D|3B|3EAD|3G|3X|2F|3I|2I|3BOT|3C|4E|3DX|3FY|3M|3Q|4UE|3T|4ED|4S|4Y|3VRS|3X|2M|3D|2N|2O|3B|2P|2Q|3T|2R|3C|2S|2W|1OP|2S|1P|2C|3G|3O2|4IN|2DOG|2EUR|2I|2LOAD|2O|2P|2R|3O|2S|2TOS|2UNK|3SD|2X|1QC|1R|2AC|3LS|2FA|2O|2QA|2S|2US|2X|1SAT|2C|3C|3OIN|2DA|4P|3B|4C|3C|3D|3E|4BT|4X|3FL|3G|4LO|3H|3I|3J|3K|3M|3N|3O|3P|3Q|3R|3S|4B|3T|4V|4Z|3U|3V|3X|3Y|3Z|2E|2G|2HARK|3I|4BA|2K|2N|3BT|3OTA|2P|3LUS|2T|3C|3X|2V|2X|1T|2BAI|2C|2G|2H|2I|3L|2K|2NP|2T|2U|2X|1USD|2U|1VT|1W3S|2U|1X|2OS|2P|1ZX|0VAAVE|2B|2DA|3ER|2I|3OT|2L|3AS|3I|4D|3OR|3UE|2N|3A|3CAT|3RY|3T|3Y|2PE|3OR|2RA|3IUS|3K|2ULT|1BCH|2ETH|2G|2IT|2K|2NB|3T|2SC|3WAP|2T|3C|1C|2AKE|2F|2G|2HF|2K|2NT|2ORE|2X|1DG|2L|2O|3GE|3T|2R|2V|2X|2Z|1EC|32|2E|3D|3N|2G|3A|4S|3E|2IL|2KTOR|2LA|3O|4D|4X|2MP|2N|3A|3OM|3T|4I|3US|2O|2R|3A|3I|4C|3SA|4E|3TEX|3VE|2ST|2T|3H|3ME|3TER|2UR|2X|3T|1FIL|2OX|2T|1GO|2X|1HC|1I|2A|2B|3E|3LO|2C|3A|3EX|2D|3A|3T|3Y|4A|4X|3Z|2EW|2G|2K|3KY|2M|2N|3CI|3U|2OR|2P|3ER|3S|2RAL|3ES|2S|3IO|5N|3R|2T|3A|4E|4L|3E|3RA|3Y|2U|2VID|3O|2X|2Z|1KNF|1LC|2S|2T|3C|3X|3Y|2UNA|2X|3PAD|1MATIC|2C|2E|2INT|2PX|2S|2T|1NDC|3T|2ES|2LNK|2M|2N|2O|2T|3W|2X|3AU|3LU|2Y|1OCARE|3O|2DKA|2ISE|2L|3LAR|3R|3T|4A|4V1|52|4Z|2NE|2OT|2T|2W|2X|3EL|2Y|3A|1P|2AD|2K|2ND|2P|2R|3C|1R|2A|2C|2GW|2H|2L|2M|2N|2O|3OM|2P|2S|3C|3E|3W|2T|3X|3Y|2X|1SC|2D|2G|2HARE|2L|2O|2P|2TA|2UI|2X|2YS|1T|2C|2G|2HO|2L|2M|2N|2OS|2RO|3X|2S|2U|3SD|2X|2Y|1UC|2LC|2NI|2ZZ|1V|2I|2S|1X|2L|2RP|2T|2V|1YBE|2FI|2NC|1ZT|0W1|22|12E|13C|2M|2S|2W|18BIT|1AB|3I|2CO|2D|3A|2G|3E|3G|3MI|5T|3ON|2I|3F|4U|3T|2L|3K|3LET|4Y|3V|2M|3PL|2N|3A|3D|3NA|2R|3P|4ED|3S|2S|3ABI|3H|3SIE|3TR|2TER|2VES|2XE|3L|3P|2Y|1BB|3C|2CH|2ESC|3T|4H|2IND|2N|3B|2OND|4ES|2S|2T|3C|2X|1CA|3NTO|2C|3X|2ELL|4O|2FG|2G|2OIN|3RE|2S|3OV|2T|2USD|1DC|2OG|4E|3T|2R|2X|1E|2ALTH|3PON|3R|2B|33|34|35|3AI|3C|3D|2C|3O|2D|2ETH|2FI|2GEN|3LD|2LA|3D|3L|3T|3UPS|2MIX|2N|2OS|2ST|2T|3H|4V1|4W|2VE|2WE|2X|3O|1FAI|2IL|2LOW|2O|2T|2USE|2X|1GC|2HOST|2L|2O|2P|2R|3T|2T|1HALE|5S|2BAR|2EAT|3E|4L|3N|3X|2IRL|3TE|2L|2O|3REN|2T|2X|1IB|2C|3C|2F|3I|3S|4A|2GO|2KEN|3I|2LC|3D|4C|2N|3E|3G|4S|3K|3N|3R|4Y|3T|4ER|2OTX|2S|3C|3E|3H|3TA|2T|3CH|2X|1JEWEL|2XN|1KAVA|2C|2D|1LD|2F|2ITI|2K|3N|2O|2UNA|4C|2XT|1MATIC|2B|2C|2EMO|2F|2NT|2OXY|2T|2W|2X|3WOM|1NCG|2D|3R|2EAR|3ON|3T|2K|2RZ|2T|2XM|2YC|2Z|1OA|2D|2FM|2ID|2J|3AK|52|2KT|2L|3F|4OF|4Y|2M|3B|4AT|3E|4N|3I|2N|3DER|3E|2O|3D|3F|4Y|3L|3NK|3O|4OO|3P|2P|2R|3K|3LD|3M|3X|2W|3S|2ZX|1PC|2E|2I|2LS|2OKT|2P|2R|1QT|1RC|2K|2LD|2ONG|3SE|2T|2X|2Z|1SB|3ABY|3S|2CRT|2DOGE|2G|2HIB|2I|2M|2PP|2TETH|3OR|3R|2X|1T|2AO|2C|2F|3T|3UEL|2G|2K|2L|2N|2ON|2T|2WOOL|1UST|1WB|2D|3OGE|2EMIX|2F|2Y|1X|2DAI|2T|3Z|1YNN|2S|1ZEC|3NIQ|2M|2RD|0X2|2Y2|142|17C|2DAO|2R|18X|1ACT|2H|2I|2MP|2NK|2P|2R|2S|2T|2UC|3R|3T|2VA|2YA|1BASE|2B|2C|2E|2G|2I|2L|2N|2OND|3T|2P|2S|2T|3C|3S|2X|2Y|1C|2AD|3L|3SH|4TR|2E|3L|3PT|2F|3X|2G|2H|3F|2I|2LR|2M|2N|2O|3M|2P|3O|2R|3E|3X|2T|2UR|2V|2XT|1D|2AG|3I|3O|3TA|2B|2C|3E|2EF2|4I|3N|2G|2N|3A|2OGE|3T|2P|2Q|1EC|2D|2L|3S|2M|2N|3D|3IX|3O|2P|2RS|2S|2T|3A|3H|1FC|2I|3T|2LOKI|2T|3C|2UND|2YI|1G|2B|2C|2EM|2LI|2OLD|2PT|2R|2T|1HI|2T|2V|1I|2ASI|2D|3O|3R|2L|2N|3U|2O|3S|3T|2V|1JEWEL|2O|1KI|1LA|3B|2B|2C|2D|2M|2N|2Q|2R|2T|1MARK|3S|2C|3C|2ETA|2G|2N|2O|3N|2P|2R|3G|2S|2T|2V|2X|2Y|1NA|2B|2C|2FT|2G|2K|2L|2N|2O|2S|2T|2V|2X|1ODEX|2LO|2R|2T|2V|2X|1P|2A|3T|3Y|2B|2C|2D|2E|3T|2H|3X|2L|3A|3L|2M|2N|3D|3ET|2O|3KE|2R|3ESS|3O|4T|3T|2S|3T|2T|3P|3X|2X|2Y|1QC|2N|2R|2UOK|1RA|3I|3Y|2C|2D|2E|2ISE|2L|3M|2P|32|40|3C|3H|2T|2UN|4E|1SAUCE|2C|2D|2EED|2GD|2H|3IB|2I|2LR|2N|2P|3C|3EC|3T|2R|2T|3AR|3C|2USHI|1T|23|2AG|3L|2C|2K|2M|2O|2P|2R|3A|3EME|2TB20|2USD|2X|2Z|1UC|2I|2N|2P|3S|1VC|2E|2G|2P|2R|2S|1WC|2G|2IN|2P|2T|1X|2A|2X|1Y|2M|2O|2Z|0Y2K|1AC|3HT|2E|2G|2K|3S|3U|2M|3A|3V1|42|2OYAO|2P|2RL|2W|2XIS|2Y|1BC|2O|1CC|2E|2O|2T|1DF|2OGE|2R|1EC|2E|3D|2FI|2L|2ON|2S|3P|2TI|3U|1FARM|2BETA|3T|2DAI|2F|3C|3I|4I|2I|3E|3I|4I|3VE|2L|2O|2PRO|2TE|2V|2X|1GG|1IELD|5X|2KES|2N|3BI|1LC|2D|3Y|1MC|2S|1O|2BASE|2C|3O|2D|2LO|2OSHI|2P|2SHI|2TD|3O|2U|3C|3RAI|2VI|2YOW|1PIE|1SAFE|2EC|2R|1TA|2N|1U|2ANG|2CJ|3T|2DI|2GE|2KI|3KY|2M|3MI|4Y|2P|2RI|2SE|2ZU|1VS|1YAVAX|2E|2FI|0Z3|1ABAKU|2FI|2I|3F|2M|3ZAM|2NO|2P|2RP|3X|2SH|2T|1B|2C|2IT|2U|1CC|31|2G|2HN|2L|2N|2O|3N|3R|2R|2ULT|2X|1DEX|2R|1EC|3D|2D|3X|2E|2FI|3U|2IT|2L|3IX|2N|3C|3F|3I|4Q|4TH|2ON|2P|3H|2R|3O|4B|4EX|2S|3T|2T|32|3A|3RIX|2UM|3S|2XI|1F|2L|2M|1GD|2EM|1IG|2K|2L|2NC|3U|2P|3T|2RVE|2X|2ZY|1JLT|1K|2BOB|2DOGE|2F|2HIVE|2ID|2LAB|2ML|2P|3AD|3EPE|2S|3HIB|3P|2T|2Z|1LA|2DA|2K|2OT|2Q|2W|1MBE|2N|2T|1ND|2E|2N|2T|2X|2Y|2Z|1OA|2C|2DI|2E|2I|2NE|3O|3X|2O|3M|4ER|3N|3T|2RA|3O|3T|1P|2AE|3Y|2C|2R|3O|2T|3C|1RC|2O|2X|1SC|2E|1T|2C|2G|2X|1UC|2KI|2M|2NA|2R|3R|2SD|2T|2ZALU|3UAI|1VC|1WAP|1XC|2T|1YD|2N|2R|3O|2TARA|1Z|2C|2Z","sep":"|"}]},{"id":"fr-datasets-2011-february-us-airport-traffic-e9c718","columns":["airport","city","state"],"n":221,"cols":[{"s":"Chicago O'Hare International|William B Hartsfield-Atlanta Intl|Dallas-Fort Worth International|Phoenix Sky Harbor International|Denver Intl|George Bush Intercontinental|San Francisco International|Orlando International|Charlotte/Douglas International|Salt Lake City Intl|McCarran International|Philadelphia Intl|Minneapolis-St Paul Intl|Seattle-Tacoma Intl|LaGuardia|Washington Dulles International|Lambert-St Louis International|Detroit Metropolitan-Wayne County|New Orleans International|Portland Intl|Memphis International|General Mitchell International|Cleveland-Hopkins Intl|Jacksonville International|Indianapolis International|Will Rogers World|Cincinnati Northern Kentucky Intl|Port Columbus Intl|Adams|Eppley Airfield|Greater Rochester Int'l|Albuquerque International|Jackson International|Birmingham International|Columbia Metropolitan|Wichita Mid-Continent|Des Moines International|Rapid City Regional|Hector International|Springfield-Branson Regional|Charleston AFB/International|Boise Air Terminal|Jackson Hole|Gallatin|Greenbrier Valley|Marquette County Airport|Abilene Regional|Akron-Canton Regional|Albany Cty|Alexandria International|Lehigh Valley International|Outagamie County Regional|Arcata|Ronald Reagan Washington National|Asheville Regional|Aspen-Pitkin Co/Sardy|Bush|Austin-Bergstrom International|Baltimore-Washington International|Baton Rouge Metropolitan, Ryan|Florida Beach|Bellingham Intl|Billings Logan Intl|Bismarck Municipal|Central Illinois Regional|Gen Edw L Logan Intl|Tri-Cities Regional|Glynco Jetport|Buffalo Niagara Intl|Burbank-Glendale-Pasadena|Burlington International|Natrona County Intl|Cedar City Muni|Eastern Iowa|University of Illinois-Willard|Yeager|Charlottesville-Albermarle|Lovell|Cheyenne|Chicago Midway|Yellowstone Regional|City of Colorado Springs Muni|Columbus Metropolitan|Golden Triangle Regional|Corpus Christi International|Dallas Love|James M Cox Dayton Intl|Daytona Beach International|Dothan|Dubuque Municipal|Duluth International|Eagle County Regional|Chippewa Valley Regional|El Paso International|Mahlon Sweet|Evansville Regional|Fayetteville Municipal|Northwest Arkansas Regional|Bishop|Fort Smith Regional|Fort Wayne International|Fresno Yosemite International|Fort Lauderdale-Hollywood Int'l|Southwest Florida International|Gillette-Campbell County|Grand Forks International|Walker|Kent County International|Great Falls Intl|Austin Straubel International|Piedmont Triad International|Greenville-Spartanburg|Gulfport-Biloxi Regional|Gunnison County|Valley International|Harrisburg Intl|Yampa Valley|Helena Regional|Branson Airport|William P Hobby|Huntsville International|Idaho Falls Regional|Inyokern|Long Island - MacArthur|Albert J Ellis|Glacier Park Intl|Kansas City International|Robert Gray AAF|Klamath Falls International|McGhee-Tyson|Lafayette Regional|Laredo International|Lewiston-Nez Perce County|Blue Grass|Lincoln Municipal|Long Beach (Daugherty )|Los Angeles International|Louisville International-Standiford|Lubbock International|Dane County Regional|Mammoth Yosemite|Manchester|Manhattan Regional|McAllen Miller International|Rogue Valley International|Melbourne International|Key|Miami International|Midland International|Minot International|Mobile Regional|Quad City|Monroe Regional|Monterey Peninsula|Montgomery Regional Apt|Montrose Regional|Central Wisconsin|Myrtle Beach International|Nashville International|Craven County Regional|John F Kennedy Intl|Newark Intl|Stewart|Newport News/Williamsburg International|Norfolk International|North Bend Muni|Metropolitan Oakland International|Ontario International|Barkley Regional|Palm Springs International|Tri-Cities|Pensacola Regional|Greater Peoria Regional|Pittsburgh International|Pocatello Regional|Portland International Jetport|Theodore F Green State|Raleigh-Durham International|Redding Municipal|Roberts|Reno/Tahoe International|Richmond International|Roanoke Regional/ Woodrum|Rochester International|Rock Springs-Sweetwater County|Sacramento International|San Antonio International|San Diego International-Lindbergh|San Jose International|San Luis Obispo Co-McChesney|John Wayne /Orange Co|Santa Barbara Municipal|Santa Fe Municipal|Santa Maria Pub/Capt G Allan Hancock|Sarasota Bradenton International|Savannah International|Shreveport Regional|Joe Foss|South Bend Regional|Spokane Intl|Capital|St. Petersburg-Clearwater International|Syracuse-Hancock Intl|Tallahassee Regional|Tampa International|Telluride Regional|Cherry Capital|Tucson International|Tulsa International|Tunica Municipal Airport|Joslin Field - Magic Valley|Tyler Pounds|Valdosta Regional|Eglin Air Force Base|Palm Beach International|Westchester Cty|Sheppard AFB/Wichita Falls Municipal|Wilkes-Barre/Scranton Intl|Wilmington International|Bradley International|Yuma MCAS-Yuma International","sep":"|"},{"f":"0Chicago|0Atlanta|0Dallas-Fort Worth|0Phoenix|0Denver|0Houston|0San Francisco|0Orlando|0Charlotte|0Salt Lake City|0Las Vegas|0Philadelphia|0Minneapolis|0Seattle|0New York|0Chantilly|0St Louis|0Detroit|0New Orleans|0Portland|0Memphis|1ilwaukee|0Cleveland|0Jacksonville|0Indianapolis|0Oklahoma City|0Covington|2lumbus|0Little Rock|0Omaha|0Rochester|0Albuquerque|0Jackson|0Birmingham|0Columbia|0Wichita|0Des Moines|0Rapid City|0Fargo|0Springfield|0Charleston|0Boise|0Jackson|0Bozeman|0Lewisburg|0|0Abilene|1kron|1lbany|2exandria|2lentown|1ppleton|1rcata/Eureka|2lington|1sheville|2pen|1ugusta|2stin|0Baltimore|2ton Rouge|1eaches|2llingham|1illings|2smarck|1loomington|1oston|1ristol|2unswick|1uffalo|2rbank|3lington|0Casper|1edar City|6Rapids|1hampaign/Urbana|3rleston|5ottesville|3ttanooga|2eyenne|2icago|1ody|2lorado Springs|3umbus|8-Starkville-West Point|2rpus Christi|0Dallas|2yton|6a Beach|1othan|1ubuque|2luth|0Eagle|2u Claire|1l Paso|1ugene|1vansville|0Fayetteville|c/Springdale/Rogers|1lint|1ort Smith|5Wayne|1resno|1t. Lauderdale|4Myers|0Gillette|1rand Forks|6Junction|6Rapids|2eat Falls|3en Bay|5sboro|4r|1ulfport-Biloxi|2nnison|0Harlingen|3risburg|2yden|1elena|1ollister|2uston|1untsville|0Idaho Falls|1nyokern|1slip|0Jacksonville|0Kalispell|2nsas City|1illeen|1lamath Falls|1noxville|0Lafayette|2redo|1ewiston|2xington|1incoln|1ong Beach|2s Angeles|2uisville|1ubbock|0Madison|2mmoth Lakes|2nchester|3hattan|1cAllen|1edford|2lbourne|2ridian|1iami|2dland|2not|1obile|2line|2nroe|3terey|4gomery|4rose|2sinee|1yrtle Beach|0Nashville|1ew Bern|4York|3ark|3burgh|3port News|1orfolk|3th Bend|0Oakland|1ntario|0Paducah|2lm Springs|2sco|1ensacola|2oria|1ittsburgh|1ocatello|2rtland|1rovidence|0Raleigh|1edding|3mond|2no|1ichmond|1oanoke|2chester|3k Springs|0Sacramento|2n Antonio|4Diego|4Jose|4Luis Obispo|3ta Ana|6Barbara|6Fe|6Maria|2rasota|2vannah|1hreveport|1ioux Falls|1outh Bend|1pokane|2ringfield|1t. Petersburg|1yracuse|0Tallahassee|2mpa|1elluride|1raverse City|1ucson|2lsa|2nica|1win Falls|1yler|0Valdosta|3paraiso|0West Palm Beach|1hite Plains|1ichita Falls|2lkes-Barre/Scranton|3mington|2ndsor Locks|0Yuma","sep":"|"},{"d":"IL|GA|TX|AZ|CO|CA|FL|NC|UT|NV|PA|MN|WA|NY|VA|MO|MI|LA|OR|TN|WI|OH|IN|OK|KY|AR|NE|NM|MS|AL|SC|KS|IA|SD|ND|ID|WY|MT|WV||MD|MA|VT|NH|NJ|ME|RI|CT","i":"0,1,2,3,4,2,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,6,m,n,o,l,p,q,d,r,s,t,u,v,w,x,y,f,u,z,10,11,12,13,2,l,d,h,a,k,5,e,7,4,1,2,14,h,6,c,11,y,0,15,j,1,d,5,16,10,8,w,0,12,e,j,10,0,10,4,1,s,2,2,l,6,t,w,b,4,k,2,i,m,7,p,g,p,m,5,6,6,10,y,4,g,11,k,7,u,s,4,2,a,4,11,f,2,t,z,5,d,7,11,f,2,i,j,h,2,z,o,q,5,5,o,2,k,5,17,v,2,i,6,s,6,2,y,t,0,h,5,t,4,k,u,j,7,d,18,d,e,e,i,5,5,o,5,c,6,0,a,z,19,1a,7,5,i,9,e,e,b,10,5,2,5,5,5,5,5,r,5,6,1,h,x,m,c,0,6,d,6,6,4,g,3,n,s,z,2,1,6,6,d,2,a,7,1b,3","sep":"|"}]},{"id":"fr-tidytuesday-country-subdivisions-eaf4dc","columns":["name","type"],"n":5046,"cols":[{"f":"0Canillo|0‘Ajmān|0Balkh|0Saint George|6John|6Mary|6Paul|7eter|7hilip|0Barbuda|1erat|0Aragac̣otn|0Erevan|0Huíla|0La Rioja|0San Juan|0Misiones|0Río Negro|0Córdoba|0Santa Cruz|0Burgenland|0Australian Capital Territory|1bşeron|0Bakı|0Lənkəran|0Naxçıvan|8|0Şəki|0Yevlax|0Federacija Bosne i Hercegovine|0Saint Andrew|6James|7oseph|6Thomas|0Bandarban|2rishal|0Chattogram|0Dhaka|0Khulna|0Mymensingh|0Rajshahi|2ngpur|0Sylhet|0Barishal|0Limburg|1uxembourg|0Centre|0Nord|0Comoé|0Montana|0Ruse|0Al ‘Āşimah|1tacora|0Littoral|0Plateau|0La Paz|0Bonaire|0Saba|1int Eustatius|0Amazonas|0Pará|0Santa Catarina|0New Providence|0San Salvador|0Central|0Jwaneng|0North East|6West|0South East|5ern|0Bresckaja voblasć|0Toledo|0Ouham|0Bangui|0Gribingui|0Sangha|0Plateaux|0Aargau|0Jura|0Abidjan|0Savanes|0Los Ríos|0South-West|0Guangxi Zhuangzu Zizhiqu|0Hong Kong SAR|0Bolívar|0Distrito Capital de Bogotá|0Sucre|1an José|0Ilhas de Barlavento|0Praha, Hlavní město|0Tábor|0Brandenburg|0Saint David|6Mark|6Patrick|0Adrar|1lutaguse|0Haapsalu|1iiumaa|0Rakvere|0Saaremaa|0Tartu|0Viljandi|1õru|0Ash Sharqīyah|1l Janūbī|3Awsaţ|1ndalucía|0Cantabria|1euta|0Granada|0Illes Balears [Islas Baleares]|0León|0Addis Ababa|1far|0Eastern|0Northern|0Western|0Ain|0Corse|0Guadeloupe|0Martinique|0Auvergne-Rhône-Alpes|0Saint-Barthélemy|0Aberdeenshire|0Isle of Anglesey [Sir Ynys Môn GB-YNM]|0Barking and Dagenham|1irmingham|0Cambridgeshire|0England|0Manchester|0Boké|0Kindia|0Faranah|0Kankan|0Labé|0Mamou|0Nzérékoré|0Colón|0Békéscsaba|0Veszprém|0Jawa|0Maluku|0Papua|0Andaman and Nicobar Islands|0Punjab|0Agrigento|0Bari|1olzano|0Gorizia|0Busia|0Gilbert Islands|0Raseon|0Gangwon-teukbyeoljachido|0Viangchan|0Choiseul|0Maryland|0Akmenė|1lytaus miestas|0Daugavpils|0Banghāzī|0Safi|0La Colle|0Călărași|0Ralik chain|0Attard|0South Ari Atoll|0Mwanza|0Wilayah Persekutuan Kuala Lumpur|0Gaza|0Maputo|0Abuja Federal Capital Territory|0Svalbard (Arctic Region)|0Emberá|0La Libertad|3Union|0Gilgit-Baltistan|0Dolnośląskie|0Beja|0Adygeja, Respublika|1ltajskij kraj|0Moskva|0Al Jawf|0Saint Louis|0Ascension|0North Western|0Arima|0Niutao|0Chiayi|0Hsinchu|0Johnston Atoll|0American Samoa|0Florida|0Toshkent|0Alo|0Dire Dawa|0Faadhippolhu|1elidhu Atoll|1uvammulah|0Hahdhunmathi|0Kolhumadulu|0Male Atoll|1ulaku Atoll|0North Ari Atoll|6Huvadhu Atoll|6Maalhosmadulu|7iladhunmadulu|6Nilandhe Atoll|6Thiladhunmathi|0South Huvadhu Atoll|6Maalhosmadulu|7iladhunmadulu|6Nilandhe Atoll|6Thiladhunmathi|1igave|0Uvea|0Amurskaja oblast'|1natolikí Makedonía kai Thráki|1rhangel'skaja oblast'|1strahanskaja oblast'|1ttikí|0Belgorodskaja oblast'|1rjanskaja oblast'|0Chelyabinskaya oblast'|0Dytikí Elláda|7Makedonía|0Ionía Nísia|1rkutskaja oblast'|1vanovskaja oblast'|0Jaroslavskaja oblast'|0Kaliningradskaja oblast'|3uzhskaya oblast'|1emerovskaja oblast'|2ntrikí Makedonía|1irovskaja oblast'|1ostromskaja oblast'|1ríti|1urganskaja oblast'|3skaja oblast'|0Leningradskaja oblast'|1ipeckaja oblast'|0Magadanskaja oblast'|1oskovskaja oblast'|1urmanskaja oblast'|0Nizhegorodskaya oblast'|1ovgorodskaja oblast'|3osibirskaja oblast'|1ótio Aigaío|0Omskaja oblast'|1renburgskaja oblast'|2lovskaja oblast'|0Pelopónnisos|2nzenskaja oblast'|1skovskaja oblast'|0Rjazanskaja oblast'|1ostovskaja oblast'|0Sahalinskaja oblast'|2marskaja oblast'|2ratovskaja oblast'|1molenskaja oblast'|1tereá Elláda|1verdlovskaja oblast'|0Tambovskaja oblast'|1hessalía|1jumenskaja oblast'|1omskaja oblast'|1ul'skaja oblast'|1verskaja oblast'|0Ul'janovskaja oblast'|0Vladimirskaja oblast'|1olgogradskaja oblast'|3ogodskaja oblast'|2ronezhskaya oblast'|1óreio Aigaío|0Ípeiros|0Habarovskij kraj|0Kamchatskiy kray|1rasnodarskij kraj|6jarskij kraj|0Permskij kraj|1rimorskij kraj|0Stavropol'skij kraj|0Zabajkal'skij kraj|0Jan Mayen (Arctic Region)|0Western Area (Freetown)|0Sankt-Peterburg|0Melilla|0Aragón|1sturias, Principado de|0Canarias|2stilla y León|8-La Mancha|2talunya [Cataluña]|0Euskal Herria|1xtremadura|0Galicia [Galicia]|0La Rioja|0Madrid, Comunidad de|1urcia, Región de|0Nafarroako Foru Komunitatea*|0Valenciana, Comunidad|0Chukotskiy avtonomnyy okrug|0Hanty-Mansijskij avtonomnyj okrug|0Jamalo-Neneckij avtonomnyj okrug|0Neneckij avtonomnyj okrug|0Yamoussoukro|0Phnom Penh|0Kosovo-Metohija|0Trento|0Vojvodina|0Bougainville|0Costa Caribe Norte|dSur|0Evrejskaja avtonomnaja oblast'|0Friuli Venezia Giulia|0Kŭhistoni Badakhshon|0Nei Mongol Zizhiqu|1ingxia Huizu Zizhiqu|0Príncipe|0Região Autónoma da Madeira|hos Açores|0Sardegna|1icilia|0Trentino-Alto Adige|0Val d'Aoste|0Xinjiang Uygur Zizhiqu|2zang Zizhiqu|0Abkhazia|1jaria|0Bissau|0Găgăuzia, Unitatea teritorială autonomă (UTAG)|0Chaguanas|0Point Fortin|0Appenzell Ausserrhoden|aInnerrhoden|0Basel-Landschaft|6Stadt|1erne|0Capellen|1lervaux|0Diekirch|0Echternach|1sch-sur-Alzette|0Fribourg|0Genève|1larus|1raubünden|2evenmacher|0Luxembourg|2zern|0Mersch|0Neuchâtel|1idwalden|0Obwalden|0Redange|2mich|0Sankt Gallen|1chaffhausen|3wyz|1olothurn|0Thurgau|1icino|0Uri|0Valais|2ud|1ianden|0Wiltz|0Zug|1ürich|0Asunción|0Budapest|0P'yǒngyang|0Ulaanbaatar|0Distrito Capital|0Jakarta Raya|0Capital Territory (Honiara)|0Dushanbe|0Ratak chain|0Addu City|1lmaty|1stana|1şgabat|0Banjul|1ender [Tighina]|2ograd|1ishkek Shaary|1ălți|0Chișinău|1ity of Kigali|2udad Autónoma de Buenos Aires|0Djibouti|0Francistown|0Gaborone|1orod Minsk|6Osh|1rad Zagreb|0Hsinchu|0Kampala|1eelung|1inshasa|1yiv|0Male|2puto|0Port of Spain|0San Fernando|1evastopol|1hymkent|0Tbilisi|0London, City of|0Kauno miestas|1laipėdos miestas|0Palangos miestas|2nevėžio miestas|0Vilniaus miestas|0Šiaulių miestas|0Debrecen|1unaújváros|0Eger|0Győr|0Hódmezővásárhely|0Kaposvár|1ecskemét|0Miskolc|0Nagykanizsa|1yíregyháza|0Pécs|0Salgótarján|1opron|1zeged|3kszárd|2olnok|3mbathely|2ékesfehérvár|0Tatabánya|0Veszprém|0Zalaegerszeg|0Érd|0Balzers|0Eschen|0Gamprin|0Mauren|0Planken|0Ruggell|0Schaan|3ellenberg|0Triesen|7berg|0Vaduz|0Aberdeen City|1ngus|1rgyll and Bute|0Clackmannanshire|0Dumfries and Galloway|2ndee City|0East Ayrshire|5Dunbartonshire|5Lothian|5Renfrewshire|1dinburgh, City of|1ilean Siar|0Falkirk|1ife|0Glasgow City|0Highland|0Inverclyde|0Midlothian|1oray|0North Ayrshire|6Lanarkshire|0Orkney Islands|0Perth and Kinross|0Renfrewshire|0Scottish Borders|1hetland Islands|1outh Ayrshire|6Lanarkshire|1tirling|0West Dunbartonshire|5Lothian|0Aruba|0Curaçao|0Scotland|1int Maarten|0Wales [Cymru GB-CYM]|0Agder|1lytaus apskritis|0Baranya|3ingo|1jelovarsko-bilogorska županija|1lekinge län [SE-10]|1omet|3i|2ng|2rsod-Abaúj-Zemplén|1rodsko-posavska županija|1ungoma|1ács-Kiskun|1ékés|0Carlow|2van|1hanghua|2iayi|1lare|1ork|1songrád-Csanád|0Dalarnas län [SE-20]|1ibër|1onegal|1ublin|3rovačko-neretvanska županija|2rrës|0Elbasan|2geyo/Marakwet|1mbu|0Fejér|1ier|0Galway|2rissa|1barpolu|1jirokastër|1otlands län [SE-09]|1rand Bassa|6Cape Mount|6Gedeh|6Kru|1yőr-Moson-Sopron|1ävleborgs län [SE-21]|0Hajdú-Bihar|2llands län [SE-13]|2rjumaa|1eves|1iiumaa|1oma Bay|1ualien|0Ida-Virumaa|1nnlandet|1siolo|2tarska županija|0Jász-Nagykun-Szolnok|1ämtlands län [SE-23]|2rvamaa|1õgevamaa|1önköpings län [SE-06]|0Kajiado|2kamega|2lmar län [SE-08]|2rlovačka županija|2uno apskritis|1ericho|3ry|1iambu|2ldare|3ifi|3kenny|2nmen|2rinyaga|2sii|3umu|2tui|1laipėdos apskritis|1omárom-Esztergom|2privničko-križevačka županija|2rçë|1rapinsko-zagorska županija|2onobergs län [SE-07]|1ukës|1wale|0Laikipia|2mu|2ois|1eitrim|2zhë|1ienchiang|2merick|2čko-senjska županija|1ofa|2ngford|2uth|1ääne-Virumaa|5maa|0Machakos|2kueni|2ndera|2rgibi|3ijampolės apskritis|3sabit|2yo|1eath|2ru|2đimurska županija|1iaoli|2gori|1ombasa|2naghan|3tserrado|1urang'a|1øre og Romsdal|0Nairobi City|2kuru|2ndi|3tou|2rok|1imba|1ordland|3rbottens län [SE-25]|1yamira|3ndarua|2eri|1ógrád|0Offaly|1sječko-baranjska županija|2lo|0Panevėžio apskritis|1enghu|2st|1ingtung|1ožeško-slavonska županija|1rimorsko-goranska županija|1ärnumaa|1õlvamaa|0Raplamaa|1iver Cess|6Gee|1ogaland|2mssa ja Finnmárkku|2scommon|0Saaremaa|2mburu|1hkodër|1iaya|2noe|2sačko-moslavačka županija|1kåne län [SE-12]|1ligo|1omogy|1plitsko-dalmatinska županija|1tockholms län [SE-01]|1zabolcs-Szatmár-Bereg|1ödermanlands län [SE-04]|0Taita/Taveta|4ung|2na River|2rtumaa|2uragės apskritis|1elšių apskritis|1haraka-Nithi|1ipperary|2ranë|1olna|1rans Nzoia|2ööndelage|1urkana|0Uasin Gishu|1ppsala län [SE-03]|1tenos apskritis|0Valgamaa|2raždinska županija|2s|1estfold og Telemark|4land|1ihiga|2ken|2ljandimaa|3niaus apskritis|2rovitičko-podravska županija|1lorë|1ukovarsko-srijemska županija|1ärmlands län [SE-17]|2sterbottens län [SE-24]|6norrlands län [SE-22]|4manlands län [SE-19]|4ra Götalands län [SE-14]|1õrumaa|0Wajir|2terford|1est Pokot|4meath|2xford|1icklow|0Yilan|1unlin|0Zadarska županija|2grebačka županija|2la|0Örebro län [SE-18]|1stergötlands län [SE-05]|0Šiaulių apskritis|2bensko-kninska županija|0Pordenone|0Trieste|0Udine|0Ahuachapán|1lba|2ibori|2ta Verapaz|3o Paraguay|9ná|1mambay|3zonas|1ntioquia|1rad|3uca|2geș|2tibonite|4gas|1tlantique|3ántico|7da|0Bacău|2ja Verapaz|1ihor|2strița-Năsăud|1oaco|2querón|2rgou|2toșani|2uenza|2yacá|1razzaville|3șov|2ăila|1uzău|0Caaguazú|3zapá|2bañas|2ldas|2nelones|3indeyú|2quetá|2razo|4ș-Severin|2sanare|2uca|1entral|5e|2rro Largo|2sar|1halatenango|2imaltenango|3nandega|3quimula|2ocó|3luteca|3ntales|2uquisaca|1luj|1ochabamba|2llines|3onia|2mayagua|2ncepción|3stanța|2pán|2rdillera|3tés|2uffo|2vasna|1undinamarca|2scatlán|2vette|7-Ouest|1órdoba|1ălărași|0Dolj|2nga|1urazno|1âmbovița|0El Beni|3Paraíso|4rogreso|1scuintla|2telí|0Flores|4ida|1rancisco Morazán|0Galați|1iurgiu|1orj|1racias a Dios|3nada|4de’Anse|1uainía|4rá|3temala|3viare|0Harghita|1uehuetenango|2ila|2nedoara|0Ialomița|2și|1lfov|1ntibucá|1slas de la Bahía|1tapúa|1zabal|0Jalapa|1inotega|1utiapa|0Kouilou|0La Guajira|3Libertad|3Paz|6|3Unión|2valleja|1empira|2ón|1ikouala|1ékoumou|0Madriz|2gdalena|2ldonado|2nagua|2ramureș|2saya|2tagalpa|1ehedinți|2ta|1isiones|1ono|3tevideo|2razán|1ureș|0Nariño|1eamț|1iari|2ppes|1ord|4-Est|5Ouest|3te de Santander|1ueva Segovia|0Ocotepeque|1lancho|2t|1ruro|1uest|2émé|0Pando|2raguarí|2ysandú|1etén|1ointe-Noire|2ol|2tosí|1rahova|2esidente Hayes|1utumayo|0Quetzaltenango|2iché|3ndío|0Retalhuleu|1isaralda|2vas|3era|1ocha|1ío Negro|4San Juan|0Sacatepéquez|2lto|2n Andrés, Providencia y Santa Catalina|4José|4Marcos|5iguel|4Pedro|4Salvador|4Vicente|3gha|3ta Ana|6Bárbara|6Cruz|6Rosa|5nder|2tu Mare|1ibiu|1ololá|2nsonate|2riano|1uceava|3hitepéquez|2d|3-Est|1ălaj|0Tacuarembó|2rija|1eleorman|1imiș|1olima|2tonicapán|1reinta y Tres|1ulcea|0Usulután|0Valle|5 del Cauca|2slui|2upés|1ichada|1rancea|1âlcea|0Yoro|0Zacapa|1ou|0Ñeembucú|0Agalega Islands|0Cargados Carajos Shoals|1lipperton|0Redonda|1odrigues Island|2tuma|0Southern Grenadine Islands|0A'ana|1bim|1cklins|1djumani|1gago|1iga-i-le-Tai|2wo|1l Awsaţ|3Janūbī|3Quds|2ebtong|1mmochostos|2olatar|2para|2udat|3ria|4u|1nabar|2enii Noi|3tan|2ibare|2se Boileau|5Etoile|5Royale|5aux Pins|5la Raye|2trim and Newtownabbey|2uradhapura|1pac|1rds and North Down|2magh City, Banbridge and Craigavon|2ua|1sh Shamālī|1tua|1u Cap|1veiro|0Badulla|2f|2gerhat|2ie Lazare|5Sainte Anne|3tsi|2laka|2mako|2rguna|2s-Sassandra|3arabeasca|2tticaloa|1eau Vallon|2l Air|4Ombre|3ait|3fast City|3ize|2nešov|2rea|3oun|3ry Islands|1hola|1imini|1lack Point|6River|3goevgrad|3nsko|4tyre|1oe|2gura|2rski okrug|2tha-Bothe|1raga|5nça|3hmanbaria|3ničevski okrug|2iceni|2no-město|5venkov|2okopondo|2unei-Muara|4tál|1uada|2daka|3uda|2giri|3weri|2hweju|2ikwe|2kedea|3omansibi|3wo|2lambuli|3iisa|2mthang|2ndibugyo|3yangabu|2rgas|2shenyi|3ia|2taleja|4mbala|3ebo|2vuma|2yende|1řeclav|0Cahul|2naries|3tagalo|4emir|2scade|3telo Branco|4ries|2t Island|2useway Coast and Glens|3é|2yo|1entral Abaco|9ndros|8Eleuthera|8Singapore|1handpur|3pai Nawabganj|2eb|2hukha|2ikwawa|3radzulu|3tipa|2obe|3mutov|2rudim|2uadanga|1imișlia|2ty of Freeport|1oimbra|2lombo|2mmewijne|3oé|2ronie|4zal|2x's Bazar|1riuleni|2ooked Island and Long Cay|1umilla|1ăușeni|0Dagana|1edza|2nguélé|3igomodu|3nery|2rry and Strabane|1inajpur|2strict of Columbia|6to Nacional (Santo Domingo)|1obrich|2kolo|2mažlice|2ndușeni|2wa|1rochia|1ubăsari|1ěčín|0East Grand Bahama|1dineț|1nglish River|1wa|1xuma|0Fa'asaleleaga|2ridpur|3o|1eni|2rmanagh and Omagh|1lacq|2orești|1rýdek-Místek|1ălești|0Gabrovo|2ga'emauga|4ifomauga|2ibandha|2lle|2mpaha|2sa|2zipur|1hanzi|1irne|1lacis|2odeni|1omba|2palganj|1rand Anse Mahe|bPraslin|6Cay|6Port|2os Islet|1uarda|2lu|1ôh-Djiboua|0Haa|2biganj|2mbantota|2rbour Island|2skovo|2vlíčkův Brod|1odonín|2ima|2pe Town|1radec Králové|1încești|1̱efa|0Ialoveni|1banda|1ganga|1juw|1le Perseverance I|iI|1nagua|1singiro|0Jablanički okrug|4onec nad Nisou|2ffna|2malpur|2shore|1eseník|1halakathi|2enaidah|1ihlava|2ndřichův Hradec|3ja|2čín|1oypurhat|1užnobanatski okrug|7čki okrug|0Kaabong|2bale|4role|3eramaido|2gadi|2kumiro|2laki|4ngala|3iro|3ungu|4tara|2muli|3wenge|2ndy|3ungu|2pchorwa|3elebyong|2rdzhali|3enga|3lovy Vary|3onga|3viná|2sanda|3ese|3ungu|2takwi|2yunga|2zo|1egalla|1galagadi|3tleng|1hagrachhari|1ibaale|3oga|3uku|2kuube|2linochchi|2ruhura|3yandongo|2shoreganj|3oro|2tagwenda|3gum|1ladno|3tovy|1oboko|2le|3ubarski okrug|3ín|2sovski okrug|7o-Mitrovački okrug|9Pomoravski okrug|2tido|1roměříž|1umi|2rigram|3unegala|2shtia|2tná Hora|1wania|2een|3neng|1yankwanzi|2egegwa|3njojo|2otera|2ustendil|0La Digue|2borie|2cs|2gunes|2kshmipur|2lmonirhat|2mwo|2rnaka|1efkosia|2iria|2mbá|3esos|2ova|2ribe|2s Mamelles|1huentse|1iberec|2koma|2longwe|2ra|2sboa|4urn and Castlereagh|2toměřice|1obata|2ng Island|2uny|2vech|1uuka|2wero|1wengo|1yantonde|0Machinga|2daripur|3i-Okollo|2feteng|2gura|2nafwa|3gochi|4rove Cay|3ikganj|3nar|2racha|3owijne|2saka|3eru|3indi|2tale|4ra|2yaguana|3uge|2čvanski okrug|1bale|3rara|1chinji|1eherpur|2neng|1icoud|2d and East Antrim|3-Ulster|2tooma|3yana|1ladá Boleslav|1ohale's Hoek|2ka|3hotlong|2naragala|3ggar|3t Buxton|5Fleuri|4agnes|2ore's Island|2ravički okrug|3oto|2st|2ulvibazar|2yo|1pigi|1ubende|2kono|2lanje|3laittivu|2nshiganj|1zimba|1é-Zóchi|1ělník|0Nabilatuk|2kapiripirit|4seke|5ongola|2mayingo|3isindwa|3utumba|2ogaon|2pak|2rail|4yanganj|3singdi|2tional Capital District (Port Moresby)|3ore|1ebbi|2no|2trakona|2wry, Mourne and Down|1gora|1ibok|2ckerie|2lphamari|2sporeni|2šavski okrug|1khata Bay|3otakota|1oakhali|2rth Abaco|7ndros|6East|7leuthera|6West|2vý Jičín|1sanje|1tcheu|4isi|2oroko|2ungamo|1uwara Eliya|1woya|1ymburk|1áchod|0Obongi|1cnița|1lomouc|1moro|1pava|1range Walk|2hei|1strava-město|1tuke|1yam|0Pabna|2der|2kwach|2lauli|3lisa|2mplemousses|2nchagarh|2ra|4maribo|3dubice|3o|2tuakhali|2zardzhik|1elhřimov|2ma Gatshel|2rnik|2ćki okrug|1halombe|1irojpur|4tski okrug|1laines Wilhems|4sance|2even|2ovdiv|2zeň-jih|6město|6sever|1odunavski okrug|2inte Larue|2lonnaruwa|2moravski okrug|2rt Glaud|5Louis|4alegre|4o|1rachatice|3ha-východ|6západ|2izrenski okrug|2ostějov|1unakha|2ttalam|1ísek|1činjski okrug|1řerov|2íbram|0Qacha's Nek|1uthing|0Ragged Island|2jbari|2kai|3ovník|2ngamati|2sinski okrug|2tnapura|2zgrad|2ški okrug|1ezina|1ivière du Rempart|1oche Caiman|2kycany|1ubanda|3irizi|2kiga|3ungiri|2m Cay|3phi|1wampara|1ychnov nad Kněžnou|1îșcani|0Salima|2mdrup Jongkhar|3tse|2ntarém|2ramacca|3pang|2ssandra-Marahoué|2tkhira|3upa'itea|2vanne|1embabule|3ily|2rere|2túbal|2vernobanatski okrug|9čki okrug|1hariatpur|2eema|3rpur|2umen|1ilistra|2paliwini|2rajganj|3onko|1liven|1molyan|1ofia|5 (stolitsa)|2kolov|2roca|4ti|2ufrière|3th Abaco|7ndros|6East|7leuthera|6West|1panish Wells|1rednjebanatski okrug|3mski okrug|1tann Creek|3ra Zagora|2rakonice|3ășeni|1unamganj|1vitavy|1îngerei|0Tachov|2kamaka|2ll Abīb|2ngail|2raclia|3govishte|1elenești|2mburong|2plice|1haba-Tseka|3kurgaon|2imphu|2yolo|1oplički okrug|2roro|1rashi Yangtse|6gang|2incomalee|2ongsa|2utnov|1sirang|1uamasaga|2tong|1řebíč|0Uaboe|1herské Hradiště|1ngheni|0Va'a-o-Fonoti|2isigano|2llée du Bandama|2rna|2vuniya|1eliko Tarnovo|1iana do Castelo|2din|2eux Fort|2la Real|2seu|1ratsa|1setín|1yškov|0Wakiso|2ngdue Phodrang|3ica|1est Grand Bahama|1oroba|0Yambol|2ren|1umbe|0Zaječarski okrug|2nzan|2padnobački okrug|1hemgang|1latiborski okrug|2ín|1nojmo|1omba|4o|0Água Grande|0Évora|0Ústí nad Labem|9Orlicí|0Česká Lípa|4é Budějovice|4ý Krumlov|0Šumadijski okrug|3perk|0Žďár nad Sázavou|0Șoldănești|1tefan Vodă|0Alytus|1nykščiai|0Biržai|0Ignalina|0Jonava|3iškis|1urbarkas|0Kaišiadorys|2unas|1elmė|1laipėda|1retinga|1upiškis|1ėdainiai|0Lazdijai|0Marijampolė|2žeikiai|1olėtai|0Pakruojis|2nevėžys|2svalys|1lungė|1rienai|0Radviliškis|2seiniai|1okiškis|0Skuodas|0Tauragė|1elšiai|1rakai|0Ukmergė|1tena|0Varėna|1ilkaviškis|3nius|0Zarasai|0Šakiai|2lčininkai|1iauliai|2lalė|3utė|2rvintos|1venčionys|0Brčko distrikt|0nohiyahoi tobei jumhurí|0'Eua|0Central|7 River|1hattogram|0Dhaka|0Ha'apai|0Khulna|0Lower River|0Mymensingh|0Niuas|1orth Bank|0Rajshahi|2ngpur|0Sylhet|0Tongatapu|0Upper River|0Vava'u|0Western|0Abū Z̧aby|1l Fujayrah|1sh Shāriqah|0Dubayy|0Ra’s al Khaymah|0Umm al Qaywayn|0Republika Srpska|0Alsace|0Islamabad|0Dependencias Federales|1istrito Federal|0Ciudad de México|0Wilayah Persekutuan Labuan|kPutrajaya|0Caltanissetta|0Enna|0Ragusa|0Siracusa|0Trapani|0Saint Helena|0Tristan da Cunha|0Central|0Eastern|0Ilhas de Sotavento|0Northern|0Western|0Kalimantan|0Maluku|0Nusa Tenggara|0Papua|0Sulawesi|2matera|0Aakkâr|1byan|1d Daqahlīyah|4ākhilīyah|1l Anbār|4ḩmadī|3Balqā’|5yḑā’|5şrah|5ḩr al Aḩmar|4iqā‘|4uraymī|5ḩayrah|3Farwānīyah|5yyūm|3Gharbīyah|3Iskandarīyah|5mā'īlīyah|3Jahrā’|5nūb|8īyah|5wf|4īzah|3Karak|3Mafraq|5hrah|5ḩwīt|4inyā|6ūfīyah|4uthanná|5ḩarraq|3Qalyūbīyah|4ādisīyah|5hirah|3Uqşur|3Wusţá|4ādī al Jadīd|3Ḩudaydah|3‘Aqabah|5̅şimah|4Āşimah|1n Nabaţīyah|5jaf|1rbīl|2khabīl Suquţrá|1s Sulaymānīyah|5ways|2h Shamālīyah|6imāl|2wān|2yūţ|1z Zarqā’|2̧ Z̧āhirah|1ţ Ţafīlah|1ḑ Ḑāli‘|0Baalbek-Hermel|2ghdād|2nī Suwayf|2yrūt|1en Arous|2thlehem|1izerte|1éja|1ābil|1ūr Sa‘īd|0Conakry|0Dahūk|1eir El Balah|1hamār|2ī Qār|1iyālá|1umyāţ|0Gabès|2fsa|2za|0Hebron|0Ibb|1rbid|0Jabal Lubnān|2nūb Sīnā'|6al Bāţinah|7sh Sharqīyah|2rash|1endouba|3in|2richo and Al Aghwar|3usalem|0Kafr ash Shaykh|2irouan|2rbalā’|2sserine|1han Yunis|1irkūk|1ébili|0L'Ariana|1a Manouba|2ḩij|1e Kef|0Mahdia|2sqaţ|2ysān|2ţrūḩ|2‘ān|2’rib|1onastir|1ubārak al Kabīr|2sandam|1édenine|1ādabā|0Nabeul|3lus|1orth Gaza|1īnawá|0Qalqilya|1inā|0Rafah|2mallah|2ymah|0Salfit|1fax|1habwah|3māl Sīnā'|7al Bāţinah|8sh Sharqīyah|1idi Bouzid|2liana|1ousse|1ūhāj|0Tataouine|1ozeur|1ubas|2lkarm|2nis|1āʻizz|0Wāsiţ|0Zaghouan|1̧ufār|0Şalāḩ ad Dīn|2nʻā’|1āʻdah|0Ḩajjah|2wallī|2ḑramawt|0‘Adan|2jlūn|2mrān|0Line Islands|0Phoenix Islands|0Guna Yala|0Naso Tjër Di|1gäbe-Buglé|0Anjouan|0Grande Comore|0Mohéli|0Nanumaga|5ea|1ui|2kufetau|4laelae|0Vaitupu|0Baker Island|0Howland Island|0Jarvis Island|0Kingman Reef|0Midway Islands|0Navassa Island|0Palmyra Atoll|0Wake Island|0Baden-Württemberg|2yern|1erlin|1remen|0Hamburg|1essen|0Mecklenburg-Vorpommern|0Niedersachsen|1ordrhein-Westfalen|0Rheinland-Pfalz|0Saarland|2chsen|7-Anhalt|1chleswig-Holstein|0Thüringen|0Balzan|1irgu|3kirkara|3żebbuġa|1ormla|0Dingli|0Fgura|1loriana|1ontana|0Gudja|1ħajnsielem|3rb|4għur|3sri|3xaq|1żira|0Iklin|1sla|0Kalkara|1erċem|1irkop|0Lija|1uqa|0Marsa|5skala|5xlokk|1dina|1ellieħa|1osta|1qabba|1sida|1tarfa|1unxar|1ġarr|0Nadur|2xxar|0Paola|1embroke|1ietà|0Qala|1ormi|1rendi|0Rabat Gozo|6Malta|0Safi|2int John|7ulian's|6Lawrence|7ucia's|6Paul's Bay|2nnat|3ta Venera|1iġġiewi|1liema|1wieqi|0Ta' Xbiex|2rxien|0Valletta|0Xagħra|1ewkija|1għajra|0Ħamrun|0Żabbar|1ebbuġ Gozo|7Malta|2jtun|1urrieq|0Barnet|1exley|1rent|2omley|0Camden|1roydon|0Ealing|1nfield|0Greenwich|0Hackney|2mmersmith and Fulham|2ringey|3row|2vering|1illingdon|1ounslow|0Islington|0Kensington and Chelsea|1ingston upon Thames|0Lambeth|1ewisham|0Merton|0Newham|0Redbridge|1ichmond upon Thames|0Southwark|1utton|0Tower Hamlets|0Waltham Forest|2ndsworth|1estminster|0Krung Thep Maha Nakhon|0Bologna|1usan-gwangyeoksi|0Cagliari|2tania|0Daegu-gwangyeoksi|3jeon-gwangyeoksi|0Firenze|0Genova|1wangju-gwangyeoksi|0Incheon-gwangyeoksi|0Kaeseong|0Messina|1ilano|0Nampho|2poli|0Palermo|0Reggio Calabria|1oma|0Torino|0Ulsan-gwangyeoksi|0Venezia|0Métropole de Lyon|0Paris|0Aisne|1llier|2pes-Maritimes|6de-Haute-Provence|1rdennes|3èche|2iège|1ube|2de|1veyron|0Bas-Rhin|1ouches-du-Rhône|0Calvados|2ntal|1harente|8-Maritime|2er|1orrèze|3se-du-Sud|1reuse|1ôte-d'Or|4s-d'Armor|0Deux-Sèvres|1ordogne|2ubs|1rôme|0Essonne|1ure|4-et-Loir|0Finistère|0Gard|1ers|1ironde|0Haut-Rhin|4e-Corse|6Garonne|6Loire|6Marne|6Savoie|8ône|6Vienne|5s-Alpes|7Pyrénées|4s-de-Seine|1érault|0Ille-et-Vilaine|1ndre|5-et-Loire|1sère|0Jura|0Landes|1oir-et-Cher|4e|5-Atlantique|5t|2t|3-et-Garonne|2zère|0Maine-et-Loire|2nche|2rne|2yenne|1eurthe-et-Moselle|3se|1orbihan|2selle|0Nièvre|1ord|0Oise|1rne|0Pas-de-Calais|1uy-de-Dôme|1yrénées-Atlantiques|9Orientales|0Rhône|0Sarthe|2voie|2ône-et-Loire|1eine-Maritime|6Saint-Denis|6et-Marne|1omme|0Tarn|4-et-Garonne|1erritoire de Belfort|0Val-d'Oise|5e-Marne|2r|2ucluse|1endée|1ienne|1osges|0Yonne|1velines|0Barnsley|1olton|1radford|1ury|0Calderdale|1oventry|0Doncaster|1udley|0Gateshead|0Kirklees|1nowsley|0Leeds|1iverpool|0Newcastle upon Tyne|1orth Tyneside|0Oldham|0Rochdale|2therham|0Salford|2ndwell|1efton|1heffield|1olihull|2uth Tyneside|1t. Helens|2ockport|1underland|0Tameside|1rafford|0Wakefield|2lsall|1igan|2rral|1olverhampton|0Bourgogne-Franche-Comté|1retagne|0Centre-Val de Loire|0Grand-Est|0Hauts-de-France|0Normandie|2uvelle-Aquitaine|0Occitanie|0Pays-de-la-Loire|1rovence-Alpes-Côte-d’Azur|0Île-de-France|0Acquaviva|1d Dawḩah|1erodrom †|1ileu|3inglaplap|3uk|2naro|2zkraukles novads|1jdovščina|1kraneskaupstaður|2ureyrarbær|1l Khawr wa adh Dhakhīrah|3Wakrah|2ūksnes novads|1mānat al ‘Āşimah [city]|1ndrijevica|2karan|1pače|1r Rayyān|2ačinovo|2no|1sh Shamāl|6īḩānīyah|1ugšdaugavas novads|2r|1vannaata Kommunia|1z̧ Z̧a‘āyin|0Balvu novads|2r|2ucau|3skas novads|1eijing Shi|2ltinci|2nedikt|2rane|3ovo|1ijelo Polje|2kini & Kili|2rštonas|2strica ob Sotli|2tola|1led|2oke|2áskógabyggð|1oa Vista|2bonaro|2gdanci|3ovinje|2hinj|2lungarvíkurkaupstaður|2rgarbyggð|4o Maggiore|3ovnica|2silovo|2vec|1raslovče|3va|2da|2ezovica|3žice|2venica|1ucurești|2dva|2tel †|0Cankova|1entar Župa|7†|2rklje na Gorenjskem|4nica|5o|4venjak|2tinje|1hiesanuova|2ongqing Shi|1irkulane|2ttà di San Marino|1ova Lima|1ēsu novads|1ần Thơ|0Dalabyggð|3víkurbyggð|2nilovgrad|1ebar|3rca|2lčevo|2mir Hisar|6Kapija|2strnik|1ienvidkurzemes Novads|2vača|1obeles novads|3je|3repolje|4na|4ova-Polhov Gradec|6nik|2jran|2l pri Ljubljani|3enjske Toplice|3neni|2magnano|3žale|2rnava|1ravograd|2uskininkai|1uplek|1íli|0Ebon|1lektrėnai|1newetak & Ujelang|1rmera|1yja- og Miklaholtshreppur|4fjarðarsveit|0Faetano|1iorentino|1jallabyggð|3rðabyggð|1ljótsdalshreppur|2óahreppur|0Garðabær|2zi Baba †|1evgelija|1jorče Petrov †|1orenja vas-Poljane|3išnica|3je|3nja Radgona|5i Grad|7Petrovci|2stivar|1rad|4sko|2indavíkurbær|2osuplje|2undarfjarðarbær|2ímsnes- og Grafningshreppur|2ýtubakkahreppur|1ulbenes novads|2sinje|1əncə|0Hafnarfjarðarkaupstaður|2jdina|1erceg-Novi|1odoš|2rjul|2če-Slivnica|1rastnik|2pelje-Kozina|2unamannahreppur|1valfjarðarsveit|2eragerðisbær|1à Nội|1örgársveit|1únabyggð|4þing vestra|1ải Phòng|1ồ Chí Minh|0Idrija|1g|1linden|3rska Bistrica|1vančna Gorica|1zola|0Jabat|2luit|1egunovce|2lgavas novads|2senice|2zersko|1uršinci|1ēkabpils novads|0Kaldrananeshreppur|3varija|2mnik|2nal ob Soči|2rbinci|3poš †|2vadarci|2zlų Rūdos|1idričevo|2sela Voda †|2čevo|1jósarhreppur|1obarid|3ilje|2lašin|2men|5da|3mune Kujalleq|8Qeqertalik|7qarfik Sermersooq|2nče|2stanjevica na Krki|4el|2tor|2zje|2čani|3evje|1ranjska Gora|3tovo|2iva Palanka|4ogaštani|3ževci|2uševo|2āslavas novads|1uldīgas novads|2manovo|2ngota|2zma|1wajalein|1ópavogsbær|0Lae|2nganesbyggð|2utein|2ško|1enart|3dava|1ib|2kiep|4sá|2ma hatun llaqta|3bažu novads|2pkovo|2tija|1jubno|3tomer|1og-Dragomer|3atec|2vrenc na Pohorju|2zovo|2ška dolina|4i Potok|1udzas novads|2kovica|2če|1īvānu novads|0Madonas novads|2io|2juro|3šperk|2kedonska Kamenica|9i Brod|3ole|2loelap|2natuto|3ufahi|2rkovci|2vrovo i Rostuše|1edvode|2jit|2ngeš|2tlika|2žica|1iklavž na Dravskem polju|2li|2ngəçevir|2ren-Kostanjevica|3na|5 Peč|2slinja|1ogila|2jkovac|2kronog-Trebelno|2ntegiardino|2ravske Toplice|5če|2sfellsbær|3teiros|2zirje|1uta|1úlaþing|1ýrdalshreppur|1ārupes novads|0Naftalan|2klo|2mdrik|3u|2zarje|1egotino|2ringa|1ikšić|1orðurþing|2vaci|3o Selo|0Odranci|1gres novads|1hrid|1laines novads|1plotnica|1rmož|1silnica|0Pagėgiai|2ul|1ehčevo|2snica|2tnjica|3rovec|1iran|2vka|1lasnica|3v|2jevlja|2užine|1odgorica|3lehnik|3velka|3četrtek|2ljčane|3zela|2rto Novo|2stojna|1raia|2ebold|3ddvor|3iļu novads|3valje|2ilep|2obištip|1uconci|0Qeqqata Kommunia|0Radenci|4če|3lje ob Dravi|3oviš|5ljica|2ngárþing eystra|bytra|3kovce|2vne na Koroškem|2zkrižje|2če-Fram|1enče-Vogrsko|2sen|2ykhólahreppur|4janesbær|6víkurborg|2čica ob Savinji|1ibeira Brava|8Grande|e de Santiago|3nica|7 na Pohorju|2etavas|1ogatec|4ška Slatina|5ovci|2ngelap|2pažu novads|2soman|2žaje|1uše|1ēzeknes novads|0Sal|3aspils novads|3dus novads|2nta Catarina|e do Fogo|7ruz|2raj †|2ulkrastu novads|1elnica ob Dravi|3tjarnarnesbær|2mič|2rravalle|2vnica|2žana|1hanghai Shi|1iguldas novads|1kaftárhreppur|3gabyggð|5fjörður|2eiða- og Gnúpverjahreppur|2orradalshreppur|1lovenska Bistrica|8e Konjice|1miltenes novads|1næfellsbær|1odražica|2lčava|2pište|1redišče ob Dravi|1taro Nagoričane|4še|2randabyggð|4ža|3uga|4mica|2udeničani|2ykkishólmsbær|1umqayıt|2ðurnesjabær|1valbarðsstrandarhreppur|2eitarfélagið Hornafjörður|fSkagaströnd|fVogar|fÁrborg|fÖlfus|3ta Ana|6Trojica v Slovenskih goricah|4i Andraž v Slovenskih goricah|6Jurij ob Ščavnici|cv Slovenskih goricah|6Nikole|6Tomaž|1ão Domingos|4Filipe|4Lourenço dos Órgãos|4Miguel|4Salvador do Mundo|4Vicente|1úðavíkurhreppur|0Tabor|2lsu novads|2rrafal|8 de São Nicolau|1earce|2tovo|1ianjin Shi|2vat|2šina|1jörneshreppur|1olmin|1rbovlje|2ebnje|2novska Vas|2zin|2žič|1ukuma novads|2rnišče|2zi|1álknafjarðarhreppur|0Ujae|1lcinj|1mm Şalāl|1trik|0Valandovo|3kas novads|3mieras Novads|2rakļānu novads|2silevo|1eles|3ika Polana|5e Lašče|2ntspils novads|2ržej|2stmannaeyjabær|4urbyggð|2včani|1idem|2keke|2nica|2pava|2saginas|2tanje|1odice|2jnik|2pnafjarðarhreppur|1ransko|3pčište|2hnika|1uzenica|0Wotho|3je|0Xankəndi|0Zagorje ob Savi|2vrč|1elenikovo|2ta|1reče|2novci|0Árneshreppur|1sahreppur|0Ísafjarðarbær|0Þingeyjarsveit|0Ādažu novads|0Čair †|2ška|1ešinovo-Obleševo|1renšovci|2na na Koroškem|3omelj|1učer-Sandevo|0Đà Nẵng|0Ķekavas novads|0Şirvan|0Šalovci|2vnik|1empeter-Vrtojba|2ntilj|4jernej|5ur|4rupert|3čur|1kocjan|3fja Loka|4ljica|1marje pri Jelšah|6ške Toplice|4tno ob Paki|8pri Litiji|1oštanj|1tip|2ore|1uto Orizari †|0Žabljak|2lec|1elezniki|3ino|2tale|1iri|3ovnica|1užemberk|0Gomel'skaja oblast'|1rodnenskaja oblast'|0Mahilioŭskaja voblasć|1inskaja oblast'|0Viciebskaja voblasć|0Guam|0Northern Mariana Islands|0Puerto Rico|0United States Minor Outlying Islands|0Virgin Islands, U.S.|0Polynésie française|0Saint-Martin|6Pierre-et-Miquelon|0Wallis-et-Futuna|0Nouvelle-Calédonie|0La Réunion|0Mayotte|0Terres australes françaises|0Guyane (française)|0Azad Jammu and Kashmir|1ndorra la Vella|0Charlotte|2rist Church|d Nichola Town|1larendon|0Encamp|1scaldes-Engordany|0Grenadines|0Hanover|0Kingston|0La Massana|0Manchester|0Ordino|0Portland|0Saint Andrew|c|c|c|8n|9e Sandy Point|6Catherine|6David|b|6Elizabeth|6George|c|c|c|c Basseterre|dGingerland|6James|b Windward|7ohn|a|a|a Capisterre|bFigtree|8seph|6Lucy|8ke|6Mark|9y|a Cayon|7ichael|6Patrick|d|8ul|a Capisterre|charlestown|7eter|b|b Basseterre|7hilip|6Thomas|c Lowland|dMiddle Island|2nt Julià de Lòria|0Trelawny|2inity Palmetto Point|0Westmoreland|0Al Buţnān|3Jabal al Akhḑar|cGharbī|5fārah|4ufrah|3Kufrah|3Marj|6qab|3Wāḩāt|1n Nuqāţ al Khams|1z Zāwiyah|0Darnah|0Ghāt|0Mişrātah|1urzuq|0Nālūt|0Sabhā|1urt|0Wādī al Ḩayāt|6sh Shāţi’|0Ţarābulus|0Agadir-Ida-Ou-Tanane|1ichi|1kita|1omori|0Bamingui-Bangoran|2sse-Kotto|1eyla|1offa|2ké|0Casablanca|1hiba|1oyah|0Dabola|2laba|1inguiraye|1ubréka|0Ehime|0Faranah|1orécariah|1ria|1ukui|4oka|4shima|1ès|0Gaoual|1ifu|1unma|2ékédou|0Haut-Mbomou|4e-Kotto|6Sangha / Mambéré-Kadéï|1iroshima|1okkaido|1yogo|0Ibaraki|1nezgane-Ait Melloul|1shikawa|1wate|0Kagawa|3oshima|2nagawa|3kan|1india|2ssidougou|1ochi|2ubia|3ndara|3roussa|1umamoto|1yoto|1émo-Gribingui|2rouané|0Labé|1obaye|2la|1élouma|0Macenta|2li|2mou|2ndiana|2rrakech|1bomou|1eknès|1ie|2yagi|4zaki|1ohammadia|1’diq-Fnideq|0Nagano|4saki|2na-Mambéré|2ra|1iigata|1zérékoré|0Oita|1kayama|2inawa|1mbella-Mpoko|1saka|1uaka|2ham-Pendé|2jda-Angad|0Pita|0Rabat|0Saga|2itama|2lé|1higa|3mane|3zuoka|1iguiri|1khirate-Témara|0Tanger-Assilah|1ochigi|2kushima|3yo|2ttori|2ugué|2yama|1élimélé|0Vakaga|1iangchan|0Wakayama|0Yamagata|5uchi|4nashi|1omou|0A Coruña [La Coruña]|1bra|1ceh|1dana|2ıyaman|1fyonkarahisar|1gusan del Norte|bSur|1klan|2saray|1l Haouz|4oceïma|3Lādhiqīyah|3Qunayţirah|3Ḩasakah|2acant*|3juela|2bacete|4y|3erta|3orz|2essandria|2ger|2mería|1masya|2nat Charoen|1n Giang|2cona|2g Thong|2hui Sheng|2kara|2naba|3obon|2talya|4nanarivo|3ique|3siranana|3werpen|1ousserd (EH)|1payao|1r Raqqah|2aba*|2dabīl|4han|2ezzo|2hangay|2temisa|3vin|1s Suwaydā'|2coli Piceno|2sa-Zag (EH-partial)|2ti|3urias|1ttapu|1urora|1vellino|1ydın|1zilal|2ua|4y|1ïn Defla|4Témouchent|1ğrı|0Ba|2at Dambang|2dajoz|4khshān|2ghlān|3mati|2hr el Ghazal|2li|3ochistan|3é|3ıkesir|2m|2nteay Mean Choăy|5n|3wa|2oruco|2rahona|3celona [Barcelona]|3letta-Andria-Trani|3tın|2s-Uélé|3ilan|2taan|4nes|5gas|3ha|3man|3na|2yan-Ölgiy|5hongor|3burt|2zèga|1elluno|2nevento|3gkulu|4o|4uela|6t|3slimane|2rgamo|3kane|3rechid|1iella|2lecik|3iran|2ngöl|2oko Nord|6Sud|2skra|2tlis|2zkaia|2é|1lida|1ocas del Toro|2hol|2kèo|2likhamxai|3u|3ívar|2rdj Badji Mokhtar|7ou Arréridj|3kou|2ugouriba|3ira|3jdour (EH)|3lemane|4gou|4kiemdé|3merdès|1rabant wallon|2escia|2indisi|3tish Columbia|1ua|2banza|2eng Kan|4os Aires|2jumbura Mairie|aRural|2kidnon|2lacan|4wayo|3gan|2rdur|3gos|3i Ram|3sa|3uri|1à Rịa - Vũng Tàu|1échar|2jaïa|2ni Abbès|5Mellal|1ình Dương|5Phước|5Thuận|5Định|1ādghīs|2myān|1ūshehr|1ạc Liêu|1ắc Giang|4Kạn|4Ninh|1ến Tre|0Cabinda|3o Delgado|2gayan|2kaudrove|2magüey|4rines Norte|aSur|3iguin|3pobasso|2nkuzo|3tabria|2o Bằng|2piz|2rchi|3tago|2serta|3telló*|2tamarca|4nduanes|5zaro|2vite|2ñar|1ebu|2ntral|7|7|7 Province|5o Sud|1hachoengsao|4o|3gang-do|3hār Maḩāl va Bakhtīārī|3i Nat|4yaphum|3mpasak|3nthaburi|3ri-Baguirmi|2efchaouen|2iang Mai|7Rai|3chaoua|3eti|3mborazo|5u|3riquí|2lef|2oiseul|3n Buri|2touka-Ait Baha|2ubut|3mphon|3ngcheongbuk-do|bnam-do|1ibitoke|2ego de Ávila|3nfuegos|2udad Real|1oclé|2lón|2mo|2nnaught|3stantine|2pperbelt|2rrientes|2senza|2tabato|3opaxi|1remona|2otone|1uando Cubango|4za-Norte|7Sul|2enca|2nene|4o|1à Mau|1áceres|2diz|1órdoba|0Dajabón|2r'ā|3han uul|3ién|2vao Occidental|7riental|6de Oro|8l Norte|aSur|2yr az Zawr|1enizli|1imashq|2nagat Islands|2yarbakır|1janet|2elfa|2ibloho|1ornod|5govĭ|1renthe|2iouch|1uarte|2ndgovĭ|1zavhan|1üzce|1āykundī|0East New Britain|5Sepik|4ern|7|7|7 Cape|8Highlands|8Province|8Samar|1dirne|1l Bayadh|3Hajeb|3Jadida|3Kelâa des Sraghna|3Meghaier|5niaa|3Oro|4ued|3Seibo|3Tarf|2azığ|2ías Piña|1nga|2nedi-Est|7Ouest|2tre Ríos|1rrachidia|2zincan|3urum|1s-Semara (EH-partial)|2kişehir|2meraldas|2paillat|2saouira|2tuaire|1şfahān|0Fahs-Anjra|2rāh|1ermo|3rara|1ianarantsoa|2guig|1levoland|1oggia|2rlì-Cesena|3mosa|1quih Ben Salah|1ree State|2osinone|2yslân|1ujian Sheng|1ārs|3yāb|0Galápagos|2ndaki|3su Sheng|3zourgou|2uteng|2ziantep|1elderland|1hardaïa|3znī|2ōr|1ia Lai|2puzkoa|2resun|3ona [Gerona]|2tega|1nagna|1olestān|2rontalo|2urma|2vĭ-Altay|5Sümber|1ranma|2oningen|3sseto|1uadalajara|6canal|3nacaste|4gdong Sheng|4tánamo|3yas|2elma|5im|3rcif|2imaras|3zhou Sheng|2lf|2éra|1yeonggi-do|6sangbuk-do|anam-do|1ümüşhane|1īlān|0Hadjer Lamis|2inan Sheng|5ut|2kkâri|2madān|3gyǒng-bukto|9namdo|2rare|2tay|3o Mayor|2ut-Katanga|5Lomami|5Ogooué|5Uélé|1ebei Sheng|2ilongjiang Sheng|2la|3mand|2nan Sheng|3tiy|2redia|3manas Mirabal|3rera|3āt|1olguín|2rmozgān|2uaphan|3et|2vd|1uambo|2bei Sheng|2elva|3sca|2nan Sheng|1wanghae-bukto|9namdo|1à Giang|3Nam|3Tĩnh|1òa Bình|1övsgöl|1ưng Yên|1ải Dương|1ậu Giang|0Idlib|1frane|2ugao|1lles Balears [Islas Baleares]|3izi|2ocos Norte|7Sur|3ilo|1mbabura|2peria|1n Guezzam|3Salah|2dependencia|2hambane|1oba|1sabel|6a|2ernia|2parta|1turi|1ğdır|0Jambi|2wa Barat|5Tengah|6imur|2én|1eollabuk-do|6nam-do|2rada|1iangsu Sheng|5xi Sheng|2jel|2lin Sheng|2waka|1owzjān|1ujuy|0Kadavu|3iogo|2eb|2hramanmaraş|2lasin|3imantan Barat|bSelatan|bTengah|cimur|bUtara|4nga|2mphaeng Phet|4ong Chaam|ahnang|8Spueu|8Thum|5t|2nchanaburi|3daal|5hār|3em|3gweonto|2oh Kong|2rabük|4man|3nali|3s|3uzi|2saï|5 Central|6Oriental|3tamonu|2yanza|3seri|1epulauan Bangka Belitung|aRiau|2rmān|6shāh|1hammouan|2enchela|2on Kaen|3rāsān-e Jonūbī|bRaẕavī|bShomālī|3uribga|2yber Pakhtunkhwa|2ánh Hòa|2émisset|3nifra|2ōst|2ūzestān|1ilis|2rundo|2é-Ntem|2ến Giang|1ocaeli|2hgīlūyeh va Bowyer Aḩmad|2mondjari|3pienga|2n Tum|3go Central|3ya|2rdestān|2shi|3si|2ulpélogo|3ritenga|4wéogo|1rabi|3cheh|1unaṟ|3duz|1wango|3zulu-Natal|2ilu|1énitra|3édougou|1ütahya|1ābul|2pīsā|1ırklareli|3ıkkale|3şehir|0L'Aquila|1a Altagracia|3Habana|3Pampa|3Rioja|4omana|3Spezia|3Vega|2c|2ghmān|4ouat|3una|2i Châu|2mpang|4hun|4ung|2nao del Norte|aSur|2rache|2s Palmas|4Tunas|2tina|2u|2âyoune (EH)|1ecce|4o|2inster|2ste|2yte|1iaoning Sheng|2mburg|3popo|3ón|2ttoral|2vorno|2ège|1leida [Lérida]|1odi|2ei|2gone-Occidental|8riental|2ja|2maiviti|4mi|2ng An|2p Buri|2restān|3oum|2s Ríos|4Santos|2uang Namtha|6phabang|1ualaba|3nda|3pula|2cca|2go [Lugo]|2mbini|2nda-Norte|6Sul|2saka|1ào Cai|1âm Đồng|1éraba|1ōgar|1ạng Sơn|0M'sila|1acerata|3uata|2dang|3hesh|3rid|2e Hong Son|2guindanao del Norte|gSur|2ha Sarakham|4janga|2i-Ndombe|2kamba|3ira-Ulawa|2laita|4mpa|4nge|4tya|3uku Utara|2nabí|3doul|3ica|6land|4ema|4sa|4toba|3tova|3us|2rdin|3induque|3kazī|3ía Trinidad Sánchez|2sbate|3cara|3honaland Central|cEast|cWest|3sa-Carrara|3vingo|2tabeleland North|dSouth|4nzas|3era|2yabeque|3o-Kebbi-Est|bOuest|1endoza|2rsin|1idelt|3lands|2la|3ne Bay|2ndoro Occidental|9riental|2samis Occidental|9riental|1odena|2ndol Kiri|3gala|3señor Nouel|3te Cristi|6Plata|3za e Brianza|2robe|4na Santiago|2staganem|2uhoun|3lay Yacoub|3ntain Province|2xico|2yen-Chari|6Ogooué|1pumalanga|1uchinga|2kdahan|2nster|2ramvya|3cia|2yinga|2ğla|2ş|1waro|1álaga|1édiouna|3éa|1āzandarān|0Naama|2dor|3roga and Navosa|2farroa*|2houri|2itasiri|2khon Nayok|7Pathom|8hanom|7Ratchasima|7Sawan|8i Thammarat|2m Định|3entenga|3ibe|3osi|3pula|3ur|2n|3garhār|2po|2rathiwat|2yala|1egros Occidental|8riental|2uquén|2vşehir|2w Brunswick|4Ireland|3foundland and Labrador|1ghệ An|2ounié|3zi|1iassa|2nh Bình|5Thuận|2ğde|1ong Bua Lam Phu|5Khai|3thaburi|2ord-Brabant|6Holland|2rd-Kivu|5Ubangi|3te|4h Central Province|6Western Province|5-West|aern|5ern|8|8|8|8 Cape|9Ireland|9Province|9Samar|2uaceur|3mbiel|2va Scotia|4ra|1ueva Ecija|6Vizcaya|2oro|2sa Tenggara Barat|eTimur|1yanga|1īmrōz|1ūristān|0Ogooué-Ivindo|7Lolo|7Maritime|1ntario|1ost-Vlaanderen|1ran|2du|2ellana|2hon|2istano|1smaniye|1tdar Mean Chey|1uaddaï|3rgla|4zazate|2britenga|2dalan|3ômxai|2ed Ed-Dahab (EH)|3zzane|2led Djellal|2m el Bouaghi|2rense [Orense]|1verijssel|0P'yǒngan-bukto|9namdo|1adova|2ilin|2ktiyā|4īkā|2lawan|3encia|2mpanga|2namá|6 Oeste|3gasinan|3jshayr|2pua Barat|b Daya|6Pengunungan|6Selatan|6Tengah|2rma|3wān|2ssoré|3taza|2thum Thani|3tani|2via|1edernales|2ravia|3ugia|2saro e Urbino|3cara|1hangnga|3tthalung|3yao|2etchabun|9ri|2ichit|3tsanulok|2ra Nakhon Si Ayutthaya|4e|2uket|2ôngsali|2ú Thọ|4Yên|1iacenza|2chincha|2nar del Río|2sa|3toia|1oni|3tevedra [Pontevedra]|2tenza|2usaat|1rachin Buri|5uap Khiri Khan|3to|2eah Sihanouk|6Vihear|3y Veaeng|2ince Edward Island|1uerto Plata|2njab|3tarenas|1énama|0Qazvīn|1inghai Sheng|1om|1uebec|3zon|2irino|2ảng Bình|6Nam|7gãi|7inh|6Trị|0Ra|2nong|2tchaburi|2venna|2yong|1eggio Emilia|2hamna|2lizane|2nnell and Bellona|2wa|1iau|2eti|2mini|2zal|3e|1oi Et|2mblon|2tanak Kiri|2vigo|1umonge|2tana|2yigi|1yanggang-do|1īf Dimashq|0Sa Kaeo|2baragamuwa Province|2karya|3on Nakhon|2lamanca|6t|4van|3erno|3ta|2mangān|5á|4r|3sun|3ut Prakan|6Sakhon|7ongkhram|2n Cristóbal|4José de Ocoa|5uan|4Luis|4Pedro de Macorís|3cti Spíritus|3guié|3kuru|3ma|5tenga|3ta Cruz de Tenerife|6Elena|6Fe|4iago|8 Rodríguez|9de Cuba|bl Estero|4o Domingo|d de los Tsáchilas|2r-e Pul|3aburi|4ngani|2skatchewan|3sari|2tun|2vannakhét|3ona|2ïda|1efrou|2govia|2lenge|2mnān|2rua|2ttat|2villa|1haanxi Sheng|3ndong Sheng|4xi Sheng|2éfa|1i Sa Ket|2chuan Sheng|2di Bel Abbès|7nnour|5Ifni|5Kacem|5Slimane|2em Reab|3na|2irt|2la|2ndh|3g Buri|3op|2quijor|2ssili|2vas|1kikda|1ofala|2ndrio|3gkhla|2ria|3sogon|2uk Ahras|3m|3rou|3th Cotabato|5ern|8|8|8 Highlands|9Leyte|9Province|1toĕng Trêng|1ucumbíos|2d Sardegna|3-Kivu|4Ubangi|3urpashchim|2khothai|2l|3awesi Barat|9Selatan|9Tengah|dgara|9Utara|3tan Kudarat|3u|2matera Barat|9Selatan|9Utara|2phan Buri|2rat Thani|3igao del Norte|cSur|4n|1vaay Rieng|1ánchez Ramírez|1éno|2tif|1óc Trăng|1ühbaatar|1īstān va Balūchestān|1ơn La|0Taakaev|2féa|2ilevu|3wan Sheng|2k|3hār|2manrasset|2n-Tan (EH-partial)|3djilé|3ganyika|2ounate|4rirt|2poa|2ranto|3faya (EH-partial)|3lac|3oudannt|3ragona [Tarragona]|2ta|2wi-Tawi|2za|1bong Khmum|1ehrān|2kirdağ|2motu|2ramo|3ni|3uel|2te|1hanh Hóa|2ái Bình|5Nguyên|2ừa Thiên-Huế|1iaret|2besti|2erra del Fuego|2mimoun|2ndouf|3ghir|2paza|2ssemsilt|2zi Ouzou|3nit|2ền Giang|1lemcen|1oamasina|2kat|2ledo|3iara|2rba|2uggourt|1rabzon|3ng|3t|2eviso|2à Vinh|1shopo|3uapa|1ucumán|2nceli|3gurahua|2y|3ên Quang|1ây Ninh|1ébessa|2touan|1öv|0Ubon Ratchathani|1don Thani|1lster|1ruzgān|1thai Thani|2recht|2taradit|1va Province|2s|1íge|1şak|0Valencia|3ladolid|3verde|2n|2rese|1eraguas|3bano-Cusio-Ossola|3celli|3ona|1ibo Valentia|2cenza|2lla Clara|4e de Ndjamena|2terbo|1laams-Brabant|1ĩnh Long|5Phúc|0Wadi Fira|2rdak|1ele-Nzas|2st New Britain|5Sepik|4-Vlaanderen|4ern|7|7|7|7 Cape|8Highlands|8Province|1oleu-Ntem|0Xaignabouli|3sômboun|1iangkhouang|1ékong|0Yagha|2la|3ova|2sothon|2tenga|2zd|1oussoufia|2zgat|1unnan Sheng|1ên Bái|0Zagora|2ire|2mbales|4oanga Sibugay|adel Norte|eSur|4ézia|3ora|6 Chinchipe|2njān|2ragoza|1eeland|1hejiang Sheng|1iro|1ondoma|3guldak|2undwéogo|1uid-Holland|1ābul|0Ávila|0Çanakkale|3kırı|1orum|0Équateur|0Ömnögovĭ|1vörhangay|0Āz̄ārbāyjān-e Ghārbī|eShārqī|0Điện Biên|1ắk Lắk|4Nông|1ồng Nai|5Tháp|0Īlām|0İstanbul|1zmir|0Şanlıurfa|1ırnak|0Ţarţūs|0Ḩalab|2māh|1imş|0Fontvieille|0Jardin Exotique|0La Condamine|3Gare|3Source|2rvotto|0Malbousquet|1onaco-Ville|3eghetti|3te-Carlo|2ulins|0Port-Hercule|0Saint-Roman|5e-Dévote|1pélugues|0Vallon de la Rousse|0Astara|1ğcabədi|2dam|4ş|2stafa|3u|0Babək|2lakən|1eyləqan|1iləsuvar|1ərdə|0Culfa|1əbrayıl|2lilabad|0Daşkəsən|0Füzuli|0Goranboy|1öygöl|3çay|1ədəbəy|0Hacıqabul|0Kürdəmir|1ǝngǝrli|1əlbəcər|0Laçın|1erik|1ənkəran|0Masallı|0Neftçala|0Ordubad|1ğuz|0Qax|2zax|1obustan|1uba|4dlı|2sar|1əbələ|0Saatlı|2birabad|2lyan|2mux|1iyəzən|1ədərək|0Tovuz|1ərtər|0Ucar|0Xaçmaz|1ocalı|4vənd|1ızı|0Yardımlı|1evlax|0Zaqatala|1əngilan|2rdab|0İmişli|1smayıllı|0Şabran|2hbuz|2maxı|1uşa|1əki|2mkir|2rur|0'Asīr|0//Karas|0Abajskaja oblast’|2ruzzo|1damaoua|2rar|1gadez|1hafo|3l|1isén del General Carlos Ibañez del Campo|1kmolinskaja oblast'|2tjubinskaja oblast'|1l Bāḩah|3Madīnah al Munawwarah|3Qaşīm|3Ḩudūd ash Shamālīyah|2i Sabieh|2matinskaja oblast'|1marumayu|1ncash|2dijon|2sabā|2tofagasta|1purimaq|1r Riyāḑ|2arat|2equipa|2ica y Parinacota|2mavir|2ta|2usha|1sh Sharqīyah|3anti|2saba|1tacama|2yrauskaja oblast'|1uckland|2sturland|2tonomous Region in Muslim Mindanao (ARMM)|1wdal|1yacucho|2eyarwady|0Bafatá|2go|2kool|2lkan|2naadir|3skobystrický kraj|2ri|4ma-Waini|2silicata|2tken|3ys Qazaqstan oblysy|2y|3 of Plenty|1icol (Region V)|2obío|3mbo|1olama / Bijagós|2no|4 East|2ucle du Mouhoun|1rakna|3tislavský kraj|2uxelles-Capitale, Région de|1uxoro|1éni Mellal-Khénifra|0Cacheu|2gayan Valley (Region II)|2jamarca|2labarzon (Region IV-A)|5ria|2mpania|2nterbury|2raga (Region XIII)|2sablanca-Settat|3cades|1entral|7 Luzon (Region III)|8Region|8Visayas (Region VII)|7e|5e|6-Est|7Nord|7Ouest|7Sud|1herkaska oblast|4nihivska oblast|6vetska oblast|2uyskaya oblast'|1ibao Nordeste|9oeste|9te|6Sur|1oast|2quimbo|2rdillera Administrative Region (CAR)|2uva-Tabaquite-Talparo|1usco|2yuni-Mazaruni|0Dakar|3hla-Oued Ed-Dahab (EH)|5et Nouâdhibou|2r es Salaam|2vao (Region XI)|2şoguz|1ebubawi K’eyyĭḥ Baḥri|2merara-Mahaica|1iego Martin|2ffa|2khil|2ourbel|1nipropetrovska oblast|1odoma|2netska oblast|2sso|1râa-Tafilalet|1zhalal-Abadskaya oblast'|0East|4 Berbice-Corentyne|4ern|7 Visayas (Region VIII)|1l Callao|3Valle|1milia-Romagna|1nriquillo|1rongo|1ssequibo Islands-West Demerara|2t|1telä-Karjala|6Pohjanmaa|6Savo|0Far North|3g‘ona|2tick|1ès-Meknès|0Gabú|2lguduud|2o|2sh-Barka|1edo|2ita|2ġark'unik'|1isborne|1orgol|1reater Accra|8Wellington|1uelmim-Oued Noun (EH-partial)|2idimaka|2ria|0Hardap|2uts-Bassins|2wke's Bay|1erêm-î Kurdistan|1hohho|1iguamo|2iraan|1odh ech Chargui|6l Gharbi|2vedstaden|1uancavelica|2nin|2ánuco|1öfuðborgarsvæði|0Ica|1locos (Region I)|1mereti|1nchiri|1ringa|1ssyk-Kul'skaja oblast'|1vano-Frankivska oblast|0Jihomoravský kraj|4český kraj|2zzax|1ubbada Dhexe|8Hoose|1āzān|0K'akheti|1affrine|2gera|2inuu|2nta-Häme|2olack|2ra|4gandinskaja oblast'|3lovarský kraj|2tavi|2vango East|8West|2yes|1eski-Pohjanmaa|6Suomi|1harkivska oblast|3tlon|2ersonska oblast|2melnytska oblast|2omas|1idal|2goma|2limanjaro|2rovohradska oblast|1olda|2stanajskaja oblast'|2tayk'|2ulikoro|2šický kraj|1raj Vysočina|2álovéhradecký kraj|1unene|1vemo Kartli|1yivska oblast|2menlaakso|2zylordinskaja oblast'|1édougou|0L'Oriental|1a Araucanía|2mbayeque|2ndskapet Åland|2ppi|2zio|2âyoune-Sakia El Hamra (EH-partial)|1ebap|1iberecký kraj|5tador General Bernardo O'Higgins|2guria|2ma|2ndi|2ttoral|1ombardia|2reto|2s Lagos|2uga|2ṙi|1ubombo|2hanska oblast|1vivska oblast|0Madre de Dios|2gallanes|3way|2haica-Berbice|2kkah al Mukarramah|2nawatū-Whanganui|3dalay|3gghystaū oblysy|3yara|3zini|2ra|4di|3che|3itime (Région)|3lborough|3rakech-Safi|3y|2tam|2ule|2yaro-Rio Claro|1beya|1idtjylland|2maropa (Region IV-B)|1olise|2pti|2quegua|2ravskoslezský kraj|3ogoro|1tskheta-Mtianeti|2wara|1udug|1wanza|1ykolaivska oblast|1énaka|0Najrān|2mangan|2ryn|2tional Capital Region|2voiy|1elson|1itriansky kraj|1jombe|1ordjylland|3th|5 East|5-West|5ern|8 Mindanao (Region X)|9Region|5land|3ðurland eystra|bvestra|2uakchott Nord|bOuest|bSud|1ugaal|0Obock|1deska oblast|1hangwena|1io|1lomoucký kraj|1maheke|2usati|1sh|3ana|3ikoto|1tago|2i|2jozondjupa|1zama|0Pardubický kraj|2sco|2vlodar oblysy|1emba North|6South|2nal-Debe|1iemonte|2rkanmaa|2ura|1lateau-Central|7x|2zeňský kraj|1ohjanmaa|4ois-Karjala|8Pohjanmaa|8Savo|2ltavska oblast|2meroon-Supenaam|2taro-Siparuni|1rešovský kraj|2inces Town|1uglia|2no|1äijät-Häme|0Qashqadaryo|1uinara|0Rabat-Salé-Kénitra|2ch'a-Lechkhumi-Kvemo Svaneti|1egión Metropolitana de Santiago|1ivnenska oblast|1ukwa|2vuma|1égion Continentale|7Insulaire|0Sagaing|2hel|2int-Louis|2marqand|3egrelo-Zemo Svaneti|3tskhe-Javakheti|2n Juan-Laventille|4Martin|3aag|3gre Grande|2takunta|2vanes|5nah|1emienawi K’eyyĭḥ Baḥri|2vero-Kazahstanskaja oblast'|1habeellaha Dhexe|cHoose|2ida Kartli|3nyanga|3selweni|2yghys Qazaqstan oblysy|1ikasso|2miyu|2ngida|2paria|2rdaryo|1jælland|1occsksargen (Region XII)|2ngwe|2ol|2uss-Massa|3th|5ern Region|5land|1tředočeský kraj|1ud-Ouest|2ghd|2mska oblast|2rxondaryo|2ðurland|5nes|1yddanmark|2unik'|1édhiou|2gou|0Tabora|3ūk|2cna|2djourah|2gant|2houa|2las|2mbacounda|2nga|4er-Tétouan-Al Hoceïma|3intharyi|2oudénit|2ranaki|4pacá|2sman|2vuš|1ernopilska oblast|1hiès|1illabéri|2ris Zemmour|1ogdheer|2mbali|4ouctou|2scana|3hkent|1rarza|2enčiansky kraj|2navský kraj|1umbes|2napuna-Piarco|2rkestankaya oblast'|0Ucayali|1lytauskaja oblast’|1mbria|1pper Demerara-Berbice|6East|6Takutu-Upper Essequibo|6West|1usimaa|0Valdesia|3paraíso|2rsinais-Suomi|2yoć Jor|1eneto|2stfirðir|4urland|1innytska oblast|1laams Gewest|1olta|3ynska oblast|0Waikato|1est|4 Coast|4ern|7 North|8Visayas (Region VI)|1oqooyi Galbeed|0Xorazm|0Yangon|1uma|0Zakarpatska oblast|2mbezi|4oanga Peninsula (Region IX)|2nzibar North|9South|9West|2porizka oblast|1hambyl oblysy|2etisū oblysy|2ytomyrska oblast|1iguinchor|2nder|1línský kraj|0wallonne, Région|0Ñuble|0Ústecký kraj|0Širak|0Žilinský kraj|0Ḩā'il|0Amara|0Benshangul-Gumaz|0Gambela Peoples|0Harari People|0Oromia|0Sidama|1omali|2uthern Nations, Nationalities and Peoples|5west Ethiopia Peoples|0Tigrai|0Altaj, Respublika|1vtonomna Respublika Krym|0Bashkortostan, Respublika|1urjatija, Respublika|0Chechenskaya Respublika|2uvashskaya Respublika|0Dagestan, Respublika|0Hakasija, Respublika|0Ingushetiya, Respublika|0Kabardino-Balkarskaja Respublika|2lmykija, Respublika|2rachayevo-Cherkesskaya Respublika|3elija, Respublika|1omi, Respublika|0Marij Èl, Respublika|1ordovija, Respublika|0Qoraqalpog‘iston Respublikasi|0Saha, Respublika|1evernaja Osetija, Respublika|0Tatarstan, Respublika|1yva, Respublika|0Udmurtskaja Respublika|0Anija|2tsla|0Elva|0Haljala|2rku|1äädemeeste|0Järva|1õelähtme|2geva|2hvi|0Kadrina|2mbja|2nepi|2stre|1ehtna|1ihnu|2ili|1ohila|2se|1uusalu|0Luunja|1ääne-Harju|6Nigula|5ranna|1üganuse|0Muhu|2lgi|2stvee|1ärjamaa|0Nõo|0Otepää|0Peipsiääre|1õhja-Pärnumaa|6Sakala|2ltsamaa|3va|0Raasiku|2e|2pla|1uhnu|1äpina|1õuge|0Saarde|2ku|2ue|1etomaa|0Tapa|2rtu|1oila|2ri|1õrva|1üri|0Valga|1iimsi|2ljandi|2nni|2ru-Nigula|1ormsi|1äike-Maarja|0Ágion Óros|0Phatthaya|0Macao SAR|0Oekusi-Ambenu|0Seoul-teukbyeolsi|0Chatham Islands Territory|0Bonaire|0Isla de la Juventud|0Kaohsiung|0New Taipei|0Saba|1int Eustatius|0Taichung|3nan|3pei|2oyuan|0Yogyakarta|0Sejong|0Jeju-teukbyeoljachido|0Abia|1cre|1damawa|1guascalientes|1imeliik|2rai|1kwa Ibom|1labama|3goas|3ska|1mapá|3zonas|1nambra|2dhra Pradesh|2gaur|2zoátegui|1pure|1ragua|2izona|2kansas|2unāchal Pradesh|1ssam|0Bahia|2ja California|f Sur|2rinas|2uchi|2yelsa|1enue|1ihār|1lue Nile|1olívar|2rno|0California|2mpeche|2rabobo|1eará|2ntral Darfur|8Equatoria|1hhattīsgarh|2iapas|3huahua|3n|2uuk|1oahuila de Zaragoza|2jedes|2lima|3orado|2nnecticut|1ross River|0Delaware|3ta|5 Amacuro|1urango|0East Darfur|4ern Equatoria|1bonyi|1do|1kiti|1nugu|1spírito Santo|0Falcón|0Gedaref|2orgia|2zira|1oa|2iás|2mbe|1uanajuato|2errero|2jarāt|2árico|0Haryāna|2tohobei|2waii|1idalgo|2māchal Pradesh|0Idaho|1llinois|1mo|1ndiana|1owa|0Jalisco|1hārkhand|1igawa|1ohor|2nglei|0Kachin|2duna|2no|3sas|2rnātaka|2ssala|2tsina|2yah|4ngel|3in|1ebbi|2dah|2lantan|2ntucky|2rala|1hartoum|1ogi|2ror|2srae|1wara|1ärnten|0La Guaira|2gos|2kes|2ra|1ouisiana|0Madhya Pradesh|2hārāshtra|2ine|2nipur|2ranhão|3yland|2ssachusetts|2to Grosso|b do Sul|1eghālaya|2laka|3ekeok|1ichigan|4oacán de Ocampo|2nas Gerais|3nesota|2randa|2ssissippi|4ouri|2zoram|1on|3agas|3tana|2relos|1érida|2xico|0Nasarawa|2yarit|1ebraska|2geri Sembilan|2vada|3is|2w Hampshire|4Jersey|4Mexico|4South Wales|4York|1garaard|4chelong|4dmau|3tpang|2chesar|2eremlengui|2iwal|1iederösterreich|2ger|1orth Carolina|6Dakota|8rfur|6Kordofan|5ern|8 Bahr el Ghazal|1ueva Esparta|4o León|1āgāland|0Oaxaca|1berösterreich|1disha|1gun|1hio|1klahoma|1ndo|1regon|1sun|1yo|0Pahang|2raná|4íba|1eleliu|2nnsylvania|2rak|3lis|3nambuco|1iauí|1lateau|1ohnpei|2rtuguesa|1uebla|2lau Pinang|0Queensland|3rétaro|2intana Roo|0Rakhine|1ed Sea|1hode Island|1io Grande do Norte|eSul|4de Janeiro|2ver Nile|5s|1ondônia|2raima|1ājasthān|0Sabah|2int Kitts|2lzburg|2n Luis Potosí|2rawak|1elangor|2nnar|2rgipe|1han|1ikkim|2naloa|1okoto|2nora|3sorol|2uth Australia|6Carolina|6Dakota|8rfur|6Kordofan|1teiermark|1ucre|1ão Paulo|0Tabasco|2maulipas|3il Nādu|2raba|2smania|1elangāna|2nnessee|2rengganu|2xas|1irol|1laxcala|1ocantins|1ripura|2ujillo|1áchira|0Unity|1pper Nile|1tah|2tar Pradesh|5ākhand|0Veracruz de Ignacio de la Llave|3mont|1ictoria|2rginia|1orarlberg|0Warrap|2shington|1est Bengal|5Darfur|5Kordofan|5Virginia|4ern Australia|8Bahr el Ghazal|8Equatoria|1hite Nile|1ien|2sconsin|1yoming|0Yap|2racuy|1obe|1ucatán|0Zacatecas|2mfara|1ulia|0Jelgava|1ūrmala|0Liepāja|0Rēzekne|1īga|0Ventspils|0Stînga Nistrului, unitatea teritorială din|0Northern Territory|5west Territories|1unavut|0Yukon|0Lobatse|0Selibe Phikwe|1owa Town|0Funafuti|0Cumbria|0Derbyshire|2von|1orset|0East Sussex|1ssex|0Gloucestershire|0Hampshire|1ertfordshire|0Kent|0Lancashire|1eicestershire|1incolnshire|0Norfolk|3th Yorkshire|2ttinghamshire|0Oxfordshire|0Somerset|1taffordshire|1uffolk|2rrey|0Warwickshire|1est Sussex|1orcestershire|0Chandīgarh|0Delhi|1ādra and Nagar Haveli and Damān and Diu|0Jammu and Kashmīr|0Ladākh|2kshadweep|0Nay Pyi Taw|0Puducherry|0Bath and North East Somerset|1edford|1lackburn with Darwen|5pool|3enau Gwent|1ournemouth, Christchurch and Poole|1racknell Forest|2idgend [Pen-y-bont ar Ogwr GB-POG]|3ghton and Hove|3stol, City of|1uckinghamshire|0Caerphilly [Caerffili GB-CAF]|2rdiff [Caerdydd GB-CRD]|3marthenshire [Sir Gaerfyrddin GB-GFY]|1entral Bedfordshire|2redigion [Sir Ceredigion]|1heshire East|9West and Chester|1onwy|2rnwall|0Darlington|1enbighshire [Sir Ddinbych GB-DDB]|2rby|1urham, County|0East Riding of Yorkshire|0Flintshire [Sir y Fflint GB-FFL]|0Gwynedd|0Halton|2rtlepool|1erefordshire|0Isle of Wight|4s of Scilly|0Kingston upon Hull|0Leicester|1uton|0Medway|2rthyr Tydfil [Merthyr Tudful GB-MTU]|1iddlesbrough|2lton Keynes|1onmouthshire [Sir Fynwy GB-FYN]|0Neath Port Talbot [Castell-nedd Port Talbot GB-CTL]|2wport [Casnewydd GB-CNW]|1orth East Lincolnshire|6Lincolnshire|6Northamptonshire|6Somerset|5umberland|2ttingham|0Pembrokeshire [Sir Benfro GB-BNF]|2terborough|1lymouth|1ortsmouth|2wys|0Reading|2dcar and Cleveland|1hondda Cynon Taff [Rhondda CynonTaf]|1utland|0Shropshire|1lough|1outh Gloucestershire|5ampton|5end-on-Sea|1tockton-on-Tees|3ke-on-Trent|1wansea [Abertawe GB-ATA]|2indon|0Telford and Wrekin|1hurrock|1orbay|3faen [Tor-faen]|0Vale of Glamorgan, The [Bro Morgannwg GB-BMG]|0Warrington|1est Berkshire|5Northamptonshire|1iltshire|2ndsor and Maidenhead|1okingham|1rexham [Wrecsam GB-WRC]|0York|0Niamey|0Celje|0Keila|1ohtla-Järve|2per|1ranj|2ško|0Ljubljana|1oksa|0Maardu|2ribor|1urska Sobota|0Narva|5-Jõesuu|1ova Gorica|3o Mesto|0Paide|1tuj|1ärnu|0Rakvere|0Sillamäe|1lovenj Gradec|0Tallinn|0Velenje|1õru|0Kujawsko-Pomorskie|0Lubelskie|3uskie|0Mazowieckie|2łopolskie|0Opolskie|0Podkarpackie|3laskie|2morskie|0Warmińsko-Mazurskie|1ielkopolskie|0Zachodniopomorskie|0Łódzkie|0Śląskie|1więtokrzyskie|0Tobago","sep":"|"},{"d":"Parish|Emirate|Province|Dependency|County|Region|City|State|Territory|Rayon|Municipality|Autonomous republic|Entity|District|Division|Governorate|Department|Special municipality|Island|Town|Oblast|Prefecture|Commune|Economic prefecture|Canton|Autonomous district|Autonomous region|Special administrative region|Capital district|Geographical region|Capital city|Land|Rural municipality|Urban municipality|Autonomous community|Autonomous city in north africa|Administration|Regional state|Metropolitan department|Metropolitan collectivity with special status|Overseas departmental collectivity|Overseas unique territorial collectivity|Metropolitan region|Overseas collectivity|Council area|Unitary authority|London borough|Metropolitan district|Two-tier county|Country|Administrative region|City with county rights|Geographical unit|Union territory|Free municipal consortium|Metropolitan city|Autonomous province|Decentralized regional entity|Group of islands (20 inhabited islands)|Special city|Special self-governing province|District municipality|City municipality|State city|Popularate|Quarter|Chain (of islands)|Local council|Administrative atoll|Federal territory|Capital territory|Arctic region|Indigenous region|Pakistan administered area|Voivodship|Republic|Administrative territory|Autonomous city|Geographical entity|Borough|Island council|Islands, groups of islands|Outlying area|Administrative precinct|Area|Autonomous municipality|Autonomous sector|Autonomous territorial unit|Capital|City corporation|District with special status|Districts under republic administration|European collectivity|Federal capital territory|Federal dependency|Federal district|Federal entity|Metropolitan administration|Overseas collectivity with special status|Overseas territory|Self-governed part|Special administrative city|Special island authority|Special region|Special self-governing city|Territorial unit|Town council|Urban community|Ward","r":"0*1,1*1,2*1,0*6,3*1,4*1,5*1,6*1,2*7,7*1,8*1,9*1,a*3,b*1,a*2,c*1,0*4,d*9,e*1,2*2,5*2,2*1,d*2,f*1,g*4,h*3,7*3,i*1,d*2,j*1,d*4,k*1,d*1,l*1,m*1,n*2,g*1,o*2,p*1,d*1,5*2,q*1,r*1,g*1,s*1,g*1,2*1,t*1,u*1,d*1,v*1,0*3,2*1,w*1,x*1,w*3,x*2,w*1,f*1,5*2,y*2,z*1,2*1,y*1,2*1,10*1,11*1,e*3,12*1,13*1,14*1,15*1,16*1,17*1,18*1,19*1,1a*1,1b*1,1c*1,1d*1,1b*1,1e*7,g*1,1f*1,4*1,1g*1,2*2,1h*1,7*1,1i*1,1j*1,1k*1,1l*1,4*1,1m*1,1n*1,1o*1,2*1,d*1,4*1,1p*1,1q*1,1r*1,1s*1,2*1,1t*1,d*1,1u*1,1v*1,1w*1,d*1,1x*1,2*2,1y*1,1z*1,20*1,5*1,2*1,21*1,22*1,d*1,23*1,24*1,25*1,5*1,d*1,26*1,2*1,27*1,28*1,6*1,4*1,29*1,2a*1,7*1,6*1,2b*1,10*1,1w*i,2b*2,1e*1n,24*8,1z*1,2c*1,25*1,z*1,y*e,p*5,2d*1,1k*3,q*h,b*2,2e*1,2f*1,27*2,o*10,2g*1,u*3,s*2,1y*2,1u*1,6*u,2h*1,1q*6,1f*m,m*b,18*v,1d*5,4*5o,1l*3,g*5x,3*7,d*h9,1p*17,2i*1,2j*1,e*i,1*6,c*1,2k*1,2l*1,2m*1,2n*1,2o*1,1x*2,1i*5,26*2,t*5,1g*6,f*42,1m*2,20*3,i*3,28*6,29*8,v*f,1v*1v,1a*v,2p*1,1j*l,13*2,12*2m,1b*y,16*b,a*e8,k*5,2a*5,17*4,2q*1,14*2,2r*1,15*1,21*1,0*1o,1s*l,l*2z,2*w6,1t*g,9*1t,5*cx,11*a,23*m,w*1n,2s*1,2t*1,r*2,1n*1,2u*1,h*a,2v*1,2w*1,1o*1,7*7l,1r*6,2x*1,8*4,j*3,2y*1,1c*o,1h*8,19*27,2z*1,x*o,22*f,30*1","sep":"|"}]}]);
const COLONY = [
{"id":"n-957f267d","guard":[["has","state"],["has","the"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Pasco":"The state of Pasco is WA.","tell me the state of Oakland":"The state of Oakland is CA.","name the state of Montrose":"The state of Montrose is CO.","what is the state of Mosinee":"The state of Mosinee is WI.","tell me the state of Manhattan":"The state of Manhattan is KS.","name the state of Eagle":"The state of Eagle is CO.","what is the state of Sarasota":"The state of Sarasota is FL.","tell me the state of Austin":"The state of Austin is TX.","name the state of Telluride":"The state of Telluride is CO.","what is the state of Tallahassee":"The state of Tallahassee is FL.","tell me the state of Kalispell":"The state of Kalispell is MT.","name the state of Gunnison":"The state of Gunnison is CO.","what is the state of Dallas":"The state of Dallas is TX.","tell me the state of Dubuque":"The state of Dubuque is IA.","name the state of Bellingham":"The state of Bellingham is WA.","what is the state of Midland":"The state of Midland is TX.","tell me the state of Asheville":"The state of Asheville is NC.","name the state of Columbia":"The state of Columbia is SC.","what is the state of Des Moines":"The state of Des Moines is IA.","tell me the state of Dothan":"The state of Dothan is AL.","name the state of Daytona Beach":"The state of Daytona Beach is FL.","what is the state of Tulsa":"The state of Tulsa is OK.","tell me the state of Newark":"The state of Newark is NJ.","name the state of New Bern":"The state of New Bern is NC.","what is the state of Detroit":"The state of Detroit is MI.","tell me the state of Buffalo":"The state of Buffalo is NY.","name the state of Providence":"The state of Providence is RI.","what is the state of South Bend":"The state of South Bend is IN.","tell me the state of Helena":"The state of Helena is MT.","name the state of Grand Forks":"The state of Grand Forks is ND.","what is the state of Baltimore":"The state of Baltimore is MD.","tell me the state of Tunica":"The state of Tunica is MS.","name the state of Inyokern":"The state of Inyokern is CA.","what is the state of Denver":"The state of Denver is CO.","tell me the state of Burbank":"The state of Burbank is CA.","name the state of Hayden":"The state of Hayden is CO.","what is the state of Boston":"The state of Boston is MA.","tell me the state of Savannah":"The state of Savannah is GA.","name the state of Richmond":"The state of Richmond is VA.","what is the state of Grand Junction":"The state of Grand Junction is CO."}}},
{"id":"n-bcee2fe0","guard":[["has","state"],["has","the"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"state"}]]],"mem":{"table":{"of Pasco":"The state of Pasco is WA.","of Oakland":"The state of Oakland is CA.","of Montrose":"The state of Montrose is CO.","of Mosinee":"The state of Mosinee is WI.","of Manhattan":"The state of Manhattan is KS.","of Eagle":"The state of Eagle is CO.","of Sarasota":"The state of Sarasota is FL.","of Austin":"The state of Austin is TX.","of Telluride":"The state of Telluride is CO.","of Tallahassee":"The state of Tallahassee is FL.","of Kalispell":"The state of Kalispell is MT.","of Gunnison":"The state of Gunnison is CO.","of Dallas":"The state of Dallas is TX.","of Dubuque":"The state of Dubuque is IA.","of Bellingham":"The state of Bellingham is WA.","of Midland":"The state of Midland is TX.","of Asheville":"The state of Asheville is NC.","of Columbia":"The state of Columbia is SC.","of Des Moines":"The state of Des Moines is IA.","of Dothan":"The state of Dothan is AL.","of Daytona Beach":"The state of Daytona Beach is FL.","of Tulsa":"The state of Tulsa is OK.","of Newark":"The state of Newark is NJ.","of New Bern":"The state of New Bern is NC.","of Detroit":"The state of Detroit is MI.","of Buffalo":"The state of Buffalo is NY.","of Providence":"The state of Providence is RI.","of South Bend":"The state of South Bend is IN.","of Helena":"The state of Helena is MT.","of Grand Forks":"The state of Grand Forks is ND.","of Baltimore":"The state of Baltimore is MD.","of Tunica":"The state of Tunica is MS.","of Inyokern":"The state of Inyokern is CA.","of Denver":"The state of Denver is CO.","of Burbank":"The state of Burbank is CA.","of Hayden":"The state of Hayden is CO.","of Boston":"The state of Boston is MA.","of Savannah":"The state of Savannah is GA.","of Richmond":"The state of Richmond is VA.","of Grand Junction":"The state of Grand Junction is CO."}}},
{"id":"n-29ed792f","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","columbia","dallas","denver","detroit","dothan","dubuque","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","tallahassee","telluride","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-14994e43","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","class name","columbia","dallas","denver","detroit","dothan","dubuque","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","manhattan","midland","montrose","mosinee","newark","nth","oakland","pascal case","pascalcase","pasco","position","providence","richmond","sarasota","savannah","tallahassee","telluride","tulsa","tunica","upper camel case"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-224bfc38","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","capitalise","capitalize","capitalize each word","columbia","dallas","denver","detroit","dothan","dubuque","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","tallahassee","telluride","title case","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.title",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-60835ba8","guard":[["hasAny",["all caps","asheville","austin","baltimore","bellingham","boston","buffalo","burbank","capital letters","capitals","columbia","dallas","denver","detroit","dothan","dubuque","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","tallahassee","telluride","tulsa","tunica","upper case","uppercase"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.upper",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-b9893023","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","camel case","camelcase","columbia","dallas","denver","detroit","dothan","dubuque","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","lower camel case","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","tallahassee","telluride","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-dd8272a3","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","columbia","dallas","denver","detroit","dothan","dubuque","element","grand","gunnison","hayden","helena","invert case","inyokern","item number","kalispell","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","swap case","tallahassee","telluride","toggle case","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.swapCase",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-f7006c0e","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","camel case","camelcase","columbia","dallas","denver","detroit","dothan","dubuque","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","lower camel case","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","tallahassee","telluride","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-f7eba6db","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","class name","columbia","dallas","denver","detroit","dothan","dubuque","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","manhattan","midland","montrose","mosinee","newark","nth","oakland","pascal case","pascalcase","pasco","position","providence","richmond","sarasota","savannah","tallahassee","telluride","tulsa","tunica","upper camel case"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-fd2450f2","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","columbia","dallas","denver","detroit","dothan","dubuque","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","lower case","lowercase","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","small letters","tallahassee","telluride","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.lower",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-7f120e75","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","columbia","dallas","denver","detroit","dothan","dubuque","each word","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","split into words","tallahassee","telluride","tulsa","tunica","words"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-8136c7f9","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","columbia","dallas","denver","detroit","dothan","dubuque","each word","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","split into words","tallahassee","telluride","tulsa","tunica","words"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-d705aceb","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","columbia","dallas","denver","detroit","dothan","dubuque","each word","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","split into words","tallahassee","telluride","tulsa","tunica","words"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-e5ba81ba","guard":[["hasAny",["asheville","austin","baltimore","bellingham","boston","buffalo","burbank","columbia","dallas","denver","detroit","dothan","dubuque","each word","element","grand","gunnison","hayden","helena","inyokern","item number","kalispell","manhattan","midland","montrose","mosinee","newark","nth","oakland","pasco","position","providence","richmond","sarasota","savannah","split into words","tallahassee","telluride","tulsa","tunica","words"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]],["not",["has","college"]],["not",["has","metropolitan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-62937ec3","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","dallas","denver","des","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","tallahassee","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-34b57d7f","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","dallas","denver","des","detroit","dothan","dubuque","element","first n","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","take","tallahassee","top","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-5a8bec9d","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","dallas","denver","des","detroit","dothan","dubuque","element","first n","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","take","tallahassee","top","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-ee0b90eb","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","dallas","denver","des","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","tallahassee","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-01e0ff46","guard":[["hasAny",["all caps","asheville","austin","baltimore","bend","boston","buffalo","burbank","capital letters","capitals","dallas","denver","des","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","tallahassee","tulsa","tunica","upper case","uppercase"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["transform.upper",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-432b6b48","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","camel case","camelcase","dallas","denver","des","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","lower camel case","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","tallahassee","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-576f713d","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","dallas","denver","des","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","lower case","lowercase","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","small letters","tallahassee","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["transform.lower",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-78cc5249","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","class name","dallas","denver","des","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pascal case","pascalcase","pasco","position","sarasota","savannah","tallahassee","tulsa","tunica","upper camel case"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-9056fbaf","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","class name","dallas","denver","des","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pascal case","pascalcase","pasco","position","sarasota","savannah","tallahassee","tulsa","tunica","upper camel case"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["sense.after",{"lit":"state"}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-a2f7f1d9","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","dallas","denver","des","detroit","dothan","dubuque","element","helena","invert case","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","swap case","tallahassee","toggle case","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["transform.swapCase",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-ced387a2","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","capitalise","capitalize","capitalize each word","dallas","denver","des","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","tallahassee","title case","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["transform.title",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-da052722","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","camel case","camelcase","dallas","denver","des","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","lower camel case","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","tallahassee","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["sense.after",{"lit":"state"}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-07d69f1b","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","dallas","denver","des","detroit","dothan","dubuque","each word","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","split into words","tallahassee","tulsa","tunica","words"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["sense.after",{"lit":"state"}],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-83507037","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","dallas","denver","des","detroit","dothan","dubuque","each word","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","split into words","tallahassee","tulsa","tunica","words"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-9e1b9139","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","dallas","denver","des","detroit","dothan","dubuque","each word","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","split into words","tallahassee","tulsa","tunica","words"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["sense.after",{"lit":"state"}],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-d91c283c","guard":[["hasAny",["asheville","austin","baltimore","bend","boston","buffalo","burbank","dallas","denver","des","detroit","dothan","dubuque","each word","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","split into words","tallahassee","tulsa","tunica","words"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-6691bf4e","guard":[["hasAny",["asheville","austin","baltimore","boston","buffalo","burbank","dallas","denver","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","shortest","shortest one","shortest word","tallahassee","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-e01e9138","guard":[["hasAny",["asheville","austin","baltimore","boston","buffalo","burbank","dallas","denver","detroit","dothan","dubuque","element","helena","item number","junction","kalispell","manhattan","midland","mosinee","newark","nth","oakland","pasco","position","sarasota","savannah","shortest","shortest one","shortest word","tallahassee","tulsa","tunica"]],["words<=",7],["has","of"],["not",["has","international"]],["not",["has","regional"]],["not",["has","college"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-c9b09d9e","guard":[["hasAny",["asheville","austin","baltimore","beach","bern","buffalo","columbia","dallas","element","forks","helena","item number","kalispell","manhattan","midland","newark","no vowels","nth","position","remove vowels","sarasota","tallahassee","tunica","without vowels"]],["words<=",6],["has","state"],["has","of"]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-447fe51d","guard":[["hasAny",["alphabetize the letters","austin","buffalo","dallas","denver","dothan","element","gunnison","hayden","helena","item number","junction","kalispell","letters in order","manhattan","midland","montrose","nth","position","sarasota","sort the letters","tallahassee","telluride","tunica"]],["words<=",7],["has","of"],["not",["has","regional"]],["not",["has","international"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-53e96820","guard":[["hasAny",["alphabetize the letters","austin","bend","buffalo","dallas","denver","dothan","eagle","element","gunnison","hayden","helena","item number","junction","kalispell","letters in order","montrose","nth","position","sarasota","sort the letters","tallahassee","tunica"]],["has","state"],["words<=",7],["has","of"]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-cdeb42bc","guard":[["not",["hasAny",["airdate","airport","among","angels","antioch","artist","athletic","atlanticsthelena","author","bees","brasileiro","brown","bryer","california","carolina","category","cgac","circuit","city","clark","cnt","coastline","college","collegeeugene","comments","common","compare","cornell","country","coventry","cty","dartmouth","daugherty","description","distr","duke","durham","eagleclimax","electrocution","emoji","eye","fe","flint","gearty","gender","georgetown","guaviare","harvard","has","heilbron","helena","houstonclear","iana","iata","institute","international","intl","iso2","iso3","johnson","johnstown","kandali","ladies","larger","largest","leicester","lennys","lesser","lewes","lies","lionesses","liverpool","location","louisiana","loyola","men","midcontinent","midland","missouri","missourist","mobile","n3","nickname","offline","orleans","oxford","population","princeton","province","redcar","regional","rich","san","sands","savannah","schnoebelen","school","scientific","seymour","shortcode","slug","smaller","socal","sort","southampton","sponsorship","stanford","streetaddr","strstate","sunderland","suny","symbol","tags","tennesseeknoxville","terrier","terriers","theological","tibetan","title","tufts","twoletter","tz","ucla","university","universitybozeman","usr","visualized","vndmeridianslingshot","watford","weight","welcome","west","writers","yale"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-8c5313ff","guard":[["hasAny",["asheville","austin","baltimore","buffalo","columbia","dallas","element","forks","helena","item number","kalispell","manhattan","midland","newark","no vowels","nth","position","remove vowels","sarasota","tallahassee","tunica","without vowels"]],["words<=",6],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-cc68870f","guard":[["not",["hasAny",["antioch","broome","city","clark","college","collegeeugene","combined","cty","daugherty","fe","houstonclear","institute","international","intl","johnson","largest","lies","location","loyola","midcontinent","midland","missourist","mobile","montgomery","polytechnic","regional","san","school","temperature","tennesseeknoxville","terminal","university","universitybozeman","west"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.join",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"type"}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-11a335eb","guard":[["not",["hasAny",["antioch","broome","city","clark","college","collegeeugene","combined","cty","daugherty","fe","houstonclear","institute","international","intl","johnson","largest","lies","location","loyola","midcontinent","midland","missourist","mobile","montgomery","polytechnic","regional","san","school","temperature","tennesseeknoxville","terminal","university","universitybozeman","west"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"type"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-201b506b","guard":[["not",["hasAny",["antioch","broome","city","clark","college","collegeeugene","combined","cty","daugherty","fe","houstonclear","institute","international","intl","johnson","largest","lies","location","loyola","midcontinent","midland","missourist","mobile","montgomery","polytechnic","regional","san","school","temperature","tennesseeknoxville","terminal","university","universitybozeman","west"]]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"type"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-88709542","guard":[["has","state"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the state of Pasco":"The state of Pasco is WA.","the state of Mosinee":"The state of Mosinee is WI.","the state of Sarasota":"The state of Sarasota is FL.","the state of Tallahassee":"The state of Tallahassee is FL.","the state of Dallas":"The state of Dallas is TX.","the state of Midland":"The state of Midland is TX.","the state of Des Moines":"The state of Des Moines is IA.","the state of Tulsa":"The state of Tulsa is OK.","the state of Detroit":"The state of Detroit is MI.","the state of South Bend":"The state of South Bend is IN.","the state of Baltimore":"The state of Baltimore is MD.","the state of Denver":"The state of Denver is CO.","the state of Boston":"The state of Boston is MA.","the state of Grand Junction":"The state of Grand Junction is CO."}}},
{"id":"n-0d797d23","guard":[["hasAny",["denver","element","gunnison","hayden","item number","junction","montrose","nth","position","telluride"]],["words<=",7],["has","the"],["not",["has","me"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CO."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-0e207311","guard":[["hasAny",["bend","bern","eagle","element","forks","item number","longest","longest one","longest word","nth","pasco","position","tulsa"]],["not",["has","county"]],["not",["has","international"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"state"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-09d19b54","guard":[["hasAny",["bend","bern","class name","eagle","element","forks","item number","longest","longest one","longest word","nth","pascal case","pascalcase","pasco","position","tulsa","upper camel case"]],["not",["has","county"]],["not",["has","international"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"state"}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-0cbce553","guard":[["hasAny",["bend","bern","capitalise","capitalize","capitalize each word","eagle","element","forks","item number","longest","longest one","longest word","nth","pasco","position","title case","tulsa"]],["not",["has","county"]],["not",["has","international"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-29fd2138","guard":[["hasAny",["bend","bern","eagle","element","forks","invert case","item number","longest","longest one","longest word","nth","pasco","position","swap case","toggle case","tulsa"]],["not",["has","county"]],["not",["has","international"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-d176e602","guard":[["hasAny",["all caps","bend","bern","capital letters","capitals","eagle","element","forks","item number","longest","longest one","longest word","nth","pasco","position","tulsa","upper case","uppercase"]],["not",["has","county"]],["not",["has","international"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-d810300e","guard":[["hasAny",["bend","bern","eagle","element","forks","item number","longest","longest one","longest word","lower case","lowercase","nth","pasco","position","small letters","tulsa"]],["not",["has","county"]],["not",["has","international"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"state"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-fdb0a3cc","guard":[["hasAny",["bend","bern","camel case","camelcase","eagle","element","forks","item number","longest","longest one","longest word","lower camel case","nth","pasco","position","tulsa"]],["not",["has","county"]],["not",["has","international"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"state"}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-a018fe42","guard":[["hasAny",["bend","bern","each word","eagle","element","forks","item number","longest","longest one","longest word","nth","pasco","position","split into words","tulsa","words"]],["not",["has","county"]],["not",["has","international"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"state"}],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-d39b598f","guard":[["hasAny",["bend","bern","each word","eagle","element","forks","item number","longest","longest one","longest word","nth","pasco","position","split into words","tulsa","words"]],["not",["has","county"]],["not",["has","international"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"state"}],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-fbba5d30","guard":[["hasAny",["alphabetize the letters","beach","eagle","element","gunnison","hayden","item number","letters in order","montrose","nth","position","sort the letters","telluride"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"state"}],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-2f136cd9","guard":[["hasAny",["delete","eagle","gunnison","hayden","item number","montrose","nth","strip out","telluride"]],["words<=",5]],"pyramid":["render.str",["transform.remove",{"lit":"CO"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-f82f3bcd","guard":[["hasAny",["beach","bern","columbia","element","forks","item number","no vowels","nth","position","remove vowels","without vowels"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"state"}],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-371b2e7a","guard":[["hasAny",["burbank","element","inyokern","item number","nth","oakland","position"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CA."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-721b8de9","guard":[["hasAny",["austin","dallas","element","item number","midland","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is TX."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-bd443053","guard":[["hasAny",["burbank","delete","item number","nth","oakland","remove","strip out"]],["words<=",6]],"pyramid":["render.str",["transform.remove",{"lit":"CA"},["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"state"}],{"lit":1}]]],"mem":null},
{"id":"n-ce6ebb24","guard":[["hasAny",["delete","helena","item number","kalispell","nth","remove","strip out"]],["has","state"],["not",["has","airport"]]],"pyramid":["render.str",["transform.remove",{"lit":"MT"},["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"state"}],{"lit":1}]]],"mem":null},
{"id":"n-2ff92057","guard":[["hasAny",["des","dubuque","element","item number","nth","position"]],["has","of"],["not",["has","west"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IA."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-af49ce31","guard":[["hasAny",["element","item number","nth","position","sarasota","tallahassee"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is FL."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-be634307","guard":[["hasAny",["element","helena","item number","kalispell","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MT."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-e2a0d48b","guard":[["hasAny",["bellingham","element","item number","nth","pasco","position"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is WA."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-ffe5505f","guard":[["hasAny",["as a roman numeral","element","from roman","in arabic numerals","in roman numerals","item number","nth","position","roman numeral","roman numeral value","state","to roman","what number is"]],["has","what"]],"pyramid":["render.str",["compute.toRoman",["compute.fromRoman",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]]],"mem":null},
{"id":"n-7234025d","guard":[["hasAny",["alphabetize the letters","bend","eagle","element","item number","letters in order","longest","longest one","longest word","nth","position","sort the letters"]],["not",["has","county"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"state"}],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-fe13239f","guard":[["hasAny",["bern","element","forks","item number","longest","longest one","longest word","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"state"}],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]]],"mem":null},
{"id":"n-bad804ab","guard":[["hasAny",["element","forks","item number","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]],"mem":null},
{"id":"n-14f9a9e3","guard":[["hasAny",["each word","element","forks","item number","nth","position","split into words","words"]]],"pyramid":["render.lines",["transform.words",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-576dd085","guard":[["hasAny",["element","forks","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-870db90e","guard":[["hasAny",["each word","element","forks","item number","nth","position","split into words","words"]]],"pyramid":["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-972f14d5","guard":[["hasAny",["element","forks","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-a0ab1b0f","guard":[["hasAny",["all caps","capital letters","capitals","element","forks","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-006b1171","guard":[["hasAny",["each word","element","forks","item number","longest","longest one","longest word","nth","position","split into words","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]]],"mem":null},
{"id":"n-03bc3e97","guard":[["hasAny",["all caps","capital letters","capitals","each word","element","forks","item number","nth","position","split into words","upper case","uppercase","words"]]],"pyramid":["render.lines",["transform.words",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]]],"mem":null},
{"id":"n-05d88d98","guard":[["hasAny",["each word","element","forks","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]]],"mem":null},
{"id":"n-096471e2","guard":[["hasAny",["asheville","delete","item number","nth","remove","strip out"]],["not",["has","city"]]],"pyramid":["render.str",["transform.remove",{"lit":"NC"},["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"state"}],{"lit":1}]]],"mem":null},
{"id":"n-2b7f72a5","guard":[["hasAny",["delete","item number","nth","pasco","position","remove","strip out","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"WA"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-2f66cfa3","guard":[["hasAny",["delete","forks","item number","nth","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"grand"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-32c23a11","guard":[["hasAny",["dashes","each word","element","forks","hyphens","item number","kebab case","kebabcase","nth","position","split into words","words"]]],"pyramid":["render.list",["transform.words",["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]]],"mem":null},
{"id":"n-508c2f67","guard":[["hasAny",["caesar cipher","dubuque","item number","nth","rotate the letters","shift by","shift each letter"]],["has","tell"]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"state"}],{"lit":1}],{"lit":100}]],"mem":null},
{"id":"n-5a5582b0","guard":[["hasAny",["delete","element","inyokern","item number","nth","position","remove","strip out"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"CA"},["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"airport"}],{"lit":1}]]],"mem":null},
{"id":"n-6946d46b","guard":[["hasAny",["each word","element","forks","invert case","item number","nth","position","split into words","swap case","toggle case","words"]]],"pyramid":["render.list",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]]],"mem":null},
{"id":"n-6a014e97","guard":[["hasAny",["bern","delete","item number","nth","strip out"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"NC"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-6ee68701","guard":[["hasAny",["bellingham","delete","item number","nth","strip out"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"WA"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-88c613dd","guard":[["hasAny",["delete","element","forks","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-8b9eb5c2","guard":[["hasAny",["each word","element","forks","invert case","item number","nth","position","split into words","swap case","toggle case","words"]]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]]],"mem":null},
{"id":"n-8e60b40a","guard":[["hasAny",["all caps","capital letters","capitals","each word","element","forks","item number","nth","position","split into words","upper case","uppercase","words"]]],"pyramid":["render.list",["transform.words",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]]],"mem":null},
{"id":"n-8ec6b42c","guard":[["hasAny",["dashes","each word","element","forks","hyphens","item number","kebab case","kebabcase","nth","position","split into words","words"]]],"pyramid":["render.lines",["transform.words",["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]]],"mem":null},
{"id":"n-a7903990","guard":[["hasAny",["austin","delete","item number","nth","remove","strip out"]],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"TX"},["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"state"}],{"lit":1}]]],"mem":null},
{"id":"n-c20f56ec","guard":[["hasAny",["beach","delete","item number","nth","strip out"]],["words<=",6],["has","state"]],"pyramid":["render.str",["transform.remove",{"lit":"FL"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-d66f1762","guard":[["hasAny",["delete","inyokern","item number","nth","strip out"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"CA"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-db6846e8","guard":[["hasAny",["element","forks","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-e23e0f75","guard":[["hasAny",["delete","des","item number","nth","strip out"]],["words<=",7],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"IA"},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-00006f85","guard":[["hasAny",["element","forks","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ND."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-05dbb321","guard":[["hasAny",["baltimore","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MD."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-07ce908f","guard":[["hasAny",["element","forks","how many vowels","item number","nth","number of vowels","position","vowel count"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-08f37cbd","guard":[["hasAny",["asheville","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is NC."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-0df0ad8a","guard":[["hasAny",["dothan","element","item number","nth","position"]],["not",["has","airport"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is AL."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-274780e7","guard":[["hasAny",["columbia","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is SC."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-39f5b3d9","guard":[["hasAny",["characters from","element","forks","item number","letters from to","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-3a0a82df","guard":[["hasAny",["dubuque","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IA."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-400959ef","guard":[["hasAny",["element","forks","how many vowels","item number","nth","number of vowels","position","vowel count"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-42ea2b05","guard":[["hasAny",["delete","element","forks","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.after",{"lit":"state"}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-49fb2360","guard":[["hasAny",["buffalo","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is NY."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-5441378c","guard":[["hasAny",["element","forks","how many vowels","item number","nth","number of vowels","position","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-5ed56069","guard":[["hasAny",["element","item number","nth","position","providence"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is RI."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-6fd9c8bb","guard":[["hasAny",["characters from","element","forks","item number","letters from to","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-79019ee4","guard":[["hasAny",["bend","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-87a5900b","guard":[["hasAny",["characters from","element","forks","item number","letters from to","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-90c664b3","guard":[["hasAny",["detroit","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MI."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-a06377a4","guard":[["hasAny",["element","forks","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-a799eb32","guard":[["hasAny",["characters from","element","forks","item number","letters from to","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-b33d6f29","guard":[["hasAny",["element","item number","nth","position","tunica"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MS."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-bb5ad64c","guard":[["hasAny",["element","item number","manhattan","nth","position"]],["has","tell"],["not",["has","christian"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is KS."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-bd103f4e","guard":[["hasAny",["element","item number","mosinee","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is WI."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-be7bcc8c","guard":[["hasAny",["element","forks","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-c3786b39","guard":[["hasAny",["element","item number","nth","position","tulsa"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is OK."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-c516cfc6","guard":[["hasAny",["boston","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is MA."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-de9e2806","guard":[["hasAny",["element","item number","nth","position","richmond"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is VA."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-f651af61","guard":[["hasAny",["element","forks","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-f8710e59","guard":[["hasAny",["element","item number","nth","position","savannah"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is GA."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-fa0196ea","guard":[["hasAny",["characters from","element","forks","item number","letters from to","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-ffb1143f","guard":[["hasAny",["element","item number","newark","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is NJ."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-6d9ef809","guard":[["hasAny",["bend","class name","element","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["transform.pascal",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-8bbd809e","guard":[["hasAny",["element","forks","item number","join","joined with","nth","position","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-ea344440","guard":[["hasAny",["bend","camel case","camelcase","element","item number","lower camel case","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["transform.camel",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-21d26c74","guard":[["hasAny",["alphabetize the letters","dothan","element","item number","letters in order","nth","position","sort the letters"]],["has","tell"],["not",["has","airport"]]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"airport"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"airport"},{"lit":"state"}]]],"mem":null},
{"id":"n-284292c1","guard":[["hasAny",["bend","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["render.and",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]]],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-8fca2691","guard":[["hasAny",["bend","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["render.list",["transform.words",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]]],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-ddf13173","guard":[["hasAny",["each word","element","forks","item number","nth","position","shortest","shortest one","shortest word","split into words","words"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"airport"}]]]],"mem":null},
{"id":"n-037605c8","guard":[["hasAny",["bern","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of New Bern is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-089f8d31","guard":[["hasAny",["element","forks","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}]]],"mem":null},
{"id":"n-236aeeb2","guard":[["hasAny",["element","forks","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-25597aee","guard":[["hasAny",["element","forks","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-subdivisions-eaf4dc"},{"lit":"type"}],{"lit":1}]]],"mem":null},
{"id":"n-7e2361ab","guard":[["hasAny",["element","forks","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-b364b32a","guard":[["hasAny",["element","forks","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-d6fa0d05","guard":[["hasAny",["eagle","element","item number","longest","longest one","longest word","nth","position"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Eagle is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-d7934ce4","guard":[["hasAny",["element","forks","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-fbdf1193","guard":[["hasAny",["element","forks","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-9e81473c","guard":[["hasAny",["beach","element","item number","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Daytona Beach is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-0803e8bf","guard":[["hasAny",["element","item number","junction","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Grand Junction is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-0cbf2132","guard":[["hasAny",["detroit","element","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Detroit is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-148cf318","guard":[["hasAny",["element","item number","nth","oakland","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Oakland is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-15ce850d","guard":[["hasAny",["buffalo","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Buffalo is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-215482b6","guard":[["hasAny",["element","gunnison","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Gunnison is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-2f925c95","guard":[["hasAny",["element","item number","montrose","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Montrose is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-31b9180f","guard":[["hasAny",["element","hayden","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Hayden is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-355722fa","guard":[["hasAny",["element","helena","item number","nth","position"]],["has","state"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Helena is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-36485914","guard":[["hasAny",["element","item number","nth","position","providence"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Providence is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-38b1b0ec","guard":[["hasAny",["dallas","element","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Dallas is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-3b973ede","guard":[["hasAny",["element","item number","nth","position","tunica"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tunica is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-4125ed41","guard":[["hasAny",["dothan","element","item number","nth","position"]],["has","tell"],["not",["has","airport"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Dothan is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-49bf8211","guard":[["hasAny",["element","item number","nth","position","tulsa"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tulsa is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-4c7d7794","guard":[["hasAny",["delete","dothan","element","item number","nth","position","remove","strip out"]],["not",["has","airport"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"airport"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"airport"},{"lit":"state"}],["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"state"}],{"lit":1}]]],"mem":null},
{"id":"n-624ed496","guard":[["hasAny",["boston","element","item number","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Boston is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-69530b1e","guard":[["hasAny",["element","item number","nth","pasco","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Pasco is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-83576ab5","guard":[["hasAny",["dubuque","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Dubuque is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-85e2e6fd","guard":[["hasAny",["columbia","element","item number","nth","position"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Columbia is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-86da8930","guard":[["hasAny",["des","element","item number","nth","position"]],["has","what"],["not",["has","city"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Des Moines is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-8a5f2179","guard":[["hasAny",["denver","element","item number","nth","position"]],["words<=",6],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Denver is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-9e87d1f6","guard":[["hasAny",["element","item number","nth","position","savannah"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Savannah is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-9ecabb84","guard":[["hasAny",["delete","element","forks","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"airport"}]]],"mem":null},
{"id":"n-a113e2ad","guard":[["hasAny",["element","item number","nth","position","richmond"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Richmond is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-a6c4ad66","guard":[["hasAny",["element","item number","nth","position","sarasota"]],["has","state"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Sarasota is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-a6e2cb9d","guard":[["hasAny",["element","forks","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Grand Forks is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-a80d64ab","guard":[["hasAny",["austin","element","item number","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Austin is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-b005938d","guard":[["hasAny",["element","item number","kalispell","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Kalispell is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-b4e8e726","guard":[["hasAny",["baltimore","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Baltimore is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-b6dec055","guard":[["hasAny",["element","item number","manhattan","nth","position"]],["words<=",6],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Manhattan is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-ba6609e2","guard":[["hasAny",["element","inyokern","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Inyokern is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-c8c7ddef","guard":[["hasAny",["bellingham","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Bellingham is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-ccfc3bae","guard":[["hasAny",["delete","element","inyokern","item number","nth","position","remove","strip out"]],["has","name"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"airport"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"airport"},{"lit":"state"}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-cd00881e","guard":[["hasAny",["element","item number","midland","nth","position"]],["words<=",6],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Midland is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-d010e273","guard":[["hasAny",["element","item number","newark","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Newark is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-ddd02ef6","guard":[["hasAny",["asheville","element","item number","nth","position"]],["has","tell"],["has","state"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Asheville is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-e5741816","guard":[["hasAny",["element","item number","nth","position","tallahassee"]],["has","state"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Tallahassee is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-f65a3bf7","guard":[["hasAny",["element","item number","nth","position","telluride"]],["has","name"],["has","state"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Telluride is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-f780b9f9","guard":[["hasAny",["element","item number","mosinee","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Mosinee is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-fc284375","guard":[["hasAny",["burbank","element","item number","nth","position"]],["has","state"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Burbank is ",{"slot":1},"."]},["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}],{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"},{"lit":"state"}]],"mem":null},
{"id":"n-1d394174","guard":[["hasAny",["change to","element","forks","item number","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-63fc665f","guard":[["hasAny",["change to","element","forks","item number","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-055d15d0","guard":[["hasAny",["state","tulsa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Tulsa":"The state of Tulsa is OK."}}},
{"id":"n-0c14948f","guard":[["hasAny",["denver","state"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Denver":"The state of Denver is CO."}}},
{"id":"n-14a0c926","guard":[["hasAny",["baltimore","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Baltimore":"The state of Baltimore is MD."}}},
{"id":"n-15e75fd9","guard":[["hasAny",["montrose","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Montrose":"The state of Montrose is CO."}}},
{"id":"n-1b1c9193","guard":[["hasAny",["asheville","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Asheville":"The state of Asheville is NC."}}},
{"id":"n-2492f213","guard":[["hasAny",["buffalo","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Buffalo":"The state of Buffalo is NY."}}},
{"id":"n-2b2e47ae","guard":[["hasAny",["columbia","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Columbia":"The state of Columbia is SC."}}},
{"id":"n-2e0dacfe","guard":[["hasAny",["boston","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Boston":"The state of Boston is MA."}}},
{"id":"n-336935a7","guard":[["hasAny",["beach","daytona","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Daytona Beach":"The state of Daytona Beach is FL."}}},
{"id":"n-3fae5ee6","guard":[["hasAny",["detroit","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Detroit":"The state of Detroit is MI."}}},
{"id":"n-3fbca212","guard":[["hasAny",["newark","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Newark":"The state of Newark is NJ."}}},
{"id":"n-49a50e43","guard":[["hasAny",["sarasota","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Sarasota":"The state of Sarasota is FL."}}},
{"id":"n-49c4a75f","guard":[["hasAny",["burbank","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Burbank":"The state of Burbank is CA."}}},
{"id":"n-500fa76a","guard":[["hasAny",["forks","grand","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Grand Forks":"The state of Grand Forks is ND."}}},
{"id":"n-50dd0562","guard":[["hasAny",["dallas","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Dallas":"The state of Dallas is TX."}}},
{"id":"n-53172e2f","guard":[["hasAny",["oakland","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Oakland":"The state of Oakland is CA."}}},
{"id":"n-56561c21","guard":[["hasAny",["eagle","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Eagle":"The state of Eagle is CO."}}},
{"id":"n-6e7930a3","guard":[["hasAny",["gunnison","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Gunnison":"The state of Gunnison is CO."}}},
{"id":"n-7018d9be","guard":[["hasAny",["dothan","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Dothan":"The state of Dothan is AL."}}},
{"id":"n-70b550ff","guard":[["hasAny",["des","moines","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Des Moines":"The state of Des Moines is IA."}}},
{"id":"n-73ef748c","guard":[["hasAny",["name","state","telluride"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Telluride":"The state of Telluride is CO."}}},
{"id":"n-794674ac","guard":[["hasAny",["kalispell","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Kalispell":"The state of Kalispell is MT."}}},
{"id":"n-7f6072b2","guard":[["hasAny",["midland","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Midland":"The state of Midland is TX."}}},
{"id":"n-82443a7d","guard":[["hasAny",["state","tunica"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Tunica":"The state of Tunica is MS."}}},
{"id":"n-872ec0c7","guard":[["hasAny",["bend","south","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of South Bend":"The state of South Bend is IN."}}},
{"id":"n-8fa8bb2f","guard":[["hasAny",["bellingham","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Bellingham":"The state of Bellingham is WA."}}},
{"id":"n-9b571fdc","guard":[["hasAny",["pasco","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Pasco":"The state of Pasco is WA."}}},
{"id":"n-a735bb8b","guard":[["hasAny",["grand","junction","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Grand Junction":"The state of Grand Junction is CO."}}},
{"id":"n-b0344f2d","guard":[["hasAny",["savannah","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Savannah":"The state of Savannah is GA."}}},
{"id":"n-b6f29109","guard":[["hasAny",["austin","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Austin":"The state of Austin is TX."}}},
{"id":"n-bc395e0f","guard":[["hasAny",["manhattan","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Manhattan":"The state of Manhattan is KS."}}},
{"id":"n-bf2c6e76","guard":[["hasAny",["helena","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Helena":"The state of Helena is MT."}}},
{"id":"n-cb606154","guard":[["hasAny",["state","tallahassee"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Tallahassee":"The state of Tallahassee is FL."}}},
{"id":"n-d56416ac","guard":[["hasAny",["bern","name","new","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of New Bern":"The state of New Bern is NC."}}},
{"id":"n-d57a865c","guard":[["hasAny",["name","providence","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Providence":"The state of Providence is RI."}}},
{"id":"n-d860a5e8","guard":[["hasAny",["inyokern","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Inyokern":"The state of Inyokern is CA."}}},
{"id":"n-e5d7dcbc","guard":[["hasAny",["dubuque","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the state of Dubuque":"The state of Dubuque is IA."}}},
{"id":"n-e8181e64","guard":[["hasAny",["mosinee","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the state of Mosinee":"The state of Mosinee is WI."}}},
{"id":"n-e988810d","guard":[["hasAny",["hayden","name","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Hayden":"The state of Hayden is CO."}}},
{"id":"n-fcfedb30","guard":[["hasAny",["name","richmond","state"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the state of Richmond":"The state of Richmond is VA."}}},
{"id":"n-31bc5b46","guard":[["hasAny",["forks","item number","nth"]]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-3825b3df","guard":[["hasAny",["bend","longest one","longest word"]],["has","state"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of South Bend is IN."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-491c9c8d","guard":[["hasAny",["forks","item number","nth"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-89e64d6b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","forks","title case"]]],"pyramid":["render.str",["transform.title",["sense.after",{"lit":"state"}]]],"mem":null},
{"id":"n-8a3528b5","guard":[["hasAny",["forks","invert case","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["sense.after",{"lit":"state"}]]],"mem":null},
{"id":"n-9cdfaaf4","guard":[["hasAny",["forks","lower case","lowercase","small letters"]]],"pyramid":["render.str",["transform.lower",["sense.after",{"lit":"state"}]]],"mem":null},
{"id":"n-ade6671a","guard":[["hasAny",["all caps","capital letters","capitals","forks","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["sense.after",{"lit":"state"}]]],"mem":null},
{"id":"n-bc58d496","guard":[["has","bend"]],"pyramid":["render.template",{"lit":["The state ",{"slot":0}," is IN."]},["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-ca9f0162","guard":[["hasAny",["abbreviate","acronym","mosinee","short form"]]],"pyramid":["render.str",["transform.acronym",["sense.before",{"lit":"state"}]]],"mem":null},
{"id":"n-e6504c43","guard":[["hasAny",["each word","forks","split into words","words"]]],"pyramid":["render.list",["transform.words",["sense.after",{"lit":"state"}]]],"mem":null},
{"id":"n-f29a003f","guard":[["hasAny",["each word","forks","split into words","words"]]],"pyramid":["render.lines",["transform.words",["sense.after",{"lit":"state"}]]],"mem":null},
{"id":"n-12af8962","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-21d151d1","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-243f66de","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-3bce1686","guard":[["hasAny",["characters from","forks","letters from to","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["sense.text"],["sense.wordCount"],{"lit":100}]],"mem":null},
{"id":"n-3d9a96e1","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":2},["sense.wordCount"]]],"mem":null},
{"id":"n-4df8ccfa","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-7162e3c7","guard":[["hasAny",["characters from","forks","letters from to","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["sense.text"],{"lit":10},{"lit":100}]],"mem":null},
{"id":"n-82ee8dae","guard":[["hasAny",["forks","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["sense.text"],["sense.before",{"lit":"state"}]]],"mem":null},
{"id":"n-8f1712e2","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-9128e8ef","guard":[["hasAny",["delete","forks","strip out"]]],"pyramid":["render.str",["transform.remove",["sense.text"],["sense.before",{"lit":"of"}]]],"mem":null},
{"id":"n-91b05203","guard":[["hasAny",["caesar cipher","dubuque","rotate the letters","shift by","shift each letter"]],["has","tell"]],"pyramid":["render.str",["transform.caesar",["sense.wordAt",{"lit":2}],{"lit":100}]],"mem":null},
{"id":"n-983c6947","guard":[["hasAny",["delete","forks","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.text"],["sense.before",{"lit":"state"}]]],"mem":null},
{"id":"n-9c605b57","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-a4df743f","guard":[["hasAny",["forks","separate by","split by"]]],"pyramid":["render.list",["transform.split",["sense.text"],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-acc1f5de","guard":[["hasAny",["delete","forks","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.after",{"lit":"state"}],["sense.lastWord"]]],"mem":null},
{"id":"n-b1afa810","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-bd5c1e9a","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-c7593da3","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-ca22db91","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-cbaeaaee","guard":[["hasAny",["forks","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["sense.after",{"lit":"state"}],["sense.lastWord"]]],"mem":null},
{"id":"n-cd9ca9a7","guard":[["has","forks"]],"pyramid":["render.list",["iterate.repeat",["sense.after",{"lit":"state"}],{"lit":1}]],"mem":null},
{"id":"n-d45de256","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":5}]],"mem":null},
{"id":"n-e2e3573d","guard":[["hasAny",["delete","forks","strip out"]]],"pyramid":["render.str",["transform.remove",["sense.text"],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-e75130de","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":5}]],"mem":null},
{"id":"n-e9d5112c","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-ed03807d","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.words"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-fe76207d","guard":[["hasAny",["forks","from position","items from to"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],{"lit":3},["sense.wordCount"]]],"mem":null},
{"id":"n-536c3ad4","guard":[["hasAny",["bern","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is NC."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-6062e62f","guard":[["hasAny",["bend","longest","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-a85cc58b","guard":[["hasAny",["eagle","longest","longest one","longest word"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is CO."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-08c9f26e","guard":[["hasAny",["bend","invert case","longest","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["sense.after",{"lit":"state"}]]],"mem":null},
{"id":"n-23968d2b","guard":[["hasAny",["beach","element","item number","nth","position"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is FL."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-3f8d5552","guard":[["hasAny",["bend","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-a331f8c5","guard":[["hasAny",["bend","capitalise","capitalize","capitalize each word","longest","longest one","longest word","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["aggregate.longest",["sense.words"]],["transform.title",["sense.after",{"lit":"state"}]]],"mem":null},
{"id":"n-f5c039f7","guard":[["hasAny",["all caps","bend","capital letters","capitals","longest","longest one","longest word","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["aggregate.longest",["sense.words"]],["transform.upper",["sense.after",{"lit":"state"}]]],"mem":null},
{"id":"n-f9ad4202","guard":[["hasAny",["bend","longest","longest one","longest word","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["aggregate.longest",["sense.words"]],["transform.lower",["sense.after",{"lit":"state"}]]],"mem":null},
{"id":"n-61db81e7","guard":[["hasAny",["bend","first n","take","top"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-64885769","guard":[["hasAny",["bend","first n","take","top"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is IN."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["sense.after",{"lit":"state"}]],"mem":null},
{"id":"n-0e0b4d36","guard":[["has","telluride"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Telluride":"The state of Telluride is CO."}}},
{"id":"n-1b22f563","guard":[["hasAny",["bern","name","new","state"]],["has","bern"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of New Bern":"The state of New Bern is NC."}}},
{"id":"n-23387cb1","guard":[["hasAny",["austin","state"]],["has","austin"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Austin":"The state of Austin is TX."}}},
{"id":"n-2bc75908","guard":[["has","eagle"],["has","state"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Eagle":"The state of Eagle is CO."}}},
{"id":"n-2cae3014","guard":[["has","providence"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Providence":"The state of Providence is RI."}}},
{"id":"n-2e2b381d","guard":[["hasAny",["sarasota","state"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Sarasota":"The state of Sarasota is FL."}}},
{"id":"n-3b446b28","guard":[["has","bellingham"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Bellingham":"The state of Bellingham is WA."}}},
{"id":"n-3ca08b56","guard":[["hasAny",["helena","state"]],["has","helena"],["not",["has","airport"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Helena":"The state of Helena is MT."}}},
{"id":"n-44b2f580","guard":[["hasAny",["burbank","state"]],["has","burbank"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Burbank":"The state of Burbank is CA."}}},
{"id":"n-4d9008a5","guard":[["hasAny",["savannah","state"]],["has","savannah"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Savannah":"The state of Savannah is GA."}}},
{"id":"n-5ce6c7ed","guard":[["hasAny",["grand","junction","state"]],["has","state"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Grand Junction":"The state of Grand Junction is CO."}}},
{"id":"n-6145dc84","guard":[["has","hayden"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Hayden":"The state of Hayden is CO."}}},
{"id":"n-6630ef9c","guard":[["hasAny",["forks","grand","name","state"]],["has","grand"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Grand Forks":"The state of Grand Forks is ND."}}},
{"id":"n-68745d0e","guard":[["hasAny",["buffalo","state"]],["has","buffalo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Buffalo":"The state of Buffalo is NY."}}},
{"id":"n-69ac3ee8","guard":[["hasAny",["dallas","state"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Dallas":"The state of Dallas is TX."}}},
{"id":"n-72028095","guard":[["hasAny",["baltimore","state"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Baltimore":"The state of Baltimore is MD."}}},
{"id":"n-8f2c37b3","guard":[["hasAny",["beach","daytona","name","state"]],["words<=",6],["has","daytona"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Daytona Beach":"The state of Daytona Beach is FL."}}},
{"id":"n-9466e4a4","guard":[["hasAny",["dothan","state"]],["has","dothan"],["not",["has","airport"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Dothan":"The state of Dothan is AL."}}},
{"id":"n-970cbbac","guard":[["has","richmond"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Richmond":"The state of Richmond is VA."}}},
{"id":"n-9771a3bc","guard":[["hasAny",["boston","state"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Boston":"The state of Boston is MA."}}},
{"id":"n-a1e23d72","guard":[["hasAny",["mosinee","state"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Mosinee":"The state of Mosinee is WI."}}},
{"id":"n-a73b0963","guard":[["hasAny",["state","tallahassee"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Tallahassee":"The state of Tallahassee is FL."}}},
{"id":"n-a73faa06","guard":[["hasAny",["des","moines","state"]],["has","what"],["has","of"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Des Moines":"The state of Des Moines is IA."}}},
{"id":"n-abdba66b","guard":[["hasAny",["oakland","state"]],["has","oakland"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Oakland":"The state of Oakland is CA."}}},
{"id":"n-abf5bd52","guard":[["has","montrose"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Montrose":"The state of Montrose is CO."}}},
{"id":"n-af8b67bc","guard":[["hasAny",["state","tulsa"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Tulsa":"The state of Tulsa is OK."}}},
{"id":"n-b680d707","guard":[["hasAny",["kalispell","state"]],["has","kalispell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Kalispell":"The state of Kalispell is MT."}}},
{"id":"n-b993d9e1","guard":[["hasAny",["detroit","state"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Detroit":"The state of Detroit is MI."}}},
{"id":"n-bb55d3aa","guard":[["hasAny",["manhattan","state"]],["has","tell"],["has","manhattan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Manhattan":"The state of Manhattan is KS."}}},
{"id":"n-c22c1460","guard":[["has","inyokern"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Inyokern":"The state of Inyokern is CA."}}},
{"id":"n-c69149f4","guard":[["hasAny",["state","tunica"]],["has","tunica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Tunica":"The state of Tunica is MS."}}},
{"id":"n-cdb8330d","guard":[["hasAny",["asheville","state"]],["has","tell"],["has","asheville"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Asheville":"The state of Asheville is NC."}}},
{"id":"n-d0d60c37","guard":[["has","gunnison"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Gunnison":"The state of Gunnison is CO."}}},
{"id":"n-e0a64cde","guard":[["hasAny",["newark","state"]],["has","newark"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Newark":"The state of Newark is NJ."}}},
{"id":"n-e0c9480a","guard":[["hasAny",["bend","south","state"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of South Bend":"The state of South Bend is IN."}}},
{"id":"n-e19b0959","guard":[["has","columbia"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the state of Columbia":"The state of Columbia is SC."}}},
{"id":"n-e50f4d2d","guard":[["hasAny",["pasco","state"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Pasco":"The state of Pasco is WA."}}},
{"id":"n-efbd21ec","guard":[["hasAny",["dubuque","state"]],["has","dubuque"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the state of Dubuque":"The state of Dubuque is IA."}}},
{"id":"n-f6a55127","guard":[["hasAny",["denver","state"]],["has","what"],["not",["has","metropolitan"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Denver":"The state of Denver is CO."}}},
{"id":"n-fbb13c27","guard":[["hasAny",["midland","state"]],["has","what"],["not",["has","international"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the state of Midland":"The state of Midland is TX."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the state of Pasco","expect":{"contains":["WA"],"notRefusal":true}},{"q":"tell me the state of Oakland","expect":{"contains":["CA"],"notRefusal":true}},{"q":"name the state of Montrose","expect":{"contains":["CO"],"notRefusal":true}},{"q":"what is the state of Mosinee","expect":{"contains":["WI"],"notRefusal":true}},{"q":"tell me the state of Manhattan","expect":{"contains":["KS"],"notRefusal":true}},{"q":"name the state of Eagle","expect":{"contains":["CO"],"notRefusal":true}},{"q":"what is the state of Sarasota","expect":{"contains":["FL"],"notRefusal":true}},{"q":"tell me the state of Austin","expect":{"contains":["TX"],"notRefusal":true}},{"q":"name the state of Telluride","expect":{"contains":["CO"],"notRefusal":true}},{"q":"what is the state of Tallahassee","expect":{"contains":["FL"],"notRefusal":true}},{"q":"tell me the state of Kalispell","expect":{"contains":["MT"],"notRefusal":true}},{"q":"name the state of Gunnison","expect":{"contains":["CO"],"notRefusal":true}},{"q":"what is the state of Dallas","expect":{"contains":["TX"],"notRefusal":true}},{"q":"tell me the state of Dubuque","expect":{"contains":["IA"],"notRefusal":true}},{"q":"name the state of Bellingham","expect":{"contains":["WA"],"notRefusal":true}},{"q":"what is the state of Midland","expect":{"contains":["TX"],"notRefusal":true}},{"q":"tell me the state of Asheville","expect":{"contains":["NC"],"notRefusal":true}},{"q":"name the state of Columbia","expect":{"contains":["SC"],"notRefusal":true}},{"q":"what is the state of Des Moines","expect":{"contains":["IA"],"notRefusal":true}},{"q":"tell me the state of Dothan","expect":{"contains":["AL"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
