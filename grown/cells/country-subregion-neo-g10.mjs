// country-subregion-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-subregion-neo-g10","class":"country-subregion","generation":10,"lane":"neo","grownFrom":["which subregion of the world is Sweden in","name the world subregion of Egypt","which subregion of the world is Philippines in","in what subregion does Montserrat lie","which subregion of the world is Congo in","which subregion of the world is United States Virgin Islands in","in what subregion does Nepal lie","which subregion of the world is Tonga in","which subregion of the world is Senegal in","in what subregion does Luxembourg lie","in what subregion does United States Minor Outlying Islands lie","in what subregion does São Tomé and Príncipe lie","in what subregion does Hong Kong lie","in what subregion does Kyrgyzstan lie","which subregion of the world is American Samoa in","in what subregion does Russia lie","which subregion of the world is Netherlands in","name the world subregion of Cayman Islands","name the world subregion of Albania","in what subregion does Gambia lie"],"version":1});

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
knowLoad([{"id":"mledoze-countries","columns":["country","alpha-3 code","subregion"],"n":250,"cols":[{"s":"Aruba|Afghanistan|Angola|Åland Islands|Albania|Andorra|United Arab Emirates|Argentina|American Samoa|Australia|Austria|Burundi|Belgium|Benin|Belarus|Belize|Bermuda|Brunei|Botswana|China|Algeria|Fiji|Micronesia|Kazakhstan|Antarctica|Bouvet Island|French Southern and Antarctic Lands|Heard Island and McDonald Islands|South Georgia|Christmas Island|Cocos (Keeling) Islands|New Zealand|Norfolk Island|Anguilla|Antigua and Barbuda|Bahamas|Barbados|British Virgin Islands|Caribbean Netherlands|Cayman Islands|Cuba|Curaçao|Dominica|Dominican Republic|Grenada|Guadeloupe|Haiti|Jamaica|Martinique|Montserrat|Puerto Rico|Saint Barthélemy|Saint Kitts and Nevis|Saint Lucia|Saint Martin|Saint Vincent and the Grenadines|Sint Maarten|Trinidad and Tobago|Turks and Caicos Islands|United States Virgin Islands|Costa Rica|El Salvador|Guatemala|Honduras|Nicaragua|Panama|Kyrgyzstan|Tajikistan|Turkmenistan|Uzbekistan|Czechia|Hungary|Poland|Slovakia|Slovenia|British Indian Ocean Territory|Comoros|Djibouti|Eritrea|Ethiopia|Kenya|Madagascar|Malawi|Mauritius|Mayotte|Mozambique|Rwanda|Réunion|Seychelles|Somalia|Tanzania|Uganda|Zambia|Zimbabwe|Hong Kong|Japan|Macau|Mongolia|North Korea|South Korea|Taiwan|Moldova|Russia|Ukraine|New Caledonia|Papua New Guinea|Solomon Islands|Vanuatu|Guam|Kiribati|Marshall Islands|Nauru|Northern Mariana Islands|Palau|Cameroon|Central African Republic|Chad|Congo|DR Congo|Equatorial Guinea|Gabon|South Sudan|São Tomé and Príncipe|Canada|Greenland|Mexico|Saint Pierre and Miquelon|United States|United States Minor Outlying Islands|Egypt|Libya|Morocco|Sudan|Tunisia|Western Sahara|Denmark|Estonia|Faroe Islands|Finland|Guernsey|Iceland|Ireland|Isle of Man|Jersey|Latvia|Lithuania|Norway|Svalbard and Jan Mayen|Sweden|United Kingdom|Cook Islands|French Polynesia|Niue|Pitcairn Islands|Samoa|Tokelau|Tonga|Tuvalu|Wallis and Futuna|Bolivia|Brazil|Chile|Colombia|Ecuador|Falkland Islands|French Guiana|Guyana|Paraguay|Peru|Suriname|Uruguay|Venezuela|Cambodia|Indonesia|Laos|Malaysia|Myanmar|Philippines|Singapore|Thailand|Timor-Leste|Vietnam|Bosnia and Herzegovina|Bulgaria|Croatia|Kosovo|Montenegro|North Macedonia|Romania|Serbia|Eswatini|Lesotho|Namibia|South Africa|Bangladesh|Bhutan|India|Iran|Maldives|Nepal|Pakistan|Sri Lanka|Cyprus|Gibraltar|Greece|Italy|Malta|Portugal|San Marino|Spain|Vatican City|Burkina Faso|Cape Verde|Gambia|Ghana|Guinea|Guinea-Bissau|Ivory Coast|Liberia|Mali|Mauritania|Niger|Nigeria|Saint Helena, Ascension and Tristan da Cunha|Senegal|Sierra Leone|Togo|Armenia|Azerbaijan|Bahrain|Georgia|Iraq|Israel|Jordan|Kuwait|Lebanon|Oman|Palestine|Qatar|Saudi Arabia|Syria|Türkiye|Yemen|France|Germany|Liechtenstein|Luxembourg|Monaco|Netherlands|Switzerland","sep":"|"},{"s":"ABW|AFG|AGO|ALA|ALB|AND|ARE|ARG|ASM|AUS|AUT|BDI|BEL|BEN|BLR|BLZ|BMU|BRN|BWA|CHN|DZA|FJI|FSM|KAZ|ATA|BVT|ATF|HMD|SGS|CXR|CCK|NZL|NFK|AIA|ATG|BHS|BRB|VGB|BES|CYM|CUB|CUW|DMA|DOM|GRD|GLP|HTI|JAM|MTQ|MSR|PRI|BLM|KNA|LCA|MAF|VCT|SXM|TTO|TCA|VIR|CRI|SLV|GTM|HND|NIC|PAN|KGZ|TJK|TKM|UZB|CZE|HUN|POL|SVK|SVN|IOT|COM|DJI|ERI|ETH|KEN|MDG|MWI|MUS|MYT|MOZ|RWA|REU|SYC|SOM|TZA|UGA|ZMB|ZWE|HKG|JPN|MAC|MNG|PRK|KOR|TWN|MDA|RUS|UKR|NCL|PNG|SLB|VUT|GUM|KIR|MHL|NRU|MNP|PLW|CMR|CAF|TCD|COG|COD|GNQ|GAB|SSD|STP|CAN|GRL|MEX|SPM|USA|UMI|EGY|LBY|MAR|SDN|TUN|ESH|DNK|EST|FRO|FIN|GGY|ISL|IRL|IMN|JEY|LVA|LTU|NOR|SJM|SWE|GBR|COK|PYF|NIU|PCN|WSM|TKL|TON|TUV|WLF|BOL|BRA|CHL|COL|ECU|FLK|GUF|GUY|PRY|PER|SUR|URY|VEN|KHM|IDN|LAO|MYS|MMR|PHL|SGP|THA|TLS|VNM|BIH|BGR|HRV|UNK|MNE|MKD|ROU|SRB|SWZ|LSO|NAM|ZAF|BGD|BTN|IND|IRN|MDV|NPL|PAK|LKA|CYP|GIB|GRC|ITA|MLT|PRT|SMR|ESP|VAT|BFA|CPV|GMB|GHA|GIN|GNB|CIV|LBR|MLI|MRT|NER|NGA|SHN|SEN|SLE|TGO|ARM|AZE|BHR|GEO|IRQ|ISR|JOR|KWT|LBN|OMN|PSE|QAT|SAU|SYR|TUR|YEM|FRA|DEU|LIE|LUX|MCO|NLD|CHE","sep":"|"},{"d":"Caribbean|Southern Asia|Middle Africa|Northern Europe|Southeast Europe|Southern Europe|Western Asia|South America|Polynesia|Australia and New Zealand|Central Europe|Eastern Africa|Western Europe|Western Africa|Eastern Europe|Central America|North America|South-Eastern Asia|Southern Africa|Eastern Asia|Northern Africa|Melanesia|Micronesia|Central Asia|","r":"0*1,1*1,2*1,3*1,4*1,5*1,6*1,7*1,8*1,9*1,a*1,b*1,c*1,d*1,e*1,f*1,g*1,h*1,i*1,j*1,k*1,l*1,m*1,n*1,o*5,9*4,0*r,f*6,n*4,a*5,b*j,j*7,e*3,l*4,m*6,2*9,g*6,k*6,3*f,8*9,7*d,h*a,4*8,i*4,1*8,5*9,d*g,6*g,c*7","sep":"|"}]}]);
const COLONY = [
{"id":"n-6077cbef","guard":[["has","subregion"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sweden in":"Sweden is in Northern Europe.","name the world subregion of Egypt":"Egypt is in Northern Africa.","which subregion of the world is Philippines in":"Philippines is in South-Eastern Asia.","in what subregion does Montserrat lie":"Montserrat is in Caribbean.","which subregion of the world is Congo in":"Congo is in Middle Africa.","which subregion of the world is United States Virgin Islands in":"United States Virgin Islands is in Caribbean.","in what subregion does Nepal lie":"Nepal is in Southern Asia.","which subregion of the world is Tonga in":"Tonga is in Polynesia.","which subregion of the world is Senegal in":"Senegal is in Western Africa.","in what subregion does Luxembourg lie":"Luxembourg is in Western Europe.","in what subregion does United States Minor Outlying Islands lie":"United States Minor Outlying Islands is in North America.","in what subregion does São Tomé and Príncipe lie":"São Tomé and Príncipe is in Middle Africa.","in what subregion does Hong Kong lie":"Hong Kong is in Eastern Asia.","in what subregion does Kyrgyzstan lie":"Kyrgyzstan is in Central Asia.","which subregion of the world is American Samoa in":"American Samoa is in Polynesia.","in what subregion does Russia lie":"Russia is in Eastern Europe.","which subregion of the world is Netherlands in":"Netherlands is in Western Europe.","name the world subregion of Cayman Islands":"Cayman Islands is in Caribbean.","name the world subregion of Albania":"Albania is in Southeast Europe.","in what subregion does Gambia lie":"Gambia is in Western Africa.","which subregion of the world is Timor-Leste in":"Timor-Leste is in South-Eastern Asia.","name the world subregion of Oman":"Oman is in Western Asia.","which subregion of the world is Curaçao in":"Curaçao is in Caribbean.","in what subregion does Tuvalu lie":"Tuvalu is in Polynesia.","name the world subregion of Jamaica":"Jamaica is in Caribbean.","name the world subregion of Estonia":"Estonia is in Northern Europe.","name the world subregion of Guadeloupe":"Guadeloupe is in Caribbean.","in what subregion does Spain lie":"Spain is in Southern Europe.","in what subregion does Brazil lie":"Brazil is in South America.","in what subregion does Cook Islands lie":"Cook Islands is in Polynesia.","in what subregion does Guyana lie":"Guyana is in South America.","in what subregion does Dominica lie":"Dominica is in Caribbean.","name the world subregion of Rwanda":"Rwanda is in Eastern Africa.","name the world subregion of Seychelles":"Seychelles is in Eastern Africa.","in what subregion does Monaco lie":"Monaco is in Western Europe.","which subregion of the world is Lebanon in":"Lebanon is in Western Asia.","name the world subregion of Maldives":"Maldives is in Southern Asia.","name the world subregion of Indonesia":"Indonesia is in South-Eastern Asia.","in what subregion does Bahrain lie":"Bahrain is in Western Asia.","in what subregion does New Zealand lie":"New Zealand is in Australia and New Zealand.","which subregion of the world is Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe.","which subregion of the world is Canada in":"Canada is in North America.","in what subregion does Ivory Coast lie":"Ivory Coast is in Western Africa.","in what subregion does Western Sahara lie":"Western Sahara is in Northern Africa.","which subregion of the world is Sint Maarten in":"Sint Maarten is in Caribbean.","in what subregion does Kiribati lie":"Kiribati is in Micronesia.","which subregion of the world is Malta in":"Malta is in Southern Europe.","which subregion of the world is Chad in":"Chad is in Middle Africa.","which subregion of the world is Armenia in":"Armenia is in Western Asia.","which subregion of the world is Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean.","in what subregion does Croatia lie":"Croatia is in Southeast Europe.","name the world subregion of North Macedonia":"North Macedonia is in Southeast Europe.","which subregion of the world is Guatemala in":"Guatemala is in Central America.","which subregion of the world is Madagascar in":"Madagascar is in Eastern Africa.","name the world subregion of South Sudan":"South Sudan is in Middle Africa.","which subregion of the world is Cameroon in":"Cameroon is in Middle Africa.","name the world subregion of Switzerland":"Switzerland is in Western Europe.","which subregion of the world is Uganda in":"Uganda is in Eastern Africa.","which subregion of the world is Barbados in":"Barbados is in Caribbean.","name the world subregion of Venezuela":"Venezuela is in South America.","which subregion of the world is Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean.","which subregion of the world is Martinique in":"Martinique is in Caribbean.","name the world subregion of Jordan":"Jordan is in Western Asia.","which subregion of the world is Kazakhstan in":"Kazakhstan is in Central Asia.","in what subregion does Saint Vincent and the Grenadines lie":"Saint Vincent and the Grenadines is in Caribbean.","name the world subregion of Togo":"Togo is in Western Africa.","name the world subregion of Chile":"Chile is in South America.","which subregion of the world is Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia.","which subregion of the world is Zimbabwe in":"Zimbabwe is in Eastern Africa.","in what subregion does Ireland lie":"Ireland is in Northern Europe.","name the world subregion of Azerbaijan":"Azerbaijan is in Western Asia.","name the world subregion of Guinea":"Guinea is in Western Africa.","which subregion of the world is Belize in":"Belize is in Central America.","name the world subregion of Syria":"Syria is in Western Asia.","name the world subregion of South Africa":"South Africa is in Southern Africa.","name the world subregion of Norway":"Norway is in Northern Europe.","name the world subregion of Pitcairn Islands":"Pitcairn Islands is in Polynesia.","name the world subregion of Bermuda":"Bermuda is in North America.","name the world subregion of Cape Verde":"Cape Verde is in Western Africa.","name the world subregion of Thailand":"Thailand is in South-Eastern Asia.","in what subregion does Bulgaria lie":"Bulgaria is in Southeast Europe.","in what subregion does Antigua and Barbuda lie":"Antigua and Barbuda is in Caribbean.","in what subregion does Comoros lie":"Comoros is in Eastern Africa.","in what subregion does Isle of Man lie":"Isle of Man is in Northern Europe.","which subregion of the world is Saudi Arabia in":"Saudi Arabia is in Western Asia.","name the world subregion of United States":"United States is in North America.","which subregion of the world is Cuba in":"Cuba is in Caribbean.","name the world subregion of Nicaragua":"Nicaragua is in Central America.","name the world subregion of Portugal":"Portugal is in Southern Europe.","name the world subregion of Namibia":"Namibia is in Southern Africa.","in what subregion does Saint Barthélemy lie":"Saint Barthélemy is in Caribbean.","in what subregion does Türkiye lie":"Türkiye is in Western Asia.","in what subregion does Guernsey lie":"Guernsey is in Northern Europe.","which subregion of the world is Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America.","which subregion of the world is Belarus in":"Belarus is in Eastern Europe.","in what subregion does Marshall Islands lie":"Marshall Islands is in Micronesia.","in what subregion does Greenland lie":"Greenland is in North America.","name the world subregion of Kenya":"Kenya is in Eastern Africa.","name the world subregion of Ukraine":"Ukraine is in Eastern Europe.","which subregion of the world is Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-1cc1a33d","guard":[["hasAny",["antigua","bahrain","brazil","bulgaria","coast","comoros","croatia","dominica","element","gambia","greenland","guernsey","hong","ireland","item number","kiribati","kyrgyzstan","luxembourg","monaco","montserrat","nepal","nth","position","príncipe","sahara","separate by","spain","split","split by","tuvalu","türkiye","world"]],["has","subregion"],["words>=",6]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-d723e46d","guard":[["hasAny",["antigua","bahrain","brazil","bulgaria","coast","comoros","croatia","delete","dominica","element","gambia","greenland","guernsey","hong","ireland","item number","kiribati","kyrgyzstan","luxembourg","monaco","montserrat","nepal","nth","position","príncipe","remove","sahara","spain","strip out","tuvalu","türkiye","without","world"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-0209b138","guard":[["hasAny",["antigua","bahrain","brazil","bulgaria","change to","coast","comoros","croatia","dominica","element","gambia","greenland","guernsey","hong","ireland","item number","kiribati","kyrgyzstan","luxembourg","monaco","montserrat","nepal","nth","position","príncipe","replace","sahara","spain","substitute","swap","tuvalu","türkiye","world"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-865e5b94","guard":[["hasAny",["antigua","bahrain","brazil","bulgaria","change to","coast","comoros","croatia","dominica","element","gambia","greenland","guernsey","hong","ireland","item number","kiribati","kyrgyzstan","luxembourg","monaco","montserrat","nepal","nth","position","príncipe","replace","sahara","spain","substitute","swap","tuvalu","türkiye","world"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.text"]]],"mem":null},
{"id":"n-98eb65e9","guard":[["hasAny",["afghanistan","albania","american","arabia","armenia","azerbaijan","barbados","belarus","belize","bermuda","cameroon","canada","cape","chad","chile","congo","cuba","curaçao","element","estonia","guadeloupe","guinea","indonesia","item number","jamaica","jan","jordan","kazakhstan","kenya","lebanon","lie","macedonia","madagascar","maldives","malta","martinique","namibia","netherlands","norway","nth","oman","philippines","portugal","position","rwanda","senegal","separate by","split","split by","states","sudan","sweden","switzerland","syria","thailand","tobago","togo","tonga","uganda","ukraine","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","caribbean"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.lastWord"]]],"mem":null},
{"id":"n-ae47f422","guard":[["hasAny",["afghanistan","albania","american","arabia","armenia","azerbaijan","barbados","belarus","belize","bermuda","cameroon","canada","cape","chad","chile","congo","cuba","curaçao","delete","element","estonia","guadeloupe","guinea","indonesia","item number","jamaica","jan","jordan","kazakhstan","kenya","lebanon","lie","macedonia","madagascar","maldives","malta","martinique","namibia","netherlands","norway","nth","oman","philippines","portugal","position","remove","rwanda","senegal","states","strip out","sudan","sweden","switzerland","syria","thailand","tobago","togo","tonga","uganda","ukraine","without","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","caribbean"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.lastWord"]]],"mem":null},
{"id":"n-5294dc95","guard":[["hasAny",["afghanistan","albania","american","arabia","armenia","azerbaijan","barbados","belarus","belize","bermuda","cameroon","canada","cape","chad","change to","chile","congo","cuba","curaçao","element","estonia","guadeloupe","guinea","indonesia","item number","jamaica","jan","jordan","kazakhstan","kenya","lebanon","lie","macedonia","madagascar","maldives","malta","martinique","namibia","netherlands","norway","nth","oman","philippines","portugal","position","replace","rwanda","senegal","states","substitute","sudan","swap","sweden","switzerland","syria","thailand","tobago","togo","tonga","uganda","ukraine","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","caribbean"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-e0d0b85a","guard":[["hasAny",["afghanistan","albania","american","arabia","armenia","azerbaijan","barbados","belarus","belize","bermuda","cameroon","canada","cape","chad","change to","chile","congo","cuba","curaçao","element","estonia","guadeloupe","guinea","indonesia","item number","jamaica","jan","jordan","kazakhstan","kenya","lebanon","lie","macedonia","madagascar","maldives","malta","martinique","namibia","netherlands","norway","nth","oman","philippines","portugal","position","replace","rwanda","senegal","states","substitute","sudan","swap","sweden","switzerland","syria","thailand","tobago","togo","tonga","uganda","ukraine","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","caribbean"]]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-6f835c63","guard":[["hasAny",["afghanistan","albania","american","arabia","armenia","azerbaijan","barbados","belarus","belize","bermuda","cameroon","canada","cape","chad","chile","congo","cuba","curaçao","element","estonia","guadeloupe","guinea","item number","jamaica","jan","jordan","kazakhstan","kenya","lebanon","lie","macedonia","madagascar","maldives","malta","martinique","namibia","netherlands","normalise","normalize","norway","nth","oman","portugal","position","rwanda","senegal","simplify the text","south","states","sweden","switzerland","syria","tobago","togo","tonga","uganda","ukraine","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","caribbean"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":1}]],"mem":null},
{"id":"n-247c6e5e","guard":[["hasAny",["afghanistan","american","arabia","armenia","azerbaijan","barbados","belarus","belize","bermuda","cameroon","canada","cape","chad","chile","congo","cuba","curaçao","element","guadeloupe","guinea","indonesia","item number","jamaica","jan","jordan","kazakhstan","kenya","lebanon","lie","madagascar","malta","martinique","netherlands","nth","oman","philippines","position","rwanda","senegal","separate by","split","split by","states","sudan","sweden","switzerland","syria","thailand","tobago","togo","tonga","uganda","ukraine","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","caribbean"]]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-51adec2e","guard":[["hasAny",["afghanistan","american","arabia","armenia","azerbaijan","barbados","belarus","belize","bermuda","cameroon","canada","cape","chad","chile","congo","cuba","curaçao","delete","element","guadeloupe","guinea","indonesia","item number","jamaica","jan","jordan","kazakhstan","kenya","lebanon","lie","madagascar","malta","martinique","netherlands","nth","oman","philippines","position","remove","rwanda","senegal","states","strip out","sudan","sweden","switzerland","syria","thailand","tobago","togo","tonga","uganda","ukraine","without","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","caribbean"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-6c3a9ede","guard":[["hasAny",["afghanistan","american","arabia","armenia","azerbaijan","barbados","belarus","belize","bermuda","cameroon","canada","cape","chad","chile","congo","cuba","curaçao","element","guadeloupe","guinea","indonesia","item number","jamaica","jan","jordan","kazakhstan","kenya","lebanon","lie","madagascar","malta","martinique","netherlands","nth","oman","philippines","position","rwanda","senegal","separate by","split","split by","states","sudan","sweden","switzerland","syria","thailand","tobago","togo","tonga","uganda","ukraine","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","caribbean"]]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-95320992","guard":[["hasAny",["afghanistan","american","arabia","armenia","azerbaijan","barbados","belarus","belize","bermuda","cameroon","canada","cape","chad","chile","congo","cuba","curaçao","element","guadeloupe","guinea","indonesia","item number","jamaica","jan","jordan","kazakhstan","kenya","lebanon","lie","madagascar","malta","martinique","netherlands","nth","oman","philippines","position","rwanda","senegal","separate by","split","split by","states","sudan","sweden","switzerland","syria","thailand","tobago","togo","tonga","uganda","ukraine","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","caribbean"]]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-434daf44","guard":[["hasAny",["afghanistan","albania","american","arabia","armenia","azerbaijan","barbados","belarus","belize","bermuda","cameroon","canada","chad","chile","congo","cuba","curaçao","element","estonia","guadeloupe","guinea","indonesia","item number","jamaica","jan","jordan","kazakhstan","kenya","lebanon","lie","madagascar","maldives","malta","mariana","namibia","norway","nth","oman","portugal","position","rwanda","senegal","separate by","split","split by","sweden","switzerland","syria","thailand","togo","tonga","uganda","ukraine","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-d409615a","guard":[["hasAny",["afghanistan","albania","american","antigua","arabia","armenia","azerbaijan","bahrain","barbados","belarus","belize","bermuda","brazil","bulgaria","cameroon","canada","cape","chad","chile","coast","comoros","congo","croatia","cuba","curaçao","dominica","element","estonia","gambia","greenland","guadeloupe","guernsey","guinea","hong","ireland","item number","jamaica","jan","jordan","kazakhstan","kenya","kiribati","kyrgyzstan","lebanon","luxembourg","macedonia","madagascar","maldives","malta","martinique","monaco","montserrat","namibia","nepal","normalise","normalize","norway","nth","oman","portugal","position","príncipe","rwanda","sahara","senegal","simplify the text","south","spain","states","sweden","switzerland","syria","tobago","togo","tonga","tuvalu","türkiye","uganda","ukraine","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":2}]],"mem":null},
{"id":"n-1e28de2e","guard":[["hasAny",["afghanistan","albania","antigua","arabia","armenia","azerbaijan","bahrain","barthélemy","belarus","belize","bermuda","brazil","bulgaria","cameroon","canada","cape","chad","chile","coast","comoros","congo","cook","croatia","dominica","element","estonia","gambia","greenland","guernsey","guinea","hong","indonesia","ireland","item number","jan","jordan","kazakhstan","kenya","kyrgyzstan","leading zeros","lebanon","luxembourg","macedonia","madagascar","maldives","malta","minor","miquelon","monaco","montserrat","namibia","nepal","netherlands","new","norway","nth","oman","pad","pad with","padded to","philippines","portugal","position","príncipe","rwanda","sahara","senegal","south","spain","sweden","switzerland","syria","thailand","togo","tuvalu","türkiye","uganda","ukraine","zero pad","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","caribbean"]]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-a45bce5b","guard":[["hasAny",["afghanistan","albania","arabia","armenia","azerbaijan","bahrain","belarus","belize","bermuda","brazil","bulgaria","cameroon","canada","cape","chad","chile","coast","comoros","congo","croatia","element","estonia","gambia","greenland","guernsey","guinea","hong","indonesia","ireland","item number","jan","jordan","kazakhstan","kenya","kiribati","kyrgyzstan","leading zeros","lebanon","luxembourg","macedonia","madagascar","maldives","malta","mariana","marshall","minor","miquelon","monaco","namibia","nepal","new","norway","nth","oman","pad","pad with","padded to","philippines","portugal","position","príncipe","rwanda","sahara","senegal","south","spain","sweden","switzerland","syria","thailand","togo","türkiye","uganda","ukraine","zero pad","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-fd60bb46","guard":[["hasAny",["afghanistan","albania","arabia","armenia","azerbaijan","bahrain","belarus","belize","bermuda","brazil","bulgaria","cameroon","canada","cape","chad","chile","coast","comoros","congo","croatia","element","estonia","gambia","greenland","guernsey","guinea","hong","indonesia","ireland","item number","jan","jordan","kazakhstan","kenya","kiribati","kyrgyzstan","leading zeros","lebanon","luxembourg","macedonia","madagascar","maldives","malta","mariana","marshall","minor","miquelon","monaco","namibia","nepal","new","norway","nth","oman","pad","pad with","padded to","philippines","portugal","position","príncipe","rwanda","sahara","senegal","south","spain","sweden","switzerland","syria","thailand","togo","türkiye","uganda","ukraine","zero pad","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-8bd54e79","guard":[["hasAny",["afghanistan","albania","arabia","armenia","azerbaijan","bahrain","belarus","belize","bermuda","brazil","bulgaria","cameroon","canada","cape","chad","chile","coast","comoros","congo","croatia","element","estonia","gambia","greenland","guernsey","guinea","hong","indonesia","ireland","item number","jan","jordan","kazakhstan","kenya","kiribati","kyrgyzstan","leading zeros","lebanon","luxembourg","macedonia","madagascar","maldives","malta","mariana","marshall","minor","miquelon","monaco","namibia","nepal","new","norway","nth","oman","pad","pad with","padded to","philippines","portugal","position","príncipe","rwanda","sahara","senegal","south","spain","sweden","switzerland","syria","thailand","togo","türkiye","uganda","ukraine","zero pad","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-7e902ef5","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","subregion","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-b9f8e9c1","guard":[["has","subregion"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"world"}]]],"mem":{"table":{"is Sweden in":"Sweden is in Northern Europe.","subregion of Egypt":"Egypt is in Northern Africa.","is Philippines in":"Philippines is in South-Eastern Asia.","is Congo in":"Congo is in Middle Africa.","is United States Virgin Islands in":"United States Virgin Islands is in Caribbean.","is Tonga in":"Tonga is in Polynesia.","is Senegal in":"Senegal is in Western Africa.","is American Samoa in":"American Samoa is in Polynesia.","is Netherlands in":"Netherlands is in Western Europe.","subregion of Cayman Islands":"Cayman Islands is in Caribbean.","subregion of Albania":"Albania is in Southeast Europe.","is Timor-Leste in":"Timor-Leste is in South-Eastern Asia.","subregion of Oman":"Oman is in Western Asia.","is Curaçao in":"Curaçao is in Caribbean.","subregion of Jamaica":"Jamaica is in Caribbean.","subregion of Estonia":"Estonia is in Northern Europe.","subregion of Guadeloupe":"Guadeloupe is in Caribbean.","subregion of Rwanda":"Rwanda is in Eastern Africa.","subregion of Seychelles":"Seychelles is in Eastern Africa.","is Lebanon in":"Lebanon is in Western Asia.","subregion of Maldives":"Maldives is in Southern Asia.","subregion of Indonesia":"Indonesia is in South-Eastern Asia.","is Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe.","is Canada in":"Canada is in North America.","is Sint Maarten in":"Sint Maarten is in Caribbean.","is Malta in":"Malta is in Southern Europe.","is Chad in":"Chad is in Middle Africa.","is Armenia in":"Armenia is in Western Asia.","is Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean.","subregion of North Macedonia":"North Macedonia is in Southeast Europe.","is Guatemala in":"Guatemala is in Central America.","is Madagascar in":"Madagascar is in Eastern Africa.","subregion of South Sudan":"South Sudan is in Middle Africa.","is Cameroon in":"Cameroon is in Middle Africa.","subregion of Switzerland":"Switzerland is in Western Europe.","is Uganda in":"Uganda is in Eastern Africa.","is Barbados in":"Barbados is in Caribbean.","subregion of Venezuela":"Venezuela is in South America.","is Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean.","is Martinique in":"Martinique is in Caribbean.","subregion of Jordan":"Jordan is in Western Asia.","is Kazakhstan in":"Kazakhstan is in Central Asia.","subregion of Togo":"Togo is in Western Africa.","subregion of Chile":"Chile is in South America.","is Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia.","is Zimbabwe in":"Zimbabwe is in Eastern Africa.","subregion of Azerbaijan":"Azerbaijan is in Western Asia.","subregion of Guinea":"Guinea is in Western Africa.","is Belize in":"Belize is in Central America.","subregion of Syria":"Syria is in Western Asia.","subregion of South Africa":"South Africa is in Southern Africa.","subregion of Norway":"Norway is in Northern Europe.","subregion of Pitcairn Islands":"Pitcairn Islands is in Polynesia.","subregion of Bermuda":"Bermuda is in North America.","subregion of Cape Verde":"Cape Verde is in Western Africa.","subregion of Thailand":"Thailand is in South-Eastern Asia.","is Saudi Arabia in":"Saudi Arabia is in Western Asia.","subregion of United States":"United States is in North America.","is Cuba in":"Cuba is in Caribbean.","subregion of Nicaragua":"Nicaragua is in Central America.","subregion of Portugal":"Portugal is in Southern Europe.","subregion of Namibia":"Namibia is in Southern Africa.","is Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America.","is Belarus in":"Belarus is in Eastern Europe.","subregion of Kenya":"Kenya is in Eastern Africa.","subregion of Ukraine":"Ukraine is in Eastern Europe.","is Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-6e6e85d8","guard":[["hasAny",["afghanistan","albania","arabia","armenia","azerbaijan","bahrain","belarus","belize","bermuda","brazil","bulgaria","cameroon","canada","cape","chad","chile","coast","comoros","congo","croatia","element","estonia","gambia","greenland","guernsey","guinea","hong","indonesia","ireland","item number","jan","jordan","kazakhstan","kenya","kyrgyzstan","leading zeros","lebanon","luxembourg","macedonia","madagascar","maldives","malta","minor","miquelon","monaco","namibia","nepal","new","norway","nth","oman","pad","pad with","padded to","philippines","portugal","position","príncipe","rwanda","sahara","senegal","south","spain","sweden","switzerland","syria","thailand","togo","türkiye","uganda","ukraine","zero pad","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-2b63da4a","guard":[["hasAny",["afghanistan","albania","arabia","armenia","azerbaijan","bahrain","belarus","belize","bermuda","brazil","bulgaria","cameroon","canada","cape","chad","chile","coast","comoros","congo","croatia","element","estonia","gambia","greenland","guernsey","guinea","hong","indonesia","ireland","item number","jan","jordan","kazakhstan","kenya","kyrgyzstan","leading zeros","lebanon","luxembourg","macedonia","madagascar","maldives","malta","minor","miquelon","monaco","namibia","nepal","new","norway","nth","oman","pad","pad with","padded to","philippines","portugal","position","príncipe","rwanda","sahara","senegal","south","spain","sweden","switzerland","syria","thailand","togo","türkiye","uganda","ukraine","zero pad","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-5fbc48ee","guard":[["hasAny",["afghanistan","albania","armenia","azerbaijan","bahrain","barbados","belarus","belize","bermuda","brazil","bulgaria","cameroon","canada","chad","chile","comoros","congo","croatia","cuba","curaçao","dashes","dominica","element","estonia","gambia","greenland","guadeloupe","guernsey","guinea","hyphens","indonesia","ireland","item number","jamaica","jordan","kazakhstan","kebab case","kebabcase","kenya","kiribati","kyrgyzstan","lebanon","luxembourg","madagascar","maldives","malta","martinique","monaco","montserrat","namibia","nepal","norway","nth","oman","philippines","portugal","position","rwanda","senegal","slug","spain","sweden","switzerland","syria","thailand","togo","tonga","tuvalu","türkiye","uganda","ukraine","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["transform.kebab",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-9fb2b5e9","guard":[["hasAny",["afghanistan","albania","armenia","azerbaijan","bahrain","barbados","belarus","belize","bermuda","brazil","bulgaria","cameroon","canada","chad","chile","comoros","congo","croatia","cuba","curaçao","dominica","element","estonia","gambia","greenland","guadeloupe","guernsey","guinea","indonesia","ireland","item number","jamaica","jordan","kazakhstan","kenya","kiribati","kyrgyzstan","lebanon","luxembourg","madagascar","maldives","malta","martinique","monaco","montserrat","namibia","nepal","norway","nth","oman","philippines","portugal","position","reverse the words","reverse word order","rwanda","senegal","spain","sweden","switzerland","syria","thailand","togo","tonga","tuvalu","türkiye","uganda","ukraine","words backwards","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["transform.reverseWords",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-18062383","guard":[["hasAny",["afghanistan","american","antigua","arabia","armenia","bahrain","barbados","barthélemy","belarus","belize","brazil","bulgaria","cameroon","canada","chad","coast","comoros","congo","cook","croatia","cuba","curaçao","dominica","element","gambia","greenland","guernsey","hong","ireland","item number","jan","kazakhstan","kiribati","kyrgyzstan","leading zeros","lebanon","luxembourg","madagascar","malta","mariana","marshall","martinique","minor","miquelon","monaco","montserrat","nepal","new","nth","pad","pad with","padded to","philippines","position","príncipe","sahara","senegal","spain","sweden","tonga","tuvalu","türkiye","uganda","zero pad","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-2f6718a5","guard":[["hasAny",["afghanistan","american","antigua","arabia","armenia","bahrain","barbados","barthélemy","belarus","belize","brazil","bulgaria","cameroon","canada","chad","coast","comoros","congo","cook","croatia","cuba","curaçao","dominica","element","gambia","greenland","guernsey","hong","ireland","item number","jan","kazakhstan","kiribati","kyrgyzstan","leading zeros","lebanon","luxembourg","madagascar","malta","mariana","marshall","martinique","minor","miquelon","monaco","montserrat","nepal","new","nth","pad","pad with","padded to","philippines","position","príncipe","sahara","senegal","spain","sweden","tonga","tuvalu","türkiye","uganda","zero pad","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-96352048","guard":[["hasAny",["afghanistan","american","antigua","arabia","armenia","bahrain","barbados","barthélemy","belarus","belize","brazil","bulgaria","cameroon","canada","chad","coast","comoros","congo","cook","croatia","cuba","curaçao","dominica","element","gambia","greenland","guernsey","hong","ireland","item number","jan","kazakhstan","kiribati","kyrgyzstan","leading zeros","lebanon","luxembourg","madagascar","malta","mariana","marshall","martinique","minor","miquelon","monaco","montserrat","nepal","new","nth","pad","pad with","padded to","philippines","position","príncipe","sahara","senegal","spain","sweden","tonga","tuvalu","türkiye","uganda","zero pad","zimbabwe"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-8b6f1faa","guard":[["hasAny",["afghanistan","american","arabia","armenia","bahrain","barbados","barthélemy","belarus","belize","brazil","bulgaria","cameroon","canada","chad","coast","comoros","congo","croatia","cuba","curaçao","dominica","element","gambia","greenland","guernsey","hong","ireland","item number","kazakhstan","kiribati","kyrgyzstan","lebanon","luxembourg","madagascar","malta","martinique","monaco","montserrat","nepal","new","normalise","normalize","nth","philippines","position","sahara","senegal","simplify the text","spain","sweden","tonga","tuvalu","türkiye","uganda","zimbabwe"]],["has","subregion"],["words>=",6],["not",["has","and"]],["not",["has","burkina"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["transform.norm",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-7629264c","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","subregion","without"]],["has","in"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-bbc28d72","guard":[["hasAny",["element","item number","join","joined with","nth","position","separated by","subregion"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["transform.join",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-8b10c59f","guard":[["hasAny",["antigua","bahrain","brazil","bulgaria","change to","coast","comoros","croatia","dominica","element","gambia","greenland","guernsey","guyana","hong","ireland","islands","isle","item number","kiribati","kyrgyzstan","luxembourg","monaco","montserrat","nepal","nth","position","príncipe","replace","russia","sahara","saint","spain","substitute","swap","tuvalu","türkiye","world"]],["has","subregion"],["has","in"]],"pyramid":["render.str",["transform.replace",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-cf16984b","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","subregion","without"]],["has","in"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"alpha-3 code"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-cc572d15","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","subregion","without"]],["has","which"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-545628c7","guard":[["hasAny",["antigua","bahrain","barthélemy","brazil","bulgaria","coast","comoros","croatia","dominica","element","gambia","greenland","guernsey","guyana","hong","ireland","islands","isle","item number","jan","kiribati","kyrgyzstan","leading zeros","luxembourg","miquelon","monaco","montserrat","nepal","new","nth","pad","pad with","padded to","position","príncipe","russia","sahara","spain","tuvalu","türkiye","zero pad"]],["has","subregion"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-4f6f4c85","guard":[["has","subregion"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"in"}]]],"mem":{"table":{"which subregion of the world is Sweden":"Sweden is in Northern Europe.","which subregion of the world is Philippines":"Philippines is in South-Eastern Asia.","which subregion of the world is Congo":"Congo is in Middle Africa.","which subregion of the world is United States Virgin Islands":"United States Virgin Islands is in Caribbean.","which subregion of the world is Tonga":"Tonga is in Polynesia.","which subregion of the world is Senegal":"Senegal is in Western Africa.","which subregion of the world is American Samoa":"American Samoa is in Polynesia.","which subregion of the world is Netherlands":"Netherlands is in Western Europe.","which subregion of the world is Timor-Leste":"Timor-Leste is in South-Eastern Asia.","which subregion of the world is Curaçao":"Curaçao is in Caribbean.","which subregion of the world is Lebanon":"Lebanon is in Western Asia.","which subregion of the world is Svalbard and Jan Mayen":"Svalbard and Jan Mayen is in Northern Europe.","which subregion of the world is Canada":"Canada is in North America.","which subregion of the world is Sint Maarten":"Sint Maarten is in Caribbean.","which subregion of the world is Malta":"Malta is in Southern Europe.","which subregion of the world is Chad":"Chad is in Middle Africa.","which subregion of the world is Armenia":"Armenia is in Western Asia.","which subregion of the world is Trinidad and Tobago":"Trinidad and Tobago is in Caribbean.","which subregion of the world is Guatemala":"Guatemala is in Central America.","which subregion of the world is Madagascar":"Madagascar is in Eastern Africa.","which subregion of the world is Cameroon":"Cameroon is in Middle Africa.","which subregion of the world is Uganda":"Uganda is in Eastern Africa.","which subregion of the world is Barbados":"Barbados is in Caribbean.","which subregion of the world is Saint Kitts and Nevis":"Saint Kitts and Nevis is in Caribbean.","which subregion of the world is Martinique":"Martinique is in Caribbean.","which subregion of the world is Kazakhstan":"Kazakhstan is in Central Asia.","which subregion of the world is Northern Mariana Islands":"Northern Mariana Islands is in Micronesia.","which subregion of the world is Zimbabwe":"Zimbabwe is in Eastern Africa.","which subregion of the world is Belize":"Belize is in Central America.","which subregion of the world is Saudi Arabia":"Saudi Arabia is in Western Asia.","which subregion of the world is Cuba":"Cuba is in Caribbean.","which subregion of the world is Saint Pierre and Miquelon":"Saint Pierre and Miquelon is in North America.","which subregion of the world is Belarus":"Belarus is in Eastern Europe.","which subregion of the world is Afghanistan":"Afghanistan is in Southern Asia."}}},
{"id":"n-93d1b063","guard":[["has","subregion"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"Sweden in":"Sweden is in Northern Europe.","Philippines in":"Philippines is in South-Eastern Asia.","Congo in":"Congo is in Middle Africa.","United States Virgin Islands in":"United States Virgin Islands is in Caribbean.","Tonga in":"Tonga is in Polynesia.","Senegal in":"Senegal is in Western Africa.","American Samoa in":"American Samoa is in Polynesia.","Netherlands in":"Netherlands is in Western Europe.","Timor-Leste in":"Timor-Leste is in South-Eastern Asia.","Curaçao in":"Curaçao is in Caribbean.","Lebanon in":"Lebanon is in Western Asia.","Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe.","Canada in":"Canada is in North America.","Sint Maarten in":"Sint Maarten is in Caribbean.","Malta in":"Malta is in Southern Europe.","Chad in":"Chad is in Middle Africa.","Armenia in":"Armenia is in Western Asia.","Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean.","Guatemala in":"Guatemala is in Central America.","Madagascar in":"Madagascar is in Eastern Africa.","Cameroon in":"Cameroon is in Middle Africa.","Uganda in":"Uganda is in Eastern Africa.","Barbados in":"Barbados is in Caribbean.","Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean.","Martinique in":"Martinique is in Caribbean.","Kazakhstan in":"Kazakhstan is in Central Asia.","Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia.","Zimbabwe in":"Zimbabwe is in Eastern Africa.","Belize in":"Belize is in Central America.","Saudi Arabia in":"Saudi Arabia is in Western Asia.","Cuba in":"Cuba is in Caribbean.","Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America.","Belarus in":"Belarus is in Eastern Europe.","Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-9ef7ab84","guard":[["hasAny",["delete","element","item number","lie","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-d6eee263","guard":[["has","lie"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"in"}]]],"mem":{"table":{"what subregion does Montserrat lie":"Montserrat is in Caribbean.","what subregion does Nepal lie":"Nepal is in Southern Asia.","what subregion does Luxembourg lie":"Luxembourg is in Western Europe.","what subregion does United States Minor Outlying Islands lie":"United States Minor Outlying Islands is in North America.","what subregion does São Tomé and Príncipe lie":"São Tomé and Príncipe is in Middle Africa.","what subregion does Hong Kong lie":"Hong Kong is in Eastern Asia.","what subregion does Kyrgyzstan lie":"Kyrgyzstan is in Central Asia.","what subregion does Russia lie":"Russia is in Eastern Europe.","what subregion does Gambia lie":"Gambia is in Western Africa.","what subregion does Tuvalu lie":"Tuvalu is in Polynesia.","what subregion does Spain lie":"Spain is in Southern Europe.","what subregion does Brazil lie":"Brazil is in South America.","what subregion does Cook Islands lie":"Cook Islands is in Polynesia.","what subregion does Guyana lie":"Guyana is in South America.","what subregion does Dominica lie":"Dominica is in Caribbean.","what subregion does Monaco lie":"Monaco is in Western Europe.","what subregion does Bahrain lie":"Bahrain is in Western Asia.","what subregion does New Zealand lie":"New Zealand is in Australia and New Zealand.","what subregion does Ivory Coast lie":"Ivory Coast is in Western Africa.","what subregion does Western Sahara lie":"Western Sahara is in Northern Africa.","what subregion does Kiribati lie":"Kiribati is in Micronesia.","what subregion does Croatia lie":"Croatia is in Southeast Europe.","what subregion does Saint Vincent and the Grenadines lie":"Saint Vincent and the Grenadines is in Caribbean.","what subregion does Ireland lie":"Ireland is in Northern Europe.","what subregion does Bulgaria lie":"Bulgaria is in Southeast Europe.","what subregion does Antigua and Barbuda lie":"Antigua and Barbuda is in Caribbean.","what subregion does Comoros lie":"Comoros is in Eastern Africa.","what subregion does Isle of Man lie":"Isle of Man is in Northern Europe.","what subregion does Saint Barthélemy lie":"Saint Barthélemy is in Caribbean.","what subregion does Türkiye lie":"Türkiye is in Western Asia.","what subregion does Guernsey lie":"Guernsey is in Northern Europe.","what subregion does Marshall Islands lie":"Marshall Islands is in Micronesia.","what subregion does Greenland lie":"Greenland is in North America."}}},
{"id":"n-85db4f0d","guard":[["hasAny",["american","antigua","arabia","armenia","azerbaijan","bahrain","barbados","barthélemy","characters from","cook","cuba","curaçao","dominica","element","guadeloupe","hong","item number","jamaica","jordan","kazakhstan","kiribati","kitts","kyrgyzstan","lebanon","letters from to","mariana","marshall","martinique","montserrat","nth","oman","position","slice of the text","substring","syria","tobago","tonga","tuvalu","türkiye","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-b55bc152","guard":[["hasAny",["bahrain","brazil","bulgaria","coast","comoros","croatia","element","gambia","greenland","guernsey","guyana","hong","ireland","isle","item number","jan","kiribati","kyrgyzstan","leading zeros","luxembourg","marshall","minor","miquelon","monaco","nepal","new","nth","pad","pad with","padded to","position","príncipe","russia","sahara","spain","türkiye","zero pad"]],["has","subregion"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":10},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-21678143","guard":[["hasAny",["albania","azerbaijan","bermuda","change to","chile","egypt","element","estonia","guadeloupe","guinea","indonesia","item number","jamaica","jordan","kenya","maldives","namibia","nicaragua","norway","nth","oman","portugal","position","replace","rwanda","seychelles","substitute","swap","switzerland","syria","thailand","togo","ukraine","venezuela"]],["has","world"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-3d1e5835","guard":[["hasAny",["bahrain","brazil","bulgaria","coast","comoros","croatia","element","gambia","greenland","guernsey","guyana","hong","ireland","isle","item number","jan","kyrgyzstan","leading zeros","luxembourg","minor","miquelon","monaco","nepal","new","nth","pad","pad with","padded to","position","príncipe","russia","sahara","spain","türkiye","zero pad"]],["has","subregion"]],"pyramid":["render.str",["transform.padStart",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":12},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-41b99412","guard":[["hasAny",["albania","azerbaijan","bermuda","change to","chile","egypt","element","estonia","guadeloupe","guinea","indonesia","item number","jamaica","jordan","kenya","maldives","namibia","nicaragua","norway","nth","oman","portugal","position","replace","rwanda","seychelles","substitute","swap","switzerland","syria","thailand","togo","ukraine","venezuela"]],["has","world"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-ed95b367","guard":[["hasAny",["american","antigua","barbados","barthélemy","belarus","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","normalise","normalize","nth","position","simplify the text","tobago","tonga","tuvalu","ukraine","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":3}]],"mem":null},
{"id":"n-018d2637","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","snake case","snakecase","tobago","tonga","tuvalu","underscores","variable name","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-17ec9d90","guard":[["hasAny",["american","antigua","barbados","barthélemy","camel case","camelcase","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","lower camel case","mariana","marshall","martinique","montserrat","nth","position","tobago","tonga","tuvalu","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-2e1c5d73","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-905d3cd3","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-a1e9d0f1","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","reverse the words","reverse word order","tobago","tonga","tuvalu","virgin","words backwards"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-a7dd22d2","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-e9d0f58a","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dashes","dominica","element","guadeloupe","hyphens","item number","jamaica","kebab case","kebabcase","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","slug","tobago","tonga","tuvalu","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-f4ff4128","guard":[["hasAny",["american","antigua","barbados","barthélemy","class name","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","pascal case","pascalcase","position","tobago","tonga","tuvalu","upper camel case","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-06ecb3e2","guard":[["hasAny",["all caps","american","antigua","barbados","barthélemy","capital letters","capitals","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","reverse the words","reverse word order","tobago","tonga","tuvalu","upper case","uppercase","virgin","words backwards"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-24738c32","guard":[["hasAny",["american","antigua","barbados","barthélemy","class name","cook","cuba","curaçao","dominica","element","guadeloupe","invert case","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","pascal case","pascalcase","position","swap case","tobago","toggle case","tonga","tuvalu","upper camel case","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-4d6cfdf3","guard":[["hasAny",["american","antigua","barbados","barthélemy","camel case","camelcase","cook","cuba","curaçao","dominica","element","guadeloupe","invert case","item number","jamaica","kiribati","kitts","lower camel case","mariana","marshall","martinique","montserrat","nth","position","swap case","tobago","toggle case","tonga","tuvalu","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-5a622258","guard":[["hasAny",["a to z","alphabetical","alphabetize","american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","sort","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-630f09b8","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","element","guadeloupe","invert case","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","reverse the words","reverse word order","swap case","tobago","toggle case","tonga","tuvalu","virgin","words backwards"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-72665ccc","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dashes","dominica","element","guadeloupe","hyphens","item number","jamaica","kebab case","kebabcase","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","reverse the words","reverse word order","slug","tobago","tonga","tuvalu","virgin","words backwards"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.kebab",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-78922747","guard":[["hasAny",["american","antigua","barbados","barthélemy","capitalise","capitalize","capitalize each word","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","reverse the words","reverse word order","title case","tobago","tonga","tuvalu","virgin","words backwards"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-7ae82885","guard":[["hasAny",["american","antigua","barbados","barthélemy","class name","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","pascal case","pascalcase","position","reverse the words","reverse word order","tobago","tonga","tuvalu","upper camel case","virgin","words backwards"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.pascal",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-7e5c3a1b","guard":[["hasAny",["american","antigua","backwards","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","reverse","reverse order","reversed","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-83c1db95","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","shortest","shortest one","shortest word","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-903b81b1","guard":[["hasAny",["a to z","alphabetical","alphabetize","american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","sort","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-ab85f26c","guard":[["hasAny",["american","antigua","barbados","barthélemy","camel case","camelcase","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","lower camel case","mariana","marshall","martinique","montserrat","nth","position","reverse the words","reverse word order","tobago","tonga","tuvalu","virgin","words backwards"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.camel",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-b49783fa","guard":[["hasAny",["american","antigua","barbados","barthélemy","camel case","camelcase","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","lower camel case","lower case","lowercase","mariana","marshall","martinique","montserrat","nth","position","small letters","tobago","tonga","tuvalu","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.lower",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-c4298c19","guard":[["hasAny",["american","antigua","backwards","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","reverse","reverse order","reversed","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-c4f5308f","guard":[["hasAny",["american","antigua","backwards","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","reverse","reverse order","reversed","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-e69ef179","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","reverse the words","reverse word order","snake case","snakecase","tobago","tonga","tuvalu","underscores","variable name","virgin","words backwards"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.snake",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-eb9c2d05","guard":[["hasAny",["a to z","alphabetical","alphabetize","american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","sort","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-ee80bae8","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","each word","element","guadeloupe","item number","jamaica","kiribati","kitts","longest","longest one","longest word","mariana","marshall","martinique","montserrat","nth","position","split into words","tobago","tonga","tuvalu","virgin","words"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-f453843d","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","lower case","lowercase","mariana","marshall","martinique","montserrat","nth","position","reverse the words","reverse word order","small letters","tobago","tonga","tuvalu","virgin","words backwards"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]]],"mem":null},
{"id":"n-c5c94d42","guard":[["hasAny",["american","antigua","barbados","barthélemy","characters from","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","letters from to","mariana","marshall","martinique","montserrat","nth","position","slice of the text","substring","tobago","tonga","tuvalu","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-71ceb983","guard":[["hasAny",["american","antigua","barbados","barthélemy","class name","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","pascal case","pascalcase","position","tobago","tonga","tuvalu","upper camel case","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-aee14fd0","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","reverse the words","reverse word order","tobago","tonga","tuvalu","virgin","words backwards"]],["has","subregion"],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-d5e8302c","guard":[["hasAny",["american","antigua","barbados","barthélemy","camel case","camelcase","cook","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","kiribati","kitts","lower camel case","mariana","marshall","martinique","montserrat","nth","position","tobago","tonga","tuvalu","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-ed5c1096","guard":[["hasAny",["american","antigua","barbados","barthélemy","cook","cuba","curaçao","dashes","dominica","element","guadeloupe","hyphens","item number","jamaica","kebab case","kebabcase","kiribati","kitts","mariana","marshall","martinique","montserrat","nth","position","slug","tobago","tonga","tuvalu","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-fa239436","guard":[["hasAny",["antigua","barbados","barthélemy","cuba","curaçao","dominica","guadeloupe","jamaica","kitts","martinique","montserrat","tobago","virgin"]],["has","subregion"],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-6c8a3de5","guard":[["hasAny",["barbados","cayman","cuba","curaçao","delete","guadeloupe","jamaica","kitts","maarten","martinique","strip out","tobago","virgin"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-6deeb657","guard":[["hasAny",["barbados","cayman","cuba","curaçao","delete","guadeloupe","jamaica","kitts","maarten","martinique","remove","strip out","tobago","virgin"]]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-84497715","guard":[["hasAny",["barbados","cayman","cuba","curaçao","delete","guadeloupe","jamaica","kitts","maarten","martinique","remove","strip out","tobago","virgin"]]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-bf35b8f9","guard":[["hasAny",["barbados","cayman","cuba","curaçao","delete","guadeloupe","jamaica","kitts","maarten","martinique","strip out","tobago","virgin"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-08dfaed6","guard":[["hasAny",["antigua","barbados","barthélemy","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","leading zeros","martinique","montserrat","nth","pad","pad with","padded to","position","zero pad"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",{"lit":"Caribbean"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-64bb4a3c","guard":[["hasAny",["antigua","barbados","barthélemy","cuba","curaçao","dominica","element","guadeloupe","item number","jamaica","leading zeros","martinique","montserrat","nth","pad","pad with","padded to","position","zero pad"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",{"lit":"caribbean"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-35d9834d","guard":[["hasAny",["antigua","barbados","barthélemy","cuba","curaçao","dominica","guadeloupe","jamaica","leading zeros","martinique","montserrat","pad with","padded to","zero pad"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",{"lit":"caribbean"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-655c3707","guard":[["hasAny",["antigua","barbados","barthélemy","cuba","curaçao","dominica","guadeloupe","jamaica","leading zeros","martinique","montserrat","pad with","padded to","zero pad"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",{"lit":"Caribbean"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-6b2bcd42","guard":[["hasAny",["antigua","barbados","barthélemy","cuba","curaçao","dominica","guadeloupe","jamaica","leading zeros","martinique","montserrat","pad with","padded to","zero pad"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",{"lit":"Caribbean"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-a948eb3a","guard":[["hasAny",["antigua","barbados","barthélemy","cuba","curaçao","dominica","guadeloupe","jamaica","leading zeros","martinique","montserrat","pad with","padded to","zero pad"]],["has","subregion"],["words>=",6]],"pyramid":["render.str",["transform.padStart",{"lit":"caribbean"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-d23dc729","guard":[["hasAny",["arabia","armenia","azerbaijan","bahrain","jordan","lebanon","oman","syria","türkiye"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-2b318081","guard":[["hasAny",["barbados","cuba","curaçao","delete","kitts","maarten","martinique","remove","states","strip out","tobago","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-66481f42","guard":[["hasAny",["barbados","cuba","curaçao","delete","kitts","maarten","martinique","states","strip out","tobago"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ba084d42","guard":[["hasAny",["barbados","cuba","curaçao","delete","kitts","maarten","martinique","remove","states","strip out","tobago","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-fed58e93","guard":[["hasAny",["barbados","cuba","curaçao","delete","kitts","maarten","martinique","states","strip out","tobago"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-075c6a13","guard":[["hasAny",["antigua","barthélemy","delete","dominica","grenadines","item number","kitts","montserrat","nth","position","remove","strip out","tobago"]],["has","in"],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-89de61f4","guard":[["hasAny",["antigua","barthélemy","delete","dominica","grenadines","item number","kitts","montserrat","nth","position","remove","strip out","tobago"]],["has","in"],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-fc89b51d","guard":[["hasAny",["american","characters from","element","grenadines","item number","kitts","letters from to","maarten","mariana","nth","position","slice of the text","substring","tobago","virgin"]],["has","subregion"],["has","in"]],"pyramid":["render.str",["transform.substr",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-6a32cdca","guard":[["hasAny",["arabia","armenia","azerbaijan","delete","jordan","lebanon","oman","strip out","syria"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-ba53127d","guard":[["hasAny",["arabia","armenia","azerbaijan","delete","jordan","lebanon","oman","remove","strip out","syria","without"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-c89d081f","guard":[["hasAny",["arabia","armenia","azerbaijan","delete","jordan","lebanon","oman","remove","strip out","syria"]]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-c66a4cc7","guard":[["hasAny",["cape","coast","gambia","guinea","senegal","togo"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-dbb1cec5","guard":[["hasAny",["comoros","kenya","madagascar","rwanda","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-ddc5b4b0","guard":[["hasAny",["estonia","guernsey","ireland","jan","norway","sweden"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-5e27133f","guard":[["hasAny",["change to","comoros","element","item number","kenya","madagascar","nth","position","replace","rwanda","substitute","swap","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.str",["transform.replace",{"lit":"Eastern Africa"},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-ed5a5947","guard":[["hasAny",["cape","change to","coast","element","gambia","guinea","item number","nth","position","replace","senegal","substitute","swap","togo"]],["has","subregion"]],"pyramid":["render.str",["transform.replace",{"lit":"Western Africa"},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-008df8a5","guard":[["hasAny",["comoros","delete","kenya","madagascar","rwanda","strip out","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-06d9e0b2","guard":[["hasAny",["cape","coast","delete","gambia","guinea","senegal","strip out","togo"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-45b7e55d","guard":[["hasAny",["cape","coast","gambia","guinea","senegal","separate by","split","split by","togo"]],["has","subregion"]],"pyramid":["render.list",["transform.split",{"lit":"Western Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-8086a0aa","guard":[["hasAny",["cape","coast","delete","gambia","guinea","remove","senegal","strip out","togo","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-80ce2f9c","guard":[["hasAny",["cape","coast","gambia","guinea","senegal","separate by","split by","togo"]],["has","subregion"]],"pyramid":["render.list",["transform.split",{"lit":"Western Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-c6fbc4ee","guard":[["hasAny",["comoros","kenya","madagascar","rwanda","separate by","split by","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.list",["transform.split",{"lit":"Eastern Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-2c146c7f","guard":[["hasAny",["cape","change to","coast","gambia","guinea","replace","senegal","substitute","togo"]],["has","subregion"]],"pyramid":["render.str",["transform.replace",{"lit":"Western Africa"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-81d592c3","guard":[["hasAny",["delete","kenya","madagascar","rwanda","seychelles","strip out","uganda","zimbabwe"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-8a358df3","guard":[["hasAny",["delete","kenya","madagascar","remove","rwanda","seychelles","strip out","uganda","zimbabwe"]]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-a9782da1","guard":[["hasAny",["delete","kenya","madagascar","remove","rwanda","seychelles","strip out","uganda","without","zimbabwe"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-af74519b","guard":[["hasAny",["cape","change to","coast","gambia","guinea","replace","senegal","substitute","swap","togo"]],["has","subregion"]],"pyramid":["render.str",["transform.replace",{"lit":"Western Africa"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-b0268565","guard":[["hasAny",["antigua","barbados","barthélemy","cuba","curaçao","item number","martinique","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e506618f","guard":[["hasAny",["change to","comoros","kenya","madagascar","replace","rwanda","substitute","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.str",["transform.replace",{"lit":"Eastern Africa"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-eaf269d8","guard":[["hasAny",["antigua","barbados","barthélemy","cuba","curaçao","element","item number","martinique","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9f866875","guard":[["hasAny",["cameroon","chad","congo","príncipe","sudan"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Middle Africa."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-fb276626","guard":[["hasAny",["bermuda","canada","greenland","minor","miquelon"]],["has","subregion"],["words>=",6]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-3920656f","guard":[["hasAny",["cameroon","chad","change to","congo","element","item number","nth","position","príncipe","replace","substitute","sudan","swap"]],["has","subregion"]],"pyramid":["render.str",["transform.replace",{"lit":"Middle Africa"},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-12a4706e","guard":[["hasAny",["cameroon","chad","congo","delete","príncipe","strip out","sudan"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-28d2d900","guard":[["hasAny",["cameroon","chad","congo","príncipe","separate by","split","split by","sudan"]],["has","subregion"]],"pyramid":["render.list",["transform.split",{"lit":"Middle Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-346d6bc8","guard":[["hasAny",["cameroon","chad","congo","delete","príncipe","remove","strip out","sudan","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-cce69772","guard":[["hasAny",["cameroon","chad","congo","príncipe","separate by","split by","sudan"]],["has","subregion"]],"pyramid":["render.list",["transform.split",{"lit":"Middle Africa"},["sense.lastWord"]]],"mem":null},
{"id":"n-0be86dab","guard":[["hasAny",["cameroon","chad","change to","congo","príncipe","replace","substitute","sudan"]],["has","subregion"]],"pyramid":["render.str",["transform.replace",{"lit":"Middle Africa"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-1a91a1f1","guard":[["hasAny",["arabia","azerbaijan","element","item number","jordan","nth","oman","position","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2e7b409d","guard":[["hasAny",["antigua","delete","dominica","montserrat","remove","saint","strip out"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-39bf557e","guard":[["hasAny",["guernsey","ireland","isle","jan","separate by","split by","sweden"]],["has","subregion"],["has","in"]],"pyramid":["render.lines",["transform.split",{"lit":"Northern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-41e47c74","guard":[["hasAny",["antigua","barthélemy","dominica","grenadines","leading zeros","montserrat","pad with","padded to","zero pad"]],["has","lie"]],"pyramid":["render.str",["transform.padStart",{"lit":"Caribbean"},{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-42691a2e","guard":[["hasAny",["guernsey","ireland","isle","jan","separate by","split by","sweden"]],["has","subregion"],["has","in"]],"pyramid":["render.list",["transform.split",{"lit":"Northern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-43ba3c93","guard":[["hasAny",["delete","guernsey","ireland","isle","jan","strip out","sweden"]],["has","subregion"],["has","in"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-45b88342","guard":[["hasAny",["antigua","delete","dominica","montserrat","remove","saint","strip out"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-614d5479","guard":[["hasAny",["antigua","delete","dominica","montserrat","remove","saint","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"caribbean"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-67b1db0e","guard":[["hasAny",["arabia","azerbaijan","item number","jordan","nth","oman","position","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-7803f3b3","guard":[["hasAny",["characters from","grenadines","kitts","letters from to","maarten","slice of the text","substring","tobago","virgin"]],["has","in"],["has","subregion"]],"pyramid":["render.str",["transform.substr",{"lit":"Caribbean"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-95e83eb8","guard":[["hasAny",["antigua","delete","dominica","montserrat","remove","saint","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Caribbean"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-b39b8610","guard":[["hasAny",["guernsey","ireland","isle","jan","separate by","split by","sweden"]],["has","subregion"],["has","in"]],"pyramid":["render.and",["transform.split",{"lit":"Northern Europe"},["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-d8fb10cd","guard":[["hasAny",["antigua","barthélemy","dominica","grenadines","leading zeros","montserrat","pad with","padded to","zero pad"]],["has","lie"]],"pyramid":["render.str",["transform.padStart",{"lit":"caribbean"},{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-fe2014af","guard":[["hasAny",["cameroon","chad","change to","congo","príncipe","replace","substitute","sudan","swap"]],["has","subregion"]],"pyramid":["render.str",["transform.replace",{"lit":"Middle Africa"},["sense.lastWord"],["sense.text"]]],"mem":null},
{"id":"n-641d4f92","guard":[["hasAny",["albania","bulgaria","croatia","macedonia"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-c018ea36","guard":[["hasAny",["indonesia","philippines","thailand","timorleste"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-ecbd93e4","guard":[["hasAny",["american","cook","tonga","tuvalu"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Polynesia."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-ffa9cc6d","guard":[["hasAny",["delete","guernsey","ireland","isle","item number","jan","nth","position","remove","strip out"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-3511a7b9","guard":[["hasAny",["antigua","barthélemy","dominica","item number","leading zeros","montserrat","nth","pad","pad with","padded to","position","zero pad"]],["has","in"]],"pyramid":["render.str",["transform.padStart",{"lit":"caribbean"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-45aa92c4","guard":[["hasAny",["azerbaijan","change to","element","item number","jordan","nth","oman","position","replace","substitute","swap","syria"]],["has","world"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"Western Asia"}]],"mem":null},
{"id":"n-9a88d4b8","guard":[["hasAny",["antigua","barthélemy","dominica","item number","leading zeros","montserrat","nth","pad","pad with","padded to","position","zero pad"]],["has","in"]],"pyramid":["render.str",["transform.padStart",{"lit":"Caribbean"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-bb06dc21","guard":[["hasAny",["azerbaijan","change to","element","item number","jordan","nth","oman","position","replace","substitute","swap","syria"]],["has","world"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Western Asia"}]],"mem":null},
{"id":"n-e85a4e97","guard":[["hasAny",["american","cook","element","item number","leading zeros","nth","pad","pad with","padded to","position","tonga","tuvalu","zero pad"]],["has","subregion"]],"pyramid":["render.str",["transform.padStart",{"lit":"Polynesia"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}]]],"mem":null},
{"id":"n-a5e38d64","guard":[["hasAny",["azerbaijan","jordan","oman","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["sense.lastWord"]],"mem":null},
{"id":"n-2d970e7d","guard":[["hasAny",["azerbaijan","jordan","lower case","lowercase","oman","small letters","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-368b2d72","guard":[["hasAny",["all caps","azerbaijan","capital letters","capitals","jordan","oman","syria","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-8d886fdd","guard":[["hasAny",["azerbaijan","capitalise","capitalize","capitalize each word","jordan","oman","syria","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-a8c9deea","guard":[["hasAny",["azerbaijan","invert case","jordan","oman","swap case","syria","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f84c104c","guard":[["hasAny",["azerbaijan","jordan","oman","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-03f2289a","guard":[["hasAny",["american","cook","leading zeros","pad with","padded to","tonga","tuvalu","zero pad"]],["has","subregion"]],"pyramid":["render.str",["transform.padStart",{"lit":"Polynesia"},["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-0b510f53","guard":[["hasAny",["cameroon","chad","congo","delete","strip out","sudan"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-27f995be","guard":[["hasAny",["delete","indonesia","philippines","strip out","thailand","timorleste"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"South-Eastern Asia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-2b29098a","guard":[["hasAny",["azerbaijan","each word","jordan","oman","split into words","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2bc14a72","guard":[["hasAny",["cape","delete","guinea","remove","senegal","strip out","togo","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-3b85214c","guard":[["hasAny",["cape","delete","guinea","remove","senegal","strip out","togo"]]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-42b98539","guard":[["hasAny",["cameroon","chad","congo","delete","remove","strip out","sudan","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-579500ee","guard":[["hasAny",["cape","delete","guinea","senegal","strip out","togo"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-628fc578","guard":[["hasAny",["delete","estonia","jan","norway","remove","strip out","sweden"]]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-69cd74d3","guard":[["hasAny",["delete","estonia","jan","norway","strip out","sweden"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-736cf4c3","guard":[["hasAny",["cameroon","chad","congo","delete","remove","strip out","sudan"]]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-9fcf0076","guard":[["hasAny",["azerbaijan","each word","jordan","oman","split into words","syria"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-bee4dd62","guard":[["hasAny",["delete","indonesia","philippines","remove","strip out","thailand","timorleste"]]],"pyramid":["render.str",["transform.remove",{"lit":"South-Eastern Asia"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-e8cb779f","guard":[["hasAny",["american","cook","leading zeros","pad with","padded to","tonga","tuvalu","zero pad"]],["has","subregion"]],"pyramid":["render.str",["transform.padStart",{"lit":"Polynesia"},["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-332d46af","guard":[["hasAny",["luxembourg","monaco","switzerland"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-b3802010","guard":[["hasAny",["malta","portugal","spain"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-c613847b","guard":[["hasAny",["kiribati","mariana","marshall"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Micronesia."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-d8009037","guard":[["hasAny",["belize","guatemala","nicaragua"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-dcaf23a4","guard":[["hasAny",["afghanistan","maldives","nepal"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-49e4ed23","guard":[["hasAny",["delete","greenland","item number","minor","miquelon","nth","position","remove","strip out"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-76747e3e","guard":[["hasAny",["change to","element","item number","kenya","nth","position","replace","rwanda","seychelles","substitute","swap"]],["has","world"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Eastern Africa"}]],"mem":null},
{"id":"n-d3c4b5ee","guard":[["hasAny",["change to","element","item number","kenya","nth","position","replace","rwanda","seychelles","substitute","swap"]],["has","world"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"Eastern Africa"}]],"mem":null},
{"id":"n-24c23719","guard":[["hasAny",["kenya","rwanda","seychelles"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-2c977eb6","guard":[["hasAny",["cayman","guadeloupe","jamaica"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["sense.lastWord"]],"mem":null},
{"id":"n-ac834888","guard":[["hasAny",["cape","guinea","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-335cda44","guard":[["hasAny",["cape","guinea","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-3cea8bf7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","kenya","rwanda","seychelles","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4b79931e","guard":[["hasAny",["cayman","guadeloupe","invert case","jamaica","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-4ee39422","guard":[["hasAny",["kenya","rwanda","seychelles"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-4fde339d","guard":[["hasAny",["cape","guinea","invert case","swap case","toggle case","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5eddaaf7","guard":[["hasAny",["all caps","capital letters","capitals","kenya","rwanda","seychelles","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-6811166d","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cayman","guadeloupe","jamaica","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-686b6ac6","guard":[["hasAny",["cape","guinea","lower case","lowercase","small letters","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-90bf5612","guard":[["hasAny",["cape","capitalise","capitalize","capitalize each word","guinea","title case","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9e422fbc","guard":[["hasAny",["all caps","cape","capital letters","capitals","guinea","togo","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a44320b3","guard":[["hasAny",["kenya","lower case","lowercase","rwanda","seychelles","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a9467ed7","guard":[["hasAny",["cayman","guadeloupe","jamaica"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-d5eb64aa","guard":[["hasAny",["invert case","kenya","rwanda","seychelles","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-eda17631","guard":[["hasAny",["all caps","capital letters","capitals","cayman","guadeloupe","jamaica","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f591c1bd","guard":[["hasAny",["cayman","guadeloupe","jamaica","lower case","lowercase","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-039f489d","guard":[["hasAny",["bermuda","canada","delete","miquelon","strip out"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-05d90c7f","guard":[["hasAny",["delete","madagascar","strip out","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-16aeffe1","guard":[["hasAny",["cameroon","chad","congo","delete","remove","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-18f456ad","guard":[["hasAny",["bermuda","canada","delete","miquelon","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-23abffa8","guard":[["hasAny",["cameroon","chad","congo","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2d37504f","guard":[["hasAny",["each word","kenya","rwanda","seychelles","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2e1fee57","guard":[["hasAny",["item number","kenya","nth","position","rwanda","seychelles"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-39e0745e","guard":[["hasAny",["american","delete","pitcairn","remove","strip out","tonga"]]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-43970911","guard":[["hasAny",["cayman","each word","guadeloupe","jamaica","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4cd7ffc4","guard":[["hasAny",["delete","guernsey","ireland","isle","remove","strip out"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-57ac913c","guard":[["hasAny",["arabia","armenia","delete","lebanon","strip out"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-740d64f4","guard":[["hasAny",["american","delete","pitcairn","strip out","tonga"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-7d2f70ac","guard":[["hasAny",["cameroon","chad","congo","delete","strip out"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-81c32dde","guard":[["hasAny",["cameroon","chad","congo","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9088c545","guard":[["hasAny",["delete","madagascar","remove","strip out","uganda","without","zimbabwe"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-94660172","guard":[["hasAny",["item number","madagascar","nth","position","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b49beb1e","guard":[["hasAny",["cape","each word","guinea","split into words","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b77d478b","guard":[["hasAny",["each word","kenya","rwanda","seychelles","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c531eec9","guard":[["hasAny",["element","item number","kenya","nth","position","rwanda","seychelles"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c7127e22","guard":[["hasAny",["delete","guernsey","ireland","isle","remove","strip out","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-d2803a38","guard":[["hasAny",["arabia","armenia","delete","lebanon","remove","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-d905e161","guard":[["hasAny",["element","item number","madagascar","nth","position","uganda","zimbabwe"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-db8b3f1d","guard":[["hasAny",["cayman","each word","guadeloupe","jamaica","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f94c1b66","guard":[["hasAny",["cape","each word","guinea","split into words","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8ff4dd97","guard":[["hasAny",["cayman","item number","maarten","normalise","normalize","nth","position","simplify the text","tobago"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-d5cd1554","guard":[["hasAny",["cayman","element","item number","maarten","normalise","normalize","nth","position","simplify the text","tobago"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-010ebbda","guard":[["hasAny",["kazakhstan","kyrgyzstan"]],["has","in"],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central Asia."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-0d62e328","guard":[["hasAny",["africa","namibia"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-b1382a83","guard":[["hasAny",["brazil","chile"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South America."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-b4debdc4","guard":[["hasAny",["belarus","ukraine"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-5a2df896","guard":[["hasAny",["brazil","delete","guyana","item number","nth","position","remove","strip out"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-7398ae83","guard":[["hasAny",["coast","delete","gambia","item number","nth","position","remove","strip out"]],["has","in"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-b22b8a48","guard":[["hasAny",["cook","delete","item number","nth","position","remove","strip out","tuvalu"]],["has","in"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-cf34176b","guard":[["hasAny",["bahrain","delete","item number","nth","position","remove","strip out","türkiye"]],["has","in"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-03c7289e","guard":[["hasAny",["change to","element","guadeloupe","item number","jamaica","nth","position","replace","substitute","swap"]],["has","world"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"Caribbean"}]],"mem":null},
{"id":"n-343e5e17","guard":[["hasAny",["change to","element","estonia","item number","norway","nth","position","replace","substitute","swap"]],["has","world"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"Northern Europe"}]],"mem":null},
{"id":"n-37360791","guard":[["hasAny",["change to","element","guadeloupe","item number","jamaica","nth","position","replace","substitute","swap"]],["has","world"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Caribbean"}]],"mem":null},
{"id":"n-45fc9b03","guard":[["hasAny",["change to","chile","element","item number","nth","position","replace","substitute","swap","venezuela"]],["has","world"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"South America"}]],"mem":null},
{"id":"n-49a355bd","guard":[["hasAny",["change to","element","indonesia","item number","nth","position","replace","substitute","swap","thailand"]],["has","world"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"South-Eastern Asia"}]],"mem":null},
{"id":"n-58517fd9","guard":[["hasAny",["change to","element","guadeloupe","item number","jamaica","nth","position","replace","substitute","swap"]],["has","world"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"caribbean"}]],"mem":null},
{"id":"n-62d5c05d","guard":[["hasAny",["cook","item number","leading zeros","nth","pad","pad with","padded to","position","tuvalu","zero pad"]],["has","in"]],"pyramid":["render.str",["transform.padStart",{"lit":"Polynesia"},["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-6411ba56","guard":[["hasAny",["change to","element","guadeloupe","item number","jamaica","nth","position","replace","substitute","swap"]],["has","world"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"caribbean"}]],"mem":null},
{"id":"n-70e9b5b7","guard":[["hasAny",["change to","element","indonesia","item number","nth","position","replace","substitute","swap","thailand"]],["has","world"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"South-Eastern Asia"}]],"mem":null},
{"id":"n-9c3afdfd","guard":[["hasAny",["change to","element","estonia","item number","norway","nth","position","replace","substitute","swap"]],["has","world"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Northern Europe"}]],"mem":null},
{"id":"n-b5526747","guard":[["hasAny",["change to","element","guinea","item number","nth","position","replace","substitute","swap","togo"]],["has","world"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"Western Africa"}]],"mem":null},
{"id":"n-d2ad6815","guard":[["hasAny",["change to","element","guinea","item number","nth","position","replace","substitute","swap","togo"]],["has","world"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"Western Africa"}]],"mem":null},
{"id":"n-f64e4f38","guard":[["hasAny",["change to","chile","element","item number","nth","position","replace","substitute","swap","venezuela"]],["has","world"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"South America"}]],"mem":null},
{"id":"n-eb693818","guard":[["hasAny",["item number","luxembourg","monaco","nth","position"]],["has","in"]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"alpha-3 code"},{"lit":"subregion"}]],"mem":null},
{"id":"n-08631347","guard":[["hasAny",["invert case","item number","luxembourg","monaco","nth","position","swap case","toggle case"]],["has","in"]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"alpha-3 code"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-32395b3c","guard":[["hasAny",["item number","lower case","lowercase","luxembourg","monaco","nth","position","small letters"]],["has","in"]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"alpha-3 code"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-a5d44f8c","guard":[["hasAny",["all caps","capital letters","capitals","item number","luxembourg","monaco","nth","position","upper case","uppercase"]],["has","in"]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"alpha-3 code"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-33bc22e9","guard":[["hasAny",["delete","item number","luxembourg","monaco","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"alpha-3 code"},{"lit":"subregion"}],["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-eaf43f31","guard":[["hasAny",["element","item number","luxembourg","monaco","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"alpha-3 code"},{"lit":"subregion"}]],"mem":null},
{"id":"n-1b8ab9ec","guard":[["hasAny",["element","invert case","item number","luxembourg","monaco","nth","position","swap case","toggle case"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"alpha-3 code"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-26311dd0","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","luxembourg","monaco","nth","position","upper case","uppercase"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"alpha-3 code"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-b0d8d895","guard":[["hasAny",["element","item number","lower case","lowercase","luxembourg","monaco","nth","position","small letters"]],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"alpha-3 code"},{"lit":"subregion"}]]],"mem":null},
{"id":"n-32785e72","guard":[["hasAny",["estonia","norway"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-5fd19561","guard":[["hasAny",["albania","macedonia"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-c25f5100","guard":[["hasAny",["indonesia","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["sense.lastWord"]],"mem":null},
{"id":"n-d9ca59ea","guard":[["hasAny",["africa","namibia"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-017393ac","guard":[["hasAny",["estonia","invert case","norway","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1ddeeeb4","guard":[["hasAny",["longest","longest one","longest word","madagascar","seychelles"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Africa."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-27d45c28","guard":[["hasAny",["indonesia","lower case","lowercase","small letters","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-2edcfedd","guard":[["hasAny",["africa","capitalise","capitalize","capitalize each word","namibia","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-429abcc6","guard":[["hasAny",["estonia","lower case","lowercase","norway","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-52fbed77","guard":[["hasAny",["albania","capitalise","capitalize","capitalize each word","macedonia","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-6375e2aa","guard":[["hasAny",["albania","macedonia"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-642e702f","guard":[["hasAny",["estonia","norway"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-6902e0e1","guard":[["hasAny",["africa","lower case","lowercase","namibia","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-79073785","guard":[["hasAny",["albania","invert case","macedonia","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8608d07f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","estonia","norway","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9974d89c","guard":[["hasAny",["all caps","capital letters","capitals","indonesia","thailand","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-b43332bf","guard":[["hasAny",["indonesia","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-b891d2b6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","indonesia","thailand","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-bdd74ac3","guard":[["hasAny",["albania","lower case","lowercase","macedonia","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-be4e16d0","guard":[["hasAny",["all caps","capital letters","capitals","estonia","norway","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-c6530a2d","guard":[["hasAny",["africa","invert case","namibia","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e846fbb9","guard":[["hasAny",["albania","all caps","capital letters","capitals","macedonia","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f5d1918c","guard":[["hasAny",["africa","all caps","capital letters","capitals","namibia","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-f8f4a773","guard":[["hasAny",["africa","namibia"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-fa6cca51","guard":[["hasAny",["indonesia","invert case","swap case","thailand","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-003c17a3","guard":[["hasAny",["delete","jan","remove","strip out","sweden","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-015c8f80","guard":[["hasAny",["cook","leading zeros","pad with","padded to","tuvalu","zero pad"]],["has","subregion"]],"pyramid":["render.str",["transform.padStart",{"lit":"Polynesia"},{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-017c192c","guard":[["hasAny",["canada","delete","miquelon","remove","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-0397b26b","guard":[["hasAny",["bulgaria","croatia","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-04652d1d","guard":[["hasAny",["american","delete","remove","strip out","tonga","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-085b8507","guard":[["hasAny",["armenia","item number","lebanon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0cf85347","guard":[["hasAny",["american","delete","strip out","tonga"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-10186eb0","guard":[["hasAny",["cook","delete","remove","strip out","tuvalu"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-124d5924","guard":[["hasAny",["guernsey","ireland","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-19283ff3","guard":[["hasAny",["chile","delete","strip out","venezuela"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-1e14b7fa","guard":[["hasAny",["armenia","element","item number","lebanon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1fac0741","guard":[["hasAny",["item number","nth","philippines","position","timorleste"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-24a129d2","guard":[["hasAny",["element","indonesia","item number","nth","position","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2f3f13f9","guard":[["hasAny",["cook","delete","remove","strip out","tuvalu","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"Polynesia"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-36266620","guard":[["hasAny",["belize","guatemala","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3ad4c1d1","guard":[["hasAny",["chile","delete","remove","strip out","venezuela"]]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"world"}]]],"mem":null},
{"id":"n-3c670fdf","guard":[["hasAny",["element","guinea","item number","nth","position","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-49ee7612","guard":[["hasAny",["albania","each word","macedonia","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4a767d41","guard":[["hasAny",["bulgaria","croatia","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4ae5a1c8","guard":[["hasAny",["each word","indonesia","split into words","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4e227936","guard":[["hasAny",["each word","indonesia","split into words","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4fbcf8b1","guard":[["hasAny",["item number","luxembourg","monaco","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-4fc72b64","guard":[["hasAny",["element","estonia","item number","norway","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-529a419c","guard":[["hasAny",["africa","each word","namibia","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-550f007c","guard":[["hasAny",["delete","jan","strip out","sweden"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Northern Europe"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-5bd7776b","guard":[["hasAny",["dominica","element","item number","montserrat","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5dbbd046","guard":[["hasAny",["estonia","item number","norway","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-617d4330","guard":[["hasAny",["cook","item number","nth","position","tonga"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-716a3e20","guard":[["hasAny",["each word","estonia","norway","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8380e1d7","guard":[["hasAny",["element","item number","luxembourg","monaco","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8766acfe","guard":[["hasAny",["guernsey","ireland","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-879c6c1b","guard":[["hasAny",["each word","estonia","norway","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Europe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-8a9afc38","guard":[["hasAny",["coast","element","item number","nth","position","senegal"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9092d38e","guard":[["hasAny",["coast","item number","nth","position","senegal"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-93d67ad2","guard":[["hasAny",["dominica","item number","montserrat","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-96e9573a","guard":[["hasAny",["bahrain","item number","nth","position","türkiye"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-9715b697","guard":[["hasAny",["belize","element","guatemala","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-99731515","guard":[["hasAny",["delete","greenland","minor","remove","strip out"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-a4d6c875","guard":[["hasAny",["africa","each word","namibia","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a689759c","guard":[["hasAny",["dominica","element","item number","montserrat","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ac3e1ae4","guard":[["hasAny",["delete","philippines","strip out","timorleste"]],["has","world"]],"pyramid":["render.str",["transform.remove",{"lit":"South-Eastern Asia"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b24fc3c2","guard":[["hasAny",["bahrain","element","item number","nth","position","türkiye"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b69d5c62","guard":[["hasAny",["bahrain","element","item number","nth","position","türkiye"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-bae036df","guard":[["hasAny",["element","item number","luxembourg","monaco","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bbef1ff4","guard":[["hasAny",["item number","luxembourg","monaco","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-bd481fa4","guard":[["hasAny",["bahrain","delete","remove","strip out","türkiye"]]],"pyramid":["render.str",["transform.remove",{"lit":"Western Asia"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-c2f23e87","guard":[["hasAny",["coast","delete","gambia","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-c5005a07","guard":[["hasAny",["cook","element","item number","nth","position","tonga"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c9555568","guard":[["hasAny",["delete","greenland","minor","remove","strip out","without"]],["has","what"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-ce0f3797","guard":[["hasAny",["bahrain","item number","nth","position","türkiye"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-d7f96dfd","guard":[["hasAny",["albania","each word","macedonia","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e67d8f54","guard":[["hasAny",["element","item number","nth","philippines","position","timorleste"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-eb75bb7f","guard":[["hasAny",["canada","delete","miquelon","strip out"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"North America"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ec4e6a9c","guard":[["hasAny",["indonesia","item number","nth","position","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in South-Eastern Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f388cea0","guard":[["hasAny",["guinea","item number","nth","position","togo"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-f3d59d80","guard":[["hasAny",["brazil","delete","guyana","remove","strip out"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"South America"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-f7fec1d3","guard":[["hasAny",["dominica","item number","montserrat","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-21af3b2d","guard":[["has","new"],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Australia and New Zealand."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-3c565d59","guard":[["has","hong"],["has","in"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Asia."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-87f615d6","guard":[["has","sahara"],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["render.list",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}]]],"mem":null},
{"id":"n-3ada5b42","guard":[["hasAny",["comoros","delete","item number","nth","position","remove","strip out"]],["has","in"]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-6c511a0d","guard":[["hasAny",["delete","item number","nth","position","príncipe","remove","strip out"]],["has","in"]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"alpha-3 code"}],{"lit":1}]]],"mem":null},
{"id":"n-05f02d4d","guard":[["hasAny",["bermuda","change to","element","item number","nth","position","replace","substitute","swap"]],["has","world"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"North America"}]],"mem":null},
{"id":"n-d1d4452a","guard":[["hasAny",["bermuda","change to","element","item number","nth","position","replace","substitute","swap"]],["has","world"]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],["sense.lastWord"],{"lit":"North America"}]],"mem":null},
{"id":"n-0107f9cc","guard":[["hasAny",["element","guinea","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Guinea is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-04394eba","guard":[["hasAny",["element","item number","nepal","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Nepal is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-0665c372","guard":[["hasAny",["element","item number","jordan","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Jordan is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-07abbfa9","guard":[["hasAny",["element","item number","nth","position","spain"]],["has","in"]],"pyramid":["render.template",{"lit":["Spain is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-07d2cbf7","guard":[["hasAny",["element","guadeloupe","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Guadeloupe is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-0a5e443b","guard":[["hasAny",["element","item number","kiribati","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Kiribati is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-0f255d9c","guard":[["hasAny",["element","item number","nth","position","togo"]],["has","world"]],"pyramid":["render.template",{"lit":["Togo is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-116953ff","guard":[["hasAny",["element","estonia","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Estonia is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-11770bda","guard":[["hasAny",["coast","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Ivory Coast is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-166a99d8","guard":[["hasAny",["congo","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Congo is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-16a2b66e","guard":[["hasAny",["element","item number","nth","position","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":["Ukraine is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-16d5c02d","guard":[["hasAny",["element","item number","nth","position","sweden"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Sweden is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-1ef7b91b","guard":[["hasAny",["bahrain","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Bahrain is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-226537eb","guard":[["hasAny",["chad","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Chad is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-2285449c","guard":[["hasAny",["belarus","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Belarus is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-22b35037","guard":[["hasAny",["cook","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Cook Islands is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-24ed2e2b","guard":[["hasAny",["element","item number","nth","position","russia"]],["has","lie"]],"pyramid":["render.template",{"lit":["Russia is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-25aacbd0","guard":[["hasAny",["cayman","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Cayman Islands is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-28123e3c","guard":[["hasAny",["element","greenland","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Greenland is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-2f4ecf94","guard":[["hasAny",["element","item number","jamaica","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Jamaica is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-37d51692","guard":[["hasAny",["croatia","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Croatia is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-3b83ec95","guard":[["hasAny",["comoros","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Comoros is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-3c1d04b1","guard":[["hasAny",["dominica","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Dominica is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-3dd42c67","guard":[["hasAny",["armenia","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Armenia is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-40a3e882","guard":[["hasAny",["element","gambia","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Gambia is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-48e495f1","guard":[["hasAny",["element","item number","nth","position","uganda"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Uganda is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-48ed9e5b","guard":[["hasAny",["element","item number","nth","portugal","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Portugal is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-49e38941","guard":[["hasAny",["element","guernsey","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Guernsey is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-4a89c88c","guard":[["hasAny",["cape","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Cape Verde is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-4c1b37a6","guard":[["hasAny",["azerbaijan","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Azerbaijan is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-4db1b5d6","guard":[["hasAny",["element","item number","minor","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["United States Minor Outlying Islands is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-52d0eeb5","guard":[["hasAny",["element","indonesia","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Indonesia is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-55610a29","guard":[["hasAny",["element","item number","maldives","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Maldives is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-584bb3de","guard":[["hasAny",["element","item number","nth","position","sudan"]],["has","world"]],"pyramid":["render.template",{"lit":["South Sudan is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-59d880ff","guard":[["hasAny",["element","item number","kyrgyzstan","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Kyrgyzstan is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-59f4473c","guard":[["hasAny",["element","item number","norway","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Norway is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-5a57e6b2","guard":[["hasAny",["element","item number","nth","philippines","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Philippines is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-5ced7635","guard":[["hasAny",["element","item number","madagascar","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Madagascar is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-5f8a97d8","guard":[["hasAny",["bulgaria","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Bulgaria is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-68b5c5b9","guard":[["hasAny",["element","item number","kenya","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Kenya is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-6bed0633","guard":[["hasAny",["element","item number","nth","pitcairn","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Pitcairn Islands is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-6e9ff9a6","guard":[["hasAny",["american","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["American Samoa is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-748d4f42","guard":[["hasAny",["barthélemy","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Saint Barthélemy is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-75accf00","guard":[["hasAny",["element","item number","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Trinidad and Tobago is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-7685428f","guard":[["hasAny",["element","item number","macedonia","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["North Macedonia is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-76c85043","guard":[["hasAny",["albania","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Albania is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-77973e51","guard":[["hasAny",["element","item number","nth","position","zimbabwe"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Zimbabwe is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-7a34408c","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saint Pierre and Miquelon is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-7aa86d21","guard":[["hasAny",["element","item number","monaco","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Monaco is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-7d085c58","guard":[["hasAny",["element","item number","marshall","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Marshall Islands is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-7db78e47","guard":[["hasAny",["element","item number","namibia","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Namibia is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-7dbb82e5","guard":[["hasAny",["element","item number","nth","position","rwanda"]],["has","world"]],"pyramid":["render.template",{"lit":["Rwanda is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-8211a54d","guard":[["hasAny",["element","ireland","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Ireland is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-8498acc1","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Northern Mariana Islands is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-858faeeb","guard":[["hasAny",["element","guatemala","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Guatemala is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-87798633","guard":[["hasAny",["cuba","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Cuba is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-88daf079","guard":[["hasAny",["element","item number","martinique","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Martinique is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-8a9be237","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saint Kitts and Nevis is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-8b64c9fa","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saudi Arabia is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-901b4e71","guard":[["hasAny",["canada","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Canada is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-9042579d","guard":[["hasAny",["element","item number","nth","oman","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Oman is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-91988594","guard":[["hasAny",["element","item number","malta","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Malta is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-922c2440","guard":[["hasAny",["element","item number","nth","position","venezuela"]],["has","world"]],"pyramid":["render.template",{"lit":["Venezuela is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-9ac7eef6","guard":[["hasAny",["element","item number","nth","position","thailand"]],["has","world"]],"pyramid":["render.template",{"lit":["Thailand is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-9d14d624","guard":[["hasAny",["element","item number","nth","position","türkiye"]],["has","in"]],"pyramid":["render.template",{"lit":["Türkiye is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-9db5eb42","guard":[["hasAny",["element","item number","netherlands","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Netherlands is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-9f19afb5","guard":[["hasAny",["egypt","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Egypt is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-a2765272","guard":[["hasAny",["barbados","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Barbados is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-a3ba74d8","guard":[["hasAny",["element","hong","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Hong Kong is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-a4bfd430","guard":[["hasAny",["element","item number","lebanon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Lebanon is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-a876c6c0","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Svalbard and Jan Mayen is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-b4499390","guard":[["hasAny",["cameroon","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Cameroon is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-c2b9865d","guard":[["hasAny",["africa","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["South Africa is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-c5563cae","guard":[["hasAny",["element","item number","luxembourg","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Luxembourg is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-c719a6ec","guard":[["hasAny",["element","item number","nth","position","syria"]],["has","world"]],"pyramid":["render.template",{"lit":["Syria is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-ca75dc22","guard":[["hasAny",["chile","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Chile is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-d099a35b","guard":[["hasAny",["afghanistan","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Afghanistan is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-d15bd25b","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":["United States Virgin Islands is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-d2621103","guard":[["hasAny",["element","item number","nth","position","tonga"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Tonga is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-d90e33d3","guard":[["hasAny",["element","item number","nth","position","senegal"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Senegal is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-d9846492","guard":[["hasAny",["element","item number","kazakhstan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Kazakhstan is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-db9f8073","guard":[["hasAny",["element","item number","montserrat","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Montserrat is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-dd453308","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Western Sahara is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-de340875","guard":[["hasAny",["element","item number","nth","position","seychelles"]],["has","world"]],"pyramid":["render.template",{"lit":["Seychelles is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-e30b0143","guard":[["hasAny",["bermuda","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Bermuda is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-e32658e7","guard":[["hasAny",["belize","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Belize is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-e6dfdbe1","guard":[["hasAny",["element","isle","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Isle of Man is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-ea046561","guard":[["hasAny",["element","item number","nth","position","timorleste"]],["has","world"]],"pyramid":["render.template",{"lit":["Timor-Leste is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-ead09f35","guard":[["hasAny",["element","item number","nicaragua","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Nicaragua is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-f2aa7830","guard":[["hasAny",["brazil","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Brazil is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-f4d44133","guard":[["hasAny",["element","item number","maarten","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":["Sint Maarten is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-f672ec21","guard":[["hasAny",["curaçao","element","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Curaçao is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-f696a13f","guard":[["hasAny",["antigua","element","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Antigua and Barbuda is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-f947f489","guard":[["hasAny",["element","item number","nth","position","tuvalu"]],["has","in"]],"pyramid":["render.template",{"lit":["Tuvalu is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-fb3d6bdb","guard":[["hasAny",["element","item number","new","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["New Zealand is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-fc5feb20","guard":[["hasAny",["element","item number","nth","position","switzerland"]],["has","world"]],"pyramid":["render.template",{"lit":["Switzerland is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-fd4187fe","guard":[["hasAny",["element","grenadines","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Saint Vincent and the Grenadines is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-fd4c6b57","guard":[["hasAny",["element","guyana","item number","nth","position"]],["has","in"]],"pyramid":["render.template",{"lit":["Guyana is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-ff976457","guard":[["hasAny",["element","item number","nth","position","príncipe"]],["has","in"]],"pyramid":["render.template",{"lit":["São Tomé and Príncipe is in ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mledoze-countries"},{"lit":"country"}],{"lit":1}],{"lit":"mledoze-countries"},{"lit":"country"},{"lit":"subregion"}]],"mem":null},
{"id":"n-0084af33","guard":[["hasAny",["afghanistan","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-034f49a5","guard":[["hasAny",["brazil","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Brazil lie":"Brazil is in South America."}}},
{"id":"n-0526f222","guard":[["hasAny",["philippines","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Philippines in":"Philippines is in South-Eastern Asia."}}},
{"id":"n-0563efda","guard":[["hasAny",["name","namibia","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Namibia":"Namibia is in Southern Africa."}}},
{"id":"n-0d887eb2","guard":[["hasAny",["cameroon","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Cameroon in":"Cameroon is in Middle Africa."}}},
{"id":"n-139d6912","guard":[["hasAny",["macedonia","name","north","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of North Macedonia":"North Macedonia is in Southeast Europe."}}},
{"id":"n-1bb307a8","guard":[["hasAny",["arabia","saudi","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saudi Arabia in":"Saudi Arabia is in Western Asia."}}},
{"id":"n-1dfe3d49","guard":[["has","nicaragua"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["sense.lastWord"]],"mem":null},
{"id":"n-21b3af82","guard":[["has","cape"],["has","world"]],"pyramid":["render.template",{"lit":["Cape ",{"slot":0}," is in Western Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-2293bdc3","guard":[["hasAny",["guatemala","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Guatemala in":"Guatemala is in Central America."}}},
{"id":"n-231c42ee","guard":[["hasAny",["curaçao","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Curaçao in":"Curaçao is in Caribbean."}}},
{"id":"n-28342ed1","guard":[["hasAny",["name","subregion","togo","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Togo":"Togo is in Western Africa."}}},
{"id":"n-2b012fce","guard":[["hasAny",["lie","sahara","subregion","western"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Western Sahara lie":"Western Sahara is in Northern Africa."}}},
{"id":"n-2c8c7d04","guard":[["hasAny",["jan","mayen","subregion","svalbard","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe."}}},
{"id":"n-2fa6825e","guard":[["hasAny",["name","south","subregion","sudan","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of South Sudan":"South Sudan is in Middle Africa."}}},
{"id":"n-2fade616","guard":[["hasAny",["gambia","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Gambia lie":"Gambia is in Western Africa."}}},
{"id":"n-318460ed","guard":[["hasAny",["lebanon","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Lebanon in":"Lebanon is in Western Asia."}}},
{"id":"n-31bd5fad","guard":[["hasAny",["lie","monaco","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Monaco lie":"Monaco is in Western Europe."}}},
{"id":"n-31db5f2f","guard":[["hasAny",["name","nicaragua","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Nicaragua":"Nicaragua is in Central America."}}},
{"id":"n-34d49636","guard":[["hasAny",["martinique","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Martinique in":"Martinique is in Caribbean."}}},
{"id":"n-35b24caa","guard":[["hasAny",["estonia","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Estonia":"Estonia is in Northern Europe."}}},
{"id":"n-39407c61","guard":[["hasAny",["subregion","world","zimbabwe"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Zimbabwe in":"Zimbabwe is in Eastern Africa."}}},
{"id":"n-3a11cbc5","guard":[["hasAny",["islands","mariana","northern","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Northern Mariana Islands in":"Northern Mariana Islands is in Micronesia."}}},
{"id":"n-3b038bc6","guard":[["hasAny",["lie","new","subregion","zealand"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does New Zealand lie":"New Zealand is in Australia and New Zealand."}}},
{"id":"n-3c13042e","guard":[["hasAny",["belize","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Belize in":"Belize is in Central America."}}},
{"id":"n-3d018d3e","guard":[["hasAny",["lie","nepal","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Nepal lie":"Nepal is in Southern Asia."}}},
{"id":"n-3d8d45d9","guard":[["hasAny",["cayman","islands","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Cayman Islands":"Cayman Islands is in Caribbean."}}},
{"id":"n-3ec66174","guard":[["has","cayman"],["has","world"]],"pyramid":["render.template",{"lit":["Cayman ",{"slot":0}," is in Caribbean."]},["sense.lastWord"]],"mem":null},
{"id":"n-41a4544a","guard":[["hasAny",["belarus","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Belarus in":"Belarus is in Eastern Europe."}}},
{"id":"n-43548ab2","guard":[["hasAny",["lie","russia","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Russia lie":"Russia is in Eastern Europe."}}},
{"id":"n-43c8a69c","guard":[["hasAny",["subregion","timorleste","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Timor-Leste in":"Timor-Leste is in South-Eastern Asia."}}},
{"id":"n-43ff7606","guard":[["hasAny",["albania","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Albania":"Albania is in Southeast Europe."}}},
{"id":"n-46510ee1","guard":[["has","ukraine"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-47895e34","guard":[["hasAny",["subregion","tonga","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Tonga in":"Tonga is in Polynesia."}}},
{"id":"n-4894144d","guard":[["hasAny",["indonesia","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Indonesia":"Indonesia is in South-Eastern Asia."}}},
{"id":"n-4af473be","guard":[["hasAny",["islands","name","pitcairn","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Pitcairn Islands":"Pitcairn Islands is in Polynesia."}}},
{"id":"n-4e552532","guard":[["hasAny",["africa","name","south","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of South Africa":"South Africa is in Southern Africa."}}},
{"id":"n-4ef7b24e","guard":[["hasAny",["name","subregion","syria","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Syria":"Syria is in Western Asia."}}},
{"id":"n-5741871e","guard":[["hasAny",["isle","lie","man","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Isle of Man lie":"Isle of Man is in Northern Europe."}}},
{"id":"n-591c0ccc","guard":[["hasAny",["name","states","subregion","united","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of United States":"United States is in North America."}}},
{"id":"n-60566894","guard":[["hasAny",["name","portugal","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Portugal":"Portugal is in Southern Europe."}}},
{"id":"n-675fb439","guard":[["hasAny",["lie","spain","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Spain lie":"Spain is in Southern Europe."}}},
{"id":"n-6c5685d4","guard":[["hasAny",["cook","islands","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Cook Islands lie":"Cook Islands is in Polynesia."}}},
{"id":"n-6cca66f8","guard":[["has","pitcairn"],["has","world"]],"pyramid":["render.template",{"lit":["Pitcairn ",{"slot":0}," is in Polynesia."]},["sense.lastWord"]],"mem":null},
{"id":"n-6e0a9236","guard":[["hasAny",["lie","montserrat","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Montserrat lie":"Montserrat is in Caribbean."}}},
{"id":"n-6e592fa1","guard":[["hasAny",["azerbaijan","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Azerbaijan":"Azerbaijan is in Western Asia."}}},
{"id":"n-7052afb7","guard":[["hasAny",["canada","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Canada in":"Canada is in North America."}}},
{"id":"n-707c9c3b","guard":[["hasAny",["chile","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Chile":"Chile is in South America."}}},
{"id":"n-71fe5b74","guard":[["hasAny",["kenya","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Kenya":"Kenya is in Eastern Africa."}}},
{"id":"n-73a53c89","guard":[["has","egypt"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-751fef00","guard":[["hasAny",["kitts","nevis","saint","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean."}}},
{"id":"n-7875a486","guard":[["hasAny",["kazakhstan","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Kazakhstan in":"Kazakhstan is in Central Asia."}}},
{"id":"n-793bf509","guard":[["hasAny",["barbados","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Barbados in":"Barbados is in Caribbean."}}},
{"id":"n-7a6312d0","guard":[["hasAny",["miquelon","pierre","saint","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America."}}},
{"id":"n-7cf10df2","guard":[["hasAny",["greenland","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Greenland lie":"Greenland is in North America."}}},
{"id":"n-8541aef2","guard":[["hasAny",["name","subregion","thailand","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Thailand":"Thailand is in South-Eastern Asia."}}},
{"id":"n-872a24fc","guard":[["has","maldives"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["sense.lastWord"]],"mem":null},
{"id":"n-87ea3706","guard":[["hasAny",["chad","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Chad in":"Chad is in Middle Africa."}}},
{"id":"n-880aaf8d","guard":[["hasAny",["name","subregion","ukraine","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Ukraine":"Ukraine is in Eastern Europe."}}},
{"id":"n-8aef9662","guard":[["hasAny",["netherlands","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Netherlands in":"Netherlands is in Western Europe."}}},
{"id":"n-8b0af9b6","guard":[["hasAny",["bermuda","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Bermuda":"Bermuda is in North America."}}},
{"id":"n-8bc2c0e5","guard":[["hasAny",["senegal","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Senegal in":"Senegal is in Western Africa."}}},
{"id":"n-8c4396bd","guard":[["hasAny",["subregion","uganda","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Uganda in":"Uganda is in Eastern Africa."}}},
{"id":"n-8cfa9b10","guard":[["hasAny",["name","norway","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Norway":"Norway is in Northern Europe."}}},
{"id":"n-95189117","guard":[["hasAny",["antigua","barbuda","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Antigua and Barbuda lie":"Antigua and Barbuda is in Caribbean."}}},
{"id":"n-a11c1bfa","guard":[["hasAny",["malta","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Malta in":"Malta is in Southern Europe."}}},
{"id":"n-a1a53cf8","guard":[["hasAny",["lie","subregion","türkiye"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Türkiye lie":"Türkiye is in Western Asia."}}},
{"id":"n-a242bed5","guard":[["hasAny",["grenadines","lie","saint","subregion","vincent"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Saint Vincent and the Grenadines lie":"Saint Vincent and the Grenadines is in Caribbean."}}},
{"id":"n-a74a292e","guard":[["hasAny",["name","seychelles","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Seychelles":"Seychelles is in Eastern Africa."}}},
{"id":"n-a7b378bf","guard":[["hasAny",["hong","kong","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Hong Kong lie":"Hong Kong is in Eastern Asia."}}},
{"id":"n-a9f80db8","guard":[["hasAny",["coast","ivory","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Ivory Coast lie":"Ivory Coast is in Western Africa."}}},
{"id":"n-abd59d53","guard":[["hasAny",["name","rwanda","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Rwanda":"Rwanda is in Eastern Africa."}}},
{"id":"n-ad14b6f2","guard":[["hasAny",["armenia","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Armenia in":"Armenia is in Western Asia."}}},
{"id":"n-ad90e021","guard":[["hasAny",["maldives","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Maldives":"Maldives is in Southern Asia."}}},
{"id":"n-afd4fe18","guard":[["hasAny",["islands","states","subregion","united","virgin","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is United States Virgin Islands in":"United States Virgin Islands is in Caribbean."}}},
{"id":"n-b199109e","guard":[["hasAny",["islands","lie","marshall","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Marshall Islands lie":"Marshall Islands is in Micronesia."}}},
{"id":"n-b574f026","guard":[["hasAny",["jamaica","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Jamaica":"Jamaica is in Caribbean."}}},
{"id":"n-b6bc31c6","guard":[["has","bermuda"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["sense.lastWord"]],"mem":null},
{"id":"n-b9106ace","guard":[["hasAny",["dominica","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Dominica lie":"Dominica is in Caribbean."}}},
{"id":"n-ba61fa3c","guard":[["hasAny",["name","oman","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Oman":"Oman is in Western Asia."}}},
{"id":"n-bf2edecc","guard":[["hasAny",["cuba","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Cuba in":"Cuba is in Caribbean."}}},
{"id":"n-bf6427a0","guard":[["hasAny",["comoros","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Comoros lie":"Comoros is in Eastern Africa."}}},
{"id":"n-c0064801","guard":[["hasAny",["subregion","tobago","trinidad","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean."}}},
{"id":"n-c241eeb1","guard":[["hasAny",["kyrgyzstan","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Kyrgyzstan lie":"Kyrgyzstan is in Central Asia."}}},
{"id":"n-c3d4bfe6","guard":[["hasAny",["lie","príncipe","subregion","são","tomé"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does São Tomé and Príncipe lie":"São Tomé and Príncipe is in Middle Africa."}}},
{"id":"n-c3d567c6","guard":[["hasAny",["bahrain","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Bahrain lie":"Bahrain is in Western Asia."}}},
{"id":"n-c5a01fdf","guard":[["hasAny",["ireland","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Ireland lie":"Ireland is in Northern Europe."}}},
{"id":"n-c699eadd","guard":[["hasAny",["islands","lie","minor","outlying","states","subregion","united"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does United States Minor Outlying Islands lie":"United States Minor Outlying Islands is in North America."}}},
{"id":"n-c976f665","guard":[["hasAny",["lie","luxembourg","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Luxembourg lie":"Luxembourg is in Western Europe."}}},
{"id":"n-c99206ce","guard":[["hasAny",["guinea","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Guinea":"Guinea is in Western Africa."}}},
{"id":"n-cde1b89b","guard":[["hasAny",["maarten","sint","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sint Maarten in":"Sint Maarten is in Caribbean."}}},
{"id":"n-d14ecea9","guard":[["hasAny",["egypt","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Egypt":"Egypt is in Northern Africa."}}},
{"id":"n-da0b43d0","guard":[["hasAny",["guadeloupe","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Guadeloupe":"Guadeloupe is in Caribbean."}}},
{"id":"n-dd4d3579","guard":[["hasAny",["guernsey","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Guernsey lie":"Guernsey is in Northern Europe."}}},
{"id":"n-dd7d4b11","guard":[["hasAny",["subregion","sweden","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sweden in":"Sweden is in Northern Europe."}}},
{"id":"n-e33a6479","guard":[["hasAny",["name","subregion","venezuela","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Venezuela":"Venezuela is in South America."}}},
{"id":"n-e3dcb226","guard":[["has","switzerland"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["sense.lastWord"]],"mem":null},
{"id":"n-e5259721","guard":[["hasAny",["croatia","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Croatia lie":"Croatia is in Southeast Europe."}}},
{"id":"n-e7750034","guard":[["hasAny",["lie","subregion","tuvalu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Tuvalu lie":"Tuvalu is in Polynesia."}}},
{"id":"n-e9f0f078","guard":[["hasAny",["cape","name","subregion","verde","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Cape Verde":"Cape Verde is in Western Africa."}}},
{"id":"n-ea868a8b","guard":[["hasAny",["bulgaria","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Bulgaria lie":"Bulgaria is in Southeast Europe."}}},
{"id":"n-ec823803","guard":[["hasAny",["congo","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Congo in":"Congo is in Middle Africa."}}},
{"id":"n-ef4a054e","guard":[["hasAny",["kiribati","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Kiribati lie":"Kiribati is in Micronesia."}}},
{"id":"n-f1007ad5","guard":[["hasAny",["jordan","name","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Jordan":"Jordan is in Western Asia."}}},
{"id":"n-f23a0b81","guard":[["has","sudan"],["has","world"]],"pyramid":["render.template",{"lit":["South ",{"slot":0}," is in Middle Africa."]},["sense.lastWord"]],"mem":null},
{"id":"n-f27f69c2","guard":[["hasAny",["name","subregion","switzerland","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the world subregion of Switzerland":"Switzerland is in Western Europe."}}},
{"id":"n-f60ace5a","guard":[["hasAny",["american","samoa","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is American Samoa in":"American Samoa is in Polynesia."}}},
{"id":"n-fa2b3982","guard":[["hasAny",["madagascar","subregion","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which subregion of the world is Madagascar in":"Madagascar is in Eastern Africa."}}},
{"id":"n-fb979543","guard":[["hasAny",["barthélemy","lie","saint","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Saint Barthélemy lie":"Saint Barthélemy is in Caribbean."}}},
{"id":"n-fdde4b59","guard":[["hasAny",["guyana","lie","subregion"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"in what subregion does Guyana lie":"Guyana is in South America."}}},
{"id":"n-0242c648","guard":[["hasAny",["bermuda","capitalise","capitalize","capitalize each word","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-07b79044","guard":[["has","egypt"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-102fd789","guard":[["hasAny",["bermuda","invert case","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-115a3599","guard":[["has","maldives"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-1a2cd07c","guard":[["hasAny",["all caps","bermuda","capital letters","capitals","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-21378767","guard":[["hasAny",["invert case","maldives","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2da4ec59","guard":[["hasAny",["chad","shortest","shortest one","shortest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Middle Africa."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3c4aef62","guard":[["hasAny",["all caps","capital letters","capitals","switzerland","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4a1bfd4c","guard":[["hasAny",["all caps","capital letters","capitals","egypt","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4a67e583","guard":[["hasAny",["lower case","lowercase","small letters","switzerland"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-55f28bf8","guard":[["hasAny",["invert case","swap case","switzerland","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-5a62deca","guard":[["hasAny",["capitalise","capitalize","capitalize each word","egypt","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-723a2304","guard":[["hasAny",["all caps","capital letters","capitals","nicaragua","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7ebd15cd","guard":[["hasAny",["invert case","nicaragua","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-931d56a4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","switzerland","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-9f9184a1","guard":[["hasAny",["all caps","capital letters","capitals","maldives","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-a2ac5287","guard":[["has","nicaragua"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-a69c5e82","guard":[["hasAny",["all caps","capital letters","capitals","ukraine","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-ae9cf720","guard":[["has","ukraine"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-b2ecb6f1","guard":[["hasAny",["lower case","lowercase","maldives","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-c01e7ac1","guard":[["hasAny",["egypt","lower case","lowercase","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-caf44459","guard":[["has","switzerland"],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-cb705258","guard":[["hasAny",["bermuda","lower case","lowercase","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ceaec49a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","maldives","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-d9f29fc2","guard":[["hasAny",["lower case","lowercase","nicaragua","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ee7376bb","guard":[["hasAny",["lower case","lowercase","small letters","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-f1078106","guard":[["hasAny",["capitalise","capitalize","capitalize each word","title case","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f28eed21","guard":[["hasAny",["invert case","swap case","toggle case","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f7c91ac4","guard":[["hasAny",["afghanistan","longest","longest one","longest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-f8136881","guard":[["has","portugal"],["has","name"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["sense.after",{"lit":"of"}]],"mem":null},
{"id":"n-f8aa4faf","guard":[["hasAny",["cuba","shortest","shortest one","shortest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Caribbean."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-fd52e8fa","guard":[["hasAny",["capitalise","capitalize","capitalize each word","nicaragua","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-fe3d5367","guard":[["hasAny",["egypt","invert case","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-013c2d85","guard":[["hasAny",["item number","kiribati","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-051eb2c8","guard":[["hasAny",["each word","nicaragua","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-07d50b30","guard":[["hasAny",["arabia","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saudi ",{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-080dc05f","guard":[["hasAny",["egypt","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-0ed04103","guard":[["hasAny",["element","item number","kazakhstan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-11217b0b","guard":[["hasAny",["item number","nth","position","sudan"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," Sudan is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-122f2b63","guard":[["hasAny",["afghanistan","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1eff9368","guard":[["hasAny",["each word","split into words","switzerland"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-25ec0b8d","guard":[["hasAny",["characters from","hong","letters from to","slice of the text","substring"]],["has","in"]],"pyramid":["render.str",["transform.substr",{"lit":"South-Eastern Asia"},["sense.wordCount"],{"lit":100}]],"mem":null},
{"id":"n-29c47ffb","guard":[["hasAny",["belarus","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2c8baf7d","guard":[["hasAny",["each word","maldives","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2fdb398e","guard":[["hasAny",["item number","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Trinidad and ",{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-32510671","guard":[["hasAny",["greenland","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-37a9f8d6","guard":[["hasAny",["item number","kiribati","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Micronesia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-37d94b31","guard":[["hasAny",["each word","egypt","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-39cdb9b7","guard":[["hasAny",["antigua","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Antigua and ",{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3deb48b6","guard":[["hasAny",["cayman","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-41700246","guard":[["hasAny",["cook","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands is in Polynesia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-46db59a1","guard":[["hasAny",["cook","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Cook ",{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-46e9ed5f","guard":[["hasAny",["each word","split into words","switzerland"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Western Europe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-48d3ec59","guard":[["hasAny",["element","item number","namibia","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4c67749b","guard":[["hasAny",["american","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["American ",{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-4eccef82","guard":[["hasAny",["bermuda","each word","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4f595125","guard":[["hasAny",["arabia","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Arabia is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4ff5df7f","guard":[["hasAny",["element","item number","kiribati","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-53a66892","guard":[["hasAny",["american","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["American ",{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5595e61b","guard":[["hasAny",["element","item number","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Tobago is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5c7f4195","guard":[["hasAny",["each word","split into words","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5dd8c807","guard":[["hasAny",["each word","split into words","ukraine"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-67dd78a6","guard":[["hasAny",["each word","maldives","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6aea53a6","guard":[["hasAny",["element","item number","kiribati","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Micronesia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-6e0dae13","guard":[["hasAny",["delete","senegal","strip out"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-7558b23e","guard":[["hasAny",["american","characters from","letters from to","slice of the text","substring"]],["has","subregion"]],"pyramid":["render.str",["transform.substr",{"lit":"Polynesia"},{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-7bc445f6","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Arabia is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7ce55389","guard":[["hasAny",["belarus","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Eastern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-7f885290","guard":[["hasAny",["american","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Samoa is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-83e6c3db","guard":[["hasAny",["item number","namibia","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-84689dad","guard":[["hasAny",["antigua","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Barbuda is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-85fe7318","guard":[["hasAny",["item number","maldives","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-894ee7aa","guard":[["hasAny",["element","greenland","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8a5af0f1","guard":[["hasAny",["cook","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Islands is in Polynesia."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-8c824f41","guard":[["hasAny",["cook","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Cook ",{"slot":0}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-94d51351","guard":[["hasAny",["cape","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," Verde is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-95aa193a","guard":[["hasAny",["delete","príncipe","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Middle Africa"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-9771b8ef","guard":[["hasAny",["item number","nicaragua","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-9dfcc027","guard":[["hasAny",["item number","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Tobago is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9fade564","guard":[["hasAny",["each word","egypt","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Northern Africa."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a0cb113e","guard":[["hasAny",["element","item number","malta","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a3f58813","guard":[["hasAny",["element","greenland","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-a4b97e21","guard":[["hasAny",["cape","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," Verde is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-aa201847","guard":[["hasAny",["greenland","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-ab4fa489","guard":[["hasAny",["canada","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b1944898","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Western ",{"slot":0}," is in Northern Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b2633abd","guard":[["hasAny",["item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Western ",{"slot":0}," is in Northern Africa."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b27a300d","guard":[["hasAny",["delete","remove","senegal","strip out","without"]],["has","subregion"]],"pyramid":["render.str",["transform.remove",{"lit":"Western Africa"},["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-b7d7d44c","guard":[["hasAny",["albania","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southeast Europe."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-bba2ff5a","guard":[["hasAny",["element","item number","maldives","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-c235b8a9","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saudi ",{"slot":0}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d0b2120c","guard":[["hasAny",["bermuda","each word","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-d22d0cd3","guard":[["hasAny",["item number","kazakhstan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d5dadea0","guard":[["hasAny",["item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Sahara is in Northern Africa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-dc9c72aa","guard":[["hasAny",["element","item number","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Trinidad and ",{"slot":0}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-e10d0d22","guard":[["hasAny",["american","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Samoa is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e9acb0b2","guard":[["hasAny",["item number","malta","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ed5fcb51","guard":[["hasAny",["afghanistan","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Southern Asia."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f13d7001","guard":[["hasAny",["each word","nicaragua","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in Central America."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f6b82ca7","guard":[["hasAny",["comoros","delete","remove","strip out"]]],"pyramid":["render.str",["transform.remove",{"lit":"Eastern Africa"},["sense.after",{"lit":"in"}]]],"mem":null},
{"id":"n-f6dea4cf","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Sahara is in Northern Africa."]},["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-f74e56ff","guard":[["hasAny",["bermuda","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-fd47298d","guard":[["hasAny",["canada","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-0593cefb","guard":[["hasAny",["cayman","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-86589acc","guard":[["hasAny",["cape","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-a8da00cb","guard":[["hasAny",["item number","nth","position","sudan"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-c23c245e","guard":[["hasAny",["cape","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-11fa03a2","guard":[["hasAny",["cayman","invert case","item number","nth","position","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-1a868e74","guard":[["hasAny",["cape","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-20e133da","guard":[["hasAny",["cape","element","invert case","item number","nth","position","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-20e2dda0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","cayman","item number","nth","position","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3f4076de","guard":[["hasAny",["cape","item number","lower case","lowercase","nth","position","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-5dca020f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","sudan","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-610cc1f9","guard":[["hasAny",["all caps","cape","capital letters","capitals","item number","nth","position","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-7499fe8c","guard":[["hasAny",["all caps","cape","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-79a38ec9","guard":[["hasAny",["invert case","item number","nth","position","sudan","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7c1b4306","guard":[["hasAny",["item number","lower case","lowercase","nth","position","small letters","sudan"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-80cc0d1a","guard":[["hasAny",["cayman","item number","lower case","lowercase","nth","position","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9563c851","guard":[["hasAny",["cape","element","item number","lower case","lowercase","nth","position","small letters"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-9f020da6","guard":[["hasAny",["all caps","capital letters","capitals","item number","nth","position","sudan","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-aac0ff24","guard":[["hasAny",["cape","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-b58df2d1","guard":[["hasAny",["all caps","capital letters","capitals","cayman","item number","nth","position","upper case","uppercase"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-e7db35e0","guard":[["hasAny",["cape","invert case","item number","nth","position","swap case","toggle case"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-019b8936","guard":[["hasAny",["cape","each word","element","item number","nth","position","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0283daf6","guard":[["hasAny",["cape","each word","item number","nth","position","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-043b9f8a","guard":[["hasAny",["cape","each word","element","item number","nth","position","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-06b6927d","guard":[["hasAny",["each word","item number","nth","position","split into words","sudan"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0e782c7f","guard":[["hasAny",["american","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-10203d97","guard":[["hasAny",["item number","nth","position","príncipe"]],["has","subregion"]],"pyramid":["render.template",{"lit":["São ",{"slot":0}," and ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-125bb298","guard":[["hasAny",["item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," Mayen is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-12e18a56","guard":[["hasAny",["cape","each word","item number","nth","position","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-12fdfb5b","guard":[["hasAny",["element","item number","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-149a5768","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Northern Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1c166076","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," Mayen is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-1c19a6f8","guard":[["hasAny",["item number","new","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["New ",{"slot":0}," is in Australia and ",{"slot":1}," Zealand."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-203ac5d9","guard":[["hasAny",["item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Mariana ",{"slot":1}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-2e17a96d","guard":[["hasAny",["arabia","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-315ec1b4","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Mariana ",{"slot":1}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3659d0eb","guard":[["hasAny",["item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," and ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3855e014","guard":[["hasAny",["item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Islands is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-3c676bc0","guard":[["hasAny",["item number","nth","position","tobago"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-41a955dc","guard":[["hasAny",["item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Miquelon is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-421cbdd7","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Pierre and ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4478e7e3","guard":[["hasAny",["item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Kitts and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-463b67df","guard":[["hasAny",["item number","new","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Zealand is in Australia and ",{"slot":1}," Zealand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-4b2c99bc","guard":[["hasAny",["item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-4d7efcb7","guard":[["hasAny",["antigua","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-504393f5","guard":[["hasAny",["arabia","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Asia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-5706ab87","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," and ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5a4834f1","guard":[["hasAny",["item number","nth","position","sudan"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-5ff55241","guard":[["hasAny",["cayman","each word","item number","nth","position","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6302b2bc","guard":[["hasAny",["cape","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-7002f3d6","guard":[["hasAny",["cayman","each word","item number","nth","position","split into words"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7b1ab577","guard":[["hasAny",["cook","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8145109e","guard":[["hasAny",["item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Nevis is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8a9e4f87","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Nevis is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-8d2e0bec","guard":[["hasAny",["cook","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8fb868d0","guard":[["hasAny",["item number","nth","position","príncipe"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Príncipe is in Middle Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-9013da5e","guard":[["hasAny",["item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Pierre and ",{"slot":1}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-90295b3c","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Svalbard and ",{"slot":0}," ",{"slot":1}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-93119b15","guard":[["hasAny",["american","element","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a529a726","guard":[["hasAny",["cape","item number","normalise","normalize","nth","position","simplify the text"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-ab67c873","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and Miquelon is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-af6058ce","guard":[["hasAny",["cape","element","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-b76d6f5b","guard":[["hasAny",["cook","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-ba2cc1f2","guard":[["hasAny",["item number","new","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and New Zealand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-bc169459","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Saint ",{"slot":0}," and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-c0ff8eaa","guard":[["hasAny",["cook","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Polynesia."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-c16280f1","guard":[["hasAny",["item number","normalise","normalize","nth","position","simplify the text","sudan"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-c70dcdbb","guard":[["hasAny",["cayman","item number","nth","position"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-caffc8a8","guard":[["hasAny",["item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Jan ",{"slot":1}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-cb7b8df3","guard":[["hasAny",["item number","nth","position","príncipe"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Tomé and ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-cc9be119","guard":[["hasAny",["item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Northern Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-cd6118c1","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Islands is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-d2d13df5","guard":[["hasAny",["antigua","item number","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-d3bde58e","guard":[["hasAny",["item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Northern ",{"slot":0}," ",{"slot":1}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e0b4b940","guard":[["hasAny",["each word","item number","nth","position","split into words","sudan"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e4771f38","guard":[["hasAny",["item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Northern Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e914acad","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," Kitts and ",{"slot":1}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-e9b03402","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and Jan ",{"slot":1}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ed56ae72","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Northern ",{"slot":0}," ",{"slot":1}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-edc0bed5","guard":[["hasAny",["cape","element","item number","normalise","normalize","nth","position","simplify the text"]],["has","world"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Western Africa."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.norm",["sense.lastWord"],{"lit":2}]],"mem":null},
{"id":"n-f7611bdb","guard":[["hasAny",["item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":["Svalbard and ",{"slot":0}," ",{"slot":1}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-fbae65fb","guard":[["hasAny",["element","item number","nth","position","sahara"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Northern Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-071011b8","guard":[["hasAny",["item number","new","nth","position","shortest","shortest one","shortest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and ",{"slot":2}," Zealand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-232cb4c1","guard":[["hasAny",["item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3e5ef01f","guard":[["hasAny",["item number","nth","position","príncipe","shortest","shortest one","shortest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Middle Africa."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-703b9522","guard":[["hasAny",["element","item number","jan","nth","position","shortest","shortest one","shortest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-88fc1da2","guard":[["hasAny",["item number","new","nth","position","shortest","shortest one","shortest word"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and ",{"slot":2}," Zealand."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-172fc529","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," States ",{"slot":1}," ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-26a58e28","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-305f1fb4","guard":[["hasAny",["item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3605b36e","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-6311f97d","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Islands is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-6c70545f","guard":[["hasAny",["item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-6d800641","guard":[["hasAny",["item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-78ab9f62","guard":[["hasAny",["item number","new","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and ",{"slot":2}," Zealand."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-82122b28","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":["United ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-8ea0f88c","guard":[["hasAny",["item number","new","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and ",{"slot":2}," Zealand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-904b5660","guard":[["hasAny",["element","item number","miquelon","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in North America."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-979a65cb","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," Virgin ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-9aa6a557","guard":[["hasAny",["item number","nth","position","príncipe"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Middle Africa."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-a47dca41","guard":[["hasAny",["element","item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-b53c0f08","guard":[["hasAny",["item number","new","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," is in Australia and ",{"slot":2}," Zealand."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-c87bbb11","guard":[["hasAny",["element","item number","kitts","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-d20add65","guard":[["hasAny",["item number","nth","position","príncipe"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," and ",{"slot":2}," is in Middle Africa."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-db61330f","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-dd58b854","guard":[["hasAny",["item number","mariana","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," is in Micronesia."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-f6774ddd","guard":[["hasAny",["item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," Islands is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-ff3115a3","guard":[["hasAny",["element","item number","jan","nth","position"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," and ",{"slot":1}," ",{"slot":2}," is in Northern Europe."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-41015e7a","guard":[["hasAny",["element","item number","nth","position","virgin"]],["has","subregion"]],"pyramid":["render.template",{"lit":[{"slot":0}," ",{"slot":1}," ",{"slot":2}," ",{"slot":3}," is in Caribbean."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-06a1b0eb","guard":[["hasAny",["lie","new","subregion","zealand"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does New Zealand lie":"New Zealand is in Australia and New Zealand."}}},
{"id":"n-071b496d","guard":[["has","madagascar"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Madagascar in":"Madagascar is in Eastern Africa."}}},
{"id":"n-07cd5069","guard":[["has","sweden"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sweden in":"Sweden is in Northern Europe."}}},
{"id":"n-0b7cc67f","guard":[["has","barbados"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Barbados in":"Barbados is in Caribbean."}}},
{"id":"n-0c0a97ec","guard":[["has","kiribati"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Kiribati lie":"Kiribati is in Micronesia."}}},
{"id":"n-0f9686ea","guard":[["has","senegal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Senegal in":"Senegal is in Western Africa."}}},
{"id":"n-10328458","guard":[["has","tonga"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Tonga in":"Tonga is in Polynesia."}}},
{"id":"n-1188f73b","guard":[["has","guernsey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Guernsey lie":"Guernsey is in Northern Europe."}}},
{"id":"n-125c1e19","guard":[["has","portugal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Portugal":"Portugal is in Southern Europe."}}},
{"id":"n-149cf4a3","guard":[["has","bulgaria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Bulgaria lie":"Bulgaria is in Southeast Europe."}}},
{"id":"n-20a1c3c2","guard":[["hasAny",["miquelon","pierre","saint","subregion","world"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saint Pierre and Miquelon in":"Saint Pierre and Miquelon is in North America."}}},
{"id":"n-212a08be","guard":[["has","jordan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Jordan":"Jordan is in Western Asia."}}},
{"id":"n-22464c45","guard":[["hasAny",["islands","lie","minor","outlying","states","subregion","united"]],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does United States Minor Outlying Islands lie":"United States Minor Outlying Islands is in North America."}}},
{"id":"n-2a8a0e99","guard":[["has","albania"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Albania":"Albania is in Southeast Europe."}}},
{"id":"n-2ada2138","guard":[["has","armenia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Armenia in":"Armenia is in Western Asia."}}},
{"id":"n-2af14481","guard":[["has","marshall"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Marshall Islands lie":"Marshall Islands is in Micronesia."}}},
{"id":"n-2b6af54f","guard":[["has","cayman"],["has","world"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Cayman Islands":"Cayman Islands is in Caribbean."}}},
{"id":"n-2beb5a80","guard":[["has","comoros"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Comoros lie":"Comoros is in Eastern Africa."}}},
{"id":"n-2beb714c","guard":[["hasAny",["grenadines","vincent"]],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Saint Vincent and the Grenadines lie":"Saint Vincent and the Grenadines is in Caribbean."}}},
{"id":"n-2e244b9e","guard":[["has","canada"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Canada in":"Canada is in North America."}}},
{"id":"n-2f3d3a47","guard":[["hasAny",["macedonia","north"]],["has","world"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of North Macedonia":"North Macedonia is in Southeast Europe."}}},
{"id":"n-302cdcef","guard":[["has","philippines"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Philippines in":"Philippines is in South-Eastern Asia."}}},
{"id":"n-3183b572","guard":[["hasAny",["lie","sahara","subregion","western"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Western Sahara lie":"Western Sahara is in Northern Africa."}}},
{"id":"n-33c5de52","guard":[["has","barthélemy"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Saint Barthélemy lie":"Saint Barthélemy is in Caribbean."}}},
{"id":"n-35c73b93","guard":[["has","togo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Togo":"Togo is in Western Africa."}}},
{"id":"n-39c17113","guard":[["has","netherlands"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Netherlands in":"Netherlands is in Western Europe."}}},
{"id":"n-3c6037f1","guard":[["hasAny",["maarten","sint","subregion","world"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Sint Maarten in":"Sint Maarten is in Caribbean."}}},
{"id":"n-3ca98b0f","guard":[["has","gambia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Gambia lie":"Gambia is in Western Africa."}}},
{"id":"n-3dda61d5","guard":[["has","pitcairn"],["has","world"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Pitcairn Islands":"Pitcairn Islands is in Polynesia."}}},
{"id":"n-400027b4","guard":[["has","luxembourg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Luxembourg lie":"Luxembourg is in Western Europe."}}},
{"id":"n-40941711","guard":[["has","tuvalu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Tuvalu lie":"Tuvalu is in Polynesia."}}},
{"id":"n-41f715d5","guard":[["has","guinea"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Guinea":"Guinea is in Western Africa."}}},
{"id":"n-48f1e61c","guard":[["hasAny",["lie","príncipe","subregion","são","tomé"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does São Tomé and Príncipe lie":"São Tomé and Príncipe is in Middle Africa."}}},
{"id":"n-4d9bb309","guard":[["has","oman"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Oman":"Oman is in Western Asia."}}},
{"id":"n-4e871f80","guard":[["has","zimbabwe"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Zimbabwe in":"Zimbabwe is in Eastern Africa."}}},
{"id":"n-57ffadd4","guard":[["has","azerbaijan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Azerbaijan":"Azerbaijan is in Western Asia."}}},
{"id":"n-584e265b","guard":[["has","afghanistan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Afghanistan in":"Afghanistan is in Southern Asia."}}},
{"id":"n-5987321a","guard":[["has","cuba"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Cuba in":"Cuba is in Caribbean."}}},
{"id":"n-5d70a5d5","guard":[["hasAny",["american","samoa","subregion","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is American Samoa in":"American Samoa is in Polynesia."}}},
{"id":"n-5ffdcee4","guard":[["hasAny",["hong","kong","lie","subregion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Hong Kong lie":"Hong Kong is in Eastern Asia."}}},
{"id":"n-63306b26","guard":[["has","congo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Congo in":"Congo is in Middle Africa."}}},
{"id":"n-6358fd47","guard":[["has","switzerland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Switzerland":"Switzerland is in Western Europe."}}},
{"id":"n-69c104b1","guard":[["has","belarus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Belarus in":"Belarus is in Eastern Europe."}}},
{"id":"n-6be841ec","guard":[["has","kazakhstan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Kazakhstan in":"Kazakhstan is in Central Asia."}}},
{"id":"n-70f2e11a","guard":[["has","malta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Malta in":"Malta is in Southern Europe."}}},
{"id":"n-774e7584","guard":[["has","venezuela"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Venezuela":"Venezuela is in South America."}}},
{"id":"n-7802e360","guard":[["has","maldives"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Maldives":"Maldives is in Southern Asia."}}},
{"id":"n-7cca1dbd","guard":[["has","belize"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Belize in":"Belize is in Central America."}}},
{"id":"n-82b215e1","guard":[["has","russia"],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Russia lie":"Russia is in Eastern Europe."}}},
{"id":"n-83fec247","guard":[["has","dominica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Dominica lie":"Dominica is in Caribbean."}}},
{"id":"n-87936f81","guard":[["has","martinique"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Martinique in":"Martinique is in Caribbean."}}},
{"id":"n-8a639360","guard":[["hasAny",["jan","mayen","subregion","svalbard","world"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Svalbard and Jan Mayen in":"Svalbard and Jan Mayen is in Northern Europe."}}},
{"id":"n-8bf0590f","guard":[["has","africa"],["has","world"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of South Africa":"South Africa is in Southern Africa."}}},
{"id":"n-8d1bd9f4","guard":[["hasAny",["arabia","saudi","subregion","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saudi Arabia in":"Saudi Arabia is in Western Asia."}}},
{"id":"n-8f3cf330","guard":[["has","sudan"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of South Sudan":"South Sudan is in Middle Africa."}}},
{"id":"n-900c4e69","guard":[["has","timorleste"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Timor-Leste in":"Timor-Leste is in South-Eastern Asia."}}},
{"id":"n-953c3a16","guard":[["hasAny",["islands","virgin"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is United States Virgin Islands in":"United States Virgin Islands is in Caribbean."}}},
{"id":"n-983f804f","guard":[["hasAny",["subregion","tobago","trinidad","world"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Trinidad and Tobago in":"Trinidad and Tobago is in Caribbean."}}},
{"id":"n-98e67cab","guard":[["has","greenland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Greenland lie":"Greenland is in North America."}}},
{"id":"n-9d5f6db1","guard":[["has","cook"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Cook Islands lie":"Cook Islands is in Polynesia."}}},
{"id":"n-9de6766d","guard":[["has","seychelles"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Seychelles":"Seychelles is in Eastern Africa."}}},
{"id":"n-a00ddf3e","guard":[["has","bahrain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Bahrain lie":"Bahrain is in Western Asia."}}},
{"id":"n-a0a7b9c6","guard":[["has","chad"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Chad in":"Chad is in Middle Africa."}}},
{"id":"n-a10253f3","guard":[["has","syria"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Syria":"Syria is in Western Asia."}}},
{"id":"n-a7e28ea8","guard":[["has","guadeloupe"],["has","world"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Guadeloupe":"Guadeloupe is in Caribbean."}}},
{"id":"n-a9571eae","guard":[["has","chile"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Chile":"Chile is in South America."}}},
{"id":"n-aa80e2ae","guard":[["has","guatemala"],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Guatemala in":"Guatemala is in Central America."}}},
{"id":"n-abcdf59b","guard":[["has","estonia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Estonia":"Estonia is in Northern Europe."}}},
{"id":"n-ae648440","guard":[["has","ukraine"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Ukraine":"Ukraine is in Eastern Europe."}}},
{"id":"n-b1d9831a","guard":[["has","montserrat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Montserrat lie":"Montserrat is in Caribbean."}}},
{"id":"n-b327fe93","guard":[["has","spain"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Spain lie":"Spain is in Southern Europe."}}},
{"id":"n-b84e3131","guard":[["has","uganda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Uganda in":"Uganda is in Eastern Africa."}}},
{"id":"n-bccb388f","guard":[["has","monaco"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Monaco lie":"Monaco is in Western Europe."}}},
{"id":"n-c3962a88","guard":[["has","egypt"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Egypt":"Egypt is in Northern Africa."}}},
{"id":"n-c64c5b43","guard":[["has","cameroon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Cameroon in":"Cameroon is in Middle Africa."}}},
{"id":"n-c7533dfb","guard":[["has","thailand"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Thailand":"Thailand is in South-Eastern Asia."}}},
{"id":"n-c79fff6e","guard":[["hasAny",["coast","ivory","lie","subregion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Ivory Coast lie":"Ivory Coast is in Western Africa."}}},
{"id":"n-c98fdcfd","guard":[["has","ireland"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Ireland lie":"Ireland is in Northern Europe."}}},
{"id":"n-cabc5370","guard":[["has","brazil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Brazil lie":"Brazil is in South America."}}},
{"id":"n-cbca9380","guard":[["has","jamaica"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Jamaica":"Jamaica is in Caribbean."}}},
{"id":"n-ce11727a","guard":[["has","namibia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Namibia":"Namibia is in Southern Africa."}}},
{"id":"n-d0b9a3a4","guard":[["has","nicaragua"],["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Nicaragua":"Nicaragua is in Central America."}}},
{"id":"n-d0f3fdd3","guard":[["has","rwanda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Rwanda":"Rwanda is in Eastern Africa."}}},
{"id":"n-d2d01138","guard":[["has","kenya"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Kenya":"Kenya is in Eastern Africa."}}},
{"id":"n-d5533b42","guard":[["has","indonesia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Indonesia":"Indonesia is in South-Eastern Asia."}}},
{"id":"n-d8827528","guard":[["hasAny",["isle","lie","man","subregion"]],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Isle of Man lie":"Isle of Man is in Northern Europe."}}},
{"id":"n-de15e291","guard":[["has","nepal"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Nepal lie":"Nepal is in Southern Asia."}}},
{"id":"n-df9c3f6a","guard":[["has","croatia"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Croatia lie":"Croatia is in Southeast Europe."}}},
{"id":"n-e61b87cf","guard":[["has","curaçao"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Curaçao in":"Curaçao is in Caribbean."}}},
{"id":"n-e6c69a58","guard":[["has","kyrgyzstan"],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Kyrgyzstan lie":"Kyrgyzstan is in Central Asia."}}},
{"id":"n-edf5685b","guard":[["has","guyana"],["has","in"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Guyana lie":"Guyana is in South America."}}},
{"id":"n-eedda4f7","guard":[["has","bermuda"],["has","world"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Bermuda":"Bermuda is in North America."}}},
{"id":"n-ef42bb1c","guard":[["hasAny",["antigua","barbuda","lie","subregion"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Antigua and Barbuda lie":"Antigua and Barbuda is in Caribbean."}}},
{"id":"n-f127aba1","guard":[["hasAny",["cape","verde"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Cape Verde":"Cape Verde is in Western Africa."}}},
{"id":"n-f27df445","guard":[["has","türkiye"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"in what subregion does Türkiye lie":"Türkiye is in Western Asia."}}},
{"id":"n-f4c370a3","guard":[["has","norway"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the world subregion of Norway":"Norway is in Northern Europe."}}},
{"id":"n-f7f1ba18","guard":[["has","lebanon"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Lebanon in":"Lebanon is in Western Asia."}}},
{"id":"n-fa5034b6","guard":[["hasAny",["kitts","nevis","saint","subregion","world"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which subregion of the world is Saint Kitts and Nevis in":"Saint Kitts and Nevis is in Caribbean."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which subregion of the world is Sweden in","expect":{"contains":["Northern Europe"],"notRefusal":true}},{"q":"name the world subregion of Egypt","expect":{"contains":["Northern Africa"],"notRefusal":true}},{"q":"which subregion of the world is Philippines in","expect":{"contains":["South-Eastern Asia"],"notRefusal":true}},{"q":"in what subregion does Montserrat lie","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"which subregion of the world is Congo in","expect":{"contains":["Middle Africa"],"notRefusal":true}},{"q":"which subregion of the world is United States Virgin Islands in","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"in what subregion does Nepal lie","expect":{"contains":["Southern Asia"],"notRefusal":true}},{"q":"which subregion of the world is Tonga in","expect":{"contains":["Polynesia"],"notRefusal":true}},{"q":"which subregion of the world is Senegal in","expect":{"contains":["Western Africa"],"notRefusal":true}},{"q":"in what subregion does Luxembourg lie","expect":{"contains":["Western Europe"],"notRefusal":true}},{"q":"in what subregion does United States Minor Outlying Islands lie","expect":{"contains":["North America"],"notRefusal":true}},{"q":"in what subregion does São Tomé and Príncipe lie","expect":{"contains":["Middle Africa"],"notRefusal":true}},{"q":"in what subregion does Hong Kong lie","expect":{"contains":["Eastern Asia"],"notRefusal":true}},{"q":"in what subregion does Kyrgyzstan lie","expect":{"contains":["Central Asia"],"notRefusal":true}},{"q":"which subregion of the world is American Samoa in","expect":{"contains":["Polynesia"],"notRefusal":true}},{"q":"in what subregion does Russia lie","expect":{"contains":["Eastern Europe"],"notRefusal":true}},{"q":"which subregion of the world is Netherlands in","expect":{"contains":["Western Europe"],"notRefusal":true}},{"q":"name the world subregion of Cayman Islands","expect":{"contains":["Caribbean"],"notRefusal":true}},{"q":"name the world subregion of Albania","expect":{"contains":["Southeast Europe"],"notRefusal":true}},{"q":"in what subregion does Gambia lie","expect":{"contains":["Western Africa"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
