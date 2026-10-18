// fr-nyse-other-listings-nyse-listed-8f3429-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"fr-nyse-other-listings-nyse-listed-8f3429-neo-g10","class":"fr-nyse-other-listings-nyse-listed-8f3429","generation":10,"lane":"neo","grownFrom":["what is the company name of TRAD.R","tell me the company name of HCXY","name the company name of CUBI","what is the company name of BLND","tell me the company name of FMX","name the company name of MPLX","what is the company name of WS","tell me the company name of JOE","name the company name of MOG.A","what is the company name of MNTN","tell me the company name of BGT","name the company name of BHE","what is the company name of OGE","tell me the company name of MTG","name the company name of RLI","what is the company name of TECK","tell me the company name of AERO","name the company name of FCN","what is the company name of WRB$E","tell me the company name of L"],"version":1});

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
knowLoad([{"id":"fr-nyse-other-listings-nyse-listed-69e6d6","columns":["act symbol","company name"],"n":2904,"cols":[{"f":"0AGM|1KO.A|1SB|2G|0BIO|1ML$G|2Y|0COF$I|1RD.A|0DCOM|0ETB|2V|0FHN$E|0GGT|1JH|0HEI|1VT|0JMM|0KEY$J|0MITN|1KC|0NEA|0PMTV|1NFP$A|0SGOV|0TFIN|1RNI|1Y|0UHAL|1ZE|0WFC$A|1IA|1LY|0AAC.W|1DC$A|1HL$E|1LB$A|2L$H|4I|4J|2TG$A|2UB.W|1MX|1RR$C|1UB$A|1XS$E|0BA$A|1BAI.W|1CSS.W|1EBE.W|1FH$B|2S$D|4E|1III.W|1KKT.W|1NY$K|1WIV.W|0C$R|1CM|1LBR.W|1MS$C|1ODI$A|2F$K|4N|2PL.W|0DUK$A|0EQH$C|1TSS.W|1VAC.W|2G|0FCRS.W|1RT$C|1TRA.W|2W.W|0GCTS.W|1HI|1LED.U|1NT$A|1RBK$A|0IAE|1NFQ.W|1RAB.W|0JPM$J|0KCAC.W|1IM$N|1OF|1PET.W|1RSP.W|0LOB$A|0MTAL.W|2NE.W|1ZYX.W|0NPWR.W|1RUC|1WAX.W|1XDT$A|0OCAC.U|1RCL$D|0PAC|2II.W|1EW.W|1LUN.U|1SA$F|4G|4H|4I|4J|4K|4L|4M|4N|4O|4P|4Q|4R|4S|2QH.W|0QLEP.W|1RED.U|1XO$B|0RAC.W|1NR$F|4G|0SAC.W|2GU.U|5W|2MO.W|1BXE.W|1F$C|1KYH.W|0T$A|2C|1DS$U|4V|1RAD.U|0VLRS|1NO$M|4N|0WHR$A|0YCY.W|0DDD|0MMM|0AOS|1TEN|0YCY|3.U|0AIR|1BM|1CR$D|4C|3|2VA|1DCT|2IG|2T|1CM|1VEX|1FL|1GCO|2BK|1HRT$A|4|1IIA|4.R|5U|1MC|2E|2N|1XR|0HKD|0AMTD|0TRAD|4.R|0APG|1RR|1SA|2X|0T|1BB|0ATI|0RERE|0ATS|1ZZ|1BXL|3|2BV|2T|1NF|0MGF|0IFN|0MIN|1MT|1FM|0AKR|1AMI|1CEL|1RX|1CH|2N|2CO|1YI|0GOLF|0ADX|0PEO|0AGRO|1DNT|1SIX|1AP|0WMS|0AVK|1EFC|2G|2R|0MGRD|3B|3|3E|0AMG|1|1EM|1DC|1PD|1LG|1GI|1LK|1IN|1LB|1CI|1A|1LC|2X|1RE|1QNB|3|0BABA|0ALIT|2LE|2H|1B|1FB|1WF|1AUC|1LSN|0EOD|0ALL$B|3|3Y|1MR|0PINE$A|4|0ALTG|1NRO|0MO|0ALUB|4.U|1BEV|1MBQ|2CR|2TM|1S|1MTB|1EE|1MRC|1AT|1EO|2XA|1XP|1FGE|3C|3D|3B|3|1HR|1MH|3$G|4H|1II|2G|1NG$D|1RL|1SBH|1WR|0NYC|0AMT|1VD|1WK|1MWL|0COLD|0AMP|1BCB|1P|2H|1MPY|3X|4.W|2RZ|1NDG|0FINS|0AOMN|3D|3R|1NGX|1U|0BUD|0NLY$G|4F|4J|3|0ANVS|1M|1R|1ON|1IV|1RI|1PO|3S|2LE|1ADX|1IT|1TR|1PTV|1RMK|1BR$E|4F|4D|3|0MT|0ADM|1CHR|1ROC|2CO|1CA|0RCUS|0AMBP|1RDT|1SC|1AC|3.U|1CRE|1RDC|2ES$B|4|1GX|1RIS|1NET|1RLO|1WI|0UZF|2D|0AD|0GYLD|0ARW|1JG|1PAM|1ORT|1SAN|1BG|1HT$F|4G|4H|4I|4D|3|1SH|2PN|1HL$D|4F|1SB$E|4F|3A|1IZN|3|1GO|1ZN|1SIC|1THS|3$D|4B|4A|4E|2KR|1UB|1ESI|1TO|2MU|1UNA|1N|1ZO|1THM|1LV|1VTR|2Y|2BC|2NT|2A|1XTA|2S|2|1ZUL|0BGS|1ARK|0TBBB|0BCE|1GSF|1HP|1ILL|2PI|1J|1KV|0DHF|1MB|1SM|0LEO|0BP|1RCC|2T|1WLP|2XT|1XP|1W$A|2|1MI|1CSS|4.U|3F|1KKT|1ALL|3Y|2NC|4$F|1BAR|2VA|2D|3O|1CH|1MA|1SAC|2BR|0SAN|0BNS|1MO|1AC|3$E|1ML$L|4H|4J|1AC$P|4M|4K|4B|4Q|4O|4S|4N|0MER$K|0BAC$L|1OH|3$A|4B|0NTB|0BKU|1CS|1BDC|0MCI|0BGH|0MPV|0BNED|1CEM|0RONB|0BCGD|1ROL|1CSM|1|1BWI|1LCO|1HC|1AX|1TE|1BT|1ZH|1DX|2C|1RBR|1HE|1RK.A|4B|1BY|1ETA|1WMX|1BAI|1H.A|2|1IO.B|1HVN|1IRK|1TGO|1MNP|3R|1KH|1III|4.U|1SM|1B|1MN|1CAT|4.R|1TZ|0ECAT|0BGR|0CII|0BGT|1MEZ|1KT|1IT|1TT|1CX|1STZ|3|1BN|1TX|1UI|1HV|1LK|1KSY|1HK|0HYT|0DSU|0BDJ|1OE|1GY|0FRA|0BME|1LW|0MUA|2C|1HD|1UJ|1IY|1YN|1PA|1YI|1QY|0BXDC|2|1GX|1XMT|2SL|1SL|1GB|1LX|2ND|0XYZ|0BE|0OBDC|1WL|1TF|0BWIV|4.U|1XC|1PRE|1OBS|1A|1CC|1OOT|1AH|1WA|1ORR|0SAM|0BOC|1SX|1OW|2X|1YD|1GSI|1RC|1HR$B|4D|3|1DN|1WG|0LND|0BAK|1FH|3$A|2AM|1RSP|1V|1RSL|0EAT|0BCO|0CELG.R|0VTOL|0BTI|1RX|2|1NL|1KD|1AM|1EPH|3I|3J|1BUC|1N|2J|2H|1IPH|3J|3C|3$B|4A|3|0OAK$B|4A|0RA|0BEPC|3$A|3|1NT|1RO|1F.A|3B|1C$C|2|1KE|1VN|1BW|1LDR|2SH|1G|1UR|3L|1FLY|1Y|0CFND|0AI|0CACI|2VA|1BZ|2L|0IGR|0CBRE|1F|0GIB|0MTNE|4.U|0CINT|2CB|3C|2ON|1MBT|2SA|3C|3D|3|3$B|1NA|2F|2H|2O$A|3|2X|2MD|1DP|1RH|0LAW|0CSW|1TO$A|3|2S|1VI|0UAN|0CVS|1ABO|1BT|0WHD|0CDLR|2RE|1AL|1RC|1WT|1ALX|3Y|1PT|1CJ|1WH|0GOOS|0CM|1NI|2Q|1P|1ANG|1NNE|1FTR$A|1OF|3$J|4L|1PRI|0KMX|0CAH|1TRE|1SL|1CID|3F|2L|1RS|1SV|1ARR|3S|1RI|1VNA|1AT|3O|1DR$C|4B|1E|1LS|1PAC|1X|1OR|1VE|1NC|2P|1GAU|1PF|1EPU|0LEU|0CTRI|1CS|1BNA|0SKY|0CHPT|1RL|0SCHW|0CLDT$A|4|1MCM|1HGG|2E|1C|1QP|0LNG|0CHMI$A|5B|4|1PK|1VX|1HWY|1IM$C|4A|4B|4D|3P|3N|3O|3|1YD|1MG|0XRN$B|3|3$A|0CHH|1B|1HT|2D|1IEN|1NK|1RCL|1$N|1|1FG|3$E|4H|4I|1IA|1VEO|1TEV|1LVT|1MTG|1LH|1CO|0YOU|0EMO|0CLW|1WEN|1LF|2PR|2X|0NET|0COSO|0KO|0CDE|0FOF|0CNS|0UTF|0LDP|0RQI|1NP|1LTY|0PSF|1TA|0RFI|0COHR|1L|2BR|4.U|1BAN|0STK|0CCZ|0FIX|0CMC|1BU|1YH|1HCT|1IG.C|3|0ELPC|0SID|1BS|0CCU|1ODI$B|5C|1MP|1OMP|1RK|1AG|1ON|1GV|1OP|0ED|0STZ|0CSTM|1PS|2A|1OPL|4.U|1NM|1LB|1NR|1XW|1RBD|3G|0GLW|0CPAY|1AAP|0VTMX|0CTVA|1MDB|2RE$D|4|4$C|5B|1OTY|0HYTR|0CPAI|2NG|1OUR|1UZ|1VLG|2SA|1R|1XT|1RD.B|0BAP|0CRGY|2T|1APL|1CI|2K|1SQR|1UBE|1FR|3$B|1MI|1URB|1W|2K|1TOS|1UBB|3I|0DHI|0CSR|1ODI|0SBSW|0DQ|0SREA|3|0HF|0DHX|2T|1NOW|2P|1PC|1RD|1TM|2W|2B|2G|2K|2E|2F|0KTF|0DXC|1VA|1AN|1HR|1AC|1RI|1AR|1CH|1ECK|2|1MC|1KL|2|1ELL|1AL|1LX|1BI|1XYZ|1MA|1B|1VN|1EO|1SX$B|3.W|3|1KS|1BD|1LR$L|4J|4K|3|1OCN|1CBG|2OM$|1IN|1DL|1GAC|4.R|5U|1STX|2MC|1EC|1LB|1OLE|1G|1|1CI|1FIN|0LPG|0DSL|1BL|1LY|1V|0PLOW|0DOUG|1EI|1OV|2W|2CS|0RDY|0DFH|1D|1CO|1PG|1UK|3B|3U|0BROS|0DY|1LNG$A|4|1T|1X$C|3D|2|0CTA$A|4B|0EME|1|1OG|1PAM|2R$C|4G|3|3$E|1QT|1VAC|4.U|1ROC|1SAB|2E|1XP|1CCV|3C|3$D|3U|3|1ICA|3|2IA|1ROK|1GP|0DEA|0EMN|0KODK|0ETN|2W|1OI|2S|1FT|1TX|1VN|1OT|1TJ|1FR|1VF|1TG|2O|2Y|1XG|1VT|3R|1CL|2|2VT|1PC|1IX|1W|1P$C|1LAN|1STC|1GO|1SI|1LV|0LLY|0ELLA|1ARN|1FC$B|4D|4C|3|1LME|0AKO.B|0EMBJ|2A|1BS|1MR|1SRT|1IG|1DN|1NB|1HC|0DAVA|0EXK|1NIC|2S|1FXT|1NR|1TSS|4.U|0NRGV|0EPAC|1NHA|1BF|1NVA|2OV|0NPO|0EAI|1TR|1LC|1MP|1NJ|2O|1TI$|1PD|1VC|0NVRI|2ST|0EFX|1QNR|2H|3$A|2BK|1LS|1QS|0ZGN|0ERO|1SNT|1PRT|0WTRG|0ESS|1L|1TD|2SY|1VEX|4.W|2R|1G|1FOR|0P|0ES|1VTC|1CG|1VH|2MN|1E|1XPD|0XPRO|0EXR|0XOM|1ZO|0FGSN|2N|2|1NB|1BK|1IGS|1LNG|1MC|1SCO|2K|2SL|1CN|1N|1DS|1ICO|1PI|1DX|3F|0AGM$G|4F|4D|4E|4H|4I|3.A|0FRT|1SS|1MN|1HI|1ERG|0RACE|0FNF|1IS|2TB|4$I|5M|5A|5K|2G|2NV|1OA|1AF|1BP|1CBM|2F|1EGE|2OE|1HN|3$H|4F|1R|0AG|0FFA|1THY|1PF|1MY|1E|1IRY|1PH|1VRR|1LG$U|3|3$A|0DFP|0PFD|2O|0FFC|1LC|1ND|1TK|1LOC|3|2S|2R|2UT|1MX|1$C|2B|2D|1|1OR|1PS|1TS|2V|1SM|1BIN|1ET|1CPT|1EDU|1NV|1BRT$E|4|1C|0PMM|1IM|1MO|1PT|0BEN|0FT|1CX|1MS|1VR|1RO|1UBO|0YMM|0VCX|0FTRA|4.U|1CRS|4.U|1F|0GNT|1ATX|1CTS|1DL|1E|2V|1FL|1MRS|1PGI|1SK|1XO|1CV|1DV|1AB$K|3|3$H|4G|1GZ|2T$E|4G|1UT$C|3|1LED|4.R|1ME|3.W|1OTU|1AP|1RMN|0IT|0GLOP$B|5C|5A|1TES|1NK|2RC|1AM$B|3|1D|1IS|1M|1CO|1EL|1NE|1ENI|1|1PC|1NW|1EO|1PRK|2JA|1GB|1TY|1IL|0DNA|0GBCI|1LAS|1KOS|1IC|1NL$B|4A|4E|4D|3|1LP|1PN|1SL|3$B|1LOB|2$D|2|1MED|1DDY|1FI|1OLD|1SBD|1CPB|1JS|1S|2$D|3C|3A|1RC|0PEW|0GGG|0EAF|0GHM|2C|1VA|1PMT$A|4|1RNT|1PK|1TN.A|3|1RBK|1DOT|1HG|1BX|1FR|1EF|3.B|1FF|1RND|1PI|1ROV|0AERO|1SR|1VAL|0CIB|0SUPV|0TV|0GRDN|1UG|1OF|1BAB|1WRE|1POR|0HRB|0FUL|0HASI|1CA|2I|1DB|0DINO|0HNI|1PQ|1SBC|1UYA|1AE|2FN|1GTY|1LN|1AL|1BB|1G|0THG|0HGER|0GDIV|0WINN|0INFO|0HOG|1MY|1VT.A|1E|1AWK|1YAC.U|1AYW|1R|0DOC|0HL|2$B|1EI.A|1LIO|1P|1LF|1RI|1CXY|1TGC|1RTG|1ESM|1PE$C|3|1XL|0PCF|0HTT|1GLB|1FRO$A|5B|4|1IW|1TH|1GV|1LT|1SHP|1IMS|1NGE|1IPO|1LLY|1OMB|1D|1TB|1MC|2N|1TFC|1RL|1OS|1LI|1OV|1HH|1WM|1UBS|3B|1BM|1PP$C|3|1UM|1II|1UN|1|1Y|0IBN|1CL|1DA|1EX|1DT|1HS|1NG|0VATE|0IVR$C|3|1QV|1RS|1TT|1AG|1BTA|1TW|1MAX|1CR$A|1RT|1NR|2FQ|3Y|1R|0NGVT|0INGM|3R|1IPR$A|4|1NVX|0NSP|0INSP|1BP|1IIN|1TGR|1CE|1HG|1FS|1BM|1FF|1P|1NSW|1PI|1VT|0VBF|1CV|1LT|0IVZ|0OIA|0VMO|1KQ|1PV|0IQI|0VVR|1GM|1TN|0IIM|1NVH|1ONQ|1RAB|4.U|2M|1TUB|1VAI|0JPM$M|4K|4L|4D|4C|1ILL|1BGS|2S|2TM|1ELD|1PM|1BND|2L|1ACS|4.R|5U|1XN|3$A|1|1HX|1BI|1AN|1OF|1EF|2NA|4.R|5U|1MKE|1KS|1OBY|0HEQ|0BTO|0JHS|2I|0HPF|2I|2S|0PDT|0HTD|0WLYB|0JNJ|1CI|1LL|1MIA|0KB|2H|2R|0BEKE|0KKR$D|3T|3|3S|1IO|1REF$A|4|1NOP|1PET|4.U|1T|1AI|1RMN|1BDC|1YN|1MPR|3B|2T|1EN|1CA.U|3C.U|1VUE|1EY|3$I|4L|4K|3S|1FRC|1RC|2P|1IM|3$L|4M|1MI|1LC|1NTK|1WY|1GC|1NSL|1EX|1RG|1LAR|1VYO|1NF|2X|2|1GS|1SS|0PHG|0KTB|1OP|1EP|1F|2Y|1OS|1R|2O|1D|0LHX|1TM|1CII|1PL|0SCD|0LXU|1TC|1XP$C|3|1ZB|1H|1ADR|1W|1B|1ANV|1VS|1GI|1AZ|1EA|0JBK|0LDOS|1MND|1EN|3.B|1II|1EVI|0USA|0LBRT|1TH|1ZM|3.W|1ITB|1SPD|1CLN|1NC|3$D|2N|1ION|1AD|2C|2R|1YV|1OB|0RAMP|0LVWR|4.W|1YG|1OAR|2CL|1MT|1|1CIV|1OMA|0FOIL|0LPX|1OW|1UCK|2|2MN|1FT$A|3|1UXE|1XFR|1YNX|2B|0MTB|3$K|4L|4J|4H|1HO|1BI|1DA|2U|1ED|1FA|3$C|3N|3O|3$B|2SB|3G|3M|3I|1MID|1FSV|0BRCE|2EE|2IE|0MTG|1GM|1NSO|2TN|1OGU|1ZYX|4.U|1P|2LX|1SA|2IF|2M|2CI|1WA|1AC|1NR|1|1AIR|1SGE|3S|1GA|1X|1AGN|1GY|1HNC|2LA|1AIN|2NU|1TW|1AN|1FC|1PC|1MI|1CS|0HZO|0MKL|0VAC|0MRSH|1LM|1TZ|1AS|1BC|1A|1TDR|2RN|1ATV|3X|1LP|1MS|1EC|1KC.V|1CD|1UX|1H|1CK|1AX|1PT|1DT|1RK|1CY|1TH|0IPB|0MTR|1SB|1ET|3$E|4F|4A|1TUS|2AL|4.U|1EI|1CB|1TD|1XE|2F|1IAX|1AA|1LR|1VPA|1RP|1TX|1IR|1G|1UFG|1FG|1BGL|1OD|1C|1HK|1OH|0TAP.A|3|0MCO|1OG.A|4B|0CAF|0MS|2$E|3F|3A|3O|3L|3P|3Q|3K|3I|2DL|3|0EDD|0IIF|0MOS|1SI|1OV|1LI|1UR|2SA|1YE|0NABL|1C|1ATL|0VYX|0NPWR|1GL$B|4C|3|1IO|2Q|1L|1NN|1OV|1PKI|1RG|1VR|0SRV|0NXG|0MEGI|1MD|0NBR|1WG|1BHC|1FG|1GG|1HI|1PK|1GS|2VC|1RP|1VGS|1MM|1NI|1P|1RDY|1LOP|1TST|1BXG|1WAX|4.U|0GF|0EDU|0NYT|1JR|1EU|2M|1MAX|1XDT|1REF$A|4|1XRT|1EXA|1XE|1EE$N|4W|4T|4S|4V|3|3$U|1XDR|1I|2C|1KE|1OAH|1E|2.W|3A|1OK|2MD|1MR|1AT|1SC|1OA|1RT|1OG|1PB|1OC|1WN|1CLH|1MG|1VS|2O|1U|2S|0SMR|0NUE|1TR|1UVB|2W|1VG|1AZ|1KX|1CA|1AC|1CDL|0JCE|0NPCT|0JQC|0NDMO|0JFR|1GH|0NMT|2S|0JLS|0NMAI|1ZF|1MCO|4.R|2Z|2I|1UV|1RK|1NY|1AN|0JPC|0NAD|0JRI|2S|0SPXX|0NIM|1XP|1BB|1PFD|2V|0OI|1FG|1GE|2S|1KE|1PLN|1R|0IX|0OUT|1XY|3.W|1CAC|4.R|5W|1GC|1II|1SG|1DC|1IS|0ECO|0OKLO|1RI|1LN|1HI|1MC|1NON|1FRM|1LP|1MF|1NIT|2T|3O|1OMA|1PFI|2Y|1TAX|1PTU|1RCL|3|1GN|1BK|1RN|1NL|1EC|1RA|1SCR|2K|1GG|1TIS|1VV|1C|1WLT|1XM|0PACS|2R|1BF|1CM|2G$X|0GHY|0ISD|0SDHY|0PHIN|1AXS|0BOND|0PCQ|1DI|2O|2X|1FN|2L|0RCS|0PJT|1HI|1NC|1KX|1PG|2L|3C|1YT|1RG|1SQH|0TLK|0PVH|1CG|1KG|1AGS|1D|1SBD|1AM|2AS|2RR|1KE|2|1H|1RCS|2VS|1SN|1AYC|3|1SFE|0BTU|0PDPA|2CC|1SO|1EB$H|4F|4E|4G|3|0MD|0PLGO|1BA|1FLA|3T|1NNT|1FSI|1MT$C|4B|4A|3U|3W|3|1AG|1NR|1EN|2RF|1FGC|1RM|2T|1BT|1R|1VL|1RGO|1S|2US|1BR|3.A|1FE|1M|1SX|1XED|0FENG|0PHR|1DM|1TY|1CN|1GP|1HK|1ML|1NI|2AQ|4.R|5U|2FP|4$B|5C|2W|1INS|2PR|1BI$B|3|1LNT|2|2UN|4.R|1II|1OR|2ST|1STL|1DS|0FTW|0PBH|1RI|2MB|2IM|1GZ|1RIF$L|5D|5K|1UMP|1COR|1G|2R|1LD|1SEC$A|1B|1RLB|1FS|2H|1RS|2H|2U|1UK|1EG|1SA$U|4T|3|1HM|1RSU|1AII|4.U|0QTWO|1XO|1GEN|1|1UAD|0KWR|0NX|0PWR|0QLEP|1RED|4.R|0DGX|0CTGG|2HH|0RBA|2C|1ELX|2X|1H|1LI|2J$A|3|2X|1ES|1PM|1TX|1XO|1DN|1FL|1AL|1L|1RC|1NGR|0PACK|0RJF|1YAM|2N|1C$C|3E|2D|2|0O|0RDDT|2W|1WT$A|3O|3N|3P|3Q|3S|3|1EF|1RX|1M|1F|2$F|3E|3C|1ZC|1GA|1S|1NR|2ST|1TO|0TRAK|0RSG|1MD|1EZI|1HLD|0QSR|0RVLV|2TY|1EXR$C|5B|4|0KRSP|4.U|0RPC|1NG|1IO|1SKD|1AC|3.U|1ITM$C|5D|5B|5A|5E|5F|4|1PT$C|3|1SF|1FMZ|3|1MMZ|3|2I|1IV$A|3|0OPP$A|4B|3|0RHI|1VI|3I|1BLX|1KT|1OK|1CI|1OG|2L|1Y|1CL|1GT|1MT|1VT|1BRK|1SI|1YAN|1|1YZ|1HP|0SPGI|1AP|1CE$L|4G|4M|4N|1MHI|1ES|1FL|1ITC|1KM|1LG|3$I|2B|1M|1OS|1PXC|1TEW|2WD|2E|2M|1ABA|0BRW|0SBR|1OC|1B|2$C|3D|1AC|3.U|2FE|0CRM|0SBH|1AMO|4.U|0IOT|0SJT|1D|1NUS$H|5I|1AV|2J|2X|2Y|2Z|2R|1SL|0BFS|0SVV|1NDR|1TNG|1MG|1RL|1E|1A|1DRL|1EAL$B|5A|2G|2CZ|0WTTR|0SLQT|1T|1XT|1|1QNS|1RG$A|3|1CI|0NOW|0SFBS|1HAK|1N|1HEL|2W|0FOUR$A|4|0SHG|1I|1AGU|4.R|1STK|1IG|1LGN|1BXE|4.U|1MWB|1PG|3$J|1SD|1IND|1PNT|1ITE|0FUN|0TSLX|0SKE|2IL|2YH|1MBK|2RT|2A|1NN|1DHC|1W|1NA|3P|2OW|1QM|1EI|1OLV|1GI|1AH|1NDA|1ON|3Y|2UL|4.R|5U|0FXED|0DIVY|0SPME|3A|3C|1OR|2BO|1SB|1OMN|2|2JC|3D|3E|3F|1CCO|0PORT.U|0SBSI|0LUV|0SWX|1PE$C|3|2B|2HR|2IR|1RJN|2|1POT|0CXM|0SII|1PRU|0JOE|0STAG|1MP|1TDN|1ARO|1XI|1WK|1TN|1GU|0OTAI|4.R|5U|0STT|3$G|0MMK|0STLA|1CM|1TEM|1CL|1TVN|2C|1FB|2|2$D|3B|1RI|0LRN|0STXD|3G|3V|3F|3E|0BUXX|0FTWO|0STXK|3T|0DRLL|0SHOC|0KTN|2H|0SYK|1TUB|0MSC|0RGR|0SPH|1MFG|0INN$F|4E|3|0SMC|1UI|1LF|1XC|1UNB|2|1TG|1SMR|1HO$I|4H|3|1GHC|1RFM|1UZ|1G|1LVM|1YF|3$B|4A|0GJO|2P|2R|2T|0SYY|1ST|0TE|1AL|1RP|0ACLO|0FIXT|0IGCB|0FLXR|0HYBX|0MUSE|0SLNZ|0TSI|0SNX|0TEL|1FII|0BEBE|4.U|0THMR|2LV|2IR|1IC|2MB|1JX|1KO|0MITT$B|5C|5A|3P|3T|0TRTX$C|4|1XNM|2O|1WN|1SM|1AK|2LO|1BN|0SKT|0TPR|1RGP|1GT|1ISI|0FTI|0TECK|1GLS|1K|1NK|1RC|1DOC|1EO|1DY|1FX|0VIV|0TDS|1U|1DF|0EMF|0TEI|1S|1ME|1HC|1NC|1VE|2C|1DC|1EX|1X|1PTS|1RNO|1TI|1EVA|0MMKT|0TPL|1XT|0AES|0BNY|0CEE|0SCHW$D|5J|0CI|0EEA|0AKAF|0GDV$K|4H|1RX|0TGE|0HIG|3$G|1SY|0SJM|0KHC|0MICC|0TRV|1MO|1CBX|1HO|1DW|1LYS|1KR|1TAM|1WI|1OST|2L|1R|1TC|1D|0CURV|0TCAI|1PZ|1NGY|1YG|1BLU|1PYP|0SWZ|0TTE|1SQ|1M|0COOK|0TT|1AC|1CPA|1RU|1CI|1DG|0RIG|0TGS|1NL|1G|1REX|1Y$|1NET|1RNZ|2IN|2N|1FPM|1PVG|1RTN$E|5D|5C|5G|5F|5B|5A|1FIN$|1ROX|1BI|1FC|3$I|4O|4R|1RLV|1EN|3$E|4F|1KC|1PB|2C|1UYA|0XXI|0TWLO|1YL|1SN|0UHAL.B|1SB|3$P|4H|4Q|4R|4A|4S|2PH|1BS|1DR|1GI|1LS|1MH$D|3|1TL|1VE|1SFD|0TDAY|0USNA|1WMC|4.V|1BER|1I|0PATH|0UGP|1AA|2|1FI|1NF|1L|1NP|1IS|1CB|1MC|1NFI|1PS|0PRKS|0URI|1AMY|1NH|1|1VV|1HT|2S|1TI|0HFEQ|2GM|2MF|2ND|0UNMA|3|1E|1TZ|0VFC|1VX|0EGY|0VALE|1ICI|1OC|1TEX|0MTN|0VAL|3.W|1LN|2O|1HI|1MI|1VV|1EEV|2L|1TR|1G|0MANE|0VLTO|1Z|1ET|2CA|4.R|5U|1GNT|0EVTL|0VRT|1STS|1IA|1SXY|1II|3.U|4W|2K|2PS|0SPCE|0VIRT|0AIO|0NCV$A|3|2Z$A|3|0ACV|0NFJ|1IE|0VGI|1RTS|0EDF|0ZTR|0V|1SH|1PG|1IST|1ST|1TS|1MRK|1NT|2O$O|3|3$L|0IHD|0VOYA|4$B|0IGA|2D|1DE|0VOYG|1MC|1YLR|0WTI|1PC|1RB$H|4G|4F|4E|3|0GWW|0WBIY|1EC|1CC|1EX|1PP|1NC|1D|1BX|0DIS|0WRBY|0HCC|0WCN|1M|1BI|1DH|1AT|1SO.B|3|1TS|1|1LTG|1EAV|1MK|1FC$L|3|3$C|4D|4Y|4Z|1ELL|2NC|4.R|5U|1FG|1ST|1AL|3$A|1EA|1DI|0EMD|0GDO|0EHI|0HIX|2O|1YI|0WIW|0SBI|0PAI|0IGI|0MMU|0DMO|0MHF|0WES|1U|1AB|1LKP|3|1HG|0MDST|0WY|1PM|0UP|0WHR|1TM|1PAC|4.R|5U|1HK|1SM|1MB|1GO|1IT|1T|1OLF|1WW|1DS|1F|1K|2C|1OR|1S|1H|0XYF|1FLT|0MCN|0XFLH|4.R|5U|1IFR|1PO|2EV|1HR|1PER|2OF|1TND|1YL|0YETI|1PF|1ALA|1SG|1ELP|2XT|1RD|1SS|0DAO|0YUMC|3|0ZIM|1KH|1TO|1EPP|2TA|1VIA|1H|1BH|1IP|1TS|1WS|0AKA|1GD|1SGI|4.R|1WP|0HQH|0THQ|0ACP$A|3|0HQL|0AOD|0THW|0AGL|0ELF|0IH|0SHV|0GMMF|0PMMF|0LDI|0NVT","sep":"|"},{"f":"0Federal Agricultural Mortgage Corporation Common Stock|0Embotelladora Andina S.A. Common Stock|0Associated Banc|0Liberty All|0Bio|1ank of America Corporation Depositary Shares (Each representing a 1/1200th interest in a share of Floating Rate Non|1ristol|0Capital One Financial Corporation Depositary shares each representing a 1/40th interest in a share of Fixed Rate Non|1rawford & Company Common Stock|0Dime Commercial Bancshares, Inc. Common Stock|0Eaton Vance Tax|cCorporation Eaton Vance Tax|0First Horizon Corporation Depositary Shares, each representing a 1/4,000th interest in a share of Non|0Gabelli Multi|0Synthetic Fixed|0Heico Corporation Common Stock|1averty Furniture Companies, Inc. Common Stock|0Nuveen Multi|0KeyCorp Depositary Shares each representing a 1/40th ownership interest in a share of Fixed Rate Perpetual Non|0TPG Mortgage Investment Trust, Inc. 9.500% Senior Notes due 2029|0McCormick & Company, Incorporated Common Stock|0Nuveen AMT|0PennyMac Mortgage Investment Trust 9.00% Senior Notes due 2030|1innacle Financial Partners, Inc. Fixed|0iShares 0|0Triumph Financial, Inc. Common Stock|3nity Capital Inc. 7.875% Notes Due 2029|3 Continental Corporation Common Stock|0U|0Array Digital Infrastructure, Inc. 5.500% Senior Notes due 2070|0Wells Fargo & Company Depositary Shares, each representing a 1/1,000th interest in a share of Non|2stern Asset Inflation|0John Wiley & Sons, Inc. Common Stock|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|03D Systems Corporation Common Stock|1M Company Common Stock|0A.O. Smith Corporation Common Stock|110 Networks, Inc. Common Stock|1A Mission Acquisition Corp. II Class A Ordinary Shares|wUnits, each consisting of one Class A ordinary share and one|2R Corp. Common Stock|1BM Industries Incorporated Common Stock|1CRES Commercial Realty Corp. 7.875% Series D Cumulative Redeemable Preferred Stock|u8.625% Fixed|uCommon Stock|2V Auctions Inc. Class A Common Stock|1DC Therapeutics SA Common Shares|2I Global Distribution Inc. Common Stock|2T Inc. Common Stock|1ECOM Common Stock|2VEX Corp. Class A Common Stock|1FLAC Incorporated Common Stock|1GCO Corporation Common Stock|2I Inc Class A Common Shares|1H Realty Trust, Inc. 6.75% Series A Cumulative Redeemable Perpetual Preferred Stock|mCommon Stock|1I Infrastructure Acquisition Corp. Class A Ordinary Shares|z Rights, each entitling the holder to receive one|z Units, each consisting of one Class A Ordinary Share and one Right|1MC Entertainment Holdings, Inc. Class A Common Stock|2ETEK, Inc.|2N Healthcare Services Inc|2REP Corporation Common Stock|2TD Digital Inc. American Depositary Shares (every five of which represent two Class A Ordinary Shares)|5IDEA Group American Depositary Shares, each representing six (6) Class A Ordinary Shares|1PEX Tech Acquisition Inc. Ordinary Shares|rRights, each entitling the holder to receive one|2i Group Corporation Common Stock|1RMOUR Residential REIT, Inc.|1SA Gold and Precious Metals Limited|2E Technology Holding Co., Ltd. American Depositary Shares (each representing Two Common Shares)|1T&T Inc.|9 5.350% Global Notes due 2066|2I Inc. Common Stock|2Renew Inc. American Depositary Shares (every three of which representing two Class A ordinary shares)|2S Corporation Common Shares|1ZZ Inc.|1bacus Global Management, Inc. 9.875% Fixed Rate Senior Notes due 2028|vClass A Common Stock|2bVie Inc. Common Stock|3ott Laboratories Common Stock|2ercrombie & Fitch Company Common Stock|4deen Government Markets Income Fund Common Shares of Beneficial Interest|9India Fund, Inc. Common Stock|btermediate Income Fund Common Shares of Beneficial Interest|9Multi|bnicipal Income Fund Common Shares of Beneficial Interest|1cadia Realty Trust Common Stock|6n Asset Management Inc. Common Stock|2cel Entertainment, Inc.|5erant Holdings Class A Common Shares|4ndra Health, Inc. Common Stock|5ture plc Class A Ordinary Shares (Ireland)|3o Brands Corporation Common Stock|2uity Inc. Common Stock|3shnet Holdings Corp. Common Stock|1dams Diversified Equity Fund Inc.|6Natural Resources Fund, Inc. Common Stock|2ecoagro S.A. Common Shares|2ient plc Ordinary Shares|2vanSix Inc. Common Stock|5ce Auto Parts Inc.|7d Drainage Systems, Inc. Common Stock|3ent Convertible and Income Fund|1egon Funding Company LLC 5.10% Subordinated Notes due 2049|6Ltd. New York Registry Shares|2rCap Holdings N.V. Ordinary Shares|1ffiliated Managers Group, Inc. 4.200% Junior Subordinated Notes due 2061|y750% Junior Subordinated Notes due 2060|w5.875% Junior Subordinated Notes due 2059|w6.750% Junior Subordinated Notes due 2064|wCommon Stock|1gilent Technologies, Inc. Common Stock|2nico Eagle Mines Limited Common Stock|2ree Realty Corporation Common Stock|1ir Products and Chemicals, Inc. Common Stock|1lamo Group, Inc. Common Stock|5s Gold Inc. Class A Common Shares|3ska Air Group, Inc. Common Stock|2bany International Corporation Common Stock|3emarle Corporation Common Stock|4rtsons Companies, Inc. Class A Common Stock|2coa Corporation Common Stock|4n Inc. Ordinary Shares|2exander's, Inc. Common Stock|7ria Real Estate Equities, Inc. Common Stock|2gonquin Power & Utilities Corp. 6.20% Fixed|yCommon Shares|2ibaba Group Holding Limited American Depositary Shares each representing eight Ordinary share|3ght, Inc. Class A Common Stock|2legion plc Ordinary Shares|3iance Laundry Holdings Inc. Common Stock|8Bernstein Holding L.P. Units|iNational Municipal Income Fund Inc|8bernstein Global High Income Fund|4ed Gold Corporation Common Shares|4son Transmission Holdings, Inc. Common Stock|3spring Global Dividend Opportunity Fund Common Shares of Beneficial Interest|4tate Corporation (The) 5.100% Fixed|rCommon Stock|3y Financial Inc. Common Stock|2pha Metallurgical Resources, Inc. Common Stock|3ine Income Property Trust, Inc. 8.00% Series A Cumulative Redeemable Preferred Stock|zCommon Stock|2ta Equipment Group Inc. Class A Common Stock|3o Neuroscience, Inc. Common Stock|3ria Group, Inc.|2ussa Energy Acquisition Corp. II Class A Ordinary Shares|zUnits, each consisting of one Class A ordinary share and one|1mbev S.A. American Depositary Shares (Each representing 1 Common Share)|3iq Micro, Inc. Common Stock|2cor plc Ordinary Shares|2entum Holdings, Inc. Common Stock|3r Sports, Inc. Ordinary Shares|4ant Bancorp Inc. Class A Common Stock|4en Corporation Common Stock|5sco, Inc. Class A Common Stock|4ican Assets Trust, Inc. Common Stock|9Eagle Outfitters, Inc. Common Stock|axceptionalism Acquisition Corp. A Class A Ordinary Shares|bpress Company Common Stock|9Financial Group, Inc. 4.500% Subordinated Debentures due 2060|v5.125% Subordinated Debentures due 2059|x625% Subordinated Debentures due 2060|x875% Subordinated Debentures due 2059|vCommon Stock|9Healthcare REIT, Inc. Common Stock|aomes 4 Rent Common Shares of Beneficial Interest|mSeries G cumulative redeemable perpetual preferred shares of beneficial interest|tH cumulative redeemable perpetual Preferred Shares of Beneficial Interest|9Integrity Insurance Group, Inc. Common Stock|drnational Group, Inc. New Common Stock|9National Group Inc. Depositary Shares, each representing a 1/1000th interest in a share of 7.375% Fixed|9Realty Investors, Inc. Common Stock|9Savings Bank, N.A. Common Stock|atates Water Company Common Stock|brategic Investment Co. Class A Common Stock|9Tower Corporation (REIT) Common Stock|9Vanguard Corporation Common Stock ($0.10 Par Value)|9Water Works Company, Inc. Common Stock|aell Corporation Class A Common Stock|6old Realty Trust, Inc. Common Stock|5prise Financial, Inc. Common Stock|5s Bancorp Common Stock|2pco|3henol Corporation Common Stock|3lify Energy Corp. Common Stock|3rius Technologies, Inc. Common Stock|rWarrants to purchase one share of Common Stock at an exercise price of $11.50 per share|2rize Ltd Ordinary Shares|1ndersen Group Inc. Class A Common Stock|2gel Oak Financial Strategies Income Term Trust Common Shares of Beneficial Interest|aMortgage REIT, Inc. 9.500% Senior Notes due 2029|w750% Senior Notes due 2030|uCommon Stock|6Studios, Inc. Class A Common Stock|3loGold Ashanti PLC Ordinary Shares|2heuser|2naly Capital Management Inc 6.50% Series G Fixed|w95% Series F|t. 8.875% Series J Fixed|vCommon Stock|3ovis Bio, Inc. Common Stock|2tero Midstream Corporation Common Stock|7Resources Corporation Common Stock|1on plc Class A Ordinary Shares (Ireland)|1partment Investment and Management Company Common Stock|2ollo Commercial Real Estate Finance, Inc|7Global Management, Inc. (New) Common Stock|v7.625% Fixed|2ple Hospitality REIT, Inc. Common Shares|4ied Aerospace & Defense, Inc. Common Stock|8Industrial Technologies, Inc. Common Stock|2tarGroup, Inc. Common Stock|3iv PLC Ordinary Shares|1ramark Common Stock|2bor Realty Trust 6.25% Series E Cumulative Redeemable Preferred Stock|wF Fixed|l375% Series D Cumulative Redeemable Preferred Stock, Liquidation Preference $25.00 per Share|jCommon Stock|2celor Mittal NY Registry Shares NEW|3her|6 Aviation Inc. Class A Common Stock|4rock, Inc. Common Stock|3os Dorados Holdings Inc. Class A Shares|5a, Inc. Common Stock|3us Biosciences, Inc. Common Stock|2dagh Metal Packaging S.A. Ordinary Shares|3ent Health, Inc. Common Stock|3more Shipping Corporation Common Stock|2es Acquisition Corporation III Class A Ordinary Shares|xUnits, each consisting of one Class A ordinary share and one|5Commercial Real Estate Corporation Common Stock|5Dynamic Credit Allocation Fund, Inc. Common Shares|5Management Corporation 6.75% Series B Mandatory Convertible Preferred Stock|sClass A Common Stock|2gan, Inc. Common Stock|2is Mining Corporation Common Shares|4ta Networks, Inc. Common Stock|2lo Technologies, Inc. Common Stock|2mstrong World Industries Inc Common Stock|2ray Digital Infrastructure, Inc. 5.500% Senior Notes due 2070|z6.250% Senior Notes due 2069|zCommon Shares|3ow Dow Jones Global Yield ETF ETF|6Electronics, Inc. Common Stock|2thur J. Gallagher & Co. Common Stock|3isan Partners Asset Management Inc. Class A Common Stock|4vion, Inc. Common Stock|1sana, Inc. Class A Common Stock|2bury Automotive Group Inc Common Stock|2hford Hospitality Trust Inc 7.375% Series F Cumulative Preferred Stock|z% Series G Cumulative Preferred Stock|w50% Series H Cumulative Preferred Stock|z Series I Cumulative Preferred Stock|u8.45% Series D Cumulative Preferred Stock|uCommon Stock|3land Inc. Common Stock|2pen Aerogels, Inc. Common Stock|6Insurance Holdings Limited 5.625% Perpetual Non|xDepositary Shares, each representing a 1/1,000th Interest in a 7.00% Perpetual Non|2sociated Banc|f|f|3urant, Inc. 5.25% Subordinated Notes due 2061|fCommon Stock|5ed Guaranty Ltd. Common Stock|2traZeneca PLC Ordinary Shares|1tegrity Specialty Insurance Company Holdings Common Stock|2hene Holding Ltd. 7.250% Fixed|kDepositary Shares, Each Representing a 1/1,000th Interest in a 4.875% Fixed|zes, Each Representing a 1/1,000th Interest in a 5.625% Fixed Rate Perpetual Non|zes, Each Representing a 1/1,000th Interest in a 6.35% Fixed|zes, Each Representing a 1/1,000th Interest in a 7.750% Fixed|2kore Inc. Common Stock|2lantic Union Bankshares Corporation Common Stock|4s Energy Solutions Inc. Common Stock|2mos Energy Corporation Common Stock|3us Filtration Technologies Inc. Common Stock|1una SA Class A Ordinary Shares|2toNation, Inc. Common Stock|4Zone, Inc. Common Stock|4home Inc. American Depositary Shares, each representing four class A ordinary shares.|4liv, Inc. Common Stock|1vantor, Inc. Common Stock|2ery Dennison Corporation Common Stock|2idia Bancorp, Inc. Common Stock|3ent Corporation Common Stock|3sta Corporation Common Stock|1xalta Coating Systems Ltd. Common Shares|2is Capital Holdings Limited Common Stock|2os Financial, Inc. Common Stock|1zul S.A. American Depositary Shares, each representing two (2) Common Shares|0B&G Foods, Inc. Common Stock|1ARK, Inc. Class A Common Stock|1BB Foods Inc. Class A Common Shares|1CE, Inc. Common Stock|1GSF, Inc. Common Stock|1HP Group Limited American Depositary Shares (Each representing two Ordinary Shares)|1ILL Holdings, Inc. Common Stock|2P Bermuda Holdings I Limited 5.125% Perpetual Subordinated Notes|1J's Wholesale Club Holdings, Inc. Common Stock|1KV Corporation Common Stock|1NY Mellon High Yield Strategies Fund Common Stock|bMunicipal Bond Infrastructure Fund, Inc. Common Stock|bStrategic Municipal Bond Fund, Inc. Common Stock|us, Inc. Common Stock|1P p.l.c. Common Stock|1RC Inc. Class A Common Stock|2T Apartments Corp. (MD) Common Stock|1W LPG Limited Common Shares|2X Technologies, Inc. Common Stock|1XP, Inc. Common Stock|1abcock & Wilcox Enterprises, Inc. 7.75% Series A Cumulative Perpetual Preferred Stock|zCommon Stock|2dger Meter, Inc. Common Stock|2in Capital GSS Investment Corp. Class A Ordinary Shares|yUnits, each consisting of one Class A Ordinary Share and one|dSpecialty Finance, Inc. Common Stock|2kkt, Inc. Class A Common Stock|2ll Corporation Common Stock|4y's Corporation Common Stock|2nc of California, Inc. Common Stock|pDepositary Shares, each representing a 1/40th interest in a share of 7.75% non|4o BBVA Argentina S.A. ADS|7ilbao Vizcaya Argentaria S.A. Common Stock|7radesco Sa American Depositary Shares|zry Shares (each representing one Common Share)|6De Chile ADS|6Macro S.A. ADR (representing Ten Class B Common Shares)|6Santander|f Brasil SA American Depositary Shares, each representing one unit|f, S.A. Sponsored ADR (Spain)|3k Nova Scotia Halifax Pfd 3 Ordinary Shares|5Of Montreal Common Stock|5of America Corporation Common Stock|sDepositary Sh repstg 1/1000th Perp Pfd Ser E|zary Shares (Each representing a 1/1200th Interest in a Share of Floating Rate Non|zary Shares (Each representing a 1/1200th interest in a Share of Floating Rate Non|zary Shares (Each representing a 1/1200th interest in a Share of Floating Rate Non|zary Shares, each representing a 1/1,000th interest in a share of 4.125% Non|zary Shares, each representing a 1/1,000th interest in a share of 5.375% Non|zary Shares, each representing a 1/1,000th interest in a share of 5.875% Non|zary Shares, each representing a 1/1,000th interest in a share of 6.000% Non|zary shares, each representing 1/1,000th interest in a share of 4.250% Non|zary shares, each representing 1/1,000th interest in a share of 4.375% Non|zary shares, each representing 1/1,000th interest in a share of 4.750% Non|zary shares, each representing 1/1,000th interest in a share of 5.000% Non|sIncome Capital Obligation Notes initially due December 15, 2066|sNon Cumulative Perpetual Conv Pfd Ser L|8Hawaii Corporation Common Stock|rDepositary Shares Each Representing a 1/40th Interest in a Share of 4.375% Fixed Rate Non|zry Shares, Each Representing a 1/40th Interest in a Share of 8.000% Fixed Rate Non|8N.T. Butterfield & Son Limited (The) Voting Ordinary Shares|4United, Inc. Common Stock|2rclays PLC Common Stock|3ings BDC, Inc. Common Stock|8Corporate Investors Common Stock|8Global Short Duration High Yield Fund Common Shares of Beneficial Interests|8Participation Investors Common Stock|3nes & Noble Education, Inc Common Stock|3on Emerging Markets Select ETF|6First Principles ETF|6Global Durable Advantage ETF|6Risk Optimized Large Cap ETF|6SMID Cap ETF|3rick Mining Corporation Common Shares|2th & Body Works, Inc.|2usch + Lomb Corporation Common Shares|7Health Companies Inc. Common Stock|2xter International Inc. Common Stock|2ytex Energy Corp Common Shares|1eacon Financial Corporation Common stock|3zer Homes USA, Inc. Common Stock|2cton, Dickinson and Company Common Stock|2lden Inc Common Stock|3lRing Brands, Inc. Common Stock|2nchmark Electronics, Inc. Common Stock|2rkshire Hathaway Inc. Common Stock|oNew Common Stock|2st Buy Co., Inc. Common Stock|2ta Technologies, Inc. Class A Common Stock|3terware de Mexico, S.A.P.I. de C.V. Ordinary Shares|1igBear.ai, Inc. Common Stock|3lari Holdings Inc. Class A Common Stock|sB Common Stock|2o|3haven Ltd. Common Shares|2rkenstock Holding plc Ordinary Shares|2tGo Holdings, Inc. Class A Common Stock|3Mine Immersion Technologies, Inc. 9.5% Series A Perpetual Preferred Stock|z. Common Stock|1lack Hills Corporation Common Stock|6Spade Acquisition III Co Class A Ordinary Shares|vUnits, each consisting of one Class A ordinary share and one|7tone Minerals, L.P. Common units representing limited partner interests|5Berry Limited Common Stock|5Rock 2037 Municipal Target Term Trust Common Shares of Beneficial Interest|aCapital Allocation Term Trust Common Shares of Beneficial Interest|zrust Rights (expiring October 21, 2026) Rights|bredit Allocation Income Trust|aESG Capital Allocation Term Trust Common Shares of Beneficial Interest|bnergy and Resources Trust|chanced Large Cap Core Fund, Inc. Common Stock|aFloating Rate Income Trust|aHealth Sciences Term Trust Common Shares of Beneficial Interest|aIncome Trust Inc. (The)|aMulti|cnicipal 2030 Target Term Trust|aResources Common Shares of Beneficial Interest|aScience and Technology Term Trust Common Shares of Beneficial Interest|yrust Common Shares of Beneficial Interest|aTaxable Municipal Bond Trust Common Shares of Beneficial Interest|bechnology and Private Equity Term Trust Common Shares of Beneficial Interest|aUtility, Infrastructure & Power Opportunities Trust|aVirginia Municipal Bond Trust|9, Inc. Common Stock|5Sky Technology Inc. Class A Common Stock|5rock Core Bond Trust|dporate High Yield Fund, Inc. Common Stock|aDebt Strategies Fund, Inc. Common Stock|aEnhanced Equity Dividend Trust|jGlobal Dividend Trust Common Shares of Beneficial Interest|jInternational Dividend Trust|aFloating Rate Income Strategies Fund Inc Common Stock|aHealth Sciences Trust|aLimited Duration Income Trust|aMuniAssets Fund, Inc Common Stock|eHoldings California Quality Fund, Inc. Common Stock|nFund, Inc. Common Stock|nNew Jersey Quality Fund, Inc. Common Stock|eYield Michigan Quality Fund, Inc. Common Stock|kNew York Quality Fund, Inc.Common Stock|kPennsylvania Quality Fund Common Stock|kQuality Fund III, Inc Common Stock|w, Inc. Common Stock|5stone Digital Infrastructure Trust Inc. Common Stock|bInc. Common Stock|bLong Short Credit Income Fund Common Shares|bMortgage Trust, Inc. Common Stock|bSecured Lending Fund Common Shares of Beneficial Interest|dnior Floating Rate 2027 Term Fund Common Shares of Beneficial Interest|ctrategic Credit 2027 Term Fund Common Shares of Beneficial Interest|3dex, Inc. Class E Common Stock|2end Labs, Inc. Class A Common Stock|2ock, Inc. Class A Common Stock,|3om Energy Corporation Class A Common Stock|2ue Owl Capital Corporation Common Stock|hInc. Class A Common Stock|9Technology Finance Corp. Common Stock|5Water Acquisition Corp. IV Class A Ordinary Shares|wUnits, each consisting of one Class A ordinary share and one|4linx Holdings Inc. Common Stock|4rock Private Real Estate Fund Common Shares of Beneficial Interest|1ob's Discount Furniture, Inc. Common Stock|2eing Company (The) Common Stock|2ise Cascade, L.L.C. Common Stock|2ot Barn Holdings, Inc. Common Stock|3z Allen Hamilton Holding Corporation Common Stock|2rgWarner Inc. Common Stock|3r Drilling Limited Common Shares|2ston Beer Company, Inc. (The) Common Stock|7Omaha Corporation Class A Common Stock|7Scientific Corporation Common Stock|2whead Specialty Holdings Inc. Common Stock|2x, Inc. Class A Common Stock|2yd Gaming Corporation Common Stock|6roup Services Inc. Common Shares|1rady Corporation Common Stock|3emar Hotels & Resorts Inc. 5.50% Series B Cumulative Convertible Preferred Stock, par value $0.01 per share|u8.25% Series D Cumulative Preferred Stock, par value $0.01 per share|uCommon Stock|3ndywine Realty Trust Common Stock|aGLOBAL Global Income Opportunities Fund Inc.|3silagro Brazilian Agric Real Estate Co Sponsored ADR (Brazil)|4kem SA ADR|2ead Financial Holdings, Inc. Common Stock|vDepositary Shares, each representing a 1/40th interest in a share of 8.625% Non|2ight Horizons Family Solutions Inc. Common Stock|6Spire Capital, Inc. Class A Common Stock|6View Holdings, Inc. Common Stock|6star Lottery PLC Trading under the Legal Name to begin at the market open on July 21, 2025. Ordinary Shares|3nker International, Inc. Common Stock|5s Company (The) Common Stock|3stol|6w Group, Inc. Common Stock|3tish American Tobacco Industries, p.l.c. Common Stock ADR|3xmor Property Group Inc. Common Stock|2oadridge Financial Solutions, Inc. Common Stock|5stone Net Lease, Inc. Common Stock|3okdale Senior Living Inc. Common Stock|5field Asset Management Inc Class A Limited Voting Shares|bBRP Holdings (Canada) Inc. 4.625% Perpetual Subordinated Notes|zc. 4.875% Perpetual Subordinated Notes|zc. 7.250% Perpetual Subordinated Notes|cusiness Corporation Class A Subordinate Voting Shares|bCorporation Class A Limited Voting Shares|bFinance Inc. 4.50% Perpetual Subordinated Notes|q625% Subordinated Notes due October 16, 2080|bInfrastructure Corporation 5.000% Subordinated Notes due 2081|zon 7.250% Subordinated Notes due 2084|zon Brookfield Infrastructure Corporation|qPartners LP 5.000% Class A Preferred Limited Partnership Units, Series 14|zLP 5.125% Class A Preferred Limited Partnership Units, Series 13|zLP Limited Partnership Units|bOaktree Holdings, LLC 6.550% Series B Preferred Units|z625% Series A Preferred Units|bReal Assets Income Fund Inc. Common Stock|dnewable Corporation Brookfield Renewable Corporation Class A Subordinate Voting Shares|lPartners L.P. 5.25% Class A Preferred Limited Partnership Units, Series 17|zLimited Partnership Units|bWealth Solutions Ltd. Class A Exchangeable Limited Voting Shares|3wn & Brown, Inc. Common Stock|6Forman Inc Class A Common Stock|nB Common Stock|2unswick Corporation 6.375% Notes due 2049|mCommon Stock|1uckle, Inc. (The) Common Stock|2enaventura Mining Company Inc.|2ild|5ers FirstSource, Inc. Common Stock|2llish Ordinary Shares|2nge Limited Common Shares|2rford Capital Limited Ordinary Shares|3lington Stores, Inc. Common Stock|2tterfly Network, Inc. Class A Common Stock|1yline Bancorp, Inc. Common Stock|0C1 Fund Inc. Common Stock|13.ai, Inc. Class A Common Stock|1ACI International, Inc. Class A Common Stock|2VA Group, Inc. Common Stock|1BIZ, Inc. Common Stock|2L & Associates Properties, Inc. Common Stock|2RE Global Real Estate Income Fund Common Shares of Beneficial Interest|6roup Inc Common Stock Class A|1F Industries Holdings, Inc. Common Stock|1GI Inc. Common Stock|1H4 Natural Solutions Corporation Class A Ordinary Shares|yUnits, each consisting of one Class A ordinary share and one|1I&T Inc Class A Common Shares|2ON Investment Corporation 7.50% Notes due 2029|zotes due 2031|sCommon Stock|1MB.TECH NV Ordinary Shares|2S Energy Corporation 5.625% Junior Subordinated Notes due 2078|p875% Junior Subordinated Notes due 2078|zr Subordinated Notes due 2079|nCommon Stock|nPreferred Stock|1NA Financial Corporation Common Stock|2Finance Holdings Limited American Depositary Shares, each representing two hundred (200) Ordinary Shares|2H Industrial N.V. Common Shares|2O Financial Group, Inc. 5.125% Subordinated Debentures due 2060|qCommon Stock|2X Resources Corporation Common Stock|1ONMED Corporation Common Stock|2PT Defense Properties Common Shares of Beneficial Interest|1RH PLC Ordinary Shares|1S Disco, Inc. Common Stock|2W Industrials, Inc. Common Stock|1TO Realty Growth, Inc. 6.375% Series A Cumulative Redeemable Preferred Stock|oCommon Stock|2S Corporation Common Stock|1VR Energy Inc. Common Stock|4Partners, LP Common Units representing Limited Partner Interests|2S Health Corporation Common Stock|1able One, Inc. Common Stock|3ot Corporation Common Stock|2ctus, Inc. Class A Common Stock|2deler A/S American Depositary Share (each representing four (4) Ordinary Shares)|3re Holdings, Inc. Common Stock|2leres, Inc. Common Stock|3ifornia Resources Corporation Common Stock|bWater Service Group Common Stock|4x, Inc Common Stock|3laway Golf Company Common Stock|2mden Property Trust Common Stock|3eco Corporation Common Stock|3ping World Holdings, Inc. Class A Common Stock|2nada Goose Holdings Inc. Subordinate Voting Shares|5ian Imperial Bank of Commerce Common Stock|9National Railway Company Common Stock|cural Resources Limited Common Stock|9Pacific Kansas City Limited Common Shares|3go Inc. Class A Ordinary Shares|3nae Holdings, Inc. Common Stock|3tor Fitzgerald Income Trust, Inc. 9.50% Series A Cumulative Redeemable Preferred Stock|2pital One Financial Corporation Common Stock|yDepositary Shares, Each Representing a 1/40th Interest in a Share of Fixed Rate Non|zepositary Shares, Each Representing a 1/40th Interest in a Share of Fixed Rate Non|3ri Holdings Limited Ordinary Shares|2rMax Inc|3dinal Health, Inc. Common Stock|3eTrust REIT, Inc. Common Stock|3lisle Companies Incorporated Common Stock|4yle Credit Income Fund 7.375% Series D Term Preferred Shares due 2028|rShares of Beneficial Interest|3nival Corporation Ltd. Common Shares|3penter Technology Corporation Common Stock|3riage Services, Inc. Common Stock|5er Global Corporation Common Stock|3s.com Inc. Common Stock|3ter's, Inc. Common Stock|3vana Co. Class A Common Stock|2terpillar, Inc. Common Stock|3o Corporation (The) Class A Common Stock|1edar Realty Trust, Inc. 6.50% Series C Cumulative Redeemable Preferred Stock|p7.25% Series B Cumulative Redeemable Preferred Stock|2lanese Corporation Common Stock|3estica, Inc. Common Stock|2mentos Pacasmayo S.A.A. American Depositary Shares (Each representing five Common Shares)|4x, S.A.B. de C.V. Sponsored ADR|2ncora, Inc. Common Stock|3ovus Energy Inc Common Stock|3tene Corporation Common Stock|5rPoint Energy, Inc (Holding Co) Common Stock|6ra Gold Inc. Common Shares|4ral Pacific Financial Corp New|9uerto S.A. American Depositary Shares (each represents ten Common Shares)|5us Energy Corp. Class A Common Stock|4uri Holdings, Inc. Common Stock|6y Communities, Inc. Common Stock|1hain Bridge Bancorp, Inc. Class A Common Stock|3mpion Homes, Inc. Common Stock|3rgePoint Holdings, Inc. Common Stock|4les River Laboratories International, Inc. Common Stock|8Schwab Corporation (The) Common Stock|3tham Lodging Trust (REIT) 6.625% Series A Cumulative Redeemable Preferred Shares of Beneficial Interest|tCommon Shares of Beneficial Interest|2eetah Mobile Inc. American Depositary Shares, each representing fifty (50) Class A Ordinary Shares|3gg, Inc. Common Stock|3med Corp|4ours Company (The) Common Stock|3niere Energy Partners, LP Common Units|f, Inc. Common Stock|3rry Hill Mortgage Investment Corporation 8.20% Series A Cumulative Redeemable Preferred Stock|zporation 8.250% Series B Fixed|zporation Common Stock|3sapeake Utilities Corporation Common Stock|3vron Corporation Common Stock|3wy, Inc. Class A Common Stock|2imera Investment Corporation 7.75% Series C Fixed|v8.00% Series A Cumulative Redeemable Preferred Stock|z% Series B Fixed|z% Series D Fixed|x875% Senior Notes due 2030|v9.000% Senior Notes due 2029|x250% Senior Notes due 2029|vCommon Stock|3na Yuchai International Limited Common Stock|3potle Mexican Grill, Inc. Common Stock|3ron Real Estate Inc. 8.00% Series B Cumulative Redeemable Preferred Stock, $0.001 par value per share|oCommon Stock|oSeries A Cumulative Redeemable Preferred Stock|2oice Hotels International, Inc. Common Stock|2ubb Limited Common Stock|3nghwa Telecom Co., Ltd.|3rch & Dwight Company, Inc. Common Stock|1iena Corporation Common Stock|2nemark Holdings Inc Cinemark Holdings, Inc. Common Stock|2rcle Internet Group, Inc. Class A Common Stock|2tigroup Capital XIII 7.875% Fixed rate Floating Rate trust Preferred Securities (TruPS)|9, Inc. Common Stock|4zens Financial Group, Inc. Common Stock|vDepositary Shares Each Representing 1/40th Interest in a Share of 5.000% Fixed|zsitary Shares Each Representing a 1/40th Interest in a Share of 7.375% Fixed|zsitary Shares, Each Representing a 1/40th Interest in a Share of 6.500% Fixed|8, Inc. Class A Common Stock ($1.00 Par)|2veo Corporation (Canada) Common Shares|1laritev Corporation Class A Common Stock|5vate Plc Ordinary Shares|4os Mortgage Trust, Inc. Common Stock|2ean Harbors, Inc. Common Stock|4r Channel Outdoor Holdings, Inc. Common Stock|6Secure, Inc. Class A Common Stock|5Bridge Energy Midstream Opportunity Fund Inc. Common Stock|5water Paper Corporation Common Stock|7y Energy, Inc. Class C Common Stock|3veland|2ipper Realty Inc. Common Stock|2orox Company (The) Common Stock|3udflare, Inc. Class A Common Stock|1oastalSouth Bancshares, Inc. Common Stock|2ca|2eur Mining, Inc. Common Stock|2hen & Steers Closed|fInc Common Stock|hfrastructure Fund, Inc Common Stock|fLimited Duration Preferred and Income Fund, Inc.|fQuality Income Realty Fund Inc Common Shares|fREIT and Preferred and Income Fund, Inc. Common Shares|geal Estate Opportunities and Income Fund Common Shares of Beneficial Interest|fSelect Preferred and Income Fund, Inc. Common Stock|fTax|gotal Return Realty Fund, Inc. Common Stock|4rent Corp. Common Stock|2lgate|3ombier Acquisition Corp. III Class A Ordinary Shares|wUnits, each consisting of one Class A ordinary share and one|4ny Bankcorp, Inc. Common Stock|3umbia Seligman Premium Technology Growth Fund Inc|2mcast Holdings ZONES|3fort Systems USA, Inc. Common Stock|3mercial Metals Company Common Stock|4unity Financial System, Inc. Common Stock|aHealth Systems, Inc. Common Stock|gcare Trust Incorporated Common Stock|3p En De Mn Cemig ADS American Depositary Receipts|zpositary Shares|4anhia Paranaense de Energia (COPEL) American Depositary Shares (each representing four (4) Common Shares)|aSiderurgica Nacional S.A. Common Stock|ade saneamento Basico Do Estado De Sao Paulo|6ia Cervecerias Unidas, S.A. Common Stock|5ss Diversified Holdings 7.875% Series B Fixed|z Series C Cumulative Preferred Shares|8Minerals Intl Inc Common Stock|7, Inc. Class A Common Stock|3stock Resources, Inc. Common Stock|2nAgra Brands, Inc. Common Stock|3centra Group Holdings Parent, Inc. Common Stock|3ductor Global Equity Value ETF|3ocoPhillips Common Stock|3solidated Edison, Inc. Common Stock|4tellation Brands, Inc. Common Stock|8ium SE Ordinary Shares (France)|2oper|2pa Holdings, S.A. Class A Common Stock|3ley Acquisition Corp Ordinary Shares|oUnits, each consisting of one ordinary share and one|2re & Main, Inc. Class A Common Stock|5Laboratories Inc. Common Stock|5Natural Resources, Inc. Common Stock|4Civic, Inc. Common Stock|4bridge Financial Inc. 6.375% Junior Subordinated Notes due 2064|qCommon Stock|3ning Incorporated Common Stock|3pay, Inc. Common Stock|4oracion America Airports SA Common Shares|cInmobiliaria Vesta, S.A.B de C.V. American Depositary Shares, each representing ten (10) Common Shares|3teva, Inc. Common Stock|2stamare Bulkers Holdings Limited Common Stock|aInc. 8.75% Series D Cumulative Redeemable Perpetual Preferred Stock|fCommon Stock $0.0001 par value|fPerpetual Preferred Series C (Marshall Islands)|zStock Series B (Marshall Islands)|2ty Inc. Class A Common Stock|2unterpoint High Yield Trend ETF|dQuantitative Equity ETF|3pang, Inc. Class A Common Stock|3rsera, Inc. Common Stock|3sins Properties Incorporated Common Stock|2venant Logistics Group, Inc. Class A Common Stock|3ista Inc. Common Shares|1rane Company Common Stock|6NXT, Co. Common Stock|3wford & Company Common Stock|2edicorp Ltd. Common Stock|3scent Energy Company Class A Common Stock|2oss Timbers Royalty Trust Common Stock|5America Partners LP Common Units representing limited partner interests|3wn Castle Inc. Common Stock|6Holdings, Inc.|1square, Inc. Common Stock|1ubeSmart Common Shares|2llen/Frost Bankers, Inc. Common Stock|rDepositary Shares, each representing a 1/40th ownership interest in a share of 4.450% non|2mmins Inc. Common Stock|2rbline Properties Corp. Common Stock|3tiss|2shman & Wakefield Ltd. Common Shares|3tom Truck One Source, Inc. Common Stock|6ers Bancorp, Inc 5.375% Subordinated Notes Due 2034|nCommon Stock|0D.R. Horton, Inc. Common Stock|1/B/A Centerspace Common Stock|7ompass Diversified Holdings Shares of Beneficial Interest|6Sibanye|1AQO New Energy Corp. American Depositary Shares, each representing five ordinary shares|1BA Sempra 5.750% Junior Subordinated Notes due 2079|bCommon Stock|1GA Core Plus Absolute Return ETF|1HI Group, Inc. Common Stock|2T Holdings, Inc.|1NOW Inc. Common Stock|2P Select Income Fund, Inc. Common Stock|1PC Holdings PLC Ordinary Shares|1RDGOLD Limited American Depositary Shares|1T Midstream, Inc. Common Stock|2E Energy Company 2017 Series E 5.25% Junior Subordinated Debentures due 2077|l20 Series G 4.375% Junior Subordinated Debentures due 2080|m1 Series E 4.375% Junior Subordinated Debentures|m5 Series H 6.25% Junior Subordinated Debentures due 2085|jCommon Stock|2F Tax|1WS Municipal Income Trust|1XC Technology Company Common Stock|1aVita Inc. Common Stock|2na Incorporated Common Stock|4her Corporation Common Stock|4os Corporation Common Stock|2rden Restaurants, Inc. Common Stock|3ling Ingredients Inc. Common Stock|2uch Corporation Common Stock|1eckers Outdoor Corporation Common Stock|2ere & Company Common Stock|2l Monte Corporation Ordinary Shares|3ek Logistics Partners, L.P. Common Units representing Limited Partner Interests|6US Holdings, Inc. Common Stock|3l Technologies Inc. Class C Common Stock|3ta Air Lines, Inc. Common Stock|3uxe Corporation Common Stock|2signer Brands Inc. Class A Common Stock|3tiny Tech100 Inc. Common Stock|4ra Multi|2utsche Bank AG Common Stock|2von Energy Corporation Common Stock|1iageo plc Common Stock|3na Shipping Inc. Perpetual Preferred Shares Series B (Marshall Islands)|finc. Warrants|kcommon stock|2ck's Sporting Goods Inc Common Stock|2ebold Nixdorf Incorporated Common stock|2gital Realty Trust, Inc. 5.200% Series L Cumulative Redeemable Preferred Stock|u50% Series J Cumulative Redeemable Preferred Stock|t850% Series K Cumulative Redeemable Preferred Stock, par value $0.01 per share|rCommon Stock|7Ocean Holdings, Inc. Common Stock|2me Commercial Bancshares, Inc. 9.000% Junior Subordinated Notes|xPreferred Stock, Series A|2ne Brands Global, Inc. Common Stock|3gdong (Cayman) Limited American Depositary Shares (each two representing three Ordinary Shares)|2sciplined Growth Acquisition Corporation Class A Ordinary Shares|zoration Rights, each right entitling the holder to receive one|zoration Units, each consisting of one Class A Ordinary Share and one Right|3tillate International Fundamental Stability & Value ETF|bSmall/Mid Cash Flow ETF|2versified Energy Company Common Stock|1olby Laboratories Common Stock|3e plc Ordinary Shares|3lar General Corporation Common Stock|2minion Energy, Inc. Common Stock|2naldson Company, Inc. Common Stock|3nelley Financial Solutions, Inc. Common Stock|2rian LPG Ltd. Common Stock|2ubleLine Income Solutions Fund Common Shares of Beneficial Interests|bOpportunistic Credit Fund Common Shares of Beneficial Interest|bYield Opportunities Fund Common Shares of Beneficial Interest|6Verify Holdings, Inc. Common Stock|3glas Dynamics, Inc. Common Stock|8Elliman Inc. Common Stock|9mmett, Inc. Common Stock|2ver Corporation Common Stock|2w Inc. Common Stock|2ximity, Inc. Class A Common Stock|1r. Reddy's Laboratories Ltd Common Stock|2eam Finders Homes, Inc. Class A Common Stock|1uPont de Nemours, Inc. Common Stock|2commun Incorporated Common Stock|2ff & Phelps Utility and Infrastructure Fund Inc.|2ke Energy Corporation (Holding Company) Common Stock|o5.625% Junior Subordinated Debentures due 2078|oCorporate Units|2tch Bros Inc. Class A Common Stock|1ycom Industries, Inc. Common Stock|2nagas LNG Partners LP 9.00% Series A Cumulative Redeemable Preferred Units|oCommon Units|4trace, Inc. Common Stock|3ex Capital, Inc. 6.900% Series C Fixed|k9.375% Series D Fixed|kCommon Stock|0EIDP, Inc. Preferred Stock $3.50 Series|s4.50 Series|1MCOR Group, Inc. Common Stock|1NI S.p.A. Common Stock|1OG Resources, Inc. Common Stock|1PAM Systems, Inc. Common Stock|2R Properties 5.75% Series C Cumulative Convertible Preferred Shares|j0% Series G Cumulative Redeemable Preferred Shares|fCommon Stock|fSeries E Cumulative Conv Pfd Shs Ser E|1QT Corporation Common Stock|2V Ventures Acquisition Corp. II Class A Ordinary Shares|yUnits, each unit consists of one Class A ordinary share and one|1Rock, Inc. Class A Common Stock|1SAB Corporation Common Stock|2CO Technologies Inc. Common Stock|1agle Materials Inc Common Stock|6Point Credit Company 5.375% Notes due 2029|r6.50% Series C Term Preferred Stock due 2031|t75% Series D Preferred Stock|r7.75% Notes due 2030|rCommon Share of Beneficial Interest|cIncome Company 5.00% Series A Term Preferred Shares due 2026|rCommon Shares of Beneficial Interest|estitutional Income Fund 8.125% Series A Term Preferred Shares Due 2029|5Rock Land, LLC Class A shares representing limited liability company interests|2stGroup Properties, Inc. Common Stock|4erly Government Properties, Inc. Common Stock|4man Chemical Company Common Stock|8Kodak Company Common New|2ton Corporation, PLC Ordinary Shares|6Vance Corporation Eaton Vance Tax|cEnhance Equity Income Fund Eaton Vance Enhanced Equity Income Fund Shares of Beneficial Interest|zund II Common Stock|cFloating Rate Income Trust Common Shares of Beneficial Interest|cMunicipal Income 2028 Term Trust Common Shares of Beneficial Interest|tTrust Common Stock|zEATON VANCE NATIONAL MUNICIPAL OPPORTUNITIES TRUST|cRisk|cSenior Floating|jIncome Trust Common Stock|cTax|f|f|f|f Advantaged Dividend Income Fund Common Shares of Beneficial Interest|dotal Return Bond ETF|1colab Inc. Common Stock|3petrol S.A. American Depositary Shares|3vyst Inc. Common Stock|1dgewell Personal Care Company Common Stock|2ison International Common Stock|2wards Lifesciences Corporation Common Stock|1l Paso Corporation Preferred Stock|2anco Animal Health Incorporated Common Stock|3stic N.V. Ordinary Shares|2dorado Gold Corporation Ordinary Shares|2ement Solutions Inc. Common Stock|3vance Health, Inc. Common Stock|2i Lilly and Company Common Stock|2lington Credit Company 8.50% Notes due 2031|pCommon Shares of Beneficial Interest|aFinancial Inc. 6.250% Series B Fixed|p7.00% Series D Cumulative Perpetual Redeemable Preferred Stock|p8.625% Series C Fixed|pCommon Stock|2me Communities Common Stock|1mbotelladora Andina S.A. Common Stock|3raer S.A. Common Stock|2era Incorporated Common Shares|4gent BioSolutions Inc. Common Stock|4son Electric Company Common Stock|2pire State Realty Trust, Inc. Class A Common Stock|3loyers Holdings Inc Common Stock|3resa Distribuidora Y Comercializadora Norte S.A. (Edenor) American Depositary Shares|1nbridge Inc Common Stock|2compass Health Corporation Common Stock|2dava plc American Depositary Shares (each representing one Class A Ordinary Share)|3eavour Silver Corporation Ordinary Shares (Canada)|2el Chile S.A. American Depositary Shares (Each representing 50 shares of Common Stock)|3rSys Common Stock|4flex Ltd Common Shares|4gizer Holdings, Inc. Common Stock|5y Transition Special Opportunities Class A Ordinary Shares|zties Units, each consisting of one Class A ordinary share and one|7Vault Holdings, Inc. Common Stock|4pac Tool Group Corp. Common Stock|2hanced Group Inc. Class A Common Stock|2nis, Inc. Common Stock|2ova International, Inc. Common Stock|4is Corporation Common Stock|2pro Inc. Common Stock|2tergy Arkansas, LLC First Mortgage Bonds, 4.875% Series Due September 1, 2066|8Corporation Common Stock|8Louisiana, Inc. Collateral Trust Mortgage Bonds, 4.875 % Series due September 1, 2066|8Mississippi, LLC First Mortgage Bonds, 4.90% Series Due October 1, 2066|8New Orleans, LLC First Mortgage Bonds, 5.0% Series due December 1, 2052|zgage Bonds, 5.50% Series due April 1, 2066|8Texas Inc 5.375% Series A Preferred Stock, Cumulative, No Par Value|5prise Products Partners L.P. Common Stock|3ravision Communications Corporation Common Stock|2viri Corporation Common Stock|4sta Holdings Corporation Common Stock|1quifax, Inc. Common Stock|4nor ASA|4table Holdings, Inc. Common Stock|pDepositary Shares|5y Bancshares, Inc. Class A Common Stock|7Lifestyle Properties, Inc. Common Stock|3us Total Return, Inc. Common Stock|1rmenegildo Zegna N.V. Ordinary Shares|2o Copper Corp. Common Shares|1ssent Group Ltd. Common Shares|6ial Properties Realty Trust, Inc. Common Stock|aUtilities, Inc. Common Stock|4x Property Trust, Inc. Common Stock|2tee Lauder Companies, Inc. (The) Common Stock|1than Allen Interiors Inc. Common Stock|2sy, Inc. Common Stock|1ve Holding, Inc. Common Stock|iWarrants, each exercisable for one share of Common Stock at an exercise price of $11.50 per share|3rcore Inc. Class A Common Stock|4est Group, Ltd. Common Stock|4forth, Inc. Common Stock|4pure, Inc. Class A common stock|4source Energy (D/B/A) Common Stock|4tec, Inc. Common Stock|4us Construction Group, Inc. Common Stock|2olent Health, Inc Class A Common Stock|3mmune, Inc. Common Stock|1xcelerate Energy, Inc. Class A Common Stock|2peditors International of Washington, Inc. Common Stock|3ro Ltd Ordinary Shares|2tra Space Storage Inc Common Stock|2xonMobil Holdings Corporation Common Stock|2zeo Group, Inc. Common Stock|0F&G Annuities & Life, Inc. 7.300% Junior Subordinated Notes due 2065|t950% Senior Notes due 2053|rCommon Stock|1.N.B. Corporation Common Stock|1B Financial Corporation Common Stock|1IGS, Inc. Class A Common Stock|1LEX LNG Ltd. Ordinary Shares|1MC Corporation Common Stock|1S Credit Opportunities Corp. Common Stock|3KKR Capital Corp. Common Stock|3Specialty Lending Fund Common Shares of Beneficial Interest|1TI Consulting, Inc. Common Stock|1abrinet Ordinary Shares|2ctSet Research Systems Inc. Common Stock|2ir Isaac Corporation Common Stock|2rmland Partners Inc. Common Stock|1edEx Corporation Common Stock|6Freight Holding Company, Inc. Common Stock|3eral Agricultural Mortgage Corporation 4.875% Non|zration 5.250% Non|zration 5.700% Non|zration 5.750% Non|zration 6.500% Non|zration 6.875% Non|zration Common Stock|8Realty Investment Trust Common Stock|8Signal Corporation Common Stock|6ted Hermes Premier Municipal Income Fund|g, Inc. Common Stock|2rguson Enterprises Inc. Common Stock|3rari N.V. Common Shares|1idelity National Financial, Inc. Common Stock|iInformation Services, Inc. Common Stock|2fth Third Bancorp Common Stock|kDepositary Share repstg 1/1000th Ownership Interest Perp Pfd Series I|zes Representing a 1/40th Ownership Interest in a Share of 6.875% Fixed|zes each representing 1/40th share of Fifth Third 6.00% Non|zes each representing a 1/1000th ownership interest in a share of Non|2gma, Inc. Class A Common Stock|2nVolution Group American Depositary Shares|3ance of America Companies Inc. Class A Common Stock|2rst American Corporation (New) Common Stock|6BanCorp. New Common Stock|6Carolina Financial Services, Inc. Common Stock|7ommonwealth Financial Corporation Common Stock|6Eagle Global Equity ETF|cOverseas Equity ETF|6Horizon Corporation Common Stock|qDepositary Shares each representing a 1/4,000th interest in a share of Non|zy Shares, each representing 1/4000th Interest in a Share of Non|6Industrial Realty Trust, Inc. Common Stock|6Majestic Silver Corp. Ordinary Shares (Canada)|6Trust Enhanced Equity Income Fund Common Shares of Beneficial Interest|cHigh Yield Opportunities 2027 Term Fund Common Stock|cIntermediate Duration Preferred & Income Fund Common Shares of Beneficial Interest|cMortgage Income Fund Common Shares of Beneficial Interest|5Energy Corp. Common Stock|3y Inc. Class A Common Stock|2ve Point Holdings, LLC Class A Common Shares|4rr International Ltd. Ordinary Shares, no par value|1lagstar Bank, N.A. Bifurcated Option Note Unit SecuritiES|kCommon Stock|kDepositary shares, each representing a 1/40th interest in a share of Fixed|3herty & Crumrine Dynamic Preferred and Income Fund Inc. Common Stock|kPreferred and Income Fund Incorporated|zncome Opportunity Fund Incorporated|zncome Securities Fund Incorporated|kTotal Return Fund Inc Common Stock|2oor & Decor Holdings, Inc. Common Stock|3tek Industries, Inc. Common Stock|3wco Holdings Inc. Class A Common Stock|4ers Foods, Inc. Common Stock|4serve Corporation Common Stock|2uor Corporation Common Stock|3tter Entertainment plc Ordinary Shares|1omento Economico Mexicano S.A.B. de C.V. Common Stock|2rd Motor Company 6% Notes due December 1, 2059|k.20% Notes due June 1, 2059|l500% Notes due August 15, 2062|jCommon Stock|3estar Group Inc Common Stock|3gent Power Solutions, Inc. Class A Common Stock|3tis Inc. Common Shares|5ve Corporation Common Stock|4una Mining Corp. Common Shares|6e Brands Innovations, Inc. Common Stock|3um Energy Technologies, Inc. Common Stock|2ur Corners Property Trust, Inc. Common Stock|5Seasons Education (Cayman) Inc. American Depositary Shares, each ADS representing 10 ordinary shares|1ranco|4klin BSP Realty Trust, Inc. 7.50% Series E Cumulative Redeemable Preferred Stock|wCommon Stock|9Covey Company Common Stock|9Managed Municipal Income Trust Shares of Beneficial Interest|bster Intermediate Income Trust Shares of Beneficial Interest|aunicipal Opportunities Trust Shares of Beneficial Interest|9Premier Income Trust Shares of Beneficial Interest|9Templeton, Inc. Common Stock|9Universal Trust Common Stock|2eeport|3senius Medical Care AG American Depositary Shares (Each representing 1/2 of an Ordinary Share)|2ontView REIT, Inc. Common Stock|5line Plc Ordinary Shares|1uboTV Inc. Class A Common Stock|2ll Truck Alliance Co. Ltd. American Depositary Shares (each representing 20 Class A Ordinary Shares)|2ndrise Innovation Fund, LLC Common Shares of Limited Liability Company Interests|2tureCorp Space Acquisition 1 Class A Ordinary Shares|vUnits, each consisting of one Class A ordinary share and one|7rest Acquisition Corp. Class A Ordinary Shares|uUnits, each consisting of one Class A ordinary share and one|6Fuel Corp. Common shares|0GAMCO Natural Resources, Gold & Income Trust|2TX Corporation Common Stock|1CT Semiconductor Holding, Inc. Common Stock|1DL Fund, The Common Shares of Beneficial Interest|1E Aerospace Common Stock|3Vernova Inc. Common Stock|1FL Environmental Inc. Subordinate voting shares, no par value|1MR Solutions Inc. Class A Common Stock|1PGI, Inc. Class A Common Stock|1SK plc American Depositary Shares (Each representing two Ordinary Shares)|1XO Logistics, Inc. Common Stock|1abelli Convertible and Income Securities Fund, Inc. (The) Common Stock|8Dividend & Income Trust Common Shares of Beneficial Interest|8Equity Trust, Inc. (The) 5.00% Series K Cumulative Preferred Stock|xCommon Stock|xPfd Ser H|xSeries G Cumulative Preferred Stock|8Global Small and Mid Cap Value Trust (The) Common Shares of Beneficial Interest|8Multi|d|8Utility Trust (The) 5.375% Series C Cumulative Preferred Shares|sCommon Stock|2laxyEdge Acquisition Corporation Ordinary Shares|zRights to receive one|2meStop Corporation Common Stock|lWarrants to Purchase Common Stock|2otu Techedu Inc. American Depositary Shares|2p, Inc. (The) Common Stock|2rmin Ltd. Common Stock (Switzerland)|3tner, Inc. Common Stock|2sLog Partners LP 8.200% Series B Cumulative Redeemable Perpetual Fixed to Floating Rate Preference Units|l500% Series C Cumulative Redeemable Perpetual Fixed to Floating Rate Preference Units|l625% Series A Cumulative Redeemable Perpetual Fixed to Floating Rate Preference Units|2tes Industrial Corporation Ltd. Common Shares|1enco Shipping & Trading Limited Ordinary Shares New (Marshall Islands)|3erac Holdlings Inc. Common Stock|6l American Investors Company, Inc. Cumulative Preferred Stock|q, Inc. Common Stock|8Dynamics Corporation Common Stock|8Mills, Inc. Common Stock|9otors Company Common Stock|4sco Inc. Common Stock|5is Energy, L.P. Common Units|3ie Energy Ltd. Class B Common Stock Stock|4us Sports Limited Ordinary Shares|3pact Limited Common Stock|3uine Parts Company Common Stock|3worth Financial Inc Common Stock|2o Group Inc (The) REIT|3park Ltd Common Shares|3rgia Power Company Series 2017A 5.00% Junior Subordinated Notes due October 1, 2077|2rdau S.A. Common Stock|2tty Realty Corporation Common Stock|1ildan Activewear, Inc. Class A Sub. Vot. Common Stock|2nkgo Bioworks Holdings, Inc. Class A Common Stock|1lacier Bancorp, Inc. Common Stock|3ss House Brands Inc. Subordinate Voting Shares|3ukos Corporation Common Stock|2obal Industrial Company Common Stock|7Net Lease, Inc. 6.875% Series B Cumulative Redeemable Perpetual Preferred Stock|n7.25% Series A Cumulative Redeemable Preferred Stock, $0.01 par value per share|p375% Series E Cumulative Redeemable Perpetual Preferred Stock|p50% Series D Cumulative Redeemable Perpetual Preferred Stock|nCommon Stock|7Partners LP Common Units representing Limited Partner Interests|9yments Inc. Common Stock|7Ship Lease Inc New Class A Common Shares|h, Inc. Depository Shares Representing 1/100th Perpetual Preferred Series B% (Marshall Island)|5nt S.A. Common Shares|4e Life Inc. 4.25% Junior Subordinated Debentures due 2061|gCommon Stock|4us Medical, Inc. Class A Common Stock|1oDaddy Inc. Class A Common Stock|2ld Fields Limited American Depositary Shares|4.com, Inc. Common Stock|4man Sachs BDC, Inc. Common Stock|eCore Plus Bond ETF|eGroup Securities STRATS Trust for Goldman Sachs Group Securities, Series 2006|j, Inc. (The) Common Stock|wDep Shs repstg 1/1000 Pfd Ser D Fltg|zositary Share repstg 1/1000th Preferred Series C|zositary Shares each representing 1/1000th Interest in a Share of Floating Rate Non|2rman|1rabAGun Digital Holdings Inc. Common Stock|3co Inc. Common Stock|3fTech International Ltd. Common Stock|3ham Corporation Common Stock|7Holdings Company Common Stock|3nite Construction Incorporated Common Stock|8Point Mortgage Trust Inc. 7.00% Series A Fixed|yCommon Stock|8Ridge Resources, Inc. Common Stock|3phic Packaging Holding Company|3y Media, Inc. Class A Common Stock|iommon Stock|2een Brick Partners, Inc. Common Stock|6Dot Corporation Class A Common Stock, $0.001 par value|5Tree Hospitality Group Ltd. American depositary shares, each representing one Class A ordinary share|5brier Companies, Inc. (The) Common Stock|5fire Resources Ltd. Common Shares|3if Inc. Class A Common Stock|5, Inc. Corporation Class B Common Stock|2iffon Corporation Common Stock|3ndr Inc. Common Stock|2oup 1 Automotive, Inc. Common Stock|3ve Collaborative Holdings, Inc. Class A Common Stock|2upo Aeromexico, S.A.B. de C.V. American Depositary Shares (each representing ten (10) Common Shares)|aportuario del Sureste, S.A. de C.V. Common Stock|7val Acciones y Valores S.A. ADR (Each representing 20 preferred shares)|6Cibest S.A. American Depositary Shares each representing four Preferred Shares|6Supervielle S.A. American Depositary Shares each Representing five Class B shares|6Televisa S.A.B. Common Stock|1uardian Pharmacy Services, Inc. Class A Common Stock|2ggenheim Active Allocation Fund Common Shares of Beneficial Interest|bStrategic Opportunities Fund Common Shares of Beneficial Interest|bTaxable Municipal Bond & Investment Grade Debt Trust Common Shares of Beneficial Interest|2idewire Software, Inc. Common Stock|2lfport Energy Corporation Common Shares|0H&R Block, Inc. Common Stock|1. B. Fuller Company Common Stock|1A Sustainable Infrastructure Capital, Inc. Common Stock|1CA Healthcare, Inc. Common Stock|2I Group, Inc. Common Stock|1DFC Bank Limited Common Stock|1F Sinclair Corporation Common Stock|1NI Corporation Common Stock|1P Inc. Common Stock|1SBC Holdings, plc. Common Stock|1UYA Inc. American depositary shares, each representing one Class A ordinary share|1aemonetics Corporation Common Stock|2fnia Limited Common Shares|2gerty, Inc. Class A Common Stock|2leon plc American Depositary Shares (Each representing two Ordinary Shares)|3liburton Company Common Stock|2milton Beach Brands Holding Company Class A Common Stock|9Insurance Group, Ltd. Class B Common Shares|2nover Insurance Group Inc|2rbor Commodity All|7Dividend Growth Leaders ETF|7Long|7PanAgora Dynamic Large Cap Core ETF|3ley|3mony Gold Mining Company Limited|2verty Furniture Companies, Inc. Common Stock|2waiian Electric Industries, Inc. Common Stock|3kEye 360, Inc. Common Stock|2ymaker Acquisition Corp V Units, each consisting of one Class A ordinary share and one|3ward Holdings, Inc. Common Stock|1ealthcare Realty Trust Incorporated Common Stock|6peak Properties, Inc. Common Stock|2cla Mining Company Common Stock|lPreferred Stock|2ico Corporation Common Stock|2lios Technologies, Inc. Common Stock|3merich & Payne, Inc. Common Stock|2rbalife Ltd. Common Shares|3c Holdings Inc. Common Stock|4ules Capital, Inc. 6.25% Notes due 2033|nCommon Stock|3itage Insurance Holdings, Inc. Common Stock|2ss Midstream LP Class A Representing Limited Partner Interests|2wlett Packard Enterprise Company 7.625% Series C Mandatory Convertible Preferred Stock|zCommon Stock|2xcel Corporation Common Stock|1igh Income Securities Fund Common Stock|5Templar Tech Limited American depositary shares, each representing one Class A ordinary share|4land Global Allocation Fund Common Stock|9Opportunities and Income Fund 5.375% Series A Cumulative Preferred Shares|zund 5.375% Series B Cumulative Preferred Shares|zund Common Shares of Beneficial Interest|4woods Properties, Inc. Common Stock|2lltop Holdings Inc.|3ton Grand Vacations Inc. Common Stock|7Worldwide Holdings Inc. Common Stock|2malaya Shipping Ltd. Common Shares|3s & Hers Health, Inc. Class A Common Stock|2nge Health, Inc. Class A Common Stock|2ppo Holdings Inc. Common Stock|1olley Inc. Common Stock|2me BancShares, Inc. Common Stock|5Depot, Inc. (The) Common Stock|4Trust Bancshares, Inc. Common Stock|2nda Motor Company, Ltd. Common Stock|2race Mann Educators Corporation Common Stock|3izon Technology Finance Corporation 6.25% Notes due 2027|3mel Foods Corporation Common Stock|3nbeck Offshore Services, Inc. Common Stock|2ulihan Lokey, Inc. Class A Common Stock|2vnanian Enterprises, Inc. Class A Common Stock|2ward Hughes Holdings Inc. Common Stock|3met Aerospace Inc. Common Stock|1ubSpot, Inc. Common Stock|3bell Inc Common Stock|2dbay Minerals Inc. Ordinary Shares (Canada)|3son Pacific Properties, Inc. 4.750% Series C Cumulative Redeemable Preferred Stock|wCommon Stock|2mana Inc. Common Stock|2ntington Ingalls Industries, Inc. Common Stock|4sman Corporation Common Stock|1yatt Hotels Corporation Class A Common Stock|2ster|0ICICI Bank Limited Common Stock|2L Group Ltd. Ordinary Shares|1DACORP, Inc. Common Stock|2EX Corporation Common Stock|2T Corporation Class B Common Stock|1HS Holding Limited Ordinary Shares|1NG Group, N.V. Common Stock|2NOVATE Corp. Common Stock|2VESCO MORTGAGE CAPITAL INC 7.5% Fixed|tCommon Stock|1QVIA Holdings, Inc. Common Stock|1RSA Inversiones Y Representaciones S.A. Global Depositary Shares (Each representing ten shares of Common Stock)|1TT Inc. Common Stock|1amgold Corporation Ordinary Shares|1botta, Inc. Class A Common Stock|1llinois Tool Works Inc. Common Stock|1max Corporation Common Stock|1nPoint Commercial Real Estate Income, Inc. 6.75% Series A Cumulative Redeemable Preferred Stock|2dependence Realty Trust, Inc. Common Stock|2finity Natural Resources, Inc. Class A Common Stock|3leqtion, Inc. Common Stock|3osys Limited American Depositary Shares|2gersoll Rand Inc. Common Stock|4vity Corporation Common Stock|3ram Micro Holding Corporation Common Stock|4edion Incorporated Common Stock|2novative Industrial Properties, Inc. 9.00% Series A Cumulative Redeemable Preferred Stock|znc. Common Stock|5ex International, Inc. Common Stock|2sperity, Inc. Common Stock|4ire Medical Systems, Inc. Common Stock|3talled Building Products, Inc. Common Stock|4eel Industries, Inc. Common Stock|2teger Holdings Corporation Common Stock|4rcontinental Exchange Inc. Common Stock|hHotels Group American Depositary Shares (Each representing one Ordinary Share)|7rp Financial Services Inc. Common Shares|5national Business Machines Corporation Common Stock|eFlavors & Fragrances, Inc. Common Stock|ePaper Company Common Stock|eSeaways, Inc. Common Stock|3repid Potash, Inc Common Stock|2venTrust Properties Corp. Common Stock|4sco Bond Fund Common Stock|8California Value Municipal Income Trust Common Stock|8High Income Trust II|8Ltd Common Stock|8Municipal Income Opportunities Trust Common Stock|iOpportunity Trust Common Stock|iTrust Common Stock|8Pennsylvania Value Municipal Income Trust Common Stock (DE)|8Quality Municipal Income Trust Common Stock|8Senior Income Trust Common Stock (DE)|8Trust for Investment Grade Municipals Common Stock (DE)|zNew York Municipals Common Stock|8Value Municipal Income Trust Common Stock|3itation Homes Inc. Common Stock|1onQ, Inc. Common Stock|1ris Acquisition Corp II Class A Ordinary Shares|pUnits, each consisting of one Class A Ordinary Share and one|2on Mountain Incorporated (Delaware)Common Stock REIT|1tau Unibanco Banco Holding SA American Depositary Shares (Each repstg 500 Preferred shares)|1ves Ultra AI Opportunities Inc. Common Stock|0J P Morgan Chase & Co Depositary Shares, each representing a 1/400th interest in a share of 4.20% Non|zares, each representing a 1/400th interest in a share of 4.55% Non|zares, each representing a 1/400th interest in a share of 4.625% Non|zares, each representing a 1/400th interest in a share of 5.75% Non|zares, each representing a 1/400th interest in a share of 6.00% Non|1. Jill, Inc. Common Stock|1BG SMITH Properties Common Shares|2S N.V. Class A Common Shares|2T Marel Corporation Common Stock|1ELD|1P Morgan Chase & Co. Common Stock|2Morgan Active Bond ETF|1abil Inc. Common Stock|2ckson Acquisition Company II Class A Ordinary Shares|vRights, each right to acquire one|vUnits, each consisting of one Class A ordinary share and one right to acquire one|8Financial Inc. Class A Common Stock|nDepositary Shares, each representing a 1/1,000th interest in a share of Fixed|3obs Solutions Inc. Common Stock|2mes Hardie Industries plc. Ordinary Shares|2nus International Group, Inc. Common Stock|6Living, Inc. Class A|2pan Smaller Capitalization Fund Inc Common Stock|1efferies Financial Group Inc. Common Stock|2na Acquisition Corporation II Class A Ordinary Shares|wRights, each right to acquire one|wUnits, each consisting of one Class A ordinary share and one right|2rsey Mike's Subs Inc. Class A Common Stock|1inkoSolar Holding Company Limited American Depositary Shares (each representing 4 Common Shares)|1oby Aviation, Inc. Common Stock|2hn Hancock Diversified Income Fund Common Shares of Beneficial Interest|dFinancial Opportunities Fund Common Stock|dIncome Securities Trust Common Stock|fvestors Trust Common Stock|dPfd Income Fund II Pfd Income Fund II|ereferred Income Fund Common Shares of Beneficial Interest|zIII Preferred Income Fund III|gmium Dividend Fund|dTax Advantaged Dividend Income Fund Common Shares of Beneficial Interest|5Wiley & Sons, Inc. Common Stock|4son & Johnson Common Stock|8Controls International plc Ordinary Share|2nes Lang LaSalle Incorporated Common Stock|1umia Technologies AG American Depositary Shares, each representing two Ordinary Shares|0KB Financial Group Inc|3Home Common Stock|2R, Inc. Common Stock|1E Holdings Inc American Depositary Shares (each representing three Class A Ordinary Shares)|1KR & Co. Inc. 6.25% Series D Mandatory Convertible Preferred Stock|h875% Subordinated Notes due 2065|fCommon Stock|4Group Finance Co. IX LLC 4.625% Subordinated Notes due 2061|4Income Opportunities Fund Common Shares|4Real Estate Finance Trust Inc. 6.50% Series A Cumulative Redeemable Preferred Stock|zCommon Stock|1NOT Offshore Partners LP Common Units representing Limited Partner Interests|1PET Ultra Paceline Corporation Class A Ordinary Shares|wUnits, each consisting of one Class A Ordinary Share and one|1T Corporation Common Stock|1adant Inc Common Stock|2rman Holdings Inc. Common Stock|2yne Anderson BDC, Inc. Common Stock|fEnergy Infrastructure Fund, Inc.|1emper Corporation|i 5.875% Fixed|2nnametal Inc. Common Stock|3on Holdings Ltd. Ordinary Shares|3sington Capital Acquisition Corp. VI New Units, each consisting of one Class A Ordinary Share and three|z. VI Units, each consisting of one Class A ordinary share, one|3vue Inc. Common Stock|2yCorp Common Stock|8Depositary Shares Each Representing a 1/40th Ownership Interest in a Share of Fixed|qeach representing a 1/40th ownership interest in a share of Fixed Rate Perpetual Non|p, each representing a 1/40th ownership interest in a share of Fixed Rate Perpetual Non|3sight Technologies Inc. Common Stock|1force, Inc. Common Stock|1ilroy Realty Corporation Common Stock|2mbell Royalty Partners Common Units Representing Limited Partner Interests|3co Realty Corporation (HC) Common Stock|pClass L Depositary Shares, each of which represents a one|vM Depositary Shares, each of which represents a one|2nder Morgan, Inc. Common Stock|6Care Learning Companies, Inc. Common Stock|3etik Holdings Inc. Class A Common Stock|3gsway Corporation Common Stock|3ross Gold Corporation Common Stock|3sale Capital Group, Inc. Common Stock|2rby Corporation Common Stock|2te Realty Group Trust Common Stock|1larna Group plc Ordinary Shares|3viyo, Inc. Series A Common Stock|1nife Riv Holding Co. Common Stock|3ght|2owles Corporation Common Stock|1odiak Gas Services, Inc. Common Stock|2hl's Corporation Common Stock|2ninklijke Philips N.V. NY Registry Shares|3toor Brands, Inc. Common Stock|2ppers Holdings Inc. Common Stock|2rea Electric Power Corporation Common Stock|6Fund, Inc. (The) New Common Stock|3n Ferry Common Stock|2smos Energy Ltd. Common Shares (DE)|1roger Company (The) Common Stock|3nos Worldwide Inc Common Stock|1yndryl Holdings, Inc. Common Stock|0L3Harris Technologies, Inc. Common Stock|1ATAM Airlines Group S.A. American Depositary Shares (each representing two thousand (2,000) shares of Common Stock)|1CI Industries|1G Display Co, Ltd AMERICAN DEPOSITORY SHARES|1MP Capital and Income Fund Inc. Common Stock|1SB Industries, Inc. Common Stock|1TC Properties, Inc. Common Stock|1XP Industrial Trust 6.5% Series C Cumulative Convertible Preferred Stock|lCommon Stock (Maryland REIT)|1a|2bcorp Holdings Inc. Common Stock|2dder Capital Corp Class A Common Stock|2mb Weston Holdings, Inc. Common Stock|2ndBridge Company LLC Class A Shares Representing Limited Liability Company Interests|3vin Group Holdings Limited Ordinary Shares|2s Vegas Sands Corp. Common Stock|2zard Global Total Return and Income Fund Common Stock|6, Inc. Common Stock|1ear Corporation Common Stock|2hman ABS 3.50 3.50% Adjustable Corp Backed Tr Certs GS Cap I|2idos Holdings, Inc. Common Stock|2monade, Inc. Common Stock|2nnar Corporation Class A Common Stock|pB|4ox International, Inc. Common Stock|2vi Strauss & Co Class A Common Stock|1iberty All|8Energy Inc. Class A common stock|2fe Time Group Holdings, Inc. Common Stock|4zone Metals Limited Ordinary Shares|oWarrants|2ghtInTheBox Holding Co., Ltd. American Depositary Shares, each representing twelve ordinary shares|5speed Commerce Inc. Subordinate Voting Shares|2ncoln International, Inc. Class A Common Stock|8National Corporation Common Stock|tDepositary Shares Each Representing a 1/1,000th Interest in a Share of 9.000% Non|3dsay Corporation Common Stock|2onsgate Studios Corp Common Shares|2thia Motors, Inc. Common Stock|5um Americas Corp. Common Shares|9rgentina AG Common Shares|2ve Nation Entertainment, Inc. Common Stock|5Oak Bancshares, Inc. Common Stock|4Ramp Holdings, Inc. Common Stock|4Wire Group, Inc. Common Stock|lWarrants, each exercisable for one share of Common Stock at an exercise price of $11.50 per share|1loyds Banking Group Plc American Depositary Shares|1oar Holdings Inc. Common Stock|2cal Bounti Corporation Common Stock|3kheed Martin Corporation Common Stock|2ews Corporation Common Stock|2gan Capital International ETF|2ma Negra Compania Industrial Argentina Sociedad Anonima ADS|2ndian Wason New Energy Tech Inc. American Depositary Shares, each representing five Ordinary Shares|2uisiana|2we's Companies, Inc. Common Stock|1ucky Strike Entertainment Corporation Class A Common Stock|2fax Holding Ltd American Depositary Shares, each representing two (2) Ordinary Shares|2men Technologies, Inc. Common Stock|5t Finance Trust, Inc. 7.875% Series A Cumulative Redeemable Preferred Stock|rCommon Stock|2xExperience B.V. American Depositary Shares, each representing one Ordinary Share|3fer Holdings PLC Ordinary Shares|1yntris Inc. Common Stock|2ondellBasell Industries NV Ordinary Shares Class A (Netherlands)|0M&T Bank Corporation Common Stock|lDepositary Shares each representing a 1/400th interest in a share of Perpetual 6.350% Non|zres each representing a 1/400th ownership interest in a share of Perpetual 6.625% Non|zres each representing a 1/400th ownership interest in a share of Perpetual 7.500% Non|lPerpetual Fixed|1/I Homes, Inc. Common Stock|1BIA Inc. Common Stock|1DA Space Ltd. Common Shares|2U Resources Group, Inc. Common Stock (Holding Company)|1EDIFAST INC Common Stock|1FA Financial, Inc.|j 6.50% Series C Fixed|k8.875% Senior Notes due 2029|k9.000% Senior Notes due 2029|kPreferred Series B|2S Active Core Plus Bond ETF|bGrowth ETF|bIntermediate Muni Bond ETF|gnational ETF|bMid Cap ETF|bValue ETF|4Blended Research Core Equity ETF|lEmerging Markets Equity ETF|lInternational Equity ETF|1GIC Investment Corporation Common Stock|2M Resorts International Common Stock|1INISO Group Holding Limited American Depositary Shares, each representing four Ordinary Shares|1NTN, Inc. Class A Common Stock|1OGU Inc. American Depositary Shares (each representing 25 Class A Ordinary Shares)|2ZAYYX Acquisition Corp. Class A Ordinary Shares|qUnits, each consisting of one Class A ordinary share and one|1P Materials Corp. Common Stock|2LX LP Common Units Representing Limited Partner Interests|1SA Safety Incorporated Common Stock|2C Income Fund, Inc. Common Stock|6dustrial Direct Company, Inc. Common Stock|3I Inc. Common Stock|1UELLER WATER PRODUCTS Common Stock|1acerich Company (The) Common Stock|3h Natural Resources LP Common Units representing Limited Partner Interests|3y's Inc Common Stock|2dison Air Solutions Corporation Class A Common Stock|8Square Garden Entertainment Corp. Class A Common Stock|mSports Corp. Class A Common Stock (New)|2gna International, Inc. Common Stock|5chip Semiconductor Corporation Common Stock|4era Corporation Common Stock|4olia Oil & Gas Corporation Class A Common Stock|2iden Holdings North America, Ltd. 7.75% Notes due 2043|f, Ltd. 6.625% Notes due 2046|3n Street Capital Corporation Common Stock|2nchester United Ltd. Class A Ordinary Shares|3itowoc Company, Inc. (The) Common Stock|3powerGroup Common Stock|3ulife Financial Corporation Common Stock|2rathon Petroleum Corporation Common Stock|3cus & Millichap, Inc. Common Stock|7Corporation (The) Common Stock|3ineMax, Inc. (FL) Common Stock|3kel Group Inc. Common Stock|3riott Vacations Worldwide Corporation Common Stock|3sh Common Stock|3tin Marietta Materials, Inc. Common Stock|2sTec, Inc. Common Stock|3co Corporation Common Stock|3terBrand, Inc. Common Stock|6card Incorporated Common Stock|2tador Resources Company Common Stock|3erion Corporation|3iv Holdings, Inc. Common Stock|3son, Inc. Common Stock|2ui Land & Pineapple Company, Inc. Common Stock|2ximus, Inc. Common Stock|2yville Engineering Company, Inc. Common Stock|1cCormick & Company, Incorporated Common Stock|2Donald's Corporation Common Stock|2Ewen Inc. Common Stock|2Graw Hill, Inc. Common Stock|2Kesson Corporation Common Stock|1ediaAlpha, Inc. Class A Common Stock|4cal Properties Trust, Inc. common stock|3tronic plc. Ordinary Shares|2rck & Company, Inc. Common Stock (new)|4ury General Corporation Common Stock|3itage Homes Corporation Common Stock|3rill Lynch & Co., Inc. 6.0518% Index Plus Trust Certificates Series 2003|2sa Royalty Trust Common Stock|4bi Trust Common Stock|2tLife, Inc. Common Stock|eDepositary Shares|v, each representing a 1/1,000th interest in a share of 4.75% Non|ePreferred Series A Floating Rate|3allus Inc. Common Shares|5s Acquisition Corp. II Class A Ordinary Shares|sUnits, each consisting of one Class A ordinary share and one|3hode Electronics, Inc. Common Stock|3ropolitan Bank Holding Corp. Common Stock|3tler|2xico Equity and Income Fund, Inc. (The) Common Stock|7Fund, Inc. (The) Common Stock|1iami International Holdings, Inc. Common Stock|2d|2ller Industries, Inc. Common Stock|7Value Partners Appreciation ETF|4rose Properties, Inc. Class A Common Stock|2nerals Technologies Inc. Common Stock|2rion Technologies, Inc. Class A Common Stock|2stras Group Inc Common Stock|2tsubishi UFJ Financial Group, Inc. Common Stock|2zuho Financial Group, Inc. Sponosred ADR (Japan)|1obility Global Inc. Common Stock|2dine Manufacturing Company Common Stock|2elis & Company Class A Common Stock|2hawk Industries, Inc. Common Stock|2lina Healthcare Inc Common Stock|3son Coors Beverage Company Class A Common Stock|z B Common Stock|2ody's Corporation Common Stock|3g Inc. Class A Common Stock|gB Common Stock|2rgan Stanley China A Share Fund Inc. Common Stock|gommon Stock|fDEPOSITARY SHARES REP 1/1000TH SHARES FIXED/FLTG PREFERRED STOCK SERIES E|gep Shs Rpstg 1/1000th Int Prd Ser F Fxd to Flag|nrepstg 1/1000 Pfd Ser A|iositary Shares, each representing 1/1,000th of a share of 4.250% Non|zach representing 1/1,000th of a share of 4.875% Non|zach representing 1/1,000th of a share of 6.500% Non|zach representing 1/1,000th of a share of 6.625% Non|zach representing 1/1,000th of a share of Fixed|mory Shares Representing 1/1000th Preferred Series 1 Fixed to Floating Non (Cum)|girect Lending Fund Common Stock|fEmerging Markets Debt Fund, Inc. Common Stock|xomestic Debt Fund, Inc. Common Stock|fIndia Investment Fund, Inc. Common Stock|2saic Company (The) Common Stock|2torola Solutions, Inc. Common Stock|2vado Group Inc. Common Stock|1ueller Industries, Inc. Common Stock|2rphy Oil Corporation Common Stock|7USA Inc. Common Stock|1yers Industries, Inc. Common Stock|0N|1ACCO Industries, Inc. Common Stock|1CR Atleos Corporation Common Stock|4Voyix Corporation Common Stock|1ET Power Inc. Class A Common Stock|1GL ENERGY PARTNERS LP 9.00% Class B Fixed|p625% Class C Fixed|nCommon Units representing Limited Partner Interests|1IO Inc. American depositary shares, each representing one Class A ordinary share|2Q Global Intelligence plc Ordinary Shares|1LI Holdings, Inc. Common Stock|1NN REIT, Inc. Common Stock|1OV Inc. Common Stock|1PK International Inc. Common Stock|1RG Energy, Inc. Common Stock|1VR, Inc. Common Stock|1XG Cushing Midstream Energy Fund Common Shares of Beneficial Interest|4NextGen Infrastructure Income Fund Common Shares of Beneficial Interest|1YLIM CBRE Global Infrastructure Megatrends Term Fund Common Shares|6MacKay DefinedTerm Muni Opportunities Fund Common Shares|1abors Industries Ltd.|2tWest Group plc American Depositary Shares, (each representing two (2) Ordinary Shares)|3ional Bank Holdings Corporation Common Stock|9Fuel Gas Company Common Stock|9Grid Transco, PLC National Grid PLC (NEW) American Depositary Shares|9Health Investors, Inc. Common Stock|9Presto Industries, Inc. Common Stock|3ural Gas Services Group, Inc. Common Stock|9rocers by Vitamin Cottage, Inc. Common Stock|8Resource Partners LP Limited Partnership|2vigator Holdings Ltd. Ordinary Shares (Marshall Islands)|4os Maritime Partners LP Common Units Representing Limited Partner Interests|1elnet, Inc. Common Stock|2ptune Insurance Holdings Inc. Class A Common Stock|2rdy Inc. Class A Common Stock|2t Lease Office Properties Common Shares of Beneficial Interest|3STREIT Corp. Common Stock|2uberger Next Generation Connectivity Fund Inc. Common Stock|2w America Acquisition I Corp. Class A Common Stock|wUnits, each consisting of one share of Class A Common Stock and one|4Germany Fund, Inc. (The) Common Stock|4Oriental Education & Technology Group, Inc. Sponsored ADR representing 10 Ordinary Share (Cayman Islands)|4York Times Company (The) Common Stock|3Jersey Resources Corporation Common Stock|3Market Corp Common Stock|3mont Corporation|3smax, Inc. Class B Common Stock|2xPoint Diversified Real Estate Trust Common Stock|9Real Estate Finance, Inc. 8.50% Series A Cumulative Redeemable Preferred Stock|zCommon Stock|bsidential Trust, Inc. Common Stock|3a Resources S.A. Common Shares|3gen Energy Ltd. Common Shares|3tEra Energy Capital Holdings Inc. Series N Junior Subordinated Debentures due March 1, 2079|z. Series Z Junior Subordinated Debentures due April 15, 2086|e, Inc. 7.234% Corporate Units|o99% Corporate Units|n375% Corporate Units|lCommon Stock|lSeries U Junior Subordinated Debentures due June 1, 2085|4door Holdings, Inc. Class A Common Stock|1iSource Inc Common Stock|2colet Bankshares Inc. Common Stock|2ke, Inc. Common Stock|1oah Holdings Limited American Depositary Shares|2ble Corporation plc A Ordinary Shares|mTranche 1 Warrants|u2 Warrants|2kia Corporation Sponsored American Depositary Shares|2mad Foods Limited Ordinary Shares|3ura Holdings Inc ADR American Depositary Shares|2rdic American Tankers Limited Common Stock|3folk Southern Corporation Common Stock|3th American Construction Group Ltd. Common Shares (no par)|6European Oil Royality Trust Common Stock|5ern Oil and Gas, Inc. Common Stock|5pointe Bancshares, Inc. Common Stock|5rop Grumman Corporation Common Stock|5west Natural Holding Company Common Stock|3wegian Cruise Line Holdings Ltd. Ordinary Shares|2uveau Monde Graphite Inc. Common Shares|2vartis AG Common Stock|3o Nordisk A/S Common Stock|1u Holdings Ltd. Class A Ordinary Shares|3Skin Enterprises, Inc. Common Stock|2Scale Power Corporation Class A Common Stock|2cor Corporation Common Stock|2trien Ltd. Common Shares|2vation Bio Inc. Class A Common Stock|3een AMT|a|8rizona Quality Municipal Income Fund Common Stock|7California AMT|iMunicipal Value Fund|iQuality Municipal Income Fund|8hurchill Direct Lending Corp. Common Stock|8ore Equity Alpha Fund Common Shares of Beneficial Interest|cPlus Impact Fund Common Shares of Beneficial Interest|8redit Strategies Income Fund Shares of Beneficial Interest|7Dynamic Municipal Opportunities Fund Common Shares of Beneficial Interest|7Floating Rate Income Fund Common Stock|7Global High Income Fund Common Shares of Beneficial Interest|7Massachusetts Quality Municipal Income Fund Common Stock|8innesota Quality Municipal Income Fund|8ortgage and Income Fund|8ulti|9nicipal Credit Income Fund|oOpportunities Fund Common Shares|zes Fund Rights (expiring October 7, 2026) Rights|hHigh Income Opportunity Fund Common Stock, $0.01 par value, per share|hIncome Fund, Inc. Common Stock|hValue Fund, Inc. Common Stock|7New York AMT|gMunicipal Value Fund Common Stock|gQuality Municipal Income Fund Common Stock|7Preferred & Income Opportunities Fund|7Quality Municipal Income Fund Common Stock|7Real Asset Income and Growth Fund Common Shares of Beneficial Interest|cEstate Income Fund Common Shares of Beneficial Interest|7S&P 500 Dynamic Overwrite Fund|8elect Maturities Municipal Fund Common Stock|eTax Free Income Portfolio Common Stock|7Taxable Municipal Income Fund Common Shares of Beneficial Interest|7Variable Rate Preferred & Income Fund Common Shares|8irginia Quality Municipal Income Fund Common Stock|0O|1FG Bancorp Common Stock|1GE Energy Corp Common Stock|1NE Gas, Inc. Common Stock|3OK, Inc. Common Stock|1PENLANE, Inc. Common Stock|1R Royalties Inc. Common Shares|2IX Corporation American Depositary Shares|1UTFRONT Media Inc. Common Stock|1ccidental Petroleum Corporation Common Stock|xWarrants|2ean Capital Acquisition Corporation Ordinary Shares|zon Rights, each entitling the holder to receive one ordinary share|zon Warrants, each exercisable for one ordinary share|5aGold Corporation Common Shares|5eering International, Inc. Common Stock|2tave Specialty Group, Inc. Common Stock|1il|3 States International, Inc. Common Stock|1keanis Eco Tankers Corp. Common Stock|2lo Inc. Class A common stock|1ld Republic International Corporation Common Stock|2in Corporation Common Stock|1mega Healthcare Investors, Inc. Common Stock|2nicom Group Inc. Common Stock|1n Holding AG Class A Ordinary Shares|2ce Upon a Farm, PBC Common Stock|2e Liberty Properties, Inc. Common Stock|3Main Holdings, Inc. Common Stock|2ity Group Inc. Common Stock|2terris, Inc. Common Stock|3o Innovation Inc. Common Stock|1oma, Inc. Common Stock|1ppFi Inc. Class A Common Stock|3enheimer Holdings, Inc. Class A Common Stock (DE)|2timal Tax Managed Equity ETF|5um Communications, Inc. Class A common stock|1racle Corporation Common Stock|2chid Island Capital, Inc. Common Stock|2ganon & Co. Common Stock|2igin Bancorp, Inc. Common Stock|3on Group Holdings, Inc. Common|6Properties Inc. Common Stock|6S.A. Common Shares|2mat Technologies, Inc. Common Stock|1scar Health, Inc. Class A Common Stock|2hkosh Corporation (Holding Company)Common Stock|2isko Gold Group Inc. Common Shares|1tis Worldwide Corporation Common Stock|1vintiv Inc. (DE)|1wens Corning Inc Common Stock New|2let, Inc. Class A Common Stock|1xford Industries, Inc. Common Stock|0PACS Group, Inc. Common Stock|2R Technology Corporation Common Stock|1BF Energy Inc. Class A Common Stock|1CM Fund, Inc. Common Stock|1G&E Corp 6.000% Series A Mandatory Convertible Preferred Stock|2IM Global High Yield Fund, Inc.|5High Yield Bond Fund, Inc.|5Short Duration High Yield Opportunities Fund Common Shares|1HINIA Inc. Common Stock|1IMCO Access Income Fund Common Shares of Beneficial Interest|8tive Bond Exchange|6California Municipal Income Fund Common Stock|6Dynamic Income Fund Common Stock|lOpportunities Fund Common Shares of Beneficial Interest|lStrategy Fund Common Shares of Beneficial Interest|6Income Strategy Fund II|rShares of Beneficial Interest|6Strategic Income Fund, Inc.|1JT Partners Inc. Class A Common Stock|1LDT Inc. Sponsored ADR|1NC Financial Services Group, Inc. (The) Common Stock|1OSCO HOLDINGS INC. American Depositary Shares (Each representing 1/4th of a share of Common Stock)|1PG Industries, Inc. Common Stock|2L Corporation Common Stock|irporate Units|2lus Tr GSC|1ROG Holdings, Inc. Common Stock|1SQ Holdings, Inc. Class A Common Stock|1T Telekomunikasi Indonesia, Tbk|1VH Corp. Common Stock|1acific Gas & Electric Co. Common Stock|3kaging Corporation of America Common Stock|2gSeguro Digital Ltd. Class A Common Shares|3erDuty, Inc. Common Stock|2lmer Square Capital BDC Inc. Common Stock|2mpa Energia S.A.|2n American Silver Corp. Common Stock|2r Pacific Holdings, Inc. Common Stock|3k Aerospace Corp. Common Stock|5Hotels & Resorts Inc. Common Stock|4er|3nassus Core Select ETF|aValue Select ETF|3sons Corporation Common Stock|2ycom Software, Inc. Common Stock|3mentus Holdings, Inc. Class A Common Stock|3safe Limited Common Shares|1eabody Energy Corporation Common Stock|3rl Diver Credit Company Inc. 8.00% Series A Preferred Stock Due 2029|wCommon Stock|4son, Plc Common Stock|2bblebrook Hotel Trust 5.700% Series H Cumulative Redeemable Preferred Shares of Beneficial Interest|o6.3% Series F Cumulative Redeemable Preferred Shares of Beneficial Interest|r75% Series E Cumulative Redeemable Preferred Shares of Beneficial Interest|zes G Cumulative Redeemable Preferred Shares of Beneficial Interest|oCommon Shares of Beneficial Interest|2diatrix Medical Group, Inc. Common Stock|2lagos Insurance Capital Limited Common Shares|2mbina Pipeline Corp. Ordinary Shares (Canada)|2nnantPark Floating Rate Capital Ltd. 7.375% Notes Due 2031|ztd. Common Stock|cInvestment Corporation Common Stock|4yMac Financial Services, Inc. Common Stock|9Mortgage Investment Trust 6.75% Series C Cumulative Redeemable Preferred Shares of Beneficial Interest|z8.00% Series B Fixed|z8.125% Series A Fixed|z8.50% Senior Notes due 2028|z9.00% Senior Notes due 2030|zCommon Shares of Beneficial Interest|3ske Automotive Group, Inc. Common Stock|3tair plc. Ordinary Share|3umbra, Inc. Common Stock|2rfect Corp. Class A Ordinary Share|4ormance Food Group Company Common Stock|3imeter Solutions, SA Common Stock|3mRock Royalty Trust Units of Beneficial Interest|4ian Basin Royalty Trust Common Stock|8Resources Corporation Class A Common Stock|7ville Royalty Trust Units of Beneficial Interest|3rigo Company plc Ordinary Shares|3shing Square Inc. Common Stock|gUSA, Ltd. Common Shares|2troleo Brasileiro S.A. Petrobras ADS|zAmerican Depositary Shares representing Preferred Shares|1fizer, Inc. Common Stock|1hilip Morris International Inc Common Stock|4lips 66 Common Stock|2oenix Education Partners, Inc. Common Stock|8New Media Limited American Depositary Shares, each representing 48 Class A ordinary shares.|2reesia, Inc. Common Stock|1iedmont Realty Trust, Inc. Class A Common Stock|2mco Corporate & Income Opportunity Fund|pStrategy Fund Common Stock|6Global StocksPlus & Income Fund Common Shares of Beneficial Interest|6High Income Fund|6Municipal Income Fund II Common Shares of Beneficial Interest|6New York Municipal Income Fund II Common Shares of Beneficial Interest|2nnacle Acquisition Corporation Class A Ordinary Shares|xRights, each right entitling the holder to receive one|xUnits, each consisting of one Class A ordinary share and one right|9Financial Partners, Inc. Common stock|yFixed|zixed|9West Capital Corporation Common Stock|3terest, Inc. Class A Common Stock|2per Sandler Companies Common Stock|2tney Bowes Inc 6.70% Notes Due 2043|g. Common Stock|1lanet Fitness, Inc. Common Stock|7Labs PBC Class A Common Stock|2utonian Acquisition Corp II Class A Ordinary Shares|uRights, each entitling the holder to receive one|1olaris Inc. Common Stock|2rtland General Electric Co Common Stock|2st Holdings, Inc. Common Stock|4al Realty Trust, Inc. Class A Common Stock|1recision Drilling Corporation Common Stock|3sidio Production Company Class A Common Stock|4tige Consumer Healthcare Inc. Common Stock|2imerica, Inc. Common Stock|4o Brands Corporation Class A Common Stock|5ris Services Corporation Common Stock|3ncipal Real Estate Income Fund Common Shares of Beneficial Interest|3ority Income Fund, Inc. 6.375% Series L Term Preferred Stock Due 2029|r7.00% Series D Term Preferred Stock due 2029|v0% Series K Cumulative Preferred Stock|2oPetro Holding Corp. Common Stock|3core Technologies, Inc. Common Stock|4ter & Gamble Company (The) Common Stock|3gressive Corporation (The) Common Stock|3logis, Inc. Common Stock|3spect Capital Corporation 5.35% Series A Fixed Rate Cumulative Perpetual Preferred Stock|6rity Bancshares, Inc. Common Stock|3to Labs, Inc. Common stock|3vident Financial Services, Inc Common Stock|2udential Financial, Inc. 4.125% Junior Subordinated Notes due 2060|r5.625% Junior Subordinated Notes due 2058|t950% Junior Subordinated Notes due 2062|rCommon Stock|bPublic Limited Company Common Stock|1ublic Service Enterprise Group Incorporated Common Stock|8torage 6.000% Cumulative Preferred Shares of Beneficial Interest, Series U|zeferred Shares of beneficial interest, Series T|fCommon Stock|2lteGroup, Inc. Common Stock|2rsuit Attractions and Hospitality, Inc. Common Stock|1yrophyte Acquisition Corp. II Class A Ordinary Shares|vUnits, each consisting of one Class A ordinary share and one|0Q2 Holdings, Inc. Common Stock|1XO, Inc. Common Stock|1iagen N.V. Common Shares|1nity Electronics, Inc. Common Stock|1uad Graphics, Inc Class A Common Stock|3ker Houghton Common Stock|3nex Building Products Corporation Common Stock|4ta Services, Inc. Common Stock|5um Leap Acquisition Corp Class A Ordinary Shares|3sarEdge Acquisition Corporation Ordinary Shares|zRights to receive one|2est Diagnostics Incorporated Common Stock|1west Corporation 6.500% Senior Notes due 2051 (denominations of $25)|k750% Senior Notes due 2052 (denominations of $25)|0RB Global, Inc. Common Stock|2C Bearings Incorporated Common Stock|1ELX PLC PLC American Depositary Shares (Each representing One Ordinary Share)|2X American Resources Corporation|1H Common Stock|1LI Corp. Common Stock (DE)|2J Lodging Trust $1.95 Series A Cumulative Convertible Preferred Shares|iCommon Shares of Beneficial Interest $0.01 par value|2X Technology Inc. American Depositary Shares, each representing the right to receive one (1) Class A ordinary share|1PC, Inc. Common Stock|2M International Inc. Common Stock|1TX Corporation Common Stock|1XO, Inc. Common Stock|1adian Group Inc. Common Stock|2fael Holdings, Inc. Class B Common Stock|2lliant Corporation Common Stock|3ph Lauren Corporation Common Stock|2nge Resources Corporation Common Stock|5r Energy Services, Inc. Class A Common Stock|3pak Holdings Corp Class A Common Stock|2ymond James Financial, Inc. Common Stock|3onier Advanced Materials Inc. Common Stock|9Inc. REIT Common Stock|1eady Capital Corporation 6.25% Series C Cumulative Convertible Preferred Stock|s50% Series E Cumulative Redeemable Preferred Stock|q9.00% Senior Notes due 2029|qCommon Stock|3lty Income Corporation Common Stock|2ddit, Inc. Class A Common Stock|3wire Corporation Common Stock|4ood Trust, Inc. 10.00% Series A Fixed|k9.00% Senior Notes Due 2029|m125% Senior Notes Due 2029|zotes Due 2030|m500% Senior Notes Due 2030|m75% Senior Notes Due 2031|kCommon Stock|2formation Inc. Common Stock|2gal Rexnord Corporation Common Stock|3ional Management Corp. Common Stock|6s Financial Corporation Common Stock|uDepositary Shares Each Representing a 1/40th Interest in a Share of Non|zitary Shares, Each Representing a 1/40th Interest in a Share of 4.45% Non|zitary Shares, each Representing a 1/40th Interest in a Share of 5.700% Fixed|2insurance Group of America, Incorporated 7.125% Fixed|zporated Common Stock|2liance, Inc. Common Stock|2naissanceRe Holdings Ltd. Common Stock|4sant Corporation Common Stock|3tokil Initial plc American Depositary Shares (each representing five (5) Ordinary Shares)|2posiTrak, Inc. Common Stock|3ublic Services, Inc. Common Stock|2sMed Inc. Common Stock|3ideo Technologies, Inc. Common Stock|3olute Holdings Management Common Stock|3taurant Brands International Inc. Common Shares|2volve Group, Inc. Class A Common Stock|3vity, Inc. Common Stock|2xford Industrial Realty, Inc. 5.625% Series C Cumulative Redeemable Preferred Stock, par value $0.01 per share|y875% Series B Cumulative Redeemable Preferred Stock|wCommon Stock|1ice Acquisition Corporation 3 Class A Ordinary Shares|vUnits, each consisting of one Class A ordinary share, and one|2dgepost Capital, Inc. Class A Common Stock|2ngCentral, Inc. Class A Common Stock|2o Tinto Plc Common Stock|2skified Ltd. Class A Ordinary Shares|2thm Acquisition Corp. Class A Ordinary Shares|oUnits (each consists of one Class A Ordinary Share and one|6Capital Corp. 6.375% Series C Fixed|k7.00% Fixed|m125% Series B Fixed|m50% Series A Fixed|k8.75% Series E Fixed|o0% Series F Fixed|kCommon Stock|6Property Trust Inc. 9.875% Series C Fixed|qCommon stock|2verNorth Capital and Income Fund Common Stock|bFlexible Municipal Income Fund II, Inc. Common Stock|ze Fund, Inc. Common Stock|bManaged Duration Municipal Income Fund II, Inc. Common Stock|zal Income Fund, Inc. Common Stock|bOpportunistic Municipal Income Fund, Inc. Common Stock|kties Fund, Inc. 6.00% Series A Perpetual Preferred Stock|z Common Stock|a/DoubleLine Strategic Opportunity Fund, Inc. 4.375% Series A Cumulative Preferred Stock|zortunity Fund, Inc. 4.75% Series B Cumulative Preferred Stock|zortunity Fund, Inc. Common Stock|1obert Half Inc. Common Stock|3inhood Ventures Fund I Common Shares of Beneficial Interest|pI Common Shares of Beneficial Interest|3lox Corporation Class A Common Stock|2cket Companies, Inc. Class A Common Stock|4well Automation, Inc. Common Stock|2gers Communication, Inc. Common Stock|9rporation Common Stock|2llins, Inc. Common Stock|2yal Bank Of Canada Common Stock|6Caribbean Cruises Ltd. Common Stock|3ce Global Trust, Inc. Common Stock|6Micro|6Small|1ubrik, Inc. Class A Common Stock|2sh Street Interactive, Inc. Class A Common Stock|1yan Specialty Holdings, Inc. Class A Common Stock|2der System, Inc. Common Stock|2erson Holding Corporation Common Stock|2man Hospitality Properties, Inc. (REIT)|0S&P Global Inc. Common Stock|1AP SE ADS|1CE TRUST VI|5rust II Trust Preferred Securities|aVII 7.50% Trust Preference Securities|dI 6.95% Trust Preference Securities|1EACOR Marine Holdings Inc. Common Stock|2S AI Corporation Class A Common Stock|1FL Corporation Ltd|1ITE Centers Corp. Common Stock|1K Telecom Co., Ltd. Common Stock|1L Green Realty Corp Common Stock|koration Preferred Series I|2B Limited Common Shares|1M Energy Company Common Stock|1OS Limited Class A Ordinary Shares|1PX Technologies, Inc. Common Stock|1RH Total Return Fund, Inc. Common Stock|1TARWOOD PROPERTY TRUST, INC. Starwood Property Trust Inc.|2ERIS plc (Ireland) Ordinary Shares|2Microelectronics N.V. Common Stock|1aba Capital Income & Opportunities Fund II Shares of Beneficial Interest|z Fund SBI|3ine Royalty Trust Common Stock|3le Offshore Corp. Common Stock|2fe Bulkers, Inc Common Stock ($0.001 par value)|jumulative Redeemable Perpetual Preferred Series C (Marshall Islands)|iPerpetual Preferred Series D (Marshall Islands)|4guard Acquisition Corp. Class A Ordinary Shares|sUnits, each consisting of one Class A ordinary share and one|4hold Inc. New Common Stock|2lesforce, Inc. Common Stock|3ly Beauty Holdings, Inc. (Name to be changed from Sally Holdings, Inc.) Common Stock|2mos Energy Acquisition Corporation Class A Ordinary Shares|zn Units, each consisting of one Class A Ordinary Share and one|3sara Inc. Class A Common Stock|2n Juan Basin Royalty Trust Common Stock|3dRidge Energy, Inc. Common Stock|3tander Holdings USA, Inc. Depositary Shares, Each Representing a 1/1,000th Interest in a Share of Fixed|ztary Shares, Each Representing a 1/40th Interest in a Share of Fixed|2ratoga Investment Corp 7.50% Notes due 2031|p8.00% Notes due 2027|zs due 2031|r125% Notes due 2027|r50% Notes due 2028|pNew|2sol Ltd. American Depositary Shares|2ul Centers, Inc. Common Stock|2vers Value Village, Inc. Common Stock|1chneider National, Inc. Common Stock|2orpio Tankers Inc. Common Shares|3tts Miracle|2ully Royalty Ltd.|1ea Limited American Depositary Shares, each representing one Class A Ordinary Share|3bridge Gold, Inc. Common Shares New|3drill Limited Common Shares|3peak LLC 8.50% Series B Fixed|c9.00% Series A Cumulative Redeemable Perpetual Preferred Units|4ort Entertainment Group Inc. Common Stock|2curitize Corp. Common Stock|2lect Water Solutions, Inc. Class A common stock|6Quote, Inc. Common Stock|2nsata Technologies Holding plc Ordinary Shares|4ient Technologies Corporation Common Stock|3tinelOne, Inc. Class A Common Stock|2quans Communications S.A. American Depositary Shares (each representing one hundred (100) Ordinary Shares)|2ritage Growth Properties 7.00% Series A Cumulative Redeemable Preferred Shares of Beneficial Interest|rClass A Common Stock|3vice Corporation International Common Stock|7Now, Inc. Common Stock|5sFirst Bancshares, Inc. Common Stock|1hake Shack, Inc. Class A Common Stock|3rkNinja, Inc. Ordinary Shares|2ell PLC American Depositary Shares (each representing two (2) Ordinary Shares)|3rwin|2ift4 Payments, Inc. 6.00% Series A Mandatory Convertible Preferred Stock|mClass A Common Stock|3nhan Financial Group Co Ltd American Depositary Shares|2oulder Innovations, Inc. Common Stock|2reya Acquisition Group Class A Ordinary Shares|pRights, each entitling the holder to receive one|2utterstock, Inc. Common Stock|1ignet Jewelers Limited Common Shares|2lgan Holdings Inc. Common Stock|3verBox Corp V Class A Ordinary Shares|hUnits, each consisting of one Class A Ordinary Share and one|2milarweb Ltd. Ordinary Shares|3on Property Group, Inc. Common Stock|rSimon Property Group 8 3/8% Series J Cumulative Redeemable Preferred Stock|3pson Manufacturing Company, Inc. Common Stock|2nda Ltd. Common Stock|2riusPoint Ltd. Common Shares|2teOne Landscape Supply, Inc. Common Stock|2x Flags Entertainment Corporation Common Stock New|3th Street Specialty Lending, Inc. Common Stock|1keena Resources Limited Common Shares|2illsoft Corp. Class A Common Stock|2y Harbour Group Corporation Class A Common Stock|1martFinancial, Inc. Common Stock|5Rent, Inc. Class A Common Stock|5Stop Self Storage REIT, Inc. Common Stock|2ith & Nephew SNATS, Inc. Common Stock|6Douglas Homes Corp. Class A Common Stock|2urfit WestRock plc Ordinary Shares|1nap|4 Inc. Class A Common Stock|2owflake Inc. Common Stock|1ociedad Quimica y Minera S.A. Common Stock|2laris Energy Infrastructure, Inc. Class A Common Stock|3ventum Corporation Common Stock|2mnigroup International Inc. Common Stock|2nic Automotive, Inc. Common Stock|4da Senior Living, Inc. Common Stock|3oco Products Company Common Stock|3y Group Corporation American Depositary Shares|2ulpower Acquisition Corporation Class A Ordinary Shares|yRights, each right entitling the holder to receive one|yUnits, each consisting of one Class A ordinary share and one right|3nd Enhanced Fixed Income ETF|7quity Dividend Income ETF|6Point Meridian Capital, Inc. 7.875% Series B Preferred Shares due 2030|z8.00% Series A Preferred Shares Due 2029|zCommon Stock|3rce Capital, Inc. Cmn Shs of BI|3th Bow Corporation Common Shares|5State Bank Corporation Common Stock|5ern Company (The) 2025 Series A Corporate Units|nCommon Stock|nSeries 2017B 5.25% Junior Subordinated Notes due December 1, 2077|w20A 4.95% Junior Subordinated Notes due January 30, 2080|yC 4.20% Junior Subordinated Notes due October 15, 2060|x5A 6.50% Junior Subordinated Notes due March 15, 2085|bpper Corporation Common Stock|5port Acquisition Corp. II Units, each consisting of one Class A ordinary share and one|5side Bancshares, Inc. Common Stock|5west Airlines Company Common Stock|aGas Holdings, Inc. Common Stock (DE)|1pecial Opportunities Fund Inc. 2.75% Convertible Preferred Stock, Series C|q, Inc Common Stock|4trum Brands Holdings, Inc. Common Stock|2here Entertainment Co. Class A Common Stock|2ire Global, Inc. Class A Common Stock|6Inc. 6.375% Junior Subordinated Notes due 2086|bCommon Stock|2otify Technology S.A. Ordinary Shares|2rinklr, Inc. Class A Common Stock|3ott Inc. Common Shares|3uce Power Holding Corporation Class A Common Stock|1t. Joe Company (The) Common Stock|2ag Industrial, Inc. Common Stock|3ndard Motor Products, Inc. Common Stock|9Nuclear, Inc. Class A Common Stock|8Aero, Inc. Common Stock|5ex International Corporation Common Stock|4ley Black & Decker, Inc. Common Stock|4tec Inc Common Stock|3r Group L.P. Common Stock|4link AI Acquisition Corporation Ordinary Shares|z Rights, each entitling the holder to receive one|z Units, each consisting of one Ordinary Share, and one Right to receive one|3te Street Corporation Common Stock|pDepositary shares, each representing a 1/4,000th ownership interest in a share of Fixed|dPrime Money Market ETF|2ellantis N.V. Common Shares|5us Capital Investment Corporation Common Stock|3m, Inc. Class A Common Stock|3pan Company Common Stock|3vanato Group S.p.A. Ordinary Shares|3wart Information Services Corporation Common Stock|2ifel Financial Corporation 5.20% Senior Notes due 2047|tCommon Stock|tDepositary Shares, Each Representing 1/1,000th Interest in a Share of 4.50% Non|ztary Shares, Each Representing 1/1,000th Interest in a Share of 6.25% Non|2oneridge, Inc. Common Stock|2ride, Inc. Common Stock|4ve 1000 Dividend Growth ETF|cGrowth ETF|cValue ETF|7500 ETF|7Emerging Markets Ex|8nhanced Income Short Maturity ETF|7Natural Resources and Security ETF|7Small|7Total Return Bond ETF|7U.S. Energy ETF|cSemiconductor ETF|3uctured Products Corp 8.205% CorTS 8.205% Corporate Backed Trust Securities (CorTS)|9s Products Cp 8% CorTS Issued by Peco Energy Cap Tr II Preferred Stock|3yker Corporation Common Stock|2ubHub Holdings, Inc. Class A Common Stock|3dio City International Holdings Limited American depositary shares, each representing four Class A ordinary shares|3rm, Ruger & Company, Inc. Common Stock|1uburban Propane Partners, L.P. Common Stock|2mitomo Mitsui Financial Group Inc Unsponsored American Depositary Shares (Japan)|3mit Hotel Properties, Inc. 5.875% Series F Cumulative Redeemable Preferred Stock, $0.01 par value per share|u6.250% Series E Cumulative Redeemable Preferred Stock|uCommon Stock|7Midstream Corporation Common Stock|2n Communities, Inc. Common Stock|4Life Financial Inc. Common Stock|3Coke Energy, Inc. Common Stock|3belt Rentals Holdings, Inc. Common Stock|3cor Energy Inc. Common Stock|3lands Technology Group American Depositary Shares, representing Class A ordinary shares|3shine Silver Mining & Refining Company Common Stock|4tone Hotel Investors, Inc. 5.70% Series I Cumulative Redeemable Preferred Stock|v6.125% Series H Cumulative Redeemable Preferred Stock|vSunstone Hotel Investors, Inc. Common Shares|2per Group (SGHC) Limited Ordinary Shares|2rf Air Mobility Inc. Common Stock|2zano S.A. American Depositary Shares (each representing One Ordinary Share)|1weetgreen, Inc. Class A Common Stock|1ylvamo Corporation Common Stock|2nchrony Financial Common Stock|kDepositary Shares Each Representing a 1/40th Interest in a Share of 8.250% Fixed Rate Reset Non|zes, each Representing a 1/40th Interest in a Share of 5.625% Fixed Rate Non|3thetic Fixed|f|f|f|2sco Corporation Common Stock|3tem1, Inc. Class A Common Stock|0T1 Energy Inc. Common Stock|1AL Education Group American Depositary Shares|1C Energy Corporation Common Stock|2W AAA CLO ETF|4Core Plus Bond ETF|7porate Bond ETF|4Flexible Income ETF|4High Yield Bond ETF|4Multisector Credit Income ETF|4Senior Loan ETF|5trategic Income Fund, Inc. Common Stock|1D SYNNEX Corporation Common Stock|1E Connectivity plc Ordinary Shares|1FI International Inc. Common Shares|1GE Value Creative Solutions Corp Class A Ordinary Shares|yUnits, each consisting of one Class A ordinary share and one|1HOR AdaptiveRisk Dynamic ETF|5Equal Weight Low Volatility ETF|5Index Rotation ETF|1IC Solutions, Inc. Common Stock|2M S.A. American Depositary Shares (Each representing 5 Common Shares)|1JX Companies, Inc. (The) Common Stock|1KO Group Holdings, Inc. Class A Common Stock|1PG Mortgage Investment Trust, Inc. 8.00% Series B Cumulative Redeemable Preferred Stock|z 8.00% Series C Fixed|z 8.25% Series A Cumulative Redeemable Preferred Stock|z 9.500% Senior Notes due 2029|z Common Stock|4RE Finance Trust, Inc. 6.25% Series C Cumulative Redeemable Preferred Stock, $0.001 par value per share|rCommon Stock|1XNM Energy, Inc. Common Stock|2O Partners, L.P. Common Units Representing Limited Partner Interests|1aiwan Fund, Inc. (The) Common Stock|7Semiconductor Manufacturing Company Ltd.|2keda Pharmaceutical Company Limited American Depositary Shares (each representing 1/2 of a share of Common Stock)|2los Energy, Inc. Common Stock|2mboran Resources Corporation Common stock|2nger Inc. Common Stock|2pestry, Inc. Common Stock|2rga Resources, Inc. Common Stock|4et Corporation Common Stock|1eam, Inc. Common Stock|2chnipFMC plc Ordinary Share|3k Resources Ltd Ordinary Shares|3noglass Holdings Inc. Common Stock|2ekay Corporation Ltd. Common Stock|7Tankers Ltd.|2jon Ranch Co Common Stock|2ladoc Health, Inc. Common Stock|3ecom Argentina SA|4dyne Technologies Incorporated Common Stock|4flex Incorporated Common Stock|5onica Brasil S.A. American Depositary Shares (Each representing One Common Share)|4phone and Data Systems, Inc. Common Shares|3us Corporation Ordinary Shares|2mpleton Dragon Fund, Inc. Common Stock|aEmerging Markets Fund Common Stock|rIncome Fund, Inc. Common Stock|2naris S.A. American Depositary Shares|3cent Music Entertainment Group American Depositary Shares, each representing two Class A Ordinary Shares|3et Healthcare Corporation Common Stock|3nant Company Common Stock|4essee Valley Authority|q Common Stock|2radata Corporation Common Stock|3ex Corporation Common Stock|3nium S.A. Ternium S.A. American Depositary Shares (each representing ten shares, USD1.00 par value)|3ra Property Trust, Inc. 7.00% Senior Secured Notes due 2029|4eno Realty Corporation Common Stock|2tra Technologies, Inc. Common Stock|2va Pharmaceutical Industries Limited Ordinary Shares|2xas Capital Government Money Market ETF|6Pacific Land Corporation Common Stock|3tron Inc. Common Stock|1he AES Corporation Common Stock|4Bank of New York Mellon Corporation Common Stock|4Central and Eastern Europe Fund, Inc. (The) Common Stock|5harles Schwab Corporation Depositary Shares each representing 1/40th interest in a share of 5.95% Non|zsitary Shares, Each Representing a 1/40th Interest in a Share of 4.450% Non|5igna Group Common Stock|4European Equity Fund, Inc. Common Stock|4Frontier Economic Fund|4Gabelli Dividend & Income Trust 4.250% Series K Cumulative Preferred Shares|z 5.375% Series H Cumulative Preferred Shares|cHealthcare & Wellness Trust Common Shares of Beneficial Interest|5eneration Essentials Group Class A Ordinary Shares|4Hartford Insurance Group, Inc. Common Stock|zDepositary Shares each representing a 1/1000th interest in a share of 6.000% Non|5ershey Company Common Stock|4J.M. Smucker Company Common Stock|4Kraft Heinz Company Common Stock|4Magnum Ice Cream Company N.V. Ordinary Shares|4Travelers Companies, Inc. Common Stock|3rmo Fisher Scientific Inc Common Stock|2ird Coast Bancshares, Inc. Common Stock|2or Industries, Inc. Common Stock|1idewater Inc. Common Stock|2lly's, Inc. Common Stock|2mken Company (The) Common Stock|2tan America SA Common Shares|6International, Inc. (DE) Common Stock|1oast, Inc. Class A Common Stock|2ll Brothers, Inc. Common Stock|2otsie Roll Industries, Inc. Common Stock|2ro Company (The) Common Stock|4nto Dominion Bank (The) Common Stock|3rid Holdings Inc. Common Stock|3toise AI Infrastructure ETF|9Electrification Infrastructure ETF|anergy ETF|gInfrastructure Corporation Common Stock|9Global Water ETF|9North American Pipeline ETF|2tal Return Securities Fund Common Stock|5Energies SE Ordinary Shares|2wnsquare Media, Inc. Class A Common Stock|2yota Motor Corporation Common Stock|1raeger, Inc. Common Stock|3ne Technologies plc|4sAlta Corporation Ordinary Shares|5Canada PipeLines Limited 6.250% Junior Subordinated Notes due 2085|5Union Common Stock|5continental Realty Investors, Inc. Common Stock|5digm Group Incorporated Common Stock|5ocean Ltd (Switzerland) Common Stock|5portadora de Gas del Sur SA TGS Common Stock|3vel Leisure Co. Common Stock|2edegar Corporation Common Stock|3x Company, Inc. Common Stock|2i Continental Corporation Preferred Stock|3Net Group, Inc. Common Stock|3nity Capital Inc. 7.875% Notes due 2029|lCommon Stock|8Industries, Inc. Common Stock|3ple Flag Precious Metals Corp. Common Shares|6Point Venture Growth BDC Corp. Common Stock|3ton International Limited 5.75% Series E Cumulative Redeemable Perpetual Preference Shares|t6.875% Series D Cumulative Redeemable Perpetual Preference Shares|t7.375% Series C Cumulative Redeemable Perpetual Preference Shares|v500% Series G Cumulative Redeemable Perpetual Preference Shares|v625% Series F Cumulative Redeemable Perpetual Preference Shares|t8.00% Series B Cumulative Redeemable Perpetual Preference Shares|v50% Series A Cumulative Redeemable Perpetual Preference Shares|3umph Financial, Inc. Depositary Shares, Each Representing a 1/40th Interest in a Share of 7.125% Series C Fixed|2onox Holdings plc Ordinary Shares (UK)|2ueBlue, Inc. Common Stock|3ist Financial Corporation Common Stock|tDepositary Shares|ztary Shares, Each Representing a 1/1,000th Interest in a Share of Series O Non|ztary Shares, each representing 1/1,000th interest in a share of Series R Non|3lieve Cannabis Corp. Subordinate Voting Shares|1sakos Energy Navigation Ltd Common Shares|tSeries E Fixed|z F Fixed|1urkcell Iletisim Hizmetleri AS Common Stock|3ning Point Brands, Inc. Common Stock|2tor Perini Corporation Common Stock|2ya Inc. American Depositary Shares, each representing one Class A Ordinary Share|1wenty One Capital, Inc. Class A Common Stock|2ilio Inc. Class A Common Stock|1yler Technologies, Inc. Common Stock|2son Foods, Inc. Common Stock|0U|1.S. Bancorp Common Stock|dDepositary Shares each representing a 1/1,000th interest in a share of Series K Non|vrepstg 1/1000th Pfd Ser B|u, Each Representing a 1/1,000th Interest in a Share of Series L Non|zh Representing a 1/1,000th Interest in a Share of Series M Non|zh representing a 1/100th interest in a share of Series A Non|weach representing a 1/1,000th interest in a share of Series O Non|5Physical Therapy, Inc. Common Stock|1BS Group AG Registered Ordinary Shares|1DR, Inc. Common Stock|1GI Corporation Common Stock|1L Solutions Inc. Class A Common Stock|1MH Properties, Inc. 6.375% Series D Cumulative Redeemable Preferred Stock, Liquidation Preference $25 per share|lCommon Stock|1NITIL Corporation Common Stock|3VERSAL INSURANCE HOLDINGS INC Common Stock|1S Foods Holding Corp. Common Stock|2A TODAY Co., Inc. Common Stock|3NA Health Sciences, Inc. Common Stock|1WM Holdings Corporation Class A Common Stock|pRights (November 12, 2026) Rights when issued|1ber Technologies, Inc. Common Stock|2iquiti Inc. Common Stock|1iPath, Inc. Class A Common Stock|1ltrapar Participacoes S.A. (New) American Depositary Shares (Each representing one Common Share)|1nder Armour, Inc. Class A Common Stock|pC Common Stock|2ifi, Inc. New Common Stock|5rst Corporation Common Stock|3lever PLC American Depositary Shares (each representing One Ordinary Share)|3on Pacific Corporation Common Stock|3sys Corporation New Common Stock|3ted Community Banks, Inc. Common Stock|7Microelectronics Corporation (NEW) Common Stock|7Natural Foods, Inc. Common Stock|7Parcel Service, Inc. Common Stock|aks & Resorts Inc. Common Stock|7Rentals, Inc. Common Stock|7States Antimony Corporation Common Stock|6Health Group Incorporated Common Stock (DE)|4y Software Inc. Common Stock|3versal Corporation Common Stock|aHealth Realty Income Trust Common Stock|hServices, Inc. Common Stock|aTechnical Institute Inc Common Stock|2limited HFEQ Equity Long/Short ETF|cGM Global Macro ETF|cMF Managed Futures ETF|cND Multi|2um Group 6.250% Junior Subordinated Notes due 2058|bCommon Stock|1rban Edge Properties Common Shares of Beneficial Interest|1tz Brands Inc Class A Common Stock|0V.F. Corporation Common Stock|12X, Inc. Common Stock|1AALCO Energy, Inc. Common Stock|2LE S.A. American Depositary Shares Each Representing one common share|1ICI Properties Inc. Common Stock|1OC Energy Trust Units of Beneficial Interest|1TEX Class A Common Shares|1ail Resorts, Inc. Common Stock|2laris Limited Common Shares|gWarrants|3ens Semiconductor Ltd. Ordinary Shares|4ro Energy Corporation Common Stock|3hi, Inc. Common Stock|3mont Industries, Inc. Common Stock|3voline Inc. Common Stock|1eeva Systems Inc. Class A Common Stock|2locity Financial, Inc. Common Stock|2ntas, Inc. Common Stock|4ure Global, Inc. Class A common stock|2radermics, Incorporated Common Stock|4lto Corp Common Stock|3izon Communications Inc. Common Stock|3milion Energy Inc. Common (Canada)|3nal Capital Acquisition Corp. Ordinary Shares|xRights, each right entitling the holder to receive one|xUnits, each consisting of one ordinary share and one right|3sigent PLC Ordinary Shares|3tical Aerospace Ltd. Ordinary Shares|5v Holdings, LLC Class A Common Stock|2stis Corporation Common Stock|1ia Transportation, Inc. Class A Common Stock|2ctorias Secret & Co. Common Stock|2king Acquisition Corp. II Class A Ordinary Shares|sUnits, each consisting of one Class A ordinary share and one|sWarrants to purchase one Class A Ordinary Share|7Holdings Ltd Ordinary Shares|2pshop Holdings Limited American Depositary Shares, each representing two ordinary shares|2rgin Galactic Holdings, Inc. Common Stock|3tu Financial, Inc. Class A Common Stock|5s Artificial Intelligence & Technology Opportunities Fund Common Shares of Beneficial Interest|7Convertible & Income Fund 5.625% Series A Cumulative Preferred Shares|xCommon Shares of Beneficial Interest|xII 5.50% Series A Cumulative Preferred Shares|z Common Shares of Beneficial Interest|7Diversified Income & Convertible Fund Common Shares of Beneficial Interest|aidend, Interest & Premium Strategy Fund Common Shares of Beneficial Interest|7Equity & Convertible Income Fund Common Shares of Beneficial Interest|7Global Multi|7Investment Partners, Inc. Common Stock|7Stone Harbor Emerging Markets Income Fund Common Shares of Beneficial Interest|7Total Return Fund Inc.|2sa Inc.|3hay Intertechnology, Inc. Common Stock|7Precision Group, Inc. Common Stock|3ta Energy S.A.B. de C.V. American Depositary Shares, each representing one series A share, with no par value|4ra Corp. Common Stock|2tesse Energy, Inc. Common Stock|2vmark Residential Common Shares of Beneficial Interest|1ontier Corporation Common Stock|2rnado Realty Trust 4.45% Series O Cumulative Redeemable Preferred Shares, Liquidation Preference $25.00 Per Share|lCommon Stock|lPfd Ser L %|2ya Emerging Markets High Income Dividend Equity Fund Common Shares|5Financial, Inc. Common Stock|lDepositary Shares, each representing a 1/40th interest in a share of 5.35% Fixed|5Global Advantage and Premium Opportunity Fund Common Shares of Beneficial Interest|cEquity Dividend and Premium Opportunity Fund|5Infrastructure, Industrials and Materials Fund Common Shares of Beneficial Interest|4ger Technologies, Inc. Class A Common Stock|1ulcan Materials Company (Holding Company) Common Stock|1ylor Inc. Common Stock|0W&T Offshore, Inc. Common Stock|1. P. Carey Inc. REIT|2R. Berkley Corporation 4.125% Subordinated Debentures due 2061|r25% Subordinated Debentures due 2060|p5.10% Subordinated Debentures due 2059|r70% Subordinated Debentures due 2058|pCommon Stock|2W. Grainger, Inc. Common Stock|1BI Power Factor High Dividend ETF|1EC Energy Group, Inc. Common Stock|2SCO International, Inc. Common Stock|2X Inc. common stock|1PP plc American Depositary Shares|1abash National Corporation Common Stock|2lker & Dunlop, Inc Common Stock|3lbox N.V. Class A Ordinary Shares|3t Disney Company (The) Common Stock|2rby Parker Inc. Class A Common Stock|3rior Met Coal, Inc. Common Stock|2ste Connections, Inc. Common Shares|6Management, Inc. Common Stock|2terBridge Infrastructure LLC Class A Shares Representing Limited Liability Company Interests|5drop Inc. American Depositary Shares (each representing the right to receive 10 Class A Ordinary Shares)|5s Corporation Common Stock|3sco, Inc. Class B Common Stock|eommon Stock|3ts Water Technologies, Inc. Class A Common Stock|2yfair Inc. Class A Common Stock|1ealthTrust DBS Long Term Growth ETF|3ve Communications, Inc. Common Stock|2is Markets, Inc. Common Stock|2lls Fargo & Company 7.50% Non|mCommon Stock|mDepositary Shares, each representing a 1/1,000th interest in a share of Non|zares, each representing a 1/1,000th interest in a share of Non|zares, each representing a 1/1,000th interest in a share of Non|zares, each representing a 1/1,000th interest in a share of Non|4tower Inc. Common Stock|2st Enclave Merger Corp. Ordinary Shares|qRights, each Right to acquire one|qUnits, each consisting of one Ordinary Share and one Right to acquire one|5Fraser Timber Co. Ltd Common stock|5Pharmaceutical Services, Inc. Common Stock|4ern Alliance Bancorporation Common Stock (DE)|wDepositary Shares, Each Representing a 1/400th Interest in a Share of 4.250% Fixed|9sset Bond Fund Share of Beneficial Interest|eDiversified Income Fund Common Shares of Beneficial Interest|eEmerging Markets Debt Fund Inc Common Stock|eGlobal Corporate Opportunity Fund Inc. Common Stock|lHigh Income Fund Inc Common Stock|eHigh Income Fund II Inc. Common Stock|qOpportunity Fund, Inc. Common Stock|jYield Opportunity Fund Inc. Common Stock|eInflation|gtermediate Muni Fund Inc Common Stock|gvestment Grade Income Fund Inc.|vOpportunity Trust Inc. Common Stock|eManaged Municipals Fund, Inc. Common Stock|fortgage Opportunity Fund Inc. Common Stock|funicipal High Income Fund, Inc. Common Stock|8Midstream Partners, LP Common Units Representing Limited Partner Interests|8Union Company (The) Common Stock|4inghouse Air Brake Technologies Corporation Common Stock|4lake Chemical Partners LP Common Units representing limited partner interests|aorporation Common Stock|4wood Holdings Group Inc Common Stock|9Salient Enhanced Midstream Income ETF|2yerhaeuser Company Common Stock|1heaton Precious Metals Corp Common Shares (Canada)|3els Up Experience Inc. Class A Common Stock|2irlpool Corporation Common Stock|3te Mountains Insurance Group, Ltd. Common Stock|6Pearl Acquisition Corp. Class A Ordinary Shares|uRights, each right entitles the holder to receive one|uUnits, each consisting of one Class A ordinary share and one right to receive one|5Hawk Minerals Corp Class A Common Stock|1illiams|8 Companies, Inc. (The) Common Stock|2nnebago Industries, Inc. Common Stock|2pro Limited Common Stock|2sdomTree, Inc. Common Stock|1olfspeed, Inc. Common Stock New|3verine World Wide, Inc. Common Stock|2odside Energy Group Limited American Depositary Shares, each representing one Ordinary Share|3ri Financial Group Inc. American Depositary Shares (each representing three (3) shares of Common Stock)|2rkiva Inc. Class A Common Stock|3ld Kinect Corporation Common Stock|3thington Enterprises, Inc. Common Shares|cSteel, Inc. Common Shares|1yndham Hotels & Resorts, Inc. Common Stock|0X Financial American Depositary Shares, each representing six Class A Ordinary Shares|1AI Floating Rate & Alternative Income Trust Common Shares of Beneficial Interest|4Madison Equity Premium Income Fund Common Shares|1FLH Capital Corporation Ordinary Shares|pRights to receive one|pUnits, each consisting of one Ordinary Share and one Right|1PLR Infrastructure, LP Common Units representing limited partner interests|2O, Inc. Common Stock|2eng Inc. American depositary shares, each representing two Class A ordinary shares|1enia Hotels & Resorts, Inc. Common Stock|1peri Inc. Common Stock|2onential Fitness, Inc. Class A Common Stock|1tend AI Robotics, Inc. Common Stock|1ylem Inc. Common Stock New|0YETI Holdings, Inc. Common Stock|1PF Sociedad Anonima American Depositary Shares|1alla Group Limited American Depositary Shares, each representing one Class A Ordinary Share|2tsen Holding Limited American Depositary Shares, each representing twenty (20) Class A Ordinary Shares|1elp Inc. Common Stock|2xt, Inc. Common Stock|1iren Digital Ltd. American Depositary Shares, each representing two ordinary shares|1ork Space Systems Inc. Common Stock|2udao, Inc. American Depositary Shares, each representing one Class A Ordinary Share|1um China Holdings, Inc. Common Stock|3! Brands, Inc.|0ZIM Integrated Shipping Services Ltd. Ordinary Shares|1KH Group Limited American Depositary Shares, each representing thirty|1TO Express (Cayman) Inc. American Depositary Shares, each representing one Class A ordinary share.|1epp Health Corporation American depositary shares, each representing sixteen Class A ordinary shares|2ta Global Holdings Corp. Class A Common Stock|2via PBC Class A Common Stock|1hihu Inc. American Depositary Shares, each representing three (3) Class A Ordinary Shares|1immer Biomet Holdings, Inc. Common Stock|2pRecruiter, Inc. Class A Common Stock|1oetis Inc. Class A Common Stock|1urn Elkay Water Solutions Corporation Common Stock|0a.k.a. Brands Holding Corp. Common Stock|1brdn Global Dynamic Dividend Fund Common Shares of Beneficial Interest|dInfrastructure Income Fund Common Shares of Beneficial Interest|zFund Rights (expiring October 15, 2026) Rights|dPremier Properties Fund Common Shares of Beneficial Interest|6Healthcare Investors Shares of Beneficial Interest|hOpportunities Fund Shares of Beneficial Interest|6Income Credit Strategies Fund 5.250% Series A Perpetual Preferred Stock|z Common Shares|6Life Sciences Investors Shares of Beneficial Interest|6Total Dynamic Dividend Fund Common Shares of Beneficial Interest|6World Healthcare Fund Shares of Beneficial Interest|1gilon health, inc. Common Stock|0e.l.f. Beauty, Inc. Common Stock|0iHuman Inc. American depositary shares, each representing five Class A ordinary shares|1Shares 0|8Government Money Market ETF|8Prime Money Market ETF|0loanDepot, Inc. Class A Common Stock|0nVent Electric plc Ordinary Shares","sep":"|"}]}]);
const COLONY = [
{"id":"n-235de182","guard":[["not",["hasAny",["2","abx","acn","acsg","adx","aexa","afl","aggregate","aimanaged","ainp","ajg","alit","asc","awr","bac","back","bamg","bbbb","bbwi","bby","be","bepi","bessw","bgsf","bhk","blsh","blw","bmy","bnl","bondbloxx","brol","bsx","bti","buffer","buildabear","by","c","cal","cbox","cdrb","chmi","cigc","cldt","cms","cnf","cnmd","cnne","cof","comp","cop","copl","crl","crm","cvm","dbo","dfh","dg","dgja","dis","dlrk","dow","dram","drd","dsep","dsl","dsx","ebf","edn","eme","emr","ese","evn","evr","evsb","ew","ewh","exus","f","fdg","fdx","febm","ferg","fhi","fixedtofloating","fjan","fms","foil","for","fpi","fr","frt","ftv","fvr","fxed","gabh","gco","gd","gdvk","gev","gjt","glopc","glw","gs","gvi","hca","heroes","hfsi","hfxi","higg","highyield","hims","hold","hql","hsbc","hvt","id","idjn","innf","ip","iqv","ivov","ivrc","jhac","jpmc","kcsh","kkr","kn","kos","listed","location","longterm","lvln","manu","manufacturer","matv","mco","mcy","mete","mfa","mgy","mhf","midcap","mms","mpa","mpwx","mrp","mufg","mux","mye","nad","nasdaq","nbce","nfly","npo","nrdy","nusc","oec","ofg","ohi","oke","omfs","onez","orn","osg","pai","pbib","pcor","pdcc","pffa","pfs","phg","phm","picnic","pjun","pmtb","poll","pru","psf","pty","qspt","rblx","rdw","rexrc","rhld","ricoh","rmt","rpt","rvi","rwr","saba","sbh","scjn","sdrl","sds","sixd","sjm","ske","snush","solv","spxx","sre","ssl","stew","stxd","stz","sun","sunb","syf","symbol","tblu","tcbx","tdf","tdw","tdy","ticker","tlys","tmo","tpr","trades","uan","unp","usbp","usrt","uvv","vac","val","via","vici","wat","wd","wes","wfcy","winn","wiw","wly","wm","wpp","xflhr","xflt","xph","xvgl","year","zbh","zvia"]]]],"pyramid":["render.template",{"lit":["The company ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"company"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-nyse-other-listings-nyse-listed-69e6d6"},{"lit":"act symbol"}],{"lit":1}],{"lit":"fr-nyse-other-listings-nyse-listed-69e6d6"},{"lit":"act symbol"},{"lit":"company name"}]],"mem":null},
{"id":"n-963fa5de","guard":[["has","company"],["has","of"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the company name of TRAD.R":"The company name of TRAD.R is APEX Tech Acquisition Inc. Rights, each entitling the holder to receive one.","tell me the company name of HCXY":"The company name of HCXY is Hercules Capital, Inc. 6.25% Notes due 2033.","name the company name of CUBI":"The company name of CUBI is Customers Bancorp, Inc Common Stock.","what is the company name of BLND":"The company name of BLND is Blend Labs, Inc. Class A Common Stock.","tell me the company name of FMX":"The company name of FMX is Fomento Economico Mexicano S.A.B. de C.V. Common Stock.","name the company name of MPLX":"The company name of MPLX is MPLX LP Common Units Representing Limited Partner Interests.","what is the company name of WS":"The company name of WS is Worthington Steel, Inc. Common Shares.","tell me the company name of JOE":"The company name of JOE is St. Joe Company (The) Common Stock.","name the company name of MOG.A":"The company name of MOG.A is Moog Inc. Class A Common Stock.","what is the company name of MNTN":"The company name of MNTN is MNTN, Inc. Class A Common Stock.","tell me the company name of BGT":"The company name of BGT is BlackRock Floating Rate Income Trust.","name the company name of BHE":"The company name of BHE is Benchmark Electronics, Inc. Common Stock.","what is the company name of OGE":"The company name of OGE is OGE Energy Corp Common Stock.","tell me the company name of MTG":"The company name of MTG is MGIC Investment Corporation Common Stock.","name the company name of RLI":"The company name of RLI is RLI Corp. Common Stock (DE).","what is the company name of TECK":"The company name of TECK is Teck Resources Ltd Ordinary Shares.","tell me the company name of AERO":"The company name of AERO is Grupo Aeromexico, S.A.B. de C.V. American Depositary Shares (each representing ten (10) Common Shares).","name the company name of FCN":"The company name of FCN is FTI Consulting, Inc. Common Stock.","what is the company name of WRB$E":"The company name of WRB$E is W.R. Berkley Corporation 5.70% Subordinated Debentures due 2058.","tell me the company name of L":"The company name of L is Loews Corporation Common Stock.","name the company name of SW":"The company name of SW is Smurfit WestRock plc Ordinary Shares.","what is the company name of FSK":"The company name of FSK is FS KKR Capital Corp. Common Stock.","tell me the company name of CURB":"The company name of CURB is Curbline Properties Corp. Common Stock.","name the company name of IBP":"The company name of IBP is Installed Building Products, Inc. Common Stock.","what is the company name of SPME":"The company name of SPME is Sound Point Meridian Capital, Inc. 7.875% Series B Preferred Shares due 2030.","tell me the company name of CMSD":"The company name of CMSD is CMS Energy Corporation 5.875% Junior Subordinated Notes due 2079.","name the company name of WRB$H":"The company name of WRB$H is W.R. Berkley Corporation 4.125% Subordinated Debentures due 2061.","what is the company name of NIM":"The company name of NIM is Nuveen Select Maturities Municipal Fund Common Stock.","tell me the company name of SPH":"The company name of SPH is Suburban Propane Partners, L.P. Common Stock.","name the company name of PRKS":"The company name of PRKS is United Parks & Resorts Inc. Common Stock.","what is the company name of GIL":"The company name of GIL is Gildan Activewear, Inc. Class A Sub. Vot. Common Stock.","tell me the company name of OXY":"The company name of OXY is Occidental Petroleum Corporation Common Stock.","name the company name of PBH":"The company name of PBH is Prestige Consumer Healthcare Inc. Common Stock.","what is the company name of BCSF":"The company name of BCSF is Bain Capital Specialty Finance, Inc. Common Stock.","tell me the company name of WDH":"The company name of WDH is Waterdrop Inc. American Depositary Shares (each representing the right to receive 10 Class A Ordinary Shares).","name the company name of GIB":"The company name of GIB is CGI Inc. Common Stock.","what is the company name of HPE":"The company name of HPE is Hewlett Packard Enterprise Company Common Stock.","tell me the company name of MGRE":"The company name of MGRE is Affiliated Managers Group, Inc. 6.750% Junior Subordinated Notes due 2064.","name the company name of PDT":"The company name of PDT is John Hancock Premium Dividend Fund.","what is the company name of INFO":"The company name of INFO is Harbor PanAgora Dynamic Large Cap Core ETF."}}},
{"id":"n-b6ab9e2e","guard":[["has","company"],["has","of"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"of TRAD.R":"The company name of TRAD.R is APEX Tech Acquisition Inc. Rights, each entitling the holder to receive one.","of HCXY":"The company name of HCXY is Hercules Capital, Inc. 6.25% Notes due 2033.","the company name of CUBI":"The company name of CUBI is Customers Bancorp, Inc Common Stock.","of BLND":"The company name of BLND is Blend Labs, Inc. Class A Common Stock.","of FMX":"The company name of FMX is Fomento Economico Mexicano S.A.B. de C.V. Common Stock.","the company name of MPLX":"The company name of MPLX is MPLX LP Common Units Representing Limited Partner Interests.","of WS":"The company name of WS is Worthington Steel, Inc. Common Shares.","of JOE":"The company name of JOE is St. Joe Company (The) Common Stock.","the company name of MOG.A":"The company name of MOG.A is Moog Inc. Class A Common Stock.","of MNTN":"The company name of MNTN is MNTN, Inc. Class A Common Stock.","of BGT":"The company name of BGT is BlackRock Floating Rate Income Trust.","the company name of BHE":"The company name of BHE is Benchmark Electronics, Inc. Common Stock.","of OGE":"The company name of OGE is OGE Energy Corp Common Stock.","of MTG":"The company name of MTG is MGIC Investment Corporation Common Stock.","the company name of RLI":"The company name of RLI is RLI Corp. Common Stock (DE).","of TECK":"The company name of TECK is Teck Resources Ltd Ordinary Shares.","of AERO":"The company name of AERO is Grupo Aeromexico, S.A.B. de C.V. American Depositary Shares (each representing ten (10) Common Shares).","the company name of FCN":"The company name of FCN is FTI Consulting, Inc. Common Stock.","of WRB$E":"The company name of WRB$E is W.R. Berkley Corporation 5.70% Subordinated Debentures due 2058.","of L":"The company name of L is Loews Corporation Common Stock.","the company name of SW":"The company name of SW is Smurfit WestRock plc Ordinary Shares.","of FSK":"The company name of FSK is FS KKR Capital Corp. Common Stock.","of CURB":"The company name of CURB is Curbline Properties Corp. Common Stock.","the company name of IBP":"The company name of IBP is Installed Building Products, Inc. Common Stock.","of SPME":"The company name of SPME is Sound Point Meridian Capital, Inc. 7.875% Series B Preferred Shares due 2030.","of CMSD":"The company name of CMSD is CMS Energy Corporation 5.875% Junior Subordinated Notes due 2079.","the company name of WRB$H":"The company name of WRB$H is W.R. Berkley Corporation 4.125% Subordinated Debentures due 2061.","of NIM":"The company name of NIM is Nuveen Select Maturities Municipal Fund Common Stock.","of SPH":"The company name of SPH is Suburban Propane Partners, L.P. Common Stock.","the company name of PRKS":"The company name of PRKS is United Parks & Resorts Inc. Common Stock.","of GIL":"The company name of GIL is Gildan Activewear, Inc. Class A Sub. Vot. Common Stock.","of OXY":"The company name of OXY is Occidental Petroleum Corporation Common Stock.","the company name of PBH":"The company name of PBH is Prestige Consumer Healthcare Inc. Common Stock.","of BCSF":"The company name of BCSF is Bain Capital Specialty Finance, Inc. Common Stock.","of WDH":"The company name of WDH is Waterdrop Inc. American Depositary Shares (each representing the right to receive 10 Class A Ordinary Shares).","the company name of GIB":"The company name of GIB is CGI Inc. Common Stock.","of HPE":"The company name of HPE is Hewlett Packard Enterprise Company Common Stock.","of MGRE":"The company name of MGRE is Affiliated Managers Group, Inc. 6.750% Junior Subordinated Notes due 2064.","the company name of PDT":"The company name of PDT is John Hancock Premium Dividend Fund.","of INFO":"The company name of INFO is Harbor PanAgora Dynamic Large Cap Core ETF."}}},
{"id":"n-cb5e1775","guard":[["has","company"],["has","of"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"company"}]]],"mem":{"table":{"name of TRAD.R":"The company name of TRAD.R is APEX Tech Acquisition Inc. Rights, each entitling the holder to receive one.","name of HCXY":"The company name of HCXY is Hercules Capital, Inc. 6.25% Notes due 2033.","name of CUBI":"The company name of CUBI is Customers Bancorp, Inc Common Stock.","name of BLND":"The company name of BLND is Blend Labs, Inc. Class A Common Stock.","name of FMX":"The company name of FMX is Fomento Economico Mexicano S.A.B. de C.V. Common Stock.","name of MPLX":"The company name of MPLX is MPLX LP Common Units Representing Limited Partner Interests.","name of WS":"The company name of WS is Worthington Steel, Inc. Common Shares.","name of JOE":"The company name of JOE is St. Joe Company (The) Common Stock.","name of MOG.A":"The company name of MOG.A is Moog Inc. Class A Common Stock.","name of MNTN":"The company name of MNTN is MNTN, Inc. Class A Common Stock.","name of BGT":"The company name of BGT is BlackRock Floating Rate Income Trust.","name of BHE":"The company name of BHE is Benchmark Electronics, Inc. Common Stock.","name of OGE":"The company name of OGE is OGE Energy Corp Common Stock.","name of MTG":"The company name of MTG is MGIC Investment Corporation Common Stock.","name of RLI":"The company name of RLI is RLI Corp. Common Stock (DE).","name of TECK":"The company name of TECK is Teck Resources Ltd Ordinary Shares.","name of AERO":"The company name of AERO is Grupo Aeromexico, S.A.B. de C.V. American Depositary Shares (each representing ten (10) Common Shares).","name of FCN":"The company name of FCN is FTI Consulting, Inc. Common Stock.","name of WRB$E":"The company name of WRB$E is W.R. Berkley Corporation 5.70% Subordinated Debentures due 2058.","name of L":"The company name of L is Loews Corporation Common Stock.","name of SW":"The company name of SW is Smurfit WestRock plc Ordinary Shares.","name of FSK":"The company name of FSK is FS KKR Capital Corp. Common Stock.","name of CURB":"The company name of CURB is Curbline Properties Corp. Common Stock.","name of IBP":"The company name of IBP is Installed Building Products, Inc. Common Stock.","name of SPME":"The company name of SPME is Sound Point Meridian Capital, Inc. 7.875% Series B Preferred Shares due 2030.","name of CMSD":"The company name of CMSD is CMS Energy Corporation 5.875% Junior Subordinated Notes due 2079.","name of WRB$H":"The company name of WRB$H is W.R. Berkley Corporation 4.125% Subordinated Debentures due 2061.","name of NIM":"The company name of NIM is Nuveen Select Maturities Municipal Fund Common Stock.","name of SPH":"The company name of SPH is Suburban Propane Partners, L.P. Common Stock.","name of PRKS":"The company name of PRKS is United Parks & Resorts Inc. Common Stock.","name of GIL":"The company name of GIL is Gildan Activewear, Inc. Class A Sub. Vot. Common Stock.","name of OXY":"The company name of OXY is Occidental Petroleum Corporation Common Stock.","name of PBH":"The company name of PBH is Prestige Consumer Healthcare Inc. Common Stock.","name of BCSF":"The company name of BCSF is Bain Capital Specialty Finance, Inc. Common Stock.","name of WDH":"The company name of WDH is Waterdrop Inc. American Depositary Shares (each representing the right to receive 10 Class A Ordinary Shares).","name of GIB":"The company name of GIB is CGI Inc. Common Stock.","name of HPE":"The company name of HPE is Hewlett Packard Enterprise Company Common Stock.","name of MGRE":"The company name of MGRE is Affiliated Managers Group, Inc. 6.750% Junior Subordinated Notes due 2064.","name of PDT":"The company name of PDT is John Hancock Premium Dividend Fund.","name of INFO":"The company name of INFO is Harbor PanAgora Dynamic Large Cap Core ETF."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the company name of TRAD.R","expect":{"contains":["APEX Tech Acquisition Inc. Rights, each entitling the holder to receive one"],"notRefusal":true}},{"q":"tell me the company name of HCXY","expect":{"contains":["Hercules Capital, Inc. 6.25% Notes due 2033"],"notRefusal":true}},{"q":"name the company name of CUBI","expect":{"contains":["Customers Bancorp, Inc Common Stock"],"notRefusal":true}},{"q":"what is the company name of BLND","expect":{"contains":["Blend Labs, Inc. Class A Common Stock"],"notRefusal":true}},{"q":"tell me the company name of FMX","expect":{"contains":["Fomento Economico Mexicano S.A.B. de C.V. Common Stock"],"notRefusal":true}},{"q":"name the company name of MPLX","expect":{"contains":["MPLX LP Common Units Representing Limited Partner Interests"],"notRefusal":true}},{"q":"what is the company name of WS","expect":{"contains":["Worthington Steel, Inc. Common Shares"],"notRefusal":true}},{"q":"tell me the company name of JOE","expect":{"contains":["St. Joe Company (The) Common Stock"],"notRefusal":true}},{"q":"name the company name of MOG.A","expect":{"contains":["Moog Inc. Class A Common Stock"],"notRefusal":true}},{"q":"what is the company name of MNTN","expect":{"contains":["MNTN, Inc. Class A Common Stock"],"notRefusal":true}},{"q":"tell me the company name of BGT","expect":{"contains":["BlackRock Floating Rate Income Trust"],"notRefusal":true}},{"q":"name the company name of BHE","expect":{"contains":["Benchmark Electronics, Inc. Common Stock"],"notRefusal":true}},{"q":"what is the company name of OGE","expect":{"contains":["OGE Energy Corp Common Stock"],"notRefusal":true}},{"q":"tell me the company name of MTG","expect":{"contains":["MGIC Investment Corporation Common Stock"],"notRefusal":true}},{"q":"name the company name of RLI","expect":{"contains":["RLI Corp. Common Stock (DE)"],"notRefusal":true}},{"q":"what is the company name of TECK","expect":{"contains":["Teck Resources Ltd Ordinary Shares"],"notRefusal":true}},{"q":"tell me the company name of AERO","expect":{"contains":["Grupo Aeromexico, S.A.B. de C.V. American Depositary Shares (each representing ten (10) Common Shares)"],"notRefusal":true}},{"q":"name the company name of FCN","expect":{"contains":["FTI Consulting, Inc. Common Stock"],"notRefusal":true}},{"q":"what is the company name of WRB$E","expect":{"contains":["W.R. Berkley Corporation 5.70% Subordinated Debentures due 2058"],"notRefusal":true}},{"q":"tell me the company name of L","expect":{"contains":["Loews Corporation Common Stock"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
