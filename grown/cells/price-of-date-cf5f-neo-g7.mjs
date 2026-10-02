// price-of-date-cf5f-neo-g7.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"price-of-date-cf5f-neo-g7","class":"price-of-date-cf5f","generation":7,"lane":"neo","grownFrom":["what is the price of 1995-12-11","give the price of 2025-08-12","give the price of 2025-08-04","what is the price of 1988-09-20","give the price of 2000-11-07","tell me the price of 2004-03-19","give the price of 2005-04-04","what is the price of 2018-02-07","what is the price of 2014-07-31","tell me the price of 2020-03-11","what is the price of 2000-02-24","give the price of 2024-03-26","tell me the price of 1998-07-15","what is the price of 1994-03-14","give the price of 1993-01-22","what is the price of 2008-07-25","tell me the price of 2012-06-18","give the price of 2004-10-14","what is the price of 2010-09-08","tell me the price of 2000-08-07"],"version":1});

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
knowLoad([{"id":"fr-oil-prices-brent-daily-830bec","columns":["date","price"],"n":9097,"cols":[{"f":"01987-05-20|91|92|95|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|830|67-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|98|99|830|91|38-01-04|95|96|98|811|92|93|94|98|99|820|91|92|95|97|98|99|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-05|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|66-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|67-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|98|99|830|39-01-03|94|95|96|99|810|91|92|93|96|97|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|63-01|92|93|96|97|99|810|93|94|95|96|97|820|91|92|93|98|99|830|91|64-03|94|95|96|97|810|91|92|93|97|98|99|821|94|95|96|97|98|65-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|97|98|99|290-01-02|93|94|95|98|99|810|91|95|96|97|98|99|822|93|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|93|94|95|96|99|810|91|92|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|97|98|831|31-01-02|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|68-01|92|95|96|97|98|99|812|94|95|96|99|820|91|92|93|96|97|98|99|830|69-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|811|94|95|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-03|94|95|96|99|810|91|93|96|97|98|99|820|93|94|96|97|830|91|32-01-02|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|64-02|93|96|97|99|810|93|94|95|96|820|91|92|94|97|98|99|830|65-01|94|95|96|97|98|812|93|94|95|98|99|820|92|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|97|98|810|91|94|95|96|97|98|821|92|93|94|98|99|830|510-01|92|95|96|97|98|99|812|93|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|99|830|91|33-01-04|95|96|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-01|92|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|92|95|96|97|98|813|94|95|96|99|820|91|93|96|97|98|99|830|65-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|67-01|92|95|96|97|98|99|813|94|95|96|99|820|91|93|99|68-02|93|94|95|99|810|91|92|93|96|97|99|820|93|94|95|96|97|69-01|92|93|96|97|98|99|810|93|94|95|96|97|820|92|93|97|830|510-01|95|96|97|98|811|92|94|99|820|91|92|98|99|61-01|94|95|99|810|92|96|97|98|99|823|95|96|99|830|62-01|92|98|99|814|96|97|821|92|94|99|830|91|34-01-05|810|91|92|93|94|97|98|820|91|94|95|97|98|831|62-01|97|98|811|94|96|98|821|94|95|98|63-01|92|93|98|99|811|94|95|97|98|821|92|93|99|64-08|812|94|95|820|92|95|96|97|65-04|95|96|817|98|823|94|95|831|66-01|92|98|816|97|828|830|67-05|96|98|813|94|95|826|97|99|68-01|92|93|94|98|810|91|92|95|96|97|99|822|93|95|96|69-01|98|812|94|95|96|99|820|92|93|96|97|830|510-03|95|96|813|99|820|91|95|96|97|98|61-01|93|94|97|98|99|811|94|95|96|97|98|823|95|99|830|62-01|95|98|813|95|96|99|821|35-01-03|812|97|99|820|96|830|62-01|96|98|817|820|91|92|93|94|98|63-03|810|93|824|97|98|99|830|91|64-05|810|92|93|98|824|97|98|65-01|93|94|98|99|815|96|98|99|826|831|66-05|97|98|99|812|93|94|95|96|829|67-06|97|810|93|94|97|98|824|96|97|831|68-02|93|94|97|98|810|94|96|97|98|824|95|99|830|91|69-01|94|95|98|814|95|98|99|820|92|95|97|99|510-02|93|94|95|96|811|92|93|96|97|99|823|95|61-03|96|810|97|820|91|92|94|97|99|830|62-07|98|811|94|95|98|820|97|99|36-01-02|94|95|98|99|810|91|92|97|98|823|96|830|91|62-01|97|98|99|812|93|94|95|99|820|92|97|99|63-05|96|97|811|92|93|94|98|99|820|91|95|96|98|99|64-01|92|93|94|810|91|92|95|97|99|822|93|94|95|96|99|830|65-02|93|97|98|99|810|94|95|96|97|820|91|92|93|94|98|99|830|91|66-04|97|810|92|93|820|91|95|97|67-02|94|95|98|811|92|95|96|97|98|99|824|96|99|68-01|92|95|96|97|98|812|93|95|99|822|93|97|830|69-02|93|94|96|99|810|91|92|96|97|98|99|820|94|95|96|97|830|510-02|93|97|98|99|810|94|95|97|98|821|92|95|830|61-01|94|95|96|811|92|93|95|98|820|91|92|95|96|97|98|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|830|91|37-01-02|93|96|97|98|99|815|96|97|820|91|92|93|94|97|98|99|830|91|62-03|94|95|96|810|92|93|94|97|98|99|820|91|94|95|96|97|98|63-03|94|810|91|92|93|94|97|98|820|91|94|95|96|97|98|831|64-01|92|93|94|97|98|99|811|97|98|821|92|93|94|95|98|99|830|65-01|95|96|97|98|99|812|94|96|99|820|91|92|93|97|98|830|66-02|93|94|95|96|810|93|96|98|99|820|93|830|67-02|93|97|99|811|94|95|96|97|98|821|92|93|94|95|98|99|830|68-05|97|98|812|93|94|95|98|99|820|91|95|96|97|98|99|69-02|93|94|95|98|811|95|96|98|99|823|94|510-01|92|93|96|97|99|813|96|97|820|92|98|99|831|61-03|94|95|96|97|810|92|94|97|820|94|95|62-02|93|94|98|99|810|91|92|97|98|824|830|38-01-02|95|97|98|99|812|93|94|95|96|99|821|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|98|99|824|96|97|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|64-03|814|820|91|92|93|99|65-11|92|93|95|99|820|91|92|99|66-01|94|95|98|811|92|95|96|97|98|99|822|93|94|95|96|99|830|67-02|93|96|97|98|810|94|95|96|97|820|91|92|93|94|97|98|830|68-03|94|95|96|97|810|91|92|93|94|97|98|827|98|69-02|93|94|97|98|810|91|94|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|97|98|99|814|95|99|820|91|92|93|96|97|98|99|61-02|93|94|95|810|92|93|97|98|99|820|94|95|96|97|830|62-01|92|93|94|97|98|99|810|96|97|98|821|92|93|94|831|39-01-04|95|96|811|93|94|98|99|820|92|95|97|98|99|62-01|92|93|95|98|99|810|91|97|98|99|822|94|95|96|63-01|93|95|99|815|96|97|98|822|93|94|95|96|99|831|64-01|96|97|98|99|812|95|821|93|96|97|98|99|830|65-04|95|96|811|93|98|821|94|95|96|66-02|93|98|99|811|94|95|96|97|98|822|93|95|98|99|830|67-07|98|99|812|93|94|95|99|820|92|93|96|97|98|68-02|93|95|96|810|92|93|96|820|94|97|69-07|98|99|810|93|94|95|96|821|92|93|94|97|98|99|830|510-04|95|96|97|98|811|92|93|94|95|98|821|97|98|99|61-01|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|62-01|92|93|96|97|98|99|810|95|96|97|820|91|92|93|99|830|02000-01-04|95|96|97|810|91|92|93|97|98|99|820|91|95|96|97|98|831|62-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|63-01|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|831|64-04|95|96|810|91|92|93|94|97|99|820|95|96|97|98|65-02|93|95|98|99|810|95|96|97|822|93|94|95|830|91|66-01|92|95|96|97|98|99|812|93|95|99|820|91|93|96|97|98|99|830|67-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|831|68-01|92|93|94|97|98|818|821|92|93|94|95|99|830|69-01|94|95|96|97|98|811|93|94|95|98|99|821|92|95|96|98|99|510-03|94|95|96|99|810|91|92|96|97|98|99|820|94|95|96|97|830|91|61-01|92|93|97|810|94|95|96|97|820|91|92|93|94|97|98|830|62-01|94|96|811|95|98|99|820|97|98|31-01-02|93|94|95|98|99|812|98|823|94|95|96|99|830|62-01|92|95|96|98|813|95|96|99|820|91|92|96|98|63-01|96|98|816|99|820|91|92|93|96|97|98|99|64-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|812|93|94|95|98|99|820|91|92|95|96|97|99|67-03|94|95|96|99|810|91|92|93|96|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|816|97|820|92|93|94|98|99|830|69-03|95|96|810|93|99|821|94|95|96|97|98|510-01|92|810|91|92|96|97|98|99|823|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|821|93|98|830|62-04|95|96|97|811|97|98|99|820|91|94|831|32-01-02|93|94|97|98|99|810|91|94|95|821|92|93|94|95|98|99|831|62-01|94|95|97|98|819|820|92|96|97|98|63-01|94|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|64-01|92|93|94|95|98|99|810|91|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|97|98|99|810|93|94|95|96|821|92|93|94|97|98|99|66-05|96|97|810|91|93|94|99|824|95|97|98|67-01|92|93|94|98|99|810|91|96|98|99|822|94|96|99|830|91|68-01|92|96|97|98|99|812|93|94|95|96|99|821|92|96|98|99|69-02|93|94|95|810|91|92|93|97|98|99|820|93|95|96|97|830|510-01|92|97|98|99|811|94|95|96|97|98|821|94|99|830|91|61-01|94|97|815|98|99|820|95|98|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|97|830|33-01-02|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|92|93|94|97|99|820|91|95|96|97|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|64-01|92|93|94|97|98|99|810|94|95|98|821|92|93|94|95|99|65-01|92|95|96|99|812|94|95|96|99|820|91|92|93|96|97|98|99|830|66-02|93|94|810|91|92|93|97|98|99|820|94|95|96|830|67-01|92|93|97|99|816|97|98|823|94|95|98|99|830|91|68-01|94|95|96|97|98|811|93|94|95|98|99|820|91|92|95|96|97|98|99|69-01|92|93|94|95|98|99|810|91|92|95|97|98|99|824|95|830|510-01|92|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|830|91|61-03|95|96|97|810|91|92|93|94|97|98|99|824|96|97|98|62-01|92|93|94|95|99|810|91|92|95|96|97|98|99|822|93|99|830|91|34-01-06|97|813|94|95|96|99|820|91|92|93|96|97|98|99|62-04|95|96|811|96|97|98|99|823|94|95|97|63-01|92|93|94|95|99|810|91|92|95|96|97|99|822|93|94|95|96|99|830|91|64-01|92|95|96|97|98|99|812|94|95|96|99|821|93|96|97|830|65-03|94|95|96|97|810|91|93|94|97|98|99|820|91|94|95|97|98|831|66-01|92|93|94|97|98|99|810|91|94|96|97|98|821|92|93|94|95|98|99|830|67-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|68-02|93|94|95|96|99|810|91|93|96|97|98|99|820|93|94|95|96|97|831|69-02|93|97|99|810|93|94|96|97|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|830|91|35-01-04|95|96|97|810|91|92|93|97|98|99|820|94|95|96|97|98|831|62-01|92|93|94|97|98|810|91|94|95|96|97|98|821|92|93|94|95|98|63-02|93|94|97|98|817|98|821|92|93|94|831|64-04|95|96|97|98|811|92|98|820|92|95|97|98|65-05|96|99|810|91|92|93|96|97|98|820|93|94|95|96|97|830|91|66-01|92|93|96|97|98|99|810|93|94|97|820|91|92|93|94|97|98|99|830|67-01|94|95|96|97|98|811|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|95|96|97|98|99|812|93|94|95|99|820|91|92|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|99|810|91|94|95|96|98|821|92|93|94|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|98|99|830|36-01-03|94|95|96|99|810|96|97|98|99|820|93|94|95|96|97|830|91|62-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|63-01|97|98|810|93|822|94|97|830|64-03|96|812|93|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|810|95|96|97|98|99|822|93|94|95|96|99|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|97|98|99|37-01-02|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|98|99|812|93|94|95|96|820|91|92|93|96|97|98|63-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|93|94|95|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|97|98|831|38-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|39-01-02|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|813|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|69-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|210-01-04|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|65-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|67-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|69-01|92|93|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|97|98|99|830|91|31-01-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|96|97|98|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|66-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|67-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|69-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|98|99|830|32-01-03|94|95|96|99|810|91|92|93|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|821|92|93|94|97|98|99|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|64-02|94|95|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|96|97|98|831|33-01-02|93|94|97|98|99|810|91|94|95|96|97|98|822|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|96|97|830|91|34-01-02|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|98|99|820|91|94|95|96|97|98|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|821|92|93|94|95|98|99|830|65-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-01|92|93|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|69-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|96|99|830|91|35-01-02|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|69-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|36-01-04|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|96|97|98|99|822|93|94|95|96|99|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|65-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|66-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|67-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|69-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|98|99|830|37-01-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|97|810|91|92|93|97|98|99|820|91|94|95|96|97|98|65-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|69-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|97|98|99|38-01-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|63-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|64-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|65-01|92|93|94|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|66-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|67-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|68-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|69-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|510-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|61-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|97|98|39-01-02|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|64-01|92|93|94|95|98|99|810|91|92|95|96|97|98|822|93|94|95|96|99|830|65-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|69-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|96|97|830|91|220-01-02|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|93|96|97|98|99|814|95|96|97|820|91|92|93|94|97|98|99|830|65-01|94|95|96|97|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|69-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|510-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|61-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|98|99|830|91|31-01-04|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|63-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|64-01|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|65-04|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|66-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|67-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|68-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|831|69-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|510-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|61-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|99|830|91|32-01-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|62-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|63-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|64-01|94|95|96|97|98|811|92|93|94|99|820|91|92|95|96|97|98|99|65-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|66-01|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|67-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|68-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|69-01|92|95|96|97|98|99|812|93|94|95|96|820|91|92|93|96|97|98|99|830|510-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|61-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|98|99|830|33-01-03|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|62-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|63-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|64-03|94|95|96|811|92|93|94|97|98|99|820|91|94|95|96|97|98|65-02|93|94|95|99|810|91|92|95|96|97|98|99|822|93|94|95|96|830|91|66-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|67-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|68-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|99|830|91|69-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|510-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|61-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|62-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|97|98|99|34-01-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|62-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|63-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|64-02|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|65-01|92|93|97|98|99|810|93|94|95|96|97|820|91|92|93|94|98|99|830|91|66-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|67-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|91|68-01|92|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|69-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|510-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|61-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|95|96|97|98|99|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|97|830|91|35-01-02|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|62-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|63-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|831|64-01|92|93|94|97|98|99|810|91|94|95|96|97|822|93|94|95|98|99|830|65-01|92|96|97|98|99|812|93|94|95|96|99|820|91|92|93|97|98|99|830|66-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|67-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99|830|91|68-01|94|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|69-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|510-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|61-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|62-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|99|830|91|36-01-02|95|96|97|98|99|812|93|94|95|96|99|820|91|92|93|96|97|98|99|830|62-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|63-02|93|94|95|96|99|810|91|92|93|96|97|98|99|820|93|94|95|96|97|830|91|64-01|92|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|65-01|95|96|97|98|811|92|93|94|95|98|99|820|91|92|96|97|98|99|66-01|92|93|94|95|98|99|810|91|92|95|96|97|98|99|822|93|94|95|96|99|830|67-01|92|93|96|97|98|99|810|93|94|95|96|97|820|91|92|93|94|97|98|99|830|91|68-03|94|95|96|97|810|91|92|93|94|97|98|99|820|91|94|95|96|97|98|69-01|92|93|94|97|98|99|810|91|94|95|96|97|98|821|92|93|94|95|98|99","sep":"|"},{"s":"18.63|18.45|18.55|18.6|18.63|18.6|18.6|18.58|18.65|18.68|18.75|18.78|18.65|18.75|18.78|18.78|18.68|18.78|18.9|19.03|19.05|19.05|19.1|18.9|18.75|18.7|19.08|19.15|19.08|18.98|19.25|19.33|19.48|19.5|19.48|19.68|19.73|19.83|19.88|20.28|20.4|20.63|20.55|20.35|20.33|20.15|19.58|19.3|19.78|19.98|20.2|20.03|20.95|20.65|19.8|19.75|19.65|19.43|19.45|19.5|19.4|19.25|18.85|18.75|18.5|18.3|18.1|17.48|17.55|18.1|18.28|18.2|18.63|18.43|18.4|18.18|18.13|17.6|17.68|17.9|18.3|18.18|18.15|18.53|18.53|18.43|18.3|18.28|18.48|18.48|18.68|18.6|18.65|18.5|18.48|18.5|18.65|18.78|18.6|18.58|18.63|18.6|18.55|18.55|18.68|18.68|19|19.1|18.78|18.93|19.13|18.98|18.75|18.8|18.85|18.75|18.8|18.63|18.38|17.93|17.85|17.95|17.5|17.75|17.8|17.85|17.8|17.68|17.4|17.18|17.48|17.6|17.9|17.83|17.68|17.73|17.78|17.7|17.65|17.7|17.93|18|17.78|17.58|17.43|17.55|17.73|16.8|16.2|15.93|15.03|15.6|16.7|17.25|17.1|17|17.38|17.85|17.6|17.95|17.08|17.9|16.88|16.65|15.95|16.38|16.55|16.83|17.1|16.83|17.08|16.7|16.45|16.13|16.1|16.28|16.1|16.18|16.15|16.18|16.1|16.5|16.4|16.13|16.1|15.75|15.68|15.63|15.85|15.48|15.55|15.38|15.58|15.35|14.85|14.65|14.73|14.18|13.8|14|14|13.9|13.8|13.98|14.48|14.88|14.28|14.3|14.45|14.43|14.93|15.38|15.03|15.4|15.65|15.45|15.55|15.6|15.7|15.65|15.5|15.38|15.53|15.55|16.2|16.48|16.55|16.65|16.85|17.45|17.05|16.78|17|17.15|17.13|17.18|17.4|16.88|16.6|15.95|16.08|16.15|16.15|16.45|16.5|16.38|16.48|16.4|16.5|16.6|16.6|16.4|16.25|16.45|16.23|16.3|16.18|16.18|16.25|16.23|16.2|16.33|16.33|16.45|16.25|16.23|16.28|16.3|15.85|15.53|15.85|15.7|15.43|15.48|15|15|15.13|15.18|15.15|14.93|14.83|14.55|14.18|13.95|14.05|13.98|14.5|15.5|15.05|14.63|14|14.1|14.1|14.25|15|14.93|15.48|15.63|15.83|15.8|15.38|15.45|15.75|15.6|15.35|15|14.5|14.85|15.48|15.4|15.1|15.13|14.98|14.8|14.85|14.75|14.78|14.85|15.03|14.8|14.85|14.63|14.5|14.48|14.45|14.4|14.15|14|13.68|13.35|13.18|13.3|13.25|12.7|13.4|13.9|13.5|13.23|12.85|13.15|13.05|13.2|13.2|13.1|12.58|12.75|12.5|11.93|11.6|11.65|11.2|11.3|11.35|12.2|12.35|12.45|12.55|13.2|13.55|12.9|13.35|13.5|13.48|12.2|12.08|12.08|12.33|12.6|12.6|12.18|12.35|12.5|12.75|12.75|12.6|12.7|13.03|13.03|13|13|12.7|12.05|12.08|12.13|13.35|13.33|12.98|14.7|14.73|14.25|14.35|14.93|14.8|14.73|14.4|14.7|15.05|14.9|15.2|15.18|15.35|15.58|15.6|15.3|15.28|15.33|15.25|15.38|16.1|15.9|16.23|16.4|16.53|16.58|16.85|17|16.75|16.9|16.85|17.4|17.5|17.78|18.1|18.15|16.98|17.05|17.7|17.73|17.18|16.85|16.38|16.4|16.95|16.75|16.5|16.6|16.75|16.58|16.4|16.5|16.83|16.75|17.15|17.15|17.38|17.2|16.95|17.1|17.05|17.55|17.23|17.25|17.45|17.73|17.73|17.55|17.8|17.63|18.1|18.63|19.08|18.95|19.3|19.18|19.63|19.6|19.93|19.73|19.45|20|20.45|19.65|19.9|19.75|19.08|19.4|19.6|19.95|19.85|19.95|19.88|20.2|21.5|21.6|21.2|21.15|21.05|20.65|20.15|19.15|18.88|19.7|19.4|18.8|19.03|18.88|19.3|19.2|19.2|19.8|18.58|18.6|18.3|17.4|17.7|18.15|18.2|17.65|17.73|18.03|18.25|18.08|18.15|18.55|18.5|18.15|17.8|17.95|17.18|16.8|16.9|16.95|16.65|16.85|16.88|17.13|17.3|18.03|18.23|18.2|18|18.2|18.28|18.4|18.6|18.75|18.3|17.85|17.83|17.63|17.65|17.6|17.9|18.05|18.05|17.85|17.98|17.83|17.3|17.05|16.5|16.28|16.38|16.3|16.23|16.1|16.4|16.15|16.05|16.28|16.45|16.93|17|16.85|17|17|16.95|16.83|16.9|17.1|17.08|17.05|16.95|16.98|17.1|17.13|17.2|17.33|17.43|17.45|17.8|17.8|17.83|17.98|17.9|18.05|17.9|17.88|18.05|17.9|17.8|17.85|17.53|17.45|17.45|17.55|17.93|18.23|18.58|18.73|18.78|18.43|18.45|18.25|18.55|18.85|19.23|19.6|19.38|19.53|19.43|19.33|19.2|18.88|18.8|18.88|18.48|18.7|18.98|18.93|19.23|19.2|19|18.95|18.9|18.9|18.85|19.05|18.85|18.7|18.65|18.65|18.75|18.8|18.68|18.6|18.4|18.48|18.5|18.23|18.15|18.48|18.68|19.28|19.18|19.28|19.33|19.15|19.45|19.53|19.78|19.68|19.68|19.98|20.28|20.23|20.13|20.5|20.9|20.85|21.05|21.2|22.65|22.5|23.13|21.38|21.03|21.95|21.88|21.6|21.15|20.45|20.78|21.28|20.88|20.23|20.55|20.63|20.73|20.73|20.5|20.58|20.73|20.73|20.6|20.15|20.05|19.75|19.68|20.03|19.6|19.9|19.88|19.95|19.68|19.5|19.35|18.78|18.9|19.23|19.2|19.33|19.18|19.15|19.18|18.95|18.73|18.68|18.3|18.53|18.33|18.48|18.4|17.83|17.75|17.78|17.83|17.88|18.23|18.1|18.03|17.9|17.95|18.18|18.2|17.95|17.55|17.1|16.53|15.93|15.3|15.8|15.7|15.33|16.13|16.35|16.95|16.75|16.5|16.6|16.43|16.35|16.43|16.58|15.93|15.58|15.65|16.18|16.45|16.7|16.73|17.4|17.4|17.25|17.05|17.08|16.65|16.48|15.7|15.8|15.95|15.48|15.98|15.3|15.43|15.35|14.78|14.8|15.03|14.68|14.73|14.95|14.9|15.3|15.15|14.83|14.75|14.75|14.75|15.4|15.58|15.58|15.33|15.4|15.73|15.4|15.48|15.48|15.23|15.35|14.98|15.58|15.7|15.88|17.03|17.7|17.58|17.7|17.85|18|18.73|19.08|19|18.73|19.03|18.98|19.23|19.93|22.25|24.13|27.28|27.35|25.15|25.9|26.3|26.63|27.1|26.53|27.2|28.45|28.9|29.05|30.45|32.35|31.65|27.65|27.65|27.65|27.5|27.8|30.53|30.08|31.23|32.15|31.45|31.45|32.1|31.28|31.88|33.35|34.9|35.95|35.08|35.65|36.95|40.75|39.9|40.85|41.45|41|38.95|35.45|37.55|37.2|39.05|39.2|40.9|40.2|41.15|39.9|38.28|38.93|35.33|35.65|33.2|27.45|28.95|30.1|32.9|33.73|34.65|35.5|34.3|35.65|35.05|33.8|33.2|34.55|34.85|34.25|32.85|33.65|31.95|32.2|30.55|30.85|30.1|30.65|31.4|32.05|35.1|34.83|34.1|34.65|31.2|31.25|31.5|30.2|27.35|28.3|28.75|28.03|27.28|27.8|28.45|28.2|27.55|28.13|27.55|26.9|27.7|27.7|27.05|27.43|28.35|26.78|25.05|24.08|25.93|25.73|22.35|26.58|26.05|29.55|29.25|30.28|21.1|19.1|19.25|20.73|22.15|20.9|20.8|20.4|20.75|20.95|20.7|20.8|20.45|20.2|20.93|20.9|20.65|21.23|21.1|21|20.5|18.35|17.68|17.85|18.75|18.55|17.8|17.83|18|18.65|19.5|19.33|20.2|20.05|19.85|19.65|19.1|18.6|18.43|20.33|19.98|19.05|18.3|18.95|18.98|18.8|18.95|18.6|18.35|18.15|18|18|17.63|17.75|18|18.35|18.58|18.6|19.25|19.5|19.93|20.23|19.9|19.85|19.4|19.18|19.78|19.6|19.55|19.6|19.63|19.95|19.7|19.7|19.7|19.55|19.8|19.85|19.8|20.08|19.53|19.25|18.95|18.8|18.75|18.75|18.9|19.03|18.58|18.78|18.83|19|18.75|18.73|19|19|18.83|18.63|18.03|18.28|18|17.85|17.73|18|17.7|17.85|18|17.88|18.15|18.43|18.18|18.15|18.1|18.08|18.48|18.53|18.55|18.5|18.48|18.7|18.98|19.03|19.23|19.2|19.78|19.6|19.83|20.13|20.28|20.28|20.08|19.58|19.33|19.73|19.58|19.48|19.65|19.73|19.4|19.5|19.45|19.35|19.7|19.58|19.63|19.23|19.25|19.35|20.55|20.98|19.55|19.53|19.85|20.03|20.03|19.98|20.3|20.53|20.65|20.55|20.1|20.13|19.85|19.93|20|20.25|20.35|20.53|20.3|20.53|20.43|20.55|20.83|20.75|20.65|21|21.48|21.43|21.15|21.3|21.75|21.83|21.98|21.95|22.43|22.08|22.6|22.83|22.73|23|22.95|22.65|22.48|22.25|22.35|21.9|21.85|21.95|22|22.53|22.73|22.53|22|21.85|21.8|21.45|21.2|21.5|21|21.63|21.35|21.08|20.48|20.73|20.15|19.78|19.78|19.65|19.98|20.08|19.2|19.18|19.15|19.05|18.25|18.1|18.28|19.05|18.55|18.13|18.15|18.15|18.55|17.6|17.78|17.78|17.75|18|17.75|18.45|18.5|18.75|18.4|17.3|17.18|17.23|18.08|18.23|18.38|18.68|18.48|18.45|17.85|17.83|18.1|18.33|18.55|18.43|18.15|18.1|18.35|18.4|18.48|18.53|18.58|18.95|18.48|18.33|18.53|18.63|17.65|17.7|17.5|17.85|18|17.4|17.43|17.28|17.55|17.45|17.35|17.05|17.28|17.43|17.3|17.35|17.35|17.2|17.35|17.73|17.73|17.88|17.65|17.65|17.75|17.58|17.65|17.7|17.98|17.85|19.09|18.53|18.63|18.93|18.93|18.95|19.05|19.03|18.85|18.6|18.95|18.95|19|18.73|18.9|18.9|19.18|19.28|19.65|19.83|19.88|19.98|19.68|19.65|19.63|19.8|19.95|19.75|19.7|19.7|19.3|19.28|19.58|20.8|20.73|20.7|20.9|20.85|21.23|21.08|21.35|21.25|21.13|21.05|21.33|21.28|21.3|21.13|21.03|21.23|21.13|20.83|21.35|21.55|21.5|21.3|21.08|20.6|20.25|20.53|20.65|20.45|19.8|19.7|19.78|20|19.83|19.98|19.85|20.23|20.2|19.95|20.03|20.48|20.6|20.58|20.78|20.68|20.48|20.38|20.33|19.85|19.68|19.78|19.75|19.55|19.48|19.65|19.83|19.88|19.95|19.9|19.8|19.63|19.68|19.65|19.68|19.63|19.5|19.65|19.65|19.88|20|19.95|20.03|20.13|20.3|20.3|20.35|20.68|20.5|20.43|20.35|20.3|20.15|20.33|20.53|20.43|20.28|20.18|20.18|20.28|20.4|20.2|20.23|20.28|20.48|20.48|20.8|20.83|20.73|20.78|20.73|20.68|20.28|20.13|20.03|19.78|19.78|19.65|19.4|19.13|19.25|19.35|19.03|19.2|19.13|19.1|19.53|19.4|19.18|19.05|19.2|19.15|19.1|19.48|19.48|19.15|19.18|19.28|18.93|19.08|19.25|18.65|18.38|18.2|18.35|18.25|18.08|17.8|18.28|18.2|18.03|17.8|17.9|18.18|18.3|18.33|18.08|18.23|18.28|17.93|17.83|17.85|17.73|17.48|17.53|17.23|17.28|16.85|16.85|17|17.28|17.25|16.98|16.7|16.88|17.08|17.58|17.93|17.88|18.15|18.48|18.55|18.4|18.65|18.7|18.55|18.33|18.48|18.43|18.48|17.98|18.2|17.93|17.83|18.3|18.63|18.88|18.88|18.83|18.83|19.03|18.83|18.93|19.35|19.6|19.28|19.23|19.08|18.7|18.83|18.88|18.55|18.6|18.7|18.58|18.18|18.23|18.53|18.6|18.55|18.65|18.45|18.7|18.98|18.88|18.95|18.65|18.7|18.53|18.8|18.73|18.63|18.5|18.48|18.53|18.68|18.63|18.63|18.58|18.48|18.8|18.85|18.9|18.85|19.13|18.98|18.98|18.83|18.9|18.7|18.4|18.28|18.18|18.13|18.1|18.05|18.15|18.15|18.08|18.43|18.43|18.48|18.48|18.15|18.25|18|18.23|18.23|18.2|17.63|17.58|17.3|17.33|17.23|17.13|17.18|17.18|17.18|17.23|17.23|17.23|17.48|17.43|16.98|16.63|16.88|17.13|16.9|16.55|16.53|16.95|16.5|16.48|16.6|16.58|16.58|16.73|16.85|17.08|16.85|16.53|16.63|16.6|16.45|16.3|16.58|16.78|16.93|16.8|16.88|16.63|16.68|16.83|16.93|16.68|16.75|17.05|16.55|16.5|16.33|16.23|15.85|15.65|15.73|15.43|15.43|15.58|15.35|15.43|15.55|16.03|15.88|15.88|16.1|17.23|17.08|16.78|16.98|16.88|16.98|17.13|17.15|16.8|16.53|16.68|16.88|16.48|15.83|15.43|15.83|15.78|15.73|15.33|15.23|15.08|15.33|15.55|15.4|15.25|15.25|14.35|14.28|14.05|14.23|14.43|14.15|13.45|13.6|14.78|13.63|13.85|13.45|13.6|13.38|13.13|13.2|13.18|14.1|14.15|14.1|13.9|13.75|14.1|14.4|14.1|14.1|14.23|14.35|14.63|14.78|14.65|14.83|15.03|14.6|14.13|13.7|13.4|13.08|13|13.05|13.4|13.33|13.59|13.45|13.5|13.55|13.15|13.3|13.7|14.03|14.28|14.25|14.05|14.55|14.8|14.5|13.38|14.3|14.8|15.28|15.23|15.3|16.28|16.38|16.05|15.75|15.95|15.85|16.25|15.83|15.98|16.63|16.63|16.33|16.18|16.4|16.35|15.65|16.88|17.13|16.98|17.45|17.13|16.9|17|18.25|18.33|18.15|17.43|17.83|18.48|19.03|18.48|18.48|18.43|17.93|17.33|17.5|17.1|16.75|16.68|16.28|16.13|15.25|15.3|15.75|15.85|16.03|16.05|15.83|15.4|15.25|15.3|15.45|15.78|15.9|16.3|16.1|16.1|16.73|16.85|16.5|16.63|15.63|16.28|16.53|16.35|16.48|16.88|17.08|17.18|17.4|17.75|18|17.78|17.38|17.55|17.38|17.25|16.98|16.8|16.53|16.45|16.88|17|17|16.95|16.98|15.93|16.13|15.73|15.6|15.48|15.58|15.65|15.88|16.48|16.78|17.08|17.23|16.73|16.68|17.05|17.08|17.03|17.4|17.43|17.18|17.08|17.1|17.1|17.23|16.68|16.5|16.3|17.65|17.83|17.85|18.05|17.98|17.98|18.35|18.15|18.73|17.98|18.55|19.05|19.08|18.98|19.38|18.33|18.68|18.78|18.12|18.43|18.53|18.23|18.43|17.8|17.58|18.23|18.13|17.93|17.68|17.63|17.83|17.63|17.95|17.75|16.5|16.15|16.1|15.88|15.98|15.8|15.73|15.68|15.38|16|15.98|15.78|16.13|15.99|16.08|15.9|16|16.08|15.93|15.78|15.85|16.03|16.3|16.15|16.23|16.18|16.2|16.25|16.62|16.68|16.93|17|17.18|17.23|17.23|17|16.4|16.18|16.28|16.58|16.55|16.58|16.4|15.85|15.75|16.05|15.9|15.98|16.15|16.03|15.85|15.88|15.98|16.88|16.78|16.83|17.03|16.8|16.6|16.9|16.93|17.2|17.3|17.13|17.48|17.73|17.68|17.9|18.15|18.33|18.05|18.73|18.65|18.95|19.13|19.5|19.68|19.05|18.48|17.85|17.58|17.43|17.88|17.38|16.7|16.53|16.63|16.78|16.93|17.05|17.23|17.18|18.08|18.28|18.18|18.2|18.58|19.28|19|18.8|18.75|19.18|19.03|18.93|19.3|19.58|19.4|20.5|20.35|20.38|20.35|21.3|21.68|20.25|20.33|20.8|21.18|20.93|20.85|22.63|23.9|22.73|22.68|19.88|19.53|19.38|20.88|20.73|20.35|20.05|20.05|19.5|19.45|19.38|20.08|19.85|19.35|19.23|19.63|19.5|18.63|18.05|18.63|18.7|19.4|19.53|19.73|19.53|18.95|18.1|18.1|18.5|18.4|18.48|18.23|17.98|18.43|18.45|18.38|19.38|19.43|19.77|19.99|19.62|20.01|19.93|20.2|20.3|19.75|19.95|19.45|19.36|18.92|18.99|18.84|19.63|19.65|19.45|19.48|20.03|20.65|21.03|20.88|21.58|21.25|20.78|20.45|20.98|22.23|21.9|22.2|22.43|22.25|22.68|23.3|23.35|22.6|21.7|22.38|22.08|21.78|22.78|23.05|23.35|22.9|24.15|23.13|23.63|24.28|24.55|24.58|23.63|24.75|24.58|24.83|25.18|25.08|25.4|24.13|23.15|22.3|22.1|21.85|21.85|22.7|22.38|22.88|23.28|22.75|23.4|22.9|23.86|23.22|22.78|23.07|23|23.17|23.5|24.12|24.21|24.49|24.56|24.18|23.74|22.95|22.65|22.83|23.98|24.05|23.69|24.18|23.96|23.51|23.66|23.95|23.9|24.45|24.19|24.76|24.76|24.78|24.83|23.31|23.31|22.87|22.86|22.98|22.93|22.93|22.8|22.56|22.62|23.01|23.43|23.28|22.91|22.65|22.69|21.86|20.73|21.15|20.47|20.56|20.48|20.56|20.98|20.57|20.13|19.87|20.08|19.82|19.96|19.44|19.1|19.4|19.21|18.57|18.98|19.3|19.44|18.98|19.54|19.62|19.39|18.93|18.77|18.91|18.53|18.53|18.53|18.15|17.97|17.28|17.25|16.92|16.98|17.02|17.54|17|17.26|17.74|17.72|17.46|17.8|18.07|17.92|18.27|18.25|18.24|17.72|17.82|17.84|18.32|18.62|19.42|19.1|19.77|19.92|19.75|19.7|20.03|20.15|19.33|18.88|18.99|19.17|18.59|18.36|17.96|17.43|17.01|16.83|17.15|17.22|17.34|17.09|17.8|18.22|18.83|18.18|18.28|18.25|18|17.79|18.19|18.27|18.83|18.21|18.23|18.47|18.71|18.66|18.77|18.76|18.74|19.02|19.51|18.94|18.56|18.56|18.63|19|18.77|18.41|18.88|18.83|18.26|17.87|17.58|17.83|17.91|17.98|18.22|18.12|17.92|18.15|18.03|18.21|18.05|18.4|18.14|18.32|18.57|18.52|19.87|20.08|21.29|20.94|20.71|20.6|20.08|19.56|19.43|19.29|19.86|18.86|19|19.42|19.48|19.1|18.93|18.97|19.24|19.14|19.26|20.24|19.54|18.82|19.01|19.14|18.04|17.94|17.7|17.87|17.57|17.08|16.98|17.12|16.98|17.34|17.04|16.01|15.77|15.29|15.33|15.47|15.33|15.07|15.08|14.81|14.75|14.89|15.38|14.67|14.35|14.26|14.79|15.74|15.64|16.28|15.59|15.28|14.87|14.56|14.83|15.05|14.77|14.6|14.35|14.04|14.05|13.46|14.02|13.08|13.38|13.53|13.37|13.18|13.09|13.18|12.85|12.24|12.36|12.41|12.3|12.25|11.74|11.05|12.21|12.41|12.35|14.53|14.02|14.41|15.18|14.92|13.87|13.63|13.15|13.82|13.95|13.71|13.42|14.09|14.41|14.75|14.15|14.33|14.87|14.58|14.29|14.33|14.03|13.66|13.71|13.95|13.56|12.12|11.62|10.77|10.77|11.3|10.88|10.89|11.23|12.09|12.5|11.94|12.04|11.83|11.84|11.95|11.79|11.7|11.66|11.71|11.61|11.83|11.79|12.65|12.38|12.11|12.01|12.21|12.23|12.05|12.53|12.74|12.55|12.04|12.03|12.32|12.08|12.05|11.62|11.16|11.24|11.48|11.46|11.93|11.87|11.9|12.06|12.05|12.54|12.96|12.51|12.53|12.82|12.66|12.47|12.65|12.97|13.92|14.31|14.36|14.67|14.84|14.55|14.41|14.38|14.71|14.46|14.21|14.1|13.88|13.23|12.87|12.26|11.98|11.6|11.29|11.94|11.68|12.18|12.74|12.46|12.26|12.31|12.43|11.93|11.88|11.73|11.18|11.56|11.46|10.62|10.25|10.45|10.4|10.58|10.51|10.41|10.77|9.91|9.87|9.71|10.05|9.73|9.7|9.68|9.46|9.1|10.87|9.92|9.62|9.45|9.83|9.91|9.91|10.54|10.94|10.3|10.67|12.07|10.9|11.1|10.81|11.19|10.85|11.23|11.21|11.03|11.14|11.34|10.81|10.39|10.78|10.18|9.97|9.77|9.88|9.82|10.09|9.93|10.29|10.24|10.64|10.84|10.58|10.52|10.81|11.02|11.25|12.17|12.11|12.95|13.35|13.37|13.64|13.37|13.5|13.97|14.34|15.02|14.6|14.53|14.14|13.72|14.11|14.23|14.82|15.96|16.07|15.63|15.91|16.38|16.53|16.45|16.98|16.85|16.44|15.23|15.21|14.43|14.49|14.83|14.71|15.18|14.28|14.26|16.25|16.19|16.25|16.05|16.33|16.29|16|15.93|15.91|16.04|16.27|16.27|16.38|16.97|18.36|18.74|18.9|18.94|19.49|19.48|18.9|19.75|19.33|19.01|19.69|19.73|19.46|19.65|19.21|19.32|19.64|19.66|20.18|20.32|20.61|20.68|21.11|20.48|20.32|21.71|21.96|22.51|22.36|22.98|23.18|23.25|23.06|22.68|22.49|23.41|23.66|23.6|23.24|23.46|22.98|23.3|22.64|23.07|22.33|20.78|20.84|21.89|22.26|22.28|21.65|22.26|21.68|22.18|21.22|21.11|21.32|22.64|22.8|23.62|24.44|25.42|24.96|25.39|24.88|24.98|25.02|25.14|25.86|25.66|25.77|25.94|24.2|25.52|26.17|26.46|26.1|25.45|25.85|24.86|25.68|26.09|26.22|25.98|25.51|25.04|25.11|25.63|24.93|23.95|23.72|23.55|23.35|22.77|23.93|24.62|24.9|25.99|26.31|26.17|26.26|27.18|27.24|27.18|26.91|26.59|27.08|27.35|27.15|27.6|27.48|27.61|27.44|27.32|27.82|28.03|28.12|28.11|27.54|27.26|26.93|27.22|27.92|28.21|28.53|28.7|29.01|29.78|29.83|30.08|31.93|31.41|29.11|28.97|29.25|28.83|28.03|27.97|27.87|25.59|24.93|25.77|25.32|25.74|25.16|23.98|23.26|22.98|22.9|21.08|21.05|21.4|22.65|22.13|22.2|23.5|23.57|23.36|22.9|23.07|23.79|24.73|25.13|24.93|26.03|26.69|26.59|28.26|28.78|28.4|28.45|28.12|28.97|29.62|29.89|29.64|29.69|29.35|28.27|28.42|28.32|29.34|29|30.1|30.4|29.77|27.69|28.86|30.71|31.02|30.9|30.47|31.15|31.05|31.58|32.15|30.73|30.35|30.67|30.62|30.58|29.83|30.27|31.15|30.82|28.44|28.46|28.33|27.85|26.68|26.84|25.92|25.3|25.24|26.8|27.04|28.01|27.56|27.58|30.76|31.34|30.18|32.38|31.67|33.26|34.03|34.13|35.09|36.02|35.72|36.7|37.43|36.27|36.87|31.08|31.35|33.68|34.55|33.48|32.18|31.59|30.01|29.94|28.91|28.42|30.64|30.07|29.19|29.62|29.99|30.95|31.25|33.45|32.03|30.38|30.98|31.29|30.16|31.81|31.17|31.48|31.31|31.09|30.15|31.62|30.81|30.81|31.59|32.26|33.05|33.82|34.16|33.09|34.23|33.33|33.11|33.29|33.35|33.47|32.59|32.53|31.59|30.37|27.47|27.28|24.44|25.11|24.36|23.29|22.58|22.29|23.43|23.44|24.57|24.77|24.75|24.13|25.63|24.74|27.02|27.04|26.94|27.04|26.95|26.32|27.17|28.9|29.25|29.1|30.68|28|26.33|26.61|27.05|26.45|26.1|25.75|25.84|25.16|24.76|25.59|26.37|23.84|23.19|23.63|23.21|23.45|23.94|24.01|24.41|24.5|23.77|23.47|24.35|24.87|24.02|24.37|25.64|26.08|27.12|26.8|26.8|26.99|26.11|25.86|25.57|25.42|25.76|25.49|26.71|26.85|27.21|27.31|26.82|27.46|27.59|27.71|27.45|27.46|28.27|27.97|27.77|27.88|28.19|28.57|29.3|29.8|29.72|29.51|28.85|28.69|29.11|28.92|28.55|28.86|28.95|29.25|28.73|28.55|29.03|29.13|28.5|28.13|27.61|26.68|26.24|26.7|26.86|27.36|27.66|26.25|26.21|25.56|25.97|25.69|26.55|25.59|24.69|24.44|23.62|24.02|23.58|23.1|23.35|23.43|24.44|24.37|24.9|24.94|24.82|24.46|24.35|24.23|25.49|25.6|25.39|25.94|25.61|25.28|25.18|24.68|24.35|25.71|25.66|26.33|26.46|26.67|26.7|26.52|26.27|26.61|27.59|28.2|25.44|25.17|20.63|20.13|20.67|21.47|21.87|21.22|21.29|21.02|21.38|20.57|20.47|19.47|19.21|19.91|20.56|20.37|20.67|20.31|20.55|20.41|19.63|19.39|18.63|18.78|18.64|18.86|19.54|20.72|19.48|20.47|18.78|16.51|16.86|16.55|18.44|19.4|18.81|18.92|19.28|19.27|18.57|17.81|17.61|18.58|18.51|19.03|18.87|18.73|18.65|19.35|20.13|20.47|21.2|21.08|21.03|20.21|19.71|20.08|18.89|18.86|18.32|18.7|18.89|18.91|19.04|19.74|19.26|19.07|19.7|20.26|19.9|19.42|20.01|20.18|19.44|20.14|19.95|20.73|20.73|21.83|21.59|22.11|23.1|22.32|23.14|22.7|23.6|23.76|23.9|23.8|24.51|24.78|24.25|24.83|24.75|24.6|25.13|25.34|25.34|26.06|26.97|26.72|26.97|25.39|26.36|25.48|25.13|24.22|23.39|24.03|25.26|25.9|25.86|25.96|26.26|26.2|26.47|26.32|26.85|26.98|26.67|25.73|25.53|26.09|26.09|26.89|26.3|27.12|27.17|25.71|24.99|24.32|24.01|23.76|23.52|24.71|24.18|23.19|22.79|22.99|22.83|22.37|23.72|23.97|24.85|24.99|25.32|25.39|25.33|25.65|25.64|25.59|25.51|25.08|24.9|25.82|25.83|25.94|26.72|26.37|25.7|25.43|25.1|25.2|25.95|26.28|25.79|25.17|25.69|25.7|25.51|25.49|25.63|26.11|26.47|26.66|27.33|27.44|27.53|27.81|27.56|27.54|27.11|27.45|26.58|27.31|27.54|28.92|28.68|27.76|28.53|27.76|28.41|28.45|28.61|29.36|29.11|28.93|29|29.11|29.42|29.14|28.38|28.28|28.29|28.18|28.56|28.66|28.61|28.22|28.2|27.01|26.78|25.71|25.29|25.51|25.78|25.21|24.36|23.33|23.41|24.05|24.05|24.85|25.7|25.74|25.73|26.09|25.99|26.07|25.67|26.06|26.35|26.85|27.29|27.64|28.73|29.25|29.95|30.26|29.59|30.61|31.49|32.02|30.32|31.43|31.43|30.78|29.3|30.26|30.07|30.46|31.36|31.73|32.29|31.57|32.23|31.72|32.07|31.4|31.62|31.02|30.73|31.26|31.42|31.57|30.95|31.13|31.77|31.81|32.23|32.47|32.46|33.23|33.26|33.06|33.16|32.76|32.76|33.64|33.46|34.09|33.4|34.37|33.92|34.39|34.47|34.94|34.06|34.16|33.98|31.48|30.35|28.55|28.4|28|25.59|26.54|27.28|25.98|27.29|27.66|27.94|26.29|26.75|25.62|25.27|24.88|25.11|25.16|24.72|24.74|25.76|25.76|25.72|24.56|24.06|24.29|23.23|23.79|23.73|23.59|23.91|25.55|25.69|25.98|26.77|27.18|27.23|26.69|27.58|27.32|27.14|26.78|26.55|26.48|26.39|26.58|27.56|27.99|27.49|28.44|28.97|28.48|27.39|27.14|26.43|26.21|27.13|26.96|27.34|27.06|28.88|28.33|28.2|28.63|27.23|28.21|28.51|28.59|29.2|27.67|27.73|28.3|27.71|28.27|28.31|28.68|29.63|29.91|30.37|30.01|30.06|30.59|30.05|29.66|28.96|29.18|29.88|29.18|29.28|29.95|30.22|29.98|30.08|30.05|30.1|30.38|29.64|28.08|27.89|27.49|27.72|28.47|27.64|27.76|27.48|26.52|26.38|25.76|25.56|25.51|26.81|27.04|28.09|27.98|28.9|29.35|28.96|30.21|31.13|31|31.45|31.23|31.05|30.27|29.61|29.25|29.63|30.01|29.38|28.99|28.56|27.47|27.88|27.78|27.9|28.52|28.73|28.82|28.88|28.58|29.01|29.78|28.98|29.26|30.13|27.99|28.23|28.9|28.95|28.17|29.1|29.26|29.25|28.87|30.27|30.02|29.79|30.24|30.89|30.64|31.01|30.79|31.03|28.78|28.3|29.17|30.1|30.3|31.2|30.99|32.55|31.84|31.43|31.26|31.67|32.26|31.95|31.42|32.08|31.15|31.05|30.77|29.47|29.63|29.02|29.26|30.33|31.08|31.43|31.57|31.63|31.89|31.6|32.46|32.94|33.34|34.15|33.32|33.45|34.4|33.72|32.83|33.22|32.76|34.39|34.72|34.95|34.33|33.57|34.4|34.14|33.32|32.51|32.04|33.04|32.29|32.59|31.19|31.17|31.48|33.07|33.98|34.03|34.51|33.54|33.72|33.85|34.71|33.23|33.78|34.18|34.11|35.23|34.97|36.07|36.58|37.05|37.25|35.83|36.97|38.3|39.04|38.88|38.43|38.35|38.89|37.6|39.22|38.46|37.03|37|37|39.05|37.99|36.26|35.97|35.57|35.47|34.69|35.75|35.23|35.22|34.56|35.58|35.43|34.82|34.95|34.81|34.71|34.25|33.24|32.61|33.22|35.58|35.36|35.73|36.47|35.62|37.13|37.58|37.73|36.68|37.51|38.41|38.49|39.07|38.96|38.48|39.16|39.59|39.75|40.09|41.08|40.93|41.47|41.35|41.82|41.75|42.49|42.63|43.21|42.5|42.45|44.13|44.35|44.05|44.12|44.84|45.46|44.39|42.99|42.39|40.65|40.72|39.8|42.39|41.07|40.19|41.45|41.03|40.63|41.34|40.68|43.08|43.6|44.56|45.66|46.53|46.13|46.87|47.52|46.54|47.76|46.86|46.99|47.1|47.95|48.98|49.41|50.75|51.28|50.42|51.31|51.02|49.16|49.21|50.78|51.06|52.28|51.68|52.04|49.99|48.88|48.16|46.84|46.25|46.14|45.32|44.37|44.78|43.27|42.57|42.22|41.33|39.32|40.48|40.27|40.8|42.29|42.26|43.03|42.62|43.12|42.87|44.05|44.23|41.19|38.49|38.57|38.43|37.11|36.9|38.33|37.24|36.77|37.03|41.53|41.49|43.06|42.67|42.76|40.44|40.29|39.6|39.6|40.24|39.8|40.38|40.75|41|43.25|43.28|44.71|43.45|43.75|45.76|45.1|45.18|45.16|44.06|45.74|46.14|45.94|46.51|44.75|44.51|45.12|44.17|43.13|43.26|42.7|42.79|44.04|44.41|44.51|44.91|45.42|45.42|45.86|46.09|47.6|48.16|49.24|50.05|50.13|51.05|52.89|52.1|51.87|53.29|56.03|55.97|55.79|55.39|51.52|52.35|53.22|55.92|54.53|54.08|52.57|51.83|51.21|51.53|48.58|51.53|53.51|53.1|51.29|50.74|49.81|49.7|49.71|50.61|48.91|47.4|46.85|46.42|47.31|47.35|46.91|47.28|47.29|49.24|49.71|49.42|49.33|49.3|50.46|51.3|51.9|52.61|51.62|51.92|51.36|51.98|52|53.52|56.92|57.1|57.36|56.06|57.03|57.21|58.5|57.75|55.42|55.36|56.41|57.13|57.86|58.38|57.55|59|56.1|58.33|56.79|56.98|56.25|56.75|56.39|55.59|56.98|57.51|58.58|58.34|58.28|59.77|60.56|60.13|60.04|60.62|60.73|62.56|62.79|63.77|65.9|67.26|66.68|65.1|63.41|61.75|64.21|65.87|65.16|65.25|65.88|66.23|64.77|66.15|66.8|66.79|65.95|64.16|64.16|63.6|61.66|62.62|60.69|61.31|61.7|61.9|64.04|62.98|64.31|64.64|61.73|62.56|62.81|62.02|61.7|61.64|59.17|59.33|57.2|57.29|57.01|58.1|59.91|59.48|58.45|59.81|58.13|57.04|56.94|57.64|58.72|58.56|58.1|59.47|58.47|56.69|58.53|59.55|60.48|58.19|57.71|55.85|54.3|54.1|54.45|53.68|52.84|53.36|54.21|53.73|53.41|53.15|52.91|53.24|53.25|53.65|54.91|56.05|55.68|55.17|56.26|57.18|57.23|59.16|59.59|59.67|58.11|56.09|56.08|56.05|57.3|56.28|56.54|56.91|57.72|58.34|61.51|61.25|61.68|62.43|62.51|62.32|62.34|63.22|63.6|63.64|64.92|64.56|63.82|62.61|62.93|64.95|65.14|63.19|65.64|63.49|63.32|61.64|60.82|60.7|59.66|59.16|58.27|57.67|56.78|58.34|60.05|59.35|58.71|58.71|60.13|59.44|59.78|61.12|59.79|58.42|59.04|60.99|61.23|62.78|62.59|65.95|67.28|67.58|69.54|69.39|70.97|72.69|72.57|73.94|73.96|72.86|73.46|71.79|72.15|73.37|74.45|73.73|71.84|71.22|68.26|69.83|68.69|68.66|67.52|67.39|66.93|66.52|68.97|68.45|68.51|69.88|69.16|69.82|67.57|68.77|68.42|69.13|68.25|67.17|65.76|69.13|68.62|65.67|65.52|66.04|65.01|66.4|67.57|68.17|69.6|69.91|69.85|71.26|71.76|73.02|73.2|73.94|73.17|72.88|73.12|74.14|72.39|73.14|73.04|75.23|76.13|75.12|75.32|71.62|72.56|72.96|72.09|72.49|73.76|75.36|73.95|74.75|76.39|77.63|76.28|76.53|77.82|77.93|78.26|75.69|75.19|73.78|73.57|72.67|70.42|71.3|72.42|72.06|71.12|71.4|72.58|69.44|67.01|67.15|67.66|70.49|68.62|65.94|65.41|64.52|64.3|62.41|62.23|61.28|60.75|60.23|61.47|62.52|59.09|59.27|58.81|57.89|58.53|57.6|60.68|59.09|58.8|56.28|55.82|57.93|56.9|59.25|57.8|57.75|57.87|58.97|58.22|60.13|58.51|57.74|57.94|56.56|56.56|58.79|58.76|57.99|57.08|56.13|56.37|56.26|56.55|57.02|56.99|57.18|59.72|59.18|56.88|57.9|57.97|59.5|57.01|57.38|59.53|58.66|59.7|60.72|60.52|61.22|62.13|64.36|64.74|63.97|63.65|63.7|63.17|63.67|62.59|62.58|61.89|62.85|62.91|62.81|62.19|63.13|62.13|61.92|60.7|59.41|58.96|58.49|56.63|54.58|52.82|52.82|52.38|52.11|51.68|49.95|51.28|51.19|50.83|52.29|54.34|53.93|55.11|55.67|55.29|54.71|54.69|56.52|56.74|56.93|58.67|57.24|57.21|55.52|56.12|55.05|54.25|56.78|55.91|57.74|58.62|60.38|60.34|60.28|59.39|61.18|61.92|59.68|61.13|60.9|60.25|60.59|61.52|60.89|60.4|60.93|60.49|60.11|60.18|61.57|63.1|64.43|64.25|66.15|67.19|68.47|68.94|68|68.09|69.15|67.64|68.6|67.79|68.78|67.1|66.34|65.09|66.17|66.34|66.8|67.94|67.44|67.51|67.28|67.23|67.4|65.57|64.85|65.14|62.7|63.55|63.5|64.63|65.18|65.86|66.74|66.83|69.08|69.26|69.51|70.05|71.01|71.96|70.72|69.31|67.64|68.18|68.65|70.9|71.36|71.5|72.36|70.04|68.85|68.56|69.24|71.18|71.63|72.33|72.17|70.55|71.81|72.04|71.36|71.41|71.84|71.96|72.22|72.9|74.26|75.4|76.58|77.1|77.88|77.44|78.24|78.12|78.17|77.59|78|78.37|79.09|78.36|75.88|75.21|77.28|76.58|76.07|77.01|77.11|76.14|75.36|72.69|70.42|70.73|70.08|69.57|71.3|69.29|71.3|68.77|69.8|68.37|67.88|67.73|68.73|69.49|68.85|69.66|70.48|71.46|72.29|74.22|74.72|76.21|75.08|74.97|76.23|77.15|77.84|78.27|77.99|77|78.47|78.48|78.91|77.87|76.82|76.21|78.88|80.97|78.33|76.87|77.8|77.84|79.05|76.94|77.82|77.85|80.83|80.82|82.5|84.43|85.24|85.03|84.25|82.72|82.31|83.47|85.4|84.71|89.87|89.87|89.87|90.36|92.11|92.16|93.99|94.85|94.4|92.32|91.56|89.09|90.73|90.32|91.99|91.59|94.13|94.97|95.33|94.88|93.23|91.64|92.34|88.71|87.85|89.97|90.7|88.46|88.46|87.33|87.77|91.69|92.57|91.86|90.32|90.71|90.98|91.06|91.03|91.59|95.66|95.92|93.68|97.01|98.45|96.87|94.19|96.37|96.76|92.8|91.86|92.58|90.87|88.1|88.96|89.66|88.11|87.06|87.69|90.96|90.91|92.49|92.46|91.58|91.41|91.09|89.6|88.73|88.55|91.45|93.93|94.28|93.82|95.92|96.96|97.03|97.88|97.52|96.07|97.43|99.05|98.28|99.83|100.9|101.83|98.6|100.95|103.47|104.66|105.33|106.78|107.99|109.18|109.16|104.41|105.35|102.65|99.78|100.93|99.91|102.83|103.89|102.68|102.33|98.69|98.85|102.31|102.21|105.98|105.05|107.46|107.37|107.15|108.32|110.84|110.95|111.34|110.67|111.35|113.54|115.34|114.85|116.62|115.7|113.86|111.12|107.3|111.92|115.68|119.88|120.27|119.85|123.54|122.89|123.11|121.18|122.76|122.98|122.19|124.12|127.28|129.04|129.72|128.92|128.93|129.33|127.85|128.5|126.28|121.72|122.36|132.81|134.43|135.24|134.52|132.11|134.29|133.9|131.27|129.12|131.84|134.28|134.54|135.37|131.59|136.82|139.38|138.4|140.67|141.24|143.95|139.62|134.15|133.91|135.81|143.68|142.43|136.02|133.31|134.16|129.34|129.34|127.18|126.86|125.43|124.7|125.67|125.77|122.46|124.1|124.16|121.87|116.5|114.47|116.94|113.03|110.54|108.98|110.68|111.82|108.8|109.33|109.02|108.72|117.24|113.99|109.74|112.2|113.05|113.54|113.49|104.94|103.88|103.41|102.51|101.08|98.94|96|96.01|94.37|90.45|85.85|86.09|90.89|93.46|100.43|100.72|102.09|100.45|100.88|95.96|93.52|92.19|88.88|88.95|84.71|83.17|80.77|81.65|74.58|74.37|74.98|66.86|64.14|66.05|67.45|65.99|62.95|65.06|60.57|59.34|58.87|64|60.86|60|60.32|62.78|61.09|56.14|56.84|57.08|54.76|52.47|51.32|50.7|50.82|49.1|48.35|45.79|44.91|49.51|47.51|49.39|47.72|47.58|45.64|44.39|43.83|37.04|40.02|39.77|39.34|43.54|42.38|45.02|42|41.84|40.19|39.52|38.08|35.27|34.45|33.73|34.16|35.22|35.82|42.94|45.84|48.89|46.23|42.94|42.34|40.86|43.05|42.27|42.32|43.42|41.22|39.9|42.42|43.13|48|42.86|42.86|43.13|44.17|42.96|43.15|43.68|43.92|44.49|47.23|45.88|44.24|47.23|43.36|39.69|39.41|42.36|42.19|41.27|40.18|42.37|45.15|44.41|42.6|42.72|46.07|44.45|43.48|44.55|44.99|43.2|42.19|44.97|44.12|45.53|45.22|48.03|49.27|51.84|51.32|51.46|51.89|50.81|49.05|46.13|45.92|50.89|50.48|50.91|50.62|52.06|52.33|50.73|52.06|51.31|51.83|52.02|49.06|48.69|48.5|48.29|50.29|48.67|48.64|50.22|50.3|51.75|53.26|53.16|55.07|56.63|56.02|55.99|56.52|56.84|56.25|56.33|56.51|57.12|59.1|58.02|58.7|59.05|61.28|63.47|64.98|66.6|67.67|66.15|67.68|67.77|67.61|68.94|70.52|71.71|70.62|68.49|70.52|68.95|69.96|70.48|66.13|66.36|68.47|68.82|68.1|69.75|68.11|68.52|65.74|63.12|61.54|59.71|59.17|58.43|58.25|60.48|61.25|62.02|63.54|64.64|65.93|65.36|68.06|68.82|69.78|68.53|65.79|68.82|70.08|72.9|73.82|74.39|74.61|74.21|73.79|71.58|74.03|73.76|71.33|68.65|68.66|72.81|73.75|73.71|74.34|73.1|70.74|70.68|72.8|69.02|68.78|67.6|66.78|65.84|69.2|69.76|68.96|68.76|66.91|66.53|68.51|71.56|70.72|68.11|69.65|67.43|64.99|64.6|65.43|64.63|65.82|67.12|66.5|65.26|68.51|67.65|68.47|69.45|70.75|70.81|72.16|73.14|74.58|75.86|76.51|77.74|78.36|77.72|76.45|76.69|75.11|77.18|74.91|75.56|75.68|78.21|78.02|75.51|77.18|77.07|76.99|75.18|74.81|77.14|77.36|78.64|76.45|75.61|78.14|75.35|76.57|76|77.77|78.68|76.96|77.76|77.74|76.18|74.93|73.63|70.91|70.07|71.19|71.33|73.34|71.28|71.87|72.74|71.64|73.87|75.15|76.59|76.65|77.62|77.91|79.05|79.27|80.14|80.57|80.06|80.14|79.38|77.57|77.61|76.85|75.18|75.09|74.13|72.73|72.18|72.63|72.75|70.65|71.2|71.58|73.94|75.77|71.3|70.11|69.62|70.4|70.4|72.35|71.49|74.82|74.89|76.61|76.88|76.95|76.44|77|74.38|76.36|76.07|77.5|78.66|77.88|79.2|78.94|78.77|80.29|79.44|79.38|77.08|79.45|80.28|80.09|78.37|78.09|79.17|78.03|78.64|77.98|79.89|79.46|80.37|82.63|84.48|85.05|84.49|82.63|82.77|85.21|83.44|85.81|86.9|84.81|83.09|84.73|84.55|84.58|86.09|86.72|85.59|84.59|86.82|86.19|88.09|85.39|82.31|80.21|76.48|78.08|79|78.7|79.41|76.43|73.87|75.12|71.86|69.56|70.45|69.62|67.18|70.59|73.56|73|73.08|72.78|73.12|71.84|71.09|71.43|73.68|74.33|73.28|75.11|75.29|76.12|77.52|77.05|78.53|78.08|75.22|75.17|76.21|76.66|74.21|74.94|71.73|71.75|73.08|72.97|74.56|75.2|74.35|76.45|76.63|75.52|75.55|76.29|76.31|75.75|77.59|77.27|77.9|75.52|76.66|78.6|77.5|81.93|83.6|83.76|82.9|81.28|81.54|79.89|77.83|76.63|75.14|74.56|76.74|75.1|74.84|73.48|73.08|70.61|70.74|74.5|75.16|76.05|75.51|75.53|74.93|75.03|75.78|77.48|77.87|77.54|78.52|78.89|78.46|78.89|77.43|79.42|78.76|77.29|77.69|78.73|77.71|79.14|78.79|80.77|82.69|83.42|83.35|85.01|83.67|83.88|83.08|82.99|84.01|83.55|81.94|82.3|81.12|81.68|81.28|80.75|81.91|82.62|81.27|82.97|82.47|84.06|84.71|85.33|86.83|87.05|87.15|87.93|87.92|88.08|86.07|85.49|83.98|83.36|83.7|83.17|82.34|82.37|84.53|84.78|85.9|86.02|88.56|89.37|90.65|91.25|90.78|89.74|89.93|89.54|90.4|90.63|91.33|91.09|91.11|91.31|93.11|93.55|93.63|93.08|93.52|93.52|92.5|93.23|95.82|93.52|95.07|94.95|94.25|95.05|96.8|97.86|97.86|97.86|97.83|98.42|96.27|96.84|96.76|96.76|96.04|96.48|97.06|98.97|100.4|101.3|101.69|99.43|99.44|99.25|100.16|100.74|99.93|103.12|102.48|102.78|103.45|102.2|106.82|109.77|113.91|111.47|112.27|113.34|116.89|114.42|115.71|116.58|112.32|115.19|114.07|114.07|112.95|111.11|110.96|114.18|114.13|114.92|115.63|115.65|115.41|115.45|115.95|115.58|115.35|116.94|118.63|120.07|122.87|123.01|122.9|126.3|126.46|121.33|122.7|122.74|124.63|121.69|121.35|124.26|123.64|124.55|124.94|126.59|126.64|124.01|121.55|111.93|113.69|113.21|117.82|115.66|112.87|113.08|113.72|109.39|112.54|113.2|111.25|110.13|112.52|114.47|115.06|114.85|117.18|116.15|114.3|115.09|115.4|116.14|118.43|119.95|118.71|120.49|120.35|114.67|114.69|113.74|112.21|112.02|113.59|108.27|104.79|104.57|107.57|111.49|111.71|109.82|113.21|113.55|117.4|117.4|117.35|117.36|118.46|117.38|118.06|117.05|118.18|118.52|118.25|118.99|118.27|118.14|117.99|118.16|115.93|116.37|116.02|113.74|110.22|106.92|103.06|103.63|103.84|107.82|108.17|108.89|109.69|111.37|108.36|109.37|108.83|110.35|111.91|111.91|112.29|115.59|116.48|116.43|115.92|113.29|117.5|117.99|115.1|114.75|114.08|113.1|116.71|116.26|112.89|114.39|114.26|109.21|109.17|107.9|109.54|108.52|107.08|105.42|103.61|101.84|103.77|104.38|106.56|109.49|109.22|112.44|112.45|114.33|112.92|112.08|111.76|109|111.6|111.67|112.11|110.43|112.45|110.01|108.43|106.97|110.82|110.76|112.22|114.75|115.61|115.29|113.32|114.43|112.57|111.9|111.91|109.25|107.82|105.98|107.77|106.83|106.08|109.38|111.25|111.22|108.83|109.59|110.18|110.16|110.07|108.23|107.91|107.82|109.25|105.72|104.52|104|104.55|107.8|108|108.98|109.28|107.54|106.89|108.09|111.12|113.37|113.59|111.96|111.07|113.3|111.66|112.97|109.88|110.55|109.81|109.54|108.5|109.46|108.38|108.48|109.08|110.5|110.24|110.26|111.96|110.96|112.56|115.47|116.86|117.18|118.4|118.13|118.73|118.3|120.25|121|120.69|120.85|123.07|124.53|124.89|126.46|124.02|122.23|125.76|125.93|126.68|125.03|125.37|127.96|128.08|127.27|128.14|126.98|123.63|125.09|125.76|124.38|123.89|122.49|125.21|125.85|125.25|124.41|123.23|123.41|124.44|123.04|123.58|121.89|120.41|120.57|120.62|118.23|117.41|115.18|117|118.08|116.66|117.74|117.45|119.33|119.3|118.66|119.57|117.57|115.91|111.66|110.48|111.89|112.24|112.5|110.79|111.4|109.8|109.31|108.03|109.02|109.76|106.88|107.2|107.86|107.55|103.85|103.86|98.63|97.74|98.65|101.14|100.05|97.57|98.6|96.59|97.29|96.46|97.13|95.21|95.14|93.5|89.22|89.22|88.69|90.19|92.06|91.02|94.17|95.28|99.89|101.54|98.5|99.94|99.15|99.23|99.18|101.91|102.1|104.21|105.92|107.79|106.98|103.91|103.57|102.35|104.77|106.3|106.54|105.93|106.78|107.55|109.57|110.01|112.39|113.42|113.52|113.13|114.48|113.9|115.51|116.12|115.2|115.5|116.03|115.77|117.45|115.76|113.74|112.62|112.53|112.28|113.93|114.98|113.32|114.5|113.64|113.84|114.86|114.86|116|117.48|116.7|113.29|108.49|109.41|111.27|109.2|110.77|108.99|111.45|111.36|112.58|112.49|109.32|110.48|112.17|112.6|114.32|116.11|116.18|115.17|115|115|113.49|112.58|111.89|109.62|107.53|107.66|107.64|108.9|109.33|109.4|109.89|108.84|106.79|105.59|109.27|108.21|107.23|108.61|110.23|108.82|109.66|110.07|106.81|110.06|110.01|110.81|110.14|110.18|109.33|108.26|110.47|110.84|111.27|109.99|108.96|108.01|107.16|108.25|107.6|110.17|110.18|109.28|109.35|109.96|109.95|110.57|109.13|108.44|110.72|110.04|110.05|110.8|112.98|113.03|112.58|112.49|113.03|113.07|112.97|110.3|111.32|111.72|110.97|111.01|111.71|112.72|113.68|114.59|113.88|113.92|115.22|115.42|115.55|115.55|116.06|117.03|116.61|117.17|118.9|118.29|117.89|118.43|118.48|117.4|117.04|116.23|114.19|113.74|114.55|112.96|112.24|112.2|110.14|109.9|110.42|110.27|110.42|108.91|108.64|108.48|107.51|108.1|109.32|108.54|106.91|108.27|106.41|106.51|106.66|107.1|108.51|108.46|108.76|109.66|107.82|105.09|103.98|103.16|104.08|104.8|103.62|100.58|99.32|97.88|96.84|97.48|98.94|99.07|99.25|100.71|101.62|102.39|102.88|101.53|98.34|100.32|104.6|105|105.18|103.79|103.59|101.31|102.17|102.7|101.57|104.27|103.83|104.55|103.1|102.14|100.46|101.24|103.77|102.14|101.79|100.43|101.63|102.04|103.51|103.37|104.07|103.87|101.5|103.11|103.38|105.1|105.8|105.21|105.56|102.72|100.36|99.8|101.51|100.62|102.74|102.49|103.19|103.96|106.12|107.46|107.75|107.9|108.43|108.18|109.03|109.05|109.29|109.67|109.71|109.34|108.82|109.27|108.23|108.1|107.57|108.1|107.47|107.89|109.94|109.63|109.81|108.77|108.39|107.32|108.49|109.28|110.69|110.26|111.58|111.82|111.41|110.74|110.82|110.51|112.12|112.23|115.21|116.27|116.91|115.97|115.49|115.65|115.81|117.15|115.2|112.1|112.37|113.11|113.31|110.86|109.05|109.09|110.66|110.22|108.56|107.68|109.46|108.86|109.45|107.85|107.32|109.09|109.49|109.42|109.66|110.56|109.02|111.63|110.65|110.13|110.67|110.79|109.55|109.4|109.47|109.57|107.74|106.63|105.7|108.29|108.04|108.41|107.53|105.78|104.85|105.01|105.46|103.08|104.29|105.76|106.29|106.9|108.29|108.25|108.8|108.29|108.27|109.9|111.36|110.83|112.04|111.32|111.07|111.49|113.06|113.27|112.07|111.5|110.07|108.91|109.47|108.99|108.08|110.3|108.91|109.56|110.78|112.15|111.58|111.57|111.65|112.06|110.47|109.95|107.94|106.57|106.71|107.01|107.42|107.49|106.44|108.02|107.12|108.09|107.46|108.45|108.01|109.17|109.69|109.69|109.14|108.72|109.1|108.83|109.36|108.16|106.55|107.04|106.81|108.15|110.12|110.18|109.21|108.62|108.98|108.63|110.14|110.37|109.42|109.03|109.76|109.19|109.39|108.54|108.98|111.26|109.17|108.15|107.99|109.14|108.27|108.35|107.88|107.48|108.08|106.99|106.79|105.95|105.73|107.2|106.59|107.01|105.9|106.58|106.64|105.95|105.7|103.37|104.88|106.41|104.89|105.83|107.39|107.1|107.34|107.68|109.1|109.71|109.79|109.69|108.54|108.48|109.79|109.53|109.12|109.89|108.63|108.63|109.48|109.48|108.3|108.17|108.19|108.26|108.37|108.78|109.87|109.74|110.9|110.84|110.35|111.32|110.89|110.19|110.01|109.81|109.09|109.98|109.21|109.34|108.87|109.07|108.43|109.21|110.55|109.18|109.83|112.18|113.15|113.42|114.02|114.25|115.19|114.55|113.62|113.74|112.84|112.61|112.62|111.03|110.84|110.18|108.98|108.7|107.65|106.84|106.2|105.77|104.73|104.73|105.41|106.04|106.03|105.71|106.48|106.85|105.78|106.89|106.7|106.98|106.47|104.94|103.45|103.63|102.82|104.17|104.02|103.36|103.47|101.68|102.27|101.15|101.13|99.37|99.74|99.92|100.28|100.09|100.49|100.5|100.4|100.71|101.12|100.21|100.88|101.21|99.51|99.53|98.08|96.26|96.42|96.31|96.43|97.39|97.7|96.82|96.75|95.37|94.87|94.53|95.2|95.08|95.7|94.67|94.57|91.29|90.8|90.65|90.9|90.25|90.47|88.66|87.82|84.02|84.02|85.27|84.42|85.17|86.38|85.94|86|85.64|85.57|86.91|85.5|84.17|84.9|82.12|82.88|82.08|83.2|82.9|80.94|80.42|77.74|77.51|76.86|77.23|77.21|77.61|79.2|79.62|77.62|77.39|71.89|70.87|71.13|70.13|68.48|68|65.64|66.11|63.32|63.65|61.67|61.09|60.26|59.84|58.81|58.87|58.31|59.07|58.67|58.72|57.86|55.6|55.27|55.38|51.08|50.12|49.06|49.43|47.64|46.9|45.13|45.82|47.66|47.38|46.49|46.5|46.09|46.69|46.07|46.55|47.07|46.61|47.52|51.74|54.41|55.07|55.98|55.88|57|55.79|53.48|56.23|60.33|61.57|60.78|60.72|58.78|60.99|59.78|60.33|59.77|61.39|61.89|60.75|61.18|59.18|60.33|59.15|58.67|55.95|56.46|56.66|54.8|52|52.17|52.59|52.96|53.88|53.82|53.61|54.18|57.02|56.44|53.99|53.69|55.73|55.73|55.73|57.55|56.42|56.04|56.82|57.14|57.69|59.32|60.13|61.31|61.2|60.12|60.12|62.66|62.96|62.86|62.61|63.97|63.9|64.13|64.62|65.44|66.22|64.93|63.82|62.82|65.09|66.33|65.58|64.69|65.15|63.48|63.52|64.7|64.7|61.65|61.35|60.12|63.16|62.87|63.14|62.78|60.34|60.36|61.33|63.23|64.68|63.76|63.19|60.99|60.75|60.75|61.37|59.41|60.54|61.67|61.63|60.24|60.14|59.03|60.31|61.65|61.73|59.06|57.19|54.72|55.7|57.83|57.72|57.63|57.2|57.34|57.31|56.38|56.42|55.94|56.36|55.76|54.29|54.07|54.3|54.73|54.29|53.29|49.49|49.08|49.04|47.8|47.54|48.3|47.33|48.29|48.01|47.79|47.77|47|45.75|45.63|43.84|41.59|41.86|41.76|44.46|47.97|48.8|47.67|50.41|48.59|46.42|48.88|48.04|47.77|46.87|45.87|45.91|49.35|48.27|47.28|47.64|46.69|48|47.06|47.28|46.04|47.58|47.29|47.48|46.55|49.45|51.34|51.66|52.13|52.08|50.95|48.94|48.25|47.87|48.96|47.51|46.93|46.72|46.59|46.3|46.57|45.54|47.6|48.04|48|47.91|48|46.96|47.19|46.09|45.38|46.44|44.98|44.98|41.98|40.28|41.28|41.45|42.22|42.49|43.7|44.38|43.56|43.55|43.07|43.73|42.97|41.92|42|41.44|39.69|39.44|39.04|38.65|36.99|36.51|37.66|36.96|36.29|36.76|35.34|35.26|35.79|37.22|37.08|36.85|35.65|36.61|36.28|35.56|33.89|33.57|31.67|30.14|29.14|28.58|28.84|28.8|27.36|27.36|26.01|27.59|30.46|29.82|30.94|31.83|33.01|33.14|32.45|30.98|32.38|32.76|32.35|31.64|30.15|29.64|28.82|31.8|31.09|33.21|33.2|31.66|33.59|31.9|31.5|32.83|35.76|35.92|35.73|36.38|35.75|37.61|39.02|39.16|40.26|38.63|39.41|38.06|37.49|38.38|39.29|39.26|39.91|40.54|38.84|38.33|38.33|36.75|36.75|36.75|36.42|36.05|35.88|37.77|37.15|40.71|41.58|43.02|42.81|43.02|41.32|41.64|43.02|43.09|43.48|43.97|42.97|43.94|44.17|45.6|45.64|45.82|43.09|43.08|44.39|44.6|42.43|44.01|46.08|46.43|47.05|48.49|48.71|48.93|47.01|48.54|47.77|48.42|48.87|49.52|49.09|49.26|48.81|49.05|48.5|48.94|49.76|50.73|50.59|49.7|49.36|47.88|47.47|45.66|46.57|48.68|48.18|48.43|48.63|46.69|45.07|46.29|48.4|48.05|47.65|48.02|45.64|45.7|45.93|44.53|44.04|46.72|44.67|46.01|46.25|45.35|45.7|45.82|44.99|44.24|43.76|43.56|42.78|41.87|40.76|40.17|40|40.45|41.33|42.47|43.24|43.37|42.19|44.23|45.12|47.31|48.27|48.58|49.46|49.39|48.1|48.7|47.56|49.25|49.66|49.66|47.94|47.94|45.05|45.96|46.72|46.21|47|49.23|48.37|47.82|46.48|45.65|45.83|45.26|46.04|45.24|45.99|47.21|46.71|46.61|44.95|45.49|48.43|48.24|48.61|48.81|49.57|50.14|50.49|51.54|50.48|49.53|49.29|48.87|49.31|49.81|51.85|50.42|50.28|49.8|49.08|48.98|49.13|47.78|46.2|45.77|44.26|43.84|43.06|42.83|43.47|43.88|43.67|41.61|41.83|44.15|45.07|44.57|44.41|45.96|46.1|46.54|47.54|46.32|46.64|44.68|47.95|52.28|52.35|53.3|52.31|51.9|51.6|52.19|53.99|53.28|53.15|51.72|54.15|53.53|54.56|53.01|54.04|53.93|54.95|54.97|54.96|55.05|54.57|54.99|55.9|54.39|53.2|53.61|54.51|54.37|54.3|54.68|53.77|53.18|55.04|54.8|54.7|54.34|55.89|54.8|54.77|55.25|55.79|55.94|55.92|55.02|53.79|54.42|53.98|55.2|54.15|54.96|54.57|54.16|54.48|55.25|56.34|54.9|55.82|54.69|54.65|53.36|55.72|54.16|54.12|54.73|54.61|53.3|50.65|50.63|50.1|49.6|50.63|50.56|50.58|50.67|50.14|49.56|50.17|49.97|50.12|50.72|51.36|52.25|52.2|52.04|53.08|53.41|53.62|54.24|54.79|54.73|54.75|55.05|54.79|52.6|52.43|50.66|49.93|49.45|49.37|49.99|49.46|49.46|50.41|49.31|48.82|47.53|47.45|46.61|47.06|48.09|49.18|49.08|51.29|51.21|51.76|51.71|52.78|53.35|53.19|53.29|52.25|50.84|52.25|50.65|49.4|50.41|48.46|48.25|48.11|47.08|46.3|46.64|47.18|46.95|45.47|45.61|45.7|45.93|43.98|44.62|44.46|44.14|44.09|46.17|46.45|47.02|47.08|49.13|49.15|47.58|48.53|46.47|46.57|46.68|46.73|47.65|47.89|47.66|47.92|48.34|48.54|47.47|47.81|49.19|50.08|50.67|52|51.99|50.77|52.09|52.88|52.48|51.42|52.18|52.16|52.59|51.47|51.29|49.9|50.39|50.37|50.96|51.94|52.29|52.31|51.73|51.87|51.87|51.64|51.91|52.69|53.15|52.6|53.63|54.48|54.16|54.55|54.2|55.06|55.52|56.76|56.18|55.5|56.58|57.2|57.73|58.16|59.42|59.77|58.74|58.8|57.02|55.67|56.12|56|57.09|55.5|55.29|56.62|56.13|56.13|56.86|57.49|57.63|58.05|57.82|57.89|57.69|57.84|58.45|58.75|60.15|60.65|61.35|60.98|60.79|61.42|64.27|64.36|63.96|64.49|64.35|62.94|60.91|61.25|61.18|61.34|61.34|62.28|62.92|63.27|63.58|63.25|63.56|63.74|63.53|64.57|63.45|63.45|62.25|62.37|63.86|65.62|64.96|63.66|63.72|63.81|64.45|63.69|64.43|64.64|64.61|66.03|66.8|66.73|66.65|67.85|68.73|68.01|68.48|69.08|69.79|70.36|69.64|70.31|69.4|69.19|69.48|68.56|69.32|69.81|69.91|71.08|70.08|68.41|67.78|67.78|68.6|67.45|67.69|66.75|65.74|64.26|63.04|62.2|61.94|62.29|62.86|64.3|64.95|64.68|64.81|66.12|67.04|67.96|67.59|66.08|64.23|64.26|65.78|65.67|65.09|63.87|65.19|64.53|64.2|63.61|63.67|64.68|64.82|66|68.15|68.98|69.03|68.81|68.63|68.13|69.02|69.02|66.04|66.54|66.51|68.19|70.67|72.74|71.44|73.18|72.05|71.71|73.73|74.85|74.62|74.54|75.86|73.79|75.39|75.33|75.92|74.85|73.14|73.45|74.75|74.16|77.6|77.59|77.37|78.17|78.94|78.19|80.09|78.38|78.34|80.42|78.69|78.9|76.6|74.51|75.89|76.45|74.54|73.41|72.91|73.23|75.23|75.11|74.58|74.86|75.07|74.77|72.02|74.87|74.92|74.25|72.87|73.67|72.82|73.58|76.09|76.26|77.44|76.71|75.87|76.99|77.09|74.98|77.08|77.8|75.35|72.11|74.11|71.03|70.87|70.52|71.94|71.99|73.45|73.53|73.67|74.51|74.84|74.99|74.16|72.28|72.95|72.48|72.51|72.31|70.71|70.55|71|70.62|70.77|68.38|69.21|70.14|71.11|71.65|72.96|73.73|74.41|74.41|75.91|76.07|77.05|76.94|77.81|77.51|76.68|75.67|75.55|76.77|78.22|80.02|77.66|77.87|78.22|79.25|79.43|79.03|78.9|80.89|82.21|81.87|81.54|82.72|84.94|85.63|85.45|86.07|85.12|84.22|85.16|83.82|81.35|80.71|80.91|80.53|79.91|80.3|80.38|80.45|78.67|77.34|77.3|77.4|77.56|75.68|74.84|71.25|71.11|72.68|70.64|70.1|69.29|69.01|69.81|65.45|64.88|65.61|65.29|64.14|61.5|61.65|61.11|57.69|59.7|59.58|57.97|58.29|57.71|60.17|61.22|61.4|57.83|61.71|60.29|59.73|59.94|59.03|58.56|57.59|55.26|55.6|52.84|51.93|51.49|50.57|54.06|53.23|55.64|57.1|56.91|59.46|60.47|59.24|58.8|58.65|59.81|59.85|62.04|62.18|60.9|61.05|61.09|61.49|59.71|60.98|61.89|62.46|61.86|62.26|61.67|62.22|61.01|61.37|61.3|62.58|63.27|64|65.65|66.41|65.86|66.82|66.91|66.91|64.02|64.51|65.55|65.03|63.71|64.44|64.24|64.51|64.82|65.66|65.06|65.33|65.89|66.18|66.11|66.65|67.13|68.35|68.3|66.29|67.37|67.51|67.35|66.08|67.93|69.08|69.68|69.21|69.8|69.93|71.12|71.02|71.63|71.3|71.57|70.9|70.74|71.14|70.71|70.71|74.39|73.59|74.94|71.03|71.22|72.19|72.01|70.56|71.95|71.95|70.98|71.09|70.61|71.63|72.35|72.53|73.09|74.7|73.94|73.21|72.94|71.94|68.37|67.98|70.19|70.64|69.55|66.78|63.16|63.56|62.14|62.77|64.1|64.31|63.56|61.66|63.28|63.13|62.56|63.35|62.85|65.44|65.99|65.16|66.24|66.85|66.78|67.52|65.1|62.72|63.53|63.62|64.23|64.89|64.3|66.41|67.64|66.65|66.86|65.87|63.67|60.7|61.04|61.96|62.28|63.83|63.47|62.46|62.29|62.55|64.07|62.9|61.12|59.32|58.63|55.03|56.29|57.37|57.13|59.9|57.86|57.37|59|59.79|59.03|60.6|59.81|58.64|58.64|58.44|60.42|60.59|61.04|58.55|57.93|60.68|62.7|61.28|63.99|64.67|63.02|60.76|61.25|68.42|65.59|64.29|64.25|65.23|64.66|64.13|62.41|62.08|62.48|60.99|60.06|57.92|58.01|59.13|59.46|58.14|59.7|59.08|60.59|58.81|59.19|59.3|59.35|59.96|58.95|60.5|60.52|61.71|62.06|60.39|61.05|60.22|59.3|60.17|62.52|62.72|62.11|62.6|62|62.58|62.19|62.27|62.46|63.32|62.82|62.37|63.8|64.99|64.83|64.67|64.82|65.03|64.68|64.5|63.2|62.95|65.25|65.67|66.5|66.44|66.57|65.37|66.67|67.44|68.04|68.99|69.12|69.7|68.66|67.49|69.26|69.26|68.91|68.3|67.77|67.05|69.08|70.25|68.74|67.31|66.58|66.77|64.14|64.45|63.29|64.63|64.05|64.63|63.66|62.11|61.26|59.34|58.54|59.37|59.46|57.72|57.77|54|53.9|55.36|55.18|54.53|53.39|54|55.54|56.34|57.37|57.83|57.35|59.72|59.57|58.6|56.71|55.29|54.96|52.19|51.31|52.52|52.24|51.86|51.29|45.6|35.33|35.57|34.45|31.02|32.25|27.98|27.97|22.79|23.98|25.55|23.75|24.5|25.62|23.55|22.39|19.19|14.85|14.97|20.24|24.33|22.58|22.1|25.22|20.23|21.74|19.8|18.69|19.75|17.36|9.12|13.77|15.06|15.87|15.17|15.6|17.86|18.11|18.49|20.4|25.46|24.2|24.23|25.53|26.67|27.89|29.87|30.95|33.3|33.06|34.76|34.78|33.8|33.95|32.73|33.98|34.15|36.74|37.72|37.98|38.41|41|39.66|40.45|41.18|37.76|38.54|39.44|40.75|40.47|41.75|42.33|43.2|42.72|40.4|41.18|40.97|41.58|41.64|42.18|43.19|42.92|42.73|43.28|43.67|42.35|43.27|42.85|42.97|43.96|43.71|43.53|43.3|44.31|43.98|42.96|43.29|43.39|43.11|43.51|42.98|43.13|43.76|43.99|44.92|45.04|44.07|44.19|43.68|45.09|44.87|44.86|44.91|45.34|45.21|44.56|43.94|44.43|46.01|45.79|44.84|45.22|45.72|42.7|42.72|41.1|40.67|38.53|39.98|39.27|38.8|38.57|39.54|41.23|42.35|42.16|40.37|40.84|41.09|41.24|40.91|41.59|40.33|40.3|39.75|38|39.78|41.27|40.62|42|41.63|40.5|41.34|41.81|41.61|41.34|41.29|41.62|40.09|41.28|40.71|39.06|39.72|37.86|36.56|36.33|37.78|38.17|39.68|39.47|38.08|40.93|42.25|42.5|42.16|41.51|42.71|42.54|42.91|43.09|43.79|45|46.63|47.3|46.32|46.88|46.84|47.03|47.8|48.37|49.1|48.63|48.84|48.81|50.33|50.01|50.27|50.77|50.83|51.2|52.17|50.61|49.88|51.05|50.88|50.88|50.44|50.74|51.22|50.37|53.16|53.8|53.7|55.51|54.84|55.98|55.52|55.76|54.8|54.21|55.38|55.66|55.68|55.22|55.44|55.26|55.07|54.87|55.25|56.42|57.62|58.61|58.98|59.48|60.17|60.74|61.17|61.09|62.47|63.58|63.96|65.02|64.09|62.84|64.73|65.16|66.85|66.69|65.86|64.56|63.17|64.7|67.32|69.95|68|67.03|67.53|69.34|68.87|68.78|67.95|67.73|62.11|64|63.89|59.96|63.7|61.21|63.77|64.06|63.28|63.52|63.85|61.47|61.86|62.09|61.89|62.38|62.83|66.11|66.13|65.98|66.54|65.34|64.02|65.07|65.75|65.5|66.25|67.08|68.26|67.73|68.91|69.71|68.62|68.73|68.61|68.83|69.62|67.36|69.24|69.62|69.01|66.88|65.18|66.72|68.59|68.8|68.93|69.43|69.36|70.03|70.6|70.71|71.3|70.89|71.39|71.31|71.65|72.05|72.27|73.38|73.88|72.92|73.1|74.49|74.92|75.22|75.95|76.45|74.78|75.38|76.94|76.69|77.51|78.34|75.81|74.31|75.07|77.14|76.77|77.5|75.74|74.53|74.46|69.33|70.03|72.54|74.25|74.86|74.79|74.87|75.09|76.3|77.72|73.91|73.24|70.99|72.14|71.02|69.65|71.14|71.99|71.79|70.9|70.07|69.4|68.61|66.8|65.51|69.07|71.21|72.12|70.42|72.26|73.45|71.99|73.56|73.07|72.43|71.52|72.36|71.32|72.44|72.97|73.05|74.84|75.14|74.64|73.59|73.65|75.5|76.44|77.42|78.85|78.3|77.86|77.81|79.4|81.44|82.72|81.39|82.34|82.17|83.75|83.53|83.53|83.86|84.67|84.13|85.02|85.76|84.58|85.43|84.85|85.11|84.12|83.4|83.1|84.51|84.42|81.1|80.15|82.43|83.22|84.52|82.91|83.4|82.9|81.94|82.85|80.67|82.45|80.24|80.97|83.43|82.37|82.05|72.37|73.34|70.86|69.53|70.56|70.71|73.38|75.54|75.94|74.1|74.98|74.12|73.37|73.71|74.64|72.97|70.51|72.85|74.69|76.26|75.24|78.63|78.61|77.24|78.25|79.39|80.6|81.99|82.28|81.56|84.98|85.83|85.8|87.17|87.82|88.83|89.64|89.75|89.75|87.74|89.49|91.22|90.7|91.47|92.35|90.24|91.43|92.99|96.86|97.28|96.07|94.95|96.37|97.5|101.66|98.43|97.44|95.28|96.18|98.95|98.73|99.29|101.29|98.56|103.08|110.93|118.94|115.36|123.86|129.02|133.18|116.58|114.54|118.11|110.39|105.14|104.61|113.5|114.32|122.29|121.53|127.52|123.98|122.67|114.5|112.79|115.59|107.29|106.13|108.15|106.6|100.81|99.83|101.26|97.92|104.42|108.49|110.83|105.49|105.05|107.2|105.15|99.27|102.89|103.3|105.78|108.36|104.94|110.53|112.11|113.86|106.67|102.61|107.7|108.06|112.12|114.86|112.89|110.04|113.22|113.63|115.13|115.77|116.41|119.81|121.19|123.01|125.53|122.2|125.68|124.99|126.89|129.2|128.47|127.44|128.44|127.02|124.96|125.78|119.22|118.25|118.51|115.54|114.5|117.36|119.69|122.21|120.8|119.78|119.21|121.8|110.49|108.54|113.4|113.95|114.85|106.98|107.17|107.74|112.26|117.27|114.96|115.86|112.81|106.77|108.23|107.32|109.64|109.68|111.51|106.09|106.51|101.82|97.99|100.31|103.46|103.81|105.06|107.19|103.7|98.25|95.36|97.22|96.35|96.45|95.06|99.49|99.87|98.81|101.13|99.34|96.55|92.24|93.09|94.22|91.43|86.83|87.99|91.68|93.45|92.04|92.83|89.28|89.43|89.62|89.86|90.4|84.29|82.55|85.97|89.55|89.41|88.9|90.68|93.74|94.35|95.65|98.88|97.13|95.17|93.44|95.16|92.22|91.04|89.46|91.34|91.52|91.82|91.57|91.76|92.93|94.17|94.64|93.3|95.12|96.07|95.29|99.53|99.87|96.85|93.05|94.25|96.37|93.59|94.3|92.61|91|88.93|88.44|88.65|85.9|85.59|83.4|83.5|83.22|85.61|86.28|86.54|83.36|79.92|77.11|76.02|76.37|78|80.14|83.33|82.34|80.2|81.66|79.45|80.25|79.58|82.45|81.7|80.96|82.82|80.36|75.31|76.73|76.41|77.5|78.4|81.11|82.59|83.43|82.65|84.38|83.78|85.08|86.96|87.54|85.25|85.08|86.29|85.36|84.9|83.42|81.61|80.57|78.85|80.48|82.92|84.17|83.46|85.46|85.98|84.96|84.11|83.84|81.97|82.79|82.14|79.55|82.08|82.31|81.24|83.21|83.68|84.15|85.74|85.86|83.03|82.1|81|82.3|79.67|76.77|74.3|73.12|71.03|72.42|74.78|76.08|74.31|73.63|76.8|78.07|77.51|78.45|79.19|85.81|85.7|85.89|86.56|87.32|88.31|86.51|87.31|85.63|85.48|85.34|83.29|83.36|84.23|82.13|79.19|80.11|81.32|76.71|72.91|73|75.85|77.76|76.7|75.32|74.54|75.46|75.15|76.98|75.75|75.42|75.77|76.66|77.99|75.66|76.33|73.38|71.98|74.18|76|76.61|76.22|76.85|75.88|74.74|71.8|74.24|73.39|75.75|76.76|76.09|75.79|76.92|73.93|73.56|73.86|71.88|73.64|73.86|74.51|74.52|76.23|76.74|76.72|78.77|77.83|79.54|80.35|81.31|79.9|77.8|79.54|79.38|79.62|81.06|82.53|83.46|82.98|84.28|84.49|85.22|85.34|84.01|86.19|87.38|86.47|88|89.31|87.44|87.93|87.4|86.28|84.49|85.24|85.92|85.44|84.7|83.94|84.07|85.42|86.37|86.62|87.29|89.98|90.42|91.25|91.79|91.16|91.85|91.97|93.58|93.04|95.2|95.55|95.95|96.11|94.56|93.7|93.99|94.01|94.46|97.1|96.64|95.86|91.21|94.46|89.83|88.28|87.86|91.37|90.7|87.58|88.4|94.33|90.99|92.52|91.99|93.12|93.72|91.88|88|90.14|88.45|90.73|90.73|86.82|86.92|89.02|87.55|87.31|83.43|81.46|81.74|83.66|84.09|84.2|82.4|77.73|81.22|83.25|82.42|81.76|80.85|79.82|79.49|81.66|82.98|81.72|78.72|78.16|77.27|74.33|74.21|75.94|75.75|74.11|74.14|77.05|76.84|78.89|79.82|81.1|80.73|80.23|80.97|79.04|77.69|76.24|77.18|75.79|78.31|75.47|77.97|78.46|80.21|79.89|79.76|80.15|78.88|81.04|80.71|81.7|82.04|82.15|82.33|83.34|83.99|84.14|82.98|82.2|79.54|79.3|80.46|81.18|83.01|83.58|83.88|84.72|84.41|84.33|84.88|85.52|84.78|84.77|85.84|84.18|84.01|83.8|84.08|84.57|84.82|86.58|85.82|86.59|84.88|84.29|83.44|83.66|83.95|86.16|85.39|86.47|87.36|85.77|84.92|84.87|86.18|85.91|84.94|86.17|87.63|90.6|90.32|92.81|91.73|92.13|91.57|91.49|93.12|90.84|91.29|89.54|88.34|87.96|87.3|88.29|89.02|88.1|89.95|88.44|88.23|83.55|84.81|83.6|82.69|82.44|83.27|83.39|83.18|81|79.98|81.65|82.24|81.91|81.22|79.9|79.25|78.92|81.34|81.5|81.42|79.41|76.45|75.33|75.41|77.62|78.12|79.59|80.15|80.52|81.44|81.49|82.45|84.79|85.64|85.92|86.42|86.75|86.81|85.76|87|87.26|86.57|88.28|88.25|88.34|88.66|87.15|86.48|86.55|86.49|87.35|86.42|86.6|85.76|86.26|85.19|83.44|82.2|83.01|82.58|81.35|80.94|79.26|81.39|81.37|78.35|77.51|76.62|78.26|80.76|81.07|83.06|82.51|82.15|83.09|81.56|81.09|78.85|78.77|78.8|80.34|81.51|80.04|81.55|80.2|77.82|76.46|74.67|74.47|72.82|72.37|70.34|70.31|73.81|73.68|73.96|74.55|74.52|75.93|75.96|74.95|75.29|75.4|73.06|71.63|72.35|75.3|74.86|77.57|79.32|81.74|78.19|77.06|79.45|80.27|78.47|73.68|73.65|74.37|72.75|73.29|75.59|74.68|74.27|75.62|71.87|71.09|73.21|73.25|73.63|74.89|76.98|76.52|75.73|74.04|72.19|72.56|72.86|73.39|73.45|74.35|74.32|74.33|75.09|76.1|74.27|74.56|73.91|73.92|74.16|72.81|74.8|74.68|73.78|73.78|73.73|73.64|74.38|73.52|74.89|74.3|73.16|74.57|73.75|73.19|72.12|73.5|73.77|74.24|74.58|76.14|76.72|77.27|77.84|77.37|78.44|79.76|82.69|82.39|83.48|82.39|83.02|81.68|80.57|80|78.62|78.71|77.3|78.01|77.02|77.42|77.11|76.49|76.58|74.71|74.54|74.68|76.23|77.65|75.38|75.61|75.19|75.81|76.46|76.34|76.95|74.88|74.89|73.11|73.49|75.01|74.76|72.85|72.31|70.92|71.08|72.49|71.08|71.51|72.36|70.82|71.94|71.93|71.93|71.94|72.61|72.64|73.96|73.78|74.6|74.72|74.69|77.23|77.78|77.27|72.54|68.36|66.13|64.86|67.3|65.37|66.83|67.18|66.58|67.94|69.33|68.93|68.26|67.5|66.99|66.13|64.04|63.37|62.37|61.57|62.37|60.31|62.22|64.26|65.28|66.93|65.91|64.36|65.2|66.25|66.93|65.86|64.87|65.41|64.32|65.72|64.6|64.32|66.55|67.48|66.69|67.14|68.02|68.73|68.41|71.29|70.84|76|75.05|78.7|78.38|80.37|78.73|74.34|69.13|68.4|68.57|69.37|68.15|67.63|70.8|70.42|71.03|71.95|72.5|71.98|70.38|72.06|70.96|70.27|69.67|71.32|71.06|71.92|69.69|69.17|70.42|69.23|70.87|73.21|73.98|73.43|70.55|69.56|69.14|67.97|66.99|67.17|67.36|66.8|66.25|68.12|67.3|68.18|66.62|67.61|68.41|68.29|66.89|67.75|68.61|67.83|67.09|68.09|67.76|66.41|64.92|65.44|67.97|67.62|67.25|67.87|67.88|69.69|69.19|67.83|67.05|66.87|67.96|69.64|70.48|71.15|69|68.52|66.67|65.44|66.13|67.09|67.1|67.42|67.23|64.41|64.15|63|62.33|61.08|61.23|60.71|61|62.28|66.32|65.8|65.52|64.03|65.01|65.11|65.44|65.79|65.04|63.54|63.41|63.72|63.01|63.86|61.88|62.14|63.45|63.16|64.86|63.78|63.64|62.78|64.83|63.99|64.81|64.18|64.07|64.22|63.37|63.75|64.15|64.42|63.3|62.62|63.12|61.87|62.11|61.55|59.93|60.61|60.69|61.35|62.22|63.7|63.7|63.1|62.3|61.35|61.98|63|62.1|61.08|63.34|65.11|65.4|67.58|68.87|66.16|66.97|66.91|67.68|66.72|65.46|68.16|67.7|70.28|70.9|71|72.25|67.72|70.01|71.15|69.87|70.45|71.19|71.01|71.52|69.8|69.96|70.81|69.77|71.78|73.17|72.75|71.9|71.21|70.69|71.66|71.32|77.24|83.28|81.56|88.59|95.74|94.35|89.84|90.98|102.38|103.23|101.04|108.39|118.09|111.05|118.42|103.79|108.42|109.14|113.39|121.47|121.88|126.69|119.56|127.61|138.21|122.11|119.03|119.07|123.28|118.69|114.93|116.63|98.63|103.4|106.14|113.44|113.25|111.86|113.89|117.62|124.16|124.24|118.26|114.51|103.7|101.82|103.48|106.11|111.37|110.28|110.91|113.96|116.73|114.64|108.93|105.84|106.9|102.75|97.11|95.47|92.88|98.29|98.49|101.69|98.98|97.29|97.46|94.15|95.73|92.84|88.64|84.36|80.5|80.33|79.35|80.46|76.49|75.69|72.09|73.74|70.16|71.59|70.46|69.24|68.53|68.68|69.56|71.78|76.5|74.46|74.34|81.62|83.69|83.08|81.23|85.01|86.99|93.85|94.12|105.32|100.31|91.82|85.51|91.95|91.91|96.95|88.9|86.47|86.65|89.65|87.62|92.74|93.26|92.52|92.03|92.02|92.43|95.29|92.37|94|96.92|92.71|88.24|87.77|90.18|89.75|96.02|97.59|100.52|102.24|104.47|106.12|109.51|120.98|118.06|121.25|130.8|127.84|121.18|119.66|116.15|114.89|117.45|120.92|116.01|119.97|113.96","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-94c89be1","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the price of 1995-12-11":"The price of 1995-12-11 is 17.68.","the price of 1988-09-20":"The price of 1988-09-20 is 13.15.","the price of 2018-02-07":"The price of 2018-02-07 is 65.74.","the price of 2014-07-31":"The price of 2014-07-31 is 104.94.","the price of 2000-02-24":"The price of 2000-02-24 is 28.21.","the price of 1994-03-14":"The price of 1994-03-14 is 14.03.","the price of 2008-07-25":"The price of 2008-07-25 is 124.7.","the price of 2010-09-08":"The price of 2010-09-08 is 77.48.","the price of 2011-02-28":"The price of 2011-02-28 is 112.27.","the price of 2017-10-10":"The price of 2017-10-10 is 56.62.","the price of 2001-01-12":"The price of 2001-01-12 is 25.63.","the price of 1996-03-05":"The price of 1996-03-05 is 18.75.","the price of 2024-04-22":"The price of 2024-04-22 is 87.3.","the price of 2015-07-02":"The price of 2015-07-02 is 61.73.","the price of 2016-05-31":"The price of 2016-05-31 is 49.26.","the price of 2014-12-26":"The price of 2014-12-26 is 58.72.","the price of 1996-07-11":"The price of 1996-07-11 is 20.01.","the price of 1994-12-19":"The price of 1994-12-19 is 15.58.","the price of 1990-03-06":"The price of 1990-03-06 is 19.18.","the price of 2009-04-02":"The price of 2009-04-02 is 50.89.","the price of 1992-12-09":"The price of 1992-12-09 is 17.8.","the price of 2024-12-20":"The price of 2024-12-20 is 73.19.","the price of 2025-04-23":"The price of 2025-04-23 is 68.26.","the price of 2006-08-17":"The price of 2006-08-17 is 70.42.","the price of 2014-12-22":"The price of 2014-12-22 is 58.31.","the price of 2017-09-05":"The price of 2017-09-05 is 53.63.","the price of 1991-11-21":"The price of 1991-11-21 is 20.73.","the price of 2017-12-19":"The price of 2017-12-19 is 63.69.","the price of 2013-11-01":"The price of 2013-11-01 is 105.78.","the price of 2021-12-14":"The price of 2021-12-14 is 73.37.","the price of 2023-08-15":"The price of 2023-08-15 is 86.28.","the price of 2000-04-13":"The price of 2000-04-13 is 22.65.","the price of 1992-11-16":"The price of 1992-11-16 is 19.2.","the price of 2023-01-10":"The price of 2023-01-10 is 78.4."}}},
{"id":"n-0ac37b20","guard":[["not",["hasAny",["19890815","19900720","19940708","20050708","20111216","20200211","add","angeles","china","close","compare","confirmed","dividend","greater","larger","lesser","makes","mortality","open","phoenix","recovered","smaller","sum"]]]],"pyramid":["render.number",["compute.choose",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-oil-prices-brent-daily-830bec"},{"lit":"date"}],{"lit":1}],{"lit":"fr-oil-prices-brent-daily-830bec"},{"lit":"date"},{"lit":"price"}]],{"lit":1}]],"mem":null},
{"id":"n-015a52c8","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2013-01-25":"The price of 2013-01-25 is 113.88."}}},
{"id":"n-02ad5994","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1998-07-10":"The price of 1998-07-10 is 11.61."}}},
{"id":"n-06128eb0","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1989-06-06":"The price of 1989-06-06 is 18.5."}}},
{"id":"n-0691dd65","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2013-06-27":"The price of 2013-06-27 is 102.74."}}},
{"id":"n-08520b6f","guard":[["has","price"],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2025-04-23":"The price of 2025-04-23 is 68.26."}}},
{"id":"n-0a97e991","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1992-12-15":"The price of 1992-12-15 is 17.8."}}},
{"id":"n-0c9b4626","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2023-11-23":"The price of 2023-11-23 is 80.85."}}},
{"id":"n-0e415c2d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2000-02-24":"The price of 2000-02-24 is 28.21."}}},
{"id":"n-0f09e6c6","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2018-02-07":"The price of 2018-02-07 is 65.74."}}},
{"id":"n-1156ee75","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2000-08-07":"The price of 2000-08-07 is 27.56."}}},
{"id":"n-126feca3","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2024-03-26":"The price of 2024-03-26 is 85.91."}}},
{"id":"n-12b6b6f1","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2017-12-19":"The price of 2017-12-19 is 63.69."}}},
{"id":"n-17581b6a","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1991-11-21":"The price of 1991-11-21 is 20.73."}}},
{"id":"n-19653628","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1992-12-09":"The price of 1992-12-09 is 17.8."}}},
{"id":"n-1992474f","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2023-10-13":"The price of 2023-10-13 is 94.33."}}},
{"id":"n-19f56e87","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1991-12-16":"The price of 1991-12-16 is 18.55."}}},
{"id":"n-1a35a480","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2000-09-07":"The price of 2000-09-07 is 37.43."}}},
{"id":"n-1a75b226","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2016-01-20":"The price of 2016-01-20 is 26.01."}}},
{"id":"n-1b24610f","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2002-03-29":"The price of 2002-03-29 is 25.34."}}},
{"id":"n-1c49516b","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2014-12-26":"The price of 2014-12-26 is 58.72."}}},
{"id":"n-2a5559c2","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2022-05-20":"The price of 2022-05-20 is 113.63."}}},
{"id":"n-2a828dd0","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2023-04-12":"The price of 2023-04-12 is 88.31."}}},
{"id":"n-2ac002db","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2025-09-29":"The price of 2025-09-29 is 69."}}},
{"id":"n-30ab9b9d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1997-05-30":"The price of 1997-05-30 is 18.99."}}},
{"id":"n-30ac9755","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2024-01-09":"The price of 2024-01-09 is 77.97."}}},
{"id":"n-312c954c","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2000-11-07":"The price of 2000-11-07 is 31.59."}}},
{"id":"n-33acfca7","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2018-04-05":"The price of 2018-04-05 is 66.54."}}},
{"id":"n-37a84567","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1995-12-11":"The price of 1995-12-11 is 17.68."}}},
{"id":"n-38385fe3","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2014-12-22":"The price of 2014-12-22 is 58.31."}}},
{"id":"n-38b8e254","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2020-10-07":"The price of 2020-10-07 is 40.62."}}},
{"id":"n-39303e08","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2006-07-14":"The price of 2006-07-14 is 76.13."}}},
{"id":"n-39e6d46d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2024-03-04":"The price of 2024-03-04 is 86.58."}}},
{"id":"n-3f2d3f33","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2023-04-17":"The price of 2023-04-17 is 85.63."}}},
{"id":"n-403c4d0e","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1993-01-22":"The price of 1993-01-22 is 17.08."}}},
{"id":"n-4498f71b","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2000-02-08":"The price of 2000-02-08 is 27.61."}}},
{"id":"n-45819de2","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2021-12-14":"The price of 2021-12-14 is 73.37."}}},
{"id":"n-4886ffe4","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2010-09-08":"The price of 2010-09-08 is 77.48."}}},
{"id":"n-489202de","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1990-06-06":"The price of 1990-06-06 is 14.8."}}},
{"id":"n-4d7de3cf","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2011-06-02":"The price of 2011-06-02 is 114.3."}}},
{"id":"n-4f8b329c","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2017-09-05":"The price of 2017-09-05 is 53.63."}}},
{"id":"n-50ebbd13","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2005-04-04":"The price of 2005-04-04 is 55.92."}}},
{"id":"n-536b4e43","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2020-10-13":"The price of 2020-10-13 is 41.34."}}},
{"id":"n-54ae43c6","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1989-06-28":"The price of 1989-06-28 is 18."}}},
{"id":"n-5e507239","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2020-03-11":"The price of 2020-03-11 is 34.45."}}},
{"id":"n-5e8967f6","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2006-08-17":"The price of 2006-08-17 is 70.42."}}},
{"id":"n-5e9d95ff","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2014-07-31":"The price of 2014-07-31 is 104.94."}}},
{"id":"n-5f595cc2","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1998-07-15":"The price of 1998-07-15 is 11.79."}}},
{"id":"n-62706f9e","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2009-04-02":"The price of 2009-04-02 is 50.89."}}},
{"id":"n-62e14c2e","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2016-11-21":"The price of 2016-11-21 is 45.96."}}},
{"id":"n-6446a551","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2020-03-02":"The price of 2020-03-02 is 52.52."}}},
{"id":"n-68730fd9","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2016-09-20":"The price of 2016-09-20 is 45.24."}}},
{"id":"n-69483c98","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2023-08-15":"The price of 2023-08-15 is 86.28."}}},
{"id":"n-6b55d1e9","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2017-10-10":"The price of 2017-10-10 is 56.62."}}},
{"id":"n-6bdc840f","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1996-03-05":"The price of 1996-03-05 is 18.75."}}},
{"id":"n-6effaeb3","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1988-12-06":"The price of 1988-12-06 is 14.4."}}},
{"id":"n-6f004099","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2016-11-11":"The price of 2016-11-11 is 41.61."}}},
{"id":"n-7000b13d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1992-11-16":"The price of 1992-11-16 is 19.2."}}},
{"id":"n-70c499e2","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1988-09-20":"The price of 1988-09-20 is 13.15."}}},
{"id":"n-75df4dec","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2005-09-06":"The price of 2005-09-06 is 64.16."}}},
{"id":"n-763002bf","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2025-08-04":"The price of 2025-08-04 is 69.56."}}},
{"id":"n-7dccbcc4","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1990-03-06":"The price of 1990-03-06 is 19.18."}}},
{"id":"n-812066d7","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2011-05-23":"The price of 2011-05-23 is 110.13."}}},
{"id":"n-877bea43","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2011-02-28":"The price of 2011-02-28 is 112.27."}}},
{"id":"n-87b221f2","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2004-06-24":"The price of 2004-06-24 is 34.71."}}},
{"id":"n-8a7a1238","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2015-07-02":"The price of 2015-07-02 is 61.73."}}},
{"id":"n-8cdd5767","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2020-08-21":"The price of 2020-08-21 is 43.94."}}},
{"id":"n-8e6b0c72","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2016-05-31":"The price of 2016-05-31 is 49.26."}}},
{"id":"n-8ef4359b","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2026-07-27":"The price of 2026-07-27 is 91.82."}}},
{"id":"n-8f5bc646","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2009-05-15":"The price of 2009-05-15 is 56.33."}}},
{"id":"n-938e76ad","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1993-05-06":"The price of 1993-05-06 is 19.13."}}},
{"id":"n-942d2631","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1996-07-11":"The price of 1996-07-11 is 20.01."}}},
{"id":"n-9e48d5df","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2016-02-12":"The price of 2016-02-12 is 31.8."}}},
{"id":"n-a8fee1b2","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2013-10-25":"The price of 2013-10-25 is 105.7."}}},
{"id":"n-aa2089f1","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2021-06-15":"The price of 2021-06-15 is 73.38."}}},
{"id":"n-ab0483a3","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2013-11-01":"The price of 2013-11-01 is 105.78."}}},
{"id":"n-b26939d1","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 1987-11-05":"The price of 1987-11-05 is 17.85."}}},
{"id":"n-b555a510","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2000-04-13":"The price of 2000-04-13 is 22.65."}}},
{"id":"n-b572df14","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2017-09-13":"The price of 2017-09-13 is 55.52."}}},
{"id":"n-bd8756bd","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2018-09-10":"The price of 2018-09-10 is 76.77."}}},
{"id":"n-bef77c2d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2002-03-19":"The price of 2002-03-19 is 24.51."}}},
{"id":"n-c3cca807","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2001-01-12":"The price of 2001-01-12 is 25.63."}}},
{"id":"n-c3f42217","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2008-07-25":"The price of 2008-07-25 is 124.7."}}},
{"id":"n-c604f672","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2012-06-18":"The price of 2012-06-18 is 95.21."}}},
{"id":"n-cc3190fe","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1994-12-19":"The price of 1994-12-19 is 15.58."}}},
{"id":"n-d391b361","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2019-11-08":"The price of 2019-11-08 is 62."}}},
{"id":"n-d8ec2826","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2019-06-21":"The price of 2019-06-21 is 65.99."}}},
{"id":"n-da4d726c","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1993-06-07":"The price of 1993-06-07 is 18."}}},
{"id":"n-dca77097","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2016-08-12":"The price of 2016-08-12 is 45.12."}}},
{"id":"n-debee530","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 1994-03-14":"The price of 1994-03-14 is 14.03."}}},
{"id":"n-e081b87d","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2004-10-14":"The price of 2004-10-14 is 51.31."}}},
{"id":"n-e3b9e758","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2024-04-22":"The price of 2024-04-22 is 87.3."}}},
{"id":"n-e800df49","guard":[["has","price"],["has","tell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 1991-01-11":"The price of 1991-01-11 is 26.05."}}},
{"id":"n-e909f0bc","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2015-11-30":"The price of 2015-11-30 is 43.73."}}},
{"id":"n-ec222247","guard":[["has","price"],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2023-12-01":"The price of 2023-12-01 is 78.72."}}},
{"id":"n-ed960f43","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2009-08-27":"The price of 2009-08-27 is 70.68."}}},
{"id":"n-f4b8f3ca","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2023-01-10":"The price of 2023-01-10 is 78.4."}}},
{"id":"n-f7c62a6f","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2004-03-19":"The price of 2004-03-19 is 34.33."}}},
{"id":"n-f858b856","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the price of 2024-12-20":"The price of 2024-12-20 is 73.19."}}},
{"id":"n-fccd7095","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the price of 2014-06-19":"The price of 2014-06-19 is 115.19."}}},
{"id":"n-fdf258c6","guard":[["has","price"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the price of 2025-08-12":"The price of 2025-08-12 is 66.8."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the price of 1995-12-11","expect":{"contains":["17.68"],"notRefusal":true}},{"q":"give the price of 2025-08-12","expect":{"contains":["66.8"],"notRefusal":true}},{"q":"give the price of 2025-08-04","expect":{"contains":["69.56"],"notRefusal":true}},{"q":"what is the price of 1988-09-20","expect":{"contains":["13.15"],"notRefusal":true}},{"q":"give the price of 2000-11-07","expect":{"contains":["31.59"],"notRefusal":true}},{"q":"tell me the price of 2004-03-19","expect":{"contains":["34.33"],"notRefusal":true}},{"q":"give the price of 2005-04-04","expect":{"contains":["55.92"],"notRefusal":true}},{"q":"what is the price of 2018-02-07","expect":{"contains":["65.74"],"notRefusal":true}},{"q":"what is the price of 2014-07-31","expect":{"contains":["104.94"],"notRefusal":true}},{"q":"tell me the price of 2020-03-11","expect":{"contains":["34.45"],"notRefusal":true}},{"q":"what is the price of 2000-02-24","expect":{"contains":["28.21"],"notRefusal":true}},{"q":"give the price of 2024-03-26","expect":{"contains":["85.91"],"notRefusal":true}},{"q":"tell me the price of 1998-07-15","expect":{"contains":["11.79"],"notRefusal":true}},{"q":"what is the price of 1994-03-14","expect":{"contains":["14.03"],"notRefusal":true}},{"q":"give the price of 1993-01-22","expect":{"contains":["17.08"],"notRefusal":true}},{"q":"what is the price of 2008-07-25","expect":{"contains":["124.7"],"notRefusal":true}},{"q":"tell me the price of 2012-06-18","expect":{"contains":["95.21"],"notRefusal":true}},{"q":"give the price of 2004-10-14","expect":{"contains":["51.31"],"notRefusal":true}},{"q":"what is the price of 2010-09-08","expect":{"contains":["77.48"],"notRefusal":true}},{"q":"tell me the price of 2000-08-07","expect":{"contains":["27.56"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
