// project-name-of-turbine-i-3da7-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"project-name-of-turbine-i-3da7-neo-g10","class":"project-name-of-turbine-i-3da7","generation":10,"lane":"neo","grownFrom":["tell me the project name of the turbine identifier CCE52","what is the project name of GPW47","give the project name for SKW68","tell me the project name of the turbine identifier MCM4","what is the project name of COM22","give the project name for UWF82","tell me the project name of the turbine identifier HIW19","what is the project name of SMH28","tell me the project name of the turbine identifier HIW34","tell me the project name of the turbine identifier DHU24","what is the project name of GOS34","what is the project name of CCF2","what is the project name of MNE53","tell me the project name of the turbine identifier MSM26","what is the project name of NIA51","tell me the project name of the turbine identifier LAA12","what is the project name of CTE66","what is the project name of DUF47","tell me the project name of the turbine identifier EUW50","what is the project name of RIP34"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-wind-turbine-fb3aeb","columns":["turbine identifier","project name"],"n":6698,"cols":[{"f":"0OWE1|0CRW1|0WWT1|32|33|34|0CON1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|0LWF1|0MBL1|0SWF1|32|33|34|35|0WWT5|0SVW1|0WWT6|0MBL2|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|1AF1|2G1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|0OWE2|0SVW2|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|0CHC1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|0SOD1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|0OMR1|32|0BLT1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|0AWF1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|0GPW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|0SVW40|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|0TWF1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|0WIH1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|0CRR1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|0HAL1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|0BRW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|1SW1|32|33|0OMR3|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|0BCW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|0CRW2|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|0KEH1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|0BEA1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|0GMT1|0DOK1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|0QUA1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|0CSC1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|0MEI1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|0PSK1|32|33|34|35|0SHS1|32|33|34|35|0MOL1|32|33|34|0SJH1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|0LEO1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|0KHW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|0CWP1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|0KHW33|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|0LWP1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|0CAP1|0KHW51|42|47|48|49|0RAM1|32|33|34|35|36|0STL1|32|33|34|35|36|37|38|39|0FEW1|32|33|34|35|36|37|38|39|0RWD1|32|33|0DIM1|32|33|34|0LIB1|0BRD1|0GBD1|32|1WO1|0SPG1|0DBL1|0FZM1|32|0HIG1|32|33|0LIN1|32|33|34|35|36|37|0MVL1|0POT1|0SPG2|0TIR1|0DAL1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|1IG1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|0MAR1|32|33|34|0NUT1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|0POT2|33|34|35|36|37|38|39|310|41|42|0DHU1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|0SPI1|0WAW1|0AMW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|0FAI1|32|0LIN8|0CRE1|0IRM1|0PKM1|0STR1|1CM1|1PI2|0CHE1|32|33|34|35|0GAE1|0KAI1|0LRH1|0MIB1|32|33|1UG1|0TRU1|32|0WHY1|32|0AUL1|32|0BAR1|32|2T1|32|2N1|1PO1|0CHP1|0ELL1|32|33|34|0FTZ1|0GFD1|32|0HBO1|32|0ISL1|0KEM1|32|33|0LIM1|32|33|0MAT1|32|33|0NGM1|32|33|34|1MR1|32|1BB1|32|33|34|0POA1|0SLE1|32|33|34|35|36|1OC1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|0WGP1|0AMC1|32|1DL1|0BDK1|1RN1|0HLC1|32|33|0KET1|32|33|0POR1|32|0WAN1|0CHT1|32|33|0ELL5|36|37|38|39|310|0GAM1|32|33|0LVR1|32|0PUL1|0NVW1|0PUB1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|0TIV1|0OPG1|0PAL1|0HUR1|32|33|34|35|0EPT1|1RS1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|0KIN1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|0PWE1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|0RFG1|0PRB1|32|0RIP1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|0CCF1|32|33|34|35|36|1RU1|32|33|34|35|1UL1|32|33|34|35|36|0FRO1|32|33|34|35|36|0MOH1|32|33|34|35|36|0PAM1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|0RWF1|32|33|34|35|36|0THM1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|0PRO1|32|33|34|0THM16|47|48|49|320|0UWF1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|0WOL1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|0ART1|32|33|34|35|0GOF1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|0THM21|42|43|44|45|0HAR1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|0THM26|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|1AL1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|0ZUR1|0CHA1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|1OM1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|0GRE1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|0KBW1|32|33|34|35|36|37|38|0PAR1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|0RWE1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|0CGO1|32|33|34|35|36|37|38|39|310|0GVA1|32|33|34|35|36|37|38|39|0MER1|32|0PLA1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|0WAF1|32|33|34|0CAW1|0ELS1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|1UW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|0GES1|32|33|34|35|0PDN1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|0SMH1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|0AWE1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|0BLU1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|1OR1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|0DUF1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|0GRW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|0HAF1|32|33|34|35|0JER1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|0MCM1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|0OXL1|32|33|0SKY1|32|33|34|35|1BW1|32|33|34|35|36|37|38|39|310|1KW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|1PR1|32|33|34|0WAI1|32|33|34|35|0AMW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|0BOL1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|0CED1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|0EDU1|32|33|34|35|36|37|38|39|310|41|42|43|44|1RN1|32|33|34|35|0GOS1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|1WF1|32|33|34|35|36|37|38|39|310|41|1VA10|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|0KII1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|0NAP1|32|0QUI1|0SCO1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|1AW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|0WHT1|32|33|0GAR1|32|33|34|35|36|37|38|39|1BW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|1HC1|32|33|34|35|36|37|38|39|0ZEP1|32|33|34|35|0GUN1|32|33|34|35|36|37|38|39|310|0NIA1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|0RYE1|32|33|34|0SNO1|32|33|34|35|0BEL1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|0MWP1|0SET1|32|33|34|1AC1|32|33|34|35|0AIW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|0NRK1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|0HIW1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|0FER1|32|33|0MEL1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|0NCW1|32|33|34|35|36|37|38|0AEW1|0NCW9|310|41|42|43|44|45|46|0EKW1|32|33|34|35|36|37|38|39|310|0NOR1|32|33|0WCW1|32|33|34|35|36|37|38|39|310|41|0SUM1|32|33|34|0WCW12|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|1RD1|32|33|34|35|0HCS1|32|33|34|35|36|37|38|39|310|0CCE1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|0MNE1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|1MR1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|0BDS1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|0AAV1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|0CAR1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|0SUL1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|1NC1|32|0MLO1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|1SH1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|0LPL1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|0MGE1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|0SRB1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|0ERA1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|0DMO1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|0LAA1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|0MDS1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|0NRI1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|0VDE1|32|33|34|35|36|37|38|39|310|41|42|0DMO60|41|42|43|44|45|46|47|48|0LGR1|32|33|34|35|36|37|38|39|310|41|42|1MT1|32|33|34|35|36|37|38|39|310|41|42|1PL61|42|43|44|45|46|47|48|49|0RAG1|0SAD1|32|33|34|35|36|37|38|39|310|0VDK1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|0CBD1|32|33|34|35|36|37|38|39|310|0FRM1|32|33|34|35|36|37|38|39|310|41|42|0MRY1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|0SPH1|32|33|34|35|36|37|38|0MGU1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|0PDS1|32|33|34|35|36|37|38|39|310|41|42|0RON1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|0MSM1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|0NRU1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|0RAG2|0MCR1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|0GRM1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|0SDB1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|0RDM1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|44|45|46|47|48|49|390|41|42|43|44|45|46|47|48|49|3100|51|52|53|54|55|56|57|58|59|410|51|52|53|54|55|56|57|58|59|420|51|52|53|54|55|56|57|58|59|430|51|52|53|54|55|56|57|58|59|440|51|52|53|54|55|56|57|58|59|450|51|52|53|54|55|56|57|58|59|460|51|52|53|54|55|56|57|58|59|470|51|52|53|54|55|0TTA1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|0SBR1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|0CTE1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|47|48|49|320|41|42|43|44|45|46|47|48|49|330|41|42|43|44|45|46|47|48|49|340|41|42|43|44|45|46|47|48|49|350|41|42|43|44|45|46|47|48|49|360|41|42|43|44|45|46|47|48|49|370|41|42|43|44|45|46|47|48|49|380|41|42|43|0RLY1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|0COW1|0MRS1|32|33|34|35|36|37|38|39|310|0WLY1|32|33|34|35|36|37|38|39|310|0CYP1|32|33|34|35|36|37|38|39|310|41|42|43|44|45|46|0HAH1|32","sep":"|"},{"d":"Optimist Wind Energy|Castle River Wind Farm|Waterton Wind Turbines|Cowley North|Lundbreck Wind Farm|McBride Lake|Sinnott Wind Farm|Summerview|Macleod Flats|Magrath|Chin Chute|Soderglen|Oldman River|Blue Trail|Ardenville Wind Farm|Ghost Pine Wind Farm|Taber Wind Farm|Wintering Hills|Castle Rock Ridge|Halkirk Wind|Blackspring Ridge Wind|Box Springs Wind Project|Bull Creek Wind Farm|Kettles Hill|Bear Mountain|Grouse Mountain|Dokie Ridge Wind Farm|Quality Wind|Cape Scott|Meikle|Pennask|Shinish|Moose Lake|St. Joseph|St. Leon|Kent Hills 1|Caribou Wind Park|Kent Hills 2|Lamèque Wind Power Project|Cap-Pelé|Kent Hills 3|Ramea|NA|St. Lawrence|Fermeuse|Ramea Wind Diesel|Diavik Mine Wind Farm|Little Brook|Brookfield|Glace Bay & Donkin|Goodwood|Springhill|Digby Limited|Fitzpatrick Mountain|Higgins Mountain|Lingan|Marshville Limited|Point Tupper|Tiverton Riverhurst|Dalhousie Mountain|Digby Neck|Maryvale|Nuttby|Glen Dhu|Spiddle Hill|Watts Wind|Amherst I Wind Farm|Fairmont|Creignishrear|Irish Mountain|Parker Mountain|Saint Rose|South Cape Mabou|Chebucto Pockwock|Gaetz Brook|Kaizer Meadow|Little River Harbour|Millbrook|Mulgrave|Truro Heights|Whynotts|Auld's Mountain|Barrachois|Barrington|Bateston|Black Pond|Cheticamp|Ellershouse|Fitzpatrick|Greenfield|Hillside Boularderie|Isle Madame|Kemptown|Limerock|Martock Ridge|New Glasgow (Maclellan's Brook)|Nine Mile River|North Beaver Bank Community Wind|Point Aconi|Sable|South Canoe|Wedgeport|Amherst Community Wind|Avondale|Baddeck|Brenton|Hardwood Lands Community Winds|Ketch Harbour|Porters lake|Walton|Chebucto Terence Bay|Gardiner Mines (Cape Breton University)|Liverpool|Pictou Landing|New Victoria Wind Turbine|Pubnico Point|Tiverton|OPG 7 Gomberg|Port Albert|Huron Wind|Exhibition Place Turbine|Erie Shores|Kingsbridge I Wind Power|Prince Wind Energy Project|Rosa Flora Greenhouses|Providence Bay|Ripley|Clear Creek|Cruickshank|Cultus|Frogmore|Mohawk|Port Alma|Ravenswood Wind Farm|Bisnett Line (Thames River I)|Front Line (Thames River I)|Marsh Line (Thames River I)|Proof Line|Swanton Line (Thames River I)|Underwood Wind Farm|Wolfe Island|Arthur|Gosfield|Gracey (Thames River II)|Harrow|Naylor (Thames River II)|North Malden (Thames River II)|Richardson (Thames River II)|South Side (Thames River II)|Talbot|Zurich|Chatham|Comber Wind Farm|Greenwich Renewable Energy Project|Kent Breeze Wind Farm|Pointes Aux Roches|Raleigh Wind Energy Centre|Conestogo|Grand Valley|Mother Earth Renewable Energy|Plateau|Watford Wind Farm|CAW Wind Turbine|East Lake St. Clair Wind|Erieau Wind|Gesner|Port Dover and Nanticoke|Summerhaven|Adelaide Wind Energy Centre|Bluewater Wind Farm|Bornish Wind Energy Centre|Dufferin Wind|Grand Renewable Wind|HAF Energy|Jericho|Mclean's Mountain|Oxley Wind Farm|Skyway 8|South Branch Wind Farm|South Kent Wind Farm|Springwood|Wainfleet|Armow Wind Project|Bow Lake Wind Project|Cedar Point|East Durham|Ernestown|Goshen Wind Energy|Goulais Wind Farm|K2 Wind Power Facility|Napier|Quixote One Wind Energy|St. Columban|Suncor Adelaide Wind Energy|Whittington|Ganaraska|Grand Bend Wind Farm|Grey Highlands Clean Energy|Grey Highlands Zero Emissions People|Gunn's Hill|Niagara Region|Port Ryerse|Snowy Ridge|Belle River|Moorefield Wind Project|Settlers Landing|Sumac Ridge|Amherst Island Wind Project|North Kent Wind Farm|Henvey Inlet Wind Farm|Ferndale|Melancthon|North Cape Wind Farm Phase 1|Aeolus Wind Farm|North Cape Wind Farm Phase 2|East Point Eastern Kings Wind|Norway Wind Park|West Cape Wind Farm|Summerside Project|WEICan R&D Park|Hermanville Clear Spring Wind Development|Le Nordais (Cap-Chat)|Le Nordais (Matane)|Mont Miller|Baie-des-Sables|L'Anse-à-Valleau|Carleton|Jardin d'Éole (Saint-Ulric Saint-Léandre)|SNEEC|Mont Louis|Montagne-Sèche|Le Plateau I|Montérégie|Saint-Robert-Bellarmin|De l'Érable|Des Moulins I|Lac Alfred|Massif du Sud|New Richmond|Viger-Denonville|Des Moulins II|Le Granit|La Mitis|Le Plateau II|Raglan Mine|Saint-Damase|Vents du Kempt|Côte-de-Beaupré|Frampton|Mont-Rothery|Saint-Philémon|Mesgi'g Ugju's'n|Pierre-De Saurel|Roncevaux|Mont Sainte-Marguerite|Nicolas-Riou|Mont Copper|Gros-Morne|Seigneurie de Beaupré|Rivière-du-Moulin|Témiscouata|Sunbridge|Centennial|Red Lily|Cowessess|Morse|Western Lily|Cypress|Haeckel Hill","r":"0*1,1*1,2*4,3*f,4*1,5*1,6*5,2*1,7*1,2*1,5*36,8*1,9*k,0*1,7*12,a*k,b*1b,c*2,d*m,e*n,f*1f,7*m,g*11,h*1j,i*x,j*2b,k*4m,l*3,c*k,m*h,1*1n,n*z,o*y,p*1,q*1c,r*27,s*1j,t*1p,u*5,v*5,w*4,x*1o,y*21,z*w,10*x,11*i,12*u,13*1,14*5,15*6,16*1,17*8,18*9,19*3,1a*4,1b*1,1c*1,1d*2,1e*1,1f*1,1g*1,1h*2,1i*3,1j*7,1k*1,1l*1,1f*1,1m*1,1n*y,1o*k,1p*4,1q*m,1l*b,1r*r,1s*1,1t*1,1u*f,1v*2,1j*1,1w*1,1x*1,1y*1,1z*1,20*1,1s*1,21*5,22*1,23*1,24*1,25*3,26*1,27*2,28*2,29*2,2a*2,2b*2,2c*1,2d*1,2e*1,2f*4,2g*1,2h*2,2i*2,2j*1,2k*3,2l*3,2m*3,2n*4,2o*2,2p*4,2q*1,2r*6,2s*y,2t*1,2u*2,2v*1,2w*1,2x*1,2y*3,2z*3,30*2,31*1,32*3,2f*6,33*3,34*2,35*1,36*1,37*h,38*1,39*1,3a*1,3b*5,3c*1,3d*1u,3e*m,3f*3i,3g*1,3h*2,3i*12,3j*6,3k*5,3l*6,3m*6,3n*6,3o*18,3p*6,3q*5,3r*5,3s*5,3t*4,3u*5,3v*32,3w*2e,3x*5,3y*m,3z*5,40*o,41*5,42*5,43*5,44*5,45*17,46*1,47*18,48*20,49*17,4a*8,4b*r,4c*1g,4d*a,4e*9,4f*2,4g*i,4h*4,4i*1,4j*1j,4k*1j,4l*5,4m*1m,4n*1k,4o*11,4p*11,4q*19,4r*1d,4s*1v,4t*5,4u*2k,4v*o,4w*3,4x*5,4y*a,4z*3g,50*4,51*5,52*2j,53*10,54*1a,55*e,56*5,57*1r,58*b,4e*g,59*3w,5a*2,5b*1,5c*f,5d*i,5e*3,5f*9,5g*14,5h*9,5i*5,5j*a,5k*25,5l*4,5m*5,5n*14,5o*1,5p*4,5q*5,5r*r,5s*y,5t*2f,5u*3,5v*3p,5w*8,5x*1,5y*8,5z*a,60*3,61*b,62*4,61*18,63*5,64*a,65*23,66*1l,67*u,68*21,69*1v,6a*21,6b*2d,6c*2,6d*1v,6e*13,6f*1o,6g*18,6h*14,6i*1e,6j*1n,6k*46,6l*23,6m*x,6n*c,6o*9,6p*c,6q*c,6r*9,6s*1,6t*a,6u*17,6v*a,6w*c,6x*11,6y*8,6z*1b,70*c,71*y,72*1a,73*1t,6s*1,74*u,75*3x,76*4a,77*4v,78*w,79*h,7a*2b,7b*g,7c*1,7d*a,7e*a,7f*g,7g*2","sep":"|"}]}]);
const COLONY = [
{"id":"n-6470b3b8","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-680cc003","guard":[["hasAny",["element","item number","name","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-1050c163","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-4077a52a","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","name","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-6bc6348e","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-80794597","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","name","nth","position","title case"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-8c68104b","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-a8629d5c","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-b8c3baaa","guard":[["hasAny",["element","item number","lower case","lowercase","name","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-b98d0490","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-8aef434e","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-8d6bd367","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","invert case","item number","name","nth","position","swap case","title case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-1768daa1","guard":[["hasAny",["a perfect number","element","item number","longest","longest one","longest word","name","nth","perfect number","position"]]],"pyramid":["render.yesNo",["compare.isPerfect",["sense.wordCount"]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-c9d2a4f9","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.yesNo",["compare.isPerfect",["sense.wordCount"]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-ee044e30","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier CCE52":"The project name of CCE52 is Le Nordais (Cap-Chat).","what is the project name of GPW47":"The project name of GPW47 is Ghost Pine Wind Farm.","give the project name for SKW68":"The project name of SKW68 is South Kent Wind Farm.","tell me the project name of the turbine identifier MCM4":"The project name of MCM4 is Mclean's Mountain.","what is the project name of COM22":"The project name of COM22 is Comber Wind Farm.","give the project name for UWF82":"The project name of UWF82 is Underwood Wind Farm.","tell me the project name of the turbine identifier HIW19":"The project name of HIW19 is Henvey Inlet Wind Farm.","what is the project name of SMH28":"The project name of SMH28 is Summerhaven.","tell me the project name of the turbine identifier HIW34":"The project name of HIW34 is Henvey Inlet Wind Farm.","tell me the project name of the turbine identifier DHU24":"The project name of DHU24 is Glen Dhu.","what is the project name of GOS34":"The project name of GOS34 is Goshen Wind Energy.","what is the project name of CCF2":"The project name of CCF2 is Clear Creek.","what is the project name of MNE53":"The project name of MNE53 is Le Nordais (Matane).","tell me the project name of the turbine identifier MSM26":"The project name of MSM26 is Mont Sainte-Marguerite.","what is the project name of NIA51":"The project name of NIA51 is Niagara Region.","tell me the project name of the turbine identifier LAA12":"The project name of LAA12 is Lac Alfred.","what is the project name of CTE66":"The project name of CTE66 is Centennial.","what is the project name of DUF47":"The project name of DUF47 is Dufferin Wind.","tell me the project name of the turbine identifier EUW50":"The project name of EUW50 is Erieau Wind.","what is the project name of RIP34":"The project name of RIP34 is Ripley.","give the project name for LEO34":"The project name of LEO34 is St. Leon.","what is the project name of THM15":"The project name of THM15 is Marsh Line (Thames River I).","give the project name for NRK32":"The project name of NRK32 is North Kent Wind Farm.","what is the project name of ELL1":"The project name of ELL1 is Ellershouse.","give the project name for SDB112":"The project name of SDB112 is Seigneurie de Beaupré.","what is the project name of CHA27":"The project name of CHA27 is Chatham.","what is the project name of CSC23":"The project name of CSC23 is Cape Scott.","give the project name for NCW13":"The project name of NCW13 is North Cape Wind Farm Phase 2.","what is the project name of WIH32":"The project name of WIH32 is Wintering Hills.","tell me the project name of the turbine identifier SBR4":"The project name of SBR4 is Sunbridge.","tell me the project name of the turbine identifier MDS68":"The project name of MDS68 is Massif du Sud.","tell me the project name of the turbine identifier AWE8":"The project name of AWE8 is Adelaide Wind Energy Centre.","what is the project name of ELS29":"The project name of ELS29 is East Lake St. Clair Wind.","what is the project name of JER11":"The project name of JER11 is Jericho.","give the project name for BRW11":"The project name of BRW11 is Blackspring Ridge Wind.","give the project name for SVW52":"The project name of SVW52 is Summerview.","tell me the project name of the turbine identifier KII140":"The project name of KII140 is K2 Wind Power Facility.","give the project name for NRI2":"The project name of NRI2 is New Richmond.","tell me the project name of the turbine identifier COM44":"The project name of COM44 is Comber Wind Farm.","give the project name for BRW19":"The project name of BRW19 is Blackspring Ridge Wind.","give the project name for WAI4":"The project name of WAI4 is Wainfleet.","what is the project name of PWE35":"The project name of PWE35 is Prince Wind Energy Project.","tell me the project name of the turbine identifier LAA31":"The project name of LAA31 is Lac Alfred.","tell me the project name of the turbine identifier MEL133":"The project name of MEL133 is Melancthon.","give the project name for SKW87":"The project name of SKW87 is South Kent Wind Farm.","tell me the project name of the turbine identifier MLO12":"The project name of MLO12 is Mont Louis.","give the project name for BRW38":"The project name of BRW38 is Blackspring Ridge Wind.","tell me the project name of the turbine identifier MCM17":"The project name of MCM17 is Mclean's Mountain.","give the project name for DOK14":"The project name of DOK14 is Dokie Ridge Wind Farm.","tell me the project name of the turbine identifier SOD20":"The project name of SOD20 is Soderglen.","give the project name for BOL25":"The project name of BOL25 is Bow Lake Wind Project.","give the project name for CRW47":"The project name of CRW47 is Castle River Wind Farm.","give the project name for MCM2":"The project name of MCM2 is Mclean's Mountain.","tell me the project name of the turbine identifier MEL99":"The project name of MEL99 is Melancthon.","tell me the project name of the turbine identifier CTE42":"The project name of CTE42 is Centennial.","tell me the project name of the turbine identifier CTE68":"The project name of CTE68 is Centennial.","what is the project name of SUL9":"The project name of SUL9 is Jardin d'Éole (Saint-Ulric Saint-Léandre).","give the project name for NRU18":"The project name of NRU18 is Nicolas-Riou.","what is the project name of NIA57":"The project name of NIA57 is Niagara Region.","give the project name for LEO12":"The project name of LEO12 is St. Leon.","give the project name for BRW82":"The project name of BRW82 is Blackspring Ridge Wind.","what is the project name of MSH5":"The project name of MSH5 is Montagne-Sèche.","tell me the project name of the turbine identifier JER27":"The project name of JER27 is Jericho.","what is the project name of VDK34":"The project name of VDK34 is Vents du Kempt.","give the project name for WHT2":"The project name of WHT2 is Whittington.","what is the project name of GRM74":"The project name of GRM74 is Gros-Morne.","tell me the project name of the turbine identifier NIA26":"The project name of NIA26 is Niagara Region.","what is the project name of RLY12":"The project name of RLY12 is Red Lily.","tell me the project name of the turbine identifier PAR9":"The project name of PAR9 is Pointes Aux Roches.","what is the project name of RON22":"The project name of RON22 is Roncevaux.","what is the project name of RWD1":"The project name of RWD1 is Ramea Wind Diesel.","tell me the project name of the turbine identifier CGO7":"The project name of CGO7 is Conestogo.","what is the project name of MGE3":"The project name of MGE3 is Montérégie.","what is the project name of SLE2":"The project name of SLE2 is Sable.","give the project name for CCE41":"The project name of CCE41 is Le Nordais (Cap-Chat).","give the project name for UWF79":"The project name of UWF79 is Underwood Wind Farm.","what is the project name of SOC9":"The project name of SOC9 is South Canoe.","what is the project name of ERA26":"The project name of ERA26 is De l'Érable.","give the project name for SRB26":"The project name of SRB26 is Saint-Robert-Bellarmin.","tell me the project name of the turbine identifier AWF14":"The project name of AWF14 is Ardenville Wind Farm.","what is the project name of CCE18":"The project name of CCE18 is Le Nordais (Cap-Chat).","tell me the project name of the turbine identifier BCW15":"The project name of BCW15 is Bull Creek Wind Farm.","tell me the project name of the turbine identifier SRB32":"The project name of SRB32 is Saint-Robert-Bellarmin.","give the project name for AMW48":"The project name of AMW48 is Armow Wind Project.","give the project name for ELS41":"The project name of ELS41 is East Lake St. Clair Wind.","give the project name for PWE124":"The project name of PWE124 is Prince Wind Energy Project.","give the project name for NRU45":"The project name of NRU45 is Nicolas-Riou.","tell me the project name of the turbine identifier BOR5":"The project name of BOR5 is Bornish Wind Energy Centre.","tell me the project name of the turbine identifier KII50":"The project name of KII50 is K2 Wind Power Facility.","give the project name for RLY6":"The project name of RLY6 is Red Lily.","give the project name for KBW2":"The project name of KBW2 is Kent Breeze Wind Farm.","tell me the project name of the turbine identifier GRM54":"The project name of GRM54 is Gros-Morne.","what is the project name of SDB105":"The project name of SDB105 is Seigneurie de Beaupré.","give the project name for WOL84":"The project name of WOL84 is Wolfe Island.","give the project name for TAL33":"The project name of TAL33 is Talbot.","what is the project name of GRM131":"The project name of GRM131 is Gros-Morne.","give the project name for WCW3":"The project name of WCW3 is West Cape Wind Farm.","tell me the project name of the turbine identifier NRI11":"The project name of NRI11 is New Richmond.","what is the project name of GRW30":"The project name of GRW30 is Grand Renewable Wind.","tell me the project name of the turbine identifier WOL82":"The project name of WOL82 is Wolfe Island."}}},
{"id":"n-22a9248b","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"of the turbine identifier CCE52":"The project name of CCE52 is Le Nordais (Cap-Chat).","of GPW47":"The project name of GPW47 is Ghost Pine Wind Farm.","for SKW68":"The project name of SKW68 is South Kent Wind Farm.","of the turbine identifier MCM4":"The project name of MCM4 is Mclean's Mountain.","of COM22":"The project name of COM22 is Comber Wind Farm.","for UWF82":"The project name of UWF82 is Underwood Wind Farm.","of the turbine identifier HIW19":"The project name of HIW19 is Henvey Inlet Wind Farm.","of SMH28":"The project name of SMH28 is Summerhaven.","of the turbine identifier HIW34":"The project name of HIW34 is Henvey Inlet Wind Farm.","of the turbine identifier DHU24":"The project name of DHU24 is Glen Dhu.","of GOS34":"The project name of GOS34 is Goshen Wind Energy.","of CCF2":"The project name of CCF2 is Clear Creek.","of MNE53":"The project name of MNE53 is Le Nordais (Matane).","of the turbine identifier MSM26":"The project name of MSM26 is Mont Sainte-Marguerite.","of NIA51":"The project name of NIA51 is Niagara Region.","of the turbine identifier LAA12":"The project name of LAA12 is Lac Alfred.","of CTE66":"The project name of CTE66 is Centennial.","of DUF47":"The project name of DUF47 is Dufferin Wind.","of the turbine identifier EUW50":"The project name of EUW50 is Erieau Wind.","of RIP34":"The project name of RIP34 is Ripley.","for LEO34":"The project name of LEO34 is St. Leon.","of THM15":"The project name of THM15 is Marsh Line (Thames River I).","for NRK32":"The project name of NRK32 is North Kent Wind Farm.","of ELL1":"The project name of ELL1 is Ellershouse.","for SDB112":"The project name of SDB112 is Seigneurie de Beaupré.","of CHA27":"The project name of CHA27 is Chatham.","of CSC23":"The project name of CSC23 is Cape Scott.","for NCW13":"The project name of NCW13 is North Cape Wind Farm Phase 2.","of WIH32":"The project name of WIH32 is Wintering Hills.","of the turbine identifier SBR4":"The project name of SBR4 is Sunbridge.","of the turbine identifier MDS68":"The project name of MDS68 is Massif du Sud.","of the turbine identifier AWE8":"The project name of AWE8 is Adelaide Wind Energy Centre.","of ELS29":"The project name of ELS29 is East Lake St. Clair Wind.","of JER11":"The project name of JER11 is Jericho.","for BRW11":"The project name of BRW11 is Blackspring Ridge Wind.","for SVW52":"The project name of SVW52 is Summerview.","of the turbine identifier KII140":"The project name of KII140 is K2 Wind Power Facility.","for NRI2":"The project name of NRI2 is New Richmond.","of the turbine identifier COM44":"The project name of COM44 is Comber Wind Farm.","for BRW19":"The project name of BRW19 is Blackspring Ridge Wind.","for WAI4":"The project name of WAI4 is Wainfleet.","of PWE35":"The project name of PWE35 is Prince Wind Energy Project.","of the turbine identifier LAA31":"The project name of LAA31 is Lac Alfred.","of the turbine identifier MEL133":"The project name of MEL133 is Melancthon.","for SKW87":"The project name of SKW87 is South Kent Wind Farm.","of the turbine identifier MLO12":"The project name of MLO12 is Mont Louis.","for BRW38":"The project name of BRW38 is Blackspring Ridge Wind.","of the turbine identifier MCM17":"The project name of MCM17 is Mclean's Mountain.","for DOK14":"The project name of DOK14 is Dokie Ridge Wind Farm.","of the turbine identifier SOD20":"The project name of SOD20 is Soderglen.","for BOL25":"The project name of BOL25 is Bow Lake Wind Project.","for CRW47":"The project name of CRW47 is Castle River Wind Farm.","for MCM2":"The project name of MCM2 is Mclean's Mountain.","of the turbine identifier MEL99":"The project name of MEL99 is Melancthon.","of the turbine identifier CTE42":"The project name of CTE42 is Centennial.","of the turbine identifier CTE68":"The project name of CTE68 is Centennial.","of SUL9":"The project name of SUL9 is Jardin d'Éole (Saint-Ulric Saint-Léandre).","for NRU18":"The project name of NRU18 is Nicolas-Riou.","of NIA57":"The project name of NIA57 is Niagara Region.","for LEO12":"The project name of LEO12 is St. Leon.","for BRW82":"The project name of BRW82 is Blackspring Ridge Wind.","of MSH5":"The project name of MSH5 is Montagne-Sèche.","of the turbine identifier JER27":"The project name of JER27 is Jericho.","of VDK34":"The project name of VDK34 is Vents du Kempt.","for WHT2":"The project name of WHT2 is Whittington.","of GRM74":"The project name of GRM74 is Gros-Morne.","of the turbine identifier NIA26":"The project name of NIA26 is Niagara Region.","of RLY12":"The project name of RLY12 is Red Lily.","of the turbine identifier PAR9":"The project name of PAR9 is Pointes Aux Roches.","of RON22":"The project name of RON22 is Roncevaux.","of RWD1":"The project name of RWD1 is Ramea Wind Diesel.","of the turbine identifier CGO7":"The project name of CGO7 is Conestogo.","of MGE3":"The project name of MGE3 is Montérégie.","of SLE2":"The project name of SLE2 is Sable.","for CCE41":"The project name of CCE41 is Le Nordais (Cap-Chat).","for UWF79":"The project name of UWF79 is Underwood Wind Farm.","of SOC9":"The project name of SOC9 is South Canoe.","of ERA26":"The project name of ERA26 is De l'Érable.","for SRB26":"The project name of SRB26 is Saint-Robert-Bellarmin.","of the turbine identifier AWF14":"The project name of AWF14 is Ardenville Wind Farm.","of CCE18":"The project name of CCE18 is Le Nordais (Cap-Chat).","of the turbine identifier BCW15":"The project name of BCW15 is Bull Creek Wind Farm.","of the turbine identifier SRB32":"The project name of SRB32 is Saint-Robert-Bellarmin.","for AMW48":"The project name of AMW48 is Armow Wind Project.","for ELS41":"The project name of ELS41 is East Lake St. Clair Wind.","for PWE124":"The project name of PWE124 is Prince Wind Energy Project.","for NRU45":"The project name of NRU45 is Nicolas-Riou.","of the turbine identifier BOR5":"The project name of BOR5 is Bornish Wind Energy Centre.","of the turbine identifier KII50":"The project name of KII50 is K2 Wind Power Facility.","for RLY6":"The project name of RLY6 is Red Lily.","for KBW2":"The project name of KBW2 is Kent Breeze Wind Farm.","of the turbine identifier GRM54":"The project name of GRM54 is Gros-Morne.","of SDB105":"The project name of SDB105 is Seigneurie de Beaupré.","for WOL84":"The project name of WOL84 is Wolfe Island.","for TAL33":"The project name of TAL33 is Talbot.","of GRM131":"The project name of GRM131 is Gros-Morne.","for WCW3":"The project name of WCW3 is West Cape Wind Farm.","of the turbine identifier NRI11":"The project name of NRI11 is New Richmond.","of GRW30":"The project name of GRW30 is Grand Renewable Wind.","of the turbine identifier WOL82":"The project name of WOL82 is Wolfe Island."}}},
{"id":"n-e25990bb","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"project"}]]],"mem":{"table":{"name of the turbine identifier CCE52":"The project name of CCE52 is Le Nordais (Cap-Chat).","name of GPW47":"The project name of GPW47 is Ghost Pine Wind Farm.","name for SKW68":"The project name of SKW68 is South Kent Wind Farm.","name of the turbine identifier MCM4":"The project name of MCM4 is Mclean's Mountain.","name of COM22":"The project name of COM22 is Comber Wind Farm.","name for UWF82":"The project name of UWF82 is Underwood Wind Farm.","name of the turbine identifier HIW19":"The project name of HIW19 is Henvey Inlet Wind Farm.","name of SMH28":"The project name of SMH28 is Summerhaven.","name of the turbine identifier HIW34":"The project name of HIW34 is Henvey Inlet Wind Farm.","name of the turbine identifier DHU24":"The project name of DHU24 is Glen Dhu.","name of GOS34":"The project name of GOS34 is Goshen Wind Energy.","name of CCF2":"The project name of CCF2 is Clear Creek.","name of MNE53":"The project name of MNE53 is Le Nordais (Matane).","name of the turbine identifier MSM26":"The project name of MSM26 is Mont Sainte-Marguerite.","name of NIA51":"The project name of NIA51 is Niagara Region.","name of the turbine identifier LAA12":"The project name of LAA12 is Lac Alfred.","name of CTE66":"The project name of CTE66 is Centennial.","name of DUF47":"The project name of DUF47 is Dufferin Wind.","name of the turbine identifier EUW50":"The project name of EUW50 is Erieau Wind.","name of RIP34":"The project name of RIP34 is Ripley.","name for LEO34":"The project name of LEO34 is St. Leon.","name of THM15":"The project name of THM15 is Marsh Line (Thames River I).","name for NRK32":"The project name of NRK32 is North Kent Wind Farm.","name of ELL1":"The project name of ELL1 is Ellershouse.","name for SDB112":"The project name of SDB112 is Seigneurie de Beaupré.","name of CHA27":"The project name of CHA27 is Chatham.","name of CSC23":"The project name of CSC23 is Cape Scott.","name for NCW13":"The project name of NCW13 is North Cape Wind Farm Phase 2.","name of WIH32":"The project name of WIH32 is Wintering Hills.","name of the turbine identifier SBR4":"The project name of SBR4 is Sunbridge.","name of the turbine identifier MDS68":"The project name of MDS68 is Massif du Sud.","name of the turbine identifier AWE8":"The project name of AWE8 is Adelaide Wind Energy Centre.","name of ELS29":"The project name of ELS29 is East Lake St. Clair Wind.","name of JER11":"The project name of JER11 is Jericho.","name for BRW11":"The project name of BRW11 is Blackspring Ridge Wind.","name for SVW52":"The project name of SVW52 is Summerview.","name of the turbine identifier KII140":"The project name of KII140 is K2 Wind Power Facility.","name for NRI2":"The project name of NRI2 is New Richmond.","name of the turbine identifier COM44":"The project name of COM44 is Comber Wind Farm.","name for BRW19":"The project name of BRW19 is Blackspring Ridge Wind.","name for WAI4":"The project name of WAI4 is Wainfleet.","name of PWE35":"The project name of PWE35 is Prince Wind Energy Project.","name of the turbine identifier LAA31":"The project name of LAA31 is Lac Alfred.","name of the turbine identifier MEL133":"The project name of MEL133 is Melancthon.","name for SKW87":"The project name of SKW87 is South Kent Wind Farm.","name of the turbine identifier MLO12":"The project name of MLO12 is Mont Louis.","name for BRW38":"The project name of BRW38 is Blackspring Ridge Wind.","name of the turbine identifier MCM17":"The project name of MCM17 is Mclean's Mountain.","name for DOK14":"The project name of DOK14 is Dokie Ridge Wind Farm.","name of the turbine identifier SOD20":"The project name of SOD20 is Soderglen.","name for BOL25":"The project name of BOL25 is Bow Lake Wind Project.","name for CRW47":"The project name of CRW47 is Castle River Wind Farm.","name for MCM2":"The project name of MCM2 is Mclean's Mountain.","name of the turbine identifier MEL99":"The project name of MEL99 is Melancthon.","name of the turbine identifier CTE42":"The project name of CTE42 is Centennial.","name of the turbine identifier CTE68":"The project name of CTE68 is Centennial.","name of SUL9":"The project name of SUL9 is Jardin d'Éole (Saint-Ulric Saint-Léandre).","name for NRU18":"The project name of NRU18 is Nicolas-Riou.","name of NIA57":"The project name of NIA57 is Niagara Region.","name for LEO12":"The project name of LEO12 is St. Leon.","name for BRW82":"The project name of BRW82 is Blackspring Ridge Wind.","name of MSH5":"The project name of MSH5 is Montagne-Sèche.","name of the turbine identifier JER27":"The project name of JER27 is Jericho.","name of VDK34":"The project name of VDK34 is Vents du Kempt.","name for WHT2":"The project name of WHT2 is Whittington.","name of GRM74":"The project name of GRM74 is Gros-Morne.","name of the turbine identifier NIA26":"The project name of NIA26 is Niagara Region.","name of RLY12":"The project name of RLY12 is Red Lily.","name of the turbine identifier PAR9":"The project name of PAR9 is Pointes Aux Roches.","name of RON22":"The project name of RON22 is Roncevaux.","name of RWD1":"The project name of RWD1 is Ramea Wind Diesel.","name of the turbine identifier CGO7":"The project name of CGO7 is Conestogo.","name of MGE3":"The project name of MGE3 is Montérégie.","name of SLE2":"The project name of SLE2 is Sable.","name for CCE41":"The project name of CCE41 is Le Nordais (Cap-Chat).","name for UWF79":"The project name of UWF79 is Underwood Wind Farm.","name of SOC9":"The project name of SOC9 is South Canoe.","name of ERA26":"The project name of ERA26 is De l'Érable.","name for SRB26":"The project name of SRB26 is Saint-Robert-Bellarmin.","name of the turbine identifier AWF14":"The project name of AWF14 is Ardenville Wind Farm.","name of CCE18":"The project name of CCE18 is Le Nordais (Cap-Chat).","name of the turbine identifier BCW15":"The project name of BCW15 is Bull Creek Wind Farm.","name of the turbine identifier SRB32":"The project name of SRB32 is Saint-Robert-Bellarmin.","name for AMW48":"The project name of AMW48 is Armow Wind Project.","name for ELS41":"The project name of ELS41 is East Lake St. Clair Wind.","name for PWE124":"The project name of PWE124 is Prince Wind Energy Project.","name for NRU45":"The project name of NRU45 is Nicolas-Riou.","name of the turbine identifier BOR5":"The project name of BOR5 is Bornish Wind Energy Centre.","name of the turbine identifier KII50":"The project name of KII50 is K2 Wind Power Facility.","name for RLY6":"The project name of RLY6 is Red Lily.","name for KBW2":"The project name of KBW2 is Kent Breeze Wind Farm.","name of the turbine identifier GRM54":"The project name of GRM54 is Gros-Morne.","name of SDB105":"The project name of SDB105 is Seigneurie de Beaupré.","name for WOL84":"The project name of WOL84 is Wolfe Island.","name for TAL33":"The project name of TAL33 is Talbot.","name of GRM131":"The project name of GRM131 is Gros-Morne.","name for WCW3":"The project name of WCW3 is West Cape Wind Farm.","name of the turbine identifier NRI11":"The project name of NRI11 is New Richmond.","name of GRW30":"The project name of GRW30 is Grand Renewable Wind.","name of the turbine identifier WOL82":"The project name of WOL82 is Wolfe Island."}}},
{"id":"n-0bae4b15","guard":[["not",["hasAny",["number","pkname","sbr4"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"ridge"}]],"mem":null},
{"id":"n-a6075943","guard":[["hasAny",["amw48","awe8","awf14","bcw15","bol25","bor5","brw11","brw19","brw38","brw82","cce18","cce41","cce52","ccf2","cgo7","cha27","com22","com44","crw47","csc23","cte42","cte66","cte68","delete","dhu24","dok14","duf47","element","ell1","els29","els41","era26","euw50","gos34","gpw47","grm131","grm54","grm74","grw30","hiw19","hiw34","item number","jer11","jer27","kbw2","kii140","kii50","laa12","laa31","leo12","leo34","mcm17","mcm2","mcm4","mds68","mel133","mel99","mge3","mlo12","mne53","msh5","msm26","ncw13","nia26","nia51","nia57","nri11","nri2","nrk32","nru18","nru45","nth","par9","position","pwe124","pwe35","remove","rip34","rly12","rly6","ron22","rwd1","sdb105","sdb112","skw68","skw87","sle2","smh28","soc9","sod20","srb26","srb32","strip out","sul9","svw52","tal33","thm15","uwf79","uwf82","vdk34","wai4","wcw3","wht2","wih32","without","wol82","wol84"]],["has","name"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"ridge"}]],"mem":null},
{"id":"n-054d50d5","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Jericho"}]],"mem":null},
{"id":"n-1f697200","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Henvey Inlet Wind Farm"}]],"mem":null},
{"id":"n-242b4cf9","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Jericho"}]],"mem":null},
{"id":"n-570cb070","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Henvey Inlet Wind Farm"}]],"mem":null},
{"id":"n-5ba52341","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Comber Wind Farm"}]],"mem":null},
{"id":"n-84488dc4","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"East Lake St. Clair Wind"}]],"mem":null},
{"id":"n-94d63c76","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Comber Wind Farm"}]],"mem":null},
{"id":"n-c0fbd867","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"East Lake St. Clair Wind"}]],"mem":null},
{"id":"n-0ec3022e","guard":[["not",["hasAny",["cce18","mne53","number","pkname"]]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-50e69c99","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","ccf2","cha27","com22","crw47","csc23","cte66","delete","dok14","duf47","element","ell1","els29","els41","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","kbw2","leo12","leo34","mcm2","mge3","msh5","ncw13","nia51","nia57","nri2","nrk32","nru18","nru45","nth","position","pwe124","pwe35","remove","rip34","rly12","rly6","ron22","rwd1","sdb105","sdb112","skw68","skw87","sle2","smh28","soc9","srb26","strip out","sul9","svw52","tal33","thm15","uwf79","uwf82","vdk34","wai4","wcw3","wht2","wih32","without","wol84"]],["has","name"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6e403b09","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","ccf2","cha27","com22","crw47","csc23","cte66","dok14","duf47","element","ell1","els29","els41","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","kbw2","leo12","leo34","mcm2","mge3","msh5","ncw13","nia51","nia57","nri2","nrk32","nru18","nru45","nth","position","pwe124","pwe35","rip34","rly12","rly6","ron22","rwd1","sdb105","sdb112","separate by","skw68","skw87","sle2","smh28","soc9","split","split by","srb26","sul9","svw52","tal33","thm15","uwf79","uwf82","vdk34","wai4","wcw3","wht2","wih32","wol84"]],["has","name"]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-72983ed0","guard":[["not",["hasAny",["cce18","mne53","number","pkname"]]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-77ffe18b","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","ccf2","cha27","com22","crw47","csc23","cte66","dok14","duf47","element","ell1","els29","els41","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","kbw2","leo12","leo34","mcm2","mge3","msh5","ncw13","nia51","nia57","nri2","nrk32","nru18","nru45","nth","position","pwe124","pwe35","rip34","rly12","rly6","ron22","rwd1","sdb105","sdb112","separate by","skw68","skw87","sle2","smh28","soc9","split","split by","srb26","sul9","svw52","tal33","thm15","uwf79","uwf82","vdk34","wai4","wcw3","wht2","wih32","wol84"]],["has","name"]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-ab92b1fb","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","ccf2","cha27","com22","crw47","csc23","cte66","dok14","duf47","element","ell1","els29","els41","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","kbw2","leo12","leo34","mcm2","mge3","msh5","ncw13","nia51","nia57","nri2","nrk32","nru18","nru45","nth","position","pwe124","pwe35","rip34","rly12","rly6","ron22","rwd1","sdb105","sdb112","separate by","skw68","skw87","sle2","smh28","soc9","split","split by","srb26","sul9","svw52","tal33","thm15","uwf79","uwf82","vdk34","wai4","wcw3","wht2","wih32","wol84"]],["has","name"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b071bafa","guard":[["not",["hasAny",["cce18","mne53","number","pkname"]]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d3aa84f1","guard":[["not",["hasAny",["cce18","mne53","number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-4935fcfe","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Gros-Morne"}]],"mem":null},
{"id":"n-58c3951f","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Mclean's Mountain"}]],"mem":null},
{"id":"n-70963aac","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Mclean's Mountain"}]],"mem":null},
{"id":"n-716cd258","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Centennial"}]],"mem":null},
{"id":"n-76d02ae3","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Le Nordais (Cap-Chat)"}]],"mem":null},
{"id":"n-86e13fc1","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Gros-Morne"}]],"mem":null},
{"id":"n-9d6c7731","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Le Nordais (Cap-Chat)"}]],"mem":null},
{"id":"n-c64a9f23","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Centennial"}]],"mem":null},
{"id":"n-e38419c7","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Niagara Region"}]],"mem":null},
{"id":"n-f3d983e1","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Niagara Region"}]],"mem":null},
{"id":"n-7e3c57d8","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Blackspring Ridge Wind"}]],"mem":null},
{"id":"n-f15e7321","guard":[["not",["hasAny",["number","pkname"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":"Blackspring Ridge Wind"}]],"mem":null},
{"id":"n-3607717c","guard":[["hasAny",["amw48","awe8","awf14","bcw15","bol25","bor5","brw11","brw19","brw38","brw82","cce18","cce41","cce52","ccf2","cha27","com22","com44","crw47","csc23","cte42","cte66","cte68","dok14","duf47","element","ell1","els29","els41","era26","euw50","gos34","gpw47","grm131","grm54","grm74","grw30","hiw19","hiw34","item number","jer11","kbw2","kii140","kii50","laa12","laa31","leading zeros","leo12","leo34","mcm17","mcm2","mcm4","mds68","mel133","mel99","mge3","mlo12","mne53","msh5","msm26","ncw13","nia26","nia51","nia57","nri11","nri2","nrk32","nru18","nru45","nth","pad","pad with","padded to","par9","position","pwe124","pwe35","rly12","rly6","ron22","rwd1","sdb105","sdb112","skw68","skw87","smh28","soc9","srb26","srb32","sul9","svw52","tal33","thm15","uwf79","uwf82","vdk34","wai4","wcw3","wht2","wih32","wol82","wol84","zero pad"]],["has","name"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-057384af","guard":[["hasAny",["amw48","awe8","awf14","bcw15","bol25","bor5","brw11","brw19","brw38","brw82","cce18","cce41","cce52","ccf2","cha27","com22","com44","crw47","csc23","cte42","cte66","cte68","dok14","duf47","element","ell1","els29","els41","era26","euw50","gos34","gpw47","grm131","grm54","grm74","grw30","hiw19","hiw34","item number","jer11","kbw2","kii140","kii50","laa12","laa31","leading zeros","leo12","leo34","mcm17","mcm2","mcm4","mds68","mel133","mel99","mge3","mlo12","mne53","msh5","msm26","ncw13","nia26","nia51","nia57","nri11","nri2","nrk32","nru18","nru45","nth","pad","pad with","padded to","par9","position","pwe124","pwe35","rly12","rly6","ron22","rwd1","sdb105","sdb112","skw68","skw87","smh28","soc9","srb26","srb32","sul9","svw52","tal33","thm15","uwf79","uwf82","vdk34","wai4","wcw3","wht2","wih32","wol82","wol84","zero pad"]],["has","name"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}]]],"mem":null},
{"id":"n-1e78d75c","guard":[["hasAny",["amw48","awe8","awf14","bcw15","bol25","bor5","brw11","brw19","brw38","brw82","cce18","cce41","cce52","ccf2","com22","com44","crw47","csc23","cte42","cte66","cte68","dok14","duf47","element","ell1","els29","els41","era26","euw50","gos34","gpw47","grm131","grm54","grm74","grw30","hiw19","hiw34","item number","kbw2","kii140","kii50","laa12","laa31","leading zeros","mcm17","mcm2","mcm4","mds68","mel133","mel99","mge3","mlo12","mne53","msh5","msm26","ncw13","nia26","nia51","nia57","nri11","nri2","nrk32","nru18","nru45","nth","pad","pad with","padded to","par9","position","pwe124","pwe35","rwd1","sdb105","sdb112","skw68","skw87","smh28","soc9","srb26","srb32","sul9","svw52","thm15","uwf79","uwf82","vdk34","wcw3","wht2","wih32","wol82","wol84","zero pad"]],["has","name"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-b033e702","guard":[["hasAny",["amw48","awe8","awf14","bcw15","bol25","bor5","brw11","brw19","brw38","brw82","cce18","cce41","cce52","ccf2","com22","com44","crw47","csc23","cte42","cte66","cte68","dok14","duf47","element","ell1","els29","els41","era26","euw50","gos34","gpw47","grm131","grm54","grm74","grw30","hiw19","hiw34","item number","kbw2","kii140","kii50","laa12","laa31","leading zeros","mcm17","mcm2","mcm4","mds68","mel133","mel99","mge3","mlo12","mne53","msh5","msm26","ncw13","nia26","nia51","nia57","nri11","nri2","nrk32","nru18","nru45","nth","pad","pad with","padded to","par9","position","pwe124","pwe35","rwd1","sdb105","sdb112","skw68","skw87","smh28","soc9","srb26","srb32","sul9","svw52","thm15","uwf79","uwf82","vdk34","wcw3","wht2","wih32","wol82","wol84","zero pad"]],["has","name"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}]]],"mem":null},
{"id":"n-1ebe876a","guard":[["hasAny",["amw48","awe8","awf14","bcw15","bol25","bor5","brw11","brw19","brw38","brw82","ccf2","cgo7","cha27","com22","com44","crw47","csc23","cte42","cte66","cte68","dhu24","dok14","duf47","element","ell1","euw50","gos34","gpw47","grw30","hiw19","hiw34","item number","jer11","jer27","kbw2","kii140","kii50","laa12","laa31","mds68","mel133","mel99","mge3","mlo12","ncw13","nia26","nia51","nia57","normalise","normalize","nri11","nri2","nrk32","nth","par9","position","pwe124","pwe35","rip34","rly12","rly6","ron22","rwd1","sbr4","sdb105","sdb112","simplify the text","skw68","skw87","sle2","smh28","soc9","sod20","svw52","tal33","uwf79","uwf82","vdk34","wai4","wcw3","wht2","wih32","wol82","wol84"]],["has","name"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":2}]],"mem":null},
{"id":"n-8963c7f7","guard":[["hasAny",["amw48","awe8","awf14","bcw15","bol25","bor5","brw11","brw19","brw38","brw82","ccf2","cgo7","cha27","com22","com44","crw47","csc23","cte42","cte66","cte68","dhu24","dok14","duf47","element","ell1","euw50","gos34","gpw47","grw30","hiw19","hiw34","item number","jer11","jer27","kbw2","kii140","kii50","laa12","laa31","mds68","mel133","mel99","mge3","mlo12","ncw13","nia26","nia51","nia57","normalise","normalize","nri11","nri2","nrk32","nth","par9","position","pwe124","pwe35","rip34","rly12","rly6","ron22","rwd1","sbr4","sdb105","sdb112","simplify the text","skw68","skw87","sle2","smh28","soc9","sod20","svw52","tal33","uwf79","uwf82","vdk34","wai4","wcw3","wht2","wih32","wol82","wol84"]],["has","name"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":1}]],"mem":null},
{"id":"n-e1bf3242","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-b4bc1422","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce18","cce41","ccf2","cha27","com22","crw47","csc23","cte66","dok14","duf47","element","ell1","els29","els41","era26","gos34","gpw47","grm131","grm74","grw30","item number","jer11","kbw2","leo12","leo34","longest","longest one","longest word","mcm2","mge3","mne53","msh5","ncw13","nia51","nia57","nri2","nrk32","nru18","nru45","nth","position","pwe124","pwe35","rip34","rly12","rly6","ron22","rwd1","sdb105","sdb112","skw68","skw87","sle2","smh28","soc9","srb26","sul9","svw52","tal33","thm15","uwf79","uwf82","vdk34","wai4","wcw3","wht2","wih32","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-392a28d3","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The project ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-a0baf8f3","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," name of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-1876ab06","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.and",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-d60533d2","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-1718a25f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","title case","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-5a3a0a84","guard":[["hasAny",["all caps","capital letters","capitals","cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","upper case","uppercase","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-6c69bb22","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-a8106b59","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","invert case","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","swap case","thm15","toggle case","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-a8291c60","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","lower case","lowercase","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","small letters","smh28","soc9","sul9","thm15","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-4a38d0ea","guard":[["hasAny",["cce18","ccf2","cha27","class name","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","pascal case","pascalcase","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","upper camel case","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-6f0d882e","guard":[["hasAny",["camel case","camelcase","cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","identifier","item number","jer11","lower camel case","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","vdk34","wih32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-4b8e49d4","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"the turbine identifier CCE52":"The project name of CCE52 is Le Nordais (Cap-Chat).","GPW47":"The project name of GPW47 is Ghost Pine Wind Farm.","the turbine identifier MCM4":"The project name of MCM4 is Mclean's Mountain.","COM22":"The project name of COM22 is Comber Wind Farm.","the turbine identifier HIW19":"The project name of HIW19 is Henvey Inlet Wind Farm.","SMH28":"The project name of SMH28 is Summerhaven.","the turbine identifier HIW34":"The project name of HIW34 is Henvey Inlet Wind Farm.","the turbine identifier DHU24":"The project name of DHU24 is Glen Dhu.","GOS34":"The project name of GOS34 is Goshen Wind Energy.","CCF2":"The project name of CCF2 is Clear Creek.","MNE53":"The project name of MNE53 is Le Nordais (Matane).","the turbine identifier MSM26":"The project name of MSM26 is Mont Sainte-Marguerite.","NIA51":"The project name of NIA51 is Niagara Region.","the turbine identifier LAA12":"The project name of LAA12 is Lac Alfred.","CTE66":"The project name of CTE66 is Centennial.","DUF47":"The project name of DUF47 is Dufferin Wind.","the turbine identifier EUW50":"The project name of EUW50 is Erieau Wind.","RIP34":"The project name of RIP34 is Ripley.","THM15":"The project name of THM15 is Marsh Line (Thames River I).","ELL1":"The project name of ELL1 is Ellershouse.","CHA27":"The project name of CHA27 is Chatham.","CSC23":"The project name of CSC23 is Cape Scott.","WIH32":"The project name of WIH32 is Wintering Hills.","the turbine identifier SBR4":"The project name of SBR4 is Sunbridge.","the turbine identifier MDS68":"The project name of MDS68 is Massif du Sud.","the turbine identifier AWE8":"The project name of AWE8 is Adelaide Wind Energy Centre.","ELS29":"The project name of ELS29 is East Lake St. Clair Wind.","JER11":"The project name of JER11 is Jericho.","the turbine identifier KII140":"The project name of KII140 is K2 Wind Power Facility.","the turbine identifier COM44":"The project name of COM44 is Comber Wind Farm.","PWE35":"The project name of PWE35 is Prince Wind Energy Project.","the turbine identifier LAA31":"The project name of LAA31 is Lac Alfred.","the turbine identifier MEL133":"The project name of MEL133 is Melancthon.","the turbine identifier MLO12":"The project name of MLO12 is Mont Louis.","the turbine identifier MCM17":"The project name of MCM17 is Mclean's Mountain.","the turbine identifier SOD20":"The project name of SOD20 is Soderglen.","the turbine identifier MEL99":"The project name of MEL99 is Melancthon.","the turbine identifier CTE42":"The project name of CTE42 is Centennial.","the turbine identifier CTE68":"The project name of CTE68 is Centennial.","SUL9":"The project name of SUL9 is Jardin d'Éole (Saint-Ulric Saint-Léandre).","NIA57":"The project name of NIA57 is Niagara Region.","MSH5":"The project name of MSH5 is Montagne-Sèche.","the turbine identifier JER27":"The project name of JER27 is Jericho.","VDK34":"The project name of VDK34 is Vents du Kempt.","GRM74":"The project name of GRM74 is Gros-Morne.","the turbine identifier NIA26":"The project name of NIA26 is Niagara Region.","RLY12":"The project name of RLY12 is Red Lily.","the turbine identifier PAR9":"The project name of PAR9 is Pointes Aux Roches.","RON22":"The project name of RON22 is Roncevaux.","RWD1":"The project name of RWD1 is Ramea Wind Diesel.","the turbine identifier CGO7":"The project name of CGO7 is Conestogo.","MGE3":"The project name of MGE3 is Montérégie.","SLE2":"The project name of SLE2 is Sable.","SOC9":"The project name of SOC9 is South Canoe.","ERA26":"The project name of ERA26 is De l'Érable.","the turbine identifier AWF14":"The project name of AWF14 is Ardenville Wind Farm.","CCE18":"The project name of CCE18 is Le Nordais (Cap-Chat).","the turbine identifier BCW15":"The project name of BCW15 is Bull Creek Wind Farm.","the turbine identifier SRB32":"The project name of SRB32 is Saint-Robert-Bellarmin.","the turbine identifier BOR5":"The project name of BOR5 is Bornish Wind Energy Centre.","the turbine identifier KII50":"The project name of KII50 is K2 Wind Power Facility.","the turbine identifier GRM54":"The project name of GRM54 is Gros-Morne.","SDB105":"The project name of SDB105 is Seigneurie de Beaupré.","GRM131":"The project name of GRM131 is Gros-Morne.","the turbine identifier NRI11":"The project name of NRI11 is New Richmond.","GRW30":"The project name of GRW30 is Grand Renewable Wind.","the turbine identifier WOL82":"The project name of WOL82 is Wolfe Island."}}},
{"id":"n-a7026b37","guard":[["hasAny",["coprime","element","half","half of","halve","item number","longest","longest one","longest word","name","nth","position","relatively prime","share no factor"]]],"pyramid":["render.yesNo",["compare.coprime",{"lit":3},["transform.half",["sense.wordCount"]]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-02e66ca1","guard":[["hasAny",["amw48","awe8","awf14","bcw15","bol25","bor5","brw11","brw19","brw38","brw82","cce18","cce41","cce52","com22","com44","crw47","dok14","duf47","element","els29","els41","gos34","gpw47","grw30","hiw19","hiw34","item number","kbw2","kii140","kii50","leading zeros","mcm17","mcm2","mcm4","mds68","mne53","msh5","msm26","ncw13","nia26","nia51","nia57","nri11","nri2","nrk32","nru18","nru45","nth","pad","pad with","padded to","par9","position","pwe124","pwe35","rwd1","sdb105","sdb112","skw68","skw87","srb26","srb32","sul9","thm15","uwf79","uwf82","vdk34","wcw3","wih32","wol82","wol84","zero pad"]],["has","name"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-6d31ad89","guard":[["hasAny",["amw48","awe8","awf14","bcw15","bol25","bor5","brw11","brw19","brw38","brw82","cce18","cce41","cce52","com22","com44","crw47","dok14","duf47","element","els29","els41","gos34","gpw47","grw30","hiw19","hiw34","item number","kbw2","kii140","kii50","leading zeros","mcm17","mcm2","mcm4","mds68","mne53","msh5","msm26","ncw13","nia26","nia51","nia57","nri11","nri2","nrk32","nru18","nru45","nth","pad","pad with","padded to","par9","position","pwe124","pwe35","rwd1","sdb105","sdb112","skw68","skw87","srb26","srb32","sul9","thm15","uwf79","uwf82","vdk34","wcw3","wih32","wol82","wol84","zero pad"]],["has","name"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}]]],"mem":null},
{"id":"n-5240f70b","guard":[["hasAny",["ccf2","cgo7","cha27","characters from","csc23","cte42","cte66","cte68","dhu24","element","ell1","era26","euw50","grm131","grm54","grm74","item number","jer11","jer27","laa12","laa31","leo12","leo34","letters from to","mel133","mel99","mge3","mlo12","nri11","nri2","nru18","nru45","nth","position","rip34","rly12","rly6","ron22","sbr4","sle2","slice of the text","smh28","soc9","sod20","substring","svw52","tal33","wai4","wht2","wol82","wol84"]],["has","name"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-b5355e4d","guard":[["hasAny",["brw11","brw19","brw38","brw82","ccf2","cgo7","cha27","csc23","cte42","cte66","cte68","duf47","element","ell1","euw50","grw30","item number","jer11","jer27","mel133","mel99","mge3","nia26","nia51","nia57","normalise","normalize","nri11","nri2","nth","position","rip34","ron22","sbr4","simplify the text","sle2","smh28","sod20","svw52","tal33","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":3}]],"mem":null},
{"id":"n-81eaf630","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-bf7e7447","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","vdk34","wih32"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-0e18668c","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","item number","jer11","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","vdk34","wih32"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-4a45de9a","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","item number","jer11","longest","longest one","longest word","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","vdk34","wih32"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-6d7a3953","guard":[["hasAny",["cce18","ccf2","cha27","com22","csc23","cte66","dashes","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","hyphens","item number","jer11","kebab case","kebabcase","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","slug","smh28","soc9","sul9","thm15","vdk34","wih32"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.kebab",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-add4ccf6","guard":[["hasAny",["camel case","camelcase","cce18","ccf2","cha27","com22","csc23","cte66","duf47","element","ell1","els29","era26","gos34","gpw47","grm131","grm74","grw30","item number","jer11","lower camel case","mge3","mne53","msh5","nia51","nia57","nth","position","pwe35","rip34","rly12","ron22","rwd1","sdb105","sle2","smh28","soc9","sul9","thm15","vdk34","wih32"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.camel",["sense.after",{"lit":"of"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-07a86e72","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the project name of GPW47":"The project name of GPW47 is Ghost Pine Wind Farm.","the project name of COM22":"The project name of COM22 is Comber Wind Farm.","the project name of SMH28":"The project name of SMH28 is Summerhaven.","the project name of GOS34":"The project name of GOS34 is Goshen Wind Energy.","the project name of CCF2":"The project name of CCF2 is Clear Creek.","the project name of MNE53":"The project name of MNE53 is Le Nordais (Matane).","the project name of NIA51":"The project name of NIA51 is Niagara Region.","the project name of CTE66":"The project name of CTE66 is Centennial.","the project name of DUF47":"The project name of DUF47 is Dufferin Wind.","the project name of RIP34":"The project name of RIP34 is Ripley.","the project name of THM15":"The project name of THM15 is Marsh Line (Thames River I).","the project name of ELL1":"The project name of ELL1 is Ellershouse.","the project name of CHA27":"The project name of CHA27 is Chatham.","the project name of CSC23":"The project name of CSC23 is Cape Scott.","the project name of WIH32":"The project name of WIH32 is Wintering Hills.","the project name of ELS29":"The project name of ELS29 is East Lake St. Clair Wind.","the project name of JER11":"The project name of JER11 is Jericho.","the project name of PWE35":"The project name of PWE35 is Prince Wind Energy Project.","the project name of SUL9":"The project name of SUL9 is Jardin d'Éole (Saint-Ulric Saint-Léandre).","the project name of NIA57":"The project name of NIA57 is Niagara Region.","the project name of MSH5":"The project name of MSH5 is Montagne-Sèche.","the project name of VDK34":"The project name of VDK34 is Vents du Kempt.","the project name of GRM74":"The project name of GRM74 is Gros-Morne.","the project name of RLY12":"The project name of RLY12 is Red Lily.","the project name of RON22":"The project name of RON22 is Roncevaux.","the project name of RWD1":"The project name of RWD1 is Ramea Wind Diesel.","the project name of MGE3":"The project name of MGE3 is Montérégie.","the project name of SLE2":"The project name of SLE2 is Sable.","the project name of SOC9":"The project name of SOC9 is South Canoe.","the project name of ERA26":"The project name of ERA26 is De l'Érable.","the project name of CCE18":"The project name of CCE18 is Le Nordais (Cap-Chat).","the project name of SDB105":"The project name of SDB105 is Seigneurie de Beaupré.","the project name of GRM131":"The project name of GRM131 is Gros-Morne.","the project name of GRW30":"The project name of GRW30 is Grand Renewable Wind."}}},
{"id":"n-ed551d8e","guard":[["hasAny",["delete","element","item number","name","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-57217e4f","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The project ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-8f5ae044","guard":[["hasAny",["element","item number","longest","longest one","longest word","name","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-247895d8","guard":[["hasAny",["camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","name","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.camel",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-4c682890","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","longest","longest one","longest word","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-af04ae01","guard":[["hasAny",["class name","element","item number","longest","longest one","longest word","name","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.pascal",["sense.after",{"lit":"for"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-59b04d71","guard":[["hasAny",["element","identifier","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-7bedebef","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-9c431a6e","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","longest","longest one","longest word","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-b785a23c","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","longest","longest one","longest word","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-35b9815b","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","longest","longest one","longest word","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-42ad184b","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","class name","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","pascal case","pascalcase","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","upper camel case","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-57e712af","guard":[["hasAny",["all caps","amw48","bol25","brw11","brw19","brw38","brw82","capital letters","capitals","cce41","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","longest","longest one","longest word","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","upper case","uppercase","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-5ec88866","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","element","els41","invert case","item number","kbw2","leo12","leo34","longest","longest one","longest word","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","swap case","tal33","toggle case","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-a4fc64bc","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","element","els41","invert case","item number","kbw2","leo12","leo34","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","swap case","tal33","toggle case","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-cf4305cc","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","capitalise","capitalize","capitalize each word","cce41","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","longest","longest one","longest word","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","title case","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-de275e80","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","longest","longest one","longest word","lower case","lowercase","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","small letters","srb26","svw52","tal33","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-325ab285","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","class name","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","longest","longest one","longest word","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","pascal case","pascalcase","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","upper camel case","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-4cc8f9a7","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","each word","element","els41","item number","kbw2","leo12","leo34","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","split into words","srb26","svw52","tal33","uwf79","uwf82","wai4","wcw3","wht2","wol84","words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-9529393a","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","camel case","camelcase","cce41","crw47","dok14","element","els41","item number","kbw2","leo12","leo34","longest","longest one","longest word","lower camel case","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","srb26","svw52","tal33","uwf79","uwf82","wai4","wcw3","wht2","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-b263e1ab","guard":[["hasAny",["amw48","bol25","brw11","brw19","brw38","brw82","cce41","crw47","dok14","each word","element","els41","item number","kbw2","leo12","leo34","mcm2","ncw13","nri2","nrk32","nru18","nru45","nth","position","pwe124","rly6","sdb112","skw68","skw87","split into words","srb26","svw52","tal33","uwf79","uwf82","wai4","wcw3","wht2","wol84","words"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-f8b5ef48","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"SKW68":"The project name of SKW68 is South Kent Wind Farm.","UWF82":"The project name of UWF82 is Underwood Wind Farm.","LEO34":"The project name of LEO34 is St. Leon.","NRK32":"The project name of NRK32 is North Kent Wind Farm.","SDB112":"The project name of SDB112 is Seigneurie de Beaupré.","NCW13":"The project name of NCW13 is North Cape Wind Farm Phase 2.","BRW11":"The project name of BRW11 is Blackspring Ridge Wind.","SVW52":"The project name of SVW52 is Summerview.","NRI2":"The project name of NRI2 is New Richmond.","BRW19":"The project name of BRW19 is Blackspring Ridge Wind.","WAI4":"The project name of WAI4 is Wainfleet.","SKW87":"The project name of SKW87 is South Kent Wind Farm.","BRW38":"The project name of BRW38 is Blackspring Ridge Wind.","DOK14":"The project name of DOK14 is Dokie Ridge Wind Farm.","BOL25":"The project name of BOL25 is Bow Lake Wind Project.","CRW47":"The project name of CRW47 is Castle River Wind Farm.","MCM2":"The project name of MCM2 is Mclean's Mountain.","NRU18":"The project name of NRU18 is Nicolas-Riou.","LEO12":"The project name of LEO12 is St. Leon.","BRW82":"The project name of BRW82 is Blackspring Ridge Wind.","WHT2":"The project name of WHT2 is Whittington.","CCE41":"The project name of CCE41 is Le Nordais (Cap-Chat).","UWF79":"The project name of UWF79 is Underwood Wind Farm.","SRB26":"The project name of SRB26 is Saint-Robert-Bellarmin.","AMW48":"The project name of AMW48 is Armow Wind Project.","ELS41":"The project name of ELS41 is East Lake St. Clair Wind.","PWE124":"The project name of PWE124 is Prince Wind Energy Project.","NRU45":"The project name of NRU45 is Nicolas-Riou.","RLY6":"The project name of RLY6 is Red Lily.","KBW2":"The project name of KBW2 is Kent Breeze Wind Farm.","WOL84":"The project name of WOL84 is Wolfe Island.","TAL33":"The project name of TAL33 is Talbot.","WCW3":"The project name of WCW3 is West Cape Wind Farm."}}},
{"id":"n-fbd0e6fa","guard":[["hasAny",["cgo7","cha27","characters from","csc23","cte42","cte66","cte68","dhu24","element","grm131","grm54","grm74","item number","jer11","jer27","laa12","laa31","leo12","leo34","letters from to","mel133","mel99","mge3","mlo12","nth","position","rip34","rly12","rly6","ron22","sbr4","sle2","slice of the text","sod20","substring","svw52","tal33","wai4"]],["has","name"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-ac49a0de","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","dashes","element","ell1","grm131","grm54","grm74","hyphens","item number","jer11","jer27","kebab case","kebabcase","mel133","mel99","mge3","msh5","nru18","nru45","nth","position","rip34","ron22","sbr4","sle2","slug","smh28","sod20","srb26","srb32","svw52","tal33","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-dbe348f4","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","element","ell1","grm131","grm54","grm74","item number","jer11","jer27","mel133","mel99","mge3","msh5","nru18","nru45","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","sod20","srb26","srb32","svw52","tal33","wai4","wht2","words backwards"]],["has","name"]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-0339f7d9","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","dashes","element","ell1","grm131","grm54","grm74","hyphens","item number","jer11","jer27","kebab case","kebabcase","mel133","mel99","mge3","msh5","nru18","nru45","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","slug","smh28","sod20","srb26","srb32","svw52","tal33","wai4","wht2","words backwards"]],["has","name"]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-0404f064","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","element","ell1","grm131","grm54","grm74","invert case","item number","jer11","jer27","mel133","mel99","mge3","msh5","nru18","nru45","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","sod20","srb26","srb32","svw52","swap case","tal33","toggle case","wai4","wht2","words backwards"]],["has","name"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-3adbd6cf","guard":[["hasAny",["camel case","camelcase","cgo7","cha27","cte42","cte66","cte68","dashes","element","ell1","grm131","grm54","grm74","hyphens","item number","jer11","jer27","kebab case","kebabcase","lower camel case","mel133","mel99","mge3","msh5","nru18","nru45","nth","position","rip34","ron22","sbr4","sle2","slug","smh28","sod20","srb26","srb32","svw52","tal33","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.kebab",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-6a25e841","guard":[["hasAny",["all caps","capital letters","capitals","cgo7","cha27","cte42","cte66","cte68","element","ell1","grm131","grm54","grm74","item number","jer11","jer27","mel133","mel99","mge3","msh5","nru18","nru45","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","sod20","srb26","srb32","svw52","tal33","upper case","uppercase","wai4","wht2","words backwards"]],["has","name"]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-aabd1e7f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cgo7","cha27","cte42","cte66","cte68","dashes","element","ell1","grm131","grm54","grm74","hyphens","item number","jer11","jer27","kebab case","kebabcase","mel133","mel99","mge3","msh5","nru18","nru45","nth","position","rip34","ron22","sbr4","sle2","slug","smh28","sod20","srb26","srb32","svw52","tal33","title case","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-bf52aa31","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cgo7","cha27","cte42","cte66","cte68","element","ell1","grm131","grm54","grm74","item number","jer11","jer27","mel133","mel99","mge3","msh5","nru18","nru45","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","sod20","srb26","srb32","svw52","tal33","title case","wai4","wht2","words backwards"]],["has","name"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-d5e5012e","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","element","ell1","grm131","grm54","grm74","item number","jer11","jer27","lower case","lowercase","mel133","mel99","mge3","msh5","nru18","nru45","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","small letters","smh28","sod20","srb26","srb32","svw52","tal33","wai4","wht2","words backwards"]],["has","name"]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-d67ea551","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","dashes","element","ell1","grm131","grm54","grm74","hyphens","invert case","item number","jer11","jer27","kebab case","kebabcase","mel133","mel99","mge3","msh5","nru18","nru45","nth","position","rip34","ron22","sbr4","sle2","slug","smh28","sod20","srb26","srb32","svw52","swap case","tal33","toggle case","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-5a8d2523","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","dashes","element","ell1","grm131","grm54","grm74","hyphens","item number","jer11","jer27","kebab case","kebabcase","mel133","mel99","mge3","msh5","nth","position","rip34","ron22","sbr4","sle2","slug","smh28","sod20","srb32"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-8d0c53fc","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","element","ell1","grm131","grm54","grm74","item number","jer11","jer27","mel133","mel99","mge3","msh5","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","sod20","srb32","words backwards"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-2546d977","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-4739f0f7","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-549adde6","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","snake case","snakecase","sod20","svw52","tal33","underscores","variable name","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-76dbb462","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-a26ab4a0","guard":[["hasAny",["cgo7","cha27","class name","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","pascal case","pascalcase","position","rip34","ron22","sbr4","sle2","smh28","sod20","svw52","tal33","upper camel case","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-e8a15e5b","guard":[["hasAny",["camel case","camelcase","cgo7","cha27","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","lower camel case","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","svw52","tal33","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-01528ad8","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","dashes","each word","element","ell1","hyphens","item number","jer11","jer27","kebab case","kebabcase","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","slug","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.list",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-115b4987","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","distinct","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","remove duplicates","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","unique","wai4","wht2","without repeats","words"]],["has","name"]],"pyramid":["render.lines",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-17e1c7f2","guard":[["hasAny",["cgo7","cha27","class name","cte42","cte66","cte68","element","ell1","invert case","item number","jer11","jer27","mel133","mel99","mge3","nth","pascal case","pascalcase","position","rip34","ron22","sbr4","sle2","smh28","sod20","svw52","swap case","tal33","toggle case","upper camel case","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-2020807e","guard":[["hasAny",["cgo7","cha27","class name","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","pascal case","pascalcase","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","sod20","svw52","tal33","upper camel case","wai4","wht2","words backwards"]],["has","name"]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-253fffaa","guard":[["hasAny",["camel case","camelcase","cgo7","cha27","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","lower camel case","lower case","lowercase","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","small letters","smh28","sod20","svw52","tal33","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-2d50bfb1","guard":[["hasAny",["camel case","camelcase","capitalise","capitalize","capitalize each word","cgo7","cha27","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","lower camel case","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","svw52","tal33","title case","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-2efa2419","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","title case","wai4","wht2","words"]],["has","name"]],"pyramid":["render.and",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-358ebdc0","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","longest","longest one","longest word","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-3e3363b2","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","invert case","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","swap case","tal33","toggle case","wai4","wht2","words"]],["has","name"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-3f49719a","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words","words backwards"]],["has","name"]],"pyramid":["render.list",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-452df901","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","dashes","each word","element","ell1","hyphens","item number","jer11","jer27","kebab case","kebabcase","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","slug","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.and",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-46ca5284","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","lower case","lowercase","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","small letters","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.list",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-4d526ebc","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","distinct","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","remove duplicates","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","unique","wai4","wht2","without repeats","words"]],["has","name"]],"pyramid":["render.list",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-5ef2f337","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","element","ell1","invert case","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","snake case","snakecase","sod20","svw52","swap case","tal33","toggle case","underscores","variable name","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-66cd65c6","guard":[["hasAny",["all caps","capital letters","capitals","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","upper case","uppercase","wai4","wht2","words"]],["has","name"]],"pyramid":["render.and",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-6a0ee143","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","dashes","each word","element","ell1","hyphens","item number","jer11","jer27","kebab case","kebabcase","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","slug","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.lines",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-774ee692","guard":[["hasAny",["all caps","capital letters","capitals","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","upper case","uppercase","wai4","wht2","words"]],["has","name"]],"pyramid":["render.lines",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-78361060","guard":[["hasAny",["a to z","alphabetical","alphabetize","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","sort","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-7d73739d","guard":[["hasAny",["cgo7","cha27","class name","cte42","cte66","cte68","element","ell1","invert case","item number","jer11","jer27","mel133","mel99","mge3","nth","pascal case","pascalcase","position","rip34","ron22","sbr4","sle2","smh28","sod20","svw52","swap case","tal33","toggle case","upper camel case","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-7f4361e6","guard":[["hasAny",["a to z","alphabetical","alphabetize","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","sort","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-8111d0b1","guard":[["hasAny",["a to z","alphabetical","alphabetize","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","sort","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-82d3a51f","guard":[["hasAny",["all caps","camel case","camelcase","capital letters","capitals","cgo7","cha27","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","lower camel case","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","svw52","tal33","upper case","uppercase","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-830cfa29","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words","words backwards"]],["has","name"]],"pyramid":["render.lines",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-8db9f482","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","shortest","shortest one","shortest word","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-962941b2","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","invert case","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","swap case","tal33","toggle case","wai4","wht2","words"]],["has","name"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-a1117ef6","guard":[["hasAny",["backwards","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","reverse","reverse order","reversed","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-bc946a36","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","snake case","snakecase","sod20","svw52","tal33","underscores","variable name","wai4","wht2","words backwards"]],["has","name"]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-bf2dcb94","guard":[["hasAny",["camel case","camelcase","cgo7","cha27","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","lower camel case","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","snake case","snakecase","sod20","svw52","tal33","underscores","variable name","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.snake",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-c2a5014e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cgo7","cha27","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","snake case","snakecase","sod20","svw52","tal33","title case","underscores","variable name","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-c2c94a6b","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words","words backwards"]],["has","name"]],"pyramid":["render.and",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-c55a8de9","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","invert case","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","swap case","tal33","toggle case","wai4","wht2","words"]],["has","name"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-c8639cc6","guard":[["hasAny",["backwards","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","reverse","reverse order","reversed","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-cfbbae4f","guard":[["hasAny",["backwards","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","reverse","reverse order","reversed","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-d845905f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","title case","wai4","wht2","words"]],["has","name"]],"pyramid":["render.list",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-d8499ea0","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","distinct","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","remove duplicates","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","unique","wai4","wht2","without repeats","words"]],["has","name"]],"pyramid":["render.and",["transform.uniqueStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-e38228ba","guard":[["hasAny",["all caps","capital letters","capitals","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","upper case","uppercase","wai4","wht2","words"]],["has","name"]],"pyramid":["render.list",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-e3b68f66","guard":[["hasAny",["camel case","camelcase","cgo7","cha27","cte42","cte66","cte68","element","ell1","invert case","item number","jer11","jer27","lower camel case","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","svw52","swap case","tal33","toggle case","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-e6aeecb0","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","lower case","lowercase","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","small letters","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.lines",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-eb05501c","guard":[["hasAny",["camel case","camelcase","cgo7","cha27","cte42","cte66","cte68","element","ell1","invert case","item number","jer11","jer27","lower camel case","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","svw52","swap case","tal33","toggle case","wai4","wht2"]],["has","name"]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-f5da4260","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20","split into words","svw52","tal33","title case","wai4","wht2","words"]],["has","name"]],"pyramid":["render.lines",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-f661069b","guard":[["hasAny",["camel case","camelcase","cgo7","cha27","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","lower camel case","mel133","mel99","mge3","nth","position","reverse the words","reverse word order","rip34","ron22","sbr4","sle2","smh28","sod20","svw52","tal33","wai4","wht2","words backwards"]],["has","name"]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-f898acc5","guard":[["hasAny",["cgo7","cha27","cte42","cte66","cte68","each word","element","ell1","item number","jer11","jer27","lower case","lowercase","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","small letters","smh28","sod20","split into words","svw52","tal33","wai4","wht2","words"]],["has","name"]],"pyramid":["render.and",["transform.words",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]]],"mem":null},
{"id":"n-92b9bebc","guard":[["hasAny",["bcw15","ccf2","csc23","element","gpw47","grm131","grm54","grm74","grw30","item number","mcm17","mcm4","mds68","msh5","msm26","no vowels","nth","position","remove vowels","rly12","rwd1","sbr4","sdb105","smh28","srb32","thm15","vdk34","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-9e003777","guard":[["hasAny",["cgo7","cha27","characters from","cte42","cte68","dhu24","element","grm54","item number","jer11","jer27","laa12","laa31","letters from to","mel133","mel99","mlo12","nth","position","rip34","sbr4","sle2","slice of the text","sod20","substring","tal33"]],["has","name"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-4ac36828","guard":[["hasAny",["cgo7","cha27","class name","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","mel133","mel99","mge3","nth","pascal case","pascalcase","position","rip34","ron22","sbr4","sle2","smh28","sod20","upper camel case"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-4b9f84e3","guard":[["hasAny",["camel case","camelcase","cgo7","cha27","cte42","cte66","cte68","element","ell1","item number","jer11","jer27","lower camel case","mel133","mel99","mge3","nth","position","rip34","ron22","sbr4","sle2","smh28","sod20"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-c576b994","guard":[["hasAny",["brw11","brw19","brw38","brw82","crw47","element","item number","kbw2","longest","longest one","longest word","mcm2","ncw13","no vowels","nrk32","nth","position","remove vowels","rly6","sdb112","skw68","skw87","srb26","svw52","wcw3","wht2","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-b82c6d7c","guard":[["hasAny",["dashes","element","hyphens","item number","kebab case","kebabcase","longest","longest one","longest word","nru18","nru45","nth","position","slug","srb26","svw52","tal33","wai4","wht2"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-f7ffcbc8","guard":[["hasAny",["element","item number","longest","longest one","longest word","nru18","nru45","nth","position","reverse the words","reverse word order","srb26","svw52","tal33","wai4","wht2","words backwards"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-e8502879","guard":[["hasAny",["brw11","brw19","brw38","brw82","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Blackspring Ridge Wind."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-21556440","guard":[["hasAny",["camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","svw52","tal33","wai4","wht2"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-4832205a","guard":[["hasAny",["class name","element","item number","longest","longest one","longest word","nth","pascal case","pascalcase","position","svw52","tal33","upper camel case","wai4","wht2"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]]],"mem":null},
{"id":"n-94a19bba","guard":[["hasAny",["brw11","brw19","brw38","brw82","delete","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Blackspring Ridge Wind"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-03c4d5cc","guard":[["hasAny",["cte42","cte66","cte68","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Centennial."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-41ea6aaf","guard":[["hasAny",["element","grm131","grm54","grm74","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Gros-Morne."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-c4050ec4","guard":[["hasAny",["element","item number","nia26","nia51","nia57","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Niagara Region."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-19ecc83e","guard":[["hasAny",["cte42","cte66","cte68","delete","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Centennial"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-7a02606b","guard":[["hasAny",["delete","nia26","nia51","nia57","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Niagara Region"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-e6a87069","guard":[["hasAny",["delete","grm131","grm54","grm74","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Gros-Morne"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-0082f44a","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","uwf79","uwf82"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Underwood Wind Farm."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-62be4eed","guard":[["hasAny",["element","item number","longest","longest one","longest word","nru18","nru45","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Nicolas-Riou."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-bdb9495f","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","skw68","skw87"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is South Kent Wind Farm."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-c967c8b1","guard":[["hasAny",["element","item number","leo12","leo34","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is St. Leon."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-62b5c785","guard":[["hasAny",["element","item number","kii140","kii50","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is K2 Wind Power Facility."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-75ae869c","guard":[["hasAny",["cce18","cce52","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Le Nordais (Cap-Chat)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-8487a4e0","guard":[["hasAny",["element","hiw19","hiw34","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Henvey Inlet Wind Farm."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-91695748","guard":[["hasAny",["element","item number","laa12","laa31","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Lac Alfred."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-9627b519","guard":[["hasAny",["element","item number","jer11","jer27","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Jericho."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-e8ec0621","guard":[["hasAny",["element","item number","mcm17","mcm4","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mclean's Mountain."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-ec330bf4","guard":[["hasAny",["element","item number","mel133","mel99","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Melancthon."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-fc738fd4","guard":[["hasAny",["com22","com44","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Comber Wind Farm."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-0407ffa4","guard":[["hasAny",["cce18","cce52","delete","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Le Nordais (Cap-Chat)"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-04afdbc7","guard":[["hasAny",["com22","com44","delete","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Comber Wind Farm"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-0af3becf","guard":[["hasAny",["cce41","cce52","separate by","split by"]]],"pyramid":["render.list",["transform.split",{"lit":"Le Nordais (Cap-Chat)"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-0d70c697","guard":[["hasAny",["cce41","cce52","separate by","split by"]]],"pyramid":["render.and",["transform.split",{"lit":"Le Nordais (Cap-Chat)"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-1fb02b2a","guard":[["hasAny",["cce41","cce52","separate by","split by"]]],"pyramid":["render.lines",["transform.split",{"lit":"Le Nordais (Cap-Chat)"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-23818b8e","guard":[["hasAny",["delete","mcm17","mcm4","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Mclean's Mountain"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-29c62ef1","guard":[["hasAny",["delete","hiw19","hiw34","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Henvey Inlet Wind Farm"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-301b0612","guard":[["hasAny",["characters from","jer11","jer27","letters from to","slice of the text","substring"]],["has","name"]],"pyramid":["render.str",["transform.substr",{"lit":"Jericho"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-75556b69","guard":[["hasAny",["characters from","cte42","cte68","letters from to","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",{"lit":"Centennial"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-8e3b4193","guard":[["hasAny",["delete","jer11","jer27","strip out"]],["has","name"]],"pyramid":["render.str",["transform.remove",{"lit":"Jericho"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-910f8fb5","guard":[["hasAny",["delete","grm131","grm74","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Gros-Morne"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d2b2f31d","guard":[["hasAny",["cce41","cce52","delete","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Le Nordais (Cap-Chat)"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f2a81317","guard":[["hasAny",["delete","nia51","nia57","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Niagara Region"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-84c8d0ad","guard":[["hasAny",["element","item number","jer11","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Jericho"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}]]],"mem":null},
{"id":"n-1b552691","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wcw3"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is West Cape Wind Farm."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-1c054d23","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","srb26"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Saint-Robert-Bellarmin."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-23a5e03d","guard":[["hasAny",["dok14","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Dokie Ridge Wind Farm."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-24a6ddb5","guard":[["hasAny",["element","item number","kbw2","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Kent Breeze Wind Farm."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-43ac00b0","guard":[["hasAny",["element","els41","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is East Lake St. Clair Wind."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-4dc48475","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wai4"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Wainfleet."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-550859c9","guard":[["hasAny",["cce41","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Le Nordais (Cap-Chat)."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-608b7607","guard":[["hasAny",["amw48","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Armow Wind Project."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-68a1a111","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tal33"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Talbot."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-6bb50591","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","sdb112"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Seigneurie de Beaupré."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-6fc38d41","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wht2"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Whittington."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-70aa212c","guard":[["hasAny",["element","item number","longest","longest one","longest word","nri2","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is New Richmond."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-732da0b6","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Wolfe Island."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-86c73ec5","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","rly6"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Red Lily."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-8cff8360","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","svw52"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Summerview."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-9198c5e1","guard":[["hasAny",["element","item number","longest","longest one","longest word","ncw13","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is North Cape Wind Farm Phase 2."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-a3e20462","guard":[["hasAny",["bol25","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bow Lake Wind Project."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-a807e8d1","guard":[["hasAny",["element","item number","longest","longest one","longest word","nrk32","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is North Kent Wind Farm."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-b8bcd823","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","pwe124"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Prince Wind Energy Project."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-bf088561","guard":[["hasAny",["crw47","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Castle River Wind Farm."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-f79e6fd4","guard":[["hasAny",["element","item number","longest","longest one","longest word","mcm2","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mclean's Mountain."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-0d1b7e69","guard":[["hasAny",["element","era26","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is De l'Érable."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-15d22701","guard":[["hasAny",["element","item number","mds68","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Massif du Sud."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-18d51791","guard":[["hasAny",["bor5","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bornish Wind Energy Centre."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-1ab3aec9","guard":[["hasAny",["bcw15","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Bull Creek Wind Farm."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-1f0021d6","guard":[["hasAny",["element","item number","nth","position","srb32"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Saint-Robert-Bellarmin."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-1fd5bfc9","guard":[["hasAny",["element","item number","mlo12","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mont Louis."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-213258bb","guard":[["hasAny",["element","gpw47","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ghost Pine Wind Farm."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-26d6784c","guard":[["hasAny",["element","item number","nth","position","sod20"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Soderglen."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-2afec9b6","guard":[["hasAny",["element","item number","nth","position","rip34"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ripley."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-3100dcde","guard":[["hasAny",["element","item number","nri11","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is New Richmond."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-378bd40c","guard":[["hasAny",["element","item number","nth","position","ron22"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Roncevaux."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-3a6330d3","guard":[["hasAny",["element","item number","nth","position","rly12"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Red Lily."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-4302dc1a","guard":[["hasAny",["element","item number","msh5","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Montagne-Sèche."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-4c69e929","guard":[["hasAny",["duf47","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Dufferin Wind."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-4d7bd065","guard":[["hasAny",["dhu24","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Glen Dhu."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-51145721","guard":[["hasAny",["element","item number","mne53","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Le Nordais (Matane)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-56849c67","guard":[["hasAny",["element","item number","msm26","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Mont Sainte-Marguerite."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-5eaf138a","guard":[["hasAny",["csc23","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Cape Scott."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-6c86e53d","guard":[["hasAny",["element","grw30","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Grand Renewable Wind."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-7860fb07","guard":[["hasAny",["element","ell1","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ellershouse."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-7f1bb6c9","guard":[["hasAny",["awe8","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Adelaide Wind Energy Centre."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-8021973d","guard":[["hasAny",["element","item number","nth","position","sle2"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Sable."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-84196180","guard":[["hasAny",["element","item number","nth","position","rwd1"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ramea Wind Diesel."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-8c155d76","guard":[["hasAny",["element","item number","nth","position","soc9"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is South Canoe."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-90c755ad","guard":[["hasAny",["element","item number","mge3","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Montérégie."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-95317333","guard":[["hasAny",["element","item number","nth","position","sdb105"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Seigneurie de Beaupré."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-99c024e6","guard":[["hasAny",["element","item number","nth","position","sul9"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Jardin d'Éole (Saint-Ulric Saint-Léandre)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-a4cfe645","guard":[["hasAny",["element","item number","nth","position","thm15"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Marsh Line (Thames River I)."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-bc6127d8","guard":[["hasAny",["awf14","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Ardenville Wind Farm."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-ca708c87","guard":[["hasAny",["element","item number","nth","par9","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Pointes Aux Roches."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-cd88b949","guard":[["hasAny",["element","item number","nth","position","vdk34"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Vents du Kempt."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-cd89ac82","guard":[["hasAny",["element","gos34","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Goshen Wind Energy."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-cf958c25","guard":[["hasAny",["ccf2","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Clear Creek."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-d31daa1c","guard":[["hasAny",["element","item number","nth","position","wih32"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Wintering Hills."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-de74f03b","guard":[["hasAny",["element","els29","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is East Lake St. Clair Wind."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-e2f79320","guard":[["hasAny",["element","item number","nth","position","sbr4"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Sunbridge."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-eef0a13f","guard":[["hasAny",["element","item number","nth","position","wol82"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Wolfe Island."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-f1e5ce3b","guard":[["hasAny",["element","item number","nth","position","smh28"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Summerhaven."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-f2456506","guard":[["hasAny",["element","item number","nth","position","pwe35"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Prince Wind Energy Project."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-f24d0747","guard":[["hasAny",["cgo7","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Conestogo."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-f8518704","guard":[["hasAny",["cha27","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Chatham."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-fb8947b1","guard":[["hasAny",["element","euw50","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ",{"slot":2}," is Erieau Wind."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}]]],"mem":null},
{"id":"n-50d9f4f3","guard":[["hasAny",["characters from","element","item number","letters from to","nth","position","sle2","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-05652d0e","guard":[["hasAny",["element","item number","kbw2","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of KBW2 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-0c5743d2","guard":[["hasAny",["element","item number","longest","longest one","longest word","nri2","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NRI2 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-11e17aa0","guard":[["hasAny",["element","item number","longest","longest one","longest word","nru45","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NRU45 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-1c26ed01","guard":[["hasAny",["element","els41","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ELS41 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-1cee885a","guard":[["hasAny",["brw11","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BRW11 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-1d617f09","guard":[["hasAny",["brw19","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BRW19 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-1eb538b2","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wht2"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of WHT2 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-2552e6e0","guard":[["hasAny",["cce41","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CCE41 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-2740d9d0","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","svw52"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SVW52 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-314b2b2c","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","tal33"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of TAL33 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-5bfb9ad1","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","pwe124"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of PWE124 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-659061c3","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","rly6"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of RLY6 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-6ccc185a","guard":[["hasAny",["element","item number","longest","longest one","longest word","nrk32","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NRK32 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-6e084ea1","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","sdb112"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SDB112 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-784f91bf","guard":[["hasAny",["brw38","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BRW38 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-79867233","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wai4"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of WAI4 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-7a708f44","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wol84"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of WOL84 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-7ceaaf76","guard":[["hasAny",["element","item number","longest","longest one","longest word","ncw13","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NCW13 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-89b4c451","guard":[["hasAny",["element","item number","longest","longest one","longest word","nru18","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NRU18 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-8ba50c77","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","wcw3"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of WCW3 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-8bdbf3bc","guard":[["hasAny",["bol25","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BOL25 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-96db06dc","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","uwf79"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of UWF79 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-99a607ae","guard":[["hasAny",["element","item number","leo12","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of LEO12 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-a58434e5","guard":[["hasAny",["element","item number","leo34","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of LEO34 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-b0e1353a","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","srb26"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SRB26 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-b7223d11","guard":[["hasAny",["brw82","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BRW82 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-bf3f38d3","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","uwf82"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of UWF82 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-d7d3fbd1","guard":[["hasAny",["amw48","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of AMW48 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-d918d8b8","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","skw68"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SKW68 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-ea66162c","guard":[["hasAny",["crw47","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CRW47 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-efde42ba","guard":[["hasAny",["element","item number","longest","longest one","longest word","nth","position","skw87"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SKW87 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-f87b0465","guard":[["hasAny",["element","item number","longest","longest one","longest word","mcm2","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MCM2 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-fcacde7b","guard":[["hasAny",["dok14","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of DOK14 is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-0500ca04","guard":[["hasAny",["element","item number","nth","position","srb32"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SRB32 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-08adfc7f","guard":[["hasAny",["com44","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of COM44 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-08e71f69","guard":[["hasAny",["element","euw50","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of EUW50 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-0f61c947","guard":[["hasAny",["cgo7","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CGO7 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-10abd83e","guard":[["hasAny",["element","item number","mel133","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MEL133 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-17aec398","guard":[["hasAny",["element","item number","nth","position","rwd1"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of RWD1 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-1dc76ba3","guard":[["hasAny",["bor5","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BOR5 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-2a6e6e6e","guard":[["hasAny",["element","item number","mcm17","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MCM17 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-2aa82bed","guard":[["hasAny",["awe8","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of AWE8 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-305eeca3","guard":[["hasAny",["element","item number","mds68","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MDS68 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-31dc2800","guard":[["hasAny",["cce52","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CCE52 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-32ffc523","guard":[["hasAny",["element","item number","nia51","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NIA51 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-3c8c399d","guard":[["hasAny",["element","item number","nia26","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NIA26 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-402f2378","guard":[["hasAny",["element","item number","nth","par9","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of PAR9 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-414a4296","guard":[["hasAny",["element","item number","nth","position","smh28"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SMH28 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-4b86baa4","guard":[["hasAny",["element","item number","laa31","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of LAA31 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-4fb1822f","guard":[["hasAny",["element","hiw34","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of HIW34 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-52f89a17","guard":[["hasAny",["element","item number","nth","position","ron22"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of RON22 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-538862d9","guard":[["hasAny",["element","item number","nth","position","vdk34"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of VDK34 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-5a0fcb67","guard":[["hasAny",["element","item number","nth","position","thm15"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of THM15 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-5d998a58","guard":[["hasAny",["element","item number","jer11","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of JER11 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-642e4722","guard":[["hasAny",["element","item number","mne53","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MNE53 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-666c618e","guard":[["hasAny",["cce18","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CCE18 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-6b40d7cc","guard":[["hasAny",["element","ell1","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ELL1 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-6f770784","guard":[["hasAny",["element","item number","laa12","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of LAA12 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-71a7d9d7","guard":[["hasAny",["element","item number","mcm4","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MCM4 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-76d43e1e","guard":[["hasAny",["ccf2","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CCF2 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-7909b41c","guard":[["hasAny",["element","item number","nth","position","pwe35"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of PWE35 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-7e013031","guard":[["hasAny",["cte68","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CTE68 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-8003d69c","guard":[["hasAny",["element","item number","nth","position","sul9"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SUL9 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-87a2196a","guard":[["hasAny",["com22","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of COM22 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-8bed1411","guard":[["hasAny",["element","item number","nth","position","wol82"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of WOL82 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-90f00d8f","guard":[["hasAny",["element","item number","nth","position","sdb105"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SDB105 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-92a3c1e9","guard":[["hasAny",["element","item number","msm26","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MSM26 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-9668e1bf","guard":[["hasAny",["cte66","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CTE66 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-9e262574","guard":[["hasAny",["element","els29","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ELS29 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-9e4ef4fe","guard":[["hasAny",["element","gpw47","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GPW47 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-9e7c5d67","guard":[["hasAny",["element","item number","nth","position","sle2"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SLE2 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-a50ef2c9","guard":[["hasAny",["element","item number","kii140","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of KII140 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-a7807a99","guard":[["hasAny",["element","item number","nth","position","wih32"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of WIH32 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-ad76de14","guard":[["hasAny",["element","hiw19","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of HIW19 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-b126285f","guard":[["hasAny",["element","item number","nth","position","sod20"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SOD20 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-b3b891df","guard":[["hasAny",["element","item number","mge3","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MGE3 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-bb644757","guard":[["hasAny",["element","item number","mlo12","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MLO12 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-bc28490a","guard":[["hasAny",["duf47","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of DUF47 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-bc7e18bb","guard":[["hasAny",["dhu24","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of DHU24 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-bc8f869e","guard":[["hasAny",["cte42","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CTE42 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-c8175e7f","guard":[["hasAny",["element","item number","nth","position","soc9"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SOC9 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-c9e9c367","guard":[["hasAny",["element","item number","kii50","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of KII50 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-cac2c616","guard":[["hasAny",["element","grm131","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GRM131 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-cafc1a6e","guard":[["hasAny",["element","item number","nia57","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NIA57 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-cd353bc9","guard":[["hasAny",["element","item number","msh5","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MSH5 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-ce1c65a1","guard":[["hasAny",["cha27","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CHA27 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-cf13e2a2","guard":[["hasAny",["element","grm54","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GRM54 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-d8213497","guard":[["hasAny",["element","grw30","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GRW30 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-dd4502e1","guard":[["hasAny",["element","item number","mel99","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of MEL99 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-dfb8ec38","guard":[["hasAny",["csc23","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of CSC23 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-e086aa03","guard":[["hasAny",["bcw15","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of BCW15 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-e24c6d08","guard":[["hasAny",["element","item number","nth","position","sbr4"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of SBR4 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-e726d553","guard":[["hasAny",["element","item number","nth","position","rip34"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of RIP34 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-ed937e4c","guard":[["hasAny",["element","item number","jer27","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of JER27 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-f2858552","guard":[["hasAny",["element","item number","nth","position","rly12"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of RLY12 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-f2ae79e6","guard":[["hasAny",["element","item number","nri11","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of NRI11 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-f7c3515e","guard":[["hasAny",["awf14","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of AWF14 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-fc1c79f8","guard":[["hasAny",["element","era26","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of ERA26 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-fdfc2e5c","guard":[["hasAny",["element","gos34","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GOS34 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-fe75ceee","guard":[["hasAny",["element","grm74","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," of GRM74 is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":5}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"}],{"lit":1}],{"lit":"fr-tidytuesday-wind-turbine-fb3aeb"},{"lit":"turbine identifier"},{"lit":"project name"}]],"mem":null},
{"id":"n-01946dbb","guard":[["hasAny",["name","ncw13","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for NCW13":"The project name of NCW13 is North Cape Wind Farm Phase 2."}}},
{"id":"n-0306b443","guard":[["hasAny",["name","nia51","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of NIA51":"The project name of NIA51 is Niagara Region."}}},
{"id":"n-04dbc4e6","guard":[["hasAny",["name","project","sul9"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of SUL9":"The project name of SUL9 is Jardin d'Éole (Saint-Ulric Saint-Léandre)."}}},
{"id":"n-0627fe36","guard":[["hasAny",["identifier","kii50","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier KII50":"The project name of KII50 is K2 Wind Power Facility."}}},
{"id":"n-07c04ba6","guard":[["hasAny",["leo34","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for LEO34":"The project name of LEO34 is St. Leon."}}},
{"id":"n-0b1779d1","guard":[["hasAny",["cce52","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier CCE52":"The project name of CCE52 is Le Nordais (Cap-Chat)."}}},
{"id":"n-0e8fe1b3","guard":[["hasAny",["kbw2","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for KBW2":"The project name of KBW2 is Kent Breeze Wind Farm."}}},
{"id":"n-0f7f9b08","guard":[["hasAny",["grm54","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier GRM54":"The project name of GRM54 is Gros-Morne."}}},
{"id":"n-1337adb9","guard":[["hasAny",["name","nru45","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for NRU45":"The project name of NRU45 is Nicolas-Riou."}}},
{"id":"n-158c375f","guard":[["hasAny",["awf14","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier AWF14":"The project name of AWF14 is Ardenville Wind Farm."}}},
{"id":"n-178ea5db","guard":[["hasAny",["name","project","sdb105"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of SDB105":"The project name of SDB105 is Seigneurie de Beaupré."}}},
{"id":"n-20baca0c","guard":[["hasAny",["cte66","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of CTE66":"The project name of CTE66 is Centennial."}}},
{"id":"n-22f2ebf0","guard":[["hasAny",["name","nrk32","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for NRK32":"The project name of NRK32 is North Kent Wind Farm."}}},
{"id":"n-25b727c8","guard":[["hasAny",["amw48","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for AMW48":"The project name of AMW48 is Armow Wind Project."}}},
{"id":"n-2ccd4815","guard":[["hasAny",["mcm2","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for MCM2":"The project name of MCM2 is Mclean's Mountain."}}},
{"id":"n-2fc3cb39","guard":[["hasAny",["identifier","name","nia26","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier NIA26":"The project name of NIA26 is Niagara Region."}}},
{"id":"n-34b04842","guard":[["hasAny",["mge3","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of MGE3":"The project name of MGE3 is Montérégie."}}},
{"id":"n-34ba4a63","guard":[["hasAny",["name","project","pwe124"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for PWE124":"The project name of PWE124 is Prince Wind Energy Project."}}},
{"id":"n-36a84a03","guard":[["hasAny",["awe8","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier AWE8":"The project name of AWE8 is Adelaide Wind Energy Centre."}}},
{"id":"n-393a9e6d","guard":[["hasAny",["identifier","mel99","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier MEL99":"The project name of MEL99 is Melancthon."}}},
{"id":"n-3d263be2","guard":[["hasAny",["name","project","rly6"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for RLY6":"The project name of RLY6 is Red Lily."}}},
{"id":"n-3e6c2d38","guard":[["hasAny",["brw38","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for BRW38":"The project name of BRW38 is Blackspring Ridge Wind."}}},
{"id":"n-4093718c","guard":[["hasAny",["identifier","mds68","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier MDS68":"The project name of MDS68 is Massif du Sud."}}},
{"id":"n-44a6f7df","guard":[["hasAny",["bol25","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for BOL25":"The project name of BOL25 is Bow Lake Wind Project."}}},
{"id":"n-47a15426","guard":[["hasAny",["identifier","name","project","sbr4","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier SBR4":"The project name of SBR4 is Sunbridge."}}},
{"id":"n-48d7e2e9","guard":[["hasAny",["name","project","rip34"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of RIP34":"The project name of RIP34 is Ripley."}}},
{"id":"n-4d204427","guard":[["hasAny",["crw47","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for CRW47":"The project name of CRW47 is Castle River Wind Farm."}}},
{"id":"n-4d3e36a9","guard":[["hasAny",["grw30","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of GRW30":"The project name of GRW30 is Grand Renewable Wind."}}},
{"id":"n-4ead1c03","guard":[["hasAny",["brw19","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for BRW19":"The project name of BRW19 is Blackspring Ridge Wind."}}},
{"id":"n-4eb5aa76","guard":[["hasAny",["leo12","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for LEO12":"The project name of LEO12 is St. Leon."}}},
{"id":"n-56e34029","guard":[["hasAny",["identifier","mcm4","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier MCM4":"The project name of MCM4 is Mclean's Mountain."}}},
{"id":"n-56ec99ad","guard":[["hasAny",["euw50","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier EUW50":"The project name of EUW50 is Erieau Wind."}}},
{"id":"n-626e5ae4","guard":[["hasAny",["name","project","wol84"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for WOL84":"The project name of WOL84 is Wolfe Island."}}},
{"id":"n-657d1df9","guard":[["hasAny",["identifier","msm26","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier MSM26":"The project name of MSM26 is Mont Sainte-Marguerite."}}},
{"id":"n-67c3f2db","guard":[["hasAny",["name","project","uwf79"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for UWF79":"The project name of UWF79 is Underwood Wind Farm."}}},
{"id":"n-709625bc","guard":[["hasAny",["name","project","wih32"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of WIH32":"The project name of WIH32 is Wintering Hills."}}},
{"id":"n-715b2af9","guard":[["hasAny",["brw11","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for BRW11":"The project name of BRW11 is Blackspring Ridge Wind."}}},
{"id":"n-74b9ad38","guard":[["hasAny",["name","project","rwd1"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of RWD1":"The project name of RWD1 is Ramea Wind Diesel."}}},
{"id":"n-76f21bac","guard":[["hasAny",["ccf2","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of CCF2":"The project name of CCF2 is Clear Creek."}}},
{"id":"n-79b61a0a","guard":[["hasAny",["identifier","laa31","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier LAA31":"The project name of LAA31 is Lac Alfred."}}},
{"id":"n-7a75966d","guard":[["hasAny",["duf47","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of DUF47":"The project name of DUF47 is Dufferin Wind."}}},
{"id":"n-7b044e47","guard":[["hasAny",["identifier","name","project","srb32","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier SRB32":"The project name of SRB32 is Saint-Robert-Bellarmin."}}},
{"id":"n-7b332e7e","guard":[["hasAny",["identifier","kii140","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier KII140":"The project name of KII140 is K2 Wind Power Facility."}}},
{"id":"n-828340fc","guard":[["hasAny",["grm74","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of GRM74":"The project name of GRM74 is Gros-Morne."}}},
{"id":"n-82c468df","guard":[["hasAny",["mne53","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of MNE53":"The project name of MNE53 is Le Nordais (Matane)."}}},
{"id":"n-83fafb47","guard":[["hasAny",["name","project","wht2"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for WHT2":"The project name of WHT2 is Whittington."}}},
{"id":"n-869ea062","guard":[["hasAny",["name","project","uwf82"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for UWF82":"The project name of UWF82 is Underwood Wind Farm."}}},
{"id":"n-89474d40","guard":[["hasAny",["cce41","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for CCE41":"The project name of CCE41 is Le Nordais (Cap-Chat)."}}},
{"id":"n-8b93d46b","guard":[["hasAny",["identifier","mlo12","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier MLO12":"The project name of MLO12 is Mont Louis."}}},
{"id":"n-8e3422df","guard":[["hasAny",["ell1","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of ELL1":"The project name of ELL1 is Ellershouse."}}},
{"id":"n-93268eb7","guard":[["hasAny",["identifier","mel133","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier MEL133":"The project name of MEL133 is Melancthon."}}},
{"id":"n-958ea17c","guard":[["hasAny",["name","project","wcw3"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for WCW3":"The project name of WCW3 is West Cape Wind Farm."}}},
{"id":"n-987d1144","guard":[["hasAny",["name","project","sdb112"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for SDB112":"The project name of SDB112 is Seigneurie de Beaupré."}}},
{"id":"n-9a14a67f","guard":[["hasAny",["identifier","jer27","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier JER27":"The project name of JER27 is Jericho."}}},
{"id":"n-9a5e3ae1","guard":[["hasAny",["hiw19","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier HIW19":"The project name of HIW19 is Henvey Inlet Wind Farm."}}},
{"id":"n-9cfea195","guard":[["hasAny",["name","project","thm15"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of THM15":"The project name of THM15 is Marsh Line (Thames River I)."}}},
{"id":"n-9d50d164","guard":[["hasAny",["name","project","vdk34"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of VDK34":"The project name of VDK34 is Vents du Kempt."}}},
{"id":"n-9efde6eb","guard":[["hasAny",["name","project","sle2"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of SLE2":"The project name of SLE2 is Sable."}}},
{"id":"n-a19033e9","guard":[["hasAny",["csc23","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of CSC23":"The project name of CSC23 is Cape Scott."}}},
{"id":"n-a1d4e640","guard":[["hasAny",["hiw34","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier HIW34":"The project name of HIW34 is Henvey Inlet Wind Farm."}}},
{"id":"n-a414ccf9","guard":[["hasAny",["name","project","pwe35"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of PWE35":"The project name of PWE35 is Prince Wind Energy Project."}}},
{"id":"n-a437d046","guard":[["hasAny",["era26","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of ERA26":"The project name of ERA26 is De l'Érable."}}},
{"id":"n-a9184d7e","guard":[["hasAny",["cte68","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier CTE68":"The project name of CTE68 is Centennial."}}},
{"id":"n-abe32838","guard":[["hasAny",["identifier","name","nri11","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier NRI11":"The project name of NRI11 is New Richmond."}}},
{"id":"n-abf70b06","guard":[["hasAny",["bcw15","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier BCW15":"The project name of BCW15 is Bull Creek Wind Farm."}}},
{"id":"n-b16b8939","guard":[["hasAny",["bor5","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier BOR5":"The project name of BOR5 is Bornish Wind Energy Centre."}}},
{"id":"n-b38e1630","guard":[["hasAny",["els29","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of ELS29":"The project name of ELS29 is East Lake St. Clair Wind."}}},
{"id":"n-b48e54f5","guard":[["hasAny",["name","project","srb26"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for SRB26":"The project name of SRB26 is Saint-Robert-Bellarmin."}}},
{"id":"n-b4b897a2","guard":[["hasAny",["name","project","soc9"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of SOC9":"The project name of SOC9 is South Canoe."}}},
{"id":"n-bb56c91c","guard":[["hasAny",["cha27","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of CHA27":"The project name of CHA27 is Chatham."}}},
{"id":"n-bb6f3190","guard":[["hasAny",["dhu24","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier DHU24":"The project name of DHU24 is Glen Dhu."}}},
{"id":"n-bbb4eb10","guard":[["hasAny",["name","project","skw68"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for SKW68":"The project name of SKW68 is South Kent Wind Farm."}}},
{"id":"n-bf34eba7","guard":[["hasAny",["identifier","name","project","turbine","wol82"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier WOL82":"The project name of WOL82 is Wolfe Island."}}},
{"id":"n-c1f838aa","guard":[["hasAny",["msh5","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of MSH5":"The project name of MSH5 is Montagne-Sèche."}}},
{"id":"n-c1fd9ace","guard":[["hasAny",["identifier","laa12","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier LAA12":"The project name of LAA12 is Lac Alfred."}}},
{"id":"n-c3730a7a","guard":[["hasAny",["gos34","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of GOS34":"The project name of GOS34 is Goshen Wind Energy."}}},
{"id":"n-c71a47c5","guard":[["hasAny",["jer11","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of JER11":"The project name of JER11 is Jericho."}}},
{"id":"n-cc071edf","guard":[["hasAny",["cte42","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier CTE42":"The project name of CTE42 is Centennial."}}},
{"id":"n-d175f3c6","guard":[["hasAny",["identifier","mcm17","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier MCM17":"The project name of MCM17 is Mclean's Mountain."}}},
{"id":"n-d18d392f","guard":[["hasAny",["brw82","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for BRW82":"The project name of BRW82 is Blackspring Ridge Wind."}}},
{"id":"n-d1f90ee8","guard":[["hasAny",["dok14","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for DOK14":"The project name of DOK14 is Dokie Ridge Wind Farm."}}},
{"id":"n-d3942fe8","guard":[["hasAny",["identifier","name","project","sod20","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier SOD20":"The project name of SOD20 is Soderglen."}}},
{"id":"n-d3b61b32","guard":[["hasAny",["name","project","svw52"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for SVW52":"The project name of SVW52 is Summerview."}}},
{"id":"n-d5245d46","guard":[["hasAny",["name","project","skw87"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for SKW87":"The project name of SKW87 is South Kent Wind Farm."}}},
{"id":"n-d584b218","guard":[["hasAny",["com44","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier COM44":"The project name of COM44 is Comber Wind Farm."}}},
{"id":"n-d8750976","guard":[["hasAny",["name","nia57","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of NIA57":"The project name of NIA57 is Niagara Region."}}},
{"id":"n-d8c82f1e","guard":[["hasAny",["name","project","ron22"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of RON22":"The project name of RON22 is Roncevaux."}}},
{"id":"n-da0a39f9","guard":[["hasAny",["name","project","wai4"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for WAI4":"The project name of WAI4 is Wainfleet."}}},
{"id":"n-ded1ac33","guard":[["hasAny",["name","nri2","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for NRI2":"The project name of NRI2 is New Richmond."}}},
{"id":"n-e13ea34b","guard":[["hasAny",["grm131","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of GRM131":"The project name of GRM131 is Gros-Morne."}}},
{"id":"n-e6dadcf5","guard":[["hasAny",["cgo7","identifier","name","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier CGO7":"The project name of CGO7 is Conestogo."}}},
{"id":"n-e81e494d","guard":[["hasAny",["gpw47","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of GPW47":"The project name of GPW47 is Ghost Pine Wind Farm."}}},
{"id":"n-ebe0c07d","guard":[["hasAny",["els41","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for ELS41":"The project name of ELS41 is East Lake St. Clair Wind."}}},
{"id":"n-ed1ff313","guard":[["hasAny",["identifier","name","par9","project","turbine"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the project name of the turbine identifier PAR9":"The project name of PAR9 is Pointes Aux Roches."}}},
{"id":"n-f2a4c588","guard":[["hasAny",["name","project","smh28"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of SMH28":"The project name of SMH28 is Summerhaven."}}},
{"id":"n-f311fd1c","guard":[["hasAny",["name","project","tal33"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for TAL33":"The project name of TAL33 is Talbot."}}},
{"id":"n-fad2f7f9","guard":[["hasAny",["com22","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of COM22":"The project name of COM22 is Comber Wind Farm."}}},
{"id":"n-fbe18c0a","guard":[["hasAny",["name","project","rly12"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of RLY12":"The project name of RLY12 is Red Lily."}}},
{"id":"n-fc4956cc","guard":[["hasAny",["cce18","name","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the project name of CCE18":"The project name of CCE18 is Le Nordais (Cap-Chat)."}}},
{"id":"n-ffac05fc","guard":[["hasAny",["name","nru18","project"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the project name for NRU18":"The project name of NRU18 is Nicolas-Riou."}}},
{"id":"n-03000eb7","guard":[["hasAny",["cte66","delete","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Centennial"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-3e1276de","guard":[["hasAny",["cce18","delete","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Le Nordais (Cap-Chat)"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-42ce57ec","guard":[["hasAny",["delete","jer11","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Jericho"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-542f4d8d","guard":[["hasAny",["jer11","leading zeros","pad with","padded to","zero pad"]]],"pyramid":["render.str",["transform.padStart",{"lit":"Jericho"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-678c7854","guard":[["hasAny",["characters from","grm54","letters from to","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",{"lit":"Gros-Morne"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-685a7714","guard":[["hasAny",["delete","els29","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"East Lake St. Clair Wind"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-9712c9f2","guard":[["hasAny",["com22","delete","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Comber Wind Farm"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-a7573fda","guard":[["hasAny",["cce41","delete","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Le Nordais (Cap-Chat)"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-c0e43e19","guard":[["hasAny",["delete","els29","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"East Lake St. Clair Wind"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-e71c9129","guard":[["hasAny",["delete","els41","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"East Lake St. Clair Wind"},["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-ef5a040e","guard":[["hasAny",["delete","mcm2","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Mclean's Mountain"},["sense.after",{"lit":"for"}]]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"tell me the project name of the turbine identifier CCE52","expect":{"contains":["Le Nordais (Cap-Chat)"],"notRefusal":true}},{"q":"what is the project name of GPW47","expect":{"contains":["Ghost Pine Wind Farm"],"notRefusal":true}},{"q":"give the project name for SKW68","expect":{"contains":["South Kent Wind Farm"],"notRefusal":true}},{"q":"tell me the project name of the turbine identifier MCM4","expect":{"contains":["Mclean's Mountain"],"notRefusal":true}},{"q":"what is the project name of COM22","expect":{"contains":["Comber Wind Farm"],"notRefusal":true}},{"q":"give the project name for UWF82","expect":{"contains":["Underwood Wind Farm"],"notRefusal":true}},{"q":"tell me the project name of the turbine identifier HIW19","expect":{"contains":["Henvey Inlet Wind Farm"],"notRefusal":true}},{"q":"what is the project name of SMH28","expect":{"contains":["Summerhaven"],"notRefusal":true}},{"q":"tell me the project name of the turbine identifier HIW34","expect":{"contains":["Henvey Inlet Wind Farm"],"notRefusal":true}},{"q":"tell me the project name of the turbine identifier DHU24","expect":{"contains":["Glen Dhu"],"notRefusal":true}},{"q":"what is the project name of GOS34","expect":{"contains":["Goshen Wind Energy"],"notRefusal":true}},{"q":"what is the project name of CCF2","expect":{"contains":["Clear Creek"],"notRefusal":true}},{"q":"what is the project name of MNE53","expect":{"contains":["Le Nordais (Matane)"],"notRefusal":true}},{"q":"tell me the project name of the turbine identifier MSM26","expect":{"contains":["Mont Sainte-Marguerite"],"notRefusal":true}},{"q":"what is the project name of NIA51","expect":{"contains":["Niagara Region"],"notRefusal":true}},{"q":"tell me the project name of the turbine identifier LAA12","expect":{"contains":["Lac Alfred"],"notRefusal":true}},{"q":"what is the project name of CTE66","expect":{"contains":["Centennial"],"notRefusal":true}},{"q":"what is the project name of DUF47","expect":{"contains":["Dufferin Wind"],"notRefusal":true}},{"q":"tell me the project name of the turbine identifier EUW50","expect":{"contains":["Erieau Wind"],"notRefusal":true}},{"q":"what is the project name of RIP34","expect":{"contains":["Ripley"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
