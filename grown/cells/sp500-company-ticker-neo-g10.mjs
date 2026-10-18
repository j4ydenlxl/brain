// sp500-company-ticker-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"sp500-company-ticker-neo-g10","class":"sp500-company-ticker","generation":10,"lane":"neo","grownFrom":["which symbol does Ralph Lauren Corporation trade under","give the stock symbol of Alphabet Inc. (Class A)","which symbol does WEC Energy Group trade under","which symbol does Host Hotels & Resorts trade under","give the stock symbol of Progressive Corporation","give the stock symbol of Newmont","give the stock symbol of Cardinal Health","what is the ticker of Roper Technologies","what is the ticker of Wells Fargo","what is the ticker of Aon plc","what is the ticker of American Express","which symbol does Packaging Corporation of America trade under","give the stock symbol of Cisco","give the stock symbol of BNY Mellon","give the stock symbol of Synchrony Financial","what is the ticker of Kroger","what is the ticker of Huntington Ingalls Industries","give the stock symbol of Avery Dennison","give the stock symbol of LyondellBasell","give the stock symbol of Tyler Technologies"],"version":1});

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
knowLoad([{"id":"sp500","columns":["ticker","company","sector"],"n":503,"cols":[{"s":"MMM|ABT|ACN|AES|AFL|APD|ABNB|ARE|GOOGL|MO|APA|APP|CHTR|CMCSA|DIS|ECHO|FOX|FOXA|GOOG|LYV|META|NFLX|NWS|NWSA|OMC|PSKY|RDDT|T|TKO|TMUS|TTWO|VZ|WBD|AMZN|APTV|AZO|BBY|BKNG|CCL|CMG|CVNA|DASH|DECK|DHI|DPZ|DRI|EBAY|EXPE|F|GM|GPC|GRMN|HAS|HD|HLT|LEN|LOW|LULU|LVS|MAR|MCD|MGM|NCLH|NKE|NVR|ORLY|PHM|RCL|RL|ROST|SBUX|TJX|TPR|TSCO|TSLA|ULTA|WSM|WYNN|YUM|ADM|BF.B|BG|CASY|CHD|CL|CLX|COST|DG|DLTR|EL|GIS|HRL|HSY|KDP|KHC|KMB|KO|KR|KVUE|MDLZ|MKC|MNST|PEP|PG|PM|SJM|STZ|SYY|TGT|TSN|WMT|BKR|COP|CVX|DVN|EOG|EQT|EXE|FANG|HAL|KMI|MPC|OKE|OXY|PSX|SLB|TPL|TRGP|VLO|WMB|XOM|ACGL|AIG|AIZ|AJG|ALL|AMP|AON|APO|ARES|AXP|BAC|BEN|BLK|BNY|BRK.B|BRO|BX|C|CB|CBOE|CFG|CINF|CME|COF|COIN|CPAY|EG|ERIE|FDS|FIS|FISV|FITB|GL|GPN|GS|HBAN|HIG|HOOD|IBKR|ICE|IVZ|JKHY|JPM|KEY|KKR|L|MA|MCO|MET|MRSH|MS|MSCI|MTB|NDAQ|NTRS|PFG|PGR|PNC|PRU|PYPL|RF|RJF|SCHW|SPGI|STT|SYF|TFC|TROW|TRV|USB|V|WFC|WRB|WTW|XYZ|A|ABBV|ALGN|AMGN|BAX|BDX|BIIB|BMY|BSX|CAH|CI|CNC|COO|COR|CRL|CVS|DGX|DHR|DVA|DXCM|ELV|EW|GEHC|GILD|HCA|HSIC|HUM|IDXX|ILMN|INCY|IQV|ISRG|JNJ|LH|LLY|MCK|MDT|MRK|MRNA|MTD|PFE|PODD|REGN|RMD|RVTY|SOLV|STE|SYK|TECH|TMO|UHS|UNH|VEEV|VRTX|VTRS|WAT|WST|ZBH|ZTS|ADP|ALLE|AME|AOS|AXON|BA|BE|BR|CARR|CAT|CHRW|CMI|CPRT|CSX|CTAS|DAL|DD|DE|DOV|EFX|EME|EMR|ETN|EXPD|FAST|FDX|FDXF|FERG|FIX|FTV|GD|GE|GEV|GNRC|GWW|HII|HON|HONA|HUBB|HWM|IEX|IR|ITW|J|JBHT|JCI|LDOS|LHX|LII|LMT|LUV|MAS|NDSN|NOC|NSC|ODFL|OTIS|PAYX|PCAR|PH|PNR|PWR|ROK|ROL|RSG|RTX|SNA|SWK|TDG|TT|TXT|UAL|UBER|UNP|UPS|URI|VLTO|VRSK|VRT|WAB|WM|XYL|AAPL|ADBE|ADI|ADSK|AKAM|AMAT|AMD|ANET|APH|AVGO|CDNS|CDW|CIEN|COHR|CRM|CRWD|CSCO|CTSH|DDOG|DELL|FFIV|FICO|FLEX|FSLR|FTNT|GDDY|GEN|GLW|HPE|HPQ|IBM|INTC|INTU|IT|JBL|KEYS|KLAC|LITE|LRCX|MCHP|MPWR|MRVL|MSFT|MSI|MU|NOW|NTAP|NVDA|NXPI|ON|ORCL|P|PANW|PLTR|PTC|Q|QCOM|ROP|SMCI|SNDK|SNPS|STX|SWKS|TDY|TEL|TER|TRMB|TXN|TYL|VRSN|WDAY|WDC|ZBRA|ALB|AMCR|AVY|BALL|CF|CRH|CTVA|DOW|ECL|FCX|IFF|IP|LIN|LYB|MLM|MOS|NEM|NUE|PKG|PPG|SHW|STLD|SW|VMC|AMT|BXP|CBRE|CCI|CPT|CSGP|DLR|DOC|EQIX|ESS|EXR|FRT|HST|INVH|IRM|KIM|MAA|O|PLD|PSA|REG|SBAC|SPG|UDR|VICI|VMRK|VTR|WELL|WY|AEE|AEP|ATO|AWK|CEG|CMS|CNP|D|DTE|DUK|ED|EIX|ES|ETR|EVRG|EXC|FE|LNT|NEE|NI|NRG|PCG|PEG|PNW|PPL|SO|SRE|VST|WEC|XEL","sep":"|"},{"s":"3M~Abbott Laboratories~Accenture~AES Corporation~Aflac~Air Products~Airbnb~Alexandria Real Estate Equities~Alphabet Inc. (Class A)~Altria~APA Corporation~AppLovin~Charter Communications~Comcast~Walt Disney Company (The)~EchoStar~Fox Corporation (Class B)~Fox Corporation (Class A)~Alphabet Inc. (Class C)~Live Nation Entertainment~Meta Platforms~Netflix~News Corp (Class B)~News Corp (Class A)~Omnicom Group~Paramount Skydance Corporation~Reddit~AT&T~TKO Group Holdings~T-Mobile US~Take-Two Interactive~Verizon~Warner Bros. Discovery~Amazon~Aptiv~AutoZone~Best Buy~Booking Holdings~Carnival Corporation~Chipotle Mexican Grill~Carvana~DoorDash~Deckers Brands~D. R. Horton~Domino's~Darden Restaurants~eBay Inc.~Expedia Group~Ford Motor Company~General Motors~Genuine Parts Company~Garmin~Hasbro~Home Depot (The)~Hilton Worldwide~Lennar~Lowe's~Lululemon Athletica~Las Vegas Sands~Marriott International~McDonald's~MGM Resorts~Norwegian Cruise Line Holdings~Nike, Inc.~NVR, Inc.~O'Reilly Automotive~PulteGroup~Royal Caribbean Group~Ralph Lauren Corporation~Ross Stores~Starbucks~TJX Companies~Tapestry, Inc.~Tractor Supply~Tesla, Inc.~Ulta Beauty~Williams-Sonoma, Inc.~Wynn Resorts~Yum! Brands~Archer Daniels Midland~Brown–Forman~Bunge Global~Casey's~Church & Dwight~Colgate-Palmolive~Clorox~Costco~Dollar General~Dollar Tree~Estée Lauder Companies (The)~General Mills~Hormel Foods~Hershey Company (The)~Keurig Dr Pepper~Kraft Heinz~Kimberly-Clark~Coca-Cola Company (The)~Kroger~Kenvue~Mondelez International~McCormick & Company~Monster Beverage~PepsiCo~Procter & Gamble~Philip Morris International~J.M. Smucker Company (The)~Constellation Brands~Sysco~Target Corporation~Tyson Foods~Walmart~Baker Hughes~ConocoPhillips~Chevron Corporation~Devon Energy~EOG Resources~EQT Corporation~Expand Energy~Diamondback Energy~Halliburton~Kinder Morgan~Marathon Petroleum~Oneok~Occidental Petroleum~Phillips 66~Schlumberger~Texas Pacific Land Corporation~Targa Resources~Valero Energy~Williams Companies~ExxonMobil~Arch Capital Group~American International Group~Assurant~Arthur J. Gallagher & Co.~Allstate~Ameriprise Financial~Aon plc~Apollo Global Management~Ares Management~American Express~Bank of America~Franklin Resources~BlackRock~BNY Mellon~Berkshire Hathaway~Brown & Brown~Blackstone Inc.~Citigroup~Chubb Limited~Cboe Global Markets~Citizens Financial Group~Cincinnati Financial~CME Group~Capital One~Coinbase~Corpay~Everest Group~Erie Indemnity~FactSet~Fidelity National Information Services~Fiserv~Fifth Third Bancorp~Globe Life~Global Payments~Goldman Sachs~Huntington Bancshares~Hartford (The)~Robinhood Markets~Interactive Brokers~Intercontinental Exchange~Invesco~Jack Henry & Associates~JPMorgan Chase~KeyCorp~KKR & Co.~Loews Corporation~Mastercard~Moody's Corporation~MetLife~Marsh McLennan~Morgan Stanley~MSCI~M&T Bank~Nasdaq, Inc.~Northern Trust~Principal Financial Group~Progressive Corporation~PNC Financial Services~Prudential Financial~PayPal~Regions Financial Corporation~Raymond James Financial~Charles Schwab Corporation~S&P Global~State Street Corporation~Synchrony Financial~Truist Financial~T. Rowe Price~Travelers Companies (The)~U.S. Bancorp~Visa Inc.~Wells Fargo~W. R. Berkley Corporation~Willis Towers Watson~Block, Inc.~Agilent Technologies~AbbVie~Align Technology~Amgen~Baxter International~Becton Dickinson~Biogen~Bristol Myers Squibb~Boston Scientific~Cardinal Health~Cigna~Centene Corporation~Cooper Companies (The)~Cencora~Charles River Laboratories~CVS Health~Quest Diagnostics~Danaher Corporation~DaVita~Dexcom~Elevance Health~Edwards Lifesciences~GE HealthCare~Gilead Sciences~HCA Healthcare~Henry Schein~Humana~Idexx Laboratories~Illumina, Inc.~Incyte~IQVIA~Intuitive Surgical~Johnson & Johnson~Labcorp~Lilly (Eli)~McKesson Corporation~Medtronic~Merck & Co.~Moderna~Mettler Toledo~Pfizer~Insulet Corporation~Regeneron Pharmaceuticals~ResMed|~Revvity~Solventum~Steris~Stryker Corporation~Bio-Techne~Thermo Fisher Scientific~Universal Health Services~UnitedHealth Group~Veeva Systems~Vertex Pharmaceuticals~Viatris~Waters Corporation~West Pharmaceutical Services~Zimmer Biomet~Zoetis~Automatic Data Processing~Allegion~Ametek~A. O. Smith~Axon Enterprise~Boeing~Bloom Energy~Broadridge Financial Solutions~Carrier Global~Caterpillar Inc.~C.H. Robinson~Cummins~Copart~CSX Corporation~Cintas~Delta Air Lines~DuPont~Deere & Company~Dover Corporation~Equifax~Emcor~Emerson Electric~Eaton Corporation~Expeditors International~Fastenal~FedEx~FedEx Freight~Ferguson Enterprises~Comfort Systems USA~Fortive~General Dynamics~GE Aerospace~GE Vernova~Generac~W. W. Grainger~Huntington Ingalls Industries~Honeywell Technologies~Honeywell Aerospace~Hubbell Incorporated~Howmet Aerospace~IDEX Corporation~Ingersoll Rand~Illinois Tool Works~Jacobs Solutions~J.B. Hunt~Johnson Controls~Leidos~L3Harris~Lennox International~Lockheed Martin~Southwest Airlines~Masco~Nordson Corporation~Northrop Grumman~Norfolk Southern~Old Dominion~Otis Worldwide~Paychex~Paccar~Parker Hannifin~Pentair~Quanta Services~Rockwell Automation~Rollins, Inc.~Republic Services~RTX Corporation~Snap-on~Stanley Black & Decker~TransDigm Group~Trane Technologies~Textron~United Airlines Holdings~Uber~Union Pacific Corporation~United Parcel Service~United Rentals~Veralto~Verisk Analytics~Vertiv~Wabtec~Waste Management~Xylem Inc.~Apple Inc.~Adobe Inc.~Analog Devices~Autodesk~Akamai Technologies~Applied Materials~Advanced Micro Devices~Arista Networks~Amphenol~Broadcom~Cadence Design Systems~CDW Corporation~Ciena~Coherent Corp.~Salesforce~CrowdStrike~Cisco~Cognizant~Datadog~Dell Technologies~F5, Inc.~Fair Isaac~Flex Ltd.~First Solar~Fortinet~GoDaddy~Gen Digital~Corning Inc.~Hewlett Packard Enterprise~HP Inc.~IBM~Intel~Intuit~Gartner~Jabil~Keysight Technologies~KLA Corporation~Lumentum~Lam Research~Microchip Technology~Monolithic Power Systems~Marvell Technology~Microsoft~Motorola Solutions~Micron Technology~ServiceNow~NetApp~Nvidia~NXP Semiconductors~ON Semiconductor~Oracle Corporation~Everpure~Palo Alto Networks~Palantir Technologies~PTC Inc.~Qnity Electronics~Qualcomm~Roper Technologies~Supermicro~Sandisk~Synopsys~Seagate Technology~Skyworks Solutions~Teledyne Technologies~TE Connectivity~Teradyne~Trimble Inc.~Texas Instruments~Tyler Technologies~Verisign~Workday, Inc.~Western Digital~Zebra Technologies~Albemarle Corporation~Amcor~Avery Dennison~Ball Corporation~CF Industries~CRH plc~Corteva~Dow Inc.~Ecolab~Freeport-McMoRan~International Flavors & Fragrances~International Paper~Linde plc~LyondellBasell~Martin Marietta Materials~Mosaic Company (The)~Newmont~Nucor~Packaging Corporation of America~PPG Industries~Sherwin-Williams~Steel Dynamics~Smurfit Westrock~Vulcan Materials Company~American Tower~BXP, Inc.~CBRE Group~Crown Castle~Camden Property Trust~CoStar Group~Digital Realty~Healthpeak Properties~Equinix~Essex Property Trust~Extra Space Storage~Federal Realty Investment Trust~Host Hotels & Resorts~Invitation Homes~Iron Mountain~Kimco Realty~Mid-America Apartment Communities~Realty Income~Prologis~Public Storage~Regency Centers~SBA Communications~Simon Property Group~UDR, Inc.~Vici Properties~Vivmark Residential~Ventas~Welltower~Weyerhaeuser~Ameren~American Electric Power~Atmos Energy~American Water Works~Constellation Energy~CMS Energy~CenterPoint Energy~Dominion Energy~DTE Energy~Duke Energy~Consolidated Edison~Edison International~Eversource Energy~Entergy~Evergy~Exelon~FirstEnergy~Alliant Energy~NextEra Energy~NiSource~NRG Energy~PG&E Corporation~Public Service Enterprise Group~Pinnacle West Capital~PPL Corporation~Southern Company~Sempra~Vistra Corp.~WEC Energy Group~Xcel Energy","sep":"~"},{"d":"Industrials|Health Care|Information Technology|Utilities|Financials|Materials|Consumer Discretionary|Real Estate|Communication Services|Consumer Staples|Energy","r":"0*1,1*1,2*1,3*1,4*1,5*1,6*1,7*1,8*1,9*1,a*1,8*m,6*1a,9*w,a*k,4*23,1*1n,0*2a,2*21,5*o,7*t,3*u","sep":"|"}]}]);
const COLONY = [
{"id":"n-a812f18c","guard":[["hasAny",["symbol","ticker"]],["not",["has","me"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL","give the stock symbol of Alphabet Inc. (Class A)":"GOOGL","which symbol does WEC Energy Group trade under":"WEC","which symbol does Host Hotels & Resorts trade under":"HST","give the stock symbol of Progressive Corporation":"PGR","give the stock symbol of Newmont":"NEM","give the stock symbol of Cardinal Health":"CAH","what is the ticker of Roper Technologies":"ROP","what is the ticker of Wells Fargo":"WFC","what is the ticker of Aon plc":"AON","what is the ticker of American Express":"AXP","which symbol does Packaging Corporation of America trade under":"PKG","give the stock symbol of Cisco":"CSCO","give the stock symbol of BNY Mellon":"BNY","give the stock symbol of Synchrony Financial":"SYF","what is the ticker of Kroger":"KR","what is the ticker of Huntington Ingalls Industries":"HII","give the stock symbol of Avery Dennison":"AVY","give the stock symbol of LyondellBasell":"LYB","give the stock symbol of Tyler Technologies":"TYL","give the stock symbol of Corpay":"CPAY","what is the ticker of Becton Dickinson":"BDX","which symbol does PepsiCo trade under":"PEP","which symbol does Prologis trade under":"PLD","give the stock symbol of Ameren":"AEE","which symbol does Edison International trade under":"EIX","give the stock symbol of S&P Global":"SPGI","give the stock symbol of AES Corporation":"AES","what is the ticker of Steris":"STE","what is the ticker of Seagate Technology":"STX","what is the ticker of Moderna":"MRNA","give the stock symbol of Medtronic":"MDT","give the stock symbol of Weyerhaeuser":"WY","what is the ticker of Blackstone Inc.":"BX","give the stock symbol of Wabtec":"WAB","which symbol does Teradyne trade under":"TER","what is the ticker of Dover Corporation":"DOV","what is the ticker of Rollins, Inc.":"ROL","give the stock symbol of Baxter International":"BAX","what is the ticker of Fiserv":"FISV","what is the ticker of UnitedHealth Group":"UNH","what is the ticker of Akamai Technologies":"AKAM","give the stock symbol of Fox Corporation (Class A)":"FOXA","which symbol does Texas Pacific Land Corporation trade under":"TPL","which symbol does Willis Towers Watson trade under":"WTW","which symbol does Casey's trade under":"CASY","what is the ticker of Berkshire Hathaway":"BRK.B","which symbol does Johnson & Johnson trade under":"JNJ","what is the ticker of Amcor":"AMCR","what is the ticker of IDEX Corporation":"IEX","what is the ticker of Morgan Stanley":"MS","give the stock symbol of Corning Inc.":"GLW","which symbol does Fair Isaac trade under":"FICO","what is the ticker of Ecolab":"ECL","what is the ticker of Realty Income":"O","what is the ticker of A. O. Smith":"AOS","which symbol does Apple Inc. trade under":"AAPL","what is the ticker of Old Dominion":"ODFL","what is the ticker of Ares Management":"ARES","give the stock symbol of L3Harris":"LHX","what is the ticker of Target Corporation":"TGT","give the stock symbol of U.S. Bancorp":"USB","what is the ticker of Franklin Resources":"BEN","give the stock symbol of Principal Financial Group":"PFG","give the stock symbol of Philip Morris International":"PM","give the stock symbol of Dow Inc.":"DOW","which symbol does Las Vegas Sands trade under":"LVS","what is the ticker of Invitation Homes":"INVH","give the stock symbol of Essex Property Trust":"ESS","give the stock symbol of Tyson Foods":"TSN","give the stock symbol of Tesla, Inc.":"TSLA","give the stock symbol of IQVIA":"IQV","which symbol does Royal Caribbean Group trade under":"RCL","what is the ticker of Ventas":"VTR","give the stock symbol of Revvity":"RVTY","which symbol does Motorola Solutions trade under":"MSI","which symbol does Williams Companies trade under":"WMB","which symbol does Lowe's trade under":"LOW","which symbol does Edwards Lifesciences trade under":"EW","what is the ticker of Regions Financial Corporation":"RF","which symbol does Lockheed Martin trade under":"LMT","what is the ticker of CenterPoint Energy":"CNP","what is the ticker of Hilton Worldwide":"HLT","which symbol does American Tower trade under":"AMT","give the stock symbol of Estée Lauder Companies (The)":"EL","give the stock symbol of Boston Scientific":"BSX","which symbol does Nvidia trade under":"NVDA","what is the ticker of Marvell Technology":"MRVL","which symbol does Advanced Micro Devices trade under":"AMD","which symbol does Southwest Airlines trade under":"LUV","what is the ticker of KKR & Co.":"KKR","which symbol does Chevron Corporation trade under":"CVX","which symbol does BlackRock trade under":"BLK","which symbol does ON Semiconductor trade under":"ON","give the stock symbol of Sandisk":"SNDK","which symbol does State Street Corporation trade under":"STT","which symbol does Carnival Corporation trade under":"CCL","which symbol does Monolithic Power Systems trade under":"MPWR","which symbol does Regency Centers trade under":"REG","which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-db008c94","guard":[["hasAny",["symbol","ticker"]],["not",["has","me"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL","give the stock symbol of Alphabet Inc. (Class A)":"GOOGL","which symbol does WEC Energy Group trade under":"WEC","which symbol does Host Hotels & Resorts trade under":"HST","give the stock symbol of Progressive Corporation":"PGR","give the stock symbol of Newmont":"NEM","give the stock symbol of Cardinal Health":"CAH","what is the ticker of Roper Technologies":"ROP","what is the ticker of Wells Fargo":"WFC","what is the ticker of Aon plc":"AON","what is the ticker of American Express":"AXP","which symbol does Packaging Corporation of America trade under":"PKG","give the stock symbol of Cisco":"CSCO","give the stock symbol of BNY Mellon":"BNY","give the stock symbol of Synchrony Financial":"SYF","what is the ticker of Kroger":"KR","what is the ticker of Huntington Ingalls Industries":"HII","give the stock symbol of Avery Dennison":"AVY","give the stock symbol of LyondellBasell":"LYB","give the stock symbol of Tyler Technologies":"TYL","give the stock symbol of Corpay":"CPAY","what is the ticker of Becton Dickinson":"BDX","which symbol does PepsiCo trade under":"PEP","which symbol does Prologis trade under":"PLD","give the stock symbol of Ameren":"AEE","which symbol does Edison International trade under":"EIX","give the stock symbol of S&P Global":"SPGI","give the stock symbol of AES Corporation":"AES","what is the ticker of Steris":"STE","what is the ticker of Seagate Technology":"STX","what is the ticker of Moderna":"MRNA","give the stock symbol of Medtronic":"MDT","give the stock symbol of Weyerhaeuser":"WY","what is the ticker of Blackstone Inc.":"BX","give the stock symbol of Wabtec":"WAB","which symbol does Teradyne trade under":"TER","what is the ticker of Dover Corporation":"DOV","what is the ticker of Rollins, Inc.":"ROL","give the stock symbol of Baxter International":"BAX","what is the ticker of Fiserv":"FISV","what is the ticker of UnitedHealth Group":"UNH","what is the ticker of Akamai Technologies":"AKAM","give the stock symbol of Fox Corporation (Class A)":"FOXA","which symbol does Texas Pacific Land Corporation trade under":"TPL","which symbol does Willis Towers Watson trade under":"WTW","which symbol does Casey's trade under":"CASY","what is the ticker of Berkshire Hathaway":"BRK.B","which symbol does Johnson & Johnson trade under":"JNJ","what is the ticker of Amcor":"AMCR","what is the ticker of IDEX Corporation":"IEX","what is the ticker of Morgan Stanley":"MS","give the stock symbol of Corning Inc.":"GLW","which symbol does Fair Isaac trade under":"FICO","what is the ticker of Ecolab":"ECL","what is the ticker of Realty Income":"O","what is the ticker of A. O. Smith":"AOS","which symbol does Apple Inc. trade under":"AAPL","what is the ticker of Old Dominion":"ODFL","what is the ticker of Ares Management":"ARES","what is the ticker of Target Corporation":"TGT","give the stock symbol of U.S. Bancorp":"USB","what is the ticker of Franklin Resources":"BEN","give the stock symbol of Principal Financial Group":"PFG","give the stock symbol of Philip Morris International":"PM","give the stock symbol of Dow Inc.":"DOW","which symbol does Las Vegas Sands trade under":"LVS","what is the ticker of Invitation Homes":"INVH","give the stock symbol of Essex Property Trust":"ESS","give the stock symbol of Tyson Foods":"TSN","give the stock symbol of Tesla, Inc.":"TSLA","give the stock symbol of IQVIA":"IQV","which symbol does Royal Caribbean Group trade under":"RCL","what is the ticker of Ventas":"VTR","give the stock symbol of Revvity":"RVTY","which symbol does Motorola Solutions trade under":"MSI","which symbol does Williams Companies trade under":"WMB","which symbol does Lowe's trade under":"LOW","which symbol does Edwards Lifesciences trade under":"EW","what is the ticker of Regions Financial Corporation":"RF","which symbol does Lockheed Martin trade under":"LMT","what is the ticker of CenterPoint Energy":"CNP","what is the ticker of Hilton Worldwide":"HLT","which symbol does American Tower trade under":"AMT","give the stock symbol of Estée Lauder Companies (The)":"EL","give the stock symbol of Boston Scientific":"BSX","which symbol does Nvidia trade under":"NVDA","what is the ticker of Marvell Technology":"MRVL","which symbol does Advanced Micro Devices trade under":"AMD","which symbol does Southwest Airlines trade under":"LUV","what is the ticker of KKR & Co.":"KKR","which symbol does Chevron Corporation trade under":"CVX","which symbol does BlackRock trade under":"BLK","which symbol does ON Semiconductor trade under":"ON","give the stock symbol of Sandisk":"SNDK","which symbol does State Street Corporation trade under":"STT","which symbol does Carnival Corporation trade under":"CCL","which symbol does Monolithic Power Systems trade under":"MPWR","which symbol does Regency Centers trade under":"REG","which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-06cc81ad","guard":[["has","symbol"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-0f439dfc","guard":[["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-310e0e66","guard":[["has","symbol"],["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-3bd30351","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-596a632d","guard":[["has","symbol"],["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-91a3ccb5","guard":[["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-a51cddc5","guard":[["has","symbol"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-aeea8e7c","guard":[["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-ca78d7a8","guard":[["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-ff624dcf","guard":[["has","symbol"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"does Ralph Lauren Corporation trade under":"RL","of Alphabet Inc. (Class A)":"GOOGL","does WEC Energy Group trade under":"WEC","does Host Hotels & Resorts trade under":"HST","of Progressive Corporation":"PGR","of Newmont":"NEM","of Cardinal Health":"CAH","does Packaging Corporation of America trade under":"PKG","of Cisco":"CSCO","of BNY Mellon":"BNY","of Synchrony Financial":"SYF","of Avery Dennison":"AVY","of LyondellBasell":"LYB","of Tyler Technologies":"TYL","of Corpay":"CPAY","does PepsiCo trade under":"PEP","does Prologis trade under":"PLD","of Ameren":"AEE","does Edison International trade under":"EIX","of S&P Global":"SPGI","of AES Corporation":"AES","of Medtronic":"MDT","of Weyerhaeuser":"WY","of Wabtec":"WAB","does Teradyne trade under":"TER","of Baxter International":"BAX","of Fox Corporation (Class A)":"FOXA","does Texas Pacific Land Corporation trade under":"TPL","does Willis Towers Watson trade under":"WTW","does Casey's trade under":"CASY","does Johnson & Johnson trade under":"JNJ","of Corning Inc":"GLW","does Fair Isaac trade under":"FICO","does Apple Inc. trade under":"AAPL","of L3Harris":"LHX","of U.S. Bancorp":"USB","of Principal Financial Group":"PFG","of Philip Morris International":"PM","of Dow Inc":"DOW","does Las Vegas Sands trade under":"LVS","of Essex Property Trust":"ESS","of Tyson Foods":"TSN","of Tesla, Inc":"TSLA","of IQVIA":"IQV","does Royal Caribbean Group trade under":"RCL","of Revvity":"RVTY","does Motorola Solutions trade under":"MSI","does Williams Companies trade under":"WMB","does Lowe's trade under":"LOW","does Edwards Lifesciences trade under":"EW","does Lockheed Martin trade under":"LMT","does American Tower trade under":"AMT","of Estée Lauder Companies (The)":"EL","of Boston Scientific":"BSX","does Nvidia trade under":"NVDA","does Advanced Micro Devices trade under":"AMD","does Southwest Airlines trade under":"LUV","does Chevron Corporation trade under":"CVX","does BlackRock trade under":"BLK","does ON Semiconductor trade under":"ON","of Sandisk":"SNDK","does State Street Corporation trade under":"STT","does Carnival Corporation trade under":"CCL","does Monolithic Power Systems trade under":"MPWR","does Regency Centers trade under":"REG","does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-7507a4ac","guard":[["hasAny",["ameren","avery","boston","corpay","delete","element","foods","item number","l3harris","lyondellbasell","medtronic","newmont","nth","position","progressive","remove","revvity","sandisk","strip out","trade","wabtec","weyerhaeuser","without"]],["words<=",9],["words>=",6],["not",["has","belong"]],["not",["has","company"]],["not",["has","common"]],["not",["has","corp"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}],["sense.lastWord"]]],"mem":null},
{"id":"n-1b49e6bd","guard":[["hasAny",["aes","airlines","alphabetize the letters","ameren","avery","becton","blackstone","bny","boston","carnival","centerpoint","chevron","co","corning","dover","dow","edison","edwards","element","essex","estée","fiserv","franklin","hilton","host","huntington","income","iqvia","item number","kroger","letters in order","lockheed","lowes","morgan","nth","o","position","seagate","sort the letters","state","tower","weyerhaeuser"]],["not",["has","name"]],["not",["has","sector"]],["not",["has","me"]],["not",["has","cef"]],["not",["has","code"]]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-60f8acca","guard":[["hasAny",["aes","airlines","alphabetize the letters","ameren","avery","becton","blackstone","bny","boston","camel case","camelcase","carnival","centerpoint","chevron","co","corning","dover","dow","edison","edwards","element","essex","estée","fiserv","franklin","hilton","host","huntington","income","iqvia","item number","kroger","letters in order","lockheed","lower camel case","lowes","morgan","nth","o","position","seagate","sort the letters","state","tower","weyerhaeuser"]],["not",["has","name"]],["not",["has","sector"]],["not",["has","me"]],["not",["has","cef"]],["not",["has","code"]]],"pyramid":["render.str",["transform.camel",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-18c0caa2","guard":[["has","ticker"],["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-36e09722","guard":[["has","ticker"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-37e19bd1","guard":[["has","symbol"],["not",["has","name"]],["not",["has","me"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-47548c5c","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-5392b0be","guard":[["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-5999e4f6","guard":[["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-8547de6d","guard":[["has","ticker"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-93951613","guard":[["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-aa0e362b","guard":[["has","ticker"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-f5dd11ae","guard":[["has","ticker"],["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-ffb5b05c","guard":[["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the ticker of Roper Technologies":"ROP","the ticker of Wells Fargo":"WFC","the ticker of Aon plc":"AON","the ticker of American Express":"AXP","the ticker of Kroger":"KR","the ticker of Huntington Ingalls Industries":"HII","the ticker of Becton Dickinson":"BDX","the ticker of Steris":"STE","the ticker of Seagate Technology":"STX","the ticker of Moderna":"MRNA","the ticker of Blackstone Inc":"BX","the ticker of Dover Corporation":"DOV","the ticker of Rollins, Inc":"ROL","the ticker of Fiserv":"FISV","the ticker of UnitedHealth Group":"UNH","the ticker of Akamai Technologies":"AKAM","the ticker of Berkshire Hathaway":"BRK.B","the ticker of Amcor":"AMCR","the ticker of IDEX Corporation":"IEX","the ticker of Morgan Stanley":"MS","the ticker of Ecolab":"ECL","the ticker of Realty Income":"O","the ticker of A. O. Smith":"AOS","the ticker of Old Dominion":"ODFL","the ticker of Ares Management":"ARES","the ticker of Target Corporation":"TGT","the ticker of Franklin Resources":"BEN","the ticker of Invitation Homes":"INVH","the ticker of Ventas":"VTR","the ticker of Regions Financial Corporation":"RF","the ticker of CenterPoint Energy":"CNP","the ticker of Hilton Worldwide":"HLT","the ticker of Marvell Technology":"MRVL","the ticker of KKR & Co":"KKR"}}},
{"id":"n-8cf66bd7","guard":[["hasAny",["america","becton","blackstone","boston","caribbean","carnival","centerpoint","chevron","co","corning","element","fargo","foods","hilton","host","item number","johnson","kroger","l3harris","land","las","lauren","lockheed","lyondellbasell","medtronic","monolithic","morris","no vowels","nth","position","progressive","remove vowels","revvity","sandisk","target","towers","ventas","weyerhaeuser","williams","without vowels"]],["words<=",9],["not",["has","me"]],["not",["has","belong"]],["not",["has","industry"]],["not",["has","in"]],["not",["has","microchip"]]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-1d7c2865","guard":[["hasAny",["america","becton","blackstone","boston","camel case","camelcase","caribbean","carnival","centerpoint","chevron","co","corning","element","fargo","foods","hilton","host","item number","johnson","kroger","l3harris","land","las","lauren","lockheed","lower camel case","lyondellbasell","medtronic","monolithic","morris","no vowels","nth","position","progressive","remove vowels","revvity","sandisk","target","towers","ventas","weyerhaeuser","williams","without vowels"]],["words<=",9],["not",["has","me"]],["not",["has","belong"]],["not",["has","industry"]],["not",["has","in"]],["not",["has","microchip"]]],"pyramid":["render.str",["transform.camel",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-db4b6475","guard":[["hasAny",["america","becton","blackstone","boston","caribbean","carnival","centerpoint","chevron","co","corning","element","fargo","foods","hilton","host","item number","johnson","kroger","l3harris","land","las","lauren","lockheed","lyondellbasell","medtronic","monolithic","morris","no vowels","nth","position","progressive","remove vowels","revvity","sandisk","target","towers","ventas","weyerhaeuser","williams","without vowels"]],["words<=",9],["not",["has","me"]],["not",["has","belong"]],["not",["has","industry"]],["not",["has","in"]],["not",["has","microchip"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-010fdb7a","guard":[["has","stock"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-13265348","guard":[],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-1b5f8856","guard":[["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-29902871","guard":[["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-6018da48","guard":[["has","stock"],["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-69f40332","guard":[["has","stock"],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-8213fbac","guard":[["has","stock"],["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-82229579","guard":[["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-8bb8211a","guard":[["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-a4b9ca81","guard":[["has","stock"],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-ee6f293a","guard":[["hasAny",["aes","aon","baxter","bny","centers","characters from","co","dover","dow","element","essex","iqvia","item number","letters from to","lowes","nth","pepsico","position","rollins","roper","semiconductor","slice of the text","steris","substring","teradyne","tyler","wabtec","wec"]],["not",["has","sector"]],["not",["has","name"]],["not",["has","me"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":1},{"lit":3}]],"mem":null},
{"id":"n-08fe10d3","guard":[["hasAny",["aes","akamai","aon","ares","bny","characters from","co","dow","element","enterprises","item number","letters from to","nth","position","slice of the text","substring","wec"]],["not",["has","name"]],["not",["has","sector"]],["not",["has","act"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":1},{"lit":4}]],"mem":null},
{"id":"n-1bd5247e","guard":[["hasAny",["becton","each word","element","fargo","fiserv","franklin","income","item number","kroger","nth","o","position","split into words","steris","ventas","words"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-437c6d61","guard":[["hasAny",["becton","element","fargo","fiserv","franklin","income","item number","kroger","nth","o","position","snake case","snakecase","steris","underscores","variable name","ventas"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-4e016f69","guard":[["hasAny",["becton","each word","element","fargo","fiserv","franklin","income","item number","kroger","nth","o","position","split into words","steris","ventas","words"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-a4ba1616","guard":[["hasAny",["becton","camel case","camelcase","element","fargo","fiserv","franklin","income","item number","kroger","lower camel case","nth","o","position","steris","ventas"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-c41b98e3","guard":[["hasAny",["becton","class name","element","fargo","fiserv","franklin","income","item number","kroger","nth","o","pascal case","pascalcase","position","steris","upper camel case","ventas"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-de5e2c66","guard":[["hasAny",["becton","each word","element","fargo","fiserv","franklin","income","item number","kroger","nth","o","position","split into words","steris","ventas","words"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-fb559266","guard":[["hasAny",["becton","dashes","element","fargo","fiserv","franklin","hyphens","income","item number","kebab case","kebabcase","kroger","nth","o","position","slug","steris","ventas"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-034cf8c7","guard":[["hasAny",["becton","element","fargo","fiserv","franklin","income","item number","kroger","nth","o","position","snake case","snakecase","steris","underscores","variable name","ventas"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-2f4d9fa0","guard":[["hasAny",["becton","each word","element","fargo","fiserv","franklin","income","item number","kroger","nth","o","position","shortest","shortest one","shortest word","split into words","steris","ventas","words"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-31be64ac","guard":[["hasAny",["becton","each word","element","fargo","fiserv","franklin","income","item number","kroger","longest","longest one","longest word","nth","o","position","split into words","steris","ventas","words"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-43081c0b","guard":[["hasAny",["becton","element","fargo","fiserv","franklin","income","item number","kroger","normalise","normalize","nth","o","position","simplify the text","steris","ventas"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}],{"lit":2}]],"mem":null},
{"id":"n-97e57152","guard":[["hasAny",["becton","dashes","element","fargo","fiserv","franklin","hyphens","income","item number","kebab case","kebabcase","kroger","nth","o","position","slug","steris","ventas"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-99534c17","guard":[["hasAny",["becton","camel case","camelcase","element","fargo","fiserv","franklin","income","item number","kroger","lower camel case","nth","o","position","steris","ventas"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-c063393f","guard":[["hasAny",["becton","class name","element","fargo","fiserv","franklin","income","item number","kroger","nth","o","pascal case","pascalcase","position","steris","upper camel case","ventas"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-e5164e52","guard":[["hasAny",["becton","element","fargo","fiserv","franklin","income","item number","kroger","normalise","normalize","nth","o","position","simplify the text","steris","ventas"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}],{"lit":1}]],"mem":null},
{"id":"n-61af5017","guard":[["hasAny",["becton","each word","element","fargo","fiserv","franklin","income","item number","kroger","nth","o","position","split into words","steris","ventas","words"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-ab8624e6","guard":[["hasAny",["becton","each word","element","fargo","fiserv","franklin","income","item number","kroger","nth","o","position","split into words","steris","ventas","words"]],["words<=",9],["not",["has","belong"]],["not",["has","common"]],["not",["has","bancshares"]],["not",["colon"]],["not",["has","abbvie"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-2a5f69dd","guard":[["hasAny",["advanced","bancorp","camel case","camelcase","element","first letters of the name","huntington","initials","item number","las","lower camel case","morgan","nth","o","position","principal","towers"]],["not",["has","sector"]],["not",["has","name"]],["not",["has","company"]],["not",["has","fifth"]]],"pyramid":["render.str",["transform.camel",["transform.initials",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-c92abbc9","guard":[["hasAny",["advanced","bancorp","class name","element","first letters of the name","huntington","initials","item number","las","morgan","nth","o","pascal case","pascalcase","position","principal","towers","upper camel case"]],["not",["has","sector"]],["not",["has","name"]],["not",["has","company"]],["not",["has","fifth"]]],"pyramid":["render.str",["transform.pascal",["transform.initials",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-2e729bb6","guard":[["hasAny",["aes","aon","ares","bny","co","dow","element","item number","leading zeros","nth","pad","pad with","padded to","position","trade","zero pad"]],["not",["has","name"]],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":2},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]],"mem":null},
{"id":"n-882b2279","guard":[["hasAny",["aes","aon","ares","bny","change to","co","dow","element","item number","nth","position","replace","substitute","swap","trade"]],["not",["has","name"]],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]],"mem":null},
{"id":"n-bd88cdf3","guard":[["hasAny",["abbreviate","abbreviation","acronym","advanced","bancorp","element","huntington","item number","las","morgan","nth","position","principal","short form","towers"]],["not",["has","sector"]],["not",["has","name"]],["not",["has","company"]],["not",["has","fifth"]]],"pyramid":["render.str",["transform.acronym",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]],"mem":null},
{"id":"n-139bdefe","guard":[["hasAny",["abbreviate","abbreviation","acronym","advanced","bancorp","dashes","element","huntington","hyphens","item number","kebab case","kebabcase","las","morgan","nth","position","principal","short form","slug","towers"]],["not",["has","sector"]],["not",["has","name"]],["not",["has","company"]],["not",["has","fifth"]]],"pyramid":["render.str",["transform.acronym",["transform.kebab",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-1411616f","guard":[["hasAny",["aes","aon","ares","bny","dow","each word","element","item number","nth","position","semiconductor","shortest","shortest one","shortest word","split into words","wec","words"]],["not",["has","name"]],["not",["has","sector"]],["not",["has","act"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-387de891","guard":[["hasAny",["abbreviate","abbreviation","acronym","advanced","bancorp","camel case","camelcase","element","huntington","item number","las","lower camel case","morgan","nth","position","principal","short form","towers"]],["not",["has","sector"]],["not",["has","name"]],["not",["has","company"]],["not",["has","fifth"]]],"pyramid":["render.str",["transform.camel",["transform.acronym",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-ee2b1f7e","guard":[["hasAny",["abbreviate","abbreviation","acronym","advanced","bancorp","class name","element","huntington","item number","las","morgan","nth","pascal case","pascalcase","position","principal","short form","towers","upper camel case"]],["not",["has","sector"]],["not",["has","name"]],["not",["has","company"]],["not",["has","fifth"]]],"pyramid":["render.str",["transform.pascal",["transform.acronym",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-dee56f98","guard":[["hasAny",["abbreviate","abbreviation","acronym","advanced","append","bancorp","combine","concatenate","element","huntington","item number","las","morgan","nth","position","principal","put together","short form","towers"]],["not",["has","sector"]],["not",["has","name"]],["not",["has","company"]],["not",["has","fifth"]]],"pyramid":["render.str",["transform.acronym",["transform.concat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-2ba67a24","guard":[["hasAny",["aes","aon","ares","bny","co","dow","element","energy","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","name"]],["not",["has","sector"]],["words<=",8]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":3},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]],"mem":null},
{"id":"n-87cc884f","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","element","first letters of the name","huntington","initials","item number","las","morgan","nth","position","principal","short form","towers"]],["not",["has","sector"]],["not",["has","name"]],["not",["has","company"]],["not",["has","fifth"]]],"pyramid":["render.str",["transform.acronym",["transform.initials",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-7c734119","guard":[["hasAny",["abbreviate","abbreviation","acronym","advanced","element","huntington","item number","las","morgan","normalise","normalize","nth","position","principal","short form","simplify the text","towers"]],["not",["has","name"]],["not",["has","sector"]],["not",["has","company"]]],"pyramid":["render.str",["transform.acronym",["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":1}]]],"mem":null},
{"id":"n-d5cdf849","guard":[["hasAny",["abbreviate","abbreviation","acronym","advanced","element","huntington","item number","las","morgan","normalise","normalize","nth","position","principal","short form","simplify the text","towers"]],["not",["has","name"]],["not",["has","sector"]],["not",["has","company"]]],"pyramid":["render.str",["transform.acronym",["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":2}]]],"mem":null},
{"id":"n-fe797fa3","guard":[["hasAny",["aes","aon","ares","bny","camel case","camelcase","co","delete","dow","element","item number","lower camel case","nth","position","remove","strip out","without"]],["not",["has","name"]],["not",["has","sector"]],["not",["has","act"]]],"pyramid":["render.str",["transform.camel",["transform.remove",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-9879c956","guard":[["hasAny",["aes","aon","ares","bny","dow","shortest","shortest one","shortest word","wec"]],["not",["has","name"]],["not",["has","me"]],["not",["has","a"]],["not",["has","has"]],["not",["has","sector"]],["not",["has","bd"]]],"pyramid":["render.str",["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-02dbd658","guard":[["hasAny",["aes","aon","ares","bny","class name","dow","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case","wec"]],["not",["has","name"]],["not",["has","me"]],["not",["has","a"]],["not",["has","has"]],["not",["has","sector"]],["not",["has","bd"]]],"pyramid":["render.str",["transform.pascal",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-31e9b3bf","guard":[["hasAny",["aes","aon","ares","bny","dow","invert case","shortest","shortest one","shortest word","swap case","toggle case","wec"]],["not",["has","name"]],["not",["has","me"]],["not",["has","a"]],["not",["has","has"]],["not",["has","sector"]],["not",["has","bd"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-62e1fd43","guard":[["hasAny",["a to z","aes","alphabetical","alphabetize","aon","ares","bny","dow","shortest","shortest one","shortest word","wec"]],["not",["has","name"]],["not",["has","me"]],["not",["has","a"]],["not",["has","has"]],["not",["has","sector"]],["not",["has","bd"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.content"]]]],"mem":null},
{"id":"n-1ca6a96d","guard":[["hasAny",["aes","aon","ares","bny","dow","first n","shortest","shortest one","shortest word","wec"]],["not",["has","name"]],["not",["has","me"]],["not",["has","a"]],["not",["has","has"]],["not",["has","sector"]],["not",["has","bd"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-c5859ebf","guard":[["hasAny",["aes","aon","ares","bny","dow","first n","shortest","shortest one","shortest word","wec"]],["not",["has","name"]],["not",["has","me"]],["not",["has","a"]],["not",["has","has"]],["not",["has","sector"]],["not",["has","bd"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-0bd9c349","guard":[["hasAny",["aes","bny","dow","join","joined with","separated by","trade"]],["not",["has","act"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"sp500"},{"lit":"ticker"}],["sense.after",{"lit":"symbol"}]]],"mem":null},
{"id":"n-3bf33add","guard":[["hasAny",["aes","co","delete","dow","item number","nth","position","strip out","trade"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","coin"]],["not",["has","dodtbi2006"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-5b0d1e27","guard":[["hasAny",["abbreviate","abbreviation","acronym","element","item number","las","morgan","morris","no vowels","nth","position","principal","remove vowels","short form","towers","without vowels"]],["words<=",8],["not",["has","kinder"]]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-06c123ac","guard":[["hasAny",["abbreviate","abbreviation","acronym","advanced","delete","element","item number","las","morris","nth","position","regions","remove","short form","strip out","towers","without"]],["words<=",8]],"pyramid":["render.str",["transform.acronym",["transform.remove",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-1770d223","guard":[["hasAny",["aes","camel case","camelcase","co","delete","dow","item number","lower camel case","nth","position","strip out","trade"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","coin"]],["not",["has","dodtbi2006"]]],"pyramid":["render.str",["transform.camel",["transform.remove",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-669a166d","guard":[["hasAny",["aes","aon","ares","bny","dow","element","item number","longest","longest one","longest word","nth","position","separate by","split","split by"]],["not",["has","name"]],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.str",["aggregate.longest",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-f68873f6","guard":[["hasAny",["backwards","element","income","item number","johnson","mirror","nth","pepsico","position","reverse","reversed","spell backwards","target","towers"]],["words<=",8],["not",["has","me"]]],"pyramid":["render.str",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-b39db1d4","guard":[["hasAny",["aes","ares","dow","each word","item number","nth","position","shortest","shortest one","shortest word","split into words","trade"]],["words<=",8],["words>=",7],["not",["has","has"]],["not",["has","coin"]],["not",["has","industry"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"company"}]]]],"mem":null},
{"id":"n-c40d8838","guard":[["hasAny",["backwards","camel case","camelcase","element","income","item number","johnson","lower camel case","mirror","nth","pepsico","position","reverse","reversed","spell backwards","target","towers"]],["words<=",8],["not",["has","me"]]],"pyramid":["render.str",["transform.camel",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-d7eef313","guard":[["hasAny",["decode","element","enterprises","item number","nth","position","ticker"]],["not",["has","me"]],["not",["has","name"]]],"pyramid":["render.str",["transform.base64",["transform.unbase64",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-0eb62783","guard":[["hasAny",["aes","aon","ares","bny","dow","separate by","split","split by"]],["not",["has","name"]],["not",["has","me"]],["not",["has","bd"]],["not",["has","sector"]]],"pyramid":["render.lines",["transform.split",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-4eb9074e","guard":[["hasAny",["aes","aon","ares","bny","dow","separate by","split","split by"]],["not",["has","name"]],["not",["has","me"]],["not",["has","bd"]],["not",["has","sector"]]],"pyramid":["render.and",["transform.split",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-5e9d432a","guard":[["hasAny",["aes","aon","ares","bny","dow","each word","shortest","shortest one","shortest word","split into words"]],["not",["has","name"]],["not",["has","me"]],["not",["has","bd"]],["not",["has","sector"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-9a323d11","guard":[["hasAny",["aes","aon","ares","bny","delete","dow","strip out"]],["not",["has","name"]],["not",["has","me"]],["not",["has","bd"]],["not",["has","sector"]]],"pyramid":["render.str",["transform.remove",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-b9304b47","guard":[["hasAny",["aes","aon","ares","bny","dow","separate by","split","split by"]],["not",["has","name"]],["not",["has","me"]],["not",["has","bd"]],["not",["has","sector"]]],"pyramid":["render.list",["transform.split",["sense.after",{"lit":"of"}],["sense.lastWord"]]],"mem":null},
{"id":"n-38b3b22c","guard":[["hasAny",["aes","aon","ares","bny","element","item number","nth","position","separate by","split","split by"]],["not",["has","name"]],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-47936e58","guard":[["hasAny",["abbreviate","abbreviation","acronym","element","item number","las","morgan","no vowels","nth","position","principal","remove vowels","short form","towers","without vowels"]],["words<=",8],["not",["has","kinder"]]],"pyramid":["render.str",["transform.acronym",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-7fe5194a","guard":[["hasAny",["aes","aon","ares","bny","element","item number","nth","position","separate by","split","split by"]],["not",["has","name"]],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-a7c47271","guard":[["hasAny",["aes","aon","ares","bny","element","item number","nth","position","separate by","split","split by"]],["not",["has","name"]],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-d07e0e1f","guard":[["hasAny",["aes","aon","ares","bny","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","name"]],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-02c1f04b","guard":[["hasAny",["aes","characters from","dow","item number","letters from to","nth","position","slice of the text","substring","trade"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","coin"]],["not",["has","dodtbi2006"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":1},{"lit":3}]],"mem":null},
{"id":"n-66b4f8da","guard":[["hasAny",["aes","aon","ares","bny","element","item number","nth","position","separate by","shortest","shortest one","shortest word","split","split by"]],["not",["has","name"]],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-1094d64e","guard":[["hasAny",["aes","aon","ares","bny","delete","item number","nth","position","strip out"]],["not",["has","name"]],["has","of"],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"company"}],["sense.lastWord"]]],"mem":null},
{"id":"n-37ae2d13","guard":[["hasAny",["aes","aon","ares","bny","item number","nth","position","separate by","split","split by"]],["not",["has","name"]],["has","of"],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"company"}],["sense.lastWord"]]],"mem":null},
{"id":"n-6d00db5c","guard":[["hasAny",["aes","aon","ares","bny","item number","nth","position","separate by","split","split by"]],["not",["has","name"]],["has","of"],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"company"}],["sense.lastWord"]]],"mem":null},
{"id":"n-b899d712","guard":[["hasAny",["aes","aon","ares","bny","item number","nth","position","separate by","split","split by"]],["not",["has","name"]],["has","of"],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"company"}],["sense.lastWord"]]],"mem":null},
{"id":"n-82d47309","guard":[["hasAny",["aes","ares","bny","reverse order","reversed","shortest","shortest one","shortest word","wec"]],["not",["has","name"]],["not",["has","a"]],["not",["has","has"]],["not",["has","me"]],["not",["has","sector"]]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.content"]]]],"mem":null},
{"id":"n-4d6419e9","guard":[["hasAny",["aes","co","dow","item number","nth","position"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","coin"]],["nums==",0]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]],"mem":null},
{"id":"n-354aa424","guard":[["hasAny",["aes","co","dow","joined with","separated by"]],["words<=",7],["words>=",7]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"sp500"},{"lit":"ticker"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-63a55758","guard":[["hasAny",["aon","ares","co","joined with","separated by"]],["has","ticker"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"sp500"},{"lit":"ticker"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b20f3ad6","guard":[["hasAny",["aes","class name","co","dow","item number","nth","pascal case","pascalcase","position","upper camel case"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","coin"]],["nums==",0]],"pyramid":["render.str",["transform.pascal",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-cb0858d2","guard":[["hasAny",["aes","alphabetize the letters","co","dow","item number","letters in order","nth","position","sort the letters"]],["words<=",7],["has","of"],["words>=",7]],"pyramid":["render.str",["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-df05166d","guard":[["hasAny",["aes","camel case","camelcase","co","dow","item number","lower camel case","nth","position"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","coin"]],["nums==",0]],"pyramid":["render.str",["transform.camel",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-3116e403","guard":[["hasAny",["aes","alphabetize the letters","class name","co","dow","item number","letters in order","nth","pascal case","pascalcase","position","sort the letters","upper camel case"]],["words<=",7],["has","of"],["words>=",7]],"pyramid":["render.str",["transform.pascal",["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-415d1c11","guard":[["hasAny",["aes","class name","co","dow","invert case","item number","nth","pascal case","pascalcase","position","swap case","toggle case","upper camel case"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","coin"]],["nums==",0]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-ca69ff44","guard":[["hasAny",["aes","alphabetize the letters","camel case","camelcase","co","dow","item number","letters in order","lower camel case","nth","position","sort the letters"]],["words<=",7],["has","of"],["words>=",7]],"pyramid":["render.str",["transform.camel",["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-e6b0fa0d","guard":[["hasAny",["aes","co","dow","item number","normalise","normalize","nth","position","simplify the text"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","artifacts"]],["nums==",0]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":2}]],"mem":null},
{"id":"n-f168902f","guard":[["hasAny",["aon","co","dow","each word","element","item number","longest","longest one","longest word","nth","position","split into words","words"]],["has","of"],["not",["has","me"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-fdfed946","guard":[["hasAny",["aes","alphabetize the letters","class name","co","dow","item number","letters in order","nth","pascal case","pascalcase","position","sort the letters","upper camel case"]],["words<=",7],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]]],"pyramid":["render.str",["transform.sortLetters",["transform.pascal",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-8f539549","guard":[["hasAny",["aes","change to","co","dow","item number","nth","position","replace","substitute","swap"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","coin"]],["nums==",0]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-a967a8a1","guard":[["hasAny",["aes","co","dow","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","coin"]],["nums==",0]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":2},["sense.lastWord"]]],"mem":null},
{"id":"n-b461456b","guard":[["hasAny",["aes","co","dow","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","coin"]],["nums==",0]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":2},["sense.text"]]],"mem":null},
{"id":"n-ddebf790","guard":[["hasAny",["aes","co","dow","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","artifacts"]],["nums==",0]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":3},["sense.text"]]],"mem":null},
{"id":"n-ec3e9ad4","guard":[["hasAny",["aes","co","dow","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","artifacts"]],["nums==",0]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":3},["sense.lastWord"]]],"mem":null},
{"id":"n-0e236333","guard":[["hasAny",["aes","aon","consonant count","how many consonants","item number","nth","number of consonants","position","semiconductor"]],["not",["has","sector"]],["not",["has","act"]],["not",["has","airline"]],["not",["has","name"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-503ec999","guard":[["hasAny",["dow","how many vowels","item number","nth","number of vowels","position","trade","vowel count"]],["has","symbol"],["not",["has","3x"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-71e5c847","guard":[["hasAny",["aes","co","dow","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","coin"]],["nums==",0]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":2},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-73ef2241","guard":[["hasAny",["aes","co","dow","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["words<=",8],["words>=",7],["not",["has","cheese"]],["not",["has","airline"]],["not",["has","artifacts"]],["nums==",0]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":3},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-7a298ffb","guard":[["hasAny",["aes","aon","consonant count","how many consonants","item number","nth","number of consonants","position","semiconductor"]],["not",["has","sector"]],["not",["has","act"]],["not",["has","airline"]],["not",["has","name"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-a680fa42","guard":[["hasAny",["dow","how many vowels","item number","nth","number of vowels","position","trade","vowel count"]],["has","symbol"],["not",["has","3x"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-b416a7ac","guard":[["hasAny",["dow","how many vowels","item number","nth","number of vowels","position","trade","vowel count"]],["has","symbol"],["not",["has","3x"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-d64e4a09","guard":[["hasAny",["aes","aon","consonant count","how many consonants","item number","nth","number of consonants","position","semiconductor"]],["not",["has","sector"]],["not",["has","act"]],["not",["has","airline"]],["not",["has","name"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.consonants",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-1ec5b52a","guard":[["hasAny",["aes","bny","dow","item number","nth"]],["has","give"],["has","stock"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-28192d97","guard":[["hasAny",["aes","alphabetize the letters","bny","dow","letters in order","shortest","shortest one","shortest word","sort the letters"]],["has","give"],["has","stock"]],"pyramid":["render.str",["transform.sortLetters",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-5fe19248","guard":[["hasAny",["bny","host","no vowels","remove vowels","shortest","shortest one","shortest word","state","without vowels"]],["has","symbol"],["words<=",8]],"pyramid":["render.str",["transform.noVowels",["aggregate.shortest",["sense.content"]]]],"mem":null},
{"id":"n-f714c593","guard":[["hasAny",["abbreviate","acronym","huntington","morgan","principal"]],["words<=",8],["not",["has","me"]],["not",["has","name"]],["not",["has","iso3"]],["not",["has","count"]],["not",["has","description"]]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-16f7581c","guard":[["hasAny",["characters from","iqvia","letters from to","slice of the text","steris","substring","wabtec"]],["not",["has","name"]]],"pyramid":["render.str",["transform.substr",["sense.lastWord"],{"lit":1},{"lit":3}]],"mem":null},
{"id":"n-2c5124c3","guard":[["hasAny",["abbreviate","acronym","dashes","huntington","hyphens","kebab case","kebabcase","morgan","principal"]],["words<=",8],["not",["has","me"]],["not",["has","name"]],["not",["has","iso3"]],["not",["has","count"]],["not",["has","description"]]],"pyramid":["render.str",["transform.acronym",["transform.kebab",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-4f415d3a","guard":[["hasAny",["aes","co","dow","item number","nth","reverse order","reversed"]],["words<=",7],["words>=",7],["has","of"],["not",["has","code"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":2}]],"mem":null},
{"id":"n-5bf7f2c9","guard":[["hasAny",["aon","ares","co","divisor count","how many factors","item number","nth","number of divisors","position"]],["has","what"],["has","ticker"],["not",["quoted"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-7091b685","guard":[["hasAny",["aes","co","dow","item number","nth","reverse order","reversed"]],["words<=",7],["words>=",7],["has","of"],["not",["has","code"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-77ceb598","guard":[["hasAny",["aon","ares","co","divisor count","how many factors","item number","nth","number of divisors","position"]],["has","what"],["has","ticker"],["not",["colon"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-a6979e9b","guard":[["hasAny",["abbreviate","acronym","first letters of the name","huntington","initials","morgan","principal"]],["words<=",8],["not",["has","me"]],["not",["has","name"]],["not",["has","iso3"]],["not",["has","count"]],["not",["has","description"]]],"pyramid":["render.str",["transform.acronym",["transform.initials",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-a892d25c","guard":[["hasAny",["abbreviate","acronym","camel case","camelcase","huntington","lower camel case","morgan","principal"]],["words<=",8],["not",["has","me"]],["not",["has","name"]],["not",["has","iso3"]],["not",["has","count"]],["not",["has","description"]]],"pyramid":["render.str",["transform.camel",["transform.acronym",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-a89a0ace","guard":[["hasAny",["aon","ares","co","divisor count","how many factors","item number","nth","number of divisors","position"]],["has","what"],["has","ticker"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-f01ba2d9","guard":[["hasAny",["alphabetize the letters","backwards","item number","letters in order","nth","position","reversed","sort the letters","spell backwards","trade"]],["has","symbol"]],"pyramid":["render.str",["transform.reverse",["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-fd7868c8","guard":[["hasAny",["abbreviate","abbreviation","acronym","alphabetize the letters","element","huntington","item number","letters in order","morgan","nth","position","short form","sort the letters"]],["has","what"],["has","is"]],"pyramid":["render.str",["transform.sortLetters",["transform.acronym",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-05170be2","guard":[["hasAny",["co","dow","how many vowels","item number","nth","number of vowels","position","vowel count"]],["words<=",7],["has","of"],["not",["has","company"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-5d8c3e0f","guard":[["hasAny",["abbreviate","abbreviation","acronym","element","huntington","item number","morgan","normalise","normalize","nth","position","short form","simplify the text"]],["has","what"],["has","is"]],"pyramid":["render.str",["transform.acronym",["transform.norm",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":3}]]],"mem":null},
{"id":"n-6565cbc5","guard":[["hasAny",["caesar cipher","consonant count","how many consonants","item number","nth","number of consonants","position","rotate the letters","shift by","shift each letter","trade"]],["has","symbol"]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.consonants",["sense.text"]]]],"mem":null},
{"id":"n-b0071e39","guard":[["hasAny",["co","dow","how many vowels","item number","nth","number of vowels","position","vowel count"]],["words<=",7],["has","of"],["not",["has","company"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-debd607e","guard":[["hasAny",["characters from","element","item number","kroger","letters from to","nth","position","semiconductor","slice of the text","substring"]],["not",["has","sector"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":1},{"lit":2}]],"mem":null},
{"id":"n-f3df3404","guard":[["hasAny",["co","dow","how many vowels","item number","nth","number of vowels","position","vowel count"]],["words<=",7],["has","of"],["not",["has","company"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-0753573a","guard":[["hasAny",["co","dow","each word","item number","longest","longest one","longest word","nth","position","split into words"]],["words<=",7],["has","of"],["words>=",7]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":"sp500"},{"lit":"ticker"},{"lit":"company"}]]]],"mem":null},
{"id":"n-f88c5810","guard":[["hasAny",["ares","element","fox","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]],["not",["has","industry"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]],"mem":null},
{"id":"n-fb74c57a","guard":[["hasAny",["delete","element","energy","item number","nth","position","remove","strip out","without"]],["not",["has","management"]],["not",["has","name"]],["not",["has","sector"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"sector"}],{"lit":1}]]],"mem":null},
{"id":"n-d7b619a6","guard":[["hasAny",["semiconductor","shortest","shortest one","shortest word","wec"]],["has","trade"]],"pyramid":["render.str",["aggregate.shortest",["sense.words"]]],"mem":null},
{"id":"n-403a2db4","guard":[["hasAny",["item number","nth","semiconductor","wec"]],["has","trade"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-581d2e22","guard":[["hasAny",["class name","pascal case","pascalcase","semiconductor","shortest","shortest one","shortest word","upper camel case","wec"]],["has","trade"]],"pyramid":["render.str",["transform.pascal",["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-5aec9200","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","principal","short form"]],["has","give"]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"symbol"}]]],"mem":null},
{"id":"n-7e5f5758","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","principal","short form"]],["has","give"],["not",["colon"]]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"symbol"}]]],"mem":null},
{"id":"n-7fce4d3f","guard":[["hasAny",["reverse order","reversed","semiconductor","shortest","shortest one","shortest word","wec"]],["has","trade"]],"pyramid":["render.str",["aggregate.shortest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-90fdc943","guard":[["hasAny",["each word","semiconductor","shortest","shortest one","shortest word","split into words","wec"]],["has","trade"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.text"]]]],"mem":null},
{"id":"n-a4a53d6b","guard":[["hasAny",["invert case","semiconductor","shortest","shortest one","shortest word","swap case","toggle case","wec"]],["has","trade"]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-f4cadd74","guard":[["hasAny",["a to z","alphabetical","alphabetize","semiconductor","shortest","shortest one","shortest word","wec"]],["has","trade"]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-f82d0761","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","principal","short form"]],["has","give"],["not",["quoted"]]],"pyramid":["render.str",["transform.acronym",["sense.after",{"lit":"symbol"}]]],"mem":null},
{"id":"n-00345d50","guard":[["hasAny",["each word","energy","semiconductor","shortest","shortest one","shortest word","split into words","words"]],["has","does"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-177928c0","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","lower case","lowercase","principal","short form","small letters"]],["has","give"]],"pyramid":["render.str",["transform.lower",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-4533f7df","guard":[["hasAny",["abbreviate","acronym","morgan","no vowels","principal","remove vowels","without vowels"]],["words<=",8],["not",["has","count"]],["not",["has","description"]],["not",["has","iso3"]],["not",["has","kinder"]]],"pyramid":["render.str",["transform.acronym",["transform.noVowels",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-46e68192","guard":[["hasAny",["first n","semiconductor","shortest","shortest one","shortest word","wec"]],["has","trade"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.words"],{"lit":4}]]],"mem":null},
{"id":"n-5e96dec6","guard":[["hasAny",["first n","semiconductor","shortest","shortest one","shortest word","wec"]],["has","trade"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-6bbb1d7c","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","camel case","camelcase","lower camel case","principal","short form"]],["has","give"]],"pyramid":["render.str",["transform.camel",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-7e110e1b","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","principal","short form"]],["has","give"]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.acronym",["sense.after",{"lit":"symbol"}]]],"mem":null},
{"id":"n-8c32fa06","guard":[["hasAny",["abbreviate","abbreviation","acronym","morris","no vowels","principal","remove vowels","short form","without vowels"]],["not",["quoted"]]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-9158100b","guard":[["hasAny",["abbreviate","abbreviation","acronym","morris","no vowels","principal","remove vowels","short form","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-95ae8451","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","lower case","lowercase","principal","short form","small letters"]],["has","give"],["not",["quoted"]]],"pyramid":["render.str",["transform.lower",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-9b2d0244","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","capitalise","capitalize","capitalize each word","principal","short form","title case"]],["has","give"],["not",["colon"]]],"pyramid":["render.str",["transform.title",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-a11a4255","guard":[["hasAny",["co","dow","each word","longest","longest one","longest word","split into words"]],["words<=",7],["words>=",7],["not",["has","code"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-c4fc40ed","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","dashes","hyphens","kebab case","kebabcase","principal","short form","slug"]],["has","give"]],"pyramid":["render.str",["transform.acronym",["transform.kebab",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-cd40031b","guard":[["hasAny",["abbreviate","abbreviation","acronym","morris","no vowels","principal","remove vowels","short form","without vowels"]],["not",["colon"]]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-d316f7f1","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","lower case","lowercase","principal","short form","small letters"]],["has","give"],["not",["colon"]]],"pyramid":["render.str",["transform.lower",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-d4b7eabd","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","capitalise","capitalize","capitalize each word","principal","short form","title case"]],["has","give"],["not",["quoted"]]],"pyramid":["render.str",["transform.title",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-daf8bf64","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","principal","short form"]],["has","give"],["not",["colon"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.acronym",["sense.after",{"lit":"symbol"}]]],"mem":null},
{"id":"n-e4f815fb","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","principal","short form"]],["has","give"],["not",["quoted"]]],"pyramid":["render.template",{"lit":[{"slot":0}]},["transform.acronym",["sense.after",{"lit":"symbol"}]]],"mem":null},
{"id":"n-f5f36fe0","guard":[["hasAny",["abbreviate","abbreviation","acronym","bancorp","capitalise","capitalize","capitalize each word","principal","short form","title case"]],["has","give"]],"pyramid":["render.str",["transform.title",["transform.acronym",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-4e065949","guard":[["hasAny",["co","item number","no vowels","nth","position","remove vowels","without vowels"]],["words<=",7],["has","of"]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-1088d608","guard":[["hasAny",["class name","co","item number","no vowels","nth","pascal case","pascalcase","position","remove vowels","upper camel case","without vowels"]],["words<=",7],["has","of"]],"pyramid":["render.str",["transform.noVowels",["transform.pascal",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-26a78b09","guard":[["hasAny",["camel case","camelcase","co","item number","lower camel case","no vowels","nth","position","remove vowels","without vowels"]],["words<=",7],["has","of"]],"pyramid":["render.str",["transform.camel",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-59ace4e8","guard":[["hasAny",["abbreviate","abbreviation","acronym","element","item number","nth","position","reverse the words","reverse word order","short form","towers","words backwards"]],["has","which"]],"pyramid":["render.str",["transform.acronym",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-6fde968f","guard":[["hasAny",["abbreviate","abbreviation","acronym","backwards","element","item number","mirror","nth","position","reverse","reversed","short form","spell backwards","towers"]],["has","which"]],"pyramid":["render.str",["transform.reverse",["transform.acronym",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-76f3857e","guard":[["hasAny",["ares","decode","element","item number","nth","position"]],["has","what"]],"pyramid":["render.str",["transform.base64",["transform.unbase64",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-81802af4","guard":[["hasAny",["alphabetize the letters","co","item number","letters in order","no vowels","nth","position","remove vowels","sort the letters","without vowels"]],["words<=",7],["has","of"]],"pyramid":["render.str",["transform.noVowels",["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-b11f45a8","guard":[["hasAny",["class name","co","item number","no vowels","nth","pascal case","pascalcase","position","remove vowels","upper camel case","without vowels"]],["words<=",7],["has","of"]],"pyramid":["render.str",["transform.pascal",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-14bf37e5","guard":[["hasAny",["caesar cipher","element","income","item number","most common letter","most frequent letter","nth","position","rotate the letters","shift by","shift each letter","which letter appears most"]]],"pyramid":["render.str",["aggregate.commonLetter",["transform.caesar",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":10}]]],"mem":null},
{"id":"n-1a298518","guard":[["hasAny",["co","consonant count","how many consonants","item number","nth","number of consonants","position"]],["has","ticker"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-1af174fe","guard":[["hasAny",["character at","element","how many vowels","income","item number","letter at","nth","nth letter","number of vowels","position","vowel count","which letter"]]],"pyramid":["render.str",["transform.charAt",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["aggregate.vowels",["sense.text"]]]],"mem":null},
{"id":"n-21516a72","guard":[["hasAny",["characters from","item number","letters from to","nth","position","semiconductor","slice of the text","substring"]],["has","trade"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":1},{"lit":2}]],"mem":null},
{"id":"n-23dc5cbe","guard":[["hasAny",["aon","caesar cipher","how many vowels","item number","nth","number of vowels","position","rotate the letters","shift by","shift each letter","vowel count"]],["has","what"]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-2cb8e4fa","guard":[["hasAny",["ares","characters from","element","item number","letters from to","nth","position","slice of the text","substring"]],["has","what"]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-324c817a","guard":[["hasAny",["character at","element","income","item number","letter at","next prime","nth","nth letter","position","smallest prime greater than","the prime after","which letter"]]],"pyramid":["render.str",["transform.charAt",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["compute.nextPrime",["sense.wordCount"]]]],"mem":null},
{"id":"n-4ca2bcf2","guard":[["hasAny",["append","combine","concatenate","fox","item number","nth","position","put together","shortest","shortest one","shortest word"]],["has","stock"]],"pyramid":["render.str",["transform.concat",["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-550d25db","guard":[["hasAny",["ares","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","what"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":4},["sense.lastWord"]]],"mem":null},
{"id":"n-8e7e9d41","guard":[["hasAny",["camel case","camelcase","character at","element","income","item number","letter at","lower camel case","nth","nth letter","position","which letter"]]],"pyramid":["render.str",["transform.charAt",["transform.camel",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],{"lit":10}]],"mem":null},
{"id":"n-9077d050","guard":[["hasAny",["caesar cipher","dow","how many letters","item number","letter count","nth","number of letters","position","rotate the letters","shift by","shift each letter"]],["has","stock"]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.letters",["sense.text"]]]],"mem":null},
{"id":"n-9d77f407","guard":[["hasAny",["co","consonant count","how many consonants","item number","nth","number of consonants","position"]],["has","ticker"]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-bcce90fc","guard":[["hasAny",["backwards","character at","element","income","item number","letter at","mirror","nth","nth letter","position","reverse","reversed","spell backwards","which letter"]],["has","ticker"]],"pyramid":["render.str",["transform.charAt",["transform.reverse",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],{"lit":3}]],"mem":null},
{"id":"n-cfd7457c","guard":[["hasAny",["character at","element","income","item number","letter at","nth","nth letter","position","reverse the words","reverse word order","which letter","words backwards"]],["has","ticker"]],"pyramid":["render.str",["transform.charAt",["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]],{"lit":4}]],"mem":null},
{"id":"n-d576a145","guard":[["hasAny",["element","fox","item number","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":4},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]],"mem":null},
{"id":"n-d84535dd","guard":[["hasAny",["co","consonant count","how many consonants","item number","nth","number of consonants","position"]],["has","ticker"]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-e4a660e9","guard":[["hasAny",["ares","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","what"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-9bc17c93","guard":[["hasAny",["element","energy","item number","join","joined with","nth","position","separated by"]],["has","does"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"sp500"},{"lit":"ticker"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"sector"}],{"lit":1}]]],"mem":null},
{"id":"n-0ab6c564","guard":[["hasAny",["element","income","item number","most common letter","most frequent letter","nth","position","which letter appears most"]]],"pyramid":["render.str",["aggregate.commonLetter",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-49290361","guard":[["hasAny",["characters","each letter","element","income","item number","letters","nth","position","spell","spell out"]],["has","ticker"]],"pyramid":["render.and",["transform.letters",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-cab0a5b2","guard":[["hasAny",["camel case","camelcase","element","energy","item number","join","joined with","lower camel case","nth","position","separated by"]],["has","does"]],"pyramid":["render.str",["transform.camel",["transform.join",["know.find",{"lit":"sp500"},{"lit":"ticker"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"sector"}],{"lit":1}]]]],"mem":null},
{"id":"n-ccb459b6","guard":[["hasAny",["characters","each letter","element","income","item number","letters","nth","position","spell","spell out"]],["has","ticker"]],"pyramid":["render.lines",["transform.letters",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-de7a3c72","guard":[["hasAny",["characters","each letter","element","income","item number","letters","nth","position","spell","spell out"]],["has","ticker"]],"pyramid":["render.list",["transform.letters",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-eea9ca23","guard":[["hasAny",["abbreviate","abbreviation","acronym","element","income","item number","nth","position","short form"]],["has","ticker"]],"pyramid":["render.str",["transform.acronym",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]],"mem":null},
{"id":"n-048638dc","guard":[["hasAny",["abbreviate","abbreviation","acronym","element","income","item number","most common letter","most frequent letter","nth","position","short form","which letter appears most"]]],"pyramid":["render.str",["transform.acronym",["aggregate.commonLetter",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-1ac1c39e","guard":[["hasAny",["abbreviate","abbreviation","acronym","camel case","camelcase","element","income","item number","lower camel case","nth","position","short form"]],["has","ticker"]],"pyramid":["render.str",["transform.camel",["transform.acronym",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-1e3e4c46","guard":[["hasAny",["abbreviate","abbreviation","acronym","element","income","item number","most common letter","most frequent letter","nth","position","short form","which letter appears most"]],["has","ticker"]],"pyramid":["render.str",["aggregate.commonLetter",["transform.acronym",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-34ebd9aa","guard":[["hasAny",["delete","element","item number","l3harris","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}],["sense.numeral"]]],"mem":null},
{"id":"n-47037176","guard":[["hasAny",["character at","element","income","item number","letter at","nth","nth letter","position","which letter"]],["has","ticker"]],"pyramid":["render.str",["transform.charAt",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}],{"lit":1}]],"mem":null},
{"id":"n-761f0abb","guard":[["hasAny",["abbreviate","abbreviation","acronym","alphabetize the letters","element","income","item number","letters in order","nth","position","short form","sort the letters"]],["has","ticker"]],"pyramid":["render.str",["transform.acronym",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-86c74b25","guard":[["hasAny",["as a roman numeral","carnival","element","from roman","in arabic numerals","in roman numerals","item number","nth","position","roman numeral","roman numeral value","to roman","what number is"]]],"pyramid":["render.str",["compute.toRoman",["compute.fromRoman",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-df3f0253","guard":[["hasAny",["abbreviate","abbreviation","acronym","backwards","element","income","item number","mirror","nth","position","reverse","reversed","short form","spell backwards"]],["has","ticker"]],"pyramid":["render.str",["transform.acronym",["transform.reverse",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-e9168164","guard":[["hasAny",["camel case","camelcase","element","first letters of the name","income","initials","item number","lower camel case","nth","position"]],["has","ticker"]],"pyramid":["render.str",["transform.camel",["transform.initials",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}]]]],"mem":null},
{"id":"n-1ee2ba8c","guard":[["hasAny",["co","element","how many vowels","item number","nth","number of vowels","position","vowel count"]]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-204e0da5","guard":[["hasAny",["co","element","how many vowels","item number","nth","number of vowels","position","vowel count"]]],"pyramid":["render.lines",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-63c0d9a1","guard":[["hasAny",["element","group","item number","nth","position","separate by","shortest","shortest one","shortest word","split","split by"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"sector"}],{"lit":1}]]]],"mem":null},
{"id":"n-719d2daa","guard":[["hasAny",["ares","item number","leading zeros","nth","pad with","padded to","position","zero pad"]],["has","what"]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-c8ce2f8f","guard":[["hasAny",["caesar cipher","co","how many vowels","item number","nth","number of vowels","position","rotate the letters","shift by","shift each letter","vowel count"]],["words<=",7],["has","of"]],"pyramid":["render.str",["transform.caesar",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]]],"mem":null},
{"id":"n-e357c61e","guard":[["hasAny",["co","element","how many vowels","item number","nth","number of vowels","position","vowel count"]]],"pyramid":["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}],["aggregate.vowels",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}]]]],"mem":null},
{"id":"n-15456191","guard":[["hasAny",["alphabet","element","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-7b506d91","guard":[["hasAny",["alphabet","element","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-bc2f5b81","guard":[["hasAny",["alphabet","element","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-e79369fa","guard":[["hasAny",["alphabet","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"company"}],{"lit":1}],{"lit":"sp500"},{"lit":"company"},{"lit":"ticker"}],["transform.nthStr",["know.find",{"lit":"sp500"},{"lit":"ticker"}],{"lit":1}]]],"mem":null},
{"id":"n-00a55e4c","guard":[["has","dow"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Dow Inc.":"DOW"}}},
{"id":"n-026e35ce","guard":[["hasAny",["income","realty","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Realty Income":"O"}}},
{"id":"n-02a688f5","guard":[["hasAny",["bancorp","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of U.S. Bancorp":"USB"}}},
{"id":"n-036553e8","guard":[["hasAny",["corning","inc","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corning Inc.":"GLW"}}},
{"id":"n-051cabec","guard":[["hasAny",["blackrock","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does BlackRock trade under":"BLK"}}},
{"id":"n-0554e7b4","guard":[["hasAny",["lockheed","martin","symbol","trade","under"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lockheed Martin trade under":"LMT"}}},
{"id":"n-07f04c57","guard":[["hasAny",["symbol","teradyne","trade","under"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Teradyne trade under":"TER"}}},
{"id":"n-0a8872ec","guard":[["hasAny",["motorola","solutions","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Motorola Solutions trade under":"MSI"}}},
{"id":"n-0ab42648","guard":[["hasAny",["lyondellbasell","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of LyondellBasell":"LYB"}}},
{"id":"n-0ab47666","guard":[["hasAny",["international","morris","philip","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Philip Morris International":"PM"}}},
{"id":"n-0b1195e7","guard":[["hasAny",["lowes","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lowe's trade under":"LOW"}}},
{"id":"n-0c571671","guard":[["hasAny",["corpay","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corpay":"CPAY"}}},
{"id":"n-0e670f52","guard":[["hasAny",["stock","symbol","wabtec"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Wabtec":"WAB"}}},
{"id":"n-0e83c81a","guard":[["hasAny",["energy","group","symbol","trade","under","wec"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does WEC Energy Group trade under":"WEC"}}},
{"id":"n-10c27b6f","guard":[["has","lockheed"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lockheed Martin trade under":"LMT"}}},
{"id":"n-10d89381","guard":[["hasAny",["lowes","symbol","trade","under"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lowe's trade under":"LOW"}}},
{"id":"n-11a81b55","guard":[["hasAny",["lockheed","martin","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lockheed Martin trade under":"LMT"}}},
{"id":"n-12ca6b4a","guard":[["hasAny",["bancorp","stock","symbol"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of U.S. Bancorp":"USB"}}},
{"id":"n-1548bd6c","guard":[["hasAny",["symbol","teradyne","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Teradyne trade under":"TER"}}},
{"id":"n-17501068","guard":[["hasAny",["financial","stock","symbol","synchrony"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Synchrony Financial":"SYF"}}},
{"id":"n-187379ed","guard":[["hasAny",["global","sp","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of S&P Global":"SPGI"}}},
{"id":"n-1906605f","guard":[["hasAny",["medtronic","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Medtronic":"MDT"}}},
{"id":"n-19714b05","guard":[["hasAny",["corpay","stock","symbol"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corpay":"CPAY"}}},
{"id":"n-1ae81808","guard":[["hasAny",["stock","symbol","technologies","tyler"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyler Technologies":"TYL"}}},
{"id":"n-1c3ef775","guard":[["hasAny",["financial","stock","symbol","synchrony"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Synchrony Financial":"SYF"}}},
{"id":"n-1e252b9b","guard":[["hasAny",["fargo","ticker","wells"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Wells Fargo":"WFC"}}},
{"id":"n-1edfc4aa","guard":[["hasAny",["centers","regency","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Regency Centers trade under":"REG"}}},
{"id":"n-231b961b","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Teradyne trade under":"TER"}}},
{"id":"n-23a2df84","guard":[["hasAny",["co","kkr","ticker"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of KKR & Co.":"KKR"}}},
{"id":"n-23effa57","guard":[["hasAny",["dominion","old","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Old Dominion":"ODFL"}}},
{"id":"n-257be561","guard":[["hasAny",["edwards","lifesciences","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Edwards Lifesciences trade under":"EW"}}},
{"id":"n-268210c4","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Realty Income":"O"}}},
{"id":"n-28154e03","guard":[["hasAny",["motorola","solutions","symbol","trade","under"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Motorola Solutions trade under":"MSI"}}},
{"id":"n-285c03e2","guard":[["hasAny",["co","kkr","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of KKR & Co.":"KKR"}}},
{"id":"n-29214830","guard":[["hasAny",["symbol","teradyne","trade","under"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Teradyne trade under":"TER"}}},
{"id":"n-2b40fdce","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does WEC Energy Group trade under":"WEC"}}},
{"id":"n-2dcda945","guard":[["hasAny",["global","sp","stock","symbol"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of S&P Global":"SPGI"}}},
{"id":"n-2f400c14","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of LyondellBasell":"LYB"}}},
{"id":"n-31a0d170","guard":[["hasAny",["apple","inc","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Apple Inc. trade under":"AAPL"}}},
{"id":"n-327f2e47","guard":[["hasAny",["monolithic","power","symbol","systems","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Monolithic Power Systems trade under":"MPWR"}}},
{"id":"n-356267c1","guard":[["hasAny",["centers","regency","symbol","trade","under"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Regency Centers trade under":"REG"}}},
{"id":"n-37348a45","guard":[["hasAny",["income","realty","ticker"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Realty Income":"O"}}},
{"id":"n-37f7f3b8","guard":[["hasAny",["revvity","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Revvity":"RVTY"}}},
{"id":"n-38de344a","guard":[["hasAny",["bny","mellon","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of BNY Mellon":"BNY"}}},
{"id":"n-39e9a38a","guard":[["hasAny",["energy","group","symbol","trade","under","wec"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does WEC Energy Group trade under":"WEC"}}},
{"id":"n-3b7cc0cd","guard":[["has","dominion"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Old Dominion":"ODFL"}}},
{"id":"n-3cb104a3","guard":[["hasAny",["blackstone","inc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Blackstone Inc.":"BX"}}},
{"id":"n-3e33b036","guard":[["hasAny",["carnival","corporation","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Carnival Corporation trade under":"CCL"}}},
{"id":"n-3f4b12be","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Motorola Solutions trade under":"MSI"}}},
{"id":"n-3f67f1ee","guard":[["hasAny",["roper","technologies","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Roper Technologies":"ROP"}}},
{"id":"n-3fe63323","guard":[["has","centers"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Regency Centers trade under":"REG"}}},
{"id":"n-401cd85d","guard":[["hasAny",["medtronic","stock","symbol"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Medtronic":"MDT"}}},
{"id":"n-40ee0bae","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lowe's trade under":"LOW"}}},
{"id":"n-42bca894","guard":[["hasAny",["homes","invitation","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Invitation Homes":"INVH"}}},
{"id":"n-4463689f","guard":[["hasAny",["dow","inc","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Dow Inc.":"DOW"}}},
{"id":"n-44d286af","guard":[["hasAny",["steris","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Steris":"STE"}}},
{"id":"n-46705f4a","guard":[["hasAny",["aes","corporation","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of AES Corporation":"AES"}}},
{"id":"n-47a819fd","guard":[["hasAny",["iqvia","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of IQVIA":"IQV"}}},
{"id":"n-47fb966b","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Synchrony Financial":"SYF"}}},
{"id":"n-4c3d9b19","guard":[["has","fargo"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Wells Fargo":"WFC"}}},
{"id":"n-4ce770f4","guard":[["hasAny",["seagate","technology","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Seagate Technology":"STX"}}},
{"id":"n-4e48e57a","guard":[["hasAny",["companies","estée","lauder","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Estée Lauder Companies (The)":"EL"}}},
{"id":"n-4fe27f3e","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corning Inc.":"GLW"}}},
{"id":"n-4ff112eb","guard":[["hasAny",["group","ticker","unitedhealth"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of UnitedHealth Group":"UNH"}}},
{"id":"n-54d18bf0","guard":[["hasAny",["blackrock","symbol","trade","under"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does BlackRock trade under":"BLK"}}},
{"id":"n-55a5bf67","guard":[["hasAny",["akamai","technologies","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Akamai Technologies":"AKAM"}}},
{"id":"n-56bc653a","guard":[["hasAny",["corporation","target","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Target Corporation":"TGT"}}},
{"id":"n-5b6df562","guard":[["hasAny",["corporation","state","street","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does State Street Corporation trade under":"STT"}}},
{"id":"n-5cab6e3e","guard":[["has","bancorp"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of U.S. Bancorp":"USB"}}},
{"id":"n-5e6292c0","guard":[["hasAny",["l3harris","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of L3Harris":"LHX"}}},
{"id":"n-611e4219","guard":[["hasAny",["aon","plc","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Aon plc":"AON"}}},
{"id":"n-6389701f","guard":[["hasAny",["american","symbol","tower","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does American Tower trade under":"AMT"}}},
{"id":"n-63e7628f","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Old Dominion":"ODFL"}}},
{"id":"n-6750bfd1","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does BlackRock trade under":"BLK"}}},
{"id":"n-6751f19f","guard":[["hasAny",["symbol","towers","trade","under","watson","willis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Willis Towers Watson trade under":"WTW"}}},
{"id":"n-689e1bf5","guard":[["hasAny",["essex","property","stock","symbol","trust"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Essex Property Trust":"ESS"}}},
{"id":"n-68bc705c","guard":[["hasAny",["international","morris","philip","stock","symbol"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Philip Morris International":"PM"}}},
{"id":"n-695b494a","guard":[["hasAny",["corporation","progressive","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Progressive Corporation":"PGR"}}},
{"id":"n-6a20b388","guard":[["has","global"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of S&P Global":"SPGI"}}},
{"id":"n-6b4d2149","guard":[["hasAny",["stock","symbol","wabtec"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Wabtec":"WAB"}}},
{"id":"n-6bbacb7d","guard":[["hasAny",["newmont","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Newmont":"NEM"}}},
{"id":"n-6c1dc18f","guard":[["hasAny",["inc","rollins","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Rollins, Inc.":"ROL"}}},
{"id":"n-6cf6ca42","guard":[["hasAny",["berkshire","hathaway","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Berkshire Hathaway":"BRK.B"}}},
{"id":"n-6f0ac3fe","guard":[["hasAny",["corning","inc","stock","symbol"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corning Inc.":"GLW"}}},
{"id":"n-6f80b993","guard":[["hasAny",["enterprises","ferguson","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-6ff5ad42","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyler Technologies":"TYL"}}},
{"id":"n-71efb12e","guard":[["has","stock"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyler Technologies":"TYL"}}},
{"id":"n-76edd35a","guard":[["hasAny",["hilton","ticker","worldwide"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Hilton Worldwide":"HLT"}}},
{"id":"n-7b1413aa","guard":[["has","co"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of KKR & Co.":"KKR"}}},
{"id":"n-7c7c7a76","guard":[["hasAny",["baxter","international","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Baxter International":"BAX"}}},
{"id":"n-8074234e","guard":[["hasAny",["corporation","dover","ticker"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Dover Corporation":"DOV"}}},
{"id":"n-81074c93","guard":[["hasAny",["fiserv","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Fiserv":"FISV"}}},
{"id":"n-8123f9fd","guard":[["hasAny",["lyondellbasell","stock","symbol"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of LyondellBasell":"LYB"}}},
{"id":"n-8449b848","guard":[["hasAny",["nvidia","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Nvidia trade under":"NVDA"}}},
{"id":"n-85ffaf4e","guard":[["hasAny",["corporation","financial","regions","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Regions Financial Corporation":"RF"}}},
{"id":"n-877d1352","guard":[["hasAny",["caribbean","group","royal","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Royal Caribbean Group trade under":"RCL"}}},
{"id":"n-897ac1c4","guard":[["hasAny",["america","corporation","packaging","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Packaging Corporation of America trade under":"PKG"}}},
{"id":"n-8a1f2741","guard":[["hasAny",["income","realty","ticker"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Realty Income":"O"}}},
{"id":"n-8b25404a","guard":[["hasAny",["johnson","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Johnson & Johnson trade under":"JNJ"}}},
{"id":"n-8c27e7d7","guard":[["has","blackrock"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does BlackRock trade under":"BLK"}}},
{"id":"n-8fb87b99","guard":[["hasAny",["motorola","solutions","symbol","trade","under"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Motorola Solutions trade under":"MSI"}}},
{"id":"n-91d57833","guard":[["hasAny",["corpay","stock","symbol"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corpay":"CPAY"}}},
{"id":"n-9242a6b6","guard":[["hasAny",["caseys","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Casey's trade under":"CASY"}}},
{"id":"n-942101ad","guard":[["hasAny",["dominion","old","ticker"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Old Dominion":"ODFL"}}},
{"id":"n-967add36","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of KKR & Co.":"KKR"}}},
{"id":"n-969e25ce","guard":[["has","energy"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does WEC Energy Group trade under":"WEC"}}},
{"id":"n-96a69c3f","guard":[["has","lowes"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lowe's trade under":"LOW"}}},
{"id":"n-97a58483","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lockheed Martin trade under":"LMT"}}},
{"id":"n-998521d2","guard":[["hasAny",["semiconductor","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does ON Semiconductor trade under":"ON"}}},
{"id":"n-9a72ac1c","guard":[["hasAny",["stock","symbol","weyerhaeuser"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Weyerhaeuser":"WY"}}},
{"id":"n-9d097f5f","guard":[["hasAny",["lockheed","martin","symbol","trade","under"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lockheed Martin trade under":"LMT"}}},
{"id":"n-9d3f38e6","guard":[["hasAny",["energy","group","symbol","trade","under","wec"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does WEC Energy Group trade under":"WEC"}}},
{"id":"n-a05f22f8","guard":[["hasAny",["ameren","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Ameren":"AEE"}}},
{"id":"n-a0de8f41","guard":[["hasAny",["financial","group","principal","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Principal Financial Group":"PFG"}}},
{"id":"n-a1dd04dd","guard":[["hasAny",["international","morris","philip","stock","symbol"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Philip Morris International":"PM"}}},
{"id":"n-a2c7e365","guard":[["has","income"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Realty Income":"O"}}},
{"id":"n-a2ddd04d","guard":[["has","motorola"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Motorola Solutions trade under":"MSI"}}},
{"id":"n-a4dccbcf","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of U.S. Bancorp":"USB"}}},
{"id":"n-a5138336","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Regency Centers trade under":"REG"}}},
{"id":"n-a5536ef7","guard":[["hasAny",["foods","stock","symbol","tyson"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyson Foods":"TSN"}}},
{"id":"n-a8cd209d","guard":[["has","symbol"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Teradyne trade under":"TER"}}},
{"id":"n-a8cf09fa","guard":[["hasAny",["ecolab","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Ecolab":"ECL"}}},
{"id":"n-aa76e711","guard":[["hasAny",["cardinal","health","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cardinal Health":"CAH"}}},
{"id":"n-aae6e0e5","guard":[["hasAny",["huntington","industries","ingalls","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Huntington Ingalls Industries":"HII"}}},
{"id":"n-ab176f11","guard":[["hasAny",["lowes","symbol","trade","under"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Lowe's trade under":"LOW"}}},
{"id":"n-ad774a05","guard":[["hasAny",["inc","stock","symbol","tesla"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tesla, Inc.":"TSLA"}}},
{"id":"n-ad9f9cac","guard":[["hasAny",["moderna","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Moderna":"MRNA"}}},
{"id":"n-af0e9e0c","guard":[["hasAny",["alphabet","class","inc","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Alphabet Inc. (Class A)":"GOOGL"}}},
{"id":"n-b091c1c2","guard":[["hasAny",["corning","inc","stock","symbol"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corning Inc.":"GLW"}}},
{"id":"n-b0c4871e","guard":[["hasAny",["corporation","idex","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of IDEX Corporation":"IEX"}}},
{"id":"n-b341a7ba","guard":[["hasAny",["advanced","devices","micro","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Advanced Micro Devices trade under":"AMD"}}},
{"id":"n-b666723f","guard":[["has","class"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Fox Corporation (Class A)":"FOXA"}}},
{"id":"n-b6f86a62","guard":[["has","financial"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Synchrony Financial":"SYF"}}},
{"id":"n-b9492211","guard":[["hasAny",["kroger","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Kroger":"KR"}}},
{"id":"n-ba68ec6b","guard":[["hasAny",["bancorp","stock","symbol"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of U.S. Bancorp":"USB"}}},
{"id":"n-bb6758b8","guard":[["hasAny",["becton","dickinson","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Becton Dickinson":"BDX"}}},
{"id":"n-bc700633","guard":[["hasAny",["financial","stock","symbol","synchrony"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Synchrony Financial":"SYF"}}},
{"id":"n-bca56b9f","guard":[["hasAny",["chevron","corporation","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Chevron Corporation trade under":"CVX"}}},
{"id":"n-bd548083","guard":[["hasAny",["centers","regency","symbol","trade","under"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Regency Centers trade under":"REG"}}},
{"id":"n-bebb2f4f","guard":[["has","semiconductor"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does ON Semiconductor trade under":"ON"}}},
{"id":"n-c1bb8fe2","guard":[["hasAny",["ares","management","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Ares Management":"ARES"}}},
{"id":"n-c1ffbb56","guard":[["hasAny",["companies","symbol","trade","under","williams"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Williams Companies trade under":"WMB"}}},
{"id":"n-c53a9485","guard":[["hasAny",["centerpoint","energy","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of CenterPoint Energy":"CNP"}}},
{"id":"n-c5fce159","guard":[["hasAny",["global","sp","stock","symbol"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of S&P Global":"SPGI"}}},
{"id":"n-c617ef9d","guard":[["has","sandisk"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Sandisk":"SNDK"}}},
{"id":"n-c7261126","guard":[["hasAny",["corporation","lauren","ralph","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL"}}},
{"id":"n-c7dad206","guard":[["hasAny",["edwards","lifesciences","symbol","trade","under"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Edwards Lifesciences trade under":"EW"}}},
{"id":"n-c7e725e8","guard":[["hasAny",["o","smith","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of A. O. Smith":"AOS"}}},
{"id":"n-c890528e","guard":[["hasAny",["fargo","ticker","wells"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Wells Fargo":"WFC"}}},
{"id":"n-c94f0de2","guard":[["hasAny",["stock","symbol","technologies","tyler"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyler Technologies":"TYL"}}},
{"id":"n-cb336e02","guard":[["hasAny",["boston","scientific","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Boston Scientific":"BSX"}}},
{"id":"n-cbe2c794","guard":[["hasAny",["sandisk","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Sandisk":"SNDK"}}},
{"id":"n-cdb2154b","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Wells Fargo":"WFC"}}},
{"id":"n-cdd1e001","guard":[["has","companies"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Williams Companies trade under":"WMB"}}},
{"id":"n-d2f45efe","guard":[["hasAny",["lyondellbasell","stock","symbol"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of LyondellBasell":"LYB"}}},
{"id":"n-d59afab8","guard":[["has","medtronic"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Medtronic":"MDT"}}},
{"id":"n-d606b68a","guard":[["hasAny",["morgan","stanley","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Morgan Stanley":"MS"}}},
{"id":"n-d79c5930","guard":[["hasAny",["prologis","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Prologis trade under":"PLD"}}},
{"id":"n-da1edfb2","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corpay":"CPAY"}}},
{"id":"n-dc1721c4","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of S&P Global":"SPGI"}}},
{"id":"n-ddcd4551","guard":[["hasAny",["stock","symbol","wabtec"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Wabtec":"WAB"}}},
{"id":"n-ddea70d2","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Edwards Lifesciences trade under":"EW"}}},
{"id":"n-df01a6ac","guard":[["hasAny",["class","corporation","fox","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Fox Corporation (Class A)":"FOXA"}}},
{"id":"n-e04814db","guard":[["hasAny",["franklin","resources","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Franklin Resources":"BEN"}}},
{"id":"n-e6fd23f7","guard":[["hasAny",["corporation","land","pacific","symbol","texas","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Texas Pacific Land Corporation trade under":"TPL"}}},
{"id":"n-e79a7f2a","guard":[["has","edwards"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Edwards Lifesciences trade under":"EW"}}},
{"id":"n-e86c50b4","guard":[["has","stock"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Wabtec":"WAB"}}},
{"id":"n-e892873e","guard":[["hasAny",["las","sands","symbol","trade","under","vegas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Las Vegas Sands trade under":"LVS"}}},
{"id":"n-e8fe4a5b","guard":[["has","lyondellbasell"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of LyondellBasell":"LYB"}}},
{"id":"n-ea13ce4b","guard":[["hasAny",["stock","symbol","technologies","tyler"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyler Technologies":"TYL"}}},
{"id":"n-eb2e0bd4","guard":[["hasAny",["fargo","ticker","wells"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Wells Fargo":"WFC"}}},
{"id":"n-ebe8e9d6","guard":[["has","corning"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corning Inc.":"GLW"}}},
{"id":"n-ec7d7be7","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Medtronic":"MDT"}}},
{"id":"n-ee4043eb","guard":[["hasAny",["marvell","technology","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Marvell Technology":"MRVL"}}},
{"id":"n-ef61c0e7","guard":[["hasAny",["avery","dennison","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Avery Dennison":"AVY"}}},
{"id":"n-f098f2ab","guard":[["has","roper"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Roper Technologies":"ROP"}}},
{"id":"n-f146f591","guard":[["has","corpay"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corpay":"CPAY"}}},
{"id":"n-f1724506","guard":[["hasAny",["amcor","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Amcor":"AMCR"}}},
{"id":"n-f1c51b3c","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Philip Morris International":"PM"}}},
{"id":"n-f3806710","guard":[["has","international"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Philip Morris International":"PM"}}},
{"id":"n-f3a88592","guard":[["hasAny",["fair","isaac","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Fair Isaac trade under":"FICO"}}},
{"id":"n-f420136a","guard":[],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Wabtec":"WAB"}}},
{"id":"n-f44a084d","guard":[["hasAny",["edison","international","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Edison International trade under":"EIX"}}},
{"id":"n-f469119e","guard":[["hasAny",["cisco","stock","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cisco":"CSCO"}}},
{"id":"n-f54f195f","guard":[["hasAny",["pepsico","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does PepsiCo trade under":"PEP"}}},
{"id":"n-f5537b4f","guard":[["hasAny",["dominion","old","ticker"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Old Dominion":"ODFL"}}},
{"id":"n-f5de35d8","guard":[["hasAny",["co","kkr","ticker"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of KKR & Co.":"KKR"}}},
{"id":"n-f6e29020","guard":[["has","enterprises"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-f7dc0714","guard":[["hasAny",["host","hotels","resorts","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Host Hotels & Resorts trade under":"HST"}}},
{"id":"n-f84ba44f","guard":[["hasAny",["medtronic","stock","symbol"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the stock symbol of Medtronic":"MDT"}}},
{"id":"n-f9bad5fd","guard":[["hasAny",["airlines","southwest","symbol","trade","under"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Southwest Airlines trade under":"LUV"}}},
{"id":"n-fa268187","guard":[["hasAny",["edwards","lifesciences","symbol","trade","under"]],["not",["quoted"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does Edwards Lifesciences trade under":"EW"}}},
{"id":"n-fa73f898","guard":[["hasAny",["american","express","ticker"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of American Express":"AXP"}}},
{"id":"n-fc3c4442","guard":[["hasAny",["blackrock","symbol","trade","under"]],["not",["colon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which symbol does BlackRock trade under":"BLK"}}},
{"id":"n-fe26dc28","guard":[["hasAny",["ticker","ventas"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the ticker of Ventas":"VTR"}}},
{"id":"n-a7302973","guard":[["hasAny",["co","item number","nth"]],["words<=",8],["words>=",7],["not",["has","domain"]],["not",["has","cheese"]],["not",["has","code"]],["nums==",0]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-dba85607","guard":[["hasAny",["character at","income","letter at","nth letter","which letter"]],["has","ticker"]],"pyramid":["render.str",["transform.charAt",["sense.lastWord"],{"lit":4}]],"mem":null},
{"id":"n-04c9af58","guard":[["hasAny",["host","item number","no vowels","nth","position","remove vowels","without vowels"]],["words>=",7],["not",["has","city"]],["words<=",8],["not",["has","acerra"]],["not",["has","andenne"]],["not",["has","babylon"]]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-0bc0c003","guard":[["hasAny",["camel case","camelcase","first letters of the name","initials","lower camel case","principal"]],["words<=",8],["not",["has","count"]],["words>=",7],["not",["has","character"]],["not",["has","description"]]],"pyramid":["render.str",["transform.camel",["transform.initials",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-141d5e26","guard":[["hasAny",["energy","halve","item number","nth"]],["has","trade"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["transform.half",["sense.wordCount"]]]],"mem":null},
{"id":"n-1932fa01","guard":[["hasAny",["co","first n","shortest","shortest one","shortest word"]],["words<=",8],["words>=",7],["not",["has","domain"]],["not",["has","cheese"]],["not",["has","code"]],["nums==",0]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-2e083604","guard":[["hasAny",["dow","each word","longest","longest one","longest word","split into words","words"]],["has","give"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"symbol"}]]]],"mem":null},
{"id":"n-3a8d6e12","guard":[["hasAny",["character at","income","letter at","most common letter","most frequent letter","nth letter","which letter","which letter appears most"]],["has","ticker"]],"pyramid":["render.str",["aggregate.commonLetter",["transform.charAt",["sense.lastWord"],{"lit":4}]]],"mem":null},
{"id":"n-3b8c1287","guard":[["hasAny",["backwards","item number","nth","position","reverse order","reversed","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":5}]],"mem":null},
{"id":"n-3dd11cea","guard":[["hasAny",["append","combine","concatenate","fox","put together","shortest","shortest one","shortest word"]],["has","stock"]],"pyramid":["render.str",["transform.concat",["aggregate.shortest",["sense.content"]],["sense.lastWord"]]],"mem":null},
{"id":"n-3e8be1a2","guard":[["hasAny",["as a roman numeral","carnival","growth rate","in roman numerals","percent change","percent decrease","percent increase","roman numeral","to roman"]],["has","which"]],"pyramid":["render.str",["compute.toRoman",["compute.percentChange",{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-52401935","guard":[["hasAny",["how many vowels","item number","nth","number of vowels","position","vowel count","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-60359bac","guard":[["hasAny",["abbreviate","acronym","character at","income","letter at","nth letter","which letter"]],["has","ticker"]],"pyramid":["render.str",["transform.acronym",["transform.charAt",["sense.lastWord"],{"lit":4}]]],"mem":null},
{"id":"n-694f03fc","guard":[["hasAny",["divisor count","how many factors","item number","nth","number of divisors","position","wec"]],["has","symbol"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-7dbc33b8","guard":[["hasAny",["abbreviate","acronym","income","item number","nth"]],["has","ticker"]],"pyramid":["render.str",["transform.acronym",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-838413bd","guard":[["hasAny",["characters from","kroger","letters from to","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["sense.lastWord"],{"lit":1},{"lit":2}]],"mem":null},
{"id":"n-901e94d9","guard":[["hasAny",["alphabetize the letters","co","item number","letters in order","nth","position","sort the letters"]],["has","kkr"]],"pyramid":["render.str",["transform.sortLetters",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-9324ae5a","guard":[["hasAny",["a to z","alphabetical","alphabetize","co","item number","nth"]],["has","kkr"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-a4440178","guard":[["hasAny",["character at","income","invert case","letter at","nth letter","swap case","toggle case","which letter"]],["has","ticker"]],"pyramid":["render.str",["transform.charAt",["transform.swapCase",["sense.lastWord"]],{"lit":4}]],"mem":null},
{"id":"n-a4dd6d82","guard":[["hasAny",["character at","income","letter at","nth letter","reverse the words","reverse word order","which letter","words backwards"]],["has","ticker"]],"pyramid":["render.str",["transform.charAt",["transform.reverseWords",["sense.text"]],{"lit":4}]],"mem":null},
{"id":"n-b7a4af47","guard":[["hasAny",["character at","dashes","hyphens","income","kebab case","kebabcase","letter at","nth letter","which letter"]],["has","ticker"]],"pyramid":["render.str",["transform.charAt",["transform.kebab",["sense.lastWord"]],{"lit":4}]],"mem":null},
{"id":"n-d7cfc411","guard":[["hasAny",["character at","income","letter at","nth letter","reversed","spell backwards","which letter"]],["has","ticker"]],"pyramid":["render.str",["transform.charAt",["transform.reverse",["sense.lastWord"]],{"lit":3}]],"mem":null},
{"id":"n-de567c37","guard":[["hasAny",["character at","income","letter at","nth letter","reversed","spell backwards","which letter"]],["has","ticker"]],"pyramid":["render.str",["transform.charAt",["transform.reverse",["sense.text"]],{"lit":3}]],"mem":null},
{"id":"n-df937081","guard":[["hasAny",["a to z","alphabetical","alphabetize","co","item number","nth","position"]],["has","kkr"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-e60edd82","guard":[["hasAny",["character at","income","letter at","nth letter","which letter"]],["has","ticker"]],"pyramid":["render.str",["transform.charAt",["sense.after",{"lit":"is"}],{"lit":12}]],"mem":null},
{"id":"n-e89ec54b","guard":[["hasAny",["a to z","alphabetical","alphabetize","co","item number","nth","position"]],["has","kkr"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-95349b4d","guard":[["hasAny",["ameren","avery","bancorp","bny","boston","cardinal","cisco","companies","corpay","corporation","essex","financial","foods","global","international","iqvia","lyondellbasell","medtronic","newmont","revvity","sandisk","technologies","trade","wabtec","weyerhaeuser"]],["not",["has","me"]],["not",["has","name"]],["not",["has","blackline"]],["not",["has","boost"]],["not",["has","cryoport"]],["not",["has","entegris"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL","give the stock symbol of Alphabet Inc. (Class A)":"GOOGL","which symbol does WEC Energy Group trade under":"WEC","which symbol does Host Hotels & Resorts trade under":"HST","give the stock symbol of Progressive Corporation":"PGR","give the stock symbol of Newmont":"NEM","give the stock symbol of Cardinal Health":"CAH","what is the ticker of Roper Technologies":"ROP","what is the ticker of Wells Fargo":"WFC","what is the ticker of Aon plc":"AON","what is the ticker of American Express":"AXP","which symbol does Packaging Corporation of America trade under":"PKG","give the stock symbol of Cisco":"CSCO","give the stock symbol of BNY Mellon":"BNY","give the stock symbol of Synchrony Financial":"SYF","what is the ticker of Kroger":"KR","what is the ticker of Huntington Ingalls Industries":"HII","give the stock symbol of Avery Dennison":"AVY","give the stock symbol of LyondellBasell":"LYB","give the stock symbol of Tyler Technologies":"TYL","give the stock symbol of Corpay":"CPAY","what is the ticker of Becton Dickinson":"BDX","which symbol does PepsiCo trade under":"PEP","which symbol does Prologis trade under":"PLD","give the stock symbol of Ameren":"AEE","which symbol does Edison International trade under":"EIX","give the stock symbol of S&P Global":"SPGI","give the stock symbol of AES Corporation":"AES","what is the ticker of Steris":"STE","what is the ticker of Seagate Technology":"STX","what is the ticker of Moderna":"MRNA","give the stock symbol of Medtronic":"MDT","give the stock symbol of Weyerhaeuser":"WY","what is the ticker of Blackstone Inc.":"BX","give the stock symbol of Wabtec":"WAB","which symbol does Teradyne trade under":"TER","what is the ticker of Dover Corporation":"DOV","what is the ticker of Rollins, Inc.":"ROL","give the stock symbol of Baxter International":"BAX","what is the ticker of Fiserv":"FISV","what is the ticker of UnitedHealth Group":"UNH","what is the ticker of Akamai Technologies":"AKAM","give the stock symbol of Fox Corporation (Class A)":"FOXA","which symbol does Texas Pacific Land Corporation trade under":"TPL","which symbol does Willis Towers Watson trade under":"WTW","which symbol does Casey's trade under":"CASY","what is the ticker of Berkshire Hathaway":"BRK.B","which symbol does Johnson & Johnson trade under":"JNJ","what is the ticker of Amcor":"AMCR","what is the ticker of IDEX Corporation":"IEX","what is the ticker of Morgan Stanley":"MS","give the stock symbol of Corning Inc.":"GLW","which symbol does Fair Isaac trade under":"FICO","what is the ticker of Ecolab":"ECL","what is the ticker of Realty Income":"O","what is the ticker of A. O. Smith":"AOS","which symbol does Apple Inc. trade under":"AAPL","what is the ticker of Old Dominion":"ODFL","what is the ticker of Ares Management":"ARES","what is the ticker of Target Corporation":"TGT","give the stock symbol of U.S. Bancorp":"USB","what is the ticker of Franklin Resources":"BEN","give the stock symbol of Principal Financial Group":"PFG","give the stock symbol of Philip Morris International":"PM","give the stock symbol of Dow Inc.":"DOW","which symbol does Las Vegas Sands trade under":"LVS","what is the ticker of Invitation Homes":"INVH","give the stock symbol of Essex Property Trust":"ESS","give the stock symbol of Tyson Foods":"TSN","give the stock symbol of Tesla, Inc.":"TSLA","give the stock symbol of IQVIA":"IQV","which symbol does Royal Caribbean Group trade under":"RCL","what is the ticker of Ventas":"VTR","give the stock symbol of Revvity":"RVTY","which symbol does Motorola Solutions trade under":"MSI","which symbol does Williams Companies trade under":"WMB","which symbol does Lowe's trade under":"LOW","which symbol does Edwards Lifesciences trade under":"EW","what is the ticker of Regions Financial Corporation":"RF","which symbol does Lockheed Martin trade under":"LMT","what is the ticker of CenterPoint Energy":"CNP","what is the ticker of Hilton Worldwide":"HLT","which symbol does American Tower trade under":"AMT","give the stock symbol of Estée Lauder Companies (The)":"EL","give the stock symbol of Boston Scientific":"BSX","which symbol does Nvidia trade under":"NVDA","what is the ticker of Marvell Technology":"MRVL","which symbol does Advanced Micro Devices trade under":"AMD","which symbol does Southwest Airlines trade under":"LUV","what is the ticker of KKR & Co.":"KKR","which symbol does Chevron Corporation trade under":"CVX","which symbol does BlackRock trade under":"BLK","which symbol does ON Semiconductor trade under":"ON","give the stock symbol of Sandisk":"SNDK","which symbol does State Street Corporation trade under":"STT","which symbol does Carnival Corporation trade under":"CCL","which symbol does Monolithic Power Systems trade under":"MPWR","which symbol does Regency Centers trade under":"REG","which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-d680003c","guard":[["hasAny",["corporation","stock"]],["not",["has","act"]]],"pyramid":["render.str",["memory.nearest",["sense.after",{"lit":"symbol"}]]],"mem":{"table":{"Alphabet Inc. (Class A)":"GOOGL","Progressive Corporation":"PGR","Newmont":"NEM","Cardinal Health":"CAH","Roper Technologies":"ROP","Wells Fargo":"WFC","Aon plc":"AON","American Express":"AXP","America trade under":"PKG","Cisco":"CSCO","BNY Mellon":"BNY","Synchrony Financial":"SYF","Kroger":"KR","Huntington Ingalls Industries":"HII","Avery Dennison":"AVY","LyondellBasell":"LYB","Tyler Technologies":"TYL","Corpay":"CPAY","Becton Dickinson":"BDX","Ameren":"AEE","S&P Global":"SPGI","AES Corporation":"AES","Steris":"STE","Seagate Technology":"STX","Moderna":"MRNA","Medtronic":"MDT","Weyerhaeuser":"WY","Blackstone Inc":"BX","Wabtec":"WAB","Dover Corporation":"DOV","Rollins, Inc":"ROL","Baxter International":"BAX","Fiserv":"FISV","UnitedHealth Group":"UNH","Akamai Technologies":"AKAM","Fox Corporation (Class A)":"FOXA","Berkshire Hathaway":"BRK.B","Amcor":"AMCR","IDEX Corporation":"IEX","Morgan Stanley":"MS","Corning Inc":"GLW","Ecolab":"ECL","Realty Income":"O","A. O. Smith":"AOS","Old Dominion":"ODFL","Ares Management":"ARES","L3Harris":"LHX","Target Corporation":"TGT","U.S. Bancorp":"USB","Franklin Resources":"BEN","Principal Financial Group":"PFG","Philip Morris International":"PM","Dow Inc":"DOW","Invitation Homes":"INVH","Essex Property Trust":"ESS","Tyson Foods":"TSN","Tesla, Inc":"TSLA","IQVIA":"IQV","Ventas":"VTR","Revvity":"RVTY","Regions Financial Corporation":"RF","CenterPoint Energy":"CNP","Hilton Worldwide":"HLT","Estée Lauder Companies (The)":"EL","Boston Scientific":"BSX","Marvell Technology":"MRVL","KKR & Co":"KKR","Sandisk":"SNDK"}}},
{"id":"n-0d43144e","guard":[["has","ticker"],["not",["quoted"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.lastWord"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL","give the stock symbol of Alphabet Inc. (Class A)":"GOOGL","which symbol does WEC Energy Group trade under":"WEC","which symbol does Host Hotels & Resorts trade under":"HST","give the stock symbol of Progressive Corporation":"PGR","give the stock symbol of Newmont":"NEM","give the stock symbol of Cardinal Health":"CAH","what is the ticker of Roper Technologies":"ROP","what is the ticker of Wells Fargo":"WFC","what is the ticker of Aon plc":"AON","what is the ticker of American Express":"AXP","which symbol does Packaging Corporation of America trade under":"PKG","give the stock symbol of Cisco":"CSCO","give the stock symbol of BNY Mellon":"BNY","give the stock symbol of Synchrony Financial":"SYF","what is the ticker of Kroger":"KR","what is the ticker of Huntington Ingalls Industries":"HII","give the stock symbol of Avery Dennison":"AVY","give the stock symbol of LyondellBasell":"LYB","give the stock symbol of Tyler Technologies":"TYL","give the stock symbol of Corpay":"CPAY","what is the ticker of Becton Dickinson":"BDX","which symbol does PepsiCo trade under":"PEP","which symbol does Prologis trade under":"PLD","give the stock symbol of Ameren":"AEE","which symbol does Edison International trade under":"EIX","give the stock symbol of S&P Global":"SPGI","give the stock symbol of AES Corporation":"AES","what is the ticker of Steris":"STE","what is the ticker of Seagate Technology":"STX","what is the ticker of Moderna":"MRNA","give the stock symbol of Medtronic":"MDT","give the stock symbol of Weyerhaeuser":"WY","what is the ticker of Blackstone Inc.":"BX","give the stock symbol of Wabtec":"WAB","which symbol does Teradyne trade under":"TER","what is the ticker of Dover Corporation":"DOV","what is the ticker of Rollins, Inc.":"ROL","give the stock symbol of Baxter International":"BAX","what is the ticker of Fiserv":"FISV","what is the ticker of UnitedHealth Group":"UNH","what is the ticker of Akamai Technologies":"AKAM","give the stock symbol of Fox Corporation (Class A)":"FOXA","which symbol does Texas Pacific Land Corporation trade under":"TPL","which symbol does Willis Towers Watson trade under":"WTW","which symbol does Casey's trade under":"CASY","what is the ticker of Berkshire Hathaway":"BRK.B","which symbol does Johnson & Johnson trade under":"JNJ","what is the ticker of Amcor":"AMCR","what is the ticker of IDEX Corporation":"IEX","what is the ticker of Morgan Stanley":"MS","give the stock symbol of Corning Inc.":"GLW","which symbol does Fair Isaac trade under":"FICO","what is the ticker of Ecolab":"ECL","what is the ticker of Realty Income":"O","what is the ticker of A. O. Smith":"AOS","which symbol does Apple Inc. trade under":"AAPL","what is the ticker of Old Dominion":"ODFL","what is the ticker of Ares Management":"ARES","what is the ticker of Target Corporation":"TGT","give the stock symbol of U.S. Bancorp":"USB","what is the ticker of Franklin Resources":"BEN","give the stock symbol of Principal Financial Group":"PFG","give the stock symbol of Philip Morris International":"PM","give the stock symbol of Dow Inc.":"DOW","which symbol does Las Vegas Sands trade under":"LVS","what is the ticker of Invitation Homes":"INVH","give the stock symbol of Essex Property Trust":"ESS","give the stock symbol of Tyson Foods":"TSN","give the stock symbol of Tesla, Inc.":"TSLA","give the stock symbol of IQVIA":"IQV","which symbol does Royal Caribbean Group trade under":"RCL","what is the ticker of Ventas":"VTR","give the stock symbol of Revvity":"RVTY","which symbol does Motorola Solutions trade under":"MSI","which symbol does Williams Companies trade under":"WMB","which symbol does Lowe's trade under":"LOW","which symbol does Edwards Lifesciences trade under":"EW","what is the ticker of Regions Financial Corporation":"RF","which symbol does Lockheed Martin trade under":"LMT","what is the ticker of CenterPoint Energy":"CNP","what is the ticker of Hilton Worldwide":"HLT","which symbol does American Tower trade under":"AMT","give the stock symbol of Estée Lauder Companies (The)":"EL","give the stock symbol of Boston Scientific":"BSX","which symbol does Nvidia trade under":"NVDA","what is the ticker of Marvell Technology":"MRVL","which symbol does Advanced Micro Devices trade under":"AMD","which symbol does Southwest Airlines trade under":"LUV","what is the ticker of KKR & Co.":"KKR","which symbol does Chevron Corporation trade under":"CVX","which symbol does BlackRock trade under":"BLK","which symbol does ON Semiconductor trade under":"ON","give the stock symbol of Sandisk":"SNDK","which symbol does State Street Corporation trade under":"STT","which symbol does Carnival Corporation trade under":"CCL","which symbol does Monolithic Power Systems trade under":"MPWR","which symbol does Regency Centers trade under":"REG","which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-5b6e195e","guard":[["has","ticker"]],"pyramid":["render.str",["memory.nearest",["sense.lastWord"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL","give the stock symbol of Alphabet Inc. (Class A)":"GOOGL","which symbol does WEC Energy Group trade under":"WEC","which symbol does Host Hotels & Resorts trade under":"HST","give the stock symbol of Progressive Corporation":"PGR","give the stock symbol of Newmont":"NEM","give the stock symbol of Cardinal Health":"CAH","what is the ticker of Roper Technologies":"ROP","what is the ticker of Wells Fargo":"WFC","what is the ticker of Aon plc":"AON","what is the ticker of American Express":"AXP","which symbol does Packaging Corporation of America trade under":"PKG","give the stock symbol of Cisco":"CSCO","give the stock symbol of BNY Mellon":"BNY","give the stock symbol of Synchrony Financial":"SYF","what is the ticker of Kroger":"KR","what is the ticker of Huntington Ingalls Industries":"HII","give the stock symbol of Avery Dennison":"AVY","give the stock symbol of LyondellBasell":"LYB","give the stock symbol of Tyler Technologies":"TYL","give the stock symbol of Corpay":"CPAY","what is the ticker of Becton Dickinson":"BDX","which symbol does PepsiCo trade under":"PEP","which symbol does Prologis trade under":"PLD","give the stock symbol of Ameren":"AEE","which symbol does Edison International trade under":"EIX","give the stock symbol of S&P Global":"SPGI","give the stock symbol of AES Corporation":"AES","what is the ticker of Steris":"STE","what is the ticker of Seagate Technology":"STX","what is the ticker of Moderna":"MRNA","give the stock symbol of Medtronic":"MDT","give the stock symbol of Weyerhaeuser":"WY","what is the ticker of Blackstone Inc.":"BX","give the stock symbol of Wabtec":"WAB","which symbol does Teradyne trade under":"TER","what is the ticker of Dover Corporation":"DOV","what is the ticker of Rollins, Inc.":"ROL","give the stock symbol of Baxter International":"BAX","what is the ticker of Fiserv":"FISV","what is the ticker of UnitedHealth Group":"UNH","what is the ticker of Akamai Technologies":"AKAM","give the stock symbol of Fox Corporation (Class A)":"FOXA","which symbol does Texas Pacific Land Corporation trade under":"TPL","which symbol does Willis Towers Watson trade under":"WTW","which symbol does Casey's trade under":"CASY","what is the ticker of Berkshire Hathaway":"BRK.B","which symbol does Johnson & Johnson trade under":"JNJ","what is the ticker of Amcor":"AMCR","what is the ticker of IDEX Corporation":"IEX","what is the ticker of Morgan Stanley":"MS","give the stock symbol of Corning Inc.":"GLW","which symbol does Fair Isaac trade under":"FICO","what is the ticker of Ecolab":"ECL","what is the ticker of Realty Income":"O","what is the ticker of A. O. Smith":"AOS","which symbol does Apple Inc. trade under":"AAPL","what is the ticker of Old Dominion":"ODFL","what is the ticker of Ares Management":"ARES","what is the ticker of Target Corporation":"TGT","give the stock symbol of U.S. Bancorp":"USB","what is the ticker of Franklin Resources":"BEN","give the stock symbol of Principal Financial Group":"PFG","give the stock symbol of Philip Morris International":"PM","give the stock symbol of Dow Inc.":"DOW","which symbol does Las Vegas Sands trade under":"LVS","what is the ticker of Invitation Homes":"INVH","give the stock symbol of Essex Property Trust":"ESS","give the stock symbol of Tyson Foods":"TSN","give the stock symbol of Tesla, Inc.":"TSLA","give the stock symbol of IQVIA":"IQV","which symbol does Royal Caribbean Group trade under":"RCL","what is the ticker of Ventas":"VTR","give the stock symbol of Revvity":"RVTY","which symbol does Motorola Solutions trade under":"MSI","which symbol does Williams Companies trade under":"WMB","which symbol does Lowe's trade under":"LOW","which symbol does Edwards Lifesciences trade under":"EW","what is the ticker of Regions Financial Corporation":"RF","which symbol does Lockheed Martin trade under":"LMT","what is the ticker of CenterPoint Energy":"CNP","what is the ticker of Hilton Worldwide":"HLT","which symbol does American Tower trade under":"AMT","give the stock symbol of Estée Lauder Companies (The)":"EL","give the stock symbol of Boston Scientific":"BSX","which symbol does Nvidia trade under":"NVDA","what is the ticker of Marvell Technology":"MRVL","which symbol does Advanced Micro Devices trade under":"AMD","which symbol does Southwest Airlines trade under":"LUV","what is the ticker of KKR & Co.":"KKR","which symbol does Chevron Corporation trade under":"CVX","which symbol does BlackRock trade under":"BLK","which symbol does ON Semiconductor trade under":"ON","give the stock symbol of Sandisk":"SNDK","which symbol does State Street Corporation trade under":"STT","which symbol does Carnival Corporation trade under":"CCL","which symbol does Monolithic Power Systems trade under":"MPWR","which symbol does Regency Centers trade under":"REG","which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-5ed19b41","guard":[["has","ticker"],["not",["colon"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.lastWord"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL","give the stock symbol of Alphabet Inc. (Class A)":"GOOGL","which symbol does WEC Energy Group trade under":"WEC","which symbol does Host Hotels & Resorts trade under":"HST","give the stock symbol of Progressive Corporation":"PGR","give the stock symbol of Newmont":"NEM","give the stock symbol of Cardinal Health":"CAH","what is the ticker of Roper Technologies":"ROP","what is the ticker of Wells Fargo":"WFC","what is the ticker of Aon plc":"AON","what is the ticker of American Express":"AXP","which symbol does Packaging Corporation of America trade under":"PKG","give the stock symbol of Cisco":"CSCO","give the stock symbol of BNY Mellon":"BNY","give the stock symbol of Synchrony Financial":"SYF","what is the ticker of Kroger":"KR","what is the ticker of Huntington Ingalls Industries":"HII","give the stock symbol of Avery Dennison":"AVY","give the stock symbol of LyondellBasell":"LYB","give the stock symbol of Tyler Technologies":"TYL","give the stock symbol of Corpay":"CPAY","what is the ticker of Becton Dickinson":"BDX","which symbol does PepsiCo trade under":"PEP","which symbol does Prologis trade under":"PLD","give the stock symbol of Ameren":"AEE","which symbol does Edison International trade under":"EIX","give the stock symbol of S&P Global":"SPGI","give the stock symbol of AES Corporation":"AES","what is the ticker of Steris":"STE","what is the ticker of Seagate Technology":"STX","what is the ticker of Moderna":"MRNA","give the stock symbol of Medtronic":"MDT","give the stock symbol of Weyerhaeuser":"WY","what is the ticker of Blackstone Inc.":"BX","give the stock symbol of Wabtec":"WAB","which symbol does Teradyne trade under":"TER","what is the ticker of Dover Corporation":"DOV","what is the ticker of Rollins, Inc.":"ROL","give the stock symbol of Baxter International":"BAX","what is the ticker of Fiserv":"FISV","what is the ticker of UnitedHealth Group":"UNH","what is the ticker of Akamai Technologies":"AKAM","give the stock symbol of Fox Corporation (Class A)":"FOXA","which symbol does Texas Pacific Land Corporation trade under":"TPL","which symbol does Willis Towers Watson trade under":"WTW","which symbol does Casey's trade under":"CASY","what is the ticker of Berkshire Hathaway":"BRK.B","which symbol does Johnson & Johnson trade under":"JNJ","what is the ticker of Amcor":"AMCR","what is the ticker of IDEX Corporation":"IEX","what is the ticker of Morgan Stanley":"MS","give the stock symbol of Corning Inc.":"GLW","which symbol does Fair Isaac trade under":"FICO","what is the ticker of Ecolab":"ECL","what is the ticker of Realty Income":"O","what is the ticker of A. O. Smith":"AOS","which symbol does Apple Inc. trade under":"AAPL","what is the ticker of Old Dominion":"ODFL","what is the ticker of Ares Management":"ARES","what is the ticker of Target Corporation":"TGT","give the stock symbol of U.S. Bancorp":"USB","what is the ticker of Franklin Resources":"BEN","give the stock symbol of Principal Financial Group":"PFG","give the stock symbol of Philip Morris International":"PM","give the stock symbol of Dow Inc.":"DOW","which symbol does Las Vegas Sands trade under":"LVS","what is the ticker of Invitation Homes":"INVH","give the stock symbol of Essex Property Trust":"ESS","give the stock symbol of Tyson Foods":"TSN","give the stock symbol of Tesla, Inc.":"TSLA","give the stock symbol of IQVIA":"IQV","which symbol does Royal Caribbean Group trade under":"RCL","what is the ticker of Ventas":"VTR","give the stock symbol of Revvity":"RVTY","which symbol does Motorola Solutions trade under":"MSI","which symbol does Williams Companies trade under":"WMB","which symbol does Lowe's trade under":"LOW","which symbol does Edwards Lifesciences trade under":"EW","what is the ticker of Regions Financial Corporation":"RF","which symbol does Lockheed Martin trade under":"LMT","what is the ticker of CenterPoint Energy":"CNP","what is the ticker of Hilton Worldwide":"HLT","which symbol does American Tower trade under":"AMT","give the stock symbol of Estée Lauder Companies (The)":"EL","give the stock symbol of Boston Scientific":"BSX","which symbol does Nvidia trade under":"NVDA","what is the ticker of Marvell Technology":"MRVL","which symbol does Advanced Micro Devices trade under":"AMD","which symbol does Southwest Airlines trade under":"LUV","what is the ticker of KKR & Co.":"KKR","which symbol does Chevron Corporation trade under":"CVX","which symbol does BlackRock trade under":"BLK","which symbol does ON Semiconductor trade under":"ON","give the stock symbol of Sandisk":"SNDK","which symbol does State Street Corporation trade under":"STT","which symbol does Carnival Corporation trade under":"CCL","which symbol does Monolithic Power Systems trade under":"MPWR","which symbol does Regency Centers trade under":"REG","which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-88d3b53e","guard":[["has","ticker"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.lastWord"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL","give the stock symbol of Alphabet Inc. (Class A)":"GOOGL","which symbol does WEC Energy Group trade under":"WEC","which symbol does Host Hotels & Resorts trade under":"HST","give the stock symbol of Progressive Corporation":"PGR","give the stock symbol of Newmont":"NEM","give the stock symbol of Cardinal Health":"CAH","what is the ticker of Roper Technologies":"ROP","what is the ticker of Wells Fargo":"WFC","what is the ticker of Aon plc":"AON","what is the ticker of American Express":"AXP","which symbol does Packaging Corporation of America trade under":"PKG","give the stock symbol of Cisco":"CSCO","give the stock symbol of BNY Mellon":"BNY","give the stock symbol of Synchrony Financial":"SYF","what is the ticker of Kroger":"KR","what is the ticker of Huntington Ingalls Industries":"HII","give the stock symbol of Avery Dennison":"AVY","give the stock symbol of LyondellBasell":"LYB","give the stock symbol of Tyler Technologies":"TYL","give the stock symbol of Corpay":"CPAY","what is the ticker of Becton Dickinson":"BDX","which symbol does PepsiCo trade under":"PEP","which symbol does Prologis trade under":"PLD","give the stock symbol of Ameren":"AEE","which symbol does Edison International trade under":"EIX","give the stock symbol of S&P Global":"SPGI","give the stock symbol of AES Corporation":"AES","what is the ticker of Steris":"STE","what is the ticker of Seagate Technology":"STX","what is the ticker of Moderna":"MRNA","give the stock symbol of Medtronic":"MDT","give the stock symbol of Weyerhaeuser":"WY","what is the ticker of Blackstone Inc.":"BX","give the stock symbol of Wabtec":"WAB","which symbol does Teradyne trade under":"TER","what is the ticker of Dover Corporation":"DOV","what is the ticker of Rollins, Inc.":"ROL","give the stock symbol of Baxter International":"BAX","what is the ticker of Fiserv":"FISV","what is the ticker of UnitedHealth Group":"UNH","what is the ticker of Akamai Technologies":"AKAM","give the stock symbol of Fox Corporation (Class A)":"FOXA","which symbol does Texas Pacific Land Corporation trade under":"TPL","which symbol does Willis Towers Watson trade under":"WTW","which symbol does Casey's trade under":"CASY","what is the ticker of Berkshire Hathaway":"BRK.B","which symbol does Johnson & Johnson trade under":"JNJ","what is the ticker of Amcor":"AMCR","what is the ticker of IDEX Corporation":"IEX","what is the ticker of Morgan Stanley":"MS","give the stock symbol of Corning Inc.":"GLW","which symbol does Fair Isaac trade under":"FICO","what is the ticker of Ecolab":"ECL","what is the ticker of Realty Income":"O","what is the ticker of A. O. Smith":"AOS","which symbol does Apple Inc. trade under":"AAPL","what is the ticker of Old Dominion":"ODFL","what is the ticker of Ares Management":"ARES","what is the ticker of Target Corporation":"TGT","give the stock symbol of U.S. Bancorp":"USB","what is the ticker of Franklin Resources":"BEN","give the stock symbol of Principal Financial Group":"PFG","give the stock symbol of Philip Morris International":"PM","give the stock symbol of Dow Inc.":"DOW","which symbol does Las Vegas Sands trade under":"LVS","what is the ticker of Invitation Homes":"INVH","give the stock symbol of Essex Property Trust":"ESS","give the stock symbol of Tyson Foods":"TSN","give the stock symbol of Tesla, Inc.":"TSLA","give the stock symbol of IQVIA":"IQV","which symbol does Royal Caribbean Group trade under":"RCL","what is the ticker of Ventas":"VTR","give the stock symbol of Revvity":"RVTY","which symbol does Motorola Solutions trade under":"MSI","which symbol does Williams Companies trade under":"WMB","which symbol does Lowe's trade under":"LOW","which symbol does Edwards Lifesciences trade under":"EW","what is the ticker of Regions Financial Corporation":"RF","which symbol does Lockheed Martin trade under":"LMT","what is the ticker of CenterPoint Energy":"CNP","what is the ticker of Hilton Worldwide":"HLT","which symbol does American Tower trade under":"AMT","give the stock symbol of Estée Lauder Companies (The)":"EL","give the stock symbol of Boston Scientific":"BSX","which symbol does Nvidia trade under":"NVDA","what is the ticker of Marvell Technology":"MRVL","which symbol does Advanced Micro Devices trade under":"AMD","which symbol does Southwest Airlines trade under":"LUV","what is the ticker of KKR & Co.":"KKR","which symbol does Chevron Corporation trade under":"CVX","which symbol does BlackRock trade under":"BLK","which symbol does ON Semiconductor trade under":"ON","give the stock symbol of Sandisk":"SNDK","which symbol does State Street Corporation trade under":"STT","which symbol does Carnival Corporation trade under":"CCL","which symbol does Monolithic Power Systems trade under":"MPWR","which symbol does Regency Centers trade under":"REG","which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-a3b5d8ff","guard":[["has","ticker"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.lastWord"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL","give the stock symbol of Alphabet Inc. (Class A)":"GOOGL","which symbol does WEC Energy Group trade under":"WEC","which symbol does Host Hotels & Resorts trade under":"HST","give the stock symbol of Progressive Corporation":"PGR","give the stock symbol of Newmont":"NEM","give the stock symbol of Cardinal Health":"CAH","what is the ticker of Roper Technologies":"ROP","what is the ticker of Wells Fargo":"WFC","what is the ticker of Aon plc":"AON","what is the ticker of American Express":"AXP","which symbol does Packaging Corporation of America trade under":"PKG","give the stock symbol of Cisco":"CSCO","give the stock symbol of BNY Mellon":"BNY","give the stock symbol of Synchrony Financial":"SYF","what is the ticker of Kroger":"KR","what is the ticker of Huntington Ingalls Industries":"HII","give the stock symbol of Avery Dennison":"AVY","give the stock symbol of LyondellBasell":"LYB","give the stock symbol of Tyler Technologies":"TYL","give the stock symbol of Corpay":"CPAY","what is the ticker of Becton Dickinson":"BDX","which symbol does PepsiCo trade under":"PEP","which symbol does Prologis trade under":"PLD","give the stock symbol of Ameren":"AEE","which symbol does Edison International trade under":"EIX","give the stock symbol of S&P Global":"SPGI","give the stock symbol of AES Corporation":"AES","what is the ticker of Steris":"STE","what is the ticker of Seagate Technology":"STX","what is the ticker of Moderna":"MRNA","give the stock symbol of Medtronic":"MDT","give the stock symbol of Weyerhaeuser":"WY","what is the ticker of Blackstone Inc.":"BX","give the stock symbol of Wabtec":"WAB","which symbol does Teradyne trade under":"TER","what is the ticker of Dover Corporation":"DOV","what is the ticker of Rollins, Inc.":"ROL","give the stock symbol of Baxter International":"BAX","what is the ticker of Fiserv":"FISV","what is the ticker of UnitedHealth Group":"UNH","what is the ticker of Akamai Technologies":"AKAM","give the stock symbol of Fox Corporation (Class A)":"FOXA","which symbol does Texas Pacific Land Corporation trade under":"TPL","which symbol does Willis Towers Watson trade under":"WTW","which symbol does Casey's trade under":"CASY","what is the ticker of Berkshire Hathaway":"BRK.B","which symbol does Johnson & Johnson trade under":"JNJ","what is the ticker of Amcor":"AMCR","what is the ticker of IDEX Corporation":"IEX","what is the ticker of Morgan Stanley":"MS","give the stock symbol of Corning Inc.":"GLW","which symbol does Fair Isaac trade under":"FICO","what is the ticker of Ecolab":"ECL","what is the ticker of Realty Income":"O","what is the ticker of A. O. Smith":"AOS","which symbol does Apple Inc. trade under":"AAPL","what is the ticker of Old Dominion":"ODFL","what is the ticker of Ares Management":"ARES","what is the ticker of Target Corporation":"TGT","give the stock symbol of U.S. Bancorp":"USB","what is the ticker of Franklin Resources":"BEN","give the stock symbol of Principal Financial Group":"PFG","give the stock symbol of Philip Morris International":"PM","give the stock symbol of Dow Inc.":"DOW","which symbol does Las Vegas Sands trade under":"LVS","what is the ticker of Invitation Homes":"INVH","give the stock symbol of Essex Property Trust":"ESS","give the stock symbol of Tyson Foods":"TSN","give the stock symbol of Tesla, Inc.":"TSLA","give the stock symbol of IQVIA":"IQV","which symbol does Royal Caribbean Group trade under":"RCL","what is the ticker of Ventas":"VTR","give the stock symbol of Revvity":"RVTY","which symbol does Motorola Solutions trade under":"MSI","which symbol does Williams Companies trade under":"WMB","which symbol does Lowe's trade under":"LOW","which symbol does Edwards Lifesciences trade under":"EW","what is the ticker of Regions Financial Corporation":"RF","which symbol does Lockheed Martin trade under":"LMT","what is the ticker of CenterPoint Energy":"CNP","what is the ticker of Hilton Worldwide":"HLT","which symbol does American Tower trade under":"AMT","give the stock symbol of Estée Lauder Companies (The)":"EL","give the stock symbol of Boston Scientific":"BSX","which symbol does Nvidia trade under":"NVDA","what is the ticker of Marvell Technology":"MRVL","which symbol does Advanced Micro Devices trade under":"AMD","which symbol does Southwest Airlines trade under":"LUV","what is the ticker of KKR & Co.":"KKR","which symbol does Chevron Corporation trade under":"CVX","which symbol does BlackRock trade under":"BLK","which symbol does ON Semiconductor trade under":"ON","give the stock symbol of Sandisk":"SNDK","which symbol does State Street Corporation trade under":"STT","which symbol does Carnival Corporation trade under":"CCL","which symbol does Monolithic Power Systems trade under":"MPWR","which symbol does Regency Centers trade under":"REG","which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-03d847c9","guard":[["hasAny",["hilton","ticker","worldwide"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Hilton Worldwide":"HLT"}}},
{"id":"n-0675c744","guard":[["has","dow"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Dow Inc.":"DOW"}}},
{"id":"n-131b7806","guard":[["hasAny",["enterprises","ferguson"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-143c56d5","guard":[["hasAny",["morgan","stanley","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Morgan Stanley":"MS"}}},
{"id":"n-1886517c","guard":[["has","sandisk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Sandisk":"SNDK"}}},
{"id":"n-18a5f84e","guard":[["hasAny",["companies","williams"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Williams Companies trade under":"WMB"}}},
{"id":"n-1bab2563","guard":[["hasAny",["o","smith","ticker"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of A. O. Smith":"AOS"}}},
{"id":"n-1dbcc910","guard":[["has","semiconductor"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does ON Semiconductor trade under":"ON"}}},
{"id":"n-237eb61c","guard":[["hasAny",["enterprises","ferguson"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-24037289","guard":[["has","roper"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Roper Technologies":"ROP"}}},
{"id":"n-25094e19","guard":[["hasAny",["cardinal","health","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cardinal Health":"CAH"}}},
{"id":"n-259be243","guard":[["has","enterprises"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-26e107c9","guard":[["hasAny",["alphabet","class"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Alphabet Inc. (Class A)":"GOOGL"}}},
{"id":"n-27b0bb1b","guard":[["hasAny",["o","smith","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of A. O. Smith":"AOS"}}},
{"id":"n-28a43797","guard":[["hasAny",["companies","williams"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Williams Companies trade under":"WMB"}}},
{"id":"n-295baa13","guard":[["hasAny",["class","fox"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Fox Corporation (Class A)":"FOXA"}}},
{"id":"n-2976b8a5","guard":[["hasAny",["becton","dickinson","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Becton Dickinson":"BDX"}}},
{"id":"n-298ac258","guard":[["has","synchrony"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Synchrony Financial":"SYF"}}},
{"id":"n-2ac3187a","guard":[["has","wabtec"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Wabtec":"WAB"}}},
{"id":"n-2da346ad","guard":[["has","motorola"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Motorola Solutions trade under":"MSI"}}},
{"id":"n-2e4e0fa2","guard":[["has","idex"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of IDEX Corporation":"IEX"}}},
{"id":"n-329e9e5a","guard":[["has","roper"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Roper Technologies":"ROP"}}},
{"id":"n-354e3aac","guard":[["has","bancorp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of U.S. Bancorp":"USB"}}},
{"id":"n-36b39672","guard":[["hasAny",["foods","stock","symbol","tyson"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyson Foods":"TSN"}}},
{"id":"n-3950a8db","guard":[["hasAny",["fiserv","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Fiserv":"FISV"}}},
{"id":"n-3b479128","guard":[["hasAny",["advanced","devices","micro","symbol","trade","under"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Advanced Micro Devices trade under":"AMD"}}},
{"id":"n-3b6f8b4d","guard":[["has","semiconductor"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does ON Semiconductor trade under":"ON"}}},
{"id":"n-3c12dcfe","guard":[["has","dow"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Dow Inc.":"DOW"}}},
{"id":"n-454ee671","guard":[["has","dow"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Dow Inc.":"DOW"}}},
{"id":"n-46c4ee49","guard":[["hasAny",["homes","invitation","ticker"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Invitation Homes":"INVH"}}},
{"id":"n-46d3c14f","guard":[["hasAny",["land","pacific","texas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Texas Pacific Land Corporation trade under":"TPL"}}},
{"id":"n-46f9435e","guard":[["hasAny",["morgan","stanley","ticker"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Morgan Stanley":"MS"}}},
{"id":"n-47c2fc8a","guard":[["hasAny",["stock","symbol","technologies","tyler"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tyler Technologies":"TYL"}}},
{"id":"n-487ba1af","guard":[["hasAny",["enterprises","ferguson"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Ferguson Enterprises trade under":"FERG"}}},
{"id":"n-48cc1e7b","guard":[["has","lockheed"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Lockheed Martin trade under":"LMT"}}},
{"id":"n-499e7d9d","guard":[["has","weyerhaeuser"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Weyerhaeuser":"WY"}}},
{"id":"n-4ae08bcc","guard":[["has","energy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does WEC Energy Group trade under":"WEC"}}},
{"id":"n-4b6a18ae","guard":[["hasAny",["class","fox"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Fox Corporation (Class A)":"FOXA"}}},
{"id":"n-4e55d4f5","guard":[["has","dover"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Dover Corporation":"DOV"}}},
{"id":"n-4e5e29ae","guard":[["hasAny",["lockheed","martin"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Lockheed Martin trade under":"LMT"}}},
{"id":"n-502e573d","guard":[["has","baxter"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Baxter International":"BAX"}}},
{"id":"n-50ef14dd","guard":[["hasAny",["caribbean","royal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Royal Caribbean Group trade under":"RCL"}}},
{"id":"n-512e7aeb","guard":[["hasAny",["franklin","resources","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Franklin Resources":"BEN"}}},
{"id":"n-51c30596","guard":[["has","carnival"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Carnival Corporation trade under":"CCL"}}},
{"id":"n-52dbf736","guard":[["hasAny",["essex","property","stock","symbol","trust"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Essex Property Trust":"ESS"}}},
{"id":"n-52f5f792","guard":[["has","progressive"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Progressive Corporation":"PGR"}}},
{"id":"n-537fc101","guard":[["has","morris"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Philip Morris International":"PM"}}},
{"id":"n-584f3d29","guard":[["hasAny",["cardinal","health","stock","symbol"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cardinal Health":"CAH"}}},
{"id":"n-640350b9","guard":[["hasAny",["energy","wec"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does WEC Energy Group trade under":"WEC"}}},
{"id":"n-64fb82de","guard":[["hasAny",["host","hotels","resorts","symbol","trade","under"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Host Hotels & Resorts trade under":"HST"}}},
{"id":"n-6632fc78","guard":[["hasAny",["american","express","ticker"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of American Express":"AXP"}}},
{"id":"n-69d2ec88","guard":[["has","target"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Target Corporation":"TGT"}}},
{"id":"n-6ac85351","guard":[["has","lowes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Lowe's trade under":"LOW"}}},
{"id":"n-6b946e32","guard":[["hasAny",["boston","scientific","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Boston Scientific":"BSX"}}},
{"id":"n-6ca7ba41","guard":[["has","o"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of A. O. Smith":"AOS"}}},
{"id":"n-6f197ccf","guard":[["has","caseys"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Casey's trade under":"CASY"}}},
{"id":"n-6f9814a4","guard":[["has","sandisk"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Sandisk":"SNDK"}}},
{"id":"n-71ac0131","guard":[["hasAny",["las","sands","symbol","trade","under","vegas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Las Vegas Sands trade under":"LVS"}}},
{"id":"n-75963481","guard":[["hasAny",["apple","inc"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Apple Inc. trade under":"AAPL"}}},
{"id":"n-7f037176","guard":[["has","johnson"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Johnson & Johnson trade under":"JNJ"}}},
{"id":"n-81d3af68","guard":[["has","seagate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Seagate Technology":"STX"}}},
{"id":"n-8dc1b9dd","guard":[["has","medtronic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Medtronic":"MDT"}}},
{"id":"n-8e8a7db0","guard":[["hasAny",["amcor","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Amcor":"AMCR"}}},
{"id":"n-8ea3a8f2","guard":[["hasAny",["centerpoint","energy","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of CenterPoint Energy":"CNP"}}},
{"id":"n-8ed0ce26","guard":[["has","revvity"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Revvity":"RVTY"}}},
{"id":"n-940402bc","guard":[["has","sandisk"],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Sandisk":"SNDK"}}},
{"id":"n-947ae57c","guard":[["has","marvell"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Marvell Technology":"MRVL"}}},
{"id":"n-98b0af46","guard":[["has","edwards"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Edwards Lifesciences trade under":"EW"}}},
{"id":"n-99c490c1","guard":[["hasAny",["lauren","ralph"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Ralph Lauren Corporation trade under":"RL"}}},
{"id":"n-9d54ed53","guard":[["has","tesla"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Tesla, Inc.":"TSLA"}}},
{"id":"n-a03b86f6","guard":[["has","rollins"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Rollins, Inc.":"ROL"}}},
{"id":"n-a0c998b5","guard":[["has","newmont"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Newmont":"NEM"}}},
{"id":"n-a1bae1a2","guard":[["hasAny",["american","tower"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does American Tower trade under":"AMT"}}},
{"id":"n-a20544c4","guard":[["has","blackrock"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does BlackRock trade under":"BLK"}}},
{"id":"n-a2509518","guard":[["hasAny",["fargo","ticker","wells"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Wells Fargo":"WFC"}}},
{"id":"n-a6acaf4f","guard":[["hasAny",["corporation","financial","regions","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Regions Financial Corporation":"RF"}}},
{"id":"n-a8c4202c","guard":[["hasAny",["kroger","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Kroger":"KR"}}},
{"id":"n-ab830ef7","guard":[["hasAny",["moderna","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Moderna":"MRNA"}}},
{"id":"n-ab99d14e","guard":[["hasAny",["ticker","ventas"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Ventas":"VTR"}}},
{"id":"n-aba039df","guard":[["hasAny",["avery","dennison","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Avery Dennison":"AVY"}}},
{"id":"n-abc096e5","guard":[],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of A. O. Smith":"AOS"}}},
{"id":"n-ae638cce","guard":[["hasAny",["state","street"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does State Street Corporation trade under":"STT"}}},
{"id":"n-aec96909","guard":[["hasAny",["group","principal"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Principal Financial Group":"PFG"}}},
{"id":"n-b0333715","guard":[["hasAny",["berkshire","hathaway","ticker"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Berkshire Hathaway":"BRK.B"}}},
{"id":"n-b3d76a09","guard":[["has","akamai"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Akamai Technologies":"AKAM"}}},
{"id":"n-b48b2f75","guard":[["hasAny",["edwards","lifesciences"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Edwards Lifesciences trade under":"EW"}}},
{"id":"n-b5564bff","guard":[["hasAny",["centers","regency"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Regency Centers trade under":"REG"}}},
{"id":"n-b5cd26ad","guard":[["hasAny",["airlines","southwest"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Southwest Airlines trade under":"LUV"}}},
{"id":"n-b71ec683","guard":[["hasAny",["companies","estée","lauder","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Estée Lauder Companies (The)":"EL"}}},
{"id":"n-b99311bc","guard":[["hasAny",["cardinal","health","stock","symbol"]],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cardinal Health":"CAH"}}},
{"id":"n-bb14e537","guard":[["hasAny",["dominion","old","ticker"]],["has","ticker"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Old Dominion":"ODFL"}}},
{"id":"n-bddb6da6","guard":[["hasAny",["morgan","stanley","ticker"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Morgan Stanley":"MS"}}},
{"id":"n-be387397","guard":[],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Morgan Stanley":"MS"}}},
{"id":"n-beb87566","guard":[["has","centers"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Regency Centers trade under":"REG"}}},
{"id":"n-c0affc77","guard":[["hasAny",["income","realty","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Realty Income":"O"}}},
{"id":"n-c258aafd","guard":[["has","corpay"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corpay":"CPAY"}}},
{"id":"n-c32a8a3f","guard":[["has","aes"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of AES Corporation":"AES"}}},
{"id":"n-c4071210","guard":[["has","corning"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Corning Inc.":"GLW"}}},
{"id":"n-c4118354","guard":[["has","nvidia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Nvidia trade under":"NVDA"}}},
{"id":"n-c4227719","guard":[["hasAny",["america","packaging"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Packaging Corporation of America trade under":"PKG"}}},
{"id":"n-c8191b40","guard":[["hasAny",["co","kkr","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of KKR & Co.":"KKR"}}},
{"id":"n-c8deccdb","guard":[["has","blackstone"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Blackstone Inc.":"BX"}}},
{"id":"n-cb010a5a","guard":[["has","prologis"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Prologis trade under":"PLD"}}},
{"id":"n-ccfc4715","guard":[["has","class"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Fox Corporation (Class A)":"FOXA"}}},
{"id":"n-cd1e8c76","guard":[["has","cisco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cisco":"CSCO"}}},
{"id":"n-cd66d886","guard":[["has","ameren"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Ameren":"AEE"}}},
{"id":"n-ce87cc5a","guard":[["hasAny",["group","ticker","unitedhealth"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of UnitedHealth Group":"UNH"}}},
{"id":"n-d3984e1a","guard":[["hasAny",["companies","williams"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Williams Companies trade under":"WMB"}}},
{"id":"n-d56712cc","guard":[["has","semiconductor"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does ON Semiconductor trade under":"ON"}}},
{"id":"n-d6be19de","guard":[["has","teradyne"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Teradyne trade under":"TER"}}},
{"id":"n-d8cd5848","guard":[["has","cardinal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cardinal Health":"CAH"}}},
{"id":"n-db767369","guard":[["hasAny",["ecolab","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Ecolab":"ECL"}}},
{"id":"n-dc2afd47","guard":[["hasAny",["monolithic","power","symbol","systems","trade","under"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Monolithic Power Systems trade under":"MPWR"}}},
{"id":"n-ddfa7b8e","guard":[["has","morgan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Morgan Stanley":"MS"}}},
{"id":"n-df6ad2d2","guard":[["has","roper"],["not",["quoted"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Roper Technologies":"ROP"}}},
{"id":"n-e2f927c3","guard":[["has","companies"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Williams Companies trade under":"WMB"}}},
{"id":"n-e572347b","guard":[],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Cardinal Health":"CAH"}}},
{"id":"n-e7553ba9","guard":[["hasAny",["motorola","solutions"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Motorola Solutions trade under":"MSI"}}},
{"id":"n-e94234a9","guard":[["hasAny",["o","smith","ticker"]],["not",["colon"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of A. O. Smith":"AOS"}}},
{"id":"n-eae3cbc9","guard":[["has","pepsico"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does PepsiCo trade under":"PEP"}}},
{"id":"n-eb4c3c92","guard":[["hasAny",["steris","ticker"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Steris":"STE"}}},
{"id":"n-ec253cf1","guard":[["hasAny",["huntington","industries","ingalls","ticker"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Huntington Ingalls Industries":"HII"}}},
{"id":"n-ed4b6ee5","guard":[["has","lyondellbasell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of LyondellBasell":"LYB"}}},
{"id":"n-ee8c4a22","guard":[["hasAny",["aon","plc","ticker"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the ticker of Aon plc":"AON"}}},
{"id":"n-eefa63ca","guard":[["hasAny",["global","sp","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of S&P Global":"SPGI"}}},
{"id":"n-f21927cf","guard":[["has","chevron"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Chevron Corporation trade under":"CVX"}}},
{"id":"n-f46e958b","guard":[["hasAny",["bny","mellon","stock","symbol"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of BNY Mellon":"BNY"}}},
{"id":"n-f95d729e","guard":[["hasAny",["fair","isaac"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Fair Isaac trade under":"FICO"}}},
{"id":"n-fce377bd","guard":[["has","iqvia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of IQVIA":"IQV"}}},
{"id":"n-fdec38cd","guard":[["hasAny",["edison","international"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Edison International trade under":"EIX"}}},
{"id":"n-fe8e2982","guard":[["hasAny",["symbol","towers","trade","under","watson","willis"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which symbol does Willis Towers Watson trade under":"WTW"}}},
{"id":"n-ff131ee8","guard":[["hasAny",["morris","philip"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the stock symbol of Philip Morris International":"PM"}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which symbol does Ralph Lauren Corporation trade under","expect":{"equals":"RL","notRefusal":true}},{"q":"give the stock symbol of Alphabet Inc. (Class A)","expect":{"equals":"GOOGL","notRefusal":true}},{"q":"which symbol does WEC Energy Group trade under","expect":{"equals":"WEC","notRefusal":true}},{"q":"which symbol does Host Hotels & Resorts trade under","expect":{"equals":"HST","notRefusal":true}},{"q":"give the stock symbol of Progressive Corporation","expect":{"equals":"PGR","notRefusal":true}},{"q":"give the stock symbol of Newmont","expect":{"equals":"NEM","notRefusal":true}},{"q":"give the stock symbol of Cardinal Health","expect":{"equals":"CAH","notRefusal":true}},{"q":"what is the ticker of Roper Technologies","expect":{"equals":"ROP","notRefusal":true}},{"q":"what is the ticker of Wells Fargo","expect":{"equals":"WFC","notRefusal":true}},{"q":"what is the ticker of Aon plc","expect":{"equals":"AON","notRefusal":true}},{"q":"what is the ticker of American Express","expect":{"equals":"AXP","notRefusal":true}},{"q":"which symbol does Packaging Corporation of America trade under","expect":{"equals":"PKG","notRefusal":true}},{"q":"give the stock symbol of Cisco","expect":{"equals":"CSCO","notRefusal":true}},{"q":"give the stock symbol of BNY Mellon","expect":{"equals":"BNY","notRefusal":true}},{"q":"give the stock symbol of Synchrony Financial","expect":{"equals":"SYF","notRefusal":true}},{"q":"what is the ticker of Kroger","expect":{"equals":"KR","notRefusal":true}},{"q":"what is the ticker of Huntington Ingalls Industries","expect":{"equals":"HII","notRefusal":true}},{"q":"give the stock symbol of Avery Dennison","expect":{"equals":"AVY","notRefusal":true}},{"q":"give the stock symbol of LyondellBasell","expect":{"equals":"LYB","notRefusal":true}},{"q":"give the stock symbol of Tyler Technologies","expect":{"equals":"TYL","notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
