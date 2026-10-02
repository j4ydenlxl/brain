// close-of-date-338c-neo-g7.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"close-of-date-338c-neo-g7","class":"close-of-date-338c","generation":7,"lane":"neo","grownFrom":["tell me the close of 2013-10-31","what is the close of 2021-01-29","what is the close of 1999-05-28","give the close of 1990-04-30","give the close of 2002-06-28","tell me the close of 2017-02-28","tell me the close of 2018-02-28","tell me the close of 1993-12-31","what is the close of 1998-05-29","tell me the close of 2003-04-30","what is the close of 2023-11-30","give the close of 1997-09-30","what is the close of 2022-08-31","tell me the close of 2004-07-30","give the close of 2004-12-31","what is the close of 2010-12-31","what is the close of 2023-06-30","give the close of 2025-09-30","what is the close of 2021-02-26","what is the close of 2001-10-31"],"version":1});

// <KERNEL>
const KERNEL_VERSION = 1;
const MAX_DEPTH = 64;
const MAX_LIST = 10000;
const MAX_BITS = 65536;
const MAX_TEXT = 100000;
const SAFE = 9007199254740991n;
const NEAR = 0.5;
const TYPES = Object.freeze(['text', 'num', 'nums', 'str', 'strs', 'bool', 'kv', 'tpl']);
const FAMILIES = Object.freeze(['sense', 'transform', 'aggregate', 'compare', 'compute', 'memory', 'know', 'route', 'iterate', 'render']);
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
const CHECK = Object.freeze({
  text: (v) => typeof v === 'string', str: (v) => typeof v === 'string', num: isNum, bool: (v) => typeof v === 'boolean',
  nums: (v) => Array.isArray(v) && v.every(isNum), strs: (v) => Array.isArray(v) && v.every((s) => typeof s === 'string'),
  kv: isKv, tpl: isTpl,
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
    KNOW.set(p.id, { id: p.id, cols: p.columns.slice(), col: new Map(p.columns.map((c, j) => [c, j])), rows: clean, keys: new Map(), grams: new Map() });
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
  return Object.freeze(out);
}

// ---- evaluation: nodes, types, shape
function isLit(node) { return isKv(node) && Object.hasOwn(node, 'lit'); }
/** The argument types a node of this primitive carries (its in list without the implicit "text"), or null. */
function argTypes(name) { return typeof name === 'string' && Object.hasOwn(ARGS, name) ? ARGS[name].slice() : null; }
/** Evaluate a node on a prompt and a mem: a value of the node's type, or null (a miss, never a guess). */
function evalNode(node, q, mem, depth = 0) {
  try {
    if (depth > MAX_DEPTH) return null;
    if (isLit(node)) return clean(node.lit);
    if (!Array.isArray(node) || typeof node[0] !== 'string' || !Object.hasOwn(PRIMS, node[0])) return null;
    const p = PRIMS[node[0]], ts = ARGS[node[0]], n = node.length - 1;
    if (n < ts.length || (n > ts.length && !p.rest)) return null;
    const args = [];
    for (let i = 1; i <= n; i++) { const v = evalNode(node[i], q, mem, depth + 1); if (v === null && !p.lazy) return null; args.push(v); }
    return p.fn(args, { q: typeof q === 'string' ? q : '', mem: isKv(mem) ? mem : null });
  } catch { return null; }
}
/** Whether a node is well typed and yields the wanted type (any type when want is undefined). */
function wellTyped(node, want, depth = 0) {
  if (depth > MAX_DEPTH) return false;
  if (isLit(node)) return typeof want === 'string' && want !== 'text' && Object.hasOwn(CHECK, want) && CHECK[want](clean(node.lit));
  if (!Array.isArray(node) || typeof node[0] !== 'string' || !Object.hasOwn(PRIMS, node[0])) return false;
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
  if (node.length === 1) return ['sense', 'memory'].includes(PRIMS[node[0]]?.family);
  return node.slice(1).every((x) => leavesOk(x, depth + 1));
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
  else if (PRIMS[c.pyramid[0]].family !== 'render') errors.push('the apex is not a render primitive');
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
knowLoad([{"id":"fr-finance-vix-vix-monthly-e0dd17","columns":["date","close"],"n":441,"cols":[{"f":"01990-01-31|62-28|63-30|64-30|65-31|66-29|67-31|68-31|69-28|510-31|61-30|62-31|31-01-31|62-28|63-28|64-30|65-31|66-28|67-31|68-30|69-30|510-31|61-29|62-31|32-01-31|62-28|63-31|64-30|65-29|66-30|67-31|68-31|69-30|510-30|61-30|62-31|33-01-29|62-26|63-31|64-30|65-28|66-30|67-30|68-31|69-30|510-29|61-30|62-31|34-01-31|62-28|63-31|64-29|65-31|66-30|67-29|68-31|69-30|510-31|61-30|62-30|35-01-31|62-28|63-31|64-28|65-31|66-30|67-31|68-31|69-29|510-31|61-30|62-29|36-01-31|62-29|63-29|64-30|65-31|66-28|67-31|68-30|69-30|510-31|61-29|62-31|37-01-30|62-28|63-31|64-30|65-30|66-30|67-31|68-29|69-30|510-31|61-28|62-31|38-01-30|62-27|63-31|64-30|65-29|66-30|67-31|68-31|69-30|510-30|61-30|62-31|39-01-29|62-26|63-31|64-30|65-28|66-30|67-30|68-31|69-30|510-29|61-30|62-30|02000-01-31|62-29|63-31|64-28|65-31|66-30|67-31|68-31|69-29|510-31|61-30|62-29|31-01-31|62-28|63-30|64-30|65-31|66-29|67-31|68-31|69-28|510-31|61-30|62-31|32-01-31|62-28|63-28|64-30|65-31|66-28|67-31|68-30|69-30|510-31|61-29|62-31|33-01-31|62-28|63-31|64-30|65-30|66-30|67-31|68-29|69-30|510-31|61-28|62-31|34-01-30|62-27|63-31|64-30|65-28|66-30|67-30|68-31|69-30|510-29|61-30|62-31|35-01-31|62-28|63-31|64-29|65-31|66-30|67-29|68-31|69-30|510-31|61-30|62-30|36-01-31|62-28|63-31|64-28|65-31|66-30|67-31|68-31|69-29|510-31|61-30|62-29|37-01-31|62-28|63-30|64-30|65-31|66-29|67-31|68-31|69-28|510-31|61-30|62-31|38-01-31|62-29|63-31|64-30|65-30|66-30|67-31|68-29|69-30|510-31|61-28|62-31|39-01-30|62-27|63-31|64-30|65-29|66-30|67-31|68-31|69-30|510-30|61-30|62-31|210-01-29|62-26|63-31|64-30|65-28|66-30|67-30|68-31|69-30|510-29|61-30|62-31|31-01-31|62-28|63-31|64-29|65-31|66-30|67-29|68-31|69-30|510-31|61-30|62-30|32-01-31|62-29|63-30|64-30|65-31|66-29|67-31|68-31|69-28|510-31|61-30|62-31|33-01-31|62-28|63-28|64-30|65-31|66-28|67-31|68-30|69-30|510-31|61-29|62-31|34-01-31|62-28|63-31|64-30|65-30|66-30|67-31|68-29|69-30|510-31|61-28|62-31|35-01-30|62-27|63-31|64-30|65-29|66-30|67-31|68-31|69-30|510-30|61-30|62-31|36-01-29|62-29|63-31|64-29|65-31|66-30|67-29|68-31|69-30|510-31|61-30|62-30|37-01-31|62-28|63-31|64-28|65-31|66-30|67-31|68-31|69-29|510-31|61-30|62-29|38-01-31|62-28|63-29|64-30|65-31|66-29|67-31|68-31|69-28|510-31|61-30|62-31|39-01-31|62-28|63-29|64-30|65-31|66-28|67-31|68-30|69-30|510-31|61-29|62-31|220-01-31|62-28|63-31|64-30|65-29|66-30|67-31|68-31|69-30|510-30|61-30|62-31|31-01-29|62-26|63-31|64-30|65-28|66-30|67-30|68-31|69-30|510-29|61-30|62-31|32-01-31|62-28|63-31|64-29|65-31|66-30|67-29|68-31|69-30|510-31|61-30|62-30|33-01-31|62-28|63-31|64-28|65-31|66-30|67-31|68-31|69-29|510-31|61-30|62-29|34-01-31|62-29|63-28|64-30|65-31|66-28|67-31|68-30|69-30|510-31|61-29|62-31|35-01-31|62-28|63-31|64-30|65-30|66-30|67-31|68-29|69-30|510-31|61-28|62-31|36-01-30|62-27|63-31|64-30|65-29|66-30|67-31|68-31|69-22","sep":"|"},{"s":"25.36|21.99|19.73|19.52|17.37|15.5|21.11|29.9|29.11|30.04|22.16|26.38|20.91|21.23|16.88|18.24|15.93|19.55|15.18|14.46|15.85|15.48|20.26|19.31|17.4|16.68|16.18|15.53|13.86|13.35|13.17|13.58|14.28|16.15|13.01|12.57|12.42|13.16|12.53|12.42|13.47|11.26|11.73|11.85|12.99|11.46|13.76|11.66|10.63|14.87|20.45|13.77|13.03|14.97|11.13|11.97|14.28|14.56|15.95|13.2|11.96|11.75|13.37|11.75|12.85|11.38|13.49|11.52|12.74|13.83|11.58|12.52|12.53|17.04|18.88|15.83|16.07|13.68|19.46|17.01|16.95|18.11|17.14|20.92|19.47|21.1|22.14|20.06|19.19|21.53|21.48|24.76|22.91|35.09|27.43|24.01|21.47|18.55|24.22|21.18|21.32|19.71|24.8|44.28|40.95|28.05|26.01|24.42|26.25|27.88|23.26|25.07|25.39|21.09|24.64|24.45|25.41|22.2|24.18|24.76|24.95|23.37|24.11|26.2|23.65|19.54|20.74|16.84|20.57|23.63|29.65|26.85|22.02|28.35|28.64|25.48|22.64|19.06|21.62|24.92|31.93|33.56|23.84|23.8|21.09|21.59|17.4|21.91|19.98|25.4|32.03|32.64|39.69|31.14|27.5|28.62|31.17|29.63|29.15|21.21|19.47|19.52|19.49|18.63|22.72|16.1|16.32|18.31|16.63|14.55|16.74|17.19|15.5|14.34|15.32|15.29|13.34|16.27|13.24|13.29|12.82|12.08|14.02|15.31|13.29|12.04|11.57|12.6|11.92|15.32|12.06|12.07|12.95|12.34|11.39|11.59|16.44|13.08|14.95|12.31|11.98|11.1|10.91|11.56|10.42|15.42|14.64|14.22|13.05|16.23|23.52|23.38|18|18.53|22.87|22.5|26.2|26.54|25.61|20.79|17.83|23.95|22.94|20.65|39.39|59.89|55.84|40|44.84|46.35|44.14|36.5|28.92|26.35|25.92|26.01|25.61|30.69|24.51|21.68|24.62|19.5|17.59|22.05|32.07|34.54|23.5|26.05|23.7|21.2|23.54|17.75|19.53|18.35|17.74|14.75|15.45|16.52|25.25|31.62|42.96|29.96|27.8|23.4|19.44|18.43|15.5|17.15|24.06|17.08|18.93|17.47|15.73|18.6|15.87|18.02|14.28|15.51|12.7|13.52|16.3|16.86|13.45|17.01|16.6|13.75|13.7|13.72|18.41|14|13.88|13.41|11.4|11.57|16.95|11.98|16.31|14.03|13.33|19.2|20.97|13.34|15.29|14.55|13.84|18.23|12.12|28.43|24.5|15.07|16.13|18.21|20.2|20.55|13.95|15.7|14.19|15.63|11.87|13.42|13.29|17.06|13.33|14.04|11.99|12.92|12.37|10.82|10.41|11.18|10.26|10.59|9.51|10.18|11.28|11.04|13.54|19.85|19.97|15.93|15.43|16.09|12.83|12.86|12.12|21.23|18.07|25.42|16.57|14.78|13.71|13.12|18.71|15.08|16.12|18.98|16.24|13.22|12.62|13.78|18.84|40.11|53.54|34.15|27.51|30.43|24.46|26.41|26.37|38.02|20.57|22.75|33.09|27.95|19.4|18.61|16.76|15.83|18.24|16.48|23.14|16.26|27.19|17.22|24.83|30.15|20.56|33.4|26.19|28.71|21.33|25.87|31.62|25.88|20.58|21.67|19.4|20.7|18.7|15.78|17.94|13.59|13.63|13.57|17.52|18.14|12.92|12.45|14.35|13.4|13.01|15.65|12.92|12.44|16.36|15|16.73|23.16|13.51|17.35|16.43|19.63|22.28|24.7|18.57|16.73|16.72|15.36|16.28|17.44|16.35|14.95|17.44|19.86|25.25|16.89|15.32|16.45|15.99|14.92|14.21","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-1f4de5d8","guard":[["hasAny",["close","element","item number","nth","position"]],["nums==",3]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-734f5aed","guard":[["not",["hasAny",["add","between","compare","high","larger","makes","open","smaller","sum"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-0a65b217","guard":[["not",["hasAny",["add","compare","larger","makes","smaller","sum"]]]],"pyramid":["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-62c20fc1","guard":[["hasAny",["close","element","item number","nth","position"]],["nums==",3]],"pyramid":["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-0f992583","guard":[["hasAny",["an even number","close","element","even","is even","item number","nth","position"]],["nums==",3]],"pyramid":["render.yesNo",["compare.isEven",["sense.first"]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-5e18733d","guard":[["not",["hasAny",["add","compare","larger","makes","smaller","sum"]]]],"pyramid":["render.yesNo",["compare.isEven",["sense.first"]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-c4d685d8","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2013-10-31":"The close of 2013-10-31 is 13.75.","what is the close of 2021-01-29":"The close of 2021-01-29 is 33.09.","what is the close of 1999-05-28":"The close of 1999-05-28 is 25.39.","give the close of 1990-04-30":"The close of 1990-04-30 is 19.52.","give the close of 2002-06-28":"The close of 2002-06-28 is 25.4.","tell me the close of 2017-02-28":"The close of 2017-02-28 is 12.92.","tell me the close of 2018-02-28":"The close of 2018-02-28 is 19.85.","tell me the close of 1993-12-31":"The close of 1993-12-31 is 11.66.","what is the close of 1998-05-29":"The close of 1998-05-29 is 21.32.","tell me the close of 2003-04-30":"The close of 2003-04-30 is 21.21.","what is the close of 2023-11-30":"The close of 2023-11-30 is 12.92.","give the close of 1997-09-30":"The close of 1997-09-30 is 22.91.","what is the close of 2022-08-31":"The close of 2022-08-31 is 25.87.","tell me the close of 2004-07-30":"The close of 2004-07-30 is 15.32.","give the close of 2004-12-31":"The close of 2004-12-31 is 13.29.","what is the close of 2010-12-31":"The close of 2010-12-31 is 17.75.","what is the close of 2023-06-30":"The close of 2023-06-30 is 13.59.","give the close of 2025-09-30":"The close of 2025-09-30 is 16.28.","what is the close of 2021-02-26":"The close of 2021-02-26 is 27.95.","what is the close of 2001-10-31":"The close of 2001-10-31 is 33.56.","give the close of 2000-12-29":"The close of 2000-12-29 is 26.85.","what is the close of 2021-11-30":"The close of 2021-11-30 is 27.19.","what is the close of 2022-09-30":"The close of 2022-09-30 is 31.62.","give the close of 2000-11-30":"The close of 2000-11-30 is 29.65.","give the close of 2005-04-29":"The close of 2005-04-29 is 15.31.","tell me the close of 1998-08-31":"The close of 1998-08-31 is 44.28.","what is the close of 1999-02-26":"The close of 1999-02-26 is 27.88.","give the close of 2023-02-28":"The close of 2023-02-28 is 20.7.","what is the close of 1992-12-31":"The close of 1992-12-31 is 12.57.","give the close of 2026-03-31":"The close of 2026-03-31 is 25.25.","what is the close of 1991-07-31":"The close of 1991-07-31 is 15.18.","tell me the close of 1998-01-30":"The close of 1998-01-30 is 21.47.","give the close of 2002-02-28":"The close of 2002-02-28 is 21.59.","give the close of 2001-11-30":"The close of 2001-11-30 is 23.84.","tell me the close of 2012-07-31":"The close of 2012-07-31 is 18.93.","what is the close of 2013-05-31":"The close of 2013-05-31 is 16.3.","what is the close of 2005-10-31":"The close of 2005-10-31 is 15.32.","what is the close of 2023-05-31":"The close of 2023-05-31 is 17.94.","what is the close of 1998-12-31":"The close of 1998-12-31 is 24.42.","give the close of 1990-03-30":"The close of 1990-03-30 is 19.73.","give the close of 2005-06-30":"The close of 2005-06-30 is 12.04.","tell me the close of 2002-12-31":"The close of 2002-12-31 is 28.62.","what is the close of 2013-11-29":"The close of 2013-11-29 is 13.7.","give the close of 2014-05-30":"The close of 2014-05-30 is 11.4.","what is the close of 2000-08-31":"The close of 2000-08-31 is 16.84.","what is the close of 2002-05-31":"The close of 2002-05-31 is 19.98.","tell me the close of 2019-06-28":"The close of 2019-06-28 is 15.08.","what is the close of 2005-11-30":"The close of 2005-11-30 is 12.06.","tell me the close of 2007-09-28":"The close of 2007-09-28 is 18.","tell me the close of 2009-04-30":"The close of 2009-04-30 is 36.5.","what is the close of 1996-11-29":"The close of 1996-11-29 is 17.14.","tell me the close of 2007-05-31":"The close of 2007-05-31 is 13.05.","what is the close of 1994-05-31":"The close of 1994-05-31 is 13.03.","what is the close of 2026-02-27":"The close of 2026-02-27 is 19.86.","what is the close of 2020-09-30":"The close of 2020-09-30 is 26.37.","what is the close of 2008-10-31":"The close of 2008-10-31 is 59.89.","give the close of 1991-05-31":"The close of 1991-05-31 is 15.93.","give the close of 1997-01-30":"The close of 1997-01-30 is 19.47.","tell me the close of 2004-08-31":"The close of 2004-08-31 is 15.29.","tell me the close of 2000-02-29":"The close of 2000-02-29 is 23.37.","give the close of 2020-11-30":"The close of 2020-11-30 is 20.57.","give the close of 2021-10-29":"The close of 2021-10-29 is 16.26.","tell me the close of 2023-08-31":"The close of 2023-08-31 is 13.57.","give the close of 2002-09-30":"The close of 2002-09-30 is 39.69.","what is the close of 2011-08-31":"The close of 2011-08-31 is 31.62.","tell me the close of 2020-07-31":"The close of 2020-07-31 is 24.46.","give the close of 2020-05-29":"The close of 2020-05-29 is 27.51.","tell me the close of 2019-11-29":"The close of 2019-11-29 is 12.62.","give the close of 2016-03-31":"The close of 2016-03-31 is 13.95.","tell me the close of 2010-10-29":"The close of 2010-10-29 is 21.2.","what is the close of 2024-03-28":"The close of 2024-03-28 is 13.01.","tell me the close of 1990-01-31":"The close of 1990-01-31 is 25.36.","tell me the close of 2023-04-28":"The close of 2023-04-28 is 15.78.","give the close of 2019-07-31":"The close of 2019-07-31 is 16.12.","give the close of 1995-05-31":"The close of 1995-05-31 is 12.85.","tell me the close of 1994-09-30":"The close of 1994-09-30 is 14.28.","what is the close of 1993-10-29":"The close of 1993-10-29 is 11.46.","tell me the close of 1995-11-30":"The close of 1995-11-30 is 11.58.","give the close of 1997-12-31":"The close of 1997-12-31 is 24.01.","what is the close of 2006-03-31":"The close of 2006-03-31 is 11.39.","what is the close of 2009-11-30":"The close of 2009-11-30 is 24.51.","tell me the close of 2016-11-30":"The close of 2016-11-30 is 13.33.","give the close of 2014-08-29":"The close of 2014-08-29 is 11.98.","tell me the close of 2015-10-30":"The close of 2015-10-30 is 15.07.","tell me the close of 2007-10-31":"The close of 2007-10-31 is 18.53.","give the close of 1992-09-30":"The close of 1992-09-30 is 14.28.","give the close of 2018-12-31":"The close of 2018-12-31 is 25.42.","tell me the close of 2020-04-30":"The close of 2020-04-30 is 34.15.","give the close of 2002-11-29":"The close of 2002-11-29 is 27.5.","tell me the close of 1996-10-31":"The close of 1996-10-31 is 18.11.","tell me the close of 2003-03-31":"The close of 2003-03-31 is 29.15.","give the close of 1990-10-31":"The close of 1990-10-31 is 30.04.","what is the close of 2026-04-30":"The close of 2026-04-30 is 16.89.","what is the close of 2010-01-29":"The close of 2010-01-29 is 24.62.","tell me the close of 2024-04-30":"The close of 2024-04-30 is 15.65.","give the close of 2017-09-29":"The close of 2017-09-29 is 9.51.","tell me the close of 2025-08-29":"The close of 2025-08-29 is 15.36.","give the close of 1998-11-30":"The close of 1998-11-30 is 26.01.","give the close of 1999-03-31":"The close of 1999-03-31 is 23.26.","tell me the close of 1990-05-31":"The close of 1990-05-31 is 17.37."}}},
{"id":"n-ffa3c73e","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"close"}]]],"mem":{"table":{"of 2013-10-31":"The close of 2013-10-31 is 13.75.","of 2021-01-29":"The close of 2021-01-29 is 33.09.","of 1999-05-28":"The close of 1999-05-28 is 25.39.","of 1990-04-30":"The close of 1990-04-30 is 19.52.","of 2002-06-28":"The close of 2002-06-28 is 25.4.","of 2017-02-28":"The close of 2017-02-28 is 12.92.","of 2018-02-28":"The close of 2018-02-28 is 19.85.","of 1993-12-31":"The close of 1993-12-31 is 11.66.","of 1998-05-29":"The close of 1998-05-29 is 21.32.","of 2003-04-30":"The close of 2003-04-30 is 21.21.","of 2023-11-30":"The close of 2023-11-30 is 12.92.","of 1997-09-30":"The close of 1997-09-30 is 22.91.","of 2022-08-31":"The close of 2022-08-31 is 25.87.","of 2004-07-30":"The close of 2004-07-30 is 15.32.","of 2004-12-31":"The close of 2004-12-31 is 13.29.","of 2010-12-31":"The close of 2010-12-31 is 17.75.","of 2023-06-30":"The close of 2023-06-30 is 13.59.","of 2025-09-30":"The close of 2025-09-30 is 16.28.","of 2021-02-26":"The close of 2021-02-26 is 27.95.","of 2001-10-31":"The close of 2001-10-31 is 33.56.","of 2000-12-29":"The close of 2000-12-29 is 26.85.","of 2021-11-30":"The close of 2021-11-30 is 27.19.","of 2022-09-30":"The close of 2022-09-30 is 31.62.","of 2000-11-30":"The close of 2000-11-30 is 29.65.","of 2005-04-29":"The close of 2005-04-29 is 15.31.","of 1998-08-31":"The close of 1998-08-31 is 44.28.","of 1999-02-26":"The close of 1999-02-26 is 27.88.","of 2023-02-28":"The close of 2023-02-28 is 20.7.","of 1992-12-31":"The close of 1992-12-31 is 12.57.","of 2026-03-31":"The close of 2026-03-31 is 25.25.","of 1991-07-31":"The close of 1991-07-31 is 15.18.","of 1998-01-30":"The close of 1998-01-30 is 21.47.","of 2002-02-28":"The close of 2002-02-28 is 21.59.","of 2001-11-30":"The close of 2001-11-30 is 23.84.","of 2012-07-31":"The close of 2012-07-31 is 18.93.","of 2013-05-31":"The close of 2013-05-31 is 16.3.","of 2005-10-31":"The close of 2005-10-31 is 15.32.","of 2023-05-31":"The close of 2023-05-31 is 17.94.","of 1998-12-31":"The close of 1998-12-31 is 24.42.","of 1990-03-30":"The close of 1990-03-30 is 19.73.","of 2005-06-30":"The close of 2005-06-30 is 12.04.","of 2002-12-31":"The close of 2002-12-31 is 28.62.","of 2013-11-29":"The close of 2013-11-29 is 13.7.","of 2014-05-30":"The close of 2014-05-30 is 11.4.","of 2000-08-31":"The close of 2000-08-31 is 16.84.","of 2002-05-31":"The close of 2002-05-31 is 19.98.","of 2019-06-28":"The close of 2019-06-28 is 15.08.","of 2005-11-30":"The close of 2005-11-30 is 12.06.","of 2007-09-28":"The close of 2007-09-28 is 18.","of 2009-04-30":"The close of 2009-04-30 is 36.5.","of 1996-11-29":"The close of 1996-11-29 is 17.14.","of 2007-05-31":"The close of 2007-05-31 is 13.05.","of 1994-05-31":"The close of 1994-05-31 is 13.03.","of 2026-02-27":"The close of 2026-02-27 is 19.86.","of 2020-09-30":"The close of 2020-09-30 is 26.37.","of 2008-10-31":"The close of 2008-10-31 is 59.89.","of 1991-05-31":"The close of 1991-05-31 is 15.93.","of 1997-01-30":"The close of 1997-01-30 is 19.47.","of 2004-08-31":"The close of 2004-08-31 is 15.29.","of 2000-02-29":"The close of 2000-02-29 is 23.37.","of 2020-11-30":"The close of 2020-11-30 is 20.57.","of 2021-10-29":"The close of 2021-10-29 is 16.26.","of 2023-08-31":"The close of 2023-08-31 is 13.57.","of 2002-09-30":"The close of 2002-09-30 is 39.69.","of 2011-08-31":"The close of 2011-08-31 is 31.62.","of 2020-07-31":"The close of 2020-07-31 is 24.46.","of 2020-05-29":"The close of 2020-05-29 is 27.51.","of 2019-11-29":"The close of 2019-11-29 is 12.62.","of 2016-03-31":"The close of 2016-03-31 is 13.95.","of 2010-10-29":"The close of 2010-10-29 is 21.2.","of 2024-03-28":"The close of 2024-03-28 is 13.01.","of 1990-01-31":"The close of 1990-01-31 is 25.36.","of 2023-04-28":"The close of 2023-04-28 is 15.78.","of 2019-07-31":"The close of 2019-07-31 is 16.12.","of 1995-05-31":"The close of 1995-05-31 is 12.85.","of 1994-09-30":"The close of 1994-09-30 is 14.28.","of 1993-10-29":"The close of 1993-10-29 is 11.46.","of 1995-11-30":"The close of 1995-11-30 is 11.58.","of 1997-12-31":"The close of 1997-12-31 is 24.01.","of 2006-03-31":"The close of 2006-03-31 is 11.39.","of 2009-11-30":"The close of 2009-11-30 is 24.51.","of 2016-11-30":"The close of 2016-11-30 is 13.33.","of 2014-08-29":"The close of 2014-08-29 is 11.98.","of 2015-10-30":"The close of 2015-10-30 is 15.07.","of 2007-10-31":"The close of 2007-10-31 is 18.53.","of 1992-09-30":"The close of 1992-09-30 is 14.28.","of 2018-12-31":"The close of 2018-12-31 is 25.42.","of 2020-04-30":"The close of 2020-04-30 is 34.15.","of 2002-11-29":"The close of 2002-11-29 is 27.5.","of 1996-10-31":"The close of 1996-10-31 is 18.11.","of 2003-03-31":"The close of 2003-03-31 is 29.15.","of 1990-10-31":"The close of 1990-10-31 is 30.04.","of 2026-04-30":"The close of 2026-04-30 is 16.89.","of 2010-01-29":"The close of 2010-01-29 is 24.62.","of 2024-04-30":"The close of 2024-04-30 is 15.65.","of 2017-09-29":"The close of 2017-09-29 is 9.51.","of 2025-08-29":"The close of 2025-08-29 is 15.36.","of 1998-11-30":"The close of 1998-11-30 is 26.01.","of 1999-03-31":"The close of 1999-03-31 is 23.26.","of 1990-05-31":"The close of 1990-05-31 is 17.37."}}},
{"id":"n-c0028bd0","guard":[["not",["hasAny",["20110831","add","between","compare","high","larger","makes","open","smaller","sum"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}],["sense.lastWord"]]],"mem":null},
{"id":"n-1ff1eb10","guard":[["hasAny",["a leap year","before","close","element","is a leap year","item number","leap year","nth","one less","position","predecessor","previous"]],["nums==",3]],"pyramid":["render.yesNo",["compare.isLeap",["transform.prev",["sense.second"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-a1b84469","guard":[["not",["hasAny",["add","compare","larger","makes","smaller","sum"]]]],"pyramid":["render.yesNo",["compare.isLeap",["transform.prev",["sense.second"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-c7340e44","guard":[["hasAny",["element","is","item number","me","nth","position"]],["nums==",3]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-705bc4a7","guard":[["hasAny",["element","invert case","is","item number","me","nth","position","swap case","toggle case"]],["nums==",3]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"close"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-fd5d9f76","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","is","item number","me","nth","position","title case"]],["nums==",3]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["sense.after",{"lit":"close"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-0d6ee87e","guard":[["hasAny",["element","is","item number","me","nth","position"]],["nums==",3]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"close"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]]],"mem":null},
{"id":"n-fa928fdb","guard":[["hasAny",["delete","element","give","item number","me","nth","position","remove","strip out","without"]],["has","close"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}],["sense.lastWord"]]],"mem":null},
{"id":"n-05b77b7b","guard":[["not",["hasAny",["add","compare","larger","makes","smaller","sum"]]]],"pyramid":["render.yesNo",["compare.isEven",["transform.half",["sense.first"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-cd5aa72c","guard":[["hasAny",["an even number","close","element","even","half","half of","halve","is even","item number","nth","position"]],["nums==",3]],"pyramid":["render.yesNo",["compare.isEven",["transform.half",["sense.first"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-31cc9a90","guard":[["not",["hasAny",["add","compare","larger","makes","smaller","sum"]]]],"pyramid":["render.yesNo",["compare.isEven",["transform.half",["sense.second"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-c59c706e","guard":[["hasAny",["an even number","close","element","even","half","half of","halve","is even","item number","nth","position"]],["nums==",3]],"pyramid":["render.yesNo",["compare.isEven",["transform.half",["sense.second"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-4512c06f","guard":[["hasAny",["an even number","close","element","even","half","half of","halve","is even","item number","nth","position"]],["nums==",3]],"pyramid":["render.yesNo",["compare.isEven",["transform.half",["sense.last"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-c875242f","guard":[["not",["hasAny",["add","compare","larger","makes","smaller","sum"]]]],"pyramid":["render.yesNo",["compare.isEven",["transform.half",["sense.last"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-1c64f44a","guard":[["hasAny",["an even number","arithmetic mean","average","avg","close","element","even","is even","item number","mean","nth","position"]],["nums==",3]],"pyramid":["render.yesNo",["compare.isEven",["aggregate.mean",["sense.numbers"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-9fe5bb7f","guard":[["not",["hasAny",["add","compare","larger","makes","smaller","sum"]]]],"pyramid":["render.yesNo",["compare.isEven",["aggregate.mean",["sense.numbers"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-302f9871","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the close of 2021-01-29":"The close of 2021-01-29 is 33.09.","the close of 1999-05-28":"The close of 1999-05-28 is 25.39.","the close of 1998-05-29":"The close of 1998-05-29 is 21.32.","the close of 2023-11-30":"The close of 2023-11-30 is 12.92.","the close of 2022-08-31":"The close of 2022-08-31 is 25.87.","the close of 2010-12-31":"The close of 2010-12-31 is 17.75.","the close of 2023-06-30":"The close of 2023-06-30 is 13.59.","the close of 2021-02-26":"The close of 2021-02-26 is 27.95.","the close of 2001-10-31":"The close of 2001-10-31 is 33.56.","the close of 2021-11-30":"The close of 2021-11-30 is 27.19.","the close of 2022-09-30":"The close of 2022-09-30 is 31.62.","the close of 1999-02-26":"The close of 1999-02-26 is 27.88.","the close of 1992-12-31":"The close of 1992-12-31 is 12.57.","the close of 1991-07-31":"The close of 1991-07-31 is 15.18.","the close of 2013-05-31":"The close of 2013-05-31 is 16.3.","the close of 2005-10-31":"The close of 2005-10-31 is 15.32.","the close of 2023-05-31":"The close of 2023-05-31 is 17.94.","the close of 1998-12-31":"The close of 1998-12-31 is 24.42.","the close of 2013-11-29":"The close of 2013-11-29 is 13.7.","the close of 2000-08-31":"The close of 2000-08-31 is 16.84.","the close of 2002-05-31":"The close of 2002-05-31 is 19.98.","the close of 2005-11-30":"The close of 2005-11-30 is 12.06.","the close of 1996-11-29":"The close of 1996-11-29 is 17.14.","the close of 1994-05-31":"The close of 1994-05-31 is 13.03.","the close of 2026-02-27":"The close of 2026-02-27 is 19.86.","the close of 2020-09-30":"The close of 2020-09-30 is 26.37.","the close of 2008-10-31":"The close of 2008-10-31 is 59.89.","the close of 2011-08-31":"The close of 2011-08-31 is 31.62.","the close of 2024-03-28":"The close of 2024-03-28 is 13.01.","the close of 1993-10-29":"The close of 1993-10-29 is 11.46.","the close of 2006-03-31":"The close of 2006-03-31 is 11.39.","the close of 2009-11-30":"The close of 2009-11-30 is 24.51.","the close of 2026-04-30":"The close of 2026-04-30 is 16.89.","the close of 2010-01-29":"The close of 2010-01-29 is 24.62."}}},
{"id":"n-6a74418c","guard":[["hasAny",["element","give","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-03f61515","guard":[["hasAny",["element","give","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-09a44e93","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","give","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.title",["sense.after",{"lit":"close"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-18efdc94","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","give","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.title",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-42aeef02","guard":[["hasAny",["element","give","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["sense.after",{"lit":"close"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-52d77c59","guard":[["hasAny",["each word","element","give","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-cbc76a71","guard":[["hasAny",["element","give","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"close"}],["render.plain",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]]],"mem":null},
{"id":"n-e09f8450","guard":[["hasAny",["each word","element","give","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],"mem":null},
{"id":"n-0a66c518","guard":[["hasAny",["an even number","close","element","even","is even","item number","nth","position","root of","sqrt","square root"]],["nums==",3]],"pyramid":["render.yesNo",["compare.isEven",["compute.sqrt",["sense.second"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-15a14356","guard":[["not",["hasAny",["add","compare","larger","smaller","sum"]]]],"pyramid":["render.yesNo",["compare.isEven",["compute.sqrt",["sense.second"]]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],["render.template",{"lit":["The close ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"close"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]]],"mem":null},
{"id":"n-60144559","guard":[["not",["hasAny",["add","between","compare","high","larger","makes","open","smaller","sum"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}],["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"close"}],{"lit":1}]]],"mem":null},
{"id":"n-df0a350d","guard":[["hasAny",["close","delete","element","item number","nth","position","remove","strip out","without"]],["nums==",3]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}],["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"close"}],{"lit":1}]]],"mem":null},
{"id":"n-6e3a6064","guard":[["not",["has","sum"]]],"pyramid":["render.number",["compute.choose",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],{"lit":1}]],"mem":null},
{"id":"n-a12756b7","guard":[["hasAny",["binomial coefficient","choose","close","combinations","element","item number","n choose k","nth","position","ways to choose"]],["has","tell"]],"pyramid":["render.number",["compute.choose",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"}],{"lit":1}],{"lit":"fr-finance-vix-vix-monthly-e0dd17"},{"lit":"date"},{"lit":"close"}]],{"lit":1}]],"mem":null},
{"id":"n-08344af8","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2000-12-29":"The close of 2000-12-29 is 26.85."}}},
{"id":"n-099815e0","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1997-01-30":"The close of 1997-01-30 is 19.47."}}},
{"id":"n-0bba9b55","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2005-10-31":"The close of 2005-10-31 is 15.32."}}},
{"id":"n-0d50f8c1","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 1992-12-31":"The close of 1992-12-31 is 12.57."}}},
{"id":"n-0e11e135","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2014-05-30":"The close of 2014-05-30 is 11.4."}}},
{"id":"n-0e75c346","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2023-11-30":"The close of 2023-11-30 is 12.92."}}},
{"id":"n-147a2781","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2008-10-31":"The close of 2008-10-31 is 59.89."}}},
{"id":"n-14f0a765","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2019-06-28":"The close of 2019-06-28 is 15.08."}}},
{"id":"n-16c3e071","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2009-11-30":"The close of 2009-11-30 is 24.51."}}},
{"id":"n-17284cea","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2002-11-29":"The close of 2002-11-29 is 27.5."}}},
{"id":"n-1ce32c71","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 1996-11-29":"The close of 1996-11-29 is 17.14."}}},
{"id":"n-26836d55","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2023-08-31":"The close of 2023-08-31 is 13.57."}}},
{"id":"n-26edeabe","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2000-02-29":"The close of 2000-02-29 is 23.37."}}},
{"id":"n-27c3f310","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2010-10-29":"The close of 2010-10-29 is 21.2."}}},
{"id":"n-29078ebf","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2022-08-31":"The close of 2022-08-31 is 25.87."}}},
{"id":"n-2915dd76","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2003-03-31":"The close of 2003-03-31 is 29.15."}}},
{"id":"n-2aa878a3","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2020-04-30":"The close of 2020-04-30 is 34.15."}}},
{"id":"n-2beec03b","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2002-02-28":"The close of 2002-02-28 is 21.59."}}},
{"id":"n-2d24b673","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2000-08-31":"The close of 2000-08-31 is 16.84."}}},
{"id":"n-2e86650a","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2012-07-31":"The close of 2012-07-31 is 18.93."}}},
{"id":"n-2f1ab17d","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2019-11-29":"The close of 2019-11-29 is 12.62."}}},
{"id":"n-3593d1eb","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1990-10-31":"The close of 1990-10-31 is 30.04."}}},
{"id":"n-380fdb91","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1997-12-31":"The close of 1997-12-31 is 24.01."}}},
{"id":"n-3889c27a","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2001-10-31":"The close of 2001-10-31 is 33.56."}}},
{"id":"n-39f3b5b3","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 1993-10-29":"The close of 1993-10-29 is 11.46."}}},
{"id":"n-3ef8302d","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2015-10-30":"The close of 2015-10-30 is 15.07."}}},
{"id":"n-4011a27c","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2017-02-28":"The close of 2017-02-28 is 12.92."}}},
{"id":"n-43aee989","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1990-03-30":"The close of 1990-03-30 is 19.73."}}},
{"id":"n-4864ff9b","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1997-09-30":"The close of 1997-09-30 is 22.91."}}},
{"id":"n-48825a5a","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2005-06-30":"The close of 2005-06-30 is 12.04."}}},
{"id":"n-4c588981","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2013-05-31":"The close of 2013-05-31 is 16.3."}}},
{"id":"n-4f4c5461","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2023-04-28":"The close of 2023-04-28 is 15.78."}}},
{"id":"n-5326ceb1","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2005-11-30":"The close of 2005-11-30 is 12.06."}}},
{"id":"n-532752cd","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2016-03-31":"The close of 2016-03-31 is 13.95."}}},
{"id":"n-53f49ee2","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2005-04-29":"The close of 2005-04-29 is 15.31."}}},
{"id":"n-5b7c105b","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2009-04-30":"The close of 2009-04-30 is 36.5."}}},
{"id":"n-5cdb92e1","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1998-11-30":"The close of 1998-11-30 is 26.01."}}},
{"id":"n-5de40f9d","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2025-08-29":"The close of 2025-08-29 is 15.36."}}},
{"id":"n-62ea16ba","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2017-09-29":"The close of 2017-09-29 is 9.51."}}},
{"id":"n-6abd54ad","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2013-11-29":"The close of 2013-11-29 is 13.7."}}},
{"id":"n-6b780377","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2023-02-28":"The close of 2023-02-28 is 20.7."}}},
{"id":"n-6ca35b60","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2002-09-30":"The close of 2002-09-30 is 39.69."}}},
{"id":"n-71d4b93d","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2021-10-29":"The close of 2021-10-29 is 16.26."}}},
{"id":"n-75a38f64","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2020-09-30":"The close of 2020-09-30 is 26.37."}}},
{"id":"n-788fa9c9","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2021-01-29":"The close of 2021-01-29 is 33.09."}}},
{"id":"n-7a623d9f","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 1991-07-31":"The close of 1991-07-31 is 15.18."}}},
{"id":"n-7b1d8d9f","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 1996-10-31":"The close of 1996-10-31 is 18.11."}}},
{"id":"n-7bfc8a8a","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 1995-11-30":"The close of 1995-11-30 is 11.58."}}},
{"id":"n-7fe0cd17","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 1999-05-28":"The close of 1999-05-28 is 25.39."}}},
{"id":"n-82bd737f","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2026-04-30":"The close of 2026-04-30 is 16.89."}}},
{"id":"n-85644830","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 1994-05-31":"The close of 1994-05-31 is 13.03."}}},
{"id":"n-866b05ae","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 1990-05-31":"The close of 1990-05-31 is 17.37."}}},
{"id":"n-8b2f1a0d","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2026-02-27":"The close of 2026-02-27 is 19.86."}}},
{"id":"n-9012f043","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2021-02-26":"The close of 2021-02-26 is 27.95."}}},
{"id":"n-90e2fb05","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2010-12-31":"The close of 2010-12-31 is 17.75."}}},
{"id":"n-94f038dd","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2000-11-30":"The close of 2000-11-30 is 29.65."}}},
{"id":"n-9557e72a","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2014-08-29":"The close of 2014-08-29 is 11.98."}}},
{"id":"n-96dca95d","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1995-05-31":"The close of 1995-05-31 is 12.85."}}},
{"id":"n-991f0fef","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2023-06-30":"The close of 2023-06-30 is 13.59."}}},
{"id":"n-9cde303a","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2001-11-30":"The close of 2001-11-30 is 23.84."}}},
{"id":"n-9de3b957","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2013-10-31":"The close of 2013-10-31 is 13.75."}}},
{"id":"n-a1a1e92c","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2004-12-31":"The close of 2004-12-31 is 13.29."}}},
{"id":"n-a256050f","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 1998-01-30":"The close of 1998-01-30 is 21.47."}}},
{"id":"n-a3c0d33c","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 1998-08-31":"The close of 1998-08-31 is 44.28."}}},
{"id":"n-a4793c0f","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 1998-12-31":"The close of 1998-12-31 is 24.42."}}},
{"id":"n-a905638e","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1990-04-30":"The close of 1990-04-30 is 19.52."}}},
{"id":"n-adff925e","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2020-11-30":"The close of 2020-11-30 is 20.57."}}},
{"id":"n-af7efd1b","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2024-03-28":"The close of 2024-03-28 is 13.01."}}},
{"id":"n-af914470","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2016-11-30":"The close of 2016-11-30 is 13.33."}}},
{"id":"n-b2dec257","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2007-05-31":"The close of 2007-05-31 is 13.05."}}},
{"id":"n-b65ca66c","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2022-09-30":"The close of 2022-09-30 is 31.62."}}},
{"id":"n-b7407cb6","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2021-11-30":"The close of 2021-11-30 is 27.19."}}},
{"id":"n-b7e9c2fc","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 1993-12-31":"The close of 1993-12-31 is 11.66."}}},
{"id":"n-b8dceabb","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2007-09-28":"The close of 2007-09-28 is 18."}}},
{"id":"n-b930b5b9","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 1998-05-29":"The close of 1998-05-29 is 21.32."}}},
{"id":"n-b9c881fb","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2026-03-31":"The close of 2026-03-31 is 25.25."}}},
{"id":"n-ba10c489","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 1990-01-31":"The close of 1990-01-31 is 25.36."}}},
{"id":"n-bab5a30d","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2020-07-31":"The close of 2020-07-31 is 24.46."}}},
{"id":"n-bb009220","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2024-04-30":"The close of 2024-04-30 is 15.65."}}},
{"id":"n-bca00c6f","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1991-05-31":"The close of 1991-05-31 is 15.93."}}},
{"id":"n-bdb54e73","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2002-12-31":"The close of 2002-12-31 is 28.62."}}},
{"id":"n-bec4a1e3","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 1999-02-26":"The close of 1999-02-26 is 27.88."}}},
{"id":"n-c26f1dcd","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2019-07-31":"The close of 2019-07-31 is 16.12."}}},
{"id":"n-c4b37df6","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2002-05-31":"The close of 2002-05-31 is 19.98."}}},
{"id":"n-c4e18042","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2007-10-31":"The close of 2007-10-31 is 18.53."}}},
{"id":"n-c52b06e8","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2004-08-31":"The close of 2004-08-31 is 15.29."}}},
{"id":"n-c632695c","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2018-12-31":"The close of 2018-12-31 is 25.42."}}},
{"id":"n-cbdd60fc","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2004-07-30":"The close of 2004-07-30 is 15.32."}}},
{"id":"n-ccf16238","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2020-05-29":"The close of 2020-05-29 is 27.51."}}},
{"id":"n-d39a4c0b","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2011-08-31":"The close of 2011-08-31 is 31.62."}}},
{"id":"n-d6ef4b12","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 1994-09-30":"The close of 1994-09-30 is 14.28."}}},
{"id":"n-d717eaa6","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2002-06-28":"The close of 2002-06-28 is 25.4."}}},
{"id":"n-d9c86a07","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2023-05-31":"The close of 2023-05-31 is 17.94."}}},
{"id":"n-db00c9b0","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 2025-09-30":"The close of 2025-09-30 is 16.28."}}},
{"id":"n-e3e1870d","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2006-03-31":"The close of 2006-03-31 is 11.39."}}},
{"id":"n-ea6ef0dc","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the close of 2010-01-29":"The close of 2010-01-29 is 24.62."}}},
{"id":"n-f1e44999","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2018-02-28":"The close of 2018-02-28 is 19.85."}}},
{"id":"n-f43acb54","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1992-09-30":"The close of 1992-09-30 is 14.28."}}},
{"id":"n-f9b0264b","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the close of 1999-03-31":"The close of 1999-03-31 is 23.26."}}},
{"id":"n-fcedff67","guard":[["has","close"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the close of 2003-04-30":"The close of 2003-04-30 is 21.21."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"tell me the close of 2013-10-31","expect":{"contains":["13.75"],"notRefusal":true}},{"q":"what is the close of 2021-01-29","expect":{"contains":["33.09"],"notRefusal":true}},{"q":"what is the close of 1999-05-28","expect":{"contains":["25.39"],"notRefusal":true}},{"q":"give the close of 1990-04-30","expect":{"contains":["19.52"],"notRefusal":true}},{"q":"give the close of 2002-06-28","expect":{"contains":["25.4"],"notRefusal":true}},{"q":"tell me the close of 2017-02-28","expect":{"contains":["12.92"],"notRefusal":true}},{"q":"tell me the close of 2018-02-28","expect":{"contains":["19.85"],"notRefusal":true}},{"q":"tell me the close of 1993-12-31","expect":{"contains":["11.66"],"notRefusal":true}},{"q":"what is the close of 1998-05-29","expect":{"contains":["21.32"],"notRefusal":true}},{"q":"tell me the close of 2003-04-30","expect":{"contains":["21.21"],"notRefusal":true}},{"q":"what is the close of 2023-11-30","expect":{"contains":["12.92"],"notRefusal":true}},{"q":"give the close of 1997-09-30","expect":{"contains":["22.91"],"notRefusal":true}},{"q":"what is the close of 2022-08-31","expect":{"contains":["25.87"],"notRefusal":true}},{"q":"tell me the close of 2004-07-30","expect":{"contains":["15.32"],"notRefusal":true}},{"q":"give the close of 2004-12-31","expect":{"contains":["13.29"],"notRefusal":true}},{"q":"what is the close of 2010-12-31","expect":{"contains":["17.75"],"notRefusal":true}},{"q":"what is the close of 2023-06-30","expect":{"contains":["13.59"],"notRefusal":true}},{"q":"give the close of 2025-09-30","expect":{"contains":["16.28"],"notRefusal":true}},{"q":"what is the close of 2021-02-26","expect":{"contains":["27.95"],"notRefusal":true}},{"q":"what is the close of 2001-10-31","expect":{"contains":["33.56"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
