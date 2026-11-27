// fr-tidytuesday-holiday-movies-cdef-e07f55-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"fr-tidytuesday-holiday-movies-cdef-e07f55-neo-g10","class":"fr-tidytuesday-holiday-movies-cdef-e07f55","generation":10,"lane":"neo","grownFrom":["what is the title type of The Kacey Musgraves Christmas Show","tell me the title type of Merry Christmas, Yiwu","name the title type of Christmas with the Dead","what is the title type of Holiday Hotel","tell me the title type of The Nine Lives of Christmas","name the title type of Forever Christmas","what is the title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972","tell me the title type of Girlfriends of Christmas Past","name the title type of A Christmas Dream","what is the title type of A Christmas Prince: The Royal Baby","tell me the title type of The Christmas Bunny","name the title type of Miracle on Christmas","what is the title type of Royally Yours, This Christmas","tell me the title type of The Hypothetical Star Wars Holiday Special","name the title type of Walter & Tandoori's Christmas","what is the title type of 12 Dog Days Till Christmas","tell me the title type of Disney Channel Holiday","name the title type of Crown for Christmas","what is the title type of A Not So Merry Christmas","tell me the title type of Christmas with a Prince: The Royal Baby"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-holiday-movies-cdef4a","columns":["title type","primary title"],"n":2265,"cols":[{"d":"movie|tvMovie|video","r":"0*h,1*1,0*3,1*2,0*3,1*1,0*2,1*1,0*1,1*2,0*1,1*1,2*1,1*1,0*1,1*3,0*2,2*1,1*3,2*1,1*5,2*1,0*1,1*1,0*2,1*2,0*1,1*2,2*2,1*1,2*1,0*1,1*1,2*1,1*1,0*1,1*2,0*1,1*6,2*1,0*1,1*1,0*1,1*1,0*1,1*5,0*1,2*1,0*4,1*2,0*5,2*1,0*3,1*4,0*2,1*2,0*kp,1*w3,2*6w","sep":"|"},{"f":"0Sailor's Holiday|0Holiday|1usband's Holiday|0Death Takes a Holiday|0A Christmas Carol|0Christmas in July|dConnecticut|0Strange Holiday|0Bush Christmas|0Christmas Eve|0Summer Holiday|0Holiday Affair|0Last Holiday|0Roman Holiday|0White Christmas|0Paris Holiday|0The Night Before Christmas|0Carol for Another Christmas|0Every Day Is a Holiday|0The Christmas That Almost Wasn't|free|0How the Grinch Stole Christmas!|2me for the Holidays|0Black Christmas|0Journey to the Christmas Star|0Blue Christmas|0A Christmas to Remember|cStory|0Merry Christmas|0The Christmas Gift|eStar|0I'll Be Home for Christmas|0Home for Christmas|0All I Want for Christmas|0The Christmas Box|0A Christmas Carol|0Christmas Every Day|0The Christmas Party|0A Christmas Reunion|0The Christmas Orange|eList|0Bloody Christmas|0Christmas in August|0The Spirit of Christmas|0Carry on Christmas|0'Twas the Night Before Christmas|0A Holiday Romance|5lywood Christmas|0Last Christmas|0The Christmas Carol|0Scrooge: A Christmas Carol|0A Snow White Christmas|0The Christmas Secret|0O' Christmas Tree|0Holiday in Seoul|0The Twelve Days of Christmas|0A Christmas Tail|0Christmas|0EastEnders: Christmas Party|0The Christmas Truce|0Christmas in Love|0On Christmas Eve|0A Christmas Tale|0Christmas with the Mormon Tabernacle Choir|0The Best Christmas Ever!|0A Christmas Wedding|0The First Christmas|0Happy Holidays|0The Road to Christmas|4Wiggles: Wiggly Wiggly Christmas|0What We Did on Our Holiday|0The Flight Before Christmas|0Home by Christmas|0A Grandpa for Christmas|0Christmas Time|bown|aby Design|0A Christmas Wish|cMiracle|2Doggone Christmas|0Christmas in Paradise|0The Family Holiday|4Christmas Dance|0Christmas in Vienna|0The Christmas Ride|0A Taste of Christmas|0Christmas in Paris|0A Christmas Proposal|0Good Morning Christmas!|0Cranberry Christmas|1hristmas Again|1MA Country Christmas|1hristmas Angel|0VeggieTales: The Toy That Saved Christmas!|0A Lot Like Christmas|0Christmas Next Door|0Falling for Christmas|0Anything But Christmas|0Christmas Dreams|0A Christmas Star|0The Christmas Spirit|0Merry Ex-Mas|0Holidays|0The Sound of Christmas|0Holiday Road|0A Madea Christmas|2Christmas Mystery|0This Is Christmas|0For the Love of Christmas|0A Christmas Blessing|0Christmas Island|1oming Home for Christmas|0Second Chance Christmas|0Red Christmas|0Almost Christmas|1 Baby for Christmas|2Song for Christmas|0'R Xmas|1Twas the Fight Before Christmas|01000 Miles from Christmas|12 Dog Days Till Christmas|6s of Christmas: Great Puppy Rescue|3Pups of Christmas|13 Slays Till X-Mas|2th Day of Christmas|03 Bears Christmas|06 Hours to Christmas|08-Bit Christmas|0A Bad Moms Christmas|3eauty & The Beast Christmas|4lgian Chocolate Christmas|5le for Christmas|4ngal for Christmas|5nett Song Holiday|3oy Called Christmas|3ulldog for Christmas|2Cadaver Christmas|4lcutta Christmas|5ifornia Christmas|m: City Lights|4rol of Christmas|7ina Christmas|4stle for Christmas|3hristmas Cancellation|erol|h|h|h|h|h|h|h|h|h|h|h|h|h|h|h|h|h: Scrooge's Ghostly Tale|cEve Miracle|cFamily Tragedy|drequency|cGift|g from Bob|cHeist|ero|dorror Story|cInvitation|cKaren|cLove|cMiracle|donstrosity|cNumber One|cOpen House|cPrayer|eince|i: The Royal Baby|uWedding|cSnow|dtar|eory Christmas|iDocumentary: Road Trip for Ralphie|iat the Vatican|dunset|cTale|g|dree Love Story|hMiracle|hand a Wedding|cVintage|cWedding|dinter Song|esh|cin New York|cto Remember|3ountry Christmas|2Detour for Christmas|3og for Christmas|5gone Christmas|5walker's Christmas Tale|2Family Matters Christmas|3eminist Christmas Carol|3iancé for Christmas|3rozen Christmas|i 2|j3|2Gettysburg Christmas|3ingerbread Christmas|3randpa for Christmas|2Halfway House Christmas|3oliday Boyfriend|aChance|ege|aHeist|aI Do|4me for the Holidays|4rse for Christmas|2Jenkins Family Christmas|4rsey Christmas|4wish Christmas Story|2Karate Christmas Miracle|2Little Christmas Business|jStory|2Madea Christmas|4gic Christmas|4tch Made at Christmas|3eowy Christmas|h Vacation|4rry Friggin' Christmas|8Little Christmas|3iracle Before Christmas|aon Christmas Lake|2Naija Christmas|4shville Country Christmas|3ew Christmas|6Husband for Christmas|6Lease on Christmas|3ot So Merry Christmas|2Perfect Christmas Pairing|2Quarantined Christmas|2Raunchy Christmas Story|3ich Christmas|2Savage Christmas|3tone Cold Christmas|3unburnt Christmas|2Tiny House Christmas|3rue Christmas|2Unicorn for Christmas|2Verry Merry Hood Christmas|5y Christmas Story|7Harold & Kumar Christmas|7Larry Christmas|7Quarantwinned Christmas|2Wesley Christmas|3iseguy Christmas|3onderful Christmas Time|3restling Christmas Miracle|2Yeti Stole Christmas|1ccident Man: Hitman's Holiday|2e & the Christmas Miracle|1dventures in Christmasing|bof Bailey: Christmas Hero|1ll American Christmas Carol|4I Want Is Christmas|bfor Christmas|o|o|o 2|o: The Magic Time Machine|2most Christmas|2one at Christmas|1merican Christmas|i Carol: A Ballet Movie|2ityville Christmas Vacation|1n Angelic Christmas|3Evergreen Christmas|2dre Rieu: Christmas in London|2gel's Holiday|5a's Christmas Wish|2other Christmas|8Happy Christmas|1pollo Goes on Holiday|1rthur Christmas|1t That Time, at Christmas...|1venger Dogs Christmas|0Bad Christmas|2nk Holiday|2rcelona Christmas Night|1eggar's Holiday|2st. Christmas. Ever!|2tween Christmas and New Year's|2verly Hills Christmas|n 2 Director's Cut|1illy's Holiday|2ngo! Holiday Kids!|1lack Christmas|f|f: 2021 Remake|hThe Night Billy Came Home|5jack Christmas|2essings of Christmas|2ondie's Holiday|3ody Christmas|2ue Christmas|6ollar White Christmas|1o Bear Celebrates Christmas|1ringing Back Christmas|1ush Christmas|3man's Holiday|0CBeebies Christmas Show: Hansel & Gretel|1aesar and Otto's Deadly Xmas|2nadian Holidays|2rol's Christmas|2sper and Emma's Wonderful Christmas|2tfish Christmas|1harles Dickens' A Christmas Carol|5ie's Christmas Wish|2eap vs. Expensive Xmas Day|2ristmas|9 All Over Again|bngel|bpparition|aBlood|fy Christmas|aCarol|f: The Movie|ds|bheer|cild|bollision|cmes Home|cupon|braft Fair Massacre|cossfire|cuelty!|aDown Under|breams|aEve|cil|aFever|break|bull of Grace|aGrace|aHarmony|bolidate|gy|aInheritance|bs Canceled|aLovers Anonymous|bucky Charm|aMail|cnger|biracle|bountain|aNightmare|aOranges|aParty|bresence|gt|coposal|aRansom|bematch|bide|cnger|bose|aSlay|btaycation|cory|burvival|aTears|bhieves|bime|bree Upside Down|es 8|aVacation 2000|aWander|bedding Baby|aZombies|aas Usual|bt Cattle Hill|dDraculas|dMaxwell's|dRosemont|dWapos Bay|dthe Chateau|hGreenbrier|hHolly Day Inn|nHotel|hRanch|ioyal Hotel|aby the Book|afor a Dollar|ain August|dBeverly Hills|dCarolina|eompton|dFlorida|dHollywood|dJuly|dMaple Hills|eiami|dNew York|dPalm Springs|fradise|dSouth Africa|dWolf Creek|fnderland|da Day|dthe Caribbean|ilouds|hHoly Land|hJungle|hPines|hSmokies|hWilds|aon July 24th Avenue|dMars|eistletoe Farm|ey Block|dRepeat|dthe Carousel|ioast|hNile|hRange|hSquare|avs. The Walters|awith Cookie|l: Locked Away|fFelicity|fJerks|fMy Ex|fRiffTrax: Santa's Village of Madness|fWalt Disney|fYou|fa Capital C|irown|fthe Campbells|lrters|khosen: The Messengers|jDead|jKarountzoses|kranks|jMormon Tabernacle Choir|9, Again|bNo Filter|9. Uncensored|1inerama Holiday|1lara's Ultimate Christmas|1ollege Holiday|3orado Christmas|2mmunity Theater Christmas|2nfessions from a Holiday Camp|2untry Music Holiday|8Roads Christmas|2wboy Christmas|7Holiday|1razy Swedish Holidays in Paris|2ime Takes a Holiday|3pples Go Christmas|1upid for Christmas|5's Christmas|0Dad's Holiday|2ngerous Holiday|2ys of Our Lives: A Very Salem Christmas|1ead by Christmas|2livery by Christmas|2stined 2: Christmas Once More|1ismembering Christmas|1ollywood's a Christmas Carol|2n't Open Till Christmas|1racula on Holiday|2eaming of a Jewish Christmas|an Christmas|0EXmas|1l Camino Christmas|2fette Saves Christmas|1rnest Saves Christmas|1stella Scrooge: A Christmas Carol with a Twist|1very Day Is a Holiday|9's a Holiday|6Other Holiday|5day But Christmas|9Is a Holiday|0Faith Filled Christmas|2mily Holiday|2ther Christmas Is Back|1ireplace for your Home: Christmas Music|1or the Love of Christmas|3gotten Christmas|2ur Christmases|6ousins & a Christmas|1riday Is No Holiday|1uture Memories: Last Christmas|0Greyson Family Christmas|2umpy Christmas|0Hank's Christmas Wish|3ukkah|2ppy Christmas|6Ero Christmas|6Holidays|2unted Holiday|1eaded South for Christmas|3rt for the Holidays|2ber Holiday|2lene Fischer: Christmas - Live from the Hofburg Vienna|2rcules Saves Christmas|1igh Holiday|5School Musical: The Musical: The Holiday Special|2p Hop Holiday|1oliday|7|7|7|7|7|7|7|7|7|7|7 Baggage|9oyfriend|9reakup|8Camp|8Dreaming|8Harmony|9eist|all|9ideaway|9ookers|atel|8Inn|9sland|8Makers|9onday|8Rhythm|9ush|8Spectacular|8Twist|8Week|8for Henrietta|cLovers|cSinners|ca Dog|8in Bombay|bHavana|bMexico|bSarajevo|ceoul|cpain|ct. Tropez|bthe Wild|8of St. Jorgen|9n the Buses|8with Minka|7's with Pay|7s|8|8 at the Ranch|9by the Sea|9in Amsterdam|cHell|cthe Sun|9on Mars|cthe River Yarra|2me Before the Holiday|5by Christmas|5for Christmas|i|i|9the Holidays|4less at Christmas|9for the Holidays|2odoo McFiggin's Christmas|3sier Holiday|2pe for the Holidays|3py's Holiday|2t Pants Holiday|3el for the Holidays|2w the Grinch Stole Christmas|cgo Stole Christmas|8Toys Saved Christmas|8Wrong Brothers Saved Christmas|1usband's Holiday|0I'll Be Home for Christmas|q|cless for Christmas|8Next Door for Christmas|1f It Snows on Christmas|1nfernal Guidon, or Cossack Christmas|2spector Hornleigh on Holiday|aTahar's Holiday|1rving Berlin's Holiday Inn The Broadway Musical|1t's Christmas|e Again|0Jingle Jangle: A Christmas Journey|1ohnny Holiday|2urney to the Christmas Star|1ust Another Christmas|0Katherine Jenkins Christmas Spectacular|1eith Lowell Jensen: Atheist Christmas|1idnap - Bo's Most Exciting Holiday Ever|2ller Christmas|g Elves|7Holiday|7Raccoons! 2! Dark Christmas in the Dark!|6s on Holiday|2rk Cameron's Saving Christmas|2ss Me for Christmas|2wi Christmas|1nickerbocker Holiday|1rampus: The Christmas Devil|0Lacy's Christmas Do-Over|2dybirds' Christmas|2ssie: A Christmas Tail|3t Christmas|e|5Holiday|c|5Train to Christmas|1ena's Holiday|2t's Kill Grandpa This Christmas|3ters at Christmas|1illy's Bewitched Christmas|2ttle Brother, Big Trouble: A Christmas Adventure|1ondon Mitchell's Christmas|2st Christmas|5Holiday|5at Christmas|2ve, Guns & Christmas|0Mad Holiday|2gic Christmas Tree|2in Thing Holidays|2lou's Christmas|2ndie and the Forgotten Christmas|1editerranean Holiday|2gan's Christmas Miracle|2rcy Christmas|3ry Christmas|f|f Mr. Lawrence|kMo|gOctopus|hfficer Hansel|f, Yiwu|f... Happy New Year|6F@#$ing Christmas|6Mystery Christmas|2ssy Christmas|1id-year Holiday|3dleton Christmas|2racle on Christmas|2ss Me This Christmas|1omma Said Come Home for Christmas|2nsieur Hulot's Holiday|1r. Bean's Holiday|1ule-Tide Christmas|1y Christmas Fiancé|3Dad's Christmas Date|0National Lampoon's Christmas Vacation|1icholas on Holiday|2xon and Hogan Smoke Christmas|1o Good Deed: A Crowdfunding Holiday Heist|2thing Like the Holidays|8for Christmas|0Office Christmas Party|1h Deer: It's Christmas|1lympian Holiday|1n Holiday|2ce Upon a Time at Christmas|2e Crazy Christmas|4Delicious Christmas|4Hell of a Christmas|4Magic Christmas|1peration Christmas Drop|kList|aWhite Christmas|1ur Christmas Love Story|4Dream Christmas|4Happy Holiday|0Paris Holiday|2ssion Holiday|3tor Greg's Reboot - Hope for Christmas|1ee-wee's Big Holiday|2rfect Christmas|8Messy Holiday|3ilous Holiday|1ixi Saves Christmas|1rancer: A Christmas Tale|2oject: Puppies for Christmas|1uppy Star Christmas|0Red Christmas|d: Making 'Better Watch Out'|2kindling Christmas|2nfroe's Christmas|2porting for Christmas|1iffTrax Presents: Beyond Christmas|4trax: The Star Wars Holiday Special|1oman Holiday|2utine Holiday|1upert's Magic Christmas|2ssian Holiday|1yang-kang-do: Merry Christmas, North!|0Sailor's Holiday|2nta Stole Our Dog: A Merry Doggone Christmas!|7wap: Merry Christmas Mr. Andersen|5's Christmas Circus|iElf (Named Calvin)|2ve Christmas|3ing Christmas|g Spirit|1coot & Kassie's Christmas Adventure|2ream Queens' Naked Christmas|7for Christmas|4wed Up Christmas|3ooge: A Christmas Carol|1ecret Santa: A Christmas Adventure|2e You Next Christmas|1ilent Night: The Story of the First Christmas|2n Takes a Holiday|3ners' Holiday|1mart Christmas|1o This Is Christmas|2me Kind of Christmas!|1tab 3: Holiday Horror|2ella on Holiday|2olen Holiday|es|2range Holiday|1ummer Holiday|e|e|es|6time Christmas|2nday Holiday|2rviving Christmas|0Teddy's Christmas|2enage Girl: Valerie's Holiday|2ri Diwali Meri Christmas|1he 12 Slays of Christmas|4App That Stole Christmas|4Best Man Holiday|5orrowed Christmas|6y Who Saved Christmas|5usiness of Christmas|p 2|4CBeebies Christmas Show: Thumbelina|5hristmas Break|funny|eCabin|gndle|fhallenge|gronicles|o: Part Two|flapback|hssic|folt|eDoodle|fragon|eFamily|k 2|eGames|eKid|gng: In Full Armor|eMartian|firacle of Jonathan Toomey|eParty|gth|fitch|fledge|froject|l Reunion|eReunion|eSwitch|eTango|gpes|frap|gee|eVenue|5omic Book Christmas Caper|5rumbs - A Very Crumby Christmas|4Devil Takes a Holiday|9's Holiday|5rone that Saved Christmas|4Elf Who Stole Christmas|4Fitzgerald Family Christmas|5right Before Christmas|4Golden Holiday|6od Witch of Christmas|5rump Who Stole Christmas|4Holiday|b Calendar|cDating Guide|cFix Up|4Jinkx and DeLa Holiday Special|4Key to Christmas|7s of Christmas|5ing a Christmas Story from a Heavenly Perspective|5night Before Christmas|4Last Christmas Party|9Day of School Before Christmas|9Family Holidays|9Holiday|5east of These: A Christmas Story|6gend of the Christmas Witch|5ong Holiday|6ve of a King Christmas Movie Musical|4Magic of Christmas II|9al Christmas Tree|6n Who Invented Christmas|5uppet Christmas Carol|4Night Before Christmas|q|q|9mare Before Christmas|9s Before Christmas|4Perfect Holiday|5oor People's Christmas|4Story of Christmas|4Taste of Christmas|4Unattainably Perfect Gay Christmas|6ited States vs. Billie Holiday|6usual Calling of Charlie Christmas|4Wizard's Christmas|m: Return of the Snow King|5orst Christmas of My Life|4X Mas Files|2ief on Holiday|3s Christmas|5Is Christmas|8Our Christmas|2omas & Friends: A Very Thomas Christmas|7Kinkade's Christmas Cottage|2rowback Holiday|1in Holiday|1om and Jerry: Paws for a Holiday|1ropic Holiday|1uesday, After Christmas|1welve Days of Christmas|0Unforgetful Holiday|2invited for the Holidays|2nikrishnante Adyathe Christmas|2wrapping Christmas|0Walter & Tandoori's Christmas|1hat She Wants for Christmas|5We Did on Our Holiday|2ere Are You Going on Holiday?|2o Is Christmas Eve?|1ild Kratts: A Creature Christmas|3l It Snow for Christmas?|2ngs of Christmas|2sh for Christmas|1orst. Christmas. Ever.|0X-mas, Inc.|1mas Meier|5Without China|0You Can't Fight Christmas|3r Christmas or Mine?|0Zoey's Extraordinary Christmas|0#Xmas|0(RED) Shopathon Holiday Jingle|012 Dates of Christmas|4rinks of Christmas|3Gifts of Christmas|3Men of Christmas|3Tiny Christmas Tales|3Wishes of Christmas|02nd Chance for Christmas|03 Holiday Tails|048 Christmas Wishes|0A Baby Reindeer's First Christmas|7for Christmas|3eachcombers Christmas|5r's Christmas Tail|4rry Royal Christmas|3ig Fat Family Christmas|6Lego Christmas|4ltmore Christmas|3lue Ridge Mountain Christmas|3oyfriend for Christmas|3ramble House Christmas|4ide for Christmas|4ush with Christmas|2Cape Cod Christmas|4rol Christmas|3hance for Christmas|5rlie Brown Christmas|4eerful Christmas|5stnut Family Christmas|4ild's Christmas|j in Wales|jes in Wales|4ristmas Adventure|drrangement|cBlessing|dreak|cCalendar|fl|erol|h|h|h|h|h|h|h|h|h|h|h|h|h|h|h Goes Wrong|iat Ford's Theatre|h: The Musical|gusel|delebration: Send Round the Song|doincidence|eokie Catastrophe|druise|fsh|cDance Reunion|detour|dream|duet|cExchange|cFumble|ery|cKiss II|cLetter|dove Story|cMasque|irade|delody|emory|diracle for Daisy|ession|dovie Christmas|dystery|cPrincess|eoposal|cRecipe for Romance|eunion|domance|cSerenade|dpark|dtory|h Live!|eray|durprise|dwitch|cTail|dogether with You|dreasure|fe Grows in Colorado|cVillage|esitor|cWedding Date|kTail|dish|g in Hudson|ethout Snow|fness|cfor Boomer|gMary|gthe Ages|kBooks|cin Royal Fashion|fTennessee|fVermont|cto Cherish|fRemember|fTreasure|b... Present|3inderella Christmas|3lüsterfünke Christmas|3ookie Cutter Christmas|5l Like That Christmas|4smic Christmas|4untry Christmas Harmony|kStory|4wboy Christmas|4zy Christmas Inn|3rafty Christmas Romance|2Dad for Christmas|4sh of Christmas|4te by Christmas Eve|3ickens of a Holiday!|4sney Channel Christmas!!!!|4va's Christmas Carol|3og Named Christmas|3ream for Christmas|8of Christmas|2Fabled Holiday|4irly Odd Christmas|6y Tale Christmas|4mily Christmas Gift|aircus Christmas|9Reunion Christmas|3irehouse Christmas|3lintstone Christmas|dFamily Christmas|cs Christmas Carol|2Gert Lush Christmas|3ift Wrapped Christmas|7for Christmas|3lenbrooke Christmas|3odwink Christmas: Miracle of Love|lSecond Chance, First Love|4lden Christmas|i 3|3randfather for Christmas|4eat North Christmas|2Heartland Christmas|5venly Christmas|4idelberg Holiday|3obo's Christmas|4liday Homecoming|aRomance|aSpectacular|afor Love|ain Harlem|ato Remember|5lywood Christmas|4mecoming for the Holidays|3usband for Christmas|2Joyous Christmas|2Kindhearted Christmas|4smet Christmas|5s Before Christmas|7for Christmas|2Larceny Christmas|3ittle Christmas Charm|3ot Like Christmas|4ud House Christmas|2Magical Christmas Village|4jestic Christmas|4ple Valley Christmas|4rtian Christmas|3ermaid for Christmas|5ry Christmas Match|iWish|8Mirthworm Christmas|8Scottish Christmas|9ingle Christmas|8Tudor Christmas with Lucy Worsley|3iser Brothers' Christmas|3om for Christmas|3rs. Miracle Christmas|3uppet Family Christmas|8s Christmas: Letters to Santa|2Nanny for Christmas|4shville Christmas Carol|3ew Diva's Christmas Carol|6York Christmas Wedding|3ight at the Movies: Merry Christmas!|3orman Rockwell Christmas Story|4t So Royal Christmas|3utcracker Christmas|2Perfect Christmas|j List|3icture Perfect Holiday|4nk Christmas|3rince and Pauper Christmas|9for Christmas|8ss for Christmas|3uppy for Christmas|2Ring for Christmas|3ose for Christmas|4yal Christmas|h Ball|iCrush|iEngagement|iMatch|ion Ice|9orgi Christmas|8Date for Christmas|8Family Holiday|8Queens Christmas|3ugrats Kwanzaa Special|2Scooby-Doo! Christmas|3hoe Addict's Christmas|3isterly Christmas|3moky Mountain Christmas|3now Globe Christmas|7White Christmas|6y Christmas|3ong for Christmas|3pecial Sesame Street Christmas|3tar for Christmas|4orybook Christmas|3ugar & Spice Holiday|3weet Christmas Romance|2Tale of Two Christmases|4ste of Christmas|3imeless Christmas|4ny Home Christmas|3own Without Christmas|3udor Feast at Christmas|4na Christmas|3wist of Christmas|2VHS Christmas Carol|3ery Barry Christmas|8oy Band Holiday|8rady Christmas|9itish Christmas|7Charming Christmas Town|8orgi Christmas|9untry Christmas|o: Homecoming|7English Christmas|7Fairy Christmas|7Married Christmas|7Nutty Christmas|7Pink Christmas|7Retail Christmas|7Vintage Christmas|4teran's Christmas|3ineyard Christmas|2Wedding for Christmas|4lcome Home Christmas|4sley Christmas Wedding|3ind at My Back Christmas|4sh For Christmas|3orld Record Christmas|1bominable Christmas|1isle Be Home for Christmas|1liens First Christmas|2l About Christmas Eve|4I Didn't Want for Christmas|6Want for Christmas|o|o|4Saints Christmas|5he Wants for Christmas|4This, and Christmas Too!|2ways and Forever Christmas|1n Accidental Christmas|4merican Christmas Carol|cGirl Story: Maryellen 1955 - Extraordinary Christmas|cIdol Christmas|3Eclectic Christmas|4n Vogue Christmas|3Ice Wine Christmas|4talian Christmas with Mario and Giada|3Old Fashioned Christmas|3Unexpected Christmas|5remarkable Christmas|2dy Williams - Best of Christmas|2gel Falls Christmas|b: A Novel Holiday|6of Christmas|2other Christmas Coincidence|2ything But Christmas|1rthur's Perfect Christmas|1t Home for Christmas|0B.C.: A Special Christmas|1abar and Father Christmas|3y's First Christmas|2chelors Walk Christmas Special|2h, Humbug!: The Story of Charles Dickens' 'A Christmas Carol'|2king Christmas|2nking on Christmas|1eauty and the Beast: A Comic Relief Pantomime for Christmas|2nidorm: 10 Years on Holiday|3ji's Very Own Christmas Story|2st Christmas Party Ever|5Ever Christmas Films|1illie Holiday: A Sensation|2ng Crosby and the Sounds of Christmas|1lack Christmas|5adder's Christmas Carol|2ending Christmas|2inky Bill's White Christmas|2uetoes, the Christmas Elf|1ob Hope's Cross-Country Christmas|bOverseas Christmas Tours: Around the World with the Troops - 1941-1972|2yfriends of Christmas Past|1rer Rabbit's Christmas Carol|2ian Setzer: Christmas Extravaganza|3ng Back... The Christmas Number One|5ing Christmas Home|3tain's Favourite Christmas Songs|2oadcasting Christmas|1ugs Bunny's Holiday Diet|2sted: Christmas for Everyone|0CBeebies Christmas Panto 2010: Aladdin|1MA Country Christmas|1abbage Patch Kids: First Christmas|2mp Christmas|4fire Christmas|2ncel Christmas|3dy Cane Christmas|7oated Christmas|2role's Christmas|5s for Christmas|3ry on Again Christmas|9Christmas|i: Carry on Stuffing|2sper's First Christmas|2tch a Christmas Star|3ering Christmas|1eltic Thunder: Christmas|1handler Christmas Getaway|4ukah Stories|3rles Dickens & the Invention of Christmas|5ie and Lola Christmas Special|4ming Christmas|3sing Christmas|3teau Christmas|2eck Inn to Christmas|2ico Bon Bon and the Very Berry Holiday|2ristmas|9 9 to 5|aAngel|bround the Corner|aBedtime Stories|clle|fs|es Are Ringing|cneath the Stars|bounty|cx|break-In|aCEO|bamp|cper|crol|f|fe|dtoons: 14 Christmas Cartoon Classics - 2 Hours of Holiday Favorites|csanova|ctch|blass Reunion|bomes Home to Canaan|gTwice|gto PacLand|jWillow Creek|cnnection|cokie Challenge|gs|bracker|bupcakes|did|f's Arrow|aDance|bilemma|bo-Over|béjà Vu|aEncore|bve|d Dinner|eon Sesame Street|dr After|elasting|ey Day|aFestival of Ice|aGetaway|aHomecoming|ctel|aIcetastrophe|bncorporated|bs|c You|cland|aJars|boy|aKeepsake|aLand|bights|clies of the Field|cst|bodge|cst and Found|cve Letter|aMade to Order|cgic|ctchmakers|biracle in Caufield, U.S.A.|bovie Magic|aNext Door|bight with the Two Ronnies|aParty Crashers|ben Pals|crfection|blus One|brincess|aReservations|bush|aSail|bcavenger Hunt|bhe Wrote|bnow|bong|bpirit|gs|btars|aTakes Flight|bime Capsule|fIs Here|bogether|bree Lane|cuce|bwister|aUnder Wraps|gthe Stars|cwrapped|j: The History of Christmas|aVacation 2: Cousin Eddie's Island Adventure|aWafer|bedding Planner|iRunaway|bishes and Mistletoe Kisses|bonderland|aa la Mode|bnd the Civil War|bt Cadillac Jack's|frtwright's|fstle Hart|dDollywood|dGraceland|m: Home for the Holidays|gnd Valley|dHolly Lodge|fme|dMaple Creek|dPee-wee's Playhouse|fmberley Manor|dRiver Cottage|dWater's Edge|dthe Chalet|hDrive-In|hGolden Dragon|hPalace|ilaza|hRiviera|aby Chance|dDesign|dStarlight|afor Keeps|eSale|ain America|engel Falls|erabia|dBoston|dCanaan|eonnecticut|gway|dDisneyland|dEvergreen|m: Bells Are Ringing|oLetters to Santa|oTidings of Joy|dHarmony|fwaii|eomestead|dKabul|dLouisiana|fve|dMalibu|eississippi|eontana|ey Heart|dNotting Hill|dParis|eine Valley|dRockwell|fme|dScotland|dTahoe|fttertown|eoyland|eune|dVienna|dWashington|dthe Air|hCity|hHighlands|hRockies|aon 5th Avenue|dCandy Cane Lane|ehestnut Street|dDivision Street|dHolly Lane|fneysuckle Lane|dIce|dMistletoe Lake|ey Mind|dWheels|eindmill Way|dthe Alpaca Farm|hBayou|hFarm|hMenu|hRocks|hSlopes|hVine|awith Holly|fTucker|fa Kiss|hPrince|n: Becoming Royal|pThe Royal Baby|hView|fthe Darlings|jKing Family|jSex Pistols|ktars|6opher the Christmas Tree|b's Christmas Mission|1loudy with a Chance of Christmas|1oins for Christmas|2ming Home for Christmas|2oking Up Christmas|2ping with Christmas|2rrecting Christmas|2untry Christmas Album|8Hearts Christmas|3pled Up for Christmas|2yote Creek Christmas|1ranberry Christmas|3zy for Christmas|2eating Christmas|2oss Country Christmas|3wn Prince of Christmas|6for Christmas|1urious George: A Very Monkey Christmas|0Daddy Wanted for Christmas|2rci Lynne: My Hometown Christmas|3k Holiday|2shing Home for Christmas|2vid Letterman's 2nd Annual Holiday Film Festival|iHoliday Film Festival|1ear Christmas|3th Takes a Holiday|2liver by Christmas|2signing Christmas|3tined at Christmas|1isney Parks Presents a 25 Days of Christmas Holiday Party|dUnforgettable Christmas Celebration|1ognapped: Hound for the Holidays|3star: Christmas in Space|2lly Parton's Christmas of Many Colors: Circle of Love|fMountain Magic Christmas|2ra's Christmas Carol Adventure|2uble Holiday|0EastEnders Christmas Fall Outs|a: Christmas Party|1dith Ann's Christmas (Just Say Noël)|1ight Gifts of Hanukkah|1lf Pets: Santa's St. Bernards Save Christmas|4Sparkle Meets Christmas the Horse|2mo's Christmas Countdown|1mmet Otter's Jug-Band Christmas|1nchanted Christmas|2gaging Father Christmas|2tertaining Christmas|1ssential Poems for Christmas|1ve's Christmas|3ry Christmas Has a Story|6Day Is Christmas|5thing Christmas|1xtreme Christmas Trees|0Faith Heist: A Christmas Caper|2lling for Christmas|2mily for Christmas|2ther Christmas and the Missing Reindeer|7Knows Best: Home for Christmas|1eliz Christmas, Merry Navidad|1inding Christmas|8Father Christmas|8John Christmas|2rst Christmas|2t for Christmas|2ve Star Christmas|2xing Up Christmas|1lipping for Christmas|1or Better or for Worse: A Christmas Angel|3ever Christmas|2ur Christmases and a Wedding|1ree Rein: The Twelve Neighs of Christmas|1urry Little Christmas|0Gavin & Stacey: 12 Days of Christmas|1eorge and the Christmas Star|1hosting: The Spirit of Christmas|5s of Christmas Always|kPast|1iada's Italian Holiday|2rlfriends of Christmas Past|1ood Luck Charlie, It's Christmas!|5Morning Christmas!|1reatest Ever Christmas Movies|2ounded for Christmas|2umpy Cat's Worst Christmas Ever|7Old Men at Christmas|bWomen at Christmas|1uess Who's Coming for Christmas?|jto Christmas|0Hank Zipzer's Christmas Catastrophe|3ukkah on Rye|2ppy Christmas, Miss King|2ts Off to Christmas!|2ve I Got a Christmas for You|1e-Man and She-Ra: A Christmas Special|2adin' Home for the Holidays|3rt of the Holidays|5s of Christmas|2lp for the Holidays|1ip Hop Family Christmas|o Wedding|2s and Her Christmas|2t Mom: Murderous Christmas|3ched for the Holidays|1oliday Affair|e|8Date|8Engagement|8Heart|dbreak|ds|aritage|9igh School Reunion|9otline|8Joy|8Road|c Trip|8Spin|9witch|8Wishes|8for Heroes|8in Handcuffs|bSanta Fe|bYour Heart|3ly and Hal Moose: Our Uplifting Christmas Adventure|5's Holiday|2me Alone: The Holiday Heist|5for Christmas|i Day|9the Holidays|4: For the Holidays|4grown Christmas|4made Christmas|4town Christmas|9Holiday|2pe at Christmas|2t Chocolate Holiday|4Mess Holiday|2w to Fall in Love by Christmas|7Marry a Billionaire: A Christmas Tale|0I Love Lucy Christmas Special|2Want a Dog for Christmas, Charlie Brown|1'll Be Home for Christmas|q|2m Glad It's Christmas|4Not Ready for Christmas|1ce Age: A Mammoth Christmas|4Sculpture Christmas|1f I Only Had Christmas|1nheritance Up Christmas|2n Love by Christmas|2spector Gadget Saves Christmas|2venting the Christmas Prince|1t Happened One Christmas|3Nearly Wasn't Christmas|3Takes a Christmas Village|2's Beginning to Look a Lot Like Christmas|5Christmas, Carol!|gEve|5a Very Merry Muppet Christmas Movie|0Jingle & Bell's Christmas Star|1oe Pera Helps You Find the Perfect Christmas Tree|2hann's Gift to Christmas|3n Grin's Christmas|2lly Good Christmas|2nes Family Christmas|2urney Back to Christmas|8to Christmas|2y for Christmas|1ulie Andrews: The Sound of Christmas|2st Like a Christmas Movie|5in Time for Christmas|0Karen Kingsbury's Maggie's Christmas Miracle|3roll's Christmas|1enny & Dolly: A Christmas to Remember|6Everett's Christmas Carol|6Rogers: Keep Christmas with You|1irk Franklin's A Gospel Christmas|1ristin's Christmas Past|0LEGO Friends: Holiday Special|1adies of the '80s: A Divas Christmas|3y Day: The Many Faces of Billie Holiday|5Gaga & the Muppets' Holiday Spectacular|2mb Chop's Chanukah and Passover Surprise|cSpecial Chanukah|2rry the Cable Guy's Christmas Spectacular|mHula-Palooza Christmas Luau|2st Chance for Christmas|2ura's Christmas Star|1et's Go Luna!: Luna's Christmas Around the World|6Meet Again on Christmas Eve|1ights, Camera, Christmas!|2ttle Spirit: Christmas in New York|1ollipop Dragon: The Great Christmas Race|2nestar Christmas|3g Lost Christmas|2oks Like Christmas|2st Holiday: The Jim & Suzanne Shemwell Story|2uis Theroux's African Hunting Holiday|2ve Hina Christmas Special: Silent Eve|5You Like Christmas|5at the Christmas Contest|mTable|4's Christmas Journey|4, Lights, Hanukkah!|1ucky Christmas|3y Worsley's Christmas Carol Odyssey|0Madeline's Christmas|2gical Christmas Ornaments|iShoes|2rcus Welby, M.D.: A Holiday Affair|3iah Carey: Merry Christmas to You|4e Osmond's Merry Christmas|3ry Me This Christmas|9at Christmas|9for Christmas|6Us for Christmas|5ing Father Christmas|3y Christmas|2tchmaker Christmas|2xine's Christmas Carol|1e and Mr. Christmas|2et Me at Christmas|4ing Mr. Christmas|2mories of Christmas|2rry Christmas, Baby|hDrake & Josh|hGeorge Bailey|6Ex-Mas|6Liddle Christmas|m Baby|nWedding|6Magic Christmas|1ichael Bublé's Christmas in Hollywood|3ky Flanagan's Christmas|2d Life Christmas|2ss Christmas|3ter Magoo's Christmas Carol|1ole's Christmas|2m's Christmas Boyfriend|2use and Mole at Christmas Time|1r Bear's Christmas|2. Krueger's Christmas|4Willowby's Christmas Tree|1s. Christmas Comes to Town|4Velma's Most Incredibly Magnificent Christmas Week|1uch Ado About Christmas|2st Love Christmas|1y Best Friend's Christmas|3Christmas Dream|dFamily Tree|dGuide|dHero|dInn|dLove|dPrince|3Favorite Christmas Melody|mTree|4riends Tigger and Pooh - Super Sleuth Christmas Movie|3Grown-Up Christmas List|3Norwegian Holiday|3Southern Family Christmas|4weet Holiday|2stic Christmas|0Naked City: A Killer Christmas|2vigating Christmas|1early No Christmas|2stor, the Long-Eared Christmas Donkey|2ver Kiss a Man in a Christmas Sweater|2xt Stop, Christmas|1ickelodeon's Ho Ho Holiday Special|2lus the Sandman: The Boy Who Dreamed Christmas|1o Sleep 'Til Christmas|3Time Like Christmas|2rthern Lights of Christmas|5pole: Open for Christmas|2stalgic Christmas|2vember Christmas|0O Christmas Tree|1. Henry's Christmas|1dmori se, zasluzio si: Christmas Special|1h Christmas Tree!|1ld Vic: In Camera - A Christmas Carol|1n Christmas Eve|3Strike for Christmas|3the 12th Date of Christmas|72nd Day of Christmas|7Twelfth Day of Christmas|2ce Upon a Christmas|l Miracle|mTime|cHoliday|cSesame Street Christmas|2e Christmas|d Eve|eWish|4Fine Christmas|4Royal Holiday|4Starry Christmas|1pen by Christmas|3ration Christmas|1ur Christmas Journey|eLove Song|eMural|eWedding|4First Christmas|4Italian Christmas Memories|0Paris Christmas Waltz|1ete the Cat: A Very Groovy Christmas|4's Christmas|1icture Perfect Royal Christmas|8a Perfect Christmas|2nocchio's Christmas|1lanes, Trains, and Christmas Trees|1oinsettias for Christmas|2stman Pat's Magic Christmas|1roject Christmas Wish|0QTN Holiday Reel|0Radio Christmas|7ity Christmas Spectacular|2ndom Acts of Christmas|1ecipe for a Perfect Christmas|3ord Breaking Christmas|2d Boots for Christmas|3iscovering Christmas|2turn to Christmas Creek|2united at Christmas|1iffTrax Live: Christmas Shorts-stravaganza!|1oad to Christmas|2ck and Roll Christmas|4y Mountain Christmas|2lling Into Christmas|2man Holiday|2yal Family Christmas|5ly Wrapped for Christmas|8Yours, This Christmas|1udolph and Frosty's Christmas in July|2ff-Ruff, Tweet and Dave: A Christmas Adventure|2naway Christmas Bride|0Samantha: An American Girl Holiday|3e Time, Next Christmas|2nta Baby 2: Christmas Maybe|5's First Christmas|8Last Christmas|5bear's First Christmas|2ppy Holiday|2ving the Christmas Goose|2ying Yes to Christmas|1centsational Christmas|2rooge's Rock 'N' Roll Christmas|7: A Christmas Sarah|1econd Chance Christmas|2rving Up the Holidays|1haring Christmas|3un the Sheep: The Flight Before Christmas|2oelaces for Christmas|1igned, Sealed, Delivered for Christmas|2ster Swap: A Hometown Holiday|dChristmas in the City|1kinflint: A Country Christmas Carol|2yward Christmas|1mall Town Christmas|1nowbound for Christmas|4den's Christmas|4ed in for Christmas|6-Inn Christmas|1o Fly Christmas|2meday at Christmas|2und of Christmas|1potlight on Christmas|1taging Christmas|2ealing Christmas|3ppin' Into the Holiday|2ory of the Christmas Carol|2rawberry Shortcake's Perfect Holiday|2ubby Pringle's Christmas|1uicideGirls: UK Holiday|2n, Sex & Holiday Madness|3shine Christmas|2rviving the Holidays with Lewis Black|1weet Mountain Christmas|3pt Up by Christmas|2itched for Christmas|2orn Justice: Taken Before Christmas|0T.Bag's Christmas Carol|iDing Dong|iTurkey|1ake Me Back for Christmas|5Peace! A Corgi Cottage Christmas with Tasha Tudor|1errific Trucks Save Christmas|1he 12 Days of Christmas Eve|8isasters of Christmas|484th Annual Hollywood Christmas Parade|4Art of Christmas|4Bear Who Slept Through Christmas|8s Who Saved Christmas|6renstain Bears' Christmas Tree|6st Christmas Pageant Ever|5itch Who Stole Christmas|5oss Baby: Christmas Bonus|4Case for Christmas|9of the Christmas Diamond|7t of a Christmas Story: Where Are They Now?|6t in the Hat Knows a Lot About Christmas!|5hristmas Angel: A Story on Ice|funt|eBall|flessing|fow|eCard|fhalet|gecklist|goir|flause|gub|fonsultant|htest|iract|gttage|fure|eDoctor|eEdition|eGift|eHeart|figh Note|fope|gt Dog|guse|j 2: Deck Those Halls|eLetter|fisting|fottery|eMasterpiece|fessenger|eNote|eOrange|gnament|ePact|ggeant|grade|fromise|eRaccoons|fetreat|fing|eSecret|gtup|fhepherd|goes|fitters|fpirit|ftallion|hr|fwap|geater: A Return to Redemption|eTemp|fhief|foy|frain|gee|i|i|i Train|eWaltz|fife|gsh|eYule Blog|5ity That Forgot About Christmas|5omedy Christmas|6untry Mouse & the City Mouse: A Christmas Tale|6w That Almost Missed Christmas|5urse of Clara: A Holiday Tale|4Dangerous Christmas of Red Riding Hood|5og Days of Christmas|8Who Saved Christmas|r Vacation|ithe Holidays|4Elf Who Saved Christmas|5nchanted Christmas Cake|4Fabric of Christmas|6t Albert Christmas Special|5ilmmaker's Holiday|6rst Christmas|j: The Story of the First Christmas Snow|5light Before Christmas|5unny Side of Christmas|4GLO Friends Save Christmas|5ift of Christmas|cLove: A Christmas Story|5reat American Christmas|aChristmas Movies|kSwitch|aHoliday Bake War|9est Christmas Moments of All Time!|4Heart of Christmas|6iress of Christmas|5oliday Sitter|dtocking|dwap|6mecoming: A Christmas Story|6use Without a Christmas Tree|4Kacey Musgraves Christmas Show|5id Who Loved Christmas|4Last Christmas Home|5ego Star Wars Holiday Special|6prechauns' Christmas Gold|5ight Before Christmas|6ttle Crooked Christmas Tree|bRascals' Christmas Special|4Making of 'the Nightmare Before Christmas'|6ltese Holiday|6n Who Saved Christmas|6rch Sisters at Christmas|5onster's Christmas|6o Family Holiday Hoe-Down|5unsters' Scary Little Christmas|4Nick at Nite Holiday Special|6ght B4 Christmas|before Christmas|q Carol|hthe Night Before Christmas|aThey Saved Christmas|6ne Kittens of Christmas|9Lives of Christmas|4Perfect Christmas Present|5icture of Christmas|4Queen's Christmas Broadcast 2019|4Real Story of Christmas|5oad Home for Christmas|6oftop Christmas Tree|4Secret Story of the BBC Christmas Tapes|5ide Show Christmas|5murfs Christmas Special|5pirit of Christmas|n|5tar Wars Holiday Special|5weetest Christmas|4Teddy Bears' Christmas|5own Christmas Forgot|6ys That Made Christmas|5railer Park Boys Christmas Special|6ee That Saved Christmas|6olls and the Christmas Express|6ue Meaning of Christmas Specials|7th About Christmas|5welve Days of Christmas Eve|bTrees of Christmas|4Ugly Duckling's Christmas Wish|5ltimate Christmas Present|4Wish That Changed Christmas|1im Vine Travels Through Time Christmas Special|3e for Her to Come Home for Christmas|aim to Come Home for Christmas|9Me to Come Home for Christmas|9Them to Come Home for Christmas|9Us to Come Home for Christmas|9You to Come Home for Christmas|3othy Tweedle the First Christmas Elf|2ny Christmas|1om and Jerry Christmas Special|3's Christmas Tree|2o Close For Christmas|2ying with the Holidays|1rading Christmas|3ns-Siberian Orchestra: The Ghosts of Christmas Eve|2olls Holiday|e in Harmony|1ukiki and His Search for a Merry Christmas|1was the Chaos before Christmas|9Night Before Christmas|9Text Before Christmas|2ice Upon a Christmas|2o Movie Guys' Intergalactic Holiday Showdown|0USS Christmas|1nPerfect Christmas Wish|2cle Wormsley's Christmas|2der the Christmas Sky|kTree|5cover Christmas|bHoliday|2locking Christmas|0Very Cool Christmas|0We Need A Little Christmas|3Wish You a Married Christmas|2lcome to Christmas|bthe Christmas Family Reunion|3l Suited for Christmas|1hat Have You Done?: The Remaking of 'Black Christmas'|2en Christmas Goes Horribly Wrong|fWas Young|5I Think of Christmas|3re Are You, Christmas?|2ite Christmas|1innie the Pooh & Christmas Too|2sh Upon a Christmas|2th Love, Christmas|1rapped Up in Christmas|2ite Before Christmas|4ing Around the Christmas Tree|0Yogi Bear's All-Star Comedy Christmas Caper|4's First Christmas|2u Light Up My Christmas|3, Me & the Christmas Trees|3ng Pioneers' Christmas|0hoops&yoyo Ruin Christmas|0'Twas the Night Before Christmas|1White Christmas': A Look Back with Rosemary Clooney|01-800 XMAS|1982 Burger King Christmas Commercial with Lea Thompson, Elisabeth Shue and Sarah Michelle Gellar|0A Bing Crosby Christmas|2Charlie Brown Kwanzaa|4ristmas Adventure ...From a Book Called Wisely's Tales|cCarl|fol|h|h|h|delebration: Live from Dublin|cEve Conversation with Quentin Tarantino & Paul Thomas Anderson|cMiracle: The Making of a Charlie Brown Christmas|cStory 2|cToo Many|3inderella Story: Christmas Wish|3lassic Christmas from the Ed Sullivan Show|2Dennis the Menace Christmas|2Frozen Christmas Carol|2Grinch Christmas Carol|2Holiday Party Starring Alexandra Daddario|2Kwekwe Christmas Carol|2Sesame Street Christmas Carol|2Very Beazley Christmas|7Troma Christmas|7Wompkee Christmas|2Walt Disney Christmas|3owieBozowee Christmas|1dventures in Odyssey: Electric Christmas|1led's Christmas Carols|2l I Want for Christmas Is You|2one for Christmas|1n All Dogs Christmas Carol|4ngel for Christmas|3Ex-Hooker's Christmas Carol|3X-Mas Message from David X. Cohen|2gry Office Christmas Party|2other Christmas Story|1pollo 8: Christmas at the Moon|1sda 'Have your Elf a Merry Christmas'|1unty Donna: Always Room for Christmas Pud|0BBC One Christmas 2017: The Supporting Act|1TS: Dynamite (Holiday Remix)|1ad Santa: Not Your Typical Christmas Movie|2h Humduck!: A Looney Tunes Christmas|2rbie in 'A Christmas Carol'|6: A Perfect Christmas|3ney's Christmas Star|9Holiday Extravaganza|9Night Before Christmas|6: A Very Merry Christmas: The Movie|1eauty and the Beast: The Enchanted Christmas|2cause It's Christmas: Barry Manilow|2ethoven's Christmas Adventure|1ikini Bloodbath Christmas|2llie Holiday: The Ultimate Collection|1lack Christmas Legacy|gRevisited|1ob the Builder: A Christmas to Remember|1ratz Babyz Save Christmas|1uck Denver Asks... Why Do We Call It Christmas?|2ffy the Vampire Slayer: 1-800 Collect 'A Buffy Christmas' Commercial|0Caillou's Holiday Movie|2pitol One: Christmas Ad|2sper's Haunted Christmas|1eltic Woman: Home for Christmas - Live from Dublin|1hilly Christmas|2ristmas Bone Us|aCar|brash|aDay|belivery|cmolition|bress|aGone Viral|aIs Here Again|aMission|aTime in South Park|bown|brade|cuce of 1914|afrom Hollywood|ain Cartoontown|dJanuary|dOz|dSouth Park|dTinseltown|awith RiffTrax Featuring Magic Christmas Tree|1lassic Christmas|1ool Cat in the Hollywood Christmas Parade|2ronation Street: Romanian Holiday|0D'Astrain No Cinema - Christmas Special|1avey & Goliath's Snowboard Christmas|1eadly Little Christmas|1isney Channel Holiday|7Princess: A Christmas of Enchantment|7Sing-Along-Songs: The Twelve Days of Christmas|pVery Merry Christmas Songs|6's Christmas Favorites|1octor Who: A Ghost Story for Christmas|2t & Spot's Magical Christmas Adventure|1reamWorks Holiday Classics|0Electric Holiday|2mo's World: Happy Holidays!|1mmet's Holiday Party: A Lego Movie Short|1verything is Terrible! Holiday Special|1x-Mas Eve|0Fay's 12 Days of Christmas|1elix the Cat Saves Christmas|1our Christmases: Gag Reel|iHoliday Moments|1ramed for the Holidays|3ncesco's Friendly World: The Gifts of Christmas|4klin's Magic Christmas|2ed Hammond's Christmas... Who Needs It|2iendly Monsters: A Monster Christmas|0Hanukkah Tales and Tunes|8, O Hanukkah (A Magical Time of Year)|1ermie & Friends: A Fruitcake Christmas|1o Ho Nooooooo!!! It's Mr. Bill's Christmas Special!|2liday Hypnosis|8in the Sun|6ze: The Christmas That Almost Didn't Happen|2w the Grinch Stole Christmas!|u: Makeup Application and Design|wWho School|0Ice Age: A Mammoth Christmas Swingin' Jingle Bells Music Video|1n the Christmas Spirit|1t's a Hi-5 Christmas|0Jim and Them Holiday Specials|1ohnson Family Christmas Dinner|1ubilee and Elmer Holiday Adventures: Special Edition|0Kathie Lee's Rock n' Tots Cafe: A Christmas 'Giff'|1ids on Christmas|4ongs: We Wish You a Merry Christmas|0Last Christmas: Emilia Sings|1eapFrog: A Tad of Christmas Cheer|2go Star Wars: Christmas Special|1ittle Angels: The Brightest Christmas|7Orphan Annie's A Very Animated Christmas|0Mannheim Steamroller: Christmas Live|2y All Your Christmases Be Black|1ickey's Magical Christmas: Snowed in at the House of Mouse|9Once Upon a Christmas|9Twice Upon a Christmas|2ghty Morphin Power Rangers: Alpha's Magical Christmas|1orecambe & Wise Christmas Cracker|1r. Bean's Holiday: Beans in Cannes|kFrench Beans|kThe Human Bean|4Christmas|1y Christmas Soldier|3Dog's Christmas Miracle|3Friends Tigger and Pooh Super Sleuth Christmas Movie: 100 Acre Wood Downhill Challenge|3Little Pony: A Very Minty Christmas|0NLO Spirit of Christmas|1ick Jr. Favorites Holiday|2ne Dog Christmas|1oddy Saves Christmas|2ra's Christmas Gift|0OVW: Christmas Chaos|1ffice Christmas Party: Throwing an Office Christmas Party|1n Holiday with Timon & Pumbaa|0Peppa Pig: Peppa's Christmas|1layboy Wet & Wild: Hot Holidays|1unitive psychiatry: Antichristmas|2ppy for Hanukkah|0Quail's First Christmas|0Ray Charles Celebrates Gospel Christmas with the Voices of Jubilation|1ecess Christmas: Miracle on Third Street|2membering 'Roman Holiday'|2storing Roman Holiday|2tro Christmas Classics|1ichie Rich's Christmas Wish|2fftrax: A Christmas Carol|aChristmas Circus|0Sainsbury's: Mog's Christmas Calamity|2nta Claus Versus the Christmas Vixens|6Preys for X-mas|1cooby-Doo! Haunted Holidays|a: 13 Spooky Tales - Holiday Chills and Thrills|2rooge by Another Name: Distributing 'A Christmas Carol'|1esame Street: Elmo Saves Christmas|1oylent Scrooge: Or, Christmas Is Made of People|1pacemen, Go-go Girls and the True Meaning of Christmas|2ot's Magical Christmas|4light on Location: The Making of 'How the Grinch Stole Christmas'|1tefan Molyneux's Eight Hour Christmas Spectacular|0TBS Wrecked: Christmas Killer|1ales from the Grave, Volume 2: Happy Holidays|1eletubbies: Christmas in the Snow|dMerry Christmas, Teletubbies!|1hat '70s Show: Holiday Edition|2e 12 Days of 'Black Christmas'|8ogs of Christmas|4Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper|4Badly Animated Marvel Christmas Carol|4Candy Maker's Christmas|5hristmas Brigade|eDinosaur|eElves|eLight|eSeason Massacre|ftory Keepers|eThat Almost Wasn't|4Flintstones Christmas in Bedrock|4Hypothetical Star Wars Holiday Special|4Kudzu Christmas|4Lady Bruins Christmas Slumber Party|4Making of Tim Burton's 'The Nightmare Before Christmas'|5uppet Christmas Carol: Frogs, Pigs and Humbug - Unwrapping a New Holiday Classic|4Night Before Christmas|q: A Mouse Tale|9mare Before Christmas in Concert|zoncert at the Hollywood Bowl|u: The Original Poem|5utcracker: A Christmas Story|4Oshima Gang: The Making of 'Merry Christmas Mr. Lawrence'|4Powerpuff Girls: 'Twas the Fight Before Christmas|4Real Story of O Christmas Tree|4Swan Princess: Christmas|4Tangerine Bear: Home in Time for Christmas!|5own That Outlawed Christmas|4Untold Christmas Story|4Wiggles: It's Always Christmas with You!|dWiggly, Wiggly Christmas!|4twelve days of Christmas|2omas & Friends: Merry Christmas, Thomas!|iThe Christmas Engines|komas' Christmas Carol|qHoliday Collection|1immy's Gift: A Precious Moments Christmas|8Special Delivery: A Precious Moments Christmas|1oot & Puddle: I'll Be Home for Christmas|0VHS Christmas Carol: Live!|1astra Investigates: A Christmas Prequel|1eggieTales: Merry Larry and the True Light of Christmas|dThe Star of Christmas|hToy That Saved Christmas|0WWE Ring in the Holiday|1e Wish You a Merry Christmas|eTurtle Christmas|1inslow the Christmas Bear|0Yoda Baby: a Very Merry Mandalorian Christmas|2u're Invited to Mary-Kate & Ashley's Christmas Party|0kiss×sis: Christmas for Two","sep":"|"}]}]);
const COLONY = [
{"id":"n-6d5c3a0f","guard":[["has","title"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of The Kacey Musgraves Christmas Show":"The title type of The Kacey Musgraves Christmas Show is tvMovie.","tell me the title type of Merry Christmas, Yiwu":"The title type of Merry Christmas, Yiwu is movie.","name the title type of Christmas with the Dead":"The title type of Christmas with the Dead is movie.","what is the title type of Holiday Hotel":"The title type of Holiday Hotel is movie.","tell me the title type of The Nine Lives of Christmas":"The title type of The Nine Lives of Christmas is tvMovie.","name the title type of Forever Christmas":"The title type of Forever Christmas is tvMovie.","what is the title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972":"The title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972 is tvMovie.","tell me the title type of Girlfriends of Christmas Past":"The title type of Girlfriends of Christmas Past is tvMovie.","name the title type of A Christmas Dream":"The title type of A Christmas Dream is tvMovie.","what is the title type of A Christmas Prince: The Royal Baby":"The title type of A Christmas Prince: The Royal Baby is movie.","tell me the title type of The Christmas Bunny":"The title type of The Christmas Bunny is movie.","name the title type of Miracle on Christmas":"The title type of Miracle on Christmas is movie.","what is the title type of Royally Yours, This Christmas":"The title type of Royally Yours, This Christmas is tvMovie.","tell me the title type of The Hypothetical Star Wars Holiday Special":"The title type of The Hypothetical Star Wars Holiday Special is video.","name the title type of Walter & Tandoori's Christmas":"The title type of Walter & Tandoori's Christmas is movie.","what is the title type of 12 Dog Days Till Christmas":"The title type of 12 Dog Days Till Christmas is movie.","tell me the title type of Disney Channel Holiday":"The title type of Disney Channel Holiday is video.","name the title type of Crown for Christmas":"The title type of Crown for Christmas is tvMovie.","what is the title type of A Not So Merry Christmas":"The title type of A Not So Merry Christmas is movie.","tell me the title type of Christmas with a Prince: The Royal Baby":"The title type of Christmas with a Prince: The Royal Baby is tvMovie.","name the title type of Spotlight on Christmas":"The title type of Spotlight on Christmas is tvMovie.","what is the title type of Christmas Together":"The title type of Christmas Together is tvMovie.","tell me the title type of Johann's Gift to Christmas":"The title type of Johann's Gift to Christmas is tvMovie.","name the title type of Project: Puppies for Christmas":"The title type of Project: Puppies for Christmas is movie.","what is the title type of A Star for Christmas":"The title type of A Star for Christmas is tvMovie.","tell me the title type of Christmas at the Riviera":"The title type of Christmas at the Riviera is tvMovie.","name the title type of The Christmas Lottery":"The title type of The Christmas Lottery is tvMovie.","what is the title type of A Brush with Christmas":"The title type of A Brush with Christmas is tvMovie.","tell me the title type of Barbie: A Perfect Christmas":"The title type of Barbie: A Perfect Christmas is video.","name the title type of A Christmas Village":"The title type of A Christmas Village is tvMovie.","what is the title type of The King a Christmas Story from a Heavenly Perspective":"The title type of The King a Christmas Story from a Heavenly Perspective is movie.","tell me the title type of Friendly Monsters: A Monster Christmas":"The title type of Friendly Monsters: A Monster Christmas is video.","name the title type of Holidays in Amsterdam":"The title type of Holidays in Amsterdam is movie.","what is the title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper":"The title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper is video.","tell me the title type of Mr. Bean's Holiday: The Human Bean":"The title type of Mr. Bean's Holiday: The Human Bean is video.","name the title type of A Christmas Cookie Catastrophe":"The title type of A Christmas Cookie Catastrophe is tvMovie.","what is the title type of Navigating Christmas":"The title type of Navigating Christmas is tvMovie.","tell me the title type of Christmas with the Karountzoses":"The title type of Christmas with the Karountzoses is movie.","name the title type of Hanukkah Tales and Tunes":"The title type of Hanukkah Tales and Tunes is video.","what is the title type of The Elf Who Stole Christmas":"The title type of The Elf Who Stole Christmas is movie."}}},
{"id":"n-548fcea1","guard":[["has","title"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"type"}]]],"mem":{"table":{"of The Kacey Musgraves Christmas Show":"The title type of The Kacey Musgraves Christmas Show is tvMovie.","of Merry Christmas, Yiwu":"The title type of Merry Christmas, Yiwu is movie.","of Christmas with the Dead":"The title type of Christmas with the Dead is movie.","of Holiday Hotel":"The title type of Holiday Hotel is movie.","of The Nine Lives of Christmas":"The title type of The Nine Lives of Christmas is tvMovie.","of Forever Christmas":"The title type of Forever Christmas is tvMovie.","of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972":"The title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972 is tvMovie.","of Girlfriends of Christmas Past":"The title type of Girlfriends of Christmas Past is tvMovie.","of A Christmas Dream":"The title type of A Christmas Dream is tvMovie.","of A Christmas Prince: The Royal Baby":"The title type of A Christmas Prince: The Royal Baby is movie.","of The Christmas Bunny":"The title type of The Christmas Bunny is movie.","of Miracle on Christmas":"The title type of Miracle on Christmas is movie.","of Royally Yours, This Christmas":"The title type of Royally Yours, This Christmas is tvMovie.","of The Hypothetical Star Wars Holiday Special":"The title type of The Hypothetical Star Wars Holiday Special is video.","of Walter & Tandoori's Christmas":"The title type of Walter & Tandoori's Christmas is movie.","of 12 Dog Days Till Christmas":"The title type of 12 Dog Days Till Christmas is movie.","of Disney Channel Holiday":"The title type of Disney Channel Holiday is video.","of Crown for Christmas":"The title type of Crown for Christmas is tvMovie.","of A Not So Merry Christmas":"The title type of A Not So Merry Christmas is movie.","of Christmas with a Prince: The Royal Baby":"The title type of Christmas with a Prince: The Royal Baby is tvMovie.","of Spotlight on Christmas":"The title type of Spotlight on Christmas is tvMovie.","of Christmas Together":"The title type of Christmas Together is tvMovie.","of Johann's Gift to Christmas":"The title type of Johann's Gift to Christmas is tvMovie.","of Project: Puppies for Christmas":"The title type of Project: Puppies for Christmas is movie.","of A Star for Christmas":"The title type of A Star for Christmas is tvMovie.","of Christmas at the Riviera":"The title type of Christmas at the Riviera is tvMovie.","of The Christmas Lottery":"The title type of The Christmas Lottery is tvMovie.","of A Brush with Christmas":"The title type of A Brush with Christmas is tvMovie.","of Barbie: A Perfect Christmas":"The title type of Barbie: A Perfect Christmas is video.","of A Christmas Village":"The title type of A Christmas Village is tvMovie.","of The King a Christmas Story from a Heavenly Perspective":"The title type of The King a Christmas Story from a Heavenly Perspective is movie.","of Friendly Monsters: A Monster Christmas":"The title type of Friendly Monsters: A Monster Christmas is video.","of Holidays in Amsterdam":"The title type of Holidays in Amsterdam is movie.","of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper":"The title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper is video.","of Mr. Bean's Holiday: The Human Bean":"The title type of Mr. Bean's Holiday: The Human Bean is video.","of A Christmas Cookie Catastrophe":"The title type of A Christmas Cookie Catastrophe is tvMovie.","of Navigating Christmas":"The title type of Navigating Christmas is tvMovie.","of Christmas with the Karountzoses":"The title type of Christmas with the Karountzoses is movie.","of Hanukkah Tales and Tunes":"The title type of Hanukkah Tales and Tunes is video.","of The Elf Who Stole Christmas":"The title type of The Elf Who Stole Christmas is movie."}}},
{"id":"n-5655ea9e","guard":[["has","title"],["has","type"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"The Kacey Musgraves Christmas Show":"The title type of The Kacey Musgraves Christmas Show is tvMovie.","Merry Christmas, Yiwu":"The title type of Merry Christmas, Yiwu is movie.","Christmas with the Dead":"The title type of Christmas with the Dead is movie.","Holiday Hotel":"The title type of Holiday Hotel is movie.","The Nine Lives of Christmas":"The title type of The Nine Lives of Christmas is tvMovie.","Forever Christmas":"The title type of Forever Christmas is tvMovie.","Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972":"The title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972 is tvMovie.","Girlfriends of Christmas Past":"The title type of Girlfriends of Christmas Past is tvMovie.","A Christmas Dream":"The title type of A Christmas Dream is tvMovie.","A Christmas Prince: The Royal Baby":"The title type of A Christmas Prince: The Royal Baby is movie.","The Christmas Bunny":"The title type of The Christmas Bunny is movie.","Miracle on Christmas":"The title type of Miracle on Christmas is movie.","Royally Yours, This Christmas":"The title type of Royally Yours, This Christmas is tvMovie.","The Hypothetical Star Wars Holiday Special":"The title type of The Hypothetical Star Wars Holiday Special is video.","Walter & Tandoori's Christmas":"The title type of Walter & Tandoori's Christmas is movie.","12 Dog Days Till Christmas":"The title type of 12 Dog Days Till Christmas is movie.","Disney Channel Holiday":"The title type of Disney Channel Holiday is video.","Crown for Christmas":"The title type of Crown for Christmas is tvMovie.","A Not So Merry Christmas":"The title type of A Not So Merry Christmas is movie.","Christmas with a Prince: The Royal Baby":"The title type of Christmas with a Prince: The Royal Baby is tvMovie.","Spotlight on Christmas":"The title type of Spotlight on Christmas is tvMovie.","Christmas Together":"The title type of Christmas Together is tvMovie.","Johann's Gift to Christmas":"The title type of Johann's Gift to Christmas is tvMovie.","Project: Puppies for Christmas":"The title type of Project: Puppies for Christmas is movie.","A Star for Christmas":"The title type of A Star for Christmas is tvMovie.","Christmas at the Riviera":"The title type of Christmas at the Riviera is tvMovie.","The Christmas Lottery":"The title type of The Christmas Lottery is tvMovie.","A Brush with Christmas":"The title type of A Brush with Christmas is tvMovie.","Barbie: A Perfect Christmas":"The title type of Barbie: A Perfect Christmas is video.","A Christmas Village":"The title type of A Christmas Village is tvMovie.","The King a Christmas Story from a Heavenly Perspective":"The title type of The King a Christmas Story from a Heavenly Perspective is movie.","Friendly Monsters: A Monster Christmas":"The title type of Friendly Monsters: A Monster Christmas is video.","Holidays in Amsterdam":"The title type of Holidays in Amsterdam is movie.","The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper":"The title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper is video.","Mr. Bean's Holiday: The Human Bean":"The title type of Mr. Bean's Holiday: The Human Bean is video.","A Christmas Cookie Catastrophe":"The title type of A Christmas Cookie Catastrophe is tvMovie.","Navigating Christmas":"The title type of Navigating Christmas is tvMovie.","Christmas with the Karountzoses":"The title type of Christmas with the Karountzoses is movie.","Hanukkah Tales and Tunes":"The title type of Hanukkah Tales and Tunes is video.","The Elf Who Stole Christmas":"The title type of The Elf Who Stole Christmas is movie."}}},
{"id":"n-c6aa5113","guard":[["has","title"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"title"}]]],"mem":{"table":{"type of The Kacey Musgraves Christmas Show":"The title type of The Kacey Musgraves Christmas Show is tvMovie.","type of Merry Christmas, Yiwu":"The title type of Merry Christmas, Yiwu is movie.","type of Christmas with the Dead":"The title type of Christmas with the Dead is movie.","type of Holiday Hotel":"The title type of Holiday Hotel is movie.","type of The Nine Lives of Christmas":"The title type of The Nine Lives of Christmas is tvMovie.","type of Forever Christmas":"The title type of Forever Christmas is tvMovie.","type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972":"The title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972 is tvMovie.","type of Girlfriends of Christmas Past":"The title type of Girlfriends of Christmas Past is tvMovie.","type of A Christmas Dream":"The title type of A Christmas Dream is tvMovie.","type of A Christmas Prince: The Royal Baby":"The title type of A Christmas Prince: The Royal Baby is movie.","type of The Christmas Bunny":"The title type of The Christmas Bunny is movie.","type of Miracle on Christmas":"The title type of Miracle on Christmas is movie.","type of Royally Yours, This Christmas":"The title type of Royally Yours, This Christmas is tvMovie.","type of The Hypothetical Star Wars Holiday Special":"The title type of The Hypothetical Star Wars Holiday Special is video.","type of Walter & Tandoori's Christmas":"The title type of Walter & Tandoori's Christmas is movie.","type of 12 Dog Days Till Christmas":"The title type of 12 Dog Days Till Christmas is movie.","type of Disney Channel Holiday":"The title type of Disney Channel Holiday is video.","type of Crown for Christmas":"The title type of Crown for Christmas is tvMovie.","type of A Not So Merry Christmas":"The title type of A Not So Merry Christmas is movie.","type of Christmas with a Prince: The Royal Baby":"The title type of Christmas with a Prince: The Royal Baby is tvMovie.","type of Spotlight on Christmas":"The title type of Spotlight on Christmas is tvMovie.","type of Christmas Together":"The title type of Christmas Together is tvMovie.","type of Johann's Gift to Christmas":"The title type of Johann's Gift to Christmas is tvMovie.","type of Project: Puppies for Christmas":"The title type of Project: Puppies for Christmas is movie.","type of A Star for Christmas":"The title type of A Star for Christmas is tvMovie.","type of Christmas at the Riviera":"The title type of Christmas at the Riviera is tvMovie.","type of The Christmas Lottery":"The title type of The Christmas Lottery is tvMovie.","type of A Brush with Christmas":"The title type of A Brush with Christmas is tvMovie.","type of Barbie: A Perfect Christmas":"The title type of Barbie: A Perfect Christmas is video.","type of A Christmas Village":"The title type of A Christmas Village is tvMovie.","type of The King a Christmas Story from a Heavenly Perspective":"The title type of The King a Christmas Story from a Heavenly Perspective is movie.","type of Friendly Monsters: A Monster Christmas":"The title type of Friendly Monsters: A Monster Christmas is video.","type of Holidays in Amsterdam":"The title type of Holidays in Amsterdam is movie.","type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper":"The title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper is video.","type of Mr. Bean's Holiday: The Human Bean":"The title type of Mr. Bean's Holiday: The Human Bean is video.","type of A Christmas Cookie Catastrophe":"The title type of A Christmas Cookie Catastrophe is tvMovie.","type of Navigating Christmas":"The title type of Navigating Christmas is tvMovie.","type of Christmas with the Karountzoses":"The title type of Christmas with the Karountzoses is movie.","type of Hanukkah Tales and Tunes":"The title type of Hanukkah Tales and Tunes is video.","type of The Elf Who Stole Christmas":"The title type of The Elf Who Stole Christmas is movie."}}},
{"id":"n-eed7cc5a","guard":[["hasAny",["around","brush","catastrophe","crown","dream","forever","gift","girlfriends","kacey","lives","lottery","navigating","riviera","royally","spotlight","together","village"]],["has","type"]],"pyramid":["render.template",{"lit":["The title ",{"slot":0}," is tvMovie."]},["sense.after",{"lit":"title"}]],"mem":null},
{"id":"n-69ba0558","guard":[["has","title"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the title type of The Kacey Musgraves Christmas Show":"The title type of The Kacey Musgraves Christmas Show is tvMovie.","the title type of Holiday Hotel":"The title type of Holiday Hotel is movie.","the title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972":"The title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972 is tvMovie.","the title type of A Christmas Prince: The Royal Baby":"The title type of A Christmas Prince: The Royal Baby is movie.","the title type of Royally Yours, This Christmas":"The title type of Royally Yours, This Christmas is tvMovie.","the title type of 12 Dog Days Till Christmas":"The title type of 12 Dog Days Till Christmas is movie.","the title type of A Not So Merry Christmas":"The title type of A Not So Merry Christmas is movie.","the title type of Christmas Together":"The title type of Christmas Together is tvMovie.","the title type of A Star for Christmas":"The title type of A Star for Christmas is tvMovie.","the title type of A Brush with Christmas":"The title type of A Brush with Christmas is tvMovie.","the title type of The King a Christmas Story from a Heavenly Perspective":"The title type of The King a Christmas Story from a Heavenly Perspective is movie.","the title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper":"The title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper is video.","the title type of Navigating Christmas":"The title type of Navigating Christmas is tvMovie.","the title type of The Elf Who Stole Christmas":"The title type of The Elf Who Stole Christmas is movie."}}},
{"id":"n-807f0a40","guard":[["hasAny",["catastrophe","crown","dream","forever","lottery","spotlight","village"]],["has","type"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is tvMovie."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"title"}]],"mem":null},
{"id":"n-abbbc8a4","guard":[["hasAny",["amsterdam","dead","miracle","project","tandooris"]],["has","type"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is movie."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"title"}]],"mem":null},
{"id":"n-0792ea3a","guard":[["hasAny",["elf","item number","nth","position"]],["has","type"]],"pyramid":["render.template",{"lit":["The title type of The Elf Who Stole Christmas is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-16642a79","guard":[["hasAny",["heavenly","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The title type of The King a Christmas Story from a Heavenly Perspective is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-221285d4","guard":[["hasAny",["bunny","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The title type of The Christmas Bunny is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-3ad19599","guard":[["hasAny",["girlfriends","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The title type of Girlfriends of Christmas Past is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-3b781d4a","guard":[["hasAny",["hypothetical","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The title type of The Hypothetical Star Wars Holiday Special is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-489546da","guard":[["hasAny",["item number","navigating","nth","position"]]],"pyramid":["render.template",{"lit":["The title type of Navigating Christmas is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-4e6f049a","guard":[["hasAny",["barbie","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The title type of Barbie: A Perfect Christmas is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-50ac6e2b","guard":[["hasAny",["item number","nth","position","yiwu"]]],"pyramid":["render.template",{"lit":["The title type of Merry Christmas, Yiwu is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-63476e56","guard":[["hasAny",["bean","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The title type of Mr. Bean's Holiday: The Human Bean is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-77209cfd","guard":[["hasAny",["item number","lives","nth","position"]]],"pyramid":["render.template",{"lit":["The title type of The Nine Lives of Christmas is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-8076ef98","guard":[["hasAny",["gift","item number","nth","position"]],["has","type"]],"pyramid":["render.template",{"lit":["The title type of Johann's Gift to Christmas is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-9e44060e","guard":[["hasAny",["hotel","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The title type of Holiday Hotel is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-9ec301ad","guard":[["hasAny",["channel","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The title type of Disney Channel Holiday is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-a2fec1cc","guard":[["hasAny",["brush","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The title type of A Brush with Christmas is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-a8a1c5aa","guard":[["hasAny",["item number","nth","position","royally"]]],"pyramid":["render.template",{"lit":["The title type of Royally Yours, This Christmas is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-b3c0bcf9","guard":[["hasAny",["item number","nth","position","together"]],["has","what"]],"pyramid":["render.template",{"lit":["The title type of Christmas Together is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-b8dda220","guard":[["hasAny",["item number","karountzoses","nth","position"]]],"pyramid":["render.template",{"lit":["The title type of Christmas with the Karountzoses is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-d15a99d7","guard":[["hasAny",["friendly","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The title type of Friendly Monsters: A Monster Christmas is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-d5d77692","guard":[["hasAny",["item number","not","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The title type of A Not So Merry Christmas is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-d9ea53e2","guard":[["hasAny",["item number","nth","position","riviera"]]],"pyramid":["render.template",{"lit":["The title type of Christmas at the Riviera is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-dbb5edb9","guard":[["hasAny",["item number","kacey","nth","position"]]],"pyramid":["render.template",{"lit":["The title type of The Kacey Musgraves Christmas Show is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-f3f35863","guard":[["hasAny",["days","item number","nth","position"]],["has","type"]],"pyramid":["render.template",{"lit":["The title type of 12 Dog Days Till Christmas is ",{"slot":0},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-0e9d2c02","guard":[["hasAny",["item number","nth","position","project"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of Project: Puppies for Christmas is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-1f20c5e4","guard":[["hasAny",["item number","nth","position","tandooris"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of Walter & Tandoori's Christmas is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-4a3b137f","guard":[["hasAny",["item number","nth","position","spotlight"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of Spotlight on Christmas is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-67a859f9","guard":[["hasAny",["crown","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of Crown for Christmas is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-79720768","guard":[["hasAny",["dream","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of A Christmas Dream is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-844d32e0","guard":[["hasAny",["amsterdam","item number","nth","position"]],["has","name"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of Holidays in Amsterdam is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-96f5d458","guard":[["hasAny",["item number","nth","position","village"]],["has","type"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of A Christmas Village is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-bd224f9a","guard":[["hasAny",["item number","lottery","nth","position"]],["has","type"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of The Christmas Lottery is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-f0eca18d","guard":[["hasAny",["dead","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of Christmas with the Dead is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-f62f4096","guard":[["hasAny",["item number","miracle","nth","position"]],["has","type"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of Miracle on Christmas is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-f78257b4","guard":[["hasAny",["forever","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of Forever Christmas is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-f8b754b1","guard":[["hasAny",["catastrophe","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of A Christmas Cookie Catastrophe is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-fed15872","guard":[["hasAny",["hanukkah","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type of Hanukkah Tales and Tunes is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"}],{"lit":1}],{"lit":"fr-tidytuesday-holiday-movies-cdef4a"},{"lit":"primary title"},{"lit":"title type"}]],"mem":null},
{"id":"n-016bd0f3","guard":[["hasAny",["bean","beans","holiday","human","mr","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of Mr. Bean's Holiday: The Human Bean":"The title type of Mr. Bean's Holiday: The Human Bean is video."}}},
{"id":"n-1112f086","guard":[["hasAny",["bunny","christmas","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of The Christmas Bunny":"The title type of The Christmas Bunny is movie."}}},
{"id":"n-1930ddc9","guard":[["hasAny",["around","bob","christmas","hopes","overseas","title","tours","troops","type","world"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972":"The title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972 is tvMovie."}}},
{"id":"n-1c650307","guard":[["hasAny",["christmas","forever","name","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of Forever Christmas":"The title type of Forever Christmas is tvMovie."}}},
{"id":"n-29ac4542","guard":[["hasAny",["barbie","christmas","perfect","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of Barbie: A Perfect Christmas":"The title type of Barbie: A Perfect Christmas is video."}}},
{"id":"n-2d5cb167","guard":[["hasAny",["channel","disney","holiday","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of Disney Channel Holiday":"The title type of Disney Channel Holiday is video."}}},
{"id":"n-37118e86","guard":[["hasAny",["christmas","days","dog","till","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of 12 Dog Days Till Christmas":"The title type of 12 Dog Days Till Christmas is movie."}}},
{"id":"n-446054ec","guard":[["hasAny",["amsterdam","holidays","name","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of Holidays in Amsterdam":"The title type of Holidays in Amsterdam is movie."}}},
{"id":"n-48880ca5","guard":[["hasAny",["christmas","dead","name","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of Christmas with the Dead":"The title type of Christmas with the Dead is movie."}}},
{"id":"n-52944006","guard":[["hasAny",["christmas","riviera","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of Christmas at the Riviera":"The title type of Christmas at the Riviera is tvMovie."}}},
{"id":"n-584083c9","guard":[["hasAny",["christmas","lives","nine","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of The Nine Lives of Christmas":"The title type of The Nine Lives of Christmas is tvMovie."}}},
{"id":"n-59cfc126","guard":[["hasAny",["christmas","karountzoses","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of Christmas with the Karountzoses":"The title type of Christmas with the Karountzoses is movie."}}},
{"id":"n-5a3183d3","guard":[["hasAny",["christmas","gift","johanns","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of Johann's Gift to Christmas":"The title type of Johann's Gift to Christmas is tvMovie."}}},
{"id":"n-5ce83caa","guard":[["hasAny",["christmas","crown","name","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of Crown for Christmas":"The title type of Crown for Christmas is tvMovie."}}},
{"id":"n-5e416ca8","guard":[["hasAny",["holiday","hypothetical","special","star","title","type","wars"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of The Hypothetical Star Wars Holiday Special":"The title type of The Hypothetical Star Wars Holiday Special is video."}}},
{"id":"n-629fbcf6","guard":[["hasAny",["brush","christmas","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of A Brush with Christmas":"The title type of A Brush with Christmas is tvMovie."}}},
{"id":"n-70da3458","guard":[["hasAny",["holiday","hotel","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of Holiday Hotel":"The title type of Holiday Hotel is movie."}}},
{"id":"n-711ff1ad","guard":[["hasAny",["christmas","miracle","name","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of Miracle on Christmas":"The title type of Miracle on Christmas is movie."}}},
{"id":"n-7796eec5","guard":[["hasAny",["christmas","title","together","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of Christmas Together":"The title type of Christmas Together is tvMovie."}}},
{"id":"n-816a1b45","guard":[["hasAny",["christmas","elf","stole","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of The Elf Who Stole Christmas":"The title type of The Elf Who Stole Christmas is movie."}}},
{"id":"n-ac173b5a","guard":[["hasAny",["christmas","star","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of A Star for Christmas":"The title type of A Star for Christmas is tvMovie."}}},
{"id":"n-aee7988d","guard":[["hasAny",["christmas","kacey","musgraves","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of The Kacey Musgraves Christmas Show":"The title type of The Kacey Musgraves Christmas Show is tvMovie."}}},
{"id":"n-b05d7337","guard":[["hasAny",["christmas","navigating","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of Navigating Christmas":"The title type of Navigating Christmas is tvMovie."}}},
{"id":"n-b5fbb8b5","guard":[["hasAny",["christmas","friendly","monster","monsters","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of Friendly Monsters: A Monster Christmas":"The title type of Friendly Monsters: A Monster Christmas is video."}}},
{"id":"n-b8c0afbc","guard":[["hasAny",["christmas","merry","title","type","yiwu"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of Merry Christmas, Yiwu":"The title type of Merry Christmas, Yiwu is movie."}}},
{"id":"n-bec32714","guard":[["hasAny",["christmas","name","title","type","village"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of A Christmas Village":"The title type of A Christmas Village is tvMovie."}}},
{"id":"n-c0aaec3e","guard":[["hasAny",["christmas","name","tandooris","title","type","walter"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of Walter & Tandoori's Christmas":"The title type of Walter & Tandoori's Christmas is movie."}}},
{"id":"n-c3df6ddb","guard":[["hasAny",["catastrophe","christmas","cookie","name","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of A Christmas Cookie Catastrophe":"The title type of A Christmas Cookie Catastrophe is tvMovie."}}},
{"id":"n-c45b0973","guard":[["hasAny",["christmas","royally","title","type","yours"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of Royally Yours, This Christmas":"The title type of Royally Yours, This Christmas is tvMovie."}}},
{"id":"n-d4610c92","guard":[["hasAny",["christmas","name","project","puppies","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of Project: Puppies for Christmas":"The title type of Project: Puppies for Christmas is movie."}}},
{"id":"n-d5f721f5","guard":[["hasAny",["christmas","dream","name","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of A Christmas Dream":"The title type of A Christmas Dream is tvMovie."}}},
{"id":"n-db201801","guard":[["hasAny",["hanukkah","name","tales","title","tunes","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of Hanukkah Tales and Tunes":"The title type of Hanukkah Tales and Tunes is video."}}},
{"id":"n-e1d5e21c","guard":[["hasAny",["christmas","merry","not","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of A Not So Merry Christmas":"The title type of A Not So Merry Christmas is movie."}}},
{"id":"n-e8ea4fb1","guard":[["hasAny",["christmas","girlfriends","past","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the title type of Girlfriends of Christmas Past":"The title type of Girlfriends of Christmas Past is tvMovie."}}},
{"id":"n-ede0b413","guard":[["hasAny",["christmas","lottery","name","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of The Christmas Lottery":"The title type of The Christmas Lottery is tvMovie."}}},
{"id":"n-f636a12d","guard":[["hasAny",["adventures","ashley","caper","case","christmas","marykate","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper":"The title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper is video."}}},
{"id":"n-f8d92cbe","guard":[["hasAny",["christmas","name","spotlight","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the title type of Spotlight on Christmas":"The title type of Spotlight on Christmas is tvMovie."}}},
{"id":"n-feea6735","guard":[["hasAny",["christmas","heavenly","king","perspective","story","title","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the title type of The King a Christmas Story from a Heavenly Perspective":"The title type of The King a Christmas Story from a Heavenly Perspective is movie."}}},
{"id":"n-665911f8","guard":[["has","hanukkah"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," is video."]},["sense.wordAt",{"lit":3}],["sense.after",{"lit":"title"}]],"mem":null},
{"id":"n-2f2d027b","guard":[["hasAny",["girlfriends","past"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of Girlfriends of Christmas Past":"The title type of Girlfriends of Christmas Past is tvMovie."}}},
{"id":"n-32c3fcad","guard":[["hasAny",["catastrophe","cookie"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of A Christmas Cookie Catastrophe":"The title type of A Christmas Cookie Catastrophe is tvMovie."}}},
{"id":"n-32f59a2b","guard":[["has","navigating"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of Navigating Christmas":"The title type of Navigating Christmas is tvMovie."}}},
{"id":"n-36e9d2e6","guard":[["hasAny",["holiday","hypothetical","special","star","title","type","wars"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of The Hypothetical Star Wars Holiday Special":"The title type of The Hypothetical Star Wars Holiday Special is video."}}},
{"id":"n-4081a4aa","guard":[["hasAny",["christmas","friendly","monster","monsters","title","type"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of Friendly Monsters: A Monster Christmas":"The title type of Friendly Monsters: A Monster Christmas is video."}}},
{"id":"n-485798a1","guard":[["has","dead"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of Christmas with the Dead":"The title type of Christmas with the Dead is movie."}}},
{"id":"n-4c2ddc4e","guard":[["hasAny",["tandooris","walter"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of Walter & Tandoori's Christmas":"The title type of Walter & Tandoori's Christmas is movie."}}},
{"id":"n-4ef51bea","guard":[["has","forever"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of Forever Christmas":"The title type of Forever Christmas is tvMovie."}}},
{"id":"n-535a65bb","guard":[["has","not"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of A Not So Merry Christmas":"The title type of A Not So Merry Christmas is movie."}}},
{"id":"n-5baeb942","guard":[["has","lottery"],["has","type"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of The Christmas Lottery":"The title type of The Christmas Lottery is tvMovie."}}},
{"id":"n-63d13df7","guard":[["has","yiwu"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of Merry Christmas, Yiwu":"The title type of Merry Christmas, Yiwu is movie."}}},
{"id":"n-6d09656c","guard":[["hasAny",["adventures","ashley","caper","case","christmas","marykate","title","type"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper":"The title type of The Adventures of Mary-Kate & Ashley: The Case of the Christmas Caper is video."}}},
{"id":"n-756fc4ae","guard":[["has","riviera"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of Christmas at the Riviera":"The title type of Christmas at the Riviera is tvMovie."}}},
{"id":"n-7982d6fe","guard":[["has","star"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of A Star for Christmas":"The title type of A Star for Christmas is tvMovie."}}},
{"id":"n-89725ca0","guard":[["has","brush"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of A Brush with Christmas":"The title type of A Brush with Christmas is tvMovie."}}},
{"id":"n-9381b915","guard":[["has","spotlight"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of Spotlight on Christmas":"The title type of Spotlight on Christmas is tvMovie."}}},
{"id":"n-9a62f605","guard":[["hasAny",["elf","stole"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of The Elf Who Stole Christmas":"The title type of The Elf Who Stole Christmas is movie."}}},
{"id":"n-9c7a6b0d","guard":[["has","hotel"],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of Holiday Hotel":"The title type of Holiday Hotel is movie."}}},
{"id":"n-a1b163ed","guard":[["hasAny",["channel","disney"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of Disney Channel Holiday":"The title type of Disney Channel Holiday is video."}}},
{"id":"n-b12de2f3","guard":[["hasAny",["bean","beans","holiday","human","mr","title","type"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of Mr. Bean's Holiday: The Human Bean":"The title type of Mr. Bean's Holiday: The Human Bean is video."}}},
{"id":"n-b41e275a","guard":[["has","village"],["has","type"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of A Christmas Village":"The title type of A Christmas Village is tvMovie."}}},
{"id":"n-b67cd7a0","guard":[["hasAny",["lives","nine"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of The Nine Lives of Christmas":"The title type of The Nine Lives of Christmas is tvMovie."}}},
{"id":"n-ba87cd07","guard":[["has","dream"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of A Christmas Dream":"The title type of A Christmas Dream is tvMovie."}}},
{"id":"n-bcc13903","guard":[["hasAny",["royally","yours"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of Royally Yours, This Christmas":"The title type of Royally Yours, This Christmas is tvMovie."}}},
{"id":"n-c6527215","guard":[["hasAny",["gift","johanns"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of Johann's Gift to Christmas":"The title type of Johann's Gift to Christmas is tvMovie."}}},
{"id":"n-ca573164","guard":[["hasAny",["project","puppies"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of Project: Puppies for Christmas":"The title type of Project: Puppies for Christmas is movie."}}},
{"id":"n-d2e88b92","guard":[["has","together"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of Christmas Together":"The title type of Christmas Together is tvMovie."}}},
{"id":"n-e262b560","guard":[["has","crown"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of Crown for Christmas":"The title type of Crown for Christmas is tvMovie."}}},
{"id":"n-e703c8a2","guard":[["has","karountzoses"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of Christmas with the Karountzoses":"The title type of Christmas with the Karountzoses is movie."}}},
{"id":"n-e988fe8d","guard":[["has","miracle"],["has","type"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of Miracle on Christmas":"The title type of Miracle on Christmas is movie."}}},
{"id":"n-e99af302","guard":[["hasAny",["kacey","musgraves"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of The Kacey Musgraves Christmas Show":"The title type of The Kacey Musgraves Christmas Show is tvMovie."}}},
{"id":"n-f1869672","guard":[["hasAny",["hanukkah","name","tales","title","tunes","type"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the title type of Hanukkah Tales and Tunes":"The title type of Hanukkah Tales and Tunes is video."}}},
{"id":"n-f2fd37b6","guard":[["has","bunny"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the title type of The Christmas Bunny":"The title type of The Christmas Bunny is movie."}}},
{"id":"n-fecf7a29","guard":[["hasAny",["christmas","heavenly","king","perspective","story","title","type"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the title type of The King a Christmas Story from a Heavenly Perspective":"The title type of The King a Christmas Story from a Heavenly Perspective is movie."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what is the title type of The Kacey Musgraves Christmas Show","expect":{"contains":["tvMovie"],"notRefusal":true}},{"q":"tell me the title type of Merry Christmas, Yiwu","expect":{"contains":["movie"],"notRefusal":true}},{"q":"name the title type of Christmas with the Dead","expect":{"contains":["movie"],"notRefusal":true}},{"q":"what is the title type of Holiday Hotel","expect":{"contains":["movie"],"notRefusal":true}},{"q":"tell me the title type of The Nine Lives of Christmas","expect":{"contains":["tvMovie"],"notRefusal":true}},{"q":"name the title type of Forever Christmas","expect":{"contains":["tvMovie"],"notRefusal":true}},{"q":"what is the title type of Bob Hope's Overseas Christmas Tours: Around the World with the Troops - 1941-1972","expect":{"contains":["tvMovie"],"notRefusal":true}},{"q":"tell me the title type of Girlfriends of Christmas Past","expect":{"contains":["tvMovie"],"notRefusal":true}},{"q":"name the title type of A Christmas Dream","expect":{"contains":["tvMovie"],"notRefusal":true}},{"q":"what is the title type of A Christmas Prince: The Royal Baby","expect":{"contains":["movie"],"notRefusal":true}},{"q":"tell me the title type of The Christmas Bunny","expect":{"contains":["movie"],"notRefusal":true}},{"q":"name the title type of Miracle on Christmas","expect":{"contains":["movie"],"notRefusal":true}},{"q":"what is the title type of Royally Yours, This Christmas","expect":{"contains":["tvMovie"],"notRefusal":true}},{"q":"tell me the title type of The Hypothetical Star Wars Holiday Special","expect":{"contains":["video"],"notRefusal":true}},{"q":"name the title type of Walter & Tandoori's Christmas","expect":{"contains":["movie"],"notRefusal":true}},{"q":"what is the title type of 12 Dog Days Till Christmas","expect":{"contains":["movie"],"notRefusal":true}},{"q":"tell me the title type of Disney Channel Holiday","expect":{"contains":["video"],"notRefusal":true}},{"q":"name the title type of Crown for Christmas","expect":{"contains":["tvMovie"],"notRefusal":true}},{"q":"what is the title type of A Not So Merry Christmas","expect":{"contains":["movie"],"notRefusal":true}},{"q":"tell me the title type of Christmas with a Prince: The Royal Baby","expect":{"contains":["tvMovie"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
