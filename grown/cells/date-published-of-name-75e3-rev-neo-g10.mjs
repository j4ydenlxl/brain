// date-published-of-name-75e3-rev-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"date-published-of-name-75e3-rev-neo-g10","class":"date-published-of-name-75e3-rev","generation":10,"lane":"neo","grownFrom":["name the name whose date published is 2022-10-12","name the name whose date published is 2023-04-26","name the name whose date published is 2025-03-04","which name has the date published 2022-06-10","2022-10-29 is the date published of which name","name the name whose date published is 2023-09-14","2013-06-20 is the date published of which name","which name has the date published 2022-11-23","which name has the date published 2019-05-29","2024-04-06 is the date published of which name","2018-08-31 is the date published of which name","2024-12-09 is the date published of which name","name the name whose date published is 2024-07-18","2017-12-21 is the date published of which name","which name has the date published 2023-01-19","2025-07-26 is the date published of which name","which name has the date published 2020-06-16","which name has the date published 2023-01-26","name the name whose date published is 2024-09-28","2023-04-11 is the date published of which name"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-cuisines-ce1912","columns":["name","date published"],"n":2218,"cols":[{"s":"Saganaki (Flaming Greek Cheese)|Coney Island Knishes|Diana's Hawaiian Bread Rolls|Chilean Pebre|Tex-Mex Sheet Cake|Newfoundland Jigg's Dinner|Pasta e Ceci (Italian Chickpea and Pasta Stew)|Danish Butter Cookies|Lemon Poppy Seed Amish Friendship Bread|Pan con Tomate (Spanish Tomato Bread)|Traci's Adobo Seasoning|Brazilian Quentao|Lomo de Res, Cuban-Style Rib-Eye Steaks|Chef John's Nashville Hot Chicken|Moo Shu Pork|Eggnog Bread Pudding with Coquito Sauce|Chicken with Black Beans|Bistec Encebollado (Cuban Steak and Onions)|Swedish Hard Tack|Israeli Charoset|Spicy Potato Noodles (Bataka Sev)|Double Chocolate Biscotti with Cherries|Pebre|Pique (Puerto Rican Hot Sauce)|Grandma's Authentic Swedish Meatballs|Finnish Turnip Casserole|Chicharrones de Pollo|Carrot Halwa|Australian Federation Biscuits|Ono Butter Mochi|Galaktoboureko|Real Homemade Bagels|Easy Blini (Russian Pancake)|Traditional Swedish Pancakes|Authentic Chinese Egg Rolls (from a Chinese person)|Colombian Ají|Toum|Virgin Strawberry Daiquiri|Panettone|Pollo Saltado (Peruvian-Style Chicken Stir-Fry)|Citrus Ceviche|Ajiaco (Beef and Pepper Stew)|Canelés de Bordeaux|Sausage and Sauerkraut|Chicken Ropa Vieja|Brazilian Whole Banana Pie|Chilean Empanada|Chinese Chicken Wings|Copycat Panda Express Chow Mein|Classic Chicken Cordon Bleu|Halloumi Cheese Fingers|Easy and Quick Halushki|Easy Gazpacho|Rose Water Turkish Delight|Horchata de Arroz (Rice Drink)|Cha Gio Vietnamese Egg Rolls|Cretons|Zucchini Scarpaccia|Slow Cooker Mojo Pork|Brazilian Cheese Rolls (Pão de Queijo)|Pastry Cream|Andouille and Poblano Quesadillas|Mom's Authentic Kosher Cholent Recipe|Down-South Style Green Beans|Saltado de Vainitas (Peruvian Green Beans with Chicken)|Alfajores Argentinean Style|Loaded Beef Nachos|Thai Pineapple Chicken Curry|Tortilla de Patatas|Yabluchnyk (Ukrainian Apple Cake)|Chicken Shawarma|Branzino Mediterranean|Coxinhas (Brazilian Chicken Croquettes)|Argentinian-Style Ribs|Durian Puree Cheesecake|Grandma's Polish Perogies|Seafood Paella|Brazilian Passion Fruit Mousse (Maracuja)|Brazilian White Rice|Cajun Shrimp and Sausage Pasta Bake|Best Hawaiian Banana Nut Bread|Lyonnaise Potatoes|Kibby (Kibby-Bel-Saneeya)|Chinese Steamed Buns|Gheymeh (Persian Beef Stew)|Beef Samosas|Israeli Tomato and Cucumber Salad|Elk Steak Marinade|Turkey Kofta Kebabs|Racuchy z Jablkami (Polish Apple Pancakes)|Haldi Ka Doodh (Hot Turmeric Milk)|Finnish Pancakes|Spicy Thai Basil Chicken (Pad Krapow Gai)|Spicy Indian Green Beans, Gujarati Style|Lebanese Zaatar (Za'atar) Bread|Cioccolata Calda (Hot Chocolate Italian-Style)|Pastel de Choclo|Yummy Matzo Rolls|Tex-Mex Burger with Cajun Mayo|Shrimp and Cheesy Grits with Bacon|Lobster Thermidor|Fricase de Pollo|Lolah's Chicken Adobo|Rich and Simple French Onion Soup|Pastel de Papas (Chilean Potato Pie)|Stewed Okra with Tomatoes|Jewish Coffee Cake|Baked Sweet And Sour Chicken|Jay's Jerk Chicken|Chicken Adobo Tacos|Jamaican Beef Patties|Faworki (Polish Chrusciki)|Cherry Tomato Pasta Sauce|Sauerkraut Russian-Style|Meze Fava Beans|Finnish Pannu Kakku|Bread Machine Challah I|Sopa de Mariscos (Seafood Soup)|Vegan Sweet Potato Chickpea Curry|Polish Gołąbki (Stuffed Cabbage Rolls)|Mexican Lasagna Lite|The Best Pavlova|Greek-Style Grilled Lamb Chops|No Ordinary Meatloaf|Duck a l'Orange|Chicken Souvlaki with Tzatziki Sauce|Nova Scotian Hodge Podge|Authentic Thai Green Curry|Cajun Chicken and Sausage Gumbo|Finnish-American Flatbread|Chimichurri Sauce|Curried Israeli Couscous|Pork Dumplings|Yum Yum Sauce|Easy Russian Mushroom Bake|Polish Cherry Cake|Black-Eyed Pea Soup|Traditional Russian Pirozhki|Indian Saffron Rice|Poulet au Vinaigre (Chicken with Vinegar)|Pain au Chocolat (Chocolate Croissants)|Tuscan Butter Shrimp|Challah Bread|Tandoori Chicken|Vietnamese Egg Coffee|Arroz con Pollo (Peruvian Style)|Amish Chocolate Cake|Real French Crêpes|My Amish Friend's Caramel Corn|Chilean Dobladitas|Cuban Beans and Rice|Grilled Cajun Corn|Easter White Borscht|Mie Goreng - Indonesian Fried Noodles|Basic Crêpes|Polvorones from Puerto Rico|Crispy Southern Fried Chicken|Cajun-Style Blackened Snapper|Simple Spanish Rice|Mum's Swedish Meatballs|Puerto Rican Breakfast Custard|Jan Hagel Cookies|Japanese-Style Cabbage Salad|Feijoada (Brazilian Black Bean Stew)|Easy Sheet Pan Beef Bulgogi|Polish Cabbage Roll Soup|Carrots and Lentils|Cheesy Amish Breakfast Casserole|Cassava Cake|Za'atar Bread|Loaded Potato Focaccia|Chocolate Yule Log|Southern Fried Apples|Tava or Turkish Stew|Simple and Creamy Spanish Flan|Sofrito|Meat Pie|Chocolate Chip Belgian Waffles|Neck Bones and Lima Beans|Spanish Gin and Tonic (Gin Tonica)|Sizzling Sherry Shrimp with Garlic|Quesitos (Puerto Rican Cheese-Stuffed Puff Pastry)|Japchae|Chana Masala (Indian Chickpea Curry)|Jajangmyeon (Vegetarian Korean Black Bean Noodles)|Easy Two-Ingredient Naan|Chicharrones de Pollo|Easy-Made German Quark|Strudel Dough|Easy Swedish Apple Pie|Greek Potato Salad|Hawaiian Chicken Pineapple Kabobs|Maamoul (Lebanese Date Cookies)|Thai Iced Coffee|Pakistani Ground Beef Curry|Austrian Linzer Torte|Brazo Gitano de Guayaba (Jelly Roll with Guava)|Tortilla Española (Spanish Tortilla)|Calabacita con Puerco (Pork with Squash)|Apple Crisp Cups|Oven-Baked Kofta Kebabs (Pakistani-Style)|Homemade Sushi|Korean Spicy Chicken Rice Noodle Bake|Calimocho (Kalimotxo)|Authentic Fire-Roasted Tex-Mex Salsa|Swedish Toscas (Swedish Almond Tarts)|Jamaican Cabbage|Chicken Limone|Maple Walnut Ice Cream|Chicken Tikka Masala|Swedish Chocolate Balls (or Coconut Balls)|Slow Cooker Kielbasa and Beer|Coffee Jelly|Blini - Russian Pancakes|Creole Chitterlings (Chitlins)|One Pot Chicken Pomodoro|Dumplings and Cocky's Joy (Caramel Sauce)|Air Fryer Grilled Pimento Cheese|Cinnamon Noodle Kugel|Instant Pot Haluski with Kielbasa|The Cheesecake Factory Thai Chicken Lettuce Wraps|Authentic Polish Pickle Soup (Zupa Orgorkowa)|Pumpkin Soufflé Casserole|Beef Miso Ramen|Portuguese Pork Alentejana|Roast Peruvian Turkey|Chef John's Beef Rendang|Ginger Malva Pudding|Crispy Vegetable Pakoras|Samoan Panikeke|Rustic Chicken and Dumplin's|Roscoe's Chicken Adobo|Southern Coleslaw|Norwegian Almond Cake|Choux Pastry|Miso and Soy Chilean Sea Bass|Texas Sheet Cake|Puerto Rican Beef Stew|Stir-Fried Mushrooms with Baby Corn|Easy Chicken Curry|Real NY Jewish Rye Bread|Veggie Lo Mein|Sherry Chicken Curry|Homemade Sazon Seasoning|Beet, Walnut and Prune Salad|Portuguese Bean Soup II Recipe|Tex-Mex Beef and Cheese Enchiladas|Ekmek Turkish Bread|Greek-Style Garlic Chicken Breasts|Tex Mex Stir Fry|Shrimp Egg Foo Young|Quick 2-Ingredient Nutella Hotteok (Korean Sweet Pancakes)|Coconut Coconut Milk Cake|Pure Maple Candy|Arvidson Swedish Pancakes|Bananas Foster|Turkish Red Lentil Soup with Mint|Indian Saag|ANZAC Biscuits with Almonds|Crispy Shrimp Tempura|Chef John’s Chicken Saltimbocca|Jalapeño Cornbread Muffins|Lebanese Fatayer|Fresh Southern Peach Cobbler|Babka|Beef Stroganoff|Slow Cooker Asian Zing Chicken Noodles|Korean Doenjang-Jjigae (Soybean Paste Soup)|Spicy Bean Salsa|The Original Donair From the East Coast of Canada|Szechwan Shrimp|Matar Pulao (Rice with Peas)|Moo Goo Gai Pan|Refreshing Brazilian Lemonade|Authentic New Orleans Red Beans and Rice|Menemen|Creamy Cajun Potato Soup|Down Home Chitterlings|Pollo a la Brasa (Peruvian Grilled Chicken)|Kate's Easy German Sauerbraten|Abade Prisco's Pudding|Pork and Black Bean Stew|Remoulade Sauce à la New Orleans|Korean-Style Cucumber Salad|Lingonberry Jam|Sop Buntut (Indonesian Oxtail Soup)|Quark (Homemade Cheese)|Ginger Chicken|Empanadas Salteñas|Empanada Dough|Vinagrete (Brazilian Tomato Slaw)|Oktoberfest Chicken and Red Cabbage|Mojitos by the Pitcher|Perfect Pot Stickers|Wiener Schnitzel|Turkish Red Lentil 'Bride' Soup|Chinese Pepper Steak|Grillhaxe (Grilled Eisbein, Pork Shanks)|Thai Hot and Sour Soup|Amish Buttered Egg Noodles|Brigadeiro Chocolate Delights|Mamon (Sponge Cakes)|Authentic Miso Soup|Sautéed Mushrooms (Quick and Simple)|Kielbasa|Sabzi Polo|Portuguese Custard Tarts (Pasteis de Nata)|Sour Cream Banana Cake|Homemade Sauerkraut|Swedish Cream Cheese Crepes|Creole Pot Pies|Sweet and Sour Red Cabbage|Yummy Korean-Style Glass Noodles (Japchae)|Baked Oatmeal|Brazilian Lemonade|Coconut Sauce|Lemon Tiramisu|Canadian Sharp Cheddar Cheese Spread|Cuban-Style Mojo Shrimp|Kongnamool (Korean Soybean Sprouts)|Pressure Cooker Red Beans and Sausage|Sweet Potato Tempura|Easy Haupia|Norwegian Butter Sauce (Sandefjordsmor)|Pad Thai|Polish Potato Soup|Bacalao a la Vizcaina (Basque-Style Codfish Stew)|Vietnamese Lemongrass Beef and Noodles|Thai Carrot Salad|Authentic Thai Coconut Soup|Pakistani Lamb Chops|Yellow Pickled Eggs|Satay Sauce|Ropa Vieja (Cuban Beef)|Lamingtons|Coconut (Haupia) and Chocolate Pie|Mom's Potato Latkes|Authentic Pad Thai Noodles|Australian-Style Pumpkin Scones|Kalbi (Korean BBQ Short Ribs)|Brown Sugar Pie I|Joy's Green Banana Salad|Easy Hoppin' John|Vegan Turkish Red Lentil Soup|California Roll|Bjarne's Norwegian Meatballs|Atsara (Papaya Relish)|Spanakopita (Greek Spinach Pie)|Copycat Wingstop Cajun Corn|Golden Butter Rice|Chard Lentil Soup, Lebanese-Style|Southern Grilled BBQ Ribs|Apple Matzo Kugel|Jag (Portuguese Rice and Beans)|Anzac Biscuits (Australian Coconut-Oat Cookies)|Vietnamese Fresh Spring Rolls|Hawaii Five-O So Good Ice Cream|Quindim|Thai Fried Rice with Pineapple and Chicken|General Tao Chicken|Chicken Pho|Favorite Fry Bread Tacos|Spicy Tuna Rolls|Gluten-Free Sandwich Cookies with Dulce de Leche (Alfajores)|Filipino Steamed Rice, Cebu Style|Swedish Apple Cake|Homemade Phyllo (or Filo) Dough|Freddo Cappuccino|Hoppin' John|Green Onion Garlic Naan Bread|Bobotie (South African Beef Casserole)|Ham and Egg Noodles (Schinkennudeln)|Sweet and Sour Cabbage Soup|Passover Charoset|Norwegian Lefse|Tourtière (French Canadian Meat Pie)|Shadi's Soup-e Mahicheh|Classic Chicken Pad Thai|Shirazi Salad|Linzer Torte Cookies|Lemon Garlic Butter Chicken Spiedini|Lentil and Green Collard Soup|Southern-Style Buttermilk Fried Chicken|Russian Honey Cake|Fairy Bread|Perfect Fried Green Tomatoes|Polish Chicken and Dumplings|Instant Pot Vegan Tex-Mex Bowls|Pandan Chiffon Cake|Japanese-Style Deep-Fried Shrimp|Kulich (Russian Easter Cake)|Crispy Orange Beef|Chef John's Baklava|Havregrynskugler (Danish Oat Balls)|Kesme Helva|Banh Xeo (Vietnamese Shrimp Pancakes)|Creamy Manjar (Dulce de Leche)|Roscones|Apple Danish Bars|Middle Eastern-Style Dolma (Stuffed Vegetables)|Turkish Stuffed Flatbread (Gozleme)|Finnish Oven Pancakes|South African-Inspired Butternut Soup|Brazilian Style Chocolate Pudding|Rice Cooker Spanish Rice|Lebanese Fattoush|Brazilian Collards|Jerk Chicken Pizza|Korean Tofu and Vegetable Soup|Lazy Pierogi|Red Salad|Sizzling Steak Fajitas|Flavorful Southern Fried Chicken|Mark's Surprise Meatloaf|Mediterranean Bean Salad|My Classic Puerto Rican Carne Guisada|Norwegian Cabbage Rolls|Mango Ceviche|Lebanese 7 Spices|One-Pot Lebanese Chicken and Rice|Empanadas Fritas de Queso|Aji de Gallina|Authentic Bangladeshi Beef Curry|Beefs Portuguese Style|Chourico Stew|Curry Pasta - Pakistani Style|Dutch Croquetten|Feijoada|Homemade Muesli|Machhere Jhol (Bengali Fish Curry)|Pakistani Batter-Fried Potatoes|Prawn Malai Curry|Savory Saffron Chicken Polow|Thai-Style Fragrant Rice|Whole Rice and Lentils (Majadara)|Meat Pie with Hot Water Crust|Spanish Rice and Shrimp|Tex-Mex Beef Bowl with Avocado Cilantro Dressing|Tex-Mex Grilled Flank Steak|Puerto Rican Rice and Beans (Arroz con Gandules)|Grilled Pollo a la Brasa|Lebanese Chicken Shawarma|A Drama Queen's Pavlova|Chicken Singapore Noodles|Authentic Swedish Meatballs|Air Fryer Turkey Fajitas|Portuguese Braised Chicken|Amish Potato Soup|Bill's Peruvian Chicken and Rice|Russian Garden Salad|Speculaas Cookies or Spicy Sinterklass Cakes|Anzac Biscuits III|Cuban Banana Casserole|Easy Brazilian Spiced Salmon|Malaysian Chicken Satay|Tanya's Jamaican Spice Bread|Vietnamese Pork and Five Spice|Zimbabwean Chicken and Vegetable Soup|Argentine Corn Pie|Spicy Sambal Shrimp|Tea Party Sandwiches (Puerto Rican Version)|Toum (Lebanese Garlic Spread)|Hawaiian Coconut-Banana Bread|Turkish Pogaça|Instant Pot® Pho|Cuban Pork|Creamy Israeli-Style Hummus|Aebleskiver (Danish Pancakes)|Apples in Pajamas|Brazilian Peanut Fudge|Brazilian-Style Moist Coconut Cake|Caipirinha Cocktail|Colombian Ahuyama Soup|Corn and Roasted Red Pepper Salad|Cottage Cheese Blintzes|Danish Ebelskiver|Danish Peppernut Christmas Cookies (Pebernodder)|Dilled Shrimp (Rejer)|Dutch Boterkoek|Fastelavnsboller (Fastelavn Buns)|Fattigmann|Frozen Lemon Pavlova|Gera's Amish Funny Cake|Hawaiian Chocolate Macadamia Nut Tart|Healthier Amish Friendship Bread Starter|Holland Boterkoek|Italian Capezzoli di Venere (Chocolate Truffles of Venus)|Jiddo's Fatayer Sabanegh (Spinach Triangles)|Khoresht Fesenjaan (Chicken with Pomegranate Sauce)|Kringla II|Leche Asada|Lisa's Jerk Chicken|Malasadas Dois|Maui Banana Cream Tube Cake|Namoora (Basboosa)|Norwegian Pfeffernerse|Orange Cardamom Krumkake|Pan De Sal I|Pogaca (Feta Dumplings)|Pomegranate Stew with Chicken (Khoresh Fesenjan)|Quick Banana Nut Cake|Russian Syrniki|Schnitzel|Siopao (Filipino Steamed Dumplings)|South African Brown Pudding|Stroopwaffels II|Sugared Danish Butter Cookies with Pecan Halves|Swedish Cream with Summer Berries|Swedish Ground Almond Spritz Cookies|Swedish Klimp|Sweet Creme de Vie|Sweet Plantain Pie|Tahini Butter Cookies|Amish Brown Sugar Cake|Amish Chocolate Pudding|Amish Cran-Apple Pie|Brazilian Broa (Corn Bread)|Brazilian Chicken Stew (Galinha Ensopada)|Brazilian Sweet Banana and Rice Dish|Danish Rugbrod (Rye Bread) for the Bread Machine|Easy Turkish Delight|Feijoada Nordestino (Northeastern Brazilian Black Bean Stew)|Haupia and Purple Sweet Potato Pie|Hawaiian Cookie Tarts|Instant Pot® Jamaican Chicken Curry|Kookoo Sabzi (Fresh Herb Frittata)|Kropsua (Finnish Pancake)|Malaysian Chicken Curry|Margareta's Cardamom Cake|Peruvian Alfajores with Manjar Blanco|Red Pepper and Cabbage Pickle|Rose Water Gelees|Rose Water White Coffee|Russian Poppy Seed Roll|Sharlotka|Simple Swedish Pancakes|South African Bobotie|Swedish Pancakes (Vegan)|Taro Rolls|Tembleque|Vegetarian Banh Mi Bowls|Victor's Non-Dairy Hawaiian Coconut Mochi Cake|Vietnamese Coconut-Caramel Shrimp (Tom Rim)|Wheat Flour Halva|Easy Tex-Mex Chicken Tacos|Cuban Mini Melts|Quince Empanadas|Grandma's Aebleskevers|Vietnamese Lemongrass Meatballs|Amish Buttermilk Biscuits|Broa (Portuguese Cornbread)|Amish Country Casserole|Amish Buttermilk Pie|Easy Cuban Salad|Rabbit Fricassee Cuban-Style|Vegan Puerto Rican Empanadas|Korean Kimchi|Lancaster Lefsa (Old World Recipe)|Paella|Coconut Chikki|Flavorful Persian Braised Lamb Shanks|Russian Carrot Salad (Korean-Style)|Poffertjes (Dutch Mini Pancakes)|Hachee (Dutch Beef Stew)|Lamb Shawarma|Portuguese Coconut Cakes (Bolos de Coco)|Quick Vegetarian Picadillo Empanadas|Mitzie's Beef Stroganoff|Hychin|Brazilian Carrot Cake|Manti (Turkish 'Ravioli' with Yogurt Sauce)|Gulab Jamun or Kala Jam (Waffle Balls)|Chef John's Potato and Cheese Pierogi|Porotos Granados (Chilean Bean Stew)|Haydari (Turkish Yogurt Dip)|Kabab Barg|Thai Dipping Sauce for Spring Rolls (Nam Jim Po Piah)|Anise Sugar Cookies|Banh Mi Burgers|Brazilian-Style Carrot Cake with Chocolate Sauce|Bulgogi (Korean Barbecued Beef)|Easy Chimichurri Sauce|Garlic Prawns|Mamita's Mojito Scallop Kabobs with Stuffed Tomatoes|Manaaeesh Flatbread|Prawn Nasi Goreng|Sushi Party|Swedish Meatballs (From a Swede!)|The Best Thai Curry-Peanut Sauce|Vietnamese Golden Chicken Wings|Authentic Seafood Paella|Easy Chili Cavatappi|Japanese-Style Sesame Green Beans|Quick and Easy Kimchi Salad|Swiss Almond Carrot Cake (Aargauer Rueblitorte)|Tut (Persian Marzipan)|Vietnamese Stir-Fry|Amish Baked Oatmeal|Aranitas (Shredded Green Plantain Patties)|Aunt Gun-Marie's Waffles|Baked Swedish Rice Pudding|Baked Taco Dip|Bierock Casserole|Brazilian Bom-Bocado (Egg Custard)|Brazilian Collard Greens (Couve a Mineira)|Brazilian Crispy Cheese Bread|Chap Chee Noodles|Danish Oatmeal Cookies|Easy Pina Colada French Toast|Easy Polish Noodles|Fast and Easy Israeli Tahini Cookies|Finnish Blueberry Pie|Keufels (Original)|Kibbee Lebanese Style|Kimberly's Curried Deviled Eggs|Korean Spicy Chicken and Potato (Tak Toritang)|Mexican Black Bean and Turkey Wraps|My Chicken Pho Recipe|Norwegian Sour Cream and Raisin Pie|Pan de Queso (Brazilian Cheese Buns)|Pani PoPo|Pao de Queijo (Brazilian Cheese Bread)|Persian Rice with Potato Tahdig|Polvarones|Shakshuka (Middle Eastern Breakfast Dish)|Strassburgare|Tex-Mex Air Fryer Hash Browns|Vietnamese Eggplant with Spicy Sauce|Vietnamese Lemongrass Chicken Curry|Amish Hash Browns|Baked Falafel|Cajun Shrimp|Easy Mango Salad|Chilean Alfajores|Chimichurri Muy Pefecto|Argentinian Steak with Red Chimichurri|Swedish Cream|Anise Waffle Cookies|Dragon Fruit Shake|Coquito de Puerto Rico|Pineapple Mango Daiquiri|Swedish Glogg|Cherry Amish Friendship Bread Cupcakes with Buttercream Frosting|Scandinavian Sweetheart Waffles|Korean Hot Wings|Mojito Perfecto|Baked Chicken In a Sweet BBQ Sauce|Nuoc Cham (Vietnamese Spicy Dipping Sauce)|Malaysian Flatbread (Roti Canai) with Curried Lentil Dip|Kroppkakor - Swedish Potato Dumplings|Irmik Helvasi (Turkish Semolina Halva)|Foolproof Potato Latkes|German Schwenkbraten|Indonesian Chicken Skewers with Peanut Sauce (Satay Ayam)|Pakistani Chicken Karahi|Eclairs|German Pork Chops and Sauerkraut|Amish Sugar Cakes|Amish Yumazuti|Andouille Sausage|Apple and Honey Sorbet|Australian English Trifle|Austrian Peach Cookies II|Baked Chicken Reuben|Basque Cake|BaumKuchen|Beef Stroganoff with Noodles|Best Apple Crumble|Botercake (Butter Cake)|Brazilian Banana Bread|Bulgogi (Korean BBQ)|Chicken Jalfrezi|Chocolate Black Tea Cake|Chocolate Pavlova|Cornish Finnish Michigan Pasties|Crawfish Fettuccine I|Crunchies|Danish Cabbage|Easy Chinese Corn Soup|Empanadas|Erin's Indonesian Chicken|Fabada|Finnish Kropser (Baked Pancakes)|Fish Sinigang (Tilapia) - Filipino Sour Broth Dish|German Rocks|Glogi|Gravlox|Grilled Jerk Pork Tenderloin|Ground Cherry Pie II|Hawaiian Banana Nut Bread|Hawaiian Tarts|Herman Sourdough Starter|Holland Butter Cookies|Hummingbird|Jamaican Jerked Chicken|Kalbi (Marinated Beef Short Ribs)|Kentucky Biscuits|Kraut Bierocks|Krumkake II|Kruschicki|Lefse II|Lubia Polo (Green Bean Rice)|Malasadas|Mansaka|Milk Flitcher Pie|Moist Herman Coffee Cake|Monster Sour Cream Enchiladas|Nada's Baba Cake|Norwegian Christmas Cabbage|Okra Gumbo|Pakistani Lentil Curry|Pavlova Deluxe|Pineapple Upside-Down Cake II|Polish Meat and Potatoes|Polish Reuben Casserole|Portuguese Pork and Clams|Portuguese Sweet Bread I|Portuguese Sweet Bread II|Portuguese Sweet Bread III|Pumpkin Kaya|Real Homemade Bologna|Scandinavian Almond Bars|Seven Layer Tex Mex Dip|Sinigang na Baka|Swedish Meatballs I|Swedish Nut Bars|Swedish Saffron Buns|Taco Bake I|Tex Mex Meatloaf|Tex Mex Potato Soup|Tex-Mex Tuna Salad|Thai Chicken Curry in Coconut Milk|Thai Noodles|Toaster Biscuits|Tomato Salsa without Onions|Vanille Kipferl II|Viennese Crescent Holiday Cookies|Vietnamese Beef And Lettuce Curry|Waterzooi (Vaterzoy)|We Be Jammin' Jamaican Banana Bread|Tembleque Puerto Rican Coconut Pudding|Chef John's Hummingbird Cake|Chicken Massaman Curry|Chicken Saag|Tandoori Masala Spice Mix|Soul Smothered Chicken|Amish Custard Cottage Cheese Pie|Bee Sting Cake (Bienenstich)|Bengali Chicken Curry with Potatoes|Chicken Kiev|Easy Portuguese Cookies|Hasty Pudding|Portuguese Burnt Sugar Candy|Portuguese Muffins - Bolo Levedo|Portuguese Sweet Rice|Swedish Apple Pie|Tom Ka Gai (Coconut Chicken Soup)|Apple Strudel II|Cuban Black Beans II|Deep-Fried Turkey Marinade|Easy New Zealand Squares|Easy Swedish Pancakes|Hard Do Bread|Hawaiian Bread I|Kringla|Mexican Style Dip|Mild Coconut Tofu Curry|Nut Filling for Kolacky Cookies|Orange Drop Cookies II|Portuguese Chourico and Peppers|Portuguese Cod Fish Casserole|Pumpkin Custard Pie I|Queijadas|Runaway Bay Jamaican Chicken|Spicy Red Bean Soup|Stroopwaffels I|Asopao de Pollo|Russian Black Bread|Rabo Encendido (Cuban Oxtail Stew)|Yakisoba Chicken|Apple Cinnamon Oatmeal Muffins|Vegetarian Pho (Vietnamese Noodle Soup)|Cathead Biscuits|Apricot Anzac Biscuits|Ayam Penyet Pedas (Indonesian Spicy Penyet Chicken)|Bolo Facil de Fuba Cremoso (Easy Creamy Cornmeal Cake)|Bolo de Fuba Cremoso (Creamy Cornmeal Cake)|Brigadeiro Dessert|Crispy Ginger Biscuits|Dutch Apple Cake|Easy Three-Ingredient Gluten-Free German Christmas Coconut Cookies|Easy and Delicious Homemade Ricotta Cheese|Espetinho de Queijo Coalho Com Abacaxi (Brazilian Grilled Cheese with Pineapple)|German Marble Cake|Hawaiian Cake|Homemade Za'atar|Honeycomb with Golden Syrup|Horseradish Beets (Chrin)|Mahalabia (Lebanese Cardamom Pudding)|My Mango Lassi|Nanaimo Bars I|Quick Blender Carrot Cake|Raisin Butter Tarts|Rosenmunnar|Russian Cabbage and Beet Salad|Russian Sour Cream Cake|Simple Malaysian Fried Chicken|Sinigang na Bangus (Filipino Milkfish in Tamarind Broth)|Spiced Orange Cranberry Sauce|Stroopwafels with Treacle|Stuffed Turkey Legs|Tyrolean Nut Cake (Tiroler Nusskuchen)|Vatrushka|Viennese Chocolate-Nut Cake|Blackened Tuna|Amish Macaroni Salad|Blintz Souffle II|Spicy Tuna Sushi Roll|Authentic Patatas Bravas|Biko|Easy Creole Okra and Shrimp|Korean Spicy Marinated Pork (Dae Ji Bool Gogi)|Oyakodon (Japanese Chicken and Egg Rice Bowl)|Indian Spiced Onions|Portuguese Chourico Stew|Big Ray's White Bean, Kale, and Kielbasa Soup|German Wurst Salad|Spicy Tex-Mex Salad|Instant Pot Thai Chicken Soup|Cold Russian Borscht|Peanut Butter Noodles|Ube-Macapuno Cake|Indonesian Spiced Rice|Thai Red Chicken Curry|Borscht with Meat|Caipirinha|Panang Curry with Tofu and Vegetables|Pickled Daikon Radish and Carrot|The Perfect Simplified Sushi Vinegar|Australian Damper|Canary Island Red Mojo Sauce|Opor Ayam (Chicken in Coconut Milk)|Vietnamese Style Vegetarian Curry Soup|Peruvian Chicha Morada Drink|Arroz Tapado (Rice-On-Top)|Brazilian Coffee Cookies|Dad's New Zealand Mince Stew|Sausage and Pepper Penne|Swedish Christmas Glogg|Mom's Buttermilk Pancakes|Irresistible Whole Wheat Challah|Mild Cheesy Chicken Enchiladas|Portuguese Custard Tarts - Pasteis de Nata|Lebanese Seven Spices|Gluehwein (German Mulled Wine)|Swedish Limpa Rye Bread|Dave Matthews|Flapper Pie|Slow Cooker Pernil Pork|Vietnamese Coffee|Isa's Cola de Mono|Thai Monkfish Curry|Filipino Corned Beef and Cabbage|The Rebbetzin Chef's Persian Walnut Cookies|Sambal Sauce|Mom's Portuguese Beef Stew|Pisco Sour|Miraculous Canadian Sugar Pie|Date Loaf Cake|Alfajores (Dulce de Leche Sandwich Cookies)|Nuoc Cham Sauce|Chilled Russian Salad Dressing|The Amazing Swedish Meatball|Kransekake (Norwegian Almond Ring Cake)|Vietnamese Spring Rolls With Dipping Sauce|Cheese Bourekas|Pasanday (Pakistani Beef Pot Roast)|Indian-Style Seekh Kebab|Punjabi Chicken in Thick Gravy|French Canadian Tourtière|Okra Patties|My Own Famous Stuffed Grape Leaves|Portuguese Soup|Buchi|Julekake|Kima (Ground Beef and Peas)|Microwave Mochi|Havana Slow Cooker Pork Tenderloin|Old-Time Kentucky Bacon Milk Gravy for Biscuits|Perfect Baked Jerk Chicken|Spicy Szechuan Green Beans|Kecap Manis (Sweet Soy Sauce)|Papa a la Huancaína (Huancayo-Style Potatoes)|Buffalo Shrimp|Cajun Chicken|Donair|Pork Lo Mein|Thai Chicken Spring Rolls|Garlic Chicken Fried Chicken|Grilled Chicken Adobo|Polish Noodles (Cottage Cheese and Noodles)|Asian Garlic Beef Cubes (Vietnamese Bo Luc Lac or Shaking Beef)|Authentic Filipino Pancit|Chrusciki|Quick Whole Wheat Chapati|Greek Butter Cookies|Budin (Puerto Rican Bread Pudding)|Authentic Pad Thai|Finnish-Style Mojakka|Patron Mojito|Chickpeas and Chorizo|Finnish Nissua|Sacher Torte|Authentic Chicken Tikka Masala|Sangria by the Pros|Lumpia (Shanghai Version)|Amish Friendship Banana Nut Bread|Brazilian Black Bean Stew|Caramel-Coated Catfish|Thai Red Curry Chicken Soup|Brazilian-Style Beef Ribs|Maria's Paella|Arroz con Leche|Cucumber Gyro Sauce|Easy Enchilada Casserole|Homemade Lox|Shrimp with Lobster Sauce|Instant Pot® Puerto Rican Arroz con Pollo|Plum Butter|Authentic Empanada Pastry Dough|Moo Shu Chicken|Pfeffernusse|Rose Pavlova Cakes|Rosemary Steak|Suspiro Limeño|Portuguese Steamed Clams|Pisang Goreng (Indonesian Banana Fritters)|Gochujang Fried Rice|Boterkoek (Dutch Butter Cake)|Mom's Kimchi Egg|Red Currant Pie|Lebanese White Coffee|Swedish Pickled Cucumbers|Old German Honey Cookies|Wet-Bottom Shoofly Pie|Potato Klubb (Norwegian Potato Dumplings)|Bengali Dhal|Mandelmakronen (Almond Meringues)|Hawaiian Millionaire Pie|Persian Cucumber Yogurt (Maast-o Khiar)|Goat Stew|Beef Bulgogi|Norwegian Potato Klub|Instant Pot Galbi (Korean-Style Short Ribs)|Amish Bread|Crispy Roasted Chicken|Mexican Layered Dip|Puerto Rican Arroz con Pollo|Filipino Avocado Milkshake|Easy Swedish Meatball Sauce|Torsk (Scandinavian Cod)|Best Bobotie|Chef John's Pão de Queijo (Brazilian Cheese Bread)|Chinese Chicken Fried Rice|Panang Curry with Chicken|Southern-Style Neck Bones|Mayonnaise Biscuits|Classic Beef Stroganoff in a Slow Cooker|Pebber Nodder (Danish Christmas Cookies)|Brazilian Grilled Pineapple|Air Fryer Pão de Queijo|Beef Empanadas|Creamy Cajun Chicken Pasta|Easy Mochi|Instant Pot Jamaican Rice and Beans|Instant Pot Lebanese Lentil and Chard Soup|Pâte Sucrée|Yellow Rice with Vegetables|Turkish Chicken Kebabs|Chicken Makhani (Indian Butter Chicken)|Air-Fried Korean Chicken Wings|Abuela's Picadillo|Chocolate Hamantaschen|Lefse|Alfajor Cake|Amish White Bread|Cuban Ropa Vieja|Boscobel Beach Ginger Cake|Oxtails with Gravy|Shirini Nargili|Ash Reshteh|Pork Sinigang|Pofaki Gerdooyi|Naan|Thai Steamed Mussels|Butter Mochi Cupcakes|Thịt Bò Xào Đậu (Vietnamese Stir-Fried Beef and Green Beans)|Malaysian Lady Fingers (Okra)|Muhammara (Roasted Pepper & Walnut Spread)|Chicken Curry Puffs|Brown Spanish Rice|Korean-Style Salad Dressing|Traditional Gyros|Sfoof (Lebanese Semolina Turmeric Cake)|Knefla Soup|Dansk Aebleskiver (Danish Doughnuts)|Bolo de Leite Condensado (Brazilian Condensed Milk Cake)|Manjar (Dulce de Leche) from Scratch|Persian Shish Kabob|Speculaas|Cajun Boudin|Chicken in Black Bean Sauce|Old-Time Mincemeat Pie|Gajar Ka Halwa (Carrot Halwa)|Finnish Pulla|Tomato Bredie|Bread Machine Challah|Kaiserschmarren – Austrian Torn Pancakes|Spinach Quiche with Chicken|Pannekaken (Norwegian Pancakes)|Super-Simple, Super-Spicy Mongolian Beef|Chili Garlic (Homemade) Paneer|Omelet in a Bag|Oladi (Russian Kefir Pancakes)|Cream Cheese and Crab Sushi Rolls|Pork Pie|Fried Empanadas|Chicken Bhuna|Thai Spicy Basil Chicken Fried Rice|Dolmas (Stuffed Grape Leaves)|Jägerschnitzel|Tanya's Louisiana Southern Fried Chicken|Szechuan Beef|Southern-Style Chocolate Gravy|Beer Glazed Brats and Sauerkraut|Slow Cooker Sweet and Sour Kielbasa|Cuban-Style Roast Pork|Golabki (Stuffed Cabbage Rolls)|Thai Chicken|Greek Couscous Salad|Air Fryer Samosas|Instant Pot Filipino Chicken Adobo|Paneer|Best Sweet and Sour Brisket|Spicy Peruvian Pork|Swedish Nuts|Turkish Kebabs|Bihari Kabab|Sangria Cocktail|German Anise Christmas Cookies (Springerle)|Mojo Pollo Asada (Roast Chicken)|Aunt Louise's Baked Kibbeh|Authentic Louisiana Red Beans and Rice|Jerk Pork Chops|Vietnamese Iced Coffee|Pasta de Sardine|Jam Kolaczki|Brown Rice, Chicken, and Chorizo Paella|Mochi Muffins|Shrimp with Broccoli in Garlic Sauce|Appeltaart (Dutch Apple Tart)|Finnish Meatballs (Lihapyorykoita)|Atchara (Filipino Pickled Red Cabbage)|Japanese Pan Noodles|Arepas de Queso|Danish Pastry Apple Bars|Filipino Chicken Sopas|Danish Almond Puff|Chef John's Cuban Sandwich|Creamy Cajun Shrimp and Sausage Pasta|Easy Sausage and Shrimp Gumbo|Greek Lemon Chicken and Potato Bake|Siopao (Filipino Steamed Buns)|Browned Butter Banana Bread|Korean Banana Milk|Swedish Tea Ring|Sweet Potato Latkes|Sour Cream Dough for Pierogi|Eastern European Kotlety|Rappie Pie|Homemade Adobo All-Purpose Seasoning|Cuban-Style Yuca|Easy Bulgogi (Korean BBQ Beef)|Steamed Vegan Rice Cakes (Banh Bo Hap)|Godeungeo Jorim (Korean Braised Mackerel with Radish)|Velveting Chicken Breast, Chinese Restaurant Style|Chômeur's Pudding|Best Ever Russian Beef Stroganoff|Beef Stroganoff with Ground Beef|Celery Herb Stuffing and Savory Chicken|Vegetarian Korma|Restaurant Style Egg Drop Soup|German Beef Rouladen|Japanese Christmas Cake|Thai Green Curry Chicken|Onigiri (Japanese Rice Balls)|Air Fryer Potato-Apple Latkes|Basic Coquito|Spicy Vietnamese Quick-Pickled Vegetables|Beef Bulgogi with Dipping Sauce|Cuban Chicken|Fried Kimchi|Kimchi|Chef John's Buttermilk Biscuits|Hawaiian Pizza|Pastitsio|Restaurant-Style French Onion Soup|Thera's Canadian Fried Dough|Sex-in-a-Pan|Norwegian Potato Lefsa|How to Make Peanut Dipping Sauce|Vegetable Biryani|Fereni Starch Pudding|Garlic and Herb Cream Cheese|Butter Tarts|Christmas Brunch Casserole|Crispy Fried Smelts|Finnish Runeberg Tortes|Banket|Gramma's Date Squares|Cucumber and Avocado Sushi|Dash's Donair|Norwegian Krumkake|Sharon's Jamaican Fruit Cake|Louisiana Shrimp Creole|Puerto Rican Coquito|Instant Pot Baked Beans|Jerk Marinade Seasoning Rub|Old-Fashioned Swedish Glögg|Korean Street Toast|Classic Swiss Fondue|Easy Pavlova|Red Wine Reduction Sauce|The Best Thai Peanut Sauce|Real Poutine|Chai Tea Latte|Caldo Verde (Portuguese Sausage Kale Soup)|Sinigang na Isda sa Miso (Fish Stew with Miso)|Slow Cooker Chicken Massaman Curry|Sweet Russian Cabbage Soup|Galette des Rois|Roasted Pork Bánh Mì (Vietnamese Sandwich)|Chicken Biryani|Cuban Mojito|Instant Pot Salsa Chicken|Loukoumades|Newfoundland-Style Pea Soup|Taiwanese Popcorn Chicken|Kickin' Collard Greens|Sesame Jellyfish Salad|Air Fryer Tempura Vegetables|Provencal White Beans|Tam's Black-Eye Peas|Down-Home Black-Eyed Peas|Easy Pork and Sauerkraut|Hoppin’ John|Maja Blanca|Southern Fried Chicken|Portzelky (New Year's Cookies)|Quick and Easy Pancit|Chicken Florentine|Chef John's Buttermilk Fried Chicken|Corned Beef Roast|Best Ever New Zealand Pavlova|Hamantashen|Instant Pot Tonkotsu Ramen Broth|Chef John's Cuban Bread|Sausage Rolls|Greek Seasoning Blend|Swedish Chocolate Balls (Chokladbollar)|Amish Salisbury Steak|Pouding Chomeur|Maple Butter Tarts|Passover Matzo Lasagna|Ashure|Amish Potato Salad|Canadian Pork Loin Chops|Cheese Babka|Deep-Fried Turkey|Kuku Sabzi|Paska Bread|Italian Easter Grain Pie|Passover Chocolate Torte|Passover Rolls|Tropical Hawaiian Wedding Cake|Original Kumla Recipe from Mom|Black Pepper Chicken|Great-Grandmother Bubbie's Hamantaschen|Chewy Coconut Bibingka (Filipino Rice Cake)|Creme Patissiere (Vanilla Pastry Cream)|Lazy Wonton Soup|Pork Roast and Sauerkraut|Bazlama - Turkish Flat Bread|Chicken Marsala Fettuccine|Jamaican Style Curry Chicken|Korean Fried Chicken Sauce|Turkish Doner Kebab|Daddy Eddie's Roast Pork (Pernil), Puerto Rican-Style|Simple Crème Brûlée Dessert|Vietnamese Beef Pho|Limber de Coco (Coconut Ice)|Gochujang-Sauced Air Fryer Cauliflower Bites|Burrito Casserole|Chef John's Chimichurri Sauce|Macarons (French Macaroons)|Sautéed Fiddleheads|Southern-Style Banana Split Cake|Pennsylvania-Dutch Pickled Beets and Eggs|Traditional Filipino Lumpia|Chef John's Chicken Lazone|Greek-Style Chicken Pops|Grilled Asian Chicken|Curry Stand Chicken Tikka Masala Sauce|Easy Curry Sauce|Pashka|Butterkuchen|Authentic Russian Salad 'Olivye'|South African Traditional Vetkoek (Fried Bread)|White Wine Sangria|Indian Chapati Bread|Indian Style Basmati Rice|Layali Lubnan (Lebanese Nights)|Louisiana Red Beans and Rice|Indian Shrimp Curry|Tuscan Pork Tenderloin|Japchae Korean Glass Noodles|Chef John's Pavlova with Strawberries|Kala Chola Pakistani-Style|Greek Garbanzo Bean Salad|New York Strip Steak au Poivre|Authentic Swedish Pancakes|Garlic Dill New Potatoes|Chef John's Crème Fraîche|Indian Fish Curry|Lebanese Mountain Bread|Okra and Tomatoes|Honey Walnut Shrimp|Espinacas con Garbanzos (Spinach with Garbanzo Beans)|Arayes (Lebanese Crispy Meat Stuffed Pita)|Chef John’s Tortilla de Patatas|Lebanese Easter Cookies|Thai Sweet Sticky Rice With Mango (Khao Neeo Mamuang)|Kung Pao Chicken|Roasted Okra|Shadi's One-Pot Turmeric Chicken and Rice|Vietnamese Lemongrass Chicken|Southern Butter Beans|Easy Indian Butter Chicken|Bannock|Famous Japanese Restaurant-Style Salad Dressing|Mongolian Beef and Spring Onions|Light and Easy Greek Potato Salad|Japanese-Style Fluffy Pancakes|Cajun Cashews|Easy Bundt Pan Roasted Greek Chicken and Vegetables|Maritime Donair Sauce|German Rhubarb Almond Cake|Tembleque de Coco (Coconut Tembleque)|Amish Friendship Cake|Cao Lầu (Vietnamese Noodle Bowl)|Blackened Fish|German Rhubarb Streusel Cake|Japanese-Style Rolled Omelet (Tamagoyaki)|Herbs de Provence|Thai-Inspired Potato Salad|Pan-Fried Halloumi|Natillas (Spanish Custard)|Crawfish Salad|Italian Macerated Strawberries|Vanilla Crème Brûlée|Creamy Dill German Potato Salad|Japanese-Style Triple-Seared Steak|Bastani (Saffron and Rose Ice Cream)|Coconut Rum Brazilian Lemonade|Jamaican Fried Dumplings|Ultimate Lowcountry Shrimp and Grits|Thai Pasta Salad|Air Fryer Po' Boy|Blackened Seasoning Mix|Slow Cooker Barbeque Chicken|Slow Cooker Mojo Chicken|White Peach Sangria|Swedish Sticky Chocolate Cake (Kladdkaka)|Gourmet Pastelillos (Meat Pies)|French Apple Cake|Japanese Tamago Egg|Keema Aloo (Ground Beef and Potatoes)|Thai Spice Sweet Tea|Easy Chimichurri|Quick Tomato and Bean Soup Provencal|The Real Rum Runner|Apple Cake with Cream Cheese Frosting|Authentic Chimichurri|Homemade Pickled Ginger (Gari)|German Rice|Belgian Iron Cookies|Best Hummus|Swedish Cream Wafers|Amish Peach Dumplings|Spicy Korean Chicken|Creamy Mississippi Chicken Enchiladas|Russian Cheese Salad|Fried Sweet Bananas|Greek Turkey Meatballs|Tartufo|Mutton Varuval (Malaysian Indian-Style Goat Curry)|Tex-Mex Turkey Soup|Chef John's Hot Water Cornbread|Shrimp Biryani|Dashi Stock (Konbudashi)|Filipino Chicken Salad|Healthier Swedish Meatballs|Chicken and Waffles|Bougatsa|Chili Lime Chicken|Bialys|Jamaican Oxtail with Broad Beans|Kalam Polo (Persian Cabbage and Rice)|Eel Sauce|South African Malvapoeding (Marshmallow Pudding)|Brazilian Fish Stew|Brazilian Style Flan (Pudim de Leite Condensado)|Amish Casserole|German Apple Cake|Jewish Apple Cake|Teriyaki Rib Eye Steaks|Khao Soi Soup|Jamaican Rice and Peas|Pear Tarte Tatin|Teena's Overnight Southern Buttermilk Biscuits|Cuban Marinated Steak|German Semolina Pudding|Instant Pot Red Thai Curry Chicken|Jansson's Temptation (Janssons Frestelse)|Portuguese Shrimp|Bulgogi Beef (Korean-Style Barbecue)|Chef John's Mulligatawny Soup|Cream Puff \"Crack Buns\" (Choux au Craquelin)|DIY Finnish Lonkero (a.k.a. Long Drink)|Karioka Sweet Rice Balls|Labneh (Lebanese Yogurt)|Sweet Cornmeal Cake Brazilian-Style|Cheesy Baked Grits|Sweet Polish Sausage|Dessert Crepes|Champorado|Sausage Biscuits and Gravy|Crispy Chinese Noodles|Tri-Tip Bulgogi|Easy German Apple Streusel Pie|German Zwiebelkuchen (Onion Pie)|Tex-Mex Enchiladas|Amish Meatloaf|Baked Chicken Marinara|Italian Style No Mayo Tuna Salad|Kugel|Red Lentil Curry|Grilled Salmon with Chimichurri|Nana's Beef Stroganoff|Sweet Challah|Amish Peanut Butter|Crispy Fried Fish|Tarte Tatin|Southern-Style Pig Tails|Easy King Ranch Chicken Casserole|Greek Beef Stuffed Onions (Salantourmasi)|Country Cooking Slow Cooker Neck Bones|Filipino Lumpia|Air Fryer Chicken Parmesan|Jewish Apple Cake from Bubba's Recipe Box|Copycat Din Tai Fung Cucumber Salad|Classic Spicy Southern Fried Chicken|Greek Steak Marinade|Pumpkin Mochi|Roscoe's Chicken 65|Roscoe's Korean Fried Chicken|Amish Beef and Noodles|Country Ham and Biscuits|Crispitos|Famous Chicken Adobo|Cajun Pastalaya|Coconut Curry Salmon with Broccoli|Slow Cooker Butter Chicken|Homemade Portuguese Chicken|Canadian Yellow Split Pea Soup with Ham|One Pot Turmeric Chicken and Rice|Classic Spanish Sangria|Sheet Pan General Tso's Chicken and Broccoli|Short Ribs Pizzaiola|Miso Soup|Colleen's Slow Cooker Jambalaya|Easy Garam Masala|Chocolate Santafereño (Colombian-Style Hot Chocolate)|Slow Cooker Tuscan Chicken Meatballs with Gnocchi|Indian Chicken Curry|Beef and Cabbage (Lazy Golumpki)|Good New Orleans Creole Gumbo|Polish Egg Salad|Southern Pimento Cheese|The Best Chicken Fried Steak|Grandmother's Buttermilk Cornbread|Phyllis’s Braised Collard Greens|Austrian Jam Cookies|Basic Congee|Chicken and Sausage Jambalaya|Italian Steak Pizzaiola|French Almond Rum Cake|Bang Bang Chicken|Tuscan Chicken Casserole|4-Ingredient Orange Chicken|Brazilian Cheese Bread (Pao de Queijo)|Mixed Vegetable Curry|Spanish-Style French Toast (Torrijas)|Coquito|Chicken Teriyaki|Creole Seasoning Blend|Gyoza Sauce|Spring Roll Bowl|Russian Mushroom and Potato Soup|Aebleskiver|Chicken Arroz Caldo (Chicken Rice Porridge)|Chicken Cordon Bleu|Louisiana Crawfish Étouffée|Mulligatawny Soup|Slow Cooker Creamed Corn|Sweet and Sour Pork|Amish Tomato Pie|Bánh Mì|Chef John's Shrimp Étouffée|Classic Cuban-Style Picadillo|Delicious Easy Chicken Francese|Easy Red Beans and Rice|Fondant Potatoes|New Year Black-Eyed Peas|Pfeffernusse Cookies|Puerto Rican Tostones (Fried Plantains)|Sesame-Seared Tuna|Southern Fried Catfish|Southern Fried Chicken Livers|Stewed Cabbage|Tex-Mex Ground Beef and Potato Skillet|Traditional Sauerbraten|Tzatziki Sauce|Easy Baklava|Easy Shrimp Mozambique|Greek Baklava|Greek Salad|Moussaka|Old Charleston-Style Shrimp and Grits|Pappardelle with Jammy Onion Ragu|Simple Slow-Cooked Korean Beef Soft Tacos|South African Melktert (Milk Tart)|Swedish Meatballs with Creamy Dill Sauce|Air Fryer Chicken Katsu with Homemade Katsu Sauce|Authentic Paella Valenciana|Cape Malay Pickled Fish|Chef John's Sausage & Shrimp Jambalaya|Chicken French (Rochester, NY Style)|Filipino Fish Escabeche|German Hamburgers (Frikadellen)|Japanese-Style Ginger Salad Dressing|Kwek Kwek (Filipino Street Food)|Lumpia in the Air Fryer|Mizeria (Polish Cucumber Salad)|Perogies|Pinakbet|Rich and Creamy Potatoes au Gratin|Rosettes|Southern Collard Greens|Spanish Garlic Shrimp (Gambas al Ajillo)|Air Fryer Beignets|Air Fryer Tonkatsu|Bacon Gravy for Biscuits|Broccoli and Carrot Stir Fry|Caldo Verde (Portuguese Green Soup)|Ceviche Peruano|Chef John's Swedish Meatballs|Chicken Afritada (Filipino Stew)|Chocolate-Covered Matzo|Cordon Bleu Chicken Rolls|Curried Coconut Chicken|Date and Dried Cherry Mostarda|Dutch Apple Pie with Oatmeal Streusel|Frikadeller (Danish Meatballs)|Gujarati Kadhi|Jamaican Fried Snapper|Korean BBQ Galbi|Malaysian Nasi Lemak|Mom's Stovetop Pork Ribs|Spanish Paella|Taylor's Piroshki|Vegetarian Moussaka|Chilled Lo Mein Noodles with Szechuan Peppercorns|Greek Horiatiki Salad|How to Make Beef Satay|Indonesian Satay|Iskender Kebab|Jerk Chicken and Pasta|Kabob Koobideh (Persian Ground Meat Kabobs)|Kotlet Schabowy (Polish Breaded Pork Chop)|Perfectly Dry Roasted Chickpeas|Puerto Rican Rice and Beans|Smothered Cabbage|Best Fried Walleye|Filipino Beef Giniling (Afritada Style)|Halupki (Stuffed Cabbage)|How to Make Bordelaise Sauce|Mofongo|Peruvian Lomo Saltado|Sauce Vierge|Shrimp and Okra Gumbo|Traditional Swedish Pepparkakor|Arabic Fattoush Salad|Black-Eyed Peas and Ham Hocks|Chef John's Chicken Tikka Masala|Chicken Madras|Colombian Arepas|Easy Spoon Bread|Fried Cabbage and Egg Noodles|Ghormeh Sabzi (Persian Herb Stew)|Okra, Corn and Tomatoes|Skillet Chicken Bulgogi|Southern Grits Casserole|Adobong Pusit (Squid Adobo)|Ashley's Chicken Katsu with Tonkatsu Sauce|Authentic Chicken Empanadas (Empanadas de Pollo)|Bánh Xèo (Vietnamese Crêpes)|Chef John's Drunken Noodles|Chef John's Spanish Garlic Soup (Sopa de Ajo)|Chicken Satay|Duck Soup (Czarnina)|French Onion Soup Gratinée|German Rouladen|Ginataang Manok (Chicken Cooked in Coconut Milk)|Homemade Manti (Traditional Turkish Dumplings)|Jamaican Saltfish Fritters (Stamp and Go)|Japanese Beef Stir-Fry|Korean Cucumber Salad|Spicy Korean Fried Chicken with Gochujang Sauce|Vegetarian Mexican Lasagna|Authentic Saag Paneer|Biriyani|Butter Lamb Gravy|Chinese Black Bean Sauce|Easy Brazilian Black Bean Stew|Escabeche|Fårikål|German Currywurst|Greek Lentil Soup (Fakes)|Huancaina Sauce|Jamaican Plantain Tarts|Jerk Chicken Wings|Kafta (BBQ)|Krautburger|Lebanese Chicken and Potatoes|Maria's Portuguese Bacalau|Middle Eastern Rice with Black Beans and Chickpeas|Moqueca de Peixe Baiana (Brazilian Fish Stew)|New York Knish - Yo!|Northern Ontario Partridge (Ruffed Grouse)|Pakistani Chapli Kebab|Philippine Longanisa de Eugenio (Sweet Sausage)|Portuguese Favas|Puerto Rican Canned Corned Beef Stew|Puerto Rican Sancocho|Russian Cabbage Borscht|Russian Cheese Pancakes (Syrniki)|Slow Cooker Collard Greens|Smothered Collard Greens and Cabbage|Southern as You Can Get Collard Greens|Spanish Octopus|Steelhead Trout Bake with Dijon Mustard|Tzimmes|Vietnamese Aromatic Lamb Chops|Apple Walnut Canadian Butter Tarts|Ash Reshteh (Persian Noodle and Bean Soup)|Ash-e-jow (Iranian/Persian Barley Soup)|Beef Nilaga|Chef John's Beef Rouladen|Chef John's Brazilian Feijoada|Chimichurri Marinade|Crème Fraîche Chicken|Cuban Inspired Millet|Daddy's Shrimp Toast|Karelian Pies (Karjalanpiirakka)|Lazy Man's Pierogi|New Year's Day Black-Eyed Peas|Perfect Mixed Greens|Russian Cabbage Pie|Sheet Pan Cajun Butter Shrimp|Stroopwafels|Taramosalata|The Right Way to Cook Greens!|Captain Duarte's Salt Cod Cakes|Cheater Pierogi|Chipas (Argentinean Cheese Bread)|Classic Beef Empanadas|Dave's Georgia Black-Eyed Peas|Garlic Rice|Jewish Grandma's Best Brisket|Klupskies (Polish Burgers)|Moroccan Shabbat Fish|Polish Poppy Seed Cake|Russian Potato Salad|Sicilian Homemade Ricotta Cheese|Thai-Style Ground Pork Skewers|Argentinean Potato Salad|Beijinho de Coco (Coconut Little Kiss)|Cap Cai|Jemput Jemput (Banana Fritters)|Mediterranean Meat Pies (Sfeeha)|3-Ingredient Lemon Scones|Air Fryer Pakoras|Air Fryer Spanish Tortilla|Beef Pho|Beef Stifado in the Slow Cooker|Beef and Beet Borscht|Bistek (Filipino Beef Steak)|Cabbage and Kielbasa|Cajun Ponchartrain Sauce|Chef John's Red Beans and Rice|Goan Pork Vindaloo|Ground Beef Stroganoff Casserole|Japanese Agedashi Tofu|Pastelon (Puerto Rican Layered Casserole)|Quick Chinese-Style Vermicelli (Rice Noodles)|Schupfnudeln (German Fried Potato Dumplings)|Slow Cooker Spanish Beef Stew|Traditional Springerle|Adas Polo (Persian Rice and Lentils)|Authentic Middle Eastern Hummus (Chummus)|Best Homemade Marzipan|Blender Hollandaise Sauce|Chef John's Miso Soup|Cocada (Brazilian Coconut Sweet)|Creole Okra|Dutch Bokkenpootjes - Goat's Feet|Empanadas Abiertas de Humita (Creamy Corn Empanadas)|Fried Matzo|Kachumbari|Lamb Börek|Mango Gazpacho|Nasi Goreng (Indonesian Fried Rice)|Penang Pork Satay|Peruvian Causa|Peruvian Pickled Onions (Salsa Criolla)|Quince Paste|Turkish Fish Stew|Arroz con Pollo Perunao (Peruvian Rice with Chicken)|Bacalhau Portuguese ao Forno (Salt Cod with Tomatoes and Olives)|Black Beans with Bacon|Butter Chicken (Murgh Makhani)|Cajun Deep-Fried Turkey|Canjica (Brazilian Hominy Pudding)|Chef John's Cheese Blintzes|Chicken In Coconut Sauce|Dol Sot Bi Bim Bap|Grilled Spatchcocked Greek Chicken|Kimchi Jun (Kimchi Pancake) and Dipping Sauce|Lebanese Lemon Lentil Soup|Malaysian Barbecue Chicken Wings|Potato Latkes|Poutine Gravy|Puerto Rican Shepherd Pie (Pastelon)|Russian Cabbage Rolls with Gravy|Russian Green Bean and Potato Soup|Semla|Southern Spicy Fried Chicken|Tender Juicy Skirt Steak (Churrasco)|Turducken|Vegan Mofongo (Fried Mashed Plantains)|Chef John's Brazilian Fish Stew|Filipino Baked Milkfish (Baked Bangus)|Instant Pot® Cuban-Style Black Beans|Jaeger Schnitzel|Linzer Cookie Bars|Linzer Cookies|Linzer Tart Cookies|Mama's Tomato Gravy|Rugelach|Spicy Southwestern Slaw|Spinach and Cauliflower Bhaji|Argentine Meat Empanadas|Chef John's Grilled Mojo Beef|Korean Soft Tofu Stew (Soon Du Bu Jigae)|Matzoh Ball Soup|Oven Fried Okra|Overnight Matzo Bake|Thai Coffee|Almond Cookies (Dim Sum Variety)|Authentic Lebanese Fattoush|Baked Rigatoni|Chakalaka|Hawaiian Apple-Pineapple Crumble|Potato Plum Dumplings|Ruthie’s Scandinavian Christmas Cookies|Vaca Frita (Pan-Fried Beef)|Vietnamese Salad Rolls|Authentic Paella|Dutch Cookies|Vietnamese Caramelized Pork|Air-Fried Peruvian Chicken Drumsticks with Green Crema|Cajun Style Stuffed Peppers|Lebanese Donair|Portuguese Sopas|Spicy Tomato Chicken (Ayam Masak Merah)|Brazilian Chicken with Coconut Milk|Peruvian Potato-Chicken Salad (Causa Rellena)|Pork and Chicken Adobo|Canadian Walleye (Pickerel)|Danish Kringle|Malaysian Beef Rendang|Peruvian Chicken Soup (Aguadito de Pollo)|Deep Fried Corn Meal Sticks (Sorullitos de Maiz) with Dipping Sauce|Egg and Potato Curry|Gehakt Ballen (Dutch Meatballs)|Italian-Style Bruschetta|Lomo Saltado (Peruvian Steak Stir-Fry)|Persian Saffron Chicken|Peruvian Locro (Butternut Squash)|Swedish Meatballs (Svenska Kottbullar)|Tex-Mex Pantry Casserole|Tourtiere (French Canadian Meat Pie)|Ukha (Russian Fish Soup)|Yaki Udon|Arepas de Huevos|Cazuela de Vaca (Beef and Pumpkin Stew)|Chimichurri Roasted Potatoes|Gisela's Butternut Squash Soup|Homemade Sushi Rolls|Lazy Golumpki (Stuffed Cabbage) Soup|Nanaimo Bars|Quick and Easy Thai Style Coleslaw|German Lebkuchen|Amish Cinnamon Bread|Cuban Tamales|Filipino-Style Congee (Lugaw)|Jamaican Curry Chicken|Paksiw na Pata (Pig's Feet Stew)|Pierogi Casserole|Stuffed Breast of Veal|Christmas Stollen|German Wiener Schnitzel|Thit Kho (Caramelized Pork Belly)|Sweet Potato Pie|Unstuffed Shells Pasta Bake|Kale and Cabbage Soup|New Mom Broccoli Kugel|Pakistani-Style Roast Chicken Thighs|South African Instant Milk Tart|Super Easy Polish Cabbage Rolls|Kokub's Mango Chutney from Pakistan|Pork Scallopini|Beer Sausage|Boliche (Cuban Pot Roast)|Cod Piccata|Grits a Ya Ya|Slow Cooker German-Style Pork Roast with Sauerkraut and Potatoes|Easy Crispy Vietnamese Shrimp Balls|Swiss Steak Quick and Easy|Italian Penicillin Soup|Bo Nuong Xa|Instant Pot Lebanese Lentil Soup (Shorbat Adas)|Polish Sauerkraut and Carrot Salad|Salpicao de Frango (Brazilian Chicken Salad)|Salmon en Croûte|Buffalo Chicken Chili|Jamaican Oxtail Stew|Malaguena Lemon and Dill Vinaigrette|Peruvian Cilantro Rice|Best Pernil Ever|Peruvian Aji-Style Sauce|Polish Cabbage Noodles|Easy Cajun Jambalaya|The Best Classic Beef Stroganoff|Jamaican Cornmeal Porridge|Vegetarian Borscht|Chinese Pork Dumplings|Tulumba (Deep-Fried Pastry with Syrup)|Baked Sweet and Sour Chicken Thighs with Pineapple|Cheesy Pork Taco Rice|Chicken Fried Rice|Korean BBQ Short Ribs (Galbi)|Vermicelli Noodle Bowl|Amish Friendship Chocolate Bread|Asian Coconut Rice|Cheese Rösti|Chinese Spareribs|Linguica (Smoked Portuguese Sausage)|Mango Chutney|Pho (Vietnamese Noodle Soup)|Roman-Style Pizza|Slow Cooker Pork, Sauerkraut, and Beer|Solianka (Russian Beef Soup)|Bibimbap (Korean Rice Bowl)|Danish Spiced Rye Bread (Sigtebrod)|Malaysian Mango Chicken Curry|Vegetarian Bibimbap|Authentic Vietnamese Spring Rolls (Nem Ran Hay Cha Gio)|Char Siu (Chinese BBQ Pork)|Chicken Pastina|Filipino Lechon Kawali|Korean Fried Chicken|Chef John's Rocky Road|General Tso's Chicken|Nazook (Sweet Persian Pastry)|Portuguese Snow Drops|Quick Beef Stir-Fry|Sweet Chili Thai Sauce|Chinese Tea Eggs|Super Easy Cabbage Stir Fry|Beef Empanadas with Olives and Raisins|Ground Beef and Cabbage|Menemen (Turkish Scrambled Eggs)|Portuguese Chourico, Beans, and Rice|Portuguese Egg Tarts|Thai Peanut Butter Ramen|Laura's Famous Aebleskiver|Pierogi (Traditional Polish Dumplings)|Portuguese Sausage Soup|Sarah's Knish|Spanish Gazpacho|Swedish Spareribs|Caldereta (Filipino Beef Stew)|Chef John's Bigos (Polish Hunter's Stew)|Codfish with Cream|Kaiserschmarrn|Lebanese Bean Salad|Russian Beet and Potato Salad|Slow Cooker Reuben Dip|Vareniki (Pierogi) with Potatoes and Mushrooms|Vietnamese Chicken and Long-Grain Rice Congee|Yaki Mandu (Korean Dumplings)|Authentic Cincinnati Chili|Borscht I|Jujeh Kabob (Persian Chicken Kabobs)|Lentil Stew|Argentine Lentil Stew|Easy Lamb Gyros|Indonesian Pork Satay|South African Lamb Sosaties (Kebabs)|A Jerky Chicken|Banh-Mi Style Vietnamese Baguette|Goi Ga (Vietnamese Chicken and Cabbage Salad)|Jamaican Jerk Chicken|Pho Ga Soup|Russian Chicken Stew with Potatoes and Vegetables|Slow Cooker Cuban Pork|Booyah Chicken|Braised Collard Greens|Colombian Lentils|Cuban-Style Picadillo|Real Hummus|Avocado-Lime Shrimp Salad (Ensalada de Camarones con Aguacate y Limon)|Cinnamon Babka|Easy Challah Bread|Habichuelas Guisadas|Mailäenderli (Swiss Butter Cookies)|Norwegian Potato Flatbread (Lefse)|Orange Chicken|Portuguese Kale Soup|Cajun Chicken Pasta|Blinis|Green Beans in Seasoned Tomato Sauce|Green Chile Chicken Casserole|Masht-o Khiyaar (Persian Cucumber Salad with Sultanas and Walnuts)|Pisco Sour II|Russian Doughnuts|Shami Kabab (Bun Kabab)|Game Day Sangria|Lemon Pisco Sour|Absolutely Fabulous Greek Salad Dressing|Best Ever Pinto Beans|Boneless Buffalo Wings|Cajun Seafood Pasta|Chef John's Coq au Vin|Fatayer (Lebanese Meat Pies)|Instant Pot Thai-Style Green Curry Chicken|Joel's Jerk Chicken Pineapple Pasta|The Best Thai Coconut Soup|Wonton Soup|Cilantro and Garlic Potatoes|Danish Oven Pancake (Aeggekage)|Danish Red Cabbage|Instant Pot Bobo de Frango (Brazilian Chicken Stew)|Italian Wedding Pasta Bake|Lutefisk|Malaysian Red Curry Thighs|Nicole's Cajun Chicken and Sausage Jambalaya|Nong's Khao Man Gai|Shredded Slow Cooker Cuban Beef|South African Pumpkin Soup with Banana and Curry|Toasted Cuban Sandwich|Chilean Pebre Sauce|Danish Chicken Liver Pate|Deviled Eggs with Zip|Empanada Filling|Filipino Ribs|Karaage (Japanese Fried Chicken) with Honey Mayoster Sauce|Pochero|Vegetable Banh Mi|Apfelkuchen (Apple Cake)|Macarons|Sea Bass à la Michele|French Silk Pie Bars|Semla (Swedish Fat Tuesday Buns)|Chef John's Duck, Sausage, and Shrimp Gumbo|Lemon Chicken Orzo Soup|Mojo Shrimp|Bistro-Style Steak|Cajun Chicken and Sausage Gumbo|Cucumber Chili Salad|Pisco Sour Cocktail|Beans and Greens Tartine|Gambas Pil Pil (Prawns, Chilean Style)|Jewish Chicken Soup|Lite Brocamole|Peruvian Aji Verde|Chinese Hand-Pulled Noodles in Beef Broth|Easy Portuguese Bean Soup|Hot Banana Salsa|Italian Ricotta Cookie Bars|Olivie (Russian Potato Salad)|One Pot Tuscan Shrimp and Orzo|Vietnamese Sandwich|Amish Blackberry and Strawberry Baked Oatmeal|Beef Pirozhki|Brigadeiro|Leche Flan|Pasteles with Yuca and Plantains|Peruvian Arroz con Pollo (Peruvian Rice and Chicken)|Bayy's Special Jamaican-Style Oxtail|Hasselback Potatoes|Homemade Tom Yum Soup|Ostkaka (Swedish Cheesecake)|Pannukakku (Finnish Oven Pancake)|Telur Balado (Spicy Chile Sauce with Eggs)|Vegan Borscht|Vietnamese Caramel Chicken|Vietnamese Grilled Pork Skewers|Duck Fesenjan|Easy Hamantaschen|Mom's Beef Shish Kabobs|Persian Rice|Amish Butter and Egg Dinner Rolls|Bigos (Hunter's Stew)|Greek Tzatziki|Shakshuka|Best Jambalaya|Greek Honey Mustard Roast Chicken and Potatoes|Greek Smashed Pita|Guava Cuban Pastry (Pastelito de Guayaba)|Russian Ant Hill Cake|Squash and Kohlrabi Empanadas|Swedish Rice Pudding|Kheer (Rice Pudding)|Southern Fried Cabbage|Kielbasa and Cabbage|Lebanese Fattoush (Bread Salad)|Pakistani Spicy Chickpeas|Patacones de Colombia (Fried Plantains)|Simple Stovetop Amish Chicken|Swedish Waffle Cookies|Wine and Garlic Pork (Portuguese Vina Dosh)|Amish Friendship Bread|Amish Friendship Bread Starter|Charoset|Quiche Lorraine|Shortcut Pierogies|Pacific Cuban Black Beans and Rice|Portuguese Sausage and Kale Soup (Caldo Verde)|Balti Chicken Pasanda|Colombian Turmada Potatoes (Papa Turmada)|Curried Beef with Winter Vegetables|California Style Israeli Salad|Russian Tea Cakes|Blackened Salmon Fillets|Cajun Seasoning Spice Mix|Chef John's Quick Cassoulet|Indian Chicken Curry (Murgh Kari)|Jerk Seasoning|Louisiana Crawfish Boil|Simple Cajun Seasoning|The Best Ever Classic Jewish Noodle Kugel|Cuban Shredded Pork|Thai Chopped Chicken Bean Salad|Chef John's Roman-Style Chicken|Mallorca Bread|Authentic Greek Moussaka|Chinese Broccoli|Lahmacun Turkish Pizza|Southern Ham and Brown Beans|Apple Danish with Crescent Roll Dough|Breakfast Grits|Cuban Picadillo|Okonomiyaki-Inspired Crispy Rice|Russian Beet Salad with Herring|The Best Ricotta Pancakes|Reshteh Polo (Persian Noodle Rice)|Sticky Rice with Passion Fruit Sauce|Ham with Red Eye Gravy|Air Fryer Tofu Milanesa|Copycat Chicken Fritta|Best Matzo Balls|Ba'corn Cheese Corn|Haroset for Passover|Israeli Salad Recipe|Matzah|A Number-One Egg Bread|Chicken Bog|Turkish Eggs (Cilbir)|Cajun-Spiced Sauce|CindyD's Somewhat Southern Fried Chicken|Lumpia - Filipino Shrimp and Pork Egg Rolls|Wasabi Shrimp Sushi Cups|Orange Pikelets|Shrimp Mozambique|Tteokbokki (Korean Spicy Rice Cakes)|Greek Lemon Chicken Soup|Greek-Style Potatoes|Jamaican Jerk Shrimp in Foil|Roasted Greek Lemon Potatoes|Smokey Vegetarian Cuban Black Bean Soup|Vegan Turkish Baked Eggplant|Copycat Panda Express Orange Chicken|3-Ingredient Japanese Cheesecake|Baked Cuban Chicken|Cheeseburger Focaccia|Chokladbiskvier (Swedish Chocolate Meringue Cookies)|Crêpes Suzette|French Onion Soup Focaccia|Gefilte Fish|Pizza Focaccia|Sesame Chicken with Broccoli|Sfouf (Lebanese Turmeric Cake)|Cuban Goulash|Kobete Chicken|This 5-Minute Southern Chocolate Gravy Recipe Has Been Passed Down for Generations|Chicken Curry V|Shakshooka|Blini (Russian Pancakes)|Cuban Crunchwrap|Japanese Ginger Pork|Yazdi Cakes|Eggplant, Roasted Pepper and Chicken Pitas|Easy 5-Ingredient Pumpkin Soup|Middle Eastern Kibbeh|Rendang Gaging (Beef Stew)|Shiraz Salad|Polish Egg Bread|Danish Cinnamon Snails|Handkerchief Lasagna|Oma's Fabulous Matzo Ball Soup|Slow Cooker Puerto Rican Shredded Pork|5-Ingredient Cajun Pasta|Bread Machine Swedish Coffee Bread|Cajun Blackened Catfish|Churrascaria-Style Picanha|Classic Cuban Midnight (Medianoche) Sandwich|Eggs in Purgatory|Matzo Brei|Sole Meuniere|Cuban Smoked Sausage with Chickpeas|Fattet Betenjan (Eggplant and Yogurt Salad)|Hawaiian Wedding Cake|Carrie's Pad Thai Salad|Chicken Fra Diavolo|Chupe (Peruvian Shrimp Chowder)|Easy Flan|Greek Orzo Salad|Mardi Gras King Cake|Spicy Crab Curry - Bangla Style|Spicy Noodles - Malay Style|Pakistani Potato Chicken|Cuban Chicken Sandwich|Jamaican Curried Goat|Tuscan Salmon|Chocolate Babka|Dulce de Leche|Speculaas Cookies|Tex-Mex Chicken Casserole|Carne Guisada|Indian Lassi|Crispy Ginger Beef|Chicken Curry III|Argentinean Chimichurri Sauce|Cajun Shrimp and Sausage Sheet Pan Dinner|Keto Tex-Mex Ground Beef Casserole|Spanish-Style Oxtail Stew|Chickpea Tikka Masala|Jamaican Curry Powder|Sweet Tea Peaches|Best Vinegar Coleslaw|Labneh (Lebanese Cream Cheese)|French Crêpes|Indonesian Ratatouille with Tempeh|Fresh Israeli Salad|Potato Soup with Gravlax Rosettes|Pollo (Chicken) Fricassee from Puerto Rico|Spanish Cod|Bistec Encebollao|Danish Christmas Red Cabbage|Vienna Schnitzel|Air Fryer Spanakopita|Ants Climbing a Tree Glass Noodles|Cuban Black Bean Soup in the Slow Cooker|Dooky Chase-Style Fried Chicken|Strawberry Sando|Vegetarian Huevo Saltado|Vietnamese Beef and Red Cabbage Bowl|Amish Apple Dumplings|Cold Yogurt Soup (Abdoogh Khiar)|Filipino Beef Steak|Hearty Portuguese Bean Soup|Octopus in Tomato Sauce|Aargau Carrot Cake|Bûche de Noël|Disney's Ratatouille|Easy Chinese Fried Noodles|Ratatouille|Sufganiyot|Swedish Princess Cake (Prinsesstårta)|Smooth Sweet Tea|Avgolemono Soup|Coffee Panna Cotta|Easy Mojitos|Fleischsalat (German Meat Salad)|Aji (Colombian Salsa)|Easy Plum Cake|Thai Cucumber Salad|Mom's Nova Scotia Seafood Chowder|Sunomono (Japanese Cucumber Salad)|Rollkuchen (Mennonite Fritters)|Paneer Butter Masala|Instant Pot Bahn Flan (Vietnamese Flan)|Peruvian Pineapple Chicken (Pollo a la Piña)|Piña Colada Sorbet|Day After Thanksgiving Turkey Pho|Aburi Steak|Dave's Low Country Boil|Perfect Sushi Rice|Italian Breakfast Strata|This High-Protein Greek Salad Will Be on Repeat All Summer Long|Al's Baked Swiss Steak|Fish Puttanesca|Fried Okra|Mongo Guisado (Mung Bean Soup)|Ratatouille Bake|Greek Spanakopita|Chef John's Patatas Bravas|Chicken Satay Bowls with Spicy Peanut Sauce|Easy Paella|Maicena (Corn Pudding)|Quick and Easy Paella|Simple Chopped Liver|Gelato|Chef John's Picadillo|Greek Chicken|Vietnamese Chicken Salad|3-Ingredient Japanese Potsticker Dip|Honey BBQ Sauce|Sangria! Sangria!|Chi Chi Dango|Spicy Thai Noodle Salad with Peanut Dressing|No-Bake Cannoli Pie|Anzac Biscuits|Pepperoni Casserole|Lower Fat Amish Macaroni Salad|My Big Fat Greek Salad|The Real Mojito|Avocado and Tuna Tapas|Chicken Katsu|Freddo Espresso|Greek Chicken Meatballs|Spanish Omelette|Easy Mediterranean Baked Chicken Breast|Best Fried Green Tomatoes|Bob's Stuffed Banana Peppers|Chinese Eggplant with Garlic Sauce|Russian Pelmeni|Best Bread Pudding with Vanilla Sauce|Tortilla Española|Korean BBQ Sauce|Peach Bellini|Ginger Sekanjabin|Meet Lemon Pesto: The 5-Ingredient No-Cook Sauce Ready Before Your Pasta's Done Boiling|Souvlaki|Strawberry, Ginger, and Mint Sekanjabin|Traditional Gyro Meat|Paneer Tikka Masala|Tuscan Style Ribs (Rosticciana)|Chicken Sofrito|Finnish Summer Soup|Pennsylvania Dutch Corn Pie|Pasta Alla Caponata|Pesto Chicken Caprese|Zucchini with Dill Weed and Garlic-Yogurt Sauce|Italian Salsa Verde Marinated Mozzarella|Lamb Souvlaki|Turmeric Golden Milk with Turmeric Paste|Ayam Bakar (Indonesian Grilled Chicken)|Chicken Tinola|Chilean-Style Sopaipillas|Creamy Tuscan White Bean Skillet|Ottilienkuchen (German Chocolate Sprinkle Cake)|The Best Lemon Vinaigrette|Air Fryer Wiener Schnitzel|Jamaican Brown Stew Chicken|Puttanesca Pasta Bake|Jibarito|Kid-Friendly Chicken Katsu|Grandma Oma's Pickled Okra|Kalimotxo (Calimocho)|Lamb (Gosht) Biryani|Indian Summer Raspberry Peach Sangria|Jalapeño Jelly|Italian Cherry Margarita|Beignets","sep":"|"},{"f":"02024-02-07|511-26|32-07-14|35-01-31|62-18|32-08-12|33-12-12|30-06-19|35-01-21|66-02|32-08-28|69-25|34-12-19|33-12-08|35-07-14|34-12-13|33-02-14|63-24|32-09-13|35-02-01|64-15|34-11-30|35-04-09|63-10|219-10-12|225-04-07|211-10-19|224-10-08|30-06-18|33-03-08|35-06-05|33-02-08|34-06-17|35-04-21|61-14|32-10-31|34-04-24|35-06-25|33-12-06|35-02-03|61-28|62-16|34-02-04|511-14|62-29|30-03-05|32-10-18|509-12|35-01-15|32-11-16|35-06-13|34-11-13|35-06-26|62-27|32-05-11|35-04-01|34-11-16|35-04-27|62-04|33-04-05|34-06-20|32-10-11|34-12-20|32-01-07|35-01-27|65-21|61-22|32-11-14|34-04-05|32-11-02|35-05-15|63-25|34-12-27|32-12-13|217-04-05|224-11-12|60-23|32-12-08|508-26|35-03-20|32-08-22|34-11-15|35-01-17|90|63-12|62-20|64-23|32-12-19|34-11-17|62-05|33-12-05|508-27|34-11-01|821|32-01-14|69-16|35-04-08|219-04-03|225-03-27|32-09-29|35-01-30|34-11-27|32-11-09|34-09-25|511-22|90|32-08-04|34-08-18|35-06-16|34-11-06|505-31|33-08-30|35-06-17|34-10-22|35-04-11|32-08-08|510-02|34-07-28|61-25|511-23|35-01-20|62-06|34-08-01|218-03-21|224-11-18|503-14|68-20|811|63-28|35-02-11|34-08-19|219-04-04|225-01-08|66-10|34-12-01|33-06-06|512-13|34-11-19|508-05|69-06|63-21|66-21|35-05-07|33-11-16|31-02-09|35-03-01|814|33-12-11|61-13|35-06-04|33-04-02|35-07-20|34-12-12|90|505-03|67-09|68-07|32-11-04|35-04-16|218-06-08|225-03-05|33-02-15|32-11-25|35-02-10|34-12-03|35-03-21|65-06|34-10-28|506-25|32-01-04|35-03-31|34-11-08|507-25|512-24|33-02-07|34-07-31|65-02|35-04-30|34-11-29|33-08-17|35-02-24|33-07-05|35-01-23|62-25|34-11-24|33-11-14|34-09-11|33-08-26|32-10-03|33-07-20|511-07|35-07-15|62-21|34-04-30|33-09-10|34-11-28|32-02-09|34-11-25|508-22|32-09-02|61-03|33-11-28|34-03-19|64-08|35-01-29|34-12-17|35-03-06|34-04-11|35-05-22|67-23|62-26|33-04-21|35-07-25|30-06-19|34-05-15|511-07|30-03-04|34-10-02|508-21|35-04-29|806|810|34-05-23|66-10|32-11-08|34-12-04|508-02|66-05|32-11-03|62-01|34-09-17|510-14|505-06|35-02-28|34-03-06|35-02-07|34-06-26|33-01-06|34-08-13|64-29|33-01-12|34-03-27|35-03-11|33-02-21|35-02-05|64-03|34-08-06|33-01-17|820|32-06-15|35-01-09|65-27|64-02|33-11-02|34-06-06|63-11|35-02-12|33-02-01|35-07-10|33-04-24|34-05-29|33-08-15|35-04-13|66-24|34-02-13|69-23|35-05-12|33-02-22|32-12-11|509-08|33-02-23|35-02-19|33-01-30|35-01-07|32-08-23|35-01-24|34-04-18|32-08-15|34-07-23|94|35-02-14|64-22|33-11-21|32-09-07|33-02-12|61-28|69-29|34-07-21|33-04-13|35-06-20|34-12-06|35-03-24|66-11|61-13|34-01-19|32-06-28|33-02-06|32-07-11|69-14|33-09-11|31-04-28|34-08-14|33-06-01|34-03-05|33-03-30|807|34-02-06|65-08|61-09|512-18|35-03-07|33-08-22|34-09-26|35-01-16|34-10-11|32-09-20|35-06-09|33-09-08|35-01-06|34-06-11|33-09-13|32-12-28|33-07-03|34-12-02|33-02-17|34-02-05|33-11-05|35-03-18|34-07-07|33-01-08|35-04-28|34-04-10|35-06-23|33-12-01|61-06|60-31|34-07-30|32-10-17|34-10-29|506-13|32-08-10|61-28|33-12-14|30-03-09|33-05-23|34-07-17|32-09-05|35-04-14|34-07-22|64-25|35-05-20|66-03|34-02-14|33-04-09|62-02|35-06-06|30-04-09|32-11-06|34-07-13|32-07-21|35-01-25|33-11-18|90|35-05-14|34-02-02|512-16|505-16|35-07-21|34-11-27|32-09-06|34-11-05|35-04-20|33-08-23|34-02-28|33-03-01|34-06-20|32-01-20|66-24|34-06-12|33-02-16|34-10-31|32-10-01|33-02-25|34-06-27|33-01-11|35-06-19|32-06-14|510-19|35-07-16|34-05-24|64-14|68-29|32-12-07|209-02-09|210-05-07|512-28|31-02-11|65-01|32-01-06|62-19|63-20|33-06-20|34-06-10|37-04-05|511-09|62-21|38-03-21|a|a|a|a|64-06|66-08|a|a|a|68-29|831|511-30|62-14|39-04-02|93|a|a|a|a|a|a|a|a|a|a|a|a|a|94|a|a|65-29|66-22|67-04|810|831|510-02|812|220-01-09|816|62-01|819|824|63-04|95|a|a|a|a|a|99|810|64-07|99|820|830|65-01|810|820|66-16|98|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|99|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|823|67-28|511-30|62-20|31-01-08|62-09|810|99|63-08|830|64-04|812|94|99|828|66-10|93|67-07|68-02|98|99|810|94|98|69-02|821|510-13|829|62-09|829|32-01-03|a|a|94|a|a|a|a|a|a|a|a|a|a|a|a|97|a|a|a|a|a|a|814|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|820|91|97|98|62-09|a|811|95|63-02|814|65-11|a|a|823|66-10|93|94|95|a|822|93|94|96|98|99|830|67-11|92|94|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|821|95|96|98|99|68-01|94|a|a|a|a|a|a|a|a|a|a|98|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|810|91|92|a|95|a|97|822|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|93|96|a|a|98|a|a|a|830|69-02|95|96|a|a|97|98|a|a|99|811|92|a|a|a|a|93|a|a|94|95|96|a|a|a|98|99|820|a|a|91|92|94|95|a|a|a|96|97|98|99|510-01|92|93|94|95|96|97|811|a|92|97|98|99|821|96|99|830|91|a|61-01|92|a|a|93|94|a|a|96|97|98|a|a|99|a|810|93|94|95|96|98|820|91|92|93|95|a|98|99|830|62-01|93|97|98|a|99|811|92|93|94|95|96|99|822|94|96|97|98|33-01-06|a|a|a|97|98|811|92|a|a|95|96|97|98|99|820|a|92|94|95|96|97|98|830|a|62-01|92|93|94|95|96|97|a|a|a|98|810|92|93|94|a|a|95|a|a|96|a|97|99|821|92|a|a|93|94|95|96|63-01|96|97|a|98|99|813|97|820|92|93|94|830|a|91|64-02|95|98|99|811|92|93|94|98|99|820|91|a|93|94|95|96|97|98|65-01|93|98|99|812|94|96|98|823|94|830|91|66-01|92|94|96|99|812|821|92|97|99|67-03|a|a|95|a|96|814|820|a|a|97|831|68-13|94|95|a|97|a|822|93|96|a|a|97|98|99|830|a|91|69-05|96|98|a|810|91|92|93|94|95|96|97|821|96|98|99|a|510-04|95|96|811|92|93|94|95|96|97|820|91|93|96|831|a|a|a|61-01|92|95|a|96|a|97|a|a|98|810|92|93|a|94|95|96|97|98|a|821|95|97|98|a|a|99|830|62-01|a|92|93|95|a|96|a|a|a|a|a|97|98|811|a|92|93|94|a|a|a|95|34-01-09|818|99|822|95|99|62-02|94|a|95|a|96|a|97|a|99|813|a|a|94|99|820|92|98|a|a|63-04|95|a|96|a|97|810|91|a|a|a|92|94|a|96|99|820|91|a|a|a|a|92|97|99|64-02|93|95|a|96|97|98|a|a|99|810|a|a|91|a|92|94|96|97|98|822|93|94|a|a|95|96|99|830|a|a|65-01|92|a|a|a|93|96|97|98|99|810|92|93|95|96|98|822|93|a|94|98|99|830|91|66-01|93|95|96|a|810|91|92|93|a|94|95|96|97|a|a|a|98|99|821|a|a|a|95|a|a|96|97|67-01|93|97|99|a|813|94|95|97|98|99|820|91|92|93|a|94|a|a|95|96|97|98|a|a|99|830|91|a|68-01|a|a|92|93|94|95|96|97|a|a|a|a|811|a|a|a|a|a|a|93|a|94|96|97|98|99|820|a|a|91|a|a|a|a|92|a|a|94|96|97|99|69-04|95|96|97|98|99|810|91|a|a|a|a|97|a|98|99|820|91|93|94|95|96|98|830|510-01|92|93|94|97|98|810|91|a|a|a|a|94|96|822|93|a|95|97|98|99|831|61-01|a|a|95|96|97|a|98|99|811|92|a|a|a|a|a|93|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|94|a|a|a|a|a|a|a|a|a|95|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|96|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|97|a|a|a|a|a|a|a|a|a|a|98|a|a|a|a|a|a|a|a|99|a|a|a|a|a|a|a|a|a|a|820|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|91|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|92|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|93|a|a|a|a|a|a|a|a|a|a|a|a|94|a|a|a|a|95|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|96|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|97|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|a|98|a|a|a|a|a|a|a|a|a|a|99|a|a|a|a|a|a|830|a|a|a|a|a|a|a|a|62-01|a|a|92|a|a|a|a|93|a|a|94|a|a|a|95|a|a|a|a|a|a|a|a|a|a|a|96|a|a|a|a|a|a|a|99|810|a|a|a|a|a|a|92|a|a|93|96|97|a|a|a|a|98|a|99|a|a|a|a|820|a|92|94|a|a|a|96|97|a|a|99|831|35-01-01|92|96|a|97|a|98|a|99|a|a|a|a|810|a|a|a|a|a|a|a|a|a|93|a|a|a|94|a|a|a|a|95|a|a|a|a|a|96|a|97|a|a|a|a|820|91|a|a|a|a|a|92|a|a|a|a|a|a|a|a|a|93|94|a|a|95|a|a|a|97|a|a|a|a|a|a|98|a|a|a|a|99|a|a|a|a|a|a|a|830|91|a|a|a|a|a|a|62-01|a|93|a|a|a|a|a|a|a|a|a|94|a|a|a|a|a|a|a|a|a|a|a|95|a|a|a|a|a|a|a|96|97|a|810|a|91|a|a|92|a|a|a|94|a|a|a|a|96|a|a|a|a|a|97|98|a|a|a|a|a|99|a|a|a|a|a|a|a|a|820|a|a|a|91|a|a|a|93|94|a|a|a|a|a|95|a|96|a|a|a|a|a|a|97|a|a|a|a|98|a|63-01|a|a|93|94|95|a|a|a|a|a|a|a|96|a|97|98|810|a|a|a|91|a|a|a|a|a|92|93|94|97|98|99|820|a|a|a|91|a|a|93|94|a|a|95|a|a|97|a|a|a|a|a|98|831|a|a|a|a|a|a|a|a|a|64-01|a|a|92|a|93|a|a|a|94|96|a|a|a|97|98|a|a|a|99|a|a|a|a|a|a|a|810|a|a|91|a|a|a|a|a|a|a|93|94|a|a|95|a|a|a|96|a|97|820|91|a|a|a|92|a|a|93|a|95|96|97|a|98|a|99|a|a|830|a|a|a|a|65-01|95|96|a|a|a|a|97|a|a|a|a|a|a|99|812|a|a|a|93|94|a|95|a|96|99|820|a|a|91|92|a|a|93|95|97|a|a|a|a|98|66-02|a|a|a|a|a|93|94|a|a|95|a|a|96|98|99|810|a|91|a|a|92|93|95|96|97|98|99|820|a|a|93|a|94|a|95|a|a|a|a|96|97|830|67-01|93|94|96|810|91|94|a|95|a|a|a|a|a|96|97|820|91|a|93|a|a|94|95|96|99","sep":"|"}]}]);
const COLONY = [
{"id":"n-a55d3970","guard":[["not",["hasAny",["add","angeles","az","china","close","compare","confirmed","death","end","greater","high","incident","larger","lesser","makes","national","open","price","programme","proposal","rate","recovered","smaller","start","temp","title"]]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-b69ceef0","guard":[["hasAny",["appears in","contains","date","element","includes","item number","nth","position"]],["has","published"]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-72341e2c","guard":[["not",["hasAny",["20200430","20200501","20200510","20200728","20201130","20210219","20210330","20211229","20220302","20220314","add","angeles","az","china","close","compare","confirmed","death","end","greater","high","incident","larger","lesser","makes","national","open","price","programme","proposal","rate","recovered","smaller","sp500","start","sum","temp","title","us"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-abb925c1","guard":[["hasAny",["date","element","item number","nth","position"]],["has","published"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-1a462619","guard":[["not",["hasAny",["20200430","20200501","20200510","20200728","20201130","20210219","20210330","20211229","20220302","20220314","add","angeles","az","china","close","compare","confirmed","death","end","greater","high","incident","larger","lesser","makes","national","open","price","programme","proposal","rate","recovered","smaller","sp500","start","sum","temp","title","us"]]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-2abedad3","guard":[["hasAny",["date","element","invert case","item number","nth","position","swap case","toggle case"]],["has","published"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-7171dc06","guard":[["not",["hasAny",["20200430","20200501","20200510","20200728","20201130","20210219","20210330","20211229","20220302","20220314","add","angeles","az","china","close","compare","confirmed","death","end","greater","high","incident","larger","lesser","makes","national","open","price","programme","proposal","rate","recovered","smaller","sp500","start","sum","temp","title","us"]]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-95024311","guard":[["hasAny",["date","element","item number","lower case","lowercase","nth","position","small letters"]],["has","published"]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-98de4dfb","guard":[["hasAny",["all caps","capital letters","capitals","date","element","item number","nth","position","upper case","uppercase"]],["has","published"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-a5353b0a","guard":[["not",["hasAny",["20200430","20200501","20200510","20200728","20201130","20210219","20210330","20211229","20220302","20220314","add","angeles","az","china","close","compare","confirmed","death","end","greater","high","incident","larger","lesser","makes","national","open","price","programme","proposal","rate","recovered","smaller","sp500","start","sum","temp","title","us"]]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-ca883b0f","guard":[["not",["hasAny",["20200430","20200501","20200510","20200728","20201130","20210219","20210330","20211229","20220302","20220314","add","angeles","az","china","close","compare","confirmed","death","end","greater","high","incident","larger","lesser","makes","national","open","price","programme","proposal","rate","recovered","smaller","sp500","start","sum","temp","title","us"]]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-d1d21f3a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","date","element","item number","nth","position","title case"]],["has","published"]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-771d1089","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2022-10-12":"The name whose date published is 2022-10-12 is Kransekake (Norwegian Almond Ring Cake).","name the name whose date published is 2023-04-26":"The name whose date published is 2023-04-26 is Pannekaken (Norwegian Pancakes).","name the name whose date published is 2025-03-04":"The name whose date published is 2025-03-04 is Russian Tea Cakes.","which name has the date published 2022-06-10":"The name whose date published is 2022-06-10 is Scandinavian Sweetheart Waffles.","2022-10-29 is the date published of which name":"The name whose date published is 2022-10-29 is French Canadian Tourtière.","name the name whose date published is 2023-09-14":"The name whose date published is 2023-09-14 is Cuban-Style Yuca.","2013-06-20 is the date published of which name":"The name whose date published is 2013-06-20 is Finnish Oven Pancakes.","which name has the date published 2022-11-23":"The name whose date published is 2022-11-23 is Authentic Pad Thai.","which name has the date published 2019-05-29":"The name whose date published is 2019-05-29 is Tex-Mex Grilled Flank Steak.","2024-04-06 is the date published of which name":"The name whose date published is 2024-04-06 is Pashka.","2018-08-31 is the date published of which name":"The name whose date published is 2018-08-31 is Mango Ceviche.","2024-12-09 is the date published of which name":"The name whose date published is 2024-12-09 is German Lebkuchen.","name the name whose date published is 2024-07-18":"The name whose date published is 2024-07-18 is Fried Sweet Bananas.","2017-12-21 is the date published of which name":"The name whose date published is 2017-12-21 is Lebanese Fattoush.","which name has the date published 2023-01-19":"The name whose date published is 2023-01-19 is Potato Klubb (Norwegian Potato Dumplings).","2025-07-26 is the date published of which name":"The name whose date published is 2025-07-26 is Italian Cherry Margarita.","which name has the date published 2020-06-16":"The name whose date published is 2020-06-16 is Creamy Israeli-Style Hummus.","which name has the date published 2023-01-26":"The name whose date published is 2023-01-26 is Beef Bulgogi.","name the name whose date published is 2024-09-28":"The name whose date published is 2024-09-28 is Classic Spanish Sangria.","2023-04-11 is the date published of which name":"The name whose date published is 2023-04-11 is Manjar (Dulce de Leche) from Scratch.","which name has the date published 2024-09-04":"The name whose date published is 2024-09-04 is Easy King Ranch Chicken Casserole.","which name has the date published 2022-09-11":"The name whose date published is 2022-09-11 is Thai Red Chicken Curry.","2022-09-26 is the date published of which name":"The name whose date published is 2022-09-26 is Isa's Cola de Mono.","2023-11-27 is the date published of which name":"The name whose date published is 2023-11-27 is Classic Swiss Fondue.","which name has the date published 2024-08-03":"The name whose date published is 2024-08-03 is Khao Soi Soup.","2023-01-24 is the date published of which name":"The name whose date published is 2023-01-24 is Persian Cucumber Yogurt (Maast-o Khiar).","2025-05-01 is the date published of which name":"The name whose date published is 2025-05-01 is Vegetarian Huevo Saltado.","which name has the date published 2023-04-25":"The name whose date published is 2023-04-25 is Spinach Quiche with Chicken.","2012-02-19 is the date published of which name":"The name whose date published is 2012-02-19 is Middle Eastern-Style Dolma (Stuffed Vegetables).","2023-03-31 is the date published of which name":"The name whose date published is 2023-03-31 is Traditional Gyros.","2023-11-08 is the date published of which name":"The name whose date published is 2023-11-08 is Finnish Runeberg Tortes.","2023-06-09 is the date published of which name":"The name whose date published is 2023-06-09 is Thai Chicken.","name the name whose date published is 2024-05-10":"The name whose date published is 2024-05-10 is Light and Easy Greek Potato Salad.","name the name whose date published is 2011-02-11":"The name whose date published is 2011-02-11 is Creamy Manjar (Dulce de Leche).","name the name whose date published is 2021-02-10":"The name whose date published is 2021-02-10 is Broa (Portuguese Cornbread).","which name has the date published 2021-07-07":"The name whose date published is 2021-07-07 is Russian Carrot Salad (Korean-Style).","which name has the date published 2019-07-04":"The name whose date published is 2019-07-04 is Grilled Pollo a la Brasa.","which name has the date published 2022-11-20":"The name whose date published is 2022-11-20 is Quick Whole Wheat Chapati.","name the name whose date published is 2024-08-24":"The name whose date published is 2024-08-24 is Amish Peanut Butter.","name the name whose date published is 2024-05-07":"The name whose date published is 2024-05-07 is Bannock.","2022-02-15 is the date published of which name":"The name whose date published is 2022-02-15 is Swedish Cream.","2024-06-14 is the date published of which name":"The name whose date published is 2024-06-14 is Ultimate Lowcountry Shrimp and Grits.","name the name whose date published is 2025-02-17":"The name whose date published is 2025-02-17 is Vietnamese Sandwich.","which name has the date published 2022-07-12":"The name whose date published is 2022-07-12 is German Pork Chops and Sauerkraut.","name the name whose date published is 2022-12-09":"The name whose date published is 2022-12-09 is Caramel-Coated Catfish.","which name has the date published 2021-08-09":"The name whose date published is 2021-08-09 is Lamb Shawarma.","which name has the date published 2020-02-19":"The name whose date published is 2020-02-19 is Bill's Peruvian Chicken and Rice.","name the name whose date published is 2023-03-20":"The name whose date published is 2023-03-20 is Thịt Bò Xào Đậu (Vietnamese Stir-Fried Beef and Green Beans).","which name has the date published 2024-09-30":"The name whose date published is 2024-09-30 is Sheet Pan General Tso's Chicken and Broccoli.","2024-03-12 is the date published of which name":"The name whose date published is 2024-03-12 is Turkish Doner Kebab.","which name has the date published 2023-01-18":"The name whose date published is 2023-01-18 is Wet-Bottom Shoofly Pie.","which name has the date published 2023-01-27":"The name whose date published is 2023-01-27 is Norwegian Potato Klub.","name the name whose date published is 2022-10-26":"The name whose date published is 2022-10-26 is Punjabi Chicken in Thick Gravy.","2023-05-01 is the date published of which name":"The name whose date published is 2023-05-01 is Omelet in a Bag.","which name has the date published 2022-10-07":"The name whose date published is 2022-10-07 is Nuoc Cham Sauce.","name the name whose date published is 2024-09-19":"The name whose date published is 2024-09-19 is Famous Chicken Adobo.","2022-11-21 is the date published of which name":"The name whose date published is 2022-11-21 is Greek Butter Cookies.","name the name whose date published is 2025-04-25":"The name whose date published is 2025-04-25 is French Crêpes.","name the name whose date published is 2019-06-22":"The name whose date published is 2019-06-22 is Puerto Rican Rice and Beans (Arroz con Gandules).","2022-09-27 is the date published of which name":"The name whose date published is 2022-09-27 is Thai Monkfish Curry.","name the name whose date published is 2023-04-18":"The name whose date published is 2023-04-18 is Chicken in Black Bean Sauce.","2022-12-12 is the date published of which name":"The name whose date published is 2022-12-12 is Brazilian-Style Beef Ribs.","2019-07-10 is the date published of which name":"The name whose date published is 2019-07-10 is Lebanese Chicken Shawarma.","2024-10-16 is the date published of which name":"The name whose date published is 2024-10-16 is Phyllis’s Braised Collard Greens.","name the name whose date published is 2024-03-16":"The name whose date published is 2024-03-16 is Vietnamese Beef Pho.","which name has the date published 2023-03-23":"The name whose date published is 2023-03-23 is Muhammara (Roasted Pepper & Walnut Spread).","which name has the date published 2023-03-17":"The name whose date published is 2023-03-17 is Butter Mochi Cupcakes.","name the name whose date published is 2018-04-06":"The name whose date published is 2018-04-06 is Sizzling Steak Fajitas.","which name has the date published 2022-01-21":"The name whose date published is 2022-01-21 is Baked Falafel.","name the name whose date published is 2021-09-21":"The name whose date published is 2021-09-21 is Brazilian Carrot Cake.","2022-09-28 is the date published of which name":"The name whose date published is 2022-09-28 is Filipino Corned Beef and Cabbage.","which name has the date published 2025-05-13":"The name whose date published is 2025-05-13 is Aji (Colombian Salsa).","2023-05-03 is the date published of which name":"The name whose date published is 2023-05-03 is Oladi (Russian Kefir Pancakes).","which name has the date published 2024-02-19":"The name whose date published is 2024-02-19 is Kuku Sabzi.","name the name whose date published is 2012-01-06":"The name whose date published is 2012-01-06 is Apple Danish Bars.","which name has the date published 2023-07-31":"The name whose date published is 2023-07-31 is Pasta de Sardine.","2023-02-19 is the date published of which name":"The name whose date published is 2023-02-19 is Chicken Makhani (Indian Butter Chicken).","2014-06-10 is the date published of which name":"The name whose date published is 2014-06-10 is South African-Inspired Butternut Soup.","name the name whose date published is 2023-09-26":"The name whose date published is 2023-09-26 is Chômeur's Pudding.","2025-07-17 is the date published of which name":"The name whose date published is 2025-07-17 is Jamaican Brown Stew Chicken.","which name has the date published 2023-03-06":"The name whose date published is 2023-03-06 is Shirini Nargili.","name the name whose date published is 2023-05-31":"The name whose date published is 2023-05-31 is Southern-Style Chocolate Gravy.","which name has the date published 2022-06-30":"The name whose date published is 2022-06-30 is Pakistani Chicken Karahi.","name the name whose date published is 2024-03-10":"The name whose date published is 2024-03-10 is Pork Roast and Sauerkraut.","name the name whose date published is 2024-06-18":"The name whose date published is 2024-06-18 is Swedish Sticky Chocolate Cake (Kladdkaka).","which name has the date published 2024-03-20":"The name whose date published is 2024-03-20 is Gochujang-Sauced Air Fryer Cauliflower Bites.","name the name whose date published is 2024-04-26":"The name whose date published is 2024-04-26 is Honey Walnut Shrimp.","which name has the date published 2024-07-19":"The name whose date published is 2024-07-19 is Greek Turkey Meatballs.","name the name whose date published is 2020-04-07":"The name whose date published is 2020-04-07 is Spicy Sambal Shrimp.","which name has the date published 2024-09-08":"The name whose date published is 2024-09-08 is Air Fryer Chicken Parmesan.","name the name whose date published is 2023-01-25":"The name whose date published is 2023-01-25 is Goat Stew.","which name has the date published 2025-03-19":"The name whose date published is 2025-03-19 is Best Matzo Balls.","2009-02-09 is the date published of which name":"The name whose date published is 2009-02-09 is Havregrynskugler (Danish Oat Balls).","name the name whose date published is 2022-10-05":"The name whose date published is 2022-10-05 is Date Loaf Cake.","name the name whose date published is 2024-01-22":"The name whose date published is 2024-01-22 is Corned Beef Roast.","2020-02-24 is the date published of which name":"The name whose date published is 2020-02-24 is Russian Garden Salad.","which name has the date published 2022-05-23":"The name whose date published is 2022-05-23 is Cherry Amish Friendship Bread Cupcakes with Buttercream Frosting.","which name has the date published 2022-12-27":"The name whose date published is 2022-12-27 is Authentic Empanada Pastry Dough.","name the name whose date published is 2025-02-23":"The name whose date published is 2025-02-23 is Best Jambalaya.","2024-07-20 is the date published of which name":"The name whose date published is 2024-07-20 is Tartufo."}}},
{"id":"n-01cb348c","guard":[["hasAny",["appears in","contains","date","element","includes","item number","nth","position"]],["has","published"]],"pyramid":["render.yesNo",["compare.contains",["sense.before",{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}]],["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-c72df58d","guard":[["not",["has","death"]]],"pyramid":["render.yesNo",["compare.contains",["sense.before",{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}]],["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-0e1718df","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose date ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-b4bb2234","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," published is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-31941972","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-38614e20","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-6244efb9","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," published is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-7a1d3f65","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":6}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-f140c556","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-02e91520","guard":[["hasAny",["element","has","item number","lower case","lowercase","nth","position","small letters","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-1e4ac1aa","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-803d6e3b","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":6}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-87d4b77b","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-a983030e","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-12fefbe0","guard":[["hasAny",["element","has","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-f06ceb07","guard":[["hasAny",["element","has","item number","lower case","lowercase","nth","position","small letters","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-fe96b8e9","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"the name whose date published is 2022-10-12":"The name whose date published is 2022-10-12 is Kransekake (Norwegian Almond Ring Cake).","the name whose date published is 2023-04-26":"The name whose date published is 2023-04-26 is Pannekaken (Norwegian Pancakes).","the name whose date published is 2025-03-04":"The name whose date published is 2025-03-04 is Russian Tea Cakes.","has the date published 2022-06-10":"The name whose date published is 2022-06-10 is Scandinavian Sweetheart Waffles.","the name whose date published is 2023-09-14":"The name whose date published is 2023-09-14 is Cuban-Style Yuca.","has the date published 2022-11-23":"The name whose date published is 2022-11-23 is Authentic Pad Thai.","has the date published 2019-05-29":"The name whose date published is 2019-05-29 is Tex-Mex Grilled Flank Steak.","the name whose date published is 2024-07-18":"The name whose date published is 2024-07-18 is Fried Sweet Bananas.","has the date published 2023-01-19":"The name whose date published is 2023-01-19 is Potato Klubb (Norwegian Potato Dumplings).","has the date published 2020-06-16":"The name whose date published is 2020-06-16 is Creamy Israeli-Style Hummus.","has the date published 2023-01-26":"The name whose date published is 2023-01-26 is Beef Bulgogi.","the name whose date published is 2024-09-28":"The name whose date published is 2024-09-28 is Classic Spanish Sangria.","has the date published 2024-09-04":"The name whose date published is 2024-09-04 is Easy King Ranch Chicken Casserole.","has the date published 2022-09-11":"The name whose date published is 2022-09-11 is Thai Red Chicken Curry.","has the date published 2024-08-03":"The name whose date published is 2024-08-03 is Khao Soi Soup.","has the date published 2023-04-25":"The name whose date published is 2023-04-25 is Spinach Quiche with Chicken.","the name whose date published is 2024-05-10":"The name whose date published is 2024-05-10 is Light and Easy Greek Potato Salad.","the name whose date published is 2011-02-11":"The name whose date published is 2011-02-11 is Creamy Manjar (Dulce de Leche).","the name whose date published is 2021-02-10":"The name whose date published is 2021-02-10 is Broa (Portuguese Cornbread).","has the date published 2021-07-07":"The name whose date published is 2021-07-07 is Russian Carrot Salad (Korean-Style).","has the date published 2019-07-04":"The name whose date published is 2019-07-04 is Grilled Pollo a la Brasa.","has the date published 2022-11-20":"The name whose date published is 2022-11-20 is Quick Whole Wheat Chapati.","the name whose date published is 2024-08-24":"The name whose date published is 2024-08-24 is Amish Peanut Butter.","the name whose date published is 2024-05-07":"The name whose date published is 2024-05-07 is Bannock.","the name whose date published is 2025-02-17":"The name whose date published is 2025-02-17 is Vietnamese Sandwich.","has the date published 2022-07-12":"The name whose date published is 2022-07-12 is German Pork Chops and Sauerkraut.","the name whose date published is 2022-12-09":"The name whose date published is 2022-12-09 is Caramel-Coated Catfish.","has the date published 2021-08-09":"The name whose date published is 2021-08-09 is Lamb Shawarma.","has the date published 2020-02-19":"The name whose date published is 2020-02-19 is Bill's Peruvian Chicken and Rice.","the name whose date published is 2023-03-20":"The name whose date published is 2023-03-20 is Thịt Bò Xào Đậu (Vietnamese Stir-Fried Beef and Green Beans).","has the date published 2024-09-30":"The name whose date published is 2024-09-30 is Sheet Pan General Tso's Chicken and Broccoli.","has the date published 2023-01-18":"The name whose date published is 2023-01-18 is Wet-Bottom Shoofly Pie.","has the date published 2023-01-27":"The name whose date published is 2023-01-27 is Norwegian Potato Klub.","the name whose date published is 2022-10-26":"The name whose date published is 2022-10-26 is Punjabi Chicken in Thick Gravy.","has the date published 2022-10-07":"The name whose date published is 2022-10-07 is Nuoc Cham Sauce.","the name whose date published is 2024-09-19":"The name whose date published is 2024-09-19 is Famous Chicken Adobo.","the name whose date published is 2025-04-25":"The name whose date published is 2025-04-25 is French Crêpes.","the name whose date published is 2019-06-22":"The name whose date published is 2019-06-22 is Puerto Rican Rice and Beans (Arroz con Gandules).","the name whose date published is 2023-04-18":"The name whose date published is 2023-04-18 is Chicken in Black Bean Sauce.","the name whose date published is 2024-03-16":"The name whose date published is 2024-03-16 is Vietnamese Beef Pho.","has the date published 2023-03-23":"The name whose date published is 2023-03-23 is Muhammara (Roasted Pepper & Walnut Spread).","has the date published 2023-03-17":"The name whose date published is 2023-03-17 is Butter Mochi Cupcakes.","the name whose date published is 2018-04-06":"The name whose date published is 2018-04-06 is Sizzling Steak Fajitas.","has the date published 2022-01-21":"The name whose date published is 2022-01-21 is Baked Falafel.","the name whose date published is 2021-09-21":"The name whose date published is 2021-09-21 is Brazilian Carrot Cake.","has the date published 2025-05-13":"The name whose date published is 2025-05-13 is Aji (Colombian Salsa).","has the date published 2024-02-19":"The name whose date published is 2024-02-19 is Kuku Sabzi.","the name whose date published is 2012-01-06":"The name whose date published is 2012-01-06 is Apple Danish Bars.","has the date published 2023-07-31":"The name whose date published is 2023-07-31 is Pasta de Sardine.","the name whose date published is 2023-09-26":"The name whose date published is 2023-09-26 is Chômeur's Pudding.","has the date published 2023-03-06":"The name whose date published is 2023-03-06 is Shirini Nargili.","the name whose date published is 2023-05-31":"The name whose date published is 2023-05-31 is Southern-Style Chocolate Gravy.","has the date published 2022-06-30":"The name whose date published is 2022-06-30 is Pakistani Chicken Karahi.","the name whose date published is 2024-03-10":"The name whose date published is 2024-03-10 is Pork Roast and Sauerkraut.","the name whose date published is 2024-06-18":"The name whose date published is 2024-06-18 is Swedish Sticky Chocolate Cake (Kladdkaka).","has the date published 2024-03-20":"The name whose date published is 2024-03-20 is Gochujang-Sauced Air Fryer Cauliflower Bites.","the name whose date published is 2024-04-26":"The name whose date published is 2024-04-26 is Honey Walnut Shrimp.","has the date published 2024-07-19":"The name whose date published is 2024-07-19 is Greek Turkey Meatballs.","the name whose date published is 2020-04-07":"The name whose date published is 2020-04-07 is Spicy Sambal Shrimp.","has the date published 2024-09-08":"The name whose date published is 2024-09-08 is Air Fryer Chicken Parmesan.","the name whose date published is 2023-01-25":"The name whose date published is 2023-01-25 is Goat Stew.","has the date published 2025-03-19":"The name whose date published is 2025-03-19 is Best Matzo Balls.","the name whose date published is 2022-10-05":"The name whose date published is 2022-10-05 is Date Loaf Cake.","the name whose date published is 2024-01-22":"The name whose date published is 2024-01-22 is Corned Beef Roast.","has the date published 2022-05-23":"The name whose date published is 2022-05-23 is Cherry Amish Friendship Bread Cupcakes with Buttercream Frosting.","has the date published 2022-12-27":"The name whose date published is 2022-12-27 is Authentic Empanada Pastry Dough.","the name whose date published is 2025-02-23":"The name whose date published is 2025-02-23 is Best Jambalaya."}}},
{"id":"n-0f557218","guard":[["not",["hasAny",["angeles","az","china","close","confirmed","death","high","larger","national","open","price","rate","recovered","smaller","temp","title"]]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["sense.after",{"lit":"is"}]],["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-549e0bf0","guard":[["hasAny",["appears in","contains","date","element","has","includes","item number","nth","position"]],["has","published"]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["sense.after",{"lit":"is"}]],["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-f4a634b8","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"published"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-07c4564d","guard":[["hasAny",["element","has","item number","nth","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-537d1ba7","guard":[["hasAny",["dashes","element","has","hyphens","item number","kebab case","kebabcase","nth","position","slug"]]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.kebab",["sense.after",{"lit":"published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-6bb36e36","guard":[["hasAny",["element","has","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.noVowels",["sense.after",{"lit":"published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-b417dbce","guard":[["hasAny",["element","has","item number","nth","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," published is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-bbf420c1","guard":[["hasAny",["element","has","item number","nth","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.reverseWords",["sense.after",{"lit":"published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-64315d98","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"published"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-43e8ea7d","guard":[["hasAny",["dashes","element","has","hyphens","item number","kebab case","kebabcase","nth","position","slug"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.kebab",["sense.after",{"lit":"published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-6c9e5b14","guard":[["hasAny",["element","has","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.noVowels",["sense.after",{"lit":"published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-97cccebf","guard":[["hasAny",["element","has","item number","nth","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.reverseWords",["sense.after",{"lit":"published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-b3cda03a","guard":[["hasAny",["element","has","item number","nth","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":6}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-be70e155","guard":[["hasAny",["element","has","item number","nth","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-d79a8941","guard":[["hasAny",["element","has","item number","nth","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-4b1efbd9","guard":[["hasAny",["element","has","item number","nth","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.words"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-85d576e6","guard":[["hasAny",["element","has","item number","nth","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-bff63a52","guard":[["hasAny",["element","has","item number","lower case","lowercase","nth","position","small letters"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-ed69442c","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.pascal",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-9f2ae003","guard":[["hasAny",["element","item number","nth","of","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date published is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-633af770","guard":[["hasAny",["element","item number","nth","of","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["sense.before",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-67f64fe3","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," published is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-c3094a43","guard":[["hasAny",["element","item number","no vowels","nth","of","position","remove vowels","without vowels"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-ddd96aa1","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","nth","of","position","slug"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["transform.kebab",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-e0b10b87","guard":[["hasAny",["element","item number","nth","of","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose date ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-f9adfd1b","guard":[["hasAny",["element","item number","nth","of","position","reverse the words","reverse word order","words backwards"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["transform.reverseWords",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-0fc0d043","guard":[["hasAny",["element","item number","nth","of","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-48993523","guard":[["hasAny",["element","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-5970cf42","guard":[["hasAny",["element","item number","nth","of","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-d57b3ccc","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["sense.before",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-00bbfb1d","guard":[["hasAny",["element","item number","nth","of","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-034d1dc3","guard":[["hasAny",["element","item number","no vowels","nth","position","remove vowels","whose","without vowels"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.noVowels",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-68ffafbd","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-6a646565","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","nth","position","slug","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.kebab",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-7b3d83f4","guard":[["hasAny",["element","invert case","item number","nth","of","position","swap case","toggle case"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-b96b89c9","guard":[["hasAny",["element","item number","no vowels","nth","of","position","remove vowels","shortest","shortest one","shortest word","without vowels"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-c8ad6110","guard":[["hasAny",["class name","element","item number","nth","of","pascal case","pascalcase","position","upper camel case"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.lastWord"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-ca8d21ff","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","nth","of","position","shortest","shortest one","shortest word","slug"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.kebab",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-db907f0a","guard":[["hasAny",["element","item number","lower case","lowercase","nth","of","position","small letters"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-f55c0ed5","guard":[["hasAny",["element","item number","nth","of","position","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.reverseWords",["sense.before",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-fc7c9c0b","guard":[["hasAny",["element","item number","nth","position","reverse the words","reverse word order","whose","words backwards"]],["has","published"]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.reverseWords",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-17721259","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-2321f405","guard":[["hasAny",["element","item number","nth","of","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-7ef2881b","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-83c326a0","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-d37d3ac7","guard":[["hasAny",["element","item number","nth","of","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-f17a926d","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-80bb1d09","guard":[["hasAny",["class name","element","item number","nth","of","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.pascal",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-9652c358","guard":[["hasAny",["element","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-9812b88b","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-c3927977","guard":[["hasAny",["element","item number","lower case","lowercase","nth","of","position","shortest","shortest one","shortest word","small letters"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]]],"mem":null},
{"id":"n-de16a83f","guard":[["hasAny",["element","item number","nth","of","position"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-e06c9433","guard":[["hasAny",["element","invert case","item number","nth","of","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.swapCase",["sense.lastWord"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-eb4a491a","guard":[["hasAny",["delete","element","item number","nth","of","position","remove","strip out","without"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":5}],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-1a7b076b","guard":[["hasAny",["element","item number","nth","position","reverse the words","reverse word order","whose","words backwards"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.reverseWords",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-33018a4f","guard":[["hasAny",["element","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-35be790b","guard":[["hasAny",["element","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-5f6c9be9","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-645f44a0","guard":[["hasAny",["each word","element","item number","nth","of","position","shortest","shortest one","shortest word","split into words","words"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["render.list",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-6a4ee02a","guard":[["hasAny",["element","item number","nth","of","position","shortest","shortest one","shortest word"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-6ca25ef8","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","nth","position","slug","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.kebab",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-858a17f8","guard":[["hasAny",["each word","element","item number","nth","of","position","shortest","shortest one","shortest word","split into words","words"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["render.and",["transform.words",["sense.lastWord"]]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-a7a9dbb7","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-fa13bb6c","guard":[["hasAny",["element","item number","no vowels","nth","position","remove vowels","whose","without vowels"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.noVowels",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-15b6d79e","guard":[["hasAny",["delete","element","item number","nth","of","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-88e6dad2","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","position","upper camel case","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-ab073b01","guard":[["hasAny",["element","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.words"],["sense.howMany"]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-d53fe170","guard":[["hasAny",["class name","element","item number","nth","pascal case","pascalcase","position","upper camel case","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.pascal",["sense.wordAt",{"lit":1}]],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-d54d7843","guard":[["hasAny",["element","item number","nth","position","whose"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.words"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-33f52475","guard":[["has","date"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"of"}]]],"mem":{"table":{"2022-10-29 is the date published":"The name whose date published is 2022-10-29 is French Canadian Tourtière.","2013-06-20 is the date published":"The name whose date published is 2013-06-20 is Finnish Oven Pancakes.","2024-04-06 is the date published":"The name whose date published is 2024-04-06 is Pashka.","2018-08-31 is the date published":"The name whose date published is 2018-08-31 is Mango Ceviche.","2024-12-09 is the date published":"The name whose date published is 2024-12-09 is German Lebkuchen.","2017-12-21 is the date published":"The name whose date published is 2017-12-21 is Lebanese Fattoush.","2025-07-26 is the date published":"The name whose date published is 2025-07-26 is Italian Cherry Margarita.","2023-04-11 is the date published":"The name whose date published is 2023-04-11 is Manjar (Dulce de Leche) from Scratch.","2022-09-26 is the date published":"The name whose date published is 2022-09-26 is Isa's Cola de Mono.","2023-11-27 is the date published":"The name whose date published is 2023-11-27 is Classic Swiss Fondue.","2023-01-24 is the date published":"The name whose date published is 2023-01-24 is Persian Cucumber Yogurt (Maast-o Khiar).","2025-05-01 is the date published":"The name whose date published is 2025-05-01 is Vegetarian Huevo Saltado.","2012-02-19 is the date published":"The name whose date published is 2012-02-19 is Middle Eastern-Style Dolma (Stuffed Vegetables).","2023-03-31 is the date published":"The name whose date published is 2023-03-31 is Traditional Gyros.","2023-11-08 is the date published":"The name whose date published is 2023-11-08 is Finnish Runeberg Tortes.","2023-06-09 is the date published":"The name whose date published is 2023-06-09 is Thai Chicken.","2022-02-15 is the date published":"The name whose date published is 2022-02-15 is Swedish Cream.","2024-06-14 is the date published":"The name whose date published is 2024-06-14 is Ultimate Lowcountry Shrimp and Grits.","2024-03-12 is the date published":"The name whose date published is 2024-03-12 is Turkish Doner Kebab.","2023-05-01 is the date published":"The name whose date published is 2023-05-01 is Omelet in a Bag.","2022-11-21 is the date published":"The name whose date published is 2022-11-21 is Greek Butter Cookies.","2022-09-27 is the date published":"The name whose date published is 2022-09-27 is Thai Monkfish Curry.","2022-12-12 is the date published":"The name whose date published is 2022-12-12 is Brazilian-Style Beef Ribs.","2019-07-10 is the date published":"The name whose date published is 2019-07-10 is Lebanese Chicken Shawarma.","2024-10-16 is the date published":"The name whose date published is 2024-10-16 is Phyllis’s Braised Collard Greens.","2022-09-28 is the date published":"The name whose date published is 2022-09-28 is Filipino Corned Beef and Cabbage.","2023-05-03 is the date published":"The name whose date published is 2023-05-03 is Oladi (Russian Kefir Pancakes).","2023-02-19 is the date published":"The name whose date published is 2023-02-19 is Chicken Makhani (Indian Butter Chicken).","2014-06-10 is the date published":"The name whose date published is 2014-06-10 is South African-Inspired Butternut Soup.","2025-07-17 is the date published":"The name whose date published is 2025-07-17 is Jamaican Brown Stew Chicken.","2009-02-09 is the date published":"The name whose date published is 2009-02-09 is Havregrynskugler (Danish Oat Balls).","2020-02-24 is the date published":"The name whose date published is 2020-02-24 is Russian Garden Salad.","2024-07-20 is the date published":"The name whose date published is 2024-07-20 is Tartufo."}}},
{"id":"n-30d449dd","guard":[["hasAny",["element","item number","normalise","normalize","nth","of","position","simplify the text"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.norm",["sense.lastWord"],["sense.second"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-c5bfce12","guard":[["hasAny",["element","item number","normalise","normalize","nth","of","position","shortest","shortest one","shortest word","simplify the text"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.norm",["sense.lastWord"],["sense.second"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-b6e5f90c","guard":[["hasAny",["element","is","item number","normalise","normalize","nth","position","simplify the text"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose date ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.norm",["sense.lastWord"],["sense.last"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-8b6a871c","guard":[["hasAny",["element","is","item number","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]],["has","published"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.norm",["sense.lastWord"],["sense.last"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}]],"mem":null},
{"id":"n-72c86acb","guard":[["hasAny",["element","has","item number","normalise","normalize","nth","position","simplify the text"]],["has","name"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"}],{"lit":1}],{"lit":"fr-tidytuesday-cuisines-ce1912"},{"lit":"date published"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-04b11eb9","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2020-04-07":"The name whose date published is 2020-04-07 is Spicy Sambal Shrimp."}}},
{"id":"n-06b8d585","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2022-06-10":"The name whose date published is 2022-06-10 is Scandinavian Sweetheart Waffles."}}},
{"id":"n-07a337a6","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2012-01-06":"The name whose date published is 2012-01-06 is Apple Danish Bars."}}},
{"id":"n-0b23df11","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-09-26 is the date published of which name":"The name whose date published is 2022-09-26 is Isa's Cola de Mono."}}},
{"id":"n-12ca5a83","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2024-02-19":"The name whose date published is 2024-02-19 is Kuku Sabzi."}}},
{"id":"n-13035dc7","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2024-03-20":"The name whose date published is 2024-03-20 is Gochujang-Sauced Air Fryer Cauliflower Bites."}}},
{"id":"n-18b28536","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-09-19":"The name whose date published is 2024-09-19 is Famous Chicken Adobo."}}},
{"id":"n-19119893","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2022-12-09":"The name whose date published is 2022-12-09 is Caramel-Coated Catfish."}}},
{"id":"n-219db901","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2023-03-17":"The name whose date published is 2023-03-17 is Butter Mochi Cupcakes."}}},
{"id":"n-27b73c8c","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2022-10-05":"The name whose date published is 2022-10-05 is Date Loaf Cake."}}},
{"id":"n-2a852880","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-09-27 is the date published of which name":"The name whose date published is 2022-09-27 is Thai Monkfish Curry."}}},
{"id":"n-2d4b1a29","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2023-03-20":"The name whose date published is 2023-03-20 is Thịt Bò Xào Đậu (Vietnamese Stir-Fried Beef and Green Beans)."}}},
{"id":"n-2df91aad","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2025-03-04":"The name whose date published is 2025-03-04 is Russian Tea Cakes."}}},
{"id":"n-338b70e9","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-01-24 is the date published of which name":"The name whose date published is 2023-01-24 is Persian Cucumber Yogurt (Maast-o Khiar)."}}},
{"id":"n-36d1c757","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-09-28":"The name whose date published is 2024-09-28 is Classic Spanish Sangria."}}},
{"id":"n-38a19d7e","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2023-04-26":"The name whose date published is 2023-04-26 is Pannekaken (Norwegian Pancakes)."}}},
{"id":"n-3991f031","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2023-03-23":"The name whose date published is 2023-03-23 is Muhammara (Roasted Pepper & Walnut Spread)."}}},
{"id":"n-3bac2e56","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2025-04-25":"The name whose date published is 2025-04-25 is French Crêpes."}}},
{"id":"n-3bb75092","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-12-12 is the date published of which name":"The name whose date published is 2022-12-12 is Brazilian-Style Beef Ribs."}}},
{"id":"n-3e3644c3","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-05-01 is the date published of which name":"The name whose date published is 2023-05-01 is Omelet in a Bag."}}},
{"id":"n-3ff84c51","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2011-02-11":"The name whose date published is 2011-02-11 is Creamy Manjar (Dulce de Leche)."}}},
{"id":"n-40ad19ab","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2023-09-26":"The name whose date published is 2023-09-26 is Chômeur's Pudding."}}},
{"id":"n-444fa7df","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2022-05-23":"The name whose date published is 2022-05-23 is Cherry Amish Friendship Bread Cupcakes with Buttercream Frosting."}}},
{"id":"n-486b16fb","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-04-11 is the date published of which name":"The name whose date published is 2023-04-11 is Manjar (Dulce de Leche) from Scratch."}}},
{"id":"n-49b95e69","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2023-04-25":"The name whose date published is 2023-04-25 is Spinach Quiche with Chicken."}}},
{"id":"n-4a5b6870","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2014-06-10 is the date published of which name":"The name whose date published is 2014-06-10 is South African-Inspired Butternut Soup."}}},
{"id":"n-4dc0646a","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2022-07-12":"The name whose date published is 2022-07-12 is German Pork Chops and Sauerkraut."}}},
{"id":"n-5000644e","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-09-28 is the date published of which name":"The name whose date published is 2022-09-28 is Filipino Corned Beef and Cabbage."}}},
{"id":"n-51f46064","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2009-02-09 is the date published of which name":"The name whose date published is 2009-02-09 is Havregrynskugler (Danish Oat Balls)."}}},
{"id":"n-5360ef3c","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-05-10":"The name whose date published is 2024-05-10 is Light and Easy Greek Potato Salad."}}},
{"id":"n-58d6bb8e","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-11-08 is the date published of which name":"The name whose date published is 2023-11-08 is Finnish Runeberg Tortes."}}},
{"id":"n-623a0f14","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2022-10-07":"The name whose date published is 2022-10-07 is Nuoc Cham Sauce."}}},
{"id":"n-637263e8","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2022-10-26":"The name whose date published is 2022-10-26 is Punjabi Chicken in Thick Gravy."}}},
{"id":"n-64974770","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2013-06-20 is the date published of which name":"The name whose date published is 2013-06-20 is Finnish Oven Pancakes."}}},
{"id":"n-652ea76d","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2023-01-18":"The name whose date published is 2023-01-18 is Wet-Bottom Shoofly Pie."}}},
{"id":"n-67e80acf","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-08-24":"The name whose date published is 2024-08-24 is Amish Peanut Butter."}}},
{"id":"n-68a51482","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-06-18":"The name whose date published is 2024-06-18 is Swedish Sticky Chocolate Cake (Kladdkaka)."}}},
{"id":"n-6a617c16","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2022-11-20":"The name whose date published is 2022-11-20 is Quick Whole Wheat Chapati."}}},
{"id":"n-6f7ceeed","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2021-09-21":"The name whose date published is 2021-09-21 is Brazilian Carrot Cake."}}},
{"id":"n-7274e270","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2020-06-16":"The name whose date published is 2020-06-16 is Creamy Israeli-Style Hummus."}}},
{"id":"n-7294970c","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2022-11-23":"The name whose date published is 2022-11-23 is Authentic Pad Thai."}}},
{"id":"n-7a51a175","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2023-07-31":"The name whose date published is 2023-07-31 is Pasta de Sardine."}}},
{"id":"n-7de0def8","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-03-10":"The name whose date published is 2024-03-10 is Pork Roast and Sauerkraut."}}},
{"id":"n-8251d087","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2025-03-19":"The name whose date published is 2025-03-19 is Best Matzo Balls."}}},
{"id":"n-826a27b1","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2023-03-06":"The name whose date published is 2023-03-06 is Shirini Nargili."}}},
{"id":"n-827216f6","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-02-24 is the date published of which name":"The name whose date published is 2020-02-24 is Russian Garden Salad."}}},
{"id":"n-864c23da","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2022-01-21":"The name whose date published is 2022-01-21 is Baked Falafel."}}},
{"id":"n-87443c2a","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2018-04-06":"The name whose date published is 2018-04-06 is Sizzling Steak Fajitas."}}},
{"id":"n-879383a2","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2021-02-10":"The name whose date published is 2021-02-10 is Broa (Portuguese Cornbread)."}}},
{"id":"n-8a839bac","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2018-08-31 is the date published of which name":"The name whose date published is 2018-08-31 is Mango Ceviche."}}},
{"id":"n-8c205ad0","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-02-19 is the date published of which name":"The name whose date published is 2023-02-19 is Chicken Makhani (Indian Butter Chicken)."}}},
{"id":"n-8cb8f4c0","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-11-27 is the date published of which name":"The name whose date published is 2023-11-27 is Classic Swiss Fondue."}}},
{"id":"n-8e357103","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2023-01-25":"The name whose date published is 2023-01-25 is Goat Stew."}}},
{"id":"n-925c2a64","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-06-09 is the date published of which name":"The name whose date published is 2023-06-09 is Thai Chicken."}}},
{"id":"n-93ee5213","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2025-05-13":"The name whose date published is 2025-05-13 is Aji (Colombian Salsa)."}}},
{"id":"n-9bbaf5f6","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-01-22":"The name whose date published is 2024-01-22 is Corned Beef Roast."}}},
{"id":"n-a0a92e3d","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-04-26":"The name whose date published is 2024-04-26 is Honey Walnut Shrimp."}}},
{"id":"n-a12876e7","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2023-01-19":"The name whose date published is 2023-01-19 is Potato Klubb (Norwegian Potato Dumplings)."}}},
{"id":"n-a443849b","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-02-15 is the date published of which name":"The name whose date published is 2022-02-15 is Swedish Cream."}}},
{"id":"n-a659ba3e","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2019-06-22":"The name whose date published is 2019-06-22 is Puerto Rican Rice and Beans (Arroz con Gandules)."}}},
{"id":"n-ab61bc0e","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2024-09-04":"The name whose date published is 2024-09-04 is Easy King Ranch Chicken Casserole."}}},
{"id":"n-ac2603e2","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-11-21 is the date published of which name":"The name whose date published is 2022-11-21 is Greek Butter Cookies."}}},
{"id":"n-b30b661e","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2021-07-07":"The name whose date published is 2021-07-07 is Russian Carrot Salad (Korean-Style)."}}},
{"id":"n-b3b5b121","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-03-12 is the date published of which name":"The name whose date published is 2024-03-12 is Turkish Doner Kebab."}}},
{"id":"n-b6821113","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-10-16 is the date published of which name":"The name whose date published is 2024-10-16 is Phyllis’s Braised Collard Greens."}}},
{"id":"n-b9c994e6","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2024-09-08":"The name whose date published is 2024-09-08 is Air Fryer Chicken Parmesan."}}},
{"id":"n-bc6ce335","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-06-14 is the date published of which name":"The name whose date published is 2024-06-14 is Ultimate Lowcountry Shrimp and Grits."}}},
{"id":"n-bfc4a053","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-12-21 is the date published of which name":"The name whose date published is 2017-12-21 is Lebanese Fattoush."}}},
{"id":"n-c1652f79","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2019-07-10 is the date published of which name":"The name whose date published is 2019-07-10 is Lebanese Chicken Shawarma."}}},
{"id":"n-c5d108c7","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2024-08-03":"The name whose date published is 2024-08-03 is Khao Soi Soup."}}},
{"id":"n-c5f8f7a1","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2021-08-09":"The name whose date published is 2021-08-09 is Lamb Shawarma."}}},
{"id":"n-c642e986","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2023-01-27":"The name whose date published is 2023-01-27 is Norwegian Potato Klub."}}},
{"id":"n-c70c9744","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-04-06 is the date published of which name":"The name whose date published is 2024-04-06 is Pashka."}}},
{"id":"n-c887db7c","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2025-07-26 is the date published of which name":"The name whose date published is 2025-07-26 is Italian Cherry Margarita."}}},
{"id":"n-c91d468c","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2023-05-31":"The name whose date published is 2023-05-31 is Southern-Style Chocolate Gravy."}}},
{"id":"n-c94f83ae","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2019-07-04":"The name whose date published is 2019-07-04 is Grilled Pollo a la Brasa."}}},
{"id":"n-cad4ed5a","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2025-07-17 is the date published of which name":"The name whose date published is 2025-07-17 is Jamaican Brown Stew Chicken."}}},
{"id":"n-d16a76e3","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-07-20 is the date published of which name":"The name whose date published is 2024-07-20 is Tartufo."}}},
{"id":"n-d1c5f8d6","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2020-02-19":"The name whose date published is 2020-02-19 is Bill's Peruvian Chicken and Rice."}}},
{"id":"n-d21e0392","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2025-05-01 is the date published of which name":"The name whose date published is 2025-05-01 is Vegetarian Huevo Saltado."}}},
{"id":"n-d223b7f7","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-07-18":"The name whose date published is 2024-07-18 is Fried Sweet Bananas."}}},
{"id":"n-d4874674","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2022-10-29 is the date published of which name":"The name whose date published is 2022-10-29 is French Canadian Tourtière."}}},
{"id":"n-d50ecc32","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2023-01-26":"The name whose date published is 2023-01-26 is Beef Bulgogi."}}},
{"id":"n-d5d20c49","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2022-12-27":"The name whose date published is 2022-12-27 is Authentic Empanada Pastry Dough."}}},
{"id":"n-d8437e89","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2012-02-19 is the date published of which name":"The name whose date published is 2012-02-19 is Middle Eastern-Style Dolma (Stuffed Vegetables)."}}},
{"id":"n-dd2f2941","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2019-05-29":"The name whose date published is 2019-05-29 is Tex-Mex Grilled Flank Steak."}}},
{"id":"n-dd752908","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2025-02-23":"The name whose date published is 2025-02-23 is Best Jambalaya."}}},
{"id":"n-dea14b99","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-05-03 is the date published of which name":"The name whose date published is 2023-05-03 is Oladi (Russian Kefir Pancakes)."}}},
{"id":"n-df7430d4","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2024-09-30":"The name whose date published is 2024-09-30 is Sheet Pan General Tso's Chicken and Broccoli."}}},
{"id":"n-dfed7e87","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2022-06-30":"The name whose date published is 2022-06-30 is Pakistani Chicken Karahi."}}},
{"id":"n-e8a9e420","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-05-07":"The name whose date published is 2024-05-07 is Bannock."}}},
{"id":"n-e992bb28","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2024-07-19":"The name whose date published is 2024-07-19 is Greek Turkey Meatballs."}}},
{"id":"n-eb1251fd","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-03-31 is the date published of which name":"The name whose date published is 2023-03-31 is Traditional Gyros."}}},
{"id":"n-ef376917","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2025-02-17":"The name whose date published is 2025-02-17 is Vietnamese Sandwich."}}},
{"id":"n-efa14dcf","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2024-03-16":"The name whose date published is 2024-03-16 is Vietnamese Beef Pho."}}},
{"id":"n-f1b1dbf0","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2023-04-18":"The name whose date published is 2023-04-18 is Chicken in Black Bean Sauce."}}},
{"id":"n-f8f885e4","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2024-12-09 is the date published of which name":"The name whose date published is 2024-12-09 is German Lebkuchen."}}},
{"id":"n-f9fc2f6c","guard":[["hasAny",["date","has","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the date published 2022-09-11":"The name whose date published is 2022-09-11 is Thai Red Chicken Curry."}}},
{"id":"n-fbe683f8","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2023-09-14":"The name whose date published is 2023-09-14 is Cuban-Style Yuca."}}},
{"id":"n-ffdd8539","guard":[["hasAny",["date","name","published"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose date published is 2022-10-12":"The name whose date published is 2022-10-12 is Kransekake (Norwegian Almond Ring Cake)."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"name the name whose date published is 2022-10-12","expect":{"contains":["Kransekake (Norwegian Almond Ring Cake)"],"notRefusal":true}},{"q":"name the name whose date published is 2023-04-26","expect":{"contains":["Pannekaken (Norwegian Pancakes)"],"notRefusal":true}},{"q":"name the name whose date published is 2025-03-04","expect":{"contains":["Russian Tea Cakes"],"notRefusal":true}},{"q":"which name has the date published 2022-06-10","expect":{"contains":["Scandinavian Sweetheart Waffles"],"notRefusal":true}},{"q":"2022-10-29 is the date published of which name","expect":{"contains":["French Canadian Tourtière"],"notRefusal":true}},{"q":"name the name whose date published is 2023-09-14","expect":{"contains":["Cuban-Style Yuca"],"notRefusal":true}},{"q":"2013-06-20 is the date published of which name","expect":{"contains":["Finnish Oven Pancakes"],"notRefusal":true}},{"q":"which name has the date published 2022-11-23","expect":{"contains":["Authentic Pad Thai"],"notRefusal":true}},{"q":"which name has the date published 2019-05-29","expect":{"contains":["Tex-Mex Grilled Flank Steak"],"notRefusal":true}},{"q":"2024-04-06 is the date published of which name","expect":{"contains":["Pashka"],"notRefusal":true}},{"q":"2018-08-31 is the date published of which name","expect":{"contains":["Mango Ceviche"],"notRefusal":true}},{"q":"2024-12-09 is the date published of which name","expect":{"contains":["German Lebkuchen"],"notRefusal":true}},{"q":"name the name whose date published is 2024-07-18","expect":{"contains":["Fried Sweet Bananas"],"notRefusal":true}},{"q":"2017-12-21 is the date published of which name","expect":{"contains":["Lebanese Fattoush"],"notRefusal":true}},{"q":"which name has the date published 2023-01-19","expect":{"contains":["Potato Klubb (Norwegian Potato Dumplings)"],"notRefusal":true}},{"q":"2025-07-26 is the date published of which name","expect":{"contains":["Italian Cherry Margarita"],"notRefusal":true}},{"q":"which name has the date published 2020-06-16","expect":{"contains":["Creamy Israeli-Style Hummus"],"notRefusal":true}},{"q":"which name has the date published 2023-01-26","expect":{"contains":["Beef Bulgogi"],"notRefusal":true}},{"q":"name the name whose date published is 2024-09-28","expect":{"contains":["Classic Spanish Sangria"],"notRefusal":true}},{"q":"2023-04-11 is the date published of which name","expect":{"contains":["Manjar (Dulce de Leche) from Scratch"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
