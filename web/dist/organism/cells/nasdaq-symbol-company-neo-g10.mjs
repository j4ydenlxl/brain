// nasdaq-symbol-company-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"nasdaq-symbol-company-neo-g10","class":"nasdaq-symbol-company","generation":10,"lane":"neo","grownFrom":["which company has the Nasdaq symbol PDSB","what company is listed as MDRR","name the company trading on Nasdaq as IONR","which company has the Nasdaq symbol GRI","what company is listed as ECPG","which company has the Nasdaq symbol BYFC","which company has the Nasdaq symbol SORNU","which company has the Nasdaq symbol VIVK","what company is listed as CODX","name the company trading on Nasdaq as NODK","what company is listed as CRDO","what company is listed as JAGX","name the company trading on Nasdaq as DLHC","which company has the Nasdaq symbol TNMG","which company has the Nasdaq symbol ECBK","which company has the Nasdaq symbol CME","which company has the Nasdaq symbol INSG","which company has the Nasdaq symbol TECX","which company has the Nasdaq symbol RFAIU","which company has the Nasdaq symbol BWIN"],"version":1});

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
knowLoad([{"id":"nasdaq-listed","columns":["Nasdaq symbol","company"],"n":4338,"cols":[{"f":"0AACG|3I|4U|4W|3O|4U|4W|3P|4R|4U|4W|2L|2ME|2OI|3N|2PG|3L|2RD|1BAT|2CL|2EO|2LV|4W|2NB|2OS|2SI|2TC|3S|2US|2VC|3X|1CAA|4U|4W|3D|2B|2CL|3V|2DC|2ET|2FN|2GC|4U|4W|3L|4N|4O|2HC|3V|2IC|3U|3W|2LS|2MR|2NB|3T|2OG|3N|4W|2RS|3V|2T|3G|3U|2XP|1DAC|4U|4W|3G|3M|4G|4H|4I|4K|4L|4M|4N|4O|4Z|2BE|3T|2EA|2GM|2I|3L|2MA|2P|3T|2RX|2SE|4W|3K|2TN|2UR|3S|2V|3B|2XN|1EAQ|4U|4W|2BI|2C|2HL|3R|2I|3S|2MD|2NT|4W|2P|2RT|4W|2SP|4R|4U|4W|2VA|2YE|1FCG|2JK|4R|4U|2RI|4W|3M|2YA|1GCC|2EN|2IO|2MB|3H|2NC|4L|4M|4N|4O|4P|4Z|3T|2PU|2RZ|2YS|1HCO|2G|2MA|1IAI|2BZ|2DX|2FA|3C|3F|3U|2IO|4W|3R|2MD|4W|2OS|3T|2P|2RE|3G|3J|4W|3O|3S|3T|4P|2SP|4W|2XI|1KAM|3N|2BA|2TS|3X|1LAB|3R|2CO|2DF|4U|4W|3X|2EC|2F|3UU|4W|2GM|3N|3S|3T|2HC|2IS|4R|4U|2KS|3T|2LO|3R|3T|2M|3R|3S|3U|2NT|3Y|2OV|4U|4W|3Y|2P|3S|3X|4R|4U|4W|2RM|3S|2T|3I|3O|2VO|4W|2XO|2ZN|1MAC|4U|4W|3L|3N|3T|2BA|3R|2CI|3X|2D|2GN|2IX|2KR|2LX|2OD|4W|2PG|4Z|3H|3L|2RN|3X|2SC|3F|3S|3T|2TX|2ZN|1NAB|2DE|2GH|4W|3I|3O|2IK|3P|3X|2L|2NA|4W|3X|2PA|2TA|3X|1OSL|2UT|1PA|3C|4R|4U|2C|2EI|2I|2LD|3M|4W|2MC|4R|4U|3D|2OG|2P|3F|3N|3S|2RE|2UR|4R|2VO|2WC|2XT|4U|4W|2YX|1QB|2MS|2ST|1RAI|3Y|2BB|3E|4W|3K|2CB|3C|3I|4U|4W|3L|4R|4U|4W|3T|2DX|2EC|2GX|2HS|2KO|3R|2LP|2M|2OW|2Q|3Q|3T|2RY|2TC|4U|4W|3L|3NA|3V|3W|2VN|2WR|2XS|1SBP|4W|2LE|2MB|3L|2ND|2O|2PC|4R|4U|3I|3S|4W|4Z|2RV|2ST|2TC|3E|3H|3I|3L|4W|3S|2UR|2YS|1TAT|2CX|2EC|3R|3X|2GL|2HE|3R|2II|4U|4W|2LC|4L|4P|4Z|3O|3Q|4R|4U|4W|3X|2NI|2OM|3S|2PC|2RA|3C|3O|2TO|3T|2XG|2YR|1UBN|2C|2DC|2GO|2ID|2PH|2R|3A|3E|3OW|2TL|2UD|1VAH|3T|3V|2BH|3P|2GO|2IR|2LN|2NW|2O|2PT|2R|2T|3X|2X|3L|1WRE|1XG|3N|2IN|4R|4U|2ON|2SM|2TI|1YA|2TU|1Z|2I|3O|2TA|0BACC|4R|4U|2ER|4W|2FN|2ND|3F|4P|3L|3R|3X|2OS|2TRA|4K|1BBYW|2CP|2GI|2IO|2LG|4W|2NX|2OT|2SI|1CAL|3X|2BP|2CQ|4U|4W|2DA|2G|3WW|2IC|2ML|2PC|2RX|2TX|4L|4Z|2YC|1DCI|4U|4W|2MD|4W|2RX|2SX|2TX|1EAG|4R|4U|3M|3T|4W|2EM|3P|2LFA|4B|2NF|4W|2TR|4W|1FC|2RG|4W|3I|4W|2ST|1GC|2DE|2IN|2L|3C|3WW|2M|3S|1HAV|4R|4U|2F|3AL|4M|4N|4O|4P|2RB|2ST|1IAF|4W|2D|3U|3WR|4U|2IB|2LI|2OA|3T|4W|3X|2RD|2VI|4W|2XI|4U|4W|2YA|1JDX|2RI|1KHA|4R|4U|2NG|2R|2YI|1L|2BD|2DP|2FS|2IN|3V|2KB|2LN|2MN|2NE|3K|2RK|4U|4W|3X|2SM|2TE|2UW|4U|4W|2ZE|3R|4U|4W|1MBL|2EA|2GL|2HL|2M|2R|3A|3C|3N|1NAI|4W|2C|3WW|4Z|2GO|2KK|2R|2TC|3X|1ODI|2F|2KF|2LD|3T|2N|2OM|2SC|2T|3J|2XL|1PAC|4R|4U|2OP|4M|2RN|2YPM|4N|4O|4P|1RAG|3I|2BI|2CB|2EZ|4R|2FH|2ID|2KH|4U|4W|3R|4P|2LS|4W|3T|2NX|2RKU|2TM|4U|4W|3X|2UN|2VE|2ZE|1SAA|4R|4U|2BK|2EM|3T|2IN|2P|2RR|2VN|2Y|1TBD|4W|3T|2CS|3T|2DR|2LN|2MD|2OC|2Q|2SG|4U|2TC|1ULL|4W|2SE|4P|2UU|1VC|2FL|2S|1WAY|2B|3BP|2EN|2FG|2IN|2MN|1XBL|1YAH|2FC|2ND|2RN|2SI|1Z|2AI|4W|2FD|4W|2UN|0CAAS|2BA|3R|2C|3C|2DL|2E|3S|2I|3I|4U|4W|2KE|2LC|3M|2MP|3T|2N|2PN|4R|4U|3R|3S|2Q|3UU|4W|2R|3E|3G|3L|3T|2SH|3S|3T|3Y|2TL|4R|4U|3Y|1BAT|2C|2FV|2IO|2K|2LL|2NK|2RL|3S|2SH|2US|1CAP|3Q|4U|4W|2B|3G|2C|3C|3T|4U|4W|2D|2EC|3P|2G|3WW|2HH|2II|4U|4W|2LD|2NE|4P|2OI|2SI|2TG|2XI|4U|4W|1D|2IO|4W|2LX|2NA|3L|3S|2RO|4W|2T|3G|3TW|2W|2XS|2ZI|4P|1ECO|2G|2LC|3H|3U|3Z|2NN|3T|4A|3X|2PF|3L|3O|3S|3V|2RS|3T|2TX|3Y|2VA|1FBK|2FI|3N|1G|2ABL|2BD|2C|3F|4U|4W|2EM|3N|2NT|3X|2O|3N|2TL|3X|1HA|3D|3I|3R|4R|4U|2CI|3O|2DN|2EC|4U|4W|3F|2GA|2I|2KP|2MG|2NR|2PG|4R|4U|2R|3D|3N|3S|3W|2SCL|4M|4N|4O|4P|3N|2TR|4P|2W|2Y|3M|1IFR|2GI|3L|2IT|2NF|3G|4W|2RC|2SO|3S|2VB|1JMB|1LAR|2BK|3T|2DX|2FD|2GN|2IK|3R|2LS|2MB|3T|2NE|3N|2OV|2PS|3T|2RB|3O|2SK|4W|3T|2WT|2YM|1MCO|3SA|3T|2E|2MB|2ND|2PR|3S|3X|2RC|2TL|3V|1NCK|4W|2DT|2ET|3Y|2L|2OB|4P|2SP|3Y|2TB|3N|3X|3Y|2VS|2XC|3N|3U|1OAG|2CH|4W|3O|3P|2DA|3X|2FS|2GT|2HU|2IN|2KE|2LA|4R|4U|3B|3L|3M|2O|3T|4W|2RT|3Z|4W|4Z|2SM|3T|2YA|1PB|3I|2HC|2IX|2OP|2RT|2SH|3S|2Z|1RAC|4R|4U|4W|3I|3N|4R|4U|3Q|4R|4U|2BP|3U|2CT|2DF|3L|3O|2E|3SY|3X|2GO|4W|2IS|2MD|3L|4W|3T|2NC|3T|2ON|3X|2SP|3R|2TO|2US|2VL|3O|3S|2WD|3S|3V|1SAI|2BR|2CO|2GP|2HR|4W|2IQ|2PI|2Q|2TE|3L|2WC|2X|1TAA|4R|4U|3S|2BI|2KB|2MX|2NM|3T|2OR|2RM|3N|2SH|3O|2W|2XR|1UB|3WU|4W|2E|2LP|2PR|2RI|3R|3X|2VL|1V|2BF|2CO|2GI|2KD|2LT|2RX|2V|1WBC|2CO|2D|2ST|1XAI|4W|2DO|2II|4U|4W|1YAB|2CU|4W|2N|2PH|2RX|2TK|1ZFS|2NC|2R|2WI|0DAAQ|4U|4W|2IC|4W|3O|2KT|2RE|2SH|2VE|4W|1BCA|4U|4W|2GI|2VT|2X|1CBO|2GO|2OY|2TH|2X|1DI|2OG|1EFT|2RM|2TX|1FDV|4W|2LI|4W|2NS|4W|2SC|4W|2TX|1GICA|4B|3I|2NX|2XX|1H|2C|3NI|4L|1IBS|2OD|1JCO|2T|3WW|1KI|2NG|1LHC|2O|2PN|2TH|3R|2XY|1MAA|4R|4U|3C|2II|4R|4U|2LP|2RA|3C|1NLI|2MX|4U|4W|2TH|2UT|1OCU|2GZ|2MH|2O|2RM|2X|2YU|1PRO|2U|2Z|1RCT|2DB|4U|4W|2H|2IO|2K|2MA|2S|2TS|4W|2UG|2VN|1SAC|4U|4W|2C|2GN|3R|3X|2P|2WL|2Y|3WW|1TCX|2I|3L|2SQ|4R|4U|3S|3T|1UKR|4W|2O|3L|3T|1VLT|1WSN|2TX|1XCM|2LG|2PE|2R|2ST|1YAI|2N|3C|4U|4W|2OR|4U|4W|0EBAY|2C|2MT|2ON|1CBK|2HO|2OR|2PG|2X|3WW|1DBL|4W|2HL|2IT|2RY|2SA|2TK|2UC|1EFT|2IQ|1FOI|2SC|4P|3I|2TY|1GAN|2BN|2HA|4R|4U|3T|1H|2GO|2LD|2TH|1IKN|1JH|1LAB|2BM|2DN|2E|2MT|2OG|3X|2PW|2TK|3X|2UT|2VA|3N|3R|2WT|1MAT|2BC|2IS|4R|2L|2PD|1NGN|4W|3S|2LT|3V|2PH|2RD|4W|2SC|3G|2TA|3G|3X|2VB|3X|1OCN|2LS|2SE|4W|1POW|2RX|2SM|3N|1Q|2IX|2PT|1RAS|2IC|3E|3I|2NA|4W|1SCA|2EA|2LA|4W|3T|2OA|2Q|2TA|2YN|1TON|3R|2RA|2S|1U|2DA|4W|2RK|4R|4U|1VAX|2CM|2ER|2GN|3O|2LV|2O|3X|4U|4W|2RG|1WAV|4R|4U|2BC|2TX|1XC|2E|3L|2FY|2LS|2OZ|2PE|3O|2TR|2YN|4W|1YE|2PT|1ZGO|2PW|2RA|0FA|2BC|2C|3T|4U|4W|3WW|2MI|2NG|2ST|2TE|3N|1BDT|2GL|2IO|4P|3Z|2LA|3G|2NC|2YD|4P|4W|1CAP|2BC|2CO|2EL|2FS|2HL|2NCA|4N|4O|4P|2UV|1DBC|2MM|4U|4W|3T|2SB|2US|1EAM|2BO|2IM|2LE|2MY|2NC|2R|3A|4R|4U|1FAI|2BC|2IN|3V|2R|1GBI|4P|2C|3PP|2I|3I|4U|4W|3WW|2L|1HB|2TX|1IBK|2EE|2GR|3X|4U|4W|2NW|2P|2SI|3N|3V|2VE|3N|2ZZ|1JDI|4R|4U|4W|1KWL|1LD|3DW|2EX|2GT|2L|2NA|3C|3T|2UX|2WS|2X|3S|2Y|3E|3W|1MAC|4R|4U|3O|2BH|2FC|2NB|2ST|4W|1NGR|2KO|2LC|2RN|2UC|2WB|3D|1OCL|2FO|2RM|3R|3TY|2SL|2X|3A|3F|3X|4W|1RAF|2BA|3T|2D|2GT|2HC|2ME|4P|3I|3M|2NM|2OG|2PH|3T|2SH|3T|3X|2TT|2VO|1SBC|3W|2EA|2HP|4R|4U|2LR|3Y|2TR|2UN|2V|1TAI|4M|2CI|2DR|2EK|2FT|2H|3A|4U|4W|3M|2LF|2NT|2RE|1UFU|4W|2LC|3T|4P|2NC|3D|2SB|3E|4W|2TU|1VAV|2CB|2N|3NR|4U|1WAC|4R|4U|4W|2DI|2ONA|4K|2RD|3G|1XAC|4U|4W|2HO|2NC|0GABC|2IA|3N|4G|4I|4Z|2LT|2ME|2NX|2SS|2UZ|1BDC|2FH|2LI|1CBC|2GR|4U|4W|2L|3WW|2MG|2T|3K|1DC|2EV|2HG|2RX|2S|2TC|2YN|1ECC|4G|4H|4I|2G|3GL|2HC|2LS|2MI|2N|3B|3K|3VR|2OS|2RN|2VO|1FAI|4W|2S|2UZ|4W|1GAL|2R|3OW|1H|2RS|2XI|4U|4W|1IBO|4W|2FT|2GM|2II|2LD|3T|2PR|2TS|2W|3WR|4U|2X|3I|3XR|4U|1LAD|2BE|3S|2E|2IBA|4K|2ND|4W|3G|2OO|2PI|2RE|2SI|2UE|2XG|3Y|1MAB|2EX|2HS|2M|1NLN|3X|2PX|2SS|2TA|3X|1O|2AI|2GO|2OD|4N|4O|3G|4L|4M|4N|2SS|2VX|2W|1P|2AC|4U|4W|3T|4U|4W|2CR|2RE|3O|1RAB|4W|3L|3N|2CE|2DX|2EEL|2FS|2I|2ML|4W|2NQ|2OW|2PN|2RR|4W|2SD|2VY|2WG|1SAT|2BC|2HD|3R|4U|4W|2IT|3W|2M|2RF|4R|4U|3V|4R|4U|2UN|1T|2BP|2EC|3N|4U|4W|3RA|4R|4U|4W|2IM|2LB|2M|2X|1UAC|4U|4W|2RE|2TS|1VH|1WAV|2RS|1XAI|1YGY|2RE|3O|0HACQ|4U|4W|2FC|2IN|2LO|2O|2PN|2S|2VA|4R|4U|1BAN|4L|4M|4P|4Z|2CP|2IO|2NB|3C|2T|1CAC|4R|4U|3I|3T|2HL|2IC|4R|4U|2KT|2M|3A|4U|4W|2SG|2TI|2WB|1DL|2RN|4W|2SN|1ELE|3P|2PS|2RE|3Z|1FBL|2FG|2WA|1GBL|1HS|1IFS|2HO|2MX|2ND|2T|3I|2VE|1KIT|2PD|1LIT|2MN|2NE|2P|2XC|1MH|2R|1NNA|2RG|2ST|2VR|1ODO|2FT|2LO|4W|2N|3A|2OD|2PE|2UR|2VNP|3R|4W|2WL|1PAI|4W|2K|1Q|2I|2WWW|2Y|1RMY|2OW|2TX|2ZN|1SAI|2CS|4W|2DT|2IC|2T|3M|1TCO|3R|2FL|2HT|2LD|3M|2O|3O|2Z|3WW|1UBC|4W|4Z|3G|2CK|2DI|2HU|2IZ|2MA|2RA|3C|3N|2T|1VMC|4U|4W|1WBK|2C|3PZ|2KN|1XHX|1YFM|3T|2MC|2NE|2PD|3R|0IA|2CO|4U|4W|3Q|4U|4W|2RT|1BAC|4R|2CP|2EX|2G|2IO|2KR|2OC|2RX|1CCC|3M|2FI|2G|2HR|2LR|2MB|2ON|2U|3CW|3I|1DAC|4U|4W|3I|2CC|2N|2XX|2YA|1EAG|4R|4U|2P|2SC|1FBD|2RX|1GAC|4R|4U|2IC|1HRT|1II|3V|1KT|1LAG|2LR|4W|3U|4U|4W|2MN|2PT|1MA|2CC|3R|2DX|2KTA|2MP|3R|3X|2NM|3N|2OS|2PP|4P|2RN|3X|2SR|4W|2TE|3X|2UX|2VT|2XI|1NAB|3C|4R|4U|2BK|4Z|3S|3X|2CR|3Y|2DB|3I|3P|3V|2EO|2GN|2HD|2IO|2KT|2LF|2M|3B|3D|2NV|2O|3D|2SE|3G|3M|2TA|3C|3G|3J|3R|3S|3U|3Z|2V|3A|3E|3Z|1OND|3R|3S|2SP|2TR|2VA|1PAR|2DN|2FX|4U|4W|2GP|2HA|3XU|2M|2SC|3T|2VV|4U|4W|2W|3R|2X|3G|4U|4W|1Q|2MX|4W|2ST|1RD|3M|2EN|2HO|4R|4U|2IX|2MD|2ON|2TC|2WD|1SBA|2NR|4U|4W|2PC|3R|2RG|2TR|1TG|2HA|4U|4W|2IC|2OC|2RI|3N|1VA|2DA|4W|2F|2VD|1XHL|1ZEA|2M|0JACK|2GX|2KK|2NX|2TT|2ZZ|1BDI|2HT|2IO|2LU|2SS|1CAP|2SE|2TC|1D|2ZG|1EM|1F|2IN|2U|1G|1JSF|1KHY|1L|2HL|1MSB|1ONE|4R|4U|2UT|2YY|1RSH|2VR|1SM|2PR|1TAI|2TT|1UNS|1VA|1WEL|1XG|1YD|2NT|1Z|2XN|0KALA|3U|2RD|3O|2ZR|1BON|4U|4W|2SX|1C|2HV|4R|4U|1DK|3RW|2P|1E|2EL|2LYA|4B|2QU|2YY|4U|4W|1FFB|2II|4R|4U|1G|2EI|1IDS|3Z|4W|2NS|2TT|4W|1LAC|2IC|2RA|3S|2TR|2XE|1MB|2DA|2RK|2TS|1NDI|2SA|1OD|2PN|2SS|2YN|4U|4W|1PLT|2RX|2TI|1RAQ|4U|4W|2KR|2MD|2NT|3Y|2OS|2RO|2SA|2T|2US|2YS|1SCP|2PI|1TCC|2OS|2TA|2WO|4R|4U|1URA|2ST|1VHI|1XIN|1YIV|4W|2MR|2NB|2TX|1ZIA|0LAB|3T|2ES|2FA|4R|4U|2KE|2MR|2ND|4O|4P|2RK|2SE|3R|2TA|4U|4W|2UR|2WR|1BGJ|2RX|2TYA|4B|4K|1CCC|4R|4U|2FY|4W|2ID|2NB|2UT|1E|2CO|2DRU|3S|2E|2GH|3N|2NZ|2SL|2XX|1FAC|4U|4W|2CR|2MD|4P|2S|3T|2TO|2US|2VN|2WD|1GCL|2HL|2IH|2N|3D|2O|2VN|1HAI|2SW|1I|2CN|2DR|2EN|2F|3E|2LA|4K|4P|2ME|3N|4W|2N|3C|3D|3E|3K|2QT|2TE|3S|2VE|3N|1KFN|3T|2Q|2SP|4R|4U|1LYVA|4K|1MAT|2B|2NR|2RI|1NAI|2KS|2SR|2T|3H|2ZA|4W|1OAN|2BO|2CO|2GI|2NA|2OP|2PE|2T|3WW|2VE|3IU|1PAA|4U|4W|2BB|4U|4W|2CN|3V|4U|4W|2LA|2TH|1QDA|3T|1RCX|2E|2HC|2MR|1SAK|2BK|2CC|2E|2TA|3R|1TBR|2GO|3R|4U|4W|2RN|3X|3YW|1UCD|3Y|4W|2LU|2NG|3R|1VLU|2O|1WAC|4U|4W|3Y|2LG|1X|2EH|3O|2RX|1YEL|2FT|2TS|1Z|2MH|0MAAS|2CI|4U|4W|2GH|2KO|2MA|3K|3O|2NH|2R|3A|3PS|2SK|3S|2T|3H|3W|2YS|2ZE|1B|2AI|2BC|2IN|4L|4M|4N|3O|2LY|2NKO|2OT|2RX|2UU|2VI|4U|4W|2WM|2X|1CAH|4R|4U|2BS|2FT|2GA|4U|4W|2HB|3P|4P|3X|2RB|3I|2TA|1DAI|4W|2B|3H|2CX|4W|2GL|2IA|2LN|3Z|2RR|2WD|2XG|3H|1EDP|3S|2GL|2LI|2NS|2OH|2RC|2SH|4U|4W|3O|2TA|3C|4B|4I|4Z|2VO|4U|4W|1F|2I|3C|4L|3N|2P|1GEE|2IH|2N|3I|3X|2PI|2RC|3T|3X|2TX|2X|2YR|1IAC|4U|4W|2DD|2MI|2ND|2RA|3M|2ST|2TK|1KDW|4W|2LY|4R|4U|2SI|2TW|3X|2ZR|1LAA|4U|4W|3B|2CI|4L|3O|2EC|4W|2GO|2KN|2TX|2YS|1MED|2LP|2SI|2TX|4U|4W|2YT|1NDO|3R|3Y|2KD|2OV|2PR|2RO|2SB|4P|3T|2TK|3S|2Y|3WW|1OB|3BW|3I|3X|4W|2DD|2LN|2MO|2RN|2VE|1PAA|2B|2LT|2WR|1Q|1RAM|2BK|2CO|4U|4W|3Y|2DN|2EO|2KR|2LN|2M|2NA|3O|4W|2TN|2VI|3L|2X|1SAI|4W|2BI|4P|2EX|2FT|2GM|3Y|2LE|2S|2TR|1TAK|4U|4W|2C|3H|2EK|4W|3N|3X|2LS|2RX|2SI|2VA|1U|2ZE|4U|4W|1VBF|2IS|2ST|1WC|2H|2YN|1XCT|2L|1YFW|2GN|2PS|2RG|2SE|3Z|2X|3XR|4U|4W|1ZTI|0NA|2AS|2GE|2II|2KA|2MI|3M|4W|3S|4W|2TH|3R|2UT|2VI|3N|1B|2BK|2IS|3X|2N|2P|2RG|4R|4U|2TB|3X|1CEL|3W|2I|2MI|2NA|3O|2O|3OR|4U|4W|2PL|4W|2RA|2T|3Y|1DAQ|2LS|2RA|2SN|1ECB|2GG|2O|3G|3N|3V|4W|2PH|2RV|2SR|2UP|2WT|4G|4H|4I|4O|4P|2XM|3N|3R|4W|3T|1FE|3GP|2LX|1GEN|2NE|1HIV|4U|4W|2P|3BP|2TC|1ICE|3M|2KI|2OBW|2PG|2U|2VF|4W|2XX|1KLR|2SH|2TR|3X|1MAD|2FC|4Z|2IH|2P|3AR|4U|2RA|3K|2TC|1N|2BR|2DM|2E|2NN|2OX|1ODK|2EM|4R|4U|4W|2MA|2VT|4U|1PAC|4U|4W|2CE|2T|1RC|2DS|2IM|3X|2SN|4W|2XP|1SAI|4R|4U|4W|2IT|2LR|4L|2PR|2SC|2TS|2YS|1TAP|2CL|3T|2ES|2GR|2HI|2IC|2LA|2NX|2RA|3B|4W|3P|3S|4O|2SK|2WK|3O|4U|4W|1UAI|4W|2CL|4W|2R|2TX|2WE|1VAX|2CR|3T|2DA|2EC|2MI|2NI|4W|3O|2TS|2X|1WBI|2CL|4W|2E|2FL|2GL|2L|2PX|2S|3A|2TG|1XAT|4W|2GL|4W|2H|2L|2PI|3L|2ST|2T|3C|3S|3T|2XT|1YAX|2XH|0OABI|4W|2CC|4U|4W|1BA|3I|3WU|4W|2IO|2T|2X|1CC|3I|4M|4N|2FC|2G|3N|2LT|4R|4U|4W|2S|3AW|3L|2TV|2UL|1DD|2FL|2TX|2YS|1ESX|1FAL|2IX|2LX|2S|3SH|4O|1GGWZ|2I|1HAC|4R|4U|1IG|2M|3AU|4W|2O|3WW|1KTA|2UR|2YO|1LB|2ED|2LI|2MA|2OX|1M|2AB|2CL|2DA|2ER|3X|2H|2SE|1N|2B|3PO|4P|2C|3H|4U|4W|3O|3Y|2DS|2EG|3N|3W|2FO|4W|2MD|4W|1PAD|3L|2BK|2CH|2EN|4L|4W|4Z|2I|2K|2RA|3T|3X|2TH|3X|4W|2XS|1RBS|2GO|2IC|3O|3Q|4U|4W|2KA|3T|2LY|2MP|2RF|1SBC|2IS|2PN|3R|4U|4W|2S|2T|2UR|2W|1TEX|2GA|4U|4W|2LK|3Y|2TR|1UST|1VBC|2ID|2LY|1WLS|1XBR|4W|2LC|4G|4I|4L|4M|4N|4O|4Z|2SQ|4G|4H|1YSE|4R|4U|1ZK|3AP|0PAA|3C|4U|4W|2CB|3H|4U|4W|2GP|2HC|2L|3I|3O|4U|4W|2MT|2NL|3W|2RA|4W|3K|2SG|3W|2TK|2VM|3S|2X|2YO|3P|3S|3X|1BAM|2FS|2HC|2K|2LS|2M|3WW|2YI|1C|2AP|4U|4W|3R|2B|2LA|2RX|2SA|2T|3TU|4W|3Y|2VX|2YO|1DC|2D|2EX|2FS|2LB|2SB|2YN|1EBK|3O|2CE|4R|4U|4W|3O|2GA|2NG|3N|2P|3G|2RI|2SI|2TS|3Z|1FAI|2BC|2G|2IS|2SA|2X|3NZ|1GAC|4R|4U|2C|2EN|2NY|2Y|3WW|1HAR|3T|2IO|2OE|3S|2UN|2VS|1I|2CS|2II|4W|1KBK|2OH|1LAB|3Y|2BC|3L|3Y|2CE|3I|4R|4U|2MK|4U|4W|3R|2PC|2RX|3Z|2SE|3M|2TK|3R|2UG|3R|3S|3T|2XS|2YX|1MA|3X|2CB|2EC|2N|2TR|4U|4W|3S|2VP|1N|2BK|2RG|2TG|1OCI|2DC|3D|2ET|2LA|3E|4U|4W|2M|2NO|4R|4U|3Y|2OL|2WI|3L|3W|4P|1PBT|2C|3B|2HC|2IH|2LI|2SI|2TA|1RAA|3X|2CH|3T|2DO|2E|3NW|2FX|2GS|2HI|4Z|2LD|2ME|2OF|3K|3P|3V|2PL|3O|2QR|2SO|2TA|3H|3S|2VA|2ZO|1SEC|2HG|2IG|3X|2KY|2MT|2NL|3Y|4W|2QL|4W|1TAC|4U|4W|2C|3T|2EN|2GX|2LE|3O|2N|2ON|3R|4U|4W|2RN|1UBM|2LM|2RR|2SA|1VLA|1WCM|2P|2RL|1XLW|2S|1YPD|3L|2XS|1ZZA|0QADR|4U|4W|1BTS|1CLS|2OM|2RH|1DEL|1ETA|4R|4U|1FIN|1H|1LYS|1MCO|2LS|1NBC|2CX|2ME|2RX|2ST|2T|3M|1QQX|1RHC|2VO|1S|2EA|4R|4U|2I|1TEX|2I|2RX|2TB|1UBT|2CY|2IK|2MS|4R|4U|2RE|1VCG|1XL|0RACC|3D|2DX|2IL|3N|4W|2ND|3G|4R|4U|3I|2PP|2RE|2VE|2YA|1BB|3N|2CAA|2KB|2NE|1CAT|2BC|2EL|2KT|3Y|2MT|2ON|2T|1DAC|4R|4U|3G|4U|4W|2CM|2GT|2HL|2I|3B|2NT|3W|2VT|2WR|2ZN|4W|1EAL|3X|2BN|2CT|2FI|3R|2G|3CO|4P|3N|2KR|2LL|3Y|2NT|3X|2PL|2TO|2VB|4W|2YN|1FAI|4R|4U|3M|4R|4U|2IL|1GC|3O|2EN|2LD|2NX|2P|2S|2TI|4W|1IBB|4R|4U|2CK|2GL|2LY|4G|4L|4P|4T|4Z|2ME|2OT|2VN|1JET|1KDA|2LB|2TO|1LAY|2MD|2YB|1MBI|3S|2CF|3O|4W|2IX|2L|2NI|2R|2SG|4W|2TI|1NA|3C|3Q|4U|4W|3Z|2GT|4U|4W|2TX|2W|2XT|1OAD|2C|3K|2IV|2KU|2MA|2OT|2P|2ST|1PAY|2D|2GL|2ID|2RX|1R|2BI|2EV|4U|4W|2GB|2R|1SSS|2VR|1TAC|4U|4W|2B|1UBI|2M|3BW|2N|2SHA|4B|1VMD|4W|2SB|3N|4W|1WAY|4I|4L|1XRX|2ST|2T|1YAAY|2ET|2M|2OJ|2TM|1ZAI|2LT|3V|4W|0SAAQ|4U|4W|2BR|3S|4W|2FT|3X|2GT|2IA|3C|3H|4W|3L|2MG|2NA|3G|3M|2TA|3L|4W|1BAC|2C|3F|3WW|2ET|2FG|3M|4W|2GI|2LK|2RA|2UX|1CAG|4W|3TU|2HL|2II|4R|4U|2KT|2LX|4W|2NI|3X|2OR|2PQ|4U|4W|2SC|2TX|2WO|2YX|2ZM|1DA|3WW|2GR|2HI|4R|4U|2OT|2ST|4W|1EAT|4W|2DG|2ED|3R|2GG|2IC|2LF|2NEA|4B|3S|2PN|2RA|3V|2V|3N|2ZL|1FBC|2D|2HG|2IX|2M|2NC|2ST|2WL|1GA|2C|2HT|2LD|3Y|2ML|3T|2P|2RX|3Y|1HAZ|2BI|2C|2EN|2FS|4W|2IM|3P|2LS|2MD|4W|2OE|3O|3P|3T|4R|4U|2PH|1IBN|2DU|2EB|2FY|2GA|3I|4P|2LC|3O|2MA|4U|4W|3O|2NT|2ON|2RI|2TM|1J|1KHY|2IN|2K|2WD|2YA|4W|3E|3Q|3W|3X|1LAB|2BT|2DB|3E|3P|4W|2E|2GB|3L|2M|3BP|3T|2N|3G|3H|4P|2P|2RC|2S|3N|2XN|4W|1MBC|2CI|4P|2ID|2MT|2PL|2SI|2TC|3I|3K|2X|3T|3WW|1NAL|2D|3K|3L|3X|2ES|3X|2FCA|2GX|2OA|2PS|2T|3G|3I|2WV|2Y|1OCA|4U|4W|2FI|2GP|2HU|2LS|2NM|3O|2PH|2RA|3N|4U|4W|2TK|2UN|4W|2WG|1PAI|2CB|3X|2EG|4R|4U|2FI|2HL|2KL|4U|4W|2OK|2PL|2RB|3C|3O|3Y|2SC|2T|3X|2WH|3R|4W|1QFT|4P|4W|1RAD|2BK|2CE|2PT|2RK|2TA|3S|2ZN|1SAC|4R|4U|4W|2BI|2EA|4R|4U|2II|2M|2NC|2P|2RM|2TI|2YS|1TAA|3K|2BA|2EP|3X|2FS|2GW|2HO|2I|3M|2KE|3H|3S|2LD|3N|4W|2NE|2OK|2RA|3C|3D|3F|3K|3L|3O|3R|4P|3T|3Z|2TK|2X|1UGP|2IG|2JA|2MA|4R|4U|2NE|3S|2PN|3X|2RG|1VA|3Q|4U|4W|2C|3C|4U|4W|3O|2IA|4W|3V|4U|4W|2RA|3E|4W|3N|1WAG|4W|2BI|2IM|2KHL|3S|2MR|2RD|2VL|4W|1XTC|3P|4W|1Y|2BT|2M|2NA|2PR|2RE|1ZZL|4R|4U|0TACH|4U|4W|3O|4U|4W|3T|2NH|2OP|3X|2RA|3S|2SK|2TT|2VI|4R|4U|2YD|1BBK|2CH|3VU|2LA|3D|1C|2BI|4O|3K|3S|2GX|2MD|2OM|2PC|2RT|3X|2X|1DAC|4U|4W|2IC|2TH|2UP|2WD|4R|4U|1EAD|3M|2CH|3X|2LA|3O|2M|2NB|3X|2R|1FSL|1GHL|2L|2TX|1H|2CH|2EO|4R|4U|2FF|2H|2RM|4V|3Y|1IGO|3R|2L|3E|2PT|2TN|1JGC|1KLF|2NO|1LAC|4U|4W|2F|2IH|2N|3C|4U|4W|2PH|2RY|2S|3A|3I|4W|2X|1MC|3I|3R|2DX|2S|3WW|2TS|4U|4W|2US|4I|4L|4Z|1NDM|2GX|2MG|2ON|4W|2XP|2YA|1OMZ|2NX|2P|2RO|2UR|2WN|2YO|1PCS|2G|3XL|2ST|1RAW|3X|2BG|2DA|2EE|3O|2GS|4R|4U|2I|3B|3P|2MB|3D|3K|2NR|3S|2ON|3O|3W|2S|3G|3T|2T|2UG|3P|2VG|3I|1SAT|2BK|2CO|2EM|2HA|2LA|2SI|1TAN|2D|2EC|3K|2GT|2MI|2RX|2WO|1ULP|2RB|2SK|1VA|3CU|4W|3I|4R|4U|2GN|4W|2IV|4U|4W|2RD|2TX|1W|2AV|2FG|2G|2IN|2LV|4R|4U|2ST|1XG|2MD|2N|2RH|1YGO|2RA|1ZOO|0UAL|1BCP|2SI|1CAR|2FI|4W|2L|2TT|1EIC|1FCS|2G|2PI|3T|1G|1K|1LBI|2CC|2H|2TA|1MBF|4O|1NB|2CY|2IT|2TY|1ONE|4K|1PB|3D|2C|2LD|2ST|2WK|2XI|1RBN|2GN|2OY|1SAR|3U|2CB|2DE|4W|2EA|2GO|2IO|2LM|1THR|2MD|2SI|1VSP|1XIN|1YSC|4R|4U|1ZX|0VABK|2I|2LN|3U|2NI|1BIO|2NK|1C|2EL|2IG|2RE|2TR|2YT|1ECO|2EA|4W|3E|2LO|2ON|2RA|3I|3U|3X|1FF|2S|3WW|1GAS|4W|1HC|3P|4U|4W|2UB|1IAV|2CR|2NP|2OT|2P|2R|3C|2SN|2TL|2VK|3O|3S|1KTX|1LGEA|2OS|4U|4W|2Y|3PN|4O|4P|1MAR|2D|2ET|1NCE|2DA|2ET|2ME|4U|4W|2OM|1OD|2GX|2R|2XR|1RA|3X|2CA|2DN|2EX|2M|3E|2NS|2RM|2SK|3N|2TX|2XA|4W|1S|2A|3T|2EC|4U|2ME|2NT|2TM|1TGN|2IX|2RS|2SI|2VT|1UZI|1VOS|1WAV|4W|1YGR|0WABC|2FD|4P|3U|2LD|4W|2SH|2TR|3T|2VE|2Y|1B|2D|2TN|2UY|1CCB|2T|1DAY|2C|2FC|1EN|3N|4U|4W|2RN|2ST|2TH|3O|2YS|1FCF|2F|2RD|1GS|1HF|3CL|2LR|4D|4L|4P|2WK|1IMI|2NA|3G|2X|1KEY|2HS|2SP|1LCO|4U|4W|2DN|3S|4W|2FC|2II|4U|4W|2TH|1MG|2T|1NEB|2W|1OK|2OF|1PRT|1RAP|2D|2LD|1SBC|4O|3F|3K|2C|2E|2FS|2HP|2TN|4R|4U|1TBA|2F|3C|4N|2G|3UR|4U|2W|1ULF|1VE|2VI|4P|1W|2D|1XM|1YFI|2HG|2NN|0XAIR|1BIO|3T|2P|3EW|1CBE|4U|4W|2H|2UR|1E|2L|3B|3LL|2NE|2RS|1FOR|1GN|1HG|2LD|1III|4U|4W|1LAB|4W|2O|1MAX|2TR|1NCR|2DU|2ET|1OS|1P|2EL|2ON|1RAY|2PN|4U|4W|2TX|2X|3DW|1SLL|4U|4W|1TER|4U|4W|2IA|2LB|1WEL|1XII|0YAAS|2RW|1B|1DDL|2ES|4W|2KG|1FOR|1HC|2GJ|2NA|4R|4U|1I|2BO|2CC|4U|4W|1J|1MAT|2T|1ORW|2UL|1Q|1SWY|2XT|1TRA|1XT|1YAI|0Z|1BAO|2IO|2RA|1CMD|1D|2AI|1ENA|2O|3WW|1G|1ION|4P|1JK|2YL|1KIN|2P|3U|3W|1LAB|1M|1NB|2TL|1OOZ|4W|1S|2QR|2TK|1TG|1UMZ|2RA|1VRA|1YBT|2ME","sep":"|"},{"f":"0ATA Creativity Global|1rmada Acquisition Corp. III|s|s|1bony Acquisition Corp. I|p|p|1pogee Acquisition Corp|n|n|n|1merican Airlines Group, Inc.|1tlantic American Corporation|1pplied Optoelectronics, Inc.|1AON, Inc.|1scentage Pharma Group International|1pple Inc.|1ardvark Therapeutics, Inc.|1merican Battery Technology Company|1bCellera Biologics Inc.|2eona Therapeutics Inc.|2le View Global Inc.|l|1irbnb, Inc.|1cumen Pharmaceuticals, Inc.|1bsci Corporation|1merican Bitcoin Corp.|1bits Group Inc|1rbutus Biopharma Corporation|1BVC BioPharma, Inc.|1bivax SA|1verin Capital Acquisition Corp.|w|w|1CADIA Pharmaceuticals Inc.|1urora Cannabis Inc.|1cco Group Holdings Limited|3elevation Holdings Corp.|0ProFrac Holding Corp.|0Adicet Bio, Inc.|1corn Energy, Inc.|1CP Holdings Acquisition Corp.|u|u|1rch Capital Group Ltd.|n|n|1cadia Healthcare Company, Inc.|2hieve Life Sciences, Inc.|1merican Coastal Insurance Corporation|1C Immune SA|2I Worldwide, Inc.|1xcelis Technologies, Inc.|1CM Research, Inc.|2NB Corporation|1scent Industries Co.|1lpha Cognition Inc.|1clarion, Inc.|e|6s Therapeutics, Inc.|2rivon Therapeutics, Inc.|0Enact Holdings, Inc.|0Acacia Research Corporation|2tuate Therapeutics, Inc.|2urx Pharmaceuticals, Inc.|1merican Drive Acquisition Company|y|y|1dagene Inc.|3mas Trust, Inc.|i|i|i|i|i|i|i|i|i|2obe Inc.|2vasa Holdings, Inc.|2eia Inc.|2agio Medical Holdings, Inc|1nalog Devices, Inc.|1dial Pharmaceuticals, Inc|1DMA Biologics Inc|1utomatic Data Processing, Inc.|1daptive Biotechnologies Corporation|1DARx Pharmaceuticals, Inc.|2S-TEC ENERGY PLC|i|1utodesk, Inc.|1DTRAN Holdings, Inc.|1duro Clean Technologies Inc.|2dus HomeCare Corporation|2vantage Solutions Inc.|5ced Biomed Inc.|2dex Therapeutics Ltd|1ctivate Energy Acquisition Corp.|x|x|1ebi Schmidt Holding AG|1nfield Energy Inc.|2telope Enterprise Holdings Limited|1ehr Test Systems|1lset Inc.|1dvanced Energy Industries, Inc.|1ethlon Medical, Inc.|1lliance Entertainment Holding Corporation|zoration|1merican Electric Power Company, Inc.|1eries Technology, Inc.|n|2on Acquisition I Corp.|o|o|o|2va Technologies, Inc.|1udioEye, Inc.|1dvanced Flower Capital Inc.|1imei Health Technology Co., Ltd|w|w|0Forafric Global PLC|j|0Affirm Holdings, Inc.|2ya Limited|1gencia Comercial Spirits Ltd|4us Inc.|2ios Pharmaceuticals, Inc.|2omAb Therapeutics NV|1GM Group Holdings Inc.|2NC Investment Corp.|l|l|l|l|l|l|3T, Inc.|1xe Compute Inc.|1groz Inc.|2ilysys, Inc.|1daptHealth Corp.|1kso Health Group|1mbitions Enterprise Management Co. L.L.C|1IAI Holdings Corporation|0Bitzero Holdings Inc.|020/20 Biolabs, Inc.|0All In FutureTech Alliance, Inc.|1I Financial Corporation|0Firefly Neuroscience, Inc.|0AIFU Inc.|0Robo.ai Inc.|c|0Air Global PLC|2nos, Inc.|b|1IOS Tech Inc.|0PowerFleet, Inc.|0Arteris, Inc.|0reAlpha Tech Corp.|0Airgain, Inc.|3Joule Technologies Corporation|x|1IRO Group Holdings, Inc.|1irSculpt Technologies, Inc.|3 T, Inc.|b|3ship AI Holdings, Inc|o|0XIAO-I Corporation|0Akamai Technologies, Inc.|3nda Corp.|2ebia Therapeutics, Inc.|2tis Oncology, Inc.|2ari Therapeutics Plc|1stera Labs, Inc.|1larum Technologies Ltd.|2ico, Inc.|2del Financial II Inc.|n|n|4yra Therapeutics, Inc.|2ector, Inc.|0Centurion Acquisition Corp.|r|r|0Allegro MicroSystems, Inc.|2ign Technology, Inc.|4os Therapeutics, Inc.|2legiant Travel Company|2ignment Healthcare, Inc.|0Calisa Acquisition Corp|n|n|0Alkermes plc|3ami Technology, Inc.|2logene Therapeutics, Inc.|3arity Therapeutics, Inc.|3ot Ltd.|2monty Industries Inc.|2amar Biosciences, Inc.|2umis Inc.|1eluma, Inc.|1llient Inc.|2nylam Pharmaceuticals, Inc.|2dabra 4 Liquidity Opportunity Vehicle, Inc.|zicle, Inc.|zicle, Inc.|0REalloys Inc.|0Alpha Compute Corp|1LPS Group Inc|1lpex Acquisition Corporation|t|t|t|2arm.com Holdings, Inc.|2erus Financial Corporation|2timmune, Inc.|2Ti Global, Inc.|2to Ingredients, Inc.|2votech|8|1LX Oncology Holdings Inc.|1lzamend Neuro, Inc.|1MR Resources Acquisition Corp|u|u|1malgamated Financial Corp.|3nat Acquisition Corp|1pplied Materials, Inc.|1mbarella, Inc.|3er International Holding Limited|1MC Robotics Corporation|4Global Media Inc.|1dvanced Micro Devices, Inc.|1mgen Inc.|1utonomix Medical, Inc.|1mkor Technology, Inc.|2ylyx Pharmaceuticals, Inc.|1lpha Modus Holdings, Inc.|q|1mplitech Group, Inc.|l|3hastar Pharmaceuticals, Inc.|3litude, Inc.|2arin Corporation plc|2neal Pharmaceuticals, Inc.|2erican Superconductor Corporation|1MERISAFE, Inc.|2ASS Brands Inc.|1mesite Inc.|1emetis, Inc|1mazon.com, Inc.|1naptysBio, Inc.|0The Andersons, Inc.|0Anghami Inc.|c|3i Inc.|4oDynamics, Inc.|2ika Therapeutics Inc.|1NI Pharmaceuticals, Inc.|1nixa Biosciences, Inc.|1dlai Nortye Group Ltd.|1leAnna, Inc.|d|1nnexon, Inc.|0Rich Sparkle Holdings Limited|0Antalpha Platform Holding Company|1N2 Therapeutics, Inc.|1lpha and Omega Semiconductor Limited|1merican Outdoor Brands, Inc.|1PA Corporation|0StoneBridge Acquisition II Corporation|zion|zion|0ARKO Petroleum Corp.|1merican Public Education, Inc.|1gora, Inc.|1pplied Digital Corporation|2ollomics Inc.|f|1mperCap Acquisition Company|s|s|1pnimed, Inc.|2ogee Enterprises, Inc.|2plovin Corporation|3Folio, Inc.|3ian Corporation|0Digital Turbine, Inc.|0Aprea Therapeutics, Inc.|2erture AC|b|2tevo Therapeutics Inc.|1sia Pacific Wire & Cable Corporation Limited|1pex Treasury Corporation|p|p|2yx Medical Corporation|1quaBounty Technologies, Inc.|4 Metals, Inc.|3estive Therapeutics, Inc.|1rrive AI Inc.|1ccuray Incorporated|1RB IOT Group Limited|1rbe Robotics Ltd.|i|2go Blockchain plc|2cBest Corporation|2es Capital Corporation|2chimedes Tech SPAC Partners III Co.|zo.|zo.|1RC Group Acquisition I Corp|s|s|s|1rcturus Therapeutics Holdings Inc.|2delyx, Inc.|1merican Resources Corporation|0argenx SE|0Arhaus, Inc.|1RKO Corp.|1rk Restaurants Corp.|1lliance Resource Partners, L.P.|1rm Holdings plc|2row Financial Corporation|2q, Inc.|3it Quantum Inc.|2cutis Biotherapeutics, Inc.|2ray Technologies, Inc.|2t Technology Acquisition Corp.|w|w|3elo Biosciences, Inc.|4sian Resources Corporation|3iva Biotherapeutics, Inc.|3's-Way Manufacturing Co., Inc.|2vinas, Inc.|2rowhead Pharmaceuticals, Inc.|2xis, Inc.|1spire-Lakewood Holdings, Inc.|u|1erSale Corporation|1ssembly Biosciences, Inc.|1SML Holding N.V.|1scendis Pharma A/S|1cademy Sports and Outdoors, Inc.|1 SPAC III Acquisition Corp.|s|s|1SP Isotopes Inc.|1ltisource Portfolio Solutions S.A.|z|z|1meriServ Financial Inc.|0Strive, Inc.|0Astrotech Corporation|3ec Industries, Inc.|3rana Health Inc.|2cent Solar Technologies, Inc|1lgoma Steel Group Inc.|n|1ST SpaceMobile, Inc.|1sure Software Inc|1mtech Systems, Inc.|1tour Lifestyle Holdings Limited|2las Critical Minerals Corporation|1lphatec Holdings, Inc.|1terian, Inc.|1nterix Inc.|1lpha Technology Group Limited|2terity Therapeutics Limited|1ether Holdings, Inc.|1rchimedes Tech SPAC Partners II Co.|z.|z.|1tlanticus Holdings Corporation|v|v|v|1mes National Corporation|0JAB Acquisition Corp I|m|m|m|0Atlas Lithium Corporation|1TN International, Inc.|1tomera Incorporated|3ssa Therapeutics, Inc.|1gape ATP Corporation|1tara Biotherapeutics, Inc.|2riCure, Inc.|1stronics Corporation|1ttovia Therapeutics, Inc.|2las Trinity Tech Limited|1ddentax Group Corp.|0aTyr Pharma, Inc.|0Auburn National Bancorporation, Inc.|1TIF Holdings Limited|1udioCodes Ltd.|2ra Minerals Inc.|0authID Inc.|0Aurinia Pharmaceuticals Inc|3ora Innovation, Inc.|3a Biosciences, Inc.|3elion Inc.|3ora Innovation, Inc.|2tolus Therapeutics plc|2ddia Inc.|1veanna Healthcare Holdings Inc.|2alanche Treasury Corporation|1eroVironment, Inc.|1vidbank Holdings, Inc.|1rriVent BioPharma, Inc.|0Broadcom Inc.|0Atea Pharmaceuticals, Inc.|1valyn Pharma Inc.|2iat Networks, Inc.|0Mission Produce, Inc.|0AvePoint, Inc.|1nteris Technologies Global Corp.|1vnet, Inc.|2alo Therapeutics, Inc.|3x One Technology Ltd.|1navex Life Sciences Corp.|1ware, Inc.|0Solowin Holdings|0Axogen, Inc.|2iom Intelligence Acquisition Corp 1|z 1|z 1|2on Enterprise, Inc.|2some Therapeutics, Inc.|1XT Inc|1ya Gold & Silver Inc.|2tu BioPharma, Inc.|12Z Cust2Mate Solutions Corp.|1utozi Internet Technology (Global) Ltd.|1zio AI Holdings, Inc.|2enta, Inc.|0Blue Acquisition Corp.|m|m|1ridger Aerospace Group Holdings, Inc.|znc.|1ayFirst Financial Corp.|2ndwidth Inc.|3cFirst Corporation|l|0CBL International Limited|0Banner Corporation|0ArrowMark Financial Corp.|0Baosheng Media Group Holdings Limited|0Atlanta Braves Holdings, Inc.|t|0Neighborhood Intelligence, Inc.|0Concrete Pumping Holdings, Inc.|0Beasley Broadcast Group, Inc.|1ridgeBio Pharma, Inc.|1one Biologics Corp|j|1eta Bionics, Inc.|1ridgeBio Oncology Therapeutics, Inc.|1arrett Business Services, Inc.|0California BanCorp|0Bicara Therapeutics Inc.|1CB Bancorp, Inc. (NJ)|1leichroeder Acquisition Corp. III|y|y|1ioCardia, Inc.|2nah Capital Group, Inc.|p|1CP Investment Corporation|1ayCom Corp|2lchem Corporation|1ioCryst Pharmaceuticals, Inc.|1riaCell Therapeutics Corp.|r|r|1icycle Therapeutics plc|1TC Development Corp.|l|l|1aird Medical Investment Holdings Ltd|ztd|1iodexa Pharmaceuticals plc|5six, Inc.|1lack Diamond Therapeutics, Inc.|1old Eagle Acquisition Corp.|s|s|1eam Therapeutics Inc.|0Heartbeam, Inc.|f|0Beam Global|0Mobile Infrastructure Corporation|0Bel Fuse Inc.|d|2neficient|b|2tter Home & Finance Holding Company|zny|1ank First Corporation|1ullfrog AI Holdings, Inc.|q|1iofrontera Inc.|g|1usiness First Bancshares, Inc.|1GC Group, Inc.|1ig Digital Energy, Inc.|1gin Blockchain Limited|1lue Gold Limited|1ioNexus Gene Lab Corp|1lue Gold Limited|1GM Group Ltd.|1io Green Med Solution, Inc.|1HAV Acquisition Corp|l|l|1righthouse Financial, Inc.|r|r|r|r|r|1urke & Herbert Financial Services Corp.|1ioHarvest Sciences Inc.|0bioAffinity Technologies, Inc.|u|0Tribeca Strategic Acquisition Corp.|0Baidu, Inc.|0Tribeca Strategic Acquisition Corp.|z|0Biogen Inc.|2libili Inc.|2oAge Labs, Inc.|0Instinct Bio Technical Company Holdings Inc.|zings Inc.|0Bioceres Crop Solutions Corp.|0Smartbird, Inc.|0BioVie Inc.|b|2tcoin Infrastructure Acquisition Corp Ltd.|zCorp Ltd.|zCorp Ltd.|1aiya International Group Inc.|1luejay Diagnostics, Inc.|1J's Restaurants, Inc.|1lack Hawk Acquisition Corporation|y|y|1ooking Holdings Inc.|1aker Hughes Company|1IO-key International, Inc.|1lackLine, Inc.|2ue Bird Corporation|1allard Power Systems, Inc.|1ioLife Solutions, Inc.|1ridgeline Digital, Inc.|1eLive Holdings|1lackbaud, Inc.|1illionToOne, Inc.|1loomin' Brands, Inc.|1eeline Holdings, Inc.|1link Charging Co.|2uerock Acquisition Corp.|q|q|1ioLineRx Ltd.|1lossomHill Therapeutics, Inc.|1elite Bio, Inc|1lue Water Acquisition Corp. III|w|w|1ackblaze, Inc.|0Trailblazer Acquisition Corp.|t|t|0Bumble Inc.|1iomea Fusion, Inc.|1asel Medical Group Ltd|1luemount Holdings Limited|4 Moon Metals Inc.|1eamr Imaging Ltd.|1iomerica, Inc.|1ank of Marin Bancorp|1ioMarin Pharmaceutical Inc.|1rand Engagement Network Inc.|t|1NB Standard Corporation|o|o|1ionano Genomics, Inc.|1onk, Inc.|1urning Rock Biotech Limited|1enitec Biopharma Inc.|1ioNTech SE|0The Beachbody Company, Inc.|0BranchOut Food Inc.|1OK Financial Corporation|1oundless Bio, Inc.|2lt Biotherapeutics, Inc.|2n Natural Life Limited|0DMC Global Inc.|0B.O.S. Better Online Solutions|0RoboStrategy, Inc.|0Bank of the James Financial Group, Inc.|1oxlight Corporation|1lueport Acquisition Ltd|o|o|0Popular, Inc.|d|1rinceton Bancorp, Inc.|0Brookfield Property Partners L.P.|x|x|x|2agg Gaming Group Inc.|3iin Limited|1RBI BR Partners S.A.|1lack Rock Coffee Bar, Inc.|1reeze Acquisition Corp. II|r|1arfresh Food Group Inc.|1ridgford Foods Corporation|1urtech Acquisition Corp II|r|r|1ruker Corporation|i|1orealis Foods Inc.|j|1rilliant Earth Group, Inc.|2enX Ltd.|1luerock Acquisition Corp. II|1&R Technology Merger Corp.|r|r|1ioRestorative Therapies, Inc.|1oost Run Inc.|1raveheart Bio, Inc.|3ze, Inc.|1EST SPAC I Acquisition Corp.|t|t|1ogota Financial Corp.|1ioStem Technologies, Inc.|1assett Furniture Industries, Incorporated|1ig Sky Industrial Inc.|1ending Spoons S.p.A.|0Sierra Bancorp|0Bank7 Corp.|1entley Systems, Incorporated|1T Brands, Inc.|f|1it Digital, Inc.|1TCS Inc.|3 Digital Ltd.|1itdeer Technologies Group|1rightline Interactive, Inc.|1iote Corp.|0Armlogi Holding Corp.|0BTQ Technologies Corp.|1rightSpring Health Services, Inc.|y|1lack Titan Corp|0Webull Corporation|i|0First Busey Corporation|n|0BUUU Group Limited|1itVentures Limited|1V Financial, Inc.|1ioventus Inc.|1rainsWay Ltd.|2idgewater Bancshares, Inc.|s|2oadwind, Inc.|1ankwell Financial Group, Inc.|0The Baldwin Insurance Group, Inc.|0Bowman Consulting Group Ltd.|1OXABL, Inc.|0Park Ha Biological Technology Co., Ltd.|0Broadway Financial Corporation|1eyond Meat, Inc.|1yrna Technologies, Inc.|1eyondSpring, Inc.|0KANZHUN LIMITED|0Blaize Holdings, Inc.|l|1uzzFeed, Inc.|e|1aozun Inc.|0China Automotive Systems, Inc.|1abaletta Bio, Inc.|2ring Brands, Inc.|2mden National Corporation|1redit Acceptance Corporation|1andel Therapeutics, Inc.|1AE Inc|1antor Equity Partners VII, Inc.|2ris Life Sciences, Inc.|1ollective Acquisition Corp. II|v|v|0The Cheesecake Factory Incorporated|0CalciMedica, Inc.|3-Maine Foods, Inc.|1AMP4 Therapeutics Corporation|1amtek Ltd.|2naan Inc.|2yson Acquisition Corp|n|n|2pricor Therapeutics, Inc.|3stone Holding Corp.|2mbridge Acquisition Corp.|r|r|0Avis Budget Group, Inc.|0Carter Bankshares, Inc.|3Gurus, Inc.|3lsmed, Inc.|0Maplebear Inc.|0Pathward Financial, Inc.|0Cass Information Systems, Inc|0FreeCast, Inc.|0Caseys General Stores, Inc.|2talyst Acquisition Corp.|q|q|3hay General Bancorp|1BAK Energy Technology Limited|1entral Bancompany, Inc.|1B Financial Services, Inc.|1rescent Biopharma, Inc.|1ommercial Bancgroup, Inc.|1eriBell, Inc.|1apital Bancorp, Inc.|1racker Barrel Old Country Store, Inc.|1erebras Systems Inc.|1ommerce Bancshares, Inc.|1ibus, Inc.|1rescent Capital BDC, Inc.|1ollective Acquisition Corp.|s|s|2astal Financial Corporation|1apital City Bank Group|1CC Intelligent Solutions Holdings Inc.|14 Therapeutics, Inc.|1olumbus Circle Capital Corp III|w|w|1alamos Dynamic Convertible & Income Fund|2pital Clean Energy Carriers Corp.|1oca-Cola Europacific Partners plc|1heche Group Inc.|h|1CH Holdings Ltd|1ohen Circle Acquisition Corp. II|x|x|1areCloud, Inc.|1NB Financial Corporation|p|1ogent Communications Holdings, Inc.|2nsensus Cloud Solutions, Inc.|1CSC Technology International Holdings Limited|1hurchill Capital Corp XI|p|p|2aince Digital Holdings Inc.|1ardio Diagnostics Holdings Inc.|w|4lytics, Inc.|3eDx, Inc.|3dinal Infrastructure Group Inc.|2dence Design Systems, Inc.|1odere Online Luxembourg, S.A.|u|1DT Equity Inc.|5nvironmental Technology Investment Holdings Limited|5quity Inc.|2W Corporation|1odexis, Inc.|1adiz, Inc.|b|1ECO Environmental Corp.|1onstellation Energy Corporation|1elcuity Inc.|3sius Holdings, Inc.|3ularity Inc.|1reative Medical Technology Holdings, Inc.|1enntro Inc.|3tral Garden & Pet Company|s|4ury Aluminum Company|1antor Equity Partners IV, Inc.|2pstone Energy Plus, Inc.|2ntor Equity Partners I, Inc.|nVI, Inc.|o, Inc.|1erus Corporation|3tara, Inc.|2mtrex Inc.|1lean Energy Technologies, Inc.|1EVA, Inc.|1F Bankshares Inc.|1&F Financial Corporation|1apitol Federal Financial, Inc.|0The Carlyle Group Inc.|m|0Carlyle Secured Lending, Inc.|2nopy Growth Corporation|2rtesian Growth Corporation IV|v|v|1ullinan Therapeutics, Inc.|1ompugen Ltd.|2gnyte Software Ltd.|4ex Corporation|1alamos Global Total Return Fund|1G Oncology, Inc.|1reative Global Technology Holdings Limited|1ognition Therapeutics, Inc.|1hagee Holdings Limited|0DeFi Development Corp.|0Core AI Holdings, Inc.|1harlton Aria Acquisition Corporation|zon|zon|1omstock Holding Companies, Inc.|1ity Holding Company|1hurchill Downs, Incorporated|2enghe Acquisition III Co.|r|r|0The Chefs' Warehouse, Inc.|0Change Agents Corporation|1alamos Convertible Opportunities and Income Fund|1heck Point Software Technologies Ltd.|3mung Financial Corp|2ina Natural Resources, Inc.|2ampionsGate Acquisition Corporation|zon|zon|2eer Holding, Inc.|2ord Energy Corporation|2ronoScale Holdings Corporation|1oherus Oncology, Inc.|1.H. Robinson Worldwide, Inc.|1HS Inc|7|7|7|7|1hanson International Holding|3rter Communications, Inc.|s|1alamos Global Dynamic Income Fund|8Convertible and High Income Fund|1hime Financial, Inc.|1ipher Digital Inc.|1olliers International Group Inc.|2ncorde International Group Ltd|0Tianci International, Inc.|0Cincinnati Financial Corporation|3gulate Inc.|e|2rcle8 Group, Inc.|1ISO Global, Inc.|13is Inc.|1ivista Bancshares, Inc.|1allan JMB Inc.|1larus Corporation|1olumbia Financial, Inc.|1ellebrite DI Ltd.|4dex Therapeutics, Inc.|1learfield, Inc.|1ollPlant Biotechnologies Ltd.|1lick Holdings Limited|2earSign Technologies Corporation|1ellectis S.A.|1limb Global Solutions, Inc.|1alumet, Inc|1lean Energy Fuels Corp.|3ne Inc.|2over Health Investments, Corp.|1LPS Incorporation|1learPoint Neuro Inc.|1ellectar Biosciences, Inc.|1learOne, Inc.|4nSpark, Inc.|g|1atalyst Bancorp, Inc.|0Euro Tech Holdings Company Limited|0Climb Bio, Inc.|1olumbus McKinnon Corporation|2mcast Corporation|1reative Media|1ME Group Inc.|1hemomab Therapeutics Ltd.|1learmind Medicine Inc.|1impress plc|1OMPASS Pathways Plc|1ompass Therapeutics, Inc.|3merce.com, Inc.|3tech Telecommunications Corp.|3munity Bancorp.|2incheck Group N.V.|k|2nduent Incorporated|0ZW Data Action Technologies Inc.|0CN Energy Group Inc.|1ollective Mining Ltd.|2nnectOne Bancorp, Inc.|o|1NS Pharmaceuticals, Inc.|1erenome, Inc.|1onnect Biopharma Holdings Limited|1anton Strategic Holdings, Inc.|1ontext Therapeutics Inc.|1entury Casinos, Inc.|1ineverse Corp.|1oncentrix Corporation|0PC Connection, Inc.|0Conexeu Sciences Inc.|0Hemab Therapeutics Holdings, Inc.|0Envoy Medical, Inc.|j|0The Vita Coco Company, Inc.|0Cocrystal Pharma, Inc.|2da Octopus Group, Inc.|2-Diagnostics, Inc.|1hoiceOne Financial Services, Inc.|1ogent Biosciences, Inc.|2hu, Inc.|2inbase Global, Inc.|2ca-Cola Consolidated, Inc.|2lumbus Acquisition Corp|p|p|6ia Banking System, Inc.|3legium Pharmaceutical, Inc.|3umbia Sportswear Company|0The Cooper Companies, Inc.|0Australian Oilseeds Holdings Limited|zd|0Corcept Therapeutics Incorporated|3e Scientific, Inc.|l|l|2smos Health Inc.|3tco Wholesale Corporation|2ya Therapeutics, Inc.|0The Campbell's Company|0Central Plains Bancshares, Inc.|1anterbury Park Holding Corporation|1umberland Pharmaceuticals Inc.|0Pop Culture Group Co., Ltd|0Copart, Inc.|1PS Technologies Corp.|1onsumer Portfolio Services, Inc.|1alamos Long/Short Equity & Dynamic Income Trust|1rown Reserve Acquisition Corp. I|x|x|x|1RA International,Inc.|1rane Harbor Acquisition Corp. II|x|x|1al Redwood Acquisition Corp.|t|t|1orbus Pharmaceuticals Holdings, Inc.|1aribou Biosciences, Inc.|1ricut, Inc.|1ardiff Oncology, Inc.|5ol Therapeutics Inc.|1redo Technology Group Holding Ltd|38 Enterprise Limited|3sud S.A.C.I.F. y A.|3ative Realities, Inc.|0Freightos Limited|h|0Curis, Inc.|1orMedix Inc.|1ritical Metals Corp.|l|0America's Car-Mart, Inc.|0Cerence Inc.|3agon Networks Ltd.|1ronos Group Inc.|3cs, Inc.|1RISPR Therapeutics AG|1orsair Gaming, Inc.|1riteo S.A.|1irrus Logic, Inc.|1orVel Corp.|1ervoMed Inc.|1orvus Pharmaceuticals, Inc.|1rowdStrike Holdings, Inc.|4n Crafts, Inc.|1oreWeave, Inc.|1loudastructure, Inc.|1hampions Oncology, Inc.|1isco Systems, Inc.|1oStar Group, Inc.|2inShares PLC|e|1anadian Solar Inc.|1SP Inc.|1alamos Strategic Total Return Fund|2esarstone Ltd.|2stle Biosciences, Inc.|2pital Southwest Corporation|1SX Corporation|1learThink 1 Acquisition Corp.|u|u|1intas Corporation|1ommunity Trust Bancorp, Inc.|1ytek Biosciences, Inc.|3omX Therapeutics, Inc.|1ontineum Therapeutics, Inc.|1heetah Net Supply Chain Service Inc.|1itius Oncology, Inc.|1astor Maritime Inc.|1iti Trends, Inc.|1ognizant Technology Solutions Corporation|1ytosorbents Corporation|1TW|1itius Pharmaceuticals, Inc.|0Lionheart Holdings|i|i|0Cue Biopharma, Inc.|2lp, Inc.|2prina Holdings (Cayman) Limited|2riosityStream Inc.|3renc Group Inc.|3anex Pharmaceuticals Inc|1linuvel Pharmaceuticals Limited|1apsoVision, Inc.|1VB Financial Corporation|1avco Industries, Inc.|1ommercial Vehicle Group, Inc.|1adrenal Therapeutics, Inc.|1ommvault Systems, Inc.|1VRx, Inc.|2D Equipment Corporation|1ommunity West Bancshares|2nsolidated Water Co. Ltd.|1aliberCos Inc.|2sella Waste Systems, Inc.|1XApp Inc.|a|1rexendo, Inc.|1hurchill Capital Corp XII|q|q|1yabra, Inc.|2curion, Inc.|e|2ngn Inc.|2pherpunk Technologies Inc.|1ryoPort, Inc.|1ytokinetics, Incorporated|1itizens Financial Services, Inc.|9& Northern Corp|1aesars Entertainment, Inc.|1itizens Community Bancorp, Inc.|0Digital Asset Acquisition Corp.|v|v|0CID HoldCo, Inc.|g|0Data I/O Corporation|2ktronics, Inc.|2re Bioscience, Inc.|1oorDash, Inc.|1ave Inc.|9|1. Boral Acquisition I Corp.|s|s|1igital Brands Group, Inc.|1BV Technologies S.A.|1ropbox, Inc.|1ocebo Inc.|3Go Inc.|1ecoy Therapeutics Inc.|2lcath Systems, Inc.|1igital Currency X Technology Inc.|1oubleDown Interactive Co., Ltd.|1atadog, Inc.|1efi Technologies, Inc.|0Journey Medical Corporation|0Liberty Defense Holdings, Ltd.|0DeFi Development Corp.|m|1ragonfly Energy Holdings Corp|u|0T3 Defense Inc.|f|0DEFSEC Technologies Inc.|o|1efinium Therapeutics, Inc.|1onegal Group, Inc.|j|1igi International Inc.|4nex Limited|4 Power X Inc.|1efinitive Healthcare Corp.|1iversified Healthcare Trust|s|s|01stdibs.com, Inc.|0Diodes Incorporated|1aily Journal Corp. (S.C.)|0Trump Media & Technology Group Corp.|z.|0DarkIris Inc.|1raftKings Inc.|1LH Holdings Corp.|2ocal Limited|1olphin Entertainment, Inc.|1uluth Holdings Inc.|1ollar Tree, Inc.|1elixy Holdings Limited|1rugs Made In America Acquisition Corp.|zorp.|zorp.|1iaMedica Therapeutics Inc.|1rugs Made In America Acquisition II Corp.|zI Corp.|zI Corp.|1orchester Minerals, L.P.|1amora Therapeutics, Inc.|1igimarc Corporation|1enali Therapeutics Inc.|1ynamix Corporation III|n|n|1ianthus Therapeutics, Inc.|0Krispy Kreme, Inc.|0DocuSign, Inc.|2gness (International) Corporation|2minari Holdings Inc.|0BRP Inc.|0Dorman Products, Inc.|0Amdocs Limited|0DouYu International Holdings Limited|1raganfly Inc.|0Top KingWin Ltd|0Domino's Pizza Inc|1irect Digital Holdings, Inc.|0Roman DBDR Acquisition Corp. II|v|v|0Diamondrock Hospitality Company|1arioHealth Corp.|3kHorse Technologies Inc.|1ermata Therapeutics, Inc.|0Leonardo DRS, Inc.|0Alpha Tau Medical Ltd.|m|0Bright Minds Biosciences Inc.|0Driven Brands Holdings Inc.|1aedalus Special Acquisition Corp.|y|y|1SC Holdings Ltd.|1esign Therapeutics, Inc.|1istribution Solutions Group, Inc.|0The Descartes Systems Group Inc.|0Viant Technology Inc.|0Deswell Industries, Inc.|0Big Tree Cloud Holdings Limited|v|0Datacentrex, Inc.|1rilling Tools International Corporation|0Precision BioSciences, Inc.|0DT Cloud Star Acquisition Corporation|zon|zon|1atasea Intelligent Technology Ltd.|4 Storage Corporation|1UKE Robotics Corp.|j|0Fangdd Network Group Ltd.|0Duolingo, Inc.|3s Technologies Group, Inc.|1atavault AI Inc.|2wson Geophysical Company|1ogwood Therapeutics, Inc.|1exCom, Inc.|2stination XL Group, Inc.|1XP Enterprises, Inc.|1axor Corporation|1ecent Holding Inc.|1yadic International, Inc.|2ne Therapeutics, Inc.|3amix Corporation|j|j|0Insight Digital Partners II|r|r|0eBay Inc.|0Eastern Bankshares, Inc.|2gle Bancorp Montana, Inc.|1bang International Holdings Inc.|1CB Bancorp, Inc.|1choStar Corporation|0electroCore, Inc.|0Encore Capital Group Inc|1CARX Holdings Inc.|j|1dible Garden AG Incorporated|t|1verbright Digital Holding Limited|1ditas Medicine, Inc.|1uroDry Ltd.|1desa Biotech, Inc.|0Skillful Craftsman Education Technology Limited|0Educational Development Corporation|1uronet Worldwide, Inc.|1picQuest Education Group International Limited|1nergy Focus, Inc.|2terprise Financial Services Corporation|zration|1agle Financial Services Inc|1toiles Capital Group Co., Ltd.|0eGain Corporation|0Eagle Bancorp, Inc.|1GH Acquisition Corp.|l|l|08x8 Inc|0EHang Holdings Limited|1shallgo Inc.|1uroholdings Ltd.|0eHealth, Inc.|0Eikon Therapeutics, Inc.|1-Home Household Service Holdings Limited|0PMGC Holdings Inc.|0Electra Battery Materials Corporation|3don Pharmaceuticals, Inc.|3mental Royalty Corporation|0The Elmet Group Co.|0Eastern International Ltd.|1loxx Pharmaceuticals, Inc.|3ng Power Holding Limited|2tek Ltd.|2icio Therapeutics, Inc.|2utia, Inc.|2ectrovaya Inc.|1nliven Therapeutics, Inc.|1levra Lithium Limited|2auwit Connection, Inc.|1volution Metals & Technologies Corp.|1mbecta Corp.|2mis Acquisition Corp.|n|1astern Company (The)|1mpery Digital Inc.|0enGene Therapeutics Inc.|o|0Energys Group Limited|2light Renewable Energy Ltd.|4vex Ltd.|2phase Energy, Inc.|1inride AB|a|1nsysce Biosciences, Inc.|0The Ensign Group, Inc.|0Enanta Pharmaceuticals, Inc.|2tegris, Inc.|4ra Bio Ltd.|2veric Biosciences, Inc.|2ovix Corporation|1ocene Ltd.|1volus, Inc.|1os Energy Enterprises, Inc.|s|1-Power Inc.|1upraxia Pharmaceuticals Inc.|1psium Enterprise Limited|4lon Energy Ltd.|1quillium, Inc.|4nix, Inc.|4pmentShare.com Inc|1rasca, Inc.|2icsson|3e Indemnity Company|1nergy Recovery, Inc.|1rnexa Therapeutics Inc.|o|1scalade, Incorporated|1uroseas Ltd.|1strella Immunopharma, Inc.|r|1lbit Systems Ltd.|1nergy Services of America Corporation|1squire Financial Holdings, Inc.|2tablishment Labs Holdings Inc.|1nerSyn Global Inc.|1ton Pharmaceuticals, Inc.|0eToro Group Ltd.|0Electra Therapeutics, Inc.|2ite Express Holding Inc.|0enCore Energy Corp.|0Euda Health Holdings Limited|s|2reka Acquisition Corp|n|n|1vaxion A/S|2erCommerce Inc.|4Quote, Inc.|2ogene Ltd.|1Vgo Inc.|1volv Technologies Holdings, Inc.|3tec SE|3lution Global Acquisition Corp|x|x|2ergy, Inc.|1ast West Ave Acquisition Corp.|v|v|aBancorp, Inc.|1dgewise Therapeutics, Inc.|1xelon Corporation|2pand Energy Corporation|2elixis, Inc.|2pensify, Inc.|2lService Holdings, Inc.|0eXoZymes Inc.|0Expedia Group, Inc.|3onent, Inc.|2treme Networks, Inc.|2yn Technologies, Inc.|n|0National Vision Holdings, Inc.|0EyePoint, Inc.|1ZGO Technologies Ltd.|2CORP, Inc.|0Reliance Global Group, Inc.|0First Advantage Corporation|1abric.AI, Inc.|2ctorial Energy Inc.|1ACT II Acquisition Corp.|p|p|1actorial Energy Inc.|2rmmi, Inc.|0Diamondback Energy, Inc.|0Fastenal Company|2te Therapeutics, Inc.|3Pipe, Inc.|1irst Breach Inc.|1BS Global Limited|1ortress Biotech, Inc.|m|1irst Business Financial Services, Inc.|1B Bancorp, Inc.|1ibroBiologics, Inc.|2rst Bancorp|1alcon's Beyond Global, Inc.|s|s|1irst Capital, Inc.|7ommunity Bankshares, Inc.|gCorporation|1uelCell Energy, Inc.|1irstCash Holdings, Inc.|2tness Champs Holdings Limited|2rst Citizens BancShares, Inc.|v|v|v|1ocus Universal Inc.|1idelity D & D Bancorp, Inc.|1reedom Metals Acquisition Corp.|w|w|04D Molecular Therapeutics, Inc.|0Fifth District Bancorp, Inc.|2dus Investment Corporation|05E Advanced Materials, Inc.|0Fenbo Holdings Limited|1requency Electronics, Inc.|2anklin Electric Co., Inc.|1emasys Inc.|2nnec Pharmaceuticals Inc.|2rrovial N.V.|1ifth Era Acquisition Corp I|s|s|1araday Future Intelligent Electric Inc.|1irst Financial Bancorp.|jkshares, Inc.|15, Inc.|1F EAI Robotics Ecosystem Inc.|1irst Guaranty Bancshares, Inc.|v|1G Communities Holdings Inc.|s|2I Industries Ltd.|2 Imperii Acquisition Corp.|s|s|2I Industries Ltd.|1ounder Group Limited|1irst Hawaiian, Inc.|1oghorn Therapeutics Inc.|1irst Interstate BancSystem, Inc.|2EE, Inc|2gure Technology Solutions, Inc.|1IGX Capital Acquisition Corp.|u|u|1inWise Bancorp|1TAI Infrastructure Inc.|1inancial Institutions, Inc.|0Deep Fission, Inc.|0Fiserv, Inc.|2ve Below, Inc.|49, Inc.|0National Beverage Corp.|0ARC Group Securities Acquisition I|y|y|y|0Franklin Wireless Corp.|1old Holdings, Inc.|j|1lex Ltd.|1ulgent Genetics, Inc.|3l House Resorts, Inc.|1ilana Therapeutics, Inc.|1luence Energy, Inc.|5t, Inc.|3x Power Holdings, Inc.|01-800-FLOWERS.COM, Inc.|0BingEx Limited|0Flexsteel Industries, Inc.|1irefly Aerospace Inc.|1ly-E Group, Inc.|3wire Corporation|1uture Money Acquisition Corporation|zn|zn|1armers & Merchants Bancorp, Inc.|1irst Mid Bancshares, Inc.|0Kandal M Venture Limited|0Farmers National Banc Corp.|1oremost Clean Energy Ltd.|q|1ingerMotion, Inc.|1unko, Inc.|1irst Bancorp, Inc (ME)|6Northern Community Bancorp|1rontier Nuclear and Minerals Inc.|1irst Northwest Bancorp|2nward Bancorp|0EDAP TMS S.A.|0Hang Feng Technology Innovation Co., Ltd.|0FormFactor, Inc.|3rester Research, Inc.|3mula Systems (1985) Ltd.|2ssil Group, Inc.|2x Corporation|f|4Factory Holding Corp.|3x Development Holdings Inc.|u|1ranklin Financial Services Corporation|1irst Bank|1orbright, Inc.|1riedman Industries Inc.|2eight Technologies, Inc.|3edom Holding Corp.|1irst Merchants Corporation|r|1ermi Inc.|1orum Markets, Incorporated|1reenome, Inc.|0JFrog Ltd.|0FRP Holdings, Inc.|1reshpet, Inc.|5works Inc.|0Primis Financial Corp.|0Foresight Autonomous Holdings Ltd.|3t Technology Inc.|1ervo Energy Company|1ive Star Bancorp|1S Bancorp, Inc.|1irst Seacoast Bancorp, Inc.|1lag Ship Acquisition Corp.|r|r|1irst Solar, Inc.|1astly, Inc.|0L.B. Foster Company|0FirstSun Capital Bancorp|6ervice Corporation|1TAI Aviation Ltd.|i|2C Solar, Inc.|1rontdoor, Inc.|1uel Tech, Inc.|2ture FinTech Group Inc.|1aeth Therapeutics, Inc.|1orefront Tech Holdings Acquisition Corp|z Corp|z Corp|1athom Holdings Inc.|1itLife Brands, Inc.|1ortinet, Inc.|4rea Holdings Inc.|0BitFuFu Inc.|c|0Fulcrum Therapeutics, Inc.|3ton Financial Corporation|s|1irst United Corporation|0Sprott Focus Trust, Inc.|0First US Bancshares, Inc.|1usemachines Inc.|h|2tu Holdings Limited|1ortress Value Acquisition Corp. V|1VCBankcorp, Inc.|1uture Vision II Acquisition Corporation|zation|zation|6wave Acquisition Corporation|y|y|y|1orward Industries, Inc.|0Liberty Media Corporation|p|0Forward Air Corporation|1irst Watch Restaurant Group, Inc.|1ortuneX Acquisition Corporation|w|w|0UTime Limited|0First National Corporation|0German American Bancorp, Inc.|1aia, Inc.|1ladstone Investment Corporation|w|w|w|1alectin Therapeutics Inc.|2meSquare Holdings, Inc.|2in Therapeutics, Inc.|0StealthGas, Inc.|0Gauzy Ltd.|1olub Capital BDC, Inc.|1Bank Financial Holdings Inc.|1lobal Indemnity Group, LLC|1reene County Bancorp, Inc.|1eneral Catalyst Global Resilience Merger Corp.|zMerger Corp.|zMerger Corp.|1CL Global Holdings Ltd|n|2M Grosvenor Inc.|1igaCloud Technology Inc|1lucoTrack, Inc.|1D Culture Group Limited|2EV Inc.|1olden Heaven Group Holdings Ltd.|2odRx Holdings, Inc.|1DS Holdings Limited|0CytoMed Therapeutics Limited|0Grid Dynamics Holdings, Inc.|2eat Elm Capital Corp.|n|n|n|aGroup, Inc.|l|1E HealthCare Technologies Inc.|1elteq Limited|2mini Space Station, Inc.|2n Digital Inc.|3erate Biomedicines, Inc.|1EN Restaurant Group, Inc.|1en Digital Inc.|2ospace Technologies Corporation|2ron Corporation|2vo, Inc.|1uardforce AI Co., Limited|q|1lobalFoundries Inc.|1eneral Fusion Group Ltd.|p|1rupo Financiero Galicia S.A.|1ogoro Inc.|b|1uardant Health, Inc.|1H Research PLC|1ores Holdings XI, Inc.|n|n|1IBO Holdings Limited|l|1iftify, Inc.|2gaMedia Limited|1-III Apparel Group, LTD.|1ilead Sciences, Inc.|3at Satellite Networks Ltd.|1eneration Income Properties Inc.|1lobal Interactive Technologies, Inc. Common Stock|1igCapital8 Corp.|h|h|a9 Corp.|2x Internet Ltd.|2gCapital9 Corp.|h|1ladstone Capital Corporation|2obal-E Online Ltd.|4us Maritime Limited|4al Engine Group Holding Limited|0Liberty Capital Corporation|r|0Greenland Energy Company|o|1olar LNG Limited|1loo Holdings, Inc.|1aming and Leisure Properties, Inc.|1reenlight Reinsurance, Ltd.|5wich LifeSciences, Inc.|0Monte Rosa Therapeutics, Inc.|0Galaxy Payroll Group Limited|7Digital Inc.|1enmab A/S|1MEX ROBOTICS CORPORATION|1amehaus Holdings Inc.|1lobal Mofy AI Limited|1reenlane Holdings, Inc.|1enelux Corporation|3prex, Inc.|3asys Inc.|3enta Science S.p.A.|3tex Corporation|1rocery Outlet Holding Corp.|0Eva Live Inc.|0Gogo Inc.|1ladstone Commercial Corporation|w|w|0Alphabet Inc.|d|d|d|0Gossamer Bio, Inc.|1eoVax Labs, Inc.|1OWell Energy Technology|1reenPower Motor Company Inc.|1eneral Purpose Acquisition Corp.|x|x|1P-Act III Acquisition Corp.|s|s|0Structure Therapeutics Inc.|0Green Plains, Inc.|1oPro, Inc.|1rab Holdings Limited|l|1RAIL, Inc.|1rande Group Limited|3ce Therapeutics, Inc.|2idAI Technologies Corp.|0Vulcan Infrastructure and Power Inc.|0Grifols, S.A.|1RI Bio, Inc.|1reenland Mines Ltd|j|5pro Capital Corp.|0U.S. Global Investors, Inc.|0Groupon, Inc.|1orilla Technology Group Inc.|t|1randstand Limited|1RAVITY Co., Ltd.|1rowGeneration Corp.|1lobalstar, Inc.|1reat Southern Bancorp, Inc.|1oosehead Insurance, Inc.|1esher Acquisition Corp. II|r|r|1SI Technology, Inc.|1arden Stage Limited|0Ferroglobe PLC|0GSR IV Acquisition Corp.|o|o|4V Acquisition Corp.|n|n|1olden Sun Technology Group Limited|0The Goodyear Tire & Rubber Company|0GT Biopharma, Inc.|1reenland Technologies Holding Corporation|1ores Holdings X, Inc.|m|m|1loba Terra Acquisition Corporation|z|z|z|1ood Times Restaurants Inc.|1itLab Inc.|0ZoomInfo Technologies Inc.|0Garrett Motion Inc.|0Berto Acquisition Corp. II|q|q|0Gulf Resources, Inc.|0Fractyl Health, Inc.|0Globavend Holdings Limited|1reenwave Technology Solutions, Inc.|1lobal Water Resources, Inc.|1axos.ai Inc.|2me Your Game, Inc.|1yre Therapeutics, Inc.|3odyne , LLC|0HCM IV Acquisition Corp.|o|o|1anmi Financial Corporation|0The Hain Celestial Group, Inc.|0Halozyme Therapeutics, Inc.|2oxi Health Technology Limited|2ppen, Inc.|2sbro, Inc.|2rvard Ave Acquisition Corporation|z|z|1untington Bancshares Incorporated|y|y|y|y|1ome Bancorp, Inc.|1arvard Bioscience, Inc.|1otel101 Global Holdings Corp.|2rizon Bancorp, Inc.|1BT Financial, Inc.|1all Chadwick Acquisition Corp.|v|v|1uachen AI Parking Management Technology Holding Co., Ltd.|1ealth Catalyst, Inc|1appy City Holdings Limited|1ennessy Capital Investment Corp. VIII|zIII|zIII|0The Hackett Group, Inc.|0HUTCHMED (China) Limited|1CM III Acquisition Corp.|p|p|1ealthcare Services Group, Inc.|bTriangle, Inc.|1CW Biologics Inc.|0SUPER HI INTERNATIONAL HOLDING LTD.|0Hadron Energy, Inc.|j|1udson Technologies, Inc.|1elen of Troy Limited|0Cybin Inc.|0D-Market Electronic Services & Trading|0Here Group Limited|3zfeld Credit Income Fund, Inc.|1ome Federal Bancorp, Inc. of Louisiana|1F Foods Group Inc.|1eritage Financial Corporation|9Global Inc.|1arte Hanks, Inc.|1ingham Institution for Savings|2ghway Holdings Limited|2max Technologies, Inc.|0Vyome Holdings, Inc.|0Health In Tech, Inc.|1igh Tide Inc.|1IVE Digital Technologies Ltd|1itek Global Inc.|0Cellyan Biotechnology Co., Ltd|0Harmonic Inc.|1illman Solutions Corp.|1amilton Lane Incorporated|1ongli Group Inc.|1elix Acquisition Corp. III|1MH Holding Inc.|1eidmar Maritime Holdings Corp.|2nnessy Advisors, Inc.|1allador Energy Company|0The Honest Company, Inc.|0Hanover Bancorp, Inc.|1ouse of Doge Inc.|2oker Furnishings Corporation|0MicroCloud Hologram Inc.|o|0Honeywell International Inc.|aAerospace Inc.|0Robinhood Markets, Inc.|0Hope Bancorp, Inc.|2ur Loop, Inc.|2vnanian Enterprises Inc|0New Horizon Aircraft Ltd.|p|0Werewolf Therapeutics, Inc.|0Helport AI Limited|i|1ighPeak Energy, Inc.|1orizon Quantum Holdings Ltd.|1ireQuest, Inc.|1orizon Quantum Holdings Ltd.|1ealthEquity, Inc.|1armony Biosciences Holdings, Inc.|3row, Inc.|1eron Therapeutics, Inc.|1orizon Technology Finance Corporation|1esai Group|2artSciences Inc.|i|0Solana Company|0Henry Schein, Inc.|1ost Hotels & Resorts, Inc.|1ealthStream, Inc.|1igh-Trend International Group|1eartcore Enterprises, Inc.|5flow, Inc.|1 World Group Limited|1eartland Express, Inc.|1omesToLife Ltd|12O America|0Fusion Fuel Green PLC|0Hertz Global Holdings, Inc|q|1ub Cyber Security Ltd.|n|n|4Group, Inc.|2ckleberry.ai, Inc.|2adi International Group Co., Ltd.|1UHUTECH International Group Inc.|1uize Holding Limited|2macyte, Inc.|0TuHURA Biosciences, Inc.|0Hurco Companies, Inc.|3on Consulting Group Inc.|2t 8 Corp.|1ighview Merger Corp.|l|l|1awthorn Bancshares, Inc.|2ncock Whitney Corporation|r|2wkins, Inc.|2oxin Holdings Limited|1ydrofarm Holdings Group, Inc.|0MindWalk Holdings Corp.|0Hycroft Mining Holding Corporation|1oyne Bancorp, Inc.|1yperion DeFi, Inc.|5fine, Inc.|0Innovative Solutions and Support, Inc.|1dea Acquisition Corp.|m|m|1renic Acquisition Corp.|o|o|1ntegra LifeSciences Holdings Corporation|1B Acquisition Corp.|k|1ndependent Bank Corporation|1BEX Limited|1nnovation Beverage Group Limited|0iBio, Inc.|0Interactive Brokers Group, Inc.|5national Bancshares Corporation|1mmunityBio, Inc.|4Cell Corporation|1ceCure Medical Ltd.|1CF International, Inc.|1ntchains Group Limited|1chor Holdings|1CON plc|1nvestcorp Credit Management BDC, Inc.|1con Energy Corp.|0SeaStar Medical Holding Corporation|z|0ICU Medical, Inc.|1ron Dome Acquisition I Corp.|t|t|0T Stamp Inc.|0InterDigital, Inc.|4llicheck, Inc.|1DEXX Laboratories, Inc.|3AYA Biosciences, Inc.|1nfinite Eagle Acquisition Corp.|w|w|1cahn Enterprises L.P.|1ES Holdings, Inc.|1nfobird Co., Ltd|3laRx N.V.|2vest Green Acquisition Corporation|zn|zn|2ternational General Insurance Holdings Ltd.|0iHeartMedia, Inc.|0Information Services Group, Inc.|0i3 Verticals, Inc.|0Inhibikase Therapeutics, Inc.|2telligent Living Application Group Inc.|0Triller Group Inc.|i|0Illumination Acquisition Corp I|v|v|8, Inc.|1ndustrial Logistics Properties Trust|1mageneBio, Inc.|1M Cannabis Corp.|1mmunocore Holdings plc|1nsight Molecular Diagnostics Inc.|2gles Markets, Incorporated|1mmutep Limited|3ersion Corporation|3ix Biopharma, Inc.|3unome, Inc.|2unon, Inc.|0ChipMOS TECHNOLOGIES INC.|0Imperial Petroleum Inc.|n|2muron Limited|4neering Corporation|0Terrestrial Energy Inc.|n|0Integrated Media Technology Limited|1mmatics N.V.|3unic, Inc.|5ovant, Inc.|1nternational Money Express, Inc.|1N8bio, Inc.|1ndigo Acquisition Corp.|o|o|0First Internet Bancorp|m|0Intelligent Bio Solutions Inc.|2hibrx Biosciences, Inc.|2tercure Ltd.|2cyte Corporation|2dependent Bank Corp.|0indie Semiconductor, Inc.|0Indaptus Therapeutics, Inc.|3ivior Pharmaceuticals, Inc.|1NNEOVA Holdings Limited|1nogen, Inc|2no Holdings Inc.|1NNIO N.V.|0MiNK Therapeutics, Inc.|0INLIF LIMITED|1nMed Pharmaceuticals Inc.|1Nmune Bio Inc.|1nMode Ltd.|2novAge Holding Corp.|2ovio Pharmaceuticals, Inc.|2nodata Inc.|2spired Entertainment, Inc.|3eego Corp.|3med Incorporated|2tapp, Inc.|3el Corporation|0The Intergroup Corporation|0Intelligent Group Limited|4r & Co. Inc.|4nsity Therapeutics, Inc.|3uit Inc.|3rusion Inc.|2nventure, Inc.|3oviva, Inc.|1NVE Technologies, Inc.|1nnoviz Technologies Ltd.|1onic Digital Inc.|0ioneer Ltd|0Ionis Pharmaceuticals, Inc.|1nnospec Inc.|0iOThree Limited|0Iovance Biotherapeutics, Inc.|1nterparfums, Inc.|0Professional Diversity Network, Inc.|0Inflection Point Acquisition Corp. VI|zVI|zVI|1PG Photonics Corporation|1nnate Pharma S.A.|2flection Point Acquisition Corp. VIII|2telligent Protection Management Corp.|0Century Therapeutics, Inc.|0IP Strategy Holdings, Inc.|1nterPrivate Investment Partners V, Inc.|z Inc.|z Inc.|0iPower Inc.|0Ideal Power Inc.|1perionX Limited|1nection Point Acquisition Corp. VII|zI|zI|0iQIYI, Inc.|0IQM Quantum Computers Oyj|p|0iQSTEL Inc.|0Opus Genetics, Inc.|0Iridium Communications Inc|1REN Limited|1ron Horse Acquisitions II Corp.|w|w|1RIDEX Corporation|0iRadimed Corporation|0Disc Medicine, Inc.|0iRhythm Holdings, Inc.|0Ironwood Pharmaceuticals, Inc.|1sabella Bank Corporation|0Snow Rothschild Acquisition Corp.|x|x|0iSpecimen Inc.|0Ispire Technology Inc.|1ntuitive Surgical, Inc.|2vestar Holding Corporation|1TG, Inc.|2HAX Acquisition Corp III|q|q|1nvestors Title Company|0iTonic Holdings Ltd|0Itron, Inc.|2uran Location and Control Ltd.|1nventiva S.A.|1veda Solutions, Inc.|l|1NVO Fertility, Inc.|1nvivyd, Inc.|2cannex Healthcare Inc.|1ZEA Worldwide, Inc.|1CZOOM Group Inc.|0Jack In The Box Inc.|2guar Health, Inc.|1AKKS Pacific, Inc.|1anux Therapeutics, Inc.|1ATT II Acquisition Corp|1azz Pharmaceuticals plc|1BDI Holdings Limited|1.B. Hunt Transport Services, Inc.|1ade Biosciences, Inc.|1etBlue Airways Corporation|1ohn B. Sanfilippo & Son, Inc.|1efferson Capital, Inc.|1E Cleantech Holdings Limited|1ewett-Cameron Trading Company|1D.com, Inc.|1IADE LIMITED|0707 Cayman Holdings Limited|0J and Friends Holdings Limited|1iayin Group Inc.|09F Inc.|0Aurora Mobile Limited|0J & J Snack Foods Corp.|1ack Henry & Associates, Inc.|1-Long Group Limited|1ulong Holding Limited|1ohn Marshall Bancorp, Inc.|2nes Ventures INTL Acquisition1 Corp|zrp|zrp|2hnson Outdoors Inc.|1OYY Inc.|1erash Holdings (US), Inc.|1ames River Group Holdings, Inc.|0Navient Corporation|0Jasper Therapeutics, Inc.|1et.AI Inc.|1ATT III Acquisition Corp|1upiter Neurosciences, Inc.|0Coffee Holding Co., Inc.|0Jowell Global Ltd.|1X Luxventure Group Inc.|1ayud Global Logistics Limited|0The Joint Corp.|0Jianzhi Education Technology Group Company Limited|2uzi Holdings, Inc.|0KALA BIO, Inc.|1aiser Aluminum Corporation|2rdigan, Inc.|3ooooo Ltd.|0Skyline Builders Group Holding Limited|0Karbon Capital Partners Corp.|t|t|0FST Corp.|0Kingsoft Cloud Holdings Limited|1ochav Defense Acquisition Corp.|w|w|2diak AI, Inc.|f|1eurig Dr Pepper Inc.|1imball Electronics, Inc.|1eel Infrastructure Corp.|2lly Services, Inc.|k|2waunee Scientific Corporation|2ystone Acquisition Corp.|q|q|2ntucky First Federal Bancorp|1&F Growth Acquisition Corp. II|v|v|1estrel Group, Ltd.|1olibri Global Energy Inc.|0OrthoPediatrics Corp.|0KIDZ AI Inc.|c|1ingstone Companies, Inc|0Nauticus Robotics, Inc.|n|0KLA Corporation|1ulicke and Soffa Industries, Inc.|1ailera Therapeutics, Inc.|2laris Therapeutics, Inc.|3tura, Inc.|1LX Energy Services Holdings, Inc.|1imberly-Clark Corporation|1amada Ltd.|1-Tech Solutions Company Limited|1estra Medical Technologies, Ltd.|1andi Technologies Group, Inc.|1iniksa Pharmaceuticals International, plc|1odiak Sciences Inc|2pin Corporation|2ss Corporation|0CSLM Digital Asset Acquisition Corp III|z III|z III|0Katapult Holdings, Inc.|1iora Pharmaceuticals, Inc.|1aryopharm Therapeutics Inc.|1RAKacquisition Corp|k|k|036Kr Holdings Inc.|0KORU Medical Systems, Inc.|1ornit Digital Ltd.|1earny Financial|2ros Therapeutics, Inc.|1orro Bio, Inc.|3sana Biosciences, Inc.|1arat Packaging Inc.|1ura Sushi USA, Inc.|1rystal Biotech, Inc.|1nightscope, Inc.|0Joint Stock Company Kaspi.kz|0Key Tronic Corporation|1ratos Defense & Security Solutions, Inc.|0Pasithea Therapeutics Corp.|0K2 Capital Acquisition Corporation|y|y|1ura Oncology, Inc.|2stom Entertainment, Inc.|1VH Industries, Inc.|1aixin Holdings|1yivstar Group Ltd.|j|2mera Therapeutics, Inc.|2ntra Bio, Inc.|2verna Therapeutics, Inc.|1azia Therapeutics Limited|0Standard BioTools Inc.|0Lakewood-Amedex Biotherapeutics Inc.|0SEALSQ Corp|0LaFayette Acquisition Corp.|r|r|2keland Industries, Inc.|2mar Advertising Company|0Gladstone Land Corporation|q|q|0Landmark Bancorp Inc.|2ser Photonics Corporation|0nLIGHT, Inc.|0Galata Acquisition Corp. II|r|r|0Laureate Education, Inc.|0Robot Consulting Co., Ltd.|0Li Bang International Corporation Inc.|1B Pharmaceuticals Inc|1iberty Global Ltd.|j|j|1akeshore Acquisition III Corp.|v|v|1ocafy Limited|e|1ucid Group, Inc.|1CNB Corporation|1ifetime Brands, Inc.|1ands' End, Inc.|1incoln Electric Holdings, Inc.|1eader's Advantage Acquisition Corp.|0SemiLEDS Corporation|0Lee Enterprises, Incorporated|2gacy Housing Corporation|3end Biotech Corporation|1ENZ Therapeutics, Inc.|1eslie's, Inc.|2xaria Bioscience Corp.|2apfrog Acquisition Corporation|w|w|1ifecore Biomedical, Inc.|4MD, Inc.|c|1EIFRAS Co., Ltd.|1ifeStance Health Group, Inc.|3toff Mobile, Inc.|2ttelfuse, Inc.|2fevantage Corporation|4ward Ltd.|1ucas GC Limited|1ion Group Holding Ltd.|1GI Homes, Inc.|1egence Corp.|1igand Pharmaceuticals Incorporated|1argo Inc.|1ongeveron Inc.|1inkhome Holdings Inc.|2anhe Sowell International Group Ltd|2 Auto Inc.|2chen International Limited|0AEye, Inc.|0Chicago Atlantic BDC, Inc.|0Life360, Inc.|0Ethos Technologies Inc.|0Liberty Latin America Ltd.|q|q|0Neutron Holdings, Inc.|0Liminatus Pharma, Inc.|m|2nde plc|3coln Educational Services Corporation|3dblad Expeditions Holdings Inc.|3eage, Inc.|0Interlink Electronics, Inc.|0LiqTech International, Inc.|1umentum Holdings Inc.|1ite Strategy, Inc.|2ve Ventures Incorporated|3aNova PLC|1akeland Financial Corporation|4front Biotherapeutics|1KQ Corporation|1ake Superior Acquisition Corp.|v|v|1iberty Live Holdings, Inc.|r|1eMaitre Vascular, Inc.|1imbach Holdings, Inc.|3oneira Co|1umexa Imaging Holdings, Inc.|2nai Bioworks Inc.|1inkers Industries Limited|1ENSAR, Inc.|0Alliant Energy Corporation|0Lantheus Holdings, Inc.|3zaTech Global, Inc.|m|0Manhattan Bridge Capital, Inc|0LOBO TECHNOLOGIES LTD.|0El Pollo Loco Holdings, Inc.|0Logitech International S.A.|1eonaBio, Inc.|1oop Industries, Inc.|0Grand Canyon Education, Inc.|0Lotus Technology Inc.|l|0The Lovesac Company|0Live Oak Acquisition Corp. VI|1aunch One Acquisition Corp.|s|s|7Two Acquisition Corp.|s|s|1ipocine Inc.|1aunchpad Cadenza Acquisition Corp I|zI|zI|1PL Financial Holdings Inc.|1ightPath Technologies, Inc.|2quidia Corporation|7ty Services, Inc.|1am Research Corporation|1ead Real Estate Co., Ltd|1a Rosa Holdings Corp.|2rimar Therapeutics, Inc.|1esaka Technologies, Inc.|1ake Shore Bancorp, Inc.|2ttice Semiconductor Corporation|1eishen Energy Holding Co., Ltd.|1isata Therapeutics, Inc.|1andstar System, Inc.|1ightbridge Corporation|1atigo Biotherapeutics, Inc.|1ong Table Growth Corp.|n|n|1antern Pharma Inc.|4ronix, Inc.|0Sports Entertainment Gaming Global Corporation|0Lucid Diagnostics Inc.|0Innovative Eyewear, Inc.|o|0lululemon athletica inc.|0Pulmonx Corporation|0Intuitive Machines, Inc.|0Lulu's Fashion Lounge Holdings, Inc.|1iveOne, Inc.|2ghtWave Acquisition Corp.|r|r|2feway Foods, Inc.|2ghtwave Logic, Inc.|1exinFintech Holdings Ltd.|1ixiang Education Holding Co., Ltd.|1exeo Therapeutics, Inc.|3icon Pharmaceuticals, Inc.|1yell Immunopharma, Inc.|2ft, Inc.|1SI Industries Inc.|1egalZoom.com, Inc.|1Z Technology Holdings Limited|0Maase Inc.|1elar Acquisition Corp. I|p|p|1agnitude International Ltd|2ko Mining Corp|2ma's Creations, Inc.|2xsMaking Inc.|2ssimo Group|2nhattan Associates, Inc.|2rriott International|1ARA Holdings, Inc.|1arine Petroleum Trust|03 E Network Technology Group Ltd|0908 Devices Inc.|0Mattel, Inc.|1etalpha Technology Holding Limited|1atthews International Corporation|0J. W. Mays, Inc.|0Maze Therapeutics, Inc.|2sterBeef Group|1Body AI Ltd.|1arathon Bancorp, Inc.|1erchants Bancorp|h|h|h|1ustang Bio, Inc.|1obileye Global Inc.|1edallion Bank|1icrobot Medical Inc.|1oleculin Biotech, Inc.|1alibu Boats, Inc.|13-Brigade Acquisition VI Corp.|v|v|1ercantile Bank Corporation|1BX Biosciences, Inc.|1ountain Crest Acquisition 6 Corp.|y|y|1etroCity Bankshares, Inc.|1asterCraft Boat Holdings, Inc.|0Yorkville Acquisition Corp.|r|r|0Mechanics Bancorp|1icrochip Technology Incorporated|x|1archex, Inc.|0Seres Therapeutics, Inc.|0Monarch Casino & Resort, Inc.|0Charming Medical Limited|0Spectral AI, Inc.|h|0MongoDB, Inc.|1DB Capital Holdings, LLC|1edicus Pharma Ltd.|j|1adrigal Pharmaceuticals, Inc.|1ediaco Holding Inc.|3line Inc.|1ondelez International, Inc.|1edalist Diversified, Inc.|3iWound Ltd.|1iMedx Group, Inc|1DxHealth SA|1edpace Holdings, Inc.|0DataMeds AI, Inc.|0Magic Empire Global Limited|1ercadoLibre, Inc.|0Jyong Biotech Ltd.|0Methanex Corporation|2rcer International Inc.|2shflow Acquisition Corp.|q|q|3oblast Limited|2ta Platforms, Inc.|0Ramaco Resources, Inc.|m|m|m|0M Evo Global Acquisition Corp II|w|w|1indForge Inc.|0mF International Limited|0MidCap Financial Investment Corporation|ztion|1edallion Financial Corp.|1idera Food Processing, Inc.|1GE Energy Inc.|1illennium Group International Holdings Limited|1egan Holdings Limited|1agnite, Inc.|2croGenics, Inc.|1GP Ingredients, Inc.|1cGrath RentCorp|1ega Fortune Company Limited|1angoceuticals, Inc.|1eiraGTx Holdings plc|2tagenomi Therapeutics, Inc.|1agyar Bancorp, Inc.|1eridian3 Industrials Acquisition Corp|zorp|zorp|0The Middleby Corporation|0Mint Incorporation Limited|1IND Technology, Inc.|2RA Pharmaceuticals, Inc.|1irum Pharmaceuticals, Inc.|2lestone Pharmaceuticals Inc.|2tek Systems, Inc.|1KDWELL Tech Inc.|h|1cKinley Acquisition Corporation|w|w|1KS Inc.|1arketWise, Inc.|6Axess Holdings, Inc.|2cKenzie Realty Capital, Inc.|1ountain Lake Acquisition Corp. II|y|y|1esa Laboratories, Inc.|1ount Logan Capital Inc.|o|1elco Resorts & Entertainment Limited|1oolec Science SA|h|1icroAlgo, Inc.|2llerKnoll, Inc.|1oonLake Immunotherapeutics|1ineralys Therapeutics, Inc.|3iMed Group, Inc.|1artin Midstream Partners L.P.|1erit Medical Systems, Inc.|1iluna Acquisition Corp|n|n|1akeMyTrip Limited|1IND C.T.I. Ltd.|1obile-health Network Solutions|0monday.com Ltd.|0MannKind Corporation|1ediciNova, Inc.|1onopar Therapeutics Inc.|3ro, Inc.|1ainStreet Bancshares, Inc.|r|1onster Beverage Corporation|3tauk Renewables, Inc.|2mentus Inc.|2neyHero Limited|h|2bilicom Limited|h|4a Medical, Inc.|4x Labs, Inc.|g|2dular Medical, Inc.|2lecular Partners AG|0Hello Group Inc.|0Morningstar, Inc.|0Corvex, Inc.|0Motorcar Parts of America, Inc.|1id Penn Bancorp|1apLight Therapeutics, Inc.|1onolithic Power Systems, Inc.|1arqeta, Inc.|0Everspin Technologies, Inc.|0Meridian Corporation|3cator Acquisition Corp.|q|q|4ury Systems Inc|3idian Holdings Inc.|3eo BioPharma Group plc|1arker Therapeutics, Inc.|1erlin, Inc.|1EDIROM Healthcare Technologies Inc.|1oderna, Inc.|1urano Global Investments PLC|t|1arten Transport, Ltd.|3avai LifeSciences Holdings, Inc.|3vell Technology, Inc.|3ex Group Limited|1ultiSensor AI Holdings, Inc.|t|1idland States Bancorp, Inc.|s|3dlesex Water Company|2crosoft Corporation|1otorsport Games Inc.|1asonglory Limited|0Satellos Bioscience Inc.|0Maison Solutions Inc.|0Strategy Inc|0Market Technology Acquisition Corp|y|y|1MTec, Inc.|1atch Group, Inc.|2ris-Tech Ltd.|f|1ingteng International Corporation Inc.|1annatech, Incorporated|2terialise NV|3rix Service Company|1ACOM Technology Solutions Holdings, Inc.|1etaVia Inc.|1icron Technology, Inc.|1uzero Acquisition Corp|n|n|1VB Financial Corp.|1icroVision, Inc.|5vast Holdings, Inc.|3ware Co., Ltd.|0SOLV Energy, Inc.|0Marwynn Holdings, Inc.|2xCyte, Inc.|3Linear, Inc|0First Western Financial, Inc.|0Myriad Genetics, Inc.|0PLAYSTUDIOS, Inc.|0MYR Group, Inc.|1yseum.AI, Inc.|2 Size, Inc.|1aywood Acquisition Corp. 2|r|r|r|0The Marzetti Company|0Nano Labs Ltd|2aS Technology Inc.|1iagen Bioscience, Inc.|1atural Alternatives International, Inc.|2kamoto Inc.|0Jinxin Technology Holding Company|0Namib Minerals|e|1ewAmsterdam Pharma Company N.V.|w|1athan's Famous, Inc.|3ure's Sunshine Products, Inc.|2utilus Biotechnology, Inc.|2vient Corporation|3an, Inc.|1ioCorp Developments Ltd.|1B Bancorp, Inc.|1ebius Group N.V.|2urocrine Biosciences, Inc.|1ortheast Bank|2vaBridge Biosciences|1ewbridge Acquisition Limited|t|t|1BT Bancorp Inc.|1anobiotix S.A.|1ewcelX Ltd.|3 Century Logistics (BVI) Limited|2o-Concept International Group Holdings Limited|1ational CineMedia, Inc.|1uCana plc|0nCino, Inc.|0Southern Cross Acquisition I Corp.|y|y|y|0Netcapital Inc.|f|1ocera, Inc.|0Intercont (Cayman) Limited|0The9 Limited|0Nasdaq, Inc.|1oodles & Company|0ENDRA Life Sciences Inc.|0Nordson Corporation|3thEast Community Bancorp, Inc.|1ewegg Commerce, Inc.|2oGenomics, Inc.|3gen Corporation|3node Inc.|3Volta Inc.|d|2phros, Inc.|0Minerva Neurosciences, Inc|0National Energy Services Reunited Corp|1euphoria Therapeutics Inc.|2wtekOne, Inc.|f|f|f|f|f|2xMetals Mining Corp.|3xen International Ltd.|3era Technologies Ltd|n|3tDecade Corporation|2w Fortress Energy Inc.|o|2tflix, Inc.|2rvGen Pharma Corp.|2urogene Inc.|2wHold Investment Corp IV|q|q|1ational Healthcare Properties, Inc.|z.|3ural Health Trends Corp.|1ICE Ltd|1icola Mining Inc.|2ki BioSolutions, Inc.|2oCorp Developments Ltd.|1IP Group Inc.|1iu Technologies|1ewGenIvf Group Limited|n|1ixxy, Inc.|0Terra Innovatum Global N.V.|0National Bankshares, Inc.|1ektar Therapeutics|1karta, Inc.|1omad Power Solutions, Inc.|1ew Mountain Finance Corporation|w|1MI Holdings Inc|2P Acquisition Corp.|l|l|1eumora Therapeutics, Inc.|2wmark Group, Inc.|2uroOne Medical Technologies Corporation|2xtNav Inc.|1N, Inc.|1ano Dimension Ltd.|5Nuclear Energy Inc.|0Anbio Biotechnology|0NANO-X IMAGING LTD|1I Holdings, Inc.|0CO2 Energy Transition Corp.|r|r|r|0NOMADAR Corp.|1ovanta Inc.|c|1ew Providence Acquisition Corp. III|zI|zI|2uropace, Inc.|0Texxon Holding Limited|0NRC Health|1erdWallet, Inc.|1orthrim BanCorp Inc|1urix Therapeutics, Inc.|1euroSense Therapeutics Ltd.|s|1RX Pharmaceuticals, Inc.|1orthStrive Acquisition Corp I.|v|v|v|0Insight Enterprises, Inc.|0Neostellar Capital Corp.|o|0InspireMD Inc.|0NAPCO Security Technologies, Inc.|1STS Bancorp, Inc.|1ortech Systems Incorporated|1etApp, Inc.|1ETCLASS TECHNOLOGY INC|1etScout Systems, Inc.|3Ease, Inc.|1ETGEAR, Inc.|1eOnc Technologies Holdings, Inc.|1orthern Technologies International Corporation|0Intellia Therapeutics, Inc.|0Nutanix, Inc.|1atera, Inc.|1utriband Inc.|e|1extTrip, Inc.|1orthern Trust Corporation|q|1etskope, Inc.|1ETSOL Technologies Inc.|1ewbury Street II Acquisition Corp|y|y|3 Era Energy & Digital, Inc.|u|0Eagle Nuclear Energy Corp.|q|0Nuran Wireless Inc.|2tex Health Inc.|2wellis, Inc.|1ovavax, Inc.|3oCure Limited|1uvectis Pharma, Inc.|1VIDIA Corporation|2E Corporation|1ova Ltd.|1vni Group Limited|i|0enVVeno Medical Corporation|0Navitas Semiconductor Corporation|1OVONIX Limited|1orthwest Bancshares, Inc.|0newcleo plc|b|0NorthWestern Energy Group, Inc.|3wood Financial Corp.|0CL Workshop Group Limited|0Newell Brands Inc.|1WPX Infrastructure, Inc.|1ews Corporation|g|3ton Golf Company, Inc.|2xus Advanced Technologies Inc.|w|3Gel, Inc|b|2ighborhood Intelligence, Inc.|2xalin Technology, Inc.|1XP Semiconductors N.V.|1extPlat Corp|3star Media Group, Inc.|3tpower Inc.|4Cure, Inc.|3entis Technologies Inc.|3t Technology Holding Inc.|4NRG, Inc.|1ayax Ltd.|1yxoah SA|0OmniAb, Inc.|c|1aktree Acquisition Corp. III Life Sciences|zSciences|zSciences|1xley Bridge Acquisition Limited|1ur Bond, Inc.|1xley Bridge Acquisition Limited|w|1rchestra BioMed Holdings, Inc.|2ange County Bancorp, Inc.|1bsidian Therapeutics, Inc.|1ptical Cable Corporation|1FS Credit Company, Inc.|o|o|1ceanFirst Financial Corp.|1riental Culture Holding LTD|1cugen, Inc.|2eanLight Acquisition Corporation|y|y|y|2ulis Holding AG|h|1aktree Specialty Lending Corporation|1ctave Intelligence plc|2ular Therapeutix, Inc.|1DDITY Tech Ltd.|1ld Dominion Freight Line, Inc.|1dyssey Therapeutics, Inc.|4ight.ai Inc.|1rion Energy Systems, Inc.|1FA Group|1rthofix Medical Inc.|1mega Flex, Inc.|1FS Capital Corporation|n|n|1sisko Gold Group Inc.|1rganigram Global Inc.|1ceanhawk Acquisition Corp.|r|r|1rion180 Insurance Group Inc.|1neIM Acquisition Corp.|n|n|1IO Group|9|1kta, Inc.|1nKure Therapeutics, Inc.|1KYO Pharma Limited|0The OLB Group, Inc.|0Universal Display Corporation|0Ollie's Bargain Outlet Holdings, Inc.|2ema Pharmaceuticals, Inc.|3nox Industries Inc.|1utset Medical, Inc.|0Grupo Aeroportuario del Centro Norte S.A.B. de C.V.|0Omnicell, Inc.|2ada Health, Inc.|2eros Corporation|1dyssey Marine Exploration, Inc.|1hmyhome Limited|1MS Energy Technologies Inc.|1N Semiconductor Corporation|1ld National Bancorp|k|k|0BeOne Medicines Ltd.|01RT Acquisition Corp.|l|l|0Onconetix, Inc.|4lytics Biotech Inc.|2das Inc|2eConstruction Group Limited|1NE Nuclear Energy Inc.|1neWater Marine Inc.|2folio Holdings Inc.|l|2eMedNet Corp|e|1fferpad Solutions Inc.|1PAL Fuels Inc.|2 Bancorp|1ption Care Health, Inc.|2endoor Technologies Inc|p|p|p|1ffice Properties Income Trust|1pko Health, Inc.|2era Limited|2ortun Financial Corporation|2timizeRx Corporation|6 Health Corp.|0Syntec Optics Holdings, Inc.|s|0Optex Systems Holdings, Inc.|0Eightco Holdings Inc.|0Organogenesis Holdings Inc.|2ic Pharmaceuticals, Inc.|3on Digital Corp.|3gin Investment Corp I|o|o|2uka Therapeutics, Inc.|2angekloud Technology Inc.|1'Reilly Automotive, Inc.|1ramed Pharmaceuticals Inc.|2rstown Financial Services, Inc.|1ld Second Bancorp, Inc.|1SI Systems, Inc.|1neSpan Inc.|1sprey Acquisition Corp. III|s|s|1ne Stop Systems, Inc.|1stin Technology Group Co., Ltd.|1raSure Technologies, Inc.|1neSpaWorld Holdings Limited|1pen Text Corporation|1TG Acquisition Corp. I|n|n|1utlook Therapeutics, Inc.|1atly Group AB|1tter Tail Corporation|1uster, Inc.|1hio Valley Banc Corp.|1vid Therapeutics Inc.|1ak Valley Bancorp (CA)|1BOOK Holdings Inc.|1xbridge Re Holdings Limited|s|2ford Lane Capital Corp.|p|p|p|p|p|p|p|7Square Capital Corp.|r|r|1yster Enterprises II Acquisition Corp|zorp|zorp|0Bank OZK|8|0Plains All American Pipeline, L.P.|1roem Acquisition Corp I|o|o|1acific Biosciences of California, Inc.|1ioneer Acquisition I Corp|q|q|1lains GP Holdings, L.P.|1hibro Animal Health Corporation|1roficient Auto Logistics, Inc.|1alisade Bio, Inc.|3oma Acquisition Corp I|p|p|1AMT CORP|1angaea Logistics Solutions Ltd.|2lo Alto Networks, Inc.|0Banzai International, Inc.|q|0Park Dental Partners, Inc.|2ssage Bio, Inc.|1ing An Biomedical Co., Ltd.|1atrick Industries, Inc.|1AVmed Inc.|1aranovus Entertainment Technology Ltd.|2tria Investments Limited|2yoneer Global Inc.|3Pay Corporation|3sign, Inc.|3chex, Inc.|1rivate Bancorp of America, Inc.|1ioneer Bancorp, Inc.|1athfinder Bancorp, Inc.|1owerBank Corporation|1arabilis Medicines, Inc.|1syence Biomedical Ltd.|n|1uma Biotechnology Inc|1remium Catering (Holdings) Limited|2oCap Acquisition Corp|n|n|1ACCAR Inc.|1CB Bancorp|1icoCELA Inc.|1acira BioSciences, Inc.|1rocessa Pharmaceuticals, Inc.|1ureCycle Technologies, Inc.|s|s|1aylocity Holding Corporation|0Vaxcyte, Inc.|0Pure Cycle Corporation|1erpetuals.com Ltd|1DD Holdings Inc.|1ro-Dex, Inc.|1DF Solutions, Inc.|1once Financial Group, Inc.|1DS Biotechnology Corporation|1alladyne AI Corp.|1eoples Bancorp of North Carolina, Inc.|gInc.|2ace Acquisition Corp|m|m|m|1hillips Edison & Company, Inc.|1egasystems Inc.|2nguin Solutions, Inc.|1ENN Entertainment, Inc.|1epsiCo, Inc.|3Gen Inc.|2rion Network Ltd|3ma-Fix Environmental Services, Inc.|2tMed Express, Inc.|0TDH Holdings, Inc.|0Pinnacle Food Group Limited|1referred Bank|2incipal Financial Group Inc|1eoples Financial Services Corp.|1rofusa, Inc.|1henixFIN Corporation|l|1antages Capital Acquisition Corporation|zation|zation|1eapack-Gladstone Financial Corporation|1recigen, Inc.|2ogyny, Inc.|1agaya Technologies Ltd.|o|1harming Group N.V.|3thom Pharmaceuticals, Inc.|2io Pharmaceuticals Corp.|2oenix Asia Holdings Limited|0First Phosphate Corp.|0Phunware, Inc.|2arvaris N.V.|0Impinj, Inc.|0PicS N.V.|13 Health Partners Inc.|n|1arke Bancorp, Inc.|4-Ohio Holdings Corp.|1hotronics, Inc.|0Dave & Buster's Entertainment, Inc.|0Plumas Bancorp|1olibeli Group Ltd|1layboy, Inc.|0Children's Place, Inc. (The)|0Pelican Acquisition II Corporation|y|y|1lum Acquisition Corp. IV|p|p|1alomar Holdings, Inc.|1reformed Line Products Company|1liant Therapeutics, Inc.|1olyrizon Ltd.|1ulse Biosciences, Inc|5nmore Ltd.|1laytika Holding Corp.|1alantir Technologies Inc.|1lug Power, Inc.|3ri Inc.|0ePlus inc.|0Plutus Financial Group Limited|2exus Corp.|1olaryx Therapeutics, Inc.|1MA Graphene Technology Group Inc.|1owell Max Limited|1harmaCyte Biotech, Inc.|1rimech Holdings Ltd.|2oMIS Neurosciences Inc.|1erimeter Acquisition Corp. I|t|t|0CPI Card Group Inc.|0PMV Pharmaceuticals, Inc.|1N Smart Energy Limited|1atriot National Bancorp Inc.|1rimeEnergy Resources Corporation|0The Pennant Group, Inc.|0Precision Optics Corporation, Inc.|1odcastOne, Inc.|0Insulet Corporation|0POET Technologies Inc.|1olar Power, Inc.|0Andretti Acquisition Corp. II|t|t|0POMDOCTOR LIMITED|1ono Capital Four, Inc.|n|n|3y AI Inc.|2ol Corporation|2wer Integrations, Inc.|4ll Industries, Inc.|0Outdoor Holding Company|n|0Purple Biotech Ltd.|1ilgrim's Pride Corporation|1ropanc Biopharma, Inc.|1ublic Policy Holding Company, Inc.|1erma-Pipe International Holdings, Inc.|2ople Incorporated|1ioneer Power Solutions, Inc.|1erpetua Resources Corp.|1RA Group, Inc.|1raxis Precision Medicines, Inc.|1orch Group, Inc.|1ROCEPT BioRobotics Corporation|1erdoceo Education Corporation|1renetics Global Limited|o|1RF Technologies Ltd.|1rogress Software Corporation|2esurance Holdings, Inc.|p|3lude Therapeutics Incorporated|2ime Medicine, Inc.|2ofound Medical Corp.|3Kidney Corp.|2airie Operating Co.|2ovident Financial Holdings, Inc.|1urple Innovation, Inc.|1recipio, Inc.|2oQR Therapeutics N.V.|1eraso Inc.|1rothena Corporation plc|2iority Technology Holdings, Inc.|0CarParts.com, Inc.|0Privia Health Group, Inc.|1araZero Technologies Ltd.|1rospect Capital Corporation|1erformance Shipping Inc.|1S International Group Ltd.|1ower Solutions International, Inc.|1aramount Skydance Corporation|1riceSmart, Inc.|1ersonalis, Inc.|1olestar Automotive Holding UK Limited|zted|1asqal Holding SA|h|2triot Acquisition Corp.|p|p|1TC Inc.|4Therapeutics, Inc.|1atterson-UTI Energy, Inc.|1rotagonist Therapeutics, Inc.|1TL LTD|1ortillo's Inc.|1alatin Technologies, Inc.|1eloton Interactive, Inc.|1raetorian Acquisition Corp.|s|s|1attern Group Inc.|1ubMatic, Inc.|2lmatrix, Inc.|0Hyperliquid Strategies Inc|0Aureus Greenway Holdings Inc.|0Palvella Therapeutics, Inc.|1owerCompute, Inc.|1erella Weinberg Partners|1owerlaw Corp.|1ixelworks, Inc.|1yxis Tankers Inc.|1olyPid Ltd.|1ayPal Holdings, Inc.|1yxis Oncology, Inc.|1apa John's International, Inc.|0QDRO Acquisition Corp.|m|m|0D-Wave Quantum Inc.|0Q/C Technologies, Inc.|1UALCOMM Incorporated|1CR Holdings, Inc.|1uidelOrtho Corporation|2etta Acquisition Corporation|u|u|1fin Holdings, Inc.|1uhuo Limited|2alys, Inc.|3ntum Corporation|2mulusAI, Inc.|1NB Corp.|1uince Therapeutics, Inc.|2anome Technologies, Inc.|2oin Pharmaceuticals, Ltd.|2inStreet, Inc.|2antinuum Inc.|5um Biopharma Ltd.|0Nuveen NASDAQ 100 Dynamic Overwrite Fund|0Quest Resource Holding Corporation|1orvo, Inc.|1uantumScape Corporation|3rtzsea Acquisition Corporation|x|x|3ntum-Si Incorporated|1TREX Quantum Ltd.|2 Imaging Holdings, Inc.|1uanterix Corporation|132 Bio Inc.|1uantum Computing Inc.|9yber N.V.|2ickLogic Corporation|2antumsphere Acquisition Corp.|v|v|0uniQure N.V.|0QVC Group, Inc.|1uantum X Labs Inc.|0Research Alliance Corporation III|vV|1adiopharm Theranostics Limited|0Freightcar America, Inc.|0Rain Enhancement Technologies Holdco, Inc.|zo, Inc.|2nd Capital Corporation|3ge Capital Acquisition Corp.|v|v|3i Therapeutics Holdings, Inc.|2pport Therapeutics, Inc.|0Ultragenyx Pharmaceutical Inc.|0Rave Restaurant Group, Inc.|0Erayak Power Solution Group Inc.|0RBB Bancorp|1ibbon Communications Inc.|1epublic Bancorp, Inc.|1hinebeck Bancorp, Inc.|1obin Energy Ltd.|1ed Cat Holdings, Inc.|1iver City Bank|0Avita Medical, Inc.|0Rocket Pharmaceuticals, Inc.|4y Brands, Inc.|1CM Technologies, Inc.|1econ Technology, Ltd.|2dCloud Holdings plc|1ising Dragon Acquisition Corp.|v|v|1epublic Digital Acquisition Company|zy|zy|1adcom Ltd.|1idgetech, Inc.|1edhill Biopharma Ltd.|2ading International Inc|p|1adNet, Inc.|1ideNow Group, Inc.|1ed Violet, Inc.|1adware Ltd.|1oadzen, Inc.|d|0The RealReal, Inc.|0Real REMAX Group Inc.|2born Coffee, Inc.|2ctitude Holdings Ltd|0Chicago Atlantic Real Estate Finance, Inc.|0Research Frontiers Incorporated|2gency Centers Corporation|r|r|5eron Pharmaceuticals, Inc.|2kor Systems, Inc.|1ichardson Electronics, Ltd.|1emitly Global, Inc.|2nt the Runway, Inc.|3X Enterprises Corp.|2plimune Group, Inc.|2To Eco-Solutions, Inc.|2velation Biosciences, Inc.|s|2ynolds Consumer Products Inc.|1F Acquisition Corp II|m|m|mI|n|n|3Industries, Ltd.|1egencell Bioscience Holdings Limited|1GC Resources Inc.|1epligen Corporation|1oyal Gold, Inc.|1EGENXBIO Inc.|1esources Connection, Inc.|2gis Corporation|1igetti Computing, Inc.|n|2bbon Acquisition Corp|n|n|1CI Hospitality Holdings, Inc.|1igel Pharmaceuticals, Inc.|0BRC Group Holdings, Inc.|o|o|o|o|o|0Algorhythm Holdings, Inc.|0Riot Platforms, Inc.|2vian Automotive, Inc.|1epublic Airways Holdings Inc.|0Arcadia Biosciences, Inc.|0Rocket Lab Corporation|7One Inc.|1elay Therapeutics, Inc.|3mada Therapeutics, Inc.|1allybio Corporation|1ichmond Mutual Bancorporation, Inc.|1ambus, Inc.|1ocky Mountain Chocolate Factory, Inc.|2yalty Management Holding Corporation|zion|0Suncrete, Inc.|0Resolution Minerals Ltd|1imini Street, Inc.|0The RMR Group Inc.|0Real Messenger Corporation|q|1ockwell Medical, Inc.|0Atrium Therapeutics, Inc.|0Cartesian Therapeutics, Inc.|0Rainier Acquisition Corporation|v|v|0TransCode Therapeutics, Inc.|0Range Capital Acquisition Corp II|x|x|1ein Therapeutics, Inc.|2New Energy Global plc|2novoRx, Inc.|0Construction Partners, Inc.|0Rank One Computing Corporation|0Gibraltar Industries, Inc.|0Roivant Sciences Ltd.|2ku, Inc.|2ma Green Finance Limited|2ot, Inc.|2per Technologies, Inc.|2ss Stores, Inc.|1epay Holdings Corporation|1apid7, Inc.|1epublic Power Group Limited|1apid Micro Biosystems, Inc.|1oyalty Pharma plc|1ichtech Robotics Inc.|1ed River Bancshares, Inc.|1RE Ventures Acquisition Corp.|u|u|1ed Robin Gourmet Burgers, Inc.|6ck Resorts, Inc.|2search Solutions, Inc|4rvoir Media, Inc..|2natus Tactical Acquisition Corp I|z|z|1TB Digital, Inc.|1ubico Inc.|1UM Group Inc.|e|0Sunrun Inc.|0Rush Enterprises, Inc.|m|1evolution Medicines, Inc.|q|1iverview Bancorp Inc|1ail Vision Ltd.|g|1unway Growth Finance Corp.|r|r|1ecursion Pharmaceuticals, Inc.|1xSight, Inc.|1ackspace Technology, Inc.|1yanair Holdings plc|1uanyun Edai Technology Inc.|1YTHM, Inc.|0rYojbaba Co., Ltd.|0Rhythm Pharmaceuticals, Inc.|1oze AI Inc.|1ezolute, Inc.|5ve AI PLC|e|0Space Asset Acquisition Corp.|t|t|1abre Corporation|1AB Biotherapeutics, Inc.|p|1afety Insurance Group, Inc.|0XCF Global, Inc.|0SAGTEC GLOBAL LIMITED|1aia, Inc.|1cience Applications International Corporation|1AIHEAT Limited|f|1ailPoint, Inc.|1ilvercrest Asset Management Group Inc.|1ana Biotechnology, Inc.|3goma Technologies Corporation|3mina Corporation|1trive, Inc.|1atellogic Inc.|f|1BA Communications Corporation|2C Medical Group Holdings Incorporated|1eacoast Banking Corporation of Florida|1BC Medical Group Holdings Incorporated|1harplink, Inc.|1B Financial Group, Inc.|1unshine Biopharma Inc.|n|1inclair, Inc.|1tar Bulk Carriers Corp.|1abra Health Care REIT, Inc.|1tarbucks Corporation|1cage Future|c|1outhern Cross Acquisition II Corp.|1cholastic Corporation|1C II Acquisition Corp.|n|n|1ocket Mobile, Inc.|1cilex Holding Company|m|3nai Immunotherapeutics Ltd.|3enture Holdings, Inc.|0comScore, Inc.|0Social Commerce Partners Corporation|zn|zn|1canSource, Inc.|2ribe Therapeutics Inc.|0374Water Inc.|0SCYNEXIS, Inc.|1antacruz Silver Mining Ltd.|1unCar Technology Group Inc.|s|1chrodinger, Inc.|1iddhi Acquisition Corp|n|n|1adot Group Inc.|1tardust Power Inc.|j|0Vivid Seats Inc.|g|0SolarEdge Technologies, Inc.|0Origin Agritech Limited|0Seer, Inc.|1ports Entertainment Gaming Global Corporation|1EI Investments Company|0Global Self Storage, Inc.|0Seneca Foods Corp.|i|3seonics Holdings, Inc.|2pterna, Inc.|2ra Prognostics, Inc.|3ve Robotics Inc.|0Aptera Motors Corp.|0Seven Hills Realty Trust|2zzle Inc.|1ound Financial Bancorp, Inc.|1mithfield Foods, Inc.|1amfine Creation Holdings Group Limited|1titch Fix, Inc.|1prouts Farmers Market, Inc.|1immons First National Corporation|1outhern First Bancshares, Inc.|1hengfeng Development Limited|1aga Communications, Inc.|1uperior Group of Companies, Inc.|1ight Sciences, Inc.|1corpio Gold Corporation|1ingularity Future Technology Ltd.|2gma Lithium Corporation|1agimet Biosciences Inc.|1pyGlass Pharma, Inc.|1ANGRIX INC.|1urgery Partners, Inc.|1haronAI Holdings, Inc.|2ore Bancshares, Inc.|1otera Health Company|1henandoah Telecommunications Co|1HF Holdings, Inc.|i|1himmick Corporation|1eanergy Maritime Holdings Corp.|1hoals Technologies Group, Inc.|1CHMID Group N.V.|h|1hoe Station Group, Inc.|1teven Madden, Ltd.|1hopify Inc.|0RMG ML Sports Holdings|m|m|0Shuttle Pharmaceuticals Holdings, Inc.|1I-BONE, Inc.|1idus Space, Inc.|2ebert Financial Corp.|2fy Technologies Limited|1IGA Technologies Inc.|1elective Insurance Group, Inc.|v|1ilicom Ltd|3o Pharma, Inc.|1IM Acquisition Corp. I|n|n|1ilicon Motion Technology Corporation|2Ntx Technologies, Inc.|2onna Therapeutics, Inc.|2riusXM Holdings Inc.|2Time Corporation|1cienjoy Holding Corporation|1K hynix Inc.|1kinHealth Systems Inc.|1KK Holdings Limited|1kyward Specialty Insurance Group, Inc.|3AI, Inc.|b|3e Bioscience, Inc.|3 Quarry Inc.|3West, Inc.|1KYX Platforms Corp.|1ilicon Laboratories, Inc.|1L Science Holding Limited|1olid Biosciences Inc.|1lide Insurance Holdings, Inc.|1olid Power, Inc.|h|1uper League Enterprise, Inc.|1mart Logistics Global Limited|1ol-Gel Technologies Ltd.|1LM Corporation|f|0Brera Holdings PLC|0Silence Therapeutics Plc|1tabilis Solutions, Inc.|1oluna Holdings, Inc.|l|1imulations Plus, Inc.|1LR Investment Corp.|1ELLAS Life Sciences Group, Inc.|1olesence, Inc.|1ilexion Therapeutics Corp|q|1outhern Missouri Bancorp, Inc.|1uper Micro Computer, Inc.|q|1mith-Midland Corporation|1ummit Therapeutics Inc.|0The Simply Good Foods Company|0Smith Micro Software, Inc.|1emtech Corporation|1anara MedTech Inc.|1martKem, Inc.|1MX (Security Matters) Public Limited Company|1olarmax Technology Inc.|1MX (Security Matters) Public Limited Company|1nail, Inc.|1mart Sand, Inc.|1andisk Corporation|1NDL Inc.|1yndax Pharmaceuticals, Inc.|1enesTech, Inc.|1toneX Group Inc.|1ecurity National Financial Corporation|1oligenix, Inc.|2noma Pharmaceuticals, Inc.|1ynopsys, Inc.|1enstar Technologies Corporation|3tage Holdings Inc.|4i Biosciences Holdings, Inc.|1ANUWAVE Health, Inc.|1anofi|1olarius Capital Acquisition Corp.|y|y|2Fi Technologies, Inc.|2und Group Inc.|2hu.com Limited|2lstice Advanced Materials Inc.|0DNA X, Inc.|0Sonos, Inc.|1OPHiA GENETICS SA|0AsiaStrategy|0Soren Acquisition Corp.|n|n|2no-Tek Corporation|2undHound AI, Inc.|j|2w Good Inc.|1afe Pro Group Inc.|1uperCom, Ltd.|1pace Exploration Technologies Corp.|1ilver Pegasus Acquisition Corp|v|v|1outh Plains Financial, Inc.|1pringview Holdings Ltd|2ark I Acquisition Corp.|p|p|2ok Holdings, Inc.|1IMPPLE LTD.|1pruce Biosciences, Inc.|1ciSparc Ltd.|1pero Therapeutics, Inc.|0ARS Pharmaceuticals, Inc.|0SPS Commerce, Inc.|1prout Social, Inc|1eaport Therapeutics, Inc.|1portsman's Warehouse Holdings, Inc.|1unPower Inc.|d|0Presidio Property Trust, Inc.|t|t|0Sportradar Group AG|1R Bancorp, Inc.|01st Source Corporation|0Sarepta Therapeutics, Inc.|1cholar Rock Holding Corporation|1trata Critical Medical, Inc.|1ensus Healthcare, Inc.|1urrozen, Inc.|1PACSphere Acquisition Corp.|s|s|s|1ummit State Bank|1tarry Sea Acquisition Corp|r|r|1S Innovations International Inc.|1ono Group N.V.|1S&C Technologies Holdings, Inc.|0E.W. Scripps Company (The)|0SSR Mining Inc.|1oundThinking, Inc.|1tratasys, Ltd.|1TAAR Surgical Company|3K Inc.|1&T Bancorp, Inc.|1tepStone Group Inc.|2reamex Corp.|2ar Fashion Culture Holdings Limited|3gwell Inc.|3r Holdings|1olidion Technology, Inc.|0Neuronetics, Inc.|0Sol Strategies Inc.|1teakholder Foods Ltd.|0The ONE Group Hospitality, Inc.|0Steel Dynamics, Inc.|2arling Oncology, Inc.|n|2oneCo Ltd.|3ke Therapeutics, Inc.|2rategic Education, Inc.|7y Inc|c|c|c|2erling Infrastructure, Inc.|1utro Biopharma, Inc.|1tar Equity Holdings, Inc.|q|1TRATTEC SECURITY CORPORATION|1tarz Entertainment Corp.|1hattuck Labs, Inc.|1eagate Technology Holdings PLC|1U Group Holdings Limited|1ui Group Holdings Limited|2ja Life, Inc.|1UMA Acquisition Corporation|s|s|2Nation Energy, Inc.|1unrise Realty Trust, Inc.|2pernus Pharmaceuticals, Inc.|5X AI Technology Limited|2rgePays, Inc.|1inovac Biotech, Ltd.|2licon Valley Acquisition Corp.|w|w|1ervice Properties Trust|1tellar V Capital Corp.|n|n|1ilvaco Group, Inc.|4ia, Inc.|c|1pring Valley Acquisition Corp. IV|y|y|1avara, Inc.|3erOne 2014 Ltd.|i|1VRN, Inc.|1tran & Company, Inc.|l|1mith & Wesson Brands, Inc.|0Latham Group, Inc.|0SWK Holdings Corporation|1kyworks Solutions, Inc.|1warmer, Inc|1tewards Inc|1wvl Holdings Corp|i|0China SXT Pharmaceuticals, Inc.|060 Degrees Pharmaceuticals, Inc.|w|0So-Young International Inc.|1tock Yards Bancorp, Inc.|1ymbotic Inc.|2naptics Incorporated|2pris Solutions, Inc.|1pyre Therapeutics, Inc.|1izzle Acquisition Corp. II|r|r|0Titan Acquisition Corp.|n|n|0Berto Acquisition Corp.|n|n|0TransAct Technologies Incorporated|1antech Holdings Ltd.|2oping Inc.|3 Synergies Inc.|0Protara Therapeutics, Inc.|0Tarsus Pharmaceuticals, Inc.|2skUs, Inc.|1AT Technologies Ltd.|1avia Acquisition Corp.|n|n|2ylor Devices, Inc.|1he Bancorp, Inc.|1urtle Beach Corporation|1hunder Bridge Capital Partners V, Ltd.|1aboola.com Ltd.|1hornburg Income Builder Opportunities Trust|1oken Cat Limited|1exas Capital Bancshares, Inc.|u|1riCo Bancshares|1exas Community Bancshares, Inc.|1CGX Acquisition Corp.|1actile Systems Technology, Inc.|1rip.com Group Limited|0BlackRock TCP Capital Corp.|0Alaunos Therapeutics, Inc.|0TScan Therapeutics, Inc.|1ucows Inc.|1ranslational Development Acquisition Corp.|zon Corp.|zon Corp.|0Dreamland Limited|0Trident Digital Tech Holdings Ltd|1hredUp Inc.|1ailwind 2.0 Acquisition Corp.|u|u|1eads Holding Co.|0Atlassian Corporation|0Bio-Techne Corp|0Tectonic Therapeutic, Inc.|1ELA Bio, Inc.|1elomir Pharmaceuticals, Inc.|2mpus AI, Inc.|2nable Holdings, Inc.|4x Therapeutics, Inc.|2radyne, Inc.|1FS Financial Corporation|1he GrowHub Limited|1reasure Global Inc.|1G Therapeutics, Inc.|1arget Hospitality Corp.|1H International Limited|0BOA Acquisition Corp. II|o|o|0First Financial Corporation|0TryHard Holdings Limited|0Gentherm Inc|c|0Thryv Holdings, Inc.|0Millicom International Cellular S.A.|0UP Fintech Holding Limited|0Instil Bio, Inc.|2terface, Inc.|0Tiptree Inc.|2tan Machinery Inc.|1JGC Group Limited|1okyo Lifestyle Co., Ltd.|0Alpha Teknova, Inc.|0Three Lions Acquisition Corp.|t|t|1andy Leather Factory, Inc.|1en-League International Holdings Limited|1alen Energy Corporation|3on Capital Corp.|j|j|3phera, Inc.|1ilray Brands, Inc.|1elos Corporation|1iziana Life Sciences Ltd|1riSalus Life Sciences, Inc.|s|1elix Pharmaceuticals Limited|1MC the metals company Inc.|1reace Medical Concepts, Inc.|1he Metals Royalty Company Inc.|1ransMedics Group, Inc.|1eamshares Inc.|f|0Spartacus Acquisition Corp. II|u|u|0T-Mobile US, Inc.|h|h|h|1andem Diabetes Care, Inc.|3go Therapeutics, Inc.|1NL Mediagene|1enon Medical, Inc.|j|1onix Pharmaceuticals Holding Corp.|1enaya Therapeutics, Inc.|1OMI Environmental Solutions, Inc.|2N Strategy Company|2P Financial Group Limited|1oro Corp.|1uniu Corporation|1owne Bank|1OYO Co., Ltd|1echPrecision Corporation|1PG Inc.|8|1empest Therapeutics, Inc.|1raws Pharma, Inc.|0First Tracks Biotherapeutics, Inc.|0TurboGen Ltd.|0Entrada Therapeutics, Inc.|0LendingTree, Inc.|0Tactical Resources Corp.|1RG Latin America Acquisitions Corp.|z.|z.|1homson Reuters Corp|1rinity Biotech plc|3pAdvisor, Inc.|3mble Inc.|1ORM plc|1rustmark Corporation|0Interactive Strength Inc.|0Transcat, Inc.|2on Inc.|1ROOPS, Inc.|1. Rowe Price Group, Inc.|1riMas Corporation|1ungray Technologies Inc|1rustCo Bank Corp NY|2io-Tech International|2uGolf Holdings, Inc.|3panion, Inc.|0trivago N.V.|0Trevi Therapeutics, Inc.|1elesat Corporation|1imberland Bancorp, Inc.|1ractor Supply Company|1ower Semiconductor Ltd.|1aysha Gene Therapies, Inc.|1esla, Inc.|1SS, Inc.|0ServiceTitan, Inc.|0The Trade Desk, Inc.|1TEC Holdings, Inc.|1etra Tech, Inc.|2chTarget, Inc.|1TM Technologies, Inc.|1urn Therapeutics Inc.|1ake-Two Interactive Software, Inc.|0Bloomia Holdings, Inc.|0Turbo Energy, S.A.|0Mammoth Energy Services, Inc.|0Texas Ventures Acquisition III Corp|z|z|1hayer Ventures Acquisition Corporation II|ztion II|ztion II|1evogen Inc.|c|2xas Ventures Acquisition IV Corp|y|y|1vardi Therapeutics, Inc.|1ravere Therapeutics, Inc.|3deweb Markets Inc.|1aoWeave, Inc.|1WFG, Inc.|1op Wealth Group Holding Limited|1win Disc, Incorporated|2elve Seas Investment Company III|y|y|2ist Bioscience Corporation|010x Genomics, Inc.|0TherapeuticsMD, Inc.|1exas Instruments Incorporated|6Roadhouse, Inc.|1igo Energy, Inc.|1yra Biosciences, Inc.|1ravelzoo|0United Airlines Holdings, Inc.|7Bancorp, Inc.|akshares, Inc.|1 Power Limited|0CN Healthy Food Tech Group Corp.|w|0uCloudlink Group Inc.|0Ultra Clean Holdings, Inc.|1niversal Electronics Inc.|3ted Fire Group, Inc|3-Fuels Holdings Limited|1FP Industries, Inc.|4Technologies, Inc.|1nited-Guardian, Inc.|1commune International Ltd|1ltralife Corporation|0Frontier Group Holdings, Inc.|0Universal Logistics Holdings, Inc.|1lta Beauty, Inc.|1MB Financial Corporation|p|1nion Bankshares, Inc.|3cycive Therapeutics, Inc.|3ti Group Inc.|4y Bancorp, Inc.|1rban One, Inc.|f|1pstream Bio, Inc.|2bound Group, Inc.|1niverse Pharmaceuticals Inc|1pland Software, Inc.|2start Holdings, Inc.|2work Inc.|2exi, Inc.|1rban Outfitters, Inc.|2oGen Pharma Ltd.|2anium Royalty Corp.|1SA Rare Earth, Inc.|1.S. Gold Corp.|1SCB Financial Holdings, Inc.|0StablecoinX Inc.|g|0United Maritime Corporation|1.S. GoldMining Inc.|1sio, Inc.|1nited States Lime & Minerals, Inc.|7Therapeutics Corporation|1tah Medical Products, Inc.|1TStarcom Holdings Corp|1nivest Financial Corporation|1xin Limited|1Y Scuti Acquisition Corp.|q|q|0Linkage Global Inc|0Virginia National Bankshares Corporation|1alor Energy Incorporated|3neva SE|3ue Line, Inc.|1ivani Medical, Inc.|1alion Bio, Inc.|1ersaBank|1isteon Corporation|1ericel Corporation|1CI Global Limited|1icore Pharma Holding AB|3tory Capital Holdings, Inc.|1eracyte, Inc.|2eco Instruments Inc.|3a Inc.|9|0Twin Vee PowerCats Co.|0Velo3D, Inc.|1EON Ltd.|1era Therapeutics, Inc.|3itone, Inc.|3u Inc.|3tex, Inc.|1illage Farms International, Inc.|2nFast Auto Ltd.|h|1erde Clean Fuels, Inc.|n|1irnetX Holding Corp|2ne Hill Capital Investment Corp. II|zII|zII|1enHub Global, Inc.|1iavi Solutions Inc.|2cor Corporation|2nci Compass Investments Ltd.|2omi Technology Co., Ltd|1ulcan Infrastructure and Power Inc.|1ir Biotechnology, Inc.|3co Manufacturing Corporation|2stance Networks, Inc.|2tal Farms, Inc.|2vakor, Inc.|3oPower PLC|4Sim Labs, Inc.|2king Therapeutics, Inc.|2llage Super Market, Inc.|1elos Acquisition I Corp.|p|p|1alley National Bancorp|n|n|n|1ision Marine Technologies Inc.|2emed Healthcare, Inc.|1ersamet Royalties Corporation|1ince Holding Corp.|1anda Pharmaceuticals Inc.|1NET Group, Inc.|1endome Acquisition Corporation I|x|x|1iper Energy, Inc.|1odafone Group Plc|2genx Inc|2r Biopharma Inc.|2x Royalty Corp.|1era Bradley, Inc.|1irax Biolabs Group Limited|1errica Pharmaceuticals Inc.|1iridian Therapeutics, Inc.|1arex Imaging Corporation|1room, Inc.|1erifyMe, Inc.|1aronis Systems, Inc.|1erra Mobility Corporation|3isk Analytics, Inc.|4Sign, Inc.|3tex Pharmaceuticals Incorporated|3axa Biotech AG|h|3sus Systems Inc.|1isionSys AI Inc.|2aSat, Inc.|1SE Corporation|f|2 Media Holdings Limited|1ersant Media Group, Inc.|3astem, Inc.|1istagen Therapeutics, Inc.|2rtuix Holdings Inc.|2atris Inc.|2rTra, Inc.|0vTv Therapeutics Inc.|0Vuzix Corporation|1ivos Therapeutics, Inc.|2sionWave Holdings, Inc.|p|1oyager Therapeutics, Inc.|0Westamerica Bancorporation|1aFd, Inc.|a|2h Fu Education Group Limited|2ldencast plc|e|2shington Trust Bancorp, Inc.|0Air Water Ventures Limited|0Energous Corporation|1co Wave Power Global AB (publ)|0Waystar Holding Corp.|1eibo Corporation|1arner Bros. Discovery, Inc.|1EBTOON Entertainment Inc.|3UY GLOBAL LTD.|1est Coast Community Bancorp|2llchange Holdings Company Limited|1orkday, Inc.|1estern Digital Corporation|1D-40 Company|1endy's Company (The)|3 Acquisition Corp|k|k|2rner Enterprises, Inc.|2strock Coffee Company|2touch Technology Inc.|5r Robotics Limited|2yco Group, Inc.|1here Food Comes From, Inc.|1F Holding Limited|1eatherford International plc|0GeneDx Holdings Corp.|0WhiteHorse Finance, Inc.|o|2eeler Real Estate Investment Trust, Inc.|zt, Inc.|zt, Inc.|zt, Inc.|2itehawk Therapeutics, Inc.|1iMi Hologram Cloud Inc.|2nmark Corporation|3gstop Inc.|2x.com Ltd.|1ISeKey International Holding Ltd|1orkhorse Group, Inc.|4sport, Ltd.|1ilco 63 Corporation|k|k|3ldan Group, Inc.|1earable Devices Ltd.|l|1illis Lease Finance Corporation|4ow Lane Acquisition Corp. II|w|w|1ealthfront Corporation|1arner Music Group Corp.|2lmart Inc.|1estern New England Bancorp, Inc.|0Meiwu Technology Company Limited|0WORK Medical Technology Group LTD|0Petco Health and Wellness Company, Inc.|0Westport Fuel Systems Inc|1rap Technologies, Inc.|1eRide Inc.|1orld Acceptance Corporation|1esBanco, Inc.|e|1aterstone Financial, Inc.|1inchester Bancorp, Inc.|2llScot Holdings Corporation|2se Group plc|1SFS Financial Corporation|1eShop Holdings Limited|2stin Acquisition Corp|n|n|4 Bancorporation|1aton Financial Limited|1intrust Financial Corporation|u|4ergreen Acquisition Corp.|t|t|2llis Towers Watson Public Limited Company|0TeraWulf Inc.|0Wave Life Sciences, Inc.|1illamette Valley Vineyards, Inc.|x|1W International, Inc.|1oodward, Inc.|1F International Limited|1hiteFiber, Inc.|1ing Yip Food Holdings Group Limited|1ynn Resorts, Limited|0Beyond Air, Inc.|0Xenetic Biosciences, Inc.|1Biotech Inc.|2P Global Holdings, Inc.|p|13 Acquisition Corp. Ltd.|p|p|1CHG Limited|0Exicure, Inc.|0X-Energy, Inc.|1cel Energy Inc.|5Brands, Inc|5Energy Inc.|1enon Pharmaceuticals Inc.|2ris Biopharma Holdings, Inc.|14 Pharmaceuticals, Inc.|0Exagen Inc.|0XChange TEC.INC|0TEN Holdings, Inc.|0Churchill Capital Corp XIII|r|r|0Exascale Labs Holdings Inc.|r|0Xilio Therapeutics, Inc.|1MAX, Inc.|1ometry, Inc.|1encor, Inc.|1anadu Quantum Technologies Limited|1unlei Limited|1os, Inc.|1P Inc.|2EL, Inc.|0Expion Energy, Inc.|0DENTSPLY SIRONA Inc.|0Armada Acquisition Corp. II|r|r|0XORTX Therapeutics Inc.|1erox Holdings Corporation|q|1solla SPAC 1|d|d|0Karman Line Acquisition Corp.|t|t|0XTI Aerospace, Inc. Common Stock|2L Biopharmaceuticals Ltd.|1WELL, Inc.|022nd Century Group, Inc|0Youxin Technology Ltd|1arrow Bioscience, Inc.|1uanbao Inc.|0One and One Green Technologies. INC|0YD Bio Limited|e|1ueda Digital Holding|1YForce Inc.|0LQR House Inc.|0Yunhong Green CTI Ltd.|1HN Acquisition I Limited|p|p|0111, Inc.|0Planet Image International Limited|0Yorkville International Capital Corp.|zp.|zp.|1unji Inc.|0J-Star Holding Co., Ltd.|0Yimutian Inc.|0The York Water Company|0Youlife Group Inc.|017 Education & Technology Group Inc.|0Yesway, Inc.|1SX Tech. Co., Ltd|1atra Online, Inc.|1XT.COM GROUP HOLDING LIMITED|0AiRWA Inc.|0Zillow Group, Inc.|1hibao Technology Inc.|1enas BioPharma, Inc.|2bra Technologies Corporation|1hongchao Inc.|1iff Davis, Inc.|0DirectBooking Technology Co., Ltd.|0ZenaTech, Inc.|2o Energy Corporation|m|1illow Group, Inc.|2ons Bancorporation N.A.|p|1JK Industrial Co., Ltd.|0JIN MEDICAL INTERNATIONAL LTD.|0ZK International Group Co., Ltd|0Lafayette Digital Acquisition Corp. I|z I|z I|0Zai Lab Limited|1oom Communications, Inc.|1eta Network Group|2ntalis Pharmaceuticals, Inc.|1OOZ Strategy Ltd.|i|1scaler, Inc.|1 Squared Inc.|1eroStack Corp.|2nta Group Company Limited|1umiez Inc.|2ra Bio Limited|1evra Therapeutics, Inc.|1hengye Biotechnology Holding Limited|1ymeworks Inc.","sep":"|"}]}]);
const COLONY = [
{"id":"n-067797dd","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDSB":"PDSB is PDS Biotechnology Corporation.","what company is listed as MDRR":"MDRR is Medalist Diversified, Inc..","name the company trading on Nasdaq as IONR":"IONR is ioneer Ltd.","which company has the Nasdaq symbol GRI":"GRI is GRI Bio, Inc..","what company is listed as ECPG":"ECPG is Encore Capital Group Inc.","which company has the Nasdaq symbol BYFC":"BYFC is Broadway Financial Corporation.","which company has the Nasdaq symbol SORNU":"SORNU is Soren Acquisition Corp..","which company has the Nasdaq symbol VIVK":"VIVK is Vivakor, Inc..","what company is listed as CODX":"CODX is Co-Diagnostics, Inc..","name the company trading on Nasdaq as NODK":"NODK is NI Holdings, Inc..","what company is listed as CRDO":"CRDO is Credo Technology Group Holding Ltd.","what company is listed as JAGX":"JAGX is Jaguar Health, Inc..","name the company trading on Nasdaq as DLHC":"DLHC is DLH Holdings Corp..","which company has the Nasdaq symbol TNMG":"TNMG is TNL Mediagene.","which company has the Nasdaq symbol ECBK":"ECBK is ECB Bancorp, Inc..","which company has the Nasdaq symbol CME":"CME is CME Group Inc..","which company has the Nasdaq symbol INSG":"INSG is Inseego Corp..","which company has the Nasdaq symbol TECX":"TECX is Tectonic Therapeutic, Inc..","which company has the Nasdaq symbol RFAIU":"RFAIU is RF Acquisition Corp II.","which company has the Nasdaq symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc..","name the company trading on Nasdaq as SRZN":"SRZN is Surrozen, Inc..","name the company trading on Nasdaq as FIP":"FIP is FTAI Infrastructure Inc..","what company is listed as MRLN":"MRLN is Merlin, Inc..","name the company trading on Nasdaq as THH":"THH is TryHard Holdings Limited.","name the company trading on Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited.","what company is listed as GLSI":"GLSI is Greenwich LifeSciences, Inc..","what company is listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund.","what company is listed as BZAI":"BZAI is Blaize Holdings, Inc..","what company is listed as FORM":"FORM is FormFactor, Inc..","which company has the Nasdaq symbol PTACW":"PTACW is Patriot Acquisition Corp..","name the company trading on Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation.","which company has the Nasdaq symbol NEXR":"NEXR is Nexera Technologies Ltd.","what company is listed as NOEMW":"NOEMW is CO2 Energy Transition Corp..","name the company trading on Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited.","which company has the Nasdaq symbol SKYAW":"SKYAW is SkyAI, Inc..","what company is listed as GAINI":"GAINI is Gladstone Investment Corporation.","name the company trading on Nasdaq as THRY":"THRY is Thryv Holdings, Inc..","which company has the Nasdaq symbol WEYS":"WEYS is Weyco Group, Inc..","name the company trading on Nasdaq as NGEN":"NGEN is NervGen Pharma Corp..","name the company trading on Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd.","what company is listed as ACGLO":"ACGLO is Arch Capital Group Ltd..","name the company trading on Nasdaq as WING":"WING is Wingstop Inc..","name the company trading on Nasdaq as FFBC":"FFBC is First Financial Bancorp..","name the company trading on Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc..","which company has the Nasdaq symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc..","what company is listed as RMTI":"RMTI is Rockwell Medical, Inc..","name the company trading on Nasdaq as SRBK":"SRBK is SR Bancorp, Inc..","what company is listed as KDP":"KDP is Keurig Dr Pepper Inc..","which company has the Nasdaq symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc..","which company has the Nasdaq symbol OBX":"OBX is Obsidian Therapeutics, Inc..","what company is listed as TNONW":"TNONW is Tenon Medical, Inc..","which company has the Nasdaq symbol CSQ":"CSQ is Calamos Strategic Total Return Fund.","what company is listed as LPBB":"LPBB is Launch Two Acquisition Corp..","what company is listed as GCBC":"GCBC is Greene County Bancorp, Inc..","name the company trading on Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp.","what company is listed as PRE":"PRE is Prenetics Global Limited.","which company has the Nasdaq symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp.","name the company trading on Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc..","what company is listed as PKBK":"PKBK is Parke Bancorp, Inc..","name the company trading on Nasdaq as TANH":"TANH is Tantech Holdings Ltd..","name the company trading on Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp..","what company is listed as IGAC":"IGAC is Invest Green Acquisition Corporation.","name the company trading on Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","which company has the Nasdaq symbol ARCL":"ARCL is ARC Group Acquisition I Corp.","which company has the Nasdaq symbol REGCP":"REGCP is Regency Centers Corporation.","what company is listed as ARHS":"ARHS is Arhaus, Inc..","what company is listed as NKTR":"NKTR is Nektar Therapeutics.","name the company trading on Nasdaq as PLUS":"PLUS is ePlus inc..","which company has the Nasdaq symbol MKDW":"MKDW is MKDWELL Tech Inc..","name the company trading on Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII.","name the company trading on Nasdaq as SENEA":"SENEA is Seneca Foods Corp..","which company has the Nasdaq symbol SOLS":"SOLS is Solstice Advanced Materials Inc..","which company has the Nasdaq symbol TCOM":"TCOM is Trip.com Group Limited.","name the company trading on Nasdaq as STAK":"STAK is STAK Inc..","what company is listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc..","name the company trading on Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp..","name the company trading on Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc..","what company is listed as VLOSU":"VLOSU is Velos Acquisition I Corp..","which company has the Nasdaq symbol TIL":"TIL is Instil Bio, Inc..","which company has the Nasdaq symbol RBCAA":"RBCAA is Republic Bancorp, Inc..","name the company trading on Nasdaq as BRKRP":"BRKRP is Bruker Corporation.","which company has the Nasdaq symbol EZRA":"EZRA is Reliance Global Group, Inc..","which company has the Nasdaq symbol ZBRA":"ZBRA is Zebra Technologies Corporation.","name the company trading on Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I.","what company is listed as CAPR":"CAPR is Capricor Therapeutics, Inc..","what company is listed as PEPG":"PEPG is PepGen Inc..","name the company trading on Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp..","which company has the Nasdaq symbol CCTG":"CCTG is CCSC Technology International Holdings Limited.","name the company trading on Nasdaq as ASTH":"ASTH is Astrana Health Inc..","what company is listed as SMCIP":"SMCIP is Super Micro Computer, Inc..","what company is listed as CNXU":"CNXU is Conexeu Sciences Inc..","name the company trading on Nasdaq as CTRN":"CTRN is Citi Trends, Inc..","which company has the Nasdaq symbol SWKHL":"SWKHL is SWK Holdings Corporation.","what company is listed as TACOW":"TACOW is Berto Acquisition Corp..","which company has the Nasdaq symbol PDYN":"PDYN is Palladyne AI Corp..","what company is listed as WSBCO":"WSBCO is WesBanco, Inc..","what company is listed as BPYPN":"BPYPN is Brookfield Property Partners L.P..","name the company trading on Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc..","which company has the Nasdaq symbol PTAC":"PTAC is Patriot Acquisition Corp..","what company is listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-6ac99364","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"company"}]]],"mem":{"table":{"has the Nasdaq symbol PDSB":"PDSB is PDS Biotechnology Corporation.","is listed as MDRR":"MDRR is Medalist Diversified, Inc..","trading on Nasdaq as IONR":"IONR is ioneer Ltd.","has the Nasdaq symbol GRI":"GRI is GRI Bio, Inc..","is listed as ECPG":"ECPG is Encore Capital Group Inc.","has the Nasdaq symbol BYFC":"BYFC is Broadway Financial Corporation.","has the Nasdaq symbol SORNU":"SORNU is Soren Acquisition Corp..","has the Nasdaq symbol VIVK":"VIVK is Vivakor, Inc..","is listed as CODX":"CODX is Co-Diagnostics, Inc..","trading on Nasdaq as NODK":"NODK is NI Holdings, Inc..","is listed as CRDO":"CRDO is Credo Technology Group Holding Ltd.","is listed as JAGX":"JAGX is Jaguar Health, Inc..","trading on Nasdaq as DLHC":"DLHC is DLH Holdings Corp..","has the Nasdaq symbol TNMG":"TNMG is TNL Mediagene.","has the Nasdaq symbol ECBK":"ECBK is ECB Bancorp, Inc..","has the Nasdaq symbol CME":"CME is CME Group Inc..","has the Nasdaq symbol INSG":"INSG is Inseego Corp..","has the Nasdaq symbol TECX":"TECX is Tectonic Therapeutic, Inc..","has the Nasdaq symbol RFAIU":"RFAIU is RF Acquisition Corp II.","has the Nasdaq symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc..","trading on Nasdaq as SRZN":"SRZN is Surrozen, Inc..","trading on Nasdaq as FIP":"FIP is FTAI Infrastructure Inc..","is listed as MRLN":"MRLN is Merlin, Inc..","trading on Nasdaq as THH":"THH is TryHard Holdings Limited.","trading on Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited.","is listed as GLSI":"GLSI is Greenwich LifeSciences, Inc..","is listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund.","is listed as BZAI":"BZAI is Blaize Holdings, Inc..","is listed as FORM":"FORM is FormFactor, Inc..","has the Nasdaq symbol PTACW":"PTACW is Patriot Acquisition Corp..","trading on Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation.","has the Nasdaq symbol NEXR":"NEXR is Nexera Technologies Ltd.","is listed as NOEMW":"NOEMW is CO2 Energy Transition Corp..","trading on Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited.","has the Nasdaq symbol SKYAW":"SKYAW is SkyAI, Inc..","is listed as GAINI":"GAINI is Gladstone Investment Corporation.","trading on Nasdaq as THRY":"THRY is Thryv Holdings, Inc..","has the Nasdaq symbol WEYS":"WEYS is Weyco Group, Inc..","trading on Nasdaq as NGEN":"NGEN is NervGen Pharma Corp..","trading on Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd.","is listed as ACGLO":"ACGLO is Arch Capital Group Ltd..","trading on Nasdaq as WING":"WING is Wingstop Inc..","trading on Nasdaq as FFBC":"FFBC is First Financial Bancorp..","trading on Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc..","has the Nasdaq symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc..","is listed as RMTI":"RMTI is Rockwell Medical, Inc..","trading on Nasdaq as SRBK":"SRBK is SR Bancorp, Inc..","is listed as KDP":"KDP is Keurig Dr Pepper Inc..","has the Nasdaq symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc..","has the Nasdaq symbol OBX":"OBX is Obsidian Therapeutics, Inc..","is listed as TNONW":"TNONW is Tenon Medical, Inc..","has the Nasdaq symbol CSQ":"CSQ is Calamos Strategic Total Return Fund.","is listed as LPBB":"LPBB is Launch Two Acquisition Corp..","is listed as GCBC":"GCBC is Greene County Bancorp, Inc..","trading on Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp.","is listed as PRE":"PRE is Prenetics Global Limited.","has the Nasdaq symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp.","trading on Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc..","is listed as PKBK":"PKBK is Parke Bancorp, Inc..","trading on Nasdaq as TANH":"TANH is Tantech Holdings Ltd..","trading on Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp..","is listed as IGAC":"IGAC is Invest Green Acquisition Corporation.","trading on Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","has the Nasdaq symbol ARCL":"ARCL is ARC Group Acquisition I Corp.","has the Nasdaq symbol REGCP":"REGCP is Regency Centers Corporation.","is listed as ARHS":"ARHS is Arhaus, Inc..","is listed as NKTR":"NKTR is Nektar Therapeutics.","trading on Nasdaq as PLUS":"PLUS is ePlus inc..","has the Nasdaq symbol MKDW":"MKDW is MKDWELL Tech Inc..","trading on Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII.","trading on Nasdaq as SENEA":"SENEA is Seneca Foods Corp..","has the Nasdaq symbol SOLS":"SOLS is Solstice Advanced Materials Inc..","has the Nasdaq symbol TCOM":"TCOM is Trip.com Group Limited.","trading on Nasdaq as STAK":"STAK is STAK Inc..","is listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc..","trading on Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp..","trading on Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc..","is listed as VLOSU":"VLOSU is Velos Acquisition I Corp..","has the Nasdaq symbol TIL":"TIL is Instil Bio, Inc..","has the Nasdaq symbol RBCAA":"RBCAA is Republic Bancorp, Inc..","trading on Nasdaq as BRKRP":"BRKRP is Bruker Corporation.","has the Nasdaq symbol EZRA":"EZRA is Reliance Global Group, Inc..","has the Nasdaq symbol ZBRA":"ZBRA is Zebra Technologies Corporation.","trading on Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I.","is listed as CAPR":"CAPR is Capricor Therapeutics, Inc..","is listed as PEPG":"PEPG is PepGen Inc..","trading on Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp..","has the Nasdaq symbol CCTG":"CCTG is CCSC Technology International Holdings Limited.","trading on Nasdaq as ASTH":"ASTH is Astrana Health Inc..","is listed as SMCIP":"SMCIP is Super Micro Computer, Inc..","is listed as CNXU":"CNXU is Conexeu Sciences Inc..","trading on Nasdaq as CTRN":"CTRN is Citi Trends, Inc..","has the Nasdaq symbol SWKHL":"SWKHL is SWK Holdings Corporation.","is listed as TACOW":"TACOW is Berto Acquisition Corp..","has the Nasdaq symbol PDYN":"PDYN is Palladyne AI Corp..","is listed as WSBCO":"WSBCO is WesBanco, Inc..","is listed as BPYPN":"BPYPN is Brookfield Property Partners L.P..","trading on Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc..","has the Nasdaq symbol PTAC":"PTAC is Patriot Acquisition Corp..","is listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-4ced6d78","guard":[["hasAny",["aehl","amlx","arcl","asth","blzru","bmhl","bpac","brkrp","bwin","byfc","cctg","csq","ctrn","cxiiu","delete","dlhc","ecbk","eosew","ezra","ffbc","fip","ftha","iacq","insg","ionr","item number","jcap","listed","mcft","mgyr","nexr","ngen","nodk","nth","obx","onchw","oriqu","pdsb","pdyn","plus","position","ptac","ptacw","rbcaa","regcp","rfaiu","senea","skyaw","sols","sornu","srbk","srzn","stok","strip out","swkhl","swvlw","tanh","tcom","tcrt","tecx","thh","thry","til","tnmg","vivk","weys","wing","xrxdw","zbra"]],["words<=",8],["has","company"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}]]],"mem":null},
{"id":"n-b366aefc","guard":[["hasAny",["aehl","amlx","arcl","asth","blzru","bmhl","bpac","brkrp","bwin","byfc","cctg","csq","ctrn","cxiiu","dlhc","ecbk","eosew","ezra","ffbc","fip","ftha","iacq","insg","ionr","item number","jcap","listed","mcft","mgyr","nexr","ngen","nodk","nth","obx","onchw","oriqu","pdsb","pdyn","plus","position","ptac","ptacw","rbcaa","regcp","rfaiu","senea","separate by","skyaw","sols","sornu","split","split by","srbk","srzn","stok","swkhl","swvlw","tanh","tcom","tcrt","tecx","thh","thry","til","tnmg","vivk","weys","wing","xrxdw","zbra"]],["words<=",8],["has","company"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}]]],"mem":null},
{"id":"n-78069611","guard":[["hasAny",["aehl","amlx","arcl","asth","blzru","bmhl","bpac","brkrp","bwin","byfc","cctg","change to","csq","ctrn","cxiiu","dlhc","ecbk","eosew","ezra","ffbc","fip","ftha","iacq","insg","ionr","item number","jcap","listed","mcft","mgyr","nexr","ngen","nodk","nth","obx","onchw","oriqu","pdsb","pdyn","plus","position","ptac","ptacw","rbcaa","regcp","replace","rfaiu","senea","skyaw","sols","sornu","srbk","srzn","stok","substitute","swap","swkhl","swvlw","tanh","tcom","tcrt","tecx","thh","thry","til","tnmg","vivk","weys","wing","xrxdw","zbra"]],["words<=",8],["has","company"]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],["sense.text"]]],"mem":null},
{"id":"n-62902baa","guard":[["hasAny",["acglo","aehl","alovw","amlx","arcl","arhs","asth","blzru","bmhl","bpac","bpypn","brkrp","bwin","byfc","bzai","capr","cctg","cme","cnxu","codx","crdo","csq","ctrn","cxiiu","dlhc","ecbk","ecpg","eosew","ezra","ffbc","fip","form","ftha","gaini","gcbc","glsi","gri","iacq","igac","insg","item number","jagx","jcap","jkhy","kdp","leading zeros","lpbb","mcft","mdrr","mgyr","mkdw","mrln","nexr","ngen","nktr","nodk","noemw","nth","obx","onchw","oriqu","pad","pad with","padded to","pdsb","pdyn","pkbk","position","pre","ptac","ptacw","qqqx","rbcaa","regcp","rfaiu","rmti","senea","smcip","sols","sornu","srbk","srzn","stok","swkhl","swvlw","tacow","tanh","tcom","tcrt","tecx","thh","thry","til","tnmg","tnonw","vivk","vlosu","weys","wing","wsbco","xrxdw","zbra","zero pad"]],["has","company"],["nums==",0]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-87dd4341","guard":[["hasAny",["acglo","alovw","arhs","bpypn","bzai","capr","cnxu","codx","crdo","delete","ecpg","form","gaini","gcbc","glsi","item number","jagx","jkhy","kdp","mrln","nasdaq","nktr","noemw","nth","pepg","pkbk","position","pre","qqqx","rmti","smcip","strip out","tnonw","wsbco"]],["has","company"],["nums==",0]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-9fd37c0a","guard":[["hasAny",["acglo","alovw","arhs","bpypn","bzai","capr","cnxu","codx","crdo","ecpg","form","gaini","gcbc","glsi","item number","jagx","jkhy","kdp","mrln","nasdaq","nktr","noemw","nth","pepg","pkbk","position","pre","qqqx","rmti","separate by","smcip","split","split by","tnonw","wsbco"]],["has","company"],["nums==",0]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a7ef4a5e","guard":[["hasAny",["acglo","alovw","arhs","bpypn","bzai","capr","cnxu","codx","crdo","ecpg","form","gaini","gcbc","glsi","item number","jagx","jkhy","kdp","mrln","nasdaq","nktr","noemw","nth","pepg","pkbk","position","pre","qqqx","rmti","separate by","smcip","split","split by","tnonw","wsbco"]],["has","company"],["nums==",0]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-d368c129","guard":[["hasAny",["acglo","alovw","arhs","bpypn","bzai","capr","cnxu","codx","crdo","ecpg","form","gaini","gcbc","glsi","item number","jagx","jkhy","kdp","mrln","nasdaq","nktr","noemw","nth","pepg","pkbk","position","pre","qqqx","rmti","separate by","smcip","split","split by","tnonw","wsbco"]],["has","company"],["nums==",0]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-76a3aa63","guard":[["hasAny",["acglo","aehl","alovw","amlx","arcl","arhs","asth","blzru","bmhl","bpac","bpypn","brkrp","bwin","byfc","bzai","capr","cctg","cme","cnxu","codx","crdo","csq","ctrn","cxiiu","dlhc","ecbk","ecpg","eosew","ezra","ffbc","fip","form","ftha","gaini","gcbc","glsi","gri","iacq","igac","insg","item number","jagx","jcap","jkhy","kdp","leading zeros","lpbb","mcft","mdrr","mgyr","mkdw","mrln","nexr","ngen","nktr","nodk","noemw","nth","obx","onchw","oriqu","pad","pad with","padded to","pdsb","pdyn","pkbk","position","pre","ptac","ptacw","qqqx","rbcaa","regcp","rfaiu","rmti","senea","smcip","sols","sornu","srbk","srzn","stok","swkhl","swvlw","tacow","tanh","tcom","tcrt","tecx","thh","thry","til","tnmg","tnonw","vivk","vlosu","weys","wing","wsbco","xrxdw","zbra","zero pad"]],["has","company"],["nums==",0]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}]]],"mem":null},
{"id":"n-33324ac0","guard":[["hasAny",["acglo","aehl","alovw","amlx","arcl","arhs","asth","blzru","bmhl","bpac","bpypn","brkrp","bwin","byfc","bzai","capr","cctg","cme","cnxu","codx","crdo","csq","ctrn","cxiiu","dlhc","ecpg","eosew","ezra","fip","form","ftha","gaini","glsi","gri","iacq","igac","insg","ionr","item number","jagx","jcap","jkhy","kdp","lpbb","mcft","mdrr","mkdw","mrln","nexr","ngen","nktr","nodk","noemw","nth","obx","onchw","oriqu","pdsb","pdyn","pepg","plus","position","pre","ptac","ptacw","qqqx","regcp","rfaiu","rmti","senea","separate by","skyaw","smcip","sols","sornu","split","split by","srzn","stak","stok","swkhl","swvlw","tacow","tanh","tcom","tcrt","tecx","thh","thry","til","tnmg","tnonw","vivk","vlosu","weys","wing","wsbco","xrxdw","zbra"]],["has","company"],["words<=",8],["nums==",0]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":"corp"}]],"mem":null},
{"id":"n-4eb4b686","guard":[["hasAny",["acglo","aehl","alovw","amlx","arcl","arhs","asth","blzru","bmhl","bpac","bpypn","brkrp","bwin","byfc","bzai","capr","cctg","cme","cnxu","codx","crdo","csq","ctrn","cxiiu","dlhc","ecpg","eosew","ezra","fip","form","ftha","gaini","glsi","gri","iacq","igac","insg","ionr","item number","jagx","jcap","jkhy","kdp","lpbb","mcft","mdrr","mkdw","mrln","nexr","ngen","nktr","nodk","noemw","nth","obx","onchw","oriqu","pdsb","pdyn","pepg","plus","position","pre","ptac","ptacw","qqqx","regcp","rfaiu","rmti","senea","separate by","skyaw","smcip","sols","sornu","split","split by","srzn","stak","stok","swkhl","swvlw","tacow","tanh","tcom","tcrt","tecx","thh","thry","til","tnmg","tnonw","vivk","vlosu","weys","wing","wsbco","xrxdw","zbra"]],["has","company"],["words<=",8],["nums==",0]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":"corp"}]],"mem":null},
{"id":"n-554e7a03","guard":[["hasAny",["acglo","aehl","alovw","amlx","arcl","arhs","asth","blzru","bmhl","bpac","bpypn","brkrp","bwin","byfc","bzai","capr","cctg","cme","cnxu","codx","crdo","csq","ctrn","cxiiu","delete","dlhc","ecpg","eosew","ezra","fip","form","ftha","gaini","glsi","gri","iacq","igac","insg","ionr","item number","jagx","jcap","jkhy","kdp","lpbb","mcft","mdrr","mkdw","mrln","nexr","ngen","nktr","nodk","noemw","nth","obx","onchw","oriqu","pdsb","pdyn","pepg","plus","position","pre","ptac","ptacw","qqqx","regcp","rfaiu","rmti","senea","skyaw","smcip","sols","sornu","srzn","stak","stok","strip out","swkhl","swvlw","tacow","tanh","tcom","tcrt","tecx","thh","thry","til","tnmg","tnonw","vivk","vlosu","weys","wing","wsbco","xrxdw","zbra"]],["has","company"],["words<=",8],["nums==",0]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":"corp"}]],"mem":null},
{"id":"n-6957aaf1","guard":[["hasAny",["acglo","aehl","alovw","amlx","arcl","arhs","asth","blzru","bmhl","bpac","bpypn","brkrp","bwin","byfc","bzai","capr","cctg","cme","cnxu","codx","crdo","csq","ctrn","cxiiu","dlhc","ecpg","eosew","ezra","fip","form","ftha","gaini","glsi","gri","iacq","igac","insg","ionr","item number","jagx","jcap","jkhy","kdp","lpbb","mcft","mdrr","mkdw","mrln","nexr","ngen","nktr","nodk","noemw","nth","obx","onchw","oriqu","pdsb","pdyn","pepg","plus","position","pre","ptac","ptacw","qqqx","regcp","rfaiu","rmti","senea","separate by","skyaw","smcip","sols","sornu","split","split by","srzn","stak","stok","swkhl","swvlw","tacow","tanh","tcom","tcrt","tecx","thh","thry","til","tnmg","tnonw","vivk","vlosu","weys","wing","wsbco","xrxdw","zbra"]],["has","company"],["words<=",8],["nums==",0]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":"corp"}]],"mem":null},
{"id":"n-665bc097","guard":[["hasAny",["company","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],["sense.after",{"lit":"nasdaq"}]]],"mem":null},
{"id":"n-e7325625","guard":[["hasAny",["company","item number","nth","position"]],["has","nasdaq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-685de9f8","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"nasdaq"}]]],"mem":{"table":{"symbol PDSB":"PDSB is PDS Biotechnology Corporation.","as IONR":"IONR is ioneer Ltd.","symbol GRI":"GRI is GRI Bio, Inc..","symbol BYFC":"BYFC is Broadway Financial Corporation.","symbol SORNU":"SORNU is Soren Acquisition Corp..","symbol VIVK":"VIVK is Vivakor, Inc..","as NODK":"NODK is NI Holdings, Inc..","as DLHC":"DLHC is DLH Holdings Corp..","symbol TNMG":"TNMG is TNL Mediagene.","symbol ECBK":"ECBK is ECB Bancorp, Inc..","symbol CME":"CME is CME Group Inc..","symbol INSG":"INSG is Inseego Corp..","symbol TECX":"TECX is Tectonic Therapeutic, Inc..","symbol RFAIU":"RFAIU is RF Acquisition Corp II.","symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc..","as SRZN":"SRZN is Surrozen, Inc..","as FIP":"FIP is FTAI Infrastructure Inc..","as THH":"THH is TryHard Holdings Limited.","as BMHL":"BMHL is Bluemount Holdings Limited.","symbol PTACW":"PTACW is Patriot Acquisition Corp..","as XRXDW":"XRXDW is Xerox Holdings Corporation.","symbol NEXR":"NEXR is Nexera Technologies Ltd.","as AEHL":"AEHL is Antelope Enterprise Holdings Limited.","symbol SKYAW":"SKYAW is SkyAI, Inc..","as THRY":"THRY is Thryv Holdings, Inc..","symbol WEYS":"WEYS is Weyco Group, Inc..","as NGEN":"NGEN is NervGen Pharma Corp..","as BPAC":"BPAC is Blueport Acquisition Ltd.","as WING":"WING is Wingstop Inc..","as FFBC":"FFBC is First Financial Bancorp..","as JCAP":"JCAP is Jefferson Capital, Inc..","symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc..","as SRBK":"SRBK is SR Bancorp, Inc..","symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc..","symbol OBX":"OBX is Obsidian Therapeutics, Inc..","symbol CSQ":"CSQ is Calamos Strategic Total Return Fund.","as SWVLW":"SWVLW is Swvl Holdings Corp.","symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp.","as STOK":"STOK is Stoke Therapeutics, Inc..","as TANH":"TANH is Tantech Holdings Ltd..","as IACQ":"IACQ is Irenic Acquisition Corp..","as MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","symbol ARCL":"ARCL is ARC Group Acquisition I Corp.","symbol REGCP":"REGCP is Regency Centers Corporation.","as PLUS":"PLUS is ePlus inc..","symbol MKDW":"MKDW is MKDWELL Tech Inc..","as CXIIU":"CXIIU is Churchill Capital Corp XII.","as SENEA":"SENEA is Seneca Foods Corp..","symbol SOLS":"SOLS is Solstice Advanced Materials Inc..","symbol TCOM":"TCOM is Trip.com Group Limited.","as STAK":"STAK is STAK Inc..","as ONCHW":"ONCHW is 1RT Acquisition Corp..","as MGYR":"MGYR is Magyar Bancorp, Inc..","symbol TIL":"TIL is Instil Bio, Inc..","symbol RBCAA":"RBCAA is Republic Bancorp, Inc..","as BRKRP":"BRKRP is Bruker Corporation.","symbol EZRA":"EZRA is Reliance Global Group, Inc..","symbol ZBRA":"ZBRA is Zebra Technologies Corporation.","as ORIQU":"ORIQU is Origin Investment Corp I.","as BLZRU":"BLZRU is Trailblazer Acquisition Corp..","symbol CCTG":"CCTG is CCSC Technology International Holdings Limited.","as ASTH":"ASTH is Astrana Health Inc..","as CTRN":"CTRN is Citi Trends, Inc..","symbol SWKHL":"SWKHL is SWK Holdings Corporation.","symbol PDYN":"PDYN is Palladyne AI Corp..","as TCRT":"TCRT is Alaunos Therapeutics, Inc..","symbol PTAC":"PTAC is Patriot Acquisition Corp.."}}},
{"id":"n-2214e982","guard":[["hasAny",["aehl","asth","blzru","bmhl","bpac","brkrp","ctrn","cxiiu","dlhc","ffbc","fip","iacq","ionr","item number","jcap","listed","mcft","mgyr","ngen","nodk","nth","onchw","oriqu","position","senea","separate by","split","split by","srbk","srzn","stak","stok","swvlw","tanh","tcrt","thh","thry","wing","xrxdw"]],["has","company"],["words<=",8],["words>=",6]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":"inc"}]],"mem":null},
{"id":"n-221fb3b6","guard":[["hasAny",["aehl","asth","blzru","bmhl","bpac","brkrp","ctrn","cxiiu","delete","dlhc","ffbc","fip","iacq","ionr","item number","jcap","listed","mcft","mgyr","ngen","nodk","nth","onchw","oriqu","position","senea","srbk","srzn","stak","stok","strip out","swvlw","tanh","tcrt","thh","thry","wing","xrxdw"]],["has","company"],["words<=",8],["words>=",6]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":"inc"}]],"mem":null},
{"id":"n-6555793c","guard":[["hasAny",["aehl","asth","blzru","bmhl","bpac","brkrp","ctrn","cxiiu","dlhc","ffbc","fip","iacq","ionr","item number","jcap","listed","mcft","mgyr","ngen","nodk","nth","onchw","oriqu","position","senea","separate by","split","split by","srbk","srzn","stak","stok","swvlw","tanh","tcrt","thh","thry","wing","xrxdw"]],["has","company"],["words<=",8],["words>=",6]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":"inc"}]],"mem":null},
{"id":"n-a11f78a1","guard":[["hasAny",["aehl","asth","blzru","bmhl","bpac","brkrp","ctrn","cxiiu","dlhc","ffbc","fip","iacq","ionr","item number","jcap","listed","mcft","mgyr","ngen","nodk","nth","onchw","oriqu","position","senea","separate by","split","split by","srbk","srzn","stak","stok","swvlw","tanh","tcrt","thh","thry","wing","xrxdw"]],["has","company"],["words<=",8],["words>=",6]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":"inc"}]],"mem":null},
{"id":"n-7c62307f","guard":[["hasAny",["aehl","asth","blzru","bmhl","bpac","brkrp","ctrn","cxiiu","dlhc","ffbc","fip","iacq","ionr","item number","jcap","leading zeros","listed","mcft","mgyr","ngen","nodk","nth","onchw","oriqu","pad","pad with","padded to","plus","position","senea","srbk","srzn","stok","swvlw","tanh","tcrt","thh","thry","wing","xrxdw","zero pad"]],["has","company"],["words<=",8],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-51531781","guard":[["hasAny",["aehl","asth","blzru","bmhl","bpac","brkrp","ctrn","cxiiu","dlhc","ffbc","fip","iacq","ionr","item number","jcap","leading zeros","listed","mcft","mgyr","ngen","nodk","nth","onchw","oriqu","pad","pad with","padded to","plus","position","senea","srbk","srzn","stok","swvlw","tanh","tcrt","thh","thry","wing","xrxdw","zero pad"]],["has","company"],["words<=",8],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}]]],"mem":null},
{"id":"n-a6f3ae93","guard":[["hasAny",["fip","item number","listed","nth","position","shortest","shortest one","shortest word","thh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-35020689","guard":[["hasAny",["company","delete","item number","nth","position","strip out","without"]],["has","listed"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e394a956","guard":[["hasAny",["company","delete","item number","nth","position","remove","strip out"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],["sense.after",{"lit":"on"}]]],"mem":null},
{"id":"n-fb213ae5","guard":[["hasAny",["item number","listed","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-48c87629","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"listed as MDRR":"MDRR is Medalist Diversified, Inc..","listed as ECPG":"ECPG is Encore Capital Group Inc.","listed as CODX":"CODX is Co-Diagnostics, Inc..","listed as CRDO":"CRDO is Credo Technology Group Holding Ltd.","listed as JAGX":"JAGX is Jaguar Health, Inc..","listed as MRLN":"MRLN is Merlin, Inc..","listed as GLSI":"GLSI is Greenwich LifeSciences, Inc..","listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund.","listed as BZAI":"BZAI is Blaize Holdings, Inc..","listed as FORM":"FORM is FormFactor, Inc..","listed as NOEMW":"NOEMW is CO2 Energy Transition Corp..","listed as GAINI":"GAINI is Gladstone Investment Corporation.","listed as ACGLO":"ACGLO is Arch Capital Group Ltd..","listed as RMTI":"RMTI is Rockwell Medical, Inc..","listed as KDP":"KDP is Keurig Dr Pepper Inc..","listed as TNONW":"TNONW is Tenon Medical, Inc..","listed as LPBB":"LPBB is Launch Two Acquisition Corp..","listed as GCBC":"GCBC is Greene County Bancorp, Inc..","listed as PRE":"PRE is Prenetics Global Limited.","listed as PKBK":"PKBK is Parke Bancorp, Inc..","listed as IGAC":"IGAC is Invest Green Acquisition Corporation.","listed as ARHS":"ARHS is Arhaus, Inc..","listed as NKTR":"NKTR is Nektar Therapeutics.","listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc..","listed as VLOSU":"VLOSU is Velos Acquisition I Corp..","listed as CAPR":"CAPR is Capricor Therapeutics, Inc..","listed as PEPG":"PEPG is PepGen Inc..","listed as SMCIP":"SMCIP is Super Micro Computer, Inc..","listed as CNXU":"CNXU is Conexeu Sciences Inc..","listed as TACOW":"TACOW is Berto Acquisition Corp..","listed as WSBCO":"WSBCO is WesBanco, Inc..","listed as BPYPN":"BPYPN is Brookfield Property Partners L.P..","listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-d850814c","guard":[["has","company"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"on"}]]],"mem":{"table":{"Nasdaq as IONR":"IONR is ioneer Ltd.","Nasdaq as NODK":"NODK is NI Holdings, Inc..","Nasdaq as DLHC":"DLHC is DLH Holdings Corp..","Nasdaq as SRZN":"SRZN is Surrozen, Inc..","Nasdaq as FIP":"FIP is FTAI Infrastructure Inc..","Nasdaq as THH":"THH is TryHard Holdings Limited.","Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited.","Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation.","Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited.","Nasdaq as THRY":"THRY is Thryv Holdings, Inc..","Nasdaq as NGEN":"NGEN is NervGen Pharma Corp..","Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd.","Nasdaq as WING":"WING is Wingstop Inc..","Nasdaq as FFBC":"FFBC is First Financial Bancorp..","Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc..","Nasdaq as SRBK":"SRBK is SR Bancorp, Inc..","Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp.","Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc..","Nasdaq as TANH":"TANH is Tantech Holdings Ltd..","Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp..","Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","Nasdaq as PLUS":"PLUS is ePlus inc..","Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII.","Nasdaq as SENEA":"SENEA is Seneca Foods Corp..","Nasdaq as STAK":"STAK is STAK Inc..","Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp..","Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc..","Nasdaq as BRKRP":"BRKRP is Bruker Corporation.","Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I.","Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp..","Nasdaq as ASTH":"ASTH is Astrana Health Inc..","Nasdaq as CTRN":"CTRN is Citi Trends, Inc..","Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc.."}}},
{"id":"n-bf176851","guard":[["hasAny",["bmhl","bpypn","brkrp","byfc","cctg","csq","ctrn","dlhc","ffbc","gcbc","item number","jkhy","kdp","lpbb","mcft","mdrr","mgyr","mkdw","mrln","nktr","no vowels","nth","pdsb","pdyn","pkbk","position","qqqx","remove vowels","srbk","srzn","swkhl","swvlw","tcrt","thh","thry","tnmg","without vowels","xrxdw"]],["not",["has","me"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1},"."]},["transform.noVowels",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-fde8e47e","guard":[["hasAny",["aehl","arcl","bmhl","bpac","brkrp","byfc","cctg","crdo","csq","cxiiu","ecpg","ftha","gaini","igac","ionr","item number","nexr","nktr","normalise","normalize","nth","oriqu","pdsb","position","pre","qqqx","regcp","rfaiu","simplify the text","swkhl","swvlw","thh","tnmg","xrxdw","zbra"]],["has","company"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":1}]],"mem":null},
{"id":"n-5f5ffcac","guard":[["hasAny",["aehl","bmhl","bpac","brkrp","byfc","cctg","crdo","csq","cxiiu","ecpg","ftha","gaini","igac","ionr","item number","nexr","nktr","normalise","normalize","nth","pdsb","position","pre","qqqx","regcp","rfaiu","simplify the text","swkhl","swvlw","thh","tnmg","xrxdw","zbra"]],["has","company"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":2}]],"mem":null},
{"id":"n-dfdc0280","guard":[["hasAny",["arhs","characters from","ionr","item number","letters from to","mrln","nth","pepg","plus","position","skyaw","slice of the text","stak","substring"]],["words<=",8],["has","company"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-542a1b7c","guard":[["hasAny",["aehl","bmhl","brkrp","ionr","item number","nktr","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":3}]],"mem":null},
{"id":"n-e381347a","guard":[["hasAny",["acglo","aehl","alovw","alphabetize the letters","fip","item number","letters in order","nth","position","qqqx","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1},"."]},["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-e5adb2fb","guard":[["hasAny",["characters from","ionr","item number","letters from to","nth","plus","position","slice of the text","stak","substring"]],["has","trading"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-860643f1","guard":[["hasAny",["ptac","ptacw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-b42d0123","guard":[["hasAny",["abbreviate","acronym","aehl","igac","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1},"."]},["transform.acronym",["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-706f5c40","guard":[["hasAny",["ptac","ptacw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-63222a24","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ptac","ptacw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f0030b04","guard":[["hasAny",["lower case","lowercase","ptac","ptacw","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2be5100b","guard":[["hasAny",["delete","ptac","ptacw","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",{"lit":"Patriot Acquisition Corp."},["sense.after",{"lit":"nasdaq"}]]],"mem":null},
{"id":"n-44c15545","guard":[["hasAny",["ptac","ptacw","separate by","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"Patriot Acquisition Corp."},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-46dda388","guard":[["hasAny",["delete","ptac","ptacw","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Patriot Acquisition Corp."},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7224a5ac","guard":[["hasAny",["each word","ptac","ptacw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-91ab7781","guard":[["hasAny",["ptac","ptacw","separate by","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"Patriot Acquisition Corp."},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-fea5f628","guard":[["hasAny",["ptac","ptacw","separate by","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"Patriot Acquisition Corp."},["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-ff3fa26c","guard":[["hasAny",["each word","ptac","ptacw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Patriot Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-00bfe2d1","guard":[["has","blzru"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-019074f2","guard":[["has","brkrp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-05a4a805","guard":[["has","fip"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-08dd85f3","guard":[["has","rbcaa"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-0bf74e04","guard":[["has","skyaw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-101992c5","guard":[["has","iacq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-107d059f","guard":[["has","tecx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-1698cc78","guard":[["has","gaini"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-187a006d","guard":[["has","bzai"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-1b28975f","guard":[["has","obx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-1cd5e966","guard":[["has","tanh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-1d7a3e19","guard":[["has","sols"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-1e3d735c","guard":[["has","thry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-22d788da","guard":[["has","mgyr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-2444eb3c","guard":[["has","nktr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-246b5df1","guard":[["has","crdo"],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Credo Technology Group Holding Ltd."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-25f198f7","guard":[["has","gri"]],"pyramid":["render.template",{"lit":[{"slot":0}," is GRI Bio, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-26783d52","guard":[["has","xrxdw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-26994409","guard":[["has","eosew"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-29994a62","guard":[["has","alovw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-2c43a7af","guard":[["has","pdyn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-2ebc0c88","guard":[["has","form"],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-32e0e06b","guard":[["has","noemw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-32e6d4a1","guard":[["has","senea"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-33cf38ef","guard":[["has","ftha"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-35596f7f","guard":[["has","srzn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-359a93f8","guard":[["has","asth"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-3620498d","guard":[["has","stok"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-3b123913","guard":[["has","swkhl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-3cb9f832","guard":[["has","vlosu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-3dd7dde4","guard":[["has","jcap"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-43b94d41","guard":[["has","jagx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-481f9dd9","guard":[["has","ctrn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-4dbb031c","guard":[["has","aehl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-50deaa32","guard":[["has","vivk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-523b289e","guard":[["has","oriqu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-53ebc59a","guard":[["has","tnmg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-63258cd5","guard":[["has","onchw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-632a1ac6","guard":[["has","cme"]],"pyramid":["render.template",{"lit":[{"slot":0}," is CME Group Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-68194952","guard":[["has","mcft"]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-6db0565a","guard":[["has","ffbc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-6e98c709","guard":[["has","codx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-7151cffe","guard":[["has","bmhl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-73509c7e","guard":[["has","igac"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-77642ae2","guard":[["has","zbra"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-7b95759d","guard":[["has","nodk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-7d3b99b4","guard":[["has","acglo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-7e066b90","guard":[["has","til"],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-7f35793c","guard":[["has","sornu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-7f457693","guard":[["has","arhs"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-83a0903c","guard":[["has","ngen"]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-85fa6e76","guard":[["has","bpac"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-879aeb8a","guard":[["has","wing"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Wingstop Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-8a751b3b","guard":[["has","dlhc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-8bd9c4c7","guard":[["has","plus"],["has","trading"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ePlus inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-8ca23382","guard":[["has","lpbb"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-8cd19d0d","guard":[["has","glsi"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-8f38aa0a","guard":[["has","ecbk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-9122a3c8","guard":[["has","weys"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-92559e90","guard":[["has","tcrt"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-9699ff25","guard":[["has","pepg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-9b420106","guard":[["has","jkhy"],["has","what"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jack Henry & Associates, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-9dc75e7f","guard":[["has","pdsb"]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-9f23bbc2","guard":[["has","nexr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-a04b71ef","guard":[["has","mrln"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-a44d0a6f","guard":[["has","kdp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-a87803bc","guard":[["has","arcl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-a9e2ba4e","guard":[["has","pkbk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-ad8f4d92","guard":[["has","regcp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-ae7f2118","guard":[["has","cxiiu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-b3f0d05d","guard":[["has","bpypn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-b4eef4fa","guard":[["has","ecpg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-b87e64ab","guard":[["has","insg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-b9518cba","guard":[["has","mkdw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-ba8cd390","guard":[["has","qqqx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-bd1f13a8","guard":[["has","thh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-bd3105f0","guard":[["has","csq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-c6bc4cd5","guard":[["has","cctg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-c6eb738b","guard":[["has","swvlw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-ccc1144d","guard":[["has","ezra"],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Reliance Global Group, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-cd6d1f2d","guard":[["has","pre"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-ce90d12f","guard":[["has","rmti"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-d09dd19a","guard":[["has","ionr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-d33a2d39","guard":[["has","gcbc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-d51ce203","guard":[["has","wsbco"]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-d63f8e61","guard":[["has","bwin"]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-d76f10fc","guard":[["has","tnonw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-db14b3a5","guard":[["has","tcom"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-db4cc865","guard":[["has","byfc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-db647e8f","guard":[["has","cnxu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-dc49f476","guard":[["has","mdrr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-dd5917f2","guard":[["has","tacow"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-e17c962f","guard":[["has","smcip"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-e67b25f3","guard":[["has","rfaiu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is RF Acquisition Corp II."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-eea598c9","guard":[["has","capr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-f5ce4ead","guard":[["has","srbk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-f8aef6bf","guard":[["has","stak"]],"pyramid":["render.template",{"lit":[{"slot":0}," is STAK Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-fd24f217","guard":[["has","amlx"],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["render.list",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}]]],"mem":null},
{"id":"n-02242222","guard":[["hasAny",["item number","nodk","nth","position"]]],"pyramid":["render.template",{"lit":["NODK is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-025a1121","guard":[["hasAny",["item number","nth","position","thry"]]],"pyramid":["render.template",{"lit":["THRY is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-03fcd035","guard":[["hasAny",["item number","nth","position","rbcaa"]]],"pyramid":["render.template",{"lit":["RBCAA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-086fd2fd","guard":[["hasAny",["item number","nth","position","rfaiu"]]],"pyramid":["render.template",{"lit":["RFAIU is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-0b9d1fbc","guard":[["hasAny",["item number","nth","oriqu","position"]]],"pyramid":["render.template",{"lit":["ORIQU is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-0f334e21","guard":[["hasAny",["item number","mgyr","nth","position"]]],"pyramid":["render.template",{"lit":["MGYR is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-0f4438c3","guard":[["hasAny",["cctg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CCTG is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-11f13978","guard":[["hasAny",["asth","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ASTH is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-120f13bc","guard":[["hasAny",["item number","nth","position","wsbco"]]],"pyramid":["render.template",{"lit":["WSBCO is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-14eb1718","guard":[["hasAny",["iacq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["IACQ is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-15c82ae9","guard":[["hasAny",["item number","nth","plus","position"]],["has","trading"]],"pyramid":["render.template",{"lit":["PLUS is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-1afc593d","guard":[["hasAny",["item number","nth","position","thh"]]],"pyramid":["render.template",{"lit":["THH is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-1ce1c919","guard":[["hasAny",["item number","nth","position","srbk"]]],"pyramid":["render.template",{"lit":["SRBK is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-1d728fba","guard":[["hasAny",["bzai","item number","nth","position"]]],"pyramid":["render.template",{"lit":["BZAI is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-26616470","guard":[["hasAny",["bmhl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["BMHL is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-299b9e61","guard":[["hasAny",["item number","nth","position","tcrt"]]],"pyramid":["render.template",{"lit":["TCRT is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-3040828b","guard":[["hasAny",["codx","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CODX is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-30f77093","guard":[["hasAny",["item number","nth","position","tacow"]]],"pyramid":["render.template",{"lit":["TACOW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-32c7134a","guard":[["hasAny",["alovw","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ALOVW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-357a6c8f","guard":[["hasAny",["ftha","item number","nth","position"]]],"pyramid":["render.template",{"lit":["FTHA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-410580c0","guard":[["hasAny",["eosew","item number","nth","position"]]],"pyramid":["render.template",{"lit":["EOSEW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-42fb2771","guard":[["hasAny",["item number","nth","position","tcom"]]],"pyramid":["render.template",{"lit":["TCOM is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-44143eb2","guard":[["hasAny",["insg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["INSG is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-44908fcf","guard":[["hasAny",["item number","nth","obx","position"]]],"pyramid":["render.template",{"lit":["OBX is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-45025756","guard":[["hasAny",["bpypn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["BPYPN is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-458a564d","guard":[["hasAny",["item number","jagx","nth","position"]]],"pyramid":["render.template",{"lit":["JAGX is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-45d972dd","guard":[["hasAny",["byfc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["BYFC is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-45e388ef","guard":[["hasAny",["item number","nth","position","qqqx"]]],"pyramid":["render.template",{"lit":["QQQX is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-4671f411","guard":[["hasAny",["bpac","item number","nth","position"]]],"pyramid":["render.template",{"lit":["BPAC is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-46b7cf7e","guard":[["hasAny",["dlhc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["DLHC is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-470776af","guard":[["hasAny",["item number","nth","position","xrxdw"]]],"pyramid":["render.template",{"lit":["XRXDW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-48585504","guard":[["hasAny",["ionr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["IONR is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-4accb463","guard":[["hasAny",["ezra","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["EZRA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-4eb4e328","guard":[["hasAny",["item number","jkhy","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["JKHY is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-4fd6146b","guard":[["hasAny",["item number","nth","position","swvlw"]]],"pyramid":["render.template",{"lit":["SWVLW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-50e7d706","guard":[["hasAny",["item number","nktr","nth","position"]]],"pyramid":["render.template",{"lit":["NKTR is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-587a58df","guard":[["hasAny",["form","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["FORM is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-5c48b64d","guard":[["hasAny",["arcl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ARCL is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-62900e08","guard":[["hasAny",["gaini","item number","nth","position"]]],"pyramid":["render.template",{"lit":["GAINI is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-6472db02","guard":[["hasAny",["ctrn","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CTRN is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-6a56007d","guard":[["hasAny",["item number","nth","position","til"]],["has","which"]],"pyramid":["render.template",{"lit":["TIL is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-6aa36cba","guard":[["hasAny",["item number","nth","pdyn","position"]]],"pyramid":["render.template",{"lit":["PDYN is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-703d3d20","guard":[["hasAny",["item number","nth","position","zbra"]]],"pyramid":["render.template",{"lit":["ZBRA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-70950c28","guard":[["hasAny",["item number","noemw","nth","position"]]],"pyramid":["render.template",{"lit":["NOEMW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-71781455","guard":[["hasAny",["item number","nth","position","ptacw"]]],"pyramid":["render.template",{"lit":["PTACW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-72330cc7","guard":[["hasAny",["item number","nth","position","ptac"]]],"pyramid":["render.template",{"lit":["PTAC is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-72ce709d","guard":[["hasAny",["item number","nth","position","stok"]]],"pyramid":["render.template",{"lit":["STOK is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-756164a6","guard":[["hasAny",["ecbk","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ECBK is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-75c7707b","guard":[["hasAny",["igac","item number","nth","position"]]],"pyramid":["render.template",{"lit":["IGAC is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-768b21e2","guard":[["hasAny",["item number","nth","position","srzn"]]],"pyramid":["render.template",{"lit":["SRZN is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-780076cc","guard":[["hasAny",["aehl","item number","nth","position"]]],"pyramid":["render.template",{"lit":["AEHL is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-780773ba","guard":[["hasAny",["item number","nth","position","sornu"]]],"pyramid":["render.template",{"lit":["SORNU is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-7c017a29","guard":[["hasAny",["item number","nth","position","weys"]]],"pyramid":["render.template",{"lit":["WEYS is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-8119b447","guard":[["hasAny",["item number","nth","position","tanh"]]],"pyramid":["render.template",{"lit":["TANH is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-8146c631","guard":[["hasAny",["item number","mdrr","nth","position"]]],"pyramid":["render.template",{"lit":["MDRR is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-8540ae78","guard":[["hasAny",["item number","nth","position","rmti"]]],"pyramid":["render.template",{"lit":["RMTI is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-8740cfaa","guard":[["hasAny",["item number","ngen","nth","position"]]],"pyramid":["render.template",{"lit":["NGEN is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-8ad01588","guard":[["hasAny",["gri","item number","nth","position"]]],"pyramid":["render.template",{"lit":["GRI is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-8d23077a","guard":[["hasAny",["item number","nth","position","senea"]]],"pyramid":["render.template",{"lit":["SENEA is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-8db4c482","guard":[["hasAny",["acglo","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ACGLO is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-91b00bca","guard":[["hasAny",["cxiiu","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CXIIU is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-9362204e","guard":[["hasAny",["crdo","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["CRDO is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-93a5f95e","guard":[["hasAny",["item number","kdp","nth","position"]]],"pyramid":["render.template",{"lit":["KDP is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-99537b15","guard":[["hasAny",["item number","mkdw","nth","position"]]],"pyramid":["render.template",{"lit":["MKDW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-9f9e26ba","guard":[["hasAny",["item number","nth","pepg","position"]]],"pyramid":["render.template",{"lit":["PEPG is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-a0deef25","guard":[["hasAny",["item number","nth","position","vivk"]]],"pyramid":["render.template",{"lit":["VIVK is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-a2975946","guard":[["hasAny",["item number","lpbb","nth","position"]]],"pyramid":["render.template",{"lit":["LPBB is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-a6ed49f9","guard":[["hasAny",["item number","nth","position","regcp"]]],"pyramid":["render.template",{"lit":["REGCP is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-a799e468","guard":[["hasAny",["item number","nexr","nth","position"]]],"pyramid":["render.template",{"lit":["NEXR is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-aa9a5b45","guard":[["hasAny",["item number","nth","position","tnonw"]]],"pyramid":["render.template",{"lit":["TNONW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-b05a3c04","guard":[["hasAny",["fip","item number","nth","position"]]],"pyramid":["render.template",{"lit":["FIP is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-b14ab59d","guard":[["hasAny",["item number","mrln","nth","position"]]],"pyramid":["render.template",{"lit":["MRLN is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-b14fe522","guard":[["hasAny",["item number","nth","position","stak"]]],"pyramid":["render.template",{"lit":["STAK is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-b4f8db49","guard":[["hasAny",["item number","mcft","nth","position"]]],"pyramid":["render.template",{"lit":["MCFT is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-b5399cac","guard":[["hasAny",["amlx","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":["AMLX is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-b8ea3095","guard":[["hasAny",["gcbc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["GCBC is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-bbd2d727","guard":[["hasAny",["item number","nth","position","skyaw"]]],"pyramid":["render.template",{"lit":["SKYAW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-bc095447","guard":[["hasAny",["arhs","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ARHS is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-bc36a404","guard":[["hasAny",["cme","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CME is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-bebdf61b","guard":[["hasAny",["item number","nth","position","vlosu"]]],"pyramid":["render.template",{"lit":["VLOSU is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-c06b4897","guard":[["hasAny",["item number","nth","pdsb","position"]]],"pyramid":["render.template",{"lit":["PDSB is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-c0a11ff4","guard":[["hasAny",["capr","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CAPR is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-c33aa245","guard":[["hasAny",["ffbc","item number","nth","position"]]],"pyramid":["render.template",{"lit":["FFBC is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-c479b9ee","guard":[["hasAny",["item number","jcap","nth","position"]]],"pyramid":["render.template",{"lit":["JCAP is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-c6853263","guard":[["hasAny",["cnxu","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CNXU is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-c9c4070d","guard":[["hasAny",["csq","item number","nth","position"]]],"pyramid":["render.template",{"lit":["CSQ is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-ce019e25","guard":[["hasAny",["item number","nth","position","tecx"]]],"pyramid":["render.template",{"lit":["TECX is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-cef23b41","guard":[["hasAny",["item number","nth","onchw","position"]]],"pyramid":["render.template",{"lit":["ONCHW is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-d0359e29","guard":[["hasAny",["brkrp","item number","nth","position"]]],"pyramid":["render.template",{"lit":["BRKRP is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-d4453730","guard":[["hasAny",["item number","nth","position","wing"]],["has","name"]],"pyramid":["render.template",{"lit":["WING is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-d59e29ac","guard":[["hasAny",["blzru","item number","nth","position"]]],"pyramid":["render.template",{"lit":["BLZRU is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-d5b46e92","guard":[["hasAny",["item number","nth","pkbk","position"]]],"pyramid":["render.template",{"lit":["PKBK is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-d81e09fd","guard":[["hasAny",["item number","nth","position","sols"]]],"pyramid":["render.template",{"lit":["SOLS is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-dbfb6d5e","guard":[["hasAny",["bwin","item number","nth","position"]]],"pyramid":["render.template",{"lit":["BWIN is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-de505796","guard":[["hasAny",["item number","nth","position","tnmg"]]],"pyramid":["render.template",{"lit":["TNMG is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-df93634d","guard":[["hasAny",["item number","nth","position","swkhl"]]],"pyramid":["render.template",{"lit":["SWKHL is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-e6165746","guard":[["hasAny",["item number","nth","position","smcip"]]],"pyramid":["render.template",{"lit":["SMCIP is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-e755052a","guard":[["hasAny",["glsi","item number","nth","position"]]],"pyramid":["render.template",{"lit":["GLSI is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-f0bf9c17","guard":[["hasAny",["ecpg","item number","nth","position"]]],"pyramid":["render.template",{"lit":["ECPG is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-fffc211f","guard":[["hasAny",["item number","nth","position","pre"]]],"pyramid":["render.template",{"lit":["PRE is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"}],{"lit":1}],{"lit":"nasdaq-listed"},{"lit":"Nasdaq symbol"},{"lit":"company"}]],"mem":null},
{"id":"n-00e1c822","guard":[["hasAny",["company","name","nasdaq","stak","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as STAK":"STAK is STAK Inc.."}}},
{"id":"n-0100e98f","guard":[["has","pdyn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-015f475a","guard":[["has","csq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["sense.lastWord"]],"mem":null},
{"id":"n-06a31c9a","guard":[["hasAny",["acglo","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as ACGLO":"ACGLO is Arch Capital Group Ltd.."}}},
{"id":"n-081a8fa1","guard":[["hasAny",["company","eosew","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc.."}}},
{"id":"n-09ca8b1b","guard":[["has","ffbc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-0a39dda3","guard":[["has","mcft"]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-0be5b769","guard":[["hasAny",["company","has","mkdw","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol MKDW":"MKDW is MKDWELL Tech Inc.."}}},
{"id":"n-0bffae77","guard":[["has","regcp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-0d9dad6d","guard":[["has","pdsb"]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-11028d09","guard":[["has","tecx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-12a784da","guard":[["hasAny",["company","form","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as FORM":"FORM is FormFactor, Inc.."}}},
{"id":"n-12eb8865","guard":[["hasAny",["codx","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as CODX":"CODX is Co-Diagnostics, Inc.."}}},
{"id":"n-1343db1f","guard":[["hasAny",["company","gaini","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as GAINI":"GAINI is Gladstone Investment Corporation."}}},
{"id":"n-13e59e10","guard":[["hasAny",["company","name","nasdaq","srbk","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SRBK":"SRBK is SR Bancorp, Inc.."}}},
{"id":"n-1498bf56","guard":[["hasAny",["company","ezra","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol EZRA":"EZRA is Reliance Global Group, Inc.."}}},
{"id":"n-152021a3","guard":[["hasAny",["company","ecpg","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as ECPG":"ECPG is Encore Capital Group Inc."}}},
{"id":"n-15d0e1b1","guard":[["hasAny",["company","listed","nktr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as NKTR":"NKTR is Nektar Therapeutics."}}},
{"id":"n-181d824d","guard":[["has","amlx"],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-1aa38b7d","guard":[["has","ctrn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-1b9d8d91","guard":[["hasAny",["company","name","nasdaq","tanh","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as TANH":"TANH is Tantech Holdings Ltd.."}}},
{"id":"n-1e51981c","guard":[["has","dlhc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-1e819a9e","guard":[["hasAny",["company","has","nasdaq","rbcaa","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol RBCAA":"RBCAA is Republic Bancorp, Inc.."}}},
{"id":"n-1e8a3af6","guard":[["has","ngen"]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-1f45db3d","guard":[["hasAny",["company","name","nasdaq","stok","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc.."}}},
{"id":"n-1fab2fab","guard":[["hasAny",["company","fip","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as FIP":"FIP is FTAI Infrastructure Inc.."}}},
{"id":"n-21cfdd23","guard":[["hasAny",["alovw","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."}}},
{"id":"n-228d4b00","guard":[["has","rbcaa"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-22a39218","guard":[["hasAny",["company","listed","mdrr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as MDRR":"MDRR is Medalist Diversified, Inc.."}}},
{"id":"n-22ce43cf","guard":[["hasAny",["company","has","nasdaq","swkhl","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SWKHL":"SWKHL is SWK Holdings Corporation."}}},
{"id":"n-234c2596","guard":[["has","thry"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-2405bf1e","guard":[["hasAny",["company","listed","tacow"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as TACOW":"TACOW is Berto Acquisition Corp.."}}},
{"id":"n-271effbd","guard":[["has","acglo"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["sense.lastWord"]],"mem":null},
{"id":"n-274900da","guard":[["hasAny",["company","jcap","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc.."}}},
{"id":"n-29dbfa20","guard":[["has","tcom"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-2b3f0dca","guard":[["hasAny",["blzru","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp.."}}},
{"id":"n-2c6c7777","guard":[["has","codx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-2d2d29c7","guard":[["has","tnmg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["sense.lastWord"]],"mem":null},
{"id":"n-2d4aad21","guard":[["hasAny",["bpac","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd."}}},
{"id":"n-2ff8d325","guard":[["hasAny",["amlx","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc.."}}},
{"id":"n-300baa21","guard":[["has","tacow"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-301c0292","guard":[["hasAny",["company","name","nasdaq","oriqu","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I."}}},
{"id":"n-3114b1c1","guard":[["hasAny",["company","has","nasdaq","sornu","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SORNU":"SORNU is Soren Acquisition Corp.."}}},
{"id":"n-316be78b","guard":[["has","nktr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["sense.lastWord"]],"mem":null},
{"id":"n-318445d6","guard":[["has","wsbco"]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-33782d75","guard":[["has","tcrt"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-35a5956f","guard":[["hasAny",["company","mgyr","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc.."}}},
{"id":"n-363316e3","guard":[["has","tanh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["sense.lastWord"]],"mem":null},
{"id":"n-36499f73","guard":[["hasAny",["company","jkhy","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-3d7f925a","guard":[["hasAny",["company","listed","pkbk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as PKBK":"PKBK is Parke Bancorp, Inc.."}}},
{"id":"n-3e0ff14d","guard":[["hasAny",["company","has","nasdaq","nexr","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol NEXR":"NEXR is Nexera Technologies Ltd."}}},
{"id":"n-3e590cae","guard":[["has","cxiiu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["sense.lastWord"]],"mem":null},
{"id":"n-3e72e22f","guard":[["hasAny",["company","has","nasdaq","symbol","weys"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol WEYS":"WEYS is Weyco Group, Inc.."}}},
{"id":"n-3f59368e","guard":[["hasAny",["company","name","nasdaq","tcrt","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc.."}}},
{"id":"n-40d56c3e","guard":[["has","form"],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-426fedf1","guard":[["hasAny",["arhs","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as ARHS":"ARHS is Arhaus, Inc.."}}},
{"id":"n-437e6de4","guard":[["hasAny",["arcl","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ARCL":"ARCL is ARC Group Acquisition I Corp."}}},
{"id":"n-44b334a1","guard":[["hasAny",["company","has","nasdaq","pdyn","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDYN":"PDYN is Palladyne AI Corp.."}}},
{"id":"n-46716b81","guard":[["hasAny",["brkrp","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BRKRP":"BRKRP is Bruker Corporation."}}},
{"id":"n-48e832ff","guard":[["hasAny",["company","has","nasdaq","skyaw","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SKYAW":"SKYAW is SkyAI, Inc.."}}},
{"id":"n-4bd2c4c4","guard":[["has","ftha"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["sense.lastWord"]],"mem":null},
{"id":"n-4ebd6905","guard":[["hasAny",["company","crdo","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as CRDO":"CRDO is Credo Technology Group Holding Ltd."}}},
{"id":"n-53ed067e","guard":[["has","smcip"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-54caa73b","guard":[["has","noemw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-561c4a74","guard":[["hasAny",["company","has","nasdaq","symbol","til"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TIL":"TIL is Instil Bio, Inc.."}}},
{"id":"n-5716a3fd","guard":[["hasAny",["company","name","nasdaq","onchw","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp.."}}},
{"id":"n-57badbe1","guard":[["has","mgyr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-58a73277","guard":[["has","senea"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-5a1d0839","guard":[["has","gcbc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-5c6aa117","guard":[["hasAny",["company","kdp","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as KDP":"KDP is Keurig Dr Pepper Inc.."}}},
{"id":"n-5cf26ca6","guard":[["has","ionr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-603823c3","guard":[["has","rmti"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-60f70d17","guard":[["has","alovw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-6105cd5a","guard":[["has","cctg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-631946f7","guard":[["has","obx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-6343cde2","guard":[["has","bpypn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["sense.lastWord"]],"mem":null},
{"id":"n-642cc168","guard":[["has","qqqx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["sense.lastWord"]],"mem":null},
{"id":"n-65be4318","guard":[["has","weys"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-662e2ef3","guard":[["has","ecbk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-664f3f3a","guard":[["hasAny",["company","has","nasdaq","symbol","zbra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ZBRA":"ZBRA is Zebra Technologies Corporation."}}},
{"id":"n-679726cd","guard":[["hasAny",["company","has","nasdaq","symbol","tecx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TECX":"TECX is Tectonic Therapeutic, Inc.."}}},
{"id":"n-67982a7c","guard":[["has","kdp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-691ead06","guard":[["has","jcap"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-69adcd65","guard":[["hasAny",["company","listed","vlosu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as VLOSU":"VLOSU is Velos Acquisition I Corp.."}}},
{"id":"n-6a02393c","guard":[["hasAny",["company","listed","lpbb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as LPBB":"LPBB is Launch Two Acquisition Corp.."}}},
{"id":"n-6d2c8441","guard":[["has","stak"]],"pyramid":["render.template",{"lit":[{"slot":0}," is STAK Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-6d6ed5cb","guard":[["hasAny",["company","has","insg","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol INSG":"INSG is Inseego Corp.."}}},
{"id":"n-6fe4aa3c","guard":[["hasAny",["company","glsi","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as GLSI":"GLSI is Greenwich LifeSciences, Inc.."}}},
{"id":"n-708b8e61","guard":[["hasAny",["company","ftha","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp."}}},
{"id":"n-715e788c","guard":[["hasAny",["company","name","nasdaq","thry","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as THRY":"THRY is Thryv Holdings, Inc.."}}},
{"id":"n-718e389e","guard":[["has","gaini"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-7426f71e","guard":[["has","pkbk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-746305fd","guard":[["has","iacq"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-748a2197","guard":[["hasAny",["company","cxiiu","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII."}}},
{"id":"n-76e69ba5","guard":[["has","byfc"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-773426e3","guard":[["hasAny",["company","has","nasdaq","pdsb","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDSB":"PDSB is PDS Biotechnology Corporation."}}},
{"id":"n-779e04b0","guard":[["has","xrxdw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-77b1125c","guard":[["has","arhs"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-791b9b6c","guard":[["hasAny",["asth","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ASTH":"ASTH is Astrana Health Inc.."}}},
{"id":"n-79997558","guard":[["has","pre"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-7a60b584","guard":[["has","asth"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7b5d76ba","guard":[["hasAny",["company","jagx","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as JAGX":"JAGX is Jaguar Health, Inc.."}}},
{"id":"n-7bd290b0","guard":[["has","bzai"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7c5a7652","guard":[["has","nodk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7ce41896","guard":[["has","igac"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-7d2f04f1","guard":[["hasAny",["company","has","nasdaq","obx","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol OBX":"OBX is Obsidian Therapeutics, Inc.."}}},
{"id":"n-7e0477e0","guard":[["has","vlosu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-7faebde7","guard":[["hasAny",["company","ctrn","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as CTRN":"CTRN is Citi Trends, Inc.."}}},
{"id":"n-8119992b","guard":[["has","bwin"]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-835c1185","guard":[["hasAny",["cnxu","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as CNXU":"CNXU is Conexeu Sciences Inc.."}}},
{"id":"n-843c89a7","guard":[["hasAny",["company","has","nasdaq","rfaiu","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol RFAIU":"RFAIU is RF Acquisition Corp II."}}},
{"id":"n-86838ada","guard":[["has","eosew"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-890d50d7","guard":[["hasAny",["bpypn","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as BPYPN":"BPYPN is Brookfield Property Partners L.P.."}}},
{"id":"n-8a678954","guard":[["hasAny",["company","csq","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CSQ":"CSQ is Calamos Strategic Total Return Fund."}}},
{"id":"n-8b5876bb","guard":[["has","mkdw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-8ccbde3e","guard":[["hasAny",["company","ecbk","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ECBK":"ECBK is ECB Bancorp, Inc.."}}},
{"id":"n-90c6ce59","guard":[["hasAny",["cctg","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CCTG":"CCTG is CCSC Technology International Holdings Limited."}}},
{"id":"n-91e0a741","guard":[["hasAny",["company","name","nasdaq","swvlw","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp."}}},
{"id":"n-9256346f","guard":[["hasAny",["bwin","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc.."}}},
{"id":"n-93028f13","guard":[["hasAny",["company","name","nasdaq","trading","wing"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as WING":"WING is Wingstop Inc.."}}},
{"id":"n-947095a7","guard":[["has","sornu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-968b5896","guard":[["has","tnonw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-970c054b","guard":[["hasAny",["company","listed","smcip"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as SMCIP":"SMCIP is Super Micro Computer, Inc.."}}},
{"id":"n-974c24df","guard":[["hasAny",["company","listed","pre"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as PRE":"PRE is Prenetics Global Limited."}}},
{"id":"n-99180075","guard":[["has","thh"]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-99505398","guard":[["hasAny",["company","dlhc","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as DLHC":"DLHC is DLH Holdings Corp.."}}},
{"id":"n-997b2714","guard":[["hasAny",["company","name","nasdaq","senea","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SENEA":"SENEA is Seneca Foods Corp.."}}},
{"id":"n-9f777c1c","guard":[["has","mrln"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-a16839b8","guard":[["hasAny",["company","listed","noemw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as NOEMW":"NOEMW is CO2 Energy Transition Corp.."}}},
{"id":"n-a1f0d39c","guard":[["has","ecpg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["sense.lastWord"]],"mem":null},
{"id":"n-a204ae0c","guard":[["has","aehl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-a3c1d388","guard":[["has","sols"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-a44a6828","guard":[["hasAny",["company","name","nasdaq","plus","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as PLUS":"PLUS is ePlus inc.."}}},
{"id":"n-a5026823","guard":[["hasAny",["company","has","nasdaq","ptacw","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PTACW":"PTACW is Patriot Acquisition Corp.."}}},
{"id":"n-a55e3e9f","guard":[["has","srbk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-a67dc5f8","guard":[["hasAny",["company","has","nasdaq","symbol","tcom"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TCOM":"TCOM is Trip.com Group Limited."}}},
{"id":"n-aa18cdb6","guard":[["hasAny",["company","has","nasdaq","ptac","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PTAC":"PTAC is Patriot Acquisition Corp.."}}},
{"id":"n-aab09838","guard":[["hasAny",["company","name","nasdaq","ngen","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as NGEN":"NGEN is NervGen Pharma Corp.."}}},
{"id":"n-ad9d1ac1","guard":[["has","swkhl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-af2af371","guard":[["hasAny",["aehl","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited."}}},
{"id":"n-b24b2393","guard":[["has","mdrr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-b4521b09","guard":[["hasAny",["company","name","nasdaq","thh","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as THH":"THH is TryHard Holdings Limited."}}},
{"id":"n-b65f2931","guard":[["hasAny",["company","mcft","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc.."}}},
{"id":"n-b82a5f7a","guard":[["hasAny",["company","listed","wsbco"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as WSBCO":"WSBCO is WesBanco, Inc.."}}},
{"id":"n-b8c6788c","guard":[["has","arcl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["sense.lastWord"]],"mem":null},
{"id":"n-b910e5bb","guard":[["has","cnxu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-b91d736c","guard":[["has","jagx"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ba7f6d31","guard":[["hasAny",["company","listed","tnonw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as TNONW":"TNONW is Tenon Medical, Inc.."}}},
{"id":"n-bb94a383","guard":[["hasAny",["company","has","nasdaq","symbol","tnmg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TNMG":"TNMG is TNL Mediagene."}}},
{"id":"n-bf0e4d6b","guard":[["hasAny",["company","name","nasdaq","trading","xrxdw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation."}}},
{"id":"n-c049ab25","guard":[["has","bmhl"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["sense.lastWord"]],"mem":null},
{"id":"n-c2df0d5d","guard":[["has","capr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-c2fd0a9e","guard":[["has","bpac"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-c6536d0d","guard":[["has","cme"]],"pyramid":["render.template",{"lit":[{"slot":0}," is CME Group Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-c6d652cc","guard":[["has","zbra"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-c6e4e29b","guard":[["hasAny",["company","ionr","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as IONR":"IONR is ioneer Ltd."}}},
{"id":"n-c79dd675","guard":[["hasAny",["company","gri","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol GRI":"GRI is GRI Bio, Inc.."}}},
{"id":"n-ca0e27d4","guard":[["has","insg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ca1645bd","guard":[["has","nexr"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["sense.lastWord"]],"mem":null},
{"id":"n-cc4cb952","guard":[["has","fip"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-cd1ce971","guard":[["hasAny",["cme","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CME":"CME is CME Group Inc.."}}},
{"id":"n-cd4af155","guard":[["hasAny",["company","listed","qqqx"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund."}}},
{"id":"n-cf0f9435","guard":[["hasAny",["capr","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as CAPR":"CAPR is Capricor Therapeutics, Inc.."}}},
{"id":"n-d2268dee","guard":[["has","stok"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-d368ed23","guard":[["has","swvlw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["sense.lastWord"]],"mem":null},
{"id":"n-d50a81d3","guard":[["hasAny",["bzai","company","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as BZAI":"BZAI is Blaize Holdings, Inc.."}}},
{"id":"n-d713f194","guard":[["hasAny",["company","igac","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as IGAC":"IGAC is Invest Green Acquisition Corporation."}}},
{"id":"n-d86a2105","guard":[["has","lpbb"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-dab7f5ff","guard":[["hasAny",["company","gcbc","listed"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as GCBC":"GCBC is Greene County Bancorp, Inc.."}}},
{"id":"n-db00415e","guard":[["has","rfaiu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is RF Acquisition Corp II."]},["sense.lastWord"]],"mem":null},
{"id":"n-dbfcda8c","guard":[["hasAny",["company","listed","mrln"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as MRLN":"MRLN is Merlin, Inc.."}}},
{"id":"n-dccc4b88","guard":[["has","gri"]],"pyramid":["render.template",{"lit":[{"slot":0}," is GRI Bio, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ddcdbe29","guard":[["has","oriqu"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["sense.lastWord"]],"mem":null},
{"id":"n-df81a4f2","guard":[["hasAny",["company","has","nasdaq","sols","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SOLS":"SOLS is Solstice Advanced Materials Inc.."}}},
{"id":"n-e1fec6fe","guard":[["has","srzn"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-e2956958","guard":[["hasAny",["company","ffbc","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as FFBC":"FFBC is First Financial Bancorp.."}}},
{"id":"n-e380f1fa","guard":[["hasAny",["company","name","nasdaq","srzn","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SRZN":"SRZN is Surrozen, Inc.."}}},
{"id":"n-e534f83a","guard":[["hasAny",["company","listed","rmti"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as RMTI":"RMTI is Rockwell Medical, Inc.."}}},
{"id":"n-e691676b","guard":[["hasAny",["company","has","nasdaq","regcp","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol REGCP":"REGCP is Regency Centers Corporation."}}},
{"id":"n-e7122479","guard":[["hasAny",["byfc","company","has","nasdaq","symbol"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol BYFC":"BYFC is Broadway Financial Corporation."}}},
{"id":"n-e7655e0e","guard":[["hasAny",["company","has","nasdaq","symbol","vivk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol VIVK":"VIVK is Vivakor, Inc.."}}},
{"id":"n-ea96bbcf","guard":[["hasAny",["company","listed","pepg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what company is listed as PEPG":"PEPG is PepGen Inc.."}}},
{"id":"n-ecb97dbf","guard":[["hasAny",["bmhl","company","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited."}}},
{"id":"n-ecc22363","guard":[["has","glsi"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-ed1e61bd","guard":[["hasAny",["company","iacq","name","nasdaq","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp.."}}},
{"id":"n-ef9846bc","guard":[["has","skyaw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f4eebd8e","guard":[["has","pepg"]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f4f39c7b","guard":[["hasAny",["company","name","nasdaq","nodk","trading"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as NODK":"NODK is NI Holdings, Inc.."}}},
{"id":"n-f70b71db","guard":[["has","vivk"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f8916205","guard":[["has","onchw"]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f92cf38c","guard":[["has","til"],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["sense.lastWord"]],"mem":null},
{"id":"n-f9fdd43c","guard":[["has","brkrp"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["sense.lastWord"]],"mem":null},
{"id":"n-ff6be436","guard":[["has","blzru"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["sense.lastWord"]],"mem":null},
{"id":"n-00053fa0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-000735fe","guard":[["hasAny",["lower case","lowercase","small letters","til"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0058b31e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tcrt","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-00a3ae6b","guard":[["hasAny",["lower case","lowercase","pdsb","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-02585bd3","guard":[["has","gri"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-02e7f52e","guard":[["hasAny",["bmhl","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-037315a7","guard":[["hasAny",["ecpg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-03cecaad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","zbra"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-043d7cec","guard":[["hasAny",["kdp","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-047f6b86","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pkbk","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-04897fa9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mcft","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-056bb023","guard":[["hasAny",["lower case","lowercase","small letters","thry"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0752921a","guard":[["hasAny",["arcl","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-09ff2373","guard":[["hasAny",["capr","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0b9ba94a","guard":[["hasAny",["dlhc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0c0109a6","guard":[["hasAny",["lower case","lowercase","skyaw","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-0d2f7396","guard":[["hasAny",["pepg","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0e1ab976","guard":[["hasAny",["nktr","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-0e2841dc","guard":[["hasAny",["form","shortest","shortest one","shortest word"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0eabb440","guard":[["hasAny",["noemw","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-0f8bc679","guard":[["hasAny",["shortest","shortest one","shortest word","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-100e7c0a","guard":[["hasAny",["capr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-105760b5","guard":[["hasAny",["lower case","lowercase","obx","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1150b31e","guard":[["hasAny",["ffbc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1183bb12","guard":[["hasAny",["alovw","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1194fb57","guard":[["hasAny",["acglo","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-11be6e46","guard":[["hasAny",["alovw","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-144019c7","guard":[["hasAny",["acglo","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-15592661","guard":[["hasAny",["ecpg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-157df8b0","guard":[["hasAny",["aehl","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1610b2c5","guard":[["has","cme"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-17d6cb42","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ctrn","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-19054cd6","guard":[["hasAny",["lower case","lowercase","pepg","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1987bf85","guard":[["hasAny",["lower case","lowercase","mgyr","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-19bcd9ae","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tcom","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1a8f649b","guard":[["hasAny",["ecbk","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1ad042eb","guard":[["hasAny",["no vowels","remove vowels","srzn","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-1b3ebdb1","guard":[["hasAny",["blzru","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1edf8b38","guard":[["hasAny",["pkbk","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1fff0e0d","guard":[["hasAny",["asth","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2041dbe3","guard":[["hasAny",["nktr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-21ab3aa4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","csq","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-22e91085","guard":[["hasAny",["rmti","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-23ae88a6","guard":[["hasAny",["byfc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-24d95be8","guard":[["hasAny",["lower case","lowercase","small letters","tacow"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-280028cd","guard":[["hasAny",["lower case","lowercase","small letters","vivk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2b705054","guard":[["hasAny",["lower case","lowercase","mrln","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2bd9c40d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pre","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-2c668d99","guard":[["hasAny",["bpypn","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2ca3f450","guard":[["hasAny",["pre","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2cee3290","guard":[["hasAny",["bwin","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2e68673e","guard":[["hasAny",["lower case","lowercase","regcp","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-301778e9","guard":[["hasAny",["bwin","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-303ba55b","guard":[["hasAny",["alovw","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3146318c","guard":[["hasAny",["lower case","lowercase","pre","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-31c8647b","guard":[["hasAny",["csq","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-33e3db66","guard":[["hasAny",["brkrp","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-34b20024","guard":[["hasAny",["capitalise","capitalize","capitalize each word","swvlw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-356c5cbb","guard":[["hasAny",["lower case","lowercase","small letters","smcip"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-35c9524f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rmti","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-36734751","guard":[["hasAny",["alphabetize the letters","letters in order","qqqx","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-36b776c4","guard":[["hasAny",["bpac","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-399b86a9","guard":[["hasAny",["aehl","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3ae8a264","guard":[["hasAny",["lower case","lowercase","pkbk","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3ded66f8","guard":[["hasAny",["asth","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3fca5c6b","guard":[["hasAny",["ctrn","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-40bfa3a4","guard":[["hasAny",["mcft","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4126c6cd","guard":[["hasAny",["jagx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-423155b5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cnxu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4297df50","guard":[["hasAny",["glsi","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-435923da","guard":[["hasAny",["bmhl","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4481defc","guard":[["hasAny",["lower case","lowercase","nodk","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4636ddad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mkdw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-47732349","guard":[["hasAny",["lower case","lowercase","small letters","zbra"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-47d78429","guard":[["hasAny",["mkdw","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4850e2f1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","thh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4ad70731","guard":[["hasAny",["mrln","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4b3724d2","guard":[["hasAny",["no vowels","remove vowels","thh","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-4b511c33","guard":[["hasAny",["arhs","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4bfe53f0","guard":[["hasAny",["lower case","lowercase","small letters","swkhl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-4fd7cba6","guard":[["hasAny",["lower case","lowercase","rmti","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-50091c91","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jagx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-50ed71fb","guard":[["hasAny",["bpypn","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-535f193b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","capr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-538b0ba6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","stok","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-54200dfc","guard":[["hasAny",["lower case","lowercase","small letters","tecx"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-58145021","guard":[["hasAny",["arhs","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5b959f29","guard":[["hasAny",["csq","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-5c37554b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tnmg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5d7c525f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","eosew","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5dbb6c44","guard":[["hasAny",["gri","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["GRI is ",{"slot":0}," Bio, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5e413262","guard":[["hasAny",["lower case","lowercase","small letters","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5f0407f2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ionr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5f1eadb3","guard":[["hasAny",["lower case","lowercase","small letters","weys"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5fe21e26","guard":[["hasAny",["capitalise","capitalize","capitalize each word","swkhl","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6033b972","guard":[["hasAny",["capitalise","capitalize","capitalize each word","onchw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6045f604","guard":[["hasAny",["lower case","lowercase","pdyn","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-60644098","guard":[["hasAny",["lower case","lowercase","nexr","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6175df6b","guard":[["hasAny",["lower case","lowercase","small letters","tcrt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-61b9e149","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pepg","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-62375649","guard":[["hasAny",["gaini","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-637f2d37","guard":[["hasAny",["no vowels","remove vowels","without vowels","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-638165a9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","regcp","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-63c9b717","guard":[["hasAny",["insg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-659c030c","guard":[["hasAny",["amlx","capitalise","capitalize","capitalize each word","title case"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-65c90adc","guard":[["hasAny",["no vowels","pdyn","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-671097ed","guard":[["hasAny",["blzru","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-67374543","guard":[["hasAny",["lower case","lowercase","ngen","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-67b59291","guard":[["hasAny",["capitalise","capitalize","capitalize each word","skyaw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-688b0cd4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sornu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-69e8f4c7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","oriqu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6b613046","guard":[["hasAny",["lower case","lowercase","mcft","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-6b7a3e01","guard":[["hasAny",["qqqx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6e1f4fe4","guard":[["hasAny",["mdrr","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6e79741e","guard":[["hasAny",["arcl","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-706f5401","guard":[["hasAny",["lower case","lowercase","small letters","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-71f1118e","guard":[["hasAny",["cnxu","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7203e17a","guard":[["hasAny",["cme","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":["CME is ",{"slot":0}," Group Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-729f571b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","noemw","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-72f21a9a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","codx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-73169dc9","guard":[["hasAny",["lower case","lowercase","small letters","sornu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-735a7114","guard":[["hasAny",["lower case","lowercase","small letters","tnmg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-75c71ced","guard":[["hasAny",["capitalise","capitalize","capitalize each word","qqqx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-78453c45","guard":[["hasAny",["lower case","lowercase","small letters","tanh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7913bc17","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cctg","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-79e02294","guard":[["hasAny",["capitalise","capitalize","capitalize each word","igac","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7aaca235","guard":[["hasAny",["alphabetize the letters","fip","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-7b1d150c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7b5850fb","guard":[["hasAny",["cctg","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7b8cc11c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","jcap","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7cc1d605","guard":[["hasAny",["bpypn","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-7d299fe8","guard":[["hasAny",["iacq","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-7ed3237e","guard":[["hasAny",["lpbb","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7fec57b0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","iacq","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-81610cd4","guard":[["hasAny",["no vowels","remove vowels","thry","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-81bfee3c","guard":[["hasAny",["lower case","lowercase","small letters","swvlw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-820743a2","guard":[["hasAny",["capitalise","capitalize","capitalize each word","dlhc","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8269721a","guard":[["hasAny",["lower case","lowercase","noemw","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-82e740ee","guard":[["hasAny",["capitalise","capitalize","capitalize each word","sols","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-838fe5f8","guard":[["hasAny",["codx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-83ea27d1","guard":[["hasAny",["kdp","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-84d83d4a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mrln","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-85289eec","guard":[["hasAny",["bzai","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-85cdcf67","guard":[["hasAny",["lower case","lowercase","onchw","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-86bf5473","guard":[["hasAny",["capitalise","capitalize","capitalize each word","rbcaa","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-88420259","guard":[["hasAny",["lower case","lowercase","small letters","stak"]]],"pyramid":["render.template",{"lit":["STAK is ",{"slot":0}," Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8945e93d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","srbk","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8a1951be","guard":[["hasAny",["shortest","shortest one","shortest word","smcip"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8a25a8a7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-8c847b94","guard":[["hasAny",["shortest","shortest one","shortest word","thh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8d8d9311","guard":[["hasAny",["no vowels","remove vowels","swkhl","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-8e35a3da","guard":[["hasAny",["lower case","lowercase","mkdw","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-8f1730ac","guard":[["hasAny",["fip","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8fb83e5a","guard":[["hasAny",["shortest","shortest one","shortest word","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-8fec774d","guard":[["hasAny",["no vowels","remove vowels","tnmg","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-91056d16","guard":[["hasAny",["brkrp","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-938ea2cc","guard":[["hasAny",["lpbb","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-96ad092a","guard":[["hasAny",["lower case","lowercase","small letters","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-96d8f658","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ngen","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-98b06cc9","guard":[["has","stak"]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["sense.lastWord"]],"mem":null},
{"id":"n-99c7134b","guard":[["hasAny",["cctg","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-9a34ff2c","guard":[["hasAny",["ctrn","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-9dcc7d3e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","form","title case"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a0b0ef35","guard":[["hasAny",["capitalise","capitalize","capitalize each word","obx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a34e7b56","guard":[["hasAny",["acglo","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a5ad3a0e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pdsb","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a77776a9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","pdyn","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a7a2ed17","guard":[["hasAny",["lower case","lowercase","small letters","srbk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a87f6d55","guard":[["hasAny",["fip","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a8db531c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ffbc","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aad12c6f","guard":[["hasAny",["amlx","lower case","lowercase","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-acf26ac4","guard":[["hasAny",["mrln","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-ad006aee","guard":[["hasAny",["igac","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-adeffeaf","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tecx","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-ae750005","guard":[["hasAny",["capitalise","capitalize","capitalize each word","srzn","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aec399e6","guard":[["hasAny",["aehl","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-b1471487","guard":[["hasAny",["no vowels","remove vowels","swvlw","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b3e625ae","guard":[["hasAny",["jagx","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-b3e9c16f","guard":[["hasAny",["mgyr","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b4c21830","guard":[["hasAny",["no vowels","pkbk","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-b77884b4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mgyr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b787ccfa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gcbc","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b84818aa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b8e6a13b","guard":[["hasAny",["lower case","lowercase","nktr","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-bab1e3b3","guard":[["hasAny",["ffbc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-bcd3afad","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tacow","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bffccf5f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","senea","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c2196c4d","guard":[["hasAny",["igac","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c2b0f9a5","guard":[["hasAny",["lower case","lowercase","small letters","srzn"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c3cab84a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nktr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c597e406","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","weys"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c6aaa1fb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","fip","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c8d9636b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nexr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-c993719e","guard":[["hasAny",["cnxu","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ca731b93","guard":[["hasAny",["brkrp","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-cc8009e2","guard":[["hasAny",["shortest","shortest one","shortest word","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ccc22ccb","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ecpg","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cd880817","guard":[["hasAny",["dlhc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-cdd2cca8","guard":[["hasAny",["lower case","lowercase","qqqx","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cec38866","guard":[["hasAny",["lower case","lowercase","small letters","tcom"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-cec58666","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nodk","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cf105bef","guard":[["hasAny",["arhs","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-cf9f223b","guard":[["hasAny",["no vowels","remove vowels","tcrt","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-d050d43e","guard":[["hasAny",["bpypn","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d192e87e","guard":[["hasAny",["ionr","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d1c35e3a","guard":[["hasAny",["gcbc","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d28a58ec","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ecbk","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d2c2cf0f","guard":[["hasAny",["lower case","lowercase","senea","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d329b36d","guard":[["hasAny",["lower case","lowercase","small letters","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d34fc43c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","mdrr","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d3c14a7e","guard":[["hasAny",["no vowels","remove vowels","srbk","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-d4455332","guard":[["hasAny",["glsi","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d53e6266","guard":[["hasAny",["byfc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-d5efed21","guard":[["hasAny",["lower case","lowercase","rbcaa","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d5fe9980","guard":[["hasAny",["bzai","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d77bfe3b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","vivk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-da9210e9","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gaini","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-db4bf171","guard":[["hasAny",["ftha","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-dbe60ea5","guard":[["hasAny",["bzai","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-dc8b620e","guard":[["hasAny",["no vowels","pdsb","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-dca1d2a0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","tanh","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e15dd34f","guard":[["hasAny",["gcbc","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e1629758","guard":[["hasAny",["kdp","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e25170d6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cxiiu","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e3536756","guard":[["hasAny",["capitalise","capitalize","capitalize each word","glsi","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-e3886204","guard":[["hasAny",["cxiiu","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e5406697","guard":[["hasAny",["lower case","lowercase","small letters","sols"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-e85d04ce","guard":[["hasAny",["shortest","shortest one","shortest word","tacow"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e937fbbe","guard":[["hasAny",["codx","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e9de00e2","guard":[["hasAny",["lower case","lowercase","mdrr","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ea4dcf93","guard":[["hasAny",["bmhl","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ebae9a1a","guard":[["hasAny",["lower case","lowercase","lpbb","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ebf4acf6","guard":[["hasAny",["lower case","lowercase","small letters","stok"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ede9a522","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lpbb","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f02701cb","guard":[["hasAny",["gaini","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f0fac54b","guard":[["hasAny",["lower case","lowercase","oriqu","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f2b16408","guard":[["hasAny",["mdrr","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f56c8b5b","guard":[["hasAny",["jcap","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f5ab6b3e","guard":[["hasAny",["form","lower case","lowercase","small letters"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f64dd2fa","guard":[["hasAny",["no vowels","remove vowels","rfaiu","without vowels"]]],"pyramid":["render.template",{"lit":["RFAIU is ",{"slot":0}," Acquisition Corp II."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f6a0a342","guard":[["hasAny",["byfc","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f79638cc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","thry","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f7f7fd0a","guard":[["hasAny",["alovw","alphabetize the letters","letters in order","sort the letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["transform.sortLetters",["sense.lastWord"]]],"mem":null},
{"id":"n-f9499f2b","guard":[["hasAny",["eosew","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f95bdd05","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kdp","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f9a62323","guard":[["hasAny",["bpac","capitalise","capitalize","capitalize each word","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fa2cbfd4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","til","title case"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fc6d4019","guard":[["hasAny",["acglo","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fc830bf5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","insg","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fce99c48","guard":[["hasAny",["gcbc","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-fd5f490e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","ftha","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fe124d08","guard":[["hasAny",["lower case","lowercase","small letters","thh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-feb1112b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","smcip","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fffc95f2","guard":[["hasAny",["no vowels","qqqx","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-00c958cf","guard":[["hasAny",["each word","split into words","til"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-00f7735e","guard":[["hasAny",["cctg","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-012d650d","guard":[["hasAny",["each word","jagx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-01c486aa","guard":[["hasAny",["ctrn","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-02aa1d9a","guard":[["hasAny",["asth","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-02ff0ce3","guard":[["hasAny",["each word","mgyr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-08ff0137","guard":[["hasAny",["each word","split into words","til"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Instil Bio, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0b51c2d6","guard":[["hasAny",["each word","split into words","srzn"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0ce5e1ba","guard":[["hasAny",["each word","onchw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1136b10b","guard":[["hasAny",["capr","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-138363da","guard":[["hasAny",["each word","jcap","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-147c17f4","guard":[["hasAny",["each word","smcip","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-15e4d183","guard":[["hasAny",["each word","ionr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-162e707d","guard":[["hasAny",["each word","mrln","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-16c74d1f","guard":[["hasAny",["each word","gaini","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-191e2fa0","guard":[["hasAny",["each word","igac","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-19846cf7","guard":[["hasAny",["each word","split into words","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1b23d269","guard":[["hasAny",["each word","eosew","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1b31ca9e","guard":[["hasAny",["each word","lpbb","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1c9878fd","guard":[["hasAny",["each word","split into words","tecx"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1dffb1ee","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gri","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-1fbdd626","guard":[["hasAny",["each word","sornu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-23800ee7","guard":[["hasAny",["amlx","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-23d12ad6","guard":[["hasAny",["each word","iacq","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-247e6191","guard":[["hasAny",["each word","qqqx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-27d05cc4","guard":[["hasAny",["brkrp","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-296c5b90","guard":[["hasAny",["each word","kdp","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2afb0f7a","guard":[["hasAny",["each word","ecpg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2afd298c","guard":[["hasAny",["arhs","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2c023b0b","guard":[["hasAny",["asth","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Astrana Health Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2c178540","guard":[["hasAny",["each word","split into words","tacow"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2e2a9f83","guard":[["hasAny",["each word","ecbk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-313c882e","guard":[["hasAny",["each word","rmti","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33185140","guard":[["hasAny",["each word","kdp","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Keurig Dr Pepper Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-339daf26","guard":[["hasAny",["acglo","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-33a2d693","guard":[["hasAny",["bpypn","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-392fabd5","guard":[["hasAny",["arcl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3a74f61e","guard":[["hasAny",["no vowels","remove vowels","rfaiu","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-3d80a632","guard":[["hasAny",["alovw","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3f275ec0","guard":[["hasAny",["each word","pdsb","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3fe2fdd4","guard":[["hasAny",["each word","nexr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-40506a9e","guard":[["hasAny",["each word","split into words","srbk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4228c430","guard":[["hasAny",["each word","ecpg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Encore Capital Group Inc."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-45b557ce","guard":[["hasAny",["each word","glsi","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-46385913","guard":[["hasAny",["each word","split into words","tcrt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-464d7cca","guard":[["hasAny",["each word","regcp","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-46d47a1e","guard":[["hasAny",["each word","pre","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-471ff820","guard":[["hasAny",["each word","split into words","zbra"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-47b97c78","guard":[["hasAny",["each word","split into words","swkhl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-47e6eadc","guard":[["hasAny",["each word","mrln","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Merlin, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4b4c599a","guard":[["hasAny",["each word","noemw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4c0ccf9d","guard":[["hasAny",["codx","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-500dbc5c","guard":[["hasAny",["each word","form","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-501186fc","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cme","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-50460614","guard":[["hasAny",["each word","insg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5063dd26","guard":[["hasAny",["each word","nexr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nexera Technologies Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-50a21a37","guard":[["hasAny",["each word","oriqu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-50c1d5e8","guard":[["hasAny",["capr","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Capricor Therapeutics, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-52140b8a","guard":[["hasAny",["each word","rbcaa","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-53094476","guard":[["hasAny",["cxiiu","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5353a57f","guard":[["hasAny",["each word","obx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-53c26d13","guard":[["hasAny",["each word","regcp","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Regency Centers Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-54f12b4c","guard":[["hasAny",["each word","split into words","srzn"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Surrozen, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-551af293","guard":[["hasAny",["bpypn","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Brookfield Property Partners L.P.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5739b493","guard":[["hasAny",["cctg","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CCSC Technology International Holdings Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-57ccc4cf","guard":[["hasAny",["each word","split into words","thh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5cba5f24","guard":[["hasAny",["each word","split into words","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5facd552","guard":[["hasAny",["each word","senea","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-609b22ff","guard":[["hasAny",["each word","nktr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-65e08cc3","guard":[["hasAny",["each word","skyaw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-67e6b050","guard":[["hasAny",["bpac","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6842aefc","guard":[["hasAny",["byfc","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6922dda0","guard":[["hasAny",["each word","insg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Inseego Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-693a7069","guard":[["hasAny",["each word","mcft","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6a747ce7","guard":[["hasAny",["each word","split into words","srbk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SR Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6cd3b64a","guard":[["hasAny",["each word","sols","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6d04993f","guard":[["hasAny",["each word","pre","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Prenetics Global Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6d1762e7","guard":[["hasAny",["each word","split into words","wsbco"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is WesBanco, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-745dcfa2","guard":[["hasAny",["lower case","lowercase","small letters","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-75387d8d","guard":[["hasAny",["each word","gcbc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-755fe9d1","guard":[["hasAny",["each word","split into words","tnmg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-798bb4c7","guard":[["hasAny",["each word","split into words","stok"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a099d5f","guard":[["hasAny",["each word","fip","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a9c1ecd","guard":[["hasAny",["each word","split into words","tnmg"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TNL Mediagene."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7d253ec7","guard":[["hasAny",["each word","split into words","swvlw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-81214ed1","guard":[["hasAny",["cme","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-821e683a","guard":[["hasAny",["blzru","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-830a15cc","guard":[["hasAny",["csq","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-835b4b94","guard":[["hasAny",["arcl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ARC Group Acquisition I Corp."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-83957af9","guard":[["hasAny",["each word","ngen","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-84a0e566","guard":[["hasAny",["each word","split into words","weys"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-84baa268","guard":[["hasAny",["each word","split into words","vlosu"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Velos Acquisition I Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-88eb25e3","guard":[["hasAny",["each word","rbcaa","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Republic Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8c64d6fc","guard":[["hasAny",["each word","jcap","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jefferson Capital, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8c8b0064","guard":[["hasAny",["each word","split into words","tcom"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8cc3e642","guard":[["hasAny",["each word","gcbc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greene County Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8ea79dcd","guard":[["hasAny",["each word","smcip","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Super Micro Computer, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-906ab86f","guard":[["hasAny",["each word","mgyr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Magyar Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-917d3d24","guard":[["hasAny",["cxiiu","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Churchill Capital Corp XII."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-92363767","guard":[["hasAny",["each word","senea","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Seneca Foods Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-92ebf1a8","guard":[["hasAny",["bzai","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9723e93c","guard":[["hasAny",["each word","pdyn","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-98e799bf","guard":[["hasAny",["each word","skyaw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SkyAI, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9a29f1dd","guard":[["hasAny",["aehl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9adcb0d5","guard":[["hasAny",["aehl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Antelope Enterprise Holdings Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9b004899","guard":[["hasAny",["each word","split into words","tcrt"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Alaunos Therapeutics, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9bf3764d","guard":[["hasAny",["each word","ffbc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9c2bd32e","guard":[["hasAny",["each word","ecbk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ECB Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9cbc7a7f","guard":[["hasAny",["bmhl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9e5dfbbd","guard":[["hasAny",["each word","mkdw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9edbda62","guard":[["hasAny",["each word","oriqu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Origin Investment Corp I."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a03f218c","guard":[["hasAny",["bwin","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a160adc4","guard":[["hasAny",["each word","pepg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a1a3cf5c","guard":[["hasAny",["cnxu","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a44230a7","guard":[["hasAny",["each word","mdrr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a5966b3a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","stak","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a74cd9a3","guard":[["hasAny",["each word","mkdw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MKDWELL Tech Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a8bc3333","guard":[["hasAny",["each word","split into words","tanh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a9da4c9a","guard":[["hasAny",["each word","split into words","weys"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Weyco Group, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ab899dbb","guard":[["hasAny",["each word","split into words","vivk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac3a6e5c","guard":[["hasAny",["each word","gaini","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Gladstone Investment Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac529711","guard":[["hasAny",["each word","nktr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nektar Therapeutics."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac69a2f4","guard":[["hasAny",["each word","ftha","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ae6e22dd","guard":[["hasAny",["each word","mdrr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Medalist Diversified, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-af84e67a","guard":[["hasAny",["amlx","each word","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-afc4d8a4","guard":[["hasAny",["each word","lpbb","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Launch Two Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b13dc594","guard":[["hasAny",["each word","ffbc","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is First Financial Bancorp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b15db911","guard":[["hasAny",["ctrn","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Citi Trends, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b3d04ea4","guard":[["hasAny",["arhs","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arhaus, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b6278722","guard":[["hasAny",["dlhc","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b64fc400","guard":[["hasAny",["each word","pepg","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PepGen Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-baca20e0","guard":[["hasAny",["each word","ngen","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NervGen Pharma Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bb83a8e5","guard":[["hasAny",["each word","pdyn","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Palladyne AI Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bba39b6b","guard":[["hasAny",["each word","split into words","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bf0e962a","guard":[["hasAny",["each word","split into words","swkhl"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is SWK Holdings Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bf5b4ce7","guard":[["hasAny",["each word","split into words","stok"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Stoke Therapeutics, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c09789ac","guard":[["hasAny",["codx","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Co-Diagnostics, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c83cbf32","guard":[["hasAny",["each word","qqqx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Nuveen NASDAQ 100 Dynamic Overwrite Fund."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c9954906","guard":[["hasAny",["each word","jagx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Jaguar Health, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c9c82040","guard":[["hasAny",["each word","onchw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is 1RT Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c9d2a38e","guard":[["hasAny",["each word","nodk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cc808a2b","guard":[["hasAny",["brkrp","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bruker Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cc97bde0","guard":[["hasAny",["each word","split into words","tanh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tantech Holdings Ltd.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cce0be71","guard":[["hasAny",["each word","split into words","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cd121076","guard":[["hasAny",["bzai","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blaize Holdings, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ce575234","guard":[["hasAny",["each word","split into words","tnonw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tenon Medical, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cea13626","guard":[["hasAny",["each word","ftha","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Forefront Tech Holdings Acquisition Corp."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d12588a9","guard":[["hasAny",["csq","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Calamos Strategic Total Return Fund."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d19bab1f","guard":[["hasAny",["cnxu","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Conexeu Sciences Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d222050a","guard":[["hasAny",["each word","eosew","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Eos Energy Enterprises, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d33107d6","guard":[["hasAny",["each word","iacq","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Irenic Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d5c897e3","guard":[["hasAny",["each word","rmti","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Rockwell Medical, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d6f732b8","guard":[["hasAny",["bmhl","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Bluemount Holdings Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d6fcc04b","guard":[["hasAny",["each word","glsi","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Greenwich LifeSciences, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d9861142","guard":[["hasAny",["byfc","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Broadway Financial Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d9eae59b","guard":[["hasAny",["each word","sornu","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Soren Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-da0a37ad","guard":[["hasAny",["each word","fip","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is FTAI Infrastructure Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-daaa908f","guard":[["hasAny",["form","item number","nth","position"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-dabaf590","guard":[["hasAny",["each word","pkbk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-db17787d","guard":[["hasAny",["each word","split into words","zbra"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Zebra Technologies Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dd9ee778","guard":[["hasAny",["blzru","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trailblazer Acquisition Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ddffdae8","guard":[["hasAny",["each word","noemw","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is CO2 Energy Transition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dede29f6","guard":[["hasAny",["each word","obx","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Obsidian Therapeutics, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dff07609","guard":[["hasAny",["each word","form","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is FormFactor, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e2470474","guard":[["hasAny",["alovw","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e35a6ee6","guard":[["hasAny",["acglo","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Arch Capital Group Ltd.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e3ceff95","guard":[["hasAny",["each word","pdsb","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is PDS Biotechnology Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e4ae3f0c","guard":[["hasAny",["each word","split into words","tcom"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Trip.com Group Limited."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e86fee93","guard":[["hasAny",["each word","igac","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Invest Green Acquisition Corporation."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e9bd20a4","guard":[["hasAny",["dlhc","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is DLH Holdings Corp.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e9e3f046","guard":[["hasAny",["each word","pkbk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Parke Bancorp, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eb459788","guard":[["hasAny",["each word","split into words","thry"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-eec3f5de","guard":[["hasAny",["amlx","each word","split into words"]],["has","company"]],"pyramid":["render.template",{"lit":[{"slot":0}," is Amylyx Pharmaceuticals, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f17e5afc","guard":[["hasAny",["bwin","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is The Baldwin Insurance Group, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f1ef6f41","guard":[["hasAny",["each word","ionr","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ioneer Ltd."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f23232e8","guard":[["hasAny",["each word","nodk","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is NI Holdings, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f3a0ef6a","guard":[["hasAny",["each word","mcft","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is MasterCraft Boat Holdings, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f54b7fd2","guard":[["hasAny",["bpac","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Blueport Acquisition Ltd."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f66c20c2","guard":[["hasAny",["each word","split into words","vivk"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Vivakor, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f84902de","guard":[["hasAny",["each word","split into words","xrxdw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Xerox Holdings Corporation."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f9279d7f","guard":[["hasAny",["gri","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fa0ca4b6","guard":[["hasAny",["each word","split into words","thh"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is TryHard Holdings Limited."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fad306c5","guard":[["hasAny",["each word","sols","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Solstice Advanced Materials Inc.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fc6a5d2d","guard":[["hasAny",["each word","split into words","thry"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Thryv Holdings, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fc82d573","guard":[["hasAny",["each word","split into words","tecx"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Tectonic Therapeutic, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fe95532f","guard":[["hasAny",["each word","split into words","swvlw"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Swvl Holdings Corp."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ffea896f","guard":[["hasAny",["each word","split into words","tacow"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is Berto Acquisition Corp.."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-007d2822","guard":[["hasAny",["capitalise","capitalize","capitalize each word","no vowels","remove vowels","rfaiu","title case","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["transform.title",["sense.lastWord"]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-00d91160","guard":[["hasAny",["lower case","lowercase","small letters","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-097e8fb5","guard":[["hasAny",["cme","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1060b459","guard":[["hasAny",["each word","split into words","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-29168983","guard":[["hasAny",["each word","gri","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-42156ca8","guard":[["hasAny",["cme","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-52edbf41","guard":[["hasAny",["lower case","lowercase","no vowels","remove vowels","rfaiu","small letters","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["transform.lower",["sense.lastWord"]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-774ff83c","guard":[["hasAny",["cme","each word","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ab84ce90","guard":[["hasAny",["each word","gri","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bbf1b9f5","guard":[["hasAny",["capitalise","capitalize","capitalize each word","lower case","lowercase","small letters","stak","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d30b4935","guard":[["hasAny",["capitalise","capitalize","capitalize each word","gri","lower case","lowercase","small letters","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f14ad1a8","guard":[["hasAny",["gri","lower case","lowercase","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["transform.lower",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f1a312ec","guard":[["hasAny",["each word","split into words","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["sense.lastWord"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f719877f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cme","lower case","lowercase","small letters","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["transform.title",["sense.lastWord"]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-1d3243a8","guard":[["hasAny",["each word","lower case","lowercase","small letters","split into words","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5899db30","guard":[["hasAny",["each word","no vowels","remove vowels","rfaiu","split into words","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-a255a0cb","guard":[["hasAny",["each word","gri","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ac52ff01","guard":[["hasAny",["each word","lower case","lowercase","small letters","split into words","stak"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Inc.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-d14d94c7","guard":[["hasAny",["cme","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f3ce6344","guard":[["hasAny",["each word","no vowels","remove vowels","rfaiu","split into words","without vowels"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Acquisition Corp II."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f3dec27a","guard":[["hasAny",["cme","each word","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Group Inc.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-fbde3d3a","guard":[["hasAny",["each word","gri","lower case","lowercase","small letters","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is ",{"slot":1}," Bio, Inc.."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3e5019ef","guard":[["has","company"],["not",["has","me"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDSB":"PDSB is PDS Biotechnology Corporation.","what company is listed as MDRR":"MDRR is Medalist Diversified, Inc..","name the company trading on Nasdaq as IONR":"IONR is ioneer Ltd.","which company has the Nasdaq symbol GRI":"GRI is GRI Bio, Inc..","what company is listed as ECPG":"ECPG is Encore Capital Group Inc.","which company has the Nasdaq symbol BYFC":"BYFC is Broadway Financial Corporation.","which company has the Nasdaq symbol SORNU":"SORNU is Soren Acquisition Corp..","which company has the Nasdaq symbol VIVK":"VIVK is Vivakor, Inc..","what company is listed as CODX":"CODX is Co-Diagnostics, Inc..","name the company trading on Nasdaq as NODK":"NODK is NI Holdings, Inc..","what company is listed as CRDO":"CRDO is Credo Technology Group Holding Ltd.","what company is listed as JAGX":"JAGX is Jaguar Health, Inc..","name the company trading on Nasdaq as DLHC":"DLHC is DLH Holdings Corp..","which company has the Nasdaq symbol TNMG":"TNMG is TNL Mediagene.","which company has the Nasdaq symbol ECBK":"ECBK is ECB Bancorp, Inc..","which company has the Nasdaq symbol CME":"CME is CME Group Inc..","which company has the Nasdaq symbol INSG":"INSG is Inseego Corp..","which company has the Nasdaq symbol TECX":"TECX is Tectonic Therapeutic, Inc..","which company has the Nasdaq symbol RFAIU":"RFAIU is RF Acquisition Corp II.","which company has the Nasdaq symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc..","name the company trading on Nasdaq as SRZN":"SRZN is Surrozen, Inc..","name the company trading on Nasdaq as FIP":"FIP is FTAI Infrastructure Inc..","what company is listed as MRLN":"MRLN is Merlin, Inc..","name the company trading on Nasdaq as THH":"THH is TryHard Holdings Limited.","name the company trading on Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited.","what company is listed as GLSI":"GLSI is Greenwich LifeSciences, Inc..","what company is listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund.","what company is listed as BZAI":"BZAI is Blaize Holdings, Inc..","what company is listed as FORM":"FORM is FormFactor, Inc..","which company has the Nasdaq symbol PTACW":"PTACW is Patriot Acquisition Corp..","name the company trading on Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation.","which company has the Nasdaq symbol NEXR":"NEXR is Nexera Technologies Ltd.","what company is listed as NOEMW":"NOEMW is CO2 Energy Transition Corp..","name the company trading on Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited.","which company has the Nasdaq symbol SKYAW":"SKYAW is SkyAI, Inc..","what company is listed as GAINI":"GAINI is Gladstone Investment Corporation.","name the company trading on Nasdaq as THRY":"THRY is Thryv Holdings, Inc..","which company has the Nasdaq symbol WEYS":"WEYS is Weyco Group, Inc..","name the company trading on Nasdaq as NGEN":"NGEN is NervGen Pharma Corp..","name the company trading on Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd.","what company is listed as ACGLO":"ACGLO is Arch Capital Group Ltd..","name the company trading on Nasdaq as WING":"WING is Wingstop Inc..","name the company trading on Nasdaq as FFBC":"FFBC is First Financial Bancorp..","name the company trading on Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc..","which company has the Nasdaq symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc..","what company is listed as RMTI":"RMTI is Rockwell Medical, Inc..","name the company trading on Nasdaq as SRBK":"SRBK is SR Bancorp, Inc..","what company is listed as KDP":"KDP is Keurig Dr Pepper Inc..","which company has the Nasdaq symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc..","which company has the Nasdaq symbol OBX":"OBX is Obsidian Therapeutics, Inc..","what company is listed as TNONW":"TNONW is Tenon Medical, Inc..","which company has the Nasdaq symbol CSQ":"CSQ is Calamos Strategic Total Return Fund.","what company is listed as LPBB":"LPBB is Launch Two Acquisition Corp..","what company is listed as GCBC":"GCBC is Greene County Bancorp, Inc..","name the company trading on Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp.","what company is listed as PRE":"PRE is Prenetics Global Limited.","which company has the Nasdaq symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp.","name the company trading on Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc..","what company is listed as PKBK":"PKBK is Parke Bancorp, Inc..","name the company trading on Nasdaq as TANH":"TANH is Tantech Holdings Ltd..","name the company trading on Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp..","what company is listed as IGAC":"IGAC is Invest Green Acquisition Corporation.","name the company trading on Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc..","which company has the Nasdaq symbol ARCL":"ARCL is ARC Group Acquisition I Corp.","which company has the Nasdaq symbol REGCP":"REGCP is Regency Centers Corporation.","what company is listed as ARHS":"ARHS is Arhaus, Inc..","what company is listed as NKTR":"NKTR is Nektar Therapeutics.","name the company trading on Nasdaq as PLUS":"PLUS is ePlus inc..","which company has the Nasdaq symbol MKDW":"MKDW is MKDWELL Tech Inc..","name the company trading on Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII.","name the company trading on Nasdaq as SENEA":"SENEA is Seneca Foods Corp..","which company has the Nasdaq symbol SOLS":"SOLS is Solstice Advanced Materials Inc..","which company has the Nasdaq symbol TCOM":"TCOM is Trip.com Group Limited.","name the company trading on Nasdaq as STAK":"STAK is STAK Inc..","what company is listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc..","name the company trading on Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp..","name the company trading on Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc..","what company is listed as VLOSU":"VLOSU is Velos Acquisition I Corp..","which company has the Nasdaq symbol TIL":"TIL is Instil Bio, Inc..","which company has the Nasdaq symbol RBCAA":"RBCAA is Republic Bancorp, Inc..","name the company trading on Nasdaq as BRKRP":"BRKRP is Bruker Corporation.","which company has the Nasdaq symbol EZRA":"EZRA is Reliance Global Group, Inc..","which company has the Nasdaq symbol ZBRA":"ZBRA is Zebra Technologies Corporation.","name the company trading on Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I.","what company is listed as CAPR":"CAPR is Capricor Therapeutics, Inc..","what company is listed as PEPG":"PEPG is PepGen Inc..","name the company trading on Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp..","which company has the Nasdaq symbol CCTG":"CCTG is CCSC Technology International Holdings Limited.","name the company trading on Nasdaq as ASTH":"ASTH is Astrana Health Inc..","what company is listed as SMCIP":"SMCIP is Super Micro Computer, Inc..","what company is listed as CNXU":"CNXU is Conexeu Sciences Inc..","name the company trading on Nasdaq as CTRN":"CTRN is Citi Trends, Inc..","which company has the Nasdaq symbol SWKHL":"SWKHL is SWK Holdings Corporation.","what company is listed as TACOW":"TACOW is Berto Acquisition Corp..","which company has the Nasdaq symbol PDYN":"PDYN is Palladyne AI Corp..","what company is listed as WSBCO":"WSBCO is WesBanco, Inc..","what company is listed as BPYPN":"BPYPN is Brookfield Property Partners L.P..","name the company trading on Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc..","which company has the Nasdaq symbol PTAC":"PTAC is Patriot Acquisition Corp..","what company is listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-007ad9ce","guard":[["has","nktr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as NKTR":"NKTR is Nektar Therapeutics."}}},
{"id":"n-00bb6646","guard":[["has","dlhc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as DLHC":"DLHC is DLH Holdings Corp.."}}},
{"id":"n-02f313cb","guard":[["has","ptacw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PTACW":"PTACW is Patriot Acquisition Corp.."}}},
{"id":"n-053517ec","guard":[["has","mgyr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as MGYR":"MGYR is Magyar Bancorp, Inc.."}}},
{"id":"n-055690f9","guard":[["has","blzru"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BLZRU":"BLZRU is Trailblazer Acquisition Corp.."}}},
{"id":"n-0671eabf","guard":[["has","codx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as CODX":"CODX is Co-Diagnostics, Inc.."}}},
{"id":"n-06eebca0","guard":[["has","thh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as THH":"THH is TryHard Holdings Limited."}}},
{"id":"n-08e672e0","guard":[["has","senea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SENEA":"SENEA is Seneca Foods Corp.."}}},
{"id":"n-099e1ac5","guard":[["has","gaini"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as GAINI":"GAINI is Gladstone Investment Corporation."}}},
{"id":"n-0a5de349","guard":[["has","pdyn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDYN":"PDYN is Palladyne AI Corp.."}}},
{"id":"n-0ad514f3","guard":[["has","til"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TIL":"TIL is Instil Bio, Inc.."}}},
{"id":"n-0b915f28","guard":[["has","jagx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as JAGX":"JAGX is Jaguar Health, Inc.."}}},
{"id":"n-100c2fb3","guard":[["has","qqqx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as QQQX":"QQQX is Nuveen NASDAQ 100 Dynamic Overwrite Fund."}}},
{"id":"n-18a74422","guard":[["has","aehl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as AEHL":"AEHL is Antelope Enterprise Holdings Limited."}}},
{"id":"n-1941098c","guard":[["has","cctg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CCTG":"CCTG is CCSC Technology International Holdings Limited."}}},
{"id":"n-1a6a1e76","guard":[["has","nodk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as NODK":"NODK is NI Holdings, Inc.."}}},
{"id":"n-1fa6bcb7","guard":[["has","obx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol OBX":"OBX is Obsidian Therapeutics, Inc.."}}},
{"id":"n-23135f11","guard":[["has","skyaw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SKYAW":"SKYAW is SkyAI, Inc.."}}},
{"id":"n-24ee459a","guard":[["has","vivk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol VIVK":"VIVK is Vivakor, Inc.."}}},
{"id":"n-2cc94997","guard":[["has","oriqu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ORIQU":"ORIQU is Origin Investment Corp I."}}},
{"id":"n-2d46d70f","guard":[["has","bmhl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BMHL":"BMHL is Bluemount Holdings Limited."}}},
{"id":"n-2dd19833","guard":[["has","stak"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as STAK":"STAK is STAK Inc.."}}},
{"id":"n-2e2f377c","guard":[["has","plus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as PLUS":"PLUS is ePlus inc.."}}},
{"id":"n-2ec087c7","guard":[["has","regcp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol REGCP":"REGCP is Regency Centers Corporation."}}},
{"id":"n-2ed9549e","guard":[["has","mdrr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as MDRR":"MDRR is Medalist Diversified, Inc.."}}},
{"id":"n-2efa0f73","guard":[["has","swkhl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SWKHL":"SWKHL is SWK Holdings Corporation."}}},
{"id":"n-305277aa","guard":[["has","crdo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as CRDO":"CRDO is Credo Technology Group Holding Ltd."}}},
{"id":"n-30ef866d","guard":[["has","ctrn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as CTRN":"CTRN is Citi Trends, Inc.."}}},
{"id":"n-32b32cf0","guard":[["has","brkrp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BRKRP":"BRKRP is Bruker Corporation."}}},
{"id":"n-3f5b5ed9","guard":[["has","byfc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol BYFC":"BYFC is Broadway Financial Corporation."}}},
{"id":"n-40ce9956","guard":[["has","pre"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as PRE":"PRE is Prenetics Global Limited."}}},
{"id":"n-43a7c908","guard":[["has","ffbc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as FFBC":"FFBC is First Financial Bancorp.."}}},
{"id":"n-4a1e766d","guard":[["has","wing"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as WING":"WING is Wingstop Inc.."}}},
{"id":"n-4bd62ee6","guard":[["has","asth"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ASTH":"ASTH is Astrana Health Inc.."}}},
{"id":"n-4c042929","guard":[["has","eosew"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol EOSEW":"EOSEW is Eos Energy Enterprises, Inc.."}}},
{"id":"n-4eb8c151","guard":[["has","xrxdw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as XRXDW":"XRXDW is Xerox Holdings Corporation."}}},
{"id":"n-50cb255a","guard":[["has","bpypn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as BPYPN":"BPYPN is Brookfield Property Partners L.P.."}}},
{"id":"n-552cd744","guard":[["has","kdp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as KDP":"KDP is Keurig Dr Pepper Inc.."}}},
{"id":"n-55f4a695","guard":[["has","tcrt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as TCRT":"TCRT is Alaunos Therapeutics, Inc.."}}},
{"id":"n-5ab475d5","guard":[["has","stok"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as STOK":"STOK is Stoke Therapeutics, Inc.."}}},
{"id":"n-5acd6ec0","guard":[["has","tecx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TECX":"TECX is Tectonic Therapeutic, Inc.."}}},
{"id":"n-5c032303","guard":[["has","cme"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CME":"CME is CME Group Inc.."}}},
{"id":"n-613d11a5","guard":[["has","glsi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as GLSI":"GLSI is Greenwich LifeSciences, Inc.."}}},
{"id":"n-63791b4a","guard":[["has","ecbk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ECBK":"ECBK is ECB Bancorp, Inc.."}}},
{"id":"n-63af73e5","guard":[["has","csq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol CSQ":"CSQ is Calamos Strategic Total Return Fund."}}},
{"id":"n-65afde58","guard":[["has","wsbco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as WSBCO":"WSBCO is WesBanco, Inc.."}}},
{"id":"n-6b89cd32","guard":[["has","pepg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as PEPG":"PEPG is PepGen Inc.."}}},
{"id":"n-6cb0f8ef","guard":[["has","bpac"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as BPAC":"BPAC is Blueport Acquisition Ltd."}}},
{"id":"n-6d36927b","guard":[["has","igac"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as IGAC":"IGAC is Invest Green Acquisition Corporation."}}},
{"id":"n-6e35c64a","guard":[["has","pdsb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PDSB":"PDSB is PDS Biotechnology Corporation."}}},
{"id":"n-742a046a","guard":[["has","swvlw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SWVLW":"SWVLW is Swvl Holdings Corp."}}},
{"id":"n-7475ddf8","guard":[["has","form"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as FORM":"FORM is FormFactor, Inc.."}}},
{"id":"n-7c31d32b","guard":[["has","cnxu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as CNXU":"CNXU is Conexeu Sciences Inc.."}}},
{"id":"n-8030ec52","guard":[["has","sornu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SORNU":"SORNU is Soren Acquisition Corp.."}}},
{"id":"n-811bfa49","guard":[["has","ezra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol EZRA":"EZRA is Reliance Global Group, Inc.."}}},
{"id":"n-82f9b073","guard":[["has","iacq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as IACQ":"IACQ is Irenic Acquisition Corp.."}}},
{"id":"n-8b0adc8d","guard":[["has","bwin"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol BWIN":"BWIN is The Baldwin Insurance Group, Inc.."}}},
{"id":"n-8b5d0ddb","guard":[["has","gri"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol GRI":"GRI is GRI Bio, Inc.."}}},
{"id":"n-8f9eaddf","guard":[["has","tcom"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TCOM":"TCOM is Trip.com Group Limited."}}},
{"id":"n-910d8135","guard":[["has","rfaiu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol RFAIU":"RFAIU is RF Acquisition Corp II."}}},
{"id":"n-92a71fee","guard":[["has","weys"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol WEYS":"WEYS is Weyco Group, Inc.."}}},
{"id":"n-92e8208e","guard":[["has","mkdw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol MKDW":"MKDW is MKDWELL Tech Inc.."}}},
{"id":"n-934e82ee","guard":[["has","tnonw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as TNONW":"TNONW is Tenon Medical, Inc.."}}},
{"id":"n-94e634ac","guard":[["has","pkbk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as PKBK":"PKBK is Parke Bancorp, Inc.."}}},
{"id":"n-958afc3e","guard":[["has","acglo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as ACGLO":"ACGLO is Arch Capital Group Ltd.."}}},
{"id":"n-963e4f40","guard":[["has","alovw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as ALOVW":"ALOVW is Aldabra 4 Liquidity Opportunity Vehicle, Inc.."}}},
{"id":"n-96400cec","guard":[["has","vlosu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as VLOSU":"VLOSU is Velos Acquisition I Corp.."}}},
{"id":"n-9950c33f","guard":[["has","insg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol INSG":"INSG is Inseego Corp.."}}},
{"id":"n-9bacde7f","guard":[["has","noemw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as NOEMW":"NOEMW is CO2 Energy Transition Corp.."}}},
{"id":"n-9c74d654","guard":[["has","jcap"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as JCAP":"JCAP is Jefferson Capital, Inc.."}}},
{"id":"n-9f08efb2","guard":[["has","rmti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as RMTI":"RMTI is Rockwell Medical, Inc.."}}},
{"id":"n-a340d81b","guard":[["has","capr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as CAPR":"CAPR is Capricor Therapeutics, Inc.."}}},
{"id":"n-a5643579","guard":[["has","nexr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol NEXR":"NEXR is Nexera Technologies Ltd."}}},
{"id":"n-a6e2370f","guard":[["has","rbcaa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol RBCAA":"RBCAA is Republic Bancorp, Inc.."}}},
{"id":"n-a77a5b48","guard":[["has","amlx"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol AMLX":"AMLX is Amylyx Pharmaceuticals, Inc.."}}},
{"id":"n-adfc712f","guard":[["has","tnmg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol TNMG":"TNMG is TNL Mediagene."}}},
{"id":"n-ae9fc13e","guard":[["has","lpbb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as LPBB":"LPBB is Launch Two Acquisition Corp.."}}},
{"id":"n-aee07258","guard":[["has","ftha"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol FTHA":"FTHA is Forefront Tech Holdings Acquisition Corp."}}},
{"id":"n-af37370f","guard":[["has","srzn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SRZN":"SRZN is Surrozen, Inc.."}}},
{"id":"n-b00c27af","guard":[["has","thry"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as THRY":"THRY is Thryv Holdings, Inc.."}}},
{"id":"n-ba95b998","guard":[["has","arcl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ARCL":"ARCL is ARC Group Acquisition I Corp."}}},
{"id":"n-c1e0c386","guard":[["has","arhs"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as ARHS":"ARHS is Arhaus, Inc.."}}},
{"id":"n-c60ab7fb","guard":[["has","bzai"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as BZAI":"BZAI is Blaize Holdings, Inc.."}}},
{"id":"n-cfb5175e","guard":[["has","ngen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as NGEN":"NGEN is NervGen Pharma Corp.."}}},
{"id":"n-d1fba728","guard":[["has","onchw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as ONCHW":"ONCHW is 1RT Acquisition Corp.."}}},
{"id":"n-d3fe1d0a","guard":[["has","gcbc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as GCBC":"GCBC is Greene County Bancorp, Inc.."}}},
{"id":"n-d4a19400","guard":[["has","jkhy"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as JKHY":"JKHY is Jack Henry & Associates, Inc.."}}},
{"id":"n-d546e477","guard":[["has","ptac"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol PTAC":"PTAC is Patriot Acquisition Corp.."}}},
{"id":"n-d9cd6652","guard":[["has","sols"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol SOLS":"SOLS is Solstice Advanced Materials Inc.."}}},
{"id":"n-da351619","guard":[["has","fip"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as FIP":"FIP is FTAI Infrastructure Inc.."}}},
{"id":"n-e162539f","guard":[["has","tanh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as TANH":"TANH is Tantech Holdings Ltd.."}}},
{"id":"n-e1fc62f4","guard":[["has","ionr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as IONR":"IONR is ioneer Ltd."}}},
{"id":"n-e56fba2f","guard":[["has","cxiiu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as CXIIU":"CXIIU is Churchill Capital Corp XII."}}},
{"id":"n-e5f427ee","guard":[["has","ecpg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as ECPG":"ECPG is Encore Capital Group Inc."}}},
{"id":"n-ed93dd74","guard":[["has","mcft"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as MCFT":"MCFT is MasterCraft Boat Holdings, Inc.."}}},
{"id":"n-f048c171","guard":[["has","zbra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which company has the Nasdaq symbol ZBRA":"ZBRA is Zebra Technologies Corporation."}}},
{"id":"n-f80fb27e","guard":[["has","srbk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the company trading on Nasdaq as SRBK":"SRBK is SR Bancorp, Inc.."}}},
{"id":"n-f939c5ca","guard":[["has","mrln"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as MRLN":"MRLN is Merlin, Inc.."}}},
{"id":"n-f98e6dc3","guard":[["has","tacow"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as TACOW":"TACOW is Berto Acquisition Corp.."}}},
{"id":"n-f9c1dc22","guard":[["has","smcip"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what company is listed as SMCIP":"SMCIP is Super Micro Computer, Inc.."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which company has the Nasdaq symbol PDSB","expect":{"contains":["PDS Biotechnology Corporation"],"notRefusal":true}},{"q":"what company is listed as MDRR","expect":{"contains":["Medalist Diversified, Inc."],"notRefusal":true}},{"q":"name the company trading on Nasdaq as IONR","expect":{"contains":["ioneer Ltd"],"notRefusal":true}},{"q":"which company has the Nasdaq symbol GRI","expect":{"contains":["GRI Bio, Inc."],"notRefusal":true}},{"q":"what company is listed as ECPG","expect":{"contains":["Encore Capital Group Inc"],"notRefusal":true}},{"q":"which company has the Nasdaq symbol BYFC","expect":{"contains":["Broadway Financial Corporation"],"notRefusal":true}},{"q":"which company has the Nasdaq symbol SORNU","expect":{"contains":["Soren Acquisition Corp."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol VIVK","expect":{"contains":["Vivakor, Inc."],"notRefusal":true}},{"q":"what company is listed as CODX","expect":{"contains":["Co-Diagnostics, Inc."],"notRefusal":true}},{"q":"name the company trading on Nasdaq as NODK","expect":{"contains":["NI Holdings, Inc."],"notRefusal":true}},{"q":"what company is listed as CRDO","expect":{"contains":["Credo Technology Group Holding Ltd"],"notRefusal":true}},{"q":"what company is listed as JAGX","expect":{"contains":["Jaguar Health, Inc."],"notRefusal":true}},{"q":"name the company trading on Nasdaq as DLHC","expect":{"contains":["DLH Holdings Corp."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol TNMG","expect":{"contains":["TNL Mediagene"],"notRefusal":true}},{"q":"which company has the Nasdaq symbol ECBK","expect":{"contains":["ECB Bancorp, Inc."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol CME","expect":{"contains":["CME Group Inc."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol INSG","expect":{"contains":["Inseego Corp."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol TECX","expect":{"contains":["Tectonic Therapeutic, Inc."],"notRefusal":true}},{"q":"which company has the Nasdaq symbol RFAIU","expect":{"contains":["RF Acquisition Corp II"],"notRefusal":true}},{"q":"which company has the Nasdaq symbol BWIN","expect":{"contains":["The Baldwin Insurance Group, Inc."],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
