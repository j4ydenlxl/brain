// http-phrase-status-neo-g10-2.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"http-phrase-status-neo-g10-2","class":"http-phrase-status","generation":10,"lane":"neo","grownFrom":["give the number of the HTTP status Conflict","which status code means Moved Permanently","what is the HTTP status code for Expectation Failed","which status code means URI Too Long","which status code means Processing","which status code means Proxy Authentication Required","what is the HTTP status code for No Content","which status code means Unprocessable Entity","which status code means Payment Required","what is the HTTP status code for Permanent Redirect","which status code means Gateway Time-out","which status code means IM Used","which status code means Unavailable For Legal Reasons","give the number of the HTTP status Range Not Satisfiable","what is the HTTP status code for Locked","what is the HTTP status code for See Other","give the number of the HTTP status Created","give the number of the HTTP status Unsupported Media Type","give the number of the HTTP status Service Unavailable","what is the HTTP status code for Insufficient Storage"],"version":1});

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
knowLoad([{"id":"http-status-codes","columns":["HTTP status code","reason phrase"],"n":56,"cols":[{"f":"0100|21|22|0200|21|22|23|24|25|26|27|126|0300|21|22|23|24|25|27|28|0400|21|22|23|24|25|26|27|28|29|110|21|22|23|24|25|26|27|28|122|23|24|26|28|29|131|151|0500|21|22|23|24|25|26|27|111","sep":"|"},{"s":"Continue|Switching Protocols|Processing|OK|Created|Accepted|Non-Authoritative Information|No Content|Reset Content|Partial Content|Multi-Status|IM Used|Multiple Choices|Moved Permanently|Found|See Other|Not Modified|Use Proxy|Temporary Redirect|Permanent Redirect|Bad Request|Unauthorized|Payment Required|Forbidden|Not Found|Method Not Allowed|Not Acceptable|Proxy Authentication Required|Request Timeout|Conflict|Gone|Length Required|Precondition Failed|Payload Too Large|URI Too Long|Unsupported Media Type|Range Not Satisfiable|Expectation Failed|I'm a teapot|Unprocessable Entity|Locked|Failed Dependency|Upgrade Required|Precondition Required|Too Many Requests|Request Header Fields Too Large|Unavailable For Legal Reasons|Internal Server Error|Not Implemented|Bad Gateway|Service Unavailable|Gateway Time-out|HTTP Version Not Supported|Variant Also Negotiates|Insufficient Storage|Network Authentication Required","sep":"|"}]}]);
const COLONY = [
{"id":"n-0821c0ed","guard":[["hasAny",["code","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","of"]],["has","status"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-3fc923e4","guard":[["not",["hasAny",["abie","created","dependency","gone","implemented","name","negotiates","nonauthoritative","of","protocols","reset","satisfiable","service","use"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["sense.after",{"lit":"code"}]]],"mem":null},
{"id":"n-977753f3","guard":[["has","code"],["not",["has","of"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"code"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-7c392f56","guard":[["hasAny",["code","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","name"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-b9a80d01","guard":[["not",["hasAny",["act","backend","havent","language","name","razor","thursday","v"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-d14e3d8c","guard":[["has","code"],["not",["has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"Expectation Failed":"417","No Content":"204","Permanent Redirect":"308","Legal Reasons":"451","Locked":"423","See Other":"303","Insufficient Storage":"507","I'm a teapot":"418","Precondition Required":"428","Bad Request":"400","OK":"200","Method Not Allowed":"405","Payload Too Large":"413","Forbidden":"403","Request Timeout":"408","Partial Content":"206"}}},
{"id":"n-3d11770d","guard":[["hasAny",["delete","element","http","item number","nth","position","remove","strip out","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-441abf66","guard":[["not",["hasAny",["abie","act","backend","dependency","director","food","gateway","gone","hattie","matter","nonauthoritative","of","okman","payment","permanently","razor","seconds","state","thematic","tortured","unauthorized","unavailable","videogames","wendys"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-7775a7e3","guard":[["not",["hasAny",["act","artist","backend","category","code","date","director","food","hattie","matter","persons","razor","seconds","state","thematic","title","tortured","wendys"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-8253917f","guard":[["hasAny",["code","delete","element","item number","nth","position","remove","strip out","without"]],["has","for"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-8ee72f25","guard":[["not",["hasAny",["abie","act","backend","dependency","director","food","gateway","gone","hattie","matter","nonauthoritative","of","okman","payment","permanently","razor","state","thematic","tortured","unauthorized","unavailable","videogames","wendys"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-0a432a3f","guard":[["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the HTTP status Conflict":"409","the HTTP status Range Not Satisfiable":"416","the HTTP status Created":"201","the HTTP status Unsupported Media Type":"415","the HTTP status Service Unavailable":"503","the HTTP status Continue":"100","the HTTP status Non-Authoritative Information":"203","the HTTP status HTTP Version Not Supported":"505","the HTTP status Multi-Status":"207","the HTTP status Reset Content":"205","the HTTP status Accepted":"202","the HTTP status Variant Also Negotiates":"506","the HTTP status Too Many Requests":"429","the HTTP status Switching Protocols":"101","the HTTP status Precondition Failed":"412"}}},
{"id":"n-1913f53d","guard":[["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-1ae54474","guard":[["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the HTTP status Conflict":"409","the HTTP status Range Not Satisfiable":"416","the HTTP status Created":"201","the HTTP status Unsupported Media Type":"415","the HTTP status Service Unavailable":"503","the HTTP status Continue":"100","the HTTP status Non-Authoritative Information":"203","the HTTP status HTTP Version Not Supported":"505","the HTTP status Multi-Status":"207","the HTTP status Reset Content":"205","the HTTP status Accepted":"202","the HTTP status Variant Also Negotiates":"506","the HTTP status Too Many Requests":"429","the HTTP status Switching Protocols":"101","the HTTP status Precondition Failed":"412"}}},
{"id":"n-218340da","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-25bd6857","guard":[["has","code"],["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-410eb605","guard":[["has","http"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the HTTP status Conflict":"409","the HTTP status Range Not Satisfiable":"416","the HTTP status Created":"201","the HTTP status Unsupported Media Type":"415","the HTTP status Service Unavailable":"503","the HTTP status Continue":"100","the HTTP status Non-Authoritative Information":"203","the HTTP status HTTP Version Not Supported":"505","the HTTP status Multi-Status":"207","the HTTP status Reset Content":"205","the HTTP status Accepted":"202","the HTTP status Variant Also Negotiates":"506","the HTTP status Too Many Requests":"429","the HTTP status Switching Protocols":"101","the HTTP status Precondition Failed":"412"}}},
{"id":"n-4997cdc8","guard":[["has","code"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-4cb1dc4d","guard":[["has","code"],["has","for"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the HTTP status code for Expectation Failed":"417","the HTTP status code for No Content":"204","the HTTP status code for Permanent Redirect":"308","the HTTP status code for Locked":"423","the HTTP status code for See Other":"303","the HTTP status code for Insufficient Storage":"507","the HTTP status code for I'm a teapot":"418","the HTTP status code for Precondition Required":"428","the HTTP status code for Bad Request":"400","the HTTP status code for OK":"200","the HTTP status code for Method Not Allowed":"405","the HTTP status code for Payload Too Large":"413","the HTTP status code for Forbidden":"403","the HTTP status code for Request Timeout":"408","the HTTP status code for Partial Content":"206"}}},
{"id":"n-5662daeb","guard":[["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-57c591e3","guard":[["has","code"],["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-746abc66","guard":[["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-755f6978","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the HTTP status Conflict":"409","the HTTP status Range Not Satisfiable":"416","the HTTP status Created":"201","the HTTP status Unsupported Media Type":"415","the HTTP status Service Unavailable":"503","the HTTP status Continue":"100","the HTTP status Non-Authoritative Information":"203","the HTTP status HTTP Version Not Supported":"505","the HTTP status Multi-Status":"207","the HTTP status Reset Content":"205","the HTTP status Accepted":"202","the HTTP status Variant Also Negotiates":"506","the HTTP status Too Many Requests":"429","the HTTP status Switching Protocols":"101","the HTTP status Precondition Failed":"412"}}},
{"id":"n-85d493a7","guard":[["has","http"],["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the HTTP status Conflict":"409","the HTTP status Range Not Satisfiable":"416","the HTTP status Created":"201","the HTTP status Unsupported Media Type":"415","the HTTP status Service Unavailable":"503","the HTTP status Continue":"100","the HTTP status Non-Authoritative Information":"203","the HTTP status HTTP Version Not Supported":"505","the HTTP status Multi-Status":"207","the HTTP status Reset Content":"205","the HTTP status Accepted":"202","the HTTP status Variant Also Negotiates":"506","the HTTP status Too Many Requests":"429","the HTTP status Switching Protocols":"101","the HTTP status Precondition Failed":"412"}}},
{"id":"n-a5109f63","guard":[["has","http"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the HTTP status Conflict":"409","the HTTP status Range Not Satisfiable":"416","the HTTP status Created":"201","the HTTP status Unsupported Media Type":"415","the HTTP status Service Unavailable":"503","the HTTP status Continue":"100","the HTTP status Non-Authoritative Information":"203","the HTTP status HTTP Version Not Supported":"505","the HTTP status Multi-Status":"207","the HTTP status Reset Content":"205","the HTTP status Accepted":"202","the HTTP status Variant Also Negotiates":"506","the HTTP status Too Many Requests":"429","the HTTP status Switching Protocols":"101","the HTTP status Precondition Failed":"412"}}},
{"id":"n-bd28be80","guard":[["has","code"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-c6d5f60e","guard":[["has","http"],["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the HTTP status Conflict":"409","the HTTP status Range Not Satisfiable":"416","the HTTP status Created":"201","the HTTP status Unsupported Media Type":"415","the HTTP status Service Unavailable":"503","the HTTP status Continue":"100","the HTTP status Non-Authoritative Information":"203","the HTTP status HTTP Version Not Supported":"505","the HTTP status Multi-Status":"207","the HTTP status Reset Content":"205","the HTTP status Accepted":"202","the HTTP status Variant Also Negotiates":"506","the HTTP status Too Many Requests":"429","the HTTP status Switching Protocols":"101","the HTTP status Precondition Failed":"412"}}},
{"id":"n-d4dd41c7","guard":[["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the HTTP status Conflict":"409","the HTTP status Range Not Satisfiable":"416","the HTTP status Created":"201","the HTTP status Unsupported Media Type":"415","the HTTP status Service Unavailable":"503","the HTTP status Continue":"100","the HTTP status Non-Authoritative Information":"203","the HTTP status HTTP Version Not Supported":"505","the HTTP status Multi-Status":"207","the HTTP status Reset Content":"205","the HTTP status Accepted":"202","the HTTP status Variant Also Negotiates":"506","the HTTP status Too Many Requests":"429","the HTTP status Switching Protocols":"101","the HTTP status Precondition Failed":"412"}}},
{"id":"n-eac3d864","guard":[["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-f4d9cac9","guard":[["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the HTTP status Conflict":"409","the HTTP status Range Not Satisfiable":"416","the HTTP status Created":"201","the HTTP status Unsupported Media Type":"415","the HTTP status Service Unavailable":"503","the HTTP status Continue":"100","the HTTP status Non-Authoritative Information":"203","the HTTP status HTTP Version Not Supported":"505","the HTTP status Multi-Status":"207","the HTTP status Reset Content":"205","the HTTP status Accepted":"202","the HTTP status Variant Also Negotiates":"506","the HTTP status Too Many Requests":"429","the HTTP status Switching Protocols":"101","the HTTP status Precondition Failed":"412"}}},
{"id":"n-f5e9f7b5","guard":[["has","http"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the HTTP status Conflict":"409","the HTTP status Range Not Satisfiable":"416","the HTTP status Created":"201","the HTTP status Unsupported Media Type":"415","the HTTP status Service Unavailable":"503","the HTTP status Continue":"100","the HTTP status Non-Authoritative Information":"203","the HTTP status HTTP Version Not Supported":"505","the HTTP status Multi-Status":"207","the HTTP status Reset Content":"205","the HTTP status Accepted":"202","the HTTP status Variant Also Negotiates":"506","the HTTP status Too Many Requests":"429","the HTTP status Switching Protocols":"101","the HTTP status Precondition Failed":"412"}}},
{"id":"n-f7b417bc","guard":[["has","code"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"means Moved Permanently":"301","for Expectation Failed":"417","means URI Too Long":"414","means Processing":"102","means Proxy Authentication Required":"407","for No Content":"204","means Unprocessable Entity":"422","means Payment Required":"402","for Permanent Redirect":"308","means Gateway Time-out":"504","means IM Used":"226","means Unavailable For Legal Reasons":"451","for Locked":"423","for See Other":"303","for Insufficient Storage":"507","for I'm a teapot":"418","for Precondition Required":"428","for Bad Request":"400","means Temporary Redirect":"307","for OK":"200","means Unauthorized":"401","means Not Acceptable":"406","for Method Not Allowed":"405","for Payload Too Large":"413","means Not Found":"404","for Forbidden":"403","for Request Timeout":"408","for Partial Content":"206","means Length Required":"411","means Upgrade Required":"426"}}},
{"id":"n-efcd24de","guard":[["hasAny",["after","element","from base","from binary","from hex","in decimal","item number","next","nth","one more","other","permanent","position","precondition","protocols","successor","to decimal"]],["not",["has","me"]],["not",["has","name"]],["not",["has","dependency"]]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["transform.next",["sense.wordCount"]]]],"mem":null},
{"id":"n-1dfaebee","guard":[["hasAny",["alphabetize the letters","backwards","bad","continue","element","entity","item number","length","letters in order","mirror","nth","position","reverse","reversed","sort the letters","spell backwards"]],["has","status"],["not",["has","gateway"]]],"pyramid":["render.str",["transform.reverse",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}]]]],"mem":null},
{"id":"n-e34efbac","guard":[["hasAny",["acceptable","also","character count","element","from base","from binary","from hex","how many characters","in decimal","item number","nth","number of characters","position","processing","to decimal"]],["has","status"],["not",["has","me"]]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-d6185a2e","guard":[["hasAny",["accepted","backwards","element","item number","mirror","nth","position","protocols","reverse","reversed","spell backwards","supported"]],["has","status"],["not",["has","me"]]],"pyramid":["render.str",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}]]],"mem":null},
{"id":"n-8b0b5929","guard":[["hasAny",["accepted","backwards","element","item number","mirror","nth","position","protocols","reverse","reversed","spell backwards","supported"]],["has","status"],["not",["has","me"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}]]],"mem":null},
{"id":"n-e2d1b82f","guard":[["hasAny",["accepted","backwards","each word","element","item number","mirror","nth","position","protocols","reverse","reversed","spell backwards","split into words","supported","words"]],["has","status"],["not",["has","me"]]],"pyramid":["render.list",["transform.words",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}]]]],"mem":null},
{"id":"n-81e7dfea","guard":[["hasAny",["accepted","backwards","element","from base","from binary","from hex","in decimal","item number","mirror","nth","position","protocols","reverse","reversed","spell backwards","supported","to decimal"]],["has","status"],["not",["has","me"]]],"pyramid":["render.number",["compute.fromBase",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}]],{"lit":10}]],"mem":null},
{"id":"n-ae6dec51","guard":[["hasAny",["accepted","change to","continue","element","item number","locked","nth","position","replace","substitute","swap"]],["has","status"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}]]],"mem":null},
{"id":"n-fbf98735","guard":[["hasAny",["accepted","change to","continue","element","item number","locked","nth","position","replace","substitute","swap"]],["has","status"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}]]],"mem":null},
{"id":"n-88ed8937","guard":[["hasAny",["bad","character count","copies","element","first letters of the name","how many characters","initials","item number","nth","number of characters","ok","position","repeat","say it times"]],["has","for"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["transform.initials",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":100}]]],"mem":null},
{"id":"n-f995ecf7","guard":[["hasAny",["character count","code","element","how many characters","item number","length","normalise","normalize","nth","number of characters","position","simplify the text"]],["not",["has","of"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-86f430e9","guard":[["hasAny",["character count","element","from base","from binary","from hex","how many characters","in decimal","item number","no","nth","number of characters","position","processing","to decimal"]],["has","status"],["not",["has","me"]]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-b43e896e","guard":[["hasAny",["continue","convert to base","element","how many vowels","in base","in binary","in octal","item number","nth","number of vowels","position","protocols","to binary","to hex","vowel count"]],["has","give"]],"pyramid":["render.str",["compute.toBase",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-035ac24b","guard":[["hasAny",["after years at","bad","compound interest","compounded","element","grows to","how many words","item number","nth","number of words","ok","position","word count"]],["has","for"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-5c328f5f","guard":[["hasAny",["element","from base","from binary","from hex","how many vowels","in decimal","item number","locked","nth","number of vowels","position","to decimal","used","vowel count"]],["has","status"],["words<=",8]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-91dcefbf","guard":[["hasAny",["double","element","from base","from binary","from hex","in decimal","item number","nth","position","processing","to decimal","twice","two times","unauthorized"]],["has","means"]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["transform.double",["sense.wordCount"]]]],"mem":null},
{"id":"n-e3769c1b","guard":[["hasAny",["arithmetic mean","character count","how many characters","number of characters","other","supported"]],["has","http"],["words>=",9]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":101},["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-fccdef2f","guard":[["hasAny",["bad","character count","continue","growth rate","how many characters","number of characters","percent change","percent decrease","percent increase","percentage change"]],["not",["has","gateway"]]],"pyramid":["render.number",["compute.percentChange",{"lit":4},["aggregate.chars",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-49e46d5f","guard":[["hasAny",["arithmetic mean","created","how many vowels","information","number of vowels","vowel count"]],["has","number"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",["aggregate.vowels",["sense.lastWord"]],{"lit":4},{"lit":100}]]],"mem":null},
{"id":"n-4cf2f89f","guard":[["hasAny",["continue","convert to base","how many items","in base","in binary","in octal","number of items","protocols","to binary","to hex"]],["has","give"]],"pyramid":["render.str",["compute.toBase",["aggregate.countStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-c333bd0d","guard":[["hasAny",["convert to base","created","in base","in binary","in octal","nth prime","processing","the prime number in position","to binary","to hex"]],["has","status"],["not",["has","me"]]],"pyramid":["render.str",["compute.toBase",["compute.nthPrime",["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-ea0c3ae8","guard":[["hasAny",["continue","convert to base","in base","in binary","in octal","protocols","successor","to binary","to hex"]],["has","give"]],"pyramid":["render.str",["compute.toBase",["transform.next",["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-04e1e375","guard":[["hasAny",["biggest","payment","unauthorized"]],["has","which"]],"pyramid":["render.number",["aggregate.max",["iterate.steps",["sense.wordCount"],{"lit":4},{"lit":100}]]],"mem":null},
{"id":"n-19b55733","guard":[["hasAny",["as a percentage","bad","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","http"],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.gcd",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-1c4d0c64","guard":[["hasAny",["continue","increase by","left over","mod","modulo","plus tax","protocols","raise by","remainder","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.mod",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-264e2f6e","guard":[["hasAny",["as a percentage","bad","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]],["has","http"],["not",["has","gateway"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.gcd",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-326f1e2d","guard":[["hasAny",["as a percentage","bad","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","http"],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.gcd",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-37e1aef7","guard":[["hasAny",["as a percentage","bad","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]],["has","http"],["not",["has","gateway"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.gcd",["sense.wordCount"],{"lit":100}]]],"mem":null},
{"id":"n-3dbf6d92","guard":[["hasAny",["add up","altogether","in all","long","payment"]],["has","means"]],"pyramid":["render.number",["aggregate.sum",["iterate.steps",["sense.wordCount"],{"lit":5},{"lit":12}]]],"mem":null},
{"id":"n-609e55ce","guard":[["hasAny",["continue","increase by","left over","mod","modulo","plus tax","protocols","raise by","remainder","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.mod",{"lit":1000},["sense.wordCount"]]]],"mem":null},
{"id":"n-64f64d25","guard":[["hasAny",["as a percentage","bad","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]],["has","http"],["not",["has","gateway"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.mod",{"lit":100},["sense.wordCount"]]]],"mem":null},
{"id":"n-6e14cf2c","guard":[["hasAny",["as a percentage","bad","left over","mod","modulo","ok","percent is","remainder","what percent","what percentage"]],["has","http"],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.mod",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-85f69b2b","guard":[["hasAny",["continue","increase by","left over","mod","modulo","plus tax","protocols","raise by","remainder","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.mod",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-e8a00d43","guard":[["hasAny",["as a percentage","bad","continue","how many words","number of words","percent is","what percent","what percentage","word count"]],["not",["has","gateway"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.after",{"lit":"status"}]],{"lit":1}]],"mem":null},
{"id":"n-f4067d66","guard":[["hasAny",["copies","how many words","moved","number of words","protocols","repeat","say it times","word count"]],["not",["has","is"]],["not",["has","me"]]],"pyramid":["render.number",["aggregate.words",["transform.repeat",["sense.after",{"lit":"status"}],{"lit":100}]]],"mem":null},
{"id":"n-f6c39c62","guard":[["hasAny",["as a percentage","bad","ok","percent is","take away","what percent","what percentage"]],["has","http"],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.sub",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-4383da1d","guard":[["hasAny",["arithmetic mean","average","avg","character count","element","forbidden","how many characters","item number","mean","nth","number of characters","position"]],["has","what"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",{"lit":3},{"lit":100},["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-9a7f5b99","guard":[["hasAny",["arithmetic mean","average","avg","character count","element","how many characters","item number","mean","nth","number of characters","ok","position"]],["has","for"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":4},{"lit":100}]]],"mem":null},
{"id":"n-d9786b5c","guard":[["hasAny",["character count","difference between the largest and smallest","element","how many characters","item number","nth","number of characters","ok","position","spread"]],["has","for"]],"pyramid":["render.number",["aggregate.range",["iterate.growth",{"lit":100},{"lit":100},["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-19dacf3b","guard":[["hasAny",["accepted","area of a circle","area with radius","ceil","ceiling","character count","circle area","element","how many characters","item number","nth","number of characters","position","round up"]]],"pyramid":["render.number",["transform.ceil",["compute.circleArea",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-2c4f75a9","guard":[["hasAny",["as a percentage","character count","element","how many characters","item number","nth","number of characters","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-4b0a19ca","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-681d32b1","guard":[["hasAny",["character count","copies","element","how many characters","item number","nth","number of characters","ok","position","repeat","say it times"]],["has","for"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100}]]],"mem":null},
{"id":"n-6ed6e1b3","guard":[["hasAny",["ascii","ascii codes","character codes","code points","continue","difference between the largest and smallest","double","element","item number","nth","position","spread","twice","two times","unicode values"]]],"pyramid":["render.number",["transform.double",["aggregate.range",["transform.charCodes",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-80da604f","guard":[["hasAny",["also","arrangements","character count","element","how many characters","item number","nth","number of characters","ordered selections","permutations","position","ways to arrange"]],["has","give"]],"pyramid":["render.number",["compute.permutations",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-a6a9abd9","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["sense.wordCount"]]],"mem":null},
{"id":"n-e4a05287","guard":[["hasAny",["acceptable","character count","double","element","how many characters","item number","nth","number of characters","position","sum of the first","triangular number","twice","two times"]]],"pyramid":["render.number",["compute.sumTo",["transform.double",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-ee6e5cd5","guard":[["hasAny",["character count","continue","decimal places","element","how many characters","item number","length","nth","number of characters","position","round to","rounded to"]]],"pyramid":["render.number",["transform.roundTo",{"lit":100},["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-f7cc86d1","guard":[["hasAny",["character count","continue","element","growth rate","how many characters","item number","nth","number of characters","percent change","percent decrease","percent increase","percentage change","position"]]],"pyramid":["render.number",["compute.percentChange",{"lit":4},["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-075fbebf","guard":[["hasAny",["as a percentage","bad","character count","element","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.base64",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":4}]],"mem":null},
{"id":"n-098db1aa","guard":[["hasAny",["character count","diagonal","element","how many characters","hypotenuse","item number","no vowels","nth","number of characters","position","protocols","pythagoras","pythagorean","remove vowels","without vowels"]],["has","give"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.chars",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-0ba9f9f0","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-0d6c5524","guard":[["hasAny",["abbreviate","acronym","character count","continue","element","how many characters","item number","lowest terms","nth","number of characters","position","reduce the fraction","short form","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.chars",["transform.acronym",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-1c69e206","guard":[["hasAny",["character count","continue","copies","element","how many characters","item number","most common letter","most frequent letter","nth","number of characters","position","repeat","say it times","which letter appears most"]]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["aggregate.commonLetter",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":100}]]],"mem":null},
{"id":"n-1d7cc1cf","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","item number","no vowels","nth","number of characters","percent is","position","remove vowels","what percent","what percentage","without vowels"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-1dfb2e0a","guard":[["hasAny",["add the digits","as a percentage","character count","continue","digit sum","element","how many characters","item number","nth","number of characters","percent is","position","sum of the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.digitSum",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-1f9ab1d8","guard":[["hasAny",["abbreviate","acronym","binomial coefficient","character count","choose","combinations","continue","element","how many characters","item number","n choose k","nth","number of characters","position","short form","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.chars",["transform.acronym",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-237d6df8","guard":[["hasAny",["as a percentage","character count","digits backwards","digits reversed","element","how many characters","item number","nth","number of characters","ok","percent is","position","reverse the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":1}]],"mem":null},
{"id":"n-26230645","guard":[["hasAny",["character count","continue","digit count","element","how many characters","how many digits","item number","lowest terms","nth","number of characters","number of digits","position","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.digitCount",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-27ebca3e","guard":[["hasAny",["as a percentage","character count","continue","digits backwards","digits reversed","element","how many characters","item number","nth","number of characters","percent is","position","reverse the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],["sense.wordCount"]]],"mem":null},
{"id":"n-28b70db0","guard":[["hasAny",["as a percentage","character count","digits backwards","digits reversed","element","how many characters","item number","nth","number of characters","ok","percent is","position","reverse the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.reverseDigits",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-2c0b22f6","guard":[["hasAny",["as a percentage","before","character count","element","how many characters","item number","nth","number of characters","ok","one less","percent is","position","predecessor","previous","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["transform.prev",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-2c2fe0da","guard":[["hasAny",["arithmetic mean","average","avg","element","how many words","item number","mean","nth","number of words","position","protocols","word count"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":100}]]],"mem":null},
{"id":"n-2f04ee9d","guard":[["hasAny",["add the digits","as a percentage","character count","digit sum","element","how many characters","item number","nth","number of characters","ok","percent is","position","sum of the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitSum",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":1}]],"mem":null},
{"id":"n-3129e746","guard":[["hasAny",["as a percentage","character count","continue","element","half","half of","halve","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.half",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":4}]],"mem":null},
{"id":"n-347c2dd8","guard":[["hasAny",["as a percentage","character count","continue","digit count","element","how many characters","how many digits","item number","nth","number of characters","number of digits","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.digitCount",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-3d80d8a0","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","how many words","item number","nth","number of characters","number of words","percent is","position","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-3daea777","guard":[["hasAny",["add the digits","as a percentage","character count","continue","digit sum","element","how many characters","item number","nth","number of characters","percent is","position","sum of the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-3ec6d45d","guard":[["hasAny",["as a percentage","character count","element","how many characters","item number","nth","number of characters","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.base64",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":2}]],"mem":null},
{"id":"n-530d82a1","guard":[["hasAny",["binomial coefficient","character count","choose","combinations","continue","digit count","element","how many characters","how many digits","item number","n choose k","nth","number of characters","number of digits","position","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.digitCount",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-537fafdf","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.chars",["transform.base64",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-549fec4c","guard":[["hasAny",["character count","element","first letters of the name","how many characters","increase by","initials","item number","markup","nth","number of characters","plus tax","position","processing","raise by","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.chars",["transform.initials",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-561b206c","guard":[["hasAny",["allowed","character count","element","how many characters","item number","nth","number of characters","population variance","position","variance"]]],"pyramid":["render.number",["aggregate.variance",["iterate.multiples",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":4}]]],"mem":null},
{"id":"n-58056177","guard":[["hasAny",["as a percentage","character count","count","element","how many","how many characters","how many items","item number","nth","number of characters","number of items","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.countStrs",["sense.content"]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-59645ebd","guard":[["hasAny",["as a percentage","character count","element","fib","fibonacci","fibonacci number","how many characters","item number","nth","number of characters","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["compute.fibonacci",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-5989e60e","guard":[["hasAny",["as a percentage","character count","element","factorial","how many characters","item number","n factorial","nth","number of characters","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.factorial",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-5b46ec87","guard":[["hasAny",["as a percentage","character count","continue","divisor count","element","how many characters","how many divisors","how many factors","item number","nth","number of characters","number of divisors","percent is","position","what percent","what percentage"]],["has","http"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.divisorCount",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-5c2d5b52","guard":[["hasAny",["as a percentage","bad","character count","element","how many characters","item number","most common letter","most frequent letter","nth","number of characters","percent is","position","what percent","what percentage","which letter appears most"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["aggregate.commonLetter",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-60641d97","guard":[["hasAny",["as a percentage","character count","continue","digits backwards","digits reversed","element","how many characters","item number","nth","number of characters","percent is","position","reverse the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.wordCount"]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-6350ee5e","guard":[["hasAny",["abbreviate","acronym","character count","copies","element","how many characters","item number","nth","number of characters","position","protocols","repeat","say it times","short form"]],["has","give"]],"pyramid":["render.number",["aggregate.chars",["transform.acronym",["transform.repeat",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100}]]]],"mem":null},
{"id":"n-6ba34ab6","guard":[["hasAny",["as a percentage","character count","consonant count","element","how many characters","how many consonants","item number","nth","number of characters","number of consonants","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-6bb08806","guard":[["hasAny",["arithmetic mean","average","avg","continue","element","how many words","item number","mean","nth","number of words","position","word count"]]],"pyramid":["render.number",["aggregate.mean",["iterate.powers",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-6cf9472e","guard":[["hasAny",["as a percentage","character count","continue","element","half","half of","halve","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.half",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-6e99dd2b","guard":[["hasAny",["abbreviate","acronym","as a percentage","character count","continue","element","how many characters","item number","nth","number of characters","percent is","position","short form","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.chars",["transform.acronym",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-6ef125d8","guard":[["hasAny",["as a percentage","character count","element","forbidden","how many characters","item number","nth","number of characters","percent is","position","sum of divisors","sum of factors","sum of the divisors","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":4}]]],"mem":null},
{"id":"n-741df2e1","guard":[["hasAny",["character count","element","how many characters","increase by","item number","markup","most common letter","most frequent letter","nth","number of characters","plus tax","position","protocols","raise by","which letter appears most","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.chars",["aggregate.commonLetter",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-76589839","guard":[["hasAny",["as a percentage","character count","digit count","element","how many characters","how many digits","item number","nth","number of characters","number of digits","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-7c243bb0","guard":[["hasAny",["as a percentage","character count","element","how many characters","item number","no vowels","nth","number of characters","ok","percent is","position","remove vowels","what percent","what percentage","without vowels"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.chars",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-7d65927b","guard":[["hasAny",["as a percentage","character count","element","how many characters","how many words","item number","nth","number of characters","number of words","ok","percent is","position","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-7dc8986c","guard":[["hasAny",["character count","digit count","element","how many characters","how many digits","increase by","item number","markup","nth","number of characters","number of digits","plus tax","position","processing","raise by","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.digitCount",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-81192478","guard":[["hasAny",["as a percentage","character count","element","how many characters","item number","nth","number of characters","ok","percent is","position","square","squared","to the second power","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.square",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-8196b884","guard":[["hasAny",["character count","copies","dashes","element","how many characters","hyphens","item number","kebab case","kebabcase","nth","number of characters","ok","position","repeat","say it times","slug"]],["has","for"]],"pyramid":["render.number",["aggregate.chars",["transform.kebab",["transform.repeat",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100}]]]],"mem":null},
{"id":"n-85c940dc","guard":[["hasAny",["as a percentage","ascii","ascii codes","character codes","code points","difference between the largest and smallest","element","item number","nth","ok","percent is","position","spread","unicode values","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.range",["transform.charCodes",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":2}]],"mem":null},
{"id":"n-86607987","guard":[["hasAny",["character count","continue","diagonal","element","first letters of the name","how many characters","hypotenuse","initials","item number","nth","number of characters","position","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.chars",["transform.initials",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-87c809eb","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","item number","no vowels","nth","number of characters","percent is","position","remove vowels","what percent","what percentage","without vowels"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":4}]],"mem":null},
{"id":"n-8f4f12cd","guard":[["hasAny",["as a percentage","character count","continue","digits backwards","digits reversed","element","how many characters","item number","nth","number of characters","percent is","position","reverse the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.reverseDigits",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-90f6bda8","guard":[["hasAny",["as a percentage","character count","divisor count","element","how many characters","how many divisors","how many factors","item number","nth","number of characters","number of divisors","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.divisorCount",["sense.wordCount"]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-9ccda454","guard":[["hasAny",["as a percentage","bad","character count","element","how many characters","item number","nth","number of characters","percent is","position","sum of divisors","sum of factors","sum of the divisors","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.divisorSum",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":3}]],"mem":null},
{"id":"n-9e06eae8","guard":[["hasAny",["character count","element","how many characters","information","item number","join","joined with","nth","number of characters","position","separated by"]],["has","give"]],"pyramid":["render.number",["aggregate.chars",["transform.join",["sense.content"],["transform.base64",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-9fe85305","guard":[["hasAny",["arithmetic mean","ascii","ascii codes","average","avg","character codes","code points","conflict","each times","element","item number","mean","multiply each","nth","position","scale","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["transform.mapMul",["transform.charCodes",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":4}]]],"mem":null},
{"id":"n-a26b67ba","guard":[["hasAny",["add the digits","as a percentage","character count","digit sum","element","how many characters","item number","nth","number of characters","ok","percent is","position","sum of the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.digitSum",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-a4204afb","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","how many words","item number","nth","number of characters","number of words","percent is","position","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.text"]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-a4ab47a7","guard":[["hasAny",["arithmetic mean","ascii","ascii codes","average","avg","character codes","code points","element","first n","item number","mean","nth","position","protocols","take","top","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["transform.takeNums",["transform.charCodes",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":2}]]],"mem":null},
{"id":"n-a5627e19","guard":[["hasAny",["as a percentage","character count","continue","digit count","element","how many characters","how many digits","item number","nth","number of characters","number of digits","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitCount",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":1}]],"mem":null},
{"id":"n-a69eaea3","guard":[["hasAny",["character count","continue","element","how many characters","item number","lowest terms","most common letter","most frequent letter","nth","number of characters","position","reduce the fraction","simplest form","simplify the fraction","which letter appears most"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.chars",["aggregate.commonLetter",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-a6b48b51","guard":[["hasAny",["add the digits","as a percentage","character count","continue","digit sum","element","how many characters","item number","nth","number of characters","percent is","position","sum of the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitSum",["sense.wordCount"]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-a853ee0b","guard":[["hasAny",["as a percentage","character count","double","element","how many characters","item number","nth","number of characters","ok","percent is","position","twice","two times","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.double",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-ac5da7d4","guard":[["hasAny",["arithmetic mean","average","avg","continue","element","how many words","item number","mean","nth","number of words","position","word count"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-aca5f35a","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","how many letters","item number","letter count","nth","number of characters","number of letters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-b69d40d2","guard":[["hasAny",["character count","copies","element","how many characters","how many vowels","item number","nth","number of characters","number of vowels","position","processing","repeat","say it times","vowel count"]],["has","means"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["sense.text"],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-b8cbab8c","guard":[["hasAny",["abbreviate","acronym","as a percentage","character count","element","how many characters","item number","nth","number of characters","ok","percent is","position","short form","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.chars",["transform.acronym",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-b95af565","guard":[["hasAny",["as a percentage","character count","element","factorial","how many characters","item number","n factorial","nth","number of characters","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.factorial",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":1}]],"mem":null},
{"id":"n-bc047b7e","guard":[["hasAny",["as a percentage","character count","continue","digits backwards","digits reversed","element","how many characters","item number","nth","number of characters","percent is","position","reverse the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-be1c4e3d","guard":[["hasAny",["character count","continue","diagonal","element","how many characters","hypotenuse","item number","nth","number of characters","position","pythagoras","pythagorean","root of","sqrt","square root"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.sqrt",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-bfffd1a1","guard":[["hasAny",["after","as a percentage","bad","character count","element","how many characters","item number","next","nth","number of characters","one more","percent is","position","successor","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.next",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":3}]],"mem":null},
{"id":"n-c0b56d92","guard":[["hasAny",["character count","element","how many characters","item number","multiplied together","multiply them all","nth","number of characters","ok","position","product"]],["has","for"]],"pyramid":["render.number",["aggregate.product",["iterate.multiples",{"lit":10},["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-c208fd51","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.base64",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":12}]],"mem":null},
{"id":"n-cc559974","guard":[["hasAny",["as a percentage","character count","divisor count","element","how many characters","how many divisors","how many factors","item number","nth","number of characters","number of divisors","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.divisorCount",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":1}]],"mem":null},
{"id":"n-cd0f1407","guard":[["hasAny",["as a percentage","character count","element","how many characters","how many vowels","item number","nth","number of characters","number of vowels","ok","percent is","position","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-d0521a54","guard":[["hasAny",["after a discount","character count","discount","element","fib","fibonacci","fibonacci number","how many characters","item number","nth","number of characters","off","position","reduced by","reset","sale price"]],["has","give"]],"pyramid":["render.number",["compute.discount",["compute.fibonacci",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":12}]],"mem":null},
{"id":"n-d1ad70cf","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","how many letters","item number","letter count","nth","number of characters","number of letters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-d4794f57","guard":[["hasAny",["as a percentage","character count","digit count","element","how many characters","how many digits","item number","nth","number of characters","number of digits","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.digitCount",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-db3ded7a","guard":[["hasAny",["add the digits","as a percentage","character count","continue","digit sum","element","how many characters","item number","nth","number of characters","percent is","position","sum of the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitSum",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],["sense.wordCount"]]],"mem":null},
{"id":"n-db444934","guard":[["hasAny",["abbreviate","acronym","character count","continue","copies","element","how many characters","item number","nth","number of characters","position","repeat","say it times","short form"]]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["transform.acronym",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":100}]]],"mem":null},
{"id":"n-ddd3dc78","guard":[["hasAny",["as a percentage","bad","character count","element","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.text"]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-e37ff667","guard":[["hasAny",["as a percentage","character count","element","how many characters","how many vowels","item number","nth","number of characters","number of vowels","ok","percent is","position","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-e3ce2bd0","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-e944c919","guard":[["hasAny",["abbreviate","acronym","character count","continue","diagonal","element","how many characters","hypotenuse","item number","nth","number of characters","position","pythagoras","pythagorean","short form"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.chars",["transform.acronym",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-eac8f453","guard":[["hasAny",["as a percentage","character count","continue","divisor count","element","how many characters","how many divisors","how many factors","item number","nth","number of characters","number of divisors","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["compute.divisorCount",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":4}]],"mem":null},
{"id":"n-f12aae2b","guard":[["hasAny",["as a percentage","ascii","ascii codes","character codes","code points","difference between the largest and smallest","element","item number","nth","ok","percent is","position","spread","unicode values","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.range",["transform.charCodes",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-f1c6be34","guard":[["hasAny",["as a percentage","character count","consonant count","element","how many characters","how many consonants","item number","nth","number of characters","number of consonants","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-f79389e6","guard":[["hasAny",["as a percentage","character count","cube","cubed","element","how many characters","item number","nth","number of characters","ok","percent is","position","to the third power","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.cube",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":4}]],"mem":null},
{"id":"n-f8fa371d","guard":[["hasAny",["as a percentage","character count","element","how many characters","item number","nth","number of characters","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["transform.base64",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-fa67738d","guard":[["hasAny",["as a percentage","character count","element","how many characters","item number","nth","number of characters","ok","percent is","position","square","squared","to the second power","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.square",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]],{"lit":2}]],"mem":null},
{"id":"n-fc577aab","guard":[["hasAny",["character count","diagonal","double","element","how many characters","hypotenuse","item number","nth","number of characters","position","processing","pythagoras","pythagorean","twice","two times"]],["has","means"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.double",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-4389ddd1","guard":[["hasAny",["character count","continue","element","how many characters","item number","leading zeros","length","nth","number of characters","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.number",["aggregate.chars",["transform.padStart",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100},["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-62519885","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.chars",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-92d0043b","guard":[["hasAny",["character count","continue","element","how many characters","item number","leading zeros","length","nth","number of characters","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.number",["aggregate.chars",["transform.padStart",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100},["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-a05c0a23","guard":[["hasAny",["as a percentage","character count","element","how many characters","item number","length","nth","number of characters","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.before",{"lit":"is"}]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-a4f2cd08","guard":[["hasAny",["also","character count","copies","element","how many characters","item number","length","nth","number of characters","position","repeat","say it times"]],["has","give"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["aggregate.chars",["sense.before",{"lit":"http"}]]]]],"mem":null},
{"id":"n-ac918c80","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","item number","nth","number of characters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.after",{"lit":"status"}]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-dfbb4fce","guard":[["hasAny",["as a percentage","character count","element","how many characters","item number","nth","number of characters","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.wordAt",{"lit":1}]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-f134e841","guard":[["hasAny",["after years at","character count","compound interest","compounded","element","grows to","how many characters","item number","nth","number of characters","ok","position"]],["has","for"]],"pyramid":["render.number",["compute.compound",{"lit":100},["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.chars",["sense.text"]]]],"mem":null},
{"id":"n-23c8ae36","guard":[["hasAny",["as a percentage","character count","element","how many characters","how many words","item number","nth","number of characters","number of words","ok","percent is","position","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-4a3e6e38","guard":[["hasAny",["as a percentage","character count","element","how many characters","how many vowels","item number","nth","number of characters","number of vowels","ok","percent is","position","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-604e134b","guard":[["hasAny",["character count","element","from base","from binary","from hex","how many characters","in decimal","item number","locked","nth","number of characters","position","to decimal"]]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["aggregate.chars",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-768a70ac","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","how many letters","item number","letter count","nth","number of characters","number of letters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-93fe3c82","guard":[["hasAny",["as a percentage","character count","consonant count","element","how many characters","how many consonants","item number","nth","number of characters","number of consonants","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-c841477a","guard":[["hasAny",["as a percentage","character count","continue","element","how many characters","how many letters","item number","letter count","nth","number of characters","number of letters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-f9617225","guard":[["hasAny",["character count","element","from base","from binary","from hex","how many characters","in decimal","item number","length","no","nth","number of characters","position","to decimal"]]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["aggregate.chars",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-6ea973d8","guard":[["hasAny",["character count","code","element","how many characters","item number","length","normalise","normalize","nth","number of characters","position","simplify the text"]],["has","for"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["aggregate.chars",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-4fd1f17a","guard":[["hasAny",["continue","how many times in the list","lowest terms","occurrences in the list","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.countIn",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-51bdddc4","guard":[["hasAny",["abbreviate","abbreviation","acronym","continue","element","from roman","in arabic numerals","item number","nth","position","roman numeral value","short form","what number is"]]],"pyramid":["render.number",["compute.fromRoman",["transform.acronym",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-6f892959","guard":[["hasAny",["binomial coefficient","choose","combinations","continue","how many times in the list","n choose k","occurrences in the list","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.countIn",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-90605652","guard":[["hasAny",["as a percentage","continue","how many times in the list","occurrences in the list","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.countIn",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-ed5db9b8","guard":[["hasAny",["as a percentage","how many times in the list","occurrences in the list","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.countIn",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],["sense.lastWord"]]]],"mem":null},
{"id":"n-06357dab","guard":[["hasAny",["copies","element","how many letters","item number","letter count","nth","number of letters","ok","position","repeat","say it times"]],["has","for"]],"pyramid":["render.number",["aggregate.letters",["transform.repeat",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100}]]],"mem":null},
{"id":"n-12b6cf15","guard":[["hasAny",["continue","element","how many vowels","item number","lcm","least common multiple","lowest common multiple","nth","number of vowels","position","vowel count"]]],"pyramid":["render.number",["compute.lcm",{"lit":100},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-138f2f46","guard":[["hasAny",["bad","copies","element","how many vowels","item number","nth","number of vowels","position","repeat","say it times","vowel count"]],["has","for"]],"pyramid":["render.number",["aggregate.vowels",["transform.repeat",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100}]]],"mem":null},
{"id":"n-21092947","guard":[["hasAny",["as a percentage","continue","element","how many vowels","item number","nth","number of vowels","percent is","position","vowel count","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":4}]],"mem":null},
{"id":"n-28926b14","guard":[["hasAny",["copies","element","how many words","item number","nth","number of words","position","protocols","repeat","say it times","word count"]],["has","give"]],"pyramid":["render.number",["aggregate.words",["transform.repeat",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100}]]],"mem":null},
{"id":"n-29916167","guard":[["hasAny",["continue","element","how many words","item number","lcm","least common multiple","lowest common multiple","nth","number of words","position","word count"]]],"pyramid":["render.number",["compute.lcm",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-2b979c2c","guard":[["hasAny",["consonant count","continue","element","how many consonants","item number","lcm","least common multiple","lowest common multiple","nth","number of consonants","position"]]],"pyramid":["render.number",["compute.lcm",{"lit":100},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-2f58511c","guard":[["hasAny",["character at","continue","element","from roman","in arabic numerals","item number","letter at","nth","nth letter","position","roman numeral value","what number is","which letter"]]],"pyramid":["render.number",["compute.fromRoman",["transform.charAt",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":1}]]],"mem":null},
{"id":"n-3093d890","guard":[["hasAny",["as a percentage","continue","element","how many vowels","item number","nth","number of vowels","percent is","position","vowel count","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-354c8336","guard":[["hasAny",["abbreviate","abbreviation","acronym","alphabetize the letters","continue","element","from roman","in arabic numerals","item number","letters in order","nth","position","roman numeral value","short form","sort the letters","what number is"]]],"pyramid":["render.number",["compute.fromRoman",["transform.acronym",["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-35fa750e","guard":[["hasAny",["continue","diagonal","element","how many words","hypotenuse","item number","nth","number of words","position","pythagoras","pythagorean","word count"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-382c5fab","guard":[["hasAny",["binomial coefficient","choose","combinations","continue","element","how many words","item number","n choose k","nth","number of words","position","ways to choose","word count"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-42038ff5","guard":[["hasAny",["consonant count","element","growth rate","how many consonants","item number","nth","number of consonants","ok","percent change","percent decrease","percent increase","percentage change","position"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":3}]],"mem":null},
{"id":"n-4b332ba3","guard":[["hasAny",["as a percentage","continue","element","how many words","item number","nth","number of words","percent is","position","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":1}]],"mem":null},
{"id":"n-51ccb0ff","guard":[["hasAny",["consonant count","continue","element","growth rate","how many consonants","item number","nth","number of consonants","percent change","percent decrease","percent increase","percentage change","position"]]],"pyramid":["render.number",["compute.percentChange",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["sense.wordCount"]]],"mem":null},
{"id":"n-574e03ef","guard":[["hasAny",["continue","decimal places","element","how many vowels","item number","nth","number of vowels","position","round to","rounded to","vowel count"]]],"pyramid":["render.number",["transform.roundTo",{"lit":100},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-57bc41f3","guard":[["hasAny",["bad","element","growth rate","how many words","item number","nth","number of words","percent change","percent decrease","percent increase","percentage change","position","word count"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":10}]],"mem":null},
{"id":"n-657d216e","guard":[["hasAny",["as a percentage","continue","element","how many letters","item number","letter count","nth","number of letters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["sense.wordCount"]]],"mem":null},
{"id":"n-6b1ed955","guard":[["hasAny",["convert to base","element","how many words","in base","in binary","in octal","item number","nth","number of words","position","protocols","to binary","to hex","word count"]],["has","give"]],"pyramid":["render.str",["compute.toBase",{"lit":5},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-6e8fbe9f","guard":[["hasAny",["arrangements","continue","element","how many words","item number","nth","number of words","ordered selections","permutations","position","ways to arrange","word count"]]],"pyramid":["render.number",["compute.permutations",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-70fb8845","guard":[["hasAny",["continue","element","how many words","item number","nth","number of words","position","word count"]]],"pyramid":["render.listNums",["iterate.powers",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-7a0b03fe","guard":[["hasAny",["as a percentage","consonant count","element","how many consonants","item number","nth","number of consonants","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-82fa27e8","guard":[["hasAny",["continue","cube root","element","how many words","item number","nth","nth root","number of words","position","root","word count"]]],"pyramid":["render.number",["compute.root",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-859a71ac","guard":[["hasAny",["consonant count","continue","element","growth rate","how many consonants","item number","nth","number of consonants","percent change","percent decrease","percent increase","percentage change","position"]]],"pyramid":["render.number",["compute.percentChange",{"lit":2},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-8629377b","guard":[["hasAny",["continue","decimal places","element","how many letters","item number","letter count","nth","number of letters","position","round to","rounded to"]]],"pyramid":["render.number",["transform.roundTo",{"lit":100},["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-875a9810","guard":[["hasAny",["continue","element","growth rate","how many vowels","item number","nth","number of vowels","percent change","percent decrease","percent increase","percentage change","position","vowel count"]]],"pyramid":["render.number",["compute.percentChange",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],["sense.wordCount"]]],"mem":null},
{"id":"n-9128295d","guard":[["hasAny",["ascii","ascii codes","character codes","code points","distinct","element","item number","nth","population variance","position","processing","remove duplicates","unicode values","unique","variance","without repeats"]],["has","means"]],"pyramid":["render.number",["aggregate.variance",["transform.uniqueNums",["transform.charCodes",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-9661c436","guard":[["hasAny",["continue","element","exponent","how many words","item number","nth","number of words","position","power","raised to","to the power of","word count"]]],"pyramid":["render.number",["compute.power",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-99bfce51","guard":[["hasAny",["continue","element","how many words","item number","nth","number of words","position","word count"]]],"pyramid":["render.listNums",["iterate.multiples",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-9b6a3a09","guard":[["hasAny",["consonant count","continue","convert to base","element","how many consonants","in base","in binary","in octal","item number","nth","number of consonants","position","to binary","to hex"]]],"pyramid":["render.str",["compute.toBase",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-a0287649","guard":[["hasAny",["continue","element","growth rate","how many letters","item number","letter count","nth","number of letters","percent change","percent decrease","percent increase","percentage change","position"]]],"pyramid":["render.number",["compute.percentChange",{"lit":4},["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-a0e92a18","guard":[["hasAny",["element","how many letters","item number","letter count","nth","number of letters","position","square","squared","sum of divisors","sum of factors","sum of the divisors","temporary","to the second power"]],["has","which"]],"pyramid":["render.number",["compute.divisorSum",["transform.square",["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-a476046e","guard":[["hasAny",["continue","element","how many words","item number","lowest terms","nth","number of words","position","reduce the fraction","simplest form","simplify the fraction","word count"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-aedd155b","guard":[["hasAny",["consonant count","continue","decimal places","element","how many consonants","item number","nth","number of consonants","position","round to","rounded to"]]],"pyramid":["render.number",["transform.roundTo",{"lit":100},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-bdcbfae6","guard":[["hasAny",["abbreviate","abbreviation","acronym","continue","element","from roman","in arabic numerals","item number","no vowels","nth","position","remove vowels","roman numeral value","short form","what number is","without vowels"]]],"pyramid":["render.number",["compute.fromRoman",["transform.acronym",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-c29a6abc","guard":[["hasAny",["as a percentage","continue","element","how many letters","item number","letter count","nth","number of letters","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-c848972a","guard":[["hasAny",["as a percentage","consonant count","continue","element","how many consonants","item number","nth","number of consonants","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-d06057d1","guard":[["hasAny",["continue","element","goes into","how many whole times","how many words","integer division","item number","nth","number of words","position","whole division","word count"]]],"pyramid":["render.number",["transform.idiv",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-d087dd17","guard":[["hasAny",["as a percentage","element","how many letters","item number","letter count","nth","number of letters","ok","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-d9e72be7","guard":[["hasAny",["bad","element","growth rate","how many letters","item number","letter count","nth","number of letters","percent change","percent decrease","percent increase","percentage change","position"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",{"lit":2},["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-da67f974","guard":[["hasAny",["as a percentage","element","how many vowels","item number","nth","number of vowels","ok","percent is","position","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-dfbc24ad","guard":[["hasAny",["as a percentage","consonant count","continue","element","how many consonants","item number","nth","number of consonants","percent is","position","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":4}]],"mem":null},
{"id":"n-e7ae9024","guard":[["hasAny",["continue","element","growth rate","how many vowels","item number","nth","number of vowels","percent change","percent decrease","percent increase","percentage change","position","vowel count"]]],"pyramid":["render.number",["compute.percentChange",{"lit":2},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-eafc29a7","guard":[["hasAny",["add up","also","altogether","combined","consonant count","element","how many consonants","in all","item number","nth","number of consonants","position","total"]],["has","give"]],"pyramid":["render.number",["aggregate.sum",["iterate.squares",["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-ed563ada","guard":[["hasAny",["element","growth rate","how many words","item number","nth","number of words","ok","percent change","percent decrease","percent increase","percentage change","position","word count"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":3}]],"mem":null},
{"id":"n-f43f808b","guard":[["hasAny",["as a percentage","continue","element","how many words","item number","nth","number of words","percent is","position","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-f4dfa947","guard":[["hasAny",["element","growth rate","how many vowels","item number","nth","number of vowels","ok","percent change","percent decrease","percent increase","percentage change","position","vowel count"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":3}]],"mem":null},
{"id":"n-f8d43a79","guard":[["hasAny",["appears most often","ascii","ascii codes","character codes","code points","continue","element","item number","mode","most common","most frequent","nth","position","unicode values"]]],"pyramid":["render.number",["aggregate.mode",["transform.charCodes",["transform.base64",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-f9f378dd","guard":[["hasAny",["as a percentage","element","how many words","item number","nth","number of words","ok","percent is","position","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-fb0db536","guard":[["hasAny",["continue","element","growth rate","how many words","item number","nth","number of words","percent change","percent decrease","percent increase","percentage change","position","word count"]]],"pyramid":["render.number",["compute.percentChange",["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-018250ea","guard":[["hasAny",["as a percentage","at which position","continue","element","index of","item number","nth","percent is","position","position of","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.indexOf",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]],{"lit":1}]],"mem":null},
{"id":"n-0864f727","guard":[["hasAny",["continue","element","how many letters","item number","leading zeros","letter count","nth","number of letters","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.number",["aggregate.letters",["transform.padStart",["sense.lastWord"],{"lit":100},["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-09d37c3f","guard":[["hasAny",["changes to turn","continue","edit distance","element","gcd","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","how many edits","item number","levenshtein","nth","position"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["compute.editDistance",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-18b43b1c","guard":[["hasAny",["after years at","compound interest","compounded","element","grows to","how many words","item number","nth","number of words","position","supported","word count"]]],"pyramid":["render.number",["compute.compound",{"lit":10},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":100}]],"mem":null},
{"id":"n-19ca3fab","guard":[["hasAny",["element","how many vowels","item number","leading zeros","long","nth","number of vowels","pad","pad with","padded to","position","vowel count","zero pad"]],["has","which"]],"pyramid":["render.number",["aggregate.vowels",["transform.padStart",["sense.text"],{"lit":1000},["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-1b0c19ac","guard":[["hasAny",["after years at","compound interest","compounded","element","grows to","how many words","item number","nth","number of words","position","processing","word count"]],["has","means"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":2},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-20b4a4e9","guard":[["hasAny",["as a percentage","at which position","element","index of","item number","nth","ok","percent is","position","position of","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.indexOf",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-258a28bd","guard":[["hasAny",["at which position","binomial coefficient","choose","combinations","continue","element","index of","item number","n choose k","nth","position","position of","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.indexOf",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-2ccbe789","guard":[["hasAny",["changes to turn","continue","edit distance","element","how many edits","increase by","item number","levenshtein","markup","nth","plus tax","position","raise by","with tax"]]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.editDistance",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-300bc44f","guard":[["hasAny",["at which position","continue","diagonal","element","hypotenuse","index of","item number","nth","position","position of","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.indexOf",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-3a0b59d8","guard":[["hasAny",["as text","as words","continue","element","how many words","item number","nth","number of words","position","word count","written out"]]],"pyramid":["render.and",["transform.asText",["iterate.multiples",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-50a3a534","guard":[["hasAny",["after years at","compound interest","compounded","element","grows to","how many vowels","item number","nth","number of vowels","ok","position","vowel count"]],["has","for"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":100},["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-5258a2c0","guard":[["hasAny",["as text","as words","continue","element","how many words","item number","nth","number of words","position","word count","written out"]]],"pyramid":["render.and",["transform.asText",["iterate.powers",{"lit":100},["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]]],"mem":null},
{"id":"n-5ac68760","guard":[["hasAny",["as a percentage","bad","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","percent is","position","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.editDistance",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]],{"lit":1}]],"mem":null},
{"id":"n-67ef0b4e","guard":[["hasAny",["continue","element","how many times in the list","item number","nth","occurrences in the list","position"]]],"pyramid":["render.number",["aggregate.countIn",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100}],["sense.lastWord"]]],"mem":null},
{"id":"n-6f698ab0","guard":[["hasAny",["changes to turn","continue","diagonal","edit distance","element","how many edits","hypotenuse","item number","levenshtein","nth","position","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.editDistance",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-7c1810f8","guard":[["hasAny",["changes to turn","edit distance","element","how many edits","item number","join","joined with","levenshtein","nth","position","protocols","separated by"]],["has","give"]],"pyramid":["render.number",["compute.editDistance",["sense.lastWord"],["transform.join",["sense.content"],["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-922ef12d","guard":[["hasAny",["continue","element","how many letters","item number","leading zeros","letter count","nth","number of letters","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.number",["aggregate.letters",["transform.padStart",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100},["sense.lastWord"]]]],"mem":null},
{"id":"n-ad967d3c","guard":[["hasAny",["as a percentage","at which position","continue","element","index of","item number","nth","percent is","position","position of","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.indexOf",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-ade223fa","guard":[["hasAny",["as a percentage","changes to turn","edit distance","element","how many edits","item number","levenshtein","nth","other","percent is","position","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",{"lit":100},["compute.editDistance",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.text"]]]],"mem":null},
{"id":"n-c434a9e6","guard":[["hasAny",["at which position","continue","element","index of","item number","lowest terms","nth","position","position of","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.indexOf",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-d3a59ad0","guard":[["hasAny",["after a discount","changes to turn","continue","discount","edit distance","element","how many edits","item number","levenshtein","nth","off","position","reduced by","sale price"]]],"pyramid":["render.number",["compute.discount",{"lit":100},["compute.editDistance",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-dc215450","guard":[["hasAny",["after years at","compound interest","compounded","element","grows to","how many words","item number","nth","number of words","position","protocols","word count"]],["has","give"]],"pyramid":["render.number",["compute.compound",["aggregate.words",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]],{"lit":4},{"lit":100}]],"mem":null},
{"id":"n-f76389f8","guard":[["hasAny",["after years at","compound interest","compounded","consonant count","element","grows to","how many consonants","item number","nth","number of consonants","ok","position"]],["has","for"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":100},["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-637b3da3","guard":[["hasAny",["alphabetize the letters","element","item number","letters in order","nth","position","sort the letters","used"]],["has","which"]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}]]],"mem":null},
{"id":"n-9750f327","guard":[["hasAny",["alphabetize the letters","each word","element","item number","letters in order","nth","position","sort the letters","split into words","used","words"]],["has","which"]],"pyramid":["render.list",["transform.words",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}]]]],"mem":null},
{"id":"n-a293baff","guard":[["hasAny",["alphabetize the letters","element","from base","from binary","from hex","in decimal","item number","letters in order","nth","position","sort the letters","to decimal","used"]],["has","which"]],"pyramid":["render.number",["compute.fromBase",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}]],{"lit":10}]],"mem":null},
{"id":"n-c6be938e","guard":[["hasAny",["before","element","from base","from binary","from hex","in decimal","item number","nth","one less","position","predecessor","previous","supported","to decimal"]]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["transform.prev",["sense.wordCount"]]]],"mem":null},
{"id":"n-9917e051","guard":[["hasAny",["continue","element","how many letters","item number","leading zeros","letter count","nth","number of letters","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.number",["aggregate.letters",["transform.padStart",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":100},["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-07127f3d","guard":[["hasAny",["bad","element","from base","from binary","from hex","how many letters","in decimal","item number","letter count","nth","number of letters","position","to decimal"]],["has","status"],["not",["has","gateway"]]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["aggregate.letters",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-1f176ebe","guard":[["hasAny",["allowed","consonant count","element","from base","from binary","from hex","how many consonants","in decimal","item number","nth","number of consonants","position","to decimal"]]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-332d848b","guard":[["hasAny",["also","element","from base","from binary","from hex","how many vowels","in decimal","item number","nth","number of vowels","position","to decimal","vowel count"]],["has","give"]],"pyramid":["render.number",["compute.fromBase",["know.lookup",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}],{"lit":"http-status-codes"},{"lit":"reason phrase"},{"lit":"HTTP status code"}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"http-status-codes"},{"lit":"reason phrase"}],{"lit":1}]]]],"mem":null},
{"id":"n-0b2f3c68","guard":[["hasAny",["arithmetic mean","ascii","ascii codes","character codes","code points","difference between the largest and smallest","unicode values","upgrade"]],["has","which"]],"pyramid":["render.number",["aggregate.mean",["iterate.squares",["aggregate.range",["transform.charCodes",["sense.lastWord"]]]]]],"mem":null},
{"id":"n-62fd70a0","guard":[["hasAny",["arithmetic mean","bad","character count","how many characters","number of characters"]],["has","request"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":100},["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-69ae1f23","guard":[["hasAny",["arithmetic mean","character count","how many characters","number of characters","processing"]],["has","means"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["aggregate.chars",["sense.text"]],["sense.wordCount"]]]],"mem":null},
{"id":"n-9188caaf","guard":[["hasAny",["arithmetic mean","difference between the largest and smallest","upgrade"]],["has","which"]],"pyramid":["render.number",["aggregate.mean",["iterate.squares",["aggregate.range",["iterate.squares",["sense.wordCount"]]]]]],"mem":null},
{"id":"n-00139866","guard":[["hasAny",["arithmetic mean","character count","created","how many characters","number of characters"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",{"lit":12},["aggregate.chars",["sense.text"]],{"lit":10}]]],"mem":null},
{"id":"n-069a9da0","guard":[["hasAny",["character count","difference between the largest and smallest","expectation","how many characters","number of characters"]],["has","for"]],"pyramid":["render.number",["aggregate.range",["iterate.growth",{"lit":3},["aggregate.chars",["sense.text"]],{"lit":12}]]],"mem":null},
{"id":"n-0cd60ced","guard":[["hasAny",["arithmetic mean","average","avg","character count","how many characters","mean","number of characters","processing"]],["has","which"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":12},["aggregate.chars",["sense.after",{"lit":"code"}]]]]],"mem":null},
{"id":"n-53ac77c4","guard":[["hasAny",["arithmetic mean","avg","character count","how many characters","no","number of characters"]],["has","http"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":101}]]],"mem":null},
{"id":"n-6796d9fe","guard":[["hasAny",["accepted","arithmetic mean","character count","how many characters","number of characters"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":100}]]],"mem":null},
{"id":"n-7b13b750","guard":[["hasAny",["arithmetic mean","character count","how many characters","number of characters","payment"]],["has","which"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",["sense.wordCount"],["aggregate.chars",["sense.lastWord"]],{"lit":100}]]],"mem":null},
{"id":"n-7fb132ee","guard":[["hasAny",["allowed","arithmetic mean","character count","how many characters","number of characters"]]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",["aggregate.chars",["sense.lastWord"]],{"lit":4},{"lit":200}]]],"mem":null},
{"id":"n-91a8dfca","guard":[["hasAny",["arithmetic mean","character count","how many characters","number of characters","reset"]],["has","http"],["not",["has","me"]]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",["aggregate.chars",["sense.lastWord"]],{"lit":4},{"lit":100}]]],"mem":null},
{"id":"n-96899c59","guard":[["hasAny",["arithmetic mean","character count","how many characters","insufficient","number of characters"]],["has","for"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",["aggregate.chars",["sense.lastWord"]],{"lit":1000},{"lit":2}]]],"mem":null},
{"id":"n-98690fe0","guard":[["hasAny",["arithmetic mean","character count","continue","how many characters","number of characters"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["sense.wordCount"],["aggregate.chars",["sense.after",{"lit":"of"}]]]]],"mem":null},
{"id":"n-c2eb39d3","guard":[["hasAny",["character count","difference between the largest and smallest","how many characters","number of characters","ok"]],["has","for"]],"pyramid":["render.number",["aggregate.range",["iterate.growth",{"lit":100},{"lit":100},["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-c87c7b2b","guard":[["hasAny",["accepted","arithmetic mean","avg","character count","how many characters","number of characters"]],["not",["colon"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":100}]]],"mem":null},
{"id":"n-d7158bfa","guard":[["hasAny",["arithmetic mean","character count","how many characters","number of characters","ok"]],["has","for"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":100},["aggregate.chars",["sense.wordAt",{"lit":3}]]]]],"mem":null},
{"id":"n-ebbe4abd","guard":[["hasAny",["allowed","arithmetic mean","avg","character count","how many characters","number of characters"]],["not",["colon"]]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",["aggregate.chars",["sense.lastWord"]],{"lit":4},{"lit":200}]]],"mem":null},
{"id":"n-15fde025","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["sense.wordCount"]]],"mem":null},
{"id":"n-202083f6","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]],["not",["quoted"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-2fccc6a6","guard":[["hasAny",["allowed","character count","digits backwards","digits reversed","how many characters","n factorial","number of characters","reverse the digits"]]],"pyramid":["render.number",["transform.reverseDigits",["compute.factorial",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-34487ad2","guard":[["hasAny",["allowed","character count","digits backwards","digits reversed","how many characters","n factorial","number of characters","reverse the digits"]],["not",["colon"]]],"pyramid":["render.number",["transform.reverseDigits",["compute.factorial",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-5e2074ef","guard":[["hasAny",["character count","copies","how many characters","number of characters","ok","say it times"]],["has","for"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["sense.lastWord"],{"lit":100}]]],"mem":null},
{"id":"n-60005c53","guard":[["hasAny",["bad","character count","how many characters","number of characters","square","squared","to the second power"]],["has","for"]],"pyramid":["render.number",["transform.square",["aggregate.chars",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-6d84b7c6","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]],["not",["quoted"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["sense.wordCount"]]],"mem":null},
{"id":"n-8434a41c","guard":[["hasAny",["character count","how many characters","length","nth prime","number of characters","protocols","the prime number in position"]],["has","give"]],"pyramid":["render.number",["compute.nthPrime",["aggregate.chars",["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-9199b9bf","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]],["not",["colon"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-9e76f973","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":8},["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-a925242a","guard":[["hasAny",["character count","how many characters","least common multiple","lowest common multiple","number of characters","processing"]],["has","means"]],"pyramid":["render.number",["compute.lcm",{"lit":3},["aggregate.chars",["sense.text"]]]],"mem":null},
{"id":"n-b30cfe1a","guard":[["hasAny",["difference between the largest and smallest","supported"]],["has","give"]],"pyramid":["render.number",["aggregate.range",["iterate.cumsum",["iterate.squares",["sense.wordCount"]]]]],"mem":null},
{"id":"n-bacd316e","guard":[["hasAny",["allowed","character count","digits backwards","digits reversed","how many characters","n factorial","number of characters","reverse the digits"]],["not",["quoted"]]],"pyramid":["render.number",["transform.reverseDigits",["compute.factorial",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-bfed995a","guard":[["hasAny",["ascii","ascii codes","character codes","code points","continue","difference between the largest and smallest","two times","unicode values"]]],"pyramid":["render.number",["transform.double",["aggregate.range",["transform.charCodes",["sense.lastWord"]]]]],"mem":null},
{"id":"n-cbe7d030","guard":[["hasAny",["character count","continue","growth rate","how many characters","number of characters","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",{"lit":4},["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-d8ebe41b","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-ed5a0e66","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-eeccdc71","guard":[["hasAny",["bad","character count","cubed","how many characters","number of characters","sum of divisors","sum of factors","sum of the divisors","to the third power"]],["has","request"]],"pyramid":["render.number",["compute.divisorSum",["transform.cube",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-fc274cba","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]],["not",["colon"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["sense.wordCount"]]],"mem":null},
{"id":"n-fd99da70","guard":[["hasAny",["character count","copies","how many characters","number of characters","processing","say it times"]],["has","means"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["sense.text"],{"lit":3}]]],"mem":null},
{"id":"n-00f81628","guard":[["hasAny",["as a percentage","bad","character count","how many characters","number of characters","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.before",{"lit":"status"}]],{"lit":4}]],"mem":null},
{"id":"n-0108f27f","guard":[["hasAny",["arithmetic mean","as a percentage","bad","how long each","length of each","lengths","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["aggregate.mean",["transform.lengths",["sense.words"]]],{"lit":1}]],"mem":null},
{"id":"n-022e2113","guard":[["hasAny",["bad","character count","growth rate","how many characters","number of characters","percent change","percent decrease","percent increase","percentage change"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",{"lit":3},["aggregate.chars",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-02c290a2","guard":[["hasAny",["as a percentage","bad","character count","how many characters","number of characters","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.after",{"lit":"is"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-03721967","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-03c5160f","guard":[["hasAny",["character count","copies","how many characters","number of characters","ok","say it times"]],["has","for"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["sense.wordAt",{"lit":2}],{"lit":100}]]],"mem":null},
{"id":"n-059cb71e","guard":[["hasAny",["arithmetic mean","as a percentage","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.mean",["iterate.digits",["sense.wordCount"]]],{"lit":4}]],"mem":null},
{"id":"n-066f15ea","guard":[["hasAny",["bad","character count","how many characters","lcm","least common multiple","lowest common multiple","number of characters"]],["has","for"]],"pyramid":["render.number",["compute.lcm",{"lit":100},["aggregate.chars",["sense.before",{"lit":"status"}]]]],"mem":null},
{"id":"n-07cc556e","guard":[["hasAny",["bad","difference between the largest and smallest","each times","how long each","length of each","lengths","multiply each"]],["has","request"]],"pyramid":["render.number",["aggregate.range",["transform.mapMul",["transform.lengths",["sense.content"]],{"lit":100}]]],"mem":null},
{"id":"n-080eeb02","guard":[["hasAny",["arithmetic mean","as a percentage","continue","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.mean",["iterate.digits",["sense.wordCount"]]]]],"mem":null},
{"id":"n-0bc753ad","guard":[["hasAny",["character count","how many characters","increase by","markup","number of characters","permanent","plus tax","raise by","with tax"]]],"pyramid":["render.number",["compute.increase",["aggregate.chars",["sense.before",{"lit":"for"}]],{"lit":1000}]],"mem":null},
{"id":"n-0d652efa","guard":[["hasAny",["as a percentage","character count","continue","digits backwards","digits reversed","how many characters","number of characters","percent is","reverse the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-0dbc1c0b","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.base64",["sense.lastWord"]]],{"lit":2}]],"mem":null},
{"id":"n-115c83f5","guard":[["hasAny",["as a percentage","difference between the largest and smallest","how long each","length of each","lengths","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.range",["transform.lengths",["sense.content"]]],{"lit":2}]],"mem":null},
{"id":"n-1170060b","guard":[["hasAny",["as a percentage","character count","divisor count","how many characters","how many factors","number of characters","number of divisors","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.divisorCount",["aggregate.chars",["sense.lastWord"]]],{"lit":1}]],"mem":null},
{"id":"n-11b315c3","guard":[["hasAny",["as a percentage","character count","how many characters","n factorial","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.factorial",["aggregate.chars",["sense.lastWord"]]],{"lit":1}]],"mem":null},
{"id":"n-129b5a3c","guard":[["hasAny",["difference between the largest and smallest","fib","ok"]],["has","for"]],"pyramid":["render.number",["aggregate.range",["iterate.multiples",{"lit":10},["compute.fibonacci",["sense.wordCount"]]]]],"mem":null},
{"id":"n-12d94519","guard":[["hasAny",["after a discount","continue","difference between the largest and smallest","reduced by","sale price"]]],"pyramid":["render.number",["compute.discount",{"lit":100},["aggregate.range",["iterate.digits",["sense.wordCount"]]]]],"mem":null},
{"id":"n-1425187d","guard":[["hasAny",["arithmetic mean","processing"]],["has","means"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",{"lit":100},{"lit":1},["sense.wordCount"]]]],"mem":null},
{"id":"n-14de4fad","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-16012206","guard":[["hasAny",["as a percentage","character count","digits backwards","digits reversed","how many characters","number of characters","ok","percent is","reverse the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.reverseDigits",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-180d02cf","guard":[["hasAny",["arithmetic mean","continue","nth prime","the prime number in position"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":10},["compute.nthPrime",["sense.wordCount"]]]]],"mem":null},
{"id":"n-1a57de81","guard":[["hasAny",["accepted","character count","convert to base","how many characters","in base","in binary","in octal","number of characters","to binary","to hex"]]],"pyramid":["render.str",["compute.toBase",{"lit":20},["aggregate.chars",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-1f886442","guard":[["hasAny",["character count","continue","growth rate","how many characters","number of characters","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",{"lit":12},["aggregate.chars",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-2147d7bd","guard":[["hasAny",["bad","character count","how many characters","number of characters","population variance","variance"]],["has","request"]],"pyramid":["render.number",["aggregate.variance",["iterate.multiples",{"lit":10},["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-21baa07c","guard":[["hasAny",["arithmetic mean","avg","no"]],["has","http"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",{"lit":200},{"lit":1},["sense.wordCount"]]]],"mem":null},
{"id":"n-236aaa26","guard":[["hasAny",["continue","difference between the largest and smallest","factorise","factorize","increase by","plus tax","prime factorisation","prime factorization","raise by","with tax"]]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.range",["compute.primeFactors",["sense.wordCount"]]]]],"mem":null},
{"id":"n-2427066e","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.after",{"lit":"code"}]],{"lit":3}]],"mem":null},
{"id":"n-273092e3","guard":[["hasAny",["as a percentage","ascii","ascii codes","character codes","code points","difference between the largest and smallest","ok","percent is","unicode values","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.range",["transform.charCodes",["sense.lastWord"]]]]],"mem":null},
{"id":"n-2c309482","guard":[["hasAny",["continue","difference between the largest and smallest","fib"]]],"pyramid":["render.number",["aggregate.range",["iterate.multiples",{"lit":5},["compute.fibonacci",["sense.wordCount"]]]]],"mem":null},
{"id":"n-2d88d7f8","guard":[["hasAny",["character count","how many characters","lowest","number of characters","protocols","smallest"]],["has","give"]],"pyramid":["render.number",["aggregate.min",["iterate.multiples",{"lit":101},["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-2dee5f62","guard":[["hasAny",["difference between the largest and smallest","each times","multiply each","no","scale","spread"]],["has","http"]],"pyramid":["render.number",["aggregate.range",["transform.mapMul",["iterate.collatz",["sense.wordCount"]],{"lit":4}]]],"mem":null},
{"id":"n-2e8d8a54","guard":[["hasAny",["arithmetic mean","temporary"]],["has","which"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",{"lit":10},["sense.wordCount"],{"lit":100}]]],"mem":null},
{"id":"n-30183d18","guard":[["hasAny",["arithmetic mean","ascii","ascii codes","character codes","code points","odd numbers","odds","protocols","the odd ones","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["transform.odds",["transform.charCodes",["sense.wordAt",{"lit":2}]]]]],"mem":null},
{"id":"n-3143e59a","guard":[["hasAny",["as a percentage","as a roman numeral","character count","how many characters","in roman numerals","number of characters","ok","percent is","roman numeral","to roman","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["compute.toRoman",["sense.wordCount"]]],{"lit":2}]],"mem":null},
{"id":"n-317ee900","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.chars",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-3661332b","guard":[["hasAny",["character count","growth rate","how many characters","number of characters","ok","percent change","percent decrease","percent increase"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",{"lit":1},["aggregate.chars",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-370071f2","guard":[["hasAny",["as a percentage","character count","digits backwards","digits reversed","how many characters","number of characters","ok","percent is","reverse the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["aggregate.chars",["sense.lastWord"]]],{"lit":1}]],"mem":null},
{"id":"n-379242bd","guard":[["hasAny",["as a percentage","character count","continue","divisor count","how many characters","how many factors","number of characters","number of divisors","percent is","what percent","what percentage"]],["has","http"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.divisorCount",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-37b145e9","guard":[["hasAny",["as a percentage","bad","character count","digit count","how many characters","how many digits","number of characters","number of digits","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.digitCount",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-39789227","guard":[["hasAny",["as a percentage","character count","continue","digits backwards","digits reversed","how many characters","number of characters","percent is","reverse the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.wordCount"]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-3cc4f4fa","guard":[["hasAny",["as a percentage","character count","continue","divisor count","how many characters","how many factors","number of characters","number of divisors","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["compute.divisorCount",["aggregate.chars",["sense.text"]]]]],"mem":null},
{"id":"n-3d1ac6a7","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["transform.base64",["sense.lastWord"]]]]],"mem":null},
{"id":"n-3e0877e4","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","two times","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.double",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-3e88ecbd","guard":[["hasAny",["as a percentage","bad","character count","how many characters","number of characters","percent is","sum of divisors","sum of factors","sum of the divisors","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["compute.divisorSum",["aggregate.chars",["sense.lastWord"]]],{"lit":2}]],"mem":null},
{"id":"n-3f3048eb","guard":[["hasAny",["as a percentage","character count","divisor count","how many characters","how many factors","number of characters","number of divisors","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.divisorCount",["sense.wordCount"]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-3fc9c570","guard":[["hasAny",["accepted","arithmetic mean","average","how many vowels","number of vowels","vowel count"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":101},["aggregate.vowels",["sense.lastWord"]]]]],"mem":null},
{"id":"n-40ed3b4a","guard":[["hasAny",["arithmetic mean","continue","digit count","how many digits","number of digits"]]],"pyramid":["render.number",["aggregate.mean",["iterate.powers",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]]],"mem":null},
{"id":"n-43020505","guard":[["hasAny",["also","arrangements","character count","how many characters","number of characters","ordered selections","permutations","ways to arrange"]],["has","give"]],"pyramid":["render.number",["compute.permutations",["aggregate.chars",["sense.after",{"lit":"status"}]],{"lit":2}]],"mem":null},
{"id":"n-4484cd3c","guard":[["hasAny",["as a percentage","character count","how many characters","longest one","longest word","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["aggregate.longest",["sense.words"]]],{"lit":3}]],"mem":null},
{"id":"n-4579c93f","guard":[["hasAny",["add the digits","as a percentage","character count","digit sum","how many characters","number of characters","ok","percent is","sum of the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.digitSum",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-45cd481c","guard":[["hasAny",["as a percentage","difference between the largest and smallest","how long each","length of each","lengths","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.range",["transform.lengths",["sense.content"]]]]],"mem":null},
{"id":"n-481ea9e0","guard":[["hasAny",["as a percentage","character count","how many characters","month name","name of month","number of characters","ok","percent is","what percent","what percentage","which month"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["compute.monthName",["sense.wordCount"]]],{"lit":3}]],"mem":null},
{"id":"n-48f4b2dd","guard":[["hasAny",["character count","continue","first letters of the name","how many characters","initials","joined with","number of characters","separated by"]]],"pyramid":["render.number",["aggregate.chars",["transform.initials",["transform.join",["sense.words"],["sense.text"]]]]],"mem":null},
{"id":"n-4a4fb076","guard":[["hasAny",["as a percentage","difference between the largest and smallest","how long each","length of each","lengths","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.range",["transform.lengths",["sense.words"]]],{"lit":2}]],"mem":null},
{"id":"n-4ae01290","guard":[["hasAny",["arithmetic mean","continue","factorise","factorize","hypotenuse","prime factorisation","prime factorization","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.mean",["compute.primeFactors",["sense.wordCount"]]]]],"mem":null},
{"id":"n-4eb4e360","guard":[["hasAny",["bad","character count","copies","how many characters","number of characters","say it times"]],["has","request"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["sense.wordAt",{"lit":1}],{"lit":100}]]],"mem":null},
{"id":"n-4f6e56e4","guard":[["hasAny",["add the digits","as a percentage","character count","continue","digit sum","how many characters","number of characters","percent is","sum of the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitSum",["aggregate.chars",["sense.lastWord"]]],["sense.wordCount"]]],"mem":null},
{"id":"n-5077e236","guard":[["hasAny",["arithmetic mean","as a percentage","how long each","length of each","lengths","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.mean",["transform.lengths",["sense.content"]]]]],"mem":null},
{"id":"n-5078aff6","guard":[["hasAny",["as a percentage","character count","continue","how many characters","how many words","number of characters","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-507e715d","guard":[["hasAny",["bad","character count","copies","how many characters","number of characters","say it times"]],["has","for"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["sense.before",{"lit":"is"}],{"lit":100}]]],"mem":null},
{"id":"n-51e1753e","guard":[["hasAny",["as a percentage","character count","how many characters","longest one","longest word","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.chars",["aggregate.longest",["sense.words"]]]]],"mem":null},
{"id":"n-53c6be18","guard":[["hasAny",["as a percentage","character count","continue","divisor count","how many characters","how many factors","number of characters","number of divisors","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["compute.divisorCount",["aggregate.chars",["sense.lastWord"]]],{"lit":4}]],"mem":null},
{"id":"n-54e0e56b","guard":[["hasAny",["character count","continue","growth rate","how many characters","number of characters","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",["aggregate.chars",["sense.wordAt",{"lit":1}]],["sense.wordCount"]]],"mem":null},
{"id":"n-5686876a","guard":[["hasAny",["character count","how many characters","multiplied together","multiply them all","number of characters","ok"]],["has","for"]],"pyramid":["render.number",["aggregate.product",["iterate.multiples",{"lit":10},["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-5a63abbc","guard":[["hasAny",["as a percentage","difference between the largest and smallest","how long each","length of each","lengths","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.range",["transform.lengths",["sense.words"]]]]],"mem":null},
{"id":"n-5b61ba00","guard":[["hasAny",["as a percentage","bad","character count","how many characters","next prime","number of characters","percent is","smallest prime greater than","the prime after","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.text"]],["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-5b77d097","guard":[["hasAny",["as a percentage","bad","character count","how many characters","most common letter","most frequent letter","number of characters","percent is","what percent","what percentage","which letter appears most"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["aggregate.commonLetter",["sense.lastWord"]]]]],"mem":null},
{"id":"n-5b794541","guard":[["hasAny",["character count","continue","how many characters","lowest terms","most common letter","most frequent letter","number of characters","reduce the fraction","simplest form","simplify the fraction","which letter appears most"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.chars",["aggregate.commonLetter",["sense.lastWord"]]]]],"mem":null},
{"id":"n-5bfa6eb2","guard":[["hasAny",["arithmetic mean","ascii","ascii codes","character codes","code points","conflict","each times","multiply each","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["transform.mapMul",["transform.charCodes",["sense.lastWord"]],{"lit":4}]]],"mem":null},
{"id":"n-5c51914d","guard":[["hasAny",["arithmetic mean","as a percentage","continue","factorise","factorize","percent is","prime factorisation","prime factorization","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.mean",["compute.primeFactors",["sense.wordCount"]]]]],"mem":null},
{"id":"n-5c5d108c","guard":[["hasAny",["as a percentage","character count","fib","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["compute.fibonacci",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-5c71e848","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.after",{"lit":"status"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-5fcb9712","guard":[["hasAny",["character count","copies","dashes","how many characters","hyphens","kebab case","kebabcase","number of characters","ok","say it times"]],["has","for"]],"pyramid":["render.number",["aggregate.chars",["transform.kebab",["transform.repeat",["sense.lastWord"],{"lit":100}]]]],"mem":null},
{"id":"n-5fe70793","guard":[["hasAny",["accepted","arithmetic mean","divisor count","how many factors","number of divisors"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["compute.divisorCount",["sense.wordCount"]],{"lit":100}]]],"mem":null},
{"id":"n-602d9b6f","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","to the second power","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.square",["aggregate.chars",["sense.lastWord"]]],{"lit":2}]],"mem":null},
{"id":"n-603eceeb","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","shortest","shortest one","shortest word","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["aggregate.shortest",["sense.words"]]]]],"mem":null},
{"id":"n-63a21135","guard":[["hasAny",["abbreviate","as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":5},["aggregate.chars",["transform.acronym",["sense.text"]]]]],"mem":null},
{"id":"n-6447d37d","guard":[["hasAny",["arithmetic mean","bad"]],["has","request"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",["sense.howMany"],{"lit":100},["sense.wordCount"]]]],"mem":null},
{"id":"n-64d7e18c","guard":[["hasAny",["difference between the largest and smallest","double","no","spread","twice","two times"]],["has","http"]],"pyramid":["render.number",["aggregate.range",["iterate.multiples",{"lit":12},["transform.double",["sense.wordCount"]]]]],"mem":null},
{"id":"n-65290b06","guard":[["hasAny",["add the digits","character count","continue","digit sum","exponent","how many characters","number of characters","raised to","sum of the digits","to the power of"]]],"pyramid":["render.number",["aggregate.digitSum",["compute.power",["aggregate.chars",["sense.text"]],{"lit":12}]]],"mem":null},
{"id":"n-65551a72","guard":[["hasAny",["continue","difference between the largest and smallest","factorise","factorize","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","prime factorisation","prime factorization"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["aggregate.range",["compute.primeFactors",["sense.wordCount"]]]]],"mem":null},
{"id":"n-67297a1b","guard":[["hasAny",["as a percentage","character count","digit count","how many characters","how many digits","number of characters","number of digits","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.digitCount",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-679918c6","guard":[["hasAny",["as a percentage","bad","character count","how many characters","number of characters","percent is","shortest","shortest one","shortest word","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.chars",["aggregate.shortest",["sense.content"]]]]],"mem":null},
{"id":"n-69814ade","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.wordAt",{"lit":2}]],{"lit":3}]],"mem":null},
{"id":"n-6ab611ed","guard":[["hasAny",["add the digits","as a percentage","character count","continue","digit sum","how many characters","number of characters","percent is","sum of the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-6b5ecd19","guard":[["hasAny",["after a discount","continue","difference between the largest and smallest","factorise","factorize","prime factorisation","prime factorization","reduced by","sale price"]]],"pyramid":["render.number",["compute.discount",{"lit":100},["aggregate.range",["compute.primeFactors",["sense.wordCount"]]]]],"mem":null},
{"id":"n-6c337177","guard":[["hasAny",["add the digits","allowed","binomial coefficient","character count","combinations","digit sum","how many characters","n choose k","number of characters","sum of the digits","ways to choose"]]],"pyramid":["render.number",["aggregate.digitSum",["compute.choose",{"lit":1000},["aggregate.chars",["sense.text"]]]]],"mem":null},
{"id":"n-6c69c675","guard":[["hasAny",["character count","continue","convert to base","how many characters","in base","in binary","in octal","number of characters","to binary","to hex"]]],"pyramid":["render.str",["compute.toBase",{"lit":9},["aggregate.chars",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-6d224132","guard":[["hasAny",["difference between the largest and smallest","lowest terms","ok","prime numbers less than","primes below","primes under","primes up to","reduce the fraction","simplest form","simplify the fraction"]],["has","for"]],"pyramid":["render.str",["compute.fraction",{"lit":1000},["aggregate.range",["compute.primesUpTo",["sense.wordCount"]]]]],"mem":null},
{"id":"n-6db404c1","guard":[["hasAny",["arithmetic mean","as a percentage","continue","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.mean",["iterate.digits",["sense.wordCount"]]],["sense.wordCount"]]],"mem":null},
{"id":"n-7355d9f5","guard":[["hasAny",["as a percentage","character count","continue","digits backwards","digits reversed","how many characters","number of characters","percent is","reverse the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["aggregate.chars",["sense.lastWord"]]],["sense.wordCount"]]],"mem":null},
{"id":"n-74ecdbdb","guard":[["hasAny",["as a percentage","character count","continue","how many characters","how many words","number of characters","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.text"]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-76b6f5da","guard":[["hasAny",["as a percentage","character count","continue","digit count","how many characters","how many digits","number of characters","number of digits","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitCount",["aggregate.chars",["sense.lastWord"]]],{"lit":1}]],"mem":null},
{"id":"n-77cc2a18","guard":[["hasAny",["as a percentage","bad","character count","how many characters","number of characters","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.chars",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-77dd885b","guard":[["hasAny",["character count","copies","how many characters","number of characters","ok","say it times","shortest","shortest one","shortest word"]],["has","for"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["aggregate.shortest",["sense.words"]],{"lit":100}]]],"mem":null},
{"id":"n-7816e6ba","guard":[["hasAny",["arithmetic mean","as a percentage","continue","factorise","factorize","percent is","prime factorisation","prime factorization","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.mean",["compute.primeFactors",["sense.wordCount"]]],{"lit":2}]],"mem":null},
{"id":"n-789f8279","guard":[["hasAny",["difference between the largest and smallest","each times","multiply each","no"]],["has","http"]],"pyramid":["render.number",["aggregate.range",["transform.mapMul",["iterate.collatz",["sense.wordCount"]],{"lit":4}]]],"mem":null},
{"id":"n-79e5ba16","guard":[["hasAny",["as a percentage","character count","cubed","how many characters","number of characters","ok","percent is","to the third power","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.cube",["aggregate.chars",["sense.lastWord"]]],{"lit":4}]],"mem":null},
{"id":"n-7c11fd6a","guard":[["hasAny",["arithmetic mean","as a percentage","how long each","length of each","lengths","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.mean",["transform.lengths",["sense.content"]]],{"lit":2}]],"mem":null},
{"id":"n-7ca70e9c","guard":[["hasAny",["ascii","ascii codes","character codes","code points","difference between the largest and smallest","reset","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.range",["iterate.cumsum",["transform.charCodes",["sense.wordAt",{"lit":2}]]]]],"mem":null},
{"id":"n-7df6c556","guard":[["hasAny",["as a percentage","character count","how many characters","how many vowels","number of characters","number of vowels","ok","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-7f58c86c","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-7f77ffc7","guard":[["hasAny",["as a percentage","continue","difference between the largest and smallest","how long each","length of each","lengths","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.range",["transform.lengths",["sense.content"]]],{"lit":4}]],"mem":null},
{"id":"n-8056516d","guard":[["hasAny",["character count","continue","growth rate","how many characters","number of characters","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",["aggregate.chars",["sense.wordAt",{"lit":3}]],{"lit":12}]],"mem":null},
{"id":"n-843cf47e","guard":[["hasAny",["difference between the largest and smallest","no","two times"]],["has","http"]],"pyramid":["render.number",["aggregate.range",["iterate.multiples",{"lit":12},["transform.double",["sense.wordCount"]]]]],"mem":null},
{"id":"n-89553bf9","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]],["not",["colon"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-8a6cfc44","guard":[["hasAny",["character count","continue","how many characters","hypotenuse","number of characters","pythagoras","pythagorean","root of","sqrt","square root"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.sqrt",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-8b47495e","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","shortest","shortest one","shortest word","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["aggregate.shortest",["sense.content"]]],{"lit":4}]],"mem":null},
{"id":"n-8e972a3c","guard":[["hasAny",["as a percentage","difference between the largest and smallest","ok","percent is","prime numbers less than","primes below","primes under","primes up to","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["aggregate.range",["compute.primesUpTo",["sense.wordCount"]]]]],"mem":null},
{"id":"n-8ea3337b","guard":[["hasAny",["arithmetic mean","reset","to the second power"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":5},["transform.square",["sense.wordCount"]]]]],"mem":null},
{"id":"n-8f43ec44","guard":[["hasAny",["arithmetic mean","supported"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",{"lit":5},{"lit":100},["sense.wordCount"]]]],"mem":null},
{"id":"n-902e50a2","guard":[["hasAny",["as a percentage","as a roman numeral","character count","continue","how many characters","in roman numerals","number of characters","percent is","roman numeral","to roman","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["compute.toRoman",["sense.wordCount"]]],{"lit":4}]],"mem":null},
{"id":"n-91648030","guard":[["hasAny",["character count","copies","how many characters","number of characters","ok","repeat","say it times"]]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["sense.after",{"lit":"for"}],{"lit":100}]]],"mem":null},
{"id":"n-923759fd","guard":[["hasAny",["arithmetic mean","factorise","factorize","prime factorisation","prime factorization","processing","take away"]],["has","means"]],"pyramid":["render.number",["aggregate.mean",["compute.primeFactors",["transform.sub",{"lit":1000},["sense.wordCount"]]]]],"mem":null},
{"id":"n-954d032e","guard":[["hasAny",["character count","convert to base","how many characters","in base","in binary","in octal","length","number of characters","ok","to binary","to hex"]],["has","for"]],"pyramid":["render.str",["compute.toBase",["aggregate.chars",["sense.after",{"lit":"http"}]],{"lit":3}]],"mem":null},
{"id":"n-958e352f","guard":[["hasAny",["as a percentage","character count","divisor count","how many characters","how many factors","number of characters","number of divisors","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["compute.divisorCount",["aggregate.chars",["sense.text"]]]]],"mem":null},
{"id":"n-969bf84b","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.before",{"lit":"is"}]],{"lit":2}]],"mem":null},
{"id":"n-9858ad08","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","one less","percent is","predecessor","previous","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["transform.prev",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-988455bd","guard":[["hasAny",["character count","continue","how many characters","hypotenuse","number of characters","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.chars",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-9af4cc36","guard":[["hasAny",["character count","how many characters","number of characters","population variance","processing","variance"]],["has","means"]],"pyramid":["render.number",["aggregate.variance",["iterate.rangeFrom",["sense.howMany"],["aggregate.chars",["sense.text"]]]]],"mem":null},
{"id":"n-9d745651","guard":[["hasAny",["acceptable","binomial coefficient","character count","combinations","how many characters","n choose k","nth prime","number of characters","the prime number in position","ways to choose"]]],"pyramid":["render.number",["compute.choose",["compute.nthPrime",["aggregate.chars",["sense.lastWord"]]],{"lit":2}]],"mem":null},
{"id":"n-9de5cfdd","guard":[["hasAny",["bad","difference between the largest and smallest","to the second power"]],["has","request"]],"pyramid":["render.number",["aggregate.range",["iterate.multiples",{"lit":5},["transform.square",["sense.wordCount"]]]]],"mem":null},
{"id":"n-9e42b21b","guard":[["hasAny",["as a percentage","character count","first letters of the name","how many characters","initials","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.initials",["sense.text"]]],["sense.wordCount"]]],"mem":null},
{"id":"n-9ec94477","guard":[["hasAny",["after a discount","bad","character count","how many characters","number of characters","reduced by","sale price"]],["has","request"]],"pyramid":["render.number",["compute.discount",{"lit":1000},["aggregate.chars",["transform.base64",["sense.text"]]]]],"mem":null},
{"id":"n-9fd1531f","guard":[["hasAny",["difference between the largest and smallest","reset"]],["has","give"]],"pyramid":["render.number",["aggregate.range",["iterate.growth",{"lit":1000},["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-a02894e2","guard":[["hasAny",["continue","difference between the largest and smallest","next prime","smallest prime greater than","the prime after"]]],"pyramid":["render.number",["aggregate.range",["iterate.multiples",{"lit":10},["compute.nextPrime",["sense.wordCount"]]]]],"mem":null},
{"id":"n-a07fa25f","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","shortest","shortest one","shortest word","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["aggregate.shortest",["sense.words"]]],{"lit":2}]],"mem":null},
{"id":"n-a0e843e7","guard":[["hasAny",["character count","how many characters","increase by","most common letter","most frequent letter","number of characters","plus tax","protocols","raise by","which letter appears most","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.chars",["aggregate.commonLetter",["sense.lastWord"]]]]],"mem":null},
{"id":"n-a199553b","guard":[["hasAny",["arithmetic mean","as a percentage","bad","factorise","factorize","percent is","prime factorisation","prime factorization","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.mean",["compute.primeFactors",["sense.wordCount"]]]]],"mem":null},
{"id":"n-a2837a0e","guard":[["hasAny",["arithmetic mean","avg","continue","digit count","how many digits","number of digits"]],["not",["colon"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]]],"mem":null},
{"id":"n-a28a401e","guard":[["hasAny",["as a percentage","bad","character count","how many characters","most common letter","most frequent letter","number of characters","percent is","what percent","what percentage","which letter appears most"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["aggregate.commonLetter",["sense.text"]]]]],"mem":null},
{"id":"n-a29144d0","guard":[["hasAny",["character count","copies","how many characters","how many vowels","number of characters","number of vowels","processing","say it times","vowel count"]],["has","means"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["sense.text"],["aggregate.vowels",["sense.lastWord"]]]]],"mem":null},
{"id":"n-a2ae85d4","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","shortest","shortest one","shortest word","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.chars",["aggregate.shortest",["sense.words"]]]]],"mem":null},
{"id":"n-a44d14fc","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.chars",["transform.base64",["sense.lastWord"]]]]],"mem":null},
{"id":"n-a656f5b8","guard":[["hasAny",["bad","character count","growth rate","how many characters","number of characters","percent change","percent decrease","percent increase"]],["has","request"]],"pyramid":["render.number",["compute.percentChange",["aggregate.chars",["sense.wordAt",{"lit":2}]],{"lit":10}]],"mem":null},
{"id":"n-a733b444","guard":[["hasAny",["as a percentage","character count","digit count","how many characters","how many digits","number of characters","number of digits","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-a7ae689b","guard":[["hasAny",["binomial coefficient","character count","combinations","continue","digit count","how many characters","how many digits","n choose k","number of characters","number of digits","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.digitCount",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-a8411e45","guard":[["hasAny",["character count","how many characters","hypotenuse","number of characters","processing","pythagoras","pythagorean","two times"]],["has","means"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.double",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-aaa1e9c6","guard":[["hasAny",["add the digits","as a percentage","character count","continue","digit sum","how many characters","number of characters","percent is","sum of the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.digitSum",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-aafb0f27","guard":[["hasAny",["as a percentage","character count","how many characters","n factorial","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.factorial",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-abbcadb4","guard":[["hasAny",["accepted","character count","copies","how many characters","number of characters","say it times","shortest","shortest one","shortest word"]]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["aggregate.shortest",["sense.words"]],{"lit":101}]]],"mem":null},
{"id":"n-ac31ef2c","guard":[["hasAny",["arithmetic mean","ascii","ascii codes","average","avg","character codes","code points","continue","even numbers","evens","the even ones","unicode values"]]],"pyramid":["render.number",["aggregate.mean",["transform.evens",["transform.charCodes",["sense.after",{"lit":"http"}]]]]],"mem":null},
{"id":"n-ad81f5db","guard":[["hasAny",["arithmetic mean","as a percentage","factorise","factorize","ok","percent is","prime factorisation","prime factorization","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.mean",["compute.primeFactors",["sense.wordCount"]]]]],"mem":null},
{"id":"n-adcb5944","guard":[["hasAny",["character count","copies","how many characters","number of characters","ok","say it times","shortest","shortest one","shortest word"]],["has","for"]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["aggregate.shortest",["sense.content"]],{"lit":100}]]],"mem":null},
{"id":"n-af5574cf","guard":[["hasAny",["character count","continue","convert to base","how many characters","in base","in binary","in octal","number of characters","to binary","to hex"]]],"pyramid":["render.str",["compute.toBase",["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-b03d1748","guard":[["hasAny",["as a percentage","as a roman numeral","character count","continue","how many characters","in roman numerals","number of characters","percent is","roman numeral","to roman","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["compute.toRoman",["sense.wordCount"]]]]],"mem":null},
{"id":"n-b241e342","guard":[["hasAny",["as a percentage","character count","continue","halve","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.half",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-b2562c5d","guard":[["hasAny",["arithmetic mean","each times","factorise","factorize","multiply each","ok","prime factorisation","prime factorization"]],["has","for"]],"pyramid":["render.number",["aggregate.mean",["transform.mapMul",["compute.primeFactors",["sense.wordCount"]],{"lit":100}]]],"mem":null},
{"id":"n-b28120de","guard":[["hasAny",["as a percentage","as a roman numeral","character count","how many characters","in roman numerals","number of characters","ok","percent is","roman numeral","to roman","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["compute.toRoman",["sense.wordCount"]]]]],"mem":null},
{"id":"n-b4549b43","guard":[["hasAny",["arithmetic mean","how many letters","letter count","number of letters","reset"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":10},["aggregate.letters",["sense.text"]]]]],"mem":null},
{"id":"n-b5b56f8d","guard":[["hasAny",["as a percentage","ascii","ascii codes","character codes","code points","difference between the largest and smallest","ok","percent is","unicode values","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.range",["transform.charCodes",["sense.lastWord"]]],{"lit":2}]],"mem":null},
{"id":"n-b75edafc","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","to the second power","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.square",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-b9016b4c","guard":[["hasAny",["add the digits","as a percentage","bad","character count","digit sum","how many characters","number of characters","percent is","sum of the digits","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitSum",["aggregate.chars",["sense.text"]]],{"lit":2}]],"mem":null},
{"id":"n-baba75b8","guard":[["hasAny",["as a percentage","character count","how many characters","how many items","number of characters","number of items","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.countStrs",["sense.content"]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-bad7f609","guard":[["hasAny",["as a percentage","continue","difference between the largest and smallest","how long each","length of each","lengths","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.range",["transform.lengths",["sense.content"]]]]],"mem":null},
{"id":"n-bd548f4e","guard":[["hasAny",["add up","altogether","character count","combined","continue","how many characters","in all","number of characters","prime numbers less than","primes below","primes under","primes up to","total"]]],"pyramid":["render.number",["aggregate.sum",["compute.primesUpTo",["aggregate.chars",["sense.before",{"lit":"status"}]]]]],"mem":null},
{"id":"n-bd9d67f5","guard":[["hasAny",["character count","copies","dashes","how many characters","hyphens","kebab case","kebabcase","number of characters","processing","say it times"]],["has","means"]],"pyramid":["render.number",["aggregate.chars",["transform.kebab",["transform.repeat",["sense.text"],{"lit":3}]]]],"mem":null},
{"id":"n-be512cf8","guard":[["hasAny",["character count","how many characters","increase by","most common letter","most frequent letter","number of characters","plus tax","protocols","raise by","which letter appears most","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.chars",["aggregate.commonLetter",["sense.text"]]]]],"mem":null},
{"id":"n-c02a5ad0","guard":[["hasAny",["character count","convert to base","how many characters","in base","in binary","in octal","length","number of characters","protocols","to binary","to hex"]],["has","give"]],"pyramid":["render.str",["compute.toBase",["aggregate.chars",["sense.after",{"lit":"http"}]],{"lit":5}]],"mem":null},
{"id":"n-c04f6bdb","guard":[["hasAny",["add the digits","as a percentage","character count","digit sum","how many characters","number of characters","ok","percent is","sum of the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitSum",["aggregate.chars",["sense.text"]]],{"lit":4}]],"mem":null},
{"id":"n-c1624a75","guard":[["hasAny",["abbreviate","as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.chars",["transform.acronym",["sense.text"]]]]],"mem":null},
{"id":"n-c4e26195","guard":[["hasAny",["accepted","arithmetic mean","halve"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["transform.half",["sense.wordCount"]],{"lit":100}]]],"mem":null},
{"id":"n-c5968327","guard":[["hasAny",["arithmetic mean","avg","continue","nth prime","the prime number in position"]],["not",["colon"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":10},["compute.nthPrime",["sense.wordCount"]]]]],"mem":null},
{"id":"n-c785ad65","guard":[["hasAny",["arithmetic mean","one less","predecessor","previous","supported"]],["has","give"]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["transform.prev",["sense.wordCount"]],{"lit":100}]]],"mem":null},
{"id":"n-c7d3006c","guard":[["hasAny",["abbreviate","as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.acronym",["sense.text"]]],{"lit":5}]],"mem":null},
{"id":"n-c8f567f6","guard":[["hasAny",["character count","growth rate","how many characters","number of characters","ok","percent change","percent decrease","percent increase","percentage change"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",{"lit":2},["aggregate.chars",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-cc80ec54","guard":[["hasAny",["character count","continue","digit count","how many characters","how many digits","lowest terms","number of characters","number of digits","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.digitCount",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-cd0a69d0","guard":[["hasAny",["arithmetic mean","continue","digit count","how many digits","number of digits"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]]],"mem":null},
{"id":"n-cdd3934f","guard":[["hasAny",["as a percentage","character count","continue","digits backwards","digits reversed","how many characters","number of characters","percent is","reverse the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.reverseDigits",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-ce292373","guard":[["hasAny",["after years at","character count","compound interest","compounded","grows to","how many characters","number of characters","ok"]],["has","for"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":2},["aggregate.chars",["sense.text"]]]],"mem":null},
{"id":"n-cec09525","guard":[["hasAny",["character count","growth rate","how many characters","number of characters","ok","percent change","percent decrease","percent increase"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":12}]],"mem":null},
{"id":"n-d01724b5","guard":[["hasAny",["character count","continue","how many characters","hypotenuse","number of characters","pythagoras","pythagorean","shortest","shortest one","shortest word"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.chars",["aggregate.shortest",["sense.words"]]]]],"mem":null},
{"id":"n-d07bf21e","guard":[["hasAny",["character count","continue","decimal places","how many characters","length","number of characters","round to","rounded to"]]],"pyramid":["render.number",["transform.roundTo",{"lit":100},["aggregate.chars",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-d164dbb1","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","shortest","shortest one","shortest word","what percent","what percentage"]],["has","http"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["aggregate.shortest",["sense.content"]]]]],"mem":null},
{"id":"n-d5f2235a","guard":[["hasAny",["as a percentage","character count","continue","divisor count","how many characters","how many factors","number of characters","number of divisors","percent is","what percent","what percentage"]],["has","http"]],"pyramid":["render.number",["compute.asPercent",["compute.divisorCount",["aggregate.chars",["sense.text"]]],{"lit":2}]],"mem":null},
{"id":"n-d8b75ba3","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-d98bb0cf","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-d9a92b98","guard":[["hasAny",["as a percentage","character count","continue","digit count","how many characters","how many digits","number of characters","number of digits","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.digitCount",["aggregate.chars",["sense.lastWord"]]]]],"mem":null},
{"id":"n-de41c32e","guard":[["hasAny",["abbreviate","as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.acronym",["sense.text"]]],{"lit":3}]],"mem":null},
{"id":"n-df904c4c","guard":[["hasAny",["as a percentage","character count","consonant count","how many characters","how many consonants","number of characters","number of consonants","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-dfa8ef53","guard":[["hasAny",["continue","difference between the largest and smallest","gcf","greatest common divisor","greatest common factor","hcf","highest common factor"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["aggregate.range",["iterate.digits",["sense.wordCount"]]]]],"mem":null},
{"id":"n-e1e51f6d","guard":[["hasAny",["bad","character count","growth rate","how many characters","number of characters","percent change","percent decrease","percent increase","percentage change"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["aggregate.chars",["sense.after",{"lit":"status"}]],{"lit":100}]],"mem":null},
{"id":"n-e29a3f6e","guard":[["hasAny",["character count","convert to base","how many characters","in base","in binary","in octal","number of characters","protocols","to binary","to hex"]],["has","give"]],"pyramid":["render.str",["compute.toBase",{"lit":10},["aggregate.chars",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-e3f5f8a7","guard":[["hasAny",["as a percentage","continue","difference between the largest and smallest","percent is","prime numbers less than","primes below","primes under","primes up to","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.range",["compute.primesUpTo",["sense.wordCount"]]],{"lit":5}]],"mem":null},
{"id":"n-e3fab835","guard":[["hasAny",["arithmetic mean","avg","continue","digit count","how many digits","number of digits"]],["not",["colon"]]],"pyramid":["render.number",["aggregate.mean",["iterate.powers",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]]],"mem":null},
{"id":"n-e5cd1333","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":4}]],"mem":null},
{"id":"n-e8f89bfe","guard":[["hasAny",["add the digits","as a percentage","character count","digit sum","how many characters","number of characters","ok","percent is","sum of the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitSum",["aggregate.chars",["sense.lastWord"]]],{"lit":1}]],"mem":null},
{"id":"n-e9035174","guard":[["hasAny",["as a percentage","bad","character count","how many characters","number of characters","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.after",{"lit":"status"}]],{"lit":5}]],"mem":null},
{"id":"n-e9e34925","guard":[["hasAny",["as a percentage","character count","how many characters","most common letter","most frequent letter","number of characters","ok","percent is","what percent","what percentage","which letter appears most"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.chars",["aggregate.commonLetter",["sense.text"]]]]],"mem":null},
{"id":"n-ea32f65a","guard":[["hasAny",["character count","continue","growth rate","how many characters","number of characters","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",{"lit":2},["aggregate.chars",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-ea8a6003","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]],["not",["quoted"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-ef44875f","guard":[["hasAny",["accepted","arithmetic mean","how many items","number of items"]]],"pyramid":["render.number",["aggregate.mean",["iterate.multiples",["aggregate.countStrs",["sense.content"]],{"lit":100}]]],"mem":null},
{"id":"n-f0710f53","guard":[["hasAny",["as a percentage","character count","forbidden","how many characters","number of characters","percent is","sum of divisors","sum of factors","sum of the divisors","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],{"lit":4}]]],"mem":null},
{"id":"n-f10bd4ce","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":3},["aggregate.chars",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-f2f98270","guard":[["hasAny",["arrangements","character count","digit count","how many characters","how many digits","number of characters","number of digits","ordered selections","permutations","protocols","ways to arrange"]],["has","give"]],"pyramid":["render.number",["aggregate.digitCount",["compute.permutations",{"lit":100},["aggregate.chars",["sense.text"]]]]],"mem":null},
{"id":"n-f37e8015","guard":[["hasAny",["character count","continue","copies","how many characters","most common letter","most frequent letter","number of characters","repeat","say it times","which letter appears most"]]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["aggregate.commonLetter",["sense.text"]],{"lit":100}]]],"mem":null},
{"id":"n-f591f996","guard":[["hasAny",["add the digits","as a percentage","character count","continue","digit sum","how many characters","number of characters","percent is","sum of the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitSum",["sense.wordCount"]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-f5a515a9","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-f5c318d3","guard":[["hasAny",["as a percentage","character count","continue","halve","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.half",["aggregate.chars",["sense.lastWord"]]],{"lit":4}]],"mem":null},
{"id":"n-f5f355ae","guard":[["hasAny",["as a percentage","bad","character count","how many characters","number of characters","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.base64",["sense.lastWord"]]],{"lit":3}]],"mem":null},
{"id":"n-f67232d7","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.chars",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-f6a879db","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["transform.base64",["sense.lastWord"]]],{"lit":12}]],"mem":null},
{"id":"n-f737f7f9","guard":[["hasAny",["as a percentage","continue","difference between the largest and smallest","percent is","prime numbers less than","primes below","primes under","primes up to","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":5},["aggregate.range",["compute.primesUpTo",["sense.wordCount"]]]]],"mem":null},
{"id":"n-f9301167","guard":[["hasAny",["add up","altogether","character count","continue","how many characters","in all","number of characters","prime numbers less than","primes below","primes under","primes up to"]]],"pyramid":["render.number",["aggregate.sum",["compute.primesUpTo",["aggregate.chars",["sense.after",{"lit":"of"}]]]]],"mem":null},
{"id":"n-f9fc7fbd","guard":[["hasAny",["continue","difference between the largest and smallest","increase by","plus tax","raise by","with tax"]]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.range",["iterate.digits",["sense.wordCount"]]]]],"mem":null},
{"id":"n-fa37986d","guard":[["hasAny",["as a percentage","character count","how many characters","month name","name of month","number of characters","ok","percent is","what percent","what percentage","which month"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.chars",["compute.monthName",["sense.wordCount"]]]]],"mem":null},
{"id":"n-fb4ec00a","guard":[["hasAny",["add to each","arithmetic mean","ascii","ascii codes","character codes","code points","each plus","increase each","processing","unicode values"]],["has","means"]],"pyramid":["render.number",["aggregate.mean",["transform.mapAdd",["transform.charCodes",["sense.text"]],{"lit":4}]]],"mem":null},
{"id":"n-fd8def29","guard":[["hasAny",["character count","continue","divisor count","how many characters","how many factors","hypotenuse","number of characters","number of divisors","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.divisorCount",["aggregate.chars",["sense.text"]]]]],"mem":null},
{"id":"n-fe019907","guard":[["hasAny",["as a percentage","character count","continue","how many characters","longest one","longest word","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.chars",["aggregate.longest",["sense.words"]]]]],"mem":null},
{"id":"n-fe838cc8","guard":[["hasAny",["as a percentage","character count","continue","how many characters","longest one","longest word","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["aggregate.longest",["sense.words"]]],["sense.wordCount"]]],"mem":null},
{"id":"n-fef55a70","guard":[["hasAny",["character count","continue","copies","how many characters","most common letter","most frequent letter","number of characters","repeat","say it times","which letter appears most"]]],"pyramid":["render.number",["aggregate.chars",["transform.repeat",["aggregate.commonLetter",["sense.lastWord"]],{"lit":100}]]],"mem":null},
{"id":"n-ff48b79c","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.before",{"lit":"status"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-ff63958f","guard":[["hasAny",["character count","continue","how many characters","lowest terms","most common letter","most frequent letter","number of characters","reduce the fraction","simplest form","simplify the fraction","which letter appears most"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.chars",["aggregate.commonLetter",["sense.text"]]]]],"mem":null},
{"id":"n-ff82672f","guard":[["hasAny",["character count","continue","growth rate","how many characters","number of characters","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",{"lit":3},["aggregate.chars",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-16516345","guard":[["hasAny",["accepted","after years at","character count","compound interest","compounded","grows to","how many characters","number of characters"]]],"pyramid":["render.number",["compute.compound",{"lit":4},["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":100}]],"mem":null},
{"id":"n-19aec6ef","guard":[["hasAny",["accepted","after years at","character count","compound interest","compounded","grows to","how many characters","number of characters"]]],"pyramid":["render.number",["compute.compound",["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":4},{"lit":100}]],"mem":null},
{"id":"n-4f59249f","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.wordAt",{"lit":1}]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-660bd0cb","guard":[["hasAny",["as a percentage","bad","character count","how many characters","length","number of characters","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.text"]],["aggregate.chars",["sense.before",{"lit":"http"}]]]],"mem":null},
{"id":"n-791f516d","guard":[["hasAny",["as a percentage","bad","character count","how many characters","number of characters","percent is","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.before",{"lit":"for"}]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-7e36f051","guard":[["hasAny",["arithmetic mean","average","how many vowels","information","number of vowels","vowel count"]],["has","number"]],"pyramid":["render.number",["aggregate.mean",["iterate.steps",{"lit":3},{"lit":100},["aggregate.vowels",["sense.lastWord"]]]]],"mem":null},
{"id":"n-7e377c0d","guard":[["hasAny",["after years at","bad","character count","compound interest","compounded","grows to","how many characters","number of characters"]],["has","request"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":100},["aggregate.chars",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-820ef6de","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.lastWord"]],["aggregate.chars",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-b50b08bd","guard":[["hasAny",["after years at","character count","compound interest","compounded","grows to","how many characters","number of characters","supported"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":10},["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":100}]],"mem":null},
{"id":"n-b7c7237e","guard":[["hasAny",["as a percentage","bad","character count","how many characters","number of characters","percent is","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.text"]],["aggregate.chars",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-dbd3ef5d","guard":[["hasAny",["as a percentage","character count","how many characters","number of characters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.before",{"lit":"is"}]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-de13585c","guard":[["hasAny",["after years at","character count","compound interest","compounded","grows to","how many characters","number of characters","ok"]],["has","for"]],"pyramid":["render.number",["compute.compound",{"lit":100},["aggregate.chars",["sense.lastWord"]],["aggregate.chars",["sense.text"]]]],"mem":null},
{"id":"n-e60f9d38","guard":[["hasAny",["after years at","character count","compound interest","compounded","grows to","how many characters","number of characters","protocols"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":2},["aggregate.chars",["sense.wordAt",{"lit":1}]],{"lit":100}]],"mem":null},
{"id":"n-eaa841e0","guard":[["hasAny",["as a percentage","character count","continue","how many characters","number of characters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.chars",["sense.after",{"lit":"status"}]],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-fb0c6721","guard":[["hasAny",["acceptable","biggest","character count","how many characters","number of characters"]]],"pyramid":["render.number",["aggregate.max",["iterate.steps",["aggregate.chars",["sense.lastWord"]],{"lit":4},{"lit":100}]]],"mem":null},
{"id":"n-04f74fb8","guard":[["hasAny",["continue","http","number","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Continue":"100"}}},
{"id":"n-0af38a0a","guard":[["hasAny",["code","means","required","status","upgrade"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Upgrade Required":"426"}}},
{"id":"n-0fb5cd60","guard":[["hasAny",["accepted","http","number","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Accepted":"202"}}},
{"id":"n-138f17b0","guard":[["hasAny",["http","number","protocols","status","switching"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Switching Protocols":"101"}}},
{"id":"n-15d2f04c","guard":[["hasAny",["allowed","code","http","method","not","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Method Not Allowed":"405"}}},
{"id":"n-1edd60f0","guard":[["hasAny",["code","gateway","means","status","timeout"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Gateway Time-out":"504"}}},
{"id":"n-293beef4","guard":[["hasAny",["also","http","negotiates","number","status","variant"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Variant Also Negotiates":"506"}}},
{"id":"n-29aaa36d","guard":[["hasAny",["bad","code","http","request","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Bad Request":"400"}}},
{"id":"n-39354b4e","guard":[["hasAny",["code","content","http","no","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for No Content":"204"}}},
{"id":"n-3e580db9","guard":[["hasAny",["code","http","locked","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Locked":"423"}}},
{"id":"n-438b2f14","guard":[["hasAny",["code","http","ok","status"]],["has","for"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for OK":"200"}}},
{"id":"n-5264fa7e","guard":[["hasAny",["code","http","large","payload","status","too"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Payload Too Large":"413"}}},
{"id":"n-57ec1fb5","guard":[["hasAny",["code","entity","means","status","unprocessable"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Unprocessable Entity":"422"}}},
{"id":"n-5d744886","guard":[["hasAny",["code","length","means","required","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Length Required":"411"}}},
{"id":"n-6905117b","guard":[["hasAny",["code","http","precondition","required","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Precondition Required":"428"}}},
{"id":"n-6a3f0eea","guard":[["hasAny",["code","http","status","teapot"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for I'm a teapot":"418"}}},
{"id":"n-7380dcfb","guard":[["hasAny",["failed","http","number","precondition","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Precondition Failed":"412"}}},
{"id":"n-7cf18501","guard":[["hasAny",["code","expectation","failed","http","status"]],["has","for"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Expectation Failed":"417"}}},
{"id":"n-832229cb","guard":[["hasAny",["code","means","payment","required","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Payment Required":"402"}}},
{"id":"n-83dade35","guard":[["hasAny",["code","http","insufficient","status","storage"]],["has","for"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Insufficient Storage":"507"}}},
{"id":"n-850d8f36","guard":[["hasAny",["code","legal","means","reasons","status","unavailable"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Unavailable For Legal Reasons":"451"}}},
{"id":"n-87398fa8","guard":[["hasAny",["http","multistatus","number","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Multi-Status":"207"}}},
{"id":"n-8850f7c8","guard":[["hasAny",["http","number","service","status","unavailable"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Service Unavailable":"503"}}},
{"id":"n-92c3ed22","guard":[["hasAny",["code","http","permanent","redirect","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Permanent Redirect":"308"}}},
{"id":"n-94037e74","guard":[["hasAny",["code","http","request","status","timeout"]],["has","for"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Request Timeout":"408"}}},
{"id":"n-963c968e","guard":[["hasAny",["content","http","number","reset","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Reset Content":"205"}}},
{"id":"n-9d38ea58","guard":[["hasAny",["code","means","processing","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Processing":"102"}}},
{"id":"n-9d971e0d","guard":[["hasAny",["http","not","number","range","satisfiable","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Range Not Satisfiable":"416"}}},
{"id":"n-9e7eb535","guard":[["hasAny",["http","information","nonauthoritative","number","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Non-Authoritative Information":"203"}}},
{"id":"n-a0fe7e9b","guard":[["hasAny",["code","long","means","status","too","uri"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means URI Too Long":"414"}}},
{"id":"n-aa53064f","guard":[["hasAny",["created","http","number","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Created":"201"}}},
{"id":"n-aefcdc87","guard":[["hasAny",["code","means","status","used"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means IM Used":"226"}}},
{"id":"n-b0605bd6","guard":[["hasAny",["code","means","status","unauthorized"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Unauthorized":"401"}}},
{"id":"n-b166b56c","guard":[["hasAny",["http","not","number","status","supported","version"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status HTTP Version Not Supported":"505"}}},
{"id":"n-bff7aeb9","guard":[["hasAny",["code","means","redirect","status","temporary"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Temporary Redirect":"307"}}},
{"id":"n-c95eed99","guard":[["hasAny",["authentication","code","means","proxy","required","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Proxy Authentication Required":"407"}}},
{"id":"n-d75959dd","guard":[["hasAny",["conflict","http","number","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Conflict":"409"}}},
{"id":"n-e1acb861","guard":[["hasAny",["http","many","number","requests","status","too"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Too Many Requests":"429"}}},
{"id":"n-e3aacc4c","guard":[["hasAny",["code","forbidden","http","status"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Forbidden":"403"}}},
{"id":"n-e68f4f60","guard":[["hasAny",["acceptable","code","means","not","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Not Acceptable":"406"}}},
{"id":"n-e768b16c","guard":[["hasAny",["code","content","http","partial","status"]],["has","for"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Partial Content":"206"}}},
{"id":"n-e96b39f7","guard":[["hasAny",["code","http","other","see","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for See Other":"303"}}},
{"id":"n-fc5957d6","guard":[["hasAny",["code","found","means","not","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Not Found":"404"}}},
{"id":"n-fd1c448f","guard":[["hasAny",["code","means","moved","permanently","status"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which status code means Moved Permanently":"301"}}},
{"id":"n-fe70e519","guard":[["hasAny",["http","media","number","status","type","unsupported"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Unsupported Media Type":"415"}}},
{"id":"n-55bebca8","guard":[["hasAny",["abbreviate","acronym","continue","from roman","in arabic numerals","roman numeral value","what number is"]]],"pyramid":["render.number",["compute.fromRoman",["transform.acronym",["sense.lastWord"]]]],"mem":null},
{"id":"n-629550de","guard":[["hasAny",["least common multiple","lowest common multiple","ok"]],["has","for"]],"pyramid":["render.number",["compute.lcm",["sense.wordCount"],{"lit":100}]],"mem":null},
{"id":"n-707de0b4","guard":[["hasAny",["area of a circle","area with radius","circle area","created","nearest whole number"]],["has","give"]],"pyramid":["render.number",["transform.round",["compute.circleArea",["sense.wordCount"]]]],"mem":null},
{"id":"n-bca4862e","guard":[["hasAny",["as a percentage","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],{"lit":4}]],"mem":null},
{"id":"n-bfec7193","guard":[["has","http"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"status Conflict":"409","status code for Expectation Failed":"417","status code for No Content":"204","status code for Permanent Redirect":"308","status Range Not Satisfiable":"416","status code for Locked":"423","status code for See Other":"303","status Created":"201","status Unsupported Media Type":"415","status Service Unavailable":"503","status code for Insufficient Storage":"507","status code for I'm a teapot":"418","status code for Precondition Required":"428","status code for Bad Request":"400","status code for OK":"200","status Continue":"100","status Non-Authoritative Information":"203","status HTTP Version Not Supported":"505","status Multi-Status":"207","status code for Method Not Allowed":"405","status Reset Content":"205","status Accepted":"202","status code for Payload Too Large":"413","status Variant Also Negotiates":"506","status code for Forbidden":"403","status code for Request Timeout":"408","status code for Partial Content":"206","status Too Many Requests":"429","status Switching Protocols":"101","status Precondition Failed":"412"}}},
{"id":"n-d1606cae","guard":[["hasAny",["area of a circle","area with radius","circle area","created","round down"]],["has","give"]],"pyramid":["render.number",["transform.floor",["compute.circleArea",["sense.wordCount"]]]],"mem":null},
{"id":"n-feccf384","guard":[["hasAny",["continue","growth rate","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",{"lit":4},["sense.wordCount"]]],"mem":null},
{"id":"n-008112c0","guard":[["hasAny",["convert to base","how many vowels","in base","in binary","in octal","number of vowels","protocols","to binary","to hex","vowel count"]],["has","give"]],"pyramid":["render.str",["compute.toBase",{"lit":10},["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-04494403","guard":[["hasAny",["area of a circle","area with radius","circle area","continue","left over","mod","modulo","remainder"]]],"pyramid":["render.number",["transform.mod",{"lit":100},["compute.circleArea",["sense.wordCount"]]]],"mem":null},
{"id":"n-05b634bf","guard":[["hasAny",["convert to base","divisor count","how many factors","in base","in binary","in octal","number of divisors","protocols","to binary","to hex"]],["has","give"]],"pyramid":["render.str",["compute.toBase",{"lit":10},["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-062eecc4","guard":[["hasAny",["consonant count","growth rate","how many consonants","number of consonants","ok","percent change","percent decrease","percent increase"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["aggregate.consonants",["sense.lastWord"]],{"lit":3}]],"mem":null},
{"id":"n-064afd04","guard":[["hasAny",["how many words","least common multiple","lowest common multiple","number of words","ok","word count"]],["has","for"]],"pyramid":["render.number",["compute.lcm",{"lit":100},["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-08fafbf4","guard":[["hasAny",["growth rate","how many vowels","number of vowels","ok","percent change","percent decrease","percent increase","vowel count"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",{"lit":3},["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-0ba286d9","guard":[["hasAny",["appears most often","ascii","ascii codes","character codes","code points","most common","most frequent","protocols","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.mode",["transform.charCodes",["sense.before",{"lit":"of"}]]]],"mem":null},
{"id":"n-0c20bd03","guard":[["hasAny",["continue","halve","lcm","least common multiple","lowest common multiple"]]],"pyramid":["render.number",["compute.lcm",{"lit":100},["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-0d552888","guard":[["hasAny",["as a percentage","how many items","number of items","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-0f755671","guard":[["hasAny",["continue","convert to base","halve","in base","in binary","in octal","to binary","to hex"]]],"pyramid":["render.str",["compute.toBase",["transform.half",["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-0f98a5f7","guard":[["hasAny",["as a percentage","continue","digit count","how many digits","number of digits","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-15a08278","guard":[["hasAny",["continue","digits backwards","digits reversed","growth rate","percent change","percent decrease","percent increase","reverse the digits"]]],"pyramid":["render.number",["compute.percentChange",{"lit":4},["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-15d1a1f6","guard":[["hasAny",["continue","convert to base","in base","in binary","in octal","to binary","to hex","two times"]]],"pyramid":["render.str",["compute.toBase",["transform.double",["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-1602a278","guard":[["hasAny",["ascii","ascii codes","character at","character codes","code points","letter at","nth letter","protocols","unicode values","which letter"]],["has","give"]],"pyramid":["render.listNums",["transform.charCodes",["transform.charAt",["sense.text"],{"lit":4}]]],"mem":null},
{"id":"n-189e51fc","guard":[["hasAny",["continue","divisor count","growth rate","how many factors","number of divisors","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",["compute.divisorCount",["sense.wordCount"]],["sense.wordCount"]]],"mem":null},
{"id":"n-1afc428e","guard":[["hasAny",["consonant count","continue","convert to base","how many consonants","in base","in binary","in octal","number of consonants","to binary","to hex"]]],"pyramid":["render.str",["compute.toBase",["aggregate.consonants",["sense.lastWord"]],{"lit":2}]],"mem":null},
{"id":"n-1cfb9bd3","guard":[["hasAny",["arrangements","one less","ordered selections","permutations","predecessor","previous","service","ways to arrange"]],["has","number"]],"pyramid":["render.number",["transform.prev",["compute.permutations",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-1d55900b","guard":[["hasAny",["continue","halve","least common multiple","lowest common multiple"]]],"pyramid":["render.number",["transform.half",["compute.lcm",["sense.wordCount"],{"lit":100}]]],"mem":null},
{"id":"n-1d696098","guard":[["hasAny",["as a percentage","consonant count","how many consonants","number of consonants","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-1ed86a80","guard":[["hasAny",["binomial coefficient","combinations","continue","digit count","how many digits","n choose k","number of digits","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-20476bc1","guard":[["hasAny",["growth rate","how many items","number of items","ok","percent change","percent decrease","percent increase"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["aggregate.countStrs",["sense.content"]],{"lit":12}]],"mem":null},
{"id":"n-2193fb46","guard":[["hasAny",["add up","altogether","in all","temporary"]],["has","which"]],"pyramid":["render.number",["aggregate.sum",["iterate.cumsum",["iterate.collatz",["sense.wordCount"]]]]],"mem":null},
{"id":"n-21b72970","guard":[["hasAny",["ascii","ascii codes","character codes","code points","lowest","protocols","smallest","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.min",["transform.charCodes",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-25230959","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.lastWord"]],{"lit":4}]],"mem":null},
{"id":"n-25e80f6f","guard":[["hasAny",["appears most often","ascii","ascii codes","character codes","code points","month name","most common","most frequent","name of month","protocols","unicode values","which month"]],["has","give"]],"pyramid":["render.number",["aggregate.mode",["transform.charCodes",["compute.monthName",["sense.wordCount"]]]]],"mem":null},
{"id":"n-287938fe","guard":[["hasAny",["add the digits","digit sum","least common multiple","lowest common multiple","ok","sum of the digits"]],["has","for"]],"pyramid":["render.number",["compute.lcm",{"lit":100},["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-2b9630a8","guard":[["hasAny",["as a percentage","bad","divisor count","how many factors","number of divisors","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-2beef03a","guard":[["hasAny",["bad","growth rate","percent change","percent decrease","percent increase","two times"]],["has","request"]],"pyramid":["render.number",["transform.double",["compute.percentChange",{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-2e85f5e5","guard":[["hasAny",["accepted","convert to base","in base","in binary","in octal","one less","predecessor","previous","to binary","to hex"]]],"pyramid":["render.str",["compute.toBase",{"lit":100},["transform.prev",["sense.wordCount"]]]],"mem":null},
{"id":"n-2f1b8acc","guard":[["hasAny",["increase by","markup","next prime","plus tax","protocols","raise by","smallest prime greater than","the prime after","with tax"]],["has","give"]],"pyramid":["render.number",["compute.nextPrime",["compute.increase",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-2f7de73b","guard":[["hasAny",["convert to base","in base","in binary","in octal","protocols","root of","sqrt","square root","to binary","to hex"]],["has","give"]],"pyramid":["render.str",["compute.toBase",{"lit":10},["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-357d3329","guard":[["hasAny",["growth rate","ok","percent change","percent decrease","percent increase","successor"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",{"lit":3},["transform.next",["sense.wordCount"]]]],"mem":null},
{"id":"n-3717a2be","guard":[["hasAny",["added to","cubed","to the third power","used"]],["has","means"]],"pyramid":["render.number",["transform.add",{"lit":10},["transform.cube",["sense.wordCount"]]]],"mem":null},
{"id":"n-3796fb97","guard":[["hasAny",["forbidden","goes into","how many whole times","integer division","n factorial","whole division"]],["has","what"]],"pyramid":["render.number",["transform.idiv",["compute.factorial",["sense.wordCount"]],{"lit":100}]],"mem":null},
{"id":"n-39d9688c","guard":[["hasAny",["bad","convert to base","how many items","in base","in binary","in octal","number of items","to binary","to hex"]],["has","request"]],"pyramid":["render.str",["compute.toBase",{"lit":100},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-3ab77020","guard":[["hasAny",["ascii","ascii codes","capitalise","capitalize","capitalize each word","character codes","code points","middle number","middle value","processing","unicode values"]],["has","means"]],"pyramid":["render.number",["aggregate.median",["transform.charCodes",["transform.title",["sense.text"]]]]],"mem":null},
{"id":"n-3cb00cac","guard":[["hasAny",["abbreviate","acronym","continue","from roman","in arabic numerals","no vowels","remove vowels","roman numeral value","what number is","without vowels"]]],"pyramid":["render.number",["compute.fromRoman",["transform.acronym",["transform.noVowels",["sense.lastWord"]]]]],"mem":null},
{"id":"n-3cd1593a","guard":[["hasAny",["fib","least common multiple","lowest common multiple","no"]],["has","http"]],"pyramid":["render.number",["compute.lcm",{"lit":12},["compute.fibonacci",["sense.wordCount"]]]],"mem":null},
{"id":"n-3e618689","guard":[["hasAny",["acceptable","days in the month","how many days in","length of the month","sum of the first","triangular number"]]],"pyramid":["render.number",["compute.sumTo",["compute.daysInMonth",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-423b976a","guard":[["hasAny",["as a percentage","continue","halve","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-42d2e352","guard":[["hasAny",["as a percentage","continue","how many items","number of items","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-42deeb45","guard":[["hasAny",["least common multiple","lowest common multiple","next prime","smallest prime greater than","temporary","the prime after"]],["has","which"]],"pyramid":["render.number",["compute.nextPrime",["compute.lcm",["sense.wordCount"],{"lit":100}]]],"mem":null},
{"id":"n-44d9196d","guard":[["hasAny",["continue","hypotenuse","pythagoras","pythagorean","root of","sqrt","square root"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-4581f346","guard":[["hasAny",["bad","consonant count","how many consonants","number of consonants","to the second power"]],["has","for"]],"pyramid":["render.number",["transform.square",["aggregate.consonants",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-4b86263f","guard":[["hasAny",["add up","also","altogether","in all","next prime","smallest prime greater than","the prime after"]],["has","number"]],"pyramid":["render.number",["aggregate.sum",["iterate.squares",["compute.nextPrime",["sense.wordCount"]]]]],"mem":null},
{"id":"n-4c9145a7","guard":[["hasAny",["as a percentage","continue","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.wordCount"]],["sense.wordCount"]]],"mem":null},
{"id":"n-4fd68dea","guard":[["hasAny",["as a percentage","created","percent is","successor","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["transform.next",["compute.asPercent",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-505557b7","guard":[["hasAny",["as a percentage","continue","how many words","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-518f598b","guard":[["hasAny",["add up","altogether","in all","no","one less","predecessor","previous"]],["has","http"]],"pyramid":["render.number",["aggregate.sum",["iterate.squares",["transform.prev",["sense.wordCount"]]]]],"mem":null},
{"id":"n-52703958","guard":[["hasAny",["growth rate","halve","ok","percent change","percent decrease","percent increase"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["transform.half",["sense.wordCount"]],{"lit":12}]],"mem":null},
{"id":"n-52c3de0a","guard":[["hasAny",["as a percentage","next prime","percent is","smallest prime greater than","temporary","the prime after","what percent","what percentage"]],["has","which"]],"pyramid":["render.number",["compute.nextPrime",["compute.asPercent",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-5779a66d","guard":[["hasAny",["as a percentage","continue","digits backwards","digits reversed","percent is","reverse the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.reverseDigits",["sense.wordCount"]]]],"mem":null},
{"id":"n-5919cb8a","guard":[["hasAny",["abbreviate","acronym","continue","from roman","in arabic numerals","no vowels","remove vowels","roman numeral value","what number is","without vowels"]]],"pyramid":["render.number",["compute.fromRoman",["transform.noVowels",["transform.acronym",["sense.lastWord"]]]]],"mem":null},
{"id":"n-5d517133","guard":[["hasAny",["as a percentage","divisor count","how many factors","number of divisors","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-5e4da6ed","guard":[["hasAny",["add the digits","continue","digit sum","growth rate","percent change","percent decrease","percent increase","sum of the digits"]]],"pyramid":["render.number",["compute.percentChange",{"lit":4},["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-5f89fff5","guard":[["hasAny",["bad","consonant count","copies","how many consonants","number of consonants","say it times"]],["has","request"]],"pyramid":["render.number",["aggregate.consonants",["transform.repeat",["sense.lastWord"],{"lit":100}]]],"mem":null},
{"id":"n-6069e1c7","guard":[["hasAny",["as a percentage","divisor count","how many factors","number of divisors","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.divisorCount",["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-60bf820d","guard":[["hasAny",["ascii","ascii codes","character codes","code points","distinct","population variance","processing","remove duplicates","unicode values","variance","without repeats"]],["has","means"]],"pyramid":["render.number",["aggregate.variance",["transform.uniqueNums",["transform.charCodes",["sense.lastWord"]]]]],"mem":null},
{"id":"n-639bb9ff","guard":[["hasAny",["continue","growth rate","how many items","number of items","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",{"lit":2},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-66930836","guard":[["hasAny",["prime numbers less than","primes below","primes under","primes up to","sum of squares","sum of the squares","teapot"]],["has","what"]],"pyramid":["render.number",["aggregate.sumSquares",["iterate.cumsum",["compute.primesUpTo",["sense.wordCount"]]]]],"mem":null},
{"id":"n-6738cbd7","guard":[["hasAny",["add the digits","as a percentage","continue","digit sum","percent is","sum of the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-67790166","guard":[["hasAny",["consonant count","growth rate","how many consonants","information","number of consonants","percent change","percent decrease","percent increase"]],["has","number"]],"pyramid":["render.number",["compute.percentChange",["aggregate.consonants",["sense.text"]],{"lit":100}]],"mem":null},
{"id":"n-69e44480","guard":[["hasAny",["as a percentage","continue","divisor count","how many factors","number of divisors","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["compute.divisorCount",["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-69f8f39d","guard":[["hasAny",["continue","cube root","digit count","how many digits","nth root","number of digits"]]],"pyramid":["render.number",["compute.root",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-72454352","guard":[["hasAny",["add up","altogether","consonant count","continue","how many consonants","in all","number of consonants","prime numbers less than","primes below","primes under","primes up to"]]],"pyramid":["render.number",["aggregate.sum",["compute.primesUpTo",["aggregate.consonants",["sense.text"]]]]],"mem":null},
{"id":"n-78253ca9","guard":[["hasAny",["as a percentage","how many vowels","number of vowels","ok","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-787b50eb","guard":[["hasAny",["appears most often","ascii","ascii codes","character codes","code points","continue","most common","most frequent","unicode values"]]],"pyramid":["render.number",["aggregate.mode",["transform.charCodes",["transform.base64",["sense.lastWord"]]]]],"mem":null},
{"id":"n-7916fd28","guard":[["hasAny",["as a percentage","continue","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.vowels",["sense.lastWord"]],{"lit":4}]],"mem":null},
{"id":"n-7ad35ee2","guard":[["hasAny",["added to","continue","to the second power"]]],"pyramid":["render.number",["transform.square",["transform.add",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-7b65fd2b","guard":[["hasAny",["how many vowels","hypotenuse","number of vowels","protocols","pythagoras","pythagorean","vowel count"]],["has","give"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-7d5a3f94","guard":[["hasAny",["add the digits","as a percentage","continue","digit sum","percent is","sum of the digits","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitSum",["sense.wordCount"]],["sense.wordCount"]]],"mem":null},
{"id":"n-7fdab2c5","guard":[["hasAny",["forbidden","sum of divisors","sum of factors","sum of the divisors","to the second power"]],["has","what"]],"pyramid":["render.number",["compute.divisorSum",["transform.square",["compute.divisorSum",["sense.wordCount"]]]]],"mem":null},
{"id":"n-80df2a6d","guard":[["hasAny",["continue","growth rate","how many items","number of items","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",["aggregate.countStrs",["sense.content"]],["sense.wordCount"]]],"mem":null},
{"id":"n-81249102","guard":[["hasAny",["divisor count","growth rate","how many factors","number of divisors","ok","percent change","percent decrease","percent increase"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["compute.divisorCount",["sense.wordCount"]],{"lit":12}]],"mem":null},
{"id":"n-82714337","guard":[["hasAny",["all divisors","all factors","legal","population variance","to the second power","variance"]],["has","means"]],"pyramid":["render.number",["aggregate.variance",["compute.divisors",["transform.square",["sense.wordCount"]]]]],"mem":null},
{"id":"n-82875c97","guard":[["hasAny",["consonant count","continue","growth rate","how many consonants","number of consonants","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",{"lit":2},["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-828b5165","guard":[["hasAny",["continue","how many vowels","least common multiple","lowest common multiple","number of vowels","vowel count"]]],"pyramid":["render.number",["compute.lcm",{"lit":100},["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-829f682d","guard":[["hasAny",["ascii","ascii codes","character codes","code points","median","middle number","middle value","protocols","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.median",["transform.charCodes",["sense.before",{"lit":"status"}]]]],"mem":null},
{"id":"n-82d1f73b","guard":[["hasAny",["continue","growth rate","how many vowels","number of vowels","percent change","percent decrease","percent increase","vowel count"]]],"pyramid":["render.number",["compute.percentChange",{"lit":2},["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-83ef7112","guard":[["hasAny",["continue","digit count","how many digits","number of digits"]]],"pyramid":["render.listNums",["iterate.multiples",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-8570872d","guard":[["hasAny",["continue","decimal places","halve","round to","rounded to"]]],"pyramid":["render.number",["transform.roundTo",{"lit":100},["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-85cb1a48","guard":[["hasAny",["as a percentage","bad","percent is","root of","sqrt","square root","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["compute.sqrt",["sense.wordCount"]]]],"mem":null},
{"id":"n-85f52e6c","guard":[["hasAny",["add up","altogether","ascii","ascii codes","character codes","code points","in all","month name","name of month","payment","unicode values","which month"]],["has","which"]],"pyramid":["render.number",["aggregate.sum",["transform.charCodes",["compute.monthName",["sense.wordCount"]]]]],"mem":null},
{"id":"n-864163c4","guard":[["hasAny",["bad","growth rate","how many items","number of items","percent change","percent decrease","percent increase"]],["has","request"]],"pyramid":["render.number",["compute.percentChange",{"lit":1},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-88fe3a8c","guard":[["hasAny",["consonant count","continue","how many consonants","least common multiple","lowest common multiple","number of consonants"]]],"pyramid":["render.number",["compute.lcm",{"lit":100},["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-8bf64552","guard":[["hasAny",["area of a triangle","fib","half base times height","no","triangle area"]],["has","http"]],"pyramid":["render.number",["compute.triangleArea",{"lit":12},["compute.fibonacci",["sense.wordCount"]]]],"mem":null},
{"id":"n-8e0e267e","guard":[["hasAny",["ascii","ascii codes","character codes","code points","lowest","protocols","smallest","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.min",["transform.charCodes",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-8fe76646","guard":[["hasAny",["continue","digit count","exponent","how many digits","number of digits","raised to","to the power of"]]],"pyramid":["render.number",["compute.power",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-906044bd","guard":[["hasAny",["as a percentage","digit count","how many digits","number of digits","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-95393a29","guard":[["hasAny",["growth rate","ok","percent change","percent decrease","percent increase","two times"]],["has","for"]],"pyramid":["render.number",["transform.double",["compute.percentChange",{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-983be378","guard":[["hasAny",["digit count","growth rate","how many digits","number of digits","ok","percent change","percent decrease","percent increase"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["aggregate.digitCount",["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-9ed6df85","guard":[["hasAny",["as a percentage","bad","how many letters","letter count","number of letters","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["aggregate.letters",["sense.text"]],["sense.wordCount"]]],"mem":null},
{"id":"n-9fc9edc1","guard":[["hasAny",["continue","convert to base","how many vowels","in base","in binary","in octal","number of vowels","to binary","to hex","vowel count"]]],"pyramid":["render.str",["compute.toBase",["aggregate.vowels",["sense.lastWord"]],{"lit":2}]],"mem":null},
{"id":"n-a2f54986","guard":[["hasAny",["appears most often","ascii","ascii codes","character codes","code points","most common","most frequent","odd numbers","odds","protocols","the odd ones","unicode values"]],["has","give"]],"pyramid":["render.number",["aggregate.mode",["transform.odds",["transform.charCodes",["sense.text"]]]]],"mem":null},
{"id":"n-a392975e","guard":[["hasAny",["continue","middle number","middle value","nth prime","the prime number in position"]]],"pyramid":["render.number",["aggregate.median",["iterate.squares",["compute.nthPrime",["sense.wordCount"]]]]],"mem":null},
{"id":"n-a75f4fbd","guard":[["hasAny",["growth rate","percent change","percent decrease","percent increase","successor","unauthorized"]],["has","which"]],"pyramid":["render.number",["transform.next",["compute.percentChange",{"lit":1},["sense.wordCount"]]]],"mem":null},
{"id":"n-ae9beea2","guard":[["hasAny",["continue","decimal places","next prime","round to","rounded to","smallest prime greater than","the prime after"]]],"pyramid":["render.number",["transform.roundTo",{"lit":100},["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-aea6d2a8","guard":[["hasAny",["continue","divisor count","how many factors","least common multiple","lowest common multiple","number of divisors"]]],"pyramid":["render.number",["compute.lcm",{"lit":100},["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-b0451f0f","guard":[["hasAny",["growth rate","next prime","percent change","percent decrease","percent increase","smallest prime greater than","the prime after","unauthorized"]],["has","which"]],"pyramid":["render.number",["compute.nextPrime",["compute.percentChange",{"lit":1},["sense.wordCount"]]]],"mem":null},
{"id":"n-b0783dd6","guard":[["hasAny",["continue","growth rate","how many vowels","number of vowels","percent change","percent decrease","percent increase","vowel count"]]],"pyramid":["render.number",["compute.percentChange",["aggregate.vowels",["sense.lastWord"]],["sense.wordCount"]]],"mem":null},
{"id":"n-b3242ec4","guard":[["hasAny",["abbreviate","abbreviation","acronym","continue","from roman","in arabic numerals","longest","longest one","longest word","roman numeral value","what number is"]]],"pyramid":["render.number",["compute.fromRoman",["transform.acronym",["aggregate.longest",["sense.words"]]]]],"mem":null},
{"id":"n-b4d53eb1","guard":[["hasAny",["continue","how many items","least common multiple","lowest common multiple","number of items"]]],"pyramid":["render.number",["compute.lcm",{"lit":100},["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-b627f662","guard":[["hasAny",["legal","population variance","to the second power","variance"]],["has","means"]],"pyramid":["render.number",["aggregate.variance",["iterate.collatz",["transform.square",["sense.wordCount"]]]]],"mem":null},
{"id":"n-b71a0760","guard":[["hasAny",["bad","digit count","growth rate","how many digits","number of digits","percent change","percent decrease","percent increase"]],["has","request"]],"pyramid":["render.number",["compute.percentChange",["aggregate.digitCount",["sense.wordCount"]],{"lit":5}]],"mem":null},
{"id":"n-b9484dc2","guard":[["hasAny",["acceptable","changes to turn","edit distance","how many edits","levenshtein","sum of the first","triangular number"]]],"pyramid":["render.number",["compute.sumTo",["compute.editDistance",["sense.text"],["sense.lastWord"]]]],"mem":null},
{"id":"n-bbfad33e","guard":[["hasAny",["consonant count","how many consonants","hypotenuse","number of consonants","processing","pythagoras","pythagorean"]],["has","means"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-bc3d4f7a","guard":[["hasAny",["continue","digit count","growth rate","how many digits","number of digits","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",["aggregate.digitCount",["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-bed5e200","guard":[["hasAny",["growth rate","ok","percent change","percent decrease","percent increase","sum of the first","triangular number"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",{"lit":12},["compute.sumTo",["sense.wordCount"]]]],"mem":null},
{"id":"n-c0ab7b0a","guard":[["hasAny",["ascii","ascii codes","character codes","code points","middle number","middle value","month name","name of month","protocols","unicode values","which month"]],["has","give"]],"pyramid":["render.number",["aggregate.median",["transform.charCodes",["compute.monthName",["sense.wordCount"]]]]],"mem":null},
{"id":"n-c39e146f","guard":[["hasAny",["as a percentage","continue","divisor count","how many factors","number of divisors","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-c4b8da11","guard":[["hasAny",["consonant count","continue","growth rate","how many consonants","number of consonants","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",["aggregate.consonants",["sense.lastWord"]],["sense.wordCount"]]],"mem":null},
{"id":"n-ca4c8ae0","guard":[["hasAny",["as a percentage","continue","halve","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.half",["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-cbce4a8c","guard":[["hasAny",["as a percentage","bad","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["aggregate.vowels",["sense.text"]],{"lit":3}]],"mem":null},
{"id":"n-cc248b60","guard":[["hasAny",["continue","hypotenuse","nearest whole number","pythagoras","pythagorean"]]],"pyramid":["render.number",["transform.round",["compute.hypot",["sense.wordCount"],{"lit":100}]]],"mem":null},
{"id":"n-cce2fd87","guard":[["hasAny",["continue","digit count","how many digits","number of digits"]]],"pyramid":["render.listNums",["iterate.powers",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-cd23d671","guard":[["hasAny",["abbreviate","abbreviation","acronym","continue","from roman","in arabic numerals","roman numeral value","short form","what number is"]]],"pyramid":["render.number",["compute.fromRoman",["transform.acronym",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-ce2e6332","guard":[["hasAny",["digit count","how many digits","increase by","markup","number of digits","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-ce430ed8","guard":[["hasAny",["as a percentage","conflict","nth prime","percent is","the prime number in position","what percent","what percentage"]],["has","give"]],"pyramid":["render.number",["compute.nthPrime",["compute.asPercent",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-cedacdeb","guard":[["hasAny",["continue","growth rate","percent change","percent decrease","percent increase","two times"]]],"pyramid":["render.number",["transform.double",["compute.percentChange",["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-cedfb9c5","guard":[["hasAny",["continue","digit count","how many digits","hypotenuse","number of digits","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-d34399a5","guard":[["hasAny",["as a percentage","continue","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-d376d982","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.text"]],{"lit":4}]],"mem":null},
{"id":"n-d53bf249","guard":[["hasAny",["as a percentage","bad","digit count","how many digits","number of digits","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-d5a4349b","guard":[["hasAny",["arrangements","continue","digit count","how many digits","number of digits","ordered selections","permutations","ways to arrange"]]],"pyramid":["render.number",["compute.permutations",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-d5e758dc","guard":[["hasAny",["growth rate","ok","percent change","percent decrease","percent increase","sum of divisors","sum of factors","sum of the divisors"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",{"lit":5},["compute.divisorSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-d68bc076","guard":[["hasAny",["ascii","ascii codes","character codes","code points","odd numbers","odds","protocols","the odd ones","unicode values"]],["has","give"]],"pyramid":["render.listNums",["transform.odds",["transform.charCodes",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-d76eb664","guard":[["hasAny",["as a percentage","continue","how many items","number of items","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.countStrs",["sense.content"]],{"lit":4}]],"mem":null},
{"id":"n-d84329cf","guard":[["hasAny",["divisor count","how many factors","increase by","markup","number of divisors","plus tax","processing","raise by","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-d8970bc6","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-d8a320f6","guard":[["hasAny",["allowed","arrangements","digits backwards","digits reversed","ordered selections","permutations","reverse the digits","ways to arrange"]]],"pyramid":["render.number",["transform.reverseDigits",["compute.permutations",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-de79ba24","guard":[["hasAny",["abbreviate","acronym","alphabetize the letters","continue","from roman","in arabic numerals","letters in order","roman numeral value","sort the letters","what number is"]]],"pyramid":["render.number",["compute.fromRoman",["transform.acronym",["transform.sortLetters",["sense.text"]]]]],"mem":null},
{"id":"n-deedc88c","guard":[["hasAny",["continue","divisor count","growth rate","how many factors","number of divisors","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.percentChange",{"lit":2},["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-dff2fc0c","guard":[["hasAny",["add the digits","as a percentage","digit sum","ok","percent is","sum of the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitSum",["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-e27f7649","guard":[["hasAny",["continue","growth rate","how many words","number of words","percent change","percent decrease","percent increase","word count"]]],"pyramid":["render.number",["compute.percentChange",{"lit":4},["aggregate.words",["sense.text"]]]],"mem":null},
{"id":"n-e967d5f9","guard":[["hasAny",["as a percentage","digits backwards","digits reversed","ok","percent is","reverse the digits","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.reverseDigits",["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-f114994d","guard":[["hasAny",["add up","also","altogether","in all","successor"]],["has","number"]],"pyramid":["render.number",["aggregate.sum",["iterate.squares",["transform.next",["sense.wordCount"]]]]],"mem":null},
{"id":"n-f28e833c","guard":[["hasAny",["as a percentage","how many items","number of items","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.countStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-f2b5248c","guard":[["hasAny",["growth rate","how many vowels","number of vowels","ok","percent change","percent decrease","percent increase","vowel count"]],["has","for"]],"pyramid":["render.number",["compute.percentChange",["aggregate.vowels",["sense.lastWord"]],{"lit":3}]],"mem":null},
{"id":"n-f6497e58","guard":[["hasAny",["as a percentage","continue","how many words","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.text"]],["sense.wordCount"]]],"mem":null},
{"id":"n-f798b7ac","guard":[["hasAny",["as a percentage","bad","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-f986d34a","guard":[["hasAny",["continue","convert to base","divisor count","how many factors","in base","in binary","in octal","number of divisors","to binary","to hex"]]],"pyramid":["render.str",["compute.toBase",["compute.divisorCount",["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-fc5fb13d","guard":[["hasAny",["as a percentage","continue","digit count","how many digits","number of digits","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.digitCount",["sense.wordCount"]],{"lit":1}]],"mem":null},
{"id":"n-001a8eae","guard":[["hasAny",["binomial coefficient","combinations","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","n choose k","ways to choose"]]],"pyramid":["render.number",["compute.gcd",{"lit":1000},["compute.choose",{"lit":100},["sense.wordCount"]]]],"mem":null},
{"id":"n-0030e262","guard":[["hasAny",["continue","how many words","lowest terms","number of words","reduce the fraction","simplest form","simplify the fraction","word count"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.words",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-034875f6","guard":[["hasAny",["as a percentage","how many times","how often","occurrences","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.occurrences",["sense.text"],["sense.lastWord"]]]],"mem":null},
{"id":"n-0351645e","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-03da1c28","guard":[["hasAny",["gcf","greatest common divisor","greatest common factor","hcf","highest common factor","increase by","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-04d4eb9b","guard":[["hasAny",["as a percentage","bad","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.vowels",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-04fc8cfa","guard":[["hasAny",["after a discount","bad","growth rate","percent change","percent decrease","percent increase","reduced by","sale price"]],["has","request"]],"pyramid":["render.number",["compute.discount",["compute.percentChange",["sense.wordCount"],{"lit":5}],{"lit":1000}]],"mem":null},
{"id":"n-059dfea0","guard":[["hasAny",["as a percentage","goes into","how many whole times","integer division","ok","percent is","what percent","what percentage","whole division"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.idiv",["sense.wordCount"],{"lit":2}],{"lit":2}]],"mem":null},
{"id":"n-07702141","guard":[["hasAny",["as a percentage","consonant count","how many consonants","number of consonants","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.consonants",["sense.before",{"lit":"http"}]]]],"mem":null},
{"id":"n-077bc527","guard":[["hasAny",["continue","gcf","greatest common divisor","greatest common factor","growth rate","hcf","highest common factor","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.gcd",{"lit":1000},["compute.percentChange",{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-07a7b4b8","guard":[["hasAny",["as a percentage","how many letters","letter count","number of letters","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["aggregate.letters",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-08bb1061","guard":[["hasAny",["appears most often","continue","digit count","how many digits","most common","most frequent","number of digits"]]],"pyramid":["render.number",["aggregate.mode",["iterate.powers",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]]],"mem":null},
{"id":"n-094d42dd","guard":[["hasAny",["continue","goes into","how many whole times","integer division","lowest terms","reduce the fraction","simplest form","simplify the fraction","whole division"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["transform.idiv",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-09b7146b","guard":[["hasAny",["added to","as a percentage","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.add",["sense.wordCount"],{"lit":2}],{"lit":5}]],"mem":null},
{"id":"n-09e7b27e","guard":[["hasAny",["as a percentage","increase by","other","percent is","plus tax","raise by","what percent","what percentage","with tax"]],["has","http"],["has","what"]],"pyramid":["render.number",["compute.increase",["compute.asPercent",["sense.wordCount"],{"lit":3}],{"lit":1}]],"mem":null},
{"id":"n-0a5b3f7e","guard":[["hasAny",["after years at","also","area of a circle","area with radius","circle area","compound interest","compounded","grows to"]],["has","number"]],"pyramid":["render.number",["compute.compound",["compute.circleArea",["sense.wordCount"]],["sense.wordCount"],{"lit":5}]],"mem":null},
{"id":"n-0ab8a650","guard":[["hasAny",["continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","lowest terms","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-0bba3102","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":5}],{"lit":1}]],"mem":null},
{"id":"n-0bffa695","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",["transform.idiv",["sense.wordCount"],{"lit":4}],{"lit":2}]],"mem":null},
{"id":"n-0c364ea4","guard":[["hasAny",["how many letters","letter count","lowest terms","number of letters","ok","reduce the fraction","simplest form","simplify the fraction"]],["has","for"]],"pyramid":["render.str",["compute.fraction",{"lit":1000},["aggregate.letters",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-0da90a1c","guard":[["hasAny",["lowest terms","ok","reduce the fraction","simplest form","simplify the fraction","take away"]],["has","for"]],"pyramid":["render.str",["compute.fraction",{"lit":1000},["transform.sub",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-0e2af3ae","guard":[["hasAny",["as a percentage","continue","how many times in the list","occurrences in the list","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.countIn",["sense.words"],["sense.lastWord"]]]],"mem":null},
{"id":"n-0e91da50","guard":[["hasAny",["consonant count","how many consonants","increase by","number of consonants","plus tax","processing","raise by","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.consonants",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-0eaa48ae","guard":[["hasAny",["continue","goes into","how many whole times","increase by","integer division","plus tax","raise by","whole division","with tax"]]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.idiv",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-120e0cb1","guard":[["hasAny",["after years at","compound interest","compounded","grows to","multiplicative inverse","one over","protocols","reciprocal"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":100},["transform.reciprocal",["sense.wordCount"]],["sense.wordCount"]]],"mem":null},
{"id":"n-139ca455","guard":[["hasAny",["as a percentage","continue","minus","percent is","take away","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":3},["transform.sub",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-13cd2962","guard":[["hasAny",["as a percentage","continue","percent is","take away","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":5},["transform.sub",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-13dd7f86","guard":[["hasAny",["biggest","protocols"]],["has","give"]],"pyramid":["render.number",["aggregate.max",["iterate.steps",{"lit":5},{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-15177e1b","guard":[["hasAny",["as a percentage","how many times in the list","occurrences in the list","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.countIn",["sense.words"],["sense.lastWord"]]]],"mem":null},
{"id":"n-151a4502","guard":[["hasAny",["continue","gcf","goes into","greatest common divisor","greatest common factor","hcf","highest common factor","how many whole times","integer division","whole division"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["transform.idiv",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-16541e29","guard":[["hasAny",["as a percentage","continue","how many words","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",{"lit":5},["aggregate.words",["sense.before",{"lit":"http"}]]]],"mem":null},
{"id":"n-16a83513","guard":[["hasAny",["copies","how many vowels","number of vowels","ok","repeat","say it times","vowel count"]],["has","for"]],"pyramid":["render.number",["aggregate.vowels",["transform.repeat",["sense.after",{"lit":"code"}],{"lit":100}]]],"mem":null},
{"id":"n-17aa6338","guard":[["hasAny",["as a percentage","continue","cube root","nth root","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["compute.root",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-1837424a","guard":[["hasAny",["as a percentage","cube root","nth root","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.root",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-1b238973","guard":[["hasAny",["as a percentage","continue","how many letters","letter count","number of letters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.letters",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-1bec83d4","guard":[["hasAny",["how many words","lowest terms","number of words","ok","reduce the fraction","simplest form","simplify the fraction","word count"]],["has","for"]],"pyramid":["render.str",["compute.fraction",{"lit":1000},["aggregate.words",["sense.before",{"lit":"code"}]]]],"mem":null},
{"id":"n-1c1eef84","guard":[["hasAny",["continue","gcf","goes into","greatest common divisor","greatest common factor","hcf","highest common factor","how many whole times","integer division","whole division"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["transform.idiv",{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-1c4bc4df","guard":[["hasAny",["growth rate","increase by","percent change","percent decrease","percent increase","plus tax","raise by","range","with tax"]],["has","number"]],"pyramid":["render.number",["compute.increase",["compute.percentChange",{"lit":2},["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-1d080fda","guard":[["hasAny",["as text","as words","ascii","ascii codes","character codes","code points","odd numbers","odds","protocols","the odd ones","unicode values","written out"]],["has","give"]],"pyramid":["render.and",["transform.asText",["transform.odds",["transform.charCodes",["sense.wordAt",{"lit":2}]]]]],"mem":null},
{"id":"n-1d2e52b4","guard":[["hasAny",["gcf","greatest common divisor","greatest common factor","hcf","highest common factor","increase by","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-1d625558","guard":[["hasAny",["after years at","area of a circle","area with radius","circle area","compound interest","compounded","grows to","insufficient"]],["has","for"]],"pyramid":["render.number",["compute.circleArea",["compute.compound",["sense.wordCount"],["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-1de4eec3","guard":[["hasAny",["as a percentage","bad","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["compute.gcd",["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-1e482e1d","guard":[["hasAny",["added to","hypotenuse","protocols","pythagoras","pythagorean"]],["has","give"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.add",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-1e510618","guard":[["hasAny",["as a percentage","continue","how many times","how often","occurrences","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.occurrences",["sense.text"],["sense.lastWord"]]]],"mem":null},
{"id":"n-1e7578b6","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["compute.gcd",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-1f37c5dc","guard":[["hasAny",["as a percentage","left over","mod","modulo","ok","percent is","remainder","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.mod",["sense.wordCount"],{"lit":3}],{"lit":1}]],"mem":null},
{"id":"n-1f6c4c9a","guard":[["hasAny",["after years at","compound interest","compounded","grows to","multiplicative inverse","one over","processing","reciprocal"]],["has","means"]],"pyramid":["render.number",["compute.compound",{"lit":100},["transform.reciprocal",["sense.wordCount"]],{"lit":10}]],"mem":null},
{"id":"n-1f896cab","guard":[["hasAny",["as a percentage","bad","left over","mod","modulo","percent is","remainder","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.mod",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-2087aa20","guard":[["hasAny",["as a percentage","ok","percent is","take away","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["transform.sub",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-20fba01a","guard":[["hasAny",["continue","how many times in the list","lowest terms","occurrences in the list","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.countIn",["sense.words"],["sense.lastWord"]]]],"mem":null},
{"id":"n-21565626","guard":[["hasAny",["as a percentage","least common multiple","lowest common multiple","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.lcm",["sense.wordCount"],{"lit":2}],{"lit":4}]],"mem":null},
{"id":"n-221a954f","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.wordAt",{"lit":2}]],{"lit":2}]],"mem":null},
{"id":"n-2254076b","guard":[["hasAny",["increase by","left over","mod","modulo","plus tax","processing","raise by","remainder","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.mod",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-22c5d859","guard":[["hasAny",["as a percentage","bad","how many lines","line count","lines of code","number of lines","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.lines",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-22e61cc5","guard":[["hasAny",["as a percentage","ok","percent is","subtract","take away","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.sub",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-239e66e8","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",["transform.idiv",{"lit":10},["sense.wordCount"]],{"lit":1}]],"mem":null},
{"id":"n-23cda5b4","guard":[["hasAny",["how many vowels","lowest terms","number of vowels","ok","reduce the fraction","simplest form","simplify the fraction","vowel count"]],["has","for"]],"pyramid":["render.str",["compute.fraction",{"lit":1000},["aggregate.vowels",["sense.before",{"lit":"code"}]]]],"mem":null},
{"id":"n-249e5fdd","guard":[["hasAny",["as a percentage","increase by","other","percent is","plus tax","raise by","what percent","what percentage","with tax"]],["has","http"],["has","what"]],"pyramid":["render.number",["compute.asPercent",["compute.increase",["sense.wordCount"],{"lit":1}],{"lit":3}]],"mem":null},
{"id":"n-24ad2143","guard":[["hasAny",["as a percentage","goes into","how many whole times","integer division","ok","percent is","what percent","what percentage","whole division"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.idiv",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-25032c6f","guard":[["hasAny",["as a percentage","bad","how many times in the list","occurrences in the list","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.countIn",["sense.words"],["sense.lastWord"]]]],"mem":null},
{"id":"n-2620a66b","guard":[["hasAny",["after years at","compound interest","compounded","expectation","grows to","to the second power"]],["has","for"]],"pyramid":["render.number",["compute.compound",{"lit":2},["transform.square",["sense.wordCount"]],["sense.wordCount"]]],"mem":null},
{"id":"n-26658734","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["compute.gcd",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-28a9cc00","guard":[["hasAny",["continue","growth rate","hypotenuse","percent change","percent decrease","percent increase","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":3},["compute.percentChange",{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-28c515a1","guard":[["hasAny",["continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","hypotenuse","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-2984ca7d","guard":[["hasAny",["gcf","greatest common divisor","greatest common factor","hcf","highest common factor","increase by","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":100}]]],"mem":null},
{"id":"n-2a134c9d","guard":[["hasAny",["as a percentage","how many vowels","number of vowels","ok","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.vowels",["sense.after",{"lit":"http"}]],{"lit":3}]],"mem":null},
{"id":"n-2bd18008","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["compute.gcd",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-2c61b590","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.before",{"lit":"for"}]],{"lit":3}]],"mem":null},
{"id":"n-2d627f73","guard":[["hasAny",["bad","growth rate","lowest terms","percent change","percent decrease","percent increase","reduce the fraction","simplest form","simplify the fraction"]],["has","request"]],"pyramid":["render.str",["compute.fraction",["compute.percentChange",{"lit":1},["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-2dd452e4","guard":[["hasAny",["continue","growth rate","how many letters","letter count","number of letters","percent change","percent decrease","percent increase","percentage change"]]],"pyramid":["render.number",["compute.percentChange",{"lit":4},["aggregate.letters",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-2e3f051c","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.wordAt",{"lit":3}]],{"lit":4}]],"mem":null},
{"id":"n-2ebe683e","guard":[["hasAny",["as a percentage","continue","how many letters","letter count","number of letters","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.letters",["sense.after",{"lit":"status"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-2f054f73","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.before",{"lit":"of"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-2f3f2de1","guard":[["hasAny",["as a percentage","bad","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["compute.gcd",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-2f70b122","guard":[["hasAny",["added to","as a percentage","continue","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["transform.add",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-31330907","guard":[["hasAny",["continue","goes into","how many whole times","integer division","lowest terms","reduce the fraction","simplest form","simplify the fraction","whole division"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["transform.idiv",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-31c2f804","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.mod",["sense.wordCount"],{"lit":5}],{"lit":3}]],"mem":null},
{"id":"n-340c7aae","guard":[["hasAny",["as a percentage","how many lines","line count","lines of code","number of lines","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.lines",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-3696f279","guard":[["hasAny",["days in the month","how many days in","increase by","length of the month","permanent","plus tax","raise by","with tax"]],["has","http"]],"pyramid":["render.number",["compute.increase",["compute.daysInMonth",["sense.wordCount"],{"lit":2}],{"lit":1000}]],"mem":null},
{"id":"n-36eecd31","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["transform.mod",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-39ea73c4","guard":[["hasAny",["binomial coefficient","combinations","continue","how many times","how often","n choose k","occurrences","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.occurrences",["sense.text"],["sense.lastWord"]]]],"mem":null},
{"id":"n-3b4f9e7f","guard":[["hasAny",["as a percentage","continue","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]],["has","http"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.vowels",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-3c64b706","guard":[["hasAny",["how many letters","joined with","letter count","multistatus","number of letters","separated by"]],["has","give"]],"pyramid":["render.number",["aggregate.letters",["transform.join",["sense.words"],["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-3d749d2c","guard":[["hasAny",["as a percentage","continue","percent is","take away","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.sub",{"lit":12},["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-3d84f37f","guard":[["hasAny",["as a percentage","continue","how many times","how often","occurrences","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.occurrences",["sense.text"],["sense.lastWord"]],{"lit":1}]],"mem":null},
{"id":"n-3dd781c9","guard":[["hasAny",["copies","how many letters","letter count","number of letters","ok","repeat","say it times"]]],"pyramid":["render.number",["aggregate.letters",["transform.repeat",["sense.after",{"lit":"for"}],{"lit":100}]]],"mem":null},
{"id":"n-3f64e63d","guard":[["hasAny",["arrangements","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ordered selections","permutations","ways to arrange"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["compute.permutations",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-3fe1792a","guard":[["hasAny",["as a percentage","goes into","how many whole times","integer division","ok","percent is","what percent","what percentage","whole division"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["transform.idiv",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-414b606d","guard":[["hasAny",["continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","left over","mod","modulo","remainder"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["transform.mod",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-422f0634","guard":[["hasAny",["after a discount","continue","goes into","how many whole times","integer division","reduced by","sale price","whole division"]]],"pyramid":["render.number",["compute.discount",{"lit":100},["transform.idiv",{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-425e1dc6","guard":[["hasAny",["as a percentage","bad","consonant count","how many consonants","number of consonants","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.consonants",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-435e82be","guard":[["hasAny",["continue","gcf","greatest common divisor","greatest common factor","growth rate","hcf","highest common factor","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.gcd",{"lit":1000},["compute.percentChange",{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-44122901","guard":[["hasAny",["after years at","compound interest","compounded","digit count","grows to","how many digits","number of digits","protocols"]],["has","give"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":1},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-447e21d7","guard":[["hasAny",["copies","created","how many words","number of words","repeat","say it times","word count"]],["has","give"]],"pyramid":["render.number",["aggregate.words",["transform.repeat",["sense.before",{"lit":"of"}],{"lit":100}]]],"mem":null},
{"id":"n-450a06b2","guard":[["hasAny",["added to","as a percentage","continue","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.add",["sense.wordCount"],{"lit":4}],{"lit":12}]],"mem":null},
{"id":"n-4699f194","guard":[["hasAny",["as a percentage","bad","how many words","number of words","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.before",{"lit":"status"}]],{"lit":1}]],"mem":null},
{"id":"n-46a84967","guard":[["hasAny",["as a percentage","bad","log base","logarithm","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["compute.log",{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-46a89153","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":5},["transform.mod",{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-475ac96d","guard":[["hasAny",["as a percentage","left over","mod","modulo","ok","percent is","remainder","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.mod",["sense.wordCount"],{"lit":10}],{"lit":4}]],"mem":null},
{"id":"n-47f3fd1e","guard":[["hasAny",["as a percentage","continue","log base","logarithm","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":3},["compute.log",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-4889f5f7","guard":[["hasAny",["after years at","compound interest","compounded","divisor count","grows to","how many factors","number of divisors","processing"]],["has","means"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":1},["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-49158649","guard":[["hasAny",["as a percentage","bad","how many lines","line count","lines of code","number of lines","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.lines",["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-4971c01d","guard":[["hasAny",["continue","hypotenuse","left over","mod","modulo","pythagoras","pythagorean","remainder"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.mod",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-4a3cb2aa","guard":[["hasAny",["as a percentage","continue","least common multiple","lowest common multiple","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1000},["compute.lcm",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-4b8c2968","guard":[["hasAny",["as a percentage","bad","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.vowels",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-4be73f96","guard":[["hasAny",["continue","growth rate","hypotenuse","percent change","percent decrease","percent increase","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":2},["compute.percentChange",{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-4cde322a","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.mod",["sense.wordCount"],{"lit":10}],["sense.wordCount"]]],"mem":null},
{"id":"n-4e92ac5e","guard":[["hasAny",["as a percentage","ok","percent is","take away","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.sub",{"lit":12},["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-4f5755a1","guard":[["hasAny",["as a percentage","bad","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.idiv",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-516b6ea8","guard":[["hasAny",["increase by","left over","mod","modulo","plus tax","processing","raise by","remainder","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.mod",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-521b812c","guard":[["hasAny",["increase by","left over","mod","modulo","plus tax","protocols","raise by","remainder","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.mod",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-52b0f487","guard":[["hasAny",["as a percentage","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["compute.gcd",["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-532856e7","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.before",{"lit":"status"}]],{"lit":2}]],"mem":null},
{"id":"n-54ca27d0","guard":[["hasAny",["continue","hypotenuse","left over","mod","modulo","pythagoras","pythagorean","remainder"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.mod",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-551aaf89","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["transform.mod",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-5622b64c","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.gcd",["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-56e639dc","guard":[["hasAny",["after a discount","continue","goes into","how many whole times","integer division","reduced by","sale price","whole division"]]],"pyramid":["render.number",["compute.discount",{"lit":100},["transform.idiv",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-5774a722","guard":[["hasAny",["continue","least common multiple","lowest common multiple","lowest terms","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",["compute.lcm",["sense.wordCount"],{"lit":100}],{"lit":2}]],"mem":null},
{"id":"n-582b83f0","guard":[["hasAny",["as a percentage","goes into","how many whole times","integer division","ok","percent is","what percent","what percentage","whole division"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.idiv",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-59e6ac8b","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.wordAt",{"lit":1}]],{"lit":2}]],"mem":null},
{"id":"n-5a56dbf5","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",["transform.idiv",["sense.wordCount"],{"lit":3}],{"lit":2}]],"mem":null},
{"id":"n-5c359f0e","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.mod",{"lit":12},["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-5c3d3edc","guard":[["hasAny",["as a percentage","bad","how many words","number of words","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.words",["sense.before",{"lit":"http"}]]]],"mem":null},
{"id":"n-5dcac7d7","guard":[["hasAny",["as a percentage","continue","cube root","nth root","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["compute.root",["sense.wordCount"],{"lit":3}],{"lit":2}]],"mem":null},
{"id":"n-5dfabf25","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",["transform.idiv",{"lit":12},["sense.wordCount"]],{"lit":1}]],"mem":null},
{"id":"n-5dfcadca","guard":[["hasAny",["continue","diagonal","how many words","hypotenuse","number of words","pythagoras","pythagorean","word count"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.words",["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-5e24ec77","guard":[["hasAny",["as a percentage","consonant count","how many consonants","number of consonants","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.before",{"lit":"status"}]],{"lit":5}]],"mem":null},
{"id":"n-5e56da1e","guard":[["hasAny",["as a percentage","hypotenuse","percent is","processing","pythagoras","pythagorean","what percent","what percentage"]],["has","means"]],"pyramid":["render.number",["compute.asPercent",["compute.hypot",["sense.wordCount"],{"lit":1}],["sense.wordCount"]]],"mem":null},
{"id":"n-5f74c102","guard":[["hasAny",["increase by","plus tax","processing","quotient","raise by","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.div",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-5fdce193","guard":[["hasAny",["growth rate","increase by","partial","percent change","percent decrease","percent increase","plus tax","raise by","with tax"]],["has","for"]],"pyramid":["render.number",["compute.increase",["compute.percentChange",{"lit":3},["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-60302107","guard":[["hasAny",["as a percentage","consonant count","how many consonants","number of consonants","ok","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.consonants",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-6099fd8f","guard":[["hasAny",["as a percentage","continue","percent is","take away","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.sub",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-61168f35","guard":[["hasAny",["as a percentage","continue","how many times in the list","occurrences in the list","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.countIn",["sense.words"],["sense.lastWord"]],{"lit":1}]],"mem":null},
{"id":"n-611e6900","guard":[["hasAny",["copies","how many letters","letter count","number of letters","say it times","timeout"]],["has","for"]],"pyramid":["render.number",["aggregate.letters",["transform.repeat",["sense.after",{"lit":"is"}],{"lit":12}]]],"mem":null},
{"id":"n-62f3012f","guard":[["hasAny",["gcf","greatest common divisor","greatest common factor","hcf","highest common factor","least common multiple","lowest common multiple","ok"]],["has","for"]],"pyramid":["render.number",["compute.gcd",{"lit":1000},["compute.lcm",["sense.wordCount"],{"lit":100}]]],"mem":null},
{"id":"n-62fa47b3","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.words",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-63a5c93c","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.after",{"lit":"code"}]],{"lit":1}]],"mem":null},
{"id":"n-63e97c8c","guard":[["hasAny",["after a discount","as a percentage","percent is","processing","reduced by","sale price","what percent","what percentage"]],["has","means"]],"pyramid":["render.number",["compute.asPercent",{"lit":5},["compute.discount",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-6438fae9","guard":[["hasAny",["after years at","compound interest","compounded","consonant count","grows to","how many consonants","number of consonants","ok"]],["has","for"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":100},["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-658a0166","guard":[["hasAny",["as a percentage","consonant count","how many consonants","number of consonants","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.before",{"lit":"http"}]],{"lit":3}]],"mem":null},
{"id":"n-66bfa94b","guard":[["hasAny",["after years at","compound interest","compounded","digit count","grows to","how many digits","number of digits","ok"]],["has","for"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-67ebfe8f","guard":[["hasAny",["as a percentage","ok","percent is","take away","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.sub",{"lit":10},["sense.wordCount"]],{"lit":1}]],"mem":null},
{"id":"n-69209430","guard":[["hasAny",["arrangements","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","ordered selections","permutations","ways to arrange"]],["has","for"]],"pyramid":["render.number",["compute.gcd",{"lit":1000},["compute.permutations",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-6a9cea45","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["compute.gcd",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-6bc6d578","guard":[["hasAny",["as a percentage","hypotenuse","percent is","processing","pythagoras","pythagorean","what percent","what percentage"]],["has","means"]],"pyramid":["render.number",["compute.asPercent",["compute.hypot",["sense.wordCount"],{"lit":1}],{"lit":5}]],"mem":null},
{"id":"n-6bca5708","guard":[["hasAny",["as a percentage","bad","left over","mod","modulo","percent is","remainder","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.mod",{"lit":1000},["sense.wordCount"]]]],"mem":null},
{"id":"n-6ca2f145","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.consonants",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-6ca6e069","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.idiv",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-6cbdb7c5","guard":[["hasAny",["how many times in the list","increase by","occurrences in the list","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.countIn",["sense.words"],["sense.lastWord"]]]],"mem":null},
{"id":"n-6cc36756","guard":[["hasAny",["accepted","after years at","compound interest","compounded","grows to","how many items","number of items"]]],"pyramid":["render.number",["compute.compound",["aggregate.countStrs",["sense.content"]],{"lit":4},{"lit":100}]],"mem":null},
{"id":"n-6d12090c","guard":[["hasAny",["increase by","log base","logarithm","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.log",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-6d8b5588","guard":[["hasAny",["add up","altogether","continue","in all"]]],"pyramid":["render.number",["aggregate.sum",["iterate.steps",{"lit":4},["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-6df815e0","guard":[["hasAny",["as a percentage","continue","how many words","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.words",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-6e2fd5c7","guard":[["hasAny",["continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","hypotenuse","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-6f42866d","guard":[["hasAny",["as a percentage","bad","consonant count","how many consonants","number of consonants","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.after",{"lit":"is"}]],{"lit":5}]],"mem":null},
{"id":"n-6f71123f","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":10}],{"lit":2}]],"mem":null},
{"id":"n-6fa4ecfd","guard":[["hasAny",["as a percentage","left over","mod","modulo","ok","percent is","remainder","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.mod",{"lit":100},["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-72384495","guard":[["hasAny",["as a percentage","continue","percent is","take away","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["transform.sub",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-7249c42f","guard":[["hasAny",["as a percentage","bad","left over","mod","modulo","percent is","remainder","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.mod",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-7257882e","guard":[["hasAny",["accepted","increase by","least common multiple","lowest common multiple","plus tax","raise by","with tax"]]],"pyramid":["render.number",["compute.increase",["compute.lcm",["sense.wordCount"],{"lit":100}],{"lit":1}]],"mem":null},
{"id":"n-733c4fca","guard":[["hasAny",["as a percentage","continue","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]],["has","http"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.vowels",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-736a5aa8","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":3},["transform.mod",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-74e6b2b8","guard":[["hasAny",["continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","left over","mod","modulo","remainder"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["transform.mod",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-753d35e5","guard":[["hasAny",["increase by","log base","logarithm","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.log",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-7605d274","guard":[["hasAny",["as a percentage","consonant count","how many consonants","number of consonants","ok","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.before",{"lit":"for"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-76160dc1","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["transform.idiv",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-76615520","guard":[["hasAny",["as a percentage","left over","mod","modulo","ok","percent is","remainder","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.mod",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-78433efd","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["transform.idiv",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-785bd08b","guard":[["hasAny",["increase by","least common multiple","lowest common multiple","plus tax","processing","raise by","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",["compute.lcm",["sense.wordCount"],{"lit":100}],{"lit":2}]],"mem":null},
{"id":"n-789c1d62","guard":[["hasAny",["gcf","greatest common divisor","greatest common factor","hcf","highest common factor","increase by","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-7907df0d","guard":[["hasAny",["as a percentage","how many vowels","number of vowels","ok","percent is","vowel count","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.vowels",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-7957b20e","guard":[["hasAny",["as a percentage","goes into","how many whole times","integer division","ok","percent is","what percent","what percentage","whole division"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["transform.idiv",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-7aaf546b","guard":[["hasAny",["as a percentage","how many vowels","number of vowels","ok","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.vowels",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-7b558258","guard":[["hasAny",["how many times","how often","increase by","occurrences","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.occurrences",["sense.text"],["sense.lastWord"]]]],"mem":null},
{"id":"n-7b6c3b7f","guard":[["hasAny",["as a percentage","continue","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.vowels",["sense.after",{"lit":"status"}]],{"lit":4}]],"mem":null},
{"id":"n-7c891e1b","guard":[["hasAny",["how many vowels","increase by","number of vowels","plus tax","processing","raise by","vowel count","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.vowels",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-7ca05209","guard":[["hasAny",["consonant count","continue","copies","how many consonants","number of consonants","say it times","shortest","shortest one","shortest word"]]],"pyramid":["render.number",["aggregate.consonants",["transform.repeat",["aggregate.shortest",["sense.words"]],{"lit":100}]]],"mem":null},
{"id":"n-7ced3d8f","guard":[["hasAny",["as a percentage","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":12}],{"lit":2}]],"mem":null},
{"id":"n-7d794592","guard":[["hasAny",["as a percentage","least common multiple","lowest common multiple","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.lcm",["sense.wordCount"],{"lit":3}],{"lit":12}]],"mem":null},
{"id":"n-7d8c8de2","guard":[["hasAny",["as a percentage","continue","how many words","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.words",["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-7f2953f8","guard":[["hasAny",["how many letters","information","joined with","letter count","number of letters","separated by"]],["has","number"]],"pyramid":["render.number",["aggregate.letters",["transform.join",["sense.content"],["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-8103ec03","guard":[["hasAny",["growth rate","hypotenuse","percent change","percent decrease","percent increase","processing","pythagoras","pythagorean"]],["has","means"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.percentChange",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-82ac8743","guard":[["hasAny",["as a percentage","ok","percent is","quotient","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.div",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-83979c5f","guard":[["hasAny",["how many lines","increase by","line count","lines of code","markup","number of lines","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.lines",["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-83aa8a4e","guard":[["hasAny",["least common multiple","lowest common multiple","lowest terms","ok","reduce the fraction","simplest form","simplify the fraction"]],["has","for"]],"pyramid":["render.str",["compute.fraction",["compute.lcm",["sense.wordCount"],{"lit":1000}],{"lit":5}]],"mem":null},
{"id":"n-83ab1de3","guard":[["hasAny",["as a percentage","left over","mod","modulo","ok","percent is","remainder","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.mod",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-83b2845b","guard":[["hasAny",["as a percentage","bad","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["transform.idiv",["sense.wordCount"],{"lit":2}],{"lit":1}]],"mem":null},
{"id":"n-844d43f2","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.words",["sense.before",{"lit":"for"}]]]],"mem":null},
{"id":"n-84d3114e","guard":[["hasAny",["as a percentage","bad","consonant count","how many consonants","number of consonants","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.consonants",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-84e49091","guard":[["hasAny",["as a percentage","bad","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.vowels",["sense.before",{"lit":"http"}]]]],"mem":null},
{"id":"n-8550e7bd","guard":[["hasAny",["as a percentage","continue","percent is","subtract","take away","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.sub",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-85cdb422","guard":[["hasAny",["after a discount","continue","left over","mod","modulo","reduced by","remainder","sale price"]]],"pyramid":["render.number",["compute.discount",{"lit":100},["transform.mod",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-8660282e","guard":[["hasAny",["after years at","compound interest","compounded","digit count","grows to","how many digits","number of digits","processing"]],["has","means"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":2},["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-872cd0f8","guard":[["hasAny",["accepted","after years at","compound interest","compounded","grows to","halve"]]],"pyramid":["render.number",["compute.compound",{"lit":4},["transform.half",["sense.wordCount"]],{"lit":100}]],"mem":null},
{"id":"n-876d79ff","guard":[["hasAny",["as a percentage","continue","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.vowels",["sense.wordAt",{"lit":3}]],{"lit":2}]],"mem":null},
{"id":"n-8839150e","guard":[["hasAny",["binomial coefficient","combinations","continue","how many times in the list","n choose k","occurrences in the list","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.countIn",["sense.words"],["sense.lastWord"]]]],"mem":null},
{"id":"n-88641e5b","guard":[["hasAny",["consonant count","continue","how many consonants","join","joined with","number of consonants","separated by"]]],"pyramid":["render.number",["aggregate.consonants",["transform.join",["sense.words"],["sense.before",{"lit":"http"}]]]],"mem":null},
{"id":"n-89138527","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.mod",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-8979e4f4","guard":[["hasAny",["consonant count","copies","how many consonants","number of consonants","ok","say it times"]],["has","for"]],"pyramid":["render.number",["aggregate.consonants",["transform.repeat",["sense.wordAt",{"lit":3}],{"lit":100}]]],"mem":null},
{"id":"n-898ed72d","guard":[["hasAny",["as a percentage","left over","mod","modulo","ok","percent is","remainder","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.mod",{"lit":100},["sense.wordCount"]]]],"mem":null},
{"id":"n-89a6dadd","guard":[["hasAny",["binomial coefficient","combinations","continue","goes into","how many whole times","integer division","n choose k","ways to choose","whole division"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["transform.idiv",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-8a6c2244","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.after",{"lit":"is"}]],{"lit":3}]],"mem":null},
{"id":"n-8b26d577","guard":[["hasAny",["as a percentage","increase by","percent is","plus tax","protocols","raise by","what percent","what percentage","with tax"]],["has","give"]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["compute.increase",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-8ba8fb9b","guard":[["hasAny",["hypotenuse","least common multiple","lowest common multiple","processing","pythagoras","pythagorean"]],["has","means"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.lcm",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-8bf283c3","guard":[["hasAny",["as a percentage","how many vowels","number of vowels","ok","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.vowels",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-8bf88b5e","guard":[["hasAny",["continue","copies","how many vowels","number of vowels","say it times","shortest","shortest one","shortest word","vowel count"]]],"pyramid":["render.number",["aggregate.vowels",["transform.repeat",["aggregate.shortest",["sense.words"]],{"lit":100}]]],"mem":null},
{"id":"n-8c3e4646","guard":[["hasAny",["after a discount","growth rate","percent change","percent decrease","percent increase","permanent","reduced by","sale price"]],["has","http"]],"pyramid":["render.number",["compute.discount",["compute.percentChange",{"lit":2},["sense.wordCount"]],{"lit":12}]],"mem":null},
{"id":"n-8c42f2f7","guard":[["hasAny",["hypotenuse","multiplied by","processing","product of","pythagoras","pythagorean"]],["has","means"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.mul",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-8d2d1dd8","guard":[["hasAny",["after years at","also","area of a circle","area with radius","circle area","compound interest","compounded","grows to"]],["has","number"]],"pyramid":["render.number",["compute.compound",["compute.circleArea",["sense.wordCount"]],{"lit":10},{"lit":5}]],"mem":null},
{"id":"n-8dc981cd","guard":[["hasAny",["as a percentage","left over","mod","modulo","ok","percent is","remainder","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.mod",{"lit":12},["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-8e51f3bd","guard":[["hasAny",["character at","continue","from roman","in arabic numerals","letter at","nth letter","roman numeral value","what number is","which letter"]]],"pyramid":["render.number",["compute.fromRoman",["transform.charAt",["sense.after",{"lit":"status"}],{"lit":1}]]],"mem":null},
{"id":"n-8ead5f67","guard":[["hasAny",["as a percentage","increase by","percent is","plus tax","processing","raise by","what percent","what percentage","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",["compute.asPercent",{"lit":5},["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-8f5908bf","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.mod",["sense.wordCount"],{"lit":3}],{"lit":2}]],"mem":null},
{"id":"n-9179c75c","guard":[["hasAny",["after a discount","protocols","reduced by","sale price","take away"]],["has","give"]],"pyramid":["render.number",["compute.discount",{"lit":100},["transform.sub",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-933653ba","guard":[["hasAny",["as text","as words","continue","digit count","how many digits","number of digits","written out"]]],"pyramid":["render.and",["transform.asText",["iterate.powers",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]]],"mem":null},
{"id":"n-938e3f4b","guard":[["hasAny",["as a percentage","bad","left over","mod","modulo","percent is","remainder","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["transform.mod",["sense.wordCount"],{"lit":5}],{"lit":1}]],"mem":null},
{"id":"n-9485df44","guard":[["hasAny",["consonant count","continue","how many consonants","hypotenuse","number of consonants","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.consonants",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-94aa9cb3","guard":[["hasAny",["as a percentage","increase by","percent is","plus tax","processing","raise by","what percent","what percentage","with tax"]],["has","means"]],"pyramid":["render.number",["compute.asPercent",["compute.increase",["sense.wordCount"],{"lit":2}],{"lit":5}]],"mem":null},
{"id":"n-9584b93e","guard":[["hasAny",["accepted","after years at","compound interest","compounded","divisor count","grows to","how many factors","number of divisors"]]],"pyramid":["render.number",["compute.compound",{"lit":4},["compute.divisorCount",["sense.wordCount"]],{"lit":100}]],"mem":null},
{"id":"n-97522abe","guard":[["hasAny",["as a percentage","bad","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.gcd",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-97d35222","guard":[["hasAny",["as a percentage","bad","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["compute.gcd",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-97f3b959","guard":[["hasAny",["increase by","multiplied by","plus tax","processing","product of","raise by","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",{"lit":2},["transform.mul",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-983d6e37","guard":[["hasAny",["continue","cube root","hypotenuse","nth root","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.root",{"lit":1000},["sense.wordCount"]]]],"mem":null},
{"id":"n-98590c25","guard":[["hasAny",["growth rate","increase by","percent change","percent decrease","percent increase","plus tax","processing","raise by","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",["compute.percentChange",["sense.wordCount"],{"lit":10}],{"lit":2}]],"mem":null},
{"id":"n-99228fdc","guard":[["hasAny",["bad","growth rate","increase by","percent change","percent decrease","percent increase","plus tax","raise by","with tax"]],["has","request"]],"pyramid":["render.number",["compute.increase",["compute.percentChange",{"lit":3},["sense.wordCount"]],{"lit":100}]],"mem":null},
{"id":"n-99fdbb4e","guard":[["hasAny",["as a percentage","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["compute.gcd",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-9b98163f","guard":[["hasAny",["as a percentage","continue","least common multiple","lowest common multiple","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["compute.lcm",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-9c1e7420","guard":[["hasAny",["added to","continue","lowest terms","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":1000},["transform.add",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-9c522e54","guard":[["hasAny",["as text","as words","continue","digit count","how many digits","number of digits","written out"]]],"pyramid":["render.and",["transform.asText",["iterate.multiples",{"lit":100},["aggregate.digitCount",["sense.wordCount"]]]]],"mem":null},
{"id":"n-9d2ee34b","guard":[["hasAny",["as a percentage","bad","percent is","quotient","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":3},["transform.div",["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-9e1c8b20","guard":[["hasAny",["as a percentage","bad","how many words","number of words","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-9e429634","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.mod",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-9eaae1a8","guard":[["hasAny",["continue","how many lines","line count","lines of code","lowest terms","number of lines","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.lines",["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-9f662fb3","guard":[["hasAny",["protocols","sum of squares","sum of the squares"]],["has","give"]],"pyramid":["render.number",["aggregate.sumSquares",["iterate.steps",{"lit":1},["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-a04bc4ce","guard":[["hasAny",["as a percentage","bad","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.vowels",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-a1d038c3","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.consonants",["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-a2849975","guard":[["hasAny",["continue","how many lines","line count","lines of code","lowest terms","number of lines","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.lines",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-a383166e","guard":[["hasAny",["accepted","after years at","compound interest","compounded","grows to","halve"]]],"pyramid":["render.number",["compute.compound",["transform.half",["sense.wordCount"]],{"lit":4},{"lit":100}]],"mem":null},
{"id":"n-a4a94467","guard":[["hasAny",["accepted","after years at","compound interest","compounded","divisor count","grows to","how many factors","number of divisors"]]],"pyramid":["render.number",["compute.compound",["compute.divisorCount",["sense.wordCount"]],{"lit":4},{"lit":100}]],"mem":null},
{"id":"n-a4b71a01","guard":[["hasAny",["as a percentage","left over","mod","modulo","ok","percent is","remainder","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["transform.mod",{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-a56e7645","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.mod",{"lit":100},["sense.wordCount"]],{"lit":4}]],"mem":null},
{"id":"n-a601146a","guard":[["hasAny",["as a percentage","how many lines","line count","lines of code","number of lines","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.lines",["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-a6077dc7","guard":[["hasAny",["binomial coefficient","combinations","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","n choose k","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-a65e81bb","guard":[["hasAny",["accepted","as a percentage","binomial coefficient","combinations","n choose k","percent is","ways to choose","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1000},["compute.choose",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-a67e69ed","guard":[["hasAny",["continue","least common multiple","lowest common multiple","lowest terms","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",["compute.lcm",["sense.wordCount"],{"lit":1000}],{"lit":10}]],"mem":null},
{"id":"n-a8b902ba","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.after",{"lit":"http"}]],["sense.wordCount"]]],"mem":null},
{"id":"n-a98e0f9f","guard":[["hasAny",["as a percentage","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":2}],{"lit":1}]],"mem":null},
{"id":"n-ab4b8f56","guard":[["hasAny",["goes into","how many whole times","hypotenuse","integer division","processing","pythagoras","pythagorean","whole division"]],["has","means"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.idiv",{"lit":100},["sense.wordCount"]]]],"mem":null},
{"id":"n-ac201e9e","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":3}],{"lit":1}]],"mem":null},
{"id":"n-acc23850","guard":[["hasAny",["as a percentage","how many vowels","number of vowels","ok","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["aggregate.vowels",["sense.before",{"lit":"code"}]]]],"mem":null},
{"id":"n-ad256da0","guard":[["hasAny",["continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","lowest terms","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-ad8b6b4c","guard":[["hasAny",["as a percentage","continue","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.vowels",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-ae2f8db9","guard":[["hasAny",["as a percentage","continue","percent is","take away","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.sub",["sense.wordCount"],{"lit":3}],{"lit":5}]],"mem":null},
{"id":"n-af9be740","guard":[["hasAny",["biggest","continue"]]],"pyramid":["render.number",["aggregate.max",["iterate.steps",{"lit":12},["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-b078bd38","guard":[["hasAny",["as a percentage","continue","log base","logarithm","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["compute.log",["sense.wordCount"],{"lit":2}],{"lit":3}]],"mem":null},
{"id":"n-b0e866ec","guard":[["hasAny",["as a percentage","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":1000}],{"lit":4}]],"mem":null},
{"id":"n-b156eb5e","guard":[["hasAny",["as a percentage","goes into","how many whole times","integer division","ok","percent is","what percent","what percentage","whole division"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.idiv",["sense.wordCount"],{"lit":4}],{"lit":1}]],"mem":null},
{"id":"n-b1b5ea36","guard":[["hasAny",["as a percentage","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":100}],{"lit":2}]],"mem":null},
{"id":"n-b2130919","guard":[["hasAny",["how many words","increase by","markup","number of words","plus tax","processing","raise by","with tax","word count"]],["has","which"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.words",["sense.before",{"lit":"code"}]]]],"mem":null},
{"id":"n-b27120b0","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":100}],{"lit":4}]],"mem":null},
{"id":"n-b378801f","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.words",["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-b3945dd3","guard":[["hasAny",["after a discount","processing","reduced by","sale price","take away"]],["has","means"]],"pyramid":["render.number",["compute.discount",{"lit":100},["transform.sub",{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-b47a2492","guard":[["hasAny",["as a percentage","continue","how many words","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.after",{"lit":"of"}]],{"lit":4}]],"mem":null},
{"id":"n-b4b0881b","guard":[["hasAny",["add the digits","after years at","compound interest","compounded","digit sum","grows to","processing","sum of the digits"]],["has","means"]],"pyramid":["render.number",["aggregate.digitSum",["compute.compound",["sense.wordCount"],{"lit":4},{"lit":1000}]]],"mem":null},
{"id":"n-b5602c4c","guard":[["hasAny",["continue","copies","how many vowels","number of vowels","say it times","vowel count"]]],"pyramid":["render.number",["aggregate.vowels",["transform.repeat",["sense.wordAt",{"lit":2}],{"lit":100}]]],"mem":null},
{"id":"n-b6050e61","guard":[["hasAny",["added to","as a percentage","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.add",["sense.wordCount"],{"lit":12}],{"lit":10}]],"mem":null},
{"id":"n-b741ee41","guard":[["hasAny",["after a discount","goes into","how many whole times","integer division","protocols","reduced by","sale price","whole division"]],["has","give"]],"pyramid":["render.number",["compute.discount",["transform.idiv",{"lit":1000},["sense.wordCount"]],["sense.wordCount"]]],"mem":null},
{"id":"n-b7a0d2ff","guard":[["hasAny",["as a percentage","continue","least common multiple","lowest common multiple","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["compute.lcm",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-b90c128d","guard":[["hasAny",["binomial coefficient","combinations","continue","goes into","how many whole times","integer division","n choose k","ways to choose","whole division"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["transform.idiv",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-b9cf17fb","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["compute.gcd",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-ba394baa","guard":[["hasAny",["as a percentage","how many letters","letter count","number of letters","ok","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.letters",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-bb7a2aab","guard":[["hasAny",["as a percentage","log base","logarithm","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":3},["compute.log",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-bc82873a","guard":[["hasAny",["binomial coefficient","combinations","continue","how many vowels","n choose k","number of vowels","vowel count","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.vowels",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-bccb444b","guard":[["hasAny",["consonant count","how many consonants","lowest terms","number of consonants","ok","reduce the fraction","simplest form","simplify the fraction"]],["has","for"]],"pyramid":["render.str",["compute.fraction",{"lit":1000},["aggregate.consonants",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-bce43f8f","guard":[["hasAny",["after a discount","as a percentage","percent is","processing","reduced by","sale price","what percent","what percentage"]],["has","means"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["compute.discount",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-bd90efb5","guard":[["hasAny",["as a percentage","goes into","how many whole times","integer division","ok","percent is","what percent","what percentage","whole division"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.idiv",["sense.wordCount"],{"lit":3}],{"lit":1}]],"mem":null},
{"id":"n-bda42e0e","guard":[["hasAny",["as a percentage","bad","percent is","take away","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["transform.sub",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-bf087729","guard":[["hasAny",["as a percentage","bad","consonant count","how many consonants","number of consonants","percent is","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.before",{"lit":"for"}]],{"lit":4}]],"mem":null},
{"id":"n-bf3497aa","guard":[["hasAny",["added to","as a percentage","continue","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["transform.add",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-bf80b78e","guard":[["hasAny",["gcf","greatest common divisor","greatest common factor","hcf","highest common factor","increase by","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-c0665260","guard":[["hasAny",["as a percentage","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":10}],{"lit":1}]],"mem":null},
{"id":"n-c1133e53","guard":[["hasAny",["as a percentage","continue","how many words","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-c149e576","guard":[["hasAny",["as a percentage","bad","percent is","take away","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["transform.sub",["sense.wordCount"],{"lit":5}],{"lit":1}]],"mem":null},
{"id":"n-c205f707","guard":[["hasAny",["continue","hypotenuse","log base","logarithm","pythagoras","pythagorean"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.log",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-c20ae1d9","guard":[["hasAny",["after a discount","continue","quotient","reduced by","sale price"]]],"pyramid":["render.number",["compute.discount",{"lit":100},["transform.div",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-c29c3b9e","guard":[["hasAny",["as a percentage","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["compute.gcd",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-c29e030a","guard":[["hasAny",["continue","growth rate","lowest terms","percent change","percent decrease","percent increase","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",["compute.percentChange",{"lit":2},["sense.wordCount"]],{"lit":3}]],"mem":null},
{"id":"n-c30b7865","guard":[["hasAny",["how many words","increase by","markup","number of words","plus tax","processing","raise by","with tax","word count"]],["has","which"]],"pyramid":["render.number",["compute.increase",{"lit":100},["aggregate.words",["sense.after",{"lit":"code"}]]]],"mem":null},
{"id":"n-c3b16e89","guard":[["hasAny",["as a percentage","how many vowels","number of vowels","ok","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.vowels",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-c433dde1","guard":[["hasAny",["bad","copies","how many vowels","number of vowels","repeat","say it times","vowel count"]],["has","what"]],"pyramid":["render.number",["aggregate.vowels",["transform.repeat",["sense.after",{"lit":"for"}],{"lit":100}]]],"mem":null},
{"id":"n-c5c2f069","guard":[["hasAny",["as a percentage","hypotenuse","ok","percent is","pythagoras","pythagorean","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.hypot",{"lit":4},["compute.asPercent",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-c67fc6a6","guard":[["hasAny",["after years at","compound interest","compounded","grows to","how many vowels","number of vowels","ok","vowel count"]],["has","for"]],"pyramid":["render.number",["compute.compound",{"lit":100},{"lit":100},["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-c6cc2042","guard":[["hasAny",["continue","hypotenuse","pythagoras","pythagorean","take away"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.sub",["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-c6d7c307","guard":[["hasAny",["as a percentage","bad","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["transform.idiv",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-c91490f6","guard":[["hasAny",["as a percentage","how many vowels","number of vowels","ok","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.vowels",["sense.after",{"lit":"http"}]]]],"mem":null},
{"id":"n-ca96ee2b","guard":[["hasAny",["continue","hypotenuse","pythagoras","pythagorean","quotient"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.div",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-cac961a0","guard":[["hasAny",["continue","how many times","how often","lowest terms","occurrences","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.occurrences",["sense.text"],["sense.lastWord"]]]],"mem":null},
{"id":"n-cb038438","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.mod",{"lit":5},["sense.wordCount"]],{"lit":5}]],"mem":null},
{"id":"n-cbffcf31","guard":[["hasAny",["after a discount","continue","left over","mod","modulo","reduced by","remainder","sale price"]]],"pyramid":["render.number",["compute.discount",{"lit":100},["transform.mod",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-cd54a0a1","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.consonants",["sense.before",{"lit":"of"}]]]],"mem":null},
{"id":"n-ce3f7d16","guard":[["hasAny",["as a percentage","cube root","nth root","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.root",["sense.wordCount"],{"lit":3}],{"lit":1}]],"mem":null},
{"id":"n-cebbbeec","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["compute.asPercent",{"lit":1000},["sense.wordCount"]]]],"mem":null},
{"id":"n-cf038f5a","guard":[["hasAny",["as a percentage","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":4}],{"lit":2}]],"mem":null},
{"id":"n-cf1dee63","guard":[["hasAny",["arrangements","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ordered selections","permutations","ways to arrange"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["compute.permutations",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-cf625a99","guard":[["hasAny",["as a percentage","bad","increase by","percent is","plus tax","raise by","what percent","what percentage","with tax"]],["has","request"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.asPercent",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-d12ec39f","guard":[["hasAny",["as a percentage","how many vowels","number of vowels","ok","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.vowels",["sense.after",{"lit":"status"}]],{"lit":2}]],"mem":null},
{"id":"n-d1dcada1","guard":[["hasAny",["as a percentage","bad","consonant count","how many consonants","number of consonants","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.after",{"lit":"code"}]],{"lit":2}]],"mem":null},
{"id":"n-d24d3610","guard":[["hasAny",["increase by","left over","mod","modulo","plus tax","protocols","raise by","remainder","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.mod",{"lit":100},["sense.wordCount"]]]],"mem":null},
{"id":"n-d25d2752","guard":[["hasAny",["as a percentage","continue","how many words","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.after",{"lit":"http"}]],{"lit":2}]],"mem":null},
{"id":"n-d2669070","guard":[["hasAny",["binomial coefficient","combinations","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","n choose k","ways to choose"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-d2c6bd87","guard":[["hasAny",["as a percentage","continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["compute.gcd",["sense.wordCount"],{"lit":12}],{"lit":4}]],"mem":null},
{"id":"n-d39f6432","guard":[["hasAny",["as a percentage","bad","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.idiv",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-d3c1f707","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",["transform.idiv",["sense.wordCount"],{"lit":2}],{"lit":4}]],"mem":null},
{"id":"n-d3d04768","guard":[["hasAny",["after a discount","continue","left over","mod","modulo","reduced by","remainder","sale price"]]],"pyramid":["render.number",["compute.discount",{"lit":100},["transform.mod",{"lit":1000},["sense.wordCount"]]]],"mem":null},
{"id":"n-d3eb9bda","guard":[["hasAny",["as a percentage","how many lines","line count","lines of code","number of lines","ok","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.lines",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-d419b789","guard":[["hasAny",["as a percentage","bad","how many times","how often","occurrences","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.occurrences",["sense.text"],["sense.lastWord"]]]],"mem":null},
{"id":"n-d4474fb0","guard":[["hasAny",["left over","lowest terms","mod","modulo","ok","reduce the fraction","remainder","simplest form","simplify the fraction"]],["has","for"]],"pyramid":["render.str",["compute.fraction",{"lit":1000},["transform.mod",{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-d778f4a9","guard":[["hasAny",["as a percentage","left over","mod","modulo","ok","percent is","remainder","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["transform.mod",{"lit":10},["sense.wordCount"]],{"lit":1}]],"mem":null},
{"id":"n-d7b64610","guard":[["hasAny",["character at","continue","from roman","in arabic numerals","letter at","nth letter","roman numeral value","what number is","which letter"]]],"pyramid":["render.number",["compute.fromRoman",["transform.charAt",["sense.after",{"lit":"http"}],["sense.wordCount"]]]],"mem":null},
{"id":"n-d832e3cd","guard":[["hasAny",["after years at","compound interest","compounded","grows to","one less","predecessor","previous","supported"]],["has","give"]],"pyramid":["render.number",["compute.compound",["transform.prev",["sense.wordCount"]],{"lit":4},{"lit":100}]],"mem":null},
{"id":"n-d91b5790","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["aggregate.words",["sense.before",{"lit":"status"}]]]],"mem":null},
{"id":"n-dab7a2d7","guard":[["hasAny",["continue","goes into","how many whole times","increase by","integer division","plus tax","raise by","whole division","with tax"]]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.idiv",{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-db288ef6","guard":[["hasAny",["as a percentage","goes into","how many whole times","integer division","ok","percent is","what percent","what percentage","whole division"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["transform.idiv",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-db98b60d","guard":[["hasAny",["continue","growth rate","lowest terms","percent change","percent decrease","percent increase","reduce the fraction","simplest form","simplify the fraction"]]],"pyramid":["render.str",["compute.fraction",["compute.percentChange",{"lit":4},["sense.wordCount"]],{"lit":1}]],"mem":null},
{"id":"n-dbecfee2","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",["transform.idiv",{"lit":100},["sense.wordCount"]],{"lit":12}]],"mem":null},
{"id":"n-dbf948fa","guard":[["hasAny",["as a percentage","continue","hypotenuse","percent is","pythagoras","pythagorean","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1000},["compute.hypot",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-dc1a1799","guard":[["hasAny",["as a percentage","hypotenuse","percent is","processing","pythagoras","pythagorean","what percent","what percentage"]],["has","means"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.asPercent",{"lit":1},["sense.wordCount"]]]],"mem":null},
{"id":"n-dc2b4e8e","guard":[["hasAny",["as a percentage","increase by","percent is","plus tax","processing","raise by","what percent","what percentage","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",["compute.asPercent",["sense.wordCount"],{"lit":5}],{"lit":2}]],"mem":null},
{"id":"n-dc5d0d59","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.words",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-dc65a177","guard":[["hasAny",["continue","gcf","greatest common divisor","greatest common factor","growth rate","hcf","highest common factor","percent change","percent decrease","percent increase"]]],"pyramid":["render.number",["compute.gcd",{"lit":1000},["compute.percentChange",{"lit":1},["sense.wordCount"]]]],"mem":null},
{"id":"n-dd7b96e8","guard":[["hasAny",["as a percentage","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["compute.gcd",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-ddf5ae1d","guard":[["hasAny",["as a percentage","continue","how many words","number of words","percent is","what percent","what percentage","word count"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.words",["sense.before",{"lit":"http"}]],{"lit":5}]],"mem":null},
{"id":"n-de560df9","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["transform.idiv",{"lit":100},["sense.wordCount"]]]],"mem":null},
{"id":"n-deaed227","guard":[["hasAny",["cube root","increase by","nth root","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.root",["sense.wordCount"],{"lit":100}]]],"mem":null},
{"id":"n-dfd98149","guard":[["hasAny",["as a percentage","continue","percent is","take away","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.sub",{"lit":10},["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-e046723d","guard":[["hasAny",["continue","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","left over","mod","modulo","remainder"]]],"pyramid":["render.number",["compute.gcd",{"lit":100},["transform.mod",{"lit":1000},["sense.wordCount"]]]],"mem":null},
{"id":"n-e145c4ee","guard":[["hasAny",["accepted","after years at","compound interest","compounded","grows to","how many items","number of items"]]],"pyramid":["render.number",["compute.compound",{"lit":4},["aggregate.countStrs",["sense.content"]],{"lit":100}]],"mem":null},
{"id":"n-e1cc04b4","guard":[["hasAny",["as a percentage","bad","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["aggregate.vowels",["sense.before",{"lit":"status"}]]]],"mem":null},
{"id":"n-e395f955","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["aggregate.consonants",["sense.after",{"lit":"status"}]],{"lit":4}]],"mem":null},
{"id":"n-e3c04a2d","guard":[["hasAny",["added to","as a percentage","bad","percent is","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",["transform.add",["sense.wordCount"],{"lit":3}],{"lit":3}]],"mem":null},
{"id":"n-e449c748","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]],["has","http"]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.consonants",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-e5859a70","guard":[["hasAny",["add up","altogether","in all","supported"]],["has","give"]],"pyramid":["render.number",["aggregate.sum",["iterate.steps",{"lit":1},["sense.wordCount"],{"lit":10}]]],"mem":null},
{"id":"n-e5e28fe5","guard":[["hasAny",["hypotenuse","least common multiple","lowest common multiple","ok","pythagoras","pythagorean"]],["has","for"]],"pyramid":["render.number",["compute.hypot",{"lit":4},["compute.lcm",["sense.wordCount"],{"lit":100}]]],"mem":null},
{"id":"n-e63fd870","guard":[["hasAny",["growth rate","increase by","no","percent change","percent decrease","percent increase","plus tax","raise by","with tax"]],["has","http"]],"pyramid":["render.number",["compute.increase",["compute.percentChange",{"lit":3},["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-e66af0dd","guard":[["hasAny",["goes into","how many whole times","increase by","integer division","plus tax","processing","raise by","whole division","with tax"]],["has","means"]],"pyramid":["render.number",["compute.increase",{"lit":100},["transform.idiv",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-e675baa2","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["transform.idiv",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-e6f7128a","guard":[["hasAny",["as a percentage","consonant count","how many consonants","number of consonants","ok","percent is","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["aggregate.consonants",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-e8d047d5","guard":[["hasAny",["as a percentage","continue","how many vowels","number of vowels","percent is","vowel count","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":1},["aggregate.vowels",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-ea75a1c6","guard":[["hasAny",["add up","altogether","continue","in all"]]],"pyramid":["render.number",["aggregate.sum",["iterate.steps",{"lit":2},{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-ea80e818","guard":[["hasAny",["continue","how many vowels","lowest terms","number of vowels","reduce the fraction","simplest form","simplify the fraction","vowel count"]]],"pyramid":["render.str",["compute.fraction",{"lit":100},["aggregate.vowels",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-eaca31e0","guard":[["hasAny",["as a percentage","ok","percent is","take away","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["transform.sub",["sense.wordCount"],{"lit":3}]]],"mem":null},
{"id":"n-eb4d48fd","guard":[["hasAny",["continue","diagonal","how many words","hypotenuse","number of words","pythagoras","pythagorean","word count"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["aggregate.words",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-ecc9cd35","guard":[["hasAny",["continue","hypotenuse","left over","mod","modulo","pythagoras","pythagorean","remainder"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.mod",{"lit":1000},["sense.wordCount"]]]],"mem":null},
{"id":"n-ed66f710","guard":[["hasAny",["continue","hypotenuse","pythagoras","pythagorean","take away"]]],"pyramid":["render.number",["compute.hypot",{"lit":100},["transform.sub",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-ee503c05","guard":[["hasAny",["as a percentage","how many words","number of words","ok","percent is","what percent","what percentage","word count"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",{"lit":10},["aggregate.words",["sense.before",{"lit":"code"}]]]],"mem":null},
{"id":"n-ee62dc98","guard":[["hasAny",["add the digits","after years at","compound interest","compounded","digit sum","grows to","processing","sum of the digits"]],["has","means"]],"pyramid":["render.number",["aggregate.digitSum",["compute.compound",{"lit":4},["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-ef808ca3","guard":[["hasAny",["as a percentage","bad","left over","mod","modulo","percent is","remainder","what percent","what percentage"]],["has","request"]],"pyramid":["render.number",["compute.asPercent",{"lit":12},["transform.mod",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-f251f1a2","guard":[["hasAny",["binomial coefficient","choose","combinations","continue","how many words","n choose k","number of words","ways to choose","word count"]]],"pyramid":["render.number",["compute.choose",{"lit":100},["aggregate.words",["sense.after",{"lit":"status"}]]]],"mem":null},
{"id":"n-f31bf6df","guard":[["hasAny",["as a percentage","consonant count","continue","how many consonants","number of consonants","percent is","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["aggregate.consonants",["sense.wordAt",{"lit":1}]]]],"mem":null},
{"id":"n-f333056a","guard":[["hasAny",["gcf","greatest common divisor","greatest common factor","hcf","highest common factor","increase by","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",{"lit":100},["compute.gcd",["sense.wordCount"],{"lit":5}]]],"mem":null},
{"id":"n-f45e354f","guard":[["hasAny",["arrangements","gcf","greatest common divisor","greatest common factor","hcf","highest common factor","ok","ordered selections","permutations","ways to arrange"]],["has","for"]],"pyramid":["render.number",["compute.gcd",{"lit":1000},["compute.permutations",{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-f53d7a04","guard":[["hasAny",["as a percentage","bad","how many lines","line count","lines of code","number of lines","percent is","what percent","what percentage"]],["has","what"]],"pyramid":["render.number",["compute.asPercent",{"lit":4},["aggregate.lines",["sense.after",{"lit":"for"}]]]],"mem":null},
{"id":"n-f540922d","guard":[["hasAny",["as a percentage","ok","percent is","take away","what percent","what percentage"]],["has","for"]],"pyramid":["render.number",["compute.asPercent",["sense.wordCount"],["transform.sub",{"lit":12},["sense.wordCount"]]]],"mem":null},
{"id":"n-f5cb1b06","guard":[["hasAny",["biggest","protocols"]],["has","give"]],"pyramid":["render.number",["aggregate.max",["iterate.steps",{"lit":2},["sense.wordCount"],{"lit":12}]]],"mem":null},
{"id":"n-f62461d7","guard":[["hasAny",["arrangements","hypotenuse","ordered selections","permutations","processing","pythagoras","pythagorean","ways to arrange"]],["has","means"]],"pyramid":["render.number",["compute.hypot",{"lit":100},["compute.permutations",["sense.wordCount"],{"lit":2}]]],"mem":null},
{"id":"n-f6b613b7","guard":[["hasAny",["increase by","plus tax","protocols","raise by","with tax"]],["has","give"]],"pyramid":["render.number",["compute.increase",["compute.increase",["sense.wordCount"],{"lit":2}],{"lit":1000}]],"mem":null},
{"id":"n-f8688d60","guard":[["hasAny",["as a percentage","continue","lowest terms","percent is","reduce the fraction","simplest form","simplify the fraction","what percent","what percentage"]]],"pyramid":["render.str",["compute.fraction",["compute.asPercent",["sense.wordCount"],{"lit":2}],{"lit":4}]],"mem":null},
{"id":"n-f93a3c0d","guard":[["hasAny",["as a percentage","continue","percent is","take away","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.sub",["sense.wordCount"],{"lit":5}],{"lit":3}]],"mem":null},
{"id":"n-fab807b5","guard":[["hasAny",["as a percentage","continue","goes into","how many whole times","integer division","percent is","what percent","what percentage","whole division"]]],"pyramid":["render.number",["compute.asPercent",{"lit":2},["transform.idiv",["sense.wordCount"],{"lit":4}]]],"mem":null},
{"id":"n-fcf06197","guard":[["hasAny",["gcf","greatest common divisor","greatest common factor","growth rate","hcf","highest common factor","ok","percent change","percent decrease","percent increase"]],["has","for"]],"pyramid":["render.number",["compute.gcd",{"lit":1000},["compute.percentChange",["sense.wordCount"],{"lit":1000}]]],"mem":null},
{"id":"n-fdb03a82","guard":[["hasAny",["as a percentage","lowest terms","ok","percent is","reduce the fraction","simplest form","simplify the fraction","what percent","what percentage"]],["has","for"]],"pyramid":["render.str",["compute.fraction",["compute.asPercent",["sense.wordCount"],{"lit":1}],{"lit":4}]],"mem":null},
{"id":"n-fde1a1b6","guard":[["hasAny",["as a percentage","continue","left over","mod","modulo","percent is","remainder","what percent","what percentage"]]],"pyramid":["render.number",["compute.asPercent",["transform.mod",{"lit":10},["sense.wordCount"]],{"lit":2}]],"mem":null},
{"id":"n-ff0e8608","guard":[["hasAny",["acceptable","at which position","binomial coefficient","combinations","index of","n choose k","position of","ways to choose"]]],"pyramid":["render.number",["compute.choose",["aggregate.indexOf",["sense.text"],["sense.lastWord"]],{"lit":2}]],"mem":null},
{"id":"n-ffe6f33a","guard":[["hasAny",["least common multiple","lowest common multiple","lowest terms","ok","reduce the fraction","simplest form","simplify the fraction"]],["has","for"]],"pyramid":["render.str",["compute.fraction",["compute.lcm",["sense.wordCount"],{"lit":100}],{"lit":1}]],"mem":null},
{"id":"n-08cef986","guard":[["has","ok"],["has","for"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for OK":"200"}}},
{"id":"n-0d582750","guard":[["hasAny",["moved","permanently"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Moved Permanently":"301"}}},
{"id":"n-113ad6d9","guard":[["hasAny",["gateway","timeout"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Gateway Time-out":"504"}}},
{"id":"n-11610b1e","guard":[["hasAny",["http","many","number","requests","status","too"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Too Many Requests":"429"}}},
{"id":"n-11f7f2f1","guard":[["hasAny",["information","nonauthoritative"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Non-Authoritative Information":"203"}}},
{"id":"n-1604db32","guard":[["has","locked"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Locked":"423"}}},
{"id":"n-1b8ca0c1","guard":[["hasAny",["range","satisfiable"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Range Not Satisfiable":"416"}}},
{"id":"n-2866225a","guard":[["has","teapot"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for I'm a teapot":"418"}}},
{"id":"n-30de08f8","guard":[["hasAny",["code","http","large","payload","status","too"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Payload Too Large":"413"}}},
{"id":"n-318147a2","guard":[["has","conflict"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Conflict":"409"}}},
{"id":"n-386880d1","guard":[["hasAny",["failed","precondition"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Precondition Failed":"412"}}},
{"id":"n-3c271156","guard":[["has","forbidden"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Forbidden":"403"}}},
{"id":"n-4370c568","guard":[["has","continue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Continue":"100"}}},
{"id":"n-492856c4","guard":[["hasAny",["other","see"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for See Other":"303"}}},
{"id":"n-4b73aac4","guard":[["has","multistatus"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Multi-Status":"207"}}},
{"id":"n-648df125","guard":[["has","upgrade"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Upgrade Required":"426"}}},
{"id":"n-6e44e891","guard":[["hasAny",["service","unavailable"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Service Unavailable":"503"}}},
{"id":"n-7167898c","guard":[["hasAny",["protocols","switching"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Switching Protocols":"101"}}},
{"id":"n-797d0634","guard":[["hasAny",["insufficient","storage"]],["has","for"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Insufficient Storage":"507"}}},
{"id":"n-7be687f4","guard":[["has","payment"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Payment Required":"402"}}},
{"id":"n-7c341feb","guard":[["has","unauthorized"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Unauthorized":"401"}}},
{"id":"n-82ae041f","guard":[["has","partial"],["has","for"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Partial Content":"206"}}},
{"id":"n-876d25c1","guard":[["has","found"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Not Found":"404"}}},
{"id":"n-9e4ddd4f","guard":[["hasAny",["also","http","negotiates","number","status","variant"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Variant Also Negotiates":"506"}}},
{"id":"n-a065ef9b","guard":[["hasAny",["expectation","failed"]],["has","for"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Expectation Failed":"417"}}},
{"id":"n-a893e7b5","guard":[["has","timeout"],["has","for"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Request Timeout":"408"}}},
{"id":"n-a95fb76e","guard":[["hasAny",["code","long","means","status","too","uri"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means URI Too Long":"414"}}},
{"id":"n-ac4b5f5b","guard":[["hasAny",["supported","version"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status HTTP Version Not Supported":"505"}}},
{"id":"n-acf191f6","guard":[["hasAny",["code","legal","means","reasons","status","unavailable"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Unavailable For Legal Reasons":"451"}}},
{"id":"n-af551ab7","guard":[["hasAny",["permanent","redirect"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Permanent Redirect":"308"}}},
{"id":"n-af6acbf1","guard":[["has","bad"],["has","for"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the HTTP status code for Bad Request":"400"}}},
{"id":"n-afb13857","guard":[["has","accepted"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the number of the HTTP status Accepted":"202"}}},
{"id":"n-b7d9e430","guard":[["hasAny",["entity","unprocessable"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Unprocessable Entity":"422"}}},
{"id":"n-b8fc5e7e","guard":[["has","processing"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Processing":"102"}}},
{"id":"n-c54076a2","guard":[["hasAny",["redirect","temporary"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Temporary Redirect":"307"}}},
{"id":"n-c5fec91c","guard":[["has","acceptable"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Not Acceptable":"406"}}},
{"id":"n-c960f3c0","guard":[["has","length"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means Length Required":"411"}}},
{"id":"n-cf5b23fe","guard":[["has","used"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which status code means IM Used":"226"}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"give the number of the HTTP status Conflict","expect":{"equals":"409","notRefusal":true}},{"q":"which status code means Moved Permanently","expect":{"equals":"301","notRefusal":true}},{"q":"what is the HTTP status code for Expectation Failed","expect":{"equals":"417","notRefusal":true}},{"q":"which status code means URI Too Long","expect":{"equals":"414","notRefusal":true}},{"q":"which status code means Processing","expect":{"equals":"102","notRefusal":true}},{"q":"which status code means Proxy Authentication Required","expect":{"equals":"407","notRefusal":true}},{"q":"what is the HTTP status code for No Content","expect":{"equals":"204","notRefusal":true}},{"q":"which status code means Unprocessable Entity","expect":{"equals":"422","notRefusal":true}},{"q":"which status code means Payment Required","expect":{"equals":"402","notRefusal":true}},{"q":"what is the HTTP status code for Permanent Redirect","expect":{"equals":"308","notRefusal":true}},{"q":"which status code means Gateway Time-out","expect":{"equals":"504","notRefusal":true}},{"q":"which status code means IM Used","expect":{"equals":"226","notRefusal":true}},{"q":"which status code means Unavailable For Legal Reasons","expect":{"equals":"451","notRefusal":true}},{"q":"give the number of the HTTP status Range Not Satisfiable","expect":{"equals":"416","notRefusal":true}},{"q":"what is the HTTP status code for Locked","expect":{"equals":"423","notRefusal":true}},{"q":"what is the HTTP status code for See Other","expect":{"equals":"303","notRefusal":true}},{"q":"give the number of the HTTP status Created","expect":{"equals":"201","notRefusal":true}},{"q":"give the number of the HTTP status Unsupported Media Type","expect":{"equals":"415","notRefusal":true}},{"q":"give the number of the HTTP status Service Unavailable","expect":{"equals":"503","notRefusal":true}},{"q":"what is the HTTP status code for Insufficient Storage","expect":{"equals":"507","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
