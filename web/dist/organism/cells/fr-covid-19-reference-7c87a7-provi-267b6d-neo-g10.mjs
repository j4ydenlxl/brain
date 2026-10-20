// fr-covid-19-reference-7c87a7-provi-267b6d-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"fr-covid-19-reference-7c87a7-provi-267b6d-neo-g10","class":"fr-covid-19-reference-7c87a7-provi-267b6d","generation":10,"lane":"neo","grownFrom":["what is the combined key of Montserrat","tell me the combined key of Rivne Oblast","name the combined key of Guam","what is the combined key of Blekinge","tell me the combined key of Iwate","name the combined key of Tlaxcala","what is the combined key of Halland","tell me the combined key of Vastra Gotaland","name the combined key of Guanajuato","what is the combined key of Prince Edward Island","tell me the combined key of Samara Oblast","name the combined key of Parana","what is the combined key of Zuid-Holland","tell me the combined key of Bucuresti","name the combined key of Kyoto","what is the combined key of Choco","tell me the combined key of Espirito Santo","name the combined key of Brasov","what is the combined key of Bratislava","tell me the combined key of Newfoundland and Labrador"],"version":1});

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
knowLoad([{"id":"crypto-tickers","columns":["crypto ticker"],"n":11071,"cols":[{"f":"0A2A|14|2M|151|2T|1A|2A|2B|3L|2C|2G|2PX|2RT|2ST|2T|2VE|2Z|1BA|2BC|2C|3C|3D|2EL|3Y|2IC|2J|2L|2O|3ND|2R|2T|2X|2Y|3SS|1C|23|2A|3T|4O|2CEL|3N|2D|3C|2E|3N|3S|3T|4H|2H|3C|2ID|2K|2M|2N|2OIN|2P|3T|2Q|2RE|3IA|2S|2T|3A|3IN|3N|2U|2X|3T|2YC|1D|2A|3B|3I|3O|3PAD|3T|3X|2B|2C|3O|2D|3AMS|3Y|2EL|2F|2H|2I|2K|2L|2M|2N|3T|2O|3GE|3N|2P|2R|3X|2S|2T|2UX|2VT|2X|3X|2Z|1E|2C|2G|3GS|3IS|2LIN|2N|3S|3T|2ON|2R|3GO|3M|3O|2S|2T|3H|4C|2UR|2VO|3UM|1FB|2C|3T|2EN|2FC|2G|2IN|3T|2K|2NTY|2O|2P|2RO|4X|2TT|2X|2YON|1G|28|2A|3TA|2B|2ET|3UR|2F|2I|3V1|3X|2LA|3D|2M|2N|2O|3N|3V|2PC|2RO|3S|2S|2T|2V|3C|3E|2X|1HOO|2T|1I|2AI|3T|2B|3B|3K|2C|3O|4DE|4RE|2D|3I|3OC|4G|5E|3T|3US|2E|3N|2G|2I|2LINK|2M|3BOT|3EE|3S|3X|2N|3N|3U|2ON|4E|3T|3Z|2PAD|3E|4PE|3G|3IN|2R|3E|3I|3T|3X|2S|3HIB|2T|3ECH|4K|3K|3N|3RA|3T|2US|2X|1JNA|1K12|2A|2I|3TA|5X|2N|3C|2RO|2T|3IO|1LA|2BEDO|3T|2C|3E|3H|4E|3X|2D|3IN|2EPH|3X|2F|2G|3B|3O|2H|2I|3AS|3C|4E|3EN|3F|3NK|3S|3T|4A|3X|2KI|2LBI|3EY|3IN|2M|3E|2N|2OHA|3T|2P|3A|4CA|3H|4A|5C|4R|3INE|3S|2T|3A|3B|3COM|3D|3MAN|2U|3SD|3X|2V|3A|2WAYS|2X|2Y|1M|2A|3L|3PT|3TEN|2B|3ER|3T|2DC|3G|2E|2F|2G|2IO|3S|2KT|2LT|2M|3O|2N|2O|3GUS|3N|3S|2P|3L|2S|2T|2U|2V|2X|2Y|2ZE|1NA|3L|4OS|2B|2C|3P|3T|2D|3C|3X|3Y|2GEL|3L|4E|3O|2I|3M|4A|2J|3I|2K|3R|2ML|2N|2ON|2RX|2S|3R|2T|3C|3E|4X|3I|4S|3S|2US|2V|2W|2Y|1OG|2K|2P|2S|1P|2AD|2C|3G|2E|3D|3X|2FC|2H|2I|33|3NG|3S|3X|2L|2M|2N|2OD|3LLO|2P|3C|3LE|2RIL|3S|2S|2T|3OGE|2U|2W|2X|3P|3T|2Y|3S|2Z|1QT|3IS|2U|3A|4C|4P|4RI|1R|2A|3TA|3W|2B|3I|4T|3S|3T|3UZ|2C|3A|4DE|4NE|4S|3H|4A|4L|3O|4NA|3T|3X|2DR|3X|2E|3A|3N|4A|3PA|3S|2G|3O|4N|3US|2I|310|3A|420|3X|2K|3EN|4R|3I|3M|3N|2M|3A|3OR|3R|3S|2NA|3M|3O|3X|4M|2O|3N|3R|2PA|4C|2Q|2R|3O|3R|2SL|2T|3C|3E|4M|4ON|4Q|4X|3F|3G|3H|3I|4I|3L|3M|3P|3R|3T|3Y|2V|2W|2X|2Y|1S|2A|3FE2|3N|3P|2C|2D|3EX|2EED|2G|3C|2H|2IA|3MI|2K|3O|2M|2N|3T|2P|3C|3O|2QT|2R|2S|3A|4RA|3T|2T|3A|3O|4N|3R|4A|5L|4O|5C|3X|2UNA|2VA|2W|2Y|1T|2A|2B|2C|3C|2D|2ECH|3M|2F|3I|3S|2H|3E|2ID|2K|3N|2L|3AS|3X|2M|3A|3C|3I|3OS|2N|3T|2OLO|3M|3N|3R|3Z|2P|3AY|2R|3I|3NO|2S|2T|3R|2X|1U|2A|2C|3O|2DC|3F|3IO|3T|3X|2K|2N|3IT|2PC|2R|3A|3O|4RA|4S|3S|3UM|3Y|2SCM|3D|4C|2T|3O|4N|3UMN|1V|2A|3I|3L|4ON|3O|3T|4AR|4LY|3V|3X|2DO|2E|2G|2H|2I|3NOC|3VE|2L|2ME|2N|2O|2R|2S|2T|3M|2XL|3T|1WAX|2C|2M|2NEX|2O|3RK|2R|2S|2T|2X|1X|2C|2E|3L|2GT|2IAL|4V3|3OM|3S|4T|2L|3INU|2N|3T|2PR|2R|2S|3V1|2T|2YS|1YA|1Z|2A|3RT|2BI|2ERO|2IT|2R|2U|3KI|3M|2Y|0B1P|120|21|26|2G|2M|2X|13|191|1A|2AS|2BI|3L|3Y|4FB|4TK|4X|2C|3K|3OIN|4N|2D|3GER|2FC|2G|3S|2I|2JU|2K|3AC|3E|4D|3T|2L|3A|3D|3IN|3LZ|3PHA|3TO|2M|3A|3BOO|2N|3ANA|3C|4A|3D|4EX|3G|3K|3NER|3US|2O|3E|3S|2R|3A|3C|3K|3T|2S|3E|4AI|4D|3H|4C|4OS|3IC|4D|4S|3K|3T|2T|3H|3S|2X|3S|2Y|2ZED|1B|21|2ANK|2B|2C|3C|3G|3T|2DC|3T|2F|3T|2G|3C|2I|2K|2L|2N|2O|3S|2P|2R|2S|2T|3C|3F|1C|2A|3C|3P|3T|3U|2B|2COIN|2D|3N|3T|2EO|2F|2G|2H|3A|3C|3T|2I|3O|3TY|2L|2MC|41|2N|3A|3T|3X|2O|3IN|3Q|2P|3T|2R|3O|2S|2T|2UBE|3G|2V|3B|2X|2Y|2ZERO|1D|2AY|2B|2C|3C|2G|2ID|2L|2OG|3T|2P|3I|2R|2X|2Y|1EA|3CH|3I|3M|4MW|3N|4S|3ST|3T|2BE|2C|3H|3O|2D|2E|3P|3R|3T|4LE|4S|2FE|3I|3TM|3X|3Y|2G|2L|3A|3R|3T|2M|3D|2N|3D|4OG|3G|3JI|3T|3V1|3X|3ZI|2P|3E|3R|4O|2RN|3RY|2S|3A|3T|4C|2TA|3BOX|3F|3H|4ER|3R|3S|3T|3U|2X|2Y|3OND|2Z|3OGE|1F|2C|3H|2DT|2EX|2G|2HT|2I|3C|2LOKI|3Y|2T|3C|2X|1GB|3P|2C|2G|2LD|2ONE|2PT|2S|2VT|1HAO|3T|3X|2BD|2C|2IG|3RE|3VE|2O|2P|3C|1IAO|2B|3I|3L|3O|2C|3O|3S|2D|3AO|3COM|3EN|3I|3P|3R|3Z|2FI|4F|2G|3HAN|3SB|3UP|2H|3U|2IS|2KI|2LL|2M|2ND|3EM|3GO|3O|3S|3TEX|3U|2O|3B|3C|3FI|3P|3S|3T|2P|3C|3X|2R|3B|3D|2S|3KIT|3T|2T|316|3AIR|3B|3C|4AR|5T|4CA|4I|4M|4NY|3F|3G|3HER|3L|3M|3N|4EW|3O|4K|4RB|3RA|4UE|3S|4D|4Z|3T|4O|3USD|3X|3Z|2UT|2VE|2X|3B|3I|2ZA|3Z|1J|2K|1KBT|2C|2ING|2K|2N|2PT|2R|3W|2S|2T|2X|1LA|3CK|3DE|3NK|3S|4T|3ZE|5X|4R|2C|3T|2D|2ENDR|3RF|3S|2F|2HC|2I|3D|3N|4K|4U|3TZ|5P|2K|3C|3D|3S|2N|3M|2OB|3C|4K|5N|5S|4M|4X|3K|3ODY|4MT|3X|2P|2RY|2S|3T|2T|3C|3G|3V|2U|3E|4M|4S|3I|3R|4T|3T|2V|33|2WA|2X|3M|2Y|2Z|3D|3E|1M|2AGA|3RS|2BO|2C|2DA|2E|3X|2F|2G|2H|2I|3C|2K|2ON|2P|2T|2W|2X|3T|3X|1NA|3NA|2B|3CAT|4H|3DOG|3H|3P|3TC|3X|2C|2D|2F|2IX|2K|2N|2P|3L|2R|3TX|2S|3D|3OLD|3X|2T|3E|3N|3Y|2U|2X|1OA|3I|3RD|3T|2BA|4I|3C|3O|3S|3T|2C|2DA|4V2|3EN|3HI|3O|3YP|2E|2G|3EY|2JAK|3I|2K|3I|3U|2LD|3I|3T|4T|2MB|4C|4M|3E|42|4OW|4S|3K|2N|3A|3D|4LY|3E|4S|3IX|3K|4H|3O|3TE|3US|2O|3B|3FI|3K|3M|3NS|3P|3ST|5O|3T|2R|3A|3ED|3G|3ING|3K|3UTO|2S|3E|3ON|5C|3S|3T|3U|2T|3C|3S|3TO|3X|2U|3NCE|3TS|2W|3E|2X|3ETH|3T|3X|3Y|2YS|2ZO|1P|2AD|3Y|2D|2EPEF|3T|2INKY|2L|3C|2N|2RIVA|3O|2S|2T|3C|2X|1Q|2C|2QQ|2T|3X|1R|234P|2ACE|3IN|3NA|4D|3T|4T|3Z|2C|3P|3T|2D|3D|3G|2EE|4D|3PE|3TT|5A|3W|2G|3E|3X|2I|3A|3C|4K|5S|3DGE|3GHT|3K|3SE|3T|4TO|3UM|3X|2K|3L|2MV|2N|3K|3X|2O|3CK|3GG|3NZ|2RR|2T|3R|3X|2UNE|3SH|3V|2WL|2X|2Y|3LL|2Z|3E|3N|1S|2AFE|4U|2B|2C|3H|3M|3PAD|5Y|3S|3V|2E|3ND|2FM|2G|3G|3S|2HARE|3IB|2I|2KT|2L|2OL|3V|2P|3M|3T|2R|2SB|2T|3AR|3C|3K|3N|3S|3Y|2V|2W|3AP|2X|2Y|3S|1T|21|22|2A|3D|3F|3MA|2B|3L|3S|2C|32|3A|4S|4T|3B|4R|3C|3D|3E|4X|3F|3GO|3H|4D|3INU|4X|3K|3L|3M|4T|3N|3P|4AY|4X|3R|4ED|4Y|3S|4T|3T|3US|3V|4B|3Z|2D|3X|2E|3X|2F|3A|2G|2H|2K|2L|3C|2M|3G|3I|3K|2NT|4V2|3YX|2O|3P|2P|3L|2Q|2R|3FLY|3L|3M|3N|3S|4T|2S|3C|3E|3G|2T|3F|3OLD|3R|3Y|2U|2V|2W|2X|3C|2Y|3C|2Z|3C|3N|1U|2B|3O|3U|2C|3K|4S|2D|3DHA|3G|2FF|4ET|2GG|3S|2ILD|2K|2LL|4C|4S|5H|2MN|3P|2N|3DL|3I|3NY|2RGER|3N|4NY|4S|4Z|3P|3RRD|2SD|4C|3Y|2T|2X|2Y|3I|2ZZ|1V3A|2C|2M|2ND|2O|2T|1WB|2F|2J|2K|2N|2O|2S|2T|32|2X|1X|2A|2BT|2C|2F|2H|2K|2MI|2R|2T|3B|2X|2Y|1YC|2G|2TE|4S|3HER|3S|3Z|1Z|2ENIQ|2KY|2L|2NT|2R|3X|2X|2Z|3ONE|0C2|20|25|2H6|2X|13|198|1A|2AVE|2B|3O|3S|2CH|4E|3TUS|2DC|3INU|3N|3X|2F|2G|3A|2H|2I|3D|3R|3Z|2KE|4W|2L|3C|3I|3L|3O|2M|3C|3EL|3LY|3P|2N|3CER|3D|4Y|3N|3TI|4O|3YA|2PD|3O|3P|3S|3T|3V|3Y|2R|3AT|3BO|5N|3D|4S|3E|4S|3O|3PE|3R|4OT|3T|2S|3H|4T|3INU|4O|3PER|3T|4LE|2T|3AI|3BOY|3C|4EO|4H|3E|3HAT|3MAN|3O|3PAY|3S|3T|3WIF|3X|3Z|2U|2VA|4DA|3E|3O|2W|3CEO|1B|2ABY|3NK|3T|2C|2D|3C|3G|2E|3T|4H|2FT|2G|2IXP|2K|2M|2NT|2OT|2P|2RL|3T|2S|3L|3N|2T|2U|3CKS|3K|2X|2Y|1C|210|2A|3KE|3R|3SH|2C|3X|2D|2E|2GDS|2H|3G|2I|3N|2L|2N|2O|3IN|3MM|4P|3S|2P|2RB|2T|3N|2V2|2X|3C|3X|1DAI|2EX|2L|2N|2OGE|2PT|2RX|2T|2X|2Y|1EDEX|2EK|2FS|2JI|2L|3EB|3L|3O|3R|3T|2M|2N|3NZ|3T|4RA|3X|2RE|4S|2SC|2T|3H|3I|3US|2UR|2X|1F|2C|2D|2F|2G|2I|2L365|3ASH|3O|2T|3Y|2X|3Q|3T|1GA|2G|2L|3D|2O|2PT|2S|2T|2U|1HA|3D|4S|3IN|3L|3MP|5Z|3N|4CE|4GE|3O|3PZ|3RM|4S|4T|3SH|3T|2B|3R|2C|2D|2ECK|5R|3DDA|3EL|4MS|4SE|3Q|3R|4RY|3SS|3X|2FN|3T|3U|3X|2H|2I|3CA|4KS|3EF|3HUA|3I|3LD|4I|4L|3NU|3P|4S|3RP|2K|3N|2LT|2MB|3PZ|2N|3G|2O|3KE|3NK|5Y|3OF|3PPY|3W|3Y|2P|2R|3P|2S|3B|2T|2UB|3CHU|4K|2VF|2W|2X|2Y|2Z|1IC|2F|2M|2N|3D|3NI|3U|3X|2OTX|2PHC|2R|3C|4LE|4US|3US|2TI|3Y|2V|3IT|2X|3100|1J|2C|2R|2T|1KB|3TC|2C|2EK|3TH|2P|2T|2USD|1L|2A|3M|3SS|3Y|2B|3R|2CT|2D|3X|2EAR|3G|3O|3V|2FI|2H|2ICK|3FF|3MB|3N|4K|4T|3PS|3Q|3ST|2M|3RS|2N|3Y|2O|3AK|3RE|3UD|4T|2PX|2R|3TY|2S|2T|2U|3B|3D|2V|3A|3X|2X|2Y|1MA|2C|3C|3T|3X|2DX|2ERGE|2FI|2IT|2K|3R|2L|2M|2N|2OS|2P|3CO|2Q|2S|3N|2T|3C|2Z|1NAB|3ME|2B|3C|2C|3L|3T|2D|3L|2ETA|2F|3I|2G|2HT|2L|2MT|2N|3S|2O|2RG|2S|2T|3M|3R|2US|2X|2YD|3T|3X|1O|22|2AL|2B|3E|2C|3K|3O|2DAI|3EG|4O|4X|3I|3Y|2E|2FI|4X|2G|3E|4N|3I|3S|2I|3NBT|4G|4SL|4YE|2KE|2L|3A|3L|4AR|4E|4G|3R|3T|3X|2M|3B|4O|3E|3FI|3M|3P|4D|3T|2NE|3G|3I|3J|3K|3S|3V|3X|2OHA|3K|3L|3P|2PE|3I|4UM|3S|2Q|2R|3AL|3E|4G|4UM|3GI|5B|3N|3X|2S|3HI|3M|4IC|3P|3S|3T|3X|2T|3I|2U|3NOS|3P|2V|3A|4L|3ER|4X|3IR|3N|2W|3RIE|2X|2Y|2ZP|1P|2AD|3N|3Y|2C|3OIN|2D|2ET|3X|2H|2I|3GGY|2L|3O|2N|2O|3O|4L|3S|2R|3OP|3X|2S|2T|2U|2X|2Y|1QST|2T|1R|28|2A|3B|3CER|4K|3DLE|3FT|3IG|3MER|3VE|2B|3N|2C|2D|3C|3N|4C|3S|3T|4S|2E|38|3A|4L|4M|3D|4I|5T|4O|3ED|3MAT|3O|3P|4E|3S|3V|4A|2F|3I|2GO|2H|3T|2I3X|3ME|2L|2M|3S|2NCHY|3K|2O|3AT|3B|3CO|3GE|3ID|3N|4A|4K|3WD|4N|3X|2P|3S|3T|2S|3P|2T|3B|3M|3S|2U|3X|2V|3USD|3Y|2W|3D|3NY|2X|2YN|3P|4T|3STL|1S|2AC|3I|2C|2EN|2H|2IX|2M|3IC|2NO|3P|2OV|2P|3N|3R|2Q|2R|2S|2TC|3L|3R|2USHI|2WAP|2X|1T|2AG|3SK|2C|3N|2E|2F|2G|2I|3C|2K|3N|2L|3S|3X|2N|2O|2P|3L|3T|2R|3T|2S|3I|2T|2W|2X|3C|2Y|1UAN|2BE|4B|2CK|2DOS|2E|3X|2LO|3T|2MINU|2NI|2RA|3E|3I|4O|3RY|2SD|4C|4T|3T|2T|3E|2Z|1V|2A|3G|3ULT|2C|3C|3OIN|2G|2IP|2NC|3G|3T|2P|3T|2R|2S|3HOT|2T|3C|3X|2X|3CRV|3FXS|1W|2AR|2BTC|2D|2EB|3X|2IF|3S|2N|2R|2S|2T|2V|2X|3T|1X|2A|2C|3ELL|2G|2O|2P|3AD|2T|1YBA|3ER|5C|5D|3ONK|3R|2C|3E|3LE|4UB|3ON|2DER|2FI|2G|2L|2MT|2OP|2P|2RS|3US|2S|2T|1ZC|2F|2GOAT|2OL|2R|3X|2USD|2Z|0D11|12O|2T|13D|14RK|1AB|2C|3ASH|4T|3C|42|3H|3KIE|3S|3XI|2D|3A|3I|2F|3I|3T|2G|3O|3T|2I|3LY|5S|3MO|3N|3Q|3SY|2L|3I|2M|3EX|3O|2N|3A|3K|2O|31|3ACT|3B|3P|3SOL|3VC|3X|2PP|4SY|4T|4X|3S|2R|3A|3B|3C|3E|3ICO|4K|3K|4EN|3T|3X|2S|3C|3H|4D|4G|2T|3A|3P|3X|2V|3E|3IS|3P|2W|3G|4S|3N|2X|3X|2Y|3TA|1B|2A|2C|2D|2EAR|3T|2I|3C|3X|2L|2OE|3X|2R|2TC|3N|2UND|3Y|2X|2Y|2Z|1C|2A|3R|4D|3SH|3U|2B|2C|3T|2HF|2IP|2K|2LOUD|2N|3T|4R|2OIN|2R|3E|3N|2S|2T|3O|2X|2Y|1D|2AM|3O|2D|3D|2F|2IM|2K|2L|2N|2OS|2R|3ST|3T|2S|2X|1EA|3I|3L|2B|3ASE|3T|2C|3HAT|3I|3L|3ODE|2DE|2ED|3M|3P|4G|3R|3X|3Z|2FC|3I|45|4DO|4L|4T|3LA|4CT|4Y|3T|3X|3Y|2G|3A|3EN|5R|3O|4V|51|2HUB|2I|2K|2L|3FI|3OT|3TA|5C|2M|3IR|3OS|2NT|2OD|3R|2P|3O|3TH|2Q|2RC|3I|3O|3P|2S|3I|3O|3U|2TF|3H|2UR|3S|2V|3O|3T|3VE|3X|2X|3A|3E|3G|3IO|3M|3NET|3O|3T|4F|4V1|1F|2A|2B|3T|2C|2D|2G|3L|2H|2I|3AT|3O|3S|2L|2ND|4R|2P|2SG|2T|2X|2Y|3N|1G|2B|2C|3L|2D|3C|2H|2I|2LD|3N|2M|3E|3S|3T|3V|2N|3X|2OLD|3RE|2P|3T|2TX|2VC|2X|1HLT|2N|2P|2R|2S|2T|2V|2X|1IA|3BLO|3M|4ND|2BBLE|2C|3E|4M|2D|2E|3M|3SEL|2FI|3X|2G|3EX|3G|3I|4C|4F|3S|2KO|2LI|2M|3E|3O|2N|3ERO|3GER|4O|3O|3U|3W|2O|3NE|2P|3A|2S|3K|2T|2VA|3ER|3I|3O|3X|2W|2YAR|1JED|1K|2A|2C|2D|2EY|2KT|2S|2UMA|1LA|3NCE|2C|2ISK|2LR|2O|2PD|3T|2R|2T|3A|2X|3V|2Y|3COP|1MA|3IL|2C|3C|3H|2D|2G|2IND|2L|3G|2OD|3ON|2S|2T|3C|3R|2X|1N8|2A|2ET|2F|3LX|3T|2N|2O|3DE|3TES|2S|2T|3X|2VDA|2X|3C|2Y|1OBBY|3O|2C|3C|3K|3T|2D|3100|3I|3O|2E|2FI|2G|3A|4I|4LD|3B|3C|3E|420|4C|5O|4D|4GF|4P|4RA|4S|4TH|4X|4Y|3GY|3IRA|3MI|3O|3PAD|3RMY|3S|3Y|3Z|2JO|2KI|2LA|3LUR|3Z|2M|3E|3I|2N|3A|4LD|3G|3K|3S|3U|4T|2OH|3R|2PE|2R|3A|3K|4L|2S|3E|3HIB|2T|3C|3R|2UGH|2V|3I|2WS|1P|2AD|3Y|2DBC|2ET|3X|2I|3E|2LTR|2N|2P|2R|2S|2T|2X|2Y|1QQQ|1RA|3C|4E|4O|5O|3FTC|3GON|4Y|3M|3W|2B|2C|3T|2E|3AM|5S|3P|2F|2G|3N|2IFT|3NK|3P|3V|2KC|3T|2M|38|2OGGY|3NE|3P|4S|2P|3U|2S|2T|2XNE|2Z|1S|2B|2C|3P|3VR|2D|2FR|2G|2H|3ARE|3IB|2K|2LA|2R|3UN|2T|3R|2UN|2YNC|1T|21|2A|2B|2C|3T|2EM|3P|2G|2H|2N|2O|3P|3RO|2R|3C|2SLA|2X|1UA|3L|2B|3BZ|3I|2C|3ATO|3K|4D|4ER|2DE|2EL|3T|2G|3E|2KE|3O|2MMY|2N|3G|2O|3T|2SD|3K|3T|2X|2ZCE|1V|2C|2DX|2F|2G|2I|2P|3N|2RS|2S|2T|3C|2X|1WARS|2C|2EB|2T|2Z|1X|2A|2B|2C|3T|2D|2F|2G|3M|2H|2L|2N|2O|2R|2S|2T|1YC|2DX|2M|2N|3A|3EX|3MT|3O|2P|2ST|2T|1ZAR|2CC|2DD|2G|2I|2OO|0E21|2C|18|1A|2C|2G|3LE|3S|2I|2RN|3TH|2SYF|2T|2URIC|1B3|2A|3SE|2C|2EN|3T|2IT|2K|2OX|2S|3C|3T|2T|3C|2YT|2Z|1C|2A|3SH|2C|2D|2ELL|2G|2H|3O|3T|2LD|3IP|2O|3B|3C|4H|3FI|3IN|3M|3X|2P|2R|2S|2T|3E|2U|1DAT|2C|2DA|3IE|2E|3L|3N|3XA|2FI|2G|3E|4W|3T|2I|2LC|2N|3S|2OGE|2R|3C|2T|2U|3C|3M|3X|2X|1ER|2TH|1FBAI|2C|2FT|2I|3L|2K|2L|2X|1G|2AME|3S|3Z|2C|3C|2DC|2EM|2G|3C|3MAN|3P|3Y|2I|2LD|2O|3LD|2R|3N|2S|2T|2X|1HASH|2IVE|2RT|1IFI|2M|1JAC|2S|1KG|2N|2O|2S|2T|3A|1L|2A|3C|3D|3MA|3ND|2C|3ASH|2D|3A|2E|3C|3N|3S|3T|2F|3I|2G|2I|3C|3TE|3X|4IR|2K|2LA|3I|2M|3O|4N|3T|2ON|4GD|5T|2P|2S|2T|3C2|2U|2V|3N|2X|2Y|1M|2AID|3R|3X|2B|3ER|3R|2C|32|2D|2IGR|2L|2OJI|3N|3T|4I|2P|3C|3H|3IRE|3R|2RX|2T|2U|2V|2X|1NA|2C|3D|3N|3S|3X|2DCEX|2E|3DEX|2G|3T|2IGMA|2J|2K|2NO|2O|2Q|3AI|2RG|3X|2S|2T|3C|3ER|3R|4C|4P|4Y|3T|2U|2V|3ION|2X|1OC|2N|3C|2S|3C|3DAC|4T|3T|2TH|2X|1PAN|4US|2ETS|2IC|3K|4O|3X|2K|2S|2TT|2X|2Y|1Q|2C|2L|2M|2O|2PAY|2T|2U|3AD|4L|3I|4L|2X|2Z|1RA|37|2B|2C|320|2D|2E|3AL|2G|2IS|2K|2O|3N|2R|3OR|2SDL|2T|3H|4A|2W|2Y|2Z|1S|2AI|2BC|2CE|3ROW|2D|2G|3C|2H|3IB|2N|3C|2P|3R|2S|2T|3ATE|2W|2Z|1T|24|2ALON|2BS|3T|2C|2E|2FETH|2G|3M|3P|2H|32|3A|4X|3B|4N|3D|3ER|3F|4AI|4I|3I|4X|3M|3O|4S|3P|4AD|4LO|4OS|5W|4R|4Y|3S|3V|3W|3X|3Y|2I|2K|3N|2L|2M|2N|3A|2P|3OS|2R|3L|3NT|2S|3C|2T|2X|2Y|2Z|1UC|3OIN|3X|2L|2M|2NO|2RC|3E|3N|3OE|3S|3T|3U|3X|2SD|1V|2A|3N|3ULT|2C|3C|3OIN|2DC|2E|3AI|3D|3NC|4T|3R|4Y|2IL|2MOS|2N|2O|3AI|3L|3S|2R|3ICE|3T|3Y|2T|2U|2X|2Y|2Z|1WC|2IF|2ON|2T|3T|1XA|2B|2C|3C|3L|2D|2E|3N|2FI|2GO|2IP|3T|2LT|2M|3R|2N|3T|2O|3S|2P|3O|2RD|3N|2TN|3P|3RA|2Y|2ZO|1YE|3S|1Z|2C|2ETH|2I|2M|2T|2Y|0F16|2C|12C|2K|13|17|19|1AB|3A|3RIC|2CE|3T|4OM|4R|2DO|2G|2I|3R|4C|4G|2KE|4AI|3T|2ME|4C|3ILY|2N|3360|3C|3D|3G|3V|3X|3Z|2R|3A|3CA|3M|4A|4C|4S|2ST|2T|3HER|4OM|2V|3R|2YD|3RE|2ZZ|1B|2A|2B|2G|2N|3B|2URN|2X|1C|22|2C|2D|2F|2H|2K|2L|2N|2OIN|3N|2P|2Q|2S|2T|3C|1DC|2LS|2M|2O|2R|2T|2USD|2X|2Z|1EAR|2ED|2G|3V1|2I|2LIX|52|2N|3OMY|2R|3C|3MA|3T|3ZAN|2SS|2T|3CH|2VR|2X|2Y|1F|21|2A|2C|3T|2M|2N|2UEL|2YI|1GC|2D|2T|2Z|1HM|1I|2BO|3RE|2C|2D|3A|3LE|3O|2ELD|2F|3TY|2G|2H|2II|2L|3DA|3ES|3L|3M|3ST|2N|3A|4LE|3C|3D|3E|3GER|3K|3N|3OM|3S|3U|2O|2RA|3E|3O|3U|2S|3H|3T|2T|3C|3FI|3T|2U|2WA|2X00|1JB|2C|2T|1K|2GARY|2PEPE|2X|1L|2AG|3ME|3P|3S|4H|5C|2C|2D|3C|3T|2EPE|3TA|3X|2G|2IC|3GHT|3K|3NU|3P|3X|4X|2L|3W|2M|3C|2N|2O|3AT|3KI|5M|5X|3OF|4R|3RK|5Y|3T|3VM|3W|4P|3YX|2P|2R|3BRG|3S|2S|2T|2UID|3RRY|3T|3X|4B|4T|3Z|2VR|2X|2Y|2Z|1M|2B|2C|2E|3X|2G|2L|2T|1N|2B|2C|3T|3Y|2D|3Z|2F|2K|2L|2O|2P|2SA|2TB|2X|2Z|1O|2A|3M|2C|3V|2DL|2F|3O|2GE|2IN|2L|3D|3O|2MO|2N|3E|3S|3T|3Z|2OD|4C|3M|3X|2PA|2R|3A|3CE|5C|3E|4X|3K|3M|3S|3T|4H|5B|2TA|3O|2UR|2X|3AI|3D|3E|3F|3T|3V2|3Y|1P|2AD|2C|2FT|2IS|1R|2A|3C|3X|3Z|2C|2D|3X|2E|3C|4NX|3D|3E|4D|4LA|3L|3N|4S|2F|2GST|3X|2IC|3N|2K|3T|2LONG|2M|2N|3T|2OG|4E|5X|4GY|3NK|4T|3YO|3ZE|2P|2R|2SP|3T|2TC|3N|3S|2V|2WC|2XETH|2Z|3SS|1S|2BT|2C|3C|2HN|2M|2N|2T|3C|2W|1T|2B|2C|2G|2I|2K|2M|3O|2N|2O|2P|2R|3B|3C|2S|2T|2UM|2VT|2W|2X|3T|1UBAO|2CK|2D|2EL|2FU|2JIN|2KU|2L|2MO|2N|3C|4H|3D|4C|4P|4X|4Z|3K|2R|3U|3Y|4X|2S|3DC|3E|3ION|3O|2TC|3URE|2ZE|3N|3Z|1VT|1WATCH|2B|2C|2T|2W|1X|2B|2C|2DX|2F|2I|2P|2S|2T|2Y|1YD|2N|2P|2Z|3NFT|0G1X|13|150|1999|1AC|2D|2FA|3I|2GA|2I|3A|3N|4S|2J|2KH|2L|3A|4TA|4V1|4X|5Y|3EON|3I|3O|3T|2M|3B|4IT|4L|3E|4C|4FI|4IN|4R|4X|3I|3MA|2N|3A|2P|3C|2RD|3I|3K|3T|4S|3U|4DA|3WIF|3Y|2S|3DAO|3G|3P|3TRO|2T|3E|3SBY|2U|2ZE|1B|2A|2C|3R|2D|2E|3X|2G|2IT|2K|2L|2O|3T|3Y|2PT|3U|2RC|2T|3C|2URN|2X|3T|2YTE|1C|2AKE|2C|2ME|2N|2OIN|3TI|2R|2W|1DAO|2C|3C|2DY|2E|2L|2O|3GE|2R|3T|2S|3C|2T|2X|1E|2A|3R|2C|3KO|2EQ|2GE|2IST|2KKO|2LATO|3O|2M|3A|3G|3INI|3S|3Z|2N|3E|3I|4E|4X|3S|4LR|3X|2O|3D|4B|3J|3L|3N|2P|2R|3A|3O|2S|3E|2T|3A|3H|3X|2X|2ZY|1F|2AL|3RM2|2CE|3S|2I|2LY|2N|2T|2UN|2X|2Y|1G|2AVAX|2C|3M|2G|2H|2M|2OLD|2P|3T|2R|2S|2T|3K|4N|1HA|2C|3OLD|2D|2NY|2O|3ST|5M|3UL|2ST|3Y|2T|2UB|2X|1IAC|2B|2C|3T|2F|3T|2G|3A|3X|2M|3MER|2N|3GER|3OA|3UX|3ZA|2O|3T|2V|3E|2Z|1JC|1KF|2I|1LA|3X|2C|3H|2D|3R|3S|3X|3Y|2E|3EC|2F|3T|2I|3DE|3NK|4T|2M|3R|2N|2OBAL|4E|3S|2Q|2R|2S|2T|2X|2YPH|1M|2A|3C|3T|2B|3L|2C|3N|3OIN|2EE|3X|2FAM|2I|2L|2M|3T|2NG|3T|2PD|2R|3X|2S|2T|3O|3T|2USD|2X|1N|2BT|2C|2D|2FT|2G|2J|2NX|2O|3ME|2R|2S|2T|3O|2US|2X|2Y|1O|2A|3L|4S|3T|2B|2C|2D|3E|3L|3S|3Z|2ETH|2F|3F|3X|2G|3O|3U|2IN|2KU|2L|3C|3D|4EN|4X|4Y|3F|3OS|2M|32|3A|3D|3T|2NE|2O|3CH|3D|3GLY|3N|2PX|2RA|3EC|2S|3S|3T|2T|3EM|3G|3X|2V|3I|3T|2W39|2YOO|2Z|1P|2AWS|2BP|2CX|2KR|2L|3X|2N|2O|2PT|2S|2TG|2U|3INU|2X|1Q|1R|2ACY|3IL|4N|3PE|3V|3YLL|2BE|3T|2C|2E|3ARN|3EN|5T|3G|3LF|3XIT|3Y|2FT|2G|2ID|4Z|3MEX|3N|2L|3C|2M|3D|2N|3D|2O|3K|4KY|4X|3N|3W|4TH|2P|3L|2S|2T|2UM|4PY|2V|3E|2W|3I|2X|1S|21|2C|2E|2HIBA|2I|2KY|2M|2PI|2R|2TBSC|3C|3ETH|3S|4OL|3T|2WAP|3IFT|2X|2Y|3S|1T|2A6|3I|3VI|2BOT|2C|3OIN|2E|2F|3O|2H|2IB|2K|2N|2ON|2R|2SE|2X|1UAC|3P|3R|4D|2C|3CI|2E|3SS|2I|3LD|3SE|2LF|2M|2N|3S|2P|2SD|4T|2T|1VC|2E|2R|2T|1W|2D|2GW|2T|1X|2A|2C|2E|2T|1YEN|2M|3NET|3REW|2RO|2SR|1ZB|2E|2IL|2LR|2ONE|2T|2X|0H2O|3N|13O|1ABIBI|2C|3HI|2HA|2I|3R|2KA|3KA|3U|2L|3F|3LO|3O|2M|3I|3S|4TR|2N|3A|3D|4Y|3U|2O|2PI|2RAM|3D|3E|3RYP|3T|2SH|4AI|4T|3UI|2T|3AY|3CHY|3I|2US|2VOC|3Y|2WK|2Y|3YA|2Z|3E|1B|2AR|4X|2B|2C|2D|3C|2E|2IT|2N|2O|3T|2RS|2T|3C|2X|1C|2C|2T|2XP|1D|2AC|3O|2G|2N|2RN|2V|2X|1E|2AL|3RT|5R|3T|3VEN|2C|3T|4A|2DG|4E|2EL|2FI|2GG|3IC|2LIOS|3L|4O|3MET|3PS|2MAN|3ULE|2P|2R|3A|3B|3MES|3O|4ES|2T|3A|3H|2X|3C|2Z|1F|2I|3L|2T|1GET|2HG|2O|3LD|2PT|2S|2T|1H|2EM|2GTTG|1I|2BAKC|4YC|3IKI|3S|2D|3U|2ENS3|54|2FI|3LUF|2GH|2H|2KARI|2LL|2MAYC|3E|2NA|3T|3U|2OD|4BS|2PP|2RE|2T|3BTC|3OP|2VE|2X|1K|2B|2C|2DOGE|3X|2G|2N|1LC|2D|3Y|2M|2N|2P|3R|3T|2S|2T|2X|1MC|2D|2KR|2N|3D|3G|2P|2Q|2R|3N|2ST|2T|3T|2X|1NB|2C|3N|2S|3T|2T|3R|2X|2Y|2ZO|1O|2A|2BA|3BES|3O|2CAI|2D|3L|2GE|2ICHI|2KA|3K|2L|3A|3D|4EX|3Y|2ME|3I|2N|3EY|3K|3OR|2OF|3K|3P|2P|3PY|3R|2RD|3SE|3US|2S|3HI|3KY|3TAI|2T|3N|3T|2USE|2W|3L|1P|2AD|3Y|2B|2C|2L|2N|2O|2T|2X|2Y|1QR|2T|2X|1RB|3E|2CC|2D|3G|2M|2O|2TS|1SC|2F|2N|2P|2S|2T|2UI|4TE|1T|2A|2B|2C|2D|3F|2E|3R|2M|3L|3OON|2N|2O|2R|2T|2X|2Z|1UAHUA|2B|3II|2C|2DI|2GE|3O|2H|2M|3AI|3P|2ND|3NY|3T|2R|2S|3D|3H|3KY|3L|2T|1VC|3O|2E|32|2H|2I|2N|3T|2T|1WC|2L|2T|1XA|2C|2D|2RO|2T|2X|3H|1YBN|3RID|2C|2DRA|4O|5P|2GH|2N|2P|3E|4R|5D|5S|4S|3R|2S|2T|2VE|1Z|2D|2M|2N|2T|0I0C|17|19C|1AG|2I|2M|1B|2ANK|3T|2ETH|3UR|2FK|3N|3R|2G|2IT|2NB|2P|2S|2TC|1C|2A|3P|3SH|2B|2C|2E|2G|2H|3I|3N|3X|2LICK|2N|2OB|3M|3N|4S|3O|3S|2P|2SA|3T|2T|2X|1D|2AC|3P|2C|2EA|3FI|3X|2H|3UB|2IA|3CE|2K|2LE|2M|2NA|2O|3L|3RU|2RT|3X|2T|3T|2V|2X|3M|3S|2YP|1EC|2TH|1F|2C|2IT|2LT|2T|2UM|3ND|2X|1G1|2CH|2G|2I|2NIS|2TT|2U|3P|1HC|2F|2T|1IC|1JC|2Z|1LA|2C|3T|2K|2T|2V|1MBTC|2C|2E|2G|3NAI|3Z|2I|2L|2MO|2O|2P|3ACT|3CH|4N|3ER|3S|3T|2S|3T|2T|2U|2VR|2X|1N|2ARI|2B|2C|3AKE|3NT|3P|2D|3EX|3I|4A|3U|3Y|2E|3RY|3S|3T|3X|2F|3C|3I|4NI|3LR|3O|3RA|3T|4T|3X|2G|2J|2K|2N|3BC|3OU|2O|2P|2RT|2S|3ANE|3C|3N|3P|3R|3T|4AR|3UR|5C|2T|3D|3ER|5N|3L|3O|3R|3X|2U|3INU|3KO|3S|2V|3C|3I|4C|3OX|3X|2X|3M|3T|1O|2C|2EN|3X|2I|2N|3C|3X|3Z|2P|2SHIB|3T|2T|3W|3X|2U|3X|2V|3T|2WN|1P3|2AD|2C|2DN|2L|2MB|2OR|2SX|2T|2UX|2V|3OLD|2X|1Q|250|2C|2N|2Q|2T|1RA|2C|2ENA|2IS|2L|2ON|2T|2YDE|1SA|2DT|2G|2H|3I|3ND|2IKC|2KR|3Y|2L|3AMI|3M|2P|2R|2SP|2T|3EP|1TA|3M|2C|2EM|2F|2G|3R|2HEUM|2L|3R|2M|2OC|2R|2SB|2U|2X|2Z|1UNGO|2S|3D|2X|1VAR|2C|2I|3P|2N|2Y|2Z|1W|2T|1X|2C|2P|2S|2T|1YKYK|1ZA|2E|3R|2I|2X|2ZY|0J8T|19BC|1ACK|3S|3Y|2DE|4C|2IHO|2KE|2M|2N|3E|2R|3ED|3Y|2SMY|2WS|2Y|1BOT|2S|2X|1C|2B|2C|2G|2O|2R|2T|1DC|1ED|3ALS|2ET|2FE|3F|2LLY|2M|2N|2RRY|2SUS|2T|3TON|2UR|2W|3EL|2X|1FI|3N|3VE|1GLP|2N|1IAOZI|2B|2F|2M|2ND|2O|2ZZ|1K|2C|2L|1LP|1M|2C|2PT|2T|2Z|1NB|2GL|2S|2T|2X|2Y|1OB|3S|2E|3Y|2HM|2INT|2JO|2K|3ER|2LT|2NES|2OPS|2Y|3S|3T|1P|2AW|2D|2EG|2GC|2YC|3X|1RIT|2T|1SE|2M|2OL|2T|1T|2C|2O|2S|2T|2X|1UDGE|2GNI|2I|3CE|2L|3B|3D|2MBO|3P|2N|3O|2P|3I|2R|2SDC|4T|2V|1VL|2Y|1W|2L|0K21|2G|1AAS|2BOSU|3Y|2C|3Y|2G|2I|3KEN|3NET|2KA|3I|2L|3A|4M|3DI|3I|3LY|3M|2M|3PAY|2N|3G3N|4AL|2P|3U|2R|3ATE|3EN|3MA|5D|3T|2S|3TA|2T|3A|4NA|3Z|2U|2VA|2WA|2YI|1B3|2C|2D|2OND|3T|3X|2R|2T|3C|2X|1C|2AKE|3L|3SH|3T|2CM|3PAD|2H|2S|2T|1DA|3G|2C|2G|2IA|2OE|3GE|2X|1EANU|2C|2D|2EP|3S|2I|2K|3E|4C|2L|3PIE|2MA|2N|3NEL|3SHI|2P|2RMIT|2TAN|2X|2Y|3C|4AT|3FI|3T|1FC|2I|2R|2T|2X|1GC|2O|2T|1HM|1I|2AN|2BA|3SHI|2CK|4S|2F|2KO|2LLER|3T|2M|3BO|3CHI|2N|3D|3E|3G|493|4B|4F|4U|4Y|3T|3U|2RA|3BY|3O|2SC|3HU|2TA|3SU|3TI|4Y|2WI|2ZUNA|1KO|2T|1LAP|3Y|2C|2D|2EE|3VA|2IMA|3ST|2K|3S|2O|3N|2P|2T|2UB|2V|1MA|2C|2D|2L|2ON|2X|1NC|3L|2DC|3M|3X|2FT|2G|3N|2IGHT|3NE|2J|2OB|3T|3W|3X|2S|2T|3O|2W|1OBE|3O|2DA|2GE|2I|3N|4B|3P|2JI|2K|3O|2L|3ION|2M|3O|3P|2N|3G|3O|2RE|4C|3RA|2TO|2Y|2Z|1P3R|24R|2AD|3PA|2C|2HI|2L|2OP|1RAK|3TOS|2B|2C|2D|2EDS|3ST|2IDA|3PTO|2L|2M|2N|2O|3M|4E|3NE|2P|2RX|2T|2U|2X|1S2|2C|2H|3IB|2M|2N|2P|2S|2T|2WAP|2YS|1T|2C|2K|2N|2O|3N|2S|2T|2X|1UB|3E|3O|4S|2E|2JI|2KU|2MA|3U|2NCI|2R|3O|3T|2S|3A|3D|3H|2V|1VERSE|2I|2NT|2T|1WAI|3TT|2D|2ENTA|2H|2IK|2S|2T|1XA|2C|2USD|1YCC|2L|2OKO|2TE|2UB|2VE|1ZC|2EN|0L2|2DAO|13P|2USD|17|1A|2B|3RA|3S|3X|2CE|2DA|3YF|4S|2EEB|2I|3KA|2KE|2LA|2MB|4O|2NA|3C|3D|4B|4S|3E|2O|2R|3IX|3O|3RY|2S|2T|3TE|3X|2UNCH|2VA|4X|3E|3ITA|2W|2X|2YER|2Z|3IO|1BA|2C|2K|2L|3OCK|2R|2T|3C|2XC|1C|24|2ASH|2C|2D|2G|2K|2MG|3S|2P|2R|3O|2S|3N|2T|2WP|2X|1DC|2FI|2M|2N|2O|3GE|2X|3G|2Z|1EA|3D|3F|3G|3N|3SH|2D|3U|2E|3T|2G|3O|2IA|2LE|2MC|3D|3N|3O|4N|2N|3D|4A|4S|3FI|3IN|2O|3S|3X|2PA|3EN|2SS|4F|2T|2U|2V|3E|4LG|4R|5J|3L|2X|3I|2Z|3GI|1F|2C|2G|2I|2NTY|2T|2W|1GBT|4Q|2C|3Y|2D|2O|3LD|3T|2R|2X|1HB|2C|2D|2INU|2T|1IB|3ERA|5O|3FX|3RA|4E|2C|3K|3O|2D|3ER|2EN|2F|33|3E|3T|2GER|3HT|3MA|3O|2KE|4C|2LA|2ME|4X|3O|3X|2NA|3DA|3EA|3G|3K|4A|4C|4FI|3Q|3U|3X|2ON|2PC|3S|2Q|3D|3R|3UI|2R|2S|3A|2T|3E|3H|4O|3ION|3T|2V|3E|2XX|2Z|3A|4RD|3D|1K|27|2C|2D|2N|2SM|2T|2U|2Y|1LAND|2G|2ION|1M|2AO|2C|3H|2EOW|2R|2T|2WR|2XC|2Y|1N|2C|2D|3RY|3X|2K|3C|2L|2R|2T|2X|1OA|3N|2BS|2C|3C|3G|3I|3K|3O|3US|2DE|2F|3I|2G|2IS|2KA|3R|2L|3A|3C|2N|3G|4FU|2OK|4S|3M|3N|4G|3P|4Y|3T|4EX|2PES|2RD|4S|4Z|3Y|2ST|2T|3ES|4U|3TO|4Y|3US|2UD|2V|3E|4LY|2WB|2X|2YAL|1P|2C|2I|2K|2L|2NT|2OOL|2T|2V|2Y|1Q|28|2BTC|2D|3N|3R|3X|2R|2TY|1RC|2G|2N|1SC|2D|3OGE|2ETH|2HARE|2K|2P|2S|2T|3AR|2V|2WAP|1T|2A|2B|3C|3TC|3X|2C|3C|3D|3H|3P|3R|3U|3X|2D|2E|3X|2G|2H|3N|2K|2NM|2O|3V1|42|2PC|2R|3BT|2S|2T|2X|2Z|1UA|2C|3A|3HOW|3K|4Y|5B|3Y|2DO|2FC|3FY|5G|2IGI|3S|2LU|2M|3A|3I|2N|3A|4R|4T|3C|4H|3E|4S|3G|3R|2PIN|2S|3D|3H|2T|2X|3O|3Y|1VG|2IP|2L|2M|2N|2X|1WC|2F|1X|2C|2F|2T|3O|1YB|2C|2F|3E|2K|2L|2M|2N|3K|3X|2O|2QD|2RA|2TX|2UM|2VE|2X|3E|1Z|0M1|12O|187|1AC|2DANA|3C|3OG|2EP|2F|2G|3A|3E|3IC|5F|5K|5V|4K|3NET|2HA|2I|3A|3D|3L|2KE|3I|2LL|4Y|2MAI|2N|3A|3C|3DOX|3E|3GA|3NA|3TA|4LE|2P|3C|3E|3R|3S|2R3|3CO|3E|3I|4O|3K|3LEY|3MAJ|3O|3S|44|4C|4H|3T|4K|3U|3V|4IN|3X|3YJ|2S|3A|3K|3P|3Q|3S|3TER|3YA|2T|3A|3CH|3E|3H|3IC|5X|3PAD|2U|2V|3IA|2W|2X|3I|3R|3X|2Y|3P|2ZC|3I|3ZE|1B|28|2ASE|2CASH|3C|2E|3T|2F|2I|3T|2L|3C|3K|2M|2N|2ONK|3T|3X|2P|2RS|2S|2T|3C|3X|2X|1C|2ADE|3P|3R|3SH|3T20|3U|2B|2C|2D|2ELO|3UR|2F|2G|2H|3C|2I|3V|2LB|2N|2O|32|2P|3C|2RC|3N|3T|2S|2T|2U|3SD|2V|1DA|3I|3O|2B|2C|3L|2DN|2F|2H|2I|3CE|2M|2N|2R|2S|2T|3K|2U|3S|2X|3H|1E|2AN|2B|2C|3H|4A|3I|2D|3I|4A|4C|5O|4T|2E|3D|3R|3T|2F|3A|2GA|2L|3B|3D|3I|3LO|3O|4S|3T|2M|3E|4AI|4ME|4S|4T|2NGO|3LO|2OW|4G|4IF|2PAD|2R|3CE|4U|3I|3KLE|2SA|3G|3H|3SI|2T|3A|4C|5R|4F|4G|4L|4N|5O|4PK|4Q|4S|4T|4V|4X|3EOR|4R|3FI|3H|3I|4S|3M|3O|4LD|3RO|2U|2V|3R|2W|3TWO|2X|3C|3P|2ZZ|1F|21|2AM|2C|2ER|3T|2G|2I|2O|2PS|2S|2T|3U|2UND|2X|1G|2AMES|3R|2D|2G|3T|2KL|2LC|3D|2N|2O|3D|2P|3T|2T|2UL|2X|1HAM|2C|2LX|2P|2T|2UNT|1I|2A|2B|3O|3R|2C|3E|3KEY|3RO|2DAI|4S|3N|2E|2F|2G|3MIG|2KS|2L|3E|4I|3K|42|3LI|3O|2M|3I|4R|3O|2N|3A|3C|3D|4EX|4S|3E|4X|3I|4ON|3O|3S|3T|4ME|4YS|3U|4TE|3X|2O|3DIO|3TA|2R|3C|2S|3A|3HKA|3S|3T|2T|3C|3H|3X|2V|3A|3RS|2X|2Y|1JT|1KC|2EY|2ONG|2R|2T|2USD|1L|2A|2D|2GC|2ITE|2K|2N|3K|2OKY|2S|2T|3C|3PX|2XC|1M|2A|3I|3ON|3PS|2C|2ETA|2F|2G|2IT|2NXT|2O|2PRO|2S|3C|3S|2T|3M|2UI|2VG|2X|3IV|3VI|2Y|1N|2B|2C|2D|3CC|3E|2E|3T|2FT|4S|2G|3O|2I|2M|2R|3B|3CH|2S|3T|2TC|3G|3L|3O|3P|2V|3M|2W|2X|2Y|2Z|1O|2AC|3R|3T|2B|3I|4C|4E|4LE|3U|3X|3Y|2C|3HI|3O|2D|3A|4I|3C|3EL|4X|3UM|3X|2E|3TA|2F|3I|3OLD|2G|3U|3X|2H|2I|3N|2JO|2K|2L|3A|3K|2M|3A|2N|3A|4V|3ETA|4Y|3F|3G|420|3I|4E|3K|4E|5Y|4U|3O|3S|4T|5A|3T|4E|2O|3I|3LYA|3N|4C|4D|4ED|5R|5Y|4R|3O|3V|3X|2PS|2RA|3E|3OS|3PH|3RA|3SE|2S|2T|3A|3G|3I|3O|2UTAI|2V|3D|3E|4R|4Y|4Z|3ON|3R|2W|3A|2Z|1P|23|2AY|2C|2D|2G|2H|2I|2L|3US|3X|2M|2RO|2S|2T|2WR|2X|3T|1QL|2ST|1R|2BOB|2CH|3R|2F|3OX|2HB|2I|2K|2N|3A|2P|3EPE|2S|3A|2T|2UN|2V|2X|3B|2Y|1SA|2B|2C|3P|3T|2D|2G|3O|2HD|3IB|4P|2N|2OL|3T|2P|2Q|2R|2T|3O|2U|2WAP|1T|2A|2B|3C|2C|3MN|3N|2D|2EL|2G|2H|3D|3N|2IX|2K|2L|3M3|3X|2N|2O|2P|2R|3A|3C|3G|3M|3X|2S|3H|2T|2V|3T|2W|2X|3LT|2Y|2Z|1U|2BI|2DOL2|3RA|2E|2LTI|5V|2MU|2N|3CH|3ITY|2RA|2SD|3E|3IC|3K|3T|2T|3E|2U|2ZZ|1V|2C|2D|3G|2EDA|2G|2I|2L|2P|2RS|2U|2X|1W|2AR|3T|2C|3C|1X|2C|2M|2NT|2RP|2T|3C|2W|2X|2Z|1YB|2C|3E|2DFS|2ID|2L|3O|2NE|2O|3BU|2RA|3IA|3O|4O|2ST|2T|3H|3V|1ZC|2G|2K|2M|2R|2X|0N0031|11|13DR|17|18V|1ABOX|2C|2DA|2FT|2H|2KA|2LS|2M|3E|4C|3I|3O|2N|3A|4S|3J|3O|2O|3S|2P|2RCO|2S|32|3H|3SR|3TR|2T|3ION|2UT|2V|3C|3I|4A|4B|3X|3Y|2WA|2X|2ZAR|1BABSC|3I|3R|2C|2IT|2L|3U|2NG|2OT|3X|2P|2R|2S|2T|1C|2ASH|2C|2DT|2O|3P|3R|4AI|3V|2P|2R|2T|1D|2AU|2C|2LC|2N|2OGE|2R|2X|1EAL|3R|3T|2BL|3U|2C|2ER|3T|2F|2I|2KI|3O|4IN|4S|2MO|3S|2O|3G|3K|3M|3N|3S|3X|2PT|2RD|3F|3O|3VE|2SS|3T|2T|3C|3KO|3Z|41|2U|3ROS|3TR|5O|2VA|3ER|2W|3B|3G|3M|3O|4S|3S|3TON|2X|3A|3BOX|4T|3M|3O|3T|4EX|3XO|2ZHA|1FAI|2CR|2D|2E|2N|2P|2T|311|3ART|3B|4S|3D|3E|3I|3L|3N|3P|3S|3T|3X|4HI|3Y|4P|2UP|2XC|2Y|1GA|2C|2IN|2L|2M|3I|1HCT1|2T|1IBI|2C|3E|4C|2F|3T|4SY|2HAO|2I|3FI|2K|2M|3FA|2N|3JA|5Z|3KY|3O|3U|2OB|3X|2T|3O|3RO|5E|5G|2X|2ZA|1KA|2C|3LC|2N|2T|1LC|32|2G|2INK|2S|2X|1MB|3TC|2C|2D|2H|2K|3R|2R|2S|3P|2T|2X|1NB|2C|2I|2N|2T|1OA|3H|2BL|2DE|3IS|3L|2IA|3S|3Z|2KA|3U|2LA|2M|2NE|2O|3T|2R|3A|3D|3MIE|2S|3N|3O|2TE|2V|3A|2W|2X|3B|1PAS|2C|2ER|2ICK|2LC|2M|2T|2X|3S|1RB|2C|3H|2FB|2G|3Y|2K|2M|2N|2O|2P|2S|2V|3E|2X|1S2DRP|2BT|2D|3X|2FW|2H|2I|2K|2P|2R|2S|2TE|2UR|4E|1T|2B|3C|2C|3C|2D|2G|2K|2M|2O|2R|3N|2S|2VRK|2WK|2X|2Y|1U|2A|2B|3IS|2DE|4S|2KE|2LS|2M|3I|2R|2SA|3D|2T|3GV2|3S|2X|1VA|2C|2DX|2G|2IR|2L|2OY|2S|3T|2T|2X|2ZN|1WC|3N|2P|2S|1XC|2D|3T|2E|2M|3C|2N|2RA|2S|2T|3I|3T|4Y|1YAN|4TE|2BBLE|2C|3REC|2E|3X|2M|2N|2X|2ZO|1ZC|2DX|2E|2L|2O|0O3|14DX|1AK|2S|3C|3IS|2TH|2X|1BEMA|2I|3TS|2OT|2ROK|2S|3R|2T|3C|2X|1C|2AI|3VU|2B|2C|2D|2E|3AN|5T|2ICAT|2L|2N|2P|2T|3A|4X|3I|3O|4C|4IN|2W|2X|1DC|2DZ|2E|2GN|2IN|2MC|2N|3T|2S|2X|2YS|1F|2BC|2C|3R|2E|2N|1G|2CINU|2D|2GY|2N|2O|3D|2SM|3P|2T|2V|2Y|2Z|1H|2ANDY|2M|2O|1ICOIN|2L|3D|2N|2O|1JA|2X|1K|2B|2G|2LP|2OIN|2S|3E|2T|1LAND|3S|2DSF|2E|3A|2IVE|2OID|2T|2V|2XA|2Y|3MP|1M|2A|3X|2C|2D|2EGA|2G|3C|2I|3C|2MI|2NI|4A|4X|3OM|2T|2V1|2X|1N|2AM|2C|2DO|2E|3S|3X|2G|3AS|2I|3ON|3T|2L|3INE|3Y|2NO|2OT|2S|3TON|2T|2US|2X|1OE|2GI|2KI|3S|2RC|3T|2T|2W|1P|2A|3IG|2C|3T|2EN|4GO|4RI|4X|3PE|3S|3T|3X|2HX|2INU|3UM|2MND|2N|3N|2P|2S|3C|3EC|2T|3C|4M|3I|4G|4ON|2U|3L|2V|1RACLE|3I|4X|3O|3RE|2B|3IS|3K|3R|3S|3T|2C|3A|2D|3I|42|4FI|3S|2E|3O|3T|2GA|3T|2I|3GIN|3ON|2LY|2M|3E|2N|3J|2O|3C|3P|3X|2S|2T|2V|2YX|1S|276|2A|3K|2C|2EA|4N|3TH|2F|2HI|2K|2L|2MO|2QTH|2S|2T|2WAP|1T|2B|2HR|2K|2N|2O|2SEA|2X|1UCHI|2D|2R|2SD|4C|3E|2T|1VC|2N|2O|2R|1WC|2D|2L|2N|1X|2AI|2B|3T|2D|2EN|2M|2S|2T|2Y|32|3C|1YS|1ZG|2K|2MPC|2O|3NE|2P|0P202|2PS|13D|1404|1AAL|2BLO|2C|3E|3M|4AN|3OCA|3T|2D|2F|2GE|2I|3D|3NT|2K|2L|3AI|3ET|3G|3LA|3M|4Y|2M|3P|2N|3D|4A|5I|4O|5P|3GE|3IC|3O|2PA|3ER|3I|3PAY|2R|3A|4B|4L|5L|4S|4W|3ETO|3I|3LAY|3MA|3Q|3T|2S|3C|3G|3L|3S|2T|3EX|3H|2VIA|3O|2W|3S|3TH|2XEX|3G|3U|3W|2Y|3B|3CON|3N|3P|3S|3T|3U|3X|2ZZI|1BAR|3SE|2C|2ET|2IRB|2L|3K|2Q|2R|3V1|2T|2X|3V1|1C|2C|3M|2E|2H|3S|2I|2L|2M|2N|3T|2O|3IN|2R|2S|3P|2X|1D|2A|3TA|2C|2D|2EX|2F|2OG|4E|2T|2X|1EA|3CHY|3K|3R|4L|3S|2C|3L|2EL|3PA|4O|4S|2FI|2G|3S|2IPEI|2KC|3O|2L|2M|2NC|3DLE|3G|4YX|3IS|3TA|2OPLE|3S|2PC|3E|42|4AI|4D|4E|4F|4GA|4MO|4PI|4RA|4W|4X|3I|3PA|4ER|3S|2R|3A|3C|3I|3L|3P|3RY|3U|3X|2SA|2T|3F|3G|3H|3L|3N|3O|3S|3T|2USD|2X|1FI|3D|2L|2R|2T|2Y|1G|2ALA|2C|2EN|2F7T|2L|2N|2OLD|2ROK|2T|3S|2U|2X|1HA|3E|3LA|2B|3D|2C|3R|2I|3BA|2L|2M|2N|3X|2O|3NON|3ON|3RE|2R|2S|2T|3C|3R|2V|2X|1I|2AS|2B|2CA|3KLE|3O|2E|2F|2G|3E|4ON|3GY|3S|2KA|3O|2LOT|2N|3CHI|3E|3G|3K|4X|3MO|3O|3U|2O|2P|3A|3I|3L|3T|2RATE|3I|3L|2S|3T|2T|3CH|2VN|3X|2X|3EL|5V|2ZA|3ZA|1JM|1KB|2C|2D|2F|2G|2N|2OIN|2T|1LA|3AS|3C|4E|3I|3N|4ET|3T|4C|4O|3Y|4C|2B|3T|2C|3U|4C|2D|2E|3B|3O|3RF|3X|2F|2G|3R|2I|2M|3T|2NC|3X|2OT|2Q|2R|2S|3ARB|3B|3D|3PAD|3X|2T|3C|3X|4YZ|2U|3G|4CN|3RA|3S1|3TUS|2X|3Y|2Y|1MA|2E|3ER|2G|3T|2M|2NT|2ON|2PY|2TN|1NC|2D|3C|3R|2FT|2G|3N|2K|2L|2ODE|2T|2X|2Y|1OA|3I|2C|3C|3KET|3O|2D|3IUM|3O|2E|2G|3AI|2INTS|2K|3EM|4R|3O|3T|2L|3A|4R|3C|3I|4S|3K|4ER|3L|3NX|3S|3VEN|3X|3Y|4X|2M|2N|3D|3KE|3YO|3ZU|2O|3DL|3H|3L|4X|5T|4Z|3P|2P|3C|4AT|3E|3K|3O|2R|3A|3K|4E|3T|43|4AL|4O|4U|4X|2S|3EX|3I|3Q|3S|3T|4C|2T|3S|3TER|2U|2WELL|4R|3R|1P|2AD|3Y|2BLZ|2C|2I|3ZZA|2L|2M|2N|2OVR|2P|2R|2S|2T|2Y|1QT|1RA|3RE|2B|2C|3H|3L|3M|3Y|2DS|3X|2E|3D|3M|4E|4IA|3S|2FT|2G|2I|3A|3DE|3MAL|4E|3NT|5S|3SM|5A|3X|2L|2M|3X|2NT|2O|3B|3C|3D|3GE|3M|3OF|3P|4C|4S|3S|3T|4EO|4O|5N|3UD|3XI|2P|3S|3T|2Q|2S|2T|3C|3G|2V|3C|3S|2X|3Y|2Y|1S1|2B|2C|2D|2EUD|2F|2G|2I|3LOC|2K|2L|3IP|2M|2OL|2P|3S|2T|3AKE|3N|2UB|2WAP|2Y|3OP|1T|2A|3S|2C|2D|2ERIA|2F|2H|2I|2N|2O|3N|3Y|2P|2R|2T|2U|2X|1UFETH|3F|4IN|2GAI|3L|2LI|3SE|2MA|3BAA|3LX|3P|2N|3CH|3DIX|4U|3K|2PA|3S|2RA|3E|3R|3SE|2SD|3H|4I|3SY|2T|2X|1VFYBO|2P|2T|2U|1WAR|2H|2INGS|2ON|2R|2T|1X|2B|2C|2G|2I|2L|2P|2T|1YC|2E|2I|2LNT|3ON|2M|3E|2N|2P|2Q|2R|3AM|3K|3O|2T|3H|2USD|1ZM|2P|2T|0Q1S|12C|1A|2C|2NX|2RK|2SH|2U|1BAO|2C|2IT|2K|2T|2U|2X|2Z|1C|2H|2N|2O|2X|1DC|2ROP|2T|2X|1FI|1I|2E|2SWAP|1KC|2NTL|1LC|2INDO|1MALL|1NT|3R|3U|2X|1OBI|2M|2OB|2RA|3PO|1QBC|2Q|3F|1R|2DO|2K|2L|2P|2T|2X|1SLV|2P|2R|1TC|3ON|2F|2L|2O|2UM|2Z|1UA|3CK|3M|3NT|3RTZ|3SA|2B|3E|2ICK|3DD|3N|4T|3Z|2O|2ROZ|2SD|1VT|1WAN|3RK|2C|2LA|1XC|0R1|12R|134P|2FI|2T|14RE|1AB|3BIT|3I|2C|3A|3EFI|3ING|2D|3AR|3I|4O|3R|2FT|2GE|2I|3D|4ER|3F|3L|3N|4C|4I|3SE|3T|3ZER|2K|3E|3U|2M|3A|3EN|3P|2NKER|2P|3TOR|2RE|3I|2STA|2TING|4O|3S|2VE|4N|2WG|2Y|3S|2ZE|3OR|1B|2C|2D|3T|2IES|3F|3S|3T|2LS|3Z|2N|3B|2P|2R|2T|3C|2UNNY|2W|2X|3S|2Y|1C|220|2C|3C|2G|2H|2KT|2M|2N|2OIN|2T|2X|1D|2C|2D|2EX|2F|2GX|2N|3T|2O|2PX|2R|2S|2T|2X|1EA|3CH|3L|4M|5S|4Y|3P|4ER|3U|2BL|3US|2C|3OM|2D|3C|4O|3DIT|3FEG|3I|3LC|3N|3O|2E|3F|3LT|2F|3I|3UND|2GENT|2HAB|2I|3GN|2KT|42|2L|3AY|3I|3VT|2M|3CO|3E|3IT|2N|3A|3BTC|3C|3E|4C|3Q|3S|3T|4BE|2P|3O|3UX|2Q|2S|3T|2T|3A|4IL|3H|42|3IRE|2U|3NI|2V|33L|3A|3E|3O|4AI|4N|3U|3V|2W|2X|1F|2CTR|2D|3B|2G|2I|2KJ|2L|2OX|2R|2T|2UEL|2X|1GC|2EN|2OLD|2P|2T|1HEA|2INO|2OC|2P|1IA|2B|3BIT|2C|3E|3H|3K|2DE|4MY|2F|33|3I|2GEL|2K|2L|2M|3BIT|2N|3G|4X|3IA|3U|2O|2P|3AX|3O|3T|4O|2SE|4P|3ITA|2TE|3O|3Z|2YA|2ZE|1JV|1KC|2I|2N|2R|2T|1LB|2C|2M|2OOP|2T|2X|2Y|1MATIC|2C|2ESH|2OB|2PL|2RK|2S|2T|2V|1NB|3W|2C|2D|3R|3X|2S|2T|3B|2X|1OAD|3R|2B|3ET|3IN|2C|3K|42|4ET|4I|4Y|3O|2DAI|2E|2G|2I|2K|3O|2LS|2ME|2ND|3IN|2O|3BEE|3K|3M|3ST|3T|4S|2S|3E|3N|3X|2T|3TY|2UND|3P|3SH|3TE|2VI|2W|3AN|2X|2Y|3A|4L|1PB|2C|2D|2G|2ILL|2K|2L|2M|2S|2T|3R|2UT|2ZX|1RB|2C|2T|1SC|2ETH|2F|2IN|2PN|2R|3V|2S3|2T|3K|2UN|2V|2WETH|1T2|2B|2C|2E|2H|2M|2T|1UBIT|3X|3Y|4EX|2C|2FF|2G|3Z|2LER|2NE|3Y|2P|3X|2SD|3H|3T|2UF|2X|1VC|2F|2LNG|3T|2M|2N|2O|2P|2R|2ST|2T|2X|1WA|3S|2D|2E|2N|2S|1XCG|2D|2O|2T|1YC|3N|2IU|2O|3MA|3SHI|2Z|1ZR|0S2K|14F|18C|1ABAI|3LE|3R|2C1|2F|3E|4S|4T|4X|3LE|3TP|3UU|2I|3L|3TA|4O|2K|3AI|4TA|3E|2L|3D|3E|3LY|3MON|3T|2M|3A|3O|2N|3A|3D|4G|4Y|3I|3JI|3SHU|3TA|4OS|2O|2P|3E|3P|4C|2R|3CO|3OS|2S|2T|32|3A|3OX|4Z|3S|3T|3X|2UBER|3CE|3NA|2V3|3G|3M|1B|2A|3BE|2C|3C|2E|2F|2GO|2IO|2OX|2R|3T|2SC|2T|3C|1C|2A|3LE|3M|3NS|3P|4E|3R|4AB|3SH|3T|2C|3P|2DS|2FX|2H|3O|2IA|3X|2K|2L|3P|2M|2N|3R|3SOL|2O|3IN|3NE|3OBY|3R|4E|3T|4TY|2P|3T|2RAP|3EAM|3IBE|4V|3L|3M|3PT|3T|2S|3X|2T|3K|2Y|1D|2A|3I|3O|2C|3RV|2EX|2L|2N|2O|3G|4E|3PE|2P|2RN|2S|2T|2USD|2X|1EA|3L|4N|3M|3N|3T|2BA|2C|3O|4ND|3RT|3T|2ED|4S|4V|4X|3LE|3N|3R|2FA|2G|2I|3LOR|2KAI|2L|3F|3LC|2M|2N|3ATE|3C|3D|3NO|3SE|4I|4O|5R|3T|2ON|3R|3S|2PA|2Q|2R|3G|3O|3P|3SH|3V|4E|2SSIA|2TH|42|4ER|3S|2X|3Y|1FARM|2C|3P|2D|2F|2G|2I|3N|3T|2L|3OKI|2M|2P|2R|3C|2T|3MX|3Y|2U|3EL|3ND|2X|1G|2B|2DX|2E|2LY|2N|2O|3LD|2P|3T|2R|3OK|2T|1HA|3CK|3DE|3K|4E|3MAN|3N|4G|3RBI|4D|5S|4E|5S|4K|4PE|3UN|2B4|2D|3W|2E|3B|3ESH|3I|3LL|3N|3PE|3RA|3ZMU|2FL|3T|2G|2I|3A|3B|405|42|4AC|5I|5Y|4GF|4IC|4K|4L|4O|4TC|4U|3CO|3DO|3ELD|3FT|3H|3K|3L|4L|5D|3NA|4JA|4O|4T|3P|3T|3V|2K|2L|3D|2ND|2O|3E|3N|3P|4X|3RTY|3W|2PING|2R|3AP|3ED|4K|3OOM|2S|2UB|2VR|2X|1I|2B|3A|2C|2DE|3US|2ERRA|2FT|3U|2G|3N|4A|5T|3T|3U|2L|3K|4R|4T|3LY|3O|3V2|4A|4ER|2MP|4LE|2N|3E|3G|4LE|3S|4O|3X|2P|3HER|4ON|2R|2S|3A|3C|3HI|2U|3UU|2V|2X|2Z|3E|1JCX|1KB|2C|3S|2EB|3T|3Y|2I|3D|3LL|3N|4S|2L|3AY|2M|2PEPE|2R|3B|3IMP|3P|3T|3Y|2T|2U|3LL|2Y|3FT|3M|3RIM|3X|1LA|3M|2B|2C|3L|2EEP|3RF|52|3X|2G|2ICE|5C|3M|4E|3NG|4K|2M|2N|3D|3V2|2OKI|3RK|3TH|2P|3V1|2R|3R|3S|2S|3T|2T|2VX|2X|1MA|3C|3RS|4T|5B|5O|3T|2BR|2C|3W|2D|2ETA|2F|2G|2H|2I|3LE|5K|5Y|2L|3Y|2M|2OG|3KE|3L|4E|3N|3ON|2PF|3L|2R|3AT|3T|4R|2SR|2T|3F|3Y|2U|3DGE|1N|2ACK|3KES|3P|2B|2C|3T|2D|2E|3K|4E|3T|2FTS|2GLS|2IP|3TCH|2K|2L|2M|2N|2OB|3OP|5Y|3V|3W|2PC|3S|2RG|3K|2S|3T|3Y|2T|3R|3VT|2X|2Y|1O|2AI|3K|3R|2BA|3B|3ER|2C|3A|3C|4ER|3KS|3OLA|2DA|3O|2FI|2HOT|2IL|2J|2KU|2L|310|3A|4MA|5B|4PE|4R|5E|4V|3C|4EX|3E|4X|3ID|3KIT|3O|3PAD|3R|3S|4CC|3VE|3X|2M|3A|3M|2N|3AR|3G|3IC|5O|3NE|2ON|2P|2R|3A|2T|3A|2UL|4O|4S|3ND|3RCE|2V|3E|3I|2Y|1P|28DE|2A|3CE|3I|4N|3NK|3RKO|4TA|3T|3Y|2C|3IE|3T|2D|3R|3X|2E|3C|3EDY|3LL|3ND|5C|3PE|3X|2F|3C|2G|3BB|2H|3ERE|3R|4I|3TX|3YNX|2I|3CE|3DER|5Y|3KE|3N|3RIT|3Z|2K|3L|3TR|2LA|2M|2N|3D|2O|3K|3L|3NGE|3ODY|4L|3RE|4T|3TS|3X|2RING|3KL|3T|4S|4Z|2S|2T|2UME|3RDO|4S|2WN|2X|3C|2Y|3RO|1QAT|2G|2L|2R|2T|3S|2UA|4D|4WK|3ID|52|1RBP|2C|3OIN|3X|2EUR|2G|2K|2LTY|2M|2N|3T|2P|2T|2WD|2X|1S|2B|2C|2D|2E|2G|3T|2H|3IB|4P|2LX|2S|2T|3C|2U|2V|2WP|2X|1T|2A|3BLZ|3C|4K|5S|4S|3K|4E|3LIN|3MP|3PT|3R|4C|4K|4L|5Y|4P|4S|5H|4T|5A|3SH|3T|4E|5R|4S|3X|2BU|2C|3N|2D|3YDX|2EAK|3EM|5D|4P|3LLA|3MX|3N|3P|4G|4H|4R|4S|3TH|3WIE|3X|2F|3X|2G|2HR|2I|3C|3K|3MA|4E|3NG|4J|2JUNO|2K|3BNB|3K|2LE|2MAN|3X|2ND|3EAR|2O|3GE|3N|4E|4K|5S|3P|3R|4E|4J|4M|4Y|3S|4MO|3X|2P|3L|3T|2Q|2R|3AKS|4X|4Y|3D|4Y|3EAM|3I|4P|3K|3M|3NGR|3ONG|3P|3S|3X|2S|3OL|3R|3W|2T|2U|3ART|3D|3SDT|2V|2X|2YL|4E|2Z|3EN|3U|1U|2BAWU|3S|2CR|2DO|2GAR|2I|3A|3P|2KU|2M|3MER|3O|2N|3C|3DAE|3EX|3I|3NY|3OLD|3V1|2P|3E|4R|5C|2R|3E|3F|3V|2SD|4E|3HI|2TEKU|4R|2ZUME|1VD|2N|2PN|2S|2T|2X|2Y|1WA|3CH|3G|3MP|3P|4P|4Z|3RM|5M|3SH|3Y|2C|3H|2D|3AO|2EAT|3EP|4T|3TH|2FL|3TC|2G|2H|2IFT|3M|3N|4G|3RL|5X|3SE|3TCH|2M|2OLE|3P|3T|2P|3R|4S|2RV|2T|3H|3S|2U|2YFTT|1X|2C|2DT|2M|2P|2S|2UT|1YA|2BC|3L|3TC|2C|2L|3O|2M|2N|3C|4C|4O|3LEV|3R|3TH|3X|2POOL|2S|1ZCB|0T23|199|1AAS|2B|3OO|2C|2D|2F|2GR|2I|3L|3YO|2J|2K|3I|2LAO|3IS|3K|2MA|2N|3G|4O|3K|2O|3NU|2P|3C|3T|2RA|4L|3I|3OT|3P|2S|3H|3TE|2T|3A|3E|3SU|2U|3C|3M|3R|2VA|2X|1BAC|3NK|3R|2B|2C|3C|3X|2E|2IS|2L|2T|3C|2X|1CANDY|3P|3T|2C|2G2|3C|2H|3AIN|3B|3TRX|2NH|3X|2O|2P|2R|2S|2T|2X|2Y|1D|2E|2FB|3Y|2P|2ROP|2S|2X|1EA|3M|2C|3AR|3H|3RA|2D|3DY|2E|3R|2K|2L|3E|3L|4ER|3O|4S|2M|3CO|3P|2N|3D|4IE|3ET|3FI|3NET|3SHI|3T|2P|2R|3A|4R|3N|3RA|3Z|2S|3LA|5I|3T|4A|2T|3HER|4YS|3RA|3U|1FBX|2C|2I|2L|3OW|2S|2T|2UEL|1GAME|2C|3C|2PT|2T|1H|2ALES|2C|2E|39|3CA|3DAO|3MIS|3N|3O|4S|3TA|3X|2G|2ING|2L|2N|3X|2O|3L|3R|2P|2R|3T|3Y|2S|2T|2UG|2X|1I|2A|3NHE|2C|2DAL|3E|2E|2FI|2G|3ER|5C|3RES|2IM|2K|3I|2M|3E|3I|2N|3C|3KU|3U|3Y|2OX|2P|3INU|3S|4Y|2T|3A|4N|5O|5X|3C|3I|3TY|2USD|2X|1KA|2B|2C|2G|2ING|4U|2MN|2N|2O|2P|2R|2S|3T|2T|2X|2Y|1LC|2M|2N|2OS|2P|2W|1ME|3D|2N|3T|2ON|2RW|2T|3G|1N|2B|2C|2DC|2GBL|2S|3R|2T|1OA|3D|2B|2C|2DAY|2K|3A|4U|3C|3E|4N|3KI|3O|3U|2L|2M|3B|3I|3OE|3S|2N|3E|3I|4C|3NEL|3S|3UP|2OB|3LS|3N|4F|2PC|3G|3IA|3N|2R|3E|3G|3I|4I|3N|2S|3A|3C|3DIS|3HE|4I|2T|3EM|3M|3O|2WER|3N|2X|2YBOX|2Z|1P|2AD|3Y|2C|3ASH|2G|2T|2V|2Y|1QRT|1R3|2A|3C|4E|4N|3DE|5X|3ID|3K|3NQ|4S|3T|3VA|3XIA|4X|2B|3T|3V1|2C|3B|3L|3T|2DC|3L|3S|3T|2EAT|3E|4B|3MP|3T|2G|3I|2I|3A|4S|3BE|4L|3CK|3G|3NI|3O|3PAD|3VIA|3X|2K|2L|2MX|2NDZ|2OLL|3P|3SS|3VE|3Y|2P|2R|2SCT|3T|2TL|3T|2U|3CE|3E|3F|3MP|3ST|3TH|2V|3C|3L|2WP|2X|3C|3WIN|2YB|3C|3X|1SA|2C|3T|2D|2E|2F|2G|2HARE|3P|2L|2N|2R|2UGT|3KA|2X|1T|2C|2K|2M|2N|2T|2U|2V|1UBE|2CKER|2DA|2F|2LIP|2NA|3E|2P|2R|3BO|5S|3T|2S|3D|2T|2ZLA|1VK|2NT|2RS|1W|2C|2D|2EE|4TY|3LVE|3P|2IN|3ST|2LV|2OGE|2T|1X|220|2A|3G|3U|2BIT|2G|2L|2T|1YBG|4S|2C|3OON|2PE|2RANT|3ION|2T|1ZC|2KI|0U8D|1AEC|2T|1BA|2C|2DN|2EX|2I|3Q|2Q|2T|3C|2X|3N|3S|3T|1C|2A|3P|3SH|2G|2H|2JL|2N|2O|3IN|3N|3RE|2T|2X|1DO|3O|2T|1EC|2DC|2NC|2T|3L|1FARM|2C|2FYI|2I|2O|3C|2R|2T|1GAS|2C|2OLD|2T|1HP|1IM|2N|2P|2S|1JENNY|1KG|1LT|3C|3GG|3IMA|3RA|2X|1M|2A|3D|3MI|2B|3R|2C|2I|2K|2MA|2O|2T|2X|2Y|1NAT|2B|3NK|2C|3L|3X|2D|3B|3EAD|3G|3X|2F|3I|2I|3BOT|3C|4E|3DX|3FY|3M|3Q|4UE|3T|4ED|4S|4Y|3VRS|3X|2M|3D|2N|2O|3B|2P|2Q|3T|2R|3C|2S|2W|1OP|2S|1P|2C|3G|3O2|4IN|2DOG|2EUR|2I|2LOAD|2O|2P|2R|3O|2S|2TOS|2UNK|3SD|2X|1QC|1R|2AC|3LS|2FA|2O|2QA|2S|2US|2X|1SAT|2C|3C|3OIN|2DA|4P|3B|4C|3C|3D|3E|4BT|4X|3FL|3G|4LO|3H|3I|3J|3K|3M|3N|3O|3P|3Q|3R|3S|4B|3T|4V|4Z|3U|3V|3X|3Y|3Z|2E|2G|2HARK|3I|4BA|2K|2N|3BT|3OTA|2P|3LUS|2T|3C|3X|2V|2X|1T|2BAI|2C|2G|2H|2I|3L|2K|2NP|2T|2U|2X|1USD|2U|1VT|1W3S|2U|1X|2OS|2P|1ZX|0VAAVE|2B|2DA|3ER|2I|3OT|2L|3AS|3I|4D|3OR|3UE|2N|3A|3CAT|3RY|3T|3Y|2PE|3OR|2RA|3IUS|3K|2ULT|1BCH|2ETH|2G|2IT|2K|2NB|3T|2SC|3WAP|2T|3C|1C|2AKE|2F|2G|2HF|2K|2NT|2ORE|2X|1DG|2L|2O|3GE|3T|2R|2V|2X|2Z|1EC|32|2E|3D|3N|2G|3A|4S|3E|2IL|2KTOR|2LA|3O|4D|4X|2MP|2N|3A|3OM|3T|4I|3US|2O|2R|3A|3I|4C|3SA|4E|3TEX|3VE|2ST|2T|3H|3ME|3TER|2UR|2X|3T|1FIL|2OX|2T|1GO|2X|1HC|1I|2A|2B|3E|3LO|2C|3A|3EX|2D|3A|3T|3Y|4A|4X|3Z|2EW|2G|2K|3KY|2M|2N|3CI|3U|2OR|2P|3ER|3S|2RAL|3ES|2S|3IO|5N|3R|2T|3A|4E|4L|3E|3RA|3Y|2U|2VID|3O|2X|2Z|1KNF|1LC|2S|2T|3C|3X|3Y|2UNA|2X|3PAD|1MATIC|2C|2E|2INT|2PX|2S|2T|1NDC|3T|2ES|2LNK|2M|2N|2O|2T|3W|2X|3AU|3LU|2Y|1OCARE|3O|2DKA|2ISE|2L|3LAR|3R|3T|4A|4V1|52|4Z|2NE|2OT|2T|2W|2X|3EL|2Y|3A|1P|2AD|2K|2ND|2P|2R|3C|1R|2A|2C|2GW|2H|2L|2M|2N|2O|3OM|2P|2S|3C|3E|3W|2T|3X|3Y|2X|1SC|2D|2G|2HARE|2L|2O|2P|2TA|2UI|2X|2YS|1T|2C|2G|2HO|2L|2M|2N|2OS|2RO|3X|2S|2U|3SD|2X|2Y|1UC|2LC|2NI|2ZZ|1V|2I|2S|1X|2L|2RP|2T|2V|1YBE|2FI|2NC|1ZT|0W1|22|12E|13C|2M|2S|2W|18BIT|1AB|3I|2CO|2D|3A|2G|3E|3G|3MI|5T|3ON|2I|3F|4U|3T|2L|3K|3LET|4Y|3V|2M|3PL|2N|3A|3D|3NA|2R|3P|4ED|3S|2S|3ABI|3H|3SIE|3TR|2TER|2VES|2XE|3L|3P|2Y|1BB|3C|2CH|2ESC|3T|4H|2IND|2N|3B|2OND|4ES|2S|2T|3C|2X|1CA|3NTO|2C|3X|2ELL|4O|2FG|2G|2OIN|3RE|2S|3OV|2T|2USD|1DC|2OG|4E|3T|2R|2X|1E|2ALTH|3PON|3R|2B|33|34|35|3AI|3C|3D|2C|3O|2D|2ETH|2FI|2GEN|3LD|2LA|3D|3L|3T|3UPS|2MIX|2N|2OS|2ST|2T|3H|4V1|4W|2VE|2WE|2X|3O|1FAI|2IL|2LOW|2O|2T|2USE|2X|1GC|2HOST|2L|2O|2P|2R|3T|2T|1HALE|5S|2BAR|2EAT|3E|4L|3N|3X|2IRL|3TE|2L|2O|3REN|2T|2X|1IB|2C|3C|2F|3I|3S|4A|2GO|2KEN|3I|2LC|3D|4C|2N|3E|3G|4S|3K|3N|3R|4Y|3T|4ER|2OTX|2S|3C|3E|3H|3TA|2T|3CH|2X|1JEWEL|2XN|1KAVA|2C|2D|1LD|2F|2ITI|2K|3N|2O|2UNA|4C|2XT|1MATIC|2B|2C|2EMO|2F|2NT|2OXY|2T|2W|2X|3WOM|1NCG|2D|3R|2EAR|3ON|3T|2K|2RZ|2T|2XM|2YC|2Z|1OA|2D|2FM|2ID|2J|3AK|52|2KT|2L|3F|4OF|4Y|2M|3B|4AT|3E|4N|3I|2N|3DER|3E|2O|3D|3F|4Y|3L|3NK|3O|4OO|3P|2P|2R|3K|3LD|3M|3X|2W|3S|2ZX|1PC|2E|2I|2LS|2OKT|2P|2R|1QT|1RC|2K|2LD|2ONG|3SE|2T|2X|2Z|1SB|3ABY|3S|2CRT|2DOGE|2G|2HIB|2I|2M|2PP|2TETH|3OR|3R|2X|1T|2AO|2C|2F|3T|3UEL|2G|2K|2L|2N|2ON|2T|2WOOL|1UST|1WB|2D|3OGE|2EMIX|2F|2Y|1X|2DAI|2T|3Z|1YNN|2S|1ZEC|3NIQ|2M|2RD|0X2|2Y2|142|17C|2DAO|2R|18X|1ACT|2H|2I|2MP|2NK|2P|2R|2S|2T|2UC|3R|3T|2VA|2YA|1BASE|2B|2C|2E|2G|2I|2L|2N|2OND|3T|2P|2S|2T|3C|3S|2X|2Y|1C|2AD|3L|3SH|4TR|2E|3L|3PT|2F|3X|2G|2H|3F|2I|2LR|2M|2N|2O|3M|2P|3O|2R|3E|3X|2T|2UR|2V|2XT|1D|2AG|3I|3O|3TA|2B|2C|3E|2EF2|4I|3N|2G|2N|3A|2OGE|3T|2P|2Q|1EC|2D|2L|3S|2M|2N|3D|3IX|3O|2P|2RS|2S|2T|3A|3H|1FC|2I|3T|2LOKI|2T|3C|2UND|2YI|1G|2B|2C|2EM|2LI|2OLD|2PT|2R|2T|1HI|2T|2V|1I|2ASI|2D|3O|3R|2L|2N|3U|2O|3S|3T|2V|1JEWEL|2O|1KI|1LA|3B|2B|2C|2D|2M|2N|2Q|2R|2T|1MARK|3S|2C|3C|2ETA|2G|2N|2O|3N|2P|2R|3G|2S|2T|2V|2X|2Y|1NA|2B|2C|2FT|2G|2K|2L|2N|2O|2S|2T|2V|2X|1ODEX|2LO|2R|2T|2V|2X|1P|2A|3T|3Y|2B|2C|2D|2E|3T|2H|3X|2L|3A|3L|2M|2N|3D|3ET|2O|3KE|2R|3ESS|3O|4T|3T|2S|3T|2T|3P|3X|2X|2Y|1QC|2N|2R|2UOK|1RA|3I|3Y|2C|2D|2E|2ISE|2L|3M|2P|32|40|3C|3H|2T|2UN|4E|1SAUCE|2C|2D|2EED|2GD|2H|3IB|2I|2LR|2N|2P|3C|3EC|3T|2R|2T|3AR|3C|2USHI|1T|23|2AG|3L|2C|2K|2M|2O|2P|2R|3A|3EME|2TB20|2USD|2X|2Z|1UC|2I|2N|2P|3S|1VC|2E|2G|2P|2R|2S|1WC|2G|2IN|2P|2T|1X|2A|2X|1Y|2M|2O|2Z|0Y2K|1AC|3HT|2E|2G|2K|3S|3U|2M|3A|3V1|42|2OYAO|2P|2RL|2W|2XIS|2Y|1BC|2O|1CC|2E|2O|2T|1DF|2OGE|2R|1EC|2E|3D|2FI|2L|2ON|2S|3P|2TI|3U|1FARM|2BETA|3T|2DAI|2F|3C|3I|4I|2I|3E|3I|4I|3VE|2L|2O|2PRO|2TE|2V|2X|1GG|1IELD|5X|2KES|2N|3BI|1LC|2D|3Y|1MC|2S|1O|2BASE|2C|3O|2D|2LO|2OSHI|2P|2SHI|2TD|3O|2U|3C|3RAI|2VI|2YOW|1PIE|1SAFE|2EC|2R|1TA|2N|1U|2ANG|2CJ|3T|2DI|2GE|2KI|3KY|2M|3MI|4Y|2P|2RI|2SE|2ZU|1VS|1YAVAX|2E|2FI|0Z3|1ABAKU|2FI|2I|3F|2M|3ZAM|2NO|2P|2RP|3X|2SH|2T|1B|2C|2IT|2U|1CC|31|2G|2HN|2L|2N|2O|3N|3R|2R|2ULT|2X|1DEX|2R|1EC|3D|2D|3X|2E|2FI|3U|2IT|2L|3IX|2N|3C|3F|3I|4Q|4TH|2ON|2P|3H|2R|3O|4B|4EX|2S|3T|2T|32|3A|3RIX|2UM|3S|2XI|1F|2L|2M|1GD|2EM|1IG|2K|2L|2NC|3U|2P|3T|2RVE|2X|2ZY|1JLT|1K|2BOB|2DOGE|2F|2HIVE|2ID|2LAB|2ML|2P|3AD|3EPE|2S|3HIB|3P|2T|2Z|1LA|2DA|2K|2OT|2Q|2W|1MBE|2N|2T|1ND|2E|2N|2T|2X|2Y|2Z|1OA|2C|2DI|2E|2I|2NE|3O|3X|2O|3M|4ER|3N|3T|2RA|3O|3T|1P|2AE|3Y|2C|2R|3O|2T|3C|1RC|2O|2X|1SC|2E|1T|2C|2G|2X|1UC|2KI|2M|2NA|2R|3R|2SD|2T|2ZALU|3UAI|1VC|1WAP|1XC|2T|1YD|2N|2R|3O|2TARA|1Z|2C|2Z","sep":"|"}]},{"id":"fr-covid-19-reference-7c87a7","columns":["combined key","iso3","province state"],"n":4316,"cols":[{"f":"0Belgium|0Antwerp, Belgium|0Limburg, Belgium|0Unknown, Belgium|0Brazil|0Acre, Brazil|1mazonas, Brazil|0Chile|0Antofagasta, Chile|0Colombia|0Amazonas, Colombia|0Germany|0Baden-Wurttemberg, Germany|0India|0Andaman and Nicobar Islands, India|0Punjab, India|0Italy|0Abruzzo, Italy|0Japan|0Aichi, Japan|0Malaysia|0Johor, Malaysia|0Mexico|0Aguascalientes, Mexico|0Moldova|0Anenii Noi, Moldova|0Calarasi, Moldova|0Netherlands|0Drenthe, Netherlands|0Nigeria|0Abia, Nigeria|0Pakistan|0Azad Jammu and Kashmir, Pakistan|0Peru|0Amazonas, Peru|0Poland|0Dolnoslaskie, Poland|0Romania|0Alba, Romania|0Russia|0Adygea Republic, Russia|0Slovakia|0Banska Bystrica, Slovakia|0Spain|0Andalusia, Spain|0Sweden|0Blekinge, Sweden|0Ukraine|0Cherkasy Oblast, Ukraine|0United Kingdom|0England, United Kingdom|0Australia|9n Capital Territory, Australia|0Canada|0Alberta, Canada|0Diamond Princess, Canada|0Grand Princess, Canada|0Recovered, Canada|0China|0Anhui, China|0US|0Puerto Rico, US|0Diamond Princess, US|0Alabama, US|3ska, US|1rizona, US|2kansas, US|0California, US|1olorado, US|2nnecticut, US|0Delaware, US|1istrict of Columbia, US|0Florida, US|0Georgia, US|0Hawaii, US|0Idaho, US|1llinois, US|1ndiana, US|1owa, US|0Kansas, US|1entucky, US|0Louisiana, US|0Maine, US|2ryland, US|2ssachusetts, US|1ichigan, US|2nnesota, US|2ssissippi, US|4ouri, US|1ontana, US|0Nebraska, US|2vada, US|2w Hampshire, US|4Jersey, US|4Mexico, US|4York, US|1orth Carolina, US|6Dakota, US|0Ohio, US|1klahoma, US|1regon, US|0Pennsylvania, US|0Rhode Island, US|0South Carolina, US|6Dakota, US|0Tennessee, US|2xas, US|0Utah, US|0Vermont, US|1irginia, US|0Washington, US|1est Virginia, US|1isconsin, US|1yoming, US|0Air Force, US Military, US|0Inmates, Federal Bureau of Prisons, US|0Diamond Princess|0MS Zaandam|0Summer Olympics 2020|0Winter Olympics 2022|0Aruba, Netherlands|1fghanistan|1ngola|3uilla, United Kingdom|1lbania|1ndorra|0United Arab Emirates|0Argentina|2menia|1merican Samoa, US|1ntarctica|3igua and Barbuda|0New South Wales, Australia|1orthern Territory, Australia|0Queensland, Australia|0South Australia, Australia|0Tasmania, Australia|0Victoria, Australia|0Western Australia, Australia|0Austria|1zerbaijan|0Burundi|1russels, Belgium|0East Flanders, Belgium|0Flemish Brabant, Belgium|0Hainaut, Belgium|0Liege, Belgium|1uxembourg, Belgium|0Namur, Belgium|0Walloon Brabant, Belgium|1est Flanders, Belgium|0Benin|1onaire, Sint Eustatius and Saba, Netherlands|1urkina Faso|1angladesh|1ulgaria|1ahrain|3amas|1osnia and Herzegovina|0Saint Barthelemy, France|0Belarus|3ize|2rmuda, United Kingdom|1olivia|0Alagoas, Brazil|1mapa, Brazil|0Bahia, Brazil|0Ceara, Brazil|0Distrito Federal, Brazil|0Espirito Santo, Brazil|0Goias, Brazil|0Maranhao, Brazil|2to Grosso do Sul, Brazil|b, Brazil|1inas Gerais, Brazil|0Para, Brazil|4iba, Brazil|4na, Brazil|1ernambuco, Brazil|1iaui, Brazil|0Rio Grande do Norte, Brazil|eSul, Brazil|4de Janeiro, Brazil|1ondonia, Brazil|2raima, Brazil|0Santa Catarina, Brazil|2o Paulo, Brazil|1ergipe, Brazil|0Tocantins, Brazil|0Unknown, Brazil|0Barbados|1runei|1hutan|1otswana|0Central African Republic|0British Columbia, Canada|0Manitoba, Canada|0New Brunswick, Canada|3foundland and Labrador, Canada|1orthwest Territories,Canada|2va Scotia, Canada|1unavut, Canada|0Ontario, Canada|0Prince Edward Island, Canada|0Quebec, Canada|0Saskatchewan, Canada|0Yukon, Canada|0Switzerland|0Araucania, Chile|2ica y Parinacota, Chile|1tacama, Chile|1ysen, Chile|0Biobio, Chile|0Coquimbo, Chile|0Los Lagos, Chile|4Rios, Chile|0Magallanes, Chile|2ule, Chile|1etropolitana, Chile|0Nuble, Chile|0OHiggins, Chile|0Tarapaca, Chile|0Unknown, Chile|0Valparaiso, Chile|0Beijing, China|0Chongqing, China|0Fujian, China|0Gansu, China|1uangdong, China|5xi, China|2izhou, China|0Hainan, China|1ebei, China|2ilongjiang, China|2nan, China|1ubei, China|2nan, China|0Inner Mongolia, China|0Jiangsu, China|5xi, China|2lin, China|0Liaoning, China|0Ningxia, China|0Qinghai, China|0Shaanxi, China|3ndong, China|4ghai, China|4xi, China|1ichuan, China|0Tianjin, China|2bet, China|0Unknown, China|0Xinjiang, China|0Yunnan, China|0Zhejiang, China|0Cote d'Ivoire|1ameroon|1ongo (Kinshasa)|7Brazzaville)|2ok Islands, New Zealand|0Antioquia, Colombia|1rauca, Colombia|1tlantico, Colombia|0Bolivar, Colombia|2yaca, Colombia|0Caldas, Colombia|2pital District, Colombia|2queta, Colombia|2sanare, Colombia|2uca, Colombia|1esar, Colombia|1hoco, Colombia|1ordoba, Colombia|1undinamarca, Colombia|0Guainia, Colombia|3viare, Colombia|0Huila, Colombia|0La Guajira, Colombia|0Magdalena, Colombia|1eta, Colombia|0Narino, Colombia|1orte de Santander, Colombia|0Putumayo, Colombia|0Quindio, Colombia|0Risaralda, Colombia|0San Andres y Providencia, Colombia|3tander, Colombia|1ucre, Colombia|0Tolima, Colombia|0Unknown, Colombia|0Valle del Cauca, Colombia|2upes, Colombia|1ichada, Colombia|0Comoros|1abo Verde|1osta Rica|1uba|2racao, Netherlands|1ayman Islands, United Kingdom|1yprus|1zechia|0Bayern, Germany|1erlin, Germany|1randenburg, Germany|2emen, Germany|0Hamburg, Germany|1essen, Germany|0Mecklenburg-Vorpommern, Germany|0Niedersachsen, Germany|1ordrhein-Westfalen, Germany|0Rheinland-Pfalz, Germany|0Saarland, Germany|2chsen, Germany|7-Anhalt, Germany|1chleswig-Holstein, Germany|0Thuringen, Germany|0Unknown, Germany|0Djibouti|1ominica|1enmark|1ominican Republic|0Algeria|0Ecuador|1gypt|1ritrea|0Western Sahara|0Aragon, Spain|1sturias, Spain|0Baleares, Spain|0C. Valenciana, Spain|1anarias, Spain|3tabria, Spain|2stilla - La Mancha, Spain|9y Leon, Spain|2talonia, Spain|1euta, Spain|0Extremadura, Spain|0Galicia, Spain|0La Rioja, Spain|0Madrid, Spain|1elilla, Spain|1urcia, Spain|0Navarra, Spain|0Pais Vasco, Spain|0Unknown, Spain|0Estonia|1thiopia|0Finland|2ji|1alkland Islands (Malvinas), United Kingdom|1rance|1aroe Islands, Denmark|0Micronesia|0Gabon|0Channel Islands, United Kingdom|0Northern Ireland, United Kingdom|0Scotland, United Kingdom|0Unknown, United Kingdom|0Wales, United Kingdom|0Georgia|1uernsey, United Kingdom|1hana|1ibraltar, United Kingdom|1uinea|2adeloupe, France|1ambia|1uinea-Bissau|0Equatorial Guinea|0Greece|3nada|3enland, Denmark|1uatemala|0French Guiana, France|0Guam, US|2yana|0Hong Kong, China|3duras|0Croatia|0Haiti|1ungary|0Indonesia|1sle of Man, United Kingdom|0Andhra Pradesh, India|1runachal Pradesh, India|1ssam, India|0Bihar, India|0Chandigarh, India|2hattisgarh, India|0Dadra and Nagar Haveli and Daman and Diu, India|1elhi, India|0Goa, India|1ujarat, India|0Haryana, India|1imachal Pradesh, India|0Jammu and Kashmir, India|1harkhand, India|0Karnataka, India|1erala, India|0Ladakh, India|2kshadweep, India|0Madhya Pradesh, India|2harashtra, India|2nipur, India|1eghalaya, India|1izoram, India|0Nagaland, India|0Odisha, India|0Puducherry, India|0Rajasthan, India|0Sikkim, India|0Tamil Nadu, India|1elangana, India|1ripura, India|0Unknown, India|1ttar Pradesh, India|5akhand, India|0West Bengal, India|0Ireland|2an|3q|1celand|1srael|0Basilicata, Italy|0Calabria, Italy|2mpania, Italy|0Emilia-Romagna, Italy|0Friuli Venezia Giulia, Italy|0Lazio, Italy|1iguria, Italy|1ombardia, Italy|0Marche, Italy|1olise, Italy|0P.A. Bolzano, Italy|5Trento, Italy|1iemonte, Italy|1uglia, Italy|0Sardegna, Italy|1icilia, Italy|0Toscana, Italy|0Umbria, Italy|0Valle d'Aosta, Italy|1eneto, Italy|0Jamaica|1ersey, United Kingdom|1ordan|0Akita, Japan|1omori, Japan|0Chiba, Japan|0Ehime, Japan|0Fukui, Japan|4oka, Japan|4shima, Japan|0Gifu, Japan|1unma, Japan|0Hiroshima, Japan|1okkaido, Japan|1yogo, Japan|0Ibaraki, Japan|1shikawa, Japan|1wate, Japan|0Kagawa, Japan|3oshima, Japan|2nagawa, Japan|1ochi, Japan|1umamoto, Japan|1yoto, Japan|0Mie, Japan|2yagi, Japan|4zaki, Japan|0Nagano, Japan|4saki, Japan|2ra, Japan|1iigata, Japan|0Oita, Japan|1kayama, Japan|2inawa, Japan|1saka, Japan|0Port Quarantine, Japan|0Saga, Japan|2itama, Japan|1higa, Japan|3mane, Japan|3zuoka, Japan|0Tochigi, Japan|2kushima, Japan|3yo, Japan|2ttori, Japan|2yama, Japan|0Unknown, Japan|0Wakayama, Japan|0Yamagata, Japan|5uchi, Japan|4nashi, Japan|0Kazakhstan|1enya|1yrgyzstan|0Cambodia|0Kiribati|0Saint Kitts and Nevis|0Korea, South|1uwait|0Laos|1ebanon|1iberia|3ya|0Saint Lucia|0Liechtenstein|0Sri Lanka|0Lesotho|1ithuania|1uxembourg|1atvia|0Macau, China|0St Martin, France|0Morocco|2naco|0Balti, Moldova|2sarabeasca, Moldova|1ender, Moldova|1riceni, Moldova|0Cahul, Moldova|2menca, Moldova|2ntemir, Moldova|2useni, Moldova|1eadir-Lunga, Moldova|1hisinau, Moldova|1imislia, Moldova|1omrat, Moldova|1riuleni, Moldova|0Donduseni, Moldova|1rochia, Moldova|1ubasari, Moldova|0Edinet, Moldova|0Falesti, Moldova|1loresti, Moldova|0Glodeni, Moldova|1rigoriopol, Moldova|0Hincesti, Moldova|0Ialoveni, Moldova|0Leova, Moldova|0Nisporeni, Moldova|0Ocnita, Moldova|1rhei, Moldova|0Rezina, Moldova|1ibnita, Moldova|2scani, Moldova|0Singerei, Moldova|1lobozia, Moldova|1oldanesti, Moldova|2roca, Moldova|1tefan Voda, Moldova|2raseni, Moldova|0Taraclia, Moldova|1elenesti, Moldova|1iraspol, Moldova|1ransnistria, Moldova|0Ungheni, Moldova|2known, Moldova|0Vulcanesti, Moldova|0Madagascar|2ldives|0Baja California Sur, Mexico|f, Mexico|0Campeche, Mexico|1hiapas, Mexico|3huahua, Mexico|1iudad de Mexico, Mexico|1oahuila, Mexico|2lima, Mexico|0Durango, Mexico|0Guanajuato, Mexico|2errero, Mexico|0Hidalgo, Mexico|0Jalisco, Mexico|0Mexico, Mexico|1ichoacan, Mexico|1orelos, Mexico|0Nayarit, Mexico|1uevo Leon, Mexico|0Oaxaca, Mexico|0Puebla, Mexico|0Queretaro, Mexico|2intana Roo, Mexico|0San Luis Potosi, Mexico|1inaloa, Mexico|1onora, Mexico|0Tabasco, Mexico|2maulipas, Mexico|1laxcala, Mexico|0Unknown, Mexico|0Veracruz, Mexico|0Yucatan, Mexico|0Zacatecas, Mexico|0Marshall Islands|0North Macedonia|0Mali|3ta|0Burma|0Montenegro|3golia|0Northern Mariana Islands, US|0Mozambique|1auritania|1ontserrat, United Kingdom|1artinique, France|2uritius|2lawi|0Kedah, Malaysia|2lantan, Malaysia|0Melaka, Malaysia|0Negeri Sembilan, Malaysia|0Pahang, Malaysia|1erak, Malaysia|3lis, Malaysia|1ulau Pinang, Malaysia|0Sabah, Malaysia|2rawak, Malaysia|1elangor, Malaysia|0Terengganu, Malaysia|0Unknown, Malaysia|0W.P. Kuala Lumpur, Malaysia|5Labuan, Malaysia|5Putrajaya, Malaysia|0Mayotte, France|0Namibia|1ew Caledonia, France|1iger|0Adamawa, Nigeria|1kwa Ibom, Nigeria|1nambra, Nigeria|0Bauchi, Nigeria|2yelsa, Nigeria|1enue, Nigeria|1orno, Nigeria|0Cross River, Nigeria|0Delta, Nigeria|0Ebonyi, Nigeria|1do, Nigeria|1kiti, Nigeria|1nugu, Nigeria|0Federal Capital Territory, Nigeria|0Gombe, Nigeria|0Imo, Nigeria|0Jigawa, Nigeria|0Kaduna, Nigeria|2no, Nigeria|2tsina, Nigeria|1ebbi, Nigeria|1ogi, Nigeria|1wara, Nigeria|0Lagos, Nigeria|0Nasarawa, Nigeria|1iger, Nigeria|0Ogun, Nigeria|1ndo, Nigeria|1sun, Nigeria|1yo, Nigeria|0Plateau, Nigeria|0Rivers, Nigeria|0Sokoto, Nigeria|0Taraba, Nigeria|0Unknown, Nigeria|0Yobe, Nigeria|0Zamfara, Nigeria|0Nicaragua|0Flevoland, Netherlands|1riesland, Netherlands|0Gelderland, Netherlands|1roningen, Netherlands|0Limburg, Netherlands|0Noord-Brabant, Netherlands|6Holland, Netherlands|0Overijssel, Netherlands|0Unknown, Netherlands|1trecht, Netherlands|0Zeeland, Netherlands|1uid-Holland, Netherlands|0Norway|1epal|2w Zealand|0Oman|0Balochistan, Pakistan|0Gilgit-Baltistan, Pakistan|0Islamabad, Pakistan|0Khyber Pakhtunkhwa, Pakistan|0Punjab, Pakistan|0Sindh, Pakistan|0Unknown, Pakistan|0Panama|0Ancash, Peru|1purimac, Peru|1requipa, Peru|1yacucho, Peru|0Cajamarca, Peru|2llao, Peru|1usco, Peru|0Huancavelica, Peru|4uco, Peru|0Ica, Peru|0Junin, Peru|0La Libertad, Peru|2mbayeque, Peru|1ima, Peru|1oreto, Peru|0Madre de Dios, Peru|1oquegua, Peru|0Pasco, Peru|1iura, Peru|1uno, Peru|0San Martin, Peru|0Tacna, Peru|1umbes, Peru|0Ucayali, Peru|1nknown, Peru|0Philippines|1alau|2pua New Guinea|0Kujawsko-pomorskie, Poland|0Lodzkie, Poland|1ubelskie, Poland|3uskie, Poland|0Malopolskie, Poland|2zowieckie, Poland|0Opolskie, Poland|0Podkarpackie, Poland|3laskie, Poland|2morskie, Poland|0Slaskie, Poland|1wietokrzyskie, Poland|0Unknown, Poland|0Warminsko-mazurskie, Poland|1ielkopolskie, Poland|0Zachodniopomorskie, Poland|0Adjuntas, Puerto Rico, US|1guada, Puerto Rico, US|5illa, Puerto Rico, US|4s Buenas, Puerto Rico, US|1ibonito, Puerto Rico, US|1nasco, Puerto Rico, US|1recibo, Puerto Rico, US|2royo, Puerto Rico, US|0Barceloneta, Puerto Rico, US|3ranquitas, Puerto Rico, US|2yamon, Puerto Rico, US|0Cabo Rojo, Puerto Rico, US|2guas, Puerto Rico, US|2muy, Puerto Rico, US|2novanas, Puerto Rico, US|2rolina, Puerto Rico, US|2tano, Puerto Rico, US|2yey, Puerto Rico, US|1eiba, Puerto Rico, US|1iales, Puerto Rico, US|2dra, Puerto Rico, US|1oamo, Puerto Rico, US|2merio, Puerto Rico, US|2rozal, Puerto Rico, US|1ulebra, Puerto Rico, US|0Dorado, Puerto Rico, US|0Fajardo, Puerto Rico, US|1lorida, Puerto Rico, US|0Guanica, Puerto Rico, US|3yama, Puerto Rico, US|5nilla, Puerto Rico, US|4nabo, Puerto Rico, US|2rabo, Puerto Rico, US|0Hatillo, Puerto Rico, US|1ormigueros, Puerto Rico, US|1umacao, Puerto Rico, US|0Isabela, Puerto Rico, US|0Jayuya, Puerto Rico, US|1uana Diaz, Puerto Rico, US|2ncos, Puerto Rico, US|0Lajas, Puerto Rico, US|2res, Puerto Rico, US|2s Marias, Puerto Rico, US|4Piedras, Puerto Rico, US|1oiza, Puerto Rico, US|1uquillo, Puerto Rico, US|0Manati, Puerto Rico, US|2ricao, Puerto Rico, US|2unabo, Puerto Rico, US|2yaguez, Puerto Rico, US|1oca, Puerto Rico, US|2rovis, Puerto Rico, US|0Naguabo, Puerto Rico, US|2ranjito, Puerto Rico, US|0Orocovis, Puerto Rico, US|1ut of PR, Puerto Rico, US|0Patillas, Puerto Rico, US|1enuelas, Puerto Rico, US|1once, Puerto Rico, US|0Quebradillas, Puerto Rico, US|0Rincon, Puerto Rico, US|2o Grande, Puerto Rico, US|0Sabana Grande, Puerto Rico, US|2linas, Puerto Rico, US|2n German, Puerto Rico, US|4Juan, Puerto Rico, US|4Lorenzo, Puerto Rico, US|4Sebastian, Puerto Rico, US|3ta Isabel, Puerto Rico, US|0Toa Alta, Puerto Rico, US|4Baja, Puerto Rico, US|1rujillo Alto, Puerto Rico, US|0Unassigned, Puerto Rico, US|1tuado, Puerto Rico, US|0Vega Alta, Puerto Rico, US|5Baja, Puerto Rico, US|1ieques, Puerto Rico, US|2llalba, Puerto Rico, US|0Yabucoa, Puerto Rico, US|2uco, Puerto Rico, US|0Portugal|1araguay|0West Bank and Gaza|0French Polynesia, France|0Qatar|0Reunion, France|0Arad, Romania|2ges, Romania|0Bacau, Romania|1ihor, Romania|2strita-Nasaud, Romania|1otosani, Romania|1raila, Romania|3sov, Romania|1ucuresti, Romania|2zau, Romania|0Calarasi, Romania|2ras-Severin, Romania|1luj, Romania|1onstanta, Romania|2vasna, Romania|0Dambovita, Romania|1olj, Romania|0Galati, Romania|1iurgiu, Romania|1orj, Romania|0Harghita, Romania|1unedoara, Romania|0Ialomita, Romania|2si, Romania|1lfov, Romania|0Maramures, Romania|1ehedinti, Romania|1ures, Romania|0Neamt, Romania|0Olt, Romania|0Prahova, Romania|0Salaj, Romania|2tu Mare, Romania|1ibiu, Romania|1uceava, Romania|0Teleorman, Romania|1imis, Romania|1ulcea, Romania|0Unknown, Romania|0Valcea, Romania|2slui, Romania|1rancea, Romania|0Altai Krai, Russia|6Republic, Russia|1mur Oblast, Russia|1rkhangelsk Oblast, Russia|1strakhan Oblast, Russia|0Bashkortostan Republic, Russia|1elgorod Oblast, Russia|1ryansk Oblast, Russia|1uryatia Republic, Russia|0Chechen Republic, Russia|3lyabinsk Oblast, Russia|2ukotka Autonomous Okrug, Russia|3vashia Republic, Russia|0Dagestan Republic, Russia|0Ingushetia Republic, Russia|1rkutsk Oblast, Russia|1vanovo Oblast, Russia|0Jewish Autonomous Okrug, Russia|0Kabardino-Balkarian Republic, Russia|2liningrad Oblast, Russia|3mykia Republic, Russia|3uga Oblast, Russia|2mchatka Krai, Russia|2rachay-Cherkess Republic, Russia|3elia Republic, Russia|1emerovo Oblast, Russia|1habarovsk Krai, Russia|3kassia Republic, Russia|3nty-Mansi Autonomous Okrug, Russia|1irov Oblast, Russia|1omi Republic, Russia|2stroma Oblast, Russia|1rasnodar Krai, Russia|6yarsk Krai, Russia|1urgan Oblast, Russia|3sk Oblast, Russia|0Leningrad Oblast, Russia|1ipetsk Oblast, Russia|0Magadan Oblast, Russia|2ri El Republic, Russia|1ordovia Republic, Russia|2scow Oblast, Russia|6, Russia|1urmansk Oblast, Russia|0Nenets Autonomous Okrug, Russia|1izhny Novgorod Oblast, Russia|1orth Ossetia - Alania Republic, Russia|2vgorod Oblast, Russia|3osibirsk Oblast, Russia|0Omsk Oblast, Russia|1rel Oblast, Russia|3nburg Oblast, Russia|0Penza Oblast, Russia|2rm Krai, Russia|1rimorsky Krai, Russia|1skov Oblast, Russia|0Rostov Oblast, Russia|1yazan Oblast, Russia|0Saint Petersburg, Russia|2kha (Yakutiya) Republic, Russia|5lin Oblast, Russia|2mara Oblast, Russia|2ratov Oblast, Russia|1molensk Oblast, Russia|1tavropol Krai, Russia|1verdlovsk Oblast, Russia|0Tambov Oblast, Russia|2tarstan Republic, Russia|1omsk Oblast, Russia|1ula Oblast, Russia|1ver Oblast, Russia|1yumen Oblast, Russia|2va Republic, Russia|0Udmurt Republic, Russia|1lyanovsk Oblast, Russia|1nknown, Russia|0Vladimir Oblast, Russia|1olgograd Oblast, Russia|3ogda Oblast, Russia|2ronezh Oblast, Russia|0Yamalo-Nenets Autonomous Okrug, Russia|2roslavl Oblast, Russia|0Zabaykalsky Krai, Russia|0Rwanda|0Saudi Arabia|1udan|1enegal|1ingapore|1aint Helena, Ascension and Tristan da Cunha, United Kingdom|1olomon Islands|1ierra Leone|0El Salvador|0San Marino|1omalia|1aint Pierre and Miquelon, France|1erbia|1outh Sudan|1ao Tome and Principe|1uriname|0Bratislava, Slovakia|0Kosice, Slovakia|0Nitra, Slovakia|0Presov, Slovakia|0Trencin, Slovakia|2nava, Slovakia|0Unknown, Slovakia|0Zilina, Slovakia|0Slovenia|0Dalarna, Sweden|0Gavleborg, Sweden|1otland, Sweden|0Halland, Sweden|0Jamtland Harjedalen, Sweden|1onkoping, Sweden|0Kalmar, Sweden|1ronoberg, Sweden|0Norrbotten, Sweden|0Orebro, Sweden|1stergotland, Sweden|0Skane, Sweden|1ormland, Sweden|1tockholm, Sweden|0Unknown, Sweden|1ppsala, Sweden|0Varmland, Sweden|2sterbotten, Sweden|6norrland, Sweden|4manland, Sweden|4ra Gotaland, Sweden|0Eswatini|0Sint Maarten, Netherlands|1eychelles|1yria|0Turks and Caicos Islands, United Kingdom|0Chad|0Togo|1hailand|1ajikistan|1imor-Leste|1onga|1rinidad and Tobago|1unisia|2rkey|1aiwan*|2nzania|0Uganda|0Chernihiv Oblast, Ukraine|6vtsi Oblast, Ukraine|1rimea Republic*, Ukraine|0Dnipropetrovsk Oblast, Ukraine|1onetsk Oblast, Ukraine|0Ivano-Frankivsk Oblast, Ukraine|0Kharkiv Oblast, Ukraine|2erson Oblast, Ukraine|2melnytskyi Oblast, Ukraine|1iev Oblast, Ukraine|4, Ukraine|2rovohrad Oblast, Ukraine|0Luhansk Oblast, Ukraine|1viv Oblast, Ukraine|0Mykolaiv Oblast, Ukraine|0Odessa Oblast, Ukraine|0Poltava Oblast, Ukraine|0Rivne Oblast, Ukraine|0Sevastopol*, Ukraine|1umy Oblast, Ukraine|0Ternopil Oblast, Ukraine|0Unknown, Ukraine|0Vinnytsia Oblast, Ukraine|1olyn Oblast, Ukraine|0Zakarpattia Oblast, Ukraine|2porizhia Oblast, Ukraine|1hytomyr Oblast, Ukraine|0Uruguay|0Abbeville, South Carolina, US|1cadia, Louisiana, US|2comack, Virginia, US|1da, Idaho, US|3ir, Iowa, US|7Kentucky, US|7Missouri, US|7Oklahoma, US|3ms, Colorado, US|7Idaho, US|8llinois, US|8ndiana, US|8owa, US|7Mississippi, US|7Nebraska, US|8orth Dakota, US|7Ohio, US|7Pennsylvania, US|7Washington, US|8isconsin, US|2dison, Vermont, US|1iken, South Carolina, US|2tkin, Minnesota, US|1lachua, Florida, US|3mance, North Carolina, US|4eda, California, US|4osa, Colorado, US|2bany, New York, US|8Wyoming, US|3emarle, Virginia, US|2cona, Michigan, US|4rn, Mississippi, US|2eutians East, Alaska, US|aWest, Alaska, US|3xander, Illinois, US|bNorth Carolina, US|7ria, Virginia, US|2falfa, Oklahoma, US|2ger, Michigan, US|2lamakee, Iowa, US|3egan, Michigan, US|7y, Maryland, US|aNew York, US|5hany, North Carolina, US|bVirginia, US|6eny, Pennsylvania, US|4n, Indiana, US|7Kansas, US|8entucky, US|7Louisiana, US|7Ohio, US|5dale, South Carolina, US|2pena, Michigan, US|3ine, California, US|1mador, California, US|2elia, Virginia, US|2herst, Virginia, US|2ite, Mississippi, US|1nchorage, Alaska, US|2derson, Kansas, US|bentucky, US|aSouth Carolina, US|aTennessee, US|cxas, US|3rew, Missouri, US|6s, Texas, US|4oscoggin, Maine, US|2gelina, Texas, US|2ne Arundel, Maryland, US|2oka, Minnesota, US|2son, North Carolina, US|2telope, Nebraska, US|3rim, Michigan, US|1pache, Arizona, US|2panoose, Iowa, US|3ling, Georgia, US|3omattox, Virginia, US|1ransas, Texas, US|3pahoe, Colorado, US|2cher, Texas, US|4uleta, Colorado, US|2enac, Michigan, US|2kansas, Arkansas, US|2lington, Virginia, US|2mstrong, Pennsylvania, US|bTexas, US|3y, US Military, US|2oostook, Maine, US|2thur, Nebraska, US|1scension, Louisiana, US|2he, North Carolina, US|3land, Ohio, US|9Wisconsin, US|4ey, Arkansas, US|3tabula, Ohio, US|2otin, Washington, US|2sumption, Louisiana, US|1tascosa, Texas, US|2chison, Kansas, US|aMissouri, US|2hens, Ohio, US|2kinson, Georgia, US|2lantic, New Jersey, US|2oka, Oklahoma, US|2tala, Mississippi, US|1udrain, Missouri, US|3ubon, Iowa, US|2glaize, Ohio, US|3usta, Virginia, US|2rora, South Dakota, US|2stin, Texas, US|2tauga, Alabama, US|1very, North Carolina, US|2oyelles, Louisiana, US|0Baca, Colorado, US|3on, Georgia, US|2iley, Texas, US|2ker, Florida, US|7Georgia, US|7Oregon, US|2ldwin, Alabama, US|9Georgia, US|3lard, Kentucky, US|3timore City, Maryland, US|9, Maryland, US|2mberg, South Carolina, US|2ndera, Texas, US|3ks, Georgia, US|3ner, Nebraska, US|4ock, Idaho, US|2raga, Michigan, US|3ber, Kansas, US|4our, Alabama, US|9West Virginia, US|3nes, North Dakota, US|4stable, Massachusetts, US|4well, South Carolina, US|3ren, Kentucky, US|4on, Wisconsin, US|5w, Georgia, US|4y, Michigan, US|9ssouri, US|3tholomew, Indiana, US|4on, Kansas, US|8Missouri, US|5w, Georgia, US|2strop, Texas, US|2tes, Missouri, US|3h, Kentucky, US|6Virginia, US|2xter, Arkansas, US|2y, Florida, US|5Michigan, US|3field, Wisconsin, US|3lor, Texas, US|1eadle, South Dakota, US|3r Lake, Idaho, US|5River, Utah, US|3ufort, North Carolina, US|aSouth Carolina, US|4regard, Louisiana, US|3ver, Oklahoma, US|8Pennsylvania, US|8Utah, US|6head, Montana, US|2cker, Minnesota, US|4ham, Oklahoma, US|2dford, Pennsylvania, US|9Tennessee, US|9Virginia, US|2e, Texas, US|2lknap, New Hampshire, US|3l, Kentucky, US|6Texas, US|3mont, Ohio, US|3trami, Minnesota, US|2n Hill, Georgia, US|3ewah, Idaho, US|3nett, South Dakota, US|4ington, Vermont, US|3son, North Dakota, US|3t, Colorado, US|4on, Arkansas, US|8Indiana, US|9owa, US|8Minnesota, US|assissippi, US|couri, US|8Oregon, US|8Tennessee, US|8Washington, US|3zie, Michigan, US|2rgen, New Jersey, US|3keley, South Carolina, US|aWest Virginia, US|4s, Pennsylvania, US|5hire, Massachusetts, US|3nalillo, New Mexico, US|3rien, Georgia, US|9Michigan, US|3tie, North Carolina, US|2thel, Alaska, US|2xar, Texas, US|1ibb, Alabama, US|6Georgia, US|2enville, Louisiana, US|2g Horn, Montana, US|aWyoming, US|4Stone, Minnesota, US|2llings, North Dakota, US|2ngham, Idaho, US|1lack Hawk, Iowa, US|5ford, Indiana, US|3den, North Carolina, US|3ine, Idaho, US|8Montana, US|8Nebraska, US|8Oklahoma, US|4r, Pennsylvania, US|3nco, Texas, US|4d, Virginia, US|2eckley, Georgia, US|3dsoe, Tennessee, US|2ount, Alabama, US|8Tennessee, US|2ue Earth, Minnesota, US|1oise, Idaho, US|2livar, Mississippi, US|3linger, Missouri, US|2n Homme, South Dakota, US|3d, Illinois, US|3ner, Idaho, US|5ville, Idaho, US|2one, Arkansas, US|7Illinois, US|8ndiana, US|8owa, US|7Kentucky, US|7Missouri, US|7Nebraska, US|7West Virginia, US|2rden, Texas, US|2sque, Texas, US|3sier, Louisiana, US|2tetourt, Virginia, US|3tineau, North Dakota, US|2ulder, Colorado, US|3ndary, Idaho, US|3rbon, Kansas, US|aentucky, US|2wie, Texas, US|3man, North Dakota, US|2x Butte, Nebraska, US|4Elder, Utah, US|2yd, Kentucky, US|6Nebraska, US|3le, Kentucky, US|1racken, Kentucky, US|3dford, Florida, US|aPennsylvania, US|4ley, Arkansas, US|9Tennessee, US|3nch, Michigan, US|4tley, Georgia, US|3xton, West Virginia, US|3zoria, Texas, US|5s, Texas, US|2eathitt, Kentucky, US|3ckinridge, Kentucky, US|3mer, Iowa, US|3vard, Florida, US|3wster, Texas, US|2iscoe, Texas, US|4tol Bay plus Lake and Peninsula, Alaska, US|b, Alaska, US|7, Massachusetts, US|9Rhode Island, US|9Virginia, US|2oadwater, Montana, US|3nx, New York, US|3oke, West Virginia, US|5ings, South Dakota, US|5s, Georgia, US|8Texas, US|4me, New York, US|5field, Colorado, US|3ward, Florida, US|4n, Illinois, US|8ndiana, US|7Kansas, US|7Minnesota, US|7Nebraska, US|7Ohio, US|7South Dakota, US|7Texas, US|7Wisconsin, US|2ule, South Dakota, US|3nswick, North Carolina, US|bVirginia, US|2yan, Georgia, US|7Oklahoma, US|1uchanan, Iowa, US|aMissouri, US|aVirginia, US|3kingham, Virginia, US|4s, Pennsylvania, US|2ena Vista, Iowa, US|dVirginia, US|2ffalo, Nebraska, US|9South Dakota, US|9Wisconsin, US|2llitt, Kentucky, US|4och, Georgia, US|6k, Alabama, US|2ncombe, North Carolina, US|2reau, Illinois, US|3ke, Georgia, US|7North Carolina, US|dDakota, US|3leigh, North Dakota, US|5son, Texas, US|4ington, New Jersey, US|3net, Texas, US|6t, Wisconsin, US|3t, Nebraska, US|2tler, Alabama, US|8Iowa, US|8Kansas, US|9entucky, US|8Missouri, US|8Nebraska, US|8Ohio, US|8Pennsylvania, US|3te, California, US|7Idaho, US|7South Dakota, US|4s, Georgia, US|0Cabarrus, North Carolina, US|3ell, West Virginia, US|2che, Utah, US|2ddo, Louisiana, US|7Oklahoma, US|2laveras, California, US|3casieu, Louisiana, US|3dwell, Kentucky, US|aLouisiana, US|aMissouri, US|aNorth Carolina, US|aTexas, US|3edonia, Vermont, US|3houn, Alabama, US|arkansas, US|9Florida, US|9Georgia, US|9Illinois, US|aowa, US|9Michigan, US|bssissippi, US|9South Carolina, US|9Texas, US|9West Virginia, US|3lahan, Texas, US|5way, Missouri, US|4oway, Kentucky, US|3umet, Wisconsin, US|3vert, Maryland, US|2mas, Idaho, US|3bria, Pennsylvania, US|3den, Georgia, US|8Missouri, US|8New Jersey, US|9orth Carolina, US|3eron, Louisiana, US|9Pennsylvania, US|9Texas, US|3p, Texas, US|4bell, Kentucky, US|aSouth Dakota, US|aTennessee, US|aVirginia, US|aWyoming, US|2nadian, Oklahoma, US|3dler, Georgia, US|3non, Tennessee, US|3yon, Idaho, US|2pe Girardeau, Missouri, US|5May, New Jersey, US|2rbon, Montana, US|8Pennsylvania, US|8Utah, US|8Wyoming, US|3ibou, Idaho, US|3lisle, Kentucky, US|4ton, Minnesota, US|3oline, Maryland, US|aVirginia, US|3roll, Arkansas, US|9Georgia, US|9Illinois, US|andiana, US|aowa, US|9Kentucky, US|9Maryland, US|aississippi, US|douri, US|9New Hampshire, US|9Ohio, US|9Tennessee, US|9Virginia, US|3son City, Nevada, US|6, Texas, US|3ter, Kentucky, US|8Missouri, US|9ontana, US|8Oklahoma, US|8Tennessee, US|6et, North Carolina, US|3ver, Minnesota, US|2scade, Montana, US|3ey, Kentucky, US|3s, Illinois, US|7ndiana, US|7owa, US|6Michigan, US|8nnesota, US|8ssouri, US|6Nebraska, US|7orth Dakota, US|6Texas, US|4ia, Idaho, US|3tro, Texas, US|3well, North Carolina, US|2tahoula, Louisiana, US|4wba, North Carolina, US|3oosa, Georgia, US|3ron, New Mexico, US|3taraugus, New York, US|2valier, North Dakota, US|2yuga, New York, US|1ecil, Maryland, US|2dar, Iowa, US|7Missouri, US|7Nebraska, US|2ntral Utah, Utah, US|5e, Pennsylvania, US|2rro Gordo, Iowa, US|1haffee, Colorado, US|3mbers, Alabama, US|aTexas, US|4paign, Illinois, US|bOhio, US|3riton, Missouri, US|4les City, Virginia, US|8Mix, South Dakota, US|7, Maryland, US|7ton, South Carolina, US|6voix, Michigan, US|5otte, Florida, US|bVirginia, US|9sville, Virginia, US|5ton, Georgia, US|3se, Kansas, US|7Nebraska, US|3tham, Georgia, US|9North Carolina, US|4tahoochee, Georgia, US|5ooga, Georgia, US|3utauqua, Kansas, US|cNew York, US|3ves, New Mexico, US|2eatham, Tennessee, US|3boygan, Michigan, US|3lan, Washington, US|3mung, New York, US|3nango, New York, US|3rokee, Alabama, US|aGeorgia, US|aIowa, US|aKansas, US|aNorth Carolina, US|aOklahoma, US|aSouth Carolina, US|aTexas, US|4ry, Nebraska, US|3sapeake, Virginia, US|4hire, New Hampshire, US|4ter, Pennsylvania, US|9South Carolina, US|9Tennessee, US|7field, South Carolina, US|eVirginia, US|3yenne, Colorado, US|aKansas, US|aNebraska, US|2ickasaw, Iowa, US|bMississippi, US|4ot, Arkansas, US|3ldress, Texas, US|4ton, Alabama, US|3ppewa, Michigan, US|cnnesota, US|aWisconsin, US|3sago, Minnesota, US|3ttenden, Vermont, US|2octaw, Alabama, US|9Mississippi, US|9Oklahoma, US|3uteau, Montana, US|3wan, North Carolina, US|2ristian, Illinois, US|bKentucky, US|bMissouri, US|2ugach, Alaska, US|3rchill, Nevada, US|1ibola, New Mexico, US|2marron, Oklahoma, US|2trus, Florida, US|1lackamas, Oregon, US|3iborne, Louisiana, US|bMississippi, US|bTennessee, US|3llam, Washington, US|3re, Michigan, US|5ndon, South Carolina, US|4ion, Pennsylvania, US|4k, Arkansas, US|7Idaho, US|8llinois, US|8ndiana, US|7Kansas, US|8entucky, US|7Missouri, US|7Nevada, US|7Ohio, US|7South Dakota, US|7Washington, US|8isconsin, US|5e, Alabama, US|8Georgia, US|8Iowa, US|8Mississippi, US|8Virginia, US|3tsop, Oregon, US|3y, Alabama, US|7rkansas, US|6Florida, US|6Georgia, US|6Illinois, US|7ndiana, US|7owa, US|6Kansas, US|7entucky, US|6Minnesota, US|8ssissippi, US|aouri, US|6Nebraska, US|7orth Carolina, US|6South Dakota, US|6Tennessee, US|8xas, US|6West Virginia, US|4ton, Georgia, US|9Iowa, US|2ear Creek, Colorado, US|5field, Pennsylvania, US|5water, Idaho, US|cMinnesota, US|3burne, Alabama, US|brkansas, US|3rmont, Ohio, US|3veland, Arkansas, US|bNorth Carolina, US|bOklahoma, US|2inch, Georgia, US|4ton, Illinois, US|andiana, US|aowa, US|9Kentucky, US|9Michigan, US|bssouri, US|9New York, US|9Ohio, US|9Pennsylvania, US|2oud, Kansas, US|1oahoma, Mississippi, US|3l, Oklahoma, US|2bb, Georgia, US|2chise, Arizona, US|4ran, Texas, US|3ke, Tennessee, US|3onino, Arizona, US|2dington, South Dakota, US|2ffee, Alabama, US|8Georgia, US|8Tennessee, US|5y, Kansas, US|2ke, Texas, US|2lbert, Alabama, US|3e, Missouri, US|4man, Texas, US|4s, Illinois, US|3fax, Nebraska, US|aw Mexico, US|3leton, South Carolina, US|4ier, Florida, US|5n, Texas, US|6gsworth, Texas, US|3onial Heights, Virginia, US|4rado, Texas, US|3quitt, Georgia, US|3umbia, Arkansas, US|aFlorida, US|aGeorgia, US|aNew York, US|aOregon, US|aPennsylvania, US|aWashington, US|bisconsin, US|8na, Ohio, US|6us, North Carolina, US|4sa, California, US|2mal, Texas, US|4nche, Kansas, US|aOklahoma, US|aTexas, US|2ncho, Texas, US|4ordia, Louisiana, US|3ecuh, Alabama, US|4jos, Colorado, US|3tra Costa, California, US|3verse, Wyoming, US|3way, Arkansas, US|2ok, Georgia, US|6Illinois, US|6Minnesota, US|4e, Texas, US|3per, Missouri, US|3s, New Hampshire, US|6Oregon, US|4a, Alabama, US|2piah, Mississippi, US|3per River, Alaska, US|2rson, South Dakota, US|3tland, New York, US|3yell, Texas, US|2shocton, Ohio, US|3tilla, Colorado, US|2ttle, Texas, US|4on, Oklahoma, US|6wood, Minnesota, US|2vington, Alabama, US|bMississippi, US|bVirginia, US|2weta, Georgia, US|3ley, Kansas, US|4itz, Washington, US|1raig, Oklahoma, US|7Virginia, US|5head, Arkansas, US|3ne, Texas, US|3ven, North Carolina, US|3wford, Arkansas, US|aGeorgia, US|aIllinois, US|bndiana, US|bowa, US|aKansas, US|aMichigan, US|cssouri, US|aOhio, US|aPennsylvania, US|aWisconsin, US|2eek, Oklahoma, US|3nshaw, Alabama, US|2isp, Georgia, US|3ttenden, Arkansas, US|cKentucky, US|2ockett, Tennessee, US|cxas, US|3ok, Oregon, US|7Wyoming, US|3sby, Texas, US|4s, Arkansas, US|3w Wing, Minnesota, US|4ley, Colorado, US|1ulberson, Texas, US|3lman, Alabama, US|3peper, Virginia, US|2mberland, Illinois, US|cKentucky, US|cMaine, US|cNew Jersey, US|dorth Carolina, US|cPennsylvania, US|cTennessee, US|cVirginia, US|3ing, Nebraska, US|2rrituck, North Carolina, US|4y, New Mexico, US|7Oregon, US|2ster, Colorado, US|8Idaho, US|8Montana, US|8Nebraska, US|8Oklahoma, US|8South Dakota, US|2yahoga, Ohio, US|0Dade, Georgia, US|6Missouri, US|2ggett, Utah, US|2kota, Minnesota, US|8Nebraska, US|2le, Alabama, US|3lam, Texas, US|5s, Alabama, US|9rkansas, US|8Iowa, US|8Missouri, US|8Texas, US|2ne, Wisconsin, US|3iels, Montana, US|3ville, Virginia, US|2re, North Carolina, US|3ke, Ohio, US|3lington, South Carolina, US|2uphin, Pennsylvania, US|2vidson, North Carolina, US|aTennessee, US|4e, North Carolina, US|5ss, Indiana, US|9Kentucky, US|9Missouri, US|4s, Iowa, US|7Utah, US|5on, South Dakota, US|2wes, Nebraska, US|3son, Georgia, US|8Montana, US|8Nebraska, US|8Texas, US|2y, South Dakota, US|1e Baca, New Mexico, US|3Soto, Louisiana, US|3Witt, Illinois, US|2Kalb, Alabama, US|8Georgia, US|8Illinois, US|9ndiana, US|8Missouri, US|8Tennessee, US|2Soto, Florida, US|8Mississippi, US|2Witt, Texas, US|2af Smith, Texas, US|3rborn, Indiana, US|2catur, Georgia, US|9Indiana, US|aowa, US|9Kansas, US|9Tennessee, US|2er Lodge, Montana, US|2fiance, Ohio, US|2l Norte, California, US|3aware, Indiana, US|bowa, US|aNew York, US|aOhio, US|bklahoma, US|aPennsylvania, US|3ta, Colorado, US|7Michigan, US|7Texas, US|2nali, Alaska, US|3t, Missouri, US|4on, Texas, US|3ver, Colorado, US|2s Moines, Iowa, US|3chutes, Oregon, US|3ha, Arkansas, US|2uel, Nebraska, US|7South Dakota, US|2wey, Oklahoma, US|7South Dakota, US|1ickens, Texas, US|7on, Virginia, US|5y, North Dakota, US|4inson, Iowa, US|bKansas, US|bMichigan, US|4son, Tennessee, US|2llingham, Alaska, US|4on, South Carolina, US|2mmit, Texas, US|2nwiddie, Virginia, US|2strict of Columbia, District of Columbia ,US|2vide, North Dakota, US|2xie, Florida, US|3on, Nebraska, US|1oddridge, West Virginia, US|3ge, Georgia, US|7Minnesota, US|7Nebraska, US|7Wisconsin, US|2lores, Colorado, US|2na Ana, New Mexico, US|3iphan, Kansas, US|3ley, Texas, US|2oly, Georgia, US|3r, Wisconsin, US|2rchester, Maryland, US|cSouth Carolina, US|2ugherty, Georgia, US|4las, Colorado, US|9Georgia, US|9Illinois, US|9Kansas, US|9Minnesota, US|bssouri, US|9Nebraska, US|bvada, US|9Oregon, US|9South Dakota, US|9Washington, US|aisconsin, US|1rew, Arkansas, US|1uPage, Illinois, US|2bois, Indiana, US|3uque, Iowa, US|2chesne, Utah, US|2kes and Nantucket, Massachusetts, US|5, Massachusetts, US|2ndy, Nebraska, US|3klin, Missouri, US|3n, North Dakota, US|6Wisconsin, US|2plin, North Carolina, US|2rham, North Carolina, US|2tchess, New York, US|2val, Florida, US|7Texas, US|1yer, Tennessee, US|0Eagle, Colorado, US|2rly, Georgia, US|2st Baton Rouge, Louisiana, US|5Carroll, Louisiana, US|5Feliciana, Louisiana, US|4land, Texas, US|2ton, Michigan, US|2u Claire, Wisconsin, US|1chols, Georgia, US|2tor, Texas, US|1ddy, New Mexico, US|7orth Dakota, US|2gar, Illinois, US|3ecombe, North Carolina, US|4field, South Carolina, US|2monson, Kentucky, US|3unds, South Dakota, US|2wards, Illinois, US|9Kansas, US|9Texas, US|1ffingham, Georgia, US|bIllinois, US|1l Dorado, California, US|3Paso, Colorado, US|9Texas, US|2bert, Colorado, US|8Georgia, US|2k, Kansas, US|5Pennsylvania, US|3hart, Indiana, US|3o, Nevada, US|2liott, Kentucky, US|4s, Kansas, US|7Oklahoma, US|7Texas, US|3sworth, Kansas, US|2more, Alabama, US|8Idaho, US|1manuel, Georgia, US|2ery, Utah, US|2met, Iowa, US|7Michigan, US|3ons, North Dakota, US|2poria, Virginia, US|1rath, Texas, US|2ie, New York, US|6Ohio, US|6Pennsylvania, US|1scambia, Alabama, US|aFlorida, US|2meralda, Nevada, US|2sex, Massachusetts, US|7New Jersey, US|bYork, US|7Vermont, US|8irginia, US|2till, Kentucky, US|1towah, Alabama, US|1ureka, Nevada, US|1vangeline, Louisiana, US|4s, Georgia, US|0Fairbanks North Star, Alaska, US|4fax City, Virginia, US|7, Virginia, US|5ield, Connecticut, US|bOhio, US|bSouth Carolina, US|2ll River, South Dakota, US|4on, Montana, US|4s Church, Virginia, US|5, Texas, US|2nnin, Georgia, US|8Texas, US|2ribault, Minnesota, US|2ulk, South Dakota, US|5ner, Arkansas, US|3quier, Virginia, US|2yette, Alabama, US|9Georgia, US|9Illinois, US|andiana, US|aowa, US|9Kentucky, US|9Ohio, US|9Pennsylvania, US|9Tennessee, US|bxas, US|9West Virginia, US|1ederal Bureau of Prisons, US|8Correctional Institution (FCI), Michigan, US|2ntress, Tennessee, US|2rgus, Montana, US|3ry, Washington, US|1illmore, Minnesota, US|aNebraska, US|2nney, Kansas, US|2sher, Texas, US|1lagler, Florida, US|3thead, Montana, US|2eming, Kentucky, US|2orence, South Carolina, US|aWisconsin, US|3yd, Georgia, US|7Indiana, US|8owa, US|7Kentucky, US|7Texas, US|7Virginia, US|2uvanna, Virginia, US|1oard, Texas, US|2nd du Lac, Wisconsin, US|2rd, Illinois, US|6Kansas, US|3est, Pennsylvania, US|8Wisconsin, US|3rest, Mississippi, US|3syth, Georgia, US|9North Carolina, US|3t Bend, Texas, US|2ster, North Dakota, US|2untain, Indiana, US|1ranklin City, Virginia, US|8, Alabama, US|brkansas, US|aFlorida, US|aGeorgia, US|aIdaho, US|bllinois, US|bndiana, US|bowa, US|aKansas, US|bentucky, US|aLouisiana, US|aMaine, US|cssachusetts, US|bississippi, US|eouri, US|aNebraska, US|cw York, US|borth Carolina, US|aOhio, US|aPennsylvania, US|aTennessee, US|cxas, US|aVermont, US|birginia, US|aWashington, US|2ederick, Maryland, US|bVirginia, US|9sburg, Virginia, US|3eborn, Minnesota, US|4stone, Texas, US|3mont, Colorado, US|9Idaho, US|aowa, US|9Wyoming, US|3sno, California, US|2io, Texas, US|2ontier, Nebraska, US|1ulton, Arkansas, US|8Georgia, US|8Illinois, US|9ndiana, US|8Kentucky, US|8New York, US|8Ohio, US|8Pennsylvania, US|2rnas, Nebraska, US|0Gadsden, Florida, US|2ge, Nebraska, US|2ines, Texas, US|2lax, Virginia, US|3latin, Illinois, US|aKentucky, US|aMontana, US|4ia, Ohio, US|3veston, Texas, US|2rden, Nebraska, US|3field, Colorado, US|aMontana, US|aNebraska, US|aOklahoma, US|aUtah, US|aWashington, US|3land, Arkansas, US|3rard, Kentucky, US|4ett, Maryland, US|3vin, Oklahoma, US|3za, Texas, US|2sconade, Missouri, US|3ton, North Carolina, US|2tes, North Carolina, US|1eary, Kansas, US|3uga, Ohio, US|2m, Idaho, US|2nesee, Michigan, US|9New York, US|4va, Alabama, US|3try, Missouri, US|2orge, Mississippi, US|6town, South Carolina, US|1ibson, Indiana, US|8Tennessee, US|2la, Arizona, US|3christ, Florida, US|3es, Tennessee, US|7Virginia, US|3lespie, Texas, US|4iam, Oregon, US|3mer, Georgia, US|8West Virginia, US|3pin, Colorado, US|1lacier, Montana, US|3des, Florida, US|4win, Michigan, US|3scock, Georgia, US|4scock, Texas, US|2enn, California, US|2oucester, New Jersey, US|cVirginia, US|2ynn, Georgia, US|1ogebic, Michigan, US|2lden Valley, Montana, US|fNorth Dakota, US|3iad, Texas, US|2nzales, Texas, US|2ochland, Virginia, US|3dhue, Minnesota, US|4ing, Idaho, US|2rdon, Georgia, US|2shen, Wyoming, US|3per, Nebraska, US|2ve, Kansas, US|1rady, Georgia, US|7Oklahoma, US|3fton, New Hampshire, US|3ham, Arizona, US|8Kansas, US|8North Carolina, US|3inger, Tennessee, US|3nd Forks, North Dakota, US|6Isle, Vermont, US|6Princess, US|6Traverse, Michigan, US|5, Colorado, US|7Utah, US|4ite, Montana, US|4t, Arkansas, US|7Indiana, US|7Kansas, US|8entucky, US|7Louisiana, US|7Minnesota, US|7Nebraska, US|9w Mexico, US|8orth Dakota, US|7Oklahoma, US|8regon, US|7South Dakota, US|7Washington, US|8est Virginia, US|8isconsin, US|4ville, North Carolina, US|3tiot, Michigan, US|3ves, Kentucky, US|3y, Kansas, US|6Texas, US|4s Harbor, Washington, US|5on, Kentucky, US|9Texas, US|9Virginia, US|2eeley, Kansas, US|9Nebraska, US|4n Lake, Wisconsin, US|5, Kentucky, US|7Wisconsin, US|5brier, West Virginia, US|5e, Alabama, US|9rkansas, US|8Georgia, US|8Illinois, US|9ndiana, US|9owa, US|8Mississippi, US|couri, US|8New York, US|9orth Carolina, US|8Ohio, US|8Pennsylvania, US|8Tennessee, US|8Virginia, US|5lee, Arizona, US|5sville, Virginia, US|5up, Kentucky, US|5ville, South Carolina, US|5wood, Kansas, US|bSouth Carolina, US|4r, Oklahoma, US|3gg, Texas, US|4ory, South Dakota, US|3nada, Mississippi, US|2iggs, North Dakota, US|3mes, Texas, US|2undy, Illinois, US|9owa, US|8Missouri, US|8Tennessee, US|1uadalupe, New Mexico, US|bTexas, US|2ernsey, Ohio, US|2ilford, North Carolina, US|2lf, Florida, US|2nnison, Colorado, US|2thrie, Iowa, US|1winnett, Georgia, US|0Haakon, South Dakota, US|2bersham, Georgia, US|2ines, Alaska, US|2le, Alabama, US|6Texas, US|3ifax, North Carolina, US|9Virginia, US|3l, Georgia, US|6Nebraska, US|6Texas, US|2mblen, Tennessee, US|3ilton, Florida, US|aIllinois, US|bndiana, US|bowa, US|aKansas, US|aNebraska, US|cw York, US|aOhio, US|aTennessee, US|cxas, US|3lin, South Dakota, US|3pden, Massachusetts, US|4shire, Massachusetts, US|bWest Virginia, US|4ton, South Carolina, US|9Virginia, US|2ncock, Georgia, US|9Illinois, US|andiana, US|aowa, US|9Kentucky, US|9Maine, US|aississippi, US|9Ohio, US|9Tennessee, US|9West Virginia, US|3d, South Dakota, US|3over, Virginia, US|3sford, Texas, US|4on, South Dakota, US|2ralson, Georgia, US|3dee, Florida, US|5man, Tennessee, US|cxas, US|4in, Illinois, US|9owa, US|8Kentucky, US|8Ohio, US|8Tennessee, US|axas, US|6g, New Mexico, US|9South Dakota, US|4y, West Virginia, US|3ford, Maryland, US|3lan, Kentucky, US|8Nebraska, US|3mon, Oklahoma, US|3nett, North Carolina, US|5y, Oregon, US|3per, Kansas, US|8Oklahoma, US|3ris, Georgia, US|8Texas, US|6on, Indiana, US|bowa, US|aKentucky, US|aMississippi, US|eouri, US|aOhio, US|aTexas, US|aWest Virginia, US|8burg, Virginia, US|3t, Georgia, US|6Kentucky, US|4ford, Connecticut, US|4ley, Texas, US|3vey, Kansas, US|2skell, Kansas, US|9Oklahoma, US|9Texas, US|2waii, Hawaii, US|3kins, Tennessee, US|2yes, Nebraska, US|3s, Texas, US|3wood, North Carolina, US|9Tennessee, US|1eard, Georgia, US|2mphill, Texas, US|4stead, Arkansas, US|2nderson, Illinois, US|bKentucky, US|bNorth Carolina, US|bTennessee, US|dxas, US|4ricks, Indiana, US|5y, Florida, US|3nepin, Minnesota, US|3rico, Virginia, US|4y, Alabama, US|7Georgia, US|7Illinois, US|8ndiana, US|8owa, US|7Kentucky, US|7Missouri, US|7Ohio, US|7Tennessee, US|7Virginia, US|2rkimer, New York, US|3nando, Florida, US|3tford, North Carolina, US|2ttinger, North Dakota, US|1ickman, Kentucky, US|9Tennessee, US|4ory, Missouri, US|2dalgo, New Mexico, US|9Texas, US|2ghland, Ohio, US|aVirginia, US|8s, Florida, US|2ll, Montana, US|6Texas, US|4sborough, Florida, US|eNew Hampshire, US|5dale, Michigan, US|2nds, Mississippi, US|3sdale, Colorado, US|2tchcock, Nebraska, US|1ocking, Ohio, US|4ley, Texas, US|2dgeman, Kansas, US|2ke, North Carolina, US|2lmes, Florida, US|8Mississippi, US|8Ohio, US|3t, Missouri, US|6Nebraska, US|2nolulu, Hawaii, US|2od River, Oregon, US|4, Texas, US|3ker, Nebraska, US|3nah-Angoon, Alaska, US|2pewell, Virginia, US|3kins, Kentucky, US|9Texas, US|2rry, South Carolina, US|2t Spring, Arkansas, US|as, Wyoming, US|2ughton, Michigan, US|3ston, Alabama, US|9Georgia, US|9Minnesota, US|9Tennessee, US|bxas, US|2ward, Arkansas, US|8Indiana, US|9owa, US|8Maryland, US|9issouri, US|8Nebraska, US|8Texas, US|3ell, Missouri, US|1ubbard, Minnesota, US|2dson, New Jersey, US|4peth, Texas, US|2erfano, Colorado, US|2ghes, Oklahoma, US|8South Dakota, US|2mboldt, California, US|aIowa, US|aNevada, US|3phreys, Mississippi, US|bTennessee, US|2nt, Texas, US|4erdon, New Jersey, US|4ingdon, Pennsylvania, US|7ton, Indiana, US|2ron, Michigan, US|7Ohio, US|2tchinson, South Dakota, US|cTexas, US|1yde, North Carolina, US|6South Dakota, US|0Iberia, Louisiana, US|4ville, Louisiana, US|1da, Iowa, US|3ho, Idaho, US|1mperial, California, US|1ndependence, Arkansas, US|3ian River, Florida, US|6a, Pennsylvania, US|2gham, Michigan, US|2yo, California, US|1onia, Michigan, US|2sco, Michigan, US|2wa, Iowa, US|6Wisconsin, US|1redell, North Carolina, US|2ion, Texas, US|2on, Michigan, US|8ssouri, US|6Utah, US|6Wisconsin, US|3quois, Illinois, US|2win, Georgia, US|1sabella, Michigan, US|3nti, Minnesota, US|2land, Washington, US|3e of Wight, Virginia, US|2saquena, Mississippi, US|1tasca, Minnesota, US|3wamba, Mississippi, US|1zard, Arkansas, US|0Jack, Texas, US|4son, Alabama, US|arkansas, US|9Colorado, US|9Florida, US|9Georgia, US|9Illinois, US|andiana, US|aowa, US|9Kansas, US|aentucky, US|9Louisiana, US|9Michigan, US|bnnesota, US|bssissippi, US|douri, US|9North Carolina, US|9Ohio, US|aklahoma, US|aregon, US|9South Dakota, US|9Tennessee, US|bxas, US|9West Virginia, US|aisconsin, US|2mes City, Virginia, US|2sper, Georgia, US|8Illinois, US|9ndiana, US|9owa, US|8Mississippi, US|couri, US|8South Carolina, US|8Texas, US|2y, Indiana, US|1eff Davis, Georgia, US|cTexas, US|4erson Davis, Louisiana, US|hMississippi, US|9, Alabama, US|crkansas, US|bColorado, US|bFlorida, US|bGeorgia, US|bIdaho, US|cllinois, US|cndiana, US|cowa, US|bKansas, US|centucky, US|bLouisiana, US|bMississippi, US|fouri, US|contana, US|bNebraska, US|dw York, US|bOhio, US|cklahoma, US|cregon, US|bPennsylvania, US|bTennessee, US|dxas, US|bWashington, US|cest Virginia, US|cisconsin, US|2nkins, Georgia, US|3nings, Indiana, US|2rauld, South Dakota, US|3ome, Idaho, US|3sey, Illinois, US|2ssamine, Kentucky, US|2well, Kansas, US|1im Hogg, Texas, US|4Wells, Texas, US|1o Daviess, Illinois, US|2hnson, Arkansas, US|9Georgia, US|9Illinois, US|andiana, US|aowa, US|9Kansas, US|aentucky, US|9Missouri, US|9Nebraska, US|9Tennessee, US|bxas, US|9Wyoming, US|5ton, North Carolina, US|aOklahoma, US|2nes, Georgia, US|7Iowa, US|7Mississippi, US|7North Carolina, US|7South Dakota, US|7Texas, US|2sephine, Oregon, US|1uab, Utah, US|2dith Basin, Montana, US|2neau, Alaska, US|8Wisconsin, US|3iata, Pennsylvania, US|0Kalamazoo, Michigan, US|4wao, Hawaii, US|3kaska, Michigan, US|2nabec, Minnesota, US|4wha, West Virginia, US|3diyohi, Minnesota, US|3e, Illinois, US|6Utah, US|3kakee, Illinois, US|3sas City, Missouri, US|2rnes, Texas, US|2uai, Hawaii, US|3fman, Texas, US|2y, Oklahoma, US|1earney, Nebraska, US|5y, Kansas, US|2ith, Nebraska, US|2mper, Mississippi, US|2nai Peninsula, Alaska, US|3dall, Illinois, US|9Texas, US|3edy, Texas, US|3nebec, Maine, US|3osha, Wisconsin, US|3t, Delaware, US|6Maryland, US|7ichigan, US|6Rhode Island, US|6Texas, US|4on, Kentucky, US|2okuk, Iowa, US|2rn, California, US|3r, Texas, US|3shaw, South Carolina, US|2tchikan Gateway, Alaska, US|2waunee, Wisconsin, US|3eenaw, Michigan, US|2ya Paha, Nebraska, US|1idder, North Dakota, US|2mball, Nebraska, US|4le, Texas, US|2ng George, Virginia, US|5William, Virginia, US|5and Queen, Virginia, US|4, Texas, US|6Washington, US|4fisher, Oklahoma, US|4man, Kansas, US|4s, California, US|7New York, US|5bury, South Dakota, US|3ney, Texas, US|2owa, Colorado, US|7Kansas, US|7Oklahoma, US|2t Carson, Colorado, US|3sap, Washington, US|3titas, Washington, US|4son, Minnesota, US|1lamath, Oregon, US|2eberg, Texas, US|2ickitat, Washington, US|1nott, Kentucky, US|3x, Illinois, US|7ndiana, US|6Kentucky, US|6Maine, US|7issouri, US|6Nebraska, US|6Ohio, US|6Tennessee, US|8xas, US|1odiak Island, Alaska, US|2ochiching, Minnesota, US|3tenai, Idaho, US|2sciusko, Indiana, US|3suth, Iowa, US|1usilvak, Alaska, US|0La Crosse, Wisconsin, US|3Paz, Arizona, US|4lata, Colorado, US|3Salle, Texas, US|2Grange, Indiana, US|2Moure, North Dakota, US|2Porte, Indiana, US|2Salle, Illinois, US|9Louisiana, US|2bette, Kansas, US|2c qui Parle, Minnesota, US|3kawanna, Pennsylvania, US|3lede, Missouri, US|2fayette, Arkansas, US|bFlorida, US|bLouisiana, US|bMississippi, US|fouri, US|bWisconsin, US|3ourche, Louisiana, US|2ke of the Woods, Minnesota, US|4, California, US|7olorado, US|6Florida, US|6Illinois, US|7ndiana, US|6Michigan, US|8nnesota, US|7ontana, US|6Ohio, US|7regon, US|6South Dakota, US|6Tennessee, US|2mar, Alabama, US|7Georgia, US|7Mississippi, US|7Texas, US|3b, Texas, US|3oille, Vermont, US|3pasas, Texas, US|2ncaster, Nebraska, US|bPennsylvania, US|bSouth Carolina, US|bVirginia, US|3der, Nevada, US|3e, Kansas, US|6Oregon, US|3glade, Wisconsin, US|3ier, Georgia, US|2peer, Michigan, US|2ramie, Wyoming, US|3imer, Colorado, US|3ue, Kentucky, US|2s Animas, Colorado, US|3sen, California, US|2tah, Idaho, US|3imer, Oklahoma, US|2uderdale, Alabama, US|cMississippi, US|cTennessee, US|3rel, Kentucky, US|5ns, Georgia, US|9South Carolina, US|2vaca, Texas, US|2wrence, Alabama, US|brkansas, US|aIllinois, US|bndiana, US|aKentucky, US|aMississippi, US|eouri, US|aOhio, US|aPennsylvania, US|aSouth Dakota, US|aTennessee, US|1e Flore, Oklahoma, US|3Sueur, Minnesota, US|2a, New Mexico, US|3ke, Mississippi, US|3venworth, Kansas, US|2banon, Pennsylvania, US|2e, Alabama, US|6rkansas, US|5Florida, US|5Georgia, US|5Illinois, US|6owa, US|5Kentucky, US|5Mississippi, US|5North Carolina, US|5South Carolina, US|5Texas, US|5Virginia, US|3lanau, Michigan, US|2flore, Mississippi, US|2high, Pennsylvania, US|2mhi, Idaho, US|2nawee, Michigan, US|3oir, North Carolina, US|2on, Florida, US|6Texas, US|2slie, Kentucky, US|2tcher, Kentucky, US|2vy, Florida, US|2wis and Clark, Montana, US|5, Idaho, US|7Kentucky, US|7Missouri, US|7New York, US|7Tennessee, US|7Washington, US|8est Virginia, US|2xington, South Carolina, US|bVirginia, US|1iberty, Florida, US|9Georgia, US|9Montana, US|9Texas, US|2cking, Ohio, US|2mestone, Alabama, US|bTexas, US|2ncoln, Arkansas, US|9Colorado, US|9Georgia, US|9Idaho, US|9Kansas, US|aentucky, US|9Louisiana, US|9Maine, US|ainnesota, US|bssissippi, US|douri, US|aontana, US|9Nebraska, US|bvada, US|bw Mexico, US|aorth Carolina, US|9Oklahoma, US|aregon, US|9South Dakota, US|9Tennessee, US|9Washington, US|aest Virginia, US|aisconsin, US|ayoming, US|3n, Iowa, US|6Kansas, US|6Missouri, US|6Oregon, US|2pscomb, Texas, US|2tchfield, Connecticut, US|3tle River, Arkansas, US|2ve Oak, Texas, US|3ingston, Illinois, US|cKentucky, US|cLouisiana, US|cMichigan, US|essouri, US|cNew York, US|1lano, Texas, US|1ogan, Arkansas, US|7Colorado, US|7Illinois, US|7Kansas, US|8entucky, US|7Nebraska, US|8orth Dakota, US|7Ohio, US|8klahoma, US|7West Virginia, US|2ng, Georgia, US|3oke, Arkansas, US|2rain, Ohio, US|2s Alamos, New Mexico, US|5ngeles, California, US|2udon, Tennessee, US|5un, Virginia, US|3isa, Iowa, US|8Virginia, US|3p, Nebraska, US|2ve, Oklahoma, US|3ing, Texas, US|2wndes, Alabama, US|9Georgia, US|9Mississippi, US|1ubbock, Texas, US|2cas, Iowa, US|7Ohio, US|3e, Michigan, US|2mpkin, Georgia, US|2na, New Mexico, US|3enburg, Virginia, US|2zerne, Pennsylvania, US|1ycoming, Pennsylvania, US|2man, South Dakota, US|2nchburg, Virginia, US|3n, Texas, US|2on, Iowa, US|6Kansas, US|7entucky, US|6Minnesota, US|6Nevada, US|0Mackinac, Michigan, US|3omb, Michigan, US|4n, Alabama, US|7Georgia, US|7Illinois, US|7Missouri, US|7North Carolina, US|7Tennessee, US|4upin, Illinois, US|2dera, California, US|3ison, Alabama, US|arkansas, US|9Florida, US|9Georgia, US|9Idaho, US|allinois, US|andiana, US|aowa, US|9Kentucky, US|9Louisiana, US|9Mississippi, US|douri, US|aontana, US|9Nebraska, US|bw York, US|aorth Carolina, US|9Ohio, US|9Tennessee, US|bxas, US|9Virginia, US|2goffin, Kentucky, US|2haska, Iowa, US|3nomen, Minnesota, US|3oning, Ohio, US|2jor, Oklahoma, US|2lheur, Oregon, US|2nassas Park, Virginia, US|8, Virginia, US|4tee, Florida, US|3istee, Michigan, US|4towoc, Wisconsin, US|2rathon, Wisconsin, US|3engo, Alabama, US|3icopa, Arizona, US|4es, Missouri, US|4n, California, US|5e Corps, US Military, US|6tte, Wisconsin, US|4on, Alabama, US|9rkansas, US|8Florida, US|8Georgia, US|8Illinois, US|9ndiana, US|9owa, US|8Kansas, US|9entucky, US|8Mississippi, US|couri, US|8Ohio, US|9regon, US|8South Carolina, US|8Tennessee, US|axas, US|8West Virginia, US|4posa, California, US|3lboro, South Carolina, US|3quette, Michigan, US|bWisconsin, US|3shall, Alabama, US|aIllinois, US|bndiana, US|bowa, US|aKansas, US|bentucky, US|aMinnesota, US|cssissippi, US|aOklahoma, US|aSouth Dakota, US|aTennessee, US|aWest Virginia, US|3tin, Florida, US|8Indiana, US|8Kentucky, US|8Minnesota, US|8North Carolina, US|8Texas, US|6sville, Virginia, US|2son, Illinois, US|7Kentucky, US|7Michigan, US|7Texas, US|7Washington, US|8est Virginia, US|3sac, Illinois, US|2tagorda, Texas, US|4nuska-Susitna, Alaska, US|3hews, Virginia, US|2ui, Hawaii, US|3ry, Tennessee, US|2verick, Texas, US|2yes, Oklahoma, US|1cClain, Oklahoma, US|3one, Montana, US|4ok, South Dakota, US|4rmick, South Carolina, US|3racken, Kentucky, US|4eary, Kentucky, US|3ulloch, Texas, US|4rtain, Oklahoma, US|2Donald, Missouri, US|5ough, Illinois, US|4well, North Carolina, US|aWest Virginia, US|3uffie, Georgia, US|2Henry, Illinois, US|9North Dakota, US|2Intosh, Georgia, US|aNorth Dakota, US|aOklahoma, US|2Kean, Pennsylvania, US|4nzie, North Dakota, US|3inley, New Mexico, US|2Lean, Illinois, US|8Kentucky, US|8North Dakota, US|4nnan, Texas, US|4od, Minnesota, US|2Minn, Tennessee, US|3ullen, Texas, US|2Nairy, Tennessee, US|2Pherson, Kansas, US|bNebraska, US|bSouth Dakota, US|1eade, Kansas, US|8entucky, US|7South Dakota, US|3gher, Montana, US|2cklenburg, North Carolina, US|dVirginia, US|3osta, Michigan, US|2dina, Ohio, US|8Texas, US|2eker, Minnesota, US|2igs, Ohio, US|7Tennessee, US|2llette, South Dakota, US|2nard, Illinois, US|8Texas, US|3docino, California, US|3ifee, Kentucky, US|3ominee, Michigan, US|bWisconsin, US|2rced, California, US|5r, Illinois, US|8Kentucky, US|8Missouri, US|8New Jersey, US|9orth Dakota, US|8Ohio, US|8Pennsylvania, US|8West Virginia, US|3iwether, Georgia, US|3rick, Nebraska, US|5mack, New Hampshire, US|2sa, Colorado, US|2tcalfe, Kentucky, US|1iami, Indiana, US|7Kansas, US|7Ohio, US|5-Dade, Florida, US|2chigan Department of Corrections (MDOC), Michigan, US|2ddlesex, Connecticut, US|bMassachusetts, US|bNew Jersey, US|bVirginia, US|3land, Michigan, US|9Texas, US|2fflin, Pennsylvania, US|2lam, Texas, US|3lard, Utah, US|4e Lacs, Minnesota, US|5r, Arkansas, US|8Georgia, US|8Missouri, US|4s, Iowa, US|7Texas, US|3waukee, Wisconsin, US|2ner, South Dakota, US|5al, Colorado, US|9Montana, US|9Nevada, US|9West Virginia, US|3go, West Virginia, US|3idoka, Idaho, US|3nehaha, South Dakota, US|2ssaukee, Michigan, US|4issippi, Arkansas, US|dMissouri, US|4oula, Montana, US|2tchell, Georgia, US|aIowa, US|aKansas, US|aNorth Carolina, US|aTexas, US|1obile, Alabama, US|2doc, California, US|2ffat, Colorado, US|2have, Arizona, US|2niteau, Missouri, US|3mouth, New Jersey, US|3o, California, US|4na, Iowa, US|5galia, West Virginia, US|3roe, Alabama, US|9rkansas, US|8Florida, US|8Georgia, US|8Illinois, US|9ndiana, US|9owa, US|8Kentucky, US|8Michigan, US|assissippi, US|couri, US|8New York, US|8Ohio, US|8Pennsylvania, US|8Tennessee, US|8West Virginia, US|9isconsin, US|3tague, Texas, US|4calm, Michigan, US|4erey, California, US|5zuma, Colorado, US|4gomery, Alabama, US|drkansas, US|cGeorgia, US|cIllinois, US|dndiana, US|dowa, US|cKansas, US|dentucky, US|cMaryland, US|dississippi, US|gouri, US|cNew York, US|dorth Carolina, US|cOhio, US|cPennsylvania, US|cTennessee, US|exas, US|cVirginia, US|4morency, Michigan, US|4our, Pennsylvania, US|4rose, Colorado, US|2ody, South Dakota, US|3re, North Carolina, US|7Tennessee, US|9xas, US|2ra, New Mexico, US|3ehouse, Louisiana, US|3gan, Alabama, US|8Colorado, US|8Georgia, US|8Illinois, US|9ndiana, US|8Kentucky, US|8Missouri, US|8Ohio, US|8Tennessee, US|8Utah, US|8West Virginia, US|3rill, Nebraska, US|5s, Kansas, US|8New Jersey, US|8Texas, US|6on, Minnesota, US|4ow, Ohio, US|9regon, US|3ton, Kansas, US|8North Dakota, US|2tley, Texas, US|2ultrie, Illinois, US|3ntrail, North Dakota, US|2wer, Minnesota, US|1uhlenberg, Kentucky, US|2ltnomah, Oregon, US|2rray, Georgia, US|8Minnesota, US|8Oklahoma, US|2scatine, Iowa, US|4ogee, Georgia, US|3kegon, Michigan, US|4ingum, Ohio, US|4ogee, Oklahoma, US|3selshell, Montana, US|0Nacogdoches, Texas, US|2nce, Nebraska, US|3tucket, Massachusetts, US|2pa, California, US|2sh, North Carolina, US|3sau, Florida, US|8New York, US|2tchitoches, Louisiana, US|3rona, Wyoming, US|2vajo, Arizona, US|4rro, Texas, US|3y, US Military, US|1elson, Kentucky, US|8North Dakota, US|8Virginia, US|2maha, Kansas, US|8Nebraska, US|2osho, Kansas, US|2shoba, Mississippi, US|3s, Kansas, US|2vada, Arkansas, US|8California, US|2w Castle, Delaware, US|4Hanover, North Carolina, US|6ven, Connecticut, US|4Kent, Virginia, US|4London, Connecticut, US|4Madrid, Missouri, US|4York, New York, US|3aygo, Michigan, US|3berry, South Carolina, US|3port News, Virginia, US|7, Rhode Island, US|3ton, Arkansas, US|8Georgia, US|8Indiana, US|8Mississippi, US|couri, US|8Texas, US|2z Perce, Idaho, US|1iagara, New York, US|2cholas, Kentucky, US|aWest Virginia, US|3ollet, Minnesota, US|2obrara, Wyoming, US|1oble, Indiana, US|7Ohio, US|8klahoma, US|5s, Minnesota, US|2daway, Missouri, US|2lan, Texas, US|2me, Alaska, US|2rfolk, Massachusetts, US|9Virginia, US|3man, Minnesota, US|3th Slope, Alaska, US|5ampton, North Carolina, US|dPennsylvania, US|dVirginia, US|5umberland, Pennsylvania, US|gVirginia, US|5west Arctic, Alaska, US|4on, Kansas, US|8Virginia, US|2ttoway, Virginia, US|2wata, Oklahoma, US|2xubee, Mississippi, US|1uckolls, Nebraska, US|2eces, Texas, US|1ye, Nevada, US|0O'Brien, Iowa, US|1akland, Michigan, US|1bion, Tennessee, US|1cean, New Jersey, US|5a, Michigan, US|2hiltree, Texas, US|2onee, Georgia, US|8South Carolina, US|4to, Wisconsin, US|1gemaw, Michigan, US|2lala Lakota, South Dakota, US|3e, Illinois, US|4thorpe, Georgia, US|1hio, Indiana, US|6Kentucky, US|6West Virginia, US|1kaloosa, Florida, US|3nogan, Washington, US|2eechobee, Florida, US|2fuskee, Oklahoma, US|2lahoma, Oklahoma, US|2mulgee, Oklahoma, US|2tibbeha, Mississippi, US|1ldham, Kentucky, US|8Texas, US|2iver, North Dakota, US|2msted, Minnesota, US|1neida, Idaho, US|8New York, US|8Wisconsin, US|2ondaga, New York, US|2slow, North Carolina, US|2tario, New York, US|3onagon, Michigan, US|1range, California, US|8Florida, US|8Indiana, US|8New York, US|9orth Carolina, US|8Texas, US|8Vermont, US|9irginia, US|6burg, South Carolina, US|2egon, Missouri, US|2leans, Louisiana, US|9New York, US|9Vermont, US|1sage, Kansas, US|7Missouri, US|7Oklahoma, US|2borne, Kansas, US|2ceola, Florida, US|9Iowa, US|9Michigan, US|3oda, Michigan, US|2wego, New York, US|1tero, Colorado, US|7New Mexico, US|2oe, Nebraska, US|2sego, Michigan, US|8New York, US|2tawa, Kansas, US|8Michigan, US|8Ohio, US|9klahoma, US|3er Tail, Minnesota, US|1uachita, Arkansas, US|aLouisiana, US|2ray, Colorado, US|2t of AK, Alaska, US|8L, Alabama, US|8R, Arkansas, US|8Z, Arizona, US|7CA, California, US|8O, Colorado, US|8T, Connecticut, US|7DC, District of Columbia, US|8E, Delaware, US|7FL, Florida, US|7GA, Georgia, US|7HI, Hawaii, US|7IA, Iowa, US|8D, Idaho, US|8L, Illinois, US|8N, Indiana, US|7KS, Kansas, US|8Y, Kentucky, US|7LA, Louisiana, US|7MA, Massachusetts, US|8D, Maryland, US|8E, Maine, US|8I, Michigan, US|8N, Minnesota, US|8O, Missouri, US|8S, Mississippi, US|8T, Montana, US|7NC, North Carolina, US|8D, North Dakota, US|8E, Nebraska, US|8H, New Hampshire, US|8J, New Jersey, US|8M, New Mexico, US|8V, Nevada, US|8Y, New York, US|7OH, Ohio, US|8K, Oklahoma, US|8R, Oregon, US|7PA, Pennsylvania, US|7RI, Rhode Island, US|7SC, South Carolina, US|8D, South Dakota, US|7TN, Tennessee, US|8X, Texas, US|7UT, Utah, US|7VA, Virginia, US|8T, Vermont, US|7WA, Washington, US|8I, Wisconsin, US|8V, West Virginia, US|8Y, Wyoming, US|3agamie, Wisconsin, US|1verton, Tennessee, US|1wen, Indiana, US|6Kentucky, US|2sley, Kentucky, US|2yhee, Idaho, US|1xford, Maine, US|1zark, Missouri, US|3ukee, Wisconsin, US|0Pacific, Washington, US|2ge, Iowa, US|6Virginia, US|2lm Beach, Florida, US|3o Alto, Iowa, US|5Pinto, Texas, US|2mlico, North Carolina, US|2nola, Mississippi, US|8Texas, US|2rk, Colorado, US|6Montana, US|6Wyoming, US|4e, Indiana, US|5r, Texas, US|3mer, Texas, US|2sco, Florida, US|3quotank, North Carolina, US|3saic, New Jersey, US|2trick, Virginia, US|2ulding, Georgia, US|aOhio, US|2wnee, Kansas, US|8Nebraska, US|8Oklahoma, US|2yette, Idaho, US|3ne, Oklahoma, US|1each, Georgia, US|3rl River, Mississippi, US|2cos, Texas, US|2mbina, North Dakota, US|3iscot, Missouri, US|2nd Oreille, Washington, US|4er, North Carolina, US|4leton, Kentucky, US|bWest Virginia, US|3nington, Minnesota, US|cSouth Dakota, US|3obscot, Maine, US|2oria, Illinois, US|2pin, Wisconsin, US|2rkins, Nebraska, US|9South Dakota, US|3quimans, North Carolina, US|3ry, Alabama, US|8rkansas, US|7Illinois, US|8ndiana, US|7Kentucky, US|7Mississippi, US|bouri, US|7Ohio, US|7Pennsylvania, US|7Tennessee, US|3shing, Nevada, US|4on, North Carolina, US|2tersburg, Alaska, US|cVirginia, US|3roleum, Montana, US|3tis, Missouri, US|1helps, Missouri, US|8Nebraska, US|2iladelphia, Pennsylvania, US|4lips, Arkansas, US|aColorado, US|aKansas, US|aMontana, US|1iatt, Illinois, US|2ckaway, Ohio, US|4ens, Alabama, US|9Georgia, US|9South Carolina, US|5tt, Tennessee, US|2erce, Georgia, US|8Nebraska, US|9orth Dakota, US|8Washington, US|9isconsin, US|2ke, Alabama, US|7rkansas, US|6Georgia, US|6Illinois, US|7ndiana, US|6Kentucky, US|6Mississippi, US|aouri, US|6Ohio, US|6Pennsylvania, US|2ma, Arizona, US|2nal, Arizona, US|3e, Minnesota, US|4llas, Florida, US|2pestone, Minnesota, US|2scataquis, Maine, US|2tkin, Colorado, US|3t, North Carolina, US|4sburg, Oklahoma, US|5ylvania, Virginia, US|2ute, Utah, US|1lacer, California, US|3quemines, Louisiana, US|3tte, Missouri, US|8Nebraska, US|8Wyoming, US|2easants, West Virginia, US|2umas, California, US|2ymouth, Iowa, US|aMassachusetts, US|1ocahontas, Iowa, US|cWest Virginia, US|2insett, Arkansas, US|4te Coupee, Louisiana, US|2lk, Arkansas, US|6Florida, US|6Georgia, US|6Iowa, US|6Minnesota, US|8ssouri, US|6Nebraska, US|7orth Carolina, US|6Oregon, US|6Tennessee, US|8xas, US|6Wisconsin, US|2ndera, Montana, US|3totoc, Mississippi, US|aOklahoma, US|2pe, Arkansas, US|6Illinois, US|6Minnesota, US|2quoson, Virginia, US|2rtage, Ohio, US|9Wisconsin, US|4er, Indiana, US|4smouth, Virginia, US|2sey, Indiana, US|2ttawatomie, Kansas, US|eOklahoma, US|8tamie, Iowa, US|4er, Pennsylvania, US|8South Dakota, US|8Texas, US|2wder River, Montana, US|3ell, Kentucky, US|8Montana, US|4r, Idaho, US|4shiek, Iowa, US|3hatan, Virginia, US|1rairie, Arkansas, US|9Montana, US|3tt, Kansas, US|2eble, Ohio, US|3ntiss, Mississippi, US|3sidio, Texas, US|4que Isle, Michigan, US|4ton, West Virginia, US|2ice, Wisconsin, US|3nce Edward, Virginia, US|7George's, Maryland, US|d, Virginia, US|7William, Virginia, US|7of Wales-Hyder, Alaska, US|2ovidence, Rhode Island, US|3wers, Colorado, US|1ueblo, Colorado, US|2laski, Arkansas, US|9Georgia, US|9Illinois, US|andiana, US|9Kentucky, US|9Missouri, US|9Virginia, US|2shmataha, Oklahoma, US|2tnam, Florida, US|8Georgia, US|8Illinois, US|9ndiana, US|8Missouri, US|8New York, US|8Ohio, US|8Tennessee, US|8West Virginia, US|0Quay, New Mexico, US|2een Anne's, Maryland, US|5s, New York, US|2itman, Georgia, US|9Mississippi, US|0Rabun, Georgia, US|2cine, Wisconsin, US|2dford, Virginia, US|2ins, Texas, US|2leigh, West Virginia, US|3ls, Missouri, US|2msey, Minnesota, US|8North Dakota, US|2ndall, Texas, US|4olph, Alabama, US|brkansas, US|aGeorgia, US|aIllinois, US|bndiana, US|aMissouri, US|aNorth Carolina, US|aWest Virginia, US|3kin, Mississippi, US|3som, North Dakota, US|2pides, Louisiana, US|3pahannock, Virginia, US|2valli, Montana, US|2wlins, Kansas, US|2y, Missouri, US|1eagan, Texas, US|3l, Texas, US|2covered, US|2d Lake, Minnesota, US|4River, Louisiana, US|bTexas, US|4Willow, Nebraska, US|3wood, Minnesota, US|2eves, Texas, US|2fugio, Texas, US|2no, Kansas, US|3sselaer, New York, US|3ville, Minnesota, US|aNorth Dakota, US|2public, Kansas, US|2ynolds, Missouri, US|1hea, Tennessee, US|1ice, Kansas, US|6Minnesota, US|3h, Utah, US|4ardson, Nebraska, US|4land, Illinois, US|aLouisiana, US|aMontana, US|aNorth Dakota, US|aOhio, US|aSouth Carolina, US|aWisconsin, US|4mond City, Virginia, US|8, Georgia, US|aNew York, US|borth Carolina, US|aVirginia, US|2ley, Kansas, US|2nggold, Iowa, US|2o Arriba, New Mexico, US|4Blanco, Colorado, US|4Grande, Colorado, US|2pley, Indiana, US|8Missouri, US|2tchie, West Virginia, US|2verside, California, US|1oane, Tennessee, US|7West Virginia, US|4oke City, Virginia, US|7, Virginia, US|2berts, South Dakota, US|9Texas, US|7on, Kentucky, US|bTennessee, US|dxas, US|4son, North Carolina, US|2ck Island, Illinois, US|4, Minnesota, US|6Nebraska, US|6Wisconsin, US|4bridge, Virginia, US|4castle, Kentucky, US|4dale, Georgia, US|4ingham, New Hampshire, US|dorth Carolina, US|cVirginia, US|4land, New York, US|4wall, Texas, US|2ger Mills, Oklahoma, US|5s, Oklahoma, US|2lette, North Dakota, US|2oks, Kansas, US|3sevelt, Montana, US|bNew Mexico, US|2scommon, Michigan, US|3eau, Minnesota, US|4bud, Montana, US|3s, Ohio, US|2utt, Colorado, US|2wan, Kentucky, US|7North Carolina, US|1unnels, Texas, US|2sh, Indiana, US|6Kansas, US|3k, Texas, US|6Wisconsin, US|3sell, Alabama, US|9Kansas, US|aentucky, US|9Virginia, US|2therford, North Carolina, US|cTennessee, US|3land, Vermont, US|0Sabine, Louisiana, US|8Texas, US|2c, Iowa, US|3ramento, California, US|2gadahoc, Maine, US|3inaw, Michigan, US|3uache, Colorado, US|2lem, New Jersey, US|7Virginia, US|3ine, Arkansas, US|8Illinois, US|8Kansas, US|8Missouri, US|8Nebraska, US|3t Lake, Utah, US|3uda, South Carolina, US|2mpson, North Carolina, US|2n Augustine, Texas, US|4Benito, California, US|6rnardino, California, US|4Diego, California, US|4Francisco, California, US|4Jacinto, Texas, US|5oaquin, California, US|5uan, Colorado, US|aNew Mexico, US|aUtah, US|aWashington, US|4Luis Obispo, California, US|4Mateo, California, US|5iguel, Colorado, US|cNew Mexico, US|4Patricio, Texas, US|4Saba, Texas, US|3born, South Dakota, US|3ders, Montana, US|4oval, New Mexico, US|4usky, Ohio, US|3gamon, Illinois, US|3ilac, Michigan, US|3pete, Utah, US|3ta Barbara, California, US|6Clara, California, US|7ruz, Arizona, US|cCalifornia, US|6Fe, New Mexico, US|6Rosa, Florida, US|2rasota, Florida, US|4toga, New York, US|3gent, North Dakota, US|3py, Nebraska, US|2uk, Wisconsin, US|3nders, Nebraska, US|2wyer, Wisconsin, US|1chenectady, New York, US|3leicher, Texas, US|5y, Georgia, US|3oharie, New York, US|4olcraft, Michigan, US|3uyler, Illinois, US|aMissouri, US|aNew York, US|6kill, Pennsylvania, US|2ioto, Ohio, US|2otland, Missouri, US|aNorth Carolina, US|4t, Arkansas, US|7Illinois, US|8ndiana, US|8owa, US|7Kansas, US|8entucky, US|7Minnesota, US|9ssissippi, US|bouri, US|7Tennessee, US|7Virginia, US|5s Bluff, Nebraska, US|2reven, Georgia, US|2urry, Texas, US|1earcy, Arkansas, US|2bastian, Arkansas, US|2dgwick, Colorado, US|aKansas, US|2minole, Florida, US|aGeorgia, US|aOklahoma, US|2neca, New York, US|8Ohio, US|2quatchie, Tennessee, US|4oyah, Oklahoma, US|2vier, Arkansas, US|8Tennessee, US|8Utah, US|2ward, Kansas, US|8Nebraska, US|1hackelford, Texas, US|3nnon, Missouri, US|3rkey, Mississippi, US|4p, Arkansas, US|3sta, California, US|3wano, Wisconsin, US|4nee, Kansas, US|2eboygan, Wisconsin, US|3lby, Alabama, US|8Illinois, US|9ndiana, US|9owa, US|8Kentucky, US|8Missouri, US|8Ohio, US|8Tennessee, US|axas, US|3nandoah, Virginia, US|3rburne, Minnesota, US|4idan, Kansas, US|aMontana, US|aNebraska, US|borth Dakota, US|aWyoming, US|4man, Kansas, US|9Nebraska, US|9Oregon, US|9Texas, US|2iawassee, Michigan, US|2oshone, Idaho, US|1ibley, Minnesota, US|2erra, California, US|8New Mexico, US|2lver Bow, Montana, US|2mpson, Kentucky, US|9Mississippi, US|2oux, Iowa, US|7Nebraska, US|8orth Dakota, US|2skiyou, California, US|2tka, Alaska, US|1kagit, Washington, US|4way, Alaska, US|3mania, Washington, US|1lope, North Dakota, US|1mith, Kansas, US|7Mississippi, US|7Tennessee, US|9xas, US|2yth, Virginia, US|1nohomish, Washington, US|2yder, Pennsylvania, US|1ocorro, New Mexico, US|2lano, California, US|2merset, Maine, US|cryland, US|aNew Jersey, US|aPennsylvania, US|5vell, Texas, US|2noma, California, US|2uthampton, Virginia, US|5east Fairbanks, Alaska, US|aUtah, Utah, US|5west Utah, Utah, US|1palding, Georgia, US|3rtanburg, South Carolina, US|2encer, Indiana, US|9Kentucky, US|2ink, South Dakota, US|2okane, Washington, US|3tsylvania, Virginia, US|1t. Bernard, Louisiana, US|4Charles, Louisiana, US|dMissouri, US|5lair, Alabama, US|bIllinois, US|bMichigan, US|dssouri, US|5roix, Wisconsin, US|4Francis, Arkansas, US|9ois, Missouri, US|4Helena, Louisiana, US|4James, Louisiana, US|5ohn the Baptist, Louisiana, US|8s, Florida, US|6seph, Indiana, US|cMichigan, US|4Landry, Louisiana, US|6wrence, New York, US|5ouis City, Missouri, US|9, Minnesota, US|dssouri, US|5ucie, Florida, US|4Martin, Louisiana, US|7y's, Maryland, US|8, Louisiana, US|4Tammany, Louisiana, US|2aff, Federal Bureau of Prisons, US|5ord, Kansas, US|aVirginia, US|3nislaus, California, US|4ley, South Dakota, US|5y, North Carolina, US|4ton, Kansas, US|9Nebraska, US|3rk, Illinois, US|7North Dakota, US|7Ohio, US|5e, Indiana, US|4r, Texas, US|3unton, Virginia, US|2e. Genevieve, Missouri, US|3arns, Minnesota, US|3ele, Minnesota, US|8North Dakota, US|3phens, Georgia, US|aOklahoma, US|aTexas, US|8on, Illinois, US|3rling, Texas, US|3uben, Indiana, US|9New York, US|3vens, Kansas, US|9Minnesota, US|9Washington, US|3wart, Georgia, US|9Tennessee, US|2illwater, Montana, US|2oddard, Missouri, US|3kes, North Carolina, US|3ne, Arkansas, US|7Mississippi, US|bouri, US|5wall, Texas, US|3rey, Nevada, US|4y, Iowa, US|2rafford, New Hampshire, US|2utsman, North Dakota, US|1ublette, Wyoming, US|2ffolk, Massachusetts, US|9New York, US|9Virginia, US|2llivan, Indiana, US|aMissouri, US|aNew Hampshire, US|eYork, US|aPennsylvania, US|aTennessee, US|4y, South Dakota, US|2mmers, West Virginia, US|4it, Colorado, US|8Ohio, US|8Utah, US|3ner, Kansas, US|8Tennessee, US|3ter, Alabama, US|8Florida, US|8Georgia, US|8South Carolina, US|2nflower, Mississippi, US|2rry, North Carolina, US|7Virginia, US|2squehanna, Pennsylvania, US|3sex, Delaware, US|8New Jersey, US|8Virginia, US|2tter, California, US|4on, Texas, US|2wannee, Florida, US|1wain, North Carolina, US|2eet Grass, Montana, US|5water, Wyoming, US|2ift, Minnesota, US|3sher, Texas, US|3tzerland, Indiana, US|0Talbot, Georgia, US|8Maryland, US|3iaferro, Georgia, US|3ladega, Alabama, US|5hatchie, Mississippi, US|5poosa, Alabama, US|2ma, Iowa, US|2ney, Missouri, US|3gipahoa, Louisiana, US|2os, New Mexico, US|2rrant, Texas, US|2te, Mississippi, US|3tnall, Georgia, US|2ylor, Florida, US|8Georgia, US|8Iowa, US|8Kentucky, US|8Texas, US|8West Virginia, US|9isconsin, US|2zewell, Illinois, US|aVirginia, US|1ehama, California, US|2lfair, Georgia, US|3ler, Colorado, US|2nsas, Louisiana, US|2rrebonne, Louisiana, US|5ll, Georgia, US|9Texas, US|4y, Texas, US|2ton, Idaho, US|7Montana, US|7Wyoming, US|2xas, Missouri, US|7Oklahoma, US|1hayer, Nebraska, US|2omas, Georgia, US|8Kansas, US|8Nebraska, US|2rockmorton, Texas, US|2urston, Nebraska, US|aWashington, US|1ift, Georgia, US|2llamook, Oregon, US|4man, Oklahoma, US|2oga, New York, US|7Pennsylvania, US|2ppah, Mississippi, US|4ecanoe, Indiana, US|3ton, Indiana, US|8Tennessee, US|2shomingo, Mississippi, US|2tus, Texas, US|1odd, Kentucky, US|6Minnesota, US|6South Dakota, US|2lland, Connecticut, US|2m Green, Texas, US|3pkins, New York, US|2oele, Utah, US|3le, Montana, US|3mbs, Georgia, US|2rrance, New Mexico, US|2wner, North Dakota, US|4s, Georgia, US|1raill, North Dakota, US|3nsylvania, North Carolina, US|3verse, Minnesota, US|4is, Texas, US|2easure, Montana, US|3go, Kansas, US|3mpealeau, Wisconsin, US|3utlen, Georgia, US|2iCounty, Utah, US|3gg, Kentucky, US|3mble, Kentucky, US|3nity, California, US|9Texas, US|3pp, South Dakota, US|2oup, Georgia, US|4sdale, Tennessee, US|2umbull, Ohio, US|1ucker, West Virginia, US|2lare, California, US|3sa, Oklahoma, US|2nica, Mississippi, US|2olumne, California, US|2rner, Georgia, US|8South Dakota, US|2scaloosa, Alabama, US|5rawas, Ohio, US|4ola, Michigan, US|1wiggs, Georgia, US|3n Falls, Idaho, US|1yler, Texas, US|7West Virginia, US|2rrell, North Carolina, US|0US Military, US|1inta, Wyoming, US|5h, Utah, US|1lster, New York, US|1matilla, Oregon, US|1nassigned, Alabama, US|fska, US|drizona, US|ekansas, US|cCalifornia, US|dolorado, US|ennecticut, US|cDelaware, US|district of Columbia, US|cFlorida, US|cGeorgia, US|cHawaii, US|cIdaho, US|dllinois, US|dndiana, US|dowa, US|cKansas, US|dentucky, US|cLouisiana, US|cMaine, US|eryland, US|essachusetts, US|dichigan, US|ennesota, US|essissippi, US|gouri, US|dontana, US|cNebraska, US|evada, US|ew Hampshire, US|gJersey, US|gMexico, US|gYork, US|dorth Carolina, US|iDakota, US|cOhio, US|dklahoma, US|dregon, US|cPennsylvania, US|cRhode Island, US|cSouth Carolina, US|iDakota, US|cTennessee, US|exas, US|cUS Military, US|dtah, US|cVermont, US|dirginia, US|cWashington, US|dest Virginia, US|disconsin, US|dyoming, US|2icoi, Tennessee, US|3on, Arkansas, US|7Florida, US|7Georgia, US|7Illinois, US|8ndiana, US|8owa, US|7Kentucky, US|7Louisiana, US|7Mississippi, US|7New Jersey, US|bMexico, US|8orth Carolina, US|7Ohio, US|8regon, US|7Pennsylvania, US|7South Carolina, US|dDakota, US|7Tennessee, US|1pshur, Texas, US|8West Virginia, US|3on, Georgia, US|2ton, Texas, US|1tah, Utah, US|1valde, Texas, US|0Val Verde, Texas, US|3dez-Cordova, Alaska, US|3encia, New Mexico, US|3ley, Idaho, US|8Montana, US|8Nebraska, US|2n Buren, Arkansas, US|bIowa, US|bMichigan, US|bTennessee, US|4Wert, Ohio, US|4Zandt, Texas, US|3ce, North Carolina, US|3derburgh, Indiana, US|1enango, Pennsylvania, US|3tura, California, US|2rmilion, Illinois, US|bLouisiana, US|6lion, Indiana, US|3non, Louisiana, US|8Missouri, US|8Wisconsin, US|2teran Hospitals, US|1ictoria, Texas, US|2go, Indiana, US|2las, Wisconsin, US|2nton, Ohio, US|2rginia Beach, Virginia, US|1olusia, Florida, US|0Wabash, Illinois, US|9ndiana, US|6a, Minnesota, US|4unsee, Kansas, US|2dena, Minnesota, US|2goner, Oklahoma, US|2hkiakum, Washington, US|2ke, North Carolina, US|3ulla, Florida, US|2ldo, Maine, US|3ker, Alabama, US|8Georgia, US|8Texas, US|3la Walla, Washington, US|5ce, Kansas, US|4er, Texas, US|4owa, Oregon, US|3sh, North Dakota, US|3thall, Mississippi, US|4on, Florida, US|8Georgia, US|3worth, South Dakota, US|aWisconsin, US|2pello, Iowa, US|2rd, North Dakota, US|6Texas, US|3e, Georgia, US|3ren, Georgia, US|8Illinois, US|9ndiana, US|9owa, US|8Kentucky, US|8Mississippi, US|couri, US|8New Jersey, US|cYork, US|9orth Carolina, US|8Ohio, US|8Pennsylvania, US|8Tennessee, US|8Virginia, US|4ick, Indiana, US|2satch, Utah, US|3co, Oregon, US|3eca, Minnesota, US|3hakie, Wyoming, US|4burn, Wisconsin, US|4ington, Alabama, US|drkansas, US|cColorado, US|cFlorida, US|cGeorgia, US|cIdaho, US|dllinois, US|dndiana, US|dowa, US|cKansas, US|dentucky, US|cLouisiana, US|cMaine, US|eryland, US|dinnesota, US|essissippi, US|gouri, US|cNebraska, US|ew York, US|dorth Carolina, US|cOhio, US|dklahoma, US|dregon, US|cPennsylvania, US|cRhode Island, US|cTennessee, US|exas, US|cUtah, US|cVermont, US|dirginia, US|cWisconsin, US|5ta, Oklahoma, US|4oe, Nevada, US|4tenaw, Michigan, US|2tauga, North Carolina, US|3onwan, Minnesota, US|2ukesha, Wisconsin, US|3paca, Wisconsin, US|3shara, Wisconsin, US|2yne, Georgia, US|7Illinois, US|8ndiana, US|8owa, US|7Kentucky, US|7Michigan, US|9ssissippi, US|bouri, US|7Nebraska, US|9w York, US|8orth Carolina, US|7Ohio, US|7Pennsylvania, US|7Tennessee, US|7Utah, US|7West Virginia, US|5sboro, Virginia, US|1eakley, Tennessee, US|2bb, Texas, US|3er, Utah, US|5-Morgan, Utah, US|3ster, Georgia, US|9Iowa, US|9Kentucky, US|9Louisiana, US|9Mississippi, US|douri, US|9Nebraska, US|9West Virginia, US|2ld, Colorado, US|3ls, Indiana, US|7North Dakota, US|2st Baton Rouge, Louisiana, US|5Carroll, Louisiana, US|5Feliciana, Louisiana, US|4chester, New York, US|4moreland, Pennsylvania, US|eVirginia, US|4on, Wyoming, US|2tzel, West Virginia, US|2xford, Michigan, US|1harton, Texas, US|3tcom, Washington, US|2eatland, Montana, US|3eler, Georgia, US|9Nebraska, US|9Oregon, US|9Texas, US|2ite Pine, Nevada, US|5, Arkansas, US|7Georgia, US|7Illinois, US|8ndiana, US|7Tennessee, US|5side, Illinois, US|4field, Georgia, US|4ley, Indiana, US|9Kentucky, US|4man, Washington, US|1ibaux, Montana, US|2chita, Kansas, US|9Texas, US|3omico, Maryland, US|2lbarger, Texas, US|3cox, Alabama, US|8Georgia, US|3kes, Georgia, US|8North Carolina, US|4in, Minnesota, US|6son, Georgia, US|bMississippi, US|3l, Illinois, US|4acy, Texas, US|4iams, North Dakota, US|aOhio, US|8burg, South Carolina, US|eVirginia, US|8on, Illinois, US|cTennessee, US|exas, US|3son, Kansas, US|8North Carolina, US|8Tennessee, US|axas, US|2nchester, Virginia, US|3dham, Connecticut, US|9Vermont, US|4sor, Vermont, US|3kler, Texas, US|3n, Louisiana, US|4ebago, Illinois, US|cowa, US|bWisconsin, US|5shiek, Iowa, US|3ona, Minnesota, US|3ston, Alabama, US|9Mississippi, US|2rt, West Virginia, US|2se, Texas, US|6Virginia, US|1olfe, Kentucky, US|2od, Ohio, US|6Texas, US|6West Virginia, US|7isconsin, US|4bury, Iowa, US|4ford, Illinois, US|aKentucky, US|4ruff, Arkansas, US|4s, Oklahoma, US|5on, Kansas, US|4ward, Oklahoma, US|2rcester, Maryland, US|dssachusetts, US|3th, Georgia, US|7Iowa, US|7Missouri, US|1rangell, Alaska, US|2ight, Iowa, US|8Minnesota, US|assouri, US|1yandot, Ohio, US|7te, Kansas, US|2oming, New York, US|9Pennsylvania, US|9West Virginia, US|2the, Virginia, US|0Yadkin, North Carolina, US|2kima, Washington, US|3utat plus Hoonah-Angoon, Alaska, US|2lobusha, Mississippi, US|2mhill, Oregon, US|2ncey, North Carolina, US|3kton, South Dakota, US|2tes, New York, US|2vapai, Arizona, US|2zoo, Mississippi, US|1ell, Arkansas, US|4ow Medicine, Minnesota, US|6stone, Montana, US|1oakum, Texas, US|2lo, California, US|2rk, Maine, US|6Nebraska, US|6Pennsylvania, US|6South Carolina, US|6Virginia, US|2ung, Texas, US|1uba, California, US|2kon-Koyukuk, Alaska, US|2ma, Arizona, US|6Colorado, US|0Zapata, Texas, US|2vala, Texas, US|1iebach, South Dakota, US|0Uzbekistan|0Holy See|0Saint Vincent and the Grenadines|0Venezuela|0British Virgin Islands, United Kingdom|0Virgin Islands, US|2etnam|1anuatu|0Wallis and Futuna, France|0Samoa|0Kosovo|0Yemen|0South Africa|0Zambia|1imbabwe","sep":"|"},{"d":"BEL|BRA|CHL|COL|DEU|IND|ITA|JPN|MYS|MEX|MDA|NLD|NGA|PAK|PER|POL|ROU|RUS|SVK|ESP|SWE|UKR|GBR|AUS|CAN|CHN|USA|PRI||ABW|AFG|AGO|AIA|ALB|AND|ARE|ARG|ARM|ASM|ATA|ATG|AUT|AZE|BDI|BEN|BES|BFA|BGD|BGR|BHR|BHS|BIH|BLM|BLR|BLZ|BMU|BOL|BRB|BRN|BTN|BWA|CAF|CHE|CIV|CMR|COD|COG|COK|COM|CPV|CRI|CUB|CUW|CYM|CYP|CZE|DJI|DMA|DNK|DOM|DZA|ECU|EGY|ERI|ESH|EST|ETH|FIN|FJI|FLK|FRA|FRO|FSM|GAB|GEO|GGY|GHA|GIB|GIN|GLP|GMB|GNB|GNQ|GRC|GRD|GRL|GTM|GUF|GUM|GUY|HKG|HND|HRV|HTI|HUN|IDN|IMN|IRL|IRN|IRQ|ISL|ISR|JAM|JEY|JOR|KAZ|KEN|KGZ|KHM|KIR|KNA|KOR|KWT|LAO|LBN|LBR|LBY|LCA|LIE|LKA|LSO|LTU|LUX|LVA|MAC|MAF|MAR|MCO|MDG|MDV|MHL|MKD|MLI|MLT|MMR|MNE|MNG|MNP|MOZ|MRT|MSR|MTQ|MUS|MWI|MYT|NAM|NCL|NER|NIC|NOR|NPL|NZL|OMN|PAN|PHL|PLW|PNG|PRT|PRY|PSE|PYF|QAT|REU|RWA|SAU|SDN|SEN|SGP|SHN|SLB|SLE|SLV|SMR|SOM|SPM|SRB|SSD|STP|SUR|SVN|SWZ|SXM|SYC|SYR|TCA|TCD|TGO|THA|TJK|TLS|TON|TTO|TUN|TUR|TWN|TZA|UGA|URY|UZB|VAT|VCT|VEN|VGB|VIR|VNM|VUT|WLF|WSM|XKS|YEM|ZAF|ZMB|ZWE","r":"0*4,1*3,2*2,3*2,4*2,5*3,6*2,7*2,8*2,9*2,a*3,b*2,c*2,d*2,e*2,f*2,g*2,h*2,i*2,j*2,k*2,l*2,m*2,n*2,o*5,p*2,q*1,r*1,q*1i,s*4,t*1,u*1,v*1,w*1,x*1,y*1,z*1,10*1,11*1,12*1,13*1,14*1,n*7,15*1,16*1,17*1,0*9,18*1,19*1,1a*1,1b*1,1c*1,1d*1,1e*1,1f*1,1g*1,1h*1,1i*1,1j*1,1k*1,1*q,1l*1,1m*1,1n*1,1o*1,1p*1,o*c,1q*1,2*g,p*v,1r*1,1s*1,1t*1,1u*1,1v*1,3*x,1w*1,1x*1,1y*1,1z*1,20*1,21*1,22*1,23*1,4*g,24*1,25*1,26*1,27*1,28*1,29*1,2a*1,2b*1,2c*1,j*j,2d*1,2e*1,2f*1,2g*1,2h*1,2i*1,2j*1,2k*1,2l*1,m*5,2m*1,2n*1,2o*1,2p*1,2q*1,2r*1,2s*1,2t*1,2u*1,2v*1,2w*1,2x*1,2y*1,2z*1,30*1,31*1,32*1,33*1,34*1,35*1,36*1,37*1,38*1,5*z,39*1,3a*1,3b*1,3c*1,3d*1,6*k,3e*1,3f*1,3g*1,7*1c,3h*1,3i*1,3j*1,3k*1,3l*1,3m*1,3n*1,3o*1,3p*1,3q*1,3r*1,3s*1,3t*1,3u*1,3v*1,3w*1,3x*1,3y*1,3z*1,40*1,41*1,42*1,43*1,a*17,44*1,45*1,9*w,46*1,47*1,48*1,49*1,4a*1,4b*1,4c*1,4d*1,4e*1,4f*1,4g*1,4h*1,4i*1,4j*1,8*g,4k*1,4l*1,4m*1,4n*1,c*11,4o*1,b*c,4p*1,4q*1,4r*1,4s*1,d*7,4t*1,e*p,4u*1,4v*1,4w*1,f*g,r*28,4x*1,4y*1,4z*1,50*1,51*1,52*1,g*16,h*2b,53*1,54*1,55*1,56*1,57*1,58*1,59*1,5a*1,5b*1,5c*1,5d*1,5e*1,5f*1,5g*1,5h*1,5i*1,i*8,5j*1,k*l,5k*1,5l*1,5m*1,5n*1,5o*1,5p*1,5q*1,5r*1,5s*1,5t*1,5u*1,5v*1,5w*1,5x*1,5y*1,5z*1,60*1,l*r,61*1,q*2iq,62*1,63*1,64*1,65*1,66*1,67*1,68*1,69*1,6a*1,6b*1,6c*1,6d*1,6e*1,6f*1,6g*1","sep":"|"},{"d":"|Antwerp|Limburg|Unknown|Acre|Amazonas|Antofagasta|Baden-Wurttemberg|Andaman and Nicobar Islands|Punjab|Abruzzo|Aichi|Johor|Aguascalientes|Anenii Noi|Calarasi|Drenthe|Abia|Azad Jammu and Kashmir|Dolnoslaskie|Alba|Adygea Republic|Banska Bystrica|Andalusia|Blekinge|Cherkasy Oblast|England|Australian Capital Territory|Alberta|Diamond Princess|Grand Princess|Recovered|Anhui|Puerto Rico|Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming|US Military|Federal Bureau of Prisons|Aruba|Anguilla|American Samoa|New South Wales|Northern Territory|Queensland|South Australia|Tasmania|Victoria|Western Australia|Brussels|East Flanders|Flemish Brabant|Hainaut|Liege|Luxembourg|Namur|Walloon Brabant|West Flanders|Bonaire, Sint Eustatius and Saba|Saint Barthelemy|Bermuda|Alagoas|Amapa|Bahia|Ceara|Distrito Federal|Espirito Santo|Goias|Maranhao|Mato Grosso do Sul|Mato Grosso|Minas Gerais|Para|Paraiba|Parana|Pernambuco|Piaui|Rio Grande do Norte|Rio Grande do Sul|Rio de Janeiro|Rondonia|Roraima|Santa Catarina|Sao Paulo|Sergipe|Tocantins|British Columbia|Manitoba|New Brunswick|Newfoundland and Labrador|Northwest Territories|Nova Scotia|Nunavut|Ontario|Prince Edward Island|Quebec|Saskatchewan|Yukon|Araucania|Arica y Parinacota|Atacama|Aysen|Biobio|Coquimbo|Los Lagos|Los Rios|Magallanes|Maule|Metropolitana|Nuble|OHiggins|Tarapaca|Valparaiso|Beijing|Chongqing|Fujian|Gansu|Guangdong|Guangxi|Guizhou|Hainan|Hebei|Heilongjiang|Henan|Hubei|Hunan|Inner Mongolia|Jiangsu|Jiangxi|Jilin|Liaoning|Ningxia|Qinghai|Shaanxi|Shandong|Shanghai|Shanxi|Sichuan|Tianjin|Tibet|Xinjiang|Yunnan|Zhejiang|Cook Islands|Antioquia|Arauca|Atlantico|Bolivar|Boyaca|Caldas|Capital District|Caqueta|Casanare|Cauca|Cesar|Choco|Cordoba|Cundinamarca|Guainia|Guaviare|Huila|La Guajira|Magdalena|Meta|Narino|Norte de Santander|Putumayo|Quindio|Risaralda|San Andres y Providencia|Santander|Sucre|Tolima|Valle del Cauca|Vaupes|Vichada|Curacao|Cayman Islands|Bayern|Berlin|Brandenburg|Bremen|Hamburg|Hessen|Mecklenburg-Vorpommern|Niedersachsen|Nordrhein-Westfalen|Rheinland-Pfalz|Saarland|Sachsen|Sachsen-Anhalt|Schleswig-Holstein|Thuringen|Aragon|Asturias|Baleares|C. Valenciana|Canarias|Cantabria|Castilla - La Mancha|Castilla y Leon|Catalonia|Ceuta|Extremadura|Galicia|La Rioja|Madrid|Melilla|Murcia|Navarra|Pais Vasco|Falkland Islands (Malvinas)|Faroe Islands|Channel Islands|Northern Ireland|Scotland|Wales|Guernsey|Gibraltar|Guadeloupe|Greenland|French Guiana|Guam|Hong Kong|Isle of Man|Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|Chandigarh|Chhattisgarh|Dadra and Nagar Haveli and Daman and Diu|Delhi|Goa|Gujarat|Haryana|Himachal Pradesh|Jammu and Kashmir|Jharkhand|Karnataka|Kerala|Ladakh|Lakshadweep|Madhya Pradesh|Maharashtra|Manipur|Meghalaya|Mizoram|Nagaland|Odisha|Puducherry|Rajasthan|Sikkim|Tamil Nadu|Telangana|Tripura|Uttar Pradesh|Uttarakhand|West Bengal|Basilicata|Calabria|Campania|Emilia-Romagna|Friuli Venezia Giulia|Lazio|Liguria|Lombardia|Marche|Molise|P.A. Bolzano|P.A. Trento|Piemonte|Puglia|Sardegna|Sicilia|Toscana|Umbria|Valle d'Aosta|Veneto|Jersey|Akita|Aomori|Chiba|Ehime|Fukui|Fukuoka|Fukushima|Gifu|Gunma|Hiroshima|Hokkaido|Hyogo|Ibaraki|Ishikawa|Iwate|Kagawa|Kagoshima|Kanagawa|Kochi|Kumamoto|Kyoto|Mie|Miyagi|Miyazaki|Nagano|Nagasaki|Nara|Niigata|Oita|Okayama|Okinawa|Osaka|Port Quarantine|Saga|Saitama|Shiga|Shimane|Shizuoka|Tochigi|Tokushima|Tokyo|Tottori|Toyama|Wakayama|Yamagata|Yamaguchi|Yamanashi|Macau|St Martin|Balti|Basarabeasca|Bender|Briceni|Cahul|Camenca|Cantemir|Causeni|Ceadir-Lunga|Chisinau|Cimislia|Comrat|Criuleni|Donduseni|Drochia|Dubasari|Edinet|Falesti|Floresti|Glodeni|Grigoriopol|Hincesti|Ialoveni|Leova|Nisporeni|Ocnita|Orhei|Rezina|Ribnita|Riscani|Singerei|Slobozia|Soldanesti|Soroca|Stefan Voda|Straseni|Taraclia|Telenesti|Tiraspol|Transnistria|Ungheni|Vulcanesti|Baja California Sur|Baja California|Campeche|Chiapas|Chihuahua|Ciudad de Mexico|Coahuila|Colima|Durango|Guanajuato|Guerrero|Hidalgo|Jalisco|Mexico|Michoacan|Morelos|Nayarit|Nuevo Leon|Oaxaca|Puebla|Queretaro|Quintana Roo|San Luis Potosi|Sinaloa|Sonora|Tabasco|Tamaulipas|Tlaxcala|Veracruz|Yucatan|Zacatecas|Northern Mariana Islands|Montserrat|Martinique|Kedah|Kelantan|Melaka|Negeri Sembilan|Pahang|Perak|Perlis|Pulau Pinang|Sabah|Sarawak|Selangor|Terengganu|W.P. Kuala Lumpur|W.P. Labuan|W.P. Putrajaya|Mayotte|New Caledonia|Adamawa|Akwa Ibom|Anambra|Bauchi|Bayelsa|Benue|Borno|Cross River|Delta|Ebonyi|Edo|Ekiti|Enugu|Federal Capital Territory|Gombe|Imo|Jigawa|Kaduna|Kano|Katsina|Kebbi|Kogi|Kwara|Lagos|Nasarawa|Niger|Ogun|Ondo|Osun|Oyo|Plateau|Rivers|Sokoto|Taraba|Yobe|Zamfara|Flevoland|Friesland|Gelderland|Groningen|Noord-Brabant|Noord-Holland|Overijssel|Utrecht|Zeeland|Zuid-Holland|Balochistan|Gilgit-Baltistan|Islamabad|Khyber Pakhtunkhwa|Sindh|Ancash|Apurimac|Arequipa|Ayacucho|Cajamarca|Callao|Cusco|Huancavelica|Huanuco|Ica|Junin|La Libertad|Lambayeque|Lima|Loreto|Madre de Dios|Moquegua|Pasco|Piura|Puno|San Martin|Tacna|Tumbes|Ucayali|Kujawsko-pomorskie|Lodzkie|Lubelskie|Lubuskie|Malopolskie|Mazowieckie|Opolskie|Podkarpackie|Podlaskie|Pomorskie|Slaskie|Swietokrzyskie|Warminsko-mazurskie|Wielkopolskie|Zachodniopomorskie|French Polynesia|Reunion|Arad|Arges|Bacau|Bihor|Bistrita-Nasaud|Botosani|Braila|Brasov|Bucuresti|Buzau|Caras-Severin|Cluj|Constanta|Covasna|Dambovita|Dolj|Galati|Giurgiu|Gorj|Harghita|Hunedoara|Ialomita|Iasi|Ilfov|Maramures|Mehedinti|Mures|Neamt|Olt|Prahova|Salaj|Satu Mare|Sibiu|Suceava|Teleorman|Timis|Tulcea|Valcea|Vaslui|Vrancea|Altai Krai|Altai Republic|Amur Oblast|Arkhangelsk Oblast|Astrakhan Oblast|Bashkortostan Republic|Belgorod Oblast|Bryansk Oblast|Buryatia Republic|Chechen Republic|Chelyabinsk Oblast|Chukotka Autonomous Okrug|Chuvashia Republic|Dagestan Republic|Ingushetia Republic|Irkutsk Oblast|Ivanovo Oblast|Jewish Autonomous Okrug|Kabardino-Balkarian Republic|Kaliningrad Oblast|Kalmykia Republic|Kaluga Oblast|Kamchatka Krai|Karachay-Cherkess Republic|Karelia Republic|Kemerovo Oblast|Khabarovsk Krai|Khakassia Republic|Khanty-Mansi Autonomous Okrug|Kirov Oblast|Komi Republic|Kostroma Oblast|Krasnodar Krai|Krasnoyarsk Krai|Kurgan Oblast|Kursk Oblast|Leningrad Oblast|Lipetsk Oblast|Magadan Oblast|Mari El Republic|Mordovia Republic|Moscow Oblast|Moscow|Murmansk Oblast|Nenets Autonomous Okrug|Nizhny Novgorod Oblast|North Ossetia - Alania Republic|Novgorod Oblast|Novosibirsk Oblast|Omsk Oblast|Orel Oblast|Orenburg Oblast|Penza Oblast|Perm Krai|Primorsky Krai|Pskov Oblast|Rostov Oblast|Ryazan Oblast|Saint Petersburg|Sakha (Yakutiya) Republic|Sakhalin Oblast|Samara Oblast|Saratov Oblast|Smolensk Oblast|Stavropol Krai|Sverdlovsk Oblast|Tambov Oblast|Tatarstan Republic|Tomsk Oblast|Tula Oblast|Tver Oblast|Tyumen Oblast|Tyva Republic|Udmurt Republic|Ulyanovsk Oblast|Vladimir Oblast|Volgograd Oblast|Vologda Oblast|Voronezh Oblast|Yamalo-Nenets Autonomous Okrug|Yaroslavl Oblast|Zabaykalsky Krai|Saint Helena, Ascension and Tristan da Cunha|Saint Pierre and Miquelon|Bratislava|Kosice|Nitra|Presov|Trencin|Trnava|Zilina|Dalarna|Gavleborg|Gotland|Halland|Jamtland Harjedalen|Jonkoping|Kalmar|Kronoberg|Norrbotten|Orebro|Ostergotland|Skane|Sormland|Stockholm|Uppsala|Varmland|Vasterbotten|Vasternorrland|Vastmanland|Vastra Gotaland|Sint Maarten|Turks and Caicos Islands|Chernihiv Oblast|Chernivtsi Oblast|Crimea Republic*|Dnipropetrovsk Oblast|Donetsk Oblast|Ivano-Frankivsk Oblast|Kharkiv Oblast|Kherson Oblast|Khmelnytskyi Oblast|Kiev Oblast|Kiev|Kirovohrad Oblast|Luhansk Oblast|Lviv Oblast|Mykolaiv Oblast|Odessa Oblast|Poltava Oblast|Rivne Oblast|Sevastopol*|Sumy Oblast|Ternopil Oblast|Vinnytsia Oblast|Volyn Oblast|Zakarpattia Oblast|Zaporizhia Oblast|Zhytomyr Oblast|Veteran Hospitals|British Virgin Islands|Virgin Islands|Wallis and Futuna","i":"0,1,2,3,0,4,5,0,6,0,5,0,7,0,8,9,0,a,0,b,0,c,0,d,0,e,f,0,g,0,h,0,i,0,5,0,j,0,k,0,l,0,m,0,n,0,o,0,p,0,q,0,r,0,s,t,u,v,0,w,0,x,t,y,z,10,11,12,13,14,15,16,17,18,19,1a,1b,1c,1d,1e,1f,1g,1h,1i,1j,1k,1l,1m,1n,1o,1p,1q,1r,1s,1t,1u,1v,1w,1x,1y,1z,20,21,22,23,24,25,26,27,28,29,2a,2b,2c,2d,2e,0,0,0,0,2f,0,0,2g,0,0,0,0,0,2h,0,0,2i,2j,2k,2l,2m,2n,2o,0,0,0,2p,2q,2r,2s,2t,2u,2v,2w,2x,0,2y,0,0,0,0,0,0,2z,0,0,30,0,31,32,33,34,35,36,37,38,39,3a,3b,3c,3d,3e,3f,3g,3h,3i,3j,3k,3l,3m,3n,3o,3p,3,0,0,0,0,0,3q,3r,3s,3t,3u,3v,3w,3x,3y,3z,40,41,0,42,43,44,45,46,47,48,49,4a,4b,4c,4d,4e,4f,3,4g,4h,4i,4j,4k,4l,4m,4n,4o,4p,4q,4r,4s,4t,4u,4v,4w,4x,4y,4z,50,51,52,53,54,55,56,57,3,58,59,5a,0,0,0,0,5b,5c,5d,5e,5f,5g,5h,5i,5j,5k,5l,5m,5n,5o,5p,5q,5r,5s,5t,5u,5v,5w,5x,5y,5z,60,61,62,63,64,3,65,66,67,0,0,0,0,68,69,0,0,6a,6b,6c,6d,6e,6f,6g,6h,6i,6j,6k,6l,6m,6n,6o,3,0,0,0,0,0,0,0,0,0,6p,6q,6r,6s,6t,6u,6v,6w,6x,6y,6z,70,71,72,73,74,75,76,3,0,0,0,0,77,0,78,0,0,79,7a,7b,3,7c,0,7d,0,7e,0,7f,0,0,0,0,0,7g,0,7h,7i,0,7j,0,0,0,0,0,7k,7l,7m,7n,7o,7p,7q,7r,7s,7t,7u,7v,7w,7x,7y,7z,80,81,82,83,84,85,86,87,88,89,8a,8b,8c,8d,8e,8f,3,8g,8h,8i,0,0,0,0,0,8j,8k,8l,8m,8n,8o,8p,8q,8r,8s,8t,8u,8v,8w,8x,8y,8z,90,91,92,0,93,0,94,95,96,97,98,99,9a,9b,9c,9d,9e,9f,9g,9h,9i,9j,9k,9l,9m,9n,9o,9p,9q,9r,9s,9t,9u,9v,9w,9x,9y,9z,a0,a1,a2,a3,a4,a5,a6,a7,a8,a9,aa,3,ab,ac,ad,ae,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,af,ag,0,0,ah,ai,aj,ak,al,am,an,ao,ap,aq,ar,as,at,au,av,aw,ax,ay,az,b0,b1,b2,b3,b4,b5,b6,b7,b8,b9,ba,bb,bc,bd,be,bf,bg,bh,bi,bj,bk,bl,3,bm,0,0,bn,bo,bp,bq,br,bs,bt,bu,bv,bw,bx,by,bz,c0,c1,c2,c3,c4,c5,c6,c7,c8,c9,ca,cb,cc,cd,ce,3,cf,cg,ch,0,0,0,0,0,0,0,ci,0,0,cj,ck,0,0,cl,cm,cn,co,cp,cq,cr,cs,ct,cu,cv,cw,3,cx,cy,cz,d0,0,d1,0,d2,d3,d4,d5,d6,d7,d8,d9,da,db,dc,dd,de,df,dg,dh,di,dj,dk,dl,dm,dn,do,dp,dq,dr,ds,dt,du,dv,dw,dx,dy,dz,3,e0,e1,0,e2,e3,e4,e5,2,e6,e7,e8,3,e9,ea,eb,0,0,0,0,ec,ed,ee,ef,9,eg,3,0,eh,ei,ej,ek,el,em,en,eo,ep,eq,er,es,et,eu,ev,ew,ex,ey,ez,f0,f1,f2,f3,f4,3,0,0,0,f5,f6,f7,f8,f9,fa,fb,fc,fd,fe,ff,fg,3,fh,fi,fj,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,0,0,0,fk,0,fl,fm,fn,fo,fp,fq,fr,fs,ft,fu,fv,f,fw,fx,fy,fz,g0,g1,g2,g3,g4,g5,g6,g7,g8,g9,ga,gb,gc,gd,ge,gf,gg,gh,gi,gj,gk,gl,gm,3,gn,go,gp,gq,gr,gs,gt,gu,gv,gw,gx,gy,gz,h0,h1,h2,h3,h4,h5,h6,h7,h8,h9,ha,hb,hc,hd,he,hf,hg,hh,hi,hj,hk,hl,hm,hn,ho,hp,hq,hr,hs,ht,hu,hv,hw,hx,hy,hz,i0,i1,i2,i3,i4,i5,i6,i7,i8,i9,ia,ib,ic,id,ie,if,ig,ih,ii,ij,ik,il,im,in,io,ip,iq,ir,is,3,it,iu,iv,iw,ix,iy,iz,0,0,0,0,0,j0,0,0,0,0,0,j1,0,0,0,0,j2,j3,j4,j5,j6,j7,3,j8,0,j9,ja,jb,jc,jd,je,jf,jg,jh,ji,jj,jk,jl,jm,3,jn,jo,jp,jq,jr,js,0,jt,0,0,ju,0,0,0,0,0,0,0,0,0,0,0,0,jv,jw,jx,jy,jz,k0,k1,k2,k3,k4,k5,k6,k7,k8,k9,ka,kb,kc,kd,ke,kf,3,kg,kh,ki,kj,kk,0,22,1g,28,1a,1d,1f,1n,1y,13,1a,1b,1c,1d,1m,1p,1w,1x,20,29,2b,27,22,1l,17,1v,12,13,1u,2c,28,1k,1m,z,z,1b,1v,28,1y,1k,1d,1k,1i,1u,1v,28,20,1c,1e,1f,1g,1x,22,1k,12,12,28,28,1m,z,1e,1f,22,24,25,1n,25,1h,25,1i,1l,1v,1p,1k,10,1d,18,28,25,13,25,13,1k,11,28,20,25,2d,1h,1p,1g,1v,1x,2b,11,1x,29,1g,25,1e,1n,1x,18,1s,1y,1m,1n,1d,1x,28,23,25,y,1v,1g,13,18,25,17,18,1z,y,18,1f,1i,1i,22,25,18,1p,1a,1k,1e,y,2a,1w,1j,22,1f,2b,18,1k,1n,1c,1e,1n,18,25,1n,1f,28,11,17,1k,2b,25,23,1a,26,1v,22,1g,1y,20,26,1o,1l,1y,20,24,28,25,1r,1f,25,1x,1l,18,1a,23,27,1w,13,11,1c,1d,1l,1m,1n,1z,24,29,1k,1s,22,2a,20,1j,1t,18,1k,1v,z,25,y,18,1g,1o,2c,1l,1w,1a,1d,1c,1v,1a,1o,1p,1y,20,25,28,18,24,y,24,1l,1a,1m,1n,23,1b,1a,1a,11,1b,1c,1d,1f,1n,1p,2a,25,25,1g,28,1w,13,1a,1e,1f,25,1w,1p,26,1f,1p,1f,1f,17,20,11,24,1k,18,2a,25,25,1f,1f,1d,17,25,25,z,z,1j,21,28,1o,1u,2a,23,18,25,1u,13,17,1b,1c,1e,1l,1p,1x,23,25,2b,23,1v,28,18,1y,1d,1n,28,28,20,1d,28,1p,23,2b,1f,18,y,1v,1b,18,1v,1w,1w,25,1s,25,2b,1p,y,1d,1e,1f,1n,1p,1x,20,12,1a,23,18,1v,2a,26,1g,1y,12,1g,1f,1g,1n,1v,25,27,y,11,17,18,1b,1d,1k,1m,22,25,2a,25,1n,1f,2b,1i,1a,20,18,1n,1s,1v,1g,20,25,25,1f,23,24,28,2c,1y,18,24,1a,1n,1s,1o,20,26,2c,1a,1f,1l,1i,28,11,18,1b,1c,1d,1f,1i,1m,1n,1r,1x,24,28,1q,25,1f,1n,1o,1y,24,1v,1l,1o,1f,1b,1c,1d,1k,1l,1n,1p,1w,25,1a,25,1v,1g,1v,18,1t,1u,1w,1u,1i,1d,1n,1p,26,20,1d,13,y,25,1b,1x,1n,28,23,1i,22,1k,17,28,28,18,1e,1p,18,1v,18,18,1e,1u,1t,24,1k,29,1u,1u,y,18,1d,1e,1v,1y,22,25,1p,28,1r,20,22,24,22,28,13,1e,1p,1d,1m,11,25,y,1k,1l,2b,1l,27,y,1m,1y,1o,1v,1b,1f,1n,z,1q,1t,1y,17,1z,1g,1m,24,29,1k,22,20,11,1a,1b,1c,1e,1f,1n,1q,1x,23,29,2b,y,18,1d,1m,28,1z,y,11,17,18,1b,1c,1d,1e,1f,1l,1m,1n,1p,1v,23,24,25,2a,18,1d,13,20,1a,1l,y,11,1x,11,1v,1y,18,1b,1c,1d,1f,1k,1n,1u,1x,20,1e,1m,1y,18,10,25,24,10,23,y,18,24,1e,25,y,1n,25,1b,1p,1t,22,17,25,25,28,25,18,11,17,18,1u,1z,20,29,2b,1x,1v,12,25,1e,1y,25,25,1g,y,13,12,2c,11,18,1b,1l,25,1n,1r,1z,y,1m,z,23,1u,25,1x,13,25,1y,1l,y,1m,28,18,1e,29,1y,28,11,25,1v,11,18,1b,1c,1d,1e,1k,1n,1x,20,2b,1y,y,18,11,1f,24,25,1z,2c,25,11,1l,13,25,y,28,1b,1f,1h,1s,1v,20,24,28,1p,1v,1t,1z,13,1a,1o,1p,1y,23,1x,18,1n,26,1l,1p,y,25,y,11,1d,1n,25,2b,1o,28,1v,1x,22,20,1v,24,1v,1c,1f,1n,1d,26,23,1p,18,1o,1p,25,23,1t,1g,1b,y,18,1b,1c,1n,24,17,1m,25,25,1c,18,1c,1d,1e,24,1o,1x,12,1c,1d,1u,1x,1y,20,13,1k,25,z,1n,25,13,1d,1z,11,1p,23,1y,23,25,28,1w,1d,1e,1k,24,z,22,25,28,16,1w,17,1p,2a,18,1l,1p,2b,13,1t,1e,25,18,2b,1i,22,18,13,18,1b,1e,1l,1n,1p,1q,1z,23,29,2b,11,1b,1c,1d,26,1j,1j,1p,1n,1w,2b,1v,1v,1u,17,25,24,13,18,1g,1g,1g,25,1k,2b,18,25,1t,1w,1b,1v,22,1f,23,1b,1e,25,18,1b,12,13,25,13,18,1e,20,1c,1q,1f,1e,1y,25,1e,y,1a,18,26,1d,1k,1w,28,25,1u,1x,20,y,17,1q,1j,1s,1u,27,28,1f,y,1q,1g,18,z,28,28,14,1x,22,23,1o,28,25,18,25,1l,23,11,28,y,18,1b,1c,1d,1f,1x,20,24,25,2a,2e,1k,24,1o,29,1l,1p,1e,25,17,1o,1f,22,2b,18,1c,1d,1f,25,28,28,25,2b,1b,1e,20,2b,1m,18,1v,25,1w,1c,28,y,11,17,18,1a,1b,1c,1d,1e,1f,1g,1h,1j,1m,1n,1p,1u,1v,1x,20,24,25,27,28,29,1i,28,28,1l,25,13,1a,1d,2c,12,25,1p,11,18,1b,1c,1f,1u,1x,20,1p,17,1p,25,28,1b,1f,1o,1x,25,1p,13,1o,1p,1y,26,29,11,1f,1i,1y,25,1n,1v,1v,1e,1x,1a,1k,1u,y,1n,1m,22,1c,24,10,17,24,28,25,1z,18,2a,13,1o,17,1k,18,25,12,1s,28,18,1k,1o,1w,25,25,28,1l,1a,18,2c,1p,1e,18,1y,1r,10,1e,1v,24,1w,27,u,1k,13,26,1o,11,1c,1e,1f,1g,1l,1p,1t,1w,1y,1z,23,29,2a,2b,1v,1k,1f,1e,25,29,1f,25,28,1e,1p,2b,1f,2b,2a,y,11,18,1b,1c,1d,1m,1n,1u,1v,1x,20,24,28,10,28,1f,22,1e,22,1y,25,23,1m,1w,25,1b,1d,1n,24,1t,25,1x,1v,17,13,1d,18,23,18,z,y,25,1v,28,18,1p,25,24,17,1b,1c,1d,1e,1p,1u,1x,24,25,23,1j,1j,2a,22,28,18,1b,1c,1d,1f,1h,1m,1x,24,2a,23,28,25,23,18,17,24,25,1b,1d,1f,1x,24,25,1t,23,2a,1i,1f,1p,1y,1v,1z,1e,1y,18,25,1c,1d,1f,1m,1n,1x,25,2a,28,18,1f,14,25,1e,1e,1y,25,19,24,1p,25,1v,24,18,25,11,1b,1f,1v,24,25,1c,17,1l,28,y,18,1b,1c,1d,1f,1n,1x,24,28,1u,17,1v,1w,1f,24,1n,1t,25,1x,28,17,1o,25,17,1r,1k,1m,13,1p,1x,25,1e,1v,17,1m,1x,1n,1p,19,1z,25,1p,z,28,1f,25,22,11,2c,1k,y,18,1l,24,25,11,1c,1d,1i,1n,1p,25,1n,1l,1s,25,13,1y,23,12,1d,1q,1m,24,25,1s,20,1c,1k,1x,23,25,1v,23,1g,1g,1d,1a,12,11,17,20,1k,12,1k,1k,1d,2b,1v,25,1k,1n,26,2b,1b,18,1k,1l,29,28,1m,1l,1m,11,25,y,11,13,17,18,1b,1c,1d,1e,1f,1g,1k,1l,1m,1n,1v,1x,1y,1z,23,24,25,2a,2b,28,18,1b,1c,1d,1m,1n,22,25,1c,18,25,1g,1m,y,11,13,17,18,1a,1b,1c,1d,1e,1f,1g,1m,1n,1o,1p,1u,1x,1y,1z,20,24,25,29,2a,2b,18,1c,23,1a,1b,1f,1e,25,25,1b,11,18,1b,1c,1d,1e,1f,1n,1p,24,25,2c,1v,1y,18,1d,1m,1v,23,25,1z,26,1o,z,2b,20,1k,19,1k,1l,2a,1l,1b,26,1b,1n,25,19,25,1y,1p,1e,1p,1m,z,1b,25,25,1h,2b,15,1i,1k,21,25,1f,1d,12,25,22,z,2b,1k,1p,1w,1p,25,28,28,28,25,29,1y,1e,12,1u,23,25,13,1e,1y,13,29,29,1l,1z,25,29,1f,1b,1c,1f,1h,1n,1p,1x,24,25,z,1l,1a,1c,1d,z,2b,10,13,25,1c,1w,1c,1b,1g,1e,1l,20,1n,11,17,1g,1m,1n,2b,1g,1l,12,13,17,1b,1c,1k,1l,1o,1x,1z,23,24,y,18,1m,25,25,27,25,1p,20,22,28,1q,1e,1z,2b,18,1k,2c,13,1f,13,12,1a,1y,y,1m,24,1f,18,22,25,y,11,1b,1c,1f,1m,1n,1x,20,23,24,1y,1l,1t,1m,1e,20,y,11,17,18,1b,1d,1f,1m,1v,22,25,28,1k,1m,20,1a,1k,1v,17,25,1f,1f,17,1o,1a,1f,1n,1u,24,29,2a,22,28,17,18,1o,25,1x,y,25,11,13,18,1a,1e,1f,1g,1h,1l,1m,1n,1o,1p,1q,1t,1v,1y,1z,23,24,29,2a,2b,2c,1d,1e,1n,1z,25,14,11,25,1b,1f,1g,1k,1n,1u,25,11,13,1b,1e,1f,1p,1w,1x,1y,2a,18,11,1x,1t,12,24,28,1d,28,1p,1y,25,y,18,1m,25,1d,1x,1k,18,1t,28,20,20,23,28,25,1d,1e,1f,1l,1q,1k,1k,y,18,1b,1n,1v,24,1b,12,y,11,17,18,1a,1b,1c,1d,1f,1g,1m,1n,1o,1p,1u,1v,1x,24,25,28,1f,1d,1l,1x,1y,1z,28,28,17,1k,2b,2b,y,10,1n,12,2d,2b,y,11,17,18,1b,1c,1d,1e,1f,1m,1n,1x,1z,22,24,25,2a,12,22,1k,2b,y,1b,1c,1d,1e,1f,1l,1m,1y,23,24,2a,17,1c,1f,1l,1v,25,28,1b,1f,1k,25,29,2a,1b,25,z,28,19,24,25,1y,1y,1o,23,22,1f,1f,25,1y,1n,1b,1v,2a,18,1b,1w,18,1w,1y,20,1w,1t,1b,1f,1w,25,1l,24,25,24,1e,1p,23,1e,1f,23,1o,1v,28,1k,1x,25,1l,1x,24,23,1b,25,12,1f,1k,2b,12,1b,1f,1n,1s,1w,1x,20,2a,18,1p,1r,13,1f,1c,1e,1x,17,1k,14,1j,1s,28,1k,25,20,25,26,1l,11,18,1n,1d,25,2b,23,13,1o,1q,2a,2a,1a,23,1k,11,1n,1o,18,1d,1e,1v,25,y,12,13,10,1n,1s,12,1d,2a,y,11,17,18,1b,1c,1d,1f,1k,1m,1n,1u,1x,20,24,2a,2b,25,1k,12,13,y,11,18,1b,1c,1d,1e,1f,1i,1m,1n,1u,1v,1x,20,24,25,28,1k,20,13,23,1v,24,25,1t,1g,y,13,18,1b,1c,1f,1n,1x,24,26,2a,1p,1e,1s,25,1l,1x,1z,1e,1w,25,1b,1w,1l,1f,1z,18,1l,1y,1d,18,1k,1x,1y,1o,25,1p,1j,12,1v,17,1u,1g,2c,10,25,2d,1f,1w,28,1e,1p,1e,1m,1e,11,12,15,1v,14,28,14,1n,1u,1k,22,28,21,11,18,1c,1m,1n,25,1a,1u,1f,2a,1l,2c,1c,1x,1y,1l,1n,25,z,1j,28,1l,z,1v,20,28,20,28,z,1e,28,28,1y,1m,1p,25,1q,1d,1k,24,1s,1k,25,18,22,2b,1k,23,1b,18,1c,1f,2a,17,29,17,1y,1y,1y,1m,1f,25,1w,1l,1a,1u,2b,1u,1v,1u,1k,12,17,1c,1u,1v,25,27,28,22,1n,1g,1u,27,1e,1n,1y,1e,17,1d,1k,1k,1u,13,1t,1p,1k,1u,1e,1k,1x,1y,1l,11,1g,13,z,y,11,10,12,13,14,16,15,17,18,19,1d,1a,1b,1c,1e,1f,1g,1j,1i,1h,1k,1l,1n,1m,1o,1v,1w,1p,1r,1s,1t,1q,1u,1x,1y,1z,20,21,22,23,24,25,26,28,27,29,2b,2a,2c,2b,24,1c,1f,1f,1a,1h,1n,2b,29,1d,28,17,1d,25,1v,1m,25,13,1o,2c,1c,25,25,17,1v,1s,28,18,1x,1e,1p,1y,1a,1y,18,1m,25,1w,1n,29,1v,1f,2a,1l,23,1h,1b,2b,1p,23,1v,y,11,1b,1c,1f,1m,1n,1x,20,24,1q,1v,z,28,1o,1n,1n,1p,20,11,13,1e,1o,1b,1x,y,18,22,24,18,1p,1w,29,2b,y,11,18,1b,1c,1f,1m,1n,1x,20,10,10,1l,17,1l,1h,13,1v,1y,28,26,12,1g,1n,1p,2c,2a,12,1d,1j,1d,2a,11,1g,11,17,18,1d,1l,1n,1p,1v,1z,24,25,2b,1o,1m,1y,11,1b,1l,28,1x,2b,1c,28,1c,1e,1y,1d,20,23,25,1o,1f,1o,1a,1d,28,11,1o,1e,1x,1m,25,1k,2a,2b,28,1i,28,28,z,21,13,13,11,18,1b,1c,1f,1n,28,1y,17,18,1b,1c,1n,1u,1x,24,2a,1t,1i,1u,18,1m,18,2b,28,25,2a,1n,1l,1w,25,y,11,18,1b,1c,1n,1v,2a,1m,1w,1g,28,1o,1e,1n,25,25,v,1l,1g,25,1p,1l,25,25,1e,1u,1l,1w,1e,1n,24,1e,1l,26,1p,1b,1g,1o,1w,1x,22,2b,28,18,1u,1v,28,1e,1d,1t,13,13,1c,1n,2a,12,24,2a,28,28,23,25,1f,24,25,1v,1b,1l,1p,2b,28,1f,18,1r,1v,28,1u,25,1y,1y,1w,1e,1o,1t,1k,1l,1o,1x,13,1f,1v,25,1c,1e,25,2b,y,1e,1f,28,1v,24,27,1g,25,1d,12,1h,1k,13,1s,28,11,1b,1e,1n,1p,26,22,1v,25,12,12,12,12,25,12,13,1t,26,29,12,12,13,1t,25,25,23,1o,1t,1x,1b,1k,26,12,12,10,12,1t,17,17,1u,1w,1p,2b,1p,2b,1u,25,18,1u,1k,1b,1n,1u,20,1x,1n,1v,11,1b,1c,1d,1e,1f,1l,1m,1n,24,28,1p,18,25,11,11,13,1e,17,18,1y,1u,1x,24,1y,11,24,26,1e,1p,25,1n,1m,11,12,2b,1e,2b,y,1b,1c,1d,1f,1n,1x,24,25,28,1l,1e,1o,1p,1w,2c,1e,1p,1z,25,1k,1a,1l,12,1t,1o,1f,1m,1d,1p,1w,12,z,29,z,29,1w,1e,1m,24,25,28,29,20,1t,12,1h,1i,1s,20,25,12,28,z,26,26,18,22,1c,1f,23,29,28,1g,1g,1n,y,1b,1k,1n,2b,11,1n,1g,1g,1g,17,1c,1k,1g,1u,1n,1l,1n,17,1g,1i,1g,1g,2e,1e,28,12,23,1v,1e,1p,1b,1w,1x,1c,25,28,1n,1l,1l,1w,18,1y,25,1b,25,1c,1u,1e,1l,29,18,24,1o,1n,1v,11,1m,1n,25,1q,1d,1r,1w,2c,1j,1u,28,1c,1n,1r,1u,20,24,23,2a,13,1x,26,1e,24,y,17,18,22,1m,1v,28,20,15,1s,28,12,25,17,1v,1o,2c,1l,25,1c,18,1i,18,y,1m,y,1d,1n,1g,1t,25,1m,18,17,18,1d,1f,25,2a,2b,1b,28,12,18,13,1g,1g,18,25,25,1a,1o,2c,1n,1y,1p,18,1e,1p,25,1p,29,18,1z,1y,1u,20,1m,1c,1c,24,1m,25,1f,1l,23,14,25,1u,26,1o,18,1t,1w,18,1w,1v,1l,25,1o,1e,2b,18,26,1f,1f,12,25,23,18,24,1x,2a,12,1y,1m,12,18,23,y,1x,1k,18,1a,25,2a,1v,2d,2c,26,1u,1z,y,z,10,11,12,13,14,15,16,17,18,19,1a,1b,1c,1d,1e,1f,1g,1h,1i,1j,1k,1l,1m,1n,1o,1p,1q,1r,1s,1t,1u,1v,1w,1x,1y,1z,20,21,22,23,24,25,2d,26,27,28,29,2a,2b,2c,24,11,17,18,1b,1c,1d,1f,1g,1m,1s,1t,1v,1x,1z,20,22,23,24,25,2a,18,25,26,25,25,z,1t,1a,1o,1p,11,1d,1k,24,1x,25,1v,1c,20,12,1b,1g,1c,1g,1n,2b,kl,25,1c,2b,1x,28,17,1b,1c,1l,1e,1l,1y,29,1v,17,1h,y,18,25,29,1e,25,1z,1w,1m,17,18,23,2b,1d,1w,25,18,18,1b,1c,1d,1f,1m,1n,1s,1u,1v,1x,20,24,28,1c,26,1z,1l,2c,2b,y,11,13,17,18,1a,1b,1c,1d,1e,1f,1g,1h,1i,1l,1m,1n,1p,1u,1v,1x,1y,1z,20,21,24,25,26,27,28,2b,1y,1q,1k,1v,1l,2b,2b,2b,18,1b,1c,1d,1f,1k,1m,1n,1p,1u,1v,1x,20,24,26,2a,28,24,25,26,26,18,1d,1f,1g,1m,1n,1p,2a,13,1c,1w,1g,1g,1g,1u,20,28,2c,2a,1k,25,29,1o,18,1p,1z,25,1q,11,18,1b,1c,24,1b,18,1c,1f,29,1o,1e,25,1i,25,y,18,18,1v,1l,18,1m,1b,25,1w,1x,22,28,1b,24,25,1e,1v,24,25,28,14,27,27,25,1g,1b,1d,2b,1d,1l,y,1m,2a,25,28,1f,1x,25,2a,2b,1d,1b,1f,11,1y,1e,1y,1i,1j,18,1d,1n,z,1d,1l,1n,1x,1e,1u,20,2a,28,1v,29,z,1m,1z,1v,23,1u,10,1m,11,1l,1o,25,12,1h,1p,20,22,28,25,12,z,10,13,25,25,23,0,0,0,0,km,kn,0,0,ko,0,0,0,0,0,0","sep":"|"}]},{"id":"fr-datasets-2011-february-us-airport-traffic-e9c718","columns":["state"],"n":221,"cols":[{"d":"IL|GA|TX|AZ|CO|CA|FL|NC|UT|NV|PA|MN|WA|NY|VA|MO|MI|LA|OR|TN|WI|OH|IN|OK|KY|AR|NE|NM|MS|AL|SC|KS|IA|SD|ND|ID|WY|MT|WV||CT|MA|MD|ME|NH|NJ|RI|VT","r":"0*1,1*1,2*1,3*1,4*1,5*1,6*1,7*1,8*1,9*1,a*1,b*1,c*1,d*1,e*1,f*1,g*1,h*1,i*1,j*1,k*1,l*1,m*1,n*1,o*1,p*1,q*1,r*1,s*1,t*1,u*1,v*1,w*1,x*1,y*1,z*1,10*1,11*1,12*1,13*1,t*4,p*2,3*2,5*j,4*8,14*1,6*e,1*5,w*2,z*4,0*6,m*3,v*1,o*3,h*5,15*1,16*1,17*1,g*3,b*2,f*3,s*4,11*4,7*7,y*3,q*1,18*1,19*1,r*1,9*1,d*8,l*3,n*1,i*5,a*4,1a*1,u*3,x*1,j*4,2*g,8*1,e*6,1b*1,c*3,k*5,12*1,10*5","sep":"|"}]}]);
const COLONY = [
{"id":"n-400f3450","guard":[["not",["hasAny",["iso3","province"]]]],"pyramid":["render.template",{"lit":["The combined ",{"slot":0}," is ",{"slot":1},"."]},["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-ab909943","guard":[["has","combined"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Montserrat":"The combined key of Montserrat is Montserrat, United Kingdom.","tell me the combined key of Rivne Oblast":"The combined key of Rivne Oblast is Rivne Oblast, Ukraine.","name the combined key of Guam":"The combined key of Guam is Guam, US.","what is the combined key of Blekinge":"The combined key of Blekinge is Blekinge, Sweden.","tell me the combined key of Iwate":"The combined key of Iwate is Iwate, Japan.","name the combined key of Tlaxcala":"The combined key of Tlaxcala is Tlaxcala, Mexico.","what is the combined key of Halland":"The combined key of Halland is Halland, Sweden.","tell me the combined key of Vastra Gotaland":"The combined key of Vastra Gotaland is Vastra Gotaland, Sweden.","name the combined key of Guanajuato":"The combined key of Guanajuato is Guanajuato, Mexico.","what is the combined key of Prince Edward Island":"The combined key of Prince Edward Island is Prince Edward Island, Canada.","tell me the combined key of Samara Oblast":"The combined key of Samara Oblast is Samara Oblast, Russia.","name the combined key of Parana":"The combined key of Parana is Parana, Brazil.","what is the combined key of Zuid-Holland":"The combined key of Zuid-Holland is Zuid-Holland, Netherlands.","tell me the combined key of Bucuresti":"The combined key of Bucuresti is Bucuresti, Romania.","name the combined key of Kyoto":"The combined key of Kyoto is Kyoto, Japan.","what is the combined key of Choco":"The combined key of Choco is Choco, Colombia.","tell me the combined key of Espirito Santo":"The combined key of Espirito Santo is Espirito Santo, Brazil.","name the combined key of Brasov":"The combined key of Brasov is Brasov, Romania.","what is the combined key of Bratislava":"The combined key of Bratislava is Bratislava, Slovakia.","tell me the combined key of Newfoundland and Labrador":"The combined key of Newfoundland and Labrador is Newfoundland and Labrador, Canada.","name the combined key of Kujawsko-pomorskie":"The combined key of Kujawsko-pomorskie is Kujawsko-pomorskie, Poland.","what is the combined key of Arkhangelsk Oblast":"The combined key of Arkhangelsk Oblast is Arkhangelsk Oblast, Russia.","tell me the combined key of Valparaiso":"The combined key of Valparaiso is Valparaiso, Chile.","name the combined key of Vasterbotten":"The combined key of Vasterbotten is Vasterbotten, Sweden.","what is the combined key of Santa Catarina":"The combined key of Santa Catarina is Santa Catarina, Brazil.","tell me the combined key of Ribnita":"The combined key of Ribnita is Ribnita, Moldova.","name the combined key of Slaskie":"The combined key of Slaskie is Slaskie, Poland.","what is the combined key of Ontario":"The combined key of Ontario is Ontario, Canada.","tell me the combined key of Mexico":"The combined key of Mexico is Mexico, Mexico.","name the combined key of Chongqing":"The combined key of Chongqing is Chongqing, China.","what is the combined key of Jewish Autonomous Okrug":"The combined key of Jewish Autonomous Okrug is Jewish Autonomous Okrug, Russia.","tell me the combined key of Nagaland":"The combined key of Nagaland is Nagaland, India.","name the combined key of Macau":"The combined key of Macau is Macau, China.","what is the combined key of Bistrita-Nasaud":"The combined key of Bistrita-Nasaud is Bistrita-Nasaud, Romania.","tell me the combined key of Fujian":"The combined key of Fujian is Fujian, China.","name the combined key of Dambovita":"The combined key of Dambovita is Dambovita, Romania.","what is the combined key of Opolskie":"The combined key of Opolskie is Opolskie, Poland.","tell me the combined key of Nizhny Novgorod Oblast":"The combined key of Nizhny Novgorod Oblast is Nizhny Novgorod Oblast, Russia.","name the combined key of Durango":"The combined key of Durango is Durango, Mexico.","what is the combined key of Kebbi":"The combined key of Kebbi is Kebbi, Nigeria."}}},
{"id":"n-8399153c","guard":[["has","combined"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"key"}]]],"mem":{"table":{"of Montserrat":"The combined key of Montserrat is Montserrat, United Kingdom.","of Rivne Oblast":"The combined key of Rivne Oblast is Rivne Oblast, Ukraine.","of Guam":"The combined key of Guam is Guam, US.","of Blekinge":"The combined key of Blekinge is Blekinge, Sweden.","of Iwate":"The combined key of Iwate is Iwate, Japan.","of Tlaxcala":"The combined key of Tlaxcala is Tlaxcala, Mexico.","of Halland":"The combined key of Halland is Halland, Sweden.","of Vastra Gotaland":"The combined key of Vastra Gotaland is Vastra Gotaland, Sweden.","of Guanajuato":"The combined key of Guanajuato is Guanajuato, Mexico.","of Prince Edward Island":"The combined key of Prince Edward Island is Prince Edward Island, Canada.","of Samara Oblast":"The combined key of Samara Oblast is Samara Oblast, Russia.","of Parana":"The combined key of Parana is Parana, Brazil.","of Zuid-Holland":"The combined key of Zuid-Holland is Zuid-Holland, Netherlands.","of Bucuresti":"The combined key of Bucuresti is Bucuresti, Romania.","of Kyoto":"The combined key of Kyoto is Kyoto, Japan.","of Choco":"The combined key of Choco is Choco, Colombia.","of Espirito Santo":"The combined key of Espirito Santo is Espirito Santo, Brazil.","of Brasov":"The combined key of Brasov is Brasov, Romania.","of Bratislava":"The combined key of Bratislava is Bratislava, Slovakia.","of Newfoundland and Labrador":"The combined key of Newfoundland and Labrador is Newfoundland and Labrador, Canada.","of Kujawsko-pomorskie":"The combined key of Kujawsko-pomorskie is Kujawsko-pomorskie, Poland.","of Arkhangelsk Oblast":"The combined key of Arkhangelsk Oblast is Arkhangelsk Oblast, Russia.","of Valparaiso":"The combined key of Valparaiso is Valparaiso, Chile.","of Vasterbotten":"The combined key of Vasterbotten is Vasterbotten, Sweden.","of Santa Catarina":"The combined key of Santa Catarina is Santa Catarina, Brazil.","of Ribnita":"The combined key of Ribnita is Ribnita, Moldova.","of Slaskie":"The combined key of Slaskie is Slaskie, Poland.","of Ontario":"The combined key of Ontario is Ontario, Canada.","of Mexico":"The combined key of Mexico is Mexico, Mexico.","of Chongqing":"The combined key of Chongqing is Chongqing, China.","of Jewish Autonomous Okrug":"The combined key of Jewish Autonomous Okrug is Jewish Autonomous Okrug, Russia.","of Nagaland":"The combined key of Nagaland is Nagaland, India.","of Macau":"The combined key of Macau is Macau, China.","of Bistrita-Nasaud":"The combined key of Bistrita-Nasaud is Bistrita-Nasaud, Romania.","of Fujian":"The combined key of Fujian is Fujian, China.","of Dambovita":"The combined key of Dambovita is Dambovita, Romania.","of Opolskie":"The combined key of Opolskie is Opolskie, Poland.","of Nizhny Novgorod Oblast":"The combined key of Nizhny Novgorod Oblast is Nizhny Novgorod Oblast, Russia.","of Durango":"The combined key of Durango is Durango, Mexico.","of Kebbi":"The combined key of Kebbi is Kebbi, Nigeria."}}},
{"id":"n-d0ceae00","guard":[["has","combined"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"combined"}]]],"mem":{"table":{"key of Montserrat":"The combined key of Montserrat is Montserrat, United Kingdom.","key of Rivne Oblast":"The combined key of Rivne Oblast is Rivne Oblast, Ukraine.","key of Guam":"The combined key of Guam is Guam, US.","key of Blekinge":"The combined key of Blekinge is Blekinge, Sweden.","key of Iwate":"The combined key of Iwate is Iwate, Japan.","key of Tlaxcala":"The combined key of Tlaxcala is Tlaxcala, Mexico.","key of Halland":"The combined key of Halland is Halland, Sweden.","key of Vastra Gotaland":"The combined key of Vastra Gotaland is Vastra Gotaland, Sweden.","key of Guanajuato":"The combined key of Guanajuato is Guanajuato, Mexico.","key of Prince Edward Island":"The combined key of Prince Edward Island is Prince Edward Island, Canada.","key of Samara Oblast":"The combined key of Samara Oblast is Samara Oblast, Russia.","key of Parana":"The combined key of Parana is Parana, Brazil.","key of Zuid-Holland":"The combined key of Zuid-Holland is Zuid-Holland, Netherlands.","key of Bucuresti":"The combined key of Bucuresti is Bucuresti, Romania.","key of Kyoto":"The combined key of Kyoto is Kyoto, Japan.","key of Choco":"The combined key of Choco is Choco, Colombia.","key of Espirito Santo":"The combined key of Espirito Santo is Espirito Santo, Brazil.","key of Brasov":"The combined key of Brasov is Brasov, Romania.","key of Bratislava":"The combined key of Bratislava is Bratislava, Slovakia.","key of Newfoundland and Labrador":"The combined key of Newfoundland and Labrador is Newfoundland and Labrador, Canada.","key of Kujawsko-pomorskie":"The combined key of Kujawsko-pomorskie is Kujawsko-pomorskie, Poland.","key of Arkhangelsk Oblast":"The combined key of Arkhangelsk Oblast is Arkhangelsk Oblast, Russia.","key of Valparaiso":"The combined key of Valparaiso is Valparaiso, Chile.","key of Vasterbotten":"The combined key of Vasterbotten is Vasterbotten, Sweden.","key of Santa Catarina":"The combined key of Santa Catarina is Santa Catarina, Brazil.","key of Ribnita":"The combined key of Ribnita is Ribnita, Moldova.","key of Slaskie":"The combined key of Slaskie is Slaskie, Poland.","key of Ontario":"The combined key of Ontario is Ontario, Canada.","key of Mexico":"The combined key of Mexico is Mexico, Mexico.","key of Chongqing":"The combined key of Chongqing is Chongqing, China.","key of Jewish Autonomous Okrug":"The combined key of Jewish Autonomous Okrug is Jewish Autonomous Okrug, Russia.","key of Nagaland":"The combined key of Nagaland is Nagaland, India.","key of Macau":"The combined key of Macau is Macau, China.","key of Bistrita-Nasaud":"The combined key of Bistrita-Nasaud is Bistrita-Nasaud, Romania.","key of Fujian":"The combined key of Fujian is Fujian, China.","key of Dambovita":"The combined key of Dambovita is Dambovita, Romania.","key of Opolskie":"The combined key of Opolskie is Opolskie, Poland.","key of Nizhny Novgorod Oblast":"The combined key of Nizhny Novgorod Oblast is Nizhny Novgorod Oblast, Russia.","key of Durango":"The combined key of Durango is Durango, Mexico.","key of Kebbi":"The combined key of Kebbi is Kebbi, Nigeria."}}},
{"id":"n-158101b6","guard":[["hasAny",["autonomous","bistritanasaud","blekinge","bratislava","bucuresti","catarina","choco","edward","element","espirito","fujian","gotaland","halland","item number","iwate","kebbi","labrador","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-31a075e2","guard":[["hasAny",["autonomous","bistritanasaud","blekinge","bratislava","bucuresti","catarina","choco","edward","element","espirito","fujian","gotaland","halland","item number","iwate","kebbi","labrador","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-1a8454ba","guard":[["hasAny",["autonomous","bistritanasaud","blekinge","bratislava","bucuresti","catarina","choco","edward","element","espirito","fujian","gotaland","halland","item number","iwate","kebbi","labrador","lower case","lowercase","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","small letters","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]],"mem":null},
{"id":"n-1e241e89","guard":[["hasAny",["autonomous","bistritanasaud","blekinge","bratislava","bucuresti","catarina","choco","edward","element","espirito","fujian","gotaland","halland","invert case","item number","iwate","kebbi","labrador","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","swap case","toggle case","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"combined"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-212c7c47","guard":[["hasAny",["autonomous","bistritanasaud","blekinge","bratislava","bucuresti","catarina","choco","edward","element","espirito","first n","fujian","gotaland","halland","item number","iwate","kebbi","labrador","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","take","top","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-3e4e89bb","guard":[["hasAny",["autonomous","bistritanasaud","blekinge","bratislava","bucuresti","capitalise","capitalize","capitalize each word","catarina","choco","edward","element","espirito","fujian","gotaland","halland","item number","iwate","kebbi","labrador","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","title case","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]],"mem":null},
{"id":"n-419ddf41","guard":[["hasAny",["autonomous","bistritanasaud","blekinge","bratislava","bucuresti","capitalise","capitalize","capitalize each word","catarina","choco","edward","element","espirito","fujian","gotaland","halland","item number","iwate","kebbi","labrador","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","title case","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["sense.after",{"lit":"combined"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-a950d7cc","guard":[["hasAny",["autonomous","bistritanasaud","blekinge","bratislava","bucuresti","catarina","choco","edward","element","espirito","fujian","gotaland","halland","item number","iwate","kebbi","labrador","lower case","lowercase","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","small letters","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["sense.after",{"lit":"combined"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-cb1c17f3","guard":[["hasAny",["all caps","autonomous","bistritanasaud","blekinge","bratislava","bucuresti","capital letters","capitals","catarina","choco","edward","element","espirito","fujian","gotaland","halland","item number","iwate","kebbi","labrador","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","upper case","uppercase","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["sense.after",{"lit":"combined"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-da3bbfce","guard":[["hasAny",["all caps","autonomous","bistritanasaud","blekinge","bratislava","bucuresti","capital letters","capitals","catarina","choco","edward","element","espirito","fujian","gotaland","halland","item number","iwate","kebbi","labrador","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","upper case","uppercase","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]],"mem":null},
{"id":"n-e8c402bb","guard":[["hasAny",["autonomous","bistritanasaud","blekinge","bratislava","bucuresti","catarina","choco","edward","element","espirito","fujian","gotaland","halland","invert case","item number","iwate","kebbi","labrador","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","swap case","toggle case","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]],"mem":null},
{"id":"n-f63d29d2","guard":[["hasAny",["autonomous","bistritanasaud","blekinge","bratislava","bucuresti","catarina","choco","edward","element","espirito","first n","fujian","gotaland","halland","item number","iwate","kebbi","labrador","mexico","montserrat","nagaland","nth","oblast","ontario","opolskie","position","ribnita","take","top","valparaiso","zuidholland"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-d2e03e92","guard":[["hasAny",["blekinge","brasov","bratislava","bucuresti","choco","chongqing","dambovita","durango","each word","element","fujian","guam","guanajuato","halland","item number","iwate","kebbi","kyoto","macau","mexico","nagaland","nth","ontario","opolskie","parana","position","ribnita","slaskie","split into words","tlaxcala","valparaiso","vasterbotten","words"]],["has","combined"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]],"mem":null},
{"id":"n-dd707a82","guard":[["hasAny",["blekinge","brasov","catarina","choco","durango","edward","element","espirito","fujian","gotaland","guam","halland","item number","iwate","kebbi","kyoto","longest","longest one","longest word","macau","mexico","nagaland","nizhny","nth","ontario","opolskie","parana","position","ribnita","rivne","samara","slaskie","tlaxcala"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-047937f2","guard":[["not",["hasAny",["11000th","160k","abbreviation","affiliation","airline","airport","americasaopaulo","appearances","artist","author","because","become","blocklong","calling","capita","category","circuit","city","cnt","coastline","code","comments","common","compare","confessing","continent","country","covers","database","date","density","description","discomfort","dish","domain","dutch","emoji","england","europegibraltar","expectancy","fiend","format","government","hokkaido","iana","institute","islands","iso","iso2","iso3","korat","lesser","lies","location","main","makes","manufacturer","n3","nebelung","nigerkordofanian","north","numeric","nuosu","offset","orindatus","parent","pidgin","pirro","population","poços","province","region","religion","satellite","scotland","short","shortcode","singers","slug","somali","south","speakers","sponsorship","sprout","strstate","subregion","sucode","sucountry","suname","surface","sutype","tabitha","temperature","time","title","titles","tolling","twoletter","university","universityonline","used","wig"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-d8b7752e","guard":[["hasAny",["combined","delete","element","item number","nth","position","remove","strip out","without"]],["words<=",8],["has","of"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}],["transform.nthStr",["know.find",{"lit":"crypto-tickers"},{"lit":"crypto ticker"}],{"lit":2}]]],"mem":null},
{"id":"n-7f3166a8","guard":[["hasAny",["blekinge","bratislava","bucuresti","choco","each word","element","fujian","halland","item number","iwate","kebbi","mexico","nagaland","nth","ontario","opolskie","position","ribnita","split into words","valparaiso","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]]],"mem":null},
{"id":"n-6062e43e","guard":[["has","combined"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the combined key of Montserrat":"The combined key of Montserrat is Montserrat, United Kingdom.","the combined key of Blekinge":"The combined key of Blekinge is Blekinge, Sweden.","the combined key of Halland":"The combined key of Halland is Halland, Sweden.","the combined key of Prince Edward Island":"The combined key of Prince Edward Island is Prince Edward Island, Canada.","the combined key of Zuid-Holland":"The combined key of Zuid-Holland is Zuid-Holland, Netherlands.","the combined key of Choco":"The combined key of Choco is Choco, Colombia.","the combined key of Bratislava":"The combined key of Bratislava is Bratislava, Slovakia.","the combined key of Arkhangelsk Oblast":"The combined key of Arkhangelsk Oblast is Arkhangelsk Oblast, Russia.","the combined key of Santa Catarina":"The combined key of Santa Catarina is Santa Catarina, Brazil.","the combined key of Ontario":"The combined key of Ontario is Ontario, Canada.","the combined key of Jewish Autonomous Okrug":"The combined key of Jewish Autonomous Okrug is Jewish Autonomous Okrug, Russia.","the combined key of Bistrita-Nasaud":"The combined key of Bistrita-Nasaud is Bistrita-Nasaud, Romania.","the combined key of Opolskie":"The combined key of Opolskie is Opolskie, Poland.","the combined key of Kebbi":"The combined key of Kebbi is Kebbi, Nigeria."}}},
{"id":"n-97d6a0ab","guard":[["hasAny",["element","item number","name","nth","position"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-31d24de9","guard":[["hasAny",["element","item number","name","nth","position"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-33ac0545","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-6f7dc6d6","guard":[["hasAny",["class name","element","item number","name","nth","pascal case","pascalcase","position","upper camel case"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-ce636918","guard":[["hasAny",["combined","delete","element","item number","nth","position","remove","strip out","without"]],["not",["has","iso3"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}],["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"state"}],{"lit":1}]]],"mem":null},
{"id":"n-d42c17b6","guard":[["not",["hasAny",["abbreviation","airline","americamartinique","americamontserrat","americasaopaulo","atlanticbermuda","bahía","barthélemy","breed","capital","chiquián","city","coastline","code","comments","common","company","compare","confessing","continent","country","currency","dawn","density","dialogue","dish","domain","dutch","emoji","europebratislava","exhibition","expectancy","gc","habitat","indianmayotte","institute","iso2","iso3","larger","location","nigerkordofanian","north","official","perched","pidgin","platforms","population","province","region","rook","session","smaller","south","sprout","strstate","subregion","sucountry","suname","surface","tabitha","time","title","type","universityonline","year"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}],["transform.nthStr",["know.find",{"lit":"fr-datasets-2011-february-us-airport-traffic-e9c718"},{"lit":"state"}],{"lit":1}]]],"mem":null},
{"id":"n-25e8368c","guard":[["hasAny",["element","item number","lower case","lowercase","name","nth","position","small letters"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]],"mem":null},
{"id":"n-31e9cd0e","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","name","nth","position","title case"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]],"mem":null},
{"id":"n-33fc87c8","guard":[["hasAny",["element","item number","lower case","lowercase","name","nth","position","small letters"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.lower",["sense.after",{"lit":"combined"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-65943dd8","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","name","nth","position","upper case","uppercase"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]],"mem":null},
{"id":"n-6bbcb39d","guard":[["hasAny",["each word","element","item number","name","nth","position","split into words","words"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-8e86379c","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","name","nth","position","upper case","uppercase"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.upper",["sense.after",{"lit":"combined"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-d97a87f7","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]],"mem":null},
{"id":"n-f6b30cb2","guard":[["hasAny",["each word","element","item number","name","nth","position","split into words","words"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["sense.after",{"lit":"combined"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-fa936b86","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","name","nth","position","title case"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["sense.after",{"lit":"combined"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-fba6a176","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["has","of"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["sense.after",{"lit":"combined"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-bc621e2e","guard":[["hasAny",["brasov","chongqing","dambovita","durango","each word","element","guam","guanajuato","item number","kyoto","macau","nth","parana","position","slaskie","split into words","tlaxcala","vasterbotten","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]]]],"mem":null},
{"id":"n-08e80ad1","guard":[["hasAny",["element","item number","mexico","nth","position"]],["has","combined"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":2}]],"mem":null},
{"id":"n-d8ba9082","guard":[["hasAny",["combined","element","item number","nth","position"]],["has","mexico"]],"pyramid":["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"combined key"}],{"lit":1}],{"lit":2}]],"mem":null},
{"id":"n-0487645e","guard":[["hasAny",["bistritanasaud","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Bistrita-Nasaud is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-07c7072e","guard":[["hasAny",["element","item number","kujawskopomorskie","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Kujawsko-pomorskie is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-080ae7d9","guard":[["hasAny",["element","halland","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Halland is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-09fedf3f","guard":[["hasAny",["element","item number","kyoto","nth","position"]],["has","combined"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Kyoto is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-0b951d2f","guard":[["hasAny",["chongqing","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Chongqing is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-0d263350","guard":[["hasAny",["element","item number","nth","position","ribnita"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Ribnita is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-18150af0","guard":[["hasAny",["blekinge","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Blekinge is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-1fe38d21","guard":[["hasAny",["element","item number","nth","position","tlaxcala"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Tlaxcala is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-2822ae49","guard":[["hasAny",["element","item number","nth","parana","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Parana is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-31888004","guard":[["hasAny",["element","item number","nth","position","vasterbotten"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Vasterbotten is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-31c081dd","guard":[["hasAny",["bucuresti","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Bucuresti is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-3255acc8","guard":[["hasAny",["catarina","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Santa Catarina is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-327758ce","guard":[["hasAny",["element","item number","iwate","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Iwate is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-32edf69d","guard":[["hasAny",["element","item number","macau","nth","position"]],["has","combined"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Macau is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-3b01fd7b","guard":[["hasAny",["element","item number","nth","position","samara"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Samara Oblast is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-3dcc1d00","guard":[["hasAny",["element","item number","nth","position","valparaiso"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Valparaiso is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-43c64185","guard":[["hasAny",["element","item number","nth","position","rivne"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Rivne Oblast is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-506a99be","guard":[["hasAny",["element","item number","mexico","nth","position"]],["has","combined"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Mexico is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-61a87a0f","guard":[["hasAny",["element","gotaland","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Vastra Gotaland is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-63db7a2f","guard":[["hasAny",["element","item number","nth","ontario","position"]],["has","combined"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Ontario is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-655e91eb","guard":[["hasAny",["element","item number","nth","position","zuidholland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Zuid-Holland is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-6c3b4249","guard":[["hasAny",["autonomous","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Jewish Autonomous Okrug is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-6ceddb26","guard":[["hasAny",["element","item number","nizhny","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Nizhny Novgorod Oblast is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-6dafe298","guard":[["hasAny",["element","fujian","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Fujian is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-770805d2","guard":[["hasAny",["choco","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Choco is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-8083475d","guard":[["hasAny",["element","item number","kebbi","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Kebbi is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-817e9058","guard":[["hasAny",["element","item number","nagaland","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Nagaland is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-85f714a2","guard":[["hasAny",["element","item number","labrador","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Newfoundland and Labrador is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-9400e4b5","guard":[["hasAny",["element","item number","nth","opolskie","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Opolskie is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-99db1bd0","guard":[["hasAny",["arkhangelsk","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Arkhangelsk Oblast is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-b729d5c2","guard":[["hasAny",["element","item number","montserrat","nth","position"]],["has","combined"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Montserrat is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-c96c0c20","guard":[["hasAny",["element","guam","item number","nth","position"]],["has","combined"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Guam is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-d1e8b2cf","guard":[["hasAny",["element","espirito","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Espirito Santo is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-d2dfbc15","guard":[["hasAny",["dambovita","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Dambovita is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-d2e505a4","guard":[["hasAny",["durango","element","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Durango is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-d6ac0198","guard":[["hasAny",["bratislava","element","item number","nth","position"]],["has","combined"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Bratislava is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-d9d2a738","guard":[["hasAny",["element","item number","nth","position","slaskie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Slaskie is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-dc159798","guard":[["hasAny",["brasov","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Brasov is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-de94505b","guard":[["hasAny",["element","guanajuato","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Guanajuato is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-e84aecfc","guard":[["hasAny",["edward","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," key of Prince Edward Island is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}]],"mem":null},
{"id":"n-b8e44e18","guard":[["hasAny",["combined","delete","element","item number","nth","position","remove","strip out","without"]],["has","tell"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"}],{"lit":1}],{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"province state"},{"lit":"combined key"}],["transform.nthStr",["know.find",{"lit":"fr-covid-19-reference-7c87a7"},{"lit":"iso3"}],{"lit":1}]]],"mem":null},
{"id":"n-038c1317","guard":[["hasAny",["combined","key","kyoto","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Kyoto":"The combined key of Kyoto is Kyoto, Japan."}}},
{"id":"n-085ffc76","guard":[["hasAny",["combined","guanajuato","key","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Guanajuato":"The combined key of Guanajuato is Guanajuato, Mexico."}}},
{"id":"n-1681017b","guard":[["hasAny",["combined","key","name","tlaxcala"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Tlaxcala":"The combined key of Tlaxcala is Tlaxcala, Mexico."}}},
{"id":"n-18ea02a6","guard":[["hasAny",["combined","key","labrador","newfoundland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Newfoundland and Labrador":"The combined key of Newfoundland and Labrador is Newfoundland and Labrador, Canada."}}},
{"id":"n-1e640069","guard":[["hasAny",["combined","key","name","slaskie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Slaskie":"The combined key of Slaskie is Slaskie, Poland."}}},
{"id":"n-226fb80e","guard":[["hasAny",["combined","key","macau","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Macau":"The combined key of Macau is Macau, China."}}},
{"id":"n-2ca3363b","guard":[["hasAny",["combined","key","zuidholland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Zuid-Holland":"The combined key of Zuid-Holland is Zuid-Holland, Netherlands."}}},
{"id":"n-319d59e9","guard":[["hasAny",["combined","key","ontario"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Ontario":"The combined key of Ontario is Ontario, Canada."}}},
{"id":"n-34528e9b","guard":[["hasAny",["combined","key","oblast","rivne"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Rivne Oblast":"The combined key of Rivne Oblast is Rivne Oblast, Ukraine."}}},
{"id":"n-3520421f","guard":[["hasAny",["combined","key","valparaiso"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Valparaiso":"The combined key of Valparaiso is Valparaiso, Chile."}}},
{"id":"n-377572df","guard":[["hasAny",["combined","key","name","parana"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Parana":"The combined key of Parana is Parana, Brazil."}}},
{"id":"n-3b8aa626","guard":[["hasAny",["combined","key","nizhny","novgorod","oblast"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Nizhny Novgorod Oblast":"The combined key of Nizhny Novgorod Oblast is Nizhny Novgorod Oblast, Russia."}}},
{"id":"n-47133581","guard":[["hasAny",["combined","durango","key","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Durango":"The combined key of Durango is Durango, Mexico."}}},
{"id":"n-56eb3838","guard":[["hasAny",["chongqing","combined","key","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Chongqing":"The combined key of Chongqing is Chongqing, China."}}},
{"id":"n-625c33de","guard":[["hasAny",["bucuresti","combined","key"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Bucuresti":"The combined key of Bucuresti is Bucuresti, Romania."}}},
{"id":"n-64185c76","guard":[["hasAny",["combined","key","montserrat"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Montserrat":"The combined key of Montserrat is Montserrat, United Kingdom."}}},
{"id":"n-6b0a6687","guard":[["hasAny",["autonomous","combined","jewish","key","okrug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Jewish Autonomous Okrug":"The combined key of Jewish Autonomous Okrug is Jewish Autonomous Okrug, Russia."}}},
{"id":"n-71d7a2f4","guard":[["hasAny",["combined","iwate","key"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Iwate":"The combined key of Iwate is Iwate, Japan."}}},
{"id":"n-7e855bc9","guard":[["hasAny",["arkhangelsk","combined","key","oblast"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Arkhangelsk Oblast":"The combined key of Arkhangelsk Oblast is Arkhangelsk Oblast, Russia."}}},
{"id":"n-80c30c0f","guard":[["hasAny",["bratislava","combined","key"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Bratislava":"The combined key of Bratislava is Bratislava, Slovakia."}}},
{"id":"n-85da58d9","guard":[["hasAny",["combined","halland","key"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Halland":"The combined key of Halland is Halland, Sweden."}}},
{"id":"n-8fa1055f","guard":[["hasAny",["combined","key","nagaland"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Nagaland":"The combined key of Nagaland is Nagaland, India."}}},
{"id":"n-95201cb3","guard":[["hasAny",["choco","combined","key"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Choco":"The combined key of Choco is Choco, Colombia."}}},
{"id":"n-a3035570","guard":[["hasAny",["combined","guam","key","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Guam":"The combined key of Guam is Guam, US."}}},
{"id":"n-b24566d5","guard":[["hasAny",["combined","kebbi","key"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Kebbi":"The combined key of Kebbi is Kebbi, Nigeria."}}},
{"id":"n-bc321262","guard":[["hasAny",["combined","edward","island","key","prince"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Prince Edward Island":"The combined key of Prince Edward Island is Prince Edward Island, Canada."}}},
{"id":"n-bdd2f1ca","guard":[["hasAny",["bistritanasaud","combined","key"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Bistrita-Nasaud":"The combined key of Bistrita-Nasaud is Bistrita-Nasaud, Romania."}}},
{"id":"n-c79e7fd4","guard":[["hasAny",["combined","key","oblast","samara"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Samara Oblast":"The combined key of Samara Oblast is Samara Oblast, Russia."}}},
{"id":"n-cb31a81f","guard":[["hasAny",["combined","key","opolskie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Opolskie":"The combined key of Opolskie is Opolskie, Poland."}}},
{"id":"n-cdf5c95e","guard":[["hasAny",["combined","key","mexico"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Mexico":"The combined key of Mexico is Mexico, Mexico."}}},
{"id":"n-d3bc6e15","guard":[["hasAny",["brasov","combined","key","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Brasov":"The combined key of Brasov is Brasov, Romania."}}},
{"id":"n-e2ed9504","guard":[["hasAny",["catarina","combined","key","santa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Santa Catarina":"The combined key of Santa Catarina is Santa Catarina, Brazil."}}},
{"id":"n-e74b161c","guard":[["hasAny",["combined","fujian","key"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Fujian":"The combined key of Fujian is Fujian, China."}}},
{"id":"n-e77fc5d8","guard":[["hasAny",["combined","espirito","key","santo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Espirito Santo":"The combined key of Espirito Santo is Espirito Santo, Brazil."}}},
{"id":"n-e8ed04bc","guard":[["hasAny",["combined","gotaland","key","vastra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Vastra Gotaland":"The combined key of Vastra Gotaland is Vastra Gotaland, Sweden."}}},
{"id":"n-e9de2895","guard":[["hasAny",["blekinge","combined","key"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the combined key of Blekinge":"The combined key of Blekinge is Blekinge, Sweden."}}},
{"id":"n-efd664b9","guard":[["hasAny",["combined","dambovita","key","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Dambovita":"The combined key of Dambovita is Dambovita, Romania."}}},
{"id":"n-f1b4c3bb","guard":[["hasAny",["combined","key","name","vasterbotten"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Vasterbotten":"The combined key of Vasterbotten is Vasterbotten, Sweden."}}},
{"id":"n-f488c096","guard":[["hasAny",["combined","key","ribnita"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the combined key of Ribnita":"The combined key of Ribnita is Ribnita, Moldova."}}},
{"id":"n-f871a57c","guard":[["hasAny",["combined","key","kujawskopomorskie","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the combined key of Kujawsko-pomorskie":"The combined key of Kujawsko-pomorskie is Kujawsko-pomorskie, Poland."}}},
{"id":"n-dfe9c211","guard":[["has","mexico"],["has","combined"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-089e3202","guard":[["hasAny",["element","item number","nth","position","tlaxcala"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Tlaxcala, Mexico."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-0b9fa6d7","guard":[["hasAny",["element","guam","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Guam, US."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-1576538b","guard":[["hasAny",["element","item number","nth","opolskie","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Opolskie, Poland."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-163321bf","guard":[["hasAny",["autonomous","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Jewish Autonomous Okrug, Russia."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-1af5a515","guard":[["hasAny",["element","item number","labrador","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Newfoundland and Labrador, Canada."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-1e04b7b5","guard":[["hasAny",["bucuresti","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bucuresti, Romania."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-22f725d0","guard":[["hasAny",["edward","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Prince Edward Island, Canada."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-2614aa5a","guard":[["hasAny",["element","item number","nagaland","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Nagaland, India."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-28e591ac","guard":[["hasAny",["element","guanajuato","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Guanajuato, Mexico."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-39c7c5b0","guard":[["hasAny",["blekinge","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Blekinge, Sweden."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-45c9276c","guard":[["hasAny",["element","item number","nth","position","valparaiso"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Valparaiso, Chile."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-4bf107c4","guard":[["hasAny",["element","item number","kebbi","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kebbi, Nigeria."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-515e3625","guard":[["hasAny",["bratislava","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bratislava, Slovakia."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-53f3d95a","guard":[["hasAny",["element","item number","nth","position","zuidholland"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Zuid-Holland, Netherlands."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-576604b2","guard":[["hasAny",["arkhangelsk","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Arkhangelsk Oblast, Russia."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-591a20f7","guard":[["hasAny",["element","item number","mexico","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Mexico, Mexico."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-592f6960","guard":[["hasAny",["element","item number","nth","parana","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Parana, Brazil."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-7171aa42","guard":[["hasAny",["element","item number","nth","position","rivne"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Rivne Oblast, Ukraine."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-717b964c","guard":[["hasAny",["brasov","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Brasov, Romania."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-781a8183","guard":[["hasAny",["element","item number","kujawskopomorskie","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kujawsko-pomorskie, Poland."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-79a6b9ce","guard":[["hasAny",["element","item number","nizhny","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Nizhny Novgorod Oblast, Russia."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-80f980be","guard":[["hasAny",["element","item number","nth","position","slaskie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Slaskie, Poland."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-886d8c9a","guard":[["hasAny",["element","gotaland","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vastra Gotaland, Sweden."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-8cb26b85","guard":[["hasAny",["element","item number","nth","position","ribnita"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ribnita, Moldova."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-8d6dbfab","guard":[["hasAny",["element","item number","montserrat","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Montserrat, United Kingdom."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-9e67bba2","guard":[["hasAny",["element","item number","macau","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Macau, China."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-9ea6804b","guard":[["hasAny",["element","item number","nth","position","vasterbotten"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Vasterbotten, Sweden."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-a14a5ee9","guard":[["hasAny",["element","item number","nth","ontario","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Ontario, Canada."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-a322655a","guard":[["hasAny",["element","item number","kyoto","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Kyoto, Japan."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-adfeea49","guard":[["hasAny",["element","espirito","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Espirito Santo, Brazil."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-b01f0eff","guard":[["hasAny",["element","halland","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Halland, Sweden."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-b110311b","guard":[["hasAny",["durango","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Durango, Mexico."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-cedc6ba3","guard":[["hasAny",["element","item number","nth","position","samara"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Samara Oblast, Russia."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-d5555abd","guard":[["hasAny",["bistritanasaud","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Bistrita-Nasaud, Romania."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-e7096d1e","guard":[["hasAny",["element","fujian","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Fujian, China."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-f2566b61","guard":[["hasAny",["choco","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Choco, Colombia."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-f2e18738","guard":[["hasAny",["chongqing","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Chongqing, China."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-f818a1a8","guard":[["hasAny",["catarina","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Santa Catarina, Brazil."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-ffac7079","guard":[["hasAny",["element","item number","iwate","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Iwate, Japan."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-ffad8141","guard":[["hasAny",["dambovita","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is Dambovita, Romania."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.after",{"lit":"combined"}]],"mem":null},
{"id":"n-0b1bbfa4","guard":[["has","vasterbotten"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Vasterbotten":"The combined key of Vasterbotten is Vasterbotten, Sweden."}}},
{"id":"n-0e2abfca","guard":[["has","slaskie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Slaskie":"The combined key of Slaskie is Slaskie, Poland."}}},
{"id":"n-18d45e1b","guard":[["hasAny",["combined","key","labrador","newfoundland"]],["has","newfoundland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Newfoundland and Labrador":"The combined key of Newfoundland and Labrador is Newfoundland and Labrador, Canada."}}},
{"id":"n-26db5b59","guard":[["has","brasov"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Brasov":"The combined key of Brasov is Brasov, Romania."}}},
{"id":"n-2b9b22ab","guard":[["has","blekinge"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Blekinge":"The combined key of Blekinge is Blekinge, Sweden."}}},
{"id":"n-2c49a0ea","guard":[["has","chongqing"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Chongqing":"The combined key of Chongqing is Chongqing, China."}}},
{"id":"n-2d49c4c9","guard":[["has","rivne"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Rivne Oblast":"The combined key of Rivne Oblast is Rivne Oblast, Ukraine."}}},
{"id":"n-3dc78068","guard":[["has","tlaxcala"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Tlaxcala":"The combined key of Tlaxcala is Tlaxcala, Mexico."}}},
{"id":"n-40ae915c","guard":[["has","iwate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Iwate":"The combined key of Iwate is Iwate, Japan."}}},
{"id":"n-419684c1","guard":[["hasAny",["nizhny","novgorod"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Nizhny Novgorod Oblast":"The combined key of Nizhny Novgorod Oblast is Nizhny Novgorod Oblast, Russia."}}},
{"id":"n-445e9872","guard":[["has","ontario"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Ontario":"The combined key of Ontario is Ontario, Canada."}}},
{"id":"n-47c418c8","guard":[["has","durango"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Durango":"The combined key of Durango is Durango, Mexico."}}},
{"id":"n-4d8328fd","guard":[["has","kyoto"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Kyoto":"The combined key of Kyoto is Kyoto, Japan."}}},
{"id":"n-50c55938","guard":[["has","guanajuato"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Guanajuato":"The combined key of Guanajuato is Guanajuato, Mexico."}}},
{"id":"n-59734794","guard":[["has","montserrat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Montserrat":"The combined key of Montserrat is Montserrat, United Kingdom."}}},
{"id":"n-59d9c158","guard":[["has","bistritanasaud"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Bistrita-Nasaud":"The combined key of Bistrita-Nasaud is Bistrita-Nasaud, Romania."}}},
{"id":"n-5a2d528f","guard":[["hasAny",["catarina","combined","key","santa"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Santa Catarina":"The combined key of Santa Catarina is Santa Catarina, Brazil."}}},
{"id":"n-63b45942","guard":[["has","halland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Halland":"The combined key of Halland is Halland, Sweden."}}},
{"id":"n-6ae0e232","guard":[["has","opolskie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Opolskie":"The combined key of Opolskie is Opolskie, Poland."}}},
{"id":"n-6cd00fac","guard":[["hasAny",["combined","espirito","key","santo"]],["has","espirito"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Espirito Santo":"The combined key of Espirito Santo is Espirito Santo, Brazil."}}},
{"id":"n-6ecfed28","guard":[["has","macau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Macau":"The combined key of Macau is Macau, China."}}},
{"id":"n-74ecc0f9","guard":[["has","mexico"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Mexico":"The combined key of Mexico is Mexico, Mexico."}}},
{"id":"n-74f7a899","guard":[["has","bucuresti"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Bucuresti":"The combined key of Bucuresti is Bucuresti, Romania."}}},
{"id":"n-82d27067","guard":[["has","nagaland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Nagaland":"The combined key of Nagaland is Nagaland, India."}}},
{"id":"n-85f8b39a","guard":[["hasAny",["autonomous","combined","jewish","key","okrug"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Jewish Autonomous Okrug":"The combined key of Jewish Autonomous Okrug is Jewish Autonomous Okrug, Russia."}}},
{"id":"n-88ab44c6","guard":[["has","arkhangelsk"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Arkhangelsk Oblast":"The combined key of Arkhangelsk Oblast is Arkhangelsk Oblast, Russia."}}},
{"id":"n-8e2c9873","guard":[["has","choco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Choco":"The combined key of Choco is Choco, Colombia."}}},
{"id":"n-910c37d2","guard":[["has","valparaiso"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Valparaiso":"The combined key of Valparaiso is Valparaiso, Chile."}}},
{"id":"n-94018690","guard":[["has","dambovita"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Dambovita":"The combined key of Dambovita is Dambovita, Romania."}}},
{"id":"n-9d8ca019","guard":[["has","zuidholland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Zuid-Holland":"The combined key of Zuid-Holland is Zuid-Holland, Netherlands."}}},
{"id":"n-b5033344","guard":[["has","bratislava"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Bratislava":"The combined key of Bratislava is Bratislava, Slovakia."}}},
{"id":"n-b6372697","guard":[["has","guam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Guam":"The combined key of Guam is Guam, US."}}},
{"id":"n-c0127c2d","guard":[["has","kebbi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Kebbi":"The combined key of Kebbi is Kebbi, Nigeria."}}},
{"id":"n-d23537be","guard":[["has","kujawskopomorskie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Kujawsko-pomorskie":"The combined key of Kujawsko-pomorskie is Kujawsko-pomorskie, Poland."}}},
{"id":"n-db1e94ee","guard":[["has","ribnita"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Ribnita":"The combined key of Ribnita is Ribnita, Moldova."}}},
{"id":"n-dd43eb23","guard":[["hasAny",["combined","gotaland","key","vastra"]],["has","vastra"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Vastra Gotaland":"The combined key of Vastra Gotaland is Vastra Gotaland, Sweden."}}},
{"id":"n-f5f5b9bf","guard":[["hasAny",["combined","edward","island","key","prince"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the combined key of Prince Edward Island":"The combined key of Prince Edward Island is Prince Edward Island, Canada."}}},
{"id":"n-fa54c1d6","guard":[["has","samara"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Samara Oblast":"The combined key of Samara Oblast is Samara Oblast, Russia."}}},
{"id":"n-fa86d2f7","guard":[["has","fujian"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the combined key of Fujian":"The combined key of Fujian is Fujian, China."}}},
{"id":"n-fc3916ed","guard":[["has","parana"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the combined key of Parana":"The combined key of Parana is Parana, Brazil."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the combined key of Montserrat","expect":{"contains":["Montserrat, United Kingdom"],"notRefusal":true}},{"q":"tell me the combined key of Rivne Oblast","expect":{"contains":["Rivne Oblast, Ukraine"],"notRefusal":true}},{"q":"name the combined key of Guam","expect":{"contains":["Guam, US"],"notRefusal":true}},{"q":"what is the combined key of Blekinge","expect":{"contains":["Blekinge, Sweden"],"notRefusal":true}},{"q":"tell me the combined key of Iwate","expect":{"contains":["Iwate, Japan"],"notRefusal":true}},{"q":"name the combined key of Tlaxcala","expect":{"contains":["Tlaxcala, Mexico"],"notRefusal":true}},{"q":"what is the combined key of Halland","expect":{"contains":["Halland, Sweden"],"notRefusal":true}},{"q":"tell me the combined key of Vastra Gotaland","expect":{"contains":["Vastra Gotaland, Sweden"],"notRefusal":true}},{"q":"name the combined key of Guanajuato","expect":{"contains":["Guanajuato, Mexico"],"notRefusal":true}},{"q":"what is the combined key of Prince Edward Island","expect":{"contains":["Prince Edward Island, Canada"],"notRefusal":true}},{"q":"tell me the combined key of Samara Oblast","expect":{"contains":["Samara Oblast, Russia"],"notRefusal":true}},{"q":"name the combined key of Parana","expect":{"contains":["Parana, Brazil"],"notRefusal":true}},{"q":"what is the combined key of Zuid-Holland","expect":{"contains":["Zuid-Holland, Netherlands"],"notRefusal":true}},{"q":"tell me the combined key of Bucuresti","expect":{"contains":["Bucuresti, Romania"],"notRefusal":true}},{"q":"name the combined key of Kyoto","expect":{"contains":["Kyoto, Japan"],"notRefusal":true}},{"q":"what is the combined key of Choco","expect":{"contains":["Choco, Colombia"],"notRefusal":true}},{"q":"tell me the combined key of Espirito Santo","expect":{"contains":["Espirito Santo, Brazil"],"notRefusal":true}},{"q":"name the combined key of Brasov","expect":{"contains":["Brasov, Romania"],"notRefusal":true}},{"q":"what is the combined key of Bratislava","expect":{"contains":["Bratislava, Slovakia"],"notRefusal":true}},{"q":"tell me the combined key of Newfoundland and Labrador","expect":{"contains":["Newfoundland and Labrador, Canada"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
