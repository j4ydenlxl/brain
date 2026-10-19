// country-of-name-of-exposi-fedc-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"country-of-name-of-exposi-fedc-neo-g10","class":"country-of-name-of-exposi-fedc","generation":10,"lane":"neo","grownFrom":["tell me the country of the name of exposition HemisFair '68","tell me the country of the name of exposition Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition","what is the country of Louisiana Purchase","tell me the country of the name of exposition Paris International","give the country for World's Columbian Exposition","give the country for Century of Progress","what is the country of Expo '88","tell me the country of the name of exposition Expo 2005","tell me the country of the name of exposition Second International Aeronautic Exhibition","tell me the country of the name of exposition Expo '74","what is the country of Exhibition of Citriculture","what is the country of Expo '93","give the country for Expo '67","what is the country of 1982 World's Fair","tell me the country of the name of exposition Expo 2020","what is the country of Expo Colombo '92","give the country for The Great Exhibition","what is the country of The International Expo of Sport (1955)","give the country for Expo 81","tell me the country of the name of exposition Expo 2015"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-worlds-fairs-548cc1","columns":["name of exposition","country","city","category"],"n":70,"cols":[{"f":"0The Great Exhibition|0Exposition Universelle / Paris International|0Centennial Exposition|0Exposition Universelle / Paris International Exposition|6ción Universal de Barcelona (1888)|0World's Columbian Exposition|0Brussels International Exposition|0Liège International (1905)|0Milan International|0Esposizione internazionale dell'industria e del lavoro|0ILIS 1936|0Conquest of the Desert (exhibition)|0Interbau|0Expo '67|670|581|5'93|01982 World's Fair|34 World's Fair|0EA 53|1xhibition of Citriculture|2po '74|75|686|78|698|52008|712|87|561|571|585 (Plovdiv, Bulgaria)|9Tsukuba, Japan)|591|5Colombo '92|4sition internationale de l'eau (1939)|0Helsingborg Exhibition 1955|2misFair '68|0IVA 65|1nternational Exhibition on Urbanism and Housing|0Second International Aeronautic Exhibition|0The International Exhibition of Navigation (1954)|wRural Habitat in Lyon|kpo of Sport (1955)|iTextile Exhibition|0Universal Sport Exhibition (1949)|0Barcelona International Exposition|1russels International Exhibition|pposition|9World's Fair|0Century 21 Exposition|8of Progress|0Expo '92|52000|85|710|85|720|4sition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition|bUniverselle / Paris International|zrnational Exposition|binternationale du bicentenaire de Port-au-Prince|buniverselle et international / Ghent International Exposition|0International Exhibition|0Louisiana Purchase|0Melbourne International Exhibition|0New York World's Fair|0Panama–Pacific International Exposition|2ris International|0Weltausstellung 1873 Wien / Austrian International Exposition","sep":"|"},{"f":"0United Kingdom|0France|0United States|0France|0Spain|0United States|0Belgium|7|0Italy|5|0Sweden|0Israel|0West Germany|0Canada|0Japan|0Bulgaria|0South Korea|0United States|d|0Italy|1srael|0United States|0Japan|0Canada|0Australia|0Portugal|0Spain|1outh Korea|0Kazakhstan|0Italy|0Hungary|0Bulgaria|0Japan|0Bulgaria|0Italy|0Belgium|0Sweden|0United States|0West Germany|0France|1inland|0Italy|0France|0Italy|0France|0Sweden|1pain|0Belgium|7|7|0United States|d|0Spain|0Germany|0Japan|0People's Republic of China|0Italy|0United Arab Emirates|0France|6|6|0Haiti|0Belgium|0United Kingdom|7States|0Colony of Victoria|0United States|d|0France|0Austria-Hungary","sep":"|"},{"s":"London|Paris|Philadelphia|Paris|Barcelona|Chicago|Brussels|Liège|Milan|Turin|Stockholm|Jerusalem|West Berlin|Montreal|Osaka|Plovdiv|Daejeon|Knoxville|New Orleans|Rome|Beit Dagan|Spokane|Okinawa|Vancouver|Brisbane|Lisbon|Zaragoza|Yeosu|Astana|Turin|Budapest|Plovdiv|Tsukuba|Plovdiv|Genoa|Liège|Helsingborg|San Antonio|Munich|Paris|Helsinki|Naples|Lyon|Turin|Lille|Stockholm|Barcelona|Brussels|Brussels|Brussels|Seattle|Chicago|Seville|Hanover|Aichi|Shanghai|Milan|Dubai|Paris|Paris|Paris|Port-au-Prince|Ghent|London|St. Louis|Melbourne|New York City|San Francisco|Paris|Vienna","sep":"|"},{"d":"World Expo|Specialised Expo","r":"0*a,1*3,0*2,1*v,0*o","sep":"|"}]}]);
const COLONY = [
{"id":"n-28914dcf","guard":[["hasAny",["country","element","item number","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-ce38dc24","guard":[["not",["has","category"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-8ba1c2d0","guard":[["hasAny",["country","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-92b03aa0","guard":[["hasAny",["all caps","capital letters","capitals","country","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-a5ca365a","guard":[["not",["has","category"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-c41e35a8","guard":[["not",["has","category"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-c9b52292","guard":[["not",["has","category"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-f68292b8","guard":[["hasAny",["country","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-07e2148b","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition":"The country of Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition is France.","tell me the country of the name of exposition HemisFair '68":"The country of HemisFair '68 is United States.","what is the country of Louisiana Purchase":"The country of Louisiana Purchase is United States.","tell me the country of the name of exposition Paris International":"The country of Paris International is France.","give the country for World's Columbian Exposition":"The country of World's Columbian Exposition is United States.","give the country for Century of Progress":"The country of Century of Progress is United States.","what is the country of Expo '88":"The country of Expo '88 is Australia.","tell me the country of the name of exposition Expo 2005":"The country of Expo 2005 is Japan.","tell me the country of the name of exposition Second International Aeronautic Exhibition":"The country of Second International Aeronautic Exhibition is Finland.","tell me the country of the name of exposition Expo '74":"The country of Expo '74 is United States.","what is the country of Exhibition of Citriculture":"The country of Exhibition of Citriculture is Israel.","what is the country of Expo '93":"The country of Expo '93 is South Korea.","give the country for Expo '67":"The country of Expo '67 is Canada.","what is the country of 1982 World's Fair":"The country of 1982 World's Fair is United States.","tell me the country of the name of exposition Expo 2020":"The country of Expo 2020 is United Arab Emirates.","what is the country of Expo Colombo '92":"The country of Expo Colombo '92 is Italy.","give the country for The Great Exhibition":"The country of The Great Exhibition is United Kingdom.","what is the country of The International Expo of Sport (1955)":"The country of The International Expo of Sport (1955) is Italy.","give the country for Expo 81":"The country of Expo 81 is Bulgaria.","tell me the country of the name of exposition Expo 2015":"The country of Expo 2015 is Italy.","tell me the country of the name of exposition Expo 91":"The country of Expo 91 is Bulgaria.","give the country for Expo 61":"The country of Expo 61 is Italy.","give the country for Expo '92":"The country of Expo '92 is Spain.","what is the country of Exposition Universelle / Paris International":"The country of Exposition Universelle / Paris International is France.","give the country for International Exhibition on Urbanism and Housing":"The country of International Exhibition on Urbanism and Housing is France.","give the country for Expo '70":"The country of Expo '70 is Japan.","tell me the country of the name of exposition Exposition internationale de l'eau (1939)":"The country of Exposition internationale de l'eau (1939) is Belgium.","tell me the country of the name of exposition Weltausstellung 1873 Wien / Austrian International Exposition":"The country of Weltausstellung 1873 Wien / Austrian International Exposition is Austria-Hungary.","give the country for IVA 65":"The country of IVA 65 is West Germany.","what is the country of Conquest of the Desert (exhibition)":"The country of Conquest of the Desert (exhibition) is Israel.","what is the country of Expo 71":"The country of Expo 71 is Hungary.","tell me the country of the name of exposition Expo 2012":"The country of Expo 2012 is South Korea.","give the country for Century 21 Exposition":"The country of Century 21 Exposition is United States.","give the country for ILIS 1936":"The country of ILIS 1936 is Sweden.","what is the country of Centennial Exposition":"The country of Centennial Exposition is United States.","what is the country of The International Textile Exhibition":"The country of The International Textile Exhibition is France.","tell me the country of the name of exposition Brussels International Exposition":"The country of Brussels International Exposition is Belgium.","give the country for Exposition universelle et international / Ghent International Exposition":"The country of Exposition universelle et international / Ghent International Exposition is Belgium.","give the country for Expo 2017":"The country of Expo 2017 is Kazakhstan.","what is the country of New York World's Fair":"The country of New York World's Fair is United States.","tell me the country of the name of exposition Brussels International Exhibition":"The country of Brussels International Exhibition is Belgium.","tell me the country of the name of exposition Expo 2008":"The country of Expo 2008 is Spain.","tell me the country of the name of exposition Interbau":"The country of Interbau is West Germany.","give the country for Exposition internationale du bicentenaire de Port-au-Prince":"The country of Exposition internationale du bicentenaire de Port-au-Prince is Haiti.","give the country for Helsingborg Exhibition 1955":"The country of Helsingborg Exhibition 1955 is Sweden.","tell me the country of the name of exposition Panama–Pacific International Exposition":"The country of Panama–Pacific International Exposition is United States.","what is the country of EA 53":"The country of EA 53 is Italy.","tell me the country of the name of exposition Expo '98":"The country of Expo '98 is Portugal.","what is the country of Liège International (1905)":"The country of Liège International (1905) is Belgium.","what is the country of The International Exhibition of Navigation (1954)":"The country of The International Exhibition of Navigation (1954) is Italy.","give the country for Esposizione internazionale dell'industria e del lavoro":"The country of Esposizione internazionale dell'industria e del lavoro is Italy.","give the country for The International Exhibition of Rural Habitat in Lyon":"The country of The International Exhibition of Rural Habitat in Lyon is France.","what is the country of Expo '75":"The country of Expo '75 is Japan."}}},
{"id":"n-a2bf1741","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"country"}]]],"mem":{"table":{"of the name of exposition Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition":"The country of Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition is France.","of the name of exposition HemisFair '68":"The country of HemisFair '68 is United States.","of Louisiana Purchase":"The country of Louisiana Purchase is United States.","of the name of exposition Paris International":"The country of Paris International is France.","for World's Columbian Exposition":"The country of World's Columbian Exposition is United States.","for Century of Progress":"The country of Century of Progress is United States.","of Expo '88":"The country of Expo '88 is Australia.","of the name of exposition Expo 2005":"The country of Expo 2005 is Japan.","of the name of exposition Second International Aeronautic Exhibition":"The country of Second International Aeronautic Exhibition is Finland.","of the name of exposition Expo '74":"The country of Expo '74 is United States.","of Exhibition of Citriculture":"The country of Exhibition of Citriculture is Israel.","of Expo '93":"The country of Expo '93 is South Korea.","for Expo '67":"The country of Expo '67 is Canada.","of 1982 World's Fair":"The country of 1982 World's Fair is United States.","of the name of exposition Expo 2020":"The country of Expo 2020 is United Arab Emirates.","of Expo Colombo '92":"The country of Expo Colombo '92 is Italy.","for The Great Exhibition":"The country of The Great Exhibition is United Kingdom.","of The International Expo of Sport (1955)":"The country of The International Expo of Sport (1955) is Italy.","for Expo 81":"The country of Expo 81 is Bulgaria.","of the name of exposition Expo 2015":"The country of Expo 2015 is Italy.","of the name of exposition Expo 91":"The country of Expo 91 is Bulgaria.","for Expo 61":"The country of Expo 61 is Italy.","for Expo '92":"The country of Expo '92 is Spain.","of Exposition Universelle / Paris International":"The country of Exposition Universelle / Paris International is France.","for International Exhibition on Urbanism and Housing":"The country of International Exhibition on Urbanism and Housing is France.","for Expo '70":"The country of Expo '70 is Japan.","of the name of exposition Exposition internationale de l'eau (1939)":"The country of Exposition internationale de l'eau (1939) is Belgium.","of the name of exposition Weltausstellung 1873 Wien / Austrian International Exposition":"The country of Weltausstellung 1873 Wien / Austrian International Exposition is Austria-Hungary.","for IVA 65":"The country of IVA 65 is West Germany.","of Conquest of the Desert (exhibition)":"The country of Conquest of the Desert (exhibition) is Israel.","of Expo 71":"The country of Expo 71 is Hungary.","of the name of exposition Expo 2012":"The country of Expo 2012 is South Korea.","for Century 21 Exposition":"The country of Century 21 Exposition is United States.","for ILIS 1936":"The country of ILIS 1936 is Sweden.","of Centennial Exposition":"The country of Centennial Exposition is United States.","of The International Textile Exhibition":"The country of The International Textile Exhibition is France.","of the name of exposition Brussels International Exposition":"The country of Brussels International Exposition is Belgium.","for Exposition universelle et international / Ghent International Exposition":"The country of Exposition universelle et international / Ghent International Exposition is Belgium.","for Expo 2017":"The country of Expo 2017 is Kazakhstan.","of New York World's Fair":"The country of New York World's Fair is United States.","of the name of exposition Brussels International Exhibition":"The country of Brussels International Exhibition is Belgium.","of the name of exposition Expo 2008":"The country of Expo 2008 is Spain.","of the name of exposition Interbau":"The country of Interbau is West Germany.","for Exposition internationale du bicentenaire de Port-au-Prince":"The country of Exposition internationale du bicentenaire de Port-au-Prince is Haiti.","for Helsingborg Exhibition 1955":"The country of Helsingborg Exhibition 1955 is Sweden.","of the name of exposition Panama–Pacific International Exposition":"The country of Panama–Pacific International Exposition is United States.","of EA 53":"The country of EA 53 is Italy.","of the name of exposition Expo '98":"The country of Expo '98 is Portugal.","of Liège International (1905)":"The country of Liège International (1905) is Belgium.","of The International Exhibition of Navigation (1954)":"The country of The International Exhibition of Navigation (1954) is Italy.","for Esposizione internazionale dell'industria e del lavoro":"The country of Esposizione internazionale dell'industria e del lavoro is Italy.","for The International Exhibition of Rural Habitat in Lyon":"The country of The International Exhibition of Rural Habitat in Lyon is France.","of Expo '75":"The country of Expo '75 is Japan."}}},
{"id":"n-11387e5e","guard":[["not",["hasAny",["austrian","category"]]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-b1d1715e","guard":[["hasAny",["brussels","centennial","century","del","ea","element","et","exhibition","expo","hemisfair","ilis","interbau","internationale","item number","iva","liège","louisiana","normalise","normalize","nth","panamapacific","paris","position","simplify the text","worlds"]],["has","country"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-42a0273a","guard":[["not",["hasAny",["category","moderne"]]]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-b82d413e","guard":[["hasAny",["austrian","brussels","centennial","century","de","del","ea","element","exhibition","expo","hemisfair","ilis","interbau","item number","iva","liège","louisiana","nth","panamapacific","position","universelle","worlds"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-6b32384e","guard":[["not",["has","category"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-aa4b79d3","guard":[["hasAny",["country","element","item number","nth","position"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-502cff7c","guard":[["hasAny",["country","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-beae6851","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.and",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-c5468027","guard":[["hasAny",["country","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.and",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-f4f7ce8e","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-04145de8","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-30c6022b","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-347ceec3","guard":[["hasAny",["country","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-38f8c730","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-3af70a53","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-554e0785","guard":[["hasAny",["country","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-6903c404","guard":[["hasAny",["all caps","capital letters","capitals","country","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-9cf10a44","guard":[["hasAny",["country","element","first n","item number","nth","position","take","top"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-a5fc8ed6","guard":[["hasAny",["country","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-c2c7dd44","guard":[["hasAny",["country","element","first n","item number","nth","position","take","top"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-e0ef90c5","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-f75b2ad5","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.content"],["sense.howMany"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-03e693ee","guard":[["hasAny",["all caps","capital letters","capitals","country","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-04afc43c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","country","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-06b3b24c","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-0727843e","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-6676e9c2","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-9267cc77","guard":[["hasAny",["country","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-f75d1791","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-f9f8b88f","guard":[["hasAny",["country","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-58f5846c","guard":[["hasAny",["country","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-7de0dadf","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-625db6ce","guard":[["not",["has","category"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-ed3a6e19","guard":[["hasAny",["country","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-0f2428d5","guard":[["hasAny",["aeronautic","austrian","brussels","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","is","item number","leau","liège","louisiana","navigation","nth","panamapacific","position","sport","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-9ae3f579","guard":[["hasAny",["aeronautic","austrian","brussels","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","is","item number","leau","liège","louisiana","navigation","nth","panamapacific","position","sport","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-16d7a809","guard":[["hasAny",["aeronautic","austrian","brussels","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","is","item number","leau","liège","louisiana","navigation","nth","panamapacific","position","sport","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-1ab8752c","guard":[["hasAny",["aeronautic","austrian","brussels","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","invert case","is","item number","leau","liège","louisiana","navigation","nth","panamapacific","position","sport","swap case","textile","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-6f3e6b74","guard":[["hasAny",["aeronautic","all caps","austrian","brussels","capital letters","capitals","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","is","item number","leau","liège","louisiana","navigation","nth","panamapacific","position","sport","textile","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-ddda2fb0","guard":[["hasAny",["aeronautic","austrian","brussels","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","is","item number","leau","liège","louisiana","lower case","lowercase","navigation","nth","panamapacific","position","small letters","sport","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-31e2a04a","guard":[["hasAny",["aeronautic","austrian","brussels","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","invert case","is","item number","leau","liège","louisiana","navigation","nth","panamapacific","position","sport","swap case","textile","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-32523e86","guard":[["hasAny",["aeronautic","all caps","austrian","brussels","capital letters","capitals","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","is","item number","leau","liège","louisiana","navigation","nth","panamapacific","position","sport","textile","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-477241ea","guard":[["hasAny",["aeronautic","austrian","brussels","capitalise","capitalize","capitalize each word","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","is","item number","leau","liège","louisiana","navigation","nth","panamapacific","position","sport","textile","title case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-c886ea30","guard":[["hasAny",["aeronautic","austrian","brussels","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","is","item number","leau","liège","louisiana","lower case","lowercase","navigation","nth","panamapacific","position","small letters","sport","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-85dca9ab","guard":[["hasAny",["aeronautic","austrian","brussels","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","is","item number","leau","liège","louisiana","navigation","normalise","normalize","nth","panamapacific","position","simplify the text","sport","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-8c9e32f7","guard":[["hasAny",["aeronautic","austrian","brussels","centennial","citriculture","colombo","conquest","ea","element","fair","hemisfair","interbau","is","item number","leau","liège","louisiana","navigation","normalise","normalize","nth","panamapacific","position","simplify the text","sport","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-433b8487","guard":[["hasAny",["aeronautic","austrian","brussels","citriculture","colombo","conquest","del","ea","element","et","habitat","helsingborg","housing","ilis","internationale","item number","liège","navigation","nth","paris","position","reverse the words","reverse word order","sport","textile","words backwards"]],["has","country"]],"pyramid":["render.str",["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-c70b83d7","guard":[["hasAny",["aeronautic","austrian","brussels","citriculture","colombo","conquest","dashes","del","ea","element","et","habitat","helsingborg","housing","hyphens","ilis","internationale","item number","kebab case","kebabcase","liège","navigation","nth","paris","position","slug","sport","textile"]],["has","country"]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-2ba16462","guard":[["hasAny",["aeronautic","brussels","citriculture","class name","colombo","conquest","del","ea","element","et","habitat","helsingborg","housing","ilis","internationale","item number","liège","navigation","nth","paris","pascal case","pascalcase","position","sport","textile","upper camel case"]],["has","country"]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-33e831f8","guard":[["hasAny",["aeronautic","brussels","camel case","camelcase","citriculture","colombo","conquest","del","ea","element","et","habitat","helsingborg","housing","ilis","internationale","item number","liège","lower camel case","navigation","nth","paris","position","sport","textile"]],["has","country"]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-6d7e9e9d","guard":[["hasAny",["aeronautic","brussels","citriculture","colombo","conquest","del","ea","element","et","habitat","helsingborg","housing","ilis","internationale","item number","liège","navigation","nth","paris","position","snake case","snakecase","sport","textile","underscores","variable name"]],["has","country"]],"pyramid":["render.str",["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-8cd84d97","guard":[["hasAny",["aeronautic","brussels","citriculture","colombo","conquest","del","ea","each word","element","et","habitat","helsingborg","housing","ilis","internationale","item number","liège","navigation","nth","paris","position","split into words","sport","textile","words"]],["has","country"]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-dbf94dec","guard":[["hasAny",["aeronautic","brussels","citriculture","colombo","conquest","del","ea","each word","element","et","habitat","helsingborg","housing","ilis","internationale","item number","liège","navigation","nth","paris","position","split into words","sport","textile","words"]],["has","country"]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-e4e4a848","guard":[["hasAny",["aeronautic","brussels","citriculture","colombo","conquest","del","ea","each word","element","et","habitat","helsingborg","housing","ilis","internationale","item number","liège","navigation","nth","paris","position","split into words","sport","textile","words"]],["has","country"]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-1d3f184e","guard":[["hasAny",["aeronautic","brussels","citriculture","colombo","conquest","del","ea","element","et","habitat","helsingborg","housing","ilis","internationale","item number","liège","navigation","normalise","normalize","nth","paris","position","simplify the text","sport","textile"]],["has","country"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}],{"lit":3}]],"mem":null},
{"id":"n-3f2415f5","guard":[["hasAny",["aeronautic","bicentenaire","brussels","caesar cipher","centennial","citriculture","columbian","conquest","del","element","et","great","habitat","housing","interbau","item number","louisiana","new","nth","panamapacific","paris","position","progress","rotate the letters","shift by","shift each letter","textile"]],["has","country"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-4519f56a","guard":[["hasAny",["aeronautic","brussels","citriculture","colombo","conquest","del","ea","each word","element","et","habitat","helsingborg","housing","ilis","internationale","item number","liège","navigation","nth","paris","position","shortest","shortest one","shortest word","split into words","sport","textile","words"]],["has","country"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]]],"mem":null},
{"id":"n-7327bbe6","guard":[["hasAny",["aeronautic","brussels","citriculture","colombo","conquest","del","ea","each word","element","et","habitat","helsingborg","housing","ilis","internationale","item number","liège","longest","longest one","longest word","navigation","nth","paris","position","split into words","sport","textile","words"]],["has","country"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]]],"mem":null},
{"id":"n-0f655b7d","guard":[["hasAny",["colombo","ea","element","fair","international","item number","name","nth","of","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-6034e8d5","guard":[["hasAny",["colombo","ea","element","fair","international","item number","name","nth","of","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-586b41a6","guard":[["hasAny",["citriculture","colombo","conquest","ea","element","exposition","fair","is","item number","navigation","nth","position","sport","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"category"},{"lit":"Specialised Expo"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-a1d7fd92","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-e4635b83","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.and",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-08909259","guard":[["hasAny",["bicentenaire","century","class name","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-67f59e30","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","invert case","item number","iva","nth","position","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-6ca01171","guard":[["hasAny",["all caps","bicentenaire","capital letters","capitals","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","nth","position","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-7b94f088","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-a07b94d9","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","lower case","lowercase","nth","position","small letters"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-b25d3003","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","invert case","item number","iva","nth","position","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-0f262d35","guard":[["hasAny",["bicentenaire","capitalise","capitalize","capitalize each word","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","nth","position","title case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-1b2b02b0","guard":[["hasAny",["all caps","bicentenaire","capital letters","capitals","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","nth","position","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-22a9c7da","guard":[["hasAny",["bicentenaire","century","columbian","del","each word","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","nth","position","split into words","words"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-3cbe3af6","guard":[["hasAny",["bicentenaire","century","columbian","del","each word","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","nth","position","split into words","words"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-656f1e51","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","invert case","item number","iva","nth","position","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-a2868263","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","lower case","lowercase","nth","position","small letters"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-7c65f195","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","normalise","normalize","nth","position","simplify the text"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-f49f503a","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","habitat","helsingborg","housing","ilis","item number","iva","normalise","normalize","nth","position","simplify the text"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-b5bc494c","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"World's Columbian Exposition":"The country of World's Columbian Exposition is United States.","Century of Progress":"The country of Century of Progress is United States.","Expo '67":"The country of Expo '67 is Canada.","The Great Exhibition":"The country of The Great Exhibition is United Kingdom.","Expo 81":"The country of Expo 81 is Bulgaria.","Expo 61":"The country of Expo 61 is Italy.","Expo '92":"The country of Expo '92 is Spain.","International Exhibition on Urbanism and Housing":"The country of International Exhibition on Urbanism and Housing is France.","Expo '70":"The country of Expo '70 is Japan.","IVA 65":"The country of IVA 65 is West Germany.","Century 21 Exposition":"The country of Century 21 Exposition is United States.","ILIS 1936":"The country of ILIS 1936 is Sweden.","Exposition universelle et international / Ghent International Exposition":"The country of Exposition universelle et international / Ghent International Exposition is Belgium.","Expo 2017":"The country of Expo 2017 is Kazakhstan.","Exposition internationale du bicentenaire de Port-au-Prince":"The country of Exposition internationale du bicentenaire de Port-au-Prince is Haiti.","Helsingborg Exhibition 1955":"The country of Helsingborg Exhibition 1955 is Sweden.","Esposizione internazionale dell'industria e del lavoro":"The country of Esposizione internazionale dell'industria e del lavoro is Italy.","The International Exhibition of Rural Habitat in Lyon":"The country of The International Exhibition of Rural Habitat in Lyon is France."}}},
{"id":"n-da2cca39","guard":[["has","country"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"is"}]]],"mem":{"table":{"the country of Louisiana Purchase":"The country of Louisiana Purchase is United States.","the country of Expo '88":"The country of Expo '88 is Australia.","the country of Exhibition of Citriculture":"The country of Exhibition of Citriculture is Israel.","the country of Expo '93":"The country of Expo '93 is South Korea.","the country of 1982 World's Fair":"The country of 1982 World's Fair is United States.","the country of Expo Colombo '92":"The country of Expo Colombo '92 is Italy.","the country of The International Expo of Sport (1955)":"The country of The International Expo of Sport (1955) is Italy.","the country of Exposition Universelle / Paris International":"The country of Exposition Universelle / Paris International is France.","the country of Conquest of the Desert (exhibition)":"The country of Conquest of the Desert (exhibition) is Israel.","the country of Expo 71":"The country of Expo 71 is Hungary.","the country of Centennial Exposition":"The country of Centennial Exposition is United States.","the country of The International Textile Exhibition":"The country of The International Textile Exhibition is France.","the country of New York World's Fair":"The country of New York World's Fair is United States.","the country of EA 53":"The country of EA 53 is Italy.","the country of Liège International (1905)":"The country of Liège International (1905) is Belgium.","the country of The International Exhibition of Navigation (1954)":"The country of The International Exhibition of Navigation (1954) is Italy.","the country of Expo '75":"The country of Expo '75 is Japan."}}},
{"id":"n-06e1f661","guard":[["hasAny",["aeronautic","austrian","brussels","citriculture","colombo","conquest","dashes","ea","element","hyphens","item number","kebab case","kebabcase","leau","liège","navigation","nth","position","slug","sport","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-96e22bb3","guard":[["hasAny",["aeronautic","austrian","brussels","citriculture","colombo","conquest","ea","element","item number","leau","liège","navigation","nth","position","reverse the words","reverse word order","sport","textile","words backwards"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-3f244abf","guard":[["hasAny",["aeronautic","brussels","citriculture","class name","colombo","conquest","ea","element","item number","leau","liège","navigation","nth","pascal case","pascalcase","position","sport","textile","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-5565632e","guard":[["hasAny",["aeronautic","brussels","citriculture","colombo","conquest","ea","element","item number","leau","liège","navigation","nth","position","snake case","snakecase","sport","textile","underscores","variable name"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-b549888c","guard":[["hasAny",["aeronautic","brussels","camel case","camelcase","citriculture","colombo","conquest","ea","element","item number","leau","liège","lower camel case","navigation","nth","position","sport","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-3ed313da","guard":[["hasAny",["country","element","item number","nth","position"]],["words>=",7],["not",["has","which"]],["not",["has","circuit"]],["not",["has","san"]],["not",["has","asiajerusalem"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"},{"lit":"country"}]],"mem":null},
{"id":"n-167c8cbd","guard":[["hasAny",["all caps","capital letters","capitals","country","element","item number","nth","position","upper case","uppercase"]],["words>=",7],["not",["has","which"]],["not",["has","circuit"]],["not",["has","san"]],["not",["has","asiajerusalem"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"},{"lit":"country"}]]],"mem":null},
{"id":"n-fdc0d8c7","guard":[["hasAny",["country","element","invert case","item number","nth","position","swap case","toggle case"]],["words>=",7],["not",["has","which"]],["not",["has","circuit"]],["not",["has","san"]],["not",["has","asiajerusalem"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"},{"lit":"country"}]]],"mem":null},
{"id":"n-ffa15ef9","guard":[["hasAny",["camel case","camelcase","country","element","item number","lower camel case","nth","position"]],["words>=",7],["not",["has","which"]],["not",["has","circuit"]],["not",["has","san"]],["not",["has","asiajerusalem"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"},{"lit":"country"}]]],"mem":null},
{"id":"n-502acc98","guard":[["hasAny",["bicentenaire","century","columbian","del","element","for","ghent","great","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"category"},{"lit":"World Expo"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-cea11882","guard":[["hasAny",["colombo","de","ea","element","exhibition","ilis","international","item number","nth","position","reverse the words","reverse word order","words backwards"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-e79c34b3","guard":[["hasAny",["colombo","dashes","de","ea","element","exhibition","hyphens","ilis","international","item number","kebab case","kebabcase","nth","position","slug"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-42cecbeb","guard":[["hasAny",["austrian","brussels","centennial","element","fair","is","item number","liège","louisiana","nth","panamapacific","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"category"},{"lit":"World Expo"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-302eee41","guard":[["hasAny",["caesar cipher","element","exposition","habitat","item number","nth","position","rotate the letters","shift by","shift each letter"]],["has","country"]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-1aae6063","guard":[["hasAny",["colombo","de","ea","element","exhibition","ilis","item number","liège","nth","position","snake case","snakecase","sport","underscores","variable name"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-64d3d609","guard":[["hasAny",["class name","colombo","de","ea","element","exhibition","ilis","item number","liège","nth","pascal case","pascalcase","position","sport","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-d4f6ef98","guard":[["hasAny",["camel case","camelcase","colombo","de","ea","element","exhibition","ilis","item number","liège","lower camel case","nth","position","sport"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-54539925","guard":[["hasAny",["element","for","habitat","helsingborg","housing","ilis","item number","iva","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"category"},{"lit":"Specialised Expo"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-04a6f8e0","guard":[["hasAny",["bicentenaire","class name","del","element","ghent","habitat","helsingborg","housing","ilis","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-1538cbdc","guard":[["hasAny",["bicentenaire","del","element","ghent","habitat","helsingborg","housing","ilis","item number","nth","position","snake case","snakecase","underscores","variable name"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-61ee8e0a","guard":[["hasAny",["bicentenaire","camel case","camelcase","del","element","ghent","habitat","helsingborg","housing","ilis","item number","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-8711b11a","guard":[["hasAny",["bicentenaire","del","element","ghent","habitat","helsingborg","housing","ilis","item number","nth","position","reverse the words","reverse word order","words backwards"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-8cab1e02","guard":[["hasAny",["bicentenaire","dashes","del","element","ghent","habitat","helsingborg","housing","hyphens","ilis","item number","kebab case","kebabcase","nth","position","slug"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-5da8df19","guard":[["hasAny",["centennial","element","fair","hemisfair","item number","louisiana","nth","panamapacific","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is United States."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-0324e5d7","guard":[["hasAny",["colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-4d1c0d11","guard":[["hasAny",["colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.and",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-82ad1b77","guard":[["hasAny",["centennial","citriculture","element","housing","item number","louisiana","nth","position","progress","shortest","shortest one","shortest word","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-c3d86146","guard":[["hasAny",["centennial","citriculture","element","housing","item number","louisiana","nth","position","progress","shortest","shortest one","shortest word","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-1bcc6bd8","guard":[["hasAny",["colombo","ea","element","fair","ilis","invert case","item number","iva","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-1d76aa84","guard":[["hasAny",["centennial","citriculture","element","housing","item number","louisiana","nth","position","progress","shortest","shortest one","shortest word","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-1f99bc68","guard":[["hasAny",["colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-49f4397b","guard":[["hasAny",["colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-6cd8a820","guard":[["hasAny",["centennial","citriculture","element","housing","item number","louisiana","lower case","lowercase","nth","position","progress","shortest","shortest one","shortest word","small letters","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-767a5a3a","guard":[["hasAny",["all caps","capital letters","capitals","centennial","citriculture","element","housing","item number","louisiana","nth","position","progress","shortest","shortest one","shortest word","textile","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-d30d619b","guard":[["hasAny",["centennial","citriculture","element","housing","invert case","item number","louisiana","nth","position","progress","shortest","shortest one","shortest word","swap case","textile","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-f5eca21f","guard":[["hasAny",["all caps","capital letters","capitals","colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-0dcaa273","guard":[["hasAny",["all caps","capital letters","capitals","centennial","citriculture","element","housing","item number","louisiana","nth","position","progress","shortest","shortest one","shortest word","textile","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-1746d6ce","guard":[["hasAny",["colombo","ea","element","fair","ilis","invert case","item number","iva","longest","longest one","longest word","nth","position","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-4bd80e9a","guard":[["hasAny",["capitalise","capitalize","capitalize each word","centennial","citriculture","element","housing","item number","louisiana","nth","position","progress","shortest","shortest one","shortest word","textile","title case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-4fd9610d","guard":[["hasAny",["centennial","citriculture","element","housing","invert case","item number","louisiana","nth","position","progress","shortest","shortest one","shortest word","swap case","textile","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-6530c5b8","guard":[["hasAny",["centennial","citriculture","element","housing","item number","louisiana","lower case","lowercase","nth","position","progress","shortest","shortest one","shortest word","small letters","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-6a100db4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","nth","position","title case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-8198f5fd","guard":[["hasAny",["all caps","capital letters","capitals","colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","nth","position","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-bcb416d1","guard":[["hasAny",["colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","lower case","lowercase","nth","position","small letters"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-47c62982","guard":[["hasAny",["centennial","citriculture","element","housing","item number","louisiana","normalise","normalize","nth","position","progress","shortest","shortest one","shortest word","simplify the text","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-7868362a","guard":[["hasAny",["colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","normalise","normalize","nth","position","simplify the text"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-c9cebc50","guard":[["hasAny",["centennial","citriculture","element","housing","item number","louisiana","normalise","normalize","nth","position","progress","shortest","shortest one","shortest word","simplify the text","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-37ea5cf4","guard":[["hasAny",["caesar cipher","habitat","housing","paris","rotate the letters","shift by","shift each letter","textile"]],["has","country"]],"pyramid":["render.str",["transform.caesar",{"lit":"France"},["sense.howMany"]]],"mem":null},
{"id":"n-4ad90efe","guard":[["hasAny",["colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-95933a0a","guard":[["hasAny",["colombo","ea","element","fair","ilis","item number","iva","longest","longest one","longest word","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-730929f6","guard":[["hasAny",["caesar cipher","centennial","columbian","louisiana","panamapacific","progress","rotate the letters","shift by","shift each letter"]],["has","country"],["not",["has","a"]],["not",["has","australia"]],["words>=",7]],"pyramid":["render.str",["transform.caesar",{"lit":"United States"},["sense.howMany"]]],"mem":null},
{"id":"n-77f67d32","guard":[["hasAny",["brussels","delete","element","ghent","item number","liège","nth","position","remove","strip out","without"]],["has","country"]],"pyramid":["render.str",["transform.remove",{"lit":"Belgium"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-b7576c38","guard":[["hasAny",["delete","element","habitat","item number","nth","paris","position","remove","strip out","without"]],["has","country"]],"pyramid":["render.str",["transform.remove",{"lit":"France"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-a72f052f","guard":[["hasAny",["colombo","ea","element","item number","navigation","nth","position","sport"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Italy."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-d4d74470","guard":[["hasAny",["brussels","element","item number","leau","liège","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Belgium."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-d50ec368","guard":[["hasAny",["colombo","ea","navigation","sport"]],["has","country"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Italy"},["sense.howMany"]]],"mem":null},
{"id":"n-d2cdfc89","guard":[["hasAny",["centennial","louisiana","progress","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is United States."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-f5fed2b7","guard":[["hasAny",["century","columbian"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is United States."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-0017bfe2","guard":[["hasAny",["century","element","fair","hemisfair","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is United States."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-22f291e4","guard":[["hasAny",["colombo","dashes","ea","element","hyphens","ilis","item number","kebab case","kebabcase","longest","longest one","longest word","nth","position","slug"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-46d50ad7","guard":[["hasAny",["class name","colombo","ea","element","ilis","item number","longest","longest one","longest word","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-51dfa833","guard":[["hasAny",["citriculture","dashes","element","housing","hyphens","item number","kebab case","kebabcase","nth","position","shortest","shortest one","shortest word","slug","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-54ea60e3","guard":[["hasAny",["citriculture","class name","element","housing","item number","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","textile","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-59290fcb","guard":[["hasAny",["colombo","ea","element","ilis","item number","longest","longest one","longest word","nth","position","reverse the words","reverse word order","words backwards"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-ab003eab","guard":[["hasAny",["camel case","camelcase","colombo","ea","element","ilis","item number","longest","longest one","longest word","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-eecf3c27","guard":[["hasAny",["citriculture","element","housing","item number","nth","position","reverse the words","reverse word order","shortest","shortest one","shortest word","textile","words backwards"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-ef67cc43","guard":[["hasAny",["camel case","camelcase","citriculture","element","housing","item number","lower camel case","nth","position","shortest","shortest one","shortest word","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-f0eda3e8","guard":[["hasAny",["citriculture","element","housing","item number","nth","position","shortest","shortest one","shortest word","snake case","snakecase","textile","underscores","variable name"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-fe10fbc8","guard":[["hasAny",["colombo","ea","element","ilis","item number","longest","longest one","longest word","nth","position","snake case","snakecase","underscores","variable name"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-e017e787","guard":[["hasAny",["citriculture","element","housing","item number","nth","position","shortest","shortest one","shortest word","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"category"},{"lit":"Specialised Expo"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-09f0ddda","guard":[["hasAny",["century","fair","hemisfair"]],["has","country"]],"pyramid":["render.list",["iterate.repeat",{"lit":"United States"},["sense.howMany"]]],"mem":null},
{"id":"n-e2d08f3d","guard":[["hasAny",["brussels","caesar cipher","ghent","rotate the letters","shift by","shift each letter"]],["has","country"]],"pyramid":["render.str",["transform.caesar",{"lit":"Belgium"},["sense.howMany"]]],"mem":null},
{"id":"n-7f9092d9","guard":[["hasAny",["housing","shortest","shortest one","shortest word","textile"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is France."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-c3c5b7f7","guard":[["hasAny",["habitat","housing"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is France."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-cb211688","guard":[["hasAny",["fair","longest","longest one","longest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is United States."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-da0204d7","guard":[["hasAny",["colombo","ea","longest","longest one","longest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Italy."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-06db2ba2","guard":[["hasAny",["element","helsingborg","ilis","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Sweden."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-bc5f7420","guard":[["hasAny",["citriculture","conquest","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Israel."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-b035f7ae","guard":[["hasAny",["country","element","item number","nth","position"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"},{"lit":"country"}],["sense.howMany"]]],"mem":null},
{"id":"n-3b679777","guard":[["hasAny",["caesar cipher","citriculture","conquest","rotate the letters","shift by","shift each letter"]],["has","what"]],"pyramid":["render.str",["transform.caesar",{"lit":"Israel"},["sense.howMany"]]],"mem":null},
{"id":"n-a7807c6f","guard":[["hasAny",["helsingborg","ilis"]],["has","give"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Sweden"},["sense.howMany"]]],"mem":null},
{"id":"n-db2e1986","guard":[["hasAny",["de","liège"]],["has","country"]],"pyramid":["render.list",["iterate.repeat",{"lit":"Belgium"},["sense.howMany"]]],"mem":null},
{"id":"n-000ee080","guard":[["hasAny",["ilis","longest","longest one","longest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Sweden."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-0344962a","guard":[["hasAny",["delete","element","helsingborg","item number","nth","position","remove","strip out","without"]],["has","give"]],"pyramid":["render.str",["transform.remove",{"lit":"Sweden"},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-0b37ecbf","guard":[["has","bicentenaire"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Haiti."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-18b7cd19","guard":[["hasAny",["iva","longest","longest one","longest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is West Germany."]},["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-4b719013","guard":[["has","great"],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is United Kingdom."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-912d18f8","guard":[["has","ghent"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Belgium."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-f29b5be3","guard":[["has","del"],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Italy."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-fa7f2474","guard":[["hasAny",["citriculture","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Israel."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-21d8c169","guard":[["hasAny",["arts","camel case","camelcase","lower camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is France."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-42f80581","guard":[["hasAny",["element","item number","nth","position","textile"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is France."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-c0808514","guard":[["hasAny",["aeronautic","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Finland."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-c7478815","guard":[["hasAny",["austrian","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is Austria-Hungary."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-db1bc27d","guard":[["hasAny",["element","interbau","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is West Germany."]},["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]]],"mem":null},
{"id":"n-f5b83623","guard":[["hasAny",["aeronautic","delete","element","item number","nth","position","remove","strip out","without"]],["has","tell"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}],["sense.unit"]]],"mem":null},
{"id":"n-0557f135","guard":[["hasAny",["element","item number","nth","position","progress","shortest","shortest one","shortest word"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Century of Progress is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-08376ece","guard":[["hasAny",["element","ghent","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Exposition universelle et international / Ghent International Exposition is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-096fdfaf","guard":[["hasAny",["bicentenaire","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Exposition internationale du bicentenaire de Port-au-Prince is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-1a228d00","guard":[["hasAny",["ea","element","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of EA 53 is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-4df76652","guard":[["hasAny",["element","ilis","item number","longest","longest one","longest word","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ILIS 1936 is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-618aab6f","guard":[["hasAny",["colombo","element","item number","longest","longest one","longest word","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Expo Colombo '92 is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-66e4b4fa","guard":[["hasAny",["element","item number","longest","longest one","longest word","new","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of New York World's Fair is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-704c8dd8","guard":[["hasAny",["element","housing","item number","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of International Exhibition on Urbanism and Housing is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-7b4c63b2","guard":[["hasAny",["columbian","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of World's Columbian Exposition is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-7cf636cf","guard":[["hasAny",["del","element","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Esposizione internazionale dell'industria e del lavoro is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-7e4b7975","guard":[["hasAny",["centennial","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Centennial Exposition is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-858c6737","guard":[["hasAny",["element","habitat","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The International Exhibition of Rural Habitat in Lyon is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-9e9d360f","guard":[["hasAny",["element","item number","louisiana","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Louisiana Purchase is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-9ffac88c","guard":[["hasAny",["element","great","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The Great Exhibition is ",{"slot":1},"."]},["sense.wordAt",{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-b213e757","guard":[["hasAny",["arts","camel case","camelcase","longest","longest one","longest word","lower camel case","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is France."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]]],"mem":null},
{"id":"n-b7a164cd","guard":[["hasAny",["element","item number","iva","longest","longest one","longest word","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of IVA 65 is ",{"slot":1},"."]},["aggregate.longest",["sense.words"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-e32643f9","guard":[["hasAny",["element","item number","nth","position","shortest","shortest one","shortest word","textile"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The International Textile Exhibition is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-eecf6adf","guard":[["hasAny",["citriculture","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Exhibition of Citriculture is ",{"slot":1},"."]},["aggregate.shortest",["sense.content"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-02051200","guard":[["hasAny",["austrian","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Weltausstellung 1873 Wien / Austrian International Exposition is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-13b61d77","guard":[["hasAny",["conquest","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Conquest of the Desert (exhibition) is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-250f19a2","guard":[["hasAny",["element","helsingborg","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Helsingborg Exhibition 1955 is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-26e611f6","guard":[["hasAny",["element","item number","leau","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Exposition internationale de l'eau (1939) is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-667e8464","guard":[["hasAny",["element","hemisfair","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of HemisFair '68 is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-7bcc6b8a","guard":[["hasAny",["element","item number","nth","panamapacific","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Panama–Pacific International Exposition is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-8f1a69aa","guard":[["hasAny",["century","element","item number","nth","position"]],["has","give"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Century 21 Exposition is ",{"slot":1},"."]},["transform.nthStr",["sense.content"],["sense.howMany"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-a11beacd","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / Paris International ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-a6731062","guard":[["hasAny",["element","interbau","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Interbau is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-aa5e6f00","guard":[["hasAny",["element","item number","navigation","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The International Exhibition of Navigation (1954) is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-cb64b87b","guard":[["hasAny",["element","item number","liège","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Liège International (1905) is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-e7bc9923","guard":[["hasAny",["element","item number","nth","position","sport"]],["has","country"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of The International Expo of Sport (1955) is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-f6242061","guard":[["hasAny",["aeronautic","element","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of Second International Aeronautic Exhibition is ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-d1c45a42","guard":[["hasAny",["element","interbau","item number","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-1c0f9932","guard":[["hasAny",["element","interbau","invert case","item number","nth","position","swap case","toggle case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.swapCase",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-50af85ad","guard":[["hasAny",["camel case","camelcase","element","interbau","item number","lower camel case","nth","position"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-9c125005","guard":[["hasAny",["arts","element","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," Exposition is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-ad86fb36","guard":[["hasAny",["class name","element","interbau","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","tell"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":4}],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-0255fc13","guard":[["hasAny",["arts","element","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-7194bc8f","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of Exposition Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":0}," ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-141fe753","guard":[["hasAny",["arts","element","invert case","item number","nth","position","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.swapCase",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-5a41ee88","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / Paris International ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-5f1920b4","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-7cf586fd","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.and",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-965e134d","guard":[["hasAny",["all caps","arts","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.upper",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-b21883d5","guard":[["hasAny",["arts","class name","element","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-0dac0afc","guard":[["hasAny",["arts","camel case","camelcase","class name","element","item number","lower camel case","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-21a7d0d9","guard":[["hasAny",["arts","camel case","camelcase","class name","element","item number","lower camel case","nth","pascal case","pascalcase","position","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-31ec9f73","guard":[["hasAny",["arts","element","item number","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.nthStr",["sense.words"],["sense.wordCount"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-6de028e8","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["transform.camel",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-80043a51","guard":[["hasAny",["arts","each word","element","item number","nth","position","split into words","words"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["render.list",["transform.words",["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-87328fea","guard":[["hasAny",["arts","camel case","camelcase","element","invert case","item number","lower camel case","nth","position","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-9cc7a358","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-b1714d66","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position","reverse the words","reverse word order","words backwards"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-b56c971b","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-bdd54640","guard":[["hasAny",["arts","each word","element","item number","nth","position","split into words","words"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["render.and",["transform.words",["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-caf59bef","guard":[["hasAny",["arts","camel case","camelcase","dashes","element","hyphens","item number","kebab case","kebabcase","lower camel case","nth","position","slug"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-d2765048","guard":[["hasAny",["all caps","arts","camel case","camelcase","capital letters","capitals","element","item number","lower camel case","nth","position","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["transform.upper",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-dd8a34a4","guard":[["hasAny",["arts","camel case","camelcase","element","invert case","item number","lower camel case","nth","position","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-ea7ba8d2","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position","snake case","snakecase","underscores","variable name"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-f159a1e2","guard":[["hasAny",["all caps","arts","camel case","camelcase","capital letters","capitals","element","item number","lower camel case","nth","position","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-ffe70efa","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","lower case","lowercase","nth","position","small letters"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-02e55874","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts et Techniques dans la Vie Moderne / ",{"slot":2}," ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-2cfccc82","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-38c623b2","guard":[["hasAny",["arts","camel case","camelcase","element","invert case","item number","lower camel case","nth","position","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-5de18acf","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","lower case","lowercase","nth","position","small letters"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-74a58675","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts ",{"slot":1}," Techniques dans la Vie Moderne / ",{"slot":2}," ",{"slot":3}," is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-80bdb2f1","guard":[["hasAny",["all caps","arts","camel case","camelcase","capital letters","capitals","element","item number","lower camel case","nth","position","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-8f05b2d0","guard":[["hasAny",["arts","camel case","camelcase","capitalise","capitalize","capitalize each word","element","item number","lower camel case","nth","position","title case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-9c05fd8a","guard":[["hasAny",["arts","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," Exposition is ",{"slot":4},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-9c09d568","guard":[["hasAny",["arts","camel case","camelcase","each word","element","item number","lower camel case","nth","position","split into words","words"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.lastWord"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-e31bbed3","guard":[["hasAny",["arts","camel case","camelcase","each word","element","item number","lower camel case","nth","position","split into words","words"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.lastWord"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-600a4b6b","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of Exposition ",{"slot":0}," des Arts ",{"slot":1}," Techniques dans la Vie Moderne / ",{"slot":2}," ",{"slot":3}," is ",{"slot":4},"."]},["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-a70ab13f","guard":[["hasAny",["arts","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-d8756b45","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","normalise","normalize","nth","position","simplify the text"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-06c8d801","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.and",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-412b3edd","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position","separate by","split","split by"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.lastWord"]]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-4a40140e","guard":[["hasAny",["arts","element","invert case","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.swapCase",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-8495eb97","guard":[["hasAny",["all caps","arts","capital letters","capitals","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.upper",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-9cbd30ce","guard":[["hasAny",["arts","class name","element","item number","longest","longest one","longest word","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.pascal",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-e90173c2","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-079850bb","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-09574b24","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","reverse the words","reverse word order","shortest","shortest one","shortest word","words backwards"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.reverseWords",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-0e40fb7b","guard":[["hasAny",["arts","each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["render.and",["transform.words",["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-1428c295","guard":[["hasAny",["arts","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.nthStr",["sense.words"],["sense.wordCount"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-1f6cbf67","guard":[["hasAny",["all caps","arts","camel case","camelcase","capital letters","capitals","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-22681aec","guard":[["hasAny",["arts","camel case","camelcase","element","item number","lower camel case","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":5}],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-2c1dcfa6","guard":[["hasAny",["arts","delete","element","item number","nth","position","remove","strip out","without"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-50493360","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["transform.camel",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-50b51f87","guard":[["hasAny",["arts","camel case","camelcase","dashes","element","hyphens","item number","kebab case","kebabcase","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","slug"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-5cf14792","guard":[["hasAny",["arts","camel case","camelcase","element","invert case","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-746c305c","guard":[["hasAny",["element","fair","item number","longest","longest one","longest word","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," of ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["know.where",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"category"},{"lit":"World Expo"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-76eef73e","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-931696ac","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","snake case","snakecase","underscores","variable name"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.snake",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-b7388bd5","guard":[["hasAny",["arts","camel case","camelcase","class name","element","item number","longest","longest one","longest word","lower camel case","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["transform.pascal",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-daca001f","guard":[["hasAny",["arts","camel case","camelcase","element","invert case","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["transform.swapCase",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-efddf311","guard":[["hasAny",["all caps","arts","camel case","camelcase","capital letters","capitals","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["transform.upper",["sense.lastWord"]],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-f09ff731","guard":[["hasAny",["arts","each word","element","item number","longest","longest one","longest word","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["render.list",["transform.words",["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-fa66da8c","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-feb43063","guard":[["hasAny",["arts","camel case","camelcase","class name","element","item number","longest","longest one","longest word","lower camel case","nth","pascal case","pascalcase","position","shortest","shortest one","shortest word","upper camel case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]]],"mem":null},
{"id":"n-3e9e0db3","guard":[["hasAny",["arts","camel case","camelcase","each word","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["render.and",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-54a6849d","guard":[["hasAny",["arts","camel case","camelcase","capitalise","capitalize","capitalize each word","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","title case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-57204772","guard":[["hasAny",["arts","camel case","camelcase","element","invert case","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","swap case","toggle case"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-8796184a","guard":[["hasAny",["arts","camel case","camelcase","delete","element","item number","lower camel case","nth","position","remove","strip out","without"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," Internationale des Arts et Techniques dans la Vie Moderne / ",{"slot":1}," ",{"slot":2}," is ",{"slot":3},"."]},["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-9673b696","guard":[["hasAny",["all caps","arts","camel case","camelcase","capital letters","capitals","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","upper case","uppercase"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-afce5dc5","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["transform.nthStr",["sense.words"],["sense.wordCount"]],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-de979f02","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","lower case","lowercase","nth","position","shortest","shortest one","shortest word","small letters"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-e1e5a7da","guard":[["hasAny",["arts","camel case","camelcase","each word","element","item number","longest","longest one","longest word","lower camel case","nth","position","shortest","shortest one","shortest word","split into words","words"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["render.list",["transform.words",["sense.lastWord"]]],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-179d6c30","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","normalise","normalize","nth","position","shortest","shortest one","shortest word","simplify the text"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.howMany"]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-a70abbcf","guard":[["hasAny",["arts","camel case","camelcase","element","item number","longest","longest one","longest word","lower camel case","nth","position","separate by","shortest","shortest one","shortest word","split","split by"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],["sense.lastWord"]]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-76a764ab","guard":[["hasAny",["arts","delete","element","item number","longest","longest one","longest word","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["sense.lastWord"],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-cb02a67d","guard":[["hasAny",["arts","camel case","camelcase","delete","element","item number","longest","longest one","longest word","lower camel case","nth","position","remove","shortest","shortest one","shortest word","strip out","without"]],["has","country"]],"pyramid":["render.template",{"lit":["The country of ",{"slot":0}," ",{"slot":1}," des Arts ",{"slot":2}," Techniques dans la Vie Moderne / ",{"slot":3}," ",{"slot":4}," is ",{"slot":5},"."]},["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}]],["aggregate.longest",["sense.words"]],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}]],["transform.camel",["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"}],{"lit":1}],{"lit":"fr-tidytuesday-worlds-fairs-548cc1"},{"lit":"name of exposition"},{"lit":"country"}]],"mem":null},
{"id":"n-0972c1bc","guard":[["hasAny",["country","international","liège"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Liège International (1905)":"The country of Liège International (1905) is Belgium."}}},
{"id":"n-0bb935f3","guard":[["hasAny",["country","exhibition","international","textile"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of The International Textile Exhibition":"The country of The International Textile Exhibition is France."}}},
{"id":"n-0f60d274","guard":[["hasAny",["country","exhibition","habitat","international","lyon","rural"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for The International Exhibition of Rural Habitat in Lyon":"The country of The International Exhibition of Rural Habitat in Lyon is France."}}},
{"id":"n-10f3ca70","guard":[["hasAny",["country","exposition","interbau","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Interbau":"The country of Interbau is West Germany."}}},
{"id":"n-12ff6266","guard":[["hasAny",["brussels","country","exposition","international","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Brussels International Exposition":"The country of Brussels International Exposition is Belgium."}}},
{"id":"n-18e99e2e","guard":[["hasAny",["country","fair","worlds"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of 1982 World's Fair":"The country of 1982 World's Fair is United States."}}},
{"id":"n-229640ee","guard":[["hasAny",["country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Expo '93":"The country of Expo '93 is South Korea."}}},
{"id":"n-29264072","guard":[["hasAny",["country","expo","exposition","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Expo '74":"The country of Expo '74 is United States."}}},
{"id":"n-2afc0635","guard":[["hasAny",["aeronautic","country","exhibition","exposition","international","name","second"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Second International Aeronautic Exhibition":"The country of Second International Aeronautic Exhibition is Finland."}}},
{"id":"n-2cdfff68","guard":[["hasAny",["country","expo","exposition","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Expo 2015":"The country of Expo 2015 is Italy."}}},
{"id":"n-3a0e7034","guard":[["hasAny",["country","del","dellindustria","e","esposizione","internazionale","lavoro"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Esposizione internazionale dell'industria e del lavoro":"The country of Esposizione internazionale dell'industria e del lavoro is Italy."}}},
{"id":"n-3c0e8b33","guard":[["hasAny",["country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Expo '88":"The country of Expo '88 is Australia."}}},
{"id":"n-3ecf04fe","guard":[["hasAny",["country","de","exposition","internationale","leau","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Exposition internationale de l'eau (1939)":"The country of Exposition internationale de l'eau (1939) is Belgium."}}},
{"id":"n-43e7e8ee","guard":[["hasAny",["centennial","country","exposition"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Centennial Exposition":"The country of Centennial Exposition is United States."}}},
{"id":"n-463d7509","guard":[["hasAny",["country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Expo 71":"The country of Expo 71 is Hungary."}}},
{"id":"n-4685faf4","guard":[["hasAny",["citriculture","country","exhibition"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Exhibition of Citriculture":"The country of Exhibition of Citriculture is Israel."}}},
{"id":"n-486de1a8","guard":[["hasAny",["country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Expo 61":"The country of Expo 61 is Italy."}}},
{"id":"n-48b93171","guard":[["hasAny",["country","ea"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of EA 53":"The country of EA 53 is Italy."}}},
{"id":"n-5615ce57","guard":[["hasAny",["country","expo","exposition","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Expo 2020":"The country of Expo 2020 is United Arab Emirates."}}},
{"id":"n-5a45e710","guard":[["hasAny",["country","exposition","international","name","panamapacific"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Panama–Pacific International Exposition":"The country of Panama–Pacific International Exposition is United States."}}},
{"id":"n-5adee604","guard":[["hasAny",["columbian","country","exposition","worlds"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for World's Columbian Exposition":"The country of World's Columbian Exposition is United States."}}},
{"id":"n-6e3b123f","guard":[["hasAny",["country","fair","new","worlds","york"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of New York World's Fair":"The country of New York World's Fair is United States."}}},
{"id":"n-70921cd1","guard":[["hasAny",["colombo","country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Expo Colombo '92":"The country of Expo Colombo '92 is Italy."}}},
{"id":"n-72dd5fbf","guard":[["hasAny",["country","expo","exposition","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Expo 2005":"The country of Expo 2005 is Japan."}}},
{"id":"n-78ca59b8","guard":[["hasAny",["country","exhibition","great"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for The Great Exhibition":"The country of The Great Exhibition is United Kingdom."}}},
{"id":"n-7cc60877","guard":[["hasAny",["country","expo","exposition","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Expo 91":"The country of Expo 91 is Bulgaria."}}},
{"id":"n-801ff790","guard":[["hasAny",["country","exposition","hemisfair","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition HemisFair '68":"The country of HemisFair '68 is United States."}}},
{"id":"n-83fe7518","guard":[["hasAny",["country","exhibition","housing","international","urbanism"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for International Exhibition on Urbanism and Housing":"The country of International Exhibition on Urbanism and Housing is France."}}},
{"id":"n-92667481","guard":[["hasAny",["country","exposition","international","name","paris"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Paris International":"The country of Paris International is France."}}},
{"id":"n-9464762d","guard":[["hasAny",["country","exposition","international","paris","universelle"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Exposition Universelle / Paris International":"The country of Exposition Universelle / Paris International is France."}}},
{"id":"n-96e63286","guard":[["hasAny",["country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Expo 2017":"The country of Expo 2017 is Kazakhstan."}}},
{"id":"n-9710e127","guard":[["hasAny",["conquest","country","desert","exhibition"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Conquest of the Desert (exhibition)":"The country of Conquest of the Desert (exhibition) is Israel."}}},
{"id":"n-9a93962c","guard":[["hasAny",["country","expo","exposition","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Expo 2012":"The country of Expo 2012 is South Korea."}}},
{"id":"n-a485677e","guard":[["hasAny",["brussels","country","exhibition","exposition","international","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Brussels International Exhibition":"The country of Brussels International Exhibition is Belgium."}}},
{"id":"n-a6a126ff","guard":[["hasAny",["country","expo","international","sport"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of The International Expo of Sport (1955)":"The country of The International Expo of Sport (1955) is Italy."}}},
{"id":"n-a9858627","guard":[["hasAny",["country","exhibition","international","navigation"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of The International Exhibition of Navigation (1954)":"The country of The International Exhibition of Navigation (1954) is Italy."}}},
{"id":"n-aa191088","guard":[["hasAny",["country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Expo '67":"The country of Expo '67 is Canada."}}},
{"id":"n-ad9c547d","guard":[["hasAny",["country","iva"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for IVA 65":"The country of IVA 65 is West Germany."}}},
{"id":"n-bda7b7aa","guard":[["hasAny",["country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Expo '70":"The country of Expo '70 is Japan."}}},
{"id":"n-bdfdee9b","guard":[["hasAny",["bicentenaire","country","de","du","exposition","internationale","portauprince"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Exposition internationale du bicentenaire de Port-au-Prince":"The country of Exposition internationale du bicentenaire de Port-au-Prince is Haiti."}}},
{"id":"n-c09d6781","guard":[["hasAny",["country","exhibition","helsingborg"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Helsingborg Exhibition 1955":"The country of Helsingborg Exhibition 1955 is Sweden."}}},
{"id":"n-c574cf18","guard":[["hasAny",["century","country","exposition"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Century 21 Exposition":"The country of Century 21 Exposition is United States."}}},
{"id":"n-cc66f0b0","guard":[["hasAny",["austrian","country","exposition","international","name","weltausstellung","wien"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Weltausstellung 1873 Wien / Austrian International Exposition":"The country of Weltausstellung 1873 Wien / Austrian International Exposition is Austria-Hungary."}}},
{"id":"n-cdb7c054","guard":[["hasAny",["country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Expo 81":"The country of Expo 81 is Bulgaria."}}},
{"id":"n-cf2e50b5","guard":[["hasAny",["country","ilis"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for ILIS 1936":"The country of ILIS 1936 is Sweden."}}},
{"id":"n-d06fd2cf","guard":[["hasAny",["country","louisiana","purchase"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Louisiana Purchase":"The country of Louisiana Purchase is United States."}}},
{"id":"n-d0cca7c2","guard":[["hasAny",["country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Expo '92":"The country of Expo '92 is Spain."}}},
{"id":"n-d7957316","guard":[["hasAny",["country","expo"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what is the country of Expo '75":"The country of Expo '75 is Japan."}}},
{"id":"n-e4a482d5","guard":[["hasAny",["country","expo","exposition","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Expo 2008":"The country of Expo 2008 is Spain."}}},
{"id":"n-e60c1e90","guard":[["hasAny",["century","country","progress"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Century of Progress":"The country of Century of Progress is United States."}}},
{"id":"n-eb8aae2b","guard":[["hasAny",["country","expo","exposition","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Expo '98":"The country of Expo '98 is Portugal."}}},
{"id":"n-edfa1671","guard":[["hasAny",["country","et","exposition","ghent","international","universelle"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the country for Exposition universelle et international / Ghent International Exposition":"The country of Exposition universelle et international / Ghent International Exposition is Belgium."}}},
{"id":"n-f61c7759","guard":[["hasAny",["arts","country","dans","des","et","exposition","international","internationale","la","moderne","name","paris","techniques","vie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition":"The country of Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition is France."}}},
{"id":"n-4e01490a","guard":[["hasAny",["caesar cipher","del","rotate the letters","shift by","shift each letter"]],["has","esposizione"],["has","country"]],"pyramid":["render.str",["transform.caesar",{"lit":"Italy"},["sense.howMany"]]],"mem":null},
{"id":"n-d6cd7158","guard":[["hasAny",["aeronautic","brussels","centennial","century","citriculture","columbian","conquest","del","et","great","habitat","housing","interbau","internationale","louisiana","new","panamapacific","paris","textile"]],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition":"The country of Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition is France.","what is the country of Louisiana Purchase":"The country of Louisiana Purchase is United States.","tell me the country of the name of exposition Paris International":"The country of Paris International is France.","give the country for World's Columbian Exposition":"The country of World's Columbian Exposition is United States.","give the country for Century of Progress":"The country of Century of Progress is United States.","tell me the country of the name of exposition Second International Aeronautic Exhibition":"The country of Second International Aeronautic Exhibition is Finland.","what is the country of Exhibition of Citriculture":"The country of Exhibition of Citriculture is Israel.","give the country for The Great Exhibition":"The country of The Great Exhibition is United Kingdom.","what is the country of Exposition Universelle / Paris International":"The country of Exposition Universelle / Paris International is France.","give the country for International Exhibition on Urbanism and Housing":"The country of International Exhibition on Urbanism and Housing is France.","what is the country of Conquest of the Desert (exhibition)":"The country of Conquest of the Desert (exhibition) is Israel.","what is the country of Centennial Exposition":"The country of Centennial Exposition is United States.","what is the country of The International Textile Exhibition":"The country of The International Textile Exhibition is France.","tell me the country of the name of exposition Brussels International Exposition":"The country of Brussels International Exposition is Belgium.","give the country for Exposition universelle et international / Ghent International Exposition":"The country of Exposition universelle et international / Ghent International Exposition is Belgium.","what is the country of New York World's Fair":"The country of New York World's Fair is United States.","tell me the country of the name of exposition Brussels International Exhibition":"The country of Brussels International Exhibition is Belgium.","tell me the country of the name of exposition Interbau":"The country of Interbau is West Germany.","give the country for Exposition internationale du bicentenaire de Port-au-Prince":"The country of Exposition internationale du bicentenaire de Port-au-Prince is Haiti.","tell me the country of the name of exposition Panama–Pacific International Exposition":"The country of Panama–Pacific International Exposition is United States.","give the country for Esposizione internazionale dell'industria e del lavoro":"The country of Esposizione internazionale dell'industria e del lavoro is Italy.","give the country for The International Exhibition of Rural Habitat in Lyon":"The country of The International Exhibition of Rural Habitat in Lyon is France."}}},
{"id":"n-18d99fd0","guard":[["has","interbau"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Interbau":"The country of Interbau is West Germany."}}},
{"id":"n-1e28843c","guard":[["has","textile"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of The International Textile Exhibition":"The country of The International Textile Exhibition is France."}}},
{"id":"n-2ad1e30b","guard":[["hasAny",["country","exhibition","habitat","international","lyon","rural"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for The International Exhibition of Rural Habitat in Lyon":"The country of The International Exhibition of Rural Habitat in Lyon is France."}}},
{"id":"n-323396c1","guard":[["hasAny",["century","country","progress"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for Century of Progress":"The country of Century of Progress is United States."}}},
{"id":"n-4f3e7cfb","guard":[["hasAny",["new","york"]],["has","what"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of New York World's Fair":"The country of New York World's Fair is United States."}}},
{"id":"n-59ac0ea2","guard":[["has","panamapacific"],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Panama–Pacific International Exposition":"The country of Panama–Pacific International Exposition is United States."}}},
{"id":"n-59dedbff","guard":[["hasAny",["centennial","country","exposition"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of Centennial Exposition":"The country of Centennial Exposition is United States."}}},
{"id":"n-774db7b7","guard":[["hasAny",["bicentenaire","country","de","du","exposition","internationale","portauprince"]],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for Exposition internationale du bicentenaire de Port-au-Prince":"The country of Exposition internationale du bicentenaire de Port-au-Prince is Haiti."}}},
{"id":"n-9bc5e3b7","guard":[["hasAny",["aeronautic","second"]],["has","tell"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Second International Aeronautic Exhibition":"The country of Second International Aeronautic Exhibition is Finland."}}},
{"id":"n-9fed4689","guard":[["hasAny",["conquest","country","desert","exhibition"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of Conquest of the Desert (exhibition)":"The country of Conquest of the Desert (exhibition) is Israel."}}},
{"id":"n-b4ae5cc7","guard":[["has","citriculture"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of Exhibition of Citriculture":"The country of Exhibition of Citriculture is Israel."}}},
{"id":"n-b9e5d93c","guard":[["hasAny",["country","del","dellindustria","e","esposizione","internazionale","lavoro"]],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for Esposizione internazionale dell'industria e del lavoro":"The country of Esposizione internazionale dell'industria e del lavoro is Italy."}}},
{"id":"n-baa78407","guard":[["hasAny",["housing","urbanism"]],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for International Exhibition on Urbanism and Housing":"The country of International Exhibition on Urbanism and Housing is France."}}},
{"id":"n-ca0caa3c","guard":[["hasAny",["columbian","country","exposition","worlds"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for World's Columbian Exposition":"The country of World's Columbian Exposition is United States."}}},
{"id":"n-ce0bd826","guard":[["hasAny",["country","louisiana","purchase"]],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what is the country of Louisiana Purchase":"The country of Louisiana Purchase is United States."}}},
{"id":"n-d265e097","guard":[["hasAny",["arts","country","dans","des","et","exposition","international","internationale","la","moderne","name","paris","techniques","vie"]],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tell me the country of the name of exposition Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition":"The country of Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition is France."}}},
{"id":"n-e5e1c87c","guard":[["has","great"],["has","give"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for The Great Exhibition":"The country of The Great Exhibition is United Kingdom."}}},
{"id":"n-f173ed0c","guard":[["hasAny",["et","ghent"]],["has","country"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the country for Exposition universelle et international / Ghent International Exposition":"The country of Exposition universelle et international / Ghent International Exposition is Belgium."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"tell me the country of the name of exposition HemisFair '68","expect":{"contains":["United States"],"notRefusal":true}},{"q":"tell me the country of the name of exposition Exposition Internationale des Arts et Techniques dans la Vie Moderne / Paris International Exposition","expect":{"contains":["France"],"notRefusal":true}},{"q":"what is the country of Louisiana Purchase","expect":{"contains":["United States"],"notRefusal":true}},{"q":"tell me the country of the name of exposition Paris International","expect":{"contains":["France"],"notRefusal":true}},{"q":"give the country for World's Columbian Exposition","expect":{"contains":["United States"],"notRefusal":true}},{"q":"give the country for Century of Progress","expect":{"contains":["United States"],"notRefusal":true}},{"q":"what is the country of Expo '88","expect":{"contains":["Australia"],"notRefusal":true}},{"q":"tell me the country of the name of exposition Expo 2005","expect":{"contains":["Japan"],"notRefusal":true}},{"q":"tell me the country of the name of exposition Second International Aeronautic Exhibition","expect":{"contains":["Finland"],"notRefusal":true}},{"q":"tell me the country of the name of exposition Expo '74","expect":{"contains":["United States"],"notRefusal":true}},{"q":"what is the country of Exhibition of Citriculture","expect":{"contains":["Israel"],"notRefusal":true}},{"q":"what is the country of Expo '93","expect":{"contains":["South Korea"],"notRefusal":true}},{"q":"give the country for Expo '67","expect":{"contains":["Canada"],"notRefusal":true}},{"q":"what is the country of 1982 World's Fair","expect":{"contains":["United States"],"notRefusal":true}},{"q":"tell me the country of the name of exposition Expo 2020","expect":{"contains":["United Arab Emirates"],"notRefusal":true}},{"q":"what is the country of Expo Colombo '92","expect":{"contains":["Italy"],"notRefusal":true}},{"q":"give the country for The Great Exhibition","expect":{"contains":["United Kingdom"],"notRefusal":true}},{"q":"what is the country of The International Expo of Sport (1955)","expect":{"contains":["Italy"],"notRefusal":true}},{"q":"give the country for Expo 81","expect":{"contains":["Bulgaria"],"notRefusal":true}},{"q":"tell me the country of the name of exposition Expo 2015","expect":{"contains":["Italy"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
