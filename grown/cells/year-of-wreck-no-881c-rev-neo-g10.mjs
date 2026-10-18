// year-of-wreck-no-881c-rev-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"year-of-wreck-no-881c-rev-neo-g10","class":"year-of-wreck-no-881c-rev","generation":10,"lane":"neo","grownFrom":["1685 is the year of which wreck no","name the wreck no whose year is 1949","1699 is the year of which wreck no","which wreck no has the year 1639","1633 is the year of which wreck no","name the wreck no whose year is 1962","1759 is the year of which wreck no","1308 is the year of which wreck no","name the wreck no whose year is 2016","1637 is the year of which wreck no","which wreck no has the year 1594","1549 is the year of which wreck no","which wreck no has the year 1711","name the wreck no whose year is 1754","name the wreck no whose year is 1649","name the wreck no whose year is 1640","which wreck no has the year 1954","which wreck no has the year 1634","name the wreck no whose year is 1707","1964 is the year of which wreck no"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-wreck-inventory-c8fc4d","columns":["wreck no","year"],"n":17981,"cols":[{"f":"0W00001|57|58|59|410|51|53|54|55|56|57|58|420|51|52|53|54|55|56|57|58|431|52|53|54|55|56|57|58|59|440|51|52|53|54|55|58|59|451|52|54|56|59|462|54|56|58|470|51|52|53|57|58|59|481|52|54|55|56|58|492|53|56|58|3103|57|415|421|57|58|59|430|53|56|58|440|53|453|57|59|461|58|59|470|55|56|57|59|481|56|57|491|3201|53|56|411|54|55|56|59|422|55|434|443|451|57|463|470|51|58|59|484|499|3320|58|432|53|442|454|464|474|489|3405|417|420|53|485|490|53|56|3502|435|449|456|57|59|471|59|488|3603|54|58|410|439|442|59|478|59|3736|463|55|486|497|3822|3906|430|462|470|480|59|490|21006|411|53|421|437|445|464|57|59|482|3201|430|58|468|3309|430|452|461|3461|52|476|58|3557|461|56|3662|495|3812|3900|22009|465|3250|3335|458|467|490|57|3419|3558|477|3685|3872|3923|23246|3697|3762|24039|3153|3210|3369|478|3952|25402|3521|3898|26031|54|3127|3373|3463|28149|3301|419|3946|29374|486|59|490|54|58|3402|57|414|430|51|57|58|59|467|470|485|56|3506|432|444|56|461|59|490|53|3606|59|421|443|55|452|461|488|498|3702|453|460|51|52|3896|3922|440|488|110032|100788|21901|29146|23578|111416|101364|26032|3145|3262|53|3394|3424|3776|3852|3935|27023|54|452|3264|3691|3820|54|118594|55|56|58|100255|25522|27344|28085|3587|29171|28840|110014|108528|20918|29168|21313|22123|24130|21367|25035|24544|26632|112751|101369|24546|113352|108415|20925|25707|20795|23041|52|53|25566|3758|26355|28009|26303|443|27874|29174|28931|21070|3373|25768|28338|29162|28848|29160|51|112752|108223|23792|28542|3279|25278|28463|29594|21224|3515|20256|3416|3681|52|53|54|55|3976|21007|3647|490|3902|53|22439|23044|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|25694|28015|112977|106646|111678|106743|27358|481|492|112978|104919|112979|105677|26105|27321|3404|3848|112955|467|101663|54|483|491|52|22663|25053|113214|101072|3346|24848|27101|28105|3204|495|3549|3819|487|3966|112949|469|480|102403|26428|27927|28157|112962|481|101999|26075|3222|112982|23175|103074|24423|26456|3897|28599|112961|483|54|55|56|102958|23789|496|24411|446|25870|26376|113216|109144|22819|25171|3582|3751|26503|20687|58|21344|3685|22016|426|471|480|3100|56|427|58|59|430|51|3615|24322|435|3757|25004|459|3280|27053|3153|3596|29176|112952|475|487|101694|22075|23807|24154|3780|3802|3907|25096|26082|3137|27017|3342|28083|3398|3488|3634|497|3710|59|436|3843|29124|482|112964|472|488|59|490|101998|3302|22996|57|24146|26101|3870|28199|3679|3834|112991|52|53|23217|101153|498|3288|3345|23109|3831|52|24590|27378|112994|55|56|101173|3374|55|3990|22132|53|54|55|56|57|23387|24422|25064|3282|492|26542|27069|28172|3635|3944|29122|53|495|112941|58|471|497|23219|420|101331|476|3500|3640|56|455|56|469|481|493|57|58|22138|59|3902|23076|24756|478|25134|26865|27058|3921|28988|59|29203|426|112973|498|59|23000|51|52|53|3178|490|26299|100193|3591|3689|490|51|3814|21073|54|3164|3337|443|477|58|59|480|3598|22140|3930|23077|58|3447|3903|24043|3166|3662|26969|27773|112938|23004|55|100926|21191|3273|498|3305|481|52|3861|3904|22582|24197|3553|56|57|59|461|52|53|3855|3927|27191|3536|28019|3833|112894|55|26320|51|100418|3503|54|431|474|3692|53|21226|499|3383|3517|3699|22141|52|3268|59|3420|3668|24540|3606|3781|26930|28208|3626|3954|113006|57|26182|55|3302|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|422|53|54|55|27245|56|100928|21049|3202|3384|55|3485|3657|3700|22961|23705|24046|3198|25899|27521|3727|28203|29121|113008|26188|3210|3326|57|58|59|28534|100097|3146|21023|59|465|475|3301|486|57|3867|58|22066|3413|23286|3300|495|3493|3628|24048|3163|3246|3937|25133|3255|3524|3667|3984|26387|27915|28361|3412|3763|3816|3927|29111|420|3204|112896|57|58|59|3942|23009|410|51|52|53|54|55|3196|3221|52|26331|101033|476|3388|59|23527|24044|55|57|3834|447|3900|25153|474|3246|3884|26357|3486|28411|3846|113016|57|3223|54|100694|21358|462|492|53|54|55|3701|52|53|54|55|22091|3916|23000|24962|26837|27009|473|3935|28342|3980|112939|440|23018|427|58|59|430|51|52|101077|3283|3396|57|3642|479|3706|57|22384|3405|411|3831|23007|3347|3551|3680|3787|24062|3664|58|3777|483|25217|26076|3669|3712|3805|27708|430|28669|3773|29118|426|112974|23019|26121|52|53|54|55|56|57|480|3300|51|27196|3243|100505|56|57|58|59|410|51|3695|21004|435|478|3398|3519|3670|56|22723|454|24965|25113|496|27512|449|28283|3747|3888|112970|26214|56|422|3330|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|27367|100971|21008|422|448|3252|3399|3504|499|3708|3905|22143|3255|3440|3583|3747|23196|3623|3971|24853|25037|3337|3726|3918|27879|480|113020|26223|54|55|3347|58|59|450|51|52|53|54|55|56|27199|3368|59|100196|3419|3789|3929|484|495|21079|480|3183|3212|57|434|458|3400|51|52|53|3709|3858|491|22017|3270|3441|52|3523|3619|23228|3400|3667|24607|3793|25152|497|3361|3526|28670|480|29114|447|480|113021|26243|54|3357|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|3474|55|56|57|27201|52|53|54|55|100819|420|51|21161|3211|3300|428|3404|3520|51|22094|3538|3869|24825|25065|3121|3591|27864|28074|3329|3594|3760|3807|29148|112950|23022|53|54|55|56|494|3225|26219|445|56|57|3373|54|55|56|57|58|59|480|51|52|53|54|101026|3223|3405|56|22338|3620|457|3735|455|3985|494|24852|3953|25006|3117|3285|3856|26409|3591|3752|27062|58|28072|3683|3786|3823|29199|113095|56|26189|491|53|54|3385|56|57|58|59|3478|27370|51|101266|3407|58|3522|22104|3945|498|25155|491|3286|57|26068|3620|28313|484|29193|113097|58|26195|3390|51|52|3479|480|27206|57|3372|101081|3158|3297|3409|410|3710|51|52|22666|23079|480|51|28339|3451|116197|3393|57|27208|3373|54|101674|24026|3960|25017|470|113099|3101|26394|55|56|58|101411|3650|3713|3850|22144|3621|24699|3748|26382|28505|3748|59|3832|29274|112968|23102|53|55|56|3226|26202|53|54|55|3399|3400|27375|101083|3480|22271|52|3542|23673|3957|24064|3220|3723|25183|3592|3719|26024|3122|3468|3764|3999|27948|28664|498|3898|29158|3261|112901|52|54|443|23108|410|51|52|54|57|3227|58|59|430|51|101412|53|3600|51|22001|3868|23018|3153|3619|3967|24903|25101|499|3207|3348|26086|3207|413|448|3393|3534|56|3618|484|27081|28154|3428|59|479|3533|3743|112903|55|56|57|58|59|410|51|52|53|54|23104|419|421|3232|53|100209|3696|57|58|59|3700|21084|55|56|3414|497|3560|3602|22242|24846|3911|25144|3289|26310|423|3652|27064|28278|29200|112915|56|57|58|23123|26481|100823|21087|58|3415|3506|413|3666|3981|22145|56|57|3273|54|3401|423|443|3749|3839|23563|3969|24330|3554|55|3914|25061|27761|485|28452|3775|29252|112919|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|459|23125|56|57|26489|490|27376|57|100931|52|21089|3416|57|22070|3148|3444|3855|3935|24552|3609|3738|25995|26106|27403|3762|29101|112854|55|56|57|58|59|460|51|52|53|54|55|56|58|59|470|51|3963|23128|100120|3345|3607|433|3701|52|21090|51|3418|59|3573|3799|3906|22275|56|57|58|3480|3756|3807|452|23161|3482|24095|3242|3499|3886|3966|25104|423|454|3225|464|3356|3945|26812|27707|419|28813|3957|29262|112817|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|23130|51|53|3234|28530|100204|3421|3933|498|21016|59|452|492|53|54|3148|3420|51|52|53|3574|3714|55|56|57|58|3907|58|22149|450|51|3315|465|499|23383|24228|3611|52|3970|25209|28394|3926|29150|3243|112843|54|55|56|57|58|59|450|51|52|53|3966|23134|56|57|59|440|26117|428|59|430|442|3482|100934|55|21025|3424|474|3741|22152|3393|3847|461|473|24394|3613|3746|26007|488|3131|3939|485|27851|28005|412|3298|3985|29201|112789|490|51|52|53|54|55|56|57|58|59|3800|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|23142|53|100422|3936|21014|495|56|3909|22153|54|3493|3593|3848|3969|24842|3928|25036|455|3693|26132|28359|112776|57|58|59|480|51|52|53|54|55|56|57|58|3945|23144|56|26119|3401|100661|3703|3982|21041|497|58|3425|3523|490|22093|3155|56|57|58|3860|474|23309|3766|24014|25025|3244|3749|26118|3532|28297|3393|112770|52|53|54|55|23148|452|54|57|101179|3269|3363|3427|58|59|430|51|492|3661|3719|420|3910|22159|23868|481|24370|3755|25047|484|3389|26095|27037|3489|3779|480|28020|3835|3925|112755|56|57|58|59|460|51|52|53|54|55|56|57|58|23155|58|460|26138|456|57|101066|499|3432|53|3853|22004|3908|23535|3698|24770|3898|3905|25034|26083|3365|485|56|3878|28130|446|462|3550|112953|23163|54|3235|26207|3402|53|54|101046|3100|3434|55|56|22396|3495|23721|25959|26008|3504|3881|113165|57|58|59|470|51|52|26209|449|3405|56|57|58|59|410|27209|410|51|3378|59|480|100334|21101|3279|3721|22059|464|3243|3339|3606|460|23111|3203|3428|3539|24838|3959|25052|3507|3771|26092|53|3102|424|3549|3782|28193|3250|3441|3514|3600|54|471|484|29154|3208|112954|58|23174|57|59|480|52|55|3236|26250|3411|52|53|27381|101979|22808|410|475|56|3900|23303|3427|25124|26203|419|432|494|3502|27475|3520|28391|3901|29155|112893|3965|23187|3237|59|100424|55|56|57|21043|3975|22953|23200|3490|24431|453|25190|3283|26151|3206|27510|28307|3504|58|3852|474|3979|112951|56|460|23033|54|55|3189|3201|26414|55|27382|100075|491|3258|3595|3874|3993|21056|3437|473|3524|3687|22532|24264|26437|3588|3645|28129|3209|461|3304|3507|486|3782|3902|412|29167|112944|56|57|457|476|23191|52|53|55|26251|3416|57|58|100089|499|3100|51|452|3968|59|472|21003|420|440|57|463|3102|53|54|55|56|444|484|3205|420|455|489|490|3324|451|3438|59|467|3658|3722|53|3911|52|469|22074|3743|23318|3770|3834|24733|3850|3902|25138|3338|458|3527|3647|27030|3331|3463|3617|463|478|28006|423|473|3192|113197|58|59|3200|52|100937|488|21009|455|3107|447|467|470|3218|442|464|495|3326|434|3443|54|468|3503|59|412|3653|59|460|3724|55|56|57|58|59|430|22008|411|444|492|3160|51|52|53|54|3279|480|3569|3697|3842|23859|477|3994|24113|3212|3750|3826|25030|3229|3345|3905|26036|3585|27066|3443|3894|3975|28815|113203|54|55|57|58|410|51|26172|3226|58|3419|483|100975|21267|3316|3486|499|3525|491|3686|3888|22165|56|3586|491|23082|24079|25056|3226|435|3341|26253|3372|3519|3842|27028|3911|28326|3559|3653|3727|3934|29300|113036|57|58|59|440|51|52|26420|51|101108|3974|56|22108|3387|3485|23257|3570|3958|25602|425|27003|3154|3525|28275|113043|54|55|56|57|59|450|51|26229|3422|53|28521|101030|457|3470|3972|22029|460|477|490|3167|3311|466|3427|24948|480|25088|3454|3780|26103|3664|3739|487|27005|411|436|58|3681|3871|3996|28610|491|3787|3973|113052|53|54|55|56|57|100142|467|3244|57|498|3323|54|56|466|57|3410|488|3583|3999|21111|3236|3304|3495|3527|58|3851|3978|487|22019|427|445|469|476|3230|3622|23206|3380|3662|3706|434|24022|482|3117|3240|3381|3707|492|3945|25068|3103|489|26337|3847|3996|27039|3448|3953|491|28113|482|3349|479|3506|3608|3738|3882|29117|113058|59|460|51|52|53|54|55|56|57|58|59|26120|3424|55|100762|3872|3994|21031|458|3112|475|3340|57|3498|3847|3982|22023|3168|3313|471|3674|3853|23083|54|55|3635|3809|24298|3301|467|3498|3807|472|497|25028|3186|26364|475|3443|28132|3681|29140|51|3207|113070|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|27383|100353|21061|3172|3481|3654|22095|3840|23225|3445|3693|24137|3409|3661|25281|3881|26202|3318|492|57|27015|3271|3852|3903|439|492|28330|455|3665|3734|3967|491|29139|113092|53|100546|3751|21015|3192|3278|22002|3543|3744|23498|3528|3670|52|492|3765|3938|24365|3808|3930|25099|3354|55|3475|3708|26077|3158|496|3307|424|3449|452|3687|3982|27435|28018|3144|3290|56|3392|3444|3511|3603|113100|59|413|55|56|58|100356|3824|3974|21232|3446|3677|482|58|22053|468|3316|436|478|3687|3976|23096|3351|3720|52|436|441|486|3867|24882|25085|26663|472|54|3726|27031|3564|3704|424|3923|28226|3638|3810|3984|490|113120|52|54|59|432|55|58|441|55|57|59|450|51|53|56|59|461|52|483|26158|3426|57|59|101852|464|481|3993|54|22055|498|3330|23141|450|3299|3405|3596|24013|3426|25712|3917|26114|433|3751|3809|3903|483|54|27310|3402|3583|3914|28434|113166|473|56|481|54|56|58|26428|430|51|52|27384|100194|3213|437|58|3317|21225|3680|3791|3860|22018|3228|3487|3557|3717|3922|23209|3305|3452|3552|59|462|24058|3127|3763|496|3839|466|3986|59|25051|3137|3238|3349|3760|52|498|3900|26481|27315|3421|3695|28016|425|3373|3413|3552|3929|437|29138|113194|3206|26231|52|54|3433|54|100198|3205|3310|22246|23121|3270|54|3522|471|3642|454|3756|58|494|3925|24061|3241|3618|3978|25129|3252|3399|3415|3501|3734|26395|3592|3760|27155|3207|3345|466|3668|3750|482|3888|3961|28065|3273|3585|3818|461|471|113209|441|52|54|56|57|59|473|3404|56|57|58|26435|56|100671|3891|21185|3231|3475|3511|22054|497|3716|3894|23404|3757|3808|464|479|482|3959|24105|491|3497|3605|420|3822|3908|412|424|439|492|25120|3256|3510|3789|3821|26338|3665|473|3727|3801|3987|27096|3113|462|53|3287|3372|3401|57|440|3538|490|3660|490|28323|445|3454|3558|113274|59|480|51|52|491|52|55|56|57|3300|52|54|57|58|412|54|55|56|57|58|3409|26437|58|59|27385|100631|3804|58|21028|462|3233|447|471|3359|460|3469|483|22337|3519|3678|23110|3465|472|3660|494|3731|3835|3933|24112|3492|3688|491|3776|3917|25787|27364|3873|3969|28438|3579|29271|113275|57|58|3310|53|59|421|52|53|54|55|56|57|59|430|51|26236|57|100532|22056|23594|3647|3981|24202|3316|446|3824|25082|3470|3500|473|3748|26098|3183|3457|27136|57|3474|3783|28779|3893|3974|113286|3332|53|55|3410|26238|3440|27386|100055|463|476|3102|3399|3887|3938|481|21113|54|55|3312|3479|3648|465|3759|23348|3407|3566|24009|3160|3236|3312|3420|25228|3444|26148|3329|3907|27674|3937|451|465|470|28583|3728|431|113276|485|499|3334|56|57|58|59|441|52|56|26131|3240|3441|52|53|100576|3673|3920|21150|52|22058|3327|3683|23608|24111|3665|498|25937|26367|3517|3668|3714|27354|56|3554|3784|28198|3742|29273|112875|23283|57|3344|57|58|450|53|26241|100896|3904|21281|22169|3223|23132|460|3306|3451|3503|3716|24764|25049|487|3169|3724|3873|26159|3240|485|27044|459|460|3348|3405|420|473|480|3529|3995|28546|111723|435|22877|58|59|480|51|52|53|54|55|56|57|23356|57|59|467|101039|22684|3708|23609|25095|3100|3434|3539|26019|3113|477|3210|437|58|3425|3981|27185|3320|451|111163|3727|436|57|23294|3301|55|455|460|51|52|54|55|56|3411|26199|3242|452|53|54|55|470|3444|55|56|57|58|59|27213|3387|58|101983|22256|3670|3730|23282|58|3556|460|499|3600|3830|24225|487|58|492|54|3328|3451|3524|25435|3578|59|3652|26205|424|3317|446|57|59|454|3710|457|3908|28031|3264|3739|3936|111731|53|59|23289|3371|54|56|58|26200|458|59|3450|51|52|53|54|55|27214|55|3389|490|51|52|100029|430|469|3242|3870|21044|3119|3678|22241|3651|3757|23133|457|3390|3416|24969|482|53|25702|3812|430|26242|479|3804|494|3966|27215|3689|28169|3831|29018|113284|490|3381|52|53|54|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3401|412|53|55|100050|3132|3289|3391|3428|59|3538|3630|3807|488|3905|411|21496|3562|3603|3821|22623|3814|23145|459|3968|24216|3703|486|3916|454|25031|3135|3221|3495|3624|3799|3872|495|26252|3366|3587|3763|472|54|27008|3417|3920|28210|29223|113212|53|55|58|438|440|53|55|58|450|26473|100046|3973|21582|3777|22691|23261|24119|3362|3751|3884|3949|25222|475|3646|3773|3998|26168|3204|436|450|492|3464|3520|3975|57|27016|486|57|3112|422|3398|3416|472|3517|493|3667|3845|28088|3281|3343|3615|3862|113251|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|470|488|498|26132|53|100939|478|22706|434|59|3970|23226|3350|3676|495|3709|443|3845|24244|457|3357|495|3456|3528|3658|3766|3887|3968|25208|3463|496|3653|3823|3939|446|26104|59|434|467|478|3272|3305|3407|413|435|485|3693|54|3738|440|461|3845|27476|3786|3887|3944|28107|435|3272|3399|3774|492|3933|451|493|29181|494|113272|3303|56|59|411|420|58|25816|423|26151|100553|3873|21017|3194|3604|3746|456|3842|471|3989|22057|3504|23002|3538|24101|3363|3621|52|3950|25205|457|3533|3855|3956|26165|489|3625|479|3979|28381|495|3551|3955|29251|113340|53|55|451|54|25815|26150|100012|3160|3239|3705|3884|21053|3222|3645|451|52|467|3733|472|3855|493|3914|55|22041|58|3170|51|3239|440|3362|479|483|3426|445|3535|23449|3598|3730|3851|483|3932|454|24157|496|3623|54|3791|3841|3925|25224|458|3414|3709|447|27182|3263|3369|28021|3147|3256|3522|113358|468|59|470|52|53|55|57|59|485|3400|52|53|55|414|58|59|100158|492|3217|420|445|3396|3746|474|3986|496|21165|495|3254|3355|3671|22567|3715|3816|466|23149|3231|3513|429|455|3907|456|470|24167|3211|451|3408|417|454|3537|58|3782|59|3804|483|58|3909|25150|3276|3311|3481|3554|3737|3863|26089|491|3110|420|3327|440|58|3408|420|465|56|482|3526|3654|475|3767|496|3887|27021|3208|3452|3591|28013|54|57|3101|3207|3673|113435|59|441|53|55|58|453|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|3502|100200|459|3577|496|3777|3997|21265|3774|3977|22010|442|485|3385|3711|458|3909|23185|3235|458|3340|3466|3540|24161|52|25109|3703|495|3989|26211|3328|430|3403|3589|3621|27158|3220|3377|28194|29175|113503|55|59|413|56|420|430|54|58|440|55|450|58|100236|3787|3977|21589|3641|3806|22506|23450|113562|54|59|474|56|59|481|54|57|491|3605|411|55|420|54|57|430|55|57|440|53|55|56|452|54|59|495|100172|3554|3617|3739|471|482|21034|58|3581|3887|3916|57|58|59|22910|446|479|23020|3505|3704|24317|3815|25237|26069|3412|27654|28982|29185|113661|58|471|55|56|487|492|58|3700|51|52|53|54|55|56|57|58|59|411|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|430|51|53|54|55|56|57|58|59|100141|3287|3561|3940|21145|3491|3749|471|3920|484|22047|3927|23013|24441|26351|28042|112892|23729|432|440|51|52|53|54|55|56|57|58|59|450|51|53|55|56|57|58|26152|100315|486|3620|21275|3644|3822|22224|3346|3446|3833|23696|3814|24188|25115|3733|3876|26179|3265|473|3377|3528|3642|498|3798|3800|496|3933|444|480|27025|435|3588|3778|28011|3377|3623|3889|113416|57|420|51|52|53|54|56|57|58|59|430|51|54|440|52|59|450|52|54|478|59|480|52|53|54|55|56|57|58|490|51|52|53|54|56|3969|470|51|26153|54|3263|54|3461|52|53|54|55|27220|51|3393|54|101027|450|3877|22089|3320|3812|3956|480|23119|3569|3699|3840|24339|25545|3600|3851|26405|461|3627|3836|27279|3572|28188|113597|3807|456|57|58|59|460|51|52|53|54|56|57|58|24205|26134|55|56|3265|56|57|3460|56|57|58|27395|56|57|28537|100430|3915|21163|56|3241|3447|22087|3516|3752|23369|3440|3657|58|3919|25686|57|26141|3332|481|3539|3653|3746|3895|3976|27000|3277|3322|453|3567|3665|29233|111822|23500|57|419|428|442|3614|439|463|54|3787|3869|470|51|52|53|54|55|56|57|58|59|481|26256|460|3456|57|58|59|27218|3398|59|3400|51|52|53|100226|3568|3611|427|446|3902|21123|460|3605|484|22051|3172|3562|3676|3722|453|59|3877|58|3907|462|472|23456|3541|24627|3709|427|25553|495|3831|454|26229|474|3300|3546|3619|430|3750|58|486|3945|471|27172|3365|470|3468|3508|435|477|3962|28197|3547|498|111742|53|58|470|56|58|3827|22023|23436|58|444|3501|410|51|52|57|58|422|53|54|55|59|431|52|53|56|57|59|441|53|54|56|57|58|59|451|52|53|54|55|56|57|59|3889|3972|26268|3469|470|51|52|27404|55|56|100148|3560|481|494|57|3601|458|3796|21227|445|3649|3781|54|3837|22505|3680|3713|58|3879|23187|3975|24296|3336|3823|25020|3194|3867|3942|53|26276|480|3360|3447|3702|455|493|3997|27007|3383|3999|28235|56|3464|3961|111757|59|484|23489|3801|54|482|53|54|56|57|58|490|51|52|54|55|56|57|58|3900|51|52|53|55|56|57|58|24200|51|52|54|101563|483|3639|3838|22324|3415|23001|3192|3202|475|3361|3861|3992|24155|3263|495|3377|3592|3628|3818|429|3956|25023|26264|3358|3525|3655|460|3706|456|3904|465|491|27106|467|490|3386|3478|3838|3916|466|28109|3262|493|3385|3909|481|495|29186|57|58|111762|58|491|23432|57|447|3508|435|3602|412|3904|59|410|51|52|53|54|55|56|58|425|58|59|430|51|52|53|54|55|56|57|24185|57|58|490|51|52|54|55|56|58|59|100188|3340|488|3769|21024|3760|486|3875|3921|52|53|22234|55|3332|23724|24124|3862|25774|26147|3209|3590|3905|27511|28568|113433|3560|51|55|56|57|470|51|52|53|55|57|58|480|52|53|55|56|58|490|52|53|54|3917|59|473|54|24141|100144|3208|3341|3494|21314|3764|22698|3951|23154|3223|57|3601|414|3760|3935|451|460|51|474|24021|3114|3248|3319|458|497|3536|3617|480|3713|3859|25577|3731|26267|3462|3688|3725|465|27301|3498|28460|112024|23481|3515|421|498|59|3613|429|456|3920|51|53|54|56|57|438|59|441|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|24182|53|54|100057|465|3339|3431|3542|463|3641|465|3706|456|473|59|3826|57|468|3941|21274|3329|3606|3800|22173|3281|52|3447|58|59|3559|3750|51|3880|23112|463|488|491|3557|3833|490|24106|3215|3337|3404|3679|3803|3901|432|25005|3181|57|3413|456|3993|26225|3659|486|3817|27126|3276|3396|3854|28095|3496|3512|3642|3795|29216|112025|23497|58|3504|56|495|56|3600|51|53|54|56|57|58|59|410|56|57|59|421|52|55|56|58|431|52|53|54|56|58|441|52|54|57|58|59|450|51|53|55|57|58|460|52|56|57|59|470|52|53|54|57|58|59|480|51|52|53|54|55|56|58|59|490|51|53|54|56|57|59|3777|58|59|480|53|54|55|56|59|490|24142|54|55|56|57|58|450|51|52|54|55|56|57|59|460|51|53|54|55|56|57|58|59|470|51|55|56|58|59|480|25813|26137|3496|57|3518|59|420|51|52|27222|3411|100291|3318|443|478|59|21579|3607|468|22174|3319|476|492|3412|429|3624|23024|3131|3217|452|3435|453|3532|24405|25024|3114|3398|3616|443|3958|490|51|26067|496|3126|440|456|487|492|57|3271|58|499|3321|459|3401|434|472|59|3565|3713|3946|472|27121|469|3300|455|3437|3543|3832|456|28195|3372|111835|22026|57|3120|23425|446|495|59|3514|426|57|468|3665|3781|52|491|52|53|54|55|56|57|58|59|3800|52|53|55|56|58|59|410|51|53|55|56|57|58|59|420|52|53|54|55|56|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|54|55|56|57|58|59|450|51|52|53|54|55|465|3996|24206|58|59|410|52|53|54|56|26273|100047|3233|481|3406|3745|21585|3770|22388|3662|3702|3881|23413|3944|462|495|24581|3934|25375|3400|59|3528|431|3911|488|26070|3396|3444|3518|3753|3922|27109|486|58|3297|3446|59|28630|29190|111836|57|23994|55|57|58|59|24000|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|54|26155|3272|28361|100260|3344|22359|472|3499|3563|473|3906|24100|3402|3947|25054|3580|3882|3987|26422|476|3506|479|3670|491|3854|27070|485|3395|3436|3666|3746|3863|28292|111838|440|51|52|24025|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|52|53|54|28468|100207|461|3744|59|458|3886|21839|23690|24063|3262|3631|448|3926|25550|3757|26216|431|3622|483|3769|3859|3931|27108|438|3374|3447|3500|3833|28206|3520|55|3824|445|111839|22028|24041|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|100889|21157|3448|3592|3608|22175|3258|3576|3731|23346|24250|59|3582|3632|3724|445|25896|26334|3431|3970|27063|3600|28151|3220|3740|111848|450|51|52|24069|470|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3101|52|53|54|55|56|57|58|59|410|51|52|53|54|56|100122|3262|477|3533|464|3652|3707|483|21335|3477|3507|410|3609|3748|452|54|465|56|3804|55|58|414|440|53|466|492|3924|55|56|57|58|59|430|473|22264|483|3325|451|486|3422|489|3564|471|3603|425|56|57|58|59|3844|23291|3610|51|52|3754|461|24012|3261|3657|3871|28276|112029|3872|24115|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|53|59|453|58|462|473|54|57|481|56|59|493|57|3203|57|411|55|57|58|420|51|53|55|56|59|431|54|57|26143|54|55|3484|27240|28469|101060|24300|3425|433|3837|25008|3596|3864|26226|3775|3835|3929|28386|3562|112030|51|24239|441|53|55|56|57|59|451|52|54|57|59|461|52|55|56|58|470|51|53|54|57|481|53|54|55|58|59|492|28462|100655|21755|22352|55|3679|23728|453|3905|24386|25706|3901|26578|27408|28563|3881|3922|58|497|114290|51|53|54|55|56|3309|411|53|59|421|54|56|57|59|432|53|55|57|441|53|55|58|452|53|54|56|59|460|53|55|57|59|470|56|57|58|59|480|51|52|53|54|56|57|58|490|3430|28470|100395|3578|3759|460|21174|3449|3610|3732|3857|22034|479|3322|3654|3805|56|23455|3865|3963|24029|470|3148|3217|3434|3849|3920|59|25001|3179|482|3438|3547|470|486|3637|3727|440|494|3835|26090|3100|412|438|444|453|54|57|463|59|470|484|491|3227|447|475|3398|3419|473|3516|3656|461|490|3701|416|59|420|442|3810|55|424|438|440|476|499|3988|59|490|54|27006|450|3124|470|53|56|487|3303|475|3409|479|494|3524|3612|59|3918|28057|3170|3222|442|454|471|3396|3409|425|483|3523|444|455|475|3611|52|446|57|482|3785|3911|55|438|460|29222|111853|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|471|52|53|54|55|56|57|480|52|53|54|55|56|57|58|22032|24412|55|56|433|58|442|56|451|52|55|57|58|59|462|53|55|56|57|58|476|486|57|493|54|55|56|57|58|59|3500|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|485|57|59|492|55|57|3602|56|57|412|54|59|420|52|57|433|58|441|55|493|26485|27241|28463|54|100195|3303|3616|421|436|3764|3867|21151|3209|3848|22490|3827|23151|55|474|3314|3536|3866|24033|3185|3205|3341|3583|54|3681|3830|3940|495|25112|498|3219|436|3306|435|3645|3725|58|26186|3260|3378|3429|494|3733|3906|27128|3394|3791|52|3844|3940|483|28140|476|3245|488|3358|471|3446|3725|451|3814|460|485|497|3952|56|494|29026|57|3113|3215|449|467|111891|53|54|55|56|57|58|22033|24660|3702|56|59|411|53|55|421|52|432|55|441|57|452|54|56|57|462|54|55|59|472|55|58|59|480|51|52|53|54|55|3857|463|56|470|52|55|58|3915|27223|100806|21229|3320|3611|52|53|3792|3985|497|22088|3267|3360|3503|439|3694|3704|3813|482|53|23262|3587|3708|427|24084|3152|464|3203|54|474|3435|3760|3879|25549|3745|3885|3992|26009|421|3136|442|3331|3430|3736|499|27256|3304|3545|460|3793|3840|478|3924|28041|466|3230|451|3306|3498|3548|3674|3706|3841|29230|111900|52|53|55|22034|55|24896|3900|418|59|421|53|58|431|54|55|59|446|57|59|453|25174|493|3202|59|417|422|57|59|432|451|464|470|51|53|481|53|59|494|28465|56|57|100104|55|3512|484|55|3614|438|454|3709|410|3942|53|54|22176|57|3341|3528|59|3760|23087|3103|54|55|420|3259|3323|436|3448|3700|52|442|3803|3912|437|482|24238|454|467|3325|3936|463|25009|497|3290|3303|3427|3589|493|59|3658|460|478|3837|441|462|474|55|59|480|3938|447|26054|55|56|3115|499|3269|3380|3427|478|3524|476|3658|3700|3821|52|466|3956|59|460|52|473|27045|56|3103|3270|3422|445|471|3680|28050|3200|419|447|3348|474|3455|3601|460|3709|3811|425|29000|417|3236|111907|411|444|55|56|57|58|59|450|51|496|25267|58|59|472|54|55|56|57|58|59|482|54|55|56|57|58|490|3940|51|52|54|55|56|57|58|59|450|51|52|54|55|56|101162|22407|435|3568|3677|3710|3858|484|23115|425|458|3201|3412|3576|3624|3848|470|24136|475|3280|3427|455|3551|485|3642|450|3743|59|3985|497|25019|442|450|3132|447|3359|3525|444|457|58|468|3601|3710|452|3802|3952|26058|59|497|3108|416|3325|3640|3978|27234|3337|443|473|487|58|490|3507|3980|28099|3100|428|433|3255|3466|3724|3906|487|29001|415|3227|434|59|111919|421|452|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|59|470|51|52|22036|25296|26274|3486|57|58|27407|100060|51|490|3106|416|57|490|3280|52|53|56|58|3307|427|480|497|3412|432|53|54|55|3589|3600|450|472|3711|52|461|3828|59|3912|21155|477|3256|3327|3450|472|488|3743|54|479|3883|3931|22178|3227|448|457|484|55|56|3587|3610|3761|3854|3952|59|23128|452|464|470|3215|429|490|3312|449|472|54|497|3469|3533|3812|56|495|3911|56|24019|473|58|3169|3390|59|3400|53|418|452|460|51|487|59|3675|494|3754|58|473|488|490|3806|419|420|3991|25057|463|3131|473|3313|3664|471|55|3722|26035|3107|411|429|439|466|3217|3389|3411|453|487|496|3527|444|3697|3735|466|27125|57|434|3438|3558|481|3912|59|28010|424|444|3177|496|3259|3344|450|3419|430|3553|3621|3703|477|3913|420|51|432|453|29213|459|111922|53|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|497|25297|58|59|3300|51|52|53|54|55|56|58|59|413|54|56|58|420|52|53|54|55|56|57|59|430|51|3957|58|59|460|51|52|53|54|58|26141|27412|28461|100300|55|449|492|3437|58|59|440|3632|3738|440|3910|21124|3568|3615|56|3768|3894|3932|22006|3179|480|3287|58|3350|3450|482|3509|474|497|3630|51|3740|51|462|3835|23088|3100|416|427|456|3355|3495|3573|3780|3800|413|24011|468|3343|456|3535|3655|3706|425|3869|25016|441|3151|3216|440|3367|3535|3929|26256|477|3345|3415|3692|3808|456|3934|27197|3325|433|460|480|3466|3530|461|3613|3908|28390|3424|3711|465|3958|476|29266|111985|56|57|58|59|490|51|52|53|58|22000|51|3900|25333|54|55|59|440|53|55|451|52|53|54|56|58|478|482|53|3415|57|58|426|452|53|54|57|59|3637|59|440|53|54|55|56|3727|3965|56|57|59|470|51|52|53|54|55|57|58|59|480|52|53|54|491|26174|3491|52|53|100400|3772|3805|410|431|3991|21012|451|3239|3303|3587|22036|3107|3536|3600|3856|23025|489|3629|3755|59|24208|3344|3739|497|3881|3999|25177|3575|3627|435|3711|26175|3246|3451|3577|3662|3703|429|444|473|3833|461|27002|420|52|455|3184|3267|475|3326|3424|461|54|3566|3661|28000|426|3215|3316|3445|3541|3663|3771|3866|3940|111943|473|54|55|56|57|58|59|480|51|53|22002|53|54|25362|53|54|55|56|58|470|52|53|55|56|57|480|51|54|55|56|57|58|59|490|51|52|53|54|56|57|59|3400|51|52|53|54|56|58|59|410|53|56|420|51|52|53|55|57|59|430|51|52|53|54|55|56|57|59|440|51|52|54|55|57|58|462|54|55|56|58|59|470|52|53|55|56|57|59|480|52|53|55|56|3514|3614|3726|3985|56|57|58|59|490|52|54|55|56|57|58|59|26000|51|53|54|56|57|58|410|51|3275|56|57|100381|3513|445|3801|415|432|53|21042|3200|3565|57|496|3617|3775|3879|495|3933|491|22229|3483|3513|58|3699|3736|3841|485|56|23239|3688|3740|24318|3430|462|25000|52|3715|28081|3380|112005|56|57|58|59|25488|490|51|52|53|54|55|57|59|3500|51|53|55|57|410|51|52|53|55|56|57|58|421|53|54|56|437|59|441|52|53|55|56|57|450|52|54|55|56|58|59|460|53|54|56|57|59|470|51|52|491|26012|53|54|56|57|58|59|421|52|53|54|55|56|57|59|100162|3319|476|3651|466|3713|54|21286|3321|441|59|3878|497|22181|3289|490|51|52|3361|498|3410|451|52|53|3693|3725|23107|429|3222|434|493|56|3304|496|3457|464|494|59|3602|466|3749|484|24128|465|3229|3320|447|25479|26533|3834|59|3993|27150|3413|3686|3963|28053|3284|3362|3449|474|3645|29272|3684|111994|22012|53|55|56|57|25574|55|56|58|480|53|58|490|54|55|56|57|58|59|3600|51|54|55|56|58|59|410|51|52|55|56|57|58|59|421|52|55|56|58|449|450|51|53|55|56|57|59|26030|51|52|53|54|55|56|57|58|440|51|52|53|54|55|56|57|3494|55|100264|3403|3558|470|3660|57|3946|21588|22182|3763|23011|54|3311|454|494|3454|473|24174|3672|3984|25662|3770|26071|3152|28688|29029|111995|22018|25660|51|52|54|55|56|57|470|52|54|55|56|57|59|480|52|53|54|55|56|58|59|490|51|52|53|54|55|56|57|58|3700|51|52|54|55|56|58|59|410|51|53|54|55|56|57|58|59|420|51|52|53|54|55|3826|57|58|59|430|444|26048|450|51|52|53|54|55|56|57|58|59|460|51|52|100150|463|3212|427|493|3313|461|58|3441|3566|487|3615|422|3742|3812|434|21451|3530|470|3618|59|3740|55|3829|432|3934|22183|54|55|3293|54|3347|494|3632|53|54|453|59|489|3714|3915|23193|54|3423|432|3543|3729|3837|24060|3645|25086|26062|474|27065|3956|28303|460|3443|3905|112019|420|51|52|437|58|59|440|51|52|53|25624|57|430|51|52|54|3831|52|53|54|55|56|57|58|59|440|51|52|53|55|56|57|58|59|450|51|52|53|54|55|56|57|58|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|56|57|58|59|491|52|53|54|56|57|59|3900|51|53|54|55|57|58|59|411|52|54|55|56|57|58|59|420|51|26063|54|55|56|58|59|470|52|53|54|55|56|57|58|59|480|51|52|53|54|55|57|58|59|3509|423|54|55|56|100197|3301|3411|495|3540|3715|3878|22402|455|3592|3707|3804|23117|3444|3537|449|3625|3844|488|24054|3126|439|3350|25537|27004|28340|3537|3632|29231|112044|55|25561|3728|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|3922|53|54|55|56|57|58|59|430|52|53|54|26090|51|52|53|56|57|58|59|3100|51|52|54|55|56|58|59|410|51|52|53|54|55|56|101338|22318|3656|461|54|3764|23183|3276|3567|3622|3781|3900|24057|3315|3467|58|3526|3835|456|26781|3816|27933|28143|3422|459|3772|3850|29242|112046|57|58|59|27693|56|57|58|59|3700|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|55|56|57|58|59|430|51|52|53|55|56|57|58|59|440|51|52|53|54|56|461|28495|56|57|100165|471|480|52|53|54|3210|431|454|3331|3443|54|55|3534|59|462|486|3618|59|423|3716|57|58|59|420|51|52|53|54|55|492|54|3836|57|58|59|495|57|3947|58|59|450|51|21246|3484|3531|3747|453|462|53|478|3801|52|57|59|420|53|57|444|55|459|462|55|474|480|59|498|59|3935|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|22003|3225|433|445|451|495|56|57|58|59|3300|51|443|54|456|464|481|59|495|3408|59|428|434|456|57|58|59|460|51|52|53|54|55|56|57|58|59|470|488|3589|3612|435|56|57|58|59|440|3719|465|56|3857|470|487|493|3904|448|477|495|23090|3248|3371|3479|3597|3626|439|3744|475|3815|492|3913|24266|499|3391|3464|59|471|3649|3857|3921|25077|3157|3204|449|3347|471|3450|3673|26146|474|3529|27470|3889|28114|459|3218|3538|3756|112050|52|53|54|55|56|57|26146|3281|27408|3747|58|59|450|51|52|53|54|55|56|57|58|59|460|53|54|55|56|57|58|470|51|52|53|54|55|56|57|58|59|480|51|52|53|55|56|57|58|59|490|51|52|53|54|57|59|3800|51|52|53|54|55|56|57|58|59|410|51|53|54|56|57|59|421|52|53|54|55|57|58|59|430|51|52|53|445|28498|100123|3249|490|3840|3952|483|21555|22083|3345|3404|3672|53|3732|23367|3509|3952|24143|3494|56|3736|453|3974|25046|476|493|3136|463|484|3233|498|59|3300|51|468|3484|3926|27389|3467|3909|28002|3287|3324|3414|3513|434|3687|3717|3812|29224|112058|59|460|51|52|53|54|55|3354|26282|3510|51|52|27815|436|57|58|440|51|52|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3900|51|52|53|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|432|53|54|100125|3218|3314|484|3446|57|58|59|3552|21342|3672|3817|22186|57|3302|429|3414|3669|3767|24269|3660|25044|3931|26050|3150|3255|3363|3477|27770|112066|57|58|59|26513|54|55|27927|58|59|430|55|56|57|58|59|440|51|52|53|54|56|57|58|59|450|51|52|464|55|57|100235|467|3302|463|3514|21508|22421|3695|3705|428|3888|23283|3393|3478|491|3544|475|25162|26228|3483|27061|3444|3853|28089|112072|54|55|56|26283|27225|3519|3922|53|54|55|56|453|54|55|56|57|58|59|460|51|52|53|56|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|490|51|52|53|54|55|57|59|28000|51|52|53|54|55|56|57|59|410|51|53|54|55|56|57|58|421|53|3499|100407|3775|481|490|3953|21215|22188|3303|412|57|3521|470|3641|458|3742|3950|23208|24103|59|3270|3351|482|53|59|3407|3805|25175|3200|423|3445|3655|484|58|3824|26417|460|3829|27954|28165|3233|3403|3622|452|3767|3930|29053|112078|59|480|51|52|3889|26284|3516|57|27226|28019|420|52|54|55|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|52|53|54|55|56|57|491|52|54|55|58|59|3100|56|100285|3885|21318|3577|22189|490|3555|3671|23292|3302|443|3604|3718|24424|25393|3809|27090|3673|28257|3580|59|3613|118088|59|490|53|56|57|3101|52|53|54|55|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|3204|453|461|100369|475|3914|21293|3490|3559|480|3620|489|22191|3304|3416|436|57|3811|23195|3205|433|3339|3502|3805|24059|474|491|3214|3444|55|459|3752|25352|3423|460|3633|27051|3216|435|3869|28224|55|469|3618|466|485|3737|459|3839|3916|29214|470|112083|54|55|56|57|58|59|491|52|53|54|55|26196|3508|28169|470|51|52|53|54|55|56|57|58|59|480|52|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3200|51|52|53|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|54|55|56|57|58|59|460|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|56|57|58|59|490|51|52|53|3312|428|437|450|51|3500|51|100108|485|3268|495|3450|3754|21010|3986|22038|3334|3424|3913|473|23003|56|3169|489|3475|3691|3738|3841|24177|3406|3775|25062|490|3451|3950|26779|27013|28056|58|479|3191|3368|59|3701|3924|29011|3217|112096|57|58|59|3100|51|28181|3294|55|57|58|59|3300|52|53|54|55|56|413|54|55|56|57|58|59|420|51|52|53|54|55|56|57|59|430|51|52|53|54|55|56|58|59|440|52|53|54|55|56|57|58|59|452|53|54|55|56|57|58|59|460|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|58|59|490|51|57|3428|431|3502|100541|3798|3802|21558|472|3621|52|3750|3846|22306|3686|490|3849|3928|23431|3739|3811|24142|3213|460|3349|25234|3439|26370|3778|27034|3110|3896|28027|3186|57|3217|3378|3453|3501|416|490|3718|3842|486|112102|53|54|55|57|58|59|26535|56|27227|28307|58|59|410|51|492|53|54|55|56|58|59|3400|51|52|53|55|56|57|58|59|410|51|52|54|55|56|57|58|59|420|51|52|53|54|55|56|57|59|430|52|53|54|55|56|57|58|59|441|52|53|54|55|56|57|58|59|450|51|52|53|54|55|57|58|59|460|100232|3402|452|53|54|3871|3908|21059|3348|3534|3623|54|3736|58|487|22192|3231|3328|480|3418|431|472|53|3652|475|3944|23091|57|3277|3534|3966|486|24207|3372|3951|25071|3140|3551|3797|26426|27104|416|431|3201|59|3672|3872|3926|28117|422|3524|497|112175|484|26527|58|59|430|51|52|53|54|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3600|52|27051|52|53|54|55|56|57|58|59|461|52|53|54|56|57|59|470|51|52|100240|3359|3726|22031|3193|3249|3526|3768|3901|23168|3953|24087|3159|3231|3401|3861|25149|3202|3641|54|26301|27898|28061|3125|3347|3473|3783|112174|58|482|53|26601|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|27073|55|56|57|58|59|481|52|53|54|56|57|100482|3605|3876|480|3985|21032|3576|3625|3835|441|482|490|22015|3237|3321|3554|3655|3769|23138|3216|3470|489|3711|467|24193|3283|3436|3519|425|25370|3844|28405|3527|3849|112179|25817|26643|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|27088|59|490|51|52|54|55|56|58|59|3239|100228|3413|455|3572|3647|3757|21036|3171|3276|487|3311|3769|3833|470|22073|3259|3331|468|3572|3665|3724|445|3889|3932|23004|3102|3438|471|3590|51|3641|3737|485|3878|24183|3677|3762|3810|25010|3477|497|3597|3791|26322|3500|3638|27091|3556|28137|3268|3317|3521|3768|29553|112186|3201|26286|3507|3694|55|56|57|58|59|3700|51|52|53|54|56|57|59|411|52|54|56|57|58|420|51|52|54|55|56|57|58|431|52|54|56|57|59|440|53|27100|51|53|55|57|58|59|410|51|52|100094|3154|3269|3312|3456|3747|21005|3307|3452|3737|22333|491|3491|23162|57|3280|3617|471|24209|3512|3711|3864|3961|25073|3160|3344|3449|486|3548|3666|491|3716|439|488|3903|415|440|59|26566|3605|27129|3227|433|3319|3493|3862|55|28039|446|57|469|3156|3201|427|3352|54|476|3450|481|57|3620|3700|412|3863|491|112203|54|454|55|57|58|26742|54|55|56|58|59|450|52|53|55|56|57|58|59|460|51|52|55|56|58|59|471|52|53|54|55|56|58|59|480|51|52|53|54|56|57|58|59|490|52|55|56|59|3800|51|52|53|54|55|27113|56|57|58|59|420|51|53|54|55|56|57|58|59|430|51|52|53|57|100019|3166|473|3253|3306|438|3457|483|57|3543|482|3653|3727|3881|3917|455|21127|493|3259|3501|3815|22099|3349|3515|422|451|479|484|3709|412|438|3924|23009|3179|3325|479|3546|3653|3884|24015|56|3104|3285|491|3398|3669|3895|59|3942|25364|479|3604|3934|26531|453|3819|27604|483|3979|28185|3240|3315|3461|476|3752|3800|3935|29005|112220|52|53|54|55|56|459|26806|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|53|54|55|59|431|52|53|54|55|57|58|440|27134|56|59|440|51|52|54|56|57|58|59|450|51|52|100501|475|498|3657|3879|21169|3594|3626|3788|22226|444|3433|478|498|3514|434|445|478|3613|442|3896|3971|23285|3769|3910|479|24182|3243|3305|424|3701|468|3840|25243|3790|3919|430|26402|3877|27111|3246|3311|452|3513|476|3917|28121|3234|458|466|3400|442|470|3624|55|29256|112212|55|421|57|59|440|51|460|26822|441|52|53|54|55|56|58|59|450|51|52|53|54|55|56|57|58|59|461|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|59|480|27153|54|55|56|57|3229|100058|474|3119|478|3304|411|462|471|53|485|493|3408|458|59|497|3515|499|3609|444|469|3728|3882|21535|22007|496|3508|485|3963|23092|53|3745|3875|3976|24032|54|440|51|451|472|3145|480|3297|3513|3702|3977|25416|3845|26543|467|3862|27259|488|3363|3553|28214|482|56|3448|3530|3633|29007|3383|112228|439|444|26506|3884|56|57|59|490|51|52|53|57|58|3900|51|52|54|55|56|58|59|411|52|56|420|51|52|53|54|55|57|58|59|430|51|27145|459|460|51|52|53|54|55|56|58|59|470|51|52|53|54|100053|3321|59|430|3401|3799|21584|22486|3770|3837|3941|486|23365|484|56|3484|3508|420|3669|3712|3828|457|3987|24025|3235|3371|488|3674|25297|3552|465|476|3853|27195|3248|3453|3597|3650|3988|28124|3662|3776|3904|112242|484|55|57|26932|53|55|56|57|58|59|440|51|52|54|55|57|58|59|450|51|52|53|54|55|56|57|461|52|27175|56|57|59|480|51|57|58|490|3238|100156|3547|58|3612|3741|3907|21054|3149|3210|3489|3971|22527|3822|3931|23214|469|3399|3519|3899|24281|3387|3558|460|3880|25744|26119|3214|3442|27027|494|3149|3228|3309|436|3986|28007|3142|3305|428|3532|3714|3907|463|112251|461|52|53|488|490|52|53|54|24100|26960|53|54|55|56|57|58|59|470|51|52|53|54|55|57|58|480|51|52|53|54|56|57|58|490|52|27143|482|53|55|56|100224|441|3398|3460|3536|3729|3869|3919|21742|476|480|493|3816|22221|432|3525|3720|3821|3984|23207|444|478|3417|3507|3793|3806|24187|3515|25007|466|3116|3443|3906|26046|3583|3643|27100|477|3595|3974|28252|3302|3614|3721|3880|492|112264|55|491|56|57|58|59|3300|51|52|55|413|3873|54|26287|27308|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|431|52|56|58|3452|28503|54|55|100134|449|451|3347|458|3461|52|3537|444|465|59|473|3662|470|3755|484|3809|494|3956|21002|3128|3235|463|496|3453|3785|3818|22194|23197|3266|3516|3605|444|3871|3906|24031|3129|433|447|486|3227|3516|427|3653|3729|3832|443|470|25122|465|3342|484|3485|3523|455|56|3699|3887|26143|3243|3384|3501|448|452|3747|3831|27161|3492|57|3557|3949|498|28052|493|3118|3244|3335|464|57|3406|469|3806|29070|112303|54|414|55|56|57|421|58|449|3890|51|27333|54|55|57|59|440|51|52|53|3453|54|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|55|56|57|58|59|490|28506|57|58|59|100404|3637|3752|3992|21575|22501|444|453|496|59|3602|58|3703|3981|23012|59|3139|448|484|3385|3517|3627|486|3823|450|52|473|24010|499|3373|3416|3654|3716|3827|476|57|25026|3178|3227|3629|3754|26404|3562|53|480|3790|3826|27289|3341|3481|3526|3860|3982|28077|3141|3309|3754|29248|112318|429|430|450|27344|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|3484|491|52|53|54|55|56|57|58|59|3500|51|52|53|54|55|56|57|58|59|410|51|53|54|28510|51|52|100155|3246|3484|3634|3730|21206|3564|3795|22342|473|3496|3895|3955|23410|3506|426|3679|24309|3696|3726|25670|27042|59|3286|3384|3943|28102|453|466|3314|29008|112161|3332|54|55|57|58|26288|3505|27414|55|56|57|58|59|420|51|52|53|54|55|57|58|59|430|51|52|53|54|55|56|57|59|440|51|52|53|54|55|56|57|58|59|451|3518|101751|57|473|23362|3425|3607|3854|24278|3687|25089|3201|3508|3920|26173|3335|3509|461|58|3648|3707|3811|488|3974|27105|3327|3573|3843|59|3987|28408|3602|3757|3859|3965|29229|112125|3348|3732|53|54|26289|27237|3450|3515|56|57|420|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|100803|21188|3240|22307|58|454|57|3479|3733|23106|3363|3682|24075|3272|3307|3450|3510|3798|25143|3339|466|473|492|3419|467|3792|26459|27542|28103|3228|3337|3402|3607|29254|112730|51|55|57|58|59|440|51|53|54|55|56|57|27545|56|59|450|51|52|53|54|55|57|58|59|460|51|52|53|54|55|56|57|58|59|471|52|53|54|55|486|100221|3383|3463|3580|3753|466|491|3893|3987|21197|3782|22020|3222|452|463|3481|54|3524|433|440|57|452|466|475|488|490|58|3604|59|3863|23005|3126|3917|491|24201|439|453|3304|3740|3918|25013|3164|3428|492|3610|483|3817|26185|3289|3491|3569|3734|3867|472|484|3948|27040|3159|3202|3329|491|3419|432|3555|3913|441|460|28028|451|470|3116|3486|3578|3627|58|3708|3868|29232|468|112725|56|448|26291|3504|27576|57|58|59|480|51|52|53|54|55|57|58|59|490|51|52|53|54|55|56|57|58|59|3600|51|53|54|55|56|57|58|59|410|51|52|57|59|28513|54|100139|3346|451|482|494|3498|3737|3843|21790|3825|472|56|22081|3262|3565|3974|23375|3518|450|24035|442|3237|3637|25813|3997|26470|3513|3717|3890|27400|28447|3564|470|3617|29536|112724|58|59|26292|27614|55|56|58|420|51|52|53|54|55|56|57|58|59|431|52|53|59|442|54|28515|100109|499|3555|3731|3979|21228|449|3586|3638|3869|22247|23922|442|24132|3249|3747|3889|25436|3659|26080|55|3135|495|3471|3555|3900|28104|3439|482|3715|3801|112714|56|57|58|59|420|51|53|27236|3634|55|56|57|58|440|51|53|55|56|57|58|59|450|51|52|53|54|55|56|57|28516|57|58|59|100087|21319|22253|23388|3433|3872|25404|3622|3714|423|432|55|3894|26078|3258|486|57|3341|3439|441|475|492|58|3570|3637|27598|3694|3932|455|28076|3248|3784|29225|112713|422|25008|26212|27409|3658|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|54|28520|100202|3377|3489|3629|448|3732|3883|21187|3237|494|3315|3536|3627|22195|3474|23332|53|54|3458|3593|3797|24110|449|3226|25474|26121|3259|468|3316|3515|451|3807|27285|491|52|3465|3614|28063|492|3325|3693|112694|57|58|59|3700|52|53|54|55|59|410|51|52|24712|56|57|58|420|53|54|56|57|58|59|430|51|53|54|56|57|59|440|54|56|58|59|451|53|55|58|59|25009|410|51|52|53|54|454|55|56|57|58|59|460|51|52|53|54|478|100137|3248|3464|3875|498|3900|21284|3308|423|3595|3885|3980|22033|446|3727|3865|3926|493|23143|3345|3476|3674|58|24742|3922|25594|3738|26201|3356|3414|432|27098|3412|3502|28336|3581|3656|112669|470|51|52|57|58|59|482|53|54|55|58|59|490|51|52|53|55|56|3701|24760|51|53|56|57|58|470|51|53|54|56|486|57|58|59|490|51|52|53|54|55|56|57|58|59|3801|25015|56|57|58|465|56|57|58|59|470|51|52|54|55|56|57|59|480|51|3242|26503|100067|3355|490|21214|3350|3455|3571|497|3761|497|3886|22105|496|57|58|59|3561|481|494|23381|3632|3810|3901|485|24083|3108|450|3384|3641|3990|25102|3674|3883|26270|3342|479|3512|474|3676|3708|421|53|27282|3382|3841|28087|3788|3821|3970|57|112666|57|58|473|55|56|480|51|56|57|24742|55|3802|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|25020|51|52|53|54|55|482|53|54|55|56|57|58|59|490|51|52|53|54|55|57|58|59|3100|51|52|53|54|55|56|57|3243|54|55|56|57|58|59|100865|21207|416|23750|3824|24671|25679|3819|26000|3497|3547|3677|3814|427|491|52|27089|3217|481|3346|3431|482|3548|463|3904|446|28212|429|499|3491|3535|3676|3808|59|472|29221|112655|56|57|58|24832|53|54|55|56|57|58|59|440|51|52|53|54|55|56|58|59|450|51|52|54|55|56|25026|57|58|59|3108|59|410|51|52|53|54|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|3349|100250|3465|56|57|21221|3332|22043|3692|3937|449|23378|3462|24176|3255|3878|25069|3130|467|3613|489|3753|3843|460|26171|481|493|58|3771|497|3806|423|473|3954|27032|3175|480|3283|3571|3723|3858|59|28082|3112|3267|3363|112644|55|56|57|58|59|452|53|54|59|460|51|52|53|54|55|24859|460|51|54|55|57|58|59|471|53|54|57|59|480|51|52|53|54|55|56|57|58|59|490|51|52|3902|25031|52|53|54|55|56|3131|52|53|54|55|56|57|58|59|440|51|52|53|54|3255|56|3360|27231|100223|59|452|3316|422|3414|492|21457|3643|473|22406|3771|3990|23094|3320|3434|56|3564|3822|3946|24001|423|471|3189|3505|422|3993|25033|458|474|59|492|26208|3507|3732|484|3968|27018|3362|3830|28178|3310|3567|3826|29068|3247|475|112141|3637|58|59|440|51|52|53|451|24708|3894|55|57|58|59|3901|53|54|55|56|57|58|59|411|52|53|56|57|425|56|25037|59|440|51|52|3145|56|57|58|59|450|51|52|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|55|56|57|59|480|51|52|3257|58|59|460|101159|3336|3494|22013|3200|23010|3295|3316|3408|3579|3777|488|3853|56|24086|3224|3506|3636|447|484|3714|25139|3241|3464|3651|3746|3803|56|57|58|411|469|3953|26436|3647|3820|27232|3626|475|484|3868|28049|3120|431|458|490|3351|3437|489|3631|3769|3894|3992|29237|112624|55|56|57|58|59|430|24920|52|54|57|59|430|52|53|56|57|58|440|52|53|25030|3184|55|56|57|58|59|490|51|52|54|56|57|58|59|3200|51|53|54|55|56|57|450|52|53|54|26294|100624|55|468|3877|21758|3824|22417|3517|3681|3726|23477|3500|3684|3776|3936|25094|3607|3908|482|26550|58|3802|27054|3273|3861|3930|28055|3668|3720|444|29039|441|112615|56|57|58|59|420|53|431|52|53|54|55|56|24944|58|450|51|52|54|56|57|58|59|460|51|52|53|25043|54|3208|410|51|52|53|54|55|58|59|420|53|54|461|26502|100892|21578|22510|441|3643|3850|23640|456|24851|25457|465|3743|481|26230|454|3418|3748|3883|27014|448|3274|3622|28029|3184|3311|3592|3733|3817|3986|29009|3244|450|112599|3601|52|53|56|57|58|414|421|52|24964|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|25045|56|57|58|3225|56|58|430|51|53|26295|100296|3486|3626|3778|21146|468|478|486|59|499|3213|450|477|480|55|491|3322|453|3828|430|22201|3326|3815|24944|25148|3251|3661|3701|3913|480|51|26084|3454|55|3631|54|3730|57|491|3864|482|27284|3664|3764|3813|28723|3803|457|464|490|29933|110419|22592|55|56|58|3604|55|59|410|51|52|24743|3987|58|59|490|51|52|53|54|55|56|57|58|59|25001|52|53|54|55|56|57|449|450|52|53|3235|56|57|58|59|440|462|53|55|56|26183|3501|27413|100663|3750|21176|3219|3955|22824|23242|3401|3836|493|24199|3867|473|25211|496|3713|3893|3912|478|26123|3530|460|471|55|494|3607|424|27078|3418|3882|491|28175|3332|488|3582|3836|458|29034|112587|493|54|57|26147|58|59|462|57|58|473|55|58|59|481|54|56|57|490|52|58|3201|56|58|411|53|55|57|58|420|51|57|430|53|55|59|448|457|462|59|478|59|28471|100110|426|3516|3748|3844|3909|457|58|59|21783|59|498|3813|436|454|463|484|3956|57|58|59|22000|3363|3475|23017|3643|3827|24682|3813|25618|3976|57|26488|3595|3868|479|3928|443|27765|28071|29235|110418|22579|481|53|54|55|56|58|59|26261|493|3498|59|3705|58|410|53|55|59|423|59|430|53|55|58|441|451|54|463|54|57|470|57|485|491|53|54|57|58|3826|57|58|430|56|59|447|462|488|28472|53|54|485|100916|21018|3556|3631|22025|449|3520|448|3617|444|55|3832|491|24102|3915|25146|472|3295|3619|3778|3973|54|55|26390|3474|3554|496|57|58|3649|466|57|3918|27193|3231|3488|3580|3639|3767|59|471|57|28004|3167|3389|3484|3595|29036|112575|482|26296|3878|481|52|53|55|494|55|56|59|3903|57|410|53|54|55|57|58|59|434|458|27184|100272|3590|3733|3903|460|51|21487|3537|58|59|22202|53|3309|423|3682|3957|23402|53|420|3894|3921|24360|25067|3630|448|476|481|498|3705|461|59|484|3871|3948|460|54|471|483|26433|450|480|490|3599|27047|477|3367|3503|3640|3760|472|3901|410|431|54|458|28080|3160|3353|466|3636|3753|29031|57|58|440|52|450|3211|3543|112572|53|54|56|57|58|25824|55|26943|56|459|476|59|485|59|491|53|54|55|56|57|58|59|27000|51|52|53|54|55|56|57|58|59|410|54|55|28475|56|57|59|480|51|52|53|54|3582|100370|3845|22028|435|3425|3537|3611|446|3748|472|3966|23219|24077|3718|25110|3430|3928|461|26221|3314|491|3423|3573|3601|3832|480|27218|460|3486|3523|3642|3768|3831|457|3945|28111|450|3213|453|3478|3854|477|3969|29044|112564|55|59|470|51|26926|27011|52|53|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|460|3410|28486|57|58|59|100083|3273|3550|21460|3970|22348|3892|57|3929|465|23176|3335|57|3409|3631|24565|478|3799|3845|25215|3488|3717|3963|55|59|26130|3728|3850|474|3917|27293|3302|3414|454|3570|3607|58|3775|56|3836|3929|28758|3939|29128|3554|3952|110068|21704|55|22556|58|59|461|52|53|56|57|58|27034|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|465|474|480|55|493|57|3102|54|56|422|28490|103171|3574|480|3687|3915|24172|3503|54|467|3651|483|3720|25690|3826|3916|424|26244|3388|3440|499|3508|464|3604|3875|27092|3130|3236|3324|450|3582|3615|420|431|52|441|53|55|57|59|476|59|3828|481|492|3973|28260|3407|477|3565|3678|3797|3876|3964|29046|112551|52|53|55|460|26297|27114|435|58|458|467|478|489|491|52|53|54|55|57|58|3200|412|56|57|59|424|434|102005|3204|55|3940|23099|3429|442|3524|3751|3923|440|24123|3568|59|3860|25108|3239|3494|3650|3783|3822|488|3921|52|467|26223|3606|27033|3114|3313|432|3569|485|3609|411|3787|3893|28237|3431|3654|110420|22496|57|3554|27228|430|52|53|442|54|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|28491|100337|3468|3592|3602|445|21129|456|22052|3102|3314|3497|3989|23322|3481|3618|465|3977|24085|3380|55|3571|3817|25091|3188|3493|3561|53|3847|3907|26235|481|3445|3559|493|3830|449|3992|27165|56|3244|457|461|52|496|3562|474|3633|54|55|56|57|58|446|58|462|3842|3976|28003|3139|3263|3421|3574|3699|3830|29246|112499|3500|54|26298|27267|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|100780|21282|3675|3826|22374|3595|3978|23166|3581|3649|24941|25245|479|3772|496|3815|468|3941|26538|472|3780|27357|28851|496|29048|3372|110018|22498|3501|52|53|55|56|57|410|52|53|27287|58|59|490|51|52|53|54|55|56|57|58|59|3301|52|53|54|55|56|57|100499|3628|456|21794|3849|496|22037|3238|461|3310|3512|23165|477|3467|3582|3748|3820|25408|412|447|3502|3609|496|3902|27317|471|3499|3629|28084|3707|3865|3978|29679|3759|112508|411|24413|54|57|58|59|420|51|52|53|54|55|56|57|58|59|431|3586|58|490|51|53|54|56|58|3698|59|3700|51|53|54|55|57|26271|100640|22206|57|3377|482|3492|3556|3905|464|23021|3134|3904|431|24265|25040|3213|3403|466|3543|3825|26556|3857|58|27299|3504|3621|53|54|55|57|58|430|28246|3781|3941|112514|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|53|54|55|56|57|450|24432|54|55|56|59|440|51|53|54|55|57|58|59|453|54|56|3599|3600|51|492|54|55|56|57|101995|22109|3531|480|3862|23095|3330|3492|25775|3910|457|26200|3361|3489|3540|3650|27056|3477|28494|112538|59|440|51|52|55|56|57|58|24460|51|54|59|470|51|52|53|54|480|3603|54|491|27235|100567|3768|22975|23779|24429|25039|480|3468|3505|26234|27439|3541|459|112464|55|3544|59|24477|58|59|481|52|53|3535|3605|58|59|410|51|53|55|56|57|423|54|489|102903|443|460|24006|3144|3572|3634|25736|26511|27147|496|3459|3692|28745|112466|478|24484|55|58|59|490|51|52|3501|3618|421|485|56|57|100635|3866|499|3913|21739|3810|51|59|22430|3688|3746|3934|23243|484|3301|427|3422|3511|3646|3717|435|495|3860|3909|439|473|488|24221|476|3333|3432|457|3638|3719|495|3858|25072|3369|478|3425|453|469|498|3506|59|411|436|3657|480|495|3755|3849|3909|432|26371|3696|3741|27160|3204|3837|3905|436|58|28038|468|3127|452|474|59|489|3318|483|3401|3503|457|461|3640|53|450|59|492|3705|3853|470|3923|471|29255|3458|475|3550|470|3672|58|495|3832|480|51|3956|110066|493|59|22135|3377|3408|469|470|51|59|24502|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|3664|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|100080|3294|3350|465|3500|3664|23245|3863|24028|3192|3323|25038|3168|3387|3422|433|461|491|3504|416|483|58|3611|440|468|3729|3865|26079|3336|468|3584|3680|27194|3308|428|3900|457|28008|445|478|3123|3211|3591|3856|3949|450|29276|3411|440|460|55|493|3534|3683|3713|57|449|3802|426|435|3934|487|110109|22115|3386|490|3467|58|472|53|56|480|51|52|53|54|55|57|494|55|24519|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|57|58|59|440|51|52|53|54|55|56|3652|53|54|55|56|57|58|59|461|52|53|101796|3856|22024|450|3101|3737|473|3803|418|423|56|59|430|54|443|56|471|3917|58|439|447|23008|3135|56|473|480|51|3220|456|489|3352|53|57|58|468|476|498|3480|3621|436|58|450|475|3725|482|3817|58|425|443|469|3989|24024|469|480|498|3122|431|468|481|3206|422|3310|475|56|3495|3667|3704|469|472|54|484|3800|421|490|52|53|54|3904|56|410|423|431|25021|57|59|443|3106|57|441|458|3360|53|474|56|57|481|52|53|56|58|490|51|54|55|56|57|3401|55|56|57|410|51|57|58|420|51|54|56|59|431|52|442|56|452|462|471|53|499|3503|417|59|420|59|430|58|460|52|54|57|484|55|57|3606|58|415|57|421|58|431|54|482|497|3718|421|450|56|59|476|57|482|55|56|3818|428|434|56|440|56|452|461|56|478|490|51|52|57|3935|56|451|54|55|26073|3188|3251|461|3319|3484|3505|414|3682|3749|459|3885|3902|467|27010|493|3102|417|435|59|440|51|54|55|456|464|479|483|3211|52|59|423|59|437|59|443|452|465|59|495|3314|449|461|3415|428|441|450|51|56|487|495|56|3527|475|486|57|494|3605|56|416|451|471|498|3835|466|470|483|490|3964|472|57|494|28033|448|454|491|54|56|57|3134|56|464|471|483|3232|474|3300|412|420|3404|410|420|3500|431|59|440|460|56|472|57|493|3639|441|59|458|475|57|486|494|56|3735|462|54|498|59|3855|469|479|483|54|3917|58|59|442|53|55|58|468|29220|445|457|58|3373|57|482|497|59|3401|56|416|57|420|52|53|54|55|59|434|442|53|54|55|57|451|53|56|461|52|54|56|497|58|59|3500|58|413|55|421|56|437|59|456|57|58|462|53|471|54|55|59|486|491|3600|52|410|51|58|432|53|54|55|56|57|441|57|455|58|460|58|470|55|57|491|52|54|3701|53|56|57|59|414|58|424|55|57|58|432|54|55|56|58|440|51|52|53|56|465|58|59|473|58|481|56|57|58|493|3808|422|55|438|59|443|57|58|59|454|460|58|473|57|489|499|3909|418|421|430|51|52|57|58|59|446|59|450|51|57|59|466|57|474|56|58|480|51|110009|412|55|420|55|59|436|447|450|56|59|465|57|479|482|55|57|58|491|52|54|3102|56|58|411|436|58|3269|471|53|3592|21657|460|54|55|486|59|22111|54|57|421|54|430|54|58|444|55|451|56|465|58|59|470|51|52|3356|57|58|59|460|53|54|55|56|57|58|59|471|52|54|55|58|59|480|51|52|55|57|59|491|52|53|54|57|58|3401|53|54|55|56|410|474|486|58|59|490|51|52|24547|59|467|3632|54|55|56|57|59|440|52|54|56|57|58|59|450|51|25458|28546|100800|21482|3992|56|22012|421|52|430|59|461|52|57|478|482|3103|3560|3809|425|438|445|459|467|3921|55|467|23026|3199|3211|430|58|450|3317|424|464|3424|3655|481|3768|3804|421|486|24004|450|3393|3419|439|3573|3639|493|3721|3955|25032|3119|456|485|3455|472|3518|3663|3730|26176|3266|3523|3754|3843|27115|59|433|448|451|52|489|3213|54|422|445|3330|3410|3505|56|415|465|3644|458|497|3703|3850|3981|28231|3417|499|3502|419|445|3651|3959|29241|3404|415|446|452|3523|55|58|473|496|3603|439|440|3710|3809|428|436|470|51|52|3954|110051|3103|415|56|3268|21674|483|55|22122|58|431|440|457|3362|476|499|3475|57|493|24566|58|59|470|51|52|53|104334|25012|26803|27967|29428|112543|24574|55|56|57|58|59|480|51|52|53|54|3625|56|58|59|430|51|104574|25886|26005|27425|28903|29733|115291|52|53|55|3310|51|52|55|57|428|432|56|58|441|52|54|56|58|450|55|57|59|461|57|59|471|54|3976|28492|102729|23719|24017|492|3449|3633|25125|3218|27240|28456|490|3947|115379|3981|493|26002|55|59|420|58|449|467|471|486|494|55|3103|57|418|28493|102991|23101|26399|3785|27656|28899|115395|58|3405|57|412|54|424|58|438|443|56|59|450|51|56|460|51|53|57|471|54|58|481|57|59|496|3502|54|56|28494|103204|26446|3794|27990|28878|29092|53|115519|420|55|57|58|59|430|52|53|54|55|56|58|440|58|59|451|53|57|462|55|58|473|57|59|481|52|55|56|57|59|492|3602|53|57|413|101593|22265|23876|24814|25480|26608|27335|3952|115620|53|59|433|55|58|442|58|452|58|463|58|473|58|481|57|105045|26290|3995|28043|115699|3703|57|412|458|59|460|51|52|53|54|56|57|58|102616|23319|26383|27278|28778|29410|3616|112159|25769|470|51|53|54|55|56|57|58|59|481|53|102828|23331|442|3889|24284|26541|3609|3863|27516|28543|3732|115784|55|57|58|59|490|51|52|53|54|55|56|57|58|59|3800|51|103430|3585|24018|489|25372|3448|26695|27895|28064|3270|114228|25802|53|54|55|56|57|58|59|410|51|52|485|490|55|58|3906|100613|3734|443|22014|23620|24036|25665|26072|27509|3610|115910|53|431|55|56|57|58|59|453|105603|27846|3950|28168|3722|114219|422|54|57|430|52|53|3389|491|52|101463|54|3803|434|22254|3700|474|28397|114235|56|58|440|3393|54|102476|23175|24355|27540|468|3677|114242|54|58|450|53|56|58|460|53|54|3396|57|100963|54|21767|23328|24088|3364|3523|475|25923|26889|27460|112149|24267|59|472|56|58|3398|101541|52|3873|3963|54|55|23253|24173|25672|27579|3752|3802|447|114280|52|56|497|58|59|3300|51|52|499|3401|105933|27206|3457|3815|28867|110040|24303|54|55|3409|410|51|102236|23366|24692|25081|27253|494|3339|3685|29754|55|114308|410|52|3407|58|103022|26704|27376|29097|114314|55|56|57|58|420|52|53|3406|103902|26438|3510|486|3644|112129|24330|51|54|56|58|59|440|52|3405|101569|3831|22340|3696|3911|25336|3623|26212|3848|27250|51|3603|482|28357|29418|433|490|52|54|56|3541|3653|487|3748|483|3833|493|3989|110006|444|55|473|497|3231|21694|22132|446|3411|55|57|58|23774|24344|56|57|59|450|51|55|58|461|52|54|473|54|485|3403|101244|22851|23182|3746|24097|3286|3695|3767|25203|3458|489|3512|434|3765|26458|3521|3657|478|485|3711|492|3964|27132|471|58|3203|55|430|441|454|3307|440|459|493|57|3411|427|433|462|3519|432|444|56|57|450|52|3601|52|453|57|487|58|3834|3971|28285|3492|55|3509|471|3746|490|53|29219|428|3375|481|54|55|58|491|52|55|56|3409|426|435|56|441|59|457|471|52|53|56|57|58|487|58|3503|54|57|410|56|57|420|52|54|433|55|448|451|55|59|467|476|57|483|55|58|3605|57|412|53|57|420|54|55|59|430|51|58|442|56|58|59|456|59|469|471|54|56|485|56|493|56|3708|416|422|56|437|59|450|51|57|58|463|54|482|59|495|3803|57|412|57|58|59|421|54|59|431|441|52|54|450|52|58|461|52|54|57|474|485|56|491|58|3904|55|414|426|435|56|444|458|463|54|491|58|59|110000|51|52|54|57|58|416|423|54|437|59|441|56|463|54|472|54|483|490|56|3100|51|54|410|52|456|59|3221|59|470|52|21023|3658|59|466|57|58|470|51|52|53|480|54|491|53|56|3702|22110|53|56|58|433|56|59|442|452|58|3421|53|54|55|58|430|56|58|59|453|58|462|23760|51|52|53|54|55|56|57|58|59|470|51|52|53|55|56|3812|54|421|57|443|480|55|493|3967|479|490|102914|487|492|23294|3474|3613|485|3885|24190|3219|456|3412|3541|476|3710|3973|25385|3829|26495|3718|27118|443|481|3514|422|58|434|59|3670|3817|28035|3241|3770|29378|59|487|493|3432|448|454|463|59|479|481|495|3509|411|54|59|442|468|478|481|52|492|3615|427|444|3700|54|415|420|53|59|430|474|57|59|480|490|52|59|3800|413|430|451|465|487|492|57|3903|423|54|493|54|55|110017|430|58|461|476|57|486|21656|461|53|481|57|22112|423|56|57|437|443|57|58|450|53|54|55|460|52|3412|54|440|52|53|54|57|59|451|52|54|460|51|23975|103847|25546|26353|3610|27242|3442|28239|29100|3412|3518|449|460|3626|454|3721|3882|3927|110053|3124|21692|22455|106893|27199|29376|3564|3747|3801|3901|460|110130|59|3228|21703|56|422|23980|104342|25515|27379|3551|3700|52|29623|467|110058|3119|433|440|52|53|3210|436|463|101204|24076|481|3314|3442|3564|56|25078|3250|3302|54|432|53|440|3514|26813|27696|3701|29484|3622|58|110113|57|58|420|51|52|53|55|56|59|431|52|54|57|441|54|55|56|59|450|51|52|54|55|57|460|52|53|54|55|57|59|470|51|52|54|55|56|57|58|59|480|51|52|54|55|56|57|59|490|51|52|53|59|3211|53|55|56|57|58|59|420|52|54|55|56|57|430|52|55|57|59|440|52|57|58|451|52|55|56|57|58|59|460|21532|53|3682|22119|3463|23981|52|53|54|55|56|57|58|59|491|52|109888|110114|427|58|435|447|453|58|466|497|3202|53|58|21503|54|106352|29421|480|3752|3816|446|27855|28471|29512|3489|3680|110107|3057|489|109796|111677|109983|3853|118526|109953|3775|110022|3428|28285|109719|110028|109784|3977|3834|110105|3055|109878|3900|455|3547|3650|482|3770|3869|110075|109455|3529|3798|3823|3913|490|3856|3911|472|3468|3876|3595|3608|3756|3875|483|110013|109697|3884|495|3910|443|470|110042|478|21690|109969|497|110033|470|25096|27556|109771|3965|110052|109403|413|111695|109975|110084|21675|59|109797|3855|3580|110005|109962|3505|487|3690|3879|3971|412|110098|27300|109776|485|3863|110031|109459|482|3731|3925|110010|51|21669|20060|495|109540|55|452|489|3857|3982|110021|21676|109427|3530|465|3601|3745|3902|484|110426|57|3617|21707|109766|3837|3491|3651|3814|3474|3527|3767|3827|3948|110027|109985|110043|3429|109419|3866|3906|445|110003|454|3430|21708|109712|444|3942|110049|109806|420|111688|109996|3859|110080|109908|447|468|110026|434|109920|3531|112754|28301|3456|3536|3296|100095|3111|52|53|54|58|424|435|445|57|464|474|489|3230|465|56|474|55|56|492|57|3308|59|425|435|56|448|452|57|460|472|487|3409|415|436|442|451|469|470|51|52|53|54|55|56|57|58|59|480|51|491|3517|58|59|420|51|52|53|54|55|56|57|58|59|430|451|493|3674|55|56|57|480|56|3704|58|435|467|470|56|485|493|3811|53|56|57|58|425|430|55|441|52|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|490|3901|421|52|53|54|57|445|454|465|56|57|21000|468|471|3109|410|56|57|58|420|51|52|55|56|430|51|52|53|54|55|56|57|58|59|440|51|52|53|454|480|51|52|490|56|3203|58|443|58|451|53|57|460|51|52|470|52|492|3306|410|57|433|454|56|57|465|56|58|470|51|52|490|51|3426|440|51|52|55|456|58|59|465|56|471|493|3502|55|414|56|58|426|59|432|53|440|53|54|55|56|57|58|59|450|51|52|53|54|3614|428|59|430|52|53|54|55|56|57|496|3731|54|55|3913|453|54|460|51|52|56|57|58|22032|440|463|484|56|3110|51|52|53|54|55|56|57|58|59|420|51|52|54|55|56|3208|59|410|51|52|53|54|55|56|57|58|59|420|460|56|3305|453|469|470|55|3400|432|58|454|471|57|494|3500|52|57|411|430|446|59|450|3601|55|57|414|58|447|58|59|450|467|3701|421|475|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3800|51|52|420|464|490|58|59|3912|59|420|433|56|58|442|454|468|482|53|58|499|23015|56|423|57|58|59|430|51|52|53|54|55|56|57|58|59|440|475|486|498|3108|413|54|58|422|53|54|430|57|440|52|54|56|57|472|486|490|58|3210|52|53|58|421|54|432|56|57|441|57|59|454|55|460|53|54|55|57|58|471|52|53|59|481|57|497|58|3307|58|410|53|55|421|56|438|441|456|59|460|470|53|57|489|3406|411|54|58|421|56|437|59|443|56|459|460|53|58|483|55|56|58|496|57|3504|412|55|421|55|431|442|55|57|58|453|54|58|461|58|472|483|54|56|58|59|492|55|3603|56|415|56|430|53|54|57|445|58|451|52|59|461|53|54|58|477|483|59|3701|57|410|54|55|423|56|432|53|447|452|463|54|472|53|54|483|490|51|58|59|3801|52|438|59|449|455|58|462|474|487|491|3914|58|424|56|57|58|59|430|54|441|53|55|57|58|59|450|55|464|55|472|58|480|53|54|490|53|56|57|58|59|24000|52|55|57|58|427|430|57|58|452|53|55|56|465|56|490|53|54|3107|415|56|58|420|51|434|55|58|440|51|451|56|58|470|51|58|484|495|3218|423|430|52|53|54|445|57|452|58|468|471|53|55|57|59|489|490|53|3302|53|56|58|411|53|421|56|57|431|52|440|55|58|452|53|54|59|461|56|58|479|492|56|3410|54|55|421|58|437|58|440|53|57|58|458|465|56|470|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|58|490|51|53|3500|51|52|57|58|59|411|54|57|58|420|51|59|430|51|52|54|59|443|55|57|58|59|450|470|57|59|480|56|57|58|59|491|53|54|55|56|57|58|59|3600|51|52|53|54|58|410|54|55|56|59|425|56|59|430|440|53|54|56|452|463|56|470|53|56|58|485|56|59|490|57|3700|55|412|55|422|58|430|51|52|54|55|57|441|54|459|479|485|57|494|3801|411|52|56|431|53|56|444|463|55|58|474|55|485|496|3913|433|55|58|443|56|457|464|57|471|52|55|56|59|481|57|496|25003|411|55|58|422|448|460|475|483|498|3105|411|58|426|57|58|442|55|459|461|56|476|480|492|55|3206|410|431|52|442|58|453|54|59|460|51|53|55|56|57|58|59|470|51|52|53|54|57|484|58|491|53|54|3305|57|58|59|410|52|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|54|443|56|450|51|53|57|462|3441|476|482|53|57|490|3540|51|52|459|469|471|52|54|481|498|3605|412|54|420|56|432|56|442|454|56|469|485|492|3700|420|441|52|463|54|56|57|479|493|3800|51|54|410|54|56|420|432|53|58|59|442|457|58|59|477|489|3904|414|425|57|444|462|56|58|470|52|59|485|494|56|59|26001|52|53|54|56|410|51|52|53|54|55|56|57|58|420|52|53|55|56|57|58|59|430|53|57|58|59|440|51|52|53|54|55|57|58|59|451|52|53|57|460|51|53|54|55|481|57|494|59|3117|425|58|449|455|461|52|54|472|482|494|3215|58|420|439|441|55|59|457|482|53|54|58|491|53|55|56|57|58|3304|56|58|59|411|52|53|55|420|56|433|59|444|462|59|474|3406|410|56|421|3522|437|445|457|481|52|3600|52|53|411|52|53|54|55|56|57|423|56|58|59|433|55|56|59|441|451|471|481|59|499|3705|59|415|422|54|431|462|470|57|483|58|59|495|3825|58|441|54|56|451|53|55|469|486|3901|59|411|52|53|54|55|56|59|420|51|53|54|55|56|57|432|56|57|58|440|51|52|57|59|450|51|53|55|57|58|461|53|486|498|27012|59|441|467|471|55|56|59|480|52|53|54|58|495|59|3107|420|457|468|474|492|58|3224|55|56|438|447|59|458|466|472|490|3312|56|58|434|58|447|468|485|3430|54|455|58|483|54|55|490|3533|57|478|484|499|3618|452|499|3706|59|410|51|52|53|54|55|56|57|58|420|51|52|55|56|58|59|431|52|53|54|55|56|57|58|59|440|51|52|54|55|57|59|451|54|55|56|57|58|59|463|56|474|481|58|59|490|54|55|56|57|58|59|3800|51|53|54|55|56|57|58|59|410|51|52|54|56|58|59|421|52|53|55|56|57|59|439|467|475|57|484|55|56|497|59|3906|57|422|55|58|442|57|468|478|484|55|59|497|28001|430|52|54|440|459|460|52|57|475|486|498|3108|410|55|426|438|445|58|455|461|53|473|480|51|3202|55|416|438|443|59|465|477|480|59|491|54|3308|422|57|433|54|441|456|465|470|55|482|57|3416|58|423|56|57|432|53|55|56|440|457|58|462|55|57|58|472|485|3515|57|426|59|436|454|56|469|473|56|488|3605|416|59|429|437|444|58|455|57|489|490|3702|54|416|426|59|430|441|450|55|461|56|480|491|54|3802|54|420|52|58|59|437|447|473|495|3900|58|410|54|462|472|55|483|496|58|59|29002|53|54|56|410|52|53|54|56|59|420|51|52|53|54|55|58|430|52|53|55|443|55|57|59|451|52|54|55|56|57|58|59|460|51|52|53|54|55|56|57|59|471|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|54|55|56|58|59|3102|53|54|55|56|57|58|59|410|52|55|56|59|425|57|59|430|51|52|53|54|55|56|57|442|53|55|59|451|52|53|56|57|59|463|54|55|56|59|470|52|53|57|58|59|483|54|59|491|52|56|57|58|3202|56|59|410|52|58|438|440|460|53|54|59|3501|52|466|497|3665|56|489|499|3711|494|3815|440|3915|56|57|428|59|441|110069|471|481|3148|494|55|56|58|3200|51|54|55|56|57|414|423|433|54|443|55|56|450|53|462|54|55|57|474|55|56|57|58|59|480|51|52|53|56|57|58|59|490|51|52|53|54|55|57|3300|51|52|53|55|56|57|58|59|410|51|52|53|55|56|57|58|421|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3400|51|52|53|54|55|56|57|58|59|411|52|53|54|55|56|57|421|52|53|54|55|432|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3500|51|52|53|54|55|411|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|56|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|55|56|57|58|59|480|51|53|54|55|56|57|58|490|51|53|54|55|56|57|58|59|3600|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|53|54|55|56|57|58|59|3700|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3800|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|451|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3900|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|21000|51|52|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3200|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3300|51|52|53|54|55|56|57|58|59|410|51|52|53|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|471|52|53|54|55|56|57|58|59|480|51|52|53|54|55|56|57|3417|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|55|56|57|58|59|440|51|52|54|55|56|57|58|450|51|52|54|55|56|57|58|460|51|52|54|55|56|59|470|51|52|53|54|55|56|58|59|481|52|53|54|55|56|57|58|59|490|51|52|53|54|55|56|57|58|59|3500|51|52|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|57|58|434|55|56|57|59|440|52|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|56|57|58|59|481|54|55|56|57|58|59|490|51|54|55|56|57|58|59|3600|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|52|53|55|497|58|3700|51|59|411|52|53|54|55|56|57|58|59|420|51|54|55|56|58|59|430|52|54|58|440|51|54|55|56|57|59|450|51|52|53|54|56|58|460|51|53|54|55|56|57|59|471|52|53|54|55|57|59|480|51|52|53|55|56|57|58|59|490|52|53|54|55|56|57|58|59|3800|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|53|54|55|56|58|59|430|51|52|53|54|443|54|56|57|59|469|470|59|481|490|59|3901|54|56|58|59|410|52|53|54|55|56|57|58|420|54|55|442|482|54|22070|51|57|490|3106|463|56|473|56|481|55|57|58|59|490|51|52|53|54|55|57|58|59|3200|52|55|56|57|58|59|410|51|53|54|56|57|58|59|430|51|52|53|54|55|56|57|58|445|56|57|58|59|450|466|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|52|53|59|495|3307|58|59|410|51|52|59|420|52|53|54|55|56|57|439|440|51|52|53|54|55|56|57|451|52|53|3532|490|3613|450|3706|57|58|449|450|53|469|471|23048|3107|3268|3363|480|3451|55|3563|489|3618|423|3710|454|59|488|3899|3922|440|24071|3275|59|487|3306|57|425|58|468|472|3400|54|437|450|475|3714|59|425|3847|453|58|462|476|493|3941|25000|438|451|473|3153|478|495|3216|441|480|3319|437|3419|455|484|498|3509|444|484|493|3654|469|471|3780|3814|58|59|420|51|52|459|3943|26015|3139|459|460|51|53|54|55|56|59|470|51|56|57|3500|27426|455|3512|421|447|470|3602|413|430|475|3798|3835|465|3904|489|28008|3142|3341|487|3478|3522|53|54|55|57|58|59|431|52|53|55|58|59|440|51|52|53|54|55|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|56|57|58|59|480|51|53|54|55|56|57|58|59|490|51|52|53|57|59|3600|51|52|53|54|55|56|57","sep":"|"},{"d":"1894|1862|1824|1888|1838|1886|1826|1819|1875|1865|1764|1878|1840|1877|1916|1836|1905|1844|1864|1797|1851|1901|1801|1803|1942|1904|1850|1820|1902|1821|1856|1783|1874|1854|1791|1839|1774|1805|1929|1814|1852|1891|1892|1883|1834|1868|1827|1786|1770|1881|1872|1936|1842|1858|1889|NA|1798|1870|1873|1829|1768|1887|1726|1775|1825|1863|1837|1787|1859|1879|1832|1855|1841|1890|1899|1828|1885|1895|1848|1773|1861|1833|1867|1809|1810|1794|1789|1882|1871|1866|1812|1896|1806|1765|1823|1880|1799|1910|1778|1800|1767|1802|1909|1913|1857|1777|1849|1897|1903|1830|1853|1813|1835|1869|1911|1807|1908|1940|1847|1771|1772|1846|1766|1749|1784|1796|1918|1815|1876|1843|1945|1816|1769|1893|1822|1884|1898|1900|1915|1811|1788|1831|1763|1790|1782|1756|1675|1689|1804|1780|1760|1924|1817|1779|1907|1785|1933|1950|1792|1793|1750|1755|1776|1748|1845|1762|1761|1696|1562|1693|1781|1757|1939|1934|1860|1795|1922|1753|1758|1927|1931|1818|1912|1938|1917|1751|1744|2013|1808|1752|1919|1941|1926|1944|1921|1925|1690|1932|1906|1937|1914|1935|1670|1923|1928|1643|1747|1947|1743|1920|1746|1694|1697|1930|1601|1588|1691|1379|1630|1943|1741|1695|1692|1628|1985|1994|1995|1992|1990|2000|1975|1984|1991|1960|1998|1976|1966|1993|1982|1979|1989|1987|1997|1980|1971|1988|1983|1986|1973|2006|2007|1968|1969|1955|1981|1996|2005|2001|1978|2003|1956|1974|1946|2002|1958|1957|1999|2004|2008|1967|1306|1308|1549|1550|1594|1614|1633|1634|1637|1638|1639|1640|1649|1652|1666|1668|1683|1684|1685|1699|1703|1707|1709|1711|1724|1730|1754|1759|1949|1951|1952|1954|1962|1964|1972|2009|2010|2016|2017","r":"0*1,1*1,2*1,3*1,4*1,5*1,6*1,7*1,8*1,9*1,a*1,b*1,c*1,d*1,e*1,f*1,g*1,h*1,i*1,j*1,k*1,l*1,m*1,n*1,o*1,p*1,q*1,r*1,s*1,t*1,u*1,v*1,w*1,x*1,y*1,z*1,10*1,11*1,12*1,13*1,14*1,15*1,16*1,17*1,18*1,19*1,1a*1,1b*1,1c*1,1d*1,1e*1,1f*1,1g*1,1h*1,1i*1,1j*1,1k*1,1l*1,1m*1,1n*1,1o*1,1p*1,1q*1,1r*1,1s*1,1t*1,1u*1,1v*1,1w*1,1x*1,1y*1,1z*1,20*1,21*1,22*1,23*1,24*1,25*1,26*1,27*1,28*1,29*1,2a*1,2b*1,2c*1,2d*1,2e*1,2f*1,2g*1,2h*1,2i*1,2j*1,2k*1,2l*1,2m*1,2n*1,2o*1,2p*1,2q*1,2r*1,2s*1,2t*1,2u*1,2v*1,2w*1,2x*1,2y*1,2z*1,30*1,31*1,32*1,33*1,34*1,35*1,36*1,37*1,38*1,39*1,3a*1,3b*1,3c*1,3d*1,3e*1,3f*1,3g*1,3h*1,3i*1,3j*1,3k*1,3l*1,3m*1,3n*1,3o*1,3p*1,3q*1,3r*1,3s*1,3t*1,3u*1,3v*1,3w*1,3x*1,3y*1,3z*1,40*1,41*1,42*1,43*1,44*1,45*1,46*1,47*1,48*1,49*1,4a*1,4b*1,4c*1,4d*1,4e*1,4f*1,4g*1,4h*1,4i*1,4j*1,4k*1,4l*1,4m*1,4n*1,4o*1,4p*1,4q*1,4r*1,4s*1,4t*1,4u*1,4v*1,4w*1,4x*1,4y*1,4z*1,50*1,51*1,52*1,53*1,54*1,55*1,56*1,57*1,58*1,59*1,5a*1,5b*1,5c*1,5d*1,5e*1,5f*1,5g*1,5h*1,5i*1,5j*1,5k*1,5l*1,5m*1,5n*1,5o*1,5p*1,5q*1,5r*1,5s*1,5t*1,5u*1,5v*1,5w*1,5x*1,5y*1,5z*1,60*1,61*1,62*1,63*1,64*1,65*1,66*1,67*1,68*1,69*1,6a*1,6b*1,6c*1,6d*1,6e*1,6f*1,6g*1,6h*1,6i*1,6j*1,6k*1,6l*1,6m*1,6n*1,6o*1,6p*1,6q*1,6r*1,6s*1,6t*1,6u*1,6v*1,6w*1,6x*1,6y*1,6z*1,70*1,71*1,72*1,73*1,74*1,75*1,76*1,77*1,78*1,79*1,7a*1,7b*1,7c*1,7d*1,7e*1,7f*1,7g*1,7h*1,7i*1,7j*1,61*1,7k*1,7l*1,4o*1,5z*k,7m*1,5y*4,7n*1,67*2,62*1,7o*1,7p*1,7q*1,7r*1,7s*1,7t*1,5p*1,7u*1,7v*1,7w*1,7x*1,5m*1,42*1,7y*1,7z*1,80*1,43*4,5g*4,60*4,66*1,4p*5,5v*4,65*1,4n*1,5w*1,81*1,82*1,83*1,84*1,85*1,86*1,1q*18,87*1,64*2,5s*2,56*5,5u*2,5q*7,4j*8,3f*e,4g*6,55*5,59*a,4x*8,88*1,4h*5,41*3,4r*q,4y*s,89*1,46*d,4m*c,4l*t,3y*10,a*u,2l*s,3e*1h,2s*p,1o*1h,3o*n,1c*v,3b*1b,3c*1a,27*16,10*1w,1r*1c,4i*15,2x*r,2q*k,49*b,45*r,4q*13,40*1b,v*u,3g*1l,4b*11,1b*20,1v*1q,3w*1j,2e*11,3z*z,y*1d,4e*u,4f*x,2d*1d,4v*o,3h*x,j*13,1k*1s,2o*22,2r*14,m*r,2t*12,n*25,44*1r,11*y,2k*1b,37*1q,58*15,2b*1k,2c*1l,3v*2a,2i*1i,33*w,13*1h,3j*x,3n*1c,48*1e,51*1o,7*1j,r*1k,t*1s,3q*20,2m*15,2*20,1s*2y,6*1g,1a*z,23*21,1n*11,31*2h,3x*1g,1y*1v,29*2y,18*24,34*2l,f*1g,1u*2e,4*56,z*41,c*20,20*1i,1g*1o,3l*22,h*3e,4k*1a,3d*1v,3a*64,26*3d,2y*2x,q*44,k*2y,14*5w,32*4d,x*58,1z*31,u*3n,2w*2u,1h*56,1w*2p,4u*2d,28*7i,1*42,1t*1o,i*2p,9*3k,2h*2o,2a*58,19*3q,35*39,1l*42,2g*2c,1e*2q,1m*2w,w*3v,8*39,3k*2z,d*36,b*2a,1x*2c,2n*2j,1d*3y,2f*34,17*23,3r*1y,24*23,5*3f,1p*1o,3*1t,1i*22,21*2s,15*2w,16*3m,3p*2i,0*34,25*3d,2j*2u,2z*23,3s*24,22*2s,3t*29,l*2l,s*20,30*37,p*25,g*2e,5i*29,4a*1z,38*2h,2u*1l,2p*1x,36*2b,52*16,2v*10,5k*t,3u*42,e*39,54*fx,3i*3z,5a*n,5t*z,5e*u,4w*10,5n*17,47*o,5f*i,5c*k,4z*s,5o*r,12*j,5x*f,50*e,5h*i,4c*i,4t*o,5l*c,1f*f,5j*d,53*f,4s*1l,39*7w,5b*3i,o*l,63*f,5d*h,3m*3d,7a*f,5r*6,8a*1,4d*2,8b*1,8c*1,8d*1,71*2,78*2,7d*1,7c*2,6h*1,8e*1,8f*1,6k*1,7h*1,6z*2,70*2,6s*1,8g*1,6w*1,79*3,6e*6,6j*6,76*3,6n*2,6r*6,72*9,6m*6,6u*3,6f*3,68*4,6v*2,6p*2,6t*1,6o*5,6c*3,6g*4,6b*7,6l*2,69*8,6a*b,73*2,6q*3,6i*6,7e*3,6d*8,75*3,7b*1,77*3,7f*1,74*2,6x*1,6y*2,7g*2,8h*1,8i*1,57*3,8j*1,8k*1,1j*2jq","sep":"|"}]}]);
const COLONY = [
{"id":"n-95c4eb13","guard":[["not",["hasAny",["20170904t132143z","add","added","adjusted","angeles","annual","az","balance","birth","bound","category","cb","clean","compare","country","dearer","death","elections","episode","gmsl","greater","internet","janeiro","larger","lesser","loa","makes","massacre","observations","opendate","ounce","price","prices","smaller","sum","swimmer","title","trend","version"]]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The wreck no whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-c5423e30","guard":[["hasAny",["appears in","contains","element","includes","item number","no","nth","position"]],["has","year"]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The wreck no whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-423fb5cc","guard":[["hasAny",["element","item number","no","nth","position"]],["has","year"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-c51c3540","guard":[["not",["hasAny",["01638","181668","19510701","19640802","20100314","20101114","20161002","20161009","21549","add","added","adjusted","angeles","annual","author","az","birth","bound","category","cb","clean","close","compare","country","date","dearer","death","discards","dividend","emissions","episode","firefox","fuel","gmsl","greater","high","internet","larger","lesser","loa","makes","massacre","mean","national","observations","open","opendate","ounce","price","prices","rate","recreational","smaller","sp500","sum","swimmer","title","total","trend","uncertainty","updated","version"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-713c1977","guard":[["not",["hasAny",["01638","181668","19510701","19640802","20100314","20101114","20161002","20161009","21549","add","added","adjusted","angeles","annual","author","az","birth","bound","category","cb","clean","close","compare","country","date","dearer","death","discards","dividend","emissions","episode","firefox","fuel","gmsl","greater","high","internet","larger","lesser","loa","makes","massacre","mean","national","observations","open","opendate","ounce","price","prices","rate","recreational","smaller","sp500","sum","swimmer","title","total","trend","uncertainty","updated","version"]]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-79013b3f","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","no","nth","position"]],["has","year"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-76195e2a","guard":[["has","no"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1685 is the year of which wreck no":"The wreck no whose year is 1685 is W05707.","name the wreck no whose year is 1949":"The wreck no whose year is 1949 is W07855.","1699 is the year of which wreck no":"The wreck no whose year is 1699 is W08279.","which wreck no has the year 1639":"The wreck no whose year is 1639 is W04130.","1633 is the year of which wreck no":"The wreck no whose year is 1633 is W00918.","name the wreck no whose year is 1962":"The wreck no whose year is 1962 is W09775.","1759 is the year of which wreck no":"The wreck no whose year is 1759 is W01998.","1308 is the year of which wreck no":"The wreck no whose year is 1308 is W01901.","name the wreck no whose year is 2016":"The wreck no whose year is 2016 is W18536.","1637 is the year of which wreck no":"The wreck no whose year is 1637 is W01313.","which wreck no has the year 1594":"The wreck no whose year is 1594 is W00255.","1549 is the year of which wreck no":"The wreck no whose year is 1549 is W03578.","which wreck no has the year 1711":"The wreck no whose year is 1711 is W01224.","name the wreck no whose year is 1754":"The wreck no whose year is 1754 is W09144.","name the wreck no whose year is 1649":"The wreck no whose year is 1649 is W04544.","name the wreck no whose year is 1640":"The wreck no whose year is 1640 is W01367.","which wreck no has the year 1954":"The wreck no whose year is 1954 is W10107.","which wreck no has the year 1634":"The wreck no whose year is 1634 is W09168.","name the wreck no whose year is 1707":"The wreck no whose year is 1707 is W08463.","1964 is the year of which wreck no":"The wreck no whose year is 1964 is W10022.","name the wreck no whose year is 1614":"The wreck no whose year is 1614 is W09171.","name the wreck no whose year is 2009":"The wreck no whose year is 2009 is W09920.","1703 is the year of which wreck no":"The wreck no whose year is 1703 is W05278.","1652 is the year of which wreck no":"The wreck no whose year is 1652 is W06632.","name the wreck no whose year is 1972":"The wreck no whose year is 1972 is W10105.","which wreck no has the year 1951":"The wreck no whose year is 1951 is W09489.","which wreck no has the year 1638":"The wreck no whose year is 1638 is W02123.","which wreck no has the year 1952":"The wreck no whose year is 1952 is W09680.","which wreck no has the year 2017":"The wreck no whose year is 2017 is W18296.","name the wreck no whose year is 1306":"The wreck no whose year is 1306 is W00788.","which wreck no has the year 1730":"The wreck no whose year is 1730 is W05694.","which wreck no has the year 1724":"The wreck no whose year is 1724 is W01515."}}},
{"id":"n-50b82841","guard":[["hasAny",["change to","element","has","item number","name","nth","position","replace","substitute","swap"]],["has","wreck"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-c7edffcd","guard":[["hasAny",["change to","element","has","item number","name","nth","position","replace","substitute","swap"]],["has","wreck"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-47a12c3f","guard":[["hasAny",["element","has","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck no whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-7f21bbeb","guard":[["hasAny",["element","has","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-60409d42","guard":[["not",["hasAny",["added","adjusted","angeles","author","birth","bound","cb","country","elections","episode","larger","massacre","mean","portrait","price","smaller","sum","swimmer","title","trend","version"]]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["sense.after",{"lit":"is"}]],["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-858e6346","guard":[["hasAny",["appears in","contains","element","has","includes","item number","no","nth","position"]],["has","year"]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["sense.after",{"lit":"is"}]],["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-acd25d39","guard":[["not",["hasAny",["19640802","20100314","20101114","20161009","added","adjusted","angeles","annual","author","az","birth","bound","cb","close","country","discards","dividend","elections","emissions","episode","expo","firefox","fuel","gmsl","high","internet","larger","massacre","mean","national","observations","open","portrait","price","rate","smaller","sp500","sum","swimmer","title","total","trend","uncertainty","updated","version"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ec76c3f6","guard":[["hasAny",["delete","element","item number","no","nth","position","remove","strip out","without"]],["has","year"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-3b5148f6","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose year is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-444685e1","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-9b8ad21f","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-ebdca50e","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose year is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-073f2a93","guard":[["hasAny",["class name","element","item number","name","nth","pascal case","pascalcase","position","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-187503bb","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.plain",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-4b00a689","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.plain",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-59a6c377","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.number",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-5a734872","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-6655059a","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.listNums",["sense.numbers"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-b27a27db","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.listNums",["sense.numbers"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-db73e612","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.number",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-18354b95","guard":[["hasAny",["element","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose year is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-1b641782","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-2165a63b","guard":[["hasAny",["element","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-3e0af04e","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-7c248b1d","guard":[["hasAny",["as text","as words","element","has","item number","nth","position","written out"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.asText",["sense.numbers"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-bdc698c4","guard":[["hasAny",["element","item number","longest","longest one","longest word","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-c8d3f69c","guard":[["hasAny",["as text","as words","element","item number","name","nth","position","written out"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.asText",["sense.numbers"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-09b2955e","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-158ca2c2","guard":[["hasAny",["class name","element","item number","name","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-35107de1","guard":[["hasAny",["element","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.plain",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-3ae311ba","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-5099f263","guard":[["hasAny",["class name","element","item number","name","nth","pascal case","pascalcase","position","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-52ea8e62","guard":[["hasAny",["element","has","invert case","item number","nth","position","swap case","toggle case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-79f4aee7","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-87ccaff0","guard":[["hasAny",["element","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.listNums",["sense.numbers"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-955c93dd","guard":[["hasAny",["alphabetize the letters","element","has","item number","letters in order","nth","position","sort the letters"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.sortLetters",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-a03fa78b","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-a682b2ad","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-a85b5d22","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose year is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-da27f008","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-e6c02149","guard":[["hasAny",["element","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.number",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-e78a7456","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-e9dd96c1","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-19cab2af","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.number",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-2430026c","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-2586d0f1","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-4a029340","guard":[["hasAny",["each word","element","item number","name","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-4d18f46b","guard":[["hasAny",["each word","element","item number","name","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-5db55c7d","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-61cf2455","guard":[["hasAny",["as text","as words","element","item number","name","nth","position","shortest","shortest one","shortest word","written out"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.asText",["sense.numbers"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-6e323b08","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.plain",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-6f0e21e3","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.listNums",["sense.numbers"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-97fb2323","guard":[["hasAny",["camel case","camelcase","element","has","item number","lower camel case","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-9b1ff1e7","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-a6c4fe29","guard":[["hasAny",["element","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-c10594ac","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-c2a04c2e","guard":[["hasAny",["element","item number","longest","longest one","longest word","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-cf8245fb","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-163abab8","guard":[["hasAny",["element","has","item number","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-164639b5","guard":[["hasAny",["element","invert case","item number","name","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-2c595be0","guard":[["hasAny",["class name","element","item number","name","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-4250d832","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-4651713f","guard":[["hasAny",["element","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-51d8bda6","guard":[["hasAny",["each word","element","item number","name","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-75ab0f95","guard":[["hasAny",["element","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-8b97b34f","guard":[["hasAny",["as text","as words","element","has","item number","nth","position","written out"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.asText",["sense.numbers"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-a19b0b0c","guard":[["hasAny",["each word","element","item number","name","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-b8b533a3","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-c3215c95","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-da074a5d","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-092cd92b","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-11206fc0","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-129a517b","guard":[["hasAny",["element","has","invert case","item number","nth","position","swap case","toggle case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-2e4c7ad7","guard":[["hasAny",["each word","element","item number","name","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-664c5ad4","guard":[["hasAny",["each word","element","item number","name","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-7fd6cbf3","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-80bfc6e3","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.pascal",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-8cb5eeeb","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-b923ab4e","guard":[["hasAny",["element","item number","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-c374896a","guard":[["hasAny",["element","has","invert case","item number","nth","position","swap case","toggle case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-ca6b3fbb","guard":[["hasAny",["element","item number","name","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-e927e61b","guard":[["hasAny",["alphabetize the letters","element","has","item number","letters in order","nth","position","sort the letters"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.sortLetters",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-f5e3e50e","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","name","nth","position","shortest","shortest one","shortest word"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-05cf295d","guard":[["hasAny",["camel case","camelcase","element","has","item number","lower camel case","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-1c250d58","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-23cb9b0b","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-332644cf","guard":[["hasAny",["element","has","item number","nth","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-4601d883","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-52db6d44","guard":[["hasAny",["each word","element","item number","name","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-73e414ae","guard":[["hasAny",["each word","element","item number","name","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["aggregate.shortest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-94de6836","guard":[["hasAny",["element","first n","has","item number","nth","position","take","top"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["render.and",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-dee8a62c","guard":[["hasAny",["element","first n","has","item number","nth","position","take","top"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["render.list",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-fa8f3a4a","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-1966a888","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-732c3c59","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-60631c5d","guard":[["hasAny",["delete","element","item number","no","nth","position","remove","strip out","without"]],["has","year"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-a6b206f9","guard":[["not",["hasAny",["01638","181668","21549","add","added","adjusted","angeles","annual","author","az","birth","bound","cb","close","compare","country","date","discards","dividend","emissions","episode","expo","firefox","fuel","gmsl","high","internet","makes","massacre","mean","name","national","observations","open","opendate","ounce","portrait","price","prices","rate","recreational","sp500","sum","swimmer","title","total","trend","uncertainty","updated","version"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-774bc451","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose year is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-81596c36","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.listNums",["sense.numbers"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-cfcd9da1","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.number",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-e687db1b","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.plain",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-43171806","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck no whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-ae72ce32","guard":[["hasAny",["as text","as words","element","item number","nth","of","position","written out"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.asText",["sense.numbers"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-226ea896","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose year is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-2993f238","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-2de551d3","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-3a5ac2d0","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-4d8d0ad6","guard":[["hasAny",["diagonal","element","hypotenuse","item number","nth","of","position","pythagoras","pythagorean"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.number",["compute.hypot",["sense.first"],["sense.wordCount"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-ec04a848","guard":[["hasAny",["diagonal","element","hypotenuse","item number","nth","of","position","pythagoras","pythagorean"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.number",["compute.hypot",["sense.first"],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-08ed7ac7","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-33c75ed0","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-3ef90ba3","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.listNums",["sense.numbers"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-4e19a2c1","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.number",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-628c5944","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.after",{"lit":"wreck"}],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-c3e332d2","guard":[["hasAny",["element","invert case","item number","nth","of","position","swap case","toggle case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-eb80da69","guard":[["hasAny",["class name","element","item number","nth","of","pascal case","pascalcase","position","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-fb329b78","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.plain",["sense.first"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-240998a7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","of","position","title case"]]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.title",["sense.after",{"lit":"wreck"}]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-3783a2e1","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-555b40f7","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-7aaefe7f","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-80684ddb","guard":[["hasAny",["as text","as words","element","item number","nth","of","position","written out"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.asText",["sense.numbers"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-83df421b","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-ad4bc500","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-b35cc237","guard":[["hasAny",["element","invert case","item number","nth","of","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The wreck ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.after",{"lit":"wreck"}]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-d9ed2362","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," no whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-2bb8fe4e","guard":[["hasAny",["diagonal","element","hypotenuse","item number","nth","of","position","pythagoras","pythagorean"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.number",["compute.hypot",["sense.first"],["sense.wordCount"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-5d2974e0","guard":[["hasAny",["diagonal","element","hypotenuse","item number","nth","of","position","pythagoras","pythagorean"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.number",["compute.hypot",["sense.first"],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-8f55472f","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-929525e4","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-a1e34253","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-3d055192","guard":[["hasAny",["class name","element","item number","nth","of","pascal case","pascalcase","position","upper camel case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.pascal",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-73525384","guard":[["hasAny",["element","item number","nth","of","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.after",{"lit":"wreck"}],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-7b24e8b1","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-9e224c85","guard":[["hasAny",["element","invert case","item number","nth","of","position","swap case","toggle case"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-bb986c26","guard":[["hasAny",["camel case","camelcase","element","item number","lower camel case","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]],"mem":null},
{"id":"n-41f86077","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-73b130d7","guard":[["hasAny",["element","item number","nth","of","position"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-81e1ab94","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-a4980702","guard":[["hasAny",["element","invert case","item number","nth","of","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["sense.after",{"lit":"wreck"}]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-cb35c01e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","nth","of","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["sense.after",{"lit":"wreck"}]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-cd1fa120","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]]]],"mem":null},
{"id":"n-f6a37bd2","guard":[["hasAny",["each word","element","item number","nth","of","position","split into words","words"]],["has","wreck"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," whose ",{"slot":2}," is ",{"slot":3}," is ",{"slot":4},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"}],{"lit":1}],{"lit":"fr-tidytuesday-wreck-inventory-c8fc4d"},{"lit":"year"},{"lit":"wreck no"}]],"mem":null},
{"id":"n-3c86b44a","guard":[["has","no"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"of"}]]],"mem":{"table":{"1685 is the year":"The wreck no whose year is 1685 is W05707.","1699 is the year":"The wreck no whose year is 1699 is W08279.","1633 is the year":"The wreck no whose year is 1633 is W00918.","1759 is the year":"The wreck no whose year is 1759 is W01998.","1308 is the year":"The wreck no whose year is 1308 is W01901.","1637 is the year":"The wreck no whose year is 1637 is W01313.","1549 is the year":"The wreck no whose year is 1549 is W03578.","1964 is the year":"The wreck no whose year is 1964 is W10022.","1703 is the year":"The wreck no whose year is 1703 is W05278.","1652 is the year":"The wreck no whose year is 1652 is W06632."}}},
{"id":"n-076a78cf","guard":[["hasAny",["no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1652 is the year of which wreck no":"The wreck no whose year is 1652 is W06632."}}},
{"id":"n-19c79ed9","guard":[["hasAny",["no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1308 is the year of which wreck no":"The wreck no whose year is 1308 is W01901."}}},
{"id":"n-1b9a84e5","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 1949":"The wreck no whose year is 1949 is W07855."}}},
{"id":"n-1e2146a4","guard":[["hasAny",["no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1633 is the year of which wreck no":"The wreck no whose year is 1633 is W00918."}}},
{"id":"n-2c59b3d4","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 1594":"The wreck no whose year is 1594 is W00255."}}},
{"id":"n-2e1aa570","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 1707":"The wreck no whose year is 1707 is W08463."}}},
{"id":"n-3ca004d2","guard":[["hasAny",["no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1964 is the year of which wreck no":"The wreck no whose year is 1964 is W10022."}}},
{"id":"n-4a5106c4","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 1306":"The wreck no whose year is 1306 is W00788."}}},
{"id":"n-4a7e980b","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 1730":"The wreck no whose year is 1730 is W05694."}}},
{"id":"n-518b3286","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 1954":"The wreck no whose year is 1954 is W10107."}}},
{"id":"n-529206fe","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 1711":"The wreck no whose year is 1711 is W01224."}}},
{"id":"n-5b12343e","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 1649":"The wreck no whose year is 1649 is W04544."}}},
{"id":"n-635e60df","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 1951":"The wreck no whose year is 1951 is W09489."}}},
{"id":"n-64be9790","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 1952":"The wreck no whose year is 1952 is W09680."}}},
{"id":"n-64e4e8df","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 1972":"The wreck no whose year is 1972 is W10105."}}},
{"id":"n-6d18a4eb","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 1754":"The wreck no whose year is 1754 is W09144."}}},
{"id":"n-83385e66","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 1962":"The wreck no whose year is 1962 is W09775."}}},
{"id":"n-87b72c93","guard":[["hasAny",["no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1699 is the year of which wreck no":"The wreck no whose year is 1699 is W08279."}}},
{"id":"n-89e4dd52","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 1640":"The wreck no whose year is 1640 is W01367."}}},
{"id":"n-8ad0b4f5","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 1614":"The wreck no whose year is 1614 is W09171."}}},
{"id":"n-9e3b9492","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 2009":"The wreck no whose year is 2009 is W09920."}}},
{"id":"n-a18240d1","guard":[["hasAny",["name","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the wreck no whose year is 2016":"The wreck no whose year is 2016 is W18536."}}},
{"id":"n-af147ee8","guard":[["hasAny",["no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1549 is the year of which wreck no":"The wreck no whose year is 1549 is W03578."}}},
{"id":"n-ce867800","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 1639":"The wreck no whose year is 1639 is W04130."}}},
{"id":"n-d01873bf","guard":[["hasAny",["no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1703 is the year of which wreck no":"The wreck no whose year is 1703 is W05278."}}},
{"id":"n-d4353bd2","guard":[["hasAny",["no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1685 is the year of which wreck no":"The wreck no whose year is 1685 is W05707."}}},
{"id":"n-e258ec41","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 2017":"The wreck no whose year is 2017 is W18296."}}},
{"id":"n-ee1116da","guard":[["hasAny",["no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1637 is the year of which wreck no":"The wreck no whose year is 1637 is W01313."}}},
{"id":"n-f5ce54f7","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 1724":"The wreck no whose year is 1724 is W01515."}}},
{"id":"n-f866f346","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 1634":"The wreck no whose year is 1634 is W09168."}}},
{"id":"n-fae4554d","guard":[["hasAny",["no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"1759 is the year of which wreck no":"The wreck no whose year is 1759 is W01998."}}},
{"id":"n-fc9abf39","guard":[["hasAny",["has","no","wreck","year"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which wreck no has the year 1638":"The wreck no whose year is 1638 is W02123."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"1685 is the year of which wreck no","expect":{"contains":["W05707"],"notRefusal":true}},{"q":"name the wreck no whose year is 1949","expect":{"contains":["W07855"],"notRefusal":true}},{"q":"1699 is the year of which wreck no","expect":{"contains":["W08279"],"notRefusal":true}},{"q":"which wreck no has the year 1639","expect":{"contains":["W04130"],"notRefusal":true}},{"q":"1633 is the year of which wreck no","expect":{"contains":["W00918"],"notRefusal":true}},{"q":"name the wreck no whose year is 1962","expect":{"contains":["W09775"],"notRefusal":true}},{"q":"1759 is the year of which wreck no","expect":{"contains":["W01998"],"notRefusal":true}},{"q":"1308 is the year of which wreck no","expect":{"contains":["W01901"],"notRefusal":true}},{"q":"name the wreck no whose year is 2016","expect":{"contains":["W18536"],"notRefusal":true}},{"q":"1637 is the year of which wreck no","expect":{"contains":["W01313"],"notRefusal":true}},{"q":"which wreck no has the year 1594","expect":{"contains":["W00255"],"notRefusal":true}},{"q":"1549 is the year of which wreck no","expect":{"contains":["W03578"],"notRefusal":true}},{"q":"which wreck no has the year 1711","expect":{"contains":["W01224"],"notRefusal":true}},{"q":"name the wreck no whose year is 1754","expect":{"contains":["W09144"],"notRefusal":true}},{"q":"name the wreck no whose year is 1649","expect":{"contains":["W04544"],"notRefusal":true}},{"q":"name the wreck no whose year is 1640","expect":{"contains":["W01367"],"notRefusal":true}},{"q":"which wreck no has the year 1954","expect":{"contains":["W10107"],"notRefusal":true}},{"q":"which wreck no has the year 1634","expect":{"contains":["W09168"],"notRefusal":true}},{"q":"name the wreck no whose year is 1707","expect":{"contains":["W08463"],"notRefusal":true}},{"q":"1964 is the year of which wreck no","expect":{"contains":["W10022"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
