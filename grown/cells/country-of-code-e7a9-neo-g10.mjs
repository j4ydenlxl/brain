// country-of-code-e7a9-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-of-code-e7a9-neo-g10","class":"country-of-code-e7a9","generation":10,"lane":"neo","grownFrom":["what is the country of KR","tell me the country of the code SB","give the country for AE","what is the country of MW","tell me the country of the code SO","give the country for DM","what is the country of CR","give the country for PT","what is the country of SC","give the country for CU","what is the country of SI","what is the country of CO","tell me the country of the code LC","give the country for RU","what is the country of BD","tell me the country of the code EE","tell me the country of the code SE","give the country for GR","give the country for JP","give the country for PY"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-country-lists-4a59d2","columns":["code","country"],"n":199,"cols":[{"s":"AF|AL|DZ|AD|AO|AG|AR|AM|AU|AT|AZ|BS|BH|BD|BB|BY|BE|BZ|BJ|BT|BO|BA|BW|BR|BN|BG|BF|BI|KH|CM|CA|CV|CF|TD|CL|CN|CO|KM|CD|CG|CR|CI|HR|CU|CY|CZ|DK|DJ|DM|DO|EC|EG|SV|GQ|ER|EE|ET|FJ|FI|FR|GA|GE|DE|GH|GR|GD|GT|GN|GW|GY|HT|HN|HK|HU|IS|IN|ID|IR|IQ|IE|IL|IT|JM|JP|JO|KZ|KE|KI|XK|KW|KG|LA|LV|LB|LS|LR|LY|LI|LT|LU|MO|MG|MW|MY|MV|ML|MT|MH|MR|MU|MX|FM|MD|MC|MN|ME|MA|MZ|MM|NA|NR|NP|NL|NZ|NI|NE|NG|KP|MK|NO|OM|PK|PW|PS|PA|PG|PY|PE|PH|PL|PT|QA|RO|RU|RW|WS|SM|ST|SA|SN|RS|SC|SL|SG|SK|SI|SB|SO|ZA|KR|SS|ES|LK|KN|LC|VC|SD|SR|SE|CH|SY|TW|TJ|TZ|TH|GM|TL|TG|TO|TT|TN|TM|TV|TR|UG|UA|AE|GB|US|UY|UZ|VU|VA|VE|VN|YE|ZM|ZW|SZ","sep":"|"},{"f":"0Afghanistan|1lbania|2geria|1ndorra|2gola|2tigua and Barbuda|1rgentina|2menia|1ustralia|5ia|1zerbaijan|0Bahamas|3rain|2ngladesh|2rbados|1elarus|3gium|3ize|2nin|1hutan|1olivia|2snia and Herzegovina|2tswana|1razil|2unei|1ulgaria|2rkina Faso|3undi|0Cambodia|3eroon|2nada|2pe Verde Islands|1entral African Republic|1had|2ile|3na|1olombia|2moro Islands|2ngo (Dem. Rep.)|7Rep.)|2sta Rica|2te d'Ivoire|1roatia|1uba|1yprus|1zechia|0Denmark|1jibouti|1ominica|8n Republic|0Ecuador|1gypt|1l Salvador|1quatorial Guinea|1ritrea|1stonia|1thiopia|0Fiji|2nland|1rance|0Gabon|1eorgia|2rmany|1hana|1reece|3nada|1uatemala|2inea|6-Bissau|2yana|0Haiti|1onduras|3g Kong (SAR China)|1ungary|0Iceland|1ndia|3onesia|1ran|3q|2eland|1srael|1taly|0Jamaica|2pan|1ordan|0Kazakhstan|1enya|1iribati|1osovo|1uwait|1yrgyzstan|0Laos|2tvia|1ebanon|2sotho|1iberia|3ya|2echtenstein|2thuania|1uxembourg|0Macao (SAR China)|2dagascar|2lawi|4ysia|3dives|3i|3ta|2rshall Islands|2uritania|6ius|1exico|1icronesia|1oldova|2naco|3golia|3tenegro|2rocco|2zambique|1yanmar|0Namibia|2uru|1epal|2therlands|2w Zealand|1icaragua|2ger|5ia|1orth Korea|6Macedonia|3way|0Oman|0Pakistan|2lau Islands|3estinian Territory|2nama|2pua New Guinea|2raguay|1eru|1hilippines|1oland|2rtugal|0Qatar|0Romania|1ussian Federation|1wanda|0Samoa|2n Marino|2o Tome and Principe|2udi Arabia|1enegal|2rbia|2ychelles|1ierra Leone|2ngapore|1lovakia|4enia|1olomon Islands|2malia|2uth Africa|6Korea|6Sudan|1pain|1ri Lanka|1t. Kitts and Nevis|4Lucia|4Vincent and the Grenadines|1udan|2riname|1weden|2itzerland|1yria|0Taiwan (Chinese Taipei)|2jikistan|2nzania|1hailand|2e Gambia|1imor-Leste|1ogo|2nga|1rinidad and Tobago|1unisia|2rkmenistan|2valu|1ürkiye|0Uganda|1kraine|1nited Arab Emirates|7Kingdom|7States|1ruguay|1zbekistan|0Vanuatu|2tican City|1enezuela|1ietnam|0Yemen|0Zambia|1imbabwe|0eSwatini","sep":"|"}]}]);
const COLONY = [
{"id":"n-efdc23d9","guard":[["hasAny",["ao","au","bd","bh","bj","br","bw","ca","cg","co","cr","ee","ga","gt","hr","ie","il","item number","kr","kw","lc","lu","mc","mg","mh","mo","mr","nr","nth","pe","rw","sa","sb","sc","se","shortest","shortest one","shortest word","si","sm","sy","td","th","tt","uy","zw"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-8055d5a8","guard":[["hasAny",["ao","au","bd","bh","bj","br","bw","ca","capitalise","capitalize","capitalize each word","cg","co","cr","ee","ga","gt","hr","ie","il","item number","kr","kw","lc","lu","mc","mg","mh","mo","mr","nr","nth","pe","rw","sa","sb","sc","se","shortest","shortest one","shortest word","si","sm","sy","td","th","tt","uy","zw"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-a868c2dd","guard":[["hasAny",["ao","au","bd","bh","bj","br","bw","ca","capital letters","capitals","cg","co","cr","ee","ga","gt","hr","ie","il","item number","kr","kw","lc","lu","mc","mg","mh","mo","mr","nr","nth","pe","rw","sa","sb","sc","se","shortest","shortest one","shortest word","si","sm","sy","td","th","tt","upper case","uppercase","uy","zw"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-c04b2325","guard":[["hasAny",["ao","au","bd","bh","bj","br","bw","ca","cg","co","cr","ee","ga","gt","hr","ie","il","item number","kr","kw","lc","lower case","lowercase","lu","mc","mg","mh","mo","mr","nr","nth","pe","rw","sa","sb","sc","se","shortest","shortest one","shortest word","si","sm","small letters","sy","td","th","tt","uy","zw"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-cc17ab8d","guard":[["hasAny",["ao","au","bd","bh","bj","br","bw","ca","cg","co","cr","ee","ga","gt","hr","ie","il","invert case","item number","kr","kw","lc","lu","mc","mg","mh","mo","mr","nr","nth","pe","rw","sa","sb","sc","se","shortest","shortest one","shortest word","si","sm","swap case","sy","td","th","toggle case","tt","uy","zw"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-a047decd","guard":[["hasAny",["ao","au","bd","bh","bj","br","bw","ca","cg","co","cr","ee","ga","gt","hr","ie","il","item number","kr","kw","lc","lu","mc","mg","mh","mo","mr","normalise","normalize","nr","nth","pe","rw","sa","sb","sc","se","si","simplify the text","sm","sy","td","th","tt","uy","zw"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-28df2d7a","guard":[["hasAny",["ae","ao","bh","bj","br","bw","ca","cu","de","dz","ee","es","ga","gt","how many","how many items","hr","ie","il","item number","kp","kw","lu","mc","mg","mh","mr","normalise","normalize","nth","number of items","position","pt","py","rw","sc","se","si","simplify the text","sy","td","th","to","uy"]],["has","country"],["has","the"],["not",["has","abbreviation"]],["not",["has","altonanord"]],["not",["has","ayutuxtepeque"]],["not",["has","bacuri"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-39f82e08","guard":[["hasAny",["ae","ao","bh","bj","br","bw","ca","cu","de","dz","ee","es","ga","gt","how many","how many items","hr","ie","il","item number","kp","kw","lu","mc","mg","mh","mr","normalise","normalize","nth","number of items","position","pt","py","rw","sc","se","si","simplify the text","sy","td","th","to","uy"]],["has","country"],["has","the"],["not",["has","abbreviation"]],["not",["has","altonanord"]],["not",["has","ayutuxtepeque"]],["not",["has","bacuri"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-602a8155","guard":[["has","country"],["not",["has","an"]],["not",["has","at"]],["not",["has","it"]],["not",["has","so"]],["not",["has","us"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the country of KR":"The country of KR is South Korea.","the country of MW":"The country of MW is Malawi.","the country of CR":"The country of CR is Costa Rica.","the country of SC":"The country of SC is Seychelles.","the country of SI":"The country of SI is Slovenia.","the country of CO":"The country of CO is Colombia.","the country of BD":"The country of BD is Bangladesh.","the country of MO":"The country of MO is Macao (SAR China).","the country of LT":"The country of LT is Lithuania.","the country of KW":"The country of KW is Kuwait.","the country of BW":"The country of BW is Botswana.","the country of VU":"The country of VU is Vanuatu.","the country of MG":"The country of MG is Madagascar.","the country of SY":"The country of SY is Syria.","the country of LR":"The country of LR is Liberia.","the country of AU":"The country of AU is Australia.","the country of TH":"The country of TH is Thailand.","the country of TD":"The country of TD is Chad.","the country of SM":"The country of SM is San Marino.","the country of MZ":"The country of MZ is Mozambique.","the country of MH":"The country of MH is Marshall Islands.","the country of BI":"The country of BI is Burundi.","the country of UY":"The country of UY is Uruguay.","the country of FR":"The country of FR is France.","the country of AD":"The country of AD is Andorra.","the country of GA":"The country of GA is Gabon.","the country of IE":"The country of IE is Ireland.","the country of VA":"The country of VA is Vatican City.","the country of IS":"The country of IS is Iceland.","the country of IN":"The country of IN is India.","the country of MR":"The country of MR is Mauritania.","the country of MU":"The country of MU is Mauritius.","the country of BJ":"The country of BJ is Benin.","the country of AZ":"The country of AZ is Azerbaijan."}}},
{"id":"n-26199d91","guard":[["hasAny",["country","delete","item number","nth","position","remove","strip out"]],["words<=",5]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-c1f5abbe","guard":[["hasAny",["country","delete","item number","nth","position","remove","strip out"]],["words<=",5]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.after",{"lit":"for"}]]],"mem":null},
{"id":"n-8bbf4fd3","guard":[["hasAny",["country","item number","nth","position"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"for"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-059615f7","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","es","for","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-ce18b1c0","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","es","for","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.and",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-1ca3f65c","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","es","for","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-21390696","guard":[["hasAny",["ae","af","bo","camel case","camelcase","cu","cv","de","dk","dm","dz","es","for","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lower camel case","lv","mv","nth","pt","py","ru","sd","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-5144daac","guard":[["hasAny",["ae","af","bo","class name","cu","cv","de","dk","dm","dz","es","for","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pascal case","pascalcase","pt","py","ru","sd","sv","tl","tm","upper camel case","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-cb2e6e00","guard":[["has","country"],["not",["has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"AE":"The country of AE is United Arab Emirates.","DM":"The country of DM is Dominica.","PT":"The country of PT is Portugal.","CU":"The country of CU is Cuba.","RU":"The country of RU is Russian Federation.","GR":"The country of GR is Greece.","JP":"The country of JP is Japan.","PY":"The country of PY is Paraguay.","GY":"The country of GY is Guyana.","DZ":"The country of DZ is Algeria.","DK":"The country of DK is Denmark.","TO":"The country of TO is Tonga.","TM":"The country of TM is Turkmenistan.","MV":"The country of MV is Maldives.","LV":"The country of LV is Latvia.","ES":"The country of ES is Spain.","KN":"The country of KN is St. Kitts and Nevis.","KI":"The country of KI is Kiribati.","ME":"The country of ME is Montenegro.","KH":"The country of KH is Cambodia.","AF":"The country of AF is Afghanistan.","DE":"The country of DE is Germany.","VE":"The country of VE is Venezuela.","CV":"The country of CV is Cape Verde Islands.","IQ":"The country of IQ is Iraq.","SD":"The country of SD is Sudan.","LA":"The country of LA is Laos.","AM":"The country of AM is Armenia.","KP":"The country of KP is North Korea.","BO":"The country of BO is Bolivia.","TL":"The country of TL is Timor-Leste.","SV":"The country of SV is El Salvador.","ZM":"The country of ZM is Zambia."}}},
{"id":"n-7859f37b","guard":[["hasAny",["ad","au","az","bd","bi","bj","bw","co","cr","fr","ga","ie","item number","kr","kw","lr","lt","mg","mh","mo","mr","mu","mw","mz","nth","sc","si","sm","sy","td","th","uy","va","vu"]],["has","country"],["words<=",6],["nums==",0],["has","what"],["not",["has","an"]],["not",["has","at"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"of"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-8b9ed97e","guard":[["hasAny",["ad","au","az","bd","bi","bj","bw","co","cr","fr","ga","ie","item number","kr","kw","lr","lt","mg","mh","mo","mr","mu","mw","mz","nth","sc","si","sm","sy","td","th","uy","va","vu"]],["has","country"],["has","what"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-32a6c51e","guard":[["hasAny",["ao","au","bd","bh","bj","br","bw","ca","co","ee","ga","gt","hr","ie","il","item number","kw","lu","mc","mg","mr","nr","nth","pe","reverse the words","reverse word order","rw","sc","se","shortest","shortest one","shortest word","si","sy","td","th","uy","words backwards","zw"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-66a6feaa","guard":[["hasAny",["ao","au","bd","bh","bj","br","bw","ca","co","dashes","ee","ga","gt","hr","hyphens","ie","il","item number","kebab case","kebabcase","kw","lu","mc","mg","mr","nr","nth","pe","rw","sc","se","shortest","shortest one","shortest word","si","sy","td","th","uy","zw"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-b48a8804","guard":[["hasAny",["ao","au","bd","bh","bj","br","bw","ca","camel case","camelcase","co","ee","ga","gt","hr","ie","il","item number","kw","lower camel case","lu","mc","mg","mr","nr","nth","pe","rw","sc","se","shortest","shortest one","shortest word","si","sy","td","th","uy","zw"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-f1b36e61","guard":[["hasAny",["ao","au","bd","bh","bj","br","bw","ca","class name","co","ee","ga","gt","hr","ie","il","item number","kw","lu","mc","mg","mr","nr","nth","pascal case","pascalcase","pe","rw","sc","se","shortest","shortest one","shortest word","si","sy","td","th","upper camel case","uy","zw"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-afbc9108","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","shortest","shortest one","shortest word","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-00eac86b","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","es","gr","gy","invert case","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","shortest","shortest one","shortest word","sv","swap case","tl","tm","toggle case","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-11d0949a","guard":[["hasAny",["ae","af","bo","class name","cu","cv","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pascal case","pascalcase","pt","py","ru","sd","shortest","shortest one","shortest word","sv","tl","tm","upper camel case","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-2b3c54cf","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lower case","lowercase","lv","mv","nth","pt","py","ru","sd","shortest","shortest one","shortest word","small letters","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-3ed18efe","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","es","gr","gy","invert case","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","shortest","shortest one","shortest word","sv","swap case","tl","tm","toggle case","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-78708114","guard":[["hasAny",["ae","af","bo","capital letters","capitals","cu","cv","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","shortest","shortest one","shortest word","sv","tl","tm","upper case","uppercase","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-8c0fa441","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-ceca9723","guard":[["hasAny",["ae","af","bo","capitalise","capitalize","capitalize each word","cu","cv","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","shortest","shortest one","shortest word","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-355b9da1","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","each word","es","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","shortest","shortest one","shortest word","split into words","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-5a567633","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","each word","es","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","nth","pt","py","ru","sd","shortest","shortest one","shortest word","split into words","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-3474d0c7","guard":[["hasAny",["ae","af","bo","cu","cv","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kh","ki","kn","kp","la","lv","mv","normalise","normalize","nth","pt","py","ru","sd","simplify the text","sv","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-9a373eb1","guard":[["hasAny",["bd","bh","bj","br","bw","cg","cr","gt","hr","item number","kr","kw","lc","mc","mg","mh","mr","no vowels","nr","nth","remove vowels","rw","sb","sc","sm","sy","td","th","tt","without vowels","zw"]],["has","country"],["has","of"],["words<=",8],["words>=",6],["not",["has","abbreviation"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-4f0e21b5","guard":[["hasAny",["alphabetize the letters","ao","au","bd","bh","bj","br","bw","cg","co","cr","do","ee","gt","hr","il","item number","kr","kw","letters in order","lu","mo","mr","nr","nth","rw","sort the letters","sy","tt","uy"]],["has","country"],["has","of"],["words<=",8],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-0ec2582f","guard":[["hasAny",["af","bo","cu","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kh","ki","la","lv","mv","nth","pt","py","reverse the words","reverse word order","sd","shortest","shortest one","shortest word","tl","tm","ve","words backwards","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-fd78bb57","guard":[["hasAny",["af","bo","cu","dashes","de","dk","dm","dz","es","gr","gy","hyphens","iq","item number","jp","kebab case","kebabcase","kh","ki","la","lv","mv","nth","pt","py","sd","shortest","shortest one","shortest word","tl","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-81e2bcd2","guard":[["hasAny",["af","bo","camel case","camelcase","cu","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kh","ki","la","lower camel case","lv","mv","nth","pt","py","sd","shortest","shortest one","shortest word","tm","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-f1aece42","guard":[["hasAny",["af","bo","class name","cu","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kh","ki","la","lv","mv","nth","pascal case","pascalcase","pt","py","sd","shortest","shortest one","shortest word","tm","upper camel case","ve","zm"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-594be821","guard":[["hasAny",["ae","af","alphabetize the letters","am","bo","cu","cv","de","dk","dm","dz","es","gr","gy","iq","item number","jp","kn","kp","letters in order","lv","mv","nth","pt","py","ru","sort the letters","sv"]],["words<=",5],["has","country"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.sortLetters",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-c07a36b1","guard":[["hasAny",["au","bd","bj","bw","co","cr","ga","ie","item number","kr","kw","mg","mh","mo","mr","nth","sc","si","sm","sy","td","th","uy"]],["has","country"],["nums==",0],["words<=",8],["has","of"],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-ec78a1e5","guard":[["hasAny",["au","bd","bj","bw","co","cr","ga","ie","item number","kr","kw","mg","mh","mo","mr","nth","sc","si","sm","sy","td","th","uy"]],["has","country"],["nums==",0],["words<=",8],["has","of"],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-51bb13ac","guard":[["hasAny",["au","bd","bj","bw","co","cr","ga","ie","item number","kr","kw","mg","mh","mo","mr","nth","sc","si","sm","sy","td","th","uy"]],["has","country"],["nums==",0],["words<=",8],["has","of"],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-3f37fe8f","guard":[["hasAny",["au","bd","bj","bw","camel case","camelcase","co","cr","ga","ie","item number","kr","kw","lower camel case","mg","mh","mo","mr","nth","sc","si","sm","sy","td","th","uy"]],["has","country"],["nums==",0],["words<=",8],["has","of"],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.camel",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-85ecdcf4","guard":[["hasAny",["au","bd","bj","bw","class name","co","cr","ga","ie","item number","kr","kw","mg","mh","mo","mr","nth","pascal case","pascalcase","sc","si","sm","sy","td","th","upper camel case","uy"]],["has","country"],["nums==",0],["words<=",8],["has","of"],["not",["has","abbreviation"]],["words>=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.pascal",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-213da7ef","guard":[["hasAny",["cv","dk","dm","dz","gr","gy","item number","jp","kh","kn","kp","lv","mv","no vowels","nth","pt","py","remove vowels","sd","sv","tl","tm","without vowels","zm"]],["has","give"],["has","country"],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-144ed098","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","lu","normalise","normalize","nth","sa","sb","si","simplify the text","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":2}]],"mem":null},
{"id":"n-4be4b90d","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","lu","normalise","normalize","nth","sa","sb","si","simplify the text","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1}]],"mem":null},
{"id":"n-6ba158f9","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","lu","normalise","normalize","nth","sa","sb","si","simplify the text","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":2}]],"mem":null},
{"id":"n-de7721ac","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","lu","normalise","normalize","nth","sa","sb","si","simplify the text","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1}]],"mem":null},
{"id":"n-02c73d54","guard":[["hasAny",["ao","bw","delete","dz","ga","il","item number","kp","kw","lu","nth","sa","sb","si","strip out","sy","td"]],["has","country"],["words<=",8],["nums==",0],["not",["has","abbreviation"]],["has","the"],["not",["colon"]]],"pyramid":["render.code",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-03375979","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","lu","nth","sa","sb","separate by","si","split by","sy","td"]],["has","country"],["words<=",8],["nums==",0],["not",["has","abbreviation"]],["has","the"],["not",["colon"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-0af29e9f","guard":[["hasAny",["ao","bw","delete","dz","ga","il","item number","kp","kw","lu","nth","sa","sb","si","strip out","sy","td"]],["has","country"],["words<=",8],["nums==",0],["not",["has","abbreviation"]],["has","the"],["not",["colon"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-3781fa47","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","lu","nth","sa","sb","separate by","si","split by","sy","td"]],["has","country"],["words<=",8],["nums==",0],["not",["has","abbreviation"]],["has","the"],["not",["colon"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-684a334b","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","lu","nth","sa","sb","shortest","shortest one","shortest word","si","sy","td"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","alpha2"]]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-ec5432bb","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","lu","nth","sa","sb","separate by","si","split by","sy","td"]],["has","country"],["words<=",8],["nums==",0],["not",["has","abbreviation"]],["has","the"],["not",["colon"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-445a8f4e","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","leading zeros","lu","nth","pad with","padded to","sa","sb","si","sy","zero pad"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-5e2be185","guard":[["hasAny",["ao","bw","characters from","dz","ga","il","item number","kp","kw","letters from to","lu","nth","sa","si","slice of the text","substring","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-65eba2d1","guard":[["hasAny",["ao","bw","characters from","dz","ga","il","item number","kp","kw","letters from to","lu","nth","sa","si","slice of the text","substring","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-ba0576ea","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","leading zeros","lu","nth","pad with","padded to","sa","sb","si","sy","zero pad"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-0e6c82c3","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","leading zeros","lu","nth","pad with","padded to","sa","sb","si","sy","zero pad"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]],"mem":null},
{"id":"n-33bc3f98","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kp","kw","leading zeros","lu","nth","pad with","padded to","sa","sb","si","sy","zero pad"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]],"mem":null},
{"id":"n-0bed44ba","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kw","lu","nth","si","snake case","snakecase","sy","td","underscores","variable name"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-172d27f5","guard":[["hasAny",["ao","bw","dashes","dz","ga","hyphens","il","item number","kebab case","kebabcase","kw","lu","nth","si","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-36033b4d","guard":[["hasAny",["ao","bw","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-485c7d4e","guard":[["hasAny",["ao","bw","dashes","dz","ga","hyphens","il","item number","kebab case","kebabcase","kw","lu","nth","si","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-7454bb57","guard":[["hasAny",["ao","bw","camel case","camelcase","dz","ga","il","item number","kw","lower camel case","lu","nth","si","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-7674aafd","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kw","lu","nth","si","snake case","snakecase","sy","td","underscores","variable name"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-76a2c009","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-9d92ea61","guard":[["hasAny",["ao","bw","class name","dz","ga","il","item number","kw","lu","nth","pascal case","pascalcase","si","sy","td","upper camel case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-9e129357","guard":[["hasAny",["ao","bw","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-d37d8397","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-da8732f1","guard":[["hasAny",["ao","bw","camel case","camelcase","dz","ga","il","item number","kw","lower camel case","lu","nth","si","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-e51edc2a","guard":[["hasAny",["ao","bw","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-fa25b318","guard":[["hasAny",["ao","bw","class name","dz","ga","il","item number","kw","lu","nth","pascal case","pascalcase","si","sy","td","upper camel case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-06449ecc","guard":[["hasAny",["ao","bw","dz","each word","ga","il","invert case","item number","kw","lu","nth","si","split into words","swap case","sy","td","toggle case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.and",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-0b5bac55","guard":[["hasAny",["ao","backwards","bw","dz","each word","ga","il","item number","kw","lu","nth","reverse order","reversed","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-0c601cbb","guard":[["hasAny",["ao","bw","dashes","dz","ga","hyphens","il","item number","kebab case","kebabcase","kw","lu","nth","reverse the words","reverse word order","si","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-127fc03d","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","snake case","snakecase","sy","td","underscores","variable name","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-14a93793","guard":[["hasAny",["ao","bw","dz","each word","ga","il","invert case","item number","kw","lu","nth","si","split into words","swap case","sy","td","toggle case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-1869e3d7","guard":[["hasAny",["ao","bw","dz","each word","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","split into words","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.and",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-1ae8a38d","guard":[["hasAny",["ao","bw","dashes","dz","ga","hyphens","il","item number","kebab case","kebabcase","kw","lu","nth","reverse the words","reverse word order","si","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-1f560d71","guard":[["hasAny",["ao","bw","camel case","camelcase","capitalise","capitalize","capitalize each word","dz","ga","il","item number","kw","lower camel case","lu","nth","si","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-21eb0128","guard":[["hasAny",["ao","bw","class name","dz","ga","il","invert case","item number","kw","lu","nth","pascal case","pascalcase","si","swap case","sy","td","toggle case","upper camel case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-25a13068","guard":[["hasAny",["ao","bw","capital letters","capitals","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td","upper case","uppercase"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.lines",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-267a0f02","guard":[["hasAny",["ao","bw","camel case","camelcase","dz","ga","il","invert case","item number","kw","lower camel case","lu","nth","si","swap case","sy","td","toggle case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-280aef9f","guard":[["hasAny",["ao","bw","dz","ga","il","invert case","item number","kw","lu","nth","si","snake case","snakecase","swap case","sy","td","toggle case","underscores","variable name"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-29378f5a","guard":[["hasAny",["ao","bw","camel case","camelcase","capital letters","capitals","dz","ga","il","item number","kw","lower camel case","lu","nth","si","sy","td","upper case","uppercase"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-323585e8","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","snake case","snakecase","sy","td","underscores","variable name","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-35ec1ac0","guard":[["hasAny",["ao","bw","capitalise","capitalize","capitalize each word","dashes","dz","ga","hyphens","il","item number","kebab case","kebabcase","kw","lu","nth","si","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-43b6d369","guard":[["hasAny",["ao","bw","dz","each word","ga","il","item number","kw","lu","nth","shortest","shortest one","shortest word","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-48d57d24","guard":[["hasAny",["ao","backwards","bw","dz","each word","ga","il","item number","kw","lu","nth","reverse order","reversed","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-4a5c3fd0","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kw","lu","normalise","normalize","nth","si","simplify the text","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":3}]],"mem":null},
{"id":"n-4b3a9ea2","guard":[["hasAny",["ao","bw","class name","dz","ga","il","invert case","item number","kw","lu","nth","pascal case","pascalcase","si","swap case","sy","td","toggle case","upper camel case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-503c7fe6","guard":[["hasAny",["ao","bw","dashes","dz","each word","ga","hyphens","il","item number","kebab case","kebabcase","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.lines",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-51a02e36","guard":[["hasAny",["ao","bw","camel case","camelcase","dz","ga","il","item number","kw","lower camel case","lu","nth","reverse the words","reverse word order","si","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-51e56a5c","guard":[["hasAny",["a to z","alphabetical","alphabetize","ao","bw","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-5684cdda","guard":[["hasAny",["ao","bw","class name","dz","ga","il","invert case","item number","kw","lu","nth","pascal case","pascalcase","si","swap case","sy","td","toggle case","upper camel case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.swapCase",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-5e2a63ca","guard":[["hasAny",["ao","bw","dashes","dz","ga","hyphens","il","invert case","item number","kebab case","kebabcase","kw","lu","nth","si","swap case","sy","td","toggle case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-62377284","guard":[["hasAny",["ao","bw","capitalise","capitalize","capitalize each word","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.lines",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-62f85b10","guard":[["hasAny",["ao","bw","capital letters","capitals","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td","upper case","uppercase"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.list",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-670ddd10","guard":[["hasAny",["ao","bw","capital letters","capitals","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td","upper case","uppercase"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.and",["transform.words",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-697abbfd","guard":[["hasAny",["ao","bw","camel case","camelcase","capital letters","capitals","dz","ga","il","item number","kw","lower camel case","lu","nth","si","sy","td","upper case","uppercase"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.upper",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-6a2de609","guard":[["hasAny",["ao","bw","camel case","camelcase","capitalise","capitalize","capitalize each word","dz","ga","il","item number","kw","lower camel case","lu","nth","si","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.title",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-6b939dfb","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kw","lu","normalise","normalize","nth","si","simplify the text","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":3}]],"mem":null},
{"id":"n-6f19d8fe","guard":[["hasAny",["ao","bw","dashes","dz","each word","ga","hyphens","il","item number","kebab case","kebabcase","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.list",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-7034c921","guard":[["hasAny",["ao","bw","dashes","dz","each word","ga","hyphens","il","item number","kebab case","kebabcase","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.and",["transform.words",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-7104616a","guard":[["hasAny",["ao","bw","camel case","camelcase","dz","ga","il","invert case","item number","kw","lower camel case","lu","nth","si","swap case","sy","td","toggle case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-7836ae3d","guard":[["hasAny",["ao","bw","capitalise","capitalize","capitalize each word","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.and",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-8227cc0c","guard":[["hasAny",["a to z","alphabetical","alphabetize","ao","bw","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-82e70790","guard":[["hasAny",["ao","bw","capitalise","capitalize","capitalize each word","dz","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-862f9378","guard":[["hasAny",["ao","bw","camel case","camelcase","dz","ga","il","invert case","item number","kw","lower camel case","lu","nth","si","swap case","sy","td","toggle case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-88d8f09c","guard":[["hasAny",["ao","bw","class name","dz","ga","il","item number","kw","lu","nth","pascal case","pascalcase","reverse the words","reverse word order","si","sy","td","upper camel case","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-8e1279e1","guard":[["hasAny",["ao","bw","camel case","camelcase","dz","ga","il","item number","kw","lower camel case","lu","nth","reverse the words","reverse word order","si","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-a1ff3980","guard":[["hasAny",["ao","bw","capital letters","capitals","dz","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","sy","td","upper case","uppercase","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-a6519b77","guard":[["hasAny",["ao","bw","dashes","dz","ga","hyphens","il","invert case","item number","kebab case","kebabcase","kw","lu","nth","si","swap case","sy","td","toggle case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.swapCase",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-aa2a0348","guard":[["hasAny",["a to z","alphabetical","alphabetize","ao","bw","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-abfcec24","guard":[["hasAny",["ao","bw","dz","each word","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","split into words","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.list",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-acb40caf","guard":[["hasAny",["ao","bw","dz","each word","ga","il","item number","kw","longest one","longest word","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-bd18cd53","guard":[["hasAny",["ao","bw","camel case","camelcase","dz","ga","il","invert case","item number","kw","lower camel case","lu","nth","si","swap case","sy","td","toggle case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-bfd4b080","guard":[["hasAny",["ao","bw","dz","ga","il","invert case","item number","kw","lu","nth","reverse the words","reverse word order","si","swap case","sy","td","toggle case","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-c3421431","guard":[["hasAny",["ao","bw","class name","dz","ga","il","item number","kw","lu","nth","pascal case","pascalcase","reverse the words","reverse word order","si","sy","td","upper camel case","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-c4f28ac3","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kw","lower case","lowercase","lu","nth","reverse the words","reverse word order","si","small letters","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-c62cd9d5","guard":[["hasAny",["ao","bw","dz","each word","ga","il","item number","kw","lu","nth","shortest","shortest one","shortest word","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-d10fa47a","guard":[["hasAny",["ao","bw","dz","each word","ga","il","item number","kw","longest one","longest word","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-d707e375","guard":[["hasAny",["ao","bw","camel case","camelcase","dz","ga","il","item number","kw","lower camel case","lower case","lowercase","lu","nth","si","small letters","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-d8137d62","guard":[["hasAny",["ao","bw","capitalise","capitalize","capitalize each word","dashes","dz","ga","hyphens","il","item number","kebab case","kebabcase","kw","lu","nth","si","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.title",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-db5da4a8","guard":[["hasAny",["ao","bw","dz","ga","il","invert case","item number","kw","lu","nth","si","snake case","snakecase","swap case","sy","td","toggle case","underscores","variable name"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.swapCase",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-e2032558","guard":[["hasAny",["ao","bw","dz","ga","il","item number","kw","lower case","lowercase","lu","nth","reverse the words","reverse word order","si","small letters","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-e5f15838","guard":[["hasAny",["ao","bw","dz","each word","ga","il","invert case","item number","kw","lu","nth","si","split into words","swap case","sy","td","toggle case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.list",["transform.words",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-e6a1c886","guard":[["hasAny",["ao","bw","capitalise","capitalize","capitalize each word","dz","ga","il","item number","kw","lu","nth","si","snake case","snakecase","sy","td","underscores","variable name"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-e86b63c7","guard":[["hasAny",["ao","bw","capitalise","capitalize","capitalize each word","dz","each word","ga","il","item number","kw","lu","nth","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.list",["transform.words",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-eb74a96f","guard":[["hasAny",["ao","bw","camel case","camelcase","dz","ga","il","item number","kw","lower camel case","lower case","lowercase","lu","nth","si","small letters","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-eec62420","guard":[["hasAny",["ao","bw","capitalise","capitalize","capitalize each word","dz","ga","il","item number","kw","lu","nth","si","snake case","snakecase","sy","td","underscores","variable name"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.title",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-f3eb137e","guard":[["hasAny",["ao","bw","dz","ga","il","invert case","item number","kw","lu","nth","reverse the words","reverse word order","si","swap case","sy","td","toggle case","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-f788996b","guard":[["hasAny",["ao","bw","dz","each word","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","split into words","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.lines",["transform.words",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-f9bdc26a","guard":[["hasAny",["ao","bw","class name","dz","ga","il","invert case","item number","kw","lu","nth","pascal case","pascalcase","si","swap case","sy","td","toggle case","upper camel case"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-fac868f0","guard":[["hasAny",["ao","bw","capital letters","capitals","dz","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","sy","td","upper case","uppercase","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-fb9bd03e","guard":[["hasAny",["ao","backwards","bw","dz","each word","ga","il","item number","kw","lu","nth","reverse order","reversed","si","split into words","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-ffe3bb94","guard":[["hasAny",["ao","bw","capitalise","capitalize","capitalize each word","dz","ga","il","item number","kw","lu","nth","reverse the words","reverse word order","si","sy","td","words backwards"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]]],"mem":null},
{"id":"n-7d66277d","guard":[["hasAny",["ao","bw","characters from","dz","ga","il","item number","kw","letters from to","lu","nth","si","slice of the text","substring","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-fb2ed1f1","guard":[["hasAny",["ao","bw","characters from","dz","ga","il","item number","kw","letters from to","lu","nth","si","slice of the text","substring","sy","td"]],["has","country"],["words<=",8],["nums==",0],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-419c1da7","guard":[["hasAny",["bw","dz","item number","kp","kw","leading zeros","lu","nth","pad with","padded to","sa","sb","si","zero pad"]],["has","country"],["words<=",8],["nums==",0],["not",["has","abbreviation"]],["has","the"],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-eec52a77","guard":[["hasAny",["bw","dz","item number","kp","kw","leading zeros","lu","nth","pad with","padded to","sa","sb","si","zero pad"]],["has","country"],["words<=",8],["nums==",0],["not",["has","abbreviation"]],["has","the"],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-0757bcfc","guard":[["hasAny",["bw","dz","item number","kp","kw","leading zeros","lu","nth","pad with","padded to","sa","sb","si","zero pad"]],["has","country"],["words<=",8],["nums==",0],["not",["has","abbreviation"]],["has","the"],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]],"mem":null},
{"id":"n-0e440648","guard":[["hasAny",["bw","dz","item number","kp","kw","leading zeros","lu","nth","pad with","padded to","sa","sb","si","zero pad"]],["has","country"],["words<=",8],["nums==",0],["not",["has","abbreviation"]],["has","the"],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]],"mem":null},
{"id":"n-12f5b169","guard":[["hasAny",["ao","characters from","ga","il","item number","kw","letters from to","nth","slice of the text","substring","sy","td"]],["has","country"],["nums==",0],["words<=",8],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-9709e717","guard":[["hasAny",["ao","characters from","ga","il","item number","kw","letters from to","nth","slice of the text","substring","sy","td"]],["has","country"],["nums==",0],["words<=",8],["has","the"],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-7f68f962","guard":[["hasAny",["item number","kp","leading zeros","lu","nth","pad with","padded to","sa","sb","zero pad"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","alpha2"]],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-9bc30bfa","guard":[["hasAny",["item number","kp","leading zeros","lu","nth","pad with","padded to","sa","sb","zero pad"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","alpha2"]],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-6ef406a1","guard":[["hasAny",["code","item number","nth","position"]],["has","country"],["has","tell"],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.roman"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-1657c681","guard":[["hasAny",["item number","kp","leading zeros","lu","nth","pad with","padded to","sa","sb","zero pad"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","alpha2"]],["not",["has","all"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]],"mem":null},
{"id":"n-5d764118","guard":[["hasAny",["item number","kp","leading zeros","lu","nth","pad with","padded to","sa","sb","zero pad"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","alpha2"]],["not",["has","all"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]],"mem":null},
{"id":"n-8571cf9d","guard":[["hasAny",["abbreviate","cr","item number","nth","sa","sm","tt"]],["has","country"],["has","of"],["nums==",0],["not",["has","abbreviation"]],["not",["has","all"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.acronym",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-6f91419b","guard":[["hasAny",["am","how many items","in","item number","nth","number of items","to"]],["has","country"],["words<=",6],["has","the"]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-b8a05731","guard":[["hasAny",["am","copies","how many items","in","item number","nth","number of items","say it times","to"]],["has","country"],["words<=",6],["has","the"]],"pyramid":["render.str",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-e13356f8","guard":[["hasAny",["am","how many items","in","item number","nth","number of items","to"]],["has","country"],["words<=",6],["has","the"]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-eae34951","guard":[["hasAny",["am","how many items","in","item number","nth","number of items","to"]],["has","country"],["words<=",6],["has","the"]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-ec57df5c","guard":[["hasAny",["am","copies","how many items","in","item number","nth","number of items","say it times","to"]],["has","country"],["words<=",6],["has","the"]],"pyramid":["render.code",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-42903ba0","guard":[["hasAny",["characters from","ga","item number","letters from to","nth","slice of the text","substring","sy","td"]],["has","country"],["nums==",0],["has","the"],["words<=",8],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-e79c6b21","guard":[["hasAny",["characters from","ga","item number","letters from to","nth","slice of the text","substring","sy","td"]],["has","country"],["nums==",0],["has","the"],["words<=",8],["not",["has","abbreviation"]],["not",["has","an"]]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-40163753","guard":[["hasAny",["item number","leading zeros","nth","pad with","padded to","sa","sb","zero pad"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","all"]],["not",["has","alpha2"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-9910a219","guard":[["hasAny",["item number","leading zeros","nth","pad with","padded to","sa","sb","zero pad"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","all"]],["not",["has","alpha2"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-ae80cb82","guard":[["hasAny",["change to","code","element","item number","nth","position","replace","substitute","swap"]],["has","country"]],"pyramid":["render.code",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.unit"],["sense.roman"]]],"mem":null},
{"id":"n-ea518366","guard":[["hasAny",["change to","code","element","item number","nth","position","replace","substitute","swap"]],["has","country"]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.unit"],["sense.roman"]]],"mem":null},
{"id":"n-75a95c81","guard":[["hasAny",["item number","leading zeros","nth","pad with","padded to","sa","sb","zero pad"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","all"]],["not",["has","alpha2"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]],"mem":null},
{"id":"n-7ebfa601","guard":[["hasAny",["item number","leading zeros","nth","pad with","padded to","sa","sb","zero pad"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","all"]],["not",["has","alpha2"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]]],"mem":null},
{"id":"n-224ad651","guard":[["hasAny",["item number","nth","us"]],["has","code"],["has","tell"],["nums==",0]],"pyramid":["render.template",{"lit":["The country of US is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-3cfc80d0","guard":[["hasAny",["do","item number","nth"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The country of DO is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-4313531a","guard":[["hasAny",["item number","nth","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The country of TO is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-696a8fae","guard":[["hasAny",["in","item number","nth"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The country of IN is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-8372667f","guard":[["hasAny",["item number","nth","so"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The country of SO is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-bbeebe48","guard":[["hasAny",["am","item number","nth"]],["words<=",5]],"pyramid":["render.template",{"lit":["The country of AM is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-103f93cb","guard":[["hasAny",["am","item number","nth"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["render.and",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-111f0956","guard":[["hasAny",["am","item number","nth"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["render.list",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-15348b74","guard":[["hasAny",["item number","kp","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of KP is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-1626b33e","guard":[["hasAny",["am","item number","nth"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-16d1597d","guard":[["hasAny",["characters from","item number","letters from to","nth","slice of the text","substring","td"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","andorra"]],["not",["has","belongs"]],["not",["has","brea"]]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1},{"lit":4}]],"mem":null},
{"id":"n-19cef7f1","guard":[["hasAny",["es","item number","nth"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ES is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-1a4e45dc","guard":[["hasAny",["gy","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of GY is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-1ca9be4f","guard":[["hasAny",["item number","kn","nth"]],["has","give"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of KN is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-21b4431f","guard":[["hasAny",["item number","nth","py"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of PY is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-28b421de","guard":[["hasAny",["item number","nth","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["render.list",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-2b3fbe7c","guard":[["hasAny",["item number","nth","ve"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of VE is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-2f39a7cb","guard":[["hasAny",["af","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AF is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-3e9e465b","guard":[["hasAny",["in","item number","nth"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["render.list",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-4a1dd035","guard":[["hasAny",["item number","nth","pt"]],["has","give"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of PT is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-60f46ded","guard":[["hasAny",["dk","item number","nth"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of DK is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-61c217ae","guard":[["hasAny",["item number","nth","tm"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TM is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-62b2e803","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-641b2476","guard":[["hasAny",["cv","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of CV is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-64ed5e75","guard":[["hasAny",["item number","mv","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of MV is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-68b248bc","guard":[["hasAny",["in","item number","nth"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["render.and",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-69c95141","guard":[["hasAny",["item number","nth","zm"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ZM is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-6d8c4b72","guard":[["hasAny",["item number","nth","ru"]],["has","give"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of RU is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-6e79a305","guard":[["hasAny",["de","item number","nth"]],["words<=",5],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of DE is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-7292cdd9","guard":[["hasAny",["dz","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of DZ is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-77c09404","guard":[["hasAny",["item number","leading zeros","mg","nth","pad","pad with","padded to","position","zero pad"]],["has","country"],["has","of"],["not",["has","name"]]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordCount"],["sense.unit"]]],"mem":null},
{"id":"n-7c48f932","guard":[["hasAny",["item number","ki","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of KI is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-7c951124","guard":[["hasAny",["cu","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of CU is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-7d8afb08","guard":[["hasAny",["item number","jp","nth"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of JP is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-7e636afc","guard":[["hasAny",["item number","la","nth"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of LA is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-974abe54","guard":[["hasAny",["in","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-992264d1","guard":[["hasAny",["iq","item number","nth"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IQ is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-9c3b93a1","guard":[["hasAny",["item number","leading zeros","mg","nth","pad","pad with","padded to","position","zero pad"]],["has","what"],["has","country"]],"pyramid":["render.code",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":10},["sense.unit"]]],"mem":null},
{"id":"n-a1b0434c","guard":[["hasAny",["item number","nth","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-aa8fa1fe","guard":[["hasAny",["gr","item number","nth"]],["words<=",5],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of GR is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-c0123657","guard":[["hasAny",["dm","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of DM is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-c2224219","guard":[["hasAny",["item number","kh","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of KH is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-c360dc47","guard":[["hasAny",["item number","lv","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of LV is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-cd9fd707","guard":[["hasAny",["item number","leading zeros","mg","nth","pad","pad with","padded to","position","zero pad"]],["has","what"],["has","country"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":10},["sense.unit"]]],"mem":null},
{"id":"n-e249717b","guard":[["hasAny",["am","item number","nth","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-e477b2fb","guard":[["hasAny",["item number","nth","sv"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SV is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-ea2ca315","guard":[["hasAny",["item number","nth","sd"]],["words<=",5],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SD is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-eca13353","guard":[["hasAny",["bo","item number","nth"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of BO is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-ed9d7f53","guard":[["hasAny",["characters from","item number","letters from to","nth","slice of the text","substring","td"]],["has","country"],["words<=",8],["not",["has","abbreviation"]],["not",["has","andorra"]],["not",["has","belongs"]],["not",["has","brea"]]],"pyramid":["render.code",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],{"lit":1},{"lit":4}]],"mem":null},
{"id":"n-ee6597a1","guard":[["hasAny",["item number","nth","tl"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TL is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-f49076ea","guard":[["hasAny",["item number","leading zeros","mg","nth","pad","pad with","padded to","position","zero pad"]],["has","country"],["has","of"],["not",["has","name"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}],["sense.wordCount"],["sense.unit"]]],"mem":null},
{"id":"n-f6b65956","guard":[["hasAny",["ae","item number","nth"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AE is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-f9eee101","guard":[["hasAny",["item number","nth","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["render.and",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-0030d09c","guard":[["hasAny",["in","item number","nth"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-0187971b","guard":[["hasAny",["item number","nth","sy"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SY is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-018db650","guard":[["hasAny",["a to z","alphabetical","alphabetize","in","item number","nth"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["render.list",["transform.sortStrs",["sense.content"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-02068fd3","guard":[["hasAny",["item number","mw","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of MW is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-037d59b9","guard":[["hasAny",["am","item number","nth","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-03eaabf1","guard":[["hasAny",["am","dashes","hyphens","item number","kebab case","kebabcase","nth","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-0523cbe1","guard":[["hasAny",["am","item number","lower case","lowercase","nth","shortest","shortest one","shortest word","small letters"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-05d3a522","guard":[["hasAny",["in","item number","nth","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-0822b00c","guard":[["hasAny",["item number","ne","nth"]],["has","tell"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of NE is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-0d00efc0","guard":[["hasAny",["er","item number","nth"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ER is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-0f6fa842","guard":[["hasAny",["do","item number","nth"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of DO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-0f9352d4","guard":[["hasAny",["gt","item number","nth"]],["has","tell"],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of GT is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-102c4d2a","guard":[["hasAny",["item number","nth","tz"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TZ is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-12ef5fd0","guard":[["hasAny",["item number","lt","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of LT is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-13cd3275","guard":[["hasAny",["backwards","in","item number","nth","reverse order","reversed"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["render.and",["transform.reverseStrs",["sense.content"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-14859ced","guard":[["hasAny",["dashes","hyphens","in","item number","kebab case","kebabcase","nth","shortest","shortest one","shortest word"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-22cbf1e0","guard":[["hasAny",["camel case","camelcase","in","item number","lower camel case","nth","shortest","shortest one","shortest word"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-234aeed5","guard":[["hasAny",["bw","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of BW is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-26270e73","guard":[["hasAny",["item number","mm","nth"]],["has","code"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of MM is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-28ea3c00","guard":[["hasAny",["in","invert case","item number","nth","shortest","shortest one","shortest word","swap case","toggle case"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-2ba7be18","guard":[["hasAny",["capital letters","capitals","in","item number","nth","shortest","shortest one","shortest word","upper case","uppercase"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-2c80544f","guard":[["hasAny",["cm","item number","nth"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of CM is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-2f4bea73","guard":[["hasAny",["class name","in","item number","nth","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-2fc048f2","guard":[["hasAny",["il","item number","nth"]],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IL is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-30f88a48","guard":[["hasAny",["item number","mc","nth"]],["has","tell"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of MC is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-31d46522","guard":[["hasAny",["ca","item number","nth"]],["has","country"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of CA is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-3328a388","guard":[["hasAny",["item number","li","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of LI is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-36681903","guard":[["hasAny",["camel case","camelcase","item number","lower camel case","nth","shortest","shortest one","shortest word","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-3721eec0","guard":[["hasAny",["ad","item number","nth"]],["has","what"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AD is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-389cf8be","guard":[["hasAny",["item number","lc","nth"]],["has","code"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of LC is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-40b9cd28","guard":[["hasAny",["item number","nr","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of NR is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-420876e0","guard":[["hasAny",["au","item number","nth"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AU is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-42637fa7","guard":[["hasAny",["ee","item number","nth"]],["has","tell"],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of EE is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-46a7e9cd","guard":[["hasAny",["item number","nth","us"]],["has","code"],["has","tell"],["nums==",0]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of US is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-48035660","guard":[["hasAny",["item number","nth","sm"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SM is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-4c757ee7","guard":[["hasAny",["invert case","item number","nth","shortest","shortest one","shortest word","swap case","to","toggle case"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-4cc081aa","guard":[["hasAny",["item number","nth","uy"]],["words<=",6],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of UY is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-4d8bdba9","guard":[["hasAny",["item number","lower case","lowercase","nth","shortest","shortest one","shortest word","small letters","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-4eb2ca29","guard":[["hasAny",["class name","item number","nth","pascal case","pascalcase","to","upper camel case"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-58664fa7","guard":[["hasAny",["item number","nth","th"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TH is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-5ac02e6a","guard":[["hasAny",["item number","nth","sb"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SB is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-656a6b9e","guard":[["hasAny",["item number","nth","tt"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TT is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-65ac65ca","guard":[["hasAny",["item number","mg","nth"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of MG is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-68d6cae6","guard":[["hasAny",["dashes","hyphens","item number","kebab case","kebabcase","nth","shortest","shortest one","shortest word","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-6b9289e8","guard":[["hasAny",["item number","lr","nth"]],["words<=",6],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of LR is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-6bae4587","guard":[["hasAny",["item number","kr","nth"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of KR is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-6ca210c4","guard":[["hasAny",["am","class name","item number","nth","pascal case","pascalcase","upper camel case"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-6dc74169","guard":[["hasAny",["item number","mo","nth"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of MO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-6dff96ab","guard":[["hasAny",["cg","item number","nth"]],["has","tell"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of CG is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-6e3f35f9","guard":[["hasAny",["item number","nth","td"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TD is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-6f1e3d52","guard":[["hasAny",["item number","nth","zw"]],["has","tell"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ZW is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-71ea5572","guard":[["hasAny",["item number","mr","nth"]],["words<=",6],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of MR is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-72997d21","guard":[["hasAny",["in","item number","lower case","lowercase","nth","shortest","shortest one","shortest word","small letters"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-73f0e6fc","guard":[["hasAny",["am","invert case","item number","nth","swap case","toggle case"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-74d0c08b","guard":[["hasAny",["item number","nth","rw"]],["has","tell"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of RW is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-76431ad2","guard":[["hasAny",["item number","nth","pe"]],["has","tell"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of PE is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-77d2079f","guard":[["hasAny",["a to z","alphabetical","alphabetize","in","item number","nth"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["render.and",["transform.sortStrs",["sense.content"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-78dff05d","guard":[["hasAny",["item number","mz","nth"]],["has","what"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of MZ is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-7978609a","guard":[["hasAny",["am","backwards","item number","nth","reverse order","reversed"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["render.list",["transform.reverseStrs",["sense.content"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-7c0529fa","guard":[["hasAny",["item number","lu","nth"]],["has","tell"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of LU is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-7d21bb39","guard":[["hasAny",["am","invert case","item number","nth","shortest","shortest one","shortest word","swap case","toggle case"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-7f32c7e0","guard":[["hasAny",["class name","item number","nth","pascal case","pascalcase","shortest","shortest one","shortest word","to","upper camel case"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-8053a54e","guard":[["hasAny",["hr","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of HR is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-88bb18b3","guard":[["hasAny",["item number","nth","va"]],["has","what"],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of VA is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-89e4b7c9","guard":[["hasAny",["backwards","item number","nth","reverse order","reversed","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["render.list",["transform.reverseStrs",["sense.content"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-8a19b18b","guard":[["hasAny",["item number","ng","nth"]],["words>=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of NG is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-8ca7d979","guard":[["hasAny",["bj","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of BJ is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-920fc1df","guard":[["hasAny",["item number","nth","so"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-9be089fa","guard":[["hasAny",["item number","mh","nth"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of MH is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-9e88ab74","guard":[["hasAny",["item number","nth","si"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SI is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-a87a4041","guard":[["hasAny",["fr","item number","nth"]],["has","country"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of FR is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-ad613b64","guard":[["hasAny",["am","class name","item number","nth","pascal case","pascalcase","shortest","shortest one","shortest word","upper camel case"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-b0de4543","guard":[["hasAny",["item number","mu","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of MU is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-b66bd84e","guard":[["hasAny",["bi","item number","nth"]],["has","what"],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of BI is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-c05e46f9","guard":[["hasAny",["item number","nth","se"]],["has","code"],["has","tell"],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SE is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-c1f7ca2e","guard":[["hasAny",["capital letters","capitals","item number","nth","shortest","shortest one","shortest word","to","upper case","uppercase"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-c4efb85f","guard":[["hasAny",["am","camel case","camelcase","item number","lower camel case","nth","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-c54cbf66","guard":[["hasAny",["ie","item number","nth"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IE is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-c64c7f4d","guard":[["hasAny",["ga","item number","nth"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of GA is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-c6c8f8bf","guard":[["hasAny",["bh","item number","nth"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of BH is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-c98ece6d","guard":[["hasAny",["backwards","in","item number","nth","reverse order","reversed"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["render.list",["transform.reverseStrs",["sense.content"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-c9ff70ad","guard":[["hasAny",["co","item number","nth"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of CO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-ccd9ca9a","guard":[["hasAny",["item number","kw","nth"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of KW is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-d2389d54","guard":[["hasAny",["item number","nth","sr"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SR is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-d5f92798","guard":[["hasAny",["item number","nth","sc"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SC is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-d84098f4","guard":[["hasAny",["am","capital letters","capitals","item number","nth","shortest","shortest one","shortest word","upper case","uppercase"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-d8663c9b","guard":[["hasAny",["bd","item number","nth"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of BD is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-dc1c0c15","guard":[["hasAny",["capitalise","capitalize","capitalize each word","in","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-dd7ae507","guard":[["hasAny",["cr","item number","nth"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of CR is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-ddb3242e","guard":[["hasAny",["item number","nth","vu"]],["has","what"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of VU is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-de52aab1","guard":[["hasAny",["item number","nth","sa"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SA is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-e2a2469d","guard":[["hasAny",["invert case","item number","nth","swap case","to","toggle case"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-e7fc2117","guard":[["hasAny",["ao","item number","nth"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-ed61b328","guard":[["hasAny",["br","item number","nth"]],["has","tell"],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of BR is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-f1e0327b","guard":[["hasAny",["am","capitalise","capitalize","capitalize each word","item number","nth","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-f34ca74d","guard":[["hasAny",["item number","nth","tg"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TG is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-f59d0d91","guard":[["hasAny",["item number","nth","reverse the words","reverse word order","shortest","shortest one","shortest word","to","words backwards"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-f9965ac1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","shortest","shortest one","shortest word","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-fb290e7d","guard":[["hasAny",["az","item number","nth"]],["has","country"],["has","what"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AZ is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-fb78da61","guard":[["hasAny",["item number","nth","sn"]],["has","tell"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SN is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-08cf9b71","guard":[["hasAny",["capital letters","capitals","item number","nth","upper case","uppercase","us"]],["has","code"],["has","tell"],["nums==",0]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of US is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-140faffc","guard":[["hasAny",["do","invert case","item number","nth","swap case","toggle case"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of DO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-24f93e1d","guard":[["hasAny",["each word","item number","nth","split into words","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-255e9c16","guard":[["hasAny",["am","each word","item number","nth","split into words"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-29e3c28b","guard":[["hasAny",["dashes","hyphens","item number","kebab case","kebabcase","nth","so"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-31ac2afc","guard":[["hasAny",["item number","lower case","lowercase","nth","small letters","so"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-35739bcc","guard":[["hasAny",["invert case","item number","nth","so","swap case","toggle case"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-46ded756","guard":[["hasAny",["capitalise","capitalize","capitalize each word","do","item number","nth"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of DO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-6191e619","guard":[["hasAny",["do","item number","lower case","lowercase","nth","small letters"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of DO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-668d3a59","guard":[["hasAny",["capital letters","capitals","do","item number","nth","upper case","uppercase"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of DO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-7f3102ce","guard":[["hasAny",["item number","nth","reverse the words","reverse word order","so","words backwards"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-8a24aa47","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","so"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-948e891a","guard":[["hasAny",["class name","item number","nth","pascal case","pascalcase","so","upper camel case"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-98c02d77","guard":[["hasAny",["capital letters","capitals","item number","nth","so","upper case","uppercase"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-9a39a56c","guard":[["hasAny",["item number","lower case","lowercase","nth","small letters","us"]],["has","code"],["has","tell"],["nums==",0]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of US is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-aa1c2658","guard":[["hasAny",["invert case","item number","nth","swap case","toggle case","us"]],["has","code"],["has","tell"],["nums==",0]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of US is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-af556bfe","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","us"]],["has","code"],["has","tell"],["nums==",0]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of US is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-d78fe9b4","guard":[["hasAny",["am","each word","item number","nth","split into words"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is ",{"slot":1},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-e28b712e","guard":[["hasAny",["camel case","camelcase","item number","lower camel case","nth","so"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SO is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]]],"mem":null},
{"id":"n-e519d288","guard":[["hasAny",["each word","item number","nth","split into words","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is ",{"slot":1},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-db59670a","guard":[["hasAny",["in","item number","joined with","nth","separated by"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is ",{"slot":1},"."]},["transform.join",["sense.content"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"}],{"lit":1}],{"lit":"fr-tidytuesday-country-lists-4a59d2"},{"lit":"code"},{"lit":"country"}]],"mem":null},
{"id":"n-023c7f56","guard":[["hasAny",["code","country","hr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code HR":"The country of HR is Croatia."}}},
{"id":"n-07dc827e","guard":[["hasAny",["az","country"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of AZ":"The country of AZ is Azerbaijan."}}},
{"id":"n-103bda8a","guard":[["hasAny",["country","jp"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for JP":"The country of JP is Japan."}}},
{"id":"n-103e4c58","guard":[["hasAny",["country","kp"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for KP":"The country of KP is North Korea."}}},
{"id":"n-127be5c4","guard":[["hasAny",["bo","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for BO":"The country of BO is Bolivia."}}},
{"id":"n-16a8a917","guard":[["hasAny",["country","tm"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for TM":"The country of TM is Turkmenistan."}}},
{"id":"n-17ad149d","guard":[["hasAny",["country","dz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for DZ":"The country of DZ is Algeria."}}},
{"id":"n-1a4a6ce9","guard":[["hasAny",["country","sc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of SC":"The country of SC is Seychelles."}}},
{"id":"n-1b6744dc","guard":[["hasAny",["code","country","pe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code PE":"The country of PE is Peru."}}},
{"id":"n-1c4d8651","guard":[["hasAny",["ad","country"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of AD":"The country of AD is Andorra."}}},
{"id":"n-1f550387","guard":[["hasAny",["country","vu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of VU":"The country of VU is Vanuatu."}}},
{"id":"n-2263fed2","guard":[["hasAny",["af","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for AF":"The country of AF is Afghanistan."}}},
{"id":"n-248fa8bb","guard":[["hasAny",["code","country","se"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code SE":"The country of SE is Sweden."}}},
{"id":"n-25d0ed22","guard":[["hasAny",["country","cr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of CR":"The country of CR is Costa Rica."}}},
{"id":"n-26aad80f","guard":[["hasAny",["bd","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of BD":"The country of BD is Bangladesh."}}},
{"id":"n-27dd05c5","guard":[["hasAny",["country","ki"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for KI":"The country of KI is Kiribati."}}},
{"id":"n-289c74a7","guard":[["hasAny",["au","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of AU":"The country of AU is Australia."}}},
{"id":"n-2b8e4493","guard":[["hasAny",["code","country","tg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code TG":"The country of TG is Togo."}}},
{"id":"n-2f3eab45","guard":[["hasAny",["code","country","er"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code ER":"The country of ER is Eritrea."}}},
{"id":"n-30b838fc","guard":[["hasAny",["ca","code","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code CA":"The country of CA is Canada."}}},
{"id":"n-30e53cc5","guard":[["hasAny",["cg","code","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code CG":"The country of CG is Congo (Rep.)."}}},
{"id":"n-344a4c7b","guard":[["hasAny",["code","country","ne"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code NE":"The country of NE is Niger."}}},
{"id":"n-34c8633f","guard":[["hasAny",["code","country","sr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code SR":"The country of SR is Suriname."}}},
{"id":"n-391a5444","guard":[["hasAny",["country","kw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of KW":"The country of KW is Kuwait."}}},
{"id":"n-3a884252","guard":[["hasAny",["code","country","tt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code TT":"The country of TT is Trinidad and Tobago."}}},
{"id":"n-3ef2a6e1","guard":[["hasAny",["country","mh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of MH":"The country of MH is Marshall Islands."}}},
{"id":"n-4807d9f2","guard":[["hasAny",["code","country","lu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code LU":"The country of LU is Luxembourg."}}},
{"id":"n-4af627a7","guard":[["hasAny",["country","de"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for DE":"The country of DE is Germany."}}},
{"id":"n-4ddd4128","guard":[["hasAny",["country","zm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for ZM":"The country of ZM is Zambia."}}},
{"id":"n-4ed0fa54","guard":[["hasAny",["country","es"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for ES":"The country of ES is Spain."}}},
{"id":"n-57522a67","guard":[["hasAny",["code","country","sb"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code SB":"The country of SB is Solomon Islands."}}},
{"id":"n-5c90d9d5","guard":[["hasAny",["code","country","ng"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code NG":"The country of NG is Nigeria."}}},
{"id":"n-5ce5c9cb","guard":[["hasAny",["country","mo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of MO":"The country of MO is Macao (SAR China)."}}},
{"id":"n-5d1f75c5","guard":[["hasAny",["country","sv"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for SV":"The country of SV is El Salvador."}}},
{"id":"n-62f011da","guard":[["hasAny",["country","th"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of TH":"The country of TH is Thailand."}}},
{"id":"n-6303e5d5","guard":[["hasAny",["br","code","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code BR":"The country of BR is Brazil."}}},
{"id":"n-6783a96c","guard":[["hasAny",["cm","code","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code CM":"The country of CM is Cameroon."}}},
{"id":"n-6955e548","guard":[["hasAny",["country","mv"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for MV":"The country of MV is Maldives."}}},
{"id":"n-6a71583c","guard":[["hasAny",["country","la"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for LA":"The country of LA is Laos."}}},
{"id":"n-6ccadde1","guard":[["hasAny",["country","sd"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for SD":"The country of SD is Sudan."}}},
{"id":"n-6d87bf59","guard":[["hasAny",["country","fr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of FR":"The country of FR is France."}}},
{"id":"n-6e051174","guard":[["hasAny",["country","ie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of IE":"The country of IE is Ireland."}}},
{"id":"n-750058ec","guard":[["hasAny",["country","gy"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for GY":"The country of GY is Guyana."}}},
{"id":"n-7cd43e24","guard":[["hasAny",["country","kh"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for KH":"The country of KH is Cambodia."}}},
{"id":"n-8008e9b0","guard":[["hasAny",["country","td"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of TD":"The country of TD is Chad."}}},
{"id":"n-811730a8","guard":[["hasAny",["code","country","li"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code LI":"The country of LI is Liechtenstein."}}},
{"id":"n-814159de","guard":[["hasAny",["country","sm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of SM":"The country of SM is San Marino."}}},
{"id":"n-83b16f8b","guard":[["hasAny",["bj","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of BJ":"The country of BJ is Benin."}}},
{"id":"n-892fdb6e","guard":[["hasAny",["country","mg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of MG":"The country of MG is Madagascar."}}},
{"id":"n-89b1f419","guard":[["hasAny",["country","py"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for PY":"The country of PY is Paraguay."}}},
{"id":"n-89fd1dc0","guard":[["hasAny",["country","ru"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for RU":"The country of RU is Russian Federation."}}},
{"id":"n-8fd4f0cc","guard":[["hasAny",["country","mw"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of MW":"The country of MW is Malawi."}}},
{"id":"n-950dc1cc","guard":[["hasAny",["bh","code","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code BH":"The country of BH is Bahrain."}}},
{"id":"n-968451ef","guard":[["hasAny",["country","si"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of SI":"The country of SI is Slovenia."}}},
{"id":"n-99d95ba4","guard":[["hasAny",["code","country","rw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code RW":"The country of RW is Rwanda."}}},
{"id":"n-99f01d46","guard":[["hasAny",["country","uy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of UY":"The country of UY is Uruguay."}}},
{"id":"n-9b8df6c0","guard":[["hasAny",["country","lv"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for LV":"The country of LV is Latvia."}}},
{"id":"n-9f118b1a","guard":[["hasAny",["country","mu"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of MU":"The country of MU is Mauritius."}}},
{"id":"n-9f633548","guard":[["hasAny",["code","country","sa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code SA":"The country of SA is Saudi Arabia."}}},
{"id":"n-a6d087ba","guard":[["hasAny",["bw","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of BW":"The country of BW is Botswana."}}},
{"id":"n-abd88db4","guard":[["hasAny",["country","iq"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for IQ":"The country of IQ is Iraq."}}},
{"id":"n-ac9312da","guard":[["hasAny",["country","ga"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of GA":"The country of GA is Gabon."}}},
{"id":"n-ae71dc0c","guard":[["hasAny",["country","lr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of LR":"The country of LR is Liberia."}}},
{"id":"n-af7b8c59","guard":[["hasAny",["code","country","mc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code MC":"The country of MC is Monaco."}}},
{"id":"n-b02efe8c","guard":[["hasAny",["code","country","sn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code SN":"The country of SN is Senegal."}}},
{"id":"n-b146bf92","guard":[["hasAny",["country","ve"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for VE":"The country of VE is Venezuela."}}},
{"id":"n-b1c51cfd","guard":[["hasAny",["country","gr"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for GR":"The country of GR is Greece."}}},
{"id":"n-b1d9893b","guard":[["hasAny",["code","country","lc"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code LC":"The country of LC is St. Lucia."}}},
{"id":"n-b2bcbf68","guard":[["hasAny",["code","country","zw"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code ZW":"The country of ZW is Zimbabwe."}}},
{"id":"n-b6caedc7","guard":[["hasAny",["ao","code","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code AO":"The country of AO is Angola."}}},
{"id":"n-babaf76f","guard":[["hasAny",["ae","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for AE":"The country of AE is United Arab Emirates."}}},
{"id":"n-bc379542","guard":[["hasAny",["country","cv"]],["has","give"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for CV":"The country of CV is Cape Verde Islands."}}},
{"id":"n-c42e5ef8","guard":[["hasAny",["code","country","il"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code IL":"The country of IL is Israel."}}},
{"id":"n-c73d25d0","guard":[["hasAny",["country","mz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of MZ":"The country of MZ is Mozambique."}}},
{"id":"n-cb9b296d","guard":[["hasAny",["code","country","ee"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code EE":"The country of EE is Estonia."}}},
{"id":"n-cbc83716","guard":[["hasAny",["co","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of CO":"The country of CO is Colombia."}}},
{"id":"n-ce2cd47b","guard":[["hasAny",["code","country","nr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code NR":"The country of NR is Nauru."}}},
{"id":"n-d87f7002","guard":[["hasAny",["country","dk"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for DK":"The country of DK is Denmark."}}},
{"id":"n-dcda0938","guard":[["hasAny",["country","dm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for DM":"The country of DM is Dominica."}}},
{"id":"n-df136323","guard":[["hasAny",["bi","country"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of BI":"The country of BI is Burundi."}}},
{"id":"n-df993790","guard":[["hasAny",["country","va"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of VA":"The country of VA is Vatican City."}}},
{"id":"n-e84deae0","guard":[["hasAny",["country","mr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of MR":"The country of MR is Mauritania."}}},
{"id":"n-e9689575","guard":[["hasAny",["country","kn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for KN":"The country of KN is St. Kitts and Nevis."}}},
{"id":"n-eacba9db","guard":[["hasAny",["country","lt"]],["has","what"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of LT":"The country of LT is Lithuania."}}},
{"id":"n-ee084fba","guard":[["hasAny",["country","kr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of KR":"The country of KR is South Korea."}}},
{"id":"n-f18b701b","guard":[["hasAny",["country","pt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for PT":"The country of PT is Portugal."}}},
{"id":"n-f6cfe951","guard":[["hasAny",["code","country","tz"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code TZ":"The country of TZ is Tanzania."}}},
{"id":"n-f9897edf","guard":[["hasAny",["country","cu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for CU":"The country of CU is Cuba."}}},
{"id":"n-f99d96d8","guard":[["hasAny",["code","country","gt"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code GT":"The country of GT is Guatemala."}}},
{"id":"n-fd17e4bb","guard":[["hasAny",["country","tl"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for TL":"The country of TL is Timor-Leste."}}},
{"id":"n-fd4715f8","guard":[["hasAny",["country","sy"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of SY":"The country of SY is Syria."}}},
{"id":"n-fec0ad6c","guard":[["hasAny",["code","country","mm"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the code MM":"The country of MM is Myanmar."}}},
{"id":"n-3c674a23","guard":[["hasAny",["shortest","shortest one","shortest word","to"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of TO is Tonga."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-55077a39","guard":[["hasAny",["am","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of AM is Armenia."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6254106e","guard":[["hasAny",["in","shortest","shortest one","shortest word"]],["has","country"],["has","of"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IN is India."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1dfd92e8","guard":[["hasAny",["item number","nth","us"]],["has","country"],["has","tell"],["nums==",0]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of US is United States."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-3391cd39","guard":[["hasAny",["item number","nth","so"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of SO is Somalia."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-d037ad82","guard":[["hasAny",["do","item number","nth"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of DO is Dominican Republic."]},["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-007bf593","guard":[["hasAny",["af","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Afghanistan."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1525af57","guard":[["hasAny",["kh","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Cambodia."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1de66627","guard":[["hasAny",["cv","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Cape Verde Islands."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1f10ab4b","guard":[["hasAny",["es","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Spain."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-20516118","guard":[["hasAny",["dz","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Algeria."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-275c957f","guard":[["hasAny",["shortest","shortest one","shortest word","tm"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Turkmenistan."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-36fd5b04","guard":[["hasAny",["iq","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Iraq."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-406fd563","guard":[["hasAny",["ru","shortest","shortest one","shortest word"]],["has","give"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Russian Federation."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-440e1403","guard":[["hasAny",["mv","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Maldives."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4c18b6ea","guard":[["hasAny",["py","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Paraguay."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5403948b","guard":[["hasAny",["dm","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Dominica."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5ec81d70","guard":[["hasAny",["shortest","shortest one","shortest word","zm"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Zambia."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6881d055","guard":[["hasAny",["lv","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Latvia."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-760a5d53","guard":[["hasAny",["jp","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Japan."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-7c5762d5","guard":[["hasAny",["sd","shortest","shortest one","shortest word"]],["words<=",5],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Sudan."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-894d2ede","guard":[["hasAny",["kp","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is North Korea."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a6162d14","guard":[["hasAny",["gr","shortest","shortest one","shortest word"]],["words<=",5],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Greece."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b02d4975","guard":[["hasAny",["shortest","shortest one","shortest word","ve"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Venezuela."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ba1ba7dd","guard":[["hasAny",["de","shortest","shortest one","shortest word"]],["words<=",5],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Germany."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ba712929","guard":[["hasAny",["ae","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is United Arab Emirates."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c13a3abc","guard":[["hasAny",["bo","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Bolivia."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c2925775","guard":[["hasAny",["shortest","shortest one","shortest word","tl"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Timor-Leste."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c74cbbb1","guard":[["hasAny",["shortest","shortest one","shortest word","sv"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is El Salvador."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-cf4d3e93","guard":[["hasAny",["la","shortest","shortest one","shortest word"]],["words<=",5],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Laos."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d3b5ab7c","guard":[["hasAny",["kn","shortest","shortest one","shortest word"]],["has","give"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is St. Kitts and Nevis."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d6cacfdf","guard":[["hasAny",["pt","shortest","shortest one","shortest word"]],["has","give"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Portugal."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e72935f1","guard":[["hasAny",["cu","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Cuba."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-e9ae942b","guard":[["hasAny",["gy","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Guyana."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fc5a8d1e","guard":[["hasAny",["dk","shortest","shortest one","shortest word"]],["words<=",5]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Denmark."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ff880274","guard":[["hasAny",["ki","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Kiribati."]},["sense.wordAt",{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-036c414c","guard":[["hasAny",["item number","kw","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Kuwait."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-052b3ead","guard":[["hasAny",["hr","item number","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Croatia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-06e1c612","guard":[["hasAny",["cg","item number","nth","shortest","shortest one","shortest word"]],["has","tell"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Congo (Rep.)."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-165f23ed","guard":[["hasAny",["bh","item number","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Bahrain."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-186350ea","guard":[["hasAny",["fr","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is France."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-1a0d885f","guard":[["hasAny",["item number","mo","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Macao (SAR China)."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-21a50d58","guard":[["hasAny",["bj","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Benin."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2691b67e","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sr"]],["has","code"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Suriname."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-287a9ed6","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sy"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Syria."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2ce53307","guard":[["hasAny",["item number","ne","nth","shortest","shortest one","shortest word"]],["has","tell"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Niger."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3107a0b0","guard":[["hasAny",["bw","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Botswana."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3295180b","guard":[["hasAny",["ga","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Gabon."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-36c3b67a","guard":[["hasAny",["item number","mg","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Madagascar."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-39ae9587","guard":[["hasAny",["ee","item number","nth","shortest","shortest one","shortest word"]],["has","tell"],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Estonia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3b08209f","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","uy"]],["words<=",6],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Uruguay."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3f8a66e1","guard":[["hasAny",["item number","nth","se","shortest","shortest one","shortest word"]],["has","code"],["has","tell"],["words<=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Sweden."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-42046946","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tz"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Tanzania."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-46107928","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","vu"]],["has","what"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Vanuatu."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4a409f03","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tg"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Togo."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4ac8d41c","guard":[["hasAny",["item number","nth","pe","shortest","shortest one","shortest word"]],["has","tell"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Peru."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-4f47048c","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sm"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is San Marino."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5447d957","guard":[["hasAny",["item number","kr","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is South Korea."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5bef34ea","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","sn"]],["has","tell"],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Senegal."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5d341cba","guard":[["hasAny",["br","item number","nth","shortest","shortest one","shortest word"]],["has","tell"],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Brazil."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-5fbdb8e7","guard":[["hasAny",["item number","nth","sb","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Solomon Islands."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6305a75c","guard":[["hasAny",["bi","item number","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Burundi."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-65f44df6","guard":[["hasAny",["item number","nth","rw","shortest","shortest one","shortest word"]],["has","tell"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Rwanda."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-67dca258","guard":[["hasAny",["au","item number","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Australia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-6fbed4b0","guard":[["hasAny",["il","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Israel."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-70c725e0","guard":[["hasAny",["co","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Colombia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-756cdff0","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","tt"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Trinidad and Tobago."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-88952606","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","va"]],["has","what"],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Vatican City."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-90d4aba0","guard":[["hasAny",["item number","mh","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Marshall Islands."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-91085a83","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","td"]],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Chad."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-923264c8","guard":[["hasAny",["item number","mz","nth","shortest","shortest one","shortest word"]],["has","what"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Mozambique."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9d0705f1","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","zw"]],["has","tell"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Zimbabwe."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9e7d0311","guard":[["hasAny",["item number","lt","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Lithuania."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a00754cf","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","th"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Thailand."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a4825015","guard":[["hasAny",["ie","item number","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Ireland."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a68626dc","guard":[["hasAny",["item number","lr","nth","shortest","shortest one","shortest word"]],["words<=",6],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Liberia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-a7489e44","guard":[["hasAny",["item number","li","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Liechtenstein."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ab7adec3","guard":[["hasAny",["gt","item number","nth","shortest","shortest one","shortest word"]],["has","tell"],["has","country"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Guatemala."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b4e255ec","guard":[["hasAny",["ao","item number","nth","shortest","shortest one","shortest word"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Angola."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ba5c2837","guard":[["hasAny",["item number","nth","sc","shortest","shortest one","shortest word"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Seychelles."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bf188454","guard":[["hasAny",["ca","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Canada."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-bf2ca894","guard":[["hasAny",["item number","mr","nth","shortest","shortest one","shortest word"]],["words<=",6],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Mauritania."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c1a7b666","guard":[["hasAny",["item number","nth","sa","shortest","shortest one","shortest word"]],["has","country"],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Saudi Arabia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c4137404","guard":[["hasAny",["item number","lu","nth","shortest","shortest one","shortest word"]],["has","tell"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Luxembourg."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c4412aba","guard":[["hasAny",["bd","item number","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Bangladesh."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c6104f77","guard":[["hasAny",["cr","item number","nth","shortest","shortest one","shortest word"]],["has","what"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Costa Rica."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c8b9bd2e","guard":[["hasAny",["item number","ng","nth","shortest","shortest one","shortest word"]],["words>=",8]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Nigeria."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ccd814e6","guard":[["hasAny",["item number","lc","nth","shortest","shortest one","shortest word"]],["has","code"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is St. Lucia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ccdcb987","guard":[["hasAny",["item number","mw","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Malawi."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d3f0f4fb","guard":[["hasAny",["ad","item number","nth","shortest","shortest one","shortest word"]],["has","what"],["words<=",6]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Andorra."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-da646c7b","guard":[["hasAny",["er","item number","nth","shortest","shortest one","shortest word"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Eritrea."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-da9cb20b","guard":[["hasAny",["az","item number","nth","shortest","shortest one","shortest word"]],["has","country"],["has","what"],["not",["has","name"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Azerbaijan."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-ec3aba47","guard":[["hasAny",["item number","nr","nth","shortest","shortest one","shortest word"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Nauru."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f48a926f","guard":[["hasAny",["item number","mm","nth","shortest","shortest one","shortest word"]],["has","code"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Myanmar."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fa07f8a2","guard":[["hasAny",["item number","nth","shortest","shortest one","shortest word","si"]],["has","country"],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Slovenia."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fa39c6e2","guard":[["hasAny",["cm","item number","nth","shortest","shortest one","shortest word"]],["has","code"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Cameroon."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fd2531c7","guard":[["hasAny",["item number","mc","nth","shortest","shortest one","shortest word"]],["has","tell"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Monaco."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fdbb2b77","guard":[["hasAny",["item number","mu","nth","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Mauritius."]},["transform.nthStr",["sense.words"],{"lit":4}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-90a66b7f","guard":[["hasAny",["ae","af","ao","au","bd","bh","bi","bj","bo","br","bw","ca","cg","co","cr","cu","dk","dm","dz","ee","fr","ga","gt","hr","ie","il","kh","ki","kn","kp","kr","kw","lc","li","lr","lu","mc","mg","mh","mm","mo","mr","mv","mz","nr","pe","pt","py","ru","rw","sa","sb","sc","se","si","sm","sr","sy","td","th","tl","to","tt","uy","va","ve","vu","zm","zw"]],["not",["has","name"]],["not",["has","which"]],["has","country"],["not",["has","circuit"]],["not",["has","habana"]],["not",["has","andorra"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of KR":"The country of KR is South Korea.","tell me the country of the code SB":"The country of SB is Solomon Islands.","give the country for AE":"The country of AE is United Arab Emirates.","what is the country of MW":"The country of MW is Malawi.","tell me the country of the code SO":"The country of SO is Somalia.","give the country for DM":"The country of DM is Dominica.","what is the country of CR":"The country of CR is Costa Rica.","give the country for PT":"The country of PT is Portugal.","what is the country of SC":"The country of SC is Seychelles.","give the country for CU":"The country of CU is Cuba.","what is the country of SI":"The country of SI is Slovenia.","what is the country of CO":"The country of CO is Colombia.","tell me the country of the code LC":"The country of LC is St. Lucia.","give the country for RU":"The country of RU is Russian Federation.","what is the country of BD":"The country of BD is Bangladesh.","tell me the country of the code EE":"The country of EE is Estonia.","tell me the country of the code SE":"The country of SE is Sweden.","give the country for GR":"The country of GR is Greece.","give the country for JP":"The country of JP is Japan.","give the country for PY":"The country of PY is Paraguay.","tell me the country of the code LU":"The country of LU is Luxembourg.","tell me the country of the code SA":"The country of SA is Saudi Arabia.","tell me the country of the code BR":"The country of BR is Brazil.","tell me the country of the code TZ":"The country of TZ is Tanzania.","tell me the country of the code US":"The country of US is United States.","give the country for GY":"The country of GY is Guyana.","give the country for DZ":"The country of DZ is Algeria.","what is the country of MO":"The country of MO is Macao (SAR China).","tell me the country of the code TT":"The country of TT is Trinidad and Tobago.","give the country for DK":"The country of DK is Denmark.","give the country for TO":"The country of TO is Tonga.","tell me the country of the code HR":"The country of HR is Croatia.","what is the country of LT":"The country of LT is Lithuania.","what is the country of KW":"The country of KW is Kuwait.","what is the country of BW":"The country of BW is Botswana.","what is the country of VU":"The country of VU is Vanuatu.","tell me the country of the code SN":"The country of SN is Senegal.","give the country for TM":"The country of TM is Turkmenistan.","tell me the country of the code NR":"The country of NR is Nauru.","what is the country of MG":"The country of MG is Madagascar.","tell me the country of the code ER":"The country of ER is Eritrea.","give the country for MV":"The country of MV is Maldives.","tell me the country of the code NE":"The country of NE is Niger.","tell me the country of the code LI":"The country of LI is Liechtenstein.","tell me the country of the code MM":"The country of MM is Myanmar.","tell me the country of the code PE":"The country of PE is Peru.","what is the country of SY":"The country of SY is Syria.","what is the country of LR":"The country of LR is Liberia.","give the country for LV":"The country of LV is Latvia.","tell me the country of the code MC":"The country of MC is Monaco.","give the country for ES":"The country of ES is Spain.","what is the country of AU":"The country of AU is Australia.","give the country for KN":"The country of KN is St. Kitts and Nevis.","what is the country of TH":"The country of TH is Thailand.","tell me the country of the code CG":"The country of CG is Congo (Rep.).","what is the country of TD":"The country of TD is Chad.","what is the country of SM":"The country of SM is San Marino.","tell me the country of the code SR":"The country of SR is Suriname.","what is the country of MZ":"The country of MZ is Mozambique.","give the country for KI":"The country of KI is Kiribati.","what is the country of MH":"The country of MH is Marshall Islands.","tell me the country of the code GT":"The country of GT is Guatemala.","what is the country of BI":"The country of BI is Burundi.","tell me the country of the code AO":"The country of AO is Angola.","give the country for ME":"The country of ME is Montenegro.","what is the country of UY":"The country of UY is Uruguay.","give the country for KH":"The country of KH is Cambodia.","what is the country of FR":"The country of FR is France.","give the country for AF":"The country of AF is Afghanistan.","what is the country of AD":"The country of AD is Andorra.","what is the country of GA":"The country of GA is Gabon.","tell me the country of the code NG":"The country of NG is Nigeria.","give the country for DE":"The country of DE is Germany.","what is the country of IE":"The country of IE is Ireland.","what is the country of VA":"The country of VA is Vatican City.","tell me the country of the code TG":"The country of TG is Togo.","give the country for VE":"The country of VE is Venezuela.","tell me the country of the code DO":"The country of DO is Dominican Republic.","give the country for CV":"The country of CV is Cape Verde Islands.","what is the country of IS":"The country of IS is Iceland.","what is the country of IN":"The country of IN is India.","tell me the country of the code RW":"The country of RW is Rwanda.","give the country for IQ":"The country of IQ is Iraq.","what is the country of MR":"The country of MR is Mauritania.","tell me the country of the code BH":"The country of BH is Bahrain.","give the country for SD":"The country of SD is Sudan.","what is the country of MU":"The country of MU is Mauritius.","give the country for LA":"The country of LA is Laos.","give the country for AM":"The country of AM is Armenia.","give the country for KP":"The country of KP is North Korea.","give the country for BO":"The country of BO is Bolivia.","tell me the country of the code CM":"The country of CM is Cameroon.","tell me the country of the code CA":"The country of CA is Canada.","give the country for TL":"The country of TL is Timor-Leste.","tell me the country of the code IL":"The country of IL is Israel.","give the country for SV":"The country of SV is El Salvador.","what is the country of BJ":"The country of BJ is Benin.","give the country for ZM":"The country of ZM is Zambia.","tell me the country of the code ZW":"The country of ZW is Zimbabwe.","what is the country of AZ":"The country of AZ is Azerbaijan."}}},
{"id":"n-028d87c5","guard":[["has","va"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of VA":"The country of VA is Vatican City."}}},
{"id":"n-0415b7ee","guard":[["has","gr"],["words<=",5]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for GR":"The country of GR is Greece."}}},
{"id":"n-08237c73","guard":[["has","bw"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of BW":"The country of BW is Botswana."}}},
{"id":"n-09d9db40","guard":[["has","kn"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for KN":"The country of KN is St. Kitts and Nevis."}}},
{"id":"n-09ec708b","guard":[["has","dk"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for DK":"The country of DK is Denmark."}}},
{"id":"n-0c60ad5c","guard":[["has","br"],["has","tell"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code BR":"The country of BR is Brazil."}}},
{"id":"n-0d4b510c","guard":[["has","de"],["words<=",5]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for DE":"The country of DE is Germany."}}},
{"id":"n-10b65f8c","guard":[["has","se"],["has","tell"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code SE":"The country of SE is Sweden."}}},
{"id":"n-111f23e1","guard":[["has","gy"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for GY":"The country of GY is Guyana."}}},
{"id":"n-18a95f0c","guard":[["has","kr"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of KR":"The country of KR is South Korea."}}},
{"id":"n-1f7b6015","guard":[["has","il"],["has","country"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code IL":"The country of IL is Israel."}}},
{"id":"n-1fc57c15","guard":[["has","pe"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code PE":"The country of PE is Peru."}}},
{"id":"n-20cf85fe","guard":[["has","cr"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of CR":"The country of CR is Costa Rica."}}},
{"id":"n-20ea337d","guard":[["has","jp"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for JP":"The country of JP is Japan."}}},
{"id":"n-21a24dde","guard":[["has","ru"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for RU":"The country of RU is Russian Federation."}}},
{"id":"n-2a28a7d3","guard":[["has","tt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code TT":"The country of TT is Trinidad and Tobago."}}},
{"id":"n-2b0ec847","guard":[["has","kh"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for KH":"The country of KH is Cambodia."}}},
{"id":"n-31f83942","guard":[["has","mu"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of MU":"The country of MU is Mauritius."}}},
{"id":"n-3254ca6e","guard":[["has","li"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code LI":"The country of LI is Liechtenstein."}}},
{"id":"n-37894208","guard":[["has","hr"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code HR":"The country of HR is Croatia."}}},
{"id":"n-3974e855","guard":[["has","bd"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of BD":"The country of BD is Bangladesh."}}},
{"id":"n-3d7be6f0","guard":[["has","az"],["has","what"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of AZ":"The country of AZ is Azerbaijan."}}},
{"id":"n-4607ec37","guard":[["has","mr"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of MR":"The country of MR is Mauritania."}}},
{"id":"n-514b3b82","guard":[["has","ng"],["words>=",8]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code NG":"The country of NG is Nigeria."}}},
{"id":"n-52073036","guard":[["has","th"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of TH":"The country of TH is Thailand."}}},
{"id":"n-5239508e","guard":[["has","ve"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for VE":"The country of VE is Venezuela."}}},
{"id":"n-595241f7","guard":[["has","py"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for PY":"The country of PY is Paraguay."}}},
{"id":"n-5a161d48","guard":[["has","cm"],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code CM":"The country of CM is Cameroon."}}},
{"id":"n-5a162fb9","guard":[["has","pt"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for PT":"The country of PT is Portugal."}}},
{"id":"n-5b884878","guard":[["has","af"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for AF":"The country of AF is Afghanistan."}}},
{"id":"n-5be2469e","guard":[["has","tm"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for TM":"The country of TM is Turkmenistan."}}},
{"id":"n-5e75207a","guard":[["has","sa"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code SA":"The country of SA is Saudi Arabia."}}},
{"id":"n-5fb33523","guard":[["has","sb"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code SB":"The country of SB is Solomon Islands."}}},
{"id":"n-6c924f9f","guard":[["has","mv"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for MV":"The country of MV is Maldives."}}},
{"id":"n-6d77879e","guard":[["has","mw"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of MW":"The country of MW is Malawi."}}},
{"id":"n-7059bbbc","guard":[["has","er"],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code ER":"The country of ER is Eritrea."}}},
{"id":"n-7108de09","guard":[["has","kw"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of KW":"The country of KW is Kuwait."}}},
{"id":"n-760ce5da","guard":[["has","lv"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for LV":"The country of LV is Latvia."}}},
{"id":"n-768a14e0","guard":[["has","mm"],["has","tell"],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code MM":"The country of MM is Myanmar."}}},
{"id":"n-794d3c5b","guard":[["has","ad"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of AD":"The country of AD is Andorra."}}},
{"id":"n-7b622dd1","guard":[["has","lr"],["words<=",6]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of LR":"The country of LR is Liberia."}}},
{"id":"n-7dbbfac6","guard":[["has","au"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of AU":"The country of AU is Australia."}}},
{"id":"n-8403fc74","guard":[["has","sn"],["has","tell"],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code SN":"The country of SN is Senegal."}}},
{"id":"n-8543921a","guard":[["has","fr"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of FR":"The country of FR is France."}}},
{"id":"n-866489b3","guard":[["has","ki"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for KI":"The country of KI is Kiribati."}}},
{"id":"n-87fb7da8","guard":[["has","mo"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of MO":"The country of MO is Macao (SAR China)."}}},
{"id":"n-8b0e2945","guard":[["has","td"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of TD":"The country of TD is Chad."}}},
{"id":"n-91887b4a","guard":[["has","si"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of SI":"The country of SI is Slovenia."}}},
{"id":"n-9338d972","guard":[["has","kp"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for KP":"The country of KP is North Korea."}}},
{"id":"n-969724ae","guard":[["has","mg"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of MG":"The country of MG is Madagascar."}}},
{"id":"n-981fcbfb","guard":[["has","mh"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of MH":"The country of MH is Marshall Islands."}}},
{"id":"n-98225246","guard":[["has","lc"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code LC":"The country of LC is St. Lucia."}}},
{"id":"n-98b8d3d9","guard":[["has","zm"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for ZM":"The country of ZM is Zambia."}}},
{"id":"n-a0b15e68","guard":[["has","tz"],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code TZ":"The country of TZ is Tanzania."}}},
{"id":"n-a0f8cf40","guard":[["has","dm"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for DM":"The country of DM is Dominica."}}},
{"id":"n-a2404367","guard":[["has","sv"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for SV":"The country of SV is El Salvador."}}},
{"id":"n-adb5a057","guard":[["has","vu"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of VU":"The country of VU is Vanuatu."}}},
{"id":"n-af089c5d","guard":[["has","ee"],["has","tell"],["has","country"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code EE":"The country of EE is Estonia."}}},
{"id":"n-b401ad3a","guard":[["has","bh"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code BH":"The country of BH is Bahrain."}}},
{"id":"n-b44e6af8","guard":[["has","sc"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of SC":"The country of SC is Seychelles."}}},
{"id":"n-b4d5a3cf","guard":[["has","sr"],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code SR":"The country of SR is Suriname."}}},
{"id":"n-b5951c1b","guard":[["has","ie"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of IE":"The country of IE is Ireland."}}},
{"id":"n-b8ac6395","guard":[["has","tl"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for TL":"The country of TL is Timor-Leste."}}},
{"id":"n-b93de984","guard":[["has","zw"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code ZW":"The country of ZW is Zimbabwe."}}},
{"id":"n-b9d5b5af","guard":[["has","bj"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of BJ":"The country of BJ is Benin."}}},
{"id":"n-c1e24c7c","guard":[["has","es"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for ES":"The country of ES is Spain."}}},
{"id":"n-c2a59046","guard":[["has","cv"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for CV":"The country of CV is Cape Verde Islands."}}},
{"id":"n-c3876a70","guard":[["has","sm"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of SM":"The country of SM is San Marino."}}},
{"id":"n-c541af8f","guard":[["has","lt"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of LT":"The country of LT is Lithuania."}}},
{"id":"n-c55b5a54","guard":[["has","gt"],["has","tell"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code GT":"The country of GT is Guatemala."}}},
{"id":"n-c632b21f","guard":[["has","dz"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for DZ":"The country of DZ is Algeria."}}},
{"id":"n-c8f28614","guard":[["has","rw"],["has","tell"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code RW":"The country of RW is Rwanda."}}},
{"id":"n-cdf7f40c","guard":[["has","sy"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of SY":"The country of SY is Syria."}}},
{"id":"n-cfd4d357","guard":[["has","co"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of CO":"The country of CO is Colombia."}}},
{"id":"n-d3808334","guard":[["has","cu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for CU":"The country of CU is Cuba."}}},
{"id":"n-d3b90650","guard":[["has","nr"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code NR":"The country of NR is Nauru."}}},
{"id":"n-d8b6cef5","guard":[["has","mz"],["has","what"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of MZ":"The country of MZ is Mozambique."}}},
{"id":"n-e119a738","guard":[["has","ae"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for AE":"The country of AE is United Arab Emirates."}}},
{"id":"n-e1a46af1","guard":[["has","ca"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code CA":"The country of CA is Canada."}}},
{"id":"n-e34056e7","guard":[["has","tg"],["has","code"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code TG":"The country of TG is Togo."}}},
{"id":"n-e53704b8","guard":[["has","ne"],["has","tell"],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code NE":"The country of NE is Niger."}}},
{"id":"n-e75c022d","guard":[["has","cg"],["words>=",8]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code CG":"The country of CG is Congo (Rep.)."}}},
{"id":"n-ea112440","guard":[["has","ga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of GA":"The country of GA is Gabon."}}},
{"id":"n-ea49927e","guard":[["has","la"],["words<=",5]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for LA":"The country of LA is Laos."}}},
{"id":"n-ea6b8407","guard":[["has","bi"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of BI":"The country of BI is Burundi."}}},
{"id":"n-ebb8a379","guard":[["has","uy"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of UY":"The country of UY is Uruguay."}}},
{"id":"n-ef5cb1a0","guard":[["has","mc"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code MC":"The country of MC is Monaco."}}},
{"id":"n-f4f1876b","guard":[["has","bo"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for BO":"The country of BO is Bolivia."}}},
{"id":"n-fa5e6393","guard":[["has","iq"],["words<=",5]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for IQ":"The country of IQ is Iraq."}}},
{"id":"n-fa851967","guard":[["has","sd"],["words<=",5]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for SD":"The country of SD is Sudan."}}},
{"id":"n-fe404a73","guard":[["has","lu"],["not",["has","name"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code LU":"The country of LU is Luxembourg."}}},
{"id":"n-ff230fbc","guard":[["has","ao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the code AO":"The country of AO is Angola."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the country of KR","expect":{"contains":["South Korea"],"notRefusal":true}},{"q":"tell me the country of the code SB","expect":{"contains":["Solomon Islands"],"notRefusal":true}},{"q":"give the country for AE","expect":{"contains":["United Arab Emirates"],"notRefusal":true}},{"q":"what is the country of MW","expect":{"contains":["Malawi"],"notRefusal":true}},{"q":"tell me the country of the code SO","expect":{"contains":["Somalia"],"notRefusal":true}},{"q":"give the country for DM","expect":{"contains":["Dominica"],"notRefusal":true}},{"q":"what is the country of CR","expect":{"contains":["Costa Rica"],"notRefusal":true}},{"q":"give the country for PT","expect":{"contains":["Portugal"],"notRefusal":true}},{"q":"what is the country of SC","expect":{"contains":["Seychelles"],"notRefusal":true}},{"q":"give the country for CU","expect":{"contains":["Cuba"],"notRefusal":true}},{"q":"what is the country of SI","expect":{"contains":["Slovenia"],"notRefusal":true}},{"q":"what is the country of CO","expect":{"contains":["Colombia"],"notRefusal":true}},{"q":"tell me the country of the code LC","expect":{"contains":["St. Lucia"],"notRefusal":true}},{"q":"give the country for RU","expect":{"contains":["Russian Federation"],"notRefusal":true}},{"q":"what is the country of BD","expect":{"contains":["Bangladesh"],"notRefusal":true}},{"q":"tell me the country of the code EE","expect":{"contains":["Estonia"],"notRefusal":true}},{"q":"tell me the country of the code SE","expect":{"contains":["Sweden"],"notRefusal":true}},{"q":"give the country for GR","expect":{"contains":["Greece"],"notRefusal":true}},{"q":"give the country for JP","expect":{"contains":["Japan"],"notRefusal":true}},{"q":"give the country for PY","expect":{"contains":["Paraguay"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
