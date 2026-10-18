// sucode-of-suname-ce4e-rev-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"sucode-of-suname-ce4e-rev-neo-g10","class":"sucode-of-suname-ce4e-rev","generation":10,"lane":"neo","grownFrom":["NUE is the sucode of which suname","name the suname whose sucode is EPW","name the suname whose sucode is CRF","name the suname whose sucode is RYA","which suname has the sucode MOQ","name the suname whose sucode is 428","which suname has the sucode 430","which suname has the sucode LEW","name the suname whose sucode is DEV","which suname has the sucode CYQ","which suname has the sucode 229","name the suname whose sucode is SIF","which suname has the sucode 803","name the suname whose sucode is VOV","HIL is the sucode of which suname","which suname has the sucode 083","which suname has the sucode MMN","NGZ is the sucode of which suname","name the suname whose sucode is BKO","which suname has the sucode YUC"],"version":1});

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
knowLoad([{"id":"fr-un-locode-subdivision-codes-0859f3","columns":["suname","sucountry","sucode"],"n":4678,"cols":[{"f":"0Canillo|0Encamp|0La Massana|0Ordino|0Sant Julià de Lòria|0Andorra la Vella|0Escaldes-Engordany|0Ajmān|1bū Z̧aby [Abu Dhabi]|0Dubayy [Dubai]|0Ash Shāriqah [Sharjah]|0Balkh|1āmyān|2dghīs|0Kandahār|1hōst|0Laghmān|0Nangarhār|0Panjshayr|0Samangān|2r-e Pul|0Wardak|0Zābul|0Saint George|6John|6Mary|6Paul|7eter|7hilip|0Barbuda|0Redonda|0Berat|0Dibër|0Vlorë|0Aragac̣otn|3rat|2mavir|0Erevan|0Geġark'unik'|0Kotayk'|0Loṙi|0Syunik'|0Tavuš|0Vayoć Jor|0Bengo|0Cabinda|1uanza‐Sul|0Huambo|2íla|0Malange|0Namibe|0Salta|0Buenos Aires|0Ciudad Autónoma de Buenos Aires|0San Luis|0Entre Ríos|0La Rioja|0Santiago del Estero|0Chaco|0San Juan|0Catamarca|0La Pampa|0Mendoza|1isiones|0Formosa|0Neuquén|0Río Negro|0Santa Fe|0Tucumán|0Chubut|0Tierra del Fuego|0Corrientes|1órdoba|0Jujuy|0Santa Cruz|0Burgenland|0Kärnten|0Niederösterreich|0Oberösterreich|0Salzburg|1teiermark|0Tirol|0Vorarlberg|0Wien|0Australian Capital Territory|0Northern Territory|0South Australia|0Tasmania|0Western Australia|0Abşeron|1ğdaş|2su|1stara|0Bakı|1iləsuvar|0Cəlilabad|0Daşkəsən|0Gəncə|0Kəlbəcər|0Lənkəran|8|1erik|0Masallı|1ingəçevir|0Naftalan|2xçıvan|8|0Şəki|4|0Salyan|1umqayıt|0Şirvan|0Tərtər|0Ucar|0Xankəndi|0Yardımlı|1evlax|6|0Zəngilan|0Federacija Bosne i Hercegovine|0Brčko distrikt|0Christ Church|0Saint Andrew|6James|7oseph|6Thomas|0Bandarban|0Dhaka|1inajpur|0Faridpur|1eni|0Gopalganj|1azipur|2ibandha|0Habiganj|0Jamalpur|2shore|1henaidah|1oypurhat|1halakathi|0Kishoreganj|1hulna|1urigram|1hagrachhari|1ushtia|0Lakshmipur|2lmonirhat|0Manikganj|1ymensingh|1unshiganj|1adaripur|2gura|1oulvibazar|1eherpur|0Narayanganj|1etrakona|1arsingdi|3ail|2tore|0Chapai Nawabganj|0Nilphamari|1oakhali|1aogaon|0Pabna|1irojpur|1atuakhali|2nchagarh|0Rajbari|3shahi|2ngpur|4amati|0Sherpur|1atkhira|1irajganj|1ylhet|1unamganj|1hariatpur|0Tangail|1hakurgaon|0Bruxelles-Capitale, Région de|0Limburg|1uxembourg|0Balé|2nwa|0Comoé|0Kénédougou|1ossi|0Loroum|0Mouhoun|0Nayala|1oumbiel|0Oudalan|0Passoré|0Soum|3rou|0Blagoevgrad|0Montana|0Ruse|0Al ‘Āşimah|1sh Shamālīyah|0Bubanza|2jumbura Rural|aMairie|2ruri|0Cankuzo|1ibitoke|0Gitega|0Kirundo|1aruzi|2yanza|0Makamba|1uramvya|1waro|1uyinga|0Ngozi|0Rumonge|0Atacora|1libori|1tlantique|0Borgou|0Collines|0Donga|0Couffo|0Littoral|0Mono|0Ouémé|0Plateau|0Zou|0Belait|0Temburong|1utong|0El Beni|0La Paz|0Oruro|0Bonaire|0Sint Eustatius|0Acre|1mazonas|3pá|0Ceará|0Espírito Santo|0Goiás|0Minas Gerais|1ato Grosso do Sul|b|0Pará|3aíba|1ernambuco|1iauí|1araná|0Rio de Janeiro|4Grande do Norte|1ondônia|2raima|1io Grande do Sul|0Santa Catarina|1ão Paulo|0Tocantins|0Acklins|0Bimini|1erry Islands|0Crooked Island and Long Cay|1entral Andros|0East Grand Bahama|0Grand Cay|0Harbour Island|0Inagua|0Mangrove Cay|0North Eleuthera|6Abaco|1ew Providence|1orth Andros|0Rum Cay|1agged Island|0South Abaco|1an Salvador|1panish Wells|0Paro|0Trashi Yangtse|0Central|1hobe|0Francistown|0Ghanzi|0Kgalagadi|3tleng|1weneng|0North East|6West|0South East|5ern|2wa Town|0Bresckaja voblasć (be) - Brestskaja oblast' (ru)|0Horad Minsk|2myel'skaya voblasts' (be) - Gomel'skaya oblast' (ru)|1rodzyenskaya voblasts' (be) - Grodnenskaya oblast' (ru)|0Vitsyebskaya voblasts' (be) - Vitebskaya oblast' (ru)|0Belize|0Orange Walk|0Toledo|0Alberta|0British Columbia|0Manitoba|0New Brunswick|3foundland and Labrador|1unavut|0Ontario|0Saskatchewan|0Kongo Central|0Bas-Uélé|0Haut-Katanga|5Lomami|5Uélé|0Kasaï Central|6Oriental|1inshasa|1asaï|0Lualaba|0Mai-Ndombe|0Nord-Kivu|0Tanganyika|0Ouham|0Basse-Kotto|0Gribingui|0Ombella-Mpoko|0Nana-Mambéré|0Sangha|0Bouenza|0Plateaux|0Aargau (de)|1ppenzell Innerrhoden (de)|0Basel-Stadt (de)|0Genève (fr)|1larus (de)|0Jura (fr)|0Sankt Gallen (de)|1chwyz (de)|0Thurgau (de)|1icino (it)|0Valais (fr)|0Zug (de)|1ürich (de)|0Abidjan|0Comoé|0Denguélé|0Gôh-Djiboua|0Lacs|2gunes|0Savanes|0Vallée du Bandama|0Woroba|0Aisén del General Carlos Ibañez del Campo|1ntofagasta|1tacama|0Los Ríos|0Maule|0Adamaoua|0Centre|0Far North|0Littoral|0South-West|0Anhui Sheng|0Beijing Shi|0Gansu Sheng|1uizhou Sheng|0Henan Sheng|1ubei Sheng|1ebei Sheng|1unan Sheng|0Jilin Sheng|2angsu Sheng|0Shandong Sheng|3anxi Sheng|0Amazonas|1ntioquia|0Bolívar|0Casanare|0Distrito Capital de Bogotá|0Guainía|0Magdalena|0Norte de Santander|0Quindío|0Santander|1ucre|0Alajuela|0San José|0Pinar del Río|0Brava|1oa Vista|0Santa Cruz|0Porto Novo|0Ribeira Brava|8Grande|0São Filipe|1al|0Tarrafal de São Nicolau|0Lefkosia|0Praha, Hlavní město|0Olomoucký kraj|0Zlínský kraj|0Moravskoslezský kraj|0Brandenburg|1aden-Württemberg|0Hamburg|0Mecklenburg-Vorpommern|0Niedersachsen|0Thüringen|0Arta|1li Sabieh|0Dikhil|1jibouti|0Nordjylland|0Midtjylland|0Syddanmark|0Hovedstaden|0Sjælland|1aint Andrew|6David|6Mark|6Patrick|0Distrito Nacional (Santo Domingo)|0Adrar|1zuay|0Imbabura|0Harjumaa|0Pärnumaa|0Saaremaa|0Tartumaa|0Võrumaa|0AI Iskandarīyah|1l Baḩr al Aḩmar|4uḩayrah|0Banī Suwayf|0Ad Daqahlīyah|1I Ismā 'īlīyah|1sh Sharqīyah|0Shamāl Sīnā'|0‘Anseba|0Gash-Barka|0Alicante / Alacant|0Cáceres|1uenca|0Granada|1uadalajara|0León|0Ourense [Orense]|0Illes Balears [Islas Baleares]|0Pontevedra [Pontevedra]|0Valladolid|0Zamora|0Ādīs Ābeba|1far|0Sīdama|0Ahvenanmaan maakunta|0Ba|0Kosrae|0Ain|0Nord|0Hautes-Pyrénées|0Pyrénées-Orientales|0Bas-Rhin|0Rhône|0Haute-Saône|0Savoie|1eine-Maritime|6et-Marne|0Yvelines|0Vienne|0Yonne|0Territoire de Belfort|0Essonne|0Hauts-de-Seine|0Seine-Saint-Denis|0Val-de-Marne|5'Oise|0Estuaire|0Armagh City, Banbridge and Craigavon|0Bath and North East Somerset|1rent|2omley|0Cambridgeshire|1heshire East|0Durham, County|0Kirklees|0Manchester|0Neath Port Talbot [Castell-nedd Port Talbot GB-CTL]|0Tameside|1orbay|0West Berkshire|1igan|0Saint Andrew|0Abkhazia|0Imeret'i|0Kakhet'i|1'vemo K'art'li|0Mts'khet'a-Mt'ianet'i|0T'bilisi|0Greater Accra|0Central|0Eastern|0Northern|0Oti|0Western North|7|0Avannaata Kommunia|0Kommune Kujalleq|0Banjul|1eyla|0Dabola|2laba|0Faranah|1orécariah|0Kindia|0Mandiana|0Yomou|0Annobón|0Bioko Norte|0Anatolikí Makedonía kai Thráki|0Guatemala|0Bafatá|0Quinara|0Barima-Waini|0Demerara-Mahaica|0East Berbice-Corentyne|0Potaro-Siparuni|0Upper Demerara-Berbice|6Takutu-Upper Essequibo|0Atlántida|0Colón|0Francisco Morazán|0Islas de la Bahía|0La Paz|0Ocotepeque|0Santa Bárbara|0Zagrebačka županija|0Artibonite|0Nord|0Ouest|0Sud|0Baranya|0Fejér|0Kecskemét|0Nyíregyháza|0Pécs|0Veszprém|0Zalaegerszeg|0Aceh|0Banten|0Jambi|2wa Timur|2karta Raya|0Clare|1avan|0Longford|1imerick|1eitrim|0Meath|0Offaly|0Waterford|0Al Janūbī|1ndaman and Nicobar Islands|0Chhattīsgarh|0Dādra and Nagar Haveli and Damān and Diu|0Gujarāt|0Himāchal Pradesh|0Jhārkhand|1ammu and Kashmīr|0Mizoram|0Punjab|0Tamil Nādu|1ripura|0AI Anbār|0Baghdād|0Dahūk|0Al Qādisīyah|0Markazī|0Höfuðborgarsvæði|0Valle d'Aosta / Vallée d'Aoste (fr)|0Bari|0Campobasso|0Forlì-Cesena|0Messina|0Pavia|0Ravenna|1eggio Emilia|0Verona|1iterbo|0Kingston|0‘Ajlūn|0Hokkaidô [Hokkaido]|0Baringo|1usia|1atken|2nteay Mean Choăy [Bântéay Méan Choăy]|0Gilbert Islands|0Anjouan|0Christ Church Nichola Town|0Phyeongyang|0Seoul-teukbyeolsi [Seoul]|0Al Aḩmadī|1bay oblysy|1lmaty|1ttapu [Attapeu]|0Khammouan [Khammuane]|0Phôngsali [Phongsaly]|0Vientiane|0Aakkâr|1nse la Raye|0Choiseul|0Balzers|2snāhira paḷāta|1ong|0Grand Kru|1barpolu|0Maryland|2seru|0Akmenė|0Marijampolės apskritis|0Vilniaus Apskritis|0Capellen|0Echternach|0Redange|0Wiltz|0Aizkraukles novads (Aizkraukle)|1lūksnes novads (Alūksne)|0Ādažu novads (Ādaži)|0Balvu novads (Balvi)|2uskas novads (Bauska)|0Cēsu novads (Cēsis)|0Dobeles novads (Dobele)|0Gulbenes novads (Gulbene)|0Jelgavas novads (Jelgava)|1ēkabpils novads (Jēkabpils)|0Kraslavas novads (Krāslava)|1uldīgas novads (Kuldīga)|0Ķekavas novads (Ķekava)|0Limbažu novads (Limbaži)|1īvānu novads (Līvāni)|1udzas novads (Ludza)|0Madonas novads (Madona)|1ārupes novads (Mārupe)|0Ogres novads (Ogre)|1laines novads (Olaine)|0Preilu novads (Preiļi)|0Rēzeknes novads (Rēzekne)|1opažu novads (Ropaži)|0Salaspils novads (Salaspils)|3dus novads (Saldus)|2ulkrastu novads (Saulkrasti)|1iguldas novads (Sigulda)|1miltenes novads (Smiltene)|0Talsu novads (Talsi)|1ukuma novads (Tukums)|0Valkas novads (Valka)|1entspils novads (Ventspils)|0Augšdaugavas novads (Augšdaugava)|0Dienvidkurzemes novads (Dienvidkurzeme)|0Valmieras novads (Valmiera)|0Banghāzī|0Darnah|0Al Jabal al Gharbī|0Tanger-Tétouan-Al Hoceïma|0Chtouka-Ait Baha|0El Kelâa des Sraghna|0Kelaat Sraghna|0Safi|0Taounate|0La Colle|0Anenii Noi|0Bender [Tighina]|0Călăraşi|0Edineţ|0Floreşti|0Ialoveni|0Ungheni|0Andrijevica|0Toamasina|0Ailuk|1ur|0Jaluit|0Veles|0Gradsko|0Demir Kapija|0Kavadarci|0Lozovo|0Rosoman|0Sveti Nikole|0Čaška|0Berovo|0Vinica|0Delčevo|0Zrnovci|0Karbinci|1očani|0Makedonska Kamenica|0Pehčevo|1robištip|0Češinovo-Obleševo|0Štip|0Vevčani|0Debar|5ca|0Kičevo|0Makedonski Brod|0Ohrid|0Plasnica|0Struga|0Centar Župa|0Bogdanci|2silovo|0Valandovo|2silevo|0Gevgelija|0Dojran|0Konče|0Novo Selo|0Radoviš|0Strumica|0Kayes|0Sagaing|0Orhon|0Darhan uul|0Hentiy|1ovd|0Uvs|0Selenge|1ühbaatar|0Ömnögovĭ|1vörhangay|0Dzavhan|1ornod|5govĭ|0Govĭ‐Sümber|4-Altay|0Bayanhongor|5-Ölgiy|0Hodh ech Chargui|0Attard|1galega Islands|1lifu Dhaalu|0Balaka|0Mwanza|0Aguascalientes|0Querétaro|0Johor|0Niaosa|0Gaza|0Maputo|6|0Zambezi|0Otjozondjupa|1maheke|2usati|0Agadez|1bia|1tlántico Norte|0Drenthe|0Noord-Holland|0Oslo|0Pradesh 1|0Aiwo|1uckland|0Canterbury|0Janūb al Bāţinah|0Bocas del Toro|0Amazonas|0La Libertad|0Chimbu|0National Capital Région (Manila)|0La Union|0Pampanga|0Balochistan|0Dolnośląskie|0Bethlehem|0Aveiro|0Beja|0Aimeliik|2rai|1ngaur|0Kayangel|1oror|0Melekeok|0Ngarchelong|4dmau|3tpang|2chesar|2eremlengui|2iwal|0Concepción|0Ad Dawhah|0Umm Şalāl|0Alba|0Hunedoara|0Ialomiţa|0Beograd|0Adygeya, Respublika|0Ville de Kigali|0Ar Riyād|0Central|0Anse aux Pins|0Saint Louis|0Wasaţ Dārfūr|0Stockholms län|0Central Singapore|0Ascension|1jdovščina|0Sevnica|1lovenske Konjice|1tarše|1veti Jurij ob Ščavnic|0Šenčur|3tilj|4jernej|5ur|1kocjan|3fja Loka|4ljica|1marje pri Jelšah|4tno ob Paki|1oštanj|0Ankaran|0Banskobystrický kraj|0Trenčiansky kraj|0Eastern|0North Western|0Acquaviva|0Diourbel|0Awdal|0Brokopondo|0Northern Bahr el Ghazal|0Eastern Equatoria|0Água Grande|0Ahuachapán|0Dimashq|0Idlib|0Hhohho|0Batha|0Centrale|0Krung Thep Maha Nakhon [Bangkok]|0Dushanbe|0Aileu|1hal|0Tunis|0'Eua|0Adana|1rima|0Chaguanas|0Funafuti|0Changhua|2iayi|0Hsinchu|0Arusha|0Vinnytska oblast|0Kalangala|0Johnston Atoll (ISO reserved code = JT)|0Alaska|0Florida|0North Carolina|0Artigas|0Flores|0Andijon|0Toshkent|0Charlotte|0Distrito Capital|0Lai Châu|0Malampa|0A'ana|1byan|0Eastern Cape|0Western|0Bulawayo|0Al Fujayrah|0Ra’s al Khaymah|0Umm al Qaywayn|0Badakhshān|2ghlān|0Dāykundī|0Farāh|1āryāb|0Ghaznī|2ōr|0Helmand|2rāt|0Jowzjān|0Kunaṟ|3duz|1ābul|2pīsā|0Lōgar|0Nīmrōz|1ūristān|0Paktiyā|4īkā|2rwān|0Takhār|0Urūzgān|0Durrës|0Elbasan|0Fier|0Gjirokastër|0Korçë|1ukës|0Lezhë|0Shkodër|0Tiranë|0Širak|0Benguela|1ié|0Cuando Cubango|4za‐Norte|2nene|0Luanda|2nda Sul|5‐Norte|0Moxico|0Uíge|0Zaire|0New South Wales|0Queensland|0Victoria|0Ağcabədi|2dam|2stafa|0Babək|2lakən|1eyləqan|1ərdə|0Culfa|1əbrayıl|0Füzuli|0Goranboy|1öygöl|3çay|1ədəbəy|0Hacıqabul|0Kürdəmir|1ǝngǝrli|0Laçın|0Neftçala|0Ordubad|1ğuz|0Qax|2zax|1obustan|1uba|4dlı|2sar|1əbələ|0Saatlı|2birabad|2mux|1iyəzən|1ədərək|0Tovuz|0Xaçmaz|1ocalı|4vənd|1ızı|0Zaqatala|1ərdab|0İmişli|1smayıllı|0Şabran|2hbuz|2maxı|1uşa|1əmkir|2rur|0Republika Srpska|0Saint George|6John|6Lucy|6Michael|6Peter|7hilip|0Bagerhat|2rguna|3ishal|1hola|1ogura|1rahmanbaria|0Chandpur|3ttogram|2uadanga|1ox's Bazar|1umilla|0Antwerpen|0Brabant wallon|0Hainaut|0Liège|0Namur|0Oost-Vlaanderen|0Vlaams Brabant|0West-Vlaanderen|0Bam|2zègaga|1ougouriba|3lgou|4kiemdé|0Ganzourgou|1nagna|1ourma|0Houet|0Ioba|0Kadiogo|1omondjari|3pienga|2ulpélogo|3ritenga|4wéogo|0Léraba|0Nahouri|2mentenga|0Oubritenga|0Poni|0Sanguié|3matenga|1issili|1éno|0Tapoa|1uy|0Yagha|2tenga|0Ziro|1ondoma|2undwéogo|0Burgas|0Dobrich|0Gabrovo|0Haskovo|0Kardzhali|1justendil|0Lovech|0Pazardzik|1ernik|1leven|2ovdiv|0Razgrad|0Shumen|1ilistra|1liven|1molyan|1ofia|5 (stolitsa)|1tara Zagora|0Targovishte|0Varna|1eliko Tarnovo|1idin|1ratsa|0Yambol|0Al Janūbīyah|3Muḩarraq|0Rutana|2yigi|0Brunei dan -Muara|0Chuquisaca|1ochabamba|0Pando|1otosí|0Santa Cruz|0Tarija|0Saba|0Alagoas|0Bahia|0Distrito Federal|0Maranhão|0Sergipe|0Black Point|0Cat Island|1entral Abaco|8Eleuthera|1ity of Freeport|0Exuma|0Hope Town|0Long Island|0Mayaguana|1oore's Island|0South Andros|6Eleuthera|0West Grand Bahama|0Bumthang|0Chhukha|0Dagana|0Gasa|0Haa|0Lhuentse|0Monggar|0Pema Gatshel|1unakha|0Samdrup Jongkhar|3tse|2rpang|0Thimphu|1rashigang|2ongsa|1sirang|0Wangdue Phodrang|0Zhemgang|0Gaborone|0Jwaneng|0Lobatse|0Selibe Phikwe|0Mahilyowskaya voblasts' (be) - Mogilevskaya oblast' (ru)|1inskaya voblasts' (be) - Minskaya oblast' (ru)|0Cayo|1orozal|0Stann Creek|0Northwest Territories|2va Scotia|0Prince Edward Island|0Quebec|0Yukon|0Ituri|0Kwango|2ilu|0Lomami|0Maniema|1ongala|0Nord-Ubangi|0Sankuru|1ud-Kivu|4Ubangi|0Tshopo|3uapa|0Équateur|0Bamingui-Bangoran|2ngui|0Haut-Mbomou|4e-Kotto|0Kémo‐Gribingui|0Lobaye|0Mambéré-Kadéï|1bomou|0Ouaka|2ham-Pendé|0Vakaga|0Brazzaville|0Cuvette|7-Ouest|0Kouilou|0Likouala|1ékoumou|0Niari|0Pointe-Noire|2ol|0Sangha|0Appenzell Ausserrhoden (de)|0Basel-Landschaft (de)|1ern (de)|0Fribourg (fr)|0Graubünden (de)|0Luzern (de)|0Neuchâtel (fr)|1idwalden (de)|0Obwalden (de)|0Schaffhausen (de)|1olothurn (de)|0Uri (de)|0Vaud (fr)|0Bas-Sassandra|0Montagnes|0Sassandra-Marahoué|0Yamoussoukro|0Zanzan|0Arica y Parinacota|0Biobío|0Coquimbo|0La Araucanía|1ibertador General Bernardo O'Higgins|1os Lagos|0Magallanes|0Región Metropolitana de Santiago|0Tarapacá|0Valparaíso|0Ñuble|0East|0North|5-West|0South|0West|0Chongqing Shi|0Fujian Sheng|0Guangdong Sheng|5xi Zhuangzu Zizhiqu|0Hainan Sheng|1eilongjiang Sheng|1ong Kong SAR|0Jiangxi Sheng|0Liaoning Sheng|0Macao SAR|0Nei Mongol Zizhiqu|1ingxia Huizu Zizhiqu|0Qinghai Sheng|0Shanghai Shi|4xi Sheng|1ichuan Sheng|0Taiwan Sheng|1ianjin Shi|0Xinjiang Uygur Zizhiqu|2zang Zizhiqu|0Yunnan Sheng|0Zhejiang Sheng|0Arauca|1tlántico|0Boyacá|0Caldas|2quetá|2uca|1esar|1hocó|1undinamarca|1órdoba|0Guaviare|0Huila|0La Guajira|0Meta|0Nariño|0Putumayo|0Risaralda|0San Andrés, Providencia y Santa Catalina|0Tolima|0Valle del Cauca|2upés|1ichada|0Cartago|0Guanacaste|0Heredia|0Limón|0Puntarenas|0Artemisa|0Camagüey|1iego de Ávila|3nfuegos|2udad de La Habana|0Granma|1uantánamo|0Holguín|0Isla de la Juventud|0La Habana|2s Tunas|0Matanzas|2yabeque|0Sancti Spíritus|3tiago de Cuba|0Villa Clara|0Maio|1osteiros|0Paul|1raia|0Ribeira Grande de Santiago|0Santa Catarina|e do Fogo|1ão Domingos|4Lourenço dos Órgãos|4Miguel|4Salvador do Mundo|4Vicente|0Tarrafal|0Ammochostos|0Keryneia|0Larnaka|1emesos|0Pafos|0Jihomoravský kraj|4český kraj|0Karlovarský kraj|1raj Vysočina|2álovéhradecký kraj|0Liberecký kraj|0Pardubický kraj|1lzeňský kraj|0Středočeský kraj|0Ústecký kraj|0Bayern|1erlin|1remen|0Hessen|0Nordrhein-Westfalen|0Rheinland-Pfalz|0Saarland|2chsen|7-Anhalt|1chleswig-Holstein|0Obock|0Tadjourah|0Saint George|6John|8seph|6Luke|6Paul|7eter|0Azua|0Baoruco|2rahona|0Cibao Nordeste|9oeste|9te|6Sur|0Dajabón|1uarte|0El Seibo|3Valle|2ías Piña|1nriquillo|1spaillat|0Hato Mayor|1ermanas Mirabal|1iguamo|0Independencia|0La Altagracia|3Romana|3Vega|0María Trinidad Sánchez|1onseñor Nouel|3te Cristi|6Plata|0Ozama|0Pedernales|2ravia|1uerto Plata|0Samaná|2n Cristóbal|4José de Ocoa|5uan|4Pedro de Macorís|3tiago|8 Rodríguez|4o Domingo|1ánchez Ramírez|0Valdesia|3verde|0Yuma|0Alger|1nnaba|1ïn Defla|4Témouchent|0Batna|1iskra|1lida|1ordj Badji Mokhtar|7ou Arréridj|2uira|3merdès|1échar|2jaïa|2ni Abbès|0Chlef|1onstantine|0Djanet|2elfa|0El Bayadh|3Meghaier|5niaa|3Oued|3Tarf|0Ghardaïa|1uelma|0Illizi|1n Guezzam|3Salah|0Jijel|0Khenchela|0Laghouat|0M'sila|1ascara|1ila|1ostaganem|1édéa|0Naama|0Oran|1uargla|2led Djellal|2m el Bouaghi|0Relizane|0Saïda|1idi Bel Abbès|1kikda|1ouk Ahras|1étif|0Tamanrasset|1iaret|2mimoun|2ndouf|2paza|2ssemsilt|2zi Ouzou|1lemcen|1ouggourt|1ébessa|0Bolívar|0Carchi|2ñar|1himborazo|1otopaxi|0El Oro|1smeraldas|0Galápagos|1uayas|0Loja|2s Ríos|0Manabí|1orona-Santiago|0Napo|0Orellana|0Pastaza|1ichincha|0Santa Elena|4o Domingo de los Tsáchilas|1ucumbíos|0Tungurahua|0Zamora Chinchipe|0Hiiumaa|0Ida-Virumaa|0Järvamaa|1õgevamaa|0Lääne-Virumaa|5maa|0Põlvamaa|0Raplamaa|0Valgamaa|1iljandimaa|0AI Fayyūm|3Gharbīyah|3Jīzah|3Minyā|6ūfīyah|3Qalyūbīyah|4āhirah|3Wādī al Jadīd|1l Uqşur|1s Suways|2wān|2yūţ|0Būr Sa'īd|0Dumyāţ|0Janūb Sīnā'|0Kafr ash Shaykh|0Maţrūh|0Qinā|0Sūhāj|0Debub|5awi K’eyyĭḥ Baḥri|0Ma’ĭkel|0Semienawi K’eyyĭḥ Baḥri|0A Coruña [La Coruña]|1lbacete|2mería|1sturias|0Badajoz|2rcelona [Barcelona]|1iskaia|1urgos|0Cantabria|2stellón / Castelló|1euta|1iudad Real|1ádiz|1órdoba|0Gipuzkoa|2rona [Gerona]|0Huelva|3sca|0Jaén|0La Rioja|2s Palmas|1leida [Lérida]|1ugo [Lugo]|0Madrid|1elilla|1urcia|1álaga|0Navarra / Nafarroa|0Palencia|0Salamanca|2nta Cruz de Tenerife|1egovia|2villa|1oria|0Tarragona [Tarragona]|1eruel|1oledo|0Valencia / València|0Zaragoza|0Álava / Araba|1vila|0Bīnshangul Gumuz|0Dirē Dawa|0Gambēla Hizboch|0Hārerī Hizb|0Oromīya|0Sumalē|0Tigray|0YeDebub Bihēroch Bihēreseboch na Hizboch|8M‘irab Ītyop’iya Hizboch|0Āmara|0Etelä-Karjala|6Pohjanmaa|6Savo|0Kainuu|2nta-Häme|1eski-Pohjanmaa|6Suomi|1ymenlaakso|0Lappi|0Pirkanmaa|1ohjanmaa|4ois-Karjala|8Pohjanmaa|8Savo|1äijät-Häme|0Satakunta|0Uusimaa|0Varsinais-Suomi|0Bua|0Cakaudrove|0Kadavu|0Lau|1omaiviti|0Macuata|0Nadroga and Navosa|2itasiri|2mosi|0Ra|1ewa|1otuma|0Serua|0Tailevu|0Chuuk|0Pohnpei|0Yap|0Aisne|1llier|2pes-Maritimes|6de-Haute-Provence|2sace|1rdennes|3èche|2iège|1ube|2de|1veyron|0Bouches-du-Rhône|0Calvados|2ntal|1harente|8-Maritime|2er|1orrèze|3se|5-du-Sud|1reuse|1ôte-d'Or|4s-d'Armor|0Deux-Sèvres|1ordogne|2ubs|1rôme|0Eure|4-et-Loir|0Finistère|0Gard|1ers|1ironde|0Haut-Rhin|4e-Corse|6Garonne|6Loire|6Marne|6Savoie|6Vienne|5s-Alpes|1érault|0Ille-et-Vilaine|1ndre|5-et-Loire|1sère|0Jura|0Landes|1oir-et-Cher|4e|5-Atlantique|5t|2t|3-et-Garonne|2zère|0Maine-et-Loire|2nche|2rne|2yenne|1eurthe-et-Moselle|3se|1orbihan|2selle|1étropole de Lyon|0Nièvre|0Oise|1rne|0Paris|2s-de-Calais|1uy-de-Dôme|1yrénées-Atlantiques|0Sarthe|2ône-et-Loire|1omme|0Tarn|4-et-Garonne|0Var|2ucluse|1endée|1osges|0Haut-Ogooué|0Moyen-Ogooué|0Ngounié|1yanga|0Ogooué-Ivindo|7Lolo|7Maritime|0Woleu-Ntem|0Aberdeen City|8shire|1ngus|2trim and Newtownabbey|1rds and North Down|2gyll and Bute|0Barking and Dagenham|3net|4sley|1edford|2lfast City|2xley|1irmingham|1lackburn with Darwen|5pool|3enau Gwent|1olton|2urnemouth, Christchurch and Poole|1racknell Forest|3dford|2idgend [Pen-y-bont ar Ogwr GB-POG]|3ghton and Hove|3stol, City of|1uckinghamshire|2ry|0Caerphilly [Caerffili GB-CAF]|2lderdale|2mden|2rdiff [Caerdydd GB-CRD]|3marthenshire [Sir Gaerfyrddin GB-GFY]|2useway Coast and Glens|1entral Bedfordshire|2redigion [Sir Ceredigion]|1heshire West and Chester|1lackmannanshire|1onwy|2rnwall|2ventry|1roydon|1umbria|0Darlington|1enbighshire [Sir Ddinbych GB-DDB]|2rby|5shire|3ry and Strabane|2von|1oncaster|2rset|1udley|2mfries and Galloway|2ndee City|0Ealing|2st Ayrshire|5Dunbartonshire|5Lothian|5Renfrewshire|6iding of Yorkshire|5Sussex|1dinburgh, City of|1ilean Siar|1nfield|1ssex|0Falkirk|1ermanagh and Omagh|1ife|1lintshire [Sir y Fflint GB-FFL]|0Gateshead|1lasgow City|2oucestershire|1reenwich|1wynedd|0Hackney|2lton|2mmersmith and Fulham|3pshire|2ringey|3row|3tlepool|2vering|1erefordshire|3tfordshire|1ighland|2llingdon|1ounslow|0Inverclyde|1sle of Anglesey [Sir Ynys Môn GB-YNM]|8Wight|4s of Scilly|3ington|0Kensington and Chelsea|3t|1ingston upon Hull|eThames|1nowsley|0Lambeth|2ncashire|1eeds|2icester|9shire|2wisham|1incolnshire|2sburn and Castlereagh|2verpool|1ondon, City of|1uton|0Medway|2rthyr Tydfil [Merthyr Tudful GB-MTU]|4on|1id and East Antrim|3-Ulster|3dlesbrough|3lothian|2lton Keynes|1onmouthshire [Sir Fynwy GB-FYN]|2ray|0Newcastle upon Tyne|3ham|3port [Casnewydd GB-CNW]|3ry, Mourne and Down|1orfolk|3th Ayrshire|6East Lincolnshire|6Lanarkshire|7incolnshire|6Northamptonshire|6Somerset|6Tyneside|6Yorkshire|5umberland|2ttingham|ashire|0Oldham|1rkney Islands|1xfordshire|0Pembrokeshire [Sir Benfro GB-BNF]|2rth and Kinross|2terborough|1lymouth|1ortsmouth|2wys|0Reading|2dbridge|3car and Cleveland|2nfrewshire|1hondda Cynon Taff [Rhondda CynonTaf]|1ichmond upon Thames|1ochdale|2therham|1utland|0Salford|2ndwell|1cottish Borders|1efton|1heffield|3tland Islands|2ropshire|1lough|1olihull|2merset|2uth Ayrshire|6Gloucestershire|6Lanarkshire|6Tyneside|5ampton|5end-on-Sea|5wark|1t. Helens|2affordshire|2irling|2ockport|5ton-on-Tees|3ke-on-Trent|1uffolk|2nderland|2rrey|2tton|1wansea [Abertawe GB-ATA]|2indon|0Telford and Wrekin|1hurrock|1orfaen [Tor-faen]|2wer Hamlets|1rafford|0Vale of Glamorgan, The [Bro Morgannwg GB-BMG]|0Wakefield|2lsall|3tham Forest|2ndsworth|2rrington|3wickshire|1est Dunbartonshire|5Lothian|5Northamptonshire|5Sussex|4minster|1iltshire|2ndsor and Maidenhead|2rral|1okingham|2lverhampton|2rcestershire|1rexham [Wrecsam GB-WRC]|0York|0Saint David|6George|6John|6Mark|6Patrick|1outhern Grenadine Islands|0Ajaria|0Guria|0Racha-Lech’khumi-K’vemo Svanet’i|0Samegrelo-Zemo Svanet'i|3ts'khe-Javakhet'i|1hida K'art'li|0Ahafo|1shanti|0Bono|4 East|0North East|0Savannah|0Upper East|6West|0Volta|0Kommune Qeqertalik|7qarfik Sermersooq|0Qeqqata Kommunia|0Central River|0Lower River|0North Bank|0Upper River|0Western|0Boffa|2ké|0Coyah|0Dinguiraye|1ubréka|0Fria|0Gaoual|1uékédou|0Kankan|1issidougou|1oubia|3ndara|3roussa|1érouané|0Labé|1ola|1élouma|0Macenta|2li|2mou|0Nzérékoré|0Pita|0Siguiri|0Tougué|1élimélé|0Bioko Sur|0Centro Sur|0Djibloho|0Kié‐Ntem|0Litoral|0Wele‐Nzas|0Attikí|0Dytiki Makedonia|5í Elláda|0Ionía Nísia|0Kentrikí Makedonía|1ríti|0Nótio Aigaío|0Pelopónnisos|0Stereá Elláda|0Thessalía|0Vóreio Aigaío|0Ípeiros|0Alta Verapaz|0Baja Verapaz|0Chimaltenango|3quimula|0El Progreso|1scuintla|0Huehuetenango|0Izabal|0Jalapa|1utiapa|0Petén|0Quetzaltenango|2iché|0Retalhuleu|0Sacatepéquez|2n Marcos|3ta Rosa|1ololá|1uchitepéquez|0Totonicapán|0Zacapa|0Biombo|2ssau|1olama/Bijagós|0Cacheu|0Gabú|0Oio|0Tombali|0Cuyuni-Mazaruni|0Essequibo Islands-West Demerara|0Mahaica-Berbice|0Pomeroon-Supenaam|0Choluteca|1omayagua|2pán|2rtés|0El Paraíso|0Gracias a Dios|0Intibucá|0Lempira|0Olancho|0Valle|0Yoro|0Bjelovarsko-bilogorska županija|1rodsko-posavska županija|0Dubrovačko-neretvanska županija|0Grad Zagreb|0Istarska županija|0Karlovačka županija|1oprivničko-križevačka županija|1rapinsko-zagorska županija|0Ličko-senjska županija|0Međimurska županija|0Osječko-baranjska županija|0Požeško-slavonska županija|1rimorsko-goranska županija|0Sisačko-moslavačka županija|1plitsko-dalmatinska županija|0Varaždinska županija|1irovitičko-podravska županija|1ukovarsko-srijemska županija|0Zadarska županija|0Šibensko-kninska županija|0Centre|0Grande’Anse|0Nippes|1ord-Est|5Ouest|0Sud-Est|0Borsod-Abaúj-Zemplén|1udapest|1ács-Kiskun|1ékés|5csaba|0Csongrád‐Csanád|0Debrecen|1unaújváros|0Eger|0Győr|4‐Moson‐Sopron|0Hajdú-Bihar|1eves|1ódmezővásárhely|0Jász-Nagykun-Szolnok|0Kaposvár|1omárom-Esztergom|0Miskolc|0Nagykanizsa|1ógrád|0Pest|0Salgótarján|1omogy|2pron|1zabolcs-Szatmár-Bereg|2eged|3kszárd|2olnok|3mbathely|2ékesfehérvár|0Tatabánya|1olna|0Vas|1eszprém|0Zala|0Érd|0Bali|1engkulu|0Gorontalo|0Jawa Barat|5Tengah|0Kalimantan Barat|bSelatan|bTengah|cimur|bUtara|1epulauan Bangka Belitung|aRiau|0Lampung|0Maluku|6 Utara|0Nusa Tenggara Barat|eTimur|0Papua|5 Barat|6Pengunungan|6Selatan|6Tengah|0Riau|0Sulawesi Barat|9Selatan|9Tengah|dgara|9Utara|2matera Barat|9Selatan|9Utara|0Yogyakarta|0Carlow|1ork|0Donegal|1ublin|0Galway|0Kerry|1ildare|3kenny|0Laois|1outh|0Mayo|1onaghan|0Roscommon|0Sligo|0Tipperary|0Westmeath|2xford|1icklow|0Al Awsaţ|1sh Shamālī|0H̱efa|0Tel-Aviv|0Yerushalayim|0Andhra Pradesh|1runāchal Pradesh|1ssam|0Bihār|0Chandīgarh|0Delhi|0Goa|0Haryāna|0Jammu and Kashmīr|0Karnātaka|1erala|0Ladākh|2kshadweep|0Madhya Pradesh|2hārāshtra|2nipur|1eghālaya|0Nāgāland|0Odisha|0Puducherry|0Rājasthān|0Sikkim|0Telangāna|0Uttar Pradesh|5ākhand|0West Bengal|0AI Muthanná|1l Başrah|1n Najaf|1rbīl|1s Sulaymānīyah|0Bābil|0Dhī Qār|1iyālá|0Karbalā'|1irkūk|0Maysān|0Nīnawá|0Wāsiţ|0Şalāh ad Dīn|0Alborz|1rdabīl|0Būshehr|0Chahār Maḩāl va Bakhtīārī|0Eşfahān|0Fārs|0Golestān|1īlān|0Hamadān|1ormozgān|0Kermān|6shāh|1horāsān-e Jonūbī|bRaẕavī|bShomālī|2ūzestān|1ohgīlūyeh va Bowyer Aḩmad|2rdestān|0Lorestān|0Māzandarān|0Qazvīn|1om|0Semnān|1īstān va Balūchestān|0Tehrān|0Yazd|0Zanjān|0ĀZarbāyjān-e Gharbī|dSharqī|0Īlām|0Austurland|0Norðurland eystra|bvestra|0Suðurland|5nes|0Vestfirðir|4urland|0Agrigento|1lessandria|1ncona|1rezzo|1scoli Piceno|2ti|1vellino|0Barletta-Andria-Trani|1elluno|2nevento|2rgamo|1iella|1ologna|3zano / Bozen (de)|1rescia|2indisi|0Cagliari|2ltanissetta|2serta|2tania|5zaro|1hieti|1omo|2senza|1remona|2otone|1uneo|0Enna|0Fermo|3rara|1irenze|1oggia|1rosinone|0Genova|1orizia|1rosseto|0Imperia|1sernia|0L'Aquila|1a Spezia|2tina|1ecce|4o|1ivorno|1odi|1ucca|0Macerata|2ntova|2ssa-Carrara|2tera|1ilano|1odena|2nza e Brianza|0Napoli|1ovara|1uoro|0Oristano|0Padova|2lermo|2rma|1erugia|2saro e Urbino|3cara|1iacenza|2sa|3toia|1ordenone|2tenza|1rato|0Ragusa|1eggio Calabria|1ieti|2mini|1oma|2vigo|0Salerno|2ssari|2vona|1iena|2racusa|1ondrio|1ud Sardegna|0Taranto|1eramo|3ni|1orino|1rapani|2ento|3viso|2ieste|0Udine|0Varese|1enezia|2rbano-Cusio-Ossola|3celli|1ibo Valentia|2cenza|0Clarendon|0Hanover|0Manchester|0Portland|0Saint Andrew|8n|6Catherine|6Elizabeth|6James|6Mary|6Thomas|0Trelawny|0Westmoreland|0AI Karak|3Mafraq|1l Balqā’|3‘Aqabah|5̅şimah|1z Zarqā’|1ţ Ţafīlah|0Irbid|0Jarash|0Ma‘ān|1ādaba|0Aiti [Aichi]|1kita|1omori|0Ehime|0Gihu [Gifu]|1unma|0Hirosima [Hiroshima]|1ukui [Fukui]|4oka [Fukuoka]|4sima [Fukushima]|1yôgo [Kyoto]|5[Hyogo]|0Ibaraki|1sikawa [Ishikawa]|1wate|0Kagawa|3osima [Kagoshima]|2nagawa|1umamoto|1ôti [Kochi]|0Mie|2yagi|4zaki|0Nagano|4saki|2ra|1iigata|0Okayama|2inawa|0Saga|2itama|1iga [Shiga]|2mane [Shimane]|2zuoka [Shizuoka]|0Tiba [Chiba]|1okusima [Tokushima]|2tigi [Tochigi]|3tori|2yama|1ôkyô [Tokyo]|0Wakayama|0Yamagata|5uti [Yamaguchi]|4nasi [Yamanashi]|0Ôita [Oita]|1saka [Osaka]|0Bomet|1ungoma|0Elgeyo/Marakwet|1mbu|0Garissa|0Homa Bay|0Isiolo|0Kajiado|2kamega|1ericho|1iambu|2lifi|2rinyaga|2sii|3umu|2tui|1wale|0Laikipia|2mu|0Machakos|2kueni|2ndera|2rsabit|1eru|1igori|1ombasa|1urang'a|0Nairobi City|2kuru|2ndi|2rok|1yamira|3ndarua|2eri|0Samburu|1iaya|0Taita/Taveta|2na River|1haraka-Nithi|1rans Nzoia|1urkana|0Uasin Gishu|0Vihiga|0Wajir|1est Pokot|0Bishkek Shaary|0Chüy|0Jalal-Abad|0Naryn|0Osh|3 Shaary|0Talas|0Ysyk-Köl|0Baat Dambang [Bătdâmbâng]|0Kampong Chaam [Kâmpóng Cham]|ahnang [Kâmpóng Chhnăng]|8Spueu [Kâmpóng Spœ]|8Thum [Kâmpóng Thum]|5t [Kâmpôt]|2ndaal [Kândal]|2oh Kong [Kaôh Kŏng]|1eb [Kêb]|1racheh [Krâchéh]|0Mondol Kiri [Môndól Kiri]|0Otdar Mean Chey [Ŏtdâr Méan Choăy]|0Pailin [Pailĭn]|1hnom Penh [Phnum Pénh]|1ousaat [Poŭthĭsăt]|1reah Sihanouk [Preăh Seihânŭ]|6Vihear [Preăh Vihéar]|3y Veaeng [Prey Vêng]|0Rotanak Kiri [Rôtânôkiri]|0Siem Reab [Siĕmréab]|1tueng Traeng [Stoĕng Trêng]|1vaay Rieng [Svay Riĕng]|0Taakaev [Takêv]|1bong Khmum|0Line Islands|0Phoenix Islands|0Grande Comore|0Mohéli|0Saint Anne Sandy Point|6George Basseterre|dGingerland|6James Windward|7ohn Capisterre|bFigtree|6Mary Cayon|6Paul Capisterre|charlestown|7eter Basseterre|6Thomas Lowland|dMiddle Island|0Trinity Palmetto Point|0Hamkyeongnamto|9pukto|1wanghainamto|8pukto|0Jakangto|0Kaeseong|2ngweonto|0Namp’o|0Phyeongannamto|9pukto|0Rasǒn|1yanggang-do|0Busan Gwang'yeogsi [Pusan‐Kwangyǒkshi]|0Chungcheongbugdo [Ch'ungch'ŏngbuk-do]|bnamdo [Ch'ungch'ŏngnam-do]|0Daegu Gwang'yeogsi [Taegu‐Kwangyǒkshi]|3jeon Gwang'yeogsi [Taejǒn‐Kwangyǒkshi]|0Gang'weondo [Kang-won-do]|1wangju Gwang'yeogsi [Kwangju‐Kwangyǒkshi]|1yeonggido [Kyŏnggi-do]|6sangbugdo [Kyŏngsangbuk-do]|anamdo [Kyŏngsangnam-do]|0Incheon Gwang'yeogsi [Incheon]|0Jeju-teukbyeoljachido [Jeju]|2onrabugdo [Chŏllabuk-do]|6namdo [Chŏllanam-do]|0Sejong|0Ulsan Gwang'yeogsi [Ulsan-Kwangyŏkshi]|0Al Farwānīyah|3Jahrā’|3‘Āşimah|0Mubārak al Kabīr|0Ḩawallī|0Almaty oblysy|1qmola oblysy|2töbe oblysy|1tyraū oblysy|0Batys Qazaqstan oblysy|0Mangghystaū oblysy|0Nur‐Sultan|0Pavlodar oblysy|0Qaraghandy oblysy|1ostanay oblysy|1yzylorda oblysy|0Shyghys Qazaqstan oblysy|1oltüstik Qazaqstan oblysy|0Türkistan oblysy|0Ulytaū oblysy|0Zhambyl oblysy|2etisū oblysy|0Šimkent|0Bokèo|2likhamxai [Borikhamxay]|0Champasak [Champasack]|0Houaphan [Huaphanh]|0Louang Namtha [Luangnamtha]|6phabang [Luangprabang]|0Oudômxai [Oudomxay]|0Salavan [Saravane]|2vannakhét [Savannakhet]|0Vientiane|0Xaignabouli [Xayabury]|3sômboun [Xaysomboon]|1iangkhouang [Xiengkhuang]|1ékong [Sekong]|0Baalbek-Hermel|1eyrouth|0El Béqaa|0Liban‐Nord|6Sud|0Mont‐Liban|0Nabatîyé|0Canaries|2stries|0Dennery|0Gros Islet|0Laborie|0Micoud|0Soufrière|0Vieux Fort|0Eschen|0Gamprin|0Mauren|0Planken|0Ruggell|0Schaan|3ellenberg|0Triesen|7berg|0Vaduz|0Ampara|1nuradhapura|0Badulla|2tticaloa|0Colombo|0Dakuṇu paḷāta|0Galle|2mpaha|0Hambantota|0Jaffna|0Kalutara|2ndy|1egalla|1ilinochchi|1urunegala|0Madhyama paḷāta|2nnar|2tale|4ra|1onaragala|1ullaittivu|0Nuwara Eliya|1æ̆gĕnahira paḷāta|0Polonnaruwa|1uttalam|0Ratnapura|0Sabaragamuva paḷāta|0Trincomalee|0Uturu paḷāta|5mæ̆da paḷāta|0Vavuniya|2yamba paḷāta|0Ūva paḷāta|0Bomi|0Grand Bassa|6Cape Mount|6Gedeh|0Lofa|0Margibi|1ontserrado|0Nimba|0River Cess|6Gee|0Sinoe|0Berea|1otha-Bothe|0Leribe|0Mafeteng|1ohale's Hoek|2khotlong|0Qacha's Nek|1uthing|0Thaba-Tseka|0Alytaus Apskritis|8miestas|4us|1nykščiai|0Birštonas|3žai|0Druskininkai|0Elektrénai|0Ignalina|0Jonava|3iškis|1urbarkas|0Kaišiadorys|2lvarija|2unas|4o Apskritis|6miestas|2zlų Rūdos|1elmė|1laipėda|7os apskritis|amiestas|1retinga|1upiškis|1ėdainiai|0Lazdijai|0Marijampolė|2žeikiai|1olėtai|0Neringa|0Pagégiai|2kruojis|2langos miestas|2nevėžio apskritis|amiestas|7ys|2svalys|1lungė|1rienai|0Radviliškis|2seiniai|1ietavas|1okiškis|0Skuodas|0Tauragė|7s apskritis|1elšiai|5ų Apskritis|1rakai|0Ukmergė|1tena|4os Apskritis|0Varėna|1ilkaviškis|3niaus miestas|5us|2saginas|0Zarasai|0Šakiai|2lčininkai|1iauliai|6ų Apskritis|8miestas|2lalė|3utė|2rvintos|1venčionys|0Clervaux|0Diekirch|0Esch-sur-Alzette|0Gréivemaacher|0Luxembourg|0Mersch|0Remich|0Vianden|0Daugavpils|0Jelgava|1ūrmala|0Liepāja|0Rēzekne|1īga|0Ventspils|0Al Buţnān|3Jabal al Akhḑar|5fārah|4ufrah|3Kufrah|3Marj|6qab|3Wāḩāt|1n Nuqaţ al Khams|1z Zāwiyah|0Ghāt|0Mişrātah|1urzuq|0Nālūt|0Sabhā|1urt|0Wādī al Hayāt|6sh Shāţiʾ|0Ţarābulus|0Agadir-Ida-Ou-Tanane|1l Haouz|4oceïma|1ousserd|1ssa-Zag (EH-partial)|1zilal|0Beni Mellal|3slimane|2rkane|3rechid|1oujdour (EH)|3lemane|1éni Mellal-Khénifra|0Casablanca [Dar el Beïda]*|a-Settat|1hefchaouene|2ichaoua|2touka-Ait Baha|0Dakhla-Oued Ed-Dahab (EH)|1riouch|2âa-Tafilalet|0El Hajeb|3Jadida|3Kelâa des Sraghna|1rrachidia|1s-Semara (EH-partial)|2saouira|0Fahs-Anjra|1iguig|1quih Ben Salah|1ès|3- Meknès|0Guelmim|7-Oued Noun (EH-partial)|3rcif|0Ifrane|1nezgane-Ait Melloul|0Jerada|0Kelaat Sraghna|1houribga|2émisset|3nifra|1énitra|0L'Oriental|1arache|2âyoune|8-Sakia El Hamra (EH-partial)|0Marrakech|9-Medina|cnara|aSafi|1eknès*|1idelt|1ohammadia|2ulay Yacoub|1édiouna|1’diq-Fnideq|0Nador|1ouaceur|0Ouarzazate|2ed Ed-Dahab (EH)|3zzane|2jda‐Angad|0Rabat|5-Salé-Kénitra|1ehamna|0Salé|1efrou|2ttat|1idi Bennour|5Ifni|5Kacem|5Slimane|5Youssef Ben Ali|1khirate-Témara|1ouss-Massa|0Tan-Tan|3ger‐Assilah|2ourirt|2rfaya (EH-partial)|3oudannt|2ta|2za|1inghir|2znit|1étouan*|0Youssoufia|0Zagora|0Fontvieille|0Jardin Exotique|0La Condamine|3Gare|3Source|2rvotto|0Malbousquet|1onaco‐Ville|3eghetti|3te‐Carlo|2ulins|0Port‐Hercule|0Sainte‐Dévote|5‐Roman|1pélugues|0Vallon de la Rousse|0Basarabeasca|1riceni|1ălţi|0Cahul|2ntemir|1hişinău|1imişlia|1riuleni|1ăuşeni|0Donduşeni|1rochia|1ubăsari|0Făleşti|0Glodeni|1ăgăuzia, Unitatea teritorialăautonomă (UTAG)|0Hînceşti|0Leova|0Nisporeni|0Ocniþa|1rhei|0Rezina|1îşcani|0Soroca|1trăşeni|2înga Nistrului, unitatea teritorială din|1îngerei|0Taraclia|1eleneşti|0Şoldăneşti|1tefan Vodă|0Bar|1erane|1ijelo Polje|1udva|0Cetinje|0Danilovgrad|0Gusinje|0Herceg-Novi|0Kolašin|2tor|0Mojkovac|0Nikšić|0Petnjica|1lav|2jevlja|2užine|1odgorica|0Rožaje|0Tivat|1uzi|0Ulcinj|0Šavnik|0Žabljak|0Antananarivo|3siranana|0Fianarantsoa|0Mahajanga|0Toliara|0Ailinglaplap|1rno|0Bikini & Kili|0Ebon|1newetak & Ujelang|0Jabat|0Kwajalein|0Lae|1ib|2kiep|0Majuro|2loelap|1ejit|1ili|0Namdrik|3u|0Ralik chain|2tak chain|1ongelap|0Ujae|1trik|0Wotho|3je|0Aerodrom|1račinovo|0Bitola|1ogovinje|1rvenica|1utel|0Centar|0Demir Hisar|1olneni|0Gazi Baba|1jorče Petrov|1ostivar|0Ilinden|0Jegunovce|0Karbinci|3poš|1isela Voda|1ratovo|2iva Palanka|4ogaštani|2uševo|1umanovo|0Lipkovo|0Mavrovo-i-Rostuša|1ogila|0Negotino|1ovaci|0Petrovec|1rilep|0Rankovce|1esen|0Saraj|1opište|1taro Nagoričane|2udeničani|0Tearce|2tovo|0Vrapčište|0Zelenikovo|0Čair|1učer Sandevo|0Šuto Orizari|0Želino|0Bamako|0Gao|0Kidal|1oulikoro|0Mopti|1énaka|0Sikasso|1égou|0Taoudénit|1ombouctou|0Ayeyarwady|0Bago|0Chin|0Kachin|2yah|3in|0Magway|2ndalay|1on|0Nay Pyi Taw|0Rakhine|0Shan|0Tanintharyi|0Yangon|0Arhangay|0Bulgan|0Dundgovĭ|0Hövagöl|0Töv|0Ulaanbaatar|0Adrar|1ssaba|0Brakna|0Dakhlet Nouâdhibou|0Gorgol|1uidimaka|0Hodh el Gharbi|0Inchiri|0Nouakchott Nord|bOuest|bSud|0Tagant|1iris Zemmour|1rarza|0Balzan|1irgu|3kirkara|3żebbuġa|1ormla|0Dingli|0Fgura|1loriana|1ontana|0Gudja|1ħajnsielem|3rb|4għur|3sri|3xaq|1żira|0Iklin|1sla|0Kalkara|1erċem|1irkop|0Lija|1uqa|0Marsa|5skala|5xlokk|1dina|1ellieħa|1osta|1qabba|1sida|1tarfa|1unxar|1ġarr|0Nadur|2xxar|0Paola|1embroke|1ietà|0Qala|1ormi|1rendi|0Rabat Gozo|6Malta|0Safi|2int John|7ulian's|6Lawrence|7ucia's|6Paul's Bay|2nnat|3ta Venera|1iġġiewi|1liema|1wieqi|0Ta' Xbiex|2rxien|0Valletta|0Xagħra|1ewkija|1għajra|0Ħamrun|0Żabbar|1ebbuġ Gozo|7Malta|2jtun|1urrieq|0Black River|0Cargados Carajos Shoals [Saint Brandon Islands]|0Flacq|0Grand Port|0Moka|0Pamplemousses|1laines wilhems|1ort Louis|0Rivière du Rempart|1odrigues Island|0Savanne|0Alifu Alifu|0Baa|0Dhaalu|0Faafu|0Gaafu Alifu|6Dhaalu|1naviyani|0Haa Alif|4Dhaalu|2hdhunmathi|0Kaafu|0Lhaviyani|0Male|1eemu|0Noonu|0Raa|0Seenu|1haviyani|0Thaa|0Vaavu|0Blantyre|0Central|1hikwawa|3radzulu|3tipa|0Dedza|1owa|0Karonga|2sungu|0Likoma|2longwe|0Machinga|2ngochi|1chinji|1ulanje|1zimba|0Neno|1khata Bay|3otakota|1orthern|1sanje|1tcheu|4isi|0Phalombe|0Rumphi|0Salima|1outhern|0Thyolo|0Zomba|0Baja California|f Sur|0Campeche|1hiapas|3huahua|1iudad de México|1oahuila de Zaragoza|2lima|0Durango|0Guanajuato|2errero|0Hidalgo|0Jalisco|0Michoacán de Ocampo|1orelos|1éxico|0Nayarit|1uevo León|0Oaxaca|0Puebla|0Quintana Roo|0San Luis Potosí|1inaloa|1onora|0Tabasco|2maulipas|1laxcala|0Veracruz de Ignacio de la Llave|0Yucatán|0Zacatecas|0Kedah|2lantan|0Melaka|0Negeri Sembilan|0Pahang|1erak|3lis|1ulau Pinang|0Sabah|2rawak|1elangor|0Terengganu|0Wilayah Persekutuan Kuala Lumpur|kLabuan|kPutrajaya|0Cabo Delgado|0Inhambane|0Manica|0Nampula|0Sofala|0Tete|0Zambézia|0//Karas|0Erongo|0Hardap|0Kavango East|8West|1homas|1unene|0Ohangwena|1shana|3ikoto|0Diffa|1osso|0Maradi|0Niamey|0Tahoua|1illabéri|0Zinder|0Abuja Capital Territory|1damawa|1kwa Ibom|1nambra|0Bauchi|2yelsa|1enue|1orno|0Cross River|0Delta|0Ebonyi|1do|1kiti|1nugu|0Gombe|0Imo|0Jigawa|0Kaduna|2no|2tsina|1ebbi|1ogi|1wara|0Lagos|0Nasarawa|1iger|0Ogun|1ndo|1sun|1yo|0Plateau|0Rivers|0Sokoto|0Taraba|0Yobe|0Zamfara|0Atlántico Sur|0Boaco|0Carazo|1hinandega|2ontales|0Estelí|0Granada|0Jinotega|0León|0Madriz|2nagua|2saya|2tagalpa|0Nueva Segovia|0Rivas|1ío San Juan|0Flevoland|1ryslân|0Gelderland|1roningen|0Limburg|0Noord-Brabant|0Overijssel|0Utrecht|0Zeeland|1uid-Holland|0Agder|0Innlandet|0Jan Mayen (Arctic Region) (Seealso country code SJ)|0Møre og Romsdal|0Nordland|0Rogaland|0Svalbard (Arctic Region) (Seealso country code SJ)|0Troms og Finnmark|2øndelag|0Vestfold og Telemark|4land|1iken|0Bagmati|0Gandaki|0Karnali|0Lumbini|0Madhesh|0Sudurpashchim|0Anabar|2etan|2ibare|0Baitsi|1oe|1uada|0Denigomodu|0Ewa|0Ijuw|0Meneng|0Nibok|0Uaboe|0Yaren|0Bay of Plenty|0Chatham Islands Territory|0Gisborne|0Hawkes's Bay|0Manawatu-Wanganui|2rlborough|0Nelson|1orthland|0Otago|0Southland|0Taranaki|2sman|0Waikato|1ellington|2st Coast|0AI Wusţa|1d Dākhilīyah|1l Buraymī|1z Zāhirah|0Janūb ash Sharqīyah|0Masqaţ|1usandam|0Shamāl al Bāţinah|8sh Sharqīyah|0Z̧ufār|0Chiriquí|1oclé|2lón|0Darién|0Emberá|0Guna Yala|0Herrera|0Los Santos|0Naso Tjër Di|1gäbe‐Buglé|0Panamá|6 Oeste|0Veraguas|0Ancash|1purímac|1requipa|1yacucho|0Cajamarca|1uzco [Cusco]|0El Callao|0Huancavelica|2ánuco|0Ica|0Junín|0Lambayeque|1ima|4 hatun llaqta|1oreto|0Madre de Dios|1oquegua|0Pasco|1iura|1uno|0San Martín|0Tacna|1umbes|0Ucayali|0Bougainville|0Central|0East New Britain|5Sepik|4ern Highlands|1nga|0Gulf|0Hela|0Jiwaka|0Madang|2nus|1ilne Bay|1orobe|0National Capital District (Port Moresby)|1ew Ireland|1orthern|0Southern Highlands|0West New Britain|5Sepik|4ern|7 Highlands|0Abra|1gusan del Norte|bSur|1klan|1lbay|1ntique|1payao|1urora|0Basilan|2taan|4nes|5gas|1enguet|1iliran|1ohol|1ukidnon|2lacan|0Cagayan|2marines Norte|aSur|3iguin|2piz|2tanduanes|2vite|1ebu|0Davao Oriental|6de Oro|8l Norte|aSur|1inagat Islands|0Eastern Samar|0Guimaras|0Ifugao|1locos Norte|7Sur|3ilo|1sabela|0Kalinga-Apayao|2nlurang Dabaw|1otabato|0Laguna|2nao del Norte|aSur|1eyte|0Maguindanao|2rinduque|2sbate|1indoro Occidental|9riental|2samis Occidental|9riental|1ountain Province|0Negros occidental|8riental|1orthern Samar|1ueva Ecija|6Vizcaya|0Palawan|2ngasinan|0Quezon|2irino|0Rizal|1omblon|0Sarangani|1iquijor|1orsogon|2uth Cotabato|5ern Leyte|1ultan Kudarat|3u|2rigao del Norte|cSur|0Tarlac|2wi-Tawi|0Western Samar|0Zambales|4oanga Sibuguey [Zamboanga Sibugay]|adel Norte|eSur|0Azad Jammu and Kashmir|0Gilgit-Baltistan|0Islamabad|0Khyber Pakhtunkhwa|0Punjab|0Sindh|0Kujawsko-pomorskie|0Lubelskie|3uskie|0Mazowieckie|2łopolskie|0Opolskie|0Podkarpackie|3laskie|2morskie|0Warmińsko-mazurskie|1ielkopolskie|0Zachodniopomorskie|0Łódzkie|0Śląskie|1więtokrzyskie|0Deir El Balah|0Gaza|0Hebron|0Jericho and Al Aghwar|3usalem|0Khan Yunis|0Nablus|1orth Gaza|0Qalqilya|0Rafah|2mallah|0Salfit|0Tubas|2lkarm|0Braga|5nça|0Castelo Branco|1oimbra|0Faro|0Guarda|0Leiria|1isboa|0Portalegre|4o|0Região Autónoma da Madeira|hos Açores|0Santarém|1etúbal|0Viana do Castelo|2la Real|2seu|0Évora|0Hatohobei|0Ngaraard|0Peleliu|0Sonsorol|0Alto Paraguay|9ná|1mambay|1sunción|0Boquerón|0Caaguazú|3zapá|2nindeyú|1entral|1ordillera|0Guairá|0Itapúa|0Misiones|0Paraguarí|1residente Hayes|0San Pedro|0Ñeembucú|0Al Khawr wa adh Dhakhīrah|3Wakrah|1r Rayyān|1sh Shamāl|6īḩānīyah|1z̧ Z̧a‘āyin|1rad|2geş|0Bacău|1ihor|2striţa-Năsăud|1otoşani|1raşov|2āila|1ucureşti|2zău|0Caraş-Severin|1luj|1onstarţa|2vasna|1ălărasi|0Dolj|1âmboviţa|0Galaţi|1iurgiu|1orj|0Harghita|0Iaşi|1lfov|0Maramureş|1ehedinţi|1ureş|0Neamţ|0Olt|0Prahova|0Satu Mare|1ibiu|1uceava|1ălaj|0Teleorman|1imiş|1ulcea|0Vaslui|1rancea|1âlcea|0Borski okrug|1raničevski okrug|0Jablanički okrug|1užnobanatski okrug|7čki okrug|0Kolubarski okrug|2sovo-Metohija|5ski okrug|7o‐Mitrovački okrug|9Pomoravski okrug|0Mačvanski okrug|1oravički okrug|0Nišavski okrug|0Pećki okrug|1irotski okrug|1odunavski okrug|2moravski okrug|1rizrenski okrug|1činjski okrug|0Rasinski okrug|2ški okrug|0Severnobanatski okrug|9čki okrug|1rednjebanatski okrug|3mski okrug|0Toplički okrug|0Vojvodina|0Zaječarski okrug|2padnobački okrug|1latiborski okrug|0Šumadijski okrug|0Altay, Respublika|5skiy kray|1murskaya oblast'|1rkhangel'skaya oblast,|1strakhanskaya oblast'|0Bashkortostan, Respublika|1elgorodskaya oblast'|1ryanskaya oblast'|1uryatiya, Respublika|0Chechenskaya Respublika|3lyabinskaya oblast'|2ukotskiy avtonomnyy okrug|3vashskaya Respublika|0Dagestan, Respublika|0Ingushskaya Respublika [Respublika Ingushetiya]|1rkutskaya oblast'|1vanovskaya oblast'|0Kabardino-Balkarskaya Respublika|2liningradskaya oblast,|3mykiya, Respublika|3uzhskaya oblast'|2mchatskaya oblast'|2rachayevo-Cherkesskaya Respublika|3eliya, Respublika|1emerovskaya oblast'|1habarovskiy kray|3kasiya, Respublika|3nty-Mansiyskiy avtonomnyy okrug|1irovskaya oblast'|1omi, Respublika|2stromskaya oblast'|1rasnodarskiy kray|6yarskiy kray|1urganskaya oblast'|3skaya oblast'|0Leningradskaya oblast'|1ipetskaya oblast'|0Magadanskaya oblast'|2riy El, Respublika|1ordoviya, Respublika|2skovskaya oblast'|4va|1urmanskaya oblast'|0Nenetskiy avtonomnyy okrug|1izhegorodskaya oblast'|1ovgorodskaya oblast'|3osibirskaya oblast'|0Omskaya oblast'|1renburgskaya oblast'|2lovskaya oblast'|0Penzenskaya oblast'|2rm|1rimorskiy kray|1skovskaya oblast'|0Rostovskaya oblast'|1yazanskaya oblast'|0Sakha, Respublika [Yakutiya]|5linskaya oblast'|2marskaya oblast'|2nkt-Peterburg|2ratovskaya oblast'|1evernaya Osetiya, Respublika Alaniya] [Respublika Severnaya Osetiya-Alaniya]|1molenskaya oblast'|1tavropol'skiy kray|1verdlovskaya oblast'|0Tambovskaya oblast'|2tarstan, Respublika|1omskaya oblast'|1ul'skaya oblast'|1verskaya oblast'|1yumenskaya oblast'|2va, Respublika [Tuva]|0Udmurtskaya Respublika|1l'yanovskaya oblast'|0Vladimirskaya oblast'|1olgogradskaya oblast'|3ogodskaya oblast'|2ronezhskaya oblast'|0Yamalo-Nenetskiy avtonomnyy okrug|2roslavskaya oblast'|1evreyskaya avtonomnaya oblast'|0Zabaykal'skiy kray|0Est|0Nord|0Ouest|0Sud|0'Asīr|0AI Bāhah|3Hudūd ash Shamālīyah|3Jawf|3Qaşīm|1l Madīnah al Munawwarah|1sh Sharqīyah|0Hā'il|0Jāzān|0Makkah al Mukarramah|0Najrān|0Tabūk|0Capital Territory (Honiara)|1hoiseul|0Guadalcanal|0Isabel|0Makira‐Ulawa|2laita|0Rennell and Bellona|0Temotu|0Western|0Anse Boileau|5Royale|5Étoile|1u Cap|0Baie Lazare|5Sainte Anne|1eau Vallon|2l Air|4Ombre|0Cascade|0Glacis|1rand'Anse Mahé|bPraslin|0II|0La Digue|3Rivière Anglaise|1emamel|0Mont Buxton|5Fleuri|0Plaisance|1ointe La Rue|2rt Glaud|0Ros Kaiman|0Takamaka|0Île Persévérance I|0Al Baḩr al Aḩmar|3Jazīrah|3Kharţūm|3Qadārif|1n Nil al Azraq|4īl al Abyaḑ|1sh Shamālīyah|0Gharb Dārfūr|6Kurdufān|0Janūb Dārfūr|6Kurdufān|0Kassalā|0Nahr an Nīl|0Shamāl Dārfūr|3rq Dārfūr|2iamāl Kurdufān|1innār|0Blekinge län|0Dalarnes län|0Gotlands län|1ävleborgs län|0Hallands län|0Jämtlands län|1önköpings län|0Kalmar län|1ronoborgs län|0Norrbottens län|0Skåne län|1ödermanlands län|0Uppsala län|0Värmlands län|2sterbottens län|6norrlands län|4manlands län|4ra Götalands län|0Örebro län|1stergötlands län|0North East|6West|0South East|6West|1aint Helena|0Tristan da Cunha|0Apače|0Beltinci|2nedikt|1istrica ob Sotli|1led|2oke|1ohinj|2rovnica|2vec|1raslovče|2da|2ezovica|3žice|0Cankova|1elje|2rklje na Gorenjskem|4nica|5o|4venjak|1irkulane|0Destrnik|1ivača|1obje|3repolje|4na|4ova-Polhov Gradec|6nik|2l pri Ljubljani|3enjske Toplice|2mžale|2rnava|1ravograd|1uplek|0Gorenja vas-Poljane|3išnica|3je|3nja Radgona|5i Grad|7Petrovci|1rad|2osuplje|0Hajdina|1odoš|2rjul|2če-Slivnica|1rastnik|2pelje-Kozina|0Idrija|1g|1lirska Bistrica|1vančna Gorica|1zola|0Jesenice|2zersko|1uršinci|0Kamnik|2nal ob Soči|1idričevo|1obarid|3ilje|2men|5da|2per|2stanjevica na Krki|4el|2zje|2čevje|1ranj|5ska Gora|2iževci|2ško|1ungota|2zma|0Laško|1enart|3dava|1itija|1jubljana|4no|3tomer|1og-Dragomer|3atec|2vrenc na Pohorju|2ška dolina|4i Potok|1ukovica|2če|0Majšperk|2kole|2ribor|3kovci|1edvode|2ngeš|2tlika|2žica|1iklavž na Dravskem polju|2ren-Kostanjevica|3na|5 Peč|2slinja|1okronog-Trebelno|2ravske Toplice|5če|2zirje|1urska Sobota|2ta|0Naklo|2zarje|1ova Gorica|3o mesto|0Odranci|1plotnica|1rmož|1silnica|0Pesnica|1iran|2vka|1odlehnik|3velka|3četrtek|2ljčane|3zela|2stojna|1rebold|3ddvor|3valje|1tuj|1uconci|0Radenci|4če|3lje ob Dravi|3ovljica|2vne na Koroškem|2zkrižje|2če-Fram|1enèe-Vogrsko|2čica ob Savinji|1ibnica|7 na Pohorju|1ogatec|4ška Slatina|5ovci|1uše|0Selnica ob Dravi|2mič|2žana|1lovenj Gradec|6ska Bistrica|1odražica|2lčava|1redišče ob Dravi|1traža|1veta Ana|6Trojica v Slovenskihgoricah|4i Andraž v Slovenskih goricah|6Jurij v Slovenskih goricah|6Tomaž|0Tabor|1išina|1olmin|1rbovlje|2ebnje|2novska vas|2zin|2žič|1urnišče|0Velenje|3ika Polana|5e Lašče|2ržej|1idem|2pava|2tanje|1odice|2jnik|1ransko|2hnika|1uzenica|0Zagorje ob Savi|2vrč|1reče|0Črenšovci|2na na Koroškem|3omelj|0Šalovci|1empeter-Vrtojba|2ntrupert|1marješke Toplice|4tno pri Litiji|1tore|0Žalec|1elezniki|2tale|1iri|3ovnica|1užemberk|0Bratislavský kraj|0Košický kraj|0Nitriansky kraj|0Prešovský kraj|0Trnavský kraj|0Žilinský kraj|0Northern|0Southern|0Western Area (Freetown)|0Borgo Maggiore|0Chiesanuova|1ittà di SanMarino|0Domagnano|0Faetano|1iorentino|0Montegiardino|0Serravalle|0Dakar|0Fatick|0Kaffrine|2olack|1olda|1édougou|0Louga|0Matam|0Saint-Louis|1édhiou|0Tambacounda|1hiès|0Ziguinchor|0Bakool|2naadir|2ri|2y|0Galguduud|1edo|0Hiiraan|0Jubbada Dhexe|8Hoose|0Mudug|0Nugaal|0Sanaag|1habeellaha Dhexe|cHoose|1ool|0Togdheer|0Woqooyi Galbeed|0Commewijne|2ronie|0Marowijne|0Nickerie|0Para|4maribo|0Saramacca|1ipaliwini|0Wanica|0Central Equatoria|0Jonglei|0Lakes|0Unity|1pper Nile|0Warrap|1estern Bahr el Ghazal|8Equatoria|0Cantagalo|2ué|0Lembá|1obata|0Mé‐Zóch|0Príncipe|0Cabañas|1halatenango|1uscatlán|0La Libertad|3Paz|3Unión|0Morazán|0San Miguel|4Salvador|4Vicente|3ta Ana|1onsonate|0Usulután|0AI Hasakah|3Lādhiqīyah|3Qunayţirah|1r Raqqah|1s Suwaydā'|0Dar'ā|2yr az Zawr|0Halab|2māh|1imş|0Rīf Dimashq|0Ţarţūs|0Lubombo|0Manzini|0Shiselweni|0Baḩr al Ghazāl|1ūrkū|0Chari-Baguirmi|0Ennedi-Est|7Ouest|0Guéra|0Hadjer Lamis|0Kanem|0Lac|1ogone-Occidental|8riental|0Mandoul|2yo‐Kebbi‐Est|bOuest|1oyen-Chari|0Ouaddaï|0Salamat|1īlā|0Tandjilé|1ibastī|0Ville de Ndjamena|0Wadi Fira|0Kara|0Maritime (Région)|0Plateaux|0Savanes|0Amnat Charoen|1ng Thong|0Bueng Kan|2ri Ram|0Chachoengsao|3i Nat|4yaphum|3nthaburi|2iang Mai|7Rai|2on Buri|2umphon|0Kalasin|2mphaeng Phet|2nchanaburi|1hon Kaen|1rabi|0Lampang|4hun|1oei|2p Buri|0Mae Hong Son|2ha Sarakham|1ukdahan|0Nakhon Nayok|7Pathom|8hanom|7Ratchasima|7Sawan|8i Thammarat|2n|2rathiwat|1ong Bua Lam Phu|5Khai|3thaburi|0Pathum Thani|3tani|1hangnga|3tthalung|7ya|3yao|2etchabun|9ri|2ichit|3tsanulok|2ra Nakhon Si Ayutthaya|4e|2uket|1rachin Buri|5uap Khiri Khan|0Ranong|2tchaburi|2yong|1oi Et|0Sa Kaeo|2kon Nakhon|2mut Prakan|6Sakhon|7ongkhram|2raburi|2tun|1i Sa Ket|2ng Buri|1ongkhla|1ukhothai|2phan Buri|2rat Thani|3in|0Tak|1rang|3t|0Ubon Ratchathani|1don Thani|1thai Thani|2taradit|0Yala|2sothon|0Khatlon|1ŭhistoni Badakhshon|0Sughd|0nohiyahoi tobei jumhurí|0Ainaro|0Baucau|1obonaro|0Cova Lima|0Díli|0Ermera|0Lautém|1iquiça|0Manatuto|3ufahi|0Oé-Cusse Ambeno|0Viqueque|0Aşgabat|0Balkan|0Daşoguz|0Lebap|0Mary|0Ben Arous|1izerte|1éja|0Gabès|2fsa|0Jendouba|0Kairouan|2sserine|1ébili|0L'Ariana|1a Manouba|1e Kef|0Mahdia|1onastir|1édenine|0Nabeul|0Sfax|1idi Bouzid|2liana|1ousse|0Tataouine|1ozeur|0Zaghouan|0Ha'apai|0Niuas|0Tongatapu|0Vava'u|0Adiyaman|1fyonkarahisar|1ksaray|1masya|1nkara|2talya|1rdahan|2tvin|1ydın|1ğrı|0Balıkesir|2rtın|2tman|2yburt|1ilecik|2ngöl|2tlis|1olu|1urdur|3sa|0Canakkale|1orum|0Denizli|1iyarbakir|1üzce|0Edirne|1lazığ|1rzincan|3urum|1skişehir|0Gaziantep|1iresun|1ümüşhane|0Hakkari|2tay|0Isparta|1ğdır|0Kahramanmaraş|2rabuk|4man|3s|2stamonu|2yseri|1ilis|1ocaeli|2nya|1ütahya|1ırklareli|3ıkkale|3şehir|0Malatya|2nisa|2rdin|1ersin|1uğla|2ş|0Nevsehir|1iğde|0Ordu|1smaniye|0Rize|0Sakarya|2msun|1iirt|2nop|2vas|0Tekirdağ|1okat|1rabzon|1unceli|0Uşak|0Van|0Yalova|1ozgat|0Zonguldak|0Çankırı|0İstanbul|1zmir|0Şanlıurfa|1ırnak|0Couva-Tabaquite-Talparo|0Diego Martin|0Mayaro-Rio Claro|0Penal-Debe|1oint Fortin|2rt of Spain|1rinces Town|0San Fernando|4Juan-Laventille|3gre Grande|1iparia|0Tobago|1unapuna-Piarco|0Nanumaga|5ea|1iutao|1ui|2kufetau|4laelae|0Vaitupu|0Chiayi|0Hsinchu|1ualien|0Kaohsiung|1eelung|1inmen|0Lienchiang|0Miaoli|0Nantou|1ew Taipei|0Penghu|1ingtung|0Taichung|3nan|3pei|3tung|2oyuan|0Yilan|1unlin|0Dar es Salaam|1odoma|0Geita|0Iringa|0Kagera|2skazini Pemba|aUnguja|2tavi|1igoma|2limanjaro|1usini Pemba|7Unguja|0Lindi|0Manyara|2ra|1beya|1jini Magharibi|1orogoro|1twara|1wanza|0Njombe|0Pwani|0Rukwa|2vuma|0Shinyanga|1imiyu|2ngida|1ongwe|0Tabora|2nga|0Avtonomna Respublika Krym|0Cherkaska oblast|4nihivska oblast|6vetska oblast|0Dnipropetrovska oblast|1onetska oblast|0Ivano‐Frankivska oblast|0Kharkivska oblast|2ersonska oblast|2melnytska oblast|1irovohradska oblast|1yiv|4ska oblast|0Luhanska oblast|1vivska oblast|0Mykolaivska oblast|0Odeska oblast|0Poltavska oblast|0Rivnenska oblast|0Sevastopol|1umska oblast|0Ternopilska oblast|0Volynska oblast|0Zakarpatska oblast|2porizka oblast|1hytomyrska oblast|0Abim|1djumani|1molatar|2uria|4u|1pac|1rua|0Budaka|3uda|2giri|3weri|2hweju|2ikwe|2kedea|3omansibi|3wo|2lambuli|3iisa|2ndibugyo|3yangabu|2shenyi|3ia|2taleja|4mbala|3ebo|2vuma|2yende|0Dokolo|0Gomba|1ulu|0Hoima|0Ibanda|1ganga|1singiro|0Jinja|0Kaabong|2bale|4role|3eramaido|2gadi|2kumiro|2laki|3iro|3ungu|2mpala|3uli|3wenge|2nungu|2pchorwa|3elebyong|2renga|2sanda|3ese|2takwi|2yunga|2zo|1ibaale|3oga|3uku|2kuube|2ruhura|3yandongo|2soro|2tagwenda|3gum|1oboko|2le|2tido|1umi|1wania|2een|1yankwanzi|2egegwa|3njojo|2otera|0Lamwo|1ira|1uuka|2wero|1wengo|1yantonde|0Madi‐Okollo|2nafwa|2racha|2saka|3indi|2yuge|1bale|3rara|1itooma|3yana|1oroto|2yo|1pigi|1ubende|2kono|0Nabilatuk|2kapiripirit|4seke|5ongola|2mayingo|3isindwa|3utumba|2pak|1ebbi|1gora|1toroko|2ungamo|1woya|0Obongi|1moro|1tuke|1yam|0Pader|2kwach|2llisa|0Rakai|1ubanda|3irizi|2kiga|3ungiri|1wampara|0Sembabule|2rere|1heema|1ironko|1oroti|0Tororo|0Wakiso|0Yumbe|0Zombo|0Baker Island|0Howland Island|0Jarvis Island|0Kingman Reef|0Midway Islands (ISO reserved code = I)|0Navassa Island (ISO reserved code = NV)|0Palmyra Atoll|0Wake Island (ISO reserved code = WK)|0Alabama|1merican Samoa (see also separate entry under AS)|1rizona|2kansas|0California|1olorado|2nnecticut|0Delaware|1istrict of Columbia|0Georgia|1uam (see also separate entry under GU)|0Hawaii|0Idaho|1llinois|1ndiana|1owa|0Kansas|1entucky|0Louisiana|0Maine|2ryland|2ssachusetts|1ichigan|2nnesota|2ssissippi|4ouri|1ontana|0Nebraska|2vada|2w Hampshire|4Jersey|4Mexico|4York|1orth Dakota|5ern Mariana Islands (see also separate entry MP)|0Ohio|1klahoma|1regon|0Pennsylvania|1uerto Rico (see also separate entry under PR)|0Rhode Island|0South Carolina|6Dakota|0Tennessee|2xas|0U.S. Minor Outlying Islands (cf. separate entry UM)|1tah|0Vermont|1irgin Islands of the U.S. (see also separate entry VI)|6ia|0Washington|1est Virginia|1isconsin|1yoming|0Canelones|1erro Largo|1olonia|0Durazno|0Florida|0Lavalleja|0Maldonado|1ontevideo|0Paysandú|0Rivera|1ocha|1ío Negro|0Salto|2n José|1oriano|0Tacuarembó|1reinta y Tres|0Bukhoro|0Farg‘ona|0Jizzax|0Khorazm|0Namangan|2woiy|0Qashqadaryo|1oraqalpog‘iston Respublikasi|0Samarqand|1irdaryo|1urkhondaryo|0Toshkent|0Xorazm|0Grenadines|0Saint Andrew|6David|6George|6Patrick|0Amazonas|1nzoátegui|1pure|1ragua|0Barinas|1olívar|0Carabobo|1ojedes|0Delta Amacuro|2pendencias Federales|0Falcón|0Guárico|0La Guaira|2ra|0Miranda|1onagas|1érida|0Nueva Esparta|0Portuguesa|0Sucre|0Trujillo|1áchira|0Yaracuy|0Zulia|0An Giang|0Bà Rịa - Vũng Tàu|1ình Dương|5Phước|5Thuận|5Định|1ạc Liêu|1ắc Giang|4Kạn|4Ninh|1ến Tre|0Cao Bằng|1à Mau|1ần Thơ|0Gia Lai|0Hà Giang|3Nam|4ội|3Tĩnh|1òa Bình|1ưng Yên|1ải Dương|4Phòng|1ậu Giang|1ồ Chí Minh|0Khánh Hòa|1iến Giang|1on Tum|0Long An|1ào Cai|1âm Ðồng|1ạng Sơn|0Nam Ðịnh|1ghệ An|1inh Bình|5Thuận|0Phú Thọ|4Yên|0Quảng Bình|6Nam|7gãi|7inh|6Trị|0Sóc Trăng|1ơn La|0Thanh Hóa|2ái Bình|5Nguyên|2ừa Thiên-Huế|1iền Giang|1rà Vinh|1uyên Quang|1ây Ninh|0Vĩnh Long|5Phúc|0Yên Bái|0Ðồng Nai|5Tháp|0Điện Biên|1ắk Lắk|4Nông|0Pénama|0Sanma|1héfa|0Taféa|1orba|0Aiga‐i‐le‐Tai|1tua|0Fa'asaleleaga|0Gaga'emauga|4ifomauga|0Palauli|0Satupa 'itea|0Tuamasaga|0Va'a-o-Fonoti|2isigano|0Al Bayḑā’|3Jawf|3Mahrah|5ḩwīt|3Ḩudaydah|1mānat al ‘Āşimah [city]|1rkhabīl Suquţrá|1ḑ Ḑāli‘|0Dhamār|0Ibb|0Lahij|0Ma’rib|0Raymah|0Sa'dah|1habwah|0Ta'izz|0Şanʻā'|0Ḩajjah|2ḑramawt|0‘Adan|2mrān|0Free State|0Gauteng|0Kwazulu-Natal|0Limpopo|0Mpumalanga|0North-West|5ern Cape|0Western Cape|0Central|1opperbelt|0Eastern|0Luapula|2saka|0Muchinga|0North-Western|5ern|0Southern|0Harare|0Manicaland|2shonaland Central|cEast|cWest|3vingo|2tabeleland North|dSouth|1idlands","sep":"|"},{"d":"AD|AE|AF|AG|AL|AM|AO|AR|AT|AU|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BJ|BN|BO|BQ|BR|BS|BT|BW|BY|BZ|CA|CD|CF|CG|CH|CI|CL|CM|CN|CO|CR|CU|CV|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EE|EG|ER|ES|ET|FI|FJ|FM|FR|GA|GB|GD|GE|GH|GL|GM|GN|GQ|GR|GT|GW|GY|HN|HR|HT|HU|ID|IE|IL|IN|IQ|IR|IS|IT|JM|JO|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MK|ML|MM|MN|MR|MT|MU|MV|MW|MX|MY|MZ|NA|NE|NG|NI|NL|NO|NP|NR|NZ|OM|PA|PE|PG|PH|PK|PL|PS|PT|PW|PY|QA|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SK|SL|SM|SN|SO|SR|SS|ST|SV|SY|SZ|TD|TG|TH|TJ|TL|TM|TN|TO|TR|TT|TV|TW|TZ|UA|UG|UM|US|UY|UZ|VC|VE|VN|VU|WS|YE|ZA|ZM|ZW","r":"0*7,1*4,2*c,3*8,4*3,5*a,6*7,7*o,8*9,9*5,a*u,b*2,c*5,d*1h,e*3,f*d,g*3,h*2,i*g,j*c,k*3,l*3,m*2,n*m,o*j,p*2,q*c,r*5,s*3,t*8,u*d,v*6,w*2,x*d,y*9,z*5,10*5,11*c,12*b,13*2,14*1,15*9,16*1,17*4,18*6,19*4,1a*5,1b*4,1c*1,1d*1,1e*2,1f*5,1g*8,1h*2,1i*b,1j*3,1k*1,1l*1,1m*1,1n*j,1o*1,1p*e,1q*1,1r*6,1s*7,1t*2,1u*1,1v*8,1w*2,1x*1,1y*1,1z*2,20*6,21*7,22*1,23*4,24*7,25*5,26*8,27*1,28*b,29*4,2a*1,2b*1,2c*a,2d*1,2e*1,2f*1,2g*2,2h*1,2i*1,2j*1,2k*1,2l*1,2m*1,2n*1,2o*1,2p*2,2q*4,2r*1,2s*2,2t*1,2u*1,2v*4,2w*1,2x*3,2y*4,2z*z,30*3,31*6,32*1,33*7,34*1,35*1,36*3,37*12,38*1,39*1,3a*g,3b*1,3c*1,3d*1,3e*1,3f*2,3g*2,3h*1,3i*4,3j*4,3k*1,3l*1,3m*1,3n*2,3o*1,3p*1,3q*1,3r*2,3s*1,3t*1,3u*2,3v*1,3w*3,3x*1,3y*1,3z*1,40*2,41*c,42*1,43*2,44*3,45*1,46*1,47*1,48*1,49*1,4a*2,4b*1,4c*1,4d*1,4e*1,4f*g,4g*2,4h*2,4i*1,4j*1,4k*1,4l*1,4m*2,4n*1,4o*1,4p*2,4q*1,4r*1,4s*1,4t*1,4u*1,4v*1,4w*1,4x*1,4y*1,4z*1,50*2,51*1,52*3,53*1,54*1,55*1,56*1,57*3,58*2,59*2,5a*1,5b*1,5c*1,5d*1,5e*1,5f*1,5g*1,5h*1,5i*1,1*3,2*m,4*9,5*1,6*b,9*3,a*1c,b*1,c*6,d*b,e*8,f*w,g*p,h*2,i*2,k*1,l*6,m*1,n*5,o*d,p*i,q*4,r*2,s*3,t*5,u*d,v*b,w*a,x*d,y*5,z*b,10*5,11*m,12*m,13*5,14*g,15*d,16*5,17*a,18*a,19*2,1b*6,1c*15,1d*1l,1e*m,1f*a,1g*j,1h*4,1i*15,1j*a,1k*i,1l*e,1m*3,1n*28,1o*8,1p*5n,1q*6,1r*6,1s*9,1t*3,1u*5,1v*p,1w*6,1x*c,1y*l,1z*7,20*4,21*b,22*k,23*6,24*10,25*w,26*i,27*5,28*q,29*e,2a*u,2b*7,2c*2p,2d*d,2e*b,2f*1a,2g*19,2h*8,2i*o,2j*2,2k*2,2l*d,2m*c,2n*g,2o*5,2p*i,2q*e,2r*7,2s*8,2t*a,2u*x,2v*b,2w*9,2x*1v,2y*8,2z*7,30*j,31*2g,32*g,33*u,34*n,35*5,36*n,37*17,38*a,39*e,3a*6,3b*e,3c*1v,3d*b,3e*k,3f*t,3g*u,3h*f,3i*7,3j*a,3k*7,3l*10,3m*g,3n*a,3o*c,3p*6,3q*d,3r*f,3s*a,3t*d,3u*o,3v*l,3w*27,3x*6,3y*f,3z*e,40*i,41*4,42*h,43*6,44*13,45*v,46*2a,47*4,48*c,49*9,4a*p,4b*h,4c*k,4d*4,4e*2,4f*5g,4g*6,4h*3,4i*8,4j*d,4k*h,4l*9,4m*8,4n*6,4o*d,4p*c,4q*3,4r*m,4s*4,4t*25,4u*4,4v*c,4w*5,4x*n,4y*4,4z*28,50*d,51*7,52*j,53*u,54*q,55*3n,56*8,57*1i,58*h,59*d,5a*5,5b*o,5c*1p,5d*5,5e*a,5f*l,5g*8,5h*9,5i*9","sep":"|"},{"s":"02|03|04|05|06|07|08|AJ|AZ|DU|SH|BAL|BAM|BDG|KAN|KHO|LAG|NAN|PAN|SAM|SAR|WAR|ZAB|03|04|05|06|07|08|10|11|01|09|12|AG|AR|AV|ER|GR|KT|LO|SU|TV|VD|BGO|CAB|CUS|HUA|HUI|MAL|NAM|A|B|C|D|E|F|G|H|J|K|L|M|N|P|Q|R|S|T|U|V|W|X|Y|Z|1|2|3|4|5|6|7|8|9|ACT|NT|SA|TAS|WA|ABS|AGS|AGU|AST|BA|BIL|CAL|DAS|GA|KAL|LA|LAN|LER|MAS|MI|NA|NV|NX|SA|SAK|SAL|SM|SR|TAR|UCA|XA|YAR|YE|YEV|ZAN|BIH|BRC|01|02|04|06|11|01|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|BRU|VLI|WLX|BAL|BAN|COM|KEN|KOS|LOR|MOU|NAY|NOU|OUD|PAS|SOM|SOR|01|12|18|13|17|BB|BL|BM|BR|CA|CI|GI|KI|KR|KY|MA|MU|MW|MY|NG|RM|AK|AL|AQ|BO|CO|DO|KO|LI|MO|OU|PL|ZO|BE|TE|TU|B|L|O|BO|SE|AC|AM|AP|CE|ES|GO|MG|MS|MT|PA|PB|PE|PI|PR|RJ|RN|RO|RR|RS|SC|SP|TO|AK|BI|BY|CK|CS|EG|GC|HI|IN|MC|NE|NO|NP|NS|RC|RI|SO|SS|SW|11|TY|CE|CH|FR|GH|KG|KL|KW|NE|NW|SE|SO|ST|BR|HM|HO|HR|VI|BZ|OW|TOL|AB|BC|MB|NB|NL|NU|ON|SK|BC|BU|HK|HL|HU|KC|KE|KN|KS|LU|MN|NK|TA|AC|BK|KB|MP|NM|SE|11|14|AG|AI|BS|GE|GL|JU|SG|SZ|TG|TI|VS|ZG|ZH|AB|CM|DN|GD|LC|LG|SV|VB|WR|AI|AN|AT|LR|ML|AD|CE|EN|LT|SW|AH|BJ|GS|GZ|HA|HB|HE|HN|JL|JS|SD|SN|AMA|ANT|BOL|CAS|DC|GUA|MAG|NSA|QUI|SAN|SUC|A|SJ|01|BR|BV|CR|PN|RB|RG|SF|SL|TS|01|10|71|72|80|BB|BW|HH|MV|NI|TH|AR|AS|DI|DJ|81|82|83|84|85|02|03|08|09|01|01|A|I|37|68|74|79|87|ALX|BA|BH|BNS|DK|IS|SHR|SIN|AN|GB|A|CC|CU|GR|GU|LE|OR|PM|PO|VA|ZA|AA|AF|SI|01|01|KSA|01|59|65|66|67|69|70|73|76|77|78|86|89|90|91|92|93|94|95|1|ABC|BAS|BEN|BRY|CAM|CHE|DUR|KIR|MAN|NTL|TAM|TOB|WBK|WGN|01|AB|IM|KA|KK|MM|TB|AA|CP|EP|NP|OT|WN|WP|AV|KU|B|BE|DB|DL|FA|FO|KD|MD|YO|AN|BN|A|01|BA|QU|BA|DE|EB|PT|UD|UT|AT|CL|FM|IB|LP|OC|SB|01|AR|ND|OU|SD|BA|FE|KM|NY|PS|VE|ZE|AC|BT|JA|JI|JK|CE|CN|LD|LK|LM|MH|OY|WD|D|AN|CT|DH|GJ|HP|JH|JK|MZ|PB|TN|TR|AN|BG|DA|QA|00|1|23|BA|CB|FC|ME|PV|RA|RE|VR|VT|01|AJ|01|01|04|B|1|G|A|01|01|11|AH|10|75|AT|KH|PH|VI|AK|01|03|01|1|BG|GK|GP|MY|A|01|MR|VL|CA|EC|RD|WI|002|007|011|015|016|022|026|033|041|042|047|050|052|054|056|058|059|062|067|068|073|077|080|087|088|089|091|094|097|099|101|106|111|112|113|BA|DR|JG|01|CHT|KES|KES|SAF|TAO|CL|AN|BD|CL|ED|FL|IA|UN|01|A|ALK|AUR|JAL|101|102|103|104|105|107|108|109|201|202|203|204|205|206|207|208|209|210|211|301|303|304|307|308|310|311|312|313|401|402|403|404|405|406|407|408|409|410|1|01|035|037|039|043|046|049|051|053|055|057|061|063|064|065|069|071|01|01|AG|00|BA|MW|AGU|QUE|01|A|G|L|MPM|CA|OD|OH|OS|1|AB|AN|DR|NH|03|P1|01|AUK|CAN|BJ|1|AMA|LAL|CPK|00|LUN|PAM|BA|02|BTH|01|02|002|004|010|100|150|212|218|222|224|226|227|228|1|DA|US|AB|HD|IL|00|AD|01|01|CE|01|22|DC|AB|01|AC|001|110|114|115|116|117|118|119|120|121|122|123|124|125|126|213|BC|TC|E|NW|01|DB|AW|BR|BN|EE|01|AH|DI|ID|HH|BA|C|10|DU|AL|A|11|01|01|ARI|CHA|FUN|CHA|CYI|HSQ|01|05|101|67|AK|FL|NC|AR|FS|AN|TK|01|A|01|MAP|AA|AB|EC|01|BU|FU|RK|UQ|BDS|BGL|DAY|FRA|FYB|GHA|GHO|HEL|HER|JOW|KNR|KDZ|KAB|KAP|LOG|NIM|NUR|PIA|PKA|PAR|TAK|URU|02|03|04|05|06|07|08|10|11|SH|BGU|BIE|CCU|CNO|CNN|LUA|LSU|LNO|MOX|UIG|ZAI|NSW|QLD|VIC|AGC|AGM|AGA|BAB|BAL|BEY|BAR|CUL|CAB|FUZ|GOR|GYG|GOY|GAD|HAC|KUR|KAN|LAC|NEF|ORD|OGU|QAX|QAZ|QOB|QBA|QBI|QUS|QAB|SAT|SAB|SMX|SIY|SAD|TOV|XAC|XCI|XVD|XIZ|ZAQ|ZAR|IMI|ISM|SBN|SAH|SMI|SUS|SKR|SAR|SRP|03|05|07|08|09|10|05|02|06|07|03|04|09|10|12|11|08|VAN|WBR|WHT|WLG|WNA|VOV|VBR|VWV|BAM|BAZ|BGR|BLG|BLK|GAN|GNA|GOU|HOU|IOB|KAD|KMD|KMP|KOP|KOT|KOW|LER|NAO|NAM|OUB|PON|SNG|SMT|SIS|SEN|TAP|TUI|YAG|YAT|ZIR|ZON|ZOU|02|08|07|26|09|10|11|13|14|15|16|17|27|19|20|21|23|22|24|25|03|04|05|06|28|14|15|RT|RY|BM|H|C|N|P|S|T|SA|AL|BA|DF|MA|SE|BP|CI|CO|CE|FP|EX|HT|LI|MG|MI|SA|SE|WG|33|12|22|GA|13|44|42|43|23|45|14|31|15|41|32|21|24|34|GA|JW|LO|SP|MA|MI|CY|CZL|SC|NT|NS|PE|QC|YT|IT|KG|KL|LO|MA|MO|NU|SA|SK|SU|TO|TU|EQ|BB|BGF|HM|HK|KG|LB|HS|MB|UK|OP|VK|BZV|8|15|5|7|2|9|16|12|13|AR|BL|BE|FR|GR|LU|NE|NW|OW|SH|SO|UR|VD|BS|MG|SM|YM|ZZ|AP|BI|CO|AR|LI|LL|MA|RM|TA|VS|NB|ES|NO|NW|SU|OU|CQ|FJ|GD|GX|HI|HL|HK|JX|LN|MO|NM|NX|QH|SH|SX|SC|TW|TJ|XJ|XZ|YN|ZJ|ARA|ATL|BOY|CAL|CAQ|CAU|CES|CHO|CUN|COR|GUV|HUI|LAG|MET|NAR|PUT|RIS|SAP|TOL|VAC|VAU|VID|C|G|H|L|P|15|09|08|06|03|12|14|11|99|02|10|04|16|07|13|05|MA|MO|PA|PR|RS|CA|CF|SD|SO|SM|SS|SV|TA|04|06|03|02|05|64|31|41|63|52|51|53|32|20|42|BY|BE|HB|HE|NW|RP|SL|SN|ST|SH|OB|TA|04|05|06|07|10|11|02|03|04|33|34|35|36|05|06|08|37|07|38|09|30|19|39|10|11|12|13|14|28|15|29|40|16|17|18|20|21|31|22|23|25|26|32|24|41|27|42|16|23|44|46|05|07|09|50|34|10|35|08|06|52|02|25|56|17|32|57|58|39|36|47|24|33|54|53|18|40|03|28|29|43|27|26|45|31|30|51|04|48|20|22|21|41|19|11|14|49|37|42|38|15|13|55|12|B|C|F|H|X|O|E|W|G|L|R|M|S|N|D|Y|P|SE|SD|U|T|Z|39|45|52|50|60|56|64|71|81|84|FYM|GH|GZ|MN|MNF|KB|C|WAD|LX|SUZ|ASN|AST|PTS|DT|JS|KFS|MT|KN|SHG|DU|DK|MA|SK|C|AB|AL|O|BA|B|BI|BU|S|CS|CE|CR|CA|CO|SS|GI|H|HU|J|LO|GC|L|LU|M|ML|MU|MA|NA|P|SA|TF|SG|SE|SO|T|TE|TO|V|Z|VI|AV|BE|DD|GA|HA|OR|SO|TI|SN|SW|AM|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|02|03|04|05|06|07|08|09|10|11|12|R|13|14|TRK|PNI|YAP|02|03|06|04|6AE|08|07|09|10|11|12|13|14|15|16|17|18|19|H|2A|23|21|22|79|24|25|26|27|28|29|30|32|33|68|2B|31|43|52|74|87|05|34|35|36|37|38|39|40|41|42|44|45|46|47|48|49|50|51|53|54|55|56|57|69M|58|60|61|75C|62|63|64|72|71|80|81|82|83|84|85|88|2|3|4|5|6|7|8|9|ABE|ABD|ANS|ANN|AND|AGB|BDG|BNE|BNS|BDF|BFS|BEX|BIR|BBD|BPL|BGW|BOL|BCP|BRC|BRD|BGE|BNH|BST|BKM|BUR|CAY|CLD|CMD|CRF|CMN|CCG|CBF|CGN|CHW|CLK|CWY|CON|COV|CRY|CMA|DAL|DEN|DER|DBY|DRS|DEV|DNC|DOR|DUD|DGY|DND|EAL|EAY|EDU|ELN|ERW|ERY|ESX|EDH|ELS|ENF|ESS|FAL|FMO|FIF|FLN|GAT|GLG|GLS|GRE|GWN|HCK|HAL|HMF|HAM|HRY|HRW|HPL|HAV|HEF|HRT|HLD|HIL|HNS|IVC|AGY|IOW|IOS|ISL|KEC|KEN|KHL|KTT|KWL|LBH|LAN|LDS|LCE|LEC|LEW|LIN|LBC|LIV|LND|LUT|MDW|MTY|MRT|MEA|MUL|MDB|MLN|MIK|MON|MRY|NET|NWM|NWP|NMD|NFK|NAY|NEL|NLK|NLN|NNH|NSM|NTY|NYK|NBL|NGM|NTT|OLD|ORK|OXF|PEM|PKN|PTE|PLY|POR|POW|RDG|RDB|RCC|RFW|RCT|RIC|RCH|ROT|RUT|SLF|SAW|SCB|SFT|SHF|ZET|SHR|SLG|SOL|SOM|SAY|SGC|SLK|STY|STH|SOS|SWK|SHN|STS|STG|SKP|STT|STE|SFK|SND|SRY|STN|SWA|SWD|TFW|THR|TOF|TWH|TRF|VGL|WKF|WLL|WFT|WND|WRT|WAR|WDU|WLN|WNH|WSX|WSM|WIL|WNM|WRL|WOK|WLV|WOR|WRX|YOR|02|03|04|05|06|10|AJ|GU|RL|SZ|SJ|SK|AF|AH|BO|BE|NE|SV|UE|UW|TV|QT|SM|QE|M|L|N|U|W|BF|BK|CO|DI|DU|FR|GA|GU|KA|KS|KB|KN|KO|KE|LA|LO|LE|MC|ML|MM|NZ|PI|SI|TO|TE|BS|CS|DJ|KN|LI|WN|I|C|G|F|B|M|L|J|H|E|K|D|16|15|04|20|02|05|13|18|21|22|17|09|14|11|03|12|06|07|10|08|19|BM|BS|BL|CA|GA|OI|TO|CU|ES|MA|PM|CH|CM|CP|CR|EP|GD|IN|LE|OL|VA|YO|07|12|19|21|18|04|06|02|09|20|14|11|08|03|17|05|10|16|13|15|CE|GA|NI|NE|NO|SE|BZ|BU|BK|BE|BC|CS|DE|DU|EG|GY|GS|HB|HE|HV|JN|KV|KE|MI|NK|NO|PE|ST|SO|SN|SZ|SD|SS|SK|SH|SF|TB|TO|VA|VM|ZA|ER|BA|BE|GO|JB|JT|KB|KS|KT|KI|KU|BB|KR|LA|MA|MU|NB|NT|PA|PB|PE|PS|PT|RI|SR|SN|ST|SG|SA|SB|SS|SU|YO|CW|CO|DL|D|G|KY|KE|KK|LS|LH|MO|MN|RN|SO|TA|WH|WX|WW|M|Z|HA|TA|JM|AP|AR|AS|BR|CH|DL|GA|HR|JK|KA|KL|LA|LD|MP|MH|MN|ML|NL|OR|PY|RJ|SK|TG|UP|UT|WB|MU|BA|NA|AR|SU|BB|DQ|DI|KA|KI|MA|NI|WA|SD|30|24|18|14|10|07|27|01|13|22|08|05|29|09|28|06|17|12|15|02|26|25|20|11|23|21|19|04|03|16|7|6|5|8|2|4|3|AG|AL|AN|AR|AP|AT|AV|BT|BL|BN|BG|BI|BO|BZ|BS|BR|CA|CL|CE|CT|CZ|CH|CO|CS|CR|KR|CN|EN|FM|FE|FI|FG|FR|GE|GO|GR|IM|IS|AQ|SP|LT|LE|LC|LI|LO|LU|MC|MN|MS|MT|MI|MO|MB|NA|NO|NU|OR|PD|PA|PR|PG|PU|PE|PC|PI|PT|PN|PZ|PO|RG|RC|RI|RN|RM|RO|SA|SS|SV|SI|SR|SO|SU|TA|TE|TR|TO|TP|TN|TV|TS|UD|VA|VE|VB|VC|VV|VI|13|09|12|04|02|06|14|11|08|05|03|07|10|KA|MA|BA|AQ|AM|AZ|AT|IR|JA|MN|MD|23|05|02|38|21|10|34|18|40|07|26|28|08|17|03|37|46|14|43|39|24|04|45|20|42|29|15|33|47|41|11|25|32|22|12|36|09|31|16|13|30|06|35|19|44|27|02|03|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|GB|C|J|N|O|GO|T|Y|2|3|4|5|6|7|8|9|23|10|11|22|24|12|15|18|13|14|16|17|19|20|21|25|L|P|G|M|02|03|04|05|06|07|08|09|10|11|12|13|15|08|09|05|06|04|15|07|14|02|03|13|10|26|43|44|27|30|42|29|41|47|48|28|49|45|46|50|31|FA|JA|KU|MU|HA|19|11|15|23|27|47|71|55|35|39|43|63|59|61|62|31|33|79|BK|BL|CH|HO|LM|LP|OU|SL|SV|VT|XA|XS|XI|XE|BH|BA|BI|AS|JA|JL|NA|12|02|05|06|07|08|10|11|02|03|04|05|06|07|08|09|10|11|52|71|81|51|11|3|31|12|33|41|13|21|92|42|61|2|43|22|32|82|45|23|5|72|62|91|9|53|4|7|44|6|8|BM|GB|CM|GG|LO|MG|MO|NI|RI|RG|SI|D|B|C|E|F|J|H|G|K|AL|02|03|04|05|06|07|08|09|10|11|12|13|14|16|KU|15|17|19|21|KL|20|22|23|18|24|25|26|27|28|29|30|31|PN|32|33|34|35|36|37|38|39|40|48|50|TA|51|TE|52|53|54|UT|55|56|57|58|59|60|41|42|44|SA|43|45|46|47|49|CL|DI|ES|GR|LU|ME|RM|VD|DGV|JEL|JUR|LPX|REZ|RIX|VEN|BU|JA|JI|JU|KF|MJ|MB|WA|NQ|ZA|GT|MI|MQ|NL|SB|SR|WD|WS|TB|AGD|HAO|HOC|AOU|ASZ|AZI|BEM|BES|BER|BRR|BOD|BOM|05|CAS|06|CHE|CHI|CHT|12|DRI|08|HAJ|JDI|KES|ERR|ESM|ESI|FAH|FIG|FQH|FES|03|GUE|10|GUF|IFR|INE|JRA|KES|KHO|KHE|KHN|KEN|02|LAR|LAA|11|MAR|MMD|MMN|07|MEK|MID|MOH|MOU|MED|MDF|NAD|NOU|OUA|OUD|OUZ|OUJ|RAB|04|REH|SAL|SEF|SET|SIB|SIF|SIK|SIL|SYB|SKH|09|TNT|TNG|TAI|TAF|TAR|TAT|TAZ|TIN|TIZ|TET|YUS|ZAG|FO|JE|CO|GA|SO|LA|MA|MO|MG|MC|MU|PH|SD|SR|SP|VR|BS|BR|BA|CA|CT|CU|CM|CR|CS|DO|DR|DU|FA|GL|GA|HI|LE|NI|OC|OR|RE|RI|SO|ST|SN|SI|TA|TE|SD|SV|02|03|04|05|06|07|22|08|09|10|11|12|23|13|14|15|16|17|19|24|20|18|21|T|D|F|M|U|ALL|ARN|KIL|EBO|ENI|JAB|KWA|LAE|LIB|LIK|MAJ|MAL|MEJ|MIL|NMK|NMU|L|T|RON|UJA|UTI|WTH|WTJ|801|802|501|601|602|803|814|502|503|804|805|604|807|606|205|808|809|701|702|504|505|703|704|607|506|106|507|810|508|705|509|811|812|706|813|608|609|603|806|815|816|817|605|BKO|7|8|2|5|9|3|4|10|6|07|02|14|11|12|13|03|04|15|18|16|17|05|06|073|067|059|041|047|1|07|03|05|08|04|10|02|12|14|13|15|09|11|06|02|03|04|05|06|07|08|09|10|11|13|14|15|16|17|12|19|20|21|22|23|24|25|26|27|28|29|30|32|33|34|35|36|31|37|38|39|40|41|42|43|44|45|46|47|49|48|50|53|51|52|54|55|56|57|58|59|60|61|62|63|18|64|65|66|67|68|BL|CC|FL|GP|MO|PA|PW|PL|RR|RO|SA|02|20|17|14|27|28|29|07|23|05|26|03|MLE|12|25|13|01|24|08|04|BL|C|CK|CR|CT|DE|DO|KR|KS|LK|LI|MH|MG|MC|MU|MZ|NE|NB|NK|N|NS|NU|NI|PH|RU|SA|S|TH|ZO|BCN|BCS|CAM|CHP|CHH|CMX|COA|COL|DUR|GUA|GRO|HID|JAL|MIC|MOR|MEX|NAY|NLE|OAX|PUE|ROO|SLP|SIN|SON|TAB|TAM|TLA|VER|YUC|ZAC|02|03|04|05|06|08|09|07|12|13|10|11|14|15|16|P|I|B|N|S|T|Q|KA|ER|HA|KE|KW|KH|KU|OW|ON|OT|2|3|4|8|5|6|7|FC|AD|AK|AN|BA|BY|BE|BO|CR|DE|EB|ED|EK|EN|GO|IM|JI|KD|KN|KT|KE|KO|KW|LA|NA|NI|OG|ON|OS|OY|PL|RI|SO|TA|YO|ZA|AS|BO|CA|CI|CO|ES|GR|JI|LE|MD|MN|MS|MT|NS|RI|SJ|FL|FR|GE|GR|LI|NB|OV|UT|ZE|ZH|42|34|22|15|18|11|21|54|50|38|46|30|P3|P4|P6|P5|P2|P7|02|03|04|05|06|07|08|09|10|11|12|13|14|BOP|CIT|GIS|HKB|MWT|MBH|NSN|NTL|OTA|STL|TKI|TAS|WKO|WGN|WTC|WU|DA|BU|ZA|SJ|MA|MU|BS|SS|ZU|4|2|3|5|EM|KY|6|7|NT|NB|8|10|9|ANC|APU|ARE|AYA|CAJ|CUS|CAL|HUV|HUC|ICA|JUN|LAM|LIM|LMA|LOR|MDD|MOQ|PAS|PIU|PUN|SAM|TAC|TUM|UCA|NSB|CPM|EBR|ESW|EHG|EPW|GPK|HLA|JWK|MPM|MRL|MBA|MPL|NCD|NIK|NPP|SHM|WBK|SAN|WPD|WHM|ABR|AGN|AGS|AKL|ALB|ANT|APA|AUR|BAS|BAN|BTN|BTG|BEN|BIL|BOH|BUK|BUL|CAG|CAN|CAS|CAM|CAP|CAT|CAV|CEB|DAO|COM|DAV|DAS|DIN|EAS|GUI|IFU|ILN|ILS|ILI|ISA|KAL|DVO|NCO|LAG|LAN|LAS|LEY|MAG|MAD|MAS|MDC|MDR|MSC|MSR|MOU|NEC|NER|NSA|NUE|NUV|PLW|PAN|QUE|QUI|RIZ|ROM|SAR|SIG|SOR|SCO|SLE|SUK|SLU|SUN|SUR|TAR|TAW|WSA|ZMB|ZSI|ZAN|ZAS|JK|GB|IS|KP|PB|SD|04|06|08|14|12|16|18|20|22|28|30|32|10|24|26|DEB|GZA|HBN|JRH|JEM|KYS|NBS|NGZ|QQA|RFH|RBH|SLT|TBS|TKM|03|04|05|06|08|09|10|11|12|13|30|20|14|15|16|17|18|07|050|214|350|370|16|10|13|ASU|19|5|6|14|11|3|4|7|8|9|15|2|12|KH|WA|RA|MS|SH|ZA|AR|AG|BC|BH|BN|BT|BV|BR|B|BZ|CS|CJ|CT|CV|CL|DJ|DB|GL|GR|GJ|HR|IS|IF|MM|MH|MS|NT|OT|PH|SM|SB|SV|SJ|TR|TM|TL|VS|VN|VL|14|11|23|04|06|09|KM|25|28|29|08|17|20|26|22|10|13|27|24|19|18|03|01|02|07|21|VO|15|05|16|12|AL|ALT|AMU|ARK|AST|BA|BEL|BRY|BU|CE|CHE|CHU|CU|DA|IN|IRK|IVA|KB|KGD|KL|KLU|KAM|KC|KR|KEM|KHA|KK|KHM|KIR|KO|KOS|KDA|KYA|KGN|KRS|LEN|LIP|MAG|ME|MO|MOS|MOW|MUR|NEN|NIZ|NGR|NVS|OMS|ORE|ORL|PNZ|PER|PRI|PSK|ROS|RYA|SA|SAK|SAM|SPE|SAR|SE|SMO|STA|SVE|TAM|TA|TOM|TUL|TVE|TYU|TY|UD|ULY|VLA|VGG|VLG|VOR|YAN|YAR|YEV|ZAB|02|03|04|05|14|11|08|12|05|03|04|06|09|02|10|07|CT|CH|GU|IS|MK|ML|RB|TE|WE|02|05|03|04|06|07|08|09|10|11|12|13|14|27|15|16|24|17|18|19|20|21|25|23|26|RS|GZ|KH|GD|NB|NW|NO|DW|GK|DS|KS|KA|NR|DN|DE|KN|SI|K|W|I|X|N|Z|F|H|G|BD|M|D|C|S|AC|Y|U|O|T|E|02|03|04|05|HL|TA|195|002|148|149|003|150|004|005|006|151|007|008|009|152|011|012|013|014|153|196|018|019|154|020|155|021|156|022|157|023|024|025|026|027|028|207|029|030|031|158|032|159|161|162|160|034|035|036|037|038|039|040|041|163|042|043|044|045|046|047|049|164|050|197|165|051|048|052|053|166|054|055|056|057|058|059|060|061|062|063|208|064|167|065|066|068|067|069|198|070|168|071|072|073|074|169|075|212|170|076|199|078|077|079|080|081|082|083|084|085|086|171|087|088|089|090|091|172|093|092|200|173|094|174|095|175|096|097|100|099|101|102|103|176|098|201|209|104|177|107|106|105|108|178|109|111|112|113|179|180|202|203|181|204|182|210|205|184|010|128|129|130|185|186|131|132|133|187|134|188|135|136|137|138|139|189|140|141|142|143|144|015|016|017|033|183|211|206|194|127|190|146|191|147|192|193|BL|KI|NI|PV|TA|ZI|N|S|W|06|02|07|03|04|05|08|09|DK|FK|KA|KL|KD|KE|LG|MT|SL|SE|TC|TH|ZG|BK|BN|BR|BY|GA|GE|HI|JD|JH|MU|NU|SA|SD|SH|SO|TO|WO|CM|CR|MA|NI|PR|PM|SA|SI|WA|EC|JG|LK|UY|NU|WR|BW|EW|02|03|04|05|06|P|CA|CH|CU|LI|PA|UN|MO|SM|SS|SV|SA|SO|US|HA|LA|QU|RA|SU|DR|DY|HL|HM|HI|RD|TA|LU|MA|SH|BG|BO|CB|EE|EO|GR|HL|KA|LC|LO|LR|MA|ME|MO|MC|OD|SA|SI|TA|TI|ND|WF|K|M|P|S|37|15|38|31|24|18|36|22|50|57|20|86|46|62|71|40|81|52|51|42|16|58|44|49|26|73|48|30|60|80|55|96|39|43|12|13|94|82|93|S|56|67|76|66|65|14|54|83|25|77|85|70|21|45|27|47|11|74|75|19|91|33|17|90|64|72|84|32|63|92|23|34|41|61|53|95|35|KT|GB|SU|RA|AN|BA|BO|CO|DI|ER|LA|LI|MT|MF|OE|VI|S|B|D|L|M|13|23|31|81|71|32|41|42|73|12|14|33|53|52|82|21|61|43|34|51|83|72|22|02|03|04|05|02|03|68|05|06|07|75|08|09|04|10|74|72|69|11|12|13|14|15|16|17|19|20|21|81|22|23|24|25|26|27|28|29|30|31|32|76|46|78|70|36|37|38|79|41|42|43|39|71|40|44|45|47|33|48|49|50|51|52|80|53|54|55|56|57|58|59|60|61|62|64|65|77|66|67|18|34|35|63|73|CTT|DMN|MRC|PED|PTF|POS|PRT|SFO|SJL|SGE|SIP|TOB|TUP|NMG|NMA|NIT|NIU|NKF|NKL|VAI|CYQ|HSZ|HUA|KHH|KEE|KIN|LIE|MIA|NAN|NWT|PEN|PIF|TXG|TNN|TPE|TTT|TAO|ILA|YUN|02|03|27|04|05|06|07|28|08|09|10|11|12|26|13|14|15|16|17|18|29|19|20|21|22|30|23|31|24|25|43|71|74|77|12|14|26|63|65|68|35|30|32|09|46|48|51|53|56|40|59|61|07|21|23|18|314|301|315|216|316|302|303|217|218|201|235|420|117|219|118|220|225|416|401|430|402|202|221|119|233|120|226|317|121|304|403|417|203|418|204|318|404|405|213|427|428|237|222|122|102|205|413|414|206|236|335|126|406|207|112|433|407|103|227|432|419|421|408|434|305|319|325|306|208|333|228|123|422|415|125|326|307|229|104|124|114|336|223|320|105|409|244|209|410|423|115|308|309|106|107|108|334|311|116|109|230|234|224|327|310|231|424|411|328|337|331|329|321|312|332|210|110|429|425|431|412|435|111|232|426|215|211|212|113|313|330|81|84|86|89|71|76|95|79|AL|AS|AZ|AR|CA|CO|CT|DE|DC|GA|GU|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|ND|MP|OH|OK|OR|PA|PR|RI|SC|SD|TN|TX|UM|UT|VT|VI|VA|WA|WV|WI|WY|CA|CL|CO|DU|FD|LA|MA|MO|PA|RV|RO|RN|SA|SJ|SO|TA|TT|BU|FA|JI|KH|NG|NW|QA|QR|SA|SI|SU|TO|XO|06|02|03|04|05|Z|B|C|D|E|F|G|H|Y|W|I|J|X|K|M|N|L|O|P|R|T|S|U|V|44|43|57|58|40|31|55|54|53|56|50|04|59|CT|30|03|63|HN|23|14|66|61|HP|73|SG|34|47|28|41|02|35|09|67|22|18|36|68|32|24|27|29|13|25|52|05|21|20|69|26|46|51|07|37|49|70|06|39|45|71|33|72|PAM|SAM|SEE|TAE|TOB|AL|AT|FA|GE|GI|PA|SA|TU|VF|VS|BA|JA|MR|MW|HU|SA|SU|DA|DH|IB|LA|MA|RA|SD|SH|TA|SN|HJ|HD|AD|AM|FS|GP|KZN|LP|MP|NW|NC|WC|02|08|03|04|09|10|06|05|07|HA|MA|MC|ME|MW|MV|MN|MS|MI","sep":"|"}]}]);
const COLONY = [
{"id":"n-09bf1e74","guard":[["hasAny",["appears in","contains","includes","item number","longest","longest one","longest word","nth","sucode"]],["has","suname"]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-1e04f647","guard":[["hasAny",["item number","nth","sucode"]],["has","suname"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-2106ae1b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","sucode","title case"]],["has","suname"]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-ca6f0661","guard":[["hasAny",["item number","lower case","lowercase","nth","small letters","sucode"]],["has","suname"]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-68475ced","guard":[["has","sucode"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"NUE is the sucode of which suname":"The suname whose sucode is NUE is Nueva Ecija.","name the suname whose sucode is EPW":"The suname whose sucode is EPW is Enga.","name the suname whose sucode is CRF":"The suname whose sucode is CRF is Cardiff [Caerdydd GB-CRD].","name the suname whose sucode is RYA":"The suname whose sucode is RYA is Ryazanskaya oblast'.","which suname has the sucode MOQ":"The suname whose sucode is MOQ is Moquegua.","name the suname whose sucode is 428":"The suname whose sucode is 428 is Kakumiro.","which suname has the sucode 430":"The suname whose sucode is 430 is Bunyangabu.","which suname has the sucode LEW":"The suname whose sucode is LEW is Lewisham.","name the suname whose sucode is DEV":"The suname whose sucode is DEV is Devon.","which suname has the sucode CYQ":"The suname whose sucode is CYQ is Chiayi.","which suname has the sucode 229":"The suname whose sucode is 229 is Luuka.","name the suname whose sucode is SIF":"The suname whose sucode is SIF is Sidi Ifni.","which suname has the sucode 803":"The suname whose sucode is 803 is Butel.","name the suname whose sucode is VOV":"The suname whose sucode is VOV is Oost-Vlaanderen.","HIL is the sucode of which suname":"The suname whose sucode is HIL is Hillingdon.","which suname has the sucode 083":"The suname whose sucode is 083 is Nazarje.","which suname has the sucode MMN":"The suname whose sucode is MMN is Marrakech-Menara.","NGZ is the sucode of which suname":"The suname whose sucode is NGZ is North Gaza.","name the suname whose sucode is BKO":"The suname whose sucode is BKO is Bamako.","which suname has the sucode YUC":"The suname whose sucode is YUC is Yucatán.","MIC is the sucode of which suname":"The suname whose sucode is MIC is Michoacán de Ocampo.","SLF is the sucode of which suname":"The suname whose sucode is SLF is Salford.","name the suname whose sucode is NEF":"The suname whose sucode is NEF is Neftçala.","DY is the sucode of which suname":"The suname whose sucode is DY is Dayr az Zawr.","SEN is the sucode of which suname":"The suname whose sucode is SEN is Séno.","which suname has the sucode KNR":"The suname whose sucode is KNR is Kunaṟ.","which suname has the sucode BUK":"The suname whose sucode is BUK is Bukidnon.","name the suname whose sucode is NAO":"The suname whose sucode is NAO is Nahouri.","which suname has the sucode WNA":"The suname whose sucode is WNA is Namur.","which suname has the sucode 130":"The suname whose sucode is 130 is Trebnje.","which suname has the sucode IVA":"The suname whose sucode is IVA is Ivanovskaya oblast'.","which suname has the sucode MOS":"The suname whose sucode is MOS is Moskovskaya oblast'.","name the suname whose sucode is 143":"The suname whose sucode is 143 is Zavrč.","which suname has the sucode ZJ":"The suname whose sucode is ZJ is Zhejiang Sheng.","which suname has the sucode AYA":"The suname whose sucode is AYA is Ayacucho.","name the suname whose sucode is CHP":"The suname whose sucode is CHP is Chiapas.","which suname has the sucode ARN":"The suname whose sucode is ARN is Arno.","name the suname whose sucode is BUR":"The suname whose sucode is BUR is Bury.","2A is the sucode of which suname":"The suname whose sucode is 2A is Corse-du-Sud.","which suname has the sucode ERY":"The suname whose sucode is ERY is East Riding of Yorkshire.","ASZ is the sucode of which suname":"The suname whose sucode is ASZ is Assa-Zag (EH-partial).","BST is the sucode of which suname":"The suname whose sucode is BST is Bristol, City of.","which suname has the sucode 161":"The suname whose sucode is 161 is Hodoš.","name the suname whose sucode is CQ":"The suname whose sucode is CQ is Chongqing Shi.","505 is the sucode of which suname":"The suname whose sucode is 505 is Kruševo.","name the suname whose sucode is XO":"The suname whose sucode is XO is Xorazm.","name the suname whose sucode is MLN":"The suname whose sucode is MLN is Midlothian.","CV is the sucode of which suname":"The suname whose sucode is CV is Covasna.","name the suname whose sucode is VLA":"The suname whose sucode is VLA is Vladimirskaya oblast'.","name the suname whose sucode is KV":"The suname whose sucode is KV is Kaposvár.","NCO is the sucode of which suname":"The suname whose sucode is NCO is Kotabato.","OTA is the sucode of which suname":"The suname whose sucode is OTA is Otago.","MAD is the sucode of which suname":"The suname whose sucode is MAD is Marinduque.","TVE is the sucode of which suname":"The suname whose sucode is TVE is Tverskaya oblast'.","name the suname whose sucode is NFK":"The suname whose sucode is NFK is Norfolk.","216 is the sucode of which suname":"The suname whose sucode is 216 is Amuria.","BTN is the sucode of which suname":"The suname whose sucode is BTN is Batanes.","name the suname whose sucode is 196":"The suname whose sucode is 196 is Cirkulane.","name the suname whose sucode is 335":"The suname whose sucode is 335 is Karenga.","which suname has the sucode 334":"The suname whose sucode is 334 is Nabilatuk.","BES is the sucode of which suname":"The suname whose sucode is BES is Benslimane.","name the suname whose sucode is KDA":"The suname whose sucode is KDA is Krasnodarskiy kray.","which suname has the sucode NLE":"The suname whose sucode is NLE is Nuevo León.","which suname has the sucode MPL":"The suname whose sucode is MPL is Morobe.","name the suname whose sucode is 435":"The suname whose sucode is 435 is Rwampara.","name the suname whose sucode is BTH":"The suname whose sucode is BTH is Bethlehem.","name the suname whose sucode is 129":"The suname whose sucode is 129 is Trbovlje.","VM is the sucode of which suname":"The suname whose sucode is VM is Veszprém.","ACT is the sucode of which suname":"The suname whose sucode is ACT is Australian Capital Territory.","which suname has the sucode 415":"The suname whose sucode is 415 is Kyenjojo.","which suname has the sucode CES":"The suname whose sucode is CES is Cesar.","147 is the sucode of which suname":"The suname whose sucode is 147 is Žiri.","name the suname whose sucode is PLY":"The suname whose sucode is PLY is Plymouth.","which suname has the sucode UE":"The suname whose sucode is UE is Upper East.","BGU is the sucode of which suname":"The suname whose sucode is BGU is Benguela.","MIA is the sucode of which suname":"The suname whose sucode is MIA is Miaoli.","which suname has the sucode 158":"The suname whose sucode is 158 is Grad.","which suname has the sucode KSA":"The suname whose sucode is KSA is Kosrae.","name the suname whose sucode is BGO":"The suname whose sucode is BGO is Bengo.","name the suname whose sucode is COA":"The suname whose sucode is COA is Coahuila de Zaragoza.","which suname has the sucode 336":"The suname whose sucode is 336 is Madi‐Okollo.","NWT is the sucode of which suname":"The suname whose sucode is NWT is New Taipei.","name the suname whose sucode is 060":"The suname whose sucode is 060 is Litija.","which suname has the sucode GAN":"The suname whose sucode is GAN is Ganzourgou.","508 is the sucode of which suname":"The suname whose sucode is 508 is Prilep.","name the suname whose sucode is OLD":"The suname whose sucode is OLD is Oldham.","name the suname whose sucode is LIP":"The suname whose sucode is LIP is Lipetskaya oblast'.","which suname has the sucode WLV":"The suname whose sucode is WLV is Wolverhampton.","PC is the sucode of which suname":"The suname whose sucode is PC is Piacenza.","YAN is the sucode of which suname":"The suname whose sucode is YAN is Yamalo-Nenetskiy avtonomnyy okrug.","which suname has the sucode RFH":"The suname whose sucode is RFH is Rafah.","BLK is the sucode of which suname":"The suname whose sucode is BLK is Boulkiemdé.","which suname has the sucode LNO":"The suname whose sucode is LNO is Lunda‐Norte.","name the suname whose sucode is GUE":"The suname whose sucode is GUE is Guelmim.","012 is the sucode of which suname":"The suname whose sucode is 012 is Cerklje na Gorenjskem.","WRT is the sucode of which suname":"The suname whose sucode is WRT is Warrington.","XCI is the sucode of which suname":"The suname whose sucode is XCI is Xocalı.","JWK is the sucode of which suname":"The suname whose sucode is JWK is Jiwaka.","name the suname whose sucode is 036":"The suname whose sucode is 036 is Idrija.","which suname has the sucode STG":"The suname whose sucode is STG is Stirling."}}},
{"id":"n-6d689d91","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","has","hil","invert case","item number","jwk","mad","mia","mic","name","nco","ngz","nth","nue","nwt","ota","pc","sen","slf","swap case","toggle case","tve","vm","wrt","yan"]],["has","sucode"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-766f4e3c","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","capital letters","capitals","cv","dy","has","hil","item number","jwk","mad","mia","mic","name","nco","ngz","nth","nue","nwt","ota","pc","sen","slf","tve","upper case","uppercase","vm","wrt","yan"]],["has","sucode"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-39e6a537","guard":[["hasAny",["act","arn","asz","aya","bes","bgu","blk","bst","btn","buk","ces","cv","cyq","dy","ery","gan","hil","item number","iva","jwk","knr","ksa","lew","lno","mad","mia","mic","mmn","moq","mos","mpl","name","nco","ngz","nle","normalise","normalize","nth","nue","nwt","ota","pc","rfh","sen","simplify the text","slf","stg","tve","ue","vm","wlv","wna","wrt","xci","yan","yuc","zj"]],["has","sucode"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}],["sense.howMany"]]],"mem":null},
{"id":"n-24b98415","guard":[["hasAny",["act","arn","asz","aya","bes","bgo","bgu","bko","blk","bst","bth","btn","buk","bur","caesar cipher","ces","chp","coa","cq","crf","cv","cyq","dev","dy","epw","ery","gan","gue","hil","item number","iva","jwk","kda","knr","ksa","kv","lew","lip","lno","mad","mia","mic","mln","mmn","moq","mos","mpl","nao","nco","nef","nfk","ngz","nle","nth","nue","nwt","old","ota","pc","ply","rfh","rotate the letters","rya","sen","shift by","shift each letter","sif","slf","stg","tve","ue","vla","vm","vov","wlv","wna","wrt","xci","xo","yan","yuc","zj"]],["has","sucode"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}],["sense.howMany"]]],"mem":null},
{"id":"n-70d43a0f","guard":[["hasAny",["has","item number","longest","longest one","longest word","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-a14a08c5","guard":[["hasAny",["has","item number","longest","longest one","longest word","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose sucode is ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-16fc19ce","guard":[["hasAny",["has","item number","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The suname whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-6381140d","guard":[["hasAny",["camel case","camelcase","has","item number","longest","longest one","longest word","lower camel case","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-f5d09141","guard":[["hasAny",["class name","has","item number","longest","longest one","longest word","name","nth","pascal case","pascalcase","upper camel case"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-71eb3ff2","guard":[["hasAny",["has","item number","longest","longest one","longest word","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-7e2f1392","guard":[["hasAny",["has","item number","longest","longest one","longest word","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-d0d2b1bf","guard":[["hasAny",["has","item number","longest","longest one","longest word","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-0a6b04b3","guard":[["hasAny",["has","invert case","item number","longest","longest one","longest word","name","nth","swap case","toggle case"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-172ef1af","guard":[["hasAny",["capitalise","capitalize","capitalize each word","has","item number","longest","longest one","longest word","name","nth","title case"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-6c12544a","guard":[["hasAny",["has","item number","longest","longest one","longest word","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-7d9158da","guard":[["hasAny",["has","item number","longest","longest one","longest word","lower case","lowercase","name","nth","small letters"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-a3ae5a96","guard":[["hasAny",["capital letters","capitals","has","item number","longest","longest one","longest word","name","nth","upper case","uppercase"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-4e16b896","guard":[["hasAny",["class name","has","item number","longest","longest one","longest word","name","nth","pascal case","pascalcase","upper camel case"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-5d6f563e","guard":[["hasAny",["camel case","camelcase","has","item number","longest","longest one","longest word","lower camel case","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-cb8d5b0d","guard":[["hasAny",["has","item number","longest","longest one","longest word","lower case","lowercase","name","nth","small letters"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-06f65d5c","guard":[["has","sucode"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"suname"}]]],"mem":{"table":{"whose sucode is EPW":"The suname whose sucode is EPW is Enga.","whose sucode is CRF":"The suname whose sucode is CRF is Cardiff [Caerdydd GB-CRD].","whose sucode is RYA":"The suname whose sucode is RYA is Ryazanskaya oblast'.","has the sucode MOQ":"The suname whose sucode is MOQ is Moquegua.","whose sucode is 428":"The suname whose sucode is 428 is Kakumiro.","has the sucode 430":"The suname whose sucode is 430 is Bunyangabu.","has the sucode LEW":"The suname whose sucode is LEW is Lewisham.","whose sucode is DEV":"The suname whose sucode is DEV is Devon.","has the sucode CYQ":"The suname whose sucode is CYQ is Chiayi.","has the sucode 229":"The suname whose sucode is 229 is Luuka.","whose sucode is SIF":"The suname whose sucode is SIF is Sidi Ifni.","has the sucode 803":"The suname whose sucode is 803 is Butel.","whose sucode is VOV":"The suname whose sucode is VOV is Oost-Vlaanderen.","has the sucode 083":"The suname whose sucode is 083 is Nazarje.","has the sucode MMN":"The suname whose sucode is MMN is Marrakech-Menara.","whose sucode is BKO":"The suname whose sucode is BKO is Bamako.","has the sucode YUC":"The suname whose sucode is YUC is Yucatán.","whose sucode is NEF":"The suname whose sucode is NEF is Neftçala.","has the sucode KNR":"The suname whose sucode is KNR is Kunaṟ.","has the sucode BUK":"The suname whose sucode is BUK is Bukidnon.","whose sucode is NAO":"The suname whose sucode is NAO is Nahouri.","has the sucode WNA":"The suname whose sucode is WNA is Namur.","has the sucode 130":"The suname whose sucode is 130 is Trebnje.","has the sucode IVA":"The suname whose sucode is IVA is Ivanovskaya oblast'.","has the sucode MOS":"The suname whose sucode is MOS is Moskovskaya oblast'.","whose sucode is 143":"The suname whose sucode is 143 is Zavrč.","has the sucode ZJ":"The suname whose sucode is ZJ is Zhejiang Sheng.","has the sucode AYA":"The suname whose sucode is AYA is Ayacucho.","whose sucode is CHP":"The suname whose sucode is CHP is Chiapas.","has the sucode ARN":"The suname whose sucode is ARN is Arno.","whose sucode is BUR":"The suname whose sucode is BUR is Bury.","has the sucode ERY":"The suname whose sucode is ERY is East Riding of Yorkshire.","has the sucode 161":"The suname whose sucode is 161 is Hodoš.","whose sucode is CQ":"The suname whose sucode is CQ is Chongqing Shi.","whose sucode is XO":"The suname whose sucode is XO is Xorazm.","whose sucode is MLN":"The suname whose sucode is MLN is Midlothian.","whose sucode is VLA":"The suname whose sucode is VLA is Vladimirskaya oblast'.","whose sucode is KV":"The suname whose sucode is KV is Kaposvár.","whose sucode is NFK":"The suname whose sucode is NFK is Norfolk.","whose sucode is 196":"The suname whose sucode is 196 is Cirkulane.","whose sucode is 335":"The suname whose sucode is 335 is Karenga.","has the sucode 334":"The suname whose sucode is 334 is Nabilatuk.","whose sucode is KDA":"The suname whose sucode is KDA is Krasnodarskiy kray.","has the sucode NLE":"The suname whose sucode is NLE is Nuevo León.","has the sucode MPL":"The suname whose sucode is MPL is Morobe.","whose sucode is 435":"The suname whose sucode is 435 is Rwampara.","whose sucode is BTH":"The suname whose sucode is BTH is Bethlehem.","whose sucode is 129":"The suname whose sucode is 129 is Trbovlje.","has the sucode 415":"The suname whose sucode is 415 is Kyenjojo.","has the sucode CES":"The suname whose sucode is CES is Cesar.","whose sucode is PLY":"The suname whose sucode is PLY is Plymouth.","has the sucode UE":"The suname whose sucode is UE is Upper East.","has the sucode 158":"The suname whose sucode is 158 is Grad.","has the sucode KSA":"The suname whose sucode is KSA is Kosrae.","whose sucode is BGO":"The suname whose sucode is BGO is Bengo.","whose sucode is COA":"The suname whose sucode is COA is Coahuila de Zaragoza.","has the sucode 336":"The suname whose sucode is 336 is Madi‐Okollo.","whose sucode is 060":"The suname whose sucode is 060 is Litija.","has the sucode GAN":"The suname whose sucode is GAN is Ganzourgou.","whose sucode is OLD":"The suname whose sucode is OLD is Oldham.","whose sucode is LIP":"The suname whose sucode is LIP is Lipetskaya oblast'.","has the sucode WLV":"The suname whose sucode is WLV is Wolverhampton.","has the sucode RFH":"The suname whose sucode is RFH is Rafah.","has the sucode LNO":"The suname whose sucode is LNO is Lunda‐Norte.","whose sucode is GUE":"The suname whose sucode is GUE is Guelmim.","whose sucode is 036":"The suname whose sucode is 036 is Idrija.","has the sucode STG":"The suname whose sucode is STG is Stirling."}}},
{"id":"n-696124c0","guard":[["hasAny",["appears in","contains","includes","item number","longest","longest one","longest word","nth","sucode"]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],["sense.after",{"lit":"is"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-c7d98d74","guard":[["not",["hasAny",["40c","abbreviation","aereas","airport","album","alone","alpha","angeles","annoyance","aptly","areomn","artist","artless","author","baited","beautiful","beemster","begun","bgrtur","bliss","boil","bounty","breed","building","calling","campi","capita","carnal","category","character","characters","cheese","claudius","code","combined","company","composition","confront","continental","country","co₂","currency","dablam","date","dear","description","dialogue","director","discreet","disgrace","dish","doinyo","domain","dominion","dudes","electricity","emoji","espfraita","everyone","expire","expo","extorted","eye","featuring","file","float","forward","fraita","freely","french","gdp","gender","gentleman","gmsl","golgotha","gonzago","gossip","gunz","habits","hand","heatwave","hencebanished","hie","him","his","hoar","holla","holy","honourd","horatio","hours","hrvsrbbih","hrvsrbbihroubgr","http","icao","infold","iso2","ist","judge1","juliet","language","larger","latitude","lbs","liurenwu","lockd","long","lord","massy","mcdonald","mexusa","miquelon","mozzwezmb","n3","newborn","not","number","numeric","painted","person","phoenix","phrase","piñas","positas","postal","prairie","prate","prickd","prison","program","province","publication","published","rainfall","rapiers","rapt","rating","red","region","reign","sa","scene","scooby","security","seeking","seyton","she","short","shortname","slug","smaller","solemn","sponsorship","strstate","subregion","sucountry","sum","symbol","table","thee","thorn","thou","ticker","time","title","turbgrrourusgeo","type","url","vegas","well","wife","winter","writers","year"]]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],["sense.after",{"lit":"is"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-5947b58b","guard":[["hasAny",["delete","item number","nth","strip out","sucode","without"]],["has","is"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}],["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucountry"}],{"lit":1}]]],"mem":null},
{"id":"n-959fdfb3","guard":[["not",["hasAny",["166","370","40c","504","804","808","812","abbreviation","acerra","add","addition","adult","aereas","airline","airport","album","alone","alpha","andenne","angeles","annoyance","applicationvndpgformat","aptly","areomn","artist","artless","atl","author","bab","baimajing","baited","banfora","banquo","basirpur","beautiful","beemster","bellavista","bevli","bf","bfb","bfcom","bfnou","bfpon","bgrtur","bgw","bioko","bkm","bliss","boil","boy","breed","building","call","calling","campi","capita","carnal","category","cawdor","ccg","ceb","cgac","champignysurmarne","character","characters","cheese","city","claudius","climbing","co2includinglucperunitenergy","coalco2percapita","code","combined","company","compare","composition","confront","consecutive","consumptionco2percapita","continental","country","cozumel","currency","cvb","dablam","dalai","daocheng","date","dealership","dear","demand","description","dialing","dialogue","director","disasters","discreet","disgrace","dish","dividend","doinyo","domain","dominion","dt","dudes","element","emoji","energy","english","esi","espfraita","everyone","excuse","expire","expo","extorted","falls","featuring","fights","file","fj","fj01","float","forward","found","fraita","frankenthal","freely","french","fuel","fussa","gap","gasco2percapita","gdp","gender","gentleman","ghgpercapita","gmsl","golgotha","gonzago","goražde","gt09","gunz","habboûch","habits","haldia","hand","have","hear","heatwave","hencebanished","hie","his","hoar","holla","holy","homer","honourd","horatio","hours","hrvsrbbih","hrvsrbbihroubgr","http","icao","industries","infects","infold","ir05","ir12","iso2","iso3","ist","itan","javascript","jowls","judge1","juliet","keeps","khasab","kilwinning","laboursome","landusechangeco2percapita","lang","language","larger","latitude","lbak","lbs","lesser","like","liurenwu","long","lord","love","lsc","maj","makes","manjulas","mark","maroubra","massapequa","massy","mat","mcdonald","mek","mexusa","miquelon","missérété","mistresses","mk606","mk701","mk802","model","more","mozzwezmb","musanze","mxpue","n3","national","nationality","nih","nj","not","number","numeric","obscured","oilco2percapita","one","opendate","out","painted","parrots","person","pge","pgmba","phoenix","phrase","pirané","piñas","pnz","positas","postal","prairie","prate","prickd","prison","program","publication","published","pw350","rainfall","ranau","rapt","rating","region","reign","rfc","saumur","scene","scooby","sector","security","session","seyton","she","short","shortname","simpson","slug","smaller","solemn","soloist","song","speaker","stands","state","sth","strstate","subcategory","subornd","subregion","succeeding","sucountry","suggest","sum","sutype","symbol","table","tdeo","tell","thee","things","think","thou","thủy","ticker","time","tis","title","total","tup","turbgrrourusgeo","twoletter","twoman","type","unaizah","uncertainty","uq","url","vegas","version","vlg","vn52","wear","wedel","week","well","what","whos","wife","winter","writers","wu","year","yemw","yitao","yōga","đố"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}],["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucountry"}],{"lit":1}]]],"mem":null},
{"id":"n-0dce5a1d","guard":[["hasAny",["act","arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","coa","cq","cv","cyq","dev","dy","epw","ery","gan","gue","hil","item number","jwk","kda","knr","ksa","kv","lew","mad","mia","mic","mln","moq","mpl","nao","nco","nef","nfk","ngz","nle","normalise","normalize","nth","nue","nwt","old","ota","pc","ply","rfh","sen","sif","simplify the text","slf","stg","ue","vm","wlv","wna","wrt","xci","xo","yuc","zj"]],["has","sucode"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}],{"lit":1}]],"mem":null},
{"id":"n-0e3fd8de","guard":[["hasAny",["act","arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","coa","cq","cv","cyq","dev","dy","epw","gan","gue","hil","item number","jwk","kda","knr","ksa","kv","lew","mad","mia","mic","mln","moq","mpl","nao","nco","nef","nfk","ngz","nle","normalise","normalize","nth","nue","nwt","old","ota","pc","ply","rfh","sen","sif","simplify the text","slf","stg","ue","vm","wlv","wna","wrt","xci","xo","yuc","zj"]],["has","sucode"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}],{"lit":2}]],"mem":null},
{"id":"n-a6728932","guard":[["hasAny",["act","arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","coa","cq","cv","cyq","dev","epw","gan","gue","hil","item number","jwk","kda","knr","ksa","kv","lew","mad","mia","mln","moq","mpl","nao","nco","nef","nfk","normalise","normalize","nth","nwt","old","ota","pc","ply","rfh","sen","simplify the text","slf","stg","vm","wlv","wna","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}],{"lit":3}]],"mem":null},
{"id":"n-af717294","guard":[["hasAny",["2a","arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","cv","cyq","dev","epw","gan","gue","hil","item number","jwk","knr","ksa","kv","lew","lno","mad","mia","mln","mmn","moq","mpl","nao","nco","nef","nfk","nth","old","ota","pc","ply","reverse the words","reverse word order","rfh","sen","slf","stg","vm","vov","wlv","wna","words backwards","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-1c36052d","guard":[["hasAny",["2a","arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","cv","cyq","dashes","dev","epw","gan","gue","hil","hyphens","item number","jwk","kebab case","kebabcase","knr","ksa","kv","lew","mad","mia","mln","mmn","moq","mpl","nao","nco","nef","nfk","nth","old","ota","pc","ply","rfh","sen","slf","stg","vm","vov","wlv","wna","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-2b12d9a5","guard":[["hasAny",["arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","cv","cyq","dev","each word","epw","gan","gue","hil","item number","jwk","knr","ksa","kv","lew","mad","mia","mln","moq","mpl","nao","nco","nef","nfk","nth","old","ota","pc","ply","rfh","sen","slf","split into words","stg","vm","wlv","wna","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-4a510b04","guard":[["hasAny",["arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","cv","cyq","dev","epw","gan","gue","hil","item number","jwk","knr","ksa","kv","lew","mad","mia","mln","moq","mpl","nao","nco","nef","nfk","nth","old","ota","pc","ply","rfh","sen","slf","snake case","snakecase","stg","underscores","variable name","vm","wlv","wna","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-654f934d","guard":[["hasAny",["arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","class name","cv","cyq","dev","epw","gan","gue","hil","item number","jwk","knr","ksa","kv","lew","mad","mia","mln","moq","mpl","nao","nco","nef","nfk","nth","old","ota","pascal case","pascalcase","pc","ply","rfh","sen","slf","stg","upper camel case","vm","wlv","wna","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-6f48dc3c","guard":[["hasAny",["arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","camel case","camelcase","ces","chp","cv","cyq","dev","epw","gan","gue","hil","item number","jwk","knr","ksa","kv","lew","lower camel case","mad","mia","mln","moq","mpl","nao","nco","nef","nfk","nth","old","ota","pc","ply","rfh","sen","slf","stg","vm","wlv","wna","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-8f5a991e","guard":[["hasAny",["arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","cv","cyq","dev","each word","epw","gan","gue","hil","item number","jwk","knr","ksa","kv","lew","mad","mia","mln","moq","mpl","nao","nco","nef","nfk","nth","old","ota","pc","ply","rfh","sen","slf","split into words","stg","vm","wlv","wna","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-e4be82b9","guard":[["hasAny",["arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","cv","cyq","dev","each word","epw","gan","gue","hil","item number","jwk","knr","ksa","kv","lew","mad","mia","mln","moq","mpl","nao","nco","nef","nfk","nth","old","ota","pc","ply","rfh","sen","slf","split into words","stg","vm","wlv","wna","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-b8c11097","guard":[["hasAny",["arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","cv","cyq","dev","each word","epw","gan","gue","hil","item number","jwk","knr","ksa","kv","lew","mad","mia","mln","moq","mpl","nao","nco","nef","nfk","nth","old","ota","pc","ply","rfh","sen","shortest","shortest one","shortest word","slf","split into words","stg","vm","wlv","wna","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]]],"mem":null},
{"id":"n-fb6d8649","guard":[["hasAny",["arn","aya","bes","bgo","bgu","bko","blk","bth","btn","buk","bur","ces","chp","cv","cyq","dev","each word","epw","gan","gue","hil","item number","jwk","knr","ksa","kv","lew","longest","longest one","longest word","mad","mia","mln","moq","mpl","nao","nco","nef","nfk","nth","old","ota","pc","ply","rfh","sen","slf","split into words","stg","vm","wlv","wna","wrt","xci","xo","yuc"]],["has","sucode"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]]],"mem":null},
{"id":"n-e28265ba","guard":[["hasAny",["arn","aya","bgo","bko","bth","buk","bur","ces","chp","cyq","dev","epw","gan","gue","item number","knr","ksa","kv","lew","lno","longest","longest one","longest word","mln","mmn","moq","mpl","nao","nef","nfk","nth","old","ply","reverse the words","reverse word order","rfh","stg","vov","wlv","wna","words backwards","xo","yuc"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-506c053f","guard":[["hasAny",["has","item number","nth"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-0dc144ad","guard":[["hasAny",["arn","aya","bgo","bko","bth","buk","bur","ces","chp","cyq","dashes","dev","epw","gan","gue","hyphens","item number","kebab case","kebabcase","knr","ksa","kv","lew","longest","longest one","longest word","mln","mmn","moq","mpl","nao","nef","nfk","nth","old","ply","rfh","stg","vov","wlv","wna","xo","yuc"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-18740457","guard":[["hasAny",["class name","has","item number","nth","pascal case","pascalcase","upper camel case"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-5818e204","guard":[["hasAny",["has","item number","nth"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-e857a5d4","guard":[["hasAny",["has","invert case","item number","nth","swap case","toggle case"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-563cd244","guard":[["hasAny",["first n","has","item number","nth"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-5bdf2f96","guard":[["hasAny",["first n","has","item number","nth"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-845825b2","guard":[["hasAny",["each word","has","item number","nth","split into words"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-c0384412","guard":[["hasAny",["each word","has","item number","nth","split into words"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-87df2a84","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose sucode is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-decf6a50","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","shortest","shortest one","shortest word","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-32dce98b","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The suname whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-f00108f9","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-59152264","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.and",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-c46c3023","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-344ef230","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-4173d5ff","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","class name","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pascal case","pascalcase","pc","sen","slf","tve","upper camel case","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-441690ec","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","camel case","camelcase","cv","dy","hil","item number","jwk","longest","longest one","longest word","lower camel case","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.camel",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-690a3d18","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","capitalise","capitalize","capitalize each word","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","title case","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-8aa486f7","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-aa28ab63","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-c689e8a5","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","invert case","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","swap case","toggle case","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-d1e7f5a9","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","capital letters","capitals","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","upper case","uppercase","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.upper",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-dbda2fbe","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","longest","longest one","longest word","lower case","lowercase","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","small letters","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-001f4a19","guard":[["hasAny",["item number","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-72d86567","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","class name","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pascal case","pascalcase","pc","sen","slf","tve","upper camel case","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-99c2da6c","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-b70e6f77","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","capitalise","capitalize","capitalize each word","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","title case","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-bff26250","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dashes","dy","hil","hyphens","item number","jwk","kebab case","kebabcase","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.kebab",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-c6ac16a6","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","snake case","snakecase","tve","underscores","variable name","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.snake",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-ec3e5991","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","each word","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","split into words","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-f57553bc","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","item number","jwk","longest","longest one","longest word","lower case","lowercase","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","small letters","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-f59f6dfa","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","each word","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","split into words","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-fbc9877a","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","camel case","camelcase","cv","dy","hil","item number","jwk","longest","longest one","longest word","lower camel case","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","tve","vm","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-039857ec","guard":[["hasAny",["item number","name","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-4717c41a","guard":[["hasAny",["class name","item number","name","nth","pascal case","pascalcase","upper camel case"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-f0f5f449","guard":[["hasAny",["invert case","item number","name","nth","swap case","toggle case"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-55160afa","guard":[["hasAny",["each word","item number","name","nth","split into words"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-84053c39","guard":[["hasAny",["each word","item number","name","nth","split into words"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-52ba9fd5","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","delete","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","of","ota","pc","sen","slf","strip out","tve","vm","without","wrt","xci","yan"]],["has","sucode"],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucountry"}],{"lit":1}]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-a8fef7da","guard":[["has","sucode"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"of"}]]],"mem":{"table":{"NUE is the sucode":"The suname whose sucode is NUE is Nueva Ecija.","HIL is the sucode":"The suname whose sucode is HIL is Hillingdon.","NGZ is the sucode":"The suname whose sucode is NGZ is North Gaza.","MIC is the sucode":"The suname whose sucode is MIC is Michoacán de Ocampo.","SLF is the sucode":"The suname whose sucode is SLF is Salford.","DY is the sucode":"The suname whose sucode is DY is Dayr az Zawr.","SEN is the sucode":"The suname whose sucode is SEN is Séno.","2A is the sucode":"The suname whose sucode is 2A is Corse-du-Sud.","ASZ is the sucode":"The suname whose sucode is ASZ is Assa-Zag (EH-partial).","BST is the sucode":"The suname whose sucode is BST is Bristol, City of.","505 is the sucode":"The suname whose sucode is 505 is Kruševo.","CV is the sucode":"The suname whose sucode is CV is Covasna.","NCO is the sucode":"The suname whose sucode is NCO is Kotabato.","OTA is the sucode":"The suname whose sucode is OTA is Otago.","MAD is the sucode":"The suname whose sucode is MAD is Marinduque.","TVE is the sucode":"The suname whose sucode is TVE is Tverskaya oblast'.","216 is the sucode":"The suname whose sucode is 216 is Amuria.","BTN is the sucode":"The suname whose sucode is BTN is Batanes.","BES is the sucode":"The suname whose sucode is BES is Benslimane.","VM is the sucode":"The suname whose sucode is VM is Veszprém.","ACT is the sucode":"The suname whose sucode is ACT is Australian Capital Territory.","147 is the sucode":"The suname whose sucode is 147 is Žiri.","BGU is the sucode":"The suname whose sucode is BGU is Benguela.","MIA is the sucode":"The suname whose sucode is MIA is Miaoli.","NWT is the sucode":"The suname whose sucode is NWT is New Taipei.","508 is the sucode":"The suname whose sucode is 508 is Prilep.","PC is the sucode":"The suname whose sucode is PC is Piacenza.","YAN is the sucode":"The suname whose sucode is YAN is Yamalo-Nenetskiy avtonomnyy okrug.","BLK is the sucode":"The suname whose sucode is BLK is Boulkiemdé.","012 is the sucode":"The suname whose sucode is 012 is Cerklje na Gorenjskem.","WRT is the sucode":"The suname whose sucode is WRT is Warrington.","XCI is the sucode":"The suname whose sucode is XCI is Xocalı.","JWK is the sucode":"The suname whose sucode is JWK is Jiwaka."}}},
{"id":"n-5ec4fd89","guard":[["hasAny",["arn","aya","bgo","bko","bth","buk","bur","ces","chp","class name","cyq","dev","epw","gan","gue","item number","knr","ksa","kv","lew","longest","longest one","longest word","mln","moq","mpl","nao","nef","nfk","nth","old","pascal case","pascalcase","ply","rfh","stg","upper camel case","wlv","wna","xo","yuc"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-a4ced92d","guard":[["hasAny",["arn","aya","bgo","bko","bth","buk","bur","camel case","camelcase","ces","chp","cyq","dev","epw","gan","gue","item number","knr","ksa","kv","lew","longest","longest one","longest word","lower camel case","mln","moq","mpl","nao","nef","nfk","nth","old","ply","rfh","stg","wlv","wna","xo","yuc"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-25a3a3db","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","capital letters","capitals","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","ota","pc","sen","slf","tve","upper case","uppercase","vm","wrt","yan"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-735e6721","guard":[["hasAny",["2a","act","asz","bes","bgu","blk","bst","btn","cv","dy","hil","invert case","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","ota","pc","sen","slf","swap case","toggle case","tve","vm","wrt","yan"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-2d0446fd","guard":[["hasAny",["act","asz","bes","bgu","blk","bst","btn","caesar cipher","cv","dy","hil","item number","jwk","longest","longest one","longest word","mad","mia","mic","nco","ngz","nth","nue","nwt","ota","pc","rotate the letters","sen","shift by","shift each letter","slf","tve","vm","wrt","xci","yan"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.caesar",["sense.lastWord"],["sense.howMany"]],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-65c9b6e1","guard":[["hasAny",["appears in","contains","includes","item number","longest","longest one","longest word","nth","position","sucode"]]],"pyramid":["render.yesNo",["compare.contains",["sense.lastWord"],["sense.numeral"]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-dc2fdd55","guard":[["hasAny",["item number","nth","position","sucode"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}],["sense.howMany"]]],"mem":null},
{"id":"n-564e9f4f","guard":[["has","sucode"]],"pyramid":["render.str",["memory.lookup",["sense.numeral"]]],"mem":{"table":{"129":"The suname whose sucode is 129 is Trbovlje.","130":"The suname whose sucode is 130 is Trebnje.","143":"The suname whose sucode is 143 is Zavrč.","147":"The suname whose sucode is 147 is Žiri.","158":"The suname whose sucode is 158 is Grad.","161":"The suname whose sucode is 161 is Hodoš.","196":"The suname whose sucode is 196 is Cirkulane.","216":"The suname whose sucode is 216 is Amuria.","229":"The suname whose sucode is 229 is Luuka.","334":"The suname whose sucode is 334 is Nabilatuk.","335":"The suname whose sucode is 335 is Karenga.","336":"The suname whose sucode is 336 is Madi‐Okollo.","415":"The suname whose sucode is 415 is Kyenjojo.","428":"The suname whose sucode is 428 is Kakumiro.","430":"The suname whose sucode is 430 is Bunyangabu.","435":"The suname whose sucode is 435 is Rwampara.","505":"The suname whose sucode is 505 is Kruševo.","508":"The suname whose sucode is 508 is Prilep.","803":"The suname whose sucode is 803 is Butel.","083":"The suname whose sucode is 083 is Nazarje.","2A":"The suname whose sucode is 2A is Corse-du-Sud.","060":"The suname whose sucode is 060 is Litija.","012":"The suname whose sucode is 012 is Cerklje na Gorenjskem.","036":"The suname whose sucode is 036 is Idrija."}}},
{"id":"n-bc455590","guard":[["hasAny",["2a","bes","bgu","blk","btn","cv","dashes","hil","hyphens","item number","jwk","kebab case","kebabcase","longest","longest one","longest word","mad","mia","nco","nth","ota","pc","sen","slf","vm","wrt","xci"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-d5f702be","guard":[["hasAny",["2a","bes","bgu","blk","btn","cv","hil","item number","jwk","longest","longest one","longest word","mad","mia","nco","nth","ota","pc","reverse the words","reverse word order","sen","slf","vm","words backwards","wrt","xci"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-8e8896a2","guard":[["hasAny",["bes","bgu","blk","btn","cv","hil","item number","jwk","longest","longest one","longest word","mad","mia","nco","nth","ota","pc","sen","slf","snake case","snakecase","underscores","variable name","vm","wrt","xci"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-9db22295","guard":[["hasAny",["bes","bgu","blk","btn","class name","cv","hil","item number","jwk","longest","longest one","longest word","mad","mia","nco","nth","ota","pascal case","pascalcase","pc","sen","slf","upper camel case","vm","wrt","xci"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-a700c17a","guard":[["hasAny",["bes","bgu","blk","btn","camel case","camelcase","cv","hil","item number","jwk","longest","longest one","longest word","lower camel case","mad","mia","nco","nth","ota","pc","sen","slf","vm","wrt","xci"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-daf41fdb","guard":[["hasAny",["bes","bgu","blk","btn","cv","each word","hil","item number","jwk","longest","longest one","longest word","mad","mia","nco","nth","ota","pc","sen","slf","split into words","vm","wrt","xci"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]]],"mem":null},
{"id":"n-f515dc9e","guard":[["hasAny",["appears in","contains","element","has","includes","item number","longest","longest one","longest word","nth","position","sucode"]]],"pyramid":["render.yesNo",["compare.contains",["sense.numeral"],["sense.after",{"lit":"is"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]]],"mem":null},
{"id":"n-5d3ba921","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","sucode","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}],["sense.roman"]]],"mem":null},
{"id":"n-5bb04f0c","guard":[["has","sucode"]],"pyramid":["render.str",["memory.lookup",["sense.roman"]]],"mem":{"table":{"CV":"The suname whose sucode is CV is Covasna.","XCI":"The suname whose sucode is XCI is Xocalı."}}},
{"id":"n-02a0fcd1","guard":[["hasAny",["longest one","longest word","vm"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Veszprém."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-055ee07f","guard":[["hasAny",["longest one","longest word","nue"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Nueva Ecija."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-06d9b416","guard":[["hasAny",["longest one","longest word","xci"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Xocalı."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-0c898927","guard":[["hasAny",["longest one","longest word","tve"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Tverskaya oblast'."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-111de008","guard":[["hasAny",["dy","longest one","longest word"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Dayr az Zawr."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-1774f858","guard":[["hasAny",["longest one","longest word","ngz"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is North Gaza."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-1f4cc212","guard":[["hasAny",["2a","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Corse-du-Sud."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-31f967cb","guard":[["hasAny",["bst","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Bristol, City of."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-4714645c","guard":[["hasAny",["bgu","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Benguela."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-49114fb2","guard":[["hasAny",["blk","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Boulkiemdé."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-5b258c85","guard":[["hasAny",["longest one","longest word","mic"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Michoacán de Ocampo."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-5de1bafb","guard":[["hasAny",["longest one","longest word","pc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Piacenza."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-6c1804b8","guard":[["hasAny",["longest one","longest word","nco"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Kotabato."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-73a6eed6","guard":[["hasAny",["longest one","longest word","wrt"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Warrington."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-7b97d79b","guard":[["hasAny",["longest one","longest word","mia"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Miaoli."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-81ccd0bb","guard":[["hasAny",["longest one","longest word","sen"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Séno."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-83772648","guard":[["hasAny",["longest one","longest word","yan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Yamalo-Nenetskiy avtonomnyy okrug."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-92deb741","guard":[["hasAny",["longest one","longest word","mad"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Marinduque."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-93296f91","guard":[["hasAny",["longest one","longest word","slf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Salford."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-967611c9","guard":[["hasAny",["bes","longest one","longest word"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Benslimane."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-9ba5db03","guard":[["hasAny",["cv","longest one","longest word"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Covasna."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-a017ef5c","guard":[["hasAny",["jwk","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Jiwaka."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-a92161f0","guard":[["hasAny",["btn","longest one","longest word"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Batanes."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-c36c54d8","guard":[["hasAny",["act","longest one","longest word"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Australian Capital Territory."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-d41795ca","guard":[["hasAny",["hil","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Hillingdon."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-e2eb5346","guard":[["hasAny",["longest one","longest word","ota"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Otago."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-e6060b86","guard":[["hasAny",["longest one","longest word","nwt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is New Taipei."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-fc5417d4","guard":[["hasAny",["asz","longest one","longest word"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Assa-Zag (EH-partial)."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-017f2c4a","guard":[["hasAny",["item number","longest one","longest word","nth","old"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Oldham."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-09298a1d","guard":[["hasAny",["item number","ksa","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Kosrae."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-0a0950b3","guard":[["hasAny",["gue","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Guelmim."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-0cd86b57","guard":[["hasAny",["item number","longest one","longest word","nth","ue"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Upper East."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-1c560859","guard":[["hasAny",["item number","longest one","longest word","nth","yuc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Yucatán."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-25d01286","guard":[["hasAny",["buk","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Bukidnon."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-29d978fc","guard":[["hasAny",["item number","kv","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Kaposvár."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-2a8c0247","guard":[["hasAny",["item number","lew","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Lewisham."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-2b19fac8","guard":[["hasAny",["item number","longest one","longest word","nth","zj"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Zhejiang Sheng."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-2f2bd21c","guard":[["hasAny",["item number","longest one","longest word","mpl","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Morobe."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-32978b9c","guard":[["hasAny",["item number","lip","longest one","longest word","nth"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Lipetskaya oblast'."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-36e2cf1e","guard":[["hasAny",["item number","longest one","longest word","mos","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Moskovskaya oblast'."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-3dea4b44","guard":[["hasAny",["item number","longest one","longest word","moq","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Moquegua."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-435a5816","guard":[["hasAny",["bth","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Bethlehem."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-4625b174","guard":[["hasAny",["item number","longest one","longest word","nle","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Nuevo León."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-49c0fb83","guard":[["hasAny",["item number","knr","longest one","longest word","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Kunaṟ."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-4e246618","guard":[["hasAny",["bur","item number","longest one","longest word","nth"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Bury."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-50aaa0f7","guard":[["hasAny",["item number","longest one","longest word","nth","wna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Namur."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-51595519","guard":[["hasAny",["coa","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Coahuila de Zaragoza."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-58838ec5","guard":[["hasAny",["item number","longest one","longest word","nth","ply"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Plymouth."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-641026d9","guard":[["hasAny",["arn","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Arno."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-6660974a","guard":[["hasAny",["bgo","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Bengo."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-6e3b37b4","guard":[["hasAny",["item number","longest one","longest word","nef","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Neftçala."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-6ebfcd33","guard":[["hasAny",["item number","kda","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Krasnodarskiy kray."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-731e86f9","guard":[["hasAny",["crf","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Cardiff [Caerdydd GB-CRD]."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-779b6361","guard":[["hasAny",["item number","lno","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Lunda‐Norte."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-7807f701","guard":[["hasAny",["item number","longest one","longest word","nth","wlv"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Wolverhampton."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-78d489f4","guard":[["hasAny",["item number","iva","longest one","longest word","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Ivanovskaya oblast'."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-80137fda","guard":[["hasAny",["dev","item number","longest one","longest word","nth"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Devon."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-8573e30d","guard":[["hasAny",["item number","longest one","longest word","nth","rya"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Ryazanskaya oblast'."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-8f5441f9","guard":[["hasAny",["bko","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Bamako."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-92bc93a1","guard":[["hasAny",["item number","longest one","longest word","nth","stg"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Stirling."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-9429ef9c","guard":[["hasAny",["item number","longest one","longest word","nth","vla"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Vladimirskaya oblast'."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-9b095205","guard":[["hasAny",["item number","longest one","longest word","nth","rfh"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Rafah."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-9d7e6faf","guard":[["hasAny",["chp","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Chiapas."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-a2fa0e2c","guard":[["hasAny",["epw","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Enga."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-a4204879","guard":[["hasAny",["cyq","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Chiayi."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-a7b214e1","guard":[["hasAny",["item number","longest one","longest word","nao","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Nahouri."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-ac27dc7e","guard":[["hasAny",["aya","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Ayacucho."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-adbd1a94","guard":[["hasAny",["item number","longest one","longest word","mmn","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Marrakech-Menara."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-b40fa358","guard":[["hasAny",["gan","item number","longest one","longest word","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Ganzourgou."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-b788648e","guard":[["hasAny",["cq","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Chongqing Shi."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-b9993f79","guard":[["hasAny",["ces","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Cesar."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-c2de2dca","guard":[["hasAny",["item number","longest one","longest word","nth","xo"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Xorazm."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-cf1a0bcc","guard":[["hasAny",["item number","longest one","longest word","nth","vov"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Oost-Vlaanderen."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-d051fbe6","guard":[["hasAny",["item number","longest one","longest word","mln","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Midlothian."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-dbc3bad0","guard":[["hasAny",["ery","item number","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is East Riding of Yorkshire."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-f82cfe23","guard":[["hasAny",["item number","longest one","longest word","nth","sif"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Sidi Ifni."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-fca5ef95","guard":[["hasAny",["item number","longest one","longest word","nfk","nth"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Norfolk."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}]]],"mem":null},
{"id":"n-06c0a945","guard":[["hasAny",["item number","longest","longest one","longest word","mad","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is MAD is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-0be7af5f","guard":[["hasAny",["asz","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ASZ is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-1adbb45d","guard":[["hasAny",["blk","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is BLK is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-2c6245a1","guard":[["hasAny",["item number","longest","longest one","longest word","mia","nth"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is MIA is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-304075e1","guard":[["hasAny",["item number","longest","longest one","longest word","nth","slf"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is SLF is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-36b0e910","guard":[["hasAny",["hil","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is HIL is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-455f6af5","guard":[["hasAny",["item number","longest","longest one","longest word","nth","nwt"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is NWT is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-5724046d","guard":[["hasAny",["bgu","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is BGU is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-66bdb6f7","guard":[["hasAny",["2a","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is 2A is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-68c3d3cd","guard":[["hasAny",["item number","longest","longest one","longest word","mic","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is MIC is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-694357a1","guard":[["hasAny",["item number","longest","longest one","longest word","nth","pc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is PC is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-7548a448","guard":[["hasAny",["item number","longest","longest one","longest word","nth","vm"]],["has","is"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is VM is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-755469b9","guard":[["hasAny",["item number","jwk","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is JWK is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-7c45bb05","guard":[["hasAny",["dy","item number","longest","longest one","longest word","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is DY is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-865444bf","guard":[["hasAny",["btn","item number","longest","longest one","longest word","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is BTN is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-888ebf67","guard":[["hasAny",["item number","longest","longest one","longest word","nth","xci"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is XCI is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-8a53aac7","guard":[["hasAny",["bes","item number","longest","longest one","longest word","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is BES is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-9190cdbd","guard":[["hasAny",["item number","longest","longest one","longest word","nth","sen"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is SEN is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-9a6f02bd","guard":[["hasAny",["item number","longest","longest one","longest word","nco","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is NCO is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-9b376785","guard":[["hasAny",["item number","longest","longest one","longest word","nth","ota"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is OTA is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-ad9c55f8","guard":[["hasAny",["act","item number","longest","longest one","longest word","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ACT is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-c6b18568","guard":[["hasAny",["item number","longest","longest one","longest word","nth","nue"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is NUE is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-c704e8d3","guard":[["hasAny",["item number","longest","longest one","longest word","ngz","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is NGZ is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-c8205424","guard":[["hasAny",["item number","longest","longest one","longest word","nth","tve"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is TVE is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-cd2eaa59","guard":[["hasAny",["item number","longest","longest one","longest word","nth","wrt"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is WRT is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-db8d48f7","guard":[["hasAny",["item number","longest","longest one","longest word","nth","yan"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is YAN is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-dc0b642a","guard":[["hasAny",["cv","item number","longest","longest one","longest word","nth"]],["has","sucode"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is CV is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-f5327b26","guard":[["hasAny",["bst","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is BST is ",{"slot":2},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-01cf0cb4","guard":[["hasAny",["gue","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is GUE is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-06a63923","guard":[["hasAny",["item number","longest","longest one","longest word","nth","vov"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is VOV is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-0d01d63c","guard":[["hasAny",["item number","longest","longest one","longest word","mpl","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is MPL is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-0d8ee7c1","guard":[["hasAny",["item number","longest","longest one","longest word","nth","stg"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is STG is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-16edf061","guard":[["hasAny",["item number","longest","longest one","longest word","nle","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is NLE is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-1faa3343","guard":[["hasAny",["item number","iva","longest","longest one","longest word","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is IVA is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-21a43f90","guard":[["hasAny",["item number","longest","longest one","longest word","nth","ply"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is PLY is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-247e15e9","guard":[["hasAny",["item number","ksa","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is KSA is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-24e8dad7","guard":[["hasAny",["buk","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is BUK is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-2561c824","guard":[["hasAny",["chp","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is CHP is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-2742bb32","guard":[["hasAny",["item number","longest","longest one","longest word","mln","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is MLN is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-2c7af180","guard":[["hasAny",["item number","longest","longest one","longest word","nth","old"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is OLD is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-2d16c0f3","guard":[["hasAny",["item number","longest","longest one","longest word","nth","zj"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ZJ is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-2dc9fafa","guard":[["hasAny",["crf","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is CRF is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-3125e1bb","guard":[["hasAny",["item number","longest","longest one","longest word","nao","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is NAO is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-31f1ee96","guard":[["hasAny",["cyq","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is CYQ is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-32e033f2","guard":[["hasAny",["item number","kda","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is KDA is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-4849f9e9","guard":[["hasAny",["ery","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ERY is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-4891ede6","guard":[["hasAny",["item number","kv","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is KV is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-4b46c3eb","guard":[["hasAny",["item number","longest","longest one","longest word","mos","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is MOS is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-511c6331","guard":[["hasAny",["item number","longest","longest one","longest word","nth","sif"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is SIF is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-589aa202","guard":[["hasAny",["cq","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is CQ is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-5ef5c305","guard":[["hasAny",["item number","longest","longest one","longest word","nth","rfh"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is RFH is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-6240ec93","guard":[["hasAny",["epw","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is EPW is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-6f0ef3b2","guard":[["hasAny",["aya","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is AYA is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-6f75e83c","guard":[["hasAny",["item number","lew","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is LEW is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-706ce7a9","guard":[["hasAny",["gan","item number","longest","longest one","longest word","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is GAN is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-71bf152e","guard":[["hasAny",["item number","lno","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is LNO is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-731c468c","guard":[["hasAny",["bth","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is BTH is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-79434a3d","guard":[["hasAny",["item number","longest","longest one","longest word","nth","wlv"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is WLV is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-7ecff79c","guard":[["hasAny",["item number","longest","longest one","longest word","nth","wna"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is WNA is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-83e4b1db","guard":[["hasAny",["item number","longest","longest one","longest word","nth","rya"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is RYA is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-848725da","guard":[["hasAny",["item number","longest","longest one","longest word","mmn","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is MMN is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-85341261","guard":[["hasAny",["item number","longest","longest one","longest word","nth","yuc"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is YUC is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-87118ef9","guard":[["hasAny",["item number","longest","longest one","longest word","nef","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is NEF is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-98fe45c8","guard":[["hasAny",["item number","longest","longest one","longest word","nth","xo"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is XO is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-996c91f0","guard":[["hasAny",["coa","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is COA is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-9bfe5377","guard":[["hasAny",["ces","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is CES is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-a9e54f16","guard":[["hasAny",["item number","longest","longest one","longest word","nth","vla"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is VLA is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-b006027b","guard":[["hasAny",["item number","longest","longest one","longest word","nfk","nth"]],["has","suname"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is NFK is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-b011a805","guard":[["hasAny",["arn","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ARN is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-b02f8c57","guard":[["hasAny",["bgo","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is BGO is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-c48c38d9","guard":[["hasAny",["item number","lip","longest","longest one","longest word","nth"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is LIP is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-cd98760e","guard":[["hasAny",["bur","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is BUR is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-e7dc8114","guard":[["hasAny",["bko","item number","longest","longest one","longest word","nth"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is BKO is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-ebab7f5e","guard":[["hasAny",["item number","knr","longest","longest one","longest word","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is KNR is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-f57702b5","guard":[["hasAny",["dev","item number","longest","longest one","longest word","nth"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is DEV is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-f65311a4","guard":[["hasAny",["item number","longest","longest one","longest word","moq","nth"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is MOQ is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-f80a85cc","guard":[["hasAny",["item number","longest","longest one","longest word","nth","ue"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is UE is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"}],{"lit":1}],{"lit":"fr-un-locode-subdivision-codes-0859f3"},{"lit":"sucode"},{"lit":"suname"}]],"mem":null},
{"id":"n-020ab41e","guard":[["hasAny",["has","sucode","suname","wlv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode WLV":"The suname whose sucode is WLV is Wolverhampton."}}},
{"id":"n-02f30040","guard":[["hasAny",["has","mos","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode MOS":"The suname whose sucode is MOS is Moskovskaya oblast'."}}},
{"id":"n-04772a24","guard":[["hasAny",["name","nao","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is NAO":"The suname whose sucode is NAO is Nahouri."}}},
{"id":"n-06200c73","guard":[["hasAny",["has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode 334":"The suname whose sucode is 334 is Nabilatuk."}}},
{"id":"n-08711a01","guard":[["hasAny",["name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is 196":"The suname whose sucode is 196 is Cirkulane."}}},
{"id":"n-0a003379","guard":[["hasAny",["has","ksa","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode KSA":"The suname whose sucode is KSA is Kosrae."}}},
{"id":"n-0c7f0574","guard":[["hasAny",["has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode 336":"The suname whose sucode is 336 is Madi‐Okollo."}}},
{"id":"n-1152c8b1","guard":[["hasAny",["epw","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is EPW":"The suname whose sucode is EPW is Enga."}}},
{"id":"n-159fd395","guard":[["hasAny",["btn","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"BTN is the sucode of which suname":"The suname whose sucode is BTN is Batanes."}}},
{"id":"n-19e98a77","guard":[["hasAny",["name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is 060":"The suname whose sucode is 060 is Litija."}}},
{"id":"n-1d0348b2","guard":[["hasAny",["hil","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"HIL is the sucode of which suname":"The suname whose sucode is HIL is Hillingdon."}}},
{"id":"n-1db80b48","guard":[["hasAny",["has","stg","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode STG":"The suname whose sucode is STG is Stirling."}}},
{"id":"n-23274711","guard":[["hasAny",["name","sif","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is SIF":"The suname whose sucode is SIF is Sidi Ifni."}}},
{"id":"n-249fdd61","guard":[["hasAny",["mia","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"MIA is the sucode of which suname":"The suname whose sucode is MIA is Miaoli."}}},
{"id":"n-25625f98","guard":[["hasAny",["has","mpl","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode MPL":"The suname whose sucode is MPL is Morobe."}}},
{"id":"n-263719b2","guard":[["hasAny",["has","iva","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode IVA":"The suname whose sucode is IVA is Ivanovskaya oblast'."}}},
{"id":"n-2c173ba2","guard":[["hasAny",["has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode 083":"The suname whose sucode is 083 is Nazarje."}}},
{"id":"n-351a702d","guard":[["hasAny",["ngz","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"NGZ is the sucode of which suname":"The suname whose sucode is NGZ is North Gaza."}}},
{"id":"n-374a066c","guard":[["hasAny",["slf","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"SLF is the sucode of which suname":"The suname whose sucode is SLF is Salford."}}},
{"id":"n-38d31230","guard":[["hasAny",["aya","has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode AYA":"The suname whose sucode is AYA is Ayacucho."}}},
{"id":"n-3a491189","guard":[["hasAny",["has","lno","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode LNO":"The suname whose sucode is LNO is Lunda‐Norte."}}},
{"id":"n-3a94576f","guard":[["hasAny",["kv","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is KV":"The suname whose sucode is KV is Kaposvár."}}},
{"id":"n-3c03c382","guard":[["hasAny",["bst","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"BST is the sucode of which suname":"The suname whose sucode is BST is Bristol, City of."}}},
{"id":"n-3d9821de","guard":[["hasAny",["has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode 803":"The suname whose sucode is 803 is Butel."}}},
{"id":"n-3debcd7f","guard":[["hasAny",["has","knr","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode KNR":"The suname whose sucode is KNR is Kunaṟ."}}},
{"id":"n-3fb75704","guard":[["hasAny",["sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"012 is the sucode of which suname":"The suname whose sucode is 012 is Cerklje na Gorenjskem."}}},
{"id":"n-400ee9da","guard":[["hasAny",["cyq","has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode CYQ":"The suname whose sucode is CYQ is Chiayi."}}},
{"id":"n-409b0d60","guard":[["hasAny",["nco","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"NCO is the sucode of which suname":"The suname whose sucode is NCO is Kotabato."}}},
{"id":"n-40e0b03b","guard":[["hasAny",["sucode","suname","yan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"YAN is the sucode of which suname":"The suname whose sucode is YAN is Yamalo-Nenetskiy avtonomnyy okrug."}}},
{"id":"n-4160dee0","guard":[["hasAny",["jwk","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"JWK is the sucode of which suname":"The suname whose sucode is JWK is Jiwaka."}}},
{"id":"n-42ab4532","guard":[["hasAny",["name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is 036":"The suname whose sucode is 036 is Idrija."}}},
{"id":"n-4832f617","guard":[["hasAny",["bgo","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is BGO":"The suname whose sucode is BGO is Bengo."}}},
{"id":"n-4bb833d7","guard":[["hasAny",["cq","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is CQ":"The suname whose sucode is CQ is Chongqing Shi."}}},
{"id":"n-4cc78af9","guard":[["hasAny",["bur","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is BUR":"The suname whose sucode is BUR is Bury."}}},
{"id":"n-51de1274","guard":[["hasAny",["mic","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"MIC is the sucode of which suname":"The suname whose sucode is MIC is Michoacán de Ocampo."}}},
{"id":"n-555a4064","guard":[["hasAny",["sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"505 is the sucode of which suname":"The suname whose sucode is 505 is Kruševo."}}},
{"id":"n-5650addc","guard":[["hasAny",["buk","has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode BUK":"The suname whose sucode is BUK is Bukidnon."}}},
{"id":"n-5c9b4731","guard":[["hasAny",["sucode","suname","xci"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"XCI is the sucode of which suname":"The suname whose sucode is XCI is Xocalı."}}},
{"id":"n-60f957b1","guard":[["hasAny",["sucode","suname","vm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"VM is the sucode of which suname":"The suname whose sucode is VM is Veszprém."}}},
{"id":"n-627d3072","guard":[["hasAny",["dev","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is DEV":"The suname whose sucode is DEV is Devon."}}},
{"id":"n-62810991","guard":[["hasAny",["bgu","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"BGU is the sucode of which suname":"The suname whose sucode is BGU is Benguela."}}},
{"id":"n-646ca6ec","guard":[["hasAny",["name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is 129":"The suname whose sucode is 129 is Trbovlje."}}},
{"id":"n-65ce06f9","guard":[["hasAny",["has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode 161":"The suname whose sucode is 161 is Hodoš."}}},
{"id":"n-674b4f4b","guard":[["hasAny",["sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"508 is the sucode of which suname":"The suname whose sucode is 508 is Prilep."}}},
{"id":"n-67697e46","guard":[["hasAny",["name","sucode","suname","vov"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is VOV":"The suname whose sucode is VOV is Oost-Vlaanderen."}}},
{"id":"n-6838e0b5","guard":[["hasAny",["has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode 130":"The suname whose sucode is 130 is Trebnje."}}},
{"id":"n-69cab657","guard":[["hasAny",["has","sucode","suname","yuc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode YUC":"The suname whose sucode is YUC is Yucatán."}}},
{"id":"n-6a3eeefa","guard":[["hasAny",["asz","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"ASZ is the sucode of which suname":"The suname whose sucode is ASZ is Assa-Zag (EH-partial)."}}},
{"id":"n-6b942e66","guard":[["hasAny",["sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"216 is the sucode of which suname":"The suname whose sucode is 216 is Amuria."}}},
{"id":"n-6c58100e","guard":[["hasAny",["has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode 415":"The suname whose sucode is 415 is Kyenjojo."}}},
{"id":"n-6e565c75","guard":[["hasAny",["gan","has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode GAN":"The suname whose sucode is GAN is Ganzourgou."}}},
{"id":"n-6ea4bcc9","guard":[["hasAny",["has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode 158":"The suname whose sucode is 158 is Grad."}}},
{"id":"n-6fcb185c","guard":[["hasAny",["name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is 435":"The suname whose sucode is 435 is Rwampara."}}},
{"id":"n-727bc568","guard":[["hasAny",["act","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"ACT is the sucode of which suname":"The suname whose sucode is ACT is Australian Capital Territory."}}},
{"id":"n-731faa6b","guard":[["hasAny",["blk","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"BLK is the sucode of which suname":"The suname whose sucode is BLK is Boulkiemdé."}}},
{"id":"n-740110a5","guard":[["hasAny",["gue","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is GUE":"The suname whose sucode is GUE is Guelmim."}}},
{"id":"n-76e567b1","guard":[["hasAny",["name","ply","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is PLY":"The suname whose sucode is PLY is Plymouth."}}},
{"id":"n-77e2878e","guard":[["hasAny",["has","mmn","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode MMN":"The suname whose sucode is MMN is Marrakech-Menara."}}},
{"id":"n-7f4d6659","guard":[["hasAny",["name","nfk","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is NFK":"The suname whose sucode is NFK is Norfolk."}}},
{"id":"n-82709b70","guard":[["hasAny",["bko","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is BKO":"The suname whose sucode is BKO is Bamako."}}},
{"id":"n-8520af4e","guard":[["hasAny",["lip","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is LIP":"The suname whose sucode is LIP is Lipetskaya oblast'."}}},
{"id":"n-8599dbbb","guard":[["hasAny",["kda","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is KDA":"The suname whose sucode is KDA is Krasnodarskiy kray."}}},
{"id":"n-85febdd7","guard":[["hasAny",["chp","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is CHP":"The suname whose sucode is CHP is Chiapas."}}},
{"id":"n-88d1886d","guard":[["hasAny",["has","moq","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode MOQ":"The suname whose sucode is MOQ is Moquegua."}}},
{"id":"n-8b47e5b5","guard":[["hasAny",["name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is 428":"The suname whose sucode is 428 is Kakumiro."}}},
{"id":"n-941a65a3","guard":[["hasAny",["mln","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is MLN":"The suname whose sucode is MLN is Midlothian."}}},
{"id":"n-9701ff06","guard":[["hasAny",["sucode","suname","wrt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"WRT is the sucode of which suname":"The suname whose sucode is WRT is Warrington."}}},
{"id":"n-988690ef","guard":[["hasAny",["ota","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"OTA is the sucode of which suname":"The suname whose sucode is OTA is Otago."}}},
{"id":"n-9ea7cac8","guard":[["hasAny",["arn","has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode ARN":"The suname whose sucode is ARN is Arno."}}},
{"id":"n-a11bf613","guard":[["hasAny",["bes","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"BES is the sucode of which suname":"The suname whose sucode is BES is Benslimane."}}},
{"id":"n-a2945e75","guard":[["hasAny",["sucode","suname","tve"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"TVE is the sucode of which suname":"The suname whose sucode is TVE is Tverskaya oblast'."}}},
{"id":"n-a5a243fd","guard":[["hasAny",["has","rfh","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode RFH":"The suname whose sucode is RFH is Rafah."}}},
{"id":"n-a84f4fdb","guard":[["hasAny",["mad","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"MAD is the sucode of which suname":"The suname whose sucode is MAD is Marinduque."}}},
{"id":"n-a8550633","guard":[["hasAny",["dy","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"DY is the sucode of which suname":"The suname whose sucode is DY is Dayr az Zawr."}}},
{"id":"n-a87efa25","guard":[["hasAny",["bth","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is BTH":"The suname whose sucode is BTH is Bethlehem."}}},
{"id":"n-a967fa5a","guard":[["hasAny",["cv","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"CV is the sucode of which suname":"The suname whose sucode is CV is Covasna."}}},
{"id":"n-ac0b37e0","guard":[["hasAny",["name","old","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is OLD":"The suname whose sucode is OLD is Oldham."}}},
{"id":"n-ad064ce4","guard":[["hasAny",["has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode 229":"The suname whose sucode is 229 is Luuka."}}},
{"id":"n-b0ae8f1b","guard":[["hasAny",["pc","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"PC is the sucode of which suname":"The suname whose sucode is PC is Piacenza."}}},
{"id":"n-b0e2b340","guard":[["hasAny",["has","sucode","suname","ue"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode UE":"The suname whose sucode is UE is Upper East."}}},
{"id":"n-b61eed44","guard":[["hasAny",["nwt","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"NWT is the sucode of which suname":"The suname whose sucode is NWT is New Taipei."}}},
{"id":"n-b7c93267","guard":[["hasAny",["crf","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is CRF":"The suname whose sucode is CRF is Cardiff [Caerdydd GB-CRD]."}}},
{"id":"n-c14a36f7","guard":[["hasAny",["has","sucode","suname","wna"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode WNA":"The suname whose sucode is WNA is Namur."}}},
{"id":"n-c2313e8d","guard":[["hasAny",["has","nle","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode NLE":"The suname whose sucode is NLE is Nuevo León."}}},
{"id":"n-ca91f00f","guard":[["hasAny",["sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"147 is the sucode of which suname":"The suname whose sucode is 147 is Žiri."}}},
{"id":"n-cc42feda","guard":[["hasAny",["ces","has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode CES":"The suname whose sucode is CES is Cesar."}}},
{"id":"n-cc7b617b","guard":[["hasAny",["name","nef","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is NEF":"The suname whose sucode is NEF is Neftçala."}}},
{"id":"n-d41034a0","guard":[["hasAny",["nue","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"NUE is the sucode of which suname":"The suname whose sucode is NUE is Nueva Ecija."}}},
{"id":"n-d548bd13","guard":[["hasAny",["name","sucode","suname","vla"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is VLA":"The suname whose sucode is VLA is Vladimirskaya oblast'."}}},
{"id":"n-db55d4fe","guard":[["hasAny",["2a","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2A is the sucode of which suname":"The suname whose sucode is 2A is Corse-du-Sud."}}},
{"id":"n-e59f1d29","guard":[["hasAny",["name","rya","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is RYA":"The suname whose sucode is RYA is Ryazanskaya oblast'."}}},
{"id":"n-e5e2fe02","guard":[["hasAny",["sen","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"SEN is the sucode of which suname":"The suname whose sucode is SEN is Séno."}}},
{"id":"n-e752ceaf","guard":[["hasAny",["coa","name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is COA":"The suname whose sucode is COA is Coahuila de Zaragoza."}}},
{"id":"n-e9474be5","guard":[["hasAny",["name","sucode","suname","xo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is XO":"The suname whose sucode is XO is Xorazm."}}},
{"id":"n-ec4f571e","guard":[["hasAny",["has","sucode","suname","zj"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode ZJ":"The suname whose sucode is ZJ is Zhejiang Sheng."}}},
{"id":"n-ee64cc1a","guard":[["hasAny",["has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode 430":"The suname whose sucode is 430 is Bunyangabu."}}},
{"id":"n-ef46d54f","guard":[["hasAny",["ery","has","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode ERY":"The suname whose sucode is ERY is East Riding of Yorkshire."}}},
{"id":"n-f090cf84","guard":[["hasAny",["has","lew","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which suname has the sucode LEW":"The suname whose sucode is LEW is Lewisham."}}},
{"id":"n-f3c61e1e","guard":[["hasAny",["name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is 143":"The suname whose sucode is 143 is Zavrč."}}},
{"id":"n-fbe1b784","guard":[["hasAny",["name","sucode","suname"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is 335":"The suname whose sucode is 335 is Karenga."}}},
{"id":"n-46b80b49","guard":[["hasAny",["act","arn","asz","aya","bes","bgo","bgu","bko","blk","bst","bth","btn","buk","bur","ces","chp","coa","cq","crf","cv","cyq","dev","dy","epw","ery","gan","gue","hil","iva","jwk","kda","knr","ksa","kv","lew","lip","lno","mad","mia","mic","mln","mmn","moq","mos","mpl","nao","nco","nef","nfk","ngz","nle","nue","nwt","old","ota","pc","ply","rfh","rya","sen","sif","slf","stg","tve","ue","vla","vm","vov","wlv","wna","wrt","xci","xo","yan","yuc","zj"]],["has","sucode"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"NUE is the sucode of which suname":"The suname whose sucode is NUE is Nueva Ecija.","name the suname whose sucode is EPW":"The suname whose sucode is EPW is Enga.","name the suname whose sucode is CRF":"The suname whose sucode is CRF is Cardiff [Caerdydd GB-CRD].","name the suname whose sucode is RYA":"The suname whose sucode is RYA is Ryazanskaya oblast'.","which suname has the sucode MOQ":"The suname whose sucode is MOQ is Moquegua.","which suname has the sucode LEW":"The suname whose sucode is LEW is Lewisham.","name the suname whose sucode is DEV":"The suname whose sucode is DEV is Devon.","which suname has the sucode CYQ":"The suname whose sucode is CYQ is Chiayi.","name the suname whose sucode is SIF":"The suname whose sucode is SIF is Sidi Ifni.","name the suname whose sucode is VOV":"The suname whose sucode is VOV is Oost-Vlaanderen.","HIL is the sucode of which suname":"The suname whose sucode is HIL is Hillingdon.","which suname has the sucode MMN":"The suname whose sucode is MMN is Marrakech-Menara.","NGZ is the sucode of which suname":"The suname whose sucode is NGZ is North Gaza.","name the suname whose sucode is BKO":"The suname whose sucode is BKO is Bamako.","which suname has the sucode YUC":"The suname whose sucode is YUC is Yucatán.","MIC is the sucode of which suname":"The suname whose sucode is MIC is Michoacán de Ocampo.","SLF is the sucode of which suname":"The suname whose sucode is SLF is Salford.","name the suname whose sucode is NEF":"The suname whose sucode is NEF is Neftçala.","DY is the sucode of which suname":"The suname whose sucode is DY is Dayr az Zawr.","SEN is the sucode of which suname":"The suname whose sucode is SEN is Séno.","which suname has the sucode KNR":"The suname whose sucode is KNR is Kunaṟ.","which suname has the sucode BUK":"The suname whose sucode is BUK is Bukidnon.","name the suname whose sucode is NAO":"The suname whose sucode is NAO is Nahouri.","which suname has the sucode WNA":"The suname whose sucode is WNA is Namur.","which suname has the sucode IVA":"The suname whose sucode is IVA is Ivanovskaya oblast'.","which suname has the sucode MOS":"The suname whose sucode is MOS is Moskovskaya oblast'.","which suname has the sucode ZJ":"The suname whose sucode is ZJ is Zhejiang Sheng.","which suname has the sucode AYA":"The suname whose sucode is AYA is Ayacucho.","name the suname whose sucode is CHP":"The suname whose sucode is CHP is Chiapas.","which suname has the sucode ARN":"The suname whose sucode is ARN is Arno.","name the suname whose sucode is BUR":"The suname whose sucode is BUR is Bury.","which suname has the sucode ERY":"The suname whose sucode is ERY is East Riding of Yorkshire.","ASZ is the sucode of which suname":"The suname whose sucode is ASZ is Assa-Zag (EH-partial).","BST is the sucode of which suname":"The suname whose sucode is BST is Bristol, City of.","name the suname whose sucode is CQ":"The suname whose sucode is CQ is Chongqing Shi.","name the suname whose sucode is XO":"The suname whose sucode is XO is Xorazm.","name the suname whose sucode is MLN":"The suname whose sucode is MLN is Midlothian.","CV is the sucode of which suname":"The suname whose sucode is CV is Covasna.","name the suname whose sucode is VLA":"The suname whose sucode is VLA is Vladimirskaya oblast'.","name the suname whose sucode is KV":"The suname whose sucode is KV is Kaposvár.","NCO is the sucode of which suname":"The suname whose sucode is NCO is Kotabato.","OTA is the sucode of which suname":"The suname whose sucode is OTA is Otago.","MAD is the sucode of which suname":"The suname whose sucode is MAD is Marinduque.","TVE is the sucode of which suname":"The suname whose sucode is TVE is Tverskaya oblast'.","name the suname whose sucode is NFK":"The suname whose sucode is NFK is Norfolk.","BTN is the sucode of which suname":"The suname whose sucode is BTN is Batanes.","BES is the sucode of which suname":"The suname whose sucode is BES is Benslimane.","name the suname whose sucode is KDA":"The suname whose sucode is KDA is Krasnodarskiy kray.","which suname has the sucode NLE":"The suname whose sucode is NLE is Nuevo León.","which suname has the sucode MPL":"The suname whose sucode is MPL is Morobe.","name the suname whose sucode is BTH":"The suname whose sucode is BTH is Bethlehem.","VM is the sucode of which suname":"The suname whose sucode is VM is Veszprém.","ACT is the sucode of which suname":"The suname whose sucode is ACT is Australian Capital Territory.","which suname has the sucode CES":"The suname whose sucode is CES is Cesar.","name the suname whose sucode is PLY":"The suname whose sucode is PLY is Plymouth.","which suname has the sucode UE":"The suname whose sucode is UE is Upper East.","BGU is the sucode of which suname":"The suname whose sucode is BGU is Benguela.","MIA is the sucode of which suname":"The suname whose sucode is MIA is Miaoli.","which suname has the sucode KSA":"The suname whose sucode is KSA is Kosrae.","name the suname whose sucode is BGO":"The suname whose sucode is BGO is Bengo.","name the suname whose sucode is COA":"The suname whose sucode is COA is Coahuila de Zaragoza.","NWT is the sucode of which suname":"The suname whose sucode is NWT is New Taipei.","which suname has the sucode GAN":"The suname whose sucode is GAN is Ganzourgou.","name the suname whose sucode is OLD":"The suname whose sucode is OLD is Oldham.","name the suname whose sucode is LIP":"The suname whose sucode is LIP is Lipetskaya oblast'.","which suname has the sucode WLV":"The suname whose sucode is WLV is Wolverhampton.","PC is the sucode of which suname":"The suname whose sucode is PC is Piacenza.","YAN is the sucode of which suname":"The suname whose sucode is YAN is Yamalo-Nenetskiy avtonomnyy okrug.","which suname has the sucode RFH":"The suname whose sucode is RFH is Rafah.","BLK is the sucode of which suname":"The suname whose sucode is BLK is Boulkiemdé.","which suname has the sucode LNO":"The suname whose sucode is LNO is Lunda‐Norte.","name the suname whose sucode is GUE":"The suname whose sucode is GUE is Guelmim.","WRT is the sucode of which suname":"The suname whose sucode is WRT is Warrington.","XCI is the sucode of which suname":"The suname whose sucode is XCI is Xocalı.","JWK is the sucode of which suname":"The suname whose sucode is JWK is Jiwaka.","which suname has the sucode STG":"The suname whose sucode is STG is Stirling."}}},
{"id":"n-021d63a7","guard":[["has","vov"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is VOV":"The suname whose sucode is VOV is Oost-Vlaanderen."}}},
{"id":"n-0246e8e4","guard":[["has","lew"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode LEW":"The suname whose sucode is LEW is Lewisham."}}},
{"id":"n-03b222dc","guard":[["has","bko"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is BKO":"The suname whose sucode is BKO is Bamako."}}},
{"id":"n-052a65da","guard":[["has","gan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode GAN":"The suname whose sucode is GAN is Ganzourgou."}}},
{"id":"n-075789c8","guard":[["has","slf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"SLF is the sucode of which suname":"The suname whose sucode is SLF is Salford."}}},
{"id":"n-0cc63534","guard":[["has","bes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"BES is the sucode of which suname":"The suname whose sucode is BES is Benslimane."}}},
{"id":"n-0de70968","guard":[["has","iva"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode IVA":"The suname whose sucode is IVA is Ivanovskaya oblast'."}}},
{"id":"n-16ff1308","guard":[["has","wrt"],["has","sucode"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"WRT is the sucode of which suname":"The suname whose sucode is WRT is Warrington."}}},
{"id":"n-1acd2bca","guard":[["has","stg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode STG":"The suname whose sucode is STG is Stirling."}}},
{"id":"n-1c4c5b59","guard":[["has","ply"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is PLY":"The suname whose sucode is PLY is Plymouth."}}},
{"id":"n-1db1d332","guard":[["has","old"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is OLD":"The suname whose sucode is OLD is Oldham."}}},
{"id":"n-2a7a0711","guard":[["has","bgu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"BGU is the sucode of which suname":"The suname whose sucode is BGU is Benguela."}}},
{"id":"n-2a9336aa","guard":[["has","kda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is KDA":"The suname whose sucode is KDA is Krasnodarskiy kray."}}},
{"id":"n-2b54bb48","guard":[["has","bth"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is BTH":"The suname whose sucode is BTH is Bethlehem."}}},
{"id":"n-32e2b91c","guard":[["has","dev"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is DEV":"The suname whose sucode is DEV is Devon."}}},
{"id":"n-3341317f","guard":[["has","ces"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode CES":"The suname whose sucode is CES is Cesar."}}},
{"id":"n-3607b30a","guard":[["has","crf"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is CRF":"The suname whose sucode is CRF is Cardiff [Caerdydd GB-CRD]."}}},
{"id":"n-36c19a29","guard":[["has","wlv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode WLV":"The suname whose sucode is WLV is Wolverhampton."}}},
{"id":"n-3f656b75","guard":[["has","hil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"HIL is the sucode of which suname":"The suname whose sucode is HIL is Hillingdon."}}},
{"id":"n-403b6304","guard":[["has","yuc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode YUC":"The suname whose sucode is YUC is Yucatán."}}},
{"id":"n-41a7a699","guard":[["has","cyq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode CYQ":"The suname whose sucode is CYQ is Chiayi."}}},
{"id":"n-423288c4","guard":[["has","mmn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode MMN":"The suname whose sucode is MMN is Marrakech-Menara."}}},
{"id":"n-42dd4c0b","guard":[["has","mad"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"MAD is the sucode of which suname":"The suname whose sucode is MAD is Marinduque."}}},
{"id":"n-43dbc7c9","guard":[["has","blk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"BLK is the sucode of which suname":"The suname whose sucode is BLK is Boulkiemdé."}}},
{"id":"n-44ef0dad","guard":[["has","mln"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is MLN":"The suname whose sucode is MLN is Midlothian."}}},
{"id":"n-489d72fb","guard":[["has","sen"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"SEN is the sucode of which suname":"The suname whose sucode is SEN is Séno."}}},
{"id":"n-48d8d777","guard":[["has","gue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is GUE":"The suname whose sucode is GUE is Guelmim."}}},
{"id":"n-4d007f55","guard":[["has","rya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is RYA":"The suname whose sucode is RYA is Ryazanskaya oblast'."}}},
{"id":"n-4e269c3a","guard":[["has","kv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is KV":"The suname whose sucode is KV is Kaposvár."}}},
{"id":"n-4ea06297","guard":[["has","chp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is CHP":"The suname whose sucode is CHP is Chiapas."}}},
{"id":"n-5111a8f0","guard":[["has","yan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"YAN is the sucode of which suname":"The suname whose sucode is YAN is Yamalo-Nenetskiy avtonomnyy okrug."}}},
{"id":"n-51d49547","guard":[["has","ota"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"OTA is the sucode of which suname":"The suname whose sucode is OTA is Otago."}}},
{"id":"n-524554ca","guard":[["has","xci"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"XCI is the sucode of which suname":"The suname whose sucode is XCI is Xocalı."}}},
{"id":"n-5304346c","guard":[["has","tve"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"TVE is the sucode of which suname":"The suname whose sucode is TVE is Tverskaya oblast'."}}},
{"id":"n-55b49cb1","guard":[["has","dy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"DY is the sucode of which suname":"The suname whose sucode is DY is Dayr az Zawr."}}},
{"id":"n-5be571c6","guard":[["has","moq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode MOQ":"The suname whose sucode is MOQ is Moquegua."}}},
{"id":"n-5c8d541c","guard":[["has","ksa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode KSA":"The suname whose sucode is KSA is Kosrae."}}},
{"id":"n-61d67b9e","guard":[["has","act"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"ACT is the sucode of which suname":"The suname whose sucode is ACT is Australian Capital Territory."}}},
{"id":"n-63e97950","guard":[["has","bst"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"BST is the sucode of which suname":"The suname whose sucode is BST is Bristol, City of."}}},
{"id":"n-66c3c46a","guard":[["has","rfh"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode RFH":"The suname whose sucode is RFH is Rafah."}}},
{"id":"n-7457cc1e","guard":[["has","nao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is NAO":"The suname whose sucode is NAO is Nahouri."}}},
{"id":"n-786b672e","guard":[["has","ery"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode ERY":"The suname whose sucode is ERY is East Riding of Yorkshire."}}},
{"id":"n-78ca313d","guard":[["has","zj"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode ZJ":"The suname whose sucode is ZJ is Zhejiang Sheng."}}},
{"id":"n-836314c7","guard":[["has","jwk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"JWK is the sucode of which suname":"The suname whose sucode is JWK is Jiwaka."}}},
{"id":"n-8bbaefa4","guard":[["has","wna"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode WNA":"The suname whose sucode is WNA is Namur."}}},
{"id":"n-8d659013","guard":[["has","cq"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is CQ":"The suname whose sucode is CQ is Chongqing Shi."}}},
{"id":"n-92f01d34","guard":[["has","knr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode KNR":"The suname whose sucode is KNR is Kunaṟ."}}},
{"id":"n-a0e94b0f","guard":[["has","bur"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is BUR":"The suname whose sucode is BUR is Bury."}}},
{"id":"n-a3d5ef4f","guard":[["has","vm"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"VM is the sucode of which suname":"The suname whose sucode is VM is Veszprém."}}},
{"id":"n-a99ead40","guard":[["has","btn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"BTN is the sucode of which suname":"The suname whose sucode is BTN is Batanes."}}},
{"id":"n-abea577e","guard":[["has","cv"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"CV is the sucode of which suname":"The suname whose sucode is CV is Covasna."}}},
{"id":"n-abf662f7","guard":[["has","vla"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is VLA":"The suname whose sucode is VLA is Vladimirskaya oblast'."}}},
{"id":"n-af41381c","guard":[["has","epw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is EPW":"The suname whose sucode is EPW is Enga."}}},
{"id":"n-b0023af3","guard":[["has","mia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"MIA is the sucode of which suname":"The suname whose sucode is MIA is Miaoli."}}},
{"id":"n-b2f80168","guard":[["has","bgo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is BGO":"The suname whose sucode is BGO is Bengo."}}},
{"id":"n-b3b1fa93","guard":[["has","buk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode BUK":"The suname whose sucode is BUK is Bukidnon."}}},
{"id":"n-b76f4f76","guard":[["has","coa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is COA":"The suname whose sucode is COA is Coahuila de Zaragoza."}}},
{"id":"n-be173a80","guard":[["has","lno"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode LNO":"The suname whose sucode is LNO is Lunda‐Norte."}}},
{"id":"n-c15856dd","guard":[["has","ngz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"NGZ is the sucode of which suname":"The suname whose sucode is NGZ is North Gaza."}}},
{"id":"n-c523f90a","guard":[["has","nef"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is NEF":"The suname whose sucode is NEF is Neftçala."}}},
{"id":"n-c80b3315","guard":[["has","mpl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode MPL":"The suname whose sucode is MPL is Morobe."}}},
{"id":"n-cc247a0d","guard":[["has","nwt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"NWT is the sucode of which suname":"The suname whose sucode is NWT is New Taipei."}}},
{"id":"n-d6c126c1","guard":[["has","nfk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is NFK":"The suname whose sucode is NFK is Norfolk."}}},
{"id":"n-d8e335e3","guard":[["has","arn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode ARN":"The suname whose sucode is ARN is Arno."}}},
{"id":"n-da8bd9e7","guard":[["has","ue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode UE":"The suname whose sucode is UE is Upper East."}}},
{"id":"n-dbb92670","guard":[["has","pc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"PC is the sucode of which suname":"The suname whose sucode is PC is Piacenza."}}},
{"id":"n-dfbabe31","guard":[["has","lip"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is LIP":"The suname whose sucode is LIP is Lipetskaya oblast'."}}},
{"id":"n-e0690523","guard":[["has","sif"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is SIF":"The suname whose sucode is SIF is Sidi Ifni."}}},
{"id":"n-e1bd2899","guard":[["has","xo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the suname whose sucode is XO":"The suname whose sucode is XO is Xorazm."}}},
{"id":"n-e2f362b9","guard":[["has","mos"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode MOS":"The suname whose sucode is MOS is Moskovskaya oblast'."}}},
{"id":"n-e5391691","guard":[["has","nle"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode NLE":"The suname whose sucode is NLE is Nuevo León."}}},
{"id":"n-ec87b8af","guard":[["has","asz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"ASZ is the sucode of which suname":"The suname whose sucode is ASZ is Assa-Zag (EH-partial)."}}},
{"id":"n-eef90504","guard":[["has","mic"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"MIC is the sucode of which suname":"The suname whose sucode is MIC is Michoacán de Ocampo."}}},
{"id":"n-f05c845c","guard":[["has","nco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"NCO is the sucode of which suname":"The suname whose sucode is NCO is Kotabato."}}},
{"id":"n-f0abaf36","guard":[["has","aya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which suname has the sucode AYA":"The suname whose sucode is AYA is Ayacucho."}}},
{"id":"n-f585e4a7","guard":[["has","nue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"NUE is the sucode of which suname":"The suname whose sucode is NUE is Nueva Ecija."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"NUE is the sucode of which suname","expect":{"contains":["Nueva Ecija"],"notRefusal":true}},{"q":"name the suname whose sucode is EPW","expect":{"contains":["Enga"],"notRefusal":true}},{"q":"name the suname whose sucode is CRF","expect":{"contains":["Cardiff [Caerdydd GB-CRD]"],"notRefusal":true}},{"q":"name the suname whose sucode is RYA","expect":{"contains":["Ryazanskaya oblast'"],"notRefusal":true}},{"q":"which suname has the sucode MOQ","expect":{"contains":["Moquegua"],"notRefusal":true}},{"q":"name the suname whose sucode is 428","expect":{"contains":["Kakumiro"],"notRefusal":true}},{"q":"which suname has the sucode 430","expect":{"contains":["Bunyangabu"],"notRefusal":true}},{"q":"which suname has the sucode LEW","expect":{"contains":["Lewisham"],"notRefusal":true}},{"q":"name the suname whose sucode is DEV","expect":{"contains":["Devon"],"notRefusal":true}},{"q":"which suname has the sucode CYQ","expect":{"contains":["Chiayi"],"notRefusal":true}},{"q":"which suname has the sucode 229","expect":{"contains":["Luuka"],"notRefusal":true}},{"q":"name the suname whose sucode is SIF","expect":{"contains":["Sidi Ifni"],"notRefusal":true}},{"q":"which suname has the sucode 803","expect":{"contains":["Butel"],"notRefusal":true}},{"q":"name the suname whose sucode is VOV","expect":{"contains":["Oost-Vlaanderen"],"notRefusal":true}},{"q":"HIL is the sucode of which suname","expect":{"contains":["Hillingdon"],"notRefusal":true}},{"q":"which suname has the sucode 083","expect":{"contains":["Nazarje"],"notRefusal":true}},{"q":"which suname has the sucode MMN","expect":{"contains":["Marrakech-Menara"],"notRefusal":true}},{"q":"NGZ is the sucode of which suname","expect":{"contains":["North Gaza"],"notRefusal":true}},{"q":"name the suname whose sucode is BKO","expect":{"contains":["Bamako"],"notRefusal":true}},{"q":"which suname has the sucode YUC","expect":{"contains":["Yucatán"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
