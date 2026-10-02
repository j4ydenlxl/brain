// sp500-of-date-6a9e-smaller-neo-g7.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"sp500-of-date-6a9e-smaller-neo-g7","class":"sp500-of-date-6a9e-smaller","generation":7,"lane":"neo","grownFrom":["which has the smaller sp500, 1971-01-01 or 1980-05-01","whose sp500 is smaller: 1937-05-01 or 1883-08-01","between 1933-04-01 and 1979-08-01, which has the lesser sp500","whose sp500 is smaller: 1902-11-01 or 1879-03-01","whose sp500 is smaller: 1911-04-01 or 1955-12-01","between 2017-06-01 and 2021-11-01, which has the lesser sp500","which has the smaller sp500, 1962-04-01 or 1906-04-01","whose sp500 is smaller: 1991-12-01 or 1952-06-01","between 2025-11-01 and 1991-12-01, which has the lesser sp500","whose sp500 is smaller: 1927-09-01 or 1999-08-01","whose sp500 is smaller: 1979-08-01 or 1994-12-01","between 1906-06-01 and 1878-12-01, which has the lesser sp500","which has the smaller sp500, 1920-10-01 or 1894-06-01","whose sp500 is smaller: 2004-12-01 or 1971-01-01","which has the smaller sp500, 1879-03-01 or 1993-07-01","between 1911-10-01 and 1902-11-01, which has the lesser sp500","whose sp500 is smaller: 1974-10-01 or 1967-01-01","whose sp500 is smaller: 1946-05-01 or 1960-06-01","between 1906-05-01 and 1900-06-01, which has the lesser sp500","between 2005-08-01 and 1901-10-01, which has the lesser sp500"],"version":1});

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
knowLoad([{"id":"fr-s-and-p-500-data-97f0ea","columns":["date","sp500","dividend"],"n":1869,"cols":[{"f":"01871-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|280-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|290-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|1900-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|210-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|220-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|230-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|240-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|250-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|260-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|270-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|280-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|290-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|02000-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|210-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|37-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|38-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|39-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|220-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|31-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|32-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|33-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|34-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|35-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01|510-01|61-01|62-01|36-01-01|62-01|63-01|64-01|65-01|66-01|67-01|68-01|69-01","sep":"|"},{"s":"4.44|4.5|4.61|4.74|4.86|4.82|4.73|4.79|4.84|4.59|4.64|4.74|4.86|4.88|5.04|5.18|5.18|5.13|5.1|5.04|4.95|4.97|4.95|5.07|5.11|5.15|5.11|5.04|5.05|4.98|4.97|4.97|4.59|4.19|4.04|4.42|4.66|4.8|4.73|4.6|4.48|4.46|4.46|4.47|4.54|4.53|4.57|4.54|4.54|4.53|4.59|4.65|4.47|4.38|4.39|4.41|4.37|4.3|4.37|4.37|4.46|4.52|4.51|4.34|4.18|4.15|4.1|3.93|3.69|3.67|3.6|3.58|3.55|3.34|3.17|2.94|2.94|2.73|2.85|3.05|3.24|3.31|3.26|3.25|3.25|3.18|3.24|3.33|3.34|3.41|3.48|3.45|3.52|3.48|3.47|3.45|3.58|3.71|3.65|3.77|3.94|3.96|4.04|4.07|4.22|4.68|4.93|4.92|5.11|5.2|5.3|5.18|4.77|4.79|5.01|5.19|5.18|5.33|5.61|5.84|6.19|6.17|6.24|6.22|6.5|6.58|6.35|6.2|6.25|6.15|6.19|6.01|5.92|5.79|5.78|5.78|5.71|5.68|6|6.18|6.24|6.07|5.81|5.84|5.81|5.68|5.75|5.87|5.77|5.82|5.73|5.47|5.53|5.38|5.46|5.34|5.18|5.32|5.3|5.06|4.65|4.46|4.46|4.74|4.59|4.44|4.35|4.34|4.24|4.37|4.38|4.37|4.32|4.3|4.46|4.71|4.65|4.92|5.24|5.2|5.2|5.3|5.19|5.12|5.02|5.25|5.33|5.37|5.51|5.65|5.79|5.64|5.58|5.54|5.67|5.8|5.9|5.73|5.59|5.45|5.38|5.2|5.3|5.27|5.31|5.28|5.08|5.1|5.17|5.01|5.14|5.25|5.38|5.35|5.24|5.14|5.24|5.3|5.19|5.18|5.32|5.41|5.3|5.37|5.5|5.4|5.35|5.32|5.38|5.32|5.28|5.39|5.62|5.58|5.54|5.41|5.32|5.08|4.71|4.6|4.84|4.9|4.81|4.97|4.95|4.85|4.77|4.93|5.33|5.33|5.25|5.41|5.51|5.52|5.58|5.57|5.57|5.54|5.54|5.62|5.48|5.59|5.57|5.51|5.61|5.51|5.31|5.31|4.84|4.61|4.18|4.08|4.37|4.5|4.57|4.41|4.32|4.38|4.51|4.57|4.4|4.34|4.25|4.41|4.48|4.34|4.34|4.3|4.25|4.19|4.19|4.37|4.61|4.7|4.72|4.79|4.82|4.75|4.59|4.32|4.27|4.45|4.38|4.42|4.4|4.32|4.04|3.81|4.01|4.1|4.38|4.22|4.22|4.18|4.19|4.06|4.08|4.27|4.46|4.75|4.98|4.82|4.65|4.75|4.88|4.87|4.65|4.57|4.87|5.06|5.08|5.27|5.26|5.15|5.32|5.65|6.08|6.31|6.4|6.48|6.21|6.07|6.28|6.44|6.37|6.34|6.46|6.02|6.1|6.21|6.26|6.34|6.04|5.86|5.86|5.94|5.8|6.01|6.48|6.87|7.07|7.25|7.51|8.14|7.73|8.5|7.93|8.04|8|7.91|8.08|7.95|8.12|8.19|8.2|8.48|8.46|8.41|8.6|8.83|8.85|8.57|8.24|8.05|8.46|8.41|8.08|7.75|7.6|7.18|6.85|6.63|6.47|6.26|6.28|6.57|6.68|6.5|6.48|6.64|6.5|6.51|6.78|7.01|7.32|7.75|8.17|8.25|8.43|8.8|9.05|8.94|8.5|8.6|8.87|9.2|9.23|9.36|9.31|9.54|9.87|9.8|9.56|9.43|9.18|9.3|9.06|9.73|10.03|9.73|9.93|9.84|9.56|9.26|8.35|8.39|8.1|7.84|8.14|7.53|7.45|6.64|6.25|6.57|6.85|6.6|6.87|7.24|7.63|7.64|7.92|8.26|8.17|8.27|8.83|9.03|9.06|8.8|8.92|9.32|9.63|9.8|9.94|10.18|10.19|10.23|10.18|10.3|10.08|9.72|9.96|9.72|9.56|9.1|8.64|8.85|8.91|9.32|9.31|9.05|9.27|9.43|9.32|9.28|9.48|9.67|9.63|9.17|8.67|8.72|9.07|9.11|9.12|9.04|9.3|9.59|9.58|9.58|9.59|9.81|9.86|9.84|9.73|9.38|9.3|8.97|8.8|8.79|8.55|8.12|8.23|8.45|8.53|8.26|8.05|8.04|8.37|8.48|8.32|8.12|8.17|8.13|7.68|7.68|7.68|7.68|7.68|7.35|7.48|7.38|7.57|8.14|7.95|8.04|8.01|8.35|8.66|9.14|9.46|9.48|9.33|9.2|9.17|9.07|9.27|9.36|9.23|9.3|9.68|9.98|10.21|9.8|9.57|9.03|9.31|9.17|8.86|9.04|8.79|8.53|8.12|7.68|7.04|6.8|7.21|7.43|7.28|7.21|7.44|7.45|7.51|7.58|7.54|7.86|8.06|7.9|7.85|7.88|8.12|8.39|8.97|9.21|9.51|8.87|9.01|9.47|9.19|8.92|8.83|8.1|8.67|8.6|8.06|7.92|7.91|7.6|7.87|7.88|7.48|6.81|7.11|7.06|6.88|6.91|7.12|6.55|6.53|6.45|6.61|6.7|7.06|7.31|7.3|7.46|7.74|8.21|8.53|8.45|8.51|8.83|9.06|9.26|8.8|8.78|8.9|9.28|9.43|9.1|8.67|8.34|8.06|8.1|8.15|8.03|8.27|8.55|8.83|8.87|8.7|8.5|8.47|8.63|9.03|9.34|9.25|9.13|9.64|10.16|10.58|10.67|10.39|10.28|10.61|10.8|11.1|11.25|11.51|11.89|12.26|12.46|12.65|12.67|11.81|11.48|11.56|12.11|12.62|13.12|13.32|13.02|13.19|13.49|13.4|13.66|13.87|14.21|14.7|14.89|15.22|16.03|16.94|16.68|17.06|17.46|17.53|17.32|18.25|19.4|20|19.02|19.16|19.78|21.17|21.6|23.06|23.15|24.86|24.99|25.43|25.28|25.66|26.15|28.48|30.1|31.3|27.99|20.58|21.4|21.71|23.07|23.94|25.46|23.94|21.52|21.06|20.79|20.78|17.92|16.62|15.51|15.98|17.2|17.53|15.86|14.33|13.87|14.33|13.9|11.83|10.25|10.39|8.44|8.3|8.23|8.26|6.28|5.51|4.77|5.01|7.53|8.26|7.12|7.05|6.82|7.09|6.25|6.23|6.89|8.87|10.39|11.23|10.67|10.58|9.55|9.78|9.97|10.54|11.32|10.74|10.92|9.81|9.94|9.47|9.1|8.88|8.95|9.2|9.26|9.26|8.98|8.41|9.04|9.75|10.12|10.65|11.37|11.61|11.92|13.04|13.04|13.76|14.55|14.86|14.88|14.09|14.69|15.56|15.87|16.05|16.89|17.36|17.06|17.59|18.11|18.09|17.01|16.25|15.64|16.57|16.74|14.37|12.28|11.2|11.02|11.31|11.04|10.31|9.89|9.98|10.21|12.24|12.31|11.75|13.06|13.07|12.69|12.5|12.4|12.39|10.83|11.23|11.43|11.71|11.54|12.77|12.9|12.67|12.37|12.3|12.22|12.15|12.27|10.58|9.67|9.99|10.2|10.63|10.73|10.98|10.53|10.55|9.89|9.95|9.64|9.43|9.76|10.26|10.21|10.24|9.83|9.37|8.76|8.93|8.65|8.18|7.84|7.93|8.33|8.64|8.59|8.68|9.32|9.47|9.52|10.09|10.69|11.07|11.44|11.89|12.1|12.35|11.74|11.99|11.88|11.33|11.48|11.85|11.77|12.1|11.89|12.1|12.67|13|12.81|12.6|12.91|12.82|13.1|13.49|13.94|13.93|14.28|14.82|15.09|14.78|14.83|15.84|16.5|17.04|17.33|18.02|18.07|17.53|18.66|18.7|18.58|18.05|17.7|15.09|14.75|14.69|15.13|15.21|15.8|15.16|14.6|14.34|14.84|15.77|15.46|15.06|15.45|15.27|15.03|14.83|14.1|14.3|15.4|16.15|16.82|16.42|15.94|15.76|16.19|15.29|15.19|15.36|14.77|14.91|14.89|14.78|13.97|14.76|15.29|15.49|15.89|16.11|16.54|16.88|17.21|17.35|17.84|18.44|18.74|17.38|18.43|19.08|19.87|19.83|19.75|21.21|22|21.63|21.92|21.93|21.55|21.93|22.89|23.48|23.36|22.71|23.41|24.19|23.75|23.81|23.74|23.73|24.38|25.08|25.18|24.78|24.26|25.03|26.04|26.18|25.86|25.99|24.71|24.84|23.95|24.29|24.39|23.27|23.97|24.5|24.83|25.46|26.02|26.57|27.63|28.73|28.96|30.13|30.73|31.45|32.18|33.44|34.97|35.6|36.79|36.5|37.76|37.6|39.78|42.69|42.43|44.34|42.11|44.95|45.37|44.15|44.43|47.49|48.05|46.54|46.27|48.78|48.49|46.84|46.24|45.76|46.44|45.43|43.47|44.03|45.05|46.78|47.55|48.51|45.84|43.98|41.24|40.35|40.33|41.12|41.26|42.11|42.34|43.7|44.75|45.98|47.7|48.96|50.95|52.5|53.49|55.62|54.77|56.16|57.1|57.96|57.46|59.74|59.4|57.05|57|57.23|59.06|58.03|55.78|55.02|55.73|55.22|57.26|55.84|56.51|54.81|53.73|55.47|56.8|59.72|62.17|64.12|65.83|66.5|65.62|65.44|67.79|67.26|68|71.08|71.74|69.07|70.22|70.29|68.05|62.99|55.63|56.97|58.52|58|56.17|60.04|62.64|65.06|65.92|65.67|68.76|70.14|70.11|69.07|70.98|72.85|73.03|72.62|74.17|76.45|77.39|78.8|79.94|80.72|80.24|83.22|82|83.41|84.85|85.44|83.96|86.12|86.75|86.83|87.97|89.28|85.04|84.91|86.49|89.38|91.39|92.15|91.73|93.32|92.69|88.88|91.6|86.78|86.06|85.84|80.65|77.81|77.13|80.99|81.33|84.45|87.36|89.42|90.96|92.59|91.43|93.01|94.49|95.81|95.66|92.66|95.3|95.04|90.75|89.09|95.67|97.87|100.5|100.3|98.11|101.3|103.8|105.4|106.5|102|101.5|99.3|101.3|104.6|99.14|94.71|94.18|94.51|95.52|96.21|91.11|90.31|87.16|88.65|85.95|76.06|75.59|75.72|77.92|82.58|84.37|84.28|90.05|93.49|97.11|99.6|103|101.6|99.72|99|97.24|99.4|97.29|92.78|99.17|103.3|105.2|107.7|108.8|107.7|108|107.2|111|109.4|109.6|115.1|117.5|118.4|114.2|112.4|110.3|107.2|104.8|105.8|103.8|105.6|109.8|102|94.78|96.11|93.45|97.44|92.46|89.67|89.79|79.31|76.03|68.12|69.44|71.74|67.07|72.56|80.1|83.78|84.72|90.1|92.4|92.49|85.71|84.67|88.57|90.07|88.7|96.86|100.6|101.1|101.9|101.2|101.8|104.2|103.3|105.5|101.9|101.2|104.7|103.8|101|100.6|99.05|98.76|99.29|100.2|97.75|96.23|93.74|94.28|93.82|90.25|88.98|88.82|92.71|97.41|97.66|97.19|103.9|103.9|100.6|94.71|96.11|99.71|98.23|100.1|102.1|99.73|101.7|102.7|107.4|108.6|104.5|103.7|107.8|110.9|115.3|104.7|103|107.7|114.6|119.8|123.5|126.5|130.2|135.7|133.5|133|128.4|133.2|134.4|131.7|132.3|129.1|129.6|118.3|119.8|122.9|123.8|117.3|114.5|110.8|116.3|116.4|109.7|109.4|109.7|122.4|132.7|138.1|139.4|144.3|146.8|151.9|157.7|164.1|166.4|167|162.4|167.2|167.7|165.2|164.4|166.4|157.3|157.4|157.6|156.6|153.1|151.1|164.4|166.1|164.8|166.3|164.5|171.6|180.9|179.4|180.6|184.9|188.9|192.5|188.3|184.1|186.2|197.5|207.3|208.2|219.4|232.3|238|238.5|245.3|240.2|245|238.3|237.4|245.1|248.6|264.5|280.9|292.5|289.3|289.1|301.4|310.1|329.4|318.7|280.2|245|241|250.5|258.1|265.7|262.6|256.1|270.7|269.1|263.7|268|277.4|271|276.5|285.4|294|292.7|302.3|313.9|323.7|331.9|346.6|347.3|347.4|340.2|348.6|339.97|330.45|338.46|338.18|350.25|360.39|360.03|330.75|315.41|307.12|315.29|328.75|325.49|362.26|372.28|379.68|377.99|378.29|380.23|389.4|387.2|386.88|385.92|388.51|416.08|412.56|407.36|407.41|414.81|408.27|415.05|417.93|418.48|412.5|422.84|435.64|435.23|441.7|450.16|443.08|445.25|448.06|447.29|454.13|459.24|463.9|462.89|465.95|472.99|471.58|463.81|447.23|450.9|454.83|451.4|464.24|466.96|463.81|461.01|455.19|465.25|481.92|493.15|507.91|523.81|539.35|557.37|559.11|578.77|582.92|595.53|614.57|614.42|649.54|647.07|647.17|661.23|668.5|644.07|662.68|674.88|701.46|735.67|743.25|766.22|798.39|792.16|763.93|833.09|876.29|925.29|927.24|937.02|951.16|938.92|962.37|963.36|1023.74|1076.83|1112.2|1108.42|1108.39|1156.58|1074.62|1020.64|1032.47|1144.43|1190.05|1248.77|1246.58|1281.66|1334.76|1332.07|1322.55|1380.99|1327.49|1318.17|1300.01|1391|1428.68|1425.59|1388.87|1442.21|1461.36|1418.48|1461.96|1473|1485.46|1468.05|1390.14|1378.04|1330.93|1335.63|1305.75|1185.85|1189.84|1270.37|1238.71|1204.45|1178.5|1044.64|1076.59|1129.68|1144.93|1140.21|1100.67|1153.79|1111.93|1079.25|1014.02|903.59|912.55|867.81|854.63|909.93|899.18|895.84|837.03|846.63|890.03|935.96|988|992.54|989.53|1019.44|1038.73|1049.9|1080.64|1132.52|1143.36|1123.98|1133.36|1102.78|1132.76|1105.85|1088.94|1117.66|1117.21|1168.94|1199.21|1181.41|1199.63|1194.9|1164.43|1178.28|1202.25|1222.24|1224.27|1225.92|1191.96|1237.37|1262.07|1278.73|1276.65|1293.74|1302.17|1290.01|1253.17|1260.24|1287.15|1317.74|1363.38|1388.64|1416.42|1424.16|1444.8|1406.95|1463.64|1511.14|1514.19|1520.71|1454.62|1497.12|1539.66|1463.39|1479.22|1378.76|1354.87|1316.94|1370.47|1403.22|1341.25|1257.33|1281.47|1216.95|968.8|883.04|877.56|865.58|805.23|757.13|848.15|902.41|926.12|935.82|1009.73|1044.55|1067.66|1088.07|1110.38|1123.58|1089.16|1152.05|1197.32|1125.06|1083.36|1079.8|1087.28|1122.08|1171.58|1198.89|1241.53|1282.62|1321.12|1304.49|1331.51|1338.31|1287.29|1325.19|1185.31|1173.88|1207.22|1226.42|1243.32|1300.58|1352.49|1389.24|1386.43|1341.27|1323.48|1359.78|1403.45|1443.42|1437.82|1394.51|1422.29|1480.4|1512.31|1550.83|1570.7|1639.84|1618.77|1668.68|1670.09|1687.17|1720.03|1783.54|1807.78|1822.36|1817.04|1863.52|1864.26|1889.77|1947.09|1973.1|1961.53|1993.23|1937.27|2044.57|2054.27|2028.18|2082.2|2079.99|2094.86|2111.94|2099.29|2094.14|2039.87|1944.41|2024.81|2080.62|2054.08|1918.6|1904.42|2021.95|2075.54|2065.55|2083.89|2148.9|2170.95|2157.69|2143.02|2164.99|2246.63|2275.12|2329.91|2366.82|2359.31|2395.35|2433.99|2454.1|2456.22|2492.84|2557|2593.61|2664.34|2789.8|2705.16|2702.77|2653.63|2701.49|2754.35|2793.64|2857.82|2901.5|2785.46|2723.23|2567.31|2607.39|2754.86|2803.98|2903.8|2854.71|2890.17|2996.1136363636365|2897.498181818182|2982.156|2977.68|3104.9044999999996|3176.7495238095235|3278.2028571428577|3277.3142105263164|2652.3936363636367|2761.975238095238|2919.615|3104.6609090909087|3207.6190909090906|3391.71|3365.5166666666664|3418.701363636364|3548.992500000001|3695.3099999999995|3793.748421052632|3883.4321052631576|3910.5082608695648|4141.176190476191|4167.849500000001|4238.489545454546|4363.7128571428575|4454.206363636363|4445.543333333333|4460.707142857143|4667.386666666667|4674.772727272726|4573.8155|4435.980526315789|4391.265217391306|4391.295999999999|4040.3599999999997|3898.9466666666676|3911.729499999999|4158.5630434782615|3850.520476190475|3726.050952380952|3917.488571428571|3912.380952380953|3960.6565|4079.684736842105|3968.5591304347827|4121.467368421053|4146.1731818181825|4345.372857142857|4508.075500000001|4457.358695652174|4515.77|4269.4|4460.06|4685.05|4804.49|5011.96|5170.57|5112.49|5235.23|5415.14|5538|5478.21|5621.26|5792.32|5929.92|6010.91|5979.52|6038.69|5683.98|5369.5|5810.92|6029.95|6296.5|6408.95|6584.02|6735.69|6740.89|6853.03|6929.12|6893.81|6654.42|6957.01|7412.55|7450.03|7481.34|7711.32|7669.41","sep":"|","num":true},{"s":"0.26|0.26|0.26|0.26|0.26|0.26|0.26|0.26|0.26|0.26|0.26|0.26|0.2633|0.2667|0.27|0.2733|0.2767|0.28|0.2833|0.2867|0.29|0.2933|0.2967|0.3|0.3025|0.305|0.3075|0.31|0.3125|0.315|0.3175|0.32|0.3225|0.325|0.3275|0.33|0.33|0.33|0.33|0.33|0.33|0.33|0.33|0.33|0.33|0.33|0.33|0.33|0.3275|0.325|0.3225|0.32|0.3175|0.315|0.3125|0.31|0.3075|0.305|0.3025|0.3|0.3|0.3|0.3|0.3|0.3|0.3|0.3|0.3|0.3|0.3|0.3|0.3|0.2908|0.2817|0.2725|0.2633|0.2542|0.245|0.2358|0.2267|0.2175|0.2083|0.1992|0.19|0.1892|0.1883|0.1875|0.1867|0.1858|0.185|0.1842|0.1833|0.1825|0.1817|0.1808|0.18|0.1817|0.1833|0.185|0.1867|0.1883|0.19|0.1917|0.1933|0.195|0.1967|0.1983|0.2|0.205|0.21|0.215|0.22|0.225|0.23|0.235|0.24|0.245|0.25|0.255|0.26|0.265|0.27|0.275|0.28|0.285|0.29|0.295|0.3|0.305|0.31|0.315|0.32|0.32|0.32|0.32|0.32|0.32|0.32|0.32|0.32|0.32|0.32|0.32|0.32|0.3208|0.3217|0.3225|0.3233|0.3242|0.325|0.3258|0.3267|0.3275|0.3283|0.3292|0.33|0.3283|0.3267|0.325|0.3233|0.3217|0.32|0.3183|0.3167|0.315|0.3133|0.3117|0.31|0.3042|0.2983|0.2925|0.2867|0.2808|0.275|0.2692|0.2633|0.2575|0.2517|0.2458|0.24|0.2383|0.2367|0.235|0.2333|0.2317|0.23|0.2283|0.2267|0.225|0.2233|0.2217|0.22|0.2225|0.225|0.2275|0.23|0.2325|0.235|0.2375|0.24|0.2425|0.245|0.2475|0.25|0.2483|0.2467|0.245|0.2433|0.2417|0.24|0.2383|0.2367|0.235|0.2333|0.2317|0.23|0.2292|0.2283|0.2275|0.2267|0.2258|0.225|0.2242|0.2233|0.2225|0.2217|0.2208|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.22|0.2217|0.2233|0.225|0.2267|0.2283|0.23|0.2317|0.2333|0.235|0.2367|0.2383|0.24|0.2408|0.2417|0.2425|0.2433|0.2442|0.245|0.2458|0.2467|0.2475|0.2483|0.2492|0.25|0.2467|0.2433|0.24|0.2367|0.2333|0.23|0.2267|0.2233|0.22|0.2167|0.2133|0.21|0.2083|0.2067|0.205|0.2033|0.2017|0.2|0.1983|0.1967|0.195|0.1933|0.1917|0.19|0.1892|0.1883|0.1875|0.1867|0.1858|0.185|0.1842|0.1833|0.1825|0.1817|0.1808|0.18|0.18|0.18|0.18|0.18|0.18|0.18|0.18|0.18|0.18|0.18|0.18|0.18|0.1817|0.1833|0.185|0.1867|0.1883|0.19|0.1917|0.1933|0.195|0.1967|0.1983|0.2|0.2008|0.2017|0.2025|0.2033|0.2042|0.205|0.2058|0.2067|0.2075|0.2083|0.2092|0.21|0.2175|0.225|0.2325|0.24|0.2475|0.255|0.2625|0.27|0.2775|0.285|0.2925|0.3|0.3017|0.3033|0.305|0.3067|0.3083|0.31|0.3117|0.3133|0.315|0.3167|0.3183|0.32|0.3208|0.3217|0.3225|0.3233|0.3242|0.325|0.3258|0.3267|0.3275|0.3283|0.3292|0.33|0.3317|0.3333|0.335|0.3367|0.3383|0.34|0.3417|0.3433|0.345|0.3467|0.3483|0.35|0.3467|0.3433|0.34|0.3367|0.3333|0.33|0.3267|0.3233|0.32|0.3167|0.3133|0.31|0.3117|0.3133|0.315|0.3167|0.3183|0.32|0.3217|0.3233|0.325|0.3267|0.3283|0.33|0.3358|0.3417|0.3475|0.3533|0.3592|0.365|0.3708|0.3767|0.3825|0.3883|0.3942|0.4|0.4033|0.4067|0.41|0.4133|0.4167|0.42|0.4233|0.4267|0.43|0.4333|0.4367|0.44|0.4367|0.4333|0.43|0.4267|0.4233|0.42|0.4167|0.4133|0.41|0.4067|0.4033|0.4|0.4033|0.4067|0.41|0.4133|0.4167|0.42|0.4233|0.4267|0.43|0.4333|0.4367|0.44|0.4425|0.445|0.4475|0.45|0.4525|0.455|0.4575|0.46|0.4625|0.465|0.4675|0.47|0.47|0.47|0.47|0.47|0.47|0.47|0.47|0.47|0.47|0.47|0.47|0.47|0.4708|0.4717|0.4725|0.4733|0.4742|0.475|0.4758|0.4767|0.4775|0.4783|0.4792|0.48|0.48|0.48|0.48|0.48|0.48|0.48|0.48|0.48|0.48|0.48|0.48|0.48|0.475|0.47|0.465|0.46|0.455|0.45|0.445|0.44|0.435|0.43|0.425|0.42|0.4208|0.4217|0.4225|0.4233|0.4242|0.425|0.4258|0.4267|0.4275|0.4283|0.4292|0.43|0.4408|0.4517|0.4625|0.4733|0.4842|0.495|0.5058|0.5167|0.5275|0.5383|0.5492|0.56|0.5708|0.5817|0.5925|0.6033|0.6142|0.625|0.6358|0.6467|0.6575|0.6683|0.6792|0.69|0.68|0.67|0.66|0.65|0.64|0.63|0.62|0.61|0.6|0.59|0.58|0.57|0.5667|0.5633|0.56|0.5567|0.5533|0.55|0.5467|0.5433|0.54|0.5367|0.5333|0.53|0.5283|0.5267|0.525|0.5233|0.5217|0.52|0.5183|0.5167|0.515|0.5133|0.5117|0.51|0.5058|0.5017|0.4975|0.4933|0.4892|0.485|0.4808|0.4767|0.4725|0.4683|0.4642|0.46|0.4642|0.4683|0.4725|0.4767|0.4808|0.485|0.4892|0.4933|0.4975|0.5017|0.5058|0.51|0.5117|0.5133|0.515|0.5167|0.5183|0.52|0.5217|0.5233|0.525|0.5267|0.5283|0.53|0.5317|0.5333|0.535|0.5367|0.5383|0.54|0.5417|0.5433|0.545|0.5467|0.5483|0.55|0.5542|0.5583|0.5625|0.5667|0.5708|0.575|0.5792|0.5833|0.5875|0.5917|0.5958|0.6|0.6075|0.615|0.6225|0.63|0.6375|0.645|0.6525|0.66|0.6675|0.675|0.6825|0.69|0.6967|0.7033|0.71|0.7167|0.7233|0.73|0.7367|0.7433|0.75|0.7567|0.7633|0.77|0.7767|0.7833|0.79|0.7967|0.8033|0.81|0.8167|0.8233|0.83|0.8367|0.8433|0.85|0.86|0.87|0.88|0.89|0.9|0.91|0.92|0.93|0.94|0.95|0.96|0.97|0.9708|0.9717|0.9725|0.9733|0.9742|0.975|0.9758|0.9767|0.9775|0.9783|0.9792|0.98|0.9667|0.9533|0.94|0.9267|0.9133|0.9|0.8867|0.8733|0.86|0.8467|0.8333|0.82|0.7933|0.7667|0.74|0.7133|0.6867|0.66|0.6333|0.6067|0.58|0.5533|0.5267|0.5|0.495|0.49|0.485|0.48|0.475|0.47|0.465|0.46|0.455|0.45|0.445|0.44|0.4408|0.4417|0.4425|0.4433|0.4442|0.445|0.4458|0.4467|0.4475|0.4483|0.4492|0.45|0.45|0.45|0.45|0.446667|0.443333|0.44|0.44|0.44|0.44|0.45|0.46|0.47|0.48|0.49|0.5|0.516667|0.533333|0.55|0.57|0.59|0.61|0.646667|0.683333|0.72|0.73|0.74|0.75|0.78|0.81|0.84|0.816667|0.793333|0.77|0.78|0.79|0.8|0.793333|0.786667|0.78|0.766667|0.753333|0.74|0.713333|0.686667|0.66|0.61|0.56|0.51|0.513333|0.516667|0.52|0.523333|0.526667|0.53|0.54|0.55|0.56|0.58|0.6|0.62|0.623333|0.626667|0.63|0.636667|0.643333|0.65|0.656667|0.663333|0.67|0.67|0.67|0.67|0.673333|0.676667|0.68|0.683333|0.686667|0.69|0.693333|0.696667|0.7|0.703333|0.706667|0.71|0.703333|0.696667|0.69|0.68|0.67|0.66|0.646667|0.633333|0.62|0.61|0.6|0.59|0.59|0.59|0.59|0.59|0.59|0.59|0.593333|0.596667|0.6|0.603333|0.606667|0.61|0.613333|0.616667|0.62|0.623333|0.626667|0.63|0.633333|0.636667|0.64|0.64|0.64|0.64|0.643333|0.646667|0.65|0.65|0.65|0.65|0.653333|0.656667|0.66|0.66|0.66|0.66|0.666667|0.673333|0.68|0.68|0.68|0.68|0.683333|0.686667|0.69|0.696667|0.703333|0.71|0.713333|0.716667|0.72|0.733333|0.746667|0.76|0.77|0.78|0.79|0.806667|0.823333|0.84|0.843333|0.846667|0.85|0.85|0.85|0.85|0.856667|0.863333|0.87|0.89|0.91|0.93|0.946667|0.963333|0.98|0.993333|1.00667|1.02|1.02667|1.03333|1.04|1.07333|1.10667|1.14|1.15|1.16|1.17|1.18|1.19|1.2|1.24333|1.28667|1.33|1.37667|1.42333|1.47|1.48667|1.50333|1.52|1.53333|1.54667|1.56|1.54667|1.53333|1.52|1.48333|1.44667|1.41|1.41333|1.41667|1.42|1.43|1.44|1.45|1.45|1.45|1.45|1.43667|1.42333|1.41|1.41|1.41|1.41|1.41333|1.41667|1.42|1.42|1.42|1.42|1.43|1.44|1.45|1.45667|1.46333|1.47|1.46333|1.45667|1.45|1.45667|1.46333|1.47|1.49333|1.51667|1.54|1.54667|1.55333|1.56|1.56333|1.56667|1.57|1.58667|1.60333|1.62|1.62667|1.63333|1.64|1.67|1.7|1.73|1.75333|1.77667|1.8|1.81333|1.82667|1.84|1.80667|1.77333|1.74|1.73667|1.73333|1.73|1.73|1.73|1.73|1.74|1.75|1.76|1.77|1.78|1.79|1.78333|1.77667|1.77|1.75667|1.74333|1.73|1.73|1.73|1.73|1.73667|1.74333|1.75|1.75667|1.76333|1.77|1.77667|1.78333|1.79|1.79667|1.80333|1.81|1.81667|1.82333|1.83|1.86667|1.90333|1.94|1.94333|1.94667|1.95|1.95|1.95|1.95|1.95|1.95|1.95|1.94667|1.94333|1.94|1.94|1.94|1.94|1.94667|1.95333|1.96|1.98|2|2.02|2.02667|2.03333|2.04|2.04667|2.05333|2.06|2.06667|2.07333|2.08|2.09667|2.11333|2.13|2.13667|2.14333|2.15|2.16667|2.18333|2.2|2.20333|2.20667|2.21|2.23333|2.25667|2.28|2.29667|2.31333|2.33|2.34667|2.36333|2.38|2.4|2.42|2.44|2.46|2.48|2.5|2.51667|2.53333|2.55|2.57|2.59|2.61|2.62667|2.64333|2.66|2.68|2.7|2.72|2.74|2.76|2.78|2.79667|2.81333|2.83|2.85|2.87|2.89|2.88333|2.87667|2.87|2.88|2.89|2.9|2.9|2.9|2.9|2.90667|2.91333|2.92|2.92|2.92|2.92|2.93|2.94|2.95|2.96333|2.97667|2.99|3.00333|3.01667|3.03|3.04333|3.05667|3.07|3.08|3.09|3.1|3.11|3.12|3.13|3.13667|3.14333|3.15|3.15333|3.15667|3.16|3.16333|3.16667|3.17|3.17333|3.17667|3.18|3.18333|3.18667|3.19|3.17333|3.15667|3.14|3.13|3.12|3.11|3.10667|3.10333|3.1|3.09667|3.09333|3.09|3.08333|3.07667|3.07|3.07|3.07|3.07|3.07|3.07|3.07|3.07333|3.07667|3.08|3.10333|3.12667|3.15|3.15667|3.16333|3.17|3.18667|3.20333|3.22|3.23667|3.25333|3.27|3.30667|3.34333|3.38|3.4|3.42|3.44|3.46|3.48|3.5|3.53|3.56|3.59|3.59333|3.59667|3.6|3.62333|3.64667|3.67|3.68333|3.69667|3.71|3.71|3.71|3.71|3.7|3.69|3.68|3.68333|3.68667|3.69|3.71333|3.73667|3.76|3.79|3.82|3.85|3.91667|3.98333|4.05|4.09667|4.14333|4.19|4.24667|4.30333|4.36|4.40667|4.45333|4.5|4.55667|4.61333|4.67|4.71333|4.75667|4.8|4.83667|4.87333|4.91|4.94667|4.98333|5.02|5.03667|5.05333|5.07|5.11333|5.15667|5.2|5.24667|5.29333|5.34|5.39667|5.45333|5.51|5.55667|5.60333|5.65|5.7|5.75|5.8|5.84667|5.89333|5.94|5.98333|6.02667|6.07|6.1|6.13|6.16|6.2|6.24|6.28|6.31667|6.35333|6.39|6.43333|6.47667|6.52|6.55667|6.59333|6.63|6.66|6.69|6.72|6.75|6.78|6.81|6.82333|6.83667|6.85|6.85667|6.86333|6.87|6.88333|6.89667|6.91|6.92|6.93|6.94|6.96|6.98|7|7.03|7.06|7.09|7.12|7.15|7.18|7.22333|7.26667|7.31|7.33333|7.35667|7.38|7.43|7.48|7.53|7.57333|7.61667|7.66|7.68667|7.71333|7.74|7.77333|7.80667|7.84|7.86|7.88|7.9|7.94|7.98|8.02|8.04667|8.07333|8.1|8.14333|8.18667|8.23|8.24667|8.26333|8.28|8.3|8.32|8.34|8.4|8.46|8.52|8.56667|8.61333|8.66|8.71|8.76|8.81|8.85667|8.90333|8.95|9.04333|9.13667|9.23|9.30667|9.38333|9.46|9.55|9.64|9.75|9.81333|9.89667|10.01|10.0867|10.1933|10.37|10.4233|10.5467|10.73|10.7967|10.9233|11.06|11.14|11.23|11.32|11.4367|11.5533|11.66|11.7267|11.7833|11.83|11.9267|12.0133|12.09|12.1067|12.1133|12.11|12.13|12.14|12.15|12.1933|12.2367|12.28|12.2533|12.2267|12.2|12.24|12.28|12.32|12.32|12.32|12.32|12.3433|12.3667|12.4|12.3867|12.3833|12.39|12.4133|12.4467|12.48|12.4933|12.5067|12.52|12.52|12.52|12.52|12.54|12.56|12.58|12.6233|12.6667|12.71|12.7533|12.7967|12.84|12.87|12.9|12.92|13.0133|13.0967|13.17|13.18|13.18|13.17|13.2433|13.3067|13.36|13.44|13.51|13.58|13.65|13.72|13.79|13.8933|13.9967|14.1|14.1567|14.2133|14.27|14.4|14.53|14.66|14.74|14.82|14.9|14.9533|15.0067|15.06|15.0933|15.1267|15.16|15.2167|15.2733|15.33|15.3867|15.4433|15.5|15.55|15.6|15.64|15.75|15.85|15.95|16.0167|16.0833|16.14|16.1667|16.1833|16.2|16.28333333|16.36666667|16.45|16.45|16.45|16.45|16.513333333333335|16.576666666666668|16.64|16.656666666666666|16.673333333333332|16.69|16.713333333333335|16.736666666666668|16.76|16.740000000000002|16.72|16.7|16.583333333333332|16.46666666666667|16.35|16.323333333333334|16.296666666666667|16.27|16.169999999999998|16.07|15.97|15.876666666666665|15.783333333333331|15.69|15.706666666666667|15.723333333333333|15.74|15.740000000000002|15.740000000000002|15.74|15.736666666666668|15.733333333333334|15.73|15.833333333333332|15.936666666666667|16.04|15.96|15.879999999999999|15.8|15.89|15.98|16.07|16.119999999999997|16.169999999999998|16.22|16.203333333333333|16.186666666666667|16.17|16.310000000000002|16.450000000000003|16.59|16.85666666666667|17.123333333333335|17.39|17.6|17.810000000000002|18.02|18.213333333333335|18.406666666666666|18.6|18.78666666666667|18.973333333333333|19.16|19.253333333333334|19.346666666666668|19.44|19.703333333333333|19.96666666666667|20.23|20.46333333333333|20.696666666666665|20.93|21.11|21.29|21.47|21.72|21.97|22.22|22.406666666666666|22.593333333333334|22.78|23|23.22|23.44|23.66|23.88|24.1|24.36|24.619999999999997|24.88|25.083333333333332|25.286666666666665|25.49|25.71666666666667|25.943333333333335|26.17|26.440000000000005|26.71|26.98|27.230000000000004|27.480000000000004|27.73|27.92|28.11|28.3|28.436666666666667|28.573333333333334|28.71|28.756666666666668|28.803333333333335|28.85|28.696666666666665|28.543333333333333|28.39|28.013333333333335|27.63666666666667|27.26|26.703333333333333|26.14666666666667|25.59|25.026666666666664|24.46333333333333|23.9|23.403333333333332|22.906666666666666|22.41|22.24|22.07|21.9|21.946666666666665|21.993333333333332|22.04|22.143333333333334|22.246666666666666|22.35|22.476666666666667|22.603333333333335|22.73|22.963333333333335|23.196666666666665|23.43|23.733333333333334|24.036666666666665|24.34|24.619999999999997|24.9|25.18|25.596666666666664|26.013333333333335|26.43|26.736666666666668|27.043333333333337|27.35|27.673333333333332|27.996666666666666|28.32|28.743333333333332|29.166666666666664|29.59|30.14333333333333|30.696666666666665|31.25|31.536666666666665|31.82333333333333|32.11|32.49666666666667|32.88333333333334|33.27|33.64666666666667|34.02333333333333|34.4|34.596666666666664|34.79333333333334|34.99|35.403333333333336|35.81666666666666|36.23|36.61333333333333|36.99666666666667|37.38|37.75|38.120000000000005|38.49|38.806666666666665|39.123333333333335|39.44|39.89666666666667|40.35333333333333|40.81|41.120000000000005|41.43|41.74|41.99666666666667|42.25333333333333|42.51|42.803333333333335|43.096666666666664|43.39|43.553333333333335|43.71666666666667|43.88|44.07333333333334|44.266666666666666|44.46|44.65|44.84|45.03|45.25333333333333|45.47666666666667|45.7|45.92666666666667|46.153333333333336|46.38|46.660000000000004|46.94|47.22|47.53666666666667|47.85333333333334|48.17|48.42333333333333|48.67666666666666|48.93|49.28666666666666|49.64333333333333|50|50.33|50.66|50.99|51.44|51.89|52.34|52.81|53.28|53.75|54.14666666666667|54.54333333333334|54.94|55.319091580592705|55.69818316118541|56.07727474177812|56.45818316118542|56.83909158059271|57.22|57.56|57.900000000000006|58.24|58.686867862126704|59.13373572425341|59.58060358638012|59.61373572425342|59.64686786212671|59.68|59.403333333333336|59.126666666666665|58.85|58.659615378670054|58.469230757340114|58.27884613601017|58.06369311230766|57.84854008860516|57.63338706490265|57.71060542140715|57.787823777911655|57.86504213441615|58.32818900579217|58.79133587716819|59.254482748544206|59.63536092649366|60.01623910444312|60.397117282392585|60.921402962953294|61.44568864351402|61.969974324074734|62.65331621604982|63.336658108024906|64.02|64.4527684478357|64.8855368956714|65.31830534350709|65.85220356233806|66.38610178116903|66.92|67.35|67.78|68.21|68.37666666666667|68.54333333333332|68.71|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0","sep":"|","num":true}]}]);
const COLONY = [
{"id":"n-44bb7a75","guard":[["not",["hasAny",["add","angeles","china","compare","confirmed","dividend","greater","high","larger","makes","national","phoenix","price","rate","recovered","sa","sum"]]]],"pyramid":["render.str",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":1}],{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":2}],{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":1}]]],"mem":null},
{"id":"n-baf6805f","guard":[["hasAny",["bigger than","element","exceeds","greater than","item number","larger than","more than","nth","position","sp500"]],["not",["has","of"]],["not",["has","larger"]],["not",["has","compare"]],["not",["has","greater"]]],"pyramid":["render.str",["route.if",["compare.greater",["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":1}],{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"},{"lit":"sp500"}]],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":2}],{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"},{"lit":"sp500"}]]],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":1}]]],"mem":null},
{"id":"n-c7d4d90e","guard":[["not",["hasAny",["add","angeles","compare","dividend","national","phoenix","price","rate","sum"]]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":1}],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":2}],{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"},{"lit":"dividend"}]]]],"mem":null},
{"id":"n-df409b5b","guard":[["hasAny",["element","has","item number","normalise","normalize","nth","position","simplify the text"]],["has","sp500"]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":1}],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":2}],{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"},{"lit":"dividend"}]]]],"mem":null},
{"id":"n-3875399a","guard":[["not",["hasAny",["add","angeles","compare","dividend","makes","national","phoenix","price","rate"]]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":2}],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":1}],{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"},{"lit":"dividend"}]]]],"mem":null},
{"id":"n-600c7b7e","guard":[["hasAny",["element","item number","normalise","normalize","nth","position","simplify the text","sp500"]],["not",["has","of"]],["not",["has","compare"]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":2}],["know.num",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"}],{"lit":1}],{"lit":"fr-s-and-p-500-data-97f0ea"},{"lit":"date"},{"lit":"dividend"}]]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which has the smaller sp500, 1971-01-01 or 1980-05-01","expect":{"contains":["1971-01-01"],"notContains":["1980-05-01"],"notRefusal":true}},{"q":"whose sp500 is smaller: 1937-05-01 or 1883-08-01","expect":{"contains":["1883-08-01"],"notContains":["1937-05-01"],"notRefusal":true}},{"q":"between 1933-04-01 and 1979-08-01, which has the lesser sp500","expect":{"contains":["1933-04-01"],"notContains":["1979-08-01"],"notRefusal":true}},{"q":"whose sp500 is smaller: 1902-11-01 or 1879-03-01","expect":{"contains":["1879-03-01"],"notContains":["1902-11-01"],"notRefusal":true}},{"q":"whose sp500 is smaller: 1911-04-01 or 1955-12-01","expect":{"contains":["1911-04-01"],"notContains":["1955-12-01"],"notRefusal":true}},{"q":"between 2017-06-01 and 2021-11-01, which has the lesser sp500","expect":{"contains":["2017-06-01"],"notContains":["2021-11-01"],"notRefusal":true}},{"q":"which has the smaller sp500, 1962-04-01 or 1906-04-01","expect":{"contains":["1906-04-01"],"notContains":["1962-04-01"],"notRefusal":true}},{"q":"whose sp500 is smaller: 1991-12-01 or 1952-06-01","expect":{"contains":["1952-06-01"],"notContains":["1991-12-01"],"notRefusal":true}},{"q":"between 2025-11-01 and 1991-12-01, which has the lesser sp500","expect":{"contains":["1991-12-01"],"notContains":["2025-11-01"],"notRefusal":true}},{"q":"whose sp500 is smaller: 1927-09-01 or 1999-08-01","expect":{"contains":["1927-09-01"],"notContains":["1999-08-01"],"notRefusal":true}},{"q":"whose sp500 is smaller: 1979-08-01 or 1994-12-01","expect":{"contains":["1979-08-01"],"notContains":["1994-12-01"],"notRefusal":true}},{"q":"between 1906-06-01 and 1878-12-01, which has the lesser sp500","expect":{"contains":["1878-12-01"],"notContains":["1906-06-01"],"notRefusal":true}},{"q":"which has the smaller sp500, 1920-10-01 or 1894-06-01","expect":{"contains":["1894-06-01"],"notContains":["1920-10-01"],"notRefusal":true}},{"q":"whose sp500 is smaller: 2004-12-01 or 1971-01-01","expect":{"contains":["1971-01-01"],"notContains":["2004-12-01"],"notRefusal":true}},{"q":"which has the smaller sp500, 1879-03-01 or 1993-07-01","expect":{"contains":["1879-03-01"],"notContains":["1993-07-01"],"notRefusal":true}},{"q":"between 1911-10-01 and 1902-11-01, which has the lesser sp500","expect":{"contains":["1902-11-01"],"notContains":["1911-10-01"],"notRefusal":true}},{"q":"whose sp500 is smaller: 1974-10-01 or 1967-01-01","expect":{"contains":["1974-10-01"],"notContains":["1967-01-01"],"notRefusal":true}},{"q":"whose sp500 is smaller: 1946-05-01 or 1960-06-01","expect":{"contains":["1946-05-01"],"notContains":["1960-06-01"],"notRefusal":true}},{"q":"between 1906-05-01 and 1900-06-01, which has the lesser sp500","expect":{"contains":["1900-06-01"],"notContains":["1906-05-01"],"notRefusal":true}},{"q":"between 2005-08-01 and 1901-10-01, which has the lesser sp500","expect":{"contains":["1901-10-01"],"notContains":["2005-08-01"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
