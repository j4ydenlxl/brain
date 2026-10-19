// added-of-name-fbfb-rev-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"added-of-name-fbfb-rev-neo-g10","class":"added-of-name-fbfb-rev","generation":10,"lane":"neo","grownFrom":["which name has the added 2016-11-27T23:01:46Z","name the name whose added is 2021-02-07T16:02:44Z","2021-02-07T16:05:50Z is the added of which name","which name has the added 2021-02-07T16:10:12Z","which name has the added 2021-02-07T16:08:12Z","2016-03-09T05:58:34Z is the added of which name","name the name whose added is 2021-02-07T16:17:21Z","2021-02-07T16:11:47Z is the added of which name","name the name whose added is 2021-02-07T16:20:30Z","which name has the added 2021-02-10T08:22:45Z","which name has the added 2021-02-07T16:08:33Z","name the name whose added is 2015-12-05T06:47:56Z","name the name whose added is 2021-07-12T14:46:56Z","which name has the added 2023-03-05T12:17:10Z","2021-02-28T16:48:40Z is the added of which name","which name has the added 2021-02-07T16:11:23Z","2021-07-09T14:14:34Z is the added of which name","which name has the added 2021-02-07T16:12:41Z","which name has the added 2021-02-07T16:12:29Z","name the name whose added is 2023-03-05T12:20:21Z"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-apisguru-apis-7d42db","columns":["name","version","added","updated"],"n":2529,"cols":[{"f":"01forge.com|1password.com:events|06-dot-authentiqio.appspot.com|0ably.io:platform|1dafruit.com|2obe.com:aem|2yen.com:AccountService|aBalanceControlService|hPlatformConfigurationNotification-v1|pPaymentNotification-v1|pService|pTransferNotification-v3|binLookupService|aCheckoutUtilityService|aFundService|aPaymentService|1fterbanks.com|1gco-ats.com|1madeus.com|b:amadeus-airline-code-lookup|nport-nearest-relevant|son-time-performance|kbranded-fares-upsell|kflight-availabilities-search|rcheapest-date-search|toice-prediction|sreate-orders|khotel-name-autocomplete|ktrip-parser|qurpose-prediction|3zonaws.com:AWSMigrationHub|eaccessanalyzer|gm|h-pca|fmp|hlify|fpigateway|omanagementapi|ov2|gpconfig|hlication-autoscaling|qinsights|hstream|fthena|futoscaling|p-plans|ebatch|fraket|ece|fhime|flouddirectory|jsearch|pdomain|fodeartifact|iguru-reviewer|istar|m-connections|nnotifications|ggnito-identity|gmprehend|edetective|gvops-guru|fiscovery|flm|fms|focdb|fynamodb|eecr|flasticbeanstalk|lloadbalancing|yv2|fs|fventbridge|efms|forecast|frauddetector|fsx|egamelift|flobalaccelerator|gue|fuardduty|ehealthlake|eimagebuilder|fot|h1click-devices|hsitewise|ekafka|finesis-video-archived-media|elicense-manager|gghtsail|emacie2|grketplacecommerceanalytics|fediastore|fodels.lex.v2|fwaa|eopsworkscm|epersonalize|p-runtime|froton|equicksight|eservicediscovery|fso|etimestream-query|eworkdocs|imail|mmessageflow|2entum.space:aviation_radiation|eglobal-magnet|fravity|1pache.org|2i.ebay.com:sell-account|jnalytics|icompliance|4gov.uk:vehicle-enquiry|4video|32cart.com|3dapp.com|4eck.com:accounting|cecosystem|3matic.io|3z.ebay.com:commerce-identity|2pcenter.ms|3write.io:client|1rchive.org:search|1zure.com:EnterpriseKnowledgeGraph-EnterpriseKnowledgeGraphSwagger|aaddons-Addons|cvisor|blertsmanagement-SmartDetectorAlertRulesApi|bnalysisservices|bpimanagement-apimapis|wByTags|scaches|semailtemplate|cpconfiguration|dlicationinsights-QueryPackQueries_API|uaiOperations_API|ucomponentAnnotations_API|znentProactiveDetection_API|uworkbookOperations_API|zookTemplates_API|dplatform|bttestation|buthorization|n-authorization-DenyAssignmentGetCalls|zon-ProviderOperationsCalls|zon-RACalls|domation-account|ldscCompilationJob|ljob|lpython2package|bzsadmin-Backup|jCommerce|mpute|jDiskMigrationJobs|kownloadedProduct|jGallery|jLoadBalancers|jRegionHealth|jStorageSubSystem|jacquisitions|jblobServices|cureactivedirectory|fdata|fstack-AzureStack|abatch-BatchManagement|lService|billing|blueprint-assignmentOperation|acdn|bognitiveservices-AnomalyFinder|sContentModerator|sLUIS-Programmatic|sPersonalizer|sQnAMaker|cmmerce|dpute|h-disk|igallery|irunCommands|iskus|cntainerregistry-containerregistry_build|jservice-location|qs-managedClusters|csmos-db-privateEndpointConnection|adatafactory|elake-analytics-job|bevops|dspaces|afrontdoor-webapplicationfirewall|ahdinsight-capabilities|kjob|bybriddatamanager-hybriddata|aimds|akeyvault-providers|amachinelearningcompute-machineLearningCompute|pexperimentation-machineLearningExperimentation|pservices-artifact|cnagementgroups-management|kpartner-ManagementPartner|criadb-DataEncryptionKeys|iPrivateEndpointConnections|bediaservices-AccountFilters|bixedreality-proxy|bonitor-alertRulesIncidents_API|jutoscale_API|imetricNamespaces_API|iserviceDiagnosticsSettings_API|aoperationalinsights-OperationalInsights|asearch-searchindex|crvermanagement|eicefabric-application|bql-advisors|ebackupLongTermRetentionPolicies|bubscription-subscriptionDefinitions|0bbc.com|1claws.ca:bclaws|1eanstream.com|1ikewise.org|2ntable.com|1lazemeter.com|1otschaft.local|1rex.io|2idgedb.org|0canada-holidays.ca|2rbondoomsday.com|1ircl.lu:hashlookup|4uitsandbox.net|2sco.com|2trixonline.com:gotomeeting|hscim|1learblade.com|2icksend.com|1odat.io:accounting|3esearch.debian.net|2njur.local|2re.ac.uk|3rently.io|1rediwatch.com:covid19|2ucible.local|1ybertaxonomy.eu|2cat.org|0dataflowkit.com|1eutschebahn.com:betriebsstellen|hfasta|1igitallinguistics.io|1nd5eapi.co|1ocusign.net|2mainsdb.info|0ebay.com:buy-browse|dfeed|9developer-analytics|1lmah.io|1node.io|1pa.gov:air|8dfr|1tsi.local:MEC010-2_AppPkgMgmt|0flat.io|1ungenerators.com:barcode|irandom-facts|3translations.com:braile|0geneea.com|2tgo.com:gototraining|1isgraphy.com|2thub.com|a:api.github.com.2022-11-28|bghes-2.18|1oogleapis.com:abusiveexperiencereport|gccessapproval|lcontextmanager|hmedns|gdexchangebuyer|u2|glertcenter|gnalytics|ohub|oreporting|hdroidenterprise|mpublisher|gpigateway|jee|ikeys|grea120tables|htifactregistry|fbaremetalsolution|htch|geyondcorp|gigquery|glogger|fchromemanagement|gloudbilling|kiot|kprivatecatalog|ksupport|gontent|fdataplex|gfareporting|gialogflow|hsplayvideo|gocumentai|ffirebaseappcheck|nstorage|gorms|fideahub|fkeep|flicensing|fmybusinessbusinessinformation|pplaceactions|fpagespeedonline|glayablelocations|fremotebuildexecution|fsearchads360|2v.bc.ca:gwells|1roundhog-day.com|1sa.gov|0healthcare.gov|1hs.gov|1sbc.com:atm|1ubapi.com:analytics|cuth|0icons8.com|1dtbeyond.com|1mport.io:data|1nboxroute.com|2terzoid.com:convertcurrency|0kumpeapps.com|0letmc.com:basic-tier|1ink.fish|1ufthansa.com:partner|0mailboxvalidator.com:checker|2stercard.com:BINTableResource|fMDES|1ercedes-benz.com:configurator|1icrocks.local|5soft.com:cognitiveservices-ComputerVision|egraph|0n-auth.com|1amsor.com|2sa.gov:apod|2viplancentral.com:factfinder|1dhm.gov.in:ndhm-cm|1etbox.dev|3lify.com|2xmo.com:account|aconversation|1pr.org:authorization|1rel.gov:transportation-incentives-laws|1ytimes.com:archive|eticle_search|0o2.cz:mobility|1penbanking.org.uk:account-info-openapi|0parliament.uk:commonsvotes|2sswordutility.net|1ersonio.de:authentication|1ostmarkapp.com:account|0sportsdata.io:cbb-v3-scores|1urrey.ca:open511|0tomtom.com:maps|1wilio.com:api|btwilio_accounts_v1|imicrovisor_v1|0vonage.com:account|1tex.local:Catalog-API|bMarketplace-APIs|0walmart.com:inventory|1hapi.com:accounts|1indows.net:batch-BatchService|1mata.com:bus-realtime|0xero.com:xero-identity|0clickmeter.com|0slideroom.com|0datumbox.com|0peel-ci.com|0spectrocoin.com|0vatapi.com|0owler.com|0googleapis.com:classroom|1ettyimages.com|0exavault.com|0scrapewebsite.email|0hetras-certification.net:booking|0pandorabots.com|0firebrowse.org|0moonmoonmoonmoon.com|0cambase.io|1itycontext.com|0magick.nu|0nsidc.org|0taxamo.com|0solarvps.com|0clarify.io|0instagram.com|0zoomconnect.com|0orghunter.com|0geodesystems.com|0oceandrivers.com|0nrel.gov:building-case-studies|1ativeads.com|1etlicensing.io|0smart-me.com|0motaword.com|0statsocial.com|0vestorly.com|0getgo.com:gotowebinar|0hetras-certification.net:hotel|0learnifier.com|0thetvdb.com|0watchful.li|0semantria.com|0reverb.com|0dweet.io|0simplyrets.com|0jirafe.com|0refugerestrooms.org|0graphhopper.com|0thenounproject.com|1rello.com|0xkcd.com|0apis.guru|0bufferapp.com|0consumerfinance.gov|0data.gov|0mandrillapp.com|0wikimedia.org|1ordnik.com|0stackexchange.com|0botify.com|0data2crm.com|0sendgrid.com|0bigoven.com|0rbaskets.in|0azure.com:compute-containerService|cntainerservice-containerService|qs-containerService|aintune|alogic|amobileengagement-mobile-engagement|anetwork|botificationhubs|ascheduler|aweb-AppServiceCertificateOrders|adevtestlabs-DTL|apowerbiembedded|0netatmo.net|0opencagedata.com|0brandlovers.com|0channel4.com|0windows.net:graphrbac|0europeana.eu|0azure.com:mediaservices-media|0omdbapi.com|0getsandbox.com|0azure.com:machinelearning-commitmentPlans|0medium.com|0nytimes.com:books_api|ccommunity|cgeo_api|cmovie_reviews|csemantic_api|ctimes_tags|hwire|dop_stories|0bitbucket.org|0furkot.com|0magento.com|0azure.com:monitor-tenantActivityLogs_API|arecoveryservices-vaultusages|qbackup|w-backupManagement|0cenit.io|0nytimes.com:most_popular_api|0rottentomatoes.com|0swagger.io:generator|0oxforddictionaries.com|0azure.com:search|0squareup.com|0import.io:extraction|arss|bun|aschedule|0appveyor.com|0circleci.com|0uebermaps.com|0ijenko.net|0browshot.com|1luemix.net:containers|0visagecloud.com|0schooldigger.com|0authentiq.io|1pacta.com|0ritc.io|0epa.gov:case|9wa|8echo|9ff|8rcra|8sdw|0mermade.org.uk:openapi-converter|0zappiti.com|0cnab-online.herokuapp.com|0gitlab.com|0neutrinoapi.net|0mozilla.com:kinto|0gov.bc.ca:bcdc|cgnws|ageocoder|ajobposting|aopen511|0lyft.com|0azure.com:hdinsight-operations|arecoveryservices-backup|clay|csourcehealth|aservice-map-arm-service-map|btorsimple8000series-storsimple|bubscription-operations|0beezup.com|0nba.com|0tfl.gov.uk|0amazonaws.com:elasticache|eglacier|eiam|emonitoring|erds|fedshift|es3|fdb|fqs|fts|0deutschebahn.com:fahrplan|ilinkster|hreisezentren|hstada|0runscope.com|0synq.fm|0victorops.com|0figshare.com|0bbc.co.uk|0ebay.com:buy-marketing|9commerce-taxonomy|0openbanking.org.uk|0lufthansa.com:public|0postmarkapp.com:server|0tvmaze.com|0ptv.vic.gov.au|0wmata.com:bus-route|aincidents|arail-realtime|fstation|0o2.cz:sociodemo|0storecove.com|0giphy.com|0bungie.net|0dropx.io|0osisoft.com|0aucklandmuseum.com|0lotadata.com|0callfire.com|0dataatwork.org|0zalando.com|0ato.gov.au|0twinehealth.com|0azure.com:cosmos-db|bustomer-insights|amariadb|bysql|apostgresql|arecoveryservicessiterecovery-service|astreamanalytics-functions|0openfintech.io|0freesound.org|0illumidesk.com|0airport-web.appspot.com|0shipstation.com|1taging-ecotaco.com|0launchdarkly.com|0etmdb.com|0selectpdf.com|0taxrates.io|0mashape.com:geodb|0nfusionsolutions.biz|0funtranslations.com:index|0stripe.com|0twitter.com:legacy|0avaza.com|0spinbot.net|0weatherbit.io|0jumpseller.com|0wowza.com|0salesloft.com|0iva-api.com|0clever-cloud.com|0deeparteffects.com|0hackathonwatch.com|0payrun.io|0whapi.com:bets|alocations|anumbers|asessions|bportsdata|0polygon.io|0osf.io|1pendatasoft.com|0vocadb.net|0formapi.io|0art19.com|0paccurate.io|0aviationdata.systems|0naviplancentral.com:plan|0mcw.edu|0betfair.com|0koomalooma.com|0wso2apistore.com:transform|0ebay.com:sell-fulfillment|0iqualify.com|1sendpro.com|0paylocity.com|0roaring.io|0transavia.com|0voodoomfg.com|0haloapi.com:metadata|cugc|cprofile|cstats|0amazonaws.com:mediastore-data|eruntime.sagemaker|1zure.com:apimanagement|n-apimdeployment|snetworkstatus|squotas|stenant|cplicationinsights-componentApiKeys_API|znentContinuousExport_API|znents_API|uwebTests_API|buthorization-authorization-RoleAssignmentsCalls|zon-RoleBasedCalls|domation-certificate|monnection|vType|mredential|ldscConfiguration|lhybridRunbookWorkerGroup|ljobSchedule|lmodule|lschedule|moftwareUpdateConfiguration|zConfigurationMachineRun|zConfigurationRun|lvariable|lwebhook|acognitiveservices|cmpute-swagger|cntainerinstance-containerInstance|adatalake-analytics-account|jstore-account|emigration|beviceprovisioningservices-iotdps|bomainservices|aeventgrid-EventGrid|fhub-EventHub|r-preview|ahdinsight-cluster|lonfigurations|kextensions|alocationbasedservices|amachinelearning-webservices|rorkspaces|cps-maps-management|crketplaceordering-Agreements|bonitor-actionGroups_API|mvityLogAlerts_API|ts_API|jlertRules_API|idiagnosticsSettingsCategories_API|zgs_API|ieventCategories_API|ilogProfiles_API|imetricDefinitions_API|os_API|ioperations_API|anetwork-applicationSecurityGroup|icheckDnsAvailability|iendpointService|inetworkWatcher|ioperation|irouteFilter|iserviceCommunity|iusage|ivirtualNetworkGateway|jmssNetworkInterface|mPublicIpAddress|aoperationsmanagement-OperationsManagement|apowerbidedicated|brovisioningservices-iotdps|arecoveryservices-registeredidentities|tplicationusages|rvaults|qbackup-jobs|xoperations|xregisteredIdentities|cdis|cservations|dources|j-features|klinks|locks|kmanagedapplications|qment|kpolicy|ksubscriptions|aservicebus|bql-FailoverDatabases|mElasticPools|eManagedInstanceEncryptionProtectors|tKeys|eServerAzureADAdministrators|ebackupLongTermRetentionVaults|ks|flobAuditingPolicies|ecancelOperations|fonnectionPolicies|edataMasking|iWarehouseUserActivities|ibaseAutomaticTuning|ms|feprecated|eencryptionProtectors|efailoverGroups|firewallRules|egeoBackupPolicies|eimportExport|emanagedDatabases|fetrics|eoperations|equeries|erenameDatabase|gplicationLinks|eserverAutomaticTuning|kCommunicationLinks|kDnsAliases|kKeys|ks|iiceObjectives|fql.core|fyncAgents|iGroups|iMembers|etableAuditing|evirtualNetworkRules|btorage|himportexport|creamanalytics-inputs|qoutputs|qstreamingjobs|rubscriptions|qtransformations|atrafficmanager|o-trafficmanageranalytics|avisualstudio-Csm|aweb-AppServicePlans|eCertificateRegistrationProvider|ps|eDiagnostics|fomainRegistrationProvider|ks|eProvider|eRecommendations|gsourceProvider|eTopLevelDomains|eservice|0microsoft.com:cognitiveservices-AutoSuggest|wCustomSearch|wEntitySearch|wLocalSearch|wSpellCheck|wVideoSearch|wWebSearch|0evetech.net|0qualpay.com|0traccar.org|0zuora.com|0microsoft.com:cognitiveservices-ImageSearch|0thesmsworks.co.uk|0azure.com:containerservice-managedClusters|qs-location|adatacatalog|amonitor-baseline_API|icalculateBaseline_API|imetricBaselines_API|bsi-ManagedIdentity|0microsoft.com:cognitiveservices-NewsSearch|0wordassociations.net|0apigee.net:marketcheck-cars|0cloudmersive.com:ocr|0envoice.in|0zoom.us|0opentargets.io|0infermedica.com|0turbinelabs.io|0spinitron.com|0miataru.com|0personio.de:personnel|1ayments.service.gov.uk:payments|0greenpeace.org|0flickr.com|0archive.org:wayback|0clever.com|0phila.gov:pollingplaces|0landregistry.gov.uk:deed|0surrey.ca:trafficloops|0who-hosts-this.com|0pendo.io|0tyk.com|0apache.org:qakka|0docker.com:engine|0just-eat.co.uk|0code-scan.com|0highwaysengland.co.uk|0letmc.com:customer|adiary|afree-tier|amaintenance|areporting|0slicebox.local|0azure.com:applicationinsights-componentWorkItemConfigs_API|ufavorites_API|uwebTestLocations_API|buthorization-authorization-ClassicAdminCalls|domation-linkedWorkspace|lsourceControl|ySyncJob|bzsadmin-Alert|kpplicationOperationResults|jCommerceAdmin|mputeOperationResults|jEdgeGateway|uPool|jFabricLocation|kileShare|jInfraRole|sInstance|kpPool|jLogicalNetwork|qSubnet|jMacAddressPool|jNetworkOperationResults|jOperations|jQuota|jResourceHealth|jScaleUnit|sNode|kerviceHealth|klbMuxInstance|ktorageOperationResults|qPool|qSystem|jVolume|curestack-CustomerSubscription|lProduct|lRegistration|acognitiveservices-ComputerVision|sFace|sLUIS-Authoring|xRuntime|sTextAnalytics|adatalake-analytics-catalog|jstore-filesystem|aguestconfiguration-guestconfiguration_NotImplemented|ahanaonazure|akeyvault|i-secrets|amigrate|anetwork-networkInterface|ipublicIpAddress|irouteTable|apolicyinsights-policyEvents|vStates|arecoveryservicesbackup-bms|asearch-searchservice|crvicefabric|bql-cancelPoolOperations|fheckNameAvailability|edisasterRecoveryConfigurations|emanagedInstanceOperations|erestorePoints|eserverOperations|0googleapis.com:digitalassetlinks|0microsoft.com:cognitiveservices-Training|0sportsdata.io:cbb-v3-stats|ffb-v3-scores|fsgo-v3-scores|ntats|egolf-v2|elol-v3-scores|mtats|emlb-v3-play-by-play|mrojections|lrotoballer-articles|wpremium-news|lscores|mtats|enascar-v2|fba-v3-play-by-play|mrojections|lrotoballer-articles|wpremium-news|lscores|mtats|ffl-v3-play-by-play|mrojections|lrotoballer-articles|wpremium-news|lscores|mtats|fhl-v3-play-by-play|mrojections|lscores|mtats|esoccer-v3-projections|oscores|ptats|1toplight.io|0waterlinked.com|0isbndb.com|0weber-gesamtausgabe.de|0quotes.rest|0anchore.io|0openstf.io|0noosh.com|0taggun.io|0gov.bc.ca:geomark|0stormglass.io|0walmart.com:item|corder|cprice|0gov.bc.ca:news|0bulksms.com|0opendatanetwork.com|0hillbillysoftware.com:shinobi|0bhagavadgita.io|1andsintown.com|0musixmatch.com|0crossbrowsertesting.com|0pims.io|0amazonaws.com:neptune|0setlist.fm|0nebl.io|0billbee.io|0ornl.gov:daymet|0zenoti.com|0maif.local:otoroshi|0transitfeeds.com|0evemarketer.com|0callcontrol.com|0poemist.com|0visiblethread.com|0fraudlabspro.com:fraud-detection|0redirection.io|0openapi.space|0moderatecontent.com|0trashnothing.com|0bbci.co.uk|0gitea.io|0reloadly.com|0obono.at|0text2data.org|0hydramovies.com|0rapidapi.com:football-prediction|0sonar.trading|0warwick.ac.uk:enterobase|0skynewz-api-fortnite.herokuapp.com|0globalwinescore.com|0languagetool.org|0npr.org:identity|8listening|8sponsorship|9tation-finder|0opto22.com:groov|0fec.gov|0gamesparks.net:game-details|0tomtom.com:routing|bsearch|0azure.com:addons-addons-swagger|chybridhealthservice-ADHybridHealthService|blertsmanagement-AlertsManagement|bpimanagement-apimapiversionsets|scertificates|semailtemplates|sgroups|sidentityprovider|tssues|sloggers|snamedvalues|totifications|sopenidconnectproviders|spolicies|troducts|vperties|ssubscriptions|stags|susers|sversionsets|cplicationinsights-analyticsItems_API|ucomponentFeaturesAndPricing_API|ueaSubscriptionMigration_API|uswagger|uworkbooks_API|buthorization-authorization-RoleDefinitionsCalls|domation-dscNode|sConfiguration|uunts|lrunbook|lsourceControlSyncJobStreams|lwatcher|bzsadmin-AcquiredPlan|ltivation|kzureBridge|jBackupLocations|ps|jDelegatedProvider|zrOffer|kirectoryTenant|lsks|krive|jFabric|jGalleryItem|jInfrastructureInsights|jKeyVault|jLocation|jNetwork|jOffer|oDelegation|jPlan|mtformImages|kroduct|kublicIpAddresses|jQuotas|jSubscriptions|jUpdate|pLocations|pRuns|jVMExtensions|kirtualNetworks|jcontainers|jfarms|jqueueServices|jshares|ktorage|qaccounts|jtableServices|cure-kusto|abatchai-BatchAI|blueprint-blueprintAssignment|tDefinition|botservice|aconsumption|dtainerservice-openShiftManagedClusters|qs-openShiftManagedClusters|adatabox|fricks|beploymentmanager|bns|aengagementfabric-EngagementFabric|afrontdoor|aguestconfiguration|ahardwaresecuritymodules-dedicatedhsm|bdinsight-applications|klocations|kscriptActions|aiotcentral|dhub|dspaces|amachinelearningservices-machineLearningServices|criadb-PrivateLinkResources|bediaservices-Accounts|pssets|uAndAssetFilters|oContentKeyPolicies|oEncoding|oStreamingPoliciesAndStreamingLocators|ostreamingservice|bonitor-guestDiagnosticSettingsAssociation_API|zttings_API|imetricAlert_API|osCreate_API|ischeduledQueryRule_API|bysql-PrivateLinkResources|anetapp|dwork-availableDelegations|rServiceAliases|jzureFirewall|vFqdnTag|iddosProtectionPlan|iexpressRouteCircuit|vrossConnection|uGateway|uPort|iinterfaceEndpoint|inatGateway|jetworkProfile|pSecurityGroup|ipublicIpPrefix|iserviceEndpointPolicy|ivirtualNetwork|wTap|pWan|aoperationalinsights-swagger|apolicyinsights-policyTrackedResources|premediations|cstgresql-PrivateLinkResources|aresourcegraph|is-policyAssignments|qDefinitions|qSetDefinitions|asecurity|crialconsole|dvicebus-servicebus-preview|hfabric-cluster|nmesh|bignalr|bql-DatabaseSchema|necurityAlertPolicies|eManagedBackupShortTermRetention|lDatabaseSecurityAlertPolicies|lInstanceTdeCertificates|tVulnerabilityAssessments|lRestorableDroppedDatabaseBackupShortTermRetenion|lServerSecurityAlertPolicy|ePrivateLinkResources|eServerVulnerabilityAssessments|eTdeCertificates|eblobAuditing|ecapabilities|edatabaseVulnerabilityAssessmentBaselines|zAssessmentScans|zAssessments|eelasticPools|einstanceFailoverGroups|ejobs|elongTermRetention|emanagedDatabaseSensitivityLabels|tVulnerabilityAssesmentRuleBaselines|zabilityAssessmentScans|zabilityAssessments|lInstances|erecommendedElasticPools|zlsDecoupled|iverableManagedDatabases|gstorableDroppedManagedDatabases|eserverSecurityAlertPolicies|fhortTermRetentionPolicies|dvirtualmachine-sqlvm|btorSimple1200Series-StorSimple|eage-DataLakeStorage|iblob|imanagementpolicy|hsync|avisualstudio-PipelineTemplates|orojects|aweb-DeletedWebApps|eResourceHealthMetadata|elogicAppsManagementClient|bindowsiot-WindowsIotServices|borkloadmonitor-Microsoft.WorkloadMonitor|0microsoft.com:cognitiveservices-CustomImageSearch|wOcr|wVisualSearch|0jira.local|0fisheye.local|1ecru.local|0atlassian.com:jira|0patrowl.local|0vimeo.com|0lumminary.com|0azure.com:labservices-ML|aresourcehealth-ResourceHealth|0swaggerhub.com|1heetlabs.com:vedic-society|erig-veda|0geodatasource.com|0api2pdf.com|0tisane.ai|0winsms.co.za|0linode.com|0collegefootballdata.com|0handwrytten.com|0jokes.one|0fungenerators.com:qrcode|0axesso.de|0openlinksw.com:osdb|2to22.com:pac|2entrials.local|0azure.com:cognitiveservices-AnomalyDetector|adataboxedge|aedgegateway|amixedreality|bonitor-vmInsightsOnboarding_API|anetwork-applicationGateway|iddosCustomPolicy|iloadBalancer|aprivatedns|asecurity-advancedThreatProtectionSettings|klerts|llowedConnections|kutoProvisioningSettings|jcomplianceResults|ts|jdiscoveredSecuritySolutions|jexternalSecuritySolutions|jinformationProtectionPolicies|jjitNetworkAccessPolicies|jlocations|joperations|jpricings|jsecurityContacts|lrverVulnerabilityAssessments|jtasks|kopologies|jworkspaceSettings|aweb-AppServiceEnvironments|eWebApps|0youneedabudget.com|0openalpr.com|0here.com:positioning|9tracking|0contribly.com|0aiception.com|0mailboxvalidator.com:disposable|lvalidation|0fraudlabspro.com:sms-verification|0ip2location.com:geolocation|3proxy.com|2infodb.com|0mercedes-benz.com:dealer|jiagnostics|iimage|0azure.com:apimanagement-apimauthorizationservers|sbackends|sdiagnostics|spolicydescriptions|ysnippets|troductsByTags|sregions|uports|stagresources|acdn-cdnwebapplicationfirewall|ahealthcareapis-healthcare-apis|aimagebuilder|amanagedservices|apeering|asecurity-adaptiveNetworkHardenings|jdeviceSecurityGroups|jiotSecuritySolutions|jregulatoryCompliance|bql-instancePools|emanagedInstanceAdministrators|evirtualclusters|atimeseriesinsights|0microsoft.com:cognitiveservices-Prediction|0getthedata.com:bng2latlong|0exchangerate-api.com|0tinyuid.com|0rapidapi.com:language-identification|0akeneo.com|0box.com|0listennotes.com|0bunq.com|0cpy.re:peertube|0departureboard.io|0gov.bc.ca:router|0azure.com:authorization-authorization-ElevateAccessCalls|bzsadmin-Manifest|ablockchain|acognitiveservices-InkRecognizer|sQnAMakerRuntime|cntainerregistry-containerregistry_scopemap|cst-management-costmanagement|bustomproviders|adatashare-DataShare|bynamicstelemetry|amigrateprojects-migrate|cxedreality-remote-rendering|nspatial-anchors|anetwork-bastionHost|iprivateEndpoint|pLinkService|iserviceTags|aportal|aresourcegraph-graphquery|asecurity-applicationWhitelistings|jiotSecuritySolutionAnalytics|boftwareplan|bql-ManagedDatabaseSchema|eusages|bubscription-subscriptions|avmwarecloudsimple|0sportsdata.io:lol-v3-projections|0whatsapp.local|0math.tools|0amentum.space:atmosphere|0funtranslations.com:starwars|0sheerseo.com|0fungenerators.com:lottery|1aretrotter.com|0iptwist.com|0quicksold.co.uk:location|0shutterstock.com|0vonage.com:extension|breports|buser|bvgis|0azure.com:applicationinsights-QueryPacks_API|acontainerregistry|amachinelearningservices-datastore|yexecution|yhyperdrive|ymodelManagement|yrunHistory|cintenance-Maintenance|cnagednetwork-managedNetwork|bediaservices-MediaGraphs|bysql-PrivateEndpointConnections|anetwork-firewallPolicy|inetworkWatcherConnectionMonitorV1|ivirtualRouter|aoperationalinsights-Clusters|apostgresql-PrivateEndpointConnections|asecurity-subAssessments|bql-PrivateEndpointConnections|btorage-file|hcache|0extpose.com|0d7networks.com|0extendsclass.com:json-storage|0regcheck.org.uk|0fulfillment.com|0googleapis.com:acceleratedmobilepageurl|gdexperiencereport|gndroiddeviceprovisioning|mmanagement|gppsactivity|fbigqueryconnection|ndatatransfer|fchat|glouddebugger|kerrorreporting|kkms|kprivatecatalogproducer|mofiler|gommentanalyzer|ipute|fdataflow|jproc|glp|gocs|hmainsrdap|grive|kactivity|ffactchecktools|gcm|girebase|ndynamiclinks|nrules|fhomegraph|fiamcredentials|gndexing|fkgsearch|flibraryagent|gogging|fmanufacturers|girror|foauth2|fpeople|goly|groximitybeacon|freplicapool|fsafebrowsing|gcript|gearchconsole|hrvicebroker|mmanagement|gheets|glides|gourcerepo|gpanner|gtoragetransfer|hreetviewpublish|ftesting|fvault|fwebmasters|fyoutubereporting|0neowsapp.com|0patientview.org|0ritekit.com|0interzoid.com:getaddressmatch|ireacodefromnumber|hcitymatch|lstandard|iompanymatch|juntrymatch|ostandard|iurrencyrate|hemailinfo|hfullnamematch|pparsedmatch|hglobalnumberinfo|ntime|hstateabbreviation|hweathercity|ozip|hzipinfo|flobalpageload|elookupareacode|0amazonaws.com:alexaforbusiness|fppmesh|hsync|ebackup|fudgets|ecloud9|jformation|jhsm|mv2|jtrail|fodebuild|icommit|ideploy|iguruprofiler|ipipeline|ggnito-idp|msync|gmprehendmedical|iute-optimizer|gnfig|hnect|lparticipant|fur|edataexchange|ipipeline|isync|gx|fevicefarm|firectconnect|fs|eebs|fc2|h-instance-connect|gs|fks|flastic-inference|lfilesystem|lmapreduce|ltranscoder|fmail|fntitlement.marketplace|fvents|efirehose|forecastquery|egreengrass|goundstation|ehealth|eimportexport|fnspector|fot-data|ijobs-data|h1click-projects|hanalytics|hevents|n-data|hsecuretunneling|hthingsgraph|ekendra|finesis|l-video-media|ssignaling|lanalytics|uv2|lvideo|fms|elakeformation|gmbda|fex-models|fogs|emachinelearning|hie|gnagedblockchain|grketplace-catalog|fediaconnect|mvert|jlive|jpackage|q-vod|jtailor|gteringmarketplace|figrationhub-config|fobile|kanalytics|fq|fturk-requester|enetworkmanager|eopsworks|frganizations|futposts|epersonalize-events|fi|gnpoint|m-email|folly|fricing|eqldb|i-session|eram|fds-data|fekognition|gsource-groups|mgroupstaggingapi|fobomaker|gute53|ldomains|lresolver|funtime.lex|es3control|fagemaker|n-a2i-runtime|gvingsplans|fchemas|fecretsmanager|hurityhub|grverlessrepo|iice-quotas|lcatalog|gsv2|fhield|figner|fms|h-voice|fnowball|gs|fsm|go-oidc|ftates|goragegateway|greams.dynamodb|fupport|fwf|etextract|franscribe|jfer|jlate|ewaf|h-regional|hv2|forklink|ispaces|exray|1zure.com:azsadmin-ActionPlan|tOperation|jDeployment|jFileContainer|jProductDeployment|qPackage|qSecret|acognitiveservices-FormRecognizer|csmos-db-privateLinkResources|bustomerlockbox|adigitaltwins|afrontdoor-networkexperiment|ahybridcompute-HybridCompute|amariadb-PerformanceRecommendations|iQueryPerformanceInsights|dketplace-Marketplace|bonitor-privateLinkScopes_API|isubscriptionDiagnosticsSettings_API|bysql-DataEncryptionKeys|gPerformanceRecommendations|gQueryPerformanceInsights|anetwork-ipGroups|apolicyinsights-policyMetadata|cstgresql-DataEncryptionKeys|areservations-quota|dources-deploymentScripts|asecurity-assessmentMetadata|ts|kutomations|iinsights-SecurityInsights|bql-WorkloadClassifiers|mGroups|bupport|awindowsesu|0image-charts.com|0rebilly.com|0dracoon.team|0rawg.io|0logoraisr.com|0autodealerdata.com|0tradematic.com|0covid19-api.com|0exude-api.herokuapp.com|0ip2whois.com|0shorten.rest|0visualcrossing.com:weather|0nic.at:domainfinder|0randommer.io|0pdfbroker.io|0mon-voyage-pas-cher.com|0daniweb.com|0googleapis.com:automl|0mercure.local|0chompthis.com|1onfigcat.com|0pressassociation.io|2ss.org|0quarantine.country|0amazonaws.com:synthetics|0parliament.uk:search|0wheretocredit.com|0amazonaws.com:honeycode|0c19qrserver.local|0files.com|0googleapis.com:chromeuxreport|flifesciences|fml|fplus|grod_tt_sasportal|fsasportal|gql|0kubernetes.io|0pdfgeneratorapi.com|0rapidapi.com:idealspot-geodata|0signl4.com|1ymanto.net|0byautomata.io|0tl-api.azurewebsites.net|0phantauth.net|0ticketmaster.com:commerce|0bethmardutho.org|0uspto.gov:bdss|0openchannel.io:market|0wikipathways.org|0google.home|0amazonaws.com:ivs|0keyserv.solutions|0ebay.com:sell-account|fnalytics|ecompliance|efeed|0apiz.ebay.com:sell-finances|0ebay.com:sell-listing|fogistics|emarketing|fetadata|enegotiation|erecommendation|9buy-deal|9commerce-catalog|jharity|itranslation|0openuv.io|0walletobjects.googleapis.com:pay-passes|0googleapis.com:shoppingcontent|0readme.io|0ideaconsult.net:enanomapper|gnanoreg|0github.com:api.github.com|0edrv.io|0googleapis.com:adsensehost|fcivicinfo|gustomsearch|fgames|kConfiguration|kManagement|frecommendationengine|ftoolresults|fvectortile|0rudder.example.local|0twitter.com:current|0shipengine.com|0velopayments.com|0hsbc.com:branches|9product|0presalytics.io:story|fooxml|fconverter|0googleapis.com:fitness|fgmail|groupsmigration|lsettings|ftrafficdirector|fwebfonts|0lambdatest.com|0intellifi.nl|0openfigi.com|0id4i.de|0monarchinitiative.org|1astercard.com:BillPay|fCurrencyConversionCalculator|fLocations|fMATCH|hWS|gerchantIdentifier|fPaymentAccountReferenceInquiryAPI|gersonalizedLoyaltyOffers|fRepower|fSpendingPulse|fmasterpassqr|fopen-banking-connect-pis|0biapi.pro|1rainbi.net|0contract-p.fit|0openbankingproject.ch|0probely.com|0googleapis.com:doubleclicksearch|flocalservices|fpubsublite|fsiteVerification|ftasks|4.io|0britbox.co.uk|0ebi.ac.uk|0googleapis.com:discovery|fplaycustomapp|0visualstudio.com|0googleapis.com:books|fsmartdevicemanagement|0chaingateway.io|0netboxdemo.com|0webscraping.ai|0googleapis.com:calendar|0apigee.local:registry|0googleapis.com:datalabeling|fstorage|fyoutube|0nexmo.com:application|l.v2|budit|aconversation.v2|hion|adispatch|aexternal-accounts|amedia|cssages-olympus|anumber-insight|gs|apricing|aredact|cports|asms|bubaccounts|averify|boice|0medcorder.com|0googleapis.com:reseller|0telnyx.com|0pocketsmith.com|0hubhopper.com|0googleapis.com:firebasedatabase|0surevoip.co.uk|0easypdfserver.com|0calorieninjas.com|0fungenerators.com:uuid|ishakespeare|itrivia|iriddle|ipirate|inamegen|itaunt|ifake-identity|0portfoliooptimizer.io|0amentum.space:space_radiation|0etherpad.local|1sgenterprise.com|0spoonacular.com|0openapi-generator.tech|0dev.to|0peoplefinderspro.com|0sakari.io|0httpbin.org|0rev.ai|0ticketmaster.com:publish|0discourse.local|0ote-godaddy.com:abuse|gdomains|gcertificates|gorders|gaftermarket|gcountries|gshoppers|gagreements|gsubscriptions|0shop-pro.jp|0mbus.local|0telegram.org|0powerdns.local|0nrm.se:georg|0keycloak.local|0amazonaws.com:amplifybackend|fppflow|hintegrations|fuditmanager|ecloudfront|fonnect-contact-lens|fustomer-profiles|edatabrew|eecr-public|fmr-containers|egreengrassv2|eidentitystore|fotdeviceadvisor|hfleethub|hwireless|elocation|gokoutvision|enetwork-firewall|eredshift-data|es3outposts|fagemaker-edge|ofeaturestore-runtime|fervicecatalog-appregistry|fso-admin|etimestream-write|ewellarchitected|0zeit.co|0digitalocean.com|0snyk.io|0papinet.io:order_status|0nlpcloud.io|0up.com.au|0inpe.br:dados-abertos|0jellyfin.local|0lgtm.com|0ticketmaster.com:discovery|1rapstreet.com|0opensuse.org:obs|0digitalnz.org|0mastodon.local|0asuarez.dev:searchly|0twilio.com:twilio_autopilot_v1|ibulkexports_v1|ichat_v1|o2|jonversations_v1|ievents_v1|ifax_v1|jlex_v1|iinsights_v1|jp_messaging_v1|w2|ilookups_v1|imessaging_v1|jonitor_v1|inotify_v1|jumbers_v2|ipreview|kicing_v1|r2|koxy_v1|iserverless_v1|jtudio_v1|q2|jupersim_v1|jync_v1|itaskrouter_v1|jrunking_v1|iverify_v2|jideo_v1|joice_v1|iwireless_v1|0salesforce.local:einstein|0redhat.com:catalog_inventory|7local:patchman-engine|1andomlovecraft.com|0hetzner.cloud|0shotstack.io|0openaq.local|0plaid.com|0apicurio.local:registry|0truanon.com|0apideck.com:crm|clead|2ple.com:app-store-connect|2ideck.com:vault|0parliament.uk:members|elordsvotes|eoralquestions|estatutoryinstruments|etreaties|eerskine-may|enow|ewrittenquestions|0libretranslate.local|0apisetu.gov.in:aaharjh|gcko|ggtripura|gharakar|giimsmangalagiri|kpatna|krishikesh|gktu|gpmcservices|gsrb|0digitallocker.gov.in:authpartner|0apisetu.gov.in:bajajallianz|rlife|hrti|gharatpetroleum|jtiaxagi|ivishya|giharboard|gput|gsehr|fcbse|ggbse|ghennaicorp|hitkarauniversity|holainsurance|gisce|hvilsupplieskerala|0cowin.gov.cin:cowincert|0apisetu.gov.in:cpctmp|gsc|fdbraitandaman|ggecerttn|hft|ghsekerala|gitarunachal|ich|itripura|guexam|fedistrictandaman|ohp|okerala|oodisha|usp|opb|oup|ghimapurtihp|gnibandhanjh|gpfindia|hramanhp|gservicearunachal|ffsdhr|guturegenerali|fgadbih|huhati|gbshse|geetanjaliuniv|gmch|goawrd|hdigit|gujaratvidyapith|fhindustanpetroleum|gpayushboard|hbose|hpanchayat|hsbys|issb|htechboard|gsbte|hscboardmh|ficicilombard|kprulife|hsi|ggrmaharashtra|gnsvalsura|gocl|gssuer|fjac|geecup|gharsewa|gnrmand|guit|fkeralapsc|giadb|gkhsou|gotakgeneralinsurance|gseebkr|gtech|flabourbih|hndrecordskar|hwcollegeandaman|gegalmetrologyup|gicindia|fmaxlifeinsurance|gbose|hse|gcimindia|geark|gizoramlesde|mpolice|gpmsu|hpmc|griu|gsde|gunicipaladmin|fnationalinsurance|gcert|0ndhm.gov.in:ndhm-gateway|hhealthid|iip|ju|0apisetu.gov.in:negd|hilit|hwindia|giesbud|hos|htap|ip|gpsailu|gsdcindia|forientalinsurance|fpan|hreekshabhavanker|gblabour|ggimer|ghedharyana|gmjay|gramericalife|gseb|guekar|hnjabteched|frajasthandsa|orajeduboard|geliancegeneral|hvenueassam|modisha|fsainikwelfarepud|hralharyana|gbigeneral|gcvtup|gebaonline|gtatisticsrajasthan|gwavlambancard|ftataaia|lg|gbse|gransport|oan|pp|pr|ps|obr|ocg|odd|ph|pl|oga|pj|ohp|pr|ojh|pk|oka|pl|old|omh|pl|pn|pp|pz|onl|ood|opb|py|orj|osk|otn|pr|ps|ouk|pp|owb|fubseuk|gcobank|giic|gpmsp|fvhseker|gssut|0clubhouseapi.com|0meraki.com|0onsched.com:consumer|cutility|csetup|0qualtrics.com|0truesight.local|0bigredcloud.com|0remove.bg|0tsapi.net|0airbyte.local:config|0loket.nl|0xero.com:xero-payroll-au|d_accounting|fssets|ebankfeeds|efiles|0frankiefinancial.io|0googleapis.com:cloudchannel|fmybusinessaccountmanagement|fwebrisk|0climate.com|0restful4up.local|0orthanc-server.com|0testfire.net:altoroj|0mailscript.com|0openbanking.org.uk:confirmation-funds-openapi|jevent-notifications-openapi|jpayment-initiation-openapi|0googleapis.com:chromepolicy|0worldtimeapi.org|0combell.com|0googleapis.com:orgpolicy|0apptigent.com|0va.gov:facilities|0firstinspires.org|1aceidentity-beta.azurewebsites.net|0telematicssdk.com|0va.gov:benefits|7forms|7confirmation|0journy.io|0superset.apache.local:superset|0googleapis.com:mybusinesslodging|1etpostman.com|0abstractapi.com:geolocation|0drchrono.com|0googleapis.com:my-business|0asana.com|0cloud-elements.com:ecwid|0hubapi.com:webhooks|bautomation|bcms|communication-preferences|dnversations|crm|bevents|bfiles|01password.local:connect|0twilio.com:twilio_trusthub_v1|0pdfblocks.com|0microsoft.com:graph-beta|0googleapis.com:essentialcontacts|0exlibrisgroup.com:tasklists|0credas.co.uk:pi|0pay1.de:link|0googleapis.com:paymentsresellersubscription|0climatekuul.com|1hange.local|0openpolicy.local|0uscann.net|0googleapis.com:recaptchaenterprise|0soundcloud.com|1ms77.io|0orbit.love|0ntropy.network|0apispot.io:whois|0thebluealliance.com|0vmware.local:vrni|0yodlee.com|0linuxfoundation.org:reimbursement|0wiremock.org:admin|0royalmail.com:click-and-drop|0nbg.gr|0eos.local|0intel.com:product-catalogue|0apple.com:sirikit-cloud-media|0github.com:ghes-2.19|i20|j1|j2|g3.0|i1|0nasa.gov:asteroids neows|0viator.com|0apideck.com:proxy|0openstates.org|0braze.com|0seldon.local:wrapper|dengine|0cdcgov.local:prime-data-hub|0redeal.io:analytics|1umble.run|0notion.com|0hubapi.com:marketing|0amazonaws.com:applicationcostprofiler|hrunner|efinspace|m-data|gs|elookoutequipment|lmetrics|emgn|enimble|eruntime.lex.v2|essm-contacts|iincidents|1zure.com:sql-sensitivityLabels|0redeal.io|0seldon.local:core|1lack.com|1potify.com|b:sonallux|0googleapis.com:resourcesettings|0adyen.com:MarketPayNotificationService|0nowpayments.io|0billingo.hu|0mtaa-api.herokuapp.com|0googleapis.com:sqladmin|0twilio.com:twilio_frontline_v1|0parliament.uk:bills|0influxdata.com|0cloudrf.com|0okta.local|0pandascore.co|0optimade.local|0rapidapi.com:dynamicdocs|0interactivebrokers.com|1deal-postcodes.co.uk|0googleapis.com:mybusinessnotifications|ffcmdata|0tafqit.herokuapp.com|0i-cue.solutions|0ably.net:control|0fire.com|0meshery.local|0gambitcomm.local:mimic|0nordigen.com|0izettle.com:products|0googleapis.com:contactcenterinsights|0appwrite.io:server|0firmalyzer.com:iotvas|0truora.com|0ix-api.net|0mist.com|0googleapis.com:mybusinessverifications|0apideck.com:file-storage|cwebhook|0googleapis.com:admin|hsense|gnalyticsdata|fbigqueryreservation|fcloudbuild|ffile|fgameservices|genomics|fjobs|fmanagedidentities|fpolicytroubleshooter|fredis|fsecuritycenter|fvision|fmonitoring|fnetworkconnectivity|fcontainer|fauthorizedbuyersmarketplace|fversionhistory|gmmigration|0twilio.com:twilio_media_v1|0apideck.com:customer-support|csms|0googleapis.com:datapipelines|0apideck.com:ats|0googleapis.com:servicecontrol|0apideck.com:hris|cconnector|0googleapis.com:firestore|fdatastream|fclouddeploy|fretail|0apideck.com:pos|0googleapis.com:transcoder|fdatastore|fmybusinessqanda|frun|fids|fhealthcare|fcertificatemanager|ffirebasehosting|fplayintegrity|fmybusinessbusinesscalls|fdns|fpubsub|glaydeveloperreporting|0twilio.com:twilio_chat_v3|0googleapis.com:gkebackup|fverifiedaccess|fcloudfunctions|fapigeeregistry|fbusinessprofileperformance|0twilio.com:twilio_lookups_v2|0googleapis.com:osconfig|fdrivelabels|0twilio.com:twilio_routes_v2|0googleapis.com:connectors|fidentitytoolkit|fassuredworkloads|fcontentwarehouse|0twilio.com:twilio_oauth_v1|0googleapis.com:tagmanager|gpu|gravelimpactmodel|fdiscoveryengine|0twilio.com:twilio_content_v1|0googleapis.com:analyticsadmin|fworkloadmanager|jstations|0twilio.com:twilio_flex_v2|0googleapis.com:integrations|fdataform|fcontactcenteraiplatform|fkmsinventory|flanguage|fadvisorynotifications|0apideck.com:ecommerce|0googleapis.com:iam|1ithub.com:ghec|f.2022-11-28|es-3.2|i3|i4|i5|i6|i7|i8|cithub.ae|0openai.com|0adyen.com:CheckoutService|aDataProtectionService|aHopService|aLegalEntityService|aManagementService|aNotificationConfigurationService|aPayoutService|aRecurringService|aStoredValueService|aTestCardService|bfmAPIService|bransferService|0ip2location.io|0color.pizza|0vercel.com|0tokenmetrics.com|0balldontlie.io|0googleapis.com:readerrevenuesubscriptionlinking|0zeno.fm|0googleapis.com:vpcaccess|0apideck.com:issue-tracking|0googleapis.com:admob|gppengine|fbigtableadmin|hllingbudgets|hnaryauthorization|fcloudasset|kidentity|kresourcemanager|kscheduler|learch|lhell|ktasks|lrace|gomposer|hntaineranalysis|fdatacatalog|jfusion|jmigration|geploymentmanager|gomains|hubleclickbidmanager|feventarc|ffirebaseml|fgkehub|gmailpostmastertools|fiap|fmemcache|htastore|fnetworkmanagement|msecurity|orvices|fondemandscanning|gslogin|fpolicyanalyzer|grivateca|frealtimebidding|hcommender|guntimeconfig|fsecretmanager|hrviceconsumermanagement|mdirectory|mnetworking|musage|gpeech|gts|ftexttospeech|granslate|fvideointelligence|fwebsecurityscanner|gorkflowexecutions|ns|fyoutubeAnalytics|fpublicca|0vtex.local:Catalog-API-Seller-Portal|checkout-API|customer-Credit-API|bGiftCard-Hub-API|fcard-API|bHeadless-CMS-API|bIntelligent-Search-API|bLicense-Manager-API|cogistics-API|bMarketplace-APIs-|nProtocol|dster-Data-API-|hData-API-|cessage-Center-API|bOrders-API|l-(PII-version)|bPayments-Gateway-API|colicies-System-API|crice-Simulations|fing-API|jHub|dofile-System|emotions-|bRecurrence-(v1-|dviews-and-Ratings-API|bSKU-Bindings-API|cearch-API|dssion-Manager-API|cubscriptions-API-(v2)|v3)|bVTEX-Do-API|f_TEMPLATE|0simplivpn.net|0go-upc.com|0wealthreader.com|0stream-io-api.com|0mineskin.org|0greip.io|0stellastra.com|0contentgroove.com|0alertersystem.com|0facecheck.id|0trakt.tv|0gerermesaffaires.com|0increase.com|0rapidapi.com:ecowetter|0dodo.ac|0google.com|0doqs.dev|0javatpoint.com|0arespass.net|0svix.com|0clickup.com|0webflow.com|0meteosource.com|0threatjammer.com|0apache.org:airflow|0linqr.app|0json2video.com|0tcgdex.net|0gsmtasks.com|0ljaero.com:dflight|0ipqualityscore.com|0xtrf.eu|0scideas.net:perfectpdf|cregression|0amadeus.com:amadeus-flight-inspiration-search|rdelay-prediction|rmost-booked-destinations|rbusiest-traveling-period|rcheck-in-links|ktravel-recommendations|kflight-order-management|khotel-ratings|kon-demand-flight-status|kflight-price-analysis|kseatmap-display|kpoints-of-interest|ksafe-place-|khotel-search|qbooking|kflight-offers-price|ktours-and-activities|kairport-&-city-search|kflight-most-traveled-destinations|klocation-score|0meilisearch.com|0docker.com:dvp|bhub|0googleapis.com:migrationcenter|fdatalineage|0vectara.io|0bigdatacloud.net|0paypi.dev|0versioneye.com|0googleapis.com:policysimulator|0hubapi.com:business units|0rapidapi.com:spellcheckpro|0unicourt.com|0googleapis.com:notebooks|0ibanapi.com|0proxykingdom.com|0impala.travel:hotels|0zapier.com:nla|0adyen.com:ManagementNotificationService-v1|aBalancePlatformReportNotification-v1|0sinao.app|0tokenjay.app|0klarna.com:payments|0googleapis.com:firebaseappdistribution|0datasette.local|0slack.com:openai|0pinecone.io|0klarna.com:openai|0urlbox.io|0freetv-app.com|0biztoc.com|0shop.app|0wolframalpha.com|0quickchart.io|0peoplegeneratorapi.live|0wellknown.ai|0elevenlabs.io|0autotask.net|0codat.io:sync-for-expenses|icommerce|9bank-feeds|9assess|9banking|9commerce|0openindex.ai|0twilio.com:twilio_numbers_v1","sep":"|"},{"f":"00.0.1|01.0.0|06|01.1.0|02.0.0|03.7.1-pre.0|06|01|1|1|02|03|054|01|06|18|03.0.0|0v1|02.2.0|01.1.1|42|20.4|41|42|46|02.0.2|01.9.0|20.3|03.0.1|01.1.4|02017-05-31|39-11-01|35-12-08|37-08-22|220-08-01|217-07-25|35-07-09|38-11-29|a|39-10-09|36-02-06|38-11-25|36-12-01|37-05-18|31-01-01|38-01-06|36-08-10|39-09-01|37-10-25|38-05-01|37-01-11|33-01-01|a|38-09-22|39-09-19|37-04-19|39-12-01|60-15|34-06-30|37-11-27|38-10-26|220-12-01|215-11-01|38-01-12|36-01-01|34-10-31|32-08-10|35-09-21|30-12-01|32-06-01|35-12-01|501-01|510-07|38-01-01|66-26|39-11-15|38-03-01|35-10-01|38-08-08|37-03-31|511-28|507-01|39-12-02|35-05-28|38-05-14|39-12-02|38-11-14|37-09-30|38-08-01|36-11-28|220-01-01|215-07-01|37-09-01|220-08-07|67-01|216-11-01|38-05-22|a|220-07-20|218-04-01|37-03-14|39-06-10|38-11-01|36-05-01|37-10-01|39-05-01|01.5.0|23.0|21.1|02.5.1|0v1.9.0|01.2.0|24.1|21.0|1|1.1|02019-02-14T164701Z|09.3.0|00.0.6|01.0|0v1.1.0|10.1|00.9.3|01.0.0|02018-12-03|37-05-15|64-19|39-06-01|37-08-01|39-12-01-preview|i|501-01|38-06-01-preview|39-11-01-preview|509-01-preview|35-05-01|a|38-05-01-preview|66-17-preview|39-10-17-preview|505-01-preview|38-09-01-preview|35-07-01|38-07-01-preview|61-01-preview|37-10-01-preview|35-10-31|38-01-15|37-05-15-preview|38-06-30|69-01|35-06-01-preview|512-01-preview|38-07-30-preview|36-01-01|35-04-01|66-15|36-05-01|38-10-01|39-08-08-preview|35-12-01-preview|37-04-01|63-01-preview|66-01|39-08-01|a.10.0|510-01-preview|38-11-01-preview|39-06-15-preview|1.0|01.0|0v2.0|11.0|04.0|02015-06-01-preview|39-03-01|a|67-01|63-01|64-01|66-01-preview|68-01|38-08-01-preview|39-08-01-preview|38-06-01|37-09-01-preview|39-07-01-preview|61-01-preview|510-01|35-03-01-preview|38-11-01-preview|36-06-01|39-08-15|38-02-14-preview|37-08-01-preview|65-01-preview|39-09-30|38-03-01-preview|62-01|220-01-01-privatepreview|218-06-01-privatepreview|67-01|39-12-02-preview|36-03-01|35-04-01|37-12-01-preview|36-09-01|35-11-01-preview|39-05-06-Preview|36-07-01-preview|39-03-01-preview|35-05-01-preview|34-04-01|37-11-01-preview|01.0.0|5|41|0v2|01.0.0-oas3|04|00.1.0|02021.12|00.9.0|01.8.0|0v1|01.2|02.9.235|00.0.3|01.0.0|0NA|03.0|01.0.0|02.1.0|01.4.0|05.3.0|02.0|3.0|01.3.0|20.0|3|00.9|01.3|0v1|02.1|00.3.1|21|0v2.1|01.0|0v1.1.0|2_beta.34.0|80.0|13|01.3.10|02019.10.15|00.0.0|02.1.1|33.0|01.5|3|02.3|01.0|3.0|04.0.0|01.1.4|5|5|0v1|2|2beta|2|2.4|12beta1|11beta1|13|11|14|11|13|11alpha2|2|12|11alpha1|2beta2|12|11|2|12|13|11|2beta|2|2beta1|12beta|2.1|11|13.4|2beta1|12|11beta3|2|2beta|2|2alpha|2|2|2|2|15|13|11alpha|10|11|01.2.1|00.1|01.0.0|02|1.2.1|0v3|11|01.0.0|21.7|20|00.9|01.0.0|05.0.0|0v2-basic-tier|02018-07-05|01.0|3.0|3|02.0.7|01.0|27.0|02.1|01.0.1|02.2|20.24|01.0.0|0v1|00.5|03.4|02.15.0|01.0.4|02.0.1|1|00.1.0|01.0.0|5|22.0|03.1.7|0v1|2|01.0|00.9.0|01.0|00.1|01.0.0|242.0|6|6|211.8|20|3|3.0|02.0.0|1018-08-01.7.0|01.0|02.9.4|0v2|2|01.0|3.0|5|1|1.0.0|0v1|03|02.0|00.1|0v0|01.0.0|21.38|20|3|3.0|3|3.0|1|1.0.0|23.7|20.0|1|1.0.0|5|3|3|3.0|02.x|0v1|01.0|3.0|5|5|0v0|01.1.0|03.0.0|01.0.0|04.0|03.0|02.0|01.0.0|02.0.0|00.0.1|01.0.0|5|3|3.0|02.2.0|01|1.0|03.0|01.0|3.0|04.0|02.0|01.0.0|1|1.0.0|0partner|01.0.0|02017-01-31|67-01|a|35-01-14-privatepreview|39-05-01|34-12-01|36-06-01|37-04-01|36-03-01|38-02-01|69-15|36-01-29|01.1.5|1|1.0.0|5|26|0version unknown|02015-10-01|01|0v1|02016-05-01-preview|01.0|03.0.0|5|01.0.0|02.0.0|5|01.0.0|03.0.0|02.0.0|3|01.0.0|02.2.10|1015-04-01|36-06-01|a|512-01|0v1|02.0.0|01.0|02.4.30|01.11.0|02015-08-19|1.0|01.0|3|3|3|3.0|0v1|02.0|03.0.0|01.17.0|03.0.0|01.1|0v1|01.0|00.0.42|01.0.0|5|02019.10.15|a|a|a|a|01.0.0|04.15.174|01.0.0|0v3|03.6.3|01.22|03.0.1|2x.x|02.0.0|01.0.0|5|5|02018-06-01-preview|36-12-01|37-04-01|67-01|35-11-01-preview|37-06-01|38-03-01-preview|1.0|0version|11|02015-02-02|32-06-01|30-05-08|68-01|34-10-31|32-12-01|206-03-01|39-04-15|212-11-05|31-06-15|0v1|2|2|02.2.01|01.0.0|29.1|00.0.3|02.0.0|01.0.0|0v1_beta.2.0|2.0.0|33|01.0|3.0|3|0v3|01.0|3|3|3|22.0|02.0.1|01.0|02.18.0|01.0.0|211.1.5383|02.0.0|5|0V2|01.0|0v1.0|00.0.6|0v7.78.1|02019-08-01|37-04-26|38-06-01-preview|37-12-01-preview|i|38-07-10|36-03-01|37-08-24|1.0.0|01.0|0v1|01.0.0|5|05.3.0|01.0.0|5|5|5|1|02.3|1022-11-15|01.1|0v1|01.0|02.0.0|01.0.0|1|0v2|02.0|01.0.0|02017-02-10T162446Z|00.1|022.23.10.42|1.0.0|3|3|3.0|1|01.0.0|02.0|21.0|01.0|0v1|01.0.0|00.1.1|0v1|2|01.1|20.1423|3|3.0|0v1.19.19|2|01.1.1|02|01.0|3|02.0.0|01.0|3|3|3|02017-09-01|65-13|38-01-01|39-01-01|a|a|a|35-05-01|a|a|a|38-09-01-preview|61-01-preview|35-10-31|a|a|a|a|a|a|a|a|37-05-15-preview|i|i|35-10-31|a|37-04-18|35-11-01|38-10-01|36-11-01|a|38-03-15-preview|61-22|37-06-01|39-06-01|37-04-01|38-01-01-preview|66-01-preview|i|i|37-01-01-preview|a|39-10-01|38-05-01|35-06-01|39-06-01|37-04-01|35-04-01|36-03-01|37-05-01-preview|i|35-04-01|36-03-01|38-01-01|a|35-04-01|39-07-01|a|a|a|a|68-01|67-01|a|a|38-10-01|a|35-11-01-preview|37-10-01|61-15|36-06-01|a|a|37-07-01|36-08-10|66-01|38-03-01|39-04-01|68-01|35-12-01|36-09-01|a|38-06-01|37-08-31-preview|36-04-01|39-06-01|37-04-01|38-06-01-preview|i|37-10-01-preview|i|38-06-01-preview|34-04-01|a|35-05-01-preview|37-10-01-preview|34-04-01|a|37-03-01-preview|35-05-01-preview|37-10-01-preview|34-04-01|35-05-01-preview|i|i|34-04-01|a|38-06-01-preview|34-04-01|35-05-01-preview|34-04-01|37-03-01-preview|34-04-01|37-03-01-preview|34-04-01|37-03-01-preview|35-05-01-preview|i|34-04-01|a|35-05-01-preview|i|i|34-04-01|35-05-01-preview|39-04-01|36-11-01|503-01|a|a|a|a|38-04-01|37-09-01-preview|511-01-preview|38-02-01|a|511-01|502-01|a|a|a|a|a|a|35-08-01|01.0|3|3|3|3|3|3|00.8.6|01.7.0|05.6|02021-08-20|01.0|28.0|02019-08-01|37-09-30|36-03-30|38-09-01|a|39-03-01|38-11-30|01.0|3|02.01|0v1|2|02.0.0|019.02.1|0v2|01.0|3.0|5|3|3.3|40|5|5|22.0|20|3.0|00.1|20.1|01.0.0|29|0v1|01.33|20.0|5|0v1|12-customer|13-diary|12-free-tier|13-maintenance|3reporting|02.0|1015-05-01|a|a|67-01|510-31|37-05-15-preview|i|36-05-01|a|35-06-01-preview|36-05-01|a|a|a|a|a|a|a|a|a|a|a|a|35-11-01|36-05-01|a|a|a|a|a|a|a|39-05-01|37-06-01|a|a|01.0|3|03.0-preview|0v2.0 preview|31-preview|02016-11-01|a|38-06-30-preview|37-11-03-preview|07.0-preview|02018-02-14-preview|802|61-01|39-08-01|a|38-04-04|67-01-preview|37-07-01|39-05-06-Preview|06.5.0.36|02017-10-01-preview|34-04-01|a|38-06-01-preview|37-03-01-preview|39-06-01-preview|0v1|03.2|01.0|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|3|0api-v1|01.0.0|41|40|03.1|00.1.20|02.3.0|01.0|210.9|04.1.2|01.0.1|03.0.1|5|01.0.0|3|3.0|5|0v1|01.0|03.0.0|01.1.0|03.0.0|01.0|02014-10-31|01.0|23.0|0v1|01.0.2|40|25.0-dev|20.0|41|02015-11-01|01.0|3|21|3.0|20.0|5|23|20|220.0+dev-93-g6886706f5|20.0|24.0.0|0v3.4|01.1|02|01.0|0v2.0|03.1.5|08234aab51481d37a30757d925b7f4221a659427e|01.1.2|02|1|1|03|0R4.2a|01.0|0v2|01.0.0|5|02018-03-01|34-01-01|39-05-05-preview|512-01-preview|i|501-01|512-01-preview|501-01|512-01-preview|i|i|501-01|512-01-preview|501-01|512-01-preview|501-01|512-01-preview|i|i|38-06-01-preview|35-05-01|37-10-01|a|38-04-20|66-17-preview|61-01-preview|815|a|a|66-30|37-05-15-preview|35-10-31|61-01|36-01-01|a|38-09-01|a|35-11-01|a|a|38-07-30-preview|39-05-01|36-05-01|35-04-01|36-05-01|37-02-01-preview|35-11-01|506-15|511-01|a|a|62-01-preview|36-01-01|35-06-15|38-02-09|35-11-01|36-05-01|a|a|35-12-01-preview|506-15|512-01-preview|i|i|i|39-08-08-preview|i|35-12-01-preview|39-09-07|38-05-01|511-01-preview|i|507-12|39-06-01|64-30|38-09-30-preview|39-09-01|38-04-01|39-11-01-preview|38-05-01|69-01-preview|39-05-01|38-11-20|60-31-preview|506-01-preview|i|i|69-01|39-07-01-preview|37-10-01-preview|39-06-01|38-06-01-privatepreview|67-01|66-01-preview|67-01|a|a|a|39-05-01-preview|38-06-01-preview|i|63-01|69-01-preview|64-16|66-01-privatepreview|39-07-01|a|68-01|67-01|a|a|68-01|a|67-01|a|62-01|67-01|68-01|a|67-01|68-01|a|a|67-01|37-10-01|38-07-01-preview|39-07-01|38-06-01-privatepreview|39-04-01|66-01|a|a|37-08-01-preview|38-05-01|61-01-preview|39-03-01-preview|38-09-01-preview|510-01|506-01-preview|i|37-03-01-preview|i|510-01-preview|38-06-01-preview|37-03-01-preview|i|38-06-01-preview|i|37-10-01-preview|503-01-preview|510-01-preview|503-01-preview|510-01-preview|503-01-preview|510-01-preview|i|503-01-preview|i|38-06-01-preview|37-10-01-preview|i|i|38-06-01-preview|34-04-01|a|37-10-01-preview|503-01-preview|i|510-01-preview|503-01-preview|36-10-01|39-10-31|504-01|38-03-01-preview|39-03-01|38-08-01-preview|i|62-01|a|36-06-01|39-06-01|38-08-31-preview|01.0|02.1|01.0|3.0|5|5|1001.0.0-SNAPSHOT|1.0.0|03.4|01.0|02018-10-15|507-01-preview|01.0.66|22|3|20|3.0|5|5|04.145.0|24.12|01.0.0|21|25|20.0|5|0R1.0a|00.0.1|01.0|02019-07-01|63-01|62-28-preview|38-11-27-preview|39-07-01|a|68-01|38-09-01|39-01-01|a|35-06-01-preview|37-08-01-preview|a|a-preview|35-06-01-preview|i|37-08-01-preview|35-06-01-preview|i|i|38-06-01|37-08-01-preview|39-01-01-preview|35-06-01-preview|i|37-08-01-preview|38-02-01|511-01|01.0.0|03.0.1|02.1.1|591|01.0.0|5|5|00.1|01.0|3|3|3.0|3|3|3|02019-12-01-preview|i|i|i|501-01|512-01-preview|501-01|512-01-preview|i|506-15-preview|69-16|65-01-preview|66-01|67-01-preview|35-06-01-preview|39-08-01|a|61-01-preview|38-06-01-preview|37-03-01-preview|35-05-01-preview|38-11-01-preview|03.0|01.0|04|01.0.0|5|5|02.0.0|3|01.0|05.1.0|02.0|3.0|1015-07-01|511-01|38-06-01-preview|01.0|04.0|02019-05-01-preview|64-01-preview|38-09-01-preview|39-11-01|501-24|38-09-01-preview|39-12-02-preview|i|507-01|68-01|67-01|a|61-01-preview|38-09-01-preview|35-06-01-preview|39-08-01|512-01|38-06-01-preview|i|39-03-01-preview|64-01|01.0|3|25|21.1|02.3|00.0.1|01.5|02.0|01.0.0|3|21.32|31.8|20.1|211.8|20.1|02019-09-01-preview|68-15-preview|69-30|a|a|a|a|38-06-01-preview|39-06-01-preview|69-01-preview|38-06-01-privatepreview|39-07-01|66-01|511-01|508-01-preview|38-06-01-privatepreview|39-01-01-preview|38-06-01-preview|39-06-01|511-01|01.0.0|42|00.1|01.0.0|02.0|0v1|2|2|2|2|2beta1|2|2|12|11beta1|2|2beta1|12|11alpha1|2|2b3|2|12|11|2|13|12|11alpha1|2|2beta1|2|2|2|2|13|11|2|12|11|2|12|11|2|2beta1|7|14|11|2|2beta1|2|14|11|2|2|2|2|2|2|13|11|01.0|3|3.0|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|02017-11-09|39-01-25|37-07-25|38-11-15|36-10-20|37-09-23|30-05-15|34-05-30|37-04-28|33-11-01|36-10-06|35-04-13|34-10-06|39-07-18|35-07-09|36-04-18|34-06-30|38-10-30|39-11-01|34-11-12|37-08-08|38-09-07|37-01-06|67-25|32-10-29|38-11-09|37-04-19|35-06-23|32-10-25|35-04-16|39-11-02|36-11-15|38-04-02|34-11-13|37-11-01|507-25|35-02-01|209-03-31|212-09-25|30-12-01|37-01-11|35-10-07|508-04|38-06-26|37-06-07|39-05-23|36-08-04|30-06-01|36-02-16|35-05-28|37-09-29|38-05-14|37-11-27|38-07-27|510-23|805|509-06|39-02-03|33-12-02|37-09-30|39-12-04|35-08-14|38-05-23|37-09-30|34-11-01|37-03-31|35-03-31|37-04-19|34-03-28|512-12|37-12-19|38-09-24|817|511-14|37-08-29|510-14|92|38-11-07|504-23|36-01-14|39-06-30|37-07-01|34-06-05|37-11-27|501-17|39-07-05|33-02-18|36-11-28|39-12-03|38-03-22|62-27|36-12-01|38-07-26|36-06-10|37-10-15|39-01-02|67-11|38-01-04|68-01|36-06-27|37-11-27|501-26|38-06-29|33-04-01|34-05-15|38-04-01|36-11-28|38-08-20|37-07-24|39-11-07|506-28|512-02|37-10-17|38-10-26|37-09-08|39-06-24|35-12-10|39-09-27|36-06-02|37-08-25|36-10-24|38-09-05|36-06-30|30-03-31|34-11-06|39-06-10|36-11-23|33-06-30|32-08-10|33-04-15|32-01-25|38-06-27|37-10-26|38-11-05|37-07-01|35-08-24|36-11-28|39-07-29|38-09-25|35-04-08|36-04-12|39-01-01|a|a|a|a|a|a|1.0-preview|1019-08-01-preview|38-02-28-preview|220-03-01-preview|219-11-01|62-12|38-06-01|a|220-01-01|219-10-17-preview|37-05-01-preview|220-01-01-privatepreview|218-06-01|a|39-11-01|60-01|220-01-01-privatepreview|219-07-19-preview|510-01-preview|220-01-01|a|219-01-01-preview|220-01-01|219-06-01-preview|i|65-01-preview|69-16-preview|06.1.19|02.1|04.42.2|0v1.0|2|01.0|3.2|22.6|20.0|3|3.0|04.6|01.1.0|0v1|2|00.0.1|04|0v1beta1|00.3.2|01.0.0-oas3|0v1|02.0|3.0|01.0|02017-10-11|0Live|01.0|02020-03-01|01.1|00.0.1|0v1|12beta|11|2|2alpha1|8|2beta4|0unversioned|03.1.1|01.0|0v1|01.0|3.1|02020-08-10_6-22|01.0.0|0v2|01.0.0|5|02.0.24|01.0|02.0|1020-07-14|01.4.5|0v1.9.0|01.2.0|24.1|0v1.3.1|315.0|2_beta.3.0|80.0|2.14.0|36.0|31.0|01.1.0|0v1.3.0|2_beta.5.0|2.2.1|01|0v1|2|12|02.0.0|04.0.0|5|01.1.4|0v1|14.1|12|11|2|2configuration|2management|2beta1|63|2|016|02.61|01.1.202303022103|02.34.63|22.1|5|00.3.1|21.0|3|0v1|2|2|2|12|11|01.0.1|02.23.2+0.gfbc3926.dirty|01.4.0|20.2|21.14|20|3.0|5|5|21.0|02.0.0|01.1|23|0V2|01.0|0V1|01.16.0|02.0|01.0.0|3|23.8_2020-12-14 - Swiss edition 1.3.8.1-CH|22.0|0v2|11|2|2|2|00.1.0|03.730.300-ref-1-39-0|01.0|0v1|2|2|2|2|01.0|02.8|20.7|0v3|00.0.1|0v1beta1|2|13|01.0.2|02.1.4|01.0.4|41|5|00.3.4|21.5|01.0.2|24.0|22.1|20.20|00.0.3|01.0.6|02.2.2|01.2.0|20.8|22.4|23.10|20.0|0v1|02.0.0|3|0v5|11beta|09dcb0dc8|01|1.0.0|25|3|3|3|3|3|3|3|20.9|21.2|22.15|20.0|21|06.2.1|01.0.0|5|41|00.9.2|0v1|12|0latest|01.0.0|5|5|5|5|5|5|5|5|5|00.3.5|05.0.0|00.0.13|02.1|01|02020-08-11|823|67-29|217-07-25|220-05-31|68-21|815|217-07-25|220-10-30|801|61-30|506-15|69-18|511-03|822|819|820|812|219-12-20|37-07-25|220-09-23|67-01|66-24|67-20|218-11-01|220-03-31|0v2019-01-07|02.0|01.0.0|5|5|0v1|01.0|0v1|2.0|12|01.0.0|02.10.50|03|01.0|3|242.0|6|6|6|6|6|229.1|242.0|6|6|6|6|6|6|6|6|6|6|6|6|6|6|6|6|6|6|6|6|6|6|6|02.0.1|01.0.0|0v1.15.3|01.0|3.0|0v1|02.0.0|1020-09-14_1.334.0|1.4.x|01.0.0|09.3.0|5|01.4.1|09.3.0|0v1|2|2|2|2|2|2|2|01.3.9|03.0.0|5|5|5|5|5|5|5|5|5|01.0.0|03.0.0|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|01.0.0|03.0.0|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|00.5|01.0|00.5|3|03.0.0|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|5|01|00.0.0-streaming|0v1|2|2|00.2|011.1.00|0v1|01.0.0|0v1|01.0.0|0V2|02.9.4|5|5|5|5|01.5.3|0v1|2|2|04.0.11|01.0.0|211.3|20.2|00.4.0|03.1.7|5|5|0v1|020210108|0v2|2|02021.1.01|00.0.1|01.0.0|3|3.0|5|00.0.0|41|01.0.0|0v1|2|01.20.0|20.0|0v4 (Hunt Valley)|2|01.0|0api-v2|0v3|14|13|2|2|2|2|2|01.5.7|242.0|25.0|20.1|0v1|01.0|0v1|2|2|01.0|0v1|00.28.0|01.0|0v1|01.0.0|5|0v1|01.0.0|3|03.8.2|01.0.0|21.0|20|02.35.0|01.0.0|0v3.1.5|01.0.0|00.1.0|01.0.2|21.4|5|5|5|5|5|03.4.0|01.0.0|09.3.0|02021.11.12|01.0.0|00.1|3|22.0-oas3|01.0.0|02.15.0|01.0.0|0v3|02020-09-10|65-15|31-03-12|30-07-13|512-01|815|217-07-25|220-02-26|68-01|97|31-05-03|218-05-10|66-01-preview|01.0.0|00.1|01.7.0|20.0|02023.2.27|0v1|06|01.0.0|03.0.7|01.0|0v1|01.42.0|0v1|02.0.0|5|01.0.0|02.23.1|01.1.0~develop|20|3.0|03.7.0|0v1|2beta1|2|2|01.0.14|3|00.4.27|021.00|1.0 (v2)|01.0.0|0v1|00.9.3|01.0|3.0|02.1.0|00.36.1|0v1|09.3.0|5|0directory_v1|0v1.4|2beta|61|2alpha2|2|2|12alpha1|13p1beta1|11alpha1|2|2|2beta2|2p1beta1|2|2|2beta1|2|2|2alpha1|01.42.0|09.3.0|5|0v1|09.3.0|0v2|09.3.0|5|0v1beta2|2|2|12alpha|09.3.0|0v1|2beta1|2|12|11|2beta1|2|2beta1|2|2|12|11beta2|61|01.42.0|0v1|12|2|11|2|01.42.0|0v1beta|12beta|01.42.0|0v2|2|11beta1|2|01.42.0|0v2|2|11|2beta|01.42.0|0v1beta|2|2beta|01.42.0|0v1|2beta1|2alpha1|2|2beta1|2|09.3.0|0v2|01.1.4|5|5|5|5|5|5|5|5|5|22.0|070|01|06|03|01|06|18|2|046|01|1|03|01.0|3.0|00.0.1|01.0.0|5|0v1|00.6-99cfdac|0v1|09.3.0|0v1beta|6|12|11beta1|7|2p7beta1|2beta1|13|11beta1|2|2|12beta3|61|11beta1|7|7|7|7|12beta|11beta1|2.1|2beta1|62|61|7|7|62|6|61|7|7|7|6|61|7|2alpha|2beta1|7|7|7|7|6|61|12beta1|11beta|61|13beta1|11p3beta1|2beta|6|6|2|2beta1|01.0.0|3|3|3|3|00.31.2|21.12|01.0|3|3|3|3|3|3.0|3|3|3|3.0|3|3|3|3|3|3|3|3|3|3|3|3|3|3.0|3|3.0|5|0v79.19.1|01.0.0|5|3|3.0|26.0|0v1.02|01.0.0|46|00.0.1|01.0.0|25.0|0v3|01.0|0v1|01.0|24|20.0|02023-03-01T164537Z|0v1|01.2.20|02.5.1|20|3.0|5|24.13|0V 1.0.0|01.0.0|02.0|01.0|3|3.6|5|21.1|20.2|02.1.2|01.0.3|29.0|20.2|02.0.2|01.0.1|29.2|21.1|20.0|03.0.8|01.1.3|22.2|20.2|22.3|21.1|20.2|40|5|0beta|0v1alpha1|2|01.0.0|5|5|0v1|2beta|13|01.0.0|5|0v2|01.0.0|0v1|01.003|3.0|1|1|1.1.0|20.0|5|0v1|2|2|020230401.1|0v0|11|2|2|2|10.1|01.0.0|0v0|01.0.0|3|0v1|0prealpha|01.1|02.1.0|01.0|02.1.0|5|01.0.0|242.0","sep":"|"},{"f":"02017-05-30T08:34:14Z|221-07-19T10:17:09Z|217-03-15T14:45:58Z|39-07-13T11:28:07Z|38-02-10T10:41:43Z|39-01-03T07:01:34Z|223-02-17T11:02:20Z|k|63-23T23:19:15Z|817T23:18:27Z|62-17T11:02:20Z|63-17T23:18:27Z|62-17T11:02:20Z|31-06-18T13:57:32Z|33-02-17T11:02:20Z|k|217-09-20T14:12:57Z|38-03-03T18:20:03Z|220-09-04T08:31:58Z|33-03-05T12:18:14Z|e22:42Z|h27Z|h11Z|f1:56Z|e16:54Z|f5:52Z|e21:40Z|e15:20Z|e20:05Z|e17:26Z|30-02-28T16:47:57Z|k|k|k|31-01-15T15:07:17Z|30-02-28T16:47:57Z|k|218-12-18T23:56:32Z|220-02-28T16:47:57Z|k|k|k|k|k|k|k|k|31-01-15T15:07:17Z|30-02-28T16:47:57Z|k|k|k|217-05-02T07:59:53Z|220-07-10T08:57:08Z|62-28T16:47:57Z|k|k|k|k|k|k|31-01-15T15:07:17Z|30-02-28T16:47:57Z|k|k|219-01-10T20:43:10Z|220-02-28T16:47:57Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|31-01-15T15:07:17Z|30-02-28T16:47:57Z|k|k|64-29T20:05:58Z|62-28T16:47:57Z|k|k|k|67-10T08:57:08Z|62-28T16:47:57Z|k|31-06-18T13:57:32Z|61-15T15:07:17Z|30-02-28T16:47:57Z|k|k|31-06-18T13:57:32Z|30-02-28T16:47:57Z|k|k|31-01-15T15:07:17Z|30-02-28T16:47:57Z|k|218-12-18T23:56:32Z|221-01-04T14:57:07Z|219-07-15T12:58:08Z|221-01-04T14:52:32Z|33-03-04T16:22:29Z|30-07-18T21:17:36Z|k|k|64-21T15:00:15Z|31-01-13T13:36:22Z|218-03-10T17:05:01Z|220-03-23T13:57:32Z|31-08-12T23:15:25Z|32-03-29T23:21:43Z|216-04-14T12:48:50Z|220-07-16T10:21:02Z|90T08:57:08Z|31-08-12T15:35:25Z|218-02-24T16:36:17Z|39-02-26T08:40:59Z|38-11-20T14:36:34Z|37-04-24T10:15:00Z|39-07-25T10:27:32Z|37-12-04T09:12:06Z|38-11-20T14:36:34Z|39-04-17T07:33:27Z|38-11-20T14:36:34Z|k|220-03-17T10:27:09Z|219-10-04T15:22:20Z|37-04-24T10:15:00Z|38-03-10T09:23:51Z|k|37-04-24T10:15:00Z|220-03-17T10:27:09Z|k|219-07-25T10:27:32Z|36-04-10T23:18:20Z|38-11-20T14:36:34Z|k|37-12-04T09:12:06Z|k|38-11-20T14:36:34Z|37-12-04T09:12:06Z|38-11-20T14:36:34Z|k|503-10T09:23:51Z|511-20T14:36:34Z|k|k|k|k|503-10T09:23:51Z|511-20T14:36:34Z|k|k|39-07-25T10:27:32Z|510-04T15:22:20Z|38-03-10T09:23:51Z|37-12-04T09:12:06Z|36-04-10T23:18:20Z|39-04-17T07:33:27Z|62-26T08:40:59Z|36-04-10T23:18:20Z|39-02-26T08:40:59Z|38-03-10T09:23:51Z|k|39-07-25T10:27:32Z|38-11-20T14:36:34Z|36-05-22T12:37:44Z|64-10T23:18:20Z|37-02-01T10:11:06Z|38-11-20T14:36:34Z|37-09-20T08:49:01Z|512-04T09:12:06Z|38-11-20T14:36:34Z|501-02T11:52:51Z|k|220-03-17T10:27:09Z|218-11-20T14:36:34Z|503-10T09:23:51Z|39-07-25T10:27:32Z|38-11-20T14:36:34Z|39-04-17T07:33:27Z|37-12-04T09:12:06Z|39-01-03T08:13:16Z|64-17T07:33:27Z|61-03T08:13:16Z|38-03-10T09:23:51Z|37-12-04T09:12:06Z|k|39-10-04T15:22:20Z|38-03-10T09:23:51Z|k|220-03-17T10:27:09Z|219-10-04T15:22:20Z|38-11-20T14:36:34Z|39-07-25T10:27:32Z|37-11-25T10:52:13Z|36-10-02T08:32:49Z|38-11-20T14:36:34Z|37-12-04T09:12:06Z|502-01T10:11:06Z|38-03-10T09:23:51Z|36-10-20T16:26:05Z|38-11-20T14:36:34Z|37-12-04T09:12:06Z|k|k|38-10-03T09:43:24Z|37-04-20T18:04:18Z|35-09-22T16:21:28Z|67-13T11:41:15Z|220-03-23T14:35:36Z|217-11-28T18:45:29Z|221-02-28T16:48:40Z|218-03-01T12:40:34Z|220-07-13T15:17:05Z|64-28T06:44:11Z|218-03-10T16:38:23Z|221-06-06T04:37:44Z|217-12-11T13:15:36Z|36-09-14T11:20:07Z|35-10-24T02:39:33Z|61-06T17:45:48Z|221-01-15T13:45:02Z|93T10:32:04Z|33-04-18T16:23:27Z|30-09-09T07:53:00Z|31-06-11T04:36:47Z|215-08-25T07:36:07Z|221-01-13T12:07:20Z|66-07T19:52:31Z|218-11-21T13:16:19Z|35-09-19T02:16:17Z|221-06-01T08:02:55Z|30-07-10T08:57:08Z|217-05-08T14:44:53Z|k|38-02-23T08:02:32Z|223-02-23T17:02:35Z|217-08-15T10:57:49Z|69-20T14:06:35Z|67-31T09:48:45Z|511-27T09:31:58Z|220-07-16T10:22:46Z|219-02-26T10:57:22Z|221-03-15T17:37:38Z|217-03-21T21:46:37Z|k|221-07-20T13:38:39Z|217-04-22T11:51:48Z|220-12-14T10:53:41Z|219-08-06T13:18:03Z|k|35-08-23T20:35:00Z|510-24T02:39:33Z|37-09-04T14:31:34Z|221-06-18T13:57:32Z|33-02-15T18:23:37Z|31-06-09T13:41:41Z|30-01-07T11:38:39Z|31-09-21T23:08:31Z|33-02-28T23:10:50Z|93T23:11:18Z|30-01-07T11:38:39Z|68-04T10:46:39Z|61-07T11:38:39Z|510-26T11:11:58Z|32-09-19T23:12:49Z|30-01-07T11:38:39Z|69-21T08:59:20Z|68-24T08:31:04Z|33-02-28T23:10:50Z|30-09-01T08:20:42Z|31-04-26T09:10:17Z|30-10-26T11:11:58Z|33-02-28T23:10:50Z|31-10-26T23:10:25Z|32-10-25T23:12:23Z|506-23T23:10:23Z|30-09-28T07:52:06Z|33-02-28T23:10:50Z|31-03-01T07:30:58Z|32-09-15T23:13:49Z|30-01-07T11:38:39Z|k|31-11-03T23:09:20Z|30-11-02T10:32:34Z|32-02-14T23:08:57Z|33-02-28T23:10:50Z|k|32-09-15T23:13:49Z|33-02-28T23:10:50Z|32-04-27T23:10:40Z|31-03-24T10:54:00Z|32-03-09T23:10:11Z|510-28T23:13:03Z|33-03-06T23:11:22Z|30-11-09T10:50:27Z|31-08-24T23:09:18Z|65-04T08:43:07Z|30-08-04T10:46:39Z|k|31-02-01T09:47:12Z|33-01-19T23:10:30Z|218-03-29T12:59:57Z|223-03-04T15:30:53Z|215-06-18T13:18:55Z|512-05T06:47:56Z|61-09T22:55:27Z|37-11-25T17:57:32Z|221-06-21T10:04:16Z|64-16T10:11:40Z|30-01-07T11:40:28Z|215-09-07T18:18:34Z|37-01-15T22:52:58Z|35-10-22T19:48:00Z|220-02-12T18:25:47Z|33-03-04T15:31:46Z|218-03-03T18:20:43Z|37-12-11T13:15:36Z|508-08T12:19:23Z|39-02-26T16:10:14Z|220-08-24T15:45:12Z|k|219-03-12T17:14:49Z|223-03-30T14:47:57Z|218-11-20T14:36:34Z|221-04-26T07:51:28Z|218-06-09T11:57:38Z|39-02-24T11:37:15Z|221-06-09T14:28:20Z|217-11-26T17:48:36Z|221-02-07T16:16:03Z|33-03-21T13:15:56Z|216-09-30T18:12:53Z|220-11-02T14:04:45Z|k|218-11-19T23:49:50Z|35-07-14T11:50:33Z|37-11-25T11:10:42Z|36-09-02T10:48:54Z|37-08-15T08:06:40Z|221-03-07T13:21:39Z|62-04T12:23:03Z|215-09-22T16:21:28Z|38-02-23T08:21:55Z|37-08-09T17:36:25Z|38-03-10T10:08:28Z|62-24T17:20:15Z|511-20T11:01:20Z|35-12-07T18:27:02Z|221-01-28T18:24:20Z|32-08-10T23:18:45Z|219-09-30T16:36:50Z|223-03-03T14:11:52Z|k|218-03-28T12:55:05Z|37-11-26T16:51:11Z|36-04-10T23:18:20Z|37-08-12T17:06:43Z|221-02-25T08:01:03Z|215-06-11T00:06:11Z|93T00:30:21Z|96T17:18:08Z|c8:10:07Z|f1:52Z|98T13:16:10Z|821T13:58:25Z|830T20:09:46Z|c2:07:35Z|e26:14Z|67-02T13:30:48Z|e47:37Z|c4:21:19Z|93T15:51:44Z|99T09:55:26Z|813T11:41:15Z|k|k|94T11:50:33Z|96T21:11:55Z|99T21:19:14Z|830T15:41:50Z|68-05T18:22:21Z|823T20:35:00Z|69-07T18:18:34Z|819T02:16:17Z|k|821T15:57:40Z|92T16:21:28Z|k|94T14:03:16Z|510-20T18:10:11Z|92T19:48:00Z|k|94T02:39:33Z|99T17:09:43Z|61-06T17:45:48Z|99T22:55:27Z|k|c3:23:31Z|810T23:56:38Z|91T23:20:20Z|e36:53Z|e47:36Z|92T00:50:18Z|96T20:41:24Z|c1:26:35Z|c2:58:04Z|826T00:19:00Z|b17:52:26Z|97T02:11:59Z|99T02:15:33Z|c5:55:33Z|62-09T12:55:37Z|814T18:53:29Z|822T17:23:32Z|99T20:33:43Z|36-02-21T16:54:05Z|63-09T05:58:34Z|823T17:32:40Z|64-06T00:54:25Z|98T15:45:42Z|810T23:18:20Z|k|k|k|k|k|k|k|k|k|827T13:30:31Z|65-22T12:37:44Z|831T00:33:40Z|b10:55:27Z|66-14T11:22:01Z|827T13:56:46Z|99T10:28:32Z|67-13T20:28:00Z|94T10:37:31Z|c3:26:47Z|68-23T13:48:35Z|96T08:56:19Z|98T17:23:44Z|69-02T10:48:54Z|k|k|k|k|k|k|k|99T08:57:20Z|814T08:16:57Z|830T14:10:15Z|510-02T08:32:49Z|k|k|k|811T20:15:56Z|820T16:26:05Z|93T14:41:11Z|c5:32:30Z|830T20:46:38Z|61-22T15:57:03Z|97T23:01:46Z|37-01-15T22:52:58Z|k|k|k|96T14:46:30Z|b20:50:47Z|820T22:04:27Z|62-01T11:44:50Z|c3:18:29Z|813T12:25:20Z|826T17:03:31Z|c8:33:44Z|63-15T14:45:58Z|97T22:40:07Z|820T21:37:42Z|91T21:46:37Z|k|k|k|k|k|92T09:54:54Z|94T15:09:24Z|64-10T06:44:10Z|91T09:59:29Z|93T09:20:16Z|98T11:07:00Z|820T18:04:18Z|k|k|k|k|92T14:11:24Z|94T10:15:00Z|k|k|k|k|k|k|b21:26:55Z|96T10:32:14Z|99T10:49:26Z|65-02T07:59:53Z|k|k|k|k|k|k|k|k|k|98T14:44:53Z|k|k|k|c6:28:49Z|830T10:32:09Z|66-13T10:07:43Z|67-05T21:35:01Z|810T12:05:11Z|831T09:48:45Z|k|68-01T17:06:31Z|98T12:19:23Z|99T17:36:25Z|810T07:03:11Z|91T08:23:28Z|92T17:06:43Z|k|k|k|95T08:06:40Z|b11:43:15Z|827T02:15:18Z|99T05:47:57Z|831T08:07:31Z|69-04T12:24:26Z|e49:06Z|c3:21:43Z|e31:34Z|c4:08:53Z|c5:05:43Z|96T11:44:38Z|c3:13:01Z|820T08:49:01Z|k|k|k|k|k|k|b13:52:55Z|c4:00:38Z|96T13:42:23Z|c5:09:23Z|98T12:50:00Z|b23:20:07Z|99T06:46:56Z|510-16T11:42:42Z|99T08:08:12Z|824T09:11:12Z|830T12:32:36Z|61-13T11:43:08Z|c2:15:51Z|94T11:01:43Z|c2:09:34Z|821T11:17:54Z|92T17:18:15Z|95T11:22:43Z|f7:33Z|c2:39:25Z|e50:21Z|c8:31:14Z|96T10:49:07Z|c3:57:32Z|c4:05:20Z|c5:09:17Z|c6:51:11Z|k|k|k|k|f8:20Z|c7:01:19Z|f8:21Z|e10:51Z|e22:38Z|f8:52Z|e34:13Z|e48:04Z|h36Z|c8:06:00Z|h14Z|e10:14Z|97T08:50:06Z|c9:31:58Z|b10:56:45Z|h57Z|f7:16Z|h48Z|f8:06Z|h20Z|c9:00:45Z|b20:20:12Z|f1:00Z|h31Z|98T16:03:46Z|830T10:12:39Z|62-04T09:12:06Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|811T13:15:36Z|k|k|k|92T10:25:16Z|95T11:03:17Z|38-01-02T11:52:51Z|k|k|k|k|k|k|k|98T11:33:39Z|817T12:05:29Z|822T14:08:47Z|62-01T06:39:42Z|92T13:43:28Z|98T09:18:50Z|e43:30Z|822T18:44:06Z|c9:42:40Z|93T07:43:18Z|c8:21:55Z|e31:20Z|f6:47Z|e51:29Z|94T16:36:17Z|e46:58Z|c7:02:15Z|e19:57Z|e20:15Z|95T19:27:27Z|98T22:02:25Z|63-01T18:40:46Z|92T12:25:21Z|c3:05:09Z|93T17:34:49Z|c8:20:14Z|h29Z|h43Z|k|k|k|k|97T13:58:07Z|810T09:23:51Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|b10:08:28Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|c3:48:19Z|c6:30:06Z|f4:52Z|e48:12Z|c7:02:49Z|e10:05Z|e47:42Z|91T13:44:54Z|821T13:31:02Z|c4:02:58Z|92T14:38:40Z|98T12:55:05Z|k|k|99T12:59:57Z|64-03T17:20:58Z|824T08:00:10Z|65-01T17:05:44Z|93T09:04:18Z|830T12:17:53Z|e32:23Z|91T06:28:58Z|e46:42Z|66-05T19:10:27Z|98T08:41:08Z|f4:35Z|f8:29Z|e54:36Z|99T11:27:53Z|e36:05Z|e40:46Z|e50:14Z|f4:53Z|811T05:41:57Z|e59:01Z|92T08:24:05Z|94T06:42:45Z|820T08:44:20Z|95T10:11:45Z|68-16T08:03:31Z|510-03T09:43:24Z|821T16:29:07Z|e47:55Z|61-05T11:21:36Z|96T13:28:29Z|c4:18:58Z|814T17:13:11Z|95T08:07:20Z|e12:27Z|e29:42Z|b11:39:26Z|b23:15:50Z|99T23:49:50Z|k|k|k|e56:11Z|820T00:04:28Z|e51:44Z|b11:01:20Z|k|c4:36:34Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|91T11:10:23Z|c2:31:36Z|c3:16:19Z|e46:07Z|94T16:51:58Z|62-22T22:19:13Z|831T09:36:01Z|39-01-03T08:13:16Z|k|k|94T09:51:43Z|b10:23:07Z|c1:37:59Z|e45:13Z|817T00:14:03Z|62-04T18:15:20Z|811T20:55:48Z|99T07:22:08Z|f5:08Z|f7:33Z|e31:58Z|f7:11Z|c9:55:11Z|b10:02:11Z|e15:07Z|826T08:40:59Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|b10:48:58Z|e50:57Z|f4:30Z|h43Z|c5:57:47Z|c6:02:41Z|e10:14Z|k|e31:52Z|f8:56Z|e40:57Z|f3:07Z|63-12T17:14:49Z|k|k|64-17T07:33:27Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|823T13:04:43Z|99T13:10:24Z|830T10:32:58Z|e44:16Z|f7:37Z|65-02T09:25:45Z|66-12T08:54:53Z|f5:27Z|67-04T11:06:56Z|98T08:56:34Z|822T11:04:56Z|95T10:27:32Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|f9:38Z|c6:00:41Z|98T17:20:54Z|68-01T15:56:31Z|96T13:18:03Z|819T17:46:47Z|69-02T08:50:42Z|94T14:49:03Z|824T10:02:44Z|c1:28:31Z|97T07:40:09Z|830T16:36:50Z|k|k|k|510-04T15:22:20Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|828T16:32:07Z|c7:08:59Z|62-05T16:31:22Z|823T11:27:03Z|e31:18Z|220-01-07T11:38:39Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|e40:28Z|k|k|62-12T18:25:47Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|828T16:47:57Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|63-17T10:27:09Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|99T10:04:07Z|e44:04Z|823T13:27:08Z|e35:48Z|e44:14Z|f8:13Z|e56:51Z|f9:32Z|c4:06:54Z|e12:47Z|f4:07Z|e22:08Z|f5:38Z|e30:20Z|f2:22Z|e50:20Z|f4:23Z|c5:15:32Z|e27:25Z|e32:19Z|94T07:40:11Z|64-08T10:05:48Z|h59Z|818T17:29:59Z|821T06:33:24Z|b15:00:15Z|97T10:15:12Z|67-10T08:57:08Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|93T11:05:25Z|c2:26:49Z|c3:26:44Z|e50:02Z|c4:34:49Z|e50:32Z|c5:06:06Z|e19:33Z|95T12:24:02Z|c8:59:09Z|b21:45:34Z|96T10:00:03Z|h38Z|f1:24Z|f6:57Z|f7:31Z|f9:23Z|e10:08Z|h51Z|f1:43Z|f2:17Z|h51Z|f4:21Z|f9:48Z|e20:33Z|f1:40Z|c4:45:23Z|97T14:44:15Z|99T09:26:44Z|821T18:19:03Z|94T12:22:19Z|f4:58Z|98T11:39:09Z|99T11:09:31Z|68-04T10:46:39Z|k|k|k|k|k|k|k|k|c1:05:46Z|813T09:08:44Z|98T13:25:23Z|e31:23Z|99T06:39:08Z|e40:27Z|824T08:21:39Z|f2:10Z|h47Z|e31:04Z|k|k|k|k|k|b12:07:35Z|e31:47Z|f9:11Z|c3:10:30Z|c5:15:25Z|e45:12Z|k|k|k|k|k|k|k|k|k|k|k|c6:05:10Z|95T07:29:40Z|c8:06:26Z|c9:06:08Z|96T17:03:21Z|69-01T08:20:42Z|k|k|k|97T07:55:14Z|b16:02:20Z|817T08:45:04Z|b17:10:40Z|821T08:59:20Z|k|94T16:01:49Z|98T07:52:06Z|k|b15:05:04Z|510-15T09:48:19Z|822T11:24:00Z|96T11:11:58Z|61-01T14:33:27Z|92T10:32:34Z|k|k|c4:04:45Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|93T08:36:26Z|99T10:50:27Z|810T20:51:09Z|91T11:37:28Z|820T07:46:22Z|93T17:31:24Z|94T12:17:03Z|62-04T08:41:34Z|95T09:51:40Z|814T10:48:25Z|e51:47Z|f2:29Z|f3:10Z|f4:16Z|h51Z|f5:18Z|f7:48Z|829T16:53:48Z|31-01-04T14:54:09Z|97T11:50:49Z|98T17:44:02Z|99T16:01:43Z|811T09:52:15Z|92T10:57:56Z|93T10:39:02Z|c1:07:08Z|e33:47Z|c3:29:11Z|e42:29Z|c4:11:59Z|e22:19Z|f4:00Z|h28Z|h47Z|f5:21Z|h43Z|f6:01Z|h20Z|h42Z|94T09:53:08Z|95T13:39:40Z|e54:08Z|c4:03:05Z|e12:06Z|f6:46Z|c5:07:17Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|96T08:45:46Z|b11:20:13Z|98T16:45:49Z|821T13:06:04Z|c5:53:33Z|92T08:16:16Z|e22:52Z|b14:57:27Z|95T07:42:35Z|e52:40Z|b18:35:27Z|96T17:16:08Z|97T01:51:18Z|b11:20:26Z|f8:18Z|98T18:24:20Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|830T07:42:05Z|b17:18:38Z|e20:21Z|f3:17Z|62-01T17:16:19Z|b20:55:32Z|92T10:32:46Z|93T08:29:44Z|b14:16:23Z|c9:47:44Z|94T07:35:34Z|f6:34Z|e42:31Z|e55:37Z|b12:25:14Z|f6:19Z|h59Z|f8:13Z|f9:11Z|e30:00Z|f2:59Z|f4:05Z|97T00:57:01Z|b16:02:38Z|h44Z|h50Z|i6Z|f3:02Z|i8Z|h14Z|h20Z|i6Z|h31Z|i7Z|h44Z|h50Z|i5Z|f4:01Z|i7Z|h12Z|i8Z|h24Z|h30Z|h49Z|h56Z|f5:02Z|i9Z|h15Z|h21Z|i7Z|h38Z|h44Z|h50Z|f6:02Z|i9Z|h14Z|h20Z|i6Z|h32Z|i8Z|h44Z|h50Z|f7:11Z|h27Z|h43Z|h50Z|i7Z|f8:12Z|i9Z|h33Z|h46Z|h52Z|i9Z|f9:05Z|h11Z|i8Z|h24Z|i9Z|h35Z|h41Z|i8Z|h54Z|e10:00Z|i6Z|h12Z|i7Z|h24Z|h30Z|i6Z|h42Z|i7Z|h54Z|f1:08Z|h17Z|h23Z|h42Z|i7Z|h53Z|i8Z|f2:05Z|h11Z|i7Z|h29Z|h35Z|h41Z|i7Z|h53Z|i9Z|f3:05Z|h11Z|i6Z|h22Z|i8Z|h39Z|h45Z|h57Z|f4:03Z|i8Z|h14Z|i9Z|h43Z|i9Z|f5:01Z|i7Z|h13Z|i9Z|h25Z|h31Z|h44Z|f6:11Z|i9Z|h26Z|h33Z|h46Z|h52Z|i8Z|f7:04Z|i9Z|h15Z|h21Z|i7Z|h33Z|h45Z|h52Z|i8Z|f8:04Z|h10Z|i6Z|h22Z|i8Z|h34Z|h40Z|i5Z|h52Z|i7Z|f9:03Z|i9Z|h22Z|i8Z|h33Z|i9Z|h45Z|h50Z|e20:25Z|h30Z|i6Z|h42Z|i8Z|h54Z|f1:01Z|i7Z|h13Z|i9Z|h25Z|h31Z|i7Z|h43Z|h50Z|i6Z|f2:02Z|i8Z|h14Z|h20Z|i6Z|h31Z|i8Z|h44Z|h50Z|i6Z|f3:02Z|i8Z|h14Z|h21Z|i7Z|h32Z|h40Z|i6Z|h52Z|i8Z|f4:04Z|h10Z|i6Z|h23Z|i9Z|h35Z|h40Z|h52Z|i8Z|f5:04Z|h10Z|98T15:04:52Z|99T14:09:45Z|810T08:17:41Z|e22:45Z|f3:05Z|b14:05:46Z|93T08:00:21Z|95T22:26:07Z|96T11:04:43Z|b20:06:08Z|98T18:44:25Z|99T14:46:59Z|825T08:01:03Z|k|k|k|k|96T08:21:54Z|63-01T07:30:58Z|k|k|c8:47:16Z|92T18:08:02Z|93T11:27:27Z|c4:29:39Z|b20:21:38Z|97T13:21:39Z|k|k|99T14:57:09Z|816T15:35:52Z|822T11:25:24Z|94T10:54:00Z|831T06:21:07Z|b13:30:20Z|e41:49Z|e52:35Z|f4:41Z|64-06T16:41:01Z|f4:51Z|f6:05Z|99T12:10:45Z|811T01:41:03Z|92T07:41:31Z|93T03:58:34Z|94T17:12:40Z|95T10:18:10Z|c3:00:14Z|96T09:31:38Z|e47:17Z|e56:21Z|b10:11:40Z|k|k|k|k|k|k|c5:56:45Z|99T21:33:09Z|822T21:19:59Z|96T07:51:28Z|c9:10:17Z|98T08:32:04Z|99T09:49:43Z|830T10:53:10Z|65-04T08:43:07Z|97T11:15:18Z|99T16:09:11Z|810T16:08:37Z|c7:26:29Z|97T08:04:41Z|99T09:17:01Z|827T08:57:20Z|99T08:26:54Z|66-01T11:21:46Z|96T08:41:31Z|c9:09:55Z|97T16:22:55Z|e32:17Z|c9:50:26Z|f3:58Z|f6:47Z|f9:09Z|b20:02:01Z|c1:03:13Z|99T09:30:43Z|b13:41:41Z|k|k|k|k|k|c5:10:14Z|810T07:41:38Z|e57:59Z|c9:02:35Z|94T09:46:07Z|b10:28:10Z|f9:23Z|c2:51:23Z|c5:33:05Z|95T10:26:51Z|c7:32:21Z|96T13:31:23Z|98T13:57:32Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|821T09:57:57Z|b10:54:37Z|93T08:49:05Z|e51:19Z|f2:36Z|830T09:19:09Z|e25:42Z|b17:23:05Z|67-05T09:33:17Z|e52:54Z|b10:28:09Z|99T11:29:36Z|c4:14:34Z|812T14:46:56Z|c6:37:23Z|93T09:20:12Z|b23:09:24Z|94T23:09:46Z|95T17:09:03Z|99T10:58:55Z|826T09:45:31Z|97T13:41:55Z|c5:01:14Z|e26:52Z|68-02T10:17:02Z|93T13:05:41Z|99T23:09:41Z|812T15:35:06Z|93T08:01:40Z|96T15:11:22Z|c6:36:13Z|823T10:16:31Z|94T23:09:18Z|831T23:19:35Z|69-02T23:19:50Z|821T23:08:31Z|k|k|k|k|k|k|k|k|k|k|k|k|k|92T23:08:53Z|98T23:08:34Z|510-07T23:08:50Z|811T23:09:00Z|95T23:08:59Z|98T23:09:23Z|e19:50Z|99T23:16:31Z|825T23:16:59Z|96T23:10:25Z|98T23:16:09Z|99T23:09:32Z|61-01T23:17:19Z|93T23:19:04Z|94T23:09:19Z|815T23:09:33Z|96T23:09:55Z|97T23:09:31Z|62-06T23:16:42Z|813T23:09:42Z|97T23:09:06Z|829T23:09:01Z|32-01-05T23:09:39Z|814T23:09:34Z|825T23:09:49Z|62-03T23:07:59Z|98T23:09:22Z|811T23:08:48Z|94T23:08:57Z|824T23:10:34Z|98T23:12:00Z|63-09T23:10:11Z|823T23:22:04Z|64-08T23:09:59Z|827T23:10:40Z|65-04T23:11:00Z|95T23:11:18Z|830T23:11:34Z|66-15T23:17:22Z|67-22T23:10:34Z|68-02T23:10:20Z|810T23:18:45Z|92T23:10:40Z|96T23:09:53Z|69-19T23:12:49Z|830T23:12:54Z|510-19T23:24:22Z|825T23:12:23Z|96T23:13:08Z|98T23:13:03Z|61-04T23:12:54Z|816T23:21:36Z|829T23:10:59Z|62-08T23:10:44Z|813T23:10:33Z|94T23:17:32Z|96T23:09:09Z|99T23:09:37Z|33-01-04T23:09:46Z|816T23:09:35Z|98T23:10:10Z|823T23:09:37Z|97T23:18:14Z|830T23:10:28Z|62-15T18:23:37Z|k|k|k|k|k|k|k|k|k|e47:28Z|97T11:02:20Z|k|k|k|k|k|k|k|k|k|k|k|c3:11:10Z|820T14:02:42Z|e47:14Z|91T10:49:02Z|c6:06:57Z|b23:11:00Z|92T17:08:56Z|93T23:11:18Z|94T23:23:31Z|98T23:10:50Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|63-01T23:11:06Z|93T14:11:52Z|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|k|94T15:21:40Z|f5:08Z|f6:35Z|h56Z|f7:54Z|f8:10Z|h48Z|f9:17Z|h33Z|e30:01Z|h32Z|f1:09Z|h28Z|f2:20Z|h36Z|h55Z|f5:44Z|f7:25Z|f8:07Z|f9:15Z|e40:00Z|h45Z|f1:03Z|h20Z|f3:06Z|h37Z|h54Z|f5:43Z|c6:14:19Z|95T10:04:44Z|e25:12Z|c1:32:47Z|c2:14:49Z|f5:05Z|h36Z|f6:08Z|h23Z|h39Z|f7:10Z|h42Z|h58Z|f8:30Z|h46Z|f9:02Z|h17Z|h33Z|h49Z|e20:21Z|h37Z|h53Z|f1:08Z|h24Z|c6:52:06Z|h11Z|h41Z|96T10:13:34Z|f4:18Z|b23:11:22Z|97T23:11:38Z|98T08:03:07Z|b10:16:13Z|e49:38Z|c8:17:18Z|814T23:09:54Z|e21:27Z|95T14:06:52Z|c8:34:13Z|97T23:09:37Z|820T18:26:36Z|e36:06Z|92T15:28:07Z|c6:58:56Z|b23:16:51Z|93T23:19:15Z|94T16:27:44Z|e34:40Z|95T18:07:14Z|98T23:09:36Z|64-01T14:48:34Z|e56:28Z|92T04:11:18Z|b17:16:51Z|e20:59Z|f8:14Z|f9:03Z|e32:17Z|e50:36Z|93T09:10:12Z|b14:08:11Z|95T10:29:36Z|812T13:21:52Z|94T12:45:47Z|98T16:22:49Z|h55Z|f3:01Z|i9Z|h15Z|h21Z|h35Z|820T23:20:25Z","sep":"|"},{"d":"2017-06-27T16:49:57Z|2023-02-27T15:08:09Z|2021-06-21T12:16:53Z|2021-07-26T09:42:14Z|2023-03-06T07:12:59Z|2023-04-04T23:18:43Z|2023-02-24T23:24:00Z|2023-04-18T23:18:31Z|2023-04-21T23:18:02Z|2023-04-19T23:18:47Z|2021-06-18T13:57:32Z|2023-03-22T23:16:51Z|2023-03-24T18:30:03Z|2020-04-16T18:45:33Z|2020-04-27T20:04:05Z|2020-03-23T09:21:07Z|2020-02-28T16:47:57Z|2021-01-15T15:07:17Z|2020-05-04T20:09:16Z|2020-04-21T06:33:24Z|2020-05-07T20:22:57Z|2020-04-23T20:32:41Z|2020-03-25T18:54:51Z|2020-03-25T07:24:09Z|2020-03-29T15:19:43Z|2020-03-11T18:02:18Z|2020-04-21T20:02:04Z|2020-04-09T06:28:07Z|2020-07-10T08:57:08Z|2020-05-11T19:05:17Z|2020-05-06T20:09:09Z|2020-03-31T20:14:16Z|2020-04-24T20:56:57Z|2020-04-28T19:55:13Z|2020-04-07T06:35:33Z|2020-04-22T19:13:43Z|2020-04-18T14:31:19Z|2020-03-26T20:05:58Z|2020-04-02T18:31:21Z|2020-03-28T08:15:13Z|2020-05-09T06:36:06Z|2020-04-30T20:18:10Z|2020-05-12T18:33:47Z|2020-03-18T21:34:18Z|2020-04-04T11:33:26Z|2020-04-29T20:05:58Z|2021-08-23T09:34:59Z|2021-07-05T15:07:17Z|2023-03-04T16:22:29Z|2021-06-30T09:57:47Z|2020-11-23T17:04:42Z|2021-08-16T08:03:09Z|2021-07-19T09:27:57Z|2023-04-19T23:18:23Z|2022-04-08T23:17:35Z|2021-08-12T15:35:25Z|2019-02-26T08:40:59Z|2018-11-20T14:36:34Z|2017-04-24T10:15:00Z|2019-07-25T10:27:32Z|2017-12-04T09:12:06Z|2020-03-17T10:27:09Z|2019-04-17T07:33:27Z|2019-02-11T11:58:34Z|2019-10-04T15:22:20Z|2018-03-10T09:23:51Z|2019-07-22T11:10:17Z|2019-01-03T07:01:34Z|2019-06-17T14:37:18Z|2020-01-07T11:38:14Z|2019-09-09T18:14:26Z|2019-09-23T09:26:07Z|2016-04-10T23:18:20Z|2019-07-22T11:03:07Z|2016-05-22T12:37:44Z|2017-02-01T10:11:06Z|2017-09-20T08:49:01Z|2018-01-02T11:52:51Z|2019-06-17T14:38:37Z|2018-02-19T08:41:37Z|2019-01-03T08:13:16Z|2017-11-25T10:52:13Z|2016-10-02T08:32:49Z|2019-02-04T10:47:10Z|2020-01-07T11:40:28Z|2018-02-05T08:23:20Z|2021-02-28T16:48:40Z|2021-08-09T09:15:57Z|2023-02-17T17:03:52Z|2018-08-24T14:28:47Z|2020-07-22T15:39:06Z|2018-02-01T07:11:28Z|2021-07-12T10:31:14Z|2023-04-18T16:23:27Z|2019-07-22T11:04:56Z|2021-08-02T08:20:08Z|2021-06-14T09:47:20Z|2018-11-21T13:16:19Z|2019-02-25T11:01:54Z|2023-02-23T17:02:35Z|2021-01-18T09:19:53Z|2020-11-02T10:00:44Z|2023-03-05T17:10:25Z|2021-07-20T13:38:39Z|2021-07-26T08:51:53Z|2019-02-13T10:30:29Z|2017-05-11T11:35:35Z|2023-02-15T18:23:37Z|2023-04-21T23:09:23Z|2021-05-24T10:16:55Z|2021-04-07T07:29:07Z|2023-04-19T23:09:47Z|2023-03-17T23:09:37Z|2023-03-20T23:09:50Z|2023-04-17T23:09:22Z|2023-02-28T23:10:50Z|2023-04-13T23:09:44Z|2020-01-07T11:38:39Z|2023-04-04T23:09:25Z|2023-04-20T23:11:29Z|2023-02-17T23:10:43Z|2022-11-01T23:13:37Z|2021-06-21T09:57:57Z|2023-03-23T23:09:53Z|2018-03-21T13:31:02Z|2021-01-25T09:04:01Z|2021-06-30T12:38:56Z|2022-10-31T23:20:47Z|2023-03-23T23:20:15Z|2018-02-05T07:13:13Z|2017-12-18T07:27:05Z|2017-04-29T11:24:42Z|2021-06-21T10:03:47Z|2019-05-02T08:12:37Z|2020-08-10T12:26:35Z|2020-08-24T15:45:12Z|2019-03-12T17:14:49Z|2023-04-05T14:08:28Z|2023-02-15T18:33:18Z|2023-02-17T11:41:15Z|2021-04-07T09:52:45Z|2021-06-21T10:17:58Z|2021-02-07T16:16:03Z|2023-03-21T13:15:56Z|2023-03-24T18:44:13Z|2021-06-21T10:22:54Z|2021-06-21T10:04:22Z|2021-03-07T13:21:39Z|2023-03-03T15:17:57Z|2017-04-04T17:27:32Z|2023-03-05T17:16:49Z|2023-04-20T23:20:25Z|2023-03-03T14:11:52Z|2021-06-07T09:52:13Z|2021-02-25T08:01:03Z|2019-01-19T20:48:31Z|2019-04-11T08:37:45Z|2021-07-26T10:09:56Z|2017-11-20T15:10:56Z|2019-07-25T10:29:38Z|2018-12-31T09:06:40Z|2018-03-27T11:50:12Z|2019-09-29T16:13:21Z|2017-04-11T19:58:07Z|2023-02-17T17:36:25Z|2018-02-27T17:51:33Z|2019-02-13T10:31:07Z|2023-04-05T13:10:14Z|2016-04-27T13:30:31Z|2016-07-14T10:37:31Z|2016-08-26T08:56:19Z|2023-03-23T18:01:34Z|2016-11-22T15:57:03Z|2017-05-30T07:45:19Z|2021-07-02T14:53:39Z|2018-11-28T10:43:55Z|2017-08-10T20:49:32Z|2017-09-25T12:07:00Z|2021-06-30T12:39:27Z|2019-06-07T12:35:41Z|2017-09-04T13:21:43Z|2018-09-27T12:24:15Z|2017-09-06T11:44:38Z|2018-04-19T18:23:23Z|2018-02-19T08:08:39Z|2017-11-25T12:39:25Z|2018-01-17T08:35:04Z|2023-03-03T17:44:41Z|2017-11-27T13:03:31Z|2023-03-08T18:18:16Z|2018-05-29T13:40:40Z|2017-11-27T10:57:48Z|2018-03-10T10:27:22Z|2018-03-27T13:06:58Z|2021-07-02T15:01:12Z|2021-06-30T12:40:26Z|2019-11-13T17:42:03Z|2020-10-19T08:23:36Z|2021-06-30T12:40:43Z|2019-02-26T16:26:43Z|2018-06-20T08:44:20Z|2023-03-03T17:46:37Z|2020-08-19T07:25:21Z|2018-11-06T14:18:58Z|2018-11-15T08:07:20Z|2020-03-22T17:50:07Z|2018-11-21T11:10:23Z|2018-11-21T12:31:36Z|2021-03-01T11:29:30Z|2019-03-17T16:45:57Z|2023-02-17T17:21:12Z|2019-01-04T11:45:13Z|2023-03-06T09:58:04Z|2020-07-16T08:09:03Z|2020-01-07T12:09:22Z|2019-02-26T16:02:41Z|2019-04-30T10:44:16Z|2020-11-16T10:49:14Z|2020-11-30T11:16:50Z|2020-08-03T06:51:32Z|2023-02-21T23:11:00Z|2022-08-12T23:10:40Z|2021-07-13T23:17:29Z|2020-03-07T10:12:22Z|2020-03-17T09:20:43Z|2020-05-01T20:52:55Z|2020-03-13T10:54:24Z|2020-04-07T20:59:17Z|2020-05-05T20:20:19Z|2021-06-07T19:26:00Z|2023-03-09T23:11:47Z|2021-01-13T10:02:42Z|2020-07-15T18:59:09Z|2021-01-26T17:05:48Z|2022-03-23T23:15:18Z|2020-12-30T12:59:00Z|2021-08-19T23:09:36Z|2023-02-17T09:02:50Z|2020-08-24T08:22:47Z|2020-11-09T10:19:12Z|2023-03-06T23:11:22Z|2021-07-11T13:52:11Z|2021-01-07T11:50:49Z|2023-02-20T15:44:56Z|2023-03-07T09:08:36Z|2023-02-23T12:23:32Z|2022-05-18T23:17:34Z|2021-06-09T09:26:30Z|2021-02-07T16:02:38Z|2021-02-07T16:02:44Z|2021-02-07T16:02:50Z|2021-02-07T16:02:56Z|2021-02-07T16:03:02Z|2021-02-07T16:03:08Z|2021-02-07T16:03:14Z|2021-02-07T16:03:20Z|2021-02-07T16:03:26Z|2021-02-07T16:03:31Z|2021-02-07T16:03:37Z|2021-02-07T16:03:44Z|2021-02-07T16:03:50Z|2021-02-07T16:03:55Z|2021-02-07T16:04:01Z|2021-02-07T16:04:07Z|2021-02-07T16:04:12Z|2021-02-07T16:04:18Z|2021-02-07T16:04:24Z|2021-02-07T16:04:30Z|2021-02-07T16:04:49Z|2021-02-07T16:04:56Z|2021-02-07T16:05:02Z|2021-02-07T16:05:09Z|2021-02-07T16:05:15Z|2021-02-07T16:05:21Z|2021-02-07T16:05:27Z|2021-02-07T16:05:38Z|2021-02-07T16:05:44Z|2021-02-07T16:05:50Z|2021-02-07T16:06:02Z|2021-02-07T16:06:09Z|2021-02-07T16:06:14Z|2021-02-07T16:06:20Z|2021-02-07T16:06:26Z|2021-02-07T16:06:32Z|2021-02-07T16:06:38Z|2021-02-07T16:06:44Z|2021-02-07T16:06:50Z|2021-02-07T16:07:11Z|2021-02-07T16:07:27Z|2021-02-07T16:07:43Z|2021-02-07T16:07:50Z|2021-02-07T16:07:57Z|2021-02-07T16:08:12Z|2021-02-07T16:08:19Z|2021-02-07T16:08:33Z|2021-02-07T16:08:46Z|2021-02-07T16:08:52Z|2021-02-07T16:08:59Z|2021-02-07T16:09:05Z|2021-02-07T16:09:11Z|2021-02-07T16:09:18Z|2021-02-07T16:09:24Z|2021-02-07T16:09:29Z|2021-02-07T16:09:35Z|2021-02-07T16:09:41Z|2021-02-07T16:09:48Z|2021-02-07T16:09:54Z|2021-02-07T16:10:00Z|2021-02-07T16:10:06Z|2021-02-07T16:10:12Z|2021-02-07T16:10:17Z|2021-02-07T16:10:24Z|2021-02-07T16:10:30Z|2021-02-07T16:10:36Z|2021-02-07T16:10:42Z|2021-02-07T16:10:47Z|2021-02-07T16:10:54Z|2021-02-07T16:11:08Z|2021-02-07T16:11:17Z|2021-02-07T16:11:23Z|2021-02-07T16:11:42Z|2021-02-07T16:11:47Z|2021-02-07T16:11:53Z|2021-02-07T16:11:58Z|2021-02-07T16:12:05Z|2021-02-07T16:12:11Z|2021-02-07T16:12:17Z|2021-02-07T16:12:29Z|2021-02-07T16:12:35Z|2021-02-07T16:12:41Z|2021-02-07T16:12:47Z|2021-02-07T16:12:53Z|2021-02-07T16:12:59Z|2021-02-07T16:13:05Z|2021-02-07T16:13:11Z|2021-02-07T16:13:16Z|2021-02-07T16:13:22Z|2021-02-07T16:13:28Z|2021-02-07T16:13:39Z|2021-02-07T16:13:45Z|2021-02-07T16:13:57Z|2021-02-07T16:14:03Z|2021-02-07T16:14:08Z|2021-02-07T16:14:14Z|2021-02-07T16:14:19Z|2021-02-07T16:14:43Z|2021-02-07T16:14:49Z|2021-02-07T16:15:01Z|2021-02-07T16:15:07Z|2021-02-07T16:15:13Z|2021-02-07T16:15:19Z|2021-02-07T16:15:25Z|2021-02-07T16:15:31Z|2021-02-07T16:15:44Z|2021-02-07T16:16:11Z|2021-02-07T16:16:19Z|2021-02-07T16:16:26Z|2021-02-07T16:16:33Z|2021-02-07T16:16:46Z|2021-02-07T16:16:52Z|2021-02-07T16:16:58Z|2021-02-07T16:17:04Z|2021-02-07T16:17:09Z|2021-02-07T16:17:15Z|2021-02-07T16:17:21Z|2021-02-07T16:17:27Z|2021-02-07T16:17:33Z|2021-02-07T16:17:45Z|2021-02-07T16:17:52Z|2021-02-07T16:17:58Z|2021-02-07T16:18:04Z|2021-02-07T16:18:10Z|2021-02-07T16:18:16Z|2021-02-07T16:18:22Z|2021-02-07T16:18:28Z|2021-02-07T16:18:34Z|2021-02-07T16:18:40Z|2021-02-07T16:18:45Z|2021-02-07T16:18:52Z|2021-02-07T16:18:57Z|2021-02-07T16:19:03Z|2021-02-07T16:19:09Z|2021-02-07T16:19:22Z|2021-02-07T16:19:28Z|2021-02-07T16:19:33Z|2021-02-07T16:19:39Z|2021-02-07T16:19:45Z|2021-02-07T16:19:50Z|2021-02-07T16:20:25Z|2021-02-07T16:20:30Z|2021-02-07T16:20:36Z|2021-02-07T16:20:42Z|2021-02-07T16:20:48Z|2021-02-07T16:20:54Z|2021-02-07T16:21:01Z|2021-02-07T16:21:07Z|2021-02-07T16:21:13Z|2021-02-07T16:21:19Z|2021-02-07T16:21:25Z|2021-02-07T16:21:31Z|2021-02-07T16:21:37Z|2021-02-07T16:21:43Z|2021-02-07T16:21:50Z|2021-02-07T16:21:56Z|2021-02-07T16:22:02Z|2021-02-07T16:22:08Z|2021-02-07T16:22:14Z|2021-02-07T16:22:20Z|2021-02-07T16:22:26Z|2021-02-07T16:22:31Z|2021-02-07T16:22:38Z|2021-02-07T16:22:44Z|2021-02-07T16:22:50Z|2021-02-07T16:22:56Z|2021-02-07T16:23:02Z|2021-02-07T16:23:08Z|2021-02-07T16:23:14Z|2021-02-07T16:23:21Z|2021-02-07T16:23:27Z|2021-02-07T16:23:32Z|2021-02-07T16:23:40Z|2021-02-07T16:23:46Z|2021-02-07T16:23:52Z|2021-02-07T16:23:58Z|2021-02-07T16:24:04Z|2021-02-07T16:24:10Z|2021-02-07T16:24:16Z|2021-02-07T16:24:23Z|2021-02-07T16:24:29Z|2021-02-07T16:24:35Z|2021-02-07T16:24:40Z|2021-02-07T16:24:52Z|2021-02-07T16:24:58Z|2021-02-07T16:25:04Z|2021-02-07T16:25:10Z|2021-04-12T07:45:58Z|2021-03-31T13:52:35Z|2021-11-04T23:09:19Z|2022-03-25T23:21:07Z|2022-12-05T23:20:04Z|2021-06-21T10:04:16Z|2023-02-07T23:18:02Z|2023-02-27T15:07:17Z|2023-02-17T12:17:44Z|2021-06-07T19:59:09Z|2021-06-07T20:04:43Z|2021-06-09T09:36:07Z|2021-06-10T09:33:56Z|2021-07-26T10:07:00Z|2023-01-05T23:23:56Z|2023-02-17T17:54:09Z|2021-07-05T09:39:32Z|2021-07-09T11:40:11Z|2021-07-13T17:59:10Z|2021-07-26T09:47:48Z|2021-07-27T15:26:52Z|2021-08-12T15:35:06Z|2021-08-16T15:11:22Z|2021-08-16T16:36:13Z|2021-09-23T23:08:15Z|2022-10-20T23:15:56Z|2022-12-05T23:10:17Z|2023-04-14T23:09:37Z|2023-03-16T23:10:07Z|2023-03-24T23:09:27Z|2023-04-21T23:17:40Z|2023-04-07T23:09:13Z|2023-04-12T23:09:04Z|2022-08-16T23:09:53Z|2023-04-06T23:10:02Z|2023-03-28T23:09:36Z|2023-04-10T23:09:58Z|2023-01-18T23:10:10Z|2023-03-03T09:27:09Z|2023-03-15T23:18:29Z|2023-04-12T23:18:28Z|2023-04-17T23:18:26Z|2023-02-17T11:02:20Z|2023-03-07T23:20:48Z|2023-02-17T13:11:10Z|2023-02-22T17:08:56Z|2023-03-01T23:11:06Z|2023-03-02T23:11:11Z|2023-03-04T15:26:56Z|2023-03-04T15:29:33Z|2023-03-04T15:30:32Z|2023-03-06T10:13:34Z|2023-03-06T10:14:18Z|2023-03-08T08:03:07Z|2023-03-08T10:16:13Z|2023-03-08T10:49:38Z|2023-03-09T19:33:20Z|2023-03-14T23:21:27Z|2023-03-15T14:06:52Z|2023-03-15T18:34:13Z|2023-03-20T18:26:36Z|2023-03-20T18:36:06Z|2023-03-22T15:28:07Z|2023-03-22T16:58:56Z|2023-04-05T23:21:49Z|2023-03-24T16:27:44Z|2023-03-24T16:34:40Z|2023-03-25T18:07:14Z|2023-04-01T14:48:34Z|2023-04-01T14:56:28Z|2023-04-02T04:15:02Z|2023-04-02T17:16:51Z|2023-04-02T17:20:59Z|2023-04-02T17:28:14Z|2023-04-02T17:29:03Z|2023-04-02T17:32:17Z|2023-04-02T17:50:36Z|2023-04-03T09:10:12Z|2023-04-03T14:08:11Z|2023-04-05T10:29:36Z|2023-04-12T13:21:52Z|2023-04-14T12:45:47Z|2023-04-18T16:22:49Z|2023-04-18T16:22:55Z|2023-04-18T16:23:01Z|2023-04-18T16:23:09Z|2023-04-18T16:23:15Z|2023-04-18T16:23:21Z|2023-04-18T16:23:35Z","r":"0*1,1*1,2*1,3*1,2*1,4*1,5*1,6*1,7*1,8*1,7*1,8*1,9*1,a*1,b*1,9*1,2*1,4*1,c*c,d*1,e*1,f*1,g*1,h*1,g*1,i*1,g*1,j*1,k*1,l*1,m*1,g*1,n*1,o*1,p*2,h*1,q*1,r*1,p*1,o*1,p*1,s*1,t*1,p*1,u*1,p*3,v*1,h*1,p*1,w*1,e*1,o*1,p*1,x*1,y*1,o*2,z*1,p*1,z*1,p*1,10*1,11*1,12*1,13*1,j*1,14*1,h*1,d*1,15*1,p*1,16*1,p*1,x*1,p*1,k*1,s*1,p*1,v*1,a*1,h*1,10*1,17*1,18*1,a*1,p*1,19*1,p*1,h*1,p*1,16*1,g*1,4*1,1a*1,1b*1,1c*1,1d*1,4*1,1e*1,2*1,1f*1,4*1,1g*1,1h*1,1i*1,4*3,1j*1,2*1,1k*1,1l*1,1m*1,1n*1,1o*1,1p*1,1q*1,1l*1,1r*1,1p*1,1s*1,1m*1,1t*1,1u*1,1m*1,1p*2,1n*1,1q*1,1l*2,1v*1,1o*1,1l*1,1o*1,1l*2,1t*1,1l*1,1w*1,1x*1,1l*2,1y*1,1l*2,1z*1,1n*1,1s*1,1t*1,1o*1,20*1,1q*1,1k*1,20*1,1k*1,21*1,1t*1,1n*1,1l*1,22*1,20*1,23*1,1l*1,24*1,1o*1,1l*1,25*1,1v*1,1p*1,1l*1,1t*1,1n*1,26*1,1q*1,27*1,1y*1,1q*1,28*1,1t*1,1o*2,1s*1,1t*2,1p*1,1s*1,1l*1,1n*1,29*1,2a*1,1l*1,1o*1,23*1,1p*1,27*1,1l*1,1o*3,2*2,2b*1,2c*1,2*1,2d*1,2e*1,2f*1,4*1,2g*1,2h*1,4*2,2i*1,2j*2,4*1,2k*1,2l*1,2*1,4*1,2m*1,2n*1,2o*1,2p*1,2q*1,2*2,1e*1,2*2,2r*1,4*1,2s*1,2t*1,2u*2,4*1,2*1,1b*2,2v*1,2w*1,2*3,2x*1,2y*1,2*1,2z*3,30*4,31*1,30*2,32*1,30*3,33*1,34*1,30*4,35*1,30*1,36*1,30*1,37*1,30*2,38*1,39*1,30*1,3a*1,30*1,37*1,30*1,3b*1,30*1,3c*1,30*2,3d*1,30*4,34*1,3e*1,3f*1,30*1,2*1,4*1,3g*1,3h*1,3i*1,2*1,3j*1,3k*1,2*1,3l*1,3m*1,3n*1,3o*1,4*1,3p*1,3q*1,2*2,3r*2,3s*1,3t*1,3u*1,3v*1,3w*1,4*1,3x*1,2*1,3y*1,3z*1,4*1,40*2,4*2,41*1,42*1,2*1,43*1,44*1,45*1,1e*1,2*1,46*1,2*1,2q*1,47*3,2i*1,48*2,4*1,2*1,49*1,2*1,4a*1,4*1,2*1,2c*1,2h*1,4b*1,4c*1,2h*1,30*1,4*1,4d*1,4e*1,1e*1,2h*1,4f*1,2h*1,4g*1,4h*1,3g*1,2c*1,45*1,4i*1,1v*1,1d*1,2m*1,4j*1,2c*2,2*3,4*2,4k*1,1e*1,2y*1,1e*1,4l*1,2*1,2q*1,2h*1,2*1,2q*1,4m*1,2q*1,2*1,1g*1,2h*1,2*1,3w*1,4n*1,2*1,2h*2,2*1,1v*1,4*1,2*2,4*3,2*1,20*2,1v*1,20*2,27*1,20*4,4o*1,22*1,4*2,2*2,49*1,4*1,4p*1,2*2,4q*1,4r*1,42*1,41*1,42*6,4*3,2a*3,27*1,2*1,42*1,2*1,4*1,2*1,4s*1,1a*1,3m*4,4*1,2*2,4t*1,2*1,4u*1,2h*1,1f*1,4*2,45*1,1b*6,2*1,2i*1,2*2,4*2,2*2,4*1,2*2,4v*1,1m*1,27*1,1m*5,4*1,2*1,4*1,o*1,p*1,y*1,12*1,l*1,z*1,p*1,o*3,2*4,4*1,4w*1,2m*1,4*1,4x*1,2u*1,1e*2,2*2,4*1,4y*1,1d*1,2*4,4*1,2*1,4*1,4z*1,2i*1,2*1,50*1,4*1,2*1,51*1,52*1,4*1,24*7,53*1,2*1,54*1,2*1,3w*1,2*1,1g*1,2*2,4*3,2*1,4*1,2*1,4*1,2*1,4*1,1a*1,55*1,4*1,2*1,4*1,2k*1,2c*1,4*1,2*1,56*1,57*1,2*2,58*1,4*1,2k*1,59*1,4*2,2*1,5a*1,2*4,1e*1,2u*1,2n*1,2*1,4*1,5b*1,2h*1,2i*1,2*4,p*1,g*1,1o*a,1t*1,1o*j,5c*1,1o*3,1x*2,1o*3,5d*1,1o*s,27*1,1o*3,27*1,1o*8,1u*1,27*1,1o*2,1z*1,1o*13,21*1,1o*j,2i*7,1v*1,1a*1,4*1,1a*1,2i*1,4*1,25*1,1v*1,25*5,2i*1,2*1,4*1,2*1,4*1,5e*1,2*5,3w*1,4*1,2*3,4*1,2*4,1d*1,2*1,4*1,2*3,2s*1,2n*1,4*1,3p*1,4*1,3p*1,2*1,1t*10,1l*1,1y*1,1p*1,1t*2,1z*1,1y*1,1l*1,1t*a,1p*1,1t*7,30*1,3u*1,46*x,5f*1,4*1,2*1,4*1,2*1,4*1,2*1,4*3,5g*1,5h*1,2i*1,4*1,2*1,4*1,2*5,4*1,2h*1,o*1,4*1,2*1,4*1,2*1,5i*1,1d*1,2*3,1e*1,2*1,5j*1,1z*1,5k*1,2*1,5l*1,4*2,3w*1,2*1,5m*1,5n*1,2*1,5o*1,4*1,1e*1,2t*1,4*3,2*3,4*2,2q*1,5p*1,1l*j,1r*1,1l*5,1n*1,1l*z,1z*4,1l*2,1z*1,1l*5,1x*1,1l*1,1v*1,1l*1k,1r*1,1l*1d,2i*1,3u*1,2i*1,5q*1,5r*1,2p*1,4*1,5s*1,5t*1,2*1,28*2,5u*1,2*2,2q*1,5v*1,4*2,5w*1,4*1,2*3,1e*1,2*3,1k*2,1y*1,1k*2,5x*1,1k*m,5y*1,4*1,1e*1,2*1,4*2,5z*1,2*3,4*2,2s*1,3s*3,1q*d,1n*1,1q*8,3u*1,2*2,1e*1,60*1,4*5,61*1,4*1,1n*q,46*1,2*2,4*1,2*4,2s*1,62*1,4*1,2i*4,1s*1,1x*1,1s*i,2*2,2s*1,2*1,4*1,30*4,63*1,30*6,39*1,30*1,64*1,38*1,30*5,3b*1,30*d,39*1,65*1,30*2,3e*1,39*1,30*3,39*1,30*9,3e*1,30*1,2c*2,2*1,3o*8,66*1,3o*a,g*1,67*1,g*1,p*3,r*1,p*3,k*1,p*2,r*1,p*1,68*1,p*1,u*1,p*5,e*1,p*7,t*1,g*1,r*1,n*1,w*1,69*1,q*1,p*1,o*1,p*2,l*1,p*4,o*1,p*1,g*1,p*3,15*1,p*3,t*1,p*1,g*1,p*3,x*1,p*2,15*1,6a*1,k*1,p*2,m*1,p*1,6b*1,15*1,x*1,p*1,l*1,d*1,p*1,r*1,p*6,v*1,f*1,p*2,l*1,p*5,l*1,n*1,v*1,p*1,14*1,18*1,k*1,q*1,p*2,i*1,14*1,d*1,p*1,15*1,p*1,d*1,p*2,13*1,p*5,d*1,o*1,k*1,p*2,15*1,p*1,6c*1,p*2,19*1,l*1,p*1,19*2,v*1,p*2,m*1,1p*y,4*1,6d*1,4*1,2*2,4*1,2*3,2n*1,4*4,2*2,4*1,6e*1,4*1,2*1,4*3,2*1,j*1,4*1,2*1,s*1,2*1,4*1,30*3,3e*1,30*3,4*1,1a*1,2*4,3q*1,2*2,6f*1,2*4,6g*1,6h*1,2u*2,2*1,2u*1,4*1,2*1,2u*3,2*3,2u*2,2i*1,2*1,4*1,6i*1,2i*1,2*2,2z*1,6j*1,30*8,6k*1,4*1,6l*1,4*2,2*4,6m*1,30*6,2*1,4*1,2*1,4*2,3r*c,1a*1,1g*1,4*1,1g*2,30*5,2*1,1a*1,2*1,30*2,4*1,30*2,2*1,6n*1,4*1,30*1,4*1,30*1,6o*1,30*1,40*i,1e*1,30*1,1a*1,4*1,2*1,30*1,6p*1,2*a,4*2,6q*1,2s*1,4*1,6r*1,6s*1,2*1,4*1,2*1,2n*1,2*1,4*1,2*1,4*4,2*4,4*1,2*2,2s*1,2*1,1b*1,h*q,2*1,4*2,2*1,3h*1,4*1,1g*1,2*4,2n*1,4*1,6t*1,2*1,47*6,6u*1,47*o,2*2,1a*1,2*1,4*1,2n*1,1a*1,4*2,2*1,1h*2,6v*1,1h*1,44*8,4*1,6w*1,6x*1,6y*1,6z*1,70*1,71*1,72*1,73*1,74*1,75*1,76*1,77*1,78*1,79*1,7a*1,7b*1,7c*1,7d*1,7e*1,7f*1,7g*1,7h*1,7i*1,7j*1,7k*1,7l*1,7m*1,7n*1,7o*1,7p*1,7q*1,7r*1,7s*1,7t*1,7u*1,7v*1,7w*1,7x*1,7y*1,7z*1,80*1,81*1,82*1,83*1,84*1,85*1,86*1,87*1,88*1,89*1,8a*1,8b*1,8c*1,8d*1,8e*1,8f*1,8g*1,8h*1,8i*1,8j*1,8k*1,8l*1,8m*1,8n*1,8o*1,8p*1,8q*1,8r*1,8s*1,8t*1,8u*1,8v*1,8w*1,8x*1,8y*1,8z*1,90*1,91*1,92*1,93*1,94*1,95*1,96*1,97*1,98*1,99*1,9a*1,9b*1,9c*1,9d*1,9e*1,9f*1,9g*1,9h*1,9i*1,9j*1,9k*1,9l*1,9m*1,9n*1,9o*1,9p*1,9q*1,9r*1,9s*1,9t*1,9u*1,9v*1,9w*1,9x*1,9y*1,9z*1,a0*1,a1*1,a2*1,a3*1,a4*1,a5*1,a6*1,a7*1,a8*1,a9*1,aa*1,ab*1,ac*1,ad*1,ae*1,af*1,ag*1,ah*1,ai*1,aj*1,ak*1,al*1,am*1,an*1,ao*1,ap*1,aq*1,ar*1,as*1,at*1,au*1,av*1,aw*1,ax*1,ay*1,az*1,b0*1,b1*1,b2*1,b3*1,b4*1,b5*1,b6*1,b7*1,b8*1,b9*1,ba*1,bb*1,bc*1,bd*1,be*1,bf*1,bg*1,bh*1,bi*1,bj*1,bk*1,bl*1,bm*1,bn*1,bo*1,bp*1,bq*1,br*1,bs*1,bt*1,bu*1,bv*1,bw*1,bx*1,by*1,bz*1,c0*1,c1*1,c2*1,2*1,4*4,2*2,4*2,2o*1,4*2,4a*5,2*1,30*3,4*1,2*1,4*1,2*1,c3*1,43*3,30*1,2w*1,4*1,30*1,2*1,1b*1,1g*1,c4*1,2*1,4*4,2f*1,30*1,2*2,2k*1,c5*1,4*1,2*1,c6*1,3j*1,c7*1,3j*2,c8*1,3j*1,c9*1,ca*1,47*1,2*1,cb*1,30*1,2*1,4*1,2*1,30*1,2*2,4*1,2*1,30*1,2*1,4*3,2*1,4*1,2*3,4*2,cc*1,cd*1,2*1,ce*1,2z*6,3x*1,cf*1,1h*1,4*1,2*2,4*1,cg*1,2*1,4*2,ch*1,a*d,2*3,ci*1,4*1,30*1,5*1,4*1,1d*2,30*1,47*1,1b*1,cj*1,1b*2,ck*1,4*1,cl*1,1g*1,4*1,30*2,1g*1,4*1,cm*1,4*1,1a*1,cn*1,4*2,30*1,co*1,4*1,cp*1,cq*1,4*1,30*1,1h*2,30*1,cr*1,30*1,cs*1,ct*1,cu*1,34*1,30*3,3c*1,cv*1,30*3,34*1,30*4,47*1,1h*2,30*1,1h*1,cw*1,cx*1,1h*1,30*1,34*1,30*2,1h*1,30*a,cy*1,30*1,3b*1,47*1,30*1,3c*1,cz*1,30*2,47*1,30*2,47*1,d0*1,30*3,47*1,d1*1,d2*1,30*1,38*1,47*1,d3*1,30*2,47*1,36*1,30*3,d4*1,30*1,1h*1,3c*1,2z*a,d5*1,9*1,d6*1,b*1,7*1,5*1,b*1,9*1,d7*1,d8*1,d9*1,da*1,8*1,db*1,4*4,30*1,dc*1,3f*1,1h*1,30*7,33*1,30*z,37*1,30*7,dd*1,de*1,48*w,4*3,df*1,4*4,dg*1,4*1,dh*1,4*n,c*k,4*1,di*1,dj*1,30*2,dk*1,dl*1,dm*1,dn*1,30*1,do*1,dp*1,dq*1,35*1,dr*1,ds*1,dt*1,du*1,5*1,dv*1,dw*1,dx*1,dy*1,30*1,dz*1,e0*1,e1*1,e2*1,e3*1,e4*1,e5*1,e6*1,e7*1,e8*1,e9*1,ea*1,eb*1,ec*1,ed*1,ee*1,ef*1,eg*1,eh*1,ei*1,ej*1,47*1","sep":"|"}]}]);
const COLONY = [
{"id":"n-4a396cdb","guard":[["not",["has","updated"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-a4ca67e0","guard":[["hasAny",["added","element","item number","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-65561fbc","guard":[["hasAny",["added","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]]],"mem":null},
{"id":"n-b9875891","guard":[["not",["has","updated"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]]],"mem":null},
{"id":"n-cd481523","guard":[["hasAny",["added","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]]],"mem":null},
{"id":"n-da077e17","guard":[["not",["has","updated"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]]],"mem":null},
{"id":"n-1cbeab20","guard":[["not",["has","updated"]]],"pyramid":["render.template",{"lit":["The name whose added is ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-826f0f41","guard":[["hasAny",["added","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The name whose added is ",{"slot":0}," is ",{"slot":1},"."]},["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-ffe62a2e","guard":[["has","added"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2016-11-27T23:01:46Z":"The name whose added is 2016-11-27T23:01:46Z is squareup.com.","name the name whose added is 2021-02-07T16:02:44Z":"The name whose added is 2021-02-07T16:02:44Z is apisetu.gov.in:acko.","2021-02-07T16:05:50Z is the added of which name":"The name whose added is 2021-02-07T16:05:50Z is apisetu.gov.in:csc.","which name has the added 2021-02-07T16:10:12Z":"The name whose added is 2021-02-07T16:10:12Z is apisetu.gov.in:hpayushboard.","which name has the added 2021-02-07T16:08:12Z":"The name whose added is 2021-02-07T16:08:12Z is apisetu.gov.in:edistrictup.","2016-03-09T05:58:34Z is the added of which name":"The name whose added is 2016-03-09T05:58:34Z is data2crm.com.","name the name whose added is 2021-02-07T16:17:21Z":"The name whose added is 2021-02-07T16:17:21Z is apisetu.gov.in:nitp.","2021-02-07T16:11:47Z is the added of which name":"The name whose added is 2021-02-07T16:11:47Z is apisetu.gov.in:insvalsura.","name the name whose added is 2021-02-07T16:20:30Z":"The name whose added is 2021-02-07T16:20:30Z is apisetu.gov.in:swavlambancard.","which name has the added 2021-02-10T08:22:45Z":"The name whose added is 2021-02-10T08:22:45Z is onsched.com:utility.","which name has the added 2021-02-07T16:08:33Z":"The name whose added is 2021-02-07T16:08:33Z is apisetu.gov.in:enibandhanjh.","name the name whose added is 2015-12-05T06:47:56Z":"The name whose added is 2015-12-05T06:47:56Z is healthcare.gov.","name the name whose added is 2021-07-12T14:46:56Z":"The name whose added is 2021-07-12T14:46:56Z is rapidapi.com:dynamicdocs.","which name has the added 2023-03-05T12:17:10Z":"The name whose added is 2023-03-05T12:17:10Z is amadeus.com:amadeus-flight-check-in-links.","2021-02-28T16:48:40Z is the added of which name":"The name whose added is 2021-02-28T16:48:40Z is botschaft.local.","which name has the added 2021-02-07T16:11:23Z":"The name whose added is 2021-02-07T16:11:23Z is apisetu.gov.in:icsi.","2021-07-09T14:14:34Z is the added of which name":"The name whose added is 2021-07-09T14:14:34Z is optimade.local.","which name has the added 2021-02-07T16:12:41Z":"The name whose added is 2021-02-07T16:12:41Z is apisetu.gov.in:keralapsc.","which name has the added 2021-02-07T16:12:29Z":"The name whose added is 2021-02-07T16:12:29Z is apisetu.gov.in:jnrmand.","name the name whose added is 2023-03-05T12:20:21Z":"The name whose added is 2023-03-05T12:20:21Z is amadeus.com:amadeus-hotel-search.","2021-06-30T09:25:42Z is the added of which name":"The name whose added is 2021-06-30T09:25:42Z is twilio.com:twilio_frontline_v1.","2019-05-02T09:25:45Z is the added of which name":"The name whose added is 2019-05-02T09:25:45Z is box.com.","2021-02-07T16:09:48Z is the added of which name":"The name whose added is 2021-02-07T16:09:48Z is apisetu.gov.in:goawrd.","2021-01-14T09:53:08Z is the added of which name":"The name whose added is 2021-01-14T09:53:08Z is shop-pro.jp.","name the name whose added is 2021-05-10T17:26:29Z":"The name whose added is 2021-05-10T17:26:29Z is uscann.net.","which name has the added 2020-12-14T10:54:51Z":"The name whose added is 2020-12-14T10:54:51Z is fungenerators.com:namegen.","which name has the added 2020-04-08T10:05:59Z":"The name whose added is 2020-04-08T10:05:59Z is prss.org.","which name has the added 2023-04-02T17:50:36Z":"The name whose added is 2023-04-02T17:50:36Z is wolframalpha.com.","name the name whose added is 2015-10-20T18:10:11Z":"The name whose added is 2015-10-20T18:10:11Z is motaword.com.","2020-07-13T13:26:44Z is the added of which name":"The name whose added is 2020-07-13T13:26:44Z is phantauth.net.","which name has the added 2015-06-30T20:09:46Z":"The name whose added is 2015-06-30T20:09:46Z is googleapis.com:classroom.","name the name whose added is 2021-02-18T18:44:25Z":"The name whose added is 2021-02-18T18:44:25Z is airbyte.local:config.","2017-11-26T18:10:14Z is the added of which name":"The name whose added is 2017-11-26T18:10:14Z is koomalooma.com.","name the name whose added is 2019-07-13T11:28:07Z":"The name whose added is 2019-07-13T11:28:07Z is ably.io:platform.","name the name whose added is 2019-01-03T07:01:34Z":"The name whose added is 2019-01-03T07:01:34Z is adobe.com:aem.","name the name whose added is 2019-02-26T10:54:43Z":"The name whose added is 2019-02-26T10:54:43Z is here.com:tracking.","name the name whose added is 2018-06-12T08:24:05Z":"The name whose added is 2018-06-12T08:24:05Z is fraudlabspro.com:fraud-detection.","name the name whose added is 2021-02-07T16:07:50Z":"The name whose added is 2021-02-07T16:07:50Z is apisetu.gov.in:edistrictodishasp.","name the name whose added is 2015-12-07T18:27:02Z":"The name whose added is 2015-12-07T18:27:02Z is twilio.com:api.","2015-11-26T00:19:00Z is the added of which name":"The name whose added is 2015-11-26T00:19:00Z is xkcd.com.","which name has the added 2017-11-25T11:22:43Z":"The name whose added is 2017-11-25T11:22:43Z is weatherbit.io.","name the name whose added is 2017-04-13T09:20:16Z":"The name whose added is 2017-04-13T09:20:16Z is neutrinoapi.net.","which name has the added 2020-03-23T13:56:51Z":"The name whose added is 2020-03-23T13:56:51Z is tradematic.com.","which name has the added 2018-04-24T08:00:10Z":"The name whose added is 2018-04-24T08:00:10Z is opendatanetwork.com.","2021-04-14T17:12:40Z is the added of which name":"The name whose added is 2021-04-14T17:12:40Z is abstractapi.com:geolocation.","which name has the added 2020-08-19T06:39:08Z":"The name whose added is 2020-08-19T06:39:08Z is hsbc.com:branches.","2023-04-05T10:29:36Z is the added of which name":"The name whose added is 2023-04-05T10:29:36Z is wellknown.ai.","name the name whose added is 2016-07-13T20:28:00Z":"The name whose added is 2016-07-13T20:28:00Z is europeana.eu.","2021-02-07T16:06:14Z is the added of which name":"The name whose added is 2021-02-07T16:06:14Z is apisetu.gov.in:dgft.","name the name whose added is 2021-02-07T16:23:40Z":"The name whose added is 2021-02-07T16:23:40Z is apisetu.gov.in:transportpy.","which name has the added 2023-04-18T16:23:01Z":"The name whose added is 2023-04-18T16:23:01Z is codat.io:bank-feeds.","name the name whose added is 2017-04-11T09:59:29Z":"The name whose added is 2017-04-11T09:59:29Z is gitlab.com.","name the name whose added is 2021-07-05T09:33:17Z":"The name whose added is 2021-07-05T09:33:17Z is influxdata.com.","name the name whose added is 2018-02-22T19:42:40Z":"The name whose added is 2018-02-22T19:42:40Z is spinitron.com.","2021-02-07T16:10:24Z is the added of which name":"The name whose added is 2021-02-07T16:10:24Z is apisetu.gov.in:hppanchayat.","name the name whose added is 2021-02-07T16:04:30Z":"The name whose added is 2021-02-07T16:04:30Z is apisetu.gov.in:bsehr.","name the name whose added is 2021-09-22T23:08:53Z":"The name whose added is 2021-09-22T23:08:53Z is googleapis.com:monitoring.","which name has the added 2018-03-10T17:10:05Z":"The name whose added is 2018-03-10T17:10:05Z is anchore.io.","name the name whose added is 2023-03-04T15:29:33Z":"The name whose added is 2023-03-04T15:29:33Z is alertersystem.com.","2017-02-01T13:18:29Z is the added of which name":"The name whose added is 2017-02-01T13:18:29Z is browshot.com.","which name has the added 2023-04-02T04:11:18Z":"The name whose added is 2023-04-02T04:11:18Z is pinecone.io.","2020-03-23T13:44:14Z is the added of which name":"The name whose added is 2020-03-23T13:44:14Z is logoraisr.com.","name the name whose added is 2021-02-07T16:06:32Z":"The name whose added is 2021-02-07T16:06:32Z is apisetu.gov.in:ditch.","which name has the added 2020-11-03T08:36:26Z":"The name whose added is 2020-11-03T08:36:26Z is medcorder.com.","which name has the added 2020-03-23T14:06:54Z":"The name whose added is 2020-03-23T14:06:54Z is exude-api.herokuapp.com.","name the name whose added is 2023-03-06T10:14:18Z":"The name whose added is 2023-03-06T10:14:18Z is docker.com:hub.","2020-07-29T11:09:31Z is the added of which name":"The name whose added is 2020-07-29T11:09:31Z is edrv.io.","which name has the added 2019-10-28T17:08:59Z":"The name whose added is 2019-10-28T17:08:59Z is d7networks.com.","name the name whose added is 2019-12-23T11:31:18Z":"The name whose added is 2019-12-23T11:31:18Z is fulfillment.com.","which name has the added 2018-11-15T08:29:42Z":"The name whose added is 2018-11-15T08:29:42Z is skynewz-api-fortnite.herokuapp.com.","2021-01-30T17:23:17Z is the added of which name":"The name whose added is 2021-01-30T17:23:17Z is randomlovecraft.com.","2021-06-14T12:51:23Z is the added of which name":"The name whose added is 2021-06-14T12:51:23Z is cdcgov.local:prime-data-hub.","2015-11-27T02:11:59Z is the added of which name":"The name whose added is 2015-11-27T02:11:59Z is bufferapp.com.","which name has the added 2023-04-02T17:29:03Z":"The name whose added is 2023-04-02T17:29:03Z is biztoc.com.","2023-03-04T15:30:32Z is the added of which name":"The name whose added is 2023-03-04T15:30:32Z is trakt.tv.","which name has the added 2016-04-06T00:54:25Z":"The name whose added is 2016-04-06T00:54:25Z is bigoven.com.","2018-05-31T06:28:58Z is the added of which name":"The name whose added is 2018-05-31T06:28:58Z is crossbrowsertesting.com.","which name has the added 2021-02-07T16:13:05Z":"The name whose added is 2021-02-07T16:13:05Z is apisetu.gov.in:kseebkr.","which name has the added 2021-02-07T16:02:50Z":"The name whose added is 2021-02-07T16:02:50Z is apisetu.gov.in:agtripura.","2020-08-24T08:22:47Z is the added of which name":"The name whose added is 2020-08-24T08:22:47Z is presalytics.io:converter.","which name has the added 2021-04-06T16:46:05Z":"The name whose added is 2021-04-06T16:46:05Z is va.gov:confirmation.","which name has the added 2017-11-26T17:48:04Z":"The name whose added is 2017-11-26T17:48:04Z is aviationdata.systems.","2018-03-02T12:25:21Z is the added of which name":"The name whose added is 2018-03-02T12:25:21Z is apache.org:qakka.","2021-04-16T15:56:45Z is the added of which name":"The name whose added is 2021-04-16T15:56:45Z is 1password.local:connect.","name the name whose added is 2021-02-07T16:03:08Z":"The name whose added is 2021-02-07T16:03:08Z is apisetu.gov.in:aiimspatna.","name the name whose added is 2021-07-27T13:41:55Z":"The name whose added is 2021-07-27T13:41:55Z is fire.com.","which name has the added 2017-04-18T11:07:00Z":"The name whose added is 2017-04-18T11:07:00Z is mozilla.com:kinto.","2017-11-26T10:49:07Z is the added of which name":"The name whose added is 2017-11-26T10:49:07Z is clever-cloud.com.","2020-04-27T10:15:12Z is the added of which name":"The name whose added is 2020-04-27T10:15:12Z is wheretocredit.com.","which name has the added 2021-01-13T11:07:08Z":"The name whose added is 2021-01-13T11:07:08Z is sakari.io.","name the name whose added is 2023-04-02T17:16:51Z":"The name whose added is 2023-04-02T17:16:51Z is klarna.com:openai.","2018-11-06T13:28:29Z is the added of which name":"The name whose added is 2018-11-06T13:28:29Z is text2data.org.","name the name whose added is 2023-03-17T23:09:37Z":"The name whose added is 2023-03-17T23:09:37Z is googleapis.com:notebooks.","name the name whose added is 2021-11-03T23:19:04Z":"The name whose added is 2021-11-03T23:19:04Z is apideck.com:connector.","name the name whose added is 2021-02-07T16:13:11Z":"The name whose added is 2021-02-07T16:13:11Z is apisetu.gov.in:ktech.","2017-11-25T12:50:21Z is the added of which name":"The name whose added is 2017-11-25T12:50:21Z is salesloft.com.","2023-03-25T18:07:14Z is the added of which name":"The name whose added is 2023-03-25T18:07:14Z is klarna.com:payments.","which name has the added 2023-03-04T15:31:09Z":"The name whose added is 2023-03-04T15:31:09Z is gerermesaffaires.com.","2021-02-07T16:16:52Z is the added of which name":"The name whose added is 2021-02-07T16:16:52Z is apisetu.gov.in:neilit.","which name has the added 2017-01-16T14:46:30Z":"The name whose added is 2017-01-16T14:46:30Z is appveyor.com."}}},
{"id":"n-77089a6e","guard":[["has","added"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"has the added 2016-11-27T23:01:46Z":"The name whose added is 2016-11-27T23:01:46Z is squareup.com.","the name whose added is 2021-02-07T16:02:44Z":"The name whose added is 2021-02-07T16:02:44Z is apisetu.gov.in:acko.","has the added 2021-02-07T16:10:12Z":"The name whose added is 2021-02-07T16:10:12Z is apisetu.gov.in:hpayushboard.","has the added 2021-02-07T16:08:12Z":"The name whose added is 2021-02-07T16:08:12Z is apisetu.gov.in:edistrictup.","the name whose added is 2021-02-07T16:17:21Z":"The name whose added is 2021-02-07T16:17:21Z is apisetu.gov.in:nitp.","the name whose added is 2021-02-07T16:20:30Z":"The name whose added is 2021-02-07T16:20:30Z is apisetu.gov.in:swavlambancard.","has the added 2021-02-10T08:22:45Z":"The name whose added is 2021-02-10T08:22:45Z is onsched.com:utility.","has the added 2021-02-07T16:08:33Z":"The name whose added is 2021-02-07T16:08:33Z is apisetu.gov.in:enibandhanjh.","the name whose added is 2015-12-05T06:47:56Z":"The name whose added is 2015-12-05T06:47:56Z is healthcare.gov.","the name whose added is 2021-07-12T14:46:56Z":"The name whose added is 2021-07-12T14:46:56Z is rapidapi.com:dynamicdocs.","has the added 2023-03-05T12:17:10Z":"The name whose added is 2023-03-05T12:17:10Z is amadeus.com:amadeus-flight-check-in-links.","has the added 2021-02-07T16:11:23Z":"The name whose added is 2021-02-07T16:11:23Z is apisetu.gov.in:icsi.","has the added 2021-02-07T16:12:41Z":"The name whose added is 2021-02-07T16:12:41Z is apisetu.gov.in:keralapsc.","has the added 2021-02-07T16:12:29Z":"The name whose added is 2021-02-07T16:12:29Z is apisetu.gov.in:jnrmand.","the name whose added is 2023-03-05T12:20:21Z":"The name whose added is 2023-03-05T12:20:21Z is amadeus.com:amadeus-hotel-search.","the name whose added is 2021-05-10T17:26:29Z":"The name whose added is 2021-05-10T17:26:29Z is uscann.net.","has the added 2020-12-14T10:54:51Z":"The name whose added is 2020-12-14T10:54:51Z is fungenerators.com:namegen.","has the added 2020-04-08T10:05:59Z":"The name whose added is 2020-04-08T10:05:59Z is prss.org.","has the added 2023-04-02T17:50:36Z":"The name whose added is 2023-04-02T17:50:36Z is wolframalpha.com.","the name whose added is 2015-10-20T18:10:11Z":"The name whose added is 2015-10-20T18:10:11Z is motaword.com.","has the added 2015-06-30T20:09:46Z":"The name whose added is 2015-06-30T20:09:46Z is googleapis.com:classroom.","the name whose added is 2021-02-18T18:44:25Z":"The name whose added is 2021-02-18T18:44:25Z is airbyte.local:config.","the name whose added is 2019-07-13T11:28:07Z":"The name whose added is 2019-07-13T11:28:07Z is ably.io:platform.","the name whose added is 2019-01-03T07:01:34Z":"The name whose added is 2019-01-03T07:01:34Z is adobe.com:aem.","the name whose added is 2019-02-26T10:54:43Z":"The name whose added is 2019-02-26T10:54:43Z is here.com:tracking.","the name whose added is 2018-06-12T08:24:05Z":"The name whose added is 2018-06-12T08:24:05Z is fraudlabspro.com:fraud-detection.","the name whose added is 2021-02-07T16:07:50Z":"The name whose added is 2021-02-07T16:07:50Z is apisetu.gov.in:edistrictodishasp.","the name whose added is 2015-12-07T18:27:02Z":"The name whose added is 2015-12-07T18:27:02Z is twilio.com:api.","has the added 2017-11-25T11:22:43Z":"The name whose added is 2017-11-25T11:22:43Z is weatherbit.io.","the name whose added is 2017-04-13T09:20:16Z":"The name whose added is 2017-04-13T09:20:16Z is neutrinoapi.net.","has the added 2020-03-23T13:56:51Z":"The name whose added is 2020-03-23T13:56:51Z is tradematic.com.","has the added 2018-04-24T08:00:10Z":"The name whose added is 2018-04-24T08:00:10Z is opendatanetwork.com.","has the added 2020-08-19T06:39:08Z":"The name whose added is 2020-08-19T06:39:08Z is hsbc.com:branches.","the name whose added is 2016-07-13T20:28:00Z":"The name whose added is 2016-07-13T20:28:00Z is europeana.eu.","the name whose added is 2021-02-07T16:23:40Z":"The name whose added is 2021-02-07T16:23:40Z is apisetu.gov.in:transportpy.","has the added 2023-04-18T16:23:01Z":"The name whose added is 2023-04-18T16:23:01Z is codat.io:bank-feeds.","the name whose added is 2017-04-11T09:59:29Z":"The name whose added is 2017-04-11T09:59:29Z is gitlab.com.","the name whose added is 2021-07-05T09:33:17Z":"The name whose added is 2021-07-05T09:33:17Z is influxdata.com.","the name whose added is 2018-02-22T19:42:40Z":"The name whose added is 2018-02-22T19:42:40Z is spinitron.com.","the name whose added is 2021-02-07T16:04:30Z":"The name whose added is 2021-02-07T16:04:30Z is apisetu.gov.in:bsehr.","the name whose added is 2021-09-22T23:08:53Z":"The name whose added is 2021-09-22T23:08:53Z is googleapis.com:monitoring.","has the added 2018-03-10T17:10:05Z":"The name whose added is 2018-03-10T17:10:05Z is anchore.io.","the name whose added is 2023-03-04T15:29:33Z":"The name whose added is 2023-03-04T15:29:33Z is alertersystem.com.","has the added 2023-04-02T04:11:18Z":"The name whose added is 2023-04-02T04:11:18Z is pinecone.io.","the name whose added is 2021-02-07T16:06:32Z":"The name whose added is 2021-02-07T16:06:32Z is apisetu.gov.in:ditch.","has the added 2020-11-03T08:36:26Z":"The name whose added is 2020-11-03T08:36:26Z is medcorder.com.","has the added 2020-03-23T14:06:54Z":"The name whose added is 2020-03-23T14:06:54Z is exude-api.herokuapp.com.","the name whose added is 2023-03-06T10:14:18Z":"The name whose added is 2023-03-06T10:14:18Z is docker.com:hub.","has the added 2019-10-28T17:08:59Z":"The name whose added is 2019-10-28T17:08:59Z is d7networks.com.","the name whose added is 2019-12-23T11:31:18Z":"The name whose added is 2019-12-23T11:31:18Z is fulfillment.com.","has the added 2018-11-15T08:29:42Z":"The name whose added is 2018-11-15T08:29:42Z is skynewz-api-fortnite.herokuapp.com.","has the added 2023-04-02T17:29:03Z":"The name whose added is 2023-04-02T17:29:03Z is biztoc.com.","has the added 2016-04-06T00:54:25Z":"The name whose added is 2016-04-06T00:54:25Z is bigoven.com.","has the added 2021-02-07T16:13:05Z":"The name whose added is 2021-02-07T16:13:05Z is apisetu.gov.in:kseebkr.","has the added 2021-02-07T16:02:50Z":"The name whose added is 2021-02-07T16:02:50Z is apisetu.gov.in:agtripura.","has the added 2021-04-06T16:46:05Z":"The name whose added is 2021-04-06T16:46:05Z is va.gov:confirmation.","has the added 2017-11-26T17:48:04Z":"The name whose added is 2017-11-26T17:48:04Z is aviationdata.systems.","the name whose added is 2021-02-07T16:03:08Z":"The name whose added is 2021-02-07T16:03:08Z is apisetu.gov.in:aiimspatna.","the name whose added is 2021-07-27T13:41:55Z":"The name whose added is 2021-07-27T13:41:55Z is fire.com.","has the added 2017-04-18T11:07:00Z":"The name whose added is 2017-04-18T11:07:00Z is mozilla.com:kinto.","has the added 2021-01-13T11:07:08Z":"The name whose added is 2021-01-13T11:07:08Z is sakari.io.","the name whose added is 2023-04-02T17:16:51Z":"The name whose added is 2023-04-02T17:16:51Z is klarna.com:openai.","the name whose added is 2023-03-17T23:09:37Z":"The name whose added is 2023-03-17T23:09:37Z is googleapis.com:notebooks.","the name whose added is 2021-11-03T23:19:04Z":"The name whose added is 2021-11-03T23:19:04Z is apideck.com:connector.","the name whose added is 2021-02-07T16:13:11Z":"The name whose added is 2021-02-07T16:13:11Z is apisetu.gov.in:ktech.","has the added 2023-03-04T15:31:09Z":"The name whose added is 2023-03-04T15:31:09Z is gerermesaffaires.com.","has the added 2017-01-16T14:46:30Z":"The name whose added is 2017-01-16T14:46:30Z is appveyor.com."}}},
{"id":"n-96487c5e","guard":[["hasAny",["20151020t181011z","20151126t001900z","20151127t021159z","20151205t064756z","20151207t182702z","20160309t055834z","20160713t202800z","20170201t131829z","20170411t095929z","20170413t092016z","20171125t125021z","20171126t104907z","20171126t181014z","20180222t194240z","20180302t122521z","20180531t062858z","20180612t082405z","20181106t132829z","20190103t070134z","20190226t105443z","20190502t092545z","20190713t112807z","20191223t113118z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160550z","20210207t160614z","20210207t160632z","20210207t160750z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161311z","20210207t161652z","20210207t161721z","20210207t162030z","20210207t162340z","20210218t184425z","20210228t164840z","20210414t171240z","20210416t155645z","20210510t172629z","20210614t125123z","20210630t092542z","20210705t093317z","20210709t141434z","20210712t144656z","20210727t134155z","20210922t230853z","20211103t231904z","20230304t152933z","20230304t153032z","20230305t122021z","20230306t101418z","20230317t230937z","20230325t180714z","20230402t171651z","20230405t102936z","element","item number","nth","position","shortest","shortest one","shortest word"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-335618a1","guard":[["not",["has","updated"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}]]],"mem":null},
{"id":"n-3b0c08fc","guard":[["hasAny",["added","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}]]],"mem":null},
{"id":"n-3e131d3e","guard":[["hasAny",["added","element","item number","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}]],"mem":null},
{"id":"n-eb7c8a7c","guard":[["not",["has","updated"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}]],"mem":null},
{"id":"n-0935be85","guard":[["hasAny",["added","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}]]],"mem":null},
{"id":"n-a60f60d2","guard":[["not",["has","updated"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}]]],"mem":null},
{"id":"n-d0374068","guard":[["hasAny",["added","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}]]],"mem":null},
{"id":"n-e0ef2f6c","guard":[["not",["has","updated"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}]]],"mem":null},
{"id":"n-42f45f4b","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["sense.after",{"lit":"added"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-288c10da","guard":[["hasAny",["element","has","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["transform.lower",["sense.after",{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-0e947cab","guard":[["hasAny",["element","has","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-f4528a20","guard":[["hasAny",["element","has","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["render.and",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-3b44aa2e","guard":[["hasAny",["element","has","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-00ebf07b","guard":[["hasAny",["element","has","item number","lower case","lowercase","nth","position","small letters"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-46602483","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["sense.before",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-90d4e74d","guard":[["hasAny",["20151020t181011z","20151205t064756z","20151207t182702z","20160713t202800z","20170411t095929z","20170413t092016z","20180222t194240z","20180612t082405z","20190103t070134z","20190226t105443z","20190713t112807z","20191223t113118z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20210218t184425z","20210510t172629z","20210705t093317z","20210712t144656z","20210727t134155z","20210922t230853z","20211103t231904z","20230304t152933z","20230305t122021z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["sense.after",{"lit":"is"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-2cc7dba3","guard":[["hasAny",["20151020t181011z","20151205t064756z","20151207t182702z","20160713t202800z","20170411t095929z","20170413t092016z","20180222t194240z","20180612t082405z","20190103t070134z","20190226t105443z","20190713t112807z","20191223t113118z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20210218t184425z","20210510t172629z","20210705t093317z","20210712t144656z","20210727t134155z","20210922t230853z","20211103t231904z","20230304t152933z","20230305t122021z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","lower case","lowercase","nth","position","small letters"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.lower",["sense.after",{"lit":"is"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-ce5f977f","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.and",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-f53c0f2b","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-01c2c428","guard":[["hasAny",["20151020t181011z","20151205t064756z","20151207t182702z","20160713t202800z","20170411t095929z","20170413t092016z","20180222t194240z","20180612t082405z","20190103t070134z","20190226t105443z","20190713t112807z","20191223t113118z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20210218t184425z","20210510t172629z","20210705t093317z","20210712t144656z","20210727t134155z","20210922t230853z","20211103t231904z","20230304t152933z","20230305t122021z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-029845f7","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","all caps","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["transform.upper",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-249ca676","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-3dee52ad","guard":[["hasAny",["20151020t181011z","20151205t064756z","20151207t182702z","20160713t202800z","20170411t095929z","20170413t092016z","20180222t194240z","20180612t082405z","20190103t070134z","20190226t105443z","20190713t112807z","20191223t113118z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20210218t184425z","20210510t172629z","20210705t093317z","20210712t144656z","20210727t134155z","20210922t230853z","20211103t231904z","20230304t152933z","20230305t122021z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-4d037557","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","lower case","lowercase","nth","position","small letters"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["transform.lower",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-5f22c2ac","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","class name","element","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["transform.pascal",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-94fe1865","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["transform.title",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-9a8f670c","guard":[["hasAny",["20151020t181011z","20151205t064756z","20151207t182702z","20160713t202800z","20170411t095929z","20170413t092016z","20180222t194240z","20180612t082405z","20190103t070134z","20190226t105443z","20190713t112807z","20191223t113118z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20210218t184425z","20210510t172629z","20210705t093317z","20210712t144656z","20210727t134155z","20210922t230853z","20211103t231904z","20230304t152933z","20230305t122021z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["render.and",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-c20c4e1b","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","element","invert case","item number","nth","position","swap case","toggle case"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["transform.swapCase",["sense.lastWord"]],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-1209c89b","guard":[["hasAny",["20151020t181011z","20151205t064756z","20151207t182702z","20160713t202800z","20170411t095929z","20170413t092016z","20180222t194240z","20180612t082405z","20190103t070134z","20190226t105443z","20190713t112807z","20191223t113118z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20210218t184425z","20210510t172629z","20210705t093317z","20210712t144656z","20210727t134155z","20210922t230853z","20211103t231904z","20230304t152933z","20230305t122021z","20230306t101418z","20230317t230937z","20230402t171651z","dashes","element","hyphens","item number","kebab case","kebabcase","nth","position","slug"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["transform.kebab",["sense.wordAt",{"lit":3}]],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-7e193a60","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","each word","element","item number","nth","position","split into words","words"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-8b7fdfe7","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","lower case","lowercase","nth","position","small letters"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-b4c3d696","guard":[["hasAny",["20151020t181011z","20151205t064756z","20151207t182702z","20160713t202800z","20170411t095929z","20170413t092016z","20180222t194240z","20180612t082405z","20190103t070134z","20190226t105443z","20190713t112807z","20191223t113118z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20210218t184425z","20210510t172629z","20210705t093317z","20210712t144656z","20210727t134155z","20210922t230853z","20211103t231904z","20230304t152933z","20230305t122021z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-fbfa2b6d","guard":[["hasAny",["20151126t001900z","20151127t021159z","20160309t055834z","20170201t131829z","20171125t125021z","20171126t104907z","20171126t181014z","20180302t122521z","20180531t062858z","20181106t132829z","20190502t092545z","20200323t134414z","20200427t101512z","20200713t132644z","20200729t110931z","20200824t082247z","20210114t095308z","20210130t172317z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20210414t171240z","20210416t155645z","20210614t125123z","20210630t092542z","20210709t141434z","20230304t153032z","20230325t180714z","20230405t102936z","each word","element","item number","nth","position","split into words","words"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-e999b863","guard":[["hasAny",["20151020t181011z","20151205t064756z","20151207t182702z","20160713t202800z","20170411t095929z","20170413t092016z","20180222t194240z","20180612t082405z","20190103t070134z","20190226t105443z","20190713t112807z","20191223t113118z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20210218t184425z","20210510t172629z","20210705t093317z","20210712t144656z","20210727t134155z","20210922t230853z","20211103t231904z","20230304t152933z","20230305t122021z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","lower case","lowercase","nth","position","small letters"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-405d34ec","guard":[["has","added"]],"pyramid":["render.str",["memory.lookup",["sense.before",{"lit":"of"}]]],"mem":{"table":{"2021-02-07T16:05:50Z is the added":"The name whose added is 2021-02-07T16:05:50Z is apisetu.gov.in:csc.","2016-03-09T05:58:34Z is the added":"The name whose added is 2016-03-09T05:58:34Z is data2crm.com.","2021-02-07T16:11:47Z is the added":"The name whose added is 2021-02-07T16:11:47Z is apisetu.gov.in:insvalsura.","2021-02-28T16:48:40Z is the added":"The name whose added is 2021-02-28T16:48:40Z is botschaft.local.","2021-07-09T14:14:34Z is the added":"The name whose added is 2021-07-09T14:14:34Z is optimade.local.","2021-06-30T09:25:42Z is the added":"The name whose added is 2021-06-30T09:25:42Z is twilio.com:twilio_frontline_v1.","2019-05-02T09:25:45Z is the added":"The name whose added is 2019-05-02T09:25:45Z is box.com.","2021-02-07T16:09:48Z is the added":"The name whose added is 2021-02-07T16:09:48Z is apisetu.gov.in:goawrd.","2021-01-14T09:53:08Z is the added":"The name whose added is 2021-01-14T09:53:08Z is shop-pro.jp.","2020-07-13T13:26:44Z is the added":"The name whose added is 2020-07-13T13:26:44Z is phantauth.net.","2017-11-26T18:10:14Z is the added":"The name whose added is 2017-11-26T18:10:14Z is koomalooma.com.","2015-11-26T00:19:00Z is the added":"The name whose added is 2015-11-26T00:19:00Z is xkcd.com.","2021-04-14T17:12:40Z is the added":"The name whose added is 2021-04-14T17:12:40Z is abstractapi.com:geolocation.","2023-04-05T10:29:36Z is the added":"The name whose added is 2023-04-05T10:29:36Z is wellknown.ai.","2021-02-07T16:06:14Z is the added":"The name whose added is 2021-02-07T16:06:14Z is apisetu.gov.in:dgft.","2021-02-07T16:10:24Z is the added":"The name whose added is 2021-02-07T16:10:24Z is apisetu.gov.in:hppanchayat.","2017-02-01T13:18:29Z is the added":"The name whose added is 2017-02-01T13:18:29Z is browshot.com.","2020-03-23T13:44:14Z is the added":"The name whose added is 2020-03-23T13:44:14Z is logoraisr.com.","2020-07-29T11:09:31Z is the added":"The name whose added is 2020-07-29T11:09:31Z is edrv.io.","2021-01-30T17:23:17Z is the added":"The name whose added is 2021-01-30T17:23:17Z is randomlovecraft.com.","2021-06-14T12:51:23Z is the added":"The name whose added is 2021-06-14T12:51:23Z is cdcgov.local:prime-data-hub.","2015-11-27T02:11:59Z is the added":"The name whose added is 2015-11-27T02:11:59Z is bufferapp.com.","2023-03-04T15:30:32Z is the added":"The name whose added is 2023-03-04T15:30:32Z is trakt.tv.","2018-05-31T06:28:58Z is the added":"The name whose added is 2018-05-31T06:28:58Z is crossbrowsertesting.com.","2020-08-24T08:22:47Z is the added":"The name whose added is 2020-08-24T08:22:47Z is presalytics.io:converter.","2018-03-02T12:25:21Z is the added":"The name whose added is 2018-03-02T12:25:21Z is apache.org:qakka.","2021-04-16T15:56:45Z is the added":"The name whose added is 2021-04-16T15:56:45Z is 1password.local:connect.","2017-11-26T10:49:07Z is the added":"The name whose added is 2017-11-26T10:49:07Z is clever-cloud.com.","2020-04-27T10:15:12Z is the added":"The name whose added is 2020-04-27T10:15:12Z is wheretocredit.com.","2018-11-06T13:28:29Z is the added":"The name whose added is 2018-11-06T13:28:29Z is text2data.org.","2017-11-25T12:50:21Z is the added":"The name whose added is 2017-11-25T12:50:21Z is salesloft.com.","2023-03-25T18:07:14Z is the added":"The name whose added is 2023-03-25T18:07:14Z is klarna.com:payments.","2021-02-07T16:16:52Z is the added":"The name whose added is 2021-02-07T16:16:52Z is apisetu.gov.in:neilit."}}},
{"id":"n-1ecb6f36","guard":[["hasAny",["20150630t200946z","20151126t001900z","20151127t021159z","20160406t005425z","20160713t202800z","20161127t230146z","20170116t144630z","20171126t104907z","20171126t181014z","20180302t122521z","20180310t171005z","20190103t070134z","20190502t092545z","20200323t134414z","20200323t140654z","20200408t100559z","20200729t110931z","20200819t063908z","20201103t083626z","20210113t110708z","20210114t095308z","20210712t144656z","20210727t134155z","20230304t153109z","20230306t101418z","20230402t041118z","20230402t171651z","20230402t175036z","20230405t102936z","delete","element","item number","nth","position","remove","strip out","without"]],["has","added"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-534f117c","guard":[["hasAny",["20150630t200946z","20151126t001900z","20151127t021159z","20160406t005425z","20160713t202800z","20161127t230146z","20170116t144630z","20171126t104907z","20171126t181014z","20180302t122521z","20180310t171005z","20190103t070134z","20190502t092545z","20200323t134414z","20200323t140654z","20200408t100559z","20200729t110931z","20200819t063908z","20201103t083626z","20210113t110708z","20210114t095308z","20210712t144656z","20210727t134155z","20230304t153109z","20230306t101418z","20230402t041118z","20230402t171651z","20230402t175036z","20230405t102936z","element","item number","nth","position","separate by","split","split by"]],["has","added"]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-8a10e22a","guard":[["hasAny",["20150630t200946z","20151126t001900z","20151127t021159z","20160406t005425z","20160713t202800z","20161127t230146z","20170116t144630z","20171126t104907z","20171126t181014z","20180302t122521z","20180310t171005z","20190103t070134z","20190502t092545z","20200323t134414z","20200323t140654z","20200408t100559z","20200729t110931z","20200819t063908z","20201103t083626z","20210113t110708z","20210114t095308z","20210712t144656z","20210727t134155z","20230304t153109z","20230306t101418z","20230402t041118z","20230402t171651z","20230402t175036z","20230405t102936z","element","item number","nth","position","separate by","split","split by"]],["has","added"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-cd6f3be8","guard":[["hasAny",["20150630t200946z","20151126t001900z","20151127t021159z","20160406t005425z","20160713t202800z","20161127t230146z","20170116t144630z","20171126t104907z","20171126t181014z","20180302t122521z","20180310t171005z","20190103t070134z","20190502t092545z","20200323t134414z","20200323t140654z","20200408t100559z","20200729t110931z","20200819t063908z","20201103t083626z","20210113t110708z","20210114t095308z","20210712t144656z","20210727t134155z","20230304t153109z","20230306t101418z","20230402t041118z","20230402t171651z","20230402t175036z","20230405t102936z","element","item number","nth","position","separate by","split","split by"]],["has","added"]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-205b1c0c","guard":[["hasAny",["20190103t070134z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20230304t152933z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-ee72004f","guard":[["hasAny",["20190103t070134z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20230304t152933z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["render.and",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-925c6d76","guard":[["hasAny",["20190103t070134z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20230304t152933z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-8a5f9be4","guard":[["hasAny",["20190103t070134z","20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20230304t152933z","20230306t101418z","20230317t230937z","20230402t171651z","element","item number","lower case","lowercase","nth","position","small letters"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-4d8082f6","guard":[["hasAny",["20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20230304t152933z","20230306t101418z","20230402t171651z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}]],"mem":null},
{"id":"n-001552a5","guard":[["hasAny",["20210207t160244z","20210207t160308z","20210207t160430z","20210207t160632z","20210207t160750z","20210207t161311z","20210207t161721z","20210207t162030z","20210207t162340z","20230304t152933z","20230306t101418z","20230402t171651z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"updated"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-5fcf78a6","guard":[["hasAny",["20200824t082247z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}]],"mem":null},
{"id":"n-7320ab3a","guard":[["hasAny",["20200824t082247z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-f4fbde09","guard":[["hasAny",["20200824t082247z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.and",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-3e4e2618","guard":[["hasAny",["element","has","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-93c04990","guard":[["hasAny",["element","has","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["render.and",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-a6105ae6","guard":[["hasAny",["element","has","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}]],"mem":null},
{"id":"n-f7518da2","guard":[["hasAny",["20200824t082247z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-18e80d84","guard":[["hasAny",["20200824t082247z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","lower case","lowercase","nth","position","small letters"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-a4151f53","guard":[["hasAny",["element","has","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-3105f51e","guard":[["hasAny",["20200824t082247z","20210207t160550z","20210207t160614z","20210207t160948z","20210207t161024z","20210207t161147z","20210207t161652z","20210228t164840z","20230304t153032z","20230325t180714z","20230405t102936z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"updated"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-37accc14","guard":[["hasAny",["added","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"version"}],{"lit":1}]]],"mem":null},
{"id":"n-92c3c72d","guard":[["not",["has","updated"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"version"}],{"lit":1}]]],"mem":null},
{"id":"n-0e8eadaf","guard":[["hasAny",["20170116t144630z","20190103t070134z","20210113t110708z","20210114t095308z","20210130t172317z","element","item number","nth","position"]]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.second"]]],"mem":null},
{"id":"n-26272be0","guard":[["hasAny",["20151126t001900z","20160713t202800z","20170418t110700z","20201103t083626z","20210207t161652z","caesar cipher","element","item number","nth","position","rotate the letters","shift by","shift each letter"]]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-65475f8c","guard":[["hasAny",["20170116t144630z","20190103t070134z","20210113t110708z","20210114t095308z","20210130t172317z","element","item number","nth","position"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.second"]]],"mem":null},
{"id":"n-93177436","guard":[["hasAny",["20170116t144630z","20190103t070134z","20210113t110708z","20210114t095308z","20210130t172317z","copies","element","item number","nth","position","repeat","say it times"]]],"pyramid":["render.str",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.second"]]],"mem":null},
{"id":"n-b3ea08ea","guard":[["hasAny",["20170116t144630z","20190103t070134z","20210113t110708z","20210114t095308z","20210130t172317z","element","item number","nth","position"]]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.second"]]],"mem":null},
{"id":"n-32c10d1e","guard":[["hasAny",["20230306t101418z","20230402t171651z","20230402t175036z","20230405t102936z","element","item number","nth","position","separate by","split","split by"]],["has","added"]],"pyramid":["render.and",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-6d01c871","guard":[["hasAny",["20230306t101418z","20230402t171651z","20230402t175036z","20230405t102936z","delete","element","item number","nth","position","remove","strip out","without"]],["has","added"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-7cc790c6","guard":[["hasAny",["20230306t101418z","20230402t171651z","20230402t175036z","20230405t102936z","element","item number","nth","position","separate by","split","split by"]],["has","added"]],"pyramid":["render.lines",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-abbd8f48","guard":[["hasAny",["20230306t101418z","20230402t171651z","20230402t175036z","20230405t102936z","element","item number","nth","position","separate by","split","split by"]],["has","added"]],"pyramid":["render.list",["transform.split",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-07e47756","guard":[["hasAny",["element","has","item number","join","joined with","nth","position","separated by"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["transform.join",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"version"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-bcf9c356","guard":[["hasAny",["20151126t001900z","20160713t202800z","20170418t110700z","element","item number","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-b6e46162","guard":[["hasAny",["20190226t105443z","20210712t144656z","20230402t171651z","element","item number","join","joined with","nth","position","separated by"]],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.join",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"version"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-a06cf8cb","guard":[["hasAny",["added","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"version"}],{"lit":1}]]],"mem":null},
{"id":"n-b83e0420","guard":[["not",["has","updated"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"version"}],{"lit":1}]]],"mem":null},
{"id":"n-750e4235","guard":[["hasAny",["20151126t001900z","20210207t161652z","caesar cipher","element","item number","nth","position","rotate the letters","shift by","shift each letter"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],["sense.last"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-27be8dfd","guard":[["hasAny",["20170418t110700z","20201103t083626z","caesar cipher","element","item number","nth","position","rotate the letters","shift by","shift each letter"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],["sense.last"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-3da57572","guard":[["hasAny",["20210114t095308z","20210130t172317z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],["sense.second"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-a62590df","guard":[["hasAny",["20210114t095308z","20210130t172317z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],["sense.second"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-0a77818f","guard":[["hasAny",["20170116t144630z","20210113t110708z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["render.and",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],["sense.second"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-4c00aa7d","guard":[["hasAny",["20170116t144630z","20210113t110708z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":2}],["render.list",["iterate.repeat",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],["sense.second"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-02c739bc","guard":[["has","20151127t021159z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is bufferapp.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-0ad83736","guard":[["has","20170201t131829z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is browshot.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-16ccd331","guard":[["has","20171126t104907z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is clever-cloud.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-20e06519","guard":[["has","20210207t160948z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:goawrd."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-282abfd3","guard":[["has","20200427t101512z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is wheretocredit.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-3c6e4558","guard":[["has","20171125t125021z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is salesloft.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-40d3aec6","guard":[["has","20181106t132829z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is text2data.org."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-46cf8627","guard":[["has","20210709t141434z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is optimade.local."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-4f815add","guard":[["has","20210207t161652z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:neilit."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-51b1b65b","guard":[["has","20230325t180714z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is klarna.com:payments."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-5cbd0742","guard":[["has","20210414t171240z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is abstractapi.com:geolocation."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-6065cbd5","guard":[["has","20210630t092542z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is twilio.com:twilio_frontline_v1."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-69ce9a92","guard":[["has","20210207t160550z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:csc."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-77732c64","guard":[["has","20210207t161024z"],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:hppanchayat."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-778c14e9","guard":[["has","20210130t172317z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is randomlovecraft.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-8260f6f4","guard":[["has","20180302t122521z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apache.org:qakka."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-8ac017d2","guard":[["has","20210416t155645z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is 1password.local:connect."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-8b7ee3d0","guard":[["has","20171126t181014z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is koomalooma.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-8e2d1c2f","guard":[["has","20230405t102936z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is wellknown.ai."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-a5d391c3","guard":[["has","20200323t134414z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is logoraisr.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-bb29cf97","guard":[["has","20200729t110931z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is edrv.io."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-c81f6eb1","guard":[["has","20210207t161147z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:insvalsura."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-cb74a542","guard":[["has","20230304t153032z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is trakt.tv."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-cde432d1","guard":[["has","20210228t164840z"],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is botschaft.local."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-cff8c7e6","guard":[["has","20210114t095308z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is shop-pro.jp."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-d12435d3","guard":[["has","20200824t082247z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is presalytics.io:converter."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-de18523d","guard":[["has","20210207t160614z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:dgft."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-e322cf58","guard":[["has","20200713t132644z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is phantauth.net."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-e77f7880","guard":[["has","20190502t092545z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is box.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-e83da9cf","guard":[["has","20210614t125123z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is cdcgov.local:prime-data-hub."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-f3dbef34","guard":[["has","20160309t055834z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is data2crm.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-f8459029","guard":[["has","20180531t062858z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is crossbrowsertesting.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-fd2ab1bf","guard":[["has","20151126t001900z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is xkcd.com."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-06f652ec","guard":[["has","20170411t095929z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is gitlab.com."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-0a8f2124","guard":[["has","20180424t080010z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is opendatanetwork.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-1473a5e5","guard":[["has","20160406t005425z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is bigoven.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-17ae0ac8","guard":[["has","20210207t160430z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:bsehr."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-1b2ad45c","guard":[["has","20200323t140654z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is exude-api.herokuapp.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-1fe55632","guard":[["has","20210207t161012z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:hpayushboard."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-20acd4c6","guard":[["has","20210207t160250z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:agtripura."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-28c1fec5","guard":[["has","20210510t172629z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is uscann.net."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-2e3163d5","guard":[["has","20230304t152933z"],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is alertersystem.com."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-2fea4268","guard":[["has","20210727t134155z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is fire.com."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-308b6266","guard":[["has","20210207t161241z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:keralapsc."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-315d4cdc","guard":[["has","20210218t184425z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is airbyte.local:config."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-33890f37","guard":[["has","20210210t082245z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is onsched.com:utility."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-3989027d","guard":[["has","20160713t202800z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is europeana.eu."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-3c66a6e8","guard":[["has","20230304t153109z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is gerermesaffaires.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-3d27f7ce","guard":[["has","20170413t092016z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is neutrinoapi.net."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-3fdf91d5","guard":[["has","20191028t170859z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is d7networks.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-4293d29f","guard":[["has","20180222t194240z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is spinitron.com."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-4737822d","guard":[["has","20181115t082942z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is skynewz-api-fortnite.herokuapp.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-47583ce2","guard":[["has","20151207t182702z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is twilio.com:api."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-4a7760c3","guard":[["has","20200323t135651z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is tradematic.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-4d7b2f3f","guard":[["has","20230305t122021z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is amadeus.com:amadeus-hotel-search."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-500061e6","guard":[["has","20230402t172903z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is biztoc.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-522b7258","guard":[["has","20201214t105451z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is fungenerators.com:namegen."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-53d45293","guard":[["has","20210207t161721z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:nitp."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-5aa5fee6","guard":[["has","20210207t161123z"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:icsi."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-5c48ca8b","guard":[["has","20180612t082405z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is fraudlabspro.com:fraud-detection."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-5e4a4e67","guard":[["has","20150630t200946z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is googleapis.com:classroom."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-6a9b3413","guard":[["has","20211103t231904z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apideck.com:connector."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-7be14dbd","guard":[["has","20180310t171005z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is anchore.io."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-7e540e9e","guard":[["has","20210113t110708z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is sakari.io."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-7f742806","guard":[["has","20171126t174804z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is aviationdata.systems."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-8195338d","guard":[["has","20190226t105443z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is here.com:tracking."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-82752a3b","guard":[["has","20151205t064756z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is healthcare.gov."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-8903e424","guard":[["has","20230402t171651z"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is klarna.com:openai."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-938bce00","guard":[["has","20210207t161305z"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:kseebkr."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-94dcf576","guard":[["has","20210207t162030z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:swavlambancard."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-96f77ea7","guard":[["has","20210207t160632z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:ditch."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-98dc0a30","guard":[["has","20190713t112807z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ably.io:platform."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-992cd1f5","guard":[["has","20210207t161311z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:ktech."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-9be157b5","guard":[["has","20210207t161229z"],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:jnrmand."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-a0030170","guard":[["has","20230418t162301z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is codat.io:bank-feeds."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-b2d87258","guard":[["has","20161127t230146z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is squareup.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-b38333dc","guard":[["has","20230306t101418z"],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is docker.com:hub."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-ba01b91f","guard":[["has","20210207t160308z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:aiimspatna."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-c0372df3","guard":[["has","20210705t093317z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is influxdata.com."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-c3f60151","guard":[["has","20151020t181011z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is motaword.com."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-c5239f70","guard":[["has","20190103t070134z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is adobe.com:aem."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-c9880c59","guard":[["has","20230402t041118z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is pinecone.io."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-ca873b44","guard":[["has","20210922t230853z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is googleapis.com:monitoring."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-d045ea5e","guard":[["has","20210207t160750z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:edistrictodishasp."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-d1554862","guard":[["has","20200819t063908z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is hsbc.com:branches."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-d19237c5","guard":[["has","20170116t144630z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is appveyor.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-d1f45a3e","guard":[["has","20230305t121710z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is amadeus.com:amadeus-flight-check-in-links."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-da32e9a5","guard":[["has","20201103t083626z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is medcorder.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-e38202ec","guard":[["has","20191223t113118z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is fulfillment.com."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-e686119e","guard":[["has","20200408t100559z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is prss.org."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-e8b6f851","guard":[["has","20210406t164605z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is va.gov:confirmation."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-ef4ed280","guard":[["has","20210207t160833z"],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:enibandhanjh."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-f17be1b6","guard":[["has","20210207t160244z"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:acko."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-f53a4ae1","guard":[["has","20230317t230937z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is googleapis.com:notebooks."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-f633adda","guard":[["has","20170418t110700z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is mozilla.com:kinto."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-fa22d873","guard":[["has","20210207t162340z"],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:transportpy."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-fa475336","guard":[["has","20230402t175036z"],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is wolframalpha.com."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-fae66c7e","guard":[["has","20171125t112243z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is weatherbit.io."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-fb3c5d11","guard":[["has","20210207t160812z"],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is apisetu.gov.in:edistrictup."]},["sense.wordAt",{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-ff567280","guard":[["has","20210712t144656z"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is rapidapi.com:dynamicdocs."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}]]],"mem":null},
{"id":"n-0406b777","guard":[["hasAny",["20210207t161652z","caesar cipher","element","item number","nth","position","rotate the letters","shift by","shift each letter"]]],"pyramid":["render.str",["transform.caesar",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-0c014bb1","guard":[["hasAny",["20160309t055834z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2016-03-09T05:58:34Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-0f71eb27","guard":[["hasAny",["20180531t062858z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2018-05-31T06:28:58Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-1a8437ff","guard":[["hasAny",["20210207t160948z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:09:48Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-25f49301","guard":[["hasAny",["20171126t104907z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2017-11-26T10:49:07Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-2afea22a","guard":[["hasAny",["20230418t162301z","element","item number","nth","position"]]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-31f7012d","guard":[["hasAny",["20200729t110931z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-07-29T11:09:31Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-3edd65f8","guard":[["hasAny",["20210709t141434z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-07-09T14:14:34Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-44edc4d3","guard":[["hasAny",["20171125t125021z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2017-11-25T12:50:21Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-45241af6","guard":[["hasAny",["20171126t181014z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2017-11-26T18:10:14Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-4687384d","guard":[["hasAny",["20230418t162301z","copies","element","item number","nth","position","repeat","say it times"]]],"pyramid":["render.str",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-4722af02","guard":[["hasAny",["20210114t095308z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-01-14T09:53:08Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-52124d37","guard":[["hasAny",["20210228t164840z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-28T16:48:40Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-69cc812c","guard":[["hasAny",["20230325t180714z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-03-25T18:07:14Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-713c6dfa","guard":[["hasAny",["20151126t001900z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2015-11-26T00:19:00Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-75436021","guard":[["hasAny",["20210207t160550z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:05:50Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-7878c633","guard":[["hasAny",["20210630t092542z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-06-30T09:25:42Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-7b22049f","guard":[["hasAny",["20230405t102936z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-04-05T10:29:36Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-899031e3","guard":[["hasAny",["20230418t162301z","element","item number","nth","position"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-8cd13e88","guard":[["hasAny",["20210614t125123z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-06-14T12:51:23Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-93e5b9ab","guard":[["hasAny",["20181106t132829z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2018-11-06T13:28:29Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-9a9f1ea2","guard":[["hasAny",["20170201t131829z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2017-02-01T13:18:29Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-aacd19cf","guard":[["hasAny",["20210414t171240z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-04-14T17:12:40Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-ac8c8630","guard":[["hasAny",["20200323t134414z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-03-23T13:44:14Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-afb86441","guard":[["hasAny",["20230418t162301z","element","item number","nth","position"]]],"pyramid":["render.list",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-afca2166","guard":[["hasAny",["20200713t132644z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-07-13T13:26:44Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-b43914c4","guard":[["hasAny",["20210207t161024z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:10:24Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-b8c0fdc4","guard":[["hasAny",["20210416t155645z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-04-16T15:56:45Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-c85e3948","guard":[["hasAny",["20200427t101512z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-04-27T10:15:12Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-cf847407","guard":[["hasAny",["20230418t162301z","element","item number","nth","position"]]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-d2d8b326","guard":[["hasAny",["20210207t161652z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:16:52Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-d8170c8f","guard":[["hasAny",["20230418t162301z","copies","element","item number","nth","position","repeat","say it times"]]],"pyramid":["render.str",["transform.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-dd264d6c","guard":[["hasAny",["20180302t122521z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2018-03-02T12:25:21Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-ded1d757","guard":[["hasAny",["20230418t162301z","element","item number","nth","position"]]],"pyramid":["render.lines",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-dfe69a9d","guard":[["hasAny",["20200824t082247z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-08-24T08:22:47Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-e03593b4","guard":[["hasAny",["20210207t161147z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:11:47Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-e6f2d462","guard":[["hasAny",["20230304t153032z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-03-04T15:30:32Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-f4e4ec6b","guard":[["hasAny",["20190502t092545z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2019-05-02T09:25:45Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-f5a71e0f","guard":[["hasAny",["20151127t021159z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2015-11-27T02:11:59Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-f8444ae1","guard":[["hasAny",["20210130t172317z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-01-30T17:23:17Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-f929cf6f","guard":[["hasAny",["20230418t162301z","element","item number","nth","position"]]],"pyramid":["render.and",["iterate.repeat",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"updated"},{"lit":"name"}],["sense.last"]]],"mem":null},
{"id":"n-fb014a8d","guard":[["hasAny",["20210207t160614z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:06:14Z is ",{"slot":1},"."]},["sense.lastWord"],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-00488ae7","guard":[["hasAny",["20210207t160308z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:03:08Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-02d3f9d0","guard":[["hasAny",["20210218t184425z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-18T18:44:25Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-058730d4","guard":[["hasAny",["20210207t161305z","element","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:13:05Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-06b80057","guard":[["hasAny",["20190226t105443z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2019-02-26T10:54:43Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-09f7f714","guard":[["hasAny",["20180424t080010z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2018-04-24T08:00:10Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-0aafb1bf","guard":[["hasAny",["20200323t135651z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-03-23T13:56:51Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-0d7891e3","guard":[["hasAny",["20210210t082245z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-10T08:22:45Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-128813b8","guard":[["hasAny",["20170418t110700z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2017-04-18T11:07:00Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-136b61ed","guard":[["hasAny",["20230402t171651z","element","item number","nth","position"]],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-04-02T17:16:51Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-17e26da6","guard":[["hasAny",["20180310t171005z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2018-03-10T17:10:05Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-191940c4","guard":[["hasAny",["20190103t070134z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2019-01-03T07:01:34Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-2218585a","guard":[["hasAny",["20230304t153109z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-03-04T15:31:09Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-28f899c8","guard":[["hasAny",["20210712t144656z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-07-12T14:46:56Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-2a14e138","guard":[["hasAny",["20210207t161721z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:17:21Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-2c1ac464","guard":[["hasAny",["20210207t161311z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:13:11Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-330aef89","guard":[["hasAny",["20170413t092016z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2017-04-13T09:20:16Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-3592da2c","guard":[["hasAny",["20210207t160812z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:08:12Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-3a30ac8d","guard":[["hasAny",["20230304t152933z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-03-04T15:29:33Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-41a8dc61","guard":[["hasAny",["20210207t161012z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:10:12Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-423bb983","guard":[["hasAny",["20210922t230853z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-09-22T23:08:53Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-4811ff4e","guard":[["hasAny",["20210207t161241z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:12:41Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-48724db6","guard":[["hasAny",["20190713t112807z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2019-07-13T11:28:07Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-573707d6","guard":[["hasAny",["20210207t161123z","element","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:11:23Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-6ae93b32","guard":[["hasAny",["20201214t105451z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-12-14T10:54:51Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-74eb82ae","guard":[["hasAny",["20200408t100559z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-04-08T10:05:59Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-7579d377","guard":[["hasAny",["20200819t063908z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-08-19T06:39:08Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-790b9412","guard":[["hasAny",["20191223t113118z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2019-12-23T11:31:18Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-8403937a","guard":[["hasAny",["20151020t181011z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2015-10-20T18:10:11Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-84128c22","guard":[["hasAny",["20210207t160750z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:07:50Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-8743adae","guard":[["hasAny",["20211103t231904z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-11-03T23:19:04Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-8965ffa3","guard":[["hasAny",["20210207t162340z","element","item number","nth","position"]],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:23:40Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-8d613450","guard":[["hasAny",["20210207t161229z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:12:29Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-942dc213","guard":[["hasAny",["20230305t122021z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-03-05T12:20:21Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-97cdc7c9","guard":[["hasAny",["20210727t134155z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-07-27T13:41:55Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-982ed996","guard":[["hasAny",["20230305t121710z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-03-05T12:17:10Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-9c991bb2","guard":[["hasAny",["20200323t140654z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-03-23T14:06:54Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-9ec4d263","guard":[["hasAny",["20160406t005425z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2016-04-06T00:54:25Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-9f01852f","guard":[["hasAny",["20151207t182702z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2015-12-07T18:27:02Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-9f7604b4","guard":[["hasAny",["20150630t200946z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2015-06-30T20:09:46Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-a044188d","guard":[["hasAny",["20210705t093317z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-07-05T09:33:17Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-a81c398b","guard":[["hasAny",["20191028t170859z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2019-10-28T17:08:59Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-a9108013","guard":[["hasAny",["20171125t112243z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2017-11-25T11:22:43Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-aa149529","guard":[["hasAny",["20210207t160632z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:06:32Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-b266b35b","guard":[["hasAny",["20210207t160244z","element","item number","nth","position"]],["has","whose"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:02:44Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-b9b78103","guard":[["hasAny",["20210113t110708z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-01-13T11:07:08Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-ba6ce510","guard":[["hasAny",["20160713t202800z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2016-07-13T20:28:00Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-c244d993","guard":[["hasAny",["20181115t082942z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2018-11-15T08:29:42Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-c53368a4","guard":[["hasAny",["20170116t144630z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2017-01-16T14:46:30Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-c7af3440","guard":[["hasAny",["20170411t095929z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2017-04-11T09:59:29Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-d0110b79","guard":[["hasAny",["20230418t162301z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-04-18T16:23:01Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-d0467fba","guard":[["hasAny",["20161127t230146z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2016-11-27T23:01:46Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-d3cf55b6","guard":[["hasAny",["20180612t082405z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2018-06-12T08:24:05Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-d8008ad3","guard":[["hasAny",["20230306t101418z","element","item number","nth","position"]],["has","added"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-03-06T10:14:18Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-da16ead9","guard":[["hasAny",["20230402t041118z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-04-02T04:11:18Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-daf2cac8","guard":[["hasAny",["20210510t172629z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-05-10T17:26:29Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-def044f8","guard":[["hasAny",["20201103t083626z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2020-11-03T08:36:26Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-e08c8b16","guard":[["hasAny",["20210207t160833z","element","item number","nth","position"]],["has","has"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:08:33Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-e42cebe5","guard":[["hasAny",["20230402t175036z","element","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-04-02T17:50:36Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-e8370800","guard":[["hasAny",["20230402t172903z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-04-02T17:29:03Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-ecfcfd90","guard":[["hasAny",["20210406t164605z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-04-06T16:46:05Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-ee6714b7","guard":[["hasAny",["20180222t194240z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2018-02-22T19:42:40Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-f0af4480","guard":[["hasAny",["20210207t160250z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:02:50Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-f73edefb","guard":[["hasAny",["20171126t174804z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2017-11-26T17:48:04Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-fa60fe8e","guard":[["hasAny",["20230317t230937z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2023-03-17T23:09:37Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-fbc2dd2d","guard":[["hasAny",["20151205t064756z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2015-12-05T06:47:56Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-fe2cc94c","guard":[["hasAny",["20210207t162030z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:20:30Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-ff7c171f","guard":[["hasAny",["20210207t160430z","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is 2021-02-07T16:04:30Z is ",{"slot":1},"."]},["sense.wordAt",{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-de5ab84c","guard":[["hasAny",["20160713t202800z","caesar cipher","element","item number","nth","position","rotate the letters","shift by","shift each letter"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose added is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.caesar",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],["sense.last"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"}],{"lit":1}],{"lit":"fr-tidytuesday-apisguru-apis-7d42db"},{"lit":"added"},{"lit":"name"}]],"mem":null},
{"id":"n-00e1d3cc","guard":[["hasAny",["20180302t122521z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2018-03-02T12:25:21Z is the added of which name":"The name whose added is 2018-03-02T12:25:21Z is apache.org:qakka."}}},
{"id":"n-011529ad","guard":[["hasAny",["20191223t113118z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2019-12-23T11:31:18Z":"The name whose added is 2019-12-23T11:31:18Z is fulfillment.com."}}},
{"id":"n-05af73c6","guard":[["hasAny",["20210207t161012z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-02-07T16:10:12Z":"The name whose added is 2021-02-07T16:10:12Z is apisetu.gov.in:hpayushboard."}}},
{"id":"n-0aef89dc","guard":[["hasAny",["20230304t152933z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2023-03-04T15:29:33Z":"The name whose added is 2023-03-04T15:29:33Z is alertersystem.com."}}},
{"id":"n-0e22ff1b","guard":[["hasAny",["20210207t162030z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-02-07T16:20:30Z":"The name whose added is 2021-02-07T16:20:30Z is apisetu.gov.in:swavlambancard."}}},
{"id":"n-0fb71567","guard":[["hasAny",["20181115t082942z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2018-11-15T08:29:42Z":"The name whose added is 2018-11-15T08:29:42Z is skynewz-api-fortnite.herokuapp.com."}}},
{"id":"n-1141071f","guard":[["hasAny",["20210207t160750z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-02-07T16:07:50Z":"The name whose added is 2021-02-07T16:07:50Z is apisetu.gov.in:edistrictodishasp."}}},
{"id":"n-11609ed1","guard":[["hasAny",["20210207t160550z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-02-07T16:05:50Z is the added of which name":"The name whose added is 2021-02-07T16:05:50Z is apisetu.gov.in:csc."}}},
{"id":"n-12db4bd1","guard":[["hasAny",["20210510t172629z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-05-10T17:26:29Z":"The name whose added is 2021-05-10T17:26:29Z is uscann.net."}}},
{"id":"n-13180c18","guard":[["hasAny",["20230418t162301z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2023-04-18T16:23:01Z":"The name whose added is 2023-04-18T16:23:01Z is codat.io:bank-feeds."}}},
{"id":"n-1934c147","guard":[["hasAny",["20200824t082247z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-08-24T08:22:47Z is the added of which name":"The name whose added is 2020-08-24T08:22:47Z is presalytics.io:converter."}}},
{"id":"n-1a3e3303","guard":[["hasAny",["20210406t164605z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-04-06T16:46:05Z":"The name whose added is 2021-04-06T16:46:05Z is va.gov:confirmation."}}},
{"id":"n-243cda56","guard":[["hasAny",["20171126t104907z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-11-26T10:49:07Z is the added of which name":"The name whose added is 2017-11-26T10:49:07Z is clever-cloud.com."}}},
{"id":"n-27f61bec","guard":[["hasAny",["20210207t161024z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-02-07T16:10:24Z is the added of which name":"The name whose added is 2021-02-07T16:10:24Z is apisetu.gov.in:hppanchayat."}}},
{"id":"n-2bdf5d82","guard":[["hasAny",["20151126t001900z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2015-11-26T00:19:00Z is the added of which name":"The name whose added is 2015-11-26T00:19:00Z is xkcd.com."}}},
{"id":"n-2cf93815","guard":[["hasAny",["20210207t161311z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-02-07T16:13:11Z":"The name whose added is 2021-02-07T16:13:11Z is apisetu.gov.in:ktech."}}},
{"id":"n-31be7d8b","guard":[["hasAny",["20181106t132829z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2018-11-06T13:28:29Z is the added of which name":"The name whose added is 2018-11-06T13:28:29Z is text2data.org."}}},
{"id":"n-3b02dc6f","guard":[["hasAny",["20160713t202800z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2016-07-13T20:28:00Z":"The name whose added is 2016-07-13T20:28:00Z is europeana.eu."}}},
{"id":"n-3b921dc4","guard":[["hasAny",["20230402t041118z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2023-04-02T04:11:18Z":"The name whose added is 2023-04-02T04:11:18Z is pinecone.io."}}},
{"id":"n-3beb81b5","guard":[["hasAny",["20170411t095929z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2017-04-11T09:59:29Z":"The name whose added is 2017-04-11T09:59:29Z is gitlab.com."}}},
{"id":"n-3d04b17f","guard":[["hasAny",["20180531t062858z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2018-05-31T06:28:58Z is the added of which name":"The name whose added is 2018-05-31T06:28:58Z is crossbrowsertesting.com."}}},
{"id":"n-421cfdf1","guard":[["hasAny",["20190713t112807z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2019-07-13T11:28:07Z":"The name whose added is 2019-07-13T11:28:07Z is ably.io:platform."}}},
{"id":"n-43c51a9e","guard":[["hasAny",["20210414t171240z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-04-14T17:12:40Z is the added of which name":"The name whose added is 2021-04-14T17:12:40Z is abstractapi.com:geolocation."}}},
{"id":"n-4675a482","guard":[["hasAny",["20151205t064756z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2015-12-05T06:47:56Z":"The name whose added is 2015-12-05T06:47:56Z is healthcare.gov."}}},
{"id":"n-4677616b","guard":[["hasAny",["20210207t160948z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-02-07T16:09:48Z is the added of which name":"The name whose added is 2021-02-07T16:09:48Z is apisetu.gov.in:goawrd."}}},
{"id":"n-47686ecc","guard":[["hasAny",["20191028t170859z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2019-10-28T17:08:59Z":"The name whose added is 2019-10-28T17:08:59Z is d7networks.com."}}},
{"id":"n-47f1eb56","guard":[["hasAny",["20190502t092545z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2019-05-02T09:25:45Z is the added of which name":"The name whose added is 2019-05-02T09:25:45Z is box.com."}}},
{"id":"n-48f28399","guard":[["hasAny",["20210207t160614z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-02-07T16:06:14Z is the added of which name":"The name whose added is 2021-02-07T16:06:14Z is apisetu.gov.in:dgft."}}},
{"id":"n-4a2f9a11","guard":[["hasAny",["20180612t082405z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2018-06-12T08:24:05Z":"The name whose added is 2018-06-12T08:24:05Z is fraudlabspro.com:fraud-detection."}}},
{"id":"n-4c2408c2","guard":[["hasAny",["20210210t082245z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-02-10T08:22:45Z":"The name whose added is 2021-02-10T08:22:45Z is onsched.com:utility."}}},
{"id":"n-4ffab902","guard":[["hasAny",["20151020t181011z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2015-10-20T18:10:11Z":"The name whose added is 2015-10-20T18:10:11Z is motaword.com."}}},
{"id":"n-50a62e21","guard":[["hasAny",["20210207t160812z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-02-07T16:08:12Z":"The name whose added is 2021-02-07T16:08:12Z is apisetu.gov.in:edistrictup."}}},
{"id":"n-52342d47","guard":[["hasAny",["20201103t083626z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2020-11-03T08:36:26Z":"The name whose added is 2020-11-03T08:36:26Z is medcorder.com."}}},
{"id":"n-537e077e","guard":[["hasAny",["20210709t141434z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-07-09T14:14:34Z is the added of which name":"The name whose added is 2021-07-09T14:14:34Z is optimade.local."}}},
{"id":"n-5b21a68f","guard":[["hasAny",["20200729t110931z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-07-29T11:09:31Z is the added of which name":"The name whose added is 2020-07-29T11:09:31Z is edrv.io."}}},
{"id":"n-5bd3d0f0","guard":[["hasAny",["20170413t092016z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2017-04-13T09:20:16Z":"The name whose added is 2017-04-13T09:20:16Z is neutrinoapi.net."}}},
{"id":"n-5ce54681","guard":[["hasAny",["20210207t160250z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-02-07T16:02:50Z":"The name whose added is 2021-02-07T16:02:50Z is apisetu.gov.in:agtripura."}}},
{"id":"n-5d4ac40c","guard":[["hasAny",["20210207t160308z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-02-07T16:03:08Z":"The name whose added is 2021-02-07T16:03:08Z is apisetu.gov.in:aiimspatna."}}},
{"id":"n-5f9ffe9c","guard":[["hasAny",["20170201t131829z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-02-01T13:18:29Z is the added of which name":"The name whose added is 2017-02-01T13:18:29Z is browshot.com."}}},
{"id":"n-61bc52b7","guard":[["hasAny",["20160406t005425z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2016-04-06T00:54:25Z":"The name whose added is 2016-04-06T00:54:25Z is bigoven.com."}}},
{"id":"n-62aed377","guard":[["hasAny",["20210416t155645z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-04-16T15:56:45Z is the added of which name":"The name whose added is 2021-04-16T15:56:45Z is 1password.local:connect."}}},
{"id":"n-6339e00c","guard":[["hasAny",["20210207t160430z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-02-07T16:04:30Z":"The name whose added is 2021-02-07T16:04:30Z is apisetu.gov.in:bsehr."}}},
{"id":"n-67f88e38","guard":[["hasAny",["20151127t021159z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2015-11-27T02:11:59Z is the added of which name":"The name whose added is 2015-11-27T02:11:59Z is bufferapp.com."}}},
{"id":"n-73c3a48d","guard":[["hasAny",["20210630t092542z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-06-30T09:25:42Z is the added of which name":"The name whose added is 2021-06-30T09:25:42Z is twilio.com:twilio_frontline_v1."}}},
{"id":"n-76b4ab6b","guard":[["hasAny",["20210130t172317z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-01-30T17:23:17Z is the added of which name":"The name whose added is 2021-01-30T17:23:17Z is randomlovecraft.com."}}},
{"id":"n-77b1426f","guard":[["hasAny",["20190103t070134z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2019-01-03T07:01:34Z":"The name whose added is 2019-01-03T07:01:34Z is adobe.com:aem."}}},
{"id":"n-7a42fa3e","guard":[["hasAny",["20180424t080010z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2018-04-24T08:00:10Z":"The name whose added is 2018-04-24T08:00:10Z is opendatanetwork.com."}}},
{"id":"n-7fa9afcd","guard":[["hasAny",["20200713t132644z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-07-13T13:26:44Z is the added of which name":"The name whose added is 2020-07-13T13:26:44Z is phantauth.net."}}},
{"id":"n-80496576","guard":[["hasAny",["20210614t125123z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-06-14T12:51:23Z is the added of which name":"The name whose added is 2021-06-14T12:51:23Z is cdcgov.local:prime-data-hub."}}},
{"id":"n-84d05fad","guard":[["hasAny",["20180310t171005z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2018-03-10T17:10:05Z":"The name whose added is 2018-03-10T17:10:05Z is anchore.io."}}},
{"id":"n-84de940d","guard":[["hasAny",["20230402t175036z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2023-04-02T17:50:36Z":"The name whose added is 2023-04-02T17:50:36Z is wolframalpha.com."}}},
{"id":"n-86fce913","guard":[["hasAny",["20210114t095308z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-01-14T09:53:08Z is the added of which name":"The name whose added is 2021-01-14T09:53:08Z is shop-pro.jp."}}},
{"id":"n-87cd2ae0","guard":[["hasAny",["20201214t105451z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2020-12-14T10:54:51Z":"The name whose added is 2020-12-14T10:54:51Z is fungenerators.com:namegen."}}},
{"id":"n-8a7cf7a2","guard":[["hasAny",["20200408t100559z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2020-04-08T10:05:59Z":"The name whose added is 2020-04-08T10:05:59Z is prss.org."}}},
{"id":"n-8dfdd60d","guard":[["hasAny",["20230317t230937z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2023-03-17T23:09:37Z":"The name whose added is 2023-03-17T23:09:37Z is googleapis.com:notebooks."}}},
{"id":"n-90a30b8a","guard":[["hasAny",["20230305t122021z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2023-03-05T12:20:21Z":"The name whose added is 2023-03-05T12:20:21Z is amadeus.com:amadeus-hotel-search."}}},
{"id":"n-92f8d26f","guard":[["hasAny",["20171126t174804z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2017-11-26T17:48:04Z":"The name whose added is 2017-11-26T17:48:04Z is aviationdata.systems."}}},
{"id":"n-9421e9ec","guard":[["hasAny",["20230402t171651z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2023-04-02T17:16:51Z":"The name whose added is 2023-04-02T17:16:51Z is klarna.com:openai."}}},
{"id":"n-9522f634","guard":[["hasAny",["20210207t160632z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-02-07T16:06:32Z":"The name whose added is 2021-02-07T16:06:32Z is apisetu.gov.in:ditch."}}},
{"id":"n-97c882c4","guard":[["hasAny",["20161127t230146z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2016-11-27T23:01:46Z":"The name whose added is 2016-11-27T23:01:46Z is squareup.com."}}},
{"id":"n-9bc4cec2","guard":[["hasAny",["20210207t160833z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-02-07T16:08:33Z":"The name whose added is 2021-02-07T16:08:33Z is apisetu.gov.in:enibandhanjh."}}},
{"id":"n-9df4144a","guard":[["hasAny",["20210727t134155z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-07-27T13:41:55Z":"The name whose added is 2021-07-27T13:41:55Z is fire.com."}}},
{"id":"n-9e977eb7","guard":[["hasAny",["20211103t231904z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-11-03T23:19:04Z":"The name whose added is 2021-11-03T23:19:04Z is apideck.com:connector."}}},
{"id":"n-9f4f94f1","guard":[["hasAny",["20210207t161147z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-02-07T16:11:47Z is the added of which name":"The name whose added is 2021-02-07T16:11:47Z is apisetu.gov.in:insvalsura."}}},
{"id":"n-a72a3004","guard":[["hasAny",["20210207t161652z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-02-07T16:16:52Z is the added of which name":"The name whose added is 2021-02-07T16:16:52Z is apisetu.gov.in:neilit."}}},
{"id":"n-a72fa2dd","guard":[["hasAny",["20230305t121710z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2023-03-05T12:17:10Z":"The name whose added is 2023-03-05T12:17:10Z is amadeus.com:amadeus-flight-check-in-links."}}},
{"id":"n-a7fd11b9","guard":[["hasAny",["20170418t110700z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2017-04-18T11:07:00Z":"The name whose added is 2017-04-18T11:07:00Z is mozilla.com:kinto."}}},
{"id":"n-ac9f1bcd","guard":[["hasAny",["20200323t134414z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-03-23T13:44:14Z is the added of which name":"The name whose added is 2020-03-23T13:44:14Z is logoraisr.com."}}},
{"id":"n-b0046619","guard":[["hasAny",["20160309t055834z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2016-03-09T05:58:34Z is the added of which name":"The name whose added is 2016-03-09T05:58:34Z is data2crm.com."}}},
{"id":"n-b1f3daed","guard":[["hasAny",["20210207t161229z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-02-07T16:12:29Z":"The name whose added is 2021-02-07T16:12:29Z is apisetu.gov.in:jnrmand."}}},
{"id":"n-b67970af","guard":[["hasAny",["20230402t172903z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2023-04-02T17:29:03Z":"The name whose added is 2023-04-02T17:29:03Z is biztoc.com."}}},
{"id":"n-bacfa977","guard":[["hasAny",["20230304t153032z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-03-04T15:30:32Z is the added of which name":"The name whose added is 2023-03-04T15:30:32Z is trakt.tv."}}},
{"id":"n-bb07f1c6","guard":[["hasAny",["20230325t180714z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-03-25T18:07:14Z is the added of which name":"The name whose added is 2023-03-25T18:07:14Z is klarna.com:payments."}}},
{"id":"n-bd909a49","guard":[["hasAny",["20210207t161305z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-02-07T16:13:05Z":"The name whose added is 2021-02-07T16:13:05Z is apisetu.gov.in:kseebkr."}}},
{"id":"n-c0428f6d","guard":[["hasAny",["20230304t153109z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2023-03-04T15:31:09Z":"The name whose added is 2023-03-04T15:31:09Z is gerermesaffaires.com."}}},
{"id":"n-c0a127bb","guard":[["hasAny",["20210207t162340z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-02-07T16:23:40Z":"The name whose added is 2021-02-07T16:23:40Z is apisetu.gov.in:transportpy."}}},
{"id":"n-c3a00cfa","guard":[["hasAny",["20150630t200946z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2015-06-30T20:09:46Z":"The name whose added is 2015-06-30T20:09:46Z is googleapis.com:classroom."}}},
{"id":"n-c6d7cbf0","guard":[["hasAny",["20200323t140654z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2020-03-23T14:06:54Z":"The name whose added is 2020-03-23T14:06:54Z is exude-api.herokuapp.com."}}},
{"id":"n-cc0e3bb2","guard":[["hasAny",["20171126t181014z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-11-26T18:10:14Z is the added of which name":"The name whose added is 2017-11-26T18:10:14Z is koomalooma.com."}}},
{"id":"n-cdd5f980","guard":[["hasAny",["20210712t144656z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-07-12T14:46:56Z":"The name whose added is 2021-07-12T14:46:56Z is rapidapi.com:dynamicdocs."}}},
{"id":"n-d29c6fa9","guard":[["hasAny",["20171125t112243z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2017-11-25T11:22:43Z":"The name whose added is 2017-11-25T11:22:43Z is weatherbit.io."}}},
{"id":"n-d6041bd8","guard":[["hasAny",["20210113t110708z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-01-13T11:07:08Z":"The name whose added is 2021-01-13T11:07:08Z is sakari.io."}}},
{"id":"n-e0c04b36","guard":[["hasAny",["20190226t105443z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2019-02-26T10:54:43Z":"The name whose added is 2019-02-26T10:54:43Z is here.com:tracking."}}},
{"id":"n-e1264c40","guard":[["hasAny",["20170116t144630z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2017-01-16T14:46:30Z":"The name whose added is 2017-01-16T14:46:30Z is appveyor.com."}}},
{"id":"n-e4014520","guard":[["hasAny",["20180222t194240z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2018-02-22T19:42:40Z":"The name whose added is 2018-02-22T19:42:40Z is spinitron.com."}}},
{"id":"n-e9451723","guard":[["hasAny",["20200323t135651z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2020-03-23T13:56:51Z":"The name whose added is 2020-03-23T13:56:51Z is tradematic.com."}}},
{"id":"n-e98c1583","guard":[["hasAny",["20210207t160244z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-02-07T16:02:44Z":"The name whose added is 2021-02-07T16:02:44Z is apisetu.gov.in:acko."}}},
{"id":"n-eae0abfe","guard":[["hasAny",["20171125t125021z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2017-11-25T12:50:21Z is the added of which name":"The name whose added is 2017-11-25T12:50:21Z is salesloft.com."}}},
{"id":"n-ec8f1a7b","guard":[["hasAny",["20210218t184425z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-02-18T18:44:25Z":"The name whose added is 2021-02-18T18:44:25Z is airbyte.local:config."}}},
{"id":"n-ed3d6ddb","guard":[["hasAny",["20210207t161241z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-02-07T16:12:41Z":"The name whose added is 2021-02-07T16:12:41Z is apisetu.gov.in:keralapsc."}}},
{"id":"n-efd08f4d","guard":[["hasAny",["20210207t161721z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-02-07T16:17:21Z":"The name whose added is 2021-02-07T16:17:21Z is apisetu.gov.in:nitp."}}},
{"id":"n-f279db0f","guard":[["hasAny",["20210207t161123z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2021-02-07T16:11:23Z":"The name whose added is 2021-02-07T16:11:23Z is apisetu.gov.in:icsi."}}},
{"id":"n-f292a07f","guard":[["hasAny",["20210922t230853z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-09-22T23:08:53Z":"The name whose added is 2021-09-22T23:08:53Z is googleapis.com:monitoring."}}},
{"id":"n-f5eaa5d7","guard":[["hasAny",["20210705t093317z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2021-07-05T09:33:17Z":"The name whose added is 2021-07-05T09:33:17Z is influxdata.com."}}},
{"id":"n-f6a9ff7e","guard":[["hasAny",["20151207t182702z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2015-12-07T18:27:02Z":"The name whose added is 2015-12-07T18:27:02Z is twilio.com:api."}}},
{"id":"n-fad159e0","guard":[["hasAny",["20230405t102936z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2023-04-05T10:29:36Z is the added of which name":"The name whose added is 2023-04-05T10:29:36Z is wellknown.ai."}}},
{"id":"n-fcfeced6","guard":[["hasAny",["20210228t164840z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2021-02-28T16:48:40Z is the added of which name":"The name whose added is 2021-02-28T16:48:40Z is botschaft.local."}}},
{"id":"n-fea1eb79","guard":[["hasAny",["20230306t101418z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose added is 2023-03-06T10:14:18Z":"The name whose added is 2023-03-06T10:14:18Z is docker.com:hub."}}},
{"id":"n-fecc0647","guard":[["hasAny",["20200819t063908z","added","has","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the added 2020-08-19T06:39:08Z":"The name whose added is 2020-08-19T06:39:08Z is hsbc.com:branches."}}},
{"id":"n-ff5b79fb","guard":[["hasAny",["20200427t101512z","added","name"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"2020-04-27T10:15:12Z is the added of which name":"The name whose added is 2020-04-27T10:15:12Z is wheretocredit.com."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which name has the added 2016-11-27T23:01:46Z","expect":{"contains":["squareup.com"],"notRefusal":true}},{"q":"name the name whose added is 2021-02-07T16:02:44Z","expect":{"contains":["apisetu.gov.in:acko"],"notRefusal":true}},{"q":"2021-02-07T16:05:50Z is the added of which name","expect":{"contains":["apisetu.gov.in:csc"],"notRefusal":true}},{"q":"which name has the added 2021-02-07T16:10:12Z","expect":{"contains":["apisetu.gov.in:hpayushboard"],"notRefusal":true}},{"q":"which name has the added 2021-02-07T16:08:12Z","expect":{"contains":["apisetu.gov.in:edistrictup"],"notRefusal":true}},{"q":"2016-03-09T05:58:34Z is the added of which name","expect":{"contains":["data2crm.com"],"notRefusal":true}},{"q":"name the name whose added is 2021-02-07T16:17:21Z","expect":{"contains":["apisetu.gov.in:nitp"],"notRefusal":true}},{"q":"2021-02-07T16:11:47Z is the added of which name","expect":{"contains":["apisetu.gov.in:insvalsura"],"notRefusal":true}},{"q":"name the name whose added is 2021-02-07T16:20:30Z","expect":{"contains":["apisetu.gov.in:swavlambancard"],"notRefusal":true}},{"q":"which name has the added 2021-02-10T08:22:45Z","expect":{"contains":["onsched.com:utility"],"notRefusal":true}},{"q":"which name has the added 2021-02-07T16:08:33Z","expect":{"contains":["apisetu.gov.in:enibandhanjh"],"notRefusal":true}},{"q":"name the name whose added is 2015-12-05T06:47:56Z","expect":{"contains":["healthcare.gov"],"notRefusal":true}},{"q":"name the name whose added is 2021-07-12T14:46:56Z","expect":{"contains":["rapidapi.com:dynamicdocs"],"notRefusal":true}},{"q":"which name has the added 2023-03-05T12:17:10Z","expect":{"contains":["amadeus.com:amadeus-flight-check-in-links"],"notRefusal":true}},{"q":"2021-02-28T16:48:40Z is the added of which name","expect":{"contains":["botschaft.local"],"notRefusal":true}},{"q":"which name has the added 2021-02-07T16:11:23Z","expect":{"contains":["apisetu.gov.in:icsi"],"notRefusal":true}},{"q":"2021-07-09T14:14:34Z is the added of which name","expect":{"contains":["optimade.local"],"notRefusal":true}},{"q":"which name has the added 2021-02-07T16:12:41Z","expect":{"contains":["apisetu.gov.in:keralapsc"],"notRefusal":true}},{"q":"which name has the added 2021-02-07T16:12:29Z","expect":{"contains":["apisetu.gov.in:jnrmand"],"notRefusal":true}},{"q":"name the name whose added is 2023-03-05T12:20:21Z","expect":{"contains":["amadeus.com:amadeus-hotel-search"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
